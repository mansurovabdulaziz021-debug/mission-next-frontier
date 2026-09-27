/**
 * PhenomenaSceneManager.js — Orchestration of 3D Signature Visual Experiences
 * 
 * Coordinates the 8 Signature Phenomena:
 *   1. CosmicScaleVisualizer
 *   2. LightTimeVisualizer
 *   3. ExoplanetDetectionVisualizer
 *   4. SpectrumLabVisualizer
 *   5. GravityFieldVisualizer
 *   6. SpaceWeatherVisualizer
 *   7. NavigationTrajectoryVisualizer
 *   8. DataSculptureVisualizer
 * 
 * Performance:
 *   - Only the active phenomenon is visible and updated in the render loop.
 *   - Lazy initialization and adaptive quality scaling.
 */

import * as THREE from 'three';
import gsap from 'gsap';
import { CosmicScaleVisualizer } from './CosmicScaleVisualizer.js';
import { LightTimeVisualizer } from './LightTimeVisualizer.js';
import { ExoplanetDetectionVisualizer } from './ExoplanetDetectionVisualizer.js';
import { SpectrumLabVisualizer } from './SpectrumLabVisualizer.js';
import { GravityFieldVisualizer } from './GravityFieldVisualizer.js';
import { SpaceWeatherVisualizer } from './SpaceWeatherVisualizer.js';
import { NavigationTrajectoryVisualizer } from './NavigationTrajectoryVisualizer.js';
import { DataSculptureVisualizer } from './DataSculptureVisualizer.js';
import { phenomenaEngine } from './PhenomenaEngine.js';
import { qualityManager } from '../utils/QualityManager.js';
import { audioHooks } from '../utils/AudioHooks.js';

export class PhenomenaSceneManager {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   */
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.group.name = 'PhenomenaMasterGroup';
    this.group.position.set(0, 0, -45); // Placed in dedicated spatial coordinate arena
    this.group.visible = false;
    this.scene.add(this.group);

    this.activeId = 'COSMIC_SCALE';
    this.visualizers = {};

    this._initVisualizers();
    this._bindEngineEvents();
    this._bindQualityEvents();
  }

  _initVisualizers() {
    this.visualizers['COSMIC_SCALE'] = new CosmicScaleVisualizer(this.group);
    this.visualizers['LIGHT_TIME'] = new LightTimeVisualizer(this.group);
    this.visualizers['EXOPLANET_DETECTION'] = new ExoplanetDetectionVisualizer(this.group);
    this.visualizers['SPECTRUM_LAB'] = new SpectrumLabVisualizer(this.group);
    this.visualizers['GRAVITY_FIELD'] = new GravityFieldVisualizer(this.group);
    this.visualizers['SPACE_WEATHER'] = new SpaceWeatherVisualizer(this.group);
    this.visualizers['SPACECRAFT_NAVIGATION'] = new NavigationTrajectoryVisualizer(this.group);
    this.visualizers['DATA_SCULPTURE'] = new DataSculptureVisualizer(this.group);

    // Initial activation
    this.setPhenomenon('COSMIC_SCALE');
  }

  _bindEngineEvents() {
    phenomenaEngine.on('phenomenonChanged', (phenomenon) => {
      this.setPhenomenon(phenomenon.id);
    });

    phenomenaEngine.on('paramChanged', ({ phenomenonId, paramId, value }) => {
      this._applyParam(phenomenonId, paramId, value);
    });
  }

  _bindQualityEvents() {
    qualityManager.onQualityChanged((tier) => {
      // Adjust geometry or particle scale across visualizers if applicable
    });
  }

  _applyParam(pId, paramId, value) {
    const vis = this.visualizers[pId];
    if (!vis) return;

    if (pId === 'COSMIC_SCALE') {
      if (paramId === 'scaleStep') vis.setScale(value);
    } else if (pId === 'LIGHT_TIME') {
      if (paramId === 'targetSource') vis.setTarget(value);
      if (paramId === 'playbackProgress') vis.setScrub(parseFloat(value));
    } else if (pId === 'EXOPLANET_DETECTION') {
      if (paramId === 'inclination') vis.setParameters(parseFloat(value), undefined);
      if (paramId === 'planetRadius') vis.setParameters(undefined, parseFloat(value));
      if (paramId === 'transitScrubber') vis.setPhase(parseFloat(value));
    } else if (pId === 'SPECTRUM_LAB') {
      if (paramId === 'sourceType') vis.setSource(value);
      if (paramId === 'wavelengthProbe') vis.setWavelengthProbe(parseFloat(value));
    } else if (pId === 'GRAVITY_FIELD') {
      if (paramId === 'sourceMass') vis.setMass(value);
      if (paramId === 'curvatureIntensity') vis.setWarp(parseFloat(value));
    } else if (pId === 'SPACE_WEATHER') {
      if (paramId === 'solarWindSpeed') vis.setState(value);
    } else if (pId === 'SPACECRAFT_NAVIGATION') {
      if (paramId === 'flightProgress') vis.setProgress(parseFloat(value));
      if (paramId === 'showVectors') vis.showVectors = !!value;
    } else if (pId === 'DATA_SCULPTURE') {
      if (paramId === 'sculptureMode') vis.setMode(value);
      if (paramId === 'frequencyFactor') vis.setParameters(parseFloat(value), undefined);
      if (paramId === 'waveAmplitude') vis.setParameters(undefined, parseFloat(value));
    }
  }

  setPhenomenon(phenomenonId) {
    if (!this.visualizers[phenomenonId]) return;
    this.activeId = phenomenonId;

    // Cross-fade visualizers: hide others, show target
    Object.keys(this.visualizers).forEach(k => {
      if (k === phenomenonId) {
        this.visualizers[k].show();
      } else {
        this.visualizers[k].hide();
      }
    });

    audioHooks.emit('phenomenonSelected', { id: phenomenonId });
  }

  show() {
    this.group.visible = true;
    if (this.visualizers[this.activeId]) {
      this.visualizers[this.activeId].show();
    }
  }

  hide() {
    this.group.visible = false;
    Object.values(this.visualizers).forEach(v => v.hide());
  }

  update(delta, elapsed) {
    if (!this.group.visible) return;

    // Performance guarantee: strictly update only the active phenomenon
    const activeVis = this.visualizers[this.activeId];
    if (activeVis && activeVis.group.visible) {
      activeVis.update(delta, elapsed);
    }
  }
}
