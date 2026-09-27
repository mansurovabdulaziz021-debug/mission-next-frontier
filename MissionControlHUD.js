import { missionState, DESTINATIONS } from '../state/MissionState.js';

/**
 * MissionControlHUD — Scientific HUD system for Phase 2 Solar System Exploration.
 * Manages destination navigation (Solar System, Earth, Moon, Mars),
 * contextual scientific telemetry, 3D spatial target reticle,
 * hover tooltips, and interactive trajectory milestone scrubbers.
 */
export class MissionControlHUD {
  /**
   * @param {import('../three/SceneManager.js').SceneManager} sceneManager
   * @param {import('../three/CelestialBodies.js').CelestialBodies} celestialBodies
   * @param {import('../three/Earth.js').Earth} earth
   */
  constructor(sceneManager, celestialBodies, earth) {
    this.sceneManager = sceneManager;
    this.celestialBodies = celestialBodies;
    this.earth = earth;

    this._dom = {
      mc:             document.getElementById('mission-control'),
      met:            document.getElementById('mc-met'),
      targetName:     document.getElementById('mc-target-name'),
      targetCat:      document.getElementById('mc-target-cat'),
      targetDist:     document.getElementById('mc-target-dist'),
      targetVel:      document.getElementById('mc-target-vel'),
      targetLatency:  document.getElementById('mc-target-latency'),
      targetRadius:   document.getElementById('mc-target-radius'),
      targetGravity:  document.getElementById('mc-target-gravity'),
      targetPeriod:   document.getElementById('mc-target-period'),
      targetAtmo:     document.getElementById('mc-target-atmo'),
      obsList:        document.getElementById('mc-obs-list'),
      subsystemList:  document.getElementById('mc-subsystems-list'),
      destButtons:    document.querySelectorAll('.mc__dest-tab'),
      toggleButtons:  document.querySelectorAll('.mc__toggle-btn'),
      timelineNodes:  document.querySelectorAll('.mc__timeline-step'),
      spatialReticle: document.getElementById('mc-spatial-reticle'),
      reticleCoords:  document.getElementById('mc-reticle-coords'),
      reticleTag:     document.getElementById('mc-reticle-tag'),
      hoverTooltip:   document.getElementById('mc-hover-tooltip'),
      hoverTag:       document.getElementById('mc-hover-tag'),
      hoverDist:      document.getElementById('mc-hover-dist')
    };

    this._bindEvents();
    this._renderTarget(DESTINATIONS[missionState.activeDestination]);
  }

