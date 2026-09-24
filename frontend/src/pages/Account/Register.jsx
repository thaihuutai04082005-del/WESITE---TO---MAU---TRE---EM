// Đăng ký thường (Mục 5.1): tên đăng nhập + mật khẩu + CAPTCHA → SĐT/Email phụ huynh → OTP → về Đăng nhập.
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { errorText } from '../../lib/format';
import AuthCard from './AuthCard';
import Icon from '../../components/Icon';

export function Captcha({ value, onChange, onId, refreshKey }) {
  const { t } = useTranslation();
  const [cap, setCap] = useState(null);
  const load = useCallback(async () => {
    const c = await api.get('/auth/captcha');
    setCap(c);
    onId(c.captchaId);
    onChange('');
  }, [onId, onChange]);
  useEffect(() => {
    load().catch(() => {});
  }, [load, refreshKey]);
  return (
    <div>
      <label className="label" htmlFor="captcha">{t('auth.captcha')}</label>
      <div className="flex items-center gap-2">
        {cap && <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(cap.svg)}`} alt={t('auth.captcha')} className="h-14 rounded-xl" data-testid="captcha-img" />}
        <button type="button" className="btn-ghost min-h-11 px-3" onClick={() => load()} aria-label={t('auth.captchaRefresh')}>
          <Icon name="redo" size={20} />
        </button>
      </div>
      <input id="captcha" className="input mt-2 uppercase" value={value} onChange={(e) => onChange(e.target.value)} maxLength={6} required autoComplete="off" />
    </div>
  );
}

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState('form');
  const [form, setForm] = useState({ username: '', password: '', confirm: '', contactType: 'phone', contact: '' });
  const [captchaText, setCaptchaText] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [capKey, setCapKey] = useState(0);
  const [reg, setReg] = useState(null);
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (form.password !== form.confirm) return setErr(t('auth.passwordMismatch'));
    setBusy(true);
    try {
      const r = await api.post('/auth/register/start', { ...form, captchaId, captchaText });
      setReg(r);
      setStep('otp');
    } catch (e2) {
      setErr(errorText(t, e2));
      setCapKey((k) => k + 1);
    } finally {
      setBusy(false);
    }
  }

  async function verify(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await api.post('/auth/register/verify', { registrationId: reg.registrationId, code });
      navigate('/login', { state: { registered: true, username: form.username } });
    } catch (e2) {
      setErr(errorText(t, e2));
    } finally {
      setBusy(false);
    }
  }

  if (step === 'otp') {
    return (
      <AuthCard title={t('auth.otpTitle')} subtitle={t('auth.otpSent', { to: reg.sentTo })}>
        <form onSubmit={verify} className="space-y-4">
          <input className="input text-center font-display text-3xl tracking-[0.5em]" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required aria-label={t('auth.otpCode')} data-testid="otp-input" />
          {reg.devCode && (
            <p className="rounded-2xl bg-sun/20 p-3 text-sm font-bold" data-testid="dev-otp">
              {t('auth.devOtp', { code: reg.devCode })}
            </p>
          )}
          {err && <p className="font-bold text-danger" role="alert">{err}</p>}
          <button type="submit" className="btn-primary w-full" disabled={busy || code.length !== 6} data-testid="otp-submit">
            {t('auth.confirm')}
          </button>
          <button type="button" className="btn-ghost w-full" onClick={() => setStep('form')}>
            {t('common.back')}
          </button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t('auth.register')} subtitle={t('auth.registerSubtitle')}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="r-username">{t('auth.username')}</label>
          <input id="r-username" className="input" value={form.username} onChange={set('username')} required minLength={4} maxLength={20} pattern="[a-zA-Z0-9_.]{4,20}" autoComplete="username" />
          <p className="mt-1 text-sm text-muted">{t('auth.usernameHint')}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="r-password">{t('auth.password')}</label>
            <input id="r-password" type="password" className="input" value={form.password} onChange={set('password')} required minLength={6} autoComplete="new-password" />
          </div>
          <div>
            <label className="label" htmlFor="r-confirm">{t('auth.confirmPassword')}</label>
            <input id="r-confirm" type="password" className="input" value={form.confirm} onChange={set('confirm')} required autoComplete="new-password" />
          </div>
        </div>
        <p className="-mt-2 text-sm text-muted">{t('auth.passwordHint')}</p>
        <Captcha value={captchaText} onChange={setCaptchaText} onId={setCaptchaId} refreshKey={capKey} />
        <fieldset>
          <legend className="label">{t('auth.guardian')}</legend>
          <p className="mb-2 text-sm text-muted">{t('auth.guardianHint')}</p>
          <div className="mb-2 flex gap-2">
            {['phone', 'email'].map((k) => (
              <label key={k} className={`btn-ghost flex-1 text-base ${form.contactType === k ? 'border-primary text-primary' : ''}`}>
                <input type="radio" className="sr-only" checked={form.contactType === k} onChange={() => setForm({ ...form, contactType: k, contact: '' })} />
                {t(`auth.contact.${k}`)}
              </label>
            ))}
          </div>
          <input className="input" type={form.contactType === 'email' ? 'email' : 'tel'} value={form.contact} onChange={set('contact')} required placeholder={form.contactType === 'email' ? 'phuhuynh@gmail.com' : '0912 345 678'} aria-label={t(`auth.contact.${form.contactType}`)} />
        </fieldset>
        {err && <p className="font-bold text-danger" role="alert">{err}</p>}
        <button type="submit" className="btn-primary w-full" disabled={busy} data-testid="register-submit">
          {t('auth.register')}
        </button>
        <p className="text-center text-sm font-bold">
          <Link to="/login" className="text-primary">{t('auth.haveAccount')}</Link>
        </p>
      </form>
    </AuthCard>
  );
}
