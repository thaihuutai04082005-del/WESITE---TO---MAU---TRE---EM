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
| Mèo nhảy siêu cao (Anh Hùng Siêu Thú, thay biến thể Nhảy Siêu Cao của Mèo; tên tranh "Mèo Nhảy Siêu Cao") | – | `src/meo--nhay-sieu-cao.png` | 97 |
| Chó siêu thông minh (Anh Hùng Siêu Thú, biến thể mới của Chó; áo choàng xanh biển) | – | `src/cho-sieu-thu--sieu-thong-minh.png` | 114 |
| Thỏ siêu tốc (Anh Hùng Siêu Thú, đối tượng mới Thỏ) | – | `src/tho-sieu-thu--sieu-toc.png` | 64 |
| Gấu trắng đại lực (Anh Hùng Siêu Thú, đối tượng mới Gấu; tên tranh "Gấu Trắng Đại Lực") | – | `src/gau-sieu-thu--dai-luc.png` | 113 |
| Đại bàng xé gió (Anh Hùng Siêu Thú, biến thể mới của Đại bàng) | – | `src/dai-bang--xe-gio.png` | 123 |
| Heo siêu phàm ăn (Anh Hùng Siêu Thú, đối tượng mới Heo) | – | `src/heo-sieu-thu--sieu-pham-an.png` | 140 |
| Khỉ dây leo thần tốc (Anh Hùng Siêu Thú, đối tượng mới Khỉ) | – | `src/khi-sieu-thu--day-leo-than-toc.png` | 188 |
| Chim cánh cụt băng giá (Anh Hùng Siêu Thú, đối tượng mới Chim cánh cụt) | – | `src/canh-cut-sieu-thu--bang-gia.png` | 142 |
| Cupcake công chúa (Vương Quốc Bánh Kẹo, thay biến thể Công Chúa của Cupcake) | – | `src/cupcake--cong-chua.png` | 71 |
| Kẹo mút hoàng tử (Vương Quốc Bánh Kẹo, thay biến thể Hoàng Tử của Kẹo mút) | – | `src/keo-mut--hoang-tu.png` | 48 |
| Bánh quế cuộn quân sư (Vương Quốc Bánh Kẹo, thay biến thể Nữ Hoàng Băng Giá của Kem ốc quế; tên tranh "Bánh Quế Cuộn Quân Sư") | – | `src/kem-oc-que--nu-hoang-bang-gia.png` | 36 |
| Bánh quy lính gác (Vương Quốc Bánh Kẹo, thay biến thể Lính Gác của Bánh quy) | – | `src/banh-quy--linh-gac.png` | 48 |
| Bánh kem hoàng hậu (Vương Quốc Bánh Kẹo, thay biến thể Hoàng Hậu của Bánh kem) | – | `src/banh-kem--hoang-hau.png` | 44 |
| Hiệp sĩ kẹo dẻo (Vương Quốc Bánh Kẹo, thay biến thể Hiệp Sĩ của Kẹo mút; tên tranh "Hiệp Sĩ Kẹo Dẻo") | – | `src/keo-mut--hiep-si.png` | 76 |
| Cung nữ macaron (Vương Quốc Bánh Kẹo, đối tượng mới Macaron) | – | `src/macaron--cung-nu.png` | 82 |
| Đầu bếp bánh gừng (Vương Quốc Bánh Kẹo, đối tượng mới Bánh gừng) | – | `src/banh-gung--dau-bep.png` | 79 |
| Tể tướng socola (Vương Quốc Bánh Kẹo, đối tượng mới Socola) | – | `src/socola--te-tuong.png` | 102 |

## Tranh theo độ tuổi (không phải thẻ)

Chủ đề cho bé **3–5 tuổi** dùng tranh vẽ tay, khai báo trong `ART_THEMES` (`generator/themes.mjs`):
chủ đề (`age`: `'3-5'`) → đối tượng → từng tranh (`file` trong thư mục này). Cách tạo file `.json` giống thẻ ở trên.
Các chủ đề kết hợp sáng tạo do bộ tạo tranh vẽ thuộc nhóm **6–8 tuổi**; nhóm **9 tuổi trở lên** mới có chủ đề Chiến Binh Biến Hình (4 tranh).

