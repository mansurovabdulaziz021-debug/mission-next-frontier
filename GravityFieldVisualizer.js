/**
 * GravityFieldVisualizer.js — Relativistic Spacetime Curvature & Geodesic Lensing
 * 
 * Visualizes General Relativistic Gravitational Dynamics:
 *   - 3D Spacetime Metric Curvature Grid (Schwarzschild spatial depression)
 *   - Central Compact Gravitating Mass (White Dwarf, Stellar Black Hole, or Sgr A*)
 *   - Deflection of Photon Geodesic Paths (Bending angle θ = 4GM / c²b)
 *   - Lensed Einstein Ring geometry demonstrating gravitational lensing
 *   - Animated test particles following curved geodesic trajectories
 */

import * as THREE from 'three';

export class GravityFieldVisualizer {
  constructor(parentGroup) {
    this.group = new THREE.Group();
    this.group.name = 'GravityFieldGroup';
    this.group.rotation.x = Math.PI * 0.22; // Elevated 40° perspective to reveal spacetime curvature funnel
    this.group.visible = false;
    parentGroup.add(this.group);

    this.activeMassKey = 'STELLAR_BLACK_HOLE_10M';
    this.warpAmplification = 1.0;
    this.massStrength = 1.5;

    this._buildScene();
  }

