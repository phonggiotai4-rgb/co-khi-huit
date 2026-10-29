# CO KHI HUIT

Trang ôn tập + tra cứu nội bộ (mở `index.html` trực tiếp bằng trình duyệt, không cần build).

## Cấu trúc

```
index.html            Trang chủ (nav chính, dẫn tới các trang con)
tinh-nang.html        Trang giới thiệu tính năng
lich-su-lam-bai.html  Lịch sử làm bài (lưu localStorage)
ca-nhan.html          Hồ sơ cá nhân
dieu-khoan.html       Điều khoản
bao-loi.html          Báo lỗi (gửi về Google Sheets qua Apps Script)
bao-mat.html          Chính sách bảo mật
thi-thu.html          Hệ thống thi thử            ← chưa được link nội bộ
de-cuong-trac-nghiem.html  Đề cương trắc nghiệm   ← chưa được link nội bộ

assets/               Tài nguyên dùng chung cho MỌI trang
  app.css, app.js       giao diện + điều hướng (menu, lọc trang)
  data.js               dữ liệu môn học / lộ trình / thời khoá biểu
  quiz-bank.js          ngân hàng câu hỏi (QPAN 1 & 2)
                        + Quản trị học: CK.PART_QUIZ["quan-tri-hoc"]["chuong-1..7"]
  qpan1/2-explanations.js  lời giải thích từng câu
  history.js            lưu & hiển thị lịch sử làm bài
  exam-card.js          thẻ đề thi
  timetable.css/.js     thời khoá biểu
  logo.png, hero-campus.jpg

docs/
  design.md            tài liệu thiết kế (token màu, typografi, layout)
  huong-dan-them-mon-hoc.md  quy trình thêm môn học mới từ file Word (.docx)

tools/                công cụ độc lập, mở trực tiếp từ menu "Công cụ"
  *.html (7 trang)      mỗi trang tự chạy, chỉ dùng chung assets/
  scripts/              script Node + mã backend, KHÔNG được trang nào load
    bao-loi-apps-script.js   mã dán vào Google Apps Script
    kiem-tra-loi-giai.js      kiểm tra lời giải khớp số câu
    xuat-cau-hoi.js           xuất đề ra file .txt
    kiem-tra-dap-an-qth.js    đối chiếu đáp án QTH (đề cương/luyện tập/thi thử)
                              với FULL TN QTH 2024 HUIT.md (xem ghi chú bên dưới)

qp-an/               bộ đề trắc nghiệm Quốc phòng 1 & 2 (mỗi đề 1 file, tự chứa)
                     qpan1-de-1..10-quiz.html, qpan2-de-1..7-quiz.html,
                     qpan1-de-cuong.html, qpan2-de-cuong.html,
                     thi-QPAN1-ngau-nhien.html, thi-QPAN2-ngau-nhien.html
quan-tri-hoc/        Quản trị học — 1 trang làm bài + 1 trang đề cương dùng chung 7 chương
                     luyen-tap.html?d=chuong-N  (Luyện tập: giao diện template-quiz,
                                                chấm theo số lần chọn sai, ghi lịch sử)
                     quiz.html?d=chuong-N       (Đề cương: câu + đáp án + lời giải thích)
                     thi-quan-tri-hoc-ngau-nhien.html
                                           (Thi thử: 40 câu ngẫu nhiên / 60 phút, rút từ
                                            CK.PART_QUIZ["quan-tri-hoc"], khoá câu đã gặp
                                            qth_rng_v1 — mẫu: qp-an/thi-QPAN1-ngau-nhien.html)
                     gen-thi-ngau-nhien.js     tái sinh trang thi thử từ bản mẫu QPAN 1
                     TN-luyen-tap/              template gốc + hướng dẫn nạp câu hỏi
                                                gen-luyen-tap.js tái sinh luyen-tap.html từ JSON

FULL TN QTH 2024 HUIT.md   nguồn chuẩn đáp án Quản trị học (535 câu / 7 chương),
                           trích từ file Word của GV. Đối chiếu 3 trang QTH
                           bằng tools/scripts/kiem-tra-dap-an-qth.js
                           LƯU Ý: file này hiện KHÔNG có trong thư mục, nên
                           script kiểm tra sẽ báo thiếu nguồn và thoát mã 2.
                           Cần khôi phục file .md vào gốc dự án trước khi chạy.
anh-van-2/            chuyên đề Anh văn
dai-so-tuyen-tinh/    Đại số tuyến tính — 1 trang làm bài + 1 trang đề cương dùng chung 5 chương
                      (luyen-tap.html?d=chuong-N, quiz.html?d=chuong-N,
                       thi-dai-so-tuyen-tinh-ngau-nhien.html — 40 câu / 60 phút từ
                       CK.PART_QUIZ["dai-so-tuyen-tinh"], khoá câu đã gặp dst_rng_v1;
                       412 câu / 5 chương, trích từ ĐẠI SỐ TUYẾN TÍNH.docx)
ky-nang-giao-tiep/    Kỹ năng giao tiếp — 1 trang làm bài + 1 trang đề cương dùng chung 4 chương
                      (luyen-tap.html?d=chuong-N, quiz.html?d=chuong-N,
                       thi-ky-nang-giao-tiep-ngau-nhien.html — 40 câu / 60 phút từ
                       CK.PART_QUIZ["ky-nang-giao-tiep"], khoá câu đã gặp kngt_rng_v1;
                       202 câu / 4 chương, trích từ KỸ NĂNG GIAO TIẾP.docx)
marketing-can-ban/    Marketing căn bản — luyen-tap.html, quiz.html,
                      thi-marketing-can-ban-ngau-nhien.html
quan-tri-chat-luong/  Quản trị chất lượng — luyen-tap.html, quiz.html,
                      thi-quan-tri-chat-luong-ngau-nhien.html
quan-tri-chuoi-cung-ung/  Quản trị chuỗi cung ứng — luyen-tap.html, quiz.html,
                      thi-quan-tri-chuoi-cung-ung-ngau-nhien.html
pmt-ems/              trang mô phỏng OMR (chọn môn, vào thi thử)
```

