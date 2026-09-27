/**
 * ExperienceConductor.js — Master Orchestration System
 * 
 * Bridges and synchronizes all subsystems into one coherent,
 * premium, cinematic scientific experience:
 * 
 *   [USER ACTION] 
 *         ↓
 *   [APPLICATION STATE (MissionState)]
 *         ↓
 *   [VISUAL RESPONSE (3D Camera, Celestial Bodies, Lighting, Particles)]
 *         ↓
 *   [AUDIO RESPONSE (AudioManager, Procedural Telemetry, Ambient Score)]
 *         ↓
 *   [DISCOVERY / INFORMATION (HUD, Telemetry Matrix, Evidence)]
 *         ↓
 *   [NEXT CONTEXT (NarrativeRouter)]
 */

import { missionState, DESTINATIONS, CAMERA_STATES } from '../state/MissionState.js';
import { audioManager } from '../audio/AudioManager.js';
import { AUDIO_EVENTS } from '../audio/AudioEvents.js';
import { GlobalAtmosphereSystem } from './GlobalAtmosphereSystem.js';
import { narrativeRouter } from './NarrativeRouter.js';
import { PresentationController } from './PresentationController.js';

export class ExperienceConductor {
  /**
   * @param {object} app
   */
  constructor(app) {
    this.app = app;

    // Sub-conductors
    this.atmosphere = new GlobalAtmosphereSystem(
      app.scene,
      app.cosmicDust,
      app.starfield
    );
    this.presentation = new PresentationController(this);
    this.narrative = narrativeRouter;
    this.audio = audioManager;

    this._bindConductorEvents();
  }

