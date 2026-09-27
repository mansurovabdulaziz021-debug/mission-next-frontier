/**
 * NasaDataService — Autonomous Scientific Data Layer
 * Handles dynamic data retrieval from NASA/JPL Horizons API, robust caching,
 * timeout controls, parsing, and seamless fallback to verified static datasets.
 */

import { SCIENTIFIC_DATA, SCIENTIFIC_SOURCES } from './scientificData.js';

export const DATA_STATES = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  SUCCESS_DYNAMIC: 'SUCCESS_DYNAMIC',
  SUCCESS_STATIC: 'SUCCESS_STATIC',
  OFFLINE_FALLBACK: 'OFFLINE_FALLBACK',
  ERROR: 'ERROR'
};

const JPL_HORIZONS_COMMANDS = {
  EARTH: '399',
  MOON: '301',
  MARS: '499',
  SOLAR_SYSTEM: '10'
};

export class NasaDataService {
  constructor() {
    this._cache = new Map();
    this._activeRequests = new Map();
    this._timeoutMs = 3500;
  }

  /**
   * Retrieves verified scientific data for a destination, prioritizing
   * live JPL Horizons dynamic attributes with automatic verified static fallback.
   *
   * @param {'EARTH'|'MOON'|'MARS'|'SOLAR_SYSTEM'} destId
   * @returns {Promise<{
   *   status: string,
   *   sourceType: string,
   *   provenance: string,
   *   epoch: string,
   *   data: typeof SCIENTIFIC_DATA[keyof typeof SCIENTIFIC_DATA],
   *   dynamicAttrs: Record<string, string|number>|null
   * }>}
   */
  async getDestinationData(destId) {
    const staticRecord = SCIENTIFIC_DATA[destId] || SCIENTIFIC_DATA.EARTH;

    // Check memory cache first
    if (this._cache.has(destId)) {
      const cached = this._cache.get(destId);
      return {
        ...cached,
        status: cached.sourceType === 'DYNAMIC_JPL_HORIZONS' ? DATA_STATES.SUCCESS_DYNAMIC : DATA_STATES.SUCCESS_STATIC,
        fromCache: true
      };
    }

    // Check if a request is already in flight for this destination
    if (this._activeRequests.has(destId)) {
      return this._activeRequests.get(destId);
    }

    const requestPromise = this._fetchWithFallback(destId, staticRecord);
    this._activeRequests.set(destId, requestPromise);

    try {
      const result = await requestPromise;
      this._cache.set(destId, result);
      return result;
    } finally {
      this._activeRequests.delete(destId);
    }
  }

  /**
   * Attempts live JPL Horizons API fetch, falling back to verified static dataset.
   * @private
   */
  async _fetchWithFallback(destId, staticRecord) {
    const cmd = JPL_HORIZONS_COMMANDS[destId];
    if (!cmd) {
      return {
        status: DATA_STATES.SUCCESS_STATIC,
        sourceType: 'VERIFIED_NASA_STATIC',
        provenance: 'NASA Goddard Space Flight Center (NSSDC Archive)',
        epoch: new Date().toISOString(),
        data: staticRecord,
        dynamicAttrs: null
      };
    }

    // Try primary Vite proxy first, then direct fallback
    const endpoints = [
      `/api/nasa/api/horizons.api?format=json&COMMAND='${cmd}'&OBJ_DATA='YES'&MAKE_EPHEM='NO'`,
      `https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND='${cmd}'&OBJ_DATA='YES'&MAKE_EPHEM='NO'`
    ];

    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this._timeoutMs);

        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' }
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (json && json.result) {
            const parsed = this._parseHorizonsText(json.result);
            return {
              status: DATA_STATES.SUCCESS_DYNAMIC,
              sourceType: 'DYNAMIC_JPL_HORIZONS',
              provenance: 'NASA/JPL Horizons API v1.2 (Live Astrodynamics Telemetry)',
              epoch: new Date().toISOString(),
              data: staticRecord,
              dynamicAttrs: parsed
            };
          }
        }
      } catch {
        // Continue to fallback
      }
    }

    // Safe and authoritative fallback
    return {
      status: DATA_STATES.SUCCESS_STATIC,
      sourceType: 'VERIFIED_NASA_STATIC',
      provenance: 'NASA Goddard Space Flight Center (NSSDC Verified Planetary Dataset)',
      epoch: new Date().toISOString(),
      data: staticRecord,
      dynamicAttrs: null
    };
  }

  /**
   * Safely parses physical parameters from JPL Horizons raw ASCII response.
   * @private
   * @param {string} text
   */
  _parseHorizonsText(text) {
    const parsed = {};

    const extract = (pattern) => {
      const match = text.match(pattern);
      return match ? match[1].trim() : null;
    };

    // Extract key physical fields
    parsed.meanRadius = extract(/Vol\.\s*mean\s*radius\s*\(km\)\s*=\s*([0-9.]+)/i);
    parsed.mass = extract(/Mass\s*x10\^([0-9]+)\s*\(kg\)\s*=\s*([0-9.]+)/i);
    parsed.density = extract(/Density\s*\(g\/cm\^3\)\s*=\s*([0-9.]+)/i);
    parsed.rotPeriod = extract(/Sidereal\s*rot\.\s*period\s*=\s*([0-9.]+\s*[a-zA-Z]+)/i);
    parsed.equGravity = extract(/Equ\.\s*gravity\s*m\/s\^2\s*=\s*([0-9.]+)/i);
    parsed.albedo = extract(/Geometric\s*Albedo\s*=\s*([0-9.]+)/i);
    parsed.meanTemp = extract(/Mean\s*temperature\s*\(K\)\s*=\s*([0-9.]+)/i);
    parsed.orbitSpeed = extract(/Orbital\s*speed,\s*km\/s\s*=\s*([0-9.]+)/i);
    parsed.solarConstant = extract(/Solar\s*Constant\s*\(W\/m\^2\)\s*[0-9.]+\s*[0-9.]+\s*([0-9.]+)/i);

    return parsed;
  }
}

export const nasaDataService = new NasaDataService();
