// Shared by the client, static SEO build and Express. Only these pages are indexable.
export const PUBLIC_ROUTES = [
  { path: '/', lang: 'en', kind: 'home', file: 'index.html' },
  { path: '/vi', lang: 'vi', kind: 'home', file: 'vi.html' },
  { path: '/coloring-pages', lang: 'en', kind: 'gallery', file: 'coloring-pages.html' },
  { path: '/tranh-to-mau', lang: 'vi', kind: 'gallery', file: 'tranh-to-mau.html' },
  { path: '/how-to-color', lang: 'en', kind: 'guide', file: 'how-to-color.html' },
  { path: '/huong-dan-to-mau', lang: 'vi', kind: 'guide', file: 'huong-dan-to-mau.html' },
];

export const APP_ROUTES = [
  '/login', '/register', '/forgot', '/plans', '/welcome', '/profile', '/signature',
  '/collection', '/exhibition', '/exhibition/review', '/showcase/*', '/color', '/color/*',
  '/draw/*', '/history', '/payment/result', '/arena', '/arena/room', '/missions',
  '/gacha', '/shop', '/friends', '/together', '/together/*', '/storybooks', '/storybooks/*', '/shared/*',
];

export function publicPage(pathname) {
  const path = pathname.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  return PUBLIC_ROUTES.find((page) => page.path === path) || null;
}

export const alternatePage = (page, lang) => PUBLIC_ROUTES.find((item) => item.kind === page.kind && item.lang === lang);
export const isAppPath = (path) => APP_ROUTES.some((pattern) => pattern.endsWith('/*') ? path.startsWith(pattern.slice(0, -1)) : path === pattern);
