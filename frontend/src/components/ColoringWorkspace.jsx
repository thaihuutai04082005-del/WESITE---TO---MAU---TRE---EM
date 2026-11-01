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
        <div className="cw-header">{header}</div>
        {template && (
          <div className="cw-ref card hidden p-3 lg:block">
            <div className="cw-title mb-2"><Icon name="palette" size={24} strokeWidth={2.4} /> {t('coloring.reference')}</div>
            <button type="button" onClick={() => setShowRef(true)} className="block w-full cursor-zoom-in" aria-label={t('coloring.reference')} data-testid="reference-picture">
              <PictureView picture={picture} className="rounded-2xl" title={picture.name?.[i18n.language]} numbers doneIds={doneIds} />
            </button>
          </div>
        )}
        {actions && <div className="cw-actions">{actions}</div>}
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
      <Modal open={showRef} onClose={() => setShowRef(false)}>
        <PictureView picture={picture} className="rounded-2xl" numbers doneIds={doneIds} />
      </Modal>
    </div>
  );
}
