import { type RefObject, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { type RapierRigidBody } from '@react-three/rapier';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  ShaderMaterial,
  Vector4,
} from 'three';
import { useQuality } from '../quality';

/** The desk's edges on the floor: the near one narrowest, the sides splaying out to the far one. */
export type FieldBounds = {
  minX: number;
  maxX: number;
  farMinX: number;
  farMaxX: number;
  zFar: number;
  zNear: number;
};

/** How tall the field stands, about as tall as the tallest things on the desk. */
const HEIGHT = 1;
/** How far its glow reaches in across the desk, and how far above the floor that lies. */
const APRON = 0.7;
const LIFT = 0.004;
/** A thing's edge this close to a wall (world units) starts to light it up, fully by the second. */
export const GLOW_FROM = 0.4;
const GLOW_FULL = 0.03;
/** Hot spots and ripples drawn at once. */
const SPOTS = 6;
const RIPPLES = 6;
/** How long a ripple runs, and the slowest knock that starts one. */
const RIPPLE_S = 0.9;
const RIPPLE_MIN_SPEED = 0.6;
/** One knock per thing at most this often, so a body rubbing along the wall does not stutter. */
const RIPPLE_GAP_S = 0.25;

/** The four edges in order round the desk: near, right, far, left. */
function corners(bounds: FieldBounds): Array<[number, number]> {
  const { minX, maxX, farMinX, farMaxX, zFar, zNear } = bounds;
  return [
    [minX, zNear],
    [maxX, zNear],
    [farMaxX, zFar],
    [farMinX, zFar],
  ];
}

/**
 * Per edge, an upright quad and a strip on the floor just inside it, both
 * carrying how far round the desk they are, how high and how far in, so the
 * pattern runs on unbroken from one wall to the next. Seen from above, the
 * strip is what shows most.
 */
