import { type Point } from './robotPath';

/** The desk's sides widen towards its far edge. */
export type FieldBounds = {
  minX: number;
  maxX: number;
  farMinX: number;
  farMaxX: number;
  zFar: number;
  zNear: number;
};

/** Half sizes in world axes, including the piece's current heading. */
export type FieldFootprint = Point & { halfX: number; halfZ: number };
export type ClearZone = FieldFootprint & { radius: number };

/** Clear of both the round mouth and the incoming piece's corners. Negative means overlap. */
export function fieldClearance(zone: ClearZone, piece: FieldFootprint): number {
  const dx = Math.abs(piece.x - zone.x);
  const dz = Math.abs(piece.z - zone.z);
  const mouth = Math.hypot(Math.max(0, dx - piece.halfX), Math.max(0, dz - piece.halfZ));
  const footprint = Math.max(dx - zone.halfX - piece.halfX, dz - zone.halfZ - piece.halfZ);
  return Math.min(mouth - zone.radius, footprint);
}

/** Keep the whole footprint inside the walls, including both ends along the sloping sides. */
export function fieldInside(bounds: FieldBounds, piece: FieldFootprint, point: Point): Point {
  const inset = 0.08;
  const near = bounds.zNear - piece.halfZ - inset;
  const far = bounds.zFar + piece.halfZ + inset;
  const z = far > near ? (bounds.zNear + bounds.zFar) / 2 : Math.max(far, Math.min(near, point.z));
  const span = (at: number) => {
    const t = Math.max(0, Math.min(1, (bounds.zNear - at) / (bounds.zNear - bounds.zFar)));
    return [
      bounds.minX + (bounds.farMinX - bounds.minX) * t,
      bounds.maxX + (bounds.farMaxX - bounds.maxX) * t,
    ];
  };
  const front = span(z + piece.halfZ);
  const back = span(z - piece.halfZ);
  const left = Math.max(front[0], back[0]) + piece.halfX + inset;
  const right = Math.min(front[1], back[1]) - piece.halfX - inset;
  return { x: left > right ? (left + right) / 2 : Math.max(left, Math.min(right, point.x)), z };
}

/** How far a footprint at `point` reaches past `bounds`: 0 when it is wholly inside. */
export function fieldOverhang(bounds: FieldBounds, piece: FieldFootprint, point: Point): number {
  const inside = fieldInside(bounds, piece, point);
  return Math.hypot(inside.x - point.x, inside.z - point.z);
}

/** What a straight slide to `to` costs on top of its length: back across the hatch, or through parked pieces. */
function slideDetour(
  zone: ClearZone,
  piece: FieldFootprint,
  to: Point,
  reserved: FieldFootprint[]
): number {
  const start = fieldClearance(zone, piece);
  let hatch = 0;
  const crossed = new Set<FieldFootprint>();
  for (let step = 1; step <= 8; step++) {
    const f = step / 8;
    const at = { ...piece, x: piece.x + (to.x - piece.x) * f, z: piece.z + (to.z - piece.z) * f };
    if (fieldClearance(zone, at) < start - 0.05) {
      hatch = 4;
    }
    reserved.forEach((other) => {
      if (
        Math.abs(other.x - at.x) < other.halfX + at.halfX &&
        Math.abs(other.z - at.z) < other.halfZ + at.halfZ
      ) {
        crossed.add(other);
      }
    });
  }
  return hatch + crossed.size * 1.2;
}

/**
 * Where a piece in the hatch's way slides to: clear of it, inside the walls
 * (`bounds`), on no other piece's spot, by the shortest and straightest slide.
 * It would rather keep beside the text (`preferred`), but a short slide a
 * little past it beats a long trip across the desk; its middle never ends up
 * past it, unless the desk beside the text has no room left at all. Sliding
 * back across the hatch or through parked pieces costs extra.
 */
export function fieldDestination(
  zone: ClearZone,
  piece: FieldFootprint,
  bounds: FieldBounds,
  reserved: FieldFootprint[] = [],
  preferred: FieldBounds = bounds
): Point | null {
  return (
    parkingSpot(zone, piece, bounds, reserved, preferred) ??
    (preferred === bounds ? null : parkingSpot(zone, piece, bounds, reserved, bounds))
  );
}

