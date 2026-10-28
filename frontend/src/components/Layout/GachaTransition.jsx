// Hiệu ứng chuyển màn hình riêng cho Bóc thẻ: hộp quà tím trồi lên, rung hai nhịp, bật nắp, ba thẻ bí ẩn bay ra
// (hồng – xanh – vàng ngôi sao), sơn màu và ngôi sao bung quanh, rồi vào đúng trang Bóc thẻ thật.
//
// Cách chạy (giống ArenaTransition):
//  1. Bé bấm vào liên kết /gacha (thẻ trên trang chủ hoặc nút trên thanh menu) → chặn điều hướng, thu thẻ nhẹ về 96%,
//     dựng lớp phủ toàn màn hình (position: fixed) và phát tiếng ting.
//  2. Lớp phủ tự chạy bằng CSS (keyframes trong index.css, tiền tố `gt-`). Toàn bộ cảnh dài 2,5 giây:
//       0,00–0,38  hộp quà ĐÓNG kín trồi lên từ dưới, nảy nhẹ   | 0,38–0,80  hộp rung 2 nhịp rồi nén xuống
//       0,80–1,70  nắp bật mở và NỔ RA CÙNG LÚC: ba thẻ, giọt sơn, ngôi sao, hạt màu, ánh sáng
//       1,70–2,00  nơ nảy, thẻ vàng nhún rồi lớp phủ mờ đi vào trang Bóc thẻ
//  3. Tới mốc NAVIGATE_MS: chuyển sang trang Bóc thẻ NGAY DƯỚI lớp phủ để trang tự tải dữ liệu.
//  4. Lớp phủ chỉ mờ đi khi đã đủ MIN_MS VÀ trang đích báo sẵn sàng (sự kiện `btm:page-ready`) — có trần MAX_WAIT_MS
//     để không bao giờ bị kẹt. Nội dung trang đích bay lên nhẹ lần lượt (html[data-arena-enter]), rồi lớp phủ được gỡ.
// Hình minh hoạ nằm trong /public/gacha/ (tách từ một ảnh gốc 1672×941): body/flap-l/flap-r/bow (hộp quà, cùng một khung 630×380),
// sym-*.webp (biểu tượng trên thẻ), dl*/dr* (giọt sơn), s*.webp (ngôi sao), w*.webp (đường cong góc). Khung thẻ vẽ bằng SVG ngay trong file này.
// Đổi hình: thay file cùng tên (WebP/PNG nền trong suốt, cùng tỷ lệ); vị trí/kích thước nằm ở các hằng số BOX, CARDS, DROPS, STARS, WAVES.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playTing } from '../../lib/sound';
import { transitionBus } from '../../lib/transitionBus';

const NAVIGATE_MS = 1500;   // chuyển sang trang Bóc thẻ (đang nằm dưới lớp phủ)
const MIN_MS = 2000;        // tối thiểu trước khi lớp phủ mờ đi: ba thẻ đã đứng yên, không giữ khung cuối lâu
const MAX_WAIT_MS = 8000;   // trần chờ trang đích tải xong
const FADE_MS = 350;        // lớp phủ mờ dần
const ENTER_MS = 1000;      // thời gian giữ hiệu ứng "nội dung bay lên" của trang đích

