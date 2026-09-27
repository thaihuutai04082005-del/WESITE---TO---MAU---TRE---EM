// Hồ sơ cá nhân: avatar + chữ ký + Khung Avatar + Level/Rank + gói dịch vụ + ngôn ngữ.
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/auth';
import { useUi } from '../../store/ui';
import { api } from '../../services/api';
import { errorText, formatDate } from '../../lib/format';
import Avatar from '../../components/Avatar/Avatar';
import FrameSelector from '../../components/FrameSelector/FrameSelector';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import Icon from '../../components/Icon';
import AvatarPicker from './AvatarPicker';
import { PlanBadge } from '../Payment/Plans';
import SignaturePreview from '../../components/SignaturePreview';

export default function Profile() {
  const { t, i18n } = useTranslation();
  const user = useAuth((s) => s.user);
  const plan = useAuth((s) => s.plan);
  const updateProfile = useAuth((s) => s.updateProfile);
  const logout = useAuth((s) => s.logout);
  const toast = useUi((s) => s.toast);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [prog, setProg] = useState(null);
  const [nickname, setNickname] = useState(user.nickname);
  const [signature, setSignature] = useState(undefined);

  useEffect(() => {
    api.get('/users/me/signature').then((r) => setSignature(r.signature)).catch(() => {});
    api.get('/shop').then((r) => setItems(r.items)).catch(() => {});
    api.get('/progression').then(setProg).catch(() => {});
  }, []);

  const save = async (fields, msg = t('profile.saved')) => {
    try {
      await updateProfile(fields);
      toast(msg, 'success');
    } catch (e) {
      toast(errorText(t, e), 'error');
    }
  };

  return (
    <div className="page space-y-5">
      <div className="card flex flex-col items-center gap-4 p-6 sm:flex-row">
        <Avatar avatar={user.avatar} frame={user.avatarFrame} size={120} />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="page-title">{user.nickname}</h1>
          <div className="mt-1 flex flex-wrap justify-center gap-2 sm:justify-start">
            <span className="chip">{t('home.level', { level: user.level })}</span>
            <span className="chip">{t(`rank.${user.rank}`)}</span>
            <span className="chip"><Icon name="ruby" size={14} /> {user.ruby} Ruby</span>
            <span className="chip">{t('profile.gachaPoints', { n: user.gachaPoints })}</span>
          </div>
          {user.username && <div className="mt-2 text-sm text-muted">{t('profile.username')}: {user.username}</div>}
          <div className="text-sm text-muted">{t('profile.friendCode')}: <b className="font-mono text-ink">{user.friendCode}</b></div>
        </div>
        <PlanBadge plan={plan} />
      </div>

      {prog && (
        <div className="card p-5">
          <ProgressBar
            label={`${t('home.rank')}: ${t(`rank.${prog.rank.key}`)}`}
            sublabel={prog.rank.next ? t('profile.toNextRank', { n: prog.rank.next.min - prog.rank.points, rank: t(`rank.${prog.rank.next.key}`) }) : t('profile.maxRank')}
            value={prog.rank.points - prog.rank.currentMin}
            max={prog.rank.next ? prog.rank.next.min - prog.rank.currentMin : 1}
            color="#FFC94D"
          />
        </div>
      )}

      <div className="card space-y-3 p-5">
        <h2 className="font-display text-2xl font-bold">{t('profile.nickname')}</h2>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); save({ nickname }); }}>
          <input className="input" value={nickname} onChange={(e) => setNickname(e.target.value)} minLength={2} maxLength={20} required />
          <button className="btn-primary" type="submit">{t('common.save')}</button>
        </form>
      </div>

      <div className="card space-y-3 p-5" data-testid="profile-signature">
        <h2 className="font-display text-2xl font-bold">{t('signature.title')}</h2>
        <p className="text-sm text-muted">{t('signature.profileHint')}</p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <div className="w-full max-w-xs rounded-2xl border-2 border-line bg-white p-2">
            {signature ? <SignaturePreview signature={{ ...signature, color: '#1B2A38' }} className="h-16 w-full" /> : <div className="flex h-16 items-center justify-center font-bold text-muted">{t('signature.noneYet')}</div>}
          </div>
          <Link to="/signature" className="btn-primary" data-testid="open-signature">
            <Icon name="signature" /> {signature ? t('signature.edit') : t('signature.create')}
          </Link>
        </div>
      </div>

      <div className="card space-y-3 p-5">
        <h2 className="font-display text-2xl font-bold">{t('profile.avatar')}</h2>
        <AvatarPicker value={user.avatar} onChange={(a) => save({ avatar: a })} />
      </div>

      <div className="card space-y-3 p-5">
        <h2 className="font-display text-2xl font-bold">{t('profile.avatarFrame')}</h2>
        <p className="text-sm text-muted">{t('profile.avatarFrameHint')}</p>
        <FrameSelector type="avatar" avatar={user.avatar} items={items.filter((i) => i.type === 'avatar_frame')} value={user.avatarFrame} onChange={(f) => save({ avatarFrame: f })} />
      </div>

      <div className="card space-y-3 p-5">
        <h2 className="font-display text-2xl font-bold">{t('profile.plan')}</h2>
        <p>
          {t(`plans.${plan?.plan || 'free'}.name`)}
          {plan?.endsAt && ` · ${t('profile.until', { date: formatDate(plan.endsAt, i18n.language) })}`}
        </p>
        <Link to="/plans" className="btn-coral">{t('profile.upgrade')}</Link>
      </div>

      <button type="button" className="btn-ghost w-full" onClick={() => { logout(); navigate('/'); }} data-testid="logout">
        <Icon name="logout" /> {t('auth.logout')}
      </button>
    </div>
  );
}
