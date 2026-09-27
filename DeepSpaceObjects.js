/**
 * PHASE 6 — DeepSpaceObjects.js
 * 
 * Three.js module that creates and manages deep space celestial objects:
 * Stars, Exoplanets, Black Holes, Nebulae, and Galaxies.
 * 
 * Objects are placed in a far-field coordinate system beyond the solar system.
 * Each object has a glow effect, label, and interactive reticle.
 */

import * as THREE from 'three';
import { DEEP_SPACE_OBJECTS, DEEP_SPACE_CATEGORIES } from '../data/deepSpaceData.js';

/* ─────────────────────────────────────────────
   Star Glow Shader — point sprite with bloom
   ───────────────────────────────────────────── */
const GLOW_VERT = /* glsl */ `
attribute float aSize;
attribute vec3  aColor;
attribute float aPhase;
uniform float uTime;
uniform float uOpacity;

varying vec3  vColor;
varying float vAlpha;

void main() {
  vColor = aColor;
  float pulse = 0.85 + 0.15 * sin(uTime * 1.2 + aPhase * 6.2831);
  vAlpha = pulse * uOpacity;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (300.0 / -mv.z);
  gl_PointSize = clamp(gl_PointSize, 2.0, 64.0);
  gl_Position = projectionMatrix * mv;
}
`;

const GLOW_FRAG = /* glsl */ `
varying vec3  vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  float core = 1.0 - smoothstep(0.0, 0.15, d);
  float halo = 1.0 - smoothstep(0.0, 0.5, d);
  halo *= halo;
  float a = core * 0.9 + halo * 0.5;
  gl_FragColor = vec4(vColor, a * vAlpha);
}
`;

/* ─────────────────────────────────────────────
   Black Hole Accretion Disk Shader
   ───────────────────────────────────────────── */
const BH_DISK_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const BH_DISK_FRAG = /* glsl */ `
uniform float uTime;
varying vec2 vUv;

void main() {
  vec2 p = vUv - 0.5;
  float r = length(p);
  float angle = atan(p.y, p.x);

  // Accretion disk ring
  float ring = smoothstep(0.12, 0.18, r) * (1.0 - smoothstep(0.42, 0.50, r));

  // Swirl pattern
  float swirl = sin(angle * 4.0 + uTime * 2.0 - r * 15.0) * 0.5 + 0.5;
  float glow = ring * (0.5 + swirl * 0.5);

  // Color: hot inner (white-yellow) to cool outer (red-orange)
  vec3 inner = vec3(1.0, 0.95, 0.8);
  vec3 outer = vec3(0.9, 0.3, 0.1);
  vec3 col = mix(inner, outer, smoothstep(0.15, 0.45, r));

  // Central shadow (event horizon)
  float shadow = smoothstep(0.08, 0.14, r);

  float alpha = glow * shadow;
  gl_FragColor = vec4(col * glow, alpha * 0.85);
}
`;

/* ─────────────────────────────────────────────
   Nebula Billboard Shader
   ───────────────────────────────────────────── */
const NEBULA_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const NEBULA_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3  uColor;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

