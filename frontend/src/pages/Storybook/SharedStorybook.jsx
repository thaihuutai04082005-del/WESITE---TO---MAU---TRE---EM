// Xem công khai (chỉ đọc) qua link chia sẻ — dành cho ông bà, bố mẹ.
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import FlipbookViewer from '../../components/FlipbookViewer/FlipbookViewer';

export default function SharedStorybook() {
  const { token } = useParams();
  const { t } = useTranslation();
  const [book, setBook] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    api.get(`/storybooks/shared/${token}`).then((r) => setBook(r.storybook)).catch(() => setErr(true));
  }, [token]);
  if (err) return <div className="page text-center text-muted">{t('storybook.notFound')}</div>;
  if (!book) return <div className="page text-muted">{t('common.loading')}</div>;
  return (
    <div className="page space-y-4">
      <FlipbookViewer title={book.title} author={book.author} pages={book.pages} />
      <div className="text-center">
        <a href={`/api/storybooks/shared/${token}/pdf`} className="btn-primary">PDF</a>
      </div>
    </div>
  );
}
