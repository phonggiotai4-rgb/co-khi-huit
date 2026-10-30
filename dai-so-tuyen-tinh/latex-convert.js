/* CHUYỂN KÝ PHÁP TOÁN TUYẾN TÍNH (kiểu Word/UnicodeMath) -> LaTeX cho MathJax
   ---------------------------------------------------------------------------
   Quy ước đầu ra giống các file tham khảo (CHƯƠNG_*.html):
     • công thức trong dòng:  \( ... \)
     • ma trận:               \begin{pmatrix} a & b \\ c & d \end{pmatrix}
     • hệ phương trình:       \begin{cases} ... \\ ... \end{cases}
   Dùng: const { toLatex, validate } = require('./latex-convert.js');
         toLatex('Cho ma trận A=([1 1; 0 1]). Tính B=A³.')
         -> 'Cho ma trận \\(A=\\begin{pmatrix}1 & 1 \\\\ 0 & 1\\end{pmatrix}\\). Tính \\(B=A^{3}\\).'
   Chuyển bằng quy tắc (không phải hiểu ngữ nghĩa) nên luôn chạy validate()
   và đọc báo cáo cảnh báo trước khi dùng. */
'use strict';

const VI = 'àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ';
const VIU = VI.toUpperCase();
const L = 'A-Za-z' + VI + VIU;

/* Từ ASCII (không dấu) thuộc lời văn, không phải biến/ký hiệu toán */
const PROSE = new Set(('ma sau khi Cho sai vector hai Ma Trong Pt duy theo gian sang trong giao elip hyperbol ba pt ' +
  'conic sinh con Khai Khi bao Ba tam ra tham Elip nhau Hyperbol thu do thang Gauss Parabol parabol Hai Quy so qua ' +
  'ghi thay Thay Cramer Suy GIAN VECTOR tra quan Gram Schmidt Jordan quy cho').split(/\s+/));
const FUNC_GLUE = /^[A-Za-z]?(sin|cos|tan|det|dim|ker|rank|span|nullity|Im)[A-Za-z]?$/;

const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁺': '+', '⁻': '-', 'ⁿ': 'n', 'ⁱ': 'i', 'ʲ': 'j', 'ᵀ': 'T', 'ᵏ': 'k' };
const SUB = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
const SUPC = '⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿⁱʲᵀᵏ', SUBC = '₀₁₂₃₄₅₆₇₈₉';
const SYM = {
  '⇒': '\\Rightarrow ', '⇔': '\\Leftrightarrow ', '→': '\\to ', '≠': '\\ne ', '∈': '\\in ', '±': '\\pm ',
  '≥': '\\ge ', '≤': '\\le ', '∨': '\\lor ', '∧': '\\land ', '∀': '\\forall ', '⟨': '\\langle ', '⟩': '\\rangle ',
  'ℝ': '\\mathbb{R}', '∑': '\\sum ', '·': '\\cdot ', '−': '-', '×': '\\times ', '∞': '\\infty ', '∪': '\\cup ',
  '∩': '\\cap ', '∉': '\\notin ', '⊂': '\\subset ', '⊥': '\\perp ', '≈': '\\approx ', '∃': '\\exists ', '∅': '\\emptyset ',
  '⊆': '\\subseteq ', '↔': '\\leftrightarrow ', '⟹': '\\Rightarrow ', '…': '\\ldots ', '∘': '\\circ ', '′': "'",
  '–': '-', 'ℂ': '\\mathbb{C}', 'ℚ': '\\mathbb{Q}', 'ℕ': '\\mathbb{N}', 'ℤ': '\\mathbb{Z}'
};
const GREEK = {
  'α': 'alpha', 'β': 'beta', 'γ': 'gamma', 'δ': 'delta', 'ε': 'varepsilon', 'ζ': 'zeta', 'η': 'eta', 'θ': 'theta',
  'λ': 'lambda', 'μ': 'mu', 'ν': 'nu', 'ξ': 'xi', 'π': 'pi', 'ρ': 'rho', 'σ': 'sigma', 'τ': 'tau', 'φ': 'varphi',
  'χ': 'chi', 'ψ': 'psi', 'ω': 'omega', 'Γ': 'Gamma', 'Δ': 'Delta', 'Θ': 'Theta', 'Λ': 'Lambda', 'Ξ': 'Xi',
  'Π': 'Pi', 'Σ': 'Sigma', 'Φ': 'Phi', 'Ψ': 'Psi', 'Ω': 'Omega'
};
const GRE = Object.keys(GREEK).join('');

