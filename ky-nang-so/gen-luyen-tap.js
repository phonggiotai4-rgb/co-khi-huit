/* ============================================================================
   CƠ KHÍ HUIT — SINH TRANG LUYỆN TẬP CHỨNG CHỈ KỸ NĂNG SỐ
   ----------------------------------------------------------------------------
   Nguồn mẫu: ../quan-tri-hoc/TN-luyen-tap/template-quiz.html
     — template trắc nghiệm chuẩn của site (giữ nguyên toàn bộ giao diện,
       cách chấm điểm, xem đáp án, chia sẻ, lịch sử làm bài).

   Trang sinh ra chỉ đổi phần dữ liệu:
     • ngân hàng câu hỏi đọc trực tiếp CK.PART_QUIZ["chung-chi-ky-nang-so"]
       từ ../assets/quiz-bank-ky-nang-so.js (một nguồn duy nhất với trang thi thử)
     • mô đun đang làm lấy từ ?d=mo-dun-N (mặc định mô đun 1)
     • tiêu đề trang, tên môn, nhãn "Mô đun N — <chuyên đề>"
     • nút thoát quay về popup Lò ôn luyện
     • ghi lịch sử làm bài theo đúng môn + mô đun

   CÁCH DÙNG (chạy từ thư mục ky-nang-so/):
     node gen-luyen-tap.js
   Kết quả: ./luyen-tap.html
   ========================================================================= */
"use strict";

const fs = require("fs");
const path = require("path");

const HERE = __dirname;
const TEMPLATE = path.resolve(HERE, "..", "quan-tri-hoc", "TN-luyen-tap", "template-quiz.html");
const OUT = path.join(HERE, "luyen-tap.html");

const SLUG = "chung-chi-ky-nang-so";
const SUBJECT = "CHỨNG CHỈ KỸ NĂNG SỐ";
const CAT = "CHỨNG CHỈ";
const CAT_NAME = "Chứng chỉ";

const PART_NAMES = {
  "mo-dun-1": "Mô đun 1 — Khai thác dữ liệu và thông tin",
  "mo-dun-2": "Mô đun 2 — Giao tiếp và hợp tác trong môi trường số",
  "mo-dun-3": "Mô đun 3 — Sáng tạo nội dung số",
  "mo-dun-4": "Mô đun 4 — An toàn",
  "mo-dun-5": "Mô đun 5 — Giải quyết vấn đề",
  "mo-dun-6": "Mô đun 6 — Ứng dụng trí tuệ nhân tạo"
};

const safeJSON = (s) => JSON.stringify(String(s)).replace(/<\/script/gi, "<\\/script");

const namesBody = Object.keys(PART_NAMES)
  .map((id) => "    " + safeJSON(id) + ": " + safeJSON(PART_NAMES[id]))
  .join(",\n");

const bankBlock = `  /* ========================= CÂU HỎI =========================
     Nguồn: ../assets/quiz-bank-ky-nang-so.js — 360 câu, 6 mô đun × 60 câu.
     Mô đun đang làm lấy từ tham số ?d=mo-dun-N; thiếu hoặc sai thì mặc định mô đun đầu.
     Sinh tự động bởi gen-luyen-tap.js — không sửa tay. */
  const PART_NAMES = {
${namesBody}
  };

  const BANK = (function () {
    var src = (window.CK && CK.PART_QUIZ && CK.PART_QUIZ['${SLUG}']) || {};
    var out = {};
    Object.keys(PART_NAMES).forEach(function (id) {
      out[id] = (src[id] || []).map(function (q, i) {
        return { id: i + 1, text: q.q, options: q.o.slice(), correct: q.a };
      });
    });
    return out;
  })();

  const PART_PARAM = new URLSearchParams(location.search).get('d');
  const partId = Object.prototype.hasOwnProperty.call(BANK, PART_PARAM) ? PART_PARAM : Object.keys(BANK)[0];
  const QUESTIONS = BANK[partId];
`;

let html = fs.readFileSync(TEMPLATE, "utf8").replace(/\r\n/g, "\n");

function replaceOnce(hay, needle, repl, label) {
  const n = hay.split(needle).length - 1;
  if (n !== 1) throw new Error(label + ": cần đúng 1 chỗ khớp, thấy " + n);
  return hay.replace(needle, repl);
}

