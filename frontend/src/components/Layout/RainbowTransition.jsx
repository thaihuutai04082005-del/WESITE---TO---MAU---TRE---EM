// Hiệu ứng chuyển màn hình — chỉ dùng khi vào / ra khu vực Tô màu (/color…, /draw/…).
//  • Vào Tô màu: lấp lánh quanh chỗ bấm → MỘT cầu vòng 7 màu vừa khung hình quét MỘT LƯỢT từ trái sang phải theo đường cong
//    phủ kín màn hình → đổi trang → GIỮ kín tới khi trang đích báo sẵn sàng (btm:page-ready) → cầu vòng mờ dần, nội dung bay lên nhẹ.
//  • Ra khỏi Tô màu (về trang chủ…): KHÔNG có hiệu ứng — chỉ giữ chiều đi vào, bỏ chiều quay về.
//  • Vào Tô cùng nhau / Bóc thẻ / Truyện tranh: chỉ lấp lánh quanh chỗ bấm + tiếng ting (giống lúc vào Tô màu),
//    rồi chuyển trang ngay — chưa có cầu vòng (hiệu ứng chuyển màn hình riêng sẽ bổ sung sau). Đấu trường: xem ArenaTransition.jsx.
// Cầu vòng là một lớp nền duy nhất (7 dải đồng tâm) + mặt nạ hình quạt quay quanh tâm, vẽ bằng requestAnimationFrame
// với đường cong làm mượt (easeInOutSine) nên chạy mượt, không phải dựng lại 14 hình như trước.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { playTing } from '../../lib/sound';
import { transitionBus } from '../../lib/transitionBus';

const RAINBOW = ['#FF4D5E', '#FF9A2E', '#FFD93B', '#4CD787', '#3DA9FC', '#5B6CFF', '#A06CFF']; // đỏ (ngoài) → tím (trong)
const SPARKLE_COLORS = ['#FFD93B', '#FFFFFF', '#FF9ACB', '#7FD4FF', '#B79CFF'];
const SPARKLES = 18;
const SPARKLE_MS = 560;     // thời gian lấp lánh trước khi cầu vòng hiện
const SWEEP_MS = 950;       // một lượt quét (phủ kín, hoặc hé lộ)
const HOLD_MS = 220;        // tối thiểu giữ kín màn hình sau lượt quét cho trang mới kịp dựng
const MAX_WAIT_MS = 4000;   // trần chờ trang đích tải xong (không bao giờ bị kẹt)
const SETTLE_MAX_MS = 900;  // chờ tối đa bấy lâu cho trang đích dựng xong sau khi báo sẵn sàng
const FADE_MS = 380;        // lớp phủ mờ dần để lộ trang mới
const ENTER_MS = 900;       // thời gian giữ hiệu ứng "nội dung bay lên" của trang đích
const END_ANGLE = 186;      // quét quá 180° một chút để chắc chắn phủ kín / sạch hẳn
const CENTER_Y = 1.05;      // tâm vòng cung nằm hơi dưới đáy màn hình

