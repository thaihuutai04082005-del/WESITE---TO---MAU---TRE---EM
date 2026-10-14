// Hiệu ứng chuyển màn hình — chỉ dùng khi vào / ra khu vực Tô màu (/color…, /draw/…).
//  • Vào Tô màu: lấp lánh quanh chỗ bấm → MỘT cầu vòng 7 màu vừa khung hình quét MỘT LƯỢT từ trái sang phải theo đường cong
//    phủ kín màn hình → đổi trang → gỡ cầu vòng NGAY, không mờ dần, không còn dư âm.
//  • Ra khỏi Tô màu (về trang chủ…): chỉ cầu vòng, y hệt.
// Cầu vòng là một lớp nền duy nhất (7 dải đồng tâm) + mặt nạ hình quạt quay quanh tâm, vẽ bằng requestAnimationFrame
// với đường cong làm mượt (easeInOutSine) nên chạy mượt, không phải dựng lại 14 hình như trước.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RAINBOW = ['#FF4D5E', '#FF9A2E', '#FFD93B', '#4CD787', '#3DA9FC', '#5B6CFF', '#A06CFF']; // đỏ (ngoài) → tím (trong)
const SPARKLE_COLORS = ['#FFD93B', '#FFFFFF', '#FF9ACB', '#7FD4FF', '#B79CFF'];
const SPARKLES = 18;
const SPARKLE_MS = 560;     // thời gian lấp lánh trước khi cầu vòng hiện
const SWEEP_MS = 950;       // một lượt quét (phủ kín, hoặc hé lộ)
const HOLD_MS = 110;        // giữ kín màn hình một nhịp cho trang mới kịp dựng, rồi gỡ ngay
const END_ANGLE = 186;      // quét quá 180° một chút để chắc chắn phủ kín / sạch hẳn
const CENTER_Y = 1.05;      // tâm vòng cung nằm hơi dưới đáy màn hình

/** Thuộc khu vực Tô màu: chọn chủ đề/đối tượng/tư thế và màn hình tô. */
export const isColoringPath = (p) => p === '/color' || p.startsWith('/color/') || p.startsWith('/draw/');
const crosses = (from, to) => isColoringPath(from) !== isColoringPath(to);
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const ease = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);   // easeInOutSine: êm ở đầu và cuối

/** Chạy 0 → END_ANGLE trong `ms` mili giây, gọi set(góc) mỗi khung hình; trả về hàm huỷ. */
function sweep(ms, set, done) {
  let raf = 0;
  let start = 0;
  const step = (now) => {
    if (!start) start = now;
    const t = Math.min(1, (now - start) / ms);
    set(ease(t) * END_ANGLE);
    if (t < 1) raf = requestAnimationFrame(step);
    else done?.();
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

export default function RainbowTransition() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [phase, setPhase] = useState(null);           // null | 'sparkle' | 'in'
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [spark, setSpark] = useState({ x: 0, y: 0, key: 0 });
  const overlay = useRef(null);
  const prevPath = useRef(loc.pathname);
  const handled = useRef(false);                       // đổi trang do chính hiệu ứng này gây ra
  const busy = useRef(false);
  const pendingTo = useRef(null);
  const timers = useRef([]);

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Bấm vào liên kết vượt ranh giới khu vực Tô màu.
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
      pendingTo.current = url.pathname + url.search + url.hash;
      setSize({ w: window.innerWidth, h: window.innerHeight });
      if (isColoringPath(url.pathname)) {
        // Vào Tô màu: lấp lánh quanh chỗ bấm (bàn phím không có toạ độ → lấy giữa phần tử) rồi mới hiện cầu vòng.
        const r = a.getBoundingClientRect();
        const x = e.clientX || r.left + r.width / 2;
        const y = e.clientY || r.top + r.height / 2;
        setSpark((s) => ({ x, y, key: s.key + 1 }));
        setPhase('sparkle');
        later(() => setPhase('in'), SPARKLE_MS);
      } else {
        setPhase('in');
      }
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // Đổi trang theo cách khác (nút Quay lại của trình duyệt, navigate() trong mã): trang mới đã dựng sẵn,
  // phủ cầu vòng ngay trước khi vẽ rồi cho chạy ra để hé lộ.
  useLayoutEffect(() => {
    const from = prevPath.current;
    prevPath.current = loc.pathname;
    if (handled.current) {
      handled.current = false;
      return;
    }
    if (from === loc.pathname || !crosses(from, loc.pathname) || reduceMotion() || busy.current) return;
    busy.current = true;
    pendingTo.current = null;
    setSize({ w: window.innerWidth, h: window.innerHeight });
    setPhase('in');
  }, [loc.pathname]);

  // Chạy các lượt quét theo pha.
  useEffect(() => {
    const el = overlay.current;
    if (!el || phase !== 'in') return undefined;
    el.style.setProperty('--a', '0deg');
    return sweep(
      SWEEP_MS,
      (deg) => el.style.setProperty('--a', `${deg}deg`),
      () => {
        if (pendingTo.current) {
          handled.current = true;
          navigate(pendingTo.current);
          pendingTo.current = null;
        }
        later(() => { setPhase(null); busy.current = false; }, HOLD_MS);
      },
    );
  }, [phase, navigate]);

  const sparkles = useMemo(
    () =>
      Array.from({ length: SPARKLES }, (_, i) => {
        const ang = (i / SPARKLES) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const dist = 46 + Math.random() * 78;
        return {
          dx: Math.cos(ang) * dist,
          dy: Math.sin(ang) * dist,
          size: 11 + Math.random() * 15,
          rot: (Math.random() - 0.5) * 140,
          delay: Math.random() * 140,
          color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spark.key],
  );

  if (!phase) return null;
  const { w, h } = size;
  const R = Math.hypot(w / 2, h * CENTER_Y) + 4;     // bán kính tới góc xa nhất: dải ngoài cùng vừa chạm góc màn hình
  const stops = [...RAINBOW].reverse().map((c, i) => `${c} ${((i * R) / 7).toFixed(1)}px ${(((i + 1) * R) / 7).toFixed(1)}px`).join(', ');
  const center = `50% ${(CENTER_Y * 100).toFixed(1)}%`;
  const mask = `conic-gradient(from -90deg at ${center}, #000 calc(var(--a) - 2deg), transparent var(--a))`;

  return (
    <>
      {phase === 'sparkle' && (
        <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true" data-testid="sparkle-burst" key={spark.key}>
          <span className="sparkle-glow" style={{ left: spark.x, top: spark.y }} />
          {sparkles.map((s, i) => (
            <svg
              key={i}
              className="sparkle-star"
              viewBox="0 0 24 24"
              width={s.size}
              height={s.size}
              style={{ left: spark.x, top: spark.y, '--dx': `${s.dx}px`, '--dy': `${s.dy}px`, '--rot': `${s.rot}deg`, animationDelay: `${s.delay}ms` }}
            >
              <path d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4 Z" fill={s.color} />
            </svg>
          ))}
        </div>
      )}
      {phase === 'in' && (
        <div
          ref={overlay}
          className="fixed inset-0 z-[9999]"
          aria-hidden="true"
          data-testid="rainbow-transition"
          data-phase={phase}
          style={{
            '--a': '0deg',
            background: `radial-gradient(circle at ${center}, ${stops})`,
            WebkitMaskImage: mask,
            maskImage: mask,
            willChange: 'mask-image',
          }}
        />
      )}
    </>
  );
}
