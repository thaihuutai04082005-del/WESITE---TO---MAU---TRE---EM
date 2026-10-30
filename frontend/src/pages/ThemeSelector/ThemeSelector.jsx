// Tầng 1: Chủ đề lớn — bảng gỗ có 3 biển nhóm tuổi treo phía trên.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { PicFrame, WoodBack, WoodBoard, WoodScene, WoodSign, WoodTabs, WOOD_GRID } from '../../components/Wood/Wood';

// Chủ đề chia theo 3 nhóm tuổi, độ khó tăng dần.
const AGE_GROUPS = ['3-5', '6-8', '9+'];
const AGE_ICON = { '3-5': '🐣', '6-8': '🦊', '9+': '🐻' };
const AGE_KEY = 'colorAge';

function loadAge() {
  try {
    const v = sessionStorage.getItem(AGE_KEY);
    return AGE_GROUPS.includes(v) ? v : AGE_GROUPS[0];
  } catch {
    return AGE_GROUPS[0];
  }
}

export default function ThemeSelector() {
  const { t, i18n } = useTranslation();
  const [themes, setThemes] = useState(null);
  const [age, setAge] = useState(loadAge);
  useEffect(() => {
    api.get('/themes').then((r) => setThemes(r.themes));
  }, []);
  const pickAge = (a) => {
    setAge(a);
    try {
      sessionStorage.setItem(AGE_KEY, a);
    } catch {
      /* không lưu được thì thôi */
    }
  };
  const list = (themes || []).filter((th) => (th.age || '6-8') === age);
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
        <div>
          {themes && !list.length && (
            <p className="rounded-2xl bg-white/70 px-4 py-10 text-center font-display text-xl font-extrabold text-[#7A430F]" data-testid={`age-empty-${age}`}>
              {t('select.ageEmpty')}
            </p>
          )}
          <div className={WOOD_GRID}>
            {list.map((th) => (
              <PicFrame
                key={th.slug}
                to={`/color/${th.slug}`}
                picture={th.cover}
                title={th.name[i18n.language]}
                subtitle={t('select.pictureCount', { n: th.pictureCount })}
                testId={`theme-${th.slug}`}
              />
            ))}
          </div>
        </div>
      </WoodBoard>
    </WoodScene>
  );
}
