# Báo cáo đối chiếu đáp án — môn Quản trị học (bank vs Word)

- **Nguồn chuẩn (source of truth):** `FULL TN QTH 2024 HUIT.docx` — đáp án đúng = phương án được **tô highlight vàng** (không theo chữ "Đáp án:", không theo màu đỏ).
- **Đối tượng kiểm tra:** `assets/quiz-bank.js` → `CK.PART_QUIZ["quan-tri-hoc"]["chuong-1".."chuong-7"]` — 535 câu.
- **Phương pháp:** chuẩn hóa chuỗi (bỏ dấu kể cả đ→d, lowercase, gộp khoảng trắng, bỏ dấu câu); so khớp theo **câu hỏi + nội dung phương án**. Với stem trùng, chọn block có phương án khớp nhất với mảng `o` của bank.

## 1. Tổng kết

| Kết quả | Số câu |
|---|---|
| Tổng câu trong bank | **535** |
| Khớp (Word highlight = bank `a`) | **535** |
| Lệch | **0** |
| Không đối chiếu được (bank không tìm thấy trong Word) | **0** |

Bảng theo chương:

| Chương | Câu trong bank | Khớp | Lệch | Không đối chiếu được |
|---|---|---|---|---|
| chuong-1 | 119 | 119 | 0 | 0 |
| chuong-2 | 64 | 64 | 0 | 0 |
| chuong-3 | 56 | 56 | 0 | 0 |
| chuong-4 | 92 | 92 | 0 | 0 |
| chuong-5 | 93 | 93 | 0 | 0 |
| chuong-6 | 67 | 67 | 0 | 0 |
| chuong-7 | 44 | 44 | 0 | 0 |
| **Tổng** | **535** | **535** | **0** | **0** |

**Kết luận: KHÔNG có câu nào lệch đáp án.** Không cần sửa giá trị `a` nào.

## 2. Bảng LỆCH (mặc định chỉ hiện MISMATCH và lỗi kỹ thuật)

Khong co dong nao (0 mismatch, 0 loi ky thuat).

## 3. Kiểm tra thêm

- **Câu trong Word có 0 hoặc ≥2 phương án highlight:** 0 (không có).
- **Câu trong bank có `a` vượt quá `o.length - 1`:** 0 (không có).
- **Câu trùng stem trong cùng chương:**
  - Trong Word: **12 nhóm** (tổng 24 block).
  - Trong bank: **6 nhóm**.
- **Block Word không có câu bank tương ứng (trùng bản sao):** 1 (chương 5, stem "Các mối quan hệ trong cơ cấu trực tuyến – chức năng gồm" — Word có 2 block giống hệt nhau, bank có 1 câu).
- **Câu bank không tìm thấy trong Word:** 0.

Danh sách nhóm stem trùng trong Word:

| Chương | Số block | Stem |
|---|---|---|
| 1 | 2 | Các chức năng cơ bản của quản trị là gì? |
| 1 | 2 | Nhà quản trị cần phân bố thời gian nhiều nhất cho việc thực hiện chức năng nào? |
| 1 | 2 | Quản trị là gì? |
| 3 | 2 | Ra quyết định là gì? |
| 4 | 2 | Hoạch định là gì? |
| 4 | 2 | Mục tiêu nào sau đây được diễn đạt tốt nhất |
| 5 | 2 | Các mối quan hệ trong cơ cấu trực tuyến – chức năng gồm |
| 6 | 2 | Các nhu cầu bậc cao của con người trong tháp nhu cầu Maslow là gì? |
| 6 | 2 | Các nhu cầu bậc thấp của con người trong tháp nhu cầu Maslow là gì? |
| 6 | 2 | Lãnh đạo là: |
| 6 | 2 | Trình tự nhu cầu của con người từ thấp đến cao theo Maslow là? |
| 7 | 2 | Các nguyên tắc xây dựng cơ chế kiểm tra |

Danh sách nhóm stem trùng trong bank:

| Chương | Số câu |
|---|---|
| chuong-1 | 1, 2 |
| chuong-1 | 8, 9 |
| chuong-1 | 20, 21 |
| chuong-3 | 12, 13 |
| chuong-4 | 1, 2 |
| chuong-4 | 81, 82 |
| chuong-5 | 14, 58 |
| chuong-6 | 1, 2 |
| chuong-6 | 14, 15 |
| chuong-6 | 29, 30 |
| chuong-6 | 31, 32 |
| chuong-7 | 32, 33 |

## 4. Ghi chú về KỲ VỌNG (5 câu lệch)

Theo quy tắc khớp block có phương án khớp nhất, **5 câu được liệt kê trong KỲ VỌNG là KHÔNG lệch**:

| Chương | Câu | Stem | Word (block đầu) | Word (block khớp phương án) | Bank |
|---|---|---|---|---|---|
| chuong-1 | 2 | Quản trị là gì? | A | D | D |
| chuong-1 | 9 | Các chức năng cơ bản của quản trị là gì? | B | A | A |
| chuong-4 | 82 | Mục tiêu nào sau đây được diễn đạt tốt nhất | C | A | A |
| chuong-6 | 2 | Lãnh đạo là: | B | D | D |
| chuong-6 | 32 | Các nhu cầu bậc cao của con người trong tháp nhu cầu Maslow  | D | B | B |

Nguyên nhân: các stem này xuất hiện 2 lần trong Word với **bộ phương án khác nhau**. Bank có 2 câu tương ứng, mỗi câu khớp 4/4 phương án với một block; highlight của block khớp phương án **bằng** đáp án bank. Vì vậy không có sai lệch. 5 câu "lệch" trong KỲ VỌNG chỉ xuất hiện khi ghép bank với block đầu tiên theo stem (không theo phương án).

## 5. Block Word không dùng (trùng bản sao)

- Chương 5: Các mối quan hệ trong cơ cấu trực tuyến – chức năng gồm? (highlight D)

## 6. Kết luận

Không cần sửa `a` nào. Số câu khớp = 535/535. Không phát sinh lỗi kỹ thuật.
