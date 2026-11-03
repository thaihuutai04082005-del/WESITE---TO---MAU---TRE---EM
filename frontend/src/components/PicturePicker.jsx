// Chọn tranh qua 2 tầng ngay trong hộp thoại (dùng cho phòng tô cùng nhau).
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import Modal from './Modal/Modal';
import ThemeCard from './ThemeCard/ThemeCard';
import Icon from './Icon';
import { useUi } from '../store/ui';
import { useAuth } from '../store/auth';
import { resolveThemeAccess } from '../../../shared/themeAccess.mjs';
import { loadThemePictures } from '../lib/themeAccess';

export default function PicturePicker({ onPick, onClose }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const openUpgrade = useUi((s) => s.openUpgrade);
  const plan = useAuth((s) => s.plan);
  const freeLimit = useAuth((s) => s.meta?.plans?.free?.themesPerAge);
  const previewApi = useAuth((s) => s.meta?.picturePreviews === true);
  const [theme, setTheme] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;
    setItems([]);
    const request = !theme
      ? api.get('/themes?preview=1').then((r) => resolveThemeAccess(r.themes, plan, freeLimit).map((x) => ({ key: x.slug, title: x.name[lang], picture: x.cover, locked: x.locked })))
      : loadThemePictures(theme, plan, freeLimit, { previewApi })
        .then((r) => r.pictures.map((x) => ({ key: x.id, title: x.name[lang], picture: x })));
    request.then((items) => active && setItems(items)).catch((error) => {
      if (!active) return;
      if (error.code === 'theme_vip_required') { onClose?.(); openUpgrade(true, 'theme'); }
      else setTheme(null);
    });
    return () => { active = false; };
  }, [theme, lang, plan?.plan, plan?.endsAt, freeLimit, previewApi]);

  const pick = (it) => {
    if (it.locked) { onClose?.(); openUpgrade(true, 'theme'); return; }
    if (!theme) setTheme(it.key);
    else onPick(it.picture);
  };
  const back = () => setTheme(null);

  return (
    <Modal open onClose={onClose} wide>
      <div className="mb-3 flex items-center gap-2">
        {theme && (
          <button type="button" className="btn-ghost min-h-11 px-3" onClick={back} aria-label={t('common.back')}>
            <Icon name="back" />
          </button>
        )}
        <h2 className="font-display text-2xl font-extrabold">{!theme ? t('select.themes') : t('select.pictures')}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((it) => <ThemeCard key={it.key} onClick={() => pick(it)} picture={it.picture} title={`${it.locked ? '🔒 VIP · ' : ''}${it.title}`} testId={`pick-${it.key}`} />)}
      </div>
    </Modal>
  );
}
