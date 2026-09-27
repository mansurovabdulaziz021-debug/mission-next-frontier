/**
 * DiscoveryHUD.js — Cosmic Discovery Engine Presentation Layer
 * 
 * Handles:
 * - Subtle ambient "Unexpected Discovery" beacon cue
 * - Cinematic full-screen focus overlay with GSAP spatial transitions
 * - FACT -> TWIST -> MEANING presentation pipeline
 * - "The Weird Part" deeper anomaly disclosure
 * - Humanity Mode translation lens
 * - Cross-topic curiosity trail navigation
 * - Cosmic Discovery Catalog & filterable knowledge explorer
 */

import gsap from 'gsap';
import { discoveryEngine } from '../discoveries/DiscoveryEngine.js';
import { 
  COSMIC_DISCOVERIES, 
  RARITY_LEVELS, 
  getDiscoveryById, 
  getRelatedDiscoveries 
} from '../discoveries/discoveryData.js';
import { searchObservatory } from '../observatory/observatoryData.js';
import { missionState } from '../state/MissionState.js';

export class DiscoveryHUD {
  constructor() {
    this._reducedMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this._isCatalogOpen = false;
    this._isOverlayOpen = false;
    this._activeFilterCategory = 'ALL';
    this._searchQuery = '';

    this._dom = {
      // Top bar actions
      toggleBtn: document.getElementById('mc-discovery-toggle'),
      countBadge: document.getElementById('mc-discovery-count-badge'),

      // Ambient Beacon
      beacon: document.getElementById('mc-discovery-beacon'),
      beaconTitle: document.getElementById('mc-beacon-title'),
      beaconAction: document.getElementById('mc-beacon-action'),
      beaconDismiss: document.getElementById('mc-beacon-dismiss'),

      // Hero Focus Overlay
      overlay: document.getElementById('mc-discovery-overlay'),
      overlayBackdrop: document.getElementById('mc-discovery-backdrop'),
      overlayClose: document.getElementById('mc-discovery-close'),
      humanityToggleBtn: document.getElementById('mc-discovery-humanity-toggle'),
      nextTrailBtn: document.getElementById('mc-discovery-next-trail'),
      
      // Overlay Content Slots
      categoryBadge: document.getElementById('mc-disc-category'),
      rarityBadge: document.getElementById('mc-disc-rarity'),
      typeBadge: document.getElementById('mc-disc-type'),
      titleText: document.getElementById('mc-disc-title'),
      factText: document.getElementById('mc-disc-fact'),
      twistText: document.getElementById('mc-disc-twist'),
      meaningText: document.getElementById('mc-disc-meaning'),
      weirdPartBox: document.getElementById('mc-disc-weird-box'),
      weirdPartText: document.getElementById('mc-disc-weird-text'),
      weirdPartToggle: document.getElementById('mc-disc-weird-toggle'),
      humanityBox: document.getElementById('mc-disc-humanity-box'),
      humanityDim: document.getElementById('mc-disc-humanity-dim'),
      humanityAnalogy: document.getElementById('mc-disc-humanity-analogy'),
      humanityMeaning: document.getElementById('mc-disc-humanity-meaning'),
      sourceTag: document.getElementById('mc-disc-source-tag'),
      sourceTitle: document.getElementById('mc-disc-source-title'),
      sourceLink: document.getElementById('mc-disc-source-link'),
      relatedContainer: document.getElementById('mc-disc-related-list'),

      // Catalog Drawer
      drawer: document.getElementById('mc-discovery-drawer'),
      drawerClose: document.getElementById('mc-drawer-close'),
      drawerFilterTabs: document.querySelectorAll('.mc__drawer-tab'),
      drawerSearchInput: document.getElementById('mc-drawer-search'),
      drawerSurpriseBtn: document.getElementById('mc-drawer-surprise-btn'),
      drawerGrid: document.getElementById('mc-drawer-grid')
    };

    this._bindEvents();
    this._bindEngineEvents();
    this.updateCountBadge();
  }

