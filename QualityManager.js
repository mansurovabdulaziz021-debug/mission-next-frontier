/**
 * QualityManager.js — Adaptive Visual Quality Architecture
 * 
 * Manages performance tiers (HIGH, MEDIUM, LOW) across 3D visualizers:
 *   - Device pixel ratio management
 *   - Particle density scaling factor
 *   - Geometry segment complexity
 *   - Frame rate monitoring & auto-degradation if GPU load spikes
 */

export const QUALITY_TIERS = {
  HIGH: {
    id: 'HIGH',
    label: 'HIGH // 4K CINEMATIC',
    dprMax: 2.0,
    particleScale: 1.0,
    geometryDetail: 1.0,
    shadows: true,
    bloom: true,
    subdivision: 64
  },
  MEDIUM: {
    id: 'MEDIUM',
    label: 'MED // BALANCED',
    dprMax: 1.25,
    particleScale: 0.6,
    geometryDetail: 0.7,
    shadows: false,
    bloom: true,
    subdivision: 36
  },
  LOW: {
    id: 'LOW',
    label: 'LOW // EFFICIENCY',
    dprMax: 1.0,
    particleScale: 0.3,
    geometryDetail: 0.4,
    shadows: false,
    bloom: false,
    subdivision: 20
  }
};

export class QualityManager {
  constructor() {
    this.currentTier = QUALITY_TIERS.HIGH;
    this._listeners = [];
    this._fpsHistory = [];
    this._lastTime = performance.now();
    this._autoTuneEnabled = true;

    // Detect hardware tier heuristic
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    const cores = nav?.hardwareConcurrency || 4;
    const memory = nav?.deviceMemory || 8;

    if (cores <= 2 || memory <= 2) {
      this.currentTier = QUALITY_TIERS.LOW;
    } else if (cores <= 4 || memory <= 4) {
      this.currentTier = QUALITY_TIERS.MEDIUM;
    } else {
      this.currentTier = QUALITY_TIERS.HIGH;
    }
  }

  get tier() {
    return this.currentTier;
  }

  setTier(tierKey) {
    if (QUALITY_TIERS[tierKey] && this.currentTier.id !== tierKey) {
      this.currentTier = QUALITY_TIERS[tierKey];
      this._emitChange();
    }
  }

  onQualityChanged(callback) {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter(cb => cb !== callback);
    };
  }

  _emitChange() {
    for (const cb of this._listeners) {
      try {
        cb(this.currentTier);
      } catch (err) {
        console.error('[QualityManager] Listener error:', err);
      }
    }
  }

  /**
   * Monitor frame time for dynamic throttling if needed
   */
  tick(delta) {
    if (!this._autoTuneEnabled) return;
    const fps = 1 / Math.max(0.001, delta);
    this._fpsHistory.push(fps);
    if (this._fpsHistory.length > 90) this._fpsHistory.shift();

    // If avg FPS over 90 frames is below 24 and currently on HIGH, suggest downgrade
    if (this._fpsHistory.length >= 90) {
      const avgFps = this._fpsHistory.reduce((a, b) => a + b, 0) / this._fpsHistory.length;
      if (avgFps < 22 && this.currentTier === QUALITY_TIERS.HIGH) {
        console.warn(`[QualityManager] Frame drop detected (${avgFps.toFixed(1)} FPS). Downscaling to MEDIUM tier.`);
        this.setTier('MEDIUM');
        this._fpsHistory = [];
      }
    }
  }
}

export const qualityManager = new QualityManager();
