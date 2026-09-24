// Đa ngôn ngữ (Mục 14): toàn bộ chữ giao diện nằm trong vi.json / en.json.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from './vi.json';
import en from './en.json';

let saved = 'vi';
try {
  saved = localStorage.getItem('btm.lang') || (navigator.language?.startsWith('en') ? 'en' : 'vi');
} catch {
  /* bỏ qua */
}

i18n.use(initReactI18next).init({
  resources: { vi: { translation: vi }, en: { translation: en } },
  lng: saved,
  fallbackLng: 'vi',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (l) => {
  document.documentElement.lang = l;
});
document.documentElement.lang = i18n.language;

export default i18n;
