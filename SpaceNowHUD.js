/**
 * SpaceNowHUD.js — Phase 11: Live Cosmos
 *
 * "SPACE NOW" — A live window into our cosmic environment.
 *
 * Displays:
 *   - Real-time space weather (NOAA SWPC: solar wind, IMF, Kp)
 *   - Current planetary geometry (JPL calculated ephemeris)
 *   - Data freshness indicators with source transparency
 *   - Data heartbeat status row
 *   - Links to Observatory and Phenomena Lab
 *
 * Design principles:
 *   - Looks like a scientific instrument, not a generic dashboard
 *   - Every value carries a freshness state
 *   - Clearly distinguishes LIVE / CACHED / UNAVAILABLE / CALCULATED
 *   - Non-intrusive: slides in as a side panel
 *   - Handles network failure gracefully (never shows LIVE when stale)
 */

import { liveDataManager } from '../live/LiveDataManager.js';
import { temporalState }   from '../live/TemporalState.js';
import { DATA_FRESHNESS, freshnessLabel } from '../live/DataFreshness.js';
import { missionState }    from '../state/MissionState.js';

const KP_LABELS = ['QUIET','QUIET','UNSETTLED','UNSETTLED','ACTIVE','MINOR STORM','MODERATE STORM','STRONG STORM','SEVERE STORM','EXTREME STORM'];

export class SpaceNowHUD {
  constructor() {
    this._isOpen = false;
    this._el = null;
    this._unsubscribers = [];
    this._animateIn = this._animateIn.bind(this);
    this._build();
  }

  get isOpen() { return this._isOpen; }

  /* ------------------------------------------------------------------
     Lifecycle
     ------------------------------------------------------------------ */
  show() {
    if (this._isOpen) return;
    this._isOpen = true;
    const el = document.getElementById('mc-space-now');
    if (!el) return;
    el.setAttribute('aria-hidden', 'false');
    el.classList.add('mc__space-now--open');
    missionState.emit('enterSpaceNow');
    this._startLiveData();
    this._refreshAll();
    this._animateIn();
  }

  hide() {
    if (!this._isOpen) return;
    this._isOpen = false;
    const el = document.getElementById('mc-space-now');
    if (!el) return;
    el.setAttribute('aria-hidden', 'true');
    el.classList.remove('mc__space-now--open');
    missionState.emit('exitSpaceNow');
  }

  close() {
    this.hide();
  }

  toggle() {
    this._isOpen ? this.hide() : this.show();
  }

  _startLiveData() {
    // Ensure data manager is running
    liveDataManager.start();

    // Subscribe to updates
    const u1 = liveDataManager.on('spaceWeatherUpdated', () => this._refreshWeather());
    const u2 = liveDataManager.on('ephemerisUpdated', () => this._refreshPositions());
    const u3 = liveDataManager.on('dataHeartbeat', (hb) => this._refreshHeartbeat(hb));
    this._unsubscribers.push(u1, u2, u3);
  }

  destroy() {
    this._unsubscribers.forEach(u => typeof u === 'function' && u());
    this._unsubscribers = [];
  }

