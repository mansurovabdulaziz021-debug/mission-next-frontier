/**
 * NASA Scenario Engine — Interactive "What Happens If?" Scientific Simulation Layer
 * MISSION // NEXT FRONTIER — Phase 4
 *
 * Provides decoupled state management, mathematical rules, and derived outputs
 * for educational exploration of interplanetary physics and space mission constraints.
 *
 * CORE PRINCIPLE:
 * USER CHANGES CONDITION -> SCIENTIFIC RELATIONSHIP -> DERIVED RESULT -> 3D VISUALIZATION -> CONTEXTUAL EXPLANATION
 */

export const SCENARIO_TYPES = {
  COMMUNICATION_DELAY: 'COMMUNICATION_DELAY',
  GRAVITY_EXPERIENCE:  'GRAVITY_EXPERIENCE',
  TRAVEL_TRAJECTORY:   'TRAVEL_TRAJECTORY',
  SOLAR_ENVIRONMENT:   'SOLAR_ENVIRONMENT'
};

export const SPEED_OF_LIGHT_KM_S = 299792.458; // Standard SI / IAU vacuum constant
export const G_EARTH = 9.80665;               // Standard Earth gravitational acceleration (m/s²)
export const SOLAR_CONSTANT_1AU = 1361.0;     // Total Solar Irradiance at 1 AU (W/m²)
export const GCR_BACKGROUND_MSV_DAY = 1.5;    // Interplanetary Galactic Cosmic Ray baseline (mSv/day)

