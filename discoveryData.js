/**
 * discoveryData.js — Authoritative Scientific Knowledge Base
 * 
 * Part of the COSMIC DISCOVERY ENGINE for MISSION // NEXT FRONTIER.
 * Every discovery entry represents a verified astronomical, physical,
 * or space exploration reality with traceable citations, memorable twists,
 * deep human meaning, and cross-topic relational graph links.
 * 
 * NO FAKE TRIVIA. NO CHEESY JOKES. DEFENSIVE SCIENTIFIC CITATIONS.
 */

export const DISCOVERY_CATEGORIES = {
  PLANETS: 'PLANETS',
  MOONS: 'MOONS',
  STARS: 'STARS',
  EXOPLANETS: 'EXOPLANETS',
  BLACK_HOLES: 'BLACK HOLES',
  NEUTRON_STARS: 'NEUTRON STARS',
  GALAXIES: 'GALAXIES',
  SOLAR_PHYSICS: 'SOLAR PHYSICS',
  SPACE_WEATHER: 'SPACE WEATHER',
  ASTEROIDS: 'ASTEROIDS',
  COMETS: 'COMETS',
  SPACECRAFT: 'SPACECRAFT',
  NASA_MISSIONS: 'NASA MISSIONS',
  TELESCOPES: 'TELESCOPES',
  JWST: 'JAMES WEBB SPACE TELESCOPE',
  ASTROBIOLOGY: 'ASTROBIOLOGY',
  EARTH_OBSERVATION: 'EARTH OBSERVATION',
  SPACE_DEBRIS: 'SPACE DEBRIS',
  COSMOLOGY: 'COSMOLOGY',
  HUMAN_SPACEFLIGHT: 'HUMAN SPACEFLIGHT',
  SPACE_ENGINEERING: 'SPACE ENGINEERING'
};

export const DISCOVERY_TYPES = {
  CONTEXTUAL: 'CONTEXTUAL DISCOVERY',
  SCALE_SHOCK: 'SCALE SHOCK',
  COSMIC_CONTRADICTION: 'COSMIC CONTRADICTION',
  HUMAN_CONNECTION: 'HUMAN CONNECTION',
  MISSION_CONNECTION: 'MISSION CONNECTION',
  WEIRD_PART: 'THE WEIRD PART',
  NEXT_DISCOVERY: 'NEXT DISCOVERY'
};

export const RARITY_LEVELS = {
  COMMON: { label: 'COMMON', color: 'rgba(56, 189, 248, 0.9)', glow: 'rgba(56, 189, 248, 0.25)' },
  UNCOMMON: { label: 'UNCOMMON', color: 'rgba(129, 140, 248, 0.9)', glow: 'rgba(129, 140, 248, 0.25)' },
  RARE: { label: 'RARE', color: 'rgba(234, 179, 8, 0.95)', glow: 'rgba(234, 179, 8, 0.3)' },
  SIGNATURE: { label: 'SIGNATURE', color: 'rgba(244, 63, 94, 0.95)', glow: 'rgba(244, 63, 94, 0.35)' }
};

export const HUMANITY_DIMENSIONS = {
  DISTANCE: 'DISTANCE & SCALE',
  COMMUNICATION: 'COMMUNICATION & TELEMETRY',
  TIME: 'TIME & COSMIC MEMORY',
  ENERGY: 'ENERGY & RADIATION',
  RISK: 'PHYSIOLOGICAL RISK',
  RESOURCES: 'RESOURCE LIMITATIONS',
  EXPLORATION: 'HUMAN EXPLORATION & ETHICS'
};

