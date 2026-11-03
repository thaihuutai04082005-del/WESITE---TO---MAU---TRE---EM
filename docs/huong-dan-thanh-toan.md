# Thiết lập thanh toán TinyTints

Mã hỗ trợ chuyển khoản VietQR qua SePay (VND, trả từng lần), PayPal Subscriptions (USD, tự gia hạn), và cổng MoMo đối tác (VND, trả từng lần). Ví MoMo cá nhân không thay thế bộ khóa MoMo đối tác. Khả năng quét VietQR bằng một ứng dụng ví phụ thuộc ứng dụng và ngân hàng.

**Chưa bật nhận tiền trên web hiện tại.** Trước khi sửa biến môi trường hoặc triển khai backend, phải có bản sao dữ liệu online và hoàn tất lưu trữ bền vững. SQLite trên ổ tạm Render Free có thể mất khi instance thay thế. File database trên máy localhost không chứa những thay đổi chỉ có trên web online. Xem [lưu dữ liệu lâu dài](luu-du-lieu-lau-dai.md).

## Bắt đầu với chuyển khoản VietQR / SePay

1. Mở https://sepay.vn, đăng ký và kiểm tra ngân hàng, loại tài khoản và gói dịch vụ được hỗ trợ. Giá và điều kiện do SePay/ngân hàng quy định; không mặc định miễn phí.
2. Liên kết tài khoản ngân hàng của chính bạn theo hướng dẫn trong SePay. Xác nhận tên chủ tài khoản và số tài khoản trước khi nhận tiền.
3. Tạo webhook báo **tiền vào**, URL:
   `https://tinytints-api.onrender.com/api/payments/sepay/webhook`
4. Chọn xác thực bằng **API Key** và tự tạo khóa bí mật dài, ngẫu nhiên. Header phía SePay phải là `Authorization: Apikey <khóa>`. Đây là khóa xác thực webhook do bạn đặt; không phải tùy tiện dùng một API token khác của SePay.
5. Khi dữ liệu đã an toàn, nhập các biến sau trong Render → tinytints-api → Environment:

   ```dotenv
   BANK_CODE=<mã ngân hàng, ví dụ ACB hoặc MB>
   BANK_ACCOUNT_NO=<số tài khoản đã liên kết>
   BANK_ACCOUNT_NAME=<tên chủ tài khoản>
   SEPAY_API_KEY=<đúng khóa xác thực webhook>
   # Chỉ thêm BANK_BIN nếu ngân hàng chưa có trong danh sách mã hỗ trợ.
   ```

Web tạo số tiền và mã nội dung riêng cho từng đơn. Chỉ ghi nhận khi callback đúng khóa, đúng tài khoản nhận, có mã giao dịch hợp lệ và số tiền đủ. Thông báo trùng không cộng thêm gói. Đơn thử nghiệm không nhận callback tiền thật. Không hiển thị QR số tài khoản mẫu khi chưa cấu hình.

## PayPal Business

1. Đăng ký PayPal Business, hoàn tất xác minh và điều kiện nhận tiền của PayPal.
2. Trong https://developer.paypal.com → Apps & Credentials, tạo app **Sandbox** để thử trước. Dùng tài khoản người mua Sandbox riêng.
3. Tạo webhook trong cùng app, URL:
   `https://tinytints-api.onrender.com/api/payments/paypal/webhook`
   Chọn sự kiện kích hoạt/hủy/tạm dừng/hết hạn thuê bao và `PAYMENT.SALE.COMPLETED`. Lưu cả **Webhook ID**.
4. Biến môi trường cho môi trường thử riêng:

   ```dotenv
   PAYPAL_CLIENT_ID=<Client ID của app>
   PAYPAL_CLIENT_SECRET=<Secret của app>
   PAYPAL_WEBHOOK_ID=<Webhook ID trong cùng app>
   PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
   ```

