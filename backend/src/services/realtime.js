// Cầu nối Socket.io dùng chung: các service khác đẩy sự kiện tới từng người dùng qua đây.
// Logic phòng Đấu trường nằm ở arena.js, phòng tô chung ở collab.js; file này khởi tạo và định tuyến.
import { Server } from 'socket.io';
import { verifyToken } from '../middlewares/auth.js';
import { env } from '../config/env.js';
import * as User from '../models/user.js';

let io = null;

export function getIo() {
  return io;
}

/** Gửi sự kiện tới mọi tab đang mở của 1 người dùng. */
export function emitToUser(userId, event, payload) {
  io?.to(`user:${userId}`).emit(event, payload);
}

export function initRealtime(httpServer, { registerHandlers = [] } = {}) {
  io = new Server(httpServer, {
    cors: { origin: env.corsOrigins, credentials: true },
    maxHttpBufferSize: 5e6,
  });
  io.use((socket, next) => {
    try {
      const payload = verifyToken(socket.handshake.auth?.token);
      const user = User.findById(payload.sub);
      if (!user) return next(new Error('unauthorized'));
      socket.data.user = User.publicProfile(user);
      socket.data.userId = user.id;
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });
  io.on('connection', (socket) => {
    socket.join(`user:${socket.data.userId}`);
    for (const register of registerHandlers) register(io, socket);
  });
  return io;
}
