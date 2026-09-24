// Tải (có cache) tranh theo id — dùng cho thẻ trong bộ sưu tập, trading.
import { useEffect, useState } from 'react';
import { api } from '../services/api';

const cache = new Map();

export function usePicture(id) {
  const [pic, setPic] = useState(() => cache.get(id)?.value || null);
  useEffect(() => {
    if (!id) return;
    let alive = true;
    if (!cache.has(id)) cache.set(id, { promise: api.get(`/pictures/${id}`).then((r) => r.picture) });
    const entry = cache.get(id);
    entry.promise
      .then((p) => {
        entry.value = p;
        if (alive) setPic(p);
      })
      .catch(() => cache.delete(id));
    return () => {
      alive = false;
    };
  }, [id]);
  return pic;
}
