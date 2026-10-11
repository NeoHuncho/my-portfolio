import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { textureScale, useDetailQuality } from '../quality';

export const sansFamily = GeistSans.style.fontFamily;
export const monoFamily = GeistMono.style.fontFamily;

type Draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

let fontsReady: Promise<unknown> | null = null;

function waitForFonts(): Promise<unknown> {
  if (!fontsReady) {
    fontsReady = Promise.all([
      document.fonts.load(`600 48px ${sansFamily}`),
      document.fonts.load(`600 48px ${monoFamily}`),
    ]).catch(() => undefined);
  }
  return fontsReady;
}

let inMemory: boolean | null = null;

/**
 * Whether a canvas repainted several times a second is better painted in
 * memory than on the graphics chip. Safari, and every browser on an iPhone
 * (all of them WebKit), uploads a canvas painted on the chip by reading it
 * back: two to three times slower than one painted in memory (5 ms against
 * under 2 for a 1024-pixel screen), and a read back caught mid-repaint showed
 * half-drawn screens on phones. Chrome is the other way round: there a canvas
 * on the chip copies across in a fraction of a millisecond.
 */
export function paintInMemory(): boolean {
  if (inMemory === null) {
    const agent = typeof navigator === 'undefined' ? '' : navigator.userAgent;
    // Chrome's own, headless or not, and Edge's, say Chrome/; Chrome on an iPhone says CriOS/.
    inMemory = /AppleWebKit/.test(agent) && !/(Chrome|Chromium)\//.test(agent);
  }
  return inMemory;
}

/**
 * A canvas for a screen that repaints often, and its texture: painted in
 * memory where that uploads faster (see paintInMemory). The screens are
 * opaque, so the texture takes the canvas's premultiplied colours as they
 * are, saving each upload a pass over every pixel.
 */
export function makeScreenTexture(width: number, height: number, anisotropy: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: paintInMemory() });
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.premultiplyAlpha = true;
  return { texture, ctx };
}

/** Disposes a component's own GPU resource when it is replaced or the component unmounts. */
export function useResourceDisposal(resource: { dispose: () => void }) {
  useEffect(() => () => resource.dispose(), [resource]);
}

/**
 * Draws a label onto a canvas texture, once the site fonts are loaded so the
 * 3D labels use the same typefaces as the page.
 */
export function useLabelTexture(width: number, height: number, draw: Draw, key: string) {
  // The scene renders on demand, so a repainted label has to ask for a frame.
  const invalidate = useThree((state) => state.invalidate);
  // Drawn at its base size, onto a canvas made sharper on devices that can take it.
  const scale = textureScale(useDetailQuality());
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    result.anisotropy = 4;
    return result;
    // The texture is recreated only when its size changes.
  }, [width, height, scale]);

  useEffect(() => {
    let cancelled = false;
    const paint = () => {
      const canvas = texture.image as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      if (!ctx || cancelled) {
        return;
      }
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, width, height);
      draw(ctx, width, height);
      texture.needsUpdate = true;
      invalidate();
    };
    paint();
    waitForFonts().then(paint);
    return () => {
      cancelled = true;
    };
    // `key` captures everything `draw` depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texture, key]);

  useResourceDisposal(texture);

  return texture;
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) {
    lines.push(line);
  }
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/\s+\S*$/, '')}…`;
    return kept;
  }
  return lines;
}
