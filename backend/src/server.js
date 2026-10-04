// Điểm khởi động: HTTP + Socket.io + tác vụ dọn dẹp định kỳ + lịch Hội trường triển lãm.
import { createServer } from 'node:http';
import { env } from './config/env.js';
import { getDb } from './config/db.js';
import { createApp } from './app.js';
import { initRealtime } from './services/realtime.js';
import { registerArena } from './services/arena.js';
import { registerCollab } from './services/collab.js';
import { scheduleCleanup } from './services/lifecycle.js';
import { scheduleExhibition } from './services/exhibition.js';
import { scheduleBilling } from './services/payments/index.js';
import { seedAll, seedPicturesIfNeeded } from '../../database/seeds/seed.js';

const db = getDb();
if (db.prepare('SELECT COUNT(*) AS c FROM pictures').get().c === 0) {
  const r = await seedAll();
  console.log(`[seed] Khởi tạo dữ liệu lần đầu: ${r.pictures} tranh, ${r.missions} nhiệm vụ, ${r.items} vật phẩm`);
} else {
  const n = seedPicturesIfNeeded();
  if (n) console.log(`[seed] Đã nạp bộ tranh mới: ${n} tranh`);
}

const server = createServer(createApp());
initRealtime(server, { registerHandlers: [registerArena, registerCollab] });
scheduleCleanup();
scheduleExhibition();
scheduleBilling();

server.listen(env.port, () => {
  console.log(`API đang chạy tại http://localhost:${env.port}`);
});
