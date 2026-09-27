/**
 * SoundSynthesizer.js — Procedural Web Audio Synthesizer
 * 
 * Generates short, subtle, technical, and premium acoustic telemetry
 * without external audio sample dependencies or copyright risks.
 */

import { AUDIO_EVENTS } from './AudioEvents.js';

export class SoundSynthesizer {
  /**
   * @param {AudioContext} audioCtx
   * @param {GainNode} destinationNode
   */
  constructor(audioCtx, destinationNode) {
    this.ctx = audioCtx;
    this.out = destinationNode;

    // Hover sound rate limiting
    this._lastHoverTime = 0;
    this._minHoverInterval = 80; // ms
  }

  /**
   * Play procedural sound effect by event name.
   * @param {string} eventName
   * @param {object} [options]
   */
  play(eventName, options = {}) {
    if (!this.ctx || this.ctx.state === 'suspended') return;

    switch (eventName) {
      case AUDIO_EVENTS.UI_HOVER:
        this._playHover();
        break;

      case AUDIO_EVENTS.UI_CLICK:
      case AUDIO_EVENTS.UI_SELECT:
        this._playClick();
        break;

      case AUDIO_EVENTS.UI_CONFIRM:
        this._playConfirm();
        break;

      case AUDIO_EVENTS.UI_NAVIGATE:
        this._playNavigate();
        break;

      case AUDIO_EVENTS.UI_CLOSE:
        this._playClose();
        break;

      case AUDIO_EVENTS.UI_WARNING:
        this._playWarning();
        break;

      case AUDIO_EVENTS.TARGET_ACQUIRE:
      case AUDIO_EVENTS.DESTINATION_SELECT:
        this._playTargetAcquire();
        break;

      case AUDIO_EVENTS.TRANSITION_WHOOSH:
      case AUDIO_EVENTS.SCENE_ENTER:
        this._playTransitionWhoosh();
        break;

      case AUDIO_EVENTS.DATA_REVEAL:
      case AUDIO_EVENTS.EVIDENCE_STEP:
        this._playDataReveal();
        break;

      case AUDIO_EVENTS.DISCOVERY_REVEAL:
        this._playDiscoveryReveal();
        break;

      case AUDIO_EVENTS.SCENARIO_CHANGE:
        this._playScenarioPulse();
        break;

      case AUDIO_EVENTS.PHENOMENON_SELECT:
        this._playPhenomenonSelect();
        break;

      case AUDIO_EVENTS.MISSION_STEP:
        this._playMissionStep();
        break;

      case AUDIO_EVENTS.MISSION_ASSEMBLED:
        this._playMissionAssembled();
        break;

      case AUDIO_EVENTS.BRIEFING_START:
        this._playBriefingTone();
        break;

      case AUDIO_EVENTS.ONE_MORE_THING:
        this._playOneMoreThingChime();
        break;

      case AUDIO_EVENTS.FINAL_INSIGHT:
        this._playFinalInsightAtmosphere();
        break;

      default:
        this._playSubtleTick();
        break;
    }
  }

  /* -----------------------------------------------------------------
     Procedural Sound Generators
     ----------------------------------------------------------------- */

  /** Ultra-subtle high-damped micro tick for hover. */
  _playHover() {
    const now = Date.now();
    if (now - this._lastHoverTime < this._minHoverInterval) return;
    this._lastHoverTime = now;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.015);

      gain.gain.setValueAtTime(0.015, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);

      osc.connect(gain);
      gain.connect(this.out);

