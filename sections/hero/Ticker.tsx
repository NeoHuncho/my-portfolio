import { useEffect, useLayoutEffect, useRef } from 'react';
import { advance, useFrame, useThree } from '@react-three/fiber';
import { watchFrame } from './quality';

/** A frame this close to due still counts, so one that lands just short is not skipped. */
const SLACK_MS = 2;

/**
 * Draws its canvas `fps` times a second while it is mounted, for whatever
 * moves on its own, and tells the quality watch how the browser is keeping
 * up. A screen's own rate is never exceeded: on a 60 Hz screen, 60 fps is
 * every frame and 30 fps every other one. It draws straight away on the
 * screen frame it is due, never a frame late, and not twice in one frame
 * when something moving has already had it drawn, or is about to.
 *
 * A canvas whose own loop is off (`frameloop="never"`) draws only here, so
 * nothing can draw it faster than `fps`, however often it asks.
 */
export default function Ticker({ fps }: { fps: number }) {
  const get = useThree((state) => state.get);
  const drawn = useRef(0);
  useFrame(() => {
    drawn.current = performance.now();
  });
  // Whatever moves on its own goes on from where it stopped: time spent not drawing (scrolled
  // away, or held for a handover) never shows as a jump in the pieces' own animations. With its
  // own loop off, the canvas leaves its clock stopped, and a stopped clock never starts itself.
  useLayoutEffect(() => {
    const { clock } = get();
    if (clock.running) {
      clock.oldTime = performance.now();
    } else {
      clock.start();
    }
  }, [get]);
  useEffect(() => {
    const interval = 1000 / fps;
    let frame = 0;
    let due = 0;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      watchFrame(now);
      if (now < due - SLACK_MS) {
        return;
      }
      // On the beat, unless a pause (a hidden tab) has put it well behind.
      due = now - due > interval ? now + interval : due + interval;
      const state = get();
      // Drawn already this screen frame (it began at `now`), or about to be: once is enough.
      if (drawn.current >= now || state.internal.frames > 0) {
        return;
      }
      // No time given: the canvas's clock keeps counting seconds. With its own loop off,
      // the canvas would take a given time, in milliseconds, for its clock's reading.
      advance(undefined as unknown as number, false, state);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [fps, get]);
  return null;
}
