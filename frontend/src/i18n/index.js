// Đa ngôn ngữ (Mục 14): toàn bộ chữ giao diện nằm trong vi.json / en.json.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from './vi.json';
import en from './en.json';
import { publicPage } from '../../../shared/publicRoutes.mjs';

let saved = 'en'; // mặc định tiếng Anh
try {
  saved = localStorage.getItem('btm.lang') || 'en';
} catch {
  /* bỏ qua */
}
// Public language versions have stable URLs so crawlers see the same language.
saved = publicPage(window.location.pathname)?.lang || saved;
try {
  // Keep registration/login in the language of the public page just visited.
  localStorage.setItem('btm.lang', saved);
} catch {
  /* chế độ riêng tư */
}

i18n.use(initReactI18next).init({
  resources: { vi: { translation: vi }, en: { translation: en } },
  lng: saved,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (l) => {
  document.documentElement.lang = l;
});
document.documentElement.lang = i18n.language;

export default i18n;
