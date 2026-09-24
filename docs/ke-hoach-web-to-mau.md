# 🎨 KẾ HOẠCH SẢN PHẨM: WEB TÔ MÀU CHO TRẺ EM

*Phiên bản hoàn chỉnh — tổng hợp toàn bộ nội dung đã thống nhất, đủ chi tiết để triển khai code.*

---

## 1. Tổng quan sản phẩm

Một nền tảng web tô màu dành cho trẻ em, không chỉ dừng ở việc "tô cho vui" mà được xây dựng thành một **hệ sinh thái sáng tạo — giáo dục — giải trí** hoàn chỉnh: có thư viện tranh phong phú theo cấu trúc phân tầng, công cụ tô màu chuyên nghiệp không thua kém các app tô màu hiện hành, hệ thống tài khoản/gói dịch vụ thương mại hóa được, hệ thống tiến trình (Level/Rank/Ruby) tạo giá trị lâu dài cho tài khoản, và các tính năng thi đua — xã hội — sưu tầm để giữ chân trẻ quay lại sử dụng mỗi ngày.

### 1.1. Điểm nổi bật khác biệt so với thị trường

| # | Điểm nổi bật | Vì sao đặc biệt |
|---|---|---|
| 1 | **Đấu trường sáng tạo hàng tuần** với rubric chấm điểm tự động | Đa số app tô màu không có yếu tố thi đua thời gian thực có chấm điểm minh bạch |
| 2 | **Hệ thống thẻ hiếm (Gacha S/A/B/C)** gắn với thành tích thi đấu | Biến việc tô màu thành hành trình sưu tầm có động lực dài hạn, không phải trả tiền để mở khóa |
| 3 | **Hệ thống Level — Rank — Ruby — Shop** tách biệt rõ ràng | Tạo nhiều lớp giá trị cho 1 tài khoản (thành tích thi đấu, động lực chơi liên tục, tài sản trực quan), khiến tài khoản "có tuổi đời" trở nên quý giá, giảm tình trạng bỏ tài khoản tùy tiện |
| 4 | **Tô màu cùng nhau theo thời gian thực (Collaborative Coloring)** | Rất hiếm nền tảng tô màu trẻ em có tính năng multiplayer thật sự |
| 5 | **Đóng thành cuốn truyện tranh Flipbook** từ các tranh sáng tạo của bé | Biến các bức tranh rời rạc thành một sản phẩm kể chuyện có ý nghĩa, đọc lại như một cuốn sách của riêng bé |
| 6 | **Tranh sống (Animated Reveal)** khi hoàn thành | Phần thưởng thị giác bất ngờ, tạo cảm xúc hoàn thành rõ rệt hơn ảnh tĩnh thông thường |
| 7 | **Trao đổi thẻ giữa bạn bè** (có giới hạn & xác nhận 2 chiều) | Tương tác xã hội lành mạnh, không quy đổi tiền thật, an toàn cho trẻ em |
| 8 | **Hai lớp khung trang trí riêng biệt** (Khung Avatar theo Rank + Khung Artwork mua bằng Ruby) | Sản phẩm cuối giống một tấm thiệp/tranh treo tường hoàn chỉnh, đồng thời avatar thể hiện thành tích thi đấu rõ ràng |
| 9 | **Cấu trúc nội dung 3 tầng có hình ảnh minh họa thật ở mỗi tầng** | Giúp bé dễ hình dung và chọn đúng tranh mình thích thay vì duyệt danh sách tên/icon khô khan |

### 1.2. Tiêu chí đánh giá dự án

| Tiêu chí | Mô tả |
|---|---|
| **Tính khả thi kỹ thuật** | Các tính năng đề xuất có thể triển khai được với công nghệ hiện tại (web, real-time, backend, thanh toán), không viển vông |
| **Tính sáng tạo & khác biệt** | Sản phẩm có điểm mới lạ so với các app/web tô màu hiện hành trên thị trường (đã liệt kê ở mục 1.1) |
| **Giá trị giáo dục** | Sản phẩm không chỉ giải trí mà còn hỗ trợ phát triển nhận thức màu sắc, tư duy sáng tạo, kỹ năng cho trẻ |
| **Trải nghiệm người dùng (UX) phù hợp trẻ em** | Giao diện đơn giản, trực quan, thao tác dễ dùng với đối tượng là trẻ nhỏ, tối ưu cho thiết bị cảm ứng |
| **Tính khả thi thương mại** | Mô hình gói dịch vụ (Free/Tháng/Năm) và thanh toán hợp lý, có khả năng vận hành như 1 sản phẩm thật |
| **An toàn cho trẻ em** | Các tính năng xã hội (kết bạn, trading, tô cùng nhau) được thiết kế an toàn, có xác minh phụ huynh, không rủi ro tương tác xấu |
| **Khả năng mở rộng** | Cấu trúc hệ thống (nội dung 3 tầng, i18n, folder structure module hóa) cho phép phát triển thêm về sau mà không phải làm lại từ đầu |

---

## 2. Cấu trúc nội dung tranh tô màu (3 tầng)

Nội dung tranh được tổ chức theo 3 tầng, mỗi tầng đều hiển thị **hình ảnh minh họa thật** (không chỉ tên chữ hoặc icon) để bé dễ nhận diện và lựa chọn:

