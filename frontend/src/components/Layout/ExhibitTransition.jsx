// Hiệu ứng mở rèm sân khấu khi vào Hội trường triển lãm: tấm rèm xanh viền vàng đóng kín cả màn hình, hai cánh rèm tách ra từ giữa
// và trượt sang hai bên để lộ hội trường (chính là trang Hội trường thật nằm sẵn phía sau, không bay vào hay mờ dần).
//
// Cách chạy:
//  1. Bé bấm vào liên kết /exhibition (ô trên trang chủ hoặc menu) → chặn điều hướng, thu thẻ nhẹ về 96%, dựng lớp phủ (rèm đóng kín), phát tiếng ting.
//  2. Sau NAVIGATE_MS chuyển sang trang Hội trường NGAY DƯỚI tấm rèm để trang tự tải dữ liệu.
//  3. Rèm chỉ bắt đầu mở khi đã đủ CLOSED_MS (rèm đứng yên chờ) VÀ trang đích báo sẵn sàng (sự kiện `btm:page-ready`),
//     có trần MAX_WAIT_MS để không bao giờ bị kẹt. Rèm mở 2 giây: 0,0–0,6 chậm (hé khe), 0,6–1,5 kéo rộng, 1,5–2,0 dừng nảy nhẹ.
//  4. Rèm dừng ở hai mép (còn một dải nhỏ có dây buộc + tua vàng) HOLD_MS rồi lớp phủ gỡ đi.
// Hình rèm trong /public/curtain/ (left.webp, right.webp: nửa trái và nửa phải của một ảnh 1672×941, nền trong suốt ở dưới gấu rèm).
// Đổi hình: thay hai file cùng tên (WebP nền trong suốt, cùng tỷ lệ, cắt ở đường nối giữa).
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playTing } from '../../lib/sound';
import { transitionBus } from '../../lib/transitionBus';

const NAVIGATE_MS = 300;    // chuyển sang trang Hội trường (đang nằm dưới rèm)
const CLOSED_MS = 400;      // rèm đóng kín đứng yên trước khi mở
const OPEN_MS = 2000;       // thời gian kéo rèm (phải khớp `sb-curtain` trong index.css)
const HOLD_MS = 600;        // giữ khung hình cuối trước khi gỡ lớp phủ
const FADE_MS = 300;        // lớp phủ (chỉ còn dải rèm ở mép) mờ đi
const MAX_WAIT_MS = 8000;   // trần chờ trang đích tải xong

const isHall = (p) => p === '/exhibition';
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function ExhibitTransition() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(null); // null | 'closed' | 'open' | 'leave'
  const busy = useRef(false);
  const timers = useRef([]);

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      transitionBus.skipRainbow = false;
    },
    [],
  );

  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || !isHall(url.pathname)) return;
      if (isHall(window.location.pathname) || busy.current || reduceMotion()) return;
      e.preventDefault();
      busy.current = true;
      transitionBus.skipRainbow = true;
      const dest = url.pathname + url.search + url.hash;
      const st = { navigated: false, ready: false, minDone: false, opened: false };

      // Thẻ được bấm thu nhẹ xuống 96% rồi trở về.
      const card = a.parentElement || a;
      card.animate?.([{ transform: 'scale(1)' }, { transform: 'scale(0.96)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 260, easing: 'ease-out' });

      setPhase('closed');
      playTing();

      const open = () => {
        if (st.opened) return;
        st.opened = true;
        setPhase('open');
        later(() => {
          setPhase('leave');
          later(() => {
            setPhase(null);
            busy.current = false;
            transitionBus.skipRainbow = false;
          }, FADE_MS);
        }, OPEN_MS + HOLD_MS);
      };
      const tryOpen = () => {
        if (st.navigated && st.minDone && st.ready) open();
      };
      const onReady = () => {
        if (!st.navigated) return;           // tín hiệu của trang khác
        st.ready = true;
        tryOpen();
      };
      window.addEventListener('btm:page-ready', onReady);
      later(() => window.removeEventListener('btm:page-ready', onReady), MAX_WAIT_MS + 1000);

      later(() => {
        st.navigated = true;
        navigate(dest);
      }, NAVIGATE_MS);
      later(() => {
        st.minDone = true;
        tryOpen();
      }, CLOSED_MS);
      later(() => {
        st.ready = true;                      // trần chờ: không để rèm đóng mãi
        st.minDone = true;
        if (st.navigated) open();
      }, MAX_WAIT_MS);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [navigate]);

  // Khoá cuộn trang trong lúc kéo rèm.
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
  return (
    <div className={`sb-curtain-root${phase === 'open' ? ' sb-curtain-open' : ''}${phase === 'leave' ? ' sb-curtain-open sb-curtain-leave' : ''}`} data-testid="exhibit-transition" aria-hidden="true">
      <div className="sb-curtain sb-curtain-l">
        <img src="/curtain/left.webp" alt="" draggable="false" />
      </div>
      <div className="sb-curtain sb-curtain-r">
        <img src="/curtain/right.webp" alt="" draggable="false" />
      </div>
    </div>
  );
}
