import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import Icon from '../../components/Icon';
import useWide from '../../hooks/useWide';

// Cảnh giá sách (ảnh nền 1821×760): 2 kệ × 4 ô. Ô đầu tiên là "Tạo truyện mới", các ô sau là truyện của bé.
const W = 1821;
const H = 760;
const SLOTS = [
  // kệ trên (sách đứng cao)
  [254, 150, 300, 224], [614, 150, 300, 224], [974, 150, 300, 224], [1334, 150, 300, 224],
  // kệ dưới (sách nằm thấp)
  [277, 436, 240, 150], [637, 436, 240, 150], [997, 436, 240, 150], [1357, 436, 240, 150],
];
const pc = (v, total) => `${(v / total) * 100}%`;
const box = ([x, y, w, h]) => ({ left: pc(x, W), top: pc(y, H), width: pc(w, W), height: pc(h, H) });

function Star({ className }) {
  return (
    <svg viewBox="-24 -24 48 48" className={className} aria-hidden="true">
      <path d="M0 -20 L6 -6.5 L20 -5.5 L9.5 4 L12.5 18 L0 10.5 L-12.5 18 L-9.5 4 L-20 -5.5 L-6 -6.5 Z" fill="currentColor" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

function Spark({ className }) {
  return <span className={`sb-spark ${className}`} aria-hidden="true" />;
}

function BookShell({ children, className = '' }) {
  return (
    <>
      <span className="sb-spine" aria-hidden="true" />
      <span className={`sb-cover ${className}`}>{children}</span>
    </>
  );
}

function SlotBook({ book }) {
  const { t } = useTranslation();
  return (
    <BookShell>
      {book.cover ? <img src={book.cover} alt="" draggable={false} className="sb-cover-img" /> : <span className="sb-cover-blank"><Icon name="book" size={48} /></span>}
      <span className={`sb-tag${book.completed ? ' sb-tag-done' : ''}`}>{book.completed ? t('storybook.done') : t('storybook.draft')}</span>
      <span className="sb-title">
        <b>{book.title}</b>
        <small>{t('storybook.pages', { n: book.pageCount })}</small>
      </span>
    </BookShell>
  );
}

function SlotCreate() {
  const { t } = useTranslation();
  return (
    <BookShell className="sb-cover-create">
      <Star className="sb-cstar sb-cstar-tl" />
      <Star className="sb-cstar sb-cstar-tr" />
      <Star className="sb-cstar sb-cstar-bl" />
      <Star className="sb-cstar sb-cstar-br" />
      <span className="sb-plus"><Icon name="plus" size={40} strokeWidth={3.4} /></span>
      <span className="sb-create-text">{t('storybook.new')}</span>
    </BookShell>
  );
}

function EmptySlot() {
  return (
    <span className="sb-empty" aria-hidden="true">
      <Star className="sb-empty-star" />
    </span>
  );
}

function StorybookRoom({ books }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const items = [{ create: true }, ...(books || [])];
  const per = SLOTS.length;
  const pages = Math.max(1, Math.ceil(items.length / per));
  const cur = Math.min(page, pages - 1);
  const shown = items.slice(cur * per, cur * per + per);
  return (
    <div className="sb-room">
      <div className="sb-stage" data-testid="storybook-room">
        <Spark className="sb-spark-l1" />
        <Spark className="sb-spark-l2" />
        <Spark className="sb-spark-r1" />
        <Spark className="sb-spark-r2" />
        <div className="sb-sign" style={box([583, 20, 669, 96])}>
          <span className="sb-hook sb-hook-l" />
          <span className="sb-hook sb-hook-r" />
          <Star className="sb-sign-star sb-sign-star-l" />
          <h1 className="sb-sign-title" data-testid="storybook-title">{t('storybook.signTitle')}</h1>
          <Star className="sb-sign-star sb-sign-star-r" />
        </div>
        <p className="sb-sub" style={box([583, 118, 669, 30])}>{t('storybook.subtitle')}</p>
        <Link to="/storybooks/new" className="sb-new" style={box([1403, 31, 305, 70])} data-testid="storybook-new">
          <Icon name="plus" size={26} strokeWidth={3.6} /> {t('storybook.new')}
        </Link>

        {SLOTS.map((geo, i) => {
          const it = shown[i];
          const style = box(geo);
          if (!it) return <span key={i} className="sb-slot sb-slot-empty" style={style}><EmptySlot /></span>;
          if (it.create) return <Link key="create" to="/storybooks/new" className="sb-slot" style={style} data-testid="storybook-new-card" aria-label={t('storybook.new')}><SlotCreate /></Link>;
          return <Link key={it.id} to={`/storybooks/${it.id}`} className="sb-slot" style={style} data-testid={`storybook-${it.id}`} aria-label={it.title}><SlotBook book={it} /></Link>;
        })}

        {pages > 1 && (
          <>
            <button type="button" className="sb-arrow" style={box([520, 676, 58, 58])} disabled={cur === 0} onClick={() => setPage(cur - 1)} aria-label={t('common.back')} data-testid="storybook-prev">
              <Icon name="back" size={22} strokeWidth={3.4} />
            </button>
            <span className="sb-page" style={box([870, 690, 82, 34])}>{cur + 1}/{pages}</span>
            <button type="button" className="sb-arrow" style={box([1244, 676, 58, 58])} disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)} aria-label={t('common.next')} data-testid="storybook-next">
              <Icon name="chevronRight" size={22} strokeWidth={3.4} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function StorybookList() {
  const { t } = useTranslation();
  const wide = useWide();
  const [books, setBooks] = useState(null);
  useEffect(() => {
    api.get('/storybooks').then((r) => setBooks(r.storybooks)).catch(() => window.dispatchEvent(new Event('btm:page-ready')));
  }, []);
  // Báo cho hiệu ứng chuyển màn hình (StoryTransition) biết trang đã sẵn sàng.
  useEffect(() => {
    if (books) window.dispatchEvent(new Event('btm:page-ready'));
  }, [books]);
  if (wide) return <StorybookRoom books={books} />;
  return (
    <div className="page space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="page-title">{t('storybook.title')}</h1>
          <p className="text-muted">{t('storybook.subtitle')}</p>
        </div>
        <Link to="/storybooks/new" className="btn-primary" data-testid="storybook-new">
          <Icon name="plus" /> {t('storybook.new')}
        </Link>
      </div>
      {books && books.length === 0 && <div className="card p-8 text-center text-muted">{t('storybook.empty')}</div>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {(books || []).map((b) => (
          <Link key={b.id} to={`/storybooks/${b.id}`} className="card p-2 transition hover:-translate-y-1">
            {b.cover ? <img src={b.cover} alt="" className="aspect-square w-full rounded-2xl border border-line" /> : <div className="flex aspect-square items-center justify-center rounded-2xl bg-primary-light"><Icon name="book" size={48} /></div>}
            <div className="mt-1 truncate font-display text-lg font-bold">{b.title}</div>
            <div className="text-xs text-muted">
              {t('storybook.pages', { n: b.pageCount })} · {b.completed ? t('storybook.done') : t('storybook.draft')}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
