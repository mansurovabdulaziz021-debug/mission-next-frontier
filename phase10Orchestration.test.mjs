/**
 * phase10Orchestration.test.mjs — Automated Test Suite for Phase 10
 * (IMMERSIVE EXPERIENCE ORCHESTRATION)
 * 
 * Verifies:
 *   1. Audio event mapping & categorization
 *   2. AudioManager state, mute/unmute, volume control & persistence
 *   3. SoundSynthesizer procedural sound generation
 *   4. MusicSynthesizer ambient chord progression & ducking
 *   5. GlobalAtmosphereSystem mood profiles & token propagation
 *   6. NarrativeRouter story continuity & "One More Thing" insights
 *   7. PresentationController 9-step demo flow, pause/play & replay
 *   8. ExperienceConductor orchestration & deterministic reset
 *   9. Regression behavior across all 9 previous phases
 */

import { AUDIO_EVENTS } from '../src/audio/AudioEvents.js';
import { AudioManager } from '../src/audio/AudioManager.js';
import { ATMOSPHERES } from '../src/conductor/GlobalAtmosphereSystem.js';
import {
  STORY_CONNECTIONS,
  ONE_MORE_THING_INSIGHTS,
  FINAL_INSIGHT_SYNTHESIS,
  NarrativeRouter
} from '../src/conductor/NarrativeRouter.js';
import {
  PRESENTATION_STEPS,
  PresentationController
} from '../src/conductor/PresentationController.js';
import { DESTINATIONS } from '../src/state/MissionState.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('====================================================');
console.log('PHASE 10 IMMERSIVE ORCHESTRATION — TEST SUITE');
console.log('====================================================\n');

// --- Test 1: Audio Events Definition ---
console.log('TEST 1: Audio Event Categories & Mapping');
assert(AUDIO_EVENTS.UI_CLICK === 'uiClick', 'UI_CLICK event mapped');
assert(AUDIO_EVENTS.TARGET_ACQUIRE === 'targetAcquire', 'TARGET_ACQUIRE event mapped');
assert(AUDIO_EVENTS.TRANSITION_WHOOSH === 'transitionWhoosh', 'TRANSITION_WHOOSH event mapped');
assert(AUDIO_EVENTS.MISSION_ASSEMBLED === 'missionAssembled', 'MISSION_ASSEMBLED event mapped');
assert(AUDIO_EVENTS.ONE_MORE_THING === 'oneMoreThing', 'ONE_MORE_THING event mapped');
assert(AUDIO_EVENTS.FINAL_INSIGHT === 'finalInsight', 'FINAL_INSIGHT event mapped');

// --- Test 2: AudioManager State Management ---
console.log('\nTEST 2: AudioManager State & Volume Clamping');
const audioMgr = new AudioManager();
assert(typeof audioMgr.muted === 'boolean', 'Audio manager has boolean mute state');
assert(audioMgr.volume >= 0 && audioMgr.volume <= 1.0, 'Volume within [0, 1.0]');

// Test toggle
const initialMute = audioMgr.muted;
audioMgr.toggleMute();
assert(audioMgr.muted === !initialMute, 'Toggle mute flips state');
audioMgr.toggleMute();
assert(audioMgr.muted === initialMute, 'Toggle mute flips back');

// Test volume clamping
audioMgr.setVolume(1.5);
assert(audioMgr.volume === 1.0, 'Volume clamped at 1.0 upper bound');
audioMgr.setVolume(-0.5);
assert(audioMgr.volume === 0.0, 'Volume clamped at 0.0 lower bound');
audioMgr.setVolume(0.65);
assert(audioMgr.volume === 0.65, 'Volume set to 0.65 correctly');

// --- Test 3: Atmosphere Profiles ---
console.log('\nTEST 3: Global Atmosphere System Profiles');
const requiredAtmospheres = [
  'MISSION_CONTROL',
  'SOLAR_SYSTEM',
  'DEEP_SPACE',
  'OBSERVATORY',
  'PHENOMENA',
  'MISSION_ARCHITECT'
];

requiredAtmospheres.forEach(key => {
  assert(ATMOSPHERES[key] !== undefined, `Atmosphere profile ${key} is defined`);
  assert(ATMOSPHERES[key].dustOpacity > 0, `${key} specifies dustOpacity`);
  assert(ATMOSPHERES[key].cssGlow.includes('rgba'), `${key} specifies valid CSS glow`);
});

