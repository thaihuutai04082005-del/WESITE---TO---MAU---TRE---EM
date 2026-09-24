// Thanh công cụ (Mục 4.2–4.5): đổ màu, cọ vẽ, tẩy, sticker, lấp lánh, di chuyển, độ dày nét, undo/redo, zoom, xoá hết.
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import { STICKERS } from '../../lib/stickers';

function ToolBtn({ icon, label, active, onClick, disabled, testId }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      data-testid={testId}
      className={`flex min-h-12 min-w-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 text-xs font-bold transition disabled:opacity-40 ${active ? 'bg-primary text-white shadow-soft' : 'bg-primary-light text-primary-dark hover:bg-primary/20'}`}
    >
      <Icon name={icon} size={22} />
      <span className="hidden leading-none sm:block">{label}</span>
    </button>
  );
}

export default function ToolBar({
  tool, setTool, size, setSize, glitter, setGlitter, stickerType, setStickerType,
  canUndo, canRedo, onUndo, onRedo, onZoomIn, onZoomOut, onZoomReset, onClear, allowStickers = true, allowGlitter = true,
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3" data-testid="toolbar">
      <div className="flex flex-wrap gap-2">
        <ToolBtn icon="bucket" label={t('tools.fill')} active={tool === 'fill'} onClick={() => setTool('fill')} testId="tool-fill" />
        <ToolBtn icon="brush" label={t('tools.brush')} active={tool === 'brush'} onClick={() => setTool('brush')} testId="tool-brush" />
        <ToolBtn icon="eraser" label={t('tools.eraser')} active={tool === 'eraser'} onClick={() => setTool('eraser')} testId="tool-eraser" />
        {allowStickers && <ToolBtn icon="sticker" label={t('tools.sticker')} active={tool === 'sticker'} onClick={() => setTool('sticker')} testId="tool-sticker" />}
        <ToolBtn icon="hand" label={t('tools.pan')} active={tool === 'pan'} onClick={() => setTool('pan')} testId="tool-pan" />
        {allowGlitter && <ToolBtn icon="sparkle" label={t('tools.glitter')} active={glitter} onClick={() => setGlitter(!glitter)} testId="tool-glitter" />}
      </div>
      <div className="flex flex-wrap gap-2">
        <ToolBtn icon="undo" label={t('tools.undo')} onClick={onUndo} disabled={!canUndo} testId="tool-undo" />
        <ToolBtn icon="redo" label={t('tools.redo')} onClick={onRedo} disabled={!canRedo} testId="tool-redo" />
        <ToolBtn icon="zoomIn" label={t('tools.zoomIn')} onClick={onZoomIn} />
        <ToolBtn icon="zoomOut" label={t('tools.zoomOut')} onClick={onZoomOut} />
        <ToolBtn icon="expand" label={t('tools.zoomReset')} onClick={onZoomReset} />
        {onClear && <ToolBtn icon="trash" label={t('tools.clear')} onClick={onClear} testId="tool-clear" />}
      </div>
      {(tool === 'brush' || tool === 'eraser') && (
        <label className="flex items-center gap-3 font-bold">
          <span className="whitespace-nowrap text-sm">{t('tools.size')}</span>
          <input type="range" min="2" max="60" value={size} onChange={(e) => setSize(Number(e.target.value))} className="h-11 w-full accent-primary" aria-label={t('tools.size')} />
          <span className="inline-block shrink-0 rounded-full bg-ink" style={{ width: Math.max(4, size / 1.5), height: Math.max(4, size / 1.5) }} />
        </label>
      )}
      {tool === 'sticker' && (
        <div>
          <div className="mb-1 text-sm font-bold text-muted">{t('tools.pickSticker')}</div>
          <div className="flex flex-wrap gap-2">
            {STICKERS.map((s) => (
              <button
                key={s.type}
                type="button"
                onClick={() => setStickerType(s.type)}
                className={`h-12 w-12 rounded-2xl border-2 p-1 ${stickerType === s.type ? 'border-primary bg-primary-light' : 'border-line bg-white'}`}
                aria-label={s.type}
              >
                <svg viewBox="0 0 100 100" dangerouslySetInnerHTML={{ __html: s.svg }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
