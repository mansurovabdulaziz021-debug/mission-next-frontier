/**
 * PHASE 6 — DeepSpaceHUD.js
 *
 * UI overlay for the "Beyond the Solar System" experience.
 * Provides:
 *  - Cosmic Scale indicator bar
 *  - Deep Space Object Explorer panel
 *  - Object Focus detail view
 *  - Category filter tabs
 *  - Navigation breadcrumb (Solar System ← → Deep Space)
 */

import { DEEP_SPACE_OBJECTS, DEEP_SPACE_CATEGORIES, COSMIC_SCALE_LABELS } from '../data/deepSpaceData.js';
import { missionState } from '../state/MissionState.js';

export class DeepSpaceHUD {
  constructor() {
    this._activeCategory = 'ALL';
    this._focusedObject = null;
    this._isExplorerOpen = false;
    this._visible = false;

    this._cacheElements();
    this._bindEvents();
  }

  /* ─── DOM Element Cache ─── */
  _cacheElements() {
    // Scale bar
    this._scaleBar = document.getElementById('mc-cosmic-scale-bar');
    this._scaleIndicator = document.getElementById('mc-scale-indicator');
    this._scaleLabel = document.getElementById('mc-scale-label');

    // Deep space navigation
    this._deepSpaceBtn = document.getElementById('mc-deep-space-btn');
    this._returnSolarBtn = document.getElementById('mc-return-solar-btn');

    // Explorer panel
    this._explorerPanel = document.getElementById('mc-deep-space-explorer');
    this._explorerGrid = document.getElementById('mc-ds-explorer-grid');
    this._explorerTabs = document.querySelectorAll('.mc__ds-tab');

    // Focus panel
    this._focusPanel = document.getElementById('mc-ds-focus-panel');
    this._focusClose = document.getElementById('mc-ds-focus-close');

    // Focus content elements
    this._focusName = document.getElementById('mc-ds-focus-name');
    this._focusDesig = document.getElementById('mc-ds-focus-designation');
    this._focusType = document.getElementById('mc-ds-focus-type');
    this._focusDist = document.getElementById('mc-ds-focus-distance');
    this._focusMetrics = document.getElementById('mc-ds-focus-metrics');
    this._focusTwist = document.getElementById('mc-ds-focus-twist');
    this._focusHumanity = document.getElementById('mc-ds-focus-humanity');
    this._focusSourceTag = document.getElementById('mc-ds-focus-source-tag');
    this._focusSourceTitle = document.getElementById('mc-ds-focus-source-title');
    this._focusSourceLink = document.getElementById('mc-ds-focus-source-link');
  }

  /* ─── Event Binding ─── */
  _bindEvents() {
    // Deep space explore button
    this._deepSpaceBtn?.addEventListener('click', () => {
      missionState.emit('enterDeepSpace');
    });

    // Return to Solar System
    this._returnSolarBtn?.addEventListener('click', () => {
      this.closeFocusPanel();
      missionState.emit('exitDeepSpace');
    });

    // Category tabs
    for (const tab of this._explorerTabs) {
      tab.addEventListener('click', () => {
        this._setActiveCategory(tab.dataset.dsCat);
      });
    }

    // Close focus panel
    this._focusClose?.addEventListener('click', () => {
      this.closeFocusPanel();
    });

    // Listen for deep space object selection
    missionState.on('deepSpaceObjectSelected', (obj) => {
      this.showFocusPanel(obj);
    });
  }

