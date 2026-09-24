# Bé Tô Màu — Web tô màu cho trẻ em

Nền tảng tô màu trực tuyến cho trẻ em, kết hợp **sáng tạo, giáo dục và giải trí**:
- Thư viện tranh 3 tầng, có hình minh hoạ thật ở mọi tầng.
- Hai chế độ tô: **Theo mẫu** và **Sáng tạo**.
- Bộ công cụ tô đầy đủ: đổ màu, cọ vẽ kèm skin, tẩy, sticker, lấp lánh, undo/redo, zoom 2 ngón.
- Gói dịch vụ Free/Tháng/Năm, thanh toán qua MoMo và PayPal.
- Hệ thống tiến trình Level – Rank – Ruby – Shop.
- **Đấu trường sáng tạo** chấm điểm tự động, **thẻ Gacha S/A/B/C**, **tô cùng nhau theo thời gian thực**, **Flipbook**, **tranh sống**, đa ngôn ngữ Việt/Anh.

Kế hoạch sản phẩm gốc: [`docs/ke-hoach-web-to-mau.md`](docs/ke-hoach-web-to-mau.md). Các điểm kế hoạch chưa nói rõ và giá trị đã chọn: [`docs/quyet-dinh-trien-khai.md`](docs/quyet-dinh-trien-khai.md).

## Chạy nhanh

Yêu cầu **Node.js ≥ 22.5** (dùng SQLite có sẵn trong Node, không cần cài CSDL).

```bash
npm install            # cài cho cả backend + frontend (npm workspaces)
cp backend/.env.example backend/.env   # tuỳ chọn: đặt ADMIN_PASSWORD, khoá thanh toán…
npm run dev            # backend :4000 + frontend :5173 (Vite proxy /api, /socket.io, /admin)
```

- Mở http://localhost:5173 để dùng web.
- Lần chạy đầu, server tự tạo CSDL và nạp **225 tranh, 60 nhiệm vụ, 18 vật phẩm**.
- Ở môi trường dev, mã OTP hiện ngay trên màn hình đăng ký (và in ra console) khi chưa cấu hình SMS/Email.
- Tài khoản quản trị: đặt `ADMIN_PASSWORD` trong `backend/.env` rồi chạy `npm run seed`, sau đó vào http://localhost:5173/admin/.

### Production

```bash
npm run build          # build frontend vào frontend/dist
NODE_ENV=production JWT_SECRET=... PAYMENT_MOCK=false npm start
```

Backend phục vụ luôn bản build frontend (SPA), API `/api`, Socket.io và trang quản trị `/admin`, tất cả trên một cổng.

### Các lệnh khác

| Lệnh | Việc làm |
|---|---|
| `npm test` | Unit test + test tích hợp backend (API thật, socket Đấu trường & tô chung) |
| `npm run gen:pictures` | Sinh lại kho tranh SVG + `assets-library/catalog.json` + ảnh avatar |
| `npm run seed` | Nạp/cập nhật tranh, nhiệm vụ, vật phẩm, tài khoản admin (chạy lại nhiều lần vẫn an toàn) |

## Cấu trúc thư mục

```
├── frontend/            React (Vite) + TailwindCSS + Zustand + react-i18next + Socket.io client
│   └── src/
│       ├── components/  Canvas (SVG vùng + lớp Brush), ToolBar, ColorPalette, FrameSelector, ProgressBar,
│       │                ThemeCard, GachaCardReveal, CountdownTimer, Leaderboard, FlipbookViewer,
│       │                MissionList, PaymentModal, Layout…
│       ├── pages/       Home, ThemeSelector, ObjectSelector, PoseSelector, ColoringScreen, History, Arena,
│       │                Progression, Gacha, Shop, Storybook, Collaborative, Social, Account, Payment
│       ├── i18n/        vi.json, en.json
│       ├── hooks/ services/ store/ lib/
├── backend/             Express 5 + Socket.io + SQLite (node:sqlite)
│   └── src/
│       ├── routes/      auth, coloring, subscription, payment, arena, progression, gacha, shop, social, storybook, admin
│       ├── controllers/ models/ middlewares/ config/
│       └── services/    scoringEngine, gachaWeightedRandom, antiCheat, realtime, arena, collab,
│                        progression, quota, otp, captcha, payments/{paypal,momo}, pdf, lifecycle
├── database/            migrations/ (SQL) + seeds/ (nhiệm vụ, vật phẩm, nạp kho tranh)
├── assets-library/      Kho tranh SVG theo 3 tầng + generator/ (bộ sinh tranh) + catalog.json
├── admin-cms/           Công cụ quản trị nội bộ: thêm chủ đề/đối tượng, tải SVG, đặt màu gợi ý
└── docs/                Kế hoạch sản phẩm + các quyết định triển khai
```

## Kiến trúc chính

- **Tranh = SVG có vùng cố định, kể cả vùng nền.**
  - Bộ sinh tranh (`assets-library/generator`) vẽ 25 đối tượng × (5 biến thể + 4 thẻ Gacha).
  - Mỗi tranh đi kèm manifest: đa giác từng vùng, diện tích hiển thị sau che khuất, vị trí đặt số (tính bằng distance transform) và bảng màu đánh số.
- **Tô màu:** lớp SVG cho Bucket fill và một lớp `<canvas>` riêng cho Brush tự do (Mục 3–4).
  - Toạ độ nét được lưu theo hệ 600×600, nên server tính được "lem" chính xác và tranh xuất PNG ở mọi kích thước.
- **Engine chấm điểm** (`services/scoringEngine.js`) chạy trên dữ liệu số: vùng, màu và nét Brush, theo đúng rubric Mục 9.2.
- **Realtime:** Socket.io cho phòng Đấu trường (ghép phòng, đếm ngược, nộp bài, chấm điểm) và phòng tô chung (đồng bộ thao tác, con trỏ của bạn, undo theo từng bé).
- **An toàn trẻ em:**
  - Đăng ký không bắt buộc Gmail, xác minh phụ huynh bằng OTP.
  - Kết bạn, vào phòng tô chung và phòng đấu riêng đều chỉ qua mã riêng.
  - Tặng/đổi thẻ giới hạn 3 lượt/ngày, phải xác nhận 2 chiều.
  - Gacha không liên quan tiền thật.
  - Có rate limit, CAPTCHA dạng nét vẽ, OTP chỉ lưu hash.
  - SVG tải lên qua trang quản trị được lọc script.

## Biến môi trường

Xem đầy đủ trong [`backend/.env.example`](backend/.env.example). Các nhóm chính:

| Nhóm | Biến |
|---|---|
| Máy chủ | `PORT`, `PUBLIC_URL`, `API_PUBLIC_URL`, `CORS_ORIGINS`, `DB_FILE`, `JWT_SECRET` |
| OTP | `SMTP_*`, `SMS_API_URL`, `SMS_API_KEY`, `SMS_SECRET_KEY`, `SMS_BRANDNAME`, `EXPOSE_DEV_OTP` |
| Google | `GOOGLE_CLIENT_ID` |
| Thanh toán | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_API_BASE`, `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY`, `MOMO_ENDPOINT`, `PAYMENT_MOCK` |
| Đấu trường | `ARENA_DURATION_SEC`, `ARENA_LOBBY_WAIT_SEC`, `ARENA_MIN_PLAYERS`, `ARENA_SLOTS` |

> **Lưu ý pháp lý:** Nghị định 13/2023/NĐ-CP có yêu cầu riêng với dữ liệu cá nhân của trẻ em. Nên rà soát với luật sư trước khi vận hành chính thức (xem Mục 11 của kế hoạch).
