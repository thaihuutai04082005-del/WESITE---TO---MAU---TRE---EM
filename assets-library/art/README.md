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
| Hổ gầm vang (Anh Hùng Siêu Thú, thay biến thể Tia Chớp của Hổ; tên tranh "Hổ Gầm Vang") | – | `src/ho--gam-vang.png` | 108 |

## Tranh theo độ tuổi (không phải thẻ)

Chủ đề cho bé **3–5 tuổi** dùng tranh vẽ tay, khai báo trong `ART_THEMES` (`generator/themes.mjs`):
chủ đề (`age`: `'3-5'`) → đối tượng → từng tranh (`file` trong thư mục này). Cách tạo file `.json` giống thẻ ở trên.
Các chủ đề kết hợp sáng tạo do bộ tạo tranh vẽ thuộc nhóm **6–8 tuổi**; nhóm **9 tuổi trở lên** chưa có tranh.

| Chủ đề | Đối tượng | Tranh | Vùng tô |
|---|---|---|---|
| Động Vật (3–5 tuổi) | Chó con | Ngồi ngoan · Vẫy đuôi · Chơi bóng · Ăn thức ăn · Nằm nghỉ | 16 · 15 · 23 · 38 · 14 |
| Động Vật (3–5 tuổi) | Mèo con | Ngồi xinh · Chơi cuộn len · Uống sữa · Rửa mặt · Nằm ngủ | 19 · 45 · 23 · 19 · 17 |
| Động Vật (3–5 tuổi) | Thỏ con | Ngồi ngoan · Ăn cà rốt · Nhảy vui · Ngửi hoa · Nằm nghỉ | 25 · 26 · 29 · 26 · 26 |
| Công Chúa Ngàn Hoa (6–8 tuổi, đứng sau Xứ Sở Đồ Chơi bằng `after`) | Công Chúa Váy Hoa | Công Chúa Váy Hoa Hồng | 426 |
| Công Chúa Ngàn Hoa | Thiếu Nữ Áo Dài | Thiếu Nữ Áo Dài Hoa Sen | cong-chua-ngan-hoa--ao-dai-hoa-sen |
| Công Chúa Ngàn Hoa | Vũ Công Ballet | Vũ Công Ballet Hoa Tulip | cong-chua-ngan-hoa--ballet-hoa-tulip |
| Công Chúa Ngàn Hoa | Thiếu Nữ Hanbok | Thiếu Nữ Hanbok Mẫu Đơn | cong-chua-ngan-hoa--hanbok-mau-don |
| Công Chúa Ngàn Hoa | Cô Nàng Váy Yếm | Cô Nàng Váy Yếm Hoa Cúc Trắng | cong-chua-ngan-hoa--vay-yem-hoa-cuc |
| Công Chúa Ngàn Hoa | Thiếu Nữ Sườn Xám | Thiếu Nữ Sườn Xám Tử Đằng | cong-chua-ngan-hoa--suon-xam-tu-dang |
| Công Chúa Ngàn Hoa | Tiểu Thư Váy Ngắn | Tiểu Thư Váy Ngắn Hướng Dương | cong-chua-ngan-hoa--vay-ngan-huong-duong |
| Công Chúa Ngàn Hoa | Tiểu Thư Áo Len | Tiểu Thư Áo Len Hoa Ly | cong-chua-ngan-hoa--ao-len-hoa-ly |
| Công Chúa Ngàn Hoa | Cô Nàng Hoodie | Cô Nàng Hoodie Oải Hương | cong-chua-ngan-hoa--hoodie-oai-huong |
| Công Chúa Ngàn Hoa | Thiếu Nữ Cardigan | Thiếu Nữ Cardigan Cẩm Tú Cầu | cong-chua-ngan-hoa--cardigan-cam-tu-cau |
| Hải Trình Kỳ Diệu (6–8 tuổi, xếp sau Xứ Sở Học Cụ bằng `after`) | Tàu Ngầm | Tàu Ngầm Bong Bóng Phép Thuật | 160 |

Mèo con, Thỏ con chỉ có ảnh màu: nét được tách từ chính ảnh màu (điểm ảnh rất tối), viền màu (giọt nước, dấu chân, mặt nước) được vẽ thêm theo mép mảng màu.