function parkingSpot(
  zone: ClearZone,
  piece: FieldFootprint,
  bounds: FieldBounds,
  reserved: FieldFootprint[],
  preferred: FieldBounds
): Point | null {
  const dx = piece.x - zone.x;
  const dz = piece.z - zone.z;
  const centreX = (bounds.minX + bounds.maxX + bounds.farMinX + bounds.farMaxX) / 4;
  const centreZ = (bounds.zFar + bounds.zNear) / 2;
  const heading =
    Math.hypot(dx, dz) > 0.01 ? Math.atan2(dz, dx) : Math.atan2(centreZ - zone.z, centreX - zone.x);
  const reach =
    zone.radius + Math.hypot(zone.halfX, zone.halfZ) + Math.hypot(piece.halfX, piece.halfZ) + 0.3;
  // Already past the preferred edge, it is not charged for what it already overhangs.
  const overhung = fieldOverhang(preferred, piece, piece);
  const middle = { ...piece, halfX: 0, halfZ: 0 };
  const middleOut = fieldOverhang(preferred, middle, piece);
  let best: Point | null = null;
  let cost = Infinity;
  for (let i = 0; i < 32; i++) {
    const turn = i === 0 ? 0 : Math.ceil(i / 2) * (i % 2 ? 1 : -1) * (Math.PI / 16);
    const angle = heading + turn;
    const x = Math.cos(angle);
    const z = Math.sin(angle);
    let lo = 0;
    let hi = reach;
    for (let j = 0; j < 14; j++) {
      const radius = (lo + hi) / 2;
      const at = { ...piece, x: zone.x + x * radius, z: zone.z + z * radius };
      if (fieldClearance(zone, at) < 0.12) {
        lo = radius;
      } else {
        hi = radius;
      }
    }
    for (let extra = 0; extra <= 1.4; extra += 0.35) {
      const wanted = { x: zone.x + x * (hi + extra), z: zone.z + z * (hi + extra) };
      const candidate = fieldInside(bounds, piece, wanted);
      if (
        Math.hypot(candidate.x - wanted.x, candidate.z - wanted.z) > 0.04 ||
        fieldClearance(zone, { ...piece, ...candidate }) < 0.08
      ) {
        continue;
      }
      const occupied = reserved.some(
        (other) =>
          Math.abs(other.x - candidate.x) < other.halfX + piece.halfX + 0.08 &&
          Math.abs(other.z - candidate.z) < other.halfZ + piece.halfZ + 0.08
      );
      if (occupied) {
        continue;
      }
      if (fieldOverhang(preferred, middle, candidate) > middleOut + 0.001) {
        continue;
      }
      const overhang = fieldOverhang(preferred, piece, candidate);
      const distance =
        Math.hypot(candidate.x - piece.x, candidate.z - piece.z) +
        Math.abs(turn) * 0.4 +
        Math.max(0, overhang - overhung) * 2 +
        slideDetour(zone, piece, candidate, reserved);
      if (distance < cost) {
        best = candidate;
        cost = distance;
      }
    }
  }
  return best;
}

/** Accelerate gently, then brake into the destination instead of coasting past it. */
export function fieldVelocity(at: Point, goal: Point, velocity: Point, dt: number): Point {
  const dx = goal.x - at.x;
  const dz = goal.z - at.z;
  const distance = Math.hypot(dx, dz);
  const speed = Math.min(3.2, distance * 7);
  const gain = 1 - Math.exp(-12 * dt);
  const changeX = ((dx / Math.max(distance, 0.001)) * speed - velocity.x) * gain;
  const changeZ = ((dz / Math.max(distance, 0.001)) * speed - velocity.z) * gain;
  const limit = Math.min(1, (10 * dt) / Math.max(0.001, Math.hypot(changeX, changeZ)));
  return { x: velocity.x + changeX * limit, z: velocity.z + changeZ * limit };
}