const isGacha = (p) => p === '/gacha' || p.startsWith('/gacha/');
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const weakDevice = () => typeof navigator !== 'undefined' && ((navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2);

// ---- Toạ độ pixel trong ảnh gốc 1672×941; cụm trung tâm (hộp + thẻ + giọt sơn) đặt theo phần trăm của CLUSTER ----
const ART_W = 1672;
const ART_H = 941;
const CLUSTER = { x: 300, y: 150, w: 1070, h: 710 };
const pct = (v, total) => `${((v / total) * 100).toFixed(3)}%`;
const rel = (o) => ({ left: pct(o.x - CLUSTER.x, CLUSTER.w), top: pct(o.y - CLUSTER.y, CLUSTER.h), width: pct(o.w, CLUSTER.w) });
const relBox = (o) => ({ ...rel(o), height: pct(o.h, CLUSTER.h) });
const cq = (v) => ((v / CLUSTER.w) * 100).toFixed(2); // pixel ảnh gốc → cqw (đơn vị theo bề rộng cụm)
const MOUTH = { x: 835, y: 540 };                      // miệng hộp: nơi mọi thứ bay ra

const BOX = { x: 520, y: 470, w: 630, h: 380 };

// Ba thẻ: rect = khung thẳng đứng (đã xoay về thẳng quanh pivot), rot = góc nghiêng cuối cùng.
// (tx, ty) = độ dịch (pixel ảnh gốc) từ vị trí cuối về chỗ ẩn sau hộp, s0 = tỷ lệ lúc mới bay lên.
const CARDS = [
  {
    id: 'pink', rect: { x: 472, y: 247, w: 266, h: 320 }, pivot: { x: 608, y: 432 }, rot: -15, d: 800, dur: 720, tx: 229, ty: 296, s0: 0.66, over: { x: -12, y: -16 },
    frame: '#FC6F9B', line: '#7D050F', sym: { src: '/gacha/sym-pink.webp', x: 64, y: 72, w: 128, h: 181 },
  },
  {
    id: 'blue', rect: { x: 931, y: 247, w: 266, h: 320 }, pivot: { x: 1062, y: 432 }, rot: 15, d: 840, dur: 720, tx: -229, ty: 296, s0: 0.66, over: { x: 12, y: -16 },
    frame: '#40B6FF', line: '#012586', rim: '#0791F4', sym: { src: '/gacha/sym-blue.webp', x: 75, y: 77, w: 125, h: 176 },
  },
  {
    id: 'gold', rect: { x: 702, y: 166, w: 272, h: 400 }, pivot: { x: 835, y: 366 }, rot: 0, d: 880, dur: 720, tx: -3, ty: 346, s0: 0.55, over: { x: 0, y: -34 },
    frame: '#FFD53F', line: '#6F2904', sym: { src: '/gacha/sym-star.webp', x: 42, y: 97, w: 184, h: 176 },
  },
];

// Giọt sơn: o = ô chứa trong ảnh gốc, d = độ trễ (ms), r = góc xoay lúc bay.
const DROPS = [
  { src: '/gacha/dl2.webp', o: { x: 312, y: 314, w: 128, h: 114 }, d: 830, r: -16 },
  { src: '/gacha/dr2.webp', o: { x: 1195, y: 404, w: 127, h: 104 }, d: 848, r: 14 },
  { src: '/gacha/dl1.webp', o: { x: 470, y: 165, w: 75, h: 85 }, d: 866, r: -12 },
  { src: '/gacha/dr1.webp', o: { x: 1155, y: 195, w: 73, h: 71 }, d: 884, r: 12 },
  { src: '/gacha/dl3.webp', o: { x: 340, y: 446, w: 142, h: 94 }, d: 902, r: -10 },
  { src: '/gacha/dr3.webp', o: { x: 1152, y: 520, w: 154, h: 100 }, d: 920, r: 10 },
  { src: '/gacha/dl4.webp', o: { x: 415, y: 563, w: 95, h: 67 }, d: 938, r: -8 },
  { src: '/gacha/dr4.webp', o: { x: 1118, y: 646, w: 100, h: 74 }, d: 956, r: 8 },
];
// Ngôi sao: (x, y, w, h) là ô chứa trong ảnh gốc. `near` = nằm trong cụm trung tâm (đi cùng cụm khi co giãn); còn lại đặt theo màn hình.
const STARS = [
  { src: '/gacha/s3.webp', o: { x: 473, y: 656, w: 89, h: 86 }, d: 860, near: true, r: 18 },
  { src: '/gacha/s5.webp', o: { x: 1312, y: 306, w: 80, h: 82 }, d: 890, near: true, r: -18 },
  { src: '/gacha/s1.webp', o: { x: 182, y: 195, w: 94, h: 89 }, d: 845 },
  { src: '/gacha/s4.webp', o: { x: 1430, y: 68, w: 92, h: 90 }, d: 910 },
  { src: '/gacha/s2.webp', o: { x: 205, y: 578, w: 86, h: 82 }, d: 940 },
  { src: '/gacha/s6.webp', o: { x: 1454, y: 589, w: 86, h: 83 }, d: 970 },
];
// Ngôi sao nhỏ và hạt màu bay lên theo vòng cung lúc nắp bật mở (dx, dy theo pixel ảnh gốc, tính từ miệng hộp).
const SPARKS = [
  { type: 'star', src: '/gacha/s3.webp', w: 46, dx: -250, dy: -250, d: 810 },
  { type: 'star', src: '/gacha/s5.webp', w: 42, dx: 270, dy: -270, d: 825 },
  { type: 'star', src: '/gacha/s2.webp', w: 36, dx: -60, dy: -330, d: 815 },
  { type: 'dot', c: '#FF6F9B', w: 22, dx: -330, dy: -120, d: 805 },
  { type: 'dot', c: '#40B6FF', w: 24, dx: 340, dy: -140, d: 840 },
  { type: 'dot', c: '#FFD53F', w: 20, dx: 130, dy: -330, d: 830 },
  { type: 'dot', c: '#FFD53F', w: 18, dx: -170, dy: -310, d: 880 },
  { type: 'dot', c: '#FF6F9B', w: 18, dx: 220, dy: -230, d: 860 },
  { type: 'dot', c: '#40B6FF', w: 18, dx: -290, dy: -30, d: 875 },
];
const WAVES = [
  { cls: 'gt-wave-tl', src: '/gacha/wtl.webp', w: 410, delay: 120 },
  { cls: 'gt-wave-br', src: '/gacha/wbr.webp', w: 447, delay: 170 },
  { cls: 'gt-wave-bl', src: '/gacha/wbl.webp', w: 415, delay: 220 },
];

// Khung thẻ vẽ bằng SVG: viền đậm, khung màu, lòng thẻ kem + biểu tượng (ảnh cắt từ hình gốc). Không có tia sáng hay hoạ tiết bên trong thẻ.
function CardArt({ c }) {
  const { w, h } = c.rect;
  return (
    <svg className="gt-card-art" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <rect x="4" y="4" width={w - 8} height={h - 8} rx="36" fill={c.rim || c.frame} stroke={c.line} strokeWidth="8" />
      {c.rim && <rect x="12" y="12" width={w - 24} height={h - 24} rx="30" fill={c.frame} />}
      <rect x="29" y="29" width={w - 58} height={h - 58} rx="16" fill="#FEF4E8" />
      <path d={`M 15 62 L 15 46 Q 15 15 46 15 L 66 15`} fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth="6" strokeLinecap="round" />
      <image href={c.sym.src} x={c.sym.x} y={c.sym.y} width={c.sym.w} height={c.sym.h} />
    </svg>
  );
}

function Overlay({ lite, leaving }) {
  const far = STARS.filter((s) => !s.near);
  const near = STARS.filter((s) => s.near);
  const stars = lite ? far.slice(0, 2) : far;
  const drops = lite ? DROPS.slice(0, 4) : DROPS;
  const sparks = lite ? SPARKS.filter((s) => s.type === 'dot').slice(0, 3) : SPARKS;
  const boxStyle = relBox(BOX);
  return (
    <div className={`gt-root${lite ? ' gt-lite' : ''}${leaving ? ' gt-leaving' : ''}`} data-testid="gacha-transition" aria-hidden="true">
      <div className="gt-bg" />
      <div className="gt-rings">
        <span className="gt-ring gt-ring-2" />
        <span className="gt-ring gt-ring-1" />
      </div>
      {WAVES.map((w) => (
        <img key={w.cls} className={`gt-wave ${w.cls}`} src={w.src} alt="" draggable="false" style={{ '--w': `${((w.w / ART_W) * 100).toFixed(2)}vw`, animationDelay: `${w.delay}ms` }} />
      ))}
      {stars.map((s, i) => (
        <img
          key={i}
          className="gt-star gt-star-far"
          src={s.src}
          alt=""
          draggable="false"
          style={{
            left: pct(s.o.x, ART_W),
            top: pct(s.o.y, ART_H),
            width: pct(s.o.w, ART_W),
            '--d': `${s.d}ms`,
            '--ox': (((MOUTH.x - (s.o.x + s.o.w / 2)) / ART_W) * 100).toFixed(1),
            '--oy': (((MOUTH.y - (s.o.y + s.o.h / 2)) / ART_W) * 100).toFixed(1),
          }}
        />
      ))}
      <div className="gt-stage">
        <div className="gt-cluster">
          <span className="gt-floor" />
          {!lite &&
            near.map((s, i) => (
              <img
                key={i}
                className="gt-star-near"
                src={s.src}
                alt=""
                draggable="false"
                style={{ ...rel(s.o), '--ox': cq(MOUTH.x - (s.o.x + s.o.w / 2)), '--oy': cq(MOUTH.y - (s.o.y + s.o.h / 2)), '--r': `${s.r}deg`, '--d': `${s.d}ms` }}
              />
            ))}
          {drops.map((p, i) => (
            <img
              key={i}
              className="gt-drop"
              src={p.src}
              alt=""
              draggable="false"
              style={{
                ...rel(p.o),
                '--ox': cq(MOUTH.x - (p.o.x + p.o.w / 2)),
                '--oy': cq(MOUTH.y - (p.o.y + p.o.h / 2)),
                '--r': `${p.r}deg`,
                '--d': `${p.d}ms`,
              }}
            />
          ))}
          <div className="gt-grp">
            <span className="gt-glow" />
            {CARDS.map((c) => (
              <div
                key={c.id}
                className={`gt-card gt-card-${c.id}`}
                style={{
                  ...relBox(c.rect),
                  transformOrigin: `${(((c.pivot.x - c.rect.x) / c.rect.w) * 100).toFixed(2)}% ${(((c.pivot.y - c.rect.y) / c.rect.h) * 100).toFixed(2)}%`,
                  '--r': `${c.rot}deg`,
                  '--tx': cq(c.tx),
                  '--ty': cq(c.ty),
                  '--s0': c.s0,
                  '--ox': cq(c.over.x),
                  '--oy': cq(c.over.y),
                  '--d': `${c.d}ms`,
                  '--dur': `${c.dur}ms`,
                }}
              >
                <div className="gt-card-in">
                  <CardArt c={c} />
                </div>
              </div>
            ))}
            <svg className="gt-closed" style={boxStyle} viewBox="0 0 630 380" preserveAspectRatio="none">
              <rect x="98" y="142" width="434" height="226" rx="20" fill="#977EFC" stroke="#32207A" strokeWidth="7" />
              <rect x="101" y="190" width="428" height="26" fill="#7C62EC" />
              <rect x="84" y="126" width="462" height="72" rx="20" fill="#A992FF" stroke="#32207A" strokeWidth="7" />
              <path d="M 104 142 L 250 142" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="6" strokeLinecap="round" />
            </svg>
            <img className="gt-body" src="/gacha/body.webp" alt="" draggable="false" style={boxStyle} />
            <img className="gt-flap gt-flap-l" src="/gacha/flap-l.webp" alt="" draggable="false" style={boxStyle} />
            <img className="gt-flap gt-flap-r" src="/gacha/flap-r.webp" alt="" draggable="false" style={boxStyle} />
            <img className="gt-bow" src="/gacha/bow.webp" alt="" draggable="false" style={boxStyle} />
            {sparks.map((s, i) => {
              const size = (s.w / CLUSTER.w) * 100;
              const pos = {
                left: `calc(${pct(MOUTH.x - CLUSTER.x, CLUSTER.w)} - ${size / 2}cqw)`,
                top: `calc(${pct(MOUTH.y - CLUSTER.y, CLUSTER.h)} - ${size / 2}cqw)`,
                width: `${size}cqw`,
                '--dx': cq(s.dx),
                '--dy': cq(s.dy),
                '--d': `${s.d}ms`,
              };
              return s.type === 'star' ? (
                <img key={i} className="gt-spark gt-spark-star" src={s.src} alt="" draggable="false" style={pos} />
              ) : (
                <span key={i} className="gt-spark gt-spark-dot" style={{ ...pos, height: `${size}cqw`, background: s.c }} />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GachaTransition() {
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

  // Bấm vào liên kết dẫn tới Bóc thẻ.
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || !isGacha(url.pathname)) return;
      if (isGacha(window.location.pathname) || busy.current || reduceMotion()) return;
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
        if (!st.navigated) return;           // tín hiệu của trang khác, không phải trang Bóc thẻ
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
