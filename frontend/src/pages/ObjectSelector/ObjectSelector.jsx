// Tầng 2: Đối tượng cụ thể — mỗi đối tượng 1 tranh minh hoạ đại diện.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import ThemeCard from '../../components/ThemeCard/ThemeCard';
import Icon from '../../components/Icon';

export default function ObjectSelector() {
  const { theme } = useParams();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get(`/themes/${theme}/objects`).then(setData);
  }, [theme]);
  return (
    <div className="page">
      <Link to="/color" className="mb-2 inline-flex items-center gap-1 font-bold text-primary">
        <Icon name="back" size={20} /> {t('select.themes')}
      </Link>
      <h1 className="page-title mb-4">{data?.theme.name[i18n.language]}</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {(data?.objects || []).map((o) => (
          <ThemeCard key={o.slug} to={`/color/${theme}/${o.slug}`} picture={o.cover} title={o.name[i18n.language]} subtitle={t('select.variantCount', { n: o.pictureCount })} testId={`object-${o.slug}`} />
        ))}
      </div>
    </div>
  );
}
