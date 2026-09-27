/**
 * CacheManager.js — Phase 11: Live Cosmos
 *
 * Lightweight in-memory cache with per-entry TTL and source metadata.
 * Prevents redundant network requests during rapid UI interactions
 * and maintains a verifiable data trail for source transparency.
 *
 * Architecture principle: cache is READ only by services, WRITTEN only
 * by the service that owns the data source — never the UI.
 */

export class CacheManager {
  constructor() {
    /** @type {Map<string, CacheEntry>} */
    this._store = new Map();
  }

  /**
   * Store data under a key with an optional TTL.
   * @param {string}  key
   * @param {*}       data
   * @param {object}  [meta]
   * @param {string}  [meta.source]       — Human-readable source name
   * @param {string}  [meta.dataset]      — Dataset identifier
   * @param {number}  [meta.ttlMs]        — TTL in ms (default: 5 min)
   * @param {string}  [meta.unit]         — Primary unit of the data
   */
  set(key, data, meta = {}) {
    const now = Date.now();
    this._store.set(key, {
      data,
      fetchedAt: now,
      expiresAt: now + (meta.ttlMs ?? 5 * 60_000),
      source:    meta.source   ?? 'UNKNOWN',
      dataset:   meta.dataset  ?? '',
      unit:      meta.unit     ?? '',
    });
  }

  /**
   * Retrieve a cache entry (regardless of TTL expiry).
   * Returns null if not found.
   * @param {string} key
   * @returns {CacheEntry|null}
   */
  get(key) {
    return this._store.get(key) ?? null;
  }

  /**
   * Returns the cached data only if still within TTL.
   * Returns null if missing or stale.
   * @param {string} key
   * @returns {CacheEntry|null}
   */
  getFresh(key) {
    const entry = this._store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) return null;
    return entry;
  }

  /**
   * Returns true when data exists and is within TTL.
   * @param {string} key
   */
  isFresh(key) {
    return this.getFresh(key) !== null;
  }

  /**
   * Returns age in milliseconds of a cached entry.
   * @param {string} key
   * @returns {number|null}
   */
  ageMs(key) {
    const entry = this._store.get(key);
    if (!entry) return null;
    return Date.now() - entry.fetchedAt;
  }

  /**
   * Remove a specific key.
   * @param {string} key
   */
  invalidate(key) {
    this._store.delete(key);
  }

  /** Remove all entries. */
  clear() {
    this._store.clear();
  }
}

/**
 * @typedef {object} CacheEntry
 * @property {*}      data
 * @property {number} fetchedAt   — Date.now() at time of storage
 * @property {number} expiresAt   — Date.now() threshold for freshness
 * @property {string} source
 * @property {string} dataset
 * @property {string} unit
 */

/** Singleton cache instance shared across all Phase 11 services. */
export const globalCache = new CacheManager();
