// Xem cuốn truyện: lật trang, tải PDF, chia sẻ link, hoàn thành.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';
import { useUi } from '../../store/ui';
import { errorText } from '../../lib/format';
import { safeFileName } from '../../lib/exportImage';
import FlipbookViewer, { StoryBackdrop } from '../../components/FlipbookViewer/FlipbookViewer';
import Icon from '../../components/Icon';

export default function StorybookView() {
  const { id } = useParams();
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);
  const toast = useUi((s) => s.toast);
  const pushEvents = useUi((s) => s.pushEvents);
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  useEffect(() => {
    api.get(`/storybooks/${id}`).then((r) => setBook(r.storybook));
  }, [id]);
  // Quay lại đúng màn hình trước đó (không đi vòng qua trang danh sách truyện nên không chạy lại hiệu ứng mở truyện).
  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/storybooks');
  };
  if (!book) return <div className="page text-muted">{t('common.loading')}</div>;

  const run = (fn) => async () => {
    try {
      await fn();
    } catch (e) {
      toast(errorText(t, e), 'error');
    }
  };
  const pdf = run(async () => {
    const blob = await api.blob(`/storybooks/${id}/pdf`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeFileName(book.title)}.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  });
  const share = run(async () => {
    const r = await api.post(`/storybooks/${id}/share`, {});
    setBook({ ...book, shareToken: r.shareToken });
    const link = `${window.location.origin}/shared/${r.shareToken}`;
    if (navigator.share) await navigator.share({ title: book.title, url: link }).catch(() => {});
    else await navigator.clipboard?.writeText(link);
    toast(t('storybook.linkCopied'), 'success');
  });
  const complete = run(async () => {
    const r = await api.post(`/storybooks/${id}/complete`);
    setBook(r.storybook);
    pushEvents(r.events);
  });
  const remove = run(async () => {
    await api.del(`/storybooks/${id}`);
    navigate('/storybooks');
  });

  return (
    <StoryBackdrop>
      <button type="button" onClick={goBack} className="sbv-back" data-testid="view-back">
        <Icon name="back" size={20} strokeWidth={3} /> {t('common.back')}
      </button>
      <FlipbookViewer title={book.title} author={user.nickname} pages={book.pages} coverStyle={book.coverStyle} />
      <div className="sbv-actions">
        {!book.completed && (
          <button type="button" className="btn-coral" onClick={complete} disabled={book.pages.length < 2} data-testid="storybook-complete">
            <Icon name="check" /> {t('storybook.complete')}
          </button>
        )}
        <button type="button" className="btn-primary" onClick={pdf} data-testid="storybook-pdf">
          <Icon name="download" /> PDF
        </button>
        <button type="button" className="btn-ghost" onClick={share}>
          <Icon name="share" /> {t('storybook.share')}
        </button>
        <Link to={`/storybooks/${id}/edit`} className="btn-ghost">
          <Icon name="edit" /> {t('storybook.edit')}
        </Link>
        <button type="button" className="btn-ghost text-danger" onClick={remove} aria-label={t('common.delete')}>
          <Icon name="trash" />
        </button>
      </div>
      {book.pages.length < 2 && !book.completed && <p className="sbv-note">{t('storybook.needTwo')}</p>}
      {book.shareToken && (
        <p className="sbv-note max-w-full truncate">
          {t('storybook.shareLink')}: {`${window.location.origin}/shared/${book.shareToken}`}
        </p>
      )}
    </StoryBackdrop>
  );
}
