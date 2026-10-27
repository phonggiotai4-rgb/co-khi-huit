/* ============================================================================
   CƠ KHÍ HUIT — TẢI SINH lich-su-dang-cong-san-viet-nam/luyen-tap.html TỪ JSON CÂU HỎI
   ----------------------------------------------------------------------------
   Bản luyen-tap.html được sinh từ template-quiz.html (cùng thư mục) theo đúng
   hướng dẫn trong nap-cau-hoi.md: giữ nguyên toàn bộ giao diện, chỉ thay khối
   dữ liệu câu hỏi. Script này làm lại thao tác đó một cách tự động.

   CÁCH DÙNG (cần Node.js, không cần cài gì thêm):
     node gen-luyen-tap.js <questions.json> [output.html]

   • questions.json — đầu ra của bước trích .docx (lich-su-dang-cong-san-viet-nam-questions.json);
     dạng: { "chuong-1": [ { "id", "text", "options", "correct" } ], ... }
   • output.html — mặc định ../luyen-tap.html
   • Chạy lại script rồi kiểm tra bằng tests/run.js (xem README của template).

   KHÔNG sửa tay luyen-tap.html rồi chạy lại script này — mọi thay đổi sẽ mất.
   Muốn đổi cách tính điểm/giao diện: sửa template-quiz.html, rồi sinh lại.
   ========================================================================= */
"use strict";

const fs = require("fs");
const path = require("path");

const HERE = __dirname;
const TEMPLATE = path.join(HERE, "template-quiz.html");
const DEFAULT_OUT = path.join(HERE, "..", "luyen-tap.html");

/* Tên hiển thị của từng chương (khoá = tên khoá trong JSON) */
const PART_NAMES = {
  "chuong-1": "Chương 1",
  "chuong-2": "Chương 2",
  "chuong-3": "Chương 3"
};

const input = process.argv[2];
const output = process.argv[3] || DEFAULT_OUT;

if (!input) {
  console.error("Cách dùng: node gen-luyen-tap.js <questions.json> [output.html]");
  process.exit(2);
}

const bank = JSON.parse(fs.readFileSync(input, "utf8"));
const ids = Object.keys(bank);
if (!ids.length) throw new Error("JSON không có chương nào");

let total = 0;
ids.forEach((id) => {
  const list = bank[id];
  if (!Array.isArray(list)) throw new Error(id + ": không phải mảng câu hỏi");
  total += list.length;
  list.forEach((it, i) => {
    const where = id + " câu " + (i + 1);
    if (!it.q && !it.text) throw new Error(where + ": thiếu nội dung");
    if (!Array.isArray(it.o || it.options) || (it.o || it.options).length < 2 || (it.o || it.options).length > 6) {
      throw new Error(where + ": cần 2–6 phương án");
    }
    if (typeof (it.a != null ? it.a : it.correct) !== "number" ||
        (it.a != null ? it.a : it.correct) < 0 ||
        (it.a != null ? it.a : it.correct) >= (it.o || it.options).length) {
      throw new Error(where + ": đáp án ngoài phạm vi phương án");
    }
  });
});

/* Chuỗi nhúng vào <script> phải không chứa "</script" (kể cả trong nội dung) */
const safeJSON = (s) => JSON.stringify(String(s)).replace(/<\/script/gi, "<\\/script");

const norm = (it) => ({ q: it.q || it.text, o: it.o || it.options, a: it.a != null ? it.a : it.correct });

const bankBody = ids.map((id) => {
  const rows = bank[id].map((raw, i) => {
    const it = norm(raw);
    return "      { id: " + (i + 1) +
    ", text: " + safeJSON(it.q) +
    ", options: [" + it.o.map(safeJSON).join(", ") + "]" +
    ", correct: " + it.a + " }";
  }).join(",\n");
  return "    " + safeJSON(id) + ": [\n" + rows + "\n    ]";
}).join(",\n");

const namesBody = ids.map((id) => "    " + safeJSON(id) + ": " + safeJSON(PART_NAMES[id] || id)).join(",\n");

