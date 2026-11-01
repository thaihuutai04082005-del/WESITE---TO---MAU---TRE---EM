// Độ phủ màu của một vùng khi tô tay: tỉ lệ diện tích vùng đã có nét vẽ (nét tẩy trừ đi).
import { drawStroke } from './brush';

export const FILL_THRESHOLD = 0.8; // phủ ≥ 80% diện tích thì tính là vùng đã tô

const N = 300; // lưới đo 300×300 (0,5 px / đơn vị tranh)

let c1 = null;
let c2 = null;
const ctx1 = () => (c1 ||= Object.assign(document.createElement('canvas'), { width: N, height: N }).getContext('2d', { willReadFrequently: true }));
const ctx2 = () => (c2 ||= Object.assign(document.createElement('canvas'), { width: N, height: N }).getContext('2d', { willReadFrequently: true }));

export function regionCoverage(path, strokes) {
  const s = N / 600;
  const area = ctx2();
  area.clearRect(0, 0, N, N);
  area.save();
  area.setTransform(s, 0, 0, s, 0, 0);
  area.fillStyle = '#000';
  area.fill(path);
  area.restore();
  const a = area.getImageData(0, 0, N, N).data;
  const paint = ctx1();
  paint.clearRect(0, 0, N, N);
  for (const st of strokes) drawStroke(paint, st, s, path);
  const p = paint.getImageData(0, 0, N, N).data;
  let total = 0;
  let covered = 0;
  for (let i = 3; i < a.length; i += 4) {
    if (a[i] > 127) {
      total++;
      if (p[i] > 40) covered++;
    }
  }
  return total ? covered / total : 0;
}

/** Màu chiếm nhiều nhất (theo độ dài nét) trong các nét của vùng. */
export function dominantColor(strokes) {
  const w = new Map();
  for (const st of strokes) {
    if (st.tool === 'eraser') continue;
    w.set(st.color, (w.get(st.color) || 0) + (st.points?.length || 1) * (st.size || 1));
  }
  let best = null;
  for (const [c, v] of w) if (!best || v > best[1]) best = [c, v];
  return best?.[0] || null;
}
