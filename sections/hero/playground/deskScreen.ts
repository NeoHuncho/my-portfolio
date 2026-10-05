import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { monoFamily, sansFamily } from './labelTexture';

const W = 384;
const H = 216;
/** The status bar along the top, and the gaps between tiles. */
const BAR = 14;
const GAP = 5;
/** How long each workspace stays up; switching is an instant cut, like a keyboard shortcut. */
const WORKSPACE_MS = 4600;
/** How long the shortcut that switched shows in the corner. */
const HINT_MS = 900;
/** The screen is tiny on the page: a dozen repaints a second look smooth. */
const REPAINT_MS = 80;

const OK = '#3fcf8e';
const ACCENT = '#ff6b35';

type Ctx = CanvasRenderingContext2D;
/** Draws one app filling a w × h tile at the origin, `t` seconds after its workspace came up. */
type App = { title: string; draw: (ctx: Ctx, w: number, h: number, t: number) => void };

function bar(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function text(ctx: Ctx, value: string, x: number, y: number, color: string, font: string) {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.fillText(value, x, y);
}

/** The app's own header strip: a buffer tab, a prompt, a page title. Flat, no window buttons. */
function titleBar(ctx: Ctx, w: number, title: string, background: string, ink: string) {
  bar(ctx, 0, 0, w, 16, background);
  if (title) {
    text(ctx, title, 8, 8.5, ink, `500 7.5px ${monoFamily}`);
  }
}

const CODE_COLORS = ['#c792ea', '#82aaff', '#c3e88d', '#f78c6c', '#89ddff', '#d6d6dc'];
// [indent, width, colour] per line; a zero width is a blank line.
const CODE: Array<[number, number, number]> = [
  [0, 46, 0],
  [0, 96, 1],
  [1, 64, 5],
  [1, 118, 2],
  [2, 74, 3],
  [2, 52, 1],
  [1, 40, 5],
  [0, 20, 4],
  [0, 0, 0],
  [0, 58, 0],
  [1, 124, 1],
  [1, 84, 2],
  [0, 20, 4],
];

const editor: App = {
  title: 'nvim routes.ts',
  draw(ctx, w, h, t) {
    bar(ctx, 0, 0, w, h, '#121318');
    titleBar(ctx, w, ' routes.ts ', '#1c1d24', '#8b8d98');
    bar(ctx, 0, 16, 64, h - 16, '#17181e');
    for (let i = 0; i < 8; i += 1) {
      if (i === 3) {
        bar(ctx, 0, 24 + i * 13, 64, 11, '#262833');
      }
      bar(ctx, 8 + (i % 3 ? 7 : 0), 27 + i * 13, 30 + ((i * 17) % 18), 5, '#3a3c47');
    }
    // Lines type themselves out, then the cursor sits and blinks.
    const typed = t * 9;
    let cursor: [number, number] = [76, 24];
    CODE.forEach(([indent, width, color], i) => {
      const reveal = Math.min(1, Math.max(0, typed - i));
      const x = 76 + indent * 14;
      const y = 24 + i * 10;
      if (reveal > 0 && width > 0) {
        bar(ctx, x, y, width * reveal, 5, CODE_COLORS[color]);
      }
      if (reveal > 0) {
        cursor = [x + width * reveal + 2, y - 2];
      }
    });
    if (Math.floor(t * 2.4) % 2 === 0) {
      bar(ctx, cursor[0], cursor[1], 1.5, 9, '#ededeb');
    }
  },
};

const TESTS = ['routes.test.ts', 'auth.test.ts', 'board.test.ts', 'deliveries.test.ts'];

const terminal: App = {
  title: 'zsh: pnpm test',
  draw(ctx, w, h, t) {
    bar(ctx, 0, 0, w, h, '#0b0c0f');
    titleBar(ctx, w, '~/routes', '#16171c', '#6b6d78');
    const font = `500 8.5px ${monoFamily}`;
    const command = 'pnpm test';
    const chars = Math.min(command.length, Math.floor(t * 14));
    text(ctx, '$', 10, 30, OK, font);
    text(ctx, command.slice(0, chars), 20, 30, '#ededeb', font);
    const start = 1;
    TESTS.forEach((name, i) => {
      if (t > start + i * 0.45) {
        bar(ctx, 10, 40 + i * 13, 26, 10, OK);
        text(ctx, 'PASS', 13, 45.5 + i * 13, '#0b0c0f', `700 7.5px ${monoFamily}`);
        text(ctx, name, 42, 45.5 + i * 13, '#9b9ba3', font);
      }
    });
    if (t > start + TESTS.length * 0.45 + 0.3) {
      text(ctx, '✓ all checks passed', 10, 104, OK, `600 9px ${monoFamily}`);
    } else if (chars === command.length) {
      // A spinner while the suite runs.
      const dots = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏';
      text(ctx, dots[Math.floor(t * 12) % dots.length], 10, 104, '#9b9ba3', font);
    }
  },
};

const PLAN = ['Read the routes query', 'Batch the stop lookups', 'Add a regression test'];

const agent: App = {
  title: 'agent: PERF-31',
  draw(ctx, w, h, t) {
    bar(ctx, 0, 0, w, h, '#141210');
    titleBar(ctx, w, 'agent · PERF-31', '#1e1b18', '#8b8d98');
    const font = `500 8.5px ${monoFamily}`;
    // The request, then the agent's plan ticking off one step at a time.
    bar(ctx, 10, 24, w - 20, 18, '#262220');
    text(ctx, '> fix the N+1 on the routes list', 16, 33.5, '#ededeb', font);
    const spinner = '✻✼✽✾';
    PLAN.forEach((step, i) => {
      const shown = t > 0.6 + i * 0.35;
      if (!shown) {
        return;
      }
      const done = t > 1.6 + i * 0.8;
      const y = 56 + i * 14;
      text(
        ctx,
        done ? '✓' : spinner[Math.floor(t * 8) % spinner.length],
        12,
        y,
        done ? OK : ACCENT,
        font
      );
      text(ctx, step, 24, y, done ? '#9b9ba3' : '#ededeb', font);
    });
    if (t > 1.6 + PLAN.length * 0.8) {
      text(ctx, 'Ready for review: PR #524', 12, 56 + PLAN.length * 14 + 6, ACCENT, font);
    }
  },
};

const browser: App = {
  title: 'localhost:3000',
  draw(ctx, w, h, t) {
    bar(ctx, 0, 0, w, h, '#f4f2ed');
    titleBar(ctx, w, '', '#e2e0db', '#55555c');
    bar(ctx, 60, 4, w - 120, 9, '#f8f7f4');
    ctx.textAlign = 'center';
    text(ctx, 'localhost:3000', w / 2, 8.8, '#6b6b73', `500 6.5px ${monoFamily}`);
    ctx.textAlign = 'left';
    // Loads, then scrolls down the page a little.
    const load = Math.min(1, t / 0.7);
    if (load < 1) {
      bar(ctx, 0, 16, w * load, 2, '#5b9cff');
      return;
    }
    const scroll = Math.min(60, Math.max(0, (t - 1.6) * 28));
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 16, w, h - 16);
    ctx.clip();
    ctx.translate(0, -scroll);
    bar(ctx, 18, 28, 120, 10, '#17171b');
    bar(ctx, 18, 44, 180, 5, '#9b9ba3');
    bar(ctx, 18, 53, 150, 5, '#9b9ba3');
    bar(ctx, 18, 66, 44, 12, '#ff6b35');
    for (let i = 0; i < 6; i += 1) {
      const x = 18 + (i % 3) * ((w - 36) / 3);
      const y = 92 + Math.floor(i / 3) * 56;
      bar(ctx, x, y, (w - 36) / 3 - 8, 48, '#e6e3dc');
      bar(ctx, x + 6, y + 34, 40, 4, '#9b9ba3');
    }
    ctx.restore();
  },
};

