import { type ReactNode, type RefObject, useLayoutEffect, useMemo, useRef } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  Box3,
  CanvasTexture,
  type Group,
  Matrix4,
  type Mesh,
  type PerspectiveCamera as Camera,
  SRGBColorSpace,
} from 'three';
import { type ExhibitId, type Turn } from './exhibitIds';
import { DayShiftMesh } from '../playground/dayShift';
import { makeTicket, type PropItem } from '../playground/items';
import { AgentMesh, PropMesh } from '../playground/objects';

/** These have a front worth seeing (a screen), so they sway round it instead of turning all the way. */
const FRONT_FACING = new Set<ExhibitId>(['ticket', 'night']);
/** Turntable speed when left alone, in radians a second. */
const SPIN = 0.45;
const SWAY = 0.6;
/** A tap spins a shelf piece round about once. */
const TAP_SPIN = 12;

const ticket = makeTicket(0, 'showcase-ticket');

function Exhibit({ id }: { id: ExhibitId }) {
  if (id === 'ticket') {
    return <DayShiftMesh item={ticket} />;
  }
  if (id === 'agents') {
    return <AgentMesh />;
  }
  return <PropMesh item={{ uid: `showcase-${id}`, kind: 'prop', info: id as PropItem['info'] }} />;
}

/** Lower than this against its width, an exhibit lies flat: it is stood up on a slant instead. */
const FLAT = 0.42;
const SLANT = 1.05;

/** The bounds of everything drawn under `of`, in `space`'s own coordinates. */
function measure(of: Group, space: Group): Box3 {
  space.updateWorldMatrix(true, true);
  const toLocal = new Matrix4().copy(space.matrixWorld).invert();
  const box = new Box3();
  const part = new Box3();
  const matrix = new Matrix4();
  of.traverse((object) => {
    const { geometry } = object as Mesh;
    if (!geometry || !object.visible) {
      return;
    }
    if (!geometry.boundingBox) {
      geometry.computeBoundingBox();
    }
    if (geometry.boundingBox) {
      box.union(
        part
          .copy(geometry.boundingBox)
          .applyMatrix4(matrix.multiplyMatrices(toLocal, object.matrixWorld))
      );
    }
  });
  return box;
}

/**
 * Scales whatever it holds to fit a turntable: at most `radius` from the axis
 * all the way round, at most `height` tall, standing on y = 0 and centred on
 * the axis it turns about. Things that lie flat on the desk lean back on a
 * slant, facing the camera, the way a shop shows them.
 */
function Fit({
  radius,
  height,
  upright,
  children,
}: {
  radius: number;
  height: number;
  /** Shown as it stands, flat or not. */
  upright?: boolean;
  children: ReactNode;
}) {
  const outer = useRef<Group>(null);
  const middle = useRef<Group>(null);
  const tilt = useRef<Group>(null);
  useLayoutEffect(() => {
    if (!outer.current || !middle.current || !tilt.current) {
      return;
    }
    middle.current.position.set(0, 0, 0);
    tilt.current.rotation.set(0, 0, 0);
    let box = measure(tilt.current, middle.current);
    if (box.isEmpty()) {
      return;
    }
    const spread = (b: Box3) => Math.hypot((b.max.x - b.min.x) / 2, (b.max.z - b.min.z) / 2);
    // Stood on a slant, it leans out towards the camera: a little smaller keeps it over its plinth.
    let shrink = 1;
    if (!upright && box.max.y - box.min.y < spread(box) * FLAT) {
      tilt.current.rotation.x = SLANT;
      box = measure(tilt.current, middle.current);
      shrink = 0.82;
    }
    const scale = shrink * Math.min(radius / spread(box), height / (box.max.y - box.min.y));
    outer.current.scale.setScalar(scale);
    middle.current.position.set(
      -(box.min.x + box.max.x) / 2,
      -box.min.y,
      -(box.min.z + box.max.z) / 2
    );
  }, [radius, height, upright]);
  return (
    <group ref={outer}>
      <group ref={middle}>
        <group ref={tilt}>{children}</group>
      </group>
    </group>
  );
}

/** A round soft-edged glow, as a texture: light pooled on a plinth, or a shadow under what stands on it. */
function useRadialTexture(stops: Array<[number, string]>) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      stops.forEach(([at, color]) => gradient.addColorStop(at, color));
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
    }
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
    // The stops are constants at each call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** A round plinth: a dark drum with a lit rim, a pool of light on top and a shadow where things stand. */
function Plinth({ radius, height, glow }: { radius: number; height: number; glow: number }) {
  const light = useRadialTexture([
    [0, 'rgb(255 236 214 / 0.55)'],
    [0.55, 'rgb(255 214 180 / 0.16)'],
    [1, 'rgb(0 0 0 / 0)'],
  ]);
  const shadow = useRadialTexture([
    [0, 'rgb(0 0 0 / 0.6)'],
    [0.6, 'rgb(0 0 0 / 0.25)'],
    [1, 'rgb(0 0 0 / 0)'],
  ]);
  return (
    <group>
      <mesh position={[0, -height / 2, 0]}>
        <cylinderGeometry args={[radius, radius * 1.04, height, 72]} />
        <meshStandardMaterial color="#26272e" roughness={0.38} metalness={0.55} />
      </mesh>
      <mesh position={[0, -0.003, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius - 0.015, 0.012, 8, 120]} />
        <meshBasicMaterial color="#ff6b35" transparent opacity={glow} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius - 0.03, 64]} />
        <meshBasicMaterial
          map={light}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.62, 48]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Notches round the turntable's plate, so you can see it turn whatever stands on it. */
