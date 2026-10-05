import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@hooks/useLanguage';
import { cx } from '@lib/cx';

type GameFrameProps = {
  /** Null until the page decides to load the game (see useEarlyLoad). */
  src: string | null;
  title: string;
  /** Shown while the game loads. */
  poster?: string;
  /** Size the game is laid out at; the frame scales it down to fit. */
  width: number;
  height: number;
  device: 'desktop' | 'phone';
};

/**
 * A real build of the game in an iframe, scaled so it keeps its native layout at any width.
 * The page starts it early (useEarlyLoad), so it is already in play when the visitor arrives.
 */
export default function GameFrame({ src, title, poster, width, height, device }: GameFrameProps) {
  const { strings } = useLanguage();
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const element = box.current;
    if (!element) {
      return undefined;
    }
    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [width]);

  return (
    <figure className="min-w-0">
      <div
        className={cx(
          'overflow-hidden bg-[#050506] shadow-2xl shadow-black/50 ring-1 ring-line-strong',
          device === 'phone' ? 'rounded-[2.2rem] p-2.5' : 'rounded-xl'
        )}
      >
        {device === 'desktop' && (
          <div
            className="flex items-center gap-1.5 border-b border-line bg-surface-2 px-3 py-2"
            aria-hidden
          >
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
        )}
        <div
          ref={box}
          className={cx('relative overflow-hidden', device === 'phone' && 'rounded-[1.7rem]')}
          style={{ aspectRatio: `${width} / ${height}` }}
        >
          {poster && !loaded && (
            <Image
              src={poster}
              alt=""
              fill
              sizes={device === 'phone' ? '300px' : '(min-width: 1024px) 760px, 100vw'}
              className="object-cover opacity-60"
            />
          )}
          {src && (
            // onLoad only hides the poster; the iframe itself takes the input.
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
            <iframe
              src={src}
              title={title}
              onLoad={() => setLoaded(true)}
              className={cx(
                'absolute left-0 top-0 origin-top-left border-0 transition-opacity duration-500',
                loaded ? 'opacity-100' : 'opacity-0'
              )}
              style={{ width, height, transform: `scale(${scale})` }}
            />
          )}
          {!loaded && (
            <p className="absolute inset-0 grid place-items-center font-mono text-xs text-muted">
              {strings.sideProjects.loadingGame}
            </p>
          )}
        </div>
      </div>
      <figcaption className="mt-3 font-mono text-[11px] text-faint">{title}</figcaption>
    </figure>
  );
}