const bankBlock = `  /* ========================= CÂU HỎI =========================
     Nguồn: ${path.basename(input)} — ${total} câu, ${ids.length} chương.
     Chương đang làm lấy từ tham số ?d=chuong-N; thiếu hoặc sai thì mặc định chương đầu.
     Sinh tự động bởi TN-luyen-tap/gen-luyen-tap.js — không sửa tay. */
  const PART_NAMES = {
${namesBody}
  };

  const BANK = {
${bankBody}
  };

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

html = replaceOnce(html,
  "  const CONFIG = {\n    questionCount: 10,             // số câu trong bộ đề (sinh tự động từ TEMPLATES)\n    candidateName: '',           // tên thí sinh hiển thị ở màn kết quả\n    subjectName: 'GT C01 - KTCT',// tên môn học hiển thị ở màn kết quả và trang xem đáp án",
  "  const CONFIG = {\n    questionCount: 0,              // = QUESTIONS.length, gán ngay sau khi nạp dữ liệu\n    candidateName: '',            // tên thí sinh hiển thị ở màn kết quả\n    subjectName: '',              // gán theo chương đang làm (xem bên dưới)",
  "CONFIG (đầu khối)");

html = replaceOnce(html,
  "    exitUrl: null,                // đường dẫn sau khi xác nhận thoát (null = quay lại trang trước)\n" +
  "    onExit: null,                 // hàm tuỳ biến, ưu tiên hơn exitUrl (vd: gửi kết quả về server)",
  "    exitUrl: null,                // không dùng — xem onExit ngay dưới\n" +
  "    onExit: function () {         // xác nhận thoát: quay lại popup chọn chương\n" +
  "      if (window.history.length > 1) { window.history.back(); return; }\n" +
  "      window.location.href = '../index.html?m=lich-su-dang-cong-san-viet-nam&mode=learn#lb';\n" +
  "    },",
  "CONFIG (exitUrl/onExit)");

html = replaceOnce(html,
  "    onFinish: null                // nhận kết quả khi hoàn thành: ({ total, correct, score, wrongCount, seconds, ratio, name, subject, answers })",
  "    onFinish: function (r) {      // nhận kết quả khi hoàn thành: ({ total, correct, score, wrongCount, seconds, ratio, name, subject, answers })\n" +
  "      CK.recordHistory(r, {\n" +
  "        slug: 'lich-su-dang-cong-san-viet-nam',\n" +
  "        part: partId,\n" +
  "        partName: PART_NAMES[partId],\n" +
  "        subject: 'LỊCH SỬ ĐẢNG CỘNG SẢN VIỆT NAM',\n" +
  "        cat: 'ĐẠI CƯƠNG LÝ LUẬN CHÍNH TRỊ & MÔN KHÁC',\n" +
  "        catName: 'Đại cương lý luận chính trị & môn khác'\n" +
  "      });\n" +
  "    }",
  "CONFIG (onFinish)");

const startMarker = "  // Nội dung mẫu (thay bằng dữ liệu thật của bạn)\n";
const endMarker = "  });\n\nconst ICONS = {";
const start = html.indexOf(startMarker);
const end = html.indexOf(endMarker);
if (start < 0 || end < 0 || end < start) throw new Error("Không tìm thấy khối TEMPLATES/buildQuestions");
html = html.slice(0, start) + bankBlock + html.slice(end + "  });\n\n".length);

html = replaceOnce(html,
  "  const ALL_QUESTIONS = buildQuestions(CONFIG.questionCount);",
  "  CONFIG.questionCount = QUESTIONS.length;\n" +
  "  CONFIG.subjectName = 'Lịch sử Đảng Cộng sản Việt Nam — ' + PART_NAMES[partId];\n" +
  "  document.title = PART_NAMES[partId] + ' — Lịch sử Đảng Cộng sản Việt Nam | CƠ KHÍ HUIT';\n\n" +
  "  const ALL_QUESTIONS = QUESTIONS;",
  "ALL_QUESTIONS");

html = replaceOnce(html,
  "<title>Bài trắc nghiệm trực tuyến</title>",
  "<title>Lịch sử Đảng Cộng sản Việt Nam — Luyện tập | CƠ KHÍ HUIT</title>\n<link rel=\"icon\" href=\"../assets/logo.png\" />",
  "title");

html = replaceOnce(html,
  "<script>\n(() => {\n  'use strict';",
  "<script src=\"../assets/history.js\"></script>\n<script>\n(() => {\n  'use strict';",
  "history.js");

fs.writeFileSync(output, html, "utf8");

const counts = ids.map((id) => id + "=" + bank[id].length).join(", ");
console.log("Đã ghi: " + output);
console.log("Số câu: " + total + " (" + counts + ")");
