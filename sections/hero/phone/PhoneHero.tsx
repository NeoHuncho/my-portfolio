import {
  createRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { FiArrowRight, FiMoon, FiSun } from 'react-icons/fi';
import { TbRotate360 } from 'react-icons/tb';
import { useInView } from 'react-intersection-observer';
import { sectionIds } from '@config/links';
import { useLanguage } from '@hooks/useLanguage';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@hooks/usePrefersReducedMotion';
import { cx } from '@lib/cx';
import { CLAUDE_PATH } from '../brandMarks';
import { SHELF, type ShelfId, type ShiftId, SHIFTS, stillOf, type Turn } from './exhibitIds';

const loadShowcase = () => import('./Showcase');
const Showcase = dynamic(loadShowcase, { ssr: false });

/** How long each shift stays on the stage before the next takes over, until you pick one. */
const SHIFT_MS = 7000;
/** A drag of a pixel turns the stage this far, in radians. */
const TURN_PER_PX = 0.011;
/** A tap with no drag spins it round about once. */
const TAP_FLICK = 11;

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch (_error) {
    return false;
  }
}

/** Starts fetching the 3D right away, but mounts it once the browser is idle. */
function useIdleMount(enabled: boolean): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    loadShowcase().catch(() => undefined);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(id);
  }, [enabled]);
  return ready;
}

function ShiftIcon({ id }: { id: ShiftId }) {
  if (id === 'ticket') {
    return <FiSun aria-hidden className="size-3.5" />;
  }
  if (id === 'night') {
    return <FiMoon aria-hidden className="size-3.5" />;
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-3.5">
      <path fill="currentColor" d={CLAUDE_PATH} />
    </svg>
  );
}

/** The small heading over each of the phone hero's two blocks. */
function BlockHeading({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
      {children}
    </h2>
  );
}

/**
 * The hero on phones, below the intro, in two labelled blocks made of the
 * desk's objects. How I work: the day shift, my agents and their night shift
 * take turns on a turntable you can spin, each with what it comes down to.
 * About me: the rest stands on a shelf, each piece turning on its own holder;
 * tapping one spins it and tells its story underneath. Still renders stand in
 * until the 3D is ready, and for good where there is no WebGL or motion is
 * reduced.
 */
