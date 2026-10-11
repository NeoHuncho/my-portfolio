import Image from 'next/image';
import { boardCompany } from '@config/board';
import { cx } from '@lib/cx';

/** Pomi's icon and name, as they sit in the board header: the radar this board replays. */
export default function CompanyLogo({ className }: { className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2', className)}>
      <Image src={boardCompany.logo} alt="" width={24} height={24} className="size-6 rounded-md" />
      <span className="text-[15px] font-semibold tracking-[-0.035em] text-ink">
        {boardCompany.name}
      </span>
    </span>
  );
}
