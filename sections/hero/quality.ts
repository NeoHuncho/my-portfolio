import { type RefObject, useEffect, useState, useSyncExternalStore } from 'react';

/**
 * How much the hero's 3D asks of this device. A first guess comes from the
 * graphics chip and the machine, before anything is drawn. While the 3D runs,
 * frames that keep coming late step it down, for good; frames that keep coming
 * right on time step it up, as far as the device's ceiling (`ultra`, up to 4K
 * of pixels, only on strong computers; phones and tablets stop at `high`).
 */
export type Quality = 'low' | 'medium' | 'high' | 'ultra';

const ORDER: Quality[] = ['low', 'medium', 'high', 'ultra'];

/** Drawn in software: no real graphics chip at all. */
const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render/i;
/** Older or entry-level chips: phones' small Mali, Adreno and PowerVR, Intel's HD and UHD laptops. */
const WEAK =
  /mali-(4\d\d|t\d+|g[1-5]\d|g7[12])\b|adreno\D*[1-5]\d\d\b|powervr|videocore|intel.*\b(hd|uhd) graphics|\bgma\b/i;
/** Chips with room to spare: Apple silicon, discrete cards, recent flagship phones. */
const STRONG =
  /apple m\d|geforce|rtx|radeon (pro|rx)|\brx \d{4}|intel.*\barc\b|adreno\D*(7[3-9]\d|8\d\d)|immortalis|mali-g[7-9]\d\d/i;

type Probe = { webgl: boolean; quality: Quality };

let probed: Probe | null = null;
let current: Quality = 'medium';
/** As high as this device may climb. */
let ceiling: Quality = 'medium';
/** Asked for in the address: it stays, however frames come. */
let pinned = false;
/** Stepped down once: it never climbs again, so it cannot see-saw. */
let lowered = false;
const listeners = new Set<() => void>();

function rendererOf(gl: WebGL2RenderingContext): string {
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  return String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? '');
}

/** Phones and tablets: their screens are small, so they never need more than `high`. */
function isTouch() {
  return window.matchMedia('(pointer: coarse)').matches;
}

function guess(renderer: string): Quality {
  const { hardwareConcurrency: cores = 4, deviceMemory: memory } = navigator as Navigator & {
    deviceMemory?: number;
  };
  const touch = isTouch();
  if (SOFTWARE.test(renderer) || WEAK.test(renderer) || cores <= 2 || (memory ?? 8) <= 2) {
    return 'low';
  }
  // Safari only says "Apple GPU": on a Mac that is Apple silicon, on a phone it could be an old one.
  const appleGpu = /apple gpu/i.test(renderer);
  if (STRONG.test(renderer) || (appleGpu && !touch)) {
    return touch && (memory ?? 8) < 6 ? 'medium' : 'high';
  }
  // Four threads or fewer, outside Apple's: an entry-level laptop or an older phone.
  if (!appleGpu && cores <= 4) {
    return 'low';
  }
  return 'medium';
}

