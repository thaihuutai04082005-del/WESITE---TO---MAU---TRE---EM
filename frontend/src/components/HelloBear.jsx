/**
 * Gấu họa sĩ ở trang chủ — giữ nguyên ảnh gấu gốc, tách thành các lớp (chân, thân, đầu, mắt, tay phải + bảng màu,
 * tay trái + cọ) bằng assets-library/mascot/build_hello_bear.py. Mỗi lớp được cắt theo đúng nét viền của bộ phận,
 * phần thân bị tay/đầu che đã được vẽ bù sạch sẽ, nên khi tay giơ lên chỉ lộ ra áo quần liền nét, không kéo theo quần.
 * Chuyển động bằng CSS transform (trình duyệt dựng mượt, ảnh thu nhỏ nét), hoạt ảnh trong index.css (tiền tố hb-).
 */
const W = 640;
const H = 751;

const Layer = ({ src }) => <img src={src} alt="" className="hb-img" draggable={false} decoding="async" />;

export default function HelloBear({ className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative mx-auto h-full" style={{ aspectRatio: `${W} / ${H}` }} role="img" aria-label="Bear painter">
        <div className="bear-sway absolute inset-0">
          <div className="bear-breathe absolute inset-0">
            <div className="hb-part hb-leg-l"><Layer src="/mascots/bear-leg-l.webp" /></div>
            <div className="hb-part hb-leg-r"><Layer src="/mascots/bear-leg-r.webp" /></div>
            <Layer src="/mascots/bear-body.webp" />
            <div className="hb-part hb-head">
              <div className="hb-part hb-bob">
                <Layer src="/mascots/bear-head.webp" />
                <div className="hb-part hb-blink"><Layer src="/mascots/bear-eyes.webp" /></div>
              </div>
            </div>
            <div className="hb-part hb-arm-r"><Layer src="/mascots/bear-arm-r.webp" /></div>
            <div className="hb-part hb-raise">
              <div className="hb-part hb-arm-l"><Layer src="/mascots/bear-arm-l.webp" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
