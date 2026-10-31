/* SINH TRANG LUYỆN TẬP + ĐỀ CƯƠNG — ĐẠI SỐ TUYẾN TÍNH
   Mẫu: ../quan-tri-chat-luong/luyen-tap.html và quiz.html (một trang dùng chung, nhận ?d=chuong-N).
   Chỉ thay dữ liệu/nhãn môn; không đụng CSS, bố cục, luồng, chấm điểm.
   Dữ liệu: CK.PART_QUIZ["dai-so-tuyen-tinh"] trong ../assets/quiz-bank.js (chỉ số đáp án 0-based).
   Chạy từ thư mục dai-so-tuyen-tinh/:  node gen-luyen-tap.js  (kết quả: luyen-tap.html, quiz.html) */
const fs = require('fs'), path = require('path'), vm = require('vm');
const HERE = __dirname, SITE = path.resolve(HERE, '..');
const SLUG = 'dai-so-tuyen-tinh';
const SUBJECT = 'ĐẠI SỐ TUYẾN TÍNH', SUBJECT_TITLE = 'Đại số tuyến tính';
const CAT = 'TOÁN HỌC & KHOA HỌC', CAT_NAME = 'Toán học & Khoa học';

/* ---- nạp ngân hàng ---- */
const ctx = { window: {} }; ctx.window.window = ctx.window;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(SITE, 'assets', 'quiz-bank.js'), 'utf8'), ctx);
const bank = ctx.window.CK.PART_QUIZ[SLUG];
const ids = Object.keys(bank).sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')));
if (ids.length !== 5) throw new Error('Cần 5 chương, thấy ' + ids.length);

function rep(s, from, to, expect) {
  const c = s.split(from).length - 1;
  if (c !== expect) throw new Error('Cần ' + expect + ' lần "' + from.slice(0, 60) + '" — thấy ' + c);
  return s.split(from).join(to);
}

/* Sinh thêm MathJax để hiển thị công thức LaTeX từ ngân hàng câu hỏi */
const MATHJAX = `<!-- MathJax for rendering mathematical notation -->
<script>
  window.MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
      displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
      tags: 'ams',
      tagSide: 'right'
    },
    svg: {
      fontCache: 'global'
    }
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
`;

/* ================= luyen-tap.html ================= */
let s = fs.readFileSync(path.join(SITE, 'quan-tri-chat-luong', 'luyen-tap.html'), 'utf8');
const eol = s.includes('\r\n') ? '\r\n' : '\n';
s = s.replace(/\r\n/g, '\n');
/* chèn MathJax sau meta viewport, trước title */
s = s.replace('<meta name="viewport" content="width=device-width, initial-scale=1" />\n<title>',
              '<meta name="viewport" content="width=device-width, initial-scale=1" />\n' + MATHJAX.replace(/\$/g, '$$$$') + '\n<title>', 1);
s = rep(s, '<title>Quản trị chất lượng — Luyện tập | CƠ KHÍ HUIT</title>', '<title>' + SUBJECT_TITLE + ' — Luyện tập | CƠ KHÍ HUIT</title>', 1);
s = rep(s, '../index.html?m=quan-tri-chat-luong&mode=learn#lb', '../index.html?m=' + SLUG + '&mode=learn#lb', 1);
s = rep(s, "slug: 'quan-tri-chat-luong',", "slug: '" + SLUG + "',", 1);
s = rep(s, "subject: 'QUẢN TRỊ CHẤT LƯỢNG',", "subject: '" + SUBJECT + "',", 1);
s = rep(s, "cat: 'ĐẠI CƯƠNG LÝ LUẬN CHÍNH TRỊ & MÔN KHÁC',", "cat: '" + CAT + "',", 1);
s = rep(s, "catName: 'Đại cương lý luận chính trị & môn khác'", "catName: '" + CAT_NAME + "'", 1);
s = rep(s, "'Quản trị chất lượng — ' + PART_NAMES[partId]", "'" + SUBJECT_TITLE + " — ' + PART_NAMES[partId]", 1);
s = rep(s, "' — Quản trị chất lượng | CƠ KHÍ HUIT'", "' — " + SUBJECT_TITLE + " | CƠ KHÍ HUIT'", 1);

const total = ids.reduce((n, k) => n + bank[k].length, 0);
const names = ids.map(k => '    ' + JSON.stringify(k) + ': ' + JSON.stringify('Chương ' + parseInt(k.replace(/\D/g, '')))).join(',\n');
const bankJs = ids.map(k => '    ' + JSON.stringify(k) + ': [\n' + bank[k].map((q, i) =>
  '      { id: ' + (i + 1) + ', text: ' + JSON.stringify(q.q) + ', options: ' + JSON.stringify(q.o) + ', correct: ' + q.a + ' }').join(',\n') + '\n    ]').join(',\n');
