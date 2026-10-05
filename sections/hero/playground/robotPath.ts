/**
 * A rectangle on the desk: centre, heading and half sizes, in world units.
 * Light things (a ticket, a keycap) may be driven through, the robot nudging them
 * aside; the rest are walls it keeps clear of.
 */
export type Footprint = {
  x: number;
  z: number;
  yaw: number;
  halfX: number;
  halfZ: number;
  light?: boolean;
  /** A disc of radius `halfX` instead of a rectangle, like the agents' dock. */
  round?: boolean;
};
export type Area = { minX: number; maxX: number; minZ: number; maxZ: number };
export type Point = { x: number; z: number };

const CELL = 0.2;
/** How far round a blocked goal to look for the nearest free spot, in cells. */
const GOAL_SEARCH = 14;
/**
 * Past the hard core, a band where driving costs more the closer it gets, so
 * the path keeps to the middle of a gap instead of scraping along one side.
 */
const SOFT_BAND = 0.45;
const SOFT_COST = 0.6;
/**
 * Driving through a light thing, nudging it aside, costs up to this much more
 * per cell (most through its middle), and brushing past one a little: it
 * prefers a gap or an edge, and pushes through only when going round is long.
 */
const LIGHT_COST = 1.2;
const LIGHT_BRUSH = 0.3;
/**
 * The hard core is the footprint plus this share of the robot's half width:
 * a little short of touching, so it squeezes through gaps just wider than itself.
 */
const SQUEEZE = 0.85;

type Grid = {
  cols: number;
  rows: number;
  blocked: Uint8Array;
  /** Extra cost of entering each cell, on top of the distance. */
  penalty: Float32Array;
  area: Area;
};

/** Distance from a point to the edge of a footprint, zero inside it. */
function distanceTo({ x, z, yaw, halfX, halfZ, round }: Footprint, px: number, pz: number) {
  const dx = px - x;
  const dz = pz - z;
  if (round) {
    return Math.max(0, Math.hypot(dx, dz) - halfX);
  }
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  // Into the footprint's own axes: yaw turns +z towards +x.
  const lx = Math.abs(dx * cos - dz * sin) - halfX;
  const lz = Math.abs(dx * sin + dz * cos) - halfZ;
  return Math.hypot(Math.max(lx, 0), Math.max(lz, 0));
}

function buildGrid(area: Area, obstacles: Footprint[], radius: number): Grid {
  const cols = Math.max(1, Math.ceil((area.maxX - area.minX) / CELL));
  const rows = Math.max(1, Math.ceil((area.maxZ - area.minZ) / CELL));
  const blocked = new Uint8Array(cols * rows);
  const penalty = new Float32Array(cols * rows);
  const core = radius * SQUEEZE;
  obstacles.forEach((obstacle) => {
    const reach = Math.hypot(obstacle.halfX, obstacle.halfZ) + core + SOFT_BAND;
    const c0 = Math.max(0, Math.floor((obstacle.x - reach - area.minX) / CELL));
    const c1 = Math.min(cols - 1, Math.ceil((obstacle.x + reach - area.minX) / CELL));
    const r0 = Math.max(0, Math.floor((obstacle.z - reach - area.minZ) / CELL));
    const r1 = Math.min(rows - 1, Math.ceil((obstacle.z + reach - area.minZ) / CELL));
    for (let r = r0; r <= r1; r += 1) {
      for (let c = c0; c <= c1; c += 1) {
        const cell = r * cols + c;
        const d = distanceTo(obstacle, area.minX + (c + 0.5) * CELL, area.minZ + (r + 0.5) * CELL);
        let cost = 0;
        if (obstacle.light) {
          // Through it or brushing past: allowed, just not free.
          if (d < radius) {
            cost = LIGHT_BRUSH + (LIGHT_COST - LIGHT_BRUSH) * (1 - d / radius);
          } else if (d < radius + SOFT_BAND) {
            cost = LIGHT_BRUSH * (1 - (d - radius) / SOFT_BAND);
          }
        } else if (d < core) {
          blocked[cell] = 1;
        } else if (d < core + SOFT_BAND) {
          cost = SOFT_COST * (1 - (d - core) / SOFT_BAND) ** 2;
        }
        penalty[cell] = Math.max(penalty[cell], cost);
      }
    }
  });
  return { cols, rows, blocked, penalty, area };
}

