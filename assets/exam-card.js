/* ============================================================================
   CƠ KHÍ HUIT — THẺ BÀI THI (dùng chung)
   ----------------------------------------------------------------------------
   Một nguồn duy nhất cho phần "chọn bài thi" và "thông tin đề": popup ở trang
   chủ (index.html) là nơi duy nhất dựng các thẻ này nên mọi môn hiển thị
   giống nhau, chỉ khác nội dung theo môn.

   Môn thường (giải tích, cơ khí…)  : thẳng ra thẻ thông tin đề.
   Môn chia bài thi (QPAN 1 & 2)      : chọn CHẾ ĐỘ HỌC trước, chọn ĐỀ sau
                                          (cùng một popup), bấm đề là xem thông tin đề.

      CK.exam.render(root, subject, o)        -> dựng + nối sự kiện thẻ thông tin đề
      CK.exam.renderPicker(root, subject, o)  -> dựng + nối sự kiện thẻ chọn chế độ học
      CK.exam.renderParts(root, subject, o)   -> dựng + nối sự kiện thẻ chọn đề
      CK.exam.url(subject, part, mode)        -> đường dẫn mở thẻ đề trên trang chủ
      CK.exam.code(key) / CK.exam.runs(slug) -> mã đề 6 ký tự / số lượt đã làm

   o của render : { part, mode, back, glass, close, noStart, titleId,
                      onStart(subject, part, mode), onBack(), onClose() }
   o của picker : { glass, close, titleId,
                      onMode(subject, mode), onClose() }
   o của parts  : { mode, pre, back, glass, close, titleId,
                      onPart(subject, part, mode), onExam(subject, mode),
                      onMode(subject, mode),
                      onBack(), onClose() }
   ========================================================================= */
