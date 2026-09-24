import { env } from '../config/env.js';
import { ARENA_REWARDS, ARENA_ROOM_SIZE, RUBRIC } from '../config/constants.js';
import { slotStatus, weeklyLeaderboard, history, roomResult } from '../services/arena.js';
import { isoWeek } from '../utils/time.js';
import { notFound } from '../utils/http.js';

export function info(req, res) {
  res.json({
    slot: slotStatus(),
    week: isoWeek(),
    leaderboard: weeklyLeaderboard(),
    rules: { roomSize: ARENA_ROOM_SIZE, durationSec: env.arena.durationSec, rewards: ARENA_REWARDS, rubric: RUBRIC, minPlayers: env.arena.minPlayers },
    history: history(req.user.id, 10),
  });
}

export function result(req, res) {
  const r = roomResult(Number(req.params.id));
  if (!r || !r.board.some((e) => e.user?.id === req.user.id)) throw notFound();
  res.json(r);
}
