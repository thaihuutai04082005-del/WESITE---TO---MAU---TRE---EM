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
    <button type="button" onClick={change} className="btn-ghost min-h-11 min-w-11 gap-1 rounded-full px-2 text-base sm:px-3" aria-label={t('nav.language')} data-testid="lang-switch">
      <span className="hidden sm:inline">
        <Icon name="globe" size={20} />
      </span>
      {i18n.language.toUpperCase()}
    </button>
  );
}
