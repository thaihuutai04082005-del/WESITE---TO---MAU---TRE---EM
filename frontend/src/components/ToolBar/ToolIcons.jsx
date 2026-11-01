// Biểu tượng 5 kiểu tô (ảnh do chủ web cung cấp, đã cắt thành 5 nút tròn trong /public/tools/).
const icon = (name) => function ToolIcon() {
  return <img src={`/tools/${name}.webp`} alt="" className="tb-ico" draggable={false} />;
};

export const CrayonIcon = icon('crayon');
export const BrushIcon = icon('brush');
export const GlitterIcon = icon('glitter');
export const PatternIcon = icon('pattern');
export const StickerIcon = icon('sticker');
