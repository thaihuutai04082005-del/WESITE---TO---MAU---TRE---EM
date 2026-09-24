import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';
import { formatDateTime } from '../../lib/format';
import Icon from '../Icon';
import { flatten } from './Layout';

export default function NotificationBell() {
  const { t, i18n } = useTranslation();
  const unread = useAuth((s) => s.unread);
  const setUnread = useAuth((s) => s.setUnread);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      const r = await api.get('/users/me/notifications');
      setItems(r.notifications);
      if (r.unread) {
        const x = await api.post('/users/me/notifications/read', { ids: 'all' });
        setUnread(x.unread);
      }
    }
  }

  return (
    <div className="relative">
      <button type="button" onClick={toggle} className="btn-ghost relative min-h-11 px-3" aria-label={t('nav.notifications')}>
        <Icon name="bell" size={20} />
        {unread > 0 && <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-coral px-1 text-xs font-extrabold text-white">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-14 z-50 max-h-96 w-80 overflow-y-auto rounded-3xl border border-line bg-white p-2 shadow-pop">
          {items.length === 0 && <div className="p-4 text-center text-muted">{t('notifications.empty')}</div>}
          {items.map((n) => (
            <div key={n.id} className={`rounded-2xl p-3 ${n.read ? '' : 'bg-primary-light'}`}>
              <div className="font-bold">{t(`notifications.${n.type}`, { ...flatten(n.data, i18n.language), date: formatDateTime(n.data?.deleteAt || n.data?.endsAt, i18n.language), defaultValue: t('notifications.generic') })}</div>
              <div className="text-xs text-muted">{formatDateTime(n.createdAt, i18n.language)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
