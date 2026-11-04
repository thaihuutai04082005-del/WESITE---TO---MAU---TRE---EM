# Bắt đầu lại với Supabase, không nhập tài khoản thử cũ

Chủ dịch vụ đã đồng ý bỏ các tài khoản thử trên SQLite cũ. Mục tiêu là giữ tài
khoản/tranh mới qua deploy, restart và thay instance Render. Không cần nén/gửi
`data.zip`, không chạy `db:import` và không xóa dữ liệu của project khác.

## Chuẩn bị database trống

1. Vào https://supabase.com/dashboard, đăng nhập bằng GitHub đã dùng trước đây.
2. Mở đúng project dành cho TinyTints, kiểm tra **Table Editor**. Project hiện đã
   được chủ dịch vụ xác nhận chưa có bảng. Nếu dùng project khác, kiểm tra lại;
   không chạy SQL xóa bảng để biến một project đang có dữ liệu thành trống.
3. Trong **Connect**, chọn **Session pooler** (cổng **5432**), định dạng **URI**.
   Pooler dùng được trên hosting IPv4; không dùng transaction pooler cho kết nối
   này. Giữ nguyên username/host/database của URI do chính project cung cấp.
4. Chuẩn bị mật khẩu database đã đặt cho project. Đây là mật khẩu database,
   không phải mật khẩu GitHub hoặc khóa API Supabase. Nếu không nhớ, chỉ đặt lại
   mật khẩu của đúng project dành riêng cho TinyTints và cập nhật các client dùng nó.

## Cấu hình Render trước khi đưa bản sửa lên

Render → **tinytints-api → Environment** → thêm hai biến riêng tư:

| Key | Value |
| --- | --- |
| `DATABASE_URL` | URI Session pooler lấy từ Connect, có thể giữ `[YOUR-PASSWORD]` |
| `PGPASSWORD` | Mật khẩu database đúng của project; nhập trực tiếp, không thêm dấu nháy |

Mã backend tự mã hóa ký tự đặc biệt trong mật khẩu khi ghép URI. Không dán URI
hoặc mật khẩu vào chat/Git/frontend. Giữ nguyên Brevo và các cấu hình đang dùng
khác. Khi `DATABASE_URL` có giá trị, backend dùng PostgreSQL và bỏ qua
`DB_FILE`; đổi riêng `DB_FILE` không khắc phục filesystem tạm của Render Free.

Nếu giao diện Render có **Save only**, dùng mục đó để chuẩn bị biến cho lần triển
khai kế tiếp, rồi mới đưa bản sửa lên `main`. Giao diện thực tế hiện chỉ thấy
**Save, rebuild and deploy**: backend trên `main` đã hỗ trợ PostgreSQL, nên có thể
lưu hai biến bằng nút đó trước, chờ Render báo **Live** và xác nhận Supabase đã
xuất hiện bảng `users`, rồi mới đưa chốt chặn mới lên. Chưa tạo tài khoản sử dụng
thật trước khi hoàn tất migration bảo vệ các bảng và kiểm tra chuyển.

Chưa push bản sửa lên `main` khi cấu hình đích chưa được xác nhận lưu: Render tự
deploy từ `main` có thể khởi động lại instance đang giữ SQLite tạm. Bản sửa sẽ
dừng khởi động nếu Render production vẫn chưa có cấu hình lưu trữ bền vững.

Vì đây là lần bắt đầu database mới với ID tài khoản có thể được dùng lại, đổi
`JWT_SECRET` sang một chuỗi ngẫu nhiên mới **một lần** để vô hiệu các token của
tài khoản thử cũ. Có thể dùng chức năng Generate trong trình quản lý secrets nếu
có. Sau lần chuyển này, giữ nguyên secret qua các deploy bình thường; đổi secret
không phải cách lưu hoặc khôi phục tài khoản. Không chia sẻ giá trị secret.

Không bật lại SQLite tạm để che lỗi kết nối. Nếu PostgreSQL từ chối mật khẩu hoặc
TLS, sửa kết nối đó; ứng dụng không fallback sang một database SQLite mới.

## Khi Render báo SELF_SIGNED_CERT_IN_CHAIN

Ảnh triển khai `9cca2fc` do chủ dịch vụ gửi xác nhận backend đã thử kết nối
PostgreSQL nhưng dừng ở bước kiểm tra chứng chỉ. Lỗi TLS xảy ra trước xác thực
database, nên chưa chứng minh mật khẩu đúng hoặc sai. Có thể giữ `[YOUR-PASSWORD]`
trong `DATABASE_URL` khi `PGPASSWORD` chứa mật khẩu database thật; mã đã thay thế
placeholder và mã hóa ký tự đặc biệt trước khi kết nối.

1. Supabase → **Database → Settings → SSL Configuration → Download certificate**:
   tải chứng chỉ CA của đúng project. Không thay đổi hoặc tắt SSL enforcement.
