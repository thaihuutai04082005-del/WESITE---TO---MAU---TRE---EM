// Đấu trường sáng tạo (Mục 9) — phòng 10 thí sinh, chỉ chế độ Sáng tạo, chấm tự động theo rubric.
// Hai cách vào: Ghép ngẫu nhiên (cùng nhóm trình độ, trong khung giờ công khai) hoặc Phòng riêng mời bạn bè.
import { getDb } from '../config/db.js';
import { env } from '../config/env.js';
import { ARENA_REWARDS, ARENA_ROOM_SIZE, rankOf } from '../config/constants.js';
import * as User from '../models/user.js';
import * as Picture from '../models/picture.js';
import * as Artwork from '../models/artwork.js';
import { scoreRoom, sanitizeArtworkData, coverageScore } from './scoringEngine.js';
import { checkEntry } from './antiCheat.js';
import * as progression from './progression.js';
import { areFriends } from '../controllers/social.controller.js';
import { randomCode } from '../utils/ids.js';
import { isoWeek, VN_OFFSET_MS } from '../utils/time.js';

/** Nhóm trình độ để ghép phòng ngẫu nhiên. */
const BRACKET = { bronze: 'newbie', silver: 'newbie', gold: 'middle', platinum: 'pro', diamond: 'pro' };
const GRACE_MS = 5000;
const START_DELAY_MS = 3000;

const rooms = new Map(); // code → room
const userRoom = new Map(); // userId → code
let io = null;

// ---------------- Khung giờ công khai ----------------

export function parseSlots(spec) {
  return String(spec || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const [a, b] = s.split('-').map((t) => t.split(':').map(Number));
      return { from: a[0] * 60 + (a[1] || 0), to: b[0] * 60 + (b[1] || 0) };
    });
}

export function slotStatus(now = new Date(), spec = env.arena.slots) {
  const slots = parseSlots(spec);
  if (!slots.length) return { open: true, slots: [], nextOpen: null };
  const vn = new Date(now.getTime() + VN_OFFSET_MS);
  const minutes = vn.getUTCHours() * 60 + vn.getUTCMinutes();
  const open = slots.some((s) => minutes >= s.from && minutes < s.to);
  let nextOpen = null;
  if (!open) {
    const future = slots.map((s) => s.from).filter((m) => m > minutes).sort((a, b) => a - b);
    const target = future.length ? future[0] : Math.min(...slots.map((s) => s.from)) + 24 * 60;
    nextOpen = new Date(now.getTime() + (target - minutes) * 60000 - vn.getUTCSeconds() * 1000).toISOString();
  }
  const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  return { open, slots: slots.map((s) => `${fmt(s.from)}-${fmt(s.to)}`), nextOpen };
}

// ---------------- Trạng thái phòng ----------------

function publicRoom(room) {
  return {
    code: room.code,
    type: room.type,
    bracket: room.bracket,
    hostId: room.hostId,
    status: room.status,
    maxPlayers: ARENA_ROOM_SIZE,
    minPlayers: env.arena.minPlayers,
    lobbyDeadline: room.lobbyDeadline,
    startedAt: room.startedAt,
    endsAt: room.endsAt,
    serverNow: Date.now(),
    players: [...room.players.values()].map((p) => ({ ...p.profile, submitted: !!p.submittedAt, online: p.sockets.size > 0 })),
  };
}

const broadcast = (room) => io?.to(`arena:${room.code}`).emit('arena:room', publicRoom(room));

function newRoom({ type, hostId = null, bracket = null }) {
  let code;
  do code = randomCode(6);
  while (rooms.has(code));
  const durationSec = env.arena.durationSec;
  const res = getDb()
    .prepare('INSERT INTO arena_rooms (code, type, tier, host_id, duration_sec, week) VALUES (?, ?, ?, ?, ?, ?)')
    .run(code, type, bracket, hostId, durationSec, isoWeek());
  const room = {
    id: Number(res.lastInsertRowid),
    code,
    type,
    bracket,
    hostId,
    status: 'waiting',
    durationMs: durationSec * 1000,
    players: new Map(),
    lobbyDeadline: null,
    timers: [],
  };
  rooms.set(code, room);
  return room;
}

function clearTimers(room) {
  room.timers.forEach(clearTimeout);
  room.timers = [];
}

function scheduleLobby(room) {
  if (room.type !== 'random' || room.status !== 'waiting') return;
  clearTimers(room);
  room.lobbyDeadline = Date.now() + env.arena.lobbyWaitSec * 1000;
  room.timers.push(
    setTimeout(() => {
      if (room.status !== 'waiting') return;
      if (room.players.size >= env.arena.minPlayers) startRoom(room);
      else scheduleLobby(room); // chưa đủ người → chờ thêm một vòng
      broadcast(room);
    }, env.arena.lobbyWaitSec * 1000),
  );
}

