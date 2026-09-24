// CAPTCHA ký tự ngẫu nhiên (ví dụ "YKH6") dạng ảnh SVG có nhiễu, lưu tạm trong bộ nhớ 5 phút.
import { randomInt } from 'node:crypto';
import { randomCode, uuid } from '../utils/ids.js';

const TTL_MS = 5 * 60 * 1000;
const store = new Map();

function sweep() {
  const now = Date.now();
  for (const [id, v] of store) if (v.expires < now) store.delete(id);
}

export function createCaptcha() {
  sweep();
  const text = randomCode(4);
  const id = uuid();
  store.set(id, { text, expires: Date.now() + TTL_MS });
  const colors = ['#2B9BF4', '#FF8A65', '#7D5FFF', '#0B6FB8', '#E74C3C'];
  let body = '';
  for (let i = 0; i < 6; i++) {
    body += `<path d="M ${randomInt(0, 40)} ${randomInt(5, 55)} Q ${randomInt(40, 120)} ${randomInt(0, 60)} ${randomInt(120, 160)} ${randomInt(5, 55)}" stroke="${colors[i % colors.length]}" stroke-width="1.5" fill="none" opacity="0.6"/>`;
  }
  [...text].forEach((ch, i) => {
    const x = 18 + i * 34 + randomInt(-4, 5);
    const y = 42 + randomInt(-6, 7);
    body += `<text x="${x}" y="${y}" font-family="Verdana, sans-serif" font-size="${randomInt(28, 36)}" font-weight="bold" fill="${colors[randomInt(colors.length)]}" transform="rotate(${randomInt(-25, 26)} ${x + 10} ${y - 12})">${ch}</text>`;
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
