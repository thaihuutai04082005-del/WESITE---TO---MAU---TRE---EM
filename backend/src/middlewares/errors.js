import { HttpError } from '../utils/http.js';

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: { code: 'not_found' } });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, ...(err.extra || {}) } });
  }
  if (err?.type === 'entity.too.large') return res.status(413).json({ error: { code: 'payload_too_large' } });
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: { code: 'invalid_json' } });
  console.error(err);
  res.status(500).json({ error: { code: 'server_error' } });
}
