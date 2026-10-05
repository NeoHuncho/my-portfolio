import { type Area, type Footprint, planPath, type Point } from './robotPath';

const AREA: Area = { minX: -4, maxX: 4, minZ: -4, maxZ: 4 };
const RADIUS = 0.42;

function box(x: number, z: number, halfX: number, halfZ: number, light = false): Footprint {
  return { x, z, yaw: 0, halfX, halfZ, light };
}

/** Every point the robot drives through, a few per corner-to-corner leg. */
function sampled(from: Point, path: Point[]): Point[] {
  const points: Point[] = [];
  let at = from;
  path.forEach((corner) => {
    for (let i = 1; i <= 10; i += 1) {
      points.push({
        x: at.x + ((corner.x - at.x) * i) / 10,
        z: at.z + ((corner.z - at.z) * i) / 10,
      });
    }
    at = corner;
  });
  return points;
}

/** Where the path crosses z = 0, or null if it never does. */
function crossingX(from: Point, path: Point[]): number | null {
  let at = from;
  for (const corner of path) {
    if ((at.z <= 0 && corner.z >= 0) || (at.z >= 0 && corner.z <= 0)) {
      const t = corner.z === at.z ? 0 : -at.z / (corner.z - at.z);
      return at.x + (corner.x - at.x) * t;
    }
    at = corner;
  }
  return null;
}

describe('planPath', () => {
  // A wall of two heavy things across the desk with a gap just wider than the robot.
  const wall = [box(-2, 0, 1.5, 0.4), box(2, 0, 1.5, 0.4)];

  it('threads through a gap between heavy things instead of going round them', () => {
    const from = { x: 0, z: -3 };
    const path = planPath(AREA, wall, RADIUS, from, { x: 0, z: 3 });
    expect(path).not.toBeNull();
    // Through the gap, not round the ends of the wall at x = ±3.5.
    expect(Math.abs(crossingX(from, path ?? []) ?? 9)).toBeLessThan(0.3);
  });

  it('keeps to the middle of the gap', () => {
    const from = { x: 0.3, z: -3 };
    const path = planPath(AREA, wall, RADIUS, from, { x: -0.3, z: 3 }) ?? [];
    sampled(from, path)
      .filter((point) => Math.abs(point.z) < 0.4)
      .forEach((point) => expect(Math.abs(point.x)).toBeLessThan(0.25));
  });

  it('brushes past a light thing rather than through its middle', () => {
    const from = { x: 0, z: -3 };
    const path = planPath(AREA, [box(0, 0, 0.9, 0.3, true)], RADIUS, from, { x: 0, z: 3 }) ?? [];
    expect(Math.abs(crossingX(from, path) ?? 0)).toBeGreaterThan(0.6);
  });

  it('never drives into a heavy footprint', () => {
    const from = { x: -3, z: -3 };
    const path = planPath(AREA, [box(0, 0, 1, 1)], RADIUS, from, { x: 3, z: 3 }) ?? [];
    sampled(from, path).forEach((point) => {
      const inside = Math.abs(point.x) < 1 + RADIUS * 0.6 && Math.abs(point.z) < 1 + RADIUS * 0.6;
      expect(inside).toBe(false);
    });
  });

  it('pushes through a light thing when there is no way round', () => {
    // A wall right across the desk, its one gap closed by a light thing: it goes through rather than giving up.
    const closed = [box(-2.3, 0, 1.8, 0.4), box(2.3, 0, 1.8, 0.4), box(0, 0, 0.5, 0.3, true)];
    const from = { x: 0, z: -3 };
    const path = planPath(AREA, closed, RADIUS, from, { x: 0, z: 3 }) ?? [];
    expect(path[path.length - 1].z).toBeGreaterThan(2.5);
    expect(Math.abs(crossingX(from, path) ?? 9)).toBeLessThan(0.3);
  });

  it('with the goal on something, stops on its own side instead of going round', () => {
    // A round dock between the robot and the pointer, the pointer on its middle.
    const dock: Footprint = { x: 0, z: 0, yaw: 0, halfX: 1, halfZ: 1, round: true };
    const from = { x: 0, z: -3 };
    const path = planPath(AREA, [dock], RADIUS, from, { x: 0, z: 0 }, 1.6) ?? [];
    expect(path.length).toBeGreaterThan(0);
    path.forEach((point) => expect(point.z).toBeLessThan(0));
    const end = path[path.length - 1];
    expect(Math.hypot(end.x, end.z)).toBeLessThanOrEqual(1.6 + 0.2);
  });

  it('stays inside the area it is given', () => {
    const from = { x: 0, z: 0 };
    const path = planPath(AREA, [], RADIUS, from, { x: 12, z: -9 }) ?? [];
    path.forEach((point) => {
      expect(point.x).toBeLessThanOrEqual(AREA.maxX);
      expect(point.z).toBeGreaterThanOrEqual(AREA.minZ);
    });
  });
});
