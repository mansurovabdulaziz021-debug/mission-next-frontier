import gsap from 'gsap';
import { missionState, DESTINATIONS } from '../state/MissionState.js';

/**
 * Manages cinematic state transitions:
 *   loading → landing → missionControl
 * and choreographed spatial camera navigation between destinations
 * (Earth, Moon, Mars, and Solar System Overview).
 */
export class TransitionManager {
  /**
   * @param {import('../three/SceneManager.js').SceneManager} sceneManager
   * @param {import('../three/Earth.js').Earth} earth
   * @param {import('../three/OrbitalElements.js').OrbitalElements} [orbitalElements]
   * @param {import('../three/CelestialBodies.js').CelestialBodies} [celestialBodies]
   * @param {import('../three/DeepSpaceObjects.js').DeepSpaceObjects} [deepSpaceObjects]
   * @param {import('../three/ObservatoryVisualizer.js').ObservatoryVisualizer} [observatoryVisualizer]
   * @param {import('../visualizations/PhenomenaSceneManager.js').PhenomenaSceneManager} [phenomenaSceneManager]
   * @param {import('../three/MissionArchitectVisualizer.js').MissionArchitectVisualizer} [missionArchitectVisualizer]
   */
  constructor(sceneManager, earth, orbitalElements, celestialBodies, deepSpaceObjects, observatoryVisualizer, phenomenaSceneManager, missionArchitectVisualizer) {
    this.sceneManager = sceneManager;
    this.earth = earth;
    this.orbitalElements = orbitalElements;
    this.celestialBodies = celestialBodies;
    this.deepSpaceObjects = deepSpaceObjects;
    this.observatoryVisualizer = observatoryVisualizer;
    this.phenomenaSceneManager = phenomenaSceneManager;
    this.missionArchitectVisualizer = missionArchitectVisualizer;

    /** @type {'loading'|'landing'|'transitioning'|'missionControl'|'deepSpace'} */
    this.state = 'loading';

    this._reducedMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this._currentTransition = null;

    this._bindStateEvents();
  }

  /** Duration multiplier (near-zero for reduced-motion). */
  get _d() {
    return this._reducedMotion ? 0.01 : 1;
  }

  _bindStateEvents() {
    missionState.on('destinationChanged', (dest) => {
      if (this.state === 'missionControl') {
        this.focusDestination(dest.id);
      }
    });

    missionState.on('togglesChanged', (toggles) => {
      if (this.orbitalElements) {
        this.orbitalElements.group.visible = !!toggles.trajectories;
      }
    });
  }

  /* =============================================================
     LOADING → LANDING (Protected original module)
     ============================================================= */
  revealLanding() {
    this.state = 'landing';
    missionState.view = 'landing';

    const loader  = document.getElementById('loader');
    const landing = document.getElementById('landing');
    const d = this._d;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // --- Loader out ---
    tl.to(loader, {
      opacity: 0,
      duration: d * 0.6,
      onComplete() {
        loader.classList.add('loader--hidden');
        loader.setAttribute('aria-hidden', 'true');
      }
    });

    // --- Landing visible ---
    tl.call(() => {
      landing.classList.add('landing--visible');
      landing.setAttribute('aria-hidden', 'false');
    });

    // HUD corners
    tl.to('.hud__corner', {
      opacity: 1, duration: d * 0.8, stagger: 0.1
    }, '-=0.2');

    // HUD readouts
    tl.to('.hud__readout', {
      opacity: 1, duration: d * 0.6, stagger: 0.08
    }, '-=0.4');

    // Eyebrow
    tl.to('.landing__eyebrow', {
      opacity: 1, y: 0, duration: d
    }, '-=0.4');

    // Title lines
    tl.to('.landing__title-line', {
      opacity: 1, y: 0, duration: d * 1.2, stagger: 0.15
    }, '-=0.7');

    // Subtitle
    tl.to('.landing__subtitle', {
      opacity: 1, y: 0, duration: d
    }, '-=0.5');

    // CTA button
    tl.to('.landing__cta', {
      opacity: 1, y: 0, duration: d
    }, '-=0.4');

    // Scanline
    tl.to('.landing__scanline', {
      opacity: 1, duration: d * 0.5
    }, '-=0.3');

    return tl;
  }

