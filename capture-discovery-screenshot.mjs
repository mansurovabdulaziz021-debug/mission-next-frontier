/**
 * capture-discovery-screenshot.mjs — Captures visual verification screenshots
 * for Phase 5 Cosmic Discovery Engine via Chrome DevTools Protocol (CDP).
 */

import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9339;
const TARGET_URL = 'http://localhost:3000/';
const ARTIFACTS_DIR = 'C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\6abbdeb8-cf65-4e69-80bf-a65b47ae114b';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getJson(p) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${CDP_PORT}${p}`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function capture() {
  console.log('>>> [SCREENSHOT] Launching Chrome on port', CDP_PORT);

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1920,1080',
    TARGET_URL
  ], { stdio: 'ignore' });

  try {
    await sleep(2500);

    const tabs = await getJson('/json');
    const tab = tabs.find(t => t.type === 'page' && t.url.includes('3000')) || tabs[0];

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve);
      ws.addEventListener('error', reject);
    });

    let msgId = 1;
    const pending = new Map();

    ws.addEventListener('message', (event) => {
      const rawData = typeof event === 'string' ? event : (event.data || event);
      const data = JSON.parse(rawData);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    });

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Runtime.enable');
    await send('Page.enable');
    await sleep(2000);

    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.exceptionDetails) {
        throw new Error(`Eval failed: ${JSON.stringify(res.exceptionDetails)}`);
      }
      return res.result ? res.result.value : undefined;
    }

    // 1. Enter Mission Control
    console.log('>>> Entering Mission Control...');
    await evaluate(`document.getElementById('enter-btn')?.click()`);
    await sleep(2000);

    // 2. Trigger Unexpected Discovery
    console.log('>>> Triggering Unexpected Discovery (Mars)...');
    await evaluate(`
      import('./src/discoveries/DiscoveryEngine.js').then(m => {
        m.discoveryEngine.triggerUnexpectedDiscovery('mars_blue_sunset');
        m.discoveryEngine.toggleHumanityMode(true);
      });
    `);
    await sleep(1500);

    // Expand "The Weird Part"
    await evaluate(`
      const box = document.getElementById('mc-disc-weird-box');
      if (box && !box.classList.contains('mc__weird-box--expanded')) {
        document.getElementById('mc-disc-weird-toggle')?.click();
      }
    `);
    await sleep(600);

    // Capture Discovery Focus Overlay
    console.log('>>> Capturing Discovery Focus Overlay screenshot...');
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    const shot1Path = path.join(ARTIFACTS_DIR, 'discovery_engine_focus.png');
    fs.writeFileSync(shot1Path, Buffer.from(shot1.data, 'base64'));
    console.log('Saved screenshot 1:', shot1Path);

    // 3. Close Overlay & Open Discovery Catalog Drawer
    console.log('>>> Opening Discovery Knowledge Catalog Drawer...');
    await evaluate(`
      import('./src/discoveries/DiscoveryEngine.js').then(m => {
        m.discoveryEngine.closeActiveDiscovery();
      });
    `);
    await sleep(600);

    await evaluate(`document.getElementById('mc-discovery-toggle')?.click()`);
    await sleep(1000);

    // Capture Catalog Drawer
    console.log('>>> Capturing Discovery Catalog Drawer screenshot...');
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    const shot2Path = path.join(ARTIFACTS_DIR, 'discovery_engine_catalog.png');
    fs.writeFileSync(shot2Path, Buffer.from(shot2.data, 'base64'));
    console.log('Saved screenshot 2:', shot2Path);

    ws.close();
    console.log('>>> [SCREENSHOT] Visual verification captures successfully completed!');
  } finally {
    chromeProc.kill();
  }
}

capture().catch(err => {
  console.error('[SCREENSHOT FAILED]', err);
  process.exit(1);
});
