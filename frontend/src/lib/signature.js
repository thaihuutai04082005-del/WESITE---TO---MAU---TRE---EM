// Chữ ký của bé (docs/ke-hoach-chu-ky-trien-lam.md, Phần 1): 10 mẫu chữ + tự ký bằng tay.
// Chữ ký vẽ trong khung 150×50 (tâm 0,0) rồi đặt lên tranh 600×600 bằng x, y, scale, rot — khớp backend/src/services/signature.js.
import { SIGNATURE_FONTS } from './signatureFonts';

export const BOX = { w: 150, h: 50 };
export const SCALE = { min: 0.5, max: 1 };
export const MAX_ROT = 20;
const MARGIN = 12;
const INK = '#1B2A38';

/** font: khoá trong SIGNATURE_FONTS; fixed: mẫu có màu riêng (không đổi màu mực). */
export const STYLES = {
  classic: { font: 'dancing' },
  round: { font: 'mali' },
  pen: { font: 'patrick' },
  neat: { font: 'itim' },
  fun: { font: 'pangolin' },
  gold: { font: 'vibes', premium: true, fixed: true },
  crown: { font: 'lobster', premium: true },
  rainbow: { font: 'pacifico', premium: true, fixed: true },
  star: { font: 'charm', premium: true },
  artist: { font: 'vibes', premium: true },
  hand: {},
};

export const isFixedColor = (style) => !!STYLES[style]?.fixed;
export const sameContent = (a, b) => !!a && !!b && a.style === b.style && (a.style === 'hand' ? JSON.stringify(a.hand) === JSON.stringify(b.hand) : a.name === b.name);

// ---------------- Font ----------------
const loaded = new Map();

/** Nạp font của 1 mẫu chữ ký vào trang (dùng để vẽ trên màn hình và đo chữ). */
export function ensureSignatureFont(style) {
  const key = STYLES[style]?.font;
  if (!key) return Promise.resolve();
  if (!loaded.has(key)) {
    const f = SIGNATURE_FONTS[key];
    const faces = f.files.map(([file, range]) => new FontFace(f.family, `url(/fonts/signature/${file}) format('woff2')`, { weight: String(f.weight), unicodeRange: range }));
    faces.forEach((ff) => document.fonts.add(ff));
    loaded.set(key, Promise.all(faces.map((ff) => ff.load())).catch(() => {}));
  }
  return loaded.get(key);
}

const embedded = new Map();
const toBase64 = (buf) => {
  let s = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};

/** @font-face nhúng thẳng dữ liệu font — ảnh SVG xuất ra (PNG/in) không tự tải được font ngoài. */
export function signatureFontCss(style) {
  const key = STYLES[style]?.font;
  if (!key) return Promise.resolve('');
  if (!embedded.has(key)) {
    const f = SIGNATURE_FONTS[key];
    embedded.set(
      key,
      Promise.all(
        f.files.map(async ([file, range]) => {
          const buf = await (await fetch(`/fonts/signature/${file}`)).arrayBuffer();
          return `@font-face{font-family:'${f.family}';font-weight:${f.weight};unicode-range:${range};src:url(data:font/woff2;base64,${toBase64(buf)}) format('woff2');}`;
        }),
      ).then((rules) => rules.join('')),
    );
  }
  return embedded.get(key);
}

// ---------------- Vẽ ----------------
let measureCtx;
/** Cỡ chữ vừa khung (đo bằng font thật; font chưa tải xong thì ước lượng theo số ký tự). */
function fitFontSize(text, style, maxW) {
  const f = SIGNATURE_FONTS[STYLES[style].font];
  measureCtx ||= document.createElement('canvas').getContext('2d');
  measureCtx.font = `${f.weight} 100px '${f.family}'`;
  const w = measureCtx.measureText(text).width || text.length * 55;
  return Math.max(10, Math.min(36, (100 * maxW) / w));
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const luminance = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};
/** Viền mỏng tương phản để chữ ký luôn đọc được trên mọi nền. */
const haloOf = (color) => (luminance(color) > 0.6 ? '#1B2A38' : '#FFFFFF');

