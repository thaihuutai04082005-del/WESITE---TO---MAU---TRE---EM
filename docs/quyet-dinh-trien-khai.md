# Các quyết định khi triển khai

Tài liệu này ghi lại những điểm **kế hoạch gốc (`ke-hoach-web-to-mau.md`) chưa nói rõ**, cùng giá trị mặc định đã chọn khi code. Mọi con số đều nằm ở một chỗ (`backend/src/config/constants.js` hoặc biến môi trường), đổi được mà không cần sửa logic.

## 1. Thẻ Gacha dùng để làm gì?
- Mỗi thẻ là **một bức tranh hiếm** được mở khoá để tô, đồng thời là vật sưu tầm trong Bộ sưu tập.
- Mỗi đối tượng (25 đối tượng) có 4 tranh thẻ, độ chi tiết tăng theo cấp: **C** "đội mũ tiệc", **B** "với bóng bay", **A** "dưới cầu vồng", **S** "vương miện hoàng gia". Tổng cộng 100 thẻ.
- Chỉ người đang sở hữu thẻ mới mở/tô được tranh đó. Admin mở được mọi tranh.
- Bóc trùng tranh vẫn nhận thêm một bản thẻ. Bản thừa dùng để tặng hoặc đổi với bạn bè.

## 2. Tính lượt tô (gói Free/Tháng/Năm)
- Chỉ tính **1 lượt khi bé thực hiện thao tác tô đầu tiên** trên một tranh mới (đổ màu, nét cọ, sticker…). Mở hoặc xem tranh thì không tính.
- Tô tiếp một tranh dở (kể cả qua ngày) **không tính thêm lượt**.
- **Đấu trường** và **Tô cùng nhau** không tính lượt: đây là hoạt động thi đấu/xã hội, không muốn chặn bé tham gia.
- Gói Free tính theo **ngày giờ Việt Nam** (reset lúc 0h UTC+7).
- Gói Tháng: 100 lượt trong mỗi kỳ 30 ngày tính từ lúc thanh toán. Gia hạn khi còn hạn thì kỳ mới nối tiếp kỳ cũ, không mất ngày.
- Gói Năm: 365 ngày, không giới hạn lượt. Gia hạn thì cộng dồn. Nếu cùng lúc còn gói Tháng thì ưu tiên áp dụng gói Năm.
- PayPal không hỗ trợ VND nên giá PayPal tính bằng USD: **1,99 USD/tháng, 19,99 USD/năm**.

## 3. Ruby khi thăng Rank
| Bậc | Điểm Rank | Ruby thưởng | Khung Avatar |
|---|---|---|---|
| Đồng | 0 | — (khung khởi điểm) | `avatar-dong` |
| Bạc | 50 | 50 | `avatar-bac` |
| Vàng | 150 | 100 | `avatar-vang` |
| Bạch Kim | 300 | 150 | `avatar-bach-kim` |
| Kim Cương | 500 | 200 | `avatar-kim-cuong` |

## 4. Đấu trường
- **Thời gian mỗi trận:** 10 phút (`ARENA_DURATION_SEC`), có 3 giây đếm ngược trước khi bắt đầu.
- **"Hàng tuần"** được hiểu là **Bảng vàng tuần** (theo tuần ISO, giờ VN). Bé thi được nhiều trận trong tuần.
- **Khung giờ công khai** cho ghép ngẫu nhiên đặt bằng `ARENA_SLOTS` (ví dụ `08:00-11:00,14:00-21:00`). Để trống thì luôn mở.
- **Ghép ngẫu nhiên:** tối đa 10 bé mỗi phòng, ghép theo 3 nhóm trình độ: (Đồng, Bạc) / (Vàng) / (Bạch Kim, Kim Cương).
  - Phòng đủ 10 bé thì bắt đầu ngay.
  - Nếu chưa đủ, sau `ARENA_LOBBY_WAIT_SEC` giây (mặc định 60) phòng sẽ bắt đầu khi có ít nhất `ARENA_MIN_PLAYERS` bé (mặc định 2). Nếu vẫn chưa đủ thì tiếp tục chờ thêm.
