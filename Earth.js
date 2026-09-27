import * as THREE from 'three';

/* ---------------------------------------------------------------
   GLSL: 3-D Simplex noise (Ashima / Stefan Gustavson)
   Inlined for zero-dependency standalone execution.
   --------------------------------------------------------------- */
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 mod289(vec4 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
           i.z + vec4(0.0, i1.z, i2.z, 1.0))
         + i.y + vec4(0.0, i1.y, i2.y, 1.0))
         + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x2_ = x_ * ns.x + ns.yyyy;
  vec4 y2_ = y_ * ns.x + ns.yyyy;
  vec4 h   = 1.0 - abs(x2_) - abs(y2_);

  vec4 b0 = vec4(x2_.xy, y2_.xy);
  vec4 b1 = vec4(x2_.zw, y2_.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

float fbm(vec3 p){
  float v = 0.0, a = 0.5, f = 1.0;
  for(int i = 0; i < 5; i++){
    v += a * snoise(p * f);
    a *= 0.5; f *= 2.0;
  }
  return v;
}
`;

/* ---------------------------------------------------------------
   Earth Surface Shader (Continents, Shelf, Terrain, City lights)
   --------------------------------------------------------------- */
const EARTH_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vObjPos;
varying vec2 vUv;

void main(){
  vNormal   = normalize(mat3(modelMatrix) * normal);
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  vObjPos   = position;
  vUv       = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const EARTH_FRAG = /* glsl */ `
uniform vec3  uSunDir;
uniform float uTime;
uniform float uHover;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vObjPos;
varying vec2 vUv;

${NOISE_GLSL}

void main(){
  vec3 sp = normalize(vObjPos) * 2.0;
  float cn = fbm(sp + vec3(0.5, 0.0, 0.3));

  // Scientific terrestrial color palette
  vec3 deepOcean    = vec3(0.015, 0.05, 0.16);
  vec3 shallowShelf = vec3(0.035, 0.11, 0.25);
  vec3 lushPlains   = vec3(0.07, 0.14, 0.05);
  vec3 highlands    = vec3(0.13, 0.11, 0.06);
  vec3 aridDesert   = vec3(0.19, 0.16, 0.09);
  vec3 polarIce     = vec3(0.76, 0.81, 0.88);

  float landMask = smoothstep(-0.02, 0.06, cn);
  float highMask = smoothstep(0.15, 0.35, cn);

  vec3 ocean   = mix(deepOcean, shallowShelf, smoothstep(-0.3, -0.02, cn));
  vec3 terrain = mix(lushPlains, mix(highlands, aridDesert, highMask), highMask);
  vec3 surface = mix(ocean, terrain, landMask);

  // Polar ice caps
  float lat = abs(vUv.y - 0.5) * 2.0;
  surface = mix(surface, polarIce, smoothstep(0.76, 0.93, lat + cn * 0.1));

  // Physically tuned lighting
  float NdotL   = dot(vNormal, uSunDir);
  float diffuse = max(NdotL, 0.0);
  float ambient = 0.08;

  // City lights on night side
  float night = 1.0 - smoothstep(-0.08, 0.18, NdotL);
  float city  = max(snoise(sp * 8.5), 0.0) * landMask;
  vec3 lights = vec3(1.0, 0.84, 0.52) * city * 0.28 * night;

  vec3 col = surface * (ambient + diffuse * 0.94) + lights;

  // Ocean specular reflection
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 H = normalize(uSunDir + V);
  float spec = pow(max(dot(vNormal, H), 0.0), 64.0) * (1.0 - landMask) * 0.4;
  col += vec3(spec);

  // Interactive hover highlight (subtle targeted luminescence)
  if (uHover > 0.01) {
    float fresnel = pow(1.0 - max(dot(V, vNormal), 0.0), 2.5);
    col += vec3(0.2, 0.5, 1.0) * fresnel * uHover * 0.35;
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

/* ---------------------------------------------------------------
   Realistic Cloud Layer Shader
   3D independent sphere with atmospheric cloud shadow & transparency.
   --------------------------------------------------------------- */
const CLOUD_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vObjPos;

void main(){
  vNormal   = normalize(mat3(modelMatrix) * normal);
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  vObjPos   = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const CLOUD_FRAG = /* glsl */ `
uniform vec3  uSunDir;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vObjPos;

${NOISE_GLSL}

void main(){
  vec3 cp = normalize(vObjPos) * 2.8;
  float t = uTime * 0.012;

  // Cloud multi-octave synthesis
  float c1 = fbm(cp + vec3(t, t * 0.5, -t * 0.3));
  float c2 = snoise(cp * 3.5 + vec3(-t * 0.5, t, 0.0));
  float density = smoothstep(0.12, 0.58, c1 + c2 * 0.25);

  float NdotL = max(dot(vNormal, uSunDir), 0.0);
  float lit   = 0.12 + 0.88 * NdotL;

  vec3 cloudColor = vec3(0.96, 0.98, 1.0) * lit;
  float alpha     = density * 0.72;

  gl_FragColor = vec4(cloudColor, alpha);
}
`;

/* ---------------------------------------------------------------
   Atmosphere Glow Shader (Rayleigh BackSide Fresnel)
   --------------------------------------------------------------- */
const ATMO_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPos;

void main(){
  vNormal   = normalize(mat3(modelMatrix) * normal);
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const ATMO_FRAG = /* glsl */ `
uniform vec3 uSunDir;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main(){
  vec3 view     = normalize(cameraPosition - vWorldPos);
  float fresnel = pow(1.0 - max(dot(view, vNormal), 0.0), 3.2);

  float sun  = max(dot(vNormal, uSunDir), 0.0);
  vec3 skyBlue = vec3(0.16, 0.45, 0.95);
  vec3 sunlit  = vec3(0.38, 0.72, 1.0);
  vec3 col     = mix(skyBlue, sunlit, sun);

  float a = fresnel * 0.62 * smoothstep(0.0, 0.28, fresnel);
  gl_FragColor = vec4(col, a);
}
`;

export class Earth {
  /**
   * @param {THREE.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'EARTH_SYSTEM';

    this._targetTiltX = 0;
    this._targetTiltY = 0;
    this._hoverAmount = 0;

    this.sunDir = new THREE.Vector3(1, 0.25, 0.45).normalize();

    this._buildSurface();
    this._buildClouds();
    this._buildAtmosphere();

    scene.add(this.group);
  }

  /* --- Surface -------------------------------------------------- */
  _buildSurface() {
    const geo = new THREE.SphereGeometry(1, 64, 64);

    this._surfaceMat = new THREE.ShaderMaterial({
      vertexShader: EARTH_VERT,
      fragmentShader: EARTH_FRAG,
      uniforms: {
        uSunDir: { value: this.sunDir },
        uTime:   { value: 0 },
        uHover:  { value: 0 }
      }
    });

    this.mesh = new THREE.Mesh(geo, this._surfaceMat);
    this.mesh.name = 'EARTH';
    this.group.add(this.mesh);
  }

  /* --- Cloud Layer ---------------------------------------------- */
  _buildClouds() {
    const geo = new THREE.SphereGeometry(1.018, 48, 48);

    this._cloudMat = new THREE.ShaderMaterial({
      vertexShader: CLOUD_VERT,
      fragmentShader: CLOUD_FRAG,
      uniforms: {
        uSunDir: { value: this.sunDir },
        uTime:   { value: 0 }
      },
      transparent: true,
      depthWrite: false
    });

    this.cloudsMesh = new THREE.Mesh(geo, this._cloudMat);
    this.cloudsMesh.name = 'EARTH_CLOUDS';
    this.group.add(this.cloudsMesh);
  }

  /* --- Atmosphere Glow ------------------------------------------ */
  _buildAtmosphere() {
    const geo = new THREE.SphereGeometry(1.055, 64, 64);

    this._atmoMat = new THREE.ShaderMaterial({
      vertexShader: ATMO_VERT,
      fragmentShader: ATMO_FRAG,
      uniforms: {
        uSunDir: { value: this.sunDir }
      },
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false
    });

    this._atmoMesh = new THREE.Mesh(geo, this._atmoMat);
    this.group.add(this._atmoMesh);
  }

  /* --- Per-Frame Update ----------------------------------------- */
  update(delta, elapsed) {
    // Earth axial rotation
    this.mesh.rotation.y += delta * 0.05;

    // Atmospheric cloud drift (slightly faster for dynamic weather depth)
    this.cloudsMesh.rotation.y += delta * 0.065;
    this._atmoMesh.rotation.y += delta * 0.03;

    this._surfaceMat.uniforms.uTime.value = elapsed;
    this._cloudMat.uniforms.uTime.value   = elapsed;

    // Smooth hover transition
    this._surfaceMat.uniforms.uHover.value = this._hoverAmount;

    // Smooth pointer tilt on the group
    const f = 1 - Math.pow(0.04, delta);
    this.group.rotation.x += (this._targetTiltX - this.group.rotation.x) * f;
    this.group.rotation.y += (this._targetTiltY - this.group.rotation.y) * f;
  }

  setHover(isHovered) {
    this._hoverAmount = isHovered ? 1.0 : 0.0;
  }

  setPointerInfluence(nx, ny) {
    this._targetTiltX = ny * 0.12;
    this._targetTiltY = nx * 0.12;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this._surfaceMat.dispose();
    this.cloudsMesh.geometry.dispose();
    this._cloudMat.dispose();
    this._atmoMesh.geometry.dispose();
    this._atmoMat.dispose();
    this.scene.remove(this.group);
  }
}