s = rep(s, '    el.rvList.appendChild(frag);\n  };', '    el.rvList.appendChild(frag);\n\n    if (window.MathJax && MathJax.typesetPromise) {\n      MathJax.typesetPromise([el.rvList]).catch(err => console.log(\'MathJax error:\', err));\n    }\n  };', 1);
const a = s.indexOf('  /* ========================= CÂU HỎI =========================');
const b = s.indexOf('  const PART_PARAM = ');
if (a < 0 || b < 0) throw new Error('Không tìm thấy khối dữ liệu mẫu');
const block = '  /* ========================= CÂU HỎI =========================\n' +
  '     Nguồn: CK.PART_QUIZ["' + SLUG + '"] (assets/quiz-bank.js) — ' + total + ' câu, ' + ids.length + ' chương.\n' +
  '     Chương đang làm lấy từ tham số ?d=chuong-N; thiếu hoặc sai thì mặc định chương đầu.\n' +
  '     Sinh tự động bởi gen-luyen-tap.js — không sửa tay. */\n' +
  '  const PART_NAMES = {\n' + names + '\n  };\n\n  const BANK = {\n' + bankJs + '\n  };\n\n';
s = s.slice(0, a) + block + s.slice(b);
s = s.replace(/<\/script>/g, (m, off) => m); // giữ nguyên
if (/<\/script>/i.test(bankJs)) throw new Error('Dữ liệu chứa </script>');
fs.writeFileSync(path.join(HERE, 'luyen-tap.html'), s.replace(/\n/g, eol), 'utf8');

/* ================= quiz.html (đề cương) ================= */
let q = fs.readFileSync(path.join(SITE, 'quan-tri-chat-luong', 'quiz.html'), 'utf8');
const eol2 = q.includes('\r\n') ? '\r\n' : '\n';
q = q.replace(/\r\n/g, '\n');
/* chèn MathJax sau meta viewport, trước title */
q = q.replace('<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<title>',
              '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + MATHJAX.replace(/\$/g, '$$$$') + '\n<title>', 1);
q = rep(q, '<title>Quản trị chất lượng — Đề cương | CƠ KHÍ HUIT</title>', '<title>' + SUBJECT_TITLE + ' — Đề cương | CƠ KHÍ HUIT</title>', 1);
q = rep(q, 'Đề cương trắc nghiệm Quản trị chất lượng theo từng chương', 'Đề cương trắc nghiệm ' + SUBJECT_TITLE + ' theo từng chương', 1);
q = rep(q, '../index.html?m=quan-tri-chat-luong&amp;mode=sylabus#lb', '../index.html?m=' + SLUG + '&amp;mode=sylabus#lb', 2);
q = rep(q, '<h1 class="ck-page-title" id="pageTitle">QUẢN TRỊ HỌC — Đề cương</h1>', '<h1 class="ck-page-title" id="pageTitle">' + SUBJECT + ' — Đề cương</h1>', 1);
q = rep(q, 'var SLUG = "quan-tri-chat-luong";', 'var SLUG = "' + SLUG + '";', 1);
const ta = q.indexOf('  /* Tên chương lấy từ giáo trình');
const tb = q.indexOf('  var ICON_BULB');
const TITLES = { 1: 'Ma trận – Định thức', 2: 'Hệ phương trình tuyến tính', 3: 'Không gian vector', 4: 'Ánh xạ tuyến tính', 5: 'Dạng toàn phương' };
q = q.slice(0, ta) + '  /* Tên chương lấy từ file "ĐẠI SỐ TUYẾN TÍNH.docx" */\n  var TITLES = {\n' +
  ids.map(k => '    "' + k + '": ' + JSON.stringify('Chương ' + parseInt(k.replace(/\D/g, '')) + '. ' + TITLES[parseInt(k.replace(/\D/g, ''))])).join(',\n') + '\n  };\n\n' + q.slice(tb);
q = rep(q, 'document.title = partNameOf(id) + " — Đề cương Quản trị chất lượng | CƠ KHÍ HUIT";', 'document.title = partNameOf(id) + " — Đề cương ' + SUBJECT_TITLE + ' | CƠ KHÍ HUIT";', 1);
q = rep(q, '    renderChips();\n    renderList();\n\n    var u = location.pathname + "?d=" + encodeURIComponent(id);',
        '    renderChips();\n    renderList();\n    if (window.MathJax && MathJax.typesetPromise) {\n      MathJax.typesetPromise([$("list")]).catch(function (err) { console.log(err); });\n    }\n\n    var u = location.pathname + "?d=" + encodeURIComponent(id);', 1);
fs.writeFileSync(path.join(HERE, 'quiz.html'), q.replace(/\n/g, eol2), 'utf8');
console.log('Đã sinh luyen-tap.html (' + total + ' câu) và quiz.html');
