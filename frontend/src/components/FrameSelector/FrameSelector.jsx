// Chọn khung: type="artwork" (Khung Artwork mua bằng Ruby) hoặc type="avatar" (Khung Avatar theo Rank).
import { useTranslation } from 'react-i18next';
import { ARTWORK_FRAMES, AVATAR_FRAMES } from '../../lib/frames';
import Avatar from '../Avatar/Avatar';
import Icon from '../Icon';

export default function FrameSelector({ type = 'artwork', items = [], value, onChange, avatar = 'meo', allowNone = true }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  return (
    <div className="flex flex-wrap gap-3" data-testid={`frame-selector-${type}`}>
      {allowNone && (
        <button type="button" onClick={() => onChange(null)} className={`flex h-24 w-24 flex-col items-center justify-center rounded-2xl border-2 text-sm font-bold ${!value ? 'border-primary bg-primary-light' : 'border-line'}`}>
          <Icon name="close" />
          {t('frames.none')}
        </button>
      )}
      {items.map((it) => {
        const locked = !it.owned;
        return (
          <button
            key={it.slug}
            type="button"
            disabled={locked}
            onClick={() => onChange(it.slug)}
            className={`relative flex h-24 w-24 flex-col items-center justify-center rounded-2xl border-2 p-1 ${value === it.slug ? 'border-primary bg-primary-light' : 'border-line'} ${locked ? 'opacity-40' : ''}`}
            title={it.name?.[lang]}
          >
            {type === 'artwork' ? (
              <svg viewBox="0 0 700 700" className="h-16 w-16" dangerouslySetInnerHTML={{ __html: (ARTWORK_FRAMES[it.slug]?.() || '') + '<rect x="50" y="50" width="600" height="600" fill="#EAF6FF"/>' }} />
            ) : (
              <Avatar avatar={avatar} frame={AVATAR_FRAMES[it.slug] ? it.slug : null} size={64} />
            )}
            <span className="line-clamp-1 text-[11px] font-bold">{it.name?.[lang]}</span>
            {locked && <Icon name="lock" size={18} className="absolute right-1 top-1" />}
          </button>
        );
      })}
    </div>
  );
}
