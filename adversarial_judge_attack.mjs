/**
 * tests/adversarial_judge_attack.mjs
 * ZERO-MERCY ADVERSARIAL AUDIT & BENCHMARK SUITE
 * Measures WebGL buffer, frame timing, memory, clickable controls, and data integrity via CDP.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'D:\\NASA_Space_App_Test_Artifacts';
const CHROME_PROFILE = path.join(ARTIFACTS_DIR, 'chrome_judge_attack_profile');
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
      const desc = res.exceptionDetails.exception?.description || JSON.stringify(res.exceptionDetails);
      throw new Error(`Eval error: ${desc}`);
    }
    return res.result?.value;
  }

  async captureScreenshot(filename) {
    const filePath = path.join(ARTIFACTS_DIR, filename);
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    const stats = fs.statSync(filePath);
    console.log(`  📸 Captured ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
    return filePath;
  }
}

async function runAttack() {
  console.log('====================================================');
  console.log('ZERO-MERCY ADVERSARIAL AUDIT & BENCHMARK');
  console.log('====================================================\n');

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

  let versionData = null;
  for (let i = 0; i < 25; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) {
        versionData = await res.json();
        break;
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  if (!versionData) {
    throw new Error('Failed to connect to Headless Chrome on port 9222.');
  }

  console.log(`Chrome WebSocket Endpoint: ${versionData.webSocketDebuggerUrl}`);

  const targetsRes = await fetch('http://127.0.0.1:9222/json/list');
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();

  const consoleLogs = [];
  const consoleErrors = [];
  cdp.on('Runtime.consoleAPICalled', (params) => {
    const text = params.args.map(a => a.value || a.description || '').join(' ');
    if (params.type === 'error') {
      consoleErrors.push(`[${params.type.toUpperCase()}] ${text}`);
    } else {
      consoleLogs.push(`[${params.type.toUpperCase()}] ${text}`);
    }
  });

  cdp.on('Runtime.exceptionThrown', (params) => {
    consoleErrors.push(`[EXCEPTION] ${params.exceptionDetails?.text || ''} ${params.exceptionDetails?.exception?.description || ''}`);
  });

  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');

  console.log(`\nNavigating to ${DEV_URL}...`);
  await cdp.send('Page.navigate', { url: DEV_URL });
  await new Promise(r => setTimeout(r, 3500));

  console.log('\n--- SECTION 01 & 07: CANVAS & WEBGL RESOLUTION AUDIT ---');
  const webglAudit = await cdp.evaluate(`
    (() => {
      const canvas = document.querySelector('canvas');
      const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl');
      let debugInfo = null;
      let vendor = 'unknown';
      let renderer = 'unknown';
      let maxTextureSize = 0;
      let maxViewport = [];
      if (gl) {
        debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
        maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        maxViewport = Array.from(gl.getParameter(gl.MAX_VIEWPORT_DIMS) || []);
      }
      return {
        hasCanvas: !!canvas,
        canvasId: canvas?.id || 'none',
        dpr: window.devicePixelRatio,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        canvasClientWidth: canvas?.clientWidth || 0,
        canvasClientHeight: canvas?.clientHeight || 0,
        drawingBufferWidth: canvas?.width || 0,
        drawingBufferHeight: canvas?.height || 0,
        isWebgl2: !!canvas?.getContext('webgl2'),
        vendor,
        renderer,
        maxTextureSize,
        maxViewport,
        canvasComputedFilter: canvas ? window.getComputedStyle(canvas).filter : 'none',
        canvasComputedBackdrop: canvas ? window.getComputedStyle(canvas).backdropFilter : 'none'
      };
    })()
  `);
  console.log('WebGL & Display Audit:', JSON.stringify(webglAudit, null, 2));

  console.log('\n--- SECTION 08: 120-FRAME TIMING & FPS BENCHMARK ---');
  const frameBenchmark = await cdp.evaluate(`
    new Promise((resolve) => {
      const deltas = [];
      let last = performance.now();
      let count = 0;
      function onFrame(now) {
        deltas.push(now - last);
        last = now;
        count++;
        if (count < 120) {
          requestAnimationFrame(onFrame);
        } else {
          // slice first 5 warmup frames
          const stable = deltas.slice(5);
          const sum = stable.reduce((a, b) => a + b, 0);
          const avgDelta = sum / stable.length;
          const minDelta = Math.min(...stable);
          const maxDelta = Math.max(...stable);
          const fps = 1000 / avgDelta;
          const drops = stable.filter(d => d > 33.3).length; // below 30 fps
          resolve({
            sampleCount: stable.length,
            fps: Math.round(fps * 10) / 10,
            avgFrameTimeMs: Math.round(avgDelta * 100) / 100,
            minFrameTimeMs: Math.round(minDelta * 100) / 100,
            maxFrameTimeMs: Math.round(maxDelta * 100) / 100,
            frameDropsUnder30Fps: drops
          });
        }
      }
      requestAnimationFrame(onFrame);
    })
  `);
  console.log('Frame Benchmark Results:', JSON.stringify(frameBenchmark, null, 2));

  console.log('\n--- THREE.JS SCENE GRAPH & MEMORY INSPECTION ---');
  const memoryInspection = await cdp.evaluate(`
    (() => {
      const app = window.__missionApp;
      const perfMemory = window.performance?.memory ? {
        totalJSHeapSize: Math.round(window.performance.memory.totalJSHeapSize / (1024 * 1024) * 10) / 10 + ' MB',
        usedJSHeapSize: Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024) * 10) / 10 + ' MB',
        jsHeapSizeLimit: Math.round(window.performance.memory.jsHeapSizeLimit / (1024 * 1024) * 10) / 10 + ' MB'
      } : 'not exposed in headless';

      let rendererInfo = null;
      if (app?.scene?.renderer?.info) {
        rendererInfo = {
          memory: app.scene.renderer.info.memory,
          render: app.scene.renderer.info.render
        };
      }

      let sceneChildrenCount = 0;
      let meshCount = 0;
      if (app?.scene?.scene) {
        sceneChildrenCount = app.scene.scene.children.length;
        app.scene.scene.traverse((obj) => {
          if (obj.isMesh) meshCount++;
        });
      }

      return {
        hasApp: !!app,
        hasScene: !!app?.scene,
        hasConductor: !!app?.conductor,
        perfMemory,
        rendererInfo,
        sceneChildrenCount,
        meshCount,
        domNodeCount: document.getElementsByTagName('*').length
      };
    })()
  `);
  console.log('Memory & Scene Inspection:', JSON.stringify(memoryInspection, null, 2));

  console.log('\n--- SECTION 01: 30-SECOND USER JOURNEY & LANDING TO MISSION CONTROL ---');
  const enterResult = await cdp.evaluate(`
    (() => {
      const enterBtn = document.getElementById('enter-btn');
      if (enterBtn) {
        enterBtn.click();
        return { clicked: true, text: enterBtn.innerText.trim() };
      }
      return { clicked: false, reason: 'enter-btn not found' };
    })()
  `);
  console.log('Enter Mission Control Action:', enterResult);
  await new Promise(r => setTimeout(r, 1200));

  console.log('\n--- MULTI-VIEW RAPID STRESS & NAVIGATION AUDIT ---');
  const viewStressAudit = await cdp.evaluate(`
    (async () => {
      const app = window.__missionApp;
      const conductor = app?.conductor;
      if (!conductor) return { error: 'No conductor' };

      const actions = [
        'SHOW_SOLAR_SYSTEM',
        'SHOW_DATA_INTELLIGENCE',
        'SHOW_PHENOMENA',
        'SHOW_OBSERVATORY',
        'SHOW_MISSION_ARCHITECT',
        'SHOW_MISSION_BRIEFING',
        'SHOW_FINAL_INSIGHT',
        'SHOW_MISSION_CONTROL'
      ];

      const results = [];
      for (const a of actions) {
        const start = performance.now();
        conductor.executeStepAction(a);
        await new Promise(r => setTimeout(r, 600));
        const dt = Math.round(performance.now() - start);
        results.push({ action: a, timeMs: dt });
      }
      return results;
    })()
  `);
  console.log('Multi-view Navigation Stress Results:', JSON.stringify(viewStressAudit, null, 2));

  console.log('\n--- SECTION 07: PHENOMENA LAB DEEP INSPECTION ---');
  const phenomenaAudit = await cdp.evaluate(`
    (async () => {
      const app = window.__missionApp;
      app.conductor.executeStepAction('SHOW_PHENOMENA');
      await new Promise(r => setTimeout(r, 800));

      const hud = app.phenomenaHUD;
      const manager = app.phenomenaSceneManager;
      const canvas = document.querySelector('canvas');

      return {
        isOpen: hud?.isOpen,
        activeVisualizer: manager?.activeVisualizerName || 'none',
        canvasWidth: canvas?.width,
        canvasHeight: canvas?.height,
        dpr: window.devicePixelRatio,
        canvasFilter: canvas ? window.getComputedStyle(canvas).filter : 'none',
        canvasBackdrop: canvas ? window.getComputedStyle(canvas).backdropFilter : 'none',
        hasModalBlur: !!document.querySelector('.mc__insight-modal[style*="backdrop-filter"]')
      };
    })()
  `);
  console.log('Phenomena Lab Audit:', JSON.stringify(phenomenaAudit, null, 2));
  await cdp.captureScreenshot('judge-attack-02-phenomena.png');

  console.log('\n--- SECTION 12: OBSERVATORY EVIDENCE LAB DEEP AUDIT ---');
  const observatoryAudit = await cdp.evaluate(`
    (async () => {
      const app = window.__missionApp;
      app.conductor.executeStepAction('SHOW_OBSERVATORY');
      await new Promise(r => setTimeout(r, 800));

      const fullText = document.body.innerText;
      const cases = Array.from(document.querySelectorAll('.obs-case-card, .case-card, [data-case]'))
        .map(c => c.innerText.trim().slice(0, 50));

      return {
        isOpen: app.observatoryHUD?.isOpen,
        hasObservatoryText: fullText.includes('OBSERVATORY') || fullText.includes('EVIDENCE LAB'),
        hasHowDoWeKnow: fullText.includes('HOW DO WE KNOW') || fullText.includes('EVIDENCE'),
        hasJWST: fullText.includes('JWST') || fullText.includes('James Webb'),
        hasChandra: fullText.includes('Chandra'),
        hasLIGO: fullText.includes('LIGO'),
        casesFound: cases
      };
    })()
  `);
  console.log('Observatory Audit:', JSON.stringify(observatoryAudit, null, 2));
  await cdp.captureScreenshot('judge-attack-03-observatory.png');

  console.log('\n--- SECTION 13: MISSION ARCHITECT FLOW AUDIT ---');
  const architectAudit = await cdp.evaluate(`
    (async () => {
      const app = window.__missionApp;
      app.conductor.executeStepAction('SHOW_MISSION_ARCHITECT');
      await new Promise(r => setTimeout(r, 800));

      const hud = app.missionArchitectHUD;
      const engine = hud?.engine;

      // Click assemble button if present
      const assembleBtn = document.querySelector('.ma-assemble-btn, #ma-assemble-btn, button[class*="assemble"]');
      let assembled = false;
      if (assembleBtn) {
        assembleBtn.click();
        assembled = true;
      } else if (hud?.assemble) {
        hud.assemble();
        assembled = true;
      }

      await new Promise(r => setTimeout(r, 500));
      const fullText = document.body.innerText;

      return {
        isOpen: hud?.isOpen,
        assembled,
        hasDeltaV: fullText.includes('Delta-V') || fullText.includes('ΔV') || fullText.includes('km/s'),
        hasPowerConstraint: fullText.includes('Power') || fullText.includes('Watts') || fullText.includes('Thermal'),
        hasTradeOffs: fullText.includes('Limitation') || fullText.includes('Advantage') || fullText.includes('Trade-off'),
        hasDossier: fullText.includes('DOSSIER') || fullText.includes('BRIEFING') || fullText.includes('MISSION CONCEPT')
      };
    })()
  `);
  console.log('Mission Architect Audit:', JSON.stringify(architectAudit, null, 2));
  await cdp.captureScreenshot('judge-attack-04-architect.png');

  console.log('\n--- SECTION 17 & 18: PRESENTATION MODE & FINALE AUDIT ---');
  const presentationAudit = await cdp.evaluate(`
    (async () => {
      const app = window.__missionApp;
      const pres = app.conductor.presentation;

      // Start presentation
      pres.startPresentation();
      await new Promise(r => setTimeout(r, 500));
      const step0 = pres.currentStepIndex;

      // Step to next
      pres.nextStep();
      await new Promise(r => setTimeout(r, 400));
      const step1 = pres.currentStepIndex;

      // Test Finale Jump button directly
      const finaleBtn = document.getElementById('pres-finale-btn');
      let finaleClicked = false;
      if (finaleBtn) {
        finaleBtn.click();
        finaleClicked = true;
      } else {
        pres.jumpToFinale();
        finaleClicked = true;
      }
      await new Promise(r => setTimeout(r, 800));

      const finaleText = document.body.innerText;
      return {
        isActive: pres.isActive,
        step0,
        step1,
        finaleClicked,
        finalStepIndex: pres.currentStepIndex,
        isFinale: pres.isFinale,
        hasPaleBlueDot: finaleText.includes('Pale Blue Dot') || finaleText.includes('Carl Sagan') || finaleText.includes('MOTE OF DUST') || finaleText.includes('HUMANITY'),
        hasReturnBtn: finaleText.includes('RETURN') || finaleText.includes('REPLAY') || finaleText.includes('SOURCES')
      };
    })()
  `);
  console.log('Presentation & Finale Audit:', JSON.stringify(presentationAudit, null, 2));
  await cdp.captureScreenshot('judge-attack-05-ending-ceremony.png');

  console.log('\n--- KEYBOARD ESC KEY AUDIT ---');
  const escAudit = await cdp.evaluate(`
    (async () => {
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true });
      window.dispatchEvent(escEvent);
      await new Promise(r => setTimeout(r, 500));

      const app = window.__missionApp;
      return {
        currentState: app?.conductor?.currentState,
        presActive: app?.conductor?.presentation?.isActive,
        isAnyModalOpen: !!document.querySelector('.modal--open, .hud-panel--open, .drawer--open')
      };
    })()
  `);
  console.log('ESC Key Handling Result:', escAudit);
  const buttonAudit = await cdp.evaluate(`
    (() => {
      const clickables = Array.from(document.querySelectorAll('button, [role="button"], a[href], input, select, .hud-btn, .nav-btn, .mc__action-btn, .pres-ctrl-btn, .sound-btn'));
      const visible = clickables.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none' && window.getComputedStyle(el).visibility !== 'hidden';
      });

      const buttonDetails = visible.map(el => ({
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        className: el.className || '',
        text: (el.innerText || el.textContent || '').trim().slice(0, 40),
        ariaLabel: el.getAttribute('aria-label') || ''
      }));

      return {
        totalFound: clickables.length,
        visibleCount: visible.length,
        sampleButtons: buttonDetails.slice(0, 25)
      };
    })()
  `);
  console.log(`Clickable Controls Audit: ${buttonAudit.visibleCount} visible of ${buttonAudit.totalFound} total`);
  console.log('Sample Controls:', JSON.stringify(buttonAudit.sampleButtons, null, 2));

  console.log('\n--- SECTION 04, 14, 15: SCIENTIFIC PROVENANCE & ATTRIBUTION AUDIT ---');
  const provenanceAudit = await cdp.evaluate(`
    (() => {
      const fullText = document.body.innerText;
      const terms = [
        { term: 'NASA', found: fullText.includes('NASA') },
        { term: 'NOAA', found: fullText.includes('NOAA') || fullText.includes('SWPC') },
        { term: 'JPL', found: fullText.includes('JPL') || fullText.includes('Horizons') },
        { term: 'JWST', found: fullText.includes('JWST') || fullText.includes('James Webb') },
        { term: 'Chandra', found: fullText.includes('Chandra') },
        { term: 'LIGO', found: fullText.includes('LIGO') },
        { term: 'CALCULATED', found: fullText.includes('CALCULATED') },
        { term: 'EDUCATIONAL', found: fullText.includes('EDUCATIONAL') },
        { term: 'SIMULATED', found: fullText.includes('SIMULATED') },
        { term: 'LIVE', found: fullText.includes('LIVE') },
        { term: 'CACHED', found: fullText.includes('CACHED') },
        { term: 'APPROXIMATE', found: fullText.includes('APPROXIMATE') }
      ];

      // Check citations and disclaimer links in DOM
      const citations = Array.from(document.querySelectorAll('.data-source, .evidence-source, [data-source], .citation, .disclaimer, .provenance'))
        .map(el => el.innerText.trim());

      return {
        provenanceTerms: terms,
        citationsCount: citations.length,
        citationsSample: citations.slice(0, 10)
      };
    })()
  `);
  console.log('Scientific Provenance Terms:', JSON.stringify(provenanceAudit.provenanceTerms, null, 2));

  console.log('\n--- RAPID TRANSITION STRESS TEST ---');
  // Stress test by navigating rapidly between sections
  const stressResults = await cdp.evaluate(`
    (async () => {
      const conductor = window.__app?.experienceConductor;
      if (!conductor) return { tested: false, reason: 'Conductor not globally exposed' };

      const views = ['SOLAR_SYSTEM', 'DATA_INTELLIGENCE', 'SCENARIO_ENGINE', 'DISCOVERY', 'OBSERVATORY', 'PHENOMENA', 'MISSION_ARCHITECT', 'MISSION_CONTROL'];
      const errors = [];
      const startTime = performance.now();

      for (let i = 0; i < views.length; i++) {
        try {
          conductor.navigateTo(views[i]);
          await new Promise(r => setTimeout(r, 200)); // rapid switch
        } catch (err) {
          errors.push({ view: views[i], error: err.message });
        }
      }

      return {
        tested: true,
        durationMs: Math.round(performance.now() - startTime),
        switchCount: views.length,
        errors
      };
    })()
  `);
  console.log('Rapid Stress Test Results:', JSON.stringify(stressResults, null, 2));

  await cdp.captureScreenshot('judge-attack-01-audit.png');

  console.log('\n====================================================');
  console.log('CONSOLE ERRORS & WARNINGS SUMMARY');
  console.log('====================================================');
  console.log(`Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    consoleErrors.forEach((e, idx) => console.log(`  [${idx + 1}] ${e}`));
  } else {
    console.log('  ✓ 0 Console Errors encountered during adversarial audit');
  }

  console.log(`\nTotal Console Logs captured: ${consoleLogs.length}`);

  console.log('\nCleaning up Chrome process...');
  chromeProc.kill();
  console.log('Audit completed.');
}

runAttack().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
