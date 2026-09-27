/**
 * MusicSynthesizer.js — Original Ambient Cinematic Score Generator
 * 
 * Generates an original, spacious, contemplative, and evolving scientific
 * soundscape using procedural Web Audio synthesis.
 * 
 * Qualities:
 *   - Spacious, slow, atmospheric
 *   - Deep sustained warm sub/bass drone
 *   - Restrained harmonic organ/pad resonance with gentle LFO filtering
 *   - Sparse celestial pentatonic chimes
 *   - 100% original, zero copyrighted samples or melodies
 *   - Easily swappable with custom licensed audio files via loadExternalTrack()
 */

export class MusicSynthesizer {
  /**
   * @param {AudioContext} audioCtx
   * @param {GainNode} destinationNode
   */
  constructor(audioCtx, destinationNode) {
    this.ctx = audioCtx;
    this.out = destinationNode;

    this.isPlaying = false;
    this.isDucked = false;

    /** @type {GainNode} Internal music bus */
    this.bus = this.ctx.createGain();
    this.bus.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.bus.connect(this.out);

    // Audio graph nodes for procedural generative score
    this._nodes = [];
    this._timerId = null;
    this._bellTimerId = null;
    this._chordIndex = 0;

    // Harmonic chord progressions (open fifths / sus2 / major 9th intervals)
    this._chords = [
      [65.41, 98.00, 146.83, 261.63],   // C2, G2, D3, C4
      [87.31, 130.81, 174.61, 329.63],  // F2, C3, F3, E4
      [55.00, 110.00, 164.81, 293.66],  // A1, A2, E3, D4
      [98.00, 146.83, 220.00, 392.00]   // G2, D3, A3, G4
    ];

    // Pentatonic chime scale (C4, D4, F4, G4, A4, C5, D5, G5)
    this._chimeNotes = [261.63, 293.66, 349.23, 392.00, 440.00, 523.25, 587.33, 783.99];

    // External audio element fallback support
    this._audioEl = null;
    this._externalSourceNode = null;
  }

  /**
   * Start ambient music playback with smooth fade-in.
   * @param {number} [targetVolume=0.18]
   * @param {number} [fadeDuration=3.0]
   */
  start(targetVolume = 0.18, fadeDuration = 3.0) {
    if (this.isPlaying) return;
    if (!this.ctx || this.ctx.state === 'suspended') return;

    this.isPlaying = true;

    if (this._audioEl) {
      this._audioEl.play().catch(() => {});
    } else {
      this._startProceduralEngine();
    }

    const t = this.ctx.currentTime;
    this.bus.gain.cancelScheduledValues(t);
    this.bus.gain.setValueAtTime(0.0001, t);
    this.bus.gain.linearRampToValueAtTime(targetVolume, t + fadeDuration);
  }

  /**
   * Stop ambient music playback with smooth fade-out.
   * @param {number} [fadeDuration=2.0]
   */
  stop(fadeDuration = 2.0) {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    const t = this.ctx.currentTime;
    this.bus.gain.cancelScheduledValues(t);
    this.bus.gain.setValueAtTime(this.bus.gain.value, t);
    this.bus.gain.exponentialRampToValueAtTime(0.0001, t + fadeDuration);

    setTimeout(() => {
      if (!this.isPlaying) {
        this._stopProceduralEngine();
        if (this._audioEl) {
          this._audioEl.pause();
        }
      }
    }, fadeDuration * 1000 + 100);
  }

  /**
   * Duck music volume (e.g. during scientific briefing or discovery reveal).
   * @param {number} [ratio=0.3] Target ratio of current volume
   * @param {number} [duration=0.6]
   */
  duck(ratio = 0.3, duration = 0.6) {
    if (!this.isPlaying) return;
    this.isDucked = true;
    const t = this.ctx.currentTime;
    const current = this.bus.gain.value;
    this.bus.gain.cancelScheduledValues(t);
    this.bus.gain.setValueAtTime(current, t);
    this.bus.gain.linearRampToValueAtTime(Math.max(0.0001, current * ratio), t + duration);
  }

  /**
   * Restore music volume after ducking.
   * @param {number} [targetVolume=0.18]
   * @param {number} [duration=1.2]
   */
  unduck(targetVolume = 0.18, duration = 1.2) {
    if (!this.isPlaying) return;
    this.isDucked = false;
    const t = this.ctx.currentTime;
    this.bus.gain.cancelScheduledValues(t);
    this.bus.gain.setValueAtTime(this.bus.gain.value, t);
    this.bus.gain.linearRampToValueAtTime(targetVolume, t + duration);
  }

