/**
 * NavigationTrajectoryVisualizer.js — Interplanetary Astrodynamics & Transfer Navigation
 * 
 * Visualizes authentic orbital mechanics:
 *   - Heliocentric coordinates with Earth (1.0 AU) and Mars (1.524 AU) orbits
 *   - Hohmann Transfer Orbit Ellipse connecting Earth departure to Mars arrival
 *   - Patched conics waypoints: Departure Burn, Mid-Course Correction, Mars Insertion
 *   - Dynamic Spacecraft Velocity Vector (v) and Engine Burn Impulse Vector (Δv)
 *   - Interactive flight progress timeline scrubber (Day 0 to Day 210)
 */

import * as THREE from 'three';

export class NavigationTrajectoryVisualizer {
  constructor(parentGroup) {
    this.group = new THREE.Group();
    this.group.name = 'NavigationTrajectoryGroup';
    this.group.rotation.x = Math.PI * 0.28; // Elevated 50° isometric tilt for clear orbital transfer perspective
    this.group.visible = false;
    parentGroup.add(this.group);

    this.flightProgress = 0.42; // Day 0 to 210 (0.0 to 1.0)
    this.showVectors = true;
    this.autoCruise = true;

    this.rEarth = 2.0;
    this.rMars = 3.05;
    // Semi-major axis of transfer ellipse: a = (rE + rM) / 2 = 2.525
    this.aTransfer = (this.rEarth + this.rMars) / 2;
    // Semi-minor axis: b = sqrt(rE * rM) = 2.47
    this.bTransfer = Math.sqrt(this.rEarth * this.rMars);
    // Center offset of ellipse: c = a - rE = 0.525
    this.cOffset = this.aTransfer - this.rEarth;

    this._buildScene();
  }

