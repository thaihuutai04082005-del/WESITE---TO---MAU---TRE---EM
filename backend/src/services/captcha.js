// CAPTCHA ký tự ngẫu nhiên (ví dụ "YKH6") dạng ảnh SVG có nhiễu, lưu tạm trong bộ nhớ 5 phút.
import { randomInt } from 'node:crypto';
import { randomCode, uuid } from '../utils/ids.js';
import { env } from '../config/env.js';

// Phông chữ nét (lưới 10×14) — ký tự được vẽ bằng đường, không để lộ dạng văn bản trong SVG.
const GLYPHS = {
  A: 'M0 14L5 0L10 14M2 9H8', B: 'M0 14V0H6Q9 0 9 3.5T6 7H0M6 7Q10 7 10 10.5T6 14H0', C: 'M10 2Q8 0 5 0Q0 0 0 7T5 14Q8 14 10 12',
  D: 'M0 0V14H4Q10 14 10 7T4 0Z', E: 'M10 0H0V14H10M0 7H7', F: 'M10 0H0V14M0 7H7', G: 'M10 2Q8 0 5 0Q0 0 0 7T5 14Q10 14 10 8H5',
  H: 'M0 0V14M10 0V14M0 7H10', J: 'M8 0V10Q8 14 4 14Q1 14 0 11', K: 'M0 0V14M10 0L0 8M3 6L10 14', L: 'M0 0V14H10',
  M: 'M0 14V0L5 8L10 0V14', N: 'M0 14V0L10 14V0', P: 'M0 14V0H6Q10 0 10 4T6 8H0', Q: 'M5 0Q0 0 0 7T5 14T10 7T5 0M6 10L10 15',
  R: 'M0 14V0H6Q10 0 10 4T6 8H0M5 8L10 14', S: 'M10 2Q8 0 5 0Q0 0 0 3.5Q0 7 5 7T10 10.5Q10 14 5 14Q2 14 0 12', T: 'M0 0H10M5 0V14',
  U: 'M0 0V10Q0 14 5 14T10 10V0', V: 'M0 0L5 14L10 0', W: 'M0 0L2.5 14L5 5L7.5 14L10 0', X: 'M0 0L10 14M10 0L0 14', Y: 'M0 0L5 7L10 0M5 7V14',
  Z: 'M0 0H10L0 14H10', 2: 'M0 3Q1 0 5 0Q10 0 10 4Q10 7 0 14H10', 3: 'M0 1Q2 0 5 0Q10 0 10 3.5T5 7Q10 7 10 10.5T5 14Q2 14 0 13M3 7H5',
  4: 'M7 14V0L0 10H10', 5: 'M10 0H1L0 6Q3 5 5 5Q10 5 10 9.5T5 14Q2 14 0 13', 6: 'M9 1Q7 0 5 0Q0 0 0 8Q0 14 5 14T10 9.5T5 5Q2 5 0 8',
  7: 'M0 0H10L3 14', 8: 'M5 7Q0 7 0 3.5T5 0T10 3.5T5 7Q0 7 0 10.5T5 14T10 10.5T5 7', 9: 'M1 13Q3 14 5 14Q10 14 10 6Q10 0 5 0T0 4.5T5 9Q8 9 10 6',
};

const TTL_MS = 5 * 60 * 1000;
const store = new Map();

function sweep() {
  const now = Date.now();
  for (const [id, v] of store) if (v.expires < now) store.delete(id);
}

export function createCaptcha() {
  sweep();
  const fixed = !env.isProd && process.env.CAPTCHA_FIXED;
  const text = fixed ? String(fixed).toUpperCase() : randomCode(4);
  const id = uuid();
  store.set(id, { text, expires: Date.now() + TTL_MS });
  const colors = ['#2B9BF4', '#FF8A65', '#7D5FFF', '#0B6FB8', '#E74C3C'];
  let body = '';
  for (let i = 0; i < 6; i++) {
    body += `<path d="M ${randomInt(0, 40)} ${randomInt(5, 55)} Q ${randomInt(40, 120)} ${randomInt(0, 60)} ${randomInt(120, 160)} ${randomInt(5, 55)}" stroke="${colors[i % colors.length]}" stroke-width="1.5" fill="none" opacity="0.6"/>`;
  }
  [...text].forEach((ch, i) => {
    const x = 14 + i * 36 + randomInt(-3, 4);
    const y = 12 + randomInt(-4, 5);
    const scale = (randomInt(185, 235) / 100).toFixed(2);
    body += `<path d="${GLYPHS[ch] || ''}" fill="none" stroke="${colors[randomInt(colors.length)]}" stroke-width="${(3.2 / scale).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" transform="translate(${x} ${y}) scale(${scale}) rotate(${randomInt(-18, 19)} 5 7)"/>`;
  });
  for (let i = 0; i < 25; i++) body += `<circle cx="${randomInt(160)}" cy="${randomInt(60)}" r="1.4" fill="#5E7A8C" opacity="0.6"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="60" viewBox="0 0 160 60"><rect width="160" height="60" rx="12" fill="#EAF6FF"/>${body}</svg>`;
  return { captchaId: id, svg };
}

/** Kiểm tra và huỷ captcha (dùng 1 lần). Không phân biệt hoa thường. */
export function verifyCaptcha(id, answer) {
  const entry = store.get(id);
  store.delete(id);
  if (!entry || entry.expires < Date.now()) return false;
  return String(answer || '').trim().toUpperCase() === entry.text;
}

/** Chỉ dùng trong test tự động. */
export function _peekCaptcha(id) {
  return store.get(id)?.text;
}