```
Tầng 1: CHỦ ĐỀ LỚN
   (Động vật, Xe cộ, Thiên nhiên, Trái cây, Nhà cửa, ...)
        │
        ▼
Tầng 2: ĐỐI TƯỢNG CỤ THỂ
   (Trong "Động vật": Mèo, Chó, Thỏ, Voi, Gấu...)
   → mỗi đối tượng hiển thị 1 tranh minh họa đại diện
        │
        ▼
Tầng 3: BIẾN THỂ TƯ THẾ / CẢM XÚC / HOẠT ĐỘNG
   (Trong "Mèo": Mèo liếm lông, Mèo tức giận,
    Mèo vui vẻ, Mèo ngủ, Mèo chạy nhảy...)
        │
        ▼
   MÀN HÌNH TÔ MÀU (chọn 1 trong 2 chế độ tô)
```

- Danh sách chủ đề khởi điểm: **Động vật, Xe cộ, Thiên nhiên, Trái cây, Nhà cửa** (mở rộng thêm theo lộ trình phát triển).
- Quy mô nội dung khởi điểm và quy trình sản xuất: xem **Mục 12 — Nội dung tranh & Vận hành**.

---

## 3. Hai chế độ tô màu & Kiến trúc vùng tô

### 3.1. Nguyên tắc chung: tranh luôn có vùng cố định

Mọi tranh trong hệ thống — dù ở chế độ nào — đều được xây dựng từ **1 file vector (SVG) có các vùng (path) được phân định sẵn, bao gồm cả vùng nền**. Ảnh nào cũng có vùng nền để tô, không có khái niệm "không giới hạn vùng" theo nghĩa không có vùng nào cả. Đây là nền tảng kiến trúc dùng chung cho cả 2 chế độ, cho công cụ Bucket fill, và cho engine chấm điểm ở Đấu trường sáng tạo.

### 3.2. Tô theo mẫu (Paint by Number)
- Hiển thị **1 tranh mẫu đã tô hoàn chỉnh** bên cạnh màn hình tô để bé nhìn theo.
- Mỗi vùng trong tranh được **gán sẵn 1 số** tương ứng với 1 màu cụ thể trong bảng màu (ví dụ: số 1 = đỏ, số 2 = vàng).
- Mục tiêu: sản phẩm cuối cùng giống với tranh mẫu.
- **Không chặn khi tô sai màu** — bé được tô thoải mái theo ý mình, hệ thống không ép buộc hay cảnh báo lỗi.
- Chế độ này **không tính vào Đấu trường sáng tạo** (vì có mẫu sẵn, không phản ánh sự sáng tạo cá nhân).

### 3.3. Sáng tạo (Free Coloring)
- Vẫn dùng chung cấu trúc vùng như mục 3.1 (kể cả vùng nền), nhưng **không gán màu bắt buộc cho vùng nào** — bé thích tô vùng nào màu gì cũng được, kể cả vùng nền, không có tranh mẫu đi kèm.
- Đây là chế độ **duy nhất được tính điểm** trong Đấu trường sáng tạo hàng tuần và dùng để đóng thành cuốn truyện tranh Flipbook.

### 3.4. Định nghĩa "tô lem" (áp dụng cho rubric chấm điểm ở Mục 9.2)

- **Bucket fill** (đổ màu trọn 1 vùng theo path có sẵn) **không bao giờ được tính là lem**, vì bản chất là tô trọn vẹn theo đường viền đã định sẵn của vùng đó — kể cả khi bé tô kín toàn bộ vùng nền.
- **"Lem" chỉ áp dụng cho nét vẽ bằng Brush tự do** (xem Mục 4.2): là phần trăm nét Brush nằm tràn ra ngoài phạm vi vùng liên quan một cách không đều, vượt quá một ngưỡng cho phép, trông cẩu thả/dơ. Brush vẽ thêm chi tiết gọn gàng trong hoặc sát vùng liên quan (ví dụ vẽ vân lông mèo) không bị tính là lem.

---

## 4. Bộ công cụ tô màu (đầy đủ chuẩn các app tô màu hiện hành)

### 4.1. Nhóm màu sắc
- Bảng màu preset mở rộng, đa dạng.
- Color picker đầy đủ — chọn màu tùy ý ngoài bảng preset.
- Danh sách **màu vừa dùng gần đây**.
- Lưu **màu yêu thích** (custom favorites).

### 4.2. Nhóm công cụ tô
- **Tô đổ (Bucket fill)**: click vào 1 vùng (path) là tô kín toàn vùng đó — không bao giờ lem (xem Mục 3.4).
- **Bút vẽ tự do (Brush/Pencil)**: vẽ trên **1 lớp riêng (canvas layer) đè lên trên lớp vùng SVG**, dùng để thêm chi tiết tự do (vân lông, họa tiết...) không bị ràng buộc theo vùng. Đây là lớp duy nhất được tính "lem" khi chấm điểm rubric.
- **Tẩy (Eraser)**: xóa nét trên lớp Brush.
- **Điều chỉnh độ dày nét bút (Brush size)**.

### 4.3. Nhóm thao tác chỉnh sửa
- **Undo / Redo**.
- **Zoom** (phóng to/thu nhỏ), hỗ trợ cử chỉ chụm/mở 2 ngón tay trên thiết bị cảm ứng.
- **Xóa hết, tô lại từ đầu**.

