import { useMemo } from 'react';

const COLORS = ['#FF5F7E', '#FFC94D', '#4CD787', '#2B9BF4', '#7D5FFF', '#FF8A65'];

export default function Confetti({ count = 60 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 2.2 + Math.random() * 1.8,
        color: COLORS[i % COLORS.length],
        rot: Math.random() * 360,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <span key={i} className="confetti-piece" style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, transform: `rotate(${p.rot}deg)` }} />
      ))}
    </div>
  );
}
