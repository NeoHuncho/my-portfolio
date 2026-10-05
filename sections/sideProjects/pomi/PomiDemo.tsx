import { useLayoutEffect, useRef, useState } from 'react';
import { cx } from '@lib/cx';
import { COPY, type Copy, type Locale } from './data';
import PomiApp, { PHONE_HEIGHT, PHONE_WIDTH } from './PomiApp';
import PomiDesktop, { DESKTOP_LID_LEFT, DESKTOP_SCREEN_MIDDLE, DESKTOP_WIDTH } from './PomiDesktop';
import PomiWatch, {
  WATCH_CASE_CENTER,
  WATCH_CASE_MIDDLE,
  WATCH_HEIGHT,
  WATCH_WIDTH,
} from './PomiWatch';
import { type DemoState, type Source, usePomiDemo } from './usePomiDemo';

/** Container widths where the laptop joins, and below which the phone shows on its own. */
const WIDE_FROM = 600;
const SOLO_BELOW = 420;

const GAP = 28;
const COLUMN_LEFT = PHONE_WIDTH + GAP;
const WIDE_WATCH_TOP = PHONE_HEIGHT - WATCH_HEIGHT;
const WIDE_WATCH_LEFT = COLUMN_LEFT + DESKTOP_WIDTH / 2 - WATCH_CASE_CENTER;

const ROW_GAP = 40;
const ROW_WATCH_TOP = 84;

type Point = { left: number; top: number };

type Layout = {
  width: number;
  height: number;
  phone: Point;
  watch?: Point;
  desktop?: Point;
  /** Link lines in stage coordinates, from the phone to each other device. */
  links: Array<{ to: Source; path: string }>;
};

const LAYOUTS: Record<'wide' | 'row' | 'solo', Layout> = {
  wide: {
    width: COLUMN_LEFT + DESKTOP_WIDTH,
    height: PHONE_HEIGHT,
    phone: { left: 0, top: 0 },
    desktop: { left: COLUMN_LEFT, top: 0 },
    watch: { left: WIDE_WATCH_LEFT, top: WIDE_WATCH_TOP },
    links: [
      {
        to: 'desktop',
        path: `M${PHONE_WIDTH} ${DESKTOP_SCREEN_MIDDLE} H${COLUMN_LEFT + DESKTOP_LID_LEFT}`,
      },
      {
        to: 'watch',
        path: `M${PHONE_WIDTH} ${WIDE_WATCH_TOP + WATCH_CASE_MIDDLE} H${WIDE_WATCH_LEFT}`,
      },
    ],
  },
  row: {
    width: PHONE_WIDTH + ROW_GAP + WATCH_WIDTH,
    height: PHONE_HEIGHT,
    phone: { left: 0, top: 0 },
    watch: { left: PHONE_WIDTH + ROW_GAP, top: ROW_WATCH_TOP },
    links: [
      { to: 'watch', path: `M${PHONE_WIDTH} ${ROW_WATCH_TOP + WATCH_CASE_MIDDLE} h${ROW_GAP}` },
    ],
  },
  // Phones: the phone app alone. Under it, the watch would double the demo's height.
  solo: {
    width: PHONE_WIDTH,
    height: PHONE_HEIGHT,
    phone: { left: 0, top: 0 },
    links: [],
  },
};

