// Hiệu ứng chuyển màn hình riêng cho Truyện tranh: quyển sách vàng đóng kín trồi lên, tự mở ra hai trang phong cảnh (cây, mây, lâu đài mái đỏ),
// chú gấu nâu bật lên từ khe giữa hai trang, rồi hai khung truyện (phong cảnh + thỏ trắng) nảy lên hai bên, và vào đúng trang Truyện tranh thật.
//
// Cách chạy (giống ArenaTransition / GachaTransition):
//  1. Bé bấm vào liên kết /storybooks (thẻ trên trang chủ hoặc nút trên thanh menu) → chặn điều hướng, thu thẻ nhẹ về 96%,
//     dựng lớp phủ toàn màn hình (position: fixed) và phát tiếng ting.
//  2. Lớp phủ tự chạy bằng CSS (keyframes trong index.css, tiền tố `sb-`). Toàn bộ cảnh dài 3 giây:
//       0,0–0,4  sách đóng kín trồi lên từ dưới, nhún nhẹ        | 0,4–1,2  bìa gập về gáy, sách mở bung ra hai trang phong cảnh
//       1,2–1,8  gấu bật lên từ khe giữa hai trang (thân dưới bị trang sách che)
//       1,8–2,4  khung phong cảnh (trái) rồi khung thỏ (phải, trễ 0,1s) nảy ra từ sau trang sách, chếch lên hai bên
//       2,4–3,0  gấu nhún lần cuối, mọi thứ giảm dần rồi đứng yên (khung hình cuối = ảnh tham chiếu)
//  3. Tới mốc NAVIGATE_MS: chuyển sang trang Truyện tranh NGAY DƯỚI lớp phủ để trang tự tải dữ liệu.
//  4. Lớp phủ chỉ mờ đi khi đã đủ MIN_MS VÀ trang đích báo sẵn sàng (sự kiện `btm:page-ready`) — có trần MAX_WAIT_MS
//     để không bao giờ bị kẹt. Nội dung trang đích bay lên nhẹ lần lượt (html[data-arena-enter]), rồi lớp phủ được gỡ.
// Hình minh hoạ nằm trong /public/story3/ (tách từ ảnh tham chiếu 1672×941): bg.webp (nền vàng pastel + sóng góc + vòng tròn sáng, đã xoá chủ thể),
// closed (sách đóng), book (sách mở, KHÔNG có gấu), bear, frameL, frameR, cmask (mặt nạ: nơi gấu được phép hiện — ngoài mặt trang sách, phía trên khe chữ V).
// Gấu nằm TRÊN sách nhưng bị cắt bởi cmask nên trang sách che thân dưới của gấu khi gấu còn thấp. Toạ độ (x, y, w, h) nằm ở hằng số SPR (pixel ảnh gốc).
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playTing } from '../../lib/sound';
import { transitionBus } from '../../lib/transitionBus';

const NAVIGATE_MS = 2100;   // chuyển sang trang Truyện tranh (đang nằm dưới lớp phủ)
const MIN_MS = 3000;        // tối thiểu trước khi lớp phủ mờ đi: cảnh 3 giây, mọi thứ đã đứng yên
const MAX_WAIT_MS = 8000;   // trần chờ trang đích tải xong
const FADE_MS = 350;        // lớp phủ mờ dần
const ENTER_MS = 1000;      // thời gian giữ hiệu ứng "nội dung bay lên" của trang đích

const isStory = (p) => p === '/storybooks';
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const weakDevice = () => typeof navigator !== 'undefined' && ((navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2);

// ---- Toạ độ pixel trong ảnh gốc 1672×941 ----
const FW = 1672;
const FH = 941;
const SPR = {
  closed: { x: 496, y: 166, w: 679, h: 673 },
  book: { x: 277, y: 428, w: 1119, h: 432 },
  bear: { x: 625, y: 219, w: 426, h: 437 },
  frameL: { x: 323, y: 107, w: 347, h: 309 },
  frameR: { x: 1107, y: 173, w: 334, h: 287 },
};
const at = (k) => ({ left: `${((SPR[k].x / FW) * 100).toFixed(3)}%`, top: `${((SPR[k].y / FH) * 100).toFixed(3)}%`, width: `${((SPR[k].w / FW) * 100).toFixed(3)}%` });

function Overlay({ lite, leaving }) {
  const img = (k, cls, style = {}) => <img className={cls} src={`/story3/${k}.webp`} alt="" draggable="false" style={{ ...at(k), ...style }} />;
  return (
    <div className={`sb-root${lite ? ' sb-lite' : ''}${leaving ? ' sb-leaving' : ''}`} data-testid="storybook-transition" aria-hidden="true">
      <div className="sb-bg" />
      <div className="sb-frame">
        <span className="sb-floor" />
        {img('frameL', 'sb-pop sb-pop-l')}
        {img('frameR', 'sb-pop sb-pop-r')}
        {img('closed', 'sb-closed')}
        <div className="sb-open">{img('book', 'sb-book')}</div>
        <div className="sb-bearmask">{img('bear', 'sb-bear')}</div>
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
