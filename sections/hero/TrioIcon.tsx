import { FiMoon, FiSun } from 'react-icons/fi';
import { cx } from '@lib/cx';
import { CLAUDE_PATH } from './brandMarks';
import { type TrioId } from './playground/items';

/** How I work's marks, from day to night: the sun, my agents (Claude's star), the moon. */
export default function TrioIcon({ id, className }: { id: TrioId; className?: string }) {
  if (id === 'ticket') {
    return <FiSun aria-hidden className={cx('size-3.5', className)} />;
  }
  if (id === 'night') {
    return <FiMoon aria-hidden className={cx('size-3.5', className)} />;
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cx('size-3.5', className)}>
      <path fill="currentColor" d={CLAUDE_PATH} />
    </svg>
  );
}