export const COSMIC_DISCOVERIES = [
  {
    id: 'mars_blue_sunset',
    category: DISCOVERY_CATEGORIES.PLANETS,
    type: DISCOVERY_TYPES.COSMIC_CONTRADICTION,
    rarity: 'SIGNATURE',
    title: 'The Blue Sunsets and Silent Acoustics of Mars',
    shortFact: 'Mars has an atmosphere of 95.3% CO2 at an average surface pressure of only 6.1 hPa (0.006 atm)—less than 1% of Earth\'s sea-level pressure.',
    twist: 'Unlike Earth, Martian sunsets glow cold twilight-blue around the solar disk, and high-pitched sounds die out within just 5 meters due to carbon dioxide vibrational relaxation.',
    whyItMatters: 'Mie scattering from fine ferric oxide dust selectively scatters blue light forward into the observer\'s eye. Meanwhile, CO2 absorbs acoustic wave energy at high frequencies, requiring radio or acoustic amplification for future astronauts standing even arm\'s-length apart.',
    weirdPart: 'If an astronaut screamed with a broken radio at 10 meters distance, another astronaut wouldn\'t hear their high screams at all—only muffled, low bass rumbles would survive the thin carbon dioxide air.',
    humanityContext: {
      dimension: HUMANITY_DIMENSIONS.COMMUNICATION,
      analogy: 'Human voices on Mars sound muffled and pitched down, as if speaking through thick felt blankets across a whisper distance.',
      meaning: 'Human speech relies entirely on our nitrogen-oxygen atmospheric density. Beyond Earth, natural acoustic dialogue is an evolutionary privilege.'
    },
    triggerContext: ['MARS', 'ATMOSPHERE', 'PRESSURE', 'COMMUNICATION_DELAY', 'SCENARIO_COMMUNICATION'],
    relatedTopics: ['earth_carbon_breath', 'venus_super_rotation', 'human_microgravity_fluids', 'voyager_telemetry'],
    source: 'NASA-PERSEVERANCE-2022',
    sourceTitle: 'Maurice et al., "In situ recording of Mars soundscape", Nature (2022) & NASA Mars Curiosity Mastcam Optical Studies',
    sourceURL: 'https://doi.org/10.1038/s41586-022-04679-0',
    educationalLevel: 'INTERMEDIATE',
    priority: 10
  },
  {
    id: 'venus_super_rotation',
    category: DISCOVERY_CATEGORIES.PLANETS,
    type: DISCOVERY_TYPES.COSMIC_CONTRADICTION,
    rarity: 'RARE',
    title: 'Venusian Super-Rotation & The Lead-Melting Greenhouse',
    shortFact: 'Venus surface temperature reaches 464°C (737 K) under 93 bars of atmospheric pressure, hotter than Mercury despite receiving only 25% of Mercury\'s solar flux.',
    twist: 'Venus rotates so slowly that one day (243 Earth days) is longer than its entire year (225 Earth days)—yet its high-altitude hurricane atmosphere circles the globe in just 4 days.',
    whyItMatters: 'This "atmospheric super-rotation" is powered by thermal solar tidal waves and thermal inertia. It provides humanity\'s most critical natural laboratory for the runaway greenhouse effect, demonstrating how water oceans can evaporate and lock an Earth-sized world in an irreversible thermal trap.',
    weirdPart: 'At Venus\'s surface, the 93 atmospheres of CO2 become a supercritical fluid—a strange state of matter that is simultaneously a gas and a liquid, dense enough to warp optical refraction so the horizon curves upward like a bowl.',
    humanityContext: {
      dimension: HUMANITY_DIMENSIONS.ENERGY,
      analogy: 'The surface of Venus is hot enough to melt zinc and lead; a standard household oven on maximum self-clean is still 100°C cooler than a calm Venusian afternoon.',
      meaning: 'Planetary habitability is not merely distance from the Sun; the chemical constitution of a planet\'s atmosphere dictates whether it becomes a garden or a furnace.'
    },
    triggerContext: ['SOLAR_SYSTEM', 'ATMOSPHERE', 'SOLAR_ENVIRONMENT', 'HEAT'],
    relatedTopics: ['mars_blue_sunset', 'solar_coronal_paradox', 'trappist_seven_earths'],
    source: 'NASA-VEXAG-2023',
    sourceTitle: 'NASA Venus Exploration Analysis Group (VEXAG) Strategic Plan & ESA Venus Express VIRTIS Atmospheric Dynamics',
    sourceURL: 'https://www.lpi.usra.edu/vexag/reports/VEXAG_Goals_2023.pdf',
    educationalLevel: 'ADVANCED',
    priority: 8
  },
  {
    id: 'moon_regolith_gunpowder',
    category: DISCOVERY_CATEGORIES.MOONS,
    type: DISCOVERY_TYPES.HUMAN_CONNECTION,
    rarity: 'SIGNATURE',
    title: 'The Gunpowder Scent & Razor Glass Shards of Lunar Regolith',
    shortFact: 'Apollo astronauts on all six lunar landings consistently noted that lunar dust brought inside the Lunar Module smelled distinctly like spent gunpowder.',
    twist: 'Because the Moon has no atmosphere, wind, or rain, lunar dust grains are never weathered or rounded; every particle is a microscopic razor-sharp shard of impact glass and basalt.',
    whyItMatters: 'Without atmospheric passivation, the broken chemical bonds of freshly fractured lunar dust contain reactive free radicals. When exposed to lunar module cabin air, these radicals oxidized rapidly, releasing the gunpowder smell and causing acute "lunar hay fever" in crewmembers.',
    weirdPart: 'Solar ultraviolet rays knock electrons out of surface dust grains on the Moon\'s dayside, causing thousands of tons of electrostatic dust to levitate in transparent fountains hundreds of meters into the sky along the day-night terminator.',
    humanityContext: {
      dimension: HUMANITY_DIMENSIONS.RISK,
      analogy: 'Walking on the Moon is like walking on a desert made entirely of microscopic glass knives that slice through fabric seals, destroy mechanical bearings, and irritate lungs.',
      meaning: 'Earth\'s atmosphere does not just provide oxygen; by driving weather and erosion, it constantly grinds abrasive rocks into harmless, rounded river stones.'
    },
    triggerContext: ['MOON', 'GRAVITY_EXPERIENCE', 'REGOLITH', 'ATMOSPHERE'],
    relatedTopics: ['human_microgravity_fluids', 'tardigrades_vacuum', 'dart_kinetic_deflection'],
    source: 'NASA-APOLLO-ALSJ',
    sourceTitle: 'NASA Apollo Lunar Surface Journal (Schmitt, Cernan, Armstrong) & NASA TP-2016-218602 Lunar Dust Toxicity',
    sourceURL: 'https://www.nasa.gov/mission_pages/apollo/alsj/',
    educationalLevel: 'INTRODUCTORY',
    priority: 9
  },
  {
    id: 'europa_ocean_depths',
    category: DISCOVERY_CATEGORIES.MOONS,
    type: DISCOVERY_TYPES.SCALE_SHOCK,
    rarity: 'RARE',
    title: 'Europa: An Ocean Moon With Twice the Water of Earth',
    shortFact: 'Beneath an ice crust 15 to 25 km thick, Jupiter\'s moon Europa harbors a global subterranean liquid saltwater ocean 60 to 150 km deep.',
    twist: 'Even though Europa is smaller than Earth\'s Moon (diameter 3,122 km), its hidden ocean holds more than twice the liquid water of all of Earth\'s oceans, rivers, and lakes combined.',
    whyItMatters: 'Gravitational tidal flexing from Jupiter and sibling moons Io and Ganymede continuously kneads Europa\'s interior, providing geothermal heating. Hydrothermal vents on its ocean floor could supply chemical energy for chemosynthetic life completely independent of solar energy.',
    weirdPart: 'Giant chaotic "freckle" ice formations on Europa\'s surface indicate that plumes of warm slushy ice rise through the frozen shell like a planetary lava lamp, periodically venting water plumes into space.',
    humanityContext: {
      dimension: HUMANITY_DIMENSIONS.EXPLORATION,
      analogy: 'If Europa\'s entire liquid volume were placed into a single sphere, it would measure 1,750 km across—drastically dwarfing Earth\'s comparatively shallow surface ocean layer.',
      meaning: 'The habitable zone of a star system is not the only place where liquid water thrives. Tidal energy allows ocean worlds to exist billions of kilometers out in the freezing deep space.'
    },
    triggerContext: ['SOLAR_SYSTEM', 'OCEANS', 'WATER', 'ASTROBIOLOGY'],
    relatedTopics: ['trappist_seven_earths', 'tardigrades_vacuum', 'jwst_early_galaxies'],
    source: 'NASA-EUROPA-CLIPPER',
    sourceTitle: 'NASA Europa Clipper Science Mission Briefing (JPL/APL) & Kivelson et al., Science (2000) Induced Magnetic Field Measurements',
    sourceURL: 'https://www.jpl.nasa.gov/missions/europa-clipper',
    educationalLevel: 'INTERMEDIATE',
    priority: 8
  },
  {
    id: 'solar_coronal_paradox',
    category: DISCOVERY_CATEGORIES.SOLAR_PHYSICS,
    type: DISCOVERY_TYPES.COSMIC_CONTRADICTION,
    rarity: 'SIGNATURE',
    title: 'The Coronal Heating Paradox: An Atmosphere 300x Hotter Than Its Star',
    shortFact: 'The visible surface of the Sun (photosphere) is roughly 5,500°C (5,800 K), but its outer atmosphere (corona) skyrockets to 1,000,000°C to 3,000,000°C.',
    twist: 'Defying ordinary thermal intuition, walking away from the nuclear fusion furnace in the core makes the solar gas hundreds of times hotter instead of cooler.',
    whyItMatters: 'Magnetic reconnection events ("nanoflares") and magnetohydrodynamic Alfvén waves channel magnetic energy directly into plasma particles. This superheated plasma expands at supersonic speeds, driving the solar wind that shields the solar system while subjecting planets to space weather.',
    weirdPart: 'Despite being over 1,000,000°C, the corona is so diffuse that a spacecraft passing through it (such as NASA\'s Parker Solar Probe) absorbs heat primarily from radiant sunlight, not from contact with the million-degree particles.',
    humanityContext: {
      dimension: HUMANITY_DIMENSIONS.ENERGY,
      analogy: 'Imagine standing near a campfire where the air at your feet is warm, but stepping 10 paces back into the cold night suddenly incinerates your hair.',
      meaning: 'Magnetic fields are not passive lines on a chart; in space plasma, magnetic topology is an explosive engine capable of accelerating particles to significant fractions of light speed.'
    },
    triggerContext: ['SOLAR_SYSTEM', 'SOLAR_ENVIRONMENT', 'SCENARIO_SOLAR', 'RADIATION'],
    relatedTopics: ['carrington_superstorm', 'magnetar_starquake', 'parker_solar_probe'],
    source: 'NASA-PARKER-2023',
    sourceTitle: 'NASA Parker Solar Probe Science Team (Fox et al., Space Science Reviews) & Raouafi et al., Nature Astronomy',
    sourceURL: 'https://doi.org/10.1038/s41550-023-01962-z',
    educationalLevel: 'ADVANCED',
    priority: 9
  },
  {
    id: 'carrington_superstorm',
    category: DISCOVERY_CATEGORIES.SPACE_WEATHER,
    type: DISCOVERY_TYPES.MISSION_CONNECTION,
    rarity: 'RARE',
    title: 'The 1859 Carrington Event: When Telegraph Wires Ran on Solar Fury',
    shortFact: 'On September 1–2, 1859, the most extreme Coronal Mass Ejection (CME) in recorded history slammed into Earth\'s magnetosphere in just 17.6 hours.',
    twist: 'The geomagnetic induction was so immense that telegraph operators disconnected their chemical batteries and sent transatlantic telegrams using purely the electrical current induced in the wires by the sky.',
    whyItMatters: 'In 1859, civilization possessed few electrical conduits. Today, a Carrington-class superstorm would induce thousands of amperes into extra-high-voltage power transformers, pipeline grids, and GPS constellations, threatening multi-year power blackouts across continents.',
    weirdPart: 'Auroras lit up night skies in the Caribbean and Hawaii; in the Rocky Mountains, the sky was so bright that gold miners woke at 1:00 AM and began cooking breakfast thinking the Sun had risen.',
    humanityContext: {
      dimension: HUMANITY_DIMENSIONS.RISK,
      analogy: 'Our entire digital civilization sits inside the fluctuating outer atmosphere of a variable fusion star, protected only by an invisible magnetic cocoon.',
      meaning: 'Space weather is not an abstract astrophysical novelty; it is an existential technological vulnerability that requires real-time solar observatories.'
    },
    triggerContext: ['SOLAR_ENVIRONMENT', 'SCENARIO_SOLAR', 'EARTH', 'MAGNETIC_FIELD'],
    relatedTopics: ['solar_coronal_paradox', 'space_debris_kessler', 'voyager_telemetry'],
    source: 'NOAA-SWPC-CARRINGTON',
    sourceTitle: 'National Academy of Sciences Report: "Severe Space Weather Events: Understanding Societal and Economic Impacts" (2008)',
    sourceURL: 'https://doi.org/10.17226/12507',
    educationalLevel: 'INTERMEDIATE',
    priority: 8
  },
  {
    id: 'blackhole_time_dilation',
    category: DISCOVERY_CATEGORIES.BLACK_HOLES,
    type: DISCOVERY_TYPES.SCALE_SHOCK,
    rarity: 'SIGNATURE',
    title: 'General Relativity: The Freezing of Time at the Event Horizon',
    shortFact: 'Around the supermassive black hole Sagittarius A* (4.1 million solar masses at the center of the Milky Way), gravitational potential bends spacetime to its absolute geometric limit.',
    twist: 'An astronaut falling into a supermassive black hole crosses the event horizon in finite seconds according to their own wristwatch, but a distant observer watching them sees them slow down, turn red, and freeze at the horizon forever.',
    whyItMatters: 'Albert Einstein\'s field equations prove that there is no absolute clock in the cosmos. Mass curves the metric tensor of spacetime; where gravity is infinite, time itself is halted relative to the external universe.',
    weirdPart: 'For supermassive black holes, the tidal gravity forces at the event horizon are so gentle that an astronaut would cross the threshold without feeling stretched or spaghettified—they would simply be unable to ever send a signal back out.',
    humanityContext: {
      dimension: HUMANITY_DIMENSIONS.TIME,
      analogy: 'To an outside observer, every particle that has ever fallen toward a black hole since the Big Bang appears frozen like a holographic photograph on its outer surface.',
      meaning: 'Time is not a universal river that flows equally for all beings; it is an elastic, local dimension dictated by gravity and velocity.'
    },
    triggerContext: ['SOLAR_SYSTEM', 'GRAVITY_EXPERIENCE', 'TIME', 'GENERAL_RELATIVITY'],
    relatedTopics: ['magnetar_starquake', 'jwst_early_galaxies', 'lagrange_islands'],
    source: 'EHT-COLLAB-2022',
    sourceTitle: 'Event Horizon Telescope Collaboration et al., "First Sagittarius A* Event Horizon Telescope Results", ApJL (2022)',
    sourceURL: 'https://doi.org/10.3847/2041-8213/ac6674',
    educationalLevel: 'ADVANCED',
    priority: 10
  },
  {
    id: 'magnetar_starquake',
    category: DISCOVERY_CATEGORIES.NEUTRON_STARS,
    type: DISCOVERY_TYPES.SCALE_SHOCK,
    rarity: 'SIGNATURE',
    title: 'Magnetars: Magnetic Fields That Deform the Geometry of Atoms',
    shortFact: 'A magnetar is an ultradense neutron star with a magnetic field strength exceeding 100 billion Tesla (10^15 Gauss)—a quadrillion times stronger than Earth\'s magnetic field.',
    twist: 'At a distance of 1,000 kilometers from a magnetar, its magnetic field is so violent that it compresses spherical atomic electron clouds into needle-like cylinders, instantly dissolving all biological chemistry and molecular bonds.',
    whyItMatters: 'In these fields, the energy stored in the magnetic field exceeds the rest-mass energy of electrons, causing quantum electrodynamics (QED) effects where photons split into two, and the vacuum itself polarizes light like a birefringent crystal.',
    weirdPart: 'On December 27, 2004, a "starquake" on magnetar SGR 1806-20 cracked its crust by a fraction of a millimeter. The burst released more energy in 0.1 seconds than the Sun emits in 150,000 years, physically ionizing Earth\'s upper atmosphere from 50,000 light-years away.',
    humanityContext: {
      dimension: HUMANITY_DIMENSIONS.ENERGY,
      analogy: 'If a magnetar were brought to the distance of the Moon, its magnetic field would erase the magnetic strips of every credit card on Earth and tear metallic objects apart.',
      meaning: 'Nuclear matter under extreme gravity creates regimes where the fundamental forces of electromagnetism and quantum physics reach their theoretical cosmological maximum.'
    },
    triggerContext: ['SOLAR_SYSTEM', 'MAGNETIC_FIELD', 'ENERGY', 'NEUTRON_STARS'],
    relatedTopics: ['blackhole_time_dilation', 'solar_coronal_paradox', 'oumuamua_interstellar'],
    source: 'NASA-SWIFT-FERMI',
    sourceTitle: 'Hurley et al., "An exceptionally bright flare from SGR 1806-20 and the origins of short-duration gamma-ray bursts", Nature (2005)',
    sourceURL: 'https://doi.org/10.1038/nature03519',
    educationalLevel: 'ADVANCED',
    priority: 9
  },
  {
    id: 'trappist_seven_earths',
    category: DISCOVERY_CATEGORIES.EXOPLANETS,
    type: DISCOVERY_TYPES.HUMAN_CONNECTION,
    rarity: 'RARE',
    title: 'TRAPPIST-1: Seven Earth-Sized Worlds in Resonant Clockwork',
    shortFact: '40 light-years away in Aquarius, an ultra-cool M-dwarf star hosts seven terrestrial rocky planets, three of which orbit inside the conservative liquid-water habitable zone.',
    twist: 'The entire seven-planet system is so tightly packed that all seven worlds orbit closer to their host star than Mercury orbits our Sun; standing on one, neighboring planets loom larger in the sky than the full Moon appears from Earth.',
    whyItMatters: 'All seven planets are locked in a three-body Laplace resonance chain (24:15:9:6:4:3:2), meaning their orbital periods form precise harmonic musical ratios. M-dwarf stars burn nuclear hydrogen so slowly they will live for over 10 trillion years—long after our Sun has died.',
    weirdPart: 'Travel times between adjacent TRAPPIST-1 worlds with chemical rockets would be measured in days or weeks, rather than months or years, making interplanetary travel between distinct planetary biospheres a tangible physical possibility.',
    humanityContext: {
      dimension: HUMANITY_DIMENSIONS.EXPLORATION,
      analogy: 'Imagine standing on a terrestrial beach where looking up reveals two other Earth-sized worlds hovering in the sky, with visible continents and cloud patterns.',
      meaning: 'Our solar system\'s vast, lonely distances are not the only planetary architecture; the cosmos contains dense families of worlds clustered in orbital harmony.'
    },
    triggerContext: ['SOLAR_SYSTEM', 'EXOPLANETS', 'ASTROBIOLOGY', 'HABITABILITY'],
    relatedTopics: ['europa_ocean_depths', 'jwst_early_galaxies', 'tardigrades_vacuum'],
    source: 'NASA-SPITZER-ESO',
    sourceTitle: 'Gillon et al., "Seven temperate terrestrial planets around the nearby ultracool dwarf star TRAPPIST-1", Nature (2017)',
    sourceURL: 'https://doi.org/10.1038/nature21360',
    educationalLevel: 'INTERMEDIATE',
    priority: 8
  },
  {
    id: 'jwst_early_galaxies',
    category: DISCOVERY_CATEGORIES.JWST,
    type: DISCOVERY_TYPES.SCALE_SHOCK,
    rarity: 'SIGNATURE',
    title: 'JWST & The "Impossible" Primordial Infant Galaxies',
    shortFact: 'Operating at Sun-Earth Lagrange Point 2 (1.5 million km from Earth), the James Webb Space Telescope\'s 6.5-meter beryllium primary mirror detects infrared photons red-shifted by cosmic expansion.',
    twist: 'Light captured from galaxy JADES-GS-z14-0 left its stars when the universe was only 290 million years old (z = 14.32)—yet the galaxy is already billions of times more luminous and mature than standard cosmological models predicted.',
    whyItMatters: 'Finding massive, dusty, element-rich galaxies so close to the Big Bang challenges our fundamental understanding of how rapidly early gas clouds collapsed, how the first Population III stars formed, and how supermassive black hole seeds grew.',
    weirdPart: 'Because the universe expanded while this light traveled over 13.5 billion years, the galaxy is not 13.5 billion light-years away today; cosmic expansion has carried its current comoving distance to over 33.6 billion light-years.',
    humanityContext: {
      dimension: HUMANITY_DIMENSIONS.TIME,
      analogy: 'Looking through JWST is not seeing what space looks like today; it is watching the cosmic film reel running backward into the first morning of the universe.',
      meaning: 'Every telescope is a time machine. The farther out we peer into the spatial void, the closer we stand to the origin of all atoms in our bodies.'
    },
    triggerContext: ['SOLAR_SYSTEM', 'TELESCOPES', 'COSMOLOGY', 'TIME'],
    relatedTopics: ['blackhole_time_dilation', 'trappist_seven_earths', 'voyager_telemetry'],
    source: 'STScI-JWST-2024',
    sourceTitle: 'Carniani et al., "A shining cosmic dawn: spectroscopic confirmation of two luminous galaxies at z~14", Nature (2024)',
    sourceURL: 'https://doi.org/10.1038/s41586-024-07860-9',
    educationalLevel: 'ADVANCED',
    priority: 10
  },
  {
    id: 'voyager_telemetry',
    category: DISCOVERY_CATEGORIES.SPACECRAFT,
    type: DISCOVERY_TYPES.MISSION_CONNECTION,
    rarity: 'SIGNATURE',
    title: 'Voyager 1: A 20-Watt Lightbulb Whispering Across 24 Billion Kilometers',
    shortFact: 'Launched in 1977, Voyager 1 is the most distant human object in existence, cruising interstellar space at over 61,000 km/h at a distance exceeding 24.3 billion km (162.6 AU).',
    twist: 'Voyager\'s transmitter radiates only 20 watts of radio frequency power—about the same as a refrigerator lightbulb. By the time that signal reaches Earth 22.5 hours later, the received power is less than a billionth of a trillionth of a watt (10^-21 W).',
    whyItMatters: 'To recover this sub-femtowatt signal, NASA\'s Deep Space Network uses 70-meter parabolic reflector antennas linked with ruby maser low-noise amplifiers cooled by liquid helium to 4 Kelvin (-269°C), filtering signals buried under cosmic background noise.',
    weirdPart: 'The computer systems commanding Voyager 1 possess roughly 68 kilobytes of total memory—less memory than is required to display an emoji on a modern smartphone screen.',
    humanityContext: {
      dimension: HUMANITY_DIMENSIONS.COMMUNICATION,
      analogy: 'Receiving Voyager\'s signal is equivalent to detecting the heat emitted by a candle on the surface of the Moon from a sensor on Earth.',
      meaning: 'Human consciousness has physically broken out of the heliosphere. Voyager 1 carries our Golden Record into eternity, outliving our planet itself.'
    },
    triggerContext: ['EARTH', 'COMMUNICATION_DELAY', 'SCENARIO_COMMUNICATION', 'TRAVEL_TRAJECTORY'],
    relatedTopics: ['oumuamua_interstellar', 'carrington_superstorm', 'lagrange_islands', 'mars_blue_sunset'],
    source: 'NASA-JPL-VOYAGER',
    sourceTitle: 'NASA Jet Propulsion Laboratory Voyager Interstellar Mission Status Report & DSN 810-005 Telecommunications Handbook',
    sourceURL: 'https://voyager.jpl.nasa.gov/mission/status/',
    educationalLevel: 'INTRODUCTORY',
    priority: 10
  },
  {
    id: 'dart_kinetic_deflection',
    category: DISCOVERY_CATEGORIES.ASTEROIDS,
    type: DISCOVERY_TYPES.MISSION_CONNECTION,
    rarity: 'UNCOMMON',
    title: 'NASA DART: Humanity\'s First Deliberate Asteroid Deflection',
    shortFact: 'On September 26, 2022, NASA\'s DART spacecraft intentionally crashed into Dimorphos, a 160-meter asteroid moonlet, at a relative velocity of 22,530 km/h (6.26 km/s).',
    twist: 'The impact was predicted to shorten Dimorphos\'s orbital period around Didymos by 10 minutes; instead, the explosive recoil momentum of ejected debris rocketed the asteroid, shortening its orbit by 33 minutes.',
    whyItMatters: 'The momentum enhancement factor (beta = 3.6) confirmed that crater ejecta acts like a rocket thruster in reverse, proving kinetic impact is a viable, actionable technique to protect Earth from catastrophic planetary impact.',
    weirdPart: 'The impact pulverized over 1,000 metric tons of boulder and gravel, producing a comet-like debris tail that stretched over 10,000 kilometers behind the asteroid for months.',
    humanityContext: {
      dimension: HUMANITY_DIMENSIONS.EXPLORATION,
      analogy: 'For 4.5 billion years, asteroids struck Earth and drove mass extinctions. For the first time in natural history, an Earth species altered the celestial orbit of a planetary body.',
      meaning: 'Unlike the dinosaurs, human beings possess the astrodynamic intelligence and engineering capability to defend our biosphere against cosmic bombardment.'
    },
    triggerContext: ['SOLAR_SYSTEM', 'ASTEROIDS', 'TRAVEL_TRAJECTORY', 'ORBIT'],
    relatedTopics: ['oumuamua_interstellar', 'space_debris_kessler', 'moon_regolith_gunpowder'],
    source: 'NASA-PDCO-DART',
    sourceTitle: 'Daly et al., "Successful Kinetic Impact into an Asteroid for Planetary Defense", Nature (2023)',
    sourceURL: 'https://doi.org/10.1038/s41586-023-05810-5',
    educationalLevel: 'INTERMEDIATE',
    priority: 8
  },
  {
    id: 'tardigrades_vacuum',
    category: DISCOVERY_CATEGORIES.ASTROBIOLOGY,
    type: DISCOVERY_TYPES.HUMAN_CONNECTION,
    rarity: 'UNCOMMON',
    title: 'Life in Raw Space: Extremophiles Surviving Cosmic Vacuum',
    shortFact: 'Tardigrades (water bears) and the bacterium Deinococcus radiodurans can survive ionizing radiation doses exceeding 5,000 to 15,000 Gray—thousands of times the lethal human dose.',
    twist: 'Mounted outside the International Space Station in open vacuum for three full years, Deinococcus bacterial aggregates survived solar ultraviolet irradiation, zero pressure, and temperature cycles from -120°C to +115°C.',
    whyItMatters: 'This establishes empirical support for "lithopanspermia"—the scientific hypothesis that living microbes could survive ejection from asteroid impacts on ancient Mars and travel inside rocky meteorites to seed early Earth.',
    weirdPart: 'When high-energy radiation breaks Deinococcus DNA into hundreds of fragmented double-strand pieces, the organism synthesizes specialized repair proteins that stitch its chromosomes back into flawless genetic code within hours.',
    humanityContext: {
      dimension: HUMANITY_DIMENSIONS.EXPLORATION,
      analogy: 'A radiation dose that destroys human bone marrow within days barely registers in an extremophile\'s cellular repair cycle.',
      meaning: 'Terrestrial biology is far tougher than individual humans. Life may be a durable cosmic phenomenon rather than a fragile Earthly coincidence.'
    },
    triggerContext: ['MOON', 'MARS', 'RADIATION', 'SOLAR_ENVIRONMENT', 'ASTROBIOLOGY'],
    relatedTopics: ['moon_regolith_gunpowder', 'europa_ocean_depths', 'human_microgravity_fluids'],
    source: 'JAXA-TANPOPO-2020',
    sourceTitle: 'Kawaguchi et al., "DNA Damage and Survival Time Course of Deinococcal Cell Pellets During 3 Years of Exposure Outside the ISS", Frontiers in Microbiology (2020)',
    sourceURL: 'https://doi.org/10.3389/fmicb.2020.02050',
    educationalLevel: 'INTERMEDIATE',
    priority: 7
  },
  {
    id: 'human_microgravity_fluids',
    category: DISCOVERY_CATEGORIES.HUMAN_SPACEFLIGHT,
    type: DISCOVERY_TYPES.HUMAN_CONNECTION,
    rarity: 'SIGNATURE',
    title: 'Cephalad Fluid Shift & Spinal Elongation in Zero-G',
    shortFact: 'In 1G on Earth, gravity pulls approximately 2 liters of blood and vascular fluid down into the legs. In microgravity, this hydrostatic gradient immediately vanishes.',
    twist: 'Astronauts experience an instant "cephalad fluid shift," causing their faces to swell ("puffy face") and legs to thin ("bird legs"), tricking their bodies into believing they have 20% excess blood.',
    whyItMatters: 'The central cardiovascular system compensates by rapidly suppressing erythropoietin and shedding up to 15% of total blood plasma within days. Returning to Earth causes severe orthostatic hypotension (blackouts) unless crew wear anti-G compression suits.',
    weirdPart: 'Without gravitational axial compression, intervertebral spinal discs expand. Astronauts on the ISS grow between 5 to 7 cm (2 to 3 inches) taller, frequently causing persistent lumbar back aches and changing suit sizing.',
    humanityContext: {
      dimension: HUMANITY_DIMENSIONS.RISK,
      analogy: 'Every organ and valve in the human vascular system evolved specifically to counter the downward pull of 9.8 m/s²; remove gravity, and our biology scrambles its own pressure sensors.',
      meaning: 'Human space exploration requires understanding our physiological architecture not as static machines, but as gravitational organisms.'
    },
    triggerContext: ['EARTH', 'GRAVITY_EXPERIENCE', 'SCENARIO_GRAVITY', 'BIOMECHANICS'],
    relatedTopics: ['moon_regolith_gunpowder', 'mars_blue_sunset', 'space_debris_kessler'],
    source: 'NASA-HRP-TWINS',
    sourceTitle: 'NASA Human Research Program & Garrett-Bakelman et al., "The NASA Twins Study: A multidimensional analysis of a year-long human spaceflight", Science (2019)',
    sourceURL: 'https://doi.org/10.1126/science.aau8650',
    educationalLevel: 'INTRODUCTORY',
    priority: 9
  },
  {
    id: 'lagrange_islands',
    category: DISCOVERY_CATEGORIES.SPACE_ENGINEERING,
    type: DISCOVERY_TYPES.MISSION_CONNECTION,
    rarity: 'COMMON',
    title: 'Lagrange Points: Parking Telescopes in Invisible Gravitational Canyons',
    shortFact: 'In any two-body gravitational orbital system (such as Sun-Earth or Earth-Moon), there exist exactly five mathematical equilibrium points: L1, L2, L3, L4, and L5.',
    twist: 'L1, L2, and L3 are mathematically unstable saddle points—like balancing a marble on top of a sharp ridge—yet spacecraft can orbit empty, invisible space around them in three-dimensional "halo orbits".',
    whyItMatters: 'Sun-Earth L2 allows the James Webb Space Telescope to keep Earth, the Moon, and the Sun perpetually in its rearview mirror, using a tennis-court-sized sunshield to drop its instruments to -233°C (40 K) without spending refrigeration fuel.',
    weirdPart: 'Jupiter\'s L4 and L5 points are gravitationally stable valleys; they have accumulated over 10,000 "Trojan asteroids"—fossil remnants from planetary accretion locked in place for 4.5 billion years.',
    humanityContext: {
      dimension: HUMANITY_DIMENSIONS.RESOURCES,
      analogy: 'Lagrange points are the deep-space equivalent of frictionless gravitational anchorages, allowing multi-billion-dollar observatories to stay parked using mere grams of station-keeping propellant.',
      meaning: 'Celestial mechanics provides invisible architectural foundations that make modern space observation energetically feasible.'
    },
    triggerContext: ['SOLAR_SYSTEM', 'TRAVEL_TRAJECTORY', 'SCENARIO_ORBIT', 'TELESCOPES'],
    relatedTopics: ['jwst_early_galaxies', 'voyager_telemetry', 'dart_kinetic_deflection'],
    source: 'NASA-GSFC-LAGRANGE',
    sourceTitle: 'NASA Goddard Space Flight Center: "The Orbit of JWST" (Markley et al.) & SOHO Mission at Sun-Earth L1',
    sourceURL: 'https://webb.nasa.gov/content/about/orbit.html',
    educationalLevel: 'INTERMEDIATE',
    priority: 7
  },
  {
    id: 'earth_carbon_breath',
    category: DISCOVERY_CATEGORIES.EARTH_OBSERVATION,
    type: DISCOVERY_TYPES.CONTEXTUAL,
    rarity: 'COMMON',
    title: 'Watching Earth Breathe: Global Carbon Pulses from Space',
    shortFact: 'NASA\'s Orbiting Carbon Observatory (OCO-2 & OCO-3) measures atmospheric carbon dioxide concentrations from low Earth orbit with precision better than 1 part per million.',
    twist: 'From orbital altitude, the biosphere of Earth can literally be observed inhaling and exhaling: every northern spring, planetary CO2 plunges as boreal forests bloom, then surges every autumn as biomass decays.',
    whyItMatters: 'Satellite infrared spectroscopy separates human industrial fossil emissions from natural volcanic and vegetative fluxes, giving humanity an objective planetary mirror to evaluate ecological stewardship and climate treaties.',
    weirdPart: 'In severe drought and heatwave years, portions of the Amazon basin absorb so little carbon that they temporarily flip from being the planet\'s greatest terrestrial carbon sink into net carbon emitters.',
    humanityContext: {
      dimension: HUMANITY_DIMENSIONS.EXPLORATION,
      analogy: 'Looking at Earth from orbit reveals a single integrated biological organism whose metabolic pulse can be measured in gigatons of gas every season.',
      meaning: 'Space exploration does not mean abandoning Earth; looking back from orbit provides the only tool capable of diagnosing our home planet\'s health.'
    },
    triggerContext: ['EARTH', 'ATMOSPHERE', 'SCENARIO_SOLAR', 'EARTH_OBSERVATION'],
    relatedTopics: ['mars_blue_sunset', 'venus_super_rotation', 'space_debris_kessler'],
    source: 'NASA-JPL-OCO2',
    sourceTitle: 'Crisp et al., "The Orbiting Carbon Observatory-2 (OCO-2) Mission", Journal of Applied Remote Sensing & NASA JPL Carbon Cycle Studies',
    sourceURL: 'https://ocov2.jpl.nasa.gov/',
    educationalLevel: 'INTRODUCTORY',
    priority: 7
  },
  {
    id: 'oumuamua_interstellar',
    category: DISCOVERY_CATEGORIES.COMETS,
    type: DISCOVERY_TYPES.SCALE_SHOCK,
    rarity: 'RARE',
    title: '1I/ʻOumuamua: The Hyperbolic Traveler from Beyond Our Sun',
    shortFact: 'On October 19, 2017, the Pan-STARRS1 telescope discovered 1I/ʻOumuamua moving with an orbital eccentricity of 1.20—the first confirmed macroscopic interstellar object ever observed passing through our solar system.',
    twist: 'ʻOumuamua showed slight non-gravitational acceleration moving away from the Sun, yet optical and infrared telescopes detected absolutely zero cometary dust, water vapor, or carbon monoxide outgassing tails.',
    whyItMatters: 'Interstellar objects prove that planetary systems routinely fling trillions of asteroid- and comet-sized planetesimals into the galactic void during early dynamical orbital migration, transferring prebiotic building blocks between stars.',
    weirdPart: 'Its light curve varied in brightness by a factor of 10 every 7.3 hours, demonstrating an extreme needle-like or disc-like shape with an aspect ratio of roughly 6:1—more extreme than any known asteroid in our solar system.',
    humanityContext: {
      dimension: HUMANITY_DIMENSIONS.TIME,
      analogy: 'A piece of rock forged in the circumstellar disc of an unknown star hundreds of millions of years ago passed within our sight for just a few brief weeks before returning to the dark galactic void forever.',
      meaning: 'The solar system is not a closed terrarium; it is constantly traversed by debris expelled from distant, unknown star systems.'
    },
    triggerContext: ['SOLAR_SYSTEM', 'COMETS', 'ASTEROIDS', 'TRAVEL_TRAJECTORY'],
    relatedTopics: ['dart_kinetic_deflection', 'voyager_telemetry', 'magnetar_starquake'],
    source: 'NASA-Meech-2017',
    sourceTitle: 'Meech et al., "A brief visit from a red and extremely elongated interstellar asteroid", Nature (2017) & NASA Planetary Science Division',
    sourceURL: 'https://doi.org/10.1038/nature25020',
    educationalLevel: 'INTERMEDIATE',
    priority: 8
  },
  {
    id: 'space_debris_kessler',
    category: DISCOVERY_CATEGORIES.SPACE_DEBRIS,
    type: DISCOVERY_TYPES.MISSION_CONNECTION,
    rarity: 'UNCOMMON',
    title: 'The Kessler Syndrome: Orbital Collision Cascades in Low Earth Orbit',
    shortFact: 'Over 36,000 tracked space debris fragments larger than 10 cm—and over 130 million millimeter-sized fragments—circle Earth in Low Earth Orbit at speeds around 7.8 km/s (28,000 km/h).',
    twist: 'At orbital velocity, a paint fleck just 1 mm wide carries the kinetic punch of a dropped bowling ball, and a 1 cm bolt hits with the explosive force of a hand grenade.',
    whyItMatters: 'NASA astrophysicist Donald J. Kessler proved that once debris density crosses a critical threshold, random collisions create clouds of shrapnel that trigger further collisions in an exponential cascade, potentially locking humanity out of Low Earth Orbit for centuries.',
    weirdPart: 'The International Space Station must routinely fire its thrusters to duck out of the way of defunct satellite fragments whenever radar tracking predicts an object crossing its 25 x 4 x 4 km safety corridor.',
    humanityContext: {
      dimension: HUMANITY_DIMENSIONS.EXPLORATION,
      analogy: 'Imagine driving on a dark highway where thousands of bullets are flying across the lanes at 28,000 km/h—and every car crash spawns hundreds of new bullets that never fall to the ground.',
      meaning: 'Low Earth orbit is a finite natural orbital resource; preserving orbital ecology is just as vital as preserving our oceans and atmosphere.'
    },
    triggerContext: ['EARTH', 'TRAVEL_TRAJECTORY', 'SCENARIO_ORBIT', 'SPACE_ENGINEERING'],
    relatedTopics: ['carrington_superstorm', 'dart_kinetic_deflection', 'human_microgravity_fluids', 'earth_carbon_breath'],
    source: 'NASA-ODPO-KESSLER',
    sourceTitle: 'Kessler & Cour-Palais, "Collision Frequency of Artificial Satellites: The Creation of a Debris Belt", JGR (1978) & NASA Orbital Debris Program Office',
    sourceURL: 'https://orbitaldebris.jsc.nasa.gov/',
    educationalLevel: 'INTRODUCTORY',
    priority: 7
  }
];

