import { useEffect, useMemo, useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider } from '@react-three/rapier';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { type TicketItem } from './items';
import { monoFamily, sansFamily, useLabelTexture, wrapText } from './labelTexture';

/** The laptop's base: width, thickness, depth. Its lid stands up from the back edge. */
export const DAY_SHIFT_SIZE: [number, number, number] = [1.76, 0.06, 0.92];
/** The lid: width, height, thickness, and how far it leans back from upright. */
const LID: [number, number, number] = [1.76, 1.14, 0.035];
const RECLINE = 0.72;

const ALUMINIUM = '#c9ccd3';
const BEZEL = '#0c0d10';
const INK = '#1d1d22';
const MUTED = '#6b6a72';
const LINE = '#e4e1da';
const AGENT = '#ff6b35';
const ME = '#3b82f6';
const OK = '#16a34a';

/** The lit screen, inside the bezel, and its texture in the same proportions. */
const FACE: [number, number] = [LID[0] - 0.1, LID[1] - 0.1];
const TW = 1024;
const TH = Math.round((TW * FACE[1]) / FACE[0]);
/** One working day, in seconds: the clock runs from nine to six, then a new day starts. */
const DAY_S = 16;
/** Everything has happened by then; the screen holds until the day starts over. */
const DAY_END = 14;
const REPAINT_MS = 50;

type Ctx = CanvasRenderingContext2D;
type Point = [number, number];
type Box = { x: number; y: number; w: number; h: number };

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

function ease(x: number) {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
}

/** How far in something that starts at `at` is, over `span` seconds. */
function phase(t: number, at: number, span = 0.3) {
  return ease((t - at) / span);
}

/** Where a cursor is at `t`, gliding between its stops. */
function glide(stops: Array<[number, Point]>, t: number): Point {
  if (t <= stops[0][0]) {
    return stops[0][1];
  }
  for (let i = 1; i < stops.length; i += 1) {
    const [at, to] = stops[i];
    const [from, start] = stops[i - 1];
    if (t < at) {
      const f = ease((t - from) / (at - from));
      return [start[0] + (to[0] - start[0]) * f, start[1] + (to[1] - start[1]) * f];
    }
  }
  return stops[stops.length - 1][1];
}

const centre = ({ x, y, w, h }: Box): Point => [x + w / 2, y + h / 2];

/** The desktop: a menu bar, three windows that never move, and a dock. */
const MENU = 34;
const DOCK_H = 58;
const PAD = 14;
const TITLE = 42;
const WORK_BOTTOM = TH - DOCK_H - 18;
const ARCH: Box = { x: PAD, y: MENU + 12, w: 576, h: WORK_BOTTOM - MENU - 12 };
const SYNC: Box = { x: ARCH.x + ARCH.w + PAD, y: ARCH.y, w: TW - ARCH.w - PAD * 3, h: 258 };
const REVIEW: Box = {
  x: SYNC.x,
  y: SYNC.y + SYNC.h + PAD,
  w: SYNC.w,
  h: WORK_BOTTOM - SYNC.y - SYNC.h - PAD,
};

// The architecture window's contents, in screen pixels.
const NODE_Y = ARCH.y + TITLE + 74;
const NODES = [
  { label: 'App', at: 0.6 },
  { label: 'API', at: 1.2 },
  { label: 'DB', at: 1.8 },
].map((node, i) => ({ ...node, x: ARCH.x + 40 + i * 180, y: NODE_Y, w: 136, h: 58 }));
const QUESTION: Box = { x: NODES[1].x, y: NODE_Y + 108, w: 136, h: 54 };
const OPTION_Y = NODE_Y + 200;
const OPTIONS = [
  {
    box: { x: ARCH.x + 28, y: OPTION_Y, w: 250, h: 88 },
    title: 'A · In the API',
    note: 'Simple, slows requests',
    at: 3.2,
  },
  {
    box: { x: ARCH.x + 298, y: OPTION_Y, w: 250, h: 88 },
    title: 'B · Queue + worker',
    note: 'Scales, one more piece',
    at: 3.8,
  },
];
const PLAN_Y = OPTION_Y + 128;

