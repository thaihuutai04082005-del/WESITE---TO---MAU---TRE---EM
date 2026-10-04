# Hướng dẫn bật thanh toán thật

Web có 2 cách trả tiền cho Gói Tháng / Gói Năm:

| Cách | Tiền tệ | Tự gia hạn? | Tiền về đâu |
|---|---|---|---|
| **Quét QR / chuyển khoản** (app ngân hàng hoặc MoMo) | VNĐ | Không — web nhắc trước khi hết hạn 3 ngày | Thẳng vào ACB 35391537 |
| **PayPal** | USD | Có — tự trừ mỗi kỳ như ChatGPT/Claude, huỷ lúc nào cũng được | Ví PayPal → rút về ACB 35391537 |

Chưa điền khoá nào thì web chạy chế độ **giả lập** (có nút "Hoàn tất giả lập") để thử.

> ⚠️ **Bắt buộc:** web phải được đưa lên mạng với tên miền **https** (ví dụ `https://betomau.vn`).
> PayPal và SePay cần gọi vào web để báo "đã nhận tiền". Họ không gọi được vào máy tính
> đang chạy `chay-web.bat` ở nhà.

Bên dưới, `API_PUBLIC_URL` là địa chỉ web đã đưa lên mạng.

---

## 1. Quét QR → tiền vào ACB (dùng SePay)

QR đã có sẵn số tài khoản, số tiền và nội dung (dạng `BTMxxxxxx`). SePay đọc biến động số dư ACB và báo cho web. Web khớp mã nội dung rồi mở gói ngay, thường dưới 1 phút.

1. Đăng ký tại **https://sepay.vn**, rồi liên kết tài khoản **ACB 35391537** (SePay hướng dẫn từng bước).
2. Vào **Tích hợp WebHooks → Thêm webhook**:
   - **URL:** `API_PUBLIC_URL/api/payments/sepay/webhook`
   - **Kiểu chứng thực:** `API Key`. Tự đặt một chuỗi bí mật dài, ví dụ `bTm-9f3k...`.
   - **Sự kiện:** chỉ chọn *Tiền vào*.
3. Điền vào `backend/.env`:
   ```
   SEPAY_API_KEY=<chuỗi bí mật vừa đặt>
   BANK_ACCOUNT_NAME=<TEN CHU TAI KHOAN IN HOA KHONG DAU>
   ```

Nếu phụ huynh chuyển thiếu tiền, gói **không** mở. Cũng nên kiểm tra lại tài khoản trong trang quản trị.

## 2. PayPal tự gia hạn (USD)

1. Tạo tài khoản **PayPal Business** tại https://www.paypal.com/vn/business. Liên kết thẻ hoặc tài khoản **ACB 35391537** để rút tiền.
2. Vào **https://developer.paypal.com → Apps & Credentials**, chọn tab **Live**, bấm **Create App**. Chép **Client ID** và **Secret**.
3. Trong app vừa tạo, vào **Webhooks → Add Webhook**:
   - **URL:** `API_PUBLIC_URL/api/payments/paypal/webhook`
   - **Sự kiện:** chọn `Billing subscription *` (activated, cancelled, suspended, expired) và `Payment sale completed`.
4. Điền vào `backend/.env`:
   ```
   PAYPAL_CLIENT_ID=<Client ID>
   PAYPAL_CLIENT_SECRET=<Secret>
   PAYPAL_API_BASE=https://api-m.paypal.com
   ```
   Không cần tạo gói trong PayPal: web tự tạo Gói Tháng ($1.99) và Gói Năm ($19.99) ở lần thanh toán đầu tiên.

Mỗi kỳ PayPal tự trừ tiền và web tự cộng thêm 1 tháng hoặc 1 năm. Phụ huynh bấm **"Huỷ tự gia hạn"** ở trang *Gói* thì vẫn dùng hết kỳ đã trả. Tiền nằm trong ví PayPal; vào PayPal bấm **Rút tiền** để chuyển về ACB.

## 3. Bật chạy thật

Trong `backend/.env`:
```
NODE_ENV=production
PAYMENT_MOCK=false
PUBLIC_URL=https://<tên miền web>
API_PUBLIC_URL=https://<tên miền web>
```
Sau đó khởi động lại web. Nên tự mua thử Gói Tháng một lần bằng cả hai cách để chắc chắn tiền về đúng chỗ.

## Giá

Giá nằm trong `backend/src/config/constants.js` (mục `PLANS`): VNĐ cho QR, USD cho PayPal. Đổi giá USD thì web tự tạo gói PayPal mới cho người đăng ký sau. Người đang đăng ký vẫn giữ giá cũ.
