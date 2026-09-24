// Engine chấm điểm Đấu trường sáng tạo theo rubric (Mục 9.2).
// Chấm hoàn toàn trên dữ liệu số hoá: danh sách vùng + màu đã tô (Bucket fill) và nét Brush.
// Bucket fill không bao giờ bị tính là "lem"; chỉ nét Brush tràn ra ngoài vùng mới bị tính (Mục 3.4).
import { RUBRIC } from '../config/constants.js';

// ---------------- Màu sắc ----------------

export function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHsl([r, g, b]) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
}

const colorDist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) / 441.673;

function hueDiff(a, b) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/** Nhóm màu theo sắc độ: 12 dải màu × 3 mức sáng, màu trung tính tách riêng. */
export function colorBucket(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [h, s, l] = rgbToHsl(rgb);
  const lb = l < 0.33 ? 0 : l < 0.7 ? 1 : 2;
  if (s < 0.15 || l < 0.08 || l > 0.95) return `n${lb}`;
  return `h${Math.floor(h / 30)}l${lb}`;
}

// ---------------- Hình học ----------------

function pointInPoly(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function distToEdge(x, y, pts) {
  let best = Infinity;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [ax, ay] = pts[j];
    const [bx, by] = pts[i];
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2));
    best = Math.min(best, Math.hypot(x - (ax + t * dx), y - (ay + t * dy)));
  }
  return best;
}

/** Vùng trên cùng (theo thứ tự vẽ) chứa điểm (x, y). */
export function regionAt(regions, x, y) {
  for (let k = regions.length - 1; k >= 0; k--) {
    const r = regions[k];
    const b = r.bbox;
    if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) continue;
    if (pointInPoly(x, y, r.poly)) return k;
  }
  return -1;
}

/** Lấy mẫu dọc nét vẽ, mỗi mẫu đại diện cho ~`step` px chiều dài. */
function resample(points, step = 4) {
  const out = [];
  if (!points?.length) return out;
  out.push(points[0]);
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.ceil(len / step));
    for (let k = 1; k <= n; k++) out.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
  }
  return out;
}

// ---------------- Các tiêu chí ----------------

export function coverageScore(manifest, fills) {
  let total = 0;
  let filled = 0;
  for (const r of manifest.regions) {
    const a = Math.max(r.area, 1);
    total += a;
    if (fills[r.id]) filled += a;
  }
  return total ? filled / total : 0;
}

/**
 * Tỉ lệ "lem": phần nét Brush nằm ngoài vùng bắt đầu nét (có dung sai = nửa độ dày nét + 3px).
 * Nét bị Tẩy xoá đi thì không tính.
 */
export function spillRatio(manifest, strokes = []) {
  const regions = manifest.regions;
  const erasers = strokes.filter((s) => s.tool === 'eraser').map((s) => ({ pts: resample(s.points, 6), r: (s.size || 10) / 2 }));
  const erased = (x, y) => erasers.some((e) => e.pts.some(([ex, ey]) => Math.hypot(ex - x, ey - y) <= e.r));
  let total = 0;
  let spill = 0;
  for (const s of strokes) {
    if (s.tool === 'eraser' || !s.points?.length) continue;
    const pts = resample(s.points);
    const start = regionAt(regions, pts[0][0], pts[0][1]);
    const tol = (s.size || 8) / 2 + 3;
    for (const [x, y] of pts) {
      if (erased(x, y)) continue;
      total++;
      if (start < 0) continue;
      const k = regionAt(regions, x, y);
      if (k === start) continue;
      if (distToEdge(x, y, regions[start].poly) <= tol) continue;
      spill++;
    }
  }
  return total ? spill / total : 0;
}

export function accuracyScore(manifest, strokes) {
  const lem = spillRatio(manifest, strokes);
  // ≤10% lem: tối đa; ≥60%: 0; ở giữa giảm tuyến tính.
  if (lem <= 0.1) return 1;
  if (lem >= 0.6) return 0;
  return 1 - (lem - 0.1) / 0.5;
}

/** Màu đã dùng kèm trọng số diện tích. */
export function weightedColors(manifest, fills) {
  const map = new Map();
  let total = 0;
  for (const r of manifest.regions) {
    const c = fills[r.id];
    if (!c || !hexToRgb(c)) continue;
    const a = Math.max(r.area, 1);
    const key = c.toUpperCase();
    map.set(key, (map.get(key) || 0) + a);
    total += a;
  }
  return [...map.entries()].map(([color, a]) => ({ color, share: a / total, hsl: rgbToHsl(hexToRgb(color)) })).sort((a, b) => b.share - a.share);
}

function pairHarmony(a, b) {
  const [ha, sa, la] = a;
  const [hb, sb, lb] = b;
  if (sa < 0.15 || sb < 0.15) return 0.9; // màu trung tính hợp với mọi màu
  const d = hueDiff(ha, hb);
  let v;
  if (d <= 30) v = 1; // tương đồng
  else if (d <= 60) v = 0.75;
  else if (d < 100) v = 0.45; // vùng dễ "chỏi"
  else if (d <= 140) v = 0.85; // bộ ba
  else v = 1; // bổ túc
  if (d > 60 && d < 100 && sa > 0.85 && sb > 0.85 && Math.abs(la - lb) < 0.15) v = 0.3;
  return v;
}

