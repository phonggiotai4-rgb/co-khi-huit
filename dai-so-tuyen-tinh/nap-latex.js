/* NẠP LATEX VÀO NGÂN HÀNG CÂU HỎI — ĐẠI SỐ TUYẾN TÍNH
   Đọc ../assets/quiz-bank.js, chuyển các trường q / o[] / e của
   CK.PART_QUIZ["dai-so-tuyen-tinh"] sang LaTeX (\( ... \)) bằng latex-convert.js,
   rồi ghi lại đúng khối đó (các môn khác giữ nguyên từng byte).
   Không đổi số câu, thứ tự câu, thứ tự phương án hay chỉ số đáp án a.
   Chạy từ thư mục dai-so-tuyen-tinh/:  node nap-latex.js [đường-dẫn-quiz-bank.js]
   Chỉ chạy MỘT lần trên bản gốc: nếu khối đã có LaTeX thì script dừng. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const { toLatex, validate } = require('./latex-convert.js');
const FILE = path.resolve(process.argv[2] || path.join(__dirname, '..', 'assets', 'quiz-bank.js'));
const SLUG = 'dai-so-tuyen-tinh';
const src = fs.readFileSync(FILE, 'utf8');
const eol = src.includes('\r\n') ? '\r\n' : '\n';
const text = src.replace(/\r\n/g, '\n');

const ctx = { window: {} }; ctx.window.window = ctx.window; vm.createContext(ctx);
vm.runInContext(src, ctx);
const bank = ctx.window.CK.PART_QUIZ[SLUG];
if (!bank) throw new Error('Không có CK.PART_QUIZ["' + SLUG + '"]');
if (JSON.stringify(bank).includes('\\\\(')) throw new Error('Khối ' + SLUG + ' đã chứa LaTeX — dừng để tránh chuyển hai lần');

const warnings = [], problems = [];
const conv = (t, where) => {
  const o = toLatex(t, { warnings });
  validate(o).forEach((p) => problems.push(where + ': ' + p));
  return o;
};
const ids = Object.keys(bank);
let total = 0;
const out = {};
ids.forEach((pid) => {
  out[pid] = bank[pid].map((q, i) => {
    total++;
    const w = pid + '#' + (i + 1);
    const r = { q: conv(q.q, w + ' q'), o: q.o.map((x, j) => conv(x, w + ' o' + j)), a: q.a };
    if (q.e != null) r.e = conv(q.e, w + ' e');
    return r;
  });
});
if (problems.length) { console.error(problems.slice(0, 30).join('\n')); throw new Error(problems.length + ' lỗi cú pháp LaTeX — không ghi file'); }

const lines = ids.map((pid) => '      ' + JSON.stringify(pid) + ': [\n' + out[pid].map((q) =>
  '        { q: ' + JSON.stringify(q.q) + ', o: [' + q.o.map((x) => JSON.stringify(x)).join(', ') + '], a: ' + q.a +
  (q.e != null ? ', e: ' + JSON.stringify(q.e) : '') + ' }').join(',\n') + '\n      ]').join(',\n');
const block = '    "' + SLUG + '": {\n' + lines + '\n    },';

const start = text.indexOf('    "' + SLUG + '": {');
const endMark = '\n    },\n  };';
const end = text.indexOf(endMark, start);
if (start < 0 || end < 0) throw new Error('Không xác định được ranh giới khối ' + SLUG + ' (phải là khối cuối của PART_QUIZ)');
let res = text.slice(0, start) + block + text.slice(end + '\n    },'.length);
res = res.replace('(2 câu 33 và 2 câu 144) vì nội dung khác nhau. */',
  '(2 câu 33 và 2 câu 144) vì nội dung khác nhau.\n       Công thức viết bằng LaTeX trong \\( … \\) (hiển thị bằng MathJax) — sinh bởi\n       dai-so-tuyen-tinh/nap-latex.js từ ký pháp tuyến tính của bản gốc. */');
fs.writeFileSync(FILE, res.replace(/\n/g, eol), 'utf8');

/* kiểm tra lại: nạp lại file mới, số câu và đáp án phải y nguyên */
const ctx2 = { window: {} }; ctx2.window.window = ctx2.window; vm.createContext(ctx2);
vm.runInContext(fs.readFileSync(FILE, 'utf8'), ctx2);
const nb = ctx2.window.CK.PART_QUIZ[SLUG];
ids.forEach((pid) => {
  if (nb[pid].length !== bank[pid].length) throw new Error('Lệch số câu ở ' + pid);
  nb[pid].forEach((q, i) => { if (q.a !== bank[pid][i].a || q.o.length !== bank[pid][i].o.length) throw new Error('Lệch đáp án ' + pid + '#' + (i + 1)); });
});
Object.keys(ctx.window.CK.PART_QUIZ).filter((k) => k !== SLUG).forEach((k) => {
  if (JSON.stringify(ctx.window.CK.PART_QUIZ[k]) !== JSON.stringify(ctx2.window.CK.PART_QUIZ[k])) throw new Error('Môn ' + k + ' bị thay đổi!');
});
console.log('Đã chuyển ' + total + ' câu (' + ids.length + ' chương) sang LaTeX; cảnh báo: ' + warnings.length + '. Ghi: ' + FILE);
