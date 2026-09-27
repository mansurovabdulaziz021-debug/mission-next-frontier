/**
 * MissionState — Centralized state management for MISSION // NEXT FRONTIER.
 * Provides a pub/sub event bus for UI and 3D environment synchronization.
 *
 * NOTE ON SCALING:
 * Planetary distances and radii use a calibrated VISUALIZATION SCALE to allow
 * simultaneous visual inspection and spatial depth comprehension within a single
 * real-time viewport, while retaining authentic astronomical metadata in data tables.
 */

export const CAMERA_STATES = {
  MISSION_CONTROL: 'MISSION_CONTROL',
  SOLAR_OVERVIEW:  'SOLAR_OVERVIEW',
  EARTH_FOCUS:     'EARTH_FOCUS',
  MOON_FOCUS:      'MOON_FOCUS',
  MARS_FOCUS:      'MARS_FOCUS',
  DEEP_SPACE:      'DEEP_SPACE',
  DEEP_SPACE_FOCUS:'DEEP_SPACE_FOCUS',
  OBSERVATORY:     'OBSERVATORY',
  PHENOMENA:       'PHENOMENA',
  MISSION_ARCHITECT:'MISSION_ARCHITECT'
};

export const DESTINATIONS = {
  SOLAR_SYSTEM: {
    id: 'SOLAR_SYSTEM',
    name: 'SOLAR SYSTEM // INNER REGION',
    type: 'HELIOCENTRIC OVERVIEW',
    category: 'STELLAR SYSTEM',
    realDistance: '1.000 AU (EARTH MEAN)',
    visDistance: 'HELIOCENTRIC GRID',
    radius: 'HELIOSPHERE CORRIDOR',
    gravity: '1.000 G (SOLAR GRAVITATIONAL WELL)',
    period: 'VARIES BY ORBITAL REGIME',
    velocity: '29.78 KM/S (SYSTEM MEAN)',
    inclination: '7.25° (SOLAR EQUATOR)',
    atmosphere: 'SOLAR WIND / HELIOSPHERIC PLASMA',
    status: 'SYSTEM-WIDE RADAR ACTIVE',
    signalLatency: 'VARIABLE (0.1s - 14m)',
    cameraTarget: { x: 7.5, y: 12.0, z: 16.5 },
    lookAt: { x: 4.0, y: 0.5, z: -2.5 },
    subsystems: {
      deepSpaceNet: 'DSN GOLDSTONE / MADRID / CANBERRA',
      opticalRelay: 'LCRD INTERPLANETARY LINK',
      spaceWeather: 'SWPC SOLAR FLUX WATCH ACTIVE',
      guidance:     'AUTONOMOUS ASTROMETRIC STAR TRACKER'
    },
    observations: [
      { label: 'INNER SYSTEM CORRIDOR', val: 'SOLAR → MARS TRANSIT' },
      { label: 'SOLAR WIND VELOCITY',   val: '420 KM/S (STEADY)' },
      { label: 'INTERPLANETARY B-FIELD', val: '5.4 nT' },
      { label: 'ACTIVE TRACKING NODES',  val: '3 CELESTIAL BODIES' }
    ]
  },
  EARTH: {
    id: 'EARTH',
    name: 'EARTH // TERRA-1',
    type: 'PRIMARY HABITATION // ORIGIN',
    category: 'TERRESTRIAL PLANET',
    realDistance: '149,597,870 KM (1.000 AU FROM SUN)',
    visDistance: '35,786 KM (GEO STATIONARY APEX)',
    radius: '6,371.0 KM (EQUATORIAL)',
    gravity: '9.807 M/S² (1.000 G)',
    period: '23h 56m 04s (SIDEREAL)',
    velocity: '29.78 KM/S (ORBITAL)',
    inclination: '0.00° (ECLIPTIC REFERENCE)',
    atmosphere: '78% N2, 21% O2, 0.93% Ar, 0.04% CO2',
    status: 'OPTIMAL // SENSOR ARRAY ONLINE',
    signalLatency: '< 0.12 SEC',
    cameraTarget: { x: 1.5, y: 0.35, z: 2.6 },
    lookAt: { x: -0.4, y: -0.05, z: 0 },
    subsystems: {
      powerBus:   '98.4% (SOLAR ARRAY NOMINAL)',
      sensorHub:  'ONLINE // MULTI-SPECTRAL',
      thermal:    '294 K (NOMINAL EQUILIBRIUM)',
      commCarrier:'32.4 GHz KA-BAND ACTIVE'
    },
    observations: [
      { label: 'ATMOSPHERIC ALBEDO', val: '0.306' },
      { label: 'MAGNETOSPHERE FLUX', val: '31.2 µT' },
      { label: 'SURFACE TEMP MEAN', val: '+14.9°C' },
      { label: 'CLOUD FRACTION',     val: '67.2% GLOBAL' }
    ]
  },
  MOON: {
    id: 'MOON',
    name: 'MOON // LUNA-1',
    type: 'NATURAL SATELLITE // GATEWAY',
    category: 'SELENOGRAPHIC ANCHOR',
    realDistance: '384,400 KM (SEMI-MAJOR AXIS)',
    visDistance: '384,400 KM (LUNAR ORBIT)',
    radius: '1,737.4 KM (0.272 EARTH)',
    gravity: '1.622 M/S² (0.165 G)',
    period: '27.32 DAYS (TIDALLY LOCKED)',
    velocity: '1.022 KM/S (ORBITAL)',
    inclination: '5.14° (TO ECLIPTIC)',
    atmosphere: 'SURFACE-BOUND EXOSPHERE (TRACE HE, AR, NE)',
    status: 'RELAY LINK ESTABLISHED',
    signalLatency: '1.28 SEC',
    cameraTarget: { x: 4.3, y: 0.85, z: -0.7 },
    lookAt: { x: 3.6, y: 0.6, z: -1.8 },
    subsystems: {
      artemisGateway: 'ORBITAL RELAY READY',
      opticalLaser:   'LLCD DUAL-WAY CONNECTED',
      polarArray:     'SHACKLETON RADAR SCANNING',
      thermalSensors: '120 K (SHADOW REGIONS)'
    },
    observations: [
      { label: 'SELENOGRAPHIC LAT', val: '0.674° N' },
      { label: 'SOUTH POLE WATER ICE',val: 'RADAR CONFIRMED' },
      { label: 'REGOLITH DEPTH',    val: '4.2 - 8.5 M' },
      { label: 'SURFACE ALBEDO',    val: '0.12 (BASALTIC)' }
    ]
  },
  MARS: {
    id: 'MARS',
    name: 'MARS // ARES-1',
    type: 'NEXT FRONTIER // OUTPOST VECTOR',
    category: 'EXPEDITION DESTINATION',
    realDistance: '227,939,200 KM (1.524 AU FROM SUN)',
    visDistance: '225.4M KM (TRANSFER TRAJECTORY)',
    radius: '3,389.5 KM (0.532 EARTH)',
    gravity: '3.721 M/S² (0.379 G)',
    period: '24h 37m 22s (1.026 SOL)',
    velocity: '24.07 KM/S (ORBITAL)',
    inclination: '1.85° (TO ECLIPTIC)',
    atmosphere: '95.3% CO2, 2.6% N2, 1.9% Ar (6.1 hPa)',
    status: 'DEEP SPACE RADAR LOCKED',
    signalLatency: '12.53 MIN',
    cameraTarget: { x: 9.8, y: 2.0, z: -5.1 },
    lookAt: { x: 9.2, y: 1.6, z: -6.4 },
    subsystems: {
      dsnDownlink:    'GOLDSTONE 34M BEAMED',
      roverTelemetry: 'PERSEVERANCE / CURIOSITY ONLINE',
      orbitersRelay:  'MRO & TGO SYNCHRONIZED',
      surfaceThermal: '210 K (EQUATORIAL MEAN)'
    },
    observations: [
      { label: 'ATMOSPHERIC PRESSURE', val: '6.1 hPa' },
      { label: 'SOLAR IRRADIANCE',     val: '589 W/M²' },
      { label: 'TRANSFER ORBIT DELTA-V',val: '3.62 KM/S' },
      { label: 'POLAR ICE MASS',       val: 'H2O / CO2 DRY ICE' }
    ]
  }
};

