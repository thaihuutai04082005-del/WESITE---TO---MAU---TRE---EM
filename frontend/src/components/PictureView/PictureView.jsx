// Ảnh minh hoạ thật của tranh (SVG + màu) — dùng ở các tầng chọn tranh, lịch sử, thẻ.
import { memo, useMemo } from 'react';
import { coloredSvgString, referenceFills } from '../../lib/picture';

function PictureView({ picture, data = null, reveal = false, className = '', title, numbers = false, doneIds = null }) {
  const html = useMemo(() => {
    if (!picture?.svg) return '';
    return coloredSvgString(picture.svg, data || { fills: referenceFills(picture), glitter: [], stickers: [] }, { withStickers: !!data?.stickers?.length });
  }, [picture, data]);
  const labels = useMemo(() => (numbers && picture?.regions ? picture.regions.filter((r) => r.area > 60 && r.number != null) : []), [numbers, picture]);
  const view = (
    <div
      className={`picture-svg no-pointer aspect-square overflow-hidden ${reveal ? 'reveal' : ''} ${className}`}
      role="img"
      aria-label={title}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
  if (!numbers) return view;
  // Số màu nằm trên tranh mẫu (không nằm trên tranh bé đang tô). Vùng bé đã tô xong thì số mờ đi.
  return (
    <div className="relative">
      {view}
      <svg viewBox="0 0 600 600" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        {labels.map((r) => (
          <text
            key={r.id}
            x={r.label[0]}
            y={r.label[1]}
            fontSize={Math.max(10, Math.min(24, r.labelSize))}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="Nunito, sans-serif"
            fontWeight="800"
            fill="#1B2A38"
            stroke="#FFFFFF"
            strokeWidth="3"
            paintOrder="stroke"
            opacity={doneIds?.has(r.id) ? 0.3 : 1}
          >
            {r.number}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default memo(PictureView);
