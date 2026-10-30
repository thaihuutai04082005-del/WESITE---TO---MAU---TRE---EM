// Chọn 1 trong 2 chế độ tô (Mục 3): Tô theo mẫu / Sáng tạo.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PictureView from './PictureView/PictureView';
import { createArtwork } from '../lib/actions';
import { errorText } from '../lib/format';
import { useUi } from '../store/ui';

const WORD_COLORS = ['#2F9BF5', '#FFB01A', '#F0504F', '#33C45A'];

/** Cụm lá xanh ở đầu biển. */
function Leaves({ className }) {
  const leaf = 'M0 0 C12 -20 40 -22 56 -4 C40 12 12 16 0 0 Z';
  return (
    <svg viewBox="-10 -34 90 68" className={`mode-leaves ${className || ''}`} aria-hidden="true">
      {[-30, 8, 42].map((r) => (
        <g key={r} transform={`rotate(${r})`}>
          <path d={leaf} fill="#4FBF3F" stroke="#2C7A22" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M4 -1 C20 -5 36 -7 48 -4" stroke="#9BE36C" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

/** Bảng màu 5 chấm (biểu tượng nút "Tô theo mẫu"). */
function PaletteIcon() {
  return <img src="/icons/mode-palette.webp" alt="" className="mode-btn-icon mode-btn-palette" draggable={false} />;
}

/** Cây cọ cán xanh ngọn đỏ (biểu tượng nút "Sáng tạo"). */
function CrayonIcon() {
  return <img src="/icons/mode-brush.webp" alt="" className="mode-btn-icon mode-btn-brush" draggable={false} />;
}

/** Cây cọ ngọn đỏ ở đầu biển. */
function BrushDeco() {
  return (
    <svg viewBox="0 0 100 100" className="mode-brush" aria-hidden="true">
      <g transform="rotate(38 50 50)">
        <path d="M44 4 C34 14 32 34 36 52 L64 52 C68 34 66 14 56 4 C52 1 48 1 44 4 Z" fill="#8A4F2A" stroke="#5E3416" strokeWidth="3" strokeLinejoin="round" />
        <path d="M44 4 C48 1 52 1 56 4 C60 10 62 18 62 24 C54 22 46 22 38 24 C38 18 40 10 44 4 Z" fill="#F0504F" />
        <rect x="35" y="50" width="30" height="14" rx="3" fill="#F6C46D" stroke="#B5651F" strokeWidth="3" />
        <path d="M38 64 L62 64 L55 96 Q50 100 45 96 Z" fill="#F2A33A" stroke="#B5651F" strokeWidth="3" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export default function ModePicker({ picture, onClose }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toast = useUi((s) => s.toast);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!picture) return null;
  const go = async (mode) => {
    setBusy(true);
    try {
      const id = await createArtwork(picture.id, mode);
      navigate(`/draw/${id}`);
    } catch (e) {
      toast(errorText(t, e), 'error');
      setBusy(false);
    }
  };
  const name = picture.name[i18n.language];
  return (
    <div className="mode-overlay" onClick={() => onClose?.()}>
      <div role="dialog" aria-modal="true" aria-label={name} className="mode-dialog" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="mode-close" onClick={() => onClose?.()} aria-label={t('common.close', { defaultValue: 'Đóng' })} data-testid="mode-close">
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M6 6 L18 18 M18 6 L6 18" stroke="#2F86E8" strokeWidth="4.4" strokeLinecap="round" /></svg>
        </button>
        <div className="mode-title-wrap">
          <span className="mode-rope mode-rope-l" />
          <span className="mode-rope mode-rope-r" />
          <Leaves className="mode-leaves-l" />
          <h2 className="mode-title" data-testid="mode-title">
            {String(name).split(' ').map((w, i) => (
              <span key={`${w}-${i}`} style={{ color: WORD_COLORS[i % WORD_COLORS.length] }}>{w} </span>
            ))}
          </h2>
          <BrushDeco />
          <Leaves className="mode-leaves-r" />
        </div>
        <div className="mode-grid">
          <div className="mode-card">
            <div className="mode-pic"><PictureView picture={picture} /></div>
            <button type="button" disabled={busy} onClick={() => go('template')} className="mode-btn mode-btn-template" title={t('mode.template.text')} data-testid="mode-template">
              <PaletteIcon />
              <span>{t('mode.template.title')}</span>
            </button>
                      </div>
          <div className="mode-card">
            <div className="mode-pic"><PictureView picture={picture} data={{ fills: {}, strokes: [], stickers: [], glitter: [] }} /></div>
            <button type="button" disabled={busy} onClick={() => go('free')} className="mode-btn mode-btn-free" title={t('mode.free.text')} data-testid="mode-free">
              <CrayonIcon />
              <span>{t('mode.free.title')}</span>
            </button>
                      </div>
        </div>
      </div>
    </div>
  );
}
