# Design System — Glassmorphism Neutral + Brand Blue cho Google Stitch

> Tài liệu chuẩn hoá phong cách **kính trắng trên nền sáng**, dùng **một màu nhấn duy nhất**.
> Dùng khi thiết kế UI bằng [Google Stitch](https://stitch.withgoogle.com) cho **web app / dashboard**.
>
> Gồm 3 phần: **(1) Style guide** (quy chuẩn thị giác) · **(2) Design spec** (đặc tả component) ·
> **(3) Thư viện prompt** (dán thẳng vào Stitch).

**Màu nhấn:** `#034EA2` · RGB `3, 78, 162` · CMYK `100, 80, 0, 0`

---

## Mục lục

- [0. Cách dùng tài liệu này](#0-cách-dùng-tài-liệu-này)
- [1. Nguyên tắc cốt lõi](#1-nguyuyên-tắc-cốt-lõi)
- [2. Design tokens](#2-design-tokens)
- [3. Thứ tự lớp (Layer stack)](#3-thứ-tự-lớp-layer-stack)
- [4. Component spec](#4-component-spec)
- [5. Màn hình mẫu (Dashboard)](#5-màn-hình-mẫu-dashboard)
- [6. Accessibility & hiệu năng](#6-accessibility--hiệu-năng)
- [7. Thư viện prompt cho Stitch](#7-thư-viện-prompt-cho-stitch)
- [8. Anti-pattern cần tránh](#8-anti-pattern-cần-tránh)
- [9. Handoff checklist](#9-handoff-checklist)

---

## 0. Cách dùng tài liệu này

1. **Chèn "Design tokens"** (§2) vào đầu prompt của mọi lần sinh UI — Stitch sẽ bám theo giá trị đó.
2. **Chọn 1 màn hình** từ §7, dán prompt tương ứng.
3. **Luôn kèm phần Constraints** (§6.2) để tránh output lệch chuẩn.
4. Sau khi Stitch sinh xong: đối chiếu với **Component spec** (§4) và **Anti-pattern** (§8) trước khi export.

> Stitch xử lý prompt tiếng Anh tốt hơn — prompt trong §7 đã viết sẵn bằng tiếng Anh.

---

## 1. Nguyên tắc cốt lõi

Kính trắng trên nền sáng là biến thể **khó hơn hẳn** kính tô đậm: kính gần như "biến mất"
nếu nền cũng trắng. Ba nguyên tắc dưới là bắt buộc, không phải tuỳ chọn.

| # | Nguyên tắc | Giải thích |
|---|---|---|
| 1 | **Nền phải có độ sâu — không bao giờ trắng thuần** | Nền là xám có gradient. Nếu nền `#FFFFFF`, kính trắng không có gì để "phản chiếu" và giao diện sẽ trông như trang in. |
| 2 | **Tách lớp bằng BÓNG, không bằng màu** | Bóng mềm + viền trắng tách panel khỏi nền. Không dùng viền màu. |
| 3 | **Tương phản đảo chiều** | Chữ **tối** trên kính sáng — ngược với glassmorphism nền tối thông thường. |
| 4 | **Chỉ 6 sắc xám + 2 sắc brand** | Toàn bộ giao diện nằm trong 8 giá trị này. Mọi thứ phân biệt bằng **độ sáng**, không bằng hue. |
| 5 | **Một màu nhấn duy nhất: `#034EA2`** | Chỉ dùng cho **tương tác** (nút chính, active, focus) và **nhấn mạnh** (tiêu đề, số liệu). Không dùng cho nền lớn, không dùng cho body text. |
| 6 | **Trạng thái phân biệt bằng độ đậm của brand, không bằng hue** | Paid / Pending / Failed dùng 3 bậc của thang `#034EA2`. Nghĩa đến từ **chữ + icon + độ đậm**. |

### 1.1 Bảng màu (8 giá trị, không thêm)

| Token | Hex | RGB | Dùng cho |
|---|---|---|---|
| `white` | `#FFFFFF` | 255,255,255 | Highlight, kính cấp cao, chữ trên nền brand |
| `off-white` | `#F7F8FA` | 247,248,250 | Đầu gradient nền |
| `gray-100` | `#E8EAEF` | 232,234,239 | Nền sâu nhất |
| `gray-300` | `#C9CED8` | 201,206,216 | Viền, đường kẻ, chart series 4 |
| `gray-400` | `#8B94A3` | 139,148,163 | Chữ phụ, placeholder, icon |
| `gray-600` | `#4B5563` | 75,85,99 | **Body text** |
| **`brand`** | **`#034EA2`** | **3,78,162** | **Màu nhấn duy nhất** |
| `brand-deep` | `#023A80` | 2,58,128 | Hover / active của brand |

**Tên biến thể (tint) của brand** — dùng thay vì thêm màu mới:

```css
--brand-06: rgba(3, 78, 162, 0.06);   /* divider, viền nhạt  */
--brand-10: rgba(3, 78, 162, 0.10);   /* badge nền, chip   */
--brand-25: rgba(3, 78, 162, 0.25);   /* viền mạnh          */
--brand-45: rgba(3, 78, 162, 0.45);   /* heatmap cell nhạt  */
```

> **Không thêm màu thứ 9.** Nếu cần thêm sắc, hãy dùng `brand-deep` hoặc thay đổi độ đậm,
> không tạo hue mới.

### 1.2 Giới hạn sử dụng màu nhấn

Đây là nơi Stitch hay sinh sai — nó sẽ tô brand lên mọi thứ. Quy tắc cứng:

| ✅ Dùng `#034EA2` | ❌ Không dùng |
|---|---|
| Nút primary | Nền lớn (card, panel, sidebar) |
| Trạng thái active của nav / toggle | Body text dài |
| Focus ring | Biểu đồ nền, grid line |
| Tiêu đề section, số liệu KPI | Icon trang trí lặp lại > 3 lần |
| Chart series 1 | Trạng thái nguy hiểm (xem §4.6) |
| Link, logo, avatar chính | Gradient đa màu |

> **Quy tắc 20%:** brand được phép chiếm **không quá 20% diện tích** màn hình.
> Nếu nhìn thấy brand ở mọi nơi → đã dùng quá.

---

## 2. Design tokens

### 2.1 Màu nền (Background)

| Token | Giá trị | Dùng cho |
|---|---|---|
| `bg-base` | `#E8EAEF` | Nền sâu nhất |
| `bg-canvas` | `linear-gradient(155deg, #F7F8FA, #E4E7ED)` | Gradient nền chính |
| `blob-1` | `rgba(255,255,255,0.85)` | Blob trắng — tạo vùng sáng |
| `blob-2` | `rgba(160,172,190,0.28)` | Blob xám — tạo vùng tối |
| `blob-3` | `rgba(255,255,255,0.60)` | Blob trắng phụ |
| `blob-4` | `rgba(148,163,184,0.22)` | Blob xám phụ |

```
┌────────────────────────────────────────────┐
│  ○ white          (0% – 28% width)         │
│                          ● gray (55–85%)   │
│      ○ white                                 │
│  (0–25%, 60–100%)                           │
└────────────────────────────────────────────┘
   Blur trên blob: 90–120px
```

> **Blob không phải tuỳ chọn:** kính trắng chỉ "thấy" được vùng **tối hơn** nó.
> Blob tạo độ tương phản cục bộ để kính nổi lên. Bỏ blob → kính trở nên vô hình.

### 2.2 Màu kính (Glass surfaces)

Trên nền sáng, kính cần **nhiều hơn opacity** và **blur cao hơn** so với bản nền tối.

| Token | Background | Blur | Border | Dùng cho |
|---|---|---|---|---|
| `glass-1` | `rgba(255,255,255,0.55)` | `16px` | `rgba(255,255,255,0.70)` | Card, chip, badge |
| `glass-2` | `rgba(255,255,255,0.70)` | `28px` | `rgba(255,255,255,0.85)` | Panel, sidebar, table |
| `glass-3` | `rgba(255,255,255,0.85)` | `44px` | `rgba(255,255,255,1.00)` | Modal, popover, dropdown |

**Saturation:** dùng `saturate(120%)` (nhẹ). Mạnh sẽ kéo màu của blob vào kính.

### 2.3 Highlight & bóng kính

Trên nền sáng, **bóng đóng vai trò chính** (bản nền tối thì viền đóng vai trò chính).
Bóng được **pha thiên về brand** để cùng hệ màu — không dùng bóng đen.

```css
.glass {
  background: rgba(255, 255, 255, 0.70);
  backdrop-filter: blur(28px) saturate(120%);
  border-radius: 20px;

  border: 1px solid rgba(255, 255, 255, 0.85);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),    /* sáng trên cùng  */
    inset 0 -1px 0 rgba(3, 78, 162, 0.04),      /* gờ brand dưới  */
    0 1px 2px rgba(3, 78, 162, 0.04),           /* tiếp xúc        */
    0 8px 24px rgba(3, 78, 162, 0.08);          /* đổ bóng chính   */
}
```

### 2.4 Màu chữ

| Token | Giá trị | Dùng cho |
|---|---|---|
| `text-strong` | `#034EA2` | Tiêu đề, số liệu, chữ nhấn mạnh |
| `text` | `#4B5563` | **Body text — cấm dùng brand ở đây** |
| `text-muted` | `#8B94A3` | Nhãn, mô tả, placeholder |
| `text-faint` | `#AEB5C0` | Icon không tương tác, phân khu |
| `text-brand-deep` | `#023A80` | Tiêu đề trên nền trắng tinh, brand nhạt |
| `text-invert` | `#FFFFFF` | Chữ trên nền brand |

> **Mẹo tuỳ biến:** nếu màn hình quá xanh (nhiều tiêu đề + nhiều số liệu),
> đổi `text-strong` về `#1F2430` và giữ `#034EA2` cho tương tác.
> Chỉ sửa **một biến** trong `:root` là xong.

### 2.5 Bo góc

| Token | Giá trị | Dùng cho |
|---|---|---|
| `r-sm` | `10px` | Chip, badge, input nhỏ |
| `r-md` | `14px` | Button, input, table cell |
| `r-lg` | `20px` | **Card chuẩn — dùng nhiều nhất** |
| `r-xl` | `28px` | Panel lớn, modal |
| `r-full` | `9999px` | Avatar, pill, nút tròn |

> Bo tròn **quan trọng hơn** khi dùng màu nhấn — đường cong mềm giữ kính mềm thay vì "hộp cứng".

### 2.6 Đổ bóng (thang chính)

| Token | Giá trị | Dùng cho |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(3,78,162,0.05)` | Viền mảnh, badge |
| `shadow-sm` | `0 1px 2px rgba(3,78,162,.04), 0 4px 12px rgba(3,78,162,.07)` | Input, chip, button |
| `shadow-md` | `0 2px 4px rgba(3,78,162,.04), 0 12px 28px rgba(3,78,162,.10)` | Card, topbar |
| `shadow-lg` | `0 8px 16px rgba(3,78,162,.07), 0 24px 56px rgba(3,78,162,.14)` | Dropdown, modal |
| `shadow-float` | `0 1px 2px rgba(3,78,162,.06), 0 10px 30px rgba(3,78,162,.12)` | Sidebar, savebar |
| `shadow-press` | `0 1px 2px rgba(3,78,162,.14)` | Nút ở trạng thái active |

> **Không dùng bóng đen.** Chỉ dùng bóng **pha brand** — bóng đen tạo vệt bẩn,
> phá vỡ cảm giác sạch của palette.

### 2.7 Typography

| Token | Font | Size / Weight | Dùng cho |
|---|---|---|---|
| `font-display` | **Plus Jakarta Sans** hoặc **Inter** | — | Toàn bộ UI |
| `font-mono` | **JetBrains Mono** | 13px / 500 | Số liệu, mã đơn, thời gian |
| `h1` | 32px / 700 / -0.02em | | Tiêu đề trang |
| `h2` | 22px / 700 / -0.01em | | Tiêu đề section |
| `h3` | 17px / 600 | | Tiêu đề card |
| `body` | 14px / 400 / 1.6 | | Nội dung |
| `label` | 11px / 600 / 0.04em / uppercase | | Nhãn, tiêu đề cột |
| `metric` | 30px / 700 / -0.02em | | Số liệu KPI |

### 2.8 Khoảng cách

Lưới 4px. `gap` chính: `8 · 12 · 16 · 20 · 24 · 32 · 48`

| Token | Giá trị |
|---|---|
| `p-sm` | `12px` |
| `p-md` | `20px` |
| `p-lg` | `32px` |
| `gutter` | `24px` (lưới dashboard) |

### 2.9 Motion

| Token | Giá trị | Dùng cho |
|---|---|---|
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Mặc định |
| `dur-fast` | `140ms` | Hover, focus |
| `dur-base` | `240ms` | Mở/đóng, chuyển tab |

> Không dùng animation cho `backdrop-filter` — rất tốn GPU.

---

## 3. Thứ tự lớp (Layer stack)

Blur chỉ "thấy" những gì nằm **dưới** nó. Sai thứ tự → kính không hoạt động.

```
z-0   Nền gradient + mesh blob trắng/xám (blur 100px)
z-1   Nội dung trang (text, chart nền)
z-10  Glass-1 : card, chip, badge
z-20  Glass-2 : sidebar, panel, sticky header
z-30  Glass-3 : dropdown, popover, tooltip
z-40  Overlay : scrim brand-45% + blur 2px
z-50  Modal, drawer, toast
```

**Overlay:** dùng `rgba(3,78,162,0.45)` — đen tạo vùng bẩn trong palette này.

**Sai lầm thường gặp:** đặt modal ở `z-10` (thấp hơn card) → modal nằm dưới card.

---

## 4. Component spec

### 4.1 Card kính (dùng nhiều nhất)

```
┌────────────────────────────────┐
│  TIÊU ĐỀ                      │  padding 20px
│  Nội dung mô tả ngắn           │  gap 12px giữa các block
│  ─────────────────────────────  │  divider: rgba(3,78,162,0.07)
│  [Nhãn nhỏ]        Giá trị lớn │  gap 24px giữa các block
└────────────────────────────────┘
```

- Nền `glass-1` · Blur `16px` · Bo góc `r-lg` · Padding `20px` · `shadow-sm`
- Hover: nền lên `rgba(255,255,255,0.72)`, dịch lên `-2px`, bóng đậm hơn, `dur-fast`
- Tiêu đề `h3` màu `text-strong`, giá trị `metric` màu `text-strong`
- Viền trên luôn có highlight trắng

### 4.2 Sidebar

| Thuộc tính | Giá trị |
|---|---|
| Width | `248px` desktop, đóng lại thành `72px` icon-only |
| Nền | `glass-2` · Blur `28px` · `shadow-float` |
| Bo góc | `r-xl` · cách mép `16px` (float sidebar) |
| Item height | `44px` · Bo góc `r-md` |
| Item active | Nền `rgba(255,255,255,0.90)` + chữ `#034EA2` + `shadow-xs` |
| Item hover | Nền `rgba(255,255,255,0.55)` · chữ `#4B5563` |
| Item icon | `#8B94A3`, khi active → `#034EA2` |

> Item active dùng **nền trắng đục + chữ brand** (không tô brand nền) — giữ sidebar sạch
> và đảm bảo brand không chiếm quá 20% diện tích.

### 4.3 Header / Topbar

- Cao `64px`, `glass-2`, bo gốc `r-lg`, cách mép trên `16px`, `shadow-md`
- **Sticky** — luôn có `backdrop-blur` để nội dung cuộn qua nhìn thấy mờ
- Trái: breadcrumb (`#8B94A3`) + tiêu đề (`text-strong`) · Phải: search, notification, avatar

### 4.4 Input / Search

- Nền `rgba(255,255,255,0.50)` · Blur `12px` · Viền `rgba(3,78,162,0.14)` · `shadow-xs`
- Bo gốc `r-md` · Cao `44px` · Padding ngang `16px`
- Focus: viền `#034EA2` + `box-shadow: 0 0 0 3px rgba(3,78,162,0.12)`
- Placeholder: `#AEB5C0`
- Error: viền `#023A80` 1.5px + viền dưới 2px + chữ lỗi `#4B5563` 13px

> **Error không dùng đỏ.** Đánh đổi có chủ ý của palette một màu —
> nhấn mạnh bằng độ đậm + gạch chân + icon cảnh báo.

### 4.5 Button

| Loại | Nền | Chữ | Viền / bóng |
|---|---|---|---|
| **Primary** | `#034EA2` | `#FFFFFF` | `shadow-sm`, hover `#023A80` |
| **Glass** | `rgba(255,255,255,0.55)` + blur | `#034EA2` | Viền `rgba(255,255,255,0.80)`, `shadow-sm` |
| **Ghost** | Trong suốt | `#4B5563` | Không |
| **Danger** | Trong suốt | `#034EA2` | Viền `1.5px #034EA2`, có icon cảnh báo |

- Cao `44px` (primary) / `36px` (sm) · Bo gốc `r-md` · Padding ngang `20px` · Font `600`
- Active: `transform: scale(0.98)` + `shadow-press`

> **Danger dùng viền brand, không dùng đỏ** — vì brand đã chiếm vai trò "màu nhấn duy nhất".
> Xem §4.6 về cách bù bằng ngữ cảnh.

### 4.6 Badge / Chip & vấn đề "nguy hiểm không có màu"

Cao `24px` · Bo gốc `r-full` · Padding ngang `10px` · Font `12px/600`
Ba cấp đều thuộc **thang brand**:

| Cấp | Nền | Chữ | Dot | Dùng cho |
|---|---|---|---|---|
| **Solid** | `#034EA2` | `#FFFFFF` | trắng, đặc | Paid, Active, Completed |
| **Mid** | `rgba(3,78,162,0.10)` | `#023A80` | `#034EA2`, đặc | Pending, Review |
| **Light** | `rgba(255,255,255,0.60)` | `#4B5563` | `#8B94A3`, rỗng | Failed, Archived, Draft |

**Về hành động nguy hiểm (Danger Zone):** trong hệ một màu, không thể dùng hue để báo
"xoá". Bù bằng **3 tín hiệu khác** — Stitch cần được nhắc đủ 3:

1. **Vị trí** — nằm trong section riêng, tách khỏi các section khác bằng khoảng trống 20px
2. **Chữ** — nhãn `DANGER ZONE` viết hoa, weight 600, letter-spacing `.06em`
3. **Nội dung** — luôn có copy *"Hành động này không thể hoàn tác"* ngay dưới tiêu đề
4. **Icon** — nút Danger luôn có icon tam giác cảnh báo, không dùng icon xoá

> **Nếu sản phẩm bắt buộc phải có đỏ cho destructive actions:** thêm **đúng một**
> màu nữa — `#B42318` (đỏ pha nâu, không thuần đỏ) — và chỉ dùng ở nút Danger + viền
> section. Không dùng ở bất kỳ đâu khác. Ghi rõ ngoại lệ này vào design.md.

### 4.7 Table

| Phần | Giá trị |
|---|---|
| Container | `glass-2`, blur `28px`, bo gốc `r-lg`, `shadow-md` |
| Header row | Nền `rgba(3,78,162,0.035)`, chữ `label`, màu `#8B94A3` |
| Row divider | 1px `rgba(3,78,162,0.06)` |
| Row hover | Nền `rgba(255,255,255,0.55)` |
| Cell padding | `16px 20px` · Font `14px` |
| Row height | `56px` |
| Cột đầu | `font-mono`, `#8B94A3` |
| Ô hành động | Brand **chỉ xuất hiện ở cột cuối, dạng icon-button**, không phải link text |

### 4.8 Chart

| Series | Màu | Ghi chú |
|---|---|---|
| 1 | `#034EA2` | **Brand** — series chính, luôn là series quan trọng nhất |
| 2 | `#6B7280` | Xám trung |
| 3 | `#9AA3B2` | Xám nhạt |
| 4 | `#C9CED8` | Rất nhạt — chỉ dùng cho series thứ 4 |

| Yếu tố | Cấu hình |
|---|---|
| Grid line | `rgba(3,78,162,0.07)` · **không** vẽ viền ngoài |
| Nhãn trục | `#8B94A3` · 11px |
| Area fill | Gradient của series → `transparent` (opacity 22% → 0) |
| Line width | 2px · bo góc · điểm bo tròn 6px, chỉ hiện ở point active |
| Tooltip | `glass-3`, blur `44px`, bo gốc `r-md` |
| Chú thích | Dot bo tròn 9px + nhãn 12px `#4B5563` |
| Heatmap | Chỉ dùng `#034EA2` ở opacity 5% → 90% |

> Series 1 phải là brand, và **chỉ series 1**. Nếu biểu đồ có 3 series mà cả 3 đều gần
> màu nhau, người dùng không phân biệt được — đó là lý do các series còn lại phải là xám.

### 4.9 Modal / Drawer

- **Modal**: `glass-3`, blur `44px`, bo gốc `r-xl`, rộng `max 560px`, `shadow-lg`
- **Overlay**: `rgba(3,78,162,0.45)` + `backdrop-blur(2px)`
- **Drawer** (mobile): trượt từ phải, rộng `420px`, bo gốc chỉ góc trái `r-xl`
- Header: tiêu đề `h2` + nút đóng kính tròn 32px
- Mở/đóng: `dur-base` + `ease-out`, scale `0.96 → 1`

### 4.10 Toast

Góc trên phải, cách mép `24px`, rộng `360px` · `glass-3` · bo gốc `r-md`
Icon tròn 32px — **mức đậm theo cấp**: success dùng brand đặc, cảnh báo dùng brand-10,
lỗi dùng `gray-600` (đậm hơn brand về độ tương phản nền).
Text 2 dòng tối đa · Nút đóng kính · Tự ẩn sau `5s` · Trượt vào từ phải.

### 4.11 Switch

- Track `44×25px`, bo gốc `r-full`
- **Off**: nền `rgba(3,78,162,0.14)`, knob trắng
- **On**: nền `#034EA2`, knob trắng
- Không dùng gradient — chỉ một bước chuyển solid

### 4.12 Login

- Card: `glass-3`, blur `44px`, bo gốc `r-xl`, rộng `max 420px`, padding `40px`
- Logo tile: nền `#034EA2` bo gốc `r-md`, chữ trắng — **không gradient**
- Nút chính: `#034EA2` toàn khối, chữ trắng
- Social button: `glass` — viền `rgba(3,78,162,0.14)`
- Link "Forgot password?" / "Sign up": `#034EA2` weight 600

---

## 5. Màn hình mẫu (Dashboard)

### 5.1 Layout chuẩn

```
┌──────────────────────────────────────────────────────────┐
│  ┌────────┐  ┌──────────────────────────────────────┐   │
│  │ Side   │  │  Header (glass-2, sticky, 64px)      │   │
│  │ bar    │  ├──────────────────────────────────────┤   │
│  │ 248px  │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │   │
│  │ glass-2│  │  │ KPI  │ │ KPI  │ │ KPI  │ │ KPI  │ │   │
│  │        │  │  └──────┘ └──────┘ └──────┘ └──────┘ │   │
│  │  r-xl  │  │  ┌──────────────┐ ┌──────────────┐   │   │
│  │        │  │  │ Chart chính  │ │  Side panel  │   │   │
│  │        │  │  │  (8 cols)     │ │  (4 cols)    │   │   │
│  │        │  │  └──────────────┘ └──────────────┘   │   │
│  │        │  │  ┌──────────────────────────────────┐  │   │
│  │        │  │  │  Bảng dữ liệu (glass-2)          │  │   │
│  └────────┘  │  └──────────────────────────────────┘  │   │
│   margin 16 │  Padding ngoài: 16px · Gap: 24px         │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Grid chuẩn

| Vùng | Tỉ lệ cột |
|---|---|
| Hàng KPI | 4 card × 3 cột (hoặc 3 card × 4 cột) |
| Chart + panel | 8 cột + 4 cột |
| Bảng | 12 cột (full) |
| Sidebar | Cột cố định 248px, không theo grid |

### 5.3 Breakpoint

| Tên | Width | Hành vi |
|---|---|---|
| Desktop | `≥1280px` | Sidebar đầy đủ, grid 12 cột |
| Laptop | `1024–1279px` | Sidebar icon-only 72px, KPI 2×2 |
| Tablet | `768–1023px` | Sidebar thành drawer, KPI 2×2, chart full |
| Mobile | `<768px` | 1 cột, header rút gọn, modal → bottom sheet, **tắt blur** |

---

## 6. Accessibility & hiệu năng

### 6.1 Tương phản (bắt buộc)

| Nội dung | Tối thiểu |
|---|---|
| Chữ thường | 4.5:1 |
| Chữ lớn (≥18px bold) | 3:1 |
| Icon, viền component | 3:1 |

**Các tổ hợp đã kiểm:**

| Nền | Chữ | Tỉ lệ |
|---|---|---|
| `#FFFFFF` | `#034EA2` | 8.0:1 ✅ AAA |
| `glass-1` trên nền sáng (≈`#EDEDF0`) | `#034EA2` | 6.9:1 ✅ AA |
| `glass-1` trên nền sáng | `#4B5563` | 6.5:1 ✅ AA |
| `glass-1` trên nền sáng | `#8B94A3` | 3.1:1 ⚠ chỉ cho ≥18px bold / label |
| `#034EA2` (nút primary) | `#FFFFFF` | 8.0:1 ✅ AAA |

> `#8B94A3` **không** đạt AA cho chữ nhỏ. Dùng cho `label` 11px bold hoặc
> nâng lên `#6B7280` (~4.6:1). Phương án dự phòng cho link trên nền trắng tinh:
> dùng `#023A80` (~9.5:1).

### 6.2 Ràng buộc khi dùng Stitch (đưa vào prompt)

```
Constraints — one single accent color:
- The UI has exactly ONE accent color: #034EA2 (RGB 3,78,162).
- Allowed palette and nothing else:
  #FFFFFF, #F7F8FA, #E8EAEF, #C9CED8, #8B94A3, #4B5563, #034EA2, #023A80
- The accent must NOT occupy more than about 20% of the screen.
- Use the accent ONLY for: primary buttons, active nav items, focus rings,
  section titles, KPI values, links, and chart series 1.
- Do NOT use the accent for: card or panel backgrounds, body text,
  decorative icons, grid lines, or large surfaces.
- No other hue anywhere. No gradients other than the white-to-gray
  background and area-chart fills. No red destructive buttons — signal
  destructive actions with a "DANGER ZONE" uppercase label, a warning
  triangle icon, and the sentence "This action cannot be undone".
- Keep text contrast at WCAG AA minimum
- Max 4 glass surfaces visible per screen
- Use only 2 font families: Plus Jakarta Sans and JetBrains Mono
- Blur values in multiples of 8px
- Layer order: background < cards < panels < overlays < modals
- Charts: series 1 is #034EA2, series 2-4 are #6B7280, #9AA3B2, #C9CED8
```

### 6.3 Hiệu năng

| Vấn đề | Giải pháp |
|---|---|
| `backdrop-filter` rất tốn GPU | **Giới hạn số phần tử có blur đồng thời** ≤ 8–10 |
| Repaint liên tục | `will-change: backdrop-filter` có kiểm soát, bỏ sau khi vào chỗ |
| Mobile hiệu năng kém | Mobile **tắt blur**, thay bằng `rgba(255,255,255,0.92)` |
| Scroll lag | Dùng `transform` thay vì `filter` khi animate |

```css
.glass { background: rgba(255, 255, 255, 0.92); }   /* fallback */
@supports (backdrop-filter: blur(1px)) {
  .glass {
    background: rgba(255, 255, 255, 0.70);
    backdrop-filter: blur(28px) saturate(120%);
  }
}
```

### 6.4 Khả năng tiếp cận khác

- **Focus ring** rõ: `2px solid #034EA2` + `offset 2px` — không được bỏ dù focus chỉ hiện khi bấm bàn phím
- Không truyền nghĩa chỉ bằng màu — luôn có icon hoặc chữ đi kèm
- Vùng tương tác ≥ `44×44px`
- Hỗ trợ `prefers-reduced-motion`: tắt transition, blur giữ nguyên

---

## 7. Thư viện prompt cho Stitch

> `{product}` = tên sản phẩm.

### 7.1 System prompt — dán vào đầu mọi lần sinh

```
Design a light glassmorphism UI for {product}, a web dashboard.
White and neutral gray surfaces with ONE single accent color.

ACCENT COLOR: #034EA2 (RGB 3,78,162) — this is the only color.
Use it ONLY for primary buttons, active navigation, focus rings,
section titles, KPI numbers, links, and chart series 1.
The accent must not cover more than 20% of the screen.
Do not use it for card backgrounds, body text, or large surfaces.

PALETTE — these 8 values and nothing else:
#FFFFFF pure white · #F7F8FA off-white · #E8EAEF light gray ·
#C9CED8 mid gray · #8B94A3 soft gray · #4B5563 deep gray ·
#034EA2 brand blue · #023A80 brand deep.
No other hue. No red, green, purple, pink, orange, or yellow.

BACKGROUND: light. A white-to-light-gray gradient
(linear-gradient 155deg, #F7F8FA, #E4E7ED) with large soft mesh
blobs — pure white at 85% opacity and gray #A0ACBE at 28% —
each blurred 100px. The blobs are essential: white glass needs
darker areas behind it to be visible. Never a flat background.

GLASS SYSTEM — three levels, all white:
  Level 1 cards:    rgba(255,255,255,0.55), backdrop-blur 16px,
                    border rgba(255,255,255,0.70)
  Level 2 panels:   rgba(255,255,255,0.70), backdrop-blur 28px,
                    border rgba(255,255,255,0.85)
  Level 3 overlays: rgba(255,255,255,0.85), backdrop-blur 44px,
                    border rgba(255,255,255,1.00)
Every glass element has an inset top highlight
(inset 0 1px 0 rgba(255,255,255,0.95)), an inset bottom edge
(inset 0 -1px 0 rgba(3,78,162,0.04)), and a soft BRAND-TINTED
drop shadow (0 8px 24px rgba(3,78,162,0.08)). Shadows are tinted
with the accent blue — never black.

TEXT: #034EA2 for titles, KPI numbers and emphasis. #4B5563 for
all body text. #8B94A3 for labels and placeholders.
#FFFFFF on dark or accent-filled surfaces.
Dark text on light glass — the inverse of dark-mode glass.

CORNER RADIUS: 10px chips · 14px buttons and inputs ·
20px cards · 28px panels and modals · 9999px avatars and pills.

TYPOGRAPHY: Plus Jakarta Sans only. Page title 32px/700,
section title 22px/700, card title 17px/600, body 14px/400,
labels 11px/600 uppercase. JetBrains Mono for numeric metrics
at 30px/700.

CHARTS: series 1 is #034EA2; series 2, 3, 4 are #6B7280, #9AA3B2,
#C9CED8. Grid lines rgba(3,78,162,0.07). Axis labels #8B94A3 11px.
Heatmaps use #034EA2 at 5% to 90% opacity only.

CONSTRAINTS:
- Exactly one accent color, used sparingly
- Body text on glass must reach WCAG AA contrast
- Max 4 glass surfaces visible per screen
- Max 2 font families
- Blur values in multiples of 8px
- Layer order: background < cards < panels < overlays < modals
- Spacing on a 4px grid, 24px gutter
```

### 7.2 Màn hình: Dashboard tổng quan

```
Create the main dashboard screen for {product}.

LAYOUT: 12-column grid, 16px page padding, 24px gap.
- Left sidebar, 248px, fixed, glass level 2, floating with 16px
  margin, radius 28px. Items: Overview, Analytics, Customers,
  Products, Reports, Settings.
  Active item: background rgba(255,255,255,0.90) with a subtle
  shadow, and its label and icon turn #034EA2.
  Inactive items: transparent background, #8B94A3 icon and label.
- Top header, 64px, glass level 2, sticky, radius 20px, 16px
  top margin, soft shadow. Contains page title "Overview" on the
  left in #034EA2; search input, notification bell, and a 32px
  avatar on the right. The avatar is a solid #034EA2 circle with
  white initials.

CONTENT AREA:
- Row 1 — four KPI cards, 3 columns each, glass level 1:
  "Total Revenue" $48,290 (+12.5%), "Active Users" 12,840 (+8.2%),
  "Conversion Rate" 3.24% (−0.4%), "Avg. Order Value" $126.80 (+3.1%).
  Each card: 11px uppercase label in #8B94A3, then the value in
  30px/700 JetBrains Mono in #034EA2, then a pill badge.
  Badge levels: positive = solid #034EA2 pill with white text,
  negative = white pill with a 1px rgba(3,78,162,0.25) border and
  #4B5563 text. Do not use green or red.
- Row 2 — main line chart in 8 columns, glass level 1,
  title "Revenue Overview" in #034EA2, time range tabs (7D / 30D /
  90D) in a white pill on the right. Legend of 3 series:
  #034EA2, #6B7280, #9AA3B2, with area fills fading to transparent.
  Next to it a 4-column glass level 1 card "Traffic Sources" with a
  horizontal bar list — bars descending from #034EA2 to #C9CED8.
- Row 3 — full-width data table, glass level 2, title
  "Recent Orders" in #034EA2. Columns: Order ID (mono, #8B94A3),
  Customer, Product, Amount, Status, Date. 6 rows of sample data
  with status badges — Paid solid #034EA2, Pending at 10% accent,
  Failed white with a light accent border. Rows 56px tall,
  16px 20px cell padding, 1px dividers at rgba(3,78,162,0.06).
```

### 7.3 Màn hình: Analytics

```
Create the Analytics screen for {product}.

- Same app shell: floating glass sidebar 248px, sticky glass top
  bar 64px.
- Page title "Analytics" 32px/700 in #034EA2 with subtitle
  "Last updated 2 minutes ago" in #8B94A3.
- A white pill date-range selector (Last 7 / 30 / 90 days / Custom)
  in the top right, glass level 2.
- Row 1: three compact KPI cards, each with a small sparkline inside.
- Row 2: a large area chart in 8 columns — 3 smooth series in
  #034EA2, #6B7280, #9AA3B2. Series 1 is the accent; series 2 and 3
  are neutral gray so the accent stays the only color.
  2px lines, gradient fills fading to transparent at 0%, grid lines
  rgba(3,78,162,0.07), no outer border, tooltip as glass level 3.
- Row 3: a grouped bar chart in 7 columns comparing two periods
  (#034EA2 vs #9AA3B2), and a 5-column glass card "Top Performing"
  with a ranked list of 5 items — rank number in a square, name,
  value in mono, and a thin progress bar descending from
  #034EA2 to #D7DBE2.
- Row 4: a heatmap grid, 7 columns × 24 rows, cells using only
  #034EA2 at opacity 5% to 90%, rounded 6px, 4px gap. Add a
  Less → More legend with five steps of the same blue.

Chart text: 11px, #8B94A3. Charts sit on glass level 1 cards.
Only the first series of each chart uses the accent color.
```

### 7.4 Màn hình: Login

```
Create a login screen for {product}.

- Centered single glass card, max 420px wide, glass level 3
  (blur 44px), radius 28px, padding 40px, soft brand-tinted shadow.
- Behind it, the full-bleed light gradient background with large
  soft white and gray mesh blobs.
- Card contents, top to bottom:
  a 48px solid #034EA2 logo tile with rounded corners and a white
  monogram — solid fill, no gradient,
  "Welcome back" 28px/700 in #034EA2,
  "Sign in to continue" 14px in #8B94A3,
  email input (44px, glass level 1, radius 14px),
  password input with a show/hide eye icon,
  a row with a checkbox "Remember me" and a link "Forgot password?"
  in #034EA2 weight 600,
  a full-width primary button "Sign in" — SOLID #034EA2 background
  with white text, 44px tall, no gradient,
  a horizontal divider with "or continue with",
  a row of two glass outline buttons — Google and GitHub — each
  50% width, white fill with a light accent border,
  "Don't have an account? Sign up" centered, with "Sign up" in #034EA2.
- Validation error: the input border darkens to #023A80 with a
  2px bottom border, and the error line below reads in #4B5563 at
  13px. No red anywhere.
```

### 7.5 Màn hình: Settings

```
Create the Settings screen for {product}.

- Same app shell: floating glass sidebar 248px, sticky glass top
  bar 64px.
- Two-column layout: a 220px vertical nav on the left inside glass
  level 2 (Profile, Notifications, Security, Billing, Integrations,
  Danger zone) and the content pane on the right.
- Content is split into stacked glass level 1 section cards
  separated by 20px gaps, each with a title 17px/600 in #034EA2
  and a muted description in #8B94A3.
- Section 1 "Profile": a 64px avatar with a 2px #034EA2 ring and
  an upload button, then two-column form fields — Full name and
  Email side by side, Company and Timezone below.
- Section 2 "Notifications": 5 toggle rows, each a label,
  description, and a switch. The first two are on.
  Switch off-state track is rgba(3,78,162,0.14), on-state track is
  solid #034EA2, knob is white. No green.
- Section 3 "DANGER ZONE": because there is only one accent color,
  signal destruction without red:
  a 1.5px rgba(3,78,162,0.25) border on the card,
  the heading "DANGER ZONE" in 11px uppercase, weight 600,
  letter-spacing 0.06em, color #034EA2,
  the line "This action cannot be undone." in 13px #4B5563,
  and one button "Delete account" — transparent fill with a 1.5px
  #034EA2 border, #034EA2 text, and a WARNING TRIANGLE icon
  (not a trash icon).
- Save bar is sticky at the bottom: a floating glass level 2 pill
  with "Discard" ghost button and a solid #034EA2 "Save changes"
  primary button.
```

### 7.6 Component lẻ — yêu cầu sinh riêng

```
Prompt: Design a {component} component for a light glassmorphism
dashboard with a single accent color #034EA2. {MÔ TẢ CHI TIẾT}.
Glass level {N}, blur {X}px, radius {R}px, border rgba(255,255,255,{A}),
soft brand-tinted shadow. The accent #034EA2 is used only for the
interactive element — never for the container fill. Show it in three
states: default, hover, and disabled.
```

Ví dụ:

```
Prompt: Design a notification dropdown panel for a light
glassmorphism dashboard. 380px wide, glass level 3
(rgba(255,255,255,0.85), blur 44px), radius 20px, white border.
Contains a header "Notifications" in #034EA2 with a "Mark all read"
link in #8B94A3, then five rows 64px tall: a 36px circular icon tile
in rgba(3,78,162,0.10) with a #034EA2 icon, a two-line title in
#4B5563 with a timestamp in #8B94A3, and an unread indicator that is
a small solid #034EA2 dot. Top three rows have a background of
rgba(255,255,255,0.55). Divider between rows at rgba(3,78,162,0.06).
Shadow 0 24px 56px rgba(3,78,162,0.14).
```

### 7.7 Nếu Stitch sinh sai — prompt sửa

| Vấn đề | Prompt sửa |
|---|---|
| **Stitch tự thêm màu** | `There is only ONE accent color: #034EA2. Convert every other hue to neutral gray. The result must look like a grayscale screenshot with a single blue accent.` |
| **Brand dùng quá nhiều** | `Reduce the accent to under 20% of the screen. Card and panel backgrounds must stay white glass. Do not fill cards, the sidebar, or section containers with #034EA2.` |
| **Tiêu đề + số liệu đều xanh → rối mắt** | `Use #034EA2 only for section titles and primary buttons. Set KPI values and body text to #4B5563.` |
| **Nút đỏ/xanh lá cho trạng thái** | `No green, no red. Positive status is a solid #034EA2 pill; pending is 10% accent tint; negative is a white pill with a 1px accent border.` |
| **Danger zone không nổi** | `Do not use red. Mark the destructive section with an uppercase "DANGER ZONE" label, a 1.5px rgba(3,78,162,0.25) border, and the sentence "This action cannot be undone."` |
| **Chart nhiều màu** | `Chart series must be #034EA2 for series 1 only, then #6B7280, #9AA3B2, #C9CED8.` |
| **Bóng đen** | `Retint all shadows to the accent: rgba(3,78,162,0.08) instead of black.` |
| **Kính trông vô hình** | `Add soft brand-tinted shadows (0 8px 24px rgba(3,78,162,0.08)) and large blurred mesh blobs so white glass has darker areas to refract.` |
| **Trông giống Bootstrap** | `Increase corner radius to 20px on cards and 28px on panels. Increase blur and lower glass opacity so backgrounds show through.` |
| **Dùng gradient cho nút** | `Solid fills only. Primary #034EA2, glass buttons rgba(255,255,255,0.55).` |

---

## 8. Anti-pattern cần tránh

| ❌ Không nên | ✅ Nên làm |
|---|---|
| Thêm hue thứ 2 cho "vui mắt" | Đúng 1 accent `#034EA2`, mọi thứ khác là xám |
| Tô brand lên nền card / panel | Nền card luôn là kính trắng |
| Brand chiếm > 20% màn hình | Brand chỉ cho tương tác + nhấn mạnh |
| Dùng brand cho body text dài | Body text `#4B5563` |
| Nền trắng thuần `#FFFFFF` | Gradient `#F7F8FA → #E4E7ED` + mesh blob |
| Kính trắng không có blob | Luôn có ≥ 2 blob để kính có chỗ tối hơn để phản chiếu |
| Bóng đen `rgba(0,0,0,·)` | Bóng pha brand `rgba(3,78,162,·)` |
| Gradient cho nút / logo | Solid fill |
| Trạng thái phân biệt bằng màu | Phân biệt bằng **độ đậm của brand + chữ + icon** |
| Dùng màu để truyền nghĩa một mình | Luôn kèm chữ hoặc icon |
| Bo góc nhỏ (4–8px) | ≥ 14px |
| Trông giống Bootstrap mặc định | Blur cao + bo góc lớn + bóng mềm |
| Quá 6 vùng kính chồng nhau | Tối đa 3–4 |
| Blur thay đổi khi scroll | `backdrop-filter` ổn định |
| Blur trên mobile | Tắt blur, dùng `rgba(255,255,255,0.92)` |
| Thiếu `:focus-visible` | Focus ring `#034EA2` 2px |
| Bỏ bóng vì "nền sáng không cần" | Bóng là cơ chế tách lớp chính |

---

## 9. Handoff checklist

Trước khi export từ Stitch:

**Màu**
- [ ] **Đúng 1 accent** `#034EA2` — không có hue thứ 2 (kể cả đỏ cho Danger)
- [ ] Brand không vượt 20% diện tích màn hình
- [ ] Không card/panel nào được tô brand
- [ ] Bóng đều pha brand, không có bóng đen

**Tổng thể**
- [ ] Nền gradient `#F7F8FA → #E4E7ED`, có ≥ 2 mesh blob
- [ ] Không quá 4 vùng kính trên 1 màn hình
- [ ] Z-index đúng thứ tự lớp (§3)

**Glass**
- [ ] Opacity `0.55 / 0.70 / 0.85` theo 3 level
- [ ] Blur `16 / 28 / 44px`
- [ ] Có inset highlight trắng trên mọi vật thể kính
- [ ] Bo góc ≥ 14px

**Typography**
- [ ] Tối đa 2 font, đúng §2.7
- [ ] Số liệu dùng font mono
- [ ] Body text `#4B5563`; chữ trên brand = trắng

**Tương tác**
- [ ] Có đủ trạng thái: default / hover / active / focus / disabled
- [ ] Focus ring `#034EA2` 2px nhìn thấy được
- [ ] Vùng bấm ≥ 44×44px
- [ ] Trạng thái phân biệt được **khi không màu** (độ đậm + chữ + icon)
- [ ] Danger zone có đủ 4 tín hiệu (§4.6): vị trí · nhãn · copy · icon

**Phụ**
- [ ] Có fallback khi không hỗ trợ `backdrop-filter`
- [ ] Đã cân nhắc bản mobile (tắt blur)

---

## Phụ lục A — Snippet CSS gốc

```css
:root {
  /* Trung tính */
  --white:     #FFFFFF;
  --off-white: #F7F8FA;
  --gray-100:  #E8EAEF;
  --gray-300:  #C9CED8;
  --gray-400:  #8B94A3;
  --gray-600:  #4B5563;

  /* Brand — màu nhấn duy nhất */
  --brand:        #034EA2;   /* RGB 3,78,162 · CMYK 100,80,0,0 */
  --brand-deep:   #023A80;
  --brand-06: rgba(3, 78, 162, .06);
  --brand-10: rgba(3, 78, 162, .10);
  --brand-25: rgba(3, 78, 162, .25);

  /* Kính */
  --glass-1-bg: rgba(255, 255, 255, 0.55);
  --glass-2-bg: rgba(255, 255, 255, 0.70);
  --glass-3-bg: rgba(255, 255, 255, 0.85);
  --glass-1-br: rgba(255, 255, 255, 0.70);
  --glass-2-br: rgba(255, 255, 255, 0.85);
  --glass-3-br: rgba(255, 255, 255, 1.00);
  --blur-1: 16px; --blur-2: 28px; --blur-3: 44px;

  --r-sm: 10px; --r-md: 14px; --r-lg: 20px; --r-xl: 28px;

  /* Chữ */
  --text-strong: #034EA2;   /* đổi thành #1F2430 nếu màn hình quá xanh */
  --text:        #4B5563;
  --text-muted:  #8B94A3;
  --text-faint:  #AEB5C0;
  --text-invert: #FFFFFF;

  /* Bóng — luôn pha brand, không bao giờ đen */
  --sh-xs:    0 1px 2px rgba(3,78,162,.05);
  --sh-sm:    0 1px 2px rgba(3,78,162,.04), 0 4px 12px rgba(3,78,162,.07);
  --sh-md:    0 2px 4px rgba(3,78,162,.04), 0 12px 28px rgba(3,78,162,.10);
  --sh-lg:    0 8px 16px rgba(3,78,162,.07), 0 24px 56px rgba(3,78,162,.14);
  --sh-float: 0 1px 2px rgba(3,78,162,.06), 0 10px 30px rgba(3,78,162,.12);
  --sh-press: 0 1px 2px rgba(3,78,162,.14);

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-fast: 140ms;
  --dur-base: 240ms;
}

body {
  margin: 0;
  min-height: 100vh;
  color: var(--text);
  font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(55% 45% at 14% 10%, rgba(255,255,255,.85), transparent 70%),
    radial-gradient(50% 45% at 78% 26%, rgba(160,172,190,.28), transparent 70%),
    radial-gradient(50% 45% at 22% 86%, rgba(255,255,255,.60), transparent 70%),
    radial-gradient(45% 40% at 92% 82%, rgba(148,163,184,.22), transparent 70%),
    linear-gradient(155deg, #F7F8FA, #E4E7ED);
  filter: blur(90px);
}

.glass {
  position: relative;
  background: var(--glass-2-bg);
  border: 1px solid var(--glass-2-br);
  border-radius: var(--r-lg);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 -1px 0 rgba(3, 78, 162, 0.04),
    0 1px 2px rgba(3, 78, 162, 0.04),
    0 8px 24px rgba(3, 78, 162, 0.08);
}

@supports (backdrop-filter: blur(1px)) {
  .glass {
    background: var(--glass-2-bg);
    backdrop-filter: blur(var(--blur-2)) saturate(120%);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .glass {
    transition:
      background var(--dur-fast) var(--ease-out),
      transform var(--dur-fast) var(--ease-out);
  }
}

@media (max-width: 768px) {
  .glass { background: rgba(255, 255, 255, 0.92); backdrop-filter: none; }
}

:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
```

---

## Phụ lục B — Đổi màu nhấn

Chỉ cần sửa **3 dòng** trong `:root` để đổi sang màu thương hiệu khác:

```css
--brand:      #XXXXXX;   /* màu chính */
--brand-deep: #XXXXXX;   /* hover / active */
```

Rồi tìm–thay toàn bộ chuỗi màu cũ trong file (kể cả trong prompt §7 và các giá trị hex viết tay):

| Chuỗi cũ | Thay bằng |
|---|---|
| `#034EA2` | màu mới |
| `#023A80` | màu mới đậm hơn ~15% |
| `rgba(3, 78, 162, ·)` / `rgba(3,78,162,·)` | `rgba(R, G, B, ·)` |

**Kiểm tra sau khi đổi:** trắng trên `--brand` phải ≥ 4.5:1,
và `--brand` trên kính trắng phải ≥ 4.5:1. Nếu màu quá nhạt thì dùng `--brand-deep` cho chữ.

## Phụ lục C — Kiểm tra nhanh "đúng 1 màu chưa"

1. **Chụp screenshot** màn hình Stitch
2. Bật **Desaturate** (Figma → chỉnh ảnh → bão hoà `0%`)
3. Hình gần như **chỉ còn xám** → đạt. Chỉ còn vùng xanh ở nút / tiêu đề / chart series 1
4. Nếu thấy màu lạ ở chỗ khác → tra §8

Cách thứ 2: DevTools → **Rendering** → **CSS Overview**, hoặc filter stylesheets
theo `#|rgb|hsl` để tìm mọi khai báo màu không nằm trong 8 giá trị đã cho phép.