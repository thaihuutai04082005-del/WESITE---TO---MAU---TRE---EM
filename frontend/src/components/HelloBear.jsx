import { useEffect, useRef, useState } from 'react';
import { isSoundOn } from '../lib/sound';

const GREETING = 'Hello! What would you like to color today?';

/** Gấu họa sĩ ở trang chủ: luôn nhúc nhích nhẹ, chớp mắt, thỉnh thoảng giơ cọ, lâu lâu nói lời chào. */
export default function HelloBear({ className = '' }) {
  const [talking, setTalking] = useState(false);
  const timer = useRef(null);

  const speak = () => {
    setTalking(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setTalking(false), 5200);
    try {
      if (isSoundOn() && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(GREETING);
        u.lang = 'en-US';
        u.rate = 0.95;
        u.pitch = 1.3;
        window.speechSynthesis.speak(u);
      }
    } catch {
      /* trình duyệt không hỗ trợ giọng đọc thì chỉ hiện chữ */
    }
  };

  useEffect(() => {
    const first = setTimeout(speak, 6000);
    const loop = setInterval(speak, 32000);
    return () => {
      clearTimeout(first);
      clearInterval(loop);
      clearTimeout(timer.current);
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* bỏ qua */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Ảnh gốc được cắt thành lớp: thân, đầu (kèm mắt), tay cầm cọ, tay cầm bảng màu — để từng phần cử động riêng */}
      <div className="relative mx-auto h-full cursor-pointer" style={{ aspectRatio: '640 / 751' }} onClick={speak} role="img" aria-label="Bear painter">
        <div className="bear-sway absolute inset-0">
          <div className="bear-breathe absolute inset-0">
            <div className="bear-leg-l absolute inset-0">
              <img src="/mascots/hello-legL.webp" alt="" className="absolute inset-0 h-full w-full" draggable={false} />
            </div>
            <div className="bear-leg-r absolute inset-0">
              <img src="/mascots/hello-legR.webp" alt="" className="absolute inset-0 h-full w-full" draggable={false} />
            </div>
            <img src="/mascots/hello-base.webp" alt="" className="absolute inset-0 h-full w-full" draggable={false} />
            <div className="bear-head absolute inset-0">
              <img src="/mascots/hello-head.webp" alt="" className="absolute inset-0 h-full w-full" draggable={false} />
              <img src="/mascots/hello-eyes.webp" alt="" className="bear-eyes absolute inset-0 h-full w-full" draggable={false} />
            </div>
            <div className="bear-sway-l absolute inset-0">
              <img src="/mascots/hello-armL.webp" alt="" className="bear-arm-l absolute inset-0 h-full w-full" draggable={false} />
            </div>
            <div className="bear-sway-r absolute inset-0">
              <img src="/mascots/hello-armR.webp" alt="" className="absolute inset-0 h-full w-full" draggable={false} />
            </div>
          </div>
        </div>
      </div>
      {talking && (
        <div
          className="pointer-events-none absolute left-[85%] top-0 z-10 w-44 rounded-2xl border-2 border-ink/80 bg-white px-3 py-2 text-sm font-bold leading-snug text-ink shadow-lg sm:w-56 sm:text-base"
          role="status"
        >
          {GREETING}
          <span className="absolute -left-2 bottom-3 h-3 w-3 rotate-45 border-b-2 border-l-2 border-ink/80 bg-white" />
        </div>
      )}
    </div>
  );
}
