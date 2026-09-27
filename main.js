/**
 * MISSION // NEXT FRONTIER — Application Entry
 *
 * Bootstraps Three.js scene, coordinates Solar System exploration,
 * manages 3D pointer hover/selection raycasting, and coordinates the per-frame update loop.
 */

import './style.css';

import * as THREE from 'three';
import { SceneManager } from './three/SceneManager.js';
import { Sun }          from './three/Sun.js';
import { Earth }        from './three/Earth.js';
import { Starfield }    from './three/Starfield.js';
import { OrbitalElements } from './three/OrbitalElements.js';
import { CelestialBodies } from './three/CelestialBodies.js';
import { CosmicDust }   from './three/CosmicDust.js';
import { ScenarioVisualizer } from './three/ScenarioVisualizer.js';
import { DeepSpaceObjects } from './three/DeepSpaceObjects.js';
import { ObservatoryVisualizer } from './three/ObservatoryVisualizer.js';
import { HUD }          from './ui/HUD.js';
import { MissionControlHUD } from './ui/MissionControlHUD.js';
import { ScientificDataHUD } from './ui/ScientificDataHUD.js';
import { ScenarioHubHUD }    from './ui/ScenarioHubHUD.js';
import { DiscoveryHUD }      from './ui/DiscoveryHUD.js';
import { DeepSpaceHUD }      from './ui/DeepSpaceHUD.js';
import { ObservatoryHUD }    from './ui/ObservatoryHUD.js';
import { PhenomenaHUD }      from './ui/PhenomenaHUD.js';
import { MissionArchitectHUD } from './ui/MissionArchitectHUD.js';
import { CursorSystem }      from './ui/CursorSystem.js';
import { PhenomenaSceneManager } from './visualizations/PhenomenaSceneManager.js';
import { MissionArchitectVisualizer } from './three/MissionArchitectVisualizer.js';
import { phenomenaEngine }   from './visualizations/PhenomenaEngine.js';
import { qualityManager }    from './utils/QualityManager.js';
import { observatoryEngine } from './observatory/ObservatoryEngine.js';
import { discoveryEngine }   from './discoveries/DiscoveryEngine.js';
import { TransitionManager } from './ui/Transitions.js';
import { missionState } from './state/MissionState.js';
import { getDeepSpaceObject } from './data/deepSpaceData.js';
import { lerp }         from './utils/math.js';

// Phase 10: Immersive Experience Orchestration
import { audioManager } from './audio/AudioManager.js';
import { AUDIO_EVENTS } from './audio/AudioEvents.js';
import { ExperienceConductor } from './conductor/ExperienceConductor.js';
import { AudioControlHUD } from './ui/AudioControlHUD.js';
import { PresentationHUD } from './ui/PresentationHUD.js';
import { NarrativePromptHUD } from './ui/NarrativePromptHUD.js';

// Phase 11: Live Cosmos
import { SpaceNowHUD }    from './ui/SpaceNowHUD.js';
import { TimeMachineHUD } from './ui/TimeMachineHUD.js';
import { liveDataManager } from './live/LiveDataManager.js';

class App {
  constructor() {
    /** Normalised pointer position (-1…1). */
    this._pointer = { x: 0, y: 0 };
    /** Smoothed pointer (lerped each frame). */
    this._smooth  = { x: 0, y: 0 };

    this._reducedMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this._raycaster = new THREE.Raycaster();
    this._mouseVec  = new THREE.Vector2();
    this._hoveredObject = null;

    this._boot();
  }

