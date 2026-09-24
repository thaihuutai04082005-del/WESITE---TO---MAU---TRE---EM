// Tô màu cùng nhau theo thời gian thực (Mục 10.1): 2–4 bé, chỉ vào qua mã phòng riêng, không có danh sách phòng công khai.
import { COLLAB_MAX_PLAYERS } from '../config/constants.js';
import * as Picture from '../models/picture.js';
import * as Artwork from '../models/artwork.js';
import * as User from '../models/user.js';
import { sanitizeArtworkData } from './scoringEngine.js';
import * as progression from './progression.js';
import { canUsePicture } from '../controllers/picture.controller.js';
import { randomCode } from '../utils/ids.js';

const rooms = new Map();
const userRoom = new Map();
const MAX_OPS = 5000;

function stateOf(room) {
  // Dựng lại trạng thái tranh từ nhật ký thao tác (phục vụ Undo theo từng bé).
  const data = { fills: {}, strokes: [], stickers: [], glitter: [] };
  for (const op of room.ops) {
    if (op.type === 'fill') data.fills[op.regionId] = op.color;
    else if (op.type === 'stroke') data.strokes.push(op.stroke);
    else if (op.type === 'sticker') data.stickers.push(op.sticker);
    else if (op.type === 'glitter') {
      data.glitter = data.glitter.filter((g) => g !== op.regionId);
      if (op.on) data.glitter.push(op.regionId);
    } else if (op.type === 'clear') {
      data.fills = {};
      data.strokes = [];
      data.stickers = [];
      data.glitter = [];
    }
  }
  return sanitizeArtworkData(room.manifest, data);
}

function publicRoom(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    pictureId: room.picture.id,
    maxPlayers: COLLAB_MAX_PLAYERS,
    players: [...room.players.values()].map((p) => ({ ...p.profile, color: p.color })),
  };
}

const CURSOR_COLORS = ['#FF5F7E', '#2B9BF4', '#4CD787', '#FF9F43'];

