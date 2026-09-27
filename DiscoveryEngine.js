/**
 * DiscoveryEngine.js — Core Logic & Contextual Routing Engine
 * 
 * Part of the COSMIC DISCOVERY ENGINE for MISSION // NEXT FRONTIER.
 * Handles:
 * - Contextual trigger matching & anti-spam cadence throttling
 * - "Unexpected Discovery" recommendation heuristics
 * - Cross-topic curiosity graph navigation
 * - Humanity Mode translation pipeline
 * - Decoupled event pub/sub architecture
 */

import { 
  COSMIC_DISCOVERIES, 
  getDiscoveryById, 
  getDiscoveriesByContext, 
  getRelatedDiscoveries 
} from './discoveryData.js';

export class DiscoveryEngine {
  constructor() {
    /** Set of discovery IDs viewed during this session. */
    this.viewedDiscoveries = new Set();
    
    /** Current discovery actively presented in the focus overlay. */
    this.activeDiscovery = null;

    /** Currently queued unexpected discovery waiting to be triggered by beacon. */
    this.pendingDiscovery = null;

    /** Whether Humanity Mode translation lens is enabled. */
    this.humanityMode = false;

    /** Anti-spam pacing timestamp (minimum interval between automatic beacons). */
    this._lastBeaconTime = 0;
    this._beaconMinIntervalMs = 12000; // 12 seconds cooldown between ambient beacons

    /** Event subscribers map. */
    this._listeners = new Map();

    /** Track recent context to favor relevance. */
    this._currentContext = 'EARTH';
  }

  /* -----------------------------------------------------------------
     Pub / Sub Event Bus
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

  emit(event, data) {
    const list = this._listeners.get(event);
    if (list) {
      for (const cb of list) {
        try {
          cb(data);
        } catch (e) {
          console.error(`[DiscoveryEngine] Error in listener for ${event}:`, e);
        }
      }
    }
  }

  /* -----------------------------------------------------------------
     Context Evaluation & Beacon Triggering
     ----------------------------------------------------------------- */
  /**
   * Called when user navigates or interacts (e.g. switches destination,
   * inspects a scientific metric, completes a scenario).
   * @param {string|string[]} contextTags - e.g. 'MARS', ['MARS', 'ATMOSPHERE']
   * @param {boolean} force - whether to bypass interval pacing
   */
  evaluateContext(contextTags, force = false) {
    const now = Date.now();
    if (!force && (now - this._lastBeaconTime < this._beaconMinIntervalMs)) {
      return; // respect anti-spam pacing
    }

    const tags = Array.isArray(contextTags) ? contextTags : [contextTags];
    this._currentContext = tags[0] || 'EARTH';

    // Find candidate discoveries matching tags
    const candidates = getDiscoveriesByContext(tags);
    if (candidates.length === 0) return;

    // Filter for unviewed first, sorted by priority and rarity
    const unviewed = candidates.filter(d => !this.viewedDiscoveries.has(d.id));
    const targetPool = unviewed.length > 0 ? unviewed : candidates;

    // Sort by priority descending
    targetPool.sort((a, b) => b.priority - a.priority);

    // Pick top candidate
    const chosen = targetPool[0];
    if (chosen && (!this.pendingDiscovery || this.pendingDiscovery.id !== chosen.id)) {
      this.pendingDiscovery = chosen;
      this._lastBeaconTime = now;
      this.emit('discoveryAvailable', {
        discovery: chosen,
        context: this._currentContext
      });
    }
  }

  /**
   * Dismiss the currently pending beacon without opening it.
   */
  dismissPendingBeacon() {
    this.pendingDiscovery = null;
    this.emit('beaconCleared', null);
  }

