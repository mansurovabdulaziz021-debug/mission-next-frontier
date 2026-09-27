/**
 * ObservatoryHUD.js — Flagship Scientific Evidence Lab Interface
 * 
 * Provides the interactive scientific investigation user interface for Phase 7:
 *   - Observatory header with target telemetry & reticle status
 *   - 5 Scientific Investigation Cases with selection & completion tracking
 *   - Multi-wavelength band selector with physical explanations
 *   - Interactive Canvas Visualizers:
 *       1. Transit Light Curve & Photometry
 *       2. Fraunhofer Absorption Spectrum & Wien's Displacement Law
 *       3. S2 Orbit & Black Hole Mass Enclosure
 *       4. Cosmic Lookback Time Machine & Cosmic Clock
 *       5. DSN Two-Way Radio Ranging & Doppler Velocity
 *   - Step-by-step evidence investigation workbench
 *   - "You Figured It Out" Conclusion Synthesizer (Observed vs Inferred vs Modeled vs Uncertain)
 *   - Global "HOW DO WE KNOW?" modal and navigation bridge
 */

import { observatoryEngine } from '../observatory/ObservatoryEngine.js';
import { WAVELENGTH_BANDS, OBSERVATION_STATUS, getInvestigationCase } from '../observatory/observatoryData.js';
import { missionState } from '../state/MissionState.js';

export class ObservatoryHUD {
  constructor() {
    this.engine = observatoryEngine;
    this.isOpen = false;
    this.activeTab = 'workbench'; // 'workbench' | 'conclusion' | 'sources'
    this._animationFrame = null;

    // Interactive canvas states
    this.transitTimeOffset = 0; // -6 to +6 hours
    this.spectrumWavelength = 502; // nm
    this.s2Year = 2018.38; // 1994 to 2024
    this.lookbackIndex = 3; // default station
    this.dsnPingActive = false;
    this.dsnPingProgress = 0;

    this._initDOMElements();
    this._bindEngineEvents();
    this._bindUserEvents();
  }

  /* -----------------------------------------------------------------
     DOM Initialization
     ----------------------------------------------------------------- */
  _initDOMElements() {
    this.container = document.getElementById('mc-observatory-overlay');
    if (!this.container) {
      console.warn('[ObservatoryHUD] Target container #mc-observatory-overlay not found in DOM.');
      return;
    }

    // Top-level elements
    this.headerTargetName = document.getElementById('obs-target-name');
    this.headerTargetCoords = document.getElementById('obs-target-coords');
    this.headerInstrument = document.getElementById('obs-instrument-name');
    this.headerStatusBadge = document.getElementById('obs-status-badge');
    this.headerNotice = document.getElementById('obs-notice');

    // Case selection container
    this.caseTabsContainer = document.getElementById('obs-case-tabs');

    // Wavelength container
    this.wavelengthContainer = document.getElementById('obs-wavelength-selector');
    this.wavelengthNote = document.getElementById('obs-wavelength-note');

    // Step indicators
    this.stepIndicators = document.querySelectorAll('.obs__step-btn');

    // Canvas container
    this.canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('obs-interactive-canvas'));
    this.canvasCtx = this.canvas ? this.canvas.getContext('2d') : null;
    this.canvasControls = document.getElementById('obs-canvas-controls');

    // Evidence panels
    this.evidenceStepTag = document.getElementById('obs-evidence-step-tag');
    this.evidenceTitle = document.getElementById('obs-evidence-title');
    this.evidenceObsText = document.getElementById('obs-evidence-observation');
    this.evidenceDataGrid = document.getElementById('obs-evidence-data-grid');
    this.evidenceInterpText = document.getElementById('obs-evidence-interpretation');
    this.evidenceConfidence = document.getElementById('obs-evidence-confidence');
    this.evidenceSource = document.getElementById('obs-evidence-source');
    this.evidenceSourceLink = document.getElementById('obs-evidence-source-link');

    // Conclusion synthesizer elements
    this.conclusionPanel = document.getElementById('obs-conclusion-panel');
    this.workbenchPanel = document.getElementById('obs-workbench-panel');
    this.conclusionObserved = document.getElementById('obs-conclusion-observed');
    this.conclusionSuggests = document.getElementById('obs-conclusion-suggests');
    this.conclusionCanConclude = document.getElementById('obs-conclusion-can-conclude');
    this.conclusionUncertain = document.getElementById('obs-conclusion-uncertain');
    this.conclusionHumanity = document.getElementById('obs-conclusion-humanity');
    this.conclusionRelatedBtn = document.getElementById('obs-conclusion-related-btn');

    // Close button
    this.closeBtn = document.getElementById('obs-close-btn');

