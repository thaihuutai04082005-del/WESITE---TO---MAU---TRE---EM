// Bộ khung cho các trang chọn tranh tô màu: nền như trang chủ, biển tiêu đề treo, ba biển nhóm tuổi, bảng trắng, thẻ tranh.
import { Link } from 'react-router-dom';
import PictureView from '../PictureView/PictureView';
import HelloBear from '../HelloBear';
import Icon from '../Icon';

const HOME_BG = 'url(/home-bg.webp)';

/** Nền (cùng ảnh với trang chủ) + gấu họa sĩ góc trái khi màn hình rộng. */
export function WoodScene({ children }) {
  return (
    <div className="wood-scene bg-[#BFE8FF] bg-cover bg-fixed bg-center bg-no-repeat" style={{ backgroundImage: HOME_BG }}>
      <div className="wood-scene-in">
        {children}
        <div className="wood-bear" aria-hidden="true">
          <HelloBear className="h-full w-full" />
        </div>
      </div>
    </div>
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

function Star({ x, y, s = 1, rot = 0 }) {
  return (
    <path
      transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}
      d="M0 -22 L6.5 -7 L22 -6 L10 4.5 L14 20 L0 11.5 L-14 20 L-10 4.5 L-22 -6 L-6.5 -7 Z"
      fill="#FFD84D"
      stroke="#F3A90A"
      strokeWidth="3"
      strokeLinejoin="round"
    />
  );
}

/** Biển tiêu đề: viên thuốc trắng viền xanh treo bằng dây, đầu bên phải là cây cọ ngọn xanh. Chữ nhiều màu viền trắng. */
export function WoodSign({ title, hint }) {
  const text = String(title);
  const size = Math.min(6.9, 74 / (Math.max(text.length, 1) * 0.58));
  return (
    <div className="wood-sign-wrap">
      <div className="wood-sign2">
        {[16, 71].map((x) => (
          <span key={x} className="wood-rope" style={{ left: `${x}%` }} />
        ))}
        <svg className="wood-sign-art" viewBox="0 -30 900 160" aria-hidden="true">
          <defs>
            <linearGradient id="ws-card" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#FFF3D2" />
            </linearGradient>
            <linearGradient id="ws-gold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#FFE08A" />
              <stop offset="0.5" stopColor="#F7C04A" />
              <stop offset="1" stopColor="#E3A02A" />
            </linearGradient>
            <linearGradient id="ws-blue" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#5BB6FF" />
              <stop offset="1" stopColor="#1F6FE0" />
            </linearGradient>
            <clipPath id="ws-head">
              <path d="M773 51 C777 42 783 38 793 33 C805 27 817 22 834 22 C850 22 866 29 884 28 C891 27.5 896 26 897 29 C897 42 890 60 879 72 C866 86 850 97 833 102.5 C818 107 797 106 785 100 C777 96 774 92 773 90 Z" />
            </clipPath>
          </defs>
          <g style={{ filter: 'drop-shadow(0 6px 5px rgba(30,70,130,0.28))' }}>
            {/* biển trắng viền xanh */}
            <rect x="14" y="24" width="728" height="102" rx="51" fill="url(#ws-card)" stroke="#3B8EF0" strokeWidth="7" />
            <rect x="22" y="32" width="712" height="86" rx="43" fill="none" stroke="#DCEBFF" strokeWidth="3" />
            {/* cọ */}
            <g transform="rotate(-26 738 76)">
              <path d="M738 49 L770 45 Q774 45 774 49 L774 101 Q774 105 770 105 L738 101 Z" fill="url(#ws-gold)" stroke="#B8741A" strokeWidth="2.6" strokeLinejoin="round" />
              <path d="M746 52 L746 98" stroke="#FFF1C2" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
              <g clipPath="url(#ws-head)">
                <rect x="765" y="15" width="135" height="100" fill="#8A4F2A" />
                <path d="M780 60 C800 58 820 62 840 70" stroke="#6B3B1C" strokeWidth="2" fill="none" opacity="0.6" />
                <path d="M782 76 C804 76 826 80 846 88" stroke="#6B3B1C" strokeWidth="2" fill="none" opacity="0.6" />
                <path d="M830 30 C846 36 856 50 858 64 C860 74 858 80 862 86 L900 100 L900 10 L832 10 Z" fill="url(#ws-blue)" />
                <path d="M846 36 C860 32 874 32 888 36" stroke="#C7E6FF" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.9" />
              </g>
              <path d="M773 51 C777 42 783 38 793 33 C805 27 817 22 834 22 C850 22 866 29 884 28 C891 27.5 896 26 897 29 C897 42 890 60 879 72 C866 86 850 97 833 102.5 C818 107 797 106 785 100 C777 96 774 92 773 90 Z" fill="none" stroke="#5E3416" strokeWidth="2.6" strokeLinejoin="round" />
            </g>
          </g>
          {/* giọt sơn hồng */}
          <path d="M858 112 C866 104 872 112 868 120 C864 126 856 122 858 112 Z" fill="#FF7C9A" stroke="#E5557A" strokeWidth="2" />
          <path d="M880 96 C886 90 890 96 887 102 C884 106 879 103 880 96 Z" fill="#FF7C9A" stroke="#E5557A" strokeWidth="2" />
          {/* sao trang trí */}
          <Star x={-22} y={34} s={1.15} rot={-12} />
          <Star x={738} y={-6} s={0.9} rot={14} />
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
