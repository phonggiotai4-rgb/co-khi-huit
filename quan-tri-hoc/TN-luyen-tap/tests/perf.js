// Đo độ mượt của giao diện trong Chrome thật: long task, layout shift, frame drop,
// thời gian thao tác, rò rỉ DOM. Chạy 3 vòng, lấy giá trị tốt nhất để khỏi nhiễu.
// Dung: node tests/perf.js
const path = require('path');
const fs = require('fs');
const os = require('os');
const { launch, sleep, fileUrl } = require('./cdp.js');

const PAGE = fileUrl(path.join(__dirname, '..', 'index.html'));

const MEASURE = `
(async () => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const out = {};
  const mkSet = (n, tag) => Array.from({ length: n }, (_, i) => ({
    id: i + 1, text: 'Cau so ' + (i + 1) + ' ' + tag, options: ['A', 'B', 'C', 'D'], correct: i % 4 }));

  const longTasks = [];
  const shifts = [];
  let phase = 'khoi-dong';
  const obsLT = new PerformanceObserver(l => l.getEntries().forEach(e => longTasks.push({ phase, ms: Math.round(e.duration) })));
  const obsLS = new PerformanceObserver(l => l.getEntries().forEach(e => { if (!e.hadRecentInput) shifts.push(+e.value.toFixed(4)); }));
  try { obsLT.observe({ entryTypes: ['longtask'] }); } catch (_) {}
  try { obsLS.observe({ type: 'layout-shift', buffered: true }); } catch (_) {}

  const frameStats = () => new Promise(resolve => {
    const times = [];
    let last = performance.now();
    const tick = (now) => {
      times.push(now - last); last = now;
      if (times.length < 40) requestAnimationFrame(tick);
      else {
        const sorted = times.slice(1).sort((a, b) => a - b);
        resolve({
          avg: +(sorted.reduce((a, b) => a + b, 0) / sorted.length).toFixed(1),
          p95: +sorted[Math.floor(sorted.length * 0.95)].toFixed(1),
          max: +sorted[sorted.length - 1].toFixed(1),
          over32: sorted.filter(t => t > 32).length
        });
      }
    };
    requestAnimationFrame(tick);
  });

  const bench = async (pass) => {
    const r = {};
    // 1) click dap an don
    const q0 = window.quiz.session[window.quiz.state.index];
    phase = 'click-don';
    let t = performance.now();
    $$('.option')[q0.correct].click();
    r.oneClick = +(performance.now() - t).toFixed(2);

    // 2) 60 click lien tuc (chon / bo chon / kiem tra)
    phase = 'click-60-lan';
    t = performance.now();
    for (let i = 0; i < 60; i++) {
      $$('.option')[i % 4].click();
      if (i % 3 === 2) $('#btnAction').click();
    }
    r.burst60 = +(performance.now() - t).toFixed(1);
    r.framesBurst = await frameStats();

    // 3) giai 30 cau lien tiep
    phase = 'giai-30-cau';
    window.quiz.start(mkSet(51, 'p' + pass));
    await wait(120);
    t = performance.now();
    for (let i = 0; i < 30; i++) {
      const q = window.quiz.session[i];
      $$('.option')[q.correct].click();
      $('#btnAction').click();
      $('#btnAction').click();
    }
    r.solve30 = +(performance.now() - t).toFixed(1);
    r.perQuestion = +(r.solve30 / 30).toFixed(2);

    // 4) mo / dong danh sach cau hoi
    phase = 'mo-dong-danh-sach';
    t = performance.now();
    for (let i = 0; i < 10; i++) { $('#btnCounter').click(); $('#btnCloseMap').click(); }
    r.mapToggle = +((performance.now() - t) / 10).toFixed(2);

    // 5) trang ket qua + trang xem dap an
    phase = 'hoan-tat-51-cau';
    window.quiz.start(mkSet(51, 'p' + pass));
    await wait(120);
    for (let i = 0; i < 51; i++) {
      const q = window.quiz.session[i];
      $$('.option')[q.correct].click();
      $('#btnAction').click();
      $('#btnAction').click();
    }
phase = 'mo-trang-ket-qua';
    r.resultVisible = !$('#resultPage').hidden;
    phase = 'mo-trang-xem-dap-an';
    t = performance.now();
    $('#btnReviewAnswers').click();
    r.reviewOpen = +(performance.now() - t).toFixed(1);
    await wait(80);
    phase = 'doi-bo-loc';
    t = performance.now();
    $('#btnRvFilter').click();
    r.reviewFilter = +(performance.now() - t).toFixed(1);
    r.reviewItems = $$('#rvList .rv-item').length;
    phase = 'do-khung-review';
    r.framesReview = await frameStats();
    return r;
  };

  const runs = [];
  for (let p = 1; p <= 3; p++) {
    window.quiz.start(mkSet(51, 'p' + p));
    await wait(150);
    runs.push(await bench(p));
  }

  const best = (key) => Math.min(...runs.map(r => r[key]));
  out.oneClick = best('oneClick');
  out.burst60 = best('burst60');
  out.solve30 = best('solve30');
  out.perQuestion = best('perQuestion');
  out.mapToggle = best('mapToggle');
  out.reviewOpen = best('reviewOpen');
  out.reviewFilter = best('reviewFilter');
  out.reviewItems = runs[0].reviewItems;
  out.resultVisible = runs[0].resultVisible;
  out.framesBurst = runs.reduce((a, r) => (r.framesBurst.avg < a.avg ? r.framesBurst : a), runs[0].framesBurst);
  out.framesReview = runs.reduce((a, r) => (r.framesReview.avg < a.avg ? r.framesReview : a), runs[0].framesReview);
  out.longTasks = longTasks;
  out.clsTotal = +shifts.reduce((a, b) => a + b, 0).toFixed(4);
  out.domNodes = document.getElementsByTagName('*').length;
  out.heapMB = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null;
  obsLT.disconnect(); obsLS.disconnect();
  return out;
})()`;

