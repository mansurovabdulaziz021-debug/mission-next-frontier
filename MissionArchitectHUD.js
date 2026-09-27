/**
 * MissionArchitectHUD.js — Spatial Mission Composer HUD for Phase 9
 * 
 * Bridges the user's scientific decisions with the 3D spatial assembly and trade-off engine:
 *   - Step Navigation (01 Target → 02 Objective → 03 Method → 04 Constraints → 05 Assembly)
 *   - Live Trade-Off Engine Breakdown (Advantage, Limitation, Dependency, Open Question)
 *   - Scientific Integrity Checklist (Verified / Supported / Simplified / Unknown)
 *   - Deep Evidence & Phenomena Cross-Linking
 *   - Cinematic Mission Briefing & Structured Dossier Generator
 */

import {
  ARCHITECT_TARGETS,
  ARCHITECT_OBJECTIVES,
  ARCHITECT_METHODS,
  ARCHITECT_CONSTRAINTS
} from '../architect/architectData.js';
import { missionArchitectEngine } from '../architect/MissionArchitectEngine.js';
import { missionState } from '../state/MissionState.js';

export class MissionArchitectHUD {
  constructor(visualizer) {
    this.engine = missionArchitectEngine;
    this.visualizer = visualizer;
    this.isOpen = false;

    this._initDOMElements();
    this._bindEngineEvents();
    this._bindUserEvents();
  }

  _initDOMElements() {
    this.container = document.getElementById('mc-architect-overlay');
    if (!this.container) return;

    // Header elements
    this.titleEl = document.getElementById('arch-mission-title');
    this.subtitleEl = document.getElementById('arch-mission-subtitle');
    this.closeBtn = document.getElementById('arch-close-btn');
    this.stepTabs = document.querySelectorAll('.arch__step-tab');

    // Step content containers
    this.stepsContainer = document.getElementById('arch-steps-container');
    this.targetGrid = document.getElementById('arch-target-grid');
    this.objectiveGrid = document.getElementById('arch-objective-grid');
    this.methodGrid = document.getElementById('arch-method-grid');
    this.constraintsPanel = document.getElementById('arch-constraints-panel');

    // Trade-off & Integrity sidebar elements
    this.metricScienceVal = document.getElementById('arch-metric-science');
    this.metricDataVal = document.getElementById('arch-metric-data');
    this.metricCommVal = document.getElementById('arch-metric-comm');
    this.metricObsVal = document.getElementById('arch-metric-obs');

    this.advText = document.getElementById('arch-adv-text');
    this.limText = document.getElementById('arch-lim-text');
    this.depText = document.getElementById('arch-dep-text');
    this.openQText = document.getElementById('arch-open-q-text');
    this.powerAdvisoryEl = document.getElementById('arch-power-advisory');
    this.integrityList = document.getElementById('arch-integrity-list');

    // Cross-link buttons
    this.evidenceBtn = document.getElementById('arch-evidence-btn');
    this.phenomenonBtn = document.getElementById('arch-phenomenon-btn');
    this.discoveryBtn = document.getElementById('arch-discovery-btn');
    this.humanityNoteEl = document.getElementById('arch-humanity-note');

    // Action buttons
    this.assembleBtn = document.getElementById('arch-assemble-btn');
    this.briefingBtn = document.getElementById('arch-briefing-btn');
    this.dossierBtn = document.getElementById('arch-dossier-btn');

    // Modals
    this.briefingModal = document.getElementById('arch-briefing-modal');
    this.briefingCloseBtn = document.getElementById('arch-briefing-close');
    this.briefingContent = document.getElementById('arch-briefing-content');

    this.dossierModal = document.getElementById('arch-dossier-modal');
    this.dossierCloseBtn = document.getElementById('arch-dossier-close');
    this.dossierContent = document.getElementById('arch-dossier-content');

    this._renderTargets();
    this._renderObjectives();
    this._renderMethods();
    this._renderConstraints();
    this._updateTradeOffsUI(this.engine.tradeOffs);
  }

