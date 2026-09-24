// Ảnh minh hoạ thật của tranh (SVG + màu) — dùng ở các tầng chọn tranh, lịch sử, thẻ.
import { memo, useMemo } from 'react';
import { coloredSvgString, referenceFills } from '../../lib/picture';

function PictureView({ picture, data = null, reveal = false, className = '', title }) {
  const html = useMemo(() => {
    if (!picture?.svg) return '';
    return coloredSvgString(picture.svg, data || { fills: referenceFills(picture), glitter: [], stickers: [] }, { withStickers: !!data?.stickers?.length });
  }, [picture, data]);
  return (
    <div
      className={`picture-svg no-pointer aspect-square overflow-hidden ${reveal ? 'reveal' : ''} ${className}`}
      role="img"
      aria-label={title}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default memo(PictureView);
