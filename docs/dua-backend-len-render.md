# Chạy thử backend trên Render và nối Cloudflare Pages

Frontend hiện tại: https://tinytints.pages.dev. Backend cần Node.js 24, Socket.io
và SQLite. `render.yaml` trong kho đã cấu hình backend để triển khai bằng Blueprint.
Không cần mua tên miền: Render cấp một địa chỉ HTTPS `*.onrender.com`.

## 1. Tạo backend miễn phí

1. Đăng nhập https://dashboard.render.com bằng GitHub.
2. Chọn **New → Blueprint**, liên kết kho
   `thaihuutai04082005-del/WESITE---TO---MAU---TRE---EM`, nhánh `main`.
3. Render đọc file `render.yaml`. Kiểm tra dịch vụ `tinytints-api` có plan **Free**,
   rồi chọn **Deploy Blueprint**. Không chọn gói trả phí nếu chỉ muốn chạy thử.
4. Đợi dịch vụ báo **Live**. Sao chép URL HTTPS được Render cấp ở trang dịch vụ.
   Không tự đoán URL theo tên: Render có thể thêm hậu tố nếu tên đã được dùng.
5. Mở `<URL-backend>/api/health`: phải trả `{"ok":true}`.
   Mở `<URL-backend>/api/auth/captcha`: phải có `captchaId` và `svg`.

Render tự cài phụ thuộc backend từ lockfile và chạy `npm start`, dùng cổng `PORT`
do Render cấp. Khóa `JWT_SECRET` được Render tạo, không đưa vào Git hoặc chat.
`API_PUBLIC_URL` mặc định lấy `RENDER_EXTERNAL_URL`, do đó dùng đúng URL được cấp.
Các lần cập nhật `main` sẽ tự triển khai lại backend.

Nếu tạo bằng **New → Web Service** thay vì Blueprint, chọn cùng kho và điền:

| Ô | Giá trị |
|---|---|
| Runtime | Node |
| Root directory | Để trống |
| Build command | `npm ci --omit=dev --workspace=backend --include-workspace-root` |
| Start command | `npm start` |
| Health check path | `/api/health` |
| Plan | Free |

Đặt các biến trong `render.yaml`; riêng JWT_SECRET dùng giá trị ngẫu nhiên dài
được tạo qua giao diện quản lý secrets. Không dùng chuỗi mẫu trong `.env.example`.

## 2. Nối giao diện Cloudflare

Backend của dự án hiện dùng `https://tinytints-api.onrender.com`. File
`frontend/.env.production` đã đặt sẵn URL API và Socket.io cho địa chỉ này.
Cloudflare sẽ dùng các giá trị đó khi build nhánh `main`; không cần nhập lại nếu
chưa đặt hai biến `VITE_API_URL` và `VITE_SOCKET_URL` trong dashboard.

Nếu đã đặt hai biến trong Cloudflare, kiểm tra chúng khớp địa chỉ bên dưới vì
biến ở dashboard được ưu tiên hơn file. Khi đổi backend, cập nhật file hoặc
ghi đè bằng cấu hình Cloudflare theo các bước sau.

Trong **Cloudflare → Workers & Pages → tinytints → Settings → Variables and Secrets**
(tên mục có thể là Environment variables), thêm cho môi trường **Production**:

```text
VITE_API_URL=<URL-backend>/api
VITE_SOCKET_URL=<URL-backend>
```

Ví dụ nếu URL do Render cấp là `https://my-api.onrender.com` thì giá trị tương ứng
là `https://my-api.onrender.com/api` và `https://my-api.onrender.com`.
Không nhập dấu `< >` và không thêm dấu `/` ở cuối.

Các biến bắt đầu bằng `VITE_` được công khai trong giao diện: chỉ đặt URL, tuyệt đối
không đặt khóa SMS, JWT, PayPal hoặc MoMo ở đây.

Lưu biến rồi vào **Deployments → Retry deployment** bản mới nhất để build lại:
Vite đọc các URL này lúc build. Chỉ tải lại trang không thay được URL trong bản build.
Sau khi build thành công, mở web, Ctrl+F5 rồi vào Đăng ký. Hình CAPTCHA phải hiện;
bấm nút đổi mã phải lấy được mã mới. Kiểm tra ở cả máy tính và điện thoại.

Nếu đổi địa chỉ frontend, cập nhật `PUBLIC_URL` và `CORS_ORIGINS` bên Render theo
địa chỉ đó. Dùng nhiều origin thì phân cách bằng dấu phẩy, không dùng `*` cho web
thật. Cấu hình hiện tại cho phép origin production, không tự cho mọi preview URL.

## 3. Chức năng nào sẵn sàng?

- Backend khởi động, tự tạo schema và nạp tranh; CAPTCHA không cần khóa dịch vụ.
- Socket.io chạy trên cùng cổng với HTTP; frontend dùng `VITE_SOCKET_URL` ở trên.
- OTP qua SMS/email cần tài khoản nhà cung cấp và khóa hợp lệ. Chưa cấu hình thì
  web báo chưa gửi được mã; không báo gửi thành công hoặc cho qua xác minh.
- OTP thử nghiệm không được trả về response hay log ở production, kể cả đặt nhầm
  `EXPOSE_DEV_OTP=true`. `PAYMENT_MOCK` cũng bị vô hiệu ở production.
- PayPal/MoMo chưa thể nhận tiền thật khi thiếu tài khoản merchant/khóa/webhook.
  CAPTCHA hoạt động không chứng minh OTP đã gửi thật hoặc thanh toán đã hoàn tất.
- Render Free hạn chế kết nối SMTP; khi chuẩn bị OTP thật nên dùng API HTTPS cho
  SMS/email hoặc chuyển sang hosting cho phép SMTP. Đừng tắt kiểm tra TLS.

## 4. Giới hạn quan trọng của gói Free

Đây là môi trường **chạy thử**, chưa phải nơi giữ dữ liệu khách hàng hay thu tiền.
SQLite đang ở `/tmp/tinytints/app.db` trên filesystem tạm; có thể bị xóa khi deploy,
restart hoặc thay máy. Web có thể ngủ khi ít truy cập, lần gọi đầu sẽ chậm.

Trước khi dùng thật, chuyển sang dịch vụ có persistent disk, đổi `DB_FILE` sang
đường dẫn trên disk đó, sao lưu/khôi phục thử database và xác minh webhook, SMS
trực tiếp với nhà cung cấp. Không lưu tranh/tài khoản quan trọng trên Free rồi
cho rằng dữ liệu sẽ tồn tại lâu dài.
