// Bạn bè & trao đổi thẻ (Mục 10.3): kết bạn chỉ qua mã mời riêng; tặng/đổi tối đa 3 lượt/ngày, xác nhận 2 chiều.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useUi } from '../../store/ui';
import { useAuth } from '../../store/auth';
import { errorText } from '../../lib/format';
import Avatar from '../../components/Avatar/Avatar';
import Modal from '../../components/Modal/Modal';
import Icon from '../../components/Icon';
import { CardTile } from '../Gacha/Gacha';
import { RarityBadge } from '../../components/GachaCardReveal/GachaCardReveal';
import { FriendCardsArt, TradeCardsArt } from '../../components/FriendsArt';

function TradeModal({ friend, onClose, onDone, usedToday, limit }) {
  const { t, i18n } = useTranslation();
  const toast = useUi((s) => s.toast);
  const [mine, setMine] = useState([]);
  const [theirs, setTheirs] = useState([]);
  const [kind, setKind] = useState('gift');
  const [offer, setOffer] = useState(null);
  const [request, setRequest] = useState(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    api.get('/gacha/cards').then((r) => setMine(r.cards.filter((c) => !c.locked)));
    api.get(`/social/friends/${friend.id}/cards`).then((r) => setTheirs(r.cards));
  }, [friend.id]);

  async function send() {
    try {
      await api.post('/social/trades', { toUserId: friend.id, offerCardId: offer.id, requestCardId: kind === 'exchange' ? request?.id : null });
      toast(t('trade.sent'), 'success');
      onDone();
    } catch (e) {
      toast(errorText(t, e), 'error');
      setConfirm(false);
    }
  }

  const ready = offer && (kind === 'gift' || request);
  return (
    <Modal open onClose={onClose} wide>
      <h2 className="font-display text-2xl font-extrabold">{t('trade.with', { name: friend.nickname })}</h2>
      <p className="mb-3 text-sm text-muted">{t('trade.limit', { used: usedToday, limit })}</p>
      <div className="mb-3 flex gap-2">
        {['gift', 'exchange'].map((k) => (
          <button key={k} type="button" onClick={() => setKind(k)} className={`btn flex-1 text-base ${kind === k ? 'bg-primary text-white' : 'bg-primary-light text-primary-dark'}`}>
            <Icon name={k === 'gift' ? 'gift' : 'swap'} /> {t(`trade.kind.${k}`)}
          </button>
        ))}
      </div>
      {!confirm ? (
        <>
          <h3 className="mb-2 font-bold">{t('trade.pickMine')}</h3>
          {mine.length === 0 && <p className="text-muted">{t('trade.noCards')}</p>}
          <div className="mb-4 grid max-h-64 grid-cols-3 gap-2 overflow-y-auto p-1 sm:grid-cols-5">
            {mine.map((c) => <CardTile key={c.id} card={c} selected={offer?.id === c.id} onClick={() => setOffer(c)} />)}
          </div>
          {kind === 'exchange' && (
            <>
              <h3 className="mb-2 font-bold">{t('trade.pickTheirs', { name: friend.nickname })}</h3>
              {theirs.length === 0 && <p className="text-muted">{t('trade.friendNoCards')}</p>}
              <div className="mb-4 grid max-h-64 grid-cols-3 gap-2 overflow-y-auto p-1 sm:grid-cols-5">
                {theirs.map((c) => <CardTile key={c.id} card={c} selected={request?.id === c.id} onClick={() => setRequest(c)} />)}
              </div>
            </>
          )}
          <button type="button" className="btn-primary w-full" disabled={!ready || usedToday >= limit} onClick={() => setConfirm(true)} data-testid="trade-next">
            {t('common.next')}
          </button>
        </>
      ) : (
        <div className="space-y-3 text-center">
          <p className="text-lg font-bold">
            {kind === 'gift'
              ? t('trade.confirmGift', { card: offer.name[i18n.language], name: friend.nickname })
              : t('trade.confirmExchange', { mine: offer.name[i18n.language], theirs: request.name[i18n.language], name: friend.nickname })}
          </p>
          <p className="text-sm text-muted">{t('trade.twoWay')}</p>
          <div className="flex gap-2">
            <button type="button" className="btn-ghost flex-1" onClick={() => setConfirm(false)}>{t('common.back')}</button>
            <button type="button" className="btn-coral flex-1" onClick={send} data-testid="trade-send">{t('trade.send')}</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function Friends() {
  const { t, i18n } = useTranslation();
  const toast = useUi((s) => s.toast);
  const myId = useAuth((s) => s.user?.id);
  const [data, setData] = useState(null);
  const [trades, setTrades] = useState(null);
  const [code, setCode] = useState('');
  const [tradeWith, setTradeWith] = useState(null);
  const [answer, setAnswer] = useState(null);

  const load = () => {
    api.get('/social/friends').then(setData);
    api.get('/social/trades').then(setTrades);
  };
  useEffect(load, []);

  const run = (fn, ok) => async (...a) => {
    try {
      await fn(...a);
      if (ok) toast(ok, 'success');
      load();
    } catch (e) {
      toast(errorText(t, e), 'error');
    }
  };

  const addFriend = run(async (e) => {
    e.preventDefault();
    const r = await api.post('/social/friends', { code });
    setCode('');
    toast(r.status === 'accepted' ? t('friends.nowFriends') : t('friends.requestSent'), 'success');
  });

  if (!data) return <div className="page text-muted">{t('common.loading')}</div>;
  const me = data;
  const pending = (trades?.trades || []).filter((x) => x.status === 'pending');
  const history = (trades?.trades || []).filter((x) => x.status !== 'pending').slice(0, 20);
  const isIncoming = (x) => x.to.id === myId;

  return (
    <div className="fr-stage">
    <div className="page fr-page space-y-6">
      <header className="fr-head">
        <div className="fr-titlebox">
          <Icon name="users" size={62} strokeWidth={2.4} className="fr-title-ico" />
          <span className="fr-divider" aria-hidden="true" />
          <div>
            <h1 className="fr-title">{t('friends.title')}</h1>
            <p className="fr-sub">{t('friends.subtitle')}</p>
          </div>
        </div>
        <img src="/friends/deco.webp" alt="" className="fr-deco" draggable={false} />
      </header>

      <section className="fr-card fr-card-first">
        <div className="fr-tab fr-tab-blue"><Icon name="user" size={26} /> {t('friends.newFriend')}</div>
        <div className="fr-add">
          <div>
            <div className="fr-label">{t('friends.myCode')}</div>
            <div className="flex items-center gap-3">
              <span className="fr-code" data-testid="my-friend-code">{me.myCode}</span>
              <button type="button" className="fr-copy" onClick={() => navigator.clipboard?.writeText(me.myCode).then(() => toast(t('common.copied'), 'success'))} aria-label={t('common.copy')}>
                <Icon name="copy" size={24} />
              </button>
            </div>
            <p className="fr-hint">{t('friends.codeHint')}</p>
          </div>
          <span className="fr-vsep" aria-hidden="true" />
          <form onSubmit={addFriend}>
            <label className="fr-label" htmlFor="fcode">{t('friends.addByCode')}</label>
            <div className="flex flex-wrap gap-3">
              <div className="fr-input-wrap">
                <Icon name="users" size={26} className="fr-input-ico" />
                <input id="fcode" className="fr-input" value={code} onChange={(e) => setCode(e.target.value)} maxLength={12} required placeholder={t('friends.codePlaceholder')} data-testid="friend-code-input" />
              </div>
              <button type="submit" className="fr-add-btn" data-testid="friend-add"><Icon name="user" size={26} /> {t('friends.add')}</button>
            </div>
          </form>
        </div>
      </section>

      {data.incoming.length > 0 && (
        <section className="fr-card">
          <div className="fr-tab fr-tab-green"><Icon name="bell" size={26} /> {t('friends.incoming')}</div>
          <div className="space-y-2 pt-2">
            {data.incoming.map((f) => (
              <div key={f.friendshipId} className="card flex items-center gap-3 p-3">
                <Avatar avatar={f.user.avatar} frame={f.user.avatarFrame} vip={f.user.vip} size={48} />
                <div className="flex-1 font-bold">{f.user.nickname}</div>
                <button type="button" className="btn-primary min-h-11 px-4 text-base" onClick={run(() => api.post(`/social/friends/${f.friendshipId}/accept`), t('friends.nowFriends'))} data-testid="friend-accept">
                  {t('friends.accept')}
                </button>
                <button type="button" className="btn-ghost min-h-11 px-3" onClick={run(() => api.del(`/social/friends/${f.friendshipId}`))} aria-label={t('friends.decline')}>
                  <Icon name="close" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="fr-card">
        <div className="fr-tab fr-tab-yellow"><Icon name="users" size={26} /> {t('friends.list')} ({data.friends.length})</div>
        {data.friends.length === 0 && (
          <div className="fr-empty"><FriendCardsArt /><p>{t('friends.empty')}</p></div>
        )}
        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          {data.friends.map((f) => (
            <div key={f.friendshipId} className="fr-friend">
              <Avatar avatar={f.user.avatar} frame={f.user.avatarFrame} vip={f.user.vip} size={52} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold">{f.user.nickname}</div>
                <div className="text-xs text-muted">
                  {t('home.level', { level: f.user.level })} · {t(`rank.${f.user.rank}`)}
                </div>
              </div>
              <Link to={`/showcase/${f.user.id}`} className="btn-ghost min-h-11 px-3 text-base" title={t('showcase.title')} aria-label={t('showcase.title')} data-testid="friend-showcase">
                <Icon name="museum" size={20} />
              </Link>
              <button type="button" className="btn-primary min-h-11 px-3 text-base" onClick={() => setTradeWith(f.user)} data-testid="friend-trade">
                <Icon name="swap" size={20} />
              </button>
            </div>
          ))}
        </div>
        {data.outgoing.length > 0 && <p className="mt-2 text-sm text-muted">{t('friends.outgoing', { n: data.outgoing.length })}</p>}
      </section>

      <section className="fr-card">
        <div className="fr-tab fr-tab-purple"><Icon name="gift" size={26} /> {t('trade.title')}</div>
        {trades && <p className="fr-limit">{t('trade.limit', { used: trades.usedToday, limit: trades.dailyLimit })}</p>}
        {pending.length === 0 && <div className="fr-empty"><TradeCardsArt /><p>{t('trade.nonePending')}</p></div>}
        <div className="space-y-2">
          {pending.map((x) => {
            const incoming = isIncoming(x);
            return (
              <div key={x.id} className="card flex flex-wrap items-center gap-3 p-3" data-testid={`trade-${x.id}`}>
                <Avatar avatar={(incoming ? x.from : x.to).avatar} frame={(incoming ? x.from : x.to).avatarFrame} size={44} />
                <div className="min-w-0 flex-1 text-sm">
                  <div className="font-bold">{incoming ? t('trade.fromX', { name: x.from.nickname }) : t('trade.toX', { name: x.to.nickname })}</div>
                  <div className="flex flex-wrap items-center gap-1">
                    <RarityBadge rarity={x.offer.rarity} className="h-6 min-w-6 text-sm" /> {x.offer.name[i18n.language]}
                    {x.request && (
                      <>
                        <Icon name="swap" size={16} /> <RarityBadge rarity={x.request.rarity} className="h-6 min-w-6 text-sm" /> {x.request.name[i18n.language]}
                      </>
                    )}
                  </div>
                </div>
                {incoming ? (
                  <>
                    <button type="button" className="btn-primary min-h-11 px-4 text-base" onClick={() => setAnswer(x)} data-testid="trade-accept">{t('trade.accept')}</button>
                    <button type="button" className="btn-ghost min-h-11 px-3 text-base" onClick={run(() => api.post(`/social/trades/${x.id}/decline`))}>{t('trade.decline')}</button>
                  </>
                ) : (
                  <button type="button" className="btn-ghost min-h-11 px-3 text-base" onClick={run(() => api.post(`/social/trades/${x.id}/cancel`))}>{t('common.cancel')}</button>
                )}
              </div>
            );
          })}
        </div>
        {history.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer font-bold text-muted">{t('trade.history')}</summary>
            <ul className="mt-2 space-y-1 text-sm">
              {history.map((x) => (
                <li key={x.id}>
                  {x.from.nickname} → {x.to.nickname}: {x.offer?.name[i18n.language]} {x.request && `⇄ ${x.request.name[i18n.language]}`} — <b>{t(`trade.status.${x.status}`)}</b>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      {tradeWith && (
        <TradeModal friend={tradeWith} usedToday={trades?.usedToday || 0} limit={trades?.dailyLimit || 3} onClose={() => setTradeWith(null)} onDone={() => { setTradeWith(null); load(); }} />
      )}
      <Modal open={!!answer} onClose={() => setAnswer(null)}>
        {answer && (
          <div className="space-y-3 text-center">
            <h2 className="font-display text-2xl font-extrabold">{t('trade.confirmAcceptTitle')}</h2>
            <p>
              {answer.request
                ? t('trade.confirmAcceptExchange', { name: answer.from.nickname, theirs: answer.offer.name[i18n.language], mine: answer.request.name[i18n.language] })
                : t('trade.confirmAcceptGift', { name: answer.from.nickname, card: answer.offer.name[i18n.language] })}
            </p>
            <div className="flex gap-2">
              <button type="button" className="btn-ghost flex-1" onClick={() => setAnswer(null)}>{t('common.cancel')}</button>
              <button
                type="button"
                className="btn-primary flex-1"
                data-testid="trade-accept-confirm"
                onClick={run(async () => {
                  await api.post(`/social/trades/${answer.id}/accept`);
                  setAnswer(null);
                }, t('trade.done'))}
              >
                {t('trade.accept')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
    </div>
  );
}