/** The day, in seconds: the sync runs first, then my call on the architecture, then a review. */
const PICKED_AT = 7.6;
const PLAN_AT = 8.2;
const PLAN_DONE = 9.8;
const APPROVED_AT = 12.8;

const APPROVE: Box = { x: REVIEW.x + REVIEW.w - 150, y: REVIEW.y + REVIEW.h - 50, w: 134, h: 36 };

const agentPath: Array<[number, Point]> = [
  [0, [ARCH.x + 470, ARCH.y + 400]],
  [0.5, centre(NODES[0])],
  [1.1, centre(NODES[1])],
  [1.7, centre(NODES[2])],
  [2.3, centre(QUESTION)],
  [3.1, centre(OPTIONS[0].box)],
  [3.7, centre(OPTIONS[1].box)],
  [4.6, [ARCH.x + 500, OPTION_Y - 30]],
  [PLAN_AT, [ARCH.x + 120, PLAN_Y + 20]],
  [PLAN_DONE, [ARCH.x + 470, PLAN_Y + 24]],
  [11, [ARCH.x + 520, PLAN_Y + 40]],
];
const mePath: Array<[number, Point]> = [
  [0, [SYNC.x + SYNC.w - 70, SYNC.y + SYNC.h - 40]],
  [4.6, [SYNC.x + SYNC.w - 60, SYNC.y + SYNC.h - 46]],
  [5.8, centre(OPTIONS[0].box)],
  [6.6, [OPTIONS[0].box.x + 140, OPTION_Y + 40]],
  [PICKED_AT, centre(OPTIONS[1].box)],
  [10.4, [centre(OPTIONS[1].box)[0] + 20, OPTION_Y + 60]],
  [11.4, [REVIEW.x + 150, REVIEW.y + 100]],
  [APPROVED_AT, centre(APPROVE)],
];

/** Who is focused, as the day goes: the sync, then the architecture, then the review. */
function focusAt(t: number) {
  if (t < 5.2) {
    return SYNC;
  }
  return t < 11 ? ARCH : REVIEW;
}

/** What the agent says it is doing. */
function agentStatus(t: number) {
  if (t < 0.9) {
    return 'Reading the codebase';
  }
  if (t < 2.2) {
    return 'Sketching the architecture';
  }
  if (t < 4.6) {
    return 'Comparing options';
  }
  if (t < PICKED_AT) {
    return 'Waiting for your call';
  }
  return t < PLAN_DONE ? 'Writing the plan' : 'Plan ready';
}

function pill(ctx: Ctx, text: string, x: number, y: number, color: string, ink = '#ffffff') {
  ctx.font = `600 17px ${sansFamily}`;
  const w = ctx.measureText(text).width + 22;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, 28, 14);
  ctx.fill();
  ctx.fillStyle = ink;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + 11, y + 15);
  return w;
}

/** A pointer, with a name tag, like a shared whiteboard's. */
function cursor(ctx: Ctx, [x, y]: Point, color: string, name: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 30);
  ctx.lineTo(8, 23);
  ctx.lineTo(14, 36);
  ctx.lineTo(20, 33);
  ctx.lineTo(14, 21);
  ctx.lineTo(24, 20);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.fill();
  pill(ctx, name, 22, 30, color);
  ctx.restore();
}

function tick(ctx: Ctx, x: number, y: number, size: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y);
  ctx.lineTo(x - size * 0.14, y + size * 0.36);
  ctx.lineTo(x + size * 0.55, y - size * 0.38);
  ctx.stroke();
}

