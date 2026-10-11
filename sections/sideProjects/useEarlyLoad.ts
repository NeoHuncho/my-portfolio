import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { useInView } from 'react-intersection-observer';
import { isQuiet, subscribeQuiet } from '@lib/quiet';

/** Scrolled this share of a screen down, the visitor has left the hero's desk behind. */
const PAST_HERO = 0.75;

type Connection = { saveData?: boolean; effectiveType?: string };

/**
 * Starts heavy embeds early without slowing the hero: once the visitor has scrolled past it,
 * when the browser is idle, so they are ready by the time the visitor reaches them. The games
 * are same-origin iframes, which run on the page's own main thread: started while the desk is
 * in play, they made it stutter for its first few seconds. They also wait while another
 * animation plays on screen (see lib/quiet), such as the planning slideshow right below the
 * hero, unless they are on screen themselves: the visitor is then waiting for them. With
 * Save-Data or a 2G connection they wait until the visitor is a screen away.
 */
export function useEarlyLoad() {
  const { ref: nearRef, inView: near } = useInView({ triggerOnce: true, rootMargin: '100% 0px' });
  const { ref: shownRef, inView: shown } = useInView({ triggerOnce: true });
  const ref = useCallback(
    (node: Element | null) => {
      nearRef(node);
      shownRef(node);
    },
    [nearRef, shownRef]
  );
  const [past, setPast] = useState(false);
  const [load, setLoad] = useState(false);
  const quiet = useSyncExternalStore(subscribeQuiet, isQuiet, () => true);

  useEffect(() => {
    const { connection } = navigator as Navigator & { connection?: Connection };
    if (connection?.saveData || /2g$/.test(connection?.effectiveType ?? '')) {
      return undefined;
    }
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * PAST_HERO) {
        window.removeEventListener('scroll', onScroll);
        setPast(true);
      }
    };
    // Also when the page opens already scrolled down, from a link or a reload.
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (load || !(past || near || shown)) {
      return undefined;
    }
    if (shown || (near && quiet)) {
      setLoad(true);
      return undefined;
    }
    if (!quiet) {
      return undefined;
    }
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setLoad(true), { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(() => setLoad(true), 200);
    return () => clearTimeout(timer);
  }, [load, shown, quiet, past, near]);

  return { ref, load };
}
