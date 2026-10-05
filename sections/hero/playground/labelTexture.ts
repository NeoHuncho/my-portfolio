import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { CanvasTexture, SRGBColorSpace } from 'three';

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

/**
 * Draws a label onto a canvas texture, once the site fonts are loaded so the
 * 3D labels use the same typefaces as the page.
 */
export function useLabelTexture(width: number, height: number, draw: Draw, key: string) {
  // The scene renders on demand, so a repainted label has to ask for a frame.
  const invalidate = useThree((state) => state.invalidate);
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    result.anisotropy = 4;
    return result;
    // The texture is recreated only when its size changes.
  }, [width, height]);

  useEffect(() => {
    let cancelled = false;
    const paint = () => {
      const canvas = texture.image as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      if (!ctx || cancelled) {
        return;
      }
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

  useEffect(() => () => texture.dispose(), [texture]);

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
