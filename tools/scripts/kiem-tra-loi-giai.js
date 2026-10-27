/* ============================================================================
   KIỂM TRA LỜI GIẢI THÍCH QPAN 1
   ----------------------------------------------------------------------------
   Chạy:  node tools/scripts/kiem-tra-loi-giai.js
   (không cần cài gì, chạy ngay trong thư mục dự án)

   Soát:
     1. Mỗi bài thi có mảng lời giải không → báo thiếu
     2. Độ dài mảng lời giải có bằng số câu của bài thi không → báo lệch
     3. Có ô trống (câu chưa có lời giải) không → liệt kê số câu
     4. Có câu nào thiếu `e` sau khi áp lời giải không → báo lỗi thật
     5. Lời giải có rỗng hoặc quá ngắn (<20 ký tự) không → cảnh báo
   ========================================================================= */
"use strict";

const path = require("path");
const ROOT = path.join(__dirname, "..", "..");

global.window = global;
global.CK = global.CK || {};

require(path.join(ROOT, "assets", "data.js"));
require(path.join(ROOT, "assets", "quiz-bank.js"));
require(path.join(ROOT, "assets", "qpan1-explanations.js"));

const CK = global.CK;
const PARTS = CK.PART_QUIZ.qpan1 || {};
const EXPL = CK.QPAN1_EXPL || {};

/* Gán trước khi đếm để phản ánh đúng trạng thái thật của trang đề cương */
const applied = CK.applyQpan1Explanations();

const P = (s) => String(s || "").padEnd(8);
let errs = 0, warns = 0;

console.log("Đã áp lời giải: " + applied + " câu\n");
console.log(P("Đề") + P("Câu") + P("Có lời giải") + P("Thiếu") + P("Trạng thái"));
console.log("-".repeat(58));

Object.keys(PARTS).sort((a, b) => {
  const n = (s) => parseInt(String(s).replace(/\D+/g, ""), 10) || 0;
  return n(a) - n(b);
}).forEach((id) => {
  const list = PARTS[id];
  const src = EXPL[id];
  let has = 0, missing = [], state;

  list.forEach((q, i) => {
    if (q.e && String(q.e).trim()) has++;
    else missing.push(i + 1);
  });

  if (!src) {
    state = "CHƯA TẠO mảng lời giải";
    warns++;
  } else if (!src.length) {
    state = "chưa bổ sung";
    warns++;
  } else if (src.length !== list.length) {
    state = "SAI ĐỘ DÀI (" + src.length + " ≠ " + list.length + ")";
    errs++;
  } else if (has === list.length) {
    state = "đủ";
  } else if (has === 0) {
    state = "chưa bổ sung";
    warns++;
  } else {
    state = "dở dang";
    warns++;
  }

  console.log(P(id) + P(list.length) + P(has) + P(missing.length) + state);

  /* Cảnh báo lời giải quá ngắn — thường là ghi dở */
  if (src) {
    src.forEach((e, i) => {
      const t = String(e || "").trim();
      if (t && t.length < 20) {
        console.log("         ⚠ câu " + (i + 1) + ": lời giải quá ngắn (" + t.length + " ký tự)");
        warns++;
      }
    });
  }

  /* Đối chiếu lời giải với đáp án: nếu lời giải nói "phương án X" / "đáp án
     là X" mà X khác đáp án đang lưu → có khả năng lời giải sai.
     Bỏ qua "cả a và b" vì đó là dạng hợp lệ. */
  const LETTERS = ["A", "B", "C", "D"];
  list.forEach((q, i) => {
    const t = String(q.e || "");
    if (!t) return;
    /* Dùng matchAll chứ không dùng match + cờ g: với cờ g, match trả về mảng
       chuỗi khớp nên không lấy được nhóm bắt. */
    const hits = [...t.matchAll(/phương án ([ABCD])\b|đáp án (?:đúng )?là ([ABCD])\b/g)];
    if (!hits.length) return;
    const refs = [...new Set(hits.map((x) => x[1] || x[2]))];
    const wrong = refs.filter((r) => r !== LETTERS[q.a]);
    if (wrong.length) {
      console.log("         ⚠ câu " + (i + 1) + ": lời giải nhắc " + wrong.join(",") +
        " nhưng đáp án đang lưu là " + LETTERS[q.a] + " — kiểm lại");
      warns++;
    }
  });
});

/* Câu hỏi trong bank không nằm trong bất kỳ đề nào — thường là gõ lỗi khi sao chép */
let orphan = 0;
Object.keys(PARTS).forEach((id) => {
  PARTS[id].forEach((q, i) => {
    const need = String(q.q || "").trim();
    if (!need) {
      console.log("❌ " + id + " câu " + (i + 1) + ": thiếu nội dung câu hỏi");
      errs++; orphan++;
    }
    if (!(q.o || []).length || q.a == null) {
      console.log("❌ " + id + " câu " + (i + 1) + ": thiếu phương án hoặc đáp án");
      errs++; orphan++;
    }
  });
});

console.log("");
if (!errs) console.log("✔ Không có lỗi.");
if (errs) console.log("✘ " + errs + " lỗi cần sửa.");
if (warns) console.log("⚠ " + warns + " cảnh báo (bài thi chưa bổ sung lời giải).");

process.exit(errs ? 1 : 0);