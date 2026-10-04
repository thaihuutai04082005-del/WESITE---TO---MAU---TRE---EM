# Thẻ vẽ tay (tranh nét do chủ web gửi)

Thẻ gacha C/B/A/S có thể dùng tranh nét đen trắng vẽ sẵn thay cho thẻ do bộ tạo tranh vẽ.

## Thêm 1 thẻ mới

1. Lưu ảnh nét gốc vào `src/<đối-tượng>--<hạng>.webp` (hoặc .png/.jpg), nền trắng, nét đen, khung vuông.
2. Tách vùng và xem số từng vùng:
   `python3 lineart.py src/<file> - /tmp/thu.json --preview /tmp/so-vung.png`
3. Tạo `<đối-tượng>--<hạng>.colors.json` để gán màu gợi ý (chế độ Tô theo mẫu) và tên vùng:
   - `"numbers": {"20": ["#FFB74D", "dau-meo"]}` — theo số vùng in trên ảnh preview,
   - `"seeds": [[x, y, "#màu", "tên"]]` — theo toạ độ điểm trong ảnh gốc,
   - vùng không gán dùng `"default"` (trắng).
   - Bỏ bớt nét gốc: `"erase": [{"rect": [x0,y0,x1,y1]} | {"poly": [[x,y]...]} | {"line": [[x,y]...], "w": 9}]`;
     vẽ lại nét trơn để nối chỗ vừa xoá: `"draw": [{"line": [[x,y]...], "w": 6}]` (độ dày nét gốc khoảng 6px).
   - Viền hở làm 2 vùng dính nhau (VD tròng trắng mắt dính vào đầu): `"seal": [{"line": [[x,y]...], "w": 3}]` ngăn vùng ngầm, KHÔNG vẽ thêm nét.
4. Tạo file cho web: `python3 lineart.py src/<file> <file>.colors.json <đối-tượng>--<hạng>.json --preview /tmp/xem.png`
5. Thêm vào cuối danh sách `CARD_ART` trong `generator/themes.mjs`, ví dụ `{ object: 'meo-sieu-thu', rarity: 'S', file: 'meo-sieu-thu--s' }`, rồi `node generator/build.mjs`.
   Bộ thẻ gacha CHỈ gồm các thẻ trong `CARD_ART`, hiện theo đúng thứ tự trong danh sách.
   Con vật không thuộc 6 đối tượng của chủ đề: thêm `theme`, `objectName`, `slug`, `name` (thẻ riêng, không hiện ở trang chọn đối tượng).

Tên và slug thẻ giữ như thẻ cũ cùng hạng, nên bé nào đã có thẻ vẫn giữ nguyên (chỉ hình đổi).
Cần Python 3 với `numpy`, `scipy`, `opencv-python-headless`.

## Đã có

| Đối tượng | Hạng | Nguồn | Vùng tô |
|---|---|---|---|
| Mèo giáp vàng huyền thoại (Anh Hùng Siêu Thú) | S | `src/meo-sieu-thu--s.webp` | 119 |
| Cá heo dũng sĩ biển cả (Anh Hùng Siêu Thú, thẻ riêng) | A | `src/ca-heo--a.webp` | 64 |

## Tranh theo độ tuổi (không phải thẻ)

Chủ đề cho bé **3–4 tuổi** và **4–5 tuổi** dùng tranh vẽ tay, khai báo trong `ART_THEMES` (`generator/themes.mjs`):
chủ đề (`age`: `'3-4'` | `'4-5'`) → đối tượng → từng tranh (`file` trong thư mục này). Cách tạo file `.json` giống thẻ ở trên.
15 chủ đề kết hợp do bộ tạo tranh vẽ thuộc nhóm **từ 6 tuổi trở lên**.

| Chủ đề | Đối tượng | Tranh | Vùng tô |
|---|---|---|---|
| Động Vật (3–4 tuổi) | Chó con | Ngồi ngoan · Vẫy đuôi · Chơi bóng · Ăn thức ăn · Nằm nghỉ | 16 · 15 · 23 · 38 · 14 |
| Động Vật (3–4 tuổi) | Mèo con | Ngồi xinh · Chơi cuộn len · Uống sữa · Rửa mặt · Nằm ngủ | 19 · 45 · 23 · 19 · 17 |
| Động Vật (3–4 tuổi) | Thỏ con | Ngồi ngoan · Ăn cà rốt · Nhảy vui · Ngửi hoa · Nằm nghỉ | 25 · 26 · 29 · 34 · 53 |

Mèo con, Thỏ con chỉ có ảnh màu: nét được tách từ chính ảnh màu (điểm ảnh rất tối), viền màu (giọt nước, dấu chân, mặt nước) được vẽ thêm theo mép mảng màu.
