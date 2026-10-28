// Hiệu ứng chuyển màn hình riêng cho Đấu trường: nền cam đào mở ra từ giữa, chiếc cúp vàng + hai cây cọ bắt chéo bật lên,
// sơn màu và ngôi sao bung quanh, rồi vào đúng trang Đấu trường thật (không dùng cầu vòng của Tô màu).
//
// Cách chạy:
//  1. Bé bấm vào liên kết /arena (thẻ trên trang chủ hoặc nút trên thanh menu) → chặn điều hướng, thu thẻ nhẹ về 96%,
//     dựng lớp phủ toàn màn hình (position: fixed) và phát tiếng ting.
//  2. Lớp phủ tự chạy bằng CSS (keyframes trong index.css, tiền tố `at-`), mọi mốc thời gian nằm ở hằng số bên dưới.
//  3. Tới mốc NAVIGATE_MS: chuyển sang trang Đấu trường NGAY DƯỚI lớp phủ để trang tự tải dữ liệu.
//  4. Lớp phủ chỉ mờ đi khi đã đủ MIN_MS VÀ trang đích báo sẵn sàng (sự kiện `btm:page-ready`) — có trần MAX_WAIT_MS
//     để không bao giờ bị kẹt. Nội dung trang đích bay lên nhẹ lần lượt (html[data-arena-enter]), rồi lớp phủ được gỡ.
// Đổi ảnh chiếc cúp: thay file /public/arena/cup-brushes.webp (PNG/WebP nền trong suốt, cùng tỷ lệ càng tốt).
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { playTing } from '../../lib/sound';
import { transitionBus } from '../../lib/transitionBus';

export const CUP_IMAGE = '/arena/cup-brushes.webp';
const NAVIGATE_MS = 1500;   // chuyển sang trang Đấu trường (đang nằm dưới lớp phủ)
const MIN_MS = 2050;        // thời gian tối thiểu trước khi lớp phủ được phép mờ đi
const MAX_WAIT_MS = 6000;   // trần chờ trang đích tải xong
const FADE_MS = 380;        // lớp phủ mờ dần
const ENTER_MS = 900;       // thời gian giữ hiệu ứng "nội dung bay lên" của trang đích

