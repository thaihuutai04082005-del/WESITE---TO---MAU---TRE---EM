# Giảm thời gian chọn tranh và mở màn tô

Ngày kiểm tra: 04/11/2026. Tiếp nối bản `400b2a4`; commit `d7db178` có cùng
cây mã nguồn với bản đó. Phản ánh cần xử lý là chờ khi vào/quay lại chủ đề,
trong cả Tô màu và Tô cùng nhau, và khi chọn Tô theo mẫu hoặc Sáng tạo.

## Nguyên nhân và cách sửa

- Danh sách chủ đề và tranh xem trước còn cần bốn lượt SQL cho một request
  đã đăng nhập. Gộp metadata, ảnh bìa và quyền hiện tại thành một query.
  JWT vẫn được kiểm chữ ký/hạn dùng mỗi request; query kiểm tra tài khoản
  còn tồn tại và gói còn hiệu lực. Request riêng tư/ghi dữ liệu vẫn dùng
  middleware đăng nhập đầy đủ. Quy tắc Free, thứ tự tranh, chủ đề rỗng, tranh
  ẩn và đường dự phòng SVG cho tranh cũ được giữ.
- Mở màn tô mới trước đây POST tạo bản tô, chờ xong rồi GET lại bản tô và
  hình vẽ. POST có tùy chọn `editor: true` trả đủ dữ liệu vừa tạo, dùng
  `INSERT ... RETURNING` và đọc trạng thái gói song song với INSERT. Tổng
  SQL của hai bước giảm từ 11 xuống 4 và bỏ một request nối tiếp.
- Frontend chỉ chuyển tiếp một lần phản hồi tạo tranh sang màn tô ngay sau
  đó. Dữ liệu này không lưu vào localStorage; ràng buộc token, ID bản tô,
  giới hạn 15 giây và mốc hết hạn VIP. Đăng xuất, tải lại, quay lại bản tô,
  đổi tài khoản hoặc phản hồi API cũ đều đọc API bình thường. Quyền khi lưu,
  tính lượt ở nét đầu và kiểm tra VIP trong màn tô vẫn hoạt động như trước.
- Mã màn chọn tranh/màn tô/phòng Together được tải trước trong bước chọn
  tương ứng, không mount sớm. Trang chủ vẫn giữ các màn nặng ở lazy import.
- Timeline trình duyệt cho thấy nhiều ảnh hiệu ứng chưa mở cùng tải với
  tranh cần xem. Hàng đợi tải nền nhường khi có API đang chạy và thêm 500 ms
  sau khi API xong để giao diện tải ảnh đang hiện. Tất cả ảnh nền vẫn được
  tải/giải mã sau đó, giới hạn hai ảnh đồng thời. Tài nguyên, JSX hiệu ứng,
  thời lượng animation và chất lượng ảnh không thay đổi.
- CORS preflight có `maxAge: 600`. Đây chỉ là thời gian dùng lại kết quả
  OPTIONS; dữ liệu và quyền mỗi request vẫn đọc mới, giữ `private, no-store`.

Bản này không thêm migration, không dọn database, không thay tài khoản,
mật khẩu, JWT, cấu hình Supabase/TLS, hình vẽ hoặc dữ liệu tô đã lưu.

## Phép đo có kiểm soát

Backend PostgreSQL qua PGlite, dữ liệu giả 232 tranh, thêm 300 ms chờ cho mỗi
query để mô phỏng database ở xa. Trình duyệt Chromium desktop 1280 × 900;
ca Tô màu dùng CPU chậm 4 lần, độ trễ mạng 60 ms, tải xuống 1.000.000 byte/s,
tải lên 500.000 byte/s. Mỗi ca dùng context mới; đo cùng thao tác ở hai bản.
Điểm kết thúc là ảnh xem trước đã giải mã hoặc SVG/ảnh nhúng trong màn tô đã
sẵn sàng và qua hai animation frame. Đo mở màn tô bắt đầu lúc bấm nút chế độ.

