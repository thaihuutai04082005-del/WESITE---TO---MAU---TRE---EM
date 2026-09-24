// Chọn 1 trong 2 chế độ tô (Mục 3): Tô theo mẫu / Sáng tạo.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from './Modal/Modal';
import PictureView from './PictureView/PictureView';
import { createArtwork } from '../lib/actions';
import { errorText } from '../lib/format';
import { useUi } from '../store/ui';

export default function ModePicker({ picture, onClose }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toast = useUi((s) => s.toast);
  const [busy, setBusy] = useState(false);
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
  return (
    <Modal open onClose={onClose} wide>
      <h2 className="mb-1 font-display text-2xl font-extrabold">{picture.name[i18n.language]}</h2>
      <p className="mb-4 text-muted">{t('mode.pick')}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" disabled={busy} onClick={() => go('template')} className="card p-3 text-left transition hover:shadow-pop" data-testid="mode-template">
          <div className="relative">
            <PictureView picture={picture} className="rounded-2xl" />
            <span className="chip absolute left-2 top-2">1 2 3</span>
          </div>
          <div className="mt-2 font-display text-xl font-bold">{t('mode.template.title')}</div>
          <div className="text-sm text-muted">{t('mode.template.text')}</div>
        </button>
        <button type="button" disabled={busy} onClick={() => go('free')} className="card p-3 text-left transition hover:shadow-pop" data-testid="mode-free">
          <PictureView picture={picture} data={{ fills: {}, strokes: [], stickers: [], glitter: [] }} className="rounded-2xl border border-line" />
          <div className="mt-2 font-display text-xl font-bold">{t('mode.free.title')}</div>
          <div className="text-sm text-muted">{t('mode.free.text')}</div>
        </button>
      </div>
    </Modal>
  );
}
