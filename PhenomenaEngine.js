/**
 * PhenomenaEngine.js — Flagship Phenomena State & Data Manager
 * 
 * Coordinates the 8 Signature Visual Experiences for Phase 8:
 *   1. COSMIC_SCALE (Powers of Ten: Human -> Planet -> Solar System -> Stellar -> Galactic)
 *   2. LIGHT_TIME (Lookback propagation & contemporary source state vs observed state)
 *   3. EXOPLANET_DETECTION (Limb-darkened star, planetary transit chord, light curve dip, Doppler wobble)
 *   4. SPECTRUM_LAB (Continuous blackbody Wien peak, Fraunhofer absorption lines, atomic fingerprints)
 *   5. GRAVITY_FIELD (Spacetime metric deformation, geodesic deflection, gravitational lensing ring)
 *   6. SPACE_WEATHER (Parker spiral solar wind, Earth magnetosphere bow shock, auroral precipitation)
 *   7. SPACECRAFT_NAVIGATION (Hohmann transfer ellipse, Delta-V impulse burns, flight timeline)
 *   8. DATA_SCULPTURE (Harmonic resonance parametric manifold, LIGO GW150914 chirp, p-mode oscillation)
 */

export const PHENOMENA_REGISTRY = {
  COSMIC_SCALE: {
    id: 'COSMIC_SCALE',
    index: '01',
    name: 'COSMIC SCALE // POWERS OF TEN',
    subtitle: 'Exponential Spatial Transformation across 21 Orders of Magnitude',
    scientificBadge: 'EDUCATIONAL VISUALIZATION',
    source: 'NASA Cosmic Distance Ladder / Powers of Ten (Eames & Morrison)',
    dataset: 'NIST Physical Constants & IAU Metric Astronomical Distances',
    description: 'Explore the staggering reality of astronomical scale from human physiology (1 meter) through planetary radii (10^7 m), heliospheric bounds (10^13 m), the stellar neighborhood (10^17 m), to the spiral disk of the Milky Way (10^21 m).',
    parameters: [
      { id: 'scaleStep', label: 'SCALE REALM', type: 'select', options: ['HUMAN', 'PLANET', 'SOLAR_SYSTEM', 'STELLAR', 'GALAXY'], default: 'PLANET' },
      { id: 'particleDensity', label: 'FIELD RESOLUTION', type: 'range', min: 0.2, max: 1.0, step: 0.1, default: 0.8 }
    ],
    scales: [
      {
        id: 'HUMAN',
        label: 'HUMAN SCALE',
        power: '10⁰ m',
        size: '1.80 m',
        analogy: 'Human Astronaut EVA scale. Molecular and biophysical interaction domain.',
        metric: '1.000 meter reference dimension'
      },
      {
        id: 'PLANET',
        label: 'PLANETARY SCALE',
        power: '10⁷ m',
        size: '12,742 km',
        analogy: 'Earth mean diameter. Surface area 510 million km². Atmosphere is a razor-thin 100 km boundary layer.',
        metric: '12,742,000 meters'
      },
      {
        id: 'SOLAR_SYSTEM',
        label: 'SOLAR SYSTEM',
        power: '10¹³ m',
        size: '30.0 AU (~4.5B km)',
        analogy: 'Neptune orbital diameter. If Earth were 1 mm across, the Sun would be 12 meters away and Neptune 350 meters.',
        metric: '4.498 × 10¹² meters'
      },
      {
        id: 'STELLAR',
        label: 'STELLAR NEIGHBORHOOD',
        power: '10¹⁷ m',
        size: '10.0 Light Years',
        analogy: 'Interstellar void encompassing Alpha Centauri (4.37 ly), Barnard’s Star (5.96 ly), and Sirius (8.6 ly). Space is predominantly empty.',
        metric: '9.461 × 10¹⁶ meters'
      },
      {
        id: 'GALAXY',
        label: 'MILKY WAY GALAXY',
        power: '10²¹ m',
        size: '100,000 Light Years',
        analogy: 'Barred spiral galaxy harboring ~200-400 billion stars. Our Solar System orbits the galactic center at 230 km/s every 230 million years.',
        metric: '9.461 × 10²⁰ meters'
      }
    ]
  },

  LIGHT_TIME: {
    id: 'LIGHT_TIME',
    index: '02',
    name: 'LIGHT-TIME // LOOKBACK ARTIFACT',
    subtitle: 'Relativistic Signal Propagation & Asynchronous Cosmic States',
    scientificBadge: 'REAL DATA & PHYSICAL RELATIVITY',
    source: 'Speed of Light c = 299,792.458 km/s (BIPM SI Definition)',
    dataset: 'JPL Horizons Ephemerides & ESA Gaia DR3 Astrometric Distances',
    description: 'Because electromagnetic radiation propagates at a finite speed (c), every astronomical observation is an image of the past. The physical state of the emitter has continued evolving during the transit of its photons.',
    parameters: [
      { id: 'targetSource', label: 'EMITTING SOURCE', type: 'select', options: ['MOON', 'SUN', 'MARS', 'VOYAGER_1', 'PROXIMA', 'TRAPPIST_1', 'CRAB_NEBULA', 'ANDROMEDA'], default: 'SUN' },
      { id: 'playbackProgress', label: 'PHOTON TRAIN POSITION', type: 'range', min: 0, max: 1, step: 0.01, default: 0.65 }
    ],
    targets: {
      MOON: {
        name: 'Earth’s Moon',
        distanceKm: '384,400 km',
        latency: '1.28 seconds',
        observedAs: 'Lunar surface as it was 1.28 seconds ago.',
        sourceNow: 'Essentially identical; tidal deceleration adds ~3.8 cm/year recession.'
      },
      SUN: {
        name: 'The Sun (1 AU)',
        distanceKm: '149,597,870 km',
        latency: '8 minutes 19 seconds',
        observedAs: 'Photosphere granulations and flares as they radiated 8.3 minutes ago.',
        sourceNow: 'A solar flare erupting now is invisible until the 8.3-minute travel time has elapsed.'
      },
      MARS: {
        name: 'Mars at Conjunction/Opposition',
        distanceKm: '78,300,000 km (Avg)',
        latency: '4 minutes 21 seconds',
        observedAs: 'Surface rovers seen with 4.35-minute one-way radio delay.',
        sourceNow: 'Autonomous landing software must operate independently without Earth teleoperation.'
      },
      VOYAGER_1: {
        name: 'Voyager 1 (Interstellar Space)',
        distanceKm: '24,500,000,000 km (163.8 AU)',
        latency: '22 hours 42 minutes',
        observedAs: 'DSN carrier wave telemetry received nearly a full Earth day late.',
        sourceNow: 'The spacecraft has traveled another 1.4 million km while the signal traversed the void.'
      },
      PROXIMA: {
        name: 'Proxima Centauri',
        distanceKm: '40.17 trillion km (4.246 ly)',
        latency: '4.246 years',
        observedAs: 'Flares observed today were emitted 4.25 years ago in Earth’s calendar.',
        sourceNow: 'Planetary climate on Proxima b has undergone over 1,500 planetary orbits.'
      },
      TRAPPIST_1: {
        name: 'TRAPPIST-1 System',
        distanceKm: '374.6 trillion km (39.6 ly)',
        latency: '39.6 years',
        observedAs: 'Transits captured by JWST depict 1980s emission.',
        sourceNow: 'Planets have orbited thousands of times; internal geodynamics have progressed.'
      },
      CRAB_NEBULA: {
        name: 'Crab Nebula Supernova Remnant',
        distanceKm: '6.15 × 10¹⁶ km (6,500 ly)',
        latency: '6,500 years',
        observedAs: 'Supernova explosion seen by astronomers in 1054 CE actually occurred in ~5446 BCE.',
        sourceNow: 'The central pulsar has spun over 6 trillion times since the light we see left it.'
      },
      ANDROMEDA: {
        name: 'Andromeda Galaxy (M31)',
        distanceKm: '2.40 × 10¹⁹ km (2.537 million ly)',
        latency: '2,537,000 years',
        observedAs: 'Light leaving Andromeda when Australopithecus walked on Earth.',
        sourceNow: 'Entire generations of massive stars have exploded; galaxy is 2.5 million years closer to collision with the Milky Way.'
      }
    }
  },

  EXOPLANET_DETECTION: {
    id: 'EXOPLANET_DETECTION',
    index: '03',
    name: 'EXOPLANET DETECTION // TRANSIT PHOTOMETRY',
    subtitle: 'Extracting Planetary Radii, Orbits, and Atmospheres from Periodic Stellar Dips',
    scientificBadge: 'REAL SCIENTIFIC METHODOLOGY',
    source: 'NASA Exoplanet Archive / Kepler, TESS, and JWST Missions',
    dataset: 'Stellar Limb Darkening Models (Claret 2000) & Mandel-Agol Light Curves',
    description: 'When an exoplanet transits its host star along our line of sight, it blocks a minute fraction of starlight proportional to (Rp / Rstar)². Synchronized spectroscopic radial velocity reveals the stellar wobble caused by gravitational mutual attraction.',
    parameters: [
      { id: 'inclination', label: 'ORBITAL INCLINATION (deg)', type: 'range', min: 82, max: 90, step: 0.1, default: 89.2 },
      { id: 'planetRadius', label: 'PLANET RADIUS (R_Jup)', type: 'range', min: 0.4, max: 1.8, step: 0.05, default: 1.15 },
      { id: 'orbitPeriod', label: 'ORBITAL PERIOD (Days)', type: 'range', min: 1.5, max: 8.0, step: 0.5, default: 3.5 },
      { id: 'transitScrubber', label: 'ORBITAL PHASE', type: 'range', min: 0, max: 1, step: 0.005, default: 0.5 }
    ],
    derivedEquations: {
      depth: 'Transit Depth ΔF/F = (Rp / R★)² × 100%',
      velocity: 'Radial Velocity Semi-amplitude K = (2πG/P)^(1/3) × (Mp sin i)/(M★^(2/3))',
      impact: 'Impact Parameter b = (a cos i) / R★'
    }
  },

  SPECTRUM_LAB: {
    id: 'SPECTRUM_LAB',
    index: '04',
    name: 'SPECTRUM LAB // SPECTROSCOPIC ANALYSIS',
    subtitle: 'Decoding Chemical Fingerprints, Temperature, and Velocities from Dispersed Light',
    scientificBadge: 'EMPIRICAL ATOMIC PHYSICS',
    source: 'NIST Atomic Spectra Database & Fraunhofer Absorption Line Catalog',
    dataset: 'Harvard Spectral Classification & JWST NIRSpec Transmission Spectra',
    description: 'Astronomers cannot travel to distant stars, but their photons carry intrinsic atomic fingerprints. By dispersing light into its constituent wavelengths, dark absorption lines reveal which chemical elements absorb specific quantized energy states.',
    parameters: [
      { id: 'sourceType', label: 'STELLAR SOURCE', type: 'select', options: ['SUN_G2V', 'RIGEL_B8IA', 'PROXIMA_M5V', 'RING_NEBULA_EMISSION', 'WASP96B_ATMOSPHERE'], default: 'SUN_G2V' },
      { id: 'wavelengthProbe', label: 'ANALYZER WAVELENGTH (nm)', type: 'range', min: 380, max: 750, step: 1, default: 589 }
    ],
    sources: {
      SUN_G2V: {
        name: 'Solar Photosphere (G2V)',
        temp: '5,778 K',
        peakWavelength: '502 nm (Visible Green-Yellow)',
        nature: 'Continuous thermal blackbody interrupted by hundreds of Fraunhofer absorption notches in the cooler solar chromosphere.',
        keyLines: [
          { name: 'Ca II K', lambda: 393.4, element: 'Ionized Calcium' },
          { name: 'Ca II H', lambda: 396.8, element: 'Ionized Calcium' },
          { name: 'H-beta', lambda: 486.1, element: 'Hydrogen Balmer' },
          { name: 'Mg b', lambda: 517.3, element: 'Magnesium' },
          { name: 'Na D1/D2', lambda: 589.0, element: 'Sodium Doublet' },
          { name: 'H-alpha', lambda: 656.3, element: 'Hydrogen Balmer' }
        ]
      },
      RIGEL_B8IA: {
        name: 'Rigel (B8 Ia Blue Supergiant)',
        temp: '12,100 K',
        peakWavelength: '240 nm (Ultraviolet)',
        nature: 'Intensely hot stellar wind and radiation field; strong neutral Helium and ionized metals dominate.',
        keyLines: [
          { name: 'He I', lambda: 447.1, element: 'Neutral Helium' },
          { name: 'H-gamma', lambda: 434.0, element: 'Hydrogen Balmer' },
          { name: 'H-beta', lambda: 486.1, element: 'Hydrogen Balmer' },
          { name: 'He I', lambda: 587.6, element: 'Helium D3' },
          { name: 'H-alpha', lambda: 656.3, element: 'Hydrogen Balmer' }
        ]
      },
      PROXIMA_M5V: {
        name: 'Proxima Centauri (M5.5V Red Dwarf)',
        temp: '3,050 K',
        peakWavelength: '950 nm (Near-Infrared)',
        nature: 'Cool low-mass atmosphere allows complex diatomic molecules (TiO, VO, CaH) to survive, carving broad molecular absorption bands.',
        keyLines: [
          { name: 'TiO Bandhead', lambda: 495.5, element: 'Titanium Oxide' },
          { name: 'TiO Bandhead', lambda: 544.8, element: 'Titanium Oxide' },
          { name: 'Na D', lambda: 589.0, element: 'Strong Sodium' },
          { name: 'K I', lambda: 769.9, element: 'Potassium' }
        ]
      },
      RING_NEBULA_EMISSION: {
        name: 'Ring Nebula M57 (Ionized Gas)',
        temp: '10,000 K (Electron Temp)',
        peakWavelength: '500.7 nm (Emission)',
        nature: 'Low-density photoionized gas producing narrow, intense emission spikes rather than a continuum.',
        keyLines: [
          { name: '[O II]', lambda: 372.7, element: 'Forbidden Oxygen II' },
          { name: 'H-beta', lambda: 486.1, element: 'Hydrogen Recombination' },
          { name: '[O III]', lambda: 500.7, element: 'Double Ionized Oxygen (Cyan Glow)' },
          { name: '[N II]', lambda: 654.8, element: 'Forbidden Nitrogen' },
          { name: 'H-alpha', lambda: 656.3, element: 'Hydrogen Recombination' }
        ]
      },
      WASP96B_ATMOSPHERE: {
        name: 'WASP-96b Transmission Spectrum (JWST)',
        temp: '1,285 K',
        peakWavelength: '1,400 nm (Infrared)',
        nature: 'Starlight filtered through the atmospheric limb of a puffy gas giant, revealing distinct water vapor and cloud haze signatures.',
        keyLines: [
          { name: 'Na Doublet', lambda: 589.3, element: 'Sodium (Broadened)' },
          { name: 'K I', lambda: 769.9, element: 'Potassium' },
          { name: 'H2O Band 1', lambda: 950.0, element: 'Water Vapor H2O' },
          { name: 'H2O Band 2', lambda: 1150.0, element: 'Water Vapor H2O' },
          { name: 'H2O Band 3', lambda: 1400.0, element: 'Water Vapor H2O (Primary)' }
        ]
      }
    }
  },

  GRAVITY_FIELD: {
    id: 'GRAVITY_FIELD',
    index: '05',
    name: 'GRAVITY & SPACETIME // METRIC DEFLECTION',
    subtitle: 'General Relativistic Curvature, Geodesic Bending, and Gravitational Lensing',
    scientificBadge: 'GENERAL RELATIVITY // SCHWARZSCHILD GEODESICS',
    source: 'Einstein Field Equations G_μν = (8πG/c⁴) T_μν (1915)',
    dataset: 'Schwarzschild Metric & Eddington Solar Eclipse Deflection (1919) / Hubble Frontier Fields',
    description: 'Mass does not pull objects with an invisible mechanical hook; mass curves the 4-dimensional fabric of spacetime. Matter and light follow the straightest possible paths (geodesics) through this warped geometry, bending light around cosmic giants to produce Einstein rings.',
    parameters: [
      { id: 'sourceMass', label: 'GRAVITATING COMPACT MASS', type: 'select', options: ['WHITE_DWARF_1M', 'STELLAR_BLACK_HOLE_10M', 'SUPERMASSIVE_SGR_A_4M'], default: 'STELLAR_BLACK_HOLE_10M' },
      { id: 'curvatureIntensity', label: 'WARP AMPLIFICATION', type: 'range', min: 0.5, max: 2.0, step: 0.1, default: 1.0 },
      { id: 'photonBeamCount', label: 'GEODESIC PROBE RAYS', type: 'range', min: 8, max: 32, step: 4, default: 16 }
    ],
    massProfiles: {
      WHITE_DWARF_1M: {
        name: 'Sirius B Type White Dwarf (1.0 M☉)',
        massSolar: '1.0 M☉',
        schwarzschildRadius: '2.95 km (Actual radius ~5,800 km)',
        deflectionAngle: '1.75 arcsec (Solar Limb equivalent)',
        lensingType: 'Weak Gravitational Deflection',
        physicsNote: 'Dense degenerate electron matter. Does not collapse past Chandrasekhar limit (1.4 M☉).'
      },
      STELLAR_BLACK_HOLE_10M: {
        name: 'Cygnus X-1 Stellar Black Hole (10.0 M☉)',
        massSolar: '10.0 M☉',
        schwarzschildRadius: '29.5 km',
        deflectionAngle: 'Relativistic multiple imaging & strong deflection',
        lensingType: 'Strong Field Lensing + Photon Sphere at r = 1.5 Rs',
        physicsNote: 'Light orbiting at r = 44.25 km can undergo multiple loops before escaping or falling past event horizon.'
      },
      SUPERMASSIVE_SGR_A_4M: {
        name: 'Sagittarius A* Galactic Center (4.15 × 10⁶ M☉)',
        massSolar: '4,154,000 M☉',
        schwarzschildRadius: '12.27 million km (0.082 AU)',
        deflectionAngle: 'Severe Metric Warping & Complete Einstein Ring formation',
        lensingType: 'Galactic Scale Gravitational Lens (EHT Shadow)',
        physicsNote: 'Frame dragging (Kerr metric) twists surrounding spacetime coordinate grid.'
      }
    }
  },

  SPACE_WEATHER: {
    id: 'SPACE_WEATHER',
    index: '06',
    name: 'SPACE WEATHER // HELIOSPHERIC SHIELD',
    subtitle: 'Parker Spiral Solar Wind, Bow Shock Compression, and Auroral Precipitation',
    scientificBadge: 'REAL HELIOPHYSICS // SOHO & SWPC',
    source: 'NOAA Space Weather Prediction Center & NASA Parker Solar Probe',
    dataset: 'OMNIWeb Interplanetary Magnetic Field & Solar Wind Velocity Series',
    description: 'The Sun continuously expands a magnetized supersonic plasma stream into the solar system. Earth’s intrinsic dipole magnetic field acts as a planetary deflector shield, carving a dayside bow shock that channels high-energy particles into the glowing polar auroral ovals.',
    parameters: [
      { id: 'solarWindSpeed', label: 'SOLAR WIND STATE', type: 'select', options: ['QUIET_SLOW', 'CORONAL_HOLE_FAST', 'SEVERE_CME'], default: 'CORONAL_HOLE_FAST' },
      { id: 'imfOrientation', label: 'IMF B_z ORIENTATION', type: 'select', options: ['NORTHWARD_SHIELDED', 'SOUTHWARD_RECONNECTION'], default: 'SOUTHWARD_RECONNECTION' }
    ],
    states: {
      QUIET_SLOW: {
        name: 'Quiet Heliospheric Flow',
        speed: '320 km/s',
        density: '5 protons/cm³',
        dynamicPressure: '1.2 nPa',
        bowShockStandOff: '10.5 Earth Radii (R_E)',
        kpIndex: 'Kp 1 (Quiet)',
        auroralActivity: 'Subtle high-latitude auroral ring (>75° geomagnetic latitude).'
      },
      CORONAL_HOLE_FAST: {
        name: 'High-Speed Coronal Stream',
        speed: '580 km/s',
        density: '12 protons/cm³',
        dynamicPressure: '4.8 nPa',
        bowShockStandOff: '8.2 Earth Radii (R_E)',
        kpIndex: 'Kp 5 (G1 Minor Storm)',
        auroralActivity: 'Vibrant green [O I] 557.7 nm curtains visible down to 55° latitude.'
      },
      SEVERE_CME: {
        name: 'Coronal Mass Ejection Impact (Carrington-class analog)',
        speed: '1,250 km/s',
        density: '45 protons/cm³',
        dynamicPressure: '22.5 nPa',
        bowShockStandOff: '5.2 Earth Radii (Compressed within GEO ring!)',
        kpIndex: 'Kp 9 (G5 Extreme Storm)',
        auroralActivity: 'Blood-red [O I] 630 nm and violet N2+ emissions down to tropical latitudes. Grid induced currents.'
      }
    }
  },

  SPACECRAFT_NAVIGATION: {
    id: 'SPACECRAFT_NAVIGATION',
    index: '07',
    name: 'SPACECRAFT NAVIGATION // INTERPLANETARY TRANSFER',
    subtitle: 'Keplerian Transfer Orbits, Patched Conics, and Impulse Delta-V Maneuvers',
    scientificBadge: 'ASTRODYNAMICS & DSN NAVIGATION',
    source: 'NASA JPL Deep Space Network & Navigation (NAIF / SPICE)',
    dataset: 'Earth-to-Mars Hohmann Transfer Geometry & Delta-V Energy Budgets',
    description: 'Moving between planets is not flying in a straight line; it is altering heliocentric orbital energy. A spacecraft fires its engines to raise its apoapsis until its elliptical transfer trajectory intersects the destination planet’s orbit at the precise arrival rendezvous window.',
    parameters: [
      { id: 'flightProgress', label: 'TRANSFER PROGRESS', type: 'range', min: 0, max: 1, step: 0.005, default: 0.42 },
      { id: 'showVectors', label: 'DISPLAY VELOCITY VECTORS', type: 'checkbox', default: true }
    ],
    milestones: [
      {
        id: 'DEPARTURE',
        phase: 'Trans-Mars Injection (TMI)',
        day: 'Day 000',
        velocity: '11.28 km/s (Hyperbolic Escape)',
        deltaV: '+ 3,600 m/s',
        desc: 'Main stage engine burn raises heliocentric aphelion from Earth’s 1.0 AU orbit to Mars’ 1.524 AU orbit.'
      },
      {
        id: 'MCC1',
        phase: 'Mid-Course Correction (MCC-1)',
        day: 'Day 035',
        velocity: '27.4 km/s Heliocentric',
        deltaV: '+ 28 m/s',
        desc: 'Small thruster pulse corrects launch vehicle injection dispersion using DSN Delta-DOR radio tracking.'
      },
      {
        id: 'CRUISE',
        phase: 'Deep Space Cruise & Star-Tracking',
        day: 'Day 120',
        velocity: '23.8 km/s Heliocentric',
        deltaV: '0 m/s (Coasting)',
        desc: 'Pure gravitational ballistic coasting along the Keplerian ellipse. Optical navigation cameras track Mars against background stars.'
      },
      {
        id: 'ARRIVAL',
        phase: 'Mars Orbit Insertion (MOI) / Aerocapture',
        day: 'Day 210',
        velocity: '5.65 km/s Mars-relative',
        deltaV: '- 2,080 m/s',
        desc: 'Retro-burn decelerates into elliptical Martian capture orbit, or atmospheric friction dissipates kinetic energy.'
      }
    ]
  },

  DATA_SCULPTURE: {
    id: 'DATA_SCULPTURE',
    index: '08',
    name: 'DATA SCULPTURE // HARMONIC TELEMETRY',
    subtitle: 'Dynamic Mathematical Manifolds Shaped Directly by Scientific Telemetry',
    scientificBadge: 'EMPIRICAL WAVEFORM SCULPTURE',
    source: 'LIGO-Virgo Gravitational Wave Collaboration & SDO Helioseismology',
    dataset: 'GW150914 Strain Telemetry & Spherical Harmonic Eigenmodes Y_l^m',
    description: 'Data need not be locked in flat rectangular tables. Here, authentic scientific telemetry—such as the quadrupole gravitational wave chirp of colliding black holes and solar acoustic p-mode oscillations—directly deforms a living 3D parametric spatial manifold.',
    parameters: [
      { id: 'sculptureMode', label: 'TELEMETRY DATASET', type: 'select', options: ['LIGO_GW150914', 'SOLAR_P_MODES', 'CMB_ANISOTROPY'], default: 'LIGO_GW150914' },
      { id: 'frequencyFactor', label: 'HARMONIC FREQUENCY', type: 'range', min: 0.5, max: 3.0, step: 0.1, default: 1.2 },
      { id: 'waveAmplitude', label: 'WAVE AMPLITUDE', type: 'range', min: 0.2, max: 2.0, step: 0.1, default: 1.0 }
    ],
    modes: {
      LIGO_GW150914: {
        name: 'LIGO GW150914 Gravitational Wave Chirp',
        source: 'LIGO Hanford & Livingston Observatories (Sept 14, 2015)',
        formula: 'Quadrupole strain h(t) = (4G/c⁴) × (d²Q/dt²) / r',
        meaning: 'Two black holes of 36 M☉ and 29 M☉ spiraled together at half the speed of light, converting 3.0 solar masses of pure mass into gravitational radiation energy in 0.2 seconds.'
      },
      SOLAR_P_MODES: {
        name: 'Solar Acoustic p-Mode Resonances',
        source: 'SOHO / MDI and SDO / HMI Dopplergrams',
        formula: 'Spherical Harmonic Radial Eigenmodes: ψ(r, θ, φ) = R_nl(r) Y_l^m(θ, φ)',
        meaning: 'Sound waves trapped inside the Sun’s convection zone bounce between the surface and deep interior, ringing the star like a colossal musical bell at 5-minute periods.'
      },
      CMB_ANISOTROPY: {
        name: 'Cosmic Microwave Background Power Spectrum',
        source: 'ESA Planck Satellite (2018 Release)',
        formula: 'Angular Power Spectrum: C_l = ⟨|a_lm|²⟩ across multipoles l = 2 to 2500',
        meaning: 'Acoustic peaks imprinted in the cosmic plasma 380,000 years after the Big Bang, pinning down cosmic baryon density (4.9%), dark matter (26.8%), and dark energy (68.3%).'
      }
    }
  }
};

