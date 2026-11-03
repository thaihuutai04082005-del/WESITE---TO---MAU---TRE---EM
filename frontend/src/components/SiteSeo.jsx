import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/auth';
import { pageMetadata, metadataHtml } from '../seo/site';

export default function SiteSeo() {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const user = useAuth((state) => state.user);
  useEffect(() => {
    const meta = pageMetadata(pathname, { personalized: !!user });
    document.title = meta.title;
    document.head.querySelectorAll('[data-seo]').forEach((node) => node.remove());
    const template = document.createElement('template');
    template.innerHTML = metadataHtml(meta);
    template.content.querySelector('title')?.remove();
    document.head.append(template.content);
    if (meta.page && i18n.language !== meta.page.lang) i18n.changeLanguage(meta.page.lang);
  }, [pathname, user, i18n]);
  return null;
}
