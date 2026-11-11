// Làm sẵn màn danh sách tranh của một chủ đề trong lúc đang chạy hiệu ứng (tranh bay vào Bộ sưu tập):
// tải dữ liệu + dựng sẵn từng SVG tranh mẫu, mỗi việc một lượt nhỏ để luồng chính không bị đứng → khi mở trang, trang dựng gần như tức thì (hết giật).
import { api } from '../services/api';
import { referenceSvgHtml } from './picture';

const themes = new Map();
const thumbs = new Map(); // slug → blob URL ảnh nhỏ (WebP) của tranh mẫu

/** Ảnh nhỏ đã làm sẵn của tranh mẫu (nhẹ hơn nhiều so với dựng cả SVG kèm lớp nét ảnh nhúng); chưa có thì null. */
export const thumbOf = (slug) => thumbs.get(slug) || null;

async function makeThumb(p) {
  if (thumbs.has(p.slug) || !p.svg) return;
  const src = URL.createObjectURL(new Blob([referenceSvgHtml(p)], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = 420;
    c.height = 420;
    c.getContext('2d').drawImage(img, 0, 0, 420, 420);
    const blob = await new Promise((r) => c.toBlob(r, 'image/webp', 0.86));
    if (blob) {
      if (thumbs.size >= 80) URL.revokeObjectURL(thumbs.get(thumbs.keys().next().value)), thumbs.delete(thumbs.keys().next().value);
      thumbs.set(p.slug, URL.createObjectURL(blob));
    }
  } finally {
    URL.revokeObjectURL(src);
  }
}

/** Lấy (và bỏ khỏi bộ nhớ đệm) dữ liệu chủ đề đã tải sẵn; không có thì null. */
export function takePrefetchedTheme(slug) {
  const d = themes.get(slug) || null;
  themes.delete(slug);
  return d;
}

export async function warmTheme(slug, budgetMs = 1600) {
  const t0 = performance.now();
  try {
    const data = await api.get(`/themes/${slug}/pictures`);
    themes.set(slug, data);
    for (const p of data.pictures || []) {
      if (performance.now() - t0 > budgetMs) break;
      if (p.thumb) {
        // ảnh nhỏ server dựng sẵn: chỉ cần tải trước vào bộ nhớ đệm của trình duyệt
        const img = new Image();
        img.src = p.thumb;
        await img.decode().catch(() => {});
      } else await makeThumb(p).catch(() => {});
    }
  } catch {
    /* không làm sẵn được thì trang tự tải như bình thường */
  }
}
