// Shop (Mục 8.4): skin cọ vẽ & Khung Artwork mua bằng Ruby. Khung Avatar chỉ mở khoá qua Rank.
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';
import { useUi } from '../../store/ui';
import { errorText } from '../../lib/format';
import { drawStroke } from '../../lib/brush';
import { ARTWORK_FRAMES } from '../../lib/frames';
import Modal from '../../components/Modal/Modal';
import Avatar from '../../components/Avatar/Avatar';
import Icon from '../../components/Icon';

function BrushPreview({ skin }) {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = ref.current.getContext('2d');
    ctx.clearRect(0, 0, 240, 120);
    const pts = Array.from({ length: 40 }, (_, i) => [10 + i * 5.5, 60 + Math.sin(i / 4) * 30]);
    drawStroke(ctx, { tool: 'brush', color: '#FF5F7E', size: 14, points: pts, skin }, 1);
  }, [skin]);
  return <canvas ref={ref} width={240} height={120} className="h-auto w-full rounded-xl bg-white" />;
}

function Preview({ item }) {
  if (item.type === 'brush_skin') return <BrushPreview skin={item.slug} />;
  if (item.type === 'artwork_frame')
    return <svg viewBox="0 0 700 700" className="w-full" dangerouslySetInnerHTML={{ __html: `${ARTWORK_FRAMES[item.slug]?.() || ''}<rect x="50" y="50" width="600" height="600" fill="#EAF6FF"/><image href="/avatars/meo.svg" x="150" y="150" width="400" height="400"/>` }} />;
  return null;
}

export default function Shop() {
  const { t, i18n } = useTranslation();
  const user = useAuth((s) => s.user);
  const refresh = useAuth((s) => s.refresh);
  const updateProfile = useAuth((s) => s.updateProfile);
  const toast = useUi((s) => s.toast);
  const pushEvents = useUi((s) => s.pushEvents);
  const [shop, setShop] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const load = () => api.get('/shop').then(setShop);
  useEffect(() => {
    load();
  }, []);

  async function buy(item) {
    try {
      const r = await api.post(`/shop/${item.slug}/buy`);
      toast(t('shop.bought', { name: item.name[i18n.language] }), 'success');
      pushEvents(r.events);
      await load();
      refresh().catch(() => {});
    } catch (e) {
      toast(errorText(t, e), 'error');
    } finally {
      setConfirm(null);
    }
  }

  if (!shop) return <div className="page text-muted">{t('common.loading')}</div>;
  const sections = [
    ['brush_skin', t('shop.brushes')],
    ['artwork_frame', t('shop.frames')],
  ];
  return (
    <div className="page space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="page-title">{t('shop.title')}</h1>
        <span className="chip text-lg" data-testid="shop-ruby"><Icon name="ruby" size={18} /> {shop.ruby} Ruby</span>
      </div>
      <p className="-mt-6 text-muted">{t('shop.hint')}</p>
      {sections.map(([type, title]) => (
        <section key={type}>
          <h2 className="mb-3 font-display text-2xl font-bold">{title}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {shop.items.filter((i) => i.type === type).map((item) => {
              const equipped = type === 'brush_skin' && user.brushSkin === item.slug;
              return (
                <div key={item.slug} className="card flex flex-col gap-2 p-3">
                  <div className="relative">
                    <Preview item={item} />
                    {item.limited && <span className="absolute right-1 top-1 rounded-full bg-coral px-2 text-xs font-extrabold text-white">{t('shop.limited')}</span>}
                  </div>
                  <div className="font-bold leading-tight">{item.name[i18n.language]}</div>
                  {item.owned ? (
                    type === 'brush_skin' ? (
                      <button type="button" className={equipped ? 'btn-ghost' : 'btn-primary'} onClick={() => updateProfile({ brushSkin: equipped ? null : item.slug })}>
                        {equipped ? t('shop.unequip') : t('shop.equip')}
                      </button>
                    ) : (
                      <span className="btn-ghost pointer-events-none">{t('shop.owned')}</span>
                    )
                  ) : (
                    <button type="button" className="btn-coral" disabled={shop.ruby < item.price} onClick={() => setConfirm(item)} data-testid={`buy-${item.slug}`}>
                      <Icon name="ruby" size={18} /> {item.price}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
      <section>
        <h2 className="mb-1 font-display text-2xl font-bold">{t('shop.avatarFrames')}</h2>
        <p className="mb-3 text-sm text-muted">{t('shop.avatarFramesHint')}</p>
        <div className="grid grid-cols-5 gap-2">
          {shop.items.filter((i) => i.type === 'avatar_frame').map((item) => (
            <div key={item.slug} className={`card flex flex-col items-center p-2 text-center ${item.owned ? '' : 'opacity-50'}`}>
              <Avatar avatar={user.avatar} frame={item.slug} size={60} />
              <div className="text-xs font-bold">{t(`rank.${item.rank}`)}</div>
              {!item.owned && <Icon name="lock" size={16} />}
            </div>
          ))}
        </div>
      </section>
      <Modal open={!!confirm} onClose={() => setConfirm(null)}>
        {confirm && (
          <div className="space-y-3 text-center">
            <h2 className="font-display text-2xl font-extrabold">{t('shop.confirmTitle')}</h2>
            <p>{t('shop.confirmText', { name: confirm.name[i18n.language], price: confirm.price })}</p>
            <div className="flex gap-2">
              <button type="button" className="btn-ghost flex-1" onClick={() => setConfirm(null)}>{t('common.cancel')}</button>
              <button type="button" className="btn-coral flex-1" onClick={() => buy(confirm)} data-testid="confirm-buy">{t('shop.buy')}</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