  /* ---------------------------------------------------------------
     Boot sequence
     --------------------------------------------------------------- */
  async _boot() {
    try {
      const canvas = /** @type {HTMLCanvasElement} */
        (document.getElementById('scene-canvas'));

      // Core Scene Manager
      this.scene           = new SceneManager(canvas);

      // Central Solar Luminary
      this.sun             = new Sun(this.scene.scene, new THREE.Vector3(-14.0, 2.0, 7.5));

      // Planetary & Space Environment
      this.earth           = new Earth(this.scene.scene);
      this.orbitalElements = new OrbitalElements(this.scene.scene, this.earth.group, this.sun.group.position);
      this.celestialBodies = new CelestialBodies(this.scene.scene);
      this.cosmicDust      = new CosmicDust(this.scene.scene, 550);
      this.starfield       = new Starfield(this.scene.scene, 4200);

      // Phase 4: 3D Scenario Visualizer
      this.scenarioVisualizer = new ScenarioVisualizer(
        this.scene.scene,
        this.celestialBodies,
        this.earth,
        this.sun.group.position
      );

      // Phase 6: Deep Space Objects
      this.deepSpaceObjects = new DeepSpaceObjects(this.scene.scene);

      // Phase 7: Observatory 3D Visualizer
      this.observatoryVisualizer = new ObservatoryVisualizer(this.scene.scene, this.scene.camera);

      // Phase 8: Phenomena 3D Visualizer Master Arena & Cursor System
      this.cursorSystem          = new CursorSystem();
      this.phenomenaSceneManager = new PhenomenaSceneManager(this.scene.scene, this.scene.camera);

      // UI Modules
      this.hud             = new HUD();
      this.mcHUD           = new MissionControlHUD(this.scene, this.celestialBodies, this.earth);
      this.scienceHUD      = new ScientificDataHUD();
      this.scenarioHUD     = new ScenarioHubHUD(this.scenarioVisualizer);
      this.discoveryHUD    = new DiscoveryHUD();
      this.deepSpaceHUD    = new DeepSpaceHUD();
      this.observatoryHUD  = new ObservatoryHUD();
      this.phenomenaHUD    = new PhenomenaHUD();

      // Phase 9: Mission Architect Visualizer & HUD
      this.missionArchitectVisualizer = new MissionArchitectVisualizer(this.scene.scene, this.scene.camera, this.scene);
      this.missionArchitectHUD = new MissionArchitectHUD(this.missionArchitectVisualizer);

      this.transitions     = new TransitionManager(
        this.scene,
        this.earth,
        this.orbitalElements,
        this.celestialBodies,
        this.deepSpaceObjects,
        this.observatoryVisualizer,
        this.phenomenaSceneManager,
        this.missionArchitectVisualizer
      );

      // Phase 10: Master Conductor, Audio & Presentation HUDs
      this.conductor          = new ExperienceConductor(this);
      this.audioControlHUD    = new AudioControlHUD();
      this.presentationHUD    = new PresentationHUD(this.conductor.presentation);
      this.narrativePromptHUD = new NarrativePromptHUD(this);

      // Phase 11: Live Cosmos HUDs
      this.spaceNowHUD    = new SpaceNowHUD();
      this.timeMachineHUD = new TimeMachineHUD();

      // Asset loading sequence (protected entry flow)
      await this._runLoadingSequence();

      // Reveal landing
      this.transitions.revealLanding();

      // Events & update loop
      this._bindEvents();
      this.scene.onUpdate((d, e) => this._update(d, e));
    } catch (err) {
      console.error('[MISSION] Fatal init error:', err);
      this._showFallback(err);
    }
  }

  /* ---------------------------------------------------------------
     Loading sequence (Protected Entry)
     --------------------------------------------------------------- */
  async _runLoadingSequence() {
    const bar    = document.getElementById('loader-bar');
    const status = document.getElementById('loader-status');

    const steps = [
      { pct: 15,  text: 'Initializing WebGL 4K core…' },
      { pct: 35,  text: 'Generating deep-space starfield & nebular depth…' },
      { pct: 55,  text: 'Synthesizing Earth atmosphere & cloud layers…' },
      { pct: 75,  text: 'Establishing solar heliocentric vectors…' },
      { pct: 90,  text: 'Calibrating multi-target orbital array…' },
      { pct: 100, text: 'Solar System exploration online.' }
    ];

    const stepDelay = this._reducedMotion ? 30 : 220;

    for (const s of steps) {
      if (bar)    bar.style.width    = `${s.pct}%`;
      if (status) status.textContent = s.text;
      await this._delay(stepDelay);
    }

    await this._delay(this._reducedMotion ? 30 : 120);
  }

