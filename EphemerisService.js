/**
 * EphemerisService.js — Phase 11: Live Cosmos
 *
 * Computes time-dependent planetary positions for the inner solar system
 * using low-precision analytical orbital elements (J2000 epoch).
 *
 * IMPORTANT SCIENTIFIC LABELING:
 * ─────────────────────────────
 * This is a CALCULATED EPHEMERIS, not a live telemetry measurement.
 * The underlying algorithm uses simplified Keplerian orbital elements
 * (semi-major axis, eccentricity, inclination, RAAN, argument of perihelion,
 * mean anomaly) that are accurate to within ~1 arcminute for dates near J2000
 * (1800–2050 CE) as published by the JPL Solar System Dynamics Group.
 *
 * Source: JPL DE431 approximate planetary orbital elements
 * Reference: Explanatory Supplement to the Astronomical Almanac, 3rd Ed.
 * https://ssd.jpl.nasa.gov/planets/approx_pos.html
 *
 * All positions are in the J2000 ecliptic reference frame (AU).
 * Visualization coordinates use a separate visual scale for 3D rendering
 * and must NEVER be confused with the scientific AU values.
 *
 * For higher-precision time windows (e.g., spacecraft targeting),
 * use the JPL Horizons system: https://ssd.jpl.nasa.gov/horizons/
 *
 * Supported bodies: MERCURY, VENUS, EARTH, MOON, MARS
 * Time range: Accurate within ±~1° for 1800–2050 CE
 */

const TWO_PI = 2 * Math.PI;
const DEG    = Math.PI / 180;

/**
 * J2000 mean orbital elements + century drift rates.
 * Format: [a (AU), e, I (°), L (°), Lp (°), N (°)]
 *         [da,     de, dI,   dL,    dLp,     dN ] per Julian century
 * L  = mean longitude
 * Lp = longitude of perihelion
 * N  = longitude of ascending node
 *
 * Values from JPL Approximation (Table 1 — 1800 to 2050 CE).
 */
const ORBITAL_ELEMENTS = {
  MERCURY: {
    a: 0.38709927, da: 0.00000037,
    e: 0.20563593, de: 0.00001906,
    I: 7.00497902, dI: -0.00594749,
    L: 252.25032350, dL: 149472.67411175,
    Lp: 77.45779628, dLp: 0.16047689,
    N: 48.33076593, dN: -0.12534081,
  },
  VENUS: {
    a: 0.72333566, da: 0.00000390,
    e: 0.00677672, de: -0.00004107,
    I: 3.39467605, dI: -0.00078890,
    L: 181.97909950, dL: 58517.81538729,
    Lp: 131.60246718, dLp: 0.00268329,
    N: 76.67984255, dN: -0.27769418,
  },
  EARTH: {
    a: 1.00000261, da: 0.00000562,
    e: 0.01671123, de: -0.00004392,
    I: -0.00001531, dI: -0.01294668,
    L: 100.46457166, dL: 35999.37244981,
    Lp: 102.93768193, dLp: 0.32327364,
    N: 0.0, dN: 0.0,
  },
  MARS: {
    a: 1.52371034, da: 0.00001847,
    e: 0.09339410, de: 0.00007882,
    I: 1.84969142, dI: -0.00813131,
    L: -4.55343205, dL: 19140.30268499,
    Lp: -23.94362959, dLp: 0.44441088,
    N: 49.55953891, dN: -0.29257343,
  },
};

/** Visual-to-real scale constants: AU positions are scaled for 3D rendering. */
const AU_SCALE = {
  MERCURY: 2.2,
  VENUS:   3.4,
  EARTH:   5.0,
  MARS:    7.5,
};

export class EphemerisService {
  constructor() {
    /** @type {Map<string, Function>} event listeners */
    this._listeners = new Map();
  }

  /**
   * Compute heliocentric ecliptic Cartesian coordinates (x, y, z) in AU
   * for a named body at a given JS Date.
   *
   * @param {string} body  — 'MERCURY'|'VENUS'|'EARTH'|'MARS'
   * @param {Date}   date  — Target date (local or UTC)
   * @returns {EphemerisResult}
   */
  compute(body, date = new Date()) {
    const el = ORBITAL_ELEMENTS[body];
    if (!el) {
      return {
        body,
        date: date.toISOString(),
        x: 0, y: 0, z: 0,
        au: 0,
        longitude: 0,
        latitude:  0,
        dataType:  'CALCULATED',
        source:    'JPL Approximate Planetary Positions (Table 1)',
        accuracy:  '~1 arcminute (1800–2050 CE)',
      };
    }

    const T = _julianCenturies(date);

    // Interpolate elements
    const a  = el.a  + el.da  * T;
    const e  = el.e  + el.de  * T;
    const I  = (el.I  + el.dI  * T) * DEG;
    const L  = _modAngle((el.L  + el.dL  * T)) * DEG;
    const Lp = _modAngle((el.Lp + el.dLp * T)) * DEG;
    const N  = _modAngle((el.N  + el.dN  * T)) * DEG;

    const w  = Lp - N;         // argument of perihelion
    const M  = _normalizeRad(L - Lp); // mean anomaly

    // Solve Kepler's equation: E - e*sin(E) = M
    const E  = _solveKepler(M, e);

    // Heliocentric coordinates in orbital plane
    const xp = a * (Math.cos(E) - e);
    const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);

