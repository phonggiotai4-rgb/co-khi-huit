/* ============================================================================
   KIỂM TRA ĐÁP ÁN QUẢN TRỊ HỌC — 3 PHẦN: ĐỀ CƯƠNG / LUYỆN TẬP / THI THỬ
   ----------------------------------------------------------------------------
   Chạy:  node tools/scripts/kiem-tra-dap-an-qth.js
           node tools/scripts/kiem-tra-dap-an-qth.js "FULL TN QTH 2024 HUIT.md"
           node tools/scripts/kiem-tra-dap-an-qth.js --skip-regen

   Mục đích:
     So sánh đáp án của 3 trang môn QUẢN TRỊ HỌC với nguồn chuẩn đã commit
     trong repo là file Markdown (sinh từ file Word của GV).

   Nguồn chuẩn:
     FULL TN QTH 2024 HUIT.md — 535 câu / 7 chương.
     (File .docx là nguồn gốc; .md là bản đã trích để tiện đối chiếu và diff.)

   3 nguồn dữ liệu trong app:
     1. XEM ĐỀ CƯƠNG   quan-tri-hoc/quiz.html
                       → CK.partQuiz() ← assets/quiz-bank.js
                          (CK.PART_QUIZ["quan-tri-hoc"])
     2. LUYỆN TẬP      quan-tri-hoc/luyen-tap.html
                       → `const BANK` NHÚNG SẴN trong file
                          (sinh bởi TN-luyen-tap/gen-luyen-tap.js)
     3. THI THỬ       quan-tri-hoc/thi-quan-tri-hoc-ngau-nhien.html
                       → CK.PART_QUIZ['quan-tri-hoc'], có lọc lại:
                         chỉ nhận câu có q.o.length === 4 và q.a là số 0..3

   Vì sao cần script này:
     Luyện tập giữ MỘT BẢN SAO câu hỏi nhúng sẵn trong file .html, tách rời
     khỏi assets/quiz-bank.js. Sửa quiz-bank.js mà quên chạy lại
     gen-luyen-tap.js thì Luyện tập sẽ lệch (Đề cương và Thi thử không bị).
     Script này bắt đúng trường hợp đó.

   Kiểm tra thêm (--skip-regen để tắt):
     Tái sinh luyen-tap.html từ template + .md ra thư mục tạm, rồi so khối
     BANK — chứng minh file đang commit y hệt cái generator sinh ra.

   Thoát:  0 = khớp hoàn toàn · 1 = có sai lệch
   ========================================================================= */
"use strict";

const path = require("path");
const fs = require("fs");
const os = require("os");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..", "..");
const LETTERS = ["a", "b", "c", "d"];

const args = process.argv.slice(2);
const SKIP_REGEN = args.includes("--skip-regen");
const MD_ARG = args.find((a) => !a.startsWith("--"));
const MD_PATH = path.resolve(ROOT, MD_ARG || "FULL TN QTH 2024 HUIT.md");

/* Chuẩn hoá để so trùng: bỏ dấu, bỏ dấu câu, gộp khoảng trắng, hạ chữ thường */
const fold = (s) =>
  String(s == null ? "" : s)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^\w\s]/g, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const pad = (s, n) => String(s == null ? "" : s).padEnd(n);
const line = (c = "=") => c.repeat(74);