export class MissionState {
  constructor() {
    this.view = 'loading'; // 'loading' | 'landing' | 'transitioning' | 'missionControl' | 'deepSpace'
    this.cameraState = CAMERA_STATES.MISSION_CONTROL;
    this.activeDestination = 'EARTH';
    this.hoveredDestination = null;
    this.deepSpaceActive = false;
    this.observatoryActive = false;
    this.phenomenaActive = false;
    this.missionArchitectActive = false;
    this.focusedDeepSpaceObject = null;
    this.toggles = {
      trajectories: true,
      sensors: true,
      grid: true
    };
    this.epochStart = Date.now() - 3645000; // T+ running baseline
    this._listeners = new Map();
  }

  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const arr = this._listeners.get(event);
    if (!arr) return;
    this._listeners.set(event, arr.filter(cb => cb !== callback));
  }

  emit(event, data) {
    const arr = this._listeners.get(event);
    if (arr) {
      for (const cb of arr) {
        cb(data);
      }
    }
  }

  setDestination(destKey) {
    if (!DESTINATIONS[destKey] || this.activeDestination === destKey) return;
    this.activeDestination = destKey;

    if (destKey === 'EARTH')        this.cameraState = CAMERA_STATES.EARTH_FOCUS;
    else if (destKey === 'MOON')   this.cameraState = CAMERA_STATES.MOON_FOCUS;
    else if (destKey === 'MARS')   this.cameraState = CAMERA_STATES.MARS_FOCUS;
    else if (destKey === 'SOLAR_SYSTEM') this.cameraState = CAMERA_STATES.SOLAR_OVERVIEW;

    this.emit('destinationChanged', DESTINATIONS[destKey]);
  }

  setHoveredDestination(destKey) {
    if (this.hoveredDestination === destKey) return;
    this.hoveredDestination = destKey;
    this.emit('destinationHovered', destKey ? DESTINATIONS[destKey] : null);
  }

  toggleOverlay(key) {
    if (this.toggles[key] !== undefined) {
      this.toggles[key] = !this.toggles[key];
      this.emit('togglesChanged', this.toggles);
    }
  }

  getMissionElapsedTime() {
    const diff = Math.floor((Date.now() - this.epochStart) / 1000);
    const hrs = String(Math.floor(diff / 3600)).padStart(3, '0');
    const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const secs = String(diff % 60).padStart(2, '0');
    return `T+ ${hrs}:${mins}:${secs}`;
  }
}

export const missionState = new MissionState();