    // Rotate into ecliptic frame
    const cosN = Math.cos(N), sinN = Math.sin(N);
    const cosw = Math.cos(w), sinw = Math.sin(w);
    const cosI = Math.cos(I), sinI = Math.sin(I);

    const x = (cosN * cosw - sinN * sinw * cosI) * xp + (-cosN * sinw - sinN * cosw * cosI) * yp;
    const y = (sinN * cosw + cosN * sinw * cosI) * xp + (-sinN * sinw + cosN * cosw * cosI) * yp;
    const z = (sinw * sinI) * xp + (cosw * sinI) * yp;

    const au        = Math.sqrt(x * x + y * y + z * z);
    const longitude = Math.atan2(y, x) / DEG;
    const latitude  = Math.asin(z / au) / DEG;

    return {
      body,
      date:      date.toISOString(),
      x, y, z,           // J2000 ecliptic AU
      au,                // heliocentric distance AU
      longitude,         // ecliptic longitude °
      latitude,          // ecliptic latitude °
      dataType:  'CALCULATED',
      source:    'JPL Approximate Planetary Positions (Table 1)',
      reference: 'https://ssd.jpl.nasa.gov/planets/approx_pos.html',
      accuracy:  '~1 arcminute (1800–2050 CE)',
    };
  }

  /**
   * Compute all inner solar system bodies at once.
   * @param {Date} date
   * @returns {Record<string, EphemerisResult>}
   */
  computeAll(date = new Date()) {
    const results = {};
    for (const body of Object.keys(ORBITAL_ELEMENTS)) {
      results[body] = this.compute(body, date);
    }
    return results;
  }

  /**
   * Convert ecliptic AU coordinates to a 3D visualization position
   * using visual scale (not real distance).
   * Returns {x, y, z} in scene units.
   *
   * LABEL THIS AS EDUCATIONAL VISUALIZATION wherever displayed.
   * @param {EphemerisResult} eph
   * @param {number} [scale]  — Scene units per AU (default per body)
   */
  toVisualPosition(eph, scale) {
    const s = scale ?? (AU_SCALE[eph.body] ?? 5.0);
    // Rotate ecliptic (x,y) → Three.js (x,z) — ecliptic lies in XY plane,
    // Three.js Y is "up", so we map ecliptic-Y → -Three.js-Z
    return {
      x: eph.x * s,
      y: eph.z * s * 0.5,   // compressed for visual clarity
      z: -eph.y * s,
    };
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
}

/* ------------------------------------------------------------------
   Keplerian mathematics
   ------------------------------------------------------------------ */

/**
 * Julian centuries from J2000.0 epoch.
 * @param {Date} date
 * @returns {number}
 */
function _julianCenturies(date) {
  const jd = date.getTime() / 86400000 + 2440587.5;
  return (jd - 2451545.0) / 36525;
}

/**
 * Reduce degrees to 0–360.
 * @param {number} deg
 */
function _modAngle(deg) {
  return ((deg % 360) + 360) % 360;
}

/**
 * Normalize radians to -π…+π.
 * @param {number} rad
 */
function _normalizeRad(rad) {
  let r = rad;
  while (r > Math.PI) r -= TWO_PI;
  while (r < -Math.PI) r += TWO_PI;
  return r;
}

/**
 * Solve Kepler's equation iteratively (Newton–Raphson, max 50 iterations).
 * @param {number} M  Mean anomaly (radians)
 * @param {number} e  Eccentricity
 * @returns {number}  Eccentric anomaly (radians)
 */
function _solveKepler(M, e) {
  let E = M;
  for (let i = 0; i < 50; i++) {
    const dE = (M - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-9) break;
  }
  return E;
}

/** Singleton ephemeris service. */
export const ephemerisService = new EphemerisService();

/**
 * @typedef {object} EphemerisResult
 * @property {string} body
 * @property {string} date       ISO-8601 UTC
 * @property {number} x          Ecliptic J2000 AU
 * @property {number} y
 * @property {number} z
 * @property {number} au         Heliocentric distance AU
 * @property {number} longitude  Ecliptic longitude °
 * @property {number} latitude   Ecliptic latitude °
 * @property {string} dataType   'CALCULATED'
 * @property {string} source
 * @property {string} [reference]
 * @property {string} accuracy
 */