function makeWalls(bounds: FieldBounds) {
  const points = corners(bounds);
  const middleX = points.reduce((sum, [x]) => sum + x, 0) / 4;
  const middleZ = points.reduce((sum, [, z]) => sum + z, 0) / 4;
  const positions: number[] = [];
  // How far round, how high (0–1), on the near edge, how far in (0–1).
  const field: number[] = [];
  const index: number[] = [];
  const quad = (corners: number[], attributes: number[]) => {
    const base = positions.length / 3;
    positions.push(...corners);
    field.push(...attributes);
    index.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };
  let s = 0;
  for (let edge = 0; edge < 4; edge++) {
    const [ax, az] = points[edge];
    const [bx, bz] = points[(edge + 1) % 4];
    const length = Math.hypot(bx - ax, bz - az);
    const near = edge === 0 ? 1 : 0;
    const e = s + length;
    quad(
      [ax, 0, az, bx, 0, bz, bx, HEIGHT, bz, ax, HEIGHT, az],
      [s, 0, near, 0, e, 0, near, 0, e, 1, near, 0, s, 1, near, 0]
    );
    // Inwards, square to the edge, towards the middle of the desk.
    let nx = -(bz - az) / length;
    let nz = (bx - ax) / length;
    if (nx * (middleX - ax) + nz * (middleZ - az) < 0) {
      nx = -nx;
      nz = -nz;
    }
    const [ix, iz] = [nx * APRON, nz * APRON];
    quad(
      [ax, LIFT, az, ax + ix, LIFT, az + iz, bx + ix, LIFT, bz + iz, bx, LIFT, bz],
      [s, 0, near, 0, s, 0, near, 1, e, 0, near, 1, e, 0, near, 0]
    );
    s = e;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('field', new BufferAttribute(new Float32Array(field), 4));
  geometry.setIndex(index);
  return { geometry };
}

function makeMaterial(hex: boolean) {
  return new ShaderMaterial({
    defines: hex ? { HEX: '' } : {},
    uniforms: {
      time: { value: 0 },
      spots: { value: Array.from({ length: SPOTS }, () => new Vector4()) },
      ripples: { value: Array.from({ length: RIPPLES }, () => new Vector4(0, 0, 0, -10)) },
      strengths: { value: new Array<number>(RIPPLES).fill(0) },
      cool: { value: new Color('#9fb2c6') },
      hot: { value: new Color('#ff6b35') },
      core: { value: new Color('#ffd9c2') },
    },
    vertexShader: /* glsl */ `
      attribute vec4 field;
      varying vec3 vWorld;
      varying vec4 vField;
      void main() {
        vField = field;
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      #define SPOTS ${SPOTS}
      #define RIPPLES ${RIPPLES}
      uniform float time;
      uniform vec4 spots[SPOTS];
      uniform vec4 ripples[RIPPLES];
      uniform float strengths[RIPPLES];
      uniform vec3 cool;
      uniform vec3 hot;
      uniform vec3 core;
      varying vec3 vWorld;
      varying vec4 vField;

      // 0 inside a hex cell, 1 on its rim.
      float hexRim(vec2 p) {
        const vec2 r = vec2(1.0, 1.7320508);
        vec2 a = mod(p, r) - r * 0.5;
        vec2 b = mod(p - r * 0.5, r) - r * 0.5;
        vec2 g = dot(a, a) < dot(b, b) ? a : b;
        vec2 q = abs(g);
        float d = max(dot(q, vec2(0.8660254, 0.5)), q.y);
        float w = fwidth(d) * 1.2;
        return smoothstep(0.43 - w, 0.47, d);
      }

      void main() {
        float s = vField.x;
        float v = vField.y;
        // Strongest along the desk, thinning out to nothing at the top.
        float inset = vField.w;
        // Up the wall and in across the floor, measured from the edge.
        float fromEdge = vWorld.y + inset * ${APRON.toFixed(2)};
        float rise = pow(clamp(1.0 - v, 0.0, 1.0), 1.6) * pow(clamp(1.0 - inset, 0.0, 1.0), 2.2);
        float floorLine = exp(-fromEdge * 38.0);

        // Where things come close, the wall warms up round them.
        float glow = 0.0;
        for (int i = 0; i < SPOTS; i++) {
          vec3 d = vWorld - spots[i].xyz;
          // On the floor only how far along and in counts: whatever is held up still lights it.
          d.y *= inset > 0.0 ? 0.0 : 1.4;
          glow += spots[i].w * exp(-dot(d, d) * 1.6);
        }

        // Where something knocks it, a ring runs out across the wall and fades.
        float ring = 0.0;
        float flash = 0.0;
        for (int i = 0; i < RIPPLES; i++) {
          float age = (time - ripples[i].w) / ${RIPPLE_S.toFixed(2)};
          if (age < 0.0 || age > 1.0) continue;
          float d = length(vWorld - ripples[i].xyz);
          float front = 0.1 + age * 1.9;
          float fade = (1.0 - age) * (1.0 - age) * strengths[i];
          ring += exp(-pow((d - front) / 0.09, 2.0)) * fade;
          flash += exp(-d * d * 9.0) * fade * (1.0 - age);
        }

        float pattern = 0.35;
        #ifdef HEX
          pattern = 0.25 + hexRim(vec2(s, fromEdge) * 6.5) * 0.9;
        #endif
        float lit = clamp(glow, 0.0, 1.2);
        // Nothing at rest: only what comes close or knocks it shows the field.
        float energy = lit * pattern * rise * 0.8 + lit * floorLine * 0.7
                     + ring * (0.5 + pattern * 0.5) * rise + flash * 0.9;
        // The near wall stands between the camera and the desk: keep it low-key.
        energy *= mix(1.0, 0.45, vField.z);
        if (energy < 0.002) discard;
        vec3 tint = mix(cool, hot, clamp(lit + ring * 1.5, 0.0, 1.0));
        tint = mix(tint, core, clamp(flash * 1.5 + ring * 0.4, 0.0, 1.0));
        // Alpha adds up with the light, so the see-through canvas glows instead of going dark.
        gl_FragColor = vec4(tint, min(energy, 1.0));
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    toneMapped: false,
  });
}

/** The nearest point on segment a–b to p, on the floor, written into `into`. */
function nearestOnEdge(
  px: number,
  pz: number,
  [ax, az]: [number, number],
  [bx, bz]: [number, number],
  into: [number, number]
) {
  const dx = bx - ax;
  const dz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1)));
  into[0] = ax + dx * t;
  into[1] = az + dz * t;
  return Math.hypot(px - into[0], pz - into[1]);
}

type Spot = { x: number; y: number; z: number; w: number };

/**
 * A force field round the desk, on the walls that keep things on it: unseen
 * at rest, it warms up where something comes near and ripples where it is
 * knocked. `hits` is filled by the walls with whatever just bumped into
 * them; the field empties it every frame.
 */
export function ForceField({
  bounds,
  bodies,
  halfSize,
  hits,
}: {
  bounds: FieldBounds;
  bodies: Map<string, RapierRigidBody>;
  /** Half the width and depth each thing takes on the desk, by its uid. */
  halfSize: (uid: string) => [number, number];
  hits: RefObject<RapierRigidBody[]>;
}) {
  const quality = useQuality();
  const invalidate = useThree((state) => state.invalidate);
  const { minX, maxX, farMinX, farMaxX, zFar, zNear } = bounds;
  const walls = useMemo(
    () => makeWalls({ minX, maxX, farMinX, farMaxX, zFar, zNear }),
    [minX, maxX, farMinX, farMaxX, zFar, zNear]
  );
  const material = useMemo(() => makeMaterial(quality !== 'low'), [quality]);
  const edges = useMemo(
    () => corners({ minX, maxX, farMinX, farMaxX, zFar, zNear }),
    [minX, maxX, farMinX, farMaxX, zFar, zNear]
  );
  useEffect(() => () => walls.geometry.dispose(), [walls]);
  useEffect(() => () => material.dispose(), [material]);

  const scratch = useMemo(
    () => ({
      point: [0, 0] as [number, number],
      candidates: Array.from({ length: 64 }, (): Spot => ({ x: 0, y: 0, z: 0, w: 0 })),
      knocked: new Map<RapierRigidBody, number>(),
      next: 0,
    }),
    []
  );
  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const { uniforms } = material;
    uniforms.time.value = time;

    // Every edge each thing is close to, warmest first.
    let count = 0;
    bodies.forEach((body, uid) => {
      const { x, y, z } = body.translation();
      const [halfX, halfZ] = halfSize(uid);
      // Its own sides across the floor, turned as it is.
      const q = body.rotation();
      const sideX = 1 - 2 * (q.y * q.y + q.z * q.z);
      const sideZ = 2 * (q.x * q.z - q.w * q.y);
      const frontX = 2 * (q.x * q.z + q.w * q.y);
      const frontZ = 1 - 2 * (q.x * q.x + q.y * q.y);
      for (let edge = 0; edge < 4; edge++) {
        const distance = nearestOnEdge(x, z, edges[edge], edges[(edge + 1) % 4], scratch.point);
        // How far it reaches towards the wall, and the gap left between them.
        const nx = (x - scratch.point[0]) / (distance || 1);
        const nz = (z - scratch.point[1]) / (distance || 1);
        const reach =
          halfX * Math.abs(sideX * nx + sideZ * nz) + halfZ * Math.abs(frontX * nx + frontZ * nz);
        const gap = distance - reach;
        const w = 1 - Math.min(1, Math.max(0, (gap - GLOW_FULL) / (GLOW_FROM - GLOW_FULL)));
        if (w > 0.01 && count < scratch.candidates.length) {
          const spot = scratch.candidates[count++];
          spot.x = scratch.point[0];
          spot.z = scratch.point[1];
          spot.y = Math.min(HEIGHT * 0.85, Math.max(0.15, y));
          spot.w = w * w;
        }
      }
    });
    const warm = scratch.candidates.slice(0, count).sort((a, b) => b.w - a.w);
    const spots = uniforms.spots.value as Vector4[];
    for (let i = 0; i < SPOTS; i++) {
      const spot = warm[i];
      spots[i].set(spot?.x ?? 0, spot?.y ?? 0, spot?.z ?? 0, spot?.w ?? 0);
    }

    // Knocks since the last frame, each from the nearest point on the wall it hit.
    const ripples = uniforms.ripples.value as Vector4[];
    const strengths = uniforms.strengths.value as number[];
    const queue = hits.current;
    if (queue) {
      for (const body of queue) {
        const { x, y, z } = body.translation();
        const { x: vx, y: vy, z: vz } = body.linvel();
        const speed = Math.hypot(vx, vy, vz);
        const last = scratch.knocked.get(body) ?? -Infinity;
        if (speed < RIPPLE_MIN_SPEED || time - last < RIPPLE_GAP_S) {
          continue;
        }
        scratch.knocked.set(body, time);
        let best = Infinity;
        let hx = x;
        let hz = z;
        for (let edge = 0; edge < 4; edge++) {
          const distance = nearestOnEdge(x, z, edges[edge], edges[(edge + 1) % 4], scratch.point);
          if (distance < best) {
            best = distance;
            [hx, hz] = scratch.point;
          }
        }
        const slot = scratch.next++ % RIPPLES;
        ripples[slot].set(hx, Math.min(HEIGHT * 0.8, Math.max(0.12, y)), hz, time);
        strengths[slot] = Math.min(1, Math.max(0.3, speed / 6));
      }
      queue.length = 0;
    }

    // Only a ripple asks for frames: things moving near it already draw them.
    if (ripples.some((ripple) => time - ripple.w < RIPPLE_S)) {
      invalidate();
    }
  });

  return (
    <mesh
      geometry={walls.geometry}
      material={material}
      frustumCulled={false}
      renderOrder={2}
      raycast={() => null}
    />
  );
}
