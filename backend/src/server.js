// Điểm khởi động: HTTP + Socket.io + tác vụ dọn dẹp định kỳ.
import { createServer } from 'node:http';
import { env } from './config/env.js';
import { getDb } from './config/db.js';
import { createApp } from './app.js';
import { initRealtime } from './services/realtime.js';
import { registerArena } from './services/arena.js';
import { registerCollab } from './services/collab.js';
import { scheduleCleanup } from './services/lifecycle.js';
import { seedAll } from '../../database/seeds/seed.js';

const db = getDb();
if (db.prepare('SELECT COUNT(*) AS c FROM pictures').get().c === 0) {
  const r = await seedAll();
  console.log(`[seed] Khởi tạo dữ liệu lần đầu: ${r.pictures} tranh, ${r.missions} nhiệm vụ, ${r.items} vật phẩm`);
}

const server = createServer(createApp());
initRealtime(server, { registerHandlers: [registerArena, registerCollab] });
scheduleCleanup();

server.listen(env.port, () => {
  console.log(`API đang chạy tại http://localhost:${env.port}`);
});
