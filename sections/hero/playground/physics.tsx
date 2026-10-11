import { type ComponentProps, createContext, useContext } from 'react';
import type * as Rapier from '@react-three/rapier';

/**
 * The physics engine, as the desk hands it to the objects on it. The same
 * objects also stand still on the phone's turntable and shelf and in the
 * desk's tray, with no physics at all: there, nothing provides it, their
 * colliders are left out, and the engine (a WebAssembly build, 800 KB
 * compressed) is never downloaded. So nothing outside the desk imports it:
 * the objects take their colliders from here.
 */
export type PhysicsKit = Pick<
  typeof Rapier,
  'CuboidCollider' | 'CylinderCollider' | 'ConvexHullCollider' | 'useRapier'
>;

export const PhysicsKitContext = createContext<PhysicsKit | null>(null);

/** The engine, on the desk; null where the objects only stand on show. */
export function usePhysicsKit(): PhysicsKit | null {
  return useContext(PhysicsKitContext);
}

export function CuboidCollider(props: ComponentProps<PhysicsKit['CuboidCollider']>) {
  const kit = usePhysicsKit();
  return kit ? <kit.CuboidCollider {...props} /> : null;
}

export function CylinderCollider(props: ComponentProps<PhysicsKit['CylinderCollider']>) {
  const kit = usePhysicsKit();
  return kit ? <kit.CylinderCollider {...props} /> : null;
}

export function ConvexHullCollider(props: ComponentProps<PhysicsKit['ConvexHullCollider']>) {
  const kit = usePhysicsKit();
  return kit ? <kit.ConvexHullCollider {...props} /> : null;
}

/** Rapier's rule for two colliders' friction: the lower of the two (its `CoefficientCombineRule.Min`). */
export const FRICTION_MIN = 1 as Rapier.CoefficientCombineRule;
