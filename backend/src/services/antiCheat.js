// Chống gian lận Đấu trường (Mục 13): phát hiện hoàn thành quá nhanh hoặc thao tác dồn dập bất thường.

export const ANTI_CHEAT = {
  msPerRegion: 700, // người thật cần ≥ ~0,7 giây cho mỗi vùng tô
  minCompleteMs: 20000, // tô gần kín tranh dưới 20 giây là bất thường
  maxActionsPerSecond: 12,
  completeCoverage: 0.9,
};

/**
 * @param {object} p
 * @param {number} p.elapsedMs   thời gian từ lúc bắt đầu tới khi nộp (đo ở server)
 * @param {number} p.filledRegions  số vùng đã tô
 * @param {number} p.coverage    tỉ lệ phủ màu 0..1
 * @param {number[]} p.actionTimes  mốc thời gian (ms) các thao tác mà server nhận qua socket
 * @returns {{ flagged: boolean, reason: string|null }}
 */
export function checkEntry({ elapsedMs, filledRegions, coverage, actionTimes = [] }) {
  if (coverage >= ANTI_CHEAT.completeCoverage) {
    const minMs = Math.max(ANTI_CHEAT.minCompleteMs, filledRegions * ANTI_CHEAT.msPerRegion);
    if (elapsedMs < minMs) return { flagged: true, reason: 'too_fast' };
  }
  const times = [...actionTimes].sort((a, b) => a - b);
  for (let i = 0, j = 0; j < times.length; j++) {
    while (times[j] - times[i] > 1000) i++;
    if (j - i + 1 > ANTI_CHEAT.maxActionsPerSecond) return { flagged: true, reason: 'action_rate' };
  }
  // Số vùng đã tô vượt quá số thao tác ghi nhận được → dữ liệu bị chèn ngoài giao diện tô.
  if (actionTimes.length && filledRegions > actionTimes.length + 2) return { flagged: true, reason: 'injected' };
  return { flagged: false, reason: null };
}
