/**
 * PresentationController.js — Automated & Guided Showcase Engine
 * 
 * Specially designed for live judging & jury demonstrations:
 *   - Orchestrates a deterministic 9-step curated showcase:
 *       1. OPENING / APEX
 *       2. MISSION CONTROL (Focal Earth Telemetry)
 *       3. SOLAR SYSTEM (Heliocentric Multi-Target Array)
 *       4. NASA DATA INTELLIGENCE (Horizons Matrix & JPL Physics)
 *       5. PHENOMENA LAB (Real-Time Physics Simulations)
 *       6. COSMIC OBSERVATORY // EVIDENCE LAB (Empirical Transit Curves)
 *       7. MISSION ARCHITECT (The Cosmic Mission Composer)
 *       8. MISSION ASSEMBLY & BRIEFING (Procedural 3D Spacecraft)
 *       9. FINAL INSIGHT (Philosophical & Scientific Synthesis)
 *   - Safe Mode: Protected against external API latency or accidental navigation
 *   - Replay Engine: Clean deterministic reset of all systems without page reload
 */

export const PRESENTATION_STEPS = [
  {
    index: 0,
    id: 'OPENING',
    title: 'AUTONOMOUS FRONTIER',
    subtitle: 'Autonomous Earth Monitoring & Solar System Exploration',
    duration: 8,
    action: 'SHOW_OPENING'
  },
  {
    index: 1,
    id: 'MISSION_CONTROL',
    title: 'MISSION CONTROL & FOCAL TELEMETRY',
    subtitle: 'Real-Time Orbit Dynamics & Ground Truth Planetary Vectors',
    duration: 10,
    action: 'SHOW_MISSION_CONTROL'
  },
  {
    index: 2,
    id: 'SOLAR_SYSTEM',
    title: 'SOLAR SYSTEM OVERVIEW',
    subtitle: 'Heliocentric Array & Interplanetary Transit Corridors',
    duration: 9,
    action: 'SHOW_SOLAR_SYSTEM'
  },
  {
    index: 3,
    id: 'DATA_INTELLIGENCE',
    title: 'NASA DATA INTELLIGENCE',
    subtitle: 'JPL Horizons Ephemeris & Multi-Mission Telemetry Standards',
    duration: 10,
    action: 'SHOW_DATA_INTELLIGENCE'
  },
  {
    index: 4,
    id: 'PHENOMENA',
    title: 'PHENOMENA LAB',
    subtitle: 'Real-Time GPU Physics: Relativity, Light-Time & Bow Shock',
    duration: 11,
    action: 'SHOW_PHENOMENA'
  },
  {
    index: 5,
    id: 'OBSERVATORY',
    title: 'COSMIC OBSERVATORY // EVIDENCE LAB',
    subtitle: 'How Do We Know? Empirical Multi-Spectral Astrophysics',
    duration: 11,
    action: 'SHOW_OBSERVATORY'
  },
  {
    index: 6,
    id: 'MISSION_ARCHITECT',
    title: 'MISSION ARCHITECT // COMPOSER',
    subtitle: '6-Stage Educational Spacecraft & Scientific Trade-Off Engine',
    duration: 11,
    action: 'SHOW_MISSION_ARCHITECT'
  },
  {
    index: 7,
    id: 'MISSION_BRIEFING',
    title: '3D ASSEMBLY & MISSION BRIEFING',
    subtitle: 'Procedural Spacecraft Construction & Grounded Surprise Reveal',
    duration: 10,
    action: 'SHOW_MISSION_BRIEFING'
  },
  {
    index: 8,
    id: 'FINAL_INSIGHT',
    title: 'FINAL SCIENTIFIC INSIGHT',
    subtitle: 'From Planetary Telemetry to Cosmic Consciousness',
    duration: 12,
    action: 'SHOW_FINAL_INSIGHT'
  }
];

export class PresentationController {
  /**
   * @param {import('../conductor/ExperienceConductor.js').ExperienceConductor} [conductor]
   */
  constructor(conductor) {
    this.conductor = conductor;
    this.isActive = false;
    this.isPaused = false;
    this.currentStepIndex = 0;
    this.autoAdvance = true;
    this._timer = null;
    this._timeRemaining = 0;
    this._tickInterval = null;
    this._listeners = new Map();
  }

