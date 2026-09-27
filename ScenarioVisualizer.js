/**
 * ScenarioVisualizer — Three.js Spatial Visualization Layer for Phase 4 Scenarios
 * MISSION // NEXT FRONTIER
 *
 * Implements real-time spatial representations for:
 * 1. Communication Delay: Laser/RF electromagnetic carrier waveguides & photon pulses
 * 2. Gravity Experience: Gravitational potential wells & ballistic freefall jump arcs
 * 3. Travel Trajectory: Heliocentric Hohmann transfer orbital arcs & velocity burn vectors
 * 4. Solar Environment: Dynamic solar wind waves & Earth magnetospheric bow shock deflection
 */

import * as THREE from 'three';

export class ScenarioVisualizer {
  /**
   * @param {THREE.Scene} scene
   * @param {import('./CelestialBodies.js').CelestialBodies} celestialBodies
   * @param {import('./Earth.js').Earth} earth
   * @param {THREE.Vector3} sunPosition
   */
  constructor(scene, celestialBodies, earth, sunPosition) {
    this.scene = scene;
    this.celestialBodies = celestialBodies;
    this.earth = earth;
    this.sunPosition = sunPosition || new THREE.Vector3(-14.0, 2.0, 7.5);

    this.group = new THREE.Group();
    this.group.name = 'SCENARIO_VISUALIZER_GROUP';
    this.scene.add(this.group);

    this.activeScenario = null;
    this.scenarioResult = null;
    this._elapsed = 0;

    // Sub-groups for distinct scenario visualizations
    this.commGroup = new THREE.Group();
    this.gravityGroup = new THREE.Group();
    this.orbitGroup = new THREE.Group();
    this.solarGroup = new THREE.Group();

    this.group.add(this.commGroup);
    this.group.add(this.gravityGroup);
    this.group.add(this.orbitGroup);
    this.group.add(this.solarGroup);

    this._buildCommunicationElements();
    this._buildGravityElements();
    this._buildOrbitElements();
    this._buildSolarElements();

    this.hide();
  }