      osc.start(t);
      osc.stop(t + 0.016);
    } catch {}
  }

  /** Clean, crisp technical UI click. */
  _playClick() {
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(680, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.035);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

      osc.connect(gain);
      gain.connect(this.out);

      osc.start(t);
      osc.stop(t + 0.036);
    } catch {}
  }

  /** Dual-tone confirmation chime. */
  _playConfirm() {
    try {
      const t = this.ctx.currentTime;
      // High chime pair (E5 -> G#5)
      const freqs = [659.25, 830.61];

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = t + idx * 0.035;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.04, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09);

        osc.connect(gain);
        gain.connect(this.out);

        osc.start(start);
        osc.stop(start + 0.095);
      });
    } catch {}
  }

  /** Resonant frequency sweep for navigation. */
  _playNavigate() {
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(540, t + 0.07);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, t);
      filter.frequency.exponentialRampToValueAtTime(1200, t + 0.07);
      filter.Q.value = 3.5;

      gain.gain.setValueAtTime(0.035, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.out);

      osc.start(t);
      osc.stop(t + 0.075);
    } catch {}
  }

  /** Subtle downward damped tone for panel close / back. */
  _playClose() {
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, t);
      osc.frequency.exponentialRampToValueAtTime(240, t + 0.045);

      gain.gain.setValueAtTime(0.03, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);

      osc.connect(gain);
      gain.connect(this.out);

      osc.start(t);
      osc.stop(t + 0.046);
    } catch {}
  }

  /** Soft dual-tone caution advisory. */
  _playWarning() {
    try {
      const t = this.ctx.currentTime;
      [440, 466.16].forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.025, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

        osc.connect(gain);
        gain.connect(this.out);

        osc.start(t);
        osc.stop(t + 0.125);
      });
    } catch {}
  }

  /** Radar ping with harmonic overtone for celestial target acquisition. */
  _playTargetAcquire() {
    try {
      const t = this.ctx.currentTime;
      const freqs = [880, 1760];

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.98, t + 0.11);

        const amp = idx === 0 ? 0.06 : 0.025;
        gain.gain.setValueAtTime(amp, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);

        osc.connect(gain);
        gain.connect(this.out);

        osc.start(t);
        osc.stop(t + 0.115);
      });
    } catch {}
  }

  /** Filtered soft whoosh for major camera spatial transitions. */
  _playTransitionWhoosh() {
    try {
      const t = this.ctx.currentTime;
      const dur = 0.35;
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pink noise synthesis
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.12;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(250, t);
      filter.frequency.exponentialRampToValueAtTime(1100, t + dur * 0.5);
      filter.frequency.exponentialRampToValueAtTime(200, t + dur);
      filter.Q.value = 1.8;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.045, t + dur * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.out);

      noise.start(t);
      noise.stop(t + dur);
    } catch {}
  }

  /** Ascending multi-tone data blip for telemetry reveal. */
  _playDataReveal() {
    try {
      const t = this.ctx.currentTime;
      const notes = [587.33, 739.99, 880.00]; // D5, F#5, A5

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = t + idx * 0.04;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.035, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.08);

        osc.connect(gain);
        gain.connect(this.out);

        osc.start(start);
        osc.stop(start + 0.085);
      });
    } catch {}
  }

  /** Shimmering cosmic chord for scientific discovery. */
  _playDiscoveryReveal() {
    try {
      const t = this.ctx.currentTime;
      // Celestial major 9th chord (C5, G5, D6, E6)
      const freqs = [523.25, 783.99, 1174.66, 1318.51];

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = t + idx * 0.03;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.045, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);

        osc.connect(gain);
        gain.connect(this.out);

        osc.start(start);
        osc.stop(start + 0.46);
      });
    } catch {}
  }

  /** Low gravitational resonance for scenario perturbation. */
  _playScenarioPulse() {
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(65, t + 0.22);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.out);

      osc.start(t);
      osc.stop(t + 0.23);
    } catch {}
  }

  /** Resonant pulse for phenomena selection. */
  _playPhenomenonSelect() {
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(660, t + 0.06);

      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

      osc.connect(gain);
      gain.connect(this.out);

      osc.start(t);
      osc.stop(t + 0.065);
    } catch {}
  }

  /** Step indicator tone for Mission Architect pipeline. */
  _playMissionStep() {
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, t);
      osc.frequency.exponentialRampToValueAtTime(554, t + 0.05);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.out);

      osc.start(t);
      osc.stop(t + 0.055);
    } catch {}
  }

  /** Triumphant, warm synthesizer choir chord for completed mission assembly. */
  _playMissionAssembled() {
    try {
      const t = this.ctx.currentTime;
      // Warm Cmaj7/9 chord (C4, G4, B4, D5, E5)
      const freqs = [261.63, 392.00, 493.88, 587.33, 659.25];

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = t + idx * 0.04;

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.05, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.85);

        osc.connect(gain);
        gain.connect(this.out);

        osc.start(start);
        osc.stop(start + 0.88);
      });
    } catch {}
  }

  /** Deep focused tone for briefing start. */
  _playBriefingTone() {
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(130.81, t); // C3
      osc.frequency.exponentialRampToValueAtTime(196.00, t + 0.15); // G3

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.out);

      osc.start(t);
      osc.stop(t + 0.36);
    } catch {}
  }

  /** Sparkling celestial chime for "One More Thing" reveal. */
  _playOneMoreThingChime() {
    try {
      const t = this.ctx.currentTime;
      const freqs = [880, 1174.66, 1396.91, 1760]; // A5, D6, F6, A6

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = t + idx * 0.045;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.05, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.65);

        osc.connect(gain);
        gain.connect(this.out);

        osc.start(start);
        osc.stop(start + 0.68);
      });
    } catch {}
  }

  /** Deep contemplative harmonic tone for Final Insight. */
  _playFinalInsightAtmosphere() {
    try {
      const t = this.ctx.currentTime;
      const freqs = [110.00, 220.00, 329.63, 440.00]; // A2, A3, E4, A4

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.035, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

        osc.connect(gain);
        gain.connect(this.out);

        osc.start(t);
        osc.stop(t + 1.25);
      });
    } catch {}
  }

  _playSubtleTick() {
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);

      osc.connect(gain);
      gain.connect(this.out);

      osc.start(t);
      osc.stop(t + 0.022);
    } catch {}
  }
}
