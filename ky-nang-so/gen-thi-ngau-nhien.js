/* ============================================================================
   CƠ KHÍ HUIT — SINH TRANG THI THỬ NGẪU NHIÊN CHỨNG CHỈ KỸ NĂNG SỐ
   ----------------------------------------------------------------------------
   Nguồn mẫu (chuẩn tham chiếu): ../qp-an/thi-QPAN1-ngau-nhien.html
     — trang thi thử 40 câu / 60 phút của môn Quốc phòng 1.

   Trang sinh ra GIỮ NGUYÊN toàn bộ giao diện + logic của bản mẫu (CSS, bố cục
   2 pane, đồng hồ theo deadline thật, ưu tiên câu chưa từng làm, bộ lọc,
   lưới 2 cột, phím tắt, 2 modal nộp bài / kết quả, CK.recordHistory) và CHỈ
   thay phần nội dung của môn:
     • tiêu đề (thẻ <title> + thanh tiêu đề)
     • dòng mô tả bài thi (số câu trong ngân hàng + cấu trúc mô đun)
     • dòng "Mã thi"
     • ngân hàng câu hỏi: đọc CK.PART_QUIZ["chung-chi-ky-nang-so"] từ
       assets/quiz-bank-ky-nang-so.js thay vì nhúng sẵn (một nguồn duy nhất với
       trang luyện tập)
     • nhãn "Nguồn: đề N" -> "Nguồn: mô đun N"
     • khoá localStorage nhớ câu đã gặp: qpan1_rng_v1 -> kns_rng_v1
     • metadata ghi lịch sử làm bài (slug / môn / nhóm môn / "Đề ngẫu nhiên")
   Ngoài ra giữ bản sửa lỗi hiển thị của bản mẫu: giây của đồng hồ thiếu số 0 ở
   đầu ("01 : 00 : 0" -> "01 : 00 : 00").

   CÁCH DÙNG (chạy từ thư mục ky-nang-so/):
     node gen-thi-ngau-nhien.js
   Kết quả ghi ra: ./thi-chung-chi-ky-nang-so-ngau-nhien.html
   ========================================================================= */
"use strict";

const fs = require("fs");
const path = require("path");

const HERE = __dirname;                              /* .../ky-nang-so/ */
const SITE = path.resolve(HERE, "..");               /* .../ (gốc site) */
const SRC = path.join(SITE, "qp-an", "thi-QPAN1-ngau-nhien.html");
const OUT = path.join(HERE, "thi-chung-chi-ky-nang-so-ngau-nhien.html");

const SLUG = "chung-chi-ky-nang-so";
const SUBJECT = "CHỨNG CHỈ KỸ NĂNG SỐ";
const CAT = "CHỨNG CHỈ";
const CAT_NAME = "Chứng chỉ";
const BANK_FILE = "quiz-bank-ky-nang-so.js";

let s = fs.readFileSync(SRC, "utf8");
const eol = s.indexOf("\r\n") !== -1 ? "\r\n" : "\n";

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
rep("QUỐC PHÒNG 1", SUBJECT, 2);

/* 2) Dòng mô tả bài thi: số câu ngân hàng + cấu trúc */
rep("655 câu (đề 1–10)", "360 câu (6 mô đun)", 1);

/* 3) Dòng mã thi (bỏ phòng thi riêng của Quốc phòng) */
rep("Mã thi: Kỳ kiểm tra Quốc phòng 1 — Phòng: UNA302",
    "Mã thi: Kỳ kiểm tra Chứng chỉ Kỹ năng số", 1);

/* 4) Đồng hồ: giây phải đủ 2 chữ số */
rep("  return p(h) + ' : ' + p(m) + ' : ' + q;",
    "  return p(h) + ' : ' + p(m) + ' : ' + p(q);", 1);

/* 5) Khoá localStorage nhớ câu đã gặp — riêng của môn */
rep("var STORAGE_KEY = 'qpan1_rng_v1';", "var STORAGE_KEY = 'kns_rng_v1';", 1);

