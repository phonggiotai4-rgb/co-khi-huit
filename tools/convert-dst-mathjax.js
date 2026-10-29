/**
 * Chuyển đổi ký hiệu toán học trong câu hỏi Đại số tuyến tính sang LaTeX/MathJax.
 * Chạy:  node tools/convert-dst-mathjax.js
 */
const fs = require('fs');

const srcPath = 'assets/quiz-bank.js';
const src = fs.readFileSync(srcPath, 'utf8');
const lines = src.split('\n');

console.log('Tổng dòng:', lines.length);

// Khối "dai-so-tuyen-tinh" nằm ở dòng 6197–6620 (1-indexed) → index 6196–6619
const START = 6196;
const END   = 6620; // exclusive — lines[6196..6619]

const blockLines = lines.slice(START, END);
console.log('Khối:', blockLines.length, 'dòng');

// Bọc thành IIFE để eval
const expr = '(function(){ return {' + blockLines.join('\n') + '} })()';
let data;
try {
  data = eval(expr);
} catch (e) {
  console.log('Lỗi eval:', e.message);
  process.exit(1);
}

const dst = data['dai-so-tuyen-tinh'];
let total = 0;
Object.keys(dst).forEach(k => { total += dst[k].length; });
console.log('Tổng câu:', total);
Object.keys(dst).forEach(k => console.log(k, ':', dst[k].length, 'câu'));

