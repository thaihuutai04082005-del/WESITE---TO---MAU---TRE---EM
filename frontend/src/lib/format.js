import i18n from '../i18n';

/** Tiền Việt: tiếng Việt "149.000đ"; tiếng Anh "149,000 VND" (người nước ngoài không quen dấu chấm ngăn cách nghìn), 0 đồng = "Free". */
export const formatVnd = (n) => {
  if (i18n.language === 'en') return n === 0 ? 'Free' : `${new Intl.NumberFormat('en-US').format(n)} VND`;
  return `${new Intl.NumberFormat('vi-VN').format(n)}đ`;
};

export function formatDate(iso, lang = 'vi') {
  if (!iso) return '';
  if (lang === 'en') return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(iso, lang = 'vi') {
  if (!iso) return '';
  if (lang === 'en') return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export const errorText = (t, e) => t(`errors.${e?.code || 'server_error'}`, { defaultValue: t('errors.server_error') });

/** Mốc giờ theo giờ Việt Nam (lịch Hội trường triển lãm luôn tính giờ VN), vd "20:00 Chủ nhật, 04/10". */
export function formatVnTime(iso, lang = 'vi', { time = true } = {}) {
  if (!iso) return '';
  if (lang === 'en') {
    const d = new Date(iso).toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh', weekday: 'long', month: 'short', day: 'numeric', ...(time ? { hour: 'numeric', minute: '2-digit' } : {}) });
    return time ? `${d} (Vietnam time)` : d;
  }
  return new Date(iso).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    ...(time ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}
