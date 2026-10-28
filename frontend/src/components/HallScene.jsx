// Cảnh Hội trường triển lãm vẽ bằng SVG/CSS (co giãn theo màn hình): trần xanh có đèn, tường kem kẻ sọc,
// thanh treo tranh bằng gỗ, đèn rọi + khung tranh + bảng tên, hàng cột ruy băng đỏ, chậu cây, sàn gạch nâu; mỗi tranh có thẻ thả cảm xúc kiểu mạng xã hội; hai nút mũi tên lướt sang 5 tranh khác.
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { REACTIONS } from '../lib/exhibition';
import { ArtworkImage } from './Exhibition';
import Icon from './Icon';

/** Đèn rọi treo trên thanh gỗ: chụp đèn nâu + chùm sáng toả xuống khung tranh. */
function Lamp() {
  return (
    <div className="pointer-events-none relative z-10 flex flex-col items-center" aria-hidden="true">
      <svg viewBox="0 0 48 34" className="h-8 w-12">
        <rect x="21" y="0" width="6" height="8" fill="#8A4B1F" />
        <path d="M8 32 Q10 12 22 10 H26 Q38 12 40 32 Z" fill="#9C5A2A" />
        <path d="M8 32 Q10 12 22 10 H26 Q38 12 40 32" fill="none" stroke="#6E3A17" strokeWidth="2" strokeLinejoin="round" />
        <ellipse cx="24" cy="32" rx="16" ry="2.6" fill="#FFE8A8" stroke="#6E3A17" strokeWidth="1.5" />
      </svg>
      <span className="hall-beam" />
    </div>
  );
}

/** Dây treo hình chữ A + núm vàng phía trên khung. */
function Hanger() {
  return (
    <svg viewBox="0 0 120 34" className="-mb-1 h-6 w-28 sm:h-8" aria-hidden="true">
      <path d="M8 34 L60 8 L112 34" fill="none" stroke="#7A3F18" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="60" cy="8" r="6" fill="#F0B429" stroke="#B7791F" strokeWidth="2" />
    </svg>
  );
}

