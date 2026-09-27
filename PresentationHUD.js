/**
 * PresentationHUD.js — Live Jury & Showcase Presentation Bar
 * 
 * Manages the floating, high-tech presentation console during demo mode:
 *   - Current step index & title
 *   - Auto-advance countdown timer
 *   - Play/Pause, Next, Previous, and Restart Replay controls
 *   - Keyboard shortcuts (ArrowLeft, ArrowRight, Space, Escape)
 */

export class PresentationHUD {
  /**
   * @param {import('../conductor/PresentationController.js').PresentationController} controller
   */
  constructor(controller) {
    this.controller = controller;

    this.dom = {
      container: document.getElementById('mc-presentation-bar'),
      stepBadge: document.getElementById('mc-pres-step-badge'),
      title: document.getElementById('mc-pres-title'),
      subtitle: document.getElementById('mc-pres-subtitle'),
      timerPill: document.getElementById('mc-pres-timer-pill'),
      prevBtn: document.getElementById('mc-pres-prev-btn'),
      playBtn: document.getElementById('mc-pres-play-btn'),
      nextBtn: document.getElementById('mc-pres-next-btn'),
      replayBtn: document.getElementById('mc-pres-replay-btn'),
      finaleBtn: document.getElementById('mc-pres-finale-btn'),
      exitBtn: document.getElementById('mc-pres-exit-btn'),
      toggleBtn: document.getElementById('mc-presentation-toggle')
    };

    this._bindEvents();
  }

  _bindEvents() {
    // Launch button in top bar
    this.dom.toggleBtn?.addEventListener('click', () => {
      if (this.controller.isActive) {
        this.controller.exitPresentation();
      } else {
        this.controller.startPresentation();
      }
    });

    // Control buttons
    this.dom.prevBtn?.addEventListener('click', () => this.controller.prevStep());
    this.dom.nextBtn?.addEventListener('click', () => this.controller.nextStep());
    this.dom.playBtn?.addEventListener('click', () => this.controller.togglePause());
    this.dom.replayBtn?.addEventListener('click', () => this.controller.restartExperience());
    this.dom.finaleBtn?.addEventListener('click', () => this.controller.jumpToFinale());
    this.dom.exitBtn?.addEventListener('click', () => this.controller.exitPresentation());

    // Keyboard shortcuts during presentation
    window.addEventListener('keydown', (e) => {
      if (!this.controller.isActive) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.controller.nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.controller.prevStep();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        this.controller.togglePause();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.controller.exitPresentation();
      }
    });

    // Controller callbacks
    this.controller.on('presentationStarted', ({ currentStep, totalSteps }) => {
      this._show();
      this._updateStep(0, currentStep, totalSteps);
    });

    this.controller.on('stepChanged', ({ stepIndex, step, totalSteps }) => {
      this._updateStep(stepIndex, step, totalSteps);
    });

    this.controller.on('timerTick', ({ remaining, total }) => {
      if (this.dom.timerPill) {
        this.dom.timerPill.textContent = `${remaining}s`;
      }
    });

    this.controller.on('pauseToggled', ({ isPaused }) => {
      if (this.dom.playBtn) {
        this.dom.playBtn.innerHTML = isPaused ? '▶' : '❚❚';
        this.dom.playBtn.setAttribute('title', isPaused ? 'Resume Auto-Advance (Space)' : 'Pause Auto-Advance (Space)');
      }
      if (this.dom.timerPill) {
        this.dom.timerPill.textContent = isPaused ? 'PAUSED' : `${this.controller._timeRemaining}s`;
      }
    });

    this.controller.on('presentationExited', () => {
      this._hide();
    });
  }

  _show() {
    if (this.dom.container) {
      this.dom.container.classList.add('mc__presentation-bar--visible');
      this.dom.container.setAttribute('aria-hidden', 'false');
    }
    if (this.dom.toggleBtn) {
      this.dom.toggleBtn.classList.add('mc__pres-toggle--active');
    }
  }

  _hide() {
    if (this.dom.container) {
      this.dom.container.classList.remove('mc__presentation-bar--visible');
      this.dom.container.setAttribute('aria-hidden', 'true');
    }
    if (this.dom.toggleBtn) {
      this.dom.toggleBtn.classList.remove('mc__pres-toggle--active');
    }
  }

  _updateStep(stepIndex, step, totalSteps) {
    if (this.dom.stepBadge) {
      this.dom.stepBadge.textContent = `[${String(stepIndex + 1).padStart(2, '0')} / ${String(totalSteps).padStart(2, '0')}]`;
    }
    if (this.dom.title) {
      this.dom.title.textContent = step.title;
    }
    if (this.dom.subtitle) {
      this.dom.subtitle.textContent = step.subtitle;
    }
    if (this.dom.prevBtn) {
      this.dom.prevBtn.disabled = stepIndex === 0;
    }
    if (this.dom.nextBtn) {
      this.dom.nextBtn.disabled = stepIndex === totalSteps - 1;
    }
  }
}
