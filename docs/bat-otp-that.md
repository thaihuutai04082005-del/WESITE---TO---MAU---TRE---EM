# Bật OTP gửi thật trên Render

CAPTCHA (ảnh 4 ký tự) do backend tự tạo. OTP (6 số) phải được nhà cung cấp gửi tới
điện thoại/email; việc deploy backend không tự tạo tài khoản hoặc khóa gửi tin.
Giữ `NODE_ENV=production`, `EXPOSE_DEV_OTP=false`, `PAYMENT_MOCK=false`.

## Email: Brevo qua HTTPS

1. Đăng ký tài khoản tại https://www.brevo.com/ và hoàn tất bước xác minh/duyệt
   tài khoản mà Brevo yêu cầu. Có thể bắt đầu bằng gói miễn phí nếu tài khoản đủ
   điều kiện; hạn mức và điều kiện do nhà cung cấp quyết định.
2. Trong mục **Senders / Senders, Domains & Dedicated IPs**, thêm và xác minh
   địa chỉ gửi thư. Nếu Brevo yêu cầu xác thực tên miền, thực hiện theo hướng dẫn
   của họ; không thể xác thực tên miền `pages.dev` hay `onrender.com` của nền tảng.
   Địa chỉ gửi phải được Brevo chấp nhận; không chỉ nhập một email bất kỳ.
3. Trong **SMTP & API → API Keys**, tạo **API key v3**. Dùng API key, không dùng
   SMTP password. Không gửi key vào chat hoặc đưa vào Git.
4. Mở **Render → tinytints-api → Environment → Add Environment Variable**:

   | Key | Giá trị |
   |---|---|
   | `BREVO_API_KEY` | API key v3 vừa tạo; nhập bảo mật trong Render |
   | `BREVO_SENDER_EMAIL` | Địa chỉ gửi đã xác minh/được duyệt trong Brevo |
   | `BREVO_SENDER_NAME` | `TinyTints` |

5. Chọn lưu và triển khai lại dịch vụ. Đợi **Live** rồi vào đăng ký, chọn Email,
   nhập CAPTCHA mới và thử nhận OTP. Kiểm tra cả Spam và trang transactional logs
   trong Brevo. Key đúng chưa chứng minh thư đã tới hộp thư: sender phải được
   duyệt, tài khoản còn hạn mức và thư không bị nhà cung cấp/người nhận chặn.

Ứng dụng ưu tiên Brevo khi cấu hình Brevo hiện diện. Nếu chỉ điền một phần, ứng
dụng báo lỗi cấu hình thay vì gửi qua dịch vụ khác hoặc hiện mã giả lập. Chạy
Render Free nên dùng HTTPS; các cổng SMTP thường bị hạn chế trên gói này.

## SMS: Twilio qua HTTPS

1. Đăng ký tại https://www.twilio.com/, xác minh tài khoản và chuẩn bị số gửi SMS
   hoặc **Messaging Service** phù hợp. Lấy Account SID và Auth Token từ console.
2. Hoàn thành yêu cầu đăng ký sender/nhãn hiệu và bật quyền gửi tới quốc gia cần
   dùng (Việt Nam, Mỹ). Twilio trial có giới hạn người nhận; gửi tới Mỹ/Việt Nam
   còn phụ thuộc quy định tuyến gửi và trạng thái phê duyệt của nhà cung cấp.
   SMS thật thường có phí; kiểm tra bảng giá và giới hạn chi tiêu trong Twilio.
3. Thêm trong **Render → tinytints-api → Environment**:

   | Key | Giá trị |
   |---|---|
   | `TWILIO_ACCOUNT_SID` | Account SID bắt đầu bằng `AC` |
   | `TWILIO_AUTH_TOKEN` | Token bí mật, nhập bảo mật trong Render |
   | `TWILIO_MESSAGING_SERVICE_SID` | Messaging Service SID bắt đầu bằng `MG` |

   Nếu không dùng Messaging Service, thay dòng cuối bằng `TWILIO_PHONE_NUMBER`
   là số gửi SMS Twilio được cấp, có mã quốc gia. Không dùng số cá nhân tùy ý.
4. Lưu và chờ redeploy. Thử số nhận do bạn sở hữu, xem **Messaging Logs** để kiểm
   tra trạng thái nhận thực tế. Mã vùng đã hỗ trợ `+84`, `+1`; số Việt Nam cũ
   được đổi sang `+84` khi gửi tới Twilio.

Nếu cấu hình Twilio, SMS ưu tiên Twilio; gateway eSMS cũ vẫn hỗ trợ khi không cấu
hình Twilio. Không trộn credentials của các nhà cung cấp.

## Kiểm tra sau cấu hình

- Đăng ký: đúng CAPTCHA → nhận OTP → nhập đúng để tạo tài khoản.
- Sai OTP không được xác minh; mã đã dùng không thể dùng lại; mã hết hạn sau
  10 phút; có giới hạn thử và thời gian chờ giữa các lần gửi.
- Gửi lỗi/thiếu cấu hình: không báo gửi thành công, không lộ mã, không để bản ghi
  mã chưa gửi làm kẹt lần thử tiếp theo.
- Khôi phục mật khẩu: gửi mã tới liên hệ đã xác minh, dùng mã để đặt mật khẩu mới.
- API báo đã tiếp nhận tin nhắn không đồng nghĩa đã đến máy/hộp thư. Kiểm tra
  delivery logs thực tế trong dịch vụ và thử nhận trên số/email của bạn.

Khóa chỉ đặt tại backend Render, không đặt trong Cloudflare, biến `VITE_` hoặc
chat. Backend demo hiện dùng SQLite trên ổ tạm: cần lưu trữ bền vững trước khi
cho người dùng tạo tài khoản quan trọng hoặc thanh toán thật.
