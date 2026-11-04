import { asyncMap } from '../utils/asyncArray.js';
// Hệ thống tiến trình tài khoản (Mục 8): Level & nhiệm vụ, Rank, Ruby.
// 4 hệ độc lập: Level (nhiệm vụ) — Rank (điểm thi đấu, không bao giờ trừ) — Điểm Gacha (bị trừ khi bóc) — Ruby.
import { getDb, parseJson, tx } from '../config/db.js';
import { RANK_TIERS, rankOf, rankIndex } from '../config/constants.js';
import * as User from '../models/user.js';
import { notify } from './notifications.js';
import { emitToUser } from './realtime.js';

export const MAX_LEVEL = 20;

const COUNTER_TYPES = new Set([
  'complete_any',
  'complete_free',
  'complete_template',
  'download',
  'sparkle_use',
  'brush_sticker',
  'friend_add',
  'arena_join',
  'collab_join',
  'shop_buy',
  'flipbook_complete',
]);

const totalThemes = async () => (await getDb().prepare('SELECT COUNT(*) AS c FROM themes WHERE active = 1').get()).c;
const missionsOfLevel = async (level) => await getDb().prepare('SELECT * FROM missions WHERE level = ? ORDER BY idx').all(level);
const completedSet = async (userId) =>
  new Set((await getDb().prepare('SELECT mission_id FROM user_missions WHERE user_id = ?').all(userId)).map((r) => r.mission_id));

export async function missionProgress(user, mission, stats, baseline, activeThemeCount) {
  const t = mission.type;
  let value;
  if (COUNTER_TYPES.has(t)) value = (stats[t] || 0) - (baseline[t] || 0);
  else if (t === 'login_streak') value = user.login_streak;
  else if (t === 'new_theme') {
    const tried = stats.themes_tried || 0;
    value = tried >= (activeThemeCount ?? await totalThemes()) ? mission.target : tried - (baseline.themes_tried || 0);
  } else if (t === 'rank_at_least') value = rankIndex(rankOf(user.rank_points).key) >= rankIndex(mission.param) ? 1 : 0;
  else value = 0;
  return Math.max(0, Math.min(mission.target, value));
}

/** Xét hoàn thành nhiệm vụ & lên cấp. Trả về danh sách sự kiện để client hiện popup. */
export async function evaluate(userId) {
  const events = [];
  await tx(async () => {
    for (let guard = 0; guard < MAX_LEVEL; guard++) {
      const user = await User.findById(userId);
      const stats = await User.getStats(userId);
      const baseline = parseJson(user.level_baseline, {});
      const missions = await missionsOfLevel(user.level);
      if (!missions.length) break;
      const done = await completedSet(userId);
      for (const m of missions) {
        if (done.has(m.id)) continue;
        if ((await missionProgress(user, m, stats, baseline)) >= m.target) {
          await getDb()
            .prepare('INSERT INTO user_missions (user_id, mission_id, completed_at) VALUES (?, ?, ?)')
            .run(userId, m.id, new Date().toISOString());
          await User.addBalances(userId, { ruby: m.ruby });
          done.add(m.id);
          events.push({ type: 'mission_complete', missionId: m.id, title: { vi: m.title_vi, en: m.title_en }, ruby: m.ruby });
          await notify(userId, 'mission_complete', { title: { vi: m.title_vi, en: m.title_en }, ruby: m.ruby });
        }
      }
      const allDone = missions.every((m) => done.has(m.id));
      if (!allDone || user.level >= MAX_LEVEL) break;
      // Lên cấp: mốc thống kê mới để nhiệm vụ cấp sau đếm từ đầu.
      await User.update(userId, { level: user.level + 1, level_baseline: JSON.stringify(await User.getStats(userId)) });
      events.push({ type: 'level_up', from: user.level, to: user.level + 1 });
      await notify(userId, 'level_up', { level: user.level + 1 });
    }
  });
  if (events.length) getDb().afterCommit(() => emitToUser(userId, 'progression', events));
  return events;
}

/** Ghi nhận 1 hoạt động (tăng bộ đếm) rồi xét nhiệm vụ. */
export async function record(userId, key, by = 1) {
  await User.incrStat(userId, key, by);
  return await evaluate(userId);
}

/** Đánh dấu đã thử chủ đề (cho nhiệm vụ "Thử 1 chủ đề mới"). */
export async function markThemeTried(userId, themeId) {
  const key = `theme_${themeId}`;
  const stats = await User.getStats(userId);
  if (stats[key]) return [];
  await User.setStat(userId, key, 1);
  await User.incrStat(userId, 'themes_tried', 1);
  return await evaluate(userId);
}

/**
 * Cộng thưởng thi đấu: Điểm Rank + Điểm Gacha cùng lúc (Mục 9.3).
 * Thăng bậc → mở khoá đúng Khung Avatar của bậc đó + cộng Ruby.
 */
export async function awardArena(userId, points) {
  const events = [];
  await tx(async () => {
    const before = await User.findById(userId);
    await User.addBalances(userId, { rankPoints: points, gachaPoints: points });
    const after = await User.findById(userId);
    const from = rankIndex(rankOf(before.rank_points).key);
    const to = rankIndex(rankOf(after.rank_points).key);
    for (let i = from + 1; i <= to; i++) {
      const tier = RANK_TIERS[i];
      await grantAvatarFrame(userId, tier.frame);
      await User.addBalances(userId, { ruby: tier.ruby });
      await User.update(userId, { avatar_frame: tier.frame });
      events.push({ type: 'rank_up', rank: tier.key, frame: tier.frame, ruby: tier.ruby });
      await notify(userId, 'rank_up', { rank: tier.key, ruby: tier.ruby });
    }
  });
  if (events.length) getDb().afterCommit(() => emitToUser(userId, 'progression', events));
  return [...events, ...(await evaluate(userId))];
}

export async function grantAvatarFrame(userId, slug) {
  const item = await getDb().prepare('SELECT id FROM items WHERE slug = ?').get(slug);
  if (item) await getDb().prepare("INSERT OR IGNORE INTO user_items (user_id, item_id, source) VALUES (?, ?, 'rank')").run(userId, item.id);
}

/** Cập nhật chuỗi ngày đăng nhập liên tiếp (tính theo ngày VN). */
export async function touchLogin(userId, todayKey) {
  const u = await User.findById(userId);
  if (u.last_login_date === todayKey) return [];
  const yesterday = new Date(Date.parse(`${todayKey}T00:00:00Z`) - 86400000).toISOString().slice(0, 10);
  const streak = u.last_login_date === yesterday ? u.login_streak + 1 : 1;
  await User.update(userId, { login_streak: streak, last_login_date: todayKey });
  return await evaluate(userId);
}

export async function view(userId, lang = 'vi', currentUser) {
  const user = currentUser?.id === userId ? currentUser : await User.findById(userId);
  const [stats, done, levelMissions] = await Promise.all([
    User.getStats(userId), completedSet(userId), missionsOfLevel(user.level),
  ]);
  const baseline = parseJson(user.level_baseline, {});
  const missions = await asyncMap(levelMissions, async (m) => ({
    id: m.id,
    title: lang === 'en' ? m.title_en : m.title_vi,
    titles: { vi: m.title_vi, en: m.title_en },
    difficulty: m.difficulty,
    ruby: m.ruby,
    target: m.target,
    progress: done.has(m.id) ? m.target : await missionProgress(user, m, stats, baseline),
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
