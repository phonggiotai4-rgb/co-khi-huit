/* SINH TRANG THI THỬ NGẪU NHIÊN — ĐẠI SỐ TUYẾN TÍNH
   Mẫu: qp-an/thi-QPAN1-ngau-nhien.html. Giữ nguyên giao diện + logic, chỉ thay nội dung môn.
   Ngân hàng đọc lúc chạy từ CK.PART_QUIZ["dai-so-tuyen-tinh"] (assets/quiz-bank.js).
   Chạy từ thư mục dai-so-tuyen-tinh/:  node gen-thi-ngau-nhien.js
   Kết quả: ./thi-dai-so-tuyen-tinh-ngau-nhien.html */
const fs = require('fs');
const path = require('path');
const HERE = __dirname;
const SITE = path.resolve(HERE, '..');
const SRC = path.join(SITE, 'qp-an', 'thi-QPAN1-ngau-nhien.html');
const OUT = path.join(HERE, 'thi-dai-so-tuyen-tinh-ngau-nhien.html');
let s = fs.readFileSync(SRC, 'utf8');
const eol = s.indexOf('\r\n') !== -1 ? '\r\n' : '\n';
function rep(from, to, expect) {
  const c = s.split(from).length - 1;
  if (expect != null && c !== expect) throw new Error('Cần ' + expect + ' lần "' + from.slice(0, 70) + '" — thấy ' + c);
  s = s.split(from).join(to);
}
rep('QUỐC PHÒNG 1', 'ĐẠI SỐ TUYẾN TÍNH', 2);
rep('655 câu (đề 1–10)', '412 câu (5 chương)', 1);
rep('Mã thi: Kỳ kiểm tra Quốc phòng 1 — Phòng: UNA302', 'Mã thi: Kỳ kiểm tra Đại số tuyến tính', 1);
/* chèn MathJax sau meta viewport */
rep('<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>',
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<!-- MathJax for rendering mathematical notation -->\n' +
    '<script>\n' +
    '  window.MathJax = {\n' +
    '    tex: {\n' +
    "      inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],\n" +
    "      displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],\n" +
    "      tags: 'ams',\n" +
    "      tagSide: 'right'\n" +
    '    },\n' +
    '    svg: { fontCache: \'global\' }\n' +
    '  };\n' +
    '</script>\n' +
    '<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>\n' +
    '<title>', 1);

/* Thêm logic re-render MathJax khi chuyển câu */
rep('  elOpts.innerHTML = optionsHtml();\n  elTotal.innerHTML = TOTAL;',
    '  elOpts.innerHTML = optionsHtml();\n' +
    '  if (window.MathJax && MathJax.typesetPromise) {\n' +
    '    MathJax.typesetPromise().catch(function(err){ console.log(err); });\n' +
    '  }\n' +
    '  elTotal.innerHTML = TOTAL;', 1);

rep('  elOpts.innerHTML = optionsHtml();\n  applyFilter();',
    '  elOpts.innerHTML = optionsHtml();\n' +
    '  if (window.MathJax && MathJax.typesetPromise) {\n' +
    '    MathJax.typesetPromise().catch(function(err){ console.log(err); });\n' +
    '  }\n' +
    '  applyFilter();', 1);
rep("var STORAGE_KEY = 'qpan1_rng_v1';", "var STORAGE_KEY = 'dst_rng_v1';", 1);
rep("  return p(h) + ' : ' + p(m) + ' : ' + q;", "  return p(h) + ' : ' + p(m) + ' : ' + p(q);", 1);
rep('40 CÂU NGẪU NHIÊN', '25 CÂU NGẪU NHIÊN', 2);
rep('40 câu ngẫu nhiên', '25 câu ngẫu nhiên', 1);
rep('id="total">40</span>', 'id="total">25</span>', 1);
rep('var EXAM_COUNT = 40;', 'var EXAM_COUNT = 25;', 1);
rep("'Nguồn: đề ' + QUESTIONS[cur].s", "'Nguồn: chương ' + QUESTIONS[cur].s", 1);
rep('/* hiện "nguồn: đề N" dưới mỗi câu */', '/* hiện "nguồn: chương N" dưới mỗi câu */', 1);
const bankBlock = `/* ============================================================
   NGÂN HÀNG CÂU HỎI — nạp từ assets/quiz-bank.js (CK.PART_QUIZ["dai-so-tuyen-tinh"])
   Mỗi câu ngân hàng: { q, o:[4 phương án], a, e } -> { t, o, c, s: số chương }
   ============================================================ */
var BANK = (function () {
  var src = (window.CK && CK.PART_QUIZ && CK.PART_QUIZ['dai-so-tuyen-tinh']) || {};
  var out = [];
  Object.keys(src).forEach(function (pid, k) {
    var ch = parseInt(String(pid).replace(/^.*-(\\d+)$/, '$1'), 10);
    if (!isFinite(ch)) ch = k + 1;
    (src[pid] || []).forEach(function (q) {
      if (q && q.q && q.o && q.o.length === 4 && typeof q.a === 'number' && q.a >= 0 && q.a <= 3) {
        out.push({ t: q.q, o: q.o, c: q.a, s: ch });
      }
    });
  });
  return out;
})();`;
const bankStart = s.indexOf('/* ============================================================\n   NGÂN HÀNG CÂU HỎI');
const bankLineEnd = s.indexOf('\n', s.indexOf('var BANK = [', bankStart));
if (bankStart === -1 || bankLineEnd === -1) throw new Error('Không tìm thấy khối BANK trong bản mẫu');
s = s.slice(0, bankStart) + bankBlock + s.slice(bankLineEnd + 1);
rep('<script src="../assets/history.js"></script>',
    '<script src="../assets/quiz-bank.js"></script>\n<script src="../assets/history.js"></script>', 1);
rep(`  CK.recordHistory({
    total: TOTAL,
    correct: c,
    ratio: TOTAL ? Math.round((c / TOTAL) * 100) : 0,
    seconds: Math.max(0, EXAM_SECONDS - remain)
  });`,
`  CK.recordHistory({
    total: TOTAL,
    correct: c,
    ratio: TOTAL ? Math.round((c / TOTAL) * 100) : 0,
    seconds: Math.max(0, EXAM_SECONDS - remain)
  }, {
    slug: 'dai-so-tuyen-tinh',
    subject: 'ĐẠI SỐ TUYẾN TÍNH',
    cat: 'TOÁN HỌC & KHOA HỌC',
    catName: 'Toán học & Khoa học',
    part: 'de-ngau-nhien',
    partName: 'Đề ngẫu nhiên'
  });`, 1);
if (eol === '\r\n') s = s.replace(/\r?\n/g, '\r\n');
fs.writeFileSync(OUT, s, 'utf8');
console.log('Đã sinh: ' + OUT + ' (' + fs.statSync(OUT).size + ' bytes)');
