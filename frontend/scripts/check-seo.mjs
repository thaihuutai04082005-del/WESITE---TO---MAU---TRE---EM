// Run after npm run build. Check the actual deployable HTML, not just source configuration.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PUBLIC_ROUTES, APP_ROUTES, APP_SHELL_FILE, APP_SHELL_PATH, LEGACY_APP_PATHS } from '../../shared/publicRoutes.mjs';
import { SEO_COPY } from '../src/seo/content.js';
import { staticAssetPaths, assertNoAppAssetCollisions } from './static-assets.mjs';

const read = (file) => readFile(new URL(`../dist/${file}`, import.meta.url), 'utf8');
const sitemap = await read('sitemap.xml');
const robots = await read('robots.txt');
const headers = await read('_headers');
const redirects = await read('_redirects');
const assets = await staticAssetPaths(new URL('../public/', import.meta.url));
assertNoAppAssetCollisions(assets);
for (const path of assets.filter((path) => path.startsWith('/animations/together/'))) {
  assert.ok(redirects.includes(`${path.replace('/animations/together/', '/together/')} ${path} 301`));
}
assert.equal((sitemap.match(/<loc>/g) || []).length, PUBLIC_ROUTES.length);
for (const page of PUBLIC_ROUTES) {
  const html = await read(page.file);
  assert.match(html, new RegExp(`<html lang="${page.lang}">`));
  assert.equal((html.match(/<h1\b/g) || []).length, 1, page.path);
  assert.ok(html.includes(SEO_COPY[page.lang][page.kind].heading));
  assert.ok(html.includes('id="seo-content"'));
  assert.ok(html.includes('content="index, follow, max-image-preview:large"'));
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert.equal((html.match(/hreflang=/g) || []).length, 3);
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)[1];
  assert.equal(new URL(canonical).pathname, page.path);
  assert.ok(sitemap.includes(`<loc>${canonical}</loc>`));
  assert.ok(robots.includes(`${new URL(canonical).origin}/sitemap.xml`));
  const schema = html.match(/<script type="application\/ld\+json" data-seo>([\s\S]*?)<\/script>/)[1];
  assert.equal(JSON.parse(schema)['@graph'].find((item) => item['@type'] === 'WebPage').url, canonical);
  assert.ok(!html.includes('content="noindex'), page.path);
}
for (const file of [APP_SHELL_FILE, '404.html']) {
  const html = await read(file);
  assert.ok(html.includes('content="noindex, follow"'));
  assert.ok(!html.includes('rel="canonical"'));
}
for (const path of APP_ROUTES) {
  assert.ok(redirects.includes(`${path} ${APP_SHELL_PATH} 200`));
  assert.ok(headers.includes(`${path}\n  Content-Type: text/html; charset=utf-8\n  X-Robots-Tag: noindex, follow`));
  assert.ok(!sitemap.includes(`<loc>https://tinytints.pages.dev${path}</loc>`));
}
assert.ok(!redirects.split('\n').some((line) => line.startsWith('/* ')), 'Do not rewrite public content or assets into the SPA');
assert.ok(!redirects.split('\n').some((line) => /\s\S+\.html\s+200$/.test(line)), 'Pages clean-URL redirects must not change application URLs');
for (const path of LEGACY_APP_PATHS) assert.ok(redirects.includes(`${path} / 302`));
console.log(`PASS: ${PUBLIC_ROUTES.length} static pages, language alternatives, JSON-LD, sitemap, robots, private-route noindex and 404 HTML`);