/** Whether WebGL works here, and the first guess at what the device can take. Asked once a page. */
export function probeGraphics(): Probe {
  if (probed) {
    return probed;
  }
  let webgl = false;
  let renderer = '';
  try {
    // Three needs WebGL 2: with only WebGL 1, the stills stand in for good.
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (gl) {
      webgl = true;
      renderer = rendererOf(gl);
      // Only a question: its context goes back straight away, never counting against the page's.
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch (_error) {
    webgl = false;
  }
  // `?quality=low` (or medium, high) tries a setting on any device, and keeps it there.
  const asked = new URLSearchParams(window.location.search).get('quality') as Quality | null;
  const forced = asked && ORDER.includes(asked) ? asked : null;
  current = forced ?? (webgl ? guess(renderer) : 'low');
  pinned = forced !== null;
  // A computer that starts at `high` may earn `ultra`; anything else may earn one step.
  if (current === 'high') {
    ceiling = isTouch() ? 'high' : 'ultra';
  } else {
    ceiling = current === 'low' ? 'medium' : 'high';
    if (isTouch() || !webgl || SOFTWARE.test(renderer)) {
      ceiling = current;
    }
  }
  probed = { webgl, quality: current };
  listeners.forEach((listener) => listener());
  return probed;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The quality to draw at now, for every canvas of the hero. */
export function useQuality(): Quality {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => 'medium'
  );
}

function lower() {
  const index = ORDER.indexOf(current);
  if (index > 0) {
    current = ORDER[index - 1];
    lowered = true;
    listeners.forEach((listener) => listener());
  }
}

function raise() {
  const index = ORDER.indexOf(current);
  if (index < ORDER.indexOf(ceiling)) {
    current = ORDER[index + 1];
    listeners.forEach((listener) => listener());
  }
}

/** Frames this long or longer, most of the time, mean the device is struggling. */
const LATE_MEDIAN_MS = 26;
const LATE_TAIL_MS = 45;
/** Every frame on a 60 Hz beat or better, even the slowest few: there is room to spare. */
const SMOOTH_MEDIAN_MS = 17.5;
const SMOOTH_TAIL_MS = 20;
/** Stretches in a row that earn a step up: about four seconds at 60 Hz. */
const SMOOTH_STRIKES = 3;
const WINDOW = 90;
/** Nothing counts in the first moments, while the page is still busy loading. */
const SETTLE_MS = 2500;

const watch = { last: 0, from: 0, samples: [] as number[], strikes: 0, smooth: 0 };

/**
 * Called on every animation frame by whatever keeps a canvas drawing. The
 * browser slows its frames down when the graphics chip cannot keep up: two
 * slow stretches in a row step the quality down.
 */
export function watchFrame(now: number) {
  // Several canvases share the frame: count it once.
  if (pinned || now === watch.last) {
    return;
  }
  const delta = now - watch.last;
  watch.last = now;
  if (watch.from === 0) {
    watch.from = now + SETTLE_MS;
  }
  // A hidden tab, or the page paused for a moment: start the stretch over.
  if (now < watch.from || delta > 250) {
    watch.samples.length = 0;
    return;
  }
  watch.samples.push(delta);
  if (watch.samples.length < WINDOW) {
    return;
  }
  const sorted = watch.samples.sort((a, b) => a - b);
  const median = sorted[Math.floor(WINDOW / 2)];
  const tail = sorted[Math.floor(WINDOW * 0.9)];
  const late = median > LATE_MEDIAN_MS || tail > LATE_TAIL_MS;
  const smooth = median <= SMOOTH_MEDIAN_MS && tail <= SMOOTH_TAIL_MS;
  watch.samples.length = 0;
  watch.strikes = late ? watch.strikes + 1 : 0;
  watch.smooth = smooth && !lowered ? watch.smooth + 1 : 0;
  if (watch.strikes >= 2) {
    watch.strikes = 0;
    // Give the lighter setting a moment before judging it.
    watch.from = now + SETTLE_MS;
    lower();
  } else if (watch.smooth >= SMOOTH_STRIKES) {
    watch.smooth = 0;
    // The sharper setting has to prove itself too: late frames from here step it back down.
    watch.from = now + SETTLE_MS;
    raise();
  }
}

/**
 * How many pixels a canvas may draw, at most, by quality: `ultra` goes up to
 * 4K, the rest to 1440p, 1080p and 720p. Phones and tablets get less again:
 * their screens are small and dense enough that the difference does not show.
 */
const PIXEL_BUDGET: Record<Quality, number> = {
  ultra: 3840 * 2160,
  high: 2560 * 1440,
  medium: 1920 * 1080,
  low: 1280 * 720,
};

/**
 * The pixel ratio to draw a canvas of this CSS size at: the device's own, at
 * most `max`, and no more than the quality's budget of pixels.
 */
export function budgetDpr(quality: Quality, max: number, width: number, height: number): number {
  const screen = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
  const budget = PIXEL_BUDGET[quality] * (isTouch() ? 0.6 : 1);
  const area = Math.max(1, width * height);
  return Math.max(1, Math.min(max, screen, Math.sqrt(budget / area)));
}

/**
 * `budgetDpr` for a canvas, kept up to date as it is resized or the window
 * moves to a screen of another density. Measured on `target` once it is on
 * the page; till then, and without one, the window's size stands in.
 */
export function useBudgetDpr(
  quality: Quality,
  max: number,
  target?: RefObject<HTMLElement | null>
): number {
  const [dpr, setDpr] = useState(() =>
    typeof window === 'undefined'
      ? 1
      : budgetDpr(quality, max, window.innerWidth, window.innerHeight)
  );
  useEffect(() => {
    const element = target?.current;
    const update = () =>
      setDpr(
        element && element.clientWidth > 0
          ? budgetDpr(quality, max, element.clientWidth, element.clientHeight)
          : budgetDpr(quality, max, window.innerWidth, window.innerHeight)
      );
    update();
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    if (element && resize) {
      resize.observe(element);
    } else {
      window.addEventListener('resize', update);
    }
    // Dragged to a screen of another density: the ratio changes without a resize.
    // Each query matches one density only, so a new one is asked after every change.
    let density: MediaQueryList | null = null;
    const watchDensity = () => {
      density?.removeEventListener('change', onDensity);
      density = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      density.addEventListener('change', onDensity);
    };
    function onDensity() {
      update();
      watchDensity();
    }
    watchDensity();
    return () => {
      resize?.disconnect();
      window.removeEventListener('resize', update);
      density?.removeEventListener('change', onDensity);
    };
  }, [quality, max, target]);
  return dpr;
}

/** How much sharper the desk's drawn screens and labels are made than their base size. */
export function textureScale(quality: Quality): number {
  if (quality === 'ultra') {
    return 2;
  }
  return quality === 'high' ? 1.5 : 1;
}

/**
 * What each canvas draws at, by quality: how sharp (device pixels per CSS
 * pixel, at most), how often things that move on their own are redrawn, and
 * the desk's shadow detail. Interaction (dragging, throwing) always runs at
 * the screen's own rate.
 */
export const SETTINGS = {
  desk: {
    // As fast as the screen goes (120 Hz and up), as sharp as the screen is, up to 4K.
    ultra: { dpr: 3, fps: 240, shadowMap: 4096, shadowEvery: 1 },
    high: { dpr: 2, fps: 60, shadowMap: 2048, shadowEvery: 1 },
    medium: { dpr: 1.5, fps: 30, shadowMap: 1024, shadowEvery: 1 },
    low: { dpr: 1, fps: 24, shadowMap: 512, shadowEvery: 2 },
  },
  /** The desk's tray of pieces: at low quality, still pictures only. */
  tray: {
    ultra: { dpr: 3, fps: 240, live: true },
    high: { dpr: 2, fps: 60, live: true },
    medium: { dpr: 1.5, fps: 30, live: true },
    low: { dpr: 1, fps: 24, live: false },
  },
  /** The phone's turntable, which follows a finger. */
  stage: {
    ultra: { dpr: 3, fps: 240 },
    high: { dpr: 2.5, fps: 60 },
    medium: { dpr: 2, fps: 60 },
    low: { dpr: 1.5, fps: 30 },
  },
  /** The phone's shelf of small pieces. */
  shelf: {
    ultra: { dpr: 3, fps: 240 },
    high: { dpr: 2, fps: 60 },
    medium: { dpr: 1.5, fps: 30 },
    low: { dpr: 1.25, fps: 30 },
  },
} as const;
