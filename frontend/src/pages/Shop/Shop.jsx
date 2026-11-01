// Shop (Mục 8.4): màu họa tiết, khung tranh & bìa truyện mua bằng Ruby. Khung Avatar chỉ mở khoá qua Rank.
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';
import { useUi } from '../../store/ui';
import { errorText } from '../../lib/format';
import { drawStroke } from '../../lib/brush';
import { STORY_COVERS } from '../../lib/storyCovers';
import { ARTWORK_FRAMES } from '../../lib/frames';
import Modal from '../../components/Modal/Modal';
import Avatar from '../../components/Avatar/Avatar';
import Icon from '../../components/Icon';
import useWide from '../../hooks/useWide';
import { ShopArt, Bag, RubyGem, SHOP_W, SHOP_H } from '../../components/ShopScene';

// Khung gỗ là khung mặc định miễn phí: không bày bán trong Shop.
const DEFAULT_FRAME = 'khung-go';

function PatternPreview({ slug, scene = false, className = 'h-auto w-full rounded-xl bg-white' }) {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = ref.current.getContext('2d');
    const k = scene ? 4 : 1; // bản quầy hàng vẽ ở độ phân giải gấp 4 cho nét
    ctx.clearRect(0, 0, 240 * k, 120 * k);
    const pts = Array.from({ length: 40 }, (_, i) => [14 + i * 5.2, 60 + Math.sin(i / 4) * 26]);
    drawStroke(ctx, { kind: 'pattern', pattern: slug, color: '#FF5F7E', size: 44, points: pts }, k);
  }, [slug, scene]);
  return <canvas ref={ref} width={scene ? 960 : 240} height={scene ? 480 : 120} className={className} />;
}

function CoverMock({ slug, className }) {
  const c = STORY_COVERS[slug] || { solid: '#BDE6FF', line: '#2B9BF4' };
  return (
    <svg viewBox="0 0 200 140" className={className}>
      <rect x="62" y="6" width="76" height="128" rx="8" fill={c.solid} stroke={c.line} strokeWidth="5" />
      <rect x="70" y="14" width="60" height="112" rx="5" fill="none" stroke={c.line} strokeWidth="2.5" opacity=".7" />
      <rect x="78" y="46" width="44" height="7" rx="3.5" fill={c.line} opacity=".85" />
      <rect x="86" y="60" width="28" height="5" rx="2.5" fill={c.line} opacity=".55" />
    </svg>
  );
}

function Preview({ item, scene = false }) {
  if (item.type === 'pattern') return <PatternPreview slug={item.slug} scene={scene} className={scene ? 'sh-prev-canvas' : undefined} />;
  if (item.type === 'storybook_cover') return <CoverMock slug={item.slug} className={scene ? 'sh-prev-svg' : 'w-full'} />;
  if (item.type === 'artwork_frame')
    return <svg viewBox="0 0 700 700" className={scene ? 'sh-prev-svg' : 'w-full'} dangerouslySetInnerHTML={{ __html: `${ARTWORK_FRAMES[item.slug]?.() || ''}<rect x="50" y="50" width="600" height="600" fill="#EAF6FF"/><image href="/avatars/meo.svg" x="150" y="150" width="400" height="400"/>` }} />;
  return null;
}

// Cảnh quầy hàng (khung 1821×864, nền trời là ảnh): 2 kệ × 4 ô, bảng chọn loại ở bên trái.
const W = SHOP_W;
const H = SHOP_H;
const COLS = [320, 622, 924, 1226]; // đã dịch trái 48 theo quầy
const SLOTS = [
  ...COLS.map((x) => [x, 360, 284, 262]),
  ...COLS.map((x) => [x, 700, 284, 250]),
];
const pc = (v, total) => `${(v / total) * 100}%`;
const box = ([x, y, w, h]) => ({ left: pc(x, W), top: pc(y, H), width: pc(w, W), height: pc(h, H) });

