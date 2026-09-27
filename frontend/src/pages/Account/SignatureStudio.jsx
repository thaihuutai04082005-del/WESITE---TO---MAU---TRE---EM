// Trang "Chữ ký của bé": gõ tên (tên thật hay biệt danh đều được) → chọn 1 trong 10 mẫu, hoặc tự ký bằng tay.
// Đây là nơi duy nhất đổi chữ ký mặc định; trong màn tô chỉ đặt chữ ký lên tranh.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';
import { useUi } from '../../store/ui';
import { errorText } from '../../lib/format';
import { BOX } from '../../lib/signature';
import SignaturePreview from '../../components/SignaturePreview';
import Icon from '../../components/Icon';

function StyleCard({ style, name, active, locked, onPick }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={active}
      data-testid={`sig-style-${style}`}
      className={`relative flex flex-col items-center gap-1 rounded-2xl border-4 bg-white p-2 transition hover:-translate-y-0.5 ${active ? 'border-primary shadow-pop' : 'border-line'}`}
    >
      <SignaturePreview signature={{ style, name: name || 'Bé', color: '#1B2A38' }} className={`h-16 w-full ${locked ? 'opacity-60' : ''}`} />
      <span className="text-sm font-bold">{t(`signature.styles.${style}`)}</span>
      {locked && (
        <span className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white shadow-soft">
          <Icon name="lock" size={15} />
        </span>
      )}
    </button>
  );
}