function Notches({ radius, count }: { radius: number; count: number }) {
  return (
    <group>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        return (
          <mesh
            key={a}
            position={[Math.sin(a) * radius, 0.006, Math.cos(a) * radius]}
            rotation={[-Math.PI / 2, 0, -a]}
          >
            <planeGeometry args={[0.018, i % 6 === 0 ? 0.12 : 0.06]} />
            <meshBasicMaterial
              color={i === 0 ? '#ff6b35' : '#8d8f99'}
              transparent
              opacity={i === 0 ? 1 : 0.55}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** One camera per view, aimed at what stands on the plinth. */
function ViewCamera({ position, target }: { position: [number, number, number]; target: number }) {
  const camera = useRef<Camera>(null);
  useLayoutEffect(() => {
    camera.current?.lookAt(0, target, 0);
  }, [target]);
  return (
    <PerspectiveCamera ref={camera} makeDefault position={position} fov={28} near={0.1} far={50} />
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <hemisphereLight args={['#ffffff', '#30261f', 0.7]} />
      <directionalLight position={[3, 6, 5]} intensity={2} />
      {/* A cool light from behind, so dark edges stand out from the black page. */}
      <directionalLight position={[-4, 3, -5]} intensity={1.1} color="#9fb4ff" />
    </>
  );
}

const easeOutBack = (x: number) => 1 + 2.2 * (x - 1) ** 3 + 1.2 * (x - 1) ** 2;

/** What just arrived on the stage drops in from above and settles. */
function Arrive({ children, still }: { children: ReactNode; still?: boolean }) {
  const group = useRef<Group>(null);
  const born = useRef<number | null>(null);
  useFrame(({ clock }) => {
    if (!group.current || still) {
      return;
    }
    born.current ??= clock.elapsedTime;
    const x = Math.min(1, (clock.elapsedTime - born.current) / 0.6);
    const k = easeOutBack(x);
    group.current.scale.setScalar(0.55 + 0.45 * k);
    group.current.position.y = (1 - Math.min(1, x * 1.6)) * 0.7;
  });
  return <group ref={group}>{children}</group>;
}

/**
 * The stage: the exhibit on a turntable. It turns by itself (or sways round
 * its screen), follows a drag with a flick at the end, and spins round once
 * when tapped.
 */
export function StageScene({
  id,
  turn,
  still,
}: {
  id: ExhibitId;
  turn?: RefObject<Turn>;
  still?: boolean;
}) {
  const table = useRef<Group>(null);
  const state = useRef({ angle: 0, vel: 0, idle: 9, sway: 0 });
  const front = FRONT_FACING.has(id);

  useLayoutEffect(() => {
    // Each arrival faces the camera.
    state.current = { angle: 0, vel: 0, idle: 9, sway: 0 };
  }, [id]);

  useFrame((_, delta) => {
    if (!table.current || still) {
      return;
    }
    const dt = Math.min(delta, 0.05);
    const s = state.current;
    const input = turn?.current;
    if (input?.flick) {
      s.vel += input.flick;
      input.flick = 0;
      s.idle = 0;
    }
    if (input?.held) {
      const step = input.drag;
      input.drag = 0;
      s.angle += step;
      s.vel += (step / dt - s.vel) * 0.5;
      s.idle = 0;
    } else {
      s.idle += dt;
      s.vel *= Math.exp(-dt * 2.2);
      s.angle += s.vel * dt;
      // Left alone a moment, it goes back to turning (or swaying) by itself.
      const settle = 1 - Math.exp(-dt * 1.2);
      if (s.idle > 1.2 && Math.abs(s.vel) < 1) {
        if (front) {
          s.sway += dt;
          const base = Math.round(s.angle / (Math.PI * 2)) * Math.PI * 2;
          s.angle += (base + Math.sin(s.sway * 0.55) * SWAY - s.angle) * settle;
        } else {
          s.vel += (SPIN - s.vel) * settle;
        }
      }
    }
    table.current.rotation.y = s.angle;
  });

  return (
    <>
      <ViewCamera position={[0, 2.2, 5.9]} target={0.42} />
      <Lights />
      <Plinth radius={1.5} height={0.34} glow={0.9} />
      <group ref={table}>
        <Notches radius={1.36} count={48} />
        <Arrive key={id} still={still}>
          <Fit radius={front ? 1.4 : 1.25} height={1.55} upright={id === 'agents'}>
            <Exhibit id={id} />
          </Fit>
        </Arrive>
      </group>
    </>
  );
}

/**
 * One of the shelf's holders, turning slowly. Picked, its plinth lights up
 * and it spins round, once more for every tap.
 */
export function HolderScene({
  id,
  picked,
  spins = 0,
  phase = 0,
  still,
}: {
  id: ExhibitId;
  picked?: boolean;
  /** Taps so far: each new one spins it round. */
  spins?: number;
  phase?: number;
  still?: boolean;
}) {
  const spinner = useRef<Group>(null);
  const state = useRef({ angle: phase, vel: 0 });
  useLayoutEffect(() => {
    if (spins > 0) {
      state.current.vel += TAP_SPIN;
    }
  }, [spins]);
  useFrame((_, delta) => {
    if (!spinner.current || still) {
      return;
    }
    const dt = Math.min(delta, 0.05);
    const s = state.current;
    s.vel *= Math.exp(-dt * 2.2);
    s.angle += (0.5 + s.vel) * dt;
    spinner.current.rotation.y = s.angle;
  });
  return (
    <>
      <ViewCamera position={[0, 2.1, 5.5]} target={0.36} />
      <Lights />
      <Plinth radius={1.25} height={0.26} glow={picked ? 1 : 0.55} />
      <group ref={spinner} rotation={[0, phase, 0]}>
        <Fit radius={1.15} height={1.5}>
          <Exhibit id={id} />
        </Fit>
      </group>
    </>
  );
}