  /* -----------------------------------------------------------------
     1. Communication Delay Elements
     ----------------------------------------------------------------- */
  _buildCommunicationElements() {
    // Laser carrier beam line
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 0, 0)
    ]);
    this.commLineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    this.commLine = new THREE.Line(lineGeo, this.commLineMat);
    this.commGroup.add(this.commLine);

    // Traveling photon pulses (particle array along beam)
    const pulseCount = 16;
    const pulseGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(pulseCount * 3);
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.pulseMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.22,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    this.pulsePoints = new THREE.Points(pulseGeo, this.pulseMat);
    this.commGroup.add(this.pulsePoints);
  }

  /* -----------------------------------------------------------------
     2. Gravity Potential Well & Ballistic Jump Elements
     ----------------------------------------------------------------- */
  _buildGravityElements() {
    // Gravitational potential well grid under target body
    const gridGeo = new THREE.RingGeometry(0.2, 1.8, 32, 6);
    this.gravityWellMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    this.gravityWell = new THREE.Mesh(gridGeo, this.gravityWellMat);
    this.gravityWell.rotation.x = Math.PI / 2;
    this.gravityGroup.add(this.gravityWell);

    // Ballistic vertical jump trajectory arc
    const curvePoints = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const x = (t - 0.5) * 0.8;
      const y = 4 * 1.5 * t * (1 - t); // Parabolic trajectory
      curvePoints.push(new THREE.Vector3(x, y, 0));
    }
    const jumpGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    this.jumpLineMat = new THREE.LineBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    this.jumpLine = new THREE.Line(jumpGeo, this.jumpLineMat);
    this.gravityGroup.add(this.jumpLine);

    // Jumping astronaut beacon marker
    const beaconGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: false
    });
    this.jumpBeacon = new THREE.Mesh(beaconGeo, beaconMat);
    this.gravityGroup.add(this.jumpBeacon);
  }

  /* -----------------------------------------------------------------
     3. Interplanetary Orbital Transfer Arc
     ----------------------------------------------------------------- */
  _buildOrbitElements() {
    // Hohmann transfer ellipse from Earth orbit (R=6.5) to Mars orbit (R=11.5)
    const pts = [];
    const a = (6.5 + 11.5) / 2;
    const c = a - 6.5;
    for (let i = 0; i <= 60; i++) {
      const angle = (i / 60) * Math.PI; // Half ellipse
      const r = a * (1 - (c / a) ** 2) / (1 + (c / a) * Math.cos(angle));
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      pts.push(new THREE.Vector3(x, 0, z));
    }
    const hohmannGeo = new THREE.BufferGeometry().setFromPoints(pts);
    this.hohmannMat = new THREE.LineDashedMaterial({
      color: 0x34d399,
      dashSize: 0.4,
      gapSize: 0.2,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    this.hohmannLine = new THREE.Line(hohmannGeo, this.hohmannMat);
    this.hohmannLine.computeLineDistances();
    this.orbitGroup.add(this.hohmannLine);

    // Transfer Spacecraft Probe
    const probeGeo = new THREE.ConeGeometry(0.12, 0.32, 8);
    probeGeo.rotateX(Math.PI / 2);
    const probeMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    this.probeMesh = new THREE.Mesh(probeGeo, probeMat);
    this.orbitGroup.add(this.probeMesh);
  }

  /* -----------------------------------------------------------------
     4. Solar Wind Wave & Earth Magnetospheric Bow Shock
     ----------------------------------------------------------------- */
  _buildSolarElements() {
    // Dynamic solar wind expanding wavefront rings
    this.solarRings = [];
    for (let i = 0; i < 4; i++) {
      const ringGeo = new THREE.RingGeometry(2.0, 2.15, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.copy(this.sunPosition);
      this.solarGroup.add(ring);
      this.solarRings.push(ring);
    }

    // Earth Magnetospheric Bow Shock (parabolic shield facing Sun)
    const bowPts = [];
    for (let i = -20; i <= 20; i++) {
      const y = (i / 20) * 1.6;
      const x = -0.65 + (y * y) * 0.4;
      bowPts.push(new THREE.Vector3(x, 0, y));
    }
    const bowGeo = new THREE.BufferGeometry().setFromPoints(bowPts);
    this.bowMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    this.bowShock = new THREE.Line(bowGeo, this.bowMat);
    this.solarGroup.add(this.bowShock);
  }

  /* -----------------------------------------------------------------
     Public API
     ----------------------------------------------------------------- */
  show() {
    this.group.visible = true;
  }

  hide() {
    this.group.visible = false;
    this.commGroup.visible = false;
    this.gravityGroup.visible = false;
    this.orbitGroup.visible = false;
    this.solarGroup.visible = false;
  }

  /**
   * Sets active scenario and computes visual updates
   * @param {string} scenarioId
   * @param {Record<string, any>} result
   */
  setScenario(scenarioId, result) {
    this.activeScenario = scenarioId;
    this.scenarioResult = result;
    this.show();

    // Toggle scenario-specific sub-groups
    this.commGroup.visible    = (scenarioId === 'COMMUNICATION_DELAY');
    this.gravityGroup.visible = (scenarioId === 'GRAVITY_EXPERIENCE');
    this.orbitGroup.visible   = (scenarioId === 'TRAVEL_TRAJECTORY');
    this.solarGroup.visible   = (scenarioId === 'SOLAR_ENVIRONMENT');

    if (scenarioId === 'COMMUNICATION_DELAY') {
      const isOptical = result.carrier?.id === 'OPTICAL_LASER';
      this.commLineMat.color.setHex(isOptical ? 0x22c55e : 0x38bdf8);
      this.pulseMat.color.setHex(isOptical ? 0x22c55e : 0x38bdf8);
    } else if (scenarioId === 'GRAVITY_EXPERIENCE') {
      const color = result.target?.color ? parseInt(result.target.color.replace('#', '0x')) : 0x38bdf8;
      this.gravityWellMat.color.setHex(color);
      this.jumpLineMat.color.setHex(color);
      this.jumpBeacon.material.color.setHex(color);
    } else if (scenarioId === 'SOLAR_ENVIRONMENT') {
      const isCme = result.weather?.id === 'CORONAL_MASS_EJECTION';
      const ringColor = isCme ? 0xef4444 : 0xf59e0b;
      this.solarRings.forEach(r => r.material.color.setHex(ringColor));
    }
  }

  /* -----------------------------------------------------------------
     Per-Frame Update Loop
     ----------------------------------------------------------------- */
  update(delta, elapsed) {
    if (!this.group.visible) return;
    this._elapsed = elapsed;

    // 1. Update Communication Delay
    if (this.commGroup.visible && this.scenarioResult) {
      const earthPos = new THREE.Vector3();
      this.earth.group.getWorldPosition(earthPos);

      const targetPos = this.celestialBodies.getTargetPosition(this.scenarioResult.destKey || 'MARS');

      // Update line endpoints
      const linePos = this.commLine.geometry.attributes.position;
      linePos.setXYZ(0, earthPos.x, earthPos.y, earthPos.z);
      linePos.setXYZ(1, targetPos.x, targetPos.y, targetPos.z);
      linePos.needsUpdate = true;

      // Update pulses traveling along vector
      const pulseAttr = this.pulsePoints.geometry.attributes.position;
      const pulseCount = pulseAttr.count;
      for (let i = 0; i < pulseCount; i++) {
        const offset = (i / pulseCount + elapsed * 0.8) % 1.0;
        const px = THREE.MathUtils.lerp(earthPos.x, targetPos.x, offset);
        const py = THREE.MathUtils.lerp(earthPos.y, targetPos.y, offset);
        const pz = THREE.MathUtils.lerp(earthPos.z, targetPos.z, offset);
        pulseAttr.setXYZ(i, px, py, pz);
      }
      pulseAttr.needsUpdate = true;
    }

    // 2. Update Gravity Jump Simulation
    if (this.gravityGroup.visible && this.scenarioResult) {
      const targetPos = this.celestialBodies.getTargetPosition(this.scenarioResult.destKey || 'MARS');
      if (this.scenarioResult.destKey === 'EARTH') {
        this.earth.group.getWorldPosition(targetPos);
      }

      this.gravityWell.position.set(targetPos.x, targetPos.y - 0.6, targetPos.z);

      // Scale jump height by derived scenario jump height
      const hScale = Math.min(Math.max((this.scenarioResult.jumpHeightM || 0.45) * 0.45, 0.2), 2.5);
      this.jumpLine.position.set(targetPos.x + 1.0, targetPos.y - 0.2, targetPos.z);
      this.jumpLine.scale.set(1.0, hScale, 1.0);

      // Parabolic beacon jump
      const cycle = (elapsed * 1.5) % 1.0;
      const beaconY = 4 * hScale * cycle * (1 - cycle);
      this.jumpBeacon.position.set(targetPos.x + 1.0 + (cycle - 0.5) * 0.8, targetPos.y - 0.2 + beaconY, targetPos.z);
    }

    // 3. Update Hohmann Transfer Arc & Spacecraft
    if (this.orbitGroup.visible) {
      const t = (elapsed * 0.08) % 1.0;
      const a = (6.5 + 11.5) / 2;
      const c = a - 6.5;
      const angle = t * Math.PI;
      const r = a * (1 - (c / a) ** 2) / (1 + (c / a) * Math.cos(angle));
      const px = r * Math.cos(angle);
      const pz = r * Math.sin(angle);
      this.probeMesh.position.set(px, 0.1, pz);
      this.probeMesh.rotation.y = -angle + Math.PI / 2;
    }

    // 4. Update Solar Wind Waves
    if (this.solarGroup.visible) {
      this.solarRings.forEach((ring, idx) => {
        const ringT = (elapsed * 0.4 + idx * 0.25) % 1.0;
        const scale = 1.0 + ringT * 8.5;
        ring.scale.set(scale, scale, 1.0);
        ring.material.opacity = Math.max((1.0 - ringT) * 0.6, 0.05);
      });

      // Align Earth bow shock towards Sun
      const earthPos = new THREE.Vector3();
      this.earth.group.getWorldPosition(earthPos);
      this.bowShock.position.copy(earthPos);

      const sunDir = new THREE.Vector3().subVectors(this.sunPosition, earthPos).normalize();
      const angle = Math.atan2(sunDir.z, sunDir.x);
      this.bowShock.rotation.y = -angle;
    }
  }

  dispose() {
    this.commLine.geometry.dispose();
    this.commLineMat.dispose();
    this.pulsePoints.geometry.dispose();
    this.pulseMat.dispose();
    this.gravityWell.geometry.dispose();
    this.gravityWellMat.dispose();
    this.jumpLine.geometry.dispose();
    this.jumpLineMat.dispose();
    this.hohmannLine.geometry.dispose();
    this.hohmannMat.dispose();
    this.scene.remove(this.group);
  }
}
