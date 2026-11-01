// Tranh sống (Animated Reveal): khi hoàn thành, chủ thể chuyển động nhẹ + pháo giấy.
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from './Modal/Modal';
import Confetti from './Confetti';
import Canvas from './Canvas/Canvas';
import Icon from './Icon';
import { downloadDataUrl, printDataUrl, renderArtwork, safeFileName } from '../lib/exportImage';
import { flyToCollection } from '../lib/flyToCollection';
import { api } from '../services/api';
import { useUi } from '../store/ui';

/** `anotherTo`: trang mở ra khi bé bấm "Tô tranh khác" (VD màn chọn tranh của chủ đề hiện tại). */
export default function RevealModal({ open, picture, data, artworkId, onClose, anotherTo = '/color' }) {
  const { t, i18n } = useTranslation();
  const pushEvents = useUi((s) => s.pushEvents);
  const navigate = useNavigate();
  const artRef = useRef(null);
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

  // Đóng / Tô tranh khác: tranh bay vào Bộ sưu tập; "Tô tranh khác" thì đồng thời mở màn chọn tranh của chủ đề.
  const leave = async (to = null) => {
    if (busy) return;
    setBusy(true);
    let src = null;
    try {
      src = await renderArtwork(picture, data, { size: 480 });
    } catch {
      /* không có ảnh bay thì thôi, vẫn đóng bình thường */
    }
    setBusy(false);
    // Ảnh bay là phần tử gắn ngoài trang nên vẫn bay khi modal đã đóng. "Tô tranh khác" chỉ đổi trang SAU khi tranh bay xong
    // (dựng trang mới trong lúc đang bay làm hiệu ứng bị giật).
    const flight = flyToCollection(artRef.current, src); // đo vị trí tranh trước khi modal đóng
    onClose?.(to ? 'another' : 'close');
    if (to) {
      await flight;
      // Hiệu ứng chuyển màn hình (bản không cúp của Đấu trường); nếu không chạy được (giảm chuyển động…) thì đổi trang luôn.
      const detail = { dest: to, handled: false };
      window.dispatchEvent(new CustomEvent('btm:screen-transition', { detail }));
      if (!detail.handled) navigate(to);
    }
  };

  return (
    <Modal open onClose={() => leave(null)} wide>
      <Confetti count={80} />
      <div className="text-center" data-testid="reveal-modal">
        <h2 className="font-display text-3xl font-extrabold">{t('reveal.title')}</h2>
        <p className="mb-3 text-muted">{t('reveal.subtitle')}</p>
        <div ref={artRef} className="mx-auto max-w-md">
          <Canvas picture={picture} data={data} readOnly reveal />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button type="button" className="btn-primary" onClick={() => exportAs('download')} disabled={busy} data-testid="reveal-download">
            <Icon name="download" /> {t('coloring.download')}
          </button>
          <button type="button" className="btn-ghost" onClick={() => exportAs('print')} disabled={busy}>
            <Icon name="print" /> {t('coloring.print')}
          </button>
          <button type="button" className="btn-ghost" onClick={() => leave(anotherTo)} disabled={busy} data-testid="reveal-another">
            <Icon name="palette" /> {t('reveal.another')}
          </button>
          <button type="button" className="btn-ghost" onClick={() => leave(null)} disabled={busy} data-testid="reveal-close">
            {t('common.close')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
