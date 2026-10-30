// Chọn 1 trong 2 chế độ tô (Mục 3): Tô theo mẫu / Sáng tạo.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PictureView from './PictureView/PictureView';
import { createArtwork } from '../lib/actions';
import { errorText } from '../lib/format';
import { useUi } from '../store/ui';

function Star({ className, style }) {
  return (
    <svg viewBox="-24 -24 48 48" className={`mode-star ${className || ''}`} style={style} aria-hidden="true">
      <path d="M0 -20 L6 -6.5 L20 -5.5 L9.5 4 L12.5 18 L0 10.5 L-12.5 18 L-9.5 4 L-20 -5.5 L-6 -6.5 Z" fill="#FFD84D" stroke="#F3A90A" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

/** Bảng màu cầm tay (biểu tượng nút "Tô theo mẫu"). */
function PaletteIcon() {
  return (
    <svg viewBox="0 0 64 64" className="mode-btn-icon" aria-hidden="true">
      <path d="M32 6 C14 6 4 18 4 32 C4 48 16 58 30 58 C38 58 40 52 36 48 C32 44 36 38 42 38 L50 38 C58 38 62 32 60 26 C57 14 46 6 32 6 Z" fill="#FFF4DA" stroke="#5A3A22" strokeWidth="3.4" strokeLinejoin="round" />
      <circle cx="22" cy="40" r="5" fill="#fff" stroke="#5A3A22" strokeWidth="2.6" />
      <circle cx="18" cy="26" r="5.2" fill="#35C759" stroke="#5A3A22" strokeWidth="2" />
      <circle cx="29" cy="17" r="5.2" fill="#2F86E8" stroke="#5A3A22" strokeWidth="2" />
      <circle cx="42" cy="17" r="5.2" fill="#F0504F" stroke="#5A3A22" strokeWidth="2" />
      <circle cx="51" cy="27" r="5.2" fill="#FFC93C" stroke="#5A3A22" strokeWidth="2" />
      <circle cx="36" cy="29" r="4.6" fill="#FF9A3C" stroke="#5A3A22" strokeWidth="2" />
    </svg>
  );
}

/** Bút sáp đỏ (biểu tượng nút "Sáng tạo"). */
function CrayonIcon() {
  return (
    <svg viewBox="0 0 64 64" className="mode-btn-icon" aria-hidden="true">
      <g transform="rotate(38 32 32)">
        <path d="M24 12 L40 12 L40 54 Q40 58 36 58 L28 58 Q24 58 24 54 Z" fill="#F0453F" stroke="#9E1F1B" strokeWidth="3" strokeLinejoin="round" />
        <path d="M24 22 H40 M24 46 H40" stroke="#FFD2CF" strokeWidth="3" />
        <path d="M26 12 L32 2 L38 12 Z" fill="#F86B64" stroke="#9E1F1B" strokeWidth="3" strokeLinejoin="round" />
        <path d="M28 28 V40" stroke="#FFB4AF" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Cây cọ trang trí ở góc tiêu đề. */
function BrushDeco() {
  return (
    <svg viewBox="0 0 90 70" className="mode-brush" aria-hidden="true">
      <g transform="rotate(-38 45 38)">
        <rect x="8" y="30" width="34" height="14" rx="7" fill="#2F86E8" stroke="#1B5FBF" strokeWidth="3" />
        <rect x="36" y="28" width="12" height="18" rx="3" fill="#F4F6FA" stroke="#9AA6B8" strokeWidth="2.6" />
        <path d="M48 29 C60 22 76 26 84 37 C76 50 60 54 48 45 Z" fill="#FFC93C" stroke="#D9951A" strokeWidth="3" strokeLinejoin="round" />
      </g>
      <path d="M62 8 L58 18 M72 14 L66 22 M80 24 L72 28" stroke="#FFC93C" strokeWidth="3.4" strokeLinecap="round" />
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
        <div className="mode-cloud mode-cloud-a" aria-hidden="true" />
        <div className="mode-cloud mode-cloud-b" aria-hidden="true" />
        <button type="button" className="mode-close" onClick={() => onClose?.()} aria-label={t('common.close', { defaultValue: 'Đóng' })} data-testid="mode-close">
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M6 6 L18 18 M18 6 L6 18" stroke="#2F86E8" strokeWidth="4.4" strokeLinecap="round" /></svg>
        </button>
        <div className="mode-title-wrap">
          <Star className="mode-star-a" />
          <Star className="mode-star-b" />
          <h2 className="mode-title" data-testid="mode-title">{name}</h2>
          <BrushDeco />
        </div>
        <p className="mode-sub">{t('mode.pick')}</p>
        <div className="mode-grid">
          <div className="mode-card">
            <div className="mode-pic"><PictureView picture={picture} /></div>
            <button type="button" disabled={busy} onClick={() => go('template')} className="mode-btn mode-btn-template" data-testid="mode-template">
              <PaletteIcon />
              <span>{t('mode.template.title')}</span>
            </button>
            <p className="mode-text">{t('mode.template.text')}</p>
          </div>
          <div className="mode-card">
            <div className="mode-pic"><PictureView picture={picture} data={{ fills: {}, strokes: [], stickers: [], glitter: [] }} /></div>
            <button type="button" disabled={busy} onClick={() => go('free')} className="mode-btn mode-btn-free" data-testid="mode-free">
              <CrayonIcon />
              <span>{t('mode.free.title')}</span>
            </button>
            <p className="mode-text">{t('mode.free.text')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
