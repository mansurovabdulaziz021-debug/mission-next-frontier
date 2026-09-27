/**
 * CursorSystem.js — Precision Scientific Instrument Pointer
 * 
 * Provides an unobtrusive, hardware-accelerated cursor HUD reticle:
 *   - Modes: DEFAULT, EXPLORE, TARGET, DATA, LINK, DISCOVERY
 *   - Subtly communicates interactive state without obstructing content
 *   - Automatic detection of interactive targets via data attributes and classes
 */

export class CursorSystem {
  constructor() {
    this.currentMode = 'DEFAULT';
    this.mouse = { x: -100, y: -100 };
    this.pos = { x: -100, y: -100 };
    this.visible = false;
    this._raf = null;

    // Check touch device
    this.isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (!this.isTouch) {
      this._buildDOM();
      this._bindEvents();
      this._startLoop();
    }
  }

  _buildDOM() {
    this.el = document.createElement('div');
    this.el.className = 'sci-cursor';
    this.el.id = 'sci-cursor';
    this.el.setAttribute('aria-hidden', 'true');
    this.el.innerHTML = `
      <div class="sci-cursor__dot"></div>
      <div class="sci-cursor__ring"></div>
      <div class="sci-cursor__tag"></div>
    `;
    document.body.appendChild(this.el);
    this.tagEl = this.el.querySelector('.sci-cursor__tag');
  }

  _bindEvents() {
    window.addEventListener('pointermove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      if (!this.visible) {
        this.visible = true;
        this.el.classList.add('sci-cursor--visible');
      }

      // Context detection
      this._detectContext(e.target);
    });

    document.addEventListener('pointerleave', () => {
      this.visible = false;
      this.el.classList.remove('sci-cursor--visible');
    });

    window.addEventListener('mousedown', () => {
      this.el.classList.add('sci-cursor--active');
    });

    window.addEventListener('mouseup', () => {
      this.el.classList.remove('sci-cursor--active');
    });
  }

  _detectContext(target) {
    if (!target) return;

    if (target.closest('[data-cursor="DISCOVERY"]') || target.closest('.mc__discovery-toggle') || target.closest('.mc__beacon-action')) {
      this.setMode('DISCOVERY', 'DISCOVER');
    } else if (target.closest('[data-cursor="TARGET"]') || target.closest('.mc__dest-tab') || target.closest('.mc__deep-space-btn')) {
      this.setMode('TARGET', 'ACQUIRE');
    } else if (target.closest('[data-cursor="DATA"]') || target.closest('.mc__science-tab') || target.closest('.mc__vector-item') || target.closest('.obs__canvas-card')) {
      this.setMode('DATA', 'MEASURE');
    } else if (target.closest('[data-cursor="EXPLORE"]') || target.closest('#scene-canvas') || target.closest('.obs__canvas')) {
      this.setMode('EXPLORE', 'EXPLORE');
    } else if (target.closest('button, a, input, select') || target.closest('[role="button"]') || target.closest('.clickable')) {
      this.setMode('LINK', 'ENGAGE');
    } else {
      this.setMode('DEFAULT', '');
    }
  }

  setMode(mode, label = '') {
    if (this.currentMode === mode) return;
    this.currentMode = mode;
    this.el.dataset.mode = mode;
    if (this.tagEl) {
      this.tagEl.textContent = label;
      this.tagEl.style.display = label ? 'block' : 'none';
    }
  }

  _startLoop() {
    const render = () => {
      if (this.visible) {
        // High responsiveness lerp
        this.pos.x += (this.mouse.x - this.pos.x) * 0.45;
        this.pos.y += (this.mouse.y - this.pos.y) * 0.45;
        this.el.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`;
      }
      this._raf = requestAnimationFrame(render);
    };
    this._raf = requestAnimationFrame(render);
  }

  destroy() {
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
  }
}
