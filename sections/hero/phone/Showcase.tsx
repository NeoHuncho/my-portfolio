import {
  type ReactNode,
  type RefObject,
  Suspense,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { cx } from '@lib/cx';
import { Cell, CellLayer, CellRegistry, type CellScenes } from './Cells';
import {
  type ExhibitId,
  SHELF,
  shelfPhase,
  type ShelfId,
  thumbPhase,
  type TrioTurn,
} from './exhibitIds';
import { HolderScene, ThumbScene, TrioScene } from './exhibits';
import { compileFully } from '../playground/compile';
import { SETTINGS, useBudgetDpr, useQuality } from '../quality';
import Ticker from '../Ticker';

/**
 * Gets the canvas ready as soon as it is up, seen or not, before anyone
 * scrolls to it. First its shaders, every cell's too, are compiled away from
 * the page's thread: the canvas draws nothing till then, since a frame drawn
 * sooner would wait on the compiler. Then it draws a first few frames, which
 * upload the textures, and says so.
 */
function WarmUp({
  cells,
  onCompiled,
  onReady,
}: {
  /** How many cells will register: they come up a few frames apart. */
  cells: number;
  onCompiled: () => void;
  onReady: () => void;
}) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const registry = useContext(CellRegistry);
  const frames = useRef(0);
  useEffect(() => {
    let live = true;
    let frame = 0;
    let waited = 0;
    const compile = () => {
      if (!live) {
        return;
      }
      // Every cell in first, unless one never comes (about ten seconds).
      if ((registry?.size ?? 0) < cells && waited < 600) {
        waited += 1;
        frame = requestAnimationFrame(compile);
        return;
      }
      const scenes = [...(registry ?? new Map())].map(([cell, cameraOf]) =>
        compileFully(gl, cell, cameraOf())
      );
      Promise.all([compileFully(gl, scene, camera), ...scenes])
        .catch(() => undefined)
        .then(() => {
          if (live) {
            onCompiled();
            invalidate();
          }
        });
    };
    compile();
    return () => {
      live = false;
      cancelAnimationFrame(frame);
    };
    // Once, when the canvas is up.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useFrame(() => {
    frames.current += 1;
    if (frames.current < 3) {
      invalidate();
    } else if (frames.current === 3) {
      onReady();
    }
  });
  return null;
}

/**
 * From the canvas fading in over its still to that still being gone (the
 * tray's still waits half a second, then fades for half a second): the
 * pieces hold the pose the still shows till then, so the two never part.
 */
const HANDOVER_MS = 1000;

/**
 * Sets whatever moves on its own going again, from where it stopped: time
 * spent not drawing (held for the handover, or scrolled away) never shows
 * as a jump in the pieces' own animations.
 */
function Moving({ fps }: { fps: number }) {
  const clock = useThree((state) => state.clock);
  useLayoutEffect(() => {
    if (clock.running) {
      clock.oldTime = performance.now();
    }
  }, [clock]);
  return <Ticker fps={fps} />;
}

/**
 * A transparent canvas filling whatever it is put in. It sits in the page
 * with what it draws, so the two scroll together, and never takes a touch:
 * the page underneath handles those. It fades in over the still under it
 * once its first frames are drawn, starts moving once the still is gone,
 * and redraws only while on screen.
 */