const DIFF: Array<[number, number]> = [
  [0, 120],
  [-1, 96],
  [1, 132],
  [1, 88],
  [0, 70],
  [-1, 60],
  [1, 110],
  [0, 90],
];

const review: App = {
  title: 'PR #521',
  draw(ctx, w, h, t) {
    bar(ctx, 0, 0, w, h, '#0f1114');
    titleBar(ctx, w, 'PR #521 · Bulk reassign deliveries', '#181b20', '#8b8d98');
    DIFF.forEach(([sign, width], i) => {
      const y = 24 + i * 10;
      if (sign !== 0) {
        const added = sign > 0;
        bar(ctx, 0, y - 2, w, 9, added ? 'rgb(63 207 142 / 0.14)' : 'rgb(255 93 93 / 0.14)');
        text(ctx, added ? '+' : '−', 6, y + 2.5, added ? OK : '#ff5d5d', `600 8px ${monoFamily}`);
      }
      bar(ctx, 18, y, width, 5, sign === 0 ? '#5a5d66' : '#c5c8cf');
    });
    // My review, then the approval.
    const approved = t > 2;
    bar(ctx, w - 88, h - 22, 78, 15, approved ? OK : '#2a2e35');
    ctx.textAlign = 'center';
    text(
      ctx,
      approved ? '✓ Approved' : 'Review',
      w - 49,
      h - 14,
      approved ? '#0b0c0f' : '#c5c8cf',
      `600 8px ${sansFamily}`
    );
    ctx.textAlign = 'left';
  },
};

/** Each workspace tiles its windows side by side; the share is each one's width, the last one is focused. */
const WORKSPACES: Array<Array<[App, number]>> = [
  [
    [editor, 0.6],
    [terminal, 0.4],
  ],
  [[agent, 1]],
  [[browser, 1]],
  [[review, 1]],
];