  /* ─── Category Filtering ─── */
  _setActiveCategory(cat) {
    this._activeCategory = cat;
    for (const tab of this._explorerTabs) {
      const isActive = tab.dataset.dsCat === cat;
      tab.classList.toggle('mc__ds-tab--active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    }
    this._renderExplorerGrid();
  }

  /* ─── Explorer Grid Rendering ─── */
  _renderExplorerGrid() {
    if (!this._explorerGrid) return;

    const items = this._activeCategory === 'ALL'
      ? DEEP_SPACE_OBJECTS
      : DEEP_SPACE_OBJECTS.filter(o => o.category === this._activeCategory);

    this._explorerGrid.innerHTML = items.map(obj => {
      const cat = DEEP_SPACE_CATEGORIES[obj.category];
      return `
        <button class="mc__ds-card" data-ds-id="${obj.id}" type="button"
                aria-label="Explore ${obj.name}">
          <div class="mc__ds-card-header">
            <span class="mc__ds-card-icon" style="color:${cat.color}">${cat.icon}</span>
            <span class="mc__ds-card-cat">${cat.label}</span>
          </div>
          <h4 class="mc__ds-card-name">${obj.name}</h4>
          <div class="mc__ds-card-type">${obj.type}</div>
          <div class="mc__ds-card-dist">
            <span class="mc__ds-card-dist-label">DISTANCE</span>
            <span class="mc__ds-card-dist-val">${obj.distance}</span>
          </div>
          <div class="mc__ds-card-action">
            <span>ENGAGE TARGET →</span>
          </div>
        </button>`;
    }).join('');

    // Bind card clicks
    const cards = this._explorerGrid.querySelectorAll('.mc__ds-card');
    for (const card of cards) {
      card.addEventListener('click', () => {
        const id = card.dataset.dsId;
        const obj = DEEP_SPACE_OBJECTS.find(o => o.id === id);
        if (obj) {
          missionState.emit('deepSpaceObjectSelected', obj);
        }
      });
    }
  }

  /* ─── Focus Panel ─── */
  showFocusPanel(obj) {
    if (!obj || !this._focusPanel) return;
    this._focusedObject = obj;
    const cat = DEEP_SPACE_CATEGORIES[obj.category];

    if (this._focusName) this._focusName.textContent = obj.name;
    if (this._focusDesig) this._focusDesig.textContent = obj.designation;
    if (this._focusType) {
      this._focusType.textContent = obj.type;
      this._focusType.style.borderColor = cat.color;
    }
    if (this._focusDist) this._focusDist.textContent = obj.distance;

    // Metrics grid
    if (this._focusMetrics) {
      this._focusMetrics.innerHTML = obj.metrics.map(m => `
        <div class="mc__ds-metric">
          <span class="mc__ds-metric-label">${m.label}</span>
          <span class="mc__ds-metric-val">${m.value}</span>
        </div>
      `).join('');
    }

    // Twist
    if (this._focusTwist) this._focusTwist.textContent = obj.twist;

    // Humanity note
    if (this._focusHumanity) this._focusHumanity.textContent = obj.humanityNote;

    // Source
    if (this._focusSourceTag) this._focusSourceTag.textContent = `SOURCE: ${obj.source.tag}`;
    if (this._focusSourceTitle) this._focusSourceTitle.textContent = obj.source.title;
    if (this._focusSourceLink) this._focusSourceLink.href = obj.source.url;

    this._focusPanel.classList.add('mc__ds-focus--visible');
    this._focusPanel.setAttribute('aria-hidden', 'false');
  }

  closeFocusPanel() {
    if (!this._focusPanel) return;
    this._focusedObject = null;
    this._focusPanel.classList.remove('mc__ds-focus--visible');
    this._focusPanel.setAttribute('aria-hidden', 'true');
  }

  /* ─── Cosmic Scale Bar ─── */
  updateScaleIndicator(level) {
    if (!this._scaleBar) return;
    const idx = COSMIC_SCALE_LABELS.findIndex(s => s.id === level);
    if (idx === -1) return;
    const pct = ((idx + 0.5) / COSMIC_SCALE_LABELS.length) * 100;
    if (this._scaleIndicator) {
      this._scaleIndicator.style.left = `${pct}%`;
    }
    if (this._scaleLabel) {
      const s = COSMIC_SCALE_LABELS[idx];
      this._scaleLabel.textContent = `${s.label} // ${s.range}`;
    }
  }

  /* ─── Show/Hide ─── */
  show() {
    this._visible = true;
    this._renderExplorerGrid();
    this.updateScaleIndicator('STELLAR');
    // Show deep space UI elements
    if (this._scaleBar) {
      this._scaleBar.classList.add('mc__cosmic-scale--visible');
      this._scaleBar.setAttribute('aria-hidden', 'false');
    }
    if (this._explorerPanel) {
      this._explorerPanel.classList.add('mc__ds-explorer--visible');
      this._explorerPanel.setAttribute('aria-hidden', 'false');
    }
    if (this._returnSolarBtn) {
      this._returnSolarBtn.classList.add('mc__return-solar--visible');
    }
  }

  hide() {
    this._visible = false;
    this.closeFocusPanel();
    if (this._scaleBar) {
      this._scaleBar.classList.remove('mc__cosmic-scale--visible');
      this._scaleBar.setAttribute('aria-hidden', 'true');
    }
    if (this._explorerPanel) {
      this._explorerPanel.classList.remove('mc__ds-explorer--visible');
      this._explorerPanel.setAttribute('aria-hidden', 'true');
    }
    if (this._returnSolarBtn) {
      this._returnSolarBtn.classList.remove('mc__return-solar--visible');
    }
  }

  get isOpen() {
    return this._visible;
  }

  close() {
    this.hide();
  }

  update() {
    // Reserved for future per-frame UI updates
  }
}
