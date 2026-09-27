/**
 * SpaceWeatherService.js — Phase 11: Live Cosmos
 *
 * Fetches real-time space-weather data from NOAA SWPC (Space Weather
 * Prediction Center) public JSON endpoints.
 *
 * Sources verified November 2024:
 *   - NOAA SWPC Solar Wind (ACE/DSCOVR real-time data feed)
 *     https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json
 *   - NOAA SWPC Magnetometer
 *     https://services.swpc.noaa.gov/products/solar-wind/mag-7-day.json
 *   - NOAA Planetary K Index (Kp)
 *     https://services.swpc.noaa.gov/json/planetary_k_index_1m.json
 *
 * CORS: NOAA SWPC serves these with CORS headers (Access-Control-Allow-Origin: *)
 *       so they are accessible from browser contexts without a proxy.
 *
 * Update frequency: ~60 s for plasma/mag, 1 min for Kp
 * Rate limits: No documented hard limit; polling ≥ 60s is courteous.
 *
 * All numeric values are validated before use.
 * Malformed or out-of-range responses are rejected and the UI is notified.
 *
 * SCIENTIFIC LABELS:
 *   Vs     = Solar-wind bulk velocity (km/s)  — measured by ACE/DSCOVR SWEPAM
 *   Np     = Proton number density (cm⁻³)
 *   Tp     = Proton temperature (K)
 *   Bt     = Total interplanetary magnetic field magnitude (nT)
 *   Bz     = North–south component of IMF (nT)  — negative = enhanced storm risk
 *   Kp     = Global planetary geomagnetic activity index (0–9)
 */

import { globalCache } from './CacheManager.js';
import { DATA_FRESHNESS, deriveFreshness } from './DataFreshness.js';

const CACHE_KEY_PLASMA = 'swpc_plasma';
const CACHE_KEY_MAG    = 'swpc_mag';
const CACHE_KEY_KP     = 'swpc_kp';
const POLL_INTERVAL_MS = 120_000; // 2 min — courteous to NOAA

const PLASMA_URL = 'https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json';
const MAG_URL    = 'https://services.swpc.noaa.gov/products/solar-wind/mag-7-day.json';
const KP_URL     = 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json';

/** @type {SpaceWeatherService|null} */
let _instance = null;

export class SpaceWeatherService {
  constructor() {
    this._listeners = new Map();
    this._pollTimer = null;
    this._started   = false;
    /** Current normalized state. */
    this.state = {
      plasma:    null, // { timestamp, Vs, Np, Tp }
      mag:       null, // { timestamp, Bt, Bz }
      kp:        null, // { timestamp, kp }
      freshness: DATA_FRESHNESS.UNAVAILABLE,
      fetchedAt: null,
    };
  }

  /* ------------------------------------------------------------------
     Public API
     ------------------------------------------------------------------ */
  /**
   * Begin polling. Safe to call multiple times (idempotent).
   */
  start() {
    if (this._started) return;
    this._started = true;
    this._poll();
    this._pollTimer = setInterval(() => this._poll(), POLL_INTERVAL_MS);
  }

  /**
   * Stop polling (e.g. when section is hidden).
   */
  stop() {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
    }
    this._started = false;
  }

  /**
   * Return current state (may be cached / unavailable).
   * @returns {SpaceWeatherState}
   */
  getState() {
    return { ...this.state };
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
      try { cb(data); } catch (e) { /* swallow listener errors */ }
    }
  }

  /* ------------------------------------------------------------------
     Polling & Fetch
     ------------------------------------------------------------------ */
  async _poll() {
    // Check in-memory cache first to avoid redundant fetches
    const plasmaEntry = globalCache.getFresh(CACHE_KEY_PLASMA);
    const magEntry    = globalCache.getFresh(CACHE_KEY_MAG);
    const kpEntry     = globalCache.getFresh(CACHE_KEY_KP);

    if (plasmaEntry && magEntry && kpEntry) {
      // All fresh — update state from cache
      this._applyState(plasmaEntry.data, magEntry.data, kpEntry.data, plasmaEntry.fetchedAt);
      return;
    }

    try {
      const [plasmaRaw, magRaw, kpRaw] = await Promise.allSettled([
        _fetchJSON(PLASMA_URL),
        _fetchJSON(MAG_URL),
        _fetchJSON(KP_URL),
      ]);

      const now     = Date.now();
      const plasma  = plasmaRaw.status === 'fulfilled' ? _parsePlasma(plasmaRaw.value) : null;
      const mag     = magRaw.status   === 'fulfilled' ? _parseMag(magRaw.value)       : null;
      const kp      = kpRaw.status    === 'fulfilled' ? _parseKp(kpRaw.value)         : null;

      if (plasma) globalCache.set(CACHE_KEY_PLASMA, plasma, { ttlMs: POLL_INTERVAL_MS, source: 'NOAA SWPC', dataset: 'ACE/DSCOVR Solar Wind Plasma 7-Day', unit: 'km/s, cm⁻³, K' });
      if (mag)    globalCache.set(CACHE_KEY_MAG,    mag,    { ttlMs: POLL_INTERVAL_MS, source: 'NOAA SWPC', dataset: 'ACE/DSCOVR Solar Wind Magnetometer 7-Day', unit: 'nT' });
      if (kp)     globalCache.set(CACHE_KEY_KP,     kp,     { ttlMs: POLL_INTERVAL_MS, source: 'NOAA SWPC', dataset: 'Planetary K-Index 1-Minute', unit: 'Kp (0–9)' });

      // Merge with stale cache if partial failure
      const pData = plasma ?? globalCache.get(CACHE_KEY_PLASMA)?.data ?? null;
      const mData = mag    ?? globalCache.get(CACHE_KEY_MAG)?.data    ?? null;
      const kData = kp     ?? globalCache.get(CACHE_KEY_KP)?.data     ?? null;

      const fetchAt = plasma || mag || kp ? now : null;
      this._applyState(pData, mData, kData, fetchAt);

    } catch (err) {
      console.warn('[SpaceWeatherService] Poll error:', err.message);
      this._applyState(null, null, null, null);
    }
  }

  _applyState(plasma, mag, kp, fetchedAt) {
    const freshness = fetchedAt
      ? deriveFreshness(fetchedAt, POLL_INTERVAL_MS * 1.5, 30 * 60_000)
      : DATA_FRESHNESS.UNAVAILABLE;

    const hasData = plasma || mag || kp;

    this.state = {
      plasma,
      mag,
      kp,
      freshness: hasData ? freshness : DATA_FRESHNESS.UNAVAILABLE,
      fetchedAt: fetchedAt ?? this.state.fetchedAt, // preserve last known timestamp
    };

    this.emit('updated', this.state);
  }
}