  /**
   * Set music volume.
   * @param {number} val
   */
  setVolume(val) {
    const t = this.ctx.currentTime;
    this.bus.gain.cancelScheduledValues(t);
    this.bus.gain.setValueAtTime(this.bus.gain.value, t);
    this.bus.gain.linearRampToValueAtTime(Math.max(0.0001, Math.min(1.0, val)), t + 0.1);
  }

  /* -----------------------------------------------------------------
     Procedural Ambient Engine
     ----------------------------------------------------------------- */
  _startProceduralEngine() {
    this._stopProceduralEngine();

    // 1. Warm Sub-Bass Drone
    const droneOsc = this.ctx.createOscillator();
    const droneFilter = this.ctx.createBiquadFilter();
    const droneGain = this.ctx.createGain();

    droneOsc.type = 'triangle';
    droneOsc.frequency.setValueAtTime(55.0, this.ctx.currentTime); // A1 fundamental

    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(110, this.ctx.currentTime);
    droneFilter.Q.value = 1.5;

    // Subtle slow LFO for filter cutoff breathing
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.06, this.ctx.currentTime); // 16s cycle
    lfoGain.gain.setValueAtTime(35, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(droneFilter.frequency);
    lfo.start();

    droneGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    droneOsc.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.bus);
    droneOsc.start();

    this._nodes.push(droneOsc, droneFilter, droneGain, lfo, lfoGain);

    // 2. Schedule evolving atmospheric chord cycles
    this._playChordCycle();
    this._timerId = setInterval(() => {
      if (this.isPlaying) {
        this._chordIndex = (this._chordIndex + 1) % this._chords.length;
        this._playChordCycle();
      }
    }, 14000);

    // 3. Schedule contemplative celestial chimes
    this._scheduleNextChime();
  }

  _playChordCycle() {
    if (!this.isPlaying) return;
    const chord = this._chords[this._chordIndex];
    const now = this.ctx.currentTime;
    const chordDuration = 14.0;
    const attack = 3.5;
    const release = 4.0;

    chord.forEach((freq, idx) => {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator(); // Detuned twin for choral warmth
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(freq, now);
      // Subtle 0.4 Hz celestial chorus detuning
      osc2.frequency.setValueAtTime(freq + (idx % 2 === 0 ? 0.35 : -0.35), now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380 + idx * 80, now);
      filter.Q.value = 0.8;

      const baseAmp = (0.09 / (idx + 1));
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(baseAmp, now + attack);
      gain.gain.setValueAtTime(baseAmp, now + chordDuration - release);
      gain.gain.linearRampToValueAtTime(0.0001, now + chordDuration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.bus);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + chordDuration + 0.1);
      osc2.stop(now + chordDuration + 0.1);
    });
  }

  _scheduleNextChime() {
    if (!this.isPlaying) return;
    // Random sparse interval between 7s and 12s
    const delayMs = 7000 + Math.random() * 5000;
    this._bellTimerId = setTimeout(() => {
      if (this.isPlaying) {
        this._playCelestialChime();
        this._scheduleNextChime();
      }
    }, delayMs);
  }

  _playCelestialChime() {
    try {
      const now = this.ctx.currentTime;
      const noteIdx = Math.floor(Math.random() * this._chimeNotes.length);
      const freq = this._chimeNotes[noteIdx];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

      osc.connect(gain);
      gain.connect(this.bus);

      osc.start(now);
      osc.stop(now + 4.6);
    } catch {}
  }

  _stopProceduralEngine() {
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
    if (this._bellTimerId) {
      clearTimeout(this._bellTimerId);
      this._bellTimerId = null;
    }

    for (const node of this._nodes) {
      try {
        if (typeof node.stop === 'function') node.stop();
        if (typeof node.disconnect === 'function') node.disconnect();
      } catch {}
    }
    this._nodes = [];
  }

  /**
   * Load an external audio file (e.g. licensed track) if provided.
   * Seamlessly replaces the procedural engine without breaking app architecture.
   * @param {string} url
   */
  loadExternalTrack(url) {
    this._stopProceduralEngine();
    if (this._audioEl) {
      this._audioEl.pause();
      this._audioEl.src = '';
    }

    this._audioEl = new Audio(url);
    this._audioEl.loop = true;
    this._audioEl.crossOrigin = 'anonymous';

    try {
      this._externalSourceNode = this.ctx.createMediaElementSource(this._audioEl);
      this._externalSourceNode.connect(this.bus);
    } catch (err) {
      console.warn('[MusicSynthesizer] MediaElementSource warning:', err);
    }

    if (this.isPlaying) {
      this._audioEl.play().catch(() => {});
    }
  }
}