function addPlayer(room, socket) {
  const uid = socket.data.userId;
  let p = room.players.get(uid);
  if (!p) {
    p = { profile: socket.data.user, sockets: new Set(), actionTimes: [], data: null, thumbnail: null, submittedAt: null };
    room.players.set(uid, p);
  }
  p.sockets.add(socket.id);
  userRoom.set(uid, room.code);
  socket.join(`arena:${room.code}`);
}

function removePlayer(room, uid) {
  const p = room.players.get(uid);
  if (!p) return;
  for (const sid of p.sockets) io?.sockets.sockets.get(sid)?.leave(`arena:${room.code}`);
  room.players.delete(uid);
  userRoom.delete(uid);
  if (room.status === 'waiting') {
    if (room.players.size === 0) {
      clearTimers(room);
      rooms.delete(room.code);
      getDb().prepare("UPDATE arena_rooms SET status = 'cancelled' WHERE id = ?").run(room.id);
      return;
    }
    if (room.hostId === uid) room.hostId = room.players.keys().next().value;
    broadcast(room);
  }
}

function startRoom(room) {
  if (room.status !== 'waiting') return;
  clearTimers(room);
  const pic = Picture.findPicture(Picture.randomPictureForArena().id);
  room.picture = pic;
  room.manifest = Picture.manifestOf(pic);
  room.status = 'playing';
  room.startedAt = Date.now() + START_DELAY_MS;
  room.endsAt = room.startedAt + room.durationMs;
  getDb()
    .prepare("UPDATE arena_rooms SET status = 'playing', picture_id = ?, started_at = ?, ends_at = ?, host_id = ? WHERE id = ?")
    .run(pic.id, new Date(room.startedAt).toISOString(), new Date(room.endsAt).toISOString(), room.hostId, room.id);
  const ins = getDb().prepare('INSERT OR IGNORE INTO arena_entries (room_id, user_id) VALUES (?, ?)');
  for (const uid of room.players.keys()) ins.run(room.id, uid);
  io?.to(`arena:${room.code}`).emit('arena:start', { ...publicRoom(room), picture: Picture.toClient(pic) });
  room.timers.push(setTimeout(() => finishRoom(room), room.endsAt - Date.now() + GRACE_MS));
}

export function finishRoom(room) {
  if (room.status !== 'playing') return;
  room.status = 'finished';
  clearTimers(room);
  const manifest = room.manifest;
  const entries = [...room.players.entries()].map(([userId, p]) => {
    const data = p.data;
    const elapsedMs = p.submittedAt ? Math.max(0, p.submittedAt - room.startedAt) : room.durationMs;
    let flag = { flagged: false, reason: null };
    if (data) {
      flag = checkEntry({
        elapsedMs,
        filledRegions: Object.keys(data.fills).length,
        coverage: coverageScore(manifest, data.fills),
        actionTimes: p.actionTimes,
      });
    }
    return { userId, data, thumbnail: p.thumbnail, elapsedMs, flagged: flag.flagged, flagReason: flag.reason, profile: p.profile };
  });
  const results = scoreRoom(manifest, entries, room.durationMs);

  const db = getDb();
  const upd = db.prepare(
    'UPDATE arena_entries SET data = ?, thumbnail = ?, submitted_at = ?, elapsed_ms = ?, scores = ?, total = ?, place = ?, flagged = ?, flag_reason = ?, reward = ? WHERE room_id = ? AND user_id = ?',
  );
  const eventsByUser = {};
  for (const r of results) {
    const reward = r.place && r.place <= 3 ? ARENA_REWARDS[r.place - 1] : 0;
    r.reward = reward;
    upd.run(
      r.data ? JSON.stringify(r.data) : null,
      r.thumbnail,
      r.data ? new Date(room.startedAt + r.elapsedMs).toISOString() : null,
      r.elapsedMs,
      r.scores ? JSON.stringify(r.scores) : null,
      r.total,
      r.place ?? null,
      r.flagged ? 1 : 0,
      r.flagReason,
      reward,
      room.id,
      r.userId,
    );
    const ev = [];
    // "Tham gia Đấu trường" = đã hoàn thành & nộp bài tô (không xét thắng/thua).
    if (r.data && Object.keys(r.data.fills).length > 0) {
      Artwork.create({ userId: r.userId, pictureId: room.picture.id, mode: 'arena', data: r.data, thumbnail: r.thumbnail, status: 'completed' });
      ev.push(...progression.record(r.userId, 'arena_join'));
    }
    if (reward) ev.push(...progression.awardArena(r.userId, reward));
    eventsByUser[r.userId] = ev;
  }
  db.prepare("UPDATE arena_rooms SET status = 'finished' WHERE id = ?").run(room.id);

  const board = results
    .map((r) => ({ user: r.profile, total: r.total, scores: r.scores, place: r.place ?? null, reward: r.reward, flagged: r.flagged, flagReason: r.flagReason, thumbnail: r.thumbnail, elapsedMs: r.elapsedMs }))
    .sort((a, b) => (a.place ?? 99) - (b.place ?? 99) || b.total - a.total);
  for (const uid of room.players.keys()) {
    io?.to(`user:${uid}`).emit('arena:results', { roomId: room.id, code: room.code, board, events: eventsByUser[uid] || [] });
    userRoom.delete(uid);
  }
  io?.in(`arena:${room.code}`).socketsLeave(`arena:${room.code}`);
  rooms.delete(room.code);
  return board;
}

