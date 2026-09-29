// Thẻ chủ đề ở trang "Chọn chủ đề": ảnh bìa vuông đủ cả tranh, tên chủ đề (1 hàng), số đối tượng và nút mũi tên.
import { Link } from 'react-router-dom';
import PictureView from '../PictureView/PictureView';
import Icon from '../Icon';

export default function ThemeTile({ to, picture, title, subtitle, testId }) {
  return (
    <Link
      to={to}
      data-testid={testId}
      className="group flex flex-col rounded-[22px] border border-[#E3F0FA] bg-white p-2 shadow-[0_6px_18px_rgba(43,155,244,0.10)] transition hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(43,155,244,0.18)] active:scale-[0.98] sm:p-3"
    >
      <div className="overflow-hidden rounded-2xl bg-primary-light">
        {picture ? <PictureView picture={picture} title={title} /> : <div className="aspect-square" />}
      </div>
      <div className="flex flex-1 flex-col px-0.5 pt-2 sm:px-1 sm:pt-3">
        <div data-one-line className="overflow-hidden whitespace-nowrap font-display tracking-tight sm:tracking-normal text-[17px] font-extrabold leading-snug text-[#17365D] md:text-lg" title={title}>
          {title}
        </div>
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
