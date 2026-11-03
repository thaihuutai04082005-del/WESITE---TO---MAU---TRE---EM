# Chuyển dữ liệu khỏi ổ tạm

Hiện `DB_FILE=/tmp/tinytints/app.db` trên Render Free. Không thay đổi/redeploy dịch
vụ trước khi quyết định có phải giữ nguyên dữ liệu đang có hay không. Công cụ
trong kho và máy Codex không truy cập được database đang chạy trong Render.

## Sao lưu trước khi chuyển

Chạy trên chính máy đang giữ file SQLite, từ thư mục gốc kho:

```sh
node scripts/sqlite-backup.mjs /path/to/live/app.db /path/to/private/backup.db
```

Công cụ dùng SQLite online backup (bao gồm dữ liệu đã commit trong WAL), kiểm tra
integrity và foreign keys. Nó không ghi đè file có sẵn và đặt file đầu ra mode
0600. Không sao chép riêng `app.db` khi ứng dụng vẫn ghi vào WAL. Sao lưu chứa
thông tin tài khoản: giữ riêng, không đưa vào Git/chat.

Render Free có thể không cung cấp Shell/SSH. Nếu không có quyền đọc file đang
chạy, cần kiểm tra khả năng xuất dữ liệu với Render trước khi thay đổi dịch vụ.
Không thể hứa giữ dữ liệu cũ chỉ bằng cách thêm disk hoặc đổi `DB_FILE`. Đưa endpoint
backup mới vào code cũng cần redeploy, nên không phải cách bảo toàn chắc chắn
cho database đang nằm trên ổ tạm của phiên bản cũ.

## Lựa chọn lưu trữ

- Ít thay đổi mã nhất: dịch vụ Render trả phí có persistent disk. Mount disk
  tại `/var/data`, đặt `DB_FILE=/var/data/tinytints/app.db`. Chỉ chọn/nâng cấp gói
  khi đã chấp nhận chi phí và có phương án giữ dữ liệu hiện tại.
- Nếu giữ miễn phí: chuyển sang một dịch vụ database bên ngoài. Ứng dụng hiện
  dùng truy vấn SQLite đồng bộ và transaction ở nhiều nơi; việc chuyển database
  cần sửa/test ứng dụng, không chỉ thay URL kết nối.

## Khôi phục và nghiệm thu

Dừng ứng dụng; bảo đảm không có tiến trình nào đang mở file đích hay các file
`-wal`/`-shm` cũ. Đặt file đích mới trên persistent disk bằng cùng công cụ:

```sh
node scripts/sqlite-backup.mjs /path/to/private/backup.db /var/data/tinytints/app.db
```

Nếu file đích đã có, công cụ từ chối ghi đè. Giữ một bản sao an toàn của database
đích trước khi xử lý; không xóa file đang mở. Khởi động với `DB_FILE` đúng vị trí
và giữ nguyên `JWT_SECRET` đang dùng. Kiểm tra đăng nhập, tranh, quyền gói và mã
bạn bè. Thử restart/redeploy rồi kiểm tra lại dữ liệu trước khi kết luận đã lưu
lâu dài. Sao lưu riêng ra ngoài máy chủ, theo dõi dung lượng và thử khôi phục.

## PostgreSQL / Supabase: mã đã hỗ trợ, chưa chuyển production

Backend dùng `DATABASE_URL` khi biến này có giá trị. Nếu để trống, SQLite vẫn dùng
`DB_FILE`. Việc kiểm tra kết nối không tự khởi động app, tạo tài khoản hoặc seed dữ
liệu. Không được coi việc tạo project Supabase là đã sao lưu database Render.

### 1. Chuẩn bị trên bản sao dự án ở máy cá nhân

Giữ nguyên dự án và bản sao `backend/data` cũ. Tạo **bản sao toàn bộ dự án** để thử
mã cập nhật; giải nén gói mã vào bản sao này. Gói cập nhật không chứa `.env`,
`backend/data`, `node_modules` hoặc thư viện hình ảnh: giữ các thư mục hình ảnh có
sẵn trong bản sao dự án. Mở terminal tại thư mục có `package.json` gốc, chạy:

```sh
npm ci
```

Trong **`backend/.env` của bản sao thử**, thêm các tên biến dưới đây. Không để
trùng tên biến; không chia sẻ nội dung `.env` hoặc đưa nó vào Git.

```dotenv
# Chuỗi URI do Supabase Connect → Direct → Session pooler → URI cung cấp.
# Có thể giữ nguyên [YOUR-PASSWORD] trong URI, mật khẩu nhập riêng ở dòng tiếp.
DATABASE_URL=postgresql://postgres.PROJECT_REF:[YOUR-PASSWORD]@POOLER_HOST:5432/postgres
PGPASSWORD="MAT_KHAU_DATABASE_CUA_BAN"
```

Điền URI **chính project của bạn**, không dùng chuỗi ví dụ. `PGPASSWORD` là mật
khẩu database khi tạo project, không phải mật khẩu GitHub, PayPal hoặc khóa API.
Cách nhập riêng này tự mã hóa ký tự đặc biệt khi ghép URI. Nếu mật khẩu chứa dấu
nháy kép hoặc xuống dòng, dùng định dạng dotenv phù hợp; không tự dán mật khẩu
chưa mã hóa vào URI. Pool dùng TLS có xác minh chứng chỉ; không tắt xác minh để
bỏ qua lỗi kết nối. Nếu cần CA riêng, tải CA từ nhà cung cấp và cấu hình
`NODE_EXTRA_CA_CERTS` cho tiến trình, giữ `rejectUnauthorized=true`.

