// Lời mời vào phòng "Tô cùng nhau": bạn bè mời thì hiện bảng "Tèo mời bạn vào phòng tô tranh cùng" — Chấp nhận hoặc Từ chối.
// Từ chối kèm tick "chặn" thì người mời không mời lại được trong 5 phút (chống làm phiền).
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/auth';
import { getSocket } from '../../services/socket';
import Modal from '../Modal/Modal';
import Avatar from '../Avatar/Avatar';
import Icon from '../Icon';
import { TogetherArt } from '../Illustrations';

const EXPIRE_MS = 60000; // lời mời tự hết hạn sau 1 phút

export default function CollabInvitePopup() {
  const { t } = useTranslation();
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [block, setBlock] = useState(false);

  useEffect(() => {
    if (!token || !user) return undefined;
    const s = getSocket(token);
    const onInvite = (inv) => setQueue((q) => (q.some((x) => x.code === inv.code && x.from.id === inv.from.id) ? q : [...q, { ...inv, key: `${inv.code}-${inv.at}` }]));
    s.on('collab:invite', onInvite);
    return () => s.off('collab:invite', onInvite);
  }, [token, user]);

  const inv = queue[0];
  useEffect(() => {
    setBlock(false);
    if (!inv) return undefined;
    const id = setTimeout(() => setQueue((q) => q.filter((x) => x.key !== inv.key)), Math.max(0, EXPIRE_MS - (Date.now() - inv.at)));
    return () => clearTimeout(id);
  }, [inv?.key]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!inv) return null;

  const drop = () => setQueue((q) => q.slice(1));
  const accept = () => {
    drop();
    navigate(`/together/${inv.code}`);
  };
  const decline = () => {
    getSocket(token).emit('collab:invite-decline', { fromUserId: inv.from.id, block });
    drop();
  };

  return (
    <Modal open dismissable={false} closeButton={false}>
      <div className="flex flex-col items-center gap-3 text-center" data-testid="collab-invite">
        <div className="h-28 w-full max-w-[220px]"><TogetherArt /></div>
        <Avatar avatar={inv.from.avatar} frame={inv.from.avatarFrame} vip={inv.from.vip} size={64} />
        <h2 className="font-display text-2xl font-extrabold leading-snug" style={{ textWrap: "balance" }}>{t('together.inviteTitle', { name: inv.from.nickname })}</h2>
        <label className="flex cursor-pointer items-center gap-2 rounded-2xl bg-primary-light px-3 py-2 text-sm font-bold text-primary-dark">
          <input type="checkbox" className="h-5 w-5 accent-primary" checked={block} onChange={(e) => setBlock(e.target.checked)} data-testid="invite-block" />
          {t('together.inviteBlock')}
        </label>
        <div className="flex w-full gap-2">
          <button type="button" className="btn-ghost flex-1" onClick={decline} data-testid="invite-decline">
            <Icon name="close" size={18} strokeWidth={3} /> {t('together.inviteDecline')}
          </button>
          <button type="button" className="btn-coral flex-1" onClick={accept} data-testid="invite-accept">
            <Icon name="check" size={18} strokeWidth={3} /> {t('together.inviteAccept')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