### 4.4. Nhóm xuất/lưu sản phẩm
- Lưu tranh thành ảnh **PNG**.
- **In tranh** trực tiếp.
- **Tùy biến Khung Artwork** khi xuất file — mua bằng Ruby trong Shop (xem Mục 8.4–8.5), gắn quanh tranh khi tải về/in, biến sản phẩm thành như thiệp/tranh treo tường.

### 4.5. Nhóm vui nhộn / phần thưởng thị giác
- **Sticker/hình dán trang trí** thêm vào tranh.
- **Hiệu ứng lấp lánh/nhũ** khi tô (kiểu tô màu kim cương).
- **Tranh sống (Animated Reveal)**: sau khi hoàn thành 1 tranh, tranh có hiệu ứng chuyển động nhẹ phù hợp chủ thể (cá "bơi" nhẹ, hoa "đung đưa"...).

---

## 5. Hệ thống tài khoản

### 5.1. Hai cách đăng ký / đăng nhập

**Cách 1 — Đăng ký thường (không cần Gmail, dành cho mọi độ tuổi, kể cả dưới 13):**
1. Bấm "Đăng ký" → điền **Tên đăng nhập** + **Mật khẩu** + **Mã xác nhận (CAPTCHA)** dạng ký tự ngẫu nhiên (ví dụ "YKH6") để chống bot.
2. Chọn nhập **1 trong 2**: **Số điện thoại** hoặc **Email (Gmail) của phụ huynh** — chỉ dùng để khôi phục mật khẩu, không dùng làm tên đăng nhập.
3. Hệ thống gửi **mã OTP xác nhận** đến SĐT/email vừa nhập → phải nhập đúng mã OTP mới hoàn tất đăng ký (đảm bảo sau này khôi phục mật khẩu gửi đúng đến người giám hộ).
4. Đăng ký thành công → chuyển về màn hình **Đăng nhập**.
5. Nhập đúng tên đăng nhập + mật khẩu → đăng nhập thành công → lần đầu vào, đặt **tên hiển thị (nickname)**.

**Cách 2 — Đăng nhập/Đăng ký bằng Gmail (tùy chọn, dành cho người trên 13 tuổi):**
- Liên kết nhanh bằng chính tài khoản Google của người dùng, không cần qua bước tạo tên đăng nhập/mật khẩu thủ công.

### 5.2. Khôi phục mật khẩu
- Người dùng nhập SĐT/email phụ huynh đã xác minh lúc đăng ký → hệ thống gửi mã khôi phục đến đúng kênh đó → đặt lại mật khẩu mới.

---

## 6. Gói dịch vụ & Thanh toán

### 6.1. Ba gói dịch vụ

| Gói | Giá | Giới hạn tô |
|---|---|---|
| **Free (miễn phí)** | 0đ | Tối đa **1 ảnh/ngày** |
| **Gói Tháng** | **49.000đ/tháng** | Tối đa **100 ảnh/tháng** (~3 ảnh/ngày) |
| **Gói Năm** | **499.000đ/năm** | **Không giới hạn** số ảnh |

> Tỉ lệ giá được cân đối để gói Năm có lý do rõ ràng tồn tại: 49.000đ × 12 tháng = 588.000đ, so với 499.000đ chỉ giảm ~15% (đúng chuẩn "tặng gần 2 tháng" phổ biến trong mô hình subscription) — tránh tình trạng gói Tháng quá hào phóng khiến không ai cần lên gói Năm.

### 6.2. Quy tắc tính lượt tô cho gói Free
- **Chỉ tính là đã dùng 1 lượt trong ngày** khi người dùng **thực sự bắt đầu tô** (có ít nhất 1 hành động đổ màu/vẽ brush đầu tiên). Chỉ mở/xem/chọn tranh mà chưa tô thì **không tính**.
- Hết lượt trong ngày → hệ thống **chặn hẳn**, không cho tô thêm, đồng thời **hiển thị màn hình mời nâng cấp gói**.

### 6.3. Cổng thanh toán
- Tích hợp **PayPal** (phù hợp nếu mở rộng thị trường quốc tế) **và bổ sung cổng nội địa MoMo** làm phương thức thanh toán chính cho thị trường Việt Nam.
- Hệ thống backend xử lý thanh toán thật (không phải giao diện demo).

---

## 7. Lịch sử tô (History)

- Lưu lại toàn bộ tranh người dùng đã từng tô, **kể cả tranh đang tô dở**.
- Mỗi tranh có **2 chế độ thao tác**:
  - **Xem**: chỉ xem lại tranh, có nút **Tải về**.
  - **Chỉnh sửa**: mở lại tranh trong màn hình tô màu để **tiếp tục tô** hoặc chỉnh sửa lại.
- **Vòng đời lưu trữ**: tranh **đã hoàn thành lưu vĩnh viễn** (làm nguyên liệu cho Flipbook); tranh **đang dở lưu tối đa 30 ngày** không được đụng tới thì tự động xóa (có thông báo trước khi xóa).

---

## 8. Hệ thống tiến trình tài khoản (Level — Rank — Ruby — Shop)

### 8.1. Tổng quan 4 loại tài sản tài khoản

Đây là cơ chế khiến 1 tài khoản "có tuổi đời" trở nên quý giá, khó bị bỏ đi để tạo tài khoản mới — gồm 4 hệ thống **độc lập, không đá nhau**:

