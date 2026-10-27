const fs = require('fs');
const path = require('path');
const os = require('os');
const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const harness = `
<script>
window.__runTests = async () => {
  const out = [];
  const ok = (name, cond, extra) => out.push((cond ? 'PASS' : 'FAIL') + ' | ' + name + (extra !== undefined && extra !== '' ? '  [' + extra + ']' : ''));
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const qNum = () => $('#qNumber').textContent.trim();
  const btn = () => $('#btnAction');
  const act = () => btn().textContent.trim();
  const toast = () => ({ hidden: $('#toast').hidden, title: $('#toastTitle').textContent.trim() });
  const opts = () => $$('.option');
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const TOTAL = window.quiz.questions.length;      // tong so cau cua bo de hien tai
  const pickWrong = async () => {
    for (let i = 0; i < 4; i++) {
      opts()[i].click(); await wait(10);
      btn().click(); await wait(60);
      if (toast().title === 'Không đúng!') return i;
    }
    return -1;
  };
  const solveCurrent = async () => {
    for (let i = 0; i < 4; i++) {
      opts()[i].click(); await wait(10);
      btn().click(); await wait(60);
      if (toast().title && toast().title !== 'Không đúng!') return i;
    }
    return -1;
  };
  // "Bắt đầu lại" luôn hỏi xác nhận -> bấm nút rồi bấm Xác nhận
  const restartQuiz = async (ms = 300) => {
    $('#btnRestart').click(); await wait(60);
    if (!$('#confirmBackdrop').hidden) { $('#btnConfirmOk').click(); await wait(ms); }
  };

  try {
    ok('Khởi tạo: câu 1', qNum() === 'Câu 1', qNum());
    ok('Khởi tạo: 4 đáp án A-D', opts().length === 4, opts().map(o => o.querySelector('.option-badge').textContent).join(''));
    ok('Khởi tạo: nút Kiểm tra khoá khi chưa chọn', act() === 'Kiểm tra' && btn().disabled, act());
    ok('Khởi tạo: bộ đếm khớp tổng số câu', $('#counterText').textContent.trim() === 'Câu 1/' + TOTAL, $('#counterText').textContent.trim());
    ok('Khởi tạo: không còn dòng "Thí sinh"', !document.body.innerText.includes('Thí sinh'));
    ok('Khởi tạo: hiện "Không giới hạn"', $('#timerText').textContent.trim() === 'Không giới hạn', $('#timerText').textContent.trim());
    $('#btnCounter').click(); await wait(20);
    const mapN = $$('#mapGrid .map-btn').length;
    $('#btnCloseMap').click(); await wait(10);
    ok('Bản đồ: đủ số câu của bộ đề', mapN === TOTAL, mapN);
    ok('Đóng bản đồ: modal đã ẩn', $('#mapBackdrop').hidden);

    const wrongIdx = await pickWrong();
    ok('Sai: toast "Không đúng!" hiện ra', toast().title === 'Không đúng!' && !toast().hidden, toast().title);
    ok('Sai: đáp án sai tô đỏ', opts()[wrongIdx].classList.contains('is-wrong'), opts()[wrongIdx].className);
    ok('Sai: đáp án sai vẫn bấm được (không khoá)', getComputedStyle(opts()[wrongIdx]).pointerEvents !== 'none', getComputedStyle(opts()[wrongIdx]).pointerEvents);
    ok('Sai: nút vẫn là Kiểm tra, không có Thử lại', act() === 'Kiểm tra', act());
    ok('Sai: đáp án khác vẫn bấm được', getComputedStyle(opts()[(wrongIdx + 1) % 4]).pointerEvents !== 'none');
    ok('Sai: chưa được sang câu sau', qNum() === 'Câu 1', qNum());

    const other = (wrongIdx + 1) % 4;
    opts()[other].click(); await wait(250);
    ok('Đổi đáp án: đáp án mới được chọn', opts()[other].classList.contains('is-selected'), opts()[other].className);
    ok('Đổi đáp án: đáp án sai cũ hết đỏ', !opts()[wrongIdx].classList.contains('is-wrong'), opts()[wrongIdx].className);
    ok('Đổi đáp án: toast cũ đã ẩn', toast().hidden);
    opts()[other].click(); await wait(10);
    ok('Bấm lại đáp án đang chọn: bỏ chọn', !opts()[other].classList.contains('is-selected') && btn().disabled, btn().disabled);

    const rightIdx = await solveCurrent();
    ok('Đúng: toast khen hiện ra', toast().title && toast().title !== 'Không đúng!', toast().title);
    ok('Đúng: nút thành "Câu tiếp theo"', act() === 'Câu tiếp theo', act());
    ok('Đúng: đáp án đúng tô xanh', opts()[rightIdx].classList.contains('is-correct'), opts()[rightIdx].className);
    ok('Đúng: đáp án đã khoá không đổi được', getComputedStyle(opts()[rightIdx]).pointerEvents === 'none');
    ok('Đúng: chấm câu 1 hiện dấu tick vàng (đã chọn sai trước đó)', $$('#dots .dot')[0].classList.contains('is-retry') && !!$$('#dots .dot')[0].querySelector('.dot-icon'), $$('#dots .dot')[0].className);
    ok('Đúng: chấm câu 1 là chấm hiện tại', $$('#dots .dot')[0].classList.contains('is-current'));

    btn().click(); await wait(300);
    ok('Chuyển câu: sang Câu 2', qNum() === 'Câu 2', qNum());
    ok('Chuyển câu: nút Kiểm tra khoá lại', btn().disabled && act() === 'Kiểm tra', act());
    ok('Chuyển câu: toast khen đã ẩn', toast().hidden);
    ok('Chuyển câu: bộ đếm câu 2', $('#counterText').textContent.trim() === 'Câu 2/' + TOTAL, $('#counterText').textContent.trim());

    await pickWrong();
    await wait(20);
    ok('Câu 2: sai vẫn ở nguyên Câu 2', qNum() === 'Câu 2', qNum());
    ok('Câu 2: không mở được câu 3', $$('#dots .dot')[2].classList.contains('is-locked'));

    $('#btnCounter').click(); await wait(20);
    const map = $$('#mapGrid .map-btn');
    ok('Bản đồ: câu 1-2 mở, các câu sau khoá', !map[0].disabled && !map[1].disabled && map[2].disabled && map[TOTAL - 1].disabled,
      'T=' + TOTAL + ' n=' + map.length + ' trangthai=' + map.slice(0, 4).map(b => b.disabled ? 'K' : 'M').join('') +
      ' solved=[' + Object.keys(window.quiz.state.solved).join(',') + '] idx=' + window.quiz.state.index +
      ' session=' + window.quiz.session.length);
    map[9].click(); await wait(30);
    ok('Bản đồ: nút câu khoá bị vô hiệu hoá (không bấm được)', map[9].disabled && qNum() === 'Câu 2', qNum());
    $('#btnCounter').click(); await wait(20);
    $$('#mapGrid .map-btn')[0].click(); await wait(30);
    ok('Bản đồ: quay lại được câu đã làm', qNum() === 'Câu 1', qNum());
    ok('Quay lại: câu đúng hiện trạng thái đã làm', $$('.option').some(o => o.classList.contains('is-correct')));

    const dots = $$('#dots .dot');
    ok('Chấm tròn: câu kế tiếp bấm được', !dots[1].classList.contains('is-locked'));
    ok('Chấm tròn: câu chưa mở bị khoá', dots[3].classList.contains('is-locked'));
    dots[3].click(); await wait(30);
    ok('Chấm tròn: bấm câu khoá không nhảy', qNum() === 'Câu 1', qNum());
    ok('Chấm tròn: có thông báo chưa mở câu', toast().title === 'Chưa mở câu này', toast().title);
    await wait(250);

    ok('Bắt đầu lại: nút đã bật sau khi có tiến độ', !$('#btnRestart').disabled);
    $('#btnRestart').click(); await wait(60);
    ok('Bắt đầu lại: hỏi xác nhận trước khi xoá tiến độ', !$('#confirmBackdrop').hidden, $('#confirmMsg').textContent.trim());
    ok('Bắt đầu lại: nội dung hỏi đúng', /Bắt đầu lại sẽ xoá toàn bộ tiến độ/.test($('#confirmMsg').textContent.trim()), $('#confirmMsg').textContent.trim());
    ok('Bắt đầu lại: hủy thì giữ nguyên tiến độ', (() => { $('#btnConfirmClose').click(); return qNum() !== 'Câu 1' || !!$$('#dots .dot').find(d => d.querySelector('.dot-icon')); })(), qNum());
    await restartQuiz(300);
    ok('Bắt đầu lại: về Câu 1', qNum() === 'Câu 1', qNum());
    ok('Bắt đầu lại: xoá tiến độ', !$$('#dots .dot').some(d => d.querySelector('.dot-icon')));
    ok('Bắt đầu lại: nút Kiểm tra khoá', btn().disabled, act());
    ok('Bắt đầu lại: xoá toast', toast().hidden);

    const key = (k) => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    key('3'); await wait(20);
    ok('Phím 3 chọn đáp án C', $$('.option')[2].classList.contains('is-selected'), $$('.option').map(o => o.className).join(' / '));
    key('Enter'); await wait(80);
    ok('Phím Enter kiểm tra được', !toast().hidden && toast().title !== '', toast().title);
    key('a'); await wait(20);
    ok('Phím A chọn đáp án A', $$('.option')[0].classList.contains('is-selected'), $$('.option').map(o => o.className).join(' / '));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '2', bubbles: true }));
    await wait(20);
    ok('Phím bấm khi target=document không gây lỗi', $$('.option')[1].classList.contains('is-selected'));

    // race: kiểm tra sai -> đổi đáp án -> kiểm tra lại ngay (trong 190ms)
    $$('.option')[3].click(); await wait(5);
    btn().click(); await wait(30);
    const t1 = toast();
    $$('.option')[2].click(); await wait(5);
    btn().click(); await wait(260);
    ok('Toast mới không bị timer cũ ẩn nhầm', !toast().hidden && toast().title !== t1.title || t1.title === 'Không đúng!',
       'truoc=' + t1.title + ' sau=' + toast().title + ' hidden=' + toast().hidden);

    // hien nang: khong dung lai DOM khi chi doi trang thai chon dap an
    await restartQuiz(600);
    const firstNode = $$('.option')[0];
    let syncCount = 0;
    let animCount = 0;
    const mo = new MutationObserver((recs) => { syncCount += recs.length; });
    mo.observe($('#options'), { childList: true });
    const moAnim = new MutationObserver(() => { animCount++; });
    moAnim.observe($('#qcard'), { attributes: true, attributeFilter: ['class'] });
    const animsBefore = $('#qcard').getAnimations().length;
    $$('.option')[1].click(); await wait(40);
    $$('.option')[3].click(); await wait(40);
    $$('.option')[2].click(); await wait(400);
    mo.disconnect(); moAnim.disconnect();
    ok('Mượt: chọn 3 lượt không tạo lại phần tử đáp án', syncCount === 0, syncCount + ' mutation');
    ok('Mượt: giữ nguyên node đáp án sau khi chọn', $$('.option')[0] === firstNode);
    ok('Mượt: không chạy lại animation khi chỉ đổi chọn', animCount === 0 && $('#qcard').getAnimations().length <= animsBefore,
       animCount + ' class / ' + ($('#qcard').getAnimations().length - animsBefore) + ' animation');
    ok('Mượt: không còn class animation cũ', !$('#qcard').classList.contains('is-entering'));
    const dotsNode = $('#dots').firstElementChild;
    $$('.option')[1].click(); await wait(40);
    ok('Mượt: không dựng lại dấu chấm tiến trình', $('#dots').firstElementChild === dotsNode);
    $('#btnCounter').click(); await wait(60);
    const mapNode = $('#mapGrid').firstElementChild;
    $$('#mapGrid .map-btn')[0].click(); await wait(60);
    $('#btnCounter').click(); await wait(60);
    ok('Mượt: không dựng lại các nút bản đồ câu hỏi', $('#mapGrid').firstElementChild === mapNode);
    $('#btnCloseMap').click(); await wait(60);

    // man ket qua: luyen giong het bai roi kiem tra
    const solveAll = async () => {
      // gioi thieu API tich hop + dung de luyen nhanh trong test
      window.quiz.start([{ id: 901, text: 'Cau hoi kiem tra man ket qua?', options: ['A sai', 'B dung', 'C sai', 'D sai'], correct: 1 }]);
      await wait(60);
      opts()[1].click(); await wait(20);
      btn().click(); await wait(60);
      ok('Kết quả: nút hành động chuyển thành Hoàn tất', act() === 'Hoàn tất', act());
      btn().click(); await wait(200);
    };
    // tra loi mot cau: chon sai truoc, chon dung sau, roi sang cau ke tiep
    const solveOne = async (i) => {
      const c = window.quiz.session[i].correct;
      const w = (c + 1) % 4;
      opts()[w].click(); await wait(10);
      btn().click(); await wait(40);                  // kiem tra -> sai
      opts()[c].click(); await wait(10);
      btn().click(); await wait(40);                  // kiem tra -> dung
      btn().click(); await wait(60);                  // cau tiep theo / Hoan tat
    };
    await solveAll();
    ok('Kết quả: hiện màn kết quả', !$('#resultPage').hidden && document.body.classList.contains('is-result'));
    ok('Kết quả: ẩn khung làm bài', getComputedStyle($('.stage')).display === 'none' && getComputedStyle($('.bottombar')).display === 'none');
    ok('Kết quả: ẩn đồng hồ đếm (chỉ có khi làm bài)', getComputedStyle($('#timer')).display === 'none');
    ok('Kết quả: tiêu đề đúng', $('.rcard-title').textContent.trim() === 'Bài làm của bạn đã được gửi đi', $('.rcard-title').textContent.trim());
    ok('Kết quả: điểm hiển thị đúng', $('#resScore').textContent.trim() === '1/1', $('#resScore').textContent.trim());
    ok('Kết quả: số câu đúng hiển thị đúng', $('#resCorrect').textContent.trim() === '1/1 câu · 1 điểm', $('#resCorrect').textContent.trim());
    ok('Kết quả: có tên môn học', /^Môn học: .+/.test($('#resCourse').textContent.trim()), $('#resCourse').textContent.trim());
    ok('Kết quả: thời gian theo định dạng', /giây|phút|giờ/.test($('#resTime').textContent.trim()), $('#resTime').textContent.trim());
    ok('Kết quả: có bảng xếp hạng', $$('#rankList .rank-item').length === 1, $$('#rankList .rank-item').length);
    ok('Kết quả: hàng của bạn được đánh dấu', $('#rankList .rank-item').classList.contains('is-me'));
    ok('Kết quả: dòng xếp hạng có tỷ lệ % và số câu đúng', /\\d+% · \\d+\\/\\d+ câu đúng$/.test($('#rankList .rank-ratio').textContent.trim()), $('#rankList .rank-ratio').textContent.trim());
    ok('Kết quả: hạng 1 được tô vàng', $('#rankList .rank-item').classList.contains('is-top'));
    ok('Kết quả: bảng xếp hạng sắp theo điểm giảm dần', (() => {
      const scores = $$('#rankList .rank-score').map(n => parseInt(n.textContent, 10));
      return scores.every((v, i) => i === 0 || scores[i - 1] >= v);
    })(), $$('#rankList .rank-score').map(n => n.textContent).join(' | '));
    ok('Kết quả: số người trên bảng xếp hạng', /\\(\\d+ Thí sinh\\)/.test($('#rankCount').textContent.trim()), $('#rankCount').textContent.trim());
    ok('Kết quả: có đủ 4 nút hành động', ['#btnRetry', '#btnReviewAnswers', '#btnRetryWrong', '#btnShare'].every(s => !!$(s)));

    // chia se: hop thoai + 4 nen tang
    $('#btnShare').click(); await wait(60);
    ok('Chia sẻ: mở được hộp thoại chia sẻ', !$('#shareBackdrop').hidden);
    ok('Chia sẻ: hiện tóm tắt kết quả', /\\d+(?:\\.\\d+)?\\/\\d+ điểm/.test($('#shareSummary').textContent.trim()), $('#shareSummary').textContent.trim());
    ok('Chia sẻ: có đủ 4 nền tảng', ['facebook', 'messenger', 'zalo', 'tiktok'].every(c => !!$('#shareBackdrop [data-share="' + c + '"]')));
    $('#btnShareClose').click(); await wait(60);
    ok('Chia sẻ: nút Đóng đóng được hộp thoại', $('#shareBackdrop').hidden);
    $('#btnShare').click(); await wait(60);
    $('#shareBackdrop').click(); await wait(60);
    ok('Chia sẻ: bấm ra ngoài đóng được hộp thoại', $('#shareBackdrop').hidden);

    $('#btnReviewAnswers').click(); await wait(120);
    ok('Xem đáp án: mở được trang xem đáp án', !$('#reviewPage').hidden && document.body.classList.contains('is-review'));
    ok('Xem đáp án: ẩn màn kết quả', getComputedStyle($('#resultPage')).display === 'none');
    ok('Xem đáp án: ẩn đồng hồ đếm (chỉ có khi làm bài)', getComputedStyle($('#timer')).display === 'none');
    ok('Xem đáp án: hiện điểm và tổng số câu', /^\\d+\\/\\d+$/.test($('#rvScore').textContent.trim()), $('#rvScore').textContent.trim());
    ok('Xem đáp án: hiện tên môn học', /^Môn học: .+/.test($('#rvCourse').textContent.trim()) && $('#rvCourse').textContent.trim() === $('#resCourse').textContent.trim(), $('#rvCourse').textContent.trim());
    ok('Xem đáp án: có thời gian làm bài', /giây|phút|giờ/.test($('#rvTime').textContent.trim()), $('#rvTime').textContent.trim());
    ok('Xem đáp án: có thời gian nộp bài dạng dd/MM/yyyy HH:mm', /^\\d{2}\\/\\d{2}\\/\\d{4} \\d{2}:\\d{2}$/.test($('#rvSubmit').textContent.trim()), $('#rvSubmit').textContent.trim());
    ok('Xem đáp án: thống kê phần Trắc nghiệm', /\\d+ câu \\(\\d+ đúng - \\d+ sai\\)/.test($('#rvPartSub').textContent.trim()), $('#rvPartSub').textContent.trim());
    ok('Xem đáp án: có nút Copy link gửi giáo viên', $('#btnCopyLink').textContent.trim() === 'Copy link gửi giáo viên');
    ok('Xem đáp án: liệt kê đủ câu', $$('#rvList .rv-item').length === 1, $$('#rvList .rv-item').length);
    ok('Xem đáp án: câu có số thứ tự và mã ID', /^Câu \\d+$/.test($('#rvList .rv-qno').textContent.trim()) && /ID:\\d+/.test($('#rvList .rv-qid').textContent.trim()), $('#rvList .rv-qid').textContent.trim());
    ok('Xem đáp án: hiện 4 phương án', $$('#rvList .rv-options li').length === 4, $$('#rvList .rv-options li').length);
    ok('Xem đáp án: dải chữ cái đánh dấu đáp án đúng', $$('#rvList .rv-strip .is-correct').length === 1, $('#rvList .rv-strip').textContent.replace(/\\s+/g, ' ').trim());
    ok('Xem đáp án: câu đúng viền xanh', $$('#rvList .rv-item')[0].classList.contains('is-right'));

    $('#btnRvFilter').click(); await wait(60);
    ok('Xem đáp án: nút lọc chuyển sang "Đúng ✓"', $('#btnRvFilter').textContent.trim() === 'Đúng ✓', $('#btnRvFilter').textContent.trim());
    ok('Xem đáp án: lọc Đúng vẫn thấy câu này', $$('#rvList .rv-item').length === 1, $$('#rvList .rv-item').length);
    $('#btnRvFilter').click(); await wait(60);
    ok('Xem đáp án: nút lọc chuyển sang "Sai ✗"', $('#btnRvFilter').textContent.trim() === 'Sai ✗', $('#btnRvFilter').textContent.trim());
    ok('Xem đáp án: lọc Sai hiện thông báo rỗng', !!$('#rvList .rv-empty'), $('#rvList').textContent.trim().slice(0, 40));
    $('#btnRvFilter').click(); await wait(60);
    ok('Xem đáp án: quay lại "Đúng & sai"', $('#btnRvFilter').textContent.trim() === 'Đúng & sai', $('#btnRvFilter').textContent.trim());

    $('#btnRvAnswer').click(); await wait(60);
    ok('Xem đáp án: tắt hiện đáp án', $('#reviewLayout').classList.contains('no-answer'));
    $('#btnRvAnswer').click(); await wait(60);
    ok('Xem đáp án: bật lại hiện đáp án', !$('#reviewLayout').classList.contains('no-answer'));
    $('#btnRvCollapse').click(); await wait(60);
    ok('Xem đáp án: ẩn được cột thông tin', $('#reviewLayout').classList.contains('is-collapsed'));
    $('#btnRvCollapse').click(); await wait(60);
    $('#btnBack').click(); await wait(120);
    ok('Xem đáp án: Quay lại về màn kết quả', $('#reviewPage').hidden && !$('#resultPage').hidden && !document.body.classList.contains('is-review'));

    $('#btnRetryWrong').click(); await wait(120);
    ok('Luyện tập lại câu sai: không có câu sai thì báo', !$('#resultPage').hidden && !toast().hidden, toast().title);

    $('#btnRetry').click(); await wait(120);
    ok('Luyện tập lại: quay lại khung làm bài', $('#resultPage').hidden && !document.body.classList.contains('is-result'));
    ok('Luyện tập lại: về câu 1 của bộ đề', $('#counterText').textContent.trim() === 'Câu 1/' + TOTAL, $('#counterText').textContent.trim());
    ok('Luyện tập lại: bản đồ có đủ số câu', (() => { $('#btnCounter').click(); const n = $$('#mapGrid .map-btn').length; $('#btnCloseMap').click(); return n === TOTAL; })(), '');

    // luyen tap lai cau sai: 3 cau, trong do 1 cau lam sai
    window.quiz.start([
      { id: 801, text: 'Cau sai so 1?', options: ['A', 'B', 'C', 'D'], correct: 2 },
      { id: 802, text: 'Cau sai so 2?', options: ['A', 'B', 'C', 'D'], correct: 0 },
      { id: 803, text: 'Cau sai so 3?', options: ['A', 'B', 'C', 'D'], correct: 3 }
    ]);
    await wait(60);
    const answerFirstTry = async (i) => {
      opts()[window.quiz.session[i].correct].click(); await wait(10);
      btn().click(); await wait(40);
      btn().click(); await wait(60);
    };
    await solveOne(0);   // cau 1: sai 1 lan roi dung
    await solveOne(1);   // cau 2: sai 1 lan roi dung
    await answerFirstTry(2); // cau 3: dung ngay lan dau
    await wait(200);
    ok('Câu sai: điểm = 2 câu sai 1 lần (0.75) + 1 câu đúng ngay = 2.5/3', $('#resScore').textContent.trim() === '2.5/3', $('#resScore').textContent.trim());
    $('#btnRetryWrong').click(); await wait(150);
    ok('Luyện tập lại câu sai: chỉ còn 2 câu sai', $('#counterText').textContent.trim() === 'Câu 1/2', $('#counterText').textContent.trim());
    ok('Luyện tập lại câu sai: câu đó đúng câu đã làm sai', $('#qText').textContent.trim() === 'Cau sai so 1?', $('#qText').textContent.trim());
    window.quiz.start(); await wait(80);

    // diem theo so lan chon sai: 1 lan = 0.5, tu 2 lan = 0.25
    window.quiz.start([
      { id: 851, text: 'Cau sai 2 lan', options: ['A', 'B', 'C', 'D'], correct: 0 },
      { id: 852, text: 'Cau sai 1 lan', options: ['A', 'B', 'C', 'D'], correct: 0 },
      { id: 853, text: 'Cau dung ngay', options: ['A', 'B', 'C', 'D'], correct: 0 }
    ]);
    await wait(60);
    const pickWrongThenCheck = async (w) => {
      opts()[w].click(); await wait(10);
      btn().click(); await wait(40);
    };
    await pickWrongThenCheck(1);
    await pickWrongThenCheck(2);
    opts()[0].click(); await wait(10);
    btn().click(); await wait(40);
    btn().click(); await wait(60);
    await pickWrongThenCheck(1);
    opts()[0].click(); await wait(10);
    btn().click(); await wait(40);
    btn().click(); await wait(60);
    await answerFirstTry(2);
    await wait(200);
    ok('Điểm: sai 1 lần = 0.75, sai 2 lần = 0.5, sai 3 lần = 0.25, đúng ngay = 1', $('#resScore').textContent.trim() === '2.25/3', $('#resScore').textContent.trim());
    window.quiz.start(); await wait(80);

    // phim Esc bo qua cau + ky hieu trang thai tren thanh tien trinh
    await restartQuiz(400);
    const keyEsc = () => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    const statusClass = (n) => $$('#dots .dot')[n].className;

    await solveOne(0);                                   // cau 1: sai 1 lan roi dung -> tick vang
    ok('Esc/ký hiệu: sai rồi chọn lại đúng -> tick vàng', statusClass(0).includes('is-retry'), statusClass(0));
    ok('Esc/ký hiệu: tick vàng dùng icon dấu tick', !!$$('#dots .dot')[0].querySelector('polyline'));

    const firstNodeDot = $$('#dots .dot')[0];
    // chưa chọn sai gi: Esc khong duoc bo qua
    keyEsc(); await wait(150);
    ok('Esc: chưa làm gì thì không bỏ qua câu', qNum() === 'Câu 2', qNum());
    ok('Esc: câu chưa làm vẫn là vòng tròn rỗng', !statusClass(1).includes('is-marked'), statusClass(1));
    ok('Esc: câu sau vẫn khoá', statusClass(2).includes('is-locked'), statusClass(2));
    opts()[window.quiz.session[1].correct].click(); await wait(30);
    keyEsc(); await wait(120);
    ok('Esc: mới chọn mà chưa bấm Kiểm tra thì không bỏ qua', qNum() === 'Câu 2', qNum());
    ok('Esc: câu đã chọn nhưng chưa kiểm tra vẫn chưa đánh dấu', !statusClass(1).includes('is-marked'), statusClass(1));

    // chon sai roi moi bo qua duoc
    const wrongQ2 = (window.quiz.session[1].correct + 1) % 4;
    opts()[wrongQ2].click(); await wait(20); btn().click(); await wait(80);
    ok('Esc: đã bị báo sai', toast().title === 'Không đúng!', toast().title);
    keyEsc(); await wait(150);
    ok('Esc: chọn sai rồi Esc thì bỏ qua sang câu mới', qNum() === 'Câu 3', qNum());
    ok('Esc: có thông báo đã bỏ qua', !toast().hidden && /bỏ qua/i.test(toast().title), toast().title);
    ok('Esc: chấm câu 2 hiện dấu X đỏ', statusClass(1).includes('is-wrong'), statusClass(1));
    ok('Esc: dấu X đỏ dùng icon chéo', $$('#dots .dot')[1].querySelectorAll('line').length === 2);
    ok('Esc: giữ lại đáp án sai để xem lại', !!window.quiz.state.picked[window.quiz.session[1].id], JSON.stringify(window.quiz.state.picked));
    ok('Esc: câu 3 được mở sau khi bỏ qua câu 2', !statusClass(2).includes('is-locked'), statusClass(2));
    ok('Esc: bỏ qua không dựng lại chấm', $$('#dots .dot')[0] === firstNodeDot);

    // cau 3 cung bo qua bang Esc
    opts()[(window.quiz.session[2].correct + 1) % 4].click(); await wait(20); btn().click(); await wait(80);
    keyEsc(); await wait(150);
    ok('Esc: bỏ qua câu 3 xong sang Câu 4', qNum() === 'Câu 4', qNum());
    ok('Esc: chấm câu 3 hiện dấu X đỏ', statusClass(2).includes('is-wrong'), statusClass(2));

    await solveOne(3);   // cau 4: sai 1 lan roi dung -> tick vang
    await solveOne(4);   // cau 5: sai 1 lan roi dung -> tick vang
    await answerFirstTry(5); // cau 6: dung ngay -> tick xanh
    await answerFirstTry(6); // cau 7: dung ngay -> tick xanh
    ok('Esc/ký hiệu: chấm câu 6 hiện tick xanh', statusClass(5).includes('is-right'), statusClass(5));
    ok('Esc/ký hiệu: chấm câu 2 vẫn là X đỏ', statusClass(1).includes('is-wrong'), statusClass(1));
    ok('Esc/ký hiệu: câu hiện tại là vòng tròn rỗng', statusClass(7).includes('is-current') && !statusClass(7).includes('is-marked'), statusClass(7));
    ok('Bản đồ: câu bỏ qua được tô đỏ', (() => {
      $('#btnCounter').click();
      const m = $$('#mapGrid .map-btn');
      const r = m[1].classList.contains('is-bad') && m[0].classList.contains('is-done');
      $('#btnCloseMap').click();
      return r;
    })(), '');
    $$('#dots .dot')[1].click(); await wait(120);
    ok('Esc: quay lại câu đã bỏ qua được', qNum() === 'Câu 2', qNum());
    opts()[window.quiz.session[1].correct].click(); await wait(20); btn().click(); await wait(80);
    ok('Esc: làm lại câu đã bỏ qua thành tick vàng (đã từng chọn sai)', statusClass(1).includes('is-retry'), statusClass(1));

    // cau da bo qua: Esc lan nua thi di tiep (khong ket)
    window.quiz.start(Array.from({ length: 5 }, (_, n) => ({
      id: 1 + n, text: 'Cau so ' + (n + 1), options: ['A', 'B', 'C', 'D'], correct: 0 })));
    await wait(60);
    opts()[1].click(); await wait(10); btn().click(); await wait(60);      // sai cau 1
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await wait(80);
    ok('Esc: bỏ qua câu 1 rồi sang câu 2', $('#qText').textContent.trim() === 'Cau so 2', $('#qText').textContent.trim());
    opts()[0].click(); await wait(10); btn().click(); await wait(60); btn().click(); await wait(60);  // dung cau 2 -> next
    ok('Esc: sang câu 3', $('#qText').textContent.trim() === 'Cau so 3', $('#qText').textContent.trim());
    $$('#dots .dot')[0].click(); await wait(80);                           // quay lai cau 1 da bo qua
    ok('Esc: quay lại được câu đã bỏ qua', $('#qText').textContent.trim() === 'Cau so 1', $('#qText').textContent.trim());
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await wait(80);
    ok('Esc: từ câu đã bỏ qua thì đi tiếp', $('#qText').textContent.trim() === 'Cau so 2', $('#qText').textContent.trim());
    $$('#dots .dot')[0].click(); await wait(80);
    ok('Esc: nút hành động vẫn là Kiểm tra khi quay lại câu bỏ qua', $('#btnAction').textContent.trim() === 'Kiểm tra', $('#btnAction').textContent.trim());
    await restartQuiz(400);

    // âm thanh: AudioContext phải được tạo sẵn lúc rảnh, không nghẽn cú bấm đầu
    ok('Âm thanh: AudioContext đã tạo sẵn trước khi bấm', window.quiz.audioReady === true, window.quiz.audioReady);
    $('#btnSound').click(); await wait(60);
    ok('Âm thanh: nút tắt/bật đổi trạng thái', $('#btnSound').classList.contains('is-muted'));
    $('#btnSound').click(); await wait(60);
    ok('Âm thanh: bật lại được', !$('#btnSound').classList.contains('is-muted'));

    // trang xem dap an: tai dan theo lo (khong ve mot luc 51 the)
    window.quiz.start(Array.from({ length: 30 }, (_, n) => ({
      id: 500 + n, text: 'Cau ' + (n + 1), options: ['A', 'B', 'C', 'D'], correct: n % 4 })));
    await wait(60);
    for (let i = 0; i < 30; i++) {
      const q = window.quiz.session[i];
      $$('.option')[q.correct].click();
      $('#btnAction').click();
      $('#btnAction').click();
    }
    await wait(150);
    $('#btnReviewAnswers').click(); await wait(120);
    const firstBatch = $$('#rvList .rv-item').length;
    ok('Xem đáp án: hiển thị từng phần, không dựng hết 30 câu', firstBatch > 0 && firstBatch < 30, firstBatch);
    ok('Xem đáp án: có nút Xem thêm', !!$('#rvList .rv-more'), 'thieu');
    let guard = 0;
    while ($('#rvList .rv-more') && guard++ < 10) { $('#rvList .rv-more').click(); await wait(90); }
    ok('Xem đáp án: bấm Xem thêm ra đủ 30 câu', $$('#rvList .rv-item').length === 30, $$('#rvList .rv-item').length);
    ok('Xem đáp án: hết câu thì ẩn nút Xem thêm', !$('#rvList .rv-more'));
    $('#btnRvFilter').click(); await wait(90);
    ok('Xem đáp án: đổi bộ lọc thì vẫn tải từng phần', $$('#rvList .rv-item').length < 30, $$('#rvList .rv-item').length);
    $('#btnBack').click(); await wait(120);

    // luyen lai: khong ton tai nut phu, luyen xong phai quay ve man ket qua
    ok('Luyện lại: không có nút phụ nào trên thanh dưới', $$('#bottombar .link-btn').length === 1, $$('#bottombar .link-btn').length);
    $('#btnRetry').click(); await wait(150);
    ok('Luyện lại: bắt đầu lại từ câu 1', $('#counterText').textContent.trim() === 'Câu 1/' + window.quiz.questions.length, $('#counterText').textContent.trim());
    ok('Luyện lại: vào khung làm bài', $('#resultPage').hidden && getComputedStyle($('.stage')).display !== 'none');

    // giai het bai luyen -> phai o ve man ket qua
    const retryList = window.quiz.session;
    for (let i = 0; i < retryList.length; i++) {
      $$('.option')[retryList[i].correct].click();
      $('#btnAction').click();
      $('#btnAction').click();
    }
    await wait(250);
    ok('Luyện lại: làm xong bài thì quay về màn kết quả', !$('#resultPage').hidden && getComputedStyle($('.stage')).display === 'none');
    const sc = $('#resScore').textContent.trim().split('/');
    ok('Luyện lại: điểm cập nhật theo lần vừa làm', sc.length === 2 && sc.every(p => p !== '' && !isNaN(Number(p))), sc.join('/'));
    ok('Luyện lại: bảng xếp hạng hiển thị', $$('#rankList .rank-item').length === 1, $$('#rankList .rank-item').length);
    window.quiz.start(); await wait(80);

    // luyen tap -> quay lai phan xem diem
    const giaTriDiem = () => $('#resScore').textContent.trim();
    // 1) lam bai 3 cau, cau 2 lam sai roi lam lai dung
    window.quiz.start([
      { id: 301, text: 'Cau A', options: ['A1', 'A2', 'A3', 'A4'], correct: 0 },
      { id: 302, text: 'Cau B', options: ['B1', 'B2', 'B3', 'B4'], correct: 1 },
      { id: 303, text: 'Cau C', options: ['C1', 'C2', 'C3', 'C4'], correct: 2 }
    ]);
    await wait(60);
    ok('Luyện tập: phiên mới có 3 câu', $('#counterText').textContent.trim() === 'Câu 1/3', $('#counterText').textContent.trim());
    await solveOne(0); await solveOne(1); await solveOne(2);
    await wait(200);
    const diemGoc = giaTriDiem();
    ok('Luyện tập: điểm gốc hiển thị', diemGoc === '2.25/3', diemGoc);
    ok('Luyện tập: chưa luyện tập thì không có nút quay lại điểm', $('#btnBackToResult').hidden);

    // 2) bam "Luyen tap lai" -> theo loi nhap trung gian
    $('#btnRetry').click(); await wait(120);
    ok('Luyện tập: mở phiên luyện tập (về khung làm bài)', $('#resultPage').hidden && !$('.stage').hidden);
    ok('Luyện tập: hiện nhãn Luyện tập trên khung bài', !$('#practiceTag').hidden && /Luyện tập lại/.test($('#practiceTagText').textContent), $('#practiceTagText').textContent);
    ok('Luyện tập: bấm Quay lại KHÔNG hỏi thoát', (function () {
      $('#btnBack').click(); return $('#confirmBackdrop').hidden;
    })());
    ok('Luyện tập: Quay lại về thẳng phần xem điểm', !$('#resultPage').hidden && document.body.classList.contains('is-result'));
    ok('Luyện tập: điểm gốc được giữ nguyên', giaTriDiem() === diemGoc, giaTriDiem());
    ok('Luyện tập: đã thoát chế độ luyện tập, ẩn nút quay lại', $('#btnBackToResult').hidden && $('#practiceTag').hidden);
    ok('Luyện tập: Quay lại lần 2 mới hỏi thoát', (function () {
      $('#btnBack').click();
      const hoi = !$('#confirmBackdrop').hidden;
      $('#btnConfirmClose').click();
      return hoi;
    })());

    // 3) luyen tap xong -> trang diem co nut quay lai diem
    $('#btnRetryWrong').click(); await wait(120);
    const soCauLuyen = window.quiz.session.length;
    for (let i = 0; i < soCauLuyen; i++) await solveOne(i);
    await wait(200);
    ok('Luyện tập: luyện xong vẫn ở trang điểm', !$('#resultPage').hidden, $('#resScore').textContent.trim());
    ok('Luyện tập: có nút Quay lại phần xem điểm', !$('#btnBackToResult').hidden);
    $('#btnBackToResult').click(); await wait(120);
    ok('Luyện tập: nút quay lại đưa về kết quả gốc', giaTriDiem() === diemGoc, giaTriDiem());
    ok('Luyện tập: ẩn nút sau khi dùng', $('#btnBackToResult').hidden);

    // "Bắt đầu lại" khi đang luyện tập phải hỏi xác nhận và giữ nguyên chế độ luyện tập
    $('#btnRetryWrong').click(); await wait(120);
    const tapLuyen = window.quiz.session.length;
    ok('Luyện tập: mở tập câu sai', !$('#practiceTag').hidden && tapLuyen > 0, tapLuyen);
    opts()[0].click(); await wait(20); btn().click(); await wait(60);
    $('#btnRestart').click(); await wait(60);
    ok('Luyện tập: Bắt đầu lại hỏi xác nhận', !$('#confirmBackdrop').hidden, $('#confirmMsg').textContent.trim());
    ok('Luyện tập: hộp thoại đúng nội dung', /Bắt đầu lại sẽ xoá tiến độ luyện tập/.test($('#confirmMsg').textContent.trim()), $('#confirmMsg').textContent.trim());
    $('#btnConfirmClose').click(); await wait(60);
    ok('Luyện tập: bấm Đóng thì chưa bắt đầu lại', $('#confirmBackdrop').hidden && !$('#btnAction').disabled, $('#btnAction').disabled);
    $('#btnRestart').click(); await wait(60);
    $('#btnConfirmOk').click(); await wait(200);
    ok('Luyện tập: Bắt đầu lại vẫn giữ chế độ luyện tập', !$('#practiceTag').hidden, $('#practiceTag').hidden);
    ok('Luyện tập: Bắt đầu lại giữ nguyên tập câu', window.quiz.session.length === tapLuyen, window.quiz.session.length + ' vs ' + tapLuyen);
    ok('Luyện tập: Bắt đầu lại xoá tiến độ', $('#btnAction').disabled && $('#counterText').textContent.trim() === 'Câu 1/' + tapLuyen, $('#counterText').textContent.trim());
    $('#btnBack').click(); await wait(120);
    ok('Luyện tập: sau Bắt đầu lại vẫn quay lại được điểm', !$('#resultPage').hidden && !$('#confirmBackdrop').hidden === false, 'resultHidden=' + $('#resultPage').hidden);
    ok('Luyện tập: Quay lại không hỏi thoát sau Bắt đầu lại', $('#confirmBackdrop').hidden);

    // modal xac nhan thoat bai thi
    $('#btnBack').click(); await wait(60);
    ok('Thoát: mở hộp thoại xác nhận', !$('#confirmBackdrop').hidden);
    ok('Thoát: đúng nội dung câu hỏi', $('#confirmMsg').textContent.trim() === 'Bạn có chắc chắn muốn thoát bài thi ?', $('#confirmMsg').textContent.trim());
    ok('Thoát: có nút Đóng và Xác nhận', $('#btnConfirmClose').textContent.trim() === 'Đóng' && $('#btnConfirmOk').textContent.trim() === 'Xác nhận');
    ok('Thoát: focus vào nút Xác nhận', document.activeElement === $('#btnConfirmOk'), document.activeElement.id);
    $('#btnConfirmClose').click(); await wait(60);
    ok('Thoát: nút Đóng đóng được hộp thoại', $('#confirmBackdrop').hidden);
    $('#btnBack').click(); await wait(40);
    $('#confirmBackdrop').click(); await wait(60);
    ok('Thoát: bấm ra ngoài cũng đóng được', $('#confirmBackdrop').hidden);
    $('#btnBack').click(); await wait(40);
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await wait(60);
    ok('Thoát: phím Esc đóng được', $('#confirmBackdrop').hidden);
    $('#btnBack').click(); await wait(40);
    let backCalls = 0;
    const realBack = history.back.bind(history);
    history.back = () => { backCalls++; };
    history.pushState({ t: 1 }, '', '?acceptance=1');
    $('#btnConfirmOk').click(); await wait(80);
    ok('Thoát: bấm Xác nhận đóng hộp thoại', $('#confirmBackdrop').hidden);
    ok('Thoát: Xác nhận sẽ thoát bài thi (gọi history.back)', backCalls === 1, backCalls);
    history.back = realBack;
    ok('Bài làm còn nguyên sau khi đóng hộp thoại', $$('.option').length === 4 && $('#mapBackdrop').hidden && !$('#confirmBackdrop').hidden === false);

    ok('Không lỗi JS xuyên suốt', true);
  } catch (e) {
    out.push('ERROR | ' + (e && e.stack ? e.stack.split('\\n').slice(0, 3).join(' / ') : e));
  }

  const checks = out.filter(l => l.startsWith('PASS') || l.startsWith('FAIL'));
  out.push('=== TOTAL: ' + checks.length + ' | FAILED: ' + out.filter(l => l.startsWith('FAIL') || l.startsWith('ERROR')).length + ' ===');
  return out.join('\\n');
};
<\/script>
`;

const OUT_FILE = path.join(process.env.TEMP || os.tmpdir(), 'opencode', '__acceptance.html');
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, src.replace('</body>', () => harness + '</body>'));
console.log('harness written ->', OUT_FILE);
module.exports = { OUT_FILE };
