/**
 * AudioEvents.js — Event Constants for Mission // Next Frontier Audio Architecture
 * 
 * Provides decoupled acoustic event classifications:
 *   - UI Micro-interactions
 *   - Scene & Navigation transitions
 *   - Scientific Discovery & Telemetry reveals
 *   - Mission Composer milestones
 *   - Presentation & Story moments
 */

export const AUDIO_EVENTS = {
  // UI Interactions
  UI_HOVER:           'uiHover',
  UI_CLICK:           'uiClick',
  UI_SELECT:          'uiSelect',
  UI_CONFIRM:         'uiConfirm',
  UI_NAVIGATE:        'uiNavigate',
  UI_CLOSE:           'uiClose',
  UI_WARNING:         'uiWarning',

  // Navigation & Destination Focus
  DESTINATION_SELECT: 'destinationSelect',
  TARGET_ACQUIRE:     'targetAcquire',
  SCENE_ENTER:        'sceneEnter',
  SCENE_EXIT:         'sceneExit',
  TRANSITION_WHOOSH:  'transitionWhoosh',

  // Scientific Intelligence & Exploration
  DATA_REVEAL:        'dataReveal',
  SCENARIO_CHANGE:    'scenarioChange',
  DISCOVERY_REVEAL:   'discoveryReveal',
  EVIDENCE_STEP:      'evidenceStep',
  PHENOMENON_SELECT:  'phenomenonSelect',
  SPECTRUM_TICK:      'spectrumTick',

  // Mission Architect Milestones
  MISSION_STEP:       'missionStep',
  MISSION_ASSEMBLED:  'missionAssembled',
  BRIEFING_START:     'briefingStart',
  BRIEFING_COMPLETE:  'briefingComplete',
  DOSSIER_OPEN:       'dossierOpen',

  // Atmosphere & Presentation
  PRESENTATION_STEP:  'presentationStep',
  ONE_MORE_THING:     'oneMoreThing',
  FINAL_INSIGHT:      'finalInsight',
  DUCK_AUDIO:         'duckAudio',
  UNDUCK_AUDIO:       'unduckAudio'
};
