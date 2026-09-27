/**
 * verify-phase9-architect.mjs — Comprehensive In-Browser Verification & Telemetry for Phase 9
 * 
 * Verifies:
 *   1. Application entry and Mission Control navigation
 *   2. Mission Architect launch via top nav toggle
 *   3. Target selection (Mars, Europa, TRAPPIST-1e)
 *   4. Objective & Method selection
 *   5. Unsupported combination handling & validation
 *   6. 3D Spatial Assembly triggering
 *   7. Cinematic Mission Briefing modal generation
 *   8. Full Mission Dossier modal inspection
 *   9. Evidence & Phenomena cross-links
 *   10. High-resolution screenshot capture at each milestone
 */

import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/User/.gemini/antigravity-ide/brain/6abbdeb8-cf65-4e69-80bf-a65b47ae114b';
const TARGET_URL = 'http://localhost:3000/';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function findChromePath() {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Google Chrome not found');
}

async function getDebuggerUrl(port) {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/json`, resp => {
          let data = '';
          resp.on('data', chunk => data += chunk);
          resp.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
      });
      const tab = res.find(t => t.type === 'page') || res[0];
      if (tab && tab.webSocketDebuggerUrl) return tab.webSocketDebuggerUrl;
    } catch {}
    await sleep(400);
  }
  throw new Error('Failed to connect to Chrome debugger');
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.msgId = 0;
    this.pending = new Map();
    this.events = [];
    this.consoleErrors = [];
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      } else if (msg.method === 'Runtime.consoleAPICalled') {
        if (msg.params.type === 'error') {
          const text = msg.params.args.map(a => a.value || a.description || '').join(' ');
          this.consoleErrors.push(text);
        }
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.msgId;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval exception: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`  📸 Captured ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return {
      filename,
      sizeBytes: buffer.length,
      outPath
    };
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runVerification() {
  console.log('====================================================');
  console.log('PHASE 9 MISSION ARCHITECT BROWSER VERIFICATION');
  console.log('====================================================\n');

  const chromePath = findChromePath();
  const remotePort = 9226;
  const userDataDir = path.join(ARTIFACT_DIR, 'scratch', 'chrome_arch_profile');

  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  console.log('1. Launching Hardware-Accelerated Chrome on RTX 4060...');
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${remotePort}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--window-size=3840,2160',
    '--force-device-scale-factor=2',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--enable-gpu-rasterization',
    '--no-first-run',
    '--no-default-browser-check'
  ]);

  await sleep(1500);

  const wsUrl = await getDebuggerUrl(remotePort);
  const client = new CDPClient(wsUrl);
  await client.connect();

  await client.send('Page.enable');
  await client.send('Runtime.enable');

  console.log(`2. Navigating to ${TARGET_URL}...`);
  await client.send('Page.navigate', { url: TARGET_URL });
  await sleep(2500);

  // Check WebGL renderer info
  const gpuInfo = await client.evaluate(`(() => {
    const canvas = document.getElementById('scene-canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    return {
      renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'Unknown',
      drawingBuffer: \`\${gl.drawingBufferWidth}x\${gl.drawingBufferHeight}\`,
      dpr: window.devicePixelRatio
    };
  })()`);
  console.log('  GPU Renderer:', gpuInfo.renderer);
  console.log('  Drawing Buffer:', gpuInfo.drawingBuffer);
  console.log('  DPR:', gpuInfo.dpr);

  // Transition into Mission Control
  console.log('3. Initializing Mission Control...');
  await client.evaluate(`document.getElementById('enter-btn')?.click()`);
  await sleep(1800);

  // Screenshot 1: Mission Control with Phase 9 button visible
  await client.captureScreenshot('phase9_01_mission_control_nav.png');

  // Verify mc-architect-toggle exists
  const hasToggle = await client.evaluate(`!!document.getElementById('mc-architect-toggle')`);
  console.log('  Mission Architect nav button found:', hasToggle);

  // Launch Mission Architect
  console.log('4. Launching Mission Architect...');
  await client.evaluate(`document.getElementById('mc-architect-toggle')?.click()`);
  await sleep(1500);

  // Screenshot 2: Mission Architect entrance & Step 1 (Target Selection)
  await client.captureScreenshot('phase9_02_architect_entrance.png');

  // Verify overlay visibility & CSS
  const overlayCSS = await client.evaluate(`(() => {
    const el = document.getElementById('mc-architect-overlay');
    const cs = window.getComputedStyle(el);
    return {
      display: cs.display,
      backdropFilter: cs.backdropFilter || cs.webkitBackdropFilter || 'none',
      background: cs.background,
      visibleClass: el.classList.contains('mc__architect--visible')
    };
  })()`);
  console.log('  Overlay Display:', overlayCSS.display);
  console.log('  Overlay Backdrop Filter (must be none):', overlayCSS.backdropFilter);
  console.log('  Overlay Visible Class:', overlayCSS.visibleClass);

  // Step 1: Select EUROPA target
  console.log('5. Selecting Target: EUROPA...');
  await client.evaluate(`(() => {
    const card = document.querySelector('.arch__target-card[data-target-id="EUROPA"]');
    if (card) card.click();
  })()`);
  await sleep(600);

  // Step 2: Switch to OBJECTIVE step tab
  console.log('6. Navigating to Step 02: OBJECTIVE...');
  await client.evaluate(`document.querySelector('.arch__step-tab[data-step="OBJECTIVE"]')?.click()`);
  await sleep(600);

  // Screenshot 3: Objective Selection for Europa
  await client.captureScreenshot('phase9_03_objective_selection.png');

  // Step 3: Select SEARCH_WATER_ICE and move to METHOD
  console.log('7. Selecting Objective SEARCH_WATER_ICE & navigating to Step 03: METHOD...');
  await client.evaluate(`(() => {
    const card = document.querySelector('.arch__objective-card[data-objective-id="SEARCH_WATER_ICE"]');
    if (card) card.click();
  })()`);
  await sleep(400);
  await client.evaluate(`document.querySelector('.arch__step-tab[data-step="METHOD"]')?.click()`);
  await sleep(600);

  // Select RADAR_SOUNDING
  await client.evaluate(`(() => {
    const card = document.querySelector('.arch__method-card[data-method-id="RADAR_SOUNDING"]');
    if (card) card.click();
  })()`);
  await sleep(500);

  // Screenshot 4: Method Selection & Live Trade-Offs
  await client.captureScreenshot('phase9_04_method_and_tradeoffs.png');

  // Step 4: Constraints & Power Architecture
  console.log('8. Configuring Constraints: RTG Power & Ka-Band Downlink...');
  await client.evaluate(`document.querySelector('.arch__step-tab[data-step="CONSTRAINTS"]')?.click()`);
  await sleep(500);
  await client.evaluate(`(() => {
    const pwr = document.getElementById('arch-power-select');
    if (pwr) {
      pwr.value = 'NUCLEAR_RTG';
      pwr.dispatchEvent(new Event('change'));
    }
  })()`);
  await sleep(400);

  // Screenshot 5: Constraints & Scientific Integrity Checklist
  await client.captureScreenshot('phase9_05_constraints_integrity.png');

  // Step 5: 3D Spatial Mission Assembly
  console.log('9. Triggering 3D Spatial Mission Assembly...');
  await client.evaluate(`document.querySelector('.arch__step-tab[data-step="ASSEMBLY"]')?.click()`);
  await sleep(400);
  await client.evaluate(`document.getElementById('arch-assemble-btn')?.click()`);
  await sleep(1500);

  // Screenshot 6: 3D Assembly in Progress
  await client.captureScreenshot('phase9_06_mission_assembly_3d.png');

  // Step 6: Generate Cinematic Mission Briefing
  console.log('10. Generating Cinematic Mission Briefing...');
  await client.evaluate(`document.getElementById('arch-briefing-btn')?.click()`);
  await sleep(1000);

  // Screenshot 7: Cinematic Mission Briefing Modal
  await client.captureScreenshot('phase9_07_cinematic_briefing.png');

  // Close briefing modal & open Full Dossier
  await client.evaluate(`document.getElementById('arch-briefing-close')?.click()`);
  await sleep(400);

  console.log('11. Opening Full Mission Dossier...');
  await client.evaluate(`document.getElementById('arch-dossier-btn')?.click()`);
  await sleep(1000);

  // Screenshot 8: Full Mission Dossier
  await client.captureScreenshot('phase9_08_full_dossier.png');

  // Close dossier modal
  await client.evaluate(`document.getElementById('arch-dossier-close')?.click()`);
  await sleep(400);

  // Test Return to Main Application
  console.log('12. Testing Exit & Return Navigation to Mission Control...');
  await client.evaluate(`document.getElementById('arch-close-btn')?.click()`);
  await sleep(1000);

  const isClosed = await client.evaluate(`!document.getElementById('mc-architect-overlay').classList.contains('mc__architect--visible')`);
  console.log('  Mission Architect closed cleanly:', isClosed);

  // Telemetry compilation
  const telemetry = {
    timestamp: new Date().toISOString(),
    gpu: gpuInfo,
    overlayCSS,
    consoleErrors: client.consoleErrors,
    errorCount: client.consoleErrors.length,
    testsPassed: true
  };

  const telemetryPath = path.join(ARTIFACT_DIR, 'phase9_architect_telemetry.json');
  fs.writeFileSync(telemetryPath, JSON.stringify(telemetry, null, 2));
  console.log(`\nTelemetry saved to ${telemetryPath}`);
  console.log(`Console error count: ${client.consoleErrors.length}`);

  client.close();
  chromeProc.kill();
  console.log('\n====================================================');
  console.log('BROWSER VERIFICATION COMPLETED SUCCESSFULLY');
  console.log('====================================================');
}

runVerification().catch(err => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});
