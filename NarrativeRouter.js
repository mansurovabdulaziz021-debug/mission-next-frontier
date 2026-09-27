/**
 * NarrativeRouter.js — Story Continuity System & Contextual Next-Step Router
 * 
 * Provides:
 *   1. User Journey Tracking (what user explored, completed milestones)
 *   2. Contextual Suggestions (optional non-intrusive next steps)
 *   3. "One More Thing" grounded scientific surprise moments
 *   4. Final Insight synthesis statements
 */

export const STORY_CONNECTIONS = {
  EARTH: {
    context: 'TERRESTRIAL MONITORING',
    fact: 'Earth’s magnetosphere shields 99.9% of solar coronal mass ejections.',
    nextSuggestions: [
      { id: 'PHENOMENA_WEATHER', label: 'Space Weather Simulation', action: 'OPEN_PHENOMENON', payload: 'SPACE_WEATHER' },
      { id: 'DATA_INTELLIGENCE', label: 'Planetary Telemetry Matrix', action: 'OPEN_SCIENCE' }
    ]
  },
  MARS: {
    context: 'ATMOSPHERIC EVOLUTION & NAVIGATION',
    fact: 'MAVEN confirmed Mars lost >85% of its primordial atmosphere via solar wind sputtering.',
    nextSuggestions: [
      { id: 'PHENOMENA_SPECTRUM', label: 'Atmospheric Spectroscopy', action: 'OPEN_PHENOMENON', payload: 'SPECTRUM_LAB' },
      { id: 'OBSERVATORY_NAV', label: 'Autonomous Navigation Evidence', action: 'OPEN_OBSERVATORY', payload: 'CASE_05_NAVIGATION' },
      { id: 'ARCHITECT_MARS', label: 'Architect a Mars Mission', action: 'OPEN_ARCHITECT', payload: 'MARS' }
    ]
  },
  MOON: {
    context: 'LUNAR GATEWAY & EXOSPHERE',
    fact: 'Deep permanently shadowed craters at the lunar south pole host estimated billions of tons of water ice.',
    nextSuggestions: [
      { id: 'ARCHITECT_MOON', label: 'Design Lunar Resource Explorer', action: 'OPEN_ARCHITECT', payload: 'MOON' },
      { id: 'PHENOMENA_LIGHT', label: 'Earth-Moon Light-Time Lag', action: 'OPEN_PHENOMENON', payload: 'LIGHT_TIME' }
    ]
  },
  TRAPPIST_1E: {
    context: 'HABITABLE ZONE EXOPLANET',
    fact: 'TRAPPIST-1e is an Earth-sized rocky exoplanet receiving 66% of Earth’s solar flux from an ultra-cool red dwarf.',
    nextSuggestions: [
      { id: 'OBSERVATORY_EXO', label: 'Exoplanet Transit Photometry', action: 'OPEN_OBSERVATORY', payload: 'CASE_01_EXOPLANET' },
      { id: 'PHENOMENA_EXO', label: 'Interactive Light Curve Simulator', action: 'OPEN_PHENOMENON', payload: 'EXOPLANET_DETECTION' },
      { id: 'ARCHITECT_EXO', label: 'Compose Interstellar Probe Concept', action: 'OPEN_ARCHITECT', payload: 'TRAPPIST_1E' }
    ]
  },
  SAGITTARIUS_A: {
    context: 'GALACTIC CENTER GENERAL RELATIVITY',
    fact: 'Star S2 orbits Sgr A* at 7,700 km/s (2.5% of light speed), proving gravitational redshift in 2018.',
    nextSuggestions: [
      { id: 'OBSERVATORY_BH', label: 'Supermassive Black Hole Evidence', action: 'OPEN_OBSERVATORY', payload: 'CASE_03_BLACK_HOLE' },
      { id: 'PHENOMENA_GRAV', label: 'Schwarzschild Geodesic Warping', action: 'OPEN_PHENOMENON', payload: 'GRAVITY_FIELD' }
    ]
  },
  EUROPA: {
    context: 'OCEAN WORLD ASTROBIOLOGY',
    fact: 'Europa’s sub-surface ocean holds twice the liquid water of all Earth’s oceans combined.',
    nextSuggestions: [
      { id: 'ARCHITECT_EUROPA', label: 'Design Europa Ice Penetrator', action: 'OPEN_ARCHITECT', payload: 'EUROPA' },
      { id: 'OBSERVATORY_LOOKBACK', label: 'Signal Lookback Time Constraints', action: 'OPEN_OBSERVATORY', payload: 'CASE_04_LOOKBACK_TIME' }
    ]
  }
};

