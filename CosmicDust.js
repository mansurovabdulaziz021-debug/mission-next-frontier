import * as THREE from 'three';

/**
 * CosmicDust — Restrained deep-space micro-particles that provide
 * rich spatial depth and parallax motion without visual clutter.
 */
export class CosmicDust {
  /**
   * @param {THREE.Scene} scene
   * @param {number} [count=600]
   */
  constructor(scene, count = 600) {
    this.scene = scene;

    const positions = new Float32Array(count * 3);
    const opacities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distributed across active interplanetary corridor
      positions[i * 3]     = (Math.random() - 0.3) * 24.0;
      positions[i * 3 + 1] = (Math.random() - 0.4) * 12.0;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 18.0;

      opacities[i] = Math.random() * 0.4 + 0.15;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(opacities, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        attribute float aAlpha;
        varying float vAlpha;
        void main() {
          vAlpha = aAlpha;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = (1.5 / -mv.z) * 120.0;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float falloff = pow(1.0 - d * 2.0, 2.0);
          gl_FragColor = vec4(0.4, 0.7, 1.0, falloff * vAlpha * 0.35);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.points = new THREE.Points(geo, mat);
    this.scene.add(this.points);
  }

  update(delta) {
    // Subtle cosmic drift
    this.points.rotation.y += delta * 0.003;
    this.points.rotation.x += delta * 0.001;
  }

  dispose() {
    this.points.geometry.dispose();
    this.points.material.dispose();
    this.scene.remove(this.points);
  }
}