/* ---------- tiện ích dấu ngoặc ---------- */
function matchFwd(s, i) { /* s[i] là '(' -> chỉ số ')' tương ứng, -1 nếu không có */
  let d = 0;
  for (let k = i; k < s.length; k++) {
    if (s[k] === '(') d++;
    else if (s[k] === ')') { d--; if (d === 0) return k; }
  }
  return -1;
}
function matchBack(s, i) { /* s[i] là ')' -> chỉ số '(' tương ứng */
  let d = 0;
  for (let k = i; k >= 0; k--) {
    if (s[k] === ')') d++;
    else if (s[k] === '(') { d--; if (d === 0) return k; }
  }
  return -1;
}
const stripParens = (t) => {
  t = t.trim();
  return t[0] === '(' && matchFwd(t, 0) === t.length - 1 ? t.slice(1, -1) : t;
};

/* ---------- sửa lỗi nguồn: '}' thừa do chỉ số trên bị mất '^{' ---------- */
function repairStray(s) {
  let out = '', depth = 0;
  for (const ch of s) {
    if (ch === '{') { depth++; out += ch; }
    else if (ch === '}') {
      if (depth > 0) { depth--; out += ch; }
      else {
        const m = new RegExp('([' + SUPC + ']+)([^\\s{}]{0,8})$').exec(out);
        if (m) {
          const sup = [...m[1]].map((c) => SUP[c]).join('');
          out = out.slice(0, m.index) + '^{' + sup + m[2] + '}';
        } /* không sửa được -> bỏ '}' */
      }
    } else out += ch;
  }
  return out;
}

