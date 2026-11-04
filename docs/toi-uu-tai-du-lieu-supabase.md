# Giảm thời gian tải sau khi chuyển sang Supabase

Ngày kiểm tra: 04/11/2026. Phạm vi là truy vấn database, số request và dung
lượng truyền. Không thay đổi hình vẽ, hiệu ứng, thời lượng animation, luật
gói dịch vụ, số lượt, cách chấm điểm hay tài khoản đang dùng.

## Nguyên nhân và thay đổi

Các API danh sách trước đây đọc từng bản ghi rồi gọi thêm SQL cho từng tranh,
bạn bè, giao dịch hoặc cuốn truyện. Sau khi database chuyển ra ngoài backend,
thời gian chờ mỗi lượt mạng cộng dồn. Có truy vấn ảnh xem trước đọc cả SVG và
manifest lớn, dù JSON trả về chỉ cần tên tranh và URL WebP.

- History và Collection đọc các bản tô trong một lần, gom manifest theo tranh,
  rồi gom điều kiện triển lãm và mốc bắt đầu tô. Các bản tô và chữ ký vẫn giữ
  nguyên; danh sách không gửi dữ liệu biên tập nặng về trình duyệt.
- Hồ sơ, trạng thái gói và thông báo tải đồng thời. Trạng thái VIP công khai
  cho danh sách bạn bè/giao dịch/bảng xếp hạng được đọc theo nhóm. Quyền vẫn
  truy vấn mới trong mỗi request; không lưu cache kết quả quyền.
- Chủ đề dùng danh sách đã đọc để xác định thứ tự mở Free; một truy vấn quyền
  kiểm tra cùng quy tắc năm chủ đề đầu mỗi nhóm tuổi. Danh sách tranh xem trước
  đọc trực tiếp metadata, vẫn giữ đường dự phòng SVG cho tranh tùy chỉnh cũ.
- Tab tranh thẻ nhận metadata ảnh cùng `/gacha/cards?preview=1`, thay cho một
  request riêng cho từng ảnh. Metadata chỉ có một bản cho mỗi tranh; mọi bản
  thẻ sở hữu vẫn có ID riêng. API mặc định và đường dự phòng frontend cũ được
  giữ. Bộ sưu tập dùng Map để gom tranh trùng trong một lượt duyệt.
- Bóc nhiều thẻ gom INSERT và đọc tranh trong transaction cũ. Kiểm tra đủ
  điểm, ID thẻ hợp lệ, các bản thẻ trùng và khóa giao dịch PostgreSQL vẫn giữ.
- Triển lãm gom cảm xúc/ảnh theo trang. Wall phân trang ngay trong SQL, thay
  cho đọc toàn bộ dữ liệu tô rồi cắt mảng. Tranh đồng giải xếp thêm theo ID để
  không lặp/bỏ sót khi đổi trang; tranh vòng cũ vẫn dùng số cảm xúc đã chốt.
- Cây thư viện admin đọc ba danh sách rồi ghép trong bộ nhớ, giữ cả nhóm trống.
- HTTP thương lượng gzip/Brotli và nén dữ liệu lớn ở mức vừa phải. Đây là nén
  không mất dữ liệu, không thay thế hay giảm chất lượng ảnh. Header quyền riêng
  tư `private, no-store` và `Vary: Authorization` được giữ.
- Migration SQLite 021 / PostgreSQL 004 chỉ thêm index cho lịch sử sử dụng,
  giao dịch và lời mời kết bạn. Không xóa, dựng lại hoặc reset bảng dữ liệu.
  Startup gom đồng bộ cờ chủ đề thành tối đa hai SQL thay cho từng chủ đề;
  upsert tranh chỉ trả ID thay cho gửi lại toàn bộ SVG/manifest đã ghi.

## Phép đo

Đo với PostgreSQL chạy bằng PGlite trong môi trường thử, dữ liệu giả: 232 tranh,
12 bản tô hoàn thành + 12 bản dở, 12 bạn bè, 12 giao dịch và 12 truyện. Thêm
60 ms chờ cho mỗi lượt query để quan sát chi phí database ở xa. Đây không phải
số đo trực tiếp trên Render/Supabase thật, cũng không phải cam kết thời gian
tải của mọi thiết bị/mạng. Backend trước sửa là commit `ecbd2e9`.

