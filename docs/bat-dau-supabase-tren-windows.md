# Bắt đầu trên Windows — chỉ kiểm tra, chưa chuyển web online

1. Tạo **bản sao thư mục dự án `web-to-mau`**, ví dụ `web-to-mau-supabase-test`.
   Giữ cả dự án gốc và bản dự phòng `backend/data` bạn đã sao chép trước đó.
2. Giải nén gói cập nhật vào **bản sao thử**, để `package.json` trong ZIP cùng chỗ
   với `package.json` gốc của bản sao. Chọn thay thế file mã khi Windows hỏi.
   Không thay `.env`, `backend/data` hoặc thư viện hình ảnh.
3. Mở thư mục gốc của bản sao thử, bấm thanh địa chỉ File Explorer, gõ `cmd`,
   Enter. Trong cửa sổ lệnh chạy `npm ci` và đợi hoàn tất. Nên dùng Node 24 LTS.
4. Mở `backend/.env` của bản sao bằng Notepad. Thêm/sửa đúng một dòng mỗi tên:

   ```dotenv
   DATABASE_URL=CHUOI_SESSION_POOLER_BAN_DA_LUU
   PGPASSWORD="MAT_KHAU_DATABASE_BAN_DA_LUU"
   ```

   Thay nội dung bên phải dấu `=` bằng giá trị riêng của bạn. Có thể giữ
   `[YOUR-PASSWORD]` trong URI khi đã nhập mật khẩu đúng ở `PGPASSWORD`.
   Không nhầm mật khẩu database với mật khẩu PayPal. Nhấn Ctrl+S.
5. Quay lại cửa sổ lệnh ở thư mục gốc bản sao, chạy `npm run db:check`.
   Nếu thành công, kết quả có `connected: true`. Có thể gửi ảnh phần kết quả này,
   **không chụp nội dung `.env` hoặc chuỗi có mật khẩu**.
6. **Dừng ở đây:** chưa chạy web mới, nhập dữ liệu hay đổi cấu hình Render.
   Dữ liệu chỉ có trên Render vẫn cần được xuất; bản localhost không thay thế
   dữ liệu online. Hướng dẫn đối chiếu và nhập nằm trong `luu-du-lieu-lau-dai.md`.

Gói cập nhật là mã nguồn dùng cùng dự án sẵn có, không phải bản sao database hay
bộ hình ảnh. Các file mới trong ZIP không tự đồng bộ vào GitHub/Render/Cloudflare.

Không bấm `chay-web.bat` cũ trong lúc thử: file đó có thể tự cập nhật từ GitHub
và làm thay đổi bộ mã đang kiểm tra. Khi đã chuyển dữ liệu và được kiểm tra xong,
dùng `npm run dev` để chạy bản thử mà không tự kéo mã từ GitHub.
