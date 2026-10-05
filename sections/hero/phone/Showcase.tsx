import { type RefObject, Suspense, useRef } from 'react';
import { View } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { SHELF, type ShelfId, type ShiftId, type Turn } from './exhibitIds';
import { HolderScene, StageScene } from './exhibits';

export type ShowcaseProps = {
  stage: RefObject<HTMLDivElement | null>;
  holders: Record<ShelfId, RefObject<HTMLDivElement | null>>;
  staged: ShiftId;
  picked: { id: ShelfId; spins: number };
  turn: RefObject<Turn>;
  active: boolean;
  onReady: () => void;
};

/** Says so once the first frame with everything in it has been drawn. */
function Ready({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 2) {
      onReady();
    }
  });
  return null;
}

/**
 * The phone hero's 3D: one transparent canvas over the whole screen, drawing
 * into the stage and each shelf holder wherever they sit on the page, so a
 * single WebGL context serves them all. Fixed, it sits under the header. It never takes a touch: the page
 * underneath handles those.
 */
export default function Showcase({
  stage,
  holders,
  staged,
  picked,
  turn,
  active,
  onReady,
}: ShowcaseProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-lvh sm:hidden" aria-hidden>
      <Canvas
        frameloop={active ? 'always' : 'never'}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        style={{ pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          {/* The desk's objects carry their colliders; paused, nothing moves them. */}
          <Physics paused>
            <View track={stage as RefObject<HTMLElement>} index={1}>
              <StageScene id={staged} turn={turn} />
            </View>
            {SHELF.map((id, i) => (
              <View key={id} track={holders[id] as RefObject<HTMLElement>} index={i + 2}>
                <HolderScene
                  id={id}
                  picked={picked.id === id}
                  spins={picked.id === id ? picked.spins : 0}
                  phase={i * 1.1}
                />
              </View>
            ))}
          </Physics>
          <Ready onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}
