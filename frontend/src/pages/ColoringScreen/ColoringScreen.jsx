// Màn hình tô màu cá nhân (Theo mẫu / Sáng tạo): tự lưu, tính lượt ở thao tác đầu tiên, hoàn thành → Tranh sống.
import { pageReady } from '../../lib/transitionBus';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const plan = useAuth((s) => s.plan);
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
  const [sig, setSig] = useState(null);
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
        if (r.accessError) {
          if (r.accessError === 'theme_vip_required') openUpgrade(true, 'theme');
          else toast(t(`errors.${r.accessError}`), 'error');
          return navigate('/history', { replace: true });
        }
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

  useEffect(() => {
    if (!picture) return;
    let alive = true;
    api.get(`/pictures/${picture.id}?access=1`).catch((error) => {
      if (!alive || !['theme_vip_required', 'card_not_owned'].includes(error.code)) return;
      dirty.current = false;
      if (error.code === 'theme_vip_required') openUpgrade(true, 'theme');
      else toast(errorText(t, error), 'error');
      navigate('/history', { replace: true });
    });
    api.get('/users/me/signature').then((state) => alive && setSig(state)).catch(() => {});
    return () => { alive = false; };
  }, [picture?.id, plan?.plan, plan?.endsAt]);

  // Báo cho hiệu ứng chuyển màn hình: tranh đã tải xong, sẵn sàng hiện.
  useEffect(() => {
    if (picture) requestAnimationFrame(pageReady);
  }, [picture]);

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
        if (e.code === 'theme_vip_required') openUpgrade(true, 'theme');
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
        } else if (e.code === 'theme_vip_required') openUpgrade(true, 'theme');
        else toast(errorText(t, e), 'error');
      })
      .finally(() => {
        starting.current = null;
      });
  }, [id, editor, setPlan, openUpgrade, toast, t]);

  async function complete() {
    if (starting.current) await starting.current;
    if (!started.current) {
      // Chưa tính lượt (chưa có thao tác nào được ghi nhận): không phải hết lượt → chỉ nhắc bé tô trước,
      // hoặc tính lượt ngay nếu đã có nét/màu. Chỉ khi server báo hết lượt mới mời nâng cấp.
      const d = dataRef.current;
      if (!Object.keys(d.fills).length && !d.strokes.length && !d.stickers.length) return toast(t('coloring.paintFirst'), 'error');
      try {
        const r = await api.post(`/artworks/${id}/start`);
        started.current = true;
        setPlan(r.plan);
      } catch (e) {
        if (e.code === 'quota_exceeded') {
          if (e.data?.plan) setPlan(e.data.plan);
          return openUpgrade(true);
        }
        if (e.code === 'theme_vip_required') return openUpgrade(true, 'theme');
        return toast(errorText(t, e), 'error');
      }
    }
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

  // Quay lại đúng màn hình trước đó (chọn tranh, bộ sưu tập…); mở thẳng trang này không có trang trước thì về màn chọn tranh.
  function goBack() {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/color');
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

  const progress = progressOf(picture, editor.data.fills, { skipWhite: artwork.mode === 'template' });
  // Tranh đã gửi triển lãm: chỉ xem, không sửa được (chữ ký và nội dung bị khoá).
  const locked = !!artwork.exhibited;
  const mode = artwork.mode === 'template' ? 'template' : 'free';

  return (
    <div className="cw-page">
      <ColoringWorkspace
        picture={picture}
        editor={editor}
        mode={mode}
        brushSkin={user?.brushSkin}
        userKey={String(user?.id || 'guest')}
        onAction={onAction}
        readOnly={locked}
        signature={sig ? sig.signature : undefined}
        signatureInks={sig?.inks}
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
            <button type="button" className="btn-ghost min-h-11 px-3" aria-label={t('common.back')} onClick={goBack} data-testid="draw-back">
              <Icon name="back" />
            </button>
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
          locked ? (
            <p className="rounded-2xl bg-sun/25 px-4 py-2 text-center font-bold" data-testid="exhibit-locked">
              🏛️ {t('exhibition.lockedArtwork')}
            </p>
          ) : (
          <>
            <button type="button" className="btn-ghost" onClick={saveAndExit} data-testid="save-exit">
              <Icon name="save" /> {t('coloring.saveExit')}
            </button>
            <button type="button" className="btn-coral" onClick={complete} data-testid="complete">
              <Icon name="check" /> {t('coloring.complete')}
            </button>
          </>
          )
        }
      />
      <RevealModal
        open={reveal}
        picture={picture}
        data={editor.data}
        artworkId={Number(id)}
        onClose={(kind) => {
          setReveal(false);
          // Thông báo nhiệm vụ/thành tích hiện sau khi tranh bay xong (và sau khi trang chủ đề hiện lên nếu bé bấm "Tô tranh khác").
          const ev = pendingEvents;
          setTimeout(() => pushEvents(ev), kind === 'another' ? 1800 : 1000);
          setPendingEvents([]);
        }}
        anotherTo={picture.theme?.slug ? `/color/${picture.theme.slug}` : '/color'}
      />
    </div>
  );
}
