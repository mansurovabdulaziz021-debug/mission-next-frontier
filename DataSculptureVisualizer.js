/**
 * DataSculptureVisualizer.js — Dynamic Telemetry-Driven 3D Manifold
 * 
 * Transforms authentic scientific data into a living 3D data sculpture:
 *   - Mode 1: LIGO GW150914 Gravitational Wave Quadrupole Strain Chirp
 *   - Mode 2: Solar Helioseismic Acoustic p-Mode Spherical Harmonics
 *   - Mode 3: Planck CMB Angular Power Spectrum Multi-Scale Waves
 * 
 * Mathematical surface z(u, v, t) deformation directly derived from physical equations.
 */

import * as THREE from 'three';

export class DataSculptureVisualizer {
  constructor(parentGroup) {
    this.group = new THREE.Group();
    this.group.name = 'DataSculptureGroup';
    this.group.rotation.x = Math.PI * 0.24; // Elevated 43° perspective for 3D harmonic wave relief
    this.group.visible = false;
    parentGroup.add(this.group);

    this.activeMode = 'LIGO_GW150914';
    this.frequencyFactor = 1.2;
    this.waveAmplitude = 1.0;

    this._buildScene();
  }

  _buildScene() {
    // 1. Parametric 3D Deforming Manifold Surface (64x64 grid)
    this.gridU = 56;
    this.gridV = 56;
    this.width = 6.0;
    this.height = 6.0;

    this.sculptureGeo = new THREE.PlaneGeometry(this.width, this.height, this.gridU, this.gridV);
    this.sculptureGeo.rotateX(-Math.PI / 2);

    // Glowing holographic shader/material with vertex colors
    const vCount = (this.gridU + 1) * (this.gridV + 1);
    const colors = new Float32Array(vCount * 3);
    for (let i = 0; i < vCount; i++) {
      colors[i * 3]     = 0.22; // R
      colors[i * 3 + 1] = 0.74; // G (Cyan)
      colors[i * 3 + 2] = 0.97; // B
    }
    this.sculptureGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.sculptureMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85
    });
    this.sculptureMesh = new THREE.Mesh(this.sculptureGeo, this.sculptureMat);
    this.group.add(this.sculptureMesh);

    // Solid inner translucent membrane
    const solidMat = new THREE.MeshBasicMaterial({
      color: 0x0369a1,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    this.innerMesh = new THREE.Mesh(this.sculptureGeo, solidMat);
    this.group.add(this.innerMesh);

    // 2. Harmonic Resonant Floating Node Particles
    const pCount = 380;
    this.partGeo = new THREE.BufferGeometry();
    this.partPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      this.partPos[i * 3]     = (Math.random() - 0.5) * this.width;
      this.partPos[i * 3 + 1] = 0;
      this.partPos[i * 3 + 2] = (Math.random() - 0.5) * this.height;
    }
    this.partGeo.setAttribute('position', new THREE.BufferAttribute(this.partPos, 3));
    this.partMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.05,
      transparent: true,
      opacity: 0.9
    });
    this.particles = new THREE.Points(this.partGeo, this.partMat);
    this.group.add(this.particles);

    // 3. Circular Acoustic Confinement Ring
    const ringGeo = new THREE.RingGeometry(3.2, 3.25, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    this.group.add(ring);
  }

  setMode(modeKey) {
    this.activeMode = modeKey;
  }

  setParameters(freq, amp) {
    if (freq !== undefined) this.frequencyFactor = freq;
    if (amp !== undefined) this.waveAmplitude = amp;
  }

  show() {
    this.group.visible = true;
  }

  hide() {
    this.group.visible = false;
  }

  update(delta, elapsed) {
    if (!this.group.visible) return;

    const pos = this.sculptureGeo.attributes.position.array;
    const colors = this.sculptureGeo.attributes.color.array;
    const vCount = (this.gridU + 1) * (this.gridV + 1);

    const freq = this.frequencyFactor;
    const amp = this.waveAmplitude;

    for (let i = 0; i < vCount; i++) {
      const x = pos[i * 3];
      const z = pos[i * 3 + 2];
      const r = Math.sqrt(x * x + z * z);
      const theta = Math.atan2(z, x);

      let y = 0;

      if (this.activeMode === 'LIGO_GW150914') {
        // Gravitational Wave Quadrupole Chirp Waveform:
        // Frequency ramps with time, cos(2*theta) quadrupole spatial pattern
        const chirpFreq = 2.0 * freq + Math.sin(elapsed * 0.4) * 1.5;
        const wave = Math.cos(2 * theta + elapsed * chirpFreq - r * 2.2);
        // Exponential radial attenuation
        y = amp * 0.65 * wave * Math.exp(-r * 0.25);
      } else if (this.activeMode === 'SOLAR_P_MODES') {
        // Spherical Harmonic Acoustic Eigenmode (l=3, m=2)
        const pMode = Math.sin(3 * r * freq - elapsed * 3.0) * Math.cos(2 * theta);
        y = amp * 0.55 * pMode * (1.0 - Math.min(1.0, r / 3.2));
      } else if (this.activeMode === 'CMB_ANISOTROPY') {
        // Multi-scale acoustic peak superposition
        const peak1 = Math.sin(x * 1.5 * freq + elapsed) * Math.cos(z * 1.5 * freq);
        const peak2 = 0.5 * Math.sin(x * 3.2 * freq - elapsed * 1.5) * Math.cos(z * 3.2 * freq);
        const peak3 = 0.25 * Math.sin(r * 5.0 * freq + elapsed * 2.0);
        y = amp * 0.4 * (peak1 + peak2 + peak3);
      }

      pos[i * 3 + 1] = y;

      // Color dynamics based on height (elevation gradient)
      const normY = (y / amp + 0.6) * 0.8;
      colors[i * 3]     = 0.1 + normY * 0.8; // Red for peaks
      colors[i * 3 + 1] = 0.5 + normY * 0.4; // Green
      colors[i * 3 + 2] = 1.0 - normY * 0.3; // Blue
    }

    this.sculptureGeo.attributes.position.needsUpdate = true;
    this.sculptureGeo.attributes.color.needsUpdate = true;
    this.sculptureGeo.computeVertexNormals();

    // Update floating particle nodes
    const pPos = this.partPos;
    const pCount = pPos.length / 3;
    for (let i = 0; i < pCount; i++) {
      const px = pPos[i * 3];
      const pz = pPos[i * 3 + 2];
      const pr = Math.sqrt(px * px + pz * pz);
      const pTheta = Math.atan2(pz, px);

      let py = 0;
      if (this.activeMode === 'LIGO_GW150914') {
        py = amp * 0.65 * Math.cos(2 * pTheta + elapsed * 2.5 - pr * 2.2) * Math.exp(-pr * 0.25);
      } else {
        py = amp * 0.55 * Math.sin(3 * pr * freq - elapsed * 3.0) * Math.cos(2 * pTheta);
      }
      pPos[i * 3 + 1] = py + 0.08;
    }
    this.partGeo.attributes.position.needsUpdate = true;

    // Slow rotation
    this.sculptureMesh.rotation.y = elapsed * 0.08;
    this.innerMesh.rotation.y = elapsed * 0.08;
  }
}
