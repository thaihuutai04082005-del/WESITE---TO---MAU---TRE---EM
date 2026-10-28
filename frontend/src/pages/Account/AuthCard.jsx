// Khung đăng nhập / đăng ký / quên mật khẩu: nền cảnh trời xanh đồi cỏ như trang chủ, thẻ kem viền vàng, gấu cầm bút nhô lên ở trên.
// Trang đăng nhập (ngắn) tự thu phóng cho vừa đúng chiều cao màn hình — thấy trọn khung hình, không có thanh cuộn.
// Trang dài (đăng ký) giữ cỡ thật và cuộn bình thường khi thu phóng sẽ quá nhỏ.
import { useLayoutEffect, useRef } from 'react';

const MIN_SCALE = 0.6;

export default function AuthCard({ title, subtitle, children }) {
  const wrap = useRef(null);
  const bg = useRef(null);

  useLayoutEffect(() => {
    const w = wrap.current;
    const b = bg.current;
    if (!w || !b) return undefined;
    const fit = () => {
      w.style.zoom = '1';
      const header = document.querySelector('header')?.offsetHeight || 72;
      const avail = window.innerHeight - header - 2 - 56;   // trừ 2px viền, rồi chừa đều ~28px trên và dưới
      const need = w.offsetHeight;
      const s = Math.min(1, avail / need);
      if (s >= MIN_SCALE) {
        w.style.zoom = String(s);
        b.style.height = `${window.innerHeight - header - 2}px`;
        b.classList.add('auth-fit');
        document.documentElement.style.overflowY = 'hidden';   // vừa khít khung hình: không cần thanh cuộn
      } else {
        w.style.zoom = '1';
        b.style.height = '';
        b.classList.remove('auth-fit');
        document.documentElement.style.overflowY = '';
      }
    };
    fit();
    window.addEventListener('resize', fit);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    ro?.observe(w);
    return () => {
      window.removeEventListener('resize', fit);
      ro?.disconnect();
      document.documentElement.style.overflowY = '';
    };
  }, []);

  return (
    <div className="auth-bg" ref={bg}>
      <div className="auth-zoom" ref={wrap}>
        <div className="auth-card">
          <img src="/mascots/login-bear.webp" alt="" className="auth-bear" />
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-sub">{subtitle}</p>}
          <div className="auth-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