/**
 * Retrieve all discoveries.
 * @returns {Array}
 */
export function getAllDiscoveries() {
  return COSMIC_DISCOVERIES;
}

/**
 * Retrieve a specific discovery by ID.
 * @param {string} id 
 * @returns {Object|null}
 */
export function getDiscoveryById(id) {
  return COSMIC_DISCOVERIES.find(d => d.id === id) || null;
}

/**
 * Find discoveries matching a set of context tags.
 * @param {string|string[]} contextTags 
 * @returns {Array}
 */
export function getDiscoveriesByContext(contextTags) {
  const tags = Array.isArray(contextTags) ? contextTags : [contextTags];
  return COSMIC_DISCOVERIES.filter(d => 
    d.triggerContext.some(tc => tags.includes(tc))
  );
}

/**
 * Get related discoveries for a given discovery id.
 * @param {string} id 
 * @returns {Array}
 */
export function getRelatedDiscoveries(id) {
  const current = getDiscoveryById(id);
  if (!current || !current.relatedTopics) return [];
  return current.relatedTopics
    .map(relId => getDiscoveryById(relId))
    .filter(Boolean);
}

/**
 * Get distinct categories present in the database.
 * @returns {string[]}
 */
export function getAvailableCategories() {
  const set = new Set();
  COSMIC_DISCOVERIES.forEach(d => set.add(d.category));
  return Array.from(set);
}