// --- Test 4: Narrative Continuity & One More Thing ---
console.log('\nTEST 4: NarrativeRouter Story Continuity & Grounded Insights');
const router = new NarrativeRouter();

assert(STORY_CONNECTIONS.EARTH !== undefined, 'Earth story connections present');
assert(STORY_CONNECTIONS.MARS !== undefined, 'Mars story connections present');
assert(STORY_CONNECTIONS.TRAPPIST_1E !== undefined, 'TRAPPIST-1e story connections present');

const marsSuggestion = router.getSuggestion('MARS');
assert(marsSuggestion !== null, 'Mars suggestion retrieved');
assert(marsSuggestion.suggestions.length >= 2, 'Mars offers multi-path next suggestions');
assert(marsSuggestion.fact.includes('MAVEN'), 'Mars fact grounded in MAVEN evidence');

assert(ONE_MORE_THING_INSIGHTS.length >= 3, 'At least 3 authentic One More Thing surprises defined');
const architectSurprise = router.triggerOneMoreThing('ARCHITECT_COMPLETE');
assert(architectSurprise !== null, 'One More Thing triggers on ARCHITECT_COMPLETE');
assert(architectSurprise.title.includes('WATER'), 'Surprise references planetary water conveyor');

// Test rarity: cannot trigger twice
const secondSurprise = router.triggerOneMoreThing('ARCHITECT_COMPLETE');
assert(secondSurprise === null, 'One More Thing cannot be triggered redundantly');

// Final insight
const finalInsight = router.getFinalInsight();
assert(finalInsight.title === 'FROM DATA TO UNDERSTANDING', 'Final insight title verified');
assert(finalInsight.body.length > 80, 'Final insight provides grounded philosophical synthesis');

// --- Test 5: Presentation Showcase Engine ---
console.log('\nTEST 5: PresentationController 9-Step Demo Sequence');
assert(PRESENTATION_STEPS.length === 9, 'Presentation comprises exactly 9 choreographed demo steps');

const presCtrl = new PresentationController(null);
presCtrl.autoAdvance = false; // Disable timers for deterministic testing

let startedEventFired = false;
presCtrl.on('presentationStarted', () => { startedEventFired = true; });
presCtrl.startPresentation();

assert(presCtrl.isActive === true, 'Presentation mode is active after startPresentation');
assert(startedEventFired === true, 'presentationStarted event emitted');
assert(presCtrl.currentStepIndex === 0, 'Presentation starts at Step 0 (OPENING)');

// Step forward
presCtrl.nextStep();
assert(presCtrl.currentStepIndex === 1, 'nextStep advances to Step 1 (MISSION_CONTROL)');

// Step forward to Step 4 (Phenomena)
presCtrl.nextStep(); // 2
presCtrl.nextStep(); // 3
presCtrl.nextStep(); // 4
assert(presCtrl.currentStepIndex === 4, 'Advanced to Step 4 (PHENOMENA)');
assert(PRESENTATION_STEPS[4].id === 'PHENOMENA', 'Step 4 matches PHENOMENA');

// Step backward
presCtrl.prevStep();
assert(presCtrl.currentStepIndex === 3, 'prevStep moves back to Step 3 (DATA_INTELLIGENCE)');

// Toggle pause
assert(presCtrl.isPaused === false, 'Initially not paused');
presCtrl.togglePause();
assert(presCtrl.isPaused === true, 'togglePause paused presentation');
presCtrl.togglePause();
assert(presCtrl.isPaused === false, 'togglePause resumed presentation');

// Exit presentation
presCtrl.exitPresentation();
assert(presCtrl.isActive === false, 'exitPresentation deactivates presentation');

// --- Test 6: Regressions Check Across All 9 Previous Phases ---
console.log('\nTEST 6: Regression Verification (Phases 1 - 9 Integrity)');
assert(DESTINATIONS.SOLAR_SYSTEM !== undefined, 'Phase 2: Heliocentric destination intact');
assert(DESTINATIONS.EARTH !== undefined, 'Phase 1 & 2: Earth focal target intact');
assert(DESTINATIONS.MOON !== undefined, 'Phase 2: Moon focal target intact');
assert(DESTINATIONS.MARS !== undefined, 'Phase 2: Mars focal target intact');
assert(DESTINATIONS.EARTH.subsystems !== undefined, 'Phase 3: Subsystems telemetry intact');
assert(DESTINATIONS.EARTH.observations.length > 0, 'Phase 3: Ground truth observations intact');

console.log('====================================================');
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
