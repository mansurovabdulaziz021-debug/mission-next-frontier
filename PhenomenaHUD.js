/**
 * PhenomenaHUD.js — Spatial Scientific Instrument Interface
 * 
 * Replaces traditional repetitive card layouts with:
 *   - Spatial Top Bar & Phenomenon Mode Selector (8 Signature Experiences)
 *   - In-Scene Spatial Callouts & Floating Telemetry Tags with Vector Leader Lines
 *   - Scientific Honesty Badges (REAL DATA / EDUCATIONAL VISUALIZATION / SIMPLIFIED MODEL)
 *   - Bottom Tactical Instrument Dock (Real-time parameter dials, scrubbers, probes)
 *   - Adaptive Quality Tier Switcher (HIGH / MED / LOW) & Audio Hooks bus
 */

import { phenomenaEngine, PHENOMENA_REGISTRY } from '../visualizations/PhenomenaEngine.js';
import { qualityManager, QUALITY_TIERS } from '../utils/QualityManager.js';
import { audioHooks } from '../utils/AudioHooks.js';
import { missionState } from '../state/MissionState.js';

export class PhenomenaHUD {
  constructor() {
    this.engine = phenomenaEngine;
    this.isOpen = false;

    this._initDOMElements();
    this._bindEngineEvents();
    this._bindUserEvents();
  }

  _initDOMElements() {
    this.container = document.getElementById('mc-phenomena-overlay');
    if (!this.container) return;

    // Header elements
    this.titleEl = document.getElementById('ph-title');
    this.subtitleEl = document.getElementById('ph-subtitle');
    this.badgeEl = document.getElementById('ph-badge');
    this.sourceEl = document.getElementById('ph-source');
    this.navContainer = document.getElementById('ph-nav-tabs');

    // Spatial Callout Panels (In-scene floating telemetry)
    this.spatialPanelLeft = document.getElementById('ph-spatial-left');
    this.spatialPanelRight = document.getElementById('ph-spatial-right');

    // Instrument Control Dock
    this.controlsContainer = document.getElementById('ph-instrument-controls');
    this.qualitySelector = document.getElementById('ph-quality-select');
    this.audioToggle = document.getElementById('ph-audio-toggle');
    this.closeBtn = document.getElementById('ph-close-btn');

    this._renderNavTabs();
    this._renderActivePhenomenon();
  }

