// Khung tô màu: lớp vùng SVG (Bucket fill) + lớp <canvas> Brush tự do + lớp sticker.
// Hỗ trợ zoom (nút, lăn chuột, chụm/mở 2 ngón), kéo di chuyển khi phóng to.
import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { applyToSvg, isRegionDone } from '../../lib/picture';
import { drawStroke, drawStrokes } from '../../lib/brush';
import { stickerSvg } from '../../lib/stickers';

const RES = 2; // độ phân giải canvas Brush: 2 px / đơn vị tranh
const MIN_Z = 1;
const MAX_Z = 6;

const Canvas = forwardRef(function Canvas(
  {
    picture,
    data,
    tool = 'fill',
    color = '#FF5F7E',
    size = 12,
    brushSkin = null,
    stickerType = 'star',
    showNumbers = false,
    highlightNumber = null,
    readOnly = false,
    reveal = false,
    remoteCursors = [],
    onFill,
    onStroke,
    onStickerAdd,
    onStickerChange,
    onStickerRemove,
    onCursor,
    className = '',
  },
  ref,
) {
  const viewportRef = useRef(null);
  const svgHostRef = useRef(null);
  const canvasRef = useRef(null);
  const [view, setView] = useState({ z: 1, x: 0, y: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const liveStroke = useRef(null);
  const [selected, setSelected] = useState(null);
  const [dragSticker, setDragSticker] = useState(null);

  // ----- Lớp SVG: nạp 1 lần mỗi tranh, sau đó chỉ cập nhật thuộc tính fill -----
  useLayoutEffect(() => {
    if (svgHostRef.current) svgHostRef.current.innerHTML = picture?.svg || '';
  }, [picture?.svg]);

  useLayoutEffect(() => {
    const svg = svgHostRef.current?.querySelector('svg');
    if (!svg) return;
    applyToSvg(svg, data.fills, data.glitter);
    svg.querySelectorAll('.region.hint').forEach((el) => el.classList.remove('hint'));
    if (highlightNumber != null && picture?.regions) {
      for (const r of picture.regions) {
        if (r.number === highlightNumber && !isRegionDone(r, data.fills)) svg.querySelector(`[data-region="${CSS.escape(r.id)}"]`)?.classList.add('hint');
      }
    }
  }, [data.fills, data.glitter, picture, highlightNumber]);

  // ----- Lớp Brush -----
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    drawStrokes(c.getContext('2d'), data.strokes, RES);
  }, [data.strokes]);

  // ----- Chuyển toạ độ màn hình → toạ độ tranh (600×600) -----
  const toLocal = useCallback((clientX, clientY) => {
    const rect = svgHostRef.current.getBoundingClientRect();
    return [((clientX - rect.left) / rect.width) * 600, ((clientY - rect.top) / rect.height) * 600];
  }, []);

  const clampView = useCallback((v) => {
    const w = viewportRef.current?.clientWidth || 1;
    const z = Math.min(MAX_Z, Math.max(MIN_Z, v.z));
    const minX = w - w * z;
    return { z, x: Math.min(0, Math.max(minX, v.x)), y: Math.min(0, Math.max(minX, v.y)) };
  }, []);

  const zoomAt = useCallback(
    (factor, cx, cy) => {
      setView((v) => {
        const rect = viewportRef.current.getBoundingClientRect();
        const px = cx ?? rect.left + rect.width / 2;
        const py = cy ?? rect.top + rect.height / 2;
        const z = Math.min(MAX_Z, Math.max(MIN_Z, v.z * factor));
        const k = z / v.z;
        return clampView({ z, x: px - rect.left - (px - rect.left - v.x) * k, y: py - rect.top - (py - rect.top - v.y) * k });
      });
    },
    [clampView],
  );

  useImperativeHandle(ref, () => ({
    zoomIn: () => zoomAt(1.4),
    zoomOut: () => zoomAt(1 / 1.4),
    resetZoom: () => setView({ z: 1, x: 0, y: 0 }),
    zoom: () => viewRef.current.z,
  }));

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (readOnly) return;
      e.preventDefault();
      zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt, readOnly]);

  // ----- Xử lý chạm / chuột -----
  function regionAtPoint(clientX, clientY) {
    for (const el of document.elementsFromPoint(clientX, clientY)) {
      const id = el.getAttribute?.('data-region');
      if (id && svgHostRef.current.contains(el)) return id;
    }
    return null;
  }

  function stickerAtPoint(x, y) {
    for (let i = data.stickers.length - 1; i >= 0; i--) {
      const s = data.stickers[i];
      if (Math.hypot(s.x - x, s.y - y) <= 50 * (s.scale || 1)) return i;
    }
    return -1;
  }

  function onPointerDown(e) {
    if (readOnly) return;
    viewportRef.current.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      // Chụm/mở 2 ngón: huỷ nét đang vẽ, chuyển sang zoom + kéo.
      liveStroke.current = null;
      drawStrokes(canvasRef.current.getContext('2d'), data.strokes, RES);
      const [a, b] = [...pointers.current.values()];
      gesture.current = { type: 'pinch', dist: Math.hypot(a.x - b.x, a.y - b.y), mid: [(a.x + b.x) / 2, (a.y + b.y) / 2], view: viewRef.current };
      return;
    }
    const [lx, ly] = toLocal(e.clientX, e.clientY);
    if (tool === 'pan' || e.button === 1) {
      gesture.current = { type: 'pan', start: [e.clientX, e.clientY], view: viewRef.current };
    } else if (tool === 'brush' || tool === 'eraser') {
      liveStroke.current = { tool: tool === 'eraser' ? 'eraser' : 'brush', color, size, points: [[lx, ly]], ...(tool === 'brush' && brushSkin ? { skin: brushSkin } : {}) };
      gesture.current = { type: 'stroke' };
      drawStroke(canvasRef.current.getContext('2d'), liveStroke.current, RES);
    } else if (tool === 'sticker') {
      const idx = stickerAtPoint(lx, ly);
      if (idx >= 0) {
        setSelected(idx);
        const s = data.stickers[idx];
        gesture.current = { type: 'sticker', index: idx, offset: [lx - s.x, ly - s.y], moved: false };
        setDragSticker({ index: idx, x: s.x, y: s.y });
      } else {
        gesture.current = { type: 'sticker-new', at: [lx, ly] };
      }
    } else {
      gesture.current = { type: 'tap', start: [e.clientX, e.clientY] };
    }
    onCursor?.(lx, ly);
  }

  function onPointerMove(e) {
    if (readOnly) return;
    const [lx, ly] = toLocal(e.clientX, e.clientY);
    onCursor?.(lx, ly);
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    if (g.type === 'pinch' && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = [(a.x + b.x) / 2, (a.y + b.y) / 2];
      const rect = viewportRef.current.getBoundingClientRect();
      const z = Math.min(MAX_Z, Math.max(MIN_Z, g.view.z * (dist / g.dist)));
      const k = z / g.view.z;
      const ox = g.mid[0] - rect.left;
      const oy = g.mid[1] - rect.top;
      setView(clampView({ z, x: ox - (ox - g.view.x) * k + (mid[0] - g.mid[0]), y: oy - (oy - g.view.y) * k + (mid[1] - g.mid[1]) }));
    } else if (g.type === 'pan') {
      setView(clampView({ ...g.view, x: g.view.x + e.clientX - g.start[0], y: g.view.y + e.clientY - g.start[1] }));
    } else if (g.type === 'stroke' && liveStroke.current) {
      const pts = liveStroke.current.points;
      const last = pts[pts.length - 1];
      if (Math.hypot(last[0] - lx, last[1] - ly) < 1.2) return;
      pts.push([Math.round(lx * 10) / 10, Math.round(ly * 10) / 10]);
      const ctx = canvasRef.current.getContext('2d');
      if (liveStroke.current.tool === 'eraser' || liveStroke.current.skin) {
        drawStrokes(ctx, data.strokes, RES);
        drawStroke(ctx, liveStroke.current, RES);
      } else {
        drawStroke(ctx, { ...liveStroke.current, points: pts.slice(-3) }, RES);
      }
    } else if (g.type === 'sticker') {
      g.moved = true;
      setDragSticker({ index: g.index, x: lx - g.offset[0], y: ly - g.offset[1] });
    }
  }

  function onPointerUp(e) {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) {
      if (g?.type === 'pinch') gesture.current = null;
      return;
    }
    gesture.current = null;
    if (!g || readOnly) return;
    if (g.type === 'tap' && tool === 'fill') {
      if (Math.hypot(e.clientX - g.start[0], e.clientY - g.start[1]) > 10) return;
      const id = regionAtPoint(e.clientX, e.clientY);
      if (id) onFill?.(id);
    } else if (g.type === 'stroke' && liveStroke.current) {
      const st = liveStroke.current;
      liveStroke.current = null;
      onStroke?.(st);
    } else if (g.type === 'sticker') {
      if (g.moved && dragSticker) {
        const s = data.stickers[g.index];
        onStickerChange?.(g.index, { ...s, x: Math.round(dragSticker.x), y: Math.round(dragSticker.y) });
      }
      setDragSticker(null);
    } else if (g.type === 'sticker-new') {
      setSelected(data.stickers.length);
      onStickerAdd?.({ type: stickerType, x: Math.round(g.at[0]), y: Math.round(g.at[1]), scale: 1, rot: 0 });
    }
  }

  function onPointerCancel(e) {
    pointers.current.delete(e.pointerId);
    gesture.current = null;
    liveStroke.current = null;
    setDragSticker(null);
    drawStrokes(canvasRef.current.getContext('2d'), data.strokes, RES);
  }

  useEffect(() => {
    if (tool !== 'sticker') setSelected(null);
  }, [tool]);
  useEffect(() => {
    if (selected != null && selected >= data.stickers.length) setSelected(null);
  }, [data.stickers.length, selected]);

  const stickers = useMemo(
    () => data.stickers.map((s, i) => (dragSticker?.index === i ? { ...s, x: dragSticker.x, y: dragSticker.y } : s)),
    [data.stickers, dragSticker],
  );

  const numbers = useMemo(() => {
    if (!showNumbers || !picture?.regions) return [];
    return picture.regions.filter((r) => r.area > 60 && !isRegionDone(r, data.fills));
  }, [showNumbers, picture, data.fills]);

  const sel = selected != null ? stickers[selected] : null;
  const cursor = readOnly ? 'default' : tool === 'pan' ? 'grab' : tool === 'fill' ? 'pointer' : tool === 'sticker' ? 'copy' : 'crosshair';

  return (
    <div
      ref={viewportRef}
      className={`relative aspect-square w-full touch-none select-none overflow-hidden rounded-3xl border-2 border-line bg-white ${className}`}
      style={{ cursor, touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onPointerLeave={(e) => pointers.current.has(e.pointerId) && e.pointerType === 'mouse' && onPointerUp(e)}
      data-testid="coloring-canvas"
    >
      <div className="absolute left-0 top-0 h-full w-full origin-top-left" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})` }}>
        <div ref={svgHostRef} className={`picture-svg absolute inset-0 ${reveal ? 'reveal' : ''} ${tool !== 'fill' || readOnly ? 'no-pointer' : ''}`} />
        <canvas ref={canvasRef} width={600 * RES} height={600 * RES} className="pointer-events-none absolute inset-0 h-full w-full" />
        {showNumbers && (
          <svg viewBox="0 0 600 600" className="pointer-events-none absolute inset-0 h-full w-full">
            {numbers.map((r) => (
              <text
                key={r.id}
                x={r.label[0]}
                y={r.label[1]}
                fontSize={Math.max(9, Math.min(22, r.labelSize)) / Math.sqrt(view.z)}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="Nunito, sans-serif"
                fontWeight="800"
                fill="#1B2A38"
                stroke="#FFFFFF"
                strokeWidth={3 / Math.sqrt(view.z)}
                paintOrder="stroke"
              >
                {r.number}
              </text>
            ))}
          </svg>
        )}
        <svg viewBox="0 0 600 600" className="pointer-events-none absolute inset-0 h-full w-full">
          {stickers.map((s, i) => (
            <g key={i} transform={`translate(${s.x} ${s.y}) rotate(${s.rot || 0}) scale(${s.scale || 1})`}>
              <g transform="translate(-50 -50)" dangerouslySetInnerHTML={{ __html: stickerSvg(s.type) }} />
              {tool === 'sticker' && selected === i && <circle r="56" fill="none" stroke="#2B9BF4" strokeWidth={3 / (s.scale || 1)} strokeDasharray="8 6" />}
            </g>
          ))}
          {remoteCursors.map((c) => (
            <g key={c.userId} transform={`translate(${c.x} ${c.y})`}>
              <circle r="9" fill={c.color} stroke="#FFFFFF" strokeWidth="3" />
              <text y="-14" textAnchor="middle" fontSize="16" fontWeight="800" fill={c.color} stroke="#FFFFFF" strokeWidth="4" paintOrder="stroke">
                {c.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {tool === 'sticker' && sel && !readOnly && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 rounded-2xl bg-white/95 p-1 shadow-pop" onPointerDown={(e) => e.stopPropagation()}>
          {[
            ['＋', () => onStickerChange?.(selected, { ...data.stickers[selected], scale: Math.min(3, (sel.scale || 1) * 1.2) }), 'bigger'],
            ['－', () => onStickerChange?.(selected, { ...data.stickers[selected], scale: Math.max(0.4, (sel.scale || 1) / 1.2) }), 'smaller'],
            ['↻', () => onStickerChange?.(selected, { ...data.stickers[selected], rot: ((sel.rot || 0) + 30) % 360 }), 'rotate'],
            ['🗑', () => { onStickerRemove?.(selected); setSelected(null); }, 'remove'],
          ].map(([label, fn, key]) => (
            <button key={key} type="button" className="btn-ghost min-h-11 px-3 text-xl" onClick={fn} aria-label={key}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default Canvas;
