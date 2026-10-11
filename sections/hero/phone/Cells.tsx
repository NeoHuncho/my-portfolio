import {
  createContext,
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { createPortal, useFrame, useThree } from '@react-three/fiber';
import { type Camera, type PerspectiveCamera, Scene } from 'three';

/** Its first frames draw every cell, seen or not, so all of them are ready before they scroll in. */
const WARM_FRAMES = 2;
/** Cells this close to the screen, or to what clips them, are drawn already, so they never come in blank. */
const AHEAD = 160;

/**
 * What every cell of the canvas measures against, read once a frame rather
 * than once a cell: the canvas's box, and the box of whatever clips each cell
 * (its scroller). How many frames have been drawn, for the first ones.
 */
type FrameBoxes = { frames: number; canvas: DOMRect | null; clips: Map<Element, DOMRect> };

const Shared = createContext<RefObject<FrameBoxes>>({
  current: { frames: 0, canvas: null, clips: new Map() },
});

/** Each cell's scene and its camera, so the canvas can compile them all before it draws any. */
export type CellScenes = Map<Scene, () => Camera>;
export const CellRegistry = createContext<CellScenes | null>(null);

/** Wipes the whole canvas once a frame, before the cells draw into it, and measures it. */
function ClearCells({ sharedRef }: { sharedRef: RefObject<FrameBoxes> }) {
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.clear(true, true, true);
    sharedRef.current.frames += 1;
    sharedRef.current.canvas = gl.domElement.getBoundingClientRect();
    sharedRef.current.clips.clear();
  }, 1);
  return null;
}

/** Holds the cells of one canvas: wipes it each frame, then lets them draw. */
export function CellLayer({ children }: { children: ReactNode }) {
  const shared = useRef<FrameBoxes>({ frames: 0, canvas: null, clips: new Map() });
  return (
    <Shared.Provider value={shared}>
      <ClearCells sharedRef={shared} />
      {children}
    </Shared.Provider>
  );
}

function CellDraw({
  scene,
  track,
  index,
  children,
}: {
  scene: Scene;
  track: RefObject<HTMLElement | null>;
  index: number;
  children: ReactNode;
}) {
  const shared = useContext(Shared);
  const registry = useContext(CellRegistry);
  // Whatever clips the cell (its scroller): found once, since the page never moves it.
  const clipper = useRef<Element | null | undefined>(undefined);
  const get = useThree((state) => state.get);
  useEffect(() => {
    registry?.set(scene, () => get().camera);
    return () => {
      registry?.delete(scene);
    };
  }, [registry, scene, get]);
  useFrame((state) => {
    const element = track.current;
    if (!element) {
      return;
    }
    const frame = shared.current;
    const warming = frame.frames <= WARM_FRAMES;
    // Both boxes are read in the same frame, so scrolling the page moves neither against the other.
    const canvas = frame.canvas ?? state.gl.domElement.getBoundingClientRect();
    const box = element.getBoundingClientRect();
    const left = box.left - canvas.left;
    const bottom = canvas.bottom - box.bottom;
    const { width, height } = box;
    // Out of sight is not drawn: well off the screen, or scrolled well out of whatever clips the canvas.
    if (clipper.current === undefined) {
      clipper.current = element.closest('[data-cell-clip]');
    }
    const clipping = clipper.current;
    let clip: DOMRect | undefined;
    if (clipping) {
      clip = frame.clips.get(clipping);
      if (!clip) {
        clip = clipping.getBoundingClientRect();
        frame.clips.set(clipping, clip);
      }
    }
    const seen = (from: number, to: number, min: number, max: number) =>
      to > min - AHEAD && from < max + AHEAD;
    const inCanvas =
      seen(box.left, box.right, canvas.left + AHEAD, canvas.right - AHEAD) &&
      seen(box.top, box.bottom, canvas.top + AHEAD, canvas.bottom - AHEAD);
    if (
      width <= 0 ||
      height <= 0 ||
      !inCanvas ||
      (!warming &&
        (!seen(box.left, box.right, 0, window.innerWidth) ||
          !seen(box.top, box.bottom, 0, window.innerHeight) ||
          (clip &&
            (!seen(box.left, box.right, clip.left, clip.right) ||
              !seen(box.top, box.bottom, clip.top, clip.bottom)))))
    ) {
      return;
    }
    const camera = state.camera as PerspectiveCamera;
    if (camera.isPerspectiveCamera && camera.aspect !== width / height) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    const { gl } = state;
    const { autoClear } = gl;
    gl.autoClear = false;
    gl.setViewport(left, bottom, width, height);
    gl.setScissor(left, bottom, width, height);
    gl.setScissorTest(true);
    gl.render(state.scene, camera);
    gl.setScissorTest(false);
    gl.autoClear = autoClear;
  }, index);
  return children;
}

/**
 * A scene of its own, drawn into the part of the canvas under `track`. Like
 * drei's View, but measured against the canvas itself every frame: the
 * canvas sits in the page with what it draws into, so the two scroll as one
 * and the drawing never trails behind, or vanishes, mid-scroll.
 */
export function Cell({
  track,
  index,
  children,
}: {
  track: RefObject<HTMLElement | null>;
  /** Draw order, from 2 up: 1 is the clear. */
  index: number;
  children: ReactNode;
}) {
  const scene = useMemo(() => new Scene(), []);
  return createPortal(
    <CellDraw scene={scene} track={track} index={index}>
      {children}
    </CellDraw>,
    scene,
    { events: { enabled: false, priority: 0 } }
  );
}