  _buildScene() {
    // 1. Central Solar Reference
    const sunGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.group.add(sunMesh);

    // Ecliptic coordinate plane grid
    const grid = new THREE.GridHelper(8, 16, 0x1e293b, 0x0f172a);
    grid.position.y = -0.05;
    this.group.add(grid);

    // 2. Earth Orbit Circle (Blue)
    const ePts = [];
    for (let i = 0; i <= 64; i++) {
      const th = (i / 64) * Math.PI * 2;
      ePts.push(new THREE.Vector3(Math.cos(th) * this.rEarth, 0, Math.sin(th) * this.rEarth));
    }
    const eGeo = new THREE.BufferGeometry().setFromPoints(ePts);
    const eMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 });
    this.group.add(new THREE.Line(eGeo, eMat));

    // Earth Planet Bead at Departure Location (2.0, 0, 0)
    const earthGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const earthMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.position.set(this.rEarth, 0, 0);
    this.group.add(earthMesh);

    // 3. Mars Orbit Circle (Red)
    const mPts = [];
    for (let i = 0; i <= 64; i++) {
      const th = (i / 64) * Math.PI * 2;
      mPts.push(new THREE.Vector3(Math.cos(th) * this.rMars, 0, Math.sin(th) * this.rMars));
    }
    const mGeo = new THREE.BufferGeometry().setFromPoints(mPts);
    const mMat = new THREE.LineBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.4 });
    this.group.add(new THREE.Line(mGeo, mMat));

    // Mars Planet Bead at Arrival Rendezvous Location (-3.05, 0, 0)
    const marsGeo = new THREE.SphereGeometry(0.11, 12, 12);
    const marsMat = new THREE.MeshBasicMaterial({ color: 0xe11d48 });
    const marsMesh = new THREE.Mesh(marsGeo, marsMat);
    marsMesh.position.set(-this.rMars, 0, 0);
    this.group.add(marsMesh);

    // 4. Hohmann Transfer Ellipse Arc
    const transferPts = [];
    const steps = 64;
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI; // 0 to PI (Half orbit)
      // Standard parametric ellipse with center offset along x
      const x = -this.cOffset + Math.cos(theta) * this.aTransfer;
      const z = Math.sin(theta) * this.bTransfer;
      transferPts.push(new THREE.Vector3(x, 0, z));
    }
    const transferGeo = new THREE.BufferGeometry().setFromPoints(transferPts);
    const transferMat = new THREE.LineBasicMaterial({
      color: 0xfacc15,
      linewidth: 3,
      transparent: true,
      opacity: 0.95
    });
    this.transferLine = new THREE.Line(transferGeo, transferMat);
    this.group.add(this.transferLine);

    // 5. Waypoint Milestone Marker Rings
    this.waypoints = [
      { id: 'TMI', theta: 0.0, label: 'TMI Burn (+3.6 km/s)' },
      { id: 'MCC1', theta: Math.PI * 0.22, label: 'MCC-1 (+28 m/s)' },
      { id: 'CRUISE', theta: Math.PI * 0.55, label: 'Optical Navigation' },
      { id: 'MOI', theta: Math.PI, label: 'MOI Burn (-2.1 km/s)' }
    ];

    this.waypoints.forEach(wp => {
      const x = -this.cOffset + Math.cos(wp.theta) * this.aTransfer;
      const z = Math.sin(wp.theta) * this.bTransfer;

      const wpGeo = new THREE.RingGeometry(0.09, 0.13, 16);
      const wpMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(wpGeo, wpMat);
      ring.position.set(x, 0.02, z);
      ring.rotation.x = Math.PI / 2;
      this.group.add(ring);
    });

    // 6. Spacecraft Node
    this.craftGroup = new THREE.Group();

    const craftGeo = new THREE.ConeGeometry(0.08, 0.24, 8);
    const craftMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8 });
    this.craftMesh = new THREE.Mesh(craftGeo, craftMat);
    this.craftMesh.rotation.x = Math.PI / 2;
    this.craftGroup.add(this.craftMesh);

    // Acquisition Target Reticle Box
    const retGeo = new THREE.RingGeometry(0.18, 0.22, 24);
    const retMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const ret = new THREE.Mesh(retGeo, retMat);
    ret.rotation.x = Math.PI / 2;
    this.craftGroup.add(ret);

    // Dynamic Velocity Vector Arrow (Green)
    this.velArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, 0),
      0.8,
      0x34d399,
      0.18,
      0.12
    );
    this.craftGroup.add(this.velArrow);

    // Dynamic Thrust Burn Vector Arrow (Orange)
    this.thrustArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(0, 0, 0),
      0.65,
      0xf97316,
      0.16,
      0.1
    );
    this.thrustArrow.visible = false;
    this.craftGroup.add(this.thrustArrow);

    this.group.add(this.craftGroup);

    this.setProgress(this.flightProgress);
  }

  setProgress(progress) {
    this.flightProgress = Math.max(0, Math.min(1, progress));
    const theta = this.flightProgress * Math.PI;

    // Position along transfer ellipse
    const x = -this.cOffset + Math.cos(theta) * this.aTransfer;
    const z = Math.sin(theta) * this.bTransfer;
    this.craftGroup.position.set(x, 0, z);

    // Compute velocity tangent direction: dx/dtheta = -a*sin(theta), dz/dtheta = b*cos(theta)
    const dx = -this.aTransfer * Math.sin(theta);
    const dz = this.bTransfer * Math.cos(theta);
    const dir = new THREE.Vector3(dx, 0, dz).normalize();

    this.velArrow.setDirection(dir);

    // Show thrust burn vector only near departure (TMI) or arrival (MOI)
    if (this.flightProgress < 0.08) {
      // Prograde departure burn
      this.thrustArrow.visible = true;
      this.thrustArrow.setDirection(dir);
    } else if (this.flightProgress > 0.92) {
      // Retrograde capture burn (pointing opposite to velocity)
      this.thrustArrow.visible = true;
      this.thrustArrow.setDirection(dir.clone().negate());
    } else {
      this.thrustArrow.visible = false;
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

    if (this.autoCruise) {
      this.flightProgress = (this.flightProgress + delta * 0.06) % 1.0;
      this.setProgress(this.flightProgress);
    }
  }
}
