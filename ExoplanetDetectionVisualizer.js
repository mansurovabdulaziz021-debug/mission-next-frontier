/**
 * ExoplanetDetectionVisualizer.js — Interactive Transit Photometry & Doppler Wobble
 * 
 * Visualizes the astronomical transit method:
 *   - Host Star with limb darkening gradient
 *   - Orbiting Exoplanet with inclined transit chord across the stellar disk
 *   - Real-time animated Transit Light Curve chart (Flux dip: ΔF/F = (Rp/R★)²)
 *   - Radial Velocity Doppler color shift (blueshift / redshift stellar wobble)
 */

import * as THREE from 'three';

export class ExoplanetDetectionVisualizer {
  constructor(parentGroup) {
    this.group = new THREE.Group();
    this.group.name = 'ExoplanetDetectionGroup';
    this.group.visible = false;
    parentGroup.add(this.group);

    this.inclinationDeg = 89.2;
    this.planetRadiusRatio = 1.15; // R_Jup
    this.orbitRadius = 4.2;
    this.orbitPhase = 0.5; // 0 to 1
    this.autoRotate = true;

    this._buildScene();
  }

  _buildScene() {
    // 1. Host Star with limb-darkening shader
    const starGeo = new THREE.SphereGeometry(1.6, 32, 32);
    this.starMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.85,
      roughness: 0.3
    });
    this.starMesh = new THREE.Mesh(starGeo, this.starMat);
    this.group.add(this.starMesh);

    // Stellar corona glow
    const coronaGeo = new THREE.SphereGeometry(2.1, 24, 24);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide
    });
    this.coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    this.group.add(this.coronaMesh);

    // 2. Orbital Plane Group (Rotated by inclination)
    this.orbitGroup = new THREE.Group();
    this.group.add(this.orbitGroup);

    // Orbital Track Ellipse
    const orbPts = [];
    for (let i = 0; i <= 96; i++) {
      const th = (i / 96) * Math.PI * 2;
      orbPts.push(Math.cos(th) * this.orbitRadius, 0, Math.sin(th) * this.orbitRadius);
    }
    const orbGeo = new THREE.BufferGeometry();
    orbGeo.setAttribute('position', new THREE.Float32BufferAttribute(orbPts, 3));
    const orbMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 });
    this.orbitLine = new THREE.Line(orbGeo, orbMat);
    this.orbitGroup.add(this.orbitLine);

    // Exoplanet Sphere (Dark silhouette on dayside, nightside shadow)
    const planetGeo = new THREE.SphereGeometry(0.35, 24, 24);
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      metalness: 0.1
    });
    this.planetMesh = new THREE.Mesh(planetGeo, planetMat);
    this.orbitGroup.add(this.planetMesh);

    // Exoplanet Transit Shadow Projection Beam onto Stellar Disk
    const shadowGeo = new THREE.CylinderGeometry(0.35, 0.35, 3.5, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.18,
      wireframe: true
    });
    this.transitBeam = new THREE.Mesh(shadowGeo, shadowMat);
    this.transitBeam.rotation.x = Math.PI / 2;
    this.orbitGroup.add(this.transitBeam);

    // 3. 3D In-Scene Light Curve Display Stand
    this.curveGroup = new THREE.Group();
    this.curveGroup.position.set(0, -2.6, 0);

    // Baseline grid frame
    const frameGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-3.5, 0, 0),
      new THREE.Vector3(3.5, 0, 0)
    ]);
    const frameMat = new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.5 });
    this.curveGroup.add(new THREE.Line(frameGeo, frameMat));

    // Dynamic Light Curve Line
    this.curvePtsCount = 64;
    this.curveGeo = new THREE.BufferGeometry();
    const cPos = new Float32Array(this.curvePtsCount * 3);
    for (let i = 0; i < this.curvePtsCount; i++) {
      const x = -3.5 + (i / (this.curvePtsCount - 1)) * 7.0;
      cPos[i * 3] = x;
      cPos[i * 3 + 1] = 0;
      cPos[i * 3 + 2] = 0;
    }
    this.curveGeo.setAttribute('position', new THREE.BufferAttribute(cPos, 3));
    this.curveLine = new THREE.Line(this.curveGeo, new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 }));
    this.curveGroup.add(this.curveLine);

    // Current Time Marker on Light Curve
    const markerGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    this.curveMarker = new THREE.Mesh(markerGeo, markerMat);
    this.curveGroup.add(this.curveMarker);

    this.group.add(this.curveGroup);

    this._updateOrbitGeometry();
  }

  setParameters(inclination, radiusRatio) {
    if (inclination !== undefined) this.inclinationDeg = inclination;
    if (radiusRatio !== undefined) {
      this.planetRadiusRatio = radiusRatio;
      const s = 0.3 * (radiusRatio / 1.0);
      this.planetMesh.scale.set(s, s, s);
      this.transitBeam.scale.set(s, 1, s);
    }
    this._updateOrbitGeometry();
  }

  _updateOrbitGeometry() {
    // Tilt the orbit relative to line of sight (z-axis is viewer)
    const tilt = (90 - this.inclinationDeg) * (Math.PI / 180);
    this.orbitGroup.rotation.x = tilt;

    this._recomputeLightCurve();
  }

  _recomputeLightCurve() {
    const pos = this.curveGeo.attributes.position.array;
    const starR = 1.6;
    const planetR = 0.3 * (this.planetRadiusRatio / 1.0);
    const depth = Math.pow(planetR / starR, 2) * 2.2; // Exaggerated slightly for crisp visibility

    for (let i = 0; i < this.curvePtsCount; i++) {
      const phase = i / (this.curvePtsCount - 1); // 0 to 1, transit occurs at ~0.5
      const angle = (phase - 0.5) * Math.PI * 2;
      const xPlane = Math.cos(angle) * this.orbitRadius;
      const zPlane = Math.sin(angle) * this.orbitRadius;

      // In transit if in front of star (z > 0) and projected distance < starR
      let dip = 0;
      if (zPlane > 0 && Math.abs(xPlane) < starR) {
        // Limb darkening ingress/egress curve
        const d = Math.abs(xPlane) / starR;
        dip = depth * (1 - Math.pow(d, 2) * 0.4);
      }

      pos[i * 3 + 1] = -dip;
    }
    this.curveGeo.attributes.position.needsUpdate = true;
  }

  setPhase(phase) {
    this.orbitPhase = phase % 1.0;
    const angle = this.orbitPhase * Math.PI * 2;
    const x = Math.cos(angle) * this.orbitRadius;
    const z = Math.sin(angle) * this.orbitRadius;
    this.planetMesh.position.set(x, 0, z);
    this.transitBeam.position.set(x, 0, z * 0.5);

    // Update marker on light curve
    const markerX = -3.5 + this.orbitPhase * 7.0;
    const starR = 1.6;
    const planetR = 0.3 * (this.planetRadiusRatio / 1.0);
    const depth = Math.pow(planetR / starR, 2) * 2.2;
    let dip = 0;
    if (z > 0 && Math.abs(x) < starR) {
      const d = Math.abs(x) / starR;
      dip = depth * (1 - Math.pow(d, 2) * 0.4);
    }
    this.curveMarker.position.set(markerX, -dip, 0);

    // Doppler wobble color-shifting:
    // Star moves in opposite direction of planet (barycentric motion)
    // When planet is on left (moving away), star is on right (moving toward us -> blue shift)
    const vr = Math.sin(angle); // Radial velocity proxy
    if (vr > 0.1) {
      this.starMat.color.setHex(0xbbf7d0); // Subtle Doppler Blue-Shift
    } else if (vr < -0.1) {
      this.starMat.color.setHex(0xfecaca); // Subtle Doppler Red-Shift
    } else {
      this.starMat.color.setHex(0xfef08a); // Rest wavelength
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

    if (this.autoRotate) {
      this.orbitPhase = (this.orbitPhase + delta * 0.15) % 1.0;
      this.setPhase(this.orbitPhase);
    }

    // Stellar rotation
    this.starMesh.rotation.y += delta * 0.1;
    this.planetMesh.rotation.y += delta * 0.4;
  }
}
