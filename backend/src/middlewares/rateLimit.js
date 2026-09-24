// Giới hạn tần suất đơn giản trong bộ nhớ (đủ cho 1 tiến trình; nhiều máy chủ thì thay bằng Redis).
import { HttpError } from '../utils/http.js';
import { env } from '../config/env.js';

export function rateLimit({ windowMs = 60000, max = 20, key = (req) => req.ip } = {}) {
  const hits = new Map();
  return (req, _res, next) => {
    if (env.isTest) return next();
    const k = key(req);
    const now = Date.now();
    const arr = (hits.get(k) || []).filter((t) => now - t < windowMs);
    arr.push(now);
    hits.set(k, arr);
    if (hits.size > 10000) hits.clear();
    if (arr.length > max) return next(new HttpError(429, 'too_many_requests'));
    next();
  };
}
