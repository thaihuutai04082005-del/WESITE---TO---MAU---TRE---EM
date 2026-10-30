// Bộ khung "bảng gỗ" cho các trang chọn tranh tô màu: nền như trang chủ, biển tiêu đề treo, bảng gỗ lớn, khung tranh.
import { Link } from 'react-router-dom';
import PictureView from '../PictureView/PictureView';
import Icon from '../Icon';

const HOME_BG = 'url(/home-bg.webp)';
const WORD_COLORS = ['#2B9BF4', '#FFB020', '#EF4B4B', '#34C759'];

/** Nền: cùng ảnh với trang chủ. */
export function WoodScene({ children }) {
  return (
    <div className="wood-scene bg-[#BFE8FF] bg-cover bg-fixed bg-center bg-no-repeat" style={{ backgroundImage: HOME_BG }}>
      <div className="wood-scene-in">{children}</div>
    </div>
  );
}

/** Biển tiêu đề treo bằng dây, đầu bên phải có cây cọ. Chữ nhiều màu viền trắng. */
export function WoodSign({ title, hint }) {
  const words = String(title).split(' ');
  return (
    <div className="wood-sign-wrap">
      <span className="wood-rope" style={{ left: '17%' }} />
      <span className="wood-rope" style={{ right: '23%' }} />
      <div className="wood-sign">
        <h1 className="wood-sign-title" data-testid="wood-title">
          {words.map((w, i) => (
            <span key={`${w}-${i}`} style={{ color: WORD_COLORS[i % WORD_COLORS.length] }}>
              {w}{' '}
            </span>
          ))}
        </h1>
        <svg className="wood-brush" viewBox="-2 -2 156 74" aria-hidden="true">
          <defs>
            <clipPath id="wood-brush-head">
              <path d="M36 15 C50 6 70 7 92 5 C114 3 134 0 149 5 C148 19 141 35 129 48 C110 66 66 68 36 55 Z" />
            </clipPath>
          </defs>
          {/* cán gỗ + vành kim loại nối với biển */}
          <rect x="0" y="22" width="14" height="26" fill="#F0B35A" />
          <rect x="10" y="12" width="28" height="46" rx="6" fill="#F6C46D" stroke="#B5651F" strokeWidth="3" />
          <path d="M18 16 V54 M26 15 V55" stroke="#E0953A" strokeWidth="3" strokeLinecap="round" />
          {/* đầu cọ: lông kem, gốc nâu răng cưa, ngọn hồng */}
          <g clipPath="url(#wood-brush-head)">
            <rect x="30" y="0" width="122" height="70" fill="#F9DDAA" />
            <path d="M30 0 H78 L70 12 L84 20 L68 28 L86 38 L68 46 L82 56 L68 70 H30 Z" fill="#E9A85A" />
            <path d="M30 0 H62 L56 11 L68 19 L54 27 L70 37 L54 45 L66 55 L56 70 H30 Z" fill="#8A4A1F" />
            <path d="M110 0 H152 V22 C141 26 135 38 127 50 C125 32 119 14 110 0 Z" fill="#FF5C7C" />
            <path d="M122 4 C134 4 142 6 146 12" stroke="#FFB3C2" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
          <path d="M36 15 C50 6 70 7 92 5 C114 3 134 0 149 5 C148 19 141 35 129 48 C110 66 66 68 36 55 Z" fill="none" stroke="#7A3F12" strokeWidth="3.5" strokeLinejoin="round" />
        </svg>
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
