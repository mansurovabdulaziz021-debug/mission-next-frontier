/**
 * ScenarioHubHUD — Presentation Layer for Phase 4 Interactive Scenario Engine
 * MISSION // NEXT FRONTIER
 *
 * Manages scenario selection, parameter controls, live derived results,
 * comparison mode, educational assumptions disclosure, and source transparency links.
 */

import gsap from 'gsap';
import { missionState } from '../state/MissionState.js';
import { SCENARIOS, SCENARIO_TYPES } from '../scenarios/scenarioEngine.js';
import { discoveryEngine } from '../discoveries/DiscoveryEngine.js';
import { getDiscoveryById } from '../discoveries/discoveryData.js';

export class ScenarioHubHUD {
  /**
   * @param {import('../three/ScenarioVisualizer.js').ScenarioVisualizer} scenarioVisualizer
   */
  constructor(scenarioVisualizer) {
    this.visualizer = scenarioVisualizer;
    this.activeScenarioId = SCENARIO_TYPES.COMMUNICATION_DELAY;
    this.isOpen = false;
    this.isComparisonMode = false;

    // Active parameter store for each scenario
    this.params = {
      COMMUNICATION_DELAY: { target: 'MARS_MEAN', carrier: 'KA_BAND' },
      GRAVITY_EXPERIENCE:  { target: 'MARS', massKg: 80 },
      TRAVEL_TRAJECTORY:   { regime: 'EARTH_MARS_HOHMANN', propulsion: 'CHEMICAL_LOX_CH4' },
      SOLAR_ENVIRONMENT:   { location: 'MARS_SURFACE', weather: 'CORONAL_MASS_EJECTION', shielding: 'HAB_ALUMINUM' }
    };

    this._reducedMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this._dom = {
      panel:          document.getElementById('mc-scenario-hub'),
      toggleBtn:      document.getElementById('mc-scenario-toggle'),
      closeBtn:       document.getElementById('mc-scenario-close'),
      scenarioTabs:   document.querySelectorAll('.mc__scenario-tab'),
      compareBtn:     document.getElementById('mc-scenario-compare-btn'),
      title:          document.getElementById('mc-scenario-title'),
      subtitle:       document.getElementById('mc-scenario-subtitle'),
      controlsBox:    document.getElementById('mc-scenario-controls'),
      resultMatrix:   document.getElementById('mc-scenario-results'),
      comparisonBox:  document.getElementById('mc-scenario-comparison')
    };

    this._bindEvents();
    this._render();
  }