| Loại | Tăng nhờ | Dùng để | Đặc điểm |
|---|---|---|---|
| **Level (Cấp độ)** | Hoàn thành **hết bộ nhiệm vụ** ở cấp hiện tại | Mở bộ nhiệm vụ mới của cấp tiếp theo | Không liên quan thắng/thua thi đấu — bé không thích Đấu trường vẫn lên Level bình thường |
| **Rank (Hạng đấu trường)** | Tích đủ **Điểm Rank** từ thắng giải trong Đấu trường sáng tạo | Ghép phòng thi cùng trình độ, thể hiện thành tích | Chỉ tăng qua thi đấu, **tích lũy vĩnh viễn, không bao giờ bị trừ** |
| **Điểm Gacha** | Cùng nguồn với Điểm Rank (thắng giải Đấu trường) | Bóc thẻ tranh hiếm S/A/B/C | **Bị trừ 50 điểm/lần bóc**, tách biệt hoàn toàn khỏi Điểm Rank nên bóc thẻ không làm tụt hạng |
| **Ruby** | Hoàn thành từng nhiệm vụ lẻ + mỗi lần thăng Rank | Mua skin/khung trong Shop | Tiêu được, không giới hạn tích lũy |

### 8.2. Rank (Hạng đấu trường)

**5 bậc, theo Điểm Rank tích lũy (vĩnh viễn):**

| Bậc | Điểm Rank cần đạt |
|---|---|
| Đồng | 0 – 49 |
| Bạc | 50 – 149 |
| Vàng | 150 – 299 |
| Bạch Kim | 300 – 499 |
| Kim Cương | 500+ |

- Điểm Rank được cộng cùng lúc với Điểm Gacha mỗi khi thắng giải (xem Mục 9.3), nhưng **tiêu Điểm Gacha để bóc thẻ không ảnh hưởng đến Điểm Rank** — hạng không bao giờ bị tụt.
- **Mỗi lần thăng 1 bậc Rank** → mở khóa cố định **1 Khung Avatar** đúng với bậc đó (không phải ngẫu nhiên) + nhận thêm **Ruby**.
- Khung Avatar hiển thị công khai quanh ảnh đại diện tài khoản trong phòng đấu, phòng tô chung, danh sách bạn bè — là minh chứng thành tích.

### 8.3. Level (Cấp độ & Nhiệm vụ)

- **20 cấp khởi điểm**, mỗi cấp có **1 bộ 3 nhiệm vụ**. Hoàn thành **cả 3 nhiệm vụ** trong bộ → chính thức lên cấp tiếp theo (mở bộ nhiệm vụ mới).
- Mỗi nhiệm vụ lẻ hoàn thành → nhận Ruby ngay (không cần chờ đủ cả bộ).
- Ví dụ nhiệm vụ theo từng giai đoạn cấp:
  - **Cấp 1–5 (làm quen)**: "Tô xong 1 tranh", "Đăng nhập 2 ngày liên tiếp", "Thử qua 1 chủ đề mới".
  - **Cấp 6–15 (trung bình)**: "Tô 5 tranh sáng tạo", **"Tham gia Đấu trường sáng tạo 1 lần"** (chỉ cần tham gia và hoàn thành bài tô, không xét thắng/thua), "Dùng thử Brush + Sticker".
  - **Cấp 16–20 (nâng cao)**: **"Tham gia Đấu trường sáng tạo 3 lần"**, "Hoàn thành 1 cuốn Flipbook", "Đạt Rank Bạc trở lên".
- Các nhiệm vụ dạng "tham gia Đấu trường X lần" có vai trò khuyến khích cả những bé nhút nhát/chưa tự tin thi đấu vẫn thử sức ít nhất vài lần, tăng khả năng bé thấy hứng thú và tự nguyện quay lại — đồng thời giảm cảm giác "trắng tay" cho các bé không lọt Top 3 (vẫn có tiến độ nhiệm vụ + Ruby).

### 8.4. Ruby & Shop

- **Ruby từ nhiệm vụ**: nhiệm vụ dễ = 10 Ruby, trung bình = 20 Ruby, khó = 30 Ruby.
- **Ruby từ thăng Rank**: cộng thêm mỗi lần lên bậc (xem Mục 8.2).
- **Giá Shop**: skin cọ vẽ 50–100 Ruby | Khung Artwork thường 100–200 Ruby | Khung Artwork đặc biệt/limited 300–500 Ruby.

### 8.5. Hai loại khung trang trí — không nhầm lẫn

| | **Khung Avatar** | **Khung Artwork** |
|---|---|---|
| Cách có được | Thăng hạng **Rank** trong Đấu trường | Mua bằng **Ruby** trong Shop |
| Gắn ở đâu | Quanh **ảnh đại diện tài khoản** | Quanh **tranh đã tô xong** khi xuất/lưu (Mục 4.4) |
| Ý nghĩa | Minh chứng **thành tích thi đấu** | Thành quả **cày nhiệm vụ**, ai kiên trì đều mua được |

---

## 9. Đấu trường sáng tạo hàng tuần (Weekly Creative Arena)

Chỉ áp dụng cho **chế độ Sáng tạo** (Mục 3.3) — vì đây là chế độ phản ánh đúng sự khác biệt và cá tính riêng của mỗi bé.

