import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSocket, emitAck } from '../../services/socket';
import { useAuth } from '../../store/auth';
import { useUi } from '../../store/ui';
import { useArtworkEditor } from '../../hooks/useArtworkEditor';
import { renderThumbnail } from '../../lib/exportImage';
import ColoringWorkspace from '../../components/ColoringWorkspace';
import Avatar from '../../components/Avatar/Avatar';
import Icon from '../../components/Icon';

/** Chuyển thao tác nhận từ server thành action cho editor. */
function opToAction(op, data) {
  switch (op.type) {
    case 'fill':
      return { type: 'fill', regionId: op.regionId, color: op.color, glitter: false };
    case 'glitter':
      return { type: 'fill', regionId: op.regionId, color: data.fills[op.regionId] || null, glitter: op.on };
    case 'stroke':
      return { type: 'stroke', stroke: op.stroke, ...(op.fill ? { fill: op.fill } : {}) };
    case 'sticker':
      return { type: 'sticker-add', sticker: op.sticker };
    case 'sticker-update':
      return { type: 'sticker-update', index: op.index, sticker: op.sticker };
    case 'sticker-remove':
      return { type: 'sticker-remove', index: op.index };
    case 'clear':
      return { type: 'clear' };
    default:
      return null;
  }
}

/** Danh sách bạn bè (đã kết bạn) để mời vào phòng. Mời xong nút mờ đi ~3 giây rồi sáng lại; bạn đã vào phòng thì hiện "Đã vào phòng". */
function FriendInvite({ socket, room }) {
  const { t } = useTranslation();
  const toast = useUi((s) => s.toast);
  const [friends, setFriends] = useState(null);
  const [cool, setCool] = useState({}); // id → đang chờ mời lại
  useEffect(() => {
    api.get('/social/friends').then((r) => setFriends(r.friends.map((f) => f.user))).catch(() => setFriends([]));
  }, []);
  const invite = async (f) => {
    setCool((c) => ({ ...c, [f.id]: true }));
    setTimeout(() => setCool((c) => ({ ...c, [f.id]: false })), 3000);
    const r = await emitAck(socket, 'collab:invite', { toUserId: f.id }).catch(() => ({ error: 'network_error' }));
    if (r.error) toast(t(`errors.${r.error}`, { defaultValue: t('errors.server_error') }), 'error');
    else toast(t('together.inviteSent', { name: f.nickname }), 'success');
  };
  const inRoom = new Set(room.players.map((p) => p.id));
  return (
    <div className="rounded-2xl border-2 border-line bg-white/70 p-2" data-testid="friend-invite">
      <div className="mb-1 px-1 text-sm font-extrabold text-primary-dark">{t('together.friendsTitle')}</div>
      {friends && friends.length === 0 && <p className="px-1 py-2 text-xs font-bold text-muted">{t('together.friendsEmpty')}</p>}
      <ul className="max-h-44 space-y-1.5 overflow-y-auto pr-1 lg:max-h-[30vh]" data-testid="friend-list">
        {(friends || []).map((f) => {
          const here = inRoom.has(f.id);
          return (
            <li key={f.id} className="flex items-center gap-2 rounded-xl bg-white px-1.5 py-1 shadow-soft">
              <Avatar avatar={f.avatar} frame={f.avatarFrame} size={34} />
              <span className="min-w-0 flex-1 truncate text-sm font-bold">{f.nickname}</span>
              {here ? (
                <span className="shrink-0 text-xs font-bold text-[#1E7A44]">{t('together.inRoom')}</span>
              ) : (
                <button type="button" className={`invite-btn${cool[f.id] ? ' invite-btn-wait' : ''}`} disabled={!!cool[f.id] || room.players.length >= room.maxPlayers} onClick={() => invite(f)} data-testid={`invite-${f.id}`}>
                  {t('together.invite')}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function TogetherRoom() {
  const { code } = useParams();
  const { t } = useTranslation();
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  const toast = useUi((s) => s.toast);
  const pushEvents = useUi((s) => s.pushEvents);
  const navigate = useNavigate();
  const editor = useArtworkEditor();
  const [room, setRoom] = useState(null);
  const [picture, setPicture] = useState(null);
  const [cursors, setCursors] = useState({});
  const dataRef = useRef(editor.data);
  dataRef.current = editor.data;
  const lastCursor = useRef(0);
  const socket = getSocket(token);

  useEffect(() => {
    let alive = true;
    emitAck(socket, 'collab:join', { code })
      .then((r) => {
        if (!alive) return;
        if (r.error) {
          toast(t(`errors.${r.error}`, { defaultValue: t('errors.server_error') }), 'error');
          return navigate('/together');
        }
        setRoom(r.room);
        setPicture(r.picture);
        editor.reset(r.data);
      })
      .catch(() => navigate('/together'));
    const onRoom = (r) => setRoom(r);
    const onOp = (op) => {
      const a = opToAction(op, dataRef.current);
      if (a) editor.remote(a);
    };
    const onState = (data) => editor.reset(data);
    const onCursor = (c) => setCursors((m) => ({ ...m, [c.userId]: { ...c, at: Date.now() } }));
    const onSaved = (e) => {
      toast(t('together.saved', { name: e.by.nickname }), 'success');
      pushEvents(e.events);
    };
    const onDeclined = (e) => toast(t('together.inviteDeclined', { name: e.by.nickname }), 'info');
    socket.on('collab:invite-declined', onDeclined);
    socket.on('collab:room', onRoom);
    socket.on('collab:op', onOp);
    socket.on('collab:state', onState);
    socket.on('collab:cursor', onCursor);
    socket.on('collab:saved', onSaved);
    return () => {
      alive = false;
      socket.off('collab:invite-declined', onDeclined);
      socket.off('collab:room', onRoom);
      socket.off('collab:op', onOp);
      socket.off('collab:state', onState);
      socket.off('collab:cursor', onCursor);
      socket.off('collab:saved', onSaved);
      socket.emit('collab:leave');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, socket]);

  // Ẩn con trỏ của bạn đã ngừng di chuyển.
  useEffect(() => {
    const id = setInterval(() => setCursors((m) => Object.fromEntries(Object.entries(m).filter(([, c]) => Date.now() - c.at < 4000))), 1000);
    return () => clearInterval(id);
  }, []);

  const onAction = useCallback(
    (a) => {
      if (a.type === 'fill') {
        socket.emit('collab:op', { type: 'fill', regionId: a.regionId, color: a.color });
        if (a.glitter) socket.emit('collab:op', { type: 'glitter', regionId: a.regionId, on: true });
      } else if (a.type === 'stroke') socket.emit('collab:op', { type: 'stroke', stroke: a.stroke, ...(a.fill ? { fill: a.fill } : {}) });
      else if (a.type === 'sticker-add') socket.emit('collab:op', { type: 'sticker', sticker: a.sticker });
      else if (a.type === 'sticker-update') socket.emit('collab:op', { type: 'sticker-update', index: a.index, sticker: a.sticker });
      else if (a.type === 'sticker-remove') socket.emit('collab:op', { type: 'sticker-remove', index: a.index });
      else if (a.type === 'clear') socket.emit('collab:op', { type: 'clear' });
    },
    [socket],
  );

  const onCursor = useCallback(
    (x, y) => {
      const n = Date.now();
      if (n - lastCursor.current < 80) return;
      lastCursor.current = n;
      socket.volatile.emit('collab:cursor', { x, y });
    },
    [socket],
  );

  const save = async () => {
    const thumbnail = await renderThumbnail(picture, dataRef.current).catch(() => null);
    const r = await emitAck(socket, 'collab:save', { thumbnail }).catch(() => ({ error: 'network_error' }));
    if (r.error) toast(t(`errors.${r.error}`, { defaultValue: t('errors.server_error') }), 'error');
  };

  if (!room || !picture) return <div className="page text-muted">{t('common.loading')}</div>;
  const remoteCursors = Object.values(cursors).map((c) => ({ ...c, name: room.players.find((p) => p.id === c.userId)?.nickname || '' }));

  return (
    <div className="cw-page">
      <ColoringWorkspace
        picture={picture}
        editor={editor}
        mode="free"
        brushSkin={user.brushSkin}
        userKey={String(user.id)}
        onAction={onAction}
        onUndo={() => socket.emit('collab:undo')}
        onRedo={() => {}}
        remoteCursors={remoteCursors}
        onCursor={onCursor}
        header={
          <div className="mb-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="flex-1 whitespace-nowrap font-display text-2xl font-extrabold">{t('together.room')}</h1>
              <span className="rounded-2xl bg-primary-light px-3 py-1 font-mono text-2xl font-extrabold tracking-widest text-primary-dark" data-testid="together-room-code">{room.code}</span>
              <button type="button" className="btn-ghost min-h-11 px-3" onClick={() => navigator.clipboard?.writeText(room.code).then(() => toast(t('common.copied'), 'success'))} aria-label={t('common.copy')}>
                <Icon name="copy" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {room.players.map((p) => (
                <span key={p.id} className="flex items-center gap-1 rounded-full py-1 pl-1 pr-3 text-sm font-bold" style={{ background: `${p.color}22`, color: p.color }}>
                  <Avatar avatar={p.avatar} frame={p.avatarFrame} size={32} /> {p.nickname}
                </span>
              ))}
              <span className="text-sm text-muted">{t('together.count', { n: room.players.length, max: room.maxPlayers })}</span>
            </div>
            <FriendInvite socket={socket} room={room} />
          </div>
        }
        actions={
          <>
            <button type="button" className="btn-ghost" onClick={() => navigate('/together')}>{t('arena.leave')}</button>
            <button type="button" className="btn-coral" onClick={save} data-testid="together-save">
              <Icon name="save" /> {t('together.save')}
            </button>
          </>
        }
      />
    </div>
  );
}
