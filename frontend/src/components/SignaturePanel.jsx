// Bảng chỉnh chữ ký trong bộ công cụ vẽ: 4 nút góc, to/nhỏ, xoay nhẹ, màu mực, gỡ chữ ký.
// Không đổi mẫu ở đây — đổi chữ ký mặc định ở trang "Chữ ký của bé".
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import { MAX_ROT, SCALE, clampPlacement, isFixedColor, toCorner } from '../lib/signature';

const CORNERS = [
  ['tl', '↖'],
  ['tr', '↗'],
  ['bl', '↙'],
  ['br', '↘'],
];

export default function SignaturePanel({ signature, hasDefault, inks, onChange }) {
  const { t } = useTranslation();

  if (!hasDefault && !signature) {
    return (
      <div className="space-y-2 rounded-2xl bg-primary-light p-3 text-center" data-testid="signature-empty">
        <p className="font-bold">{t('signature.noneYet')}</p>
        <Link to="/signature" className="btn-primary">
          <Icon name="signature" /> {t('signature.create')}
        </Link>
      </div>
    );
  }
  if (!signature) return null;

  const set = (patch) => onChange(clampPlacement({ ...signature, ...patch }));
  return (
    <div className="space-y-3" data-testid="signature-panel">
      <p className="text-sm font-bold text-muted">{t('signature.dragHint')}</p>
      <div className="flex flex-wrap items-center gap-2">
        {CORNERS.map(([c, arrow]) => (
          <button key={c} type="button" className="btn-ghost min-h-11 px-3 text-xl" onClick={() => onChange(toCorner(signature, c))} aria-label={t(`signature.corner.${c}`)} title={t(`signature.corner.${c}`)} data-testid={`sig-corner-${c}`}>
            {arrow}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-3 font-bold">
        <span className="w-14 shrink-0 text-sm">{t('signature.size')}</span>
        <input type="range" min={SCALE.min} max={SCALE.max} step="0.05" value={signature.scale} onChange={(e) => set({ scale: Number(e.target.value) })} className="h-11 w-full accent-primary" aria-label={t('signature.size')} data-testid="sig-size" />
      </label>
      <label className="flex items-center gap-3 font-bold">
        <span className="w-14 shrink-0 text-sm">{t('signature.tilt')}</span>
        <input type="range" min={-MAX_ROT} max={MAX_ROT} step="1" value={signature.rot} onChange={(e) => set({ rot: Number(e.target.value) })} className="h-11 w-full accent-primary" aria-label={t('signature.tilt')} />
      </label>
      {!isFixedColor(signature.style) && (
        <div>
          <div className="mb-1 text-sm font-bold text-muted">{t('signature.ink')}</div>
          <div className="flex flex-wrap gap-2">
            {inks.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set({ color: c })}
                className={`h-10 w-10 rounded-full border-4 shadow-soft transition ${signature.color === c ? 'scale-110 border-primary' : 'border-white'}`}
                style={{ background: c, outline: c === '#FFFFFF' ? '1px solid #D5DEE8' : 'none' }}
                aria-label={c}
                aria-pressed={signature.color === c}
              />
            ))}
          </div>
        </div>
      )}
      <button type="button" className="btn-ghost w-full" onClick={() => onChange(null)} data-testid="sig-remove">
        <Icon name="trash" /> {t('signature.remove')}
      </button>
    </div>
  );
}
