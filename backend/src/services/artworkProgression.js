// One completion keeps the original order of counters/evaluations and level baselines,
// but reads mission state once and persists the resulting changes in batches.
import { getDb, parseJson, tx } from '../config/db.js';
import * as User from '../models/user.js';
import { MAX_LEVEL, missionProgress } from './progression.js';
import { notifyMany } from './notifications.js';
import { emitToUser } from './realtime.js';

export async function recordArtworkCompletion(userId, { themeId, mode, data }) {
  return tx(async () => {
    const db = getDb();
    const [user, stats, missions, completed, total] = await Promise.all([
      User.findById(userId), User.getStats(userId),
      db.prepare('SELECT * FROM missions ORDER BY level,idx').all(),
      db.prepare('SELECT mission_id FROM user_missions WHERE user_id=?').all(userId),
      db.prepare('SELECT COUNT(*) AS c FROM themes WHERE active=1').get(),
    ]);
    const done = new Set(completed.map(row => row.mission_id));
    const byLevel = new Map();
    for (const mission of missions) {
      if (!byLevel.has(mission.level)) byLevel.set(mission.level, []);
      byLevel.get(mission.level).push(mission);
    }
    const events = [], notifications = [], earned = [], changed = new Map();
    const initialLevel = user.level;
    let baseline = parseJson(user.level_baseline, {}), ruby = 0;
    const setStat = (key, value) => { stats[key] = value; changed.set(key, value); };
    const evaluate = async () => {
      for (let guard=0; guard<MAX_LEVEL; guard++) {
        const levelMissions = byLevel.get(user.level) || [];
        if (!levelMissions.length) break;
        for (const mission of levelMissions) {
          if (done.has(mission.id) || await missionProgress(user, mission, stats, baseline, total.c) < mission.target) continue;
          done.add(mission.id); earned.push(mission.id); ruby += mission.ruby;
          const title = { vi:mission.title_vi, en:mission.title_en };
          events.push({ type:'mission_complete', missionId:mission.id, title, ruby:mission.ruby });
          notifications.push({ type:'mission_complete', data:{ title, ruby:mission.ruby } });
        }
        if (user.level >= MAX_LEVEL || !levelMissions.every(mission => done.has(mission.id))) break;
        events.push({ type:'level_up', from:user.level, to:user.level+1 });
        user.level++; baseline = { ...stats };
        notifications.push({ type:'level_up', data:{ level:user.level } });
      }
    };
    const record = async key => { setStat(key, (stats[key] || 0)+1); await evaluate(); };
    const themeKey = `theme_${themeId}`;
    if (!stats[themeKey]) {
      setStat(themeKey, 1); setStat('themes_tried', (stats.themes_tried || 0)+1);
      await evaluate();
    }
    if (mode === 'free') await record('complete_free');
    if (mode === 'template') await record('complete_template');
    if (data.glitter.length) await record('sparkle_use');
    if (data.strokes.some(stroke => stroke.tool === 'brush') && data.stickers.length) await record('brush_sticker');
    await record('complete_any');

    await db.prepare(`INSERT INTO user_stats (user_id,key,value) VALUES ${[...changed].map(() => '(?,?,?)').join(',')}
      ON CONFLICT (user_id,key) DO UPDATE SET value=excluded.value`)
      .run(...[...changed].flatMap(([key,value]) => [userId,key,value]));
    if (earned.length) await db.prepare(`INSERT INTO user_missions (user_id,mission_id,completed_at) VALUES
      ${earned.map(() => '(?,?,?)').join(',')}`).run(...earned.flatMap(id => [userId,id,new Date().toISOString()]));
    if (ruby || initialLevel !== user.level) await db.prepare('UPDATE users SET ruby=ruby+?,level=?,level_baseline=? WHERE id=?')
      .run(ruby, user.level, initialLevel === user.level ? user.level_baseline : JSON.stringify(baseline), userId);
    await notifyMany(userId, notifications);
    if (events.length) db.afterCommit(() => emitToUser(userId, 'progression', events));
    return events;
  });
}
