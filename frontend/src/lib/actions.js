import { api } from '../services/api';

/** Tạo tranh mới (chưa tính lượt — lượt chỉ tính khi bé bắt đầu tô). */
export async function createArtwork(pictureId, mode) {
  const r = await api.post('/artworks', { pictureId, mode });
  return r.artwork.id;
}
