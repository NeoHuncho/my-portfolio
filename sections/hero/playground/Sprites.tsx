import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { type ExhibitId, SHELF, SHIFTS } from '../phone/exhibitIds';
import { HolderScene, StageScene } from '../phone/exhibits';

/**
 * Wider than any phone's stage or holder: shown cropped to the height, a
 * still frames its exhibit exactly as the live view does, whatever the width.
 */
const SIZES = { stage: [1040, 520], shelf: [440, 220] } as const;

const STILLS: Array<{ id: ExhibitId; place: 'stage' | 'shelf' }> = [
  ...SHIFTS.map((id) => ({ id, place: 'stage' as const })),
  ...SHELF.map((id) => ({ id, place: 'shelf' as const })),
];

export default function Sprites() {
  return (
    <div className="flex flex-wrap gap-4 p-6">
      {STILLS.map(({ id, place }) => {
        const [width, height] = SIZES[place];
        return (
          <div key={`${place}-${id}`} data-sprite={`${place}-${id}`} style={{ width, height }}>
            <Canvas dpr={1} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
              <Suspense fallback={null}>
                <Physics paused>
                  {place === 'stage' ? (
                    <StageScene id={id} still />
                  ) : (
                    <HolderScene id={id} phase={0.5} still />
                  )}
                </Physics>
              </Suspense>
            </Canvas>
          </div>
        );
      })}
    </div>
  );
}
