import { createRef, type RefObject, useCallback, useId, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { FiCheck, FiPlus, FiRotateCcw } from 'react-icons/fi';
import { cx } from '@lib/cx';
import { stillOf } from './phone/exhibitIds';
import { type ExtraId } from './playground/items';

type ObjectInfo = { title: string; body: string };

const TrayShow = dynamic(() => import('./phone/Showcase').then((module) => module.TrayShow), {
  ssr: false,
});

type DeskTrayProps = {
  /** What can be added, most important first. */
  ids: readonly ExtraId[];
  added: readonly ExtraId[];
  strings: {
    title: string;
    addAll: string;
    tidy: string;
    items: Record<ExtraId, ObjectInfo>;
  };
  /** Each piece's whole story: told under the tray when there is no desk to drop it on. */
  stories: Record<ExtraId, ObjectInfo>;
  /** No 3D desk (no WebGL, or reduced motion): a click tells the story instead. */
  still?: boolean;
  /** The desk is up: the pieces turn in 3D in their squares instead of showing as stills. */
  live?: boolean;
  /** On screen, with the page visible: only then do they turn. */
  active?: boolean;
  /** The pointer is on one of them: it floats over where it would land. */
  onPreview: (id: ExtraId | null) => void;
  /** The pointer or focus is in the tray: the desk steps back to make room. */
  onHover: (hover: boolean) => void;
  onAdd: (id: ExtraId) => void;
  onAddAll: () => void;
  onTidy: () => void;
};

/**
 * The rest of me, waiting beside the desk: a still of each piece, with its
 * name and a line underneath while it is pointed at. Pointing at one floats
 * it over the spot it would land on; a click drops it there and tells its
 * story. Everything at once, or back to how I work alone, is a click away.
 */
export default function DeskTray({
  ids,
  added,
  strings,
  stories,
  still = false,
  live = false,
  active = true,
  onPreview,
  onHover,
  onAdd,
  onAddAll,
  onTidy,
}: DeskTrayProps) {
  const titleId = useId();
  const lineId = useId();
  const remaining = ids.filter((id) => !added.includes(id));
  // Whatever is pointed at, named under the tray; without a desk, the last one clicked.
  const [pointed, setPointed] = useState<ExtraId | null>(null);
  const [told, setTold] = useState<ExtraId | null>(null);
  const point = (id: ExtraId | null) => {
    setPointed(id);
    onPreview(id && !still && !added.includes(id) ? id : null);
  };
  // Without a desk, the story clicked open stays told, even with the pointer still on its chip.
  const telling = still && told !== null && (pointed === null || pointed === told);
  const shown = telling ? told : pointed;
  const slots = useMemo(
    () =>
      Object.fromEntries(ids.map((id) => [id, createRef<HTMLSpanElement>()])) as Partial<
        Record<ExtraId, RefObject<HTMLSpanElement | null>>
      >,
    [ids]
  );
  const [turning, setTurning] = useState(false);
  const onTurning = useCallback(() => setTurning(true), []);

  return (
    // Pointer and focus only change what the desk shows; the buttons inside do the work.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      role="group"
      aria-labelledby={titleId}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => {
        onHover(false);
        point(null);
      }}
      onFocus={() => onHover(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onHover(false);
          point(null);
        }
      }}
    >
      <div className="flex h-7 items-center gap-3">
        <p id={titleId} className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          {strings.title}
        </p>
        {!still && (
          // Both keep their place, shown or not: Tidy up comes in beside Add everything, never pushing it.
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={onTidy}
              className={cx(
                'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs text-muted transition-[opacity,visibility,background-color,color] duration-300 hover:bg-surface-2 hover:text-ink',
                added.length > 0 ? 'visible opacity-100' : 'invisible opacity-0'
              )}
            >
              <FiRotateCcw aria-hidden />
              {strings.tidy}
            </button>
            <button
              type="button"
              onClick={onAddAll}
              className={cx(
                'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs text-muted transition-[opacity,visibility,background-color,color] duration-300 hover:bg-surface-2 hover:text-ink',
                remaining.length > 0 ? 'visible opacity-100' : 'invisible opacity-0'
              )}
            >
              <FiPlus aria-hidden />
              {strings.addAll}
            </button>
          </div>
        )}
      </div>
      {/* One canvas over the whole tray draws each piece into its square. */}
      <ul className="relative mt-2 flex flex-wrap gap-1.5">
        {ids.map((id) => {
          const on = added.includes(id);
          const { title, body } = strings.items[id];
          return (
            <li key={id}>
              <button
                type="button"
                aria-pressed={still ? told === id : on}
                aria-label={`${title}: ${body}`}
                aria-describedby={still ? lineId : undefined}
                onPointerEnter={() => point(id)}
                onFocus={() => point(id)}
                onClick={() => (still ? setTold(id) : onAdd(id))}
                // No transforms here: the canvas over the tray draws into these squares as they are.
                className={cx(
                  'group relative block size-16 overflow-hidden rounded-2xl border transition-colors duration-200',
                  on || (still && told === id)
                    ? 'border-accent/50 bg-accent/10'
                    : 'border-line bg-surface/80 hover:border-line-strong hover:bg-surface-2'
                )}
              >
                <span ref={slots[id]} className="absolute inset-0">
                  {/* Until the 3D is up, and for good without it: the still, framed whole. */}
                  {/* Framed as the 3D frames it, at the angle it starts turning from. */}
                  <Image
                    src={stillOf(id, 'tray')}
                    alt=""
                    fill
                    sizes="64px"
                    className={cx(
                      'object-cover transition-[opacity,transform] duration-500',
                      live && turning ? 'opacity-0 delay-500' : on && 'opacity-40',
                      // Without the 3D, the still lifts a little instead of turning to face the viewer.
                      !live && !on && 'group-hover:-translate-y-0.5 group-hover:scale-105'
                    )}
                  />
                </span>
                {on && live && turning && (
                  // Over the canvas: what is already on the desk sits back.
                  <span aria-hidden className="absolute inset-0 z-20 bg-bg/45" />
                )}
                {on && (
                  <span className="absolute right-1 top-1 z-20 grid size-4 place-items-center rounded-full bg-accent text-bg">
                    <FiCheck aria-hidden className="size-2.5" strokeWidth={3.5} />
                  </span>
                )}
              </button>
            </li>
          );
        })}
        {live && (
          <li aria-hidden className="pointer-events-none absolute inset-0 z-10">
            <TrayShow
              ids={ids}
              slots={slots}
              hovered={pointed}
              added={added}
              active={active}
              onReady={onTurning}
            />
          </li>
        )}
      </ul>
      {/* Always there, so naming one never moves the text above. */}
      <p
        id={lineId}
        aria-live={still ? 'polite' : undefined}
        className={cx('mt-2 text-xs text-muted', still ? 'min-h-10' : 'h-4 truncate')}
      >
        {shown && (
          <>
            <span className="font-medium text-ink">{strings.items[shown].title}</span>
            {' · '}
            {telling ? stories[shown].body : strings.items[shown].body}
          </>
        )}
      </p>
    </div>
  );
}
