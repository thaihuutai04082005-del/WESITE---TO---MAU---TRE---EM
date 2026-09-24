// Thẻ lựa chọn ở 3 tầng: luôn kèm tranh minh hoạ thật.
import { Link } from 'react-router-dom';
import PictureView from '../PictureView/PictureView';

export default function ThemeCard({ to, onClick, picture, title, subtitle, badge, testId }) {
  const body = (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-primary-light">
        {picture ? <PictureView picture={picture} title={title} /> : <div className="aspect-square" />}
        {badge && <span className="absolute left-2 top-2">{badge}</span>}
      </div>
      <div className="px-1 pb-1 pt-2">
        <div className="font-display text-xl font-bold leading-tight">{title}</div>
        {subtitle && <div className="text-sm text-muted">{subtitle}</div>}
      </div>
    </>
  );
  const cls = 'card block p-2 text-left transition hover:-translate-y-1 hover:shadow-pop active:scale-95';
  return to ? (
    <Link to={to} className={cls} data-testid={testId}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={`${cls} w-full`} data-testid={testId}>
      {body}
    </button>
  );
}