| Thao tác | Trước | Sau |
| --- | ---: | ---: |
| Chủ đề → bộ tranh đơn giản, ca Tô theo mẫu | 1.642 ms | 1.038 ms |
| Chủ đề → bộ tranh đơn giản, ca Sáng tạo | 1.673 ms | 1.019 ms |
| Chủ đề → bộ tranh lớn, ca Tô theo mẫu | 1.490 ms | 901 ms |
| Chủ đề → bộ tranh lớn, ca Sáng tạo | 1.441 ms | 949 ms |
| Tô theo mẫu → màn tô, tranh đơn giản | 4.009 ms | 1.585 ms |
| Sáng tạo → màn tô, tranh đơn giản | 4.000 ms | 1.456 ms |
| Tô theo mẫu → màn tô, tranh lớn nhất | 4.500 ms | 2.421 ms |
| Sáng tạo → màn tô, tranh lớn nhất | 4.210 ms | 1.953 ms |
| Together: chủ đề → bộ tranh | 963 ms | 367 ms |
| Together: bộ tranh → chủ đề | 1.347 ms | 875 ms |

Hai ca Together dùng cùng độ trễ database, không giảm CPU/băng thông của
trình duyệt; thời gian gồm cả thao tác tự động hóa. Vì vậy chỉ so trước/sau
trong từng ca, không so tuyệt đối với ca Tô màu. Tranh lớn nhất trong bộ thử
là `chien-binh-cuu-hoa--chien-binh-cuu-hoa`, SVG 892.164 byte.

Các số này là mẫu đo trong môi trường thử, không phải thời gian online,
trung vị nhiều lần hay cam kết cho mọi mạng/thiết bị. Kết quả tổng hợp có tại
[`metrics/loading-pictures-2026-11-04.json`](metrics/loading-pictures-2026-11-04.json).
Môi trường hiện tại không được phép truy cập domain web/API online qua proxy.
Render Free vẫn có thời gian đánh thức sau khi ngủ; bản sửa không đổi gói
hosting hoặc region.

## Kiểm chứng

```sh
npm test
npm run test:postgres
node --test frontend/test/*.test.mjs
npm run build
node frontend/scripts/check-picture-previews.mjs
node frontend/scripts/check-seo.mjs
```

Kết quả: 90/90 backend, 47/47 API PostgreSQL và 25/25 frontend. Bộ kiểm thử
bao gồm tài khoản, đăng nhập, quyền VIP vừa hết hạn, chủ đề bị khóa, tài khoản
đã xóa, token giả/sai kiểu, chuyển quyền sở hữu thẻ, lưu tranh, RLS và dữ liệu
PostgreSQL còn nguyên sau khởi động lại. Các API cũ vẫn dùng đường dự phòng.

Kiểm tra trình duyệt dùng database/tài khoản giả độc lập: desktop 1280 px,
mobile 390 px và API cũ; chọn chủ đề/tranh, tô, lưu/hoàn thành, history,
quay lại chủ đề, gói dịch vụ/hồ sơ, shop, truyện, chữ ký, bộ sưu tập và bạn bè.
Các hiệu ứng cầu vồng, Together, đấu trường, gacha, truyện, nhiệm vụ và rèm
triển lãm đều tải được tài nguyên, kết thúc và khôi phục cuộn trang; gacha
vẫn lật thẻ/pháo giấy. Không sửa các file tài nguyên hoặc CSS hiệu ứng.

Kiểm tra riêng cả Tô theo mẫu và Sáng tạo xác nhận chỉ có một POST lúc mở
tranh mới, không có GET lặp lại; tô và tự lưu được dữ liệu thật. Reload và
đi lại bằng lịch sử SPA đều gọi GET mới, trả lại đúng nét/màu đã lưu. Tab
tranh thẻ tải đủ bảy ảnh bằng một request ở API mới và vẫn mở được màn tô ở
API cũ; tài khoản khác không thấy bộ thẻ đó. Khi VIP hết hạn trong màn tô,
giao diện khóa lại và bản tô vẫn còn đọc được. Preview của đủ 232 tranh và
cả sáu trang SEO đều qua kiểm tra; production build thành công.