/* 6) Nguồn câu hỏi là mô đun, không phải đề */
rep("'Nguồn: đề ' + QUESTIONS[cur].s", "'Nguồn: mô đun ' + QUESTIONS[cur].s", 1);
rep('/* hiện "nguồn: đề N" dưới mỗi câu */', '/* hiện "nguồn: mô đun N" dưới mỗi câu */', 1);

/* 7) Ngân hàng câu hỏi — đọc CK.PART_QUIZ["chung-chi-ky-nang-so"] lúc chạy */
const bankBlock = `/* ============================================================
   NGÂN HÀNG CÂU HỎI — nạp từ assets/${BANK_FILE} (CK.PART_QUIZ["${SLUG}"])
   360 câu / 6 mô đun. Mỗi câu trong ngân hàng: { q, o:[4 phương án], a: chỉ số đáp án đúng }
   -> đổi sang dạng của trang này: { t: nội dung, o: [4 phương án], c: đáp án đúng (0-3), s: số mô đun }
   ============================================================ */
var BANK = (function () {
  var src = (window.CK && CK.PART_QUIZ && CK.PART_QUIZ['${SLUG}']) || {};
  var out = [];
  Object.keys(src).forEach(function (pid, k) {
    var md = parseInt(String(pid).replace(/^.*-(\\d+)$/, '$1'), 10);
    if (!isFinite(md)) md = k + 1;
    (src[pid] || []).forEach(function (q) {
      if (q && q.q && q.o && q.o.length === 4 && typeof q.a === 'number' && q.a >= 0 && q.a <= 3) {
        out.push({ t: q.q, o: q.o, c: q.a, s: md });
      }
    });
  });
  return out;
})();`;

const bankStart = s.indexOf("/* ============================================================\n   NGÂN HÀNG CÂU HỎI");
const bankLineEnd = s.indexOf("\n", s.indexOf("var BANK = ["));
if (bankStart === -1 || bankLineEnd === -1) throw new Error("Không tìm thấy khối BANK trong bản mẫu");
s = s.slice(0, bankStart) + bankBlock + s.slice(bankLineEnd + 1);

/* 8) Nạp ngân hàng câu hỏi (CK.PART_QUIZ) trước history.js */
rep('<script src="../assets/history.js"></script>',
    '<script src="../assets/' + BANK_FILE + '"></script>\n<script src="../assets/history.js"></script>', 1);

/* 9) Ghi lịch sử làm bài: khai rõ môn + nhóm môn */
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
    slug: '${SLUG}',
    subject: '${SUBJECT}',
    cat: '${CAT}',
    catName: '${CAT_NAME}',
    part: 'de-ngau-nhien',
    partName: 'Đề ngẫu nhiên'
  });`, 1);

/* 10) Thay "40 CÂU NGẪU NHIÊN" → "60 CÂU NGẪU NHIÊN" ở <title> + titlebar */
rep("40 CÂU NGẪU NHIÊN", "60 CÂU NGẪU NHIÊN", 2);

/* 11) Đổi số câu mỗi lần thi từ 40 → 60 */
rep("var EXAM_COUNT = 40;", "var EXAM_COUNT = 60;", 1);

/* 11) Tiêu đề tab đầy đủ + favicon */
rep("<title>" + SUBJECT + " — 60 CÂU NGẪU NHIÊN / 60 PHÚT</title>",
    "<title>" + SUBJECT + " — 60 CÂU NGẪU NHIÊN / 60 PHÚT</title>\n" +
    '<link rel="icon" href="../assets/logo.png" />', 1);

if (eol === "\r\n") s = s.replace(/\r?\n/g, "\r\n");

fs.writeFileSync(OUT, s, "utf8");
console.log("Đã sinh: " + OUT + " (" + fs.statSync(OUT).size + " bytes)");
