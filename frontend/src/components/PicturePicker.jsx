// Chọn tranh qua 2 tầng ngay trong hộp thoại (dùng cho phòng tô cùng nhau).
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import Modal from './Modal/Modal';
import ThemeCard from './ThemeCard/ThemeCard';
import Icon from './Icon';

export default function PicturePicker({ onPick, onClose }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [theme, setTheme] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!theme) api.get('/themes').then((r) => setItems(r.themes.map((x) => ({ key: x.slug, title: x.name[lang], picture: x.cover }))));
    else api.get(`/themes/${theme}/pictures`).then((r) => setItems(r.pictures.map((x) => ({ key: x.id, title: x.name[lang], picture: x }))));
  }, [theme, lang]);

  const pick = (it) => {
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
        {items.map((it) => <ThemeCard key={it.key} onClick={() => pick(it)} picture={it.picture} title={it.title} testId={`pick-${it.key}`} />)}
      </div>
    </Modal>
  );
}
