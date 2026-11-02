// Tranh sống (Animated Reveal): khi hoàn thành, chủ thể chuyển động nhẹ + pháo giấy.
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from './Modal/Modal';
import Confetti from './Confetti';
import Canvas from './Canvas/Canvas';
import Icon from './Icon';
import FrameSelector from './FrameSelector/FrameSelector';
import { downloadDataUrl, printDataUrl, renderArtwork, safeFileName } from '../lib/exportImage';
import { artworkFrameSvg } from '../lib/frames';
import { flyToCollection } from '../lib/flyToCollection';
import { warmTheme } from '../lib/prefetch';
import { api } from '../services/api';
import { errorText } from '../lib/format';
import { useUi } from '../store/ui';

/** `anotherTo`: trang mở ra khi bé bấm "Tô tranh khác" (VD màn chọn tranh của chủ đề hiện tại). */
/** Khung Artwork mặc định (miễn phí) cho tranh vừa hoàn thành. */
const DEFAULT_FRAME = 'khung-go';

export default function RevealModal({ open, picture, data, artworkId, onClose, anotherTo = '/color' }) {
  const { t, i18n } = useTranslation();
  const pushEvents = useUi((s) => s.pushEvents);
  const navigate = useNavigate();
  const artRef = useRef(null);
  const toast = useUi((s) => s.toast);
  const [busy, setBusy] = useState(false);
  const [frames, setFrames] = useState([]);
  const [frame, setFrame] = useState(DEFAULT_FRAME); // null = bé chọn "Không khung"
  // Bé chọn khung ngay khi vừa hoàn thành (khung đã mua + khung gỗ miễn phí); khung được lưu vào tranh.
  useEffect(() => {
    if (!open) return;
    setFrame(DEFAULT_FRAME);
    api.get('/shop').then((r) => setFrames(r.items.filter((i) => i.type === 'artwork_frame'))).catch(() => {});
  }, [open]);
  if (!open) return null;
  const name = picture.name?.[i18n.language] || '';

  const pickFrame = async (f) => {
    setFrame(f);
    if (!artworkId) return;
    try {
      await api.put(`/artworks/${artworkId}/frame`, { frame: f });
    } catch (e) {
      toast(errorText(t, e), 'error');
    }
  };

  const exportAs = async (kind) => {
    setBusy(true);
    try {
      const url = await renderArtwork(picture, data, { size: 1200, frame });
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
      src = await renderArtwork(picture, data, { size: 480, frame });
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
    <Modal closeButton={false} open onClose={() => leave(null)} wide>
      <Confetti count={80} />
      <div className="text-center" data-testid="reveal-modal">
        <h2 className="flex items-center justify-center gap-2 font-display text-3xl font-extrabold text-[#22A55B]" data-testid="reveal-title">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#22A55B] text-white" aria-hidden="true"><Icon name="check" size={22} strokeWidth={3.6} /></span>
          {t('coloring.complete')}
        </h2>
        <p className="mb-3 text-muted">{t('reveal.subtitle')}</p>
        {/* Tranh hoàn thành tự có khung gỗ mặc định (miễn phí); bé chọn khung khác ở danh sách bên phải (khung mua ở Shop). */}
        <div className="sm:grid sm:grid-cols-[minmax(0,1fr)_228px] sm:items-stretch sm:gap-4">
          <div ref={artRef} className="reveal-art relative mx-auto aspect-square" data-testid="reveal-frame">
            <div className="absolute" style={{ inset: frame ? `${(50 / 700) * 100}%` : 0 }}>
              <Canvas picture={picture} data={data} readOnly reveal className="!rounded-none !border-0" />
            </div>
            {frame && <div className="pointer-events-none absolute inset-0" dangerouslySetInnerHTML={{ __html: (artworkFrameSvg(frame) || '').replace('width="700" height="700"', 'width="100%" height="100%"') }} />}
          </div>
          <div className="mt-3 flex min-h-0 flex-col text-left sm:mt-0" data-testid="reveal-frames">
            <div className="label text-center">{t('history.frame')}</div>
            {/* Điện thoại: hàng ngang cuộn ngang. Màn rộng: cột dọc bên phải tranh, có thanh cuộn riêng (cửa sổ không cuộn). */}
            <div className="relative min-h-0 flex-1">
              <div className="reveal-frame-list overflow-x-auto pb-2 sm:absolute sm:inset-0 sm:overflow-x-hidden sm:overflow-y-auto sm:pb-0 sm:pr-1 [&>div]:flex-nowrap [&>div]:justify-start sm:[&>div]:grid sm:[&>div]:grid-cols-2 sm:[&>div]:justify-items-center sm:[&>div]:gap-2">
                <FrameSelector type="artwork" items={frames} value={frame} onChange={pickFrame} />
              </div>
            </div>
            {frames.length > 0 && frames.filter((f) => f.owned).length <= 1 && (
              <Link to="/shop" className="mt-1 inline-block text-sm font-bold text-primary">
                {t('history.buyFrames')}
              </Link>
            )}
          </div>
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
