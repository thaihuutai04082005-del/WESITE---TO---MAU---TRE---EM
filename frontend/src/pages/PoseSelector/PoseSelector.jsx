// Tầng 3: Biến thể tư thế / cảm xúc / hoạt động → chọn chế độ tô.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import ThemeCard from '../../components/ThemeCard/ThemeCard';
import ModePicker from '../../components/ModePicker';
import Icon from '../../components/Icon';

export default function PoseSelector() {
  const { theme, object } = useParams();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [picked, setPicked] = useState(null);
  useEffect(() => {
    api.get(`/themes/${theme}/objects/${object}/pictures`).then(setData);
  }, [theme, object]);
  const lang = i18n.language;
  return (
    <div className="page">
      <Link to={`/color/${theme}`} className="mb-2 inline-flex items-center gap-1 font-bold text-primary">
        <Icon name="back" size={20} /> {data?.theme.name[lang]}
      </Link>
      <h1 className="page-title mb-4">{data?.object.name[lang]}</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {(data?.pictures || []).map((p) => (
          <ThemeCard key={p.id} onClick={() => setPicked(p)} picture={p} title={p.name[lang]} testId={`pose-${p.slug}`} />
        ))}
      </div>
      {picked && <ModePicker picture={picked} onClose={() => setPicked(null)} />}
    </div>
  );
}