// ================================================================
//  HÀM CHUYỂN ĐỔI KÝ HIỆU TOÁN
// ================================================================
function latexMath(s) {
  if (!s) return s;
  let t = s;

  // Superscript Unicode → ^N → ^{N}
  const supMap = {'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5',
                  '⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
  t = t.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, c => '^' + supMap[c]);
  t = t.replace(/\^([0-9]+)(?![a-zA-Z{}_])/g, '^{$1}');

  // Matrix gán: A=([...])
  t = t.replace(/=\(\[(\d[\s\d;\\\-+/.eE^{}_]*)\]\)/g, (_, inner) => {
    if (typeof inner !== 'string') return '=($1)';
    const rows = inner.split(';').map(r => r.trim()).filter(Boolean);
    if (!rows.length) return '=($1)';
    const mat = rows.map(row => row.replace(/\s+/g, ' & ').trimEnd()).join(' \\\\ ');
    return ' = \\begin{bmatrix} ' + mat + ' \\end{bmatrix}';
  });

  // Matrix đơn: ([...]) — bỏ qua nếu ngay sau =
  t = t.replace(/(\s)\(\[(\d[\s\d;\\\-+/.eE^{}_]*)\]\)/g, (_, pre, full, inner) => {
    if (typeof inner !== 'string') return pre + full;
    const rows = inner.split(';').map(r => r.trim()).filter(Boolean);
    if (!rows.length) return pre + full;
    if (pre.trimEnd().endsWith('=')) return pre + full;
    const mat = rows.map(row => row.replace(/\s+/g, ' & ').trimEnd()).join(' \\\\ ');
    return pre + '\\begin{bmatrix} ' + mat + ' \\end{bmatrix}';
  });

  // Δ=[...]
  t = t.replace(/Δ\s*=\s*\[(.+?)\]/g, (_, inner) => {
    if (typeof inner !== 'string') return 'Δ=[...]';
    const rows = inner.split(';').map(r => r.trim()).filter(Boolean);
    if (!rows.length) return 'Δ=[...]';
    const mat = rows.map(row => row.replace(/\s+/g, ' & ').trimEnd()).join(' \\\\ ');
    return '\\Delta = \\begin{bmatrix} ' + mat + ' \\end{bmatrix}';
  });

  // r(A)=N
  t = t.replace(/r\(A\)\s*=\s*(\d+)/g, 'r(A) = $1');

  // Vector bold
  t = t.replace(/\bu\s*=\s*\(/g, '\\mathbf{u} = (');
  t = t.replace(/\bv\s*=\s*\(/g, '\\mathbf{v} = (');
  t = t.replace(/\bw\s*=\s*\(/g, '\\mathbf{w} = (');

  // Greek letters
  const greek = {'Δ':'\\Delta','δ':'\\delta','θ':'\\theta','φ':'\\phi',
    'α':'\\alpha','β':'\\beta','γ':'\\gamma','λ':'\\lambda','μ':'\\mu',
    'σ':'\\sigma','π':'\\pi','Ω':'\\Omega','ω':'\\omega','τ':'\\tau',
    'ρ':'\\rho','ε':'\\varepsilon','κ':'\\kappa','η':'\\eta'};
  Object.entries(greek).forEach(([k,v]) => { t = t.split(k).join(v); });

  // Set R → \mathbb{R}
  t = t.replace(/\bR\b/g, '\\mathbb{R}');

  // Subscripts
  const subMap = {'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5',
                  '₆':'6','₇':'7','₈':'8','₉':'9'};
  t = t.replace(/[_₀₁₂₃₄₅₆₇₈₉]/g, c => '_' + (subMap[c] || c));

  // Boolean & special
  t = t.replace(/∧/g, '\\land');
  t = t.replace(/∨/g, '\\lor');
  t = t.replace(/∞/g, '\\infty');
  t = t.replace(/∑/g, '\\sum');

  // Fractions N/M
  t = t.replace(/(?<![a-zA-Z])\b(\d+)\s*\/\s*(\d+)\b(?![a-zA-Z])/g, '\\frac{$1}{$2}');

  // Unicode minus
  t = t.replace(/−/g, '-');

  return t;
}

// ================================================================
//  ÁP DỤNG
// ================================================================
let changedCount = 0;
Object.keys(dst).forEach(chapId => {
  dst[chapId].forEach(q => {
    const origQ = q.q, origO = [...q.o], origE = q.e;
    q.q = latexMath(q.q);
    q.o = q.o.map(o => latexMath(o));
    q.e = latexMath(q.e);
    if (q.q !== origQ || q.o.some((o,i) => o !== origO[i]) || q.e !== origE) changedCount++;
  });
  console.log(chapId + ': đã đổi ' + dst[chapId].length + ' câu');
});
console.log('Tổng câu đã đổi:', changedCount, '/', total);

// ================================================================
//  SERIALIZE LẠI (giữ nguyên cấu trúc với dấu phẩy)
// ================================================================
function stringifyQ(q) {
  const safe = s => JSON.stringify(s).replace(/<\/script/gi, '<\\/script');
  return '{ q: ' + safe(q.q) +
         ', o: [' + q.o.map(o => safe(o)).join(', ') + ']' +
         ', a: ' + q.a +
         ', e: ' + safe(q.e) +
         ' }';
}

const chapIds = Object.keys(dst);
const newBlockLines = [];
newBlockLines.push('    "dai-so-tuyen-tinh": {');
chapIds.forEach((chapId, idx) => {
  newBlockLines.push('      "' + chapId + '": [');
  dst[chapId].forEach((q, qIdx) => {
    const isLast = idx === chapIds.length - 1 && qIdx === dst[chapId].length - 1;
    const comma = isLast ? '' : ',';
    newBlockLines.push('        ' + stringifyQ(q) + comma);
  });
  const isLastChap = idx === chapIds.length - 1;
  newBlockLines.push('      ]' + (isLastChap ? '' : ','));
});
newBlockLines.push('    },');

const newBlock = newBlockLines.join('\n');
console.log('New block lines:', newBlockLines.length);

// Thay thế bằng cách xây dựng lại lines array
const newLines = lines.slice(0, START).concat(newBlockLines, lines.slice(END));
const newSrc = newLines.join('\n');

console.log('Old lines:', lines.length);
console.log('New lines:', newLines.length);
console.log('New src length:', newSrc.length, 'bytes');

fs.writeFileSync(srcPath, newSrc, 'utf8');
console.log('Đã ghi lại ' + srcPath);

// Kiểm tra cú pháp JS
try {
  eval(newSrc);
  console.log('✅ Cú pháp JS OK');
} catch(e) {
  const msg = e.message;
  if (msg.includes('window is not defined')) {
    console.log('✅ Cú pháp JS OK (runtime lỗi window, không phải syntax)');
  } else {
    console.log('❌ Lỗi cú pháp:', msg);
    process.exit(1);
  }
}