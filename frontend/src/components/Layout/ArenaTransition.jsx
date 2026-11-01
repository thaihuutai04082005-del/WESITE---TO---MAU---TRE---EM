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
// Hình minh hoạ nằm trong /public/arena/: cup-brushes.webp (cúp + hai cây cọ), burst.webp (vạch sáng trên đỉnh cúp), drop-*.webp (giọt sơn),
// star-*.webp (ngôi sao), wave-*.webp (đường cong ở góc). Đổi hình: thay file cùng tên (WebP/PNG nền trong suốt, cùng tỷ lệ) — vị trí/kích thước
// tương ứng nằm ở các hằng số CLUSTER, DROPS, BURST, STARS, WAVES bên dưới (toạ độ pixel trong ảnh gốc 1672×941).
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

// ---- Hình minh hoạ: tách từ ảnh gốc 1672×941 (cúp + cọ, vạch sáng, giọt sơn, ngôi sao, đường cong góc) ----
// Toạ độ là pixel trong ảnh gốc; cụm trung tâm (cúp + hai cây cọ) là mốc để đặt vạch sáng và giọt sơn theo phần trăm.
const ART_W = 1672;
const ART_H = 941;
const CLUSTER = { x: 496, y: 196, w: 679, h: 554 };
const pct = (v, total) => `${((v / total) * 100).toFixed(2)}%`;
const rel = (o) => ({ left: pct(o.x - CLUSTER.x, CLUSTER.w), top: pct(o.y - CLUSTER.y, CLUSTER.h), width: pct(o.w, CLUSTER.w) });
// (ox, oy) = độ lệch từ giữa cụm tới giọt, đơn vị cqw: giọt bay ra từ sau chiếc cúp tới đúng vị trí gốc.
const fly = (o) => ({
  '--ox': (((CLUSTER.x + CLUSTER.w / 2 - (o.x + o.w / 2)) / CLUSTER.w) * 100).toFixed(1),
  '--oy': (((CLUSTER.y + CLUSTER.h / 2 - (o.y + o.h / 2)) / CLUSTER.w) * 100).toFixed(1),
});
const DROPS = [
  { src: '/arena/drop-bl.webp', o: { x: 510, y: 608, w: 110, h: 72 }, d: 1000, r: -14 },
  { src: '/arena/drop-pr.webp', o: { x: 1102, y: 550, w: 112, h: 61 }, d: 1080, r: 12 },
  { src: '/arena/drop-yl.webp', o: { x: 424, y: 536, w: 128, h: 64 }, d: 1160, r: -10 },
  { src: '/arena/drop-yr.webp', o: { x: 1046, y: 610, w: 99, h: 74 }, d: 1240, r: 10 },
];
const BURST = { x: 735, y: 191, w: 200, h: 103 };
// Ngôi sao: (cx, cy) là tâm trong ảnh gốc, w là bề rộng, d là độ trễ xuất hiện (ms). `near` = ngôi sao sát chiếc cúp, đặt theo cụm cúp (đi cùng cụm khi co giãn).
const STARS = [
  { cx: 172.2, cy: 267.8, w: 61, src: '/arena/star-a.webp', d: 380 },
  { cx: 1474.0, cy: 115.5, w: 85, src: '/arena/star-b.webp', d: 520 },
  { cx: 503.7, cy: 437.6, w: 84, src: '/arena/star-a.webp', d: 640, near: true },
  { cx: 1166.9, cy: 409.3, w: 52, src: '/arena/star-b.webp', d: 700, near: true },
  { cx: 1239.8, cy: 484.8, w: 92, src: '/arena/star-a.webp', d: 820, near: true },
  { cx: 1498.4, cy: 603.5, w: 54, src: '/arena/star-b.webp', d: 940 },
  { cx: 247.9, cy: 697.8, w: 57, src: '/arena/star-a.webp', d: 1020 },
];
const WAVES = [
  { cls: 'at-wave-tl', src: '/arena/wave-tl.webp', w: 400, delay: 320 },
  { cls: 'at-wave-br', src: '/arena/wave-br.webp', w: 436, delay: 360 },
  { cls: 'at-wave-bl', src: '/arena/wave-bl.webp', w: 414, delay: 400 },
];

function Overlay({ lite, leaving }) {
  const far = STARS.filter((x) => !x.near);
  const near = STARS.filter((x) => x.near);
  const stars = lite ? far.slice(0, 3) : far;
  const drops = lite ? DROPS.slice(0, 2) : DROPS;
  return (
    <div className={`at-root${lite ? ' at-lite' : ''}${leaving ? ' at-leaving' : ''}`} data-testid="arena-transition" aria-hidden="true">
      <div className="at-bg" />
      <div className="at-rings">
        <span className="at-ring at-ring-3" />
        <span className="at-ring at-ring-2" />
        <span className="at-ring at-ring-1" />
      </div>
      {WAVES.map((w) => (
        <img key={w.cls} className={`at-wave ${w.cls}`} src={w.src} alt="" draggable="false" style={{ '--w': `${((w.w / ART_W) * 100).toFixed(2)}vw`, animationDelay: `${w.delay}ms` }} />
      ))}
      {stars.map((s, i) => (
        <img
          key={i}
          className="at-star"
          src={s.src}
          alt=""
          draggable="false"
          style={{ left: pct(s.cx, ART_W), top: pct(s.cy, ART_H), '--sw': `${((s.w / ART_W) * 100 * 1.08).toFixed(2)}vw`, '--d': `${s.d}ms`, '--tw': `${(i % 4) * 300}ms` }}
        />
      ))}
      <div className="at-stage">
        <div className="at-cluster">
          <span className="at-glow" />
          {!lite &&
            near.map((s, i) => (
              <img
                key={i}
                className="at-star at-star-near"
                src={s.src}
                alt=""
                draggable="false"
                style={{ ...rel({ x: s.cx - s.w / 2, y: s.cy - s.w / 2, w: s.w * 1.08 }), '--d': `${s.d}ms`, '--tw': `${(i % 4) * 300}ms` }}
              />
            ))}
          {drops.map((p, i) => (
            <img key={i} className="at-drop" src={p.src} alt="" draggable="false" style={{ ...rel(p.o), ...fly(p.o), '--r': `${p.r}deg`, '--d': `${p.d}ms` }} />
          ))}
          <div className="at-float">
            <div className="at-pop">
              <img className="at-cup" src={CUP_IMAGE} alt="" draggable="false" />
              <span className="at-shine" style={{ WebkitMaskImage: `url(${CUP_IMAGE})`, maskImage: `url(${CUP_IMAGE})` }} />
            </div>
            <img className="at-burst" src="/arena/burst.webp" alt="" draggable="false" style={rel(BURST)} />
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
