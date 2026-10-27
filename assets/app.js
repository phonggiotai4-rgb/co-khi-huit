/* ============================================================================
   CƠ KHÍ HUIT — LỚP DÙNG CHUNG
   ----------------------------------------------------------------------------
   Cung cấp cho MỌI trang:
     • CK.initShell()        — chèn thanh điều hướng + chân trang
     • CK.theme              — sáng / tối, nhớ lựa chọn
     • CK.toast(msg)         — thông báo kính
     • CK.history            — lưu lịch sử làm bài (đồng bộ "Lịch sử làm bài")
     • CK.profile            — hồ sơ sinh viên (đồng bộ "Cá nhân")
     • CK.fmt*               — định dạng tiếng Việt

   Mỗi trang khai báo độ sâu thư mục bằng <body data-depth="0|1">
   ========================================================================= */
(function (global) {
  "use strict";

  var CK = {};

  /* ── Đường dẫn tương đối theo độ sâu ───────────────────────────────── */
  CK.base = function () {
    var d = parseInt(document.body.getAttribute("data-depth") || "0", 10);
    var s = "";
    for (var i = 0; i < d; i++) s += "../";
    return s;
  };
  CK.url = function (p) {
    if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(p)) return p;
    return CK.base() + p;
  };

  /* Đường dẫn mở thẳng thông tin đề của một môn trên trang chủ (Lò ôn luyện).
     index.html?m=<slug>[&d=<đề>][&mode=<chế độ>]#lb — trang chủ tự mở popup
     tương ứng khi đọc tham số này. Dùng chung để mọi lối vào đề chỉ một nơi. */
  CK.subjectUrl = function (slug, partId, mode) {
    var u = CK.url("index.html") + "?m=" + encodeURIComponent(slug || "");
    if (partId) u += "&d=" + encodeURIComponent(partId);
    if (mode) u += "&mode=" + encodeURIComponent(mode);
    return u + "#lb";
  };

  CK.PAGES = [
    { id: "home",    href: "index.html",           label: "Trang chủ",     icon: "M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" },
    { id: "features",href: "tinh-nang.html",       label: "Tính năng",    icon: "M12 3.2 4.5 7.4v9.2L12 20.8l7.5-4.2V7.4zM4.5 7.4 12 11.6l7.5-4.2M12 11.6v9.2" },
    { id: "history", href: "lich-su-lam-bai.html", label: "Lịch sử làm bài", icon: "M12 7v5l3.2 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
    { id: "profile", href: "ca-nhan.html",         label: "Cá nhân",      icon: "M12 11.6a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2zM4.8 20a7.4 7.4 0 0 1 14.4 0" }
  ];

  /* Trang pháp lý — không nằm trong thanh điều hướng chính (CK.PAGES) vì
     chúng chỉ được mở từ chân trang, nhưng vẫn phải tìm kiếm được. */
  CK.LEGAL = [
    { id: "terms",    href: "dieu-khoan.html", label: "Điều khoản sử dụng",
      desc: "Quy định về mục đích học tập, trách nhiệm và giới hạn của người dùng",
      icon: "M6.5 3.5h8L19 8v12.5H6.5zM14 3.5V8h5M9.5 12.5h6M9.5 16h4" },
    { id: "privacy",  href: "bao-mat.html",   label: "Chính sách bảo mật",
      desc: "Dữ liệu hồ sơ lưu ngay trong trình duyệt, không gửi đi đâu",
      icon: "M12 3.2 5 6v6c0 4 3 7.3 7 8.8 4-1.5 7-4.8 7-8.8V6zM9.4 12.2l1.9 1.9 3.5-3.6" }
  ];

  /* Danh mục công cụ — dùng cho trang "Tính năng" và chân trang mọi trang */
  CK.TOOLS = [
    { id: "robot",      href: "tools/lab-robot.html",          label: "ROBOT WIDGET",
      desc: "Phòng thí nghiệm robot 6 trục mô phỏng thao tác cơ khí 3D",
      icon: "M6 8h12M8 8V6a4 4 0 0 1 8 0v2M12 11v3m0 0-2.5 2.5M12 14l2.5 2.5M6 18h12" },
    { id: "convert",    href: "tools/quy-doi-diem-so.html",    label: "HỆ THỐNG QUY ĐỔI ĐIỂM SỐ",
      desc: "Quy đổi điểm 10 / thang 5 / thang 4 / thang A theo quy chuẩn HUIT",
      icon: "M7 8h10l-3-3m3 11H7l3 3M18 8a4 4 0 0 1 0 8M6 12a4 4 0 0 0 0-8" },
    { id: "subject",    href: "tools/tinh-diem-hoc-phan.html", label: "TÍNH ĐIỂM HỌC PHẦN",
      desc: "Tính điểm tổng kết môn, điểm thi mục tiêu và mức quy đổi",
      icon: "M5 4.5h14v15H5zM8.5 9h7M8.5 12.5h7M8.5 16h4" },
    { id: "cpa",        href: "tools/tinh-diem-trung-binh.html", label: "TÍNH ĐIỂM TRUNG BÌNH CHUNG TÍCH LŨY",
      desc: "GPA học kỳ, GPA tích lũy và kết luận cảnh báo học vựng",
      icon: "M4 19h16M7 19V9m5 10V5m5 14v-7" },
    { id: "register",   href: "tools/mo-phong-dang-ky-hoc-phan.html", label: "MÔ PHỎNG ĐĂNG KÝ HỌC PHẦN",
      desc: "Chọn môn từ file lịch, tự xếp lớp không trùng tiết, tính học phí",
      icon: "M4.5 5.5h15v13h-15zM8 3.5v4M16 3.5v4M4.5 10h15" },
    { id: "tuition",    href: "tools/tinh-hoc-phi-mon-hoc.html", label: "TÍNH HỌC PHÍ MÔN HỌC",
      desc: "Học phí tín chỉ theo hệ đại học chính quy và chương trình liên thông",
      icon: "M12 3.5 20 8v8l-8 4.5L4 16V8zM12 12l8-4M12 12v8.5M12 12 4 8" },
    { id: "lecturers",  href: "tools/danh-sach-giang-vien.html", label: "DANH SÁCH GIẢNG VIÊN KHOA CƠ KHÍ",
      desc: "Tra cứu học hàm, chức vụ và email liên hệ của giảng viên, viên chức",
      icon: "M8 11a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 8 11zM2.8 20a5.2 5.2 0 0 1 10.4 0M16 5.2a3.2 3.2 0 0 1 0 6M18 20a5.4 5.4 0 0 0-2.4-4.5" }
  ];

  var SUN  = "M12 3v1.5m0 15V21m9-9h-1.5M4.5 12H3m15.36-6.36-1.06 1.06M6.7 17.3l-1.06 1.06M18.36 18.36 17.3 17.3M6.7 6.7 5.64 5.64M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z";
  var MOON = "M20.4 15.4A9 9 0 0 1 8.6 3.6 9 9 0 1 0 20.4 15.4z";
  var MAG  = "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.6-3.6";

  /* Biểu tượng kính-tròn cho kết quả tìm kiếm (2 phần tử: vòng tròn + cán) */
  function icon2(d1, d2) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
           '<circle cx="11" cy="11" r="7"/><path d="' + d2 + '"/></svg>';
  }

  function svg(path, cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
           'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
           '<path d="' + path + '"/></svg>';
  }
  CK.svg = svg;

  /* ── Sáng / tối ─────────────────────────────────────────────────────── */
  var THEME_KEY = "ck-theme";
  CK.theme = {
    current: function () {
      var attr = document.documentElement.getAttribute("data-theme");
      if (attr) return attr;
      return global.matchMedia && global.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    },
    apply: function (mode) {
      document.documentElement.setAttribute("data-theme", mode === "dark" ? "dark" : "light");
      try { localStorage.setItem(THEME_KEY, mode); } catch (e) {}
      var b = document.getElementById("ckThemeBtn");
      if (b) b.innerHTML = svg(mode === "dark" ? SUN : MOON);
      document.dispatchEvent(new CustomEvent("ck:theme", { detail: mode }));
    },
    toggle: function () { CK.theme.apply(CK.theme.current() === "dark" ? "light" : "dark"); }
  };
  try {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved) CK.theme.apply(saved);
  } catch (e) {}

  /* Trang nào nhúng trang khác bằng iframe thì hai tài liệu phải cùng chế độ sáng/tối */
  try {
    window.addEventListener("storage", function (e) {
      if (e.key === THEME_KEY && e.newValue) CK.theme.apply(e.newValue);
    });
  } catch (e) {}

  /* ── Thanh điều hướng ──────────────────────────────────────────────── */
  CK.renderNav = function () {
    var host = document.querySelector("[data-ck-nav]");
    if (!host) return;
    var cur = host.getAttribute("data-ck-nav") || "";

    var links = CK.PAGES.map(function (p) {
      var on = p.id === cur;
      return '<a class="site-nav-link" href="' + CK.url(p.href) + '"' +
             (on ? ' aria-current="page"' : "") + '>' + svg(p.icon) + p.label + '</a>';
    }).join("");

    host.outerHTML =
      '<header class="site-nav"><div class="site-nav-inner glass g2">' +
        '<a class="site-nav-logo" href="' + CK.url("index.html") + '">' +
          '<img src="' + CK.url("assets/logo.png") + '" alt="Logo Trường Đại học Công Thương TP. Hồ Chí Minh" width="44" height="44">' +
          '<span class="nvtxt">' +
            '<span class="nvschool">Đại học Công Thương TP. Hồ Chí Minh</span>' +
            '<span class="nvname">CƠ KHÍ HUIT</span>' +
          '</span>' +
        '</a>' +
        '<nav class="site-nav-links" id="ckNavLinks" aria-label="Điều hướng chính">' + links + '</nav>' +
        '<div class="site-nav-actions">' +
          CK.searchHTML() +
          '<button class="ck-icon-btn site-nav-burger" id="ckBurger" type="button" aria-expanded="false" aria-controls="ckNavLinks" aria-label="Mở menu">' + svg("M4 7h16M4 12h16M4 17h16") + '</button>' +
          '<button class="ck-icon-btn" id="ckThemeBtn" type="button" aria-label="Đổi giao diện sáng/tối" title="Đổi giao diện sáng/tối">' +
            svg(CK.theme.current() === "dark" ? SUN : MOON) +
          '</button>' +
        '</div>' +
      '</div></header>';

    CK.bindSearch();

    var tb = document.getElementById("ckThemeBtn");
    if (tb) tb.addEventListener("click", CK.theme.toggle);

    var bg = document.getElementById("ckBurger");
    var nl = document.getElementById("ckNavLinks");
    if (bg && nl) {
      bg.addEventListener("click", function () {
        var open = nl.classList.toggle("open");
        bg.setAttribute("aria-expanded", open ? "true" : "false");
        /* Menu moblie va o tim kiem deu lo noi tren man hinh -> dong o tim kiem lai */
        if (open) {
          var sw = document.getElementById("ckSearch");
          var sg = document.getElementById("ckSearchToggle");
          if (sw) sw.classList.remove("open");
          if (sg) sg.setAttribute("aria-expanded", "false");
          panelOpen(false);
        }
      });
      document.addEventListener("click", function (e) {
        if (nl.classList.contains("open") && !nl.contains(e.target) && e.target !== bg && !bg.contains(e.target)) {
          nl.classList.remove("open");
          bg.setAttribute("aria-expanded", "false");
        }
      });
    }
  };

  /* ══════════════════════════════════════════════════════════════════
   TÌM KIẾM TRONG THANH ĐIỀU HƯỚNG
   Quét chéo 4 trang + các công cụ + toàn bộ môn học ôn tập.
   Không dấu: "dien" khớp "Điện tử", "co khi" khớp "CƠ KỸ THUẬT".
   ══════════════════════════════════════════════════════════════════ */
  var ICON_BOOK = "M5 4.5h14v15H5zM8.5 9h7M8.5 12.5h7M8.5 16h4";
  var SEARCH_GROUPS = [
    { g: "subject", label: "Môn học ôn tập", max: 6 },
    { g: "tool",    label: "Công cụ",        max: 4 },
    { g: "page",    label: "Trang",          max: 4 }
  ];

  var _idx = null;
  CK.searchIndex = function () {
    if (_idx) return _idx;
    var items = [];
    CK.PAGES.forEach(function (p) {
      items.push({ g: "page", t: p.label, d: "Điều hướng chính", h: CK.url(p.href), i: p.icon });
    });
    (CK.LEGAL || []).forEach(function (l) {
      items.push({ g: "page", t: l.label, d: l.desc, h: CK.url(l.href), i: l.icon });
    });
    items.push({
      g: "page", t: "Báo lỗi hoặc góp ý",
      d: "Gửi góp ý cho quản trị viên",
      h: CK.url("bao-loi.html"), i: "M6 3.5v17M6 4.5h10.6l-1.9 3.6 1.9 3.6H6"
    });
    (CK.TOOLS || []).forEach(function (t) {
      items.push({ g: "tool", t: t.label, d: t.desc, h: CK.url(t.href), i: t.icon });
    });
    (CK.SUBJECTS || []).forEach(function (s) {
      var nf = CK.navFile && CK.navFile(s.slug);
      items.push({
        g: "subject", t: s.name, d: s.catName, i: ICON_BOOK,
        h: nf ? CK.url(nf) : CK.subjectUrl(s.slug), k: s.slug
      });
    });
    /* Bỏ dấu sẵn một lần — không gõ lại mỗi lần bấm phím */
    _idx = items.map(function (x) {
      x.k = x.k || CK.slug(x.t);
      x.ft = CK.fold(x.t);
      x.fk = CK.fold(x.k);
      x.fd = CK.fold(x.d || "");
      return x;
    });
    return _idx;
  };

  /* Trùng khớp càng sát đầu tên càng được ưu tiên cao */
  function searchScore(it, q) {
    if (it.ft === q) return 100;
    if (it.ft.indexOf(q) === 0) return 82;
    if (it.fk === q) return 70;
    if (it.ft.indexOf(" " + q) !== -1) return 58;
    if (it.ft.indexOf(q) !== -1) return 45;
    if (it.fk.indexOf(q) === 0) return 34;
    if (it.fd.indexOf(q) !== -1) return 20;
    return 0;
  }

  CK.searchHTML = function () {
    return '<div class="ck-search" id="ckSearch">' +
      '<div class="ck-search-box">' +
        icon2("", MAG) +
        '<input type="search" id="ckSearchInput" placeholder="Tìm môn học, công cụ…" ' +
          'aria-label="Tìm môn học hoặc công cụ" aria-controls="ckSearchPanel" ' +
          'aria-expanded="false" autocomplete="off" spellcheck="false">' +
        '<button class="clr" id="ckSearchClear" type="button" aria-label="Xoá từ khoá" hidden>' +
          svg("M6 6l12 12M18 6 6 18") + '</button>' +
      '</div>' +
      '<button class="ck-icon-btn ck-search-btn" id="ckSearchToggle" type="button" ' +
        'aria-label="Tìm kiếm" aria-expanded="false">' + icon2("", MAG) + '</button>' +
      '<div class="ck-search-panel glass g3" id="ckSearchPanel" role="listbox" ' +
        'aria-label="Kết quả tìm kiếm" hidden></div>' +
    '</div>';
  };

  function spItem(it, label) {
    return '<a class="sp-item" role="option" href="' + it.h + '">' +
      '<span class="ic">' + (it.g === "subject" ? svg(it.i) : svg(it.i)) + '</span>' +
      '<span class="tx"><b>' + it.t + '</b><span>' + (label || it.d) + '</span></span>' +
    '</a>';
  }

  var SP_FOOT = '<div class="sp-foot">' +
    '<span><kbd>↑</kbd><kbd>↓</kbd> di chuyển</span>' +
    '<span><kbd>Enter</kbd> mở</span>' +
    '<span><kbd>Esc</kbd> đóng</span>' +
  '</div>';

  /* Chưa gõ gì: gợi ý môn vừa làm + lối tắt tới 4 trang */
  function searchIdle() {
    var out = "";
    var recent = [];
    CK.history.bySubject().forEach(function (r) {
      if (recent.length >= 4) return;
      var s = null;
      for (var i = 0; i < CK.SUBJECTS.length; i++) if (CK.SUBJECTS[i].name === r.subject) { s = CK.SUBJECTS[i]; break; }
      if (s) {
        var nf = CK.navFile && CK.navFile(s.slug);
        recent.push({ g: "subject", t: s.name, d: s.catName + " · " + CK.fmtAgo(r.last),
                      h: nf ? CK.url(nf) : CK.subjectUrl(s.slug), i: ICON_BOOK });
      }
    });
    if (recent.length) {
      out += '<div class="sp-group">Ôn gần đây</div>' + recent.map(function (x) { return spItem(x); }).join("");
    }
    out += '<div class="sp-group">Duyệt nhanh</div>' + CK.PAGES.map(function (p) {
      return spItem({ g: "page", t: p.label, d: "Điều hướng chính", h: CK.url(p.href), i: p.icon });
    }).join("");
    return out + SP_FOOT;
  }

  function searchResult(q) {
    var hits = CK.searchIndex()
      .map(function (it) { return { it: it, s: searchScore(it, q) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s || a.it.t.length - b.it.t.length; });

    if (!hits.length) {
      return '<div class="sp-empty"><b>Không tìm thấy “' + escapeHtml(q) + '”</b>' +
             'Thử một từ khoá khung, ví dụ: <em>cơ khí</em>, <em>điện tử</em>, <em>gpa</em>.</div>';
    }

    var out = '<div class="sp-head"><span>Kết quả</span><span>' + hits.length + ' mục</span></div>';
    SEARCH_GROUPS.forEach(function (G) {
      var part = hits.filter(function (x) { return x.it.g === G.g; }).slice(0, G.max);
      if (!part.length) return;
      out += '<div class="sp-group">' + G.label + '</div>' +
             part.map(function (x) { return spItem(x.it); }).join("");
    });
    return out + SP_FOOT;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function panelOpen(open) {
    var panel = document.getElementById("ckSearchPanel");
    var input = document.getElementById("ckSearchInput");
    var wrap = document.getElementById("ckSearch");
    if (!panel || !input || !wrap) return;
    panel.hidden = !open;
    input.setAttribute("aria-expanded", open ? "true" : "false");
    var tg = document.getElementById("ckSearchToggle");
    if (tg) tg.setAttribute("aria-expanded", open ? "true" : "false");
  }

  CK.runSearch = function (raw) {
    var panel = document.getElementById("ckSearchPanel");
    var input = document.getElementById("ckSearchInput");
    var clear = document.getElementById("ckSearchClear");
    if (!panel || !input) return;
    var q = String(raw || "").trim();
    if (clear) clear.hidden = q.length === 0;
    panel.innerHTML = q ? searchResult(CK.fold(q)) : searchIdle();
    panelOpen(true);
  };

  CK.bindSearch = function () {
    var wrap = document.getElementById("ckSearch");
    var input = document.getElementById("ckSearchInput");
    var panel = document.getElementById("ckSearchPanel");
    var clear = document.getElementById("ckSearchClear");
    var tg = document.getElementById("ckSearchToggle");
    if (!wrap || !input || !panel) return;

    input.addEventListener("focus", function () { CK.runSearch(input.value); });
    input.addEventListener("input", function () { CK.runSearch(input.value); });

    if (clear) clear.addEventListener("click", function () {
      input.value = "";
      CK.runSearch("");
      input.focus();
    });

    if (tg) tg.addEventListener("click", function () {
      var open = wrap.classList.toggle("open");
      tg.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) { input.focus(); CK.runSearch(input.value); }
      else panelOpen(false);
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { panelOpen(false); wrap.classList.remove("open"); input.blur(); return; }
      if (e.key === "Enter") e.preventDefault();
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Enter") return;

      var items = panel.querySelectorAll(".sp-item");
      if (!items.length) return;
      var cur = panel.querySelector(".sp-item.is-active");
      if (e.key === "Enter") { if (cur) location.href = cur.getAttribute("href"); return; }

      e.preventDefault();
      var i = cur ? Array.prototype.indexOf.call(items, cur) : -1;
      var n = e.key === "ArrowDown" ? i + 1 : i - 1;
      if (n < 0) n = items.length - 1;
      if (n >= items.length) n = 0;
      if (cur) cur.classList.remove("is-active");
      items[n].classList.add("is-active");
      items[n].scrollIntoView({ block: "nearest" });
    });

    /* Bấm ra ngoài thì đóng bảng kết quả (kể cả ô tìm kiếm trên mobile) */
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) {
        panelOpen(false);
        if (wrap.classList.contains("open")) {
          wrap.classList.remove("open");
          if (tg) tg.setAttribute("aria-expanded", "false");
        }
      }
    });
  };

  /* ── Nút quay lại (cho các trang toàn màn hình) ────────────────────── */
  CK.renderBack = function (label, href) {
    var host = document.querySelector("[data-ck-back]");
    if (!host) return;
    host.outerHTML =
      '<div class="ck-backbar glass g3" style="padding:6px">' +
        '<a class="ck-icon-btn" href="' + (href || CK.url("index.html")) + '">' + svg("M14.5 6 8.5 12l6 6") + (label || "Về trang chủ") + '</a>' +
      '</div>';
  };

  /* ══════════════════════════════════════════════════════════════════════
     TRANG BÁO LỖI
     Nút "Báo lỗi hoặc đáp án sai" ở chân trang mở trang báo-loi.html và tự
     ghi sẵn đường dẫn trang đang xem qua `?from=` — báo lỗi ở đâu là biết
     ngay ở đâu, không phải hỏi lại.

     Trang đó gửi dữ liệu về Google Sheets qua Apps Script; đầu mối nhận
     khai báo trong chính file bao-loi.html (hằng ENDPOINT).
     Mã Apps Script kèm theo: tools/scripts/bao-loi-apps-script.js
     ══════════════════════════════════════════════════════════════════════ */
  CK.reportPageUrl = function () {
    var p = CK.url("bao-loi.html");
    var here = location.href.split("#")[0];
    return here ? p + "?from=" + encodeURIComponent(here) : p;
  };

  /* ── Chân trang ────────────────────────────────────────────────────── */
  CK.renderFooter = function () {
    var host = document.querySelector("[data-ck-footer]");
    if (!host) return;

    var fb    = "https://www.facebook.com/share/1CKqgvSyWo/";
    var year  = 2027;

    var resources = [
      { href: "tinh-nang.html#tools",            label: "Kho đề cương & tài liệu" },
      { href: "tools/lab-robot.html",            label: "Phòng thí nghiệm Robot 3D" },
      { href: "lich-su-lam-bai.html",            label: "Lịch sử làm bài của tôi" },
      { href: "tools/danh-sach-giang-vien.html", label: "Tra cứu giảng viên" }
    ].map(function (r) {
      return '<li><a href="' + CK.url(r.href) + '">' + r.label + '</a></li>';
    }).join("");

    /* Logo Facebook tô đặc — svg() chỉ viết stroke nên dựng riêng */
    var fbIcon =
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="M13.6 21.5v-7.4h2.5l.4-2.9h-2.9V9.4c0-.84.23-1.41 1.44-1.41h1.54V5.32' +
        'A20.6 20.6 0 0 0 14.3 5.2c-2.15 0-3.62 1.31-3.62 3.72v2.19H8.02v2.9h2.66v7.49h2.92z"/>' +
      '</svg>';

    host.outerHTML =
      '<footer class="site-footer">' +
        '<div class="site-footer-inner glass g1">' +

          '<div class="site-footer-top">' +

            /* --- Cột 1 · thương hiệu --- */
            '<div class="site-footer-brand-col">' +
              '<div class="site-footer-brand">' +
                '<img src="' + CK.url("assets/logo.png") + '" alt="Logo HUIT" width="44" height="44">' +
                '<h3>CƠ KHÍ HUIT - fan Tymzang</h3>' +
              '</div>' +
              '<p class="site-footer-about">Kết Nối Tri Thức – Chia Sẻ Tài Liệu – Đồng Hành ' +
                'Cùng Sinh Viên Kỹ Thuật. Học Công Thương TP HCM.</p>' +
              '<p class="site-footer-credit">' +
                svg("M9.5 7 5.5 12l4 5M14.5 7l4 5-4 5") +
                'Phát triển chuyên sâu bởi ' +
                '<a href="' + fb + '" target="_blank" rel="noopener">TRINH GIA PHONG</a>' +
              '</p>' +
              '<p class="site-footer-cta">' +
                '<a class="ck-btn" href="' + fb + '" target="_blank" rel="noopener">' +
                  fbIcon + 'Kết nối Facebook (Trịnh Gia Phong)' +
                '</a>' +
              '</p>' +
            '</div>' +

            /* --- Cột 2 · tài nguyên --- */
            '<nav class="site-footer-col" aria-label="Tài nguyên và học tập">' +
              '<h4>Tài nguyên &amp; Học tập</h4>' +
              '<ul class="site-footer-list">' + resources + '</ul>' +
            '</nav>' +

            /* --- Cột 3 · hỗ trợ --- */
            '<div class="site-footer-col">' +
              '<h4>Hỗ trợ &amp; Đóng góp</h4>' +
              '<p class="site-footer-help-text">Phát hiện sai sót trong nội dung bài học hoặc đáp án? ' +
                'Hãy báo lỗi cho chúng tôi.</p>' +
              '<p class="site-footer-cta">' +
                '<a class="ck-btn" href="' + CK.reportPageUrl() + '">' +
                  svg("M6 3.5v17M6 4.5h10.6l-1.9 3.6 1.9 3.6H6") +
                  'Báo lỗi hoặc đáp án sai' +
                '</a>' +
              '</p>' +
            '</div>' +

          '</div>' +

          /* --- Hàng dưới --- */
          '<div class="site-footer-bottom">' +
            '<span>© ' + year + ' CƠ KHÍ HUIT – Thành viên Tymzang · ' +
              'Nền tảng học thuật phi lợi nhuận cho sinh viên HUIT.</span>' +
            '<nav aria-label="Liên kết pháp lý">' +
              '<a href="' + CK.url("dieu-khoan.html") + '">Điều khoản sử dụng</a>' +
              '<a href="' + CK.url("bao-mat.html") + '">Chính sách bảo mật</a>' +
              '<a href="https://www.huit.edu.vn" target="_blank" rel="noopener">Tài trợ máy chủ</a>' +
            '</nav>' +
          '</div>' +

        '</div>' +
      '</footer>';
  };

  /* ── Toast ─────────────────────────────────────────────────────────── */
  CK.toast = function (msg, title) {
    var host = document.getElementById("ckToastHost");
    if (!host) {
      host = document.createElement("div");
      host.id = "ckToastHost";
      host.className = "ck-toast-host";
      host.setAttribute("aria-live", "polite");
      document.body.appendChild(host);
    }
    var t = document.createElement("div");
    t.className = "ck-toast glass g3";
    t.innerHTML = '<span class="tico">' + svg("M5 12.5 10 17.5 19 7") + '</span>' +
                  '<span><b>' + (title || "Thông báo") + '</b>' + msg + '</span>';
    host.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("show"); });
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () { t.remove(); }, 260);
    }, 5000);
  };

  /* ── Kho dữ liệu cục bộ ────────────────────────────────────────────── */
  function store(key, fallback) {
    return {
      read: function () {
        try { return JSON.parse(localStorage.getItem(key)) || fallback; }
        catch (e) { return fallback; }
      },
      write: function (v) {
        try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {}
      }
    };
  }

  /* Lịch sử làm bài — mảng các phiên, mới nhất đứng đầu */
  CK.HISTORY_KEY = "ck-history-v1";
  CK.history = {
    all: function () { return store(CK.HISTORY_KEY, []).read(); },
    add: function (entry) {
      var list = CK.history.all();
      list.unshift(entry);
      if (list.length > 500) list = list.slice(0, 500);
      store(CK.HISTORY_KEY, []).write(list);
      document.dispatchEvent(new CustomEvent("ck:history", { detail: entry }));
      return entry;
    },
    clear: function () { store(CK.HISTORY_KEY, []).write([]); },
    remove: function (id) {
      store(CK.HISTORY_KEY, []).write(CK.history.all().filter(function (e) { return e.id !== id; }));
    },
    /* Tổng hợp theo môn học */
    bySubject: function () {
      var map = {};
      CK.history.all().forEach(function (e) {
        var k = e.subject || "Khác";
        if (!map[k]) map[k] = { subject: k, cat: e.cat || "", runs: 0, total: 0, correct: 0, best: 0, last: 0 };
        map[k].runs += 1;
        map[k].total += e.total || 0;
        map[k].correct += e.correct || 0;
        map[k].best = Math.max(map[k].best, e.pct || 0);
        map[k].last = Math.max(map[k].last, e.ts || 0);
      });
      return Object.keys(map).map(function (k) { return map[k]; })
        .sort(function (a, b) { return b.last - a.last; });
    },
    /* Chuỗi phiên liên tiếp */
    streak: function () {
      var days = {};
      CK.history.all().forEach(function (e) {
        var d = new Date(e.ts || Date.now());
        days[d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate()] = true;
      });
      var n = 0, cur = new Date();
      cur.setHours(0, 0, 0, 0);
      if (!days[cur.getFullYear() + "-" + (cur.getMonth() + 1) + "-" + cur.getDate()]) {
        cur.setDate(cur.getDate() - 1);
      }
      while (days[cur.getFullYear() + "-" + (cur.getMonth() + 1) + "-" + cur.getDate()]) {
        n++; cur.setDate(cur.getDate() - 1);
      }
      return n;
    }
  };

  /* Hồ sơ sinh viên */
  CK.PROFILE_KEY = "ck-profile-v1";
  /* Hồ sơ là nguồn sự thật duy nhất của thông tin sinh viên. Ngoài trang Cá nhân
     ghi vào đây, pmt-ems/pmt-ems.html còn ĐỌC khoá này để điền sẵn màn thông tin
     sinh viên — chiều đồng bộ chỉ đi từ Cá nhân sang PMT-EMS, không ngược lại. */
  CK.DEFAULT_PROFILE = {
    name: "", mssv: "", lop: "", khoa: "Khoa Công nghệ Cơ khí",
    nganh: "Cơ khí", nam: "", ngaysinh: "", gioitinh: "", noisinh: "",
    email: "", phone: "", goal: 3.5, note: "",
    savedAt: 0
  };
  CK.profile = {
    get: function () {
      var s = store(CK.PROFILE_KEY, CK.DEFAULT_PROFILE).read();
      var out = {};
      Object.keys(CK.DEFAULT_PROFILE).forEach(function (k) { out[k] = s[k] !== undefined ? s[k] : CK.DEFAULT_PROFILE[k]; });
      return out;
    },
    save: function (obj) {
      store(CK.PROFILE_KEY, CK.DEFAULT_PROFILE).write(obj);
      document.dispatchEvent(new CustomEvent("ck:profile", { detail: obj }));
    }
  };

  /* Tuỳ chọn hiển thị — trang Cá nhân ghi, các trang khác đọc.
     Giao diện sáng/tối KHÔNG nằm ở đây: nó thuộc CK.theme (ck-theme). */
  CK.PREF_KEY = "ck-pref-v1";
  CK.prefs = {
    get: function () {
      var p = store(CK.PREF_KEY, {}).read();
      return (p && typeof p === "object" && !Array.isArray(p)) ? p : {};
    },
    set: function (patch) {
      var p = CK.prefs.get();
      Object.keys(patch).forEach(function (k) { p[k] = patch[k]; });
      store(CK.PREF_KEY, {}).write(p);
      return p;
    },
    /* Đồng hồ 24 giờ — mặc định có, vì 24 giờ là chuẩn ở Việt Nam */
    h24: function () { return CK.prefs.get().h24 !== false; }
  };

  /* ── Điểm/GPA dùng chung ────────────────────────────────────────────────
     Mỗi công cụ tính điểm tự lưu danh sách môn của riêng nó, vào khoá riêng.
     CK.gpa chỉ ĐỌC và gộp lại — không công cụ nào ghi thêm ở đây, nên không
     có chuyện trang này đè trang kia. Thêm công cụ mới = thêm một dòng
     vào CK.GPA_SOURCES. */
  CK.GPA_KEY = "ck-gpa-v1";   /* khoá cũ, không còn dùng — chỉ để dọn dẹp */

  CK.GRADE4 = { "A": 4, "B+": 3.5, "B": 3, "C+": 2.5, "C": 2, "D+": 1.5, "D": 1, "F": 0 };

  CK.GPA_SOURCES = [
    { key: "gradeMaster_subjects", label: "Quy đổi điểm số",
      read: function (l) { return l.map(function (s) {
        return { name: s.name, credits: s.credits, gpa4: s.score4Num }; }); } },
    { key: "clevo_saved_courses_v2", label: "Tính điểm học phần",
      read: function (l) { return l.map(function (s) {
        return { name: s.name, credits: s.credits, gpa4: s.gpa4 }; }); } },
    { key: "gpa-calculator-courses", label: "Tính điểm trung bình",
      read: function (l) { return l.map(function (s) {
        return { name: s.name, credits: s.credits, gpa4: CK.GRADE4[s.grade] }; }); } }
  ];

  CK.gpa = {
    /* Danh sách môn đã gộp. Trong một nguồn thì giữ hết (học lại vẫn tính);
       cùng tên môn ở hai nguồn khác nhau thì chỉ tính một lần, ưu tiên nguồn
       đứng trước. */
    get: function () {
      var seen = {}, out = [], sources = [];
      CK.GPA_SOURCES.forEach(function (src) {
        var list = store(src.key, []).read();
        if (!Array.isArray(list)) return;
        var mine = {}, got = 0;
        src.read(list).forEach(function (s) {
          var k = CK.fold(s.name || "");
          if (!k) return;
          mine[k] = 1;
          if (seen[k]) return;
          got++;
          out.push({ name: s.name, credits: +s.credits || 0, gpa4: +s.gpa4 || 0, src: src.label });
        });
        Object.keys(mine).forEach(function (k) { seen[k] = 1; });
        if (got) sources.push(src.label);
      });
      return { subjects: out, sources: sources };
    },
    clear: function () {
      CK.GPA_SOURCES.forEach(function (s) { store(s.key, []).write([]); });
      try { localStorage.removeItem(CK.GPA_KEY); } catch (e) {}
    }
  };

  /* ── Định dạng ─────────────────────────────────────────────────────── */
  CK.fmtDate = function (ts) {
    var d = new Date(ts || Date.now());
    var p = function (n) { return String(n).padStart(2, "0"); };
    return p(d.getDate()) + "/" + p(d.getMonth() + 1) + "/" + d.getFullYear();
  };
  CK.fmtTime = function (ts) {
    var d = new Date(ts || Date.now());
    var p = function (n) { return String(n).padStart(2, "0"); };
    return p(d.getHours()) + ":" + p(d.getMinutes());
  };
  CK.fmtAgo = function (ts) {
    var s = Math.max(0, (Date.now() - ts) / 1000);
    if (s < 60) return "vừa xong";
    if (s < 3600) return Math.floor(s / 60) + " phút trước";
    if (s < 86400) return Math.floor(s / 3600) + " giờ trước";
    if (s < 604800) return Math.floor(s / 86400) + " ngày trước";
    return CK.fmtDate(ts);
  };
  CK.pad = function (n) { return String(n).padStart(2, "0"); };
  /* Bỏ dấu tiếng Việt + đưa "đ" về "d". Dựng regex từ mã ký tự để tránh
     phụ thuộc vào cách trình soạn thẻ thoại. */
  CK.fold = function (s) {
    var DIAC = new RegExp("[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036F) + "]", "g");
    var D    = new RegExp("[" + String.fromCharCode(0x0110) + String.fromCharCode(0x0111) + "]", "g");
    return String(s).toLowerCase().normalize("NFD").replace(DIAC, "").replace(D, "d");
  };
  CK.slug = function (s) {
    return CK.fold(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  };

  /* ── Chiều cao thanh điều hướng ──────────────────────────────────────
     Ghi ra --ck-nav-h để các trang công cụ ghim thanh tiêu đề ngay
     dưới thanh nav, và chừa chỗ khi bấm vào neo (#muc) trong trang.  */
  CK.syncNavHeight = function () {
    var root = document.documentElement;

    /* 1. Chiều cao thanh điều hướng (dùng làm độ lệch cho thanh tiêu đề) */
    var nav = document.querySelector(".site-nav");
    var navH = 0;
    if (nav) navH = Math.round(nav.getBoundingClientRect().height) + 10;
    root.style.setProperty("--ck-nav-h", navH + "px");

    /* 2. Gỡ khoảng trống đã chừa ở lần trước, đo lại từ đầu */
    Array.prototype.forEach.call(document.querySelectorAll("[data-ck-bar-host]"), function (el) {
      el.style.paddingTop = "";
      el.removeAttribute("data-ck-bar-host");
    });

    /* 3. Thanh tiêu đề dán cứng: chừa chỗ ở THẺ CHA của nó
          (không chừa ở <body>, vì <body> cũng chứa thanh điều hướng —
           chừa ở body sẽ đẩy thanh điều hướng xuống dưới thanh tiêu đề). */
    var bar = document.querySelector(".topbar") || document.querySelector(".toolbar");
    var barH = 0;
    if (bar && global.getComputedStyle(bar).position === "fixed" && bar.parentElement) {
      var host = bar.parentElement;
      barH = Math.round(bar.getBoundingClientRect().height) + 24; /* 12px trên + 12px dưới */
      var base = parseFloat(global.getComputedStyle(host).paddingTop) || 0;
      host.setAttribute("data-ck-bar-host", "");
      host.style.paddingTop = (base + barH) + "px";
    }
    root.style.setProperty("--ck-bar-h", barH + "px");
    root.style.scrollPaddingTop = (navH + barH + 16) + "px";
  };

  /* ── Khởi động ─────────────────────────────────────────────────────── */
  CK.initShell = function () {
    CK.renderNav();
    CK.renderFooter();
    if (CK.theme.current() === "dark" && document.getElementById("ckThemeBtn")) {
      document.getElementById("ckThemeBtn").innerHTML = svg(SUN);
    }
    CK.syncNavHeight();
    /* Nav đổi chiều cao khi đổi kích thước, đổi chế độ sáng/tối hoặc font tải xong */
    var timer;
    var re = function () { clearTimeout(timer); timer = setTimeout(CK.syncNavHeight, 120); };
    global.addEventListener("resize", re);
    global.addEventListener("load", re);
    document.addEventListener("ck:theme", re);
    if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
      document.fonts.ready.then(re).catch(function () {});
    }
    if (global.ResizeObserver) {
      try {
        var ro = new global.ResizeObserver(re);
        ["site-nav", "topbar", "toolbar"].forEach(function (sel) {
          var el = document.querySelector("." + sel);
          if (el) ro.observe(el);
        });
      } catch (e) {}
    }
  };

  /* Chạy ngay nếu DOM đã sẵn sàng, nếu không thì đợi tới khi phần thân đọc xong —
     nhờ vậy thẻ <script> có thể đặt ở bất kỳ đâu trong thân tài liệu. */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", CK.initShell);
  } else {
    CK.initShell();
  }

  global.CK = CK;
})(window);
