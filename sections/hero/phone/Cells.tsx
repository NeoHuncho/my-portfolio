import { createContext, type ReactNode, type RefObject, useContext, useMemo, useRef } from 'react';
import { createPortal, useFrame } from '@react-three/fiber';
import { type PerspectiveCamera, Scene } from 'three';

/** Its first frames draw every cell, seen or not, so all of them are ready before they scroll in. */
const WARM_FRAMES = 2;
/** Cells this close to the screen, or to what clips them, are drawn already, so they never come in blank. */
const AHEAD = 160;

const Warm = createContext<RefObject<number>>({ current: 0 });

/** Wipes the whole canvas once a frame, before the cells draw into it. */
function ClearCells({ framesRef }: { framesRef: RefObject<number> }) {
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.clear(true, true, true);
    framesRef.current += 1;
  }, 1);
  return null;
}

/** Holds the cells of one canvas: wipes it each frame, then lets them draw. */
export function CellLayer({ children }: { children: ReactNode }) {
  const frames = useRef(0);
  return (
    <Warm.Provider value={frames}>
      <ClearCells framesRef={frames} />
      {children}
    </Warm.Provider>
  );
}

function CellDraw({
  track,
  index,
  children,
}: {
  track: RefObject<HTMLElement | null>;
  index: number;
  children: ReactNode;
}) {
  const warm = useContext(Warm);
  useFrame((state) => {
    const element = track.current;
    if (!element) {
      return;
    }
    const warming = warm.current <= WARM_FRAMES;
    // Both boxes are read in the same frame, so scrolling the page moves neither against the other.
    const canvas = state.gl.domElement.getBoundingClientRect();
    const box = element.getBoundingClientRect();
    const left = box.left - canvas.left;
    const bottom = canvas.bottom - box.bottom;
    const { width, height } = box;
    // Out of sight is not drawn: well off the screen, or scrolled well out of whatever clips the canvas.
    const clip = element.closest('[data-cell-clip]')?.getBoundingClientRect();
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
    <CellDraw track={track} index={index}>
      {children}
    </CellDraw>,
    scene,
    { events: { enabled: false, priority: 0 } }
  );
}
