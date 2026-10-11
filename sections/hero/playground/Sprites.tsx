import { type ReactNode, Suspense, useCallback, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useLanguage } from '@hooks/useLanguage';
import { type ExhibitId, SHELF, shelfPhase, SHIFTS, thumbPhase } from '../phone/exhibitIds';
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
  'robot',
  'sport',
  'oss',
  'server',
  'keys',
  'strategy',
  'mountain',
  'flags',
];

const STILLS: Array<{ id: ExhibitId; place: 'stage' | 'shelf' | 'tray' }> = [
  ...SHIFTS.map((id) => ({ id, place: 'stage' as const })),
  ...SHELF.map((id) => ({ id, place: 'shelf' as const })),
  // The desk's tray, each piece at the angle its 3D starts turning from.
  ...TRAY.map((id) => ({ id, place: 'tray' as const })),
];

/** Long enough for the labels, painted once the site fonts are in, to be painted. */
const SETTLE_MS = 1500;

function Still({ id, place }: { id: ExhibitId; place: 'stage' | 'shelf' | 'tray' }) {
  if (place === 'stage') {
    return <StageScene id={id} still />;
  }
  if (place === 'tray') {
    return <ThumbScene id={id} phase={thumbPhase(id)} still />;
  }
  // The shelf opens with its first piece picked, its plinth lit up.
  return <HolderScene id={id} phase={shelfPhase(id)} picked={id === SHELF[0]} still />;
}

/**
 * Draws its canvas's first frame and nothing after: every piece at the very
 * start of its loop (bubbles, robot, board, screens), as the live 3D shows it
 * when it takes over from the still. Time stands at zero, so the few draws it
 * takes to upload every texture move nothing on. The screens keep their own
 * time (performance.now): that is held too, or a slow first draw (its shaders
 * compiling) would have them repaint a later moment on the next.
 */
function FirstFrame({ onDrawn }: { onDrawn: () => void }) {
  const advance = useThree((state) => state.advance);
  useEffect(() => {
    let live = true;
    let timer = 0;
    document.fonts.ready.then(() => {
      timer = window.setTimeout(() => {
        if (!live) {
          return;
        }
        const realNow = performance.now;
        const at = realNow.call(performance);
        performance.now = () => at;
        try {
          for (let i = 0; i < 3; i += 1) {
            advance(0);
          }
        } finally {
          performance.now = realNow;
        }
        onDrawn();
      }, SETTLE_MS);
    });
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [advance, onDrawn]);
  return null;
}

/** One still on its own transparent canvas, marked `data-drawn` once its frame is in. */
function Sprite({
  name,
  size,
  children,
}: {
  name: string;
  size: readonly [number, number];
  children: ReactNode;
}) {
  const [drawn, setDrawn] = useState(false);
  // The same callback every render: drawn once, never again.
  const onDrawn = useCallback(() => setDrawn(true), []);
  const [width, height] = size;
  return (
    <div data-sprite={name} data-drawn={drawn || undefined} style={{ width, height }}>
      <Canvas
        frameloop="never"
        dpr={1}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          {children}
          <FirstFrame onDrawn={onDrawn} />
        </Suspense>
      </Canvas>
    </div>
  );
}

/**
 * A browser keeps only so many WebGL canvases going at once (16 in Chrome):
 * `?only=stage`, `?only=shelf` or `?only=tray` shows one set at a time.
 * `?lang=fr` shows only the stills that change in French: the flags, French
 * first. Everything else is saved in English, whatever the browser's language.
 */
export default function Sprites() {
  const { locale } = useLanguage();
  const query = new URLSearchParams(window.location.search);
  const only = query.get('only');
  const french = query.get('lang') === 'fr';
  // The pieces are measured as they mount, so only in the language their names promise:
  // a French browser would otherwise put French first in the English flags.
  if (locale !== (french ? 'fr' : 'en')) {
    return <p className="p-6 text-sm text-muted">Open with ?lang={french ? 'fr' : 'en'}.</p>;
  }
  const stills = STILLS.filter(
    ({ id, place }) => (!only || place === only) && (!french || id === 'flags')
  );
  return (
    <div className="flex flex-wrap gap-4 p-6">
      {/* The phone's turntable of how I work, all three on it, the day shift in front. */}
      {!french && (!only || only === 'stage') && (
        <Sprite name="stage-trio" size={SIZES.trio}>
          <TrioScene step={0} still />
        </Sprite>
      )}
      {stills.map(({ id, place }) => (
        <Sprite
          key={`${place}-${id}`}
          name={`${place}-${id}${french ? '-fr' : ''}`}
          size={SIZES[place]}
        >
          <Still id={id} place={place} />
        </Sprite>
      ))}
    </div>
  );
}
