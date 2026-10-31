// true khi màn hình rộng từ 900px (dùng cho các trang "cảnh" vẽ bằng ảnh nền).
import { useEffect, useState } from 'react';

export default function useWide(query = '(min-width: 900px)') {
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setWide(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  return wide;
}
