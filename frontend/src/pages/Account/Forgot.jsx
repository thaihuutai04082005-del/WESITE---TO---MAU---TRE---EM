// Khôi phục mật khẩu (Mục 5.2): mã gửi tới đúng SĐT/Email phụ huynh đã xác minh lúc đăng ký.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { errorText } from '../../lib/format';
import AuthCard from './AuthCard';

export default function Forgot() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState('contact');
  const [contactType, setType] = useState('phone');
  const [contact, setContact] = useState('');
  const [start, setStart] = useState(null);
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(null);
  const [username, setUsername] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  const run = (fn) => async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await fn();
    } catch (e2) {
      setErr(errorText(t, e2));
    }
  };

  return (
    <AuthCard title={t('auth.forgotTitle')} subtitle={t(`auth.forgotStep.${step}`, { to: start?.sentTo })}>
      {step === 'contact' && (
        <form className="space-y-4" onSubmit={run(async () => {
          const r = await api.post('/auth/forgot/start', { contactType, contact });
          setStart(r);
          setStep('code');
        })}>
          <div className="flex gap-2">
            {['phone', 'email'].map((k) => (
              <label key={k} className={`btn-ghost flex-1 text-base ${contactType === k ? 'border-primary text-primary' : ''}`}>
                <input type="radio" className="sr-only" checked={contactType === k} onChange={() => setType(k)} />
                {t(`auth.contact.${k}`)}
              </label>
            ))}
          </div>
          <input className="input" value={contact} onChange={(e) => setContact(e.target.value)} required aria-label={t(`auth.contact.${contactType}`)} />
          {err && <p className="font-bold text-danger">{err}</p>}
          <button className="btn-primary w-full" type="submit">{t('auth.sendCode')}</button>
        </form>
      )}
      {step === 'code' && (
        <form className="space-y-4" onSubmit={run(async () => {
          if (!start.resetId) throw { code: 'otp_wrong' };
          const r = await api.post('/auth/forgot/verify', { resetId: start.resetId, code });
          setVerified(r);
          setUsername(r.accounts[0]?.username || '');
          setStep('reset');
        })}>
          <input className="input text-center font-display text-3xl tracking-[0.5em]" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required aria-label={t('auth.otpCode')} />
          {start.devCode && <p className="rounded-2xl bg-sun/20 p-3 text-sm font-bold">{t('auth.devOtp', { code: start.devCode })}</p>}
          {err && <p className="font-bold text-danger">{err}</p>}
          <button className="btn-primary w-full" type="submit">{t('auth.confirm')}</button>
        </form>
      )}
      {step === 'reset' && (
        <form className="space-y-4" onSubmit={run(async () => {
          await api.post('/auth/forgot/reset', { resetToken: verified.resetToken, username, newPassword: pw });
          navigate('/login', { state: { username } });
        })}>
          <div>
            <label className="label">{t('auth.pickAccount')}</label>
            <div className="space-y-2">
              {verified.accounts.map((a) => (
                <label key={a.username} className={`card flex cursor-pointer items-center gap-3 p-3 ${username === a.username ? 'ring-4 ring-primary/40' : ''}`}>
                  <input type="radio" checked={username === a.username} onChange={() => setUsername(a.username)} className="h-5 w-5 accent-primary" />
                  <span className="font-bold">{a.username}</span>
                  {a.nickname && <span className="text-muted">({a.nickname})</span>}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="newpw">{t('auth.newPassword')}</label>
            <input id="newpw" type="password" className="input" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={6} autoComplete="new-password" />
            <p className="mt-1 text-sm text-muted">{t('auth.passwordHint')}</p>
          </div>
          {err && <p className="font-bold text-danger">{err}</p>}
          <button className="btn-primary w-full" type="submit">{t('auth.resetPassword')}</button>
        </form>
      )}
    </AuthCard>
  );
}
