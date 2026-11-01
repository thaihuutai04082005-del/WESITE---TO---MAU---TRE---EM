// Nhiệm vụ (Mục 8): Cấp độ + Ruby + nhiệm vụ của cấp. Hạng đấu ở Đấu trường, Điểm Gacha ở Bóc thẻ.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import Icon from '../../components/Icon';
import { RubyGem } from '../../components/ShopScene';
import { MissionArt } from '../../components/Illustrations';

function Bar({ value, max, color, height = 12 }) {
  const pct = Math.max(0, Math.min(100, (value / (max || 1)) * 100));
  return (
    <div className="w-full overflow-hidden rounded-full bg-[#E4EEF8]" style={{ height }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

/** Biểu tượng đầu trang: tấm bia mục tiêu có mũi tên (đầu nhọn + đuôi lông vũ) cắm trúng hồng tâm. */
function TargetBadge() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <circle cx="30" cy="34" r="26" fill="#FFFFFF" stroke="#1B2A38" strokeWidth="2.5" />
      <circle cx="30" cy="34" r="19" fill="#FF7AA2" />
      <circle cx="30" cy="34" r="12" fill="#FFFFFF" />
      <circle cx="30" cy="34" r="6" fill="#FF5F7E" />
      <g stroke="#1B2A38" strokeWidth="1.8" strokeLinejoin="round">
        <path d="M33 31 L53 11" stroke="#8B5A2B" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M46 18 L41 15 L49 5 L54 10 Z" fill="#2B9BF4" />
        <path d="M46 18 L49 23 L59 15 L54 10 Z" fill="#4FA3E0" />
        <path d="M27 37 L30 28 L36 34 Z" fill="#C9D4DE" />
      </g>
      <path d="M6 12 l3 -6 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 Z" fill="#FFD54F" />
    </svg>
  );
}

/** Núi có lá cờ trên đỉnh cho ô Cấp độ. */
function MountainFlag() {
  return (
    <svg viewBox="0 0 64 56" className="h-full w-full" aria-hidden="true">
      <path d="M2 52 L24 14 L36 34 L44 22 L62 52 Z" fill="#3DBE62" stroke="#1B2A38" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M24 14 L18 25 L24 22 L29 26 Z" fill="#FFFFFF" />
      <path d="M24 14 V3" stroke="#1B2A38" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M24 3 L36 6.5 L24 10 Z" fill="#FF9F43" stroke="#1B2A38" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

/** Tấm bảng kẹp giấy có dấu tích trong nhãn "Nhiệm vụ Cấp N". */
function ClipboardBadge() {
  return (
    <svg viewBox="0 0 48 56" className="h-full w-full" aria-hidden="true">
      <rect x="5" y="8" width="38" height="44" rx="6" fill="#FFB35C" stroke="#1B2A38" strokeWidth="2.4" />
      <rect x="10" y="14" width="28" height="34" rx="3" fill="#FFFFFF" />
      <rect x="16" y="3" width="16" height="9" rx="3" fill="#6FA8FF" stroke="#1B2A38" strokeWidth="2.2" />
      <path d="M14 22l3 3 5-6M14 33l3 3 5-6M14 44l3 3 5-6" fill="none" stroke="#2FA65A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 22h8M26 33h8M26 44h8" stroke="#B9C7D6" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export default function Progression() {
  const { t, i18n } = useTranslation();
  const [p, setP] = useState(null);
  useEffect(() => {
    api.get('/progression').then(setP).catch(() => window.dispatchEvent(new Event('btm:page-ready')));
  }, []);
  // Báo cho hiệu ứng chuyển màn hình (MissionTransition) biết trang đã sẵn sàng.
  useEffect(() => {
    if (p) window.dispatchEvent(new Event('btm:page-ready'));
  }, [p]);
  if (!p) return <div className="page text-muted">{t('common.loading')}</div>;
  const done = p.missions.filter((m) => m.completed).length;

  return (
    <div className="hs-stage">
      <div className="page mp-page">
        <header className="mp-head">
          <div className="mp-badge"><TargetBadge /></div>
          <div className="min-w-0">
            <h1 className="mp-title">{t('missions.title')}</h1>
            <p className="mp-sub">{t('missions.subtitle')}</p>
          </div>
          <div className="mp-art"><MissionArt /></div>
        </header>

        <div className="mp-stats">
          <div className="mp-stat">
            <span className="mp-stat-ic"><MountainFlag /></span>
            <div>
              <div className="mp-stat-l">{t('missions.cards.level')}</div>
              <div className="mp-stat-v">{p.level}/{p.maxLevel}</div>
            </div>
          </div>
          <div className="mp-stat">
            <span className="mp-stat-ic"><RubyGem size={56} /></span>
            <div>
              <div className="mp-stat-l">Ruby</div>
              <div className="mp-stat-v" data-testid="mission-ruby">{p.ruby}</div>
            </div>
          </div>
        </div>

        <section className="mp-panel">
          <div className="mp-tab">
            <span className="mp-tab-ic"><ClipboardBadge /></span>
            <h2>{t('missions.levelMissions', { level: p.level })}</h2>
          </div>
          <span className="mp-count">{done}/{p.missions.length}</span>
          {p.maxed ? (
            <div className="mp-maxed">{t('missions.maxed')}</div>
          ) : (
            <ul className="mp-list" data-testid="mission-list">
              {p.missions.map((m) => (
                <li key={m.id} className={`mp-row ${m.completed ? 'mp-row-done' : ''}`}>
                  <span className={`mp-mark ${m.completed ? 'mp-mark-done' : ''}`}>
                    {m.completed ? <Icon name="check" size={34} strokeWidth={3.4} /> : <span className="mp-ring" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mp-name">{m.titles?.[i18n.language] || m.title}</div>
                    <div className="mp-reward"><RubyGem size={20} /> +{m.ruby} Ruby</div>
                    <Bar value={m.progress} max={m.target} color={m.completed ? '#2FBF55' : '#2B9BF4'} />
                  </div>
                  <div className={`mp-prog ${m.completed ? 'mp-prog-done' : ''}`}>{m.progress}/{m.target}</div>
                </li>
              ))}
            </ul>
          )}
          <p className="mp-hint">
            <Icon name="bulb" size={22} className="text-[#E6A817]" /> {t('missions.hint')}
          </p>
        </section>
      </div>
    </div>
  );
}
