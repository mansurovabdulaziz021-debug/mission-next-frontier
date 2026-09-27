import http from 'http';
import fs from 'fs';
import { spawn } from 'child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9336;

const chromeProc = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  '--user-data-dir=D:\\chrome_capture_profile',
  '--window-size=1920,1080',
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

  await send('Page.enable');
  await send('Runtime.enable');

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text);
    }
    return res.result.value;
  }

  // 1. Wait for boot loader and click enter
  await new Promise(r => setTimeout(r, 2000));
  await evaluate(`document.getElementById('enter-btn').click()`);
  await new Promise(r => setTimeout(r, 2200));

  // 2. Open Scenario Hub
  await evaluate(`document.getElementById('mc-scenario-toggle').click()`);
  await new Promise(r => setTimeout(r, 800));

  // 3. Capture screenshot of Phase 4 Scenario Hub
  const screenshotRes = await send('Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(screenshotRes.data, 'base64');
  
  const artifactDir = 'C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\6abbdeb8-cf65-4e69-80bf-a65b47ae114b';
  const outPath = `${artifactDir}\\scenario_engine_phase4.png`;
  fs.writeFileSync(outPath, buffer);
  console.log('Saved screenshot to:', outPath);

  process.exit(0);
} catch (e) {
  console.error('Screenshot capture failed:', e);
  process.exit(1);
} finally {
  chromeProc.kill();
}