  /* -----------------------------------------------------------------
     DOM Event Wiring
     ----------------------------------------------------------------- */
  _bindEvents() {
    // Destination Navigation Tabs
    this._dom.destButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const destKey = btn.getAttribute('data-dest');
        if (destKey) {
          missionState.setDestination(destKey);
        }
      });
    });

    // Viewport Layer Toggles
    this._dom.toggleButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const toggleKey = btn.getAttribute('data-toggle');
        if (toggleKey) {
          missionState.toggleOverlay(toggleKey);
          btn.classList.toggle('mc__toggle-btn--active');
        }
      });
    });

    // Timeline Milestones
    this._dom.timelineNodes.forEach((node) => {
      node.addEventListener('click', () => {
        this._dom.timelineNodes.forEach((n) => n.classList.remove('mc__timeline-step--selected'));
        node.classList.add('mc__timeline-step--selected');

        const phase = node.getAttribute('data-phase');
        if (phase === 'GEO' || phase === 'T0') {
          missionState.setDestination('EARTH');
        } else if (phase === 'TLI' || phase === 'LUNA') {
          missionState.setDestination('MOON');
        } else if (phase === 'MARS') {
          missionState.setDestination('MARS');
        }
      });
    });

    // State Subscriptions
    missionState.on('destinationChanged', (dest) => {
      this._updateActiveTab(dest.id);
      this._renderTarget(dest);
    });

    missionState.on('destinationHovered', (dest) => {
      this._handleHover(dest);
    });
  }

  /* -----------------------------------------------------------------
     Per-Frame Updates
     ----------------------------------------------------------------- */
  update() {
    // 1. Live Mission Elapsed Time
    if (this._dom.met) {
      this._dom.met.textContent = missionState.getMissionElapsedTime();
    }

    // 2. Track 3D Target in Screen Space for Spatial Reticle
    if (this._dom.spatialReticle && missionState.view === 'missionControl') {
      if (missionState.activeDestination === 'SOLAR_SYSTEM') {
        this._dom.spatialReticle.style.opacity = '0';
      } else {
        const targetPos = this.celestialBodies.getTargetPosition(missionState.activeDestination);
        if (missionState.activeDestination === 'EARTH') {
          this.earth.group.getWorldPosition(targetPos);
        }

        const p2d = this.sceneManager.projectTo2D(targetPos);
        if (p2d.visible) {
          this._dom.spatialReticle.style.opacity = '1';
          this._dom.spatialReticle.style.transform = `translate(${p2d.x}px, ${p2d.y}px)`;
          if (this._dom.reticleCoords) {
            this._dom.reticleCoords.textContent = `${p2d.x.toFixed(0)}, ${p2d.y.toFixed(0)} PX`;
          }
        } else {
          this._dom.spatialReticle.style.opacity = '0';
        }
      }
    }
  }

  /* -----------------------------------------------------------------
     Hover Tooltip Coordination
     ----------------------------------------------------------------- */
  /** @param {typeof DESTINATIONS[keyof typeof DESTINATIONS]|null} dest */
  _handleHover(dest) {
    if (!this._dom.hoverTooltip) return;

    if (dest && missionState.view === 'missionControl') {
      if (this._dom.hoverTag)  this._dom.hoverTag.textContent  = dest.id;
      if (this._dom.hoverDist) this._dom.hoverDist.textContent = dest.visDistance || dest.realDistance;
      this._dom.hoverTooltip.classList.add('mc__hover-tooltip--visible');
    } else {
      this._dom.hoverTooltip.classList.remove('mc__hover-tooltip--visible');
    }
  }

  updateHoverPosition(x, y) {
    if (this._dom.hoverTooltip) {
      this._dom.hoverTooltip.style.transform = `translate(${x + 18}px, ${y + 18}px)`;
    }
  }

  /* -----------------------------------------------------------------
     Render Contextual Telemetry for Destination
     ----------------------------------------------------------------- */
  /** @param {typeof DESTINATIONS[keyof typeof DESTINATIONS]} dest */
  _renderTarget(dest) {
    if (!dest) return;

    if (this._dom.targetName)    this._dom.targetName.textContent    = dest.name;
    if (this._dom.targetCat)     this._dom.targetCat.textContent     = dest.category;
    if (this._dom.targetDist)    this._dom.targetDist.textContent    = dest.realDistance;
    if (this._dom.targetVel)     this._dom.targetVel.textContent     = dest.velocity;
    if (this._dom.targetLatency) this._dom.targetLatency.textContent = dest.signalLatency;

    if (this._dom.targetRadius)  this._dom.targetRadius.textContent  = dest.radius || 'N/A';
    if (this._dom.targetGravity) this._dom.targetGravity.textContent = dest.gravity || 'N/A';
    if (this._dom.targetPeriod)  this._dom.targetPeriod.textContent  = dest.period || 'N/A';
    if (this._dom.targetAtmo)    this._dom.targetAtmo.textContent    = dest.atmosphere || 'VACUUM';

    if (this._dom.reticleTag) {
      this._dom.reticleTag.textContent = dest.id;
    }

    // Subsystems
    if (this._dom.subsystemList) {
      this._dom.subsystemList.innerHTML = Object.entries(dest.subsystems)
        .map(
          ([key, val]) => `
          <div class="mc__telemetry-row">
            <span class="mc__telemetry-key">${key.toUpperCase()}:</span>
            <span class="mc__telemetry-val">${val}</span>
          </div>
        `
        )
        .join('');
    }

    // Observations
    if (this._dom.obsList) {
      this._dom.obsList.innerHTML = dest.observations
        .map(
          (obs) => `
          <div class="mc__obs-card">
            <span class="mc__obs-label">${obs.label}</span>
            <span class="mc__obs-value">${obs.val}</span>
          </div>
        `
        )
        .join('');
    }
  }

  _updateActiveTab(destId) {
    this._dom.destButtons.forEach((btn) => {
      const key = btn.getAttribute('data-dest');
      if (key === destId) {
        btn.classList.add('mc__dest-tab--active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('mc__dest-tab--active');
        btn.setAttribute('aria-selected', 'false');
      }
    });
  }
}
