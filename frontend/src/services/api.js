// Gọi API tới backend. Lỗi trả về dạng ApiError { status, code, data } — frontend dịch theo `code`.
const BASE = import.meta.env?.VITE_API_URL || '/api';

let tokenGetter = () => null;
let onUnauthorized = () => {};
// Share only requests that are still running. Permission results are never cached.
const inFlightGets = new Map();

export function configureApi({ getToken, unauthorized }) {
  tokenGetter = getToken;
  onUnauthorized = unauthorized;
}

export class ApiError extends Error {
  constructor(status, code, data) {
    super(code);
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export function request(method, path, body, { raw = false } = {}) {
  const token = tokenGetter();
  if (method !== 'GET' || raw) return fetchRequest(method, path, body, raw, token);
  const key = JSON.stringify([token, path]);
  if (inFlightGets.has(key)) return inFlightGets.get(key);
  const pending = fetchRequest(method, path, body, raw, token).finally(() => {
    if (inFlightGets.get(key) === pending) inFlightGets.delete(key);
  });
  inFlightGets.set(key, pending);
  return pending;
}

async function fetchRequest(method, path, body, raw, token) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      cache: 'no-store',
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'network_error');
  }
  if (raw && res.ok) return res;
  // Static hosts can return the SPA's index.html with HTTP 200 for /api/*.
  // Treat that as an unavailable backend, not a successful empty API response.
  if (res.ok && !/\bapplication\/(?:[\w.-]+\+)?json\b/i.test(res.headers.get('content-type') || '')) {
    throw new ApiError(502, 'backend_unavailable');
  }
  let data;
  try {
    data = await res.json();
  } catch {
    if (res.ok) throw new ApiError(502, 'backend_unavailable');
    data = {};
  }
  if (!res.ok) {
    const code = data?.error?.code || 'server_error';
    if (res.status === 401 && token && tokenGetter() === token) onUnauthorized();
    throw new ApiError(res.status, code, data?.error);
  }
  return data;
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b = {}) => request('POST', p, b),
  put: (p, b = {}) => request('PUT', p, b),
  del: (p) => request('DELETE', p),
  blob: async (p) => (await request('GET', p, undefined, { raw: true })).blob(),
};