  /* -----------------------------------------------------------------
     Event Bindings
     ----------------------------------------------------------------- */
  _bindEvents() {
    // Top Bar Trigger Button
    if (this._dom.toggleBtn) {
      this._dom.toggleBtn.addEventListener('click', () => this.toggleHub());
    }

    // Close Button
    if (this._dom.closeBtn) {
      this._dom.closeBtn.addEventListener('click', () => this.closeHub());
    }

    // Comparison Mode Button
    if (this._dom.compareBtn) {
      this._dom.compareBtn.addEventListener('click', () => this.toggleComparisonMode());
    }

    // Scenario Navigation Tabs
    this._dom.scenarioTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const id = tab.getAttribute('data-scenario');
        if (id && SCENARIOS[id]) {
          this.setScenario(id);
        }
      });
    });

    // Keyboard ESC closes hub
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeHub();
      }
    });
  }

  /* -----------------------------------------------------------------
     Hub Open / Close Coordination
     ----------------------------------------------------------------- */
  toggleHub() {
    this.isOpen ? this.closeHub() : this.openHub();
  }

  openHub() {
    this.isOpen = true;
    if (this._dom.panel) {
      this._dom.panel.classList.add('mc__scenario-hub--open');
      this._dom.panel.setAttribute('aria-hidden', 'false');
    }
    if (this._dom.toggleBtn) {
      this._dom.toggleBtn.classList.add('mc__scenario-toggle--active');
      this._dom.toggleBtn.setAttribute('aria-expanded', 'true');
    }

    // Close Scientific Data Layer if open to prevent overlap
    const sciencePanel = document.getElementById('mc-science-panel');
    const scienceToggle = document.getElementById('mc-science-toggle');
    if (sciencePanel?.classList.contains('mc__science-panel--open')) {
      sciencePanel.classList.remove('mc__science-panel--open');
      sciencePanel.setAttribute('aria-hidden', 'true');
      scienceToggle?.classList.remove('mc__science-toggle--active');
    }

    this._render();
    this._animateEntrance();
  }

  closeHub() {
    this.isOpen = false;
    if (this._dom.panel) {
      this._dom.panel.classList.remove('mc__scenario-hub--open');
      this._dom.panel.setAttribute('aria-hidden', 'true');
    }
    if (this._dom.toggleBtn) {
      this._dom.toggleBtn.classList.remove('mc__scenario-toggle--active');
      this._dom.toggleBtn.setAttribute('aria-expanded', 'false');
    }

    if (this.visualizer) {
      this.visualizer.hide();
    }
  }

  close() {
    if (this.isOpen) {
      this.closeHub();
    }
  }

  toggle() {
    this.toggleHub();
  }

  toggleComparisonMode() {
    this.isComparisonMode = !this.isComparisonMode;
    if (this._dom.compareBtn) {
      this._dom.compareBtn.classList.toggle('mc__btn--active', this.isComparisonMode);
    }
    this._render();
  }

  /* -----------------------------------------------------------------
     Scenario Selection & Parameter Updates
     ----------------------------------------------------------------- */
  setScenario(id) {
    if (!SCENARIOS[id]) return;
    this.activeScenarioId = id;
    this.isComparisonMode = false;
    if (this._dom.compareBtn) {
      this._dom.compareBtn.classList.remove('mc__btn--active');
    }

    // Update Tab UI
    this._dom.scenarioTabs.forEach((tab) => {
      const isMatch = tab.getAttribute('data-scenario') === id;
      tab.classList.toggle('mc__scenario-tab--active', isMatch);
      tab.setAttribute('aria-selected', String(isMatch));
    });

    this._render();
    this._animateEntrance();
  }

  updateParam(paramId, value) {
    if (!this.params[this.activeScenarioId]) {
      this.params[this.activeScenarioId] = {};
    }
    this.params[this.activeScenarioId][paramId] = value;
    this._render();
  }

  /* -----------------------------------------------------------------
     Main Render Loop
     ----------------------------------------------------------------- */
  _render() {
    const scenario = SCENARIOS[this.activeScenarioId];
    if (!scenario) return;

    // Header info
    if (this._dom.title)    this._dom.title.textContent = scenario.title;
    if (this._dom.subtitle) this._dom.subtitle.textContent = scenario.subtitle;

    if (this.isComparisonMode) {
      if (this._dom.controlsBox)   this._dom.controlsBox.style.display = 'none';
      if (this._dom.resultMatrix)  this._dom.resultMatrix.style.display = 'none';
      if (this._dom.comparisonBox) {
        this._dom.comparisonBox.style.display = 'block';
        this._renderComparisonMatrix();
      }
      return;
    }

    if (this._dom.controlsBox)   this._dom.controlsBox.style.display = 'flex';
    if (this._dom.resultMatrix)  this._dom.resultMatrix.style.display = 'flex';
    if (this._dom.comparisonBox) this._dom.comparisonBox.style.display = 'none';

    // Current parameters and calculation
    const currentParams = this.params[this.activeScenarioId];
    const result = scenario.calculate(currentParams);

    // Sync with 3D Visualizer
    if (this.visualizer && this.isOpen) {
      this.visualizer.setScenario(this.activeScenarioId, result);
    }

    // Optionally sync camera target if requested
    if (result.destKey && missionState.activeDestination !== result.destKey) {
      missionState.setDestination(result.destKey);
    }

    this._renderControls(scenario, currentParams);
    this._renderResults(scenario, result);
  }

  /* -----------------------------------------------------------------
     Render Left Column: Interactive Scenario Controls
     ----------------------------------------------------------------- */
  _renderControls(scenario, currentParams) {
    if (!this._dom.controlsBox) return;

    this._dom.controlsBox.innerHTML = scenario.parameters
      .map((param) => {
        const val = currentParams[param.id] !== undefined ? currentParams[param.id] : param.default;

        if (param.type === 'select') {
          return `
            <div class="mc__ctrl-group">
              <label class="mc__ctrl-label" for="ctrl-${param.id}">${param.label}:</label>
              <div class="mc__select-wrapper">
                <select id="ctrl-${param.id}" class="mc__ctrl-select" data-param="${param.id}">
                  ${param.options
                    .map(
                      (opt) => `
                    <option value="${opt.id}" ${opt.id === val ? 'selected' : ''}>
                      ${opt.label}
                    </option>
                  `
                    )
                    .join('')}
                </select>
              </div>
            </div>
          `;
        }

        if (param.type === 'segmented') {
          return `
            <div class="mc__ctrl-group">
              <span class="mc__ctrl-label">${param.label}:</span>
              <div class="mc__segmented-control">
                ${param.options
                  .map(
                    (opt) => `
                  <button
                    class="mc__segment-btn ${opt.id === val ? 'mc__segment-btn--active' : ''}"
                    type="button"
                    data-param="${param.id}"
                    data-val="${opt.id}">
                    ${opt.label}
                  </button>
                `
                  )
                  .join('')}
              </div>
            </div>
          `;
        }

        if (param.type === 'slider') {
          return `
            <div class="mc__ctrl-group">
              <div class="mc__slider-header">
                <label class="mc__ctrl-label" for="ctrl-${param.id}">${param.label}:</label>
                <span class="mc__slider-val-readout" id="readout-${param.id}">${val} ${param.unit}</span>
              </div>
              <input
                id="ctrl-${param.id}"
                class="mc__ctrl-slider"
                type="range"
                data-param="${param.id}"
                min="${param.min}"
                max="${param.max}"
                step="${param.step}"
                value="${val}" />
              <div class="mc__slider-bounds">
                <span>${param.min} ${param.unit}</span>
                <span>${param.max} ${param.unit}</span>
              </div>
            </div>
          `;
        }

        return '';
      })
      .join('');

    // Attach control event listeners
    this._dom.controlsBox.querySelectorAll('.mc__ctrl-select').forEach((sel) => {
      sel.addEventListener('change', (e) => {
        const paramId = sel.getAttribute('data-param');
        const value = /** @type {HTMLSelectElement} */ (e.target).value;
        this.updateParam(paramId, value);
      });
    });

    this._dom.controlsBox.querySelectorAll('.mc__segment-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const paramId = btn.getAttribute('data-param');
        const value = btn.getAttribute('data-val');
        this.updateParam(paramId, value);
      });
    });

    this._dom.controlsBox.querySelectorAll('.mc__ctrl-slider').forEach((slider) => {
      slider.addEventListener('input', (e) => {
        const paramId = slider.getAttribute('data-param');
        const value = parseFloat(/** @type {HTMLInputElement} */ (e.target).value);
        const readout = document.getElementById(`readout-${paramId}`);
        if (readout) readout.textContent = `${value} kg`;
        this.updateParam(paramId, value);
      });
    });
  }

  /* -----------------------------------------------------------------
     Render Right Column: Derived Scientific Results & Explanations
     ----------------------------------------------------------------- */
  _renderResults(scenario, res) {
    if (!this._dom.resultMatrix) return;

    let primaryCardHtml = '';

    if (scenario.id === 'COMMUNICATION_DELAY') {
      primaryCardHtml = `
        <div class="mc__res-card mc__res-card--hero">
          <div class="mc__res-kicker">ONE-WAY LIGHT-SPEED DELAY (ONE-WAY):</div>
          <div class="mc__res-hero-val">${res.oneWayFormatted}</div>
          <div class="mc__res-sub-row">
            <span class="mc__res-sub-k">ROUND-TRIP TIME (PING):</span>
            <span class="mc__res-sub-v">${res.roundTripFormatted}</span>
          </div>
          <div class="mc__teleop-badge ${res.regimeBadge}">${res.regime}</div>
          <p class="mc__teleop-desc">${res.teleopFeasibility}</p>
        </div>

        <div class="mc__res-grid">
          <div class="mc__res-metric">
            <span class="mc__metric-k">CARRIER BANDWIDTH</span>
            <span class="mc__metric-v">${res.bandwidthFormatted}</span>
          </div>
          <div class="mc__res-metric">
            <span class="mc__metric-k">50MB RAW 4K IMAGE TRANSFER</span>
            <span class="mc__metric-v">${res.imageTransferFormatted}</span>
          </div>
        </div>
      `;
    } else if (scenario.id === 'GRAVITY_EXPERIENCE') {
      primaryCardHtml = `
        <div class="mc__res-card mc__res-card--hero">
          <div class="mc__res-kicker">EFFECTIVE SURFACE WEIGHT FOR ${res.massKg} KG MASS:</div>
          <div class="mc__res-hero-val">${res.weightKgf} kgf <span class="mc__hero-unit">(${res.weightN} N)</span></div>
          <div class="mc__res-sub-row">
            <span class="mc__res-sub-k">BALLISTIC JUMP HEIGHT MULTIPLIER:</span>
            <span class="mc__res-sub-v">${res.jumpMult}x (${res.jumpHeightM} m)</span>
          </div>
          <div class="mc__res-sub-row">
            <span class="mc__res-sub-k">BALLISTIC HANG TIME:</span>
            <span class="mc__res-sub-v">${res.hangTimeSec} sec</span>
          </div>
        </div>

        <div class="mc__res-grid">
          <div class="mc__res-metric">
            <span class="mc__metric-k">BONE MINERAL DENSITY IMPACT</span>
            <span class="mc__metric-v">${res.deconditioningText}</span>
          </div>
        </div>
      `;
    } else if (scenario.id === 'TRAVEL_TRAJECTORY') {
      primaryCardHtml = `
        <div class="mc__res-card mc__res-card--hero">
          <div class="mc__res-kicker">ONE-WAY FLIGHT TRANSIT DURATION:</div>
          <div class="mc__res-hero-val">${res.transitDurationFormatted}</div>
          <div class="mc__res-sub-row">
            <span class="mc__res-sub-k">TOTAL DELTA-V REQUIREMENT:</span>
            <span class="mc__res-sub-v">${res.deltaVFormatted}</span>
          </div>
          <div class="mc__res-sub-row">
            <span class="mc__res-sub-k">LAUNCH WINDOW RECURRENCE:</span>
            <span class="mc__res-sub-v">${res.synodicMonthsFormatted}</span>
          </div>
        </div>

        <div class="mc__res-grid">
          <div class="mc__res-metric">
            <span class="mc__metric-k">TRANSFER DISTANCE</span>
            <span class="mc__metric-v">${res.distanceKmFormatted}</span>
          </div>
          <div class="mc__res-metric">
            <span class="mc__metric-k">PROPELLANT MASS FRACTION</span>
            <span class="mc__metric-v">${res.propellantFractionPct}% of spacecraft wet mass</span>
          </div>
        </div>
      `;
    } else if (scenario.id === 'SOLAR_ENVIRONMENT') {
      primaryCardHtml = `
        <div class="mc__res-card mc__res-card--hero">
          <div class="mc__res-kicker">LOCAL SOLAR IRRADIANCE (INVERSE-SQUARE):</div>
          <div class="mc__res-hero-val">${res.irradianceFormatted} <span class="mc__hero-unit">(${res.irradianceRatioPct}% Earth)</span></div>
          <div class="mc__res-sub-row">
            <span class="mc__res-sub-k">DAILY RADIATION EQUIVALENT DOSE:</span>
            <span class="mc__res-sub-v">${res.dailyDoseFormatted}</span>
          </div>
          <div class="mc__teleop-badge ${res.safetyClass}">${res.safetyTag}</div>
        </div>

        <div class="mc__res-grid">
          <div class="mc__res-metric">
            <span class="mc__metric-k">SOLAR ARRAY SIZING MULTIPLIER</span>
            <span class="mc__metric-v">${res.solarAreaMultiplier}x Earth array area required</span>
          </div>
        </div>
      `;
    }

    this._dom.resultMatrix.innerHTML = `
      ${primaryCardHtml}

      <!-- Explanation Blocks -->
      <div class="mc__explanation-card">
        <div class="mc__explain-row">
          <span class="mc__explain-tag">WHAT CHANGED?</span>
          <p class="mc__explain-text">${res.whatChanged}</p>
        </div>
        <div class="mc__explain-row mc__explain-row--highlight">
          <span class="mc__explain-tag">WHY IT MATTERS:</span>
          <p class="mc__explain-text">${res.whyItMatters}</p>
        </div>
      </div>

      <!-- Educational Assumptions & Model Limitations Disclosure -->
      <div class="mc__assumptions-card">
        <div class="mc__assump-header">
          <span class="mc__assump-icon">⚖</span>
          <span class="mc__assump-title">EDUCATIONAL MODEL SIMPLIFICATIONS &amp; ASSUMPTIONS</span>
        </div>
        <p class="mc__assump-text">${scenario.educationalDisclaimer}</p>
      </div>

      <!-- Authoritative Source Citation -->
      <div class="mc__scenario-src-card">
        <div class="mc__src-tag">AUTHORITATIVE SCIENTIFIC REFERENCE</div>
        <div class="mc__src-org">${scenario.source.org}</div>
        <div class="mc__src-doc">${scenario.source.title}</div>
        <div class="mc__src-ref">Ref: ${scenario.source.ref}</div>
        <a href="${scenario.source.url}" target="_blank" rel="noopener noreferrer" class="mc__src-link">
          Inspect Official NASA Source Document ↗
        </a>
      </div>

      <!-- Related Cosmic Discovery Card -->
      ${this._getRelatedDiscoveryHtml(scenario.id)}
    `;

    // Bind click for related discovery card
    const discBtn = this._dom.resultMatrix.querySelector('.mc__scenario-disc-btn');
    if (discBtn) {
      discBtn.addEventListener('click', () => {
        const discId = discBtn.getAttribute('data-disc-id');
        if (discId) {
          discoveryEngine.triggerUnexpectedDiscovery(discId);
        }
      });
    }
  }

  _getRelatedDiscoveryHtml(scenarioId) {
    const discMap = {
      COMMUNICATION_DELAY: 'voyager_telemetry',
      GRAVITY_EXPERIENCE: 'human_microgravity_fluids',
      TRAVEL_TRAJECTORY: 'lagrange_islands',
      SOLAR_ENVIRONMENT: 'solar_coronal_paradox'
    };
    const discId = discMap[scenarioId] || 'mars_blue_sunset';
    const disc = getDiscoveryById(discId);
    if (!disc) return '';

    return `
      <div class="mc__scenario-disc-card">
        <div class="mc__scenario-disc-header">
          <span class="mc__scenario-disc-tag">✦ RELATED COSMIC DISCOVERY</span>
          <span class="mc__scenario-disc-cat">${disc.category}</span>
        </div>
        <div class="mc__scenario-disc-title">${disc.title}</div>
        <p class="mc__scenario-disc-text">${disc.shortFact}</p>
        <button class="mc__scenario-disc-btn" data-disc-id="${disc.id}" type="button">
          <span>INVESTIGATE DISCOVERY</span>
          <span class="mc__scenario-disc-arrow">→</span>
        </button>
      </div>
    `;
  }

  /* -----------------------------------------------------------------
     Render Comparison Mode: Earth vs Moon vs Mars
     ----------------------------------------------------------------- */
  _renderComparisonMatrix() {
    if (!this._dom.comparisonBox) return;

    this._dom.comparisonBox.innerHTML = `
      <div class="mc__compare-grid">
        <div class="mc__compare-card">
          <div class="mc__compare-header" style="color: #38bdf8;">
            <h3>EARTH // TERRA-1</h3>
            <span class="mc__compare-sub">Origin &amp; Habitation Baseline</span>
          </div>
          <div class="mc__compare-table">
            <div class="mc__c-row"><span>Surface Gravity:</span><strong>9.807 m/s² (1.00 g)</strong></div>
            <div class="mc__c-row"><span>Round-Trip Latency:</span><strong>&lt; 0.24s (GEO)</strong></div>
            <div class="mc__c-row"><span>Atmospheric Pressure:</span><strong>1,013.25 hPa</strong></div>
            <div class="mc__c-row"><span>Solar Irradiance:</span><strong>1,361 W/m² (1.00 AU)</strong></div>
            <div class="mc__c-row"><span>Hohmann Transit Time:</span><strong>Baseline Home</strong></div>
            <div class="mc__c-row"><span>Radiation Shielding:</span><strong>Geomagnetic Dynamo</strong></div>
          </div>
        </div>

        <div class="mc__compare-card">
          <div class="mc__compare-header" style="color: #94a3b8;">
            <h3>MOON // LUNA-1</h3>
            <span class="mc__compare-sub">Deep Space Testbed / Gateway</span>
          </div>
          <div class="mc__compare-table">
            <div class="mc__c-row"><span>Surface Gravity:</span><strong>1.622 m/s² (0.17 g)</strong></div>
            <div class="mc__c-row"><span>Round-Trip Latency:</span><strong>2.56 seconds</strong></div>
            <div class="mc__c-row"><span>Atmospheric Pressure:</span><strong>&lt; 10⁻¹⁵ bar (Vacuum)</strong></div>
            <div class="mc__c-row"><span>Solar Irradiance:</span><strong>1,361 W/m² (1.00 AU)</strong></div>
            <div class="mc__c-row"><span>Transit Duration:</span><strong>~3.2 days (TLI)</strong></div>
            <div class="mc__c-row"><span>Radiation Shielding:</span><strong>Unshielded Surface</strong></div>
          </div>
        </div>

        <div class="mc__compare-card">
          <div class="mc__compare-header" style="color: #f97316;">
            <h3>MARS // ARES-1</h3>
            <span class="mc__compare-sub">Interplanetary Frontier Vector</span>
          </div>
          <div class="mc__compare-table">
            <div class="mc__c-row"><span>Surface Gravity:</span><strong>3.721 m/s² (0.38 g)</strong></div>
            <div class="mc__c-row"><span>Round-Trip Latency:</span><strong>6.1m to 44.6 minutes</strong></div>
            <div class="mc__c-row"><span>Atmospheric Pressure:</span><strong>6.1 hPa (CO₂)</strong></div>
            <div class="mc__c-row"><span>Solar Irradiance:</span><strong>589 W/m² (1.52 AU)</strong></div>
            <div class="mc__c-row"><span>Hohmann Transit Time:</span><strong>~259 days (8.5 mos)</strong></div>
            <div class="mc__c-row"><span>Radiation Shielding:</span><strong>Regolith Shelter Req.</strong></div>
          </div>
        </div>
      </div>
    `;
  }

  /* -----------------------------------------------------------------
     Entrance & Reveal Animations (GSAP)
     ----------------------------------------------------------------- */
  _animateEntrance() {
    if (this._reducedMotion) return;

    const cards = document.querySelectorAll('.mc__res-card, .mc__res-metric, .mc__explanation-card');
    if (cards.length > 0) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }
}
