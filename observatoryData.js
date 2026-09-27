/**
 * observatoryData.js — Flagship Scientific Evidence Lab Data Architecture
 * 
 * Provides verified, scientifically grounded investigation cases, evidence items,
 * multi-wavelength observation layers, instrument metadata, and uncertainty frameworks
 * for MISSION // NEXT FRONTIER — PHASE 7.
 * 
 * Every case adheres to the scientific investigation loop:
 *   QUESTION → OBSERVE → SIGNAL/MEASUREMENT → PATTERN → INTERPRETATION → CONCLUSION
 * 
 * Distinguishes strictly between:
 *   - OBSERVED: Empirical, sensor-acquired data
 *   - INFERRED: Logical physical deduction based on evidence
 *   - MODELED: Theoretical framework / mathematical simulation applied
 *   - REMAINS UNCERTAIN: Honest scientific boundaries and instrument limits
 */

export const OBSERVATION_STATUS = {
  STANDBY: 'STANDBY // ARRAY CALIBRATED',
  ACQUIRING: 'ACQUIRING CELESTIAL TARGET…',
  LOCKED: 'TARGET LOCKED // SENSORS ONLINE',
  ANALYZING: 'ANALYZING MULTI-SPECTRAL EVIDENCE',
  EVIDENCE_COMPLETE: 'EVIDENCE COMPLETE // SYNTHESIS UNLOCKED'
};

export const WAVELENGTH_BANDS = {
  VISIBLE: {
    id: 'VISIBLE',
    name: 'VISIBLE OPTICAL',
    range: '380 – 750 nm',
    description: 'Human-visible photons. Reveals surface albedo, stellar photospheres, and direct optical transit dips.',
    color: '#38bdf8'
  },
  INFRARED: {
    id: 'INFRARED',
    name: 'NEAR / MID INFRARED',
    range: '750 nm – 300 µm',
    description: 'Penetrates interstellar dust clouds. Reveals thermal emission, cool M-dwarf stars, and exoplanet molecular atmospheres.',
    color: '#f97316'
  },
  RADIO: {
    id: 'RADIO',
    name: 'MILLIMETER / RADIO',
    range: '1 mm – 100 km',
    description: 'Long wavelengths unhindered by dense galactic dust. Used for VLBI event horizon imaging and DSN telemetry ranging.',
    color: '#a855f7'
  },
  X_RAY: {
    id: 'X_RAY',
    name: 'HIGH-ENERGY X-RAY',
    range: '0.01 – 10 nm',
    description: 'Emitted by extreme relativistic environments: accretion disks near black holes, superheated shockwaves, and coronal flares.',
    color: '#34d399'
  },
  ULTRAVIOLET: {
    id: 'ULTRAVIOLET',
    name: 'ULTRAVIOLET',
    range: '10 – 380 nm',
    description: 'Emitted by hot, massive O/B stars and high-energy electronic atomic transitions. Blocked by Earth atmosphere (requires space telescopes).',
    color: '#818cf8'
  }
};