/** Thẻ cảm xúc dưới mỗi tranh (kiểu Facebook): dòng tóm tắt (vài cảm xúc nhiều nhất + tổng) và nút "Thả cảm xúc" mở bảng 5 cảm xúc. */
function ReactBar({ entry, reactionsOpen, onReact }) {
  const { t } = useTranslation();
  const [pick, setPick] = useState(false);
  const [busy, setBusy] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    if (!pick) return undefined;
    const close = (e) => {
      if (box.current && !box.current.contains(e.target)) setPick(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [pick]);

  const canReact = reactionsOpen && !entry.own && !entry.final;
  const top = REACTIONS.filter((r) => entry.reactions[r.key] > 0)
    .sort((a, b) => entry.reactions[b.key] - entry.reactions[a.key])
    .slice(0, 3);
  const mine = REACTIONS.find((r) => r.key === entry.mine);
  const hint = entry.own ? t('exhibition.ownHint') : !reactionsOpen || entry.final ? t('exhibition.lockedHint') : undefined;

  async function choose(key) {
    if (busy) return;
    setBusy(true);
    try {
      await onReact(entry, key);
    } finally {
      setBusy(false);
      setPick(false);
    }
  }

  return (
    <div ref={box} className="hall-react relative" data-testid={`wall-react-${entry.id}`}>
      <div className="flex h-6 items-center justify-center gap-1.5 text-xs font-extrabold text-[#6B4A0D]">
        {entry.total > 0 && (
          <>
            <span className="flex -space-x-1.5">
              {top.map((r) => (
                <span key={r.key} className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[13px] leading-none shadow-soft">
                  {r.emoji}
                </span>
              ))}
            </span>
            <span data-testid={`wall-total-${entry.id}`}>{entry.total}</span>
          </>
        )}
      </div>
      <button
        type="button"
        disabled={!canReact}
        onClick={() => setPick((v) => !v)}
        title={hint}
        aria-expanded={pick}
        className={`mx-auto flex h-8 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-extrabold shadow-soft transition enabled:hover:-translate-y-0.5 disabled:opacity-60 sm:text-sm ${mine ? 'bg-primary-light text-primary-dark' : 'bg-white text-[#6B4A0D]'}`}
      >
        {mine ? (
          <>
            <span className="text-base leading-none">{mine.emoji}</span>
            <span className="truncate">{t(`exhibition.reactions.${mine.key}`)}</span>
          </>
        ) : (
          <>
            <span className="text-base leading-none">🤍</span>
            <span className="truncate">{t('exhibition.reactBtn')}</span>
          </>
        )}
      </button>
      {pick && (
        <div className="absolute bottom-full left-1/2 z-30 mb-1 flex -translate-x-1/2 gap-1 rounded-full bg-white p-1.5 shadow-pop" role="menu">
          {REACTIONS.map((r) => (
            <button
              key={r.key}
              type="button"
              role="menuitem"
              onClick={() => choose(r.key)}
              disabled={busy}
              aria-pressed={entry.mine === r.key}
              title={t(`exhibition.reactions.${r.key}`)}
              data-testid={`wall-pick-${r.key}`}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none transition hover:scale-125 ${entry.mine === r.key ? 'bg-primary-light' : ''}`}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Một ô tranh trên tường: có tranh thật hoặc ô trống "Sắp ra mắt"; bên dưới là bảng tên + thẻ cảm xúc. */
export function HallFrame({ entry, picture, onOpen, lang, reactionsOpen, onReact }) {
  const { t } = useTranslation();
  const filled = !!entry;
  const Wrap = filled ? 'button' : 'div';
  return (
    <div className="hall-slot flex min-w-0 flex-col items-center">
      <Lamp />
      <Hanger />
      <Wrap
        {...(filled ? { type: 'button', onClick: onOpen, 'data-testid': `entry-${entry.id}` } : {})}
        className={`hall-frame group relative w-full max-w-[210px] lg:max-w-[260px] 2xl:max-w-[310px] ${filled ? 'cursor-pointer transition hover:-translate-y-1' : ''}`}
      >
        <span className="hall-knob left-0 top-0" />
        <span className="hall-knob right-0 top-0" />
        <span className="hall-knob bottom-0 left-0" />
        <span className="hall-knob bottom-0 right-0" />
        <div className="relative overflow-hidden rounded-[3px] bg-[#FAF5EE] shadow-inner">
          {filled ? (
            <ArtworkImage cacheKey={`e${entry.id}`} picture={picture} data={entry.data} size={360} />
          ) : (
            <div className="flex aspect-square w-full flex-col items-center justify-center gap-1 text-[#9AA0A6]">
              <svg viewBox="0 0 48 48" className="h-1/3 w-1/3" aria-hidden="true">
                <path d="M24 5C13 5 5 13 5 23c0 9 7 16 16 16 2.5 0 4-1.6 4-3.6 0-1.6-.8-2.6-.8-4 0-1.8 1.4-3.2 3.2-3.2h5C38 24.2 43 20 43 14 43 9 35 5 24 5z" fill="currentColor" opacity=".75" />
                <circle cx="15" cy="20" r="3" fill="#FAF5EE" />
                <circle cx="21" cy="12.5" r="3" fill="#FAF5EE" />
                <circle cx="31" cy="12.5" r="3" fill="#FAF5EE" />
                <path d="M31 40 L44 12" stroke="#FAF5EE" strokeWidth="5" strokeLinecap="round" />
                <path d="M31 40 L44 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span className="px-1 text-center text-xs font-extrabold sm:text-sm">{t('exhibition.comingSoon')}</span>
            </div>
          )}
        </div>
        {filled && entry.award && (
          <span className="absolute -right-2 -top-3 z-10 rounded-full bg-coral px-2 py-0.5 text-[11px] font-extrabold text-white shadow-soft" title={t('exhibition.award')}>
            🏆
          </span>
        )}
      </Wrap>
      <div className="hall-plaque mt-4 w-24 max-w-[80%] sm:w-28" title={filled ? `${entry.name[lang]} · ${entry.author.nickname}` : undefined}>
        {filled && <span className="block truncate px-1 text-[10px] font-extrabold text-[#6B4A0D] sm:text-xs">{entry.author.nickname}</span>}
      </div>
      {filled ? <ReactBar entry={entry} reactionsOpen={reactionsOpen} onReact={onReact} /> : <div className="hall-react" aria-hidden="true" />}
    </div>
  );
}

/** Nút mũi tên màu lướt sang 5 tranh khác; nhún nhẹ để thu hút bé bấm. */
export function HallArrow({ dir, onClick, label }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={`hall-arrow ${dir === 'next' ? 'hall-arrow-r' : 'hall-arrow-l'}`} data-testid={`hall-${dir}`}>
      <Icon name="chevronRight" size={34} strokeWidth={4} className={dir === 'next' ? '' : 'rotate-180'} />
    </button>
  );
}

/** Hàng cột chắn ruy băng đỏ (cột xanh ngọc, đỉnh vàng). */
export function RopeLine({ posts = 6 }) {
  const w = 1000;
  const xs = Array.from({ length: posts }, (_, i) => 40 + (i * (w - 80)) / (posts - 1));
  return (
    <svg viewBox={`0 0 ${w} 96`} className="h-auto w-full" aria-hidden="true">
      {xs.slice(0, -1).map((x, i) => (
        <path key={i} d={`M${x + 4} 22 Q${(x + xs[i + 1]) / 2} 50 ${xs[i + 1] - 4} 22`} fill="none" stroke="#E5322D" strokeWidth="7" strokeLinecap="round" />
      ))}
      {xs.map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="88" rx="26" ry="7" fill="#0E8E86" stroke="#0A6B65" strokeWidth="2" />
          <rect x={x - 5} y="22" width="10" height="64" rx="4" fill="#12A89D" stroke="#0A6B65" strokeWidth="2" />
          <circle cx={x} cy="16" r="9" fill="#F0B429" stroke="#B7791F" strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

/** Chậu cây lá xanh ở hai góc tường. */
export function Plant({ flip = false, className = '' }) {
  return (
    <svg viewBox="0 0 120 150" className={className} style={flip ? { transform: 'scaleX(-1)' } : undefined} aria-hidden="true">
      <g stroke="#0F5F3A" strokeWidth="2.5" strokeLinejoin="round">
        <path d="M60 110 C30 100 14 70 24 30 C46 46 58 76 60 110Z" fill="#2E9E57" />
        <path d="M60 110 C90 100 106 70 96 30 C74 46 62 76 60 110Z" fill="#37B067" />
        <path d="M60 112 C48 80 50 40 62 8 C76 40 74 80 60 112Z" fill="#1F8A4C" />
        <path d="M60 114 C30 112 8 100 4 76 C32 80 52 92 60 114Z" fill="#43BE72" />
        <path d="M60 114 C90 112 112 100 116 76 C88 80 68 92 60 114Z" fill="#2E9E57" />
      </g>
      <path d="M32 112 H88 L82 146 H38 Z" fill="#F6F1EA" stroke="#B9AFA2" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

