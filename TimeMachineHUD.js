/**
 * TimeMachineHUD.js — Phase 11: Live Cosmos
 *
 * "COSMIC TIME MACHINE" — Navigate through time and see how the
 * solar system has changed.
 *
 * Controls:
 *   - Year/decade slider covering 1800–2050 CE
 *   - Back/Forward step buttons (1y, 10y)
 *   - "Return to NOW" button (always visible when active)
 *   - Timestamp display showing current selected date
 *   - Context badge: LIVE / PAST / FUTURE + CALCULATED
 *   - Current planetary positions update with time
 *
 * Scientific clarity:
 *   - All time-shifted data is labeled CALCULATED (Keplerian ephemeris)
 *   - Space weather cannot be time-shifted (only current fetch is real)
 *   - Future/past projections cannot be compared as equal to observations
 *
 * Animation:
 *   - Smooth positional lerp when time is dragged
 *   - Reduced motion: instant swap
 */

import { temporalState, TIME_CONTEXT } from '../live/TemporalState.js';
import { ephemerisService } from '../live/EphemerisService.js';
import { liveDataManager }  from '../live/LiveDataManager.js';
import { audioManager }     from '../audio/AudioManager.js';
import { AUDIO_EVENTS }     from '../audio/AudioEvents.js';
import { missionState }     from '../state/MissionState.js';

const MIN_YEAR = 1800;
const MAX_YEAR = 2050;

export class TimeMachineHUD {
  constructor() {
    this._isOpen = false;
    this._scrubbing = false;
    this._scrubDebounce = null;
    this._reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this._unsubscribers = [];
    this._build();
  }

  get isOpen() { return this._isOpen; }

  /* ------------------------------------------------------------------
     Lifecycle
     ------------------------------------------------------------------ */
  show() {
    if (this._isOpen) return;
    this._isOpen = true;
    const el = document.getElementById('mc-time-machine');
    if (!el) return;
    el.setAttribute('aria-hidden', 'false');
    el.classList.add('mc__time-machine--open');
    missionState.emit('enterTimeMachine');
    audioManager.play(AUDIO_EVENTS.TRANSITION_WHOOSH);
    this._syncToTemporalState();
    this._subscribe();
  }

  hide() {
    if (!this._isOpen) return;
    this._isOpen = false;
    const el = document.getElementById('mc-time-machine');
    if (!el) return;
    el.setAttribute('aria-hidden', 'true');
    el.classList.remove('mc__time-machine--open');
    missionState.emit('exitTimeMachine');
    this._unsubscribe();
  }

  close() {
    this.hide();
  }

  toggle() {
    this._isOpen ? this.hide() : this.show();
  }

  /* ------------------------------------------------------------------
     DOM Wiring
     ------------------------------------------------------------------ */
  _build() {
    // Close button
    document.getElementById('mc-tm-close')
      ?.addEventListener('click', () => this.hide());

    // Return to NOW
    document.getElementById('mc-tm-now-btn')
      ?.addEventListener('click', () => {
        temporalState.returnToNow();
        audioManager.play(AUDIO_EVENTS.TARGET_ACQUIRE);
      });

    // Year input (slider)
    const slider = document.getElementById('mc-tm-slider');
    if (slider) {
      slider.min   = String(MIN_YEAR);
      slider.max   = String(MAX_YEAR);
      slider.value = String(new Date().getFullYear());

      slider.addEventListener('input', () => {
        const year = parseInt(slider.value, 10);
        this._scrubToYear(year, false); // fast update, no debounce
      });

      slider.addEventListener('change', () => {
        const year = parseInt(slider.value, 10);
        this._scrubToYear(year, true); // commit
      });

      // Keyboard shortcuts on slider
      slider.addEventListener('keydown', (e) => {
        const year = parseInt(slider.value, 10);
        if (e.key === 'ArrowRight') this._scrubToYear(Math.min(year + 1, MAX_YEAR), true);
        if (e.key === 'ArrowLeft')  this._scrubToYear(Math.max(year - 1, MIN_YEAR), true);
        if (e.key === 'ArrowUp')    this._scrubToYear(Math.min(year + 10, MAX_YEAR), true);
        if (e.key === 'ArrowDown')  this._scrubToYear(Math.max(year - 10, MIN_YEAR), true);
      });
    }

    // Step buttons
    document.getElementById('mc-tm-prev1y')
      ?.addEventListener('click', () => this._step(-1));
    document.getElementById('mc-tm-next1y')
      ?.addEventListener('click', () => this._step(1));
    document.getElementById('mc-tm-prev10y')
      ?.addEventListener('click', () => this._step(-10));
    document.getElementById('mc-tm-next10y')
      ?.addEventListener('click', () => this._step(10));

    // "Compare to NOW" toggle
    document.getElementById('mc-tm-compare-btn')
      ?.addEventListener('click', () => this._toggleCompareMode());
  }

