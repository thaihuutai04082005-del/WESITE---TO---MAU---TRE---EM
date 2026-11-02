// Soạn truyện ngay trên cuốn truyện: gõ tên truyện + chọn bìa trực tiếp trên bìa; lật vào trang trong thì chọn tranh từ bộ sưu tập,
// viết lời thoại ngay dưới tranh, muốn viết tiếp thì thêm trang mới.
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';
import { useUi } from '../../store/ui';
import { errorText } from '../../lib/format';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal/Modal';
import FlipbookViewer, { StoryBackdrop } from '../../components/FlipbookViewer/FlipbookViewer';
import { coverOf } from '../../lib/storyCovers';

const MAX_PAGES = { free: 10, vip: 200 }; // khớp STORYBOOK_LIMITS ở backend
const blank = () => ({ artworkId: null, caption: '', image: null });

export default function StorybookEditor() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const vip = useAuth((s) => !!s.plan?.vip);
  const maxPages = vip ? MAX_PAGES.vip : MAX_PAGES.free;
  const toast = useUi((s) => s.toast);
  const [title, setTitle] = useState('');
  const [pages, setPages] = useState([blank()]);
  const [coverStyle, setCoverStyle] = useState(null);
  const [available, setAvailable] = useState([]);
  const [covers, setCovers] = useState([]); // bìa đã mua trong Shop
  const [index, setIndex] = useState(0); // 0 = bìa
  const [pickFor, setPickFor] = useState(null); // số trang (từ 0) đang chọn tranh
  const [coverOpen, setCoverOpen] = useState(false);
  const [leaveAsk, setLeaveAsk] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(!id);
  const [snap, setSnap] = useState(() => JSON.stringify({ title: '', coverStyle: null, pages: [blank()] }));

  useEffect(() => {
    api.get('/artworks?status=completed').then((r) => setAvailable(r.artworks));
    api.get('/shop').then((r) => setCovers(r.items.filter((i) => i.type === 'storybook_cover' && i.owned))).catch(() => {});
    if (id)
      api.get(`/storybooks/${id}`).then((r) => {
        const b = r.storybook;
        const ps = b.pages.length ? b.pages.map((p) => ({ artworkId: p.artworkId, caption: p.caption, image: p.image })) : [blank()];
        setTitle(b.title);
        setCoverStyle(b.coverStyle);
        setPages(ps);
        setSnap(JSON.stringify({ title: b.title, coverStyle: b.coverStyle, pages: ps }));
        setLoaded(true);
      });
  }, [id]);

  const dirty = useMemo(() => JSON.stringify({ title, coverStyle, pages }) !== snap, [title, coverStyle, pages, snap]);
  // Báo trình duyệt khi đóng tab lúc chưa lưu.
  useEffect(() => {
    if (!dirty) return undefined;
    const h = (e) => e.preventDefault();
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const page = index > 0 ? pages[index - 1] : null;
  const used = new Set(pages.map((p) => p.artworkId).filter(Boolean));
  const setPage = (i, patch) => setPages((ps) => ps.map((p, k) => (k === i ? { ...p, ...patch } : p)));

  // Mỗi lần bấm chỉ thêm đúng 1 trang. Đã có sẵn một trang trống (chưa có tranh, chưa có chữ) thì đưa bé tới trang đó, không thêm trang trống thứ hai.
  const addPage = () => {
    const empty = pages.findIndex((p) => !p.artworkId && !p.caption.trim());
    if (empty >= 0) return setIndex(empty + 1);
    if (pages.length >= maxPages) return toast(vip ? t('storybook.maxPages', { n: maxPages }) : t('errors.storybook_pages_limit'), 'error');
    const at = index === 0 ? pages.length : index; // chèn ngay sau trang đang xem; đang ở bìa thì thêm vào cuối truyện
    setPages((ps) => [...ps.slice(0, at), blank(), ...ps.slice(at)]);
    setIndex(at + 1);
  };
  const removePage = () => {
    if (!page) return;
    setPages((ps) => (ps.length === 1 ? [blank()] : ps.filter((_, k) => k !== index - 1)));
    setIndex((i) => Math.max(0, pages.length === 1 ? 0 : i - 1));
  };

  async function save() {
    if (!title.trim()) {
      setIndex(0);
      return toast(t('storybook.needTitle'), 'error');
    }
    const keep = pages.map((p, i) => ({ ...p, n: i + 1 })).filter((p) => p.artworkId || p.caption.trim());
    const bad = keep.find((p) => !p.artworkId);
    if (bad) {
      setIndex(bad.n);
      return toast(t('storybook.needPicture', { n: bad.n }), 'error');
    }
    if (!keep.length) {
      setIndex(1);
      return toast(t('storybook.needPage'), 'error');
    }
    setSaving(true);
    try {
      const body = { title: title.trim(), coverStyle, pages: keep.map(({ artworkId, caption }) => ({ artworkId, caption })) };
      const r = id ? await api.put(`/storybooks/${id}`, body) : await api.post('/storybooks', body);
      toast(t('storybook.saved'), 'success');
      setSnap(JSON.stringify({ title, coverStyle, pages })); // đã lưu: không còn cảnh báo chưa lưu
      navigate(`/storybooks/${r.storybook.id}`, { replace: true });
    } catch (e) {
      toast(errorText(t, e), 'error');
    } finally {
      setSaving(false);
    }
  }

  // Quay lại đúng màn hình trước đó (không đi vòng qua trang danh sách truyện nên không chạy lại hiệu ứng mở truyện).
  const leave = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(id ? `/storybooks/${id}` : '/storybooks');
  };
  const back = () => (dirty ? setLeaveAsk(true) : leave());

  if (!loaded) return <div className="page text-muted">{t('common.loading')}</div>;

  return (
    <StoryBackdrop>
      <button type="button" onClick={back} className="sbv-back" data-testid="editor-back">
        <Icon name="back" size={20} strokeWidth={3} /> {t('common.back')}
      </button>
      <FlipbookViewer
        title={title}
        author={user?.nickname}
        pages={pages}
        coverStyle={coverStyle}
        index={index}
        onIndex={setIndex}
        editor={{
          setTitle,
          onCover: () => setCoverOpen(true),
          onPick: (i) => setPickFor(i),
          onCaption: (i, v) => setPage(i, { caption: v }),
        }}
      />
      <div className="sbv-actions">
        <button type="button" className="btn-ghost" onClick={addPage} disabled={!!page && !page.artworkId} title={page && !page.artworkId ? t('storybook.pickFirst') : ''} data-testid="add-page">
          <Icon name="plus" /> {t('storybook.addPage')}
        </button>
        {page && (
          <button type="button" className="btn-ghost text-danger" onClick={removePage} aria-label={t('storybook.removePage')} title={t('storybook.removePage')} data-testid="remove-page">
            <Icon name="trash" />
          </button>
        )}
        <button type="button" className="btn-coral" onClick={save} disabled={saving} data-testid="storybook-save">
          <Icon name="save" /> {t('storybook.saveBook')}
        </button>
      </div>

      {/* Chọn bìa ngay trên bìa */}
      <Modal open={coverOpen} onClose={() => setCoverOpen(false)}>
        <h2 className="mb-3 font-display text-2xl font-extrabold">{t('storybook.coverPick')}</h2>
        <div className="flex flex-wrap items-center gap-3" data-testid="cover-list">
          {[{ slug: null, name: { vi: t('storybook.coverDefault'), en: t('storybook.coverDefault') } }, ...covers].map((c) => {
            const cv = coverOf(c.slug);
            const on = coverStyle === c.slug;
            return (
              <button
                key={c.slug || 'default'}
                type="button"
                onClick={() => {
                  setCoverStyle(c.slug);
                  setCoverOpen(false);
                }}
                aria-pressed={on}
                title={c.name[i18n.language]}
                data-testid={`cover-${c.slug || 'default'}`}
                className={`relative h-24 w-[76px] rounded-xl border-4 ${on ? 'ring-4 ring-primary/40' : ''}`}
                style={{ background: cv.bg, borderColor: cv.line }}
              >
                {on && <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-white"><Icon name="check" size={14} strokeWidth={3.4} /></span>}
              </button>
            );
          })}
        </div>
        {covers.length === 0 && (
          <Link to="/shop" className="mt-3 inline-block text-sm font-bold text-primary">
            {t('storybook.buyCovers')}
          </Link>
        )}
      </Modal>

      {/* Chọn tranh từ bộ sưu tập cho trang đang soạn */}
      <Modal open={pickFor !== null} onClose={() => setPickFor(null)} wide>
        <h2 className="font-display text-2xl font-extrabold">{t('storybook.pickFromCollection')}</h2>
        <p className="mb-3 text-sm text-muted">{t('storybook.pickHint')}</p>
        {available.length === 0 && (
          <div className="card p-4 text-center text-muted">
            {t('storybook.noArtworks')} <Link to="/color" className="font-bold text-primary">{t('nav.color')}</Link>
          </div>
        )}
        <div className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto p-1 sm:grid-cols-4" data-testid="pick-list">
          {available.map((a) => {
            const taken = used.has(a.id) && pages[pickFor]?.artworkId !== a.id;
            return (
              <button
                key={a.id}
                type="button"
                disabled={taken}
                onClick={() => {
                  setPage(pickFor, { artworkId: a.id, image: a.thumbnail });
                  setPickFor(null);
                }}
                className={`card relative p-1 disabled:opacity-40 ${pages[pickFor]?.artworkId === a.id ? 'ring-4 ring-primary/50' : ''}`}
                data-testid={`sb-add-${a.id}`}
              >
                {a.thumbnail ? <img src={a.thumbnail} alt="" className="aspect-square w-full rounded-xl" /> : <div className="aspect-square rounded-xl bg-primary-light" />}
                <div className="truncate text-xs font-bold">{a.name[i18n.language]}</div>
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Rời trang khi chưa lưu */}
      <Modal open={leaveAsk} onClose={() => setLeaveAsk(false)}>
        <h2 className="font-display text-2xl font-extrabold">{t('storybook.leaveTitle')}</h2>
        <p className="mb-4 text-muted">{t('storybook.leaveText')}</p>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost flex-1" onClick={leave} data-testid="leave-discard">
            {t('storybook.leaveDiscard')}
          </button>
          <button
            type="button"
            className="btn-coral flex-1"
            onClick={() => {
              setLeaveAsk(false);
              save();
            }}
          >
            {t('storybook.saveBook')}
          </button>
        </div>
      </Modal>
    </StoryBackdrop>
  );
}
