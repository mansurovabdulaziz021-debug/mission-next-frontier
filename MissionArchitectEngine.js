/**
 * MissionArchitectEngine.js — State & Logic Engine for Phase 9 Mission Architect
 * 
 * Orchestrates the Mission Architect workflow:
 *   - Target selection & validation
 *   - Objective selection & compatibility verification
 *   - Observation method pairing & trade-off evaluation
 *   - Mission constraint configuration
 *   - 3D spatial assembly triggering
 *   - Cinematic mission briefing generation
 *   - Full mission dossier compilation
 */

import {
  ARCHITECT_TARGETS,
  ARCHITECT_OBJECTIVES,
  ARCHITECT_METHODS,
  ARCHITECT_CONSTRAINTS,
  evaluateMissionTradeOffs
} from './architectData.js';

export class MissionArchitectEngine {
  constructor() {
    this._listeners = new Map();

    // Default starting state
    this.target = ARCHITECT_TARGETS.MARS;
    this.objective = ARCHITECT_OBJECTIVES.STUDY_ATMOSPHERE;
    this.method = ARCHITECT_METHODS.SPECTROSCOPY_HIGH_RES;

    this.constraints = {
      deltaV: ARCHITECT_CONSTRAINTS.DELTA_V_BUDGET.default,
      commBandwidth: ARCHITECT_CONSTRAINTS.COMM_BANDWIDTH.default,
      thermalPower: ARCHITECT_CONSTRAINTS.THERMAL_POWER.default
    };

    this.currentStep = 'TARGET'; // 'TARGET' | 'OBJECTIVE' | 'METHOD' | 'CONSTRAINTS' | 'ASSEMBLY' | 'BRIEFING'
    this.isAssembled = false;
    this.missionCode = 'ARES-ATMOS-01';

    this.tradeOffs = evaluateMissionTradeOffs(
      this.target.id,
      this.objective.id,
      this.method.id,
      this.constraints
    );
  }

  /* -----------------------------------------------------------------
     Pub/Sub Event Bus
     ----------------------------------------------------------------- */
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

  emit(event, payload) {
    const list = this._listeners.get(event);
    if (!list) return;
    for (const cb of list) {
      try {
        cb(payload);
      } catch (err) {
        console.error(`[MissionArchitectEngine] Error in ${event} listener:`, err);
      }
    }
  }

  /* -----------------------------------------------------------------
     State Modifiers
     ----------------------------------------------------------------- */
  setStep(stepName) {
    this.currentStep = stepName;
    this.emit('stepChanged', { step: stepName });
  }

  setTarget(targetId) {
    const target = ARCHITECT_TARGETS[targetId];
    if (!target) return;
    this.target = target;

    // Check if current objective is valid for new target; if not, pick first valid
    if (!target.supportedObjectives.includes(this.objective.id)) {
      const firstValidObjId = target.supportedObjectives[0];
      this.objective = ARCHITECT_OBJECTIVES[firstValidObjId];
    }

    // Check if current method is compatible with new objective; if not, pick first compatible
    if (!this.objective.compatibleMethods.includes(this.method.id)) {
      const firstCompatibleMethodId = this.objective.compatibleMethods[0];
      this.method = ARCHITECT_METHODS[firstCompatibleMethodId];
    }

    this._generateMissionCode();
    this._recalculate();
    this.emit('targetChanged', { target: this.target });
  }

  setObjective(objectiveId) {
    const objective = ARCHITECT_OBJECTIVES[objectiveId];
    if (!objective) return;
    this.objective = objective;

    // Check if current method is compatible with new objective; if not, pick first compatible
    if (!objective.compatibleMethods.includes(this.method.id)) {
      const firstCompatibleMethodId = objective.compatibleMethods[0];
      this.method = ARCHITECT_METHODS[firstCompatibleMethodId];
    }

    this._generateMissionCode();
    this._recalculate();
    this.emit('objectiveChanged', { objective: this.objective });
  }