function Layer({
  active,
  onReady,
  use,
  cells = 0,
  children,
}: {
  active: boolean;
  onReady: () => void;
  /** Which settings it draws with, at the device's quality. */
  use: 'stage' | 'shelf' | 'tray';
  /** How many cells it holds, if it draws into cells. */
  cells?: number;
  children: ReactNode;
}) {
  const quality = useQuality();
  const { dpr: maxDpr, fps } = SETTINGS[use][quality];
  // Sized by its own box, not the window's: a phone's window grows and shrinks as its address
  // bar hides and shows on scroll, and every change of ratio clears the canvas for a frame.
  const box = useRef<HTMLDivElement>(null);
  const dpr = useBudgetDpr(quality, maxDpr, box);
  const registry = useMemo<CellScenes>(() => new Map(), []);
  const [compiled, setCompiled] = useState(false);
  const [ready, setReady] = useState(false);
  const [moving, setMoving] = useState(false);
  const onWarm = () => {
    setReady(true);
    onReady();
  };
  useEffect(() => {
    if (!ready) {
      return undefined;
    }
    const timer = window.setTimeout(() => setMoving(true), HANDOVER_MS);
    return () => window.clearTimeout(timer);
  }, [ready]);
  return (
    <div
      ref={box}
      className={cx(
        'pointer-events-none absolute inset-0 transition-opacity duration-500',
        ready ? 'opacity-100' : 'opacity-0'
      )}
      aria-hidden
    >
      <Canvas
        frameloop={compiled ? 'demand' : 'never'}
        dpr={dpr}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        style={{ pointerEvents: 'none' }}
      >
        <CellRegistry.Provider value={registry}>
          <Suspense fallback={null}>
            {/* The desk's objects, standing still: no physics, so their colliders are left out. */}
            {children}
            <WarmUp cells={cells} onCompiled={() => setCompiled(true)} onReady={onWarm} />
            {active && moving && <Moving fps={fps} />}
          </Suspense>
        </CellRegistry.Provider>
      </Canvas>
    </div>
  );
}

/**
 * How many of `total` things to have up: one more each frame. Building a
 * piece (its shapes, its labels) takes a few milliseconds; a whole shelf of
 * them at once would hold one frame up for the lot.
 */
function OneAFrame({ children }: { children: ReactNode[] }) {
  // None in the first frame: making the canvas is enough for one.
  const [shown, setShown] = useState(0);
  const total = children.length;
  useEffect(() => {
    if (shown >= total) {
      return undefined;
    }
    const frame = requestAnimationFrame(() => setShown((count) => count + 1));
    return () => cancelAnimationFrame(frame);
  }, [shown, total]);
  return <>{children.slice(0, shown)}</>;
}

/** The phone's turntable of how I work, drawn into the stage it is put in. */
export function StageShow({
  step,
  onStep,
  turn,
  active,
  onReady,
}: {
  /** The piece of how I work in front on the turntable. */
  step: number;
  onStep: (step: number) => void;
  turn: RefObject<TrioTurn>;
  active: boolean;
  onReady: () => void;
}) {
  return (
    <Layer active={active} onReady={onReady} use="stage">
      <TrioScene step={step} turn={turn} onStep={onStep} />
    </Layer>
  );
}

/** The phone's shelf: each piece turning on its holder, drawn by one canvas laid along the whole shelf. */
export function ShelfShow({
  holders,
  picked,
  active,
  onReady,
}: {
  holders: Record<ShelfId, RefObject<HTMLElement | null>>;
  picked: { id: ShelfId; spins: number };
  active: boolean;
  onReady: () => void;
}) {
  return (
    <Layer active={active} onReady={onReady} use="shelf" cells={SHELF.length}>
      <CellLayer>
        <OneAFrame>
          {SHELF.map((id, i) => (
            <Cell key={id} track={holders[id]} index={i + 2}>
              <HolderScene
                id={id}
                picked={picked.id === id}
                spins={picked.id === id ? picked.spins : 0}
                phase={shelfPhase(id)}
              />
            </Cell>
          ))}
        </OneAFrame>
      </CellLayer>
    </Layer>
  );
}

/** The desk's tray: each piece turning in its own square, small, so a low resolution does. */
export function TrayShow<Id extends ExhibitId>({
  ids,
  slots,
  hovered,
  added,
  active,
  onReady,
}: {
  ids: readonly Id[];
  slots: Partial<Record<Id, RefObject<HTMLElement | null>>>;
  hovered: Id | null;
  added: readonly Id[];
  active: boolean;
  onReady: () => void;
}) {
  const placed = ids.flatMap((id) => {
    const slot = slots[id];
    return slot ? [{ id, slot }] : [];
  });
  return (
    <Layer active={active} onReady={onReady} use="tray" cells={placed.length}>
      <CellLayer>
        <OneAFrame>
          {placed.map(({ id, slot }) => (
            <Cell key={id} track={slot} index={ids.indexOf(id) + 2}>
              <ThumbScene
                id={id}
                hovered={hovered === id}
                added={added.includes(id)}
                phase={thumbPhase(id)}
              />
            </Cell>
          ))}
        </OneAFrame>
      </CellLayer>
    </Layer>
  );
}
