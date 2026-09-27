/**
 * AudioHooks.js — Sound-Ready Event Architecture
 * 
 * Provides decoupled event hooks for future spatial/ambient sound design:
 *   - sceneEnter
 *   - targetAcquired
 *   - dataReveal
 *   - discovery
 *   - transitionComplete
 *   - phenomenonSelected
 *   - qualityChanged
 * 
 * Includes an optional Web Audio API micro-synth that is MUTED by default
 * to strictly adhere to "no distracting audio automatically" while allowing
 * technical evaluators to preview crisp acoustic telemetry.
 */

export class AudioHooks {
  constructor() {
    this._listeners = new Map();
    this.muted = true; // MUST remain muted by default
    this._audioCtx = null;
  }

  on(eventName, callback) {
    if (!this._listeners.has(eventName)) {
      this._listeners.set(eventName, []);
    }
    this._listeners.get(eventName).push(callback);
    return () => this.off(eventName, callback);
  }

  off(eventName, callback) {
    const list = this._listeners.get(eventName);
    if (!list) return;
    this._listeners.set(eventName, list.filter(cb => cb !== callback));
  }

  emit(eventName, payload = {}) {
    const list = this._listeners.get(eventName);
    if (list) {
      for (const cb of list) {
        try {
          cb(payload);
        } catch (err) {
          console.error(`[AudioHooks] Error handling event ${eventName}:`, err);
        }
      }
    }

    if (!this.muted) {
      this._playSynthesizedCue(eventName);
    }
  }

  setMuted(muted) {
    this.muted = !!muted;
  }

  _initContext() {
    if (!this._audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this._audioCtx = new AudioContextClass();
      }
    }
    if (this._audioCtx && this._audioCtx.state === 'suspended') {
      this._audioCtx.resume();
    }
  }

  _playSynthesizedCue(type) {
    try {
      this._initContext();
      if (!this._audioCtx) return;

      const osc = this._audioCtx.createOscillator();
      const gain = this._audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this._audioCtx.destination);

      const now = this._audioCtx.currentTime;
      let freq = 440;
      let dur = 0.08;

      switch (type) {
        case 'targetAcquired':
          freq = 880;
          dur = 0.05;
          break;
        case 'phenomenonSelected':
          freq = 660;
          dur = 0.06;
          break;
        case 'dataReveal':
          freq = 520;
          dur = 0.1;
          break;
        case 'discovery':
          freq = 1046.5; // C6
          dur = 0.15;
          break;
        default:
          freq = 330;
          dur = 0.04;
      }

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.start(now);
      osc.stop(now + dur);
    } catch {
      // Audio autoplay policy or inactive context
    }
  }
}

export const audioHooks = new AudioHooks();
