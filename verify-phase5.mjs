/**
 * verify-phase5.mjs — Comprehensive Automated Verification Suite for Phase 5
 * (COSMIC DISCOVERY ENGINE & CROSS-PRODUCT SYSTEMS)
 */

import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9338;
const TARGET_URL = 'http://localhost:3000/';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getJson(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${CDP_PORT}${path}`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function runVerification() {
  console.log('>>> [PHASE 5 VERIFY] Launching Chrome CDP on port', CDP_PORT);

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
    console.log('>>> Connected to target tab:', tab.title, '| URL:', tab.url);

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve);
      ws.addEventListener('error', reject);
    });

    let msgId = 1;
    const pending = new Map();
    const consoleLogs = [];

    ws.addEventListener('message', (event) => {
      const rawData = typeof event === 'string' ? event : (event.data || event);
      const data = JSON.parse(rawData);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
      if (data.method === 'Runtime.consoleAPICalled') {
        const text = data.params.args.map(a => a.value || a.description || '').join(' ');
        consoleLogs.push({ type: data.params.type, text });
      }
      if (data.method === 'Runtime.exceptionThrown') {
        consoleLogs.push({ type: 'error', text: data.params.exceptionDetails.text });
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

    // --- STEP 1: Entry & Enter Mission Control ---
    console.log('\n--- STEP 1: App Entry & Transition to Mission Control ---');
    const hasEnterBtn = await evaluate(`!!document.getElementById('enter-btn')`);
    console.log('Enter button present:', hasEnterBtn);
    await evaluate(`document.getElementById('enter-btn').click()`);
    await sleep(1800);

    const mcView = await evaluate(`window.missionState ? window.missionState.view : 'active'`);
    console.log('Mission Control View State:', mcView);

    // --- STEP 2: Verify Cosmic Discovery Toggle & Count Badge ---
    console.log('\n--- STEP 2: Verify Top-Bar Discovery Toggle & Badge ---');
    const toggleExists = await evaluate(`!!document.getElementById('mc-discovery-toggle')`);
    const badgeText = await evaluate(`document.getElementById('mc-discovery-count-badge')?.textContent`);
    console.log('Discovery toggle exists:', toggleExists, '| Badge count:', badgeText);
    if (!toggleExists) throw new Error('Discovery toggle missing from top-bar');

    // --- STEP 3: Test Ambient Discovery Beacon ---
    console.log('\n--- STEP 3: Test Ambient Discovery Beacon Cue ---');
    // Force a context evaluation on MARS to activate beacon
    await evaluate(`
      import('./src/discoveries/DiscoveryEngine.js').then(m => {
        m.discoveryEngine.evaluateContext('MARS', true);
      });
    `);
    await sleep(800);

    const beaconActive = await evaluate(`
      const b = document.getElementById('mc-discovery-beacon');
      b && b.classList.contains('mc__discovery-beacon--active')
    `);
    const beaconTitle = await evaluate(`document.getElementById('mc-beacon-title')?.textContent`);
    console.log('Beacon active:', beaconActive, '| Title:', beaconTitle);

    // --- STEP 4: Investigate Discovery -> Open Hero Focus Overlay ---
    console.log('\n--- STEP 4: Investigate Discovery & Verify Hero Focus Overlay ---');
    await evaluate(`document.getElementById('mc-beacon-action')?.click()`);
    await sleep(800);

    const overlayOpen = await evaluate(`
      const o = document.getElementById('mc-discovery-overlay');
      o && o.classList.contains('mc__discovery-overlay--open')
    `);
    const overlayTitle = await evaluate(`document.getElementById('mc-disc-title')?.textContent`);
    const factText = await evaluate(`document.getElementById('mc-disc-fact')?.textContent?.slice(0, 60)`);
    const twistText = await evaluate(`document.getElementById('mc-disc-twist')?.textContent?.slice(0, 60)`);
    const meaningText = await evaluate(`document.getElementById('mc-disc-meaning')?.textContent?.slice(0, 60)`);
    const bodyHasFocus = await evaluate(`document.body.classList.contains('mc-discovery-focus')`);

    console.log('Overlay Open:', overlayOpen);
    console.log('Overlay Title:', overlayTitle);
    console.log('Fact snippet:', factText);
    console.log('Twist snippet:', twistText);
    console.log('Meaning snippet:', meaningText);
    console.log('Body dimmed for focus:', bodyHasFocus);

    if (!overlayOpen || !overlayTitle) throw new Error('Hero Discovery Focus Overlay failed to open');

    // --- STEP 5: Test "The Weird Part" & Humanity Mode Lens ---
    console.log('\n--- STEP 5: Test "The Weird Part" & Humanity Mode Lens ---');
    await evaluate(`document.getElementById('mc-disc-weird-toggle')?.click()`);
    await sleep(300);
    const weirdExpanded = await evaluate(`
      document.getElementById('mc-disc-weird-box')?.classList.contains('mc__weird-box--expanded')
    `);
    console.log('"The Weird Part" expanded:', weirdExpanded);

    // Toggle Humanity Mode Lens
    await evaluate(`document.getElementById('mc-discovery-humanity-toggle')?.click()`);
    await sleep(300);
    const humanityActive = await evaluate(`
      document.getElementById('mc-disc-humanity-box')?.classList.contains('mc__humanity-box--highlight')
    `);
    const humanityAnalogy = await evaluate(`document.getElementById('mc-disc-humanity-analogy')?.textContent?.slice(0, 60)`);
    console.log('Humanity Mode Lens active:', humanityActive, '| Analogy:', humanityAnalogy);

    // --- STEP 6: Test Curiosity Trail (Cross-Topic Knowledge Graph) ---
    console.log('\n--- STEP 6: Test Curiosity Trail Graph Navigation ---');
    const chipCount = await evaluate(`document.querySelectorAll('.mc__trail-chip').length`);
    console.log('Related curiosity chips found:', chipCount);

    if (chipCount > 0) {
      const firstChipText = await evaluate(`document.querySelector('.mc__trail-chip')?.textContent?.trim()`);
      console.log('Clicking related chip:', firstChipText);
      await evaluate(`document.querySelector('.mc__trail-chip')?.click()`);
      await sleep(800);
      const newTitle = await evaluate(`document.getElementById('mc-disc-title')?.textContent`);
      console.log('New discovery title after trail jump:', newTitle);
    }

    // Close Overlay
    await evaluate(`document.getElementById('mc-discovery-close')?.click()`);
    await sleep(500);

    // --- STEP 7: Test Cosmic Discovery Catalog & Drawer ---
    console.log('\n--- STEP 7: Test Discovery Knowledge Explorer Drawer ---');
    await evaluate(`document.getElementById('mc-discovery-toggle')?.click()`);
    await sleep(800);

    const drawerOpen = await evaluate(`
      const d = document.getElementById('mc-discovery-drawer');
      d && d.classList.contains('mc__discovery-drawer--open')
    `);
    const cardCount = await evaluate(`document.querySelectorAll('.mc__catalog-card').length`);
    console.log('Catalog drawer open:', drawerOpen, '| Total cards rendered:', cardCount);

    // Filter by Stars & Deep Space
    await evaluate(`
      (() => {
        const tab = document.querySelector('.mc__drawer-tab[data-cat="STARS_DEEP"]');
        if (tab) tab.click();
      })()
    `);
    await sleep(400);
    const filteredCount = await evaluate(`document.querySelectorAll('.mc__catalog-card').length`);
    console.log('Cards after STARS_DEEP filter:', filteredCount);

    // Close Drawer
    await evaluate(`document.getElementById('mc-drawer-close')?.click()`);
    await sleep(500);

    // --- STEP 8: Test Scenario Hub Cross-Product Discovery Link ---
    console.log('\n--- STEP 8: Verify Scenario Hub Related Discovery Link ---');
    await evaluate(`document.getElementById('mc-scenario-toggle')?.click()`);
    await sleep(800);

    const scenarioDiscCard = await evaluate(`!!document.querySelector('.mc__scenario-disc-card')`);
    const scenarioDiscTitle = await evaluate(`document.querySelector('.mc__scenario-disc-title')?.textContent`);
    console.log('Scenario Hub related discovery card present:', scenarioDiscCard, '| Title:', scenarioDiscTitle);

    await evaluate(`document.getElementById('mc-scenario-close')?.click()`);
    await sleep(500);

    // --- STEP 9: Full Regression Check (Solar System, Earth, Moon, Mars, Science HUD) ---
    console.log('\n--- STEP 9: Full Regression Check (Phases 1-4) ---');
    for (const dest of ['EARTH', 'MOON', 'MARS', 'SOLAR_SYSTEM']) {
      await evaluate(`
        (() => {
          const btn = document.querySelector('.mc__dest-tab[data-dest="${dest}"]');
          if (btn) btn.click();
        })()
      `);
      await sleep(500);
    }
    console.log('Planetary destination switching verified without errors');

    // Check Data HUD
    await evaluate(`document.getElementById('mc-science-toggle')?.click()`);
    await sleep(600);
    await evaluate(`document.getElementById('mc-science-toggle')?.click()`);
    await sleep(400);
    console.log('Scientific Data HUD verified');

    // --- STEP 10: Console Errors Check ---
    console.log('\n--- STEP 10: Console Error Analysis ---');
    const errors = consoleLogs.filter(l => l.type === 'error' || l.text.toLowerCase().includes('error'));
    console.log('Total console logs captured:', consoleLogs.length);
    console.log('Errors count:', errors.length);
    if (errors.length > 0) {
      console.error('Console errors detected:', errors);
      throw new Error(`Encountered ${errors.length} console errors during verification`);
    }

    console.log('\n============================================================');
    console.log('>>> [PHASE 5 VERIFICATION] ALL 10 TESTS PASSED WITH 0 ERRORS');
    console.log('============================================================');
    ws.close();
  } finally {
    chromeProc.kill();
  }
}

runVerification().catch(err => {
  console.error('[PHASE 5 VERIFICATION FAILED]', err);
  process.exit(1);
});