### 2. Chỉ kiểm tra kết nối

```sh
npm run db:check
```

Kết quả thành công có `connected: true`, phiên bản PostgreSQL và số bảng public.
Công cụ thực hiện giao dịch **READ ONLY**, không in chuỗi kết nối hoặc mật khẩu.
Chỉ chia sẻ phần kết quả đã rút gọn này khi cần hỗ trợ.

**Chưa chạy `npm start` / `chay-web.bat` khi đích còn trống và đang chuẩn bị nhập:**
khởi động app trên database trống sẽ seed nội dung; trình nhập sau đó từ chối đích
đã có dữ liệu. Không lưu biến mới trên Render hoặc push/redeploy trước khi bảo vệ
được dữ liệu online và kiểm tra xong phương án chuyển.

### 3. Xác định đúng nguồn dữ liệu

Công cụ không truy cập được `/tmp/tinytints/app.db` của instance Render Free.
Bản sao localhost chỉ chứa dữ liệu trên máy đó, không bao gồm tài khoản/tranh chỉ
được tạo online. Yêu cầu giữ nguyên mọi dữ liệu online chỉ có thể nghiệm thu khi
có bản xuất nhất quán từ instance online (hoặc phương án xuất được xác minh).
Không thay bản online bằng bản localhost rồi kết luận giữ nguyên mọi thứ.

Đặt file nguồn ở thư mục riêng, tạo snapshot bằng `sqlite-backup.mjs` trước khi
nhập. Giữ nguồn nguyên vẹn, gồm dữ liệu đã commit trong WAL. Công cụ nhập mở
SQLite read-only, không chạy migration/seed trên nguồn.

### 4. Nhập vào đích trống sau khi nguồn đã được xác minh

Chỉ chạy khi đã xác định đúng bản sao nguồn cần giữ, dừng ghi vào nguồn trong lúc
chuyển cuối cùng, và chưa có app nào kết nối/seed đích. Lệnh này ghi dữ liệu vào
Supabase nên phải chạy trên đúng bản sao dự án và URI đã kiểm tra:

```sh
npm run db:import -- --import-backup "DUONG_DAN_DEN_BAN_SAO_RIENG/backup.db"
```

Công cụ tạo schema PostgreSQL theo phiên bản ứng dụng hiện tại, giữ ID và các giá
trị cột có trên nguồn (bao gồm password hash, JSON tranh, ngày giờ và các tham
chiếu). Nó khóa các bảng đích, từ chối đích đã có bản ghi, nhập trong một giao dịch,
đối chiếu số dòng và SHA-256 của từng bảng rồi chỉnh sequence ID. Lỗi hoặc khác
checksum làm rollback các bản ghi đã nhập. Không có chế độ ghi đè hoặc trộn dữ
liệu tự động. Các bảng nội bộ `_migrations`/`sqlite_sequence` không phải dữ liệu
người dùng và không được sao chép; PostgreSQL quản lý phiên bản/sequence riêng.
Bản nguồn có bảng/cột chưa hỗ trợ bị từ chối, không âm thầm bỏ dữ liệu.

### 5. Chạy thử và chuyển production

Giữ nguyên `JWT_SECRET` phù hợp với môi trường cần duy trì phiên đăng nhập. Thử
đăng nhập tài khoản cũ, mở tranh cũ, kiểm tra bộ sưu tập, gói và lịch sử thanh toán.
Sau khi xác minh đầy đủ, cấu hình `DATABASE_URL` và `PGPASSWORD` ở Render, giữ
nguyên các bí mật khác, rồi mới triển khai mã hỗ trợ PostgreSQL. Không đặt URI
vào frontend hoặc tắt bảo mật Supabase Data API đã chọn. Backend truy cập qua pg,
không cần khóa Supabase service_role hay supabase-js.

Sau chuyển, kiểm tra lần nữa khi restart/redeploy. Giữ bản sao SQLite và báo cáo
đối chiếu riêng để đối soát; không cho backend cũ ghi tiếp rồi đổi qua lại tùy ý.
Supabase Free có hạn mức và có thể tạm ngưng khi ít sử dụng; phải có bản sao lưu
riêng và thử khôi phục, không xem database bên ngoài là thay thế cho backup.

### Phạm vi kiểm thử

`npm test` kiểm tra SQLite, nhập/chống ghi đè/rollback, TLS và các luồng ứng dụng.
`npm run test:postgres` chạy các luồng HTTP/Socket.io, gói và callback thanh toán
trên PostgreSQL nhúng (PGlite), với phản hồi cổng thanh toán được giả lập. Engine
nhúng không thay thế kiểm tra TCP/TLS, quyền và độ trễ trên project Supabase thật;
`db:check` trên máy được phép kết nối là bước xác minh riêng. Máy Codex hiện không
có mật khẩu hoặc quyền TCP đến project Supabase của người dùng; chưa chạy import
hay thanh toán thật trên tài khoản của người dùng.