  /* ------------------------------------------------------------------
     Build DOM (from existing index.html section)
     ------------------------------------------------------------------ */
  _build() {
    // Panel is declared in index.html; wire up button handlers here
    const closeBtn = document.getElementById('mc-space-now-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    const viewObsBtn = document.getElementById('mc-sn-view-obs-btn');
    if (viewObsBtn) {
      viewObsBtn.addEventListener('click', () => {
        this.hide();
        missionState.emit('openObservatoryCase', 'CASE_01_EXOPLANET');
      });
    }

    const viewPhenBtn = document.getElementById('mc-sn-view-phen-btn');
    if (viewPhenBtn) {
      viewPhenBtn.addEventListener('click', () => {
        this.hide();
        missionState.emit('openPhenomenon', 'SPACE_WEATHER');
      });
    }

    const viewSourceBtn = document.getElementById('mc-sn-source-btn');
    if (viewSourceBtn) {
      viewSourceBtn.addEventListener('click', () => {
        this._toggleSourcePanel();
      });
    }
  }

  /* ------------------------------------------------------------------
     Refresh Methods
     ------------------------------------------------------------------ */
  _refreshAll() {
    this._refreshWeather();
    this._refreshPositions();
  }

  _refreshWeather() {
    const state = liveDataManager.getSpaceWeather();
    const { plasma, mag, kp, freshness, fetchedAt } = state;

    const badge = document.getElementById('mc-sn-sw-badge');
    if (badge) {
      badge.className = `mc__sn-freshness-badge mc__sn-freshness-badge--${freshness.toLowerCase()}`;
      badge.textContent = this._freshnessText(freshness, fetchedAt);
    }

    // Solar wind speed
    this._setField('mc-sn-sw-speed', plasma?.Vs != null ? `${plasma.Vs.toLocaleString()} km/s` : '—', plasma != null);

    // Proton density
    this._setField('mc-sn-sw-density', plasma?.Np != null ? `${plasma.Np} cm⁻³` : '—', plasma != null);

    // IMF Bz
    const bzEl = document.getElementById('mc-sn-sw-bz');
    if (bzEl) {
      if (mag?.Bz != null) {
        const sign = mag.Bz < 0 ? '↓ SOUTHWARD' : mag.Bz > 0 ? '↑ NORTHWARD' : '—';
        bzEl.textContent = `${mag.Bz > 0 ? '+' : ''}${mag.Bz} nT ${sign}`;
        bzEl.className = `mc__sn-value ${mag.Bz < -5 ? 'mc__sn-value--warn' : ''}`;
      } else {
        bzEl.textContent = '—';
        bzEl.className = 'mc__sn-value mc__sn-value--unavail';
      }
    }

    // IMF Bt
    this._setField('mc-sn-sw-bt', mag?.Bt != null ? `${mag.Bt} nT` : '—', mag != null);

    // Kp index
    const kpEl = document.getElementById('mc-sn-kp');
    const kpBarEl = document.getElementById('mc-sn-kp-bar');
    if (kpEl && kp?.kp != null) {
      const kpVal = kp.kp;
      const kpLabel = KP_LABELS[Math.min(Math.floor(kpVal), 9)];
      kpEl.textContent = `Kp ${kpVal} — ${kpLabel}`;
      kpEl.className = `mc__sn-value ${kpVal >= 5 ? 'mc__sn-value--warn' : ''}`;
      if (kpBarEl) {
        kpBarEl.style.width = `${(kpVal / 9) * 100}%`;
        kpBarEl.className = `mc__sn-kp-bar-fill ${kpVal >= 5 ? 'mc__sn-kp-bar-fill--active' : ''}`;
      }
    } else if (kpEl) {
      kpEl.textContent = 'DATA TEMPORARILY UNAVAILABLE';
      kpEl.className   = 'mc__sn-value mc__sn-value--unavail';
      if (kpBarEl) kpBarEl.style.width = '0%';
    }

    // Unavailability fallback message
    const unavailEl = document.getElementById('mc-sn-sw-unavail');
    if (unavailEl) {
      unavailEl.style.display = freshness === DATA_FRESHNESS.UNAVAILABLE ? 'flex' : 'none';
    }
  }

  _refreshPositions() {
    const { positions, date, isLive } = { ...liveDataManager.getPlanetaryPositions() && {
      positions: liveDataManager.getPlanetaryPositions(temporalState.date),
      date: temporalState.date,
      isLive: temporalState.isLive,
    }};

    const dateLabel = date ? _formatDate(date) : '—';
    const contextBadge = document.getElementById('mc-sn-eph-badge');
    if (contextBadge) {
      contextBadge.textContent = isLive ? `CALCULATED · NOW (${dateLabel})` : `CALCULATED · ${dateLabel}`;
      contextBadge.className = `mc__sn-freshness-badge mc__sn-freshness-badge--calculated`;
    }

    const bodies = ['EARTH', 'MARS', 'VENUS', 'MERCURY'];
    for (const body of bodies) {
      const pos = positions[body];
      if (!pos) continue;
      const idBase = `mc-sn-pos-${body.toLowerCase()}`;
      const auEl   = document.getElementById(`${idBase}-au`);
      const lonEl  = document.getElementById(`${idBase}-lon`);
      if (auEl)  auEl.textContent  = `${pos.au.toFixed(3)} AU`;
      if (lonEl) lonEl.textContent = `${pos.longitude.toFixed(1)}°`;
    }
  }

  _refreshHeartbeat(hb) {
    const swEl  = document.getElementById('mc-sn-hb-sw');
    const ephEl = document.getElementById('mc-sn-hb-eph');
    const tsEl  = document.getElementById('mc-sn-hb-ts');

    const swStatus = hb.spaceWeather;
    if (swEl) {
      swEl.textContent  = swStatus === DATA_FRESHNESS.UNAVAILABLE ? 'UNAVAILABLE' : swStatus;
      swEl.className    = `mc__sn-hb-val mc__sn-hb-val--${swStatus.toLowerCase()}`;
    }
    if (ephEl) {
      ephEl.textContent = 'CALCULATED';
      ephEl.className   = 'mc__sn-hb-val mc__sn-hb-val--calculated';
    }
    if (tsEl)  tsEl.textContent = _utcNow();
  }

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  _setField(id, value, hasData = true) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
    el.className   = `mc__sn-value${hasData ? '' : ' mc__sn-value--unavail'}`;
  }