export function registerCollab(io, socket) {
  const uid = socket.data.userId;
  const reply = (cb, payload) => typeof cb === 'function' && cb(payload);
  const current = () => rooms.get(userRoom.get(uid));
  const channel = (room) => `collab:${room.code}`;

  function join(room) {
    let p = room.players.get(uid);
    if (!p) {
      const used = new Set([...room.players.values()].map((x) => x.color));
      p = { profile: socket.data.user, sockets: new Set(), color: CURSOR_COLORS.find((c) => !used.has(c)) || '#7D5FFF' };
      room.players.set(uid, p);
    }
    p.sockets.add(socket.id);
    userRoom.set(uid, room.code);
    socket.join(channel(room));
    io.to(channel(room)).emit('collab:room', publicRoom(room));
  }

  function leave(room) {
    const p = room.players.get(uid);
    if (!p) return;
    socket.leave(channel(room));
    p.sockets.delete(socket.id);
    if (p.sockets.size) return;
    room.players.delete(uid);
    userRoom.delete(uid);
    if (!room.players.size) {
      rooms.delete(room.code);
      return;
    }
    if (room.hostId === uid) room.hostId = room.players.keys().next().value;
    io.to(channel(room)).emit('collab:room', publicRoom(room));
  }

  socket.on('collab:create', (p, cb) => {
    const user = User.findById(uid);
    if (!user?.nickname) return reply(cb, { error: 'nickname_required' });
    const picture = Picture.findPicture(Number(p?.pictureId));
    if (!picture) return reply(cb, { error: 'picture_not_found' });
    if (!canUsePicture(user, picture)) return reply(cb, { error: 'card_not_owned' });
    const old = current();
    if (old) leave(old);
    let code;
    do code = randomCode(6);
    while (rooms.has(code));
    const room = { code, hostId: uid, picture, manifest: Picture.manifestOf(picture), players: new Map(), ops: [], seq: 0 };
    rooms.set(code, room);
    join(room);
    reply(cb, { room: publicRoom(room), picture: Picture.toClient(picture), data: stateOf(room) });
  });

  socket.on('collab:join', (p, cb) => {
    const room = rooms.get(String(p?.code || '').trim().toUpperCase());
    if (!room) return reply(cb, { error: 'room_not_found' });
    if (!User.findById(uid)?.nickname) return reply(cb, { error: 'nickname_required' });
    if (!room.players.has(uid) && room.players.size >= COLLAB_MAX_PLAYERS) return reply(cb, { error: 'room_full' });
    const old = current();
    if (old && old !== room) leave(old);
    join(room);
    reply(cb, { room: publicRoom(room), picture: Picture.toClient(room.picture), data: stateOf(room) });
  });

  socket.on('collab:op', (op) => {
    const room = current();
    if (!room || !op || room.ops.length >= MAX_OPS) return;
    const clean = { id: ++room.seq, by: uid, type: op.type };
    const ids = room.manifest.regions;
    if (op.type === 'fill' || op.type === 'glitter') {
      if (!ids.some((r) => r.id === op.regionId)) return;
      clean.regionId = op.regionId;
      if (op.type === 'fill') {
        if (!/^#[0-9a-fA-F]{6}$/.test(op.color || '')) return;
        clean.color = op.color;
      } else clean.on = !!op.on;
    } else if (op.type === 'stroke') {
      const s = sanitizeArtworkData(room.manifest, { strokes: [op.stroke] }).strokes[0];
      if (!s?.points.length) return;
      clean.stroke = s;
    } else if (op.type === 'sticker') {
      const s = sanitizeArtworkData(room.manifest, { stickers: [op.sticker] }).stickers[0];
      if (!s) return;
      clean.sticker = s;
    } else if (op.type !== 'clear') return;
    room.ops.push(clean);
    socket.to(channel(room)).emit('collab:op', clean);
  });

  // Undo: bé chỉ hoàn tác được thao tác của chính mình.
  socket.on('collab:undo', () => {
    const room = current();
    if (!room) return;
    for (let i = room.ops.length - 1; i >= 0; i--) {
      if (room.ops[i].by === uid) {
        room.ops.splice(i, 1);
        io.to(channel(room)).emit('collab:state', stateOf(room));
        return;
      }
    }
  });

  socket.on('collab:cursor', (pos) => {
    const room = current();
    if (!room || !Number.isFinite(pos?.x) || !Number.isFinite(pos?.y)) return;
    socket.to(channel(room)).volatile.emit('collab:cursor', { userId: uid, x: pos.x, y: pos.y, color: room.players.get(uid)?.color });
  });

  // Lưu tranh chung vào Lịch sử của mọi bé đang trong phòng.
  socket.on('collab:save', (payload, cb) => {
    const room = current();
    if (!room) return reply(cb, { error: 'room_not_found' });
    const data = stateOf(room);
    if (!Object.keys(data.fills).length && !data.strokes.length) return reply(cb, { error: 'empty' });
    const thumb = typeof payload?.thumbnail === 'string' && payload.thumbnail.startsWith('data:image/') && payload.thumbnail.length < 900 * 1024 ? payload.thumbnail : null;
    for (const memberId of room.players.keys()) {
      Artwork.create({ userId: memberId, pictureId: room.picture.id, mode: 'collab', data, thumbnail: thumb, status: 'completed' });
      const events = progression.record(memberId, 'collab_join');
      io.to(`user:${memberId}`).emit('collab:saved', { by: socket.data.user, events });
    }
    reply(cb, { ok: true });
  });

  socket.on('collab:leave', (_p, cb) => {
    const room = current();
    if (room) leave(room);
    reply(cb, { ok: true });
  });

  socket.on('disconnect', () => {
    const room = current();
    if (room) leave(room);
  });
}
