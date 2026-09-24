import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import Icon from '../../components/Icon';

export default function StorybookList() {
  const { t } = useTranslation();
  const [books, setBooks] = useState(null);
  useEffect(() => {
    api.get('/storybooks').then((r) => setBooks(r.storybooks));
  }, []);
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
