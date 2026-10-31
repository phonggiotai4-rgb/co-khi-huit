/* ============================================================================
   CƠ KHÍ HUIT — DANH MỤC MÔN HỌC ÔN TẬP
   ----------------------------------------------------------------------------
   Nguồn: mục "LÒ ÔN LUYỆN (CÁC MÔN HỌC)" trên trang tham chiếu.
   Giữ nguyên THỨ TỰ và CHỮ IN HOA như bản gốc.
   Mỗi môn có `slug` sinh tự động từ tên (CK.slug) — dùng cho index.html?m=<slug>
   ========================================================================= */
(function (g) {
  "use strict";

  var RAW = [
    ["GDQP-AN", "GDQP-AN",
      ["QPAN1", "QPAN2"]],

    ["ĐẠI CƯƠNG LÝ LUẬN CHÍNH TRỊ & MÔN KHÁC", "Đại cương lý luận chính trị & môn khác",
      ["TRIẾT HỌC MÁC-LÊNIN",
       "TƯ TƯỞNG HỒ CHÍ MINH",
       "LỊCH SỬ ĐẢNG CỘNG SẢN VIỆT NAM",
       "CHỦ NGHĨA XÃ HỘI KHOA HỌC",
       "KINH TẾ CHÍNH TRỊ MÁC-LÊNIN",
       "QUẢN TRỊ HỌC",
       "QUẢN TRỊ CHẤT LƯỢNG",
       "QUẢN TRỊ CHUỖI CUNG ỨNG",
       "KỸ NĂNG GIAO TIẾP",
       "MARKETING CĂN BẢN",
       "PHÁP LUẬT ĐẠI CƯƠNG",
       "TÂM LÝ HỌC ĐẠI CƯƠNG",
       "HỆ ĐIỀU HÀNH",
       "QUẢN TRỊ HỆ THỐNG MẠNG K14"]],

    ["ANH VĂN", "Anh văn",
      ["CÁC ĐỀ ÔN THI ANH VĂN ĐẦU VÀO HUIT",
       "ANH VĂN SƠ CẤP (0)",
       "ANH VĂN 1",
       "ANH VĂN 2",
       "ANH VĂN 3",
       "ANH VĂN CHUYÊN NGÀNH CƠ KHÍ",
       "ForumFlash",
       "ByeTOIEC"]],
    ["TOÁN HỌC & KHOA HỌC", "Toán học & Khoa học",
      ["GIẢI TÍCH",
       "ĐẠI SỐ TUYẾN TÍNH",
       "XÁC SUẤT VÀ THỐNG KÊ",
       "ĐỔI MỚI SÁNG TẠO VÀ KHỞI NGHIỆP",
       "PHƯƠNG PHÁP NGHIÊN CỨU KHOA HỌC",
       "LOGIC HỌC ĐẠI CƯƠNG",
       "VẬT LÍ KĨ THUẬT",
       "VẬT LÍ ĐẠI CƯƠNG",
       "QUY HOẠCH TUYẾN TÍNH",
       "QUY HOẠCH THỰC NGHIỆM",
       "PHƯƠNG PHÁP TÍNH",
       "TOÁN KỸ THUẬT",
       "TOÁN KINH TẾ",
       "THỐNG KÊ CHO KHOA HỌC XÃ HỘI"]],

    ["CƠ KHÍ", "Cơ khí",
      ["VẼ KĨ THUẬT",
       "VẼ CƠ KHÍ",
       "CƠ KHÍ ĐẠI CƯƠNG",
       "CƠ KỸ THUẬT",
       "NGUYÊN LÝ MÁY",
       "ROBOT CÔNG NGHIỆP",
       "DUNG SAI LẮP GẮP",
       "TH KỸ THUẬT ĐO LƯỜNG CK",
       "CÔNG NGHỆ CNC",
       "AN TOÀN LAO ĐỘNG",
       "SỨC BỀN VẬT LIỆU",
       "CHI TIẾT MÁY",
       "TRUYỀN ĐỘNG THỦY LỰC VÀ KHÍ NÉN",
       "CƠ LƯU CHẤT",
       "KỸ THUẬT NHIỆT",
       "MÁY CHẾ BIẾN NÔNG SẢN VÀ THỰC PHẨM",
       "VẬT LIỆU KỸ THUẬT",
       "QUẢN LÝ DỰ ÁN CHO KỸ SƯ",
       "QUẢN LÝ VÀ KỸ THUẬT BẢO TRÌ CÔNG NGHIỆP",
       "THIẾT KẾ HỆ THỐNG CƠ ĐIỆN TỬ",
       "THIẾT KẾ VÀ ĐỔI MỚI SẢN PHẨM",
       "ĐỘNG LỰC HỌC HỆ CƠ ĐIỆN TỬ",
       "CÔNG NGHỆ THIẾT KẾ KHUÔN MẪU",
       "CÔNG NGHỆ IN 3D"]],

    ["ĐIỆN TỬ", "Điện tử",
      ["KỸ THUẬT ĐIỆN",
       "KỸ THUẬT SỐ",
       "KỸ THUẬT ĐIỆN TỬ",
       "LÝ THUYẾT ĐIỀU KHIỂN TỰ ĐỘNG",
       "VI ĐIỀU KHIỂN",
       "CẢM BIẾN CƠ CẤU CHẤP HÀNH",
       "ĐIỀU KHIỂN LOGIC KHẢ TRÌNH (PLC)",
       "HỆ THỐNG TRUYỀN THÔNG CƠ ĐIỆN TỬ",
       "HỆ THỐNG SẢN XUẤT TỰ ĐỘNG",
       "ĐIỆN TỬ CÔNG SUẤT",
       "TRANG BỊ ĐIỆN - ĐIỆN TỬ TRONG MÁY CÔNG NGHIỆP",
       "ĐIỀU KHIỂN CÁC HỆ THỐNG SERVO",
       "ĐIỀU KHIỂN QUÁ TRÌNH",
       "HỆ THỐNG SẢN XUẤT THÔNG MINH",
       "PLC NÂNG CAO 1",
       "VI ĐIỀU KHIỂN NÂNG CAO",
       "HỆ THỐNG CƠ ĐIỆN TỬ CÔNG NGHIỆP",
       "NĂNG LƯỢNG TÁI TẠO"]],

    ["LẬP TRÌNH", "Lập trình",
      ["LẬP TRÌNH ỨNG DỤNG",
       "LẬP TRÌNH MATLAB",
       "KỸ THUẬT LẬP TRÌNH ĐIỀU KHIỂN CƠ ĐIỆN TỬ",
       "ĐIỀU KHIỂN MỜ VÀ MẠNG NORON NHÂN TẠO",
       "KỸ THUẬT LẬP TRÌNH ĐIỀU KHIỂN CƠ ĐIỆN TỬ NÂNG CAO",
       "LẬP TRÌNH ĐIỀU KHIỂN ROBOT CÔNG NGHIỆP",
       "MÔ HÌNH HÓA HỆ THỐNG VÀ MÔ PHỎNG"]],

    ["CHỨNG CHỈ", "Chứng chỉ",
      ["CHỨNG CHỈ TIN HỌC CƠ BẢN",
       "CHỨNG CHỈ TIN HỌC NÂNG CAO",
       "CHỨNG CHỈ KỸ NĂNG SỐ"]]
  ];

  function slug(s) {
    if (g.CK && CK.slug) return CK.slug(s);
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\u0111/g, "d").replace(/\u0110/g, "d")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  /* Môn chia thành nhiều bài thi (mỗi bài là một "đề" riêng).
     Thêm môn mới chỉ cần thêm 1 dòng ở đây; câu hỏi của từng đề khai báo ở
     CK.PART_QUIZ trong assets/quiz-bank.js. `label` là cách gọi chung ("Đề",
     "Chương"...), `names` là danh sách tên bài thi theo thứ tự. */
  var PARTS = {
    "GDQP-AN": { label: "Đề", names: ["Đề 1", "Đề 2", "Đề 3", "Đề 4", "Đề 5", "Đề 6", "Đề 7", "Đề 8", "Đề 9", "Đề 10"] }
  };

  /* Môn nằm chung nhóm nhưng có số bài thi riêng thì khai ở đây; khoá này được
     tra TRƯỚC khoá nhóm nên chỉ ghi đè đúng môn đó, các môn kia giữ nguyên.
     (QPAN 2 có 7 đề theo 7 bài của giáo trình, không phải 10 đề như QPAN 1.) */
  var PARTS_BY_SUBJECT = {
    "qpan2": { label: "Đề", names: ["Đề 1", "Đề 2", "Đề 3", "Đề 4", "Đề 5", "Đề 6", "Đề 7"] },
    /* Quản trị học chia theo 7 chương của giáo trình (file "FULL TN QTH 2024
       HUIT.docx" gộp 9 chương cũ thành 7 chương mới). */
    "quan-tri-hoc": {
      label: "Chương",
      names: ["Chương 1", "Chương 2", "Chương 3", "Chương 4", "Chương 5", "Chương 6", "Chương 7"]
    },
    /* Quản trị chuỗi cung ứng chia theo 7 chương của giáo trình. */
    "quan-tri-chuoi-cung-ung": {
      label: "Chương",
      names: ["Chương 1", "Chương 2", "Chương 3", "Chương 4", "Chương 5", "Chương 6", "Chương 7"]
    },
     "quan-tri-chat-luong": {
       label: "Đề",
       names: ["Đề 1", "Đề 2", "Đề 3", "Đề 4", "Đề 5", "Đề 6", "Đề 7", "Đề 8"]
     },
    /* Kỹ năng giao tiếp chia theo 4 chương của file "KỸ NĂNG GIAO TIẾP.docx". */
    "ky-nang-giao-tiep": {
      label: "Chương",
      names: ["Chương 1", "Chương 2", "Chương 3", "Chương 4"]
    },
    /* Marketing căn bản chia theo 9 chương của file "MARKETING CĂN BẢN.docx". */
    "marketing-can-ban": {
      label: "Chương",
      names: ["Chương 1", "Chương 2", "Chương 3", "Chương 4", "Chương 5", "Chương 6", "Chương 7", "Chương 8", "Chương 9"]
    },
    /* Lịch sử Đảng Cộng sản Việt Nam chia theo 3 chương của file
       "LỊCH SỬ ĐẢNG CỘNG SẢN VIỆT NAM.docx". */
    "lich-su-dang-cong-san-viet-nam": {
      label: "Chương",
      names: ["Chương 1", "Chương 2", "Chương 3"]
    },
    /* Tư tưởng Hồ Chí Minh chia theo 5 chương (Chương 2–6) của file
       "TƯ TƯỞNG HỒ CHÍ MINH.docx". */
    "tu-tuong-ho-chi-minh": {
      label: "Chương",
      names: ["Chương 2", "Chương 3", "Chương 4", "Chương 5", "Chương 6"]
    },
    /* Triết học Mác-Lênin chia theo 3 chương của file
       "TRIẾT HỌC MÁC-LÊNIN.docx". */
    "triet-hoc-mac-lenin": {
      label: "Chương",
      names: ["Chương 1", "Chương 2", "Chương 3"]
    },
    /* Chủ nghĩa xã hội khoa học chia theo 7 chương của file
       "CHỦ NGHĨA XÃ HỘI KHOA HỌC.docx". */
    "chu-nghia-xa-hoi-khoa-hoc": {
      label: "Chương",
      names: ["Chương 1", "Chương 2", "Chương 3", "Chương 4", "Chương 5", "Chương 6", "Chương 7"]
    },
     /* Kinh tế chính trị Mác-Lênin chia theo 6 chương của file
        "KINH TẾ CHÍNH TRỊ MÁC-LÊNIN.docx". */
     "kinh-te-chinh-tri-mac-lenin": {
       label: "Chương",
       names: ["Chương 1", "Chương 2", "Chương 3", "Chương 4", "Chương 5", "Chương 6"]
     },
     /* Logic học đại cương chia theo 5 chương của file "LOGIC HỌC ĐẠI CƯƠNG.docx". */
     "logic-hoc-dai-cuong": {
       label: "Chương",
       names: ["Chương 1", "Chương 2", "Chương 3", "Chương 4", "Chương 5"]
     },
     /* Đại số tuyến tính chia theo 5 chương của file "ĐẠI SỐ TUYẾN TÍNH.docx". */
     "dai-so-tuyen-tinh": {
       label: "Chương",
       names: ["Chương 1", "Chương 2", "Chương 3", "Chương 4", "Chương 5"]
     }
   };

  var CATS = RAW.map(function (row, i) {
    return {
      id: slug(row[1]),
      index: i,
      title: row[0],          // chữ in hoa — hiển thị đúng như bản gốc
      name: row[1],           // chữ thường — dùng cho chip lọc
      subjects: row[2].map(function (s) {
        var o = { name: s, slug: slug(s), cat: row[0], catName: row[1] };
        var p = PARTS_BY_SUBJECT[slug(s)] || PARTS[row[0]];
        if (p) {
          o.parts = p.names.map(function (n, k) {
            return { id: slug(n), name: n, label: p.label, index: k };
          });
        }
        return o;
      })
    };
  });

  g.CK = g.CK || {};
  g.CK.CATS = CATS;
  g.CK.SUBJECTS = CATS.reduce(function (a, c) { return a.concat(c.subjects); }, []);
  g.CK.subjectBySlug = function (s) {
    for (var i = 0; i < g.CK.SUBJECTS.length; i++) if (g.CK.SUBJECTS[i].slug === s) return g.CK.SUBJECTS[i];
    return null;
  };
  /* Bài thi có sẵn một trang làm bài riêng (file HTML độc lập) thì khai ở đây:
     khoá ngoài = slug môn, khoá trong = slug bài thi. Trang chủ dùng CK.partFile
     để biết bấm bài thi nào thì mở trang riêng thay vì dựng thẻ trong popup. */
  var PART_FILES = {
    "qpan1": {
      "de-1": "qp-an/qpan1-de-1-quiz.html",
      "de-2": "qp-an/qpan1-de-2-quiz.html",
      "de-3": "qp-an/qpan1-de-3-quiz.html",
      "de-4": "qp-an/qpan1-de-4-quiz.html",
      "de-5": "qp-an/qpan1-de-5-quiz.html",
      "de-6": "qp-an/qpan1-de-6-quiz.html",
      "de-7": "qp-an/qpan1-de-7-quiz.html",
      "de-8": "qp-an/qpan1-de-8-quiz.html",
      "de-9": "qp-an/qpan1-de-9-quiz.html",
      "de-10": "qp-an/qpan1-de-10-quiz.html"
    },
    "qpan2": {
      "de-1": "qp-an/qpan2-de-1-quiz.html",
      "de-2": "qp-an/qpan2-de-2-quiz.html",
      "de-3": "qp-an/qpan2-de-3-quiz.html",
      "de-4": "qp-an/qpan2-de-4-quiz.html",
      "de-5": "qp-an/qpan2-de-5-quiz.html",
      "de-6": "qp-an/qpan2-de-6-quiz.html",
      "de-7": "qp-an/qpan2-de-7-quiz.html"
    },
    /* Quản trị học: MỘT trang làm bài dùng chung cho cả 7 chương — bài thi
       nào thì nạp tham số `?d=chuong-N`. Giao diện làm bài lấy từ
       quan-tri-hoc/TN-luyen-tap/template-quiz.html (chấm điểm theo số lần
       chọn sai — xem TN-luyen-tap/scoring.md). */
    "quan-tri-hoc": {
      "chuong-1": "quan-tri-hoc/luyen-tap.html?d=chuong-1",
      "chuong-2": "quan-tri-hoc/luyen-tap.html?d=chuong-2",
      "chuong-3": "quan-tri-hoc/luyen-tap.html?d=chuong-3",
      "chuong-4": "quan-tri-hoc/luyen-tap.html?d=chuong-4",
      "chuong-5": "quan-tri-hoc/luyen-tap.html?d=chuong-5",
      "chuong-6": "quan-tri-hoc/luyen-tap.html?d=chuong-6",
      "chuong-7": "quan-tri-hoc/luyen-tap.html?d=chuong-7"
    },
    /* Quản trị chuỗi cung ứng: MỘT trang làm bài dùng chung cho cả 7 chương —
       bài thi nào thì nạp tham số `?d=chuong-N`. */
    "quan-tri-chuoi-cung-ung": {
      "chuong-1": "quan-tri-chuoi-cung-ung/luyen-tap.html?d=chuong-1",
      "chuong-2": "quan-tri-chuoi-cung-ung/luyen-tap.html?d=chuong-2",
      "chuong-3": "quan-tri-chuoi-cung-ung/luyen-tap.html?d=chuong-3",
      "chuong-4": "quan-tri-chuoi-cung-ung/luyen-tap.html?d=chuong-4",
      "chuong-5": "quan-tri-chuoi-cung-ung/luyen-tap.html?d=chuong-5",
      "chuong-6": "quan-tri-chuoi-cung-ung/luyen-tap.html?d=chuong-6",
      "chuong-7": "quan-tri-chuoi-cung-ung/luyen-tap.html?d=chuong-7"
    },
     "quan-tri-chat-luong": {
       "de-1": "quan-tri-chat-luong/luyen-tap.html?d=de-1",
       "de-2": "quan-tri-chat-luong/luyen-tap.html?d=de-2",
       "de-3": "quan-tri-chat-luong/luyen-tap.html?d=de-3",
       "de-4": "quan-tri-chat-luong/luyen-tap.html?d=de-4",
       "de-5": "quan-tri-chat-luong/luyen-tap.html?d=de-5",
       "de-6": "quan-tri-chat-luong/luyen-tap.html?d=de-6",
       "de-7": "quan-tri-chat-luong/luyen-tap.html?d=de-7",
       "de-8": "quan-tri-chat-luong/luyen-tap.html?d=de-8"
     },
    /* Kỹ năng giao tiếp: MỘT trang làm bài dùng chung cho cả 4 chương —
       bài thi nào thì nạp tham số `?d=chuong-N`. */
    "ky-nang-giao-tiep": {
      "chuong-1": "ky-nang-giao-tiep/luyen-tap.html?d=chuong-1",
      "chuong-2": "ky-nang-giao-tiep/luyen-tap.html?d=chuong-2",
      "chuong-3": "ky-nang-giao-tiep/luyen-tap.html?d=chuong-3",
      "chuong-4": "ky-nang-giao-tiep/luyen-tap.html?d=chuong-4"
    },
    /* Marketing căn bản: MỘT trang làm bài dùng chung cho cả 9 chương —
       bài thi nào thì nạp tham số `?d=chuong-N`. */
    "marketing-can-ban": {
      "chuong-1": "marketing-can-ban/luyen-tap.html?d=chuong-1",
      "chuong-2": "marketing-can-ban/luyen-tap.html?d=chuong-2",
      "chuong-3": "marketing-can-ban/luyen-tap.html?d=chuong-3",
      "chuong-4": "marketing-can-ban/luyen-tap.html?d=chuong-4",
      "chuong-5": "marketing-can-ban/luyen-tap.html?d=chuong-5",
      "chuong-6": "marketing-can-ban/luyen-tap.html?d=chuong-6",
      "chuong-7": "marketing-can-ban/luyen-tap.html?d=chuong-7",
      "chuong-8": "marketing-can-ban/luyen-tap.html?d=chuong-8",
      "chuong-9": "marketing-can-ban/luyen-tap.html?d=chuong-9"
    },
    /* Lịch sử Đảng Cộng sản Việt Nam: MỘT trang làm bài dùng chung cho cả 3
       chương — bài thi nào thì nạp tham số `?d=chuong-N`. */
    "lich-su-dang-cong-san-viet-nam": {
      "chuong-1": "lich-su-dang-cong-san-viet-nam/luyen-tap.html?d=chuong-1",
      "chuong-2": "lich-su-dang-cong-san-viet-nam/luyen-tap.html?d=chuong-2",
      "chuong-3": "lich-su-dang-cong-san-viet-nam/luyen-tap.html?d=chuong-3"
    },
    /* Tư tưởng Hồ Chí Minh: MỘT trang làm bài dùng chung cho cả 5 chương —
       bài thi nào thì nạp tham số `?d=chuong-N`. */
    "tu-tuong-ho-chi-minh": {
      "chuong-2": "tu-tuong-ho-chi-minh/luyen-tap.html?d=chuong-2",
      "chuong-3": "tu-tuong-ho-chi-minh/luyen-tap.html?d=chuong-3",
      "chuong-4": "tu-tuong-ho-chi-minh/luyen-tap.html?d=chuong-4",
      "chuong-5": "tu-tuong-ho-chi-minh/luyen-tap.html?d=chuong-5",
      "chuong-6": "tu-tuong-ho-chi-minh/luyen-tap.html?d=chuong-6"
    },
    /* Triết học Mác-Lênin: MỘT trang làm bài dùng chung cho cả 3 chương —
       bài thi nào thì nạp tham số `?d=chuong-N`. */
    "triet-hoc-mac-lenin": {
      "chuong-1": "triet-hoc-mac-lenin/luyen-tap.html?d=chuong-1",
      "chuong-2": "triet-hoc-mac-lenin/luyen-tap.html?d=chuong-2",
      "chuong-3": "triet-hoc-mac-lenin/luyen-tap.html?d=chuong-3"
    },
    /* Chủ nghĩa xã hội khoa học: MỘT trang làm bài dùng chung cho cả 7 chương —
       bài thi nào thì nạp tham số `?d=chuong-N`. */
    "chu-nghia-xa-hoi-khoa-hoc": {
      "chuong-1": "chu-nghia-xa-hoi-khoa-hoc/luyen-tap.html?d=chuong-1",
      "chuong-2": "chu-nghia-xa-hoi-khoa-hoc/luyen-tap.html?d=chuong-2",
      "chuong-3": "chu-nghia-xa-hoi-khoa-hoc/luyen-tap.html?d=chuong-3",
      "chuong-4": "chu-nghia-xa-hoi-khoa-hoc/luyen-tap.html?d=chuong-4",
      "chuong-5": "chu-nghia-xa-hoi-khoa-hoc/luyen-tap.html?d=chuong-5",
      "chuong-6": "chu-nghia-xa-hoi-khoa-hoc/luyen-tap.html?d=chuong-6",
      "chuong-7": "chu-nghia-xa-hoi-khoa-hoc/luyen-tap.html?d=chuong-7"
    },
     /* Kinh tế chính trị Mác-Lênin: MỘT trang làm bài dùng chung cho cả 6 chương —
        bài thi nào thì nạp tham số `?d=chuong-N`. */
     "kinh-te-chinh-tri-mac-lenin": {
       "chuong-1": "kinh-te-chinh-tri-mac-lenin/luyen-tap.html?d=chuong-1",
       "chuong-2": "kinh-te-chinh-tri-mac-lenin/luyen-tap.html?d=chuong-2",
       "chuong-3": "kinh-te-chinh-tri-mac-lenin/luyen-tap.html?d=chuong-3",
       "chuong-4": "kinh-te-chinh-tri-mac-lenin/luyen-tap.html?d=chuong-4",
       "chuong-5": "kinh-te-chinh-tri-mac-lenin/luyen-tap.html?d=chuong-5",
       "chuong-6": "kinh-te-chinh-tri-mac-lenin/luyen-tap.html?d=chuong-6"
     },
     /* Logic học đại cương: MỘT trang làm bài dùng chung cho cả 5 chương —
        bài thi nào thì nạp tham số `?d=chuong-N`. */
     "logic-hoc-dai-cuong": {
       "chuong-1": "logic-hoc-dai-cuong/luyen-tap.html?d=chuong-1",
       "chuong-2": "logic-hoc-dai-cuong/luyen-tap.html?d=chuong-2",
       "chuong-3": "logic-hoc-dai-cuong/luyen-tap.html?d=chuong-3",
       "chuong-4": "logic-hoc-dai-cuong/luyen-tap.html?d=chuong-4",
       "chuong-5": "logic-hoc-dai-cuong/luyen-tap.html?d=chuong-5"
     },
     /* Đại số tuyến tính: MỘT trang làm bài dùng chung cho cả 5 chương —
        bài thi nào thì nạp tham số `?d=chuong-N`. */
     "dai-so-tuyen-tinh": {
       "chuong-1": "dai-so-tuyen-tinh/luyen-tap.html?d=chuong-1",
       "chuong-2": "dai-so-tuyen-tinh/luyen-tap.html?d=chuong-2",
       "chuong-3": "dai-so-tuyen-tinh/luyen-tap.html?d=chuong-3",
       "chuong-4": "dai-so-tuyen-tinh/luyen-tap.html?d=chuong-4",
       "chuong-5": "dai-so-tuyen-tinh/luyen-tap.html?d=chuong-5"
     }
   };

  /* Bài thi có sẵn trang XEM ĐỀ CƯƠNG riêng thì khai ở đây.
     Khác PART_FILES: mọi bài thi dùng chung MỘT trang, bài thi nào nằm ở
     tham số `?d=<slug bài thi>` — nên không nhân bản 10 file gần như giống hệt. */
  var PART_SYLLABUS = {
    "qpan1": "qp-an/qpan1-de-cuong.html",
    "qpan2": "qp-an/qpan2-de-cuong.html",
    /* Quản trị học: trang đề cương dùng chung cho cả 7 chương — thêm `?d=` để
       biết đang xem chương nào; luyện tập nằm ở trang luyen-tap.html. */
    "quan-tri-hoc": "quan-tri-hoc/quiz.html",
    "quan-tri-chuoi-cung-ung": "quan-tri-chuoi-cung-ung/quiz.html",
    "quan-tri-chat-luong": "quan-tri-chat-luong/quiz.html",
    /* Kỹ năng giao tiếp: trang đề cương dùng chung cho cả 4 chương — thêm `?d=`. */
    "ky-nang-giao-tiep": "ky-nang-giao-tiep/quiz.html",
    /* Marketing căn bản: trang đề cương dùng chung cho cả 9 chương — thêm `?d=`. */
    "marketing-can-ban": "marketing-can-ban/quiz.html",
    /* Lịch sử Đảng Cộng sản Việt Nam: trang đề cương dùng chung cho cả 3 chương. */
    "lich-su-dang-cong-san-viet-nam": "lich-su-dang-cong-san-viet-nam/quiz.html",
    /* Tư tưởng Hồ Chí Minh: trang đề cương dùng chung cho cả 5 chương — thêm `?d=`. */
    "tu-tuong-ho-chi-minh": "tu-tuong-ho-chi-minh/quiz.html",
    /* Đại số tuyến tính: trang đề cương dùng chung cho cả 5 chương — thêm `?d=`. */
    "dai-so-tuyen-tinh": "dai-so-tuyen-tinh/quiz.html",
    /* Triết học Mác-Lênin: trang đề cương dùng chung cho cả 3 chương — thêm `?d=`. */
    "triet-hoc-mac-lenin": "triet-hoc-mac-lenin/quiz.html",
    /* Chủ nghĩa xã hội khoa học: trang đề cương dùng chung cho cả 7 chương — thêm `?d=`. */
    "chu-nghia-xa-hoi-khoa-hoc": "chu-nghia-xa-hoi-khoa-hoc/quiz.html",
     /* Kinh tế chính trị Mác-Lênin: trang đề cương dùng chung cho cả 6 chương — thêm `?d=`. */
     "kinh-te-chinh-tri-mac-lenin": "kinh-te-chinh-tri-mac-lenin/quiz.html",
     /* Logic học đại cương: trang đề cương dùng chung cho cả 5 chương — thêm `?d=`. */
     "logic-hoc-dai-cuong": "logic-hoc-dai-cuong/quiz.html"
   };

  /* Chế độ THI THỬ có sẵn trang riêng thì khai ở đây.
     Khác PART_FILES: trang thi thử gộp mọi đề vào một trang duy nhất, nên
     khoá chỉ theo slug môn, không cần khoá theo từng đề. */
  var PART_EXAM = {
    "qpan1": "pmt-ems/pmt-ems.html",
    "qpan2": "pmt-ems/pmt-ems.html",
    /* Quản trị học: đi qua trang pmt-ems (chọn lớp học phần / lịch thi) rồi mới
       sang trang thi thử ngẫu nhiên 40 câu / 60 phút. */
    "quan-tri-hoc": "pmt-ems/pmt-ems.html",
    "quan-tri-chuoi-cung-ung": "pmt-ems/pmt-ems.html",
    "quan-tri-chat-luong": "pmt-ems/pmt-ems.html",
    "ky-nang-giao-tiep": "pmt-ems/pmt-ems.html",
    "marketing-can-ban": "pmt-ems/pmt-ems.html",
    /* Lịch sử Đảng Cộng sản Việt Nam: đi qua pmt-ems rồi sang trang thi thử
       ngẫu nhiên 40 câu / 60 phút. */
    "lich-su-dang-cong-san-viet-nam": "pmt-ems/pmt-ems.html",
    /* Tư tưởng Hồ Chí Minh: đi qua pmt-ems rồi sang trang thi thử ngẫu nhiên
       40 câu / 60 phút. */
    "tu-tuong-ho-chi-minh": "pmt-ems/pmt-ems.html",
    /* Đại số tuyến tính: đi qua pmt-ems rồi sang trang thi thử ngẫu nhiên
       40 câu / 60 phút. */
    "dai-so-tuyen-tinh": "pmt-ems/pmt-ems.html",
    /* Triết học Mác-Lênin: đi qua pmt-ems rồi sang trang thi thử ngẫu nhiên
       40 câu / 60 phút. */
    "triet-hoc-mac-lenin": "pmt-ems/pmt-ems.html",
    /* Chủ nghĩa xã hội khoa học: đi qua pmt-ems rồi sang trang thi thử ngẫu nhiên
       40 câu / 60 phút. */
    "chu-nghia-xa-hoi-khoa-hoc": "pmt-ems/pmt-ems.html",
     /* Kinh tế chính trị Mác-Lênin: đi qua pmt-ems rồi sang trang thi thử ngẫu nhiên
        40 câu / 60 phút. */
     "kinh-te-chinh-tri-mac-lenin": "pmt-ems/pmt-ems.html",
     /* Logic học đại cương: đi qua pmt-ems rồi sang trang thi thử ngẫu nhiên
        40 câu / 60 phút. */
     "logic-hoc-dai-cuong": "pmt-ems/pmt-ems.html"
   };

  /* Đường dẫn tới trang LÀM BÀI của một môn — nơi nút "LÀM BÀI" ở màn chọn lớp
     chuyển hướng tới. Khoá ngoài = slug môn (phải khớp CK.CATS), giá trị là đường
     dẫn tương đối từ GỐC site — dùng CK.url() để nới đúng khi ở thư mục con. */
  var PART_DO = {
    "qpan1": "qp-an/thi-QPAN1-ngau-nhien.html",
    "qpan2": "qp-an/thi-QPAN2-ngau-nhien.html",
    /* Quản trị học: trang làm bài = đề thi thử ngẫu nhiên (40 câu / 60 phút). */
    "quan-tri-hoc": "quan-tri-hoc/thi-quan-tri-hoc-ngau-nhien.html",
    "quan-tri-chuoi-cung-ung": "quan-tri-chuoi-cung-ung/thi-quan-tri-chuoi-cung-ung-ngau-nhien.html",
    "quan-tri-chat-luong": "quan-tri-chat-luong/thi-quan-tri-chat-luong-ngau-nhien.html",
    "ky-nang-giao-tiep": "ky-nang-giao-tiep/thi-ky-nang-giao-tiep-ngau-nhien.html",
    /* Đại số tuyến tính: trang làm bài = đề thi thử ngẫu nhiên (40 câu / 60 phút). */
    "dai-so-tuyen-tinh": "dai-so-tuyen-tinh/thi-dai-so-tuyen-tinh-ngau-nhien.html",
    "marketing-can-ban": "marketing-can-ban/thi-marketing-can-ban-ngau-nhien.html",
    "lich-su-dang-cong-san-viet-nam": "lich-su-dang-cong-san-viet-nam/thi-lich-su-dang-cong-san-viet-nam-ngau-nhien.html",
    /* Tư tưởng Hồ Chí Minh: trang làm bài = đề thi thử ngẫu nhiên (40 câu / 60 phút). */
    "tu-tuong-ho-chi-minh": "tu-tuong-ho-chi-minh/thi-tu-tuong-ho-chi-minh-ngau-nhien.html",
    /* Triết học Mác-Lênin: trang làm bài = đề thi thử ngẫu nhiên (40 câu / 60 phút). */
    "triet-hoc-mac-lenin": "triet-hoc-mac-lenin/thi-triet-hoc-mac-lenin-ngau-nhien.html",
    /* Chủ nghĩa xã hội khoa học: trang làm bài = đề thi thử ngẫu nhiên (40 câu / 60 phút). */
    "chu-nghia-xa-hoi-khoa-hoc": "chu-nghia-xa-hoi-khoa-hoc/thi-chu-nghia-xa-hoi-khoa-hoc-ngau-nhien.html",
     /* Kinh tế chính trị Mác-Lênin: trang làm bài = đề thi thử ngẫu nhiên (40 câu / 60 phút). */
     "kinh-te-chinh-tri-mac-lenin": "kinh-te-chinh-tri-mac-lenin/thi-kinh-te-chinh-tri-mac-lenin-ngau-nhien.html",
     /* Logic học đại cương: trang làm bài = đề thi thử ngẫu nhiên (40 câu / 60 phút). */
     "logic-hoc-dai-cuong": "logic-hoc-dai-cuong/thi-logic-hoc-dai-cuong-ngau-nhien.html"
   };

  /* Đường dẫn tới trang làm bài của một bài thi (null nếu bài thi đó không có
     trang riêng — lúc đó bấm bài thi sẽ mở thẻ thông tin đề trong popup). */
  g.CK.partFile = function (slug, partId) {
    var m = PART_FILES[slug];
    return (m && m[partId]) || null;
  };

  /* Đường dẫn tới trang xem đề cương (câu hỏi + đáp án + lời giải thích) của một
     bài thi, hoặc null nếu môn đó không có trang đề cương. Trang nhận `?d=` để biết
     đang xem bài thi nào — cùng kiểu mở như CK.partFile nên trang chủ gọi được
     bằng đúng một đường dẫn cho mọi bài thi. */
  g.CK.partSyllabus = function (slug, partId) {
    var f = PART_SYLLABUS[slug];
    if (!f) return null;
    return f + (f.indexOf("?") === -1 ? "?" : "&") + "d=" + encodeURIComponent(partId);
  };

  /* Đường dẫn tới trang thi thử của một môn, hoặc null nếu môn đó chưa có
     trang thi thử (lúc đó bấm đề ở chế độ Thi thử vẫn mở thẻ thông tin đề). */
  g.CK.partExam = function (slug) {
    return PART_EXAM[slug] || null;
  };

  /* Đường dẫn tới trang làm bài của một môn, hoặc null nếu môn đó chưa có trang
     làm bài (lúc đó nút "LÀM BÀI" ở màn 2 chỉ cảnh báo, không nhảy đi). */
  g.CK.partDo = function (slug) {
    return PART_DO[slug] || null;
  };

  /* Môn nào bấm thẻ ở Lò ôn luyện là mở THẲNG một trang riêng thay vì mở popup.
     Khoá = slug môn, giá trị = đường dẫn tương đối từ GỐC site (dùng CK.url). */
  var NAV_FILES = {
    "anh-van-2": "anh-van-2/index.html",
    /* Kỹ thuật số: mở thẳng trang ôn tập chuyên đề, không mở popup. */
    "ky-thuat-so": "ky-thuat-so/index.html",
    /* Hệ điều hành: mở thẳng trang ôn tập bên ngoài, không mở popup. */
    "he-dieu-hanh": "https://tracnghiemhuit.onrender.com/monhoc/13",
    /* Quản trị hệ thống mạng K14: mở thẳng trang ôn tập bên ngoài. */
    "quan-tri-he-thong-mang-k14": "https://tracnghiemhuit.onrender.com/monhoc/14",
    /* ForumFlash: mở thẳng trang ôn tập bên ngoài. */
    "forumflash": "https://www.forumflashstudy.com/?fbclid=IwY2xjawVS905leHRuA2FlbQIxMABwZG9mBWJyaWQRMXBLTUZIR240MkR1Vkp3aEtzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEfd6gX57_h1C3RgaBIFbH4EyepItk5DFCSmpTxadaXPxC1YyXSW9sxJXYbUPg_aem_PGbex1SgiJDVuyuNv4rktw",
    /* ByeTOIEC: mở thẳng trang ôn tập bên ngoài. */
    "byetoiec": "https://byetoeic.com/?fbclid=IwdGRjcAVSh9NleHRuA2FlbQIxMQBwZG9mBWZkaWQWURWzXfFl2RCcmLrbK_syVrC_QhIppXNydGMGYXBwX2lkCjY2Mjg1NjgzNzkAAR9EWzVpEeJDjlucNe_b4JwNLoXYMB8ee1iRjJnfzRQfwbfKnkXkxomKgU82Mw_aem_6PCB-uuekktfjlMzQ-RnLw"
  };
  g.CK.navFile = function (slug) { return NAV_FILES[slug] || null; };

  /* Môn nào có trang xem đề cương */
  g.CK.hasSyllabus = function (slug) { return !!PART_SYLLABUS[slug]; };

  /* Danh sách bài thi của một môn — mảng rỗng với môn thường */
  g.CK.partsOf = function (subject) { return (subject && subject.parts) || []; };
  g.CK.partById = function (subject, id) {
    var list = g.CK.partsOf(subject);
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  };
})(window);