import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { api, configureApi } from '../src/services/api.js';

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
  configureApi({ getToken: () => null, unauthorized: () => {} });
});

test('SPA HTML fallback with HTTP 200 is rejected instead of becoming empty API data', async () => {
  globalThis.fetch = async () => new Response('<!doctype html><div id="root"></div>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  await assert.rejects(api.get('/themes'), { status: 502, code: 'backend_unavailable' });
  await assert.rejects(api.get('/meta'), { status: 502, code: 'backend_unavailable' });
});

test('Malformed successful JSON is rejected, while a real API response is preserved', async () => {
  globalThis.fetch = async () => new Response('{broken', { headers: { 'Content-Type': 'application/json' } });
  await assert.rejects(api.get('/themes'), { code: 'backend_unavailable' });
  globalThis.fetch = async () => Response.json({ themes: [{ slug: 'animals' }] });
  assert.deepEqual(await api.get('/themes'), { themes: [{ slug: 'animals' }] });
});

test('Non-JSON HTTP failures retain HTTP errors and session-expiry handling', async () => {
  let expired = false;
  configureApi({ getToken: () => 'expired-token', unauthorized: () => { expired = true; } });
  globalThis.fetch = async () => new Response('Unauthorized', { status: 401 });
  await assert.rejects(api.get('/auth/me'), { status: 401, code: 'server_error' });
  assert.ok(expired);
  globalThis.fetch = async () => Response.json({ error: { code: 'invalid_credentials' } }, { status: 401 });
  await assert.rejects(api.post('/auth/login', {}), { code: 'invalid_credentials' });
});

test('Downloads still accept non-JSON file responses', async () => {
  globalThis.fetch = async () => new Response('pdf contents', { headers: { 'Content-Type': 'application/pdf' } });
  assert.equal(await (await api.blob('/storybook/1/pdf')).text(), 'pdf contents');
});