### 9.1. Cơ chế phòng thi
- Mỗi phòng gồm **10 thí sinh**.
- Hai hình thức tham gia: **Ghép ngẫu nhiên** (hệ thống tự ghép theo khung giờ công khai) hoặc **Tạo phòng riêng** mời bạn bè.
- Có khoảng thời gian giới hạn được quy định sẵn để hoàn thành tranh.

### 9.2. Rubric chấm điểm tự động (thang điểm 100%)

| Tiêu chí | Trọng số | Mô tả cách chấm |
|---|---|---|
| **Độ phủ màu hoàn thiện** | 20% | Tranh được tô đầy đủ, không bỏ trống mảng lớn |
| **Độ chính xác đường nét** | 15% | Chỉ tính trên nét Brush tự do — xem định nghĩa "lem" ở Mục 3.4 |
| **Phối màu hài hòa** | 20% | Các màu cạnh nhau hài hòa, có điểm nhấn rõ ràng |
| **Sáng tạo & khác biệt** | 25% | So sánh bảng màu của thí sinh với bảng màu trung bình cả phòng — càng độc đáo, ít trùng lặp thì điểm càng cao |
| **Đa dạng sắc độ** | 10% | Sử dụng nhiều tông màu khác nhau thay vì lặp lại 1–2 màu |
| **Thời gian hoàn thành** | 10% | Hoàn thành sớm hơn nhưng vẫn đảm bảo chất lượng được cộng điểm khuyến khích |

> Hệ thống chấm điểm dựa trên dữ liệu số hóa của tranh (danh sách vùng + mã màu đã chọn, cộng thêm dữ liệu nét Brush), không cần AI thị giác — vừa chính xác, vừa tối ưu chi phí xử lý.

### 9.3. Giải thưởng & Điểm Rank/Gacha

| Hạng | Điểm Rank + Điểm Gacha (cộng cùng lúc) |
|---|---|
| 🥇 Nhất | +10 |
| 🥈 Nhì | +8 |
| 🥉 Ba | +6 |

### 9.4. Gacha — Bóc thẻ

- **Mỗi mốc 50 Điểm Gacha** = 1 lượt bóc thẻ, trừ đúng 50 điểm/lần. Có 100 điểm → bóc được 2 lượt liên tiếp; có 130 điểm → bóc 2 lượt, dư 30 điểm giữ lại tích tiếp (không reset).
- Tỉ lệ ra thẻ:

| Cấp thẻ | Tỉ lệ | Mô tả |
|---|---|---|
| **S** | 5% | Siêu hiếm — tranh đẹp và chi tiết nhất |
| **A** | 12% | Hiếm — tranh đẹp |
| **B** | 34% | Thường — tranh mức trung bình khá |
| **C** | 49% | Phổ biến — tranh mở rộng bình thường trong chủ đề |

---

## 10. Tính năng xã hội mở rộng

### 10.1. Tô màu cùng nhau (Collaborative Coloring)
- Nhiều bé (2–4 người) cùng tô chung **1 bức tranh theo thời gian thực**, thấy màu bạn tô hiện lên ngay lập tức.
- **Chỉ vào phòng qua mã phòng riêng** do người tạo chia sẻ trực tiếp — không có chế độ duyệt phòng công khai để người lạ tự do vào.

### 10.2. Đóng cuốn truyện tranh Flipbook (Storybook Maker)
- Gom nhiều tranh đã tô (chế độ Sáng tạo) thành **1 cuốn truyện tranh**.
- Bé **sắp xếp thứ tự trang**, **thêm câu thoại/chú thích** cho từng trang.
- Xem dạng **lật trang (flipbook)**, **tải PDF**, hoặc **chia sẻ**.

### 10.3. Trao đổi/tặng thẻ giữa bạn bè (Card Trading)
- Tặng/đổi thẻ S/A/B/C với bạn trong danh sách kết bạn, không quy đổi tiền thật.
- **Giới hạn 3 lượt tặng/đổi mỗi ngày**, bắt buộc **xác nhận 2 chiều** (cả người tặng lẫn người nhận đều phải đồng ý) để tránh bị ép/gạt.
- **Kết bạn**: chỉ qua **mã mời riêng của từng tài khoản**, không tìm kiếm bằng username công khai — giảm rủi ro người lạ chủ động tiếp cận.

---

## 11. An toàn & Pháp lý cho trẻ em

- **Đăng ký không bắt buộc Gmail**: trẻ dưới 13 tuổi dùng Cách 1 (Mục 5.1), không vướng chính sách độ tuổi của Google. Gmail chỉ là lối tắt tùy chọn cho người trên 13 tuổi.
- **Xác minh phụ huynh qua OTP** ngay lúc đăng ký (SĐT hoặc email) — vừa phục vụ khôi phục mật khẩu, vừa là điểm chạm đầu tiên có xác nhận từ người giám hộ.
- **Phòng tô chung** và **kết bạn** đều qua mã riêng, không công khai — hạn chế người lạ tiếp cận trẻ.
- **Trading thẻ** có giới hạn số lượt/ngày và cần xác nhận 2 chiều.
- **Gacha không quy đổi tiền thật** — hạn chế rủi ro liên quan đến cờ bạc hóa ở trẻ nhỏ.
- *Ghi chú tham khảo:* tại Việt Nam, **Nghị định 13/2023/NĐ-CP** về bảo vệ dữ liệu cá nhân có yêu cầu riêng đối với dữ liệu trẻ em (cần sự đồng ý của cha, mẹ hoặc người giám hộ). Đây là thông tin mang tính tham khảo, không phải tư vấn pháp lý — nên rà soát với luật sư trước khi triển khai chính thức tính năng thu thập dữ liệu trẻ em.

