// Kết nối Socket.io dùng chung (Đấu trường, tô cùng nhau, thông báo realtime).
import { io } from 'socket.io-client';

let socket = null;
let currentToken = null;

export function getSocket(token) {
  if (socket && currentToken === token) return socket;
  socket?.disconnect();
  currentToken = token;
  socket = io(import.meta.env.VITE_SOCKET_URL || '/', { auth: { token }, transports: ['websocket', 'polling'] });
  return socket;
}

export function closeSocket() {
  socket?.disconnect();
  socket = null;
  currentToken = null;
}

/** emit có callback dạng Promise. */
export function emitAck(s, event, payload, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    s.emit(event, payload, (res) => {
      clearTimeout(timer);
      resolve(res);
    });
  });
}