  /* -----------------------------------------------------------------
     DOM Event Wiring
     ----------------------------------------------------------------- */
  _bindEvents() {
    // Open/Close Catalog Drawer
    this._dom.toggleBtn?.addEventListener('click', () => {
      this.toggleCatalog();
    });

    this._dom.drawerClose?.addEventListener('click', () => {
      this.closeCatalog();
    });

    // Ambient Beacon Click to Reveal
    this._dom.beaconAction?.addEventListener('click', () => {
      discoveryEngine.triggerUnexpectedDiscovery();
    });

    // Dismiss Ambient Beacon
    this._dom.beaconDismiss?.addEventListener('click', (e) => {
      e.stopPropagation();
      discoveryEngine.dismissPendingBeacon();
    });

    // Close Hero Focus Overlay
    this._dom.overlayClose?.addEventListener('click', () => {
      discoveryEngine.closeActiveDiscovery();
    });

    this._dom.overlayBackdrop?.addEventListener('click', () => {
      discoveryEngine.closeActiveDiscovery();
    });

    // Humanity Mode Toggle Button on Overlay
    this._dom.humanityToggleBtn?.addEventListener('click', () => {
      discoveryEngine.toggleHumanityMode();
    });

    // Next in Trail Button on Overlay
    this._dom.nextTrailBtn?.addEventListener('click', () => {
      discoveryEngine.navigateRelated();
    });

    // Weird Part Accordion Toggle
    this._dom.weirdPartToggle?.addEventListener('click', () => {
      const isExpanded = this._dom.weirdPartBox?.classList.toggle('mc__weird-box--expanded');
      if (this._dom.weirdPartToggle) {
        this._dom.weirdPartToggle.setAttribute('aria-expanded', String(isExpanded));
        const icon = this._dom.weirdPartToggle.querySelector('.mc__weird-icon');
        if (icon) icon.textContent = isExpanded ? '−' : '+';
      }
    });

    // Catalog Filter Tabs
    this._dom.drawerFilterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this._dom.drawerFilterTabs.forEach(t => {
          t.classList.remove('mc__drawer-tab--active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('mc__drawer-tab--active');
        tab.setAttribute('aria-selected', 'true');
        this._activeFilterCategory = tab.getAttribute('data-cat') || 'ALL';
        this._renderCatalogGrid();
      });
    });

    // Catalog Search Input
    this._dom.drawerSearchInput?.addEventListener('input', (e) => {
      this._searchQuery = (/** @type {HTMLInputElement} */ (e.target).value || '').toLowerCase().trim();
      this._renderCatalogGrid();
    });

    // Surprise Me / Random Discovery Button
    this._dom.drawerSurpriseBtn?.addEventListener('click', () => {
      this.closeCatalog();
      discoveryEngine.triggerUnexpectedDiscovery();
    });

