import { type ReactNode, type RefObject, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
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
import { type ExhibitId, SHIFTS, type TrioTurn, type Turn } from './exhibitIds';
import { DayShiftMesh } from '../playground/dayShift';
import { buildExtra, type KeycapItem, makeTicket, type PropItem } from '../playground/items';
import { AgentMesh, KeycapMesh, PropMesh } from '../playground/objects';

/** These have a front worth seeing (a screen), so they sway round it instead of turning all the way. */
const FRONT_FACING = new Set<ExhibitId>(['ticket', 'night']);
/** Turntable speed when left alone, in radians a second. */
const SPIN = 0.45;
const SWAY = 0.6;
/** A tap spins a shelf piece round about once. */
const TAP_SPIN = 12;
const TAU = Math.PI * 2;

const ticket = makeTicket(0, 'showcase-ticket');
const slash = buildExtra('keys') as KeycapItem;

function Exhibit({ id }: { id: ExhibitId }) {
  if (id === 'ticket') {
    return <DayShiftMesh item={ticket} />;
  }
  if (id === 'agents') {
    return <AgentMesh />;
  }
  if (id === 'keys') {
    return <KeycapMesh item={slash} />;
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
  const texture = useMemo(() => {
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
  // A material let go of keeps its map: the texture goes with whatever made it.
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
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
    // Two draws in the same instant: nothing to move, and nothing to divide by.
    if (dt <= 0) {
      return;
    }
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

/** A tray piece's turn when left alone, in radians a second. */
const THUMB_SPIN = 0.6;
/**
 * Pointed at, it springs round to face the viewer: this stiff, critically
 * damped, so it slows into place without swinging past.
 */
const FACE_STIFFNESS = 22;
/** Then it bobs gently where it stands: this high, this often (radians a second). */
const BOB_HEIGHT = 0.05;
const BOB_RATE = 3.2;

/**
 * One piece in the desk's tray, small: just the piece turning over a soft
 * shadow, framed with room round it so nothing is cut off. Pointed at, it
 * turns on round to face the viewer, the way it was already going, stops
 * there and bobs gently; let go, it picks up its turn again. Once on the
 * desk, it faces the viewer and stands still.
 */
export function ThumbScene({
  id,
  hovered,
  added,
  phase = 0,
  still,
}: {
  id: ExhibitId;
  hovered?: boolean;
  /** Already on the desk. */
  added?: boolean;
  phase?: number;
  /** Frozen where it starts, for its still. */
  still?: boolean;
}) {
  const spinner = useRef<Group>(null);
  const state = useRef({
    angle: phase,
    vel: THUMB_SPIN,
    grow: 0,
    bob: 0,
    goal: null as number | null,
  });
  const shadow = useRadialTexture([
    [0, 'rgb(0 0 0 / 0.55)'],
    [0.6, 'rgb(0 0 0 / 0.2)'],
    [1, 'rgb(0 0 0 / 0)'],
  ]);
  useFrame((_, delta) => {
    if (!spinner.current || still) {
      return;
    }
    const dt = Math.min(delta, 0.05);
    const s = state.current;
    const facing = hovered || added;
    // On the desk already, it stands still: no growing, no bob.
    s.grow += ((hovered && !added ? 1 : 0) - s.grow) * (1 - Math.exp(-dt * 8));
    if (facing) {
      // The nearest front ahead of where its turn would carry it, so it never doubles back far.
      s.goal ??= Math.round((s.angle + s.vel * 0.45) / TAU) * TAU;
      const pull = (s.goal - s.angle) * FACE_STIFFNESS - s.vel * 2 * Math.sqrt(FACE_STIFFNESS);
      s.vel += pull * dt;
      s.angle += s.vel * dt;
    } else {
      s.goal = null;
      s.vel += (THUMB_SPIN - s.vel) * (1 - Math.exp(-dt * 2.5));
      s.angle += s.vel * dt;
    }
    // The bob comes in as it settles to the front, and goes as it lets go.
    const settled = s.goal === null ? 0 : Math.max(0, 1 - Math.abs(s.goal - s.angle) * 3);
    s.bob += dt * BOB_RATE;
    spinner.current.rotation.y = s.angle;
    spinner.current.position.y = Math.sin(s.bob) * BOB_HEIGHT * s.grow * settled;
    spinner.current.scale.setScalar(1 + s.grow * 0.08);
  });
  return (
    <>
      <ViewCamera position={[0, 1.9, 5.3]} target={0.62} />
      <Lights />
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.05, 32]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={spinner} rotation={[0, phase, 0]}>
        <Fit radius={1.08} height={1.45}>
          <Exhibit id={id} />
        </Fit>
      </group>
    </>
  );
}

/** How far from the middle of the turntable each piece of how I work stands, and the turn between them. */
const TRIO_RADIUS = 1.4;
const TRIO_STEP = (Math.PI * 2) / SHIFTS.length;
/** How hard the turntable springs to the piece it settles on, and how much it is damped. */
const SETTLE_STIFFNESS = 28;
const SETTLE_DAMPING = 0.95;
/** Let go, it turns at most this fast (radians a second), and a flick reaches at most this much further. */
const MAX_SPIN = 4;
const FLICK_REACH = TRIO_STEP * 0.55;
/**
 * How much each piece turns with the table as it goes round: a little, so it
 * still feels round. Smooth all the way round, so a piece passing behind
 * never snaps from one side to the other: the two behind turn about half a
 * radian with it, the one in front not at all.
 */
const FOLLOW = 0.53;
/** A tapped piece jumps this high and turns round once, over this long. */
const HOP_HEIGHT = 0.42;
const HOP_SECONDS = 0.7;

/**
 * How I work, on one turntable: my day shift, my agents and their night
 * shift a third of a turn apart, the one in front facing the camera and the
 * other two behind it on either side. A sideways drag turns it, and on
 * letting go it settles on the piece nearest the front, or the next one along
 * after a flick. A tap makes the piece in front jump and spin.
 */
export function TrioScene({
  step,
  turn,
  onStep,
  still,
}: {
  /** The piece in front, from day to night. */
  step: number;
  turn?: RefObject<TrioTurn>;
  /** A drag settled on a piece. */
  onStep?: (step: number) => void;
  still?: boolean;
}) {
  const table = useRef<Group>(null);
  const stands = useRef<Array<Group | null>>([]);
  const pieces = useRef<Array<Group | null>>([]);
  const state = useRef({
    angle: -step * TRIO_STEP,
    vel: 0,
    goal: -step * TRIO_STEP,
    held: false,
    taps: 0,
    hopAt: -Infinity,
    hopOf: step,
    time: 0,
    /** The piece in front when the swipe began. */
    from: step,
  });

  // Picked from the steps underneath: turn the short way round to it.
  useLayoutEffect(() => {
    const s = state.current;
    const wanted = -step * TRIO_STEP;
    s.goal = wanted + Math.round((s.angle - wanted) / (Math.PI * 2)) * Math.PI * 2;
  }, [step]);

  useFrame((_, delta) => {
    if (!table.current || still) {
      return;
    }
    const dt = Math.min(delta, 0.05);
    // Two draws in the same instant: nothing to move, and nothing to divide by.
    if (dt <= 0) {
      return;
    }
    const s = state.current;
    s.time += dt;
    const input = turn?.current;
    // Whatever the finger moved since the last frame, even if it has let go since.
    const moved = input?.drag ?? 0;
    if (input) {
      input.drag = 0;
    }
    if (input?.held || moved !== 0) {
      if (!s.held) {
        s.from = Math.round(-s.angle / TRIO_STEP);
      }
      s.held = true;
      s.angle += moved;
      s.vel += (moved / dt - s.vel) * 0.5;
    }
    if (!input?.held) {
      if (s.held) {
        // Let go: settle on the piece it is heading for, a flick carrying it one further,
        // but never more than one piece on from where the swipe began, and calmly.
        s.held = false;
        s.vel = Math.max(-MAX_SPIN, Math.min(MAX_SPIN, s.vel));
        const flick = Math.max(-FLICK_REACH, Math.min(FLICK_REACH, s.vel * 0.12));
        const nearest = Math.round(-(s.angle + flick) / TRIO_STEP);
        const turns = Math.max(s.from - 1, Math.min(s.from + 1, nearest));
        s.goal = -turns * TRIO_STEP;
        onStep?.(((turns % SHIFTS.length) + SHIFTS.length) % SHIFTS.length);
      }
      const spring =
        (s.goal - s.angle) * SETTLE_STIFFNESS -
        s.vel * 2 * Math.sqrt(SETTLE_STIFFNESS) * SETTLE_DAMPING;
      s.vel += spring * dt;
      s.angle += s.vel * dt;
    }
    if (input && input.taps !== s.taps) {
      s.taps = input.taps;
      s.hopAt = s.time;
      // Whichever piece is in front right now, even halfway through a turn.
      const front = Math.round(-s.angle / TRIO_STEP);
      s.hopOf = ((front % SHIFTS.length) + SHIFTS.length) % SHIFTS.length;
    }
    // Left alone, it sways a little, so it reads as something to turn.
    const angle = s.angle + (s.held ? 0 : Math.sin(s.time * 0.7) * 0.06);
    table.current.rotation.y = angle;
    // Each piece keeps its front to the viewer as it goes round, turning only a little with the table.
    stands.current.forEach((stand, i) => {
      if (stand) {
        stand.rotation.y = -angle + Math.sin(i * TRIO_STEP + angle) * FOLLOW;
      }
    });
    pieces.current.forEach((piece, i) => {
      if (!piece) {
        return;
      }
      const t = (s.time - s.hopAt) / HOP_SECONDS;
      const hopping = i === s.hopOf && t >= 0 && t < 1;
      piece.position.y = hopping ? Math.sin(Math.PI * t) * HOP_HEIGHT : 0;
      piece.rotation.y = hopping ? (1 - (1 - t) ** 3) * Math.PI * 2 : 0;
    });
  });

  return (
    <>
      <ViewCamera position={[0, 1.75, 6.3]} target={0.3} />
      <Lights />
      <Plinth radius={2.2} height={0.2} glow={0.85} />
      <group ref={table} rotation={[0, -step * TRIO_STEP, 0]}>
        <Notches radius={2.06} count={60} />
        {SHIFTS.map((id, i) => {
          const at = i * TRIO_STEP;
          return (
            <group
              key={id}
              ref={(stand) => {
                stands.current[i] = stand;
              }}
              position={[Math.sin(at) * TRIO_RADIUS, 0, Math.cos(at) * TRIO_RADIUS]}
              rotation={[0, Math.sin(at - step * TRIO_STEP) * FOLLOW + step * TRIO_STEP, 0]}
            >
              <group
                ref={(piece) => {
                  pieces.current[i] = piece;
                }}
              >
                {/* The agents' dock lies flat: a little wider, so it holds its own beside the others. */}
                <Fit radius={id === 'agents' ? 1.12 : 1} height={1.4} upright={id === 'agents'}>
                  <Exhibit id={id} />
                </Fit>
              </group>
            </group>
          );
        })}
      </group>
    </>
  );
}
