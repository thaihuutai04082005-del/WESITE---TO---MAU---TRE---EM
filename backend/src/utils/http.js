// Lỗi HTTP có mã lỗi máy đọc được (frontend dịch theo `code`).
export class HttpError extends Error {
  constructor(status, code, message, extra) {
    super(message || code);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

export const badRequest = (code, msg, extra) => new HttpError(400, code, msg, extra);
export const unauthorized = (code = 'unauthorized', msg) => new HttpError(401, code, msg);
export const forbidden = (code = 'forbidden', msg) => new HttpError(403, code, msg);
export const notFound = (code = 'not_found', msg) => new HttpError(404, code, msg);
export const conflict = (code, msg) => new HttpError(409, code, msg);

/** Lấy chuỗi bắt buộc từ body, cắt khoảng trắng, giới hạn độ dài. */
export function str(v, { min = 0, max = 200, name = 'field' } = {}) {
  if (typeof v !== 'string') throw badRequest('invalid_input', `${name} không hợp lệ`);
  const s = v.trim();
  if (s.length < min || s.length > max) throw badRequest('invalid_input', `${name} phải dài ${min}–${max} ký tự`);
  return s;
}

export function int(v, { min = -Infinity, max = Infinity, name = 'field' } = {}) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw badRequest('invalid_input', `${name} không hợp lệ`);
  return n;
}
