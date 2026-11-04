# Hoàn thành tranh, ảnh trang chủ và Lịch sử

Ngày kiểm tra: 04/11/2026. Bản nền `5073435`. Phạm vi chỉ gồm màu nhãn gói,
thời gian mở bảng Hoàn thành, ảnh khi quay về trang chủ và tải Lịch sử.

Nhãn Gói Thường trước đây chuyển sang màu coral khi còn 0 lượt. Nhãn nay giữ
viền xanh, nền trắng và chữ xanh ở cả trạng thái hết lượt. Số lượt, liên kết
đến gói dịch vụ và giới hạn Free vẫn giữ nguyên.

## Hoàn thành tranh

Một lần hoàn thành trước đây gọi xét nhiệm vụ sau từng bộ đếm: chủ đề mới,
chế độ tô, lấp lánh, brush/sticker và tổng số tranh. Mỗi lượt xét lại đọc
tài khoản, thống kê và nhiệm vụ rồi mở transaction riêng. Phần lưu còn đọc
lại tranh, quyền và trạng thái gói nhiều lần nối tiếp.

Đường lưu mới giữ transaction và khóa PostgreSQL hiện tại cho toàn bộ thao
tác. Quyền sở hữu/VIP, khóa triển lãm, hạn mức ở nét đầu, chữ ký và bộ lọc dữ
liệu tô vẫn được kiểm tra. UPDATE trả bản ghi bằng RETURNING; tranh đã tính
lượt không gọi lại đường tính lượt, sau khi quyền sửa vừa được kiểm tra mới.

Riêng hoàn thành tranh đọc trạng thái nhiệm vụ một lần, tính các bước theo
đúng thứ tự cũ, giữ đúng mốc thống kê mỗi lần lên cấp, rồi ghi các thay đổi
theo nhóm. Nhiệm vụ, Ruby và thông báo được lưu cùng transaction với bản tô;
realtime chỉ phát sau COMMIT. Lỗi ghi sẽ rollback cả thao tác để có thể thử
lại; hai yêu cầu hoàn thành cùng bản tô chỉ ghi thưởng một lần. Các đường
ghi hoạt động khác tiếp tục dùng bộ xét nhiệm vụ cũ.

Frontend vẫn chờ lưu thành công rồi mới mở bảng Hoàn thành. Nút tạm khóa
trong lúc xử lý để tránh gửi lặp; tranh, khung, pháo giấy, tải/in và hiệu ứng
bay vào bộ sưu tập vẫn giữ nguyên. PNG thu nhỏ giữ nguyên kích thước/định dạng.

## Ảnh trang chủ và Lịch sử

- 16 ảnh nền/trang trí, bảy lớp gấu và sáu hình chế độ dùng bản sao có hash
  theo nội dung ở `/ui-images/`. URL đổi khi nội dung đổi, nên có thể dùng
  cache immutable. File gốc vẫn được giữ; kiểm thử so từng byte của bản sao
  với ảnh gốc, không nén lại hoặc thay đổi màu/chất lượng.
- Hàng đợi hiện có giữ các ảnh này sau khi giải mã, ưu tiên làm sẵn trang
  quay lại trong thời gian rảnh. Tải API đang chạy vẫn được ưu tiên; các
  hiệu ứng khác vẫn tải đầy đủ theo hàng đợi cũ. Bảy lớp linh vật hiển thị
  dùng giải mã đồng bộ và ưu tiên tải cao, tránh chỉ hiện vài bộ phận trong
  lúc trình duyệt còn giải mã các lớp khác. CSS chuyển động giữ nguyên.
- Lịch sử hỗ trợ `thumbnails=0&initialThumbnails=4`: bốn PNG đầu đi cùng danh
  sách, tránh thêm một lượt mạng cho lịch sử ít tranh. Ảnh phía dưới được
  lấy khi gần vùng nhìn thấy, tối đa bốn request ảnh đồng thời. Metadata
  không tải toàn bộ PNG; tranh đã hoàn thành cũng không cần đọc dữ liệu nét
  tô chỉ để tính phần trăm tranh dở.
- File thu nhỏ có endpoint riêng yêu cầu đăng nhập và kiểm tra chính chủ.
  PNG/JPEG được trả đúng byte cũ với `private, no-store`; cache immutable
  chỉ áp dụng cho ảnh giao diện công khai.
