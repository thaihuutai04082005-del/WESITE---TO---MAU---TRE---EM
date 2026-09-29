// Tầng 3: Biến thể tư thế / cảm xúc / hoạt động → chọn chế độ tô.
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import ThemeCard from '../../components/ThemeCard/ThemeCard';
import useOneLineTitles, { GRID_CLASS } from '../../components/ThemeCard/useOneLineTitles';
import ModePicker from '../../components/ModePicker';
import Icon from '../../components/Icon';

export default function PoseSelector() {
  const { theme, object } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [picked, setPicked] = useState(null);
  useEffect(() => {
    api.get(`/themes/${theme}/objects/${object}/pictures`).then(setData).catch(() => navigate(`/color/${theme}`, { replace: true })); // chủ đề đã ẩn/không có → quay lại trang chọn
  }, [theme, object]);
  const lang = i18n.language;
  const gridRef = useRef(null);
  useOneLineTitles(gridRef, i18n.language, [data]);
  return (
    <div className="page px-3 sm:px-4 lg:max-w-[1320px]">
      <Link to={`/color/${theme}`} className="mb-2 inline-flex items-center gap-1 font-bold text-primary">
        <Icon name="back" size={20} /> {data?.theme.name[lang]}
      </Link>
      <h1 className="page-title mb-4">{data?.object.name[lang]}</h1>
      <div ref={gridRef} className={GRID_CLASS}>
        {(data?.pictures || []).map((p) => (
          <ThemeCard key={p.id} onClick={() => setPicked(p)} picture={p} title={p.variantName?.[lang] || p.name[lang]} testId={`pose-${p.slug}`} />
        ))}
      </div>
      {picked && <ModePicker picture={picked} onClose={() => setPicked(null)} />}
    </div>
  );
}
