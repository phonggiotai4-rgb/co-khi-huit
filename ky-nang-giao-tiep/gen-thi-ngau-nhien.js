/* ============================================================================
   SINH TRANG THI THỬ NGẪU NHIÊN CHO MÔN KỸ NĂNG GIAO TIẾP
   ----------------------------------------------------------------------------
   Nguồn mẫu (chuẩn tham chiếu): qp-an/thi-QPAN1-ngau-nhien.html
     — trang thi thử 40 câu / 60 phút của môn Quốc phòng 1.

   Trang sinh ra GIỮ NGUYÊN toàn bộ giao diện + logic của bản mẫu (CSS, bố cục
   2 pane, đồng hồ theo deadline thật, ưu tiên câu chưa từng làm, bộ lọc,
   lưới 2 cột, phím tắt, 2 modal nộp bài / kết quả, CK.recordHistory) và CHỈ
   thay phần nội dung của môn:
     • tiêu đề (thẻ <title> + thanh tiêu đề)
     • dòng mô tả bài thi (số câu trong ngân hàng + cấu trúc chương)
     • dòng "Mã thi"
     • ngân hàng câu hỏi: đọc CK.PART_QUIZ["ky-nang-giao-tiep"] từ assets/quiz-bank.js
       thay vì nhúng sẵn (luôn khớp với ngân hàng dùng cho luyện tập/đề cương)
     • nhãn "Nguồn: đề N" -> "Nguồn: chương N"
     • khoá localStorage nhớ câu đã gặp: qpan1_rng_v1 -> kngt_rng_v1
     • metadata ghi lịch sử làm bài (slug / môn / nhóm môn / "Chương ngẫu nhiên")
   Ngoài ra sửa các lỗi hiển thị của bản mẫu:
     • giây của đồng hồ thiếu số 0 ở đầu ("01 : 00 : 0" -> "01 : 00 : 00")
     • LETTERS chỉ có A–D, bổ sung E–F để câu có nhiều phương án không bị vỡ

   CÁCH DÙNG (chạy từ thư mục ky-nang-giao-tiep/):
     node gen-thi-ngau-nhien.js
   Kết quả ghi ra: ./thi-ky-nang-giao-tiep-ngau-nhien.html
   ========================================================================= */
const fs = require('fs');
const path = require('path');

const HERE = __dirname;                              /* .../ky-nang-giao-tiep/            */
const SITE = path.resolve(HERE, '..');               /* .../  (gốc site)                  */
const SRC = path.join(SITE, 'qp-an', 'thi-QPAN1-ngau-nhien.html');
const OUT = path.join(HERE, 'thi-ky-nang-giao-tiep-ngau-nhien.html');

let s = fs.readFileSync(SRC, 'utf8');
const eol = s.indexOf('\r\n') !== -1 ? '\r\n' : '\n';

/* Thay chuỗi và ĐẢM BẢO số lần xuất hiện đúng — lệch số lần thì báo lỗi
   (tránh âm thầm sửa nhầm chỗ khác trong bản mẫu). */
function rep(from, to, expect) {
  const c = s.split(from).length - 1;
  if (expect != null && c !== expect) {
    throw new Error('Cần ' + expect + ' lần xuất hiện của "' + from.slice(0, 70) + '" — tìm thấy ' + c);
  }
  s = s.split(from).join(to);
}

/* 1) Tiêu đề trang + thanh tiêu đề */
rep('QUỐC PHÒNG 1', 'KỸ NĂNG GIAO TIẾP', 2);

/* 2) Dòng mô tả bài thi: số câu ngân hàng + cấu trúc */
rep('655 câu (đề 1–10)', '202 câu (4 chương)', 1);

/* 3) Dòng mã thi (bỏ phòng thi riêng của Quốc phòng) */
rep('Mã thi: Kỳ kiểm tra Quốc phòng 1 — Phòng: UNA302',
    'Mã thi: Kỳ kiểm tra Kỹ năng giao tiếp', 1);

