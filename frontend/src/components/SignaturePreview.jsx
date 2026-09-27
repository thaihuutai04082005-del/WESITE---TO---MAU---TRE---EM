// Xem trước chữ ký (khung 150×50) — dùng ở trang tạo chữ ký, hồ sơ, bảng chọn mẫu.
import { useEffect, useMemo, useState } from 'react';
import { ensureSignatureFont, signatureInner } from '../lib/signature';

let seq = 0;

export default function SignaturePreview({ signature, className = '', background = 'transparent' }) {
  const [uid] = useState(() => `v${++seq}`);
  const [tick, setTick] = useState(0);
  const style = signature?.style;

  useEffect(() => {
    if (!style) return;
    let alive = true;
    ensureSignatureFont(style).then(() => alive && setTick((n) => n + 1));
    return () => {
      alive = false;
    };
  }, [style]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const inner = useMemo(() => (signature ? signatureInner(signature, uid) : ''), [signature, uid, tick]);
  return (
    <svg viewBox="-80 -30 160 60" className={className} style={{ background }} aria-hidden="true">
      <g dangerouslySetInnerHTML={{ __html: inner }} />
    </svg>
  );
}