    // Keyboard Hotkeys
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this._isOverlayOpen) {
          discoveryEngine.closeActiveDiscovery();
        } else if (this._isCatalogOpen) {
          this.closeCatalog();
        }
      }

      // Space bar opens pending beacon if active and not typing in an input
      if (e.code === 'Space' && !this._isOverlayOpen && !this._isCatalogOpen) {
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
          if (discoveryEngine.pendingDiscovery) {
            e.preventDefault();
            discoveryEngine.triggerUnexpectedDiscovery();
          }
        }
      }
    });

    // Listen to MissionState Destination changes to evaluate contextual discoveries
    missionState.on('destinationChanged', (dest) => {
      // Evaluate context smoothly
      discoveryEngine.evaluateContext([dest.id, dest.category]);
    });
  }

  /* -----------------------------------------------------------------
     Discovery Engine Event Listeners
     ----------------------------------------------------------------- */
  _bindEngineEvents() {
    // Subtle Beacon Alert
    discoveryEngine.on('discoveryAvailable', ({ discovery }) => {
      this._showBeacon(discovery);
    });

    // Clear Beacon
    discoveryEngine.on('beaconCleared', () => {
      this._hideBeacon();
    });

    // Hero Focus Overlay Revealed
    discoveryEngine.on('discoveryRevealed', ({ discovery, humanityMode }) => {
      this._hideBeacon();
      this._openOverlay(discovery, humanityMode);
      this.updateCountBadge();
    });

    // Overlay Closed
    discoveryEngine.on('discoveryClosed', () => {
      this._closeOverlay();
      this.updateCountBadge();
    });

    // Humanity Mode Changed
    discoveryEngine.on('humanityModeChanged', ({ enabled }) => {
      this._updateHumanityLensState(enabled);
    });
  }

  /* -----------------------------------------------------------------
     Ambient Beacon Animations
     ----------------------------------------------------------------- */
  _showBeacon(discovery) {
    if (!this._dom.beacon || this._isOverlayOpen) return;

    if (this._dom.beaconTitle) {
      this._dom.beaconTitle.textContent = `${discovery.category} // ${discovery.title}`;
    }

    this._dom.beacon.classList.add('mc__discovery-beacon--active');
    this._dom.beacon.setAttribute('aria-hidden', 'false');

    if (!this._reducedMotion) {
      gsap.fromTo(this._dom.beacon, 
        { y: 30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
  }

  _hideBeacon() {
    if (!this._dom.beacon) return;

    if (!this._reducedMotion && this._dom.beacon.classList.contains('mc__discovery-beacon--active')) {
      gsap.to(this._dom.beacon, {
        y: 20,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          this._dom.beacon?.classList.remove('mc__discovery-beacon--active');
          this._dom.beacon?.setAttribute('aria-hidden', 'true');
        }
      });
    } else {
      this._dom.beacon.classList.remove('mc__discovery-beacon--active');
      this._dom.beacon.setAttribute('aria-hidden', 'true');
    }
  }

  /* -----------------------------------------------------------------
     Hero Focus Overlay
     ----------------------------------------------------------------- */
  _openOverlay(discovery, humanityMode = false) {
    if (!this._dom.overlay) return;
    this._isOverlayOpen = true;

    // Populate data
    if (this._dom.categoryBadge) this._dom.categoryBadge.textContent = discovery.category;
    if (this._dom.typeBadge) this._dom.typeBadge.textContent = discovery.type;

    if (this._dom.rarityBadge) {
      const rarityInfo = RARITY_LEVELS[discovery.rarity] || RARITY_LEVELS.COMMON;
      this._dom.rarityBadge.textContent = rarityInfo.label;
      this._dom.rarityBadge.style.color = rarityInfo.color;
      this._dom.rarityBadge.style.borderColor = rarityInfo.color;
      this._dom.rarityBadge.style.boxShadow = `0 0 12px ${rarityInfo.glow}`;
    }

    if (this._dom.titleText) this._dom.titleText.textContent = discovery.title;
    if (this._dom.factText) this._dom.factText.textContent = discovery.shortFact;
    if (this._dom.twistText) this._dom.twistText.textContent = discovery.twist;
    if (this._dom.meaningText) this._dom.meaningText.textContent = discovery.whyItMatters;

    // The Weird Part
    if (this._dom.weirdPartText && discovery.weirdPart) {
      this._dom.weirdPartText.textContent = discovery.weirdPart;
      this._dom.weirdPartBox?.classList.remove('mc__weird-box--expanded');
      if (this._dom.weirdPartToggle) {
        this._dom.weirdPartToggle.setAttribute('aria-expanded', 'false');
        const icon = this._dom.weirdPartToggle.querySelector('.mc__weird-icon');
        if (icon) icon.textContent = '+';
      }
      this._dom.weirdPartBox?.style.setProperty('display', 'block');
    } else if (this._dom.weirdPartBox) {
      this._dom.weirdPartBox.style.setProperty('display', 'none');
    }

    // Humanity Mode Translation
    if (discovery.humanityContext && this._dom.humanityBox) {
      if (this._dom.humanityDim) this._dom.humanityDim.textContent = discovery.humanityContext.dimension;
      if (this._dom.humanityAnalogy) this._dom.humanityAnalogy.textContent = `"${discovery.humanityContext.analogy}"`;
      if (this._dom.humanityMeaning) this._dom.humanityMeaning.textContent = discovery.humanityContext.meaning;
      this._dom.humanityBox.style.setProperty('display', 'block');
    } else if (this._dom.humanityBox) {
      this._dom.humanityBox.style.setProperty('display', 'none');
    }

    // Source & Citation
    if (this._dom.sourceTag) this._dom.sourceTag.textContent = `SOURCE: ${discovery.source}`;
    if (this._dom.sourceTitle) this._dom.sourceTitle.textContent = discovery.sourceTitle;
    if (this._dom.sourceLink) {
      this._dom.sourceLink.href = discovery.sourceURL;
      this._dom.sourceLink.setAttribute('target', '_blank');
      this._dom.sourceLink.setAttribute('rel', 'noopener noreferrer');
    }

    // Render Related Topics (Curiosity Trail)
    this._renderRelatedTrail(discovery.id);

    // Humanity Mode Lens state
    this._updateHumanityLensState(humanityMode);

    // Dim background & display overlay
    document.body.classList.add('mc-discovery-focus');
    this._dom.overlay.classList.add('mc__discovery-overlay--open');
    this._dom.overlay.setAttribute('aria-hidden', 'false');

    if (!this._reducedMotion) {
      gsap.fromTo(this._dom.overlay.querySelector('.mc__discovery-modal'),
        { opacity: 0, scale: 0.94, y: 25 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power3.out' }
      );
      if (this._dom.overlayBackdrop) {
        gsap.fromTo(this._dom.overlayBackdrop, { opacity: 0 }, { opacity: 1, duration: 0.35 });
      }
    }
  }

  _closeOverlay() {
    if (!this._dom.overlay || !this._isOverlayOpen) return;
    this._isOverlayOpen = false;

    if (!this._reducedMotion) {
      gsap.to(this._dom.overlay.querySelector('.mc__discovery-modal'), {
        opacity: 0,
        scale: 0.96,
        y: 15,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          this._dom.overlay?.classList.remove('mc__discovery-overlay--open');
          this._dom.overlay?.setAttribute('aria-hidden', 'true');
          document.body.classList.remove('mc-discovery-focus');
        }
      });
    } else {
      this._dom.overlay.classList.remove('mc__discovery-overlay--open');
      this._dom.overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('mc-discovery-focus');
    }
  }

  _updateHumanityLensState(enabled) {
    if (!this._dom.humanityToggleBtn) return;
    this._dom.humanityToggleBtn.classList.toggle('mc__humanity-btn--active', enabled);
    this._dom.humanityToggleBtn.setAttribute('aria-pressed', String(enabled));
    
    if (this._dom.humanityBox) {
      this._dom.humanityBox.classList.toggle('mc__humanity-box--highlight', enabled);
      if (enabled && !this._reducedMotion) {
        gsap.fromTo(this._dom.humanityBox,
          { scale: 0.98, borderColor: 'rgba(244, 63, 94, 0.2)' },
          { scale: 1, borderColor: 'rgba(244, 63, 94, 0.8)', duration: 0.4 }
        );
      }
    }
  }

  /* -----------------------------------------------------------------
     Curiosity Trail (Related Discoveries)
     ----------------------------------------------------------------- */
  _renderRelatedTrail(discoveryId) {
    if (!this._dom.relatedContainer) return;
    this._dom.relatedContainer.innerHTML = '';

    const related = getRelatedDiscoveries(discoveryId);
    if (related.length === 0) {
      this._dom.relatedContainer.innerHTML = `
        <span class="mc__disc-no-related">END OF IMMEDIATE CURIOSITY CHAIN. DISCOVER MORE IN CATALOG.</span>
      `;
      return;
    }

    related.forEach((rel) => {
      const isSeen = discoveryEngine.isViewed(rel.id);
      const btn = document.createElement('button');
      btn.className = `mc__trail-chip ${isSeen ? 'mc__trail-chip--seen' : 'mc__trail-chip--new'}`;
      btn.type = 'button';
      btn.innerHTML = `
        <span class="mc__trail-icon">${isSeen ? '✓' : '✦'}</span>
        <span class="mc__trail-cat">${rel.category}:</span>
        <span class="mc__trail-name">${rel.title}</span>
        <span class="mc__trail-arrow">→</span>
      `;
      btn.addEventListener('click', () => {
        discoveryEngine.triggerUnexpectedDiscovery(rel.id);
      });
      this._dom.relatedContainer.appendChild(btn);
    });
  }

  /* -----------------------------------------------------------------
     Catalog Drawer & Knowledge Explorer
     ----------------------------------------------------------------- */
  get isOpen() {
    return this._isCatalogOpen;
  }

  get isDrawerOpen() {
    return this._isCatalogOpen;
  }

  close() {
    if (this._isCatalogOpen) {
      this.closeCatalog();
    }
  }

  closeDrawer() {
    this.closeCatalog();
  }

  toggle() {
    this.toggleCatalog();
  }

  toggleCatalog() {
    if (this._isCatalogOpen) {
      this.closeCatalog();
    } else {
      this.openCatalog();
    }
  }

  openCatalog() {
    if (!this._dom.drawer) return;
    this._isCatalogOpen = true;
    this._dom.drawer.classList.add('mc__discovery-drawer--open');
    this._dom.drawer.setAttribute('aria-hidden', 'false');
    this._dom.toggleBtn?.setAttribute('aria-expanded', 'true');
    this._renderCatalogGrid();

    if (!this._reducedMotion) {
      gsap.fromTo(this._dom.drawer,
        { x: '100%' },
        { x: '0%', duration: 0.45, ease: 'power3.out' }
      );
    }
  }

  closeCatalog() {
    if (!this._dom.drawer || !this._isCatalogOpen) return;
    this._isCatalogOpen = false;
    this._dom.toggleBtn?.setAttribute('aria-expanded', 'false');

    if (!this._reducedMotion) {
      gsap.to(this._dom.drawer, {
        x: '100%',
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          this._dom.drawer?.classList.remove('mc__discovery-drawer--open');
          this._dom.drawer?.setAttribute('aria-hidden', 'true');
        }
      });
    } else {
      this._dom.drawer.classList.remove('mc__discovery-drawer--open');
      this._dom.drawer.setAttribute('aria-hidden', 'true');
    }
  }

  _renderCatalogGrid() {
    if (!this._dom.drawerGrid) return;
    this._dom.drawerGrid.innerHTML = '';

    let items = COSMIC_DISCOVERIES;

    // Filter by Category
    if (this._activeFilterCategory !== 'ALL') {
      items = items.filter(d => {
        if (this._activeFilterCategory === 'PLANETS_MOONS') {
          return d.category === 'PLANETS' || d.category === 'MOONS';
        }
        if (this._activeFilterCategory === 'STARS_DEEP') {
          return d.category === 'STARS' || d.category === 'BLACK HOLES' || d.category === 'NEUTRON STARS' || d.category === 'SOLAR PHYSICS';
        }
        if (this._activeFilterCategory === 'MISSIONS_TECH') {
          return d.category === 'SPACECRAFT' || d.category === 'NASA MISSIONS' || d.category === 'TELESCOPES' || d.category === 'JAMES WEBB SPACE TELESCOPE' || d.category === 'SPACE ENGINEERING';
        }
        if (this._activeFilterCategory === 'ASTROBIOLOGY_HUMAN') {
          return d.category === 'ASTROBIOLOGY' || d.category === 'HUMAN SPACEFLIGHT' || d.category === 'EARTH OBSERVATION' || d.category === 'SPACE DEBRIS';
        }
        return d.category === this._activeFilterCategory;
      });
    }

    // Filter by Search Query
    if (this._searchQuery) {
      items = items.filter(d => 
        d.title.toLowerCase().includes(this._searchQuery) ||
        d.shortFact.toLowerCase().includes(this._searchQuery) ||
        d.twist.toLowerCase().includes(this._searchQuery) ||
        d.category.toLowerCase().includes(this._searchQuery)
      );
    }

    const matchedCases = this._searchQuery ? searchObservatory(this._searchQuery) : [];

    if (items.length === 0 && matchedCases.length === 0) {
      this._dom.drawerGrid.innerHTML = `
        <div class="mc__drawer-empty">
          <span>NO COSMIC DISCOVERIES OR INVESTIGATIONS MATCH CURRENT FILTERS.</span>
        </div>
      `;
      return;
    }

    // Render matched Observatory Investigation cases first
    matchedCases.forEach(c => {
      const card = document.createElement('div');
      card.className = 'mc__catalog-card mc__catalog-card--observatory';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('data-how-do-we-know', c.id);
      card.innerHTML = `
        <div class="mc__catalog-card-header">
          <span class="mc__catalog-card-cat" style="color: #38bdf8;">⌖ EVIDENCE INVESTIGATION</span>
          <span class="mc__catalog-card-rarity" style="color: #38bdf8; border-color: rgba(56,189,248,0.5);">CASE ${c.caseNumber}</span>
          <span class="mc__catalog-card-status mc__status--new" style="color: #38bdf8; border-color: rgba(56,189,248,0.5);">EVIDENCE LAB</span>
        </div>
        <h4 class="mc__catalog-card-title">${c.title}</h4>
        <p class="mc__catalog-card-fact">${c.subtitle}: ${c.target.name}</p>
        <div class="mc__catalog-card-footer">
          <span class="mc__catalog-card-type">EMPIRICAL PROOF PATHWAY</span>
          <span class="mc__catalog-card-cta" style="color: #38bdf8;">INVESTIGATE EVIDENCE ↗</span>
        </div>
      `;
      card.addEventListener('click', () => {
        this.closeDrawer();
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          this.closeDrawer();
        }
      });
      this._dom.drawerGrid.appendChild(card);
    });

    items.forEach(d => {
      const isSeen = discoveryEngine.isViewed(d.id);
      const rarity = RARITY_LEVELS[d.rarity] || RARITY_LEVELS.COMMON;

      const card = document.createElement('div');
      card.className = `mc__catalog-card ${isSeen ? 'mc__catalog-card--viewed' : 'mc__catalog-card--unseen'}`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.innerHTML = `
        <div class="mc__catalog-card-header">
          <span class="mc__catalog-card-cat">${d.category}</span>
          <span class="mc__catalog-card-rarity" style="color:${rarity.color}; border-color:${rarity.color}">${rarity.label}</span>
          ${isSeen ? '<span class="mc__catalog-card-status">EXPLORED</span>' : '<span class="mc__catalog-card-status mc__status--new">NEW</span>'}
        </div>
        <h4 class="mc__catalog-card-title">${d.title}</h4>
        <p class="mc__catalog-card-fact">${d.shortFact}</p>
        <div class="mc__catalog-card-footer">
          <span class="mc__catalog-card-type">${d.type}</span>
          <span class="mc__catalog-card-cta">REVEAL ↗</span>
        </div>
      `;

      const trigger = () => {
        discoveryEngine.triggerUnexpectedDiscovery(d.id);
      };

      card.addEventListener('click', trigger);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          trigger();
        }
      });

      this._dom.drawerGrid.appendChild(card);
    });
  }

  /* -----------------------------------------------------------------
     Stats & Badge Counters
     ----------------------------------------------------------------- */
  updateCountBadge() {
    if (this._dom.countBadge) {
      const viewed = discoveryEngine.getViewedCount();
      const total = discoveryEngine.getTotalCount();
      this._dom.countBadge.textContent = `${viewed} / ${total}`;
    }
  }
}
