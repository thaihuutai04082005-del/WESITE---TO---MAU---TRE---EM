import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { freeThemeIds, resolveThemeAccess } from '../../shared/themeAccess.mjs';
import { assertThemeAllowed, assertPictureThemeAllowed, loadThemePictures } from '../src/lib/themeAccess.js';
import { configureApi } from '../src/services/api.js';

const themes = ['3-5', '6-8', '9+'].flatMap((age) => Array.from({ length: age === '9+' ? 5 : 10 }, (_, index) => ({
  id: `${age}-${index}`, slug: `${age}-${index}`, age,
})));
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; configureApi({ getToken: () => null, unauthorized() {} }); });

test('Legacy theme responses without locked flags still lock the second five themes for Free', () => {
  const result = resolveThemeAccess(themes, { plan: 'free', vip: false });
  for (const age of ['3-5', '6-8']) {
    const group = result.filter((t) => t.age === age);
    assert.ok(group.slice(0, 5).every((t) => !t.locked));
    assert.ok(group.slice(5).every((t) => t.locked));
  }
  assert.ok(result.filter((t) => t.age === '9+').every((t) => !t.locked));
  assert.ok(themes.every((t) => t.locked === undefined), 'Do not mutate API/cache objects');
});

test('An unrestricted or stale server response cannot upgrade Free, unknown or expired plans', () => {
  const unlocked = themes.map((t) => ({ ...t, locked: false }));
  for (const plan of [null, {}, { plan: 'free', vip: false }, { plan: 'month', vip: false }, { plan: 'free', vip: true }]) {
    assert.equal(resolveThemeAccess(unlocked, plan).filter((t) => t.locked).length, 10);
  }
  for (const plan of ['month', 'year']) {
    assert.ok(resolveThemeAccess(themes, { plan, vip: true }).every((t) => !t.locked));
  }
  const serverDenied = themes.map((t, index) => ({ ...t, locked: index === 6 }));
  assert.equal(resolveThemeAccess(serverDenied, { plan: 'year', vip: true })[6].locked, true);
});

test('The server and frontend share the same per-age selection and preserve database IDs', () => {
  const rows = themes.map((t, index) => ({ id: index + 1, age_group: t.age }));
  assert.equal(freeThemeIds(rows).size, 15);
  assert.equal(freeThemeIds(rows, Number.NaN).size, 15);
  assert.equal(freeThemeIds(rows, 0).size, 0);
});

test('Deep-link and editor guards enforce Free even when an old API reports every theme unlocked', async () => {
  let options;
  globalThis.fetch = async (url, opts) => { options = opts; assert.match(url, /\/themes\?access=1$/); return Response.json({ themes }); };
  const free = { plan: 'free', vip: false };
  await assert.rejects(assertThemeAllowed('3-5-5', free), { code: 'theme_vip_required' });
  await assert.rejects(assertPictureThemeAllowed({ isCard: false, theme: { slug: '6-8-9' } }, free), { code: 'theme_vip_required' });
  await assertThemeAllowed('3-5-0', free);
  await assertThemeAllowed('3-5-9', { plan: 'month', vip: true });
  assert.equal(options.cache, 'no-store');
  await assert.rejects(assertThemeAllowed('missing', free), { code: 'picture_not_found' });
  globalThis.fetch = async () => Response.json({});
  await assert.rejects(assertThemeAllowed('3-5-0', free), { code: 'backend_unavailable' });
});

test('Current preview APIs enforce access in one fresh request, including when content was prefetched', async () => {
  const calls = [];
  globalThis.fetch = async (url) => { calls.push(url); return Response.json({ pictures: [{ id: 1 }] }); };
  assert.deepEqual(await loadThemePictures('3-5-0', { plan: 'free', vip: false }, 5, { previewApi: true, prefetched: { pictures: [{ id: 99 }] } }), { pictures: [{ id: 1 }] });
  assert.deepEqual(calls, ['/api/themes/3-5-0/pictures?preview=1']);
  globalThis.fetch = async () => Response.json({ error: { code: 'theme_vip_required' } }, { status: 403 });
  await assert.rejects(loadThemePictures('3-5-8', { plan: 'free', vip: false }, 5, { previewApi: true }), { code: 'theme_vip_required' });
});

test('A warm preview still needs fresh access and cannot open a locked theme on a legacy API', async () => {
  const calls = [];
  globalThis.fetch = async (url) => { calls.push(url); return Response.json({ themes }); };
  const options = { prefetched: { pictures: [{ id: 1 }] } };
  await assert.rejects(loadThemePictures('3-5-8', { plan: 'free', vip: false }, 5, options), { code: 'theme_vip_required' });
  assert.deepEqual(await loadThemePictures('3-5-0', { plan: 'free', vip: false }, 5, options), options.prefetched);
  assert.ok(calls.every((url) => url.endsWith('/themes?access=1')));
});
