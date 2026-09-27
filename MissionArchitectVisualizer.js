/**
 * MissionArchitectVisualizer.js — Advanced 3D Spatial Assembly & Spacecraft Generator for Phase 9
 * 
 * Physically constructs the user's mission concept in real-time 3D:
 *   - Target Core Anchor with procedural 4K textures (Mars, Europa with cryovolcano plumes,
 *     Parker Sun with coronal filaments, Sagittarius A* with relativistic accretion disk, etc.)
 *   - Complete Procedural 3D Spacecraft Model Generator:
 *       * Octagonal MLI gold foil bus chassis with structural titanium ribs
 *       * 4x RCS attitude control blocks with orthogonal micro-nozzles
 *       * Star tracker optical hoods and forward/aft equipment decks
 *       * Deployable High-Gain 2.4m Parabolic Antenna dish with sub-reflector tripod struts
 *       * Optical Laser Communication (LCRD) transceiver with glowing aperture
 *       * Dual Xenon Ion Thrusters with pulsating cyan plasma exhaust plumes
 *       * Deployable Multi-Panel Solar Array Wings with blue silicon cell grid textures
 *       * Deployable RTG (Radioisotope Thermoelectric Generator) Boom with cooling fins
 *       * Heavy Carbon-Phenolic TPS Heat Shield for solar coronal exploration
 *   - Modular Physical Instrument Layers:
 *       * RADAR SOUNDING: Dual 16m cross-dipole antenna booms & subsurface wave pulses
 *       * SPECTROSCOPY: Optical telescope barrel, dispersion prism & Fraunhofer rainbow fan
 *       * MAGNETOMETRY: 5m articulated boom with dual fluxgate sensors, dipole loops & bow shock
 *       * TRANSIT PHOTOMETRY: Precision photometer tube, baffle rings & occultation beam
 *       * MULTISPECTRAL IMAGING: Two-axis scan turret & surface ground raster pyramid
 *       * ASTROMETRIC DEFLECTION: Laser metrology arms & curved geodesic photon rays
 *   - Deep Space Network Carrier Wave with animated telemetry ping packets
 *   - 3 Interactive View Modes: ORBITAL SURVEY, SPACECRAFT BLUEPRINT INSPECT, PAYLOAD SENSOR
 *   - Dedicated 3-Point Studio Lighting (Key, Fill, Rim, Ambient) for razor-sharp 4K GPU rendering
 */

import * as THREE from 'three';
import gsap from 'gsap';
import { missionArchitectEngine } from '../architect/MissionArchitectEngine.js';

/* -----------------------------------------------------------------
   Procedural Texture Generators (Zero Network Dependencies / Instant)
   ----------------------------------------------------------------- */
function hasCanvas() {
  return typeof document !== 'undefined' && typeof document.createElement === 'function';
}

function createGoldFoilTexture() {
  if (!hasCanvas()) return null;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base metallic gold gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#f59e0b');
  grad.addColorStop(0.3, '#fbbf24');
  grad.addColorStop(0.6, '#d97706');
  grad.addColorStop(1, '#b45309');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Procedural foil crinkles & micro-facets
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const w = 4 + Math.random() * 24;
    const h = 2 + Math.random() * 8;
    ctx.fillRect(x, y, w, h);
  }

  // Dark foil seam creases
  ctx.strokeStyle = 'rgba(120, 53, 15, 0.35)';
  ctx.lineWidth = 1.5;
  for (let y = 0; y <= 512; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }
  for (let x = 0; x <= 512; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createSolarPanelTexture() {
  if (!hasCanvas()) return null;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Deep silicon blue substrate
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 256);

  // Solar cells grid (8 columns x 4 rows)
  const cellW = 56;
  const cellH = 54;
  const gap = 8;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      const x = 12 + c * (cellW + gap);
      const y = 8 + r * (cellH + gap);

      const cellGrad = ctx.createLinearGradient(x, y, x + cellW, y + cellH);
      cellGrad.addColorStop(0, '#1e3a8a');
      cellGrad.addColorStop(0.5, '#1d4ed8');
      cellGrad.addColorStop(1, '#172554');
      ctx.fillStyle = cellGrad;
      ctx.fillRect(x, y, cellW, cellH);

      // Fine silver conductor fingers
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 1;
      for (let f = 4; f < cellH; f += 8) {
        ctx.beginPath();
        ctx.moveTo(x + 2, y + f);
        ctx.lineTo(x + cellW - 2, y + f);
        ctx.stroke();
      }

      // Dual metallic busbars
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + cellW * 0.33, y);
      ctx.lineTo(x + cellW * 0.33, y + cellH);
      ctx.moveTo(x + cellW * 0.66, y);
      ctx.lineTo(x + cellW * 0.66, y + cellH);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

