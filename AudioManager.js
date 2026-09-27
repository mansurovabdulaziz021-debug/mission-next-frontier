/**
 * AudioManager.js — Central Audio Engine for Mission // Next Frontier
 * 
 * Coordinates:
 *   - Unified AudioContext lifecycle and autoplay unlocking
 *   - Master, Music, and SFX gain bus routing
 *   - Procedural sound effects and generative ambient music
 *   - Audio ducking during scientific explanations
 *   - LocalStorage user preferences persistence
 *   - Event bus synchronization
 */

import { AUDIO_EVENTS } from './AudioEvents.js';
import { SoundSynthesizer } from './SoundSynthesizer.js';
import { MusicSynthesizer } from './MusicSynthesizer.js';

const STORAGE_KEY_MUTED = 'mission_audio_muted';
const STORAGE_KEY_VOLUME = 'mission_audio_volume';

export class AudioManager {
  constructor() {
    this._listeners = new Map();
    this.isUnlocked = false;

    // Load persisted preferences
    let savedMuted = false;
    let savedVolume = 0.7;

    try {
      if (typeof localStorage !== 'undefined') {
        const storedMuted = localStorage.getItem(STORAGE_KEY_MUTED);
        const storedVolume = localStorage.getItem(STORAGE_KEY_VOLUME);
        if (storedMuted !== null) savedMuted = storedMuted === 'true';
        if (storedVolume !== null) savedVolume = parseFloat(storedVolume) || 0.7;
      }
    } catch {}

    this.muted = savedMuted;
    this.volume = savedVolume;

    this.audioCtx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;

    this.sfx = null;
    this.music = null;
  }

  /**
   * Unlock AudioContext on the first meaningful user interaction.
   */
  unlockAudio() {
    if (this.isUnlocked) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.audioCtx = new AudioCtx();

      // Master Gain
      this.masterGain = this.audioCtx.createGain();
      const initialMasterVol = this.muted ? 0.0001 : this.volume;
      this.masterGain.gain.setValueAtTime(initialMasterVol, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);

      // SFX Gain (sub-bus)
      this.sfxGain = this.audioCtx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.audioCtx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Music Gain (sub-bus)
      this.musicGain = this.audioCtx.createGain();
      this.musicGain.gain.setValueAtTime(0.55, this.audioCtx.currentTime);
      this.musicGain.connect(this.masterGain);

      // Sub-synthesizers
      this.sfx = new SoundSynthesizer(this.audioCtx, this.sfxGain);
      this.music = new MusicSynthesizer(this.audioCtx, this.musicGain);

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.isUnlocked = true;

      // Start ambient music if not muted
      if (!this.muted) {
        this.music.start(0.18, 3.5);
      }

      this.emit('unlocked', { muted: this.muted, volume: this.volume });
    } catch (err) {
      console.warn('[AudioManager] Failed to initialize AudioContext:', err);
    }
  }

  /**
   * Play an acoustic event.
   * @param {string} eventName From AUDIO_EVENTS
   * @param {object} [options]
   */
  play(eventName, options = {}) {
    if (!this.isUnlocked) {
      this.unlockAudio();
    }
    if (this.muted) return;

    if (this.sfx) {
      this.sfx.play(eventName, options);
    }
  }

  /**
   * Toggle mute state.
   * @returns {boolean} New muted state
   */
  toggleMute() {
    return this.setMuted(!this.muted);
  }

  /**
   * Set mute state explicitly.
   * @param {boolean} muted
   */
  setMuted(muted) {
    this.muted = !!muted;

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_MUTED, String(this.muted));
      }
    } catch {}

    if (this.audioCtx && this.masterGain) {
      const t = this.audioCtx.currentTime;
      this.masterGain.gain.cancelScheduledValues(t);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, t);

      if (this.muted) {
        this.masterGain.gain.linearRampToValueAtTime(0.0001, t + 0.15);
        if (this.music && this.music.isPlaying) {
          this.music.stop(0.2);
        }
      } else {
        this.masterGain.gain.linearRampToValueAtTime(this.volume, t + 0.3);
        if (this.music && !this.music.isPlaying) {
          this.music.start(0.18, 2.0);
        }
      }
    }

    this.emit('muteChanged', { muted: this.muted });
    return this.muted;
  }

  /**
   * Set master volume (0.0 to 1.0).
   * @param {number} val
   */
  setVolume(val) {
    const clamped = Math.max(0.0, Math.min(1.0, val));
    this.volume = clamped;

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_VOLUME, String(this.volume));
      }
    } catch {}

    if (this.audioCtx && this.masterGain && !this.muted) {
      const t = this.audioCtx.currentTime;
      this.masterGain.gain.cancelScheduledValues(t);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, t);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, t + 0.08);
    }

    this.emit('volumeChanged', { volume: this.volume });
  }

  /**
   * Duck music temporarily for vocal/explanation clarity.
   * @param {number} [ratio=0.3]
   * @param {number} [duration=0.6]
   */
  duck(ratio = 0.3, duration = 0.6) {
    if (this.music) {
      this.music.duck(ratio, duration);
    }
  }

  /**
   * Restore music after ducking.
   * @param {number} [target=0.18]
   * @param {number} [duration=1.2]
   */
  unduck(target = 0.18, duration = 1.2) {
    if (this.music) {
      this.music.unduck(target, duration);
    }
  }

  /* -----------------------------------------------------------------
     Pub/Sub Event Bus
     ----------------------------------------------------------------- */
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
        console.error(`[AudioManager] Error in listener for ${event}:`, err);
      }
    }
  }
}

export const audioManager = new AudioManager();
