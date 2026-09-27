/**
 * ScientificDataHUD — NASA Data Intelligence Presentation Layer
 * Coordinates authoritative scientific data presentation, comparative visualizations,
 * source transparency inspection, and progressive GSAP data reveals.
 */

import gsap from 'gsap';
import { missionState } from '../state/MissionState.js';
import { nasaDataService, DATA_STATES } from '../data/NasaDataService.js';
import { SCIENTIFIC_DATA, SCIENTIFIC_SOURCES } from '../data/scientificData.js';

export class ScientificDataHUD {
  constructor() {
    this._currentDestId = 'EARTH';
    this._activeFilter = 'ALL';
    this._userMassKg = 75;
    this._isOpen = false;
    this._dataState = DATA_STATES.IDLE;
    this._currentData = null;
    this._dynamicAttrs = null;

    this._reducedMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this._dom = {
      panel: document.getElementById('mc-science-panel'),
      toggleBtn: document.getElementById('mc-science-toggle'),
      sourcesBtn: document.getElementById('mc-sources-btn'),
      statusBadge: document.getElementById('mc-science-status'),
      provenanceTag: document.getElementById('mc-science-provenance'),
      destName: document.getElementById('mc-science-dest-name'),
      destClass: document.getElementById('mc-science-dest-class'),
      metricsContainer: document.getElementById('mc-science-metrics'),
      filterTabs: document.querySelectorAll('.mc__science-tab'),
      gravityContainer: document.getElementById('mc-gravity-vis'),
      scaleContainer: document.getElementById('mc-scale-vis'),
      atmoContainer: document.getElementById('mc-atmo-vis'),
      sourceModal: document.getElementById('mc-source-modal'),
      sourceModalBody: document.getElementById('mc-source-modal-body'),
      sourceModalClose: document.getElementById('mc-source-modal-close'),
      massInput: document.getElementById('mc-mass-input'),
      massDisplay: document.getElementById('mc-mass-val')
    };

    this._bindEvents();
  }