| Chủ đề | Đối tượng | Tranh | Vùng tô |
|---|---|---|---|
| Động Vật (3–5 tuổi) | Chó con | Bên nhà cún (mới, đang hiện) · Ngồi ngoan · Vẫy đuôi · Chơi bóng · Ăn thức ăn · Nằm nghỉ | 16 · 15 · 23 · 38 · 14 |
| Động Vật (3–5 tuổi) | Mèo con | Mèo con (mới, đang hiện; mèo cam, có chuông cổ) · Ngồi xinh · Chơi cuộn len · Uống sữa · Rửa mặt · Nằm ngủ | 19 · 45 · 23 · 19 · 17 |
| Động Vật (3–5 tuổi) | Chim con | Chim con (mới, đang hiện) | 32 |
| Động Vật (3–5 tuổi) | Bướm | Bướm (mới, đang hiện) | 37 |
| Trái Cây (3–5 tuổi) | Táo | Táo (mới, đang hiện) | 53 |
| Trái Cây (3–5 tuổi) | Chuối | Chuối (mới, đang hiện) | 12 |
| Trái Cây (3–5 tuổi) | Cam | Cam (mới, đang hiện) | 18 |
| Trái Cây (3–5 tuổi) | Xoài | Xoài (mới, đang hiện) | 51 |
| Trái Cây (3–5 tuổi) | Dưa hấu | Dưa hấu (mới, đang hiện) | 32 |
| Trái Cây (3–5 tuổi) | Nho | Nho (mới, đang hiện) | 78 |
| Trái Cây (3–5 tuổi) | Dâu tây | Dâu tây (mới, đang hiện) | 52 |
| Trái Cây (3–5 tuổi) | Đu đủ | Đu đủ (mới, đang hiện) | 46 |
| Trái Cây (3–5 tuổi) | Dừa | Dừa (mới, đang hiện) | 21 |
| Trái Cây (3–5 tuổi) | Dứa | Dứa (mới, đang hiện) | 52 |
| Xe Cộ (3–5 tuổi) | Ô tô | Ô tô (mới, đang hiện) | 47 |
| Xe Cộ (3–5 tuổi) | Xe buýt | Xe buýt (mới, đang hiện) | 55 |
| Xe Cộ (3–5 tuổi) | Xe tải | Xe tải (mới, đang hiện) | 56 |
| Xe Cộ (3–5 tuổi) | Máy bay | Máy bay (mới, đang hiện) | 35 |
| Xe Cộ (3–5 tuổi) | Xe lửa | Xe lửa (mới, đang hiện) | 86 |
| Xe Cộ (3–5 tuổi) | Xe cảnh sát | Xe cảnh sát (mới, đang hiện) | 47 |
| Xe Cộ (3–5 tuổi) | Xe đạp | Xe đạp (mới, đang hiện) | 63 |
| Xe Cộ (3–5 tuổi) | Xe cứu thương | Xe cứu thương (mới, đang hiện) | 52 |
| Xe Cộ (3–5 tuổi) | Máy kéo | Máy kéo (mới, đang hiện) | 48 |
| Xe Cộ (3–5 tuổi) | Xe máy | Xe máy (mới, đang hiện) | 57 |
| Đồ Dùng Học Tập (3–5 tuổi) | Cặp | Cặp (mới, đang hiện) | 40 |
| Đồ Dùng Học Tập (3–5 tuổi) | Bút chì | Bút chì (mới, đang hiện) | 25 |
| Đồ Dùng Học Tập (3–5 tuổi) | Hộp bút | Hộp bút (mới, đang hiện) | 30 |
| Đồ Dùng Học Tập (3–5 tuổi) | Quyển sách | Quyển sách (mới, đang hiện) | 20 |
| Đồ Dùng Học Tập (3–5 tuổi) | Thước | Thước (mới, đang hiện) | 28 |
| Đồ Dùng Học Tập (3–5 tuổi) | Bút màu | Bút màu (mới, đang hiện) | 49 |
| Đồ Dùng Học Tập (3–5 tuổi) | Bảng | Bảng (mới, đang hiện) | 12 |
| Đồ Dùng Học Tập (3–5 tuổi) | Kéo thủ công | Kéo thủ công (mới, đang hiện) | 17 |
| Đồ Dùng Học Tập (3–5 tuổi) | Compa | Compa (mới, đang hiện) | 31 |
| Đồ Dùng Học Tập (3–5 tuổi) | Keo dán giấy | Keo dán giấy (mới, đang hiện) | 28 |
| Đồ Chơi (3–5 tuổi) | Gấu bông | Gấu bông (mới, đang hiện) | 32 |
| Đồ Chơi (3–5 tuổi) | Búp bê | Búp bê (mới, đang hiện) | 77 |
| Đồ Chơi (3–5 tuổi) | Ngựa gỗ bập bênh | Ngựa gỗ bập bênh (mới, đang hiện) | 53 |
| Đồ Chơi (3–5 tuổi) | Bộ xếp hình | Bộ xếp hình (mới, đang hiện) | 42 |
| Đồ Chơi (3–5 tuổi) | Chiếc diều | Chiếc diều (mới, đang hiện) | 61 |
| Đồ Chơi (3–5 tuổi) | Trống đồ chơi | Trống đồ chơi (mới, đang hiện) | 41 |
| Đồ Chơi (3–5 tuổi) | Robot đồ chơi | Robot đồ chơi (mới, đang hiện) | 86 |
| Đồ Chơi (3–5 tuổi) | Bộ bowling mini | Bộ bowling mini (mới, đang hiện) | 18 |
| Đồ Chơi (3–5 tuổi) | Xe xúc đồ chơi | Xe xúc đồ chơi (mới, đang hiện) | 44 |
| Đồ Chơi (3–5 tuổi) | Máy bay đồ chơi | Máy bay đồ chơi (mới, đang hiện) | 40 |
| Đồ Ăn (3–5 tuổi) | Gà rán | Gà rán (mới, đang hiện) | 42 |
| Đồ Ăn (3–5 tuổi) | Pizza | Pizza (mới, đang hiện) | 55 |
| Đồ Ăn (3–5 tuổi) | Hamburger | Hamburger (mới, đang hiện) | 42 |
| Đồ Ăn (3–5 tuổi) | Kem ốc quế | Kem ốc quế (mới, đang hiện; nét đã làm mảnh về ~10px) | 31 |
| Đồ Ăn (3–5 tuổi) | Kẹo mút | Kẹo mút (mới, đang hiện) | 17 |
| Đồ Ăn (3–5 tuổi) | Bắp rang bơ | Bắp rang bơ (mới, đang hiện) | 28 |
| Đồ Ăn (3–5 tuổi) | Mì Ý | Mì Ý (mới, đang hiện) | 34 |
| Đồ Ăn (3–5 tuổi) | Bánh pudding | Bánh pudding (mới, đang hiện) | 11 |
| Đồ Ăn (3–5 tuổi) | Bánh cupcake dâu tây | Bánh cupcake dâu tây (mới, đang hiện) | 53 |
| Đồ Ăn (3–5 tuổi) | Bánh kem ba tầng | Bánh kem ba tầng (mới, đang hiện) | 56 |
| Khu Vui Chơi (3–5 tuổi) | Cầu trượt | Cầu trượt (mới, đang hiện; màu lấy theo ảnh mẫu chủ web gửi) | 49 |
| Khu Vui Chơi (3–5 tuổi) | Xích đu | Xích đu (mới, đang hiện; màu theo ảnh mẫu) | 49 |
| Khu Vui Chơi (3–5 tuổi) | Nhà banh | Nhà banh (mới, đang hiện; màu theo ảnh mẫu, 10 lỗ sáng trên banh tô trắng) | 64 |
| Khu Vui Chơi (3–5 tuổi) | Bập bênh | Bập bênh (mới, đang hiện; màu theo ảnh mẫu) | 24 |
| Khu Vui Chơi (3–5 tuổi) | Hồ bơi phao | Hồ bơi phao (mới, đang hiện; màu theo ảnh mẫu) | 28 |
| Khu Vui Chơi (3–5 tuổi) | Máy gắp thú bông | Máy gắp thú bông (mới, đang hiện; màu theo ảnh mẫu; thêm đường nền ngang 8px bằng `draw`) | 86 |
| Khu Vui Chơi (3–5 tuổi) | Đường hầm cầu vồng | Đường hầm cầu vồng (mới, đang hiện; màu theo ảnh mẫu) | 19 |
| Khu Vui Chơi (3–5 tuổi) | Xe điện đụng | Xe điện đụng (mới, đang hiện; màu theo ảnh mẫu) | 37 |
| Khu Vui Chơi (3–5 tuổi) | Vòng đu quay | Vòng đu quay (mới, đang hiện; màu theo ảnh mẫu) | 47 |
| Khu Vui Chơi (3–5 tuổi) | Ném vòng trúng đích | Ném vòng trúng đích (mới, đang hiện; màu theo ảnh mẫu) | 35 |
| Du Hành Vũ Trụ (3–5 tuổi) | Tên lửa | Tên lửa (mới, đang hiện; màu theo ảnh mẫu) | 20 |
| Du Hành Vũ Trụ (3–5 tuổi) | Đĩa bay | Đĩa bay (mới, đang hiện; màu theo ảnh mẫu) | 19 |
| Du Hành Vũ Trụ (3–5 tuổi) | Phi hành gia | Phi hành gia (mới, đang hiện; màu theo ảnh mẫu) | 50 |
| Du Hành Vũ Trụ (3–5 tuổi) | Vệ tinh | Vệ tinh (mới, đang hiện; màu theo ảnh mẫu) | 33 |
| Du Hành Vũ Trụ (3–5 tuổi) | Mặt trời | Mặt trời (mới, đang hiện; màu theo ảnh mẫu) | 18 |
| Du Hành Vũ Trụ (3–5 tuổi) | Sao Thổ | Sao Thổ (mới, đang hiện; màu theo ảnh mẫu) | 14 |
| Du Hành Vũ Trụ (3–5 tuổi) | Mặt trăng | Mặt trăng (mới, đang hiện; màu theo ảnh mẫu) | 13 |
| Du Hành Vũ Trụ (3–5 tuổi) | Trái đất | Trái đất (mới, đang hiện; màu theo ảnh mẫu) | 11 |
| Du Hành Vũ Trụ (3–5 tuổi) | Sao Hỏa | Sao Hỏa (mới, đang hiện; màu theo ảnh mẫu) | 13 |
| Du Hành Vũ Trụ (3–5 tuổi) | Tàu vũ trụ | Tàu vũ trụ (mới, đang hiện; màu theo ảnh mẫu) | 28 |
| Các Loài Hoa (3–5 tuổi) | Hoa cúc | Hoa cúc (mới, đang hiện; màu theo ảnh mẫu) | 30 |
| Các Loài Hoa (3–5 tuổi) | Hoa hướng dương | Hoa hướng dương (mới, đang hiện; màu theo ảnh mẫu) | 32 |
| Các Loài Hoa (3–5 tuổi) | Hoa tulip | Hoa tulip (mới, đang hiện; màu theo ảnh mẫu) | 22 |
| Các Loài Hoa (3–5 tuổi) | Hoa hồng | Hoa hồng (mới, đang hiện; màu theo ảnh mẫu) | 23 |
| Các Loài Hoa (3–5 tuổi) | Hoa sứ | Hoa sứ (mới, đang hiện; màu theo ảnh mẫu) | 24 |
| Các Loài Hoa (3–5 tuổi) | Hoa lưu ly | Hoa lưu ly (mới, đang hiện; màu theo ảnh mẫu) | 21 |
| Các Loài Hoa (3–5 tuổi) | Hoa păng-xê | Hoa păng-xê (mới, đang hiện; màu theo ảnh mẫu) | 29 |
| Các Loài Hoa (3–5 tuổi) | Hoa loa kèn | Hoa loa kèn (mới, đang hiện; màu theo ảnh mẫu) | 24 |
| Các Loài Hoa (3–5 tuổi) | Hoa mai | Hoa mai (mới, đang hiện; màu theo ảnh mẫu; thêm 1 nét dày 10,5px nối lá trái với thân) | 27 |
| Các Loài Hoa (3–5 tuổi) | Hoa dâm bụt | Hoa dâm bụt (mới, đang hiện; màu theo ảnh mẫu) | 23 |
| Chiến Binh Biến Hình (9 tuổi trở lên) | Chiến Binh Siêu Tốc | Chiến Binh Siêu Tốc (mới, đang hiện; màu theo ảnh mẫu) | 270 |
| Chiến Binh Biến Hình (9 tuổi trở lên) | Thủ Lĩnh Thép | Thủ Lĩnh Thép (mới, đang hiện; màu theo ảnh mẫu) | 276 |
| Chiến Binh Biến Hình (9 tuổi trở lên) | Vệ Binh Công Lý | Vệ Binh Công Lý (mới, đang hiện; màu theo ảnh mẫu; mỗi ô nhỏ tô riêng, 2 tay nắm cửa xe trắng) | 391 |
| Chiến Binh Biến Hình (9 tuổi trở lên) | Chiến Binh Cứu Hỏa | Chiến Binh Cứu Hỏa (mới, đang hiện; màu theo ảnh mẫu; thêm 2 nét: đóng nét trái chữ Λ ở giàn thang, nối cạnh cần gương; dùng clip_to_ink + paint cho các dải hẹp) | 438 |
| Chiến Binh Biến Hình (9 tuổi trở lên) | Chiến Binh Địa Hình | Chiến Binh Địa Hình (mới, đang hiện; màu theo ảnh mẫu; clip_to_ink) | 263 |
| Động Vật (3–5 tuổi) | Cá vàng | Cá vàng (mới, đang hiện) | 44 |
| Động Vật (3–5 tuổi) | Bò sữa | Bò sữa (mới, đang hiện; đốm tô theo số vùng chủ web chỉ) | 59 |
| Động Vật (3–5 tuổi) | Heo con | Heo con (mới, đang hiện) | 64 |
| Động Vật (3–5 tuổi) | Vịt con | Vịt con (mới, đang hiện) | 30 |
| Động Vật (3–5 tuổi) | Gà con | Gà con (mới, đang hiện) | 61 |
| Động Vật (3–5 tuổi) | Thỏ con | Thỏ con (mới, đang hiện) · Ngồi ngoan · Ăn cà rốt · Nhảy vui · Ngửi hoa · Nằm nghỉ | 25 · 26 · 29 · 26 · 26 |
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

