import { useEffect } from 'react';

/**
 * Links to a part of the page (`#experience`, the header's menu, the hero's
 * buttons) scroll there without writing it into the address bar: the page's
 * address, copied and sent on, opens it at the top. A part already in the
 * address (the page was opened from such a link) goes at the first click.
 * The page's smooth scroll, or none with reduced motion, and its room for the
 * header still apply. A click with a modifier key, or the middle button, is
 * left to the browser (a new tab, say).
 */
export default function InPageLinks() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }
      const link = event.target.closest('a[href^="#"]');
      if (!(link instanceof HTMLAnchorElement) || link.target) {
        return;
      }
      const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      if (!target) {
        return;
      }
      event.preventDefault();
      target.scrollIntoView({ block: 'start' });
      // Where the next Tab goes from, as after the jump a hash makes, without the jump.
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
        target.dataset.linkTarget = '';
      }
      target.focus({ preventScroll: true });
      if (window.location.hash) {
        window.history.replaceState(
          window.history.state,
          '',
          window.location.pathname + window.location.search
        );
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
