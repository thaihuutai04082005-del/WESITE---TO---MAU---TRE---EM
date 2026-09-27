// Duyệt tranh triển lãm (chỉ admin): chỉ những tranh máy chưa tự duyệt được + tranh bị báo nhiều.
// Xem tranh vẽ lại từ dữ liệu tô; "Duyệt tất cả" rồi chỉ bấm vào tranh cần loại và chọn điều vi phạm.
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';
import { useUi } from '../../store/ui';
import { errorText } from '../../lib/format';
import { ArtworkImage } from '../../components/Exhibition';
import Icon from '../../components/Icon';

const RULES = [5, 6, 7, 8];

export default function Review() {
  const { t, i18n } = useTranslation();
  const user = useAuth((s) => s.user);
  const toast = useUi((s) => s.toast);
  const [d, setD] = useState(null);
  const [rejecting, setRejecting] = useState(null);

  const load = () => api.get('/exhibition/review').then(setD).catch((e) => toast(errorText(t, e), 'error'));
  useEffect(() => {
    if (user?.role === 'admin') load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (user?.role !== 'admin') return <Navigate to="/exhibition" replace />;
  if (!d) return <div className="page text-center text-muted">{t('common.loading')}</div>;

  async function approve(ids) {
    try {
      await api.post('/exhibition/review/approve', { ids });
      load();
    } catch (e) {
      toast(errorText(t, e), 'error');
    }
  }
  async function reject(id, rule) {
    try {
      await api.post(`/exhibition/review/${id}/reject`, { rule });
      setRejecting(null);
      load();
    } catch (e) {
      toast(errorText(t, e), 'error');
    }
  }

  return (
    <div className="page space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/exhibition" className="btn-ghost min-h-11 px-3" aria-label={t('common.back')}>
          <Icon name="back" />
        </Link>
        <h1 className="page-title min-w-0 flex-1">🛡️ {t('exhibition.review.title')}</h1>
        {d.entries.length > 0 && (
          <button type="button" className="btn-primary" onClick={() => approve(d.entries.map((e) => e.id))} data-testid="approve-all">
            <Icon name="check" /> {t('exhibition.review.approveAll', { n: d.entries.length })}
          </button>
        )}
      </div>
      <p className="text-muted">{t('exhibition.review.hint')}</p>
      {d.entries.length === 0 && <div className="card p-8 text-center font-bold text-muted">🎉 {t('exhibition.review.empty')}</div>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {d.entries.map((e) => (
          <div key={e.id} className={`card space-y-2 p-3 ${e.hidden ? 'ring-4 ring-coral' : ''}`} data-testid={`review-${e.id}`}>
            <ArtworkImage cacheKey={`r${e.id}`} picture={d.pictures[e.pictureId]} data={e.data} size={400} className="rounded-xl border border-line" />
            <div className="text-sm font-bold">{e.name[i18n.language]}</div>
            <div className="text-xs text-muted">
              {e.author.nickname} · {t(`exhibition.boards.${e.board}`)}
              {e.hidden && <b className="ml-1 text-coral">· 🚩 {t('exhibition.review.reported', { n: e.reports })}</b>}
            </div>
            {rejecting === e.id ? (
              <div className="space-y-1">
                <div className="text-xs font-bold">{t('exhibition.review.pickRule')}</div>
                {RULES.map((r) => (
                  <button key={r} type="button" className="btn-ghost min-h-9 w-full justify-start px-2 text-left text-xs" onClick={() => reject(e.id, r)} data-testid={`reject-${e.id}-${r}`}>
                    {r}. {t(`exhibition.rules.r${r}.title`)}
                  </button>
                ))}
                <button type="button" className="w-full text-xs text-muted underline" onClick={() => setRejecting(null)}>{t('common.cancel')}</button>
              </div>
            ) : (
              <div className="flex gap-1.5">
                <button type="button" className="btn-primary min-h-10 flex-1 px-2 text-sm" onClick={() => approve([e.id])}>
                  {e.hidden ? t('exhibition.review.restore') : t('exhibition.review.approve')}
                </button>
                <button type="button" className="btn-danger min-h-10 flex-1 px-2 text-sm" onClick={() => setRejecting(e.id)} data-testid={`reject-${e.id}`}>
                  {e.hidden ? t('exhibition.review.remove') : t('exhibition.review.reject')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
