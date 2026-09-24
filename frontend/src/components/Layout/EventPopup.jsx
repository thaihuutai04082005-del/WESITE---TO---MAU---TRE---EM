// Popup phần thưởng: hoàn thành nhiệm vụ (+Ruby), lên cấp (mở bộ nhiệm vụ mới), thăng hạng (Khung Avatar + Ruby).
import { useTranslation } from 'react-i18next';
import { useUi } from '../../store/ui';
import { useAuth } from '../../store/auth';
import Modal from '../Modal/Modal';
import Confetti from '../Confetti';
import Avatar from '../Avatar/Avatar';
import Icon from '../Icon';

export default function EventPopup() {
  const { t, i18n } = useTranslation();
  const events = useUi((s) => s.events);
  const shift = useUi((s) => s.shiftEvent);
  const user = useAuth((s) => s.user);
  const ev = events[0];
  if (!ev) return null;
  const close = () => {
    shift();
    if (events.length === 1) useAuth.getState().refresh().catch(() => {});
  };
  return (
    <Modal open onClose={close}>
      {(ev.type === 'level_up' || ev.type === 'rank_up') && <Confetti />}
      <div className="flex flex-col items-center gap-3 py-2 text-center" data-testid={`popup-${ev.type}`}>
        {ev.type === 'mission_complete' && (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-mint text-white">
              <Icon name="check" size={44} />
            </div>
            <h2 className="font-display text-2xl font-extrabold">{t('popup.missionDone')}</h2>
            <p className="text-lg">{ev.title?.[i18n.language]}</p>
            <span className="chip text-lg">+{ev.ruby} Ruby</span>
          </>
        )}
        {ev.type === 'level_up' && (
          <>
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-sun font-display text-4xl font-extrabold text-ink shadow-pop">{ev.to}</div>
            <h2 className="font-display text-3xl font-extrabold">{t('popup.levelUp', { level: ev.to })}</h2>
            <p className="text-muted">{t('popup.newMissions')}</p>
          </>
        )}
        {ev.type === 'rank_up' && (
          <>
            <Avatar avatar={user?.avatar} frame={ev.frame} size={110} />
            <h2 className="font-display text-3xl font-extrabold">{t('popup.rankUp', { rank: t(`rank.${ev.rank}`) })}</h2>
            <p className="text-muted">{t('popup.newFrame')}</p>
            {ev.ruby > 0 && <span className="chip text-lg">+{ev.ruby} Ruby</span>}
          </>
        )}
        <button type="button" className="btn-primary mt-2 w-full" onClick={close}>
          {t('common.great')}
        </button>
      </div>
    </Modal>
  );
}