export function harmonyScore(manifest, fills) {
  const colors = weightedColors(manifest, fills).slice(0, 6);
  if (!colors.length) return 0;
  if (colors.length === 1) return 0.5;
  let sum = 0;
  let wsum = 0;
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const w = colors[i].share * colors[j].share;
      sum += w * pairHarmony(colors[i].hsl, colors[j].hsl);
      wsum += w;
    }
  }
  const pair = wsum ? sum / wsum : 0.5;
  const dom = colors[0].hsl;
  const accent = colors.some(
    (c, k) =>
      k > 0 &&
      c.share >= 0.02 &&
      c.share <= 0.3 &&
      (Math.abs(c.hsl[2] - dom[2]) >= 0.2 || (c.hsl[1] > 0.3 && hueDiff(c.hsl[0], dom[0]) >= 90)),
  );
  return 0.8 * pair + 0.2 * (accent ? 1 : 0.3);
}

export function diversityScore(fills, strokes = []) {
  const buckets = new Set();
  for (const c of Object.values(fills)) {
    const b = colorBucket(c);
    if (b) buckets.add(b);
  }
  for (const s of strokes) if (s.tool !== 'eraser') buckets.add(colorBucket(s.color));
  buckets.delete(null);
  return Math.min(1, Math.max(0, (buckets.size - 1) / 5));
}

/**
 * Sáng tạo & khác biệt: với mỗi vùng bé đã tô, so màu của bé với màu trung bình
 * mà các bạn khác trong phòng dùng cho đúng vùng đó. Càng khác càng cao điểm.
 * Phòng chỉ có 1 người → so với bảng màu gợi ý của tranh.
 */
export function creativityScore(manifest, fills, otherFillsList) {
  let sum = 0;
  let wsum = 0;
  for (const r of manifest.regions) {
    const mine = hexToRgb(fills[r.id]);
    if (!mine) continue;
    const others = otherFillsList.map((f) => hexToRgb(f[r.id])).filter(Boolean);
    const ref = others.length
      ? others.reduce((acc, c) => [acc[0] + c[0] / others.length, acc[1] + c[1] / others.length, acc[2] + c[2] / others.length], [0, 0, 0])
      : hexToRgb(r.color);
    if (!ref) continue;
    const a = Math.max(r.area, 1);
    sum += a * Math.min(1, colorDist(mine, ref) / 0.45);
    wsum += a;
  }
  if (!wsum) return 0;
  const coverage = coverageScore(manifest, fills);
  return (sum / wsum) * Math.min(1, coverage / 0.6);
}

export function timeScore({ coverage, accuracy, elapsedMs, durationMs }) {
  if (coverage < 0.8 || accuracy < 0.5 || !durationMs) return 0;
  return Math.max(0, Math.min(1, 1 - elapsedMs / durationMs));
}

/** Làm sạch dữ liệu tranh gửi lên: chỉ giữ vùng có thật và mã màu hợp lệ. */
export function sanitizeArtworkData(manifest, data) {
  const ids = new Set(manifest.regions.map((r) => r.id));
  const fills = {};
  for (const [k, v] of Object.entries(data?.fills || {})) if (ids.has(k) && hexToRgb(v)) fills[k] = String(v).toUpperCase();
  const strokes = (Array.isArray(data?.strokes) ? data.strokes : []).slice(0, 2000).map((s) => ({
    tool: s.tool === 'eraser' ? 'eraser' : 'brush',
    color: hexToRgb(s.color) ? s.color : '#000000',
    size: Math.max(1, Math.min(80, Number(s.size) || 8)),
    points: (Array.isArray(s.points) ? s.points : [])
      .slice(0, 5000)
      .filter((p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]))
      .map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]),
    ...(s.skin ? { skin: String(s.skin).slice(0, 40) } : {}),
  }));
  const stickers = (Array.isArray(data?.stickers) ? data.stickers : []).slice(0, 100).map((s) => ({
    type: String(s.type || '').slice(0, 40),
    x: Number(s.x) || 0,
    y: Number(s.y) || 0,
    scale: Math.max(0.2, Math.min(5, Number(s.scale) || 1)),
    rot: Number(s.rot) || 0,
  }));
  const glitter = (Array.isArray(data?.glitter) ? data.glitter : []).filter((id) => ids.has(id));
  return { fills, strokes, stickers, glitter };
}

/** Chấm 1 bài thi. `others` = fills của các thí sinh khác trong phòng. */
export function scoreEntry(manifest, data, { others = [], elapsedMs = 0, durationMs = 0 } = {}) {
  const fills = data.fills || {};
  const strokes = data.strokes || [];
  const coverage = coverageScore(manifest, fills);
  const accuracy = accuracyScore(manifest, strokes);
  const scores = {
    coverage,
    accuracy,
    harmony: harmonyScore(manifest, fills),
    creativity: creativityScore(manifest, fills, others),
    diversity: diversityScore(fills, strokes),
    time: timeScore({ coverage, accuracy, elapsedMs, durationMs }),
  };
  let total = 0;
  for (const [k, w] of Object.entries(RUBRIC)) total += w * scores[k];
  for (const k of Object.keys(scores)) scores[k] = Math.round(scores[k] * 1000) / 1000;
  return { scores, total: Math.round(total * 1000) / 10 };
}

/**
 * Chấm cả phòng và xếp hạng. entries: [{ userId, data, elapsedMs, flagged }]
 * Bài bị gắn cờ gian lận vẫn được chấm để hiển thị nhưng không được xếp hạng.
 */
export function scoreRoom(manifest, entries, durationMs) {
  const results = entries.map((e) => {
    const others = entries.filter((o) => o !== e && o.data).map((o) => o.data.fills || {});
    const r = e.data ? scoreEntry(manifest, e.data, { others, elapsedMs: e.elapsedMs, durationMs }) : { scores: null, total: 0 };
    return { ...e, ...r };
  });
  const ranked = results
    .filter((r) => r.data && !r.flagged)
    .sort((a, b) => b.total - a.total || (a.elapsedMs ?? Infinity) - (b.elapsedMs ?? Infinity));
  ranked.forEach((r, i) => (r.place = i + 1));
  return results;
}