---

## 12. Nội dung tranh & Vận hành (Content Pipeline)

- **Quy mô khởi điểm**: 5 chủ đề × 5 đối tượng × 5 biến thể ≈ **125 tranh gốc** để đủ phong phú khi ra mắt.
- **Quy trình sản xuất**: vẽ bằng công cụ vector (Illustrator/Figma) → xuất SVG có sẵn cấu trúc vùng (path/id) cho từng tranh.
- **Công cụ quản trị (Admin/CMS) nội bộ**: cho phép tải tranh mới lên, gắn theme/object/variant, đánh số vùng — không cần sửa code mỗi lần thêm tranh mới.

---

## 13. Chống gian lận & Vòng đời dữ liệu

- **Chống gian lận Đấu trường**: giới hạn tốc độ hành động — nếu 1 tài khoản hoàn thiện toàn bộ vùng tô trong thời gian bất thường (quá nhanh so với người thường), hệ thống gắn cờ nghi ngờ và loại khỏi bảng xếp hạng của phòng đó.
- **Vòng đời Lịch sử tô**: xem Mục 7 (tranh hoàn thành lưu vĩnh viễn, tranh dở lưu tối đa 30 ngày).

---

## 14. Đa ngôn ngữ (Multi-language)

- Hỗ trợ **chuyển đổi ngôn ngữ giao diện**, khởi điểm: **Tiếng Việt** và **Tiếng Anh** (mở rộng thêm sau tùy định hướng thị trường).
- Nút chuyển ngôn ngữ ở thanh điều hướng chính, ghi nhớ theo tài khoản.
- Toàn bộ text giao diện tách riêng thành file ngôn ngữ (i18n), không hardcode trong code.

---

## 15. Frontend

### 15.1. Tech Stack

| Thành phần | Công nghệ | Lý do |
|---|---|---|
| Framework | **React** (Vite) | Khớp cấu trúc thư mục đã chốt |
| Styling | **TailwindCSS** + font Baloo 2/Nunito | Tốc độ dựng UI nhanh, dễ đồng bộ design system |
| State quản lý | **Zustand** | Nhẹ, đủ dùng cho quy mô dự án |
| Realtime | **Socket.io-client** | Cho tô cùng nhau + phòng Đấu trường |
| Vẽ/Canvas | **SVG thuần** (vùng cố định) + lớp `<canvas>` riêng cho Brush tự do | Khớp kiến trúc vùng tô đã chốt (Mục 3–4) |
| Đa ngôn ngữ | **react-i18next** | Khớp cấu trúc `i18n/vi.json, en.json` |
| Thanh toán | SDK PayPal + SDK MoMo | Khớp Mục 6.3 |

### 15.2. Sơ đồ toàn bộ màn hình (Site Map)

**A. Xác thực & Hồ sơ**: Trang chủ · Đăng ký (form + CAPTCHA + SĐT/Gmail phụ huynh + OTP) · Đăng nhập (thường/Gmail) · Đặt tên hiển thị (lần đầu) · Quên mật khẩu · Hồ sơ cá nhân (avatar + khung avatar + Level/Rank hiện tại)

**B. Chọn tranh (3 tầng)**: Chủ đề lớn → Đối tượng → Biến thể tư thế → Chọn chế độ (Theo mẫu/Sáng tạo)

**C. Màn hình tô màu**: Canvas + Toolbar (màu, brush, eraser, size, undo/redo, zoom, sticker, lấp lánh) · Tranh mẫu kèm theo (chế độ Theo mẫu) · Màn hình Tranh sống khi hoàn thành

**D. Lịch sử & Sản phẩm**: Danh sách lịch sử (lọc Dở/Hoàn thành) · Xem chi tiết (tải về, gắn Khung Artwork) · Chỉnh sửa (mở lại canvas)

**E. Gói dịch vụ & Thanh toán**: Bảng giá 3 gói · Thanh toán (PayPal/MoMo) · Màn hình hết lượt Free → mời nâng cấp

**F. Đấu trường sáng tạo**: Sảnh chờ (Ghép ngẫu nhiên/Tạo phòng mời bạn) · Phòng chờ (10 thí sinh, đếm ngược) · Màn hình thi đấu (canvas + đồng hồ) · Kết quả (bảng điểm rubric, Top 3, phần thưởng Rank/Gacha)

**G. Level & Nhiệm vụ**: Danh sách 3 nhiệm vụ hiện tại + tiến độ · Popup lên cấp (mở bộ nhiệm vụ mới)

**H. Rank**: Thanh tiến trình Rank hiện tại · Popup thăng hạng (nhận Khung Avatar mới + Ruby)

**I. Gacha & Bộ sưu tập**: Màn hình bóc thẻ (animation) · Bộ sưu tập thẻ (lọc S/A/B/C)

**J. Shop**: Danh sách skin cọ vẽ / Khung Artwork, giá Ruby, nút mua

