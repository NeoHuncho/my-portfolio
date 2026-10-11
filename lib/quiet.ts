/**
 * Animations playing on screen, which heavy background work waits for. The side projects' games
 * boot on the page's own main thread: started while the planning slideshow played its first
 * slide, they made it stutter.
 */
let holds = 0;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

/** Marks an animation as playing; call the returned function once it stops. */
export function holdQuiet(): () => void {
  holds += 1;
  notify();
  let released = false;
  return () => {
    if (!released) {
      released = true;
      holds -= 1;
      notify();
    }
  };
}

export const isQuiet = () => holds === 0;

export function subscribeQuiet(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