export const ONE_MORE_THING_INSIGHTS = [
  {
    trigger: 'ARCHITECT_COMPLETE',
    kicker: 'ONE MORE THING // ASTROBIOLOGY & HUMANITY',
    title: 'THE INTERPLANETARY WATER CONVEYOR',
    body: 'Isotopic D/H (deuterium to hydrogen) ratios measured in Martian phyllosilicates by Curiosity match ancient Earth oceans, indicating that early in our solar system’s history, Earth and Mars shared nearly identical surface water reservoirs before divergence.',
    citation: 'Webster et al., Science (2015) / NASA Mars Science Laboratory'
  },
  {
    trigger: 'OBSERVATORY_COMPLETE',
    kicker: 'ONE MORE THING // RELATIVITY & PRECISION',
    title: 'THE GRAVITATIONAL CLOCK OFFSET',
    body: 'Without applying both Special Relativity’s time dilation (-7 microseconds/day) and General Relativity’s gravitational blueshift (+45 microseconds/day), all GPS and interplanetary autonomous navigation vectors would drift by over 10 kilometers every 24 hours.',
    citation: 'Ashby, Living Reviews in Relativity / NIST Time & Frequency Standards'
  },
  {
    trigger: 'PHENOMENA_EXPLORED',
    kicker: 'ONE MORE THING // COSMIC ENERGY',
    title: 'THE SOLAR PHOTON RANDOM WALK',
    body: 'A photon produced by nuclear fusion inside the Sun’s core takes between 100,000 and 170,000 years to scatter its way out to the solar surface—yet once liberated into deep space, it travels the remaining 150 million kilometers to Earth in exactly 499 seconds.',
    citation: 'Mitalas & Sills, Astrophysical Journal (1992)'
  }
];

export const FINAL_INSIGHT_SYNTHESIS = {
  kicker: 'FINAL SYNTHESIS // THE NEXT FRONTIER',
  title: 'FROM DATA TO UNDERSTANDING',
  philosophy: 'THE UNIVERSE IS NOT THE END OF THE JOURNEY. IT IS THE QUESTION.',
  body: 'We do not simply look at space. We investigate it. We measure it. We question it. We build missions around what we can know.\n\nEvery transit light curve, every radio ranging Doppler shift, and every planetary spectroscopy reading is humanity extending its sensory awareness across millions of kilometers of vacuum. In understanding the cosmos, we ultimately decipher our own fragile origin.',
  citation: 'MISSION // NEXT FRONTIER — NASA SPACE APPS CHALLENGE 2026 · ALL 11 PHASES VERIFIED',
  author: 'MISSION // NEXT FRONTIER — NASA SPACE APPS CHALLENGE 2026'
};

export class NarrativeRouter {
  constructor() {
    this._history = [];
    this._listeners = new Map();
    this._shownSurprises = new Set();
  }

  /**
   * Log user action and evaluate contextual recommendation.
   * @param {string} actionType
   * @param {string} entityKey
   */
  logAction(actionType, entityKey) {
    const item = { actionType, entityKey, timestamp: Date.now() };
    this._history.push(item);
    if (this._history.length > 50) this._history.shift();

    const suggestion = this.getSuggestion(entityKey);
    if (suggestion) {
      this.emit('suggestionReady', suggestion);
    }
  }

  /**
   * Retrieve suggestion for an entity key.
   * @param {string} entityKey
   */
  getSuggestion(entityKey) {
    const conn = STORY_CONNECTIONS[entityKey];
    if (!conn) return null;

    return {
      entityKey,
      context: conn.context,
      fact: conn.fact,
      suggestions: conn.nextSuggestions
    };
  }

  /**
   * Trigger "One More Thing" if eligible.
   * @param {string} triggerName
   * @returns {object|null}
   */
  triggerOneMoreThing(triggerName) {
    if (this._shownSurprises.has(triggerName)) return null;

    const insight = ONE_MORE_THING_INSIGHTS.find(i => i.trigger === triggerName);
    if (insight) {
      this._shownSurprises.add(triggerName);
      this.emit('oneMoreThing', insight);
      return insight;
    }
    return null;
  }

  /**
   * Get the final insight conclusion.
   */
  getFinalInsight() {
    return FINAL_INSIGHT_SYNTHESIS;
  }

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
        console.error(`[NarrativeRouter] Error in ${event}:`, err);
      }
    }
  }
}

export const narrativeRouter = new NarrativeRouter();