  _renderNavTabs() {
    if (!this.navContainer) return;
    this.navContainer.innerHTML = '';

    Object.values(PHENOMENA_REGISTRY).forEach(p => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `ph__nav-tab ${p.id === this.engine.current.id ? 'ph__nav-tab--active' : ''}`;
      btn.dataset.phenomenon = p.id;
      btn.innerHTML = `
        <span class="ph__tab-idx">${p.index}</span>
        <span class="ph__tab-name">${p.name.split('//')[0].trim()}</span>
      `;
      btn.addEventListener('click', () => {
        this.engine.setPhenomenon(p.id);
      });
      this.navContainer.appendChild(btn);
    });
  }

  _bindEngineEvents() {
    this.engine.on('phenomenonChanged', () => {
      this._updateActiveNavTab();
      this._renderActivePhenomenon();
    });

    this.engine.on('paramChanged', () => {
      this._updateDynamicTelemetry();
    });

    qualityManager.onQualityChanged((tier) => {
      if (this.qualitySelector) {
        this.qualitySelector.value = tier.id;
      }
    });
  }

  _bindUserEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.hide();
      });
    }

    if (this.qualitySelector) {
      this.qualitySelector.addEventListener('change', (e) => {
        qualityManager.setTier(e.target.value);
        audioHooks.emit('qualityChanged', { tier: e.target.value });
      });
    }

    if (this.audioToggle) {
      this.audioToggle.addEventListener('click', () => {
        const nextMuted = !audioHooks.muted;
        audioHooks.setMuted(nextMuted);
        this.audioToggle.classList.toggle('ph__audio-toggle--active', !nextMuted);
        this.audioToggle.setAttribute('aria-pressed', (!nextMuted).toString());
        this.audioToggle.querySelector('.ph__audio-label').textContent = nextMuted ? 'AUDIO: MUTED' : 'AUDIO: ACTIVE';
      });
    }

    // Top-bar toggle button in Mission Control
    const toggleBtn = document.getElementById('mc-phenomena-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.toggle();
      });
    }
  }

  _updateActiveNavTab() {
    if (!this.navContainer) return;
    const tabs = this.navContainer.querySelectorAll('.ph__nav-tab');
    tabs.forEach(tab => {
      const isActive = tab.dataset.phenomenon === this.engine.current.id;
      tab.classList.toggle('ph__nav-tab--active', isActive);
      tab.setAttribute('aria-selected', isActive.toString());
    });
  }

  _renderActivePhenomenon() {
    const p = this.engine.current;
    if (!p) return;

    if (this.titleEl) this.titleEl.textContent = p.name;
    if (this.subtitleEl) this.subtitleEl.textContent = p.subtitle;
    if (this.badgeEl) {
      this.badgeEl.textContent = p.scientificBadge;
      this.badgeEl.className = `ph__badge ph__badge--${p.scientificBadge.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    }
    if (this.sourceEl) this.sourceEl.textContent = `${p.source} // ${p.dataset}`;

    this._renderSpatialPanels(p);
    this._renderInstrumentControls(p);
  }

  _renderSpatialPanels(p) {
    if (!this.spatialPanelLeft || !this.spatialPanelRight) return;

    // Left Spatial Panel: In-scene Telemetry Callout & Context
    let leftContent = '';
    if (p.id === 'COSMIC_SCALE') {
      const step = this.engine.getParam('scaleStep') || 'PLANET';
      const scaleData = p.scales.find(s => s.id === step) || p.scales[1];
      leftContent = `
        <div class="ph__spatial-node">
          <div class="ph__leader-line ph__leader-line--tl"></div>
          <span class="ph__spatial-tag">SPATIAL DIMENSION</span>
          <div class="ph__spatial-val">${scaleData.size}</div>
          <div class="ph__spatial-sub">${scaleData.power} // ${scaleData.metric}</div>
          <p class="ph__spatial-desc">${scaleData.analogy}</p>
        </div>
      `;
    } else if (p.id === 'LIGHT_TIME') {
      const target = this.engine.getParam('targetSource') || 'SUN';
      const targetData = p.targets[target];
      leftContent = `
        <div class="ph__spatial-node">
          <div class="ph__leader-line ph__leader-line--tl"></div>
          <span class="ph__spatial-tag">RELATIVISTIC LOOKBACK TIME</span>
          <div class="ph__spatial-val">${targetData.latency}</div>
          <div class="ph__spatial-sub">${targetData.distanceKm}</div>
          <div class="ph__time-split">
            <div class="ph__time-box ph__time-box--past">
              <span class="ph__time-kicker">OBSERVED TODAY</span>
              <p>${targetData.observedAs}</p>
            </div>
            <div class="ph__time-box ph__time-box--now">
              <span class="ph__time-kicker">SOURCE STATE RIGHT NOW</span>
              <p>${targetData.sourceNow}</p>
            </div>
          </div>
        </div>
      `;
    } else if (p.id === 'EXOPLANET_DETECTION') {
      leftContent = `
        <div class="ph__spatial-node">
          <div class="ph__leader-line ph__leader-line--tl"></div>
          <span class="ph__spatial-tag">PHOTOMETRIC TRANSIT SIGNATURE</span>
          <div class="ph__spatial-val">ΔF / F ≈ 1.32%</div>
          <div class="ph__spatial-sub">HOT JUPITER EXOPLANET</div>
          <p class="ph__spatial-desc">Periodic stellar eclipse blocks light proportional to (Rp / R★)². Synchronous Doppler shifts confirm stellar wobble.</p>
        </div>
      `;
    } else if (p.id === 'SPECTRUM_LAB') {
      const sourceKey = this.engine.getParam('sourceType') || 'SUN_G2V';
      const src = p.sources[sourceKey];
      leftContent = `
        <div class="ph__spatial-node">
          <div class="ph__leader-line ph__leader-line--tl"></div>
          <span class="ph__spatial-tag">SPECTROSCOPIC SOURCE</span>
          <div class="ph__spatial-val">${src.name}</div>
          <div class="ph__spatial-sub">EFFECTIVE TEMP: ${src.temp}</div>
          <p class="ph__spatial-desc">${src.nature}</p>
        </div>
      `;
    } else if (p.id === 'GRAVITY_FIELD') {
      const massKey = this.engine.getParam('sourceMass') || 'STELLAR_BLACK_HOLE_10M';
      const mass = p.massProfiles[massKey];
      leftContent = `
        <div class="ph__spatial-node">
          <div class="ph__leader-line ph__leader-line--tl"></div>
          <span class="ph__spatial-tag">WARPED METRIC DOMAIN</span>
          <div class="ph__spatial-val">${mass.name}</div>
          <div class="ph__spatial-sub">SCHWARZSCHILD RADIUS: ${mass.schwarzschildRadius}</div>
          <p class="ph__spatial-desc">${mass.physicsNote}</p>
        </div>
      `;
    } else if (p.id === 'SPACE_WEATHER') {
      const stateKey = this.engine.getParam('solarWindSpeed') || 'CORONAL_HOLE_FAST';
      const state = p.states[stateKey];
      leftContent = `
        <div class="ph__spatial-node">
          <div class="ph__leader-line ph__leader-line--tl"></div>
          <span class="ph__spatial-tag">HELIOSPHERIC SHOCK DYNAMICS</span>
          <div class="ph__spatial-val">${state.speed}</div>
          <div class="ph__spatial-sub">DYNAMIC PRESSURE: ${state.dynamicPressure}</div>
          <p class="ph__spatial-desc">${state.auroralActivity}</p>
        </div>
      `;
    } else if (p.id === 'SPACECRAFT_NAVIGATION') {
      const progress = this.engine.getParam('flightProgress') || 0.42;
      const day = Math.round(progress * 210);
      leftContent = `
        <div class="ph__spatial-node">
          <div class="ph__leader-line ph__leader-line--tl"></div>
          <span class="ph__spatial-tag">HOHMANN TRANSFER TIMELINE</span>
          <div class="ph__spatial-val">DAY ${String(day).padStart(3, '0')} // 210</div>
          <div class="ph__spatial-sub">HELIOCENTRIC TRANS-MARS CRUISE</div>
          <p class="ph__spatial-desc">Ballistic elliptical trajectory connecting Earth departure to Mars rendezvous.</p>
        </div>
      `;
    } else if (p.id === 'DATA_SCULPTURE') {
      const modeKey = this.engine.getParam('sculptureMode') || 'LIGO_GW150914';
      const mode = p.modes[modeKey];
      leftContent = `
        <div class="ph__spatial-node">
          <div class="ph__leader-line ph__leader-line--tl"></div>
          <span class="ph__spatial-tag">PARAMETRIC SCULPTURE FORM</span>
          <div class="ph__spatial-val">${mode.name}</div>
          <div class="ph__spatial-sub">${mode.formula}</div>
          <p class="ph__spatial-desc">${mode.meaning}</p>
        </div>
      `;
    }
    this.spatialPanelLeft.innerHTML = leftContent;

    // Right Spatial Panel: In-scene Derived Scientific Readouts
    let rightContent = '';
    if (p.id === 'COSMIC_SCALE') {
      rightContent = `
        <div class="ph__spatial-node ph__spatial-node--right">
          <div class="ph__leader-line ph__leader-line--tr"></div>
          <span class="ph__spatial-tag">OBSERVATION PRINCIPLE</span>
          <div class="ph__metric-row">
            <span class="ph__metric-k">SCALE RATIO:</span>
            <span class="ph__metric-v">1 : 10²¹ GLOBAL SPAN</span>
          </div>
          <div class="ph__metric-row">
            <span class="ph__metric-k">HUMAN IN UNIVERSE:</span>
            <span class="ph__metric-v">MIDPOINT OF LOG SCALE</span>
          </div>
          <div class="ph__metric-row">
            <span class="ph__metric-k">CALIBRATION:</span>
            <span class="ph__metric-v">POWERS OF TEN HIERARCHY</span>
          </div>
        </div>
      `;
    } else if (p.id === 'LIGHT_TIME') {
      rightContent = `
        <div class="ph__spatial-node ph__spatial-node--right">
          <div class="ph__leader-line ph__leader-line--tr"></div>
          <span class="ph__spatial-tag">FUNDAMENTAL INSIGHT</span>
          <div class="ph__highlight-quote">
            "WHAT WE SEE IS NEVER WHAT IS HAPPENING AT THE SOURCE RIGHT NOW."
          </div>
          <p class="ph__spatial-desc">The night sky is a living museum of staggered cosmic epochs, layered by light travel distances.</p>
        </div>
      `;
    } else if (p.id === 'EXOPLANET_DETECTION') {
      rightContent = `
        <div class="ph__spatial-node ph__spatial-node--right">
          <div class="ph__leader-line ph__leader-line--tr"></div>
          <span class="ph__spatial-tag">DERIVED EXOPLANET METRICS</span>
          <div class="ph__metric-row">
            <span class="ph__metric-k">EQUATION:</span>
            <span class="ph__metric-v">ΔF / F = (Rp / R★)²</span>
          </div>
          <div class="ph__metric-row">
            <span class="ph__metric-k">DOPPLER K:</span>
            <span class="ph__metric-v">± 14.8 m/s WOBBLE</span>
          </div>
          <div class="ph__metric-row">
            <span class="ph__metric-k">TRANSIT DURATION:</span>
            <span class="ph__metric-v">2h 45m</span>
          </div>
        </div>
      `;
    } else if (p.id === 'SPECTRUM_LAB') {
      const wl = this.engine.getParam('wavelengthProbe') || 589;
      const energyEV = (1239.84 / wl).toFixed(2);
      rightContent = `
        <div class="ph__spatial-node ph__spatial-node--right">
          <div class="ph__leader-line ph__leader-line--tr"></div>
          <span class="ph__spatial-tag">QUANTUM PHOTON PROBE</span>
          <div class="ph__metric-row">
            <span class="ph__metric-k">WAVELENGTH (λ):</span>
            <span class="ph__metric-v">${wl} nm</span>
          </div>
          <div class="ph__metric-row">
            <span class="ph__metric-k">PHOTON ENERGY (E=hν):</span>
            <span class="ph__metric-v">${energyEV} eV</span>
          </div>
          <div class="ph__metric-row">
            <span class="ph__metric-k">SPECTRAL REGIME:</span>
            <span class="ph__metric-v">${wl < 400 ? 'NEAR-UV' : (wl > 700 ? 'NEAR-IR' : 'VISIBLE OPTICAL')}</span>
          </div>
        </div>
      `;
    } else if (p.id === 'GRAVITY_FIELD') {
      rightContent = `
        <div class="ph__spatial-node ph__spatial-node--right">
          <div class="ph__leader-line ph__leader-line--tr"></div>
          <span class="ph__spatial-tag">RELATIVISTIC GEODESICS</span>
          <div class="ph__metric-row">
            <span class="ph__metric-k">BENDING ANGLE:</span>
            <span class="ph__metric-v">θ = 4GM / c²b</span>
          </div>
          <div class="ph__metric-row">
            <span class="ph__metric-k">PHOTON SPHERE:</span>
            <span class="ph__metric-v">r = 1.5 Rs (UNSTABLE ORBIT)</span>
          </div>
          <div class="ph__metric-row">
            <span class="ph__metric-k">OPTICAL EFFECT:</span>
            <span class="ph__metric-v">EINSTEIN RING LENSING</span>
          </div>
        </div>
      `;
    } else if (p.id === 'SPACE_WEATHER') {
      rightContent = `
        <div class="ph__spatial-node ph__spatial-node--right">
          <div class="ph__leader-line ph__leader-line--tr"></div>
          <span class="ph__spatial-tag">MAGNETOSPHERIC TELEMETRY</span>
          <div class="ph__metric-row">
            <span class="ph__metric-k">BOW SHOCK STANDOFF:</span>
            <span class="ph__metric-v">~ 8.5 EARTH RADII</span>
          </div>
          <div class="ph__metric-row">
            <span class="ph__metric-k">AURORAL EMISSION:</span>
            <span class="ph__metric-v">[O I] 557.7 nm (GREEN)</span>
          </div>
          <div class="ph__metric-row">
            <span class="ph__metric-k">IMF RECONNECTION:</span>
            <span class="ph__metric-v">SOUTHWARD B_z ACTIVE</span>
          </div>
        </div>
      `;
    } else if (p.id === 'SPACECRAFT_NAVIGATION') {
      rightContent = `
        <div class="ph__spatial-node ph__spatial-node--right">
          <div class="ph__leader-line ph__leader-line--tr"></div>
          <span class="ph__spatial-tag">MISSION DELTA-V BUDGET</span>
          <div class="ph__metric-row">
            <span class="ph__metric-k">TMI ESCAPE BURN:</span>
            <span class="ph__metric-v">+ 3,600 m/s</span>
          </div>
          <div class="ph__metric-row">
            <span class="ph__metric-k">MID-COURSE CORR:</span>
            <span class="ph__metric-v">+ 28 m/s</span>
          </div>
          <div class="ph__metric-row">
            <span class="ph__metric-k">MOI CAPTURE BURN:</span>
            <span class="ph__metric-v">- 2,080 m/s</span>
          </div>
        </div>
      `;
    } else if (p.id === 'DATA_SCULPTURE') {
      rightContent = `
        <div class="ph__spatial-node ph__spatial-node--right">
          <div class="ph__leader-line ph__leader-line--tr"></div>
          <span class="ph__spatial-tag">TELEMETRY SCULPTING LOGIC</span>
          <div class="ph__metric-row">
            <span class="ph__metric-k">MAPPING:</span>
            <span class="ph__metric-v">AMPLITUDE → Z DEFORMATION</span>
          </div>
          <div class="ph__metric-row">
            <span class="ph__metric-k">FREQUENCY:</span>
            <span class="ph__metric-v">TIME-DEPENDENT PHASE</span>
          </div>
          <div class="ph__metric-row">
            <span class="ph__metric-k">PURPOSE:</span>
            <span class="ph__metric-v">NON-CARD SPATIAL DATA</span>
          </div>
        </div>
      `;
    }
    this.spatialPanelRight.innerHTML = rightContent;
  }

  _renderInstrumentControls(p) {
    if (!this.controlsContainer) return;
    this.controlsContainer.innerHTML = '';

    if (!p.parameters || p.parameters.length === 0) return;

    p.parameters.forEach(param => {
      const val = this.engine.getParam(param.id) !== undefined ? this.engine.getParam(param.id) : param.default;
      const cBox = document.createElement('div');
      cBox.className = 'ph__control-item';

      if (param.type === 'select') {
        cBox.innerHTML = `
          <label class="ph__ctrl-label" for="ph-ctrl-${param.id}">${param.label}:</label>
          <select id="ph-ctrl-${param.id}" class="ph__ctrl-select">
            ${param.options.map(opt => `<option value="${opt}" ${opt === val ? 'selected' : ''}>${opt.replace(/_/g, ' ')}</option>`).join('')}
          </select>
        `;
        const select = cBox.querySelector('select');
        select.addEventListener('change', (e) => {
          this.engine.setParam(param.id, e.target.value);
        });
      } else if (param.type === 'range') {
        cBox.innerHTML = `
          <div class="ph__ctrl-header">
            <label class="ph__ctrl-label" for="ph-ctrl-${param.id}">${param.label}:</label>
            <span id="ph-val-${param.id}" class="ph__ctrl-val">${val}</span>
          </div>
          <input id="ph-ctrl-${param.id}" class="ph__ctrl-slider" type="range" min="${param.min}" max="${param.max}" step="${param.step}" value="${val}" />
        `;
        const slider = cBox.querySelector('input');
        const valSpan = cBox.querySelector(`#ph-val-${param.id}`);
        slider.addEventListener('input', (e) => {
          valSpan.textContent = e.target.value;
          this.engine.setParam(param.id, e.target.value);
        });
      } else if (param.type === 'checkbox') {
        cBox.innerHTML = `
          <label class="ph__ctrl-checkbox-label">
            <input id="ph-ctrl-${param.id}" type="checkbox" ${val ? 'checked' : ''} />
            <span>${param.label}</span>
          </label>
        `;
        const checkbox = cBox.querySelector('input');
        checkbox.addEventListener('change', (e) => {
          this.engine.setParam(param.id, e.target.checked);
        });
      }

      this.controlsContainer.appendChild(cBox);
    });
  }

  _updateDynamicTelemetry() {
    this._renderSpatialPanels(this.engine.current);
  }

  show() {
    if (!this.container) return;
    this.isOpen = true;
    this.container.classList.add('mc__phenomena--visible');
    this.container.setAttribute('aria-hidden', 'false');
    missionState.emit('enterPhenomena');
    audioHooks.emit('sceneEnter', { scene: 'phenomena' });
  }

  hide() {
    if (!this.container) return;
    this.isOpen = false;
    this.container.classList.remove('mc__phenomena--visible');
    this.container.setAttribute('aria-hidden', 'true');
    missionState.emit('exitPhenomena');
    audioHooks.emit('transitionComplete', { scene: 'missionControl' });
  }

  toggle() {
    if (this.isOpen) this.hide();
    else this.show();
  }
}
