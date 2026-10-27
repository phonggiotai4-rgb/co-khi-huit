// Chạy bài nghiệm thu giao diện trắc nghiệm trên Chrome headless (CDP).
// Dung: node tests/run.js
const { spawn } = require('child_process');
const path = require('path');

require('./acceptance.page.js');   // sinh trang thu nghiem trong thu muc TEMP

/* --- Chan CSS hong: can bang ngoac + phai co cac selector cot loi --- */
(function assertCssSane() {
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const css = (html.match(/<style>([\s\S]*?)<\/style>/) || ['', ''])[1];
  const problems = [];

  const body = html.replace(/<style>[\s\S]*?<\/style>/, '');

  let depth = 0;
  for (const ch of css) {
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth < 0) problems.push('thua dau } trong CSS'); }
  }
  if (depth !== 0) problems.push('CSS thieu ' + depth + ' dau }');

  // Chi lay class that su (HTML + className/classList trong JS), khong lay id hay chuoi ngau nhien
  const used = new Set();
  const addTokens = (str) => String(str).split(/\s+/).forEach(c => { if (c && /^[a-z][\w-]*$/.test(c)) used.add(c); });
  for (const m of body.matchAll(/class="([^"]+)"/g)) addTokens(m[1]);
  for (const m of body.matchAll(/className\s*=\s*'([^']+)'/g)) addTokens(m[1]);
  for (const m of body.matchAll(/classList\.(?:add|toggle|remove)\('([^']+)'/g)) used.add(m[1]);
  for (const m of body.matchAll(/'((?:is-)[a-z-]+)'/g)) used.add(m[1]);   // class trang thai gan trong JS
  const missing = [...used].filter(c => !new RegExp('\\.' + c.replace(/[-]/g, '\\-') + '(?![\\w-])').test(css));
  if (missing.length) problems.push('class chua co CSS: ' + missing.join(', '));

  if (problems.length) {
    console.log('LOI CSS:\n - ' + problems.join('\n - '));
    process.exit(2);
  }
})();

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PAGE_URL = 'file:///' + require('./acceptance.page.js').OUT_FILE.replace(/\\/g, '/').replace(/^\//, '');
const PORT = 9333;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function connect() {
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--mute-audio',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + require('os').tmpdir() + '\\opencode\\cdp-profile',
    '--window-size=1600,900',
    PAGE_URL
  ], { stdio: 'ignore' });

  let target = null;
  for (let i = 0; i < 40 && !target; i++) {
    await sleep(300);
    try {
      const res = await fetch('http://127.0.0.1:' + PORT + '/json/list');
      const list = await res.json();
      target = list.find(t => t.type === 'page' && t.url.includes('__acceptance')) || null;
    } catch (_) {}
  }
  if (!target) { chrome.kill(); throw new Error('Khong ket noi duoc Chrome'); }

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

  await new Promise(res => ws.addEventListener('open', res));
  await send('Runtime.enable');
  await sleep(600);

  return { chrome, ws, send, errors };
}

(async () => {
  let conn;
  try {
    conn = await connect();
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
  const { chrome, ws, send, errors } = conn;

  const res = await send('Runtime.evaluate', {
    expression: 'window.__runTests()',
    awaitPromise: true,
    returnByValue: true,
    timeout: 60000
  });

  if (res.result?.exceptionDetails) {
    console.log('LOI EVAL:', JSON.stringify(res.result.exceptionDetails).slice(0, 800));
    process.exitCode = 1;
  } else {
    console.log(res.result.result.value);
    if (/FAILED: [1-9]/.test(res.result.result.value)) process.exitCode = 1;
  }
  console.log('\n--- Console errors:', errors.length ? '\n' + errors.join('\n') : 'khong co');
  if (errors.length) process.exitCode = 1;

  ws.close();
  chrome.kill();
  process.exit(process.exitCode || 0);
})();