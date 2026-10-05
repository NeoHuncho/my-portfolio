import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

/** Time the page keeps to itself after `load`, while the hero's desk mounts. */
const GRACE_MS = 1500;

type Connection = { saveData?: boolean; effectiveType?: string };

/**
 * Starts heavy embeds early without delaying the page: once it has loaded, after a short
 * grace and when the browser is idle, so they are ready by the time the visitor scrolls to
 * them. With Save-Data or a 2G connection they wait until the visitor is a screen away.
 */
export function useEarlyLoad() {
  const { ref, inView: near } = useInView({ triggerOnce: true, rootMargin: '100% 0px' });
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    const { connection } = navigator as Navigator & { connection?: Connection };
    if (connection?.saveData || /2g$/.test(connection?.effectiveType ?? '')) {
      return undefined;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;
    const start = () => {
      timer = setTimeout(() => {
        if ('requestIdleCallback' in window) {
          idleId = window.requestIdleCallback(() => setIdle(true), { timeout: 3000 });
        } else {
          setIdle(true);
        }
      }, GRACE_MS);
    };
    if (document.readyState === 'complete') {
      start();
    } else {
      window.addEventListener('load', start, { once: true });
    }
    return () => {
      window.removeEventListener('load', start);
      clearTimeout(timer);
      if (idleId !== undefined) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, []);

  return { ref, load: idle || near };
}
