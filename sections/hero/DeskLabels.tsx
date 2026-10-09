import { type RefObject, useEffect, useLayoutEffect, useRef } from 'react';
import { cx } from '@lib/cx';
import { type InfoId, TRIO, type TrioId, uidOf } from './playground/items';
import { type DeskLabel } from './playground/Playground';
import TrioIcon from './TrioIcon';

/** Space between a piece's front edge and its label. */
const GAP = 10;

type DeskLabelsProps = {
  /** The playground calls this with where each piece is, on every frame it draws. */
  sinkRef: RefObject<((labels: DeskLabel[]) => void) | null>;
  steps: Record<TrioId, string>;
  headline: Record<TrioId, string>;
  /** The piece whose story is open: its label makes way for the card. */
  hidden: string | null;
  /** Keeps labels above the hints at the bottom of the desk. */
  bottomInset: number;
  /** Anything else is on the desk: the labels go, until it is tidied up again. */
  off?: boolean;
  onPick: (info: InfoId, uid: string) => void;
};

/**
 * How I work, named on the desk: under each of its three pieces, what it is
 * and what it comes down to. Each follows its piece as it moves, positioned
 * straight from the render loop, and steps aside while it is carried. They
 * show only while how I work is alone on the desk: once anything else is
 * added they go, and come back when it is tidied up. A click tells the
 * piece's whole story, as clicking the piece does.
 */
export default function DeskLabels({
  sinkRef,
  steps,
  headline,
  hidden,
  bottomInset,
  off = false,
  onPick,
}: DeskLabelsProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef(new Map<string, HTMLButtonElement>());
  const hiddenRef = useRef(hidden);
  const offRef = useRef(off);
  useLayoutEffect(() => {
    hiddenRef.current = hidden;
  }, [hidden]);
  // Going at once, not on the next frame the desk happens to draw.
  useLayoutEffect(() => {
    offRef.current = off;
    if (off) {
      labelRefs.current.forEach((label) => {
        label.style.opacity = '0';
        label.style.visibility = 'hidden';
      });
    }
  }, [off]);

  useEffect(() => {
    sinkRef.current = (labels) => {
      const height = layerRef.current?.clientHeight ?? 0;
      labels.forEach(({ uid, x, front, lifted }) => {
        const label = labelRefs.current.get(uid);
        if (!label) {
          return;
        }
        const y = Math.min(front + GAP, height - bottomInset - label.offsetHeight);
        label.style.transform = `translate3d(${x}px, ${y}px, 0) translateX(-50%)`;
        const shown = !offRef.current && !lifted && hiddenRef.current !== uid;
        label.style.opacity = shown ? '1' : '0';
        label.style.visibility = shown ? 'visible' : 'hidden';
      });
    };
    return () => {
      sinkRef.current = null;
    };
  }, [sinkRef, bottomInset]);

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-0 z-10">
      {TRIO.map((id) => {
        const uid = uidOf(id);
        return (
          <button
            key={id}
            ref={(element) => {
              if (element) {
                labelRefs.current.set(uid, element);
              } else {
                labelRefs.current.delete(uid);
              }
            }}
            type="button"
            onClick={() => onPick(id, uid)}
            style={{ opacity: 0, visibility: 'hidden' }}
            className={cx(
              // Visibility goes at the end of the fade, so a label fades out instead of vanishing.
              'pointer-events-auto absolute left-0 top-0 flex flex-col items-center whitespace-nowrap rounded-xl px-3 py-1.5 text-center transition-[opacity,visibility,background-color] duration-300',
              'hover:bg-surface/70 hover:backdrop-blur-sm'
            )}
          >
            <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
              <TrioIcon id={id} className={cx(id !== 'night' && 'text-accent')} />
              {steps[id]}
            </span>
            <span className="mt-0.5 text-[15px] font-semibold tracking-tight text-ink">
              {headline[id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
