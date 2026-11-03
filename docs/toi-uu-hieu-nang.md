# Dọn tranh ẩn và giảm thời gian tải

Chỉ các tranh được đánh dấu ẩn trong catalog hoặc thuộc ba chủ đề đã ẩn được
loại khỏi kho: 320 tranh, 379 file SVG/nguồn, 30.424.369 byte. Danh sách slug
đã loại nằm trong `assets-library/retired-pictures.json` để xử lý máy chủ cũ.
225 tranh thường và 7 thẻ bài đang hiện được giữ nguyên; đối chiếu SHA-256 của
từng SVG trước/sau cho kết quả giống nhau. Khóa VIP không phải điều kiện xóa.
Generator bỏ qua tranh/chủ đề/thẻ đánh dấu ẩn, nên sinh lại kho không tạo chúng lại.

Backend chạy migration SQLite 020 / PostgreSQL 002 rồi seed như trước. Startup
xóa các bản ghi đã nghỉ/ẩn không còn trong catalog hiện tại; ID của tranh đang
dùng được giữ bằng upsert. Dữ liệu phụ thuộc **chính tranh bị xóa** (bản tô, thẻ
sở hữu, giao dịch và trang truyện tham chiếu bản tô đó) được dọn trong transaction.
Bản tô/thẻ/trang truyện thuộc tranh đang dùng không bị xóa. Cờ ẩn do báo cáo ở
triển lãm không được dùng để chọn tranh xóa.

Danh sách đọc URL preview đã tính sẵn trong DB, không đọc SVG/đa giác rồi bỏ đi
ở bước trả JSON. Trong phép đo cục bộ với 25 ảnh bìa, dữ liệu DB giảm từ
8.281.608 byte xuống 15.114 byte. Startup kiểm tra hash tài nguyên thay cho tải
lại toàn bộ SVG và manifest từ DB. Tranh cũ tùy chỉnh chưa có preview vẫn có
đường dự phòng dùng SVG đầy đủ.

Frontend gộp các GET giống nhau đang chạy theo token và URL; không cache kết
quả quyền sau khi request hoàn tất. Metadata và phiên đăng nhập tải đồng thời.
API hiện tại kiểm tra quyền ngay tại endpoint tranh nên không cần gọi thêm
endpoint danh sách chủ đề; API cũ vẫn qua guard trước. Màn tô kiểm tra lại khi
gói thay đổi, kể cả VIP hết hạn. Preview thẻ vẫn yêu cầu quyền sở hữu.

Mã màn hình tải theo nhu cầu; Layout và các hiệu ứng chuyển trang vẫn giữ
nguyên. Tổng JavaScript tải lúc vào Home trong trình duyệt thử là 566.666 byte,
so với bundle cũ khoảng 874 KB. Thời gian và asset của các hiệu ứng cầu vồng,
tô cùng nhau, đấu trường, bóc thẻ, truyện, nhiệm vụ và rèm triển lãm không đổi.

Kiểm tra:

```sh
npm test
npm run test:postgres
npm run build
node --test frontend/test/*.test.mjs
node frontend/scripts/check-picture-previews.mjs
node frontend/scripts/check-seo.mjs
```

Kiểm thử trình duyệt đã đi qua chọn tranh, tô/lưu, hoàn thành/pháo giấy, quay
lại chủ đề, lịch sử, các màn chính, bóc thẻ, từng hiệu ứng và khóa khi VIP hết
hạn. Có kiểm tra desktop, mobile và chế độ API cũ. Môi trường kiểm thử không
truy cập được domain API online qua proxy, nên đây là số đo cục bộ. Cấu hình
`render.yaml` hiện dùng Render Free; thời gian đánh thức dịch vụ khi nó ngủ
không được loại bỏ bằng việc dọn tranh hoặc giảm JavaScript.