/* ---------- 1) chuyển một đoạn toán (đã tách khỏi lời văn) ---------- */
function mathCore(src, warn) {
  const stash = [];
  const hold = (latex) => { stash.push(latex); return '\uE000' + (stash.length - 1) + '\uE001'; };
  let s = repairStray(src.replace(/\$/g, '').replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ').replace(/[\u200B-\u200D\u2060\uFEFF]/g, ''));

  const cellText = (c) => mathCore(c.trim().replace(/(\d),(\d)/g, '$1\uE002$2'), warn).replace(/\uE002/g, '{,}');
  const matrix = (env, rows) => {
    const R = rows.map((r) => r.trim().split(/\s+/).filter(Boolean));
    const w = new Set(R.map((r) => r.length));
    if (w.size > 1) warn('ma trận không đều cột: ' + src.slice(0, 80));
    return '\\begin{' + env + '}' + R.map((r) => r.map(cellText).join(' & ')).join(' \\\\ ') + '\\end{' + env + '}';
  };

  /* định thức dạng | a & b \\ c & d | (nguồn Word) */
  s = s.replace(/\|([^|]*&[^|]*)\|/g, (m, body) =>
    hold('\\begin{vmatrix}' + body.split(/\\\\+/).map((r) => r.split('&').map((c) => mathCore(c.trim(), warn)).join(' & ')).join(' \\\\ ') + '\\end{vmatrix}'));
  /* ma trận kiểu Word: ([a b; c d]) */
  s = s.replace(/\(\[([^\[\]]*)\]\)/g, (m, body) => hold(matrix('pmatrix', body.split(/;+/).filter((x) => x.trim()))));
  /* ma trận kiểu giáo trình: [ [a b], [c d] ] */
  s = s.replace(/\[\s*((?:\[[^\[\]]*\]\s*,?\s*)+)\]/g, (m, body) =>
    hold(matrix('pmatrix', body.split(/\]\s*,?\s*\[/).map((r) => r.replace(/^\s*\[|\]\s*$/g, '')))));
  /* hệ phương trình: [pt; pt; pt.] */
  s = s.replace(/\[([^\[\]]*[=<>≤≥≠][^\[\]]*)\]/g, (m, body) => {
    const rows = body.split(/;+/).map((r) => r.trim()).filter(Boolean);
    return hold('\\begin{cases}' + rows.map((r) => mathCore(r, warn)).join(' \\\\ ') + '\\end{cases}');
  });

  /* phân số (a)/(b), a/b */
  for (let guard = 0; guard < 50; guard++) {
    let done = true;
    for (let i = 0; i < s.length; i++) {
      if (s[i] !== '/') continue;
      let ls = -1, ln = '', rs = -1, rn = '', re = -1;
      if (s[i - 1] === ')') {
        const o = matchBack(s, i - 1);
        if (o >= 0 && !/[A-Za-z0-9]/.test(s[o - 1] || ' ')) { ls = o; ln = stripParens(s.slice(o, i)); }
      } else {
        const m = new RegExp('(\\d+(?:[.,]\\d+)?(?:[A-Za-z' + GRE + '][' + SUBC + ']*)?|[A-Za-z' + GRE + '][' + SUBC + SUPC + ']*)$').exec(s.slice(0, i));
        if (m) { ls = m.index; ln = m[1]; }
      }
      if (ls < 0) continue;
      if (s[i + 1] === '(') {
        const c = matchFwd(s, i + 1);
        if (c >= 0) { rs = i + 1; re = c + 1; rn = stripParens(s.slice(i + 1, c + 1)); }
      } else {
        const m = new RegExp('^(\\d+(?:[.,]\\d+)?(?:[A-Za-z' + GRE + '][' + SUBC + ']*)?[' + SUPC + ']*|[A-Za-z' + GRE + '][' + SUBC + SUPC + ']*)').exec(s.slice(i + 1));
        if (m) { rs = i + 1; re = i + 1 + m[1].length; rn = m[1]; }
      }
      if (rs < 0) continue;
      s = s.slice(0, ls) + hold('\\frac{' + mathCore(ln, warn) + '}{' + mathCore(rn, warn) + '}') + s.slice(re);
      done = false;
      break;
    }
    if (done) break;
  }

  /* căn bậc hai √(..) / √x */
  for (let guard = 0; guard < 50; guard++) {
    const i = s.indexOf('√');
    if (i < 0) break;
    if (s[i + 1] === '(') {
      const c = matchFwd(s, i + 1);
      if (c < 0) { s = s.replace('√', '\\sqrt'); continue; }
      s = s.slice(0, i) + hold('\\sqrt{' + mathCore(stripParens(s.slice(i + 1, c + 1)), warn) + '}') + s.slice(c + 1);
    } else {
      const m = /^[A-Za-z0-9]+/.exec(s.slice(i + 1));
      const tok = m ? m[0] : '';
      s = s.slice(0, i) + hold('\\sqrt{' + tok + '}') + s.slice(i + 1 + tok.length);
    }
  }

  /* dấu ngoặc nhọn: _{..} ^{..} là nhóm LaTeX; còn lại là tập hợp {u, v} */
  {
    let out = '';
    const stack = [];
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === '{') {
        if (s[i - 1] === '_' || s[i - 1] === '^') { stack.push('g'); out += '{'; }
        else { stack.push('l'); out += '\\{'; }
      } else if (ch === '}') {
        const t = stack.pop();
        out += t === 'l' ? '\\}' : '}';
      } else out += ch;
    }
    s = out;
  }

  /* R -> ℝ */
  s = s.replace(/(?<![A-Za-z\\])R(?![A-Za-z])/g, 'ℝ');
  /* chỉ số trên / dưới dạng Unicode */
  s = s.replace(new RegExp('[' + SUPC + ']+', 'g'), (m) => '^{' + [...m].map((c) => SUP[c]).join('') + '}');
  s = s.replace(new RegExp('[' + SUBC + ']+', 'g'), (m) => '_{' + [...m].map((c) => SUB[c]).join('') + '}');
  /* _(...) và ^(...) */
  for (const op of ['_', '^']) {
    for (let guard = 0; guard < 50; guard++) {
      const i = s.indexOf(op + '(');
      if (i < 0) break;
      const c = matchFwd(s, i + 1);
      if (c < 0) break;
      s = s.slice(0, i) + op + '{' + mathCore(stripParens(s.slice(i + 1, c + 1)), warn) + '}' + s.slice(c + 1);
    }
  }
  /* _x / ^x với x là một ký tự hoặc dãy chữ số */
  s = s.replace(/([_^])([A-Za-z0-9]{2,})(?![A-Za-z0-9{}])/g, (m, op, t) => /^\d+$/.test(t) ? op + '{' + t + '}' : m);

  /* hàm số */
  s = s.replace(/(?<![A-Za-z\\])kerf(?![A-Za-z])/g, 'ker f');
  s = s.replace(/(?<!\\)(sin|cos|tan|det|dim|ker)(?![a-z])/g, '\\$1 ');
  s = s.replace(/(?<!\\)(rank|span|nullity)(?![a-z])/g, '\\operatorname{$1} ');
  s = s.replace(/(?<![A-Za-z\\])Im(?![a-z])/g, '\\operatorname{Im} ');
  /* ký hiệu */
  s = s.replace(new RegExp('[' + Object.keys(GREEK).join('') + ']', 'g'), (c) => '\\' + GREEK[c] + ' ');
  s = s.replace(new RegExp('[' + Object.keys(SYM).join('').replace(/[\]\\^-]/g, '\\$&') + ']', 'g'), (c) => SYM[c]);
  s = s.replace(/&/g, '\\&').replace(/%/g, '\\%').replace(/#/g, '\\#');

  /* trả cấu trúc đã giữ chỗ (có thể lồng nhau) */
  for (let g = 0; g < 10 && /\uE000/.test(s); g++) {
    s = s.replace(/\uE000(\d+)\uE001/g, (m, k) => stash[+k]);
  }
  return s.replace(/[ \t]+/g, ' ').replace(/ +([}\\])/g, ' $1').trim();
}