Chủ đề Khu Vui Chơi (3–5 tuổi) có tranh "Cầu trượt", "Xích đu", "Nhà banh", "Bập bênh", "Hồ bơi phao", "Máy gắp thú bông", "Đường hầm cầu vồng", "Xe điện đụng", "Vòng đu quay" và "Ném vòng trúng đích". Chủ đề Đồ Ăn (3–5 tuổi) có tranh "Gà rán", "Pizza", "Hamburger", "Kem ốc quế", "Kẹo mút", "Bắp rang bơ", "Mì Ý", "Bánh pudding", "Bánh cupcake dâu tây" và "Bánh kem ba tầng" (thứ tự hiển thị: Cupcake, Pudding, Bánh kem ba tầng, Kem ốc quế, Kẹo mút, Bắp rang bơ, Mì Ý, Gà rán, Pizza, Hamburger). Chủ đề Đồ Chơi (3–5 tuổi) có tranh "Gấu bông", "Búp bê", "Ngựa gỗ bập bênh", "Bộ xếp hình", "Chiếc diều", "Trống đồ chơi", "Robot đồ chơi" và "Bộ bowling mini", "Xe xúc đồ chơi" và "Máy bay đồ chơi". Chủ đề Đồ Dùng Học Tập (3–5 tuổi) có tranh "Cặp", "Bút chì", "Hộp bút", "Quyển sách", "Thước", "Bút màu", "Bảng", "Kéo thủ công", "Compa" và "Keo dán giấy". Chủ đề Xe Cộ (3–5 tuổi) có tranh "Ô tô", "Xe buýt", "Xe tải", "Máy bay", "Xe lửa", "Xe cảnh sát", "Xe đạp", "Xe cứu thương", "Máy kéo" và "Xe máy". Chủ đề Trái Cây (3–5 tuổi) có tranh "Táo", "Chuối", "Cam", "Xoài", "Dưa hấu", "Nho", "Dâu tây", "Đu đủ", "Dừa" và "Dứa". Các tranh Động Vật cũ (15 tranh) đã ẩn bằng `hidden: true` trong `ART_THEMES`, chỉ còn tranh mới "Chó con bên nhà cún", "Thỏ con", "Gà con", "Vịt con", "Heo con", "Bò sữa", "Cá vàng", "Chim con", "Mèo con" và "Bướm" hiện; chờ chủ web gửi tranh mới.