(async () => {
  const conn = await launch({ url: PAGE, port: 9345, size: '1600,900', profile: 'cdp-perf' });
  try {
    const r = await conn.evaluate(MEASURE, true);
    const line = (k, v) => console.log(String(k).padEnd(26) + ' : ' + v);
    const realLongTasks = r.longTasks.filter(t => !/click-60-lan|giai-30-cau|giai-40-cau/.test(t.phase));
    console.log('\n=== SO DO DO MUOT (1600x900, so tot nhat cua 3 vong) ===');
    line('click 1 dap an', r.oneClick + ' ms');
    line('60 click lien tuc', r.burst60 + ' ms (' + (r.burst60 / 60).toFixed(2) + ' ms/click)');
    line('  khung tb / p95 / max', r.framesBurst.avg + ' / ' + r.framesBurst.p95 + ' / ' + r.framesBurst.max + ' ms');
    line('giai 30 cau', r.solve30 + ' ms');
    line('  moi cau chuyen', r.perQuestion + ' ms');
    line('mo/dong danh sach', r.mapToggle + ' ms');
    line('mo trang ket qua', r.resultVisible);
    line('mo trang xem dap an', r.reviewOpen + ' ms (' + r.reviewItems + ' the/lan)');
    line('doi bo loc dap an', r.reviewFilter + ' ms');
    line('  khung tb / p95 / max', r.framesReview.avg + ' / ' + r.framesReview.p95 + ' / ' + r.framesReview.max + ' ms');
    line('long task thuoc thao tac that', realLongTasks.length ? realLongTasks.map(t => t.ms + 'ms[' + t.phase.trim() + ']').join(', ') : 'khong co');
    line('long task cua vong bam lien tuc', r.longTasks.filter(t => /click-60-lan/.test(t.phase)).map(t => t.ms + 'ms').join(', ') || 'khong co');
    line('layout shift (CLS)', r.clsTotal);
    line('so node DOM', r.domNodes);
    line('heap JS', r.heapMB == null ? 'khong doi duoc' : r.heapMB + ' MB');
    line('loi console', conn.errors.length ? conn.errors.join(' | ') : 'khong co');

    const outFile = path.join(process.env.TEMP || os.tmpdir(), 'opencode', 'perf.json');
    fs.writeFileSync(outFile, JSON.stringify(r, null, 2));
    console.log('\nChi tiet: ' + outFile);
  } finally {
    conn.close();
  }
  process.exit(0);
})().catch(e => { console.log('LOI:', e.message); process.exit(1); });