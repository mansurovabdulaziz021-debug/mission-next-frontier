import * as THREE from 'three';

/* -----------------------------------------------------------------
   Moon Surface Shader (High-Definition Lunar Regolith & Craters)
   ----------------------------------------------------------------- */
const MOON_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vObjPos;

void main() {
  vNormal   = normalize(mat3(modelMatrix) * normal);
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  vObjPos   = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const MOON_FRAG = /* glsl */ `
uniform vec3  uSunDir;
uniform float uHover;

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
  vec3 p = normalize(vObjPos) * 6.5;
  float n1 = noise(p);
  float n2 = noise(p * 2.8);
  float n3 = noise(p * 7.5);
  float pattern = n1 * 0.52 + n2 * 0.32 + n3 * 0.16;

  // Dark maria vs bright highlands
  vec3 mariaColor    = vec3(0.16, 0.17, 0.19);
  vec3 highlandColor = vec3(0.72, 0.73, 0.76);
  vec3 surface       = mix(mariaColor, highlandColor, smoothstep(0.40, 0.65, pattern));

  // Harsh vacuum lighting
  float NdotL   = max(dot(vNormal, uSunDir), 0.0);
  float diffuse = pow(NdotL, 1.15);
  float ambient = 0.04;

  vec3 col = surface * (ambient + diffuse * 0.96);

  // Hover emphasis
  if (uHover > 0.01) {
    vec3 V = normalize(cameraPosition - vWorldPos);
    float rim = pow(1.0 - max(dot(V, vNormal), 0.0), 2.5);
    col += vec3(0.2, 0.8, 0.6) * rim * uHover * 0.4;
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

/* -----------------------------------------------------------------
   Mars Surface Shader (High-Definition Iron-Oxide & Polar Caps)
   ----------------------------------------------------------------- */
const MARS_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vObjPos;
varying vec2 vUv;

void main() {
  vNormal   = normalize(mat3(modelMatrix) * normal);
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  vObjPos   = position;
  vUv       = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const MARS_FRAG = /* glsl */ `
uniform vec3  uSunDir;
uniform float uHover;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vObjPos;
varying vec2 vUv;

float hash(vec3 p) {
  return fract(sin(dot(p, vec3(17.1, 43.7, 89.3))) * 23421.631);
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
  vec3 p = normalize(vObjPos) * 5.0;
  float terrain = noise(p) * 0.58 + noise(p * 3.2) * 0.28 + noise(p * 8.5) * 0.14;

  // Mars rust & basalt palette
  vec3 rustLow    = vec3(0.50, 0.20, 0.10);
  vec3 rustHigh   = vec3(0.80, 0.39, 0.18);
  vec3 darkBasalt = vec3(0.22, 0.13, 0.10);
  vec3 polarIce   = vec3(0.94, 0.96, 0.98);

  vec3 surface = mix(rustLow, rustHigh, terrain);
  surface      = mix(surface, darkBasalt, smoothstep(0.52, 0.74, terrain));

  // Polar ice caps
  float lat = abs(vUv.y - 0.5) * 2.0;
  surface = mix(surface, polarIce, smoothstep(0.86, 0.95, lat + terrain * 0.04));

  // Lighting & thin atmospheric scattering
  float NdotL   = max(dot(vNormal, uSunDir), 0.0);
  float diffuse = NdotL * 0.92;
  float ambient = 0.06;

  // Subtle thin orange-red atmospheric limb
  vec3 V = normalize(cameraPosition - vWorldPos);
  float fresnel = pow(1.0 - max(dot(V, vNormal), 0.0), 3.2);
  vec3 atmoLimb = vec3(0.88, 0.44, 0.22) * fresnel * 0.48 * (diffuse + 0.12);

  vec3 col = surface * (ambient + diffuse) + atmoLimb;

  // Hover emphasis
  if (uHover > 0.01) {
    col += vec3(1.0, 0.45, 0.2) * fresnel * uHover * 0.4;
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

export class CelestialBodies {
  /**
   * @param {THREE.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'CelestialBodies';

    this.sunDir = new THREE.Vector3(1, 0.25, 0.45).normalize();

    this._buildMoon();
    this._buildMars();

    this.scene.add(this.group);
  }

  /* -----------------------------------------------------------------
     Moon
     ----------------------------------------------------------------- */
  _buildMoon() {
    this.moonGroup = new THREE.Group();
    // Geocentric lunar coordinate in visualization scale
    this.moonGroup.position.set(3.6, 0.6, -1.8);

    const geo = new THREE.SphereGeometry(0.272, 48, 48);
    this.moonMat = new THREE.ShaderMaterial({
      vertexShader: MOON_VERT,
      fragmentShader: MOON_FRAG,
      uniforms: {
        uSunDir: { value: this.sunDir },
        uHover:  { value: 0 }
      }
    });

    this.moonMesh = new THREE.Mesh(geo, this.moonMat);
    this.moonMesh.name = 'MOON';
    this.moonGroup.add(this.moonMesh);

    // Target reticle ring for 3D navigation
    const reticleGeo = new THREE.RingGeometry(0.33, 0.36, 48);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    this.moonReticle = new THREE.Mesh(reticleGeo, reticleMat);
    this.moonReticle.rotation.x = Math.PI / 2;
    this.moonGroup.add(this.moonReticle);

    this.group.add(this.moonGroup);
  }

  /* -----------------------------------------------------------------
     Mars
     ----------------------------------------------------------------- */
  _buildMars() {
    this.marsGroup = new THREE.Group();
    // Heliocentric outer vector coordinate in visualization scale
    this.marsGroup.position.set(9.2, 1.6, -6.4);

    const geo = new THREE.SphereGeometry(0.532, 48, 48);
    this.marsMat = new THREE.ShaderMaterial({
      vertexShader: MARS_VERT,
      fragmentShader: MARS_FRAG,
      uniforms: {
        uSunDir: { value: this.sunDir },
        uHover:  { value: 0 }
      }
    });

    this.marsMesh = new THREE.Mesh(geo, this.marsMat);
    this.marsMesh.name = 'MARS';
    this.marsGroup.add(this.marsMesh);

    // Target reticle ring
    const reticleGeo = new THREE.RingGeometry(0.64, 0.68, 48);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    this.marsReticle = new THREE.Mesh(reticleGeo, reticleMat);
    this.marsReticle.rotation.x = Math.PI / 2;
    this.marsGroup.add(this.marsReticle);

    this.group.add(this.marsGroup);
  }

  /* -----------------------------------------------------------------
     Update loop
     ----------------------------------------------------------------- */
  update(delta, elapsed) {
    // Rotation of bodies
    this.moonMesh.rotation.y += delta * 0.02;
    this.marsMesh.rotation.y += delta * 0.04;

    // Reticles gently pulse and rotate
    this.moonReticle.rotation.z += delta * 0.15;
    this.marsReticle.rotation.z -= delta * 0.12;

    const pulse = 1.0 + Math.sin(elapsed * 2.0) * 0.06;
    this.moonReticle.scale.set(pulse, pulse, 1);
    this.marsReticle.scale.set(pulse, pulse, 1);
  }

  /**
   * Set hover highlight for specified body
   * @param {'MOON'|'MARS'} key
   * @param {boolean} isHovered
   */
  setHover(key, isHovered) {
    const val = isHovered ? 1.0 : 0.0;
    if (key === 'MOON') {
      this.moonMat.uniforms.uHover.value = val;
      this.moonReticle.material.opacity = isHovered ? 0.95 : 0.35;
    } else if (key === 'MARS') {
      this.marsMat.uniforms.uHover.value = val;
      this.marsReticle.material.opacity = isHovered ? 0.95 : 0.35;
    }
  }

  /**
   * Get target 3D world position
   * @param {'EARTH'|'MOON'|'MARS'|'SOLAR_SYSTEM'} key
   */
  getTargetPosition(key) {
    const pos = new THREE.Vector3();
    if (key === 'MOON') {
      this.moonGroup.getWorldPosition(pos);
    } else if (key === 'MARS') {
      this.marsGroup.getWorldPosition(pos);
    } else if (key === 'SOLAR_SYSTEM') {
      pos.set(4.0, 0.5, -2.5); // Mid-point of inner solar system
    } else {
      pos.set(0, 0, 0); // Earth base
    }
    return pos;
  }

  setReticleHighlight(key) {
    this.moonReticle.material.opacity = key === 'MOON' ? 0.95 : 0.35;
    this.marsReticle.material.opacity = key === 'MARS' ? 0.95 : 0.35;
  }

  dispose() {
    this.moonMesh.geometry.dispose();
    this.moonMat.dispose();
    this.marsMesh.geometry.dispose();
    this.marsMat.dispose();
    this.scene.remove(this.group);
  }
}
