/**
 * PHASE 6 — BEYOND THE SOLAR SYSTEM
 * Deep Space Scientific Object Catalog
 *
 * Each entry contains scientifically verified data with source attribution.
 * Objects are organized by class: STARS, EXOPLANETS, BLACK_HOLES, NEBULAE, GALAXIES
 */

export const DEEP_SPACE_CATEGORIES = {
  STARS:       { label: 'STARS',       icon: '★', color: '#fbbf24' },
  EXOPLANETS:  { label: 'EXOPLANETS',  icon: '◉', color: '#a78bfa' },
  BLACK_HOLES: { label: 'BLACK HOLES', icon: '●', color: '#ef4444' },
  NEBULAE:     { label: 'NEBULAE',     icon: '◎', color: '#34d399' },
  GALAXIES:    { label: 'GALAXIES',    icon: '✦', color: '#60a5fa' }
};

export const COSMIC_SCALE_LABELS = [
  { id: 'PLANET',        label: 'PLANET',         range: '< 1 AU' },
  { id: 'SOLAR_SYSTEM',  label: 'SOLAR SYSTEM',   range: '< 50 AU' },
  { id: 'STELLAR',       label: 'STELLAR',        range: '< 100 LY' },
  { id: 'GALACTIC',      label: 'GALACTIC',       range: '< 100,000 LY' },
  { id: 'EXTRAGALACTIC', label: 'EXTRAGALACTIC',  range: '> 1 MLY' }
];

/**
 * Deep Space Object Catalog
 * Each entry includes:
 *  - id, name, designation
 *  - category (STARS | EXOPLANETS | BLACK_HOLES | NEBULAE | GALAXIES)
 *  - distance (from Earth)
 *  - key scientific metrics
 *  - source (peer-reviewed)
 *  - twist (the "unexpected" discovery angle)
 *  - 3D position vector (for scene placement, in visualization scale units)
 */
