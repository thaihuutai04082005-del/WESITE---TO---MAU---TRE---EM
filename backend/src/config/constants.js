// Luật chơi & thông số kinh doanh — một nguồn duy nhất, frontend đọc qua GET /api/meta.

export const PLANS = {
  free: { key: 'free', priceVnd: 0, limit: { per: 'day', count: 2 } },
  month: { key: 'month', priceVnd: 19000, priceUsd: 0.79, days: 30, limit: null },
  year: { key: 'year', priceVnd: 149000, priceUsd: 5.99, days: 365, limit: null },
};

/** 6 bậc Rank theo Điểm Rank tích luỹ (không bao giờ bị trừ). */
/** Khung Artwork mặc định (miễn phí, ai cũng có): tranh hoàn thành tự dùng khung này nếu bé chưa chọn khung khác. */
export const DEFAULT_ARTWORK_FRAME = 'khung-go';

export const RANK_TIERS = [
  { key: 'bronze', min: 0, ruby: 0, color: '#B08D57', frame: 'avatar-dong' },
  { key: 'silver', min: 50, ruby: 50, color: '#C0C0C0', frame: 'avatar-bac' },
  { key: 'gold', min: 150, ruby: 100, color: '#FFD700', frame: 'avatar-vang' },
  { key: 'platinum', min: 300, ruby: 150, color: '#B9F2FF', frame: 'avatar-bach-kim' },
  { key: 'diamond', min: 500, ruby: 200, color: '#7DE2FF', frame: 'avatar-kim-cuong' },
  { key: 'master', min: 800, ruby: 300, color: '#FF5F7E', frame: 'avatar-cao-thu' },
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

// Gói thường / VIP (VIP = đang có gói Tháng hoặc Năm; hai kỳ hạn cùng quyền lợi).
export const TRADE_DAILY_LIMIT = 1; // gói thường; VIP xem TRADE_LIMITS
export const TRADE_LIMITS = { free: 1, vip: 5 };
export const STORYBOOK_LIMITS = { free: { books: 1, pages: 10 }, vip: { books: null, pages: 200 } };
export const COLLAB_MAX_PLAYERS = 4;
export const DRAFT_RETENTION_DAYS = 30;
export const DRAFT_WARNING_DAYS = 25;

/** Trọng số rubric chấm điểm (tổng = 100%). */
// Tô tay có khóa vùng (nét không thể lem sang vùng khác) nên không còn tiêu chí "độ gọn nét";
// trọng số cũ của 5 tiêu chí còn lại được chia lại theo tỉ lệ để tổng vẫn là 1.
export const RUBRIC = {
  coverage: 0.24,
  harmony: 0.24,
  creativity: 0.28,
  diversity: 0.12,
  time: 0.12,
};

export const AVATARS = ['meo', 'cho', 'tho', 'voi', 'gau', 'hoa', 'tao', 'dau-tay', 'o-to', 'may-bay', 'nam', 'cau-vong'];

// Chữ ký (Đợt 1): 5 mẫu Free + 5 mẫu "wow" chỉ mở khi có gói tháng/năm. 'hand' = tự ký bằng tay (chỉ VIP).
export const SIGNATURE_STYLES_FREE = ['classic', 'round', 'pen', 'neat', 'fun'];
export const SIGNATURE_STYLES_PREMIUM = ['gold', 'crown', 'rainbow', 'star', 'artist'];
export const SIGNATURE_INKS = ['#1B2A38', '#FFFFFF', '#C9961A', '#FF5F7E', '#2B7BE4', '#7D5FFF'];

// Hội trường triển lãm (Đợt 2).
export const EXHIBITION = {
  boards: ['free'], // một hội trường chung cho mọi tranh Sáng tạo (không còn chia phòng S/A/B)
  reactions: ['heart', 'cheer', 'clap', 'love', 'star'], // ❤️ 🎉 👏 😍 🌟 — mỗi cái 1 điểm
  perRound: { free: 1, month: 5, year: 5 },
  minCoverage: 0.8, // điều 2: tô ≥ 80% diện tích
  minMs: 20000, // điều 8: tô dưới 20 giây…
  msPerRegion: 700, // …hoặc dưới 0,7 giây mỗi vùng đã tô
  autoBrushStrokes: 3, // ≤ 3 nét cọ tự do không khóa vùng (≤ 200 điểm) → tự duyệt; nét tô tay đã khóa vùng không tính
  autoBrushPoints: 200,
  trustedStreak: 3, // 3 tranh liên tiếp được duyệt, chưa vi phạm điều 6–7 → tự duyệt
  hideAfterReports: 3,
};
