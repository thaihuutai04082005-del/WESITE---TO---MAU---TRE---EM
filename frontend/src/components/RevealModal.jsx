// Tranh sống (Animated Reveal): khi hoàn thành, chủ thể chuyển động nhẹ + pháo giấy.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal/Modal';
import Confetti from './Confetti';
import Canvas from './Canvas/Canvas';
import Icon from './Icon';
import { downloadDataUrl, printDataUrl, renderArtwork, safeFileName } from '../lib/exportImage';
import { api } from '../services/api';
import { useUi } from '../store/ui';

export default function RevealModal({ open, picture, data, artworkId, onClose, extra = null }) {
  const { t, i18n } = useTranslation();
  const pushEvents = useUi((s) => s.pushEvents);
  const [busy, setBusy] = useState(false);
  if (!open) return null;
  const name = picture.name?.[i18n.language] || '';

  const exportAs = async (kind) => {
    setBusy(true);
    try {
      const url = await renderArtwork(picture, data, { size: 1200 });
      if (kind === 'download') downloadDataUrl(url, `${safeFileName(name)}.png`);
      else printDataUrl(url, name);
      if (artworkId) {
        const r = await api.post(`/artworks/${artworkId}/download`);
        pushEvents(r.events);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} wide>
      <Confetti count={80} />
      <div className="text-center" data-testid="reveal-modal">
        <h2 className="font-display text-3xl font-extrabold">{t('reveal.title')}</h2>
        <p className="mb-3 text-muted">{t('reveal.subtitle')}</p>
        <div className="mx-auto max-w-md">
          <Canvas picture={picture} data={data} readOnly reveal />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button type="button" className="btn-primary" onClick={() => exportAs('download')} disabled={busy} data-testid="reveal-download">
            <Icon name="download" /> {t('coloring.download')}
          </button>
          <button type="button" className="btn-ghost" onClick={() => exportAs('print')} disabled={busy}>
            <Icon name="print" /> {t('coloring.print')}
          </button>
          {extra}
          <button type="button" className="btn-ghost" onClick={onClose}>
            {t('common.close')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
