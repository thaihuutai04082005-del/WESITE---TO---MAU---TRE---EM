// Tủ kính thành tích của một bạn (bạn bè bấm từ danh sách bạn bè).
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/auth';
import { Showcase } from '../../components/Share';
import Icon from '../../components/Icon';

export default function ShowcasePage() {
  const { userId } = useParams();
  const { t } = useTranslation();
  const me = useAuth((s) => s.user);
  return (
    <div className="page space-y-4">
      <Link to="/friends" className="btn-ghost min-h-11 px-3" aria-label={t('common.back')}>
        <Icon name="back" />
      </Link>
      <Showcase userId={Number(userId)} own={Number(userId) === me?.id} withOwner />
    </div>
  );
}