  /** @param {number} ms */
  _delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  /* ---------------------------------------------------------------
     Events & Raycasting Interaction
     --------------------------------------------------------------- */
  _bindEvents() {
    // Pointer movement & dynamic hover detection
    window.addEventListener('pointermove', (e) => {
      this._pointer.x  =  (e.clientX / window.innerWidth)  * 2 - 1;
      this._pointer.y  = -(e.clientY / window.innerHeight) * 2 + 1;
      this._mouseVec.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      this._mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.mcHUD.updateHoverPosition(e.clientX, e.clientY);

      // Perform 3D hover detection when in Mission Control
      if (missionState.view === 'missionControl') {
        this._check3DHover(e);
      }
    });

    // Enter Mission Control (Unlocks Audio on user interaction)
    document.getElementById('enter-btn')
      ?.addEventListener('click', () => {
        audioManager.unlockAudio();
        audioManager.play(AUDIO_EVENTS.TRANSITION_WHOOSH);
        this.transitions.enterMissionControl();
      });

    // Back to Landing Apex
    document.getElementById('mc-back-btn')
      ?.addEventListener('click', () => this.transitions.exitMissionControl());

    // Phase 6: Deep Space events
    missionState.on('enterDeepSpace', () => {
      this.transitions.enterDeepSpace();
    });

    missionState.on('exitDeepSpace', () => {
      this.transitions.exitDeepSpace();
    });

    missionState.on('deepSpaceReady', () => {
      this.deepSpaceHUD.show();
    });

    missionState.on('deepSpaceExit', () => {
      this.deepSpaceHUD.hide();
    });

    missionState.on('deepSpaceObjectSelected', (obj) => {
      this.transitions.focusDeepSpaceObject(obj);
    });

    // Phase 7: Observatory events
    missionState.on('enterObservatory', () => {
      this.transitions.enterObservatory();
    });

    missionState.on('exitObservatory', () => {
      this.transitions.exitObservatory();
    });

    observatoryEngine.on('caseChanged', ({ case: c, step }) => {
      this.observatoryVisualizer.setCase(c.id, step);
    });

    observatoryEngine.on('wavelengthChanged', ({ bandId }) => {
      this.observatoryVisualizer.setWavelength(bandId);
    });

    // Phase 8: Phenomena events
    missionState.on('enterPhenomena', () => {
      this.transitions.enterPhenomena();
    });

    missionState.on('exitPhenomena', () => {
      this.transitions.exitPhenomena();
    });

    // Phase 9: Mission Architect events
    missionState.on('enterMissionArchitect', () => {
      this.transitions.enterMissionArchitect();
    });

    missionState.on('exitMissionArchitect', () => {
      this.transitions.exitMissionArchitect();
    });

    document.getElementById('mc-architect-toggle')
      ?.addEventListener('click', () => {
        this.missionArchitectHUD.show();
      });

    // Cross-link handlers
    missionState.on('openObservatoryCase', (caseId) => {
      this.observatoryHUD.show(caseId);
    });

    missionState.on('openPhenomenon', (phenomId) => {
      this.phenomenaHUD.show();
      phenomenaEngine.setPhenomenon(phenomId);
    });

    missionState.on('openDiscovery', (discId) => {
      this.discoveryHUD.show();
      discoveryEngine.selectDiscovery(discId);
    });

    // Phase 11: Live Cosmos toggle buttons
    document.getElementById('mc-space-now-toggle')
      ?.addEventListener('click', () => {
        this.spaceNowHUD.toggle();
        const btn = document.getElementById('mc-space-now-toggle');
        if (btn) btn.setAttribute('aria-expanded', String(this.spaceNowHUD.isOpen));
      });

    document.getElementById('mc-time-machine-toggle')
      ?.addEventListener('click', () => {
        this.timeMachineHUD.toggle();
        const btn = document.getElementById('mc-time-machine-toggle');
        if (btn) btn.setAttribute('aria-expanded', String(this.timeMachineHUD.isOpen));
      });

    // Phase 11: missionState cross-links for live panel actions
    missionState.on('enterSpaceNow', () => {
      liveDataManager.start();
    });
    missionState.on('exitSpaceNow', () => {
      // Keep data manager running for heartbeat; just update button state
      const btn = document.getElementById('mc-space-now-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
    missionState.on('enterTimeMachine', () => {
      const btn = document.getElementById('mc-time-machine-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'true');
    });
    missionState.on('exitTimeMachine', () => {
      const btn = document.getElementById('mc-time-machine-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });

    // Click in 3D Space (Raycasting to select Destination)
    window.addEventListener('click', (e) => {
      // Phase 6: Deep space raycasting
      if (missionState.view === 'deepSpace') {
        if (this._isOverUI(e)) return;
        this._raycaster.setFromCamera(this._mouseVec, this.scene.camera);
        const dsTargets = this.deepSpaceObjects.getHitTargets();
        const dsHits = this._raycaster.intersectObjects(dsTargets, false);
        if (dsHits.length > 0) {
          const hitName = dsHits[0].object.name;
          if (hitName) {
            const obj = this.deepSpaceObjects.getObjectGroup(hitName);
            if (obj) {
              const dsObj = getDeepSpaceObject(hitName);
              if (dsObj) missionState.emit('deepSpaceObjectSelected', dsObj);
            }
          }
        }
        return;
      }

      if (missionState.view !== 'missionControl') return;

      // Ignore clicks over HUD navigation, science, scenario & discovery panels
      if (this._isOverUI(e)) return;

      this._raycaster.setFromCamera(this._mouseVec, this.scene.camera);
      const targets = [
        this.earth.mesh,
        this.celestialBodies.moonMesh,
        this.celestialBodies.marsMesh,
        this.sun.mesh
      ];
      const hits = this._raycaster.intersectObjects(targets, false);

      if (hits.length > 0) {
        const hit = hits[0].object;
        if (hit === this.earth.mesh) {
          missionState.setDestination('EARTH');
        } else if (hit === this.celestialBodies.moonMesh) {
          missionState.setDestination('MOON');
        } else if (hit === this.celestialBodies.marsMesh) {
          missionState.setDestination('MARS');
        } else if (hit === this.sun.mesh) {
          missionState.setDestination('SOLAR_SYSTEM');
        }
      }
    });

    // Keyboard (ESC to exit to landing, deep space, observatory, phenomena, ceremony, or presentation)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const insightModal = document.getElementById('mc-insight-modal');
        if (insightModal?.classList.contains('mc__insight-modal--visible')) {
          this.narrativePromptHUD?._hideModal();
          return;
        }
        if (this.conductor && this.conductor.presentation.isActive) {
          this.conductor.presentation.exitPresentation();
          return;
        }
        if (this.spaceNowHUD && this.spaceNowHUD.isOpen) {
          this.spaceNowHUD.close();
          return;
        }
        if (this.timeMachineHUD && this.timeMachineHUD.isOpen) {
          this.timeMachineHUD.close();
          return;
        }
        if (this.missionArchitectHUD && this.missionArchitectHUD.isOpen) {
          this.missionArchitectHUD.hide();
          return;
        }
        if (this.phenomenaHUD && this.phenomenaHUD.isOpen) {
          this.phenomenaHUD.hide();
          return;
        }
        if (this.observatoryHUD && this.observatoryHUD.isOpen) {
          this.observatoryHUD.hide();
          return;
        }
        if (this.transitions.state === 'deepSpace') {
          this.transitions.exitDeepSpace();
        } else if (this.transitions.state === 'missionControl') {
          this.transitions.exitMissionControl();
        }
      }
    });
  }

  /* ---------------------------------------------------------------
     3D Hover Raycasting & Highlighting
     --------------------------------------------------------------- */
  /** Check if event target is over a HUD/UI panel. */
  _isOverUI(e) {
    return !!(e.target.closest('.mc__top-bar') ||
        e.target.closest('.mc__hud-left') ||
        e.target.closest('.mc__hud-right') ||
        e.target.closest('.mc__timeline-bar') ||
        e.target.closest('.mc__science-panel') ||
        e.target.closest('.mc__source-modal') ||
        e.target.closest('.mc__scenario-hub') ||
        e.target.closest('.mc__discovery-beacon') ||
        e.target.closest('.mc__discovery-overlay') ||
        e.target.closest('.mc__discovery-drawer') ||
        e.target.closest('.mc__ds-explorer') ||
        e.target.closest('.mc__ds-focus') ||
        e.target.closest('.mc__cosmic-scale') ||
        e.target.closest('.mc__deep-space-btn') ||
        e.target.closest('.mc__return-solar-btn') ||
        e.target.closest('.mc__observatory') ||
        e.target.closest('.mc__observatory-toggle') ||
        e.target.closest('.mc__phenomena') ||
        e.target.closest('.mc__phenomena-toggle') ||
        e.target.closest('.mc__architect') ||
        e.target.closest('.mc__architect-toggle') ||
        e.target.closest('.mc__presentation-bar') ||
        e.target.closest('.mc__pres-toggle') ||
        e.target.closest('.mc__audio-ctrl') ||
        e.target.closest('.mc__space-now') ||
        e.target.closest('.mc__space-now-toggle') ||
        e.target.closest('.mc__time-machine') ||
        e.target.closest('.mc__time-machine-toggle') ||
        e.target.closest('.mc__narrative-chip') ||
        e.target.closest('.mc__insight-modal'));
  }

  _check3DHover(e) {
    if (this._isOverUI(e)) {
      this._resetHover();
      return;
    }

    this._raycaster.setFromCamera(this._mouseVec, this.scene.camera);
    const targets = [
      this.earth.mesh,
      this.celestialBodies.moonMesh,
      this.celestialBodies.marsMesh,
      this.sun.mesh
    ];
    const hits = this._raycaster.intersectObjects(targets, false);

    if (hits.length > 0) {
      const hit = hits[0].object;
      let destKey = null;

      if (hit === this.earth.mesh) {
        destKey = 'EARTH';
        this.earth.setHover(true);
        this.celestialBodies.setHover('MOON', false);
        this.celestialBodies.setHover('MARS', false);
      } else if (hit === this.celestialBodies.moonMesh) {
        destKey = 'MOON';
        this.earth.setHover(false);
        this.celestialBodies.setHover('MOON', true);
        this.celestialBodies.setHover('MARS', false);
      } else if (hit === this.celestialBodies.marsMesh) {
        destKey = 'MARS';
        this.earth.setHover(false);
        this.celestialBodies.setHover('MOON', false);
        this.celestialBodies.setHover('MARS', true);
      } else if (hit === this.sun.mesh) {
        destKey = 'SOLAR_SYSTEM';
      }

      document.body.style.cursor = 'pointer';
      missionState.setHoveredDestination(destKey);
      this._hoveredObject = hit;
    } else {
      this._resetHover();
    }
  }

  _resetHover() {
    if (this._hoveredObject) {
      this.earth.setHover(false);
      this.celestialBodies.setHover('MOON', false);
      this.celestialBodies.setHover('MARS', false);
      document.body.style.cursor = '';
      missionState.setHoveredDestination(null);
      this._hoveredObject = null;
    }
  }

  /* ---------------------------------------------------------------
     Per-frame update loop
     --------------------------------------------------------------- */
  /** @param {number} delta  @param {number} elapsed */
  _update(delta, elapsed) {
    // Smooth pointer interpolation
    const f = 1 - Math.pow(0.05, delta);
    this._smooth.x = lerp(this._smooth.x, this._pointer.x, f);
    this._smooth.y = lerp(this._smooth.y, this._pointer.y, f);

    // 3D Objects Update
    this.sun.update(delta, elapsed);
    this.earth.update(delta, elapsed);
    this.orbitalElements.update(delta, elapsed);
    this.celestialBodies.update(delta, elapsed);
    this.scenarioVisualizer.update(delta, elapsed);
    this.cosmicDust.update(delta);
    this.starfield.update(delta, elapsed);
    this.deepSpaceObjects.update(delta, elapsed);
    this.observatoryVisualizer.update(delta, elapsed);
    this.phenomenaSceneManager.update(delta, elapsed);
    this.missionArchitectVisualizer.update(delta, elapsed);
    qualityManager.tick(delta);

    // Pointer reactions
    if (!this._reducedMotion) {
      this.earth.setPointerInfluence(this._smooth.x, this._smooth.y);

      // Subtle parallax during landing
      if (this.transitions.state === 'landing') {
        const cam = this.scene.camera;
        cam.position.x += (this._smooth.x * 0.15 - cam.position.x) * f;
        cam.position.y += (this._smooth.y * 0.10 - cam.position.y) * f;
      }
    }

    // UI Updates
    if (this.transitions.state === 'landing') {
      this.hud.update();
      this.hud.setPointerData(this._smooth.x, this._smooth.y);
    } else if (this.transitions.state === 'missionControl') {
      this.mcHUD.update();
    }
  }

  /* ---------------------------------------------------------------
     WebGL fallback
     --------------------------------------------------------------- */
  /** @param {Error} err */
  _showFallback(err) {
    const loader = document.getElementById('loader');
    if (!loader) return;
    loader.innerHTML = `
      <div style="text-align:center;padding:2rem;max-width:420px">
        <p style="font-family:var(--mono);font-size:0.8rem;color:var(--mist);margin-bottom:1rem">
          MISSION // NEXT FRONTIER requires WebGL.
        </p>
        <p style="font-family:var(--mono);font-size:0.65rem;color:var(--steel)">
          ${err.message}
        </p>
      </div>`;
  }
}

// ----- Launch ----------------------------------------------------
window.__missionApp = new App();
