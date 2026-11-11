// Ảnh nhỏ (WebP) của tranh mẫu cho các trang danh sách. Trước đây danh sách gửi kèm cả SVG tranh (có lớp nét ảnh nhúng,
// ~100–450KB mỗi tranh) nên trang chủ phải tải ~7MB và trình duyệt phải dựng hàng chục SVG nặng → web rất chậm, giật.
// Giờ danh sách chỉ gửi đường dẫn ảnh nhỏ (~15–20KB); ảnh được dựng 1 lần trên server rồi lưu vào đĩa, trình duyệt nhớ lâu dài.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { env } from '../config/env.js';
import { getDb, parseJson } from '../config/db.js';

const SIZE = 480;
const DIR = env.dbFile && env.dbFile !== ':memory:' ? join(dirname(env.dbFile), 'thumbs') : join(tmpdir(), 'btm-thumbs');

let sharpMod; // undefined: chưa thử; null: máy chủ không có sharp → gửi SVG đã tô thay cho WebP
async function loadSharp() {
  if (sharpMod === undefined) sharpMod = await import('sharp').then((m) => m.default, () => null);
  return sharpMod;
}

/** Mã phiên bản theo nội dung tranh: tranh đổi thì đường dẫn đổi, trình duyệt tải ảnh mới. Nhớ theo id + độ dài để khỏi băm lại. */
const versions = new Map();
export function thumbVersion(p) {
  const key = `${p.id}:${p.svg_len ?? p.svg?.length}:${p.manifest_len ?? p.manifest?.length}`;
  let v = versions.get(key);
  if (!v) {
    const row = p.svg ? p : getDb().prepare('SELECT svg, manifest FROM pictures WHERE id = ?').get(p.id);
    v = createHash('sha1').update(row.svg).update(row.manifest).digest('hex').slice(0, 10);
    versions.set(key, v);
  }
  return v;
}

export const thumbUrl = (p, blank = false) => `/api/pictures/${p.id}/thumb${blank ? '-blank' : ''}.webp?v=${thumbVersion(p)}`;

/** SVG tranh đã tô màu gợi ý (hoặc để trắng hết khi `blank`). */
export function coloredSvg(p, blank = false) {
  const fills = blank ? {} : Object.fromEntries(parseJson(p.manifest, { regions: [] }).regions.map((r) => [r.id, r.color]));
  return p.svg.replace(/<([a-zA-Z]+)([^>]*?)\sdata-region="([^"]+)"([^>]*?)(\/?)>/g, (_all, tag, a, id, b, slash) => {
    const attrs = `${a} data-region="${id}"${b}`.replace(/\sfill="[^"]*"/, '');
    return `<${tag}${attrs} fill="${fills[id] || '#FFFFFF'}"${slash}>`;
  });
}

const pending = new Map(); // tránh dựng trùng 1 ảnh khi nhiều người mở cùng lúc
let queue = Promise.resolve(); // dựng lần lượt từng ảnh để không chiếm hết CPU của server

/** Đường dẫn file ảnh trên đĩa (dựng nếu chưa có); null nếu máy chủ không dựng được WebP. */
export async function thumbFile(p, blank = false) {
  const sharp = await loadSharp();
  if (!sharp) return null;
  const file = join(DIR, `${p.id}${blank ? '-blank' : ''}-${thumbVersion(p)}.webp`);
  if (existsSync(file)) return file;
  if (!pending.has(file)) {
    const job = queue.then(async () => {
      if (existsSync(file)) return;
      const buf = await sharp(Buffer.from(coloredSvg(p, blank)), { density: (72 * SIZE) / 600 })
        .resize(SIZE, SIZE)
        .webp({ quality: 80 })
        .toBuffer();
      mkdirSync(DIR, { recursive: true });
      for (const f of readdirSync(DIR)) if (f.startsWith(`${p.id}${blank ? '-blank' : ''}-`) && f !== file) unlinkSync(join(DIR, f)); // bỏ bản cũ
      writeFileSync(file, buf);
    });
    queue = job.catch(() => {});
    pending.set(file, job.finally(() => pending.delete(file)));
  }
  await pending.get(file);
  return file;
}

/** Dựng sẵn ảnh của mọi tranh (chạy nền lúc khởi động) để người đầu tiên mở trang không phải chờ. */
export async function warmThumbs() {
  if (!(await loadSharp())) return;
  const ids = getDb().prepare('SELECT id FROM pictures WHERE is_card = 0 ORDER BY id').all();
  for (const { id } of ids) {
    const p = getDb().prepare('SELECT id, svg, manifest FROM pictures WHERE id = ?').get(id);
    await thumbFile(p).catch(() => {});
    await new Promise((r) => setImmediate(r));
  }
}