const sparkle = (x, y, r, fill) => `<path d="M${x} ${y - r} L${x + r * 0.28} ${y - r * 0.28} L${x + r} ${y} L${x + r * 0.28} ${y + r * 0.28} L${x} ${y + r} L${x - r * 0.28} ${y + r * 0.28} L${x - r} ${y} L${x - r * 0.28} ${y - r * 0.28} Z" fill="${fill}" stroke="#FFFFFF" stroke-width="1"/>`;

/**
 * Nội dung chữ ký trong khung 150×50, tâm (0, 0).
 * @param {{ style, name?, hand?, color? }} sig
 * @param {string} uid  hậu tố id gradient (tránh trùng khi nhiều chữ ký cùng trang)
 */
export function signatureInner(sig, uid = 's') {
  const color = sig.color || INK;
  const halo = haloOf(color);
  if (sig.style === 'hand') {
    const d = (sig.hand || []).map((pts) => `M${pts.map(([x, y]) => `${x - 75} ${y - 25}`).join(' L')}`).join(' ');
    return `<path d="${d}" fill="none" stroke="${halo}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/><path d="${d}" fill="none" stroke="${color}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  const meta = STYLES[sig.style] || STYLES.classic;
  const font = SIGNATURE_FONTS[meta.font];
  const name = sig.name || '';
  const deco = { crown: 30, star: 34, artist: 12, gold: 18 }[sig.style] || 0;
  const size = fitFontSize(name, sig.style, BOX.w - 14 - deco);
  let fill = color;
  let defs = '';
  let before = '';
  let after = '';
  let tx = 0;
  if (sig.style === 'gold') {
    fill = `url(#sg-gold-${uid})`;
    defs = `<linearGradient id="sg-gold-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3B0"/><stop offset="0.5" stop-color="#F2B705"/><stop offset="1" stop-color="#A86B00"/></linearGradient>`;
    after = sparkle(-66, -16, 7, '#FFD54F') + sparkle(66, -14, 5, '#FFE9A8') + sparkle(60, 16, 4, '#FFD54F');
  } else if (sig.style === 'rainbow') {
    fill = `url(#sg-rb-${uid})`;
    defs = `<linearGradient id="sg-rb-${uid}" x1="0" y1="0" x2="1" y2="0">${['#FF5F5F', '#FF9F43', '#FFD54F', '#4CD787', '#4FA3E0', '#7D5FFF'].map((c, i) => `<stop offset="${i / 5}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  } else if (sig.style === 'crown') {
    tx = 12;
    before = `<g transform="translate(-58 -12) rotate(-14)"><polygon points="-13,8 -15,-8 -7,0 0,-12 7,0 15,-8 13,8" fill="#FFD700" stroke="#1B2A38" stroke-width="2" stroke-linejoin="round"/><circle cx="0" cy="3" r="2.6" fill="#FF5F7E"/></g>`;
  } else if (sig.style === 'star') {
    tx = -12;
    after = `<path d="M${38} ${-6} Q52 -10 58 -18" fill="none" stroke="#FFD54F" stroke-width="3" stroke-linecap="round" opacity="0.8"/><path d="M${36} ${2} Q54 -2 62 -12" fill="none" stroke="#FFB74D" stroke-width="2" stroke-linecap="round" opacity="0.7"/>${`<polygon transform="translate(64 -16)" points="0,-9 2.6,-2.8 9,-2.8 3.8,1.2 5.8,7.6 0,3.8 -5.8,7.6 -3.8,1.2 -9,-2.8 -2.6,-2.8" fill="#FFD54F" stroke="#1B2A38" stroke-width="1.5" stroke-linejoin="round"/>`}`;
  } else if (sig.style === 'artist') {
    after = `<path d="M-64 17 C-30 26 10 8 44 16 C56 19 62 14 64 10" fill="none" stroke="${halo}" stroke-width="5" stroke-linecap="round"/><path d="M-64 17 C-30 26 10 8 44 16 C56 19 62 14 64 10" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/><path transform="translate(66 6) scale(0.5)" d="M0 8 C-12 0 -10 -9 -4 -9 C-1 -9 0 -6 0 -5 C0 -6 1 -9 4 -9 C10 -9 12 0 0 8 Z" fill="#FF5F7E" stroke="#FFFFFF" stroke-width="2"/>`;
  } else if (sig.style === 'neat') {
    after = `<path d="M-58 19 L58 19" stroke="${halo}" stroke-width="5" stroke-linecap="round"/><path d="M-58 19 L58 19" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>`;
  }
  const strokeHalo = sig.style === 'gold' ? '#7A4E00' : sig.style === 'rainbow' ? '#FFFFFF' : halo;
  const text = `<text x="${tx}" y="0" text-anchor="middle" dominant-baseline="central" font-family="'${font.family}'" font-weight="${font.weight}" font-size="${size.toFixed(1)}" fill="${fill}" stroke="${strokeHalo}" stroke-width="${sig.style === 'gold' ? 1.4 : 3}" paint-order="stroke" stroke-linejoin="round">${esc(name)}</text>`;
  return `${defs ? `<defs>${defs}</defs>` : ''}${before}${text}${after}`;
}

/** Chữ ký đã đặt trên tranh (hệ toạ độ 600×600). */
export function signatureMarkup(sig, uid = 'p') {
  if (!sig) return '';
  return `<g transform="translate(${sig.x} ${sig.y}) rotate(${sig.rot || 0}) scale(${sig.scale || 1})">${signatureInner(sig, uid)}</g>`;
}

// ---------------- Đặt vị trí ----------------
const round1 = (n) => Math.round(n * 10) / 10;

function halfExtents(scale, rot) {
  const rad = (rot * Math.PI) / 180;
  const w = (BOX.w * scale) / 2;
  const h = (BOX.h * scale) / 2;
  return [w * Math.abs(Math.cos(rad)) + h * Math.abs(Math.sin(rad)), w * Math.abs(Math.sin(rad)) + h * Math.abs(Math.cos(rad))];
}

/** Giữ chữ ký nằm trọn trong tranh, cỡ và góc xoay trong giới hạn. */
export function clampPlacement(sig) {
  const scale = Math.min(SCALE.max, Math.max(SCALE.min, Number(sig.scale) || 1));
  const rot = Math.round(Math.min(MAX_ROT, Math.max(-MAX_ROT, Number(sig.rot) || 0)));
  const [hw, hh] = halfExtents(scale, rot);
  return { ...sig, scale: Math.round(scale * 100) / 100, rot, x: round1(Math.min(600 - hw, Math.max(hw, sig.x))), y: round1(Math.min(600 - hh, Math.max(hh, sig.y))) };
}

/** Dời chữ ký về 1 góc tranh (tl, tr, bl, br). */
export function toCorner(sig, corner) {
  const [hw, hh] = halfExtents(sig.scale || 1, sig.rot || 0);
  const x = corner.endsWith('l') ? MARGIN + hw : 600 - MARGIN - hw;
  const y = corner.startsWith('t') ? MARGIN + hh : 600 - MARGIN - hh;
  return clampPlacement({ ...sig, x, y });
}

/** Chữ ký mới đặt lên tranh: góc dưới bên phải. */
export const placeDefault = (content, color = INK) => toCorner({ ...content, color: isFixedColor(content.style) ? INK : color, scale: 0.8, rot: 0, x: 0, y: 0 }, 'br');

/** Điểm (x, y) của tranh có nằm trên chữ ký không (tính cả khi xoay, nới 10 đơn vị cho dễ chạm). */
export function hitSignature(sig, x, y) {
  if (!sig) return false;
  const rad = (-(sig.rot || 0) * Math.PI) / 180;
  const dx = x - sig.x;
  const dy = y - sig.y;
  const lx = (dx * Math.cos(rad) - dy * Math.sin(rad)) / (sig.scale || 1);
  const ly = (dx * Math.sin(rad) + dy * Math.cos(rad)) / (sig.scale || 1);
  return Math.abs(lx) <= BOX.w / 2 + 10 && Math.abs(ly) <= BOX.h / 2 + 10;
}
