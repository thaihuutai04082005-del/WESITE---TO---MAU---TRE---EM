// Trình tạo cuốn truyện: chọn tranh Sáng tạo đã hoàn thành, sắp thứ tự trang, thêm lời thoại/chú thích.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useUi } from '../../store/ui';
import { errorText } from '../../lib/format';
import Icon from '../../components/Icon';

export default function StorybookEditor() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toast = useUi((s) => s.toast);
  const [title, setTitle] = useState('');
  const [pages, setPages] = useState([]);
  const [available, setAvailable] = useState([]);

  useEffect(() => {
    api.get('/artworks?status=completed&mode=free').then((r) => setAvailable(r.artworks));
    if (id)
      api.get(`/storybooks/${id}`).then((r) => {
        setTitle(r.storybook.title);
        setPages(r.storybook.pages.map((p) => ({ artworkId: p.artworkId, caption: p.caption, image: p.image })));
      });
  }, [id]);

  const inBook = new Set(pages.map((p) => p.artworkId));
  const add = (a) => setPages([...pages, { artworkId: a.id, caption: '', image: a.thumbnail }]);
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= pages.length) return;
    const next = [...pages];
    [next[i], next[j]] = [next[j], next[i]];
    setPages(next);
  };

  async function save() {
    try {
      const body = { title, pages: pages.map(({ artworkId, caption }) => ({ artworkId, caption })) };
      const r = id ? await api.put(`/storybooks/${id}`, body) : await api.post('/storybooks', body);
      toast(t('storybook.saved'), 'success');
      navigate(`/storybooks/${r.storybook.id}`);
    } catch (e) {
      toast(errorText(t, e), 'error');
    }
  }

  return (
    <div className="page space-y-5">
      <Link to="/storybooks" className="inline-flex items-center gap-1 font-bold text-primary">
        <Icon name="back" size={20} /> {t('storybook.title')}
      </Link>
      <h1 className="page-title">{id ? t('storybook.edit') : t('storybook.new')}</h1>
      <div>
        <label className="label" htmlFor="sb-title">{t('storybook.bookTitle')}</label>
        <input id="sb-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder={t('storybook.titlePlaceholder')} data-testid="storybook-title" />
      </div>

      <section>
        <h2 className="mb-2 font-display text-2xl font-bold">{t('storybook.pagesTitle', { n: pages.length })}</h2>
        {pages.length === 0 && <p className="text-muted">{t('storybook.addHint')}</p>}
        <ol className="space-y-3">
          {pages.map((p, i) => (
            <li key={p.artworkId} className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="w-8 text-center font-display text-2xl font-extrabold text-primary">{i + 1}</span>
                {p.image ? <img src={p.image} alt="" className="h-24 w-24 rounded-xl border border-line" /> : <div className="h-24 w-24 rounded-xl bg-primary-light" />}
              </div>
              <textarea className="input min-h-24 flex-1 py-2" value={p.caption} maxLength={200} placeholder={t('storybook.captionPlaceholder')} onChange={(e) => setPages(pages.map((x, k) => (k === i ? { ...x, caption: e.target.value } : x)))} aria-label={t('storybook.caption')} data-testid={`caption-${i}`} />
              <div className="flex gap-1 sm:flex-col">
                <button type="button" className="btn-ghost min-h-11 px-3" onClick={() => move(i, -1)} disabled={i === 0} aria-label={t('storybook.moveUp')}><Icon name="up" /></button>
                <button type="button" className="btn-ghost min-h-11 px-3" onClick={() => move(i, 1)} disabled={i === pages.length - 1} aria-label={t('storybook.moveDown')}><Icon name="down" /></button>
                <button type="button" className="btn-ghost min-h-11 px-3 text-danger" onClick={() => setPages(pages.filter((_, k) => k !== i))} aria-label={t('common.delete')}><Icon name="trash" /></button>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-1 font-display text-2xl font-bold">{t('storybook.pick')}</h2>
        <p className="mb-2 text-sm text-muted">{t('storybook.pickHint')}</p>
        {available.length === 0 && (
          <div className="card p-4 text-center text-muted">
            {t('storybook.noArtworks')} <Link to="/color" className="font-bold text-primary">{t('nav.color')}</Link>
          </div>
        )}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6">
          {available.map((a) => (
            <button key={a.id} type="button" disabled={inBook.has(a.id)} onClick={() => add(a)} className="card relative p-1 disabled:opacity-40" data-testid={`sb-add-${a.id}`}>
              {a.thumbnail ? <img src={a.thumbnail} alt="" className="aspect-square w-full rounded-xl" /> : <div className="aspect-square rounded-xl bg-primary-light" />}
              <div className="truncate text-xs font-bold">{a.name[i18n.language]}</div>
              {!inBook.has(a.id) && <span className="absolute right-1 top-1 rounded-full bg-primary p-1 text-white"><Icon name="plus" size={16} /></span>}
            </button>
          ))}
        </div>
      </section>

      <div className="sticky bottom-20 flex justify-end md:bottom-4">
        <button type="button" className="btn-coral shadow-pop" onClick={save} disabled={!title.trim() || pages.length === 0} data-testid="storybook-save">
          <Icon name="save" /> {t('common.save')}
        </button>
      </div>
    </div>
  );
}
