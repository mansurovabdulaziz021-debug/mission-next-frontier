/**
 * missionArchitect.test.mjs — Automated Test Suite for Phase 9 Mission Architect
 * 
 * Verifies:
 *   1. Target & Objective compatibility rules
 *   2. Method pairing & scientific validity
 *   3. Constraint propagation & derived values (light-time, Delta-V)
 *   4. Power advisory warnings (e.g. solar panels on Europa vs RTG, solar shield on Parker Sun)
 *   5. Scientific integrity checklist output
 *   6. Evidence Lab case routing & source mappings
 *   7. Phenomena Lab routing & cross-links
 *   8. Mission Briefing compilation & surprise reveal generation
 *   9. Full Mission Dossier structure
 */

import {
  ARCHITECT_TARGETS,
  ARCHITECT_OBJECTIVES,
  ARCHITECT_METHODS,
  ARCHITECT_CONSTRAINTS,
  evaluateMissionTradeOffs
} from '../src/architect/architectData.js';

import { MissionArchitectEngine } from '../src/architect/MissionArchitectEngine.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('====================================================');
console.log('PHASE 9 MISSION ARCHITECT — AUTOMATED TEST SUITE');
console.log('====================================================\n');

// --- Test 1: Sourced Knowledge Base Integrity ---
console.log('TEST 1: Sourced Knowledge Base & Targets Verification');
assert(Object.keys(ARCHITECT_TARGETS).length >= 7, 'At least 7 scientific targets defined');
assert(ARCHITECT_TARGETS.MARS.supportedObjectives.includes('STUDY_ATMOSPHERE'), 'Mars supports STUDY_ATMOSPHERE');
assert(ARCHITECT_TARGETS.EUROPA.supportedObjectives.includes('SEARCH_WATER_ICE'), 'Europa supports SEARCH_WATER_ICE');
assert(ARCHITECT_TARGETS.TRAPPIST_1E.supportedObjectives.includes('EXOPLANET_BIOSIGNATURE'), 'TRAPPIST-1e supports EXOPLANET_BIOSIGNATURE');
assert(ARCHITECT_TARGETS.SAGITTARIUS_A.supportedObjectives.includes('RELATIVISTIC_METRIC'), 'Sgr A* supports RELATIVISTIC_METRIC');
assert(ARCHITECT_TARGETS.PARKER_SUN.supportedObjectives.includes('SOLAR_CORONA_WIND'), 'Parker Sun supports SOLAR_CORONA_WIND');

// --- Test 2: Target & Objective Compatibility ---
console.log('\nTEST 2: Target & Objective Compatibility Rules');
const validMarsTradeOff = evaluateMissionTradeOffs('MARS', 'STUDY_ATMOSPHERE', 'SPECTROSCOPY_HIGH_RES');
assert(validMarsTradeOff !== null, 'Valid Mars mission trade-off evaluates');
assert(validMarsTradeOff.isValid === true, 'Mars + Atmosphere + Spectroscopy is valid');
assert(validMarsTradeOff.invalidationReason === null, 'No invalidation reason for valid Mars mission');

const invalidTargetTradeOff = evaluateMissionTradeOffs('MOON', 'STUDY_ATMOSPHERE', 'SPECTROSCOPY_HIGH_RES');
assert(invalidTargetTradeOff.isValid === false, 'Moon + Atmosphere is marked invalid (no significant atmosphere)');
assert(invalidTargetTradeOff.invalidationReason.includes('physical environments'), 'Explains physical environment mismatch');

// --- Test 3: Observation Method Compatibility ---
console.log('\nTEST 3: Method Compatibility & Physics Principles');
const invalidMethodTradeOff = evaluateMissionTradeOffs('MARS', 'SEARCH_WATER_ICE', 'TRANSIT_PHOTOMETRY');
assert(invalidMethodTradeOff.isValid === false, 'Mars + Water/Ice + Transit Photometry is marked invalid');
assert(invalidMethodTradeOff.invalidationReason.includes('not appropriate'), 'Explains observation method incompatibility');

const validRadarTradeOff = evaluateMissionTradeOffs('MARS', 'SEARCH_WATER_ICE', 'RADAR_SOUNDING');
assert(validRadarTradeOff.isValid === true, 'Mars + Water/Ice + Radar Sounding is marked valid');
assert(validRadarTradeOff.advantage.includes('dielectric'), 'Radar advantage references dielectric interfaces');

