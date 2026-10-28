// Hiệu ứng chuyển màn hình riêng cho Tô cùng nhau: mèo cam, gấu nâu, thỏ trắng cầm bút sáp quanh tờ giấy có cầu vồng chưa tô;
// ba dải màu đỏ, vàng, xanh dương cùng chạy một lượt dọc theo đường cong từ trái sang phải, rồi cả ba nhún vui mừng và vào đúng trang Tô cùng nhau thật.
//
// Cách chạy (giống ArenaTransition / GachaTransition / StoryTransition):
//  1. Bé bấm vào liên kết /together → chặn điều hướng, thu thẻ nhẹ về 96%, dựng lớp phủ toàn màn hình (position: fixed), phát tiếng ting.
//  2. Lớp phủ tự chạy bằng CSS (keyframes trong index.css, tiền tố `tg-`). Toàn bộ cảnh dài 3 giây:
//       0,0–0,5  ba bạn nhún nhẹ một lần, bút nghiêng về phía cầu vồng
//       0,6–1,7  CẢ BA dải màu (đỏ ngoài cùng, vàng giữa, xanh dương trong cùng) chạy MỘT LƯỢT từ trái sang phải theo đường cong; ba bạn nghiêng người tô
//       1,7–2,1  cầu vồng tô xong, ba bạn nhún mừng một lần
//       2,1–2,6  cả ba nhún thêm lần nữa (mèo nghiêng đầu phải, thỏ nghiêng trái), tờ giấy nảy nhẹ
//       2,6–3,0  mọi thứ dừng dần; khung hình cuối = ảnh tham chiếu với cầu vồng đã tô đủ ba màu
//  3. Tới mốc NAVIGATE_MS: chuyển sang trang Tô cùng nhau NGAY DƯỚI lớp phủ để trang tự tải.
//  4. Lớp phủ chỉ mờ đi khi đã đủ MIN_MS VÀ trang đích báo sẵn sàng (sự kiện `btm:page-ready`) — có trần MAX_WAIT_MS
//     để không bao giờ bị kẹt. Nội dung trang đích bay lên nhẹ lần lượt (html[data-arena-enter]), rồi lớp phủ được gỡ.
// Hình minh hoạ nằm trong /public/together/ (tách từ ảnh tham chiếu 1672×941): bg (nền + giấy, đã xoá ba bạn), paper (tờ giấy riêng để nảy),
// band-red / band-yellow / band-blue (ba dải màu, có sẵn viền đậm), cat / bear / rabbit (từng bạn kèm bút sáp). Toạ độ (x, y, w, h) nằm ở hằng số SPR (pixel ảnh gốc).
// Dải màu lộ ra bằng clip-path hình quạt quay quanh tâm cầu vồng (835, 823) nên đầu màu luôn vuông góc với dải và chạy đúng theo đường cong.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playTing } from '../../lib/sound';
import { transitionBus } from '../../lib/transitionBus';

const NAVIGATE_MS = 2000;   // chuyển sang trang Tô cùng nhau (đang nằm dưới lớp phủ)
const MIN_MS = 3000;        // tối thiểu trước khi lớp phủ mờ đi: cảnh 3 giây, mọi thứ đã đứng yên
const MAX_WAIT_MS = 8000;   // trần chờ trang đích tải xong
const FADE_MS = 350;        // lớp phủ mờ dần
const ENTER_MS = 1000;      // thời gian giữ hiệu ứng "nội dung bay lên" của trang đích

const isTogether = (p) => p === '/together';
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const weakDevice = () => typeof navigator !== 'undefined' && ((navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2);

// ---- Toạ độ pixel trong ảnh gốc 1672×941 ----
const FW = 1672;
const FH = 941;
const SPR = {
  paper: { x: 416, y: 511, w: 825, h: 312 },
  'band-red': { x: 608, y: 568, w: 452, h: 119 },
  'band-yellow': { x: 647, y: 607, w: 373, h: 97 },
  'band-blue': { x: 692, y: 646, w: 284, h: 81 },
  cat: { x: 259, y: 238, w: 400, h: 441 },
  bear: { x: 667, y: 145, w: 395, h: 431 },
  rabbit: { x: 1029, y: 209, w: 377, h: 486 },
};
const at = (k) => ({ left: `${((SPR[k].x / FW) * 100).toFixed(3)}%`, top: `${((SPR[k].y / FH) * 100).toFixed(3)}%`, width: `${((SPR[k].w / FW) * 100).toFixed(3)}%` });

function Overlay({ lite, leaving }) {
  const img = (k, cls) => <img className={cls} src={`/together/${k}.webp`} alt="" draggable="false" style={at(k)} />;
  return (
    <div className={`tg-root${lite ? ' tg-lite' : ''}${leaving ? ' tg-leaving' : ''}`} data-testid="together-transition" aria-hidden="true">
      <div className="tg-frame">
        <img className="tg-bg" src="/together/bg.webp" alt="" draggable="false" />
        <div className="tg-paper">
          {img('paper', 'tg-paper-img')}
          <div className="tg-sweep">
            {img('band-red', 'tg-band')}
            {img('band-yellow', 'tg-band')}
            {img('band-blue', 'tg-band')}
          </div>
        </div>
        {img('cat', 'tg-char tg-cat')}
        {img('bear', 'tg-char tg-bear')}
        {img('rabbit', 'tg-char tg-rabbit')}
      </div>
    </div>
  );
}

export default function TogetherTransition() {
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

  // Bấm vào liên kết dẫn tới Tô cùng nhau.
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || !isTogether(url.pathname)) return;
      if (isTogether(window.location.pathname) || busy.current || reduceMotion()) return;
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
        if (!st.navigated) return;           // tín hiệu của trang khác, không phải trang Tô cùng nhau
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
