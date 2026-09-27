/**
 * LightTimeVisualizer.js — Relativistic Lookback Time Propagation
 * 
 * Visualizes the finite speed of light:
 *   - Earth Receiver Station (-4.5, 0, 0)
 *   - Source Emitter Node (+4.5, 0, 0)
 *   - Animated Photon Wave-Packets traveling across the space vector
 *   - Dual state comparison: Observed State (Lookback) vs Source State (Now)
 */

import * as THREE from 'three';

export class LightTimeVisualizer {
  constructor(parentGroup) {
    this.group = new THREE.Group();
    this.group.name = 'LightTimeGroup';
    this.group.visible = false;
    parentGroup.add(this.group);

    this.activeTarget = 'SUN';
    this.scrubProgress = 0.65;
    this.autoAnimate = true;

    this._buildScene();
  }

  _buildScene() {
    // 1. Observer Station: Earth
    this.earthGroup = new THREE.Group();
    this.earthGroup.position.set(-4.5, 0, 0);

    const earthGeo = new THREE.SphereGeometry(0.85, 24, 24);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      emissive: 0x0c2461,
      roughness: 0.5
    });
    this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.earthGroup.add(this.earthMesh);

    // Sensor dish reticle
    const dishGeo = new THREE.RingGeometry(1.0, 1.05, 32);
    const dishMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.rotation.y = Math.PI / 2;
    this.earthGroup.add(dish);

    this.group.add(this.earthGroup);

    // 2. Light Source Emitter Node
    this.sourceGroup = new THREE.Group();
    this.sourceGroup.position.set(4.5, 0, 0);

    const sourceGeo = new THREE.SphereGeometry(1.1, 24, 24);
    this.sourceMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    this.sourceMesh = new THREE.Mesh(sourceGeo, this.sourceMat);
    this.sourceGroup.add(this.sourceMesh);

    // Pulsing emission corona
    const coronaGeo = new THREE.SphereGeometry(1.4, 16, 16);
    this.coronaMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.3
    });
    this.coronaMesh = new THREE.Mesh(coronaGeo, this.coronaMat);
    this.sourceGroup.add(this.coronaMesh);

    this.group.add(this.sourceGroup);

    // 3. Propagation Ray Vector Beam
    const beamPts = [
      new THREE.Vector3(4.5, 0, 0),
      new THREE.Vector3(-4.5, 0, 0)
    ];
    const beamGeo = new THREE.BufferGeometry().setFromPoints(beamPts);
    const beamMat = new THREE.LineDashedMaterial({
      color: 0x0284c7,
      dashSize: 0.25,
      gapSize: 0.15,
      transparent: true,
      opacity: 0.6
    });
    this.beamLine = new THREE.Line(beamGeo, beamMat);
    this.beamLine.computeLineDistances();
    this.group.add(this.beamLine);

    // 4. Moving Photon Wave Packets
    this.packetCount = 8;
    this.packets = [];
    const packetGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    for (let i = 0; i < this.packetCount; i++) {
      const p = new THREE.Mesh(packetGeo, packetMat.clone());
      this.group.add(p);
      this.packets.push({
        mesh: p,
        phase: i / this.packetCount
      });
    }

    // 5. Interactive Scrubber Indicator Ring
    const scrubRingGeo = new THREE.RingGeometry(0.35, 0.42, 32);
    const scrubRingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
    this.scrubRing = new THREE.Mesh(scrubRingGeo, scrubRingMat);
    this.scrubRing.rotation.y = Math.PI / 2;
    this.group.add(this.scrubRing);

    // Coordinate ruler tick marks along trajectory
    const tickGroup = new THREE.Group();
    for (let x = -4; x <= 4; x += 1) {
      const tPts = [new THREE.Vector3(x, -0.2, 0), new THREE.Vector3(x, 0.2, 0)];
      const tGeo = new THREE.BufferGeometry().setFromPoints(tPts);
      const tMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.6 });
      tickGroup.add(new THREE.Line(tGeo, tMat));
    }
    this.group.add(tickGroup);
  }

  setTarget(targetKey) {
    this.activeTarget = targetKey;

    switch (targetKey) {
      case 'MOON':
        this.sourceMat.color.setHex(0x94a3b8);
        this.sourceMesh.scale.set(0.4, 0.4, 0.4);
        break;
      case 'SUN':
        this.sourceMat.color.setHex(0xfbbf24);
        this.sourceMesh.scale.set(1.1, 1.1, 1.1);
        break;
      case 'MARS':
        this.sourceMat.color.setHex(0xf97316);
        this.sourceMesh.scale.set(0.6, 0.6, 0.6);
        break;
      case 'VOYAGER_1':
        this.sourceMat.color.setHex(0x38bdf8);
        this.sourceMesh.scale.set(0.25, 0.25, 0.25);
        break;
      case 'PROXIMA':
        this.sourceMat.color.setHex(0xef4444);
        this.sourceMesh.scale.set(0.5, 0.5, 0.5);
        break;
      case 'TRAPPIST_1':
        this.sourceMat.color.setHex(0xd97706);
        this.sourceMesh.scale.set(0.65, 0.65, 0.65);
        break;
      case 'CRAB_NEBULA':
        this.sourceMat.color.setHex(0x06b6d4);
        this.sourceMesh.scale.set(0.9, 0.9, 0.9);
        break;
      case 'ANDROMEDA':
        this.sourceMat.color.setHex(0xa855f7);
        this.sourceMesh.scale.set(1.4, 0.4, 1.4);
        break;
      default:
        this.sourceMat.color.setHex(0xfbbf24);
        this.sourceMesh.scale.set(1.0, 1.0, 1.0);
    }
  }

  setScrub(progress) {
    this.scrubProgress = Math.max(0, Math.min(1, progress));
    // Position scrubber along x: from +4.5 (Source) to -4.5 (Earth)
    const x = 4.5 - this.scrubProgress * 9.0;
    this.scrubRing.position.set(x, 0, 0);
  }

  show() {
    this.group.visible = true;
  }

  hide() {
    this.group.visible = false;
  }

  update(delta, elapsed) {
    if (!this.group.visible) return;

    // Rotate Earth & Source
    this.earthMesh.rotation.y += delta * 0.3;
    this.sourceMesh.rotation.y += delta * 0.15;

    // Pulse corona
    const scale = 1.3 + Math.sin(elapsed * 2.5) * 0.08;
    this.coronaMesh.scale.set(scale, scale, scale);

    // Propagate photon packets from +4.5 to -4.5
    this.packets.forEach(p => {
      p.phase = (p.phase + delta * 0.25) % 1.0;
      const x = 4.5 - p.phase * 9.0;
      p.mesh.position.set(x, Math.sin(p.phase * Math.PI * 4) * 0.06, 0);

      // Color redshift/blueshift according to travel phase
      const mat = p.mesh.material;
      if (p.phase > 0.85) {
        mat.color.setHex(0x38bdf8); // Arrival Blue
      } else if (p.phase < 0.15) {
        mat.color.setHex(0xfbbf24); // Emission Yellow
      } else {
        mat.color.setHex(0x00f0ff); // Interplanetary Cyan
      }
    });
  }
}