export const SCENARIOS = {
  COMMUNICATION_DELAY: {
    id: 'COMMUNICATION_DELAY',
    title: 'Deep Space Communication Latency & Throughput',
    subtitle: 'Impact of Interplanetary Distance on Signal Transit Time & Teleoperation Feasibility',
    cameraFocus: 'MARS',
    educationalDisclaimer: 'Educational model assuming vacuum line-of-sight propagation at the speed of light (c = 299,792 km/s), neglecting tropospheric refraction (<10 ns) and solar coronal interference.',
    source: {
      org: 'NASA Jet Propulsion Laboratory (JPL) / Deep Space Network (DSN)',
      title: 'DSN Telecommunications Link Design Handbook (810-005) & DSOC',
      ref: 'NASA JPL DSN Handbook / Optical Communications Archival',
      url: 'https://eyes.nasa.gov/dsn/dsn.html'
    },
    parameters: [
      {
        id: 'target',
        label: 'TRANSMISSION DESTINATION & ALIGNMENT',
        type: 'select',
        options: [
          { id: 'EARTH_GEO', label: 'Earth GEO Orbit (35,786 km)', distanceKm: 35786, destKey: 'EARTH' },
          { id: 'MOON_MEAN', label: 'Moon // Luna-1 (384,400 km)', distanceKm: 384400, destKey: 'MOON' },
          { id: 'MARS_CLOSEST', label: 'Mars Closest Approach (54.6M km)', distanceKm: 54600000, destKey: 'MARS' },
          { id: 'MARS_MEAN', label: 'Mars Mean Opposition (225.4M km)', distanceKm: 225400000, destKey: 'MARS' },
          { id: 'MARS_CONJUNCTION', label: 'Mars Superior Conjunction (401.0M km)', distanceKm: 401000000, destKey: 'MARS' }
        ],
        default: 'MARS_MEAN'
      },
      {
        id: 'carrier',
        label: 'COMMUNICATION CARRIER FREQUENCY',
        type: 'segmented',
        options: [
          { id: 'X_BAND', label: 'X-Band (8.4 GHz RF)', bandwidthMbps: 2.0, lossDb: 0 },
          { id: 'KA_BAND', label: 'Ka-Band (32 GHz RF)', bandwidthMbps: 15.0, lossDb: -6 },
          { id: 'OPTICAL_LASER', label: 'Deep Space Optical / Laser (1550 nm)', bandwidthMbps: 120.0, lossDb: -14 }
        ],
        default: 'KA_BAND'
      }
    ],
    calculate(params) {
      const targetOpt = this.parameters[0].options.find(o => o.id === params.target) || this.parameters[0].options[3];
      const carrierOpt = this.parameters[1].options.find(o => o.id === params.carrier) || this.parameters[1].options[1];

      const distKm = targetOpt.distanceKm;
      const oneWaySec = distKm / SPEED_OF_LIGHT_KM_S;
      const roundTripSec = oneWaySec * 2;

      // Format latency strings
      const formatTime = (sec) => {
        if (sec < 1) return `${(sec * 1000).toFixed(1)} ms`;
        if (sec < 60) return `${sec.toFixed(2)} sec`;
        const mins = Math.floor(sec / 60);
        const remSec = (sec % 60).toFixed(1);
        return `${mins}m ${remSec}s`;
      };

      // Teleoperation regime determination
      let regime = '';
      let regimeBadge = '';
      let teleopFeasibility = '';
      if (roundTripSec < 1.0) {
        regime = 'REAL-TIME INTERACTIVE JOYSTICK';
        regimeBadge = 'mc__badge--realtime';
        teleopFeasibility = 'Direct low-latency manual teleoperation. Astronaut or ground controllers can pilot rovers and robotic manipulators with instantaneous tactile feedback.';
      } else if (roundTripSec <= 5.0) {
        regime = 'SUPERVISORY DELAYED CONTROL (LUNAR)';
        regimeBadge = 'mc__badge--supervisory';
        teleopFeasibility = '1.3 to 2.6s latency creates significant human operator over-correction. Requires waypoint-based move-and-wait supervisory control or onboard predictive display algorithms.';
      } else {
        regime = 'AUTONOMOUS SCRIPTED EXECUTION (DEEP SPACE)';
        regimeBadge = 'mc__badge--autonomous';
        teleopFeasibility = 'Direct human joystick control is physically impossible. Rovers must navigate hazard corridors using onboard computer vision, terrain classifiers, and autonomous command queues.';
      }

      // 4K image transmission time calculation (e.g. 50 MB raw frame = 400 Mbits)
      const dataSizeMbits = 400;
      const effectiveRateMbps = carrierOpt.bandwidthMbps * (targetOpt.id.includes('MARS') ? 0.35 : 1.0);
      const transferDurationSec = dataSizeMbits / effectiveRateMbps;

      return {
        target: targetOpt,
        carrier: carrierOpt,
        destKey: targetOpt.destKey,
        oneWaySec,
        roundTripSec,
        oneWayFormatted: formatTime(oneWaySec),
        roundTripFormatted: formatTime(roundTripSec),
        regime,
        regimeBadge,
        teleopFeasibility,
        bandwidthFormatted: `${effectiveRateMbps.toFixed(1)} Mbps`,
        imageTransferFormatted: formatTime(transferDurationSec),
        whatChanged: `Signal propagation path scaled to ${(distKm / 1e6).toFixed(1)} million kilometers. One-way signal latency is ${formatTime(oneWaySec)}.`,
        whyItMatters: `Because electromagnetic radio waves and laser photons propagate at finite light speed (299,792 km/s), deep space round-trip latency of ${formatTime(roundTripSec)} mandates fully autonomous robotic architectures. Ground control cannot prevent sudden catastrophic hazards in real time.`
      };
    }
  },

  GRAVITY_EXPERIENCE: {
    id: 'GRAVITY_EXPERIENCE',
    title: 'Planetary Gravity, Mass Scaling & Bio-Mechanics',
    subtitle: 'Comparative Surface Weight, Ballistic Jump Mechanics & Musculoskeletal Loading',
    cameraFocus: 'EARTH',
    educationalDisclaimer: 'Educational bio-mechanical model based on constant human takeoff kinetic energy (E = 0.5 * m * v²) and ballistic vertical trajectories under uniform planar surface gravitational acceleration.',
    source: {
      org: 'NASA Human Research Program (HRP) / Johnson Space Center',
      title: 'Risk of Impaired Performance Due to Reduced Gravity & Human Integration Design Handbook (HIDH)',
      ref: 'NASA/SP-2010-3407 / NASA HRP Evidence Books',
      url: 'https://humanresearchroadmap.nasa.gov/'
    },
    parameters: [
      {
        id: 'target',
        label: 'CELESTIAL SURFACE ENVIRONMENT',
        type: 'segmented',
        options: [
          { id: 'EARTH', label: 'Earth (1.000 g)', g: 9.807, ratio: 1.0, destKey: 'EARTH', color: '#38bdf8' },
          { id: 'MARS', label: 'Mars (0.379 g)', g: 3.721, ratio: 0.3794, destKey: 'MARS', color: '#f97316' },
          { id: 'MOON', label: 'Moon (0.165 g)', g: 1.622, ratio: 0.1654, destKey: 'MOON', color: '#94a3b8' }
        ],
        default: 'MARS'
      },
      {
        id: 'massKg',
        label: 'ASTRONAUT / EQUIPMENT PAYLOAD MASS',
        type: 'slider',
        min: 30,
        max: 250,
        step: 5,
        unit: 'kg',
        default: 80
      }
    ],
    calculate(params) {
      const targetOpt = this.parameters[0].options.find(o => o.id === params.target) || this.parameters[0].options[1];
      const mass = parseFloat(params.massKg) || 80;

      const g = targetOpt.g;
      const weightN = mass * g;
      const weightKgf = mass * targetOpt.ratio;

      // Ballistic vertical jump height model:
      // Standard Earth jump height baseline ~0.45 m for average astronaut
      const earthJumpHeightM = 0.45;
      const jumpHeightM = earthJumpHeightM * (G_EARTH / g);
      const jumpMult = (G_EARTH / g).toFixed(1);

      // Hang time calculation: t_hang = 2 * sqrt(2 * h / g)
      const hangTimeSec = 2 * Math.sqrt((2 * jumpHeightM) / g);

      // Musculoskeletal bone deconditioning rate (NASA HRP estimates without exercise countermeasure)
      let deconditioningText = '';
      if (targetOpt.id === 'EARTH') {
        deconditioningText = '0.0% / month (Natural 1.0 g gravitational equilibrium sustains bone mineral density).';
      } else if (targetOpt.id === 'MARS') {
        deconditioningText = '~1.0% to 1.5% bone mineral density loss per month without resistive exercise countermeasures (ARED/T2).';
      } else {
        deconditioningText = '~1.5% to 2.0% bone mineral density loss per month in 1/6th g; rapid cardiovascular stroke-volume re-adaptation.';
      }

      return {
        target: targetOpt,
        destKey: targetOpt.destKey,
        massKg: mass,
        weightN: weightN.toFixed(1),
        weightKgf: weightKgf.toFixed(1),
        jumpHeightM: jumpHeightM.toFixed(2),
        jumpMult,
        hangTimeSec: hangTimeSec.toFixed(2),
        deconditioningText,
        whatChanged: `Gravity acceleration altered to ${g.toFixed(3)} m/s² (${(targetOpt.ratio * 100).toFixed(1)}% Earth G). An ${mass} kg payload weighs only ${weightKgf.toFixed(1)} kgf (${weightN.toFixed(0)} N).`,
        whyItMatters: `Lower surface gravity drastically increases payload transport ease (jump height scales ${jumpMult}x), but absence of 1.0 g biomechanical mechanical loading triggers rapid skeletal calcium resorption and cardiac muscle atrophy, necessitating 2+ hours of daily resistive exercise.`
      };
    }
  },

  TRAVEL_TRAJECTORY: {
    id: 'TRAVEL_TRAJECTORY',
    title: 'Interplanetary Orbital Mechanics & Hohmann Delta-V',
    subtitle: 'Transit Flight Durations, Propellant Energy Requirements & Synodic Launch Windows',
    cameraFocus: 'SOLAR_SYSTEM',
    educationalDisclaimer: 'Educational orbital mechanics model based on two-body Keplerian Hohmann transfer ellipses with circular, coplanar planetary orbits around the Sun.',
    source: {
      org: 'NASA / Goddard Space Flight Center & JPL',
      title: 'Orbital Flight Handbook (SP-8007) & Fundamentals of Astrodynamics (Bate, Mueller, White)',
      ref: 'NASA SP-8007 Series / Astrodynamic Constants',
      url: 'https://ssd.jpl.nasa.gov/planets/approx_pos.html'
    },
    parameters: [
      {
        id: 'regime',
        label: 'INTERPLANETARY FLIGHT TRAJECTORY REGIME',
        type: 'select',
        options: [
          {
            id: 'LEO_TO_MOON',
            label: 'LEO → Lunar Gateway (Translunar Injection / TLI)',
            distanceAU: 0.00257,
            distanceKm: 384400,
            transitDays: 3.2,
            deltaVKmS: 3.12,
            synodicMonths: 1.0,
            destKey: 'MOON'
          },
          {
            id: 'EARTH_MARS_HOHMANN',
            label: 'Earth → Mars (Minimum-Energy Hohmann Ellipse)',
            distanceAU: 1.524,
            distanceKm: 225400000,
            transitDays: 259, // ~8.5 months
            deltaVKmS: 3.60,
            synodicMonths: 26.0,
            destKey: 'MARS'
          },
          {
            id: 'EARTH_MARS_FAST',
            label: 'Earth → Mars (Hyperbolic Fast Transit Trajectory)',
            distanceAU: 1.524,
            distanceKm: 225400000,
            transitDays: 180, // ~6 months
            deltaVKmS: 5.85,
            synodicMonths: 26.0,
            destKey: 'MARS'
          }
        ],
        default: 'EARTH_MARS_HOHMANN'
      },
      {
        id: 'propulsion',
        label: 'SPACECRAFT PROPULSION SPECIFIC IMPULSE (Isp)',
        type: 'segmented',
        options: [
          { id: 'CHEMICAL_LOX_CH4', label: 'Hydrolox / Methalox Chemical (Isp 380s)', ispSec: 380, exhaustVelKmS: 3.73 },
          { id: 'NUCLEAR_THERMAL', label: 'Nuclear Thermal Propulsion / NTP (Isp 900s)', ispSec: 900, exhaustVelKmS: 8.83 }
        ],
        default: 'CHEMICAL_LOX_CH4'
      }
    ],
    calculate(params) {
      const regimeOpt = this.parameters[0].options.find(o => o.id === params.regime) || this.parameters[0].options[1];
      const propOpt = this.parameters[1].options.find(o => o.id === params.propulsion) || this.parameters[1].options[0];

      // Tsiolkovsky Rocket Equation for mass ratio: m_initial / m_final = exp(deltaV / v_exhaust)
      const deltaV = regimeOpt.deltaVKmS;
      const vExhaust = propOpt.exhaustVelKmS;
      const massRatio = Math.exp(deltaV / vExhaust);
      const propellantFractionPct = ((1 - 1 / massRatio) * 100).toFixed(1);

      return {
        regime: regimeOpt,
        propulsion: propOpt,
        destKey: regimeOpt.destKey,
        distanceKmFormatted: (regimeOpt.distanceKm).toLocaleString() + ' km',
        transitDurationFormatted: regimeOpt.transitDays < 10 ? `${regimeOpt.transitDays.toFixed(1)} days` : `${regimeOpt.transitDays} days (~${(regimeOpt.transitDays / 30.4).toFixed(1)} months)`,
        deltaVFormatted: `${regimeOpt.deltaVKmS.toFixed(2)} km/s`,
        massRatioFormatted: massRatio.toFixed(2),
        propellantFractionPct,
        synodicMonthsFormatted: `${regimeOpt.synodicMonths.toFixed(0)} months (~${(regimeOpt.synodicMonths * 30.4).toFixed(0)} days)`,
        whatChanged: `Selected ${regimeOpt.label}. Transfer requires a minimum delta-v burn of ${regimeOpt.deltaVKmS.toFixed(2)} km/s and ${regimeOpt.transitDays} days transit time.`,
        whyItMatters: `Orbital physics dictates that you cannot fly directly in a straight line between planets. Spacecraft must coast along Keplerian heliocentric ellipses; launch windows recur only every ${regimeOpt.synodicMonths.toFixed(0)} months when planetary phase angles align, locking mission abort modes and return windows.`
      };
    }
  },

  SOLAR_ENVIRONMENT: {
    id: 'SOLAR_ENVIRONMENT',
    title: 'Solar Irradiance, Space Weather & Shielding',
    subtitle: 'Inverse-Square Radiative Flux, Solar Flare Events & Surface Shelter Requirements',
    cameraFocus: 'SOLAR_SYSTEM',
    educationalDisclaimer: 'Educational space physics model applying the inverse-square law for solar irradiance (S = S0 / r²) and simplified dose equivalent approximations based on NASA MSL RAD telemetry.',
    source: {
      org: 'NASA Space Weather Prediction Center (SWPC) & MSL RAD Science Team',
      title: 'Measurements of the Martian Radiation Environment and Solar Energetic Particle Events',
      ref: 'Science 343, Hassler et al. / NASA Space Radiation Laboratory (NSRL)',
      url: 'https://mars.nasa.gov/msl/mission/instruments/rad/'
    },
    parameters: [
      {
        id: 'location',
        label: 'HELIOCENTRIC EXPLORATION LOCATION',
        type: 'select',
        options: [
          { id: 'EARTH_LEO', label: 'Earth Orbit // LEO (1.000 AU)', rAU: 1.000, hasAtmosphere: true, hasMagneticField: true, destKey: 'EARTH' },
          { id: 'MOON_SURFACE', label: 'Lunar South Pole Surface (1.000 AU)', rAU: 1.000, hasAtmosphere: false, hasMagneticField: false, destKey: 'MOON' },
          { id: 'MARS_SURFACE', label: 'Martian Gale Crater Surface (1.524 AU)', rAU: 1.524, hasAtmosphere: true, hasMagneticField: false, destKey: 'MARS' }
        ],
        default: 'MARS_SURFACE'
      },
      {
        id: 'weather',
        label: 'SPACE WEATHER PHENOMENON',
        type: 'segmented',
        options: [
          { id: 'QUIET_SUN', label: 'Quiet Sun (GCR Baseline)', speFluxMultiplier: 1.0, eventText: 'Nominal galactic cosmic ray background flux.' },
          { id: 'CORONAL_MASS_EJECTION', label: 'Class-X Solar Flare / CME Event', speFluxMultiplier: 25.0, eventText: 'Relativistic solar energetic proton (SEP) storm impacting interplanetary corridor.' }
        ],
        default: 'CORONAL_MASS_EJECTION'
      },
      {
        id: 'shielding',
        label: 'STRUCTURAL HABITAT SHIELDING',
        type: 'segmented',
        options: [
          { id: 'SPACESUIT_ONLY', label: 'EVA Spacesuit (<0.5 g/cm²)', attenuation: 1.0 },
          { id: 'HAB_ALUMINUM', label: 'Standard Aluminum Hull (5 g/cm²)', attenuation: 0.65 },
          { id: 'REGOLITH_SHELTER', label: 'Buried Regolith Storm Shelter (50 g/cm²)', attenuation: 0.08 }
        ],
        default: 'HAB_ALUMINUM'
      }
    ],
    calculate(params) {
      const locOpt = this.parameters[0].options.find(o => o.id === params.location) || this.parameters[0].options[2];
      const weatherOpt = this.parameters[1].options.find(o => o.id === params.weather) || this.parameters[1].options[1];
      const shieldOpt = this.parameters[2].options.find(o => o.id === params.shielding) || this.parameters[2].options[1];

      // Inverse-square law for irradiance
      const irradiance = SOLAR_CONSTANT_1AU / (locOpt.rAU * locOpt.rAU);
      const solarAreaMultiplier = 1 / (irradiance / SOLAR_CONSTANT_1AU);

      // Radiation dose calculation (mSv/day)
      let baselineDose = GCR_BACKGROUND_MSV_DAY;
      if (locOpt.hasMagneticField && locOpt.hasAtmosphere) {
        baselineDose *= 0.005; // Earth magnetic and atmospheric shield blocks >99.5%
      } else if (locOpt.id === 'MARS_SURFACE') {
        baselineDose *= 0.45; // 6.1 hPa CO2 atmosphere + planetary shadow blocks ~55%
      } else if (locOpt.id === 'MOON_SURFACE') {
        baselineDose *= 0.50; // Moon planetary shadow blocks half of 4pi steradians
      }

      // Add SPE component during solar storm
      let speDose = 0;
      if (weatherOpt.id === 'CORONAL_MASS_EJECTION') {
        speDose = 18.0 * weatherOpt.speFluxMultiplier;
        if (locOpt.hasMagneticField) speDose *= 0.01;
        else if (locOpt.id === 'MARS_SURFACE') speDose *= 0.25;
      }

      const totalDoseUnshielded = baselineDose + speDose;
      const effectiveDose = totalDoseUnshielded * shieldOpt.attenuation;

      let safetyTag = '';
      let safetyClass = '';
      if (effectiveDose > 20) {
        safetyTag = 'CRITICAL RADIATION HAZARD // IMMEDIATE SHELTER REQUIRED';
        safetyClass = 'mc__badge--danger';
      } else if (effectiveDose > 2) {
        safetyTag = 'ELEVATED DOSE // TIME LIMITATION APPLIED';
        safetyClass = 'mc__badge--warning';
      } else {
        safetyTag = 'NOMINAL / SAFE PASSIVE DOSE RATE';
        safetyClass = 'mc__badge--safe';
      }

      return {
        location: locOpt,
        weather: weatherOpt,
        shielding: shieldOpt,
        destKey: locOpt.destKey,
        irradianceFormatted: `${irradiance.toFixed(1)} W/m²`,
        irradianceRatioPct: ((irradiance / SOLAR_CONSTANT_1AU) * 100).toFixed(1),
        solarAreaMultiplier: solarAreaMultiplier.toFixed(2),
        dailyDoseFormatted: `${effectiveDose.toFixed(2)} mSv/day`,
        safetyTag,
        safetyClass,
        whatChanged: `Heliocentric distance is ${locOpt.rAU.toFixed(3)} AU. Solar flux is ${irradiance.toFixed(1)} W/m² (${((irradiance / SOLAR_CONSTANT_1AU) * 100).toFixed(1)}% of Earth). Effective crew radiation dose is ${effectiveDose.toFixed(2)} mSv/day.`,
        whyItMatters: `Solar energy drops via the inverse-square law: Mars requires ${solarAreaMultiplier.toFixed(2)}x larger solar arrays for identical power. Simultaneously, lack of planetary magnetic shielding exposes crews to coronal mass ejections; a 50 g/cm² regolith storm shelter reduces the dose by 92%, proving why subsurface planetary habitats are critical.`
      };
    }
  }
};
