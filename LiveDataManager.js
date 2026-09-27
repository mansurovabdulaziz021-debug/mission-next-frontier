/**
 * LiveDataManager.js — Phase 11: Live Cosmos
 *
 * Central coordinator for all live data sources.
 * Follows the architecture:
 *
 *   SOURCE → FETCH → NORMALIZE → CACHE → STATE → EVENT → UI
 *
 * Responsibilities:
 *   - Start / stop all data services in sync with app lifecycle
 *   - Broadcast a unified 'dataHeartbeat' every cycle
 *   - Expose a DataSourceRegistry for source transparency
 *   - Connect live data to Phenomena, Discovery, and Scenario hooks
 *   - Handle degraded state when services are unavailable
 */

import { spaceWeatherService } from './SpaceWeatherService.js';
import { ephemerisService }    from './EphemerisService.js';
import { temporalState, TIME_CONTEXT } from './TemporalState.js';
import { DATA_FRESHNESS, freshnessLabel } from './DataFreshness.js';

/** @type {LiveDataManager|null} */
let _inst = null;

export class LiveDataManager {
  constructor() {
    this._listeners = new Map();
    this._started   = false;
    this._heartbeatTimer = null;

    /** Source transparency registry */
    this.registry = {
      spaceWeather: {
        name:    'NOAA SWPC',
        dataset: 'Solar Wind Plasma & IMF (ACE/DSCOVR) + Planetary K-Index',
        url:     'https://www.swpc.noaa.gov/',
        apiUrl:  'https://services.swpc.noaa.gov/',
        update:  'Every 60–120 seconds',
        type:    'LIVE',
        status:  DATA_FRESHNESS.UNAVAILABLE,
        lastUpdated: null,
      },
      ephemeris: {
        name:    'JPL Approximate Planetary Positions',
        dataset: 'Keplerian orbital elements, Table 1 (1800–2050 CE)',
        url:     'https://ssd.jpl.nasa.gov/planets/approx_pos.html',
        apiUrl:  null,
        update:  'Computed on demand (no network)',
        type:    'CALCULATED',
        status:  DATA_FRESHNESS.ARCHIVED, // ephemeris is always available
        lastUpdated: 'J2000 epoch elements (continuously valid 1800–2050)',
      },
    };
  }

  /* ------------------------------------------------------------------
     Lifecycle
     ------------------------------------------------------------------ */
  start() {
    if (this._started) return;
    this._started = true;

    // Start network services
    spaceWeatherService.start();

    // Listen for updates
    spaceWeatherService.on('updated', (state) => {
      this.registry.spaceWeather.status      = state.freshness;
      this.registry.spaceWeather.lastUpdated = state.fetchedAt
        ? new Date(state.fetchedAt).toISOString()
        : null;

      this.emit('spaceWeatherUpdated', state);
      this._emitHeartbeat();
    });

    temporalState.on('timeMachineActive', (ev) => {
      this.emit('temporalStateChanged', ev);
      this._recomputeEphemeris(ev.date);
    });

    temporalState.on('returnedToNow', (ev) => {
      this.emit('temporalStateChanged', ev);
      this._recomputeEphemeris(ev.date);
    });

    temporalState.on('liveTickUpdate', (ev) => {
      this._recomputeEphemeris(ev.date);
    });

    // Heartbeat every 90s
    this._heartbeatTimer = setInterval(() => this._emitHeartbeat(), 90_000);

    // Initial ephemeris computation
    this._recomputeEphemeris(temporalState.date);
    this._emitHeartbeat();
  }

  stop() {
    spaceWeatherService.stop();
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
    this._started = false;
  }

  /* ------------------------------------------------------------------
     Data Access
     ------------------------------------------------------------------ */
  /** @returns {import('./SpaceWeatherService.js').SpaceWeatherState} */
  getSpaceWeather() {
    return spaceWeatherService.getState();
  }

  /**
   * @returns {Record<string, import('./EphemerisService.js').EphemerisResult>}
   */
  getPlanetaryPositions(date) {
    return ephemerisService.computeAll(date ?? temporalState.date);
  }

  /** @returns {typeof this.registry} */
  getRegistry() {
    return { ...this.registry };
  }

  /* ------------------------------------------------------------------
     Internal
     ------------------------------------------------------------------ */
  _recomputeEphemeris(date) {
    const positions = ephemerisService.computeAll(date);
    this.emit('ephemerisUpdated', {
      positions,
      date,
      context: temporalState.context,
      isLive: temporalState.isLive,
    });
  }

  _emitHeartbeat() {
    this.emit('dataHeartbeat', {
      timestamp:    new Date().toISOString(),
      spaceWeather: this.registry.spaceWeather.status,
      ephemeris:    this.registry.ephemeris.status,
      temporal: {
        context:  temporalState.context,
        date:     temporalState.date.toISOString(),
        isLive:   temporalState.isLive,
      },
    });
  }

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
}

/** Singleton live data manager. */
export const liveDataManager = (() => {
  if (!_inst) _inst = new LiveDataManager();
  return _inst;
})();