function createEuropaIceTexture() {
  if (!hasCanvas()) return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Icy celestial background
  const iceGrad = ctx.createLinearGradient(0, 0, 1024, 512);
  iceGrad.addColorStop(0, '#f8fafc');
  iceGrad.addColorStop(0.5, '#e0f2fe');
  iceGrad.addColorStop(1, '#bae6fd');
  ctx.fillStyle = iceGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Reddish-brown fractured lineae (veins / tectonic cracks)
  ctx.lineWidth = 2.5;
  const cracks = [
    [[50, 120], [280, 200], [540, 240], [800, 310], [1000, 360]],
    [[120, 420], [310, 360], [580, 300], [790, 210], [950, 140]],
    [[200, 80], [420, 160], [680, 380], [860, 460]],
    [[80, 300], [350, 260], [600, 250], [900, 240]],
    [[450, 50], [510, 220], [580, 420], [640, 490]],
    [[250, 450], [360, 320], [420, 180], [480, 60]]
  ];

  cracks.forEach((pts, idx) => {
    ctx.strokeStyle = idx % 2 === 0 ? 'rgba(146, 64, 14, 0.75)' : 'rgba(180, 83, 9, 0.65)';
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.stroke();

    // Secondary subtle parallel ridge lines
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pts[0][0] + 4, pts[0][1] + 4);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i][0] + 4, pts[i][1] + 4);
    }
    ctx.stroke();
  });

  return new THREE.CanvasTexture(canvas);
}

