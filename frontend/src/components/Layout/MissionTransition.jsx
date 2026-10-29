// Hiệu ứng chuyển màn hình riêng cho Nhiệm vụ: bảng nhiệm vụ trượt lên, hai ô đầu lần lượt hoá xanh lá và được vẽ dấu tích trắng,
// rồi ngôi sao vàng cười bật ra bên phải bảng và nhún mừng; sau đó vào đúng trang Nhiệm vụ thật.
//
// Cách chạy (giống ArenaTransition / GachaTransition / StoryTransition / TogetherTransition):
//  1. Bé bấm vào liên kết /missions → chặn điều hướng, thu thẻ nhẹ về 96%, dựng lớp phủ toàn màn hình (position: fixed), phát tiếng ting.
//  2. Lớp phủ tự chạy bằng CSS (keyframes trong index.css, tiền tố `mi-`). Toàn bộ cảnh dài 3 giây:
//       0,0–0,5  bảng nhiệm vụ (ba ô trống) trượt từ dưới lên, nảy nhẹ một lần
//       0,5–1,0  ô 1 hoá xanh lá, dấu tích trắng được vẽ nét ngắn rồi nét dài, nảy rất nhẹ
//       1,0–1,5  ô 2 làm tương tự; bảng nhún nhẹ một lần; ô 3 vẫn trống
//       1,5–2,2  ngôi sao vàng bật ra chếch lên phải, 85% → 100%, nghiêng nhẹ rồi về thẳng
//       2,2–2,6  sao nhún một lần; bảng đứng yên
//       2,6–3,0  mọi thứ dừng hẳn; khung hình cuối = ảnh tham chiếu
//  3. Tới mốc NAVIGATE_MS: chuyển sang trang Nhiệm vụ NGAY DƯỚI lớp phủ để trang tự tải dữ liệu.
//  4. Lớp phủ chỉ mờ đi khi đã đủ MIN_MS VÀ trang đích báo sẵn sàng (sự kiện `btm:page-ready`) — có trần MAX_WAIT_MS
//     để không bao giờ bị kẹt. Nội dung trang đích bay lên nhẹ lần lượt (html[data-arena-enter]), rồi lớp phủ được gỡ.
// Hình minh hoạ nằm trong /public/mission/ (tách từ ảnh tham chiếu 1672×941): bg (nền, đã xoá bảng + sao + bóng đổ, vòng tròn sáng vẽ lại),
// board (bảng đủ cả phần bị sao che, ba ô TRỐNG), shadow-board (bóng đổ dưới bảng), ok1 / ok2 (nền xanh lá của ô), ck1a, ck1b, ck2a, ck2b (hai nét dấu tích trắng),
// star (không có bóng đổ dưới chân sao). Toạ độ (x, y, w, h) nằm ở hằng số SPR (pixel ảnh gốc). Dấu tích hiện bằng clip-path quét theo hướng từng nét (keyframes `mi-ck…`).
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playTing } from '../../lib/sound';
import { transitionBus } from '../../lib/transitionBus';
import { preloadImages } from '../../lib/preloadImages';

const NAVIGATE_MS = 2000;   // chuyển sang trang Nhiệm vụ (đang nằm dưới lớp phủ)
const MIN_MS = 3000;        // tối thiểu trước khi lớp phủ mờ đi: cảnh 3 giây, mọi thứ đã đứng yên
const MAX_WAIT_MS = 8000;   // trần chờ trang đích tải xong
const FADE_MS = 350;        // lớp phủ mờ dần
const ENTER_MS = 1000;      // thời gian giữ hiệu ứng "nội dung bay lên" của trang đích

const isMission = (p) => p === '/missions';
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const weakDevice = () => typeof navigator !== 'undefined' && ((navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2);

// ---- Toạ độ pixel trong ảnh gốc 1672×941 ----
const FW = 1672;
const FH = 941;
const SPR = {
  'shadow-board': { x: 444, y: 194, w: 692, h: 698 },
  'board': { x: 341, y: 67, w: 791, h: 812 },
  'ok1': { x: 477, y: 310, w: 139, h: 128 },
  'ck1a': { x: 494, y: 358, w: 48, h: 57 },
  'ck1b': { x: 532, y: 328, w: 63, h: 85 },
  'ok2': { x: 503, y: 466, w: 140, h: 129 },
  'ck2a': { x: 520, y: 517, w: 48, h: 54 },
  'ck2b': { x: 558, y: 486, w: 64, h: 85 },
  'star': { x: 871, y: 354, w: 537, h: 515 },
};
const at = (k) => ({ left: `${((SPR[k].x / FW) * 100).toFixed(3)}%`, top: `${((SPR[k].y / FH) * 100).toFixed(3)}%`, width: `${((SPR[k].w / FW) * 100).toFixed(3)}%` });

function Overlay({ lite, leaving }) {
  const img = (k, cls = '') => <img className={`mi-img ${cls}`} src={`/mission/${k}.webp?v=4`} alt="" draggable="false" style={at(k)} />;
  return (
    <div className={`mi-root${lite ? ' mi-lite' : ''}${leaving ? ' mi-leaving' : ''}`} data-testid="mission-transition" aria-hidden="true">
      <div className="mi-frame">
        <img className="mi-bg" src="/mission/bg.webp?v=4" alt="" draggable="false" />
        <div className="mi-board">
          {img('shadow-board')}
          {img('board')}
          {img('ok1', 'mi-ok mi-ok1')}
          <div className="mi-pop mi-pop1">
            {img('ck1a', 'mi-ck mi-ck1a')}
            {img('ck1b', 'mi-ck mi-ck1b')}
          </div>
          {img('ok2', 'mi-ok mi-ok2')}
          <div className="mi-pop mi-pop2">
            {img('ck2a', 'mi-ck mi-ck2a')}
            {img('ck2b', 'mi-ck mi-ck2b')}
          </div>
        </div>
        <div className="mi-star">
          {img('star')}
        </div>
      </div>
    </div>
  );
}

export default function MissionTransition() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(null); // null | 'run' | 'leave'
  const busy = useRef(false);
  const timers = useRef([]);
  const state = useRef({ navigated: false, ready: false, minDone: false, finished: false });
  const lite = useMemo(weakDevice, []);
  useEffect(() => preloadImages([`/mission/bg.webp?v=4`, ...Object.keys(SPR).map((k) => `/mission/${k}.webp?v=4`)]), []);

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

  // Bấm vào liên kết dẫn tới Nhiệm vụ.
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || !isMission(url.pathname)) return;
      if (isMission(window.location.pathname) || busy.current || reduceMotion()) return;
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
        if (!st.navigated) return;           // tín hiệu của trang khác, không phải trang Nhiệm vụ
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
