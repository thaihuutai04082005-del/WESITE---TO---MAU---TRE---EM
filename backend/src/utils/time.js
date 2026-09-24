// Tiện ích thời gian. "Ngày" tính theo giờ Việt Nam (UTC+7) để lượt Free reset lúc 0h VN.
export const VN_OFFSET_MS = 7 * 3600 * 1000;

export function vnDateKey(d = new Date()) {
  return new Date(d.getTime() + VN_OFFSET_MS).toISOString().slice(0, 10);
}

/** Thời điểm bắt đầu ngày (giờ VN) chứa `d`, trả về ISO UTC. */
export function vnDayStart(d = new Date()) {
  const key = vnDateKey(d);
  return new Date(Date.parse(`${key}T00:00:00Z`) - VN_OFFSET_MS).toISOString();
}

export function addDays(d, days) {
  return new Date(new Date(d).getTime() + days * 86400000);
}

/** Tuần ISO dạng "2026-W39" (theo giờ VN) — dùng cho bảng xếp hạng Đấu trường hàng tuần. */
export function isoWeek(d = new Date()) {
  const t = new Date(d.getTime() + VN_OFFSET_MS);
  const date = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}
