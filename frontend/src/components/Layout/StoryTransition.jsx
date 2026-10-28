// Hiệu ứng chuyển màn hình riêng cho Truyện tranh: quyển sách vàng có ngôi sao đóng kín trồi lên, tự mở ra, chú gấu nâu bật lên
// từ giữa hai trang, bong bóng hội thoại hiện ra phía trên bên phải, rồi vào đúng trang Truyện tranh thật.
//
// Cách chạy (giống ArenaTransition / GachaTransition):
//  1. Bé bấm vào liên kết /storybooks (thẻ trên trang chủ hoặc nút trên thanh menu) → chặn điều hướng, thu thẻ nhẹ về 96%,
//     dựng lớp phủ toàn màn hình (position: fixed) và phát tiếng ting.
//  2. Lớp phủ tự chạy bằng CSS (keyframes trong index.css, tiền tố `sb-`). Toàn bộ cảnh dài khoảng 2,3 giây:
//       0,00–0,40  sách ĐÓNG kín trồi lên từ dưới, nảy nhẹ; bốn nét "bật" vàng cam hiện quanh sách
//       0,60–1,05  bìa sách lật mở: sách đóng gập về gáy, sách mở bung ra ở giữa; nét bật cũ tan đi
//       1,00–1,60  chú gấu bật lên từ giữa hai trang (thân dưới bị trang sách phía trước che), nét bật mới hiện
//       1,55–2,00  bong bóng hội thoại nảy ra ở phía trên bên phải gấu
//       2,00–2,30  gấu nhún, bong bóng lắc nhẹ rồi đứng yên (khung hình cuối = ảnh tham chiếu thứ ba)
//  3. Tới mốc NAVIGATE_MS: chuyển sang trang Truyện tranh NGAY DƯỚI lớp phủ để trang tự tải dữ liệu.
//  4. Lớp phủ chỉ mờ đi khi đã đủ MIN_MS VÀ trang đích báo sẵn sàng (sự kiện `btm:page-ready`) — có trần MAX_WAIT_MS
//     để không bao giờ bị kẹt. Nội dung trang đích bay lên nhẹ lần lượt (html[data-arena-enter]), rồi lớp phủ được gỡ.
// Hình minh hoạ nằm trong /public/story2/ (tách từ ba ảnh gốc 1673×940): bg.webp (nền vàng kem + sóng góc, đã xoá chủ thể),
// closed (sách đóng), a0–a3 (nét bật quanh sách đóng), bookback/bookfront (sách mở: phần sau và phần trước chú gấu), bear, bubble,
// b0–b3 (nét bật quanh gấu). Toạ độ (x, y, w, h) tính theo pixel trong ảnh gốc ở hằng số FRAME / SPR bên dưới.
// Đổi hình: thay file cùng tên (WebP nền trong suốt, cùng tỷ lệ) và cập nhật toạ độ ở SPR.
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

// ---- Toạ độ pixel trong ảnh gốc 1673×940 ----
const FW = 1673;
const FH = 940;
const SPR = {
  closed: { x: 496, y: 166, w: 679, h: 673 },
  bookback: { x: 455, y: 379, w: 807, h: 468 },
  bookfront: { x: 455, y: 379, w: 807, h: 468 },
  bear: { x: 566, y: 179, w: 509, h: 381 },
  bubble: { x: 982, y: 91, w: 319, h: 261 },
  a0: { x: 361, y: 465, w: 118, h: 72 },
  a1: { x: 360, y: 354, w: 129, h: 101 },
  a2: { x: 1114, y: 284, w: 99, h: 121 },
  a3: { x: 1157, y: 358, w: 125, h: 84 },
  b0: { x: 390, y: 374, w: 115, h: 69 },
  b1: { x: 429, y: 283, w: 106, h: 101 },
  b2: { x: 1194, y: 333, w: 102, h: 98 },
  b3: { x: 1221, y: 414, w: 110, h: 65 },
};
const at = (k) => ({ left: `${((SPR[k].x / FW) * 100).toFixed(3)}%`, top: `${((SPR[k].y / FH) * 100).toFixed(3)}%`, width: `${((SPR[k].w / FW) * 100).toFixed(3)}%` });
// Tâm nở của nét bật: bay ra từ giữa sách / giữa gấu (đơn vị cqw của khung).
const burst = (k, cx, cy) => ({
  '--ox': ((((cx - (SPR[k].x + SPR[k].w / 2)) / FW) * 100)).toFixed(2),
  '--oy': ((((cy - (SPR[k].y + SPR[k].h / 2)) / FW) * 100)).toFixed(2),
});
const A_SPARKS = [
  { k: 'a1', d: 300 },
  { k: 'a0', d: 340 },
  { k: 'a2', d: 380 },
  { k: 'a3', d: 420 },
];
const B_SPARKS = [
  { k: 'b1', d: 1180 },
  { k: 'b0', d: 1220 },
  { k: 'b2', d: 1260 },
  { k: 'b3', d: 1300 },
];

function Overlay({ lite, leaving }) {
  const img = (k, cls, style = {}) => <img key={k} className={cls} src={`/story2/${k}.webp`} alt="" draggable="false" style={{ ...at(k), ...style }} />;
  return (
    <div className={`sb-root${lite ? ' sb-lite' : ''}${leaving ? ' sb-leaving' : ''}`} data-testid="storybook-transition" aria-hidden="true">
      <div className="sb-bg" />
      <div className="sb-frame">
        <span className="sb-floor" />
        {A_SPARKS.map(({ k, d }) => img(k, 'sb-spark sb-spark-a', { '--d': `${d}ms`, ...burst(k, 835, 500) }))}
        <img className="sb-closed" src="/story2/closed.webp" alt="" draggable="false" style={at('closed')} />
        <div className="sb-open">
          {img('bookback', 'sb-layer')}
          <div className="sb-bear-wrap" style={{ left: 0, top: 0, width: '100%', height: '100%' }}>
            {img('bear', 'sb-bear')}
          </div>
          {img('bookfront', 'sb-layer sb-front')}
        </div>
        {!lite && B_SPARKS.map(({ k, d }) => img(k, 'sb-spark sb-spark-b', { '--d': `${d}ms`, ...burst(k, 830, 430) }))}
        {img('bubble', 'sb-bubble')}
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
