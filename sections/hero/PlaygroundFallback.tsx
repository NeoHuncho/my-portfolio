import Image from 'next/image';
import { cx } from '@lib/cx';
import { stillOf } from './phone/exhibitIds';
import { TRIO, type TrioId } from './playground/items';
import TrioIcon from './TrioIcon';

type PlaygroundFallbackProps = {
  steps: Record<TrioId, string>;
  headline: Record<TrioId, string>;
};

/**
 * Static stand-in for the 3D desk, without WebGL or when the visitor prefers
 * reduced motion: how I work, as the desk opens on it, from still renders of
 * each piece, left to right from day to night, each named underneath.
 */
export default function PlaygroundFallback({ steps, headline }: PlaygroundFallbackProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden lg:left-auto lg:w-[56%]">
      <ul className="grid w-full max-w-3xl grid-cols-3 items-start gap-2 px-4 sm:px-6">
        {TRIO.map((id) => (
          <li key={id} className={cx('flex flex-col items-center', id === 'agents' && 'mt-[12%]')}>
            {/* The stills are twice as wide as their piece: they reach under their neighbours. */}
            <span className="relative -mx-[30%] block aspect-[2/1] w-[160%]">
              <Image
                src={stillOf(id, 'stage')}
                alt=""
                fill
                sizes="(min-width: 1024px) 34vw, 52vw"
                className="object-contain"
              />
            </span>
            <span className="mt-1 flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
              <TrioIcon id={id} className={cx(id !== 'night' && 'text-accent')} />
              {steps[id]}
            </span>
            <span className="mt-0.5 text-center text-[15px] font-semibold tracking-tight">
              {headline[id]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
