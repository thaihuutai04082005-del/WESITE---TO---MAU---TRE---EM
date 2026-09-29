// Thẻ chủ đề ở trang "Chọn chủ đề": ảnh bìa ngang (cắt từ tranh đầu tiên), tên chủ đề, số đối tượng và nút mũi tên.
import { Link } from 'react-router-dom';
import PictureView from '../PictureView/PictureView';
import Icon from '../Icon';

export default function ThemeTile({ to, picture, title, subtitle, testId }) {
  return (
    <Link
      to={to}
      data-testid={testId}
      className="group flex flex-col rounded-[22px] border border-[#E3F0FA] bg-white p-3 shadow-[0_6px_18px_rgba(43,155,244,0.10)] transition hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(43,155,244,0.18)] active:scale-[0.98]"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-primary-light">
        {picture && (
          <div className="absolute inset-x-0 top-[-5%]">
            <PictureView picture={picture} title={title} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col px-1 pt-3">
        <div className="font-display text-[17px] font-extrabold leading-snug text-[#17365D] md:text-lg">{title}</div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="flex items-center gap-1 whitespace-nowrap text-xs text-muted sm:gap-1.5 sm:text-sm">
            <Icon name="user" size={15} /> {subtitle}
          </span>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-light text-primary-dark transition group-hover:bg-primary group-hover:text-white">
            <Icon name="chevronRight" size={18} />
          </span>
        </div>
      </div>
    </Link>
  );
}
