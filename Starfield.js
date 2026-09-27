import * as THREE from 'three';

/* ---------------------------------------------------------------
   Star field — point cloud with colour temperature variation
   --------------------------------------------------------------- */

const STAR_VERT = /* glsl */ `
attribute float aSize;
attribute vec3  aColor;
attribute float aPhase;

uniform float uTime;

varying vec3  vColor;
varying float vAlpha;

void main(){
  vColor = aColor;

  // Subtle twinkle
  float twinkle = 0.85 + 0.15 * sin(uTime * 0.8 + aPhase * 6.2831);
  vAlpha = twinkle;

  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (180.0 / -mv.z);
  gl_Position  = projectionMatrix * mv;
}
`;

const STAR_FRAG = /* glsl */ `
varying vec3  vColor;
varying float vAlpha;

void main(){
  float d = length(gl_PointCoord - vec2(0.5));
  float a = 1.0 - smoothstep(0.0, 0.5, d);
  a *= a;                       // softer falloff
  gl_FragColor = vec4(vColor, a * vAlpha);
}
`;

export class Starfield {
  /**
   * @param {THREE.Scene} scene
   * @param {number} [count=4000]
   */
  constructor(scene, count = 4000) {
    this.scene = scene;

    const pos   = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const cols  = new Float32Array(count * 3);
    const phase = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spherical shell distribution
      const r     = 50 + Math.random() * 150;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);

      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      sizes[i] = Math.random() * 1.8 + 0.4;
      phase[i] = Math.random();

      // Colour temperature
      const t = Math.random();
      if (t < 0.08) {
        // Warm orange-ish
        cols[i * 3] = 1.0; cols[i * 3 + 1] = 0.82; cols[i * 3 + 2] = 0.65;
      } else if (t < 0.14) {
        // Cool blue
        cols[i * 3] = 0.65; cols[i * 3 + 1] = 0.82; cols[i * 3 + 2] = 1.0;
      } else {
        // Neutral white
        const w = 0.88 + Math.random() * 0.12;
        cols[i * 3] = w; cols[i * 3 + 1] = w; cols[i * 3 + 2] = w;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aColor',   new THREE.BufferAttribute(cols, 3));
    geo.setAttribute('aPhase',   new THREE.BufferAttribute(phase, 1));

    this._mat = new THREE.ShaderMaterial({
      vertexShader: STAR_VERT,
      fragmentShader: STAR_FRAG,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.points = new THREE.Points(geo, this._mat);
    scene.add(this.points);
  }

  /**
   * @param {number} delta
   * @param {number} elapsed
   */
  update(delta, elapsed) {
    this._mat.uniforms.uTime.value = elapsed;

    // Imperceptible drift for "floating in space" feeling
    this.points.rotation.y += delta * 0.002;
    this.points.rotation.x += delta * 0.0008;
  }

  dispose() {
    this.points.geometry.dispose();
    this._mat.dispose();
    this.scene.remove(this.points);
  }
}
