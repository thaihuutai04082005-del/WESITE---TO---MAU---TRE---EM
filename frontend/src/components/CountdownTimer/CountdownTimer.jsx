import { useEffect, useState } from 'react';

/** Đồng hồ đếm ngược tới `endsAt` (ms, giờ server) — `offset` = serverNow - Date.now(). */
export default function CountdownTimer({ endsAt, offset = 0, onEnd, className = '', warnAt = 60 }) {
  const [left, setLeft] = useState(() => Math.max(0, endsAt - (Date.now() + offset)));
  useEffect(() => {
    let fired = false;
    const tick = () => {
      const l = Math.max(0, endsAt - (Date.now() + offset));
      setLeft(l);
      if (l === 0 && !fired) {
        fired = true;
        onEnd?.();
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [endsAt, offset, onEnd]);
  const s = Math.ceil(left / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return (
    <span className={`font-display font-extrabold tabular-nums ${s <= warnAt ? 'text-danger' : 'text-ink'} ${className}`} aria-live="polite">
      {mm}:{ss}
    </span>
  );
}
