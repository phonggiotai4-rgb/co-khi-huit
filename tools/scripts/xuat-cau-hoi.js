/* ============================================================================
   XUẤT CÂU HỎI QPAN 1 RA FILE ĐỂ SOẠN LỜI GIẢI
   ----------------------------------------------------------------------------
   Chạy:  node tools/scripts/xuat-cau-hoi.js de-2
   Ghi ra: %TEMP%\de-2.txt   (mở bằng Notepad hoặc VS Code để đọc)

   Vì sao cần script này:
     - PowerShell Get-Content hay làm hỏng tiếng Việt khi in ra console.
     - File .txt ghi bằng UTF-8 thì đọc lại được nguyên vẹn.
     - Cần biết chính xác câu nào trùng câu đã soạn rồi để khỏi viết lại.
   ========================================================================= */
"use strict";

const path = require("path");
const fs = require("fs");
const ROOT = path.join(__dirname, "..", "..");

global.window = global;
global.CK = global.CK || {};

require(path.join(ROOT, "assets", "data.js"));
require(path.join(ROOT, "assets", "quiz-bank.js"));
require(path.join(ROOT, "assets", "qpan1-explanations.js"));

const CK = global.CK;
const LETTERS = ["A", "B", "C", "D"];

const want = process.argv[2] || "de-2";

/* Chuẩn hoá để so trùng: bỏ dấu, bỏ khoảng trắng thừa, hạ chữ thường */
const fold = (s) => String(s || "")
  .toLowerCase()
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[đĐ]/g, "d")
  .replace(/[^a-z0-9]+/g, "")
  .trim();

/* Bản đồ câu đã có lời giải, để đánh dấu câu trùng */
const done = new Map();
Object.keys(CK.PART_QUIZ.qpan1).forEach((pid) => {
  CK.PART_QUIZ.qpan1[pid].forEach((q, i) => {
    if (q.e && String(q.e).trim()) done.set(fold(q.q), pid + "-" + (i + 1));
  });
});

const list = CK.PART_QUIZ.qpan1[want];
if (!list) {
  console.error("Không có đề " + want);
  console.error("Các đề có sẵn: " + Object.keys(CK.PART_QUIZ.qpan1).join(", "));
  process.exit(1);
}

const out = [];
out.push("ĐỀ " + String(want).replace("de-", "") + " — " + list.length + " câu");
out.push("Dấu * = đáp án đúng. Dấu ~ = câu đã có lời giải ở đề khác.");
out.push("=".repeat(70));

list.forEach((q, i) => {
  const dup = done.get(fold(q.q));
  out.push("");
  out.push("[" + (i + 1) + "]" + (dup ? "  ~xem " + dup : "") + "  => " + LETTERS[q.a]);
  out.push("Q: " + q.q);
  q.o.forEach((o, k) => out.push("  " + LETTERS[k] + (k === q.a ? "*" : " ") + " " + o));
});

const file = path.join(process.env.TEMP, want + ".txt");
fs.writeFileSync(file, out.join("\n"), "utf8");

const nDup = list.filter((q) => done.get(fold(q.q))).length;
console.log("Đã ghi: " + file);
console.log("Số câu: " + list.length + " | trùng đề khác: " + nDup +
            " | cần soạn mới: " + (list.length - nDup));