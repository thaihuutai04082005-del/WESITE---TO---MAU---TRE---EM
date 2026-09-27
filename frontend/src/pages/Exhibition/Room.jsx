// Một phòng tranh (bảng S / A / B / Sáng tạo): tranh treo tường trong khung, bấm để xem và thả cảm xúc.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { boardMeta } from '../../lib/exhibition';
import { EntryModal, FramedArtwork, RulesButton } from '../../components/Exhibition';
import { ScheduleBanner } from './Hall';
import Icon from '../../components/Icon';

export default function Room() {
  const { board } = useParams();
  const { t } = useTranslation();
  const [d, setD] = useState(null);
  const [openId, setOpenId] = useState(null);
  const b = boardMeta(board);

  useEffect(() => {
    setD(null);
    api.get(`/exhibition/rooms/${board}`).then(setD).catch(() => setD({ entries: [], pictures: {}, error: true }));
  }, [board]);

  const open = d?.entries.find((e) => e.id === openId);
  const update = (e) => setD((x) => ({ ...x, entries: x.entries.map((y) => (y.id === e.id ? e : y)) }));

  return (
    <div className="page space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/exhibition" className="btn-ghost min-h-11 px-3" aria-label={t('common.back')}>
          <Icon name="back" />
        </Link>
        <h1 className="page-title min-w-0 flex-1">
          {b.icon} {t(`exhibition.boards.${b.key}`)}
        </h1>
        <RulesButton />
      </div>
      {d?.schedule && <ScheduleBanner schedule={d.schedule} />}

      {/* Bức tường phòng tranh */}
      <section className="relative overflow-hidden rounded-[32px] border-4 p-5 sm:p-8" style={{ borderColor: b.frame, background: `repeating-linear-gradient(90deg, ${b.wall} 0 38px, ${b.frameLight}66 38px 40px)` }}>
        {!d && <div className="py-16 text-center text-muted">{t('common.loading')}</div>}
        {d && d.entries.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center" data-testid="room-empty">
            <img src="/mascots/tho.svg" alt="" className="h-28 w-28" />
            <p className="max-w-sm font-bold text-muted">{t('exhibition.emptyRoom')}</p>
            <Link to="/collection?tab=artworks" className="btn-coral">🖼️ {t('exhibition.submitCta')}</Link>
          </div>
        )}
        {d && d.entries.length > 0 && (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {d.entries.map((e) => (
              <FramedArtwork key={e.id} entry={e} picture={d.pictures[e.pictureId]} onClick={() => setOpenId(e.id)} />
            ))}
          </div>
        )}
      </section>

      {open && <EntryModal entry={open} picture={d.pictures[open.pictureId]} reactionsOpen={d.schedule.reactionsOpen} onClose={() => setOpenId(null)} onChange={update} />}
    </div>
  );
}
