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
if (pictures === 0) {
  const r = await seedAll();
  console.log(`[seed] Khởi tạo dữ liệu lần đầu: ${r.pictures} tranh, ${r.missions} nhiệm vụ, ${r.items} vật phẩm`);
} else {
  const n = await seedPicturesIfNeeded();
  if (n) console.log(`[seed] Đã nạp bộ tranh mới: ${n} tranh`);
}

const server = createServer(createApp());
initRealtime(server, { registerHandlers: [registerArena, registerCollab] });
await scheduleCleanup();
await scheduleExhibition();
await scheduleBilling();

server.listen(env.port, () => {
  console.log(`API đang chạy tại http://localhost:${env.port}`);
});