/** Ô ký tay: vẽ bằng ngón tay / chuột, lưu các nét trong khung 150×50. */
function HandPad({ strokes, setStrokes }) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const live = useRef(null);
  const [, force] = useState(0);

  const at = (e) => {
    const r = ref.current.getBoundingClientRect();
    return [Math.round(((e.clientX - r.left) / r.width) * BOX.w * 10) / 10, Math.round(((e.clientY - r.top) / r.height) * BOX.h * 10) / 10];
  };
  const down = (e) => {
    ref.current.setPointerCapture?.(e.pointerId);
    live.current = [at(e)];
    force((n) => n + 1);
  };
  const move = (e) => {
    if (!live.current) return;
    const p = at(e);
    const last = live.current[live.current.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 0.8) return;
    live.current.push(p);
    force((n) => n + 1);
  };
  const up = () => {
    if (live.current?.length > 1) setStrokes([...strokes, live.current].slice(-40));
    live.current = null;
    force((n) => n + 1);
  };
  const all = live.current ? [...strokes, live.current] : strokes;

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-3xl border-4 border-dashed border-primary/40 bg-white">
        <svg
          ref={ref}
          viewBox={`0 0 ${BOX.w} ${BOX.h}`}
          className="block aspect-[3/1] w-full touch-none select-none"
          style={{ touchAction: 'none', cursor: 'crosshair' }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          data-testid="hand-pad"
        >
          <line x1="10" y1="38" x2="140" y2="38" stroke="#D5DEE8" strokeWidth="0.8" strokeDasharray="3 3" />
          {all.map((pts, i) => (
            <polyline key={i} points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#1B2A38" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </svg>
        {!all.length && <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-bold text-muted">{t('signature.handHint')}</div>}
      </div>
      <div className="flex gap-2">
        <button type="button" className="btn-ghost flex-1" onClick={() => setStrokes(strokes.slice(0, -1))} disabled={!strokes.length}>
          <Icon name="undo" /> {t('tools.undo')}
        </button>
        <button type="button" className="btn-ghost flex-1" onClick={() => setStrokes([])} disabled={!strokes.length}>
          <Icon name="trash" /> {t('signature.clearPad')}
        </button>
      </div>
    </div>
  );
}

export default function SignatureStudio() {
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);
  const toast = useUi((s) => s.toast);
  const [state, setState] = useState(null);
  const [tab, setTab] = useState('styles');
  const [name, setName] = useState(user?.nickname || '');
  const [style, setStyle] = useState('classic');
  const [hand, setHand] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/users/me/signature')
      .then((r) => {
        setState(r);
        const s = r.signature;
        if (s?.style === 'hand') {
          setTab('hand');
          setHand(s.hand);
        } else if (s) {
          setName(s.name);
          setStyle(s.style);
        }
      })
      .catch((e) => toast(errorText(t, e), 'error'));
  }, [t, toast]);

  if (!state) return <div className="page text-center text-muted">{t('common.loading')}</div>;

  const locked = (s) => state.styles.premium.includes(s) && !state.premium;
  const draft = tab === 'hand' ? (hand.length ? { style: 'hand', hand } : null) : name.trim() ? { style, name: name.trim() } : null;
  const canSave = !!draft && !(tab === 'styles' && locked(style));

  async function save() {
    setSaving(true);
    try {
      const r = await api.put('/users/me/signature', draft);
      setState(r);
      toast(t('signature.saved'), 'success');
    } catch (e) {
      toast(errorText(t, e), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-2">
        <Link to="/profile" className="btn-ghost min-h-11 px-3" aria-label={t('common.back')}>
          <Icon name="back" />
        </Link>
        <div>
          <h1 className="page-title">{t('signature.title')}</h1>
          <p className="text-muted">{t('signature.subtitle')}</p>
        </div>
      </div>

      {/* Xem trước chữ ký sẽ lưu */}
      <div className="card flex flex-col items-center gap-2 bg-gradient-to-br from-primary-light to-white p-5">
        <div className="text-sm font-bold text-muted">{t('signature.preview')}</div>
        <div className="w-full max-w-md rounded-3xl bg-white p-3 shadow-soft">
          {draft ? <SignaturePreview signature={{ ...draft, color: '#1B2A38' }} className="h-28 w-full" /> : <div className="flex h-28 items-center justify-center font-bold text-muted">{t('signature.noneYet')}</div>}
        </div>
      </div>

      <div className="flex gap-2 rounded-2xl bg-primary-light p-1">
        {['styles', 'hand'].map((k) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`flex-1 rounded-xl px-3 py-2 font-display text-lg font-bold transition ${tab === k ? 'bg-white text-primary-dark shadow-soft' : 'text-primary-dark/70'}`} data-testid={`sig-tab-${k}`}>
            {t(`signature.tab.${k}`)}
          </button>
        ))}
      </div>

      {tab === 'styles' ? (
        <div className="card space-y-5 p-5">
          <label className="block">
            <span className="label">{t('signature.nameLabel')}</span>
            <input className="input" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} placeholder={t('signature.namePlaceholder')} data-testid="sig-name" />
            <span className="mt-1 block text-sm text-muted">{t('signature.nameHint')}</span>
          </label>
          <div>
            <h2 className="mb-2 font-display text-xl font-bold">{t('signature.freeStyles')}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {state.styles.free.map((s) => (
                <StyleCard key={s} style={s} name={name.trim()} active={style === s} onPick={() => setStyle(s)} />
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-1 font-display text-xl font-bold">✨ {t('signature.premiumStyles')}</h2>
            {!state.premium && (
              <p className="mb-2 text-sm text-muted">
                {t('signature.premiumHint')}{' '}
                <Link to="/plans" className="font-bold text-primary-dark underline">
                  {t('profile.upgrade')}
                </Link>
              </p>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {state.styles.premium.map((s) => (
                <StyleCard key={s} style={s} name={name.trim()} active={style === s} locked={locked(s)} onPick={() => setStyle(s)} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card space-y-3 p-5">
          <p className="text-muted">{t('signature.handIntro')}</p>
          <HandPad strokes={hand} setStrokes={setHand} />
        </div>
      )}

      {tab === 'styles' && locked(style) ? (
        <Link to="/plans" className="btn-coral w-full">
          <Icon name="lock" /> {t('signature.unlock')}
        </Link>
      ) : (
        <button type="button" className="btn-primary w-full" disabled={!canSave || saving} onClick={save} data-testid="sig-save">
          <Icon name="check" /> {t('signature.save')}
        </button>
      )}
      <p className="text-center text-sm text-muted">{t('signature.changeNote')}</p>
    </div>
  );
}