/* ------------------------------------------------------------------
   Parsers — validate raw NOAA responses
   ------------------------------------------------------------------ */

/**
 * NOAA plasma-7-day.json: 2D array. First row = column headers.
 * Columns: [time_tag, density, speed, temperature]
 * We take the last row with valid numeric values.
 * @param {Array} rows
 * @returns {PlasmaData|null}
 */
function _parsePlasma(rows) {
  if (!Array.isArray(rows) || rows.length < 2) return null;

  for (let i = rows.length - 1; i >= 1; i--) {
    const r = rows[i];
    if (!Array.isArray(r) || r.length < 4) continue;
    const Np = parseFloat(r[1]);
    const Vs = parseFloat(r[2]);
    const Tp = parseFloat(r[3]);
    if (isNaN(Np) || isNaN(Vs) || isNaN(Tp)) continue;
    if (Vs < 200 || Vs > 2000) continue; // sanity range km/s
    if (Np < 0   || Np > 500)  continue; // sanity range cm⁻³
    return { timestamp: r[0], Vs: Math.round(Vs), Np: +Np.toFixed(2), Tp: Math.round(Tp) };
  }
  return null;
}

/**
 * NOAA mag-7-day.json: 2D array. First row = column headers.
 * Columns: [time_tag, bx_gsm, by_gsm, bz_gsm, lon_gsm, lat_gsm, bt]
 * @param {Array} rows
 * @returns {MagData|null}
 */
function _parseMag(rows) {
  if (!Array.isArray(rows) || rows.length < 2) return null;

  for (let i = rows.length - 1; i >= 1; i--) {
    const r = rows[i];
    if (!Array.isArray(r) || r.length < 7) continue;
    const Bz = parseFloat(r[3]);
    const Bt = parseFloat(r[6]);
    if (isNaN(Bz) || isNaN(Bt)) continue;
    if (Math.abs(Bz) > 100 || Math.abs(Bt) > 100) continue; // nT sanity
    return { timestamp: r[0], Bz: +Bz.toFixed(2), Bt: +Bt.toFixed(2) };
  }
  return null;
}

/**
 * NOAA planetary_k_index_1m.json: array of objects { time_tag, kp }
 * @param {Array} arr
 * @returns {KpData|null}
 */
function _parseKp(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;

  for (let i = arr.length - 1; i >= 0; i--) {
    const obj = arr[i];
    if (!obj || typeof obj.kp === 'undefined') continue;
    const kp = parseFloat(obj.kp);
    if (isNaN(kp) || kp < 0 || kp > 9) continue;
    return { timestamp: obj.time_tag, kp: +kp.toFixed(1) };
  }
  return null;
}

/* ------------------------------------------------------------------
   HTTP helper
   ------------------------------------------------------------------ */
/**
 * Fetch JSON with a timeout.
 * @param {string} url
 * @param {number} [timeoutMs]
 */
async function _fetchJSON(url, timeoutMs = 12_000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(id);
  }
}

/* ------------------------------------------------------------------
   Singleton
   ------------------------------------------------------------------ */
export const spaceWeatherService = (() => {
  if (!_instance) _instance = new SpaceWeatherService();
  return _instance;
})();

/**
 * @typedef {object} PlasmaData
 * @property {string} timestamp  ISO-8601 UTC
 * @property {number} Vs         Solar wind speed km/s
 * @property {number} Np         Proton density cm⁻³
 * @property {number} Tp         Proton temperature K
 */
/**
 * @typedef {object} MagData
 * @property {string} timestamp
 * @property {number} Bz  IMF Bz nT
 * @property {number} Bt  IMF total magnitude nT
 */
/**
 * @typedef {object} KpData
 * @property {string} timestamp
 * @property {number} kp  Kp index 0–9
 */
/**
 * @typedef {object} SpaceWeatherState
 * @property {PlasmaData|null} plasma
 * @property {MagData|null}    mag
 * @property {KpData|null}     kp
 * @property {string}          freshness  DATA_FRESHNESS value
 * @property {number|null}     fetchedAt  ms epoch
 */
