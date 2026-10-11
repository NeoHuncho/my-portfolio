// Portfolio embed: the library's gameplay footage loads late. The frames open on a Rota match,
// so the library (and its showcase) mounts only once the visitor goes back to it; even then the
// showcase shows each game's still first and starts loading its clip only after the library
// has been on screen for a moment (the frame in view of the page, the page visible). Gamehub's
// showcase (components/game/library-showcase.tsx, patched) waits on useFootageReady.
// Copied into the Gamehub worktree by scripts/build-games.mjs (not part of Gamehub itself).
import { useEffect, useState, type RefObject } from 'react';

/** How long the library is on screen before its first clip loads. */
const SETTLE_MS = 1200;

/** True once `ref` has been on screen for SETTLE_MS; it stays true. */
export function useFootageReady(ref: RefObject<Element | null>) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (ready || !el) return;
    let inView = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = () => {
      clearTimeout(timer);
      // document.hidden also reads true while the frame rests out of view (frame-visibility).
      if (inView && !document.hidden) timer = setTimeout(() => setReady(true), SETTLE_MS);
    };
    // With no root, an observer inside a frame measures against the top page's viewport.
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      check();
    });
    observer.observe(el);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener('visibilitychange', check);
    };
  }, [ref, ready]);
  return ready;
}