export const DEEP_SPACE_OBJECTS = [

  // ═══════════════ STARS ═══════════════

  {
    id: 'PROXIMA_CENTAURI',
    name: 'PROXIMA CENTAURI',
    designation: 'α Centauri C / HIP 70890',
    category: 'STARS',
    type: 'RED DWARF (M5.5Ve)',
    distance: '4.2465 LIGHT-YEARS',
    distanceParsecs: 1.3012,
    constellation: 'CENTAURUS',
    metrics: [
      { label: 'SPECTRAL TYPE',     value: 'M5.5Ve' },
      { label: 'MASS',              value: '0.1221 M☉' },
      { label: 'RADIUS',            value: '0.1542 R☉' },
      { label: 'LUMINOSITY',        value: '0.0017 L☉' },
      { label: 'SURFACE TEMP',      value: '3,042 K' },
      { label: 'AGE',               value: '4.85 BILLION YEARS' },
      { label: 'ROTATION PERIOD',   value: '82.6 DAYS' },
      { label: 'FLARE ACTIVITY',    value: 'HIGHLY ACTIVE (UV CETI TYPE)' }
    ],
    twist: 'Our nearest stellar neighbor is an invisible, violently flaring red dwarf — too dim to see with the naked eye despite being closer than any other star.',
    humanityNote: 'Even at light speed, a message to Proxima Centauri would take 4.24 years to arrive. At current spacecraft velocity (~17 km/s), the journey would take approximately 73,000 years.',
    source: {
      tag: 'ESO-2016 / KERVELLA-2017',
      title: 'Kervella et al., "Proxima\'s orbit around α Centauri", A&A (2017)',
      url: 'https://doi.org/10.1051/0004-6361/201731730'
    },
    scenePosition: { x: 22, y: 3, z: -12 },
    visualRadius: 0.18,
    visualColor: 0xff6b4a
  },

  {
    id: 'BETELGEUSE',
    name: 'BETELGEUSE',
    designation: 'α Orionis / HIP 27989',
    category: 'STARS',
    type: 'RED SUPERGIANT (M1-M2 Ia-ab)',
    distance: '700 ± 100 LIGHT-YEARS',
    distanceParsecs: 222,
    constellation: 'ORION',
    metrics: [
      { label: 'SPECTRAL TYPE',     value: 'M1-M2 Ia-ab' },
      { label: 'MASS',              value: '16.5 - 19 M☉' },
      { label: 'RADIUS',            value: '~887 R☉ (~4.1 AU)' },
      { label: 'LUMINOSITY',        value: '~126,000 L☉' },
      { label: 'SURFACE TEMP',      value: '3,600 K' },
      { label: 'AGE',               value: '~8-8.5 MILLION YEARS' },
      { label: 'PULSATION PERIOD',  value: '~400 DAYS (SEMI-REGULAR)' },
      { label: 'STATUS',            value: 'SUPERNOVA CANDIDATE' }
    ],
    twist: 'If placed at the center of our Solar System, Betelgeuse\'s surface would extend past Jupiter\'s orbit. Its 2019 "Great Dimming" was caused by a massive surface eruption ejecting a cloud of stellar dust.',
    humanityNote: 'When Betelgeuse finally explodes as a supernova, it will be visible during daytime on Earth for weeks — the most spectacular celestial event in recorded human history.',
    source: {
      tag: 'MONTARGÈS-2021',
      title: 'Montargès et al., "A dusty veil shading Betelgeuse during its Great Dimming", Nature (2021)',
      url: 'https://doi.org/10.1038/s41586-021-03546-8'
    },
    scenePosition: { x: 35, y: 8, z: -25 },
    visualRadius: 0.65,
    visualColor: 0xff4422
  },

  {
    id: 'TRAPPIST_1',
    name: 'TRAPPIST-1',
    designation: '2MASS J23062928-0502285',
    category: 'STARS',
    type: 'ULTRA-COOL RED DWARF (M8V)',
    distance: '39.46 LIGHT-YEARS',
    distanceParsecs: 12.10,
    constellation: 'AQUARIUS',
    metrics: [
      { label: 'SPECTRAL TYPE',     value: 'M8V' },
      { label: 'MASS',              value: '0.0898 M☉' },
      { label: 'RADIUS',            value: '0.1192 R☉' },
      { label: 'LUMINOSITY',        value: '0.000522 L☉' },
      { label: 'SURFACE TEMP',      value: '2,566 K' },
      { label: 'KNOWN PLANETS',     value: '7 TERRESTRIAL' },
      { label: 'HABITABLE ZONE',    value: 'PLANETS e, f, g' },
      { label: 'SYSTEM AGE',        value: '7.6 ± 2.2 BILLION YEARS' }
    ],
    twist: 'TRAPPIST-1 hosts 7 Earth-sized rocky planets — 3 in the habitable zone. The entire system is so compact it would fit inside Mercury\'s orbit around our Sun.',
    humanityNote: 'Standing on TRAPPIST-1e, the other planets would appear as large as the Moon in Earth\'s sky — entire worlds visible to the naked eye, close enough to see their features.',
    source: {
      tag: 'GILLON-2017',
      title: 'Gillon et al., "Seven temperate terrestrial planets around TRAPPIST-1", Nature (2017)',
      url: 'https://doi.org/10.1038/nature21360'
    },
    scenePosition: { x: 28, y: -2, z: -18 },
    visualRadius: 0.14,
    visualColor: 0xcc3300
  },

  // ═══════════════ EXOPLANETS ═══════════════

  {
    id: 'KEPLER_442B',
    name: 'KEPLER-442b',
    designation: 'KOI-4742.01',
    category: 'EXOPLANETS',
    type: 'SUPER-EARTH (HABITABLE ZONE)',
    distance: '1,206 LIGHT-YEARS',
    distanceParsecs: 370,
    constellation: 'LYRA',
    metrics: [
      { label: 'MASS',              value: '2.36 M⊕' },
      { label: 'RADIUS',            value: '1.34 R⊕' },
      { label: 'ORBITAL PERIOD',    value: '112.3 EARTH DAYS' },
      { label: 'EQUILIBRIUM TEMP',  value: '233 K (-40°C)' },
      { label: 'INSOLATION',        value: '0.73 × EARTH' },
      { label: 'HOST STAR',         value: 'K-TYPE MAIN SEQUENCE' },
      { label: 'ESI SCORE',         value: '0.836 (EARTH = 1.0)' },
      { label: 'HABITABILITY',      value: 'CONFIRMED HZ (CONSERVATIVE)' }
    ],
    twist: 'Kepler-442b has the highest Earth Similarity Index of any confirmed exoplanet in the habitable zone — it receives 73% of the solar energy Earth does, making liquid water plausible.',
    humanityNote: 'If we could travel at light speed, reaching Kepler-442b would take over a millennium — more than 60 human generations. Any civilization there would see our Sun as a faint dot.',
    source: {
      tag: 'TORRES-2015',
      title: 'Torres et al., "Validation of 12 small Kepler transiting planets in the habitable zone", ApJ (2015)',
      url: 'https://doi.org/10.1088/0004-637X/800/2/99'
    },
    scenePosition: { x: 40, y: 5, z: -30 },
    visualRadius: 0.22,
    visualColor: 0x7c8ef7
  },

  {
    id: 'HD_189733B',
    name: 'HD 189733 b',
    designation: 'THE GLASS RAIN PLANET',
    category: 'EXOPLANETS',
    type: 'HOT JUPITER',
    distance: '64.5 LIGHT-YEARS',
    distanceParsecs: 19.77,
    constellation: 'VULPECULA',
    metrics: [
      { label: 'MASS',              value: '1.142 M♃' },
      { label: 'RADIUS',            value: '1.138 R♃' },
      { label: 'ORBITAL PERIOD',    value: '2.219 EARTH DAYS' },
      { label: 'SURFACE TEMP',      value: '1,200 K' },
      { label: 'WIND SPEED',        value: '~8,700 KM/H' },
      { label: 'ATMOSPHERE',        value: 'SILICATE AEROSOLS (SiO₂)' },
      { label: 'ALBEDO',            value: 'DEEP COBALT BLUE' },
      { label: 'TRANSIT DEPTH',     value: '~2.5%' }
    ],
    twist: 'This cobalt-blue world looks serene from space, but its beauty is lethal: the atmosphere rains molten glass sideways at 8,700 km/h in hypersonic winds.',
    humanityNote: 'HD 189733 b was the first exoplanet whose atmospheric color was directly measured. Its blue appearance comes not from water oceans but from glass rain — silicate particles scattering blue light.',
    source: {
      tag: 'PONT-2013',
      title: 'Evans et al., "The deep blue color of HD 189733b", ApJ Letters (2013)',
      url: 'https://doi.org/10.1088/2041-8205/772/2/L16'
    },
    scenePosition: { x: 25, y: 6, z: -22 },
    visualRadius: 0.35,
    visualColor: 0x2563eb
  },

  // ═══════════════ BLACK HOLES ═══════════════

  {
    id: 'SAGITTARIUS_A_STAR',
    name: 'SAGITTARIUS A*',
    designation: 'Sgr A* / GALACTIC CENTER',
    category: 'BLACK_HOLES',
    type: 'SUPERMASSIVE BLACK HOLE',
    distance: '26,673 LIGHT-YEARS',
    distanceParsecs: 8178,
    constellation: 'SAGITTARIUS',
    metrics: [
      { label: 'MASS',              value: '4.154 × 10⁶ M☉' },
      { label: 'SCHWARZSCHILD R',   value: '12.7 MILLION KM' },
      { label: 'ANGULAR SIZE',      value: '~52 µas' },
      { label: 'SPIN PARAMETER',    value: '< 0.1 (SLOW SPIN)' },
      { label: 'S2 ORBITAL PERIOD', value: '16.05 YEARS' },
      { label: 'S2 CLOSEST APPROACH', value: '120 AU' },
      { label: 'ACCRETION RATE',    value: '~10⁻⁸ M☉/YEAR' },
      { label: 'EHT OBSERVATION',   value: 'CONFIRMED 2022' }
    ],
    twist: 'The supermassive black hole at the center of our galaxy is 4 million times the mass of our Sun, yet if placed in our Solar System its event horizon would fit inside Mercury\'s orbit.',
    humanityNote: 'Every star you see in the night sky orbits Sagittarius A*. Its gravitational influence shapes the entire Milky Way — including the solar system that allows us to exist.',
    source: {
      tag: 'EHT-2022',
      title: 'Event Horizon Telescope Collaboration, "First Sagittarius A* results", ApJ Letters (2022)',
      url: 'https://doi.org/10.3847/2041-8213/ac6674'
    },
    scenePosition: { x: 45, y: 0, z: -40 },
    visualRadius: 0.5,
    visualColor: 0x991b1b
  },

  {
    id: 'M87_BLACK_HOLE',
    name: 'M87* (PŌWEHI)',
    designation: 'FIRST IMAGED BLACK HOLE',
    category: 'BLACK_HOLES',
    type: 'SUPERMASSIVE BLACK HOLE',
    distance: '53.5 MILLION LIGHT-YEARS',
    distanceParsecs: 16400000,
    constellation: 'VIRGO',
    metrics: [
      { label: 'MASS',              value: '6.5 × 10⁹ M☉' },
      { label: 'SCHWARZSCHILD R',   value: '~19.4 BILLION KM' },
      { label: 'ANGULAR SIZE',      value: '42 ± 3 µas' },
      { label: 'JET LENGTH',        value: '~5,000 LIGHT-YEARS' },
      { label: 'JET VELOCITY',      value: '~0.99c (RELATIVISTIC)' },
      { label: 'SHADOW DIAMETER',   value: '~40 BILLION KM' },
      { label: 'SPIN PARAMETER',    value: '~0.90 ± 0.05' },
      { label: 'FIRST IMAGE',       value: 'APRIL 10, 2019' }
    ],
    twist: 'M87* was the first black hole ever imaged by humanity. Its shadow is larger than our entire Solar System, yet the photograph required a telescope the size of Earth to capture.',
    humanityNote: 'The light forming the first black hole image traveled for 53.5 million years before reaching our telescopes. When that light was emitted, dinosaurs still roamed Earth.',
    source: {
      tag: 'EHT-2019',
      title: 'Event Horizon Telescope Collaboration, "First M87 results. I. The shadow of the supermassive black hole", ApJ Letters (2019)',
      url: 'https://doi.org/10.3847/2041-8213/ab0ec7'
    },
    scenePosition: { x: 55, y: -3, z: -50 },
    visualRadius: 0.7,
    visualColor: 0x7f1d1d
  },

  // ═══════════════ NEBULAE ═══════════════

  {
    id: 'PILLARS_OF_CREATION',
    name: 'PILLARS OF CREATION',
    designation: 'M16 / EAGLE NEBULA',
    category: 'NEBULAE',
    type: 'STAR-FORMING REGION (H II)',
    distance: '6,500 LIGHT-YEARS',
    distanceParsecs: 1993,
    constellation: 'SERPENS',
    metrics: [
      { label: 'PILLAR HEIGHT',     value: '~4-5 LIGHT-YEARS' },
      { label: 'NEBULA SIZE',       value: '~70 × 55 LIGHT-YEARS' },
      { label: 'COMPOSITION',       value: 'MOLECULAR H₂, DUST, HII GAS' },
      { label: 'TEMPERATURE',       value: '~8,000 K (HII REGION)' },
      { label: 'STAR FORMATION',    value: 'ACTIVE (EGGs DETECTED)' },
      { label: 'AGE',               value: '~5.5 MILLION YEARS' },
      { label: 'IMAGED BY',         value: 'HST (1995), JWST (2022)' },
      { label: 'MASS',              value: '~200 M☉ PER PILLAR' }
    ],
    twist: 'The Pillars of Creation may already be destroyed. A supernova shockwave estimated to have hit them 6,000 years ago — but we won\'t see the destruction for another 1,000 years because light hasn\'t reached us yet.',
    humanityNote: 'These columns of gas and dust are stellar nurseries — the birthplaces of new solar systems. Every atom in your body was once inside a structure like this.',
    source: {
      tag: 'JWST-2022 / HESTER-1996',
      title: 'Pontoppidan et al., "JWST NIRCam imagery of the Pillars of Creation", STScI Release (2022)',
      url: 'https://webbtelescope.org/contents/news-releases/2022/news-2022-052'
    },
    scenePosition: { x: 32, y: 10, z: -35 },
    visualRadius: 0.8,
    visualColor: 0x34d399
  },

  {
    id: 'CRAB_NEBULA',
    name: 'CRAB NEBULA',
    designation: 'M1 / NGC 1952',
    category: 'NEBULAE',
    type: 'SUPERNOVA REMNANT (PULSAR WIND)',
    distance: '6,523 LIGHT-YEARS',
    distanceParsecs: 2000,
    constellation: 'TAURUS',
    metrics: [
      { label: 'SIZE',              value: '~11 × 7.5 LIGHT-YEARS' },
      { label: 'EXPANSION RATE',    value: '~1,500 KM/S' },
      { label: 'CENTRAL PULSAR',    value: 'PSR B0531+21 (30 Hz)' },
      { label: 'PULSAR PERIOD',     value: '33.5 MILLISECONDS' },
      { label: 'PULSAR ENERGY',     value: '~5 × 10³¹ WATTS' },
      { label: 'SUPERNOVA DATE',    value: 'JULY 4, 1054 AD (OBSERVED)' },
      { label: 'COMPOSITION',       value: 'He, C, O, Ne, S, Fe FILAMENTS' },
      { label: 'X-RAY LUMINOSITY',  value: '~10³¹ W (SYNCHROTRON)' }
    ],
    twist: 'The Crab Nebula is the wreckage of a star that exploded in 1054 AD — Chinese, Japanese, and Arab astronomers recorded it as a "guest star" visible during daytime for 23 days.',
    humanityNote: 'The pulsar at the Crab\'s heart spins 30 times per second, shooting beams of radiation across space like a cosmic lighthouse. It produces more energy than 100,000 Suns.',
    source: {
      tag: 'HESTER-2008',
      title: 'Hester, J.J., "The Crab Nebula: An Astrophysical Chimera", Annual Review of Astronomy and Astrophysics (2008)',
      url: 'https://doi.org/10.1146/annurev.astro.45.051806.110608'
    },
    scenePosition: { x: 38, y: -5, z: -32 },
    visualRadius: 0.6,
    visualColor: 0x22d3ee
  },

  // ═══════════════ GALAXIES ═══════════════

  {
    id: 'ANDROMEDA',
    name: 'ANDROMEDA GALAXY',
    designation: 'M31 / NGC 224',
    category: 'GALAXIES',
    type: 'BARRED SPIRAL GALAXY (SA(s)b)',
    distance: '2.537 MILLION LIGHT-YEARS',
    distanceParsecs: 778000,
    constellation: 'ANDROMEDA',
    metrics: [
      { label: 'DIAMETER',          value: '~220,000 LIGHT-YEARS' },
      { label: 'MASS',              value: '1.5 × 10¹² M☉' },
      { label: 'STARS',             value: '~1 TRILLION' },
      { label: 'CENTRAL BH MASS',   value: '1.1-2.3 × 10⁸ M☉' },
      { label: 'RADIAL VELOCITY',   value: '-301 KM/S (APPROACHING)' },
      { label: 'SATELLITE GALAXIES', value: '~30 DWARF GALAXIES' },
      { label: 'COLLISION ETA',     value: '~4.5 BILLION YEARS' },
      { label: 'APPARENT MAG',      value: '3.44 (NAKED EYE VISIBLE)' }
    ],
    twist: 'Andromeda is racing toward the Milky Way at 301 km/s. In ~4.5 billion years, the two galaxies will merge into "Milkomeda" — but individual star collisions will be extraordinarily rare.',
    humanityNote: 'The Andromeda Galaxy is the most distant object visible to the naked eye. When you see it, you\'re looking at light that left before Homo sapiens existed.',
    source: {
      tag: 'VAN-DER-MAREL-2019',
      title: 'van der Marel et al., "First Gaia Dynamics of the Andromeda System", ApJ (2019)',
      url: 'https://doi.org/10.3847/1538-4357/ab001b'
    },
    scenePosition: { x: 60, y: 4, z: -55 },
    visualRadius: 1.2,
    visualColor: 0x818cf8
  },

  {
    id: 'HUBBLE_ULTRA_DEEP_FIELD',
    name: 'HUBBLE ULTRA DEEP FIELD',
    designation: 'HUDF / HST PROGRAM 9978',
    category: 'GALAXIES',
    type: 'DEEP FIELD OBSERVATION REGION',
    distance: 'UP TO 13.2 BILLION LIGHT-YEARS',
    distanceParsecs: 4047000000,
    constellation: 'FORNAX',
    metrics: [
      { label: 'FIELD SIZE',        value: '11 ARCMIN² (1/13M OF SKY)' },
      { label: 'EXPOSURE TIME',     value: '11.3 DAYS TOTAL' },
      { label: 'GALAXIES DETECTED', value: '~10,000' },
      { label: 'OLDEST OBJECTS',    value: '~13.2 BILLION YEARS OLD' },
      { label: 'LOOKBACK TIME',     value: '400M YEARS AFTER BIG BANG' },
      { label: 'WAVELENGTH RANGE',  value: 'UV + VISIBLE + NIR' },
      { label: 'TELESCOPE',         value: 'HST ACS + NICMOS' },
      { label: 'OBSERVATION DATES', value: 'SEP 2003 - JAN 2004' }
    ],
    twist: 'The HUDF captured ~10,000 galaxies in a patch of sky smaller than a grain of sand held at arm\'s length — implying there are at least 200 billion galaxies in the observable universe.',
    humanityNote: 'The oldest galaxies in this image emitted their light just 400 million years after the Big Bang. By looking deeper into space, we are literally seeing backward through time.',
    source: {
      tag: 'BECKWITH-2006',
      title: 'Beckwith et al., "The Hubble Ultra Deep Field", AJ (2006)',
      url: 'https://doi.org/10.1086/507302'
    },
    scenePosition: { x: 70, y: -2, z: -65 },
    visualRadius: 0.9,
    visualColor: 0x3b82f6
  },

  {
    id: 'JWST_FIRST_DEEP_FIELD',
    name: 'JWST FIRST DEEP FIELD',
    designation: 'SMACS 0723 / JWST ERO',
    category: 'GALAXIES',
    type: 'GRAVITATIONAL LENSING CLUSTER',
    distance: 'UP TO 13.1 BILLION LIGHT-YEARS',
    distanceParsecs: 4017000000,
    constellation: 'VOLANS',
    metrics: [
      { label: 'CLUSTER REDSHIFT',  value: 'z = 0.39 (FOREGROUND LENS)' },
      { label: 'EXPOSURE TIME',     value: '12.5 HOURS' },
      { label: 'DEEPEST REDSHIFT',  value: 'z ≈ 13 (CANDIDATE)' },
      { label: 'LENSING MASS',      value: '~10¹⁵ M☉ (CLUSTER)' },
      { label: 'INSTRUMENTS',       value: 'NIRCam + NIRSpec' },
      { label: 'MAGNIFICATION',     value: 'UP TO 20× (LENSED ARC)' },
      { label: 'FIELD OF VIEW',     value: '~2.4 × 2.2 ARCMIN' },
      { label: 'RELEASE DATE',      value: 'JULY 11, 2022' }
    ],
    twist: 'JWST\'s first deep field image achieved in 12.5 hours what took Hubble weeks — and revealed galaxies from just 600 million years after the Big Bang, bending light around a massive galaxy cluster acting as a natural cosmic telescope.',
    humanityNote: 'President Biden unveiled this image as "the deepest and sharpest infrared image of the distant universe ever taken." The area of sky it covers is roughly the size of a grain of sand held at arm\'s length.',
    source: {
      tag: 'PONTOPPIDAN-2022',
      title: 'Pontoppidan et al., "The JWST Early Release Observations", ApJ Letters (2022)',
      url: 'https://doi.org/10.3847/2041-8213/ac8a4e'
    },
    scenePosition: { x: 75, y: 6, z: -70 },
    visualRadius: 1.0,
    visualColor: 0xfbbf24
  }
];

/**
 * Get objects by category
 * @param {string} category
 */
export function getObjectsByCategory(category) {
  if (category === 'ALL') return DEEP_SPACE_OBJECTS;
  return DEEP_SPACE_OBJECTS.filter(o => o.category === category);
}

/**
 * Get a single object by ID
 * @param {string} id
 */
export function getDeepSpaceObject(id) {
  return DEEP_SPACE_OBJECTS.find(o => o.id === id);
}
