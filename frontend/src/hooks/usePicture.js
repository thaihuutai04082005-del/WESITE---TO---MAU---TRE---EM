// Tải tranh theo id; nhận preview đi kèm danh sách để tránh gọi API riêng cho từng thẻ.
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../store/auth';

export function usePicture(id, supplied) {
  const token = useAuth((state) => state.token);
  const [loaded, setLoaded] = useState(null);
  useEffect(() => {
    setLoaded(null);
    if (!id || supplied !== undefined) return;
    let alive = true;
    api.get(`/pictures/${id}?preview=1`).then((r) => r.picture)
      .then((p) => {
        if (alive) setLoaded({ id, token, picture: p });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [id, token, supplied]);
  return supplied !== undefined ? supplied : loaded && loaded.id === id && loaded.token === token ? loaded.picture : null;
}
