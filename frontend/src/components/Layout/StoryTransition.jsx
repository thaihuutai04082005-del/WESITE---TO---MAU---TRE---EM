// Hiệu ứng chuyển màn hình riêng cho Truyện tranh: quyển sách vàng cam MỞ SẴN ở giữa màn hình nhún hai nhịp rồi "bung" phép màu:
// giọt màu, hình tròn vàng và hai ngôi sao nhỏ bay ra từ khe giữa hai trang, kế đó hai bong bóng thoại (xanh, hồng) bật lên phía trên sách;
// sau đó vào đúng trang Truyện tranh thật.
//
// Cách chạy (giống ArenaTransition / GachaTransition / TogetherTransition / MissionTransition):
//  1. Bé bấm vào liên kết /storybooks (thẻ trên trang chủ hoặc nút trên thanh menu) → chặn điều hướng, thu thẻ nhẹ về 96%,
//     dựng lớp phủ toàn màn hình (position: fixed) và phát tiếng ting.
//  2. Lớp phủ tự chạy bằng CSS (keyframes trong index.css, tiền tố `sb-`). Toàn bộ cảnh dài 3 giây:
//       0,0–0,4  sách mở sẵn, đứng yên                      | 0,4–1,0  sách nhún hai nhịp (nhịp sau sâu hơn, nén xuống như tích năng lượng)
//       0,8–1,6  đúng lúc sách bật NHÚN LÊN (nhịp nhún sâu vừa nhả): TẤT CẢ cùng văng ra một lúc, một chuyển động liền mạch (không khựng) từ khe giữa hai trang theo đường cong, toả sang hai bên: giọt màu xanh/hồng, hình tròn vàng,
//                hai ngôi sao và hai bong bóng thoại (xanh trái, hồng phải; 65% → 105% → 100%, xoay nhẹ 5°)
//       2,1–2,6  mọi thứ nhún nhẹ rồi ổn định; sách đứng yên      | 2,6–3,0  giữ khung hình cuối = ảnh tham chiếu, không lặp lại
//  3. Tới mốc NAVIGATE_MS: chuyển sang trang Truyện tranh NGAY DƯỚI lớp phủ để trang tự tải dữ liệu.
//  4. Lớp phủ chỉ mờ đi khi đã đủ MIN_MS VÀ trang đích báo sẵn sàng (sự kiện `btm:page-ready`) — có trần MAX_WAIT_MS
//     để không bao giờ bị kẹt. Nội dung trang đích bay lên nhẹ lần lượt (html[data-arena-enter]), rồi lớp phủ được gỡ.
// Hình minh hoạ nằm trong /public/story4/ (tách từ ảnh tham chiếu 1672×941): bg (nền + vòng tròn sáng đã vẽ lại, không có sách/bong bóng/giọt/sao),
// book (sách) + bookshadow (bóng đổ mềm dưới sách, tách riêng), bubL / bubR (bong bóng), drop1 / drop2 / dropP (giọt màu), dot (hình tròn vàng), starL / starR (ngôi sao).
// Các chi tiết nằm DƯỚI sách nên lúc mới bay ra chúng ẩn sau trang sách, rồi nhô lên khỏi mép sách. Toạ độ (x, y, w, h) nằm ở hằng số SPR (pixel ảnh gốc).
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playTing } from '../../lib/sound';
import { transitionBus } from '../../lib/transitionBus';
import { preloadImages } from '../../lib/preloadImages';

const NAVIGATE_MS = 2000;   // chuyển sang trang Truyện tranh (đang nằm dưới lớp phủ)
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
  bubL: { x: 440, y: 177, w: 270, h: 201 },
  bubR: { x: 944, y: 196, w: 250, h: 193 },
  drop1: { x: 350, y: 240, w: 84, h: 92 },
  drop2: { x: 366, y: 342, w: 78, h: 56 },
  dropP: { x: 1205, y: 261, w: 82, h: 82 },
  dot: { x: 715, y: 289, w: 70, h: 70 },
  starL: { x: 309, y: 451, w: 112, h: 112 },
  starR: { x: 1231, y: 343, w: 119, h: 118 },
  bookshadow: { x: 315, y: 388, w: 1066, h: 466 },
  book: { x: 315, y: 389, w: 1050, h: 459 },
};
const at = (k) => ({ left: `${((SPR[k].x / FW) * 100).toFixed(3)}%`, top: `${((SPR[k].y / FH) * 100).toFixed(3)}%`, width: `${((SPR[k].w / FW) * 100).toFixed(3)}%` });

function Overlay({ lite, leaving }) {
  const img = (k) => <img className={`sb-img sb-${k}`} src={`/story4/${k}.webp`} alt="" draggable="false" style={at(k)} />;
  return (
    <div className={`sb-root${lite ? ' sb-lite' : ''}${leaving ? ' sb-leaving' : ''}`} data-testid="storybook-transition" aria-hidden="true">
      <div className="sb-frame">
        <img className="sb-bg" src="/story4/bg.webp" alt="" draggable="false" />
        {img('drop1')}
        {img('drop2')}
        {img('dropP')}
        {img('dot')}
        {img('starL')}
        {img('starR')}
        {img('bubL')}
        {img('bubR')}
        <div className="sb-bookgroup">
          {img('bookshadow')}
          {img('book')}
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
  useEffect(() => preloadImages([`/story4/bg.webp`, ...Object.keys(SPR).map((k) => `/story4/${k}.webp`)]), []);

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