/* ────────────────────────────────────────────────────────── 1. ĐỌC FILE .MD */
function readMD(file) {
  if (!fs.existsSync(file)) {
    console.error("Không tìm thấy file nguồn chuẩn: " + file);
    console.error("Chạy lại với đường dẫn .md tương đối so với thư mục gốc dự án.");
    process.exit(2);
  }
  const text = fs.readFileSync(file, "utf8");
  const chapters = [];
  let ch = null, q = null;

  text.split(/\r?\n/).forEach((ln) => {
    let m = ln.match(/^## Chương (\d+)\.\s*(.*)$/);
    if (m) {
      ch = { n: Number(m[1]), title: m[2].trim(), qs: [] };
      chapters.push(ch);
      q = null;
      return;
    }
    m = ln.match(/^### Câu (\d+)\.\s*(.*)$/);
    if (m && ch) {
      q = { n: Number(m[1]), stem: m[2].trim(), opts: [], ans: null };
      ch.qs.push(q);
      return;
    }
    m = ln.match(/^- ([a-d])\.\s+(.*)$/);
    if (m && q) {
      q.opts.push({ letter: m[1], text: m[2].replace(/\*\*/g, "").trim() });
      return;
    }
    m = ln.match(/^\*\*Đáp án:\s*([a-d])\*\*$/);
    if (m && q) q.ans = m[1];
  });
  return chapters;
}

/* ─────────────────────────────────── 2. TRÍCH `const BANK` KHỎI FILE .HTML */
function extractBankLiteral(html) {
  const start = html.indexOf("const BANK = {");
  if (start < 0) throw new Error("không tìm thấy `const BANK = {`");
  const open = html.indexOf("{", start);
  let depth = 0, end = -1, inStr = null, esc = false;
  for (let i = open; i < html.length; i++) {
    const c = html[i];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (c === "\\") { esc = true; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end < 0) throw new Error("dấu ngoặc trong `const BANK` không cân");
  return html.slice(open, end + 1);
}

/* ──────────────────────────────────────────────── 3. NẠP 3 NGUỒN DỮ LIỆU */
global.window = global;
global.CK = global.CK || {};
require(path.join(ROOT, "assets", "data.js"));
require(path.join(ROOT, "assets", "quiz-bank.js"));
const CK = global.CK;

const PART_QUIZ = (CK.PART_QUIZ && CK.PART_QUIZ["quan-tri-hoc"]) || {};

const LT_PATH = path.join(ROOT, "quan-tri-hoc", "luyen-tap.html");
const ltHtml = fs.readFileSync(LT_PATH, "utf8");
/* eval khối literal trong file .html — an toàn vì file do chính repo sinh ra.
   Bọc try/catch: file .html hỏng cú pháp (sửa tay) thì báo lỗi rõ ràng
   thay vì để Node in stack trace. */
let LT_BANK;
try {
  LT_BANK = eval("(" + extractBankLiteral(ltHtml) + ")");
} catch (e) {
  console.error("Không đọc được khối `const BANK` trong quan-tri-hoc/luyen-tap.html");
  console.error("  " + String(e.message).split("\n")[0]);
  console.error("  → File .html bị hỏng cú pháp (thường do sửa tay).");
  console.error("    Hãy sinh lại: node quan-tri-hoc/TN-luyen-tap/gen-luyen-tap.js <json>");
  process.exit(1);
}

/* Lọc y hệt trang Thi thử (thi-quan-tri-hoc-ngau-nhien.html, dòng 595-608) */
const EXAM = [];
const EXAM_DROPPED = [];
Object.keys(PART_QUIZ).forEach((pid, k) => {
  const ch = parseInt(String(pid).replace(/^.*-(\d+)$/, "$1"), 10);
  (PART_QUIZ[pid] || []).forEach((q, i) => {
    if (q && q.q && q.o && q.o.length === 4 &&
        typeof q.a === "number" && q.a >= 0 && q.a <= 3) {
      EXAM.push({ t: String(q.q).trim(), o: q.o.map(String), c: q.a, s: isFinite(ch) ? ch : k + 1 });
    } else {
      EXAM_DROPPED.push({ pid, i: i + 1 });
    }
  });
});

/* ──────────────────────────────────────────────────── 4. HÀM SO SÁNH CHUNG */
function toShape(list, getStem, getOpts, getAns) {
  const out = {};
  Object.keys(list).forEach((cid) => {
    out[cid] = list[cid].map((q) => ({
      stem: getStem(q),
      opts: getOpts(q),
      ans: getAns(q),
    }));
  });
  return out;
}

const SHAPES = {
  "XEM ĐỀ CƯƠNG": {
    file: "quan-tri-hoc/quiz.html  ←  assets/quiz-bank.js",
    data: toShape(PART_QUIZ, (q) => String(q.q).trim(), (q) => (q.o || []).map(String),
      (q) => (typeof q.a === "number" && q.a >= 0 && q.a < 4 ? LETTERS[q.a] : "?")),
  },
  "LUYỆN TẬP": {
    file: "quan-tri-hoc/luyen-tap.html  (const BANK nhúng sẵn)",
    data: toShape(LT_BANK, (q) => String(q.text).trim(), (q) => (q.options || []).map(String),
      (q) => (typeof q.correct === "number" && q.correct >= 0 && q.correct < 4 ? LETTERS[q.correct] : "?")),
  },
  "THI THỬ": {
    file: "quan-tri-hoc/thi-quan-tri-hoc-ngau-nhien.html  ←  CK.PART_QUIZ['quan-tri-hoc']",
    data: (() => {
      const o = {};
      EXAM.forEach((q) => {
        o[q.s] = o[q.s] || [];
        o[q.s].push({ stem: q.t, opts: q.o, ans: LETTERS[q.c] });
      });
      return o;
    })(),
  },
};

/* Chuẩn hoá khoá chương về số để mọi nguồn so sánh được với nhau:
   "chuong-3" và 3 đều thành 3. */
Object.keys(SHAPES).forEach((n) => {
  const out = {};
  Object.keys(SHAPES[n].data).forEach((cid) => {
    out[Number(String(cid).split("-").pop())] = SHAPES[n].data[cid];
  });
  SHAPES[n].data = out;
});

const MD = readMD(MD_PATH);
const MD_BY_CH = {};
MD.forEach((c) => { MD_BY_CH[c.n] = c.qs; });

function compare(name, shape) {
  console.log(line());
  console.log(name + "  —  " + shape.file);
  console.log(line());
  const problems = [];
  let checked = 0, ok = 0;
  const perCh = [];

  Object.keys(shape.data).sort((a, b) => a - b).forEach((cid) => {
    const cn = Number(cid);
    const name = "chuong-" + cn;
    const qs = shape.data[cid];
    const ref = MD_BY_CH[cn] || [];
    let chOk = 0;

    if (qs.length !== ref.length) {
      problems.push(`  ${name}: nguồn có ${qs.length} câu, .md có ${ref.length} câu`);
    }

    /* bản tra cứu để biết câu bị đảo thứ tự hay thực sự sai */
    const index = new Map();
    qs.forEach((q, i) => index.set(fold(q.stem) + "|" + q.opts.map(fold).join("|"), i));

    qs.forEach((q, i) => {
      checked++;
      const at = `${name} câu ${i + 1}`;
      if (i >= ref.length) {
        problems.push(`  ${at}: không có trong .md`);
        return;
      }
      const m = ref[i];

      if (fold(q.stem) !== fold(m.stem)) {
        const j = index.get(fold(q.stem) + "|" + q.opts.map(fold).join("|"));
        if (j !== undefined && j !== i) {
          problems.push(`  ${at}: SAI THỨ TỰ — trong .md là câu ${j + 1}`);
        } else {
          problems.push(`  ${at}: CÂU HỎI KHÁC .md\n` +
            `      nguồn: ${q.stem.slice(0, 86)}\n` +
            `      .md  : ${m.stem.slice(0, 86)}`);
        }
        return;
      }
      const so = q.opts.map(fold), mo = m.opts.map((o) => fold(o.text));
      if (so.length !== mo.length || so.some((v, k) => v !== mo[k])) {
        problems.push(`  ${at}: PHƯƠNG ÁN KHÁC .md\n` +
          `      nguồn: ${JSON.stringify(q.opts).slice(0, 150)}\n` +
          `      .md  : ${JSON.stringify(m.opts.map((o) => o.text)).slice(0, 150)}`);
        return;
      }
      if (q.ans !== m.ans) {
        const idx = LETTERS.indexOf(m.ans);
        problems.push(`  ${at}: ĐÁP ÁN LỆCH — nguồn=${q.ans}, .md=${m.ans}\n` +
          `      câu : ${m.stem.slice(0, 86)}\n` +
          `      PA đúng theo .md: ${idx >= 0 ? m.opts[idx].text.slice(0, 86) : "?"}`);
        return;
      }
      ok++; chOk++;
    });
    perCh.push({ cid: name, n: qs.length, ok: chOk, ref: ref.length });
  });

  console.log(pad("  chương", 12) + pad("câu", 7) + pad("khớp", 7) + "kết quả");
  perCh.forEach((r) => {
    const good = r.n === r.ok && r.n === r.ref;
    console.log("  " + pad(r.cid, 10) + pad(r.n, 7) + pad(r.ok, 7) +
      (good ? "OK" : "LỆCH (" + (r.n - r.ok) + " câu)"));
  });
  console.log("");
  console.log("  Tổng khớp: " + ok + "/" + checked +
    (checked === MD.reduce((s, c) => s + c.qs.length, 0) ? "" : "   [cảnh báo: khác số câu trong .md]"));
  if (problems.length) {
    console.log("  SAI LỆCH (" + problems.length + "):");
    problems.slice(0, 25).forEach((p) => console.log(p));
    if (problems.length > 25) console.log("  ... và " + (problems.length - 25) + " sai lệch khác");
  } else {
    console.log("  SAI LỆCH: 0 — khớp hoàn toàn với .md");
  }
  console.log("");
  return problems.length;
}

/* ─────────────────────────────────────────────── 5. SO SÁNH 3 NGUỒN LẫN NHAU */
function crossCheck() {
  console.log(line());
  console.log("SO SÁNH 3 NGUỒN LẪN NHAU");
  console.log(line());
  const names = Object.keys(SHAPES);
  const diffs = [];
  const cn = Object.keys(SHAPES[names[0]].data);
  cn.forEach((cid) => {
    const len = Math.max(...names.map((n) => (SHAPES[n].data[cid] || []).length));
    for (let i = 0; i < len; i++) {
      const answers = names.map((n) => {
        const arr = SHAPES[n].data[cid] || [];
        return arr[i] ? arr[i].ans : "-";
      });
      if (new Set(answers).size > 1) {
        diffs.push(`  chuong-${cid} câu ${i + 1}: ` +
          names.map((n, k) => n + "=" + answers[k]).join("  "));
      }
    }
  });
  console.log("  câu lệch đáp án giữa 3 nguồn: " + diffs.length);
  diffs.slice(0, 20).forEach((d) => console.log(d));
  console.log("");
  return diffs.length;
}

/* ───────────────────────── 6. TÁI SINH luyen-tap.html TỪ .MD (tùy chọn) */
function regenCheck() {
  console.log(line());
  console.log("TÁI SINH luyen-tap.html TỪ .MD  (kiểm tra bản sinh tự động)");
  console.log(line());
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "qth-regen-"));
  const json = path.join(tmpDir, "qth-parsed.json");
  const outHtml = path.join(tmpDir, "luyen-tap.html");

  const bank = {};
  MD.forEach((c) => {
    bank["chuong-" + c.n] = c.qs.map((q) => ({
      q: q.stem,
      o: q.opts.map((o) => o.text),
      a: LETTERS.indexOf(q.ans),
    }));
  });
  fs.writeFileSync(json, JSON.stringify(bank), "utf8");

  try {
    execFileSync(process.execPath,
      [path.join(ROOT, "quan-tri-hoc", "TN-luyen-tap", "gen-luyen-tap.js"), json, outHtml],
      { stdio: "pipe" });
  } catch (e) {
    console.log("  Không chạy được gen-luyen-tap.js: " + String(e.message).split("\n")[0]);
    console.log("");
    return 0;
  }

  const regen = fs.readFileSync(outHtml, "utf8");
  let A, B;
  try {
    A = eval("(" + extractBankLiteral(ltHtml) + ")");
    B = eval("(" + extractBankLiteral(regen) + ")");
  } catch (e) {
    console.log("  Không đọc được khối BANK: " + String(e.message).split("\n")[0]);
    console.log("");
    return 1;
  }

  let diff = 0;
  const keys = new Set([...Object.keys(A), ...Object.keys(B)]);
  keys.forEach((cid) => {
    const a = A[cid] || [], b = B[cid] || [];
    if (a.length !== b.length) {
      console.log(`  ! ${cid}: file đang commit có ${a.length} câu, bản tái sinh có ${b.length}`);
      diff += Math.abs(a.length - b.length);
      return;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i].id !== b[i].id || a[i].text !== b[i].text ||
          JSON.stringify(a[i].options) !== JSON.stringify(b[i].options) ||
          a[i].correct !== b[i].correct) {
        diff++;
        if (diff <= 10) {
          console.log(`  ! ${cid} câu ${i + 1}: commit correct=${a[i].correct} / tái sinh correct=${b[i].correct}`);
          console.log(`      commit: ${String(a[i].text).slice(0, 80)}`);
          console.log(`      tái sinh: ${String(b[i].text).slice(0, 80)}`);
        }
      }
    }
  });
  console.log("  câu lệch giữa file đang commit và bản tái sinh: " + diff);
  if (diff === 0) {
    console.log("  OK — luyen-tap.html đúng bằng cái gen-luyen-tap.js sinh ra từ .md.");
  } else {
    console.log("  → Chạy lại: node quan-tri-hoc/TN-luyen-tap/gen-luyen-tap.js <json>");
  }
  console.log("");
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) { /* bỏ qua */ }
  return diff;
}

