// Truy vấn bảng users & user_stats.
import { getDb, parseJson } from '../config/db.js';
import { rankOf } from '../config/constants.js';
import { randomCode } from '../utils/ids.js';

export const findById = (id) => getDb().prepare('SELECT * FROM users WHERE id = ?').get(id);
export const findByUsername = (u) => getDb().prepare('SELECT * FROM users WHERE username = ?').get(u);
export const findByGoogleSub = (sub) => getDb().prepare('SELECT * FROM users WHERE google_sub = ?').get(sub);
export const findByFriendCode = (c) => getDb().prepare('SELECT * FROM users WHERE friend_code = ?').get(String(c).toUpperCase());
export const findByGuardian = (contact) =>
  getDb().prepare('SELECT id, username, nickname FROM users WHERE guardian_contact = ? AND username IS NOT NULL').all(contact);

function uniqueFriendCode() {
  for (;;) {
    const code = randomCode(8);
    if (!findByFriendCode(code)) return code;
  }
}

export function create(fields) {
  const f = { friend_code: uniqueFriendCode(), ...fields };
  const cols = Object.keys(f);
  const res = getDb()
    .prepare(`INSERT INTO users (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`)
    .run(...cols.map((c) => f[c]));
  return findById(Number(res.lastInsertRowid));
}

const UPDATABLE = new Set([
  'nickname', 'avatar', 'avatar_frame', 'brush_skin', 'language', 'password_hash', 'rank_points', 'gacha_points',
  'ruby', 'level', 'level_baseline', 'login_streak', 'last_login_date', 'google_sub', 'google_email', 'role',
]);

export function update(id, fields) {
  const cols = Object.keys(fields).filter((c) => UPDATABLE.has(c));
  if (!cols.length) return findById(id);
  getDb()
    .prepare(`UPDATE users SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`)
    .run(...cols.map((c) => fields[c]), id);
  return findById(id);
}

export function addBalances(id, { ruby = 0, rankPoints = 0, gachaPoints = 0 }) {
  getDb()
    .prepare('UPDATE users SET ruby = ruby + ?, rank_points = rank_points + ?, gacha_points = gacha_points + ? WHERE id = ?')
    .run(ruby, rankPoints, gachaPoints, id);
}

// ---------- Thống kê hoạt động (phục vụ nhiệm vụ) ----------
export function getStats(userId) {
  const rows = getDb().prepare('SELECT key, value FROM user_stats WHERE user_id = ?').all(userId);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export function incrStat(userId, key, by = 1) {
  getDb()
    .prepare('INSERT INTO user_stats (user_id, key, value) VALUES (?, ?, ?) ON CONFLICT (user_id, key) DO UPDATE SET value = value + excluded.value')
    .run(userId, key, by);
}

export function setStat(userId, key, value) {
  getDb()
    .prepare('INSERT INTO user_stats (user_id, key, value) VALUES (?, ?, ?) ON CONFLICT (user_id, key) DO UPDATE SET value = excluded.value')
    .run(userId, key, value);
}

/** Thông tin công khai (hiển thị cho bạn bè / phòng đấu). */
export function publicProfile(u) {
  if (!u) return null;
  return {
    id: u.id,
    nickname: u.nickname || u.username || 'Bé',
    avatar: u.avatar,
    avatarFrame: u.avatar_frame,
    rank: rankOf(u.rank_points).key,
    level: u.level,
  };
}

/** Thông tin đầy đủ cho chính chủ tài khoản. */
export function selfProfile(u) {
  return {
    ...publicProfile(u),
    username: u.username,
    hasPassword: !!u.password_hash,
    googleLinked: !!u.google_sub,
    guardianType: u.guardian_type,
    guardianMasked: maskContact(u.guardian_contact),
    needsNickname: !u.nickname,
    brushSkin: u.brush_skin,
    language: u.language,
    role: u.role,
    friendCode: u.friend_code,
    rankPoints: u.rank_points,
    gachaPoints: u.gacha_points,
    ruby: u.ruby,
    loginStreak: u.login_streak,
    levelBaseline: parseJson(u.level_baseline, {}),
    createdAt: u.created_at,
  };
}

export function maskContact(c) {
  if (!c) return null;
  if (c.includes('@')) {
    const [name, domain] = c.split('@');
    return `${name.slice(0, 2)}***@${domain}`;
  }
  return `${c.slice(0, 3)}****${c.slice(-3)}`;
}
