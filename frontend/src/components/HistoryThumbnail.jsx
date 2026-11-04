import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/auth';
import { acquireHistoryThumbnail } from '../lib/historyCache';

export default function HistoryThumbnail({ artwork }) {
  const { t } = useTranslation();
  const token = useAuth(state => state.token);
  const ref = useRef(null);
  const [near, setNear] = useState(false), [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false), [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!artwork.hasThumbnail || artwork.thumbnail) return;
    if (typeof IntersectionObserver === 'undefined') { setNear(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setNear(true); observer.disconnect(); }
    }, { rootMargin:'240px' });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [artwork.hasThumbnail, artwork.thumbnail]);
  useEffect(() => {
    if (!near || !artwork.hasThumbnail || artwork.thumbnail) return;
    let alive = true;
    setFailed(false); setSrc(null);
    const lease = acquireHistoryThumbnail(token, artwork.id, artwork.updatedAt);
    lease.promise.then(url => { if (alive) setSrc(url); }).catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; lease.release(); };
  }, [token, artwork.id, artwork.updatedAt, artwork.hasThumbnail, artwork.thumbnail, near, attempt]);
  const image = artwork.thumbnail || src;
  return <div ref={ref} className="h-full w-full">
    {image ? <img src={image} alt="" decoding="async" />
      : failed ? <span role="button" tabIndex={0} className="hs-nothumb" onClick={event => {
        event.stopPropagation(); setAttempt(n => n+1);
      }} onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); setAttempt(n => n+1); }
      }}>{t('common.tryAgain')}</span>
      : artwork.hasThumbnail ? <div className="h-full animate-pulse bg-sky-50" role="status" aria-label={t('common.loading')} />
      : <div className="hs-nothumb">{t('history.noPreview')}</div>}
  </div>;
}
