/**
 * tests/hardeningVerification.test.mjs
 * Hardening and Stabilization Automated Test Suite
 * MISSION // NEXT FRONTIER — MASTER DEBUG PASS
 */

// Setup minimal DOM mock environment for Node execution
const mockElements = new Map();
function createMockElement(id = '', tag = 'div') {
  const classes = new Set();
  const attributes = new Map();
  const listeners = new Map();
  return {
    id,
    tagName: tag.toUpperCase(),
    classList: {
      add: (...c) => c.forEach(x => classes.add(x)),
      remove: (...c) => c.forEach(x => classes.delete(x)),
      toggle: (c, force) => {
        if (force === undefined) {
          if (classes.has(c)) { classes.delete(c); return false; }
          else { classes.add(c); return true; }
        }
        if (force) classes.add(c);
        else classes.delete(c);
        return force;
      },
      contains: (c) => classes.has(c)
    },
    setAttribute: (k, v) => attributes.set(k, String(v)),
    getAttribute: (k) => attributes.get(k) || null,
    hasAttribute: (k) => attributes.has(k),
    removeAttribute: (k) => attributes.delete(k),
    addEventListener: (ev, fn) => {
      if (!listeners.has(ev)) listeners.set(ev, []);
      listeners.get(ev).push(fn);
    },
    removeEventListener: (ev, fn) => {
      const arr = listeners.get(ev) || [];
      listeners.set(ev, arr.filter(f => f !== fn));
    },
    dispatchEvent: (ev) => {
      const arr = listeners.get(ev.type || ev) || [];
      arr.forEach(fn => fn(ev));
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    appendChild: (child) => child,
    removeChild: (child) => child,
    style: {},
    dataset: {},
    innerHTML: '',
    textContent: ''
  };
}

global.window = {
  innerWidth: 1920,
  innerHeight: 1080,
  matchMedia: () => ({ matches: false }),
  addEventListener: () => {},
  removeEventListener: () => {}
};

global.document = {
  getElementById: (id) => {
    if (!mockElements.has(id)) {
      mockElements.set(id, createMockElement(id));
    }
    return mockElements.get(id);
  },
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: (tag) => createMockElement('', tag),
  addEventListener: () => {},
  removeEventListener: () => {}
};

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

async function runTests() {
  console.log('====================================================');
  console.log('MASTER HARDENING & STABILIZATION VERIFICATION SUITE');
  console.log('====================================================\n');

  // TEST 1: DeepSpaceHUD Interface & Accessibility Fix
  console.log('TEST 1: DeepSpaceHUD Hardening & Accessibility Attributes');
  const { DeepSpaceHUD } = await import('../src/ui/DeepSpaceHUD.js');
  const deepSpaceHUD = new DeepSpaceHUD({ camera: {}, scene: {} });

  assert(typeof deepSpaceHUD.isOpen === 'boolean', 'DeepSpaceHUD exposes boolean isOpen getter');
  assert(typeof deepSpaceHUD.close === 'function', 'DeepSpaceHUD exposes close() method');
  assert(typeof deepSpaceHUD.hide === 'function', 'DeepSpaceHUD exposes hide() method');
  assert(typeof deepSpaceHUD.show === 'function', 'DeepSpaceHUD exposes show() method');

  deepSpaceHUD.show();
  assert(deepSpaceHUD.isOpen === true, 'DeepSpaceHUD.isOpen is true after show()');

  deepSpaceHUD.close();
  assert(deepSpaceHUD.isOpen === false, 'DeepSpaceHUD.isOpen is false after close()');

  const explorerPanel = document.getElementById('mc-deep-space-explorer');
  assert(explorerPanel.getAttribute('aria-hidden') === 'true', 'DeepSpaceHUD hide() sets aria-hidden="true" on explorer panel');

  // TEST 2: ScientificDataHUD Polymorphism & Interface Normalization
  console.log('\nTEST 2: ScientificDataHUD Polymorphism & Control Methods');
  const { ScientificDataHUD } = await import('../src/ui/ScientificDataHUD.js');
  const scienceHUD = new ScientificDataHUD();

  assert(typeof scienceHUD.isOpen === 'boolean', 'ScientificDataHUD exposes boolean isOpen getter');
  assert(typeof scienceHUD.close === 'function', 'ScientificDataHUD exposes close() method');
  assert(typeof scienceHUD.toggle === 'function', 'ScientificDataHUD exposes toggle() method');
  assert(typeof scienceHUD.togglePanel === 'function', 'ScientificDataHUD retains togglePanel() for backwards compatibility');

  const initialScienceOpen = scienceHUD.isOpen;
  scienceHUD.toggle();
  assert(scienceHUD.isOpen !== initialScienceOpen, 'ScientificDataHUD.toggle() changes open state');
  scienceHUD.close();
  assert(scienceHUD.isOpen === false, 'ScientificDataHUD.close() idempotently closes panel');

  // TEST 3: DiscoveryHUD Interface Normalization & Drawer Control
  console.log('\nTEST 3: DiscoveryHUD Interface Normalization & Drawer Control');
  const { DiscoveryHUD } = await import('../src/ui/DiscoveryHUD.js');
  const discoveryHUD = new DiscoveryHUD();

  assert(typeof discoveryHUD.isOpen === 'boolean', 'DiscoveryHUD exposes boolean isOpen getter');
  assert(typeof discoveryHUD.isDrawerOpen === 'boolean', 'DiscoveryHUD exposes isDrawerOpen getter');
  assert(typeof discoveryHUD.close === 'function', 'DiscoveryHUD exposes close() method');
  assert(typeof discoveryHUD.closeDrawer === 'function', 'DiscoveryHUD exposes closeDrawer() method');
  assert(typeof discoveryHUD.toggle === 'function', 'DiscoveryHUD exposes toggle() method');
  assert(typeof discoveryHUD.openCatalog === 'function', 'DiscoveryHUD retains openCatalog()');
  assert(typeof discoveryHUD.closeCatalog === 'function', 'DiscoveryHUD retains closeCatalog()');

  discoveryHUD.openCatalog();
  assert(discoveryHUD.isOpen === true, 'DiscoveryHUD.isOpen is true after openCatalog()');
  assert(discoveryHUD.isDrawerOpen === true, 'DiscoveryHUD.isDrawerOpen is true after openCatalog()');

  discoveryHUD.closeDrawer();
  assert(discoveryHUD.isOpen === false, 'DiscoveryHUD.closeDrawer() successfully closes catalog');
  assert(discoveryHUD.isDrawerOpen === false, 'DiscoveryHUD.isDrawerOpen is false after closeDrawer()');

  // TEST 4: ScenarioHubHUD Polymorphism & Interface Normalization
  console.log('\nTEST 4: ScenarioHubHUD Polymorphism & Control Methods');
  const { ScenarioHubHUD } = await import('../src/ui/ScenarioHubHUD.js');
  const scenarioHUD = new ScenarioHubHUD(null);

  assert(typeof scenarioHUD.isOpen === 'boolean', 'ScenarioHubHUD exposes boolean isOpen property');
  assert(typeof scenarioHUD.close === 'function', 'ScenarioHubHUD exposes close() method');
  assert(typeof scenarioHUD.toggle === 'function', 'ScenarioHubHUD exposes toggle() method');
  assert(typeof scenarioHUD.openHub === 'function', 'ScenarioHubHUD retains openHub()');
  assert(typeof scenarioHUD.closeHub === 'function', 'ScenarioHubHUD retains closeHub()');

  scenarioHUD.openHub();
  assert(scenarioHUD.isOpen === true, 'ScenarioHubHUD.isOpen is true after openHub()');
  scenarioHUD.close();
  assert(scenarioHUD.isOpen === false, 'ScenarioHubHUD.close() successfully closes hub');

  // TEST 5: Phase 11 SpaceNowHUD & TimeMachineHUD Interface
  console.log('\nTEST 5: Phase 11 SpaceNowHUD & TimeMachineHUD Hardening');
  const { SpaceNowHUD } = await import('../src/ui/SpaceNowHUD.js');
  const { TimeMachineHUD } = await import('../src/ui/TimeMachineHUD.js');
  const spaceNow = new SpaceNowHUD();
  const timeMachine = new TimeMachineHUD();

  assert(typeof spaceNow.isOpen === 'boolean', 'SpaceNowHUD exposes isOpen getter');
  assert(typeof spaceNow.close === 'function', 'SpaceNowHUD exposes close() method');
  assert(typeof spaceNow.toggle === 'function', 'SpaceNowHUD exposes toggle() method');

  assert(typeof timeMachine.isOpen === 'boolean', 'TimeMachineHUD exposes isOpen getter');
  assert(typeof timeMachine.close === 'function', 'TimeMachineHUD exposes close() method');
  assert(typeof timeMachine.toggle === 'function', 'TimeMachineHUD exposes toggle() method');

  spaceNow.show();
  assert(spaceNow.isOpen === true, 'SpaceNowHUD.isOpen is true after show()');
  spaceNow.close();
  assert(spaceNow.isOpen === false, 'SpaceNowHUD.isOpen is false after close()');

  timeMachine.show();
  assert(timeMachine.isOpen === true, 'TimeMachineHUD.isOpen is true after show()');
  timeMachine.close();
  assert(timeMachine.isOpen === false, 'TimeMachineHUD.isOpen is false after close()');

  // TEST 6: MissionArchitectHUD Assembly & Briefing Methods
  console.log('\nTEST 6: MissionArchitectHUD Safe Control Methods');
  const { MissionArchitectHUD } = await import('../src/ui/MissionArchitectHUD.js');
  const archHUD = new MissionArchitectHUD(null);

  assert(typeof archHUD.assemble === 'function', 'MissionArchitectHUD exposes assemble()');
  assert(typeof archHUD.generateBriefing === 'function', 'MissionArchitectHUD exposes generateBriefing()');
  assert(typeof archHUD._onAssembleClick === 'function', 'MissionArchitectHUD exposes _onAssembleClick() safely');
  assert(typeof archHUD._onOpenBriefingClick === 'function', 'MissionArchitectHUD exposes _onOpenBriefingClick() safely');
  assert(typeof archHUD.close === 'function', 'MissionArchitectHUD exposes close() method');

  // TEST 7: ExperienceConductor Overlay Orchestration & Baseline Reset
  console.log('\nTEST 7: ExperienceConductor Orchestration & Deep Space State Sync');
  const { ExperienceConductor } = await import('../src/conductor/ExperienceConductor.js');

  let deepSpaceExited = false;
  let missionControlExited = false;

  const mockApp = {
    transitions: {
      state: 'deepSpace',
      exitDeepSpace: () => { deepSpaceExited = true; mockApp.transitions.state = 'missionControl'; },
      exitMissionControl: () => { missionControlExited = true; mockApp.transitions.state = 'landing'; },
      enterMissionControl: () => { mockApp.transitions.state = 'missionControl'; }
    },
    missionArchitectHUD: { isOpen: true, close: () => { mockApp.missionArchitectHUD.isOpen = false; }, hide: () => { mockApp.missionArchitectHUD.isOpen = false; } },
    observatoryHUD: { isOpen: true, hide: () => { mockApp.observatoryHUD.isOpen = false; } },
    phenomenaHUD: { isOpen: true, hide: () => { mockApp.phenomenaHUD.isOpen = false; } },
    discoveryHUD: { isOpen: true, close: () => { mockApp.discoveryHUD.isOpen = false; } },
    scenarioHUD: { isOpen: true, close: () => { mockApp.scenarioHUD.isOpen = false; } },
    scienceHUD: { isOpen: true, close: () => { mockApp.scienceHUD.isOpen = false; } },
    spaceNowHUD: { isOpen: true, close: () => { mockApp.spaceNowHUD.isOpen = false; } },
    timeMachineHUD: { isOpen: true, close: () => { mockApp.timeMachineHUD.isOpen = false; } },
    deepSpaceHUD: { isOpen: true }
  };

  const conductor = new ExperienceConductor(mockApp);
  conductor.closeAllOverlays();

  assert(mockApp.missionArchitectHUD.isOpen === false, 'Conductor closes missionArchitectHUD');
  assert(mockApp.observatoryHUD.isOpen === false, 'Conductor closes observatoryHUD');
  assert(mockApp.phenomenaHUD.isOpen === false, 'Conductor closes phenomenaHUD');
  assert(mockApp.discoveryHUD.isOpen === false, 'Conductor closes discoveryHUD');
  assert(mockApp.scenarioHUD.isOpen === false, 'Conductor closes scenarioHUD');
  assert(mockApp.scienceHUD.isOpen === false, 'Conductor closes scienceHUD');
  assert(mockApp.spaceNowHUD.isOpen === false, 'Conductor closes spaceNowHUD');
  assert(mockApp.timeMachineHUD.isOpen === false, 'Conductor closes timeMachineHUD');

  // Test resetToBaseline with deepSpace state
  mockApp.transitions.state = 'deepSpace';
  conductor.resetToBaseline();
  assert(deepSpaceExited === true, 'Conductor resetToBaseline() exits deepSpace when in deepSpace state');

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
