// Màn hình mời nâng cấp khi hết lượt tô (Mục 6.2).
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUi } from '../../store/ui';
import Modal from '../Modal/Modal';

export default function UpgradeModal() {
  const { t } = useTranslation();
  const open = useUi((s) => s.upgradeOpen);
  const reason = useUi((s) => s.upgradeReason);
  const setOpen = useUi((s) => s.openUpgrade);
  const navigate = useNavigate();
  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <div className="flex flex-col items-center gap-3 text-center" data-testid="upgrade-modal">
        <img src="/avatars/meo.svg" alt="" className="h-24 w-24 rounded-full" />
        <h2 className="font-display text-2xl font-extrabold">{t(reason === 'theme' ? 'upgrade.themeTitle' : 'upgrade.title')}</h2>
        <p className="text-muted">{t(reason === 'theme' ? 'upgrade.themeLocked' : 'upgrade.freeUsed')}</p>
        <button
          type="button"
          className="btn-coral w-full"
          onClick={() => {
            setOpen(false);
            navigate('/plans');
          }}
        >
          {t('upgrade.cta')}
        </button>
        <button type="button" className="btn-ghost w-full" onClick={() => setOpen(false)}>
          {t('upgrade.later')}
        </button>
      </div>
    </Modal>
  );
}
