/* ============================================================================
   GOOGLE APPS SCRIPT — ĐẦU MỐI NHẬN BÁO LỖI CỦA CƠ KHÍ HUIT
   ----------------------------------------------------------------------------
   ⚠️  FILE NÀY KHÔNG CHẠY TRÊN WEBSITE. Đây là mã nguồn để bạn DÁN vào
       Google Apps Script. Trang bao-loi.html gọi nó qua fetch().

   CÁCH DỰNG (khoảng 10 phút)
   ----------------------------------------------------------------------------
   1. Tạo Google Sheet để lưu báo lỗi
        sheets.google.com → Trang trống
   2. Tạo Apps Script
        Mở Sheet → Trình tiện ích mở rộng › Apps Script
   3. Xoá sẵn code trong Code.gs, DÁN TOÀN BỘ file này vào, rồi Sửa 3 hằng
        SHEET_ID, FOLDER_ID, NOTIFY_EMAIL ở phần CẤU HÌNH bên dưới.
   4. Tìm SHEET_ID
        URL Sheet có dạng
        https://docs.google.com/spreadsheets/d/1AbC...XYZ/edit
        lấy đoạn 1AbC...XYZ (giữa /d/ và /edit)
   5. Tìm FOLDER_ID (tuỳ chọn — chỉ cần nếu muốn lưu ảnh chụp màn hình)
        Mở Google Drive › tạo thư mục "Bao loi HUIT"
        URL thư mục có dạng
        https://drive.google.com/drive/folders/1DeF...UVW
        lấy đoạn 1DeF...UVW
   6. Triển khai
        Bấm "Triển khai" › "Tạo bản triển khai mới"
        Chọn:
          Thực thi với tư cách :  Tôi
          Ai có quyền truy cập:   Bất kỳ ai            ← BẮT BUỘC
        Bấm "Triển khai" › cho phép (Google sẽ cảnh báo "ung tin cậy" —
        bấm "Nâng cao" › "Chuyển tới … (không an toàn)" nếu hiện).
   7. Sao chép URL Web App (dạng https://script.google.com/macros/s/XXXX/exec)
        Dán vào hằng ENDPOINT trong bao-loi.html.

   SAU KHI TRIỂN KHAI: mỗi lần đổi mã trong này phải bấm "Triển khai" lại
   (chọn "Quản lý triển khai" › sửa ✔ › Triển khai). Chỉ Lưu là chưa đủ.
   ========================================================================= */


/* ══════════════════════════════════════════════════════════════════════
   CẤU HÌNH — sửa 3 dòng dưới
   ══════════════════════════════════════════════════════════════════════ */
var SHEET_ID     = "DAN_ID_SHEET_O_DAY";
var FOLDER_ID    = "DAN_ID_FOLDER_O_DAY";   // để "" nếu không lưu ảnh
var NOTIFY_EMAIL = "phonggiotai4@gmail.com"; // để "" nếu không gửi thông báo

var SHEET_NAME = "Bao loi";
var SHEET_HEAD = ["Thời gian", "Loại", "Trang", "Môn / phần", "Mô tả",
                  "Email người báo", "Ảnh", "Thiết bị", "Rộng x cao"];

/* Chặn payload quá lớn — Apps Script chết nếu nhận body khổng lồ */
var MAX_BODY = 6 * 1024 * 1024;   // 6 MB


/* ══════════════════════════════════════════════════════════════════════
   NHẬN BÁO LỖI
   Trang web gọi bằng fetch(..., {mode:'no-cors'}) nên Apps Script luôn trả
   200 với HTML; dữ liệu thật nằm trong Sheet, không phải trong phản hồi.
   ══════════════════════════════════════════════════════════════════════ */
