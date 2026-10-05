// Portfolio embed: the page loads its game frames early, before the visitor scrolls to them,
// and Gamehub's 3D tables draw every animation frame. Once a frame has had a few seconds to
// load and draw its table (shaders compiled, models up), it rests whenever it is scrolled out
// of view: the page reads as hidden to Gamehub (which pauses its tables and ambience, as for a
// background tab) and animation frames wait until it is back in view.
// Copied into the Gamehub worktree by scripts/build-games.mjs (not part of Gamehub itself).

/** Time from the frame's start during which it always runs, to load and draw its table. */
const WARM_UP_MS = 6000;

export function restWhileOutOfView() {
  if (window.parent === window || typeof IntersectionObserver === 'undefined') return;

  let inView = true;
  let warm = false;
  const resting = () => warm && !inView;

  // document.hidden and visibilityState: the tab's, or hidden while the frame rests.
  const proto = Document.prototype;
  const hidden = Object.getOwnPropertyDescriptor(proto, 'hidden')?.get;
  const state = Object.getOwnPropertyDescriptor(proto, 'visibilityState')?.get;
  if (hidden && state) {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => resting() || hidden.call(document),
    });
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => (resting() ? 'hidden' : state.call(document)),
    });
  }

  // Animation frames requested while resting run once the frame is back in view.
  const native = window.requestAnimationFrame.bind(window);
  const cancelNative = window.cancelAnimationFrame.bind(window);
  type Entry = { callback: FrameRequestCallback; frame?: number };
  const queued = new Map<number, Entry>();
  let nextId = 0;
  const run = (id: number, entry: Entry) => {
    entry.frame = native((time) => {
      queued.delete(id);
      entry.callback(time);
    });
  };
  window.requestAnimationFrame = (callback) => {
    const id = ++nextId;
    const entry: Entry = { callback };
    queued.set(id, entry);
    if (!resting()) run(id, entry);
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    const entry = queued.get(id);
    if (entry?.frame !== undefined) cancelNative(entry.frame);
    queued.delete(id);
  };

  let was = resting();
  const update = () => {
    const now = resting();
    if (now === was) return;
    was = now;
    if (!now) for (const [id, entry] of queued) if (entry.frame === undefined) run(id, entry);
    document.dispatchEvent(new Event('visibilitychange'));
  };
  setTimeout(() => {
    warm = true;
    update();
  }, Math.max(0, WARM_UP_MS - performance.now()));
  // With no root, an observer inside a frame measures against the top page's viewport.
  new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      update();
    },
    { rootMargin: '200px' }
  ).observe(document.documentElement);
}
