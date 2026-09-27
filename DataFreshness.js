/**
 * DataFreshness.js — Phase 11: Live Cosmos
 *
 * Provides a standard taxonomy of data freshness states.
 * Every live data item carries one of these states so the UI
 * can communicate provenance to the user without ambiguity.
 *
 *   LIVE      — Fetched within the last polling interval; source confirmed active
 *   RECENT    — Fetched in the current session (< 30 min ago)
 *   CACHED    — Loaded from in-memory cache; timestamp preserved
 *   ARCHIVED  — Historical dataset; no live refresh expected
 *   UNAVAILABLE — Source could not be reached; no valid data available
 *   SIMULATED — Educational model; not a live measurement
 */

export const DATA_FRESHNESS = Object.freeze({
  LIVE:        'LIVE',
  RECENT:      'RECENT',
  CACHED:      'CACHED',
  ARCHIVED:    'ARCHIVED',
  UNAVAILABLE: 'UNAVAILABLE',
  SIMULATED:   'SIMULATED',
});

/**
 * Derive a freshness state from the age of a timestamp (ms since epoch).
 * @param {number|null} fetchedAt   — Date.now() value when data was last fetched
 * @param {number}      maxLiveMs   — Window (ms) within which data is considered LIVE
 * @param {number}      maxRecentMs — Window (ms) within which data is considered RECENT
 * @returns {string} DATA_FRESHNESS value
 */
export function deriveFreshness(fetchedAt, maxLiveMs = 5 * 60_000, maxRecentMs = 30 * 60_000) {
  if (!fetchedAt) return DATA_FRESHNESS.UNAVAILABLE;
  const age = Date.now() - fetchedAt;
  if (age <= maxLiveMs)   return DATA_FRESHNESS.LIVE;
  if (age <= maxRecentMs) return DATA_FRESHNESS.RECENT;
  return DATA_FRESHNESS.CACHED;
}

/**
 * Returns a human-readable label for a freshness state.
 * @param {string} state
 * @param {number|null} fetchedAt
 * @returns {string}
 */
export function freshnessLabel(state, fetchedAt = null) {
  switch (state) {
    case DATA_FRESHNESS.LIVE:
      return fetchedAt ? `LIVE · ${_utcTime(fetchedAt)}` : 'LIVE';
    case DATA_FRESHNESS.RECENT:
      return fetchedAt ? `RECENT · ${_utcTime(fetchedAt)}` : 'RECENT';
    case DATA_FRESHNESS.CACHED:
      return fetchedAt ? `CACHED · ${_utcTime(fetchedAt)}` : 'CACHED';
    case DATA_FRESHNESS.ARCHIVED:
      return 'ARCHIVED DATA';
    case DATA_FRESHNESS.UNAVAILABLE:
      return 'DATA TEMPORARILY UNAVAILABLE';
    case DATA_FRESHNESS.SIMULATED:
      return 'EDUCATIONAL VISUALIZATION';
    default:
      return state;
  }
}

/**
 * Format a timestamp (ms since epoch) as UTC HH:MM string.
 * @param {number} ts
 * @returns {string}
 */
function _utcTime(ts) {
  const d = new Date(ts);
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m} UTC`;
}