export default function PhoneHero() {
  const { strings } = useLanguage();
  const { phone, objects } = strings.hero;
  const reducedMotion = usePrefersReducedMotion();
  const phoneSized = useMediaQuery('(max-width: 639px)');
  const { ref: viewRef, inView } = useInView({ rootMargin: '80px' });

  const [staged, setStaged] = useState<ShiftId>('ticket');
  // The shelf's story shows the most important piece until another is tapped.
  const [picked, setPicked] = useState<{ id: ShelfId; spins: number }>({
    id: SHELF[0],
    spins: 0,
  });
  // The shifts take turns by themselves until you pick, drag or tap the stage.
  const [auto, setAuto] = useState(true);
  const [turned, setTurned] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const [ready, setReady] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    setWebgl(supportsWebGL());
    const onVisibility = () => setPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const live = phoneSized && webgl && !reducedMotion;
  const mount = useIdleMount(live);
  const onReady = useCallback(() => setReady(true), []);

  const stageRef = useRef<HTMLDivElement>(null);
  const holders = useMemo(
    () =>
      Object.fromEntries(SHELF.map((id) => [id, createRef<HTMLDivElement>()])) as Record<
        ShelfId,
        RefObject<HTMLDivElement | null>
      >,
    []
  );
  const turn = useRef<Turn>({ drag: 0, held: false, flick: 0 });
  const drag = useRef<{ x: number; y: number; id: number; moved: boolean } | null>(null);

  const stage = (id: ShiftId) => {
    setAuto(false);
    setStaged(id);
  };

  const pick = (id: ShelfId) => setPicked((current) => ({ id, spins: current.spins + 1 }));

  const nextShift = () => setStaged(SHIFTS[(SHIFTS.indexOf(staged) + 1) % SHIFTS.length]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = { x: event.clientX, y: event.clientY, id: event.pointerId, moved: false };
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const { current } = drag;
    if (current?.id !== event.pointerId) {
      return;
    }
    const moveX = event.clientX - current.x;
    if (!current.moved) {
      // Up and down scrolls the page; only a sideways move takes hold of the turntable.
      const moveY = event.clientY - current.y;
      if (Math.abs(moveY) > 10 && Math.abs(moveY) > Math.abs(moveX)) {
        drag.current = null;
        return;
      }
      if (Math.abs(moveX) < 6) {
        return;
      }
      current.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      turn.current.held = true;
      setAuto(false);
      setTurned(true);
    }
    turn.current.drag += moveX * TURN_PER_PX;
    current.x = event.clientX;
  };
  const onPointerUp = () => {
    const { current } = drag;
    drag.current = null;
    turn.current.held = false;
    if (current && !current.moved) {
      turn.current.flick += TAP_FLICK;
      setAuto(false);
      setTurned(true);
    }
  };

  const shown = live && ready;

  return (
    <div ref={viewRef} className="mt-9 sm:hidden">
      <BlockHeading id="phone-work">{phone.shifts}</BlockHeading>
      <div
        role="tablist"
        aria-labelledby="phone-work"
        className="mt-3 grid grid-cols-3 gap-1 rounded-full border border-line bg-surface/80 p-1 backdrop-blur"
      >
        {SHIFTS.map((id) => {
          const selected = staged === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="showcase-caption"
              onClick={() => stage(id)}
              className={cx(
                'relative flex h-9 items-center justify-center gap-1.5 overflow-hidden rounded-full text-[13px] font-medium transition active:scale-95',
                selected ? 'bg-surface-3 text-ink' : 'text-muted'
              )}
            >
              <ShiftIcon id={id} />
              {phone.tabs[id]}
              {selected && auto && !reducedMotion && (
                <span
                  key={id}
                  aria-hidden
                  onAnimationEnd={nextShift}
                  style={{
                    animationDuration: `${SHIFT_MS}ms`,
                    animationPlayState: inView && pageVisible ? 'running' : 'paused',
                  }}
                  className="absolute inset-x-3 bottom-0.5 h-0.5 origin-left animate-shift rounded-full bg-accent"
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        ref={stageRef}
        role="img"
        aria-label={`${objects[staged].title}. ${phone.turnHint}`}
        onPointerDown={live ? onPointerDown : undefined}
        onPointerMove={live ? onPointerMove : undefined}
        onPointerUp={live ? onPointerUp : undefined}
        onPointerCancel={live ? onPointerUp : undefined}
        className="relative mt-3 h-[min(64vw,270px)] touch-pan-y select-none overflow-hidden rounded-[28px] border border-line bg-[radial-gradient(120%_90%_at_50%_0%,rgb(255_255_255/0.07),transparent_60%)]"
      >
        <Image
          key={staged}
          src={stillOf(staged, 'stage')}
          alt=""
          fill
          sizes="100vw"
          priority={staged === 'ticket'}
          className={cx(
            'object-cover transition-opacity duration-500',
            shown ? 'opacity-0' : 'opacity-100'
          )}
        />
        {live && (
          <span
            aria-hidden
            className={cx(
              'absolute bottom-3 right-3 grid size-8 place-items-center rounded-full border border-line-strong bg-bg/50 text-muted transition-opacity duration-500',
              turned || !shown ? 'opacity-0' : 'opacity-100'
            )}
          >
            <TbRotate360 className="size-4 motion-safe:animate-wobble" />
          </span>
        )}
      </div>

      {/* Every story sits in the same cell, so changing it never moves the shelf below. */}
      <div id="showcase-caption" role="tabpanel" aria-live="polite" className="mt-4 grid">
        {SHIFTS.map((id) => (
          <div
            key={id}
            aria-hidden={id !== staged}
            className={cx(
              '[grid-area:1/1] transition-opacity duration-300',
              id === staged ? 'opacity-100' : 'pointer-events-none opacity-0'
            )}
          >
            <h3 className="text-lg font-semibold tracking-tight">{phone.headline[id]}</h3>
            <p className="mt-1 text-[15px] leading-snug text-muted">{phone.caption[id]}</p>
            {id === 'night' && (
              <a
                href={`#${sectionIds.board}`}
                tabIndex={id === staged ? undefined : -1}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent"
              >
                {strings.hero.nightShiftLink}
                <FiArrowRight aria-hidden />
              </a>
            )}
          </div>
        ))}
      </div>

      <section aria-labelledby="phone-me" className="mt-10">
        <BlockHeading id="phone-me">{phone.shelf}</BlockHeading>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {SHELF.map((id) => {
            const on = picked.id === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                aria-controls="shelf-caption"
                onClick={() => pick(id)}
                className={cx(
                  'flex flex-col rounded-[20px] border bg-surface px-2 pb-2.5 text-left transition active:scale-[0.97]',
                  on ? 'border-accent/60' : 'border-line'
                )}
              >
                <span ref={holders[id]} className="relative -mx-2 block h-[84px] overflow-hidden">
                  <Image
                    src={stillOf(id, 'shelf')}
                    alt=""
                    fill
                    sizes="34vw"
                    className={cx(
                      'object-cover transition-opacity duration-500',
                      shown ? 'opacity-0' : 'opacity-100'
                    )}
                  />
                </span>
                <span className="px-0.5 text-[13px] font-semibold leading-tight">
                  {phone.widget[id].title}
                </span>
                <span className="mt-0.5 px-0.5 text-[11px] leading-tight text-muted">
                  {phone.widget[id].body}
                </span>
              </button>
            );
          })}
        </div>
        {/* As on the stage: every story in the same cell, so the page never jumps. */}
        <div id="shelf-caption" aria-live="polite" className="mt-3 grid">
          {SHELF.map((id) => (
            <p
              key={id}
              aria-hidden={id !== picked.id}
              className={cx(
                '[grid-area:1/1] text-[15px] leading-snug text-muted transition-opacity duration-300',
                id === picked.id ? 'opacity-100' : 'opacity-0'
              )}
            >
              {phone.caption[id]}
            </p>
          ))}
        </div>
      </section>

      {live && mount && (
        <Showcase
          stage={stageRef}
          holders={holders}
          staged={staged}
          picked={picked}
          turn={turn}
          active={inView && pageVisible}
          onReady={onReady}
        />
      )}
    </div>
  );
}