  /* -----------------------------------------------------------------
     Cinematic "Unexpected Discovery" Hero Moment
     ----------------------------------------------------------------- */
  /**
   * Triggers the full focus overlay for an unexpected discovery.
   * If an explicit ID is passed, uses that.
   * Otherwise uses pendingDiscovery, or selects the best unseen discovery.
   * @param {string|null} [explicitId=null]
   */
  triggerUnexpectedDiscovery(explicitId = null) {
    let target = null;

    if (explicitId) {
      target = getDiscoveryById(explicitId);
    } else if (this.pendingDiscovery) {
      target = this.pendingDiscovery;
    } else {
      // Pick best candidate from current context or signature unseen items
      const contextCandidates = getDiscoveriesByContext(this._currentContext)
        .filter(d => !this.viewedDiscoveries.has(d.id));

      if (contextCandidates.length > 0) {
        target = contextCandidates[0];
      } else {
        // Fall back to any unviewed discovery, or any discovery
        const allUnseen = COSMIC_DISCOVERIES.filter(d => !this.viewedDiscoveries.has(d.id));
        if (allUnseen.length > 0) {
          // Favor SIGNATURE or RARE items
          allUnseen.sort((a, b) => b.priority - a.priority);
          target = allUnseen[0];
        } else {
          // User has seen everything! Randomly choose a signature discovery
          const signatures = COSMIC_DISCOVERIES.filter(d => d.rarity === 'SIGNATURE');
          target = signatures[Math.floor(Math.random() * signatures.length)] || COSMIC_DISCOVERIES[0];
        }
      }
    }

    if (!target) return;

    this.activeDiscovery = target;
    this.pendingDiscovery = null;
    this.viewedDiscoveries.add(target.id);

    this.emit('beaconCleared', null);
    this.emit('discoveryRevealed', {
      discovery: target,
      humanityMode: this.humanityMode,
      totalViewed: this.viewedDiscoveries.size,
      totalAvailable: COSMIC_DISCOVERIES.length
    });
  }

  /**
   * Close the currently active discovery modal/overlay.
   */
  closeActiveDiscovery() {
    if (!this.activeDiscovery) return;
    const closed = this.activeDiscovery;
    this.activeDiscovery = null;
    this.emit('discoveryClosed', {
      discovery: closed,
      totalViewed: this.viewedDiscoveries.size
    });
  }

  /* -----------------------------------------------------------------
     Curiosity Graph Navigation (Next Discovery Trail)
     ----------------------------------------------------------------- */
  /**
   * Navigates to the next discovery in the knowledge graph.
   * @param {string} [fromId] - origin discovery id
   */
  navigateRelated(fromId) {
    const id = fromId || (this.activeDiscovery ? this.activeDiscovery.id : null);
    if (!id) return;

    const related = getRelatedDiscoveries(id);
    if (related.length === 0) return;

    // Prefer unviewed related topics
    const unviewed = related.filter(d => !this.viewedDiscoveries.has(d.id));
    const nextTarget = unviewed.length > 0 ? unviewed[0] : related[0];

    this.triggerUnexpectedDiscovery(nextTarget.id);
  }

  /* -----------------------------------------------------------------
     Humanity Mode Lens Translation
     ----------------------------------------------------------------- */
  /**
   * Toggle or set Humanity Mode translation lens.
   * @param {boolean} [forcedState]
   */
  toggleHumanityMode(forcedState = null) {
    this.humanityMode = (forcedState !== null) ? Boolean(forcedState) : !this.humanityMode;
    this.emit('humanityModeChanged', {
      enabled: this.humanityMode,
      activeDiscovery: this.activeDiscovery
    });
    return this.humanityMode;
  }

  /* -----------------------------------------------------------------
     Getters & Metrics
     ----------------------------------------------------------------- */
  getViewedCount() {
    return this.viewedDiscoveries.size;
  }

  getTotalCount() {
    return COSMIC_DISCOVERIES.length;
  }

  isViewed(id) {
    return this.viewedDiscoveries.has(id);
  }
}

export const discoveryEngine = new DiscoveryEngine();
