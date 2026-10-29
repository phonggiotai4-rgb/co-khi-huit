const fs = require('fs');
const lines = fs.readFileSync('assets/quiz-bank.js', 'utf8').split('\n');

let start = -1, end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].indexOf('dai-so-tuyen-tinh') >= 0 && start < 0) start = i;
}
let depth = 0, inBlock = false;
for (let i = start; i < lines.length; i++) {
  const l = lines[i];
  if (l.indexOf('dai-so-tuyen-tinh') >= 0) { inBlock = true; depth++; }
  else if (inBlock) {
    for (let c = 0; c < l.length; c++) {
      if (l[c] === '{') depth++;
      else if (l[c] === '}') depth--;
    }
    if (depth === 0) { end = i + 1; break; }
  }
}
console.log('Start line:', start + 1, 'End line:', end);
const block = lines.slice(start, end).join('\n');
const m = block.match(/"dai-so-tuyen-tinh"\s*:\s*(\{[\s\S]*?\})/);
if (!m) { console.log('Parse failed'); process.exit(1); }
const data = eval('(' + m[1] + ')');
let total = 0;
Object.keys(data).forEach(k => { total += data[k].length; console.log(k, data[k].length); });
console.log('Total:', total, 'câu');

// Show first 3 questions of chuong-1
data['chuong-1'].slice(0, 3).forEach((q, i) => {
  console.log('Q' + (i + 1) + ':', q.q);
  console.log('O:', q.o);
  console.log('E:', q.e);
  console.log('---');
});