function SceneCard({ item, ruby, onBuy, t, lang, geo }) {
  return (
    <div className="sh-card" style={box(geo)} data-testid={`shop-item-${item.slug}`}>
      <div className="sh-ci">
        <span className="sh-peg" aria-hidden="true" />
        <div className="sh-body">
          <div className="sh-prev">
            <Preview item={item} scene />
            {item.limited && <span className="sh-limited">{t('shop.limited')}</span>}
          </div>
          <div className="sh-name">{item.name[lang]}</div>
          {item.owned ? (
              <span className="sh-btn sh-btn-ghost sh-btn-static">{t('shop.owned')}</span>
          ) : (
            <button type="button" className="sh-btn" disabled={ruby < item.price} onClick={() => onBuy(item)} data-testid={`buy-${item.slug}`}>
              <RubyGem size={20} /> {item.price}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  const { t, i18n } = useTranslation();
  const user = useAuth((s) => s.user);
  const refresh = useAuth((s) => s.refresh);
  const toast = useUi((s) => s.toast);
  const pushEvents = useUi((s) => s.pushEvents);
  const [shop, setShop] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const wide = useWide();
  const [tab, setTab] = useState('pattern');
  const [page, setPage] = useState(0);
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
  const avatarFrames = (
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
  );
  const confirmModal = (
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
  );
  if (wide) {
    const list = shop.items.filter((i) => i.type === tab && i.slug !== DEFAULT_FRAME);
    const per = SLOTS.length;
    const pages = Math.max(1, Math.ceil(list.length / per));
    const cur = Math.min(page, pages - 1);
    const shown = list.slice(cur * per, cur * per + per);
    const tabs = [
      ['pattern', <img key="p" src="/tools/pattern.webp" alt="" className="sh-tab-img" draggable={false} />, t('shop.patterns')],
      ['artwork_frame', '🖼️', t('shop.tabFrames')],
      ['storybook_cover', '📖', t('shop.covers')],
    ];
    return (
      <div className="sh-room">
        <img src="/shop/cloud.webp" alt="" className="sh-cloud sh-cloud-1" draggable={false} />
        <img src="/shop/cloud.webp" alt="" className="sh-cloud sh-cloud-2" draggable={false} />
        <img src="/shop/cloud.webp" alt="" className="sh-cloud sh-cloud-3" draggable={false} />
        <div className="sh-stage" data-testid="shop-stall">
          <div className="sh-inner">
          <h1 className="sr-only" data-testid="shop-title">{t('shop.title')}</h1>
          <span className="sr-only" data-testid="shop-ruby">{shop.ruby} Ruby</span>

          <ShopArt />
          <div className="sh-sign" style={box([690, 104, 456, 112])}>
            <Bag /> <b>{t('shop.title')}</b>
          </div>

          <div className="sh-tabs" style={box([8, 340, 262, 300])} role="tablist">
            {tabs.map(([k, icon, label]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} className={`sh-tab${tab === k ? ' sh-tab-on' : ''}`} onClick={() => { setTab(k); setPage(0); }} data-testid={`shop-tab-${k}`}>
                <span className="sh-tab-icon" aria-hidden="true">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
          {shown.map((item, i) => (
            <SceneCard
              key={item.slug}
              item={item}
              ruby={shop.ruby}
              onBuy={setConfirm}
              t={t}
              lang={i18n.language}
              geo={SLOTS[i]}
            />
          ))}
          {pages > 1 && (
            <>
              <button type="button" className="sh-arrow" style={box([722, 986, 48, 44])} disabled={cur === 0} onClick={() => setPage(cur - 1)} aria-label={t('common.back')} data-testid="shop-prev">
                <Icon name="back" size={22} strokeWidth={3.4} />
              </button>
              <span className="sh-page" style={box([778, 991, 84, 34])}>{cur + 1}/{pages}</span>
              <button type="button" className="sh-arrow" style={box([858, 986, 48, 44])} disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)} aria-label={t('common.next')} data-testid="shop-next">
                <Icon name="chevronRight" size={22} strokeWidth={3.4} />
              </button>
            </>
          )}
          </div>
        </div>
        {confirmModal}
      </div>
    );
  }
  const sections = [
    ['pattern', t('shop.patterns')],
    ['artwork_frame', t('shop.frames')],
    ['storybook_cover', t('shop.covers')],
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
            {shop.items.filter((i) => i.type === type && i.slug !== DEFAULT_FRAME).map((item) => {
              return (
                <div key={item.slug} className="card flex flex-col gap-2 p-3">
                  <div className="relative">
                    <Preview item={item} />
                    {item.limited && <span className="absolute right-1 top-1 rounded-full bg-coral px-2 text-xs font-extrabold text-white">{t('shop.limited')}</span>}
                  </div>
                  <div className="font-bold leading-tight">{item.name[i18n.language]}</div>
                  {item.owned ? (
                    <span className="btn-ghost pointer-events-none">{t('shop.owned')}</span>
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
      {avatarFrames}
      {confirmModal}
    </div>
  );
}
