/* ============================================================================
   CƠ KHÍ HUIT — SINH NGÂN HÀNG CÂU HỎI CHỨNG CHỈ KỸ NĂNG SỐ
   ----------------------------------------------------------------------------
   Nguồn: ../360 CÂU KỸ NĂNG SỐ.docx  (6 mô đun × 60 câu = 360 câu)

   Cách xác định đáp án đúng:
     • Phần lớn câu: phương án đúng được TÔ SÁNG (highlight) trong file Word.
     • Mô đun 3, câu 11–60: file không tô sáng mà có bảng "ĐÁP ÁN" ở cuối
       mô đun 3 → đọc từ bảng.
     • Mô đun 6 câu 49: file thiếu cả hai → lấy theo bài giảng
       ("Cấu trúc prompt gồm tám thành phần").

   Kết quả: ../assets/quiz-bank-ky-nang-so.js
     CK.PART_QUIZ["chung-chi-ky-nang-so"]["mo-dun-1"…"mo-dun-6"]

   CÁCH DÙNG (chạy từ thư mục ky-nang-so/):
     node gen-quiz-bank.js
   ========================================================================= */
"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const HERE = __dirname;
const SITE = path.resolve(HERE, "..");
const DOCX = path.join(SITE, "360 CÂU KỸ NĂNG SỐ.docx");
const OUT = path.join(SITE, "assets", "quiz-bank-ky-nang-so.js");

/* ── 1. Đọc word/document.xml từ file .docx (ZIP) ────────────────────────── */
function readZipEntry(buf, wanted) {
  // End of central directory
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i > buf.length - 70000; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("Không tìm thấy EOCD trong file .docx");

  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);

  for (let k = 0; k < count; k++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error("Central directory hỏng");
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOff = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nameLen);

    if (name === wanted) {
      const lNameLen = buf.readUInt16LE(localOff + 26);
      const lExtraLen = buf.readUInt16LE(localOff + 28);
      const dataOff = localOff + 30 + lNameLen + lExtraLen;
      const data = buf.subarray(dataOff, dataOff + compSize);
      return method === 0 ? data : zlib.inflateRawSync(data);
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error("Không tìm thấy " + wanted + " trong .docx");
}

const xml = readZipEntry(fs.readFileSync(DOCX), "word/document.xml").toString("utf8");

/* ── 2. Tách đoạn văn + đánh dấu đoạn có chữ tô sáng ────────────────────── */
function decode(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
          .replace(/&amp;/g, "&");
}
function textOf(frag) {
  return [...frag.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join("");
}

const paras = xml.split(/<w:p(?:\s[^>]*)?>/).slice(1).map(p => {
  const runs = [...p.matchAll(/<w:r(?:\s[^>]*)?>([\s\S]*?)<\/w:r>/g)].map(m => ({
    text: textOf(m[1]),
    hl: /<w:highlight /.test(m[1])
  }));
  return {
    text: decode(runs.map(r => r.text).join("")).replace(/\s+/g, " ").trim(),
    hlText: decode(runs.filter(r => r.hl).map(r => r.text).join("")).replace(/\s+/g, " ").trim()
  };
});

/* ── 3. Bảng "ĐÁP ÁN" của mô đun 3 (câu 11–60) ──────────────────────────── */
function readAnswerTable() {
  const t = xml.indexOf("<w:tbl");
  const te = xml.indexOf("</w:tbl>", t);
  if (t < 0 || te < 0) return {};
  const rows = xml.slice(t, te).split(/<w:tr(?:\s[^>]*)?>/).slice(1);
  const key = {};
  rows.forEach(r => {
    const cells = r.split(/<w:tc(?:\s[^>]*)?>/).slice(1)
      .map(c => decode(textOf(c.split("</w:tc>")[0])).trim());
    for (let i = 0; i + 1 < cells.length; i += 2) {
      const n = parseInt(cells[i], 10);
      const a = cells[i + 1];
      if (isFinite(n) && /^[A-D]$/.test(a)) key[n] = "ABCD".indexOf(a);
    }
  });
  return key;
}
const ANSWER_TABLE = readAnswerTable();

/* ── 4. Tách câu hỏi theo mô đun ────────────────────────────────────────── */
const MODULE_TITLES = [
  "Khai thác dữ liệu và thông tin",
  "Giao tiếp và hợp tác trong môi trường số",
  "Sáng tạo nội dung số",
  "An toàn",
  "Giải quyết vấn đề",
  "Ứng dụng trí tuệ nhân tạo"
];

/* Vị trí các dòng tiêu đề mô đun và bảng đáp án — kiểm tra lại để script
   báo lỗi nếu file Word đổi cấu trúc thay vì âm thầm cắt sai. */
const STARTS = [];
paras.forEach((p, i) => {
  if (/^(?:TN_)?MODULE\s*\d+\b/i.test(p.text) || /^MODULE\s*\d+\s*:/i.test(p.text)) STARTS.push(i);
});
const ANSWER_ROW = paras.findIndex(p => /^ĐÁP ÁN$/i.test(p.text));

if (STARTS.length !== 6) throw new Error("Cần 6 tiêu đề mô đun, tìm thấy " + STARTS.length);
if (ANSWER_ROW < 0) throw new Error("Không tìm thấy dòng ĐÁP ÁN");

/* Bảng đáp án nằm ngay sau mô đun 3: bỏ qua các đoạn thuộc bảng này. */
const tableParas = new Set([ANSWER_ROW]);
for (let i = ANSWER_ROW + 1; i < paras.length; i++) {
  const t = paras[i].text;
  if (/^TN_MODULE\s*4\b/i.test(t) || /^MODULE\s*4\b/i.test(t)) break;
  tableParas.add(i);
}

const modules = MODULE_TITLES.map((title, k) => ({
  id: "mo-dun-" + (k + 1),
  title,
  questions: []
}));

let mod = -1, q = null;
for (let i = 0; i < paras.length; i++) {
  const si = STARTS.indexOf(i);
  if (si >= 0) { mod = si; q = null; continue; }
  if (mod < 0 || tableParas.has(i)) continue;

  const t = paras[i].text;
  if (!t) continue;

  const qm = t.match(/^Câu\s+(\d+)\s*[:.]\s*([\s\S]*)$/i);
  if (qm) {
    q = { n: +qm[1], q: qm[2].trim(), o: [], a: -1 };
    modules[mod].questions.push(q);
    continue;
  }
  const om = t.match(/^([A-D])[.)]\s*([\s\S]*)$/);
  if (om && q) {
    q.o.push(om[2].trim());
    if (paras[i].hlText) q.a = q.o.length - 1;
    continue;
  }
  if (q) throw new Error("Đoạn lạ trong câu " + q.n + " (mô đun " + (mod + 1) + "): " + t.slice(0, 60));
}