Mèo con, Thỏ con chỉ có ảnh màu: nét được tách từ chính ảnh màu (điểm ảnh rất tối), viền màu (giọt nước, dấu chân, mặt nước) được vẽ thêm theo mép mảng màu.
| Xe Buýt Chở Phi Hành Gia (Đội Xe Vũ Trụ) | – | `src/xe-buyt-vu-tru--cho-phi-hanh-gia.png` | 153 |
| Xe Cứu Hỏa Dập Lửa Thiên Hà (Đội Xe Vũ Trụ) | – | `src/xe-cuu-hoa--dap-lua-thien-thach.png` | ghi trong file |
| Tàu Hỏa Đường Ray Ngân Hà (Đội Xe Vũ Trụ) | – | `src/tau-hoa-vu-tru--duong-ray-ngan-ha.png` | ghi trong file |
| Máy Bay Vòng Quanh Hành Tinh (Đội Xe Vũ Trụ) | – | `src/may-bay-vu-tru--bay-qua-vong-hanh-tinh.png` | ghi trong file |
| Trực Thăng Thả Dù Tiếp Tế (Đội Xe Vũ Trụ) | – | `src/truc-thang--tha-du-tiep-te.png` | ghi trong file |
| Xe Tải Giao Hàng Liên Hành Tinh (Đội Xe Vũ Trụ, đối tượng mới Xe tải) | – | `src/xe-tai-vu-tru--giao-hang-lien-hanh-tinh.png` | ghi trong file |
| Xe Xúc Đào Kho Báu Thiên Thạch (Đội Xe Vũ Trụ, đối tượng mới Xe xúc) | – | `src/xe-xuc-vu-tru--dao-kho-bau-thien-thach.png` | ghi trong file |
| Xe Túc Túc Đi Dạo Thiên Hà (Đội Xe Vũ Trụ, đối tượng mới Xe túc túc) | – | `src/xe-tuk-tuk-vu-tru--di-dao-thien-ha.png` | ghi trong file |
| Xe Cảnh Sát Tuần Tra Ngân Hà (Đội Xe Vũ Trụ, đối tượng mới Xe cảnh sát) | – | `src/xe-canh-sat-vu-tru--tuan-tra-ngan-ha.png` | ghi trong file |
| Khủng Long Cổ Dài Lau Kính Toàn Nhà (Thị Trấn Khủng Long) | – | `src/khung-long-co-dai--tho-lau-kinh.png` | ghi trong file |
| Khủng Long Ba Sừng Bác Sĩ (Thị Trấn Khủng Long) | – | `src/khung-long-ba-sung--bac-si.png` | ghi trong file |
| Khủng Long Lưng Gai Nông Dân (Thị Trấn Khủng Long) | – | `src/khung-long-gai-lung--nong-dan.png` | ghi trong file |
| Dực Long Đưa Thư (Thị Trấn Khủng Long) | – | `src/duc-long--dua-thu.png` | ghi trong file |
| Khủng Long Bọc Giáp Thợ Xây (Thị Trấn Khủng Long, đối tượng mới Khủng long bọc giáp) | – | `src/khung-long-boc-giap--tho-xay.png` | ghi trong file |
| Khủng Long Mỏ Vịt Thợ Làm Vườn (Thị Trấn Khủng Long) | – | `src/khung-long-mao-ken--tho-lam-vuon.png` | ghi trong file |
| Khủng Long Đầu Vòm Giáo Viên (Thị Trấn Khủng Long, đối tượng mới Khủng long đầu vòm) | – | `src/khung-long-dau-vom--giao-vien.png` | ghi trong file |
| Bò Sát Biển Cổ Dài Ngư Dân (Thị Trấn Khủng Long, đối tượng mới Bò sát biển cổ dài; ảnh gốc chữ nhật được đệm trời/nước cho vuông) | – | `src/bo-sat-bien--ngu-dan.png` | ghi trong file |
| Khủng Long Hai Mào Họa Sĩ (Thị Trấn Khủng Long, đối tượng mới Khủng long hai mào) | – | `src/khung-long-hai-mao--hoa-si.png` | ghi trong file |
| Chuối Vàng Chơi Bóng Rổ (Đại Hội Thể Thao Trái Cây) | – | `src/chuoi-the-thao--bong-ro.png` | ghi trong file |
| Dâu Tây Chơi Nhảy Dây (Đại Hội Thể Thao Trái Cây) | – | `src/dau-tay-the-thao--nhay-day.png` | ghi trong file |
| Dưa Hấu Nâng Tạ (Đại Hội Thể Thao Trái Cây) | – | `src/dua-hau-the-thao--nang-ta.png` | ghi trong file |
| Dứa Vàng Lướt Sóng (Đại Hội Thể Thao Trái Cây) | – | `src/dua--luot-song.png` | ghi trong file |
| Cam Ngọt Chạy Vượt Rào (Đại Hội Thể Thao Trái Cây) | – | `src/cam-the-thao--vuot-rao.png` | ghi trong file |
| Xoài Vàng Chơi Tennis (Đại Hội Thể Thao Trái Cây) | – | `src/xoai-the-thao--tennis.png` | ghi trong file |
| Lê Xanh Tập Bắn Cung (Đại Hội Thể Thao Trái Cây) | – | `src/le-the-thao--ban-cung.png` | ghi trong file |
| Dừa Nâu Tập Quyền Anh (Đại Hội Thể Thao Trái Cây) | – | `src/dua-nau--quyen-anh.png` | ghi trong file |
| Ngô Tập Võ Karate (Đại Hội Thể Thao Trái Cây) | – | `src/ngo--karate.png` | ghi trong file |
| Cây Dừa Đảo Ngọc Thiên Đường (Khu Rừng Ánh Sáng) | – | `src/cay-dua--dao-ngoc-thien-duong.png` | ghi trong file |
| Xương Rồng Ốc Đảo Ánh Sao (Khu Rừng Ánh Sáng) | – | `src/cay-xuong-rong--oc-dao-anh-sao.png` | ghi trong file |
| Rừng Tre Ngọc Bích (Khu Rừng Ánh Sáng) | – | `src/khom-tre--rung-ngoc-bich.png` | ghi trong file |
| Cây Thông Ngôi Sao Tuyết (Khu Rừng Ánh Sáng) | – | `src/cay-thong--ngoi-sao-tuyet.png` | ghi trong file |
| Cây Đa Cổng Trời (Khu Rừng Ánh Sáng) | – | `src/cay-co-thu--cong-troi.png` | ghi trong file |
| Cây Liễu Rèm Trăng (Khu Rừng Ánh Sáng) | – | `src/cay-lieu--ren-trang.png` | ghi trong file |
| Cây Anh Đào Mưa Sao Hồng (Khu Rừng Ánh Sáng) | – | `src/cay-anh-dao--mua-sao-hong.png` | ghi trong file |
| Cây Phong Lá Lửa Thiên Thu (Khu Rừng Ánh Sáng) | – | `src/cay-phong--la-lua-thien-thu.png` | ghi trong file |
| Cây Bao Báp Giữa Sa Mạc Nắng Vàng (Khu Rừng Ánh Sáng) | – | `src/cay-bao-bap--sa-mac-nang-vang.png` | ghi trong file |
| Thư Viện Sách Mở Thần Kỳ (Xứ Sở Học Cụ) | – | `src/thu-vien--sach-mo-than-ky.png` | ghi trong file |
| Cầu Vồng Thước Kẻ Ánh Dương (Xứ Sở Học Cụ) | – | `src/cau-da--cau-vong-thuoc-ke.png` | ghi trong file |
| Tháp Đồng Hồ Gọt Bút Thời Gian (Xứ Sở Học Cụ) | – | `src/thap-co--dong-ho-got-but.png` | ghi trong file |
| Nhà Ga Hộp Bút Phiêu Lưu (Xứ Sở Học Cụ) | – | `src/nha-ga--hop-but-phieu-luu.png` | ghi trong file |
| Đài Thiên Văn Compa Ngân Hà (Xứ Sở Học Cụ) | – | `src/dai-thien-van--compa-ngan-ha.png` | ghi trong file |
| Cổng Công Viên Kéo Thần Kỳ (Xứ Sở Học Cụ) | – | `src/cong-vien--keo-than-ky.png` | ghi trong file |
| Bảo Tàng Bảng Màu Sáng Tạo (Xứ Sở Học Cụ) | – | `src/bao-tang--bang-mau.png` | ghi trong file |
| Chung Cư Sổ Tay Xoắn Ốc (Xứ Sở Học Cụ) | – | `src/chung-cu--so-tay-xoan-oc.png` | ghi trong file |
| Hải Đăng Hồ Dán Ánh Sao (Xứ Sở Học Cụ) | – | `src/hai-dang--ho-dan-anh-sao.png` | ghi trong file |
| Nhà Gỗ Tam Giác Mây Trắng (Thành Phố Nhà Biết Bay) | – | `src/nha-tam-giac--may-trang.png` | ghi trong file |
| Nhà Cối Xay Gió Chong Chóng (Thành Phố Nhà Biết Bay) | – | `src/coi-xay-chong-chong--chong-chong.png` | ghi trong file |
| Biệt Thự Trực Thăng (Thành Phố Nhà Biết Bay) | – | `src/biet-thu--truc-thang.png` | ghi trong file |
| Nhà Sàn Cánh Chim (Thành Phố Nhà Biết Bay) | – | `src/nha-san-canh-chim--canh-chim.png` | ghi trong file |
| Nhà Ống Tên Lửa (Thành Phố Nhà Biết Bay) | – | `src/nha-ong-ten-lua--ten-lua.png` | ghi trong file |
| Nhà Tuyết Dù Cầu Vồng (Thành Phố Nhà Biết Bay) | – | `src/nha-tuyet-du--cau-vong.png` | ghi trong file |
| Lâu Đài Cánh Rồng (Thành Phố Nhà Biết Bay) | – | `src/lau-dai-canh-rong--canh-rong.png` | ghi trong file |
| Nhà Kính Drone Bay (Thành Phố Nhà Biết Bay) | – | `src/nha-kinh-drone--bay.png` | ghi trong file |
| Thuyền Buồm Cánh Bướm Biển (Hải Trình Kỳ Diệu) | – | `src/thuyen-buom--canh-buom.png` | ghi trong file |
| Tàu Cướp Biển Ngọc Trai (Hải Trình Kỳ Diệu) | – | `src/tau-cuop-bien--ngoc-trai.png` | ghi trong file |
| Thuyền Gondola Vỏ Sò (Hải Trình Kỳ Diệu) | – | `src/thuyen-gondola--vo-so.png` | ghi trong file |
| Tàu Hơi Nước San Hô (Hải Trình Kỳ Diệu) | – | `src/tau-hoi-nuoc--san-ho.png` | ghi trong file |
| Thuyền Đánh Cá Sao Biển (Hải Trình Kỳ Diệu) | – | `src/thuyen-danh-ca--sao-bien.png` | ghi trong file |
| Ca Nô Sóng Thần Kì (Hải Trình Kỳ Diệu) | – | `src/ca-no--song-than.png` | ghi trong file |
| Thuyền Hai Thân Sứa Biển (Hải Trình Kỳ Diệu) | – | `src/thuyen-hai-than--sua-bien.png` | ghi trong file |
| Bè Gỗ Rùa Biển Thần Kì (Hải Trình Kỳ Diệu) | – | `src/be-go--rua-bien.png` | ghi trong file |
| Thuyền Kayak Cá Heo (Hải Trình Kỳ Diệu) | – | `src/thuyen-kayak--ca-heo.png` | ghi trong file |
| Nhà Mái Vòm Bóng Bay (Thành Phố Nhà Biết Bay) | – | `src/nha-mai-vom--bong-bay.png` | ghi trong file |
| Ngôi nhà nhỏ (Ngôi Nhà Của Bé 3–5, mới; màu theo ảnh mẫu) | – | `src/ngoi-nha-nho--ngoi-nha-nho.png` | 18 |
| Chiếc giường (Ngôi Nhà Của Bé 3–5, mới; màu theo ảnh mẫu) | – | `src/chiec-giuong--chiec-giuong.png` | 21 |
| Ghế sofa, Tủ quần áo, Đèn bàn, Quạt máy, Tivi, Tủ lạnh, Máy giặt, Bàn ăn (Ngôi Nhà Của Bé 3–5, mới; màu theo ảnh mẫu) | – | `src/<đối-tượng>--<đối-tượng>.png` | 17–35 |
