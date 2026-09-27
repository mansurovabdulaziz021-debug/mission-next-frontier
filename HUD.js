/**
 * HUD overlay — updates real-time data readouts.
 * Pure DOM, no dependencies.
 */
export class HUD {
  constructor() {
    this._utc    = document.getElementById('hud-utc');
    this._sys    = document.getElementById('hud-sys');
    this._lat    = document.getElementById('hud-lat');
    this._dist   = document.getElementById('hud-dist');
    this._mcTime = document.getElementById('mc-time');

    this._lastSec = -1;
  }

  /** Call every frame — internally throttled to once per second. */
  update() {
    const now = new Date();
    const sec = now.getUTCSeconds();
    if (sec === this._lastSec) return;
    this._lastSec = sec;

    const ts = now.toISOString().slice(11, 19);

    if (this._utc)    this._utc.textContent    = ts;
    if (this._mcTime) this._mcTime.textContent = `${ts} UTC`;
  }

  /**
   * Update coordinate readout based on pointer position.
   * @param {number} nx  normalised pointer x  (-1…1)
   * @param {number} ny  normalised pointer y  (-1…1)
   */
  setPointerData(nx, ny) {
    if (this._lat) {
      this._lat.textContent = `${(ny * 90).toFixed(3)}°`;
    }
  }
}
