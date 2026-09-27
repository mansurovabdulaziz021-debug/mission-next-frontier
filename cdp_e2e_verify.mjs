/**
 * tests/cdp_e2e_verify.mjs
 * Headless Chrome E2E Verification & Screenshot Capture via CDP
 * MISSION // NEXT FRONTIER — MASTER DEBUG & HARDENING PASS
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'D:\\NASA_Space_App_Test_Artifacts';
const CHROME_PROFILE = path.join(ARTIFACTS_DIR, 'chrome_profile');
const DEV_URL = 'http://127.0.0.1:3000/';

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.callbacks = new Map();
    this.events = new Map();
  }

  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id && this.callbacks.has(data.id)) {
        const { resolve, reject } = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      } else if (data.method) {
        const listeners = this.events.get(data.method) || [];
        listeners.forEach(fn => fn(data.params));
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(event, fn) {
    if (!this.events.has(event)) this.events.set(event, []);
    this.events.get(event).push(fn);
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  async captureScreenshot(filename) {
    const filePath = path.join(ARTIFACTS_DIR, filename);
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    const stats = fs.statSync(filePath);
    console.log(`  📸 Captured ${filename} (${(stats.size / 1024).toFixed(1)} KB) -> ${filePath}`);
    return filePath;
  }
}

async function runE2E() {
  console.log('====================================================');
  console.log('STARTING HEADLESS CHROME E2E VERIFICATION (CDP)');
  console.log('====================================================\n');

  console.log('Launching Headless Chrome on port 9222...');
  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${CHROME_PROFILE}`,
    '--window-size=1920,1080',
    '--no-sandbox',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check'
  ], { stdio: 'pipe' });

  // Wait for CDP endpoint
  let versionData = null;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) {
        versionData = await res.json();
        break;
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 400));
  }

  if (!versionData) {
    chromeProc.kill();
    throw new Error('Chrome CDP failed to initialize within 12 seconds');
  }

  console.log(`✓ Chrome initialized (${versionData['User-Agent']})`);

  // Create or get page
  const newTabRes = await fetch('http://127.0.0.1:9222/json/new', { method: 'PUT' });
  const tab = await newTabRes.json();
  const cdp = new CDPClient(tab.webSocketDebuggerUrl);
  await cdp.connect();

  console.log('✓ Connected to CDP Page WebSocket');

  // Track console logs and errors
  const consoleLogs = [];
  const runtimeErrors = [];

  cdp.on('Console.messageAdded', (params) => {
    const msg = params.message;
    consoleLogs.push(msg);
    if (msg.level === 'error') {
      console.error(`  [Browser Console Error]: ${msg.text}`);
    }
  });

  cdp.on('Runtime.exceptionThrown', (params) => {
    runtimeErrors.push(params.exceptionDetails);
    console.error(`  [Runtime Exception]:`, params.exceptionDetails.text);
  });

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Console.enable');

  // Navigate to dev server
  console.log(`Navigating to ${DEV_URL}...`);
  await cdp.send('Page.navigate', { url: DEV_URL });

  // Wait for loading sequence to complete (check loader element or window.__missionApp)
  console.log('Waiting for WebGL 4K scene initialization and protected loading flow...');
  let initialized = false;
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 500));
    const state = await cdp.evaluate(`
      (() => {
        if (!window.__missionApp) return { ready: false };
        const app = window.__missionApp;
        const loader = document.getElementById('loader');
        const loaderHidden = !loader || loader.classList.contains('hidden') || loader.style.opacity === '0' || getComputedStyle(loader).display === 'none' || loader.getAttribute('aria-hidden') === 'true';
        return {
          ready: true,
          transitionsState: app.transitions?.state,
          loaderHidden
        };
      })()
    `);

    if (state.ready) {
      initialized = true;
      console.log(`✓ App booted. Initial transitions state: ${state.transitionsState}`);
      break;
    }
  }

  if (!initialized) {
    throw new Error('Timed out waiting for window.__missionApp initialization');
  }

  // Allow animations to settle
  await new Promise(r => setTimeout(r, 1500));

  console.log('\n--- EXECUTING 9 REQUIRED E2E JOURNEY STEPS ---\n');

  // STEP 1: debug-01-mission-control.png
  console.log('Step 1: Enter Mission Control...');
  await cdp.evaluate(`
    (() => {
      const enterBtn = document.getElementById('enter-btn');
      if (enterBtn) enterBtn.click();
      else window.__missionApp.transitions.enterMissionControl();
    })()
  `);
  await new Promise(r => setTimeout(r, 2200));
  await cdp.captureScreenshot('debug-01-mission-control.png');

  // STEP 2: debug-02-solar-system.png
  console.log('Step 2: Transition to Heliocentric Solar System View...');
  await cdp.evaluate(`
    (() => {
      window.__missionApp.conductor.executeStepAction('SHOW_SOLAR_SYSTEM');
    })()
  `);
  await new Promise(r => setTimeout(r, 2200));
  await cdp.captureScreenshot('debug-02-solar-system.png');

  // STEP 3: debug-03-data-intelligence.png
  console.log('Step 3: Open Scientific Data Intelligence HUD...');
  await cdp.evaluate(`
    (() => {
      window.__missionApp.conductor.executeStepAction('SHOW_DATA_INTELLIGENCE');
    })()
  `);
  await new Promise(r => setTimeout(r, 1800));
  await cdp.captureScreenshot('debug-03-data-intelligence.png');

  // STEP 4: debug-04-scenarios.png
  console.log('Step 4: Open Interactive Scenario Hub...');
  await cdp.evaluate(`
    (() => {
      window.__missionApp.conductor.closeAllOverlays();
      window.__missionApp.scenarioHUD.openHub();
    })()
  `);
  await new Promise(r => setTimeout(r, 1800));
  await cdp.captureScreenshot('debug-04-scenarios.png');

  // STEP 5: debug-05-discovery.png
  console.log('Step 5: Open Cosmic Discovery Catalog...');
  await cdp.evaluate(`
    (() => {
      window.__missionApp.conductor.closeAllOverlays();
      window.__missionApp.discoveryHUD.openCatalog();
    })()
  `);
  await new Promise(r => setTimeout(r, 1800));
  await cdp.captureScreenshot('debug-05-discovery.png');

  // STEP 6: debug-06-cosmic-universe.png
  console.log('Step 6: Enter Deep Space / Cosmic Scale View...');
  await cdp.evaluate(`
    (() => {
      window.__missionApp.conductor.closeAllOverlays();
      window.__missionApp.transitions.enterDeepSpace();
    })()
  `);
  await new Promise(r => setTimeout(r, 2500));
  await cdp.captureScreenshot('debug-06-cosmic-universe.png');

  // STEP 7: debug-07-observatory.png
  console.log('Step 7: Open Observatory Evidence Lab...');
  await cdp.evaluate(`
    (() => {
      window.__missionApp.conductor.closeAllOverlays();
      window.__missionApp.observatoryHUD.show('CASE_01_EXOPLANET');
    })()
  `);
  await new Promise(r => setTimeout(r, 1800));
  await cdp.captureScreenshot('debug-07-observatory.png');

  // STEP 8: debug-08-phenomena-lab.png
  console.log('Step 8: Open Phenomena Physics Lab...');
  await cdp.evaluate(`
    (() => {
      window.__missionApp.conductor.closeAllOverlays();
      window.__missionApp.phenomenaHUD.show();
    })()
  `);
  await new Promise(r => setTimeout(r, 2000));
  await cdp.captureScreenshot('debug-08-phenomena-lab.png');

  // STEP 9: debug-09-mission-architect.png
  console.log('Step 9: Open Mission Architect HUD...');
  await cdp.evaluate(`
    (() => {
      window.__missionApp.conductor.closeAllOverlays();
      window.__missionApp.missionArchitectHUD.show();
    })()
  `);
  await new Promise(r => setTimeout(r, 2000));
  await cdp.captureScreenshot('debug-09-mission-architect.png');

  // STEP 10: debug-10-ending-ceremony.png
  console.log('Step 10: Trigger Final Ending Ceremony & Philosophical Synthesis...');
  await cdp.evaluate(`
    (() => {
      window.__missionApp.conductor.executeStepAction('SHOW_FINAL_INSIGHT');
    })()
  `);
  await new Promise(r => setTimeout(r, 2800));
  await cdp.captureScreenshot('debug-10-ending-ceremony.png');

  // Dismiss ceremony and verify return to free exploration
  console.log('Dismissing Ceremony modal to return to free exploration...');
  await cdp.evaluate(`
    (() => {
      const actionBtn = document.getElementById('mc-insight-action');
      if (actionBtn) actionBtn.click();
      else window.__missionApp.conductor.resetToBaseline();
    })()
  `);
  await new Promise(r => setTimeout(r, 1500));

  // Reset to baseline
  console.log('Resetting workspace to baseline...');
  await cdp.evaluate(`
    (() => {
      window.__missionApp.conductor.resetToBaseline();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  // Close browser
  console.log('Shutting down Chrome...');
  await cdp.send('Browser.close').catch(() => {});
  chromeProc.kill();

  console.log('\n====================================================');
  console.log('E2E VERIFICATION AUDIT METRICS');
  console.log('====================================================');
  console.log(`Total Console Messages Captured: ${consoleLogs.length}`);
  console.log(`Runtime Exceptions Detected:     ${runtimeErrors.length}`);

  const requiredScreenshots = [
    'debug-01-mission-control.png',
    'debug-02-solar-system.png',
    'debug-03-data-intelligence.png',
    'debug-04-scenarios.png',
    'debug-05-discovery.png',
    'debug-06-cosmic-universe.png',
    'debug-07-observatory.png',
    'debug-08-phenomena-lab.png',
    'debug-09-mission-architect.png',
    'debug-10-ending-ceremony.png'
  ];

  let missing = 0;
  for (const f of requiredScreenshots) {
    const fullPath = path.join(ARTIFACTS_DIR, f);
    if (fs.existsSync(fullPath)) {
      const s = fs.statSync(fullPath);
      console.log(`  ✓ VERIFIED: ${f} (${(s.size / 1024).toFixed(1)} KB)`);
    } else {
      console.error(`  ✗ MISSING: ${f}`);
      missing++;
    }
  }

  if (runtimeErrors.length > 0 || missing > 0) {
    console.error(`\nFAILED: ${runtimeErrors.length} runtime errors, ${missing} missing screenshots.`);
    process.exit(1);
  } else {
    console.log('\nALL 9 REQUIRED SCREENSHOTS VERIFIED & ZERO RUNTIME ERRORS DETECTED.');
    process.exit(0);
  }
}

runE2E().catch(err => {
  console.error('Fatal E2E error:', err);
  process.exit(1);
});
