// Hệ thống tiến trình tài khoản (Mục 8): Level & nhiệm vụ, Rank, Ruby.
// 4 hệ độc lập: Level (nhiệm vụ) — Rank (điểm thi đấu, không bao giờ trừ) — Điểm Gacha (bị trừ khi bóc) — Ruby.
import { getDb, parseJson, tx } from '../config/db.js';
import { RANK_TIERS, rankOf, rankIndex } from '../config/constants.js';
import * as User from '../models/user.js';
import { notify } from './notifications.js';
import { emitToUser } from './realtime.js';

export const MAX_LEVEL = 20;

const COUNTER_TYPES = new Set([
  'complete_any', 'complete_free', 'complete_template', 'download', 'sparkle_use', 'brush_sticker',
  'friend_add', 'arena_join', 'collab_join', 'shop_buy', 'flipbook_complete',
]);

const totalThemes = () => getDb().prepare('SELECT COUNT(*) AS c FROM themes').get().c;
const missionsOfLevel = (level) => getDb().prepare('SELECT * FROM missions WHERE level = ? ORDER BY idx').all(level);
const completedSet = (userId) =>
  new Set(getDb().prepare('SELECT mission_id FROM user_missions WHERE user_id = ?').all(userId).map((r) => r.mission_id));

export function missionProgress(user, mission, stats, baseline) {
  const t = mission.type;
  let value;
  if (COUNTER_TYPES.has(t)) value = (stats[t] || 0) - (baseline[t] || 0);
  else if (t === 'login_streak') value = user.login_streak;
  else if (t === 'new_theme') {
    const tried = stats.themes_tried || 0;
    value = tried >= totalThemes() ? mission.target : tried - (baseline.themes_tried || 0);
  } else if (t === 'rank_at_least') value = rankIndex(rankOf(user.rank_points).key) >= rankIndex(mission.param) ? 1 : 0;
  else value = 0;
  return Math.max(0, Math.min(mission.target, value));
}

/** Xét hoàn thành nhiệm vụ & lên cấp. Trả về danh sách sự kiện để client hiện popup. */
export function evaluate(userId) {
  const events = [];
  tx(() => {
    for (let guard = 0; guard < MAX_LEVEL; guard++) {
      const user = User.findById(userId);
      const stats = User.getStats(userId);
      const baseline = parseJson(user.level_baseline, {});
      const missions = missionsOfLevel(user.level);
      if (!missions.length) break;
      const done = completedSet(userId);
      for (const m of missions) {
        if (done.has(m.id)) continue;
        if (missionProgress(user, m, stats, baseline) >= m.target) {
          getDb().prepare('INSERT INTO user_missions (user_id, mission_id, completed_at) VALUES (?, ?, ?)').run(userId, m.id, new Date().toISOString());
          User.addBalances(userId, { ruby: m.ruby });
          done.add(m.id);
          events.push({ type: 'mission_complete', missionId: m.id, title: { vi: m.title_vi, en: m.title_en }, ruby: m.ruby });
          notify(userId, 'mission_complete', { title: { vi: m.title_vi, en: m.title_en }, ruby: m.ruby });
        }
      }
      const allDone = missions.every((m) => done.has(m.id));
      if (!allDone || user.level >= MAX_LEVEL) break;
      // Lên cấp: mốc thống kê mới để nhiệm vụ cấp sau đếm từ đầu.
      User.update(userId, { level: user.level + 1, level_baseline: JSON.stringify(User.getStats(userId)) });
      events.push({ type: 'level_up', from: user.level, to: user.level + 1 });
      notify(userId, 'level_up', { level: user.level + 1 });
    }
  });
  if (events.length) emitToUser(userId, 'progression', events);
  return events;
}

/** Ghi nhận 1 hoạt động (tăng bộ đếm) rồi xét nhiệm vụ. */
export function record(userId, key, by = 1) {
  User.incrStat(userId, key, by);
  return evaluate(userId);
}

/** Đánh dấu đã thử chủ đề (cho nhiệm vụ "Thử 1 chủ đề mới"). */
export function markThemeTried(userId, themeId) {
  const key = `theme_${themeId}`;
  const stats = User.getStats(userId);
  if (stats[key]) return [];
  User.setStat(userId, key, 1);
  User.incrStat(userId, 'themes_tried', 1);
  return evaluate(userId);
}

/**
 * Cộng thưởng thi đấu: Điểm Rank + Điểm Gacha cùng lúc (Mục 9.3).
 * Thăng bậc → mở khoá đúng Khung Avatar của bậc đó + cộng Ruby.
 */
export function awardArena(userId, points) {
  const events = [];
  tx(() => {
    const before = User.findById(userId);
    User.addBalances(userId, { rankPoints: points, gachaPoints: points });
    const after = User.findById(userId);
    const from = rankIndex(rankOf(before.rank_points).key);
    const to = rankIndex(rankOf(after.rank_points).key);
    for (let i = from + 1; i <= to; i++) {
      const tier = RANK_TIERS[i];
      grantAvatarFrame(userId, tier.frame);
      User.addBalances(userId, { ruby: tier.ruby });
      User.update(userId, { avatar_frame: tier.frame });
      events.push({ type: 'rank_up', rank: tier.key, frame: tier.frame, ruby: tier.ruby });
      notify(userId, 'rank_up', { rank: tier.key, ruby: tier.ruby });
    }
  });
  if (events.length) emitToUser(userId, 'progression', events);
  return [...events, ...evaluate(userId)];
}

export function grantAvatarFrame(userId, slug) {
  const item = getDb().prepare('SELECT id FROM items WHERE slug = ?').get(slug);
  if (item) getDb().prepare("INSERT OR IGNORE INTO user_items (user_id, item_id, source) VALUES (?, ?, 'rank')").run(userId, item.id);
}

/** Cập nhật chuỗi ngày đăng nhập liên tiếp (tính theo ngày VN). */
export function touchLogin(userId, todayKey) {
  const u = User.findById(userId);
  if (u.last_login_date === todayKey) return [];
  const yesterday = new Date(Date.parse(`${todayKey}T00:00:00Z`) - 86400000).toISOString().slice(0, 10);
  const streak = u.last_login_date === yesterday ? u.login_streak + 1 : 1;
  User.update(userId, { login_streak: streak, last_login_date: todayKey });
  return evaluate(userId);
}

export function view(userId, lang = 'vi') {
  const user = User.findById(userId);
  const stats = User.getStats(userId);
  const baseline = parseJson(user.level_baseline, {});
  const done = completedSet(userId);
  const missions = missionsOfLevel(user.level).map((m) => ({
    id: m.id,
    title: lang === 'en' ? m.title_en : m.title_vi,
    titles: { vi: m.title_vi, en: m.title_en },
    difficulty: m.difficulty,
    ruby: m.ruby,
    target: m.target,
    progress: done.has(m.id) ? m.target : missionProgress(user, m, stats, baseline),
    completed: done.has(m.id),
  }));
  const tier = rankOf(user.rank_points);
  const idx = rankIndex(tier.key);
  const next = RANK_TIERS[idx + 1] || null;
  return {
    level: user.level,
    maxLevel: MAX_LEVEL,
    maxed: user.level >= MAX_LEVEL && missions.every((m) => m.completed),
    missions,
    rank: {
      key: tier.key,
      points: user.rank_points,
      currentMin: tier.min,
      next: next ? { key: next.key, min: next.min, ruby: next.ruby } : null,
    },
    ruby: user.ruby,
    gachaPoints: user.gacha_points,
    loginStreak: user.login_streak,
    stats,
  };
}
