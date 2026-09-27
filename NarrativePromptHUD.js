/**
 * NarrativePromptHUD.js — Contextual Suggestions & Grounded Insight Overlays
 * 
 * Manages:
 *   - "Up Next" subtle contextual suggestion pill
 *   - "One More Thing" rare grounded scientific surprise modal
 *   - "Final Insight" philosophical & scientific synthesis modal
 */

import { narrativeRouter } from '../conductor/NarrativeRouter.js';
import { missionState } from '../state/MissionState.js';

export class NarrativePromptHUD {
  /**
   * @param {object} app Main application instance
   */
  constructor(app) {
    this.app = app;

    this.dom = {
      suggestionChip: document.getElementById('mc-narrative-chip'),
      suggestionText: document.getElementById('mc-narrative-text'),
      suggestionBtn:  document.getElementById('mc-narrative-btn'),
      suggestionClose:document.getElementById('mc-narrative-close'),

      // Modal Overlays
      modal:          document.getElementById('mc-insight-modal'),
      kicker:         document.getElementById('mc-insight-kicker'),
      title:          document.getElementById('mc-insight-title'),
      philosophy:     document.getElementById('mc-insight-philosophy'),
      body:           document.getElementById('mc-insight-body'),
      citation:       document.getElementById('mc-insight-citation'),
      closeBtn:       document.getElementById('mc-insight-close'),
      actionBtn:      document.getElementById('mc-insight-action'),
      replayBtn:      document.getElementById('mc-insight-replay-btn'),
      sourcesBtn:     document.getElementById('mc-insight-sources-btn')
    };

    this._currentAction = null;
    this._isFinalModal = false;
    this._bindEvents();
  }

  _bindEvents() {
    // 1. Suggestion Chip Interaction
    this.dom.suggestionBtn?.addEventListener('click', () => {
      if (this._currentAction) {
        this._executeAction(this._currentAction);
      }
      this._hideSuggestion();
    });

    this.dom.suggestionClose?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._hideSuggestion();
    });

    // 2. Insight Modal Interaction
    this.dom.closeBtn?.addEventListener('click', () => {
      this._hideModal();
    });

    this.dom.actionBtn?.addEventListener('click', () => {
      this._hideModal();
    });

    this.dom.replayBtn?.addEventListener('click', () => {
      this._hideModal();
      if (this.app.conductor?.presentation) {
        this.app.conductor.presentation.restartExperience();
      }
    });

    this.dom.sourcesBtn?.addEventListener('click', () => {
      this._hideModal();
      this.app.scienceHUD?.openAllSourcesInspector();
    });

    // 3. Router Event Subscriptions
    narrativeRouter.on('suggestionReady', (suggestion) => {
      this._showSuggestion(suggestion);
    });

    narrativeRouter.on('oneMoreThing', (insight) => {
      this._showModal(insight, false);
    });

    narrativeRouter.on('showFinalInsight', (insight) => {
      this._showModal(insight, true);
    });
  }

  _showSuggestion(suggestion) {
    if (!this.dom.suggestionChip || !suggestion.suggestions || suggestion.suggestions.length === 0) return;

    const first = suggestion.suggestions[0];
    this._currentAction = first;

    if (this.dom.suggestionText) {
      this.dom.suggestionText.textContent = `NEXT // ${first.label}`;
    }

    this.dom.suggestionChip.classList.add('mc__narrative-chip--visible');
    this.dom.suggestionChip.setAttribute('aria-hidden', 'false');

    // Auto-hide suggestion after 12 seconds
    clearTimeout(this._chipTimer);
    this._chipTimer = setTimeout(() => {
      this._hideSuggestion();
    }, 12000);
  }

  _hideSuggestion() {
    if (this.dom.suggestionChip) {
      this.dom.suggestionChip.classList.remove('mc__narrative-chip--visible');
      this.dom.suggestionChip.setAttribute('aria-hidden', 'true');
    }
  }

  _showModal(insight, isFinal = false) {
    if (!this.dom.modal) return;
    this._isFinalModal = isFinal;

    if (this.dom.kicker) this.dom.kicker.textContent = insight.kicker || 'GROUNDED SCIENTIFIC INSIGHT';
    if (this.dom.title) this.dom.title.textContent = insight.title || '';
    if (this.dom.citation) this.dom.citation.textContent = insight.citation || insight.author || '';

    if (this.dom.philosophy) {
      if (isFinal && insight.philosophy) {
        this.dom.philosophy.textContent = `“${insight.philosophy}”`;
        this.dom.philosophy.style.display = 'block';
      } else {
        this.dom.philosophy.style.display = 'none';
      }
    }

    if (this.dom.body) {
      this.dom.body.innerHTML = (insight.body || '')
        .split('\n\n')
        .map(p => `<p class="mc__insight-para">${p}</p>`)
        .join('');
    }

    if (this.dom.actionBtn) {
      this.dom.actionBtn.textContent = isFinal ? 'RETURN TO EXPLORATION →' : 'CONTINUE EXPLORATION →';
    }

    if (this.dom.replayBtn) {
      this.dom.replayBtn.style.display = isFinal ? 'inline-flex' : 'none';
    }

    if (this.dom.sourcesBtn) {
      this.dom.sourcesBtn.style.display = isFinal ? 'inline-flex' : 'none';
    }

    this.dom.modal.classList.add('mc__insight-modal--visible');
    this.dom.modal.setAttribute('aria-hidden', 'false');
  }

  _hideModal() {
    if (this.dom.modal) {
      this.dom.modal.classList.remove('mc__insight-modal--visible');
      this.dom.modal.setAttribute('aria-hidden', 'true');
    }

    if (this._isFinalModal) {
      this._isFinalModal = false;
      if (this.app.transitions && typeof this.app.transitions.exitEndingCeremony === 'function') {
        this.app.transitions.exitEndingCeremony();
      }
      if (this.app.conductor?.audio && typeof this.app.conductor.audio.unduck === 'function') {
        this.app.conductor.audio.unduck();
      }
    }
  }

  _executeAction(actionItem) {
    switch (actionItem.action) {
      case 'OPEN_PHENOMENON':
        this.app.phenomenaHUD?.show();
        if (actionItem.payload) {
          missionState.emit('openPhenomenon', actionItem.payload);
        }
        break;

      case 'OPEN_OBSERVATORY':
        this.app.observatoryHUD?.show(actionItem.payload);
        break;

      case 'OPEN_ARCHITECT':
        this.app.missionArchitectHUD?.show();
        if (actionItem.payload) {
          this.app.missionArchitectHUD?.engine.setTarget(actionItem.payload);
        }
        break;

      case 'OPEN_SCIENCE':
        this.app.scienceHUD?.toggle();
        break;

      default:
        break;
    }
  }
}