export class PhenomenaEngine {
  constructor() {
    this.activePhenomenon = PHENOMENA_REGISTRY.COSMIC_SCALE;
    this.paramValues = {};
    this._listeners = new Map();

    // Initialize default parameter values
    this._initDefaults(this.activePhenomenon);
  }

  _initDefaults(phenomenon) {
    if (!phenomenon || !phenomenon.parameters) return;
    this.paramValues[phenomenon.id] = {};
    for (const p of phenomenon.parameters) {
      this.paramValues[phenomenon.id][p.id] = p.default;
    }
  }

  get current() {
    return this.activePhenomenon;
  }

  getParam(paramId) {
    const pGroup = this.paramValues[this.activePhenomenon.id];
    return pGroup ? pGroup[paramId] : undefined;
  }

  setParam(paramId, value) {
    if (!this.paramValues[this.activePhenomenon.id]) {
      this.paramValues[this.activePhenomenon.id] = {};
    }
    this.paramValues[this.activePhenomenon.id][paramId] = value;
    this.emit('paramChanged', {
      phenomenonId: this.activePhenomenon.id,
      paramId,
      value
    });
  }

  setPhenomenon(phenomenonId) {
    if (!PHENOMENA_REGISTRY[phenomenonId] || this.activePhenomenon.id === phenomenonId) return;
    this.activePhenomenon = PHENOMENA_REGISTRY[phenomenonId];
    if (!this.paramValues[phenomenonId]) {
      this._initDefaults(this.activePhenomenon);
    }
    this.emit('phenomenonChanged', this.activePhenomenon);
  }

  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const list = this._listeners.get(event);
    if (!list) return;
    this._listeners.set(event, list.filter(cb => cb !== callback));
  }

  emit(event, data) {
    const list = this._listeners.get(event);
    if (list) {
      for (const cb of list) {
        try {
          cb(data);
        } catch (err) {
          console.error(`[PhenomenaEngine] Listener error on ${event}:`, err);
        }
      }
    }
  }
}

export const phenomenaEngine = new PhenomenaEngine();