  /* =============================================================
     LANDING → MISSION CONTROL (Continuous Spatial Experience)
     ============================================================= */
  enterMissionControl() {
    if (this.state !== 'landing') return null;
    this.state = 'transitioning';
    missionState.view = 'transitioning';

    const landing = document.getElementById('landing');
    const mc      = document.getElementById('mission-control');
    const camera  = this.sceneManager.camera;
    const earthG  = this.earth.group;
    const d       = this._d;

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => {
        this.state = 'missionControl';
        missionState.view = 'missionControl';
      }
    });

    // 1. Fade out landing content & landing HUD
    tl.to('.landing__content', { opacity: 0, y: -25, duration: d * 0.5 });
    tl.to(['.hud__corner', '.hud__readout', '.landing__scanline'], {
      opacity: 0, duration: d * 0.4
    }, '-=0.3');

    // 2. Camera Spatial Flight: Dolly into Mission Control orbital perspective
    tl.to(camera.position, {
      x: 1.5, y: 0.35, z: 2.6, duration: d * 2.2, ease: 'power3.inOut'
    }, '-=0.2');

    // Align camera lookAt target subtly left
    tl.to(this.sceneManager.currentLookAt, {
      x: -0.4, y: -0.05, z: 0, duration: d * 2.2, ease: 'power3.inOut'
    }, '<');

    // 3. Earth Staging: Scale and position smoothly into focal position
    tl.to(earthG.position, {
      x: -1.2, y: -0.15, z: 0, duration: d * 2.2, ease: 'power3.inOut'
    }, '<');
    tl.to(earthG.scale, {
      x: 0.76, y: 0.76, z: 0.76, duration: d * 2.2, ease: 'power3.inOut'
    }, '<');

    // 4. Reveal Orbital Trajectories and Satellite Beacon
    if (this.orbitalElements) {
      tl.call(() => {
        this.orbitalElements.group.visible = true;
        this.orbitalElements.highlightOrbit('EARTH');
      }, null, `-=${d * 1.5}`);
      tl.to(this.orbitalElements, {
        duration: d * 1.2,
        onUpdate: () => {
          const progress = tl.progress();
          this.orbitalElements.setOpacity(Math.min(1, progress * 1.5));
        }
      }, '<');
    }

    // 5. Swap DOM visibility
    tl.call(() => {
      landing.classList.remove('landing--visible');
      landing.setAttribute('aria-hidden', 'true');
      mc.classList.add('mission-control--visible');
      mc.setAttribute('aria-hidden', 'false');
    }, null, `-=${d * 1.0}`);

    // 6. Mission Control HUD Layers Orchestration
    tl.to('.mc__top-bar', {
      opacity: 1, y: 0, duration: d * 0.7, ease: 'power3.out'
    }, `-=${d * 0.8}`);

    tl.to('.mc__hud-left', {
      opacity: 1, x: 0, duration: d * 0.8, ease: 'power3.out'
    }, '-=0.5');

    tl.to('.mc__hud-right', {
      opacity: 1, x: 0, duration: d * 0.8, ease: 'power3.out'
    }, '-=0.6');

    tl.to('.mc__timeline-bar', {
      opacity: 1, y: 0, duration: d * 0.7, ease: 'power3.out'
    }, '-=0.5');

    return tl;
  }

  /* =============================================================
     CHOREOGRAPHED SPATIAL TRAVEL (Earth ↔ Moon ↔ Mars ↔ Solar System)
     ============================================================= */
  /**
   * @param {'EARTH'|'MOON'|'MARS'|'SOLAR_SYSTEM'} destKey
   */
  focusDestination(destKey) {
    const dest = DESTINATIONS[destKey];
    if (!dest) return;

    const camera = this.sceneManager.camera;
    const lookAt = this.sceneManager.currentLookAt;
    const earthG = this.earth.group;
    const d = this._d;

    // Kill any active transition to prevent conflicting animations
    if (this._currentTransition) {
      this._currentTransition.kill();
    }

    // Highlight celestial reticle & relevant orbit
    if (this.celestialBodies) {
      this.celestialBodies.setReticleHighlight(destKey);
    }
    if (this.orbitalElements) {
      this.orbitalElements.highlightOrbit(destKey);
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        this._currentTransition = null;
      }
    });
    this._currentTransition = tl;

    // Adjust Earth positioning based on focus mode
    if (destKey === 'EARTH') {
      tl.to(earthG.position, { x: -0.4, y: -0.05, z: 0, duration: d * 2.0 }, 0);
      tl.to(earthG.scale, { x: 1.0, y: 1.0, z: 1.0, duration: d * 2.0 }, 0);
    } else {
      tl.to(earthG.position, { x: 0, y: 0, z: 0, duration: d * 2.0 }, 0);
      tl.to(earthG.scale, { x: 1.0, y: 1.0, z: 1.0, duration: d * 2.0 }, 0);
    }

    // Smooth choreographed camera travel
    tl.to(camera.position, {
      x: dest.cameraTarget.x,
      y: dest.cameraTarget.y,
      z: dest.cameraTarget.z,
      duration: d * 2.2,
      ease: 'power3.inOut'
    }, 0);

    // Continuous orientation shift
    tl.to(lookAt, {
      x: dest.lookAt.x,
      y: dest.lookAt.y,
      z: dest.lookAt.z,
      duration: d * 2.2,
      ease: 'power3.inOut'
    }, 0);

    // Subtle atmospheric flash on HUD readouts to indicate target acquisition
    tl.fromTo(
      ['#mc-target-name', '#mc-target-dist', '#mc-target-vel'],
      { opacity: 0.25, filter: 'brightness(1.8)' },
      { opacity: 1, filter: 'brightness(1.0)', duration: d * 0.6, ease: 'power2.out' },
      `-=${d * 0.8}`
    );

    return tl;
  }

  /* =============================================================
     MISSION CONTROL → LANDING (Return to Apex)
     ============================================================= */
  exitMissionControl() {
    if (this.state !== 'missionControl') return null;
    this.state = 'transitioning';
    missionState.view = 'transitioning';

    const landing = document.getElementById('landing');
    const mc      = document.getElementById('mission-control');
    const camera  = this.sceneManager.camera;
    const earthG  = this.earth.group;
    const d       = this._d;

    if (this._currentTransition) {
      this._currentTransition.kill();
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => {
        this.state = 'landing';
        missionState.view = 'landing';
        missionState.activeDestination = 'EARTH';
        this._currentTransition = null;
      }
    });
    this._currentTransition = tl;

    // 1. HUD layers exit
    tl.to(['.mc__hud-left', '.mc__hud-right'], {
      opacity: 0, duration: d * 0.4
    });
    tl.to(['.mc__top-bar', '.mc__timeline-bar'], {
      opacity: 0, duration: d * 0.4
    }, '-=0.2');

    // 2. Fade out orbital elements
    if (this.orbitalElements) {
      tl.to(this.orbitalElements, {
        duration: d * 0.8,
        onUpdate: () => {
          const progress = 1 - tl.progress();
          this.orbitalElements.setOpacity(progress);
        },
        onComplete: () => {
          this.orbitalElements.group.visible = false;
        }
      }, '-=0.3');
    }

    // 3. Camera back to landing apex (0, 0, 5) looking at (0, 0, 0)
    tl.to(camera.position, {
      x: 0, y: 0, z: 5, duration: d * 1.8, ease: 'power3.inOut'
    }, '-=0.3');

    tl.to(this.sceneManager.currentLookAt, {
      x: 0, y: 0, z: 0, duration: d * 1.8, ease: 'power3.inOut'
    }, '<');

    // 4. Earth back to centre
    tl.to(earthG.position, {
      x: 0, y: 0, z: 0, duration: d * 1.8, ease: 'power3.inOut'
    }, '<');
    tl.to(earthG.scale, {
      x: 1, y: 1, z: 1, duration: d * 1.8, ease: 'power3.inOut'
    }, '<');

    // 5. Swap visibility
    tl.call(() => {
      mc.classList.remove('mission-control--visible');
      mc.setAttribute('aria-hidden', 'true');
      landing.classList.add('landing--visible');
      landing.setAttribute('aria-hidden', 'false');
    }, null, `-=${d * 0.8}`);

    // 6. Landing content back
    tl.to('.landing__content', {
      opacity: 1, y: 0, duration: d * 0.6
    }, `-=${d * 0.5}`);

    tl.to(['.hud__corner', '.hud__readout'], {
      opacity: 1, duration: d * 0.5, stagger: 0.05
    }, '-=0.3');

    tl.to('.landing__scanline', {
      opacity: 1, duration: d * 0.3
    }, '-=0.2');

    return tl;
  }

  /* =============================================================
     MISSION CONTROL → DEEP SPACE (Phase 6 Cosmic Universe Transition)
     ============================================================= */
  enterDeepSpace() {
    if (this.state !== 'missionControl') return null;
    this.state = 'transitioning';
    missionState.view = 'transitioning';

    const camera = this.sceneManager.camera;
    const lookAt = this.sceneManager.currentLookAt;
    const earthG = this.earth.group;
    const d = this._d;

    if (this._currentTransition) this._currentTransition.kill();

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        this.state = 'deepSpace';
        missionState.view = 'deepSpace';
        missionState.deepSpaceActive = true;
        this._currentTransition = null;
      }
    });
    this._currentTransition = tl;

    // 1. Fade out Mission Control HUD elements
    tl.to(['.mc__hud-left', '.mc__hud-right'], {
      opacity: 0, x: (i) => i === 0 ? -30 : 30, duration: d * 0.6
    }, 0);
    tl.to(['.mc__top-bar', '.mc__timeline-bar'], {
      opacity: 0, duration: d * 0.5
    }, 0.1);

    // Hide deep space button
    tl.to('.mc__deep-space-btn', {
      opacity: 0, scale: 0.9, duration: d * 0.4
    }, 0);

    // 2. Scale down solar system (Earth, Moon, Mars shrink away)
    tl.to(earthG.scale, {
      x: 0.15, y: 0.15, z: 0.15, duration: d * 2.0
    }, 0.3);
    tl.to(earthG.position, {
      x: -3, y: -1, z: -4, duration: d * 2.0
    }, 0.3);

    // Fade orbital elements
    if (this.orbitalElements) {
      tl.to(this.orbitalElements, {
        duration: d * 1.0,
        onUpdate: () => {
          this.orbitalElements.setOpacity(1 - tl.progress());
        },
        onComplete: () => {
          this.orbitalElements.group.visible = false;
        }
      }, 0.2);
    }

    // 3. Accelerating camera flight outward into deep space
    tl.to(camera.position, {
      x: 35, y: 5, z: -20,
      duration: d * 2.8,
      ease: 'power2.in'
    }, 0.4);

    tl.to(lookAt, {
      x: 40, y: 3, z: -35,
      duration: d * 2.8,
      ease: 'power2.in'
    }, 0.4);

    // 4. Reveal deep space objects
    if (this.deepSpaceObjects) {
      tl.call(() => {
        this.deepSpaceObjects.show();
      }, null, `${d * 1.0}`);

      tl.to({ val: 0 }, {
        val: 1,
        duration: d * 1.5,
        ease: 'power2.out',
        onUpdate: function () {
          // 'this' refers to the gsap tween
        }
      }, `${d * 1.5}`);

      // Use a separate approach to animate opacity
      const dsObj = this.deepSpaceObjects;
      let opacityTween = { v: 0 };
      tl.to(opacityTween, {
        v: 1,
        duration: d * 1.5,
        ease: 'power2.out',
        onUpdate: () => {
          dsObj.setOpacity(opacityTween.v);
        }
      }, `${d * 1.5}`);
    }

    // 5. Show deep space UI
    tl.call(() => {
      missionState.emit('deepSpaceReady');
    }, null, `${d * 2.5}`);

    return tl;
  }

  /* =============================================================
     DEEP SPACE → MISSION CONTROL (Return to Solar System)
     ============================================================= */
  exitDeepSpace() {
    if (this.state !== 'deepSpace') return null;
    this.state = 'transitioning';
    missionState.view = 'transitioning';

    const camera = this.sceneManager.camera;
    const lookAt = this.sceneManager.currentLookAt;
    const earthG = this.earth.group;
    const d = this._d;

    if (this._currentTransition) this._currentTransition.kill();

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        this.state = 'missionControl';
        missionState.view = 'missionControl';
        missionState.deepSpaceActive = false;
        missionState.focusedDeepSpaceObject = null;
        this._currentTransition = null;
      }
    });
    this._currentTransition = tl;

    // 1. Hide deep space UI
    missionState.emit('deepSpaceExit');

    // 2. Fade out deep space objects
    if (this.deepSpaceObjects) {
      const dsObj = this.deepSpaceObjects;
      let opacityTween = { v: 1 };
      tl.to(opacityTween, {
        v: 0,
        duration: d * 1.2,
        ease: 'power2.in',
        onUpdate: () => {
          dsObj.setOpacity(opacityTween.v);
        },
        onComplete: () => {
          dsObj.hide();
        }
      }, 0);
    }

    // 3. Camera returns to Mission Control position (Earth focus default)
    const earthDest = DESTINATIONS.EARTH;
    tl.to(camera.position, {
      x: earthDest.cameraTarget.x,
      y: earthDest.cameraTarget.y,
      z: earthDest.cameraTarget.z,
      duration: d * 2.2,
      ease: 'power3.inOut'
    }, 0.3);

    tl.to(lookAt, {
      x: earthDest.lookAt.x,
      y: earthDest.lookAt.y,
      z: earthDest.lookAt.z,
      duration: d * 2.2,
      ease: 'power3.inOut'
    }, 0.3);

    // 4. Restore Earth scale and position
    tl.to(earthG.scale, {
      x: 1, y: 1, z: 1, duration: d * 2.0
    }, 0.4);
    tl.to(earthG.position, {
      x: -0.4, y: -0.05, z: 0, duration: d * 2.0
    }, 0.4);

    // 5. Restore orbital elements
    if (this.orbitalElements) {
      tl.call(() => {
        this.orbitalElements.group.visible = true;
      }, null, `${d * 1.5}`);
      tl.to(this.orbitalElements, {
        duration: d * 1.0,
        onUpdate: () => {
          this.orbitalElements.setOpacity(tl.progress());
        }
      }, `${d * 1.8}`);
    }

    // 6. Reveal Mission Control HUD
    tl.to('.mc__top-bar', {
      opacity: 1, y: 0, duration: d * 0.7, ease: 'power3.out'
    }, `-=${d * 0.8}`);

    tl.to('.mc__hud-left', {
      opacity: 1, x: 0, duration: d * 0.8, ease: 'power3.out'
    }, '-=0.5');
    tl.to('.mc__hud-right', {
      opacity: 1, x: 0, duration: d * 0.8, ease: 'power3.out'
    }, '-=0.6');
    tl.to('.mc__timeline-bar', {
      opacity: 1, y: 0, duration: d * 0.7, ease: 'power3.out'
    }, '-=0.5');

    // Show deep space button again
    tl.to('.mc__deep-space-btn', {
      opacity: 1, scale: 1, duration: d * 0.5
    }, '-=0.3');

    return tl;
  }

  /* =============================================================
     DEEP SPACE OBJECT FOCUS (Camera travel to specific object)
     ============================================================= */
  /**
   * @param {import('../data/deepSpaceData.js').DEEP_SPACE_OBJECTS[0]} obj
   */
  focusDeepSpaceObject(obj) {
    if (!obj || !this.deepSpaceObjects) return null;

    const camera = this.sceneManager.camera;
    const lookAt = this.sceneManager.currentLookAt;
    const d = this._d;

    if (this._currentTransition) this._currentTransition.kill();

    const targetPos = this.deepSpaceObjects.getObjectPosition(obj.id);

    // Camera position: offset from object
    const camTarget = {
      x: targetPos.x - 3,
      y: targetPos.y + 1.5,
      z: targetPos.z + 5
    };

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        missionState.focusedDeepSpaceObject = obj.id;
        missionState.cameraState = 'DEEP_SPACE_FOCUS';
        this._currentTransition = null;
      }
    });
    this._currentTransition = tl;

    // Smooth camera travel
    tl.to(camera.position, {
      x: camTarget.x, y: camTarget.y, z: camTarget.z,
      duration: d * 2.0
    }, 0);

    tl.to(lookAt, {
      x: targetPos.x, y: targetPos.y, z: targetPos.z,
      duration: d * 2.0
    }, 0);

    // HUD flash effect
    tl.fromTo(
      '.mc__ds-focus-name',
      { opacity: 0.3, filter: 'brightness(1.8)' },
      { opacity: 1, filter: 'brightness(1.0)', duration: d * 0.5 },
      `-=${d * 0.6}`
    );

    return tl;
  }

  /* =============================================================
     COSMIC OBSERVATORY // EVIDENCE LAB (PHASE 7)
     ============================================================= */
  enterObservatory() {
    if (this._currentTransition) this._currentTransition.kill();
    const d = this._d;

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        missionState.observatoryActive = true;
        this._currentTransition = null;
      }
    });
    this._currentTransition = tl;

    if (this.observatoryVisualizer) {
      this.observatoryVisualizer.show();
    }

    return tl;
  }

  exitObservatory() {
    if (this._currentTransition) this._currentTransition.kill();
    const d = this._d;

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        missionState.observatoryActive = false;
        if (this.observatoryVisualizer) {
          this.observatoryVisualizer.hide();
        }
        this._currentTransition = null;
      }
    });
    this._currentTransition = tl;

    return tl;
  }

  /* =============================================================
     PHENOMENA // CINEMATIC VISUAL SYSTEM (PHASE 8)
     ============================================================= */
  enterPhenomena() {
    if (this._currentTransition) this._currentTransition.kill();
    const d = this._d;
    const camera = this.sceneManager.camera;
    const lookAt = this.sceneManager.currentLookAt;

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        missionState.phenomenaActive = true;
        this._currentTransition = null;
      }
    });
    this._currentTransition = tl;

    if (this.phenomenaSceneManager) {
      this.phenomenaSceneManager.show();
    }

    // Smooth camera choreography to phenomena arena
    tl.to(camera.position, {
      x: 0, y: 1.2, z: -35,
      duration: d * 1.8
    }, 0);

    tl.to(lookAt, {
      x: 0, y: 0, z: -45,
      duration: d * 1.8
    }, 0);

    return tl;
  }

  exitPhenomena() {
    if (this._currentTransition) this._currentTransition.kill();
    const d = this._d;

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        missionState.phenomenaActive = false;
        if (this.phenomenaSceneManager) {
          this.phenomenaSceneManager.hide();
        }
        this._currentTransition = null;
      }
    });
    this._currentTransition = tl;

    // Return camera to active destination
    const dest = DESTINATIONS[missionState.activeDestination] || DESTINATIONS.EARTH;
    const camera = this.sceneManager.camera;
    const lookAt = this.sceneManager.currentLookAt;

    tl.to(camera.position, {
      x: dest.cameraTarget.x,
      y: dest.cameraTarget.y,
      z: dest.cameraTarget.z,
      duration: d * 1.8
    }, 0);

    tl.to(lookAt, {
      x: dest.lookAt.x,
      y: dest.lookAt.y,
      z: dest.lookAt.z,
      duration: d * 1.8
    }, 0);

    return tl;
  }

  /* =============================================================
     MISSION ARCHITECT // THE COSMIC MISSION COMPOSER (PHASE 9)
     ============================================================= */
  enterMissionArchitect() {
    if (this._currentTransition) this._currentTransition.kill();
    const d = this._d;
    const camera = this.sceneManager.camera;
    const lookAt = this.sceneManager.currentLookAt;

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        missionState.missionArchitectActive = true;
        this._currentTransition = null;
      }
    });
    this._currentTransition = tl;

    if (this.missionArchitectVisualizer) {
      this.missionArchitectVisualizer.show();
    }

    // Cinematic camera travel to Mission Architect 3D focal arena
    tl.to(camera.position, {
      x: 0, y: 3.5, z: -16,
      duration: d * 1.8
    }, 0);

    tl.to(lookAt, {
      x: 0, y: 0, z: -25,
      duration: d * 1.8
    }, 0);

    return tl;
  }

  exitMissionArchitect() {
    if (this._currentTransition) this._currentTransition.kill();
    const d = this._d;

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        missionState.missionArchitectActive = false;
        if (this.missionArchitectVisualizer) {
          this.missionArchitectVisualizer.hide();
        }
        this._currentTransition = null;
      }
    });
    this._currentTransition = tl;

    // Return camera to active destination
    const dest = DESTINATIONS[missionState.activeDestination] || DESTINATIONS.EARTH;
    const camera = this.sceneManager.camera;
    const lookAt = this.sceneManager.currentLookAt;

    tl.to(camera.position, {
      x: dest.cameraTarget.x,
      y: dest.cameraTarget.y,
      z: dest.cameraTarget.z,
      duration: d * 1.8
    }, 0);

    tl.to(lookAt, {
      x: dest.lookAt.x,
      y: dest.lookAt.y,
      z: dest.lookAt.z,
      duration: d * 1.8
    }, 0);

    return tl;
  }

  /* =============================================================
     PHASE 10/FINAL: CINEMATIC ENDING CEREMONY
     ============================================================= */
  enterEndingCeremony() {
    if (this._currentTransition) this._currentTransition.kill();
    const d = this._d;
    const camera = this.sceneManager.camera;
    const lookAt = this.sceneManager.currentLookAt;

    this.state = 'ceremony';
    missionState.view = 'ceremony';

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => {
        this._currentTransition = null;
      }
    });
    this._currentTransition = tl;

    // 1. Gently pull camera back to deep contemplative cosmic overview
    tl.to(camera.position, {
      x: 0,
      y: 8,
      z: 55,
      duration: d * 3.5
    }, 0);

    tl.to(lookAt, {
      x: 0,
      y: 0,
      z: 0,
      duration: d * 3.5
    }, 0);

    // 2. Dim HUD and secondary chrome to let stars and cosmic silence breathe
    tl.to(['.mc__hud-left', '.mc__hud-right', '.mc__timeline-bar', '.mc__spatial-reticle', '.mc__hover-tooltip'], {
      opacity: 0,
      duration: d * 1.2
    }, 0);

    // 3. Keep top bar subtle/dimmed
    tl.to('.mc__top-bar', {
      opacity: 0.35,
      duration: d * 1.5
    }, 0);

    return tl;
  }

  exitEndingCeremony() {
    if (this._currentTransition) this._currentTransition.kill();
    const d = this._d;
    const camera = this.sceneManager.camera;
    const lookAt = this.sceneManager.currentLookAt;
    const dest = DESTINATIONS[missionState.activeDestination] || DESTINATIONS.EARTH;

    this.state = 'missionControl';
    missionState.view = 'missionControl';

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        this._currentTransition = null;
      }
    });
    this._currentTransition = tl;

    tl.to(camera.position, {
      x: dest.cameraTarget.x,
      y: dest.cameraTarget.y,
      z: dest.cameraTarget.z,
      duration: d * 2.0
    }, 0);

    tl.to(lookAt, {
      x: dest.lookAt.x,
      y: dest.lookAt.y,
      z: dest.lookAt.z,
      duration: d * 2.0
    }, 0);

    tl.to(['.mc__top-bar', '.mc__hud-left', '.mc__hud-right', '.mc__timeline-bar'], {
      opacity: 1,
      duration: d * 1.0
    }, 0.5);

    return tl;
  }
}

