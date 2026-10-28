import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';
import { errorText } from '../../lib/format';
import AuthCard from './AuthCard';

/** Đăng nhập Google (Cách 2 — tuỳ chọn cho người trên 13 tuổi). */
function GoogleLogin({ clientId, onSession }) {
  const { t } = useTranslation();
  const [age, setAge] = useState(false);
  const [err, setErr] = useState('');
  const btnRef = useRef(null);
  const ageRef = useRef(age);
  ageRef.current = age;

  useEffect(() => {
    if (!clientId) return;
    const init = () => {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          if (!ageRef.current) return setErr(t('auth.google.ageRequired'));
          try {
            onSession(await api.post('/auth/google', { credential, confirmAge13: true }));
          } catch (e) {
            setErr(errorText(t, e));
          }
        },
      });
      window.google.accounts.id.renderButton(btnRef.current, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with' });
    };
    if (window.google?.accounts) return init();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = init;
    document.body.appendChild(s);
  }, [clientId, onSession, t]);

  if (!clientId) return null;
  return (
    <div className="mt-6 space-y-2 border-t border-line pt-4">
      <div className="text-center text-sm font-bold text-muted">{t('auth.google.or')}</div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={age} onChange={(e) => setAge(e.target.checked)} className="mt-1 h-5 w-5 accent-primary" />
        {t('auth.google.age')}
      </label>
      <div ref={btnRef} className={`flex justify-center ${age ? '' : 'pointer-events-none opacity-40'}`} />
      {err && <p className="text-sm font-bold text-danger">{err}</p>}
    </div>
  );
}

export default function Login() {
  const { t } = useTranslation();
  const applySession = useAuth((s) => s.applySession);
  const meta = useAuth((s) => s.meta);
  const navigate = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ username: loc.state?.username || '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  const onSession = (s) => {
    applySession(s);
    navigate(s.user.needsNickname ? '/welcome' : loc.state?.from || '/');
  };

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      onSession(await api.post('/auth/login', form));
    } catch (e2) {
      setErr(errorText(t, e2));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title={t('auth.login')} subtitle={loc.state?.registered ? t('auth.registeredOk') : t('auth.loginSubtitle')}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="auth-label" htmlFor="username">{t('auth.username')}</label>
          <div className="auth-field">
            <svg viewBox="0 0 24 24" className="auth-ico" aria-hidden="true"><circle cx="12" cy="8" r="4.2" fill="currentColor" /><path d="M3.8 21c0-4.6 3.7-7.2 8.2-7.2s8.2 2.6 8.2 7.2z" fill="currentColor" /></svg>
            <input id="username" className="auth-input" autoComplete="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
        </div>
        <div>
          <label className="auth-label" htmlFor="password">{t('auth.password')}</label>
          <div className="auth-field">
            <svg viewBox="0 0 24 24" className="auth-ico" aria-hidden="true"><path d="M7.5 10V7.5a4.5 4.5 0 019 0V10" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /><rect x="4.5" y="10" width="15" height="11" rx="3" fill="currentColor" /><circle cx="12" cy="15" r="1.6" fill="#E1EFFC" /></svg>
            <input id="password" type={show ? 'text' : 'password'} className="auth-input" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <button type="button" className="auth-eye" onClick={() => setShow((v) => !v)} aria-label={show ? t('auth.hidePassword') : t('auth.showPassword')} aria-pressed={show}>
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
                {!show && <path d="M4 4l16 16" />}
              </svg>
            </button>
          </div>
        </div>
        {err && <p className="font-bold text-danger" role="alert">{err}</p>}
        <button type="submit" className="auth-btn" disabled={busy} data-testid="login-submit">
          {t('auth.login')}
        </button>
        <div className="auth-links">
          <Link to="/forgot">{t('auth.forgot')}</Link>
          <span className="auth-sep" aria-hidden="true" />
          <Link to="/register">{t('auth.noAccount')}</Link>
        </div>
      </form>
      <GoogleLogin clientId={meta?.googleClientId} onSession={onSession} />
    </AuthCard>
  );
}