5. Sau khi thử thành công và chuẩn bị chạy thật, tạo app/webhook trong **Live**, thay toàn bộ bộ khóa cùng Webhook ID, đổi `PAYPAL_API_BASE=https://api-m.paypal.com`. Production từ chối cấu hình Sandbox.

Không bắt buộc đặt `PAYPAL_PLAN_MONTH` / `PAYPAL_PLAN_YEAR`: web tự tạo gói từ giá trong `backend/src/config/constants.js`. Nếu dùng gói tạo sẵn, phải đúng giá, tiền tệ và chu kỳ. Giá mỗi thuê bao được lưu theo đơn tạo ban đầu.

Web xác thực chữ ký thông báo qua PayPal rồi hỏi lại lịch sử giao dịch; chỉ capture `COMPLETED` đúng số tiền và USD mới mở VIP. Chỉ đồng ý thuê bao hoặc trạng thái `ACTIVE` không đủ chứng minh đã trả tiền. Mỗi mã giao dịch được ghi nhận một lần. Hủy tự gia hạn giữ quyền dùng đến hết kỳ đã cấp. Hoàn tiền/tranh chấp cần đối soát và xử lý quyền sử dụng riêng; chưa có luồng tự động thu hồi quyền sau hoàn tiền.

## MoMo đối tác

Đăng ký và được MoMo duyệt tài khoản merchant trên https://business.momo.vn. Bộ khóa test/live do MoMo cấp phải khớp môi trường. Không dùng số điện thoại ví cá nhân làm partner code.

```dotenv
MOMO_PARTNER_CODE=<partner code>
MOMO_ACCESS_KEY=<access key>
MOMO_SECRET_KEY=<secret key>
MOMO_ENDPOINT=https://payment.momo.vn/v2/gateway/api/create
```

Callback IPN: `https://tinytints-api.onrender.com/api/payments/momo/ipn`. Địa chỉ trở về do web tạo: `https://tinytints.pages.dev/payment/result?paymentId=<mã đơn>`. Backend kiểm tra HMAC, partner, đơn, request ID, số tiền và mã giao dịch; không tin riêng trạng thái trên URL trình duyệt. Môi trường test riêng dùng `https://test-payment.momo.vn/v2/gateway/api/create`; production từ chối endpoint test.

## Địa chỉ và chế độ production

```dotenv
NODE_ENV=production
PAYMENT_MOCK=false
PUBLIC_URL=https://tinytints.pages.dev
API_PUBLIC_URL=https://tinytints-api.onrender.com
CORS_ORIGINS=https://tinytints.pages.dev
```

`PUBLIC_URL` là frontend, `API_PUBLIC_URL` là backend để nhận webhook. Không gửi khóa trong chat, đưa vào Git hoặc mã frontend. Chưa đủ cấu hình thì phương thức thanh toán bị khóa. Production không cho hoàn tất giả lập; chỉ môi trường phát triển mới có thể bật `PAYMENT_MOCK=true`.

## Kiểm tra trước khi nhận tiền

Sau khi có dữ liệu bền vững và cấu hình hợp lệ:

- Thử ở môi trường test riêng: đã trả tiền, chưa trả, sai số tiền, webhook sai chữ ký, webhook trùng, người khác không xem được đơn; lỗi mạng giữ trạng thái chờ để kiểm tra lại.
- Chạy một giao dịch live có kiểm soát bằng tài khoản người mua hợp lệ. Đối chiếu tiền nhận trong ngân hàng/cổng, payment đã trả và gói của đúng người mua. Thử gửi lại webhook để chắc chắn không gia hạn lần hai.
- Với PayPal, kiểm tra hủy tự gia hạn và kỳ gia hạn trong Sandbox. Theo dõi webhook lỗi và đối soát lịch sử provider khi có vấn đề. Render Free có thể ngủ, làm xác nhận đến chậm.

Test tự động trong repo giả lập phản hồi từ nhà cung cấp; chưa xác nhận merchant của bạn đã được duyệt hay tiền thật đã về. Việc triển khai và thử live chỉ thực hiện sau khi giải quyết lưu trữ dữ liệu hiện có.