  setMethod(methodId) {
    const method = ARCHITECT_METHODS[methodId];
    if (!method) return;
    this.method = method;

    this._recalculate();
    this.emit('methodChanged', { method: this.method });
  }

  setConstraint(key, value) {
    this.constraints[key] = value;
    this._recalculate();
    this.emit('constraintsChanged', { constraints: this.constraints });
  }

  assembleMission() {
    this.isAssembled = true;
    this.emit('missionAssembled', {
      target: this.target,
      objective: this.objective,
      method: this.method,
      constraints: this.constraints,
      tradeOffs: this.tradeOffs,
      missionCode: this.missionCode
    });
  }

  generateBriefing() {
    const dossier = this.getMissionDossier();
    this.emit('briefingGenerated', dossier);
    return dossier;
  }

  /* -----------------------------------------------------------------
     Internal Calculations & Mission Dossier Compilation
     ----------------------------------------------------------------- */
  _generateMissionCode() {
    const prefix = this.target.id.substring(0, 4);
    const suffix = this.objective.id.substring(0, 5);
    const rand = Math.floor(10 + Math.random() * 90);
    this.missionCode = `${prefix}-${suffix}-${rand}`;
  }

  _recalculate() {
    this.tradeOffs = evaluateMissionTradeOffs(
      this.target.id,
      this.objective.id,
      this.method.id,
      this.constraints
    );
    this.emit('tradeOffsUpdated', this.tradeOffs);
  }

  getMissionDossier() {
    return {
      missionCode: this.missionCode,
      title: `MISSION CONCEPT // ${this.missionCode}`,
      subtitle: `${this.objective.name} AT ${this.target.name}`,
      status: this.tradeOffs.isValid ? 'VERIFIED EDUCATIONAL CONCEPT' : 'INCOMPATIBLE CONFIGURATION',
      badge: 'EDUCATIONAL MISSION CONCEPT',
      target: {
        id: this.target.id,
        name: this.target.name,
        category: this.target.category,
        distanceKm: this.target.distanceKm,
        lightTimeOneWay: this.target.lightTimeOneWay,
        lightTimeTwoWay: this.target.lightTimeTwoWay,
        gravityEarthG: this.target.gravityEarthG,
        atmosphere: this.target.atmosphere,
        thermalRange: this.target.thermalRange,
        solarIrradiance: this.target.solarIrradiance,
        source: this.target.source
      },
      objective: {
        id: this.objective.id,
        name: this.objective.name,
        kicker: this.objective.kicker,
        primaryQuestion: this.objective.primaryQuestion,
        keyScientificMetric: this.objective.keyScientificMetric,
        source: this.objective.source
      },
      method: {
        id: this.method.id,
        name: this.method.name,
        instrumentType: this.method.instrumentType,
        spectralBand: this.method.spectralBand,
        physicsPrinciple: this.method.physicsPrinciple,
        realWorldAnalogs: this.method.realWorldAnalogs,
        scienceMerit: this.method.scienceMerit,
        dataRate: this.method.dataRate,
        operationalComplexity: this.method.operationalComplexity
      },
      constraints: {
        deltaV: `${this.constraints.deltaV} km/s (Heliocentric Injection Budget)`,
        commBandwidth: this.constraints.commBandwidth,
        thermalPower: this.constraints.thermalPower,
        lightTimeLag: this.target.lightTimeTwoWay
      },
      tradeOffs: this.tradeOffs,
      surpriseMoment: this._generateSurpriseMoment(),
      humanityImplication: this.target.humanityNote,
      scientificSources: [
        this.target.source,
        this.objective.source,
        `NASA SP-2016-6105 Rev 2 (NASA Space Flight Program & Project Management Requirements)`,
        `BIPM SI Units & IAU Astronomical Standards (2024)`
      ]
    };
  }

