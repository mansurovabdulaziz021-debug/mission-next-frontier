/**
 * TemporalState.js — Phase 11: Live Cosmos
 *
 * Manages the selected time for the Cosmic Time Machine.
 * Separates the CURRENT (live) time context from the TIME MACHINE context,
 * ensuring the UI can always clearly distinguish:
 *
 *   LIVE   — user is in the present, data is real-time
 *   PAST   — user has selected a historical date (calculated)
 *   FUTURE — user has selected a future date (calculated)
 *
 * Scientific bounds:
 *   The Keplerian ephemeris (EphemerisService) is accurate from 1800 to 2050 CE.
 *   Time Machine navigation is constrained to this range.
 *   Dates outside this range are rejected with a clear explanation.
 *
 * All subscribers receive typed events. No UI manipulation happens inside this module.
 */

export const TIME_CONTEXT = Object.freeze({
  LIVE:    'LIVE',    // Real-time (now)
  PAST:    'PAST',    // Historical — calculated ephemeris
  FUTURE:  'FUTURE',  // Projected — calculated ephemeris
});

/** Minimum supported date (1800-01-01T00:00:00Z) */
const MIN_DATE = new Date('1800-01-01T00:00:00Z');
/** Maximum supported date (2050-12-31T23:59:59Z) */
const MAX_DATE = new Date('2050-12-31T23:59:59Z');

export class TemporalState {
  constructor() {
    this._context     = TIME_CONTEXT.LIVE;
    this._selectedDate = new Date(); // current "live" time
    this._liveInterval = null;
    this._listeners    = new Map();
    this._isTimeMachineActive = false;

    // Keep "live" time ticking every 30s so clocks stay accurate
    this._liveInterval = setInterval(() => {
      if (this._context === TIME_CONTEXT.LIVE) {
        this._selectedDate = new Date();
        this.emit('liveTickUpdate', { date: this._selectedDate, context: this._context });
      }
    }, 30_000);
  }

  /* ------------------------------------------------------------------
     Accessors
     ------------------------------------------------------------------ */
  /** @returns {Date} */
  get date() { return new Date(this._selectedDate); }

  /** @returns {string} TIME_CONTEXT value */
  get context() { return this._context; }

  /** @returns {boolean} */
  get isLive() { return this._context === TIME_CONTEXT.LIVE; }

  /** @returns {boolean} */
  get isTimeMachineActive() { return this._isTimeMachineActive; }

  /* ------------------------------------------------------------------
     Time Machine Controls
     ------------------------------------------------------------------ */
  /**
   * Enter Time Machine mode with a specific date.
   * @param {Date} date
   * @returns {{ ok: boolean, error?: string }}
   */
  setTimeMachineDate(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return { ok: false, error: 'Invalid date provided.' };
    }
    if (date < MIN_DATE) {
      return { ok: false, error: `Ephemeris accuracy limit: dates before 1800 CE are not supported.` };
    }
    if (date > MAX_DATE) {
      return { ok: false, error: `Ephemeris accuracy limit: projected dates beyond 2050 CE are not supported.` };
    }

    this._selectedDate = date;
    this._isTimeMachineActive = true;

    const now = new Date();
    this._context = date < now ? TIME_CONTEXT.PAST : TIME_CONTEXT.FUTURE;

    this.emit('timeMachineActive', {
      date:    this._selectedDate,
      context: this._context,
      isLive:  false,
    });

    return { ok: true };
  }

  /**
   * Shift the selected date by a number of days.
   * @param {number} days  — Positive = forward, negative = backward
   * @returns {{ ok: boolean, error?: string }}
   */
  shiftDays(days) {
    const next = new Date(this._selectedDate.getTime() + days * 86_400_000);
    return this.setTimeMachineDate(next);
  }

  /**
   * Shift the selected date by a number of years.
   * @param {number} years
   */
  shiftYears(years) {
    const next = new Date(this._selectedDate);
    next.setFullYear(next.getFullYear() + Math.round(years));
    return this.setTimeMachineDate(next);
  }

  /**
   * Return to LIVE (now) mode.
   */
  returnToNow() {
    this._selectedDate        = new Date();
    this._context             = TIME_CONTEXT.LIVE;
    this._isTimeMachineActive = false;

    this.emit('returnedToNow', {
      date:    this._selectedDate,
      context: this._context,
      isLive:  true,
    });
  }

  /**
   * Clamp a value to the supported date range [MIN, MAX].
   * @param {Date} d
   * @returns {Date}
   */
  clamp(d) {
    if (d < MIN_DATE) return new Date(MIN_DATE);
    if (d > MAX_DATE) return new Date(MAX_DATE);
    return d;
  }

  /** @returns {{ min: Date, max: Date }} */
  get supportedRange() {
    return { min: new Date(MIN_DATE), max: new Date(MAX_DATE) };
  }

  /** @returns {number} Fractional position [0,1] of selected date in the supported range */
  get normalizedPosition() {
    const total = MAX_DATE.getTime() - MIN_DATE.getTime();
    const pos   = this._selectedDate.getTime() - MIN_DATE.getTime();
    return Math.max(0, Math.min(1, pos / total));
  }

  /* ------------------------------------------------------------------
     Event Bus
     ------------------------------------------------------------------ */
  on(event, cb) {
    if (!this._listeners.has(event)) this._listeners.set(event, []);
    this._listeners.get(event).push(cb);
    return () => this.off(event, cb);
  }

  off(event, cb) {
    const arr = this._listeners.get(event);
    if (!arr) return;
    this._listeners.set(event, arr.filter(f => f !== cb));
  }

  emit(event, data) {
    const arr = this._listeners.get(event);
    if (!arr) return;
    for (const cb of arr) {
      try { cb(data); } catch(e) { /* swallow */ }
    }
  }

  destroy() {
    if (this._liveInterval) clearInterval(this._liveInterval);
  }
}

/** Singleton temporal state shared across Phase 11. */
export const temporalState = new TemporalState();