  /**
   * Start or resume presentation mode from Step 0.
   */
  startPresentation() {
    this.isActive = true;
    this.isPaused = false;
    this.currentStepIndex = 0;

    this.emit('presentationStarted', {
      totalSteps: PRESENTATION_STEPS.length,
      currentStep: PRESENTATION_STEPS[0]
    });

    this._executeCurrentStep();
  }

  /**
   * Exit presentation mode and return controls to free exploration.
   */
  exitPresentation() {
    this._clearTimers();
    this.isActive = false;
    this.isPaused = false;

    this.emit('presentationExited', { lastStepIndex: this.currentStepIndex });
  }

  /**
   * Advance to next presentation step.
   */
  nextStep() {
    if (!this.isActive) return;
    if (this.currentStepIndex < PRESENTATION_STEPS.length - 1) {
      this.currentStepIndex++;
      this._executeCurrentStep();
    } else {
      // Loop or finish
      this.exitPresentation();
    }
  }

  /**
   * Return to previous presentation step.
   */
  prevStep() {
    if (!this.isActive) return;
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this._executeCurrentStep();
    }
  }

  /**
   * Toggle auto-advance pause / resume.
   */
  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this._clearTimers();
    } else {
      this._scheduleAutoAdvance(this._timeRemaining || 5);
    }
    this.emit('pauseToggled', { isPaused: this.isPaused });
    return this.isPaused;
  }

  /**
   * Cleanly restart the presentation and reset the entire workspace to deterministic baseline.
   */
  restartExperience() {
    this._clearTimers();
    if (this.conductor) {
      this.conductor.resetToBaseline();
    }
    this.startPresentation();
  }

  /**
   * Jump directly to a specific presentation step.
   * @param {number} index
   */
  jumpToStep(index) {
    if (!this.isActive) this.startPresentation();
    if (index >= 0 && index < PRESENTATION_STEPS.length) {
      this.currentStepIndex = index;
      this._executeCurrentStep();
    }
  }

  /**
   * Jump directly to the Final Ending Ceremony.
   */
  jumpToFinale() {
    this.jumpToStep(PRESENTATION_STEPS.length - 1);
  }

  /* -----------------------------------------------------------------
     Step Execution & Auto-Advance
     ----------------------------------------------------------------- */
  _executeCurrentStep() {
    this._clearTimers();
    const step = PRESENTATION_STEPS[this.currentStepIndex];
    if (!step) return;

    this.emit('stepChanged', {
      stepIndex: this.currentStepIndex,
      step,
      totalSteps: PRESENTATION_STEPS.length
    });

    if (this.conductor) {
      this.conductor.handlePresentationAction(step.action);
    }

    if (this.autoAdvance && !this.isPaused) {
      this._scheduleAutoAdvance(step.duration);
    }
  }

  _scheduleAutoAdvance(seconds) {
    this._timeRemaining = seconds;
    this.emit('timerTick', { remaining: this._timeRemaining, total: seconds });

    this._tickInterval = setInterval(() => {
      this._timeRemaining--;
      this.emit('timerTick', { remaining: Math.max(0, this._timeRemaining), total: seconds });
      if (this._timeRemaining <= 0) {
        clearInterval(this._tickInterval);
        this._tickInterval = null;
        this.nextStep();
      }
    }, 1000);
  }

  _clearTimers() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    if (this._tickInterval) {
      clearInterval(this._tickInterval);
      this._tickInterval = null;
    }
  }

  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const list = this._listeners.get(event);
    if (!list) return;
    this._listeners.set(event, list.filter(cb => cb !== callback));
  }

  emit(event, payload) {
    const list = this._listeners.get(event);
    if (!list) return;
    for (const cb of list) {
      try {
        cb(payload);
      } catch (err) {
        console.error(`[PresentationController] Error in ${event}:`, err);
      }
    }
  }
}
