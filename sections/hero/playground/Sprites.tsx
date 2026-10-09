import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { type ExhibitId, SHELF, SHIFTS, thumbPhase } from '../phone/exhibitIds';
import { HolderScene, StageScene, ThumbScene, TrioScene } from '../phone/exhibits';

/**
 * Wider than any phone's stage or holder: shown cropped to the height, a
 * still frames its exhibit exactly as the live view does, whatever the width.
 * The tray's squares are square, three times their size on screen.
 */
const SIZES = {
  stage: [1040, 520],
  shelf: [440, 220],
  tray: [192, 192],
  trio: [1280, 640],
} as const;

const TRAY: ExhibitId[] = [
  'portrait',
  'flags',
  'mountain',
  'sport',
  'robot',
  'keys',
  'server',
  'oss',
];

const STILLS: Array<{ id: ExhibitId; place: 'stage' | 'shelf' | 'tray' }> = [
  ...SHIFTS.map((id) => ({ id, place: 'stage' as const })),
  ...SHELF.map((id) => ({ id, place: 'shelf' as const })),
  // The desk's tray, each piece at the angle its 3D starts turning from.
  ...TRAY.map((id) => ({ id, place: 'tray' as const })),
];

function Still({ id, place }: { id: ExhibitId; place: 'stage' | 'shelf' | 'tray' }) {
  if (place === 'stage') {
    return <StageScene id={id} still />;
  }
  if (place === 'tray') {
    return <ThumbScene id={id} phase={thumbPhase(id)} still />;
  }
  return <HolderScene id={id} phase={0.5} still />;
}

/**
 * A browser keeps only so many WebGL canvases going at once (16 in Chrome):
 * `?only=stage`, `?only=shelf` or `?only=tray` shows one set at a time.
 */
export default function Sprites() {
  const [trioWidth, trioHeight] = SIZES.trio;
  const only = new URLSearchParams(window.location.search).get('only');
  const stills = STILLS.filter(({ place }) => !only || place === only);
  return (
    <div className="flex flex-wrap gap-4 p-6">
      {/* The phone's turntable of how I work, all three on it, the day shift in front. */}
      {(!only || only === 'stage') && (
        <div data-sprite="stage-trio" style={{ width: trioWidth, height: trioHeight }}>
          <Canvas dpr={1} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
            <Suspense fallback={null}>
              <Physics paused>
                <TrioScene step={0} still />
              </Physics>
            </Suspense>
          </Canvas>
        </div>
      )}
      {stills.map(({ id, place }) => {
        const [width, height] = SIZES[place];
        return (
          <div key={`${place}-${id}`} data-sprite={`${place}-${id}`} style={{ width, height }}>
            <Canvas dpr={1} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
              <Suspense fallback={null}>
                <Physics paused>
                  <Still id={id} place={place} />
                </Physics>
              </Suspense>
            </Canvas>
          </div>
        );
      })}
    </div>
  );
}
