// Hiệu ứng chuyển màn hình riêng cho Truyện tranh: quyển sách vàng đóng kín trồi lên, nằm xuống rồi tự mở, chú gấu nâu bật lên
// từ giữa hai trang, bong bóng hội thoại có trái tim hồng hiện ra bên phải, rồi vào đúng trang Truyện tranh thật.
//
// Cách chạy (giống ArenaTransition / GachaTransition):
//  1. Bé bấm vào liên kết /storybooks (thẻ trên trang chủ hoặc nút trên thanh menu) → chặn điều hướng, thu thẻ nhẹ về 96%,
//     dựng lớp phủ toàn màn hình (position: fixed) và phát tiếng ting.
//  2. Lớp phủ tự chạy bằng CSS (keyframes trong index.css, tiền tố `sb-`). Toàn bộ cảnh dài khoảng 2,3 giây:
//       0,00–0,38  sách ĐÓNG kín trồi lên từ dưới, nảy nhẹ; nét trang trí vàng cam hiện quanh sách
//       0,38–0,62  sách nằm xuống (xoay thẳng, dẹt lại)    | 0,62–1,00  bìa sách lật mở sang trái, hai trang xòe ra cân đối
//       1,00–1,55  chú gấu bật lên từ khe giữa hai trang (thân dưới bị trang sách phía trước che)
//       1,55–1,95  bong bóng hội thoại nảy ra, trái tim hồng hiện trễ 0,1 giây | 1,95–2,25  gấu nhún, bong bóng lắc nhẹ, tim đập
//  3. Tới mốc NAVIGATE_MS: chuyển sang trang Truyện tranh NGAY DƯỚI lớp phủ để trang tự tải dữ liệu.
//  4. Lớp phủ chỉ mờ đi khi đã đủ MIN_MS VÀ trang đích báo sẵn sàng (sự kiện `btm:page-ready`) — có trần MAX_WAIT_MS
//     để không bao giờ bị kẹt. Nội dung trang đích bay lên nhẹ lần lượt (html[data-arena-enter]), rồi lớp phủ được gỡ.
// Hình minh hoạ nằm trong /public/story/ (tách từ hai ảnh gốc 1673×940): bg.webp (nền + đường cong góc), closed.webp (sách đóng),
// bookback/bookfront.webp (sách mở: phần sau và phần trước chú gấu), bear.webp, bubble.webp, heart.webp, tA*/tB* (nét trang trí).
// Đổi hình: thay file cùng tên (WebP/PNG nền trong suốt, cùng tỷ lệ); vị trí/kích thước nằm ở các hằng số bên dưới (pixel trong ảnh gốc).
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playTing } from '../../lib/sound';
import { transitionBus } from '../../lib/transitionBus';

const NAVIGATE_MS = 1700;   // chuyển sang trang Truyện tranh (đang nằm dưới lớp phủ)
const MIN_MS = 2300;        // tối thiểu trước khi lớp phủ mờ đi: gấu và bong bóng đã đứng yên
const MAX_WAIT_MS = 8000;   // trần chờ trang đích tải xong
const FADE_MS = 350;        // lớp phủ mờ dần
const ENTER_MS = 1000;      // thời gian giữ hiệu ứng "nội dung bay lên" của trang đích

