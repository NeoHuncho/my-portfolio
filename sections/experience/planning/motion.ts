import { useEffect, useRef, useState } from 'react';
import { type Locale } from '@config/translations';

/** Every slide draws itself from `t`, the seconds since it became visible (Infinity = final state). */
export type SlideProps = { t: number; w: number; h: number; locale: Locale };

export const colors = {
  p1: '#ff6b35',
  p2: '#5b9cff',
  p3: '#3fcf8e',
  violet: '#a78bfa',
  gold: '#e2c08d',
  red: '#ff5d5d',
  ok: '#4ade9f',
  salary: 'rgb(255 255 255 / 0.11)',
  paper: '#e7e7e4',
  paperInk: '#131316',
} as const;

/** Geist Mono advances 0.6em per character, so chip widths can be computed. */
export const monoWidth = (text: string, size: number) => text.length * size * 0.6;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const easeOut = (p: number) => 1 - (1 - clamp01(p)) ** 3;

export const easeInOut = (p: number) => {
  const x = clamp01(p);
  return x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2;
};

export const linear = clamp01;

/** Progress 0 → 1 of a step starting at `start` seconds. */
export const phase = (t: number, start: number, duration: number, easing = easeOut) =>
  easing((t - start) / duration);

export const lerp = (from: number, to: number, p: number) => from + (to - from) * p;

/** 0 → 1 → 0 over the duration: a press or a flash. */
export const pulse = (t: number, start: number, duration: number) => {
  const p = (t - start) / duration;
  return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p);
};

/** Swiss thousands separator: 8’450. */
export const chf = (value: number) =>
  Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '’');

/** Seconds since the slide started, advanced on animation frames while `running`. */
export function useSlideClock(slide: number, running: boolean, end: number): number {
  const [time, setTime] = useState(0);
  const elapsed = useRef(0);

  useEffect(() => {
    elapsed.current = 0;
    setTime(0);
  }, [slide]);

  useEffect(() => {
    if (!running || elapsed.current >= end) {
      return;
    }
    let frame = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      if (last !== null) {
        elapsed.current = Math.min(end, elapsed.current + Math.min(0.1, (now - last) / 1000));
      }
      last = now;
      setTime(elapsed.current);
      if (elapsed.current < end) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [slide, running, end]);

  return time;
}

/** Content-box size of an element, kept up to date with a ResizeObserver. */
export function useElementSize<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!node) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      setSize({
        w: Math.round(entry.contentRect.width),
        h: Math.round(entry.contentRect.height),
      });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return [setNode, size] as const;
}
