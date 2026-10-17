import { useEffect, useRef, useState } from 'react';
import { isSoundOn } from '../lib/sound';

const GREETING = 'Hello! What would you like to color today?';
const OUT = '#6B3414';
const BROWN = '#B06A2C';
const SKIN = '#F2BD83';
const RED = '#F0404C';
const BLUE = '#3C9BE2';

/** Gấu họa sĩ ở trang chủ: chớp mắt, thỉnh thoảng giơ cọ + bảng màu, lâu lâu nói lời chào. */
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

  const stroke = { stroke: OUT, strokeWidth: 8, strokeLinejoin: 'round', strokeLinecap: 'round' };
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="170 55 970 1170" className="h-full w-full drop-shadow" role="img" aria-label="Bear painter" onClick={speak}>
        {/* Chân và bàn chân */}
        <g {...stroke} fill={BROWN}>
          <path d="M420 1040 L420 1110 Q420 1130 450 1130 L560 1130 L560 1040 Z" />
          <path d="M650 1040 L650 1130 L760 1130 Q790 1130 790 1110 L790 1040 Z" />
          <ellipse cx="465" cy="1145" rx="105" ry="52" />
          <ellipse cx="750" cy="1145" rx="105" ry="52" />
        </g>
        {/* Tai */}
        <g {...stroke}>
          <circle cx="375" cy="250" r="105" fill={BROWN} />
          <circle cx="875" cy="250" r="105" fill={BROWN} />
          <circle cx="378" cy="252" r="50" fill="#F4C48C" />
          <circle cx="872" cy="252" r="50" fill="#F4C48C" />
        </g>
        {/* Thân: áo trắng + yếm xanh */}
        <path d="M380 690 Q420 640 470 640 L760 640 Q820 650 850 690 L850 780 L380 780 Z" fill="#FFFFFF" {...stroke} />
        <path d="M405 800 L805 800 L850 1040 L370 1040 Z" fill={BLUE} {...stroke} />
        <path d="M470 660 L450 800 L520 800 L535 660 Z M740 660 L760 800 L690 800 L670 660 Z" fill={BLUE} {...stroke} />
        <circle cx="478" cy="770" r="26" fill="#FFD23F" {...stroke} />
        <circle cx="745" cy="770" r="26" fill="#FFD23F" {...stroke} />
        <path d="M510 840 L710 840 L705 955 Q690 990 610 990 Q530 990 515 955 Z" fill="#3394DB" {...stroke} />
        <path d="M540 880 Q560 855 590 872 Q610 900 580 925 Q545 925 540 880 Z" fill="#F4505A" />
        <path d="M645 865 Q690 850 705 880 Q690 925 660 940 Q640 900 645 865 Z" fill="#FFD83A" />
        <circle cx="628" cy="948" r="16" fill="#2D8BEA" />
        <path d="M385 1030 L840 1030 L850 1075 L375 1075 Z" fill="#6DB8F4" {...stroke} />
        <path d="M600 1075 L650 1075" stroke={OUT} strokeWidth="8" />
        <path d="M388 940 Q420 905 450 930 Q475 925 480 955 Q470 995 430 985 Q395 1000 388 940 Z" fill="#8AD43A" />
        <path d="M765 975 Q790 925 825 945 Q850 935 845 975 Q840 1015 800 1005 Q770 1015 765 975 Z" fill="#FF9A2E" />
        {/* Đầu */}
        <ellipse cx="602" cy="420" rx="280" ry="235" fill={BROWN} {...stroke} />
        {/* Khăn đỏ */}
        <path d="M455 640 Q600 690 770 630 L705 760 L610 705 L545 765 Z" fill={RED} {...stroke} />
        <path d="M575 700 Q610 665 645 700 Q650 735 610 745 Q570 735 575 700 Z" fill="#E23642" {...stroke} />
        {/* Má hồng + mõm */}
        <ellipse cx="435" cy="485" rx="40" ry="27" fill="#F7A3B3" {...stroke} strokeWidth="0" />
        <ellipse cx="780" cy="485" rx="40" ry="27" fill="#F7A3B3" />
        <ellipse cx="605" cy="535" rx="110" ry="80" fill={SKIN} {...stroke} strokeWidth="6" />
        <ellipse cx="610" cy="478" rx="50" ry="30" fill="#5A2410" />
        <path d="M608 505 L608 522" stroke={OUT} strokeWidth="6" strokeLinecap="round" />
        <path d={talking ? 'M545 520 Q608 600 672 520 Z' : 'M548 520 Q580 552 608 522 Q636 552 668 520'} fill={talking ? '#B83A3A' : 'none'} stroke={OUT} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        {/* Mắt (chớp) */}
        <g className="bear-eyes">
          <circle cx="498" cy="420" r="33" fill="#1B1210" />
          <circle cx="509" cy="406" r="9" fill="#FFFFFF" />
          <circle cx="712" cy="420" r="33" fill="#1B1210" />
          <circle cx="723" cy="406" r="9" fill="#FFFFFF" />
        </g>
        {/* Mũ nồi */}
        <g {...stroke}>
          <path d="M740 160 Q738 85 775 68 Q805 90 788 165 Z" fill="#E8333F" />
          <path d="M520 190 Q560 105 700 112 Q845 130 905 285 Q915 365 880 390 Q830 330 715 275 Q560 240 520 190 Z" fill={RED} />
        </g>
        <path d="M575 160 Q640 128 720 138" stroke="#FF8A92" strokeWidth="14" strokeLinecap="round" fill="none" />
        {/* Tay trái cầm cọ (giơ lên) */}
        <g className="bear-arm-l">
          <g {...stroke}>
            <path d="M395 700 Q330 700 300 735 Q250 760 255 810 Q270 860 340 845 Q380 830 400 780 Z" fill={BROWN} />
            <path d="M262 560 L322 575 L385 925 L345 940 Z" fill="#9A5A22" />
            <rect x="248" y="595" width="62" height="38" rx="6" fill="#B8BEC4" transform="rotate(-16 279 614)" />
            <path d="M195 490 Q250 450 300 520 Q300 585 255 600 Q200 585 195 490 Z" fill="#F8F1E6" />
            <path d="M195 495 Q250 450 300 520 Q270 535 250 520 Q230 540 205 525 Z" fill={RED} />
          </g>
          <path d="M270 800 Q300 760 345 800" fill={BROWN} stroke={OUT} strokeWidth="8" strokeLinecap="round" />
        </g>
        {/* Tay phải cầm bảng màu (giơ lên) */}
        <g className="bear-arm-r">
          <g {...stroke}>
            <path d="M815 690 Q880 700 890 770 Q880 830 830 850 Q800 800 810 760 Z" fill={BROWN} />
            <ellipse cx="1000" cy="790" rx="128" ry="140" transform="rotate(-12 1000 790)" fill="#F7C98B" />
            </g>
          <path d="M845 770 Q905 745 930 800 Q925 850 880 850 Q850 845 845 770 Z" fill={BROWN} {...stroke} />
          <path d="M890 700 Q925 675 955 700 Q965 735 930 745 Q890 740 890 700 Z" fill="#F4505A" />
          <path d="M990 685 Q1030 665 1060 695 Q1065 740 1030 745 Q990 735 990 685 Z" fill="#FFD83A" />
          <path d="M1030 770 Q1070 745 1100 775 Q1105 815 1070 835 Q1030 825 1030 770 Z" fill="#2D8BEA" />
          <path d="M945 840 Q985 810 1025 840 Q1035 885 990 895 Q945 885 945 840 Z" fill="#7ED321" />
        </g>
      </svg>
      {talking && (
        <div
          className="pointer-events-none absolute left-[78%] top-0 z-10 w-44 rounded-2xl border-2 border-ink/80 bg-white px-3 py-2 text-sm font-bold leading-snug text-ink shadow-lg sm:w-56 sm:text-base"
          role="status"
        >
          {GREETING}
          <span className="absolute -left-2 bottom-3 h-3 w-3 rotate-45 border-b-2 border-l-2 border-ink/80 bg-white" />
        </div>
      )}
    </div>
  );
}
