// Khu vực tô màu dùng chung cho: tô cá nhân, Đấu trường, tô cùng nhau.
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Canvas from './Canvas/Canvas';
import ToolBar from './ToolBar/ToolBar';
import ColorPalette from './ColorPalette/ColorPalette';
import PictureView from './PictureView/PictureView';
import Modal from './Modal/Modal';

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
}) {
  const { t, i18n } = useTranslation();
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('fill');
  const [color, setColor] = useState(picture?.palette?.[0]?.color || '#FF5F7E');
  const [size, setSize] = useState(12);
  const [glitter, setGlitter] = useState(false);
  const [stickerType, setStickerType] = useState('star');
  const [number, setNumber] = useState(mode === 'template' ? picture?.palette?.[0]?.number ?? null : null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [showRef, setShowRef] = useState(false);
  const template = mode === 'template';

  // Mọi thao tác của bé đi qua đây: áp vào trạng thái + báo ra ngoài (tính lượt / đồng bộ / chống gian lận).
  const act = (action) => {
    if (readOnly) return;
    editor.act(action);
    onAction?.(action);
  };

  const pickColor = (c) => {
    setColor(c);
    if (tool !== 'brush' && tool !== 'fill') setTool('fill');
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
            size={size}
            brushSkin={brushSkin}
            stickerType={stickerType}
            showNumbers={template}
            highlightNumber={template ? number : null}
            readOnly={readOnly}
            remoteCursors={remoteCursors}
            onCursor={onCursor}
            onFill={(regionId) => act({ type: 'fill', regionId, color, glitter })}
            onStroke={(stroke) => act({ type: 'stroke', stroke })}
            onStickerAdd={(sticker) => act({ type: 'sticker-add', sticker })}
            onStickerChange={(index, sticker) => act({ type: 'sticker-update', index, sticker })}
            onStickerRemove={(index) => act({ type: 'sticker-remove', index })}
          />
          {template && (
            <button type="button" onClick={() => setShowRef(true)} className="absolute right-2 top-2 w-24 overflow-hidden rounded-2xl border-4 border-white shadow-pop lg:hidden" aria-label={t('coloring.reference')}>
              <PictureView picture={picture} />
            </button>
          )}
        </div>
        {actions && <div className="mt-3 flex flex-wrap justify-center gap-2">{actions}</div>}
      </div>

      <aside className="space-y-4">
        {template && (
          <div className="card hidden p-3 lg:block">
            <div className="mb-2 font-bold">{t('coloring.reference')}</div>
            <PictureView picture={picture} className="rounded-2xl" title={picture.name?.[i18n.language]} />
          </div>
        )}
        <div className="card p-3">
          <ToolBar
            tool={tool}
            setTool={setTool}
            size={size}
            setSize={setSize}
            glitter={glitter}
            setGlitter={setGlitter}
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
          />
        </div>
        <div className="card p-3">
          <ColorPalette color={color} onChange={pickColor} userKey={userKey} numbered={template ? picture.palette : null} activeNumber={number} onNumber={setNumber} />
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
        <PictureView picture={picture} className="rounded-2xl" />
      </Modal>
    </div>
  );
}
