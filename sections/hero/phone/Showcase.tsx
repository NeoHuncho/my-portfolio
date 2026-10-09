import { type ReactNode, type RefObject, Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { cx } from '@lib/cx';
import { Cell, CellLayer } from './Cells';
import { type ExhibitId, SHELF, type ShelfId, thumbPhase, type TrioTurn } from './exhibitIds';
import { HolderScene, ThumbScene, TrioScene } from './exhibits';
import { SETTINGS, useBudgetDpr, useQuality } from '../quality';
import Ticker from '../Ticker';

/**
 * Draws a first few frames as soon as it is up, seen or not, so shaders and
 * textures are ready before anyone scrolls to it; then says so.
 */
function WarmUp({ onReady }: { onReady: () => void }) {
  const invalidate = useThree((state) => state.invalidate);
  const frames = useRef(0);
  useEffect(() => {
    invalidate();
  }, [invalidate]);
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
 * A transparent canvas filling whatever it is put in. It sits in the page
 * with what it draws, so the two scroll together, and never takes a touch:
 * the page underneath handles those. It fades in over the still under it
 * once its first frames are drawn, and redraws only while on screen.
 */
function Layer({
  active,
  onReady,
  use,
  children,
}: {
  active: boolean;
  onReady: () => void;
  /** Which settings it draws with, at the device's quality. */
  use: 'stage' | 'shelf' | 'tray';
  children: ReactNode;
}) {
  const quality = useQuality();
  const { dpr: maxDpr, fps } = SETTINGS[use][quality];
  const dpr = useBudgetDpr(quality, maxDpr);
  const [ready, setReady] = useState(false);
  const onWarm = () => {
    setReady(true);
    onReady();
  };
  return (
    <div
      className={cx(
        'pointer-events-none absolute inset-0 transition-opacity duration-500',
        ready ? 'opacity-100' : 'opacity-0'
      )}
      aria-hidden
    >
      <Canvas
        frameloop="demand"
        dpr={dpr}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        style={{ pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          {/* The desk's objects carry their colliders; paused, nothing moves them. */}
          <Physics paused>{children}</Physics>
          <WarmUp onReady={onWarm} />
          {active && <Ticker fps={fps} />}
        </Suspense>
      </Canvas>
    </div>
  );
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
    <Layer active={active} onReady={onReady} use="shelf">
      <CellLayer>
        {SHELF.map((id, i) => (
          <Cell key={id} track={holders[id]} index={i + 2}>
            <HolderScene
              id={id}
              picked={picked.id === id}
              spins={picked.id === id ? picked.spins : 0}
              phase={i * 1.1}
            />
          </Cell>
        ))}
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
  return (
    <Layer active={active} onReady={onReady} use="tray">
      <CellLayer>
        {ids.map((id) => {
          const slot = slots[id];
          return slot ? (
            <Cell key={id} track={slot} index={ids.indexOf(id) + 2}>
              <ThumbScene
                id={id}
                hovered={hovered === id}
                added={added.includes(id)}
                phase={thumbPhase(id)}
              />
            </Cell>
          ) : null;
        })}
      </CellLayer>
    </Layer>
  );
}