  /* -----------------------------------------------------------------
     DOM Event Wiring
     ----------------------------------------------------------------- */
  _bindEvents() {
    // Panel Toggle
    if (this._dom.toggleBtn) {
      this._dom.toggleBtn.addEventListener('click', () => {
        this.togglePanel();
      });
    }

    // Sources Catalog Modal Button
    if (this._dom.sourcesBtn) {
      this._dom.sourcesBtn.addEventListener('click', () => {
        this.openAllSourcesInspector();
      });
    }

    // Modal Close Button
    if (this._dom.sourceModalClose) {
      this._dom.sourceModalClose.addEventListener('click', () => {
        this.closeSourceModal();
      });
    }

    // Backdrop Click Close
    if (this._dom.sourceModal) {
      this._dom.sourceModal.addEventListener('click', (e) => {
        if (e.target === this._dom.sourceModal) {
          this.closeSourceModal();
        }
      });
    }

    // Category Filter Tabs
    this._dom.filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filter = tab.getAttribute('data-filter') || 'ALL';
        this._setFilter(filter);
      });
    });

    // Mass Input Simulator for Gravity Calculator
    if (this._dom.massInput) {
      this._dom.massInput.addEventListener('input', (e) => {
        const val = parseFloat(/** @type {HTMLInputElement} */ (e.target).value) || 75;
        this._userMassKg = val;
        if (this._dom.massDisplay) {
          this._dom.massDisplay.textContent = `${val} kg`;
        }
        this._renderGravityComparison();
      });
    }

    // Subscribe to MissionState Destination changes
    missionState.on('destinationChanged', (dest) => {
      this.loadDestination(dest.id);
    });

    // Keyboard ESC closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._dom.sourceModal?.classList.contains('mc__source-modal--open')) {
        this.closeSourceModal();
      }
    });

    // Initial load
    this.loadDestination(missionState.activeDestination || 'EARTH');
  }

  /* -----------------------------------------------------------------
     Panel Toggle & Progressive Entrance
     ----------------------------------------------------------------- */
  togglePanel() {
    this._isOpen = !this._isOpen;
    if (this._dom.panel) {
      this._dom.panel.classList.toggle('mc__science-panel--open', this._isOpen);
      this._dom.panel.setAttribute('aria-hidden', String(!this._isOpen));
    }
    if (this._dom.toggleBtn) {
      this._dom.toggleBtn.classList.toggle('mc__science-toggle--active', this._isOpen);
      this._dom.toggleBtn.setAttribute('aria-expanded', String(this._isOpen));
    }

    if (this._isOpen) {
      this.animateDataReveal();
    }
  }

  get isOpen() {
    return this._isOpen;
  }

  close() {
    if (this._isOpen) {
      this.togglePanel();
    }
  }

  toggle() {
    this.togglePanel();
  }

  _setFilter(filter) {
    this._activeFilter = filter;
    this._dom.filterTabs.forEach((t) => {
      const isMatch = (t.getAttribute('data-filter') || 'ALL') === filter;
      t.classList.toggle('mc__science-tab--active', isMatch);
      t.setAttribute('aria-selected', String(isMatch));
    });
    this._renderMetrics();
    this.animateDataReveal();
  }

  /* -----------------------------------------------------------------
     Destination Data Loading & Synchronization
     ----------------------------------------------------------------- */
  async loadDestination(destId) {
    this._currentDestId = destId;

    // Show loading state on badge
    if (this._dom.statusBadge) {
      this._dom.statusBadge.textContent = 'SYNCING NASA DATA…';
      this._dom.statusBadge.className = 'mc__science-status mc__science-status--loading';
    }

    try {
      const res = await nasaDataService.getDestinationData(destId);
      this._dataState = res.status;
      this._currentData = res.data;
      this._dynamicAttrs = res.dynamicAttrs;

      this._updateHeader(res);
      this._renderMetrics();
      this._renderGravityComparison();
      this._renderScaleComparator();
      this._renderAtmosphericMatrix();

      if (this._isOpen) {
        this.animateDataReveal();
      }
    } catch {
      // Guaranteed fallback to verified static
      this._dataState = DATA_STATES.OFFLINE_FALLBACK;
      this._currentData = SCIENTIFIC_DATA[destId] || SCIENTIFIC_DATA.EARTH;
      this._updateHeader({
        status: DATA_STATES.OFFLINE_FALLBACK,
        sourceType: 'VERIFIED_NASA_STATIC',
        provenance: 'NASA GSFC NSSDC Verified Local Archive (Network Offline)',
        epoch: new Date().toISOString()
      });
      this._renderMetrics();
      this._renderGravityComparison();
      this._renderScaleComparator();
      this._renderAtmosphericMatrix();
    }
  }

  /**
   * @param {{
   *   status: string,
   *   sourceType: string,
   *   provenance: string,
   *   epoch: string
   * }} meta
   */
  _updateHeader(meta) {
    if (!this._currentData) return;

    if (this._dom.destName) {
      this._dom.destName.textContent = this._currentData.displayName;
    }
    if (this._dom.destClass) {
      this._dom.destClass.textContent = this._currentData.classification;
    }

    if (this._dom.statusBadge) {
      if (meta.status === DATA_STATES.SUCCESS_DYNAMIC) {
        this._dom.statusBadge.textContent = '● DYNAMIC // JPL HORIZONS API (LIVE)';
        this._dom.statusBadge.className = 'mc__science-status mc__science-status--live';
      } else {
        this._dom.statusBadge.textContent = '◈ VERIFIED STATIC // NASA GSFC ARCHIVE';
        this._dom.statusBadge.className = 'mc__science-status mc__science-status--verified';
      }
    }

    if (this._dom.provenanceTag) {
      this._dom.provenanceTag.textContent = `${meta.provenance} • Verified: ${meta.epoch.slice(0, 10)}`;
    }
  }

  /* -----------------------------------------------------------------
     Render Scientific Metrics Matrix
     ----------------------------------------------------------------- */
  _renderMetrics() {
    if (!this._dom.metricsContainer || !this._currentData) return;

    const metrics = this._currentData.metrics.filter((m) => {
      if (this._activeFilter === 'ALL') return true;
      return m.category === this._activeFilter;
    });

    if (metrics.length === 0) {
      this._dom.metricsContainer.innerHTML = `
        <div class="mc__science-empty">No telemetry records matching category ${this._activeFilter}.</div>
      `;
      return;
    }

    this._dom.metricsContainer.innerHTML = metrics
      .map((m) => {
        return `
          <div class="mc__metric-card" data-metric-id="${m.id}">
            <div class="mc__metric-header">
              <div class="mc__metric-meta">
                <span class="mc__metric-category">${m.category}</span>
                <span class="mc__metric-label">${m.label}</span>
              </div>
              <button class="mc__metric-src-btn" type="button" data-src-id="${m.source.id}" data-metric-id="${m.id}" title="Inspect NASA source provenance">
                SRC ↗
              </button>
            </div>

            <div class="mc__metric-val-row">
              <span class="mc__metric-value">${m.value}</span>
              <span class="mc__metric-unit">${m.unit}</span>
            </div>

            <div class="mc__meaning-box">
              <div class="mc__meaning-row">
                <span class="mc__meaning-tag">PHYSICAL CONTEXT:</span>
                <span class="mc__meaning-text">${m.meaning.value}</span>
              </div>
              <div class="mc__meaning-row">
                <span class="mc__meaning-tag">WHAT IT MEANS:</span>
                <span class="mc__meaning-text">${m.meaning.whatItMeans}</span>
              </div>
              <div class="mc__meaning-row mc__meaning-row--highlight">
                <span class="mc__meaning-tag">WHY IT MATTERS:</span>
                <span class="mc__meaning-text">${m.meaning.whyItMatters}</span>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    // Attach click events to all [SRC] buttons
    this._dom.metricsContainer.querySelectorAll('.mc__metric-src-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const srcId = btn.getAttribute('data-src-id');
        const metricId = btn.getAttribute('data-metric-id');
        const metric = this._currentData?.metrics.find((x) => x.id === metricId);
        if (srcId && metric) {
          this.openSourceInspector(srcId, metric);
        }
      });
    });
  }

  /* -----------------------------------------------------------------
     Scientific Visualization 1: Gravity Comparison & Weight Simulator
     ----------------------------------------------------------------- */
  _renderGravityComparison() {
    if (!this._dom.gravityContainer) return;

    const bodies = [
      { id: 'EARTH', name: 'Earth (Baseline)', g: 9.807, ratio: 1.0, color: '#38bdf8' },
      { id: 'MARS',  name: 'Mars (Ares)',      g: 3.721, ratio: 0.379, color: '#f97316' },
      { id: 'MOON',  name: 'Moon (Luna)',      g: 1.622, ratio: 0.165, color: '#94a3b8' }
    ];

    const currentG = bodies.find((b) => b.id === this._currentDestId)?.g || 9.807;
    const userMass = this._userMassKg || 75;

    this._dom.gravityContainer.innerHTML = `
      <div class="mc__vis-card">
        <div class="mc__vis-title">
          <span>SURFACE GRAVITATIONAL ACCELERATION &amp; WEIGHT SIMULATION</span>
          <span class="mc__vis-tag">COMPARATIVE MECHANICS</span>
        </div>

        <div class="mc__gravity-bars">
          ${bodies
            .map((b) => {
              const weightN = (userMass * b.g).toFixed(1);
              const weightKgf = (userMass * b.ratio).toFixed(1);
              const jumpMult = (1 / b.ratio).toFixed(1);
              const isSelected = b.id === this._currentDestId;

              return `
              <div class="mc__grav-row ${isSelected ? 'mc__grav-row--active' : ''}">
                <div class="mc__grav-label-group">
                  <span class="mc__grav-name">${b.name}</span>
                  <span class="mc__grav-accel">${b.g.toFixed(3)} m/s² (${(b.ratio * 100).toFixed(1)}% G)</span>
                </div>
                <div class="mc__grav-track">
                  <div class="mc__grav-fill" style="width: ${(b.ratio * 100).toFixed(1)}%; background: ${b.color};"></div>
                </div>
                <div class="mc__grav-calc">
                  <span class="mc__calc-val">${weightKgf} kgf</span>
                  <span class="mc__calc-sub">(${weightN} N • Jump: ${jumpMult}x)</span>
                </div>
              </div>
            `;
            })
            .join('')}
        </div>

        <div class="mc__vis-insight">
          <span class="mc__insight-icon">ℹ</span>
          <span>
            At ${currentG.toFixed(3)} m/s², an astronaut mass of <strong>${userMass} kg</strong> exerts
            <strong>${(userMass * (currentG / 9.807)).toFixed(1)} kgf</strong> on the surface.
            Human musculoskeletal loading scales directly with this ratio.
          </span>
        </div>
      </div>
    `;
  }

  /* -----------------------------------------------------------------
     Scientific Visualization 2: True Physical Scale vs Visualization Scale
     ----------------------------------------------------------------- */
  _renderScaleComparator() {
    if (!this._dom.scaleContainer || !this._currentData) return;

    const data = this._currentData;
    const earthR = 6371.0;
    const bodyR = data.truePhysicalRadiusKm || 6371.0;
    const ratioToEarth = (bodyR / earthR) * 100;

    this._dom.scaleContainer.innerHTML = `
      <div class="mc__vis-card">
        <div class="mc__vis-title">
          <span>PHYSICAL GEOMETRY VS. VISUALIZATION SCALING</span>
          <span class="mc__vis-tag">SPATIAL CALIBRATION</span>
        </div>

        <div class="mc__scale-grid">
          <div class="mc__scale-item">
            <span class="mc__scale-k">TRUE VOLUMETRIC RADIUS:</span>
            <span class="mc__scale-v">${bodyR.toLocaleString()} km (${(ratioToEarth).toFixed(1)}% Earth)</span>
          </div>
          <div class="mc__scale-item">
            <span class="mc__scale-k">EQUATORIAL DIAMETER:</span>
            <span class="mc__scale-v">${(bodyR * 2).toLocaleString()} km</span>
          </div>
          <div class="mc__scale-item">
            <span class="mc__scale-k">3D VIEWPORT RENDER SCALE:</span>
            <span class="mc__scale-v">${data.visScaleFactor}</span>
          </div>
          <div class="mc__scale-item">
            <span class="mc__scale-k">DISTANCE CALIBRATION:</span>
            <span class="mc__scale-v">${data.visScaleRatioToReal}</span>
          </div>
        </div>

        <div class="mc__vis-insight">
          <span class="mc__insight-icon">⚖</span>
          <span>
            <strong>Scientifically Grounded Scaling Note:</strong> Natural interplanetary distances exceed planetary diameters by orders of magnitude (e.g. Earth-Sun is ~23,455 Earth radii).
            The 3D environment maintains exact physical proportions in data readouts while applying calibrated visual logarithmic spacing to enable simultaneous multi-body spatial navigation.
          </span>
        </div>
      </div>
    `;
  }

  /* -----------------------------------------------------------------
     Scientific Visualization 3: Atmospheric Pressure & Composition
     ----------------------------------------------------------------- */
  _renderAtmosphericMatrix() {
    if (!this._dom.atmoContainer || !this._currentData) return;

    const gases = this._currentData.atmosphericGases || [];
    const destId = this._currentDestId;

    let pressureNote = '';
    let armstrongAlert = false;

    if (destId === 'EARTH') {
      pressureNote = 'Standard 1,013.25 hPa (1.00 atm). Sustains liquid oceans; well above Armstrong limit (63 hPa).';
    } else if (destId === 'MARS') {
      pressureNote = 'Mean 6.1 hPa (0.006 atm). Extreme low pressure: BREACHES ARMSTRONG LIMIT (63 hPa). Exposed body fluids boil at 37°C. Full pressure suit mandatory.';
      armstrongAlert = true;
    } else if (destId === 'MOON') {
      pressureNote = 'Surface Exosphere (<3 × 10⁻¹⁵ bar). Hard vacuum. Zero aerodynamic drag; pure rocket reaction landing required.';
      armstrongAlert = true;
    } else {
      pressureNote = 'Heliospheric coronal plasma / solar wind corridor.';
    }

    this._dom.atmoContainer.innerHTML = `
      <div class="mc__vis-card">
        <div class="mc__vis-title">
          <span>ATMOSPHERIC COMPOSITION &amp; PRESSURE REGIME</span>
          <span class="mc__vis-tag">BAROMETRIC MATRIX</span>
        </div>

        <div class="mc__atmo-status-box ${armstrongAlert ? 'mc__atmo-status-box--alert' : ''}">
          <span class="mc__atmo-status-tag">${armstrongAlert ? '⚠ PHYSIOLOGICAL LIMIT' : '✓ HABITABLE PRESSURE'}</span>
          <p class="mc__atmo-status-text">${pressureNote}</p>
        </div>

        ${
          gases.length > 0
            ? `
          <div class="mc__gas-track">
            ${gases
              .map(
                (g) => `
              <div class="mc__gas-segment" style="width: ${g.pct}%; background: ${g.color};" title="${g.gas}: ${g.pct}%"></div>
            `
              )
              .join('')}
          </div>

          <div class="mc__gas-legend">
            ${gases
              .map(
                (g) => `
              <div class="mc__gas-legend-item">
                <span class="mc__gas-legend-color" style="background: ${g.color};"></span>
                <span class="mc__gas-legend-name">${g.gas}:</span>
                <span class="mc__gas-legend-pct">${g.pct}%</span>
              </div>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  /* -----------------------------------------------------------------
     Source Transparency Inspector (Modal / Drawer)
     ----------------------------------------------------------------- */
  openSourceInspector(sourceId, metric) {
    const src = SCIENTIFIC_SOURCES[sourceId] || metric.source;
    if (!this._dom.sourceModal || !this._dom.sourceModalBody) return;

    this._dom.sourceModalBody.innerHTML = `
      <div class="mc__src-detail">
        <div class="mc__src-header">
          <div class="mc__src-badge">AUTHORITATIVE NASA / JPL DATASET</div>
          <h3 class="mc__src-title">${metric.label}</h3>
          <div class="mc__src-val-highlight">${metric.value} ${metric.unit}</div>
        </div>

        <div class="mc__src-table">
          <div class="mc__src-row">
            <span class="mc__src-k">ORIGINATING ENTITY:</span>
            <span class="mc__src-v">${src.org}</span>
          </div>
          <div class="mc__src-row">
            <span class="mc__src-k">PRINCIPAL INVESTIGATOR / CURATOR:</span>
            <span class="mc__src-v">${src.author}</span>
          </div>
          <div class="mc__src-row">
            <span class="mc__src-k">DOCUMENT TITLE:</span>
            <span class="mc__src-v">${src.title}</span>
          </div>
          <div class="mc__src-row">
            <span class="mc__src-k">ARCHIVE REFERENCE ID:</span>
            <span class="mc__src-v">${src.ref}</span>
          </div>
          <div class="mc__src-row">
            <span class="mc__src-k">VERIFICATION EPOCH:</span>
            <span class="mc__src-v">${src.verifiedEpoch}</span>
          </div>
          <div class="mc__src-row">
            <span class="mc__src-k">OFFICIAL URL:</span>
            <span class="mc__src-v">
              <a href="${src.url}" target="_blank" rel="noopener noreferrer" class="mc__src-link">
                ${src.url} ↗
              </a>
            </span>
          </div>
        </div>

        <div class="mc__src-rationale">
          <div class="mc__rationale-block">
            <span class="mc__rationale-tag">PHYSICAL MEASUREMENT REALITY:</span>
            <p>${metric.meaning.value}</p>
          </div>
          <div class="mc__rationale-block">
            <span class="mc__rationale-tag">SCIENTIFIC SIGNIFICANCE:</span>
            <p>${metric.meaning.whatItMeans}</p>
          </div>
          <div class="mc__rationale-block">
            <span class="mc__rationale-tag">MISSION EXPLORATION IMPACT:</span>
            <p>${metric.meaning.whyItMatters}</p>
          </div>
        </div>
      </div>
    `;

    this._dom.sourceModal.classList.add('mc__source-modal--open');
    this._dom.sourceModal.setAttribute('aria-hidden', 'false');
  }

  openAllSourcesInspector() {
    if (!this._dom.sourceModal || !this._dom.sourceModalBody) return;

    const sources = Object.values(SCIENTIFIC_SOURCES);

    this._dom.sourceModalBody.innerHTML = `
      <div class="mc__src-detail">
        <div class="mc__src-header">
          <div class="mc__src-badge">FULL NASA / JPL SOURCE CATALOGUE</div>
          <h3 class="mc__src-title">Authoritative Scientific References</h3>
          <p class="mc__src-desc">
            All parameters incorporated into MISSION // NEXT FRONTIER are grounded in verified datasets
            published by NASA Goddard Space Flight Center, NASA Jet Propulsion Laboratory, and the Planetary Data System.
          </p>
        </div>

        <div class="mc__src-catalogue">
          ${sources
            .map(
              (s) => `
            <div class="mc__cat-card">
              <div class="mc__cat-org">${s.org}</div>
              <h4 class="mc__cat-title">${s.title}</h4>
              <div class="mc__cat-author">${s.author}</div>
              <div class="mc__cat-ref">Ref: ${s.ref} • Epoch: ${s.verifiedEpoch}</div>
              <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="mc__src-link">
                Visit Official NASA Page ↗
              </a>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    this._dom.sourceModal.classList.add('mc__source-modal--open');
    this._dom.sourceModal.setAttribute('aria-hidden', 'false');
  }

  closeSourceModal() {
    if (this._dom.sourceModal) {
      this._dom.sourceModal.classList.remove('mc__source-modal--open');
      this._dom.sourceModal.setAttribute('aria-hidden', 'true');
    }
  }

  /* -----------------------------------------------------------------
     Progressive Data Reveal Motion (GSAP)
     ----------------------------------------------------------------- */
  animateDataReveal() {
    if (this._reducedMotion) return;

    // Subtle progressive reveal for metric cards
    const cards = document.querySelectorAll('.mc__metric-card');
    if (cards.length > 0) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.05,
          ease: 'power2.out'
        }
      );
    }

    // Gauge bar animation
    const fills = document.querySelectorAll('.mc__grav-fill');
    if (fills.length > 0) {
      gsap.fromTo(
        fills,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }
}