  _freshnessText(freshness, fetchedAt) {
    switch (freshness) {
      case DATA_FRESHNESS.LIVE:
        return fetchedAt ? `LIVE · ${_utcTime(fetchedAt)}` : 'LIVE';
      case DATA_FRESHNESS.RECENT:
        return fetchedAt ? `RECENT · ${_utcTime(fetchedAt)}` : 'RECENT';
      case DATA_FRESHNESS.CACHED:
        return fetchedAt ? `LAST VERIFIED DATA · ${_utcTime(fetchedAt)}` : 'CACHED DATA';
      case DATA_FRESHNESS.UNAVAILABLE:
        return 'DATA TEMPORARILY UNAVAILABLE';
      default:
        return freshness;
    }
  }

  _toggleSourcePanel() {
    const sp = document.getElementById('mc-sn-source-panel');
    if (!sp) return;
    const open = sp.classList.toggle('mc__sn-source-panel--open');
    sp.setAttribute('aria-hidden', String(!open));

    const reg = liveDataManager.getRegistry();
    const swSrc = document.getElementById('mc-sn-src-sw');
    if (swSrc) {
      swSrc.innerHTML = `
        <div class="mc__sn-src-name">${reg.spaceWeather.name}</div>
        <div class="mc__sn-src-dataset">${reg.spaceWeather.dataset}</div>
        <div class="mc__sn-src-update">Update: ${reg.spaceWeather.update}</div>
        <div class="mc__sn-src-status">Status: ${reg.spaceWeather.status}</div>
        <a class="mc__sn-src-link" href="${reg.spaceWeather.url}" target="_blank" rel="noopener noreferrer">VIEW SOURCE ↗</a>
      `;
    }
    const ephSrc = document.getElementById('mc-sn-src-eph');
    if (ephSrc) {
      ephSrc.innerHTML = `
        <div class="mc__sn-src-name">${reg.ephemeris.name}</div>
        <div class="mc__sn-src-dataset">${reg.ephemeris.dataset}</div>
        <div class="mc__sn-src-update">Update: ${reg.ephemeris.update}</div>
        <div class="mc__sn-src-status">Type: ${reg.ephemeris.type}</div>
        <a class="mc__sn-src-link" href="${reg.ephemeris.url}" target="_blank" rel="noopener noreferrer">VIEW SOURCE ↗</a>
      `;
    }
  }

  _animateIn() {
    // Stagger-reveal each row
    const rows = document.querySelectorAll('.mc__sn-row');
    rows.forEach((row, i) => {
      row.style.opacity = '0';
      row.style.transform = 'translateX(12px)';
      setTimeout(() => {
        row.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        row.style.opacity = '1';
        row.style.transform = 'translateX(0)';
      }, i * 40);
    });
  }
}

/* ------------------------------------------------------------------
   Formatting helpers
   ------------------------------------------------------------------ */
function _utcTime(ms) {
  const d = new Date(ms);
  return `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')} UTC`;
}
function _utcNow() {
  return _utcTime(Date.now());
}
function _formatDate(date) {
  return date.toISOString().slice(0, 10);
}
