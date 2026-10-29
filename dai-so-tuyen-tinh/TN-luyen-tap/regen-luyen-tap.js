const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
const bankSrc = fs.readFileSync(path.join(ROOT, 'assets', 'quiz-bank.js'), 'utf8');

// Find dai-so-tuyen-tinh block start
const dsStart = bankSrc.indexOf('"dai-so-tuyen-tinh": {');
if (dsStart < 0) { console.error('Không tìm thấy dai-so-tuyen-tinh'); process.exit(1); }

// Find all chapter starts
const chapters = [];
let searchPos = dsStart;
while (true) {
  const chIdx = bankSrc.indexOf('"chuong-', searchPos);
  if (chIdx < 0 || chIdx > dsStart + 200000) break;
  chapters.push(chIdx);
  searchPos = chIdx + 1;
}
chapters.push(bankSrc.length); // sentinel

console.log('Found', chapters.length - 1, 'chapters');

function extractString(src, quotePos) {
  let result = '';
  let esc = false;
  for (let i = quotePos + 1; i < src.length; i++) {
    if (esc) {
      if (src[i] === 'n') result += '\n';
      else if (src[i] === '\\') result += '\\';
      else result += src[i];
      esc = false;
    } else if (src[i] === '\\') {
      esc = true;
    } else if (src[i] === '"') {
      break;
    } else {
      result += src[i];
    }
  }
  return result;
}

function parseQuestion(qStr) {
  // qStr is like: { q: "...", o: [...], a: N, e: "..." }
  // Remove surrounding { }
  qStr = qStr.trim();
  if (qStr.startsWith('{')) qStr = qStr.slice(1);
  if (qStr.endsWith('}')) qStr = qStr.slice(0, -1);
  
  // Extract q
  const qMatch = qStr.match(/q:\s*"((?:[^"\\]|\\.)*)"/);
  if (!qMatch) return null;
  const qValue = extractString(qStr, qStr.indexOf('"', qStr.indexOf('q:') + 2));
  
  // Extract a
  const aMatch = qStr.match(/a:\s*(\d+)/);
  if (!aMatch) return null;
  
  // Extract e (optional)
  let eValue = '';
  const eIdx = qStr.indexOf('e: ');
  if (eIdx >= 0) {
    const eQuoteStart = qStr.indexOf('"', eIdx + 3);
    if (eQuoteStart >= 0) eValue = extractString(qStr, eQuoteStart);
  }
  
  // Extract options - find o: [...]
  const oIdx = qStr.indexOf('o: [');
  if (oIdx < 0) return null;
  const oOpen = qStr.indexOf('[', oIdx);
  
  // Find matching ]
  let oDepth = 1;
  let inOStr = false;
  let oEsc = false;
  let oClose = oOpen + 1;
  for (let i = oOpen + 1; i < qStr.length; i++) {
    if (oEsc) { oEsc = false; continue; }
    if (qStr[i] === '\\') { oEsc = true; continue; }
    if (qStr[i] === '"') { inOStr = !inOStr; continue; }
    if (inOStr) continue;
    if (qStr[i] === '[') oDepth++;
    else if (qStr[i] === ']') { oDepth--; if (oDepth === 0) { oClose = i; break; } }
  }
  const oContent = qStr.slice(oOpen + 1, oClose);
  
  // Parse individual options
  const opts = [];
  let oPos = 0;
  while (true) {
    const sq = oContent.indexOf('"', oPos);
    if (sq < 0) break;
    // Find matching closing quote (handling escapes)
    let end = sq + 1;
    let esc2 = false;
    while (end < oContent.length) {
      if (esc2) { esc2 = false; end++; continue; }
      if (oContent[end] === '\\') { esc2 = true; end++; continue; }
      if (oContent[end] === '"') break;
      end++;
    }
    opts.push(oContent.slice(sq + 1, end));
    oPos = end + 1;
  }
  
  return { q: qValue, o: opts, a: parseInt(aMatch[1]), e: eValue };
}

// Parse each chapter
const jsonOut = {};
for (let ci = 0; ci < chapters.length - 1; ci++) {
  const chStart = chapters[ci];
  const chEnd = chapters[ci + 1];
  
  // Extract chapter name
  const chNameMatch = bankSrc.slice(chStart, chStart + 30).match(/"chuong-(\d+)"/);
  if (!chNameMatch) continue;
  const chName = "chuong-" + chNameMatch[1];
  
  // Find the [ that starts the array
  const arrOpen = bankSrc.indexOf('[', chStart);
  
  // Find matching ]
  let bd = 1;
  let arrClose = arrOpen + 1;
  let inStr = false;
  let strEsc = false;
  for (let i = arrOpen + 1; i < chEnd; i++) {
    const c = bankSrc[i];
    if (strEsc) { strEsc = false; continue; }
    if (c === '\\') { strEsc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '[') bd++;
    else if (c === ']') { bd--; if (bd === 0) { arrClose = i; break; } }
  }
  
  const arrContent = bankSrc.slice(arrOpen + 1, arrClose);
  
  // Split into individual questions by finding { ... } patterns
  const questions = [];
  let qPos = 0;
  while (qPos < arrContent.length) {
    const qStart = arrContent.indexOf('{', qPos);
    if (qStart < 0) break;
    
    // Find matching }
    let bd2 = 1;
    let qEnd = qStart + 1;
    let inStr2 = false;
    let strEsc2 = false;
    for (let i = qStart + 1; i < arrContent.length; i++) {
      const c = arrContent[i];
      if (strEsc2) { strEsc2 = false; continue; }
      if (c === '\\') { strEsc2 = true; continue; }
      if (c === '"') { inStr2 = !inStr2; continue; }
      if (inStr2) continue;
      if (c === '{') bd2++;
      else if (c === '}') { bd2--; if (bd2 === 0) { qEnd = i; break; } }
    }
    
    const qBlock = arrContent.slice(qStart, qEnd + 1);
    const parsed = parseQuestion(qBlock);
    if (parsed && parsed.o.length >= 2) {
      questions.push(parsed);
    }
    
    qPos = qEnd + 1;
  }
  
  jsonOut[chName] = questions;
  console.log(chName + ': ' + questions.length + ' câu');
}

const jsonPath = path.join(__dirname, 'questions-dst.json');
fs.writeFileSync(jsonPath, JSON.stringify(jsonOut, null, 2), 'utf8');
console.log('✅ Đã ghi:', jsonPath);

const total = Object.values(jsonOut).reduce((s, a) => s + a.length, 0);
const counts = Object.keys(jsonOut).map(k => k + '=' + jsonOut[k].length).join(', ');
console.log('Tổng:', total + ' câu (' + counts + ')');

// Chạy gen-luyen-tap.js
const genScript = path.join(__dirname, 'gen-luyen-tap.js');
try {
  const result = execSync(`node "${genScript}" "${jsonPath}"`, { encoding: 'utf8', cwd: ROOT });
  console.log(result);
  console.log('✅ Đã sinh lại luyen-tap.html');
} catch(e) {
  console.error('❌ Lỗi gen:', e.message);
}