2. Mở chứng chỉ bằng Notepad. File PEM có dòng `-----BEGIN CERTIFICATE-----` và
   `-----END CERTIFICATE-----`. Sao chép toàn bộ, giữ nguyên các dòng bao quanh.
   Nếu tải được định dạng nhị phân, cần chuyển sang PEM; không dán dữ liệu lỗi vào
   cấu hình hoặc lấy chứng chỉ từ một nguồn không xác minh.
3. Render → **Environment → Secret Files → Add Secret File**. Đặt filename là
   `supabase-ca.crt`, contents là toàn bộ chứng chỉ đã tải. Đây là CA công khai,
   không phải private key hoặc mật khẩu database.
4. Thêm Environment Variable `NODE_EXTRA_CA_CERTS` với value
   `/etc/secrets/supabase-ca.crt`. Biến phải có trong môi trường lúc Node khởi động;
   chỉ đặt qua `dotenv.config()` sau khi tiến trình đã chạy là không đủ.
5. **Save, rebuild and deploy**, rồi kiểm tra lại. `rejectUnauthorized` và kiểm
   tra hostname vẫn bật. Không dùng `NODE_TLS_REJECT_UNAUTHORIZED=0`,
   `rejectUnauthorized:false` hoặc chế độ no-verify để bỏ qua lỗi.

Đường dẫn phải khớp filename Secret File. Chỉ thêm một CA do đúng nhà cung cấp
cung cấp; thay CA khi nhà cung cấp xoay chứng chỉ. Cấu hình này dùng được với
backend hiện có, không cần đổi code hoặc chia sẻ URI/password qua chat.

Đã kiểm thử Node 24 với cấu hình TLS của `postgresOptions`: không có CA thì từ
chối chain tự ký, thêm CA bằng `NODE_EXTRA_CA_CERTS` thì kết nối thành công, sai
hostname vẫn bị từ chối. Đây là TLS fixture trên localhost, chưa thay thế việc
xác minh kết nối với project Supabase thật.

Nguồn: [hướng dẫn SSL của Supabase](https://supabase.com/docs/guides/platform/ssl-enforcement).

## Triển khai và kiểm tra tài khoản mới

1. Sau khi kết nối PostgreSQL đã hoạt động, triển khai mã đã có chốt chặn lưu trữ
   và migration PostgreSQL `003`.
   Backend tự tạo schema/nạp thư viện tranh trên database trống, không tạo lại
   các tài khoản thử cũ và không chạy lệnh reset database ở mỗi deploy.
2. Logs của bản sửa phải có `[database] engine=postgres accounts=N pictures=M`,
   sau đó API báo chạy. `N=0, M=0` chỉ ở lần đầu trên database trống. Nếu bản cũ
   đã tạo/nạp tranh trong bước lưu biến trước đó, số tranh phải khác 0. Nếu
   `engine=sqlite`, chưa hoàn tất chuyển. Những lần sau phải thấy số tài khoản/
   tranh đã có, không quay về 0 ngoài dự kiến.
3. Tạo một tài khoản mới bằng email/OTP trên web, lưu một bức tranh và ghi nhận
   mã bạn bè. Trong Supabase, bảng `users` phải có tài khoản mới đó.
4. Thực hiện một lần Render restart/redeploy có kiểm soát. Đăng nhập lại bằng
   đúng tài khoản/mật khẩu, kiểm tra tranh và mã bạn bè. Chỉ sau bước thực tế này
   mới xác nhận việc chuyển của production giữ dữ liệu qua triển khai.

Migration `003` bật RLS và thu hồi quyền đọc/ghi trực tiếp của vai trò Data API
`anon`/`authenticated` trên các bảng ứng dụng. Backend kết nối bằng chủ sở hữu
database vẫn truy cập bình thường. Web tiếp tục dùng đăng nhập và API TinyTints,
không chuyển sang Supabase Auth và không đưa service-role key vào frontend.

Blueprint có Build Filters để thay đổi chỉ ở frontend/SEO không tự redeploy
backend. Nếu dịch vụ tạo thủ công, đặt tương tự trong Render **Settings → Build
& Deploy → Build Filters**. Đây là tối ưu triển khai, không thay thế database bền vững.

## Tiếp tục giữ dữ liệu

Supabase tách dữ liệu khỏi filesystem Render, xử lý nguyên nhân mất dữ liệu đã
xác định. Vẫn giữ nguyên project/URI database trong những lần cập nhật sau;
không xóa project, tạo database mới hoặc chạy SQL reset như một bước deploy.
Free có hạn mức và có thể tạm ngưng khi ít sử dụng; tiếp tục dùng cùng project
khi khôi phục hoạt động.

Cần bản sao riêng ngoài nhà cung cấp. Dùng `pg_dump` với cùng cấu hình kết nối
riêng tư để xuất schema public/dữ liệu sang nơi riêng, kiểm tra bản sao có tài
khoản/tranh và thử phục hồi ở database khác. Không đưa dump vào repo hoặc nơi
công khai. Xem việc lưu bên ngoài và việc có backup là hai phần cần được kiểm tra.
