/* ============================================================================
   CƠ KHÍ HUIT — DỮ LIỆU THỜI GIAN BIỂU (nguồn dùng chung)
   ----------------------------------------------------------------------------
   Widget trên Trang chủ và trang "Thời gian biểu" đọc cùng một bảng dữ liệu
   này, nên không thể lệch nhau.
   Theo thông báo số 1427/TB-ĐCT ngày 29/12/2025, áp dụng từ HK2 năm học 2025-2026.
   ========================================================================= */
(function (g) {
  "use strict";

  var P = function (n, s, e) { return { n: n, s: s, e: e }; };
  var mk = function (list) { return list.map(function (r) { return P(r[0], r[1], r[2]); }); };

  var REGULAR = mk([
    [1,  "06:30", "07:20"], [2,  "07:20", "08:10"], [3,  "08:10", "09:00"],
    [4,  "09:30", "10:20"], [5,  "10:20", "11:10"], [6,  "11:10", "12:00"],
    [7,  "12:30", "13:20"], [8,  "13:20", "14:10"], [9,  "14:10", "15:00"],
    [10, "15:30", "16:20"], [11, "16:20", "17:10"], [12, "17:10", "18:00"],
    [13, "18:10", "19:00"], [14, "19:00", "19:50"], [15, "19:50", "20:40"], [16, "20:40", "21:30"]
  ]);

  var LAB = mk([
    [1,  "07:00", "07:50"], [2,  "07:50", "08:40"], [3,  "08:40", "09:30"],
    [4,  "09:30", "10:20"], [5,  "10:20", "11:10"], [6,  "11:10", "12:00"],
    [7,  "12:30", "13:20"], [8,  "13:20", "14:10"], [9,  "14:10", "15:00"],
    [10, "15:00", "15:50"], [11, "15:50", "16:40"], [12, "16:40", "17:30"],
    [13, "18:00", "18:50"], [14, "18:50", "19:40"], [15, "19:40", "20:30"], [16, "20:30", "21:20"]
  ]);

  g.CK = g.CK || {};

  /* Tuỳ chọn đồng hồ 24 giờ — app.js định nghĩa CK.prefs, đọc ở đây một lần */
  var H24 = !!(g.CK.prefs && g.CK.prefs.h24());

  g.CK.TIMETABLE = {
    sets: [
      {
        id: "theory", name: "Học lý thuyết",
        desc: "Phòng lý thuyết, phòng Zoom và thực hành tại phòng lý thuyết.",
        note: "Có nghỉ giải lao 30 phút giữa các tiết trong buổi sáng và buổi chiều.",
        periods: REGULAR
      },
      {
        id: "lab", name: "Học thực hành",
        desc: "Phòng máy tính, phòng thực hành, phòng thí nghiệm, GDQP-AN và GDTC.",
        note: "Các lớp học thí nghiệm/thực hành không nghỉ giải lao.",
        periods: LAB
      },
      {
        id: "exam", name: "Giờ thi",
        desc: "Lịch giờ áp dụng cho các ca thi trong kỳ.",
        note: "Giờ thi tính theo từng tiết, không có giờ nghỉ giữa các tiết.",
        periods: LAB
      }
    ],
    sessions: [
      { name: "Buổi sáng",  from: 1,  to: 6  },
      { name: "Buổi chiều", from: 7,  to: 12 },
      { name: "Buổi tối",   from: 13, to: 16 }
    ],

    toMin: function (t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; },

    /* Định dạng giờ cho mọi nơi hiển thị (tiết học, lịch thi).
       Tuỳ chọn "Đồng hồ 24 giờ" ở trang Cá nhân quyết định hiển thị
       24h (7h50) hay 12h kèm SA/CH (7h50 SA). Đọc một lần lúc tải —
       đổi tuỳ chọn thì tải lại trang. */
    show: function (t) {
      var m = this.toMin(t), h = Math.floor(m / 60), mm = g.CK.pad(m % 60);
      if (!H24) return (h % 12 === 0 ? 12 : h % 12) + "h" + mm + (h < 12 ? " SA" : " CH");
      return h + "h" + mm;
    },
    isH24: function () { return H24; },
    sessionOf: function (n) {
      var s = this.sessions;
      for (var i = 0; i < s.length; i++) if (n >= s[i].from && n <= s[i].to) return i;
      return -1;
    },
    /* Giờ Việt Nam hiện tại, tính bằng phút kể từ 00:00 */
    nowMinutes: function () {
      try {
        var parts = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
        }).formatToParts(new Date());
        var get = function (t) { return +parts.find(function (p) { return p.type === t; }).value; };
        return (get("hour") % 24) * 60 + get("minute") + get("second") / 60;
      } catch (e) {
        var d = new Date();
        return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
      }
    },
    /* Mô tả trạng thái tại thời điểm t (phút) */
    statusAt: function (t, set) {
      var per = (set || this.sets[0]).periods.map(function (p) {
        return { n: p.n, s: p.s, e: p.e, a: this.toMin(p.s), b: this.toMin(p.e) };
      }, this);
      var cur = per.find(function (p) { return t >= p.a && t < p.b; });
      var next = per.find(function (p) { return p.a > t; });
      var prev = per.slice().reverse().find(function (p) { return p.b <= t; });
      if (cur) return { kind: "in", cur: cur, next: next, pct: (t - cur.a) / (cur.b - cur.a) };
      if (next && prev) return { kind: "rest", cur: prev, next: next, pct: (t - prev.b) / (next.a - prev.b) };
      if (next) return { kind: "before", next: next };
      return { kind: "done", prev: prev };
    }
  };

  /* Định dạng khoảng thời gian còn lại: "1 giờ 12 phút" */
  g.CK.fmtLeft = function (totalMin) {
    var sec = Math.max(0, Math.ceil(totalMin * 60));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    var p = function (n) { return String(n).padStart(2, "0"); };
    if (h > 0) return h + " giờ " + p(m) + " phút";
    if (m >= 1) return m + " phút";
    return s + " giây";
  };
})(window);