  /* ------------------------------------------------------------------
     Time Scrubbing
     ------------------------------------------------------------------ */
  _scrubToYear(year, commit) {
    const date = new Date(`${year}-06-21T00:00:00Z`); // use mid-year
    this._updateSliderLabel(year);
    this._updatePositionDisplay(date);

    if (commit) {
      const result = temporalState.setTimeMachineDate(date);
      if (!result.ok) {
        console.warn('[TimeMachineHUD]', result.error);
        return;
      }
      // Emit ephemeris update via liveDataManager
      liveDataManager.emit('ephemerisUpdated', {
        positions: ephemerisService.computeAll(date),
        date,
        context: temporalState.context,
        isLive: false,
      });
    }
  }

  _step(years) {
    const current = temporalState.date;
    const next = temporalState.clamp(
      new Date(current.getFullYear() + years, current.getMonth(), current.getDate())
    );
    const result = temporalState.setTimeMachineDate(next);
    if (!result.ok) return;
    const year = next.getFullYear();
    this._updateSliderLabel(year);
    this._updateSliderValue(year);
    this._updatePositionDisplay(next);
    audioManager.play(AUDIO_EVENTS.UI_CLICK);
  }

  /* ------------------------------------------------------------------
     UI Updates
     ------------------------------------------------------------------ */
  _syncToTemporalState() {
    const d    = temporalState.date;
    const year = d.getFullYear();
    this._updateSliderValue(year);
    this._updateSliderLabel(year);
    this._updatePositionDisplay(d);
    this._updateContextBadge();
  }

  _subscribe() {
    const u1 = temporalState.on('timeMachineActive', () => {
      this._updateContextBadge();
    });
    const u2 = temporalState.on('returnedToNow', () => {
      this._updateContextBadge();
      this._syncToTemporalState();
    });
    this._unsubscribers.push(u1, u2);
  }

  _unsubscribe() {
    this._unsubscribers.forEach(u => typeof u === 'function' && u());
    this._unsubscribers = [];
  }

  _updateSliderValue(year) {
    const slider = document.getElementById('mc-tm-slider');
    if (slider) slider.value = String(year);
  }

  _updateSliderLabel(year) {
    const el = document.getElementById('mc-tm-year-label');
    if (el) el.textContent = String(year);

    const nowEl = document.getElementById('mc-tm-now-btn');
    const thisYear = new Date().getFullYear();
    if (nowEl) {
      const isNow = year === thisYear && temporalState.isLive;
      nowEl.disabled = isNow;
      nowEl.textContent = isNow ? 'NOW ✓' : 'RETURN TO NOW';
    }
  }

  _updatePositionDisplay(date) {
    const positions = ephemerisService.computeAll(date);
    const bodies = ['EARTH', 'MARS', 'VENUS', 'MERCURY'];
    for (const body of bodies) {
      const pos = positions[body];
      if (!pos) continue;
      const id = `mc-tm-pos-${body.toLowerCase()}`;
      const auEl  = document.getElementById(`${id}-au`);
      const lonEl = document.getElementById(`${id}-lon`);
      if (auEl)  auEl.textContent  = `${pos.au.toFixed(3)} AU`;
      if (lonEl) lonEl.textContent = `${pos.longitude.toFixed(1)}°`;
    }

    const dateLabel = document.getElementById('mc-tm-date-label');
    if (dateLabel) dateLabel.textContent = _formatDate(date);
  }

  _updateContextBadge() {
    const badge = document.getElementById('mc-tm-context-badge');
    if (!badge) return;
    const ctx = temporalState.context;
    badge.textContent = ctx === TIME_CONTEXT.LIVE ? 'LIVE // NOW'
      : ctx === TIME_CONTEXT.PAST   ? 'HISTORICAL // CALCULATED EPHEMERIS'
      : 'PROJECTED // CALCULATED EPHEMERIS';
    badge.className = `mc__tm-context-badge mc__tm-context-badge--${ctx.toLowerCase()}`;
  }

  _toggleCompareMode() {
    const panel = document.getElementById('mc-tm-compare-panel');
    if (!panel) return;
    const open = panel.classList.toggle('mc__tm-compare-panel--open');
    panel.setAttribute('aria-hidden', String(!open));

    if (open) {
      // Show NOW positions alongside selected-time positions
      const nowPositions = ephemerisService.computeAll(new Date());
      const selPositions = ephemerisService.computeAll(temporalState.date);

      const bodies = ['EARTH', 'MARS', 'VENUS', 'MERCURY'];
      for (const body of bodies) {
        const np = nowPositions[body];
        const sp = selPositions[body];
        if (!np || !sp) continue;
        const el = document.getElementById(`mc-tm-cmp-${body.toLowerCase()}`);
        if (!el) continue;
        const deltaAU  = Math.abs(sp.au - np.au).toFixed(3);
        const deltaLon = Math.abs(((sp.longitude - np.longitude + 540) % 360) - 180).toFixed(1);
        el.innerHTML = `
          <span class="mc__tm-cmp-label">${body}</span>
          <span class="mc__tm-cmp-now">${np.au.toFixed(3)} AU / ${np.longitude.toFixed(1)}°</span>
          <span class="mc__tm-cmp-sel">${sp.au.toFixed(3)} AU / ${sp.longitude.toFixed(1)}°</span>
          <span class="mc__tm-cmp-delta">Δ ${deltaAU} AU · ${deltaLon}°</span>
        `;
      }
    }
  }
}

/* ------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------ */
function _formatDate(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2,'0');
  const d = String(date.getUTCDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