  _generateSurpriseMoment() {
    if (this.target.id === 'MARS' && this.objective.id === 'STUDY_ATMOSPHERE') {
      return {
        reveal: 'Your atmospheric spectroscopy mission reveals that despite 4.5 billion years of solar wind erosion, Mars retains a dynamic ozone layer that varies seasonally over the polar vortex, mirroring Earth’s polar stratosphere.',
        limitation: 'Opaque global dust storms can absorb up to 99% of incoming solar infrared rays, temporarily blinding transmission spectrometers and altering atmospheric thermal scale height by tens of kilometers.',
        goDeeper: 'Inspect the MAVEN solar wind sputtering evidence in the Cosmic Observatory (CASE_05_NAVIGATION) or examine Space Weather bow shock compression in the Phenomena Lab.'
      };
    } else if (this.target.id === 'EUROPA' && this.objective.id === 'SEARCH_WATER_ICE') {
      return {
        reveal: 'Your ice-penetrating radar sounder confirms that Europa’s chaotic ridged terrain is underlain by shallow liquid sills within 3 km of the icy surface, potentially providing convection conduits between the dark ocean and the radiolytic surface.',
        limitation: 'Extreme surface dielectric scattering from porous ice penitentes can scatter radar energy horizontally, producing clutter that obscures the true ice-water interface depth.',
        goDeeper: 'Examine lookback time and signal round-trip constraints in the Evidence Lab (CASE_04_LOOKBACK_TIME) or test the Cosmic Scale visualizer to comprehend Europa’s 100 km deep oceanic layer.'
      };
    } else if (this.target.id === 'TRAPPIST_1E' && this.objective.id === 'EXOPLANET_BIOSIGNATURE') {
      return {
        reveal: 'Transit spectroscopy across 50 simulated stellar transits constrains the atmospheric mean molecular weight to >18 g/mol, firmly ruling out a primordial low-density Hydrogen/Helium envelope and supporting a dense secondary atmosphere.',
        limitation: 'Unocculted stellar starspots and active flares on TRAPPIST-1 can imprint water vapor absorption lines directly from the star’s cool photospheric spots, creating false-positive atmospheric detections.',
        goDeeper: 'Review the Kepler/JWST transit photometry model in the Evidence Lab (CASE_01_EXOPLANET) and test limb darkening parameters in the Exoplanet Detection Phenomenon.'
      };
    } else if (this.target.id === 'SAGITTARIUS_A') {
      return {
        reveal: 'Micro-arcsecond astrometric deflection tracks the orbital precession of orbiting stars, measuring a Schwarzschild periastron advance of 12 arcminutes per orbit—in exact alignment with Einstein’s 1915 General Relativity equations.',
        limitation: 'Interstellar electron scattering screens galactic center emissions below 86 GHz; only high-frequency sub-millimeter radio waves (230 GHz) can penetrate the dense dust lane without image smearing.',
        goDeeper: 'Explore the supermassive black hole evidence case (CASE_03_BLACK_HOLE) or visualize Schwarzschild coordinate metric warping in the Gravity Field Phenomenon.'
      };
    } else if (this.target.id === 'PARKER_SUN') {
      return {
        reveal: 'In-situ magnetometry confirms that the solar wind does not accelerate uniformly, but in violent bursty switchbacks—abrupt S-shaped kinks in magnetic field lines that whip plasma outward at up to 1,000 km/s.',
        limitation: 'Thermal sensors cannot survive outside the spacecraft shadow; all payload instruments must operate behind a 11.4 cm thick carbon-composite thermal shield reaching 1,400°C.',
        goDeeper: 'Inspect the Fraunhofer atomic line library in the Spectrum Lab or examine Parker spiral heliospheric geometry in the Space Weather Phenomenon.'
      };
    } else {
      return {
        reveal: `Your mission configuration couples ${this.method.name} with ${this.target.name}, establishing critical quantitative bounds on ${this.objective.keyScientificMetric}.`,
        limitation: `Observational fidelity remains bounded by instrument integration times and deep-space signal downlink bandwidth.`,
        goDeeper: `Investigate underlying physical principles in the Cosmic Observatory and explore related Phenomena.`
      };
    }
  }
}

export const missionArchitectEngine = new MissionArchitectEngine();