const STYLES = `
@keyframes pomi-pop { 0%, 100% { transform: scale(1); } 55% { transform: scale(1.18); } }
@keyframes pomi-picked { 0% { transform: scale(0.94); } 65% { transform: scale(1.03); } 100% { transform: scale(1); } }
@keyframes pomi-fade-scale { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: none; } }
@keyframes pomi-travel { from { stroke-dashoffset: 8; } to { stroke-dashoffset: -100; } }
@keyframes pomi-wave { 0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
@keyframes pomi-ripple { from { transform: scale(1); opacity: 0.45; } to { transform: scale(1.9); opacity: 0; } }
@keyframes pomi-halo { 0%, 100% { opacity: 0.25; transform: scale(0.96); } 50% { opacity: 0.6; transform: scale(1.04); } }
@keyframes pomi-spin { to { transform: rotate(360deg); } }
@keyframes pomi-shimmer { 0%, 100% { opacity: 0.45; } 50% { opacity: 1; } }
@keyframes pomi-fresh { from { background-color: rgb(91 156 255 / 0.2); } to { background-color: transparent; } }
@keyframes pomi-card-in { from { opacity: 0; transform: translateY(8px) scale(0.97); } to { opacity: 1; transform: none; } }
.pomi-pop { animation: pomi-pop 280ms ease-out both; }
.pomi-picked { animation: pomi-picked 240ms ease-out; }
.pomi-fade-scale { animation: pomi-fade-scale 180ms ease-out both; }
.pomi-travel { animation: pomi-travel 900ms cubic-bezier(0.4, 0, 0.2, 1) both; }
.pomi-travel-reverse { animation-direction: reverse; }
.pomi-wave > span { animation-name: pomi-wave; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
.pomi-ripple { background: #5b9cff; animation: pomi-ripple 1.2s ease-out infinite; }
.pomi-halo { border: 1.5px solid #5b9cff; animation: pomi-halo 2.4s ease-in-out infinite; }
.pomi-spin { animation: pomi-spin 0.8s linear infinite; }
.pomi-shimmer, .pomi-shimmer-text { animation: pomi-shimmer 1.1s ease-in-out infinite; }
.pomi-fresh { animation: pomi-fresh 2.4s ease-out both; }
.pomi-card-in { animation: pomi-card-in 320ms cubic-bezier(0.22, 1, 0.36, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .pomi-pop, .pomi-picked, .pomi-fade-scale, .pomi-wave > span, .pomi-ripple, .pomi-halo,
  .pomi-shimmer, .pomi-shimmer-text, .pomi-card-in { animation: none; }
  .pomi-spin { animation-duration: 2.4s; }
  .pomi-ripple { display: none; }
  .pomi-fresh { animation: none; background-color: rgb(91 156 255 / 0.12); }
  .pomi-travel { animation: none; visibility: hidden; }
  .pomi-motion { transition: none !important; }
}
`;

function announcement(state: DemoState, copy: Copy, locale: Locale): string {
  const { event } = state;
  if (!event) {
    return '';
  }
  const type = copy.types[event.type];
  switch (event.kind) {
    case 'start':
      return copy.announce.start(type);
    case 'pause':
      return copy.announce.pause;
    case 'reset':
      return copy.announce.reset;
    case 'skip':
      return copy.announce.next(copy.types[event.next]);
    case 'listen':
      return copy.announce.listen;
    case 'added':
      return copy.announce.added(event.title?.[locale] ?? '');
    default:
      return copy.announce.finish(type, copy.types[event.next]);
  }
}

/**
 * Interactive Pomi demo: the phone app, the Wear OS watch and the desktop app
 * share one reducer, so every action on one device shows up on the others.
 * Phones show the phone app only.
 */
export default function PomiDemo({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const rootRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = usePomiDemo(rootRef);
  const [width, setWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const element = rootRef.current;
    if (!element) {
      return undefined;
    }
    setWidth(element.clientWidth);
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  let mode: keyof typeof LAYOUTS = 'solo';
  if (width === null || width >= WIDE_FROM) {
    mode = 'wide';
  } else if (width >= SOLO_BELOW) {
    mode = 'row';
  }
  const layout = LAYOUTS[mode];
  const scale = width === null ? 1 : Math.min(1, width / layout.width);
  const { seq, source } = state.sync;

  return (
    <div
      ref={rootRef}
      className="relative w-full"
      style={{ height: layout.height * scale, opacity: width === null ? 0 : 1 }}
    >
      <style>{STYLES}</style>
      <div
        className="absolute left-1/2 top-0 origin-top"
        style={{
          width: layout.width,
          height: layout.height,
          transform: `translateX(-50%) scale(${scale})`,
        }}
      >
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-visible"
          width={layout.width}
          height={layout.height}
        >
          {layout.links.map((link) => (
            <g key={link.to}>
              <path
                d={link.path}
                fill="none"
                stroke="rgb(255 255 255 / 0.16)"
                strokeWidth="1.5"
                strokeDasharray="3 5"
                strokeLinecap="round"
              />
              {seq > 0 && (
                <path
                  key={seq}
                  d={link.path}
                  pathLength={100}
                  fill="none"
                  stroke="var(--color-ok)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="8 200"
                  className={cx('pomi-travel', source === link.to && 'pomi-travel-reverse')}
                />
              )}
            </g>
          ))}
        </svg>

        <div className="absolute" style={layout.phone}>
          <PomiApp state={state} dispatch={dispatch} copy={copy} locale={locale} />
        </div>

        {layout.watch && (
          <div className="absolute" style={layout.watch}>
            <PomiWatch state={state} dispatch={dispatch} copy={copy} locale={locale} />
          </div>
        )}

        {layout.desktop && (
          <div className="absolute" style={layout.desktop}>
            <PomiDesktop state={state} dispatch={dispatch} copy={copy} locale={locale} />
          </div>
        )}
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {announcement(state, copy, locale)}
        {state.event && state.event.seq % 2 === 0 ? '​' : ''}
      </p>
    </div>
  );
}