function cellOf(grid: Grid, point: Point): number {
  const c = Math.min(grid.cols - 1, Math.max(0, Math.floor((point.x - grid.area.minX) / CELL)));
  const r = Math.min(grid.rows - 1, Math.max(0, Math.floor((point.z - grid.area.minZ) / CELL)));
  return r * grid.cols + c;
}

function centreOf(grid: Grid, cell: number): Point {
  return {
    x: grid.area.minX + ((cell % grid.cols) + 0.5) * CELL,
    z: grid.area.minZ + (Math.floor(cell / grid.cols) + 0.5) * CELL,
  };
}

/** The free cell nearest the goal, if it is covered by something. */
function nearestFree(grid: Grid, cell: number): number | null {
  if (!grid.blocked[cell]) {
    return cell;
  }
  const c0 = cell % grid.cols;
  const r0 = Math.floor(cell / grid.cols);
  let best: number | null = null;
  let bestDistance = Infinity;
  for (let r = r0 - GOAL_SEARCH; r <= r0 + GOAL_SEARCH; r += 1) {
    for (let c = c0 - GOAL_SEARCH; c <= c0 + GOAL_SEARCH; c += 1) {
      const inside = r >= 0 && c >= 0 && r < grid.rows && c < grid.cols;
      const distance = (r - r0) ** 2 + (c - c0) ** 2;
      if (inside && !grid.blocked[r * grid.cols + c] && distance < bestDistance) {
        best = r * grid.cols + c;
        bestDistance = distance;
      }
    }
  }
  return best;
}

/**
 * A* over the weighted grid, eight ways, never cutting a blocked corner, to
 * the first free cell within `reach` cells of the goal: close enough is there.
 */
function search(grid: Grid, start: number, goal: number, reach: number): number[] | null {
  const { cols, rows, blocked, penalty } = grid;
  const cost = new Float32Array(cols * rows).fill(Infinity);
  const from = new Int32Array(cols * rows).fill(-1);
  const closed = new Uint8Array(cols * rows);
  const gc = goal % cols;
  const gr = Math.floor(goal / cols);
  const away = (cell: number) => Math.hypot((cell % cols) - gc, Math.floor(cell / cols) - gr);
  // Plain distance to the edge of the goal's reach: every step costs at least that, so it never overestimates.
  const guess = (cell: number) => Math.max(0, away(cell) - reach);
  // A binary heap of [priority, cell].
  const heap: Array<[number, number]> = [];
  const push = (entry: [number, number]) => {
    heap.push(entry);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (heap[parent][0] <= heap[i][0]) {
        break;
      }
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length && last) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const left = i * 2 + 1;
        const right = left + 1;
        let smallest = i;
        if (left < heap.length && heap[left][0] < heap[smallest][0]) {
          smallest = left;
        }
        if (right < heap.length && heap[right][0] < heap[smallest][0]) {
          smallest = right;
        }
        if (smallest === i) {
          break;
        }
        [heap[smallest], heap[i]] = [heap[i], heap[smallest]];
        i = smallest;
      }
    }
    return top;
  };

  const trace = (cell: number) => {
    const path = [cell];
    let at = cell;
    while (from[at] !== -1) {
      at = from[at];
      path.push(at);
    }
    return path.reverse();
  };

  cost[start] = 0;
  push([guess(start), start]);
  // Out of reach, it goes as close as it can get.
  let closest = start;
  while (heap.length) {
    const [, cell] = pop();
    if (cell === goal || away(cell) <= reach) {
      return trace(cell);
    }
    if (closed[cell]) {
      continue;
    }
    closed[cell] = 1;
    if (away(cell) < away(closest)) {
      closest = cell;
    }
    const c = cell % cols;
    const r = Math.floor(cell / cols);
    for (let dr = -1; dr <= 1; dr += 1) {
      for (let dc = -1; dc <= 1; dc += 1) {
        const nc = c + dc;
        const nr = r + dr;
        const next = nr * cols + nc;
        const open =
          (dc !== 0 || dr !== 0) &&
          nc >= 0 &&
          nr >= 0 &&
          nc < cols &&
          nr < rows &&
          !blocked[next] &&
          !closed[next] &&
          // Diagonals only between two free sides.
          !(dc !== 0 && dr !== 0 && (blocked[r * cols + nc] || blocked[nr * cols + c]));
        if (open) {
          const length = dc !== 0 && dr !== 0 ? Math.SQRT2 : 1;
          const step = cost[cell] + length * (1 + penalty[next]);
          if (step < cost[next]) {
            cost[next] = step;
            from[next] = cell;
            push([step + guess(next), next]);
          }
        }
      }
    }
  }
  return closest === start ? null : trace(closest);
}