/** A window: a shadow, a white body, and a title bar with its three buttons and a coloured icon. */
function windowFrame(ctx: Ctx, box: Box, title: string, icon: string, focused: boolean) {
  const { x, y, w, h } = box;
  ctx.save();
  ctx.shadowColor = focused ? 'rgb(20 30 60 / 0.35)' : 'rgb(20 30 60 / 0.16)';
  ctx.shadowBlur = focused ? 30 : 14;
  ctx.shadowOffsetY = focused ? 10 : 4;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.clip();
  ctx.fillStyle = focused ? '#f1f0ec' : '#f7f6f3';
  ctx.fillRect(x, y, w, TITLE);
  ctx.fillStyle = LINE;
  ctx.fillRect(x, y + TITLE - 1, w, 1);
  ctx.restore();
  ['#ff5f57', '#febc2e', '#28c840'].forEach((color, i) => {
    ctx.fillStyle = focused ? color : '#d6d4cf';
    ctx.beginPath();
    ctx.arc(x + 22 + i * 20, y + TITLE / 2, 6.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = icon;
  ctx.beginPath();
  ctx.roundRect(x + 92, y + 11, 20, 20, 5);
  ctx.fill();
  ctx.fillStyle = focused ? INK : MUTED;
  ctx.font = `600 20px ${sansFamily}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(title, x + 122, y + TITLE / 2 + 1);
  if (focused) {
    ctx.strokeStyle = 'rgb(59 130 246 / 0.55)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.stroke();
  }
}

function node(ctx: Ctx, { x, y, w, h }: Box, label: string, f: number, dashed = false) {
  if (f <= 0) {
    return;
  }
  ctx.save();
  ctx.globalAlpha = f;
  const grow = 0.85 + 0.15 * f;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.scale(grow, grow);
  ctx.fillStyle = dashed ? '#fff7f2' : '#ffffff';
  ctx.strokeStyle = dashed ? AGENT : INK;
  ctx.lineWidth = 3;
  ctx.setLineDash(dashed ? [10, 7] : []);
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 12);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = dashed ? AGENT : INK;
  ctx.font = `600 22px ${monoFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 1);
  ctx.restore();
}

function arrow(ctx: Ctx, from: Point, to: Point, f: number) {
  if (f <= 0) {
    return;
  }
  const x = from[0] + (to[0] - from[0]) * f;
  const y = from[1] + (to[1] - from[1]) * f;
  ctx.strokeStyle = MUTED;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(...from);
  ctx.lineTo(x, y);
  if (f > 0.9) {
    const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
    [-0.5, 0.5].forEach((spread) => {
      ctx.moveTo(x, y);
      ctx.lineTo(x - Math.cos(angle + spread) * 12, y - Math.sin(angle + spread) * 12);
    });
  }
  ctx.stroke();
}

/** The architecture: the agent sketches the system and the options, I pick one, it writes the plan. */
function drawArchitecture(ctx: Ctx, t: number) {
  const { x, y, w } = ARCH;
  windowFrame(ctx, ARCH, 'Architecture', '#5b8def', focusAt(t) === ARCH);
  ctx.fillStyle = '#ece9e2';
  for (let gx = x + 24; gx < x + w; gx += 28) {
    for (let gy = y + TITLE + 20; gy < y + ARCH.h - 10; gy += 28) {
      ctx.fillRect(gx, gy, 2.5, 2.5);
    }
  }

  // The agent's status, top of the canvas.
  const status = agentStatus(t);
  ctx.font = `500 17px ${sansFamily}`;
  const sw = ctx.measureText(status).width;
  const sx = x + 24;
  const sy = y + TITLE + 14;
  ctx.fillStyle = status === 'Plan ready' ? '#e8f7ee' : '#fff1ea';
  ctx.beginPath();
  ctx.roundRect(sx, sy, sw + 40, 32, 16);
  ctx.fill();
  const busy = status !== 'Plan ready' && status !== 'Waiting for your call';
  ctx.fillStyle = status === 'Plan ready' ? OK : AGENT;
  ctx.globalAlpha = busy ? 0.55 + 0.45 * Math.sin(t * 7) : 1;
  ctx.beginPath();
  ctx.arc(sx + 16, sy + 16, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = status === 'Plan ready' ? '#15803d' : '#b8461b';
  ctx.textBaseline = 'middle';
  ctx.fillText(status, sx + 30, sy + 17);

  NODES.forEach((item) => node(ctx, item, item.label, phase(t, item.at)));
  const mid = NODE_Y + 29;
  arrow(ctx, [NODES[0].x + 136, mid], [NODES[1].x - 4, mid], phase(t, 0.9, 0.25));
  arrow(ctx, [NODES[1].x + 136, mid], [NODES[2].x - 4, mid], phase(t, 1.5, 0.25));
  arrow(ctx, [NODES[1].x + 68, NODE_Y + 60], [NODES[1].x + 68, QUESTION.y - 4], phase(t, 2.1, 0.2));
  node(ctx, QUESTION, 'Bulk job?', phase(t, 2.2), true);

  const picked = t >= PICKED_AT;
  OPTIONS.forEach(({ box, title, note, at }, i) => {
    const f = phase(t, at);
    if (f <= 0) {
      return;
    }
    const chosen = picked && i === 1;
    const hovered = !picked && t > 5.8 && i === (t < 6.6 ? 0 : 1);
    ctx.save();
    ctx.globalAlpha = f * (picked && !chosen ? 0.4 : 1);
    ctx.fillStyle = chosen ? '#eef5ff' : '#fbfaf8';
    ctx.strokeStyle = LINE;
    if (chosen || hovered) {
      ctx.strokeStyle = chosen ? ME : '#93b9f8';
    }
    ctx.lineWidth = chosen ? 4 : 2.5;
    ctx.beginPath();
    ctx.roundRect(box.x, box.y + (1 - f) * 14, box.w, box.h, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = `600 22px ${sansFamily}`;
    ctx.fillText(title, box.x + 18, box.y + 32);
    ctx.fillStyle = MUTED;
    ctx.font = `500 18px ${sansFamily}`;
    ctx.fillText(note, box.x + 18, box.y + 62);
    if (chosen) {
      ctx.fillStyle = ME;
      ctx.beginPath();
      ctx.arc(box.x + box.w - 26, box.y + 28, 15, 0, Math.PI * 2);
      ctx.fill();
      tick(ctx, box.x + box.w - 27, box.y + 29, 16, '#ffffff');
    }
    ctx.restore();
  });

  // My click lands with a ripple; the agent then writes the plan for the option picked.
  const [cx, cy] = centre(OPTIONS[1].box);
  const ripple = clamp01((t - PICKED_AT) / 0.5);
  if (ripple > 0 && ripple < 1) {
    ctx.strokeStyle = ME;
    ctx.globalAlpha = 1 - ripple;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 10 + ripple * 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  const plan = phase(t, PLAN_AT - 0.3);
  if (plan > 0) {
    ctx.globalAlpha = plan;
    const done = clamp01((t - PLAN_AT) / (PLAN_DONE - PLAN_AT));
    ctx.fillStyle = INK;
    ctx.font = `600 20px ${sansFamily}`;
    ctx.fillText(done < 1 ? 'Plan for B' : 'Plan for B, ready', x + 28, PLAN_Y);
    ctx.fillStyle = '#ece9e2';
    ctx.beginPath();
    ctx.roundRect(x + 28, PLAN_Y + 22, w - 56, 12, 6);
    ctx.fill();
    ctx.fillStyle = done < 1 ? AGENT : OK;
    ctx.beginPath();
    ctx.roundRect(x + 28, PLAN_Y + 22, (w - 56) * Math.max(0.04, done), 12, 6);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

const PEOPLE = [
  { color: '#a78bfa', skin: '#f1c9a5', name: 'Product' },
  { color: '#3fcf8e', skin: '#c68e62', name: 'Lead dev' },
  { color: '#f5b84a', skin: '#e7b48f', name: 'Design' },
  { color: ME, skin: '#f0c7a2', name: 'Me' },
];

/** The video call: four people, whoever is talking ringed in green. */
function drawSync(ctx: Ctx, t: number) {
  const { x, y, w, h } = SYNC;
  windowFrame(ctx, SYNC, 'Team sync', '#22a35a', focusAt(t) === SYNC);
  // Recording dot, top right of the title bar.
  ctx.fillStyle = '#ef4444';
  ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 4);
  ctx.beginPath();
  ctx.arc(x + w - 24, y + TITLE / 2, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // The team takes turns; I talk when the call is mine to make.
  const speaker = t > 4 && t < 5.2 ? 3 : Math.floor(t / 1.2) % 3;
  const gap = 10;
  const tw = (w - gap * 3) / 2;
  const th = (h - TITLE - gap * 3) / 2;
  PEOPLE.forEach(({ color, skin, name }, i) => {
    const tx = x + gap + (i % 2) * (tw + gap);
    const ty = y + TITLE + gap + Math.floor(i / 2) * (th + gap);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(tx, ty, tw, th, 10);
    ctx.clip();
    ctx.fillStyle = '#2a2c33';
    ctx.fillRect(tx, ty, tw, th);
    // A person: shoulders in their colour, then a head.
    const px = tx + tw / 2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(px, ty + th + 10, 46, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(px, ty + th / 2 - 2, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgb(0 0 0 / 0.45)';
    ctx.font = `600 13px ${sansFamily}`;
    const nw = ctx.measureText(name).width + 14;
    ctx.beginPath();
    ctx.roundRect(tx + 6, ty + th - 26, nw, 20, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, tx + 13, ty + th - 15);
    ctx.restore();
    if (i === speaker) {
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, th, 10);
      ctx.stroke();
    }
  });
}

// [kind, width share]: 0 context, 1 added, -1 removed.
const DIFF: Array<[number, number]> = [
  [0, 0.62],
  [-1, 0.5],
  [1, 0.72],
  [1, 0.46],
  [0, 0.38],
];

/** A pull request: the diff, my comment, then the approval. */
function drawReview(ctx: Ctx, t: number, pr: number) {
  const { x, y, w, h } = REVIEW;
  windowFrame(ctx, REVIEW, `Review · PR #${pr}`, '#8b5cf6', focusAt(t) === REVIEW);
  const top = y + TITLE + 12;
  const row = Math.min(24, (h - TITLE - 76) / DIFF.length);
  DIFF.forEach(([kind, share], i) => {
    const ry = top + i * row;
    if (kind !== 0) {
      ctx.fillStyle = kind > 0 ? '#e6f6ec' : '#fdecec';
      ctx.fillRect(x + 1, ry, w - 2, row - 2);
      ctx.fillStyle = kind > 0 ? OK : '#dc2626';
      ctx.font = `700 18px ${monoFamily}`;
      ctx.textBaseline = 'middle';
      ctx.fillText(kind > 0 ? '+' : '−', x + 12, ry + row / 2);
    }
    const tint = kind > 0 ? '#86c79c' : '#e7a1a1';
    ctx.fillStyle = kind === 0 ? '#c9c6bf' : tint;
    ctx.beginPath();
    ctx.roundRect(x + 34, ry + row / 2 - 4, (w - 60) * share, 8, 4);
    ctx.fill();
  });

  // The approval: a click, then the button goes green.
  const approved = t >= APPROVED_AT;
  const { x: bx, y: by, w: bw, h: bh } = APPROVE;
  ctx.fillStyle = approved ? OK : '#ffffff';
  ctx.strokeStyle = approved ? OK : '#d6d3cc';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 9);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = approved ? '#ffffff' : INK;
  ctx.font = `600 18px ${sansFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(approved ? '✓ Approved' : 'Approve', bx + bw / 2, by + bh / 2 + 1);
  ctx.textAlign = 'left';
  const ripple = clamp01((t - APPROVED_AT) / 0.5);
  if (ripple > 0 && ripple < 1) {
    ctx.strokeStyle = OK;
    ctx.globalAlpha = 1 - ripple;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(bx + bw / 2, by + bh / 2, 10 + ripple * 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

/** The desktop behind the windows: a morning sky, the menu bar with the day's clock, the dock. */
function drawDesktop(ctx: Ctx, t: number, item: TicketItem) {
  const sky = ctx.createLinearGradient(0, 0, 0, TH);
  sky.addColorStop(0, '#9fd0ff');
  sky.addColorStop(0.65, '#d9ecff');
  sky.addColorStop(1, '#ffe3c4');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, TW, TH);

  ctx.fillStyle = 'rgb(255 255 255 / 0.78)';
  ctx.fillRect(0, 0, TW, MENU);
  // A sun, then what the day is about: the ticket's colour, code and title.
  ctx.fillStyle = '#f5b301';
  ctx.beginPath();
  ctx.arc(24, MENU / 2, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.font = `700 18px ${sansFamily}`;
  ctx.textBaseline = 'middle';
  ctx.fillText('Day shift', 42, MENU / 2 + 1);
  ctx.fillStyle = item.color;
  ctx.beginPath();
  ctx.arc(150, MENU / 2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.font = `600 17px ${monoFamily}`;
  ctx.fillText(item.code, 164, MENU / 2 + 1);
  const codeW = ctx.measureText(item.code).width;
  ctx.font = `500 17px ${sansFamily}`;
  ctx.fillStyle = MUTED;
  const [title] = wrapText(ctx, item.title, TW - codeW - 320, 1);
  ctx.fillText(title, 176 + codeW, MENU / 2 + 1);
  // Nine to six across the day.
  const minutes = 9 * 60 + Math.floor((Math.min(t, DAY_S) / DAY_S) * 9 * 60);
  const clock = `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
  ctx.font = `600 18px ${monoFamily}`;
  ctx.fillStyle = INK;
  ctx.textAlign = 'right';
  ctx.fillText(clock, TW - 18, MENU / 2 + 1);
  ctx.textAlign = 'left';

  // The dock, the open apps marked with a dot.
  const apps = ['#5b8def', '#22a35a', '#8b5cf6', '#1d1d22', '#ff6b35', '#f5b301'];
  const size = 40;
  const dw = apps.length * (size + 12) + 12;
  const dx = (TW - dw) / 2;
  const dy = TH - DOCK_H - 6;
  ctx.fillStyle = 'rgb(255 255 255 / 0.6)';
  ctx.beginPath();
  ctx.roundRect(dx, dy, dw, DOCK_H, 18);
  ctx.fill();
  apps.forEach((color, i) => {
    const ax = dx + 12 + i * (size + 12);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(ax, dy + 7, size, size, 10);
    ctx.fill();
    if (i < 3) {
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(ax + size / 2, dy + DOCK_H - 5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/** The screen at `t` seconds into the day. */
function drawScreen(ctx: Ctx, t: number, item: TicketItem) {
  drawDesktop(ctx, t, item);
  drawArchitecture(ctx, t);
  drawSync(ctx, t);
  drawReview(ctx, t, item.pr);

  // The agent works the architecture; my pointer goes from the sync to the call, then to the review.
  cursor(ctx, glide(agentPath, t), AGENT, 'Agent');
  cursor(ctx, glide(mePath, t), ME, 'Me');

  // Handed to the agents and merged: stamped across the screen.
  if (item.merged) {
    ctx.save();
    ctx.translate(TW / 2, TH / 2);
    ctx.rotate(-0.08);
    ctx.fillStyle = 'rgb(255 255 255 / 0.9)';
    ctx.beginPath();
    ctx.roundRect(-230, -50, 460, 100, 16);
    ctx.fill();
    ctx.strokeStyle = OK;
    ctx.fillStyle = OK;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.font = `700 34px ${monoFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`SHIPPED · PR #${item.pr}`, 0, 2);
    ctx.restore();
  }
}

/** Keys and a trackpad on the laptop's deck. */
function useDeckTexture() {
  return useLabelTexture(
    512,
    250,
    (ctx, w) => {
      ctx.fillStyle = ALUMINIUM;
      ctx.fillRect(0, 0, w, 250);
      ctx.fillStyle = '#25272d';
      ctx.beginPath();
      ctx.roundRect(30, 14, w - 60, 132, 8);
      ctx.fill();
      ctx.fillStyle = '#3b3e46';
      const cols = 14;
      const key = (w - 60 - 8 - (cols - 1) * 4) / cols;
      for (let row = 0; row < 5; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          ctx.beginPath();
          ctx.roundRect(34 + col * (key + 4), 18 + row * 25.6, key, 21.6, 3);
          ctx.fill();
        }
      }
      ctx.fillStyle = '#bfc2c9';
      ctx.beginPath();
      ctx.roundRect(w / 2 - 80, 160, 160, 78, 10);
      ctx.fill();
    },
    'laptop-deck'
  );
}

/**
 * The day shift: a laptop, lid open, its desktop showing my day. An agent
 * sketches the architecture and lays out the options while I am in a sync
 * with the team; then I make the call, the agent writes the plan, and I
 * review a pull request. Dropped on the agents, the plan is handed over: it
 * comes back stamped as shipped, then a new day starts.
 */
export function DayShiftMesh({ item }: { item: TicketItem }) {
  const [w, h, d] = DAY_SHIFT_SIZE;
  const [lw, lh, lt] = LID;
  const deck = useDeckTexture();
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = TW;
    canvas.height = TH;
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    result.anisotropy = 8;
    return result;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);

  const day = useRef({ start: -1, painted: -Infinity, done: false });
  // A new plan starts a new day; shipping one stamps the screen at once.
  useEffect(() => {
    day.current = { start: -1, painted: -Infinity, done: false };
  }, [item.code]);
  useEffect(() => {
    day.current.painted = -Infinity;
    day.current.done = false;
  }, [item.merged]);

  useFrame(() => {
    const now = performance.now();
    const state = day.current;
    if (state.start < 0) {
      state.start = now;
    }
    // Waiting for the next plan, the screen holds; otherwise the day loops.
    const elapsed = (now - state.start) / 1000;
    const t = item.merged ? Math.max(elapsed, DAY_END) : elapsed % DAY_S;
    const moving = t < DAY_END;
    if (now - state.painted >= REPAINT_MS && (moving || !state.done)) {
      const ctx = (texture.image as HTMLCanvasElement).getContext('2d');
      if (ctx) {
        drawScreen(ctx, t, item);
        texture.needsUpdate = true;
        state.painted = now;
        state.done = !moving;
      }
    }
  });

  // The lid hinges on the base's back edge and leans back; its centre, in the base's space.
  const hinge: [number, number, number] = [0, h / 2, -d / 2 + lt / 2];
  const lidCentre: [number, number, number] = [
    0,
    hinge[1] + (lh / 2) * Math.cos(RECLINE),
    hinge[2] - (lh / 2) * Math.sin(RECLINE),
  ];

  return (
    <>
      {/* A slightly thicker base than the laptop itself, so it settles without jitter; a light lid, so it never tips back. */}
      <CuboidCollider args={[w / 2, h / 2 + 0.02, d / 2]} />
      <CuboidCollider
        args={[lw / 2, lh / 2, lt / 2 + 0.01]}
        position={lidCentre}
        rotation={[-RECLINE, 0, 0]}
        density={0.4}
      />
      <RoundedBox args={[w, h, d]} radius={0.025} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color={ALUMINIUM} metalness={0.55} roughness={0.38} />
      </RoundedBox>
      <mesh position={[0, h / 2 + 0.002, 0.02]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w - 0.04, d - 0.08]} />
        <meshStandardMaterial map={deck} metalness={0.3} roughness={0.5} />
      </mesh>
      <group position={hinge} rotation={[-RECLINE, 0, 0]}>
        <RoundedBox
          args={LID}
          radius={0.015}
          smoothness={3}
          position={[0, lh / 2, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={ALUMINIUM} metalness={0.55} roughness={0.38} />
        </RoundedBox>
        {/* The glass: a black bezel, the lit screen inside it, and the camera dot. */}
        <mesh position={[0, lh / 2, lt / 2 + 0.001]}>
          <planeGeometry args={[lw - 0.03, lh - 0.03]} />
          <meshStandardMaterial color={BEZEL} roughness={0.2} metalness={0.1} />
        </mesh>
        <mesh position={[0, lh / 2 - 0.005, lt / 2 + 0.003]}>
          <planeGeometry args={FACE} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
        <mesh position={[0, lh - 0.03, lt / 2 + 0.003]}>
          <circleGeometry args={[0.009, 12]} />
          <meshBasicMaterial color="#25272d" />
        </mesh>
      </group>
    </>
  );
}
