# Quy tắc tính điểm

Tài liệu này là nguồn chuẩn cho cách tính điểm. Code tương ứng nằm trong
`template-quiz.html` và các trang luyện tập (hàm `pointsOf`, hằng số `MAX_SCORE`,
bảng `SCORE_RATE_BY_ATTEMPTS`).

## 1. Nguyên tắc

- **Bài làm luôn có thang điểm 10** (`MAX_SCORE = 10`), không phụ thuộc số câu.
- Giá trị tối đa của một câu = `10 ÷ tổng số câu`.
  - 10 câu → mỗi câu tối đa 1 điểm.
  - 50 câu → mỗi câu tối đa 0.2 điểm.
  - 100 câu → mỗi câu tối đa 0.1 điểm.
- Điểm bài làm = tổng điểm từng câu, làm tròn tối đa 2 chữ số thập phân.
- Tỷ lệ (%) = điểm bài làm ÷ 10 × 100 (làm tròn số nguyên).

## 2. Bảng tỷ lệ theo số lần chọn sai trước khi bấm đúng

| Số lần chọn sai | Tỷ lệ giá trị câu | Với câu tối đa 1 điểm |
|---|---|---|
| 0 (bấm đúng ngay lần đầu) | 100% | 1.00 |
| 1 | 75% | 0.75 |
| 2 | 50% | 0.50 |
| 3 | 25% | 0.25 |
| 4 trở lên | 0% | 0.00 |
| Bấm Esc để bỏ qua | 0% | 0.00 |
| Chưa làm / hết giờ | 0% | 0.00 |

Tóm gọn: **đúng ngay = 100%, sai 1 lần = 75%, sai 2 lần = 50%, sai 3 lần = 25%,
sai từ 4 lần trở lên = 0%.**

## 3. Cách đếm "số lần chọn sai"

- Mỗi lần bấm **Kiểm tra** với một đáp án sai của một câu đã giải → cộng 1 lần cho câu đó.
- Số lần cộng dồn **theo từng câu**, không tính lại khi quay lại câu đã làm hoặc bấm Esc.
- Chỉ những lần chọn sai **trước thời điểm chọn đúng** mới được tính; sau khi chọn đúng, câu đó bị khoá nên không phát sinh thêm lần sai.
- Câu đã bỏ qua bằng Esc nhưng sau đó làm lại đúng thì số lần sai tính từ đầu vẫn giữ nguyên (thường là 1).

## 4. Ví dụ

Bài 10 câu (mỗi câu tối đa 1 điểm), kết quả:

| Nhóm | Số câu | Tỷ lệ | Điểm |
|---|---|---|---|
| Đúng ngay | 6 | 100% | 6.00 |
| Sai 1 lần rồi làm đúng | 2 | 75% | 1.50 |
| Sai 2 lần rồi làm đúng | 1 | 50% | 0.50 |
| Bỏ qua bằng Esc | 1 | 0% | 0.00 |

- **Điểm = 8 / 10**
- **Tỷ lệ = 80%**

Bài 50 câu (mỗi câu tối đa 0.2 điểm): 40 câu đúng ngay + 10 câu sai 1 lần
→ 40 × 0.2 + 10 × 0.15 = **9.5 / 10** (95%).

## 5. Làm tròn

- Điểm hiển thị: giữ tối đa 2 chữ số thập phân, bỏ số 0 thừa (`2` thay vì `2.00`, `0.5` thay vì `0.50`).
- Tỷ lệ `%`: làm tròn về số nguyên.

## 6. Mở rộng quy tắc

- **Đổi thang điểm**: sửa hằng số `MAX_SCORE` (ví dụ 100 để dùng thang điểm 100).
- **Thêm/đổi mức phạt**: sửa bảng `SCORE_RATE_BY_ATTEMPTS` (đơn vị %) và nới chỉ số
  `Math.min(attempts, N)` tương ứng. Ví dụ bỏ mức 0% → `[100, 75, 50, 25]` và `Math.min(attempts, 3)`.
- Không cần đụng chỗ khác: điểm mỗi câu được chia theo `MAX_SCORE / tổng số câu`,
  nên tự động đúng với bất kỳ số lượng câu nào.

## 7. Những thứ KHÔNG ảnh hưởng tới điểm

- Tổng số lần bấm sai trong cả bài (`wrongCount`) — chỉ dùng cho nhãn "Làm sai N lần" và danh sách luyện tập lại câu sai.
- Thời gian làm bài (`seconds`) — chỉ hiển thị, không cộng/trừ điểm.
- Thứ tự làm bài, việc có quay lại câu cũ hay không.

## 8. Bảng xếp hạng

- Điểm trên bảng xếp hạng dùng cùng thang 10; tỷ lệ % = điểm ÷ 10 × 100.
- Hàng cũ (nếu có) có điểm lớn hơn 10 được coi là thang điểm theo số câu và tự quy đổi
  về thang 10 khi hiển thị.