**K. Xã hội**: Danh sách bạn bè + mã mời kết bạn · Trading thẻ (gửi/xác nhận 2 chiều) · Phòng tô cùng nhau (tạo/join qua mã phòng)

**L. Flipbook**: Trình tạo (chọn tranh, sắp trang, thêm chú thích) · Trình xem (lật trang) + xuất PDF

### 15.3. Design System

**Bảng màu chủ đạo — hiện đại, sáng, tông xanh biển & trắng**

| Vai trò | Mã màu | Mô tả |
|---|---|---|
| Primary (xanh biển chính) | `#2B9BF4` | Nút chính, header, icon nhấn |
| Primary Dark | `#0B6FB8` | Trạng thái hover/active |
| Primary Light | `#EAF6FF` | Nền các khối/card |
| Nền chính | `#FFFFFF` | Nền tổng thể toàn trang |
| Chữ chính | `#1B2A38` | Thay đen thuần, hài hòa với tông xanh biển |
| Chữ phụ | `#5E7A8C` | Text mô tả phụ |
| Viền/Divider | `#D6EAF8` | Đường viền card, phân cách nhẹ |

**Màu điểm nhấn (accent, dùng có kiểm soát):**
- Cam san hô `#FF8A65` — CTA nổi bật, nút "Nâng cấp gói"
- Vàng `#FFC94D` — phần thưởng, Ruby, thăng hạng
- Xanh lá `#4CD787` — trạng thái thành công/hoàn thành

**Màu ngữ nghĩa Rank & Gacha (giữ nguyên tính biểu tượng):**
- Rank: Đồng `#B08D57` / Bạc `#C0C0C0` / Vàng `#FFD700` / Bạch Kim `#B9F2FF` / Kim Cương `#7DE2FF`
- Gacha: C `#A8B8C4` / B `#5DADE2` / A `#7D5FFF` / S `#FF5F7E` (hoặc gradient vàng ánh kim để nổi bật độ hiếm)

**Typography:**
- Heading (tiêu đề, tên chủ đề, nút lớn): **Baloo 2** — bo tròn, vui tươi.
- Body (mô tả, nội dung): **Nunito** — sạch, hiện đại, độ đọc cao, hợp tông xanh biển/trắng.

**Phong cách thị giác:**
- Nền trắng chủ đạo, card bo góc lớn (16–24px), đổ bóng nhẹ dịu tông xanh nhạt.
- Icon/minh họa flat/outline hiện đại, tránh họa tiết rối mắt.
- Bảng màu tô (crayon palette) trong công cụ tô vẫn giữ đa dạng sắc màu — đây là màu **cho nội dung tranh**, tách biệt với màu giao diện hệ thống.
- **Chuẩn cảm ứng**: nút/thành phần tương tác tối thiểu **44×44px**, responsive **mobile-first** (ưu tiên tablet trước, desktop sau).

### 15.4. Component tái sử dụng chính
`ColorPalette` · `ToolBar` · `Canvas` (SVG + layer Brush) · `ThemeCard` · `ProgressBar` (Level/Rank) · `GachaCardReveal` · `FrameSelector` (2 loại: Avatar & Artwork) · `CountdownTimer` · `Leaderboard` · `FlipbookViewer` · `MissionList` · `PaymentModal`

---

## 16. Cấu trúc thư mục dự án (Project Folder Structure)

```
coloring-web-app/
│
├── frontend/                        # Ứng dụng phía người dùng
│   ├── public/
│   │   └── assets/                  # Ảnh tĩnh, favicon, font chữ
│   ├── src/
│   │   ├── components/
│   │   │   ├── ColorPalette/
│   │   │   ├── ToolBar/             # Bucket fill, brush, eraser, zoom...
│   │   │   ├── Canvas/              # SVG vùng + layer Brush
│   │   │   ├── FrameSelector/       # Khung Avatar & Khung Artwork
│   │   │   └── ProgressBar/         # Level & Rank
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   ├── ThemeSelector/       # Tầng 1
│   │   │   ├── ObjectSelector/      # Tầng 2
│   │   │   ├── PoseSelector/        # Tầng 3
│   │   │   ├── ColoringScreen/      # Màn hình tô (theo mẫu / sáng tạo)
│   │   │   ├── History/
│   │   │   ├── Arena/               # Đấu trường sáng tạo
│   │   │   ├── Progression/         # Level, nhiệm vụ, Rank
│   │   │   ├── Gacha/               # Bóc thẻ, bộ sưu tập
│   │   │   ├── Shop/                # Mua skin/khung bằng Ruby
│   │   │   ├── Storybook/           # Flipbook
│   │   │   ├── Collaborative/       # Phòng tô cùng nhau
│   │   │   ├── Social/              # Bạn bè, trading thẻ
│   │   │   ├── Account/             # Đăng nhập, hồ sơ, gói dịch vụ
│   │   │   └── Payment/             # Thanh toán PayPal/MoMo
│   │   ├── i18n/
│   │   │   ├── vi.json
│   │   │   └── en.json
│   │   ├── hooks/
│   │   ├── services/                # Gọi API tới backend
│   │   ├── store/                   # Zustand store
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.js         # Đăng ký/đăng nhập, OTP, Gmail
│   │   │   ├── coloring.routes.js     # Lưu/tải tiến trình tô
│   │   │   ├── subscription.routes.js # Gói dịch vụ & giới hạn lượt
│   │   │   ├── payment.routes.js      # PayPal + MoMo
│   │   │   ├── arena.routes.js        # Phòng thi, chấm điểm
│   │   │   ├── progression.routes.js  # Level, nhiệm vụ, Rank
│   │   │   ├── gacha.routes.js        # Bóc thẻ, tỉ lệ S/A/B/C
│   │   │   ├── shop.routes.js         # Mua skin/khung bằng Ruby
│   │   │   ├── social.routes.js       # Bạn bè, trading thẻ
│   │   │   └── storybook.routes.js    # Flipbook PDF
│   │   ├── controllers/
│   │   ├── models/                    # User, Artwork, Card, Room, Mission, Rank...
│   │   ├── services/
│   │   │   ├── scoringEngine.js       # Chấm điểm theo rubric
│   │   │   ├── gachaWeightedRandom.js # Random có trọng số tỉ lệ thẻ
│   │   │   ├── antiCheat.js           # Phát hiện tốc độ hoàn thành bất thường
│   │   │   └── realtime.js            # Socket cho tô cùng nhau & phòng đấu
│   │   ├── middlewares/               # Xác thực, kiểm tra gói/lượt tô
│   │   └── config/                    # Cấu hình DB, PayPal, MoMo, biến môi trường
│   └── package.json
│
├── database/
│   ├── migrations/
│   └── seeds/                         # Dữ liệu mẫu (chủ đề, tranh, thẻ, mốc Rank/Level...)
│
├── assets-library/                    # Kho tranh gốc (SVG line-art theo 3 tầng)
│   ├── dong-vat/
│   │   ├── meo/
│   │   ├── cho/
│   │   └── ...
│   ├── xe-co/
│   ├── thien-nhien/
│   └── ...
│
├── admin-cms/                         # Công cụ quản trị nội bộ để thêm tranh mới
│
├── docs/                              # Tài liệu dự án (bao gồm file kế hoạch này)
│
└── README.md
```

