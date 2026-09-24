// Tô màu cùng nhau (Mục 10.1): tạo phòng rồi chia sẻ mã, hoặc nhập mã bạn gửi. Không có danh sách phòng công khai.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSocket, emitAck } from '../../services/socket';
import { useAuth } from '../../store/auth';
import { useUi } from '../../store/ui';
import PicturePicker from '../../components/PicturePicker';
import Icon from '../../components/Icon';

export default function Together() {
  const { t } = useTranslation();
  const token = useAuth((s) => s.token);
  const toast = useUi((s) => s.toast);
  const navigate = useNavigate();
  const [picking, setPicking] = useState(false);
  const [code, setCode] = useState('');

  const create = async (picture) => {
    setPicking(false);
    const r = await emitAck(getSocket(token), 'collab:create', { pictureId: picture.id }).catch(() => ({ error: 'network_error' }));
    if (r.error) return toast(t(`errors.${r.error}`, { defaultValue: t('errors.server_error') }), 'error');
    navigate(`/together/${r.room.code}`);
  };

  return (
    <div className="page space-y-5">
      <div>
        <h1 className="page-title">{t('together.title')}</h1>
        <p className="text-muted">{t('together.subtitle')}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-3 p-5">
          <h2 className="font-display text-2xl font-bold">{t('together.create')}</h2>
          <p className="text-sm text-muted">{t('together.createHint')}</p>
          <button type="button" className="btn-primary w-full" onClick={() => setPicking(true)} data-testid="together-create">
            <Icon name="plus" /> {t('together.pickPicture')}
          </button>
        </div>
        <form className="card space-y-3 p-5" onSubmit={(e) => { e.preventDefault(); navigate(`/together/${code.trim().toUpperCase()}`); }}>
          <h2 className="font-display text-2xl font-bold">{t('together.join')}</h2>
          <p className="text-sm text-muted">{t('together.joinHint')}</p>
          <input className="input font-mono uppercase" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} required placeholder={t('arena.roomCode')} aria-label={t('arena.roomCode')} data-testid="together-code" />
          <button type="submit" className="btn-coral w-full" data-testid="together-join">{t('together.joinBtn')}</button>
        </form>
      </div>
      <p className="rounded-2xl bg-primary-light p-4 text-sm font-bold text-primary-dark">{t('together.safety')}</p>
      {picking && <PicturePicker onPick={create} onClose={() => setPicking(false)} />}
    </div>
  );
}
