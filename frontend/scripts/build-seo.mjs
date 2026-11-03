// Static HTML is built without a browser, running API, credentials or user data.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { PUBLIC_ROUTES, APP_ROUTES, APP_SHELL_FILE, APP_SHELL_PATH, LEGACY_APP_PATHS } from '../../shared/publicRoutes.mjs';
import { absoluteUrl, escapeHtml, pageMetadata, metadataHtml, siteOrigin } from '../src/seo/site.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const configured = loadEnv('production', root, 'VITE_SITE_URL');
const origin = siteOrigin(process.env.VITE_SITE_URL || configured.VITE_SITE_URL || undefined);
const template = (await readFile(resolve(dist, 'index.html'), 'utf8'))
  .replace(/<!-- public:start -->[\s\S]*?<!-- public:end -->\s*/, '');
const cache = resolve(root, '../node_modules/.cache');
await mkdir(cache, { recursive: true });
const temporary = await mkdtemp(resolve(cache, 'tinytints-seo-'));

function documentFor(meta, markup = '') {
  return template
    .replace(/<html lang="[^"]*">/, `<html lang="${meta.page?.lang || 'en'}">`)
    .replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, `<!-- seo:start -->\n    ${metadataHtml(meta)}\n    <!-- seo:end -->`)
    .replace('<div id="root"></div>', `${markup ? `<!-- public:start --><div id="seo-content">${markup}</div><!-- public:end -->\n    ` : ''}<div id="root"></div>`);
}

try {
  await build({
    configFile: false, root, plugins: [react()], logLevel: 'warn',
    build: { ssr: 'src/seo/render.jsx', outDir: temporary, emptyOutDir: true,
      rollupOptions: { output: { entryFileNames: 'render.mjs' } } },
  });
  const { renderPublicPage } = await import(pathToFileURL(resolve(temporary, 'render.mjs')).href);
  for (const page of PUBLIC_ROUTES) {
    await writeFile(resolve(dist, page.file), documentFor(pageMetadata(page.path, { origin }), renderPublicPage(page)));
  }
  // Separate non-indexable SPA entry: account/payment URLs must not inherit home metadata.
  await writeFile(resolve(dist, APP_SHELL_FILE), documentFor(pageMetadata('/login', { origin })));
  await writeFile(resolve(dist, '404.html'), documentFor(pageMetadata('/not-found', { origin }),
    '<main class="page"><h1 class="page-title">Page not found · Không tìm thấy trang</h1><p class="mt-4"><a href="/">TinyTints home</a> · <a href="/vi">Trang chủ tiếng Việt</a></p></main>'));

  const urls = PUBLIC_ROUTES.map((page) => {
    const meta = pageMetadata(page.path, { origin });
    const alternates = [...meta.alternates, { lang: 'x-default', href: meta.alternates[0].href }];
    return `  <url>\n    <loc>${escapeHtml(meta.canonical)}</loc>\n${alternates.map(({ lang, href }) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeHtml(href)}" />`).join('\n')}\n  </url>`;
  });
  await writeFile(resolve(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`);
  await writeFile(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\nDisallow: /socket.io/\n\nSitemap: ${absoluteUrl('/sitemap.xml', origin)}\n`);
  // Cloudflare Pages serves the public .html files at clean URLs. Only real app routes are rewritten.
  const cleanAppUrls = APP_ROUTES.filter((path) => !path.includes('*')).map((path) => `${path}/ ${path} 301`);
  const legacyUrls = LEGACY_APP_PATHS.flatMap((path) => [`${path} / 302`, `${path}/ / 302`]);
  const appUrls = [...APP_ROUTES.filter((path) => !path.includes('*')), ...APP_ROUTES.filter((path) => path.includes('*'))];
  await writeFile(resolve(dist, '_redirects'), [...legacyUrls, ...cleanAppUrls, ...appUrls.map((path) => `${path} ${APP_SHELL_PATH} 200`)].join('\n') + '\n');
  const appHeaders = [...APP_ROUTES, APP_SHELL_PATH].map((path) => `${path}\n  Content-Type: text/html; charset=utf-8\n  X-Robots-Tag: noindex, follow`);
  const otherHeaders = [...LEGACY_APP_PATHS, '/404.html', '/admin/*', '/api/*'].map((path) => `${path}\n  X-Robots-Tag: noindex, follow`);
  await writeFile(resolve(dist, '_headers'), [...appHeaders, ...otherHeaders].join('\n\n') + '\n');
  console.log(`SEO: generated ${PUBLIC_ROUTES.length} readable public pages, sitemap.xml, robots.txt and Cloudflare routing for ${origin}`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
