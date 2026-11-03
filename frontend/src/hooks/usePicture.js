// Tải (có cache) tranh theo id — dùng cho thẻ trong bộ sưu tập, trading.
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../store/auth';

export function usePicture(id) {
  const token = useAuth((state) => state.token);
  const [pic, setPic] = useState(null);
  useEffect(() => {
    setPic(null);
    if (!id) return;
    let alive = true;
    api.get(`/pictures/${id}?preview=1`).then((r) => r.picture)
      .then((p) => {
        if (alive) setPic(p);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [id, token]);
  return pic;
}
