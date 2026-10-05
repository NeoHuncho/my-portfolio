import { useId } from 'react';
import { boardCompany } from '@config/board';
import { cx } from '@lib/cx';

/**
 * The demo's mark: three board columns cut out of a rounded tile, so the board reads as a
 * demo at a glance rather than a real company.
 */
function CompanyMark({ className }: { className?: string }) {
  const id = useId();
  const fill = `${id}-fill`;
  const cut = `${id}-cut`;
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id={fill} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#bef264" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
        {/* The columns are cut out of the tile, so the mark sits on any background. */}
        <mask id={cut} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
          <rect width="32" height="32" fill="#fff" />
          <rect x="8" y="9.5" width="4" height="13" rx="2" fill="#000" />
          <rect x="14" y="9.5" width="4" height="8.5" rx="2" fill="#000" />
          <rect x="20" y="9.5" width="4" height="11" rx="2" fill="#000" />
        </mask>
      </defs>
      <rect
        x="4"
        y="4"
        width="24"
        height="24"
        rx="7"
        fill={`url(#${fill})`}
        mask={`url(#${cut})`}
      />
    </svg>
  );
}

/** Mark and wordmark, as they sit in the board header. */
export default function CompanyLogo({ className }: { className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2', className)}>
      <CompanyMark className="size-6" />
      <span className="text-[15px] font-semibold tracking-[-0.035em] text-ink">
        {boardCompany.name}
      </span>
    </span>
  );
}
