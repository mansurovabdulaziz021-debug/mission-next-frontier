/**
 * SpaceWeatherVisualizer.js — Heliospheric Solar Wind & Planetary Shielding
 * 
 * Visualizes Solar-Terrestrial Physics:
 *   - The Sun (-5.0, 0, 0) emitting magnetized Parker spiral plasma
 *   - Earth (+3.8, 0, 0) with internal magnetic dipole field lines
 *   - Compressed dayside Bow Shock & Magnetopause boundary
 *   - Magnetotail plasma sheet stretching into deep space
 *   - Polar Auroral Ovals excited by magnetic reconnection and particle funneling
 */

import * as THREE from 'three';

export class SpaceWeatherVisualizer {
  constructor(parentGroup) {
    this.group = new THREE.Group();
    this.group.name = 'SpaceWeatherGroup';
    this.group.visible = false;
    parentGroup.add(this.group);

    this.activeStateKey = 'CORONAL_HOLE_FAST';
    this.windSpeedFactor = 1.0;
    this.bowShockOffset = 1.6;

    this._buildScene();
  }

  _buildScene() {
    // 1. Solar Source (Left)
    this.sunGroup = new THREE.Group();
    this.sunGroup.position.set(-5.0, 0, 0);

    const sunGeo = new THREE.SphereGeometry(1.2, 24, 24);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.sunGroup.add(this.sunMesh);

    const coronaGeo = new THREE.SphereGeometry(1.6, 16, 16);
    const coronaMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.35 });
    this.sunGroup.add(new THREE.Mesh(coronaGeo, coronaMat));

    this.group.add(this.sunGroup);

    // 2. Earth Target (Right)
    this.earthGroup = new THREE.Group();
    this.earthGroup.position.set(3.8, 0, 0);

    const earthGeo = new THREE.SphereGeometry(0.55, 24, 24);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      emissive: 0x0c2461,
      roughness: 0.6
    });
    this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.earthGroup.add(this.earthMesh);

    // Glowing Polar Auroral Ovals
    const auroraGeo = new THREE.RingGeometry(0.18, 0.28, 32);
    this.auroraMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });

    // North Auroral Ring
    this.northAurora = new THREE.Mesh(auroraGeo, this.auroraMat);
    this.northAurora.position.set(0, 0.52, 0);
    this.northAurora.rotation.x = Math.PI / 2;
    this.earthGroup.add(this.northAurora);

    // South Auroral Ring
    this.southAurora = new THREE.Mesh(auroraGeo, this.auroraMat);
    this.southAurora.position.set(0, -0.52, 0);
    this.southAurora.rotation.x = Math.PI / 2;
    this.earthGroup.add(this.southAurora);

    // 3. Earth Dipole Magnetic Field Lines (Closed loops & cusps)
    this.bFieldGroup = new THREE.Group();
    this._buildDipoleFieldLines();
    this.earthGroup.add(this.bFieldGroup);

    // 4. Dayside Bow Shock Parabolic Standoff Surface
    const shockPts = [];
    for (let i = -24; i <= 24; i++) {
      const y = (i / 24) * 2.8;
      // Parabolic bow shock curve: x = -standoff + 0.35 * y²
      const x = -this.bowShockOffset + 0.22 * (y * y);
      shockPts.push(new THREE.Vector3(x, y, 0));
    }
    const shockGeo = new THREE.BufferGeometry().setFromPoints(shockPts);
    this.shockMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 3,
      transparent: true,
      opacity: 0.8
    });
    this.bowShockLine = new THREE.Line(shockGeo, this.shockMat);
    this.earthGroup.add(this.bowShockLine);

    this.group.add(this.earthGroup);

    // 5. Parker Spiral Solar Wind Particle Flow (Protons & Electrons)
    this.particleCount = 550;
    this.windGeo = new THREE.BufferGeometry();
    this.windPos = new Float32Array(this.particleCount * 3);
    this.windData = [];

    for (let i = 0; i < this.particleCount; i++) {
      this.windPos[i * 3]     = -5.0 + Math.random() * 9.5;
      this.windPos[i * 3 + 1] = (Math.random() - 0.5) * 4.2;
      this.windPos[i * 3 + 2] = (Math.random() - 0.5) * 3.0;

      this.windData.push({
        speed: 2.2 + Math.random() * 1.5,
        yInit: this.windPos[i * 3 + 1],
        zInit: this.windPos[i * 3 + 2]
      });
    }
    this.windGeo.setAttribute('position', new THREE.BufferAttribute(this.windPos, 3));
    this.windMat = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 0.045,
      transparent: true,
      opacity: 0.75
    });
    this.windPoints = new THREE.Points(this.windGeo, this.windMat);
    this.group.add(this.windPoints);
  }

  _buildDipoleFieldLines() {
    const loopCount = 6;
    for (let i = 0; i < loopCount; i++) {
      const angle = (i / loopCount) * Math.PI * 2;
      const pts = [];
      const steps = 36;
      for (let s = 0; s <= steps; s++) {
        const t = (s / steps) * Math.PI; // 0 to PI
        const r = 0.55 + 1.2 * Math.sin(t);
        const y = Math.cos(t) * r * 1.2;
        const radH = Math.sin(t) * r;
        const x = Math.cos(angle) * radH;
        const z = Math.sin(angle) * radH;
        pts.push(new THREE.Vector3(x, y, z));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.4
      });
      this.bFieldGroup.add(new THREE.Line(geo, mat));
    }
  }

  setState(stateKey) {
    this.activeStateKey = stateKey;

    switch (stateKey) {
      case 'QUIET_SLOW':
        this.windSpeedFactor = 0.6;
        this.bowShockOffset = 1.9;
        this.windMat.color.setHex(0xfef08a); // Pale Yellow
        this.auroraMat.color.setHex(0x34d399); // Gentle Green
        this.northAurora.scale.set(1.0, 1.0, 1.0);
        this.southAurora.scale.set(1.0, 1.0, 1.0);
        break;
      case 'CORONAL_HOLE_FAST':
        this.windSpeedFactor = 1.2;
        this.bowShockOffset = 1.5;
        this.windMat.color.setHex(0xfacc15); // Vibrant Yellow
        this.auroraMat.color.setHex(0x10b981); // Bright Emerald
        this.northAurora.scale.set(1.3, 1.3, 1.3);
        this.southAurora.scale.set(1.3, 1.3, 1.3);
        break;
      case 'SEVERE_CME':
        this.windSpeedFactor = 2.4;
        this.bowShockOffset = 0.95; // Compressed near GEO ring
        this.windMat.color.setHex(0xf97316); // Fiery CME Orange
        this.auroraMat.color.setHex(0xef4444); // Severe Red Storm Aurora
        this.northAurora.scale.set(1.8, 1.8, 1.8);
        this.southAurora.scale.set(1.8, 1.8, 1.8);
        break;
      default:
        this.windSpeedFactor = 1.0;
    }

    this._updateBowShockCurve();
  }

  _updateBowShockCurve() {
    const pts = [];
    for (let i = -24; i <= 24; i++) {
      const y = (i / 24) * 2.8;
      const x = -this.bowShockOffset + 0.22 * (y * y);
      pts.push(new THREE.Vector3(x, y, 0));
    }
    this.bowShockLine.geometry.setFromPoints(pts);
  }

  show() {
    this.group.visible = true;
  }

  hide() {
    this.group.visible = false;
  }

  update(delta, elapsed) {
    if (!this.group.visible) return;

    // Rotate Earth
    this.earthMesh.rotation.y += delta * 0.2;

    // Pulse auroral ovals
    const aGlow = 0.6 + Math.sin(elapsed * 4.0) * 0.25;
    this.auroraMat.opacity = aGlow;

    // Stream solar wind particles along x-axis towards Earth
    const pos = this.windPos;
    const earthX = 3.8;
    const shockX = earthX - this.bowShockOffset;

    for (let i = 0; i < this.particleCount; i++) {
      const d = this.windData[i];
      let x = pos[i * 3] + d.speed * this.windSpeedFactor * delta;

      // Deflection around magnetosphere when reaching bow shock
      let y = pos[i * 3 + 1];
      let z = pos[i * 3 + 2];

      if (x > shockX - 0.2 && x < earthX + 2.0) {
        // Deflect outwards vertically and laterally
        const signY = y >= 0 ? 1 : -1;
        y += signY * delta * 2.5;
        const signZ = z >= 0 ? 1 : -1;
        z += signZ * delta * 1.5;
      }

      // Reset when exiting right edge
      if (x > 6.5) {
        x = -5.0 + Math.random() * 0.5;
        y = d.yInit;
        z = d.zInit;
      }

      pos[i * 3]     = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    this.windGeo.attributes.position.needsUpdate = true;
  }
}
