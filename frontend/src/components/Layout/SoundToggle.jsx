import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import { isMusicPlaying, isSoundOn, subscribeSound, toggleSound } from '../../lib/sound';

/** Nút bật/tắt âm thanh (nhạc nền + tiếng ting) trên thanh đầu trang. */
export default function SoundToggle() {
  const { t } = useTranslation();
  // Chỉ hiện loa "đang kêu" khi nhạc thật sự đang phát; trình duyệt chặn nhạc tự phát thì hiện loa gạch để bé bấm bật.
  const on = useSyncExternalStore(subscribeSound, () => isSoundOn() && isMusicPlaying());
  return (
    <button type="button" onClick={toggleSound} onPointerDown={(e) => e.stopPropagation()} className="btn-ghost min-h-11 min-w-11 rounded-full px-2" aria-label={t('nav.sound')} aria-pressed={on} title={t('nav.sound')} data-testid="sound-toggle">
      <Icon name={on ? 'volume' : 'volumeOff'} size={22} strokeWidth={2.4} />
    </button>
  );
}
