import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/auth';
import Icon from '../Icon';

export default function LanguageSwitch() {
  const { i18n, t } = useTranslation();
  const user = useAuth((s) => s.user);
  const updateProfile = useAuth((s) => s.updateProfile);
  const next = i18n.language === 'vi' ? 'en' : 'vi';
  const change = () => {
    i18n.changeLanguage(next);
    try {
      localStorage.setItem('btm.lang', next);
    } catch {
      /* bỏ qua */
    }
    if (user) updateProfile({ language: next }).catch(() => {});
  };
  return (
    <button type="button" onClick={change} className="btn-ghost min-h-11 gap-1 px-3 text-base" aria-label={t('nav.language')} data-testid="lang-switch">
      <Icon name="globe" size={20} />
      {i18n.language.toUpperCase()}
    </button>
  );
}
