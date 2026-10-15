import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import { isSoundOn, setSoundOn, subscribeSound } from '../../lib/sound';

/** Nút bật/tắt âm thanh (nhạc nền + tiếng ting) trên thanh đầu trang. */
export default function SoundToggle() {
  const { t } = useTranslation();
  const on = useSyncExternalStore(subscribeSound, isSoundOn);
  return (
    <button type="button" onClick={() => setSoundOn(!on)} className="btn-ghost min-h-11 min-w-11 rounded-full px-2" aria-label={t('nav.sound')} aria-pressed={on} title={t('nav.sound')} data-testid="sound-toggle">
      <Icon name={on ? 'volume' : 'volumeOff'} size={22} strokeWidth={2.4} />
    </button>
  );
}