export const INVESTIGATION_CASES = [
  /* =========================================================================
     CASE 01: EXOPLANET DETECTION
     ========================================================================= */
  {
    id: 'CASE_01_EXOPLANET',
    caseNumber: '01',
    title: 'HOW DO WE DETECT AN EXOPLANET?',
    subtitle: 'TRANSIT PHOTOMETRY & RADIAL VELOCITY WOBBLE',
    target: {
      name: 'KEPLER-186 / KEPLER-186f',
      constellation: 'CYGNUS',
      coordinates: 'RA 19h 54m 36s | Dec +43° 57′ 18″',
      distance: '582 LIGHT-YEARS (178.5 PC)',
      targetType: 'M-DWARF STELLAR SYSTEM',
      spectralType: 'M1V (COOL RED DWARF)'
    },
    mission: {
      name: 'KEPLER SPACE TELESCOPE & TESS',
      agency: 'NASA / AMES RESEARCH CENTER',
      instrument: 'SCHMIDT PHOTOMETER (0.95M APERTURE, 95-MEGAPIXEL CCD ARRAY)',
      operationalMode: 'LONG-CADENCE CONTINUOUS 29.4-MIN PHOTOMETRY'
    },
    educationalNotice: 'EDUCATIONAL VISUALIZATION // TRANSIT DEPTH EXAGGERATED FOR PERCEPTION',
    overview: 'Before 1992, humanity had never confirmed a single planet orbiting a star outside our solar system. Planets are billions of times fainter than their host stars and sit fractions of an arcsecond away. We cannot take a direct close-up photo. How then do we know with mathematical certainty that an exoplanet is there?',
    
    // Multi-wavelength capability for this case
    availableWavelengths: ['VISIBLE', 'INFRARED'],
    wavelengthNotes: {
      VISIBLE: 'Primary Kepler transit photometry. Detects geometric occultation of stellar disk.',
      INFRARED: 'JWST NIRSpec / Spitzer verification. Measures transmission spectrum of planetary atmosphere during transit.'
    },

    // Step-by-step scientific evidence items
    evidence: [
      {
        id: 'EV_01_PHOTOMETRY',
        step: 1,
        type: 'brightness_variation',
        title: 'STEP 1: CONTINUOUS FLUX MEASUREMENT',
        observation: 'Kepler monitored the brightness of 150,000 stars every 29.4 minutes for 4 continuous years with high-precision CCDs.',
        data: {
          baselineFlux: '1.0000 (NORMALIZED RELATIVE INTENSITY)',
          dipDepth: '0.00040 (0.040% ± 0.003% INTENSITY DROP)',
          duration: '4.45 HOURS (TRANSIT DURATION)',
          repeatPeriod: '129.9441 DAYS (ORBITAL PERIOD)'
        },
        interpretation: 'A minute, periodic drop in starlight occurs with clockwork regularity. The flat-bottomed U-shape profile indicates an opaque spherical object traversing the stellar disk.',
        confidenceContext: 'Signal-to-Noise Ratio (SNR) > 17.4σ across 11 consecutive transits. Instrument noise floor is under 0.001%.',
        source: 'NASA Exoplanet Archive // Kepler Science Operations',
        sourceUrl: 'https://exoplanetarchive.ipac.caltech.edu/',
        visualizationType: 'TRANSIT_LIGHT_CURVE'
      },
      {
        id: 'EV_02_GEOMETRY',
        step: 2,
        type: 'orbital_measurement',
        title: 'STEP 2: GEOMETRIC PROPORTION & RADIUS',
        observation: 'The fraction of light blocked is directly proportional to the ratio of cross-sectional areas between the planet and star.',
        data: {
          formula: 'ΔF / F = (R_planet / R_star)²',
          starRadius: '0.523 R_Sun (363,800 km)',
          derivedPlanetRadius: '1.17 ± 0.08 R_Earth (7,454 km)',
          semiMajorAxis: '0.432 AU (KEPLER\'S THIRD LAW: a³ = G·M·P² / 4π²)'
        },
        interpretation: 'Because the star size is known from high-resolution spectroscopy, the transit depth directly yields the physical radius of the planet. Kepler-186f is just 17% larger than Earth.',
        confidenceContext: 'Radius determined to ±6.8% precision, verified through multiple independent stellar parameter syntheses.',
        source: 'Quintana et al. (Science 2014, "An Earth-Sized Planet in the Habitable Zone of a Cool Star")',
        sourceUrl: 'https://science.sciencemag.org/content/344/6181/277',
        visualizationType: 'PLANET_STAR_SCALE'
      },
      {
        id: 'EV_03_RADIAL_VELOCITY',
        step: 3,
        type: 'motion',
        title: 'STEP 3: GRAVITATIONAL REFLEX WOBBLE',
        observation: 'High-precision Doppler spectrographs (Keck HIRES / HARPS-N) measure periodic radial velocity shifts in the star’s spectral lines.',
        data: {
          semiAmplitude: 'K = 0.42 m/s (ESTIMATED RADIAL VELOCITY)',
          spectralShift: 'Δλ / λ = v / c (DOPPLER FORMULA)',
          phaseLock: '180° OUT OF PHASE WITH PHOTOMETRIC TRANSIT',
          inferredMass: '1.44 M_Earth (CONSISTENT WITH ROCKY COMPOSITION)'
        },
        interpretation: 'The planet and star orbit their mutual center of mass (barycenter). The star wobbles back and forth at the exact same orbital period, confirming an orbiting mass rather than stellar sunspots.',
        confidenceContext: 'Independent dynamic confirmation separating true planetary mass from false-positive background eclipsing binaries.',
        source: 'W. M. Keck Observatory / HARPS-N Consortium',
        sourceUrl: 'https://www.keckobservatory.org/',
        visualizationType: 'RADIAL_VELOCITY_CURVE'
      }
    ],

    // Synthesis and conclusion
    conclusion: {
      whatWeObserved: 'A 0.04% periodic dimming of Kepler-186 every 129.94 days lasting 4.5 hours, accompanied by consistent limb-darkened ingress and egress profiles.',
      whatItSuggests: 'An opaque body of approximately 1.17 Earth radii orbits within the circumstellar habitable zone of an M1V red dwarf.',
      whatWeCanConclude: 'Kepler-186f is a validated exoplanet. It is an Earth-sized world in an orbit where liquid surface water could theoretically exist under suitable atmospheric pressure.',
      whatRemainsUncertain: 'Its precise atmospheric composition, surface water inventory, and mass (constrained by models rather than direct RV due to stellar faintness) remain targets for future space observatories.'
    },

    humanityMeaning: 'For millennia, philosophers wondered if our solar system was unique in the cosmos. By counting light dips measured to fractions of a percent, humanity has proven that planets outnumber the stars in the night sky.',
    relatedDiscoveryId: 'DISC_TRAPPIST1_HABITABLE',
    relatedQuestion: 'HOW CAN WE KNOW WHAT AN EXOPLANET ATMOSPHERE CONTAINS?'
  },

  /* =========================================================================
     CASE 02: STELLAR COMPOSITION & TEMPERATURE
     ========================================================================= */
  {
    id: 'CASE_02_STELLAR_SPECTRUM',
    caseNumber: '02',
    title: 'HOW DO WE KNOW WHAT A STAR IS MADE OF?',
    subtitle: 'FRAUNHOFER ABSORPTION SPECTROSCOPY & WIEN\'S LAW',
    target: {
      name: 'THE SUN & SIRIUS A',
      constellation: 'CANIS MAJOR / SOLAR SYSTEM',
      coordinates: 'RA 06h 45m 09s | Dec -16° 42′ 58″ (SIRIUS)',
      distance: '8.6 LIGHT-YEARS (SIRIUS) / 1.000 AU (SUN)',
      targetType: 'MAIN SEQUENCE STARS',
      spectralType: 'G2V (SUN, 5,778 K) / A1V (SIRIUS, 9,940 K)'
    },
    mission: {
      name: 'HUBBLE STIS & GAIA DR3 & GROUND-BASED SPECTROGRAPHS',
      agency: 'NASA / ESA / ESO',
      instrument: 'HIGH-RESOLUTION PRISM & DIFFRACTION GRATING SPECTROGRAPHS',
      operationalMode: 'ECHELLE SPECTROSCOPY (SPECTRAL RESOLUTION R > 100,000)'
    },
    educationalNotice: 'EDUCATIONAL VISUALIZATION // DISCRETE ABSORPTION LINES SIMPLIFIED FOR CLARITY',
    overview: 'In 1835, French philosopher Auguste Comte wrote that humanity would never know what stars are composed of, because we could never touch or sample them. Just 25 years later, Gustav Kirchhoff and Robert Bunsen unlocked stellar chemistry using light alone. How does starlight carry an indelible chemical fingerprint across light-years?',

    availableWavelengths: ['VISIBLE', 'ULTRAVIOLET', 'INFRARED'],
    wavelengthNotes: {
      VISIBLE: 'Fraunhofer optical lines: Hydrogen Balmer series, Sodium D doublet, Iron, Calcium.',
      ULTRAVIOLET: 'Lyman series and highly ionized iron in hot stellar coronas.',
      INFRARED: 'Molecular bands (CO, H2O, TiO) visible in cooler stellar atmospheres.'
    },

    evidence: [
      {
        id: 'EV_04_CONTINUUM',
        step: 1,
        type: 'spectrum',
        title: 'STEP 1: THERMAL BLACKBODY RADIATION & TEMPERATURE',
        observation: 'When dense matter is heated, it radiates a smooth thermal continuum. The wavelength of peak emission shifts systematically with temperature.',
        data: {
          wienLaw: 'λ_peak · T = 2.8978 × 10⁻³ m·K (WIEN\'S DISPLACEMENT LAW)',
          sunPeak: '502 nm (VISIBLE GREEN-YELLOW) → T_eff = 5,778 K',
          siriusPeak: '291 nm (ULTRAVIOLET-BLUE) → T_eff = 9,940 K',
          betelgeusePeak: '805 nm (NEAR-INFRARED) → T_eff = 3,600 K'
        },
        interpretation: 'By measuring the color temperature curve of a star without touching it, we determine its surface kinetic temperature with high precision.',
        confidenceContext: 'Fundamental thermodynamic law verified across millions of laboratory experiments and stellar observations.',
        source: 'NIST Physical Measurement Laboratory // Planck Radiation Constants',
        sourceUrl: 'https://physics.nist.gov/',
        visualizationType: 'BLACKBODY_CURVE'
      },
      {
        id: 'EV_05_FRAUNHOFER',
        step: 2,
        type: 'spectrum',
        title: 'STEP 2: QUANTIZED ATOMIC ABSORPTION LINES',
        observation: 'Passing starlight through a prism reveals thousands of dark vertical lines crossing the continuous rainbow spectrum.',
        data: {
          hydrogenAlpha: '656.28 nm (H-α BALMER: n=3 → n=2 TRANSITION)',
          hydrogenBeta: '486.13 nm (H-β BALMER: n=4 → n=2 TRANSITION)',
          sodiumDoublet: '589.00 nm & 589.60 nm (Na I D-LINES)',
          calciumHK: '393.37 nm & 396.85 nm (Ca II IONIZED CALCIUM)'
        },
        interpretation: 'Electrons in cool atoms in the stellar photosphere absorb photons matching their exact quantum energy differences (E = h·c/λ). Every chemical element leaves a unique barcode.',
        confidenceContext: 'Wavelength transitions calibrated in atomic laboratories to parts-per-billion precision (NIST Atomic Spectra Database).',
        source: 'NIST Atomic Spectra Database // ESO UVES Paranal',
        sourceUrl: 'https://www.nist.gov/pml/atomic-spectra-database',
        visualizationType: 'SPECTRUM_ABSORPTION_BAR'
      },
      {
        id: 'EV_06_ABUNDANCE',
        step: 3,
        type: 'catalog_data',
        title: 'STEP 3: CHEMICAL ABUNDANCE SYNTHESIS',
        observation: 'By modeling line equivalent widths with the Saha and Boltzmann ionization equations, Cecilia Payne-Gaposchkin proved stellar compositions in 1925.',
        data: {
          hydrogenFraction: '73.46% (BY MASS)',
          heliumFraction: '24.85% (BY MASS)',
          heavierMetals: '1.69% (OXYGEN 0.77%, CARBON 0.29%, IRON 0.16%, NEON 0.12%)',
          ironAbundance: '[Fe/H] = 0.00 ± 0.04 dex (SOLAR REFERENCE)'
        },
        interpretation: 'Stars are overwhelmingly composed of Hydrogen and Helium created in the Big Bang, with trace metals forged by prior generations of supernovae.',
        confidenceContext: 'Peer-reviewed stellar abundance models matched against meteoritic samples and helioseismology data.',
        source: 'Asplund et al. (2009, ARA&A, "The Chemical Composition of the Sun")',
        sourceUrl: 'https://www.annualreviews.org/doi/10.1146/annurev.astro.46.060407.145222',
        visualizationType: 'ELEMENTAL_ABUNDANCE_PIE'
      }
    ],

    conclusion: {
      whatWeObserved: 'A thermal blackbody emission continuum punctuated by dark Fraunhofer absorption lines matching laboratory-measured electronic transitions of Hydrogen, Helium, Iron, and Sodium.',
      whatItSuggests: 'Stellar photospheres contain hot, partially ionized gases of standard atomic elements identical to those found on Earth.',
      whatWeCanConclude: 'We know the chemical composition and temperature of stars because atomic physics is universal across the cosmos. Light transmits exact quantum states across billions of kilometers.',
      whatRemainsUncertain: 'Detailed 3D non-LTE (local thermodynamic equilibrium) hydrodynamic atmospheric convection effects still cause minor ±0.03 dex variations in solar oxygen and nitrogen abundances.'
    },

    humanityMeaning: 'As Carl Sagan famously observed, "We are made of starstuff." The iron in your hemoglobin, the calcium in your teeth, and the oxygen in your lungs were synthesized inside the cores of dying stars and identified through stellar spectroscopy.',
    relatedDiscoveryId: 'DISC_SOLAR_CORONA_MYSTERY',
    relatedQuestion: 'WHERE DID THE HEAVY ELEMENTS ON EARTH COME FROM?'
  },

  /* =========================================================================
     CASE 03: BLACK HOLE EVIDENCE
     ========================================================================= */
  {
    id: 'CASE_03_BLACK_HOLE',
    caseNumber: '03',
    title: 'WHAT EVIDENCE REVEALS A BLACK HOLE?',
    subtitle: 'STELLAR ORBITS AROUND SGR A* & EVENT HORIZON SHADOW',
    target: {
      name: 'SAGITTARIUS A* (SGR A*)',
      constellation: 'SAGITTARIUS (GALACTIC CENTER)',
      coordinates: 'RA 17h 45m 40.04s | Dec -29° 00′ 28.1″',
      distance: '26,670 LIGHT-YEARS (8.178 KPC)',
      targetType: 'SUPERMASSIVE BLACK HOLE',
      mass: '4.154 × 10⁶ SOLAR MASSES (8.26 × 10³⁶ KG)'
    },
    mission: {
      name: 'VLT GRAVITY (ESO) & KECK OBSERVATORY & EVENT HORIZON TELESCOPE',
      agency: 'ESO / UCLA GALACTIC CENTER GROUP / EHT COLLABORATION',
      instrument: 'NEAR-INFRARED ADAPTIVE OPTICS (NACO/GRAVITY) & 230 GHz GLOBAL VLBI',
      operationalMode: '30-YEAR HIGH-PRECISION ASTROMETRY (SUB-MILLIARCSECOND RESOLUTION)'
    },
    educationalNotice: 'EDUCATIONAL VISUALIZATION // S2 ELLIPTICAL ORBIT ACCELERATED IN TIME',
    overview: 'By definition, a black hole emits no light from within its event horizon. If an object is completely black, how can astronomers be certain it exists, determine its location to milliarcseconds, and weigh it to within 0.3% precision?',

    availableWavelengths: ['INFRARED', 'RADIO', 'X_RAY'],
    wavelengthNotes: {
      INFRARED: 'ESO VLT & Keck near-infrared (K-band 2.2 µm) pierces 30 magnitudes of visual interstellar dust to track stars orbiting Sgr A*.',
      RADIO: 'Event Horizon Telescope 1.3 mm (230 GHz) millimeter waves image the synchroton shadow cast by the photon ring.',
      X_RAY: 'Chandra X-ray Observatory records sudden flares from gas falling past the innermost stable circular orbit.'
    },

    evidence: [
      {
        id: 'EV_07_S2_ORBIT',
        step: 1,
        type: 'orbital_measurement',
        title: 'STEP 1: S2 STELLAR ORBITAL ACCELERATION',
        observation: 'Astronomers mapped the positions of individual stars in the nuclear star cluster for 30 years using infrared adaptive optics.',
        data: {
          starIdentifier: 'S2 (S0-2)',
          orbitalPeriod: '16.0518 YEARS (CLOSED KEPLERIAN ELLIPSE)',
          eccentricity: 'e = 0.88441 (EXTREMELY ELONGATED ORBIT)',
          periastronDistance: '120 AU = 17 LIGHT-HOURS (1.8 × 10¹⁰ KM)',
          periastronSpeed: '7,700 KM/S (2.57% THE SPEED OF LIGHT)'
        },
        interpretation: 'Star S2 whips around a completely dark point at immense velocity. By applying Newton’s and Einstein’s gravitational dynamics (M = a³ / P²), we directly weigh the central attractor.',
        confidenceContext: 'Astrometric tracking over two complete orbital cycles (1992–2024). 2020 Nobel Prize in Physics awarded to Reinhard Genzel & Andrea Ghez.',
        source: 'GRAVITY Collaboration (2018, A&A, "Detection of the gravitational redshift in the orbit of the star S2 around the Galactic centre massive black hole")',
        sourceUrl: 'https://www.eso.org/public/news/eso1825/',
        visualizationType: 'BLACK_HOLE_ORBIT_TRACER'
      },
      {
        id: 'EV_08_ENCLOSED_MASS',
        step: 2,
        type: 'data',
        title: 'STEP 2: ENCLOSED DENSITY BOUNDARY',
        observation: 'At its closest approach (17 light-hours), S2 remained intact and experienced gravitational acceleration from a single concentrated point.',
        data: {
          enclosedMass: '4.154 ± 0.014 × 10⁶ SOLAR MASSES',
          maximumEnclosedRadius: '< 17 LIGHT-HOURS (< 120 AU)',
          minimumDensity: '> 5 × 10¹⁵ M_Sun / pc³',
          schwarzschildRadius: 'R_s = 2GM / c² = 12.3 MILLION KM (0.082 AU)'
        },
        interpretation: 'Packing 4.15 million solar masses inside a sphere smaller than the orbit of Neptune eliminates all alternative astrophysical explanations (dark star clusters, fermion balls, or dark matter condensations). Only a black hole can exist at this density without collapsing.',
        confidenceContext: 'Direct dynamical constraint verified simultaneously by two independent teams at Keck and VLT.',
        source: 'Ghez et al. (ApJ 2008) / Schödel et al. (Nature 2002)',
        sourceUrl: 'https://iopscience.iop.org/article/10.1086/592738',
        visualizationType: 'MASS_DENSITY_SCALE'
      },
      {
        id: 'EV_09_EHT_SHADOW',
        step: 3,
        type: 'image',
        title: 'STEP 3: DIRECT EVENT HORIZON SHADOW',
        observation: 'In 2022, the Event Horizon Telescope combined radio observatories across 4 continents to create an Earth-sized virtual radio dish.',
        data: {
          angularDiameter: '51.8 ± 2.3 MICROARCSECONDS',
          emissionWavelength: '1.3 mm (230 GHz SYNCHROTRON EMISSION)',
          brightnessAsymmetry: 'DOPPLER BEAMING OF GAS ORBITING NEAR C',
          shadowMatch: 'EXACT FIT WITH KERR METRIC GENERAL RELATIVITY'
        },
        interpretation: 'Light passing near the black hole is bent by strong gravity. Photons within 2.6 Schwarzschild radii fall into the event horizon, leaving a dark central silhouette ringed by glowing plasma.',
        confidenceContext: 'Very Long Baseline Interferometry with phase calibration across ALMA, APEX, IRAM, SMA, JCMT, SMT, and South Pole Telescope.',
        source: 'Event Horizon Telescope Collaboration (2022, ApJL, "First Sagittarius A* Results")',
        sourceUrl: 'https://iopscience.iop.org/journal/2041-8205/page/Focus_on_First_Sgr_A_Results',
        visualizationType: 'EHT_RADIO_SHADOW'
      }
    ],

    conclusion: {
      whatWeObserved: 'Star S2 orbiting an invisible focal point at 7,700 km/s in a 16-year ellipse, accompanied by a 52-microarcsecond ring of 1.3 mm radio emission matching relativistic light-bending.',
      whatItSuggests: 'A mass of 4.15 million Suns is confined inside a volume smaller than the solar system.',
      whatWeCanConclude: 'Sagittarius A* is a supermassive black hole. The observations confirm the predictions of Albert Einstein’s General Relativity in the strong gravitational regime.',
      whatRemainsUncertain: 'The exact spin rate (dimensionless spin parameter a*) and the tilt angle of the accretion disk relative to the galactic plane are still actively debated.'
    },

    humanityMeaning: 'Black holes are where our two greatest theories of reality—General Relativity and Quantum Mechanics—clash. By investigating Sagittarius A*, humanity touches the very boundary where space and time cease to exist.',
    relatedDiscoveryId: 'DISC_SAGITTARIUS_A_STAR',
    relatedQuestion: 'WHAT HAPPENS TO INFORMATION THAT FALLS INTO A BLACK HOLE?'
  },

  /* =========================================================================
     CASE 04: THE COSMIC TIME MACHINE
     ========================================================================= */
  {
    id: 'CASE_04_LOOKBACK_TIME',
    caseNumber: '04',
    title: 'WHY DOES LIGHT MAKE THE UNIVERSE A TIME MACHINE?',
    subtitle: 'FINITE LIGHT-TRAVEL TIME & COSMIC LOOKBACK SCALES',
    target: {
      name: 'COSMIC DISTANCE LADDER',
      constellation: 'OBSERVABLE UNIVERSE',
      coordinates: 'ALL-SKY CELESTIAL SPHERE',
      distance: '1.28 LIGHT-SECONDS (MOON) TO 13.4 BILLION LIGHT-YEARS (JADES-GS-z14-0)',
      targetType: 'SPACETIME HORIZON',
      constantOfNature: 'SPEED OF LIGHT c = 299,792.458 KM/S'
    },
    mission: {
      name: 'JAMES WEBB SPACE TELESCOPE & HUBBLE & GAIA',
      agency: 'NASA / ESA / CSA',
      instrument: 'NIRCam & NIRSpec (DEEP EXTRAGALACTIC SURVEYS) & GAIA PARALLAX',
      operationalMode: 'COSMOLOGICAL REDSHIFT SPECTROSCOPY (z > 14)'
    },
    educationalNotice: 'EDUCATIONAL VISUALIZATION // COSMIC LOOKBACK TIME SCALE IS LOGARITHMIC',
    overview: 'When we open our eyes to look at a distant star or galaxy, we are not seeing what is there right now. Light travels at an absolute, finite speed: 299,792 km/s. Therefore, every telescope is fundamentally a time machine. How does this physical law allow astronomers to directly photograph the birth of our universe?',

    availableWavelengths: ['VISIBLE', 'INFRARED', 'RADIO'],
    wavelengthNotes: {
      VISIBLE: 'Local cosmic neighborhood (Moon, Sun, nearby stars, Andromeda).',
      INFRARED: 'High-redshift cosmological dawn (JWST). Cosmic expansion stretches visible light into infrared wavelengths.',
      RADIO: 'Cosmic Microwave Background (CMB at 2.725 K). The oldest light in existence, emitted 380,000 years after the Big Bang.'
    },

    evidence: [
      {
        id: 'EV_10_SOLAR_DELAY',
        step: 1,
        type: 'timing',
        title: 'STEP 1: LOCAL LIGHT-TRAVEL TIME DELAYS',
        observation: 'Every planetary command, telemetry packet, and ray of sunlight arrives with a measurable, predictable time delay.',
        data: {
          moonDelay: '1.28 SECONDS (384,400 KM) — APOLLO RADIO DELAY',
          sunDelay: '8.32 MINUTES (149.6 MILLION KM, 1 AU)',
          marsDelay: '3.1 TO 22.2 MINUTES (DEPENDING ON ORBITAL ALIGNMENT)',
          voyager1Delay: '22.8 HOURS (24.7 BILLION KM, 165 AU)'
        },
        interpretation: 'Even within our own solar system, instantaneous observation is physically impossible. You never see the Sun as it is now—only as it was 8 minutes and 20 seconds ago.',
        confidenceContext: 'Verified continuously by NASA Deep Space Network ranging timestamps accurate to nanoseconds.',
        source: 'NASA Jet Propulsion Laboratory // DSN Telemetry Archives',
        sourceUrl: 'https://eyes.nasa.gov/dsn/dsn.html',
        visualizationType: 'LOCAL_LIGHT_TIME_CHART'
      },
      {
        id: 'EV_11_STELLAR_ARCHAEOLOGY',
        step: 2,
        type: 'timing',
        title: 'STEP 2: STELLAR & GALACTIC LOOKBACK DEPTH',
        observation: 'As we peer beyond our solar system, light-travel times stretch from years to millennia to millions of years.',
        data: {
          proximaCentauri: '4.24 YEARS (25 TRILLION KM) — CLOSEST STELLAR SYSTEM',
          betelgeuse: '650 YEARS — LIGHT LEFT DURING THE EUROPEAN RENAISSANCE',
          sagittariusAStar: '26,000 YEARS — LIGHT LEFT AS ICE AGE GLACIERS COVERED EARTH',
          andromedaM31: '2.537 MILLION YEARS — LIGHT LEFT AS EARLY HOMININS INVENTED TOOLS'
        },
        interpretation: 'Looking out into space is literally looking backward down the corridor of time. The farther away an object is, the earlier in history we observe it.',
        confidenceContext: 'Distance cross-calibrated via Gaia stellar parallax, Cepheid variable period-luminosity relations, and Type Ia supernovae standard candles.',
        source: 'Freedman et al. (ApJ 2001, "Final Results from the Hubble Space Telescope Key Project to Measure the Hubble Constant")',
        sourceUrl: 'https://iopscience.iop.org/article/10.1086/320638',
        visualizationType: 'COSMIC_LOOKBACK_LADDER'
      },
      {
        id: 'EV_12_COSMIC_DAWN',
        step: 3,
        type: 'spectrum',
        title: 'STEP 3: OBSERVING COSMIC DAWN WITH JWST',
        observation: 'In 2024, the James Webb Space Telescope detected galaxy JADES-GS-z14-0 with spectroscopic redshift z = 14.32.',
        data: {
          spectroscopicRedshift: 'z = 14.32 ± 0.08 (CONFIRMED BY LYMAN BREAK AT 1.8 µm)',
          lookbackTime: '13.4 BILLION YEARS (EMITTED 290 MILLION YEARS AFTER BIG BANG)',
          expansionStretching: 'WAVELENGTHS STRETCHED BY A FACTOR OF (1 + z) = 15.32×',
          universeAgeAtEmission: '2% OF ITS CURRENT AGE (CURRENT AGE = 13.797 BILLION YEARS)'
        },
        interpretation: 'We are directly observing the infancy of galaxies. We do not need a theoretical simulation to know what early galaxies looked like: their actual photons are striking JWST’s mirror today.',
        confidenceContext: 'Spectroscopic confirmation with JWST NIRSpec micro-shutter array. Exceeds 10σ significance.',
        source: 'Carniani et al. (Nature 2024, "A luminous galaxy at a redshift of z = 14.32")',
        sourceUrl: 'https://www.nature.com/articles/s41586-024-07860-9',
        visualizationType: 'COSMIC_TIMELINE_SLIDER'
      }
    ],

    conclusion: {
      whatWeObserved: 'Photons arriving at Earth with finite propagation delays proportional to their distance, with primordial galaxy photons redshifted into the infrared over 13.4 billion years.',
      whatItSuggests: 'The universe is not static in time; looking deep into space allows us to reconstruct cosmic history layer by layer.',
      whatWeCanConclude: 'Because the speed of light is invariant and finite, the sky is an open archaeological archive. We can observe the evolution of the universe directly from the present day back to its earliest epochs.',
      whatRemainsUncertain: 'The precise rate of cosmological expansion (the Hubble Tension: 67.4 km/s/Mpc from CMB vs 73.0 km/s/Mpc from local Cepheids) remains one of modern physics’ greatest unsolved puzzles.'
    },

    humanityMeaning: 'When you stand outside on a clear night, your eyes are absorbing ancient history. Some of the starlight touching your retinas left its source before humanity existed, having crossed the silent vacuum of space just in time to meet your gaze.',
    relatedDiscoveryId: 'DISC_COSMIC_LOOKBACK',
    relatedQuestion: 'WHAT WAS HAPPENING BEFORE THE FIRST STARS IGNITED?'
  },

  /* =========================================================================
     CASE 05: SPACECRAFT NAVIGATION
     ========================================================================= */
  {
    id: 'CASE_05_NAVIGATION',
    caseNumber: '05',
    title: 'HOW DOES A SPACECRAFT KNOW WHERE IT IS?',
    subtitle: 'DEEP SPACE NETWORK 2-WAY RANGE TIMING & DOPPLER VELOCITY',
    target: {
      name: 'VOYAGER 1 & PERSEVERANCE ROVER (CRUISE STAGE)',
      constellation: 'INTERSTELLAR SPACE / MARS ORBIT',
      coordinates: 'HELIOCENTRIC & INTERPLANETARY VECTORS',
      distance: '24.7 BILLION KM (VOYAGER 1) / 225 MILLION KM (MARS)',
      targetType: 'DEEP SPACE INTERPLANETARY ROBOTIC MISSIONS',
      telemetryBand: 'X-BAND (8.4 GHz) & Ka-BAND (32 GHz)'
    },
    mission: {
      name: 'NASA DEEP SPACE NETWORK (DSN)',
      agency: 'NASA / JPL-CALTECH',
      instrument: 'THREE 70-METER & NINE 34-METER PARABOLIC DISHES',
      operationalMode: 'COHERENT TWO-WAY MICROWAVE RANGING & HYDROGEN MASER ATOMIC CLOCK TIMING'
    },
    educationalNotice: 'EDUCATIONAL VISUALIZATION // TWO-WAY RADIO TIMING SIMPLIFIED FOR INTERACTION',
    overview: 'There are no GPS satellites in deep space. There are no roads, landmarks, or radio beacons. Yet robotic probes cross hundreds of millions of kilometers of empty space and arrive within a few meters of a target on Mars after a 7-month voyage. How do mission controllers know exactly where a spacecraft is and how fast it is moving?',

    availableWavelengths: ['RADIO'],
    wavelengthNotes: {
      RADIO: 'Microwave frequencies (S-band, X-band, Ka-band) penetrate planetary atmospheres and interplanetary dust with minimal attenuation.'
    },

    evidence: [
      {
        id: 'EV_13_TWO_WAY_RANGING',
        step: 1,
        type: 'timing',
        title: 'STEP 1: TWO-WAY COHERENT LIGHT-TIME RANGING',
        observation: 'An Earth antenna transmits an ultra-stable pseudo-random radio code to the spacecraft, which transponds it back coherently.',
        data: {
          formula: 'Range = (c · Δt_roundtrip) / 2',
          hydrogenMaserClock: 'STABILITY: 1 PART IN 10¹⁵ (LOSES 1 SECOND IN 30 MILLION YEARS)',
          rangingPrecision: 'ACCURATE TO UNDER 1 METER ACROSS 200 MILLION KILOMETERS',
          exampleMarsTiming: 'ROUND-TRIP LIGHT TIME = 25 MINUTES 04.281 SECONDS'
        },
        interpretation: 'Because the speed of radio waves is the speed of light, measuring round-trip transit time with an atomic clock determines line-of-sight distance with sub-meter accuracy.',
        confidenceContext: 'Standard JPL navigational baseline. Relativistic gravitational time dilation (Shapiro delay) is included in calculations.',
        source: 'Thornton & Border (JPL DESCANSO, "Radiometric Tracking Techniques for Deep-Space Navigation")',
        sourceUrl: 'https://descanso.jpl.nasa.gov/',
        visualizationType: 'DSN_PING_VISUALIZER'
      },
      {
        id: 'EV_14_DOPPLER_VELOCITY',
        step: 2,
        type: 'motion',
        title: 'STEP 2: CARRIER DOPPLER VELOCITY MEASUREMENT',
        observation: 'The relative velocity between Earth and the spacecraft compresses or stretches the transponded radio frequency.',
        data: {
          dopplerFormula: 'Δf / f₀ = -2 · (v_radial / c)',
          carrierFrequency: 'f₀ = 8.4 GHz (X-BAND DOWNLINK)',
          velocityResolution: '0.05 MILLIMETERS PER SECOND (0.00018 KM/H)',
          detectionInterval: 'SAMPLED EVERY 1.0 SECOND'
        },
        interpretation: 'By counting cycles of the received microwave carrier against the ground atomic clock, navigators measure radial velocity down to fractions of a millimeter per second.',
        confidenceContext: 'Enables real-time detection of tiny trajectory perturbations from solar radiation pressure and planetary gravitational pulls.',
        source: 'NASA Jet Propulsion Laboratory // DSN Science Systems',
        sourceUrl: 'https://www.jpl.nasa.gov/missions/deep-space-network-dsn',
        visualizationType: 'DOPPLER_SHIFT_GRAPH'
      },
      {
        id: 'EV_15_DELTA_DOR',
        step: 3,
        type: 'position',
        title: 'STEP 3: DELTA-DOR ANGULAR TRIANGULATION & STAR TRACKERS',
        observation: 'Two Earth antennas separated by continental baselines (e.g., Goldstone and Madrid) record the spacecraft signal simultaneously against a background quasar.',
        data: {
          baselineLength: '8,000 KM (INTERCONTINENTAL EARTH BASELINE)',
          angularAccuracy: '1 NANORADIAN (0.2 MILLIARCSECONDS)',
          equivalentPrecision: 'MEASURING THE WIDTH OF A DIME IN LOS ANGELES FROM NEW YORK',
          starTrackerAstrometry: 'ONBOARD CAMERAS TRIANGULATE KNOWN STAR CATALOGS (50 HZ)'
        },
        interpretation: 'Delta-DOR provides the transverse angular position, while two-way ranging provides distance, and Doppler provides velocity. Together, they create a complete 6-dimensional phase-space vector (x, y, z, vx, vy, vz).',
        confidenceContext: 'Guaranteed 2021 Perseverance touchdown inside Jezero Crater within a 7.7 × 6.6 km ellipse after a 470-million-km journey.',
        source: 'Curkendall & Border (Acta Astronautica 2013, "Delta-DOR: The Journey from R&D to Operations")',
        sourceUrl: 'https://descanso.jpl.nasa.gov/monograph/series12_memo.cfm',
        visualizationType: 'DELTA_DOR_TRIANGULATION'
      }
    ],

    conclusion: {
      whatWeObserved: 'Coherent microwave round-trip timing, carrier Doppler phase shift, and intercontinental interferometric delay compared against hydrogen maser clocks and distant quasar reference frames.',
      whatItSuggests: 'The spacecraft follows a precise, deterministic Keplerian trajectory perturbed only by known gravitational bodies, planetary oblateness, and solar photon pressure.',
      whatWeCanConclude: 'Deep space probes navigate not by guessing, but by measuring the invariant laws of electromagnetism and relativity. A probe billions of kilometers away is tracked to within meters.',
      whatRemainsUncertain: 'Space weather (solar wind coronal mass ejections) causes slight fluctuations in the interplanetary plasma electron density, creating transient picosecond timing variations.'
    },

    humanityMeaning: 'Spacecraft navigation is the ultimate testament to human foresight. Guided across hundreds of millions of kilometers of void by the invisible tick of atomic clocks, humanity extends its senses to explore alien worlds.',
    relatedDiscoveryId: 'DISC_VOYAGER_INTERSTELLAR',
    relatedQuestion: 'HOW CAN A SPACECRAFT SURVIVE DECADES IN INTERSTELLAR SPACE?'
  }
];

/**
 * Quick search mapping helper for the Cosmic Observatory
 */
export function searchObservatory(query) {
  if (!query || typeof query !== 'string') return [];
  const q = query.trim().toLowerCase();

  return INVESTIGATION_CASES.filter(c => {
    return c.title.toLowerCase().includes(q) ||
           c.subtitle.toLowerCase().includes(q) ||
           c.target.name.toLowerCase().includes(q) ||
           c.overview.toLowerCase().includes(q) ||
           c.mission.name.toLowerCase().includes(q) ||
           c.evidence.some(e => e.title.toLowerCase().includes(q) || e.observation.toLowerCase().includes(q));
  });
}

/**
 * Get case by ID
 */
export function getInvestigationCase(caseId) {
  return INVESTIGATION_CASES.find(c => c.id === caseId) || INVESTIGATION_CASES[0];
}
