/**
 * SpectrumLabVisualizer.js — Interactive Astrophysical Spectroscopy
 * 
 * Visualizes how astronomers extract temperature, composition, and kinematics from light:
 *   - Collimated Incoming Stellar Light Beam
 *   - 3D Dispersive Prism / Diffraction Grating
 *   - Continuous Multi-Spectral Rainbow Ribbon (380 nm to 750 nm)
 *   - Quantized Dark Fraunhofer Absorption Notches & Bright Emission Spikes
 *   - Interactive Spectroscopic Wavelength Probe with Energy (eV) & Atomic Line IDs
 */

import * as THREE from 'three';

export class SpectrumLabVisualizer {
  constructor(parentGroup) {
    this.group = new THREE.Group();
    this.group.name = 'SpectrumLabGroup';
    this.group.visible = false;
    parentGroup.add(this.group);

    this.activeSourceKey = 'SUN_G2V';
    this.probeWavelength = 589; // nm (Sodium D)

    this._buildScene();
  }

  _buildScene() {
    // 1. Light Source Collimator (Left)
    const collimatorGeo = new THREE.CylinderGeometry(0.3, 0.35, 1.2, 16);
    const collimatorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const collimator = new THREE.Mesh(collimatorGeo, collimatorMat);
    collimator.position.set(-4.5, 0, 0);
    collimator.rotation.z = Math.PI / 2;
    this.group.add(collimator);

    // Incoming White/Stellar Light Beam
    const inBeamPts = [new THREE.Vector3(-4.0, 0, 0), new THREE.Vector3(-1.2, 0, 0)];
    const inBeamGeo = new THREE.BufferGeometry().setFromPoints(inBeamPts);
    this.inBeamMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 });
    this.inBeamLine = new THREE.Line(inBeamGeo, this.inBeamMat);
    this.group.add(this.inBeamLine);

    // 2. 3D Triangular Dispersive Prism
    const prismShape = new THREE.Shape();
    prismShape.moveTo(0, 0.8);
    prismShape.lineTo(-0.7, -0.6);
    prismShape.lineTo(0.7, -0.6);
    prismShape.closePath();

    const extrudeSettings = { depth: 0.8, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
    const prismGeo = new THREE.ExtrudeGeometry(prismShape, extrudeSettings);
    const prismMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.52, // Crown glass
      metalness: 0.05
    });
    this.prismMesh = new THREE.Mesh(prismGeo, prismMat);
    this.prismMesh.position.set(-1.0, 0, -0.4);
    this.group.add(this.prismMesh);

    // 3. Dispersed Multi-Spectral Rainbow Ribbon (380 nm to 750 nm)
    // Ribbon extends from x = 0.5 to x = 5.0, y spans -1.0 to 1.0
    const ribbonSegments = 120;
    const ribbonGeo = new THREE.PlaneGeometry(4.5, 1.8, ribbonSegments, 1);
    
    // Vertex colors mapped to real wavelengths
    const count = (ribbonSegments + 1) * 2;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i <= ribbonSegments; i++) {
      const u = i / ribbonSegments;
      const wl = 380 + u * (750 - 380);
      const rgb = this._wavelengthToRGB(wl);

      const idx1 = i * 2;
      const idx2 = i * 2 + 1;

      colors[idx1 * 3]     = rgb[0];
      colors[idx1 * 3 + 1] = rgb[1];
      colors[idx1 * 3 + 2] = rgb[2];

      colors[idx2 * 3]     = rgb[0];
      colors[idx2 * 3 + 1] = rgb[1];
      colors[idx2 * 3 + 2] = rgb[2];
    }
    ribbonGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.ribbonMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    this.ribbonMesh = new THREE.Mesh(ribbonGeo, this.ribbonMat);
    this.ribbonMesh.position.set(2.8, 0, 0);
    this.group.add(this.ribbonMesh);

    // 4. Absorption / Emission Notches Group
    this.linesGroup = new THREE.Group();
    this.linesGroup.position.set(2.8, 0, 0.02); // Slightly in front of ribbon
    this.group.add(this.linesGroup);

    // 5. Interactive Wavelength Analyzer Probe Line & Caliper
    this.probeGroup = new THREE.Group();
    this.probeGroup.position.set(2.8, 0, 0.04);

    const probeLineGeo = new THREE.PlaneGeometry(0.03, 2.2);
    const probeLineMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
    this.probeLine = new THREE.Mesh(probeLineGeo, probeLineMat);
    this.probeGroup.add(this.probeLine);

    // Probe head cursor bracket
    const bracketGeo = new THREE.RingGeometry(0.12, 0.16, 24);
    const bracketMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
    const bracket = new THREE.Mesh(bracketGeo, bracketMat);
    this.probeGroup.add(bracket);

    this.group.add(this.probeGroup);

    this.setSource('SUN_G2V');
    this.setWavelengthProbe(589);
  }

  setSource(sourceKey) {
    this.activeSourceKey = sourceKey;

    // Clear previous notches
    while (this.linesGroup.children.length > 0) {
      this.linesGroup.remove(this.linesGroup.children[0]);
    }

    // Stellar color tint on incoming beam
    if (sourceKey === 'RIGEL_B8IA') {
      this.inBeamMat.color.setHex(0xbae6fd); // Blue
    } else if (sourceKey === 'PROXIMA_M5V') {
      this.inBeamMat.color.setHex(0xfecaca); // Reddish
    } else if (sourceKey === 'RING_NEBULA_EMISSION') {
      this.inBeamMat.color.setHex(0x67e8f9); // Cyan
    } else {
      this.inBeamMat.color.setHex(0xffffff); // White
    }

    // Fetch key lines from registry
    const lines = this._getSourceLines(sourceKey);
    const isEmission = sourceKey === 'RING_NEBULA_EMISSION';

    lines.forEach(l => {
      // Map lambda 380..750 to x -2.25 .. +2.25
      const u = (l.lambda - 380) / (750 - 380);
      const x = -2.25 + u * 4.5;

      // Real spectroscopic slit notch (procedural quad geometry for robust high-DPI visibility)
      const slitGeo = new THREE.PlaneGeometry(0.038, 1.8);
      const slitMat = new THREE.MeshBasicMaterial({
        color: isEmission ? 0x00ffff : 0x010409,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isEmission ? 1.0 : 0.96
      });
      const slitMesh = new THREE.Mesh(slitGeo, slitMat);
      slitMesh.position.set(x, 0, 0);
      this.linesGroup.add(slitMesh);
    });
  }

  setWavelengthProbe(wl) {
    this.probeWavelength = Math.max(380, Math.min(750, wl));
    const u = (this.probeWavelength - 380) / (750 - 380);
    const x = -2.25 + u * 4.5;
    this.probeGroup.position.x = 2.8 + x;
  }

  _getSourceLines(sourceKey) {
    switch (sourceKey) {
      case 'SUN_G2V':
        return [
          { lambda: 393.4, name: 'Ca II K' },
          { lambda: 396.8, name: 'Ca II H' },
          { lambda: 430.8, name: 'G Band (Fe/CH)' },
          { lambda: 486.1, name: 'H-beta' },
          { lambda: 517.3, name: 'Mg b' },
          { lambda: 527.0, name: 'Fe I' },
          { lambda: 589.0, name: 'Na D1/D2' },
          { lambda: 656.3, name: 'H-alpha' }
        ];
      case 'RIGEL_B8IA':
        return [
          { lambda: 434.0, name: 'H-gamma' },
          { lambda: 447.1, name: 'He I' },
          { lambda: 486.1, name: 'H-beta' },
          { lambda: 587.6, name: 'He I D3' },
          { lambda: 656.3, name: 'H-alpha' }
        ];
      case 'PROXIMA_M5V':
        return [
          { lambda: 495.5, name: 'TiO' },
          { lambda: 544.8, name: 'TiO' },
          { lambda: 589.0, name: 'Na D' },
          { lambda: 705.5, name: 'TiO' }
        ];
      case 'RING_NEBULA_EMISSION':
        return [
          { lambda: 486.1, name: 'H-beta' },
          { lambda: 495.9, name: '[O III]' },
          { lambda: 500.7, name: '[O III] Bright' },
          { lambda: 654.8, name: '[N II]' },
          { lambda: 656.3, name: 'H-alpha' }
        ];
      case 'WASP96B_ATMOSPHERE':
        return [
          { lambda: 589.3, name: 'Na Broadened' },
          { lambda: 769.9, name: 'K I' }
        ];
      default:
        return [{ lambda: 589.0, name: 'Na D' }];
    }
  }

  _wavelengthToRGB(wavelength) {
    let r = 0, g = 0, b = 0;
    if (wavelength >= 380 && wavelength < 440) {
      r = -(wavelength - 440) / (440 - 380);
      g = 0;
      b = 1;
    } else if (wavelength >= 440 && wavelength < 490) {
      r = 0;
      g = (wavelength - 440) / (490 - 440);
      b = 1;
    } else if (wavelength >= 490 && wavelength < 510) {
      r = 0;
      g = 1;
      b = -(wavelength - 510) / (510 - 490);
    } else if (wavelength >= 510 && wavelength < 580) {
      r = (wavelength - 510) / (580 - 510);
      g = 1;
      b = 0;
    } else if (wavelength >= 580 && wavelength < 645) {
      r = 1;
      g = -(wavelength - 645) / (645 - 580);
      b = 0;
    } else if (wavelength >= 645 && wavelength <= 750) {
      r = 1;
      g = 0;
      b = 0;
    }

    // Intensity falloff at eye limits
    let factor = 0;
    if (wavelength >= 380 && wavelength < 420) {
      factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
    } else if (wavelength >= 420 && wavelength < 700) {
      factor = 1.0;
    } else if (wavelength >= 700 && wavelength <= 750) {
      factor = 0.3 + 0.7 * (750 - wavelength) / (750 - 700);
    }

    return [r * factor, g * factor, b * factor];
  }

  show() {
    this.group.visible = true;
  }

  hide() {
    this.group.visible = false;
  }

  update(delta, elapsed) {
    if (!this.group.visible) return;

    // Subtle gentle float of the glass prism
    this.prismMesh.rotation.y = Math.sin(elapsed * 0.8) * 0.05;
  }
}