/* ─────────────────────────────────────────────────────────────── 6. CHẠY */
console.log(line());
console.log("KIỂM TRA ĐÁP ÁN QUẢN TRỊ HỌC — ĐỀ CƯƠNG / LUYỆN TẬP / THI THỬ");
console.log(line());
console.log("Nguồn chuẩn : " + path.relative(ROOT, MD_PATH));
const totalMd = MD.reduce((s, c) => s + c.qs.length, 0);
console.log("Số câu .md   : " + totalMd + " / " + MD.length + " chương");
console.log("");

let errs = 0;
Object.keys(SHAPES).forEach((n) => { errs += compare(n, SHAPES[n]); });
errs += crossCheck();

if (!SKIP_REGEN) errs += regenCheck();

console.log(line());
console.log("TỔNG KẾT");
console.log(line());
console.log("  Câu hỏi Thi thử bị bộ lọc loại bỏ: " + EXAM_DROPPED.length +
  (EXAM_DROPPED.length ? "  ← kiểm tra lại" : ""));
console.log("  Tổng số sai lệch: " + errs);
if (!errs) {
  console.log("  ✔ Cả 3 phần khớp hoàn toàn với " + path.basename(MD_PATH) + ".");
  process.exit(0);
} else {
  console.log("  ✘ Có " + errs + " sai lệch cần sửa.");
  process.exit(1);
}
