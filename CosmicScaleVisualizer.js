/**
 * CosmicScaleVisualizer.js — 3D Powers of Ten Multi-Scale Experience
 * 
 * Visualizes 5 orders of magnitude tiers:
 *   1. HUMAN (10⁰ m) — Human Astronaut / Molecular coordinate frame
 *   2. PLANET (10⁷ m) — Earth sphere, GEO orbit ring, and Lunar distance
 *   3. SOLAR_SYSTEM (10¹³ m) — Heliocentric orbital tracks (1 to 30 AU)
 *   4. STELLAR (10¹⁷ m) — Solar Neighborhood (Alpha Centauri, Sirius, Vega)
 *   5. GALAXY (10²¹ m) — Milky Way logarithmic spiral arms and galactic bar
 */

import * as THREE from 'three';
import gsap from 'gsap';

export class CosmicScaleVisualizer {
  constructor(parentGroup) {
    this.group = new THREE.Group();
    this.group.name = 'CosmicScaleGroup';
    this.group.visible = false;
    parentGroup.add(this.group);

    this.activeStep = 'PLANET';
    this.scaleGroups = {};
    this.scaleFactor = 1.0;

    this._buildHumanScale();
    this._buildPlanetScale();
    this._buildSolarSystemScale();
    this._buildStellarScale();
    this._buildGalaxyScale();

    this.setScale('PLANET', true);
  }

