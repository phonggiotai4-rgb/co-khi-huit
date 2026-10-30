const fs = require('fs');

const files = [
  { path: 'D:\\CƠ KHÍ HUIT\\dai-so-tuyen-tinh\\luyen-tap.html', name: 'luyen-tap.html (generated)' },
  { path: 'D:\\CƠ KHÍ HUIT\\quan-tri-hoc\\TN-luyen-tap\\template-quiz.html', name: 'template-quiz.html' }
];

files.forEach(({ path: p, name }) => {
  try {
    const s = fs.readFileSync(p, 'utf8');
    console.log('\n' + name + ' (' + s.length + ' bytes):');
    console.log('  answer-preview CSS:', s.includes('.answer-preview {'));
    console.log('  answerPreview HTML:', s.includes('id="answerPreview"'));
    console.log('  lastAnswered state:', s.includes('lastAnswered: null'));
    console.log('  renderAnswerPreview():', s.includes('renderAnswerPreview()'));
    console.log('  next captures:', s.includes('state.lastAnswered = {'));
  } catch(e) {
    console.log('\n' + name + ': ERROR -', e.message);
  }
});