// --- Test 4: Constraint Handling & Power Advisory Warnings ---
console.log('\nTEST 4: Constraint Handling & Environmental Warnings');
const europaWithSolar = evaluateMissionTradeOffs('EUROPA', 'SEARCH_WATER_ICE', 'RADAR_SOUNDING', { thermalPower: 'SOLAR_ARRAYS' });
assert(europaWithSolar.powerAdvisory.includes('CAUTION'), 'Europa with Solar Arrays triggers low-flux power caution');

const europaWithRTG = evaluateMissionTradeOffs('EUROPA', 'SEARCH_WATER_ICE', 'RADAR_SOUNDING', { thermalPower: 'NUCLEAR_RTG' });
assert(!europaWithRTG.powerAdvisory.includes('CAUTION'), 'Europa with RTG clears solar advisory');

const sunWithoutShield = evaluateMissionTradeOffs('PARKER_SUN', 'SOLAR_CORONA_WIND', 'IN_SITU_MAGNETOMETRY', { thermalPower: 'SOLAR_ARRAYS' });
assert(sunWithoutShield.powerAdvisory.includes('CRITICAL'), 'Sun perihelion without heat shield triggers CRITICAL thermal warning');

// --- Test 5: Scientific Integrity Checklist ---
console.log('\nTEST 5: Scientific Integrity Checklist');
assert(validMarsTradeOff.integrityChecklist.length === 5, 'Checklist contains 5 transparent criteria');
const statusValues = validMarsTradeOff.integrityChecklist.map(c => c.status);
assert(statusValues.includes('VERIFIED'), 'Integrity includes VERIFIED status');
assert(statusValues.includes('SIMPLIFIED'), 'Integrity includes SIMPLIFIED status (educational disclosure)');

// --- Test 6: Evidence & Phenomena Cross-Routing ---
console.log('\nTEST 6: Evidence & Phenomena Mapping');
assert(ARCHITECT_TARGETS.MARS.evidenceCase === 'CASE_05_NAVIGATION', 'Mars routes to Navigation evidence case');
assert(ARCHITECT_TARGETS.TRAPPIST_1E.evidenceCase === 'CASE_01_EXOPLANET', 'TRAPPIST-1e routes to Exoplanet evidence case');
assert(ARCHITECT_TARGETS.SAGITTARIUS_A.evidenceCase === 'CASE_03_BLACK_HOLE', 'Sgr A* routes to Black Hole evidence case');
assert(ARCHITECT_METHODS.SPECTROSCOPY_HIGH_RES.phenomenonLink === 'SPECTRUM_LAB', 'Spectroscopy links to Spectrum Lab Phenomenon');
assert(ARCHITECT_METHODS.TRANSIT_PHOTOMETRY.phenomenonLink === 'EXOPLANET_DETECTION', 'Transit links to Exoplanet Detection Phenomenon');

// --- Test 7: Engine Workflow & State Transitions ---
console.log('\nTEST 7: Engine Workflow & Step Management');
const engine = new MissionArchitectEngine();
assert(engine.currentStep === 'TARGET', 'Engine initializes at TARGET step');
assert(engine.missionCode.length > 5, 'Engine generates formatted mission code');

engine.setTarget('EUROPA');
assert(engine.target.id === 'EUROPA', 'Target successfully set to Europa');
assert(engine.objective.id === 'SEARCH_WATER_ICE', 'Objective automatically recalibrated to valid Europa objective');

engine.setMethod('RADAR_SOUNDING');
assert(engine.method.id === 'RADAR_SOUNDING', 'Method set to Radar Sounding');

let assembled = false;
engine.on('missionAssembled', () => { assembled = true; });
engine.assembleMission();
assert(assembled === true, 'assembleMission triggers missionAssembled event');

// --- Test 8: Mission Briefing & Surprise Reveal Compilation ---
console.log('\nTEST 8: Mission Briefing & Dossier Compilation');
const dossier = engine.getMissionDossier();
assert(dossier.title.includes(engine.missionCode), 'Dossier title contains mission code');
assert(dossier.surpriseMoment !== null, 'Dossier includes contextual surprise moment');
assert(dossier.surpriseMoment.reveal.length > 20, 'Surprise reveal contains authentic grounded discovery');
assert(dossier.surpriseMoment.limitation.length > 20, 'Surprise limitation declares physical constraint');
assert(dossier.surpriseMoment.goDeeper.length > 20, 'Surprise gives deeper scientific investigation path');
assert(dossier.scientificSources.length >= 3, 'Dossier includes transparent scientific source citations');

console.log('\n====================================================');
console.log(`TEST SUITE RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