  /* 1. Human Scale (10^0 m) */
  _buildHumanScale() {
    const g = new THREE.Group();
    g.name = 'Scale_HUMAN';

    // Stylized wireframe humanoid probe figure
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.8 });
    
    // Torso & limbs
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.2, 0.8, 8), bodyMat);
    torso.position.y = 0;
    g.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), bodyMat);
    head.position.y = 0.6;
    g.add(head);

    // Coordinate floor grid
    const grid = new THREE.GridHelper(4, 16, 0x38bdf8, 0x1e3a5f);
    grid.position.y = -0.7;
    g.add(grid);

    // Dimension calipers & measurement bounding box
    const boxGeo = new THREE.BoxGeometry(1.2, 1.8, 0.8);
    const boxEdges = new THREE.EdgesGeometry(boxGeo);
    const boxLine = new THREE.LineSegments(boxEdges, new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.4 }));
    boxLine.position.y = 0.1;
    g.add(boxLine);

    // Cellular / atomic particle halo
    const partGeo = new THREE.BufferGeometry();
    const count = 300;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const partMat = new THREE.PointsMaterial({ color: 0x67e8f9, size: 0.04, transparent: true, opacity: 0.6 });
    this.humanParticles = new THREE.Points(partGeo, partMat);
    g.add(this.humanParticles);

    g.visible = false;
    this.group.add(g);
    this.scaleGroups['HUMAN'] = g;
  }

  /* 2. Planetary Scale (10^7 m) */
  _buildPlanetScale() {
    const g = new THREE.Group();
    g.name = 'Scale_PLANET';

    // Earth Sphere with glowing atmosphere
    const earthGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.6,
      metalness: 0.1,
      emissive: 0x0c2560,
      emissiveIntensity: 0.4
    });
    this.planetMesh = new THREE.Mesh(earthGeo, earthMat);
    g.add(this.planetMesh);

    // Wireframe latitude/longitude grid
    const latLongGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(1.22, 18, 18));
    const latLongMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25 });
    const latLongMesh = new THREE.LineSegments(latLongGeo, latLongMat);
    this.planetMesh.add(latLongMesh);

    // Geostationary Orbit Ring (35,786 km)
    const geoRingGeo = new THREE.RingGeometry(2.4, 2.42, 64);
    const geoRingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
    const geoRing = new THREE.Mesh(geoRingGeo, geoRingMat);
    geoRing.rotation.x = Math.PI / 2;
    g.add(geoRing);

    // Moon in orbit at 384,400 km
    const moonGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const moonMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonMesh.position.set(4.8, 0.4, 0);
    g.add(this.moonMesh);

    // Lunar Orbit Line
    const lunarOrbGeo = new THREE.BufferGeometry();
    const lPoints = [];
    for (let i = 0; i <= 64; i++) {
      const th = (i / 64) * Math.PI * 2;
      lPoints.push(Math.cos(th) * 4.8, 0, Math.sin(th) * 4.8);
    }
    lunarOrbGeo.setAttribute('position', new THREE.Float32BufferAttribute(lPoints, 3));
    const lunarOrbMat = new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.4 });
    const lunarOrbLine = new THREE.Line(lunarOrbGeo, lunarOrbMat);
    g.add(lunarOrbLine);

    g.visible = false;
    this.group.add(g);
    this.scaleGroups['PLANET'] = g;
  }

  /* 3. Solar System Scale (10^13 m) */
  _buildSolarSystemScale() {
    const g = new THREE.Group();
    g.name = 'Scale_SOLAR_SYSTEM';

    // Central Sun
    const sunGeo = new THREE.SphereGeometry(0.6, 24, 24);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    g.add(sunMesh);

    // Sun Glow Halo
    const glowGeo = new THREE.SphereGeometry(0.9, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.35 });
    g.add(new THREE.Mesh(glowGeo, glowMat));

    // Planetary Orbital Tracks
    const orbits = [
      { r: 1.1, col: 0x94a3b8, name: 'Mercury' },
      { r: 1.6, col: 0xfde047, name: 'Venus' },
      { r: 2.2, col: 0x38bdf8, name: 'Earth' },
      { r: 2.9, col: 0xf97316, name: 'Mars' },
      { r: 4.4, col: 0xfcd34d, name: 'Jupiter' },
      { r: 5.8, col: 0xe2e8f0, name: 'Saturn' }
    ];

    orbits.forEach(orb => {
      const orbPts = [];
      for (let i = 0; i <= 64; i++) {
        const th = (i / 64) * Math.PI * 2;
        orbPts.push(Math.cos(th) * orb.r, 0, Math.sin(th) * orb.r);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(orbPts, 3));
      const mat = new THREE.LineBasicMaterial({ color: orb.col, transparent: true, opacity: 0.35 });
      g.add(new THREE.Line(geo, mat));

      // Planet bead
      const pMesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: orb.col }));
      pMesh.position.set(orb.r, 0, 0);
      g.add(pMesh);
    });

    // Kuiper Belt Particle Disk
    const kbGeo = new THREE.BufferGeometry();
    const count = 600;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const rad = 6.2 + Math.random() * 2.5;
      const th = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(th) * rad;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 2] = Math.sin(th) * rad;
    }
    kbGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const kbMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.03, transparent: true, opacity: 0.45 });
    g.add(new THREE.Points(kbGeo, kbMat));

    g.visible = false;
    this.group.add(g);
    this.scaleGroups['SOLAR_SYSTEM'] = g;
  }

  /* 4. Stellar Scale (10^17 m) */
  _buildStellarScale() {
    const g = new THREE.Group();
    g.name = 'Scale_STELLAR';

    // Solar reference at origin
    const sol = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfffbeb }));
    g.add(sol);

    // Nearby Stars
    const stars = [
      { name: 'Alpha Centauri A/B', pos: [1.8, 0.4, -1.2], col: 0xfef08a, size: 0.16 },
      { name: 'Proxima Centauri', pos: [1.85, 0.38, -1.25], col: 0xef4444, size: 0.08 },
      { name: 'Barnard’s Star', pos: [-2.1, 0.8, 1.4], col: 0xf87171, size: 0.1 },
      { name: 'Sirius A', pos: [3.4, -1.2, 2.1], col: 0xbae6fd, size: 0.28 },
      { name: 'Procyon', pos: [3.8, 0.5, -2.4], col: 0xfef9c3, size: 0.2 },
      { name: 'Vega', pos: [-4.6, 2.2, 1.8], col: 0x38bdf8, size: 0.32 },
      { name: 'Betelgeuse', pos: [5.8, -1.8, -4.2], col: 0xf97316, size: 0.5 }
    ];

    stars.forEach(st => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(st.size, 12, 12),
        new THREE.MeshBasicMaterial({ color: st.col })
      );
      mesh.position.set(...st.pos);
      g.add(mesh);

      // Distance radius line from Sol
      const linePts = [0, 0, 0, ...st.pos];
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePts, 3));
      const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.2 });
      g.add(new THREE.Line(lineGeo, lineMat));
    });

    // 10 Light Year sphere boundary
    const bubbleGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(4.5, 16, 16));
    const bubbleMat = new THREE.LineBasicMaterial({ color: 0x1e3a8a, transparent: true, opacity: 0.2 });
    g.add(new THREE.LineSegments(bubbleGeo, bubbleMat));

    g.visible = false;
    this.group.add(g);
    this.scaleGroups['STELLAR'] = g;
  }

  /* 5. Galactic Scale (10^21 m) */
  _buildGalaxyScale() {
    const g = new THREE.Group();
    g.name = 'Scale_GALAXY';

    // Logarithmic spiral arms
    const starCount = 3500;
    const pos = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const cInner = new THREE.Color(0xfef08a);
    const cMid = new THREE.Color(0x38bdf8);
    const cOuter = new THREE.Color(0x1d4ed8);

    for (let i = 0; i < starCount; i++) {
      // 2 major arms with dispersion
      const arm = (i % 2) * Math.PI;
      const r = Math.pow(Math.random(), 1.5) * 5.5;
      const th = r * 1.4 + arm + (Math.random() - 0.5) * 0.7;

      pos[i * 3] = Math.cos(th) * r + (Math.random() - 0.5) * 0.3;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.35 * Math.exp(-r * 0.3);
      pos[i * 3 + 2] = Math.sin(th) * r + (Math.random() - 0.5) * 0.3;

      const normR = r / 5.5;
      const c = normR < 0.3 ? cInner : (normR < 0.7 ? cMid : cOuter);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const galGeo = new THREE.BufferGeometry();
    galGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    galGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const galMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.75
    });
    this.galaxyPoints = new THREE.Points(galGeo, galMat);
    g.add(this.galaxyPoints);

    // Galactic Core Supermassive Bulge
    const coreGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb, transparent: true, opacity: 0.7 });
    g.add(new THREE.Mesh(coreGeo, coreMat));

    // Sun's location marker in the Orion Spur (~26,000 light years from core)
    const sunMarkerGeo = new THREE.RingGeometry(0.12, 0.16, 24);
    const sunMarkerMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide });
    const sunMarker = new THREE.Mesh(sunMarkerGeo, sunMarkerMat);
    sunMarker.position.set(2.8, 0.05, 1.2);
    sunMarker.rotation.x = Math.PI / 2;
    g.add(sunMarker);

    g.visible = false;
    this.group.add(g);
    this.scaleGroups['GALAXY'] = g;
  }

  setScale(stepKey, instant = false) {
    if (!this.scaleGroups[stepKey]) return;
    this.activeStep = stepKey;

    Object.keys(this.scaleGroups).forEach(k => {
      const grp = this.scaleGroups[k];
      if (k === stepKey) {
        const targetScale = (k === 'HUMAN') ? 1.6 : 1.0;
        grp.visible = true;
        if (instant) {
          grp.scale.set(targetScale, targetScale, targetScale);
        } else {
          grp.scale.set(0.1, 0.1, 0.1);
          gsap.to(grp.scale, { x: targetScale, y: targetScale, z: targetScale, duration: 0.9, ease: 'power3.out' });
        }
      } else {
        if (instant) {
          grp.visible = false;
        } else {
          gsap.to(grp.scale, {
            x: 1.8, y: 1.8, z: 1.8, duration: 0.5, ease: 'power2.in',
            onComplete: () => { grp.visible = false; }
          });
        }
      }
    });
  }

  show() {
    this.group.visible = true;
  }

  hide() {
    this.group.visible = false;
  }

  update(delta, elapsed) {
    if (!this.group.visible) return;

    if (this.humanParticles) {
      this.humanParticles.rotation.y += delta * 0.15;
    }
    if (this.planetMesh) {
      this.planetMesh.rotation.y += delta * 0.2;
    }
    if (this.galaxyPoints) {
      this.galaxyPoints.rotation.y += delta * 0.05;
    }
  }
}