(function (g) {
  "use strict";
  var CK = g.CK = g.CK || {};

  /* Ba chế độ học — thứ tự cũng là thứ tự hiển thị */
  var MODES = [
    { id: "sylabus", label: "Xem đề cương", hint: "Câu hỏi kèm đáp án đúng",
      icon: "M8.5 6.5h11M8.5 12h11M8.5 17.5h7M4.6 6.5h.01M4.6 12h.01M4.6 17.5h.01" },
    { id: "learn",   label: "Luyện tập",    hint: "Hiện đáp án ngay từng câu",
      icon: "M4.5 19.5h4L19 9a2.1 2.1 0 0 0-3-3L5.5 16.5zM14.5 7.5l2 2" },
    { id: "exam",    label: "Thi thử",      hint: "Làm hết mới chấm điểm",
      icon: "M12 7.2v4.9l3.2 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM12 3.2v1.6M12 19.2v1.6M3.2 12h1.6M19.2 12h1.6" }
  ];

  /* Ký hiệu đường vết — stroke mảnh, đồng bộ phần còn lại của trang */
  var ICON = {
    back:  "M14.4 6 8.4 12l6 6",
    clock: "M12 7.2v4.9l3.2 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
    cal:   "M12 7.4V12l3 1.9M3.8 9.6 12 4.7l8.2 4.9M5.8 10.6V19h12.4v-8.4",
    ask:   "M9.3 9.2a2.8 2.8 0 1 1 3.5 2.7c-.7.2-1 .8-1 1.5v.6M12 17.4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
    doc:   "M7 4.6h10v14.8H7zM9.6 8.6h4.8M9.6 12h4.8M9.6 15.4h3",
    users: "M15.5 20v-1.7a3.5 3.5 0 0 0-3.5-3.5H7.5A3.5 3.5 0 0 0 4 18.3V20M9.7 11.6a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6M20 20v-1.7a3.5 3.5 0 0 0-2.6-3.4M15.5 5.2a3.3 3.3 0 0 1 0 6.4",
    qr:    "M4.5 4.5h5v5h-5zM14.5 4.5h5v5h-5zM4.5 14.5h5v5h-5zM14.5 14.5h2v2h-2zM18.3 18.3h1.7v1.7h-1.7zM14.5 18v2M19.5 14v2",
    go:    "M9.6 6.6 15 12l-5.4 5.4"
  };

  function ic(name) { return '<span class="ico">' + CK.svg(ICON[name]) + '</span>'; }

  /* Mã đề: 6 ký tự, sinh ổn định từ khoá nên không đổi giữa các lần mở.
     Khoá là "slug môn" với môn thường, "slug môn:slug bài thi" với môn chia đề. */
  function code(key) {
    var A = "abcdefghijklmnopqrstuvwxyz0123456789", out = "", s = key || "", h = 7;
    for (var j = 0; j < 6; j++) {
      for (var i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i) * (j + 3)) >>> 0;
      out += A.charAt(h % 36);
    }
    return out;
  }

  function keyOf(subject, part) {
    return subject.slug + (part ? ":" + part.id : "");
  }

  /* Số lượt đã làm của chính môn đó (kèm cả bài thi), đọc từ lịch sử làm bài */
  function runs(subject, part) {
    var n = 0, list = CK.history.all();
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      if (e.slug !== subject.slug) continue;
      if (part) { if (e.part === part.id) n++; }
      else if (!e.part) n++;
    }
    return n;
  }

  /* Số câu hỏi của bài thi đang xem (0 với môn chưa bổ sung câu hỏi) */
  function count(subject, part) {
    if (!CK.quizCount) return 0;
    return part ? CK.partCount(subject.slug, part.id) : CK.quizCount(subject.slug);
  }

  function copyCode(text, btn) {
    var done = function () { CK.toast("Mã đề thi <b>" + text + "</b> đã được sao chép.", "Đã sao chép"); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, done);
      return;
    }
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:-100px;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    ta.remove();
    done();
    if (btn) btn.blur();
  }

  function row(icon, label, value) {
    return '<div class="exam-row">' + ic(icon) +
           '<span class="lbl">' + label + '</span>' +
           '<span class="val">' + value + '</span></div>';
  }

  /* ── Thẻ chọn chế độ học ─────────────────────────────────────────────────── */
  function pickerHTML(subject, o) {
    var parts = CK.partsOf(subject);
    var label = ((parts[0] && parts[0].label) || "đề").toLowerCase();
    var lead = parts.length
      ? "Chọn cách học, rồi chọn " + label + " để xem thông tin đề."
      : "Chọn cách học để xem thông tin đề.";

    var body =
      '<h3 class="exam-title"' + (o.titleId ? ' id="' + o.titleId + '"' : '') + '>' + subject.name + '</h3>' +
      '<p class="exam-lead">' + lead + '</p>' +
      '<div class="exam-modes">' +
        MODES.map(function (m) {
          return '<button class="mode" type="button" data-mode="' + m.id + '">' +
            '<span class="mico">' + CK.svg(m.icon) + '</span>' +
            '<b>' + m.label + '</b><small>' + m.hint + '</small>' +
          '</button>';
        }).join("") +
      '</div>';

    var head =
      (o.close ? '<button class="exam-close ck-icon-btn" type="button" data-exam-close aria-label="Đóng">' +
        CK.svg("M6 6l12 12M18 6 6 18") + '</button>' : "");

    return '<section class="exam ' + (o.glass == null ? "glass g2" : o.glass) + '" data-exam-picker data-slug="' + subject.slug + '">' + head + body + '</section>';
  }

  function mountPicker(root, subject, o) {
    [].forEach.call(root.querySelectorAll("[data-mode]"), function (b) {
      b.addEventListener("click", function () {
        if (o.onMode) o.onMode(subject, b.dataset.mode);
      });
    });

    var x = root.querySelector("[data-exam-close]");
    if (x && o.onClose) x.addEventListener("click", o.onClose);
  }

  /* ── Thẻ chọn đề ─────────────────────────────────────────────────────────
     Bước thứ hai, sau khi đã chọn chế độ học. Bấm đề là xem thẻ thông tin đề
     ngay trong popup (onPart).
     Ngoại lệ ở chế độ Thi thử: nếu môn có trang thi trực tuyến (CK.partExam)
     thì KHÔNG hiện danh sách đề — chỉ một nút mở thẳng trang thi đó.        */
  function partsHTML(subject, o) {
    var mode = o.mode || "learn";
    var parts = CK.partsOf(subject);
    var pl = (parts[0] && parts[0].label) || "Đề";
    var cur = MODES.filter(function (m) { return m.id === mode; })[0] || MODES[1];

    var examPage = mode === "exam" && CK.partExam && CK.partExam(subject.slug);
    var lead = examPage
      ? "Bấm nút bên dưới để vào trang thi thử."
      : "Chọn " + pl.toLowerCase() + " để xem thông tin đề.";

    var picker = examPage
      ? '<div class="exam-parts">' +
          '<span class="pl">Thi thử</span>' +
          '<div class="seg">' +
            '<button class="opt solo" type="button" data-exam-go title="Mở trang thi thử">' +
              'Mở trang thi thử<em>trang thi trực tuyến</em>' +
            '</button>' +
          '</div>' +
        '</div>'
      : '<div class="exam-parts">' +
          '<span class="pl">' + pl + '</span>' +
          '<div class="seg">' +
          parts.map(function (p) {
              var n = count(subject, p), r = runs(subject, p);
              /* Trang riêng của bài thi — bấm vào thì mở thẳng trang đó. */
              var fLearn = mode === "learn" && CK.partFile && CK.partFile(subject.slug, p.id);
              var fSyl = mode === "sylabus" && CK.partSyllabus && CK.partSyllabus(subject.slug, p.id);
              var openable = !!(fLearn || fSyl);
              var tip = n ? n + ' câu hỏi' + (r ? ' · đã làm ' + r + ' lượt' : '') : 'đang được bổ sung';
              if (fLearn) tip += ' · mở trang làm đề';
              if (fSyl) tip += ' · mở trang đề cương';
              /* Bài thi chưa có câu hỏi vẫn bấm được nếu đã có trang riêng —
                 vào trang đó sẽ thấy thông báo "đang được bổ sung". */
              return '<button class="opt" type="button" data-part="' + p.id + '" title="' + tip + '"' +
                (n || openable ? '' : ' disabled') + '>' + p.name + '<em>' + (n ? n + ' câu' : 'đang bổ sung') + '</em></button>';
            }).join("") +
          '</div>' +
        '</div>';

    var body =
      '<h3 class="exam-title"' + (o.titleId ? ' id="' + o.titleId + '"' : '') + '>' + subject.name + '</h3>' +
      '<span class="ck-pill light exam-part">' + CK.svg(cur.icon) + cur.label + '</span>' +
      '<p class="exam-lead">' + lead + '</p>' +
      picker +
      '<div class="pickmodes">' +
        '<span class="pl">Cách học</span>' +
        MODES.map(function (m) {
          return '<button class="pm" type="button" data-pm="' + m.id + '"' +
            (m.id === mode ? ' aria-current="true"' : '') + '>' + CK.svg(m.icon) + m.label + '</button>';
        }).join("") +
      '</div>';

    var head =
      (o.back ? '<button class="exam-back ck-icon-btn" type="button" data-exam-back aria-label="Quay lại chọn cách học">' +
        CK.svg(ICON.back) + '</button>' : "") +
      (o.close ? '<button class="exam-close ck-icon-btn" type="button" data-exam-close aria-label="Đóng">' +
        CK.svg("M6 6l12 12M18 6 6 18") + '</button>' : "");

    return (o.pre || "") +
      '<section class="exam ' + (o.glass == null ? "glass g2" : o.glass) + '" data-exam-parts data-slug="' + subject.slug + '">' +
        head + body +
      '</section>';
  }

  function mountParts(root, subject, o) {
    [].forEach.call(root.querySelectorAll("[data-part]"), function (b) {
      b.addEventListener("click", function () {
        if (o.onPart) o.onPart(subject, CK.partById(subject, b.dataset.part), o.mode);
      });
    });

    /* Nút thi thử — mở trang thi trực tuyến của môn (CK.partExam) */
    var go = root.querySelector("[data-exam-go]");
    if (go) go.addEventListener("click", function () {
      if (o.onExam) { o.onExam(subject, o.mode); return; }
      var f = CK.partExam && CK.partExam(subject.slug);
      if (f) location.href = CK.url(f);
    });

    [].forEach.call(root.querySelectorAll("[data-pm]"), function (b) {
      b.addEventListener("click", function () {
        if (o.onMode) o.onMode(subject, b.dataset.pm);
      });
    });

    var bk = root.querySelector("[data-exam-back]");
    if (bk && o.onBack) bk.addEventListener("click", o.onBack);

    var x = root.querySelector("[data-exam-close]");
    if (x && o.onClose) x.addEventListener("click", o.onClose);
  }

  /* ── Thẻ thông tin đề ─────────────────────────────────────────────────── */
  function cardHTML(subject, o) {
    var part = o.part || null;
    var c = code(keyOf(subject, part));
    var n = count(subject, part);
    var r = runs(subject, part);

    var body =
      '<h3 class="exam-title"' + (o.titleId ? ' id="' + o.titleId + '"' : '') + '>' + subject.name + '</h3>' +
      (part ? '<span class="ck-pill light exam-part">' + CK.svg(ICON.doc) + part.name + '</span>' : '') +
      '<div class="exam-code">' +
        '<span>Mã đề thi:</span><b>' + c + '</b>' +
        '<button type="button" data-exam-code aria-label="Sao chép mã đề thi ' + c + '" title="Sao chép mã đề thi">' +
          CK.svg(ICON.qr) +
        '</button>' +
      '</div>' +
      '<div class="exam-meta">' +
        row("clock", "Thời gian làm bài", "Không giới hạn") +
        row("cal",   "Thời gian vào thi",  "Không thời hạn") +
        row("ask",   "Số lượng câu hỏi",   n + ' <small>câu</small>') +
        row("doc",   "Loại đề",            "Trắc nghiệm") +
        row("users", "Tổng lượt đã làm của đề", r.toLocaleString("vi-VN") + ' <small>lượt</small>') +
      '</div>' +
      (n
        ? (o.noStart
            ? ""
            : '<button class="exam-cta" type="button" data-exam-go>Bắt đầu thi' + CK.svg(ICON.go) + '</button>')
        : '<p class="exam-empty">' + (part ? "Bộ câu hỏi của " + part.name + " đang được bổ sung."
                                            : "Bộ câu hỏi của môn này đang được bổ sung.") + '</p>');

    var head =
      (o.back ? '<button class="exam-back ck-icon-btn" type="button" data-exam-back aria-label="Quay lại chọn bài thi">' +
        CK.svg(ICON.back) + '</button>' : "") +
      (o.close ? '<button class="exam-close ck-icon-btn" type="button" data-exam-close aria-label="Đóng">' +
        CK.svg("M6 6l12 12M18 6 6 18") + '</button>' : "");

    return '<section class="exam ' + (o.glass == null ? "glass g2" : o.glass) + '">' + head + body + '</section>' +
           '<div class="exam-below"><a class="ck-btn ghost" href="' + CK.url("lich-su-lam-bai.html") + '">Xem lịch sử làm bài</a></div>';
  }

  function mountCard(root, subject, o) {
    var part = o.part || null;
    var c = code(keyOf(subject, part));

    var qr = root.querySelector("[data-exam-code]");
    if (qr) qr.addEventListener("click", function () { copyCode(c, qr); });

    var go = root.querySelector("[data-exam-go]");
    if (go) go.addEventListener("click", function () {
      if (o.onStart) { o.onStart(subject, part, o.mode); return; }
      location.href = url(subject, part, o.mode);
    });

    var bk = root.querySelector("[data-exam-back]");
    if (bk && o.onBack) bk.addEventListener("click", o.onBack);

    var x = root.querySelector("[data-exam-close]");
    if (x && o.onClose) x.addEventListener("click", o.onClose);
  }

  /* ── Đường dẫn ─────────────────────────────────────────────────────────── */
  /* Mọi lối vào đề đều quy về trang chủ — xem CK.subjectUrl trong app.js */
  function url(subject, part, mode) {
    return CK.subjectUrl(subject.slug, part ? part.id : null, mode);
  }

  CK.exam = {
    MODES: MODES,
    code: code,
    runs: runs,
    count: count,
    url: url,
    card: function (subject, o) { return cardHTML(subject, o || {}); },
    picker: function (subject, o) { return pickerHTML(subject, o || {}); },
    render: function (root, subject, o) {
      o = o || {};
      root.innerHTML = cardHTML(subject, o);
      mountCard(root, subject, o);
      return root;
    },
    renderPicker: function (root, subject, o) {
      o = o || {};
      root.innerHTML = pickerHTML(subject, o);
      mountPicker(root, subject, o);
      return root;
    },
    renderParts: function (root, subject, o) {
      o = o || {};
      root.innerHTML = partsHTML(subject, o);
      mountParts(root, subject, o);
      return root;
    }
  };
})(window);