  /* -----------------------------------------------------------------
     Master Event Synchronization
     ----------------------------------------------------------------- */
  _bindConductorEvents() {
    // 1. Destination / Target Selection
    missionState.on('destinationChanged', (dest) => {
      this.audio.play(AUDIO_EVENTS.TARGET_ACQUIRE);
      this.narrative.logAction('TARGET_CHANGED', dest.id);

      if (dest.id === 'SOLAR_SYSTEM') {
        this.atmosphere.setAtmosphere('SOLAR_SYSTEM');
      } else {
        this.atmosphere.setAtmosphere('MISSION_CONTROL');
      }
    });

    // 2. Deep Space Navigation
    missionState.on('enterDeepSpace', () => {
      this.audio.play(AUDIO_EVENTS.TRANSITION_WHOOSH);
      this.atmosphere.setAtmosphere('DEEP_SPACE');
      this.audio.duck(0.4, 0.8);
      setTimeout(() => this.audio.unduck(0.18, 1.5), 1800);
    });

    missionState.on('exitDeepSpace', () => {
      this.audio.play(AUDIO_EVENTS.TRANSITION_WHOOSH);
      this.atmosphere.setAtmosphere('MISSION_CONTROL');
    });

    missionState.on('deepSpaceObjectSelected', (obj) => {
      this.audio.play(AUDIO_EVENTS.TARGET_ACQUIRE);
      this.narrative.logAction('DEEP_SPACE_OBJECT', obj.id);
    });

    // 3. Observatory // Evidence Lab
    missionState.on('enterObservatory', () => {
      this.audio.play(AUDIO_EVENTS.TRANSITION_WHOOSH);
      this.atmosphere.setAtmosphere('OBSERVATORY');
      this.audio.duck(0.3, 0.5);
    });

    missionState.on('exitObservatory', () => {
      this.audio.play(AUDIO_EVENTS.UI_CLOSE);
      this.atmosphere.setAtmosphere('MISSION_CONTROL');
      this.audio.unduck(0.18, 1.0);
    });

    // 4. Phenomena Lab
    missionState.on('enterPhenomena', () => {
      this.audio.play(AUDIO_EVENTS.TRANSITION_WHOOSH);
      this.atmosphere.setAtmosphere('PHENOMENA');
      this.audio.duck(0.35, 0.6);
    });

    missionState.on('exitPhenomena', () => {
      this.audio.play(AUDIO_EVENTS.UI_CLOSE);
      this.atmosphere.setAtmosphere('MISSION_CONTROL');
      this.audio.unduck(0.18, 1.0);
    });

    // 5. Mission Architect
    missionState.on('enterMissionArchitect', () => {
      this.audio.play(AUDIO_EVENTS.TRANSITION_WHOOSH);
      this.atmosphere.setAtmosphere('MISSION_ARCHITECT');
    });

    missionState.on('exitMissionArchitect', () => {
      this.audio.play(AUDIO_EVENTS.UI_CLOSE);
      this.atmosphere.setAtmosphere('MISSION_CONTROL');
    });

    // 6. Global UI Sound Bindings
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (e) => {
        const target = /** @type {HTMLElement} */ (e.target);
        if (target.closest('button, .mc__dest-tab, .mc__toggle-btn, .clickable')) {
          this.audio.play(AUDIO_EVENTS.UI_CLICK);
        }
      });
    }
  }

  /* -----------------------------------------------------------------
     Presentation Mode Actions Executor
     ----------------------------------------------------------------- */
  executeStepAction(action) {
    this.handlePresentationAction(action);
  }

  handlePresentationAction(action) {
    const transitions = this.app.transitions;

    switch (action) {
      case 'SHOW_OPENING':
        this.resetToBaseline();
        break;

      case 'SHOW_MISSION_CONTROL':
        if (transitions.state === 'landing') {
          transitions.enterMissionControl();
        } else {
          this.closeAllOverlays();
          missionState.setDestination('EARTH');
        }
        break;

      case 'SHOW_SOLAR_SYSTEM':
        this.closeAllOverlays();
        missionState.setDestination('SOLAR_SYSTEM');
        break;

      case 'SHOW_DATA_INTELLIGENCE':
        this.closeAllOverlays();
        this.app.scienceHUD?.toggle();
        this.audio.play(AUDIO_EVENTS.DATA_REVEAL);
        break;

      case 'SHOW_PHENOMENA':
        this.closeAllOverlays();
        this.app.phenomenaHUD?.show();
        break;

      case 'SHOW_OBSERVATORY':
        this.closeAllOverlays();
        this.app.observatoryHUD?.show('CASE_01_EXOPLANET');
        break;

      case 'SHOW_MISSION_ARCHITECT':
        this.closeAllOverlays();
        this.app.missionArchitectHUD?.show();
        break;

      case 'SHOW_MISSION_BRIEFING':
        this.closeAllOverlays();
        if (!this.app.missionArchitectHUD?.isOpen) {
          this.app.missionArchitectHUD?.show();
        }
        if (this.app.missionArchitectHUD) {
          if (typeof this.app.missionArchitectHUD.assemble === 'function') {
            this.app.missionArchitectHUD.assemble();
          } else if (this.app.missionArchitectHUD.engine) {
            this.app.missionArchitectHUD.engine.assembleMission();
          }
          setTimeout(() => {
            if (typeof this.app.missionArchitectHUD?.generateBriefing === 'function') {
              this.app.missionArchitectHUD.generateBriefing();
            } else if (this.app.missionArchitectHUD?.engine) {
              this.app.missionArchitectHUD.engine.generateBriefing();
            }
          }, 600);
        }
        break;

      case 'SHOW_FINAL_INSIGHT':
        this.closeAllOverlays();
        this.audio.play(AUDIO_EVENTS.FINAL_INSIGHT);
        this.audio.duck(0.12, 3.0);
        this.app.transitions?.enterEndingCeremony();
        this.narrative.emit('showFinalInsight', this.narrative.getFinalInsight());
        break;

      default:
        break;
    }
  }

  /**
   * Close all floating modals, drawers, and overlay modules.
   */
  closeAllOverlays() {
    if (this.app.missionArchitectHUD?.isOpen) this.app.missionArchitectHUD.close();
    if (this.app.observatoryHUD?.isOpen) this.app.observatoryHUD.hide();
    if (this.app.phenomenaHUD?.isOpen) this.app.phenomenaHUD.hide();
    if (this.app.discoveryHUD?.isOpen) this.app.discoveryHUD.close();
    else if (this.app.discoveryHUD?.isDrawerOpen) this.app.discoveryHUD.closeDrawer();
    if (this.app.scenarioHUD?.isOpen) this.app.scenarioHUD.close();
    if (this.app.scienceHUD?.isOpen) this.app.scienceHUD.close();
    if (this.app.spaceNowHUD?.isOpen) this.app.spaceNowHUD.close();
    if (this.app.timeMachineHUD?.isOpen) this.app.timeMachineHUD.close();
    if (this.app.deepSpaceHUD?.isOpen) this.app.transitions.exitDeepSpace();
  }

  /**
   * Reset workspace to clean deterministic baseline.
   */
  resetToBaseline() {
    this.closeAllOverlays();
    this.atmosphere.setAtmosphere('MISSION_CONTROL');

    if (this.app.transitions?.state === 'deepSpace') {
      this.app.transitions.exitDeepSpace();
    } else if (this.app.transitions?.state !== 'missionControl' && this.app.transitions?.state !== 'landing') {
      this.app.transitions.exitMissionControl();
    }

    missionState.setDestination('EARTH');
  }
}
