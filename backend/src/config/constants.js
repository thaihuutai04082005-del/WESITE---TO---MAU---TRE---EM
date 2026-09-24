// Luật chơi & thông số kinh doanh — một nguồn duy nhất, frontend đọc qua GET /api/meta.

export const PLANS = {
  free: { key: 'free', priceVnd: 0, limit: { per: 'day', count: 1 } },
  month: { key: 'month', priceVnd: 49000, priceUsd: 1.99, days: 30, limit: { per: 'period', count: 100 } },
  year: { key: 'year', priceVnd: 499000, priceUsd: 19.99, days: 365, limit: null },
};

/** 5 bậc Rank theo Điểm Rank tích luỹ (không bao giờ bị trừ). */
export const RANK_TIERS = [
  { key: 'bronze', min: 0, ruby: 0, color: '#B08D57', frame: 'avatar-dong' },
  { key: 'silver', min: 50, ruby: 50, color: '#C0C0C0', frame: 'avatar-bac' },
  { key: 'gold', min: 150, ruby: 100, color: '#FFD700', frame: 'avatar-vang' },
  { key: 'platinum', min: 300, ruby: 150, color: '#B9F2FF', frame: 'avatar-bach-kim' },
  { key: 'diamond', min: 500, ruby: 200, color: '#7DE2FF', frame: 'avatar-kim-cuong' },
];

export function rankOf(points) {
  let tier = RANK_TIERS[0];
  for (const t of RANK_TIERS) if (points >= t.min) tier = t;
  return tier;
}

export const rankIndex = (key) => RANK_TIERS.findIndex((t) => t.key === key);

/** Điểm thưởng Đấu trường: cộng đồng thời vào Điểm Rank và Điểm Gacha. */
export const ARENA_REWARDS = [10, 8, 6];
export const ARENA_ROOM_SIZE = 10;

export const GACHA_COST = 50;
export const GACHA_RATES = [
  { rarity: 'S', weight: 5 },
  { rarity: 'A', weight: 12 },
  { rarity: 'B', weight: 34 },
  { rarity: 'C', weight: 49 },
];

export const MISSION_RUBY = { easy: 10, medium: 20, hard: 30 };

export const TRADE_DAILY_LIMIT = 3;
export const COLLAB_MAX_PLAYERS = 4;
export const DRAFT_RETENTION_DAYS = 30;
export const DRAFT_WARNING_DAYS = 25;

/** Trọng số rubric chấm điểm (tổng = 100%). */
export const RUBRIC = {
  coverage: 0.2,
  accuracy: 0.15,
  harmony: 0.2,
  creativity: 0.25,
  diversity: 0.1,
  time: 0.1,
};

export const AVATARS = ['meo', 'cho', 'tho', 'voi', 'gau', 'hoa', 'tao', 'dau-tay', 'o-to', 'may-bay', 'nam', 'cau-vong'];
