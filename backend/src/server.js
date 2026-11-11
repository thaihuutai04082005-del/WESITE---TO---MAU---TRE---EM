// Điểm khởi động: HTTP + Socket.io + tác vụ dọn dẹp định kỳ + lịch Hội trường triển lãm.
import { createServer } from 'node:http';
import { env } from './config/env.js';
import { getDb, initializeDatabase } from './config/db.js';
import { createApp } from './app.js';
import { initRealtime } from './services/realtime.js';
import { registerArena } from './services/arena.js';
import { registerCollab } from './services/collab.js';
import { scheduleCleanup } from './services/lifecycle.js';
import { scheduleExhibition } from './services/exhibition.js';
import { scheduleBilling } from './services/payments/index.js';
import { seedAll, seedPicturesIfNeeded } from '../../database/seeds/seed.js';

await initializeDatabase();
const db = getDb();
const accounts = (await db.prepare('SELECT COUNT(*) AS c FROM users').get()).c;
const pictures = (await db.prepare('SELECT COUNT(*) AS c FROM pictures').get()).c;
// Counts make an unexpectedly empty database visible without logging any account or secret.
console.log(`[database] engine=${db.dialect} accounts=${accounts} pictures=${pictures}`);
const server = createServer(createApp());
initRealtime(server, { registerHandlers: [registerArena, registerCollab] });

/** Kiểm tra bộ tranh + bật các lịch chạy nền. Mỗi việc cần vài lượt hỏi database (ở xa nên mỗi lượt tốn thời gian). */
async function backgroundStartup() {
  const n = await seedPicturesIfNeeded();
  if (n) console.log(`[seed] Đã nạp bộ tranh mới: ${n} tranh`);
  await scheduleCleanup();
  await scheduleExhibition();
  await scheduleBilling();
}

if (pictures === 0) {
  // Database mới tinh: phải có dữ liệu trước rồi mới nhận khách.
  const r = await seedAll();
  console.log(`[seed] Khởi tạo dữ liệu lần đầu: ${r.pictures} tranh, ${r.missions} nhiệm vụ, ${r.items} vật phẩm`);
  await scheduleCleanup();
  await scheduleExhibition();
  await scheduleBilling();
} else {
  // Đã có dữ liệu: mở cổng nhận khách ngay, phần kiểm tra/lịch chạy nền làm sau. Gói Render Free ngủ khi vắng khách,
  // mỗi lần thức dậy trước đây phải chờ xong ~24 lượt hỏi database (vài giây) rồi mới trả lời được trang web.
  setImmediate(() => backgroundStartup().catch((err) => console.error('[startup] Lỗi chạy nền:', err)));
}

server.listen(env.port, () => {
  console.log(`API đang chạy tại http://localhost:${env.port}`);
});
