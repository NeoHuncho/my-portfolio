import type { CSSProperties } from 'react';
import { FiCalendar } from 'react-icons/fi';
import { cx } from '@lib/cx';
import { type Copy, findIntention, formatDue, type Locale, type Task } from './data';

export const MIC_COLOR = '#5b9cff';
export const DONE_COLOR = '#4ade9f';

export const PRIORITY_COLOR = { urgent: '#ff6b6b', high: '#f5b84a' } as const;

/** Resting bar heights, so the wave still reads as a voice when motion is off. */
const BARS = [0.35, 0.6, 0.9, 0.55, 1, 0.7, 0.45, 0.8, 0.5, 0.95, 0.65, 0.4, 0.75, 0.55, 0.3];

/** Voice level bars: animated while `active`, flat and dim otherwise. */
export function Waveform({
  active,
  color,
  bars = BARS.length,
  className,
}: {
  active: boolean;
  color: string;
  bars?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cx('flex items-center justify-center gap-[3px]', active && 'pomi-wave', className)}
    >
      {BARS.slice(0, bars).map((height, index) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="pomi-motion w-[3px] rounded-full transition-[height,opacity] duration-300"
          style={
            {
              height: active ? `${height * 100}%` : '12%',
              opacity: active ? 1 : 0.35,
              background: color,
              animationDelay: `${-index * 110}ms`,
              animationDuration: `${760 + ((index * 173) % 420)}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Tag, due date and priority of a task, as small chips. */
export function TaskMeta({
  task,
  copy,
  locale,
  className,
}: {
  task: Omit<Task, 'id' | 'done'>;
  copy: Copy;
  locale: Locale;
  className?: string;
}) {
  const intention = findIntention(task.intention);
  const due = formatDue(task.due, copy);
  return (
    <div className={cx('flex min-w-0 flex-wrap items-center gap-1', className)}>
      {intention && (
        <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-1.5 py-px">
          <span aria-hidden="true">{intention.emoji}</span>
          {intention.name[locale]}
        </span>
      )}
      {due && (
        <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-1.5 py-px">
          <FiCalendar aria-hidden="true" className="size-[0.9em]" />
          {due}
        </span>
      )}
      {task.priority && (
        <span
          className="inline-flex items-center gap-1 rounded-full px-1.5 py-px"
          style={{
            color: PRIORITY_COLOR[task.priority],
            background: `color-mix(in srgb, ${PRIORITY_COLOR[task.priority]} 14%, transparent)`,
          }}
        >
          <span
            aria-hidden="true"
            className="size-[0.5em] rounded-full"
            style={{ background: 'currentColor' }}
          />
          {copy.priorities[task.priority]}
        </span>
      )}
    </div>
  );
}