---

## 17. Yêu cầu kỹ thuật Backend tổng quan

- Hệ thống xác thực: đăng ký thường (username/password + OTP phụ huynh) + Google OAuth.
- Cơ sở dữ liệu lưu: tài khoản, gói dịch vụ, lượt tô đã dùng, lịch sử tranh, Điểm Rank, Điểm Gacha, Level & tiến độ nhiệm vụ, Ruby, bộ sưu tập thẻ & khung, danh sách bạn bè, dữ liệu phòng đấu/phòng tô chung.
- Tích hợp cổng thanh toán **PayPal** và **MoMo** thật.
- Hệ thống real-time (WebSocket) cho tô cùng nhau và phòng Đấu trường.
- **Engine chấm điểm tự động** theo rubric Mục 9.2, phân biệt dữ liệu vùng (Bucket fill) và dữ liệu nét Brush để tính "lem" đúng theo Mục 3.4.
- Cơ chế **random có trọng số (weighted random)** cho Gacha theo đúng tỉ lệ Mục 9.4.
- **Chống gian lận**: theo dõi tốc độ hoàn thành bất thường trong phòng đấu (Mục 13).
- **Quản lý vòng đời dữ liệu**: tự động dọn tranh dở quá 30 ngày không hoạt động (Mục 7).
- Công cụ Admin/CMS nội bộ để quản lý kho tranh (Mục 12).

---

## 18. Hướng phát triển tương lai (Roadmap)

| Hướng phát triển | Mô tả |
|---|---|
| **Tạo tranh từ ảnh/ý tưởng của bé (AI Generate)** | Bé tải ảnh lên hoặc mô tả bằng lời → hệ thống tự chuyển thành tranh line-art để tô |
| **Tô màu bằng giọng nói** | Bé nói "tô con mèo màu vàng" → hệ thống tự nhận diện vùng và tô đúng màu |
| **Âm thanh phản hồi theo màu** | Mỗi màu tô phát ra âm thanh/giai điệu riêng |
| **Chế độ kể chuyện tương tác (Story Mode)** | Chuỗi tranh liên kết thành 1 câu chuyện, tô xong tranh này mở khóa đoạn tiếp theo |
| **Bảo tàng tranh cá nhân (Album)** | Không gian trưng bày tranh đã hoàn thành, chia sẻ link cho phụ huynh xem |
| **Dashboard cho phụ huynh/giáo viên** | Theo dõi số tranh đã tô, thời gian sử dụng, mức độ sáng tạo qua thời gian |
| **Chế độ hỗ trợ mù màu** | Hiển thị ký hiệu ngoài màu sắc để bé mù màu vẫn tô theo mẫu chính xác |
| **"Bệnh viện màu sắc"** | Mini game tìm và sửa lỗi tô màu sai chủ đích, dạy nhận thức màu sắc thực tế |
| **Nhật ký cảm xúc qua màu sắc** | Mỗi ngày chọn 1 màu đại diện cảm xúc, theo tháng tạo bản đồ cảm xúc trực quan |
| **Tô theo chữ/số lồng ghép học tập** | Vùng tô yêu cầu tính toán/nhận diện chữ cái trước khi biết màu cần tô |

---

*Tài liệu này tổng hợp toàn bộ nội dung đã thống nhất trong quá trình trao đổi, dùng làm căn cứ trực tiếp cho việc thiết kế kỹ thuật và triển khai code của sản phẩm.*
