// Hiệu ứng chuyển màn hình bằng CẦU VỒNG — chỉ dùng khi vào / ra khu vực Tô màu (/color…, /draw/…).
// Dãy cầu vòng (nhiều vòng cung đồng tâm) vẽ dần từ trái sang phải theo đường cong, phủ kín màn hình;
// lúc đó mới đổi trang, rồi cầu vòng tiếp tục chạy sang phải và hé lộ trang mới.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RAINBOW = ['#FF4D5E', '#FF9A2E', '#FFD93B', '#4CD787', '#3DA9FC', '#5B6CFF', '#A06CFF']; // ngoài → trong
const BANDS = 14;          // 2 dãy cầu vòng chồng nhau để phủ kín màn hình
const DRAW_MS = 560;       // thời gian vẽ/xoá một vòng
const STAGGER_MS = 9;      // vòng sau chạy trễ hơn vòng trước một chút
const SWEEP_MS = DRAW_MS + STAGGER_MS * BANDS;
const HOLD_MS = 90;        // giữ kín màn hình một nhịp để trang mới kịp dựng

/** Thuộc khu vực Tô màu: chọn chủ đề/đối tượng/tư thế và màn hình tô. */
export const isColoringPath = (p) => p === '/color' || p.startsWith('/color/') || p.startsWith('/draw/');
const crosses = (from, to) => isColoringPath(from) !== isColoringPath(to);
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function RainbowTransition() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [phase, setPhase] = useState(null);           // null | 'in' | 'out'
  const [size, setSize] = useState({ w: 0, h: 0 });
  const prevPath = useRef(loc.pathname);
  const handled = useRef(false);                       // đổi trang do chính hiệu ứng này gây ra
  const busy = useRef(false);
  const timers = useRef([]);

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Bấm vào liên kết vượt ranh giới khu vực Tô màu: vẽ cầu vòng che màn hình rồi mới đổi trang.
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (!crosses(window.location.pathname, url.pathname) || busy.current || reduceMotion()) return;
      e.preventDefault();
      busy.current = true;
      setSize({ w: window.innerWidth, h: window.innerHeight });
      setPhase('in');
      later(() => {
        handled.current = true;
        navigate(url.pathname + url.search + url.hash);
        later(() => setPhase('out'), HOLD_MS);
        later(() => { setPhase(null); busy.current = false; }, HOLD_MS + SWEEP_MS + 40);
      }, SWEEP_MS + 20);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [navigate]);

  // Đổi trang theo cách khác (nút Quay lại của trình duyệt, navigate() trong mã): màn hình đã đổi,
  // phủ cầu vòng ngay trước khi vẽ rồi cho chạy ra để hé lộ trang mới.
  useLayoutEffect(() => {
    const from = prevPath.current;
    prevPath.current = loc.pathname;
    if (handled.current) {
      handled.current = false;
      return;
    }
    if (from === loc.pathname || !crosses(from, loc.pathname) || reduceMotion() || busy.current) return;
    busy.current = true;
    setSize({ w: window.innerWidth, h: window.innerHeight });
    setPhase('out');
    later(() => { setPhase(null); busy.current = false; }, HOLD_MS + SWEEP_MS + 40);
  }, [loc.pathname]);

  if (!phase) return null;
  const { w, h } = size;
  const cx = w / 2;
  const cy = h * 1.05;
  const rMax = Math.hypot(w / 2, cy) + 8;
  const bw = rMax / BANDS;
  return (
    <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: 'auto' }} aria-hidden="true" data-testid="rainbow-transition" data-phase={phase}>
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        {Array.from({ length: BANDS }, (_, i) => {
          const r = (i + 0.5) * bw;                       // i = 0 là vòng trong cùng
          const color = RAINBOW[(BANDS - 1 - i) % RAINBOW.length];
          const order = BANDS - 1 - i;                    // vòng ngoài cùng chạy trước
          return (
            <path
              key={i}
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              pathLength="1"
              fill="none"
              stroke={color}
              strokeWidth={bw + 1.5}
              strokeDasharray="1 1"
              className={phase === 'in' ? 'rainbow-in' : 'rainbow-out'}
              style={{ animationDuration: `${DRAW_MS}ms`, animationDelay: `${order * STAGGER_MS}ms` }}
            />
          );
        })}
      </svg>
    </div>
  );
}
