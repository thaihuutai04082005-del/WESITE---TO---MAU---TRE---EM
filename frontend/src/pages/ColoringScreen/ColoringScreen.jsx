// Màn hình tô màu cá nhân (Theo mẫu / Sáng tạo): tự lưu, tính lượt ở thao tác đầu tiên, hoàn thành → Tranh sống.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';
import { useUi } from '../../store/ui';
import { useArtworkEditor } from '../../hooks/useArtworkEditor';
import { renderThumbnail } from '../../lib/exportImage';
import { progressOf } from '../../lib/picture';
import { errorText } from '../../lib/format';
import ColoringWorkspace from '../../components/ColoringWorkspace';
import RevealModal from '../../components/RevealModal';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import Icon from '../../components/Icon';

const AUTOSAVE_MS = 1500;

export default function ColoringScreen() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const setPlan = useAuth((s) => s.setPlan);
  const toast = useUi((s) => s.toast);
  const openUpgrade = useUi((s) => s.openUpgrade);
  const pushEvents = useUi((s) => s.pushEvents);
  const editor = useArtworkEditor();
  const [artwork, setArtwork] = useState(null);
  const [picture, setPicture] = useState(null);
  const [saving, setSaving] = useState('saved');
  const [reveal, setReveal] = useState(false);
  const [pendingEvents, setPendingEvents] = useState([]);
  const started = useRef(false);
  const starting = useRef(null);
  const initialData = useRef(null);
  const dirty = useRef(false);
  const dataRef = useRef(editor.data);
  dataRef.current = editor.data;

  useEffect(() => {
    let alive = true;
    api
      .get(`/artworks/${id}`)
      .then((r) => {
        if (!alive) return;
        setArtwork(r.artwork);
        setPicture(r.picture);
        started.current = r.artwork.counted || !['template', 'free'].includes(r.artwork.mode);
        initialData.current = r.artwork.data;
        editor.reset(r.artwork.data);
      })
      .catch((e) => {
        toast(errorText(t, e), 'error');
        navigate('/history');
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const save = useCallback(
    async (extra = {}) => {
      if (!started.current) return null;
      setSaving('saving');
      try {
        const r = await api.put(`/artworks/${id}`, { data: dataRef.current, ...extra });
        dirty.current = false;
        setSaving('saved');
        if (r.plan) setPlan(r.plan);
        return r;
      } catch (e) {
        setSaving('error');
        if (e.code === 'quota_exceeded') openUpgrade(true);
        throw e;
      }
    },
    [id, setPlan, openUpgrade],
  );

  // Tự lưu sau mỗi thay đổi.
  useEffect(() => {
    if (!artwork || !dirty.current) return;
    const h = setTimeout(() => save().catch(() => {}), AUTOSAVE_MS);
    return () => clearTimeout(h);
  }, [editor.data, artwork, save]);

  // Rời trang: lưu nốt thay đổi.
  useEffect(
    () => () => {
      if (dirty.current && started.current) api.put(`/artworks/${id}`, { data: dataRef.current }).catch(() => {});
    },
    [id],
  );

  // Thao tác đầu tiên → tính 1 lượt tô (Mục 6.2). Hết lượt → hoàn tác & mời nâng cấp.
  const onAction = useCallback(() => {
    dirty.current = true;
    setSaving('dirty');
    if (started.current || starting.current) return;
    starting.current = api
      .post(`/artworks/${id}/start`)
      .then((r) => {
        started.current = true;
        setPlan(r.plan);
      })
      .catch((e) => {
        editor.reset(initialData.current);
        dirty.current = false;
        setSaving('saved');
        if (e.code === 'quota_exceeded') {
          if (e.data?.plan) setPlan(e.data.plan);
          openUpgrade(true);
        } else toast(errorText(t, e), 'error');
      })
      .finally(() => {
        starting.current = null;
      });
  }, [id, editor, setPlan, openUpgrade, toast, t]);

  async function complete() {
    if (starting.current) await starting.current;
    if (!started.current) return openUpgrade(true);
    try {
      const thumbnail = await renderThumbnail(picture, dataRef.current);
      const r = await save({ thumbnail, completed: true });
      setArtwork((a) => ({ ...a, status: 'completed' }));
      setPendingEvents(r?.events || []);
      setReveal(true);
    } catch (e) {
      toast(errorText(t, e), 'error');
    }
  }

  async function saveAndExit() {
    if (starting.current) await starting.current;
    try {
      if (started.current) await save({ thumbnail: await renderThumbnail(picture, dataRef.current) });
      navigate('/history');
    } catch (e) {
      toast(errorText(t, e), 'error');
    }
  }

  if (!picture) return <div className="page text-center text-muted">{t('common.loading')}</div>;

  const progress = progressOf(picture, editor.data.fills);
  const mode = artwork.mode === 'template' ? 'template' : 'free';

  return (
    <div className="page pb-8">
      <ColoringWorkspace
        picture={picture}
        editor={editor}
        mode={mode}
        brushSkin={user?.brushSkin}
        userKey={String(user?.id || 'guest')}
        onAction={onAction}
        onUndo={() => {
          editor.undo();
          dirty.current = true;
          setSaving('dirty');
        }}
        onRedo={() => {
          editor.redo();
          dirty.current = true;
          setSaving('dirty');
        }}
        header={
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Link to="/history" className="btn-ghost min-h-11 px-3" aria-label={t('common.back')}>
              <Icon name="back" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-2xl font-extrabold">{picture.name[i18n.language]}</h1>
              <div className="flex items-center gap-2 text-sm font-bold text-muted">
                <span className="chip">{t(`mode.${mode}.title`)}</span>
                <span data-testid="save-state">{t(`coloring.saveState.${saving}`)}</span>
              </div>
            </div>
            <div className="w-32">
              <ProgressBar value={progress} max={1} sublabel={`${Math.round(progress * 100)}%`} height={10} />
            </div>
          </div>
        }
        actions={
          <>
            <button type="button" className="btn-ghost" onClick={saveAndExit} data-testid="save-exit">
              <Icon name="save" /> {t('coloring.saveExit')}
            </button>
            <button type="button" className="btn-coral" onClick={complete} data-testid="complete">
              <Icon name="check" /> {t('coloring.complete')}
            </button>
          </>
        }
      />
      <RevealModal
        open={reveal}
        picture={picture}
        data={editor.data}
        artworkId={Number(id)}
        onClose={() => {
          setReveal(false);
          pushEvents(pendingEvents);
          setPendingEvents([]);
        }}
        extra={
          <Link to="/color" className="btn-ghost">
            <Icon name="palette" /> {t('reveal.another')}
          </Link>
        }
      />
    </div>
  );
}
