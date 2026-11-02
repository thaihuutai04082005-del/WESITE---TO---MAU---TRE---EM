// Xem cuốn truyện dạng lật trang (Mục 10.2): bìa kem viền cam (hoặc bìa đã mua), trang tranh nằm ngang.
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import { coverOf } from '../../lib/storyCovers';

function Star({ className }) {
  return (
    <svg viewBox="-24 -24 48 48" className={className} aria-hidden="true">
      <path d="M0 -20 L6 -6.5 L20 -5.5 L9.5 4 L12.5 18 L0 10.5 L-12.5 18 L-9.5 4 L-20 -5.5 L-6 -6.5 Z" fill="#FFE9A0" stroke="#F5C04D" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

function Paw({ className }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g fill="#FFDD7A">
        <ellipse cx="32" cy="42" rx="15" ry="12" />
        <ellipse cx="13" cy="28" rx="6.5" ry="8.5" transform="rotate(-18 13 28)" />
        <ellipse cx="25" cy="16" rx="6.5" ry="9" transform="rotate(-6 25 16)" />
        <ellipse cx="40" cy="16" rx="6.5" ry="9" transform="rotate(6 40 16)" />
        <ellipse cx="52" cy="28" rx="6.5" ry="8.5" transform="rotate(18 52 28)" />
      </g>
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 96 76" className="sbv-book" aria-hidden="true">
      <path d="M6 18q21-8 42 4 21-12 42-4v50q-21-8-42 4-21-12-42-4z" fill="#F6B73C" stroke="#D9921A" strokeWidth="3" strokeLinejoin="round" />
      <path d="M12 22q18-6 36 4v38q-18-8-36-2z" fill="#FFE59A" />
      <path d="M84 22q-18-6-36 4v38q18-8 36-2z" fill="#FFE59A" />
      <path d="M48 26v38" stroke="#D9921A" strokeWidth="2.5" />
      <path d="M62 8h13v24l-6.5-5-6.5 5z" fill="#4DA3FF" stroke="#2B7BD9" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * `editor` (tuỳ chọn) = chế độ soạn ngay trên cuốn truyện: { setTitle, onCover(), onPick(pageIdx), onCaption(pageIdx, text) }.
 * Có `editor` thì tên truyện / lời thoại là ô nhập, bìa có nút chọn bìa, trang trống có nút chọn tranh từ bộ sưu tập.
 * `index` + `onIndex` (tuỳ chọn) để cha điều khiển trang đang mở.
 */
export default function FlipbookViewer({ title, author, pages = [], coverStyle = null, editor = null, index: indexProp, onIndex }) {
  const { t } = useTranslation();
  const cv = coverOf(coverStyle);
  const sheets = [{ cover: true }, ...pages];
  const [indexState, setIndexState] = useState(0);
  const controlled = indexProp !== undefined;
  const index = controlled ? indexProp : indexState;
  const setIndex = useCallback(
    (fn) => {
      const v = typeof fn === 'function' ? fn(controlled ? indexProp : indexState) : fn;
      if (controlled) onIndex?.(v);
      else setIndexState(v);
    },
    [controlled, indexProp, indexState, onIndex],
  );
  const next = useCallback(() => setIndex((i) => Math.min(sheets.length - 1, i + 1)), [sheets.length, setIndex]);
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), [setIndex]);

  useEffect(() => {
    const onKey = (e) => {
      if (editor || /^(INPUT|TEXTAREA)$/.test(e.target?.tagName)) return; // đang gõ chữ: phím mũi tên không lật trang
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, editor]);

  return (
    <div className="sbv-wrap" data-testid="flipbook">
      <div className="sbv-frame">
        <div className="flip-stage sbv-stage">
          {sheets.map((p, i) => (
            <div key={i} className={`flip-page sbv-sheet ${i < index ? 'turned' : ''}`} style={{ zIndex: sheets.length - i, background: p.cover ? cv.bg : '#FFFFFF', borderColor: p.cover ? cv.line : '#F6D88E' }}>
              {p.cover ? (
                <div className="sbv-cover">
                  <Star className="sbv-star sbv-star-1" />
                  <Star className="sbv-star sbv-star-2" />
                  <Paw className="sbv-paw" />
                  <span className="sbv-cloud sbv-cloud-l" />
                  <span className="sbv-cloud sbv-cloud-r" />
                  <BookIcon />
                  {editor ? (
                    <input
                      className="sbv-title sbv-title-input"
                      value={title}
                      maxLength={80}
                      placeholder={t('storybook.titleOnCover')}
                      onChange={(e) => editor.setTitle(e.target.value)}
                      style={{ fontSize: `min(8cqw, ${(86 / Math.max(8, [...title].length * 0.62)).toFixed(2)}cqw)` }}
                      aria-label={t('storybook.bookTitle')}
                      data-testid="storybook-title"
                    />
                  ) : (
                    <h2 className="sbv-title" style={[...title].length <= 28 ? { fontSize: `min(8cqw, ${(86 / Math.max(6, [...title].length * 0.58)).toFixed(2)}cqw)` } : { fontSize: '5.4cqw', whiteSpace: 'normal' }}>{title}</h2>
                  )}
                  {author && <div className="sbv-author">{t('storybook.by', { name: author })}</div>}
                  {editor && (
                    <button type="button" className="sbv-cover-btn" onClick={editor.onCover} data-testid="pick-cover">
                      <Icon name="palette" size={18} strokeWidth={2.6} /> {t('storybook.chooseCover')}
                    </button>
                  )}
                </div>
              ) : (
                <div className="sbv-page">
                  <div className="sbv-pic">
                    {p.image ? <img src={p.image} alt="" /> : editor ? null : <div className="sbv-nopic" />}
                    {editor && !p.image && (
                      <button type="button" className="sbv-pick" onClick={() => editor.onPick(i - 1)} data-testid={`pick-art-${i - 1}`}>
                        <Icon name="plus" size={34} strokeWidth={3} />
                        <span>{t('storybook.pickFromCollection')}</span>
                      </button>
                    )}
                    {editor && p.image && (
                      <button type="button" className="sbv-change" onClick={() => editor.onPick(i - 1)} data-testid={`change-art-${i - 1}`}>
                        <Icon name="palette" size={16} strokeWidth={2.6} /> {t('storybook.changePicture')}
                      </button>
                    )}
                  </div>
                  <div className="sbv-cap">
                    {editor ? (
                      <textarea className="sbv-cap-input" value={p.caption} maxLength={200} placeholder={t('storybook.captionHere')} onChange={(e) => editor.onCaption(i - 1, e.target.value)} aria-label={t('storybook.caption')} data-testid={`caption-${i - 1}`} />
                    ) : (
                      <p>{p.caption}</p>
                    )}
                    <span className="sbv-num">{i}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="sbv-nav">
        <button type="button" className="sbv-arrow" onClick={prev} disabled={index === 0} aria-label={t('common.prev')}>
          <Icon name="back" size={26} strokeWidth={3} />
        </button>
        <span className="sbv-count">{index}/{sheets.length - 1}</span>
        <button type="button" className="sbv-arrow sbv-arrow-go" onClick={next} disabled={index >= sheets.length - 1} aria-label={t('common.next')}>
          <Icon name="back" size={26} strokeWidth={3} className="rotate-180" />
        </button>
      </div>
    </div>
  );
}

/** Nền trang xem truyện: trời kem, bụi cây hai góc, thùng bút chì + bảng màu trang trí. */
export function StoryBackdrop({ children }) {
  return (
    <div className="sbv-root">
      <img src="/storybook/bucket.webp" alt="" className="sbv-deco sbv-deco-l" draggable={false} />
      <img src="/storybook/palette.webp" alt="" className="sbv-deco sbv-deco-r" draggable={false} />
      <Daisy className="sbv-daisy sbv-daisy-1" />
      <Daisy className="sbv-daisy sbv-daisy-2" />
      <div className="sbv-content">{children}</div>
    </div>
  );
}

function Daisy({ className }) {
  return (
    <svg viewBox="-20 -20 40 40" className={className} aria-hidden="true">
      <g fill="#FFFFFF" stroke="#E9DDB8" strokeWidth="0.8">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ellipse key={i} cx="0" cy="-10" rx="5.6" ry="8" transform={`rotate(${i * 60})`} />
        ))}
      </g>
      <circle r="6" fill="#FFC53D" />
    </svg>
  );
}