const isArena = (p) => p === '/arena' || p.startsWith('/arena/');
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const weakDevice = () => typeof navigator !== 'undefined' && ((navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2);

// Ngôi sao (x, y theo % khung hình, kích thước px, độ trễ ms).
const STARS = [
  { x: 9, y: 28, s: 30, d: 380 }, { x: 88, y: 12, s: 34, d: 520 }, { x: 18, y: 78, s: 24, d: 700 },
  { x: 91, y: 70, s: 28, d: 640 }, { x: 36, y: 14, s: 22, d: 460 }, { x: 66, y: 8, s: 20, d: 800 },
  { x: 29, y: 52, s: 26, d: 1000 }, { x: 72, y: 50, s: 26, d: 1060 }, { x: 55, y: 22, s: 18, d: 1120 },
  { x: 47, y: 86, s: 18, d: 900 },
];
// Giọt sơn: dx/dy = nơi dừng so với tâm (đơn vị %-chiều rộng cụm), c = màu.
const DROPS = [
  { dx: -46, dy: 24, c: '#3DA9FC', r: -30, d: 1000 }, { dx: 44, dy: 18, c: '#3DA9FC', r: 25, d: 1050 },
  { dx: -30, dy: 44, c: '#FF6FB5', r: -60, d: 1150 }, { dx: 36, dy: 40, c: '#FF6FB5', r: 50, d: 1200 },
  { dx: -50, dy: -8, c: '#FFD93B', r: -80, d: 1100 }, { dx: 48, dy: -12, c: '#FFD93B', r: 70, d: 1250 },
  { dx: -22, dy: -36, c: '#A06CFF', r: -20, d: 1300 }, { dx: 26, dy: -34, c: '#A06CFF', r: 20, d: 1350 },
];
const DROP_PATH = 'M12 1 C12 1 3 12 3 18 a9 9 0 0 0 18 0 C21 12 12 1 12 1 Z';
const STAR_PATH = 'M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4 Z';

function Overlay({ lite, leaving }) {
  const stars = lite ? STARS.slice(0, 5) : STARS;
  const drops = lite ? DROPS.slice(0, 4) : DROPS;
  return (
    <div className={`at-root${lite ? ' at-lite' : ''}${leaving ? ' at-leaving' : ''}`} data-testid="arena-transition" aria-hidden="true">
      <div className="at-bg" />
      <div className="at-rings">
        <span className="at-ring at-ring-3" />
        <span className="at-ring at-ring-2" />
        <span className="at-ring at-ring-1" />
      </div>
      <svg className="at-wave at-wave-tl" viewBox="0 0 400 260" preserveAspectRatio="none">
        <path d="M0 0 H400 C330 40 300 110 220 150 C140 190 60 190 0 230 Z" fill="#FDAA6A" />
        <path d="M400 0 C330 40 300 110 220 150 C140 190 60 190 0 230" fill="none" stroke="#FFE9A8" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <svg className="at-wave at-wave-br" viewBox="0 0 400 260" preserveAspectRatio="none">
        <path d="M400 260 H0 C70 220 100 150 180 110 C260 70 340 70 400 30 Z" fill="#FDAA6A" />
        <path d="M0 260 C70 220 100 150 180 110 C260 70 340 70 400 30" fill="none" stroke="#FFE9A8" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <svg className="at-wave at-wave-bl" viewBox="0 0 300 200" preserveAspectRatio="none">
        <path d="M0 200 V60 C60 70 90 120 150 150 C200 175 250 175 300 200 Z" fill="#FDB982" />
        <path d="M0 60 C60 70 90 120 150 150 C200 175 250 175 300 200" fill="none" stroke="#FFE9A8" strokeWidth="4" strokeLinecap="round" />
      </svg>
      {stars.map((s, i) => (
        <svg key={i} className="at-star" viewBox="0 0 24 24" style={{ left: `${s.x}%`, top: `${s.y}%`, width: Math.round(s.s * 1.4), height: Math.round(s.s * 1.4), '--d': `${s.d}ms`, '--tw': `${(i % 4) * 300}ms` }}>
          <path d={STAR_PATH} fill={i % 3 === 1 ? '#FFE27A' : '#FFD13B'} />
        </svg>
      ))}
      <div className="at-stage">
        <div className="at-cluster">
          <span className="at-glow" />
          {drops.map((p, i) => (
            <svg key={i} className="at-drop" viewBox="0 0 24 24" style={{ '--dx': `${p.dx}%`, '--dy': `${p.dy}%`, '--r': `${p.r}deg`, '--d': `${p.d}ms` }}>
              <path d={DROP_PATH} fill={p.c} />
              <ellipse cx="9" cy="16" rx="2" ry="3" fill="#FFFFFF" opacity="0.55" transform="rotate(20 9 16)" />
            </svg>
          ))}
          <div className="at-float">
            <div className="at-pop">
              <img className="at-cup" src={CUP_IMAGE} alt="" draggable="false" />
              <span className="at-shine" style={{ WebkitMaskImage: `url(${CUP_IMAGE})`, maskImage: `url(${CUP_IMAGE})` }} />
            </div>
          </div>
          <span className="at-shadow" />
        </div>
      </div>
    </div>
  );
}

export default function ArenaTransition() {
  const navigate = useNavigate();
  const loc = useLocation();
  const [phase, setPhase] = useState(null); // null | 'run' | 'leave'
  const busy = useRef(false);
  const timers = useRef([]);
  const state = useRef({ navigated: false, ready: false, minDone: false, finished: false });
  const lite = useMemo(weakDevice, []);
  const path = useRef(loc.pathname);
  path.current = loc.pathname;

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      document.documentElement.removeAttribute('data-arena-enter');
      transitionBus.skipRainbow = false;
    },
    [],
  );

  // Bấm vào liên kết dẫn tới Đấu trường.
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || !isArena(url.pathname)) return;
      if (isArena(window.location.pathname) || busy.current || reduceMotion()) return;
      e.preventDefault();
      busy.current = true;
      transitionBus.skipRainbow = true;
      const dest = url.pathname + url.search + url.hash;
      const st = state.current;
      st.navigated = false;
      st.ready = false;
      st.minDone = false;
      st.finished = false;

      // Thẻ được bấm thu nhẹ xuống 96% rồi trở về.
      const card = a.parentElement || a;
      card.animate?.([{ transform: 'scale(1)' }, { transform: 'scale(0.96)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 260, easing: 'ease-out' });

      setPhase('run');
      playTing();

      const finish = () => {
        if (st.finished) return;
        st.finished = true;
        setPhase('leave');
        document.documentElement.setAttribute('data-arena-enter', '');
        later(() => document.documentElement.removeAttribute('data-arena-enter'), ENTER_MS);
        later(() => {
          setPhase(null);
          busy.current = false;
          transitionBus.skipRainbow = false;
        }, FADE_MS);
      };
      const tryFinish = () => {
        if (st.navigated && st.minDone && st.ready) finish();
      };
      const onReady = () => {
        if (!st.navigated) return;           // tín hiệu của trang khác, không phải trang Đấu trường
        st.ready = true;
        tryFinish();
      };
      window.addEventListener('btm:page-ready', onReady);
      later(() => window.removeEventListener('btm:page-ready', onReady), MAX_WAIT_MS + 1000);

      later(() => {
        st.navigated = true;
        navigate(dest);
      }, NAVIGATE_MS);
      later(() => {
        st.minDone = true;
        tryFinish();
      }, MIN_MS);
      later(() => {
        st.ready = true;                      // trần chờ: không để lớp phủ kẹt mãi
        st.minDone = true;
        if (st.navigated) finish();
      }, MAX_WAIT_MS);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [navigate]);

  // Khoá cuộn trang trong lúc chuyển cảnh (không làm xuất hiện thanh cuộn).
  useEffect(() => {
    if (!phase) return undefined;
    const html = document.documentElement;
    const body = document.body;
    const prev = { ho: html.style.overflow, bo: body.style.overflow, bp: body.style.paddingRight };
    const sb = window.innerWidth - html.clientWidth;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    if (sb > 0) body.style.paddingRight = `${sb}px`;
    const stop = (e) => e.preventDefault();
    window.addEventListener('wheel', stop, { passive: false });
    window.addEventListener('touchmove', stop, { passive: false });
    return () => {
      html.style.overflow = prev.ho;
      body.style.overflow = prev.bo;
      body.style.paddingRight = prev.bp;
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchmove', stop);
    };
  }, [phase]);

  if (!phase) return null;
  return <Overlay lite={lite} leaving={phase === 'leave'} />;
}