| API / dữ liệu thử | SQL trước → sau | Thời gian thử trước → sau |
| --- | ---: | ---: |
| Phiên đăng nhập | 7 → 4 | 446 → 133 ms |
| Danh sách tranh một chủ đề | 6 → 4 | 375 → 192 ms |
| History | 26 → 3 | 1.632 → 192 ms |
| Collection | 50 → 5 | 3.114 → 252 ms |
| Bạn bè | 26 → 3 | 1.605 → 189 ms |
| Giao dịch | 64 → 6 | 3.970 → 194 ms |
| Danh sách truyện | 26 → 2 | 1.604 → 129 ms |

Một preview thẻ vẫn cần ba query để kiểm tra tài khoản/quyền, nhưng số byte
database trả giảm từ 333.364 xuống 1.307. JSON của các API đo phía trên giữ
nguyên số byte sau giải nén. Kết quả tổng hợp nằm trong
[`metrics/loading-2026-11-04.json`](metrics/loading-2026-11-04.json).

Trình duyệt xác nhận tab có bảy tranh thẻ dùng một request danh sách thay cho
tám request. Với API cũ, đường dự phòng vẫn lấy được từng preview và mở màn tô.
Đo HTTP thật trong máy thử cho một tranh: 172.230 byte không nén, 116.229 byte
gzip, 114.858 byte Brotli; sau giải nén các byte nội dung giống hệt bản gốc.

Các endpoint nhỏ như Shop, Gacha info và hội trường triển lãm đang trống không
có N+1 nên số query trong phép đo cơ bản không giảm. Tường có dữ liệu được kiểm
tra riêng: một trang năm tranh chỉ đọc năm bản dữ liệu tô, kể cả khi có nhiều
tranh trưng bày và tranh đồng giải.

## Kiểm chứng

```sh
npm test
npm run test:postgres
node --test frontend/test/*.test.mjs
npm run build
node frontend/scripts/check-picture-previews.mjs
node frontend/scripts/check-seo.mjs
```

Kết quả bản chốt: 85/85 backend, 42/42 API trên PostgreSQL và 20/20 frontend;
build, kiểm tra preview và SEO đều thành công.

Kiểm thử bao gồm đăng ký/đăng nhập/quên mật khẩu, hạn mức Free, VIP hết hạn,
thanh toán trùng, lưu/mở tranh và chữ ký, dữ liệu PostgreSQL tồn tại sau khi
đóng/mở lại, riêng tư Supabase RLS, thẻ trùng/giao dịch, hai yêu cầu bóc thẻ
đồng thời, phân trang triển lãm và quyền admin. Kiểm tra byte nén cũng xác
nhận giải nén đúng nguyên nội dung cùng header riêng tư.

Kiểm tra Chromium trên desktop 1280 px, mobile 390 px và giả lập API cũ đi
qua chọn chủ đề/tranh, tô, lưu/hoàn thành/pháo giấy, quay lại chủ đề, history,
plans/profile, shop, truyện, chữ ký, collection, bạn bè và bóc thẻ. Các hiệu ứng
cầu vồng, tô cùng nhau, đấu trường, gacha, truyện, nhiệm vụ và rèm triển lãm
đều tải được tài nguyên, kết thúc overlay và trả lại cuộn trang. Có kiểm tra
màn tô VIP bị khóa lại khi hết hạn nhưng bản tô vẫn còn đọc được.

## Giới hạn của môi trường hosting

Render Free có thể ngủ khi không có truy cập. Lần truy cập sau đó phải chờ
khởi động lại dịch vụ; giảm SQL và dung lượng không loại bỏ thời gian đánh
thức do nhà cung cấp. Region của backend và database cũng ảnh hưởng độ trễ.
Bản sửa này không đổi dịch vụ, region, URI, mật khẩu, JWT hoặc cấu hình TLS.

Môi trường hiện tại không được phép kết nối domain web/API online qua proxy;
không có thông tin xác thực Render/Supabase để đọc thời gian triển khai hoặc
đo database thật. Vì vậy, xác nhận tốc độ sau triển khai cần thực hiện trên
website thật khi cả Cloudflare Pages và Render đã báo hoàn tất bản mới.
