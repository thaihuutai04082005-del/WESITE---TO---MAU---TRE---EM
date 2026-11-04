import { api } from '../services/api';

/** Tạo tranh mới (chưa tính lượt — lượt chỉ tính khi bé bắt đầu tô). */
export async function createArtwork(pictureId, mode, { editor = false } = {}) {
  return api.post('/artworks', { pictureId, mode, ...(editor ? { editor: true } : {}) });
}
