import * as THREE from 'three';

/* -----------------------------------------------------------------
   Sun Shader: Procedural solar granulaton, convection cells,
   and solar flares with realistic limb darkening.
   ----------------------------------------------------------------- */
const SUN_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vObjPos;

void main() {
  vNormal = normalize(mat3(modelMatrix) * normal);
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  vObjPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const SUN_FRAG = /* glsl */ `
uniform float uTime;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vObjPos;

float hash(vec3 p) {
  return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}

void main() {
  vec3 p = normalize(vObjPos) * 4.0;
  float t = uTime * 0.15;

  // Multi-frequency solar convection noise
  float n1 = noise(p + vec3(t, -t * 0.7, t * 0.5));
  float n2 = noise(p * 2.2 - vec3(t * 0.8, t, -t * 0.6));
  float n3 = noise(p * 5.0 + vec3(-t, t * 1.2, t * 0.4));
  float plasma = n1 * 0.55 + n2 * 0.3 + n3 * 0.15;

  // Solar spectrum
  vec3 deepOrange = vec3(0.96, 0.42, 0.05);
  vec3 brightGold  = vec3(1.0, 0.82, 0.28);
  vec3 whiteCore   = vec3(1.0, 0.98, 0.92);

  vec3 col = mix(deepOrange, brightGold, smoothstep(0.3, 0.7, plasma));
  col = mix(col, whiteCore, smoothstep(0.65, 0.9, plasma));

  // Limb darkening (edges are cooler/darker orange)
  vec3 V = normalize(cameraPosition - vWorldPos);
  float rim = max(dot(V, vNormal), 0.0);
  col *= pow(rim, 0.35);

  gl_FragColor = vec4(col, 1.0);
}
`;

/* -----------------------------------------------------------------
   Corona Halo Shader
   Soft additive glow radiating into deep space.
   ----------------------------------------------------------------- */
const CORONA_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  vNormal = normalize(mat3(modelMatrix) * normal);
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const CORONA_FRAG = /* glsl */ `
uniform float uTime;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  vec3 view = normalize(cameraPosition - vWorldPos);
  float fresnel = pow(1.0 - abs(dot(view, vNormal)), 2.8);

  float pulse = 0.92 + 0.08 * sin(uTime * 1.5);
  vec3 color = mix(vec3(1.0, 0.5, 0.1), vec3(1.0, 0.85, 0.4), fresnel);

  float alpha = fresnel * 0.75 * pulse;
  gl_FragColor = vec4(color, alpha);
}
`;

export class Sun {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Vector3} [position]
   */
  constructor(scene, position = new THREE.Vector3(-14.0, 2.0, 7.5)) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'SUN';
    this.group.position.copy(position);

    this._buildPhotosphere();
    this._buildCorona();
    this._buildLighting();

    this.scene.add(this.group);
  }

  _buildPhotosphere() {
    const geo = new THREE.SphereGeometry(2.4, 48, 48);
    this.material = new THREE.ShaderMaterial({
      vertexShader: SUN_VERT,
      fragmentShader: SUN_FRAG,
      uniforms: {
        uTime: { value: 0 }
      }
    });

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.name = 'SUN_CORE';
    this.group.add(this.mesh);
  }

  _buildCorona() {
    const geo = new THREE.SphereGeometry(2.85, 32, 32);
    this.coronaMat = new THREE.ShaderMaterial({
      vertexShader: CORONA_VERT,
      fragmentShader: CORONA_FRAG,
      uniforms: {
        uTime: { value: 0 }
      },
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.coronaMesh = new THREE.Mesh(geo, this.coronaMat);
    this.group.add(this.coronaMesh);
  }

  _buildLighting() {
    // Primary directional sunlight pointing from Sun into the planetary system
    this.sunLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
    // Point light for close radial illumination
    this.omniLight = new THREE.PointLight(0xffedd5, 1.8, 60, 1.2);
    this.group.add(this.omniLight);
  }

  update(delta, elapsed) {
    this.material.uniforms.uTime.value = elapsed;
    this.coronaMat.uniforms.uTime.value = elapsed;

    this.mesh.rotation.y += delta * 0.015;
    this.coronaMesh.rotation.y -= delta * 0.02;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.coronaMesh.geometry.dispose();
    this.coronaMat.dispose();
    this.scene.remove(this.group);
  }
}