/* ---------- 2) tách lời văn / công thức trong một chuỗi ---------- */
function isProse(w) {
  if (new RegExp('[' + VI + VIU + ']').test(w)) return true;
  if (PROSE.has(w)) return true;
  if (w.length <= 3) return false;
  if (FUNC_GLUE.test(w) || /^(dimW|kerf)$/.test(w)) return false;
  return true;
}

function toLatex(text, opts) {
  opts = opts || {};
  const warnings = opts.warnings || [];
  const warn = (m) => warnings.push(m);
  const tok = new RegExp('(?<![A-Za-z0-9(])[a-dA-D]\\)(?=[\\s,.;:]|$)|[' + L + ']+|[\\s\\S]', 'gu');
  const toks = [];
  for (const m of text.matchAll(tok)) {
    const t = m[0];
    let type = 'n';
    if (/^[a-dA-D]\)$/.test(t)) type = 'p';
    else if (new RegExp('^[' + L + ']+$').test(t)) type = isProse(t) ? 'p' : 'm';
    else if (t === '\n' || t === '➔') type = 'p';
    toks.push({ t, type });
  }
  let out = '';
  let i = 0;
  while (i < toks.length) {
    if (toks[i].type === 'p') { out += toks[i].t; i++; continue; }
    let j = i;
    while (j < toks.length && toks[j].type !== 'p') j++;
    const run = toks.slice(i, j).map((x) => x.t).join('');
    out += renderRun(run, warn);
    i = j;
  }
  return out;
}

