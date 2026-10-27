# Hướng dẫn AI: thêm môn học mới từ file Word (.docx)

Mục tiêu: từ file Word chứa trắc nghiệm (đặt ở thư mục gốc dự án), tạo thư mục môn học
và các trang HTML **Xem đề cương / Luyện tập / Thi thử** giống `qp-an`,
`quan-tri-hoc`, đồng thời tích hợp vào trang chủ, `pmt-ems` và ngân hàng câu hỏi.

> Các file mẫu chuẩn để đối chiếu:
> - `qp-an/` (môn chia nhiều đề — QPAN 1 & 2 — đi qua `pmt-ems` ở chế độ Thi thử)
> - `quan-tri-hoc/` (môn chia chương, trang làm bài dùng chung + `?d=chuong-N`)
> - `assets/data.js`, `assets/quiz-bank.js`, `assets/history.js`, `pmt-ems/pmt-ems.html`
>
> **Nguyên tắc:** nội dung đề (số câu, phân chương/đề, đáp án, lời giải) do người dùng
> quyết định; AI chỉ tạo khung trang và nạp đúng dữ liệu được cung cấp, không tự ý
> thêm/bớt/sửa câu hỏi. Khi nạp đáp án từ file trắc nghiệm, AI phải đối chiếu 1:1
> và không được sai lệch (sai câu, sai chỉ số đáp án, thiếu/thừa câu).

---
## 1. Phân loại môn trước khi làm

1. **Tên môn + nhóm**: phải khớp một nhóm trong `assets/data.js` → `RAW` (ví dụ
   `"ĐẠI CƯƠNG LÝ LUẬN CHÍNH TRỊ & MÔN KHÁC"`). Nếu môn mới không thuộc nhóm nào,
   thêm nhóm mới vào `RAW`.
2. **Slug môn**: dùng `CK.slug(tenMon)` (lowercase, bỏ dấu, `đ→d`, khoảng trắng→`-`).
   Ví dụ `QUẢN TRỊ HỌC` → `quan-tri-hoc`.
3. **Cấu trúc bài thi**:
   - Môn chia nhiều đề/chương → khai trong `PARTS_BY_SUBJECT[slug]`
     (`{ label, names: [...] }`).
   - Môn không chia bài thi → không cần khai.
   - Lưu ý: nhóm `GDQP-AN` trong `PARTS` mặc định có 10 đề. Nếu môn thuộc nhóm này
     nhưng không có 10 đề, phải ghi đè trong `PARTS_BY_SUBJECT`.
4. **Chế độ cần hỗ trợ** (chọn subset):
   - Xem đề cương → `PART_SYLLABUS`
   - Luyện tập → `PART_FILES` (mỗi bài một trang) hoặc một trang chung `?d=`
   - Thi thử → `PART_EXAM` + `PART_DO`

Khuyến nghị cho môn mới: đi qua `pmt-ems` ở chế độ Thi thử (giống QPAN 1/2 và
Quản trị học sau cập nhật), tức `PART_EXAM[slug] = "pmt-ems/pmt-ems.html"`.

> Lưu ý: chế độ Thi thử trong popup hiện chỉ khả dụng cho môn có bài thi (`parts`).
> Môn không chia bài thi cần khai `parts` hoặc cung cấp đường dẫn riêng.

---

## 2. Tạo thư mục môn học

- Tạo thư mục ở gốc site, đặt tên theo slug hoặc quy ước hiện có (`qp-an`,
  `quan-tri-hoc`). Mọi đường dẫn trong `assets/data.js` phải trỏ đúng tên này.
- Các file tối thiểu:
  - `quiz.html` hoặc `de-cuong.html` — Xem đề cương
  - `luyen-tap.html` (hoặc `de-N-quiz.html`) — Luyện tập
  - `thi-<MON>-ngau-nhien.html` — Thi thử (nếu có)
  - script sinh trang (tuỳ chọn): `gen-*.js`
- Tài nguyên chung luôn tham chiếu bằng `../assets/...`.

---

## 3. Trích xuất câu hỏi từ file Word

File Word là `.docx` (zip). Dùng `python-docx` (xem `quan-tri-hoc/TN-luyen-tap/nap-cau-hoi.md`
mục 2–4) hoặc công cụ đọc file có sẵn. Hai dạng input được hỗ trợ:

- Dạng A: bảng 5/6 cột (Câu hỏi | A | B | C | D | Đáp án)
- Dạng B: danh sách 6 dòng mỗi câu

Kết quả là JSON với schema:

```json
{ "id": 1, "text": "Nội dung câu?", "options": ["P.án A", "..."], "correct": 1, "code": "MA01" }
```

Ràng buộc:
- `options` tối đa 6 phần tử (`A..F`)
- `correct` là chỉ số 0-based và < `options.length`
- `id` không trùng lặp
- text thuần (không HTML rich-text)
- ký tự `</script>` phải escape thành `<\/script>`

---

## 4. Nạp vào ngân hàng câu hỏi

Thêm vào `assets/quiz-bank.js` → `g.CK.PART_QUIZ`:

```js
"<slug-mon>": {
  "<part-id>": [
    { q: "Câu hỏi", o: ["P.án A", "P.án B", "..."], a: 0, e: "Giải thích (tuỳ chọn)" }
  ]
}
```

