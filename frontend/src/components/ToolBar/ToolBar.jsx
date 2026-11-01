// Bộ công cụ tô tay (Mục 4.2–4.5): 5 kiểu tô (bút sáp, cọ, sáp hạt, họa tiết, sticker) + 5 cỡ nét, tẩy, hoàn tác/làm lại,
// di chuyển, chữ ký, phóng to/thu nhỏ, xoá hết. Không còn xô đổ màu: bé quẹt tô trong vùng, nét bị khóa trong vùng chạm đầu tiên.
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import { STICKERS } from '../../lib/stickers';
import { PATTERNS, patternSwatchUrl } from '../../lib/brush';
import { BrushIcon, CrayonIcon, GlitterIcon, PatternIcon, StickerIcon } from './ToolIcons';

export const SIZES = [34, 24, 16, 10, 6]; // 5 cỡ nét, từ to đến nhỏ (đơn vị tranh)
export const STICKER_SCALES = [1.7, 1.35, 1, 0.72, 0.5]; // sticker dùng chung 5 cỡ nét: to → nhỏ

const ROUND = [
  ['crayon', CrayonIcon],
  ['brush', BrushIcon],
  ['glitter', GlitterIcon],
  ['pattern', PatternIcon],
  ['sticker', StickerIcon],
];

function KeyBtn({ icon, label, onClick, active, disabled, tone = 'blue', testId }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      data-testid={testId}
      className={`tb-key tb-key-${tone} ${active ? 'tb-key-on' : ''}`}
    >
      <Icon name={icon} size={24} />
    </button>
  );
}

export default function ToolBar({
  tool, setTool, sizeIdx, setSizeIdx, pattern, setPattern, stickerType, setStickerType,
  canUndo, canRedo, onUndo, onRedo, onZoomIn, onZoomOut, onZoomReset, onClear, allowStickers = true, allowSignature = false, colorPanel = null,
}) {
  const { t } = useTranslation();
  const swatches = useMemo(() => Object.fromEntries(PATTERNS.map((p) => [p.id, patternSwatchUrl(p.id, 56)])), []);
  const painting = ['crayon', 'brush', 'glitter', 'pattern', 'eraser', 'sticker'].includes(tool);
  return (
    <div className="space-y-3" data-testid="toolbar">
      <div className="flex items-center gap-2">
        <KeyBtn icon="eraser" label={t('tools.eraser')} active={tool === 'eraser'} onClick={() => setTool('eraser')} testId="tool-eraser" />
        <KeyBtn icon="undo" label={t('tools.undo')} onClick={onUndo} disabled={!canUndo} tone="orange" testId="tool-undo" />
        <KeyBtn icon="redo" label={t('tools.redo')} onClick={onRedo} disabled={!canRedo} tone="orange" testId="tool-redo" />
        <span className="flex-1" />
        {onClear && <KeyBtn icon="trash" label={t('tools.clear')} onClick={onClear} tone="gray" testId="tool-clear" />}
      </div>

      <div className="tb-board">
        <div className="tb-sizes" role="radiogroup" aria-label={t('tools.size')}>
          {SIZES.map((sz, i) => (
            <button key={sz} type="button" role="radio" aria-checked={sizeIdx === i} aria-label={`${t('tools.size')} ${i + 1}`} onClick={() => setSizeIdx(i)} className={`tb-dotbtn ${sizeIdx === i ? 'tb-dotbtn-on' : ''} ${painting ? '' : 'opacity-60'}`} data-testid={`size-${i}`}>
              <span className="tb-dot" style={{ width: 10 + (SIZES.length - 1 - i) * 4.5, height: 10 + (SIZES.length - 1 - i) * 4.5 }} />
            </button>
          ))}
        </div>
        <div className="tb-round">
          {ROUND.filter(([id]) => allowStickers || id !== 'sticker').map(([id, Ico]) => (
            <button key={id} type="button" onClick={() => setTool(id)} title={t(`tools.${id}`)} aria-label={t(`tools.${id}`)} aria-pressed={tool === id} data-testid={`tool-${id}`} className={`tb-bubble ${tool === id ? 'tb-bubble-on' : ''}`}>
              <Ico />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <SmallBtn icon="hand" label={t('tools.pan')} active={tool === 'pan'} onClick={() => setTool('pan')} testId="tool-pan" />
        {allowSignature && <SmallBtn icon="signature" label={t('tools.signature')} active={tool === 'signature'} onClick={() => setTool('signature')} testId="tool-signature" />}
        <SmallBtn icon="zoomIn" label={t('tools.zoomIn')} onClick={onZoomIn} />
        <SmallBtn icon="zoomOut" label={t('tools.zoomOut')} onClick={onZoomOut} />
        <SmallBtn icon="expand" label={t('tools.zoomReset')} onClick={onZoomReset} />
      </div>

      {/* Bảng riêng của công cụ đang chọn: bút sáp / cọ / sáp hạt → hộp màu; họa tiết → họa tiết; sticker → sticker + cỡ. */}
      {['crayon', 'brush', 'glitter'].includes(tool) && colorPanel}
      {tool === 'pattern' && (
        <div>
          <div className="mb-1 text-sm font-bold text-muted">{t('tools.pickPattern')}</div>
          <div className="flex flex-wrap gap-2">
            {PATTERNS.map((p) => (
              <button key={p.id} type="button" onClick={() => setPattern(p.id)} aria-label={p.id} aria-pressed={pattern === p.id} className={`tb-chip ${pattern === p.id ? 'tb-chip-on' : ''}`} data-testid={`pattern-${p.id}`}>
                <img src={swatches[p.id]} alt="" className="h-full w-full rounded-lg" draggable={false} />
              </button>
            ))}
          </div>
        </div>
      )}
      {tool === 'sticker' && (
        <div className="space-y-2">
          <div>
            <div className="mb-1 text-sm font-bold text-muted">{t('tools.pickSticker')}</div>
            <div className="flex flex-wrap gap-2">
              {STICKERS.map((s) => (
                <button key={s.type} type="button" onClick={() => setStickerType(s.type)} aria-label={s.type} aria-pressed={stickerType === s.type} className={`tb-chip ${stickerType === s.type ? 'tb-chip-on' : ''}`} data-testid={`sticker-${s.type}`}>
                  <svg viewBox="0 0 100 100" className="h-full w-full" dangerouslySetInnerHTML={{ __html: s.svg }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function SmallBtn({ icon, label, active, onClick, testId }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} aria-pressed={active} data-testid={testId} className={`flex min-h-11 min-w-11 items-center justify-center rounded-2xl px-2 transition ${active ? 'bg-primary text-white shadow-soft' : 'bg-primary-light text-primary-dark hover:bg-primary/20'}`}>
      <Icon name={icon} size={22} />
    </button>
  );
}
