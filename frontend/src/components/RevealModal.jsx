// Tranh sống (Animated Reveal): khi hoàn thành, chủ thể chuyển động nhẹ + pháo giấy.
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from './Modal/Modal';
import Confetti from './Confetti';
import Canvas from './Canvas/Canvas';
import Icon from './Icon';
import { downloadDataUrl, printDataUrl, renderArtwork, safeFileName } from '../lib/exportImage';
import { artworkFrameSvg } from '../lib/frames';
import { flyToCollection } from '../lib/flyToCollection';
import { warmTheme } from '../lib/prefetch';
import { api } from '../services/api';
import { useUi } from '../store/ui';

/** `anotherTo`: trang mở ra khi bé bấm "Tô tranh khác" (VD màn chọn tranh của chủ đề hiện tại). */
/** Khung Artwork mặc định (miễn phí) cho tranh vừa hoàn thành. */
const DEFAULT_FRAME = 'khung-go';

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
      const url = await renderArtwork(picture, data, { size: 1200, frame: DEFAULT_FRAME });
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
    // "Tô tranh khác": tải + dựng sẵn màn danh sách tranh trong lúc tranh đang bay (tránh giật khi mở trang).
    const slug = to?.startsWith('/color/') ? to.split('/')[2] : null;
    const warm = slug ? warmTheme(slug) : Promise.resolve();
    let src = null;
    try {
      src = await renderArtwork(picture, data, { size: 480, frame: DEFAULT_FRAME });
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
      await Promise.race([warm, new Promise((r) => setTimeout(r, 900))]);
      navigate(to);
    }
  };

  return (
    <Modal open onClose={() => leave(null)} wide>
      <Confetti count={80} />
      <div className="text-center" data-testid="reveal-modal">
        <h2 className="font-display text-3xl font-extrabold">{t('reveal.title')}</h2>
        <p className="mb-3 text-muted">{t('reveal.subtitle')}</p>
        {/* Tranh hoàn thành tự có khung gỗ mặc định (miễn phí); khung khác chọn lại trong Lịch sử / Bộ sưu tập. */}
        <div ref={artRef} className="relative mx-auto aspect-square max-w-md" data-testid="reveal-frame">
          <div className="absolute" style={{ inset: `${(50 / 700) * 100}%` }}>
            <Canvas picture={picture} data={data} readOnly reveal className="!rounded-none !border-0" />
          </div>
          <div className="pointer-events-none absolute inset-0" dangerouslySetInnerHTML={{ __html: (artworkFrameSvg(DEFAULT_FRAME) || '').replace('width="700" height="700"', 'width="100%" height="100%"') }} />
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