- Snapshot hiển thị có hạn 30 giây, chỉ dành cho tài khoản hiện tại. Mỗi lần
  mở Lịch sử vẫn lấy metadata mới, trong lúc đó ảnh cũ tiếp tục hiện. Blob
  dùng lại theo tài khoản/ID/mốc cập nhật; cache thu hồi ảnh không còn được
  sử dụng khi vượt 12 MiB hoặc 80 mục. Đăng xuất/đổi tài khoản xóa snapshot,
  thu hồi blob URL và loại phản hồi muộn. Không cache quyền, gói dịch vụ hay
  dữ liệu tô đầy đủ. API cũ tiếp tục dùng ảnh inline như trước.

Không có migration, xóa/reset database, thay JWT, mật khẩu, Supabase hoặc
TLS. Các trang/chức năng ngoài phạm vi không thay luật hoạt động.

## Kiểm chứng và phép đo

93/93 backend, 50/50 API PostgreSQL và 30/30 frontend đạt. Kiểm tra đối chiếu
hai chế độ qua cả 20 cấp xác nhận cùng thống kê, Ruby, nhiệm vụ, thông báo,
thứ tự sự kiện và mốc lên cấp với cách cũ. Có kiểm tra rollback, hai yêu cầu
hoàn thành lần đầu đồng thời, file thu nhỏ riêng tư và dữ liệu còn sau khi
khởi động lại. Build, preview của 232 tranh và cả sáu trang SEO đều đạt.

Đo API với PostgreSQL/PGlite và tài khoản giả, thêm 100 ms chờ mỗi query:

| Hoàn thành | Query trước → sau | Thời gian trước → sau |
| --- | ---: | ---: |
| Theo mẫu, có thưởng nhiệm vụ đầu | 49 → 18 | 5.000 → 1.506 ms |
| Sáng tạo, chủ đề đã thử | 33 → 15 | 3.364 → 1.187 ms |
| Sáng tạo có lấp lánh/brush/sticker | 49 → 15 | 4.988 → 1.130 ms |

Chromium desktop 1280 × 900, CPU chậm 4 lần, mạng 60 ms/1.000.000 byte mỗi
giây và cùng độ trễ query: từ bấm Hoàn thành đến bảng đã vẽ, tranh đơn giản
5.220 → 2.340 ms; tranh lớn nhất 7.045 → 3.601 ms. Đây là mẫu đo môi trường
thử, không phải đo website online hoặc cam kết thời gian của mọi thiết bị.
Chi phí dựng PNG/SVG vẫn còn vì chất lượng và hiệu ứng được giữ nguyên.

Kiểm tra trình duyệt desktop, mobile 390 px và API cũ đi qua tô/lưu/hoàn
thành, quay lại chủ đề, trang chủ, Lịch sử, gói dịch vụ và các hiệu ứng.
Kiểm tra riêng Lịch sử xác nhận ảnh đầu không chờ request ảnh riêng, ảnh
phía dưới tải/giải mã được, bộ lọc dùng lại ảnh không đổi và ảnh đã có vẫn
hiện trước khi metadata mới trả về. Trang chủ được kiểm tra đủ bảy lớp gấu,
sáu hình chế độ và màu nhãn khi 0/2 lượt.

Với 21 bản tô thử và PNG có nhiều nét, JSON Lịch sử giảm từ 7.341.365 xuống
1.722.783 byte khi giữ bốn ảnh đầu. Ảnh còn lại vẫn được tải đủ khi cuộn đến.
Ở kiểm tra có bật HTTP cache thực, về trang chủ sau khi yêu cầu trình duyệt
dọn bộ nhớ không truyền thêm byte ảnh giao diện qua mạng. Lịch sử ít tranh
vẫn phải chờ metadata ở lần đầu; không cam kết một thời gian mở cố định.

Môi trường hiện tại không được phép truy cập domain online qua proxy. Cần
cả Render và Cloudflare chạy bản mới để kiểm tra kết quả thực tế. Render
Free vẫn có thời gian đánh thức sau khi ngủ. Các số tổng hợp được lưu trong
[`metrics/completion-history-2026-11-04.json`](metrics/completion-history-2026-11-04.json).
