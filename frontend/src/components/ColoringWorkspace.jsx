// Khu vực tô màu dùng chung cho: tô cá nhân, Đấu trường, tô cùng nhau.
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Canvas from './Canvas/Canvas';
import ToolBar, { SIZES, STICKER_SCALES } from './ToolBar/ToolBar';
import ColorPalette from './ColorPalette/ColorPalette';
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
  const [sizeIdx, setSizeIdx] = useState(2);
  const [pattern, setPattern] = useState('rainbow');
  const [stickerType, setStickerType] = useState('star');
  const [stickerSizeIdx, setStickerSizeIdx] = useState(1);
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

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0">
        {header}
        <div className="relative mx-auto max-w-[min(100%,calc(100vh-180px))]">
          <Canvas
            ref={canvasRef}
            picture={picture}
            data={editor.data}
            tool={tool}
            color={color}
            size={SIZES[sizeIdx]}
            pattern={pattern}
            stickerScale={STICKER_SCALES[stickerSizeIdx]}
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
        {actions && <div className="mt-3 flex flex-wrap justify-center gap-2">{actions}</div>}
      </div>

      <aside className="space-y-4">
        {template && (
          <div className="card hidden p-3 lg:block">
            <div className="mb-2 font-bold">{t('coloring.reference')}</div>
            <button type="button" onClick={() => setShowRef(true)} className="block w-full cursor-zoom-in" aria-label={t('coloring.reference')} data-testid="reference-picture">
              <PictureView picture={picture} className="rounded-2xl" title={picture.name?.[i18n.language]} numbers doneIds={doneIds} />
            </button>
          </div>
        )}
        <div className="card p-3">
          <ToolBar
            tool={tool}
            setTool={chooseTool}
            allowSignature={signatureOn}
            sizeIdx={sizeIdx}
            setSizeIdx={setSizeIdx}
            pattern={pattern}
            setPattern={setPattern}
            stickerType={stickerType}
            setStickerType={setStickerType}
            stickerSizeIdx={stickerSizeIdx}
            setStickerSizeIdx={setStickerSizeIdx}
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
                <ColorPalette color={color} onChange={pickColor} userKey={userKey} numbered={template ? picture.palette : null} activeNumber={number} onNumber={setNumber} />
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