// ---------------- Socket handlers ----------------

export function registerArena(ioInstance, socket) {
  io = ioInstance;
  const uid = socket.data.userId;
  const reply = (cb, payload) => typeof cb === 'function' && cb(payload);
  const fail = (cb, code) => reply(cb, { error: code });
  const currentRoom = () => rooms.get(userRoom.get(uid));

  socket.on('arena:queue', (_p, cb) => {
    const user = User.findById(uid);
    if (!user?.nickname) return fail(cb, 'nickname_required');
    const cur = currentRoom();
    if (cur) {
      addPlayer(cur, socket);
      return reply(cb, { room: publicRoom(cur) });
    }
    const slot = slotStatus();
    if (!slot.open) return fail(cb, 'arena_closed');
    const bracket = BRACKET[rankOf(user.rank_points).key];
    let room = [...rooms.values()].find((r) => r.type === 'random' && r.status === 'waiting' && r.bracket === bracket && r.players.size < ARENA_ROOM_SIZE);
    const fresh = !room;
    if (!room) room = newRoom({ type: 'random', bracket });
    addPlayer(room, socket);
    if (fresh) scheduleLobby(room);
    if (room.players.size >= ARENA_ROOM_SIZE) startRoom(room);
    broadcast(room);
    reply(cb, { room: publicRoom(room) });
  });

  socket.on('arena:create', (_p, cb) => {
    if (!User.findById(uid)?.nickname) return fail(cb, 'nickname_required');
    if (currentRoom()) return fail(cb, 'already_in_room');
    const room = newRoom({ type: 'private', hostId: uid });
    addPlayer(room, socket);
    broadcast(room);
    reply(cb, { room: publicRoom(room) });
  });

  socket.on('arena:join', (p, cb) => {
    const room = rooms.get(String(p?.code || '').toUpperCase());
    if (!room || room.type !== 'private') return fail(cb, 'room_not_found');
    if (room.players.has(uid)) {
      addPlayer(room, socket);
      return reply(cb, { room: publicRoom(room) });
    }
    if (room.status !== 'waiting') return fail(cb, 'room_started');
    if (currentRoom()) return fail(cb, 'already_in_room');
    if (room.players.size >= ARENA_ROOM_SIZE) return fail(cb, 'room_full');
    // An toàn: phòng riêng chỉ dành cho bạn bè của chủ phòng.
    if (!areFriends(uid, room.hostId)) return fail(cb, 'not_friends');
    addPlayer(room, socket);
    broadcast(room);
    reply(cb, { room: publicRoom(room) });
  });

  socket.on('arena:start', (_p, cb) => {
    const room = currentRoom();
    if (!room || room.hostId !== uid || room.type !== 'private') return fail(cb, 'not_host');
    if (room.players.size < env.arena.minPlayers) return fail(cb, 'not_enough_players');
    startRoom(room);
    reply(cb, { ok: true });
  });

  socket.on('arena:leave', (_p, cb) => {
    const room = currentRoom();
    if (room && room.status === 'waiting') removePlayer(room, uid);
    else if (room) {
      // Rời khi đang thi: giữ bài đã tô gần nhất (nếu có) để vẫn được chấm.
      userRoom.delete(uid);
      socket.leave(`arena:${room.code}`);
    }
    reply(cb, { ok: true });
  });

  socket.on('arena:state', (_p, cb) => {
    const room = currentRoom();
    if (!room) return reply(cb, { room: null });
    addPlayer(room, socket);
    reply(cb, { room: publicRoom(room), picture: room.picture ? Picture.toClient(room.picture) : null, myData: room.players.get(uid)?.data || null });
  });

  // Mỗi thao tác tô (đổ màu / nét vẽ) — server tự ghi mốc thời gian để phát hiện thao tác dồn dập.
  socket.on('arena:action', () => {
    const room = currentRoom();
    const p = room?.players.get(uid);
    if (!p || room.status !== 'playing' || Date.now() < room.startedAt) return;
    if (p.actionTimes.length < 5000) p.actionTimes.push(Date.now() - room.startedAt);
  });

  // Tự lưu định kỳ: nếu hết giờ mà chưa nộp thì dùng bản này để chấm.
  socket.on('arena:snapshot', (payload) => {
    const room = currentRoom();
    const p = room?.players.get(uid);
    if (!p || room.status !== 'playing' || p.submittedAt) return;
    p.data = sanitizeArtworkData(room.manifest, payload?.data);
  });

  socket.on('arena:submit', (payload, cb) => {
    const room = currentRoom();
    const p = room?.players.get(uid);
    if (!p || room.status !== 'playing') return fail(cb, 'not_playing');
    if (p.submittedAt) return fail(cb, 'already_submitted');
    if (Date.now() > room.endsAt + GRACE_MS) return fail(cb, 'time_up');
    p.data = sanitizeArtworkData(room.manifest, payload?.data);
    const thumb = payload?.thumbnail;
    p.thumbnail = typeof thumb === 'string' && thumb.startsWith('data:image/') && thumb.length < 900 * 1024 ? thumb : null;
    p.submittedAt = Date.now();
    broadcast(room);
    reply(cb, { ok: true });
    if ([...room.players.values()].every((x) => x.submittedAt)) finishRoom(room);
  });

  socket.on('disconnect', () => {
    const room = currentRoom();
    const p = room?.players.get(uid);
    if (!p) return;
    p.sockets.delete(socket.id);
    if (p.sockets.size === 0 && room.status === 'waiting') removePlayer(room, uid);
    else broadcast(room);
  });
}

