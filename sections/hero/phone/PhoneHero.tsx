import {
  createRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Image, { getImageProps } from 'next/image';
import { FiArrowRight } from 'react-icons/fi';
import { TbRotate360 } from 'react-icons/tb';
import { useInView } from 'react-intersection-observer';
import { sectionIds } from '@config/links';
import { useLanguage } from '@hooks/useLanguage';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@hooks/usePrefersReducedMotion';
import { cx } from '@lib/cx';
import trioStill from '@public/assets/showcase/stage-trio.webp';
import { SHELF, type ShelfId, SHIFTS, stillOf, type TrioTurn } from './exhibitIds';
import { probeGraphics } from '../quality';
import TrioIcon from '../TrioIcon';

const loadShowcase = () => import('./Showcase');
const StageShow = dynamic(() => loadShowcase().then((module) => module.StageShow), {
  ssr: false,
});
const ShelfShow = dynamic(() => loadShowcase().then((module) => module.ShelfShow), {
  ssr: false,
});

/** How long each piece stays in front before the turntable moves on, until it is touched. */
const STEP_MS = 7000;
/** A drag of a pixel turns the turntable this far, in radians: a third of a turn is about 230px. */
const TURN_PER_PX = 0.009;
/** Taps this close to either side bring the piece on that side to the front. */
const SIDE_TAP = 0.28;

/**
 * Behind the turntable, a glow for the time of day: warm for my day shift,
 * my agents' violet, deep blue for their night.
 */
/** The turntable's still at every width, for its preload. */
const {
  props: { srcSet: trioSrcSet },
} = getImageProps({ src: trioStill, alt: '', fill: true, sizes: '100vw' });

const TINTS = [
  'radial-gradient(55% 65% at 50% 62%, rgb(255 168 76 / 0.16), transparent 72%)',
  'radial-gradient(55% 65% at 50% 62%, rgb(150 112 255 / 0.18), transparent 72%)',
  'radial-gradient(55% 65% at 50% 62%, rgb(72 112 255 / 0.2), transparent 72%)',
];

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

/**
 * The hero on phones, straight after the intro, made of the desk's objects.
 * How I work stands on one turntable, my day shift, my agents and their
 * night shift together, with a step under it for each, from day to night:
 * swipe to turn it, tap to make the piece in front jump. Then the buttons
 * (`children`), then the rest of me on a shelf you swipe along, each piece
 * turning on its own holder; tapping one spins it and tells its story.
 * Still renders stand in until the 3D is ready, and for good where there is
 * no WebGL or motion is reduced.
 */
export default function PhoneHero({ children }: { children?: ReactNode }) {
  const { strings } = useLanguage();
  const { trio, more } = strings.hero;
  const reducedMotion = usePrefersReducedMotion();
  const phoneSized = useMediaQuery('(max-width: 639px)');
  const { ref: viewRef, inView } = useInView({ rootMargin: '80px' });
  // Each canvas draws only while its own part is in view.
  // Starting a little before they scroll in, so they are already moving when they do.
  const { ref: stageViewRef, inView: stageInView } = useInView({ rootMargin: '160px 0px' });
  const { ref: shelfViewRef, inView: shelfInView } = useInView({ rootMargin: '240px 0px' });

  const [step, setStep] = useState(0);
  // The shelf's story shows the most important piece until another is tapped.
  const [picked, setPicked] = useState<{ id: ShelfId; spins: number }>({
    id: SHELF[0],
    spins: 0,
  });
  // The turntable moves on by itself until it is picked, dragged or tapped.
  const [auto, setAuto] = useState(true);
  const [turned, setTurned] = useState(false);
  // Not known until the page runs: the 3D's still shows until then, as it nearly always will.
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [stageReady, setStageReady] = useState(false);
  const [shelfReady, setShelfReady] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    setWebgl(probeGraphics().webgl);
    const onVisibility = () => setPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const live = phoneSized && webgl === true && !reducedMotion;
  // Each canvas starts over when the 3D comes back (motion allowed again, say): so do its
  // readiness, and any swipe that was under way when it went.
  const [wasLive, setWasLive] = useState(live);
  if (live !== wasLive) {
    setWasLive(live);
    if (!live) {
      setStageReady(false);
      setShelfReady(false);
    }
  }
  // No 3D for good: the still of the piece the caption is about, instead of all three.
  const flat = webgl === false || reducedMotion;
  const mount = useIdleMount(live);
  const onStageReady = useCallback(() => setStageReady(true), []);
  const onShelfReady = useCallback(() => setShelfReady(true), []);

  const holders = useMemo(
    () =>
      Object.fromEntries(SHELF.map((id) => [id, createRef<HTMLDivElement>()])) as Record<
        ShelfId,
        RefObject<HTMLDivElement | null>
      >,
    []
  );
  const turn = useRef<TrioTurn>({ drag: 0, held: false, taps: 0 });
  const drag = useRef<{ x: number; y: number; id: number; moved: boolean } | null>(null);

  const touched = () => {
    setAuto(false);
    setTurned(true);
  };
  const pickStep = (next: number) => {
    setAuto(false);
    setStep((next + SHIFTS.length) % SHIFTS.length);
  };
  const onStep = useCallback((next: number) => setStep(next), []);
  const pick = (id: ShelfId) => setPicked((current) => ({ id, spins: current.spins + 1 }));

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
      touched();
    }
    turn.current.drag += moveX * TURN_PER_PX;
    current.x = event.clientX;
  };
  useEffect(() => {
    if (!live) {
      drag.current = null;
      turn.current.held = false;
      turn.current.drag = 0;
    }
  }, [live]);
  // A cancelled touch (the page took it for a scroll) only lets go: it is never a tap.
  const onPointerCancel = () => {
    drag.current = null;
    turn.current.held = false;
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const { current } = drag;
    drag.current = null;
    turn.current.held = false;
    if (!current || current.moved) {
      return;
    }
    // A tap: on either side, the piece there comes to the front; in the middle, the front one jumps.
    touched();
    const box = event.currentTarget.getBoundingClientRect();
    const across = (event.clientX - box.left) / box.width;
    if (across < SIDE_TAP) {
      pickStep(step - 1);
    } else if (across > 1 - SIDE_TAP) {
      pickStep(step + 1);
    } else {
      turn.current.taps += 1;
    }
  };

  const shown = live && stageReady;
  const shelfShown = live && shelfReady;
  const active = inView && pageVisible;
  const stageActive = stageInView && pageVisible;
  const shelfActive = shelfInView && pageVisible;
  const id = SHIFTS[step];

  return (
    <div ref={viewRef} className="sm:hidden">
      {/* The turntable's still, early and first, but only where it shows. */}
      <Head>
        <link
          key="phone-stage-still"
          rel="preload"
          as="image"
          media="(max-width: 639px)"
          imageSrcSet={trioSrcSet}
          imageSizes="100vw"
          fetchPriority="high"
        />
      </Head>
      <div
        ref={stageViewRef}
        role="img"
        aria-label={`${trio.label}: ${SHIFTS.map((shift) => trio.steps[shift]).join(', ')}. ${trio.turnHint}`}
        onPointerDown={live ? onPointerDown : undefined}
        onPointerMove={live ? onPointerMove : undefined}
        onPointerUp={live ? onPointerUp : undefined}
        onPointerCancel={live ? onPointerCancel : undefined}
        // Capture lost without a pointer up (the canvas went, say): let go all the same.
        onLostPointerCapture={live ? onPointerCancel : undefined}
        className="relative -mx-4 mt-1 h-[min(64vw,256px)] touch-pan-y select-none"
      >
        {TINTS.map((tint, i) => (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            aria-hidden
            style={{ backgroundImage: tint }}
            className={cx(
              'absolute inset-0 transition-opacity duration-700',
              i === step ? 'opacity-100' : 'opacity-0'
            )}
          />
        ))}
        {/*
          All three, as the 3D frames them, from the first paint, blurred until the picture is in;
          the 3D fades in over it once drawn. Without 3D, the piece the caption is about.
        */}
        {flat ? (
          <Image
            key={id}
            src={stillOf(id, 'stage')}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <Image
            src={trioStill}
            alt=""
            fill
            // Preloaded on phones only (below): wider screens, where it is hidden, never fetch it.
            sizes="100vw"
            placeholder="blur"
            className={cx(
              'object-cover transition-opacity duration-300',
              // Gone only once the 3D has faded in over it, so nothing shows through.
              shown && 'opacity-0 delay-500'
            )}
          />
        )}
        {live && mount && (
          <StageShow
            step={step}
            onStep={onStep}
            turn={turn}
            active={stageActive}
            onReady={onStageReady}
          />
        )}
        {live && (
          <span
            aria-hidden
            className={cx(
              'absolute bottom-2 right-4 grid size-8 place-items-center rounded-full border border-line-strong bg-bg/50 text-muted transition-opacity duration-500',
              turned || !shown ? 'opacity-0' : 'opacity-100'
            )}
          >
            <TbRotate360 className="size-4 motion-safe:animate-wobble" />
          </span>
        )}
      </div>

      {/* From day to night: a step for each piece, joined by a line. */}
      <div role="tablist" aria-label={trio.label} className="relative mt-2 grid grid-cols-3">
        <span
          aria-hidden
          className="absolute inset-x-[16.67%] top-4 h-px bg-gradient-to-r from-accent/50 via-[#9670ff]/50 to-[#4870ff]/50"
        />
        {SHIFTS.map((shift, i) => {
          const selected = step === i;
          return (
            <button
              key={shift}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="trio-caption"
              onClick={() => pickStep(i)}
              className="relative flex flex-col items-center gap-1.5 px-1 transition active:scale-95"
            >
              <span
                className={cx(
                  'grid size-8 place-items-center rounded-full border bg-bg transition-colors duration-300',
                  selected ? 'border-accent text-accent' : 'border-line-strong text-muted'
                )}
              >
                <TrioIcon id={shift} />
              </span>
              <span
                className={cx(
                  'text-balance text-center text-[12px] font-medium leading-tight transition-colors duration-300',
                  selected ? 'text-ink' : 'text-muted'
                )}
              >
                {trio.steps[shift]}
              </span>
              {/* How long until the next piece comes round; always there, so it never shifts the row. */}
              <span aria-hidden className="h-0.5 w-10 overflow-hidden rounded-full">
                {selected && auto && !reducedMotion && (
                  <span
                    key={shift}
                    onAnimationEnd={() => setStep((current) => (current + 1) % SHIFTS.length)}
                    style={{
                      animationDuration: `${STEP_MS}ms`,
                      animationPlayState: active ? 'running' : 'paused',
                    }}
                    className="block h-full origin-left animate-shift bg-accent"
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Every story sits in the same cell, so changing it never moves what is below. */}
      <div id="trio-caption" role="tabpanel" aria-live="polite" className="mt-4 grid">
        {SHIFTS.map((shift) => (
          <div
            key={shift}
            aria-hidden={shift !== id}
            className={cx(
              '[grid-area:1/1] transition-opacity duration-300',
              shift === id ? 'opacity-100' : 'pointer-events-none opacity-0'
            )}
          >
            <h2 className="text-lg font-semibold tracking-tight">{trio.headline[shift]}</h2>
            <p className="mt-1 text-[15px] leading-snug text-muted">{trio.caption[shift]}</p>
            {shift === 'night' && (
              <a
                href={`#${sectionIds.board}`}
                tabIndex={shift === id ? undefined : -1}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent"
              >
                {strings.hero.nightShiftLink}
                <FiArrowRight aria-hidden />
              </a>
            )}
          </div>
        ))}
      </div>

      {children}

      <section aria-labelledby="phone-more" className="mt-10">
        <h2
          id="phone-more"
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted"
        >
          {more.title}
        </h2>
        {/* One canvas laid along the whole shelf scrolls with it, so the pieces never trail a swipe. */}
        <div
          ref={shelfViewRef}
          data-cell-clip
          className="no-scrollbar -mx-4 mt-3 snap-x snap-mandatory scroll-px-4 overflow-x-auto overscroll-x-contain px-4"
        >
          <div className="relative w-max">
            <ul className="flex gap-2">
              {SHELF.map((shelfId) => {
                const on = picked.id === shelfId;
                return (
                  <li key={shelfId} className="shrink-0 snap-start">
                    <button
                      type="button"
                      aria-pressed={on}
                      aria-controls="shelf-caption"
                      onClick={() => pick(shelfId)}
                      className={cx(
                        'flex w-[118px] flex-col rounded-[20px] border bg-surface px-2 pb-2.5 text-left transition active:scale-[0.97]',
                        on ? 'border-accent/60' : 'border-line'
                      )}
                    >
                      <span
                        ref={holders[shelfId]}
                        className="relative -mx-2 block h-[84px] overflow-hidden"
                      >
                        <Image
                          src={stillOf(shelfId, 'shelf')}
                          alt=""
                          fill
                          sizes="120px"
                          className={cx(
                            'object-cover transition-opacity duration-300',
                            shelfShown && 'opacity-0 delay-500'
                          )}
                        />
                      </span>
                      <span className="px-0.5 text-[13px] font-semibold leading-tight">
                        {more.items[shelfId].title}
                      </span>
                      <span className="mt-0.5 px-0.5 text-[11px] leading-tight text-muted">
                        {more.items[shelfId].body}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {live && mount && (
              <ShelfShow
                holders={holders}
                picked={picked}
                active={shelfActive}
                onReady={onShelfReady}
              />
            )}
          </div>
        </div>
        {/* As with the turntable: every story in the same cell, so the page never jumps. */}
        <div id="shelf-caption" aria-live="polite" className="mt-3 grid">
          {SHELF.map((shelfId) => (
            <p
              key={shelfId}
              aria-hidden={shelfId !== picked.id}
              className={cx(
                '[grid-area:1/1] text-[15px] leading-snug text-muted transition-opacity duration-300',
                shelfId === picked.id ? 'opacity-100' : 'opacity-0'
              )}
            >
              {more.caption[shelfId]}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