/**
 * Whether the straight line from a to b stays clear and never costs more than
 * `limit` in any one cell: a shortcut may not hug what the path kept away from.
 */
function clearLine(grid: Grid, a: Point, b: Point, limit: number): boolean {
  const steps = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / (CELL / 2));
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const cell = cellOf(grid, { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t });
    if (grid.blocked[cell] || grid.penalty[cell] > limit + 0.05) {
      return false;
    }
  }
  return true;
}

/**
 * A way across `area` from `from` to within `reach` of `to`, or as close to it
 * as there is room. The robot, `radius` wide either side, threads between
 * heavy things through the middle of the gaps and may brush past light ones.
 * With `to` on something, it stops on its own side rather than going round
 * to the far one. Returns corner points only, the first one past the start,
 * or null when it is boxed in.
 */
export function planPath(
  area: Area,
  obstacles: Footprint[],
  radius: number,
  from: Point,
  to: Point,
  reach = 0
): Point[] | null {
  const grid = buildGrid(area, obstacles, radius);
  const start = cellOf(grid, from);
  // Wedged in already, it may still drive out of where it stands.
  const sc = start % grid.cols;
  const sr = Math.floor(start / grid.cols);
  const free = Math.ceil(radius / CELL);
  for (let r = sr - free; r <= sr + free; r += 1) {
    for (let c = sc - free; c <= sc + free; c += 1) {
      if (r >= 0 && c >= 0 && r < grid.rows && c < grid.cols) {
        grid.blocked[r * grid.cols + c] = 0;
      }
    }
  }
  const target = cellOf(grid, to);
  // Close enough already, or the goal itself is free: head for it. Otherwise
  // anywhere free within reach will do, and failing that the nearest free spot.
  const goal = reach > 0 ? target : nearestFree(grid, target);
  if (goal === null) {
    return null;
  }
  const cells = search(grid, start, goal, reach / CELL);
  if (!cells) {
    return null;
  }
  // Pull the string tight: keep only the corners it cannot see past cheaply.
  const points = cells.map((cell) => centreOf(grid, cell));
  const corners: Point[] = [];
  let anchor = from;
  let i = 0;
  while (i < points.length - 1) {
    let j = points.length - 1;
    for (; j > i + 1; j -= 1) {
      let limit = 0;
      for (let k = i; k <= j; k += 1) {
        limit = Math.max(limit, grid.penalty[cells[k]]);
      }
      if (clearLine(grid, anchor, points[j], limit)) {
        break;
      }
    }
    corners.push(points[j]);
    anchor = points[j];
    i = j;
  }
  return corners.length ? corners : [points[points.length - 1]];
}
