// Tô màu cùng nhau (Mục 10.1): tạo phòng rồi chia sẻ mã, hoặc nhập mã bạn gửi. Không có danh sách phòng công khai.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSocket, emitAck } from '../../services/socket';
import { useAuth } from '../../store/auth';
import { useUi } from '../../store/ui';
import PicturePicker from '../../components/PicturePicker';
import Icon from '../../components/Icon';
import { TogetherArt } from '../../components/Illustrations';

function IconBubble({ name, bg, size = 52 }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-full text-white shadow-soft" style={{ width: size, height: size, background: bg }}>
      <Icon name={name} size={size * 0.55} strokeWidth={2.4} />
    </span>
  );
}

/** Bảng màu nhiều chấm màu — biểu tượng đầu trang. */
function PaletteBadge() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <path d="M32 6C17 6 6 16 6 29c0 12 10 21 22 21 3 0 5-2 5-5 0-2-1-3-1-5 0-2 2-4 4-4h6c8 0 16-5 16-14C58 13 46 6 32 6z" fill="#FFF3D6" stroke="#E6A817" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="19" cy="26" r="5" fill="#FF5F7E" />
      <circle cx="26" cy="15" r="5" fill="#FFC94D" />
      <circle cx="39" cy="14" r="5" fill="#4FA3E0" />
      <circle cx="48" cy="24" r="5" fill="#7D5FFF" />
      <circle cx="19" cy="38" r="5" fill="#4CD787" />
    </svg>
  );
}

export default function Together() {
  const { t } = useTranslation();
  const token = useAuth((s) => s.token);
  const toast = useUi((s) => s.toast);
  const navigate = useNavigate();
  const [picking, setPicking] = useState(false);
  const [code, setCode] = useState('');

  const create = async (picture) => {
    setPicking(false);
    const r = await emitAck(getSocket(token), 'collab:create', { pictureId: picture.id }).catch(() => ({ error: 'network_error' }));
    if (r.error) return toast(t(`errors.${r.error}`, { defaultValue: t('errors.server_error') }), 'error');
    navigate(`/together/${r.room.code}`);
  };

  return (
    <div className="page space-y-5">
      {/* Đầu trang */}
      <section className="flex items-center gap-3 sm:gap-5">
        <div className="h-20 w-20 shrink-0 sm:h-24 sm:w-24">
          <PaletteBadge />
        </div>
        <h1 className="min-w-0 flex-1 font-display text-3xl font-extrabold leading-tight text-[#16324F] sm:text-5xl">{t('together.title')}</h1>
        <div className="hidden h-32 w-48 shrink-0 sm:block">
          <TogetherArt />
        </div>
      </section>

      {/* 2 thẻ cùng một khung: đầu thẻ (biểu tượng + tên + nhãn) → hàng thao tác cao bằng nhau */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-[28px] bg-gradient-to-br from-[#E6F3FF] to-[#F4FAFF] p-5 shadow-soft">
          <div className="flex flex-wrap items-center gap-3">
            <IconBubble name="plus" bg="#2B9BF4" />
            <h2 className="flex-1 whitespace-nowrap font-display text-xl font-extrabold sm:text-2xl">{t('together.create')}</h2>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-bold text-primary-dark shadow-soft">
              <Icon name="users" size={14} /> {t('together.sizeChip')}
            </span>
          </div>
          <div className="flex min-h-[60px] items-center rounded-2xl bg-white/70 p-1.5">
            <button type="button" className="btn-primary w-full" onClick={() => setPicking(true)} data-testid="together-create">
              <Icon name="play" /> {t('together.pickPicture')}
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-[28px] bg-gradient-to-br from-[#F1EEFF] to-[#F9F8FF] p-5 shadow-soft">
          <div className="flex flex-wrap items-center gap-3">
            <IconBubble name="door" bg="#8B7CF6" />
            <h2 className="flex-1 whitespace-nowrap font-display text-xl font-extrabold sm:text-2xl">{t('together.join')}</h2>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-bold text-[#5B4FD6] shadow-soft">
              <Icon name="lock" size={14} /> {t('together.codeChip')}
            </span>
          </div>
          <form className="flex min-h-[60px] items-center gap-2 rounded-2xl bg-white/70 p-1.5" onSubmit={(e) => { e.preventDefault(); navigate(`/together/${code.trim().toUpperCase()}`); }}>
            <input className="input min-w-0 border-0 bg-white font-mono uppercase placeholder:font-sans placeholder:normal-case" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} required placeholder={t('arena.roomCode')} aria-label={t('arena.roomCode')} data-testid="together-code" />
            <button type="submit" className="btn-coral shrink-0 px-6" data-testid="together-join">{t('together.joinBtn')}</button>
          </form>
        </section>
      </div>

      {/* Lời nhắc an toàn */}
      <p className="flex items-center gap-3 rounded-[24px] bg-[#EEF6FD] px-4 py-3 text-sm font-semibold text-[#3D5A73]">
        <Icon name="shield" size={28} className="shrink-0 text-[#4F7FD9]" />
        <span className="flex-1">{t('together.safety')}</span>
        <span className="text-xl" aria-hidden="true">⭐</span>
      </p>
      {picking && <PicturePicker onPick={create} onClose={() => setPicking(false)} />}
    </div>
  );
}
