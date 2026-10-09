import { memo } from 'react';

/**
 * The "Fold" mark: a W folded from one strip, the orange showing inside the creases.
 * Keep the paths in sync with public/favicon.svg.
 */
function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="4 4 92 56" aria-hidden className={className}>
      {/* Shadow side of each crease, tucked under the planes so no seams show. */}
      <path
        className="fill-accent-deep"
        d="M20 16L22 16L31 31L39 16L50 9L54 20L33 58ZM59 16L67 31L78 16L80 18L67 58L57 18Z"
      />
      <path className="fill-accent" d="M31 31L39 16L50 9L38.43 41ZM67 31L78 16L72.09 37.5Z" />
      <path
        className="fill-ink"
        d="M4 4L22 16L33 56L33 60L19 54ZM33 60L33 56L50 9L59 16L67 56L67 60L50 36ZM78 16L96 4L81 54L67 60L67 56Z"
      />
    </svg>
  );
}

export default memo(LogoMark);
