// Tầng 2: Danh sách tranh của chủ đề — bé chọn thẳng một tranh rồi chọn chế độ tô.
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { PicFrame, WoodBack, WoodBoard, WoodScene, WoodSign, WOOD_GRID } from '../../components/Wood/Wood';
import ModePicker from '../../components/ModePicker';

export default function ObjectSelector() {
  const { theme } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [picked, setPicked] = useState(null);
  useEffect(() => {
    api.get(`/themes/${theme}/pictures`).then(setData).catch(() => navigate('/color', { replace: true })); // chủ đề đã ẩn/không có → quay lại trang chọn
  }, [theme]);
  const lang = i18n.language;
  return (
    <WoodScene>
      <WoodBack to="/color" label={t('select.themes')} />
      <WoodSign title={data?.theme.name[lang] || ' '} hint={t('select.pictures')} />
      <div className="mt-4">
        <WoodBoard>
          <div className={WOOD_GRID}>
            {(data?.pictures || []).map((p) => (
              <PicFrame key={p.id} onClick={() => setPicked(p)} picture={p} title={p.name[lang]} testId={`pose-${p.slug}`} />
            ))}
          </div>
        </WoodBoard>
      </div>
      {picked && <ModePicker picture={picked} onClose={() => setPicked(null)} />}
    </WoodScene>
  );
}
