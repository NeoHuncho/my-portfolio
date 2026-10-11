import { type ReactNode, type Ref, useMemo } from 'react';
import { type ThreeElements } from '@react-three/fiber';
import { type BufferGeometry, ExtrudeGeometry, type Mesh, Shape } from 'three';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const EPS = 0.00001;

/**
 * Each size, built once a page and shared. Every rounded box on the desk,
 * the tray and the phone's shelf creases its normals as it is built, which
 * takes a few milliseconds each time; the same boxes come up again and again.
 */
const built = new Map<string, BufferGeometry>();

function roundedBoxGeometry(
  width: number,
  height: number,
  depth: number,
  radius: number,
  steps: number,
  smoothness: number,
  bevelSegments: number,
  creaseAngle: number
): BufferGeometry {
  const key = [width, height, depth, radius, steps, smoothness, bevelSegments, creaseAngle].join(
    ' '
  );
  const cached = built.get(key);
  if (cached) {
    return cached;
  }
  // The outline drei's rounded box extrudes, rounded by the bevel all round.
  const shape = new Shape();
  const r = radius - EPS;
  shape.absarc(EPS, EPS, EPS, -Math.PI / 2, -Math.PI, true);
  shape.absarc(EPS, height - r * 2, EPS, Math.PI, Math.PI / 2, true);
  shape.absarc(width - r * 2, height - r * 2, EPS, Math.PI / 2, 0, true);
  shape.absarc(width - r * 2, EPS, EPS, 0, -Math.PI / 2, true);
  const geometry = new ExtrudeGeometry(shape, {
    depth: depth - radius * 2,
    bevelEnabled: true,
    bevelSegments: bevelSegments * 2,
    steps,
    bevelSize: radius - EPS,
    bevelThickness: radius,
    curveSegments: smoothness,
  });
  geometry.center();
  const creased = toCreasedNormals(geometry, creaseAngle);
  built.set(key, creased);
  return creased;
}

type RoundedBoxProps = Omit<ThreeElements['mesh'], 'args' | 'ref'> & {
  args?: [number?, number?, number?];
  radius?: number;
  steps?: number;
  smoothness?: number;
  bevelSegments?: number;
  creaseAngle?: number;
  ref?: Ref<Mesh>;
  children?: ReactNode;
};

/** drei's `RoundedBox`, the same shape and the same normals, its geometry shared between boxes of a size. */
export function RoundedBox({
  args: [width = 1, height = 1, depth = 1] = [],
  radius = 0.05,
  steps = 1,
  smoothness = 4,
  bevelSegments = 4,
  creaseAngle = 0.4,
  children,
  ...rest
}: RoundedBoxProps) {
  const geometry = useMemo(
    () =>
      roundedBoxGeometry(
        width,
        height,
        depth,
        radius,
        steps,
        smoothness,
        bevelSegments,
        creaseAngle
      ),
    [width, height, depth, radius, steps, smoothness, bevelSegments, creaseAngle]
  );
  return (
    <mesh geometry={geometry} {...rest}>
      {children}
    </mesh>
  );
}