// ---------------- REST: thông tin & bảng xếp hạng tuần ----------------

export function weeklyLeaderboard(week = isoWeek(), limit = 20) {
  return getDb()
    .prepare(
      `SELECT e.user_id, SUM(e.reward) AS points, SUM(CASE WHEN e.place = 1 THEN 1 ELSE 0 END) AS wins, COUNT(*) AS games
       FROM arena_entries e JOIN arena_rooms r ON r.id = e.room_id
       WHERE r.week = ? AND r.status = 'finished' AND e.data IS NOT NULL
       GROUP BY e.user_id HAVING points > 0 ORDER BY points DESC, wins DESC LIMIT ?`,
    )
    .all(week, limit)
    .map((r, i) => ({ place: i + 1, user: User.publicProfile(User.findById(r.user_id)), points: r.points, wins: r.wins, games: r.games }));
}

export function history(userId, limit = 20) {
  return getDb()
    .prepare(
      `SELECT r.id, r.code, r.type, r.started_at, e.total, e.place, e.reward, e.flagged, e.flag_reason, e.thumbnail,
        (SELECT COUNT(*) FROM arena_entries x WHERE x.room_id = r.id) AS players
       FROM arena_entries e JOIN arena_rooms r ON r.id = e.room_id
       WHERE e.user_id = ? AND r.status = 'finished' ORDER BY r.id DESC LIMIT ?`,
    )
    .all(userId, limit)
    .map((r) => ({
      roomId: r.id,
      type: r.type,
      startedAt: r.started_at,
      total: r.total,
      place: r.place,
      reward: r.reward,
      flagged: !!r.flagged,
      flagReason: r.flag_reason,
      thumbnail: r.thumbnail,
      players: r.players,
    }));
}

export function roomResult(roomId) {
  const room = getDb().prepare('SELECT * FROM arena_rooms WHERE id = ?').get(roomId);
  if (!room) return null;
  const entries = getDb().prepare('SELECT * FROM arena_entries WHERE room_id = ? ORDER BY COALESCE(place, 99), total DESC').all(roomId);
  return {
    roomId,
    status: room.status,
    startedAt: room.started_at,
    board: entries.map((e) => ({
      user: User.publicProfile(User.findById(e.user_id)),
      total: e.total,
      scores: e.scores ? JSON.parse(e.scores) : null,
      place: e.place,
      reward: e.reward,
      flagged: !!e.flagged,
      flagReason: e.flag_reason,
      thumbnail: e.thumbnail,
      elapsedMs: e.elapsed_ms,
    })),
  };
}

/** Chỉ dùng cho test. */
export const _rooms = rooms;
