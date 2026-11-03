# Quyền lợi gói và cách kiểm tra

Quyền được xác định bằng subscription **đang có hiệu lực trên máy chủ**:
`starts_at <= hiện tại < ends_at`. Giao dịch đang chờ, gói chưa đến ngày bắt đầu,
hoặc gói đã hết hạn không cấp VIP. VIP tháng và VIP năm có cùng quyền lợi.
Client gửi `vip`, `plan` hoặc `role` trong nội dung yêu cầu không thể tự cấp quyền.

| Quyền | Free (Gói Thường / Standard) | VIP tháng / năm còn hạn |
| --- | --- | --- |
| Tô cá nhân | 2 tranh/ngày, tính từ thao tác đầu tiên | Không giới hạn lượt |
| Chủ đề thường | 5 chủ đề đầu ở **mỗi nhóm tuổi** | Toàn bộ chủ đề đang mở |
| Truyện tranh | 1 cuốn, tối đa 10 trang/cuốn | Không giới hạn số cuốn, tối đa 200 trang/cuốn |
| Gửi triển lãm | 1 tranh/vòng | 5 tranh/vòng |
| Đề nghị tặng/đổi thẻ | 1 lượt/ngày | 5 lượt/ngày |
| Chữ ký | 5 mẫu cơ bản | Thêm 5 mẫu đặc biệt và chữ ký viết tay |
| Huy hiệu VIP | Không | Có |
| Đấu trường, Bóc thẻ, tô cùng nhau | Có | Có |
| Shop Ruby | Mua bằng Ruby, dùng vật phẩm đã sở hữu | Cùng quy tắc; không tự tặng mọi vật phẩm |
| Tranh thẻ hiếm | Cần sở hữu thẻ | Vẫn cần sở hữu thẻ |

Năm chủ đề Free được chọn theo thứ tự hiển thị `themes.sort, themes.id`, riêng
cho từng nhóm tuổi và chỉ tính chủ đề đang hoạt động. Nhóm có tối đa năm chủ đề
thì tất cả chủ đề của nhóm đó nằm trong phần Free. Khi tăng thư viện, các chủ đề
ngoài năm vị trí đầu cần VIP; số năm nằm ở `PLANS.free.themesPerAge`.

Các API duyệt chủ đề, đọc tranh, tạo tranh và lưu/chỉnh sửa kiểm tra quyền ở máy
chủ. Không thể vượt bằng URL trực tiếp, request giả, tranh nháp đã tính lượt từ
trước, cache giao diện hoặc phòng tô cùng nhau. Phòng chung kiểm tra quyền của
từng thành viên khi tạo, tham gia, thao tác và lưu. Đấu trường vẫn mở theo luật
trò chơi cho cả hai gói; điều này không mở khóa toàn bộ thư viện tô cá nhân.

Hết VIP sẽ khóa việc tạo/chỉnh sửa vượt quyền Free, đồng thời đưa giới hạn truyện,
triển lãm, tặng/đổi và chữ ký về Free. Tranh và truyện được tạo hợp lệ trước đó vẫn
được xem lại, không xóa dữ liệu. Chữ ký đặc biệt đã nằm trên tranh cũ được giữ.
Giao diện đồng bộ gói khi quay lại tab, khi tới hạn gói và định kỳ trong lúc dùng.
Sau thanh toán, trạng thái gói và huy hiệu tài khoản được cập nhật cùng nhau.

Kiểm tra:

```bash
npm test
npm run build
node --test frontend/test/*.test.mjs
node frontend/scripts/check-seo.mjs
```

Kiểm thử tích hợp bao gồm Free, VIP tháng/năm, giao dịch chưa thanh toán, gói
tương lai, hết hạn khi tranh/phòng đang mở và các API quyền lợi. Khi sửa quyền lợi,
cập nhật cả constants, nội dung trang Gói dịch vụ và kiểm thử tương ứng.
