// Lần đầu đăng nhập: đặt tên hiển thị (nickname) và chọn ảnh đại diện.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/auth';
import { errorText } from '../../lib/format';
import AuthCard from './AuthCard';
import AvatarPicker from './AvatarPicker';

export default function Welcome() {
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);
  const updateProfile = useAuth((s) => s.updateProfile);
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [avatar, setAvatar] = useState(user?.avatar || 'meo');
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    try {
      await updateProfile({ nickname, avatar });
      navigate('/');
    } catch (e2) {
      setErr(errorText(t, e2));
    }
  }

  return (
    <AuthCard title={t('welcome.title')} subtitle={t('welcome.subtitle')}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="nick">{t('welcome.nickname')}</label>
          <input id="nick" className="input" value={nickname} onChange={(e) => setNickname(e.target.value)} minLength={2} maxLength={20} required data-testid="nickname-input" />
          <p className="mt-1 text-sm text-muted">{t('welcome.nicknameHint')}</p>
        </div>
        <div>
          <div className="label">{t('welcome.avatar')}</div>
          <AvatarPicker value={avatar} onChange={setAvatar} />
        </div>
        {err && <p className="font-bold text-danger">{err}</p>}
        <button type="submit" className="btn-primary w-full" data-testid="nickname-submit">
          {t('welcome.start')}
        </button>
      </form>
    </AuthCard>
  );
}