/* 4) Đồng hồ: giây phải đủ 2 chữ số */
rep("  return p(h) + ' : ' + p(m) + ' : ' + q;",
    "  return p(h) + ' : ' + p(m) + ' : ' + p(q);", 1);

/* 5) Khoá localStorage nhớ câu đã gặp — riêng của môn */
rep("var STORAGE_KEY = 'qpan1_rng_v1';", "var STORAGE_KEY = 'kngt_rng_v1';", 1);

/* 6) Nguồn câu hỏi là chương, không phải đề */
rep("'Nguồn: đề ' + QUESTIONS[cur].s", "'Nguồn: chương ' + QUESTIONS[cur].s", 1);
rep('/* hiện "nguồn: đề N" dưới mỗi câu */', '/* hiện "nguồn: chương N" dưới mỗi câu */', 1);

/* 7) LETTERS: câu có nhiều hơn 4 phương án trong ngân hàng */
rep("var LETTERS = ['A','B','C','D'];", "var LETTERS = ['A','B','C','D','E','F'];", 1);

/* 8) Ngân hàng câu hỏi — đọc CK.PART_QUIZ["ky-nang-giao-tiep"] lúc chạy */
const bankBlock = `/* ============================================================
   NGÂN HÀNG CÂU HỎI — nạp từ assets/quiz-bank.js (CK.PART_QUIZ["ky-nang-giao-tiep"])
   202 câu / 4 chương. Mỗi câu trong ngân hàng: { q, o:[4 phương án], a: chỉ số đáp án đúng }
   -> đổi sang dạng của trang này: { t: nội dung, o: [phương án], c: đáp án đúng, s: số chương }
   ============================================================ */
var BANK = (function () {
  var src = (window.CK && CK.PART_QUIZ && CK.PART_QUIZ['ky-nang-giao-tiep']) || {};
  var out = [];
  Object.keys(src).forEach(function (pid, k) {
    var ch = parseInt(String(pid).replace(/^.*-(\\d+)$/, '$1'), 10);
    if (!isFinite(ch)) ch = k + 1;
    (src[pid] || []).forEach(function (q) {
      if (q && q.q && q.o && q.o.length >= 2 && q.o.length <= 6 && typeof q.a === 'number' && q.a >= 0 && q.a < q.o.length) {
        out.push({ t: q.q, o: q.o, c: q.a, s: ch });
      }
    });
  });
  return out;
})();`;

const bankStart = s.indexOf('/* ============================================================\n   NGÂN HÀNG CÂU HỎI');
const bankLineEnd = s.indexOf('\n', s.indexOf('var BANK = ['));
if (bankStart === -1 || bankLineEnd === -1) throw new Error('Không tìm thấy khối BANK trong bản mẫu');
s = s.slice(0, bankStart) + bankBlock + s.slice(bankLineEnd + 1);

/* 9) Nạp quiz-bank.js (CK.PART_QUIZ) trước history.js */
rep('<script src="../assets/history.js"></script>',
    '<script src="../assets/quiz-bank.js"></script>\n<script src="../assets/history.js"></script>', 1);

/* 10) Ghi lịch sử làm bài: khai rõ môn + nhóm môn (trang này không nằm trong qp-an-*) */
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
    slug: 'ky-nang-giao-tiep',
    subject: 'KỸ NĂNG GIAO TIẾP',
    cat: 'ĐẠI CƯƠNG LÝ LUẬN CHÍNH TRỊ & MÔN KHÁC',
    catName: 'Đại cương lý luận chính trị & môn khác',
    part: 'chuong-ngau-nhien',
    partName: 'Chương ngẫu nhiên'
  });`, 1);

if (eol === '\r\n') s = s.replace(/\r?\n/g, '\r\n');

fs.writeFileSync(OUT, s, 'utf8');
console.log('Đã sinh: ' + OUT + ' (' + fs.statSync(OUT).size + ' bytes)');
