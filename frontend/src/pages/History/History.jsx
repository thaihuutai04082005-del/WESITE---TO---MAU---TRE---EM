// Lịch sử tô (Mục 7): lưu cả tranh đang dở. Mỗi tranh: Xem (tải về, gắn Khung Artwork, in) hoặc Chỉnh sửa.
import { useCallback, useEffect, useRef, useState } from 'react';
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
import HistoryThumbnail from '../../components/HistoryThumbnail';
import { useAuth } from '../../store/auth';
import { historySnapshot, loadHistoryItems, invalidateHistory } from '../../lib/historyCache';
import { uiImage, HISTORY_IMAGES } from '../../lib/uiImages';
import { preloadImages } from '../../lib/preloadImages';

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
    <Modal closeButton={false} open onClose={onClose} wide>
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
  const token = useAuth(state => state.token);
  const files = useAuth(state => state.meta?.artworkThumbnailFiles === true);
  const key = JSON.stringify([token, filter, files]);
  const [loaded, setLoaded] = useState(() => ({ key, items:historySnapshot(token, filter, files) }));
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(null);
  const sequence = useRef(0);
  const items = loaded.key === key ? loaded.items : historySnapshot(token, filter, files);

  const load = useCallback(() => {
    const request = ++sequence.current;
    setError(false);
    return loadHistoryItems(token, filter, files).then(artworks => {
      if (request === sequence.current && useAuth.getState().token === token) setLoaded({ key, items:artworks });
    }).catch(() => { if (request === sequence.current) setError(true); });
  }, [token, filter, files, key]);
  useEffect(() => {
    load();
    return () => { sequence.current++; };
  }, [load]);
  useEffect(() => { preloadImages(HISTORY_IMAGES, { retain:true, priority:true }); }, []);

  const filterIcon = { all: 'collection', in_progress: 'hourglass', completed: 'check' };
  return (
    <div className="hs-stage" style={{ backgroundImage:`url(${uiImage('/history/bg.webp')})` }}>
      <div className="page hs-page">
        <header className="hs-head">
          <div>
            <h1 className="hs-title">
              <Icon name="history" size={48} strokeWidth={2.6} /> {t('history.title')}
            </h1>
          </div>
          <img src={uiImage('/history/deco.webp')} alt="" className="hs-deco" draggable={false} />
        </header>
        <section className="hs-panel">
          <div className="hs-filters">
            {FILTERS.map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} className={`hs-filter ${filter === f ? 'hs-filter-on' : ''}`}>
                <Icon name={filterIcon[f]} size={24} /> {t(`history.filter.${f}`)}
              </button>
            ))}
          </div>
          {error && <button type="button" className="btn-ghost" onClick={load}>{t('common.tryAgain')}</button>}
          {!items && !error && <div className="hs-grid" role="status" aria-label={t('common.loading')}>
            {Array.from({ length:6 }, (_,index) => <div key={index} className="hs-card" aria-hidden="true">
              <div className="hs-thumb animate-pulse bg-sky-50" /><div className="h-5 rounded bg-sky-50" />
            </div>)}
          </div>}
          {items && items.length === 0 && (
            <div className="hs-empty">
              <p className="mb-3 text-lg text-muted">{t('history.empty')}</p>
              <Link to="/color" className="btn-primary">{t('nav.color')}</Link>
            </div>
          )}
          <div className="hs-grid">
            {(items || []).map((a) => (
              <button key={a.id} type="button" onClick={() => setOpen(a.id)} className="hs-card" data-testid={`history-item-${a.id}`}>
                <div className="hs-thumb">
                  <HistoryThumbnail key={`${token}:${a.id}`} artwork={a} />
                  <span className={`hs-badge ${a.status === 'completed' ? 'hs-badge-done' : ''}`}>
                    <Icon name={a.status === 'completed' ? 'check' : 'hourglass'} size={18} strokeWidth={2.6} /> {t(`history.status.${a.status}`)}{a.status === 'in_progress' && a.progress > 0 ? ` · ${a.progress}%` : ''}
                  </span>
                  <span className="hs-more" aria-hidden="true">•••</span>
                </div>
                <div className="hs-foot">
                  <div className="hs-name">{a.name[i18n.language]}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
      {open && <Detail id={open} onClose={() => setOpen(null)} onDeleted={() => { setOpen(null); invalidateHistory(); load(); }} />}
    </div>
  );
}
