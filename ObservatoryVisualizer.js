/**
 * ObservatoryVisualizer.js — Three.js 3D Scientific Visualization System
 * 
 * Extends the core Three.js scene architecture for the Phase 7 Cosmic Observatory:
 *   - Target Acquisition 3D Reticle with collimation rings and locking reticle
 *   - Case 1: 3D Exoplanet Transit & Stellar Occlusion Geometry
 *   - Case 2: 3D Stellar Dispersion & Spectral Emission Fan
 *   - Case 3: 3D Sagittarius A* Event Horizon & S2 Keplerian Ellipse
 *   - Case 4: 3D Cosmic Lookback Time Shells & Light Waves
 *   - Case 5: 3D Deep Space Network Two-Way Microwave Ranging Beam
 */

import * as THREE from 'three';

export class ObservatoryVisualizer {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   */
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.group.name = 'ObservatoryVisualizerGroup';
    this.group.visible = false;
    this.scene.add(this.group);

    this.activeCaseId = 'CASE_01_EXOPLANET';
    this.activeStep = 1;
    this.activeWavelength = 'VISIBLE';
    this.transitProgress = 0; // 0 to 1 for scrubbable transit

    // Build sub-systems
    this._initReticle();
    this._initCase01Exoplanet();
    this._initCase02Spectrum();
    this._initCase03BlackHole();
    this._initCase04LookbackTime();
    this._initCase05Navigation();
  }

  /* -----------------------------------------------------------------
     Target Acquisition Reticle
     ----------------------------------------------------------------- */
  _initReticle() {
    this.reticleGroup = new THREE.Group();
    this.reticleGroup.name = 'ObservatoryReticle';

    // Outer collimation ring
    const ringGeo1 = new THREE.RingGeometry(2.8, 2.84, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    this.reticleRing1 = new THREE.Mesh(ringGeo1, ringMat1);
    this.reticleGroup.add(this.reticleRing1);

    // Inner dashed ring
    const ringGeo2 = new THREE.RingGeometry(1.6, 1.63, 48);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x4a9eff,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    this.reticleRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    this.reticleGroup.add(this.reticleRing2);

    // Crosshairs
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4
    });

    const crosshairGeo = new THREE.BufferGeometry();
    const points = [
      // Left tick
      new THREE.Vector3(-3.4, 0, 0), new THREE.Vector3(-2.0, 0, 0),
      // Right tick
      new THREE.Vector3(2.0, 0, 0), new THREE.Vector3(3.4, 0, 0),
      // Top tick
      new THREE.Vector3(0, 2.0, 0), new THREE.Vector3(0, 3.4, 0),
      // Bottom tick
      new THREE.Vector3(0, -3.4, 0), new THREE.Vector3(0, -2.0, 0)
    ];
    crosshairGeo.setFromPoints(points);
    this.reticleCrosshairs = new THREE.LineSegments(crosshairGeo, lineMat);
    this.reticleGroup.add(this.reticleCrosshairs);

    this.group.add(this.reticleGroup);
  }

  /* -----------------------------------------------------------------
     CASE 01: Exoplanet Transit Geometry
     ----------------------------------------------------------------- */
  _initCase01Exoplanet() {
    this.case01Group = new THREE.Group();
    this.case01Group.name = 'Case01_Exoplanet';

    // Host star (M-dwarf Kepler-186)
    const starGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const starMat = new THREE.MeshBasicMaterial({
      color: 0xff7b42,
      wireframe: false
    });
    this.exoplanetStar = new THREE.Mesh(starGeo, starMat);
    this.case01Group.add(this.exoplanetStar);

    // Corona glow halo
    const glowGeo = new THREE.SphereGeometry(1.4, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffaa66,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide
    });
    this.exoplanetStarGlow = new THREE.Mesh(glowGeo, glowMat);
    this.case01Group.add(this.exoplanetStarGlow);

    // Planet sphere (Kepler-186f)
    const planetGeo = new THREE.SphereGeometry(0.22, 24, 24);
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0x111625,
      roughness: 0.9,
      metalness: 0.1
    });
    this.exoplanetBody = new THREE.Mesh(planetGeo, planetMat);
    this.case01Group.add(this.exoplanetBody);

    // Orbit ellipse path
    const curve = new THREE.EllipseCurve(0, 0, 2.6, 2.6, 0, 2 * Math.PI, false, 0);
    const pathPoints = curve.getPoints(64).map(p => new THREE.Vector3(p.x, 0, p.y));
    const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPoints);
    const pathMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25
    });
    this.exoplanetOrbitLine = new THREE.Line(pathGeo, pathMat);
    this.exoplanetOrbitLine.rotation.x = Math.PI * 0.44; // Tilted nearly edge-on for transit!
    this.case01Group.add(this.exoplanetOrbitLine);

    // Sightline occlusion cylinder (educational visualization)
    const coneGeo = new THREE.CylinderGeometry(0.24, 0.45, 4.0, 16, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide
    });
    this.transitShadowCone = new THREE.Mesh(coneGeo, coneMat);
    this.transitShadowCone.rotation.x = Math.PI * 0.5;
    this.transitShadowCone.position.set(0, 0, 2.0);
    this.case01Group.add(this.transitShadowCone);

    this.group.add(this.case01Group);
  }

  /* -----------------------------------------------------------------
     CASE 02: Stellar Spectrum & Dispersion
     ----------------------------------------------------------------- */
  _initCase02Spectrum() {
    this.case02Group = new THREE.Group();
    this.case02Group.name = 'Case02_Spectrum';
    this.case02Group.visible = false;

    // Star sphere
    const starGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.spectrumStar = new THREE.Mesh(starGeo, starMat);
    this.spectrumStar.position.set(-2.0, 0, 0);
    this.case02Group.add(this.spectrumStar);

    // Dispersion prism / spectrograph slit
    const prismGeo = new THREE.ConeGeometry(0.6, 1.2, 3);
    const prismMat = new THREE.MeshStandardMaterial({
      color: 0x88c0d0,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1
    });
    this.spectrumPrism = new THREE.Mesh(prismGeo, prismMat);
    this.spectrumPrism.position.set(-0.2, 0, 0);
    this.spectrumPrism.rotation.z = Math.PI * 0.5;
    this.case02Group.add(this.spectrumPrism);

    // Dispersed color beam fan
    const beamColors = [0x7c3aed, 0x3b82f6, 0x10b981, 0xfbbf24, 0xef4444];
    this.spectrumBeams = [];
    beamColors.forEach((col, i) => {
      const yOffset = (i - 2) * 0.35;
      const pts = [
        new THREE.Vector3(-0.2, 0, 0),
        new THREE.Vector3(2.5, yOffset, 0)
      ];
      const beamGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const beamMat = new THREE.LineBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.75,
        linewidth: 2
      });
      const line = new THREE.Line(beamGeo, beamMat);
      this.case02Group.add(line);
      this.spectrumBeams.push(line);
    });

    this.group.add(this.case02Group);
  }

  /* -----------------------------------------------------------------
     CASE 03: Black Hole Sgr A* & S2 Orbit
     ----------------------------------------------------------------- */
  _initCase03BlackHole() {
    this.case03Group = new THREE.Group();
    this.case03Group.name = 'Case03_BlackHole';
    this.case03Group.visible = false;

    // Central Event Horizon (pure black void)
    const bhGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.bhMesh = new THREE.Mesh(bhGeo, bhMat);
    this.case03Group.add(this.bhMesh);

    // Glowing Accretion / Photon Ring (synchrotron orange-amber)
    const ringGeo = new THREE.RingGeometry(0.74, 1.25, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });
    this.bhPhotonRing = new THREE.Mesh(ringGeo, ringMat);
    this.bhPhotonRing.rotation.x = Math.PI * 0.35;
    this.case03Group.add(this.bhPhotonRing);

    // S2 Highly Eccentric Elliptical Orbit (e = 0.88)
    const a = 2.4; // Semi-major axis
    const b = a * Math.sqrt(1 - 0.88 * 0.88); // Semi-minor axis ~ 1.14
    const focalOffset = 0.88 * a; // ~ 2.11

    const orbitPts = [];
    for (let theta = 0; theta <= Math.PI * 2; theta += 0.05) {
      const x = a * Math.cos(theta) - focalOffset;
      const y = b * Math.sin(theta);
      orbitPts.push(new THREE.Vector3(x, 0, y));
    }
    const s2OrbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
    const s2OrbitMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4
    });
    this.s2OrbitLine = new THREE.Line(s2OrbitGeo, s2OrbitMat);
    this.s2OrbitLine.rotation.z = 0.25;
    this.case03Group.add(this.s2OrbitLine);

    // S2 Star tracer
    const s2Geo = new THREE.SphereGeometry(0.12, 16, 16);
    const s2Mat = new THREE.MeshBasicMaterial({ color: 0x93c5fd });
    this.s2Star = new THREE.Mesh(s2Geo, s2Mat);
    this.case03Group.add(this.s2Star);

    this.group.add(this.case03Group);
  }

  /* -----------------------------------------------------------------
     CASE 04: Lookback Time Horizon Shells
     ----------------------------------------------------------------- */
  _initCase04LookbackTime() {
    this.case04Group = new THREE.Group();
    this.case04Group.name = 'Case04_LookbackTime';
    this.case04Group.visible = false;

    // Earth at center
    const earthCenterGeo = new THREE.SphereGeometry(0.3, 24, 24);
    const earthCenterMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    this.lookbackEarth = new THREE.Mesh(earthCenterGeo, earthCenterMat);
    this.case04Group.add(this.lookbackEarth);

    // Concentric time horizon wireframe rings
    this.timeShells = [];
    const radii = [0.8, 1.5, 2.3, 3.2];
    const shellColors = [0x38bdf8, 0x10b981, 0xf59e0b, 0xef4444];

    radii.forEach((r, idx) => {
      const ringGeo = new THREE.RingGeometry(r - 0.015, r + 0.015, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: shellColors[idx],
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI * 0.5;
      this.case04Group.add(ringMesh);
      this.timeShells.push(ringMesh);
    });

    this.group.add(this.case04Group);
  }

  /* -----------------------------------------------------------------
     CASE 05: Spacecraft Navigation Two-Way Radio Link
     ----------------------------------------------------------------- */
  _initCase05Navigation() {
    this.case05Group = new THREE.Group();
    this.case05Group.name = 'Case05_Navigation';
    this.case05Group.visible = false;

    // Earth DSN Station node
    const earthGeo = new THREE.SphereGeometry(0.4, 24, 24);
    const earthMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    this.navEarth = new THREE.Mesh(earthGeo, earthMat);
    this.navEarth.position.set(-2.5, 0, 0);
    this.case05Group.add(this.navEarth);

    // Spacecraft node (Voyager / Rover cruise stage)
    const probeGeo = new THREE.OctahedronGeometry(0.2, 0);
    const probeMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    this.navProbe = new THREE.Mesh(probeGeo, probeMat);
    this.navProbe.position.set(2.5, 0, 0);
    this.case05Group.add(this.navProbe);

    // Two-way microwave carrier baseline
    const linkPts = [
      new THREE.Vector3(-2.5, 0, 0),
      new THREE.Vector3(2.5, 0, 0)
    ];
    const linkGeo = new THREE.BufferGeometry().setFromPoints(linkPts);
    const linkMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 0.15,
      gapSize: 0.1,
      transparent: true,
      opacity: 0.45
    });
    this.navLink = new THREE.Line(linkGeo, linkMat);
    this.navLink.computeLineDistances();
    this.case05Group.add(this.navLink);

    // Traveling packet wave
    const packetGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    this.navPacket = new THREE.Mesh(packetGeo, packetMat);
    this.case05Group.add(this.navPacket);

    this.group.add(this.case05Group);
  }

  /* -----------------------------------------------------------------
     Case Switching
     ----------------------------------------------------------------- */
  setCase(caseId, stepNumber = 1) {
    this.activeCaseId = caseId;
    this.activeStep = stepNumber;

    this.case01Group.visible = (caseId === 'CASE_01_EXOPLANET');
    this.case02Group.visible = (caseId === 'CASE_02_STELLAR_SPECTRUM');
    this.case03Group.visible = (caseId === 'CASE_03_BLACK_HOLE');
    this.case04Group.visible = (caseId === 'CASE_04_LOOKBACK_TIME');
    this.case05Group.visible = (caseId === 'CASE_05_NAVIGATION');
  }

  setWavelength(bandId) {
    this.activeWavelength = bandId;
    // Adapt reticle color
    let col = 0x38bdf8;
    if (bandId === 'INFRARED') col = 0xf97316;
    else if (bandId === 'RADIO') col = 0xa855f7;
    else if (bandId === 'X_RAY') col = 0x34d399;
    else if (bandId === 'ULTRAVIOLET') col = 0x818cf8;

    this.reticleRing1.material.color.setHex(col);
    this.reticleRing2.material.color.setHex(col);
  }

  show() {
    this.group.visible = true;
  }

  hide() {
    this.group.visible = false;
  }

  /* -----------------------------------------------------------------
     Per-frame Animation Update
     ----------------------------------------------------------------- */
  update(delta, elapsed) {
    if (!this.group.visible) return;

    // Reticle slow rotation
    if (this.reticleRing1) this.reticleRing1.rotation.z += delta * 0.15;
    if (this.reticleRing2) this.reticleRing2.rotation.z -= delta * 0.25;

    // Keep reticle oriented toward camera at fixed distance
    if (this.camera) {
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
      const targetPos = this.camera.position.clone().add(forward.multiplyScalar(6.5));
      this.group.position.copy(targetPos);
      this.group.quaternion.copy(this.camera.quaternion);
    }

    // Case 1: Exoplanet orbital transit motion
    if (this.case01Group.visible) {
      const transitSpeed = 0.5;
      const angle = (elapsed * transitSpeed) % (Math.PI * 2);
      const orbitRadius = 2.6;
      // Orbit in tilted plane
      const localX = Math.cos(angle) * orbitRadius;
      const localZ = Math.sin(angle) * orbitRadius;
      const tilt = Math.PI * 0.44;
      this.exoplanetBody.position.set(
        localX,
        Math.sin(tilt) * localZ * 0.15,
        Math.cos(tilt) * localZ
      );
    }

    // Case 2: Spectrum pulse
    if (this.case02Group.visible) {
      this.spectrumStar.scale.setScalar(1.0 + Math.sin(elapsed * 2.0) * 0.03);
    }

    // Case 3: S2 Black Hole orbit
    if (this.case03Group.visible) {
      // Mean anomaly to approximate eccentric orbit
      const s2Angle = (elapsed * 0.8) % (Math.PI * 2);
      const a = 2.4;
      const b = 1.14;
      const f = 2.11;
      this.s2Star.position.set(
        a * Math.cos(s2Angle) - f,
        0,
        b * Math.sin(s2Angle)
      );
      this.bhPhotonRing.rotation.z += delta * 0.4;
    }

    // Case 4: Cosmic wave expansion
    if (this.case04Group.visible) {
      this.timeShells.forEach((shell, i) => {
        const pulse = 1.0 + Math.sin(elapsed * 1.5 + i) * 0.04;
        shell.scale.set(pulse, pulse, 1);
      });
    }

    // Case 5: Two-way DSN packet ping ping-pong
    if (this.case05Group.visible) {
      const t = (Math.sin(elapsed * 2.5) + 1) * 0.5; // 0 to 1
      const pingX = -2.5 + t * 5.0;
      this.navPacket.position.set(pingX, 0, 0);
    }
  }
}