/** Thuộc khu vực Tô màu: chọn chủ đề/đối tượng/tư thế và màn hình tô. */
export const isColoringPath = (p) => p === '/color' || p.startsWith('/color/') || p.startsWith('/draw/');
/** Các chế độ chơi chỉ có lấp lánh + tiếng ting khi bấm vào (chưa có hiệu ứng chuyển màn hình). */
const SPARKLE_MODES = ['/together', '/storybooks'];   // Đấu trường, Bóc thẻ, Truyện tranh, Tô cùng nhau (trang danh sách) có hiệu ứng riêng: ArenaTransition, GachaTransition, StoryTransition, TogetherTransition
const modeOf = (p) => SPARKLE_MODES.find((m) => p === m || p.startsWith(`${m}/`)) || null;
const crosses = (from, to) => isColoringPath(from) !== isColoringPath(to);
/** Chỉ chiều đi VÀO khu vực Tô màu mới có cầu vòng; chiều quay về đổi trang bình thường. */
const enters = (from, to) => !isColoringPath(from) && isColoringPath(to);
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
  const [phase, setPhase] = useState(null);           // null | 'sparkle' | 'in' (quét) | 'hold' (phủ kín, chờ trang đích) | 'leave' (mờ dần)
  const startAt = useRef(0);                           // mốc thời gian bắt đầu chờ trang đích (tín hiệu sẵn sàng phải đến sau mốc này)
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
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      document.documentElement.removeAttribute('data-arena-enter');
    },
    [],
  );

  // Bấm vào liên kết vượt ranh giới khu vực Tô màu.
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (busy.current || url.pathname === '/arena' || url.pathname.startsWith('/arena/') || url.pathname === '/gacha' || url.pathname.startsWith('/gacha/') || url.pathname === '/storybooks' || url.pathname === '/together' || url.pathname === '/missions') return;
      const target = modeOf(url.pathname);
      if (target && !crosses(window.location.pathname, url.pathname) && modeOf(window.location.pathname) !== target) {
        // Vào một chế độ chơi: lấp lánh + tiếng ting rồi chuyển trang luôn.
        e.preventDefault();
        busy.current = true;
        const dest = url.pathname + url.search + url.hash;
        const r = a.getBoundingClientRect();
        const x = e.clientX || r.left + r.width / 2;
        const y = e.clientY || r.top + r.height / 2;
        setSpark((sp) => ({ x, y, key: sp.key + 1 }));
        setPhase('sparkle');
        playTing();
        later(() => {
          navigate(dest);
          setPhase(null);
          busy.current = false;
        }, reduceMotion() ? 0 : SPARKLE_MS);
        return;
      }
      if (!enters(window.location.pathname, url.pathname) || reduceMotion()) return;
      e.preventDefault();
      busy.current = true;
      pendingTo.current = url.pathname + url.search + url.hash;
      setSize({ w: window.innerWidth, h: window.innerHeight });
      // Vào Tô màu: lấp lánh quanh chỗ bấm (bàn phím không có toạ độ → lấy giữa phần tử) rồi mới hiện cầu vòng.
      const r = a.getBoundingClientRect();
      const x = e.clientX || r.left + r.width / 2;
      const y = e.clientY || r.top + r.height / 2;
      setSpark((sp) => ({ x, y, key: sp.key + 1 }));
      setPhase('sparkle');
      playTing(); // tiếng ting khớp với lúc lấp lánh
      later(() => setPhase('in'), SPARKLE_MS);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [navigate]);

  // Đổi trang theo cách khác (navigate() trong mã) để VÀO Tô màu: trang mới đã dựng sẵn,
  // phủ cầu vòng ngay trước khi vẽ rồi cho chạy ra để hé lộ. Quay lại / ra khỏi Tô màu thì không có hiệu ứng.
  useLayoutEffect(() => {
    const from = prevPath.current;
    prevPath.current = loc.pathname;
    if (handled.current) {
      handled.current = false;
      return;
    }
    if (from === loc.pathname || !enters(from, loc.pathname) || reduceMotion() || busy.current || transitionBus.skipRainbow) return;
    busy.current = true;
    pendingTo.current = null;
    startAt.current = Date.now();
    setSize({ w: window.innerWidth, h: window.innerHeight });
    setPhase('in');
  }, [loc.pathname]);

  // Khoá cuộn trang từ lúc bấm (kể cả lúc lấp lánh, khi cầu vòng chưa che hết màn hình) cho tới khi hiệu ứng kết thúc.
  useEffect(() => {
    if (!phase) return undefined;
    const html = document.documentElement;
    const body = document.body;
    const prev = { ho: html.style.overflow, bo: body.style.overflow, bp: body.style.paddingRight };
    const sb = window.innerWidth - html.clientWidth;        // bề rộng thanh cuộn: bù lại để trang không bị giật ngang
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    if (sb > 0) body.style.paddingRight = `${sb}px`;
    const stop = (e) => e.preventDefault();
    const stopKey = (e) => {
      if ([' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
    };
    window.addEventListener('wheel', stop, { passive: false });
    window.addEventListener('touchmove', stop, { passive: false });
    window.addEventListener('keydown', stopKey);
    return () => {
      html.style.overflow = prev.ho;
      body.style.overflow = prev.bo;
      body.style.paddingRight = prev.bp;
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchmove', stop);
      window.removeEventListener('keydown', stopKey);
    };
  }, [phase]);

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
          startAt.current = Date.now();
          navigate(pendingTo.current);
          pendingTo.current = null;
        }
        setPhase('hold');
      },
    );
  }, [phase, navigate]);

  // Phủ kín: chờ đủ HOLD_MS VÀ trang đích báo sẵn sàng (hoặc hết MAX_WAIT_MS) rồi mới mờ dần — không để lộ trang đang dựng dở.
  useEffect(() => {
    if (phase !== 'hold') return undefined;
    const t0 = startAt.current;
    let minDone = false;
    let finished = false;
    const html = document.documentElement;
    const finish = () => {
      if (finished) return;
      finished = true;
      setPhase('leave');
      html.setAttribute('data-arena-enter', '');
      later(() => html.removeAttribute('data-arena-enter'), ENTER_MS);
      later(() => {
        setPhase(null);
        busy.current = false;
      }, FADE_MS);
    };
    // Trang đích báo xong thì còn chờ trình duyệt dựng/vẽ hết (3 khung hình liên tiếp đều nhanh, tối đa SETTLE_MAX_MS) rồi mới mờ dần,
    // để lúc mờ dần không bị khựng bởi việc dựng trang còn dở.
    let settling = false;
    const settle = () => {
      if (settling) return;
      settling = true;
      const t1 = performance.now();
      let last = t1;
      let calm = 0;
      const step = (now) => {
        if (finished) return;
        calm = now - last < 60 ? calm + 1 : 0;
        last = now;
        if (calm >= 3 || now - t1 > SETTLE_MAX_MS) finish();
        else raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    let raf = 0;
    const check = () => {
      if (minDone && transitionBus.readyAt >= t0) settle();
    };
    window.addEventListener('btm:page-ready', check);
    const minId = setTimeout(() => {
      minDone = true;
      check();
    }, HOLD_MS);
    const maxId = setTimeout(finish, MAX_WAIT_MS);
    return () => {
      window.removeEventListener('btm:page-ready', check);
      clearTimeout(minId);
      clearTimeout(maxId);
      cancelAnimationFrame(raf);
    };
  }, [phase]);

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
      {(phase === 'in' || phase === 'hold' || phase === 'leave') && (
        <div
          ref={overlay}
          className="fixed inset-0 z-[9999]"
          aria-hidden="true"
          data-testid="rainbow-transition"
          data-phase={phase}
          style={{
            '--a': phase === 'in' ? '0deg' : `${END_ANGLE}deg`,
            opacity: phase === 'leave' ? 0 : 1,
            transition: `opacity ${FADE_MS}ms ease-out`,
            background: `radial-gradient(circle at ${center}, ${stops})`,
            WebkitMaskImage: mask,
            maskImage: mask,
            willChange: 'mask-image, opacity',
          }}
        />
      )}
    </>
  );
}
