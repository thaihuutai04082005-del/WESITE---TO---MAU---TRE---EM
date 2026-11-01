// Bìa truyện bán trong shop (khớp backend/src/services/pdf.js). Không có bìa = bìa kem viền cam mặc định.
export const DEFAULT_COVER = { bg: 'linear-gradient(#FFF6DA, #FFEBB5)', solid: '#FFEBB5', line: '#F5A623' };
export const STORY_COVERS = {
  'bia-xanh-troi': { solid: '#BDE6FF', line: '#2B9BF4' },
  'bia-hong-phan': { solid: '#FFD6E4', line: '#F2679A' },
  'bia-xanh-la': { solid: '#CDEFC0', line: '#4CAF50' },
  'bia-vang-nang': { solid: '#FFF0A6', line: '#F2B01E' },
  'bia-tim-oai-huong': { solid: '#E3D6FF', line: '#8A63E8' },
};
export function coverOf(slug) {
  const c = STORY_COVERS[slug];
  return c ? { ...c, bg: c.solid } : DEFAULT_COVER;
}