## Quy ước đường dẫn

- Trang ở thư mục con luôn tham chiếu tài nguyên chung bằng `../assets/...`.
- Trang ở root tham chiếu bằng `assets/...`.
- **Không** đổi tên file trong `assets/` hay đổi tên 6 trang phụ ở root
  nếu chưa sửa đồng bộ toàn bộ tham chiếu (dùng lệnh verify bên dưới).

## Lệnh kiểm tra

```powershell
# 1. Chạy thật 2 script Node (phải EXIT=0)
node tools/scripts/kiem-tra-loi-giai.js
node tools/scripts/xuat-cau-hoi.js de-2      # ghi %TEMP%\de-2.txt

# 1b. Đáp án Quản trị học: 3 phần (đề cương / luyện tập / thi thử) phải
#     khớp file .md ở gốc dự án. EXIT=0 = khớp, EXIT=1 = có sai lệch.
node tools/scripts/kiem-tra-dap-an-qth.js

# 2. Quét mọi href/src nội bộ, báo file trỏ nhầm (phải ra "OK")
$root=(Get-Location).Path; $bad=@()
Get-ChildItem -Recurse -Filter *.html -File | ForEach-Object {
  $dir=$_.DirectoryName
  $txt=[System.IO.File]::ReadAllText($_.FullName,[System.Text.Encoding]::UTF8)   # đọc đúng UTF-8
  $refs=[regex]::Matches($txt,'(?:href|src)=["'']([^"'']+)["'']') |
    ForEach-Object { $_.Groups[1].Value } |
    Where-Object { $_ -notmatch '^(https?:|mailto:|tel:|data:|javascript:|#)' } |
    ForEach-Object { ($_ -split '[?#]')[0] } | Where-Object { $_ }
  foreach($r in $refs){ if(-not (Test-Path -LiteralPath (Join-Path $dir $r))){ $bad += "$($_.Name) -> $r" } }
}
if($bad){ "BROKEN:"; $bad } else { "OK" }
```

> Lưu ý: output PowerShell có thể hiển thị tiếng Việt lỗi mã hoá ở console,
> đây là lỗi hiển thị — kiểm tra byte mới là chính xác (file
> `pmt-ems/Ảnh sinh viên.png` là ví dụ, vẫn tải bình thường).
