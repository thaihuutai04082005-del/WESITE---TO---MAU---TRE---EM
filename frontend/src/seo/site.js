import { PUBLIC_ROUTES, alternatePage, publicPage } from '../../../shared/publicRoutes.mjs';
import { SEO_COPY } from './content.js';

export function siteOrigin(value = 'https://tinytints.pages.dev') {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('VITE_SITE_URL must be a public HTTPS origin, e.g. https://tinytints.pages.dev');
  }
  return url.origin;
}

export const SITE_URL = siteOrigin(import.meta.env?.VITE_SITE_URL || undefined);
export const absoluteUrl = (path, origin = SITE_URL) => new URL(path, `${origin}/`).href;

export function pageMetadata(pathname, { origin = SITE_URL, personalized = false } = {}) {
  const page = publicPage(pathname);
  if (!page || (page.kind === 'home' && personalized)) {
    return { title: 'TinyTints', description: 'TinyTints — creative online coloring for kids.', robots: 'noindex, follow', page: null };
  }
  const text = SEO_COPY[page.lang][page.kind];
  const canonical = absoluteUrl(page.path, origin);
  const alternates = ['en', 'vi'].map((lang) => ({ lang, href: absoluteUrl(alternatePage(page, lang).path, origin) }));
  const image = absoluteUrl('/mascots/tomau.webp', origin);
  return {
    page, title: text.title, description: text.description,
    robots: 'index, follow, max-image-preview:large', canonical, image, alternates,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: 'TinyTints', inLanguage: ['en', 'vi'] },
        { '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: text.title,
          description: text.description, inLanguage: page.lang,
          isPartOf: { '@id': `${origin}/#website` },
          primaryImageOfPage: { '@type': 'ImageObject', url: image } },
        ...(page.kind === 'home' ? [] : [{
          '@type': 'BreadcrumbList', itemListElement: [
            { '@type': 'ListItem', position: 1, name: SEO_COPY[page.lang].nav.home, item: absoluteUrl(alternatePage(PUBLIC_ROUTES[0], page.lang).path, origin) },
            { '@type': 'ListItem', position: 2, name: text.heading, item: canonical },
          ],
        }]),
      ],
    },
  };
}

export const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export const jsonLdText = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

export function metadataHtml(meta) {
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" data-seo>`,
    `<meta name="robots" content="${meta.robots}" data-seo>`,
  ];
  if (meta.page) {
    tags.push(`<link rel="canonical" href="${escapeHtml(meta.canonical)}" data-seo>`);
    for (const { lang, href } of [...meta.alternates, { lang: 'x-default', href: meta.alternates[0].href }]) {
      tags.push(`<link rel="alternate" hreflang="${lang}" href="${escapeHtml(href)}" data-seo>`);
    }
    for (const [property, content] of Object.entries({
      'og:type': 'website', 'og:site_name': 'TinyTints', 'og:title': meta.title,
      'og:description': meta.description, 'og:url': meta.canonical, 'og:image': meta.image,
      'og:image:alt': 'TinyTints — online coloring for kids', 'og:locale': meta.page.lang === 'vi' ? 'vi_VN' : 'en_US',
      'og:locale:alternate': meta.page.lang === 'vi' ? 'en_US' : 'vi_VN',
    })) tags.push(`<meta property="${property}" content="${escapeHtml(content)}" data-seo>`);
    for (const [name, content] of Object.entries({ 'twitter:card': 'summary', 'twitter:title': meta.title, 'twitter:description': meta.description, 'twitter:image': meta.image })) {
      tags.push(`<meta name="${name}" content="${escapeHtml(content)}" data-seo>`);
    }
    tags.push(`<script type="application/ld+json" data-seo>${jsonLdText(meta.jsonLd)}</script>`);
  }
  return tags.join('\n    ');
}