- **Phòng riêng:** chỉ **bạn bè của chủ phòng** vào được (an toàn cho trẻ). Chủ phòng tự bấm bắt đầu khi có từ 2 bé.
- **Hết giờ mà chưa nộp:** bài được chấm theo bản tự lưu gần nhất (client gửi lên mỗi 8 giây).
- **"Tham gia Đấu trường"** (dùng cho nhiệm vụ) = đã nộp bài có tô ít nhất 1 vùng, không xét thắng thua. Bài thi được lưu vào Lịch sử của bé.

## 5. Rubric chấm điểm tự động (0–100)
Chấm hoàn toàn trên dữ liệu số: danh sách vùng + màu, cộng với nét Brush. Không dùng AI thị giác.

| Tiêu chí | Trọng số | Cách tính |
|---|---|---|
| Độ phủ màu | 20% | Diện tích **hiển thị** của các vùng đã tô chia cho tổng diện tích |
| Độ chính xác đường nét | 15% | Chỉ xét nét Brush. **Lem** = phần nét nằm ngoài vùng bắt đầu nét, có dung sai = nửa độ dày nét + 3px. Lem ≤10% đạt điểm tối đa, ≥60% được 0 điểm, ở giữa giảm tuyến tính. Nét đã bị tẩy thì không tính. **Bucket fill không bao giờ bị tính lem.** |
| Phối màu hài hoà | 20% | Xét tối đa 6 màu chiếm diện tích lớn nhất, chấm từng cặp theo khoảng cách sắc độ (hue): tương đồng ≤30°, bộ ba 100–140°, bổ túc >140° được điểm cao; vùng "chỏi" 60–100° bị trừ. Màu trung tính hợp với mọi màu. Chiếm 80% điểm tiêu chí. 20% còn lại là **điểm nhấn**: có một màu phụ (2–30% diện tích) tương phản với màu chủ đạo. |
| Sáng tạo & khác biệt | 25% | Với mỗi vùng bé đã tô, đo khoảng cách màu của bé tới **màu trung bình các bạn khác** dùng cho cùng vùng đó, lấy trung bình theo diện tích, rồi nhân với hệ số độ phủ. Phòng chỉ có 1 bé thì so với bảng màu gợi ý. |
| Đa dạng sắc độ | 10% | Số nhóm màu khác nhau (12 dải sắc × 3 mức sáng, màu trung tính tách riêng). Dùng 6 nhóm trở lên là đạt tối đa. |
| Thời gian | 10% | Chỉ tính khi độ phủ ≥80% **và** độ gọn nét ≥50%. Điểm = 1 − thời gian dùng / thời lượng trận. |

**Chống gian lận** (`backend/src/services/antiCheat.js`). Bài bị gắn cờ vẫn được chấm để hiển thị nhưng **không được xếp hạng**:
- Tô gần kín tranh (≥90%) trong thời gian ngắn hơn max(20 giây, số vùng × 0,7 giây): quá nhanh.
- Hơn 12 thao tác trong 1 giây (server tự ghi thời điểm từng thao tác): thao tác dồn dập.
- Số vùng đã tô vượt xa số thao tác server ghi nhận: dữ liệu được chèn từ ngoài giao diện tô.

## 6. Đăng nhập Google (≥13 tuổi)
- Người dùng phải **tự xác nhận đủ 13 tuổi** (checkbox) trước khi bấm nút Google. Server từ chối nếu thiếu xác nhận này.
- Tài khoản Google **không cần OTP phụ huynh**, vì theo kế hoạch đây là lối tắt dành cho người trên 13 tuổi.
- Server xác minh ID token qua `oauth2.googleapis.com/tokeninfo` và kiểm tra `aud == GOOGLE_CLIENT_ID`.

