// Tầng 2: Danh sách tranh của chủ đề — bé chọn thẳng một tranh rồi chọn chế độ tô.
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { PicFrame, WoodBack, WoodBoard, WoodScene, WoodSign, WOOD_GRID, useFitRows } from '../../components/Wood/Wood';
import ModePicker from '../../components/ModePicker';
import { takePrefetchedTheme } from '../../lib/prefetch';
import { pageReady } from '../../lib/transitionBus';
import { useAuth } from '../../store/auth';
import { useUi } from '../../store/ui';
import { assertThemeAllowed } from '../../lib/themeAccess';

export default function ObjectSelector() {
  const { theme } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const plan = useAuth((s) => s.plan);
  const freeLimit = useAuth((s) => s.meta?.plans?.free?.themesPerAge);
  const openUpgrade = useUi((s) => s.openUpgrade);
  const [data, setData] = useState(() => takePrefetchedTheme(theme)); // có sẵn nếu vừa được làm sẵn lúc chạy hiệu ứng
  const [picked, setPicked] = useState(null);
  useEffect(() => {
    let alive = true;
    setData(null);
    setPicked(null);
    assertThemeAllowed(theme, plan, freeLimit).then(() => api.get(`/themes/${theme}/pictures`)).then((r) => alive && setData(r)).catch((error) => {
      if (!alive) return;
      if (error.code === 'theme_vip_required') openUpgrade(true, 'theme');
      navigate('/color', { replace: true });
    });
    return () => { alive = false; };
  }, [theme, plan?.plan, plan?.endsAt, freeLimit]);
  useEffect(() => {
    if (data) requestAnimationFrame(pageReady);
  }, [data]);
  const lang = i18n.language;
  const gridRef = useRef(null);
  useFitRows(gridRef, [data]);
  return (
    <WoodScene>
      <WoodBack to="/color" label={t('select.themes')} />
      <WoodSign title={data?.theme.name[lang] || ' '} hint={t('select.pictures')} />
      <div className="mt-4">
        <WoodBoard>
          <div ref={gridRef} className={WOOD_GRID}>
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