function renderRun(run, warn) {
  let a = 0, b = run.length;
  const opens = { '(': ')', '[': ']', '{': '}' }, closes = { ')': '(', ']': '[', '}': '{' };
  /* cắt đầu: khoảng trắng, dấu câu, ngoặc đóng thừa */
  for (;;) {
    const before = [a, b];
    while (a < b && /[\s.,;:?!"'“”‘’]/.test(run[a])) a++;
    while (b > a && /[\s.,;:?!"'“”‘’]/.test(run[b - 1])) b--;
    /* ngoặc không cân đối ở hai đầu */
    const seg = run.slice(a, b);
    let bal = {}, stack = [];
    for (let k = 0; k < seg.length; k++) {
      if (opens[seg[k]]) stack.push(k);
      else if (closes[seg[k]]) {
        if (stack.length && seg[stack[stack.length - 1]] === closes[seg[k]]) stack.pop();
        else bal[k] = 'x';
      }
    }
    const strayClose = Object.keys(bal).map(Number);
    if (strayClose.length && strayClose[0] === 0) a++;
    else if (strayClose.length && strayClose[strayClose.length - 1] === seg.length - 1) b--;
    else if (stack.length && stack[stack.length - 1] === seg.length - 1) b--;
    else if (stack.length && stack[0] === 0 && !strayClose.length && matchOpenUnclosed(seg)) a++;
    if (before[0] === a && before[1] === b) break;
  }
  const core = run.slice(a, b);
  if (!isMathy(core)) return run;
  const lead = run.slice(0, a), trail = run.slice(b);
  return lead + '\\(' + mathCore(core, warn) + '\\)' + trail;
}
function matchOpenUnclosed(seg) { return seg[0] === '(' && matchFwd(seg, 0) < 0; }
function isMathy(core) {
  if (!core) return false;
  if (/\(\[[^\]]*;|\[\s*\[/.test(core)) return true; /* ma trận toàn số */
  if (/^[\d\s.,;:()\-–+]*$/.test(core)) return false; /* chỉ là số */
  return /[A-Za-z]|[Α-ω]|[=<>≠⇒⇔∈→±≥≤∨∧∀∑√⟨⟩ℝ×·^_\/]|[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿⁱʲᵀᵏ₀-₉]/.test(core);
}

/* ---------- 3) kiểm tra cú pháp LaTeX (không thay cho việc render thật) ---------- */
function validate(s) {
  const problems = [];
  const spans = [...s.matchAll(/\\\(([\s\S]*?)\\\)/g)];
  const open = (s.match(/\\\(/g) || []).length, close = (s.match(/\\\)/g) || []).length;
  if (open !== close) problems.push('\\( và \\) không khớp');
  spans.forEach((m) => {
    const x = m[1];
    let d = 0;
    const t = x.replace(/\\[{}]/g, '');
    for (const ch of t) { if (ch === '{') d++; else if (ch === '}') d--; if (d < 0) break; }
    if (d !== 0) problems.push('ngoặc nhọn lệch: ' + x.slice(0, 60));
    const be = (x.match(/\\begin\{/g) || []).length, en = (x.match(/\\end\{/g) || []).length;
    if (be !== en) problems.push('begin/end lệch: ' + x.slice(0, 60));
    const bad = x.replace(/[\x20-\x7e]/g, '').replace(/\uE000|\uE001|\uE002/g, '');
    if (bad) problems.push('ký tự lạ [' + bad + '] trong: ' + x.slice(0, 60));
    if (/[_^]\s*$/.test(x)) problems.push('_ hoặc ^ ở cuối: ' + x.slice(0, 60));
    if (/\^\s*\^|_\s*_/.test(x)) problems.push('chỉ số kép: ' + x.slice(0, 60));
  });
  return problems;
}

module.exports = { toLatex, validate, mathCore };
