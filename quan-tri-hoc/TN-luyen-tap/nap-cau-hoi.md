# Hướng dẫn cho AI: tạo bản trắc nghiệm từ `template-quiz.html` + nạp câu hỏi từ file Word

Mục tiêu: sinh ra **một file HTML mới** chạy được, có đầy đủ câu hỏi lấy từ file `.docx`,
**không thay đổi** giao diện, bố cục, cấu trúc, luồng làm bài và cách tính điểm của template.

> Quy tắc tính điểm: xem [`scoring.md`](./scoring.md). Nạp câu hỏi **không cần** đụng tới điểm —
> điểm tự tính theo số lần chọn sai của từng câu.

---

## 0. Nguyên tắc bất di bất dịch

1. **Không sửa `template-quiz.html`.** Luôn tạo bản sao mới (bước 1). Template là bản gốc để đối chiếu.
2. **Chỉ thay phần dữ liệu câu hỏi.** Mọi thứ khác giữ nguyên từng dòng.
3. **Không thêm thư viện ngoài.** Một file HTML, CSS + JS nội tuyến, mở bằng `file://` là chạy.
4. **Không đổi bảng màu trạng thái.** Xem mục 5.
5. **Sau khi sửa phải chạy test** (mục 6) và báo kết quả.

---

## 1. Tạo bản sao

```
template-quiz.html           # bản gốc — KHÔNG SỬA
<ten-mon>-quiz.html          # bản sinh ra, ví dụ: gt-c01-ktct-quiz.html
```

Sao chép nguyên file, chỉ đặt tên khác. Mọi thay đổi nằm trong bản sao.

---

## 2. Định dạng file Word (`.docx`) đầu vào

Hỗ trợ hai dạng. Chọn một dạng cho cả file để dễ đọc.

**Dạng A — bảng (khuyến nghị):** bảng 5 hoặc 6 cột, mỗi hàng là một câu.

| Câu hỏi | A | B | C | D | Đáp án |
|---|---|---|---|---|---|
| Nội dung câu 1 | P.án 1 | P.án 2 | P.án 3 | P.án 4 | B |
| Nội dung câu 2 | P.án 1 | P.án 2 | P.án 3 | P.án 4 | A |

**Dạng B — danh sách, mỗi câu là một khối 6 dòng:**

```
Câu 1. Nội dung câu hỏi thứ nhất?
A. Phương án thứ nhất
B. Phương án thứ hai
C. Phương án thứ ba
D. Phương án thứ tư
Đáp án: B
```

Lưu ý khi đọc file Word:
- Cột "Đáp án" nhận `A/B/C/D/E/F` **hoặc** `1/2/3/4` (1 = phương án đầu tiên).
- Ô trống ở cuối hàng bị bỏ qua (dùng cho câu chỉ có 3 hoặc 5 phương án).
- Bỏ qua các hàng tiêu đề (`Câu hỏi`, `A`, `B`…) và các đoạn văn bản ngoài bảng.

---

## 3. Trích xuất ra JSON

`.docx` là file zip chứa `word/document.xml`, nên phải đọc bằng thư viện, không mở bằng trình
đọc văn bản thường. Cách nhanh nhất là `python-docx`:

```bash
pip install python-docx
```