    // Build Case Tabs
    this._renderCaseTabs();
    this._renderWavelengthTabs();
  }

  /* -----------------------------------------------------------------
     Engine & State Event Subscriptions
     ----------------------------------------------------------------- */
  _bindEngineEvents() {
    this.engine.on('caseChanged', ({ case: c, step }) => {
      this._updateHeader(c);
      this._updateWavelengths(c);
      this._renderEvidenceStep(c, step);
      this._updateCaseTabsUI();
      this._setupInteractiveCanvas();
    });

    this.engine.on('stepChanged', ({ case: c, step, isComplete }) => {
      this._renderEvidenceStep(c, step);
      this._updateStepIndicators(step, isComplete);
      this._setupInteractiveCanvas();
    });

    this.engine.on('targetAcquired', (c) => {
      if (this.headerStatusBadge) {
        this.headerStatusBadge.textContent = 'TARGET LOCKED // SENSORS ONLINE';
        this.headerStatusBadge.className = 'obs__status-badge obs__status-badge--locked';
      }
    });

    this.engine.on('acquisitionStarted', (c) => {
      if (this.headerStatusBadge) {
        this.headerStatusBadge.textContent = 'ACQUIRING CELESTIAL TARGET…';
        this.headerStatusBadge.className = 'obs__status-badge obs__status-badge--acquiring';
      }
    });

    this.engine.on('showConclusion', (c) => {
      this.showConclusionView(c);
    });

    this.engine.on('wavelengthChanged', ({ bandId, note }) => {
      this._updateActiveWavelengthTab(bandId);
      if (this.wavelengthNote) {
        this.wavelengthNote.textContent = note;
      }
      this._redrawCanvas();
    });
  }

  /* -----------------------------------------------------------------
     User Interaction Event Listeners
     ----------------------------------------------------------------- */
  _bindUserEvents() {
    // Close button
    this.closeBtn?.addEventListener('click', () => this.hide());

    // Step navigation buttons
    document.getElementById('obs-prev-step-btn')?.addEventListener('click', () => {
      this.engine.prevStep();
    });

    document.getElementById('obs-next-step-btn')?.addEventListener('click', () => {
      this.engine.nextStep();
    });

    // Step indicator clicks
    this.stepIndicators?.forEach(btn => {
      btn.addEventListener('click', () => {
        const stepNum = parseInt(btn.dataset.step || '1', 10);
        this.engine.selectStep(stepNum);
      });
    });

    // Conclusion tabs & Return to workbench
    document.getElementById('obs-back-to-evidence-btn')?.addEventListener('click', () => {
      this.showWorkbenchView();
    });

    // Related discovery trigger
    this.conclusionRelatedBtn?.addEventListener('click', () => {
      const discId = this.engine.activeCase.relatedDiscoveryId;
      this.hide();
      if (discId) {
        // Open discovery drawer or beacon
        missionState.emit('openDiscovery', discId);
      }
    });

    // Window resize -> resize canvas
    window.addEventListener('resize', () => {
      if (this.isOpen) {
        this._resizeCanvas();
        this._redrawCanvas();
      }
    });

    // Global "HOW DO WE KNOW?" button delegation
    document.addEventListener('click', (e) => {
      const btn = /** @type {HTMLElement} */ (e.target).closest('[data-how-do-we-know]');
      if (btn) {
        const targetCaseId = btn.getAttribute('data-how-do-we-know');
        this.show(targetCaseId);
      }
    });

    // Header toggle button
    document.getElementById('mc-observatory-toggle')?.addEventListener('click', () => {
      if (this.isOpen) {
        this.hide();
      } else {
        this.show();
      }
    });
  }

  /* -----------------------------------------------------------------
     Rendering Case Tabs & Wavelengths
     ----------------------------------------------------------------- */
  _renderCaseTabs() {
    if (!this.caseTabsContainer) return;
    this.caseTabsContainer.innerHTML = '';

    this.engine.cases.forEach((c) => {
      const isCompleted = this.engine.completedCases.has(c.id);
      const isActive = c.id === this.engine.activeCase.id;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `obs__case-tab ${isActive ? 'obs__case-tab--active' : ''} ${isCompleted ? 'obs__case-tab--completed' : ''}`;
      btn.setAttribute('data-case-id', c.id);
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');

      btn.innerHTML = `
        <div class="obs__case-tab-header">
          <span class="obs__case-number">CASE ${c.caseNumber}</span>
          ${isCompleted ? '<span class="obs__case-check">RESOLVED ✓</span>' : '<span class="obs__case-status">READY</span>'}
        </div>
        <div class="obs__case-tab-title">${c.title}</div>
      `;

      btn.addEventListener('click', () => {
        this.engine.selectCase(c.id);
      });

      this.caseTabsContainer.appendChild(btn);
    });
  }

  _updateCaseTabsUI() {
    if (!this.caseTabsContainer) return;
    const tabs = this.caseTabsContainer.querySelectorAll('.obs__case-tab');
    tabs.forEach(tab => {
      const cid = tab.getAttribute('data-case-id');
      const isActive = (cid === this.engine.activeCase.id);
      const isCompleted = this.engine.completedCases.has(cid);

      tab.classList.toggle('obs__case-tab--active', isActive);
      tab.classList.toggle('obs__case-tab--completed', isCompleted);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');

      const statusSpan = tab.querySelector('.obs__case-status, .obs__case-check');
      if (statusSpan) {
        if (isCompleted) {
          statusSpan.className = 'obs__case-check';
          statusSpan.textContent = 'RESOLVED ✓';
        } else {
          statusSpan.className = 'obs__case-status';
          statusSpan.textContent = 'READY';
        }
      }
    });
  }

  _renderWavelengthTabs() {
    if (!this.wavelengthContainer) return;
    this.wavelengthContainer.innerHTML = '';

    Object.keys(WAVELENGTH_BANDS).forEach(key => {
      const band = WAVELENGTH_BANDS[key];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `obs__wave-tab ${band.id === this.engine.activeWavelength ? 'obs__wave-tab--active' : ''}`;
      btn.setAttribute('data-band-id', band.id);
      btn.innerHTML = `
        <span class="obs__wave-dot" style="background-color: ${band.color}"></span>
        <span class="obs__wave-name">${band.name}</span>
      `;

      btn.addEventListener('click', () => {
        const ok = this.engine.setWavelength(band.id);
        if (!ok) {
          btn.classList.add('obs__wave-tab--disabled-shake');
          setTimeout(() => btn.classList.remove('obs__wave-tab--disabled-shake'), 400);
        }
      });

      this.wavelengthContainer.appendChild(btn);
    });
  }

  _updateWavelengths(activeCase) {
    if (!this.wavelengthContainer) return;
    const tabs = this.wavelengthContainer.querySelectorAll('.obs__wave-tab');
    tabs.forEach(tab => {
      const bandId = tab.getAttribute('data-band-id');
      const isAvailable = activeCase.availableWavelengths.includes(bandId);
      const isActive = (bandId === this.engine.activeWavelength);

      tab.classList.toggle('obs__wave-tab--active', isActive);
      tab.classList.toggle('obs__wave-tab--disabled', !isAvailable);
      tab.setAttribute('aria-disabled', !isAvailable ? 'true' : 'false');
    });

    if (this.wavelengthNote) {
      this.wavelengthNote.textContent = activeCase.wavelengthNotes[this.engine.activeWavelength] ||
        'Band reveals specific physical mechanism.';
    }
  }

  _updateActiveWavelengthTab(bandId) {
    if (!this.wavelengthContainer) return;
    const tabs = this.wavelengthContainer.querySelectorAll('.obs__wave-tab');
    tabs.forEach(tab => {
      const bid = tab.getAttribute('data-band-id');
      tab.classList.toggle('obs__wave-tab--active', bid === bandId);
    });
  }

  /* -----------------------------------------------------------------
     Header & Evidence Presentation
     ----------------------------------------------------------------- */
  _updateHeader(c) {
    if (this.headerTargetName) {
      this.headerTargetName.textContent = c.target.name;
    }
    if (this.headerTargetCoords) {
      this.headerTargetCoords.textContent = `${c.target.coordinates} // DIST: ${c.target.distance}`;
    }
    if (this.headerInstrument) {
      this.headerInstrument.textContent = `${c.mission.name} // ${c.mission.instrument}`;
    }
    if (this.headerNotice) {
      this.headerNotice.textContent = c.educationalNotice || 'EDUCATIONAL SCIENTIFIC VISUALIZATION';
    }
  }

  _renderEvidenceStep(c, stepNumber) {
    const evidenceItem = c.evidence[stepNumber - 1];
    if (!evidenceItem) return;

    if (this.evidenceStepTag) {
      this.evidenceStepTag.textContent = `EVIDENCE STEP 0${stepNumber} OF 0${c.evidence.length} // TYPE: ${evidenceItem.type.toUpperCase()}`;
    }
    if (this.evidenceTitle) {
      this.evidenceTitle.textContent = evidenceItem.title;
    }
    if (this.evidenceObsText) {
      this.evidenceObsText.textContent = evidenceItem.observation;
    }

    // Build data parameter grid
    if (this.evidenceDataGrid) {
      this.evidenceDataGrid.innerHTML = '';
      Object.entries(evidenceItem.data).forEach(([key, val]) => {
        const item = document.createElement('div');
        item.className = 'obs__data-metric';
        const formattedKey = key.replace(/([A-Z])/g, ' $1').toUpperCase();
        item.innerHTML = `
          <div class="obs__metric-key">${formattedKey}</div>
          <div class="obs__metric-val">${val}</div>
        `;
        this.evidenceDataGrid.appendChild(item);
      });
    }

    if (this.evidenceInterpText) {
      this.evidenceInterpText.textContent = evidenceItem.interpretation;
    }
    if (this.evidenceConfidence) {
      this.evidenceConfidence.textContent = evidenceItem.confidenceContext;
    }
    if (this.evidenceSource) {
      this.evidenceSource.textContent = evidenceItem.source;
    }
    if (this.evidenceSourceLink) {
      this.evidenceSourceLink.href = evidenceItem.sourceUrl || '#';
    }

    this._updateStepIndicators(stepNumber, this.engine.isCaseComplete(c.id));
  }

  _updateStepIndicators(activeStep, isComplete) {
    this.stepIndicators?.forEach(btn => {
      const step = parseInt(btn.dataset.step || '1', 10);
      btn.classList.toggle('obs__step-btn--active', step === activeStep);
      btn.classList.toggle('obs__step-btn--inspected', this.engine.inspectedEvidence[this.engine.activeCase.id]?.has(step));
    });

    const finishBtn = document.getElementById('obs-next-step-btn');
    if (finishBtn) {
      if (activeStep >= this.engine.activeCase.evidence.length) {
        finishBtn.innerHTML = `<span>SYNTHESIZE CONCLUSION →</span>`;
        finishBtn.classList.add('obs__nav-btn--highlight');
      } else {
        finishBtn.innerHTML = `<span>NEXT EVIDENCE →</span>`;
        finishBtn.classList.remove('obs__nav-btn--highlight');
      }
    }
  }

  /* -----------------------------------------------------------------
     Interactive Canvas Data Visualizers
     ----------------------------------------------------------------- */
  _setupInteractiveCanvas() {
    this._resizeCanvas();
    this._buildCanvasControls();
    this._redrawCanvas();
  }

  _resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    if (rect && rect.width > 0 && rect.height > 0) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.canvas.style.width = `${rect.width}px`;
      this.canvas.style.height = `${rect.height}px`;
      this.canvasCtx?.scale(dpr, dpr);
    }
  }

  _buildCanvasControls() {
    if (!this.canvasControls) return;
    this.canvasControls.innerHTML = '';

    const caseId = this.engine.activeCase.id;

    if (caseId === 'CASE_01_EXOPLANET') {
      // Transit Photometry controls
      const wrapper = document.createElement('div');
      wrapper.className = 'obs__ctrl-row';
      wrapper.innerHTML = `
        <label class="obs__ctrl-label">TRANSIT PHASE SCRUBBER: <span id="obs-transit-val">${this.transitTimeOffset.toFixed(2)}h</span></label>
        <input type="range" id="obs-transit-slider" min="-6" max="6" step="0.1" value="${this.transitTimeOffset}" class="obs__slider">
        <span class="obs__ctrl-tip">DRAG TO OBSERVE PLANET OCCULTING STAR DISK IN REAL-TIME</span>
      `;
      wrapper.querySelector('#obs-transit-slider')?.addEventListener('input', (e) => {
        this.transitTimeOffset = parseFloat(/** @type {HTMLInputElement} */ (e.target).value);
        const valSpan = wrapper.querySelector('#obs-transit-val');
        if (valSpan) valSpan.textContent = `${this.transitTimeOffset.toFixed(2)}h`;
        this._redrawCanvas();
      });
      this.canvasControls.appendChild(wrapper);

    } else if (caseId === 'CASE_02_STELLAR_SPECTRUM') {
      // Spectrum wavelength probe controls
      const wrapper = document.createElement('div');
      wrapper.className = 'obs__ctrl-row';
      wrapper.innerHTML = `
        <label class="obs__ctrl-label">WAVELENGTH PROBE: <span id="obs-spectrum-val">${this.spectrumWavelength.toFixed(1)} nm</span></label>
        <input type="range" id="obs-spectrum-slider" min="380" max="750" step="0.5" value="${this.spectrumWavelength}" class="obs__slider">
        <span class="obs__ctrl-tip">ALIGN WITH DARK LINES TO IDENTIFY CHEMICAL ELEMENTS</span>
      `;
      wrapper.querySelector('#obs-spectrum-slider')?.addEventListener('input', (e) => {
        this.spectrumWavelength = parseFloat(/** @type {HTMLInputElement} */ (e.target).value);
        const valSpan = wrapper.querySelector('#obs-spectrum-val');
        if (valSpan) valSpan.textContent = `${this.spectrumWavelength.toFixed(1)} nm`;
        this._redrawCanvas();
      });
      this.canvasControls.appendChild(wrapper);

    } else if (caseId === 'CASE_03_BLACK_HOLE') {
      // S2 Orbit epoch slider
      const wrapper = document.createElement('div');
      wrapper.className = 'obs__ctrl-row';
      wrapper.innerHTML = `
        <label class="obs__ctrl-label">OBSERVATION EPOCH (YEAR): <span id="obs-s2-val">${this.s2Year.toFixed(2)}</span></label>
        <input type="range" id="obs-s2-slider" min="1994" max="2024" step="0.25" value="${this.s2Year}" class="obs__slider">
        <span class="obs__ctrl-tip">PERIASTRON IN MAY 2018 AT 7,700 KM/S (17 LIGHT-HOURS FROM SINGULARITY)</span>
      `;
      wrapper.querySelector('#obs-s2-slider')?.addEventListener('input', (e) => {
        this.s2Year = parseFloat(/** @type {HTMLInputElement} */ (e.target).value);
        const valSpan = wrapper.querySelector('#obs-s2-val');
        if (valSpan) valSpan.textContent = `${this.s2Year.toFixed(2)}`;
        this._redrawCanvas();
      });
      this.canvasControls.appendChild(wrapper);

    } else if (caseId === 'CASE_04_LOOKBACK_TIME') {
      // Lookback distance machine slider
      const stations = [
        'MOON (1.28 s)', 'SUN (8.32 m)', 'MARS (12.5 m)', 'VOYAGER 1 (22.8 h)',
        'PROXIMA CENTAURI (4.24 yr)', 'BETELGEUSE (650 yr)', 'SAGITTARIUS A* (26,000 yr)',
        'ANDROMEDA M31 (2.54M yr)', 'JWST JADES-GS-z14-0 (13.4B yr)'
      ];
      const wrapper = document.createElement('div');
      wrapper.className = 'obs__ctrl-row';
      wrapper.innerHTML = `
        <label class="obs__ctrl-label">LOOKBACK TIME TARGET: <span id="obs-lookback-val">${stations[this.lookbackIndex]}</span></label>
        <input type="range" id="obs-lookback-slider" min="0" max="${stations.length - 1}" step="1" value="${this.lookbackIndex}" class="obs__slider">
        <span class="obs__ctrl-tip">OBSERVE HOW ASTRONOMICAL DISTANCE EQUALS COSMIC LOOKBACK TIME</span>
      `;
      wrapper.querySelector('#obs-lookback-slider')?.addEventListener('input', (e) => {
        this.lookbackIndex = parseInt(/** @type {HTMLInputElement} */ (e.target).value, 10);
        const valSpan = wrapper.querySelector('#obs-lookback-val');
        if (valSpan) valSpan.textContent = stations[this.lookbackIndex];
        this._redrawCanvas();
      });
      this.canvasControls.appendChild(wrapper);

    } else if (caseId === 'CASE_05_NAVIGATION') {
      // DSN Ping button & ranging
      const wrapper = document.createElement('div');
      wrapper.className = 'obs__ctrl-row obs__ctrl-row--flex';
      wrapper.innerHTML = `
        <button type="button" id="obs-dsn-ping-btn" class="obs__action-btn">
          <span>📡 TRANSMIT 2-WAY DSN MICROWAVE PING</span>
        </button>
        <span id="obs-dsn-ping-status" class="obs__ctrl-tip">ATOMIC CLOCK ACCURACY: 1 PART IN 10¹⁵</span>
      `;
      wrapper.querySelector('#obs-dsn-ping-btn')?.addEventListener('click', () => {
        this._triggerDsnPing();
      });
      this.canvasControls.appendChild(wrapper);
    }
  }

  _triggerDsnPing() {
    this.dsnPingActive = true;
    this.dsnPingProgress = 0;
    const statusSpan = document.getElementById('obs-dsn-ping-status');
    if (statusSpan) statusSpan.textContent = 'TRANSMITTING 8.4 GHz CARRIER CODE…';

    const interval = setInterval(() => {
      this.dsnPingProgress += 0.05;
      this._redrawCanvas();

      if (this.dsnPingProgress >= 1.0) {
        clearInterval(interval);
        this.dsnPingActive = false;
        if (statusSpan) {
          statusSpan.textContent = 'ECHO RECEIVED // RANGE RESOLVED: 225,402,118.42 M (±0.85 M)';
        }
      }
    }, 40);
  }

  _redrawCanvas() {
    if (!this.canvasCtx || !this.canvas) return;
    const ctx = this.canvasCtx;
    const w = parseFloat(this.canvas.style.width) || 600;
    const h = parseFloat(this.canvas.style.height) || 300;

    ctx.clearRect(0, 0, w, h);

    // Common background grid
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(74, 158, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const caseId = this.engine.activeCase.id;

    if (caseId === 'CASE_01_EXOPLANET') {
      this._drawTransitCanvas(ctx, w, h);
    } else if (caseId === 'CASE_02_STELLAR_SPECTRUM') {
      this._drawSpectrumCanvas(ctx, w, h);
    } else if (caseId === 'CASE_03_BLACK_HOLE') {
      this._drawBlackHoleCanvas(ctx, w, h);
    } else if (caseId === 'CASE_04_LOOKBACK_TIME') {
      this._drawLookbackCanvas(ctx, w, h);
    } else if (caseId === 'CASE_05_NAVIGATION') {
      this._drawNavigationCanvas(ctx, w, h);
    }
  }

  /* -----------------------------------------------------------------
     1. Transit Light Curve Drawing
     ----------------------------------------------------------------- */
  _drawTransitCanvas(ctx, w, h) {
    const padL = 60;
    const padR = 30;
    const padT = 40;
    const padB = 40;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // Draw Axes
    ctx.strokeStyle = 'rgba(74, 158, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#8899b3';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('1.0000', 10, padT + 10);
    ctx.fillText('0.9996', 10, padT + plotH * 0.5);
    ctx.fillText('0.9960', 10, padT + plotH);
    ctx.fillText('-6h', padL, padT + plotH + 20);
    ctx.fillText('0h (MID-TRANSIT)', padL + plotW * 0.5 - 40, padT + plotH + 20);
    ctx.fillText('+6h', padL + plotW - 20, padT + plotH + 20);

    // Title / Legend
    ctx.fillStyle = '#e8ecf2';
    ctx.font = '11px "Inter", sans-serif';
    ctx.fillText('KEPLER HIGH-PRECISION PHOTOMETRIC LIGHT CURVE // KEPLER-186', padL, 22);

    // Plot Theoretical Limb-Darkened U-Curve
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    for (let x = 0; x <= plotW; x += 2) {
      const t = -6 + (x / plotW) * 12; // -6 to +6 hours
      let flux = 1.0;
      // Transit duration is ~4.5h, dip is 0.04%
      if (Math.abs(t) < 2.25) {
        const u = Math.abs(t) / 2.25;
        // Smooth limb-darkening ingress/egress
        const dip = 0.04 * (1 - Math.pow(u, 4));
        flux -= dip * 0.01;
      }
      const y = padT + (1.0 - flux) / 0.0006 * plotH;
      if (x === 0) ctx.moveTo(padL + x, y);
      else ctx.lineTo(padL + x, y);
    }
    ctx.stroke();

    // Scatter observational CCD data points with noise
    ctx.fillStyle = 'rgba(74, 158, 255, 0.4)';
    for (let t = -5.8; t <= 5.8; t += 0.25) {
      let flux = 1.0;
      if (Math.abs(t) < 2.25) {
        const u = Math.abs(t) / 2.25;
        flux -= (0.04 * (1 - Math.pow(u, 4))) * 0.01;
      }
      // Add pseudo-noise
      const noise = (Math.sin(t * 19.3) * 0.00008) + (Math.cos(t * 31.7) * 0.00005);
      const measuredFlux = flux + noise;
      const x = padL + ((t + 6) / 12) * plotW;
      const y = padT + (1.0 - measuredFlux) / 0.0006 * plotH;
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Active scrubber line
    const scrubX = padL + ((this.transitTimeOffset + 6) / 12) * plotW;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(scrubX, padT);
    ctx.lineTo(scrubX, padT + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Mini star occultation preview in top right
    const starPreviewX = padL + plotW - 70;
    const starPreviewY = padT + 45;
    ctx.fillStyle = '#ff7b42';
    ctx.beginPath();
    ctx.arc(starPreviewX, starPreviewY, 28, 0, Math.PI * 2);
    ctx.fill();

    // Planet occulting position
    const planetX = starPreviewX + (this.transitTimeOffset / 2.25) * 36;
    if (Math.abs(this.transitTimeOffset) < 3.2) {
      ctx.fillStyle = '#0a0e17';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(planetX, starPreviewY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  /* -----------------------------------------------------------------
     2. Fraunhofer Absorption Spectrum Drawing
     ----------------------------------------------------------------- */
  _drawSpectrumCanvas(ctx, w, h) {
    const padL = 40;
    const padR = 40;
    const padT = 50;
    const spectrumH = 55;
    const specW = w - padL - padR;

    // Header
    ctx.fillStyle = '#e8ecf2';
    ctx.font = '11px "Inter", sans-serif';
    ctx.fillText('SOLAR & STELLAR OPTICAL ABSORPTION SPECTRUM (380 – 750 NM)', padL, 26);

    // Continuous rainbow gradient
    const grad = ctx.createLinearGradient(padL, 0, padL + specW, 0);
    grad.addColorStop(0.00, '#4c1d95'); // Violet (380 nm)
    grad.addColorStop(0.12, '#2563eb'); // Blue (440 nm)
    grad.addColorStop(0.28, '#06b6d4'); // Cyan (500 nm)
    grad.addColorStop(0.45, '#10b981'); // Green (550 nm)
    grad.addColorStop(0.65, '#f59e0b'); // Yellow-Orange (600 nm)
    grad.addColorStop(0.85, '#ef4444'); // Red (680 nm)
    grad.addColorStop(1.00, '#831843'); // Far Red (750 nm)

    ctx.fillStyle = grad;
    ctx.fillRect(padL, padT, specW, spectrumH);

    // Prominent Fraunhofer dark lines
    const lines = [
      { nm: 393.4, name: 'Ca II (K)', width: 3.0 },
      { nm: 396.8, name: 'Ca II (H)', width: 2.8 },
      { nm: 410.2, name: 'H-δ', width: 2.0 },
      { nm: 434.0, name: 'H-γ', width: 2.4 },
      { nm: 486.1, name: 'H-β (486 nm)', width: 2.8 },
      { nm: 517.3, name: 'Mg I', width: 2.2 },
      { nm: 527.0, name: 'Fe I', width: 1.8 },
      { nm: 589.0, name: 'Na I (D2)', width: 2.5 },
      { nm: 589.6, name: 'Na I (D1)', width: 2.5 },
      { nm: 656.3, name: 'H-α (656 nm)', width: 3.5 }
    ];

    lines.forEach(l => {
      const frac = (l.nm - 380) / (750 - 380);
      const x = padL + frac * specW;

      // Dark absorption bar
      ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
      ctx.fillRect(x - l.width / 2, padT, l.width, spectrumH);

      // Label below
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(l.name, x - 12, padT + spectrumH + 16);

      // Tick mark
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.moveTo(x, padT + spectrumH);
      ctx.lineTo(x, padT + spectrumH + 5);
      ctx.stroke();
    });

    // Interactive probe marker
    const probeFrac = (this.spectrumWavelength - 380) / (750 - 380);
    const probeX = padL + probeFrac * specW;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(probeX, padT - 8);
    ctx.lineTo(probeX, padT + spectrumH + 8);
    ctx.stroke();

    // Probe readout box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.fillRect(probeX - 45, padT + spectrumH + 35, 90, 26);
    ctx.strokeRect(probeX - 45, padT + spectrumH + 35, 90, 26);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.spectrumWavelength.toFixed(1)} nm`, probeX, padT + spectrumH + 52);
    ctx.textAlign = 'left';
  }

  /* -----------------------------------------------------------------
     3. S2 Black Hole Orbit Drawing
     ----------------------------------------------------------------- */
  _drawBlackHoleCanvas(ctx, w, h) {
    const cx = w * 0.42;
    const cy = h * 0.52;
    const scale = 58; // pixels per arcsecond

    // Title
    ctx.fillStyle = '#e8ecf2';
    ctx.font = '11px "Inter", sans-serif';
    ctx.fillText('SAGITTARIUS A* GALACTIC CENTER STELLAR ORBIT S2 (1994 – 2024)', 30, 24);

    // Central Black Hole marker
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();

    // Event Horizon accretion ring
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#f97316';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('SGR A* (4.15M M☉)', cx + 16, cy + 4);

    // S2 Orbit Ellipse parameters
    const a = 2.4 * scale;
    const e = 0.884;
    const b = a * Math.sqrt(1 - e * e);
    const c = a * e;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(0.35); // orbital inclination tilt

    // Draw full ellipse orbit path
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(-c, 0, a, b, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Calculate S2 position for the active year
    // Periastron in 2018.38, period = 16.05 years
    const meanAnomaly = ((this.s2Year - 2018.38) / 16.0518) * Math.PI * 2;
    // Approximate eccentric anomaly
    const E = meanAnomaly + e * Math.sin(meanAnomaly);
    const starX = a * (Math.cos(E) - e);
    const starY = b * Math.sin(E);

    // Velocity approximation: v = sqrt(G*M * (2/r - 1/a))
    const r = Math.sqrt(starX * starX + starY * starY);
    const rAU = (r / scale) * 80;
    const velKmS = Math.min(7700, Math.round(7700 * (17 / Math.max(17, rAU))));

    // Draw star S2
    ctx.fillStyle = '#93c5fd';
    ctx.beginPath();
    ctx.arc(starX, starY, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Real-time telemetry readout in bottom right
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.fillRect(w - 220, h - 85, 200, 70);
    ctx.strokeRect(w - 220, h - 85, 200, 70);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText(`EPOCH: ${this.s2Year.toFixed(2)}`, w - 210, h - 68);
    ctx.fillText(`VELOCITY: ${velKmS.toLocaleString()} KM/S`, w - 210, h - 52);
    ctx.fillText(`DISTANCE: ${rAU.toFixed(1)} AU`, w - 210, h - 36);
    ctx.fillText(`MASS ENCLOSED: 4.15 × 10⁶ M☉`, w - 210, h - 20);
  }

  /* -----------------------------------------------------------------
     4. Cosmic Lookback Timeline Drawing
     ----------------------------------------------------------------- */
  _drawLookbackCanvas(ctx, w, h) {
    const padL = 40;
    const padR = 40;
    const padY = h * 0.45;
    const lineW = w - padL - padR;

    ctx.fillStyle = '#e8ecf2';
    ctx.font = '11px "Inter", sans-serif';
    ctx.fillText('COSMIC LOOKBACK HORIZON // DISTANCE EQUALS TIME IN THE PAST', padL, 24);

    // Logarithmic timeline axis
    ctx.strokeStyle = 'rgba(74, 158, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padL, padY);
    ctx.lineTo(padL + lineW, padY);
    ctx.stroke();

    const stations = [
      { name: 'Moon', time: '1.28 s', dist: '384,400 km', historical: 'Apollo 11 footprint' },
      { name: 'Sun', time: '8.32 m', dist: '149.6M km (1 AU)', historical: 'Solar flare transit' },
      { name: 'Mars', time: '12.5 m', dist: '225M km', historical: 'Rover telemetry delay' },
      { name: 'Voyager 1', time: '22.8 h', dist: '24.7B km', historical: 'Interstellar boundary' },
      { name: 'Proxima', time: '4.24 yr', dist: '40T km', historical: 'Closest stellar neighbor' },
      { name: 'Betelgeuse', time: '650 yr', dist: '650 ly', historical: 'European Renaissance' },
      { name: 'Sgr A*', time: '26,000 yr', dist: '26,000 ly', historical: 'Last Glacial Maximum' },
      { name: 'Andromeda', time: '2.54M yr', dist: '2.54M ly', historical: 'Dawn of Homo habilis' },
      { name: 'JADES-z14', time: '13.4B yr', dist: 'z = 14.32', historical: '290M yr after Big Bang' }
    ];

    stations.forEach((st, i) => {
      const x = padL + (i / (stations.length - 1)) * lineW;
      const isSelected = (i === this.lookbackIndex);

      // Station node
      ctx.fillStyle = isSelected ? '#f59e0b' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(x, padY, isSelected ? 6.5 : 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Station label
      ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
      ctx.font = isSelected ? 'bold 10px "JetBrains Mono", monospace' : '9px "JetBrains Mono", monospace';
      ctx.fillText(st.name, x - 15, padY - 14);
      ctx.fillText(st.time, x - 15, padY + 22);
    });

    // Detail card for active station
    const active = stations[this.lookbackIndex];
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.fillRect(padL, h - 75, lineW, 58);
    ctx.strokeRect(padL, h - 75, lineW, 58);

    ctx.fillStyle = '#f59e0b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText(`TARGET: ${active.name.toUpperCase()} // LOOKBACK DELAY: ${active.time.toUpperCase()}`, padL + 15, h - 55);

    ctx.fillStyle = '#e8ecf2';
    ctx.font = '11px "Inter", sans-serif';
    ctx.fillText(`DISTANCE: ${active.dist} | HISTORICAL ERA WHEN LIGHT LEFT: ${active.historical}`, padL + 15, h - 35);
  }

  /* -----------------------------------------------------------------
     5. DSN Navigation Ping Drawing
     ----------------------------------------------------------------- */
  _drawNavigationCanvas(ctx, w, h) {
    const padL = 60;
    const padR = 60;
    const cy = h * 0.48;

    ctx.fillStyle = '#e8ecf2';
    ctx.font = '11px "Inter", sans-serif';
    ctx.fillText('DEEP SPACE NETWORK 2-WAY COHERENT MICROWAVE RANGING', padL, 24);

    // Earth Station
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(padL, cy, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8ecf2';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('DSN 70M DISH', padL - 32, cy + 30);
    ctx.fillText('(EARTH)', padL - 18, cy + 42);

    // Spacecraft
    const scX = w - padR;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(scX, cy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8ecf2';
    ctx.fillText('SPACECRAFT', scX - 25, cy + 30);
    ctx.fillText('(PERSEVERANCE)', scX - 35, cy + 42);

    // Baseline carrier track
    ctx.strokeStyle = 'rgba(74, 158, 255, 0.25)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padL + 16, cy);
    ctx.lineTo(scX - 12, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Animated microwave pulse
    if (this.dsnPingActive) {
      let pulseX;
      let forward = (this.dsnPingProgress < 0.5);
      if (forward) {
        pulseX = padL + (this.dsnPingProgress / 0.5) * (scX - padL);
      } else {
        pulseX = scX - ((this.dsnPingProgress - 0.5) / 0.5) * (scX - padL);
      }

      ctx.fillStyle = forward ? '#38bdf8' : '#34d399';
      ctx.beginPath();
      ctx.arc(pulseX, cy, 7, 0, Math.PI * 2);
      ctx.fill();

      // Ripple rings
      ctx.strokeStyle = forward ? 'rgba(56, 189, 248, 0.4)' : 'rgba(52, 211, 153, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pulseX, cy, 14, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  /* -----------------------------------------------------------------
     Conclusion Synthesis View
     ----------------------------------------------------------------- */
  showConclusionView(c) {
    this.activeTab = 'conclusion';
    if (this.workbenchPanel) this.workbenchPanel.style.display = 'none';
    if (this.conclusionPanel) this.conclusionPanel.style.display = 'flex';

    if (this.conclusionObserved) this.conclusionObserved.textContent = c.conclusion.whatWeObserved;
    if (this.conclusionSuggests) this.conclusionSuggests.textContent = c.conclusion.whatItSuggests;
    if (this.conclusionCanConclude) this.conclusionCanConclude.textContent = c.conclusion.whatWeCanConclude;
    if (this.conclusionUncertain) this.conclusionUncertain.textContent = c.conclusion.whatRemainsUncertain;
    if (this.conclusionHumanity) this.conclusionHumanity.textContent = c.humanityMeaning;

    // Mark completed
    this.engine.markCaseCompleted(c.id);
    this._updateCaseTabsUI();
  }

  showWorkbenchView() {
    this.activeTab = 'workbench';
    if (this.workbenchPanel) this.workbenchPanel.style.display = 'flex';
    if (this.conclusionPanel) this.conclusionPanel.style.display = 'none';
    this._setupInteractiveCanvas();
  }

  /* -----------------------------------------------------------------
     Show / Hide Modal Logic
     ----------------------------------------------------------------- */
  show(targetCaseId = null) {
    this.isOpen = true;
    if (this.container) {
      this.container.classList.add('mc__observatory--visible');
      this.container.setAttribute('aria-hidden', 'false');
    }

    if (targetCaseId) {
      this.engine.selectCase(targetCaseId);
    } else {
      this.engine.selectCase(this.engine.activeCase.id, true);
    }

    this.showWorkbenchView();
    missionState.emit('enterObservatory');
  }

  hide() {
    this.isOpen = false;
    if (this.container) {
      this.container.classList.remove('mc__observatory--visible');
      this.container.setAttribute('aria-hidden', 'true');
    }
    missionState.emit('exitObservatory');
  }
}
