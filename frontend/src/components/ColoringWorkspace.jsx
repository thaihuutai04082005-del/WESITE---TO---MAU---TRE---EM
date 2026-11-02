// Khu vực tô màu dùng chung cho: tô cá nhân, Đấu trường, tô cùng nhau.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import Canvas from './Canvas/Canvas';
import ToolBar, { SIZES, STICKER_SCALES } from './ToolBar/ToolBar';
import ColorPalette from './ColorPalette/ColorPalette';
import Icon from './Icon';
import PictureView from './PictureView/PictureView';
import Modal from './Modal/Modal';
import SignaturePanel from './SignaturePanel';
import { ensureSignatureFont, placeDefault } from '../lib/signature';
import { isRegionDone } from '../lib/picture';

/** Tranh mẫu (màn rộng): nút phóng to / thu nhỏ ở hàng tiêu đề, phóng ngay trên tranh; phóng rồi thì giữ chuột (bàn tay) kéo qua lại để xem. */
function ReferencePane({ picture, doneIds }) {
  const { t, i18n } = useTranslation();
  const [zoom, setZoom] = useState(1);
  const view = useRef(null);
  const drag = useRef(null);
  const [grabbing, setGrabbing] = useState(false);
  const set = (z) => {
    const el = view.current;
    const next = Math.min(4, Math.max(1, Math.round(z * 4) / 4));
    if (el && next !== zoom) {
      // giữ nguyên điểm đang nhìn ở giữa khung khi phóng / thu
      const cx = (el.scrollLeft + el.clientWidth / 2) / el.scrollWidth;
      const cy = (el.scrollTop + el.clientHeight / 2) / el.scrollHeight;
      setZoom(next);
      requestAnimationFrame(() => {
        el.scrollLeft = cx * el.scrollWidth - el.clientWidth / 2;
        el.scrollTop = cy * el.scrollHeight - el.clientHeight / 2;
      });
    } else setZoom(next);
  };
  const onDown = (e) => {
    if (zoom <= 1) return;
    drag.current = { x: e.clientX, y: e.clientY, sl: view.current.scrollLeft, st: view.current.scrollTop };
    setGrabbing(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    view.current.scrollLeft = d.sl - (e.clientX - d.x);
    view.current.scrollTop = d.st - (e.clientY - d.y);
  };
  const end = () => {
    drag.current = null;
    setGrabbing(false);
  };
  return (
    <>
      <div className="cw-title mb-2 justify-between">
        <span className="flex items-center gap-2.5"><Icon name="palette" size={24} strokeWidth={2.4} /> {t('coloring.reference')}</span>
        <span className="cw-ref-tools">
          <button type="button" onClick={() => set(zoom - 0.5)} disabled={zoom <= 1} aria-label={t('coloring.zoomOut')} title={t('coloring.zoomOut')} data-testid="ref-zoom-out"><Icon name="zoomOut" size={20} strokeWidth={2.6} /></button>
          <button type="button" onClick={() => set(zoom + 0.5)} disabled={zoom >= 4} aria-label={t('coloring.zoomIn')} title={t('coloring.zoomIn')} data-testid="ref-zoom-in"><Icon name="zoomIn" size={20} strokeWidth={2.6} /></button>
        </span>
      </div>
      <div className="cw-ref-box">
        <div
          ref={view}
          className={`cw-ref-view${zoom > 1 ? (grabbing ? ' cw-ref-grabbing' : ' cw-ref-grab') : ''}`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={end}
          onPointerCancel={end}
          data-testid="reference-picture"
        >
          <div style={{ width: `${zoom * 100}%`, aspectRatio: '1' }}>
            <PictureView picture={picture} className="h-full w-full rounded-2xl" title={picture.name?.[i18n.language]} numbers doneIds={doneIds} />
          </div>
        </div>
      </div>
    </>
  );
}

/** Tranh mẫu phóng to: ô vuông lớn nhất vừa màn hình, bấm +/− hoặc cuộn chuột để phóng, kéo để xem chỗ nhỏ (đọc số màu cho rõ). */
function ReferenceViewer({ picture, doneIds, onClose }) {
  const { t, i18n } = useTranslation();
  const [zoom, setZoom] = useState(1);
  const box = useRef(null);
  const drag = useRef(null);
  const set = (z) => setZoom(Math.min(4, Math.max(1, Math.round(z * 10) / 10)));
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const onDown = (e) => {
    if (zoom <= 1) return;
    drag.current = { x: e.clientX, y: e.clientY, sl: box.current.scrollLeft, st: box.current.scrollTop };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    box.current.scrollLeft = d.sl - (e.clientX - d.x);
    box.current.scrollTop = d.st - (e.clientY - d.y);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-3 backdrop-blur-sm" onClick={onClose} data-testid="reference-viewer">
      <div className="flex max-h-full max-w-full flex-col items-center gap-3 rounded-3xl bg-white p-3 shadow-pop" onClick={(e) => e.stopPropagation()}>
        <div className="flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <div className="min-w-0 max-w-full truncate font-display text-lg font-extrabold">{picture.name?.[i18n.language]}</div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button type="button" className="btn-ghost min-h-10 px-3" onClick={() => set(zoom - 0.5)} disabled={zoom <= 1} aria-label="−" data-testid="ref-zoom-out"><Icon name="zoomOut" size={20} /></button>
            <span className="w-12 text-center text-sm font-bold">{Math.round(zoom * 100)}%</span>
            <button type="button" className="btn-ghost min-h-10 px-3" onClick={() => set(zoom + 0.5)} disabled={zoom >= 4} aria-label="+" data-testid="ref-zoom-in"><Icon name="zoomIn" size={20} /></button>
            <button type="button" className="btn-primary min-h-10 px-4" onClick={onClose} data-testid="ref-close">{t('common.close')}</button>
          </div>
        </div>
        <div
          ref={box}
          className={`overflow-auto rounded-2xl border-2 border-line bg-white ${zoom > 1 ? 'cursor-grab touch-none active:cursor-grabbing' : ''}`}
          style={{ width: 'min(92vw, calc(100vh - 110px))', height: 'min(92vw, calc(100vh - 110px))' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
          onWheel={(e) => set(zoom + (e.deltaY < 0 ? 0.25 : -0.25))}
        >
          <div style={{ width: `${zoom * 100}%`, aspectRatio: '1' }}>
            <PictureView picture={picture} className="h-full w-full" numbers doneIds={doneIds} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ColoringWorkspace({
  picture,
  editor,
  mode = 'free',
  brushSkin = null,
  userKey = 'guest',
  onAction,
  onUndo,
  onRedo,
  remoteCursors,
  onCursor,
  header = null,
  actions = null,
  allowClear = true,
  readOnly = false,
  // Chữ ký (chỉ tô cá nhân): undefined = tắt công cụ; null = bé chưa tạo chữ ký.
  signature,
  signatureInks = [],
}) {
  const { t, i18n } = useTranslation();
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('crayon');
  const [color, setColor] = useState(() => picture?.palette?.find((p) => !/^#F[CDEF]F[CDEF]F[CDEF]$/i.test(p.color))?.color || '#FF5F7E'); // màu đầu tiên không phải màu trắng
  const [sizeIdx, setSizeIdx] = useState(0); // mặc định cỡ nét lớn nhất
  const [pattern, setPattern] = useState('rainbow');
  const [ownedPatterns, setOwnedPatterns] = useState([]); // họa tiết đã mua trong Shop
  useEffect(() => {
    api.get('/shop').then((r) => setOwnedPatterns(r.items.filter((i) => i.type === 'pattern' && i.owned).map((i) => i.slug))).catch(() => {});
  }, []);
  const [stickerType, setStickerType] = useState('star');
  const [number, setNumber] = useState(mode === 'template' ? picture?.palette?.find((p) => !/^#F[CDEF]F[CDEF]F[CDEF]$/i.test(p.color))?.number ?? picture?.palette?.[0]?.number ?? null : null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [showRef, setShowRef] = useState(false);
  const template = mode === 'template';
  // Chế độ Theo mẫu: số màu đánh trên tranh mẫu; vùng bé tô đúng màu rồi thì số mờ đi.
  const doneIds = useMemo(() => (template ? new Set((picture?.regions || []).filter((r) => isRegionDone(r, editor.data.fills)).map((r) => r.id)) : null), [template, picture, editor.data.fills]);

  // Mọi thao tác của bé đi qua đây: áp vào trạng thái + báo ra ngoài (tính lượt / đồng bộ / chống gian lận).
  const act = (action) => {
    if (readOnly) return;
    editor.act(action);
    onAction?.(action);
  };

  const signatureOn = signature !== undefined;
  const chooseTool = (next) => {
    setTool(next);
    // Bấm nút Chữ ký: tranh chưa ký thì đặt chữ ký mặc định ở góc dưới bên phải.
    if (next === 'signature' && signature && !editor.data.signature) {
      ensureSignatureFont(signature.style);
      act({ type: 'signature-set', signature: placeDefault(signature, signatureInks[0]) });
    }
  };

  const pickColor = (c) => {
    setColor(c);
    // Chọn màu thì quay về bút sáp (trừ khi đang dùng cọ / sáp hạt — hai kiểu này cũng dùng màu đã chọn).
    if (!['crayon', 'brush', 'glitter'].includes(tool)) setTool('crayon');
    if (template) setNumber(picture.palette.find((p) => p.color.toUpperCase() === c.toUpperCase())?.number ?? null);
  };

  // Bố cục: máy tính (≥ lg) chia 3 cột vừa khít màn hình, không cuộn trang — trái: thông tin + tranh mẫu + nút Lưu/Hoàn thành;
  // giữa: khung tô (vuông, lớn nhất có thể); phải: bộ công cụ + bảng của công cụ đang chọn. Điện thoại / máy tính bảng: xếp dọc.
  return (
    <div className={`cw ${template ? 'cw-template' : 'cw-free'}`}>
      <div className="cw-left">
        <div className="cw-left-in">
          <div className="cw-header">{header}</div>
          {template && (
            <div className="cw-ref card hidden p-3 lg:block">
              <ReferencePane picture={picture} doneIds={doneIds} />
            </div>
          )}
          {actions && <div className="cw-actions">{actions}</div>}
              </div>
      </div>

      <div className="cw-stage">
        <div className="cw-square relative">
          <Canvas
            ref={canvasRef}
            picture={picture}
            data={editor.data}
            tool={tool}
            color={color}
            size={SIZES[sizeIdx]}
            pattern={pattern}
            stickerScale={STICKER_SCALES[sizeIdx]}
            brushSkin={brushSkin}
            stickerType={stickerType}
            showNumbers={false}
            highlightNumber={template ? number : null}
            readOnly={readOnly}
            remoteCursors={remoteCursors}
            onCursor={onCursor}
            onStroke={(stroke, fill) => act({ type: 'stroke', stroke, ...(fill ? { fill } : {}) })}
            onStickerAdd={(sticker) => act({ type: 'sticker-add', sticker })}
            onStickerChange={(index, sticker) => act({ type: 'sticker-update', index, sticker })}
            onStickerRemove={(index) => act({ type: 'sticker-remove', index })}
            onSignatureChange={(sig) => act({ type: 'signature-set', signature: sig })}
          />
          {template && (
            <button type="button" onClick={() => setShowRef(true)} className="absolute right-2 top-2 w-24 overflow-hidden rounded-2xl border-4 border-white shadow-pop lg:hidden" aria-label={t('coloring.reference')}>
              <PictureView picture={picture} numbers doneIds={doneIds} />
            </button>
          )}
        </div>
      </div>

      <aside className="cw-tools">
        <div className="card cw-toolcard p-3">
          <h2 className="cw-title"><Icon name="brush" size={26} strokeWidth={2.4} /> {t('coloring.toolsTitle')}</h2>
          <ToolBar
            tool={tool}
            setTool={chooseTool}
            allowSignature={signatureOn}
            sizeIdx={sizeIdx}
            setSizeIdx={setSizeIdx}
            pattern={pattern}
            setPattern={setPattern}
            ownedPatterns={ownedPatterns}
            stickerType={stickerType}
            setStickerType={setStickerType}
            canUndo={editor.canUndo}
            canRedo={editor.canRedo}
            onUndo={() => (onUndo ? onUndo() : editor.undo())}
            onRedo={() => (onRedo ? onRedo() : editor.redo())}
            onZoomIn={() => canvasRef.current?.zoomIn()}
            onZoomOut={() => canvasRef.current?.zoomOut()}
            onZoomReset={() => canvasRef.current?.resetZoom()}
            onClear={allowClear ? () => setConfirmClear(true) : null}
            colorPanel={
              <div className="border-t-2 border-line pt-3">
                <ColorPalette glitter={tool === 'glitter'} color={color} onChange={pickColor} userKey={userKey} numbered={template ? picture.palette : null} activeNumber={number} onNumber={setNumber} />
              </div>
            }
          />
          {signatureOn && tool === 'signature' && (
            <div className="mt-3 border-t-2 border-line pt-3">
              <SignaturePanel signature={editor.data.signature} hasDefault={!!signature} inks={signatureInks} onChange={(sig) => act({ type: 'signature-set', signature: sig })} />
            </div>
          )}
        </div>
      </aside>

      <Modal open={confirmClear} onClose={() => setConfirmClear(false)}>
        <h2 className="font-display text-2xl font-extrabold">{t('coloring.clearTitle')}</h2>
        <p className="mb-4 text-muted">{t('coloring.clearText')}</p>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost flex-1" onClick={() => setConfirmClear(false)}>{t('common.cancel')}</button>
          <button type="button" className="btn-danger flex-1" data-testid="confirm-clear" onClick={() => { act({ type: 'clear' }); setConfirmClear(false); }}>
            {t('coloring.clearConfirm')}
          </button>
        </div>
      </Modal>
      {showRef && <ReferenceViewer picture={picture} doneIds={doneIds} onClose={() => setShowRef(false)} />}
    </div>
  );
}