```python
# docx_to_questions.py — chạy: python docx_to_questions.py "de.docx" > questions.json
import json, re, sys, unicodedata
from docx import Document

LETTERS = "ABCDEF"

def clean(s):
    return re.sub(r"\s+", " ", s.replace("\xa0", " ")).strip()

def no_diacritic(s):                      # so sánh tiêu đề không dấu
    s = s.replace("đ", "d").replace("Đ", "D")   # "đ" là ký tự riêng, NFD không tách được
    return "".join(c for c in unicodedata.normalize("NFD", s)
                   if unicodedata.category(c) != "Mn").lower().strip()

def from_tables(doc):
    out = []
    for t in doc.tables:
        for row in t.rows:
            cells = [clean(c.text) for c in row.cells]
            if len(cells) < 3 or not cells[0]:
                continue
            head = no_diacritic(cells[0])
            if head.startswith("cau hoi") or head.startswith("question"):
                continue                              # hàng tiêu đề
            key = cells[-1]
            if no_diacritic(key).startswith("dap an"):
                continue                              # hàng tiêu đề cột đáp án
            opts = [c for c in cells[1:-1] if c]       # bỏ ô trống (câu 3 hoặc 5 phương án)
            if len(opts) >= 2 and key:
                out.append((cells[0], opts, key))
    return out

def from_paragraphs(doc):
    blocks, cur = [], []
    for p in doc.paragraphs:
        line = clean(p.text)
        if not line:
            continue
        if re.match(r"^(câu\s*\d+[.:)]|cau\s*\d+[.:)])", line, re.I):
            if cur:
                blocks.append(cur)
            cur = [line]
        elif cur:
            cur.append(line)
    if cur:
        blocks.append(cur)

    out = []
    for lines in blocks:
        key = next((l for l in lines[1:] if no_diacritic(l).startswith("dap an")), "")
        opts = [re.sub(r"^[A-F][.:)]\s*", "", l) for l in lines[1:]
                if re.match(r"^[A-F][.:)]", l)]
        if key and opts:
            out.append((re.sub(r"^câu\s*\d+[.:)]\s*", "", lines[0], flags=re.I), opts, key))
    return out

def to_questions(pairs):
    qs = []
    for i, (text, opts, key) in enumerate(pairs, 1):
        k = re.sub(r"^dap\s*an\s*[:.]?\s*", "", no_diacritic(key)).upper().strip()
        k = k.split()[0].rstrip(".:") if k else ""        # "Đáp án: B" -> "B"
        correct = LETTERS.index(k[0]) if k[:1] in LETTERS else (int(k) - 1 if k.isdigit() else 0)
        qs.append({"id": i, "text": text, "options": opts, "correct": correct})
    return qs

sys.stdout.reconfigure(encoding="utf-8")     # Windows: tránh lỗi codec khi in tiếng Việt
doc = Document(sys.argv[1])
pairs = from_tables(doc) or from_paragraphs(doc)
json.dump(to_questions(pairs), sys.stdout, ensure_ascii=False, indent=2)
```

Nếu không cài được Python: dùng công cụ đọc file có sẵn của môi trường
(ví dụ MCP `gemini-notebook-mcp` `source_add` với `source_type="file"` — `.docx` là định dạng
được hỗ trợ), rồi tự điền JSON theo schema bên dưới.

---

## 4. Schema của một câu hỏi

```json
{
  "id": 1,                                  // bắt buộc, duy nhất trong cả bộ đề
  "text": "Nội dung câu hỏi?",
  "options": ["P.án A", "P.án B", "P.án C", "P.án D"],
  "correct": 1,                             // chỉ số 0-based của đáp án đúng
  "code": "GT01-C01"                        // tuỳ chọn: mã câu hiện ở trang xem đáp án
}
```

Ràng buộc do code đặt ra:

| Ràng buộc | Lý do |
|---|---|
| `options` tối đa **6** phần tử | `LETTERS = ['A','B','C','D','E','F']` (template-quiz.html:1363) |
| `correct` phải **< `options.length`** | dùng làm chỉ số mảng |
| `id` **không trùng lặp** | `state.picked/solved/attempts/skipped` đánh khoá theo `id` |
| `code` không có thì tự sinh `ID:<564058296 + id>` | `codeOf(q)` (template-quiz.html:2006) |
| `text`/`options` là **text thuần** | render bằng `textContent` → HTML/rich-text sẽ hiện nguyên chữ |
| Ký tự `</script>` phải viết thành `<\/script>` | tránh kết thúc thẻ `<script>` |

Không thêm key lạ. `answers` mà trang xem đáp án sinh ra chỉ cần 5 trường trên.

---

## 5. Nhúng vào bản sao (đúng 3 chỗ)

Mở **bản sao** (không phải template), tìm trong thẻ `<script>`:

**(1)** Thay khối `TEMPLATES` + `buildQuestions` (template-quiz.html:1365-1384) bằng dữ liệu thật.
Giữ nguyên mọi thứ khác xung quanh:

