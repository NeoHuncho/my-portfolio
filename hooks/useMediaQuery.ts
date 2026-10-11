import { useCallback, useSyncExternalStore } from 'react';

function getServerSnapshot(): boolean {
  return false;
}

/**
 * One list per query for the whole page: React reads the snapshot on every
 * render, and an animation that renders every frame (the planning slideshow)
 * made a new one each time, a style lookup of its own.
 */
const lists = new Map<string, MediaQueryList>();

function listFor(query: string): MediaQueryList {
  let list = lists.get(query);
  if (!list) {
    list = window.matchMedia(query);
    lists.set(query, list);
  }
  return list;
}

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mediaQuery = listFor(query);
      mediaQuery.addEventListener('change', callback);
      return () => mediaQuery.removeEventListener('change', callback);
    },
    [query]
  );

  const getSnapshot = useCallback(() => listFor(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