## 7. Cơ sở dữ liệu
- **SQLite** qua module `node:sqlite` có sẵn trong Node ≥22.5: không cần cài máy chủ CSDL, không có dependency native.
- Migration là các file SQL thuần trong `database/migrations/`, nên chuyển sang PostgreSQL chủ yếu chỉ cần đổi lớp `config/db.js`.
- Khi chạy nhiều máy chủ (scale ngang) cần chuyển sang PostgreSQL và dùng Redis adapter cho Socket.io. Hiện phòng Đấu trường/phòng tô chung nằm trong bộ nhớ của 1 tiến trình.

## 8. Phạm vi
Đã triển khai **toàn bộ** Mục 1–17 của kế hoạch. Mục 18 (Roadmap) để làm sau.

## 9. Các chi tiết khác
- **Level:** 20 cấp × 3 nhiệm vụ (`database/seeds/missions.js`). Cấp 1–5 là nhiệm vụ dễ (10 Ruby), cấp 6–15 trung bình (20 Ruby), cấp 16–20 khó (30 Ruby).
  - Nhiệm vụ dạng đếm chỉ đếm hoạt động **kể từ khi lên cấp hiện tại**.
  - "Thử 1 chủ đề mới" tự hoàn thành nếu bé đã thử hết các chủ đề.
- **Trading:**
  - Mỗi bé được gửi tối đa 3 đề nghị tặng/đổi mỗi ngày (tính đề nghị đang chờ và đã thành công; đề nghị bị từ chối hoặc đã huỷ không tính).
  - Thẻ đang nằm trong một đề nghị chờ thì bị khoá, không đem giao dịch khác được.
  - Khi người nhận đồng ý, server kiểm tra lại quyền sở hữu thẻ trong cùng transaction.
  - Huỷ kết bạn thì các đề nghị đang chờ giữa hai bé tự huỷ.
- **Kết bạn:** chỉ qua mã mời 8 ký tự. Hai bé cùng nhập mã của nhau thì trở thành bạn ngay.
- **Tên hiển thị:** không được chứa số điện thoại (6 chữ số liên tiếp trở lên) hoặc email.
- **OTP:** 6 số, hết hạn sau 10 phút, sai tối đa 5 lần. Mỗi địa chỉ nhận chỉ được gửi 1 mã mỗi 45 giây. Server chỉ lưu hash của mã.
  - Chưa cấu hình SMTP/SMS thì mã được in ra console, và trả về trong response nếu `EXPOSE_DEV_OTP=true` (mặc định khi không phải production).
- **Khôi phục mật khẩu:** một SĐT/email phụ huynh có thể gắn với nhiều tài khoản (anh chị em). Sau khi nhập đúng OTP, bé chọn tài khoản cần đặt lại mật khẩu. Server luôn trả cùng một thông điệp, không để lộ việc liên hệ đó có tồn tại hay không.
- **CAPTCHA:** 4 ký tự (bỏ các ký tự dễ nhầm O/0/I/1), vẽ bằng nét path nên bot không đọc được dưới dạng văn bản trong SVG. Dùng 1 lần, hết hạn sau 5 phút.
  - Biến `CAPTCHA_FIXED` chỉ dùng cho test tự động và bị bỏ qua ở production.
- **Lịch sử:** tranh dở không mở lại sau 25 ngày thì nhận thông báo cảnh báo, sau 30 ngày thì tự xoá. Tác vụ dọn dẹp chạy mỗi giờ.
- **Flipbook:** chỉ nhận tranh **Sáng tạo** đã hoàn thành. Cần ít nhất 2 trang mới đánh dấu "hoàn thành" được. PDF tạo ở server (pdfkit + font Nunito/Baloo 2 hỗ trợ tiếng Việt). Link chia sẻ chỉ cho xem, có thể thu hồi.
- **Tô cùng nhau:** mỗi bé chỉ Undo được thao tác của chính mình. Khi bấm "Lưu tranh chung", tranh được lưu vào Lịch sử của mọi bé đang ở trong phòng.
- **Thanh toán giả lập:** khi PayPal/MoMo chưa cấu hình và `PAYMENT_MOCK=true` (mặc định ngoài production), giao diện ghi rõ đây là **giao dịch thử nghiệm**. Ở production phải đặt `PAYMENT_MOCK=false`.
