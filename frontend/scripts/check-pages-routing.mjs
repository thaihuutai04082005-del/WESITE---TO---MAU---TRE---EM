// Run against `wrangler pages dev frontend/dist` after a production build.
// Vite/Express do not implement Pages' clean-URL redirects; test the actual host runtime.
import assert from 'node:assert/strict';
import { APP_ROUTES, PUBLIC_ROUTES, APP_SHELL_PATH, LEGACY_APP_PATHS } from '../../shared/publicRoutes.mjs';
import { staticAssetPaths } from './static-assets.mjs';

const base = process.argv[2] || 'http://127.0.0.1:8788';
const request = (path) => fetch(new URL(path, base), { redirect: 'manual' });
const animationAssets = (await staticAssetPaths(new URL('../public/', import.meta.url))).filter((path) => path.startsWith('/animations/together/'));
assert.ok(animationAssets.length >= 11, 'Test the complete Together animation and background');
for (const path of animationAssets) {
  const response = await request(path);
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get('content-type') || '', /^image\/webp/, path);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', path);
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', path);
  const oldPath = path.replace('/animations/together/', '/together/');
  const legacy = await request(`${oldPath}?source=old-animation`);
  assert.equal(legacy.status, 301, oldPath);
  const target = new URL(legacy.headers.get('location'), base);
  assert.equal(target.pathname, path);
  assert.equal(target.searchParams.get('source'), 'old-animation');
  const followed = await fetch(new URL(oldPath, base));
  assert.match(followed.headers.get('content-type'), /^image\/webp/, oldPath);
  assert.deepEqual(Buffer.from(await followed.arrayBuffer()), bytes);
}
for (const pattern of APP_ROUTES) {
  const path = `${pattern.replace('*', 'routing-test')}?paymentId=routing-test&source=check`;
  const response = await request(path);
  assert.equal(response.status, 200, `${path} must load directly, without a clean-URL redirect`);
  assert.equal(response.headers.get('location'), null, path);
  assert.equal(response.url, new URL(path, base).href);
  assert.match(response.headers.get('content-type') || '', /text\/html/, path);
  assert.match(response.headers.get('x-robots-tag') || '', /noindex/, path);
  const html = await response.text();
  assert.match(html, /<div id="root"><\/div>/, path);
  assert.match(html, /content="noindex, follow"/, path);
  assert.ok(!html.includes('Page not found'), path);
}
const shell = await request(APP_SHELL_PATH);
assert.equal(shell.status, 200);
assert.match(shell.headers.get('content-type'), /text\/html/);
for (const page of PUBLIC_ROUTES) {
  const response = await request(page.path);
  assert.equal(response.status, 200, page.path);
  const html = await response.text();
  assert.match(html, /id="seo-content"/, page.path);
  assert.match(html, /content="index, follow, max-image-preview:large"/, page.path);
}
for (const path of LEGACY_APP_PATHS) {
  const response = await request(`${path}?source=old-link`);
  assert.equal(response.status, 302, path);
  assert.equal(new URL(response.headers.get('location'), base).pathname, '/');
  assert.equal(new URL(response.headers.get('location'), base).searchParams.get('source'), 'old-link');
}
for (const path of ['/shop/', '/plans/', '/payment/result/']) {
  const response = await request(`${path}?source=slash`);
  assert.equal(response.status, 301);
  assert.equal(new URL(response.headers.get('location'), base).pathname, path.slice(0, -1));
  assert.equal(new URL(response.headers.get('location'), base).searchParams.get('source'), 'slash');
}
assert.equal((await request('/does-not-exist')).status, 404);
const home = await (await request('/')).text();
const script = home.match(/src="(\/assets\/[^"]+\.js)"/)[1];
const asset = await request(script);
assert.equal(asset.status, 200);
assert.match(asset.headers.get('content-type'), /javascript/);
console.log(`PASS Pages runtime: ${APP_ROUTES.length} app routes, ${PUBLIC_ROUTES.length} public pages, ${animationAssets.length} animation images and their legacy redirects, queries, assets and 404s`);