void main() {
  vec2 p = (vUv - 0.5) * 5.0;
  float n1 = noise(p + uTime * 0.05);
  float n2 = noise(p * 2.5 + uTime * 0.08);
  float n3 = noise(p * 5.0 - uTime * 0.03);
  float pattern = n1 * 0.55 + n2 * 0.30 + n3 * 0.15;

  float dist = length(vUv - 0.5);
  float vignette = 1.0 - smoothstep(0.2, 0.5, dist);

  vec3 col = uColor * (0.4 + pattern * 0.8);
  col += vec3(0.15, 0.05, 0.02) * (1.0 - pattern) * 0.3;

  float alpha = vignette * pattern * 0.7;
  gl_FragColor = vec4(col, alpha);
}
`;


export class DeepSpaceObjects {
  /**
   * @param {THREE.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'DeepSpaceObjects';
    this.group.visible = false; // Hidden until Phase 6 transition

    /** @type {Map<string, THREE.Object3D>} */
    this._objectGroups = new Map();
    /** @type {Map<string, THREE.Mesh>} */
    this._hitTargets = new Map();

    this._opacity = 0;
    this._time = 0;

    this._buildStarPoints();
    this._buildBlackHoles();
    this._buildNebulae();
    this._buildGalaxies();
    this._buildExoplanets();
    this._buildConnectionLines();

    this.scene.add(this.group);
  }

  /* ─────── Star-type objects (point sprites) ─────── */
  _buildStarPoints() {
    const stars = DEEP_SPACE_OBJECTS.filter(o => o.category === 'STARS');
    for (const star of stars) {
      const g = new THREE.Group();
      g.position.set(star.scenePosition.x, star.scenePosition.y, star.scenePosition.z);

      // Glowing sphere
      const geo = new THREE.SphereGeometry(star.visualRadius, 24, 24);
      const mat = new THREE.MeshBasicMaterial({
        color: star.visualColor,
        transparent: true,
        opacity: 0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = star.id;
      g.add(mesh);
      this._hitTargets.set(star.id, mesh);

      // Outer glow halo
      const haloGeo = new THREE.SphereGeometry(star.visualRadius * 2.5, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: star.visualColor,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      g.add(halo);

      // Reticle
      const retGeo = new THREE.RingGeometry(star.visualRadius * 1.5, star.visualRadius * 1.6, 48);
      const retMat = new THREE.MeshBasicMaterial({
        color: DEEP_SPACE_CATEGORIES[star.category].color,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const reticle = new THREE.Mesh(retGeo, retMat);
      reticle.rotation.x = Math.PI / 2;
      g.add(reticle);

      g.userData = { star, mat, haloMat, retMat, type: 'star' };
      this._objectGroups.set(star.id, g);
      this.group.add(g);
    }
  }

  /* ─────── Black hole objects ─────── */
  _buildBlackHoles() {
    const bhs = DEEP_SPACE_OBJECTS.filter(o => o.category === 'BLACK_HOLES');
    for (const bh of bhs) {
      const g = new THREE.Group();
      g.position.set(bh.scenePosition.x, bh.scenePosition.y, bh.scenePosition.z);

      // Event horizon (dark sphere)
      const coreGeo = new THREE.SphereGeometry(bh.visualRadius * 0.4, 32, 32);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.name = bh.id;
      g.add(core);
      this._hitTargets.set(bh.id, core);

      // Accretion disk
      const diskGeo = new THREE.PlaneGeometry(bh.visualRadius * 4, bh.visualRadius * 4);
      const diskMat = new THREE.ShaderMaterial({
        vertexShader: BH_DISK_VERT,
        fragmentShader: BH_DISK_FRAG,
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const disk = new THREE.Mesh(diskGeo, diskMat);
      disk.rotation.x = -Math.PI / 2.5;
      g.add(disk);

      // Photon ring glow
      const ringGeo = new THREE.RingGeometry(bh.visualRadius * 0.5, bh.visualRadius * 1.8, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2.5;
      g.add(ring);

      g.userData = { bh, coreMat, diskMat, ringMat, type: 'blackhole' };
      this._objectGroups.set(bh.id, g);
      this.group.add(g);
    }
  }

  /* ─────── Nebula billboards ─────── */
  _buildNebulae() {
    const nebulae = DEEP_SPACE_OBJECTS.filter(o => o.category === 'NEBULAE');
    for (const neb of nebulae) {
      const g = new THREE.Group();
      g.position.set(neb.scenePosition.x, neb.scenePosition.y, neb.scenePosition.z);

      const c = new THREE.Color(neb.visualColor);

      const planeGeo = new THREE.PlaneGeometry(neb.visualRadius * 5, neb.visualRadius * 5);
      const planeMat = new THREE.ShaderMaterial({
        vertexShader: NEBULA_VERT,
        fragmentShader: NEBULA_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Vector3(c.r, c.g, c.b) }
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.name = neb.id;
      g.add(plane);
      this._hitTargets.set(neb.id, plane);

      // Small central bright point
      const dotGeo = new THREE.SphereGeometry(neb.visualRadius * 0.3, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({
        color: neb.visualColor,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      g.add(dot);

      g.userData = { neb, planeMat, dotMat, type: 'nebula' };
      this._objectGroups.set(neb.id, g);
      this.group.add(g);
    }
  }

  /* ─────── Galaxy objects ─────── */
  _buildGalaxies() {
    const galaxies = DEEP_SPACE_OBJECTS.filter(o => o.category === 'GALAXIES');
    for (const gal of galaxies) {
      const g = new THREE.Group();
      g.position.set(gal.scenePosition.x, gal.scenePosition.y, gal.scenePosition.z);

      // Galaxy disc (procedural spiral via noise plane)
      const c = new THREE.Color(gal.visualColor);
      const planeGeo = new THREE.PlaneGeometry(gal.visualRadius * 5, gal.visualRadius * 5);
      const planeMat = new THREE.ShaderMaterial({
        vertexShader: NEBULA_VERT,
        fragmentShader: NEBULA_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Vector3(c.r, c.g, c.b) }
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.rotation.x = -0.6;
      plane.name = gal.id;
      g.add(plane);
      this._hitTargets.set(gal.id, plane);

      // Bright central nucleus
      const nucGeo = new THREE.SphereGeometry(gal.visualRadius * 0.4, 16, 16);
      const nucMat = new THREE.MeshBasicMaterial({
        color: gal.visualColor,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const nucleus = new THREE.Mesh(nucGeo, nucMat);
      g.add(nucleus);

      g.userData = { gal, planeMat, nucMat, type: 'galaxy' };
      this._objectGroups.set(gal.id, g);
      this.group.add(g);
    }
  }

  /* ─────── Exoplanet spheres ─────── */
  _buildExoplanets() {
    const exos = DEEP_SPACE_OBJECTS.filter(o => o.category === 'EXOPLANETS');
    for (const exo of exos) {
      const g = new THREE.Group();
      g.position.set(exo.scenePosition.x, exo.scenePosition.y, exo.scenePosition.z);

      const geo = new THREE.SphereGeometry(exo.visualRadius, 32, 32);
      const mat = new THREE.MeshBasicMaterial({
        color: exo.visualColor,
        transparent: true,
        opacity: 0
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = exo.id;
      g.add(mesh);
      this._hitTargets.set(exo.id, mesh);

      // Atmospheric halo
      const haloGeo = new THREE.SphereGeometry(exo.visualRadius * 1.6, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: exo.visualColor,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      g.add(halo);

      // Orbit ring
      const orbitGeo = new THREE.RingGeometry(exo.visualRadius * 2.0, exo.visualRadius * 2.1, 48);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: DEEP_SPACE_CATEGORIES.EXOPLANETS.color,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const orbit = new THREE.Mesh(orbitGeo, orbitMat);
      orbit.rotation.x = Math.PI / 2;
      g.add(orbit);

      g.userData = { exo, mat, haloMat, orbitMat, type: 'exoplanet' };
      this._objectGroups.set(exo.id, g);
      this.group.add(g);
    }
  }

  /* ─────── Faint connection lines between related objects ─────── */
  _buildConnectionLines() {
    // Subtle dotted lines between a few scientifically related objects
    const connections = [
      ['TRAPPIST_1', 'KEPLER_442B'],
      ['SAGITTARIUS_A_STAR', 'M87_BLACK_HOLE'],
      ['PILLARS_OF_CREATION', 'CRAB_NEBULA'],
      ['ANDROMEDA', 'HUBBLE_ULTRA_DEEP_FIELD']
    ];

    for (const [aId, bId] of connections) {
      const a = DEEP_SPACE_OBJECTS.find(o => o.id === aId);
      const b = DEEP_SPACE_OBJECTS.find(o => o.id === bId);
      if (!a || !b) continue;

      const points = [
        new THREE.Vector3(a.scenePosition.x, a.scenePosition.y, a.scenePosition.z),
        new THREE.Vector3(b.scenePosition.x, b.scenePosition.y, b.scenePosition.z)
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: 0x334155,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const line = new THREE.Line(geo, mat);
      line.userData = { connectionMat: mat };
      this.group.add(line);
    }
  }

  /* ─────── Opacity & Visibility ─────── */
  setOpacity(val) {
    this._opacity = Math.max(0, Math.min(1, val));

    for (const [, g] of this._objectGroups) {
      const ud = g.userData;
      if (ud.type === 'star') {
        ud.mat.opacity = this._opacity * 0.9;
        ud.haloMat.opacity = this._opacity * 0.2;
        ud.retMat.opacity = this._opacity * 0.35;
      } else if (ud.type === 'blackhole') {
        ud.coreMat.opacity = this._opacity;
        ud.ringMat.opacity = this._opacity * 0.3;
      } else if (ud.type === 'nebula') {
        ud.dotMat.opacity = this._opacity * 0.6;
      } else if (ud.type === 'galaxy') {
        ud.nucMat.opacity = this._opacity * 0.6;
      } else if (ud.type === 'exoplanet') {
        ud.mat.opacity = this._opacity * 0.85;
        ud.haloMat.opacity = this._opacity * 0.15;
        ud.orbitMat.opacity = this._opacity * 0.25;
      }
    }

    // Connection lines
    for (const child of this.group.children) {
      if (child.userData.connectionMat) {
        child.userData.connectionMat.opacity = this._opacity * 0.12;
      }
    }
  }

  show() {
    this.group.visible = true;
  }

  hide() {
    this.group.visible = false;
    this.setOpacity(0);
  }

  /* ─────── Get all hit-testable meshes ─────── */
  getHitTargets() {
    return Array.from(this._hitTargets.values());
  }

  /**
   * Get the 3D group for a specific object
   * @param {string} id
   */
  getObjectGroup(id) {
    return this._objectGroups.get(id);
  }

  /**
   * Get world position of an object
   * @param {string} id
   */
  getObjectPosition(id) {
    const g = this._objectGroups.get(id);
    if (!g) return new THREE.Vector3(40, 5, -35);
    const pos = new THREE.Vector3();
    g.getWorldPosition(pos);
    return pos;
  }

  /* ─────── Per-frame update ─────── */
  update(delta, elapsed) {
    if (!this.group.visible) return;
    this._time = elapsed;

    for (const [, g] of this._objectGroups) {
      const ud = g.userData;

      if (ud.type === 'star') {
        // Gentle pulsation
        const scale = 1.0 + Math.sin(elapsed * 1.5 + g.position.x) * 0.04;
        g.children[0].scale.set(scale, scale, scale);
        // Halo breathing
        const haloScale = 1.0 + Math.sin(elapsed * 0.8) * 0.1;
        g.children[1].scale.set(haloScale, haloScale, haloScale);
        // Reticle rotation
        g.children[2].rotation.z += delta * 0.1;
      } else if (ud.type === 'blackhole') {
        // Update accretion disk shader time
        ud.diskMat.uniforms.uTime.value = elapsed;
        // Slow rotation of the disk
        g.children[1].rotation.z += delta * 0.2;
      } else if (ud.type === 'nebula') {
        // Update nebula shader
        ud.planeMat.uniforms.uTime.value = elapsed;
        // Billboard: face camera (approximate)
        g.children[0].lookAt(g.children[0].localToWorld(new THREE.Vector3(0, 0, 1)).add(
          new THREE.Vector3(0, 0, 0)
        ));
      } else if (ud.type === 'galaxy') {
        ud.planeMat.uniforms.uTime.value = elapsed;
        // Slow galactic rotation
        g.children[0].rotation.z += delta * 0.02;
      } else if (ud.type === 'exoplanet') {
        // Orbital motion hint
        g.children[0].rotation.y += delta * 0.15;
        // Orbit ring pulse
        const pulse = 1.0 + Math.sin(elapsed * 2.0 + g.position.z) * 0.05;
        g.children[2].scale.set(pulse, pulse, 1);
      }
    }
  }

  dispose() {
    this.scene.remove(this.group);
    for (const [, g] of this._objectGroups) {
      g.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (child.material.dispose) child.material.dispose();
        }
      });
    }
  }
}