function doPost(e) {
  try {
    if (SHEET_ID === "DAN_ID_SHEET_O_DAY") throw new Error("Chua cau hinh SHEET_ID");

    var raw = (e && e.postData && e.postData.contents) || "";
    if (!raw) throw new Error("Empty request body");
    if (raw.length > MAX_BODY) throw new Error("Payload qua lon");

    var d = JSON.parse(raw);
    if (!d || typeof d !== "object") throw new Error("JSON khong hop le");

    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) sheet = SpreadsheetApp.openById(SHEET_ID).insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(SHEET_HEAD);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, SHEET_HEAD.length)
           .setFontWeight("bold")
           .setBackground("#E8EAEF");
    }

    var imageUrl = saveImage(d.image);
    var when = d.createdAt ? new Date(d.createdAt) : new Date();

    sheet.appendRow([
      Utilities.formatDate(when, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss"),
      str(d.kind),
      str(d.page),
      str(d.subject),
      str(d.detail),
      str(d.email),
      imageUrl,
      str(d.ua),
      str(d.viewport)
    ]);

    notify(d, imageUrl);

    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    // Không ném lỗi ra ngoài: nếu ném, trình duyệt thấy 500 và không rõ nguyên nhân.
    console.error("doPost failed: " + (err && err.stack || err));
    return ContentService.createTextOutput("ERR").setMimeType(ContentService.MimeType.TEXT);
  }
}

/* GET để kiểm tra Web App còn sống */
function doGet() {
  return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
}


/* ══════════════════════════════════════════════════════════════════════
   LƯU ẢNH ĐÍNH KÈM
   Ảnh tới từ trang web dưới dạng dataURL (data:image/jpeg;base64,...).
   ══════════════════════════════════════════════════════════════════════ */
function saveImage(img) {
  if (!img || !img.data || FOLDER_ID === "" || FOLDER_ID === "DAN_ID_FOLDER_O_DAY") return "";
  try {
    var m = /^data:([^;]+);base64,(.+)$/.exec(img.data);
    if (!m) return "";

    var folder = DriveApp.getFolderById(FOLDER_ID);
    var name = String(img.name || "anh").replace(/[\\/:*?"<>|]/g, "-");
    if (name.indexOf(".jpg") === -1) name += ".jpg";

    var blob = Utilities.newBlob(
      Utilities.base64Decode(m[2]),
      m[1],
      Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyyMMdd-HHmmss") + "-" + name
    );
    var file = folder.createFile(blob);
    file.setDescription("Anh dinh kem tu trang bao loi CƠ KHÍ HUIT");
    return "https://drive.google.com/file/d/" + file.getId() + "/view";
  } catch (err) {
    console.error("saveImage failed: " + err);
    return "";
  }
}


/* ══════════════════════════════════════════════════════════════════════
   GỬI THÔNG BÁO CHO QUẢN TRỊ VIÊN
   ══════════════════════════════════════════════════════════════════════ */
function notify(d, imageUrl) {
  if (NOTIFY_EMAIL === "") return;
  try {
    var lines = [
      "CÓ BÁO LỖI MỚI — CƠ KHÍ HUIT",
      "",
      "Loại   : " + str(d.kind),
      "Trang  : " + str(d.page),
      "Môn    : " + str(d.subject),
      "Email  : " + (str(d.email) || "(khong de)"),
      "",
      "Mô tả:",
      str(d.detail)
    ];
    if (imageUrl) lines.push("", "Ảnh: " + imageUrl);
    lines.push("", "---", "Mở Sheet: https://docs.google.com/spreadsheets/d/" + SHEET_ID + "/edit");

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: "[CƠ KHÍ HUIT] " + str(d.kind) + " — " + str(d.page).slice(0, 60),
      body: lines.join("\n")
    });
  } catch (err) {
    console.error("notify failed: " + err);
  }
}


/* ══════════════════════════════════════════════════════════════════════
   TIỆN ÍCH
   ══════════════════════════════════════════════════════════════════════ */
function str(v) {
  if (v === null || v === undefined) return "";
  return String(v).slice(0, 5000);
}