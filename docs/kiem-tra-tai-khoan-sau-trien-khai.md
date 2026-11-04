# Tài khoản cũ báo sai sau triển khai

## Mục tiêu hiện tại

Chủ dịch vụ đã quyết định bỏ các tài khoản thử cũ, dừng khôi phục và không cần
gửi tiếp bản sao/chia archive. Chỉ triển khai lưu trữ bền vững cho tài khoản tạo
từ nay. Không chạy import SQLite, không xóa database hoặc project bên ngoài.

Đã xác nhận mở được project Supabase dành cho TinyTints và Table Editor chưa có
bảng nào. Có thể khởi tạo schema/nội dung ứng dụng mới tại đó. Còn cần cấu hình
`DATABASE_URL` và `PGPASSWORD` trong Render, rồi kiểm tra thực tế sau triển khai;
workspace không có thông tin kết nối hoặc quyền quản trị Render/Supabase.
Quy trình áp dụng hiện tại: [bắt đầu lại với Supabase](bat-dau-lai-voi-supabase.md).

Giao diện Render của chủ dịch vụ chỉ thấy **Save, rebuild and deploy**. Lệnh đẩy
commit chuẩn bị lên `main` bị duyệt tự động chặn do chưa xác nhận `DATABASE_URL`
đã lưu, vì push sẽ redeploy instance SQLite tạm. Chưa push. Phương án tiếp tục:
lưu biến Supabase bằng giao diện Render trước (backend hiện tại đã hỗ trợ
PostgreSQL), xác nhận **Live** và bảng `users` xuất hiện ở Supabase, rồi mới đưa
chốt chặn lên. Không dùng thao tác khác để vượt việc từ chối đẩy mã ở trạng thái
cấu hình chưa xác nhận.

## Bằng chứng và giới hạn của lần kiểm tra 04/11/2026

- Chủ dịch vụ xác nhận Render không có `DATABASE_URL`, `DB_FILE` thực tế là
  `/tmp/tinytints/app.db` và log triển khai gần nhất có
  `[seed] Khởi tạo dữ liệu lần đầu`.
- Blueprint trước bản sửa đặt SQLite ở `/tmp/tinytints/app.db`, trên Render Free;
  mọi commit trên `main`, kể cả frontend/SEO, đều có thể kích hoạt triển khai backend.
- Chưa đọc được file database trên Render hoặc bản sao của instance cũ. Cần đối
  chiếu lịch triển khai, thời điểm mất đăng nhập và các bản sao có thể còn.
- Database trong workspace có 0 tài khoản; nó không phải bản sao database online
  và không thể dùng để khôi phục tài khoản đã tạo trên web.
- Chủ dịch vụ xác nhận còn bản sao cũ trên máy cá nhân. Chưa nhận/đọc bản sao đó,
  chưa biết ngày sao lưu, số tài khoản hoặc phạm vi dữ liệu. Trạng thái project
  Supabase cũ chưa xác định. Chưa chạy import hoặc đổi cấu hình production.
- Đã gửi `data.zip` nhưng công cụ chuyển tệp vào workspace từ chối vì vượt giới
  hạn 32 MiB. Chưa đọc hoặc giải nén được nội dung; cần gửi lại các phần nhỏ hơn
  của nguyên archive, rồi ghép lại và kiểm tra trước khi đọc database.
- Chủ dịch vụ dùng WinRAR; đã hướng dẫn nén nguyên `data.zip` thành RAR chia volume
  25 MB và gửi đủ các phần. Workspace đã chuẩn bị 7-Zip để đọc RAR nhiều phần;
  chưa nhận các volume, chưa xác nhận tài khoản hoặc khả năng khôi phục.

Điều này phù hợp với database trên ổ tạm bị thay bằng database mới khi triển khai.
Tranh được nạp lại từ mã nguồn, còn tài khoản/tranh đã lưu/gói không có trong mã
nguồn nên không được tự khôi phục. Luồng đăng nhập dùng cùng mã lỗi
`invalid_credentials` cho tài khoản không tồn tại và mật khẩu sai, vì vậy thông báo
trên giao diện không phân biệt được hai trường hợp này.