- Khoá ngoài = slug môn, khoá trong = slug bài thi (phải khớp `CK.partsOf`).
- Thi thử ngẫu nhiên đọc trực tiếp `CK.PART_QUIZ["<slug>"]` (xem
  `quan-tri-hoc/gen-thi-ngau-nhien.js`).

---

## 5. Tích hợp vào `assets/data.js`

### 5.1 Nhóm & môn

Thêm tên môn vào `RAW` đúng nhóm. Ví dụ:

```js
["ĐẠI CƯƠNG LÝ LUẬN CHÍNH TRỊ & MÔN KHÁC", "Đại cương lý luận chính trị & môn khác",
  [..., "TÊN MÔN MỚI"]]
```

### 5.2 Bài thi (nếu chia đề/chương)

```js
var PARTS_BY_SUBJECT = {
  "<slug>": { label: "Chương", names: ["Chương 1", "Chương 2", "..."] }
};
```

### 5.3 Ánh xạ trang

```js
var PART_FILES = { "<slug>": { "chuong-1": "<folder>/luyen-tap.html?d=chuong-1", ... } };
var PART_SYLLABUS = { "<slug>": "<folder>/quiz.html" };   // nhận ?d=
var PART_EXAM = { "<slug>": "pmt-ems/pmt-ems.html" };
var PART_DO = { "<slug>": "<folder>/thi-<mon>-ngau-nhien.html" };
```

Nếu môn dùng trang làm bài chung cho cả bài thi (kiểu Quản trị học), `PART_FILES` trỏ
cùng một file với `?d=<part-id>`.

---

## 6. Tích hợp `pmt-ems` (chế độ Thi thử)

File `pmt-ems/pmt-ems.html`:

1. Thêm ít nhất một dòng vào mảng `EXAMS`:

```js
{ id: '0101000236XX', m: '<slug-mon>', label: 'Tên môn' }
```

   (hoặc khai đủ `ten, tiet, nhom, phong, lop, hk` như QPAN 2).
2. `buildCourses()` tự lấy danh sách môn từ `CK.CATS`, nên không cần sửa HTML.
3. `btn-confirm` dùng `CK.partDo(slug)` để nhảy sang trang làm bài — đảm bảo
   `PART_DO` đã khai.

---

## 7. Lịch sử làm bài (`assets/history.js`)

Nếu thư mục môn không phải `qp-an`, thêm nhánh trong `metaFromPath()`
để suy ra `slug`, `subject`, `cat`, `catName` từ đường dẫn:

```js
} else if (/^<folder>$/i.test(dir)) {
  out.slug = "<slug>"; out.subject = "TÊN MÔN";
  out.cat = "NHÓM"; out.catName = "Tên nhóm";
}
```

Các trang làm bài cũng nên truyền `meta` rõ ràng vào `CK.recordHistory(result, meta)`
(giống `thi-quan-tri-hoc-ngau-nhien.html`).

---

## 8. Tạo trang Thi thử ngẫu nhiên

Lấy `qp-an/thi-QPAN1-ngau-nhien.html` làm bản mẫu và sinh bản mới bằng script
Node (xem `quan-tri-hoc/gen-thi-ngau-nhien.js`):

- thay tiêu đề môn
- thay số câu / cấu trúc
- khoá localStorage riêng (`<slug>_rng_v1`)
- nguồn câu hỏi: `CK.PART_QUIZ["<slug>"]`
- nạp `assets/quiz-bank.js` trước `history.js`
- metadata `CK.recordHistory` đúng slug/môn/nhóm

Nếu môn có giải thích, trang đề cương dùng `assets/qpan1-explanations.js` làm mẫu.

---

## 9. Trang Luyện tập

Dùng `quan-tri-hoc/TN-luyen-tap/template-quiz.html` làm bản mẫu, sinh bản mới theo
`quan-tri-hoc/TN-luyen-tap/nap-cau-hoi.md`:
- sao chép nguyên file, chỉ thay dữ liệu câu hỏi
- không sửa CSS/bố cục/luồng/chấm điểm
- nhúng inline `QUESTIONS`, cập nhật `CONFIG.questionCount`, `ALL_QUESTIONS`

---

## 10. Kiểm tra trước khi bàn giao

1. Chạy script Node nếu có (phải EXIT=0).
2. Quét href/src nội bộ (PowerShell trong README mục "Lệnh kiểm tra") → phải ra `OK`.
3. Mở trang chủ → bấm môn → popup hiển thị đủ chế độ.
4. Chế độ Thi thử: bấm → `pmt-ems` chọn đúng môn → bấm LÀM BÀI → trang thi thử chạy.
5. Làm bài → ghi lịch sử → xuất hiện ở `lich-su-lam-bai.html`.
6. Nếu môn có câu hỏi: đối chiếu đáp án với nguồn Word (tham khảo
   `tools/scripts/kiem-tra-dap-an-qth.js`).

---

## Ghi chú

- Không thêm thư viện ngoài; mọi trang mở được bằng `file://`.
- Giữ nguyên bảng màu/trạng thái thiết kế (xem `docs/design.md`).
- Khi thêm môn vào `RAW`, trang chủ tự có môn trong danh mục (build động).
- Nếu môn mới có trang riêng (không popup), khai trong `NAV_FILES`.
