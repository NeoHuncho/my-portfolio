import {
  type ClearZone,
  type FieldBounds,
  fieldClearance,
  fieldDestination,
  fieldInside,
  fieldVelocity,
} from './repulsor';

const DESK: FieldBounds = {
  minX: -3,
  maxX: 3,
  farMinX: -5,
  farMaxX: 5,
  zFar: -4,
  zNear: 4,
};
const HATCH: ClearZone = { x: 0, z: 0, radius: 1.15, halfX: 1, halfZ: 0.8 };

describe('the hatch field', () => {
  it('clears an incoming footprint corner even when it is outside the round mouth', () => {
    const wide = { ...HATCH, halfX: 1.9 };
    const piece = { x: 2.08, z: 0.6, halfX: 0.3, halfZ: 0.3 };
    expect(fieldClearance(wide, piece)).toBeLessThan(0);
    const goal = fieldDestination(wide, piece, DESK);
    expect(goal).not.toBeNull();
    expect(fieldClearance(wide, { ...piece, ...goal })).toBeGreaterThanOrEqual(0.08);
  });

  it('never parks a piece past the edge of the text, even when that is the shortest way out', () => {
    // The free desk starts just left of the hatch: beside the text, not under it.
    const free = { ...DESK, minX: -1.4, farMinX: -1.6 };
    const piece = { x: -0.9, z: 0.1, halfX: 0.4, halfZ: 0.4 };
    const goal = fieldDestination(HATCH, piece, free);
    expect(goal).not.toBeNull();
    if (goal) {
      expect(goal.x - piece.halfX).toBeGreaterThanOrEqual(free.minX);
      expect(fieldClearance(HATCH, { ...piece, ...goal })).toBeGreaterThanOrEqual(0.08);
    }
  });

  it('parks a wall-side neighbour towards the interior, with its whole footprint inside', () => {
    const zone = { ...HATCH, x: 2.5, z: 3.1 };
    const piece = { x: 2.6, z: 3.3, halfX: 0.4, halfZ: 0.5 };
    const goal = fieldDestination(zone, piece, DESK);
    expect(goal).not.toBeNull();
    if (goal) {
      expect(fieldInside(DESK, piece, goal)).toEqual(goal);
      expect(fieldClearance(zone, { ...piece, ...goal })).toBeGreaterThanOrEqual(0.08);
      expect(goal.z).toBeLessThan(piece.z);
    }
  });

  it('reserves separate parking spots for several neighbours', () => {
    const first = { x: 0.25, z: 0.1, halfX: 0.45, halfZ: 0.5 };
    const second = { x: 0.3, z: 0.12, halfX: 0.45, halfZ: 0.5 };
    const a = fieldDestination(HATCH, first, DESK);
    const b = fieldDestination(HATCH, second, DESK, [{ ...first, ...a }]);
    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
    if (a && b) {
      expect(Math.abs(a.x - b.x) >= 0.98 || Math.abs(a.z - b.z) >= 1.08).toBe(true);
    }
  });

  it('never promises a parking spot for a footprint larger than the desk', () => {
    expect(fieldDestination(HATCH, { x: 0, z: 0, halfX: 12, halfZ: 12 }, DESK)).toBeNull();
  });

  it.each([1 / 60, 1 / 30, 1 / 120])('glides out and brakes without an impulse at dt=%s', (dt) => {
    const piece = { x: 0.2, z: 0.1, halfX: 0.4, halfZ: 0.35 };
    const goal = fieldDestination(HATCH, piece, DESK);
    expect(goal).not.toBeNull();
    if (!goal) {
      return;
    }
    let at = { x: piece.x, z: piece.z };
    let velocity = { x: 0, z: 0 };
    for (let elapsed = 0; elapsed < 2; elapsed += dt) {
      const next = fieldVelocity(at, goal, velocity, dt);
      expect(Math.hypot(next.x, next.z)).toBeLessThanOrEqual(3.2 + 0.001);
      expect(Math.hypot(next.x - velocity.x, next.z - velocity.z)).toBeLessThanOrEqual(
        10 * dt + 0.001
      );
      velocity = next;
      at = { x: at.x + velocity.x * dt, z: at.z + velocity.z * dt };
    }
    expect(fieldClearance(HATCH, { ...piece, ...at })).toBeGreaterThan(0);
    expect(Math.hypot(at.x - goal.x, at.z - goal.z)).toBeLessThan(0.02);
    expect(Math.hypot(velocity.x, velocity.z)).toBeLessThan(0.05);
  });
});
