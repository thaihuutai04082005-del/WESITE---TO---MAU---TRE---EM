export const formatVnd = (n) => `${new Intl.NumberFormat('vi-VN').format(n)}đ`;

export function formatDate(iso, lang = 'vi') {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-GB' : 'vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(iso, lang = 'vi') {
  if (!iso) return '';
  return new Date(iso).toLocaleString(lang === 'en' ? 'en-GB' : 'vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export const errorText = (t, e) => t(`errors.${e?.code || 'server_error'}`, { defaultValue: t('errors.server_error') });
