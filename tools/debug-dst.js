const fs = require('fs');
const src = fs.readFileSync('assets/quiz-bank.js', 'utf8');

// Find dai-so-tuyen-tinh block
const dsIdx = src.indexOf('"dai-so-tuyen-tinh": {');
console.log('dai-so-tuyen-tinh at:', dsIdx);

// Show all chapter keys
let pos = dsIdx;
while (true) {
  const i = src.indexOf('"chuong-', pos);
  if (i < 0 || i > dsIdx + 200000) break;
  console.log('Found chuong at', i, ':', src.slice(i, i + 20));
  pos = i + 1;
}

// Show content after chuong-1 array ends
const ch1Idx = src.indexOf('"chuong-1": [', dsIdx);
console.log('\nchuong-1 at:', ch1Idx);

// Find the end of chuong-1 by counting brackets (ignoring strings)
let bd = 1;
let ch1End = ch1Idx + '"chuong-1": ['.length;
let inStr = false;
let strEsc = false;
for (let i = ch1End; i < src.length; i++) {
  const c = src[i];
  if (strEsc) { strEsc = false; continue; }
  if (c === '\\') { strEsc = true; continue; }
  if (c === '"') { inStr = !inStr; continue; }
  if (inStr) continue;
  if (c === '[') bd++;
  else if (c === ']') {
    bd--;
    if (bd === 0) { ch1End = i; break; }
  }
}
console.log('chuong-1 ends at:', ch1End);
console.log('After chuong-1:', JSON.stringify(src.slice(ch1End, ch1End + 100)));

// Now find chuong-2
const ch2Idx = src.indexOf('"chuong-2"', ch1End);
console.log('\nchuong-2 at:', ch2Idx);
if (ch2Idx >= 0) {
  console.log('Context:', src.slice(ch2Idx, ch2Idx + 100));
}

// Count total questions in chuong-1
const ch1Content = src.slice(ch1End - 500, ch1End);
console.log('\n--- Last 500 chars of chuong-1 ---');
console.log(ch1Content);