  /* -----------------------------------------------------------------
     DOM Renderers
     ----------------------------------------------------------------- */
  _renderTargets() {
    if (!this.targetGrid) return;
    this.targetGrid.innerHTML = '';

    Object.values(ARCHITECT_TARGETS).forEach(t => {
      const card = document.createElement('div');
      const isSelected = t.id === this.engine.target.id;
      card.className = `arch__card arch__target-card ${isSelected ? 'arch__card--active' : ''}`;
      card.dataset.targetId = t.id;

      card.innerHTML = `
        <div class="arch__card-header">
          <span class="arch__target-badge">${t.category}</span>
          <span class="arch__target-dist">${t.distanceKm}</span>
        </div>
        <h3 class="arch__target-name">${t.name}</h3>
        <div class="arch__target-specs">
          <div class="arch__spec-item"><span class="arch__spec-label">GRAVITY:</span> <span>${t.gravityEarthG}</span></div>
          <div class="arch__spec-item"><span class="arch__spec-label">LIGHT DELAY:</span> <span>${t.lightTimeOneWay}</span></div>
          <div class="arch__spec-item"><span class="arch__spec-label">ATMOSPHERE:</span> <span class="arch__spec-val-truncate">${t.atmosphere}</span></div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.engine.setTarget(t.id);
      });
      this.targetGrid.appendChild(card);
    });
  }

  _renderObjectives() {
    if (!this.objectiveGrid) return;
    this.objectiveGrid.innerHTML = '';

    const supportedIds = this.engine.target.supportedObjectives;
    Object.values(ARCHITECT_OBJECTIVES).forEach(obj => {
      const isSupported = supportedIds.includes(obj.id);
      const isSelected = obj.id === this.engine.objective.id;

      const card = document.createElement('div');
      card.className = `arch__card arch__objective-card ${isSelected ? 'arch__card--active' : ''} ${!isSupported ? 'arch__card--disabled' : ''}`;
      card.dataset.objectiveId = obj.id;

      card.innerHTML = `
        <div class="arch__card-header">
          <span class="arch__kicker">${obj.kicker}</span>
          <span class="arch__status-tag">${isSupported ? 'COMPATIBLE' : 'NOT SUPPORTED AT TARGET'}</span>
        </div>
        <h3 class="arch__objective-name">${obj.name}</h3>
        <p class="arch__question-text">“${obj.primaryQuestion}”</p>
        <div class="arch__metric-tag">DIAGNOSTIC: ${obj.keyScientificMetric}</div>
      `;

      if (isSupported) {
        card.addEventListener('click', () => {
          this.engine.setObjective(obj.id);
        });
      }
      this.objectiveGrid.appendChild(card);
    });
  }

  _renderMethods() {
    if (!this.methodGrid) return;
    this.methodGrid.innerHTML = '';

    const compatibleIds = this.engine.objective.compatibleMethods;
    Object.values(ARCHITECT_METHODS).forEach(m => {
      const isCompatible = compatibleIds.includes(m.id);
      const isSelected = m.id === this.engine.method.id;

      const card = document.createElement('div');
      card.className = `arch__card arch__method-card ${isSelected ? 'arch__card--active' : ''} ${!isCompatible ? 'arch__card--disabled' : ''}`;
      card.dataset.methodId = m.id;

      card.innerHTML = `
        <div class="arch__card-header">
          <span class="arch__kicker">${m.kicker}</span>
          <span class="arch__status-tag">${isCompatible ? 'COMPATIBLE' : 'INCOMPATIBLE WITH OBJECTIVE'}</span>
        </div>
        <h3 class="arch__method-name">${m.name}</h3>
        <div class="arch__method-spec"><span class="arch__spec-label">INSTRUMENT:</span> <span>${m.instrumentType}</span></div>
        <div class="arch__method-spec"><span class="arch__spec-label">SPECTRAL BAND:</span> <span>${m.spectralBand}</span></div>
        <p class="arch__physics-text">${m.physicsPrinciple}</p>
        <div class="arch__analog-tag">REAL ANALOGS: ${m.realWorldAnalogs}</div>
      `;

      if (isCompatible) {
        card.addEventListener('click', () => {
          this.engine.setMethod(m.id);
        });
      }
      this.methodGrid.appendChild(card);
    });
  }

  _renderConstraints() {
    if (!this.constraintsPanel) return;

    this.constraintsPanel.innerHTML = `
      <div class="arch__constraint-group">
        <div class="arch__constraint-header">
          <label class="arch__constraint-label" for="arch-delta-v">PROPULSION DELTA-V BUDGET (km/s):</label>
          <span id="arch-delta-v-val" class="arch__constraint-readout">${this.engine.constraints.deltaV} km/s</span>
        </div>
        <input type="range" id="arch-delta-v" class="arch__slider" min="2.5" max="12.0" step="0.5" value="${this.engine.constraints.deltaV}" />
        <span class="arch__constraint-hint">Simplified Hohmann heliocentric injection and target capture delta-V energy budget.</span>
      </div>

      <div class="arch__constraint-group">
        <label class="arch__constraint-label" for="arch-comm-select">DOWNLINK BAND &amp; ANTENNA SYSTEM:</label>
        <select id="arch-comm-select" class="arch__select">
          ${ARCHITECT_CONSTRAINTS.COMM_BANDWIDTH.options.map(opt => `
            <option value="${opt.id}" ${this.engine.constraints.commBandwidth === opt.id ? 'selected' : ''}>
              ${opt.label} [${opt.linkMargin}]
            </option>
          `).join('')}
        </select>
        <span class="arch__constraint-hint">Higher optical laser frequencies return gigabits of telemetry, but require sub-microradian optical pointing towards Earth.</span>
      </div>

      <div class="arch__constraint-group">
        <label class="arch__constraint-label" for="arch-power-select">PRIMARY POWER ARCHITECTURE:</label>
        <select id="arch-power-select" class="arch__select">
          ${ARCHITECT_CONSTRAINTS.THERMAL_POWER.options.map(opt => `
            <option value="${opt.id}" ${this.engine.constraints.thermalPower === opt.id ? 'selected' : ''}>
              ${opt.label} (${opt.viability})
            </option>
          `).join('')}
        </select>
        <span class="arch__constraint-hint">Determines survival across varying heliocentric solar flux and extreme thermal gradients.</span>
      </div>
    `;

    const deltaVSlider = document.getElementById('arch-delta-v');
    const deltaVVal = document.getElementById('arch-delta-v-val');
    if (deltaVSlider && deltaVVal) {
      deltaVSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        deltaVVal.textContent = `${val.toFixed(1)} km/s`;
        this.engine.setConstraint('deltaV', val);
      });
    }

    const commSelect = document.getElementById('arch-comm-select');
    if (commSelect) {
      commSelect.addEventListener('change', (e) => {
        this.engine.setConstraint('commBandwidth', e.target.value);
      });
    }

    const powerSelect = document.getElementById('arch-power-select');
    if (powerSelect) {
      powerSelect.addEventListener('change', (e) => {
        this.engine.setConstraint('thermalPower', e.target.value);
      });
    }
  }

  _renderAssemblyView() {
    const container = document.getElementById('arch-assembly-container');
    if (!container) return;

    const target = this.engine.target;
    const objective = this.engine.objective;
    const method = this.engine.method;
    const constraints = this.engine.constraints;

    const isNuclear = constraints.thermalPower === 'NUCLEAR_RTG' || constraints.thermalPower === 'RTG_NUCLEAR' || target.id === 'EUROPA' || target.id === 'SAGITTARIUS_A';
    const powerLabel = isNuclear
      ? 'Dual Pu-238 RTG (Radioisotope Thermoelectric Generator) + 4m Separation Boom'
      : (target.id === 'PARKER_SUN'
          ? 'Ultra-High Temp Carbon-Phenolic TPS Heat Shield (1650°K rated) + Folded PV Wings'
          : 'High-Efficiency Multi-Junction Photovoltaic Blue Silicon Solar Wings (Dual Articulated)');

    const commLabel = constraints.commBandwidth.startsWith('OPTICAL_LASER')
      ? 'Deep Space Optical Communications (DSOC) 1550nm Laser Transceiver + 2.4m HGA'
      : (constraints.commBandwidth.startsWith('KA_BAND')
          ? '32 GHz Ka-Band Deep Space Transponder + 2.4m Parabolic Carbon-Fiber Dish'
          : '8.4 GHz X-Band Deep Space Transponder + Medium-Gain Horn Antenna');

    const propLabel = constraints.deltaV >= 8.0
      ? 'Dual Xenon Ion / Hall-Effect Plasma Thrusters (Isp ~3200s) + Hydrazine RCS Quads'
      : 'Bipropellant Hypergolic Main Engine (MMH/NTO) + 4x 3-Axis RCS Thruster Pods';

    container.innerHTML = `
      <div class="arch__assembly-viewmodes">
        <span class="arch__viewmode-title">3D VIEW MODE:</span>
        <button class="arch__viewmode-btn arch__viewmode-btn--active" data-viewmode="ORBITAL" type="button">
          <span>🪐 ORBITAL SURVEY</span>
        </button>
        <button class="arch__viewmode-btn" data-viewmode="SPACECRAFT" type="button">
          <span>🛰️ 3D SPACECRAFT BLUEPRINT</span>
        </button>
        <button class="arch__viewmode-btn" data-viewmode="PAYLOAD" type="button">
          <span>🔬 PAYLOAD SENSOR ALIGNMENT</span>
        </button>
      </div>

      <div class="arch__assembly-specs">
        <div class="arch__spec-card">
          <div class="arch__spec-badge">BUS ARCHITECTURE</div>
          <h4>Octagonal Avionics Chassis</h4>
          <p>Aluminum-honeycomb structural core wrapped in gold Multi-Layer Insulation (MLI) thermal blanket with dual autonomous star trackers and 4x RCS attitude control blocks.</p>
        </div>

        <div class="arch__spec-card">
          <div class="arch__spec-badge">POWER &amp; THERMAL</div>
          <h4>${powerLabel.split(' (')[0]}</h4>
          <p>${powerLabel}</p>
        </div>

        <div class="arch__spec-card">
          <div class="arch__spec-badge">PRIMARY INSTRUMENT</div>
          <h4>${method.name}</h4>
          <p><strong>Payload:</strong> ${method.instrumentType} operating across ${method.spectralBand}. Diagnosing <em>${objective.keyScientificMetric}</em>.</p>
        </div>

        <div class="arch__spec-card">
          <div class="arch__spec-badge">COMMUNICATIONS</div>
          <h4>Deep Space Carrier Link</h4>
          <p>${commLabel}. Pointing margin budget linked to NASA Deep Space Network (DSN 70m apertures).</p>
        </div>

        <div class="arch__spec-card">
          <div class="arch__spec-badge">PROPULSION &amp; ORBIT</div>
          <h4>Keplerian Target Injection</h4>
          <p>${propLabel}. Total Delta-V budget: <strong>${constraints.deltaV} km/s</strong> for interplanetary transfer and orbital capture.</p>
        </div>
      </div>
    `;

    // Wire up view mode buttons
    const vmBtns = container.querySelectorAll('.arch__viewmode-btn');
    vmBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        vmBtns.forEach(b => b.classList.remove('arch__viewmode-btn--active'));
        btn.classList.add('arch__viewmode-btn--active');
        const mode = btn.dataset.viewmode;
        if (this.visualizer && mode) {
          this.visualizer.setViewMode(mode);
        }
      });
    });
  }

  /* -----------------------------------------------------------------
     Trade-Offs & Integrity UI Updates
     ----------------------------------------------------------------- */
  _updateTradeOffsUI(tradeOffs) {
    if (!tradeOffs) return;

    if (this.titleEl) {
      this.titleEl.textContent = `MISSION CONCEPT // ${this.engine.missionCode}`;
    }
    if (this.subtitleEl) {
      this.subtitleEl.textContent = `${this.engine.objective.name} @ ${this.engine.target.name}`;
    }

    // Update qualitative bars
    if (this.metricScienceVal) this.metricScienceVal.style.width = `${tradeOffs.metrics.scienceValue}%`;
    if (this.metricDataVal) this.metricDataVal.style.width = `${tradeOffs.metrics.dataComplexity}%`;
    if (this.metricCommVal) this.metricCommVal.style.width = `${tradeOffs.metrics.commChallenge}%`;
    if (this.metricObsVal) this.metricObsVal.style.width = `${tradeOffs.metrics.observationComplexity}%`;

    // Concrete Trade-Off Breakdown
    if (this.advText) this.advText.textContent = tradeOffs.advantage;
    if (this.limText) this.limText.textContent = tradeOffs.limitation;
    if (this.depText) this.depText.textContent = tradeOffs.dependency;
    if (this.openQText) this.openQText.textContent = tradeOffs.openQuestion;

    if (this.powerAdvisoryEl) {
      this.powerAdvisoryEl.textContent = tradeOffs.powerAdvisory;
      this.powerAdvisoryEl.className = `arch__advisory ${tradeOffs.powerAdvisory.startsWith('CRITICAL') || tradeOffs.powerAdvisory.startsWith('CAUTION') ? 'arch__advisory--warn' : 'arch__advisory--ok'}`;
    }

    // Integrity Checklist
    if (this.integrityList) {
      this.integrityList.innerHTML = tradeOffs.integrityChecklist.map(item => `
        <li class="arch__integrity-item">
          <span class="arch__integrity-badge arch__integrity-badge--${item.status.toLowerCase()}">${item.status}</span>
          <div class="arch__integrity-text">
            <strong>${item.criterion}</strong>: ${item.detail}
          </div>
        </li>
      `).join('');
    }

    // Cross-link buttons labels
    if (this.evidenceBtn) {
      this.evidenceBtn.innerHTML = `<span>⌖ WHY THIS METHOD? REVIEW EVIDENCE ↗</span>`;
    }
    if (this.phenomenonBtn) {
      this.phenomenonBtn.innerHTML = `<span>✧ EXPLORE PHENOMENON (${this.engine.method.phenomenonLink.replace('_', ' ')}) ↗</span>`;
    }
    if (this.discoveryBtn) {
      this.discoveryBtn.innerHTML = `<span>✦ UNEXPECTED DISCOVERY CONNECTION ↗</span>`;
    }
    if (this.humanityNoteEl) {
      this.humanityNoteEl.textContent = this.engine.target.humanityNote;
    }
  }

  /* -----------------------------------------------------------------
     Engine Event Wiring
     ----------------------------------------------------------------- */
  _bindEngineEvents() {
    this.engine.on('targetChanged', () => {
      this._renderTargets();
      this._renderObjectives();
      this._renderMethods();
      this._updateTradeOffsUI(this.engine.tradeOffs);
    });

    this.engine.on('objectiveChanged', () => {
      this._renderObjectives();
      this._renderMethods();
      this._updateTradeOffsUI(this.engine.tradeOffs);
    });

    this.engine.on('methodChanged', () => {
      this._renderMethods();
      this._updateTradeOffsUI(this.engine.tradeOffs);
    });

    this.engine.on('constraintsChanged', () => {
      this._updateTradeOffsUI(this.engine.tradeOffs);
    });

    this.engine.on('tradeOffsUpdated', (tradeOffs) => {
      this._updateTradeOffsUI(tradeOffs);
    });

    this.engine.on('stepChanged', ({ step }) => {
      this._updateActiveStepTab(step);
      this._switchStepView(step);
    });

    this.engine.on('missionAssembled', () => {
      this._updateActiveStepTab('ASSEMBLY');
      this._switchStepView('ASSEMBLY');
    });

    this.engine.on('briefingGenerated', (dossier) => {
      this._showBriefingModal(dossier);
    });
  }

  /* -----------------------------------------------------------------
     User Interactions
     ----------------------------------------------------------------- */
  _bindUserEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.hide();
      });
    }

    this.stepTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const step = tab.dataset.step;
        if (step) {
          this.engine.setStep(step);
          this._switchStepView(step);
        }
      });
    });

    if (this.assembleBtn) {
      this.assembleBtn.addEventListener('click', () => {
        this.engine.assembleMission();
      });
    }

    if (this.briefingBtn) {
      this.briefingBtn.addEventListener('click', () => {
        this.engine.generateBriefing();
      });
    }

    if (this.dossierBtn) {
      this.dossierBtn.addEventListener('click', () => {
        this._showDossierModal(this.engine.getMissionDossier());
      });
    }

    if (this.briefingCloseBtn) {
      this.briefingCloseBtn.addEventListener('click', () => {
        if (this.briefingModal) this.briefingModal.style.display = 'none';
      });
    }

    if (this.dossierCloseBtn) {
      this.dossierCloseBtn.addEventListener('click', () => {
        if (this.dossierModal) this.dossierModal.style.display = 'none';
      });
    }

    // Cross-link handling
    if (this.evidenceBtn) {
      this.evidenceBtn.addEventListener('click', () => {
        const caseId = this.engine.target.evidenceCase;
        this.hide();
        // Emit event to open observatory with specific case
        missionState.emit('enterObservatory');
        missionState.emit('openObservatoryCase', caseId);
      });
    }

    if (this.phenomenonBtn) {
      this.phenomenonBtn.addEventListener('click', () => {
        const phenomId = this.engine.method.phenomenonLink;
        this.hide();
        missionState.emit('enterPhenomena');
        missionState.emit('openPhenomenon', phenomId);
      });
    }

    if (this.discoveryBtn) {
      this.discoveryBtn.addEventListener('click', () => {
        const discId = this.engine.target.discoveryId;
        this.hide();
        missionState.emit('openDiscovery', discId);
      });
    }
  }

  _switchStepView(step) {
    if (!this.stepsContainer) return;

    const sections = this.stepsContainer.querySelectorAll('.arch__step-section');
    sections.forEach(s => {
      s.style.display = s.dataset.stepSection === step ? 'block' : 'none';
    });

    if (step === 'ASSEMBLY') {
      this._renderAssemblyView();
    }
  }

  _updateActiveStepTab(step) {
    this.stepTabs.forEach(tab => {
      tab.classList.toggle('arch__step-tab--active', tab.dataset.step === step);
    });
  }

  _showBriefingModal(dossier) {
    if (!this.briefingModal || !this.briefingContent) return;

    this.briefingContent.innerHTML = `
      <div class="arch__briefing-header">
        <span class="arch__badge arch__badge--verified">${dossier.badge}</span>
        <h2 class="arch__briefing-title">${dossier.title}</h2>
        <div class="arch__briefing-sub">${dossier.subtitle}</div>
      </div>

      <div class="arch__briefing-timeline">
        <div class="arch__tl-item"><span class="arch__tl-idx">01</span><span>TARGET ACQUISITION</span></div>
        <div class="arch__tl-item"><span class="arch__tl-idx">02</span><span>ORBITAL INSERTION</span></div>
        <div class="arch__tl-item"><span class="arch__tl-idx">03</span><span>INSTRUMENT DEPLOYMENT</span></div>
        <div class="arch__tl-item"><span class="arch__tl-idx">04</span><span>DATA ACQUISITION</span></div>
        <div class="arch__tl-item"><span class="arch__tl-idx">05</span><span>EARTH DOWNLINK</span></div>
      </div>

      <!-- Surprise & Discovery Insight -->
      <div class="arch__reveal-card">
        <div class="arch__reveal-tag">✦ YOUR MISSION REVEALS</div>
        <p class="arch__reveal-body">${dossier.surpriseMoment.reveal}</p>
        <div class="arch__lim-tag">⚠ CRITICAL OBSERVATIONAL LIMITATION</div>
        <p class="arch__lim-body">${dossier.surpriseMoment.limitation}</p>
        <div class="arch__deep-tag">↗ SCIENTIFIC INVESTIGATION PATH</div>
        <p class="arch__deep-body">${dossier.surpriseMoment.goDeeper}</p>
      </div>

      <div class="arch__briefing-grid">
        <div class="arch__briefing-col">
          <h4>TARGET SPECIFICATIONS</h4>
          <ul>
            <li><strong>Name:</strong> ${dossier.target.name}</li>
            <li><strong>Category:</strong> ${dossier.target.category}</li>
            <li><strong>Distance:</strong> ${dossier.target.distanceKm}</li>
            <li><strong>Round-Trip Light Lag:</strong> ${dossier.target.lightTimeTwoWay}</li>
            <li><strong>Atmosphere:</strong> ${dossier.target.atmosphere}</li>
          </ul>
        </div>
        <div class="arch__briefing-col">
          <h4>INSTRUMENT PAYLOAD</h4>
          <ul>
            <li><strong>Method:</strong> ${dossier.method.name}</li>
            <li><strong>Instrument:</strong> ${dossier.method.instrumentType}</li>
            <li><strong>Spectral Band:</strong> ${dossier.method.spectralBand}</li>
            <li><strong>Physical Principle:</strong> ${dossier.method.physicsPrinciple}</li>
            <li><strong>Flight Analogs:</strong> ${dossier.method.realWorldAnalogs}</li>
          </ul>
        </div>
      </div>

      <div class="arch__briefing-sources">
        <span class="arch__sources-label">GROUNDED IN SOURCED LITERATURE:</span>
        ${dossier.scientificSources.map(s => `<span class="arch__source-chip">${s}</span>`).join('')}
      </div>
    `;

    this.briefingModal.style.display = 'flex';
  }

  _showDossierModal(dossier) {
    if (!this.dossierModal || !this.dossierContent) return;

    this.dossierContent.innerHTML = `
      <div class="arch__dossier-sheet">
        <div class="arch__dossier-hdr">
          <div class="arch__dossier-stamp">NASA SPACE APPS 2026 // PHASE 9</div>
          <h1>${dossier.title}</h1>
          <h3>${dossier.subtitle}</h3>
        </div>

        <section class="arch__dossier-section">
          <h2>1. PRIMARY SCIENTIFIC QUESTION</h2>
          <p>“${dossier.objective.primaryQuestion}”</p>
          <p><em>Diagnostic Metric: ${dossier.objective.keyScientificMetric}</em></p>
        </section>

        <section class="arch__dossier-section">
          <h2>2. TARGET ASTROMETRIC &amp; PHYSICAL ENVIRONMENT</h2>
          <table class="arch__dossier-table">
            <tr><td>Target</td><td>${dossier.target.name} (${dossier.target.category})</td></tr>
            <tr><td>Mean Distance</td><td>${dossier.target.distanceKm}</td></tr>
            <tr><td>Communication Lag</td><td>1-way: ${dossier.target.lightTimeOneWay} | 2-way: ${dossier.target.lightTimeTwoWay}</td></tr>
            <tr><td>Surface Gravity</td><td>${dossier.target.gravityEarthG}</td></tr>
            <tr><td>Solar Flux</td><td>${dossier.target.solarIrradiance}</td></tr>
          </table>
        </section>

        <section class="arch__dossier-section">
          <h2>3. OBSERVATION METHOD &amp; INSTRUMENTATION</h2>
          <table class="arch__dossier-table">
            <tr><td>Method</td><td>${dossier.method.name}</td></tr>
            <tr><td>Instrument Architecture</td><td>${dossier.method.instrumentType}</td></tr>
            <tr><td>Observation Band</td><td>${dossier.method.spectralBand}</td></tr>
            <tr><td>Physical Basis</td><td>${dossier.method.physicsPrinciple}</td></tr>
            <tr><td>Real Analogs</td><td>${dossier.method.realWorldAnalogs}</td></tr>
          </table>
        </section>

        <section class="arch__dossier-section">
          <h2>4. SCIENTIFIC TRADE-OFF ANALYSIS</h2>
          <div class="arch__trade-item"><strong>ADVANTAGE:</strong> ${dossier.tradeOffs.advantage}</div>
          <div class="arch__trade-item"><strong>LIMITATION:</strong> ${dossier.tradeOffs.limitation}</div>
          <div class="arch__trade-item"><strong>DEPENDENCY:</strong> ${dossier.tradeOffs.dependency}</div>
          <div class="arch__trade-item"><strong>UNRESOLVED QUESTION:</strong> ${dossier.tradeOffs.openQuestion}</div>
        </section>

        <section class="arch__dossier-section">
          <h2>5. HUMANITY IMPLICATION</h2>
          <p>${dossier.humanityImplication}</p>
        </section>

        <section class="arch__dossier-section">
          <h2>6. SCIENTIFIC INTEGRITY &amp; SOURCING</h2>
          <ul>
            ${dossier.tradeOffs.integrityChecklist.map(c => `<li><strong>${c.criterion} (${c.status}):</strong> ${c.detail}</li>`).join('')}
          </ul>
        </section>
      </div>
    `;

    this.dossierModal.style.display = 'flex';
  }

  show() {
    this.isOpen = true;
    if (this.container) {
      this.container.classList.add('mc__architect--visible');
      this.container.setAttribute('aria-hidden', 'false');
    }
    if (this.visualizer) {
      this.visualizer.show();
    }
    this._switchStepView(this.engine.currentStep);
    missionState.emit('enterMissionArchitect');
  }

  hide() {
    this.isOpen = false;
    if (this.container) {
      this.container.classList.remove('mc__architect--visible');
      this.container.setAttribute('aria-hidden', 'true');
    }
    if (this.visualizer) {
      this.visualizer.hide();
    }
    missionState.emit('exitMissionArchitect');
  }

  close() {
    this.hide();
  }

  assemble() {
    this.engine.assembleMission();
  }

  generateBriefing() {
    this.engine.generateBriefing();
  }

  _onAssembleClick() {
    this.assemble();
  }

  _onOpenBriefingClick() {
    this.generateBriefing();
  }
}
