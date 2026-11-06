# Quy tắc tính điểm

Tài liệu này là nguồn chuẩn cho cách tính điểm. Code tương ứng nằm trong
`template-quiz.html` (hàm `pointsOf`, bảng `SCORE_RATE_BY_ATTEMPTS`).

## 1. Nguyên tắc

- **Giá trị tối đa của một câu = 1 điểm = 100%.**
- Điểm bài làm = tổng điểm từng câu.
- Tỷ lệ (%) = điểm bài làm ÷ tổng số câu × 100.
- Quy tắc **không phụ thuộc số lượng câu**: 10 câu thì tổng tối đa 10 điểm, 100 câu thì tổng tối đa 100 điểm.

## 2. Bảng tỷ lệ theo số lần chọn sai trước khi bấm đúng

| Số lần chọn sai | Tỷ lệ giá trị câu | Với câu tối đa 1 điểm |
|---|---|---|
| 0 (bấm đúng ngay lần đầu) | 100% | 1.00 |
| 1 | 75% | 0.75 |
| 2 | 50% | 0.50 |
| 3 trở lên | 25% | 0.25 |
| Bấm Esc để bỏ qua | 0% | 0.00 |
| Chưa làm / hết giờ | 0% | 0.00 |

Tóm gọn: **đúng ngay = 100%, sai 1 lần = 75%, sai 2 lần = 50%, sai từ 3 lần = 25%.**

## 3. Cách đếm "số lần chọn sai"

- Mỗi lần bấm **Kiểm tra** với một đáp án sai của một câu đã giải → cộng 1 lần cho câu đó.
- Số lần cộng dồn **theo từng câu**, không tính lại khi quay lại câu đã làm hoặc bấm Esc.
- Chỉ những lần chọn sai **trước thời điểm chọn đúng** mới được tính; sau khi chọn đúng, câu đó bị khoá nên không phát sinh thêm lần sai.
- Câu đã bỏ qua bằng Esc nhưng sau đó làm lại đúng thì số lần sai tính từ đầu vẫn giữ nguyên (thường là 1).

## 4. Ví dụ

Bài 10 câu, kết quả:

| Nhóm | Số câu | Tỷ lệ | Điểm |
|---|---|---|---|
| Đúng ngay | 6 | 100% | 6.00 |
| Sai 1 lần rồi làm đúng | 2 | 75% | 1.50 |
| Sai 2 lần rồi làm đúng | 1 | 50% | 0.50 |
| Bỏ qua bằng Esc | 1 | 0% | 0.00 |

- **Điểm = 8.00 / 10**
- **Tỷ lệ = 80%**

## 5. Làm tròn

- Điểm hiển thị: giữ tối đa 2 chữ số thập phân, bỏ số 0 thừa (`2` thay vì `2.00`, `0.5` thay vì `0.50`).
- Tỷ lệ `%`: làm tròn về số nguyên.

## 6. Mở rộng quy tắc

- **Thêm mức phạt sâu hơn**: thêm phần tử vào `SCORE_RATE_BY_ATTEMPTS` và nới chỉ số `Math.min(attempts, N)`.
  Ví dụ thêm mức `sai 4 lần = 10%` → `[100, 75, 50, 25, 10]`.
- **Đổi tỷ lệ**: chỉ cần sửa bảng `SCORE_RATE_BY_ATTEMPTS` (đơn vị %), không cần đụng tới chỗ khác.
- **Đổi điểm tối đa mỗi câu**: dùng hằng số tổng (`total`) thay vì giả định 1 điểm/câu;
  hiện tại `ratio = round(score / total * 100)` nên tự động đúng với bất kỳ tổng số câu nào.

## 7. Những thứ KHÔNG ảnh hưởng tới điểm

- Tổng số lần bấm sai trong cả bài (`wrongCount`) — chỉ dùng cho nhãn "Làm sai N lần" và danh sách luyện tập lại câu sai.
- Thời gian làm bài (`seconds`) — chỉ hiển thị, không cộng/trừ điểm.
- Thứ tự làm bài, việc có quay lại câu cũ hay không.