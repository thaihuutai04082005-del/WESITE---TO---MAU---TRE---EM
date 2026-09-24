// Tầng 1: Chủ đề lớn.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import ThemeCard from '../../components/ThemeCard/ThemeCard';
import { useAuth } from '../../store/auth';
import { PlanBadge } from '../Payment/Plans';

export default function ThemeSelector() {
  const { t, i18n } = useTranslation();
  const plan = useAuth((s) => s.plan);
  const [themes, setThemes] = useState(null);
  useEffect(() => {
    api.get('/themes').then((r) => setThemes(r.themes));
  }, []);
  return (
    <div className="page">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="page-title">{t('select.themes')}</h1>
          <p className="text-muted">{t('select.themesHint')}</p>
        </div>
        <PlanBadge plan={plan} />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {(themes || []).map((th) => (
          <ThemeCard key={th.slug} to={`/color/${th.slug}`} picture={th.cover} title={th.name[i18n.language]} subtitle={t('select.objectCount', { n: th.objectCount })} testId={`theme-${th.slug}`} />
        ))}
      </div>
    </div>
  );
}
