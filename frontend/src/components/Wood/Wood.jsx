// Bộ khung cho các trang chọn tranh tô màu: nền như trang chủ, biển tiêu đề treo, ba biển nhóm tuổi, bảng trắng, thẻ tranh.
import { Link } from 'react-router-dom';
import PictureView from '../PictureView/PictureView';
import Icon from '../Icon';

const HOME_BG = 'url(/home-bg.webp)';

/** Nền (cùng ảnh với trang chủ). */
export function WoodScene({ children }) {
  return (
    <div className="wood-scene bg-[#BFE8FF] bg-cover bg-fixed bg-center bg-no-repeat" style={{ backgroundImage: HOME_BG }}>
      <div className="wood-scene-in">
        {children}
      </div>
    </div>
  );
}

/** Cụm 3 chiếc lá xanh. */
function Leaves({ x, y, rot = 0, scale = 1 }) {
  const leaf = 'M0 0 C14 -22 44 -24 62 -4 C44 14 14 18 0 0 Z';
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      {[-34, 0, 34].map((r) => (
        <g key={r} transform={`rotate(${r})`}>
          <path d={leaf} fill="#4FBF3F" stroke="#2C7A22" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M4 -1 C22 -6 40 -8 54 -4" stroke="#9BE36C" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

// Màu chữ theo từng từ: xanh dương – vàng cam – đỏ – xanh lá (lặp lại nếu tên dài hơn 4 từ).
const WORD_COLORS = ['#2F9BF5', '#FFB01A', '#F0504F', '#33C45A'];

function colorLetters(title) {
  return String(title).split(' ').map((w, wi) => ({
    word: w,
    letters: [...w].map((ch) => ({ ch, color: WORD_COLORS[wi % WORD_COLORS.length] })),
  }));
}

/** Biển tiêu đề: tấm gỗ dài treo bằng dây, đầu bên phải thu nhỏ thành cán + đầu cọ. Chữ nhiều màu viền trắng. */
export function WoodSign({ title, hint }) {
  const text = String(title);
  const size = Math.min(6.9, 74 / (Math.max(text.length, 1) * 0.58));
  return (
    <div className="wood-sign-wrap">
      <div className="wood-sign2">
        {[11.4, 15.2, 67.6, 71.4].map((x) => (
          <span key={x} className="wood-rope" style={{ left: `${x}%` }} />
        ))}
        <svg className="wood-sign-art" viewBox="0 -30 900 160" aria-hidden="true">
          <defs>
            <linearGradient id="ws-plank" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F6A93E" />
              <stop offset="0.28" stopColor="#FFC25E" />
              <stop offset="0.7" stopColor="#F9B54A" />
              <stop offset="1" stopColor="#EC9733" />
            </linearGradient>
            <radialGradient id="ws-glow" cx="0.42" cy="0.55" r="0.5">
              <stop offset="0" stopColor="#FFE8A8" stopOpacity="0.85" />
              <stop offset="1" stopColor="#FFE8A8" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="ws-ferrule" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#F9D79B" />
              <stop offset="0.45" stopColor="#F2BC70" />
              <stop offset="1" stopColor="#E3A053" />
            </linearGradient>
            <linearGradient id="ws-tan" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F9CF93" />
              <stop offset="1" stopColor="#EDAA5B" />
            </linearGradient>
            <linearGradient id="ws-pink" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FF7F9A" />
              <stop offset="1" stopColor="#F23E5E" />
            </linearGradient>
            <clipPath id="ws-brown">
              <path d="M764 25 L803 37 C812 42 820 50 823 57 C818 62 810 66 806 71 C814 74 823 79 827 84 C824 90 821 95 819 99 L816 108 L764 113 Z" />
            </clipPath>
            <clipPath id="ws-head">
              <path d="M773 51 C777 42 783 38 793 33 C805 27 817 22 834 22 C850 22 866 29 884 28 C891 27.5 896 26 897 29 C897 42 890 60 879 72 C866 86 850 97 833 102.5 C818 107 797 106 785 100 C777 96 774 92 773 90 Z" />
            </clipPath>
          </defs>
          <g style={{ filter: 'drop-shadow(0 5px 4px rgba(90,46,10,0.35))' }}>
            {/* tấm gỗ */}
            <path d="M16 70 C8 40 28 14 70 14 C250 22 520 22 690 14 C712 14 722 28 728 46 L746 101 C740 116 722 124 690 124 C520 134 250 134 60 124 C26 122 10 98 16 70 Z" fill="url(#ws-plank)" stroke="#A8581C" strokeWidth="3.2" strokeLinejoin="round" />
            <path d="M16 70 C8 40 28 14 70 14 C250 22 520 22 690 14 C712 14 722 28 728 46 L746 101 C740 116 722 124 690 124 C520 134 250 134 60 124 C26 122 10 98 16 70 Z" fill="url(#ws-glow)" />
            <g stroke="#C9772C" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.55">
              <path d="M26 62 C80 58 120 64 180 60" />
              <path d="M40 96 C110 92 150 98 230 94" />
              <path d="M520 98 C580 94 640 100 700 96" />
              <path d="M560 40 C610 38 660 43 706 40" />
              <path d="M300 106 C360 103 420 108 480 105" />
            </g>
            <path d="M40 33 C200 27 420 29 660 31" stroke="#FFE3A0" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" />
            <g transform="rotate(-18 738 76)">
            {/* vành kim loại */}
            <path d="M738 47 Q734.5 45 738 44 L769 49 Q773 49.5 773.4 53 L774.5 94 Q774.5 98 771 98.6 L742 106 Q737.5 106.8 737.5 102 Z" fill="url(#ws-ferrule)" stroke="#B5651F" strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M745 52 L745 100" stroke="#FFF0CC" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
            <path d="M762 54 L763 93" stroke="#C9822F" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
            {/* đầu cọ */}
            <g clipPath="url(#ws-head)">
              <rect x="765" y="15" width="135" height="100" fill="url(#ws-tan)" />
              <path d="M764 25 L803 37 C812 42 820 50 823 57 C818 62 810 66 806 71 C814 74 823 79 827 84 C824 90 821 95 819 99 L816 108 L764 113 Z" fill="#92491F" />
              <g clipPath="url(#ws-brown)" stroke="#6F3414" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.55">
                <path d="M776 45 C790 44 800 46 812 50" />
                <path d="M776 62 C792 60 806 62 818 68" />
                <path d="M777 80 C792 80 806 82 816 90" />
              </g>
              <path d="M764 25 L803 37 C812 42 820 50 823 57 C818 62 810 66 806 71 C814 74 823 79 827 84 C824 90 821 95 819 99 L816 108" fill="none" stroke="#D98F40" strokeWidth="2" strokeLinejoin="round" />
              <path d="M842 30 C852 35 858 45 860 56 C861 64 858 70 857 74 C858 79 860 83 864 86 L900 100 L900 10 L842 10 Z" fill="url(#ws-pink)" />
              <path d="M852 36 C864 32 876 31 888 33" stroke="#FFC2CF" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.85" />
            </g>
            <path d="M773 51 C777 42 783 38 793 33 C805 27 817 22 834 22 C850 22 866 29 884 28 C891 27.5 896 26 897 29 C897 42 890 60 879 72 C866 86 850 97 833 102.5 C818 107 797 106 785 100 C777 96 774 92 773 90 Z" fill="none" stroke="#7A3412" strokeWidth="2.6" strokeLinejoin="round" />
            </g>
            {/* đinh ở hai đầu */}
            <circle cx="46" cy="76" r="6" fill="#B9B6B0" stroke="#7A7670" strokeWidth="2" />
            <circle cx="690" cy="76" r="6" fill="#B9B6B0" stroke="#7A7670" strokeWidth="2" />
          </g>
          {/* lá trang trí */}
          <Leaves x={14} y={40} rot={-150} />
          <Leaves x={706} y={104} rot={30} scale={0.9} />
        </svg>
        <h1 className="wood-sign-title" data-testid="wood-title" style={{ fontSize: `${size}cqw` }}>
          {colorLetters(title).map(({ word, letters }, wi) => (
            <span key={`${word}-${wi}`} className="wood-word">
              {letters.map((l, i) => (
                <span key={i} style={{ color: l.color }}>{l.ch}</span>
              ))}
            </span>
          ))}
        </h1>
      </div>
      {hint && <p className="wood-hint">{hint}</p>}
    </div>
  );
}

/** Bảng trắng lớn chứa lưới tranh. */
export function WoodBoard({ children, className = '', testId }) {
  return (
    <div className={`wood-board ${className}`} data-testid={testId}>
      <div className="wood-board-in">{children}</div>
    </div>
  );
}

/** Ba biển nhóm tuổi dạng viên thuốc gác lên mép bảng, con vật nằm bên trong. */
export function WoodTabs({ tabs, value, onChange }) {
  return (
    <div className="wood-tabs" role="tablist">
      {tabs.map((tb) => (
        <button
          key={tb.key}
          type="button"
          role="tab"
          aria-selected={value === tb.key}
          className={`wood-tab${value === tb.key ? ' wood-tab-on' : ''}`}
          onClick={() => onChange(tb.key)}
          data-testid={`agetab-${tb.key}`}
        >
          <span className="wood-tab-body">
            <span className="wood-tab-icon" aria-hidden="true">{tb.icon}</span>
            <span className="wood-tab-label">{tb.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

/** Thẻ tranh màu trắng: ảnh, tên, số tranh và nút mũi tên xanh nhạt. */
export function PicFrame({ to, onClick, picture, title, subtitle, testId }) {
  const body = (
    <>
      <div className="wood-paper">
        {picture ? <PictureView picture={picture} title={title} /> : <div className="aspect-square" />}
      </div>
      <div className="wood-label" title={title}>{title}</div>
      <div className="wood-foot">
        <span className="wood-sub">{subtitle && (<><Icon name="user" size={16} /> {subtitle}</>)}</span>
        <span className="wood-go" aria-hidden="true"><Icon name="chevronRight" size={20} strokeWidth={3} /></span>
      </div>
    </>
  );
  return to ? (
    <Link to={to} className="wood-frame" data-testid={testId}>{body}</Link>
  ) : (
    <button type="button" onClick={onClick} className="wood-frame w-full text-left" data-testid={testId}>{body}</button>
  );
}

/** Nút "Quay lại" dạng viên thuốc trắng. */
export function WoodBack({ to, label }) {
  return (
    <Link to={to} className="wood-back" data-testid="wood-back">
      <Icon name="back" size={20} strokeWidth={3} /> {label}
    </Link>
  );
}

export const WOOD_GRID = 'wood-grid';
