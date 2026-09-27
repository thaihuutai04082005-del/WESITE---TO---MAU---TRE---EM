// Khoe & chia sẻ (Đợt 3): hộp "Khoe tranh", nút giấy khen, Tủ kính thành tích.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useUi } from '../store/ui';
import { useAuth } from '../store/auth';
import Avatar from './Avatar/Avatar';
import { errorText } from '../lib/format';
import { safeFileName } from '../lib/exportImage';
import { downloadCertificate, renderShareCard, shareOrDownload } from '../lib/share';
import { REACTIONS } from '../lib/exhibition';
import { EntryModal, FramedArtwork } from './Exhibition';
import Modal from './Modal/Modal';

/** Hộp "Khoe tranh": tạo ảnh đẹp (khung + chữ ký + tên web) để gửi người thân. */
export function ShareDialog({ artworkId, entry = null, onClose }) {
  const { t, i18n } = useTranslation();
  const toast = useUi((s) => s.toast);
  const nickname = useAuth((s) => s.user?.nickname || '');
  const [url, setUrl] = useState(null);
  const [name, setName] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      const d = await api.get(`/artworks/${artworkId}`);
      const title = d.picture.name[i18n.language];
      const u = await renderShareCard({
        picture: d.picture,
        data: d.artwork.data,
        title,
        nickname,
        entry,
        labels: { brand: t('share.brand'), by: t('exhibition.by'), award: t('exhibition.awardShort') },
      });
      if (alive) {
        setName(title);
        setUrl(u);
      }
    })().catch((e) => toast(errorText(t, e), 'error'));
    return () => {
      alive = false;
    };
  }, [artworkId, entry, nickname, i18n.language, t, toast]);

  async function go(download) {
    const file = `${safeFileName(name)}-khoe.png`;
    if (download) {
      const a = document.createElement('a');
      a.href = url;
      a.download = file;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }
    const r = await shareOrDownload(url, file, name);
    if (r === 'downloaded') toast(t('share.downloaded'), 'success');
  }

  return (
    <Modal open onClose={onClose}>
      <div className="space-y-3" data-testid="share-dialog">
        <h2 className="font-display text-2xl font-extrabold">📤 {t('share.title')}</h2>
        <p className="text-sm text-muted">{t('share.hint')}</p>
        <div className="overflow-hidden rounded-2xl border-2 border-line bg-primary-light">
          {url ? <img src={url} alt="" className="block w-full" data-testid="share-preview" /> : <div className="aspect-[4/5] animate-pulse" />}
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost flex-1" disabled={!url} onClick={() => go(true)} data-testid="share-download">
            ⬇️ {t('share.download')}
          </button>
          <button type="button" className="btn-coral flex-1" disabled={!url} onClick={() => go(false)} data-testid="share-send">
            📤 {t('share.send')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/** Nút tải giấy khen PDF cho tranh đạt danh hiệu. */
export function CertificateButton({ entry, className = 'btn-primary' }) {
  const { t, i18n } = useTranslation();
  const toast = useUi((s) => s.toast);
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    try {
      await downloadCertificate(entry.id, entry.artworkId, i18n.language, `giay-khen-${safeFileName(entry.name[i18n.language])}.pdf`);
    } catch (e) {
      toast(errorText(t, e), 'error');
    } finally {
      setBusy(false);
    }
  }
  return (
    <button type="button" className={className} disabled={busy} onClick={go} data-testid={`certificate-${entry.id}`}>
      📜 {busy ? t('common.loading') : t('share.certificate')}
    </button>
  );
}

/** Tủ kính thành tích: tranh đã lên hội trường, kèm bảng cảm xúc và danh hiệu. */
export function Showcase({ userId, own = false, withOwner = false }) {
  const { t } = useTranslation();
  const [d, setD] = useState(null);
  const [open, setOpen] = useState(null);
  const [share, setShare] = useState(null);

  useEffect(() => {
    api.get(`/exhibition/showcase/${userId}`).then(setD).catch(() => setD({ entries: [], pictures: {} }));
  }, [userId]);

  if (!d) return <div className="text-center text-muted">{t('common.loading')}</div>;
  const awards = d.entries.filter((e) => e.award).length;
  const hearts = d.entries.reduce((n, e) => n + e.total, 0);

  return (
    <div className="space-y-4" data-testid="showcase">
      {withOwner && d.owner && (
        <div className="flex items-center gap-3">
          <Avatar avatar={d.owner.avatar} frame={d.owner.avatarFrame} size={64} />
          <h1 className="page-title">{t('showcase.of', { name: d.owner.nickname })}</h1>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <span className="chip">🏛️ {t('showcase.exhibited', { n: d.entries.length })}</span>
        <span className="chip">🏆 {t('showcase.awards', { n: awards })}</span>
        <span className="chip">💖 {t('showcase.reactions', { n: hearts })}</span>
      </div>
      {d.entries.length === 0 ? (
        <p className="rounded-2xl bg-primary-light p-4 text-center font-bold text-primary-dark">🐻 {own ? t('showcase.emptyOwn') : t('showcase.empty')}</p>
      ) : (
        <div className="rounded-3xl bg-gradient-to-b from-[#FFF8E6] to-[#F3E3D3] p-4 shadow-inner">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {d.entries.map((e) => (
              <div key={e.id} className="flex flex-col gap-2">
                <FramedArtwork entry={e} picture={d.pictures[e.pictureId]} onClick={() => setOpen(e)} size={320} />
                <div className="flex flex-wrap justify-center gap-1 text-xs font-bold">
                  {e.onShow && <span className="rounded-full bg-mint/25 px-2">{t('exhibition.status.showing')}</span>}
                  {REACTIONS.filter((r) => e.reactions[r.key]).map((r) => (
                    <span key={r.key}>
                      {r.emoji}
                      {e.reactions[r.key]}
                    </span>
                  ))}
                </div>
                {own && (
                  <div className="flex flex-col gap-1.5">
                    <button type="button" className="btn-coral min-h-10 px-2 text-sm" onClick={() => setShare(e)} data-testid={`show-share-${e.id}`}>
                      📤 {t('share.button')}
                    </button>
                    {e.award && <CertificateButton entry={e} className="btn-primary min-h-10 px-2 text-sm" />}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {open && <EntryModal entry={{ ...open, final: true }} picture={d.pictures[open.pictureId]} reactionsOpen={false} onClose={() => setOpen(null)} />}
      {share && <ShareDialog artworkId={share.artworkId} entry={share} onClose={() => setShare(null)} />}
    </div>
  );
}
