import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { useInView } from 'react-intersection-observer';
import { isQuiet, subscribeQuiet } from '@lib/quiet';

/** How long the page has to stop scrolling before a heavy embed may start. */
const SCROLL_PAUSE_MS = 250;

type Connection = { saveData?: boolean; effectiveType?: string };

/**
 * Starts heavy embeds a little before the visitor reaches them, without making the page
 * stutter on the way. The games are same-origin iframes, which run on the page's own main
 * thread: booting one mid-scroll (or while the phone's "More about me" shelf was being swiped)
 * froze the page for a second or more on a phone. So they start once the visitor is within
 * two and a half screens of them, at a pause in the scrolling, when the browser is idle and no
 * other animation plays on screen (see lib/quiet), such as the planning slideshow; at once
 * if they are already on screen. With Save-Data or a 2G connection they wait until they are
 * on screen.
 */
export function useEarlyLoad() {
  const { ref: nearRef, inView: near } = useInView({ triggerOnce: true, rootMargin: '250% 0px' });
  const { ref: shownRef, inView: shown } = useInView({ triggerOnce: true });
  const ref = useCallback(
    (node: Element | null) => {
      nearRef(node);
      shownRef(node);
    },
    [nearRef, shownRef]
  );
  const [load, setLoad] = useState(false);
  const quiet = useSyncExternalStore(subscribeQuiet, isQuiet, () => true);

  useEffect(() => {
    if (load) {
      return undefined;
    }
    if (shown) {
      setLoad(true);
      return undefined;
    }
    const { connection } = navigator as Navigator & { connection?: Connection };
    const sparing = connection?.saveData || /2g$/.test(connection?.effectiveType ?? '');
    if (!near || !quiet || sparing) {
      return undefined;
    }
    let timer = 0;
    let idle = 0;
    const cancelIdle = () => {
      if (idle && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idle);
      }
      idle = 0;
    };
    // Every scroll starts the wait over: only a pause lets it through.
    const wait = () => {
      window.clearTimeout(timer);
      cancelIdle();
      timer = window.setTimeout(() => {
        if ('requestIdleCallback' in window) {
          idle = window.requestIdleCallback(() => setLoad(true), { timeout: 1500 });
        } else {
          setLoad(true);
        }
      }, SCROLL_PAUSE_MS);
    };
    wait();
    window.addEventListener('scroll', wait, { passive: true });
    return () => {
      window.removeEventListener('scroll', wait);
      window.clearTimeout(timer);
      cancelIdle();
    };
  }, [load, shown, near, quiet]);

  return { ref, load };
}