Rà soát migration, seed/dọn tranh ẩn và đăng nhập không thấy lệnh xóa tài khoản
thường hoặc thay đổi password hash của chúng. Tắt OTP điện thoại không chặn đăng
nhập bằng tên/mật khẩu của tài khoản cũ. Đổi JWT_SECRET có thể làm hết phiên cũ,
nhưng không làm việc đăng nhập lại bằng đúng tên/mật khẩu thất bại.

## Kiểm tra trước khi tác động dịch vụ

1. Render Dashboard → dịch vụ `tinytints-api` → Environment: xem đường dẫn
   `DB_FILE`, chỉ chia sẻ đường dẫn này; giữ kín giá trị URI/password/token.
2. Logs: xác định lần triển khai có log khởi tạo lần đầu và thời điểm so với lần
   cuối đăng nhập được. Dòng seed chỉ cho biết bảng tranh trống, chưa chứng minh
   toàn bộ tài khoản cũ đã bị xóa khỏi mọi bản sao.
3. Chưa deploy/restart, đổi đường dẫn hay ghi đè database đang chạy. Tìm bản sao
   SQLite thực sự của online, export/backup hoặc quyền đọc instance với Render.
   Render Free có thể không có Shell/SSH; đừng triển khai endpoint xuất mới rồi
   kỳ vọng file trên ổ tạm của phiên bản cũ chắc chắn còn đó.
4. Nếu có bản sao, kiểm tra integrity, số tài khoản và thời điểm dữ liệu trước khi
   nhập vào PostgreSQL trống theo `luu-du-lieu-lau-dai.md`. Bản sao localhost chỉ
   khôi phục được dữ liệu từng có trên chính máy đó.

Nếu file ở instance cũ đã bị xóa và không có bản sao nào chứa các hàng dữ liệu đó,
mã nguồn hoặc thao tác đặt lại mật khẩu không thể khôi phục tài khoản cũ. Chưa có
đủ quyền truy cập/bằng chứng để kết luận khả năng khôi phục của dịch vụ này.

## Bản sửa đã chuẩn bị, chưa triển khai khi đang điều tra

- Chặn mở/tạo SQLite trong Render production khi không có database bền vững được
  cấu hình; vẫn cho phép SQLite localhost và disk trả phí đã khai báo rõ.
- Blueprint Free yêu cầu `DATABASE_URL`, bỏ mặc định `/tmp`. Không fallback sang
  SQLite khi kết nối PostgreSQL lỗi.
- `buildFilter` tránh redeploy backend vì thay đổi chỉ ở frontend/SEO. Nếu dịch vụ
  được tạo thủ công thì cần đặt Build Filters tương ứng trong dashboard.
- Log số tài khoản/tranh và engine trước seed, không log thông tin cá nhân hay secrets.

Kiểm thử dùng database riêng trong thư mục tạm, không kết nối Render: tạo tài khoản
email và điện thoại, lưu tranh/thẻ/gói, dừng tiến trình, chạy lại startup kèm seed và
dọn tranh ẩn, rồi đăng nhập lại bằng cùng mật khẩu và đối chiếu dữ liệu. Một file
database mới riêng được kiểm tra để tái hiện tình huống web vẫn hiện tranh nhưng
mọi tài khoản của database trước đều báo `invalid_credentials`.

Kết quả trên máy kiểm thử sau khi bổ sung kiểm tra PostgreSQL đóng/mở trên disk
và quyền Data API: `npm test` 79/79, `npm run test:postgres` 36/36,
kiểm tra cú pháp Blueprint và `git diff --check` đều đạt. Các kết quả này không
chứng minh dữ liệu ở instance Render cũ còn hay đã được khôi phục.

Chủ dịch vụ đã chấp nhận bỏ dữ liệu thử cũ nên không còn chờ bản sao/import.
Chỉ triển khai sau khi cấu hình database đích trong Render; chốt chặn mới sẽ từ
chối cấu hình Render SQLite tạm đang có. Việc bắt đầu lại không cho phép xóa
database đích ở các lần triển khai sau.
