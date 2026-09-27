/**
 * capture-beacon-screenshot.mjs — Captures the ambient discovery beacon
 * in context on Mission Control.
 */

import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9340;
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
    await new Promise(resolve => ws.addEventListener('open', resolve));

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const handler = (event) => {
          const rawData = typeof event === 'string' ? event : (event.data || event);
          const msg = JSON.parse(rawData);
          if (msg.id === id) {
            ws.removeEventListener('message', handler);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Runtime.enable');
    await send('Page.enable');
    await sleep(1500);

    // Enter Mission Control & Switch to Mars
    await send('Runtime.evaluate', {
      expression: `
        document.getElementById('enter-btn')?.click();
      `
    });
    await sleep(2000);

    // Switch to Mars and trigger beacon
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const marsTab = document.querySelector('.mc__dest-tab[data-dest="MARS"]');
          if (marsTab) marsTab.click();
          import('./src/discoveries/DiscoveryEngine.js').then(m => {
            m.discoveryEngine.evaluateContext('MARS', true);
          });
        })()
      `
    });
    await sleep(1500);

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join(ARTIFACTS_DIR, 'discovery_engine_beacon.png');
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved ambient beacon screenshot:', shotPath);

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

capture().catch(err => {
  console.error('[BEACON SCREENSHOT FAILED]', err);
  process.exit(1);
});
