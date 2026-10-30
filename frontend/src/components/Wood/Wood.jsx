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
        <svg className="wood-brush" viewBox="0 0 150 70" aria-hidden="true">
          <rect x="2" y="26" width="38" height="20" rx="4" fill="#F2C16B" stroke="#8A4A15" strokeWidth="3" />
          <rect x="30" y="22" width="14" height="28" rx="3" fill="#E6A93F" stroke="#8A4A15" strokeWidth="3" />
          <path d="M44 20 Q80 2 128 6 Q148 10 144 28 Q146 52 126 62 Q84 72 44 50 Z" fill="#B0601B" stroke="#6B3410" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M96 12 Q132 6 140 20 Q138 40 118 44 Q104 34 96 12 Z" fill="#FF5A6E" />
          <path d="M60 28 Q84 20 110 24 M58 40 Q86 46 112 40" stroke="#8A4A15" strokeWidth="2.5" fill="none" strokeLinecap="round" />
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
