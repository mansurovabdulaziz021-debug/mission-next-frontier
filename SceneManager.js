import * as THREE from 'three';

/**
 * Core Three.js scene manager.
 * Owns the scene, camera, renderer, resize handling, and render loop.
 */
export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;

    // Scene
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 5);

    // LookAt vector tracked per-frame
    this.currentLookAt = new THREE.Vector3(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Update callbacks
    this._updateCallbacks = [];

    // Resize
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);

    // Render loop
    this._animate = this._animate.bind(this);
    this._animate();
  }

  /**
   * Register a callback to run each frame.
   * @param {(delta: number, elapsed: number) => void} callback
   */
  onUpdate(callback) {
    this._updateCallbacks.push(callback);
  }

  /**
   * Project a 3D world position to 2D screen coordinates.
   * @param {THREE.Vector3} worldPos
   */
  projectTo2D(worldPos) {
    const v = worldPos.clone();
    v.project(this.camera);
    const hw = window.innerWidth / 2;
    const hh = window.innerHeight / 2;
    return {
      x: (v.x * hw) + hw,
      y: -(v.y * hh) + hh,
      visible: v.z < 1.0
    };
  }

  /** @private */
  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  /** @private */
  _animate() {
    requestAnimationFrame(this._animate);

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    for (const cb of this._updateCallbacks) {
      cb(delta, elapsed);
    }

    this.camera.lookAt(this.currentLookAt);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    window.removeEventListener('resize', this._onResize);
    this.renderer.dispose();
  }
}