```js
  /* ========================= CÂU HỎI =========================
     Nguồn: <tên file .docx> — <ngày nạp>
     Xem scoring.md cho quy tắc tính điểm (tự động, không cần cấu hình). */
  const QUESTIONS = [
    { id: 1, text: "Nội dung câu 1", options: ["P.án A", "P.án B", "P.án C", "P.án D"], correct: 1 },
    { id: 2, text: "Nội dung câu 2", options: ["P.án A", "P.án B", "P.án C", "P.án D"], correct: 2 }
  ];
```

**(2)** Cập nhật số câu trong `CONFIG`:

```js
    questionCount: 2,             // = QUESTIONS.length
```

**(3)** Nối dữ liệu vào danh sách câu:

```js
  const ALL_QUESTIONS = QUESTIONS;
```

`fetch` file JSON bên ngoài **không dùng được**: mở bằng `file://` thì CORS chặn,
mà cấu trúc hiện tại khởi tạo đồng bộ. Phải nhúng inline.

Tuỳ chọn (vẫn chỉ là dữ liệu, không đụng bố cục): sửa `CONFIG.subjectName`,
`CONFIG.candidateName`, `CONFIG.timeLimitSeconds`, `CONFIG.onFinish`.

---

## 6. Không được đụng tới

| Vùng | Nội dung | Lý do |
|---|---|---|
| `<style>` (template-quiz.html:1-1084) | toàn bộ CSS, `--brand`/`--ok`/`--warn`/`--bad` | đổi là lệch giao diện so với template |
| HTML `<body>` | cấu trúc `topbar`, `stage`, `bottombar`, màn kết quả, trang xem đáp án, các `backdrop` | mọi script đều tra cứu theo `id` |
| `LETTERS`, `buildMap`, `syncMap`, `renderQuestion`, `syncQuestion` | logic dựng câu hỏi/đáp án | phụ thuộc `id`, `options`, `correct` |
| `statusOf`, `pointsOf`, `SCORE_RATE_BY_ATTEMPTS` | logic trạng thái và tính điểm | theo `scoring.md` |
| `finish`, `buildRanking`, `renderRanking`, `showResultPage`, `showReviewPage` | màn kết quả, bảng xếp hạng, xem đáp án | đã hoàn chỉnh |
| `el = { ... }` và `window.quiz` | danh sách `id`, API tích hợp | mất `id` là JS ném lỗi ngay |

**Bảng màu trạng thái** — giữ nguyên, đây là ngôn ngữ thiết kế của app:

| Trạng thái | Class | Màu |
|---|---|---|
| Làm đúng ngay | `is-right`, `is-correct` | xanh lá `--ok` |
| Chọn sai | `is-wrong` | vàng `--warn` |
| Sai rồi làm lại đúng | `is-retry` | vàng `--warn` |
| Bấm Esc bỏ qua | `is-skipped`, `is-wrong` (thẻ câu) | đỏ `--bad` |
| Toast riêng "Chú ý hơn nhé" | `is-hint` | vàng `--warn` |

---

## 7. Kiểm tra trước khi bàn giao

Các script trong `tests/` trỏ tới `index.html`, nên tạo bản sao tạm để chạy test gốc:

```powershell
Copy-Item template-quiz.html index.html; node tests/run.js; Remove-Item index.html
```

- `node tests/run.js` phải ra `FAILED: 0` và `Console errors: khong co`.
  (Bộ test này tự sinh câu hỏi riêng nên chạy được với bất kỳ bộ đề nào — nếu số câu khác
  10 thì các con số trong tên test vẫn đúng vì test tự tính.)
- Kiểm tra riêng bản sinh ra: mở file bằng trình duyệt, đối chiếu với template:
  - đủ số câu, đúng nội dung, đáp án đúng ở đúng vị trí;
  - trang xem đáp án hiện đủ câu (có phân trang "Xem thêm" nếu > 10 câu);
  - làm 1 câu sai rồi làm đúng → điểm phải là `0.75` (xem `scoring.md`);
  - giao diện không dịch chuyển so với template.

Không có `package.json`, cài gì cũng không cần — chỉ cần Node.js để chạy test.