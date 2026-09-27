// Chữ ký của bé (Đợt 1 — docs/ke-hoach-chu-ky-trien-lam.md, Phần 1).
// - Chữ ký mặc định lưu ở users.signature: { name, style, hand? }.
// - Chữ ký đặt trên tranh lưu trong artworks.data.signature: nội dung (name/style/hand) + vị trí (x, y, scale, rot, color).
// - Mẫu "wow" chỉ dùng khi đang có gói tháng/năm; hết gói thì chữ ký mặc định tự về mẫu Free,
//   còn tranh đã ký giữ nguyên chữ ký cũ.
import { SIGNATURE_INKS, SIGNATURE_STYLES_FREE, SIGNATURE_STYLES_PREMIUM } from '../config/constants.js';
import { parseJson } from '../config/db.js';
import { activeSubscription } from './quota.js';
import { badRequest, forbidden } from '../utils/http.js';

// Khung chữ ký 150×50 (hệ toạ độ tranh 600×600): to nhất = 1/4 bề ngang tranh.
export const BOX = { w: 150, h: 50 };
export const SCALE = { min: 0.5, max: 1 };
export const MAX_ROT = 20;
const MAX_NAME = 20;
const MAX_HAND_STROKES = 40;
const MAX_HAND_POINTS = 3000;

export const FALLBACK_STYLE = SIGNATURE_STYLES_FREE[0];
const ALL_STYLES = new Set([...SIGNATURE_STYLES_FREE, ...SIGNATURE_STYLES_PREMIUM, 'hand']);
export const isPremiumStyle = (style) => SIGNATURE_STYLES_PREMIUM.includes(style);
export const hasPremium = (userId) => !!activeSubscription(userId);

// Từ tục (có dấu) + viết tắt phổ biến. So khớp trên chữ thường, bỏ khoảng trắng/dấu câu giữa các chữ cái.
const BAD_WORDS = ['địt', 'đụ', 'lồn', 'cặc', 'buồi', 'đéo', 'đĩ', 'dcm', 'đcm', 'vcl', 'vkl', 'clgt', 'fuck', 'shit', 'bitch', 'dick', 'pussy', 'porn', 'sex'];

/** Kiểm tra tên trên chữ ký: tên thật hay biệt danh đều được, nhưng không chữ xấu / số điện thoại / email / link. */
export function cleanName(v) {
  if (typeof v !== 'string') throw badRequest('invalid_input');
  const name = v.normalize('NFC').replace(/\s+/g, ' ').trim();
  if (name.length < 1 || name.length > MAX_NAME) throw badRequest('signature_name_length');
  if (/\d{6,}|@|https?:|www\.|\.(com|vn|net)\b/i.test(name)) throw badRequest('signature_private_info');
  const squashed = name.toLowerCase().replace(/[\s._\-*]+/g, '');
  if (BAD_WORDS.some((w) => squashed.includes(w))) throw badRequest('signature_bad_word');
  return name;
}

const round1 = (n) => Math.round(n * 10) / 10;

/** Nét ký tay: mảng nét, mỗi nét là mảng điểm [x, y] trong khung 150×50. */
function cleanHand(v) {
  if (!Array.isArray(v) || !v.length || v.length > MAX_HAND_STROKES) throw badRequest('signature_hand_invalid');
  let total = 0;
  const strokes = v.map((s) => {
    if (!Array.isArray(s)) throw badRequest('signature_hand_invalid');
    const pts = s
      .filter((p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]))
      .map(([x, y]) => [round1(Math.min(BOX.w, Math.max(0, x))), round1(Math.min(BOX.h, Math.max(0, y)))]);
    total += pts.length;
    return pts;
  }).filter((s) => s.length);
  if (!strokes.length || total > MAX_HAND_POINTS) throw badRequest('signature_hand_invalid');
  return strokes;
}

/** Nội dung chữ ký (không gồm vị trí). */
export function cleanContent(v) {
  const style = String(v?.style || '');
  if (!ALL_STYLES.has(style)) throw badRequest('signature_style_invalid');
  if (style === 'hand') return { style, hand: cleanHand(v.hand) };
  return { style, name: cleanName(v?.name) };
}

const sameContent = (a, b) => !!a && !!b && JSON.stringify(cleanContentSafe(a)) === JSON.stringify(cleanContentSafe(b));
function cleanContentSafe(v) {
  try {
    return cleanContent(v);
  } catch {
    return null;
  }
}

/** Chữ ký mặc định đang dùng được (mẫu wow hết gói → về mẫu Free, giữ nguyên tên). */
export function effectiveSignature(user) {
  const stored = parseJson(user?.signature, null);
  if (!stored) return null;
  if (isPremiumStyle(stored.style) && !hasPremium(user.id)) return { ...stored, style: FALLBACK_STYLE };
  return stored;
}

/** Lưu chữ ký mặc định mới. Mẫu wow cần gói tháng/năm. */
export function prepareDefault(userId, input) {
  const content = cleanContent(input);
  if (isPremiumStyle(content.style) && !hasPremium(userId)) throw forbidden('signature_premium_required');
  return content;
}

/** Giữ chữ ký nằm trọn trong tranh (tính cả khi xoay). */
export function clampPlacement({ x, y, scale, rot }) {
  const s = Math.min(SCALE.max, Math.max(SCALE.min, Number(scale) || 1));
  const r = Math.min(MAX_ROT, Math.max(-MAX_ROT, Number(rot) || 0));
  const rad = (r * Math.PI) / 180;
  const hw = ((BOX.w * s) / 2) * Math.abs(Math.cos(rad)) + ((BOX.h * s) / 2) * Math.abs(Math.sin(rad));
  const hh = ((BOX.w * s) / 2) * Math.abs(Math.sin(rad)) + ((BOX.h * s) / 2) * Math.abs(Math.cos(rad));
  const cx = Math.min(600 - hw, Math.max(hw, Number(x) || 0));
  const cy = Math.min(600 - hh, Math.max(hh, Number(y) || 0));
  return { x: round1(cx), y: round1(cy), scale: Math.round(s * 100) / 100, rot: Math.round(r) };
}

/**
 * Chữ ký đặt trên tranh gửi lên khi lưu. Nội dung phải là chữ ký mặc định hiện tại của bé,
 * hoặc đúng chữ ký đã có trên tranh này (tranh đã ký giữ nguyên chữ ký cũ, kể cả mẫu wow sau khi hết gói).
 * @returns {object|null}
 */
export function preparePlaced(user, input, previous) {
  if (input == null) return null;
  if (typeof input !== 'object') throw badRequest('signature_invalid');
  const content = cleanContent(input);
  if (!sameContent(content, effectiveSignature(user)) && !sameContent(content, previous)) throw forbidden('signature_not_default');
  const color = SIGNATURE_INKS.includes(String(input.color).toUpperCase()) ? String(input.color).toUpperCase() : SIGNATURE_INKS[0];
  return { ...content, ...clampPlacement(input), color };
}
