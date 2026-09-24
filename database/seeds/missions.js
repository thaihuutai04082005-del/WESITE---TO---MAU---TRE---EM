// 20 cấp khởi điểm × 3 nhiệm vụ. Cấp 1–5 dễ (10 Ruby), 6–15 trung bình (20 Ruby), 16–20 khó (30 Ruby).
const T = {
  complete_any: [(n) => `Tô xong ${n} tranh`, (n) => `Finish ${n} picture${n > 1 ? 's' : ''}`],
  complete_free: [(n) => `Tô xong ${n} tranh Sáng tạo`, (n) => `Finish ${n} Free Coloring picture${n > 1 ? 's' : ''}`],
  complete_template: [(n) => `Tô xong ${n} tranh Theo mẫu`, (n) => `Finish ${n} Paint-by-Number picture${n > 1 ? 's' : ''}`],
  login_streak: [(n) => `Đăng nhập ${n} ngày liên tiếp`, (n) => `Log in ${n} days in a row`],
  new_theme: [() => 'Thử tô 1 chủ đề mới', () => 'Try a new theme'],
  download: [(n) => `Tải về hoặc in ${n} tranh`, (n) => `Download or print ${n} picture${n > 1 ? 's' : ''}`],
  sparkle_use: [(n) => `Dùng hiệu ứng lấp lánh trong ${n} tranh`, (n) => `Use sparkles in ${n} picture${n > 1 ? 's' : ''}`],
  brush_sticker: [(n) => `Dùng thử Brush + Sticker trong ${n} tranh`, (n) => `Use Brush + Sticker in ${n} picture${n > 1 ? 's' : ''}`],
  friend_add: [(n) => `Kết bạn với ${n} bạn`, (n) => `Make ${n} friend${n > 1 ? 's' : ''}`],
  arena_join: [(n) => `Tham gia Đấu trường sáng tạo ${n} lần`, (n) => `Join the Creative Arena ${n} time${n > 1 ? 's' : ''}`],
  collab_join: [(n) => `Tô cùng bạn bè ${n} lần`, (n) => `Color together with friends ${n} time${n > 1 ? 's' : ''}`],
  shop_buy: [(n) => `Mua ${n} món trong Shop`, (n) => `Buy ${n} item${n > 1 ? 's' : ''} in the Shop`],
  flipbook_complete: [(n) => `Hoàn thành ${n} cuốn Flipbook`, (n) => `Finish ${n} Flipbook${n > 1 ? 's' : ''}`],
  rank_at_least: [(n, p) => `Đạt Rank ${{ silver: 'Bạc', gold: 'Vàng' }[p]} trở lên`, (n, p) => `Reach ${p[0].toUpperCase() + p.slice(1)} rank or higher`],
};

const LEVELS = [
  /* 1 */ [['complete_any', 1], ['login_streak', 2], ['new_theme', 1]],
  /* 2 */ [['complete_template', 1], ['download', 1], ['complete_free', 1]],
  /* 3 */ [['complete_any', 2], ['sparkle_use', 1], ['new_theme', 1]],
  /* 4 */ [['brush_sticker', 1], ['complete_any', 2], ['login_streak', 3]],
  /* 5 */ [['complete_free', 2], ['friend_add', 1], ['download', 1]],
  /* 6 */ [['complete_free', 5], ['arena_join', 1], ['brush_sticker', 1]],
  /* 7 */ [['complete_any', 4], ['new_theme', 1], ['sparkle_use', 2]],
  /* 8 */ [['arena_join', 1], ['collab_join', 1], ['complete_template', 3]],
  /* 9 */ [['shop_buy', 1], ['complete_free', 3], ['login_streak', 3]],
  /* 10 */ [['arena_join', 2], ['complete_any', 5], ['download', 2]],
  /* 11 */ [['collab_join', 1], ['complete_free', 4], ['new_theme', 1]],
  /* 12 */ [['arena_join', 2], ['sparkle_use', 3], ['complete_template', 3]],
  /* 13 */ [['complete_free', 5], ['friend_add', 1], ['brush_sticker', 2]],
  /* 14 */ [['arena_join', 2], ['complete_any', 6], ['login_streak', 4]],
  /* 15 */ [['complete_free', 6], ['download', 3], ['new_theme', 1]],
  /* 16 */ [['arena_join', 3], ['complete_free', 5], ['sparkle_use', 3]],
  /* 17 */ [['flipbook_complete', 1], ['complete_any', 8], ['collab_join', 1]],
  /* 18 */ [['rank_at_least', 1, 'silver'], ['arena_join', 3], ['download', 3]],
  /* 19 */ [['complete_free', 8], ['shop_buy', 1], ['brush_sticker', 2]],
  /* 20 */ [['arena_join', 3], ['flipbook_complete', 1], ['complete_any', 10]],
];

export const MISSIONS = LEVELS.flatMap((ms, i) => {
  const level = i + 1;
  const difficulty = level <= 5 ? 'easy' : level <= 15 ? 'medium' : 'hard';
  return ms.map(([type, target, param], idx) => ({
    level,
    idx: idx + 1,
    type,
    target,
    param: param || null,
    difficulty,
    ruby: { easy: 10, medium: 20, hard: 30 }[difficulty],
    title_vi: T[type][0](target, param),
    title_en: T[type][1](target, param),
  }));
});