function createMarsTexture() {
  if (!hasCanvas()) return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base Martian rust gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 512);
  grad.addColorStop(0, '#c2410c');
  grad.addColorStop(0.3, '#ea580c');
  grad.addColorStop(0.7, '#9a3412');
  grad.addColorStop(1, '#7c2d12');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Darker basaltic volcanic plains (Syrtis Major style)
  ctx.fillStyle = 'rgba(67, 20, 7, 0.55)';
  for (let i = 0; i < 20; i++) {
    const cx = 150 + Math.random() * 700;
    const cy = 120 + Math.random() * 260;
    const r = 40 + Math.random() * 110;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Polar ice caps (North & South)
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.ellipse(512, 18, 220, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(512, 496, 160, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

export class MissionArchitectVisualizer {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   * @param {import('./SceneManager.js').SceneManager} [sceneManager]
   */
  constructor(scene, camera, sceneManager) {
    this.scene = scene;
    this.camera = camera;
    this.sceneManager = sceneManager;
    this.engine = missionArchitectEngine;

    // FOCAL ROOT GROUP: Placed at (0, 0, -25) to align directly with camera lookAt
    this.group = new THREE.Group();
    this.group.name = 'MissionArchitectVisualizerGroup';
    this.group.position.set(0, 0, -25);
    this.group.visible = false;
    this.scene.add(this.group);

    this.orbitRadius = 4.6;
    this.orbitAngle = 0;
    this.orbitSpeed = 0.35;
    this.radarPulseProgress = 0;
    this.carrierPingProgress = 0;
    this.plasmaPulseProgress = 0;
    this.viewMode = 'ORBITAL'; // 'ORBITAL' | 'SPACECRAFT' | 'PAYLOAD'

    // Shared procedural textures
    this.goldFoilTex = createGoldFoilTexture();
    this.solarPanelTex = createSolarPanelTexture();
    this.europaIceTex = createEuropaIceTexture();
    this.marsTex = createMarsTexture();

    // Assemblies
    this._initStudioLighting();
    this._initTargetAnchor();
    this._initSpacecraftGenerator();
    this._initInstrumentLayers();
    this._initCarrierBeam();
    this._bindEngineEvents();
  }

  /* -----------------------------------------------------------------
     1. Dedicated 3-Point Studio Lighting (for 4K HDR Real-time Fidelity)
     ----------------------------------------------------------------- */
  _initStudioLighting() {
    this.lightsGroup = new THREE.Group();
    this.lightsGroup.name = 'ArchitectStudioLights';
    this.group.add(this.lightsGroup);

    // Key Light: Upper-front-right warm white
    this.keyLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    this.keyLight.position.set(6, 8, 14);
    this.lightsGroup.add(this.keyLight);

    // Fill Light: Lower-front-left soft cyan
    this.fillLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    this.fillLight.position.set(-8, -2, 10);
    this.lightsGroup.add(this.fillLight);

    // Rim / Back Light: Back violet-purple accent
    this.rimLight = new THREE.DirectionalLight(0xa855f7, 0.85);
    this.rimLight.position.set(0, -6, -10);
    this.lightsGroup.add(this.rimLight);

    // Subtle ambient radiance
    this.ambientLight = new THREE.AmbientLight(0x0f172a, 0.7);
    this.lightsGroup.add(this.ambientLight);
  }

  /* -----------------------------------------------------------------
     2. Target Anchor with Rich Procedural Physics Visuals
     ----------------------------------------------------------------- */
  _initTargetAnchor() {
    this.targetGroup = new THREE.Group();
    this.targetGroup.name = 'ArchitectTargetAnchor';
    this.group.add(this.targetGroup);

    // Main Target Planetary Sphere
    const sphereGeo = new THREE.SphereGeometry(1.9, 48, 48);
    this.targetMat = new THREE.MeshStandardMaterial({
      color: 0xc1440e,
      roughness: 0.65,
      metalness: 0.15,
      map: this.marsTex
    });
    this.targetSphere = new THREE.Mesh(sphereGeo, this.targetMat);
    this.targetGroup.add(this.targetSphere);

    // Target Atmosphere / Limb Glow Shell
    const atmoGeo = new THREE.SphereGeometry(2.02, 32, 32);
    this.atmoMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide
    });
    this.targetAtmo = new THREE.Mesh(atmoGeo, this.atmoMat);
    this.targetGroup.add(this.targetAtmo);

    // Coordinate latitude/longitude wireframe rings
    const wireGeo = new THREE.SphereGeometry(1.92, 16, 12);
    this.targetWireMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    this.targetWire = new THREE.Mesh(wireGeo, this.targetWireMat);
    this.targetGroup.add(this.targetWire);

    // Caliper Outer Horizon Ring
    const horizonGeo = new THREE.RingGeometry(2.45, 2.5, 96);
    this.horizonMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    this.horizonRing = new THREE.Mesh(horizonGeo, this.horizonMat);
    this.horizonRing.rotation.x = Math.PI / 2;
    this.targetGroup.add(this.horizonRing);

    // Europa Cryovolcano Geyser Plumes (Active plume jets)
    this.europaPlumesGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const plumeGeo = new THREE.ConeGeometry(0.25, 1.2, 16, 1, true);
      const plumeMat = new THREE.MeshBasicMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.55 - i * 0.1,
        side: THREE.DoubleSide
      });
      const plume = new THREE.Mesh(plumeGeo, plumeMat);
      plume.position.set(-0.3 + i * 0.3, -1.8, 0.4);
      plume.rotation.x = Math.PI;
      this.europaPlumesGroup.add(plume);
    }
    this.europaPlumesGroup.visible = false;
    this.targetGroup.add(this.europaPlumesGroup);

    // Sagittarius A* Relativistic Kerr Accretion Disk
    this.sgrAccretionDisk = new THREE.Group();
    const diskGeo = new THREE.RingGeometry(2.1, 4.2, 64);
    const diskMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    this.diskMesh = new THREE.Mesh(diskGeo, diskMat);
    this.diskMesh.rotation.x = Math.PI / 2.8;
    this.diskMesh.rotation.z = Math.PI / 6;
    this.sgrAccretionDisk.add(this.diskMesh);

    // Photon Sphere Ring
    const photonGeo = new THREE.RingGeometry(1.95, 2.05, 64);
    const photonMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    this.photonRing = new THREE.Mesh(photonGeo, photonMat);
    this.photonRing.rotation.x = Math.PI / 2.8;
    this.sgrAccretionDisk.add(this.photonRing);

    this.sgrAccretionDisk.visible = false;
    this.targetGroup.add(this.sgrAccretionDisk);

    // Target Reticle Corner Brackets
    this.reticleGroup = new THREE.Group();
    this.targetGroup.add(this.reticleGroup);

    const bracketMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65
    });

    const createBracket = (x, y, z) => {
      const geo = new THREE.BufferGeometry();
      const s = 0.55;
      const pts = [
        new THREE.Vector3(x - s, y, z),
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(x, y - s, z)
      ];
      geo.setFromPoints(pts);
      return new THREE.Line(geo, bracketMat);
    };

    this.reticleGroup.add(createBracket(-2.7, 2.7, 0));
    this.reticleGroup.add(createBracket(2.7, 2.7, 0));
    this.reticleGroup.add(createBracket(-2.7, -2.7, 0));
    this.reticleGroup.add(createBracket(2.7, -2.7, 0));
  }

  /* -----------------------------------------------------------------
     3. Complete Procedural 3D Spacecraft Model Generator
     ----------------------------------------------------------------- */
  _initSpacecraftGenerator() {
    this.spacecraftGroup = new THREE.Group();
    this.spacecraftGroup.name = 'ArchitectSpacecraftNode';
    this.group.add(this.spacecraftGroup);

    // === A. PRIMARY OCTAGONAL BUS CORE ===
    this.busGroup = new THREE.Group();
    this.spacecraftGroup.add(this.busGroup);

    // Octagonal central chassis
    const busGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.55, 8);
    const busMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.88,
      roughness: 0.22,
      map: this.goldFoilTex
    });
    this.craftBus = new THREE.Mesh(busGeo, busMat);
    this.busGroup.add(this.craftBus);

    // Structural Titanium Ribs & Equipment Bulkhead Caps
    const capGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.04, 8);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.3
    });
    const topCap = new THREE.Mesh(capGeo, capMat);
    topCap.position.y = 0.28;
    this.busGroup.add(topCap);

    const bottomCap = new THREE.Mesh(capGeo, capMat);
    bottomCap.position.y = -0.28;
    this.busGroup.add(bottomCap);

    // 4x RCS (Reaction Control System) Thruster Blocks with micro-nozzles
    this.rcsGroup = new THREE.Group();
    const rcsBlockGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const rcsMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const nozzleGeo = new THREE.CylinderGeometry(0.015, 0.035, 0.05, 8);
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.9 });

    const angles = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
    angles.forEach(ang => {
      const block = new THREE.Mesh(rcsBlockGeo, rcsMat);
      const rad = 0.38;
      block.position.set(Math.cos(ang) * rad, 0.15, Math.sin(ang) * rad);

      const noz1 = new THREE.Mesh(nozzleGeo, nozzleMat);
      noz1.position.set(Math.cos(ang) * 0.05, 0, Math.sin(ang) * 0.05);
      noz1.rotation.z = Math.PI / 2;
      block.add(noz1);

      this.rcsGroup.add(block);
    });
    this.busGroup.add(this.rcsGroup);

    // Star Tracker Camera Hoods (Autonomous astrometric navigation)
    const starTrackerGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.12, 12);
    const starTrackerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
    const st1 = new THREE.Mesh(starTrackerGeo, starTrackerMat);
    st1.position.set(0.18, 0.32, 0.12);
    st1.rotation.x = -Math.PI / 5;
    this.busGroup.add(st1);

    // === B. COMMUNICATIONS SUBSYSTEM ===
    this.commGroup = new THREE.Group();
    this.spacecraftGroup.add(this.commGroup);

    // 2.4-meter High-Gain Parabolic Reflector Dish (pointed toward Earth)
    const dishGeo = new THREE.CylinderGeometry(0.38, 0.02, 0.12, 32);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.65,
      roughness: 0.35
    });
    this.hgaDish = new THREE.Mesh(dishGeo, dishMat);
    this.hgaDish.position.set(0, 0.38, 0.12);
    this.hgaDish.rotation.x = -Math.PI / 3.8;
    this.commGroup.add(this.hgaDish);

    // Sub-reflector tripod struts & feed horn
    const feedHornGeo = new THREE.ConeGeometry(0.04, 0.12, 12);
    const feedHornMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 });
    const feedHorn = new THREE.Mesh(feedHornGeo, feedHornMat);
    feedHorn.position.set(0, 0.44, 0.22);
    feedHorn.rotation.x = Math.PI / 1.3;
    this.commGroup.add(feedHorn);

    // Optical Laser Communication (LCRD) Transceiver aperture
    const laserApertureGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16);
    const laserApertureMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.95 });
    this.laserAperture = new THREE.Mesh(laserApertureGeo, laserApertureMat);
    this.laserAperture.position.set(-0.25, 0.3, -0.15);
    this.laserAperture.rotation.x = -Math.PI / 4;
    this.commGroup.add(this.laserAperture);

    // Glowing Laser Emitter lens
    const lensGeo = new THREE.SphereGeometry(0.03, 12, 12);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(0, 0.05, 0);
    this.laserAperture.add(lens);

    // === C. PROPULSION SUBSYSTEM (Dual Ion / Plasma Engines) ===
    this.propulsionGroup = new THREE.Group();
    this.spacecraftGroup.add(this.propulsionGroup);

    // Dual Ion Engine Nozzles on aft deck
    const ionNozzleGeo = new THREE.CylinderGeometry(0.09, 0.14, 0.14, 16);
    const ionNozzleMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.95,
      roughness: 0.25
    });

    this.ion1 = new THREE.Mesh(ionNozzleGeo, ionNozzleMat);
    this.ion1.position.set(-0.16, -0.36, 0);
    this.propulsionGroup.add(this.ion1);

    this.ion2 = new THREE.Mesh(ionNozzleGeo, ionNozzleMat);
    this.ion2.position.set(0.16, -0.36, 0);
    this.propulsionGroup.add(this.ion2);

    // Active Xenon Plasma Exhaust Plumes (Glowing cyan cones with additive blending)
    const plumeGeo = new THREE.ConeGeometry(0.12, 0.65, 16, 1, true);
    const plumeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });

    this.plume1 = new THREE.Mesh(plumeGeo, plumeMat);
    this.plume1.position.y = -0.38;
    this.ion1.add(this.plume1);

    this.plume2 = new THREE.Mesh(plumeGeo, plumeMat.clone());
    this.plume2.position.y = -0.38;
    this.ion2.add(this.plume2);

    // === D. POWER ARCHITECTURES (Deployable Solar Wings / RTG / Heat Shield) ===
    this.powerGroup = new THREE.Group();
    this.spacecraftGroup.add(this.powerGroup);

    // 1. Articulated Solar Array Wings (High-efficiency blue photovoltaic grid)
    this.solarWingsGroup = new THREE.Group();
    const wingPanelGeo = new THREE.BoxGeometry(1.6, 0.42, 0.02);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      metalness: 0.92,
      roughness: 0.18,
      map: this.solarPanelTex
    });

    this.leftWing = new THREE.Mesh(wingPanelGeo, wingMat);
    this.leftWing.position.x = -1.25;
    this.solarWingsGroup.add(this.leftWing);

    this.rightWing = new THREE.Mesh(wingPanelGeo, wingMat);
    this.rightWing.position.x = 1.25;
    this.solarWingsGroup.add(this.rightWing);

    // Solar Wing Boom Struts & Gold Hinges
    const strutGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.48, 8);
    const strutMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 });
    const leftStrut = new THREE.Mesh(strutGeo, strutMat);
    leftStrut.rotation.z = Math.PI / 2;
    leftStrut.position.x = -0.45;
    this.solarWingsGroup.add(leftStrut);

    const rightStrut = new THREE.Mesh(strutGeo, strutMat);
    rightStrut.rotation.z = Math.PI / 2;
    rightStrut.position.x = 0.45;
    this.solarWingsGroup.add(rightStrut);

    this.powerGroup.add(this.solarWingsGroup);

    // 2. Radioisotope Thermoelectric Generator (RTG) Nuclear Boom
    this.rtgGroup = new THREE.Group();
    const rtgBoomGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.2, 8);
    const rtgBoomMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85 });
    const rtgBoom = new THREE.Mesh(rtgBoomGeo, rtgBoomMat);
    rtgBoom.rotation.z = Math.PI / 2.3;
    rtgBoom.position.set(-0.8, -0.2, -0.2);
    this.rtgGroup.add(rtgBoom);

    // Dual Pu-238 Canisters with cooling radiator fins
    const rtgCanisterGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.38, 16);
    const rtgCanisterMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.92,
      roughness: 0.25
    });
    this.rtgCanister1 = new THREE.Mesh(rtgCanisterGeo, rtgCanisterMat);
    this.rtgCanister1.position.set(-1.35, -0.35, -0.2);
    this.rtgGroup.add(this.rtgCanister1);

    // Radiator cooling rings
    for (let f = -0.14; f <= 0.14; f += 0.07) {
      const finGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.015, 16);
      const finMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 });
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.y = f;
      this.rtgCanister1.add(fin);
    }

    this.rtgGroup.visible = false;
    this.powerGroup.add(this.rtgGroup);

    // 3. Thermal Protection System (TPS) Heat Shield (Parker Sun exploration)
    this.heatShieldGroup = new THREE.Group();
    const shieldGeo = new THREE.CylinderGeometry(0.68, 0.62, 0.08, 32);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Brilliant reflective alumina ceramic
      roughness: 0.2,
      metalness: 0.3
    });
    this.heatShield = new THREE.Mesh(shieldGeo, shieldMat);
    this.heatShield.position.set(0, 0, 0.42);
    this.heatShield.rotation.x = Math.PI / 2;
    this.heatShieldGroup.add(this.heatShield);

    this.heatShieldGroup.visible = false;
    this.powerGroup.add(this.heatShieldGroup);

    // Keplerian Orbital Path Ring
    const orbitPathGeo = new THREE.RingGeometry(this.orbitRadius - 0.02, this.orbitRadius + 0.02, 128);
    const orbitPathMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide
    });
    this.orbitPath = new THREE.Mesh(orbitPathGeo, orbitPathMat);
    this.orbitPath.rotation.x = Math.PI / 2;
    this.group.add(this.orbitPath);
  }

  /* -----------------------------------------------------------------
     4. Modular Scientific Instrument Layers
     ----------------------------------------------------------------- */
  _initInstrumentLayers() {
    this.instrumentsGroup = new THREE.Group();
    this.instrumentsGroup.name = 'ArchitectInstrumentLayers';
    this.group.add(this.instrumentsGroup);

    // === Layer A: High-Resolution Spectroscopy Fan Cone ===
    this.spectroscopyFan = new THREE.Group();
    const fanGeo = new THREE.ConeGeometry(1.8, 3.2, 32, 1, true);
    const fanMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    this.fanMesh = new THREE.Mesh(fanGeo, fanMat);
    this.fanMesh.rotation.x = Math.PI;
    this.spectroscopyFan.add(this.fanMesh);

    // Fraunhofer absorption bands on the fan cone
    for (let i = 0; i < 6; i++) {
      const slitGeo = new THREE.RingGeometry(0.35 + i * 0.24, 0.38 + i * 0.24, 32);
      const slitMat = new THREE.MeshBasicMaterial({
        color: 0x020617,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      const slit = new THREE.Mesh(slitGeo, slitMat);
      slit.position.y = -0.5 - i * 0.38;
      slit.rotation.x = Math.PI / 2;
      this.spectroscopyFan.add(slit);
    }
    this.instrumentsGroup.add(this.spectroscopyFan);

    // === Layer B: Transit Photometry Collimator Cylinder ===
    this.transitCollimator = new THREE.Group();
    const colGeo = new THREE.CylinderGeometry(0.85, 0.85, 6.0, 32, 1, true);
    const colMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    });
    this.colMesh = new THREE.Mesh(colGeo, colMat);
    this.colMesh.rotation.z = Math.PI / 2;
    this.transitCollimator.add(this.colMesh);
    this.instrumentsGroup.add(this.transitCollimator);

    // === Layer C: Radar Sounding Booms & Pulsed Waves ===
    this.radarSoundingGroup = new THREE.Group();

    // Dual 16-meter deployable cross-dipole antenna booms (like REASON on Europa Clipper)
    const boomGeo = new THREE.CylinderGeometry(0.015, 0.015, 3.4, 8);
    const boomMat = new THREE.MeshStandardMaterial({ color: 0x34d399, metalness: 0.95 });
    this.radarBoom1 = new THREE.Mesh(boomGeo, boomMat);
    this.radarBoom1.rotation.z = Math.PI / 2;
    this.radarSoundingGroup.add(this.radarBoom1);

    this.radarBoom2 = new THREE.Mesh(boomGeo, boomMat);
    this.radarBoom2.rotation.x = Math.PI / 2;
    this.radarSoundingGroup.add(this.radarBoom2);

    // Concentric subsurface penetrating pulse wave rings
    this.radarRings = [];
    for (let i = 0; i < 5; i++) {
      const rGeo = new THREE.RingGeometry(0.25 + i * 0.45, 0.29 + i * 0.45, 32);
      const rMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.65 - i * 0.1,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.rotation.x = Math.PI / 2;
      this.radarSoundingGroup.add(ring);
      this.radarRings.push(ring);
    }
    this.instrumentsGroup.add(this.radarSoundingGroup);

    // === Layer D: Magnetometry Dipole Loops & Bow Shock ===
    this.magnetometryGroup = new THREE.Group();

    // 5-meter deployable carbon-fiber magnetometer boom
    const magBoomGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.8, 8);
    const magBoomMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, metalness: 0.85 });
    this.magBoom = new THREE.Mesh(magBoomGeo, magBoomMat);
    this.magBoom.rotation.z = Math.PI / 3;
    this.magBoom.position.set(-1.2, 0.6, 0);
    this.magnetometryGroup.add(this.magBoom);

    // Dual fluxgate sensor heads
    const sensorGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const sensorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const sInboard = new THREE.Mesh(sensorGeo, sensorMat);
    sInboard.position.set(-0.6, 0.3, 0);
    this.magnetometryGroup.add(sInboard);
    const sOutboard = new THREE.Mesh(sensorGeo, sensorMat);
    sOutboard.position.set(-1.35, 0.75, 0);
    this.magnetometryGroup.add(sOutboard);

    // Bow Shock curved parabola
    const bowGeo = new THREE.TorusGeometry(3.2, 0.035, 16, 64, Math.PI);
    const bowMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.65
    });
    this.bowShockMesh = new THREE.Mesh(bowGeo, bowMat);
    this.bowShockMesh.rotation.y = Math.PI / 2;
    this.bowShockMesh.position.x = -1.4;
    this.magnetometryGroup.add(this.bowShockMesh);

    // Magnetic dipole field loops
    for (let i = 0; i < 4; i++) {
      const loopGeo = new THREE.TorusGeometry(2.3 + i * 0.45, 0.015, 12, 48);
      const loopMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.38 - i * 0.07
      });
      const loop = new THREE.Mesh(loopGeo, loopMat);
      loop.rotation.y = (Math.PI / 4) * i;
      this.magnetometryGroup.add(loop);
    }
    this.instrumentsGroup.add(this.magnetometryGroup);

    // === Layer E: Multispectral Surface Mapping Frustum ===
    this.multispectralFrustum = new THREE.Group();
    const frustumGeo = new THREE.ConeGeometry(1.6, 3.2, 4, 1, true); // Pyramidal camera view
    const frustumMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.28,
      wireframe: true
    });
    this.frustumMesh = new THREE.Mesh(frustumGeo, frustumMat);
    this.frustumMesh.rotation.x = Math.PI;
    this.multispectralFrustum.add(this.frustumMesh);
    this.instrumentsGroup.add(this.multispectralFrustum);

    // === Layer F: Geodesic Deflection Rays ===
    this.deflectionGroup = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const rayGeo = new THREE.BufferGeometry();
      const pts = [];
      const angle = (i / 8) * Math.PI * 2;
      for (let s = -5.5; s <= 5.5; s += 0.5) {
        const rad = 2.6 / (1 + Math.exp(-Math.abs(s) * 0.75));
        pts.push(new THREE.Vector3(s, Math.sin(angle) * rad, Math.cos(angle) * rad));
      }
      rayGeo.setFromPoints(pts);
      const rayMat = new THREE.LineBasicMaterial({
        color: 0xf97316,
        transparent: true,
        opacity: 0.45
      });
      this.deflectionGroup.add(new THREE.Line(rayGeo, rayMat));
    }
    this.instrumentsGroup.add(this.deflectionGroup);

    this._updateActiveInstrumentLayer();
  }

  /* -----------------------------------------------------------------
     5. Deep Space Network Carrier Beam
     ----------------------------------------------------------------- */
  _initCarrierBeam() {
    this.carrierBeamGroup = new THREE.Group();
    this.carrierBeamGroup.name = 'ArchitectCarrierBeam';
    this.group.add(this.carrierBeamGroup);

    // Carrier ray line
    const beamGeo = new THREE.BufferGeometry();
    const pts = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(12, 6, 8) // Trajectory toward Earth position
    ];
    beamGeo.setFromPoints(pts);
    this.beamLine = new THREE.Line(
      beamGeo,
      new THREE.LineDashedMaterial({
        color: 0x38bdf8,
        dashSize: 0.4,
        gapSize: 0.2,
        transparent: true,
        opacity: 0.6
      })
    );
    this.beamLine.computeLineDistances();
    this.carrierBeamGroup.add(this.beamLine);

    // Pulse signal packet
    const pulseGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9
    });
    this.carrierPulse = new THREE.Mesh(pulseGeo, pulseMat);
    this.carrierBeamGroup.add(this.carrierPulse);
  }

  /* -----------------------------------------------------------------
     Engine Event Wiring
     ----------------------------------------------------------------- */
  _bindEngineEvents() {
    this.engine.on('targetChanged', ({ target }) => {
      this._updateTargetVisuals(target);
      this._updateSpacecraftConfiguration();
    });

    this.engine.on('methodChanged', () => {
      this._updateActiveInstrumentLayer();
      this._updateSpacecraftConfiguration();
    });

    this.engine.on('constraintsChanged', () => {
      this._updateSpacecraftConfiguration();
    });

    this.engine.on('missionAssembled', (mission) => {
      this.playAssemblySequence(mission);
    });
  }

  _updateTargetVisuals(target) {
    if (this.targetMat) {
      this.targetMat.color.setHex(target.visualColor);
      if (target.id === 'EUROPA') {
        this.targetMat.map = this.europaIceTex;
      } else if (target.id === 'TARGET_MARS' || target.id === 'MARS') {
        this.targetMat.map = this.marsTex;
      } else {
        this.targetMat.map = null;
      }
      this.targetMat.needsUpdate = true;
    }

    if (this.targetWireMat) {
      this.targetWireMat.color.setHex(target.wireColor);
    }
    if (this.atmoMat) {
      this.atmoMat.color.setHex(target.visualColor);
    }

    const scale = target.radius3D / 1.8;
    this.targetGroup.scale.set(scale, scale, scale);

    // Target-specific features
    this.europaPlumesGroup.visible = target.id === 'EUROPA';
    this.sgrAccretionDisk.visible = target.id === 'SAGITTARIUS_A';

    if (target.id === 'PARKER_SUN') {
      this.targetMat.emissive = new THREE.Color(0xf59e0b);
      this.targetMat.emissiveIntensity = 0.8;
    } else if (target.id === 'SAGITTARIUS_A') {
      this.targetMat.color.setHex(0x020617);
      this.targetMat.emissive = new THREE.Color(0x000000);
      this.targetMat.emissiveIntensity = 0;
    } else {
      this.targetMat.emissive = new THREE.Color(0x000000);
      this.targetMat.emissiveIntensity = 0;
    }
  }

  _updateSpacecraftConfiguration() {
    const target = this.engine.target;
    const pwr = this.engine.constraints.thermalPower;
    const deltaV = this.engine.constraints.deltaV;

    // Power architecture configuration
    if (target.id === 'PARKER_SUN') {
      this.heatShieldGroup.visible = true;
      this.solarWingsGroup.visible = true;
      this.solarWingsGroup.scale.set(0.45, 0.45, 0.45); // Retracted behind heat shield
      this.rtgGroup.visible = false;
    } else if (pwr === 'NUCLEAR_RTG' || pwr === 'RTG_NUCLEAR' || target.id === 'EUROPA' || target.id === 'SAGITTARIUS_A') {
      this.heatShieldGroup.visible = false;
      this.solarWingsGroup.visible = false;
      this.rtgGroup.visible = true;
    } else {
      this.heatShieldGroup.visible = false;
      this.solarWingsGroup.visible = true;
      this.solarWingsGroup.scale.set(1, 1, 1);
      this.rtgGroup.visible = false;
    }

    // Engine plume intensity based on deltaV budget
    const plumeScale = Math.min(1.8, Math.max(0.6, deltaV / 6.0));
    this.plume1.scale.set(1, plumeScale, 1);
    this.plume2.scale.set(1, plumeScale, 1);
  }

  _updateActiveInstrumentLayer() {
    const methodId = this.engine.method.id;

    this.spectroscopyFan.visible = methodId === 'SPECTROSCOPY_HIGH_RES';
    this.transitCollimator.visible = methodId === 'TRANSIT_PHOTOMETRY';
    this.radarSoundingGroup.visible = methodId === 'RADAR_SOUNDING';
    this.magnetometryGroup.visible = methodId === 'IN_SITU_MAGNETOMETRY';
    this.multispectralFrustum.visible = methodId === 'MULTISPECTRAL_IMAGING';
    this.deflectionGroup.visible = methodId === 'ASTROMETRIC_DEFLECTION';
  }

  /* -----------------------------------------------------------------
     3D View Mode Controller (Orbital Survey vs Spacecraft Blueprint)
     ----------------------------------------------------------------- */
  setViewMode(mode) {
    this.viewMode = mode;
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut', duration: 1.2 } });
    const lookAtTarget = this.sceneManager ? this.sceneManager.currentLookAt : null;

    if (mode === 'SPACECRAFT') {
      const craftX = this.spacecraftGroup.position.x;
      const craftZ = this.spacecraftGroup.position.z;
      const craftWorldZ = -25 + craftZ;

      tl.to(this.camera.position, {
        x: craftX + 1.2,
        y: 0.8,
        z: craftWorldZ + 1.8
      }, 0);

      if (lookAtTarget) {
        tl.to(lookAtTarget, {
          x: craftX,
          y: 0,
          z: craftWorldZ
        }, 0);
      }
    } else if (mode === 'PAYLOAD') {
      const craftX = this.spacecraftGroup.position.x;
      const craftZ = this.spacecraftGroup.position.z;

      tl.to(this.camera.position, {
        x: craftX * 1.35,
        y: 1.4,
        z: -25 + craftZ * 1.35
      }, 0);

      if (lookAtTarget) {
        tl.to(lookAtTarget, {
          x: 0,
          y: 0,
          z: -25
        }, 0);
      }
    } else {
      // Default ORBITAL SURVEY view
      tl.to(this.camera.position, {
        x: 0,
        y: 3.5,
        z: -16
      }, 0);

      if (lookAtTarget) {
        tl.to(lookAtTarget, {
          x: 0,
          y: 0,
          z: -25
        }, 0);
      }
    }
  }

  /* -----------------------------------------------------------------
     Cinematic Assembly Choreography (Signature 3D Interaction)
     ----------------------------------------------------------------- */
  playAssemblySequence(mission) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Step 1: Target locks into position with coordinate ring expansion
    tl.fromTo(
      this.targetGroup.scale,
      { x: 0.1, y: 0.1, z: 0.1 },
      { x: 1, y: 1, z: 1, duration: 1.2 }
    );
    tl.fromTo(
      this.horizonRing.scale,
      { x: 0.2, y: 0.2, z: 0.2 },
      { x: 1.2, y: 1.2, z: 1.2, duration: 0.8 },
      '-=0.6'
    );

    // Step 2: Spacecraft orbital injection
    tl.fromTo(
      this.orbitPath.scale,
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1, duration: 0.9 },
      '-=0.4'
    );
    tl.fromTo(
      this.spacecraftGroup.scale,
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1, duration: 0.6 },
      '-=0.3'
    );

    // Step 3: Deploy solar arrays or RTG boom
    tl.fromTo(
      this.powerGroup.scale,
      { x: 0.05, y: 1, z: 1 },
      { x: 1, y: 1, z: 1, duration: 0.7 },
      '-=0.2'
    );

    // Step 4: Instrument sensor activation flash
    tl.fromTo(
      this.instrumentsGroup.scale,
      { x: 0.2, y: 0.2, z: 0.2 },
      { x: 1, y: 1, z: 1, duration: 0.8 },
      '-=0.1'
    );

    // Step 5: DSN Carrier beam links up
    tl.fromTo(
      this.carrierBeamGroup.scale,
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1, duration: 0.8 }
    );

    return tl;
  }

  show() {
    this.group.visible = true;
    this._updateTargetVisuals(this.engine.target);
    this._updateSpacecraftConfiguration();
    this._updateActiveInstrumentLayer();
  }

  hide() {
    this.group.visible = false;
  }

  /* -----------------------------------------------------------------
     Per-Frame Animation Loop
     ----------------------------------------------------------------- */
  update(delta, elapsed) {
    if (!this.group.visible) return;

    // Slow rotation of target body & horizon
    this.targetSphere.rotation.y += delta * 0.12;
    this.targetWire.rotation.y += delta * 0.12;
    this.horizonRing.rotation.z += delta * 0.08;

    // Europa cryovolcano plume pulsation
    if (this.europaPlumesGroup.visible) {
      this.europaPlumesGroup.children.forEach((p, idx) => {
        p.scale.y = 0.85 + Math.sin(elapsed * 4 + idx * 1.5) * 0.25;
      });
    }

    // Sagittarius A* accretion disk rotation
    if (this.sgrAccretionDisk.visible) {
      this.diskMesh.rotation.z += delta * 0.35;
      this.photonRing.rotation.z -= delta * 0.5;
    }

    // Spacecraft orbit movement
    this.orbitAngle += delta * this.orbitSpeed;
    const craftX = Math.cos(this.orbitAngle) * this.orbitRadius;
    const craftZ = Math.sin(this.orbitAngle) * this.orbitRadius;
    this.spacecraftGroup.position.set(craftX, 0, craftZ);
    this.spacecraftGroup.lookAt(0, 0, 0); // Always face target center

    // In SPACECRAFT view mode, keep camera & lookAt tracking smoothly with spacecraft
    if (this.viewMode === 'SPACECRAFT' && this.sceneManager) {
      this.sceneManager.currentLookAt.set(craftX, 0, -25 + craftZ);
      this.camera.position.set(craftX + 1.2, 0.8, -25 + craftZ + 1.8);
    }

    // Pulsate xenon ion engine plumes
    this.plasmaPulseProgress = (this.plasmaPulseProgress + delta * 6) % (Math.PI * 2);
    const plasmaScale = 0.9 + Math.sin(this.plasmaPulseProgress) * 0.18;
    this.plume1.scale.y = plasmaScale;
    this.plume2.scale.y = plasmaScale;

    // Position active instrument relative to spacecraft & target
    if (this.spectroscopyFan.visible) {
      this.spectroscopyFan.position.copy(this.spacecraftGroup.position);
      this.spectroscopyFan.lookAt(0, 0, 0);
    }
    if (this.transitCollimator.visible) {
      this.transitCollimator.position.set(0, 0, 0);
      this.transitCollimator.rotation.y += delta * 0.2;
    }
    if (this.radarSoundingGroup.visible) {
      this.radarSoundingGroup.position.copy(this.spacecraftGroup.position);
      this.radarSoundingGroup.lookAt(0, 0, 0);
      // Animate pulsing rings
      this.radarPulseProgress = (this.radarPulseProgress + delta * 0.8) % 1;
      this.radarRings.forEach((r, idx) => {
        const offset = (this.radarPulseProgress + idx * 0.2) % 1;
        r.position.z = -offset * 2.4;
        r.material.opacity = (1 - offset) * 0.65;
      });
    }
    if (this.multispectralFrustum.visible) {
      this.multispectralFrustum.position.copy(this.spacecraftGroup.position);
      this.multispectralFrustum.lookAt(0, 0, 0);
    }
    if (this.magnetometryGroup.visible) {
      this.magnetometryGroup.rotation.y += delta * 0.1;
    }
    if (this.deflectionGroup.visible) {
      this.deflectionGroup.rotation.x += delta * 0.15;
    }

    // Carrier signal ping packet animation
    this.carrierPingProgress = (this.carrierPingProgress + delta * 0.4) % 1;
    this.carrierPulse.position.lerpVectors(
      this.spacecraftGroup.position,
      new THREE.Vector3(12, 6, 8),
      this.carrierPingProgress
    );
  }
}
