/* ============================================================================
   CƠ KHÍ HUIT — LỊCH SỬ LÀM BÀI (dùng chung)
   ----------------------------------------------------------------------------
   Một nguồn duy nhất cho việc GHI lịch sử làm bài. Trang "Lịch sử làm bài" và
   các thẻ "đã làm X lượt" đều ĐỌC khoá localStorage ck-history-v1; file này
   là nơi DUY NHẤT ghi vào khoá đó, nên mọi trang làm bài (kể cả các trang trắc
   nghiệm độc lập không nạp app.js) đều ghi vào cùng một khoá.

   CK.history      — khoá lưu trữ (all/add/remove/clear/bySubject/streak)
   CK.recordHistory(result, meta) — ghi một phiên từ kết quả trắc nghiệm.

   Nếu app.js đã nạp trước (trang chủ, Lịch sử…) thì CK.history của app.js
   được giữ nguyên, file này chỉ bổ sung CK.recordHistory.
   ========================================================================= */
(function (g) {
  "use strict";
  var CK = g.CK = g.CK || {};
  var KEY = CK.HISTORY_KEY || "ck-history-v1";
  CK.HISTORY_KEY = KEY;

  function read() {
    try { return JSON.parse(g.localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function write(v) {
    try { g.localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
  }

  /* Chỉ tự dựng khoá lưu trữ khi trang chưa có CK.history (vd: trang trắc
     nghiệm độc lập). Trang nạp app.js giữ nguyên bản đầy đủ của app.js. */
  if (!CK.history) {
    CK.history = {
      all: read,
      add: function (entry) {
        var list = read();
        list.unshift(entry);
        if (list.length > 500) list = list.slice(0, 500);
        write(list);
        g.document.dispatchEvent(new g.CustomEvent("ck:history", { detail: entry }));
        return entry;
      },
      clear: function () { write([]); },
      remove: function (id) { write(read().filter(function (e) { return e.id !== id; })); },
      bySubject: function () {
        var map = {};
        read().forEach(function (e) {
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
      streak: function () {
        var days = {};
        read().forEach(function (e) {
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
  }

  /* Suy metadata (slug môn, bài thi, nhóm môn) từ đường dẫn trang.
     qp-an/qpan1-de-3-quiz.html        -> { slug: "qpan1", part: "de-3", partName: "Đề 3",
                                           subject: "Quốc phòng 1", cat/catName: "GDQP-AN" }
     qp-an/thi-QPAN1-ngau-nhien.html   -> { slug: "qpan1", subject: "Quốc phòng 1", ... }  */
  function metaFromPath() {
    var out = {};
    var parts = String(g.location && g.location.pathname || "").replace(/\\/g, "/").split("/");
    var file = parts[parts.length - 1] || "";
    var dir = parts[parts.length - 2] || "";
    var m = /^(?:qpan[12]-)?de-(\d+)-quiz\.html$/i.exec(file);
    if (m) {
      out.part = "de-" + m[1];
      out.partName = "Đề " + Number(m[1]);
    }
    if (/^qp-an$/i.test(dir)) {
      if (/qpan1/i.test(file) || /QPAN1/i.test(file)) {
        out.slug = "qpan1"; out.subject = "Quốc phòng 1";
      } else if (/qpan2/i.test(file) || /QPAN2/i.test(file)) {
        out.slug = "qpan2"; out.subject = "Quốc phòng 2";
      }
      out.cat = "GDQP-AN"; out.catName = "GDQP-AN";
    } else if (/^quan-tri-chat-luong$/i.test(dir)) {
      out.slug = "quan-tri-chat-luong"; out.subject = "QUẢN TRỊ CHẤT LƯỢNG";
      out.cat = "ĐẠI CƯƠNG LÝ LUẬN CHÍNH TRỊ & MÔN KHÁC"; out.catName = "Đại cương lý luận chính trị & môn khác";
    } else if (/^quan-tri-chuoi-cung-ung$/i.test(dir)) {
      out.slug = "quan-tri-chuoi-cung-ung"; out.subject = "QUẢN TRỊ CHUỖI CUNG ỨNG";
      out.cat = "ĐẠI CƯƠNG LÝ LUẬN CHÍNH TRỊ & MÔN KHÁC"; out.catName = "Đại cương lý luận chính trị & môn khác";
    } else if (/^marketing-can-ban$/i.test(dir)) {
      out.slug = "marketing-can-ban"; out.subject = "MARKETING CĂN BẢN";
      out.cat = "ĐẠI CƯƠNG LÝ LUẬN CHÍNH TRỊ & MÔN KHÁC"; out.catName = "Đại cương lý luận chính trị & môn khác";
    } else if (/^ky-nang-giao-tiep$/i.test(dir)) {
      out.slug = "ky-nang-giao-tiep"; out.subject = "KỸ NĂNG GIAO TIẾP";
      out.cat = "ĐẠI CƯƠNG LÝ LUẬN CHÍNH TRỊ & MÔN KHÁC"; out.catName = "Đại cương lý luận chính trị & môn khác";
    } else if (/^lich-su-dang-cong-san-viet-nam$/i.test(dir)) {
      out.slug = "lich-su-dang-cong-san-viet-nam"; out.subject = "LỊCH SỬ ĐẢNG CỘNG SẢN VIỆT NAM";
      out.cat = "ĐẠI CƯƠNG LÝ LUẬN CHÍNH TRỊ & MÔN KHÁC"; out.catName = "Đại cương lý luận chính trị & môn khác";
    } else if (/^tu-tuong-ho-chi-minh$/i.test(dir)) {
      out.slug = "tu-tuong-ho-chi-minh"; out.subject = "TƯ TƯỞNG HỒ CHÍ MINH";
      out.cat = "ĐẠI CƯƠNG LÝ LUẬN CHÍNH TRỊ & MÔN KHÁC"; out.catName = "Đại cương lý luận chính trị & môn khác";
    } else if (/^triet-hoc-mac-lenin$/i.test(dir)) {
      out.slug = "triet-hoc-mac-lenin"; out.subject = "TRIẾT HỌC MÁC-LÊNIN";
      out.cat = "ĐẠI CƯƠNG LÝ LUẬN CHÍNH TRỊ & MÔN KHÁC"; out.catName = "Đại cương lý luận chính trị & môn khác";
    } else if (/^chu-nghia-xa-hoi-khoa-hoc$/i.test(dir)) {
      out.slug = "chu-nghia-xa-hoi-khoa-hoc"; out.subject = "CHỦ NGHĨA XÃ HỘI KHOA HỌC";
      out.cat = "ĐẠI CƯƠNG LÝ LUẬN CHÍNH TRỊ & MÔN KHÁC"; out.catName = "Đại cương lý luận chính trị & môn khác";
    } else if (/^kinh-te-chinh-tri-mac-lenin$/i.test(dir)) {
      out.slug = "kinh-te-chinh-tri-mac-lenin"; out.subject = "KINH TẾ CHÍNH TRỊ MÁC-LÊNIN";
      out.cat = "ĐẠI CƯƠNG LÝ LUẬN CHÍNH TRỊ & MÔN KHÁC"; out.catName = "Đại cương lý luận chính trị & môn khác";
    } else if (/^logic-hoc-dai-cuong$/i.test(dir)) {
      out.slug = "logic-hoc-dai-cuong"; out.subject = "LOGIC HỌC ĐẠI CƯƠNG";
      out.cat = "TOÁN HỌC & KHOA HỌC"; out.catName = "Toán học & Khoa học";
    }
    return out;
  }

  /* Ghi một phiên làm bài.
     result: { total, correct, ratio|pct, seconds|sec, subject }
     meta:   { slug, part, partName, subject, cat, catName } — thiếu thì suy từ
             đường dẫn trang. */
  CK.recordHistory = function (result, meta) {
    result = result || {};
    meta = meta || {};
    var fromPath = metaFromPath();
    var now = Date.now();
    var total = Number(result.total) || 0;
    var correct = Number(result.correct) || 0;
    var pct = result.pct != null ? Number(result.pct)
            : result.ratio != null ? Number(result.ratio)
            : (total ? Math.round(correct / total * 100) : 0);
    var sec = result.sec != null ? Number(result.sec)
            : result.seconds != null ? Number(result.seconds) : 0;
    return CK.history.add({
      id: "h" + now.toString(36) + Math.random().toString(36).slice(2, 7),
      ts: now,
      subject: meta.subject || result.subject || fromPath.subject || "Trắc nghiệm",
      cat: meta.cat || fromPath.cat || "",
      catName: meta.catName || fromPath.catName || "",
      slug: meta.slug || fromPath.slug || "",
      part: meta.part || fromPath.part || "",
      partName: meta.partName || fromPath.partName || "",
      total: total,
      correct: correct,
      pct: Math.round(pct) || 0,
      sec: Math.max(0, sec) || 0
    });
  };
})(window);