/* ── 5. Bù đáp án còn thiếu + kiểm tra ──────────────────────────────────── */
const M3 = modules[2];
M3.questions.forEach(x => {
  if (x.a >= 0) return;
  if (Object.prototype.hasOwnProperty.call(ANSWER_TABLE, x.n)) x.a = ANSWER_TABLE[x.n];
});

/* Mô đun 6 câu 49 — "Cấu trúc prompt hoàn chỉnh có bao nhiêu thành phần?"
   Bài giảng Mô đun 6: "Cấu trúc prompt gồm tám thành phần" → phương án D ("8"). */
const m6q49 = modules[5].questions.find(x => x.n === 49);
if (!m6q49) throw new Error("Không tìm thấy câu 49 của mô đun 6");
if (m6q49.o[m6q49.a] !== "8") {
  const idx = m6q49.o.indexOf("8");
  if (idx < 0) throw new Error("Mô đun 6 câu 49: không có phương án '8'");
  m6q49.a = idx;
}

let total = 0;
modules.forEach(m => {
  if (m.questions.length !== 60) throw new Error(m.id + ": cần 60 câu, có " + m.questions.length);
  m.questions.forEach((x, i) => {
    if (x.n !== i + 1) throw new Error(m.id + ": số câu không liên tục tại câu " + (i + 1));
    if (x.o.length !== 4) throw new Error(m.id + " câu " + x.n + ": cần 4 phương án, có " + x.o.length);
    if (x.a < 0 || x.a > 3) throw new Error(m.id + " câu " + x.n + ": chưa xác định đáp án đúng");
    if (!x.q) throw new Error(m.id + " câu " + x.n + ": thiếu nội dung");
    total++;
  });
});

/* ── 6. Ghi assets/quiz-bank-ky-nang-so.js ──────────────────────────────── */
const js = (v) => JSON.stringify(v);

const body = modules.map(m => {
  const rows = m.questions.map(x =>
    "      { q: " + js(x.q) + ",\n" +
    "        o: [" + x.o.map(js).join(", ") + "], a: " + x.a + " }"
  ).join(",\n");
  return "    /* " + m.title + " — " + m.questions.length + " câu */\n" +
         "    " + js(m.id) + ": [\n" + rows + "\n    ]";
}).join(",\n\n");

const out = `/* ============================================================================
   CƠ KHÍ HUIT — NGÂN HÀNG CÂU HỎI CHỨNG CHỈ KỸ NĂNG SỐ
   ----------------------------------------------------------------------------
   Nguồn: "360 CÂU KỸ NĂNG SỐ.docx" — 6 mô đun × 60 câu = ${total} câu.
   Sinh tự động bởi ky-nang-so/gen-quiz-bank.js — KHÔNG sửa tay.

   Cấu trúc: CK.PART_QUIZ["chung-chi-ky-nang-so"]["mo-dun-N"] = [
               { q: "câu hỏi", o: ["A", "B", "C", "D"], a: <chỉ số đáp án 0-3> },
               …
             ]

   Dùng cho:
     • ky-nang-so/luyen-tap.html                     — luyện tập theo mô đun
     • ky-nang-so/thi-chung-chi-ky-nang-so-ngau-nhien.html — thi thử 40 câu / 60 phút

   Nạp SAU assets/quiz-bank.js (file này tự tạo CK.PART_QUIZ nếu chưa có).
   ========================================================================= */
(function (g) {
  "use strict";
  g.CK = g.CK || {};
  g.CK.PART_QUIZ = g.CK.PART_QUIZ || {};

  g.CK.PART_QUIZ["chung-chi-ky-nang-so"] = {
${body}
  };
})(window);
`;

fs.writeFileSync(OUT, out, "utf8");
console.log("Đã ghi: " + OUT + " (" + fs.statSync(OUT).size + " bytes)");
console.log("Tổng số câu: " + total + " (" + modules.map(m => m.id + "=" + m.questions.length).join(", ") + ")");
