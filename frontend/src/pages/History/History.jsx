// Lịch sử tô (Mục 7): lưu cả tranh đang dở. Mỗi tranh: Xem (tải về, gắn Khung Artwork, in) hoặc Chỉnh sửa.
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useUi } from '../../store/ui';
import { errorText, formatDate } from '../../lib/format';
import { downloadDataUrl, printDataUrl, renderArtwork, safeFileName } from '../../lib/exportImage';
import Modal from '../../components/Modal/Modal';
import Canvas from '../../components/Canvas/Canvas';
import FrameSelector from '../../components/FrameSelector/FrameSelector';
import Icon from '../../components/Icon';

const FILTERS = ['all', 'in_progress', 'completed'];

function Detail({ id, onClose, onDeleted }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toast = useUi((s) => s.toast);
  const pushEvents = useUi((s) => s.pushEvents);
  const [d, setD] = useState(null);
  const [frames, setFrames] = useState([]);
  const [frame, setFrame] = useState(null);
  const [preview, setPreview] = useState(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/artworks/${id}`).then((r) => {
      setD(r);
      setFrame(r.artwork.frame);
    });
    api.get('/shop').then((r) => setFrames(r.items.filter((i) => i.type === 'artwork_frame'))).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!d || !frame) return setPreview(null);
    let alive = true;
    renderArtwork(d.picture, d.artwork.data, { size: 480, frame }).then((u) => alive && setPreview(u));
    return () => {
      alive = false;
    };
  }, [d, frame]);

  if (!d) return null;
  const name = d.picture.name[i18n.language];

  const pickFrame = async (f) => {
    setFrame(f);
    try {
      await api.put(`/artworks/${id}/frame`, { frame: f });
    } catch (e) {
      toast(errorText(t, e), 'error');
    }
  };
  const exportAs = async (kind) => {
    setBusy(true);
    try {
      const url = await renderArtwork(d.picture, d.artwork.data, { size: 1200, frame });
      if (kind === 'download') downloadDataUrl(url, `${safeFileName(name)}.png`);
      else printDataUrl(url, name);
      const r = await api.post(`/artworks/${id}/download`);
      pushEvents(r.events);
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    await api.del(`/artworks/${id}`);
    onDeleted();
  };

  return (
    <Modal open onClose={onClose} wide>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-extrabold">{name}</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="chip">{t(`history.status.${d.artwork.status}`)}</span>
            <span className="chip">{t(`history.mode.${d.artwork.mode}`)}</span>
          </div>
        </div>
        <button type="button" className="btn-ghost min-h-11 px-3" onClick={onClose} aria-label={t('common.close')}>
          <Icon name="close" />
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>{preview ? <img src={preview} alt={name} className="w-full rounded-2xl border border-line" /> : <Canvas picture={d.picture} data={d.artwork.data} readOnly />}</div>
        <div className="space-y-4">
          <div>
            <div className="label">{t('history.frame')}</div>
            <p className="mb-2 text-sm text-muted">{t('history.frameHint')}</p>
            <FrameSelector type="artwork" items={frames} value={frame} onChange={pickFrame} />
            {frames.every((f) => !f.owned) && (
              <Link to="/shop" className="mt-2 inline-block text-sm font-bold text-primary">
                {t('history.buyFrames')}
              </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary" onClick={() => exportAs('download')} disabled={busy} data-testid="history-download">
              <Icon name="download" /> {t('coloring.download')}
            </button>
            <button type="button" className="btn-ghost" onClick={() => exportAs('print')} disabled={busy}>
              <Icon name="print" /> {t('coloring.print')}
            </button>
            <button type="button" className="btn-ghost" onClick={() => navigate(`/draw/${id}`)} data-testid="history-edit">
              <Icon name="edit" /> {t('history.edit')}
            </button>
            <button type="button" className="btn-ghost text-danger" onClick={() => setConfirmDel(true)}>
              <Icon name="trash" />
            </button>
          </div>
          {confirmDel && (
            <div className="rounded-2xl bg-danger/10 p-3">
              <p className="mb-2 font-bold">{t('history.confirmDelete')}</p>
              <div className="flex gap-2">
                <button type="button" className="btn-ghost flex-1" onClick={() => setConfirmDel(false)}>{t('common.cancel')}</button>
                <button type="button" className="btn-danger flex-1" onClick={remove}>{t('common.delete')}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default function History() {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(null);

  const load = () => api.get(`/artworks${filter === 'all' ? '' : `?status=${filter}`}`).then((r) => setItems(r.artworks));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return (
    <div className="page">
      <h1 className="page-title">{t('history.title')}</h1>
      <p className="mb-4 text-muted">{t('history.retention')}</p>
      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={`btn min-h-11 px-4 text-base ${filter === f ? 'bg-primary text-white' : 'bg-primary-light text-primary-dark'}`}>
            {t(`history.filter.${f}`)}
          </button>
        ))}
      </div>
      {items && items.length === 0 && (
        <div className="card p-8 text-center">
          <p className="mb-3 text-lg text-muted">{t('history.empty')}</p>
          <Link to="/color" className="btn-primary">{t('nav.color')}</Link>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {(items || []).map((a) => (
          <button key={a.id} type="button" onClick={() => setOpen(a.id)} className="card p-2 text-left transition hover:-translate-y-1" data-testid={`history-item-${a.id}`}>
            <div className="relative">
              {a.thumbnail ? <img src={a.thumbnail} alt="" className="aspect-square w-full rounded-2xl border border-line" /> : <div className="flex aspect-square items-center justify-center rounded-2xl bg-primary-light text-muted">{t('history.noPreview')}</div>}
              <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-extrabold text-white ${a.status === 'completed' ? 'bg-mint' : 'bg-sun text-ink'}`}>{t(`history.status.${a.status}`)}</span>
            </div>
            <div className="mt-1 truncate font-bold">{a.name[i18n.language]}</div>
            <div className="text-xs text-muted">
              {t(`history.mode.${a.mode}`)} · {formatDate(a.updatedAt, i18n.language)}
            </div>
          </button>
        ))}
      </div>
      {open && <Detail id={open} onClose={() => setOpen(null)} onDeleted={() => { setOpen(null); load(); }} />}
    </div>
  );
}
