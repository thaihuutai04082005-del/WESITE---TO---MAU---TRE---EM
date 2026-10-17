import { useEffect, useRef } from 'react';
import { isSoundOn } from '../lib/sound';

const VOICE_URL = '/sounds/xin-chao.mp3';

/** Gấu họa sĩ ở trang chủ: luôn nhúc nhích nhẹ, chớp mắt, thỉnh thoảng giơ cọ và chào bằng giọng nói (không hiện chữ). */
export default function HelloBear({ className = '' }) {
  const voice = useRef(null);

  const speak = () => {
    try {
      if (!isSoundOn()) return;
      if (!voice.current) voice.current = new Audio(VOICE_URL);
      const a = voice.current;
      if (!a.paused) return;
      a.currentTime = 0;
      // Trình duyệt chặn tiếng tự phát khi bé chưa chạm vào trang: lần này bỏ qua, lần chào sau sẽ kêu
      a.play().catch(() => {});
    } catch {
      /* bỏ qua */
    }
  };

  useEffect(() => {
    const first = setTimeout(speak, 6000);
    const loop = setInterval(speak, 45000);
    return () => {
      clearTimeout(first);
      clearInterval(loop);
      voice.current?.pause();
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
    </div>
  );
}
