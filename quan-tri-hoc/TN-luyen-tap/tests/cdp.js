// Helper kết nối Chrome headless qua CDP (không cần thư viện ngoài).
const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const fileUrl = (absPath) => 'file:///' + absPath.replace(/\\/g, '/').replace(/^\//, '');

async function launch({ url, port = 9333, size = '1600,900', profile = 'cdp-profile' } = {}) {
  const CHROME = CHROME_PATHS.find(p => require('fs').existsSync(p));
  if (!CHROME) throw new Error('Khong tim thay Chrome/Edge');

  const proc = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--mute-audio', '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + path.join(os.tmpdir(), 'opencode', profile),
    '--window-size=' + size,
    url
  ], { stdio: 'ignore' });

  let target = null;
  for (let i = 0; i < 50 && !target; i++) {
    await sleep(300);
    try {
      const list = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
      target = list.find(t => t.type === 'page' && !t.url.startsWith('devtools://')) || null;
    } catch (_) {}
  }
  if (!target) { proc.kill(); throw new Error('Khong ket noi duoc Chrome'); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  const errors = [];
  let id = 0;
  const pending = new Map();

  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      errors.push(msg.params.args.map(a => a.value || a.description).join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      errors.push('EXCEPTION: ' + (msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text));
    }
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  });

  const send = (method, params = {}) => new Promise(res => {
    const mid = ++id;
    pending.set(mid, res);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });

  const evaluate = async (expression, awaitPromise = false) => {
    const res = await send('Runtime.evaluate', {
      expression, awaitPromise, returnByValue: true, timeout: 120000
    });
    if (res.result?.exceptionDetails) {
      throw new Error('LOI EVAL: ' + JSON.stringify(res.result.exceptionDetails).slice(0, 400));
    }
    return res.result?.result?.value;
  };

  await new Promise(res => ws.addEventListener('open', res));
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Performance.enable');

  // cho trang chay xong het phia client truoc khi do (font he thong / mang co the treo)
  for (let i = 0; i < 60; i++) {
    await sleep(200);
    const ready = await evaluate('document.readyState === "complete" && !!window.quiz').catch(() => false);
    if (ready === true) break;
  }
  await sleep(300);

  const screenshot = async (file) => {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    require('fs').writeFileSync(file, Buffer.from(shot.result.data, 'base64'));
    return file;
  };

  const close = () => { try { ws.close(); } catch (_) {} proc.kill(); };

  return { proc, ws, send, evaluate, screenshot, errors, close };
}

module.exports = { launch, sleep, fileUrl, CHROME_PATHS };