const isStory = (p) => p === '/storybooks';
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const weakDevice = () => typeof navigator !== 'undefined' && ((navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2);

// ---- Toạ độ pixel trong ảnh gốc 1673×940. Cụm trung tâm đặt theo phần trăm của CLUSTER (co giãn theo màn hình). ----
// Ảnh "sách mở" gốc là ảnh khác (836 rộng); OPEN_DX dịch nó về giữa khung 16:9 để gáy sách trùng trục giữa.
const OPEN_DX = 418;
const CLUSTER = { x: 340, y: 140, w: 1000, h: 710 };
const pct = (v, total) => `${((v / total) * 100).toFixed(3)}%`;
const rel = (o) => ({ left: pct(o.x - CLUSTER.x, CLUSTER.w), top: pct(o.y - CLUSTER.y, CLUSTER.h), width: pct(o.w, CLUSTER.w) });
const relBox = (o) => ({ ...rel(o), height: pct(o.h, CLUSTER.h) });
const cq = (v) => ((v / CLUSTER.w) * 100).toFixed(2); // pixel ảnh gốc → cqw (đơn vị theo bề rộng cụm)
const open = (o) => ({ ...o, x: o.x + OPEN_DX });

const CLOSED = { x: 495, y: 172, w: 696, h: 668 };
const SPINE = { x: 838, y: 692 };                       // trục gáy sách khi mở (tâm xoay của bìa)
const BOOK_BACK = open({ x: 150, y: 570, w: 541, h: 133 });
const BOOK_FRONT = open({ x: 87, y: 612, w: 678, h: 227 });
const BEAR = open({ x: 167, y: 310, w: 412, h: 348 });
const BUBBLE = open({ x: 464, y: 150, w: 297, h: 255 });
const HEART = open({ x: 545, y: 213, w: 142, h: 123 });
const BEAR_CENTER = { x: 395 + OPEN_DX, y: 450 };
// Nét trang trí vàng cam: nhóm A quanh sách đóng, nhóm B quanh chú gấu (d = độ trễ, ms).
const TICKS_A = [
  { src: '/story/tA3.webp', o: { x: 363, y: 359, w: 126, h: 98 }, d: 150 },
  { src: '/story/tA4.webp', o: { x: 364, y: 472, w: 117, h: 71 }, d: 190 },
  { src: '/story/tA1.webp', o: { x: 1131, y: 254, w: 102, h: 121 }, d: 230 },
  { src: '/story/tA2.webp', o: { x: 1177, y: 335, w: 130, h: 80 }, d: 270 },
];
const TICKS_B = [
  { src: '/story/tB2.webp', o: open({ x: 227, y: 283, w: 68, h: 65 }), d: 1060 },
  { src: '/story/tB1.webp', o: open({ x: 289, y: 237, w: 53, h: 88 }), d: 1090 },
  { src: '/story/tB5.webp', o: open({ x: 101, y: 483, w: 81, h: 58 }), d: 1120 },
  { src: '/story/tB3.webp', o: open({ x: 583, y: 399, w: 64, h: 79 }), d: 1150 },
  { src: '/story/tB4.webp', o: open({ x: 611, y: 456, w: 74, h: 53 }), d: 1180 },
];

function Overlay({ lite, leaving }) {
  const ticksB = lite ? TICKS_B.slice(0, 3) : TICKS_B;
  const backP = ((SPINE.x - BOOK_BACK.x) / BOOK_BACK.w) * 100;
  const frontP = ((SPINE.x - BOOK_FRONT.x) / BOOK_FRONT.w) * 100;
  const half = (p, side) => (side === 'l' ? { clipPath: `inset(0 ${(100 - p).toFixed(2)}% 0 0)` } : { clipPath: `inset(0 0 0 ${(p - 0.15).toFixed(2)}%)` });
  const swingOrigin = { transformOrigin: `${(((SPINE.x - CLUSTER.x) / CLUSTER.w) * 100).toFixed(2)}% ${(((SPINE.y - CLUSTER.y) / CLUSTER.h) * 100).toFixed(2)}%` };
  return (
    <div className={`sb-root${lite ? ' sb-lite' : ''}${leaving ? ' sb-leaving' : ''}`} data-testid="storybook-transition" aria-hidden="true">
      <div className="sb-bg" />
      <span className="sb-ring sb-ring-2" />
      <span className="sb-ring sb-ring-1" />
      <div className="sb-stage">
        <div className="sb-cluster">
          <span className="sb-floor" />
          {TICKS_A.map((t, i) => (
            <img key={i} className="sb-tick-a" src={t.src} alt="" draggable="false" style={{ ...rel(t.o), '--d': `${t.d}ms`, '--ox': cq(843 - (t.o.x + t.o.w / 2)), '--oy': cq(500 - (t.o.y + t.o.h / 2)) }} />
          ))}
          {/* Sách mở (ẩn tới lúc bìa lật): phần sau → gấu → phần trước. Nửa trái xoay vào từ gáy sau khi bìa lật tới mép. */}
          <img className="sb-show sb-half" src="/story/bookback.webp" alt="" draggable="false" style={{ ...relBox(BOOK_BACK), ...half(backP, 'r') }} />
          <div className="sb-flip" style={swingOrigin}>
            <img className="sb-half" src="/story/bookback.webp" alt="" draggable="false" style={{ ...relBox(BOOK_BACK), ...half(backP, 'l') }} />
          </div>
          <div className="sb-bearclip">
            <img className="sb-bear" src="/story/bear.webp" alt="" draggable="false" style={relBox(BEAR)} />
          </div>
          <img className="sb-show sb-half" src="/story/bookfront.webp" alt="" draggable="false" style={{ ...relBox(BOOK_FRONT), ...half(frontP, 'r') }} />
          <div className="sb-flip" style={swingOrigin}>
            <img className="sb-half" src="/story/bookfront.webp" alt="" draggable="false" style={{ ...relBox(BOOK_FRONT), ...half(frontP, 'l') }} />
          </div>
          {/* Sách đóng: trồi lên, nằm xuống rồi bìa lật quanh gáy. */}
          <div className="sb-swing" style={swingOrigin}>
            <img className="sb-closed" src="/story/closed.webp" alt="" draggable="false" style={relBox(CLOSED)} />
          </div>
          {ticksB.map((t, i) => (
            <img
              key={i}
              className="sb-tick-b"
              src={t.src}
              alt=""
              draggable="false"
              style={{ ...rel(t.o), '--d': `${t.d}ms`, '--ox': cq(BEAR_CENTER.x - (t.o.x + t.o.w / 2)), '--oy': cq(BEAR_CENTER.y - (t.o.y + t.o.h / 2)) }}
            />
          ))}
          <img className="sb-bubble" src="/story/bubble.webp" alt="" draggable="false" style={relBox(BUBBLE)} />
          <img className="sb-heart" src="/story/heart.webp" alt="" draggable="false" style={relBox(HEART)} />
        </div>
      </div>
    </div>
  );
}

export default function StoryTransition() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(null); // null | 'run' | 'leave'
  const busy = useRef(false);
  const timers = useRef([]);
  const state = useRef({ navigated: false, ready: false, minDone: false, finished: false });
  const lite = useMemo(weakDevice, []);

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

  // Bấm vào liên kết dẫn tới Truyện tranh.
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || !isStory(url.pathname)) return;
      if (isStory(window.location.pathname) || busy.current || reduceMotion()) return;
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
        if (!st.navigated) return;           // tín hiệu của trang khác, không phải trang Truyện tranh
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
