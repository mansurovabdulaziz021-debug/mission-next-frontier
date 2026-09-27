import http from 'http';
import { spawn } from 'child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9335;

const chromeProc = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  '--user-data-dir=D:\\chrome_phase4_profile',
  '--disable-gpu',
  'http://localhost:3000/'
]);

await new Promise(r => setTimeout(r, 2200));

function getJson(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}${path}`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

try {
  const tabs = await getJson('/json');
  const tab = tabs.find(t => t.type === 'page' && t.url.includes('3000')) || tabs[0];
  console.log('Testing Tab:', tab?.title, tab?.url);

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve));

  let reqId = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = reqId++;
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

  // Enable Runtime and Log
  await send('Runtime.enable');
  await send('Log.enable');

  let consoleErrors = [];
  ws.addEventListener('message', (event) => {
    const rawData = typeof event === 'string' ? event : (event.data || event);
    const msg = JSON.parse(rawData);
    if (msg.method === 'Runtime.consoleAPICalled') {
      if (msg.params.type === 'error') {
        const text = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
        console.error('Browser Console Error:', text);
        consoleErrors.push(text);
      }
    }
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      console.error('Browser Log Error:', msg.params.entry.text);
      consoleErrors.push(msg.params.entry.text);
    }
  });

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text + ' ' + JSON.stringify(res.exceptionDetails.exception));
    }
    return res.result.value;
  }

  console.log('--- STEP 1: Wait for boot loader & Enter Mission Control ---');
  await new Promise(r => setTimeout(r, 2000));
  await evaluate(`document.getElementById('enter-btn').click()`);
  await new Promise(r => setTimeout(r, 2200));

  console.log('--- STEP 2: Open Interactive Scenario Hub ---');
  await evaluate(`document.getElementById('mc-scenario-toggle').click()`);
  await new Promise(r => setTimeout(r, 600));

  const hubOpen = await evaluate(`document.getElementById('mc-scenario-hub').classList.contains('mc__scenario-hub--open')`);
  const initialTitle = await evaluate(`document.getElementById('mc-scenario-title').textContent`);
  console.log('Scenario Hub Open:', hubOpen);
  console.log('Initial Scenario Title:', initialTitle);

  console.log('--- STEP 3: Test Scenario 1 (Communication Delay) Parameter Updates ---');
  const initialDelay = await evaluate(`document.querySelector('.mc__res-hero-val')?.textContent`);
  console.log('Initial Mars Latency:', initialDelay);

  // Switch destination to MOON_MEAN
  await evaluate(`
    const sel = document.querySelector('.mc__ctrl-select[data-param="target"]');
    sel.value = 'MOON_MEAN';
    sel.dispatchEvent(new Event('change'));
  `);
  await new Promise(r => setTimeout(r, 300));
  const moonDelay = await evaluate(`document.querySelector('.mc__res-hero-val')?.textContent`);
  const moonRegime = await evaluate(`document.querySelector('.mc__teleop-badge')?.textContent`);
  console.log('Updated Moon Latency:', moonDelay);
  console.log('Updated Teleop Regime:', moonRegime);

  // Switch carrier to OPTICAL_LASER
  await evaluate(`
    const btn = document.querySelector('.mc__segment-btn[data-val="OPTICAL_LASER"]');
    btn.click();
  `);
  await new Promise(r => setTimeout(r, 300));
  const bandwidthText = await evaluate(`document.querySelectorAll('.mc__metric-v')[0]?.textContent`);
  console.log('Optical Bandwidth:', bandwidthText);

  console.log('--- STEP 4: Test Scenario 2 (Gravity & Biomechanics) ---');
  await evaluate(`document.querySelector('.mc__scenario-tab[data-scenario="GRAVITY_EXPERIENCE"]').click()`);
  await new Promise(r => setTimeout(r, 500));
  const gravTitle = await evaluate(`document.getElementById('mc-scenario-title').textContent`);
  const initialWeight = await evaluate(`document.querySelector('.mc__res-hero-val')?.textContent`);
  console.log('Scenario 2 Title:', gravTitle);
  console.log('Initial Mars Weight (80kg crew):', initialWeight);

  // Adjust mass slider to 120 kg
  await evaluate(`
    const slider = document.querySelector('.mc__ctrl-slider[data-param="massKg"]');
    slider.value = 120;
    slider.dispatchEvent(new Event('input'));
  `);
  await new Promise(r => setTimeout(r, 300));
  const updatedWeight = await evaluate(`document.querySelector('.mc__res-hero-val')?.textContent`);
  console.log('Updated Mars Weight (120kg payload):', updatedWeight);

  console.log('--- STEP 5: Test Scenario 3 (Orbital Trajectory) ---');
  await evaluate(`document.querySelector('.mc__scenario-tab[data-scenario="TRAVEL_TRAJECTORY"]').click()`);
  await new Promise(r => setTimeout(r, 500));
  const orbitTransit = await evaluate(`document.querySelector('.mc__res-hero-val')?.textContent`);
  const orbitDeltaV = await evaluate(`document.querySelector('.mc__res-sub-v')?.textContent`);
  console.log('Hohmann Transit Duration:', orbitTransit);
  console.log('Total Delta-V Requirement:', orbitDeltaV);

  console.log('--- STEP 6: Test Scenario 4 (Solar Environment) ---');
  await evaluate(`document.querySelector('.mc__scenario-tab[data-scenario="SOLAR_ENVIRONMENT"]').click()`);
  await new Promise(r => setTimeout(r, 500));
  const irradianceVal = await evaluate(`document.querySelector('.mc__res-hero-val')?.textContent`);
  const safetyBadge = await evaluate(`document.querySelector('.mc__teleop-badge')?.textContent`);
  console.log('Mars Solar Irradiance:', irradianceVal);
  console.log('Solar CME Safety Badge:', safetyBadge);

  console.log('--- STEP 7: Test Comparison Mode (Earth vs Moon vs Mars) ---');
  await evaluate(`document.getElementById('mc-scenario-compare-btn').click()`);
  await new Promise(r => setTimeout(r, 400));
  const compareCards = await evaluate(`document.querySelectorAll('.mc__compare-card').length`);
  console.log('Comparison Cards Rendered:', compareCards);

  // Exit comparison mode
  await evaluate(`document.getElementById('mc-scenario-compare-btn').click()`);
  await new Promise(r => setTimeout(r, 300));

  console.log('--- STEP 8: Close Scenario Hub & Regression Verify Phase 1-3 ---');
  await evaluate(`document.getElementById('mc-scenario-close').click()`);
  await new Promise(r => setTimeout(r, 400));
  const hubClosed = await evaluate(`!document.getElementById('mc-scenario-hub').classList.contains('mc__scenario-hub--open')`);
  console.log('Scenario Hub Closed:', hubClosed);

  // Verify Phase 3 Science Panel toggle still works smoothly
  await evaluate(`document.getElementById('mc-science-toggle').click()`);
  await new Promise(r => setTimeout(r, 400));
  const scienceOpen = await evaluate(`document.getElementById('mc-science-panel').classList.contains('mc__science-panel--open')`);
  console.log('Phase 3 Science Panel Accessible:', scienceOpen);
  await evaluate(`document.getElementById('mc-science-toggle').click()`);
  await new Promise(r => setTimeout(r, 300));

  // Verify Return to Landing Apex
  await evaluate(`document.getElementById('mc-back-btn').click()`);
  await new Promise(r => setTimeout(r, 2000));
  const atLanding = await evaluate(`document.getElementById('landing').classList.contains('landing--visible')`);
  console.log('Returned to Landing Apex:', atLanding);

  console.log('--- CONSOLE ERROR AUDIT ---');
  console.log('Total Console Errors:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.error('Console errors:', consoleErrors);
  }

  const allPassed =
    hubOpen &&
    moonDelay.includes('sec') &&
    gravTitle.includes('Gravity') &&
    updatedWeight.includes('kgf') &&
    orbitTransit.includes('259 days') &&
    irradianceVal.includes('W/m²') &&
    compareCards === 3 &&
    hubClosed &&
    scienceOpen &&
    atLanding &&
    consoleErrors.length === 0;

  console.log('ALL PHASE 4 VERIFICATION CRITERIA PASSED:', allPassed);
  process.exit(allPassed ? 0 : 1);
} catch (e) {
  console.error('Phase 4 verification failed with exception:', e);
  process.exit(1);
} finally {
  chromeProc.kill();
}
