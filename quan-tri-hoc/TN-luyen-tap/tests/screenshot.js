// Chụp ảnh giao diện các trạng thái: node tests/screenshot.js
// Bien tuy chon: QUIZ_SIZE=430,860  QUIZ_OUT=ten-thu-muc  QUIZ_STATES=initial,wrong
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PAGE_URL = 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/').replace(/^\//, '');
const OUT = path.join(process.env.TEMP || os.tmpdir(), 'opencode', process.env.QUIZ_OUT || 'quiz-shots');
const SIZE = process.env.QUIZ_SIZE || '1600,900';
const STATES = (process.env.QUIZ_STATES || 'initial,wrong,right,map,confirm,result,review,marks').split(',').map(s => s.trim()).filter(Boolean);
const PORT = 9334;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const DRIVE = `
(async () => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const options = () => $$('.option');
  const action = () => $('#btnAction');
  const keyEsc = () => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

  const demoSet = () => window.quiz.start([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => ({
    id: 700 + n,
    text: 'Cau hoi mau so ' + n + ' — noi dung se thay bang du lieu that?',
    options: ['Phuong an A', 'Phuong an B', 'Phuong an C', 'Phuong an D'],
    correct: n % 4
  })));

  const rightFirst = async (i) => {
    options()[window.quiz.session[i].correct].click(); await wait(20);
    action().click(); await wait(60);
    action().click(); await wait(60);
  };
  const wrongThenRight = async (i) => {
    const c = window.quiz.session[i].correct;
    options()[(c + 1) % 4].click(); await wait(20);
    action().click(); await wait(60);
    options()[c].click(); await wait(20);
    action().click(); await wait(60);
    action().click(); await wait(60);
  };
  const wrongThenSkip = async (i) => {
    const c = window.quiz.session[i].correct;
    options()[(c + 1) % 4].click(); await wait(20);
    action().click(); await wait(60);
    keyEsc(); await wait(140);
  };

  // "Bắt đầu lại" luôn hỏi xác nhận -> bấm nút rồi bấm Xác nhận
  const restartQuiz = async () => {
    $('#btnRestart').click(); await wait(80);
    if (!$('#confirmBackdrop').hidden) { $('#btnConfirmOk').click(); await wait(200); }
  };

  window.__states = {
    async initial() { await restartQuiz(); },
    async wrong() {
      await this.initial();
      options()[0].click(); await wait(20); action().click(); await wait(200);
    },
    async right() {
      await this.initial();
      options()[window.quiz.questions[0].correct].click(); await wait(20);
      action().click(); await wait(200);
    },
    async map() {
      await this.initial();
      options()[window.quiz.questions[0].correct].click(); await wait(20);
      action().click(); await wait(100); action().click(); await wait(150);
      $('#btnCounter').click(); await wait(250);
    },
    async confirm() { await this.initial(); $('#btnBack').click(); await wait(250); },
    async marks() {
      await this.initial();
      await rightFirst(0);
      await wrongThenRight(1);
      await rightFirst(2);
      await wrongThenSkip(3);
      await rightFirst(4);
      await wait(250);
    },
    async result() {
      await restartQuiz();
      demoSet(); await wait(250);
      for (let i = 0; i < 10; i++) {
        if (i === 8) await wrongThenSkip(i);
        else if (i === 2 || i === 5) await wrongThenRight(i);
        else await rightFirst(i);
      }
      await wait(400);
    },
    async review() {
      await this.result();
      $('#btnReviewAnswers').click(); await wait(300);
    },
    async retry() {
      await this.result();
      $('#btnRetry').click(); await wait(300);
    },
    // Trang diem sau khi LUYEN TAP xong: co nut "Quay lai phan xem diem"
    async practiceResult() {
      await this.result();
      $('#btnRetryWrong').click(); await wait(200);
      const n = window.quiz.session.length;
      for (let i = 0; i < n; i++) await rightFirst(i);
      await wait(350);
    },
    // Khung lam bai khi dang Luyen tap: co nhan "Luyen tap"
    async practice() {
      await this.result();
      $('#btnRetry').click(); await wait(300);
    },
    async reviewWrong() {
      await this.result();
      $('#btnReviewAnswers').click(); await wait(200);
      $('#btnRvFilter').click(); await wait(120);
      $('#btnRvFilter').click(); await wait(120);
      $('#rvList .rv-item:last-child')?.scrollIntoView({ block: 'center' });
      await wait(300);
    }
  };
  return 'ready';
})()`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--mute-audio', '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + path.join(os.tmpdir(), 'opencode', 'cdp-shot'),
    '--window-size=' + SIZE,
    PAGE_URL
  ], { stdio: 'ignore' });

  let target = null;
  for (let i = 0; i < 40 && !target; i++) {
    await sleep(300);
    try {
      const list = await (await fetch('http://127.0.0.1:' + PORT + '/json/list')).json();
      target = list.find(t => t.type === 'page' && t.url.includes('index.html')) || null;
    } catch (_) {}
  }
  if (!target) { console.log('khong ket noi duoc chrome'); chrome.kill(); process.exit(1); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  });
  const send = (method, params = {}) => new Promise(res => {
    const mid = ++id; pending.set(mid, res);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });

  await new Promise(res => ws.addEventListener('open', res));
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  await sleep(1200);

  const drive = await send('Runtime.evaluate', { expression: DRIVE, awaitPromise: true, returnByValue: true });
  if (drive.result?.exceptionDetails) {
    console.log('LOI DRIVE:', JSON.stringify(drive.result.exceptionDetails).slice(0, 400));
    chrome.kill();
    process.exit(1);
  }

  for (const name of STATES) {
    const r = await send('Runtime.evaluate', { expression: `window.__states.${name}()`, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) console.log('LOI STATE ' + name + ':', JSON.stringify(r.result.exceptionDetails).slice(0, 300));
    await sleep(400);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const file = path.join(OUT, name + '.png');
    fs.writeFileSync(file, Buffer.from(shot.result.data, 'base64'));
    console.log(file);
  }

  ws.close();
  chrome.kill();
  process.exit(0);
})();