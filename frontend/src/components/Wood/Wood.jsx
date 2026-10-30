// Bộ khung "bảng gỗ" cho các trang chọn tranh tô màu: nền như trang chủ, biển tiêu đề treo, bảng gỗ lớn, khung tranh.
import { Link } from 'react-router-dom';
import PictureView from '../PictureView/PictureView';
import Icon from '../Icon';

const HOME_BG = 'url(/home-bg.webp)';

/** Nền: cùng ảnh với trang chủ. */
export function WoodScene({ children }) {
  return (
    <div className="wood-scene bg-[#BFE8FF] bg-cover bg-fixed bg-center bg-no-repeat" style={{ backgroundImage: HOME_BG }}>
      <div className="wood-scene-in">{children}</div>
    </div>
  );
}

// Màu chữ: hai từ đầu xanh dương, các chữ cái sau đó lần lượt hồng – vàng – xanh lá – tím – tím.
const WORD_BLUE = '#1E8BF2';
const LETTER_COLORS = ['#FF3B6B', '#FFAE0F', '#18C45E', '#8B5CF6', '#8B5CF6'];

function colorLetters(title) {
  let n = 0;
  return String(title).split(' ').map((w, wi) => ({
    word: w,
    letters: [...w].map((ch) => ({ ch, color: wi < 2 ? WORD_BLUE : LETTER_COLORS[n++ % LETTER_COLORS.length] })),
  }));
}

/** Biển tiêu đề: tấm gỗ dài treo bằng dây, đầu bên phải thu nhỏ thành cán + đầu cọ. Chữ nhiều màu viền trắng. */
export function WoodSign({ title, hint }) {
  const text = String(title);
  const size = Math.min(6.9, 74 / (Math.max(text.length, 1) * 0.58));
  return (
    <div className="wood-sign-wrap">
      <div className="wood-sign2">
        <span className="wood-rope" style={{ left: '10%' }} />
        <span className="wood-rope" style={{ left: '66%' }} />
        <svg className="wood-sign-art" viewBox="0 0 900 123" aria-hidden="true">
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
            <clipPath id="ws-head">
              <path d="M773 51 C777 42 783 38 793 33 C805 27 817 22 834 22 C850 22 866 29 884 28 C891 27.5 896 26 897 29 C897 42 890 60 879 72 C866 86 850 97 833 102.5 C818 107 797 106 785 100 C777 96 774 92 773 90 Z" />
            </clipPath>
          </defs>
          <g style={{ filter: 'drop-shadow(0 5px 4px rgba(90,46,10,0.35))' }}>
            {/* tấm gỗ */}
            <path d="M16 66 C10 48 28 26 70 25 L690 25 C712 26 728 34 734 46 L734 104 C728 112 712 118 690 118 L60 118 C28 118 12 90 16 66 Z" fill="url(#ws-plank)" stroke="#A8581C" strokeWidth="3.2" strokeLinejoin="round" />
            <path d="M16 66 C10 48 28 26 70 25 L690 25 C712 26 728 34 734 46 L734 104 C728 112 712 118 690 118 L60 118 C28 118 12 90 16 66 Z" fill="url(#ws-glow)" />
            <g stroke="#C9772C" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.55">
              <path d="M26 62 C80 58 120 64 180 60" />
              <path d="M40 96 C110 92 150 98 230 94" />
              <path d="M520 98 C580 94 640 100 700 96" />
              <path d="M560 40 C610 38 660 43 706 40" />
              <path d="M300 106 C360 103 420 108 480 105" />
            </g>
            <path d="M40 33 C200 27 420 29 660 31" stroke="#FFE3A0" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" />
            {/* vành kim loại */}
            <path d="M738 47 Q734.5 45 738 44 L769 49 Q773 49.5 773.4 53 L774.5 94 Q774.5 98 771 98.6 L742 106 Q737.5 106.8 737.5 102 Z" fill="url(#ws-ferrule)" stroke="#B5651F" strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M745 52 L745 100" stroke="#FFF0CC" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
            <path d="M762 54 L763 93" stroke="#C9822F" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
            {/* đầu cọ */}
            <g clipPath="url(#ws-head)">
              <rect x="765" y="15" width="135" height="100" fill="url(#ws-tan)" />
              <path d="M764 25 L803 37 C812 42 820 50 823 57 C818 62 810 66 806 71 C814 74 823 79 827 84 C824 90 821 95 819 99 L816 108 L764 113 Z" fill="#92491F" />
              <g stroke="#6F3414" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.55">
                <path d="M776 45 C790 44 800 46 812 50" />
                <path d="M776 62 C792 60 806 62 818 68" />
                <path d="M777 80 C792 80 806 82 816 90" />
              </g>
              <path d="M803 37 C812 42 820 50 823 57 C818 62 810 66 806 71 C814 74 823 79 827 84 C824 90 821 95 819 99" fill="none" stroke="#D98F40" strokeWidth="2" strokeLinejoin="round" />
              <path d="M842 30 C852 35 858 45 860 56 C861 64 858 70 857 74 C858 79 860 83 864 86 L900 100 L900 10 L842 10 Z" fill="url(#ws-pink)" />
              <path d="M852 36 C864 32 876 31 888 33" stroke="#FFC2CF" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.85" />
            </g>
            <path d="M773 51 C777 42 783 38 793 33 C805 27 817 22 834 22 C850 22 866 29 884 28 C891 27.5 896 26 897 29 C897 42 890 60 879 72 C866 86 850 97 833 102.5 C818 107 797 106 785 100 C777 96 774 92 773 90 Z" fill="none" stroke="#7A3412" strokeWidth="2.6" strokeLinejoin="round" />
          </g>
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

/** Bảng gỗ lớn chứa lưới tranh. */
export function WoodBoard({ children, className = '', testId }) {
  return (
    <div className={`wood-board ${className}`} data-testid={testId}>
      <span className="wood-bolt" style={{ left: 10, top: 10 }} />
      <span className="wood-bolt" style={{ right: 10, top: 10 }} />
      <span className="wood-bolt" style={{ left: 10, bottom: 10 }} />
      <span className="wood-bolt" style={{ right: 10, bottom: 10 }} />
      <div className="wood-board-in">{children}</div>
    </div>
  );
}

/** Các biển nhóm tuổi treo phía trên bảng. */
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
          <span className="wood-tab-rope wood-tab-rope-l" />
          <span className="wood-tab-rope wood-tab-rope-r" />
          <span className="wood-tab-icon" aria-hidden="true">{tb.icon}</span>
          <span className="wood-tab-label">{tb.label}</span>
        </button>
      ))}
    </div>
  );
}

/** Khung tranh gỗ cam, có ghim, tên một hàng và nút mũi tên xanh ở góc. */
export function PicFrame({ to, onClick, picture, title, subtitle, testId }) {
  const body = (
    <>
      <span className="wood-pin" aria-hidden="true" />
      <div className="wood-paper">
        {picture ? <PictureView picture={picture} title={title} /> : <div className="aspect-square" />}
      </div>
      <div className="wood-label" title={title}>{title}</div>
      {subtitle && <div className="wood-sub">{subtitle}</div>}
      <span className="wood-go" aria-hidden="true"><Icon name="chevronRight" size={22} strokeWidth={3} /></span>
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
