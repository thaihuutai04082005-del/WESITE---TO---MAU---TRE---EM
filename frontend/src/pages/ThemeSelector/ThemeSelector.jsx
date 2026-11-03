// Tầng 1: Chủ đề lớn — bảng gỗ có 3 biển nhóm tuổi treo phía trên.
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { pageReady } from '../../lib/transitionBus';
import { usePicture } from '../../hooks/usePicture';
import { useAuth } from '../../store/auth';
import { useUi } from '../../store/ui';
import { resolveThemeAccess } from '../../../../shared/themeAccess.mjs';
import ModePicker from '../../components/ModePicker';
import Icon from '../../components/Icon';
import { RarityBadge } from '../../components/GachaCardReveal/GachaCardReveal';
import { PicFrame, WoodBack, WoodBoard, WoodScene, WoodSign, WoodTabs, WOOD_GRID, useFitRows } from '../../components/Wood/Wood';

// Chủ đề chia theo 3 nhóm tuổi, độ khó tăng dần; tab thứ 4 là các tranh thẻ hiếm bé đã bóc được (chờ tô).
const AGE_GROUPS = ['3-5', '6-8', '9+', 'cards'];
const CardBackIcon = () => <img src="/icons/card-back.webp" alt="" className="card-back-icon" draggable={false} />;
const AGE_ICON = { '3-5': '🐣', '6-8': '🚀', '9+': '🌟', cards: <CardBackIcon /> };
const AGE_KEY = 'colorAge';

function loadAge() {
  try {
    const v = sessionStorage.getItem(AGE_KEY);
    return AGE_GROUPS.includes(v) ? v : AGE_GROUPS[0];
  } catch {
    return AGE_GROUPS[0];
  }
}

/** Thẻ đã bóc: bấm vào để chọn chế độ rồi tô. Tô xong tranh mới vào Bộ sưu tập (tab Tranh thẻ hiếm). */
function CardFrame({ card, onPick }) {
  const { i18n } = useTranslation();
  const pic = usePicture(card.pictureId);
  const title = card.name[i18n.language];
  return (
    <div className="relative">
      <PicFrame onClick={() => pic && onPick(pic)} picture={pic} title={title} testId={`cardpic-${card.pictureId}`} />
      <RarityBadge rarity={card.rarity} className="absolute -left-1 -top-1 z-10" />
    </div>
  );
}

function CardsBoard() {
  const { t } = useTranslation();
  const [col, setCol] = useState(null);
  const [picked, setPicked] = useState(null);
  const gridRef = useRef(null);
  useFitRows(gridRef, [col]);
  useEffect(() => {
    api.get('/gacha/cards').then(setCol).catch(() => setCol({ cards: [] }));
  }, []);
  const cards = col ? Object.values(col.cards.reduce((acc, c) => ({ ...acc, [c.pictureId]: acc[c.pictureId] || c }), {})) : [];
  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Link to="/gacha" className="btn-ghost min-h-10 bg-white text-base" data-testid="cards-to-gacha">
          <Icon name="gift" /> {t('collection.toGacha')}
        </Link>
      </div>
      {col && !cards.length && (
        <p className="rounded-2xl bg-white/70 px-4 py-10 text-center font-display text-xl font-extrabold text-[#7A430F]" data-testid="cards-empty">
          {t('select.cardsEmpty')}
        </p>
      )}
      <div ref={gridRef} className={WOOD_GRID}>
        {cards.map((c) => (
          <CardFrame key={c.pictureId} card={c} onPick={setPicked} />
        ))}
      </div>
      {picked && <ModePicker picture={picked} onClose={() => setPicked(null)} />}
    </div>
  );
}

export default function ThemeSelector() {
  const { t, i18n } = useTranslation();
  const plan = useAuth((s) => s.plan);
  const freeLimit = useAuth((s) => s.meta?.plans?.free?.themesPerAge);
  const openUpgrade = useUi((s) => s.openUpgrade);
  const [params] = useSearchParams();
  const [themes, setThemes] = useState(null);
  const [age, setAge] = useState(() => (AGE_GROUPS.includes(params.get('age')) ? params.get('age') : loadAge()));
  useEffect(() => {
    let alive = true;
    api.get('/themes').then((r) => alive && setThemes(r.themes)).catch(() => alive && setThemes([]));
    return () => { alive = false; };
  }, [plan?.plan, plan?.endsAt]);
  useEffect(() => {
    if (themes) requestAnimationFrame(pageReady); // báo cho hiệu ứng chuyển màn hình: trang đã sẵn sàng
  }, [themes]);
  const pickAge = (a) => {
    setAge(a);
    try {
      sessionStorage.setItem(AGE_KEY, a);
    } catch {
      /* không lưu được thì thôi */
    }
  };
  const list = resolveThemeAccess(themes || [], plan, freeLimit).filter((th) => (th.age || '6-8') === age);
  const gridRef = useRef(null);
  useFitRows(gridRef, [themes, age]);
  return (
    <WoodScene>
      <WoodBack to="/" label={t('common.back')} />
      <WoodSign title={t('select.boardTitle')} />
      <WoodTabs
        value={age}
        onChange={pickAge}
        tabs={AGE_GROUPS.map((a) => ({ key: a, icon: AGE_ICON[a], label: t(`select.age.${a}`) }))}
      />
      <WoodBoard testId={`age-${age}`}>
        {age === 'cards' ? (
          <CardsBoard />
        ) : (
        <div>
          {themes && !list.length && (
            <p className="rounded-2xl bg-white/70 px-4 py-10 text-center font-display text-xl font-extrabold text-[#7A430F]" data-testid={`age-empty-${age}`}>
              {t('select.ageEmpty')}
            </p>
          )}
          <div ref={gridRef} className={WOOD_GRID}>
            {list.map((th) => (
              <PicFrame
                key={th.slug}
                to={th.locked ? undefined : `/color/${th.slug}`}
                onClick={() => openUpgrade(true, 'theme')}
                locked={th.locked}
                picture={th.cover}
                title={th.name[i18n.language]}
                subtitle={t('select.pictureCount', { n: th.pictureCount })}
                testId={`theme-${th.slug}`}
              />
            ))}
          </div>
        </div>
        )}
      </WoodBoard>
    </WoodScene>
  );
}
