import { type RefObject, useEffect, useId, useLayoutEffect, useRef } from 'react';
import { FiArrowDown, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { cx } from '@lib/cx';
import { type Anchor } from './playground/Playground';

/** Space between the object's edge and the card, and between the card and the desk's edges. */
const LEAD = 36;
const EDGE = 12;
/** Past this much squeezing to stay on screen, a side no longer counts as fitting. */
const SQUEEZE = 24;

type Side = 'right' | 'left' | 'below' | 'above';
/** In order of preference when they score the same: beside reads best. */
const SIDES: Side[] = ['right', 'left', 'below', 'above'];
type Rect = { left: number; top: number; right: number; bottom: number };
type Dock = 'above' | 'bottom' | 'top';
/** A sideways swipe this long, and this much more sideways than up or down, turns the page. */
const SWIPE = 40;
const SWIPE_RATIO = 1.5;
/** Docked: how far the sheet reaches down over the desk's empty top edge, covering the intro's buttons whole; and the fixed header it stays below. */
const DOCK_OVERLAP = 8;
const HEADER = 64;

type DeskCalloutProps = {
  /** Changes with the object, to replay the entrance. */
  selectionKey: string;
  title: string;
  body: string;
  closeLabel: string;
  onClose: () => void;
  /** An on/off button under the text, for objects that can do something, like the robot following the pointer. */
  toggle?: { label: string; pressed: boolean; onToggle: () => void };
  /** A link under the text, to the part of the page the object is about. */
  link?: { label: string; href: string };
  /**
   * Docked only: step to the previous or next story, with the buttons or by
   * swiping the sheet sideways.
   */
  nav?: {
    index: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
    prevLabel: string;
    nextLabel: string;
  };
  /**
   * Small screens: a sheet the width of the desk, just above it, with the
   * leader line dropping to the object. Otherwise a card beside the object.
   */
  docked: boolean;
  /** Keeps the card below the fixed header. */
  topInset: number;
  /** Keeps the card above the hints at the bottom of the hero. */
  bottomInset: number;
  /** Something on top of the desk the card must not cover, like the hero text. */
  avoidRef?: RefObject<HTMLElement | null>;
  /** The playground calls this with the object's position on every frame it draws. */
  anchorSinkRef: RefObject<((anchor: Anchor | null) => void) | null>;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function overlap(a: Rect, b: Rect) {
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return w > 0 && h > 0 ? w * h : 0;
}

function around({ x, y, r }: { x: number; y: number; r: number }): Rect {
  return { left: x - r, top: y - r, right: x + r, bottom: y + r };
}

/**
 * What an object on the desk says about me, attached to it: a card beside the
 * object with a thin leader line to it, following it as it moves. It sits on
 * whichever side covers the least of the desk and stays on screen, and keeps
 * that side while it still fits. Positioned straight from the render loop, so
 * following the object never re-renders React.
 */
export default function DeskCallout({
  selectionKey,
  title,
  body,
  closeLabel,
  onClose,
  toggle,
  link,
  nav,
  docked,
  topInset,
  bottomInset,
  avoidRef,
  anchorSinkRef,
}: DeskCalloutProps) {
  const titleId = useId();
  const layerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const leaderRef = useRef<SVGGElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);
  const placement = useRef<{ side: Side; dock: Dock; placed: boolean }>({
    side: 'right',
    dock: 'above',
    placed: false,
  });

  useLayoutEffect(() => {
    placement.current.placed = false;
    if (cardRef.current) {
      cardRef.current.style.visibility = 'hidden';
    }
    leaderRef.current?.setAttribute('visibility', 'hidden');
    panelRef.current?.animate(
      [
        { opacity: 0, transform: 'translateY(6px) scale(0.98)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 260, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    );
  }, [selectionKey]);

  useEffect(() => {
    const showLine = (visible: boolean) => {
      leaderRef.current?.setAttribute('visibility', visible ? 'visible' : 'hidden');
    };
    const setLine = (x1: number, y1: number, x2: number, y2: number) => {
      const line = lineRef.current;
      if (!line || !dotRef.current || !ringRef.current) {
        return;
      }
      line.setAttribute('x1', x1.toFixed(1));
      line.setAttribute('y1', y1.toFixed(1));
      line.setAttribute('x2', x2.toFixed(1));
      line.setAttribute('y2', y2.toFixed(1));
      [dotRef.current, ringRef.current].forEach((dot) => {
        dot.setAttribute('cx', x1.toFixed(1));
        dot.setAttribute('cy', y1.toFixed(1));
      });
      showLine(true);
    };

    const place = (anchor: Anchor | null) => {
      const layer = layerRef.current;
      const card = cardRef.current;
      if (!layer || !card) {
        return;
      }
      if (!anchor) {
        showLine(false);
        return;
      }
      const width = layer.clientWidth;
      const height = layer.clientHeight;
      const cw = card.offsetWidth;
      const ch = card.offsetHeight;
      const state = placement.current;
      let left: number;
      let top: number;

      if (docked) {
        // Just above the desk, over the end of the intro, so every object stays in view and in reach.
        // Scrolled too far for that, it docks across the part of the desk on screen (a phone's desk
        // is taller than the screen), on the half the object is not in.
        const box = layer.getBoundingClientRect();
        const room = box.top - ch + DOCK_OVERLAP;
        const shownTop = clamp(HEADER - box.top, 0, height);
        const shownBottom = clamp(window.innerHeight - box.top, shownTop, height);
        const share = (anchor.y - shownTop) / Math.max(1, shownBottom - shownTop);
        // Stepped to an object off screen: the page brings it into view.
        if (!state.placed && (anchor.y < shownTop || anchor.y > shownBottom)) {
          window.scrollBy({
            top: anchor.y - (shownTop + shownBottom) / 2,
            behavior: 'smooth',
          });
        }
        if (room >= HEADER) {
          state.dock = 'above';
        } else if (state.dock === 'above' || !state.placed) {
          state.dock = share < 0.5 ? 'bottom' : 'top';
        } else if (state.dock === 'bottom' && share > 0.62) {
          state.dock = 'top';
        } else if (state.dock === 'top' && share < 0.38) {
          state.dock = 'bottom';
        }
        left = EDGE;
        top = {
          above: DOCK_OVERLAP - ch,
          bottom: shownBottom - ch - bottomInset,
          top: shownTop + topInset,
        }[state.dock];
        const downward = state.dock === 'bottom';
        const edgeY = downward ? top : top + ch;
        const fromY = anchor.y + (downward ? anchor.r : -anchor.r) * 0.75;
        if ((downward ? edgeY - fromY : fromY - edgeY) > 10) {
          setLine(anchor.x, fromY, clamp(anchor.x, left + 24, left + cw - 24), edgeY);
        } else {
          showLine(false);
        }
      } else {
        const layerBox = layer.getBoundingClientRect();
        const avoidBox = avoidRef?.current?.getBoundingClientRect();
        const avoid: Rect | null = avoidBox
          ? {
              left: avoidBox.left - layerBox.left,
              top: avoidBox.top - layerBox.top,
              right: avoidBox.right - layerBox.left,
              bottom: avoidBox.bottom - layerBox.top,
            }
          : null;
        const object = around(anchor);
        // Where the card goes on each side, nudged back on screen, and how much that nudge was.
        const spot = (side: Side) => {
          const reach = anchor.r + LEAD;
          const ideal = {
            right: { left: anchor.x + reach, top: anchor.y - ch / 2 },
            left: { left: anchor.x - reach - cw, top: anchor.y - ch / 2 },
            below: { left: anchor.x - cw / 2, top: anchor.y + anchor.r * 0.8 + LEAD },
            above: { left: anchor.x - cw / 2, top: anchor.y - anchor.r * 0.8 - LEAD - ch },
          }[side];
          const at = {
            left: clamp(ideal.left, EDGE, width - cw - EDGE),
            top: clamp(ideal.top, topInset, height - ch - bottomInset),
          };
          const rect = { ...at, right: at.left + cw, bottom: at.top + ch };
          const shift = Math.hypot(at.left - ideal.left, at.top - ideal.top);
          const blocked = overlap(rect, object) > 0 || (avoid !== null && overlap(rect, avoid) > 0);
          return { ...at, rect, shift, fits: !blocked && shift <= SQUEEZE };
        };
        // Covering other things costs their covered area; covering the object or the text is out.
        const score = (side: Side, others: Rect[]) => {
          const { rect, shift, fits } = spot(side);
          const covered = others.reduce((sum, other) => sum + overlap(rect, other), 0);
          return covered + shift * 40 + (fits ? 0 : 1e7);
        };
        if (!state.placed || !spot(state.side).fits) {
          const others = anchor.others().map(around);
          const best = SIDES.reduce((pick, side) =>
            score(side, others) < score(pick, others) ? side : pick
          );
          // With nowhere that fits, it stays put rather than hopping between sides.
          if (!state.placed || spot(best).fits) {
            state.side = best;
          }
        }
        ({ left, top } = spot(state.side));
        const horizontal = state.side === 'right' || state.side === 'left';
        if (horizontal) {
          const toRight = state.side === 'right';
          const edgeX = toRight ? left : left + cw;
          const fromX = anchor.x + (toRight ? anchor.r : -anchor.r);
          if ((edgeX - fromX) * (toRight ? 1 : -1) > 8) {
            setLine(fromX, anchor.y, edgeX, clamp(anchor.y, top + 18, top + ch - 18));
          } else {
            showLine(false);
          }
        } else {
          const downward = state.side === 'below';
          const edgeY = downward ? top : top + ch;
          const fromY = anchor.y + (downward ? anchor.r : -anchor.r) * 0.8;
          if ((edgeY - fromY) * (downward ? 1 : -1) > 8) {
            setLine(anchor.x, fromY, clamp(anchor.x, left + 24, left + cw - 24), edgeY);
          } else {
            showLine(false);
          }
        }
      }
      card.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
      if (!state.placed) {
        state.placed = true;
        card.style.visibility = 'visible';
      }
    };

    anchorSinkRef.current = place;
    return () => {
      anchorSinkRef.current = null;
    };
  }, [anchorSinkRef, avoidRef, docked, topInset, bottomInset]);

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-0 z-20">
      <svg aria-hidden className="absolute inset-0 size-full overflow-visible">
        <g ref={leaderRef} visibility="hidden">
          <line ref={lineRef} className="stroke-accent/70" strokeWidth={1.25} />
          <circle ref={ringRef} r={7} className="fill-none stroke-accent/40" strokeWidth={1} />
          <circle ref={dotRef} r={3} className="fill-accent" />
        </g>
      </svg>
      <div
        ref={cardRef}
        role="group"
        aria-labelledby={titleId}
        style={{ visibility: 'hidden' }}
        className={
          docked
            ? 'absolute left-0 top-0 w-[calc(100%-1.5rem)] will-change-transform'
            : 'absolute left-0 top-0 w-72 will-change-transform'
        }
      >
        <div
          ref={panelRef}
          // On touch screens the sheet takes taps; beside a held object it lets the pointer through.
          onPointerDown={
            nav
              ? (event) => {
                  swipe.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
                }
              : undefined
          }
          onPointerUp={
            nav
              ? (event) => {
                  const start = swipe.current;
                  swipe.current = null;
                  if (start?.id !== event.pointerId) {
                    return;
                  }
                  const dx = event.clientX - start.x;
                  const dy = event.clientY - start.y;
                  if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO) {
                    (dx < 0 ? nav.onNext : nav.onPrev)();
                  }
                }
              : undefined
          }
          onPointerCancel={() => {
            swipe.current = null;
          }}
          style={nav ? { touchAction: 'pan-y' } : undefined}
          className={
            docked
              ? 'pointer-events-auto relative rounded-xl border border-line-strong bg-surface/95 py-3 pl-4 pr-11 shadow-[0_18px_50px_-18px_rgb(0_0_0/0.8)] backdrop-blur-md'
              : 'relative rounded-xl border border-line-strong bg-surface/95 py-3.5 pl-4 pr-10 shadow-[0_18px_50px_-18px_rgb(0_0_0/0.8)] backdrop-blur-md'
          }
        >
          <span aria-hidden className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-accent" />
          <p
            id={titleId}
            className="text-[15px] font-semibold leading-snug tracking-tight text-ink"
          >
            {title}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">{body}</p>
          {(toggle ?? link ?? nav) && (
            <div className="mt-3 flex items-center gap-2">
              {toggle && (
                <button
                  type="button"
                  aria-pressed={toggle.pressed}
                  onClick={toggle.onToggle}
                  className={cx(
                    'pointer-events-auto inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] transition',
                    toggle.pressed
                      ? 'border-accent/60 bg-accent/15 text-ink hover:bg-accent/25'
                      : 'border-line-strong text-ink hover:border-ink'
                  )}
                >
                  <span
                    aria-hidden
                    className={cx(
                      'size-1.5 rounded-full',
                      toggle.pressed ? 'animate-pulse-dot bg-accent' : 'bg-faint'
                    )}
                  />
                  {toggle.label}
                </button>
              )}
              {link && (
                <a
                  href={link.href}
                  onClick={onClose}
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 font-mono text-[11px] text-bg transition hover:bg-white"
                >
                  {link.label}
                  <FiArrowDown aria-hidden />
                </a>
              )}
              {nav && (
                <div className="ml-auto flex items-center gap-1">
                  <span className="mr-1 font-mono text-[11px] tabular-nums text-faint">
                    {nav.index + 1}/{nav.total}
                  </span>
                  <button
                    type="button"
                    onClick={nav.onPrev}
                    aria-label={nav.prevLabel}
                    className="grid size-8 place-items-center rounded-full border border-line-strong text-muted transition active:scale-95 active:text-ink"
                  >
                    <FiChevronLeft aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={nav.onNext}
                    aria-label={nav.nextLabel}
                    className="grid size-8 place-items-center rounded-full border border-line-strong text-muted transition active:scale-95 active:text-ink"
                  >
                    <FiChevronRight aria-hidden />
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="pointer-events-auto absolute right-2 top-2 grid size-7 place-items-center rounded-full text-faint transition hover:bg-surface-3 hover:text-ink"
          >
            <FiX aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
