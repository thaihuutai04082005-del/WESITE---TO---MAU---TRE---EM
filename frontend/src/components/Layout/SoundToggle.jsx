import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import { isSoundOn, subscribeSound, toggleSound } from '../../lib/sound';

/** Nút bật/tắt âm thanh (nhạc nền + tiếng ting) trên thanh đầu trang. */
export default function SoundToggle() {
  const { t } = useTranslation();
  // Hiển thị lựa chọn âm thanh ngay cả khi đang chờ tương tác đầu tiên.
  const on = useSyncExternalStore(subscribeSound, isSoundOn);
  return (
    <button type="button" onClick={toggleSound} onPointerDown={(e) => e.stopPropagation()} className="btn-ghost min-h-11 min-w-11 rounded-full px-2" aria-label={t('nav.sound')} aria-pressed={on} title={t('nav.sound')} data-testid="sound-toggle">
      <Icon name={on ? 'volume' : 'volumeOff'} size={22} strokeWidth={2.4} />
    </button>
  );
}
