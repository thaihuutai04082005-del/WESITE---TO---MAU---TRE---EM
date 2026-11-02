// Phòng thi: phòng chờ (10 thí sinh, đếm ngược) → thi đấu (canvas + đồng hồ) → kết quả (rubric, Top 3, phần thưởng).
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSocket, emitAck } from '../../services/socket';
import { useAuth } from '../../store/auth';
import { useUi } from '../../store/ui';
import { useArtworkEditor } from '../../hooks/useArtworkEditor';
import { renderThumbnail } from '../../lib/exportImage';
import { progressOf } from '../../lib/picture';
import ColoringWorkspace from '../../components/ColoringWorkspace';
import CountdownTimer from '../../components/CountdownTimer/CountdownTimer';
import Leaderboard from '../../components/Leaderboard/Leaderboard';
import Avatar from '../../components/Avatar/Avatar';
import Confetti from '../../components/Confetti';
import Icon from '../../components/Icon';
import WaitingScene, { PaletteBrush } from '../../components/WaitingScene';

const SNAPSHOT_MS = 8000;

export default function ArenaRoom() {
  const { t } = useTranslation();
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  const refresh = useAuth((s) => s.refresh);
  const toast = useUi((s) => s.toast);
  const pushEvents = useUi((s) => s.pushEvents);
  const navigate = useNavigate();
  const editor = useArtworkEditor();
  const [room, setRoom] = useState(null);
  const [picture, setPicture] = useState(null);
  const [results, setResults] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [now, setNow] = useState(Date.now());
  const offset = useRef(0);
  const dataRef = useRef(editor.data);
  dataRef.current = editor.data;
  const socket = getSocket(token);

  const applyRoom = useCallback((r) => {
    if (!r) return;
    offset.current = r.serverNow - Date.now();
    setRoom(r);
  }, []);

  useEffect(() => {
    const onRoom = (r) => applyRoom(r);
    const onStart = (r) => {
      applyRoom(r);
      setPicture(r.picture);
      editor.reset(null);
    };
    const onResults = (r) => {
      setResults(r);
      refresh().catch(() => {});
    };
    socket.on('arena:room', onRoom);
    socket.on('arena:start', onStart);
    socket.on('arena:results', onResults);
    emitAck(socket, 'arena:state')
      .then((r) => {
        if (!r?.room) return navigate('/arena');
        applyRoom(r.room);
        if (r.picture) setPicture(r.picture);
        if (r.myData) editor.reset(r.myData);
        if (r.room.players.find((p) => p.id === user.id)?.submitted) setSubmitted(true);
      })
      .catch(() => navigate('/arena'));
    return () => {
      socket.off('arena:room', onRoom);
      socket.off('arena:start', onStart);
      socket.off('arena:results', onResults);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  // Đồng hồ nội bộ cho giai đoạn đếm ngược bắt đầu.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const playing = room?.status === 'playing' && picture && !results;
  const started = playing && now + offset.current >= room.startedAt;

  // Tự gửi bản nháp định kỳ — hết giờ chưa nộp vẫn được chấm theo bản gần nhất.
  useEffect(() => {
    if (!started || submitted) return;
    const id = setInterval(() => socket.emit('arena:snapshot', { data: dataRef.current }), SNAPSHOT_MS);
    return () => clearInterval(id);
  }, [started, submitted, socket]);

  const submit = useCallback(async () => {
    if (submitted || !picture) return;
    setSubmitted(true);
    let thumbnail = null;
    try {
      thumbnail = await renderThumbnail(picture, dataRef.current);
    } catch {
      /* vẫn nộp dù ảnh thu nhỏ lỗi */
    }
    const r = await emitAck(socket, 'arena:submit', { data: dataRef.current, thumbnail }).catch(() => ({ error: 'network_error' }));
    if (r?.error && r.error !== 'already_submitted') {
      toast(t(`errors.${r.error}`, { defaultValue: t('errors.server_error') }), 'error');
      if (r.error !== 'time_up') setSubmitted(false);
    }
  }, [submitted, picture, socket, toast, t]);

  const leave = async () => {
    await emitAck(socket, 'arena:leave').catch(() => {});
    navigate('/arena');
  };

  if (results) {
    const mine = results.board.find((b) => b.user?.id === user.id);
    return (
      <div className="page space-y-4">
        {mine?.place && mine.place <= 3 && <Confetti count={90} />}
        <h1 className="page-title text-center">{t('arena.results')}</h1>
        {mine && (
          <p className="text-center text-lg font-bold">
            {mine.place ? t('arena.yourPlace', { place: mine.place }) : mine.flagged ? t(`arena.flag.${mine.flagReason}`) : t('arena.noPlace')}
            {mine.reward > 0 && ` · +${mine.reward} ${t('arena.points')}`}
          </p>
        )}
        <Leaderboard board={results.board} meId={user.id} />
        <div className="flex justify-center gap-2">
          <Link to="/arena" className="btn-primary" onClick={() => pushEvents(results.events)} data-testid="arena-back">
            {t('arena.backToLobby')}
          </Link>
        </div>
      </div>
    );
  }

  if (!room) return <div className="page text-muted">{t('common.loading')}</div>;

  if (room.status === 'waiting') {
    const isHost = room.hostId === user.id;
    return (
      <div className="wr-stage">
        <div className="page wr-page">
          <div className="wr-top">
            <div className="wr-banner">
              <PaletteBrush />
              <h1 className="wr-title">{room.type === 'private' ? t('arena.privateRoom') : t('arena.waitingRoom')}</h1>
            </div>
            <button type="button" className="wr-leave" onClick={leave}>
              <Icon name="logout" size={22} /> {t('arena.leave')}
            </button>
          </div>
          <section className="wr-card">
            <WaitingScene />
            <div className="wr-stats">
              <div className="wr-pill">
                <Icon name="users" size={24} className="text-[#F5963A]" />
                <span>{t('arena.players', { n: room.players.length, max: room.maxPlayers })}</span>
              </div>
              {room.type === 'random' && room.lobbyDeadline && (
                <div className="wr-pill">
                  <Icon name="clock" size={24} className="text-[#F5963A]" />
                  <span>{t('arena.startsIn')}</span>
                  <CountdownTimer endsAt={room.lobbyDeadline} offset={offset.current} warnAt={0} className="wr-count" />
                </div>
              )}
            </div>
            {room.type === 'private' && (
              <div className="wr-code">
                <span className="font-bold">{t('arena.shareCode')}</span>
                <span className="wr-code-val" data-testid="arena-room-code">{room.code}</span>
                <span className="text-sm text-muted">{t('arena.friendsOnly')}</span>
              </div>
            )}
            <div className="wr-grid">
              {Array.from({ length: room.maxPlayers }, (_, i) => room.players[i]).map((p, i) => (
                <div key={p?.id ?? `empty-${i}`} className={`wr-slot ${p ? 'wr-slot-on' : ''}`}>
                  {p ? (
                    <>
                      {p.id === room.hostId && <svg viewBox="0 0 40 34" className="wr-crown" aria-hidden="true"><path d="M5 28 2 10l10 8 8-14 8 14 10-8-3 18z" fill="#FFD23F" stroke="#E8A317" strokeWidth="3" strokeLinejoin="round" /><circle cx="20" cy="22" r="2.6" fill="#FF6B6B" /></svg>}
                      <Avatar avatar={p.avatar} frame={p.avatarFrame} vip={p.vip} size={58} />
                      <span className="wr-name">{p.nickname}</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 48 48" className="wr-ghost" aria-hidden="true">
                        <circle cx="24" cy="16" r="9" fill="none" stroke="#F5A860" strokeWidth="3" />
                        <path d="M7 42c1-10 8-15 17-15s16 5 17 15z" fill="none" stroke="#F5A860" strokeWidth="3" strokeLinejoin="round" />
                      </svg>
                      <span className="wr-dots">…</span>
                    </>
                  )}
                </div>
              ))}
            </div>
            {room.type === 'random' && room.players.length < room.minPlayers && (
              <p className="wr-note"><span className="wr-info" aria-hidden="true">i</span> {t('arena.needMore', { n: room.minPlayers })}</p>
            )}
            {isHost && room.type === 'private' && (
              <button type="button" className="btn-coral w-full" disabled={room.players.length < room.minPlayers} onClick={() => emitAck(socket, 'arena:start').then((r) => r?.error && toast(t(`errors.${r.error}`), 'error'))} data-testid="arena-start">
                <Icon name="play" /> {t('arena.startNow')}
              </button>
            )}
          </section>
        </div>
      </div>
    );
  }

  if (playing && !started) {
    return (
      <div className="page flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="font-display text-2xl font-bold">{t('arena.getReady')}</p>
        <div className="font-display text-8xl font-extrabold text-primary">{Math.max(1, Math.ceil((room.startedAt - (now + offset.current)) / 1000))}</div>
      </div>
    );
  }

  if (playing) {
    const doneCount = room.players.filter((p) => p.submitted).length;
    return (
      <div className="cw-page">
        <ColoringWorkspace
          picture={picture}
          editor={editor}
          mode="free"
          brushSkin={user.brushSkin}
          userKey={String(user.id)}
          readOnly={submitted}
          onAction={() => socket.emit('arena:action')}
          header={
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <div className="flex-1">
                <h1 className="font-display text-2xl font-extrabold">{t('arena.title')}</h1>
                <div className="text-sm font-bold text-muted">
                  {t('arena.submittedCount', { n: doneCount, total: room.players.length })} · {Math.round(progressOf(picture, editor.data.fills) * 100)}%
                </div>
              </div>
              <CountdownTimer endsAt={room.endsAt} offset={offset.current} onEnd={submit} className="text-4xl" />
            </div>
          }
          actions={
            submitted ? (
              <div className="card p-3 text-center font-bold" data-testid="arena-submitted">{t('arena.waitingOthers')}</div>
            ) : (
              <button type="button" className="btn-coral" onClick={submit} data-testid="arena-submit">
                <Icon name="check" /> {t('arena.submit')}
              </button>
            )
          }
        />
      </div>
    );
  }

  return <div className="page text-center text-muted">{t('arena.scoring')}</div>;
}
