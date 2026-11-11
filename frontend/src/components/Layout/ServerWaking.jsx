// Lời nhắn nhỏ khi máy chủ trả lời chậm (gói Render Free ngủ khi vắng khách, thức dậy mất khoảng nửa phút đến một phút).
// Chỉ hiện khi có yêu cầu chờ quá 4 giây, tự ẩn khi máy chủ đã trả lời — để bé/phụ huynh biết web không bị treo.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isServerSlow, subscribeServerSlow } from '../../services/api';

export default function ServerWaking({ inline = false }) {
  const { t } = useTranslation();
  const [slow, setSlow] = useState(isServerSlow);
  useEffect(() => subscribeServerSlow(setSlow), []);
  if (!slow) return null;
  const text = t('common.serverWaking');
  if (inline) return <p className="mt-4 max-w-xs px-4 text-center font-bold text-muted" role="status">{text}</p>;
  return (
    <div className="no-print pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4" role="status" data-testid="server-waking">
      <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-primary-dark shadow-pop">
        <img src="/favicon.svg" alt="" className="h-5 w-5 animate-bounce" />
        {text}
      </div>
    </div>
  );
}
