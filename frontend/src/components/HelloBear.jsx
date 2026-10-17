/** Gấu họa sĩ ở trang chủ: luôn nhúc nhích nhẹ, chớp mắt, thỉnh thoảng giơ cọ lên. */
export default function HelloBear({ className = '' }) {
  return (
    <div className={`relative ${className}`}>
      {/* Ảnh gốc được cắt thành lớp: thân, đầu (kèm mắt), tay cầm cọ, tay cầm bảng màu — để từng phần cử động riêng */}
      <div className="relative mx-auto h-full" style={{ aspectRatio: '640 / 751' }} role="img" aria-label="Bear painter">
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
