/**
 * ObservatoryEngine.js — State Manager & Investigative Workflow Controller
 * 
 * Manages the interactive scientific investigation lifecycle:
 *   - Case selection and target acquisition
 *   - Multi-wavelength band switching
 *   - Step-by-step evidence inspection & progress
 *   - "You Figured It Out" conclusion unlocks
 *   - Session and persistent experience memory (localStorage)
 *   - Pub/sub events for 3D and UI synchronization
 */

import { INVESTIGATION_CASES, OBSERVATION_STATUS, getInvestigationCase } from './observatoryData.js';
import { missionState } from '../state/MissionState.js';

class ObservatoryEngine {
  constructor() {
    this.cases = INVESTIGATION_CASES;
    this.activeCase = this.cases[0];
    this.activeStep = 1; // 1 to 3
    this.activeWavelength = 'VISIBLE';
    this.status = OBSERVATION_STATUS.STANDBY;
    this.isAcquiring = false;

    // Track inspected evidence per case: { [caseId]: Set<stepNumber> }
    this.inspectedEvidence = {};
    
    // Persistent experience memory
    this.completedCases = new Set(this._loadCompletedCases());

    // Listeners map
    this._listeners = new Map();

    // Initialize inspected state
    this.cases.forEach(c => {
      this.inspectedEvidence[c.id] = new Set([1]); // Step 1 is always unlocked initially
    });
  }

  /* -----------------------------------------------------------------
     Pub / Sub Event Bus
     ----------------------------------------------------------------- */
  on(event, cb) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(cb);
    return () => this.off(event, cb);
  }

  off(event, cb) {
    const arr = this._listeners.get(event);
    if (!arr) return;
    this._listeners.set(event, arr.filter(fn => fn !== cb));
  }

  emit(event, data) {
    const arr = this._listeners.get(event);
    if (arr) {
      arr.forEach(fn => {
        try { fn(data); } catch (err) { console.error(`[ObservatoryEngine] Event error (${event}):`, err); }
      });
    }
  }

  /* -----------------------------------------------------------------
     Case Selection & Target Acquisition Sequence
     ----------------------------------------------------------------- */
  selectCase(caseId, skipAcquisition = false) {
    const targetCase = getInvestigationCase(caseId);
    if (!targetCase) return;

    this.activeCase = targetCase;
    this.activeStep = 1;

    // Default to first available wavelength for this case
    if (targetCase.availableWavelengths && !targetCase.availableWavelengths.includes(this.activeWavelength)) {
      this.activeWavelength = targetCase.availableWavelengths[0];
    }

    if (skipAcquisition) {
      this.status = OBSERVATION_STATUS.LOCKED;
      this.isAcquiring = false;
      this.emit('caseChanged', { case: this.activeCase, step: this.activeStep });
      this.emit('targetAcquired', this.activeCase);
      return;
    }

    // Trigger cinematic target acquisition sequence
    this.isAcquiring = true;
    this.status = OBSERVATION_STATUS.ACQUIRING;
    this.emit('acquisitionStarted', this.activeCase);

    setTimeout(() => {
      this.isAcquiring = false;
      this.status = OBSERVATION_STATUS.LOCKED;
      this.emit('targetAcquired', this.activeCase);
      this.emit('caseChanged', { case: this.activeCase, step: this.activeStep });
    }, 900);
  }

  /* -----------------------------------------------------------------
     Evidence Step Navigation
     ----------------------------------------------------------------- */
  selectStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > this.activeCase.evidence.length) return;
    this.activeStep = stepNumber;

    // Record step as inspected
    if (!this.inspectedEvidence[this.activeCase.id]) {
      this.inspectedEvidence[this.activeCase.id] = new Set();
    }
    this.inspectedEvidence[this.activeCase.id].add(stepNumber);

    this.emit('stepChanged', {
      case: this.activeCase,
      step: this.activeStep,
      evidence: this.activeCase.evidence[stepNumber - 1],
      isComplete: this.isCaseComplete(this.activeCase.id)
    });

    // If all steps have been inspected, unlock conclusion
    if (this.isCaseComplete(this.activeCase.id) && !this.completedCases.has(this.activeCase.id)) {
      this.markCaseCompleted(this.activeCase.id);
    }
  }

  nextStep() {
    if (this.activeStep < this.activeCase.evidence.length) {
      this.selectStep(this.activeStep + 1);
    } else {
      // Step to conclusion
      this.emit('showConclusion', this.activeCase);
    }
  }

  prevStep() {
    if (this.activeStep > 1) {
      this.selectStep(this.activeStep - 1);
    }
  }

  isCaseComplete(caseId) {
    const inspected = this.inspectedEvidence[caseId];
    if (!inspected) return false;
    const targetCase = getInvestigationCase(caseId);
    return inspected.size >= targetCase.evidence.length;
  }

  /* -----------------------------------------------------------------
     Wavelength Layer Selection
     ----------------------------------------------------------------- */
  setWavelength(bandId) {
    if (!this.activeCase.availableWavelengths.includes(bandId)) {
      this.emit('wavelengthUnavailable', {
        bandId,
        available: this.activeCase.availableWavelengths
      });
      return false;
    }
    this.activeWavelength = bandId;
    this.emit('wavelengthChanged', {
      bandId,
      note: this.activeCase.wavelengthNotes[bandId] || ''
    });
    return true;
  }

  /* -----------------------------------------------------------------
     Persistent Experience Memory
     ----------------------------------------------------------------- */
  markCaseCompleted(caseId) {
    this.completedCases.add(caseId);
    this._saveCompletedCases();
    this.emit('caseCompleted', {
      caseId,
      totalCompleted: this.completedCases.size,
      allCasesCount: this.cases.length
    });
  }

  _loadCompletedCases() {
    try {
      const raw = localStorage.getItem('mission_observatory_completed_cases');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  _saveCompletedCases() {
    try {
      localStorage.setItem(
        'mission_observatory_completed_cases',
        JSON.stringify(Array.from(this.completedCases))
      );
    } catch (e) {}
  }

  getNextRecommendedCase() {
    const uncompleted = this.cases.find(c => !this.completedCases.has(c.id));
    return uncompleted || this.cases[0];
  }
}

export const observatoryEngine = new ObservatoryEngine();
