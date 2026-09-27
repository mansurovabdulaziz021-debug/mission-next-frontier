import * as THREE from 'three';

/**
 * OrbitalElements — Renders informational orbital paths:
 * Heliocentric planetary tracks (Earth & Mars around Sun),
 * Geocentric lunar orbit and satellite trajectories (LEO/GEO),
 * and dynamic focus emphasis based on active destination.
 */
export class OrbitalElements {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Group} earthGroup
   * @param {THREE.Vector3} [sunPosition]
   */
  constructor(scene, earthGroup, sunPosition = new THREE.Vector3(-14.0, 2.0, 7.5)) {
    this.scene = scene;
    this.earthGroup = earthGroup;
    this.sunPosition = sunPosition;

    this.group = new THREE.Group();
    this.group.name = 'OrbitalElements';
    this.group.visible = false; // Revealed upon entering Mission Control

    this._satAngle = 0;
    this._pulseTime = 0;
    this._activeFocus = 'EARTH';

    this._buildEarthOrbits();
    this._buildMoonOrbit();
    this._buildHeliocentricOrbits();
    this._buildSatelliteBeacon();
    this._buildTransferArcs();

    this.scene.add(this.group);
  }

  /* -----------------------------------------------------------------
     Geocentric Orbits (GEO, LEO, Equator)
     ----------------------------------------------------------------- */
  _buildEarthOrbits() {
    this.earthOrbitsGroup = new THREE.Group();

    // 1. Geostationary Orbit (GEO) ring (radius ~ 1.85)
    const geoPoints = [];
    const segments = 128;
    const rGeo = 1.85;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      geoPoints.push(new THREE.Vector3(Math.cos(theta) * rGeo, 0, Math.sin(theta) * rGeo));
    }
    const geoGeometry = new THREE.BufferGeometry().setFromPoints(geoPoints);
    this.geoMat = new THREE.LineBasicMaterial({
      color: 0x4a9eff,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    this.geoLine = new THREE.Line(geoGeometry, this.geoMat);
    this.geoLine.rotation.x = 0.15;
    this.earthOrbitsGroup.add(this.geoLine);

    // 2. Low Earth Orbit (LEO) ring
    const leoPoints = [];
    const rLeo = 1.22;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      leoPoints.push(new THREE.Vector3(Math.cos(theta) * rLeo, 0, Math.sin(theta) * rLeo));
    }
    const leoGeometry = new THREE.BufferGeometry().setFromPoints(leoPoints);
    this.leoMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      dashSize: 0.08,
      gapSize: 0.05,
      blending: THREE.AdditiveBlending
    });
    this.leoLine = new THREE.Line(leoGeometry, this.leoMat);
    this.leoLine.computeLineDistances();
    this.leoLine.rotation.x = 0.85;
    this.leoLine.rotation.y = 0.4;
    this.earthOrbitsGroup.add(this.leoLine);

    this.group.add(this.earthOrbitsGroup);
  }

  /* -----------------------------------------------------------------
     Moon Orbit Around Earth
     ----------------------------------------------------------------- */
  _buildMoonOrbit() {
    const pts = [];
    const rX = 3.9;
    const rZ = 2.2;
    for (let i = 0; i <= 96; i++) {
      const t = (i / 96) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(t) * rX, Math.sin(t) * 0.4, Math.sin(t) * rZ));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    this.moonOrbitMat = new THREE.LineDashedMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.35,
      dashSize: 0.15,
      gapSize: 0.1,
      blending: THREE.AdditiveBlending
    });
    this.moonOrbitLine = new THREE.Line(geo, this.moonOrbitMat);
    this.moonOrbitLine.computeLineDistances();
    this.group.add(this.moonOrbitLine);
  }

  /* -----------------------------------------------------------------
     Heliocentric Orbits (Planets Around Sun in Visualization Space)
     ----------------------------------------------------------------- */
  _buildHeliocentricOrbits() {
    this.helioGroup = new THREE.Group();

    // Earth's heliocentric orbit arc
    const curveEarth = new THREE.EllipseCurve(
      this.sunPosition.x, this.sunPosition.z, // ax, aY
      14.5, 14.5,                            // xRadius, yRadius
      -0.7, 0.4,                             // aStartAngle, aEndAngle
      false,                                 // aClockwise
      0                                      // aRotation
    );
    const earthOrbitPts = curveEarth.getPoints(80).map(p => new THREE.Vector3(p.x, 0, p.y));
    const earthOrbitGeo = new THREE.BufferGeometry().setFromPoints(earthOrbitPts);
    this.earthHelioMat = new THREE.LineDashedMaterial({
      color: 0x4a9eff,
      transparent: true,
      opacity: 0.25,
      dashSize: 0.3,
      gapSize: 0.2,
      blending: THREE.AdditiveBlending
    });
    this.earthHelioLine = new THREE.Line(earthOrbitGeo, this.earthHelioMat);
    this.earthHelioLine.computeLineDistances();
    this.helioGroup.add(this.earthHelioLine);

    // Mars's heliocentric orbit arc
    const curveMars = new THREE.EllipseCurve(
      this.sunPosition.x, this.sunPosition.z,
      24.0, 23.5,
      -0.85, 0.25,
      false,
      0.08
    );
    const marsOrbitPts = curveMars.getPoints(90).map(p => new THREE.Vector3(p.x, 0.8, p.y));
    const marsOrbitGeo = new THREE.BufferGeometry().setFromPoints(marsOrbitPts);
    this.marsHelioMat = new THREE.LineDashedMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.25,
      dashSize: 0.35,
      gapSize: 0.2,
      blending: THREE.AdditiveBlending
    });
    this.marsHelioLine = new THREE.Line(marsOrbitGeo, this.marsHelioMat);
    this.marsHelioLine.computeLineDistances();
    this.helioGroup.add(this.marsHelioLine);

    this.group.add(this.helioGroup);
  }

  /* -----------------------------------------------------------------
     Active Satellite Beacon Node
     ----------------------------------------------------------------- */
  _buildSatelliteBeacon() {
    this.satGroup = new THREE.Group();

    const coreGeo = new THREE.SphereGeometry(0.024, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      blending: THREE.AdditiveBlending
    });
    this.satCore = new THREE.Mesh(coreGeo, coreMat);
    this.satGroup.add(this.satCore);

    const pulseGeo = new THREE.RingGeometry(0.03, 0.048, 32);
    this.satPulseMat = new THREE.MeshBasicMaterial({
      color: 0x4a9eff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    this.satPulse = new THREE.Mesh(pulseGeo, this.satPulseMat);
    this.satGroup.add(this.satPulse);

    this.satLight = new THREE.PointLight(0x4a9eff, 0.8, 1.2);
    this.satGroup.add(this.satLight);

    this.earthOrbitsGroup.add(this.satGroup);
  }

  /* -----------------------------------------------------------------
     Interplanetary Transfer Arcs
     ----------------------------------------------------------------- */
  _buildTransferArcs() {
    // Translunar Injection Arc
    const curveMoon = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(1.8, 0.2, 0),
      new THREE.Vector3(2.6, 1.8, -1.0),
      new THREE.Vector3(3.6, 0.6, -1.8)
    );
    const moonPts = curveMoon.getPoints(50);
    const moonArcGeo = new THREE.BufferGeometry().setFromPoints(moonPts);
    this.moonArcMat = new THREE.LineDashedMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.35,
      dashSize: 0.12,
      gapSize: 0.08,
      blending: THREE.AdditiveBlending
    });
    this.moonArc = new THREE.Line(moonArcGeo, this.moonArcMat);
    this.moonArc.computeLineDistances();
    this.group.add(this.moonArc);

    // Transmars Injection Arc
    const curveMars = new THREE.CubicBezierCurve3(
      new THREE.Vector3(1.85, 0.1, 0),
      new THREE.Vector3(4.5, 2.5, -2.5),
      new THREE.Vector3(7.2, 2.8, -4.8),
      new THREE.Vector3(9.2, 1.6, -6.4)
    );
    const marsPts = curveMars.getPoints(80);
    const marsArcGeo = new THREE.BufferGeometry().setFromPoints(marsPts);
    this.marsArcMat = new THREE.LineDashedMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.35,
      dashSize: 0.2,
      gapSize: 0.12,
      blending: THREE.AdditiveBlending
    });
    this.marsArc = new THREE.Line(marsArcGeo, this.marsArcMat);
    this.marsArc.computeLineDistances();
    this.group.add(this.marsArc);
  }

  /* -----------------------------------------------------------------
     Update Loop & Focus Highlighting
     ----------------------------------------------------------------- */
  update(delta, elapsed) {
    if (!this.group.visible) return;

    this.earthOrbitsGroup.position.copy(this.earthGroup.position);
    this.leoLine.rotation.z += delta * 0.03;

    // Advance satellite beacon along GEO orbit
    this._satAngle += delta * 0.4;
    const rGeo = 1.85;
    const x = Math.cos(this._satAngle) * rGeo;
    const z = Math.sin(this._satAngle) * rGeo;
    const y = -z * Math.sin(0.15);
    const zRot = z * Math.cos(0.15);
    this.satGroup.position.set(x, y, zRot);

    // Satellite pulse
    this._pulseTime += delta * 2.5;
    const pulseScale = 1.0 + (Math.sin(this._pulseTime) * 0.5 + 0.5) * 1.5;
    this.satPulse.scale.set(pulseScale, pulseScale, 1);
    this.satPulseMat.opacity = Math.max(0, 0.8 - (pulseScale - 1) * 0.5);
    this.satPulse.lookAt(x * 2, y * 2, zRot * 2);
  }

  /**
   * Adjust orbit line opacities based on selected destination
   * @param {'EARTH'|'MOON'|'MARS'|'SOLAR_SYSTEM'} destKey
   */
  highlightOrbit(destKey) {
    this._activeFocus = destKey;
    const isEarth = destKey === 'EARTH' || destKey === 'SOLAR_SYSTEM';
    const isMoon  = destKey === 'MOON'  || destKey === 'SOLAR_SYSTEM';
    const isMars  = destKey === 'MARS'  || destKey === 'SOLAR_SYSTEM';

    this.geoMat.opacity          = isEarth ? 0.65 : 0.2;
    this.leoMat.opacity          = isEarth ? 0.55 : 0.15;
    this.earthHelioMat.opacity   = isEarth ? 0.45 : 0.15;

    this.moonOrbitMat.opacity    = isMoon  ? 0.75 : 0.2;
    this.moonArcMat.opacity      = isMoon  ? 0.70 : 0.18;

    this.marsHelioMat.opacity    = isMars  ? 0.65 : 0.15;
    this.marsArcMat.opacity      = isMars  ? 0.70 : 0.18;
  }

  setOpacity(val) {
    this.group.visible = val > 0.001;
    this.geoMat.opacity        = 0.45 * val;
    this.leoMat.opacity        = 0.35 * val;
    this.moonOrbitMat.opacity  = 0.35 * val;
    this.moonArcMat.opacity    = 0.35 * val;
    this.marsArcMat.opacity    = 0.35 * val;
    this.earthHelioMat.opacity = 0.25 * val;
    this.marsHelioMat.opacity  = 0.25 * val;
  }

  dispose() {
    this.geoLine.geometry.dispose();
    this.geoMat.dispose();
    this.leoLine.geometry.dispose();
    this.leoMat.dispose();
    this.moonOrbitLine.geometry.dispose();
    this.moonOrbitMat.dispose();
    this.earthHelioLine.geometry.dispose();
    this.earthHelioMat.dispose();
    this.marsHelioLine.geometry.dispose();
    this.marsHelioMat.dispose();
    this.moonArc.geometry.dispose();
    this.moonArcMat.dispose();
    this.marsArc.geometry.dispose();
    this.marsArcMat.dispose();
    this.scene.remove(this.group);
  }
}