  _buildScene() {
    // 1. Spacetime Coordinate Grid Mesh (Deformed according to Schwarzschild metric)
    this.gridSize = 36;
    this.gridSpacing = 0.28;
    this.gridGeo = new THREE.PlaneGeometry(
      this.gridSize * this.gridSpacing,
      this.gridSize * this.gridSpacing,
      this.gridSize,
      this.gridSize
    );
    this.gridGeo.rotateX(-Math.PI / 2);

    this.gridMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    this.gridMesh = new THREE.Mesh(this.gridGeo, this.gridMat);
    this.gridMesh.position.y = -0.5;
    this.group.add(this.gridMesh);

    // 2. Central Compact Gravitating Mass
    this.massGroup = new THREE.Group();
    this.massGroup.position.set(0, -0.5, 0);

    // Event Horizon / Core Sphere
    const coreGeo = new THREE.SphereGeometry(0.55, 32, 32);
    this.coreMat = new THREE.MeshStandardMaterial({
      color: 0x020617,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x000000
    });
    this.coreMesh = new THREE.Mesh(coreGeo, this.coreMat);
    this.massGroup.add(this.coreMesh);

    // Photon Sphere (r = 1.5 Rs)
    const psGeo = new THREE.RingGeometry(0.85, 0.9, 64);
    const psMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    this.photonSphere = new THREE.Mesh(psGeo, psMat);
    this.photonSphere.rotation.x = Math.PI / 2;
    this.massGroup.add(this.photonSphere);

    // Accretion Glow / Gravitational Lensing Glow Ring
    const lensRingGeo = new THREE.RingGeometry(1.2, 1.35, 64);
    const lensRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65
    });
    this.einsteinRing = new THREE.Mesh(lensRingGeo, lensRingMat);
    this.massGroup.add(this.einsteinRing);

    this.group.add(this.massGroup);

    // 3. Geodesic Light Deflection Rays
    this.geodesicGroup = new THREE.Group();
    this.group.add(this.geodesicGroup);

    // 4. Test Particles orbiting & falling along geodesics
    const partCount = 450;
    this.partGeo = new THREE.BufferGeometry();
    this.partPos = new Float32Array(partCount * 3);
    this.partVel = [];

    for (let i = 0; i < partCount; i++) {
      const radius = 1.2 + Math.random() * 3.8;
      const angle = Math.random() * Math.PI * 2;
      this.partPos[i * 3]     = Math.cos(angle) * radius;
      this.partPos[i * 3 + 1] = -0.5 - (1.2 / Math.max(0.6, radius)) * 0.4;
      this.partPos[i * 3 + 2] = Math.sin(angle) * radius;

      this.partVel.push({
        radius,
        angle,
        speed: (0.8 / Math.sqrt(radius)) * (Math.random() > 0.1 ? 1 : -1)
      });
    }
    this.partGeo.setAttribute('position', new THREE.BufferAttribute(this.partPos, 3));
    this.partMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.045,
      transparent: true,
      opacity: 0.75
    });
    this.particles = new THREE.Points(this.partGeo, this.partMat);
    this.group.add(this.particles);

    this._updateGridCurvature();
    this._rebuildGeodesicRays();
  }

  setMass(massKey) {
    this.activeMassKey = massKey;

    switch (massKey) {
      case 'WHITE_DWARF_1M':
        this.massStrength = 0.8;
        this.coreMat.color.setHex(0xe0f2fe);
        this.coreMat.emissive.setHex(0x38bdf8);
        this.coreMesh.scale.set(0.7, 0.7, 0.7);
        this.photonSphere.visible = false;
        this.einsteinRing.scale.set(0.7, 0.7, 0.7);
        break;
      case 'STELLAR_BLACK_HOLE_10M':
        this.massStrength = 1.6;
        this.coreMat.color.setHex(0x020617);
        this.coreMat.emissive.setHex(0x000000);
        this.coreMesh.scale.set(0.55, 0.55, 0.55);
        this.photonSphere.visible = true;
        this.einsteinRing.scale.set(1.0, 1.0, 1.0);
        break;
      case 'SUPERMASSIVE_SGR_A_4M':
        this.massStrength = 2.4;
        this.coreMat.color.setHex(0x000000);
        this.coreMat.emissive.setHex(0x000000);
        this.coreMesh.scale.set(0.85, 0.85, 0.85);
        this.photonSphere.visible = true;
        this.einsteinRing.scale.set(1.4, 1.4, 1.4);
        break;
      default:
        this.massStrength = 1.5;
    }

    this._updateGridCurvature();
    this._rebuildGeodesicRays();
  }

  setWarp(warpFactor) {
    this.warpAmplification = warpFactor;
    this._updateGridCurvature();
    this._rebuildGeodesicRays();
  }

  _updateGridCurvature() {
    const pos = this.gridGeo.attributes.position.array;
    const vertexCount = pos.length / 3;

    for (let i = 0; i < vertexCount; i++) {
      const x = pos[i * 3];
      const z = pos[i * 3 + 2];
      const r = Math.sqrt(x * x + z * z);

      // Flamm's paraboloid / Schwarzschild spatial metric embedding:
      // z(r) ~ -2 * sqrt(2 * M * (r - 2M)) or smooth potential well
      const depth = (this.massStrength * this.warpAmplification * 1.5) / Math.pow(r + 0.65, 0.85);
      pos[i * 3 + 1] = -depth;
    }
    this.gridGeo.attributes.position.needsUpdate = true;
    this.gridGeo.computeVertexNormals();
  }

  _rebuildGeodesicRays() {
    while (this.geodesicGroup.children.length > 0) {
      this.geodesicGroup.remove(this.geodesicGroup.children[0]);
    }

    // Trace 16 parallel light rays from -x to +x, deflected by angle θ = 4GM / c²b
    const rayCount = 14;
    for (let i = 0; i < rayCount; i++) {
      // Impact parameters b from -3.5 to +3.5
      const b = -3.2 + (i / (rayCount - 1)) * 6.4;
      if (Math.abs(b) < 0.6) continue; // Captured inside event horizon

      const pts = [];
      const steps = 40;
      for (let s = 0; s <= steps; s++) {
        const x = -4.5 + (s / steps) * 9.0;
        const r = Math.sqrt(x * x + b * b);
        
        // Deflection perpendicular displacement Δy
        const deflection = (this.massStrength * 0.45) / Math.max(0.5, b);
        const yOffset = - (deflection / (1 + (x * 0.8) * (x * 0.8)));

        // Downward vertical pull into potential well
        const zDepth = - (this.massStrength * 0.5) / Math.pow(r + 0.7, 0.9);

        pts.push(new THREE.Vector3(x, zDepth + 0.1, b + yOffset));
      }

      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.45
      });
      this.geodesicGroup.add(new THREE.Line(geo, mat));
    }
  }

  show() {
    this.group.visible = true;
  }

  hide() {
    this.group.visible = false;
  }

  update(delta, elapsed) {
    if (!this.group.visible) return;

    // Rotate mass and photon sphere
    this.photonSphere.rotation.z += delta * 0.4;
    this.einsteinRing.rotation.z -= delta * 0.2;

    // Orbit particles
    const pos = this.partPos;
    for (let i = 0; i < this.partVel.length; i++) {
      const p = this.partVel[i];
      p.angle += p.speed * delta;

      pos[i * 3]     = Math.cos(p.angle) * p.radius;
      pos[i * 3 + 2] = Math.sin(p.angle) * p.radius;
    }
    this.partGeo.attributes.position.needsUpdate = true;
  }
}