/** Voice to text, always listening along the bottom of the screen: I dictate as much as I type. */
function drawDictation(ctx: Ctx, seconds: number) {
  const w = 92;
  const h = 20;
  const x = (W - w) / 2;
  const y = H - GAP - h - 6;
  ctx.fillStyle = 'rgb(8 9 11 / 0.92)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fill();
  ctx.strokeStyle = '#3a3c47';
  ctx.lineWidth = 1;
  ctx.stroke();
  // A pulsing record dot, then bars that swell and fall like a voice.
  ctx.fillStyle = ACCENT;
  ctx.globalAlpha = 0.6 + 0.4 * Math.sin(seconds * 5);
  ctx.beginPath();
  ctx.arc(x + 11, y + h / 2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ededeb';
  for (let i = 0; i < 16; i += 1) {
    const level = 0.5 + 0.5 * Math.sin(seconds * 9 + i * 1.7) * Math.sin(seconds * 2.3 + i * 0.6);
    const bar = 2 + level * (h - 8);
    ctx.fillRect(x + 22 + i * 4.2, y + (h - bar) / 2, 2, bar);
  }
}

function drawScreen(ctx: Ctx, now: number) {
  const step = Math.floor(now / WORKSPACE_MS);
  const into = now - step * WORKSPACE_MS;
  const active = step % WORKSPACES.length;
  const windows = WORKSPACES[active];
  const t = into / 1000;

  ctx.textBaseline = 'middle';
  bar(ctx, 0, 0, W, H, '#0e0f13');

  // Tiles, gaps all round, the focused one framed in the accent colour.
  const top = BAR + GAP;
  const height = H - top - GAP;
  const width = W - GAP * (windows.length + 1);
  let x = GAP;
  windows.forEach(([app, share], i) => {
    const w = Math.round(width * share);
    const focused = i === windows.length - 1;
    ctx.save();
    ctx.translate(x, top);
    ctx.beginPath();
    ctx.roundRect(0, 0, w, height, 3);
    ctx.clip();
    app.draw(ctx, w, height, t);
    ctx.restore();
    ctx.strokeStyle = focused ? ACCENT : '#2c2e37';
    ctx.lineWidth = focused ? 1.5 : 1;
    ctx.beginPath();
    ctx.roundRect(x, top, w, height, 3);
    ctx.stroke();
    x += w + GAP;
  });

  // The status bar: numbered workspaces with the current one lit, the focused window, the clock.
  bar(ctx, 0, 0, W, BAR, '#08090b');
  const cell = 13;
  WORKSPACES.forEach((_, i) => {
    const on = i === active;
    if (on) {
      bar(ctx, 3 + i * (cell + 2), 2, cell, BAR - 4, ACCENT);
    }
    ctx.textAlign = 'center';
    text(
      ctx,
      String(i + 1),
      3 + i * (cell + 2) + cell / 2,
      BAR / 2 + 0.5,
      on ? '#0b0c0f' : '#6b6d78',
      `700 7.5px ${monoFamily}`
    );
  });
  ctx.textAlign = 'left';
  const focusedApp = windows[windows.length - 1][0];
  text(
    ctx,
    focusedApp.title,
    3 + WORKSPACES.length * (cell + 2) + 8,
    BAR / 2 + 0.5,
    '#9b9ba3',
    `500 7.5px ${monoFamily}`
  );
  const clock = new Date();
  const time = `${clock.getHours()}:${String(clock.getMinutes()).padStart(2, '0')}`;
  ctx.textAlign = 'right';
  text(ctx, time, W - 6, BAR / 2 + 0.5, '#ededeb', `600 7.5px ${monoFamily}`);
  ctx.textAlign = 'left';

  drawDictation(ctx, now / 1000);

  // The shortcut that switched here, shown for a moment in the corner.
  if (into < HINT_MS) {
    const label = `super+${active + 1}`;
    ctx.font = `600 8px ${monoFamily}`;
    const pill = ctx.measureText(label).width + 12;
    ctx.globalAlpha = into < HINT_MS - 200 ? 1 : (HINT_MS - into) / 200;
    ctx.fillStyle = 'rgb(8 9 11 / 0.88)';
    ctx.beginPath();
    ctx.roundRect(W - GAP - 6 - pill, H - GAP - 20, pill, 14, 3);
    ctx.fill();
    text(ctx, label, W - GAP - pill, H - GAP - 13, ACCENT, `600 8px ${monoFamily}`);
    ctx.globalAlpha = 1;
  }
}

/** The monitor on the standing desk: a tiling desktop whose workspaces switch on their own. */
export function useDeskScreen() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    result.anisotropy = 4;
    return result;
  }, []);
  const painted = useRef(-Infinity);
  const started = useRef<number | null>(null);

  // Its own clock, not the scene's: the scene's clock restarts from zero each time the hero
  // scrolls back into view, which used to leave the screen frozen for as long as it had run.
  // The ambient tick asks for frames while the hero is on screen, so this repaints forever.
  useFrame(() => {
    const now = performance.now();
    if (now - painted.current < REPAINT_MS) {
      return;
    }
    painted.current = now;
    const ctx = (texture.image as HTMLCanvasElement).getContext('2d');
    if (ctx) {
      started.current ??= now;
      // Workspace after workspace, wrapping round for as long as the page is open.
      drawScreen(ctx, now - started.current);
      texture.needsUpdate = true;
    }
  });

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}
