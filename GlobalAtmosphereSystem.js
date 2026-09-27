/**
 * GlobalAtmosphereSystem.js — Unified Ambient & Environmental Conductor
 * 
 * Regulates the visual and acoustic atmosphere across the entire experience:
 *   - MISSION_CONTROL  → Calm technical (balanced cyan/blue, steady telemetry flow)
 *   - SOLAR_SYSTEM     → Expansive orbital (high depth, heliocentric spatial array)
 *   - DEEP_SPACE       → Spacious / minimal (low bass drone, high spatial depth, faint stellar veil)
 *   - OBSERVATORY      → Focused / analytical (monochrome/amber-tinted grid cues, dimmed celestial distraction)
 *   - PHENOMENA        → Precise / experimental (dynamic physics accent lighting)
 *   - MISSION_ARCHITECT→ Purposeful / mission-oriented (structured gold/emerald blueprint mood)
 */

let _gsap = null;
if (typeof window !== 'undefined') {
  import('gsap').then(m => { _gsap = m.default || m.gsap || m; }).catch(() => {});
}

export const ATMOSPHERES = {
  MISSION_CONTROL: {
    id: 'MISSION_CONTROL',
    label: 'CALM TECHNICAL',
    ambientLightIntensity: 0.45,
    directionalLightIntensity: 1.2,
    dustSpeedMultiplier: 1.0,
    dustOpacity: 0.35,
    starfieldSpeed: 0.05,
    cssGlow: 'rgba(0, 229, 255, 0.08)',
    cssBorder: 'rgba(0, 229, 255, 0.2)'
  },
  SOLAR_SYSTEM: {
    id: 'SOLAR_SYSTEM',
    label: 'EXPANSIVE ORBITAL',
    ambientLightIntensity: 0.35,
    directionalLightIntensity: 1.5,
    dustSpeedMultiplier: 0.8,
    dustOpacity: 0.45,
    starfieldSpeed: 0.08,
    cssGlow: 'rgba(255, 170, 0, 0.06)',
    cssBorder: 'rgba(255, 170, 0, 0.22)'
  },
  DEEP_SPACE: {
    id: 'DEEP_SPACE',
    label: 'SPACIOUS MINIMAL',
    ambientLightIntensity: 0.2,
    directionalLightIntensity: 0.8,
    dustSpeedMultiplier: 0.4,
    dustOpacity: 0.25,
    starfieldSpeed: 0.03,
    cssGlow: 'rgba(138, 43, 226, 0.08)',
    cssBorder: 'rgba(138, 43, 226, 0.25)'
  },
  OBSERVATORY: {
    id: 'OBSERVATORY',
    label: 'FOCUSED ANALYTICAL',
    ambientLightIntensity: 0.25,
    directionalLightIntensity: 0.9,
    dustSpeedMultiplier: 0.3,
    dustOpacity: 0.2,
    starfieldSpeed: 0.02,
    cssGlow: 'rgba(0, 240, 255, 0.05)',
    cssBorder: 'rgba(0, 240, 255, 0.28)'
  },
  PHENOMENA: {
    id: 'PHENOMENA',
    label: 'PRECISE EXPERIMENTAL',
    ambientLightIntensity: 0.4,
    directionalLightIntensity: 1.1,
    dustSpeedMultiplier: 1.2,
    dustOpacity: 0.5,
    starfieldSpeed: 0.06,
    cssGlow: 'rgba(255, 107, 0, 0.08)',
    cssBorder: 'rgba(255, 107, 0, 0.25)'
  },
  MISSION_ARCHITECT: {
    id: 'MISSION_ARCHITECT',
    label: 'PURPOSEFUL COMPOSITION',
    ambientLightIntensity: 0.5,
    directionalLightIntensity: 1.3,
    dustSpeedMultiplier: 0.9,
    dustOpacity: 0.4,
    starfieldSpeed: 0.04,
    cssGlow: 'rgba(0, 255, 170, 0.08)',
    cssBorder: 'rgba(0, 255, 170, 0.25)'
  }
};

export class GlobalAtmosphereSystem {
  /**
   * @param {import('../three/SceneManager.js').SceneManager} [sceneManager]
   * @param {import('../three/CosmicDust.js').CosmicDust} [cosmicDust]
   * @param {import('../three/Starfield.js').Starfield} [starfield]
   */
  constructor(sceneManager, cosmicDust, starfield) {
    this.sceneManager = sceneManager;
    this.cosmicDust = cosmicDust;
    this.starfield = starfield;

    this.current = ATMOSPHERES.MISSION_CONTROL;
    this._listeners = new Map();

    this._reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Set and smoothly interpolate atmosphere.
   * @param {'MISSION_CONTROL'|'SOLAR_SYSTEM'|'DEEP_SPACE'|'OBSERVATORY'|'PHENOMENA'|'MISSION_ARCHITECT'} atmosphereKey
   * @param {number} [duration=1.5]
   */
  setAtmosphere(atmosphereKey, duration = 1.5) {
    const target = ATMOSPHERES[atmosphereKey];
    if (!target || this.current.id === target.id) return;

    const prev = this.current;
    this.current = target;
    const d = this._reducedMotion ? 0.05 : duration;

    // Apply CSS atmospheric variables
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--atmosphere-glow', target.cssGlow);
      root.style.setProperty('--atmosphere-border', target.cssBorder);
      document.body.setAttribute('data-atmosphere', target.id.toLowerCase());
    }

    // Interpolate 3D light & dust variables
    if (this.cosmicDust && this.cosmicDust.points) {
      const dustMat = this.cosmicDust.points.material;
      if (dustMat && dustMat.uniforms && dustMat.uniforms.uOpacity) {
        if (_gsap) {
          _gsap.to(dustMat.uniforms.uOpacity, {
            value: target.dustOpacity,
            duration: d,
            ease: 'power2.out'
          });
        } else {
          dustMat.uniforms.uOpacity.value = target.dustOpacity;
        }
      }
    }

    this.emit('atmosphereChanged', {
      previous: prev,
      current: this.current
    });
  }

  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const list = this._listeners.get(event);
    if (!list) return;
    this._listeners.set(event, list.filter(cb => cb !== callback));
  }

  emit(event, payload) {
    const list = this._listeners.get(event);
    if (!list) return;
    for (const cb of list) {
      try {
        cb(payload);
      } catch (err) {
        console.error(`[AtmosphereSystem] Error in ${event}:`, err);
      }
    }
  }
}
