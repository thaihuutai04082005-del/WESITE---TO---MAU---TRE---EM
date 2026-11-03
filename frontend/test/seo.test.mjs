import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PUBLIC_ROUTES, APP_ROUTES, alternatePage, publicPage, isAppPath } from '../../shared/publicRoutes.mjs';
import { pageMetadata, metadataHtml, siteOrigin, jsonLdText } from '../src/seo/site.js';

test('Every public page has a unique canonical and reciprocal language alternatives', () => {
  const origin = 'https://color.example';
  const titles = new Set();
  for (const page of PUBLIC_ROUTES) {
    const meta = pageMetadata(`${page.path}?utm_source=test#section`, { origin });
    assert.equal(meta.canonical, origin + page.path);
    assert.equal(meta.page.lang, page.lang);
    assert.match(meta.robots, /^index, follow/);
    assert.ok(!titles.has(meta.title), `Duplicate title: ${meta.title}`);
    titles.add(meta.title);
    assert.equal(meta.alternates.length, 2);
    for (const other of meta.alternates) {
      const target = publicPage(new URL(other.href).pathname);
      assert.equal(alternatePage(target, page.lang).path, page.path);
      assert.equal(target.kind, page.kind);
    }
    const schema = meta.jsonLd['@graph'];
    const webPage = schema.find((item) => item['@type'] === 'WebPage');
    assert.equal(webPage.url, meta.canonical);
    assert.equal(webPage.inLanguage, page.lang);
    assert.ok(!JSON.stringify(schema).includes('aggregateRating'));
  }
});

test('Account, private artwork, payment results, unknown pages and personalized dashboards are not indexable', () => {
  for (const path of [...APP_ROUTES.map((p) => p.replace('*', 'private-id')), '/not-a-page']) {
    const meta = pageMetadata(path);
    assert.equal(meta.page, null);
    assert.equal(meta.robots, 'noindex, follow');
    assert.ok(!metadataHtml(meta).includes('rel="canonical"'));
  }
  assert.match(pageMetadata('/', { personalized: true }).robots, /^noindex/);
  assert.match(pageMetadata('/vi', { personalized: true }).robots, /^noindex/);
  assert.equal(isAppPath('/payment/result'), true);
  assert.equal(isAppPath('/shared/private-token'), true);
  assert.equal(isAppPath('/does-not-exist'), false);
});

test('SEO uses a validated public origin and escapes HTML and JSON-LD', () => {
  for (const invalid of ['http://example.com', 'https://user:secret@example.com', 'https://example.com/path', 'https://example.com/?token=secret']) {
    assert.throws(() => siteOrigin(invalid));
  }
  assert.equal(siteOrigin('https://example.com/'), 'https://example.com');
  const unsafe = '</script><img src=x onerror="bad()">';
  const html = metadataHtml({ title: unsafe, description: unsafe, robots: 'noindex' });
  assert.ok(!html.includes('<img'));
  const json = jsonLdText({ name: unsafe });
  assert.ok(!json.includes('</script>'));
  assert.equal(JSON.parse(json).name, unsafe);
});
