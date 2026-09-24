// Hoạt hình bóc thẻ: thẻ rung → lật → phát sáng theo độ hiếm.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PictureView from '../PictureView/PictureView';
import Confetti from '../Confetti';

export const RARITY_COLOR = { S: '#FF5F7E', A: '#7D5FFF', B: '#5DADE2', C: '#A8B8C4' };

export function RarityBadge({ rarity, className = '' }) {
  return (
    <span className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 font-display text-lg font-extrabold text-white shadow ${rarity === 'S' ? 'card-s-bg' : ''} ${className}`} style={rarity === 'S' ? undefined : { background: RARITY_COLOR[rarity] }}>
      {rarity}
    </span>
  );
}

export default function GachaCardReveal({ result, onDone, delay = 0 }) {
  const { t, i18n } = useTranslation();
  const [stage, setStage] = useState('shake');
  useEffect(() => {
    const a = setTimeout(() => setStage('flip'), 1000 + delay);
    return () => clearTimeout(a);
  }, [delay]);
  const r = result.rarity;
  return (
    <div className="flex flex-col items-center gap-3">
      {stage === 'flip' && (r === 'S' || r === 'A') && <Confetti count={r === 'S' ? 90 : 40} />}
      <div className={`gacha-card h-72 w-52 ${stage === 'flip' ? 'flipped' : ''} ${stage === 'shake' ? 'gacha-shake' : ''}`}>
        <div className="gacha-card-inner">
          <div className="gacha-face flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark shadow-pop">
            <svg viewBox="0 0 100 100" className="h-24 w-24">
              <polygon points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38" fill="#FFD54F" stroke="#1B2A38" strokeWidth="4" strokeLinejoin="round" />
            </svg>
          </div>
          <div className={`gacha-face gacha-back-face flex flex-col overflow-hidden bg-white p-2 rarity-glow-${r}`}>
            <div className="flex items-center justify-between pb-1">
              <RarityBadge rarity={r} />
              <span className="text-xs font-bold text-muted">{t(`gacha.rarity.${r}`)}</span>
            </div>
            <PictureView picture={result.picture} className="rounded-xl" />
            <div className="mt-1 line-clamp-2 text-center font-display text-sm font-bold leading-tight">{result.picture.name[i18n.language]}</div>
          </div>
        </div>
      </div>
      {stage === 'flip' && onDone && (
        <button type="button" className="btn-primary animate-pop" onClick={onDone}>
          {t('common.great')}
        </button>
      )}
    </div>
  );
}
