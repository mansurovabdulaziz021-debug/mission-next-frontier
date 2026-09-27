/**
 * AudioControlHUD.js — Minimalistic Cybernetic Audio Controller
 * 
 * Provides:
 *   - Sound ON/OFF quick toggle with animated audio wave pulses
 *   - Volume slider hover popover (0 - 100%)
 *   - Global keyboard shortcut ('M' to toggle mute)
 *   - Synchronized with AudioManager and localStorage
 */

import { audioManager } from '../audio/AudioManager.js';
import { AUDIO_EVENTS } from '../audio/AudioEvents.js';

export class AudioControlHUD {
  constructor() {
    this.dom = {
      container: document.getElementById('mc-audio-control'),
      btn: document.getElementById('mc-audio-btn'),
      icon: document.getElementById('mc-audio-icon'),
      sliderWrap: document.getElementById('mc-audio-slider-wrap'),
      slider: /** @type {HTMLInputElement} */ (document.getElementById('mc-audio-slider')),
      volValue: document.getElementById('mc-audio-val')
    };

    this._bindEvents();
    this._syncUI();
  }

  _bindEvents() {
    // Button click: Toggle mute
    this.dom.btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      audioManager.toggleMute();
      this._syncUI();
    });

    // Volume slider input
    this.dom.slider?.addEventListener('input', (e) => {
      e.stopPropagation();
      const val = parseFloat(this.dom.slider.value);
      audioManager.setVolume(val);
      if (audioManager.muted) {
        audioManager.setMuted(false);
      }
      this._syncUI();
    });

    // Keyboard shortcut: 'M' to mute / unmute
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 'm' || e.key === 'M') {
        audioManager.toggleMute();
        this._syncUI();
      }
    });

    // Listen to AudioManager state changes
    audioManager.on('muteChanged', () => this._syncUI());
    audioManager.on('volumeChanged', () => this._syncUI());
    audioManager.on('unlocked', () => this._syncUI());
  }

  _syncUI() {
    const isMuted = audioManager.muted || !audioManager.isUnlocked;
    const vol = audioManager.volume;

    if (this.dom.btn) {
      this.dom.btn.setAttribute('aria-pressed', (!isMuted).toString());
      this.dom.btn.setAttribute('title', isMuted ? 'Unmute Audio (Press M)' : 'Mute Audio (Press M)');
      if (isMuted) {
        this.dom.btn.classList.add('mc__audio-btn--muted');
      } else {
        this.dom.btn.classList.remove('mc__audio-btn--muted');
      }
    }

    if (this.dom.icon) {
      this.dom.icon.innerHTML = isMuted
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
    }

    if (this.dom.slider) {
      this.dom.slider.value = vol.toString();
    }

    if (this.dom.volValue) {
      this.dom.volValue.textContent = isMuted ? 'MUTED' : `${Math.round(vol * 100)}%`;
    }
  }
}