/* 1) Cấu hình: số câu + tên môn do dữ liệu quyết định */
html = replaceOnce(html,
  "  const CONFIG = {\n    questionCount: 10,             // số câu trong bộ đề (sinh tự động từ TEMPLATES)\n    candidateName: '',           // tên thí sinh hiển thị ở màn kết quả\n    subjectName: 'GT C01 - KTCT',// tên môn học hiển thị ở màn kết quả và trang xem đáp án",
  "  const CONFIG = {\n    questionCount: 0,              // = QUESTIONS.length, gán ngay sau khi nạp dữ liệu\n    candidateName: '',            // tên thí sinh hiển thị ở màn kết quả\n    subjectName: '',              // gán theo mô đun đang làm (xem bên dưới)",
  "CONFIG (đầu khối)");

/* 2) Thoát → quay lại popup chọn mô đun */
html = replaceOnce(html,
  "    exitUrl: null,                // đường dẫn sau khi xác nhận thoát (null = quay lại trang trước)\n" +
  "    onExit: null,                 // hàm tuỳ biến, ưu tiên hơn exitUrl (vd: gửi kết quả về server)",
  "    exitUrl: null,                // không dùng — xem onExit ngay dưới\n" +
  "    onExit: function () {         // xác nhận thoát: quay lại popup chọn mô đun\n" +
  "      if (window.history.length > 1) { window.history.back(); return; }\n" +
  "      window.location.href = '../index.html?m=" + SLUG + "&mode=learn#lb';\n" +
  "    },",
  "CONFIG (exitUrl/onExit)");

/* 3) Ghi lịch sử làm bài */
html = replaceOnce(html,
  "    onFinish: null                // nhận kết quả khi hoàn thành: ({ total, correct, score, wrongCount, seconds, ratio, name, subject, answers })",
  "    onFinish: function (r) {      // nhận kết quả khi hoàn thành: ({ total, correct, score, wrongCount, seconds, ratio, name, subject, answers })\n" +
  "      CK.recordHistory(r, {\n" +
  "        slug: '" + SLUG + "',\n" +
  "        part: partId,\n" +
  "        partName: PART_NAMES[partId],\n" +
  "        subject: '" + SUBJECT + "',\n" +
  "        cat: '" + CAT + "',\n" +
  "        catName: '" + CAT_NAME + "'\n" +
  "      });\n" +
  "    }",
  "CONFIG (onFinish)");

/* 4) Thay khối câu hỏi mẫu bằng khối đọc ngân hàng */
const startMarker = "  // Nội dung mẫu (thay bằng dữ liệu thật của bạn)\n";
const endMarker = "  });\n\nconst ICONS = {";
const start = html.indexOf(startMarker);
const end = html.indexOf(endMarker);
if (start < 0 || end < 0 || end < start) throw new Error("Không tìm thấy khối TEMPLATES/buildQuestions");
html = html.slice(0, start) + bankBlock + html.slice(end + "  });\n\n".length);

/* 5) Dùng đúng danh sách câu của mô đun + đổi tiêu đề theo mô đun */
html = replaceOnce(html,
  "  const ALL_QUESTIONS = buildQuestions(CONFIG.questionCount);",
  "  CONFIG.questionCount = QUESTIONS.length;\n" +
  "  CONFIG.subjectName = 'Chứng chỉ Kỹ năng số — ' + PART_NAMES[partId];\n" +
  "  document.title = PART_NAMES[partId] + ' — Chứng chỉ Kỹ năng số | CƠ KHÍ HUIT';\n\n" +
  "  const ALL_QUESTIONS = QUESTIONS;",
  "ALL_QUESTIONS");

/* 6) Tiêu đề tĩnh + favicon */
html = replaceOnce(html,
  "<title>Bài trắc nghiệm trực tuyến</title>",
  "<title>Chứng chỉ Kỹ năng số — Luyện tập | CƠ KHÍ HUIT</title>\n<link rel=\"icon\" href=\"../assets/logo.png\" />",
  "title");

/* 7) Nạp ngân hàng câu hỏi + lịch sử làm bài trước khi chạy */
html = replaceOnce(html,
  "<script>\n(() => {\n  'use strict';",
  "<script src=\"../assets/quiz-bank-ky-nang-so.js\"></script>\n" +
  "<script src=\"../assets/history.js\"></script>\n" +
  "<script>\n(() => {\n  'use strict';",
  "quiz-bank + history.js");

fs.writeFileSync(OUT, html, "utf8");
console.log("Đã ghi: " + OUT + " (" + fs.statSync(OUT).size + " bytes)");
console.log("Mô đun: " + Object.keys(PART_NAMES).length + " — " + Object.values(PART_NAMES).join(" · "));
