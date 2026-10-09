import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

/** Scrolled this share of a screen down, the visitor has left the hero's desk behind. */
const PAST_HERO = 0.75;

type Connection = { saveData?: boolean; effectiveType?: string };

/**
 * Starts heavy embeds early without slowing the hero: once the visitor has scrolled past it,
 * when the browser is idle, so they are ready by the time the visitor reaches them. The games
 * are same-origin iframes, which run on the page's own main thread: started while the desk is
 * in play, they made it stutter for its first few seconds. With Save-Data or a 2G connection
 * they wait until the visitor is a screen away.
 */
export function useEarlyLoad() {
  const { ref, inView: near } = useInView({ triggerOnce: true, rootMargin: '100% 0px' });
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    const { connection } = navigator as Navigator & { connection?: Connection };
    if (connection?.saveData || /2g$/.test(connection?.effectiveType ?? '')) {
      return undefined;
    }
    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(() => setIdle(true), { timeout: 3000 });
      } else {
        timer = setTimeout(() => setIdle(true), 200);
      }
    };
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * PAST_HERO) {
        window.removeEventListener('scroll', onScroll);
        start();
      }
    };
    // Also when the page opens already scrolled down, from a link or a reload.
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
      if (idleId !== undefined) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, []);

  return { ref, load: idle || near };
}
