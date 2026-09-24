import { randomBytes, randomInt, randomUUID } from 'node:crypto';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // bỏ ký tự dễ nhầm O/0, I/1

export function randomCode(len = 6, alphabet = CODE_ALPHABET) {
  let s = '';
  for (let i = 0; i < len; i++) s += alphabet[randomInt(alphabet.length)];
  return s;
}

export const numericCode = (len = 6) => randomCode(len, '0123456789');
export const uuid = () => randomUUID();
export const token = (bytes = 18) => randomBytes(bytes).toString('base64url');
