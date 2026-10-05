import {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Canvas, type ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import {
  type CollisionEnterPayload,
  CoefficientCombineRule,
  CuboidCollider,
  Physics,
  type RapierRigidBody,
  RigidBody,
  useBeforePhysicsStep,
  useRapier,
} from '@react-three/rapier';
import { PerspectiveCamera, Plane, Quaternion, Raycaster, Vector2, Vector3 } from 'three';
import { DAY_SHIFT_SIZE, DayShiftMesh } from './dayShift';
import {
  buildInitialItems,
  type InfoId,
  makeTicket,
  type PlaygroundItem,
  ticketPool,
  type Vec3,
} from './items';
import { AGENT_DOCK_RADIUS, AgentMesh, BELT, KeycapMesh, PropMesh } from './objects';
import { type Footprint, planPath, type Point } from './robotPath';
import { type DeskMotion } from '../useDeviceTilt';

export type PlaygroundProps = {
  /** Pauses rendering and physics when the hero is off-screen. */
  active: boolean;
  /** Touch devices tap objects, and press and hold to pick one up, so a swipe still scrolls the page. */
  coarse: boolean;
  /** Fewer objects on small screens. */
  compact: boolean;
  /** Text sits on the left on wide screens, so objects spawn to the right. */
  biasRight: boolean;
  /** A ticket was dropped on an agent. */
  onShipped: (code: string) => void;
  /** An object was clicked, tapped or picked up. */
  onSelect: (info: InfoId, uid: string) => void;
  /** A click or tap on the empty desk. */
  onMiss?: () => void;
  /** The robot drives after the pointer; otherwise it stays put and only turns to look at it. */
  robotFollow?: boolean;
  /** The object whose story is shown, followed on screen through `onAnchor`. */
  selected?: string | null;
  /** Where the selected object is on the canvas, in CSS pixels, every frame it is drawn. */
  onAnchor?: (anchor: Anchor | null) => void;
  /** An object picked from outside the desk, like the next story on a phone: it hops to show where it is. */
  spotlight?: { uid: string; info: InfoId; at: number } | null;
  /** The phone's tilt and shakes, read on every physics step. */
  motion?: RefObject<DeskMotion>;
  onReady?: () => void;
};

/** A point on the canvas, in CSS pixels from its top left, and roughly how far the object reaches round it. */
export type Anchor = {
  x: number;
  y: number;
  r: number;
  /** The same for everything else on the desk, worked out only when asked. */
  others: () => Array<{ x: number; y: number; r: number }>;
};

type Bounds = {
  halfX: number;
  zFar: number;
  zNear: number;
  /** A phone's desk, deeper than it is wide, read from top to bottom as the page scrolls. */
  tall: boolean;
};

type PlaygroundApi = {
  bodies: Map<string, RapierRigidBody>;
  press: (uid: string, info: InfoId, event: ThreeEvent<PointerEvent>) => void;
  tryMerge: (ticketUid: string) => void;
};

const PlaygroundContext = createContext<PlaygroundApi | null>(null);

function usePlaygroundApi(): PlaygroundApi {
  const api = useContext(PlaygroundContext);
  if (!api) {
    throw new Error('usePlaygroundApi must be used inside the playground scene');
  }
  return api;
}

const HOLD_HEIGHT = 1.6;
/** How hard a held object chases the pointer, and its top speed. Low on purpose: calm, not twitchy. */
const DRAG_GAIN = 8;
const DRAG_MAX_SPEED = 11;
/** Upward speed of the little hop a click or tap gives. */
const CLICK_HOP = 2.4;
/** Turned further than this (radians) from facing the viewer, a click turns it back instead of hopping it. */
const TURNED_ANGLE = 0.35;
/** Upright things that look back at the viewer; the rest square up with the screen so they read straight. */
const LOOKS_AT_VIEWER = new Set<InfoId>(['robot']);
/** How long standing back up takes, before physics takes over again. */
const RIGHTING_MS = 700;
/** How hard the object follows its standing-up path, and its top spin. */
const RIGHTING_GAIN = 12;
const RIGHTING_MAX_SPIN = 14;
/** Picked up, it turns the same way for this long, then swings freely as it is carried. */
const HELD_TURN_MS = 550;
const HELD_TURN_GAIN = 9;
const HELD_TURN_MAX_SPIN = 9;
/** How high things rise to turn over, about half their longest side, so they clear the desk. */
const RIGHTING_LIFT: Partial<Record<InfoId, number>> = {
  ticket: 1.1,
  sport: 1.5,
  robot: 1,
  night: 1.1,
  mountain: 1,
  agents: 0.8,
  flags: 1,
  oss: 0.8,
  server: 0.8,
  portrait: 0.8,
  keys: 0.6,
};
const WORLD_UP = new Vector3(0, 1, 0);
const TREADMILL_UID = 'prop-sport';
/** Each step the belt makes up this share of the gap to its own speed, like friction catching. */
const BELT_GRIP = 0.3;
const ROBOT_UID = 'prop-robot';
/** The robot keeps this far (world units) from the pointer, and sets off again past the second. */
const ROBOT_STOP = 1.9;
const ROBOT_START = 2.7;
/** A calm walk, and an unhurried turn. */
const ROBOT_SPEED = 0.7;
const ROBOT_TURN = 1.2;
/** Most it speeds up or slows down in one physics step, and how hard it holds itself upright. */
const ROBOT_ACCEL = 0.02;
const ROBOT_BALANCE = 8;
const ROBOT_RADIUS = 0.42;
/** It waits this long after being dropped, thrown or turned back before it drives again. */
const ROBOT_REST_MS = 1400;
/** Standing still, it turns to face the pointer once it is this far off (radians), until it is nearly square. */
const LOOK_START = 0.35;
const LOOK_SETTLE = 0.06;
/** A slower turn than when driving: it looks round, it does not spin. */
const LOOK_TURN = 0.9;
/** It turns at most this far from facing the viewer, so its face stays in sight. */
const LOOK_LIMIT = 1.15;
/** With the pointer this close, right over it, it keeps looking where it was. */
const LOOK_NEAR = 0.9;
/** Half the width and depth each thing takes on the desk, for the robot to find its way round. */
const FOOTPRINT: Record<InfoId, [number, number]> = {
  ticket: [0.9, 0.8],
  keys: [0.36, 0.36],
  agents: [AGENT_DOCK_RADIUS, AGENT_DOCK_RADIUS],
  oss: [0.65, 0.65],
  server: [0.8, 0.51],
  sport: [0.78, 1.02],
  mountain: [0.9, 0.8],
  portrait: [0.6, 0.62],
  robot: [ROBOT_RADIUS, ROBOT_RADIUS],
  night: [1.05, 0.42],
  flags: [0.85, 0.47],
};
/**
 * Small, light things the robot may brush past and nudge; the rest it drives
 * round. Not the flat agents tray: it would ride up onto it and tip.
 */
const LIGHT = new Set<InfoId>(['ticket', 'keys']);
/** Round things, which the robot can drive closer round than their square footprint. */
const ROUND = new Set<InfoId>(['agents']);
/** Light things in the robot's lane slide aside at this speed, picking it up at this rate per step: a gentle plough. */
const NUDGE_SPEED = 0.9;
const NUDGE_GRIP = 0.25;
/** The robot's ground: the part of the desk where things are, and this much round it. */
const ROBOT_MARGIN = 0.5;
/** With the pointer outside its ground, it waits this close to the nearest point inside. */
const ROBOT_EDGE_STOP = 0.35;
/** How often the robot looks for a new way to the pointer. */
const ROBOT_REPLAN_MS = 300;
const MERGE_WINDOW_MS = 2500;
/**
 * A dropped ticket ships when any part of it lands on the agents' dock or
 * within this far of its edge, whichever way the ticket is turned.
 */
const MERGE_REACH = AGENT_DOCK_RADIUS + 0.15;
const MERGE_HEIGHT = 1.5;
const AGENTS_UID = 'agents';
/** A shipped ticket turns into the next one after this long. */
const NEXT_TICKET_MS = 4500;
/** Pointer moves under this many pixels count as a click, not a drag. */
const CLICK_SLOP = 6;
/** On a touch screen, holding this long without moving picks the object up; moving first scrolls the page. */
const LONG_PRESS_MS = 280;
const TOUCH_SLOP = 10;
const GRAVITY = 16;
/** Tilted further than this (radians), sleeping things are woken so they can slide. */
const TILT_WAKE = 0.08;

/** A short buzz where phones support it (not iOS Safari). */
function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch (_error) {
    // Some browsers throw when vibration is blocked; it is only a nicety.
  }
}
// Far enough back that a dozen objects fit side by side on the visible desk.
const CAMERA_POSITION: Vec3 = [0, 17, 10.2];
/** Narrow desks bring the camera this much closer at most, so the objects stay big enough to tap. */
const NARROW_ZOOM = 0.8;
const FULL_WIDTH = 1000;
/**
 * Canvases taller than this share of their width (phones, where the desk runs
 * down the page) see the desk from further back, at the same angle, with the
 * field of view fitted to the width: the desk goes deep instead of shrinking,
 * and the far rows stay close in size to the near ones.
 */
const TALL_RATIO = 1.25;
const TALL_DISTANCE = 52;
/** How much of the desk shows across a tall canvas, in world units, at its middle. */
const TALL_WIDTH = 6.4;
const LOOK_AT = new Vector3(0, 0, 0.6);

/** How far back the camera sits, as a share of CAMERA_POSITION: closer on narrow canvases. */
function cameraDistance(width: number) {
  return Math.min(1, Math.max(NARROW_ZOOM, width / FULL_WIDTH));
}

/** Places the camera for the canvas, then projects the four screen corners onto the floor to find what it sees. */
function useFloorBounds(): Bounds {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  return useMemo(() => {
    const tall = size.width > 0 && size.height / size.width > TALL_RATIO;
    // R3F syncs the aspect after render; bounds are needed before the first spawn.
    if (camera instanceof PerspectiveCamera && size.width > 0 && size.height > 0) {
      camera.aspect = size.width / size.height;
      const halfWidth = Math.atan(TALL_WIDTH / 2 / TALL_DISTANCE);
      camera.fov = tall ? (2 * Math.atan(Math.tan(halfWidth) / camera.aspect) * 180) / Math.PI : 30;
      // Far back, a close near plane would leave too little depth precision for thin layers.
      camera.near = tall ? TALL_DISTANCE / 4 : 0.1;
      camera.far = tall ? TALL_DISTANCE * 2 : 80;
      camera.updateProjectionMatrix();
    }
    if (tall) {
      const back = new Vector3(...CAMERA_POSITION).normalize().multiplyScalar(TALL_DISTANCE);
      camera.position.copy(LOOK_AT).add(back);
    } else {
      const distance = cameraDistance(size.width);
      camera.position.set(...(CAMERA_POSITION.map((axis) => axis * distance) as Vec3));
    }
    camera.lookAt(LOOK_AT);
    camera.updateMatrixWorld();
    const raycaster = new Raycaster();
    const floor = new Plane(new Vector3(0, 1, 0), 0);
    const hit = new Vector3();
    const project = (x: number, y: number) => {
      raycaster.setFromCamera(new Vector2(x, y), camera);
      return raycaster.ray.intersectPlane(floor, hit)?.clone() ?? new Vector3();
    };
    const bottomLeft = project(-1, -1);
    const topLeft = project(-1, 1);
    return {
      halfX: Math.abs(bottomLeft.x) * 0.94,
      zNear: bottomLeft.z * 0.9,
      zFar: topLeft.z * (tall ? 0.96 : 0.92),
      tall,
    };
  }, [camera, size.width, size.height]);
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

type Slot = {
  /** Across the free desk, 0 = left edge. */
  u: number;
  /** From the back of the desk (0) to the front (1). */
  v: number;
  /** How far the heading may wander from facing the camera. */
  yaw?: number;
};

/**
 * Where each object lands, as fractions of the free desk, in order of what
 * matters most: me and my two languages at the back with the robot, which
 * reads best from up there, then how I work with agents, then Switzerland and
 * the walking desk, and the smaller things at the front.
 */
const SPAWN_SLOTS: Record<string, Slot> = {
  'prop-portrait': { u: 0.1, v: 0.06, yaw: 0.2 },
  'prop-robot': { u: 0.45, v: 0.04, yaw: 0.3 },
  'prop-flags': { u: 0.8, v: 0.08, yaw: 0.1 },
  // Work: the agents with the day's plan beside them, and their night shift.
  agents: { u: 0.12, v: 0.4, yaw: 0.15 },
  'ticket-0': { u: 0.5, v: 0.38, yaw: 0.25 },
  'prop-night': { u: 0.9, v: 0.36, yaw: 0.2 },
  'prop-mountain': { u: 0.1, v: 0.72 },
  'key-slash': { u: 0.42, v: 0.7 },
  // The walking desk at the front corner, square to the camera so the screen and the belt show.
  'prop-sport': { u: 1, v: 0.8, yaw: 0.1 },
  'prop-oss': { u: 0.3, v: 0.96 },
  'prop-server': { u: 0.62, v: 0.96, yaw: 0.25 },
};

/** The same order on a narrow desk, two to a row, since side by side they would land on one another. */
const NARROW_SPAWN_SLOTS: Record<string, Slot> = {
  'prop-portrait': { u: 0, v: 0.08, yaw: 0.15 },
  'prop-robot': { u: 0.45, v: 0, yaw: 0.3 },
  'prop-flags': { u: 0.88, v: 0.04, yaw: 0.1 },
  agents: { u: 0.1, v: 0.42, yaw: 0.15 },
  'ticket-0': { u: 0.55, v: 0.38, yaw: 0.2 },
  'prop-night': { u: 1, v: 0.3, yaw: 0.2 },
  'prop-mountain': { u: 0.08, v: 0.74 },
  'key-slash': { u: 0.44, v: 0.68 },
  'prop-sport': { u: 1, v: 0.84, yaw: 0.1 },
  'prop-oss': { u: 0.26, v: 1 },
  'prop-server': { u: 0.62, v: 1, yaw: 0.2 },
};

/**
 * A phone's desk, read from the top as the page scrolls: two to a row with
 * room round each, most important first, the robot up top where it reads best.
 */
const TALL_SPAWN_SLOTS: Record<string, Slot> = {
  'prop-robot': { u: 0.2, v: 0, yaw: 0.3 },
  'prop-portrait': { u: 0.82, v: 0.02, yaw: 0.15 },
  'prop-flags': { u: 0.2, v: 0.2, yaw: 0.1 },
  'prop-night': { u: 0.8, v: 0.19, yaw: 0.2 },
  agents: { u: 0.18, v: 0.41, yaw: 0.15 },
  'ticket-0': { u: 0.8, v: 0.39, yaw: 0.2 },
  'prop-mountain': { u: 0.2, v: 0.64 },
  // The walking desk runs deep, belt and all: it gets the most room.
  'prop-sport': { u: 0.86, v: 0.7, yaw: 0.1 },
  'prop-server': { u: 0.2, v: 0.93, yaw: 0.2 },
  'prop-oss': { u: 0.7, v: 0.97 },
};
/** Free desks narrower than this, in world units, use the narrow slots. */
const NARROW_DESK = 7;

/** The clusters need about this much width; narrower desks reach further left. */
const MIN_SPREAD = 4.6;

/** The part of the desk not under the text, where things land and the robot roams. */
function freeDesk(bounds: Bounds, biasRight: boolean) {
  const maxX = bounds.halfX - 0.9;
  return {
    minX: biasRight ? Math.min(bounds.halfX * 0.06, maxX - MIN_SPREAD) : -maxX,
    maxX,
    // The far edge sits under the header, so the back row starts a little forward;
    // a phone's desk starts below the text, so its back row can go right to the edge.
    minZ: bounds.tall ? bounds.zFar + 1.9 : bounds.zFar * 0.5,
    maxZ: bounds.tall ? bounds.zNear - 0.6 : bounds.zNear * 0.8,
  };
}

function spawnLayout(
  bounds: Bounds,
  biasRight: boolean,
  items: PlaygroundItem[]
): Array<{ spawn: Vec3; rotation: Vec3 }> {
  const { minX, maxX, minZ, maxZ } = freeDesk(bounds, biasRight);
  let slots = maxX - minX < NARROW_DESK ? NARROW_SPAWN_SLOTS : SPAWN_SLOTS;
  if (bounds.tall) {
    slots = TALL_SPAWN_SLOTS;
  }
  return items.map((item, index) => {
    const { u, v, yaw = 0.35 } = slots[item.uid] ?? { u: 0.5, v: 0.5 };
    const x = minX + u * (maxX - minX) + randomBetween(-0.12, 0.12);
    const z = minZ + v * (maxZ - minZ) + randomBetween(-0.12, 0.12);
    return {
      spawn: [
        Math.max(-bounds.halfX + 0.9, Math.min(bounds.halfX - 0.9, x)),
        // Staggered heights: they land one after another.
        1.6 + index * 0.35,
        Math.max(bounds.zFar + 0.9, Math.min(bounds.zNear - 0.9, z)),
      ],
      // Flat things start a little tilted; the rest are stood up in the scene.
      rotation: [randomBetween(-0.3, 0.3), randomBetween(-yaw, yaw), randomBetween(-0.3, 0.3)],
    };
  });
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

type Righting = { start: number; from: Quaternion; to: Quaternion; y: number; lift: number };

function Walls({ bounds }: { bounds: Bounds }) {
  const { halfX, zFar, zNear } = bounds;
  const depth = zNear - zFar;
  const centerZ = (zNear + zFar) / 2;
  return (
    <RigidBody type="fixed" colliders={false} friction={0.9}>
      <CuboidCollider args={[60, 0.5, 60]} position={[0, -0.5, 0]} />
      <CuboidCollider args={[0.5, 12, depth]} position={[-halfX - 0.5, 6, centerZ]} />
      <CuboidCollider args={[0.5, 12, depth]} position={[halfX + 0.5, 6, centerZ]} />
      <CuboidCollider args={[halfX + 1, 12, 0.5]} position={[0, 6, zFar - 0.5]} />
      <CuboidCollider args={[halfX + 1, 12, 0.5]} position={[0, 6, zNear + 0.5]} />
      <CuboidCollider args={[halfX + 1, 0.5, depth]} position={[0, 10, centerZ]} />
    </RigidBody>
  );
}

type GrabbableProps = {
  uid: string;
  kind: PlaygroundItem['kind'];
  info: InfoId;
  spawn: Vec3;
  rotation: Vec3;
  colliders?: 'cuboid' | 'hull' | 'ball' | false;
  restitution?: number;
  /** Continuous collision detection, only for thin things that could tunnel. */
  ccd?: boolean;
  onCollisionEnter?: (payload: CollisionEnterPayload) => void;
  children: ReactNode;
};

function Grabbable({
  uid,
  kind,
  spawn,
  rotation,
  info,
  colliders = 'cuboid',
  restitution = 0.05,
  ccd = false,
  onCollisionEnter,
  children,
}: GrabbableProps) {
  const ref = useRef<RapierRigidBody>(null);
  const { bodies, press } = usePlaygroundApi();

  useEffect(() => {
    const body = ref.current;
    if (body) {
      bodies.set(uid, body);
    }
    return () => {
      bodies.delete(uid);
    };
  }, [bodies, uid]);

  return (
    <RigidBody
      ref={ref}
      position={spawn}
      rotation={rotation}
      colliders={colliders}
      userData={{ uid, kind }}
      restitution={restitution}
      friction={0.9}
      linearDamping={0.6}
      angularDamping={1.4}
      ccd={ccd}
      onCollisionEnter={onCollisionEnter}
    >
      <group
        onPointerDown={(event) => {
          event.stopPropagation();
          press(uid, info, event);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          document.body.style.cursor = '';
        }}
      >
        {children}
      </group>
    </RigidBody>
  );
}

type PlacedItem = { item: PlaygroundItem; spawn: Vec3; rotation: Vec3 };

function Scene({
  coarse,
  compact,
  biasRight,
  onShipped,
  onSelect,
  selected = null,
  onAnchor,
  onReady,
  robotFollow = false,
  spotlight = null,
  motion,
}: PlaygroundProps) {
  const bounds = useFloorBounds();
  const camera = useThree((state) => state.camera);
  const pointer = useThree((state) => state.pointer);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);
  const { world } = useRapier();

  const bodies = useMemo(() => new Map<string, RapierRigidBody>(), []);
  const dragging = useRef<string | null>(null);
  const handledAt = useRef(new Map<string, number>());
  /** When each thing was last let go after a drag: only a drop ships a ticket, not a click. */
  const droppedAt = useRef(new Map<string, number>());
  const popQueue = useRef<string[]>([]);
  const merged = useRef(new Set<string>());
  /** When the agents last shipped a ticket, so they can spin up for it. */
  const shippedAt = useRef(-Infinity);
  const nextTicket = useRef(1);
  /** What the held thing is and when it was picked up, so it can turn to face the viewer first. */
  const grabbed = useRef<{ info: InfoId; at: number } | null>(null);
  const pressed = useRef<{
    uid: string;
    info: InfoId;
    x: number;
    y: number;
    touch: boolean;
  } | null>(null);
  const timers = useRef<number[]>([]);
  const longPress = useRef<number | null>(null);
  const righting = useRef(new Map<string, Righting>());

  const [placed, setPlaced] = useState<PlacedItem[]>(() => {
    const items = buildInitialItems(compact);
    const spots = spawnLayout(bounds, biasRight, items);
    return items.map((item, index) => ({ item, ...spots[index] }));
  });

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      if (longPress.current !== null) {
        window.clearTimeout(longPress.current);
      }
    },
    []
  );

  /** A click or tap: a small hop, so whatever sits on top barely moves. */
  const hop = useCallback(
    (uid: string) => {
      const body = bodies.get(uid);
      if (!body) {
        return;
      }
      const mass = body.mass();
      body.applyImpulse(
        {
          x: randomBetween(-0.3, 0.3) * mass,
          y: CLICK_HOP * mass,
          z: randomBetween(-0.3, 0.3) * mass,
        },
        true
      );
      body.applyTorqueImpulse({ x: 0, y: randomBetween(-0.08, 0.08) * mass, z: 0 }, true);
      handledAt.current.set(uid, performance.now());
    },
    [bodies]
  );

  /**
   * A click on something knocked over or turned away stands it back up facing
   * the viewer: it rises a little, turns, and drops back down.
   */
  /** Standing up and facing the viewer: its front is +z, towards the camera or square with the screen. */
  const facing = useCallback(
    (info: InfoId, position: { x: number; z: number }, into: Quaternion) => {
      const heading = LOOKS_AT_VIEWER.has(info)
        ? Math.atan2(camera.position.x - position.x, camera.position.z - position.z)
        : 0;
      return into.setFromAxisAngle(WORLD_UP, heading);
    },
    [camera]
  );

  const rightOrHop = useCallback(
    (uid: string, info: InfoId) => {
      const body = bodies.get(uid);
      if (!body) {
        return;
      }
      const { x, y, z, w } = body.rotation();
      const from = new Quaternion(x, y, z, w);
      const position = body.translation();
      const to = facing(info, position, new Quaternion());
      if (from.angleTo(to) < TURNED_ANGLE) {
        hop(uid);
        return;
      }
      const now = performance.now();
      righting.current.set(uid, {
        start: now,
        from,
        to,
        y: position.y,
        lift: RIGHTING_LIFT[info] ?? 0.7,
      });
      handledAt.current.set(uid, now);
      body.wakeUp();
    },
    [bodies, facing, hop]
  );

  // Picked from outside the desk: it hops, or stands back up, to show where it is.
  const spotlit = useRef(0);
  useEffect(() => {
    if (spotlight && spotlight.at !== spotlit.current) {
      spotlit.current = spotlight.at;
      rightOrHop(spotlight.uid, spotlight.info);
    }
  }, [spotlight, rightOrHop]);

  const release = useCallback(
    (event: PointerEvent) => {
      const { current } = pressed;
      pressed.current = null;
      if (longPress.current !== null) {
        window.clearTimeout(longPress.current);
        longPress.current = null;
      }
      if (dragging.current) {
        const now = performance.now();
        handledAt.current.set(dragging.current, now);
        droppedAt.current.set(dragging.current, now);
        dragging.current = null;
        document.body.style.cursor = '';
        return;
      }
      if (
        current &&
        event.type !== 'pointercancel' &&
        Math.hypot(event.clientX - current.x, event.clientY - current.y) < CLICK_SLOP
      ) {
        rightOrHop(current.uid, current.info);
        onSelect(current.info, current.uid);
      }
    },
    [rightOrHop, onSelect]
  );

  /** Picks up what was pressed: it is carried at the pointer until let go. */
  const pickUp = useCallback(
    (uid: string, info: InfoId, touch: boolean) => {
      dragging.current = uid;
      grabbed.current = { info, at: performance.now() };
      // Grabbing it takes over from standing it back up, and turns it the same way to start with.
      righting.current.delete(uid);
      // An awake body keeps the physics loop asking for frames while it is held.
      bodies.get(uid)?.wakeUp();
      if (touch) {
        buzz(12);
      } else {
        document.body.style.cursor = 'grabbing';
      }
      // Picking something up tells its story too, not only clicking it.
      onSelect(info, uid);
    },
    [bodies, onSelect]
  );

  // With a mouse, dragging starts once the pointer really moves, so a click never yanks things up.
  // On a touch screen, moving before the hold is up is a scroll, so the press is dropped.
  const move = useCallback(
    (event: PointerEvent) => {
      const { current } = pressed;
      if (!current || dragging.current) {
        return;
      }
      const moved = Math.hypot(event.clientX - current.x, event.clientY - current.y);
      if (current.touch) {
        if (moved >= TOUCH_SLOP) {
          pressed.current = null;
          if (longPress.current !== null) {
            window.clearTimeout(longPress.current);
            longPress.current = null;
          }
        }
        return;
      }
      if (moved >= CLICK_SLOP) {
        pickUp(current.uid, current.info, false);
      }
    },
    [pickUp]
  );

  // Carrying something on a touch screen: the finger moves it, not the page.
  useEffect(() => {
    const onTouchMove = (event: TouchEvent) => {
      if (dragging.current && event.cancelable) {
        event.preventDefault();
      }
    };
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => document.removeEventListener('touchmove', onTouchMove);
  }, []);

  useEffect(() => {
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    window.addEventListener('pointermove', move);
    return () => {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      window.removeEventListener('pointermove', move);
    };
  }, [release, move]);

  const press = useCallback(
    (uid: string, info: InfoId, event: ThreeEvent<PointerEvent>) => {
      const body = bodies.get(uid);
      if (!body) {
        return;
      }
      body.wakeUp();
      const touch = coarse || event.pointerType === 'touch';
      pressed.current = {
        uid,
        info,
        x: event.nativeEvent.clientX,
        y: event.nativeEvent.clientY,
        touch,
      };
      if (longPress.current !== null) {
        window.clearTimeout(longPress.current);
        longPress.current = null;
      }
      if (touch) {
        longPress.current = window.setTimeout(() => {
          longPress.current = null;
          if (pressed.current?.uid === uid && !dragging.current) {
            pickUp(uid, info, true);
          }
        }, LONG_PRESS_MS);
      }
    },
    [bodies, coarse, pickUp]
  );

  const tryMerge = useCallback(
    (ticketUid: string) => {
      const recently =
        dragging.current === ticketUid ||
        performance.now() - (droppedAt.current.get(ticketUid) ?? -Infinity) < MERGE_WINDOW_MS;
      if (!recently) {
        return;
      }
      if (merged.current.has(ticketUid)) {
        return;
      }
      merged.current.add(ticketUid);
      righting.current.delete(ticketUid);
      popQueue.current.push(ticketUid);
      shippedAt.current = performance.now();
      const entry = placed.find(({ item }) => item.uid === ticketUid);
      if (entry?.item.kind === 'ticket') {
        onShipped(entry.item.code);
      }
      buzz([18, 60, 18]);
      setPlaced((current) =>
        current.map((placedEntry) =>
          placedEntry.item.uid === ticketUid && placedEntry.item.kind === 'ticket'
            ? { ...placedEntry, item: { ...placedEntry.item, merged: true } }
            : placedEntry
        )
      );
      // Then the next request comes in, on the same physical ticket.
      const next = makeTicket(nextTicket.current, ticketUid);
      nextTicket.current = (nextTicket.current + 1) % ticketPool.length;
      timers.current.push(
        window.setTimeout(() => {
          merged.current.delete(ticketUid);
          setPlaced((current) =>
            current.map((placedEntry) =>
              placedEntry.item.uid === ticketUid ? { ...placedEntry, item: next } : placedEntry
            )
          );
        }, NEXT_TICKET_MS)
      );
    },
    [onShipped, placed]
  );

  // Real keys make the matching keycaps hop.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const { target } = event;
      const typing =
        target instanceof Element && target.closest('input, textarea, [contenteditable="true"]');
      if (typing || event.repeat) {
        return;
      }
      placed.forEach(({ item }) => {
        if (item.kind !== 'keycap' || !item.keys.includes(event.key)) {
          return;
        }
        const body = bodies.get(item.uid);
        if (!body) {
          return;
        }
        const mass = body.mass();
        body.applyImpulse({ x: 0, y: 4 * mass, z: 0 }, true);
        body.applyTorqueImpulse(
          { x: randomBetween(-0.06, 0.06) * mass, y: 0, z: randomBetween(-0.06, 0.06) * mass },
          true
        );
      });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [placed, bodies]);

  const raycaster = useMemo(() => new Raycaster(), []);
  const holdPlane = useMemo(() => new Plane(new Vector3(0, 1, 0), -HOLD_HEIGHT), []);
  const target = useMemo(() => new Vector3(), []);
  const velocity = useMemo(() => new Vector3(), []);
  const turn = useMemo(
    () => ({ desired: new Quaternion(), current: new Quaternion(), axis: new Vector3() }),
    []
  );

  const probe = useMemo(
    () => ({
      rotation: new Quaternion(),
      local: new Vector3(),
    }),
    []
  );

  useFrame(() => {
    // Merged tickets jump for joy, and off the dock, so it is clear for the next one.
    while (popQueue.current.length) {
      const uid = popQueue.current.shift();
      const body = uid ? bodies.get(uid) : undefined;
      if (body) {
        const mass = body.mass();
        const from = bodies.get(AGENTS_UID)?.translation();
        const at = body.translation();
        const away = from ? Math.atan2(at.z - from.z, at.x - from.x) : 0;
        const push = from ? 1.6 * mass : 0;
        body.applyImpulse(
          { x: Math.cos(away) * push, y: 4 * mass, z: Math.sin(away) * push },
          true
        );
        body.applyTorqueImpulse({ x: 0, y: 0.2 * mass, z: 0 }, true);
      }
    }

    const uid = dragging.current;
    const held = uid ? bodies.get(uid) : undefined;
    if (held) {
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(holdPlane, target)) {
        target.x = Math.max(-bounds.halfX + 0.6, Math.min(bounds.halfX - 0.6, target.x));
        target.z = Math.max(bounds.zFar + 0.6, Math.min(bounds.zNear - 0.6, target.z));
        const position = held.translation();
        velocity
          .set(target.x - position.x, target.y - position.y, target.z - position.z)
          .multiplyScalar(DRAG_GAIN)
          .clampLength(0, DRAG_MAX_SPEED);
        held.setLinvel(velocity, true);
        // Once it has turned the right way, it swings a little as it is carried, then calms.
        if (performance.now() - (grabbed.current?.at ?? 0) > HELD_TURN_MS) {
          const spin = held.angvel();
          held.setAngvel({ x: spin.x * 0.7, y: spin.y * 0.7, z: spin.z * 0.7 }, true);
        }
      }
    }

    const now = performance.now();

    // Dropping a ticket onto (or next to) an agent ships it.
    droppedAt.current.forEach((time, ticketUid) => {
      if (!ticketUid.startsWith('ticket-') || now - time > MERGE_WINDOW_MS) {
        return;
      }
      const body = bodies.get(ticketUid);
      if (!body) {
        return;
      }
      const ticket = body.translation();
      const r = body.rotation();
      probe.rotation.set(r.x, r.y, r.z, r.w).invert();
      const agents = bodies.get(AGENTS_UID);
      const centre = agents?.translation();
      if (!agents || !centre || Math.abs(ticket.y - centre.y) > MERGE_HEIGHT) {
        return;
      }
      // The dock's centre in the ticket's own space, then how far that is outside the card.
      const { local } = probe;
      local.set(centre.x - ticket.x, 0, centre.z - ticket.z).applyQuaternion(probe.rotation);
      const outX = Math.max(0, Math.abs(local.x) - DAY_SHIFT_SIZE[0] / 2);
      const outZ = Math.max(0, Math.abs(local.z) - DAY_SHIFT_SIZE[2] / 2);
      if (Math.hypot(outX, outZ) < MERGE_REACH) {
        tryMerge(ticketUid);
      }
    });

    // Anything that escapes the desk comes back from the top.
    bodies.forEach((body) => {
      const position = body.translation();
      if (
        position.y < -3 ||
        Math.abs(position.x) > bounds.halfX + 3 ||
        position.z > bounds.zNear + 3 ||
        position.z < bounds.zFar - 3
      ) {
        body.setTranslation({ x: 0, y: 6, z: (bounds.zFar + bounds.zNear) / 2 }, true);
        body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      }
    });
  });

  // Where the pointer is over the desk, once it has been over the page at all.
  const cursor = useRef({ active: false });
  useEffect(() => {
    const onMove = () => {
      cursor.current.active = true;
    };
    const onLeave = () => {
      cursor.current.active = false;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerdown', onMove);
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const infoOf = useMemo(() => new Map(placed.map(({ item }) => [item.uid, item.info])), [placed]);
  const floor = useMemo(() => new Plane(new Vector3(0, 1, 0), 0), []);
  const step = useMemo(
    () => ({
      rotation: new Quaternion(),
      inverse: new Quaternion(),
      local: new Vector3(),
      axis: new Vector3(),
      goal: new Vector3(),
      following: false,
      slick: false,
      /** Turning to face the pointer while it stands still, and the way it last looked. */
      looking: false,
      lookHeading: null as number | null,
      /** The speed it drives at, held against what bumping into things does to it. */
      command: { x: 0, z: 0 },
      path: [] as Point[],
      plannedAt: -Infinity,
    }),
    []
  );
  // Read from the physics step; switching it off stops the robot where it is.
  const follow = useRef(robotFollow);
  useEffect(() => {
    follow.current = robotFollow;
    step.following = false;
    step.path = [];
    step.plannedAt = -Infinity;
    bodies.get(ROBOT_UID)?.wakeUp();
  }, [robotFollow, step, bodies]);

  // Where the things are, never under the text: a little round the free desk, inside the walls.
  const roam = useMemo(() => {
    const desk = freeDesk(bounds, biasRight);
    return {
      minX: Math.max(-bounds.halfX + 0.6, desk.minX - ROBOT_MARGIN),
      maxX: Math.min(bounds.halfX - 0.6, desk.maxX + ROBOT_MARGIN),
      minZ: Math.max(bounds.zFar + 0.6, desk.minZ - ROBOT_MARGIN),
      maxZ: Math.min(bounds.zNear - 0.6, desk.maxZ + ROBOT_MARGIN),
    };
  }, [bounds, biasRight]);

  /** Sets the spin that turns a body from where it is towards `desired` (overwritten), as hard as `gain`. */
  const steerTowards = (body: RapierRigidBody, gain: number, maxSpin: number) => {
    const { desired, current, axis } = turn;
    const { x, y, z, w } = body.rotation();
    // The turn still to go, as an angular velocity in world space.
    desired.multiply(current.set(x, y, z, w).invert());
    if (desired.w < 0) {
      desired.set(-desired.x, -desired.y, -desired.z, -desired.w);
    }
    const angle = 2 * Math.acos(Math.min(1, desired.w));
    const sin = Math.sqrt(1 - desired.w * desired.w);
    axis.set(desired.x, desired.y, desired.z);
    axis
      .multiplyScalar(sin > 1e-4 ? angle / sin : 0)
      .multiplyScalar(gain)
      .clampLength(0, maxSpin);
    body.setAngvel(axis, true);
  };

  /** Just picked up, it turns to stand up facing the viewer, as a click would turn it; then it is free. */
  const turnHeld = () => {
    const uid = dragging.current;
    const held = uid ? bodies.get(uid) : undefined;
    const grab = grabbed.current;
    if (!held || !grab || performance.now() - grab.at > HELD_TURN_MS) {
      return;
    }
    facing(grab.info, held.translation(), turn.desired);
    steerTowards(held, HELD_TURN_GAIN, HELD_TURN_MAX_SPIN);
  };

  /**
   * Standing things back up, every physics step so it stays smooth even when
   * frames are few: follow an eased turn from where it lay to facing the
   * viewer, lifted clear of the desk, then let it drop and settle on its own.
   */
  const standUp = () => {
    const now = performance.now();
    righting.current.forEach((move, moveUid) => {
      const body = bodies.get(moveUid);
      const t = (now - move.start) / RIGHTING_MS;
      if (!body || t >= 1 || dragging.current === moveUid) {
        righting.current.delete(moveUid);
        return;
      }
      // Up first, then over: the turn starts once it is mostly clear of the desk.
      turn.desired.slerpQuaternions(move.from, move.to, smoothstep(0.18, 0.85, t));
      steerTowards(body, RIGHTING_GAIN, RIGHTING_MAX_SPIN);
      const position = body.translation();
      const drift = body.linvel();
      const height = move.y + move.lift * smoothstep(0, 0.28, t);
      body.setLinvel(
        {
          x: drift.x * 0.6,
          y: Math.max(-6, Math.min(8, (height - position.y) * 12)),
          z: drift.z * 0.6,
        },
        true
      );
    });
  };

  /** The walking pad's belt carries whatever rests on it to the end, where it drops off. */
  const runBelt = () => {
    const treadmill = bodies.get(TREADMILL_UID);
    if (!treadmill) {
      return;
    }
    const { rotation, inverse, local, axis } = step;
    const r = treadmill.rotation();
    rotation.set(r.x, r.y, r.z, r.w);
    // Knocked over, it is just a thing on the desk.
    if (axis.set(0, 1, 0).applyQuaternion(rotation).y < 0.9) {
      return;
    }
    inverse.copy(rotation).invert();
    const along = axis.set(0, 0, 1).applyQuaternion(rotation).setY(0).normalize();
    const origin = treadmill.translation();
    bodies.forEach((body, uid) => {
      if (uid === TREADMILL_UID || uid === dragging.current || righting.current.has(uid)) {
        return;
      }
      const position = body.translation();
      local
        .set(position.x - origin.x, position.y - origin.y, position.z - origin.z)
        .applyQuaternion(inverse);
      if (
        Math.abs(local.x) > BELT.halfWidth ||
        local.z < BELT.zMin ||
        local.z > BELT.zMax ||
        local.y < BELT.top ||
        local.y > BELT.top + 1
      ) {
        return;
      }
      const velocity = body.linvel();
      const forward = velocity.x * along.x + velocity.z * along.z;
      const sideX = velocity.x - along.x * forward;
      const sideZ = velocity.z - along.z * forward;
      const speed = forward + (BELT.speed - forward) * BELT_GRIP;
      // The pad itself is slippery: the belt pulls along it and holds it from sliding sideways.
      body.setLinvel(
        {
          x: along.x * speed + sideX * (1 - BELT_GRIP),
          y: velocity.y,
          z: along.z * speed + sideZ * (1 - BELT_GRIP),
        },
        true
      );
      const spin = body.angvel();
      body.setAngvel({ x: spin.x, y: spin.y * (1 - BELT_GRIP), z: spin.z }, true);
    });
  };

  /**
   * While it drives, the robot's treads slide and its own controller does the
   * gripping; otherwise it has ordinary friction, so a throw still comes to rest.
   */
  const setTraction = (robot: RapierRigidBody, slick: boolean) => {
    if (!slick) {
      // Not driving: whatever moves it now, it picks up from there next time.
      const { x, z } = robot.linvel();
      step.command.x = x;
      step.command.z = z;
    }
    if (step.slick === slick) {
      return;
    }
    step.slick = slick;
    for (let i = 0; i < robot.numColliders(); i += 1) {
      const collider = robot.collider(i);
      collider.setFriction(slick ? 0 : 0.5);
      collider.setFrictionCombineRule(
        slick ? CoefficientCombineRule.Min : CoefficientCombineRule.Average
      );
    }
  };

  /** Slides light things in the robot's lane out to the side, so it can squeeze past them. */
  const nudge = (from: { x: number; z: number }, dirX: number, dirZ: number) => {
    bodies.forEach((other, uid) => {
      const info = infoOf.get(uid);
      if (!info || !LIGHT.has(info) || uid === dragging.current || righting.current.has(uid)) {
        return;
      }
      const at = other.translation();
      const rx = at.x - from.x;
      const rz = at.z - from.z;
      const along = rx * dirX + rz * dirZ;
      // Positive on the robot's left.
      const side = rz * dirX - rx * dirZ;
      const reach = Math.max(...FOOTPRINT[info]);
      if (
        at.y > 1 ||
        along < 0 ||
        along > ROBOT_RADIUS + reach + 0.15 ||
        Math.abs(side) > ROBOT_RADIUS + reach * 0.8
      ) {
        return;
      }
      const away = side >= 0 ? 1 : -1;
      // Mostly sideways, a little forward, so it slides off the lane instead of being shoved along it.
      const targetX = (-dirZ * away + dirX * 0.3) * NUDGE_SPEED;
      const targetZ = (dirX * away + dirZ * 0.3) * NUDGE_SPEED;
      const v = other.linvel();
      other.setLinvel(
        {
          x: v.x + (targetX - v.x) * NUDGE_GRIP,
          y: v.y,
          z: v.z + (targetZ - v.z) * NUDGE_GRIP,
        },
        true
      );
    });
  };

  /**
   * By default the robot stays where it is and turns its body to face the
   * pointer, its head and eyes doing the rest (in its mesh). Asked to follow,
   * it drives after the pointer, threading between the things on the desk and
   * nudging light ones aside, and stops a little way short so it never sits
   * under it. It keeps to the part of the desk where things are: with the
   * pointer elsewhere, it waits at the nearest edge.
   */
  const driveRobot = () => {
    const robot = bodies.get(ROBOT_UID);
    if (
      !robot ||
      dragging.current === ROBOT_UID ||
      righting.current.has(ROBOT_UID) ||
      performance.now() - (handledAt.current.get(ROBOT_UID) ?? -Infinity) < ROBOT_REST_MS
    ) {
      step.following = false;
      if (robot) {
        setTraction(robot, false);
      }
      return;
    }
    const { rotation, axis, goal } = step;
    const r = robot.rotation();
    rotation.set(r.x, r.y, r.z, r.w);
    const position = robot.translation();
    const velocity = robot.linvel();
    // Only upright and on the desk itself: lying down or perched on something, it waits for help.
    if (
      axis.set(0, 1, 0).applyQuaternion(rotation).y < 0.93 ||
      position.y > 1 ||
      Math.abs(velocity.y) > 1
    ) {
      step.following = false;
      setTraction(robot, false);
      return;
    }
    raycaster.setFromCamera(pointer, camera);
    const aimed = cursor.current.active && raycaster.ray.intersectPlane(floor, goal);
    const pointerX = goal.x;
    const pointerZ = goal.z;
    // How far it still is from the pointer itself, and from where it may go.
    let distance = 0;
    let stop = ROBOT_STOP;
    let start = ROBOT_START;
    if (!aimed || !follow.current) {
      step.following = false;
    } else {
      goal.x = Math.max(roam.minX, Math.min(roam.maxX, goal.x));
      goal.z = Math.max(roam.minZ, Math.min(roam.maxZ, goal.z));
      const toPointer = Math.hypot(pointerX - position.x, pointerZ - position.z);
      const toGoal = Math.hypot(goal.x - position.x, goal.z - position.z);
      if (goal.x !== pointerX || goal.z !== pointerZ) {
        // Outside its ground: right up to the edge, unless the pointer is close already.
        distance = toGoal;
        stop = ROBOT_EDGE_STOP;
        start = ROBOT_EDGE_STOP + 0.6;
        if (toPointer < ROBOT_STOP) {
          distance = 0;
        }
      } else {
        distance = toPointer;
      }
      if (distance > start && !step.following) {
        step.following = true;
        step.plannedAt = -Infinity;
      } else if (distance < stop) {
        step.following = false;
      }
    }

    let wantX = 0;
    let wantZ = 0;
    if (step.following) {
      // Find a way round everything on the desk, every so often as things move.
      const now = performance.now();
      if (now - step.plannedAt > ROBOT_REPLAN_MS) {
        step.plannedAt = now;
        const obstacles: Footprint[] = [];
        bodies.forEach((other, uid) => {
          const at = other.translation();
          // Held up in the air, it is not in the way.
          if (uid === ROBOT_UID || at.y > 1.3) {
            return;
          }
          const q = other.rotation();
          const front = axis.set(0, 0, 1).applyQuaternion(rotation.set(q.x, q.y, q.z, q.w));
          const info = infoOf.get(uid) ?? 'keys';
          const [halfX, halfZ] = FOOTPRINT[info];
          obstacles.push({
            x: at.x,
            z: at.z,
            yaw: Math.atan2(front.x, front.z),
            halfX,
            halfZ,
            light: LIGHT.has(info),
            round: ROUND.has(info),
          });
        });
        // Anywhere a little inside its stopping distance will do, so with the pointer on
        // something it stops on its own side instead of going round to the far one.
        step.path =
          planPath(roam, obstacles, ROBOT_RADIUS, position, goal, Math.max(0, stop - 0.3)) ?? [];
        rotation.set(r.x, r.y, r.z, r.w);
      }
      // Head for the next corner, dropping the ones it has reached.
      while (
        step.path.length > 1 &&
        Math.hypot(step.path[0].x - position.x, step.path[0].z - position.z) < 0.3
      ) {
        step.path.shift();
      }
      const next = step.path[0];
      if (next) {
        const toX = next.x - position.x;
        const toZ = next.z - position.z;
        const gap = Math.hypot(toX, toZ);
        const last = step.path[step.path.length - 1];
        const left = Math.hypot(last.x - position.x, last.z - position.z);
        // Slows down as it nears the pointer, or the closest it can get.
        const ease = Math.min(1, (distance - stop) / 0.9, left / 0.7);
        if (gap > 1e-3 && ease > 0) {
          wantX = (toX / gap) * ROBOT_SPEED * ease;
          wantZ = (toZ / gap) * ROBOT_SPEED * ease;
        }
      }
    }

    // Driving, it faces where it is going. Standing, it turns to look at the pointer,
    // never so far that it shows the viewer its back; its head and eyes do the rest.
    const moving = Math.hypot(wantX, wantZ) > 0.2;
    const forward = axis.set(0, 0, 1).applyQuaternion(rotation);
    const heading = Math.atan2(forward.x, forward.z);
    const wrap = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));
    const toViewer = Math.atan2(camera.position.x - position.x, camera.position.z - position.z);
    if (!aimed) {
      step.lookHeading = null;
    } else if (Math.hypot(pointerX - position.x, pointerZ - position.z) > LOOK_NEAR) {
      const look = wrap(Math.atan2(pointerX - position.x, pointerZ - position.z) - toViewer);
      step.lookHeading = toViewer + Math.max(-LOOK_LIMIT, Math.min(LOOK_LIMIT, look));
    }
    const target = moving ? Math.atan2(wantX, wantZ) : (step.lookHeading ?? toViewer);
    const turn = wrap(target - heading);
    const settled = Math.hypot(velocity.x, velocity.z) < 0.05;
    // Standing, it only starts turning once the pointer is well off to one side, and stops once it faces it.
    if (moving || Math.abs(turn) > LOOK_START) {
      step.looking = true;
    } else if (Math.abs(turn) < LOOK_SETTLE) {
      step.looking = false;
    }
    // Nothing to do: leave it asleep, so the scene can stop drawing.
    if (!moving && settled && !step.looking) {
      setTraction(robot, false);
      return;
    }
    setTraction(robot, true);
    // Turning on the spot first, then driving: treads, not wheels. Speeding up gently, so it never tips.
    const drive = moving ? Math.max(0, Math.cos(turn)) ** 2 : 0;
    const { command } = step;
    axis.set(wantX * drive - command.x, 0, wantZ * drive - command.z).clampLength(0, ROBOT_ACCEL);
    command.x += axis.x;
    command.z += axis.z;
    if (drive > 0.3) {
      const speed = Math.hypot(wantX, wantZ);
      nudge(position, wantX / speed, wantZ / speed);
    }
    // It keeps to its own speed through a bump, so it presses on and nudges light things aside,
    // and keeps its treads on the desk instead of riding up onto a flat thing.
    robot.setLinvel({ x: command.x, y: Math.min(velocity.y, 0), z: command.z }, true);
    // Its own little gyro: any lean is turned straight back.
    const lean = axis.set(0, 1, 0).applyQuaternion(rotation).cross(WORLD_UP);
    robot.setAngvel(
      {
        x: lean.x * ROBOT_BALANCE,
        y: moving
          ? Math.max(-ROBOT_TURN, Math.min(ROBOT_TURN, turn * 2.2))
          : Math.max(-LOOK_TURN, Math.min(LOOK_TURN, turn * 2.4)),
        z: lean.z * ROBOT_BALANCE,
      },
      true
    );
  };

  /**
   * The phone's tilt tips gravity, so things slide the way the phone leans,
   * and a shake tosses everything up. Back to plain gravity once switched off.
   */
  const tipped = useMemo(() => ({ x: 0, z: 0, shakes: 0 }), []);
  const tiltDesk = () => {
    const m = motion?.current;
    const x = m?.on ? m.tilt.x : 0;
    const z = m?.on ? m.tilt.z : 0;
    if (Math.abs(x - tipped.x) > 0.002 || Math.abs(z - tipped.z) > 0.002) {
      tipped.x = x;
      tipped.z = z;
      world.gravity = {
        x: Math.sin(x) * GRAVITY,
        y: -Math.cos(x) * Math.cos(z) * GRAVITY,
        z: Math.sin(z) * GRAVITY,
      };
      if (Math.hypot(x, z) > TILT_WAKE) {
        bodies.forEach((body, uid) => {
          if (uid !== dragging.current) {
            body.wakeUp();
          }
        });
      }
    }
    if (m && m.shakes !== tipped.shakes) {
      tipped.shakes = m.shakes;
      bodies.forEach((body, uid) => {
        if (uid === dragging.current) {
          return;
        }
        const mass = body.mass();
        body.applyImpulse(
          {
            x: randomBetween(-1.4, 1.4) * mass,
            y: randomBetween(4.5, 6.5) * mass,
            z: randomBetween(-1.4, 1.4) * mass,
          },
          true
        );
        body.applyTorqueImpulse(
          {
            x: randomBetween(-0.15, 0.15) * mass,
            y: randomBetween(-0.15, 0.15) * mass,
            z: randomBetween(-0.15, 0.15) * mass,
          },
          true
        );
      });
      buzz([10, 40, 10]);
    }
  };

  useBeforePhysicsStep(() => {
    tiltDesk();
    turnHeld();
    standUp();
    runBelt();
    driveRobot();
  });

  // The selected object, followed on screen so its story can sit next to it.
  const anchorAt = useMemo(() => ({ centre: new Vector3(), edge: new Vector3() }), []);
  useEffect(() => {
    invalidate();
    if (!selected) {
      onAnchor?.(null);
    }
  }, [selected, invalidate, onAnchor]);
  const toScreen = useCallback(
    (uid: string) => {
      const position = bodies.get(uid)?.translation();
      if (!position) {
        return null;
      }
      const [halfX, halfZ] = FOOTPRINT[infoOf.get(uid) ?? 'keys'];
      const { centre, edge } = anchorAt;
      centre.set(position.x, position.y, position.z).project(camera);
      // The camera's right is the desk's +x, so this is its half width on screen.
      edge.set(position.x + Math.max(halfX, halfZ) * 0.9, position.y, position.z).project(camera);
      return {
        x: ((centre.x + 1) / 2) * size.width,
        y: ((1 - centre.y) / 2) * size.height,
        r: (Math.abs(edge.x - centre.x) / 2) * size.width,
      };
    },
    [anchorAt, bodies, camera, infoOf, size]
  );
  useFrame(() => {
    if (!selected || !onAnchor) {
      return;
    }
    const point = toScreen(selected);
    if (!point) {
      onAnchor(null);
      return;
    }
    onAnchor({
      ...point,
      others: () =>
        [...bodies.keys()]
          .filter((uid) => uid !== selected)
          .map(toScreen)
          .filter((other) => other !== null),
    });
  });

  // Lets automated browser checks find objects on screen; never shipped to production.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      return undefined;
    }
    const debug = {
      project: (uid: string) => {
        const position = bodies.get(uid)?.translation();
        if (!position) {
          return null;
        }
        const point = new Vector3(position.x, position.y, position.z).project(camera);
        const rect = (
          document.querySelector('#playground canvas') as HTMLCanvasElement | null
        )?.getBoundingClientRect();
        if (!rect) {
          return null;
        }
        return {
          x: rect.left + ((point.x + 1) / 2) * rect.width,
          y: rect.top + ((1 - point.y) / 2) * rect.height,
        };
      },
      uids: () => [...bodies.keys()],
      body: (uid: string) => bodies.get(uid),
      // The part of the desk the robot keeps to.
      robotArea: () => roam,
      robotPlan: () => ({
        path: step.path,
        goal: step.goal.clone(),
        following: step.following,
        follow: follow.current,
        command: { ...step.command },
      }),
      // Draws a frame now, so a script can copy the canvas in the same task.
      render: () => gl.render(scene, camera),
    };
    (window as unknown as { __playground?: typeof debug }).__playground = debug;
    return () => {
      delete (window as unknown as { __playground?: typeof debug }).__playground;
    };
  }, [bodies, camera, gl, scene, roam, step]);

  const api = useMemo<PlaygroundApi>(
    () => ({ bodies, press, tryMerge }),
    [bodies, press, tryMerge]
  );

  const onAgentCollision = useCallback(
    (payload: CollisionEnterPayload) => {
      const data = payload.other.rigidBodyObject?.userData as
        { uid?: string; kind?: string } | undefined;
      if (data?.kind === 'ticket' && data.uid) {
        tryMerge(data.uid);
      }
    },
    [tryMerge]
  );

  const boundsKey = `${bounds.halfX.toFixed(2)}:${bounds.zFar.toFixed(2)}:${bounds.zNear.toFixed(2)}`;

  return (
    <PlaygroundContext.Provider value={api}>
      <Walls key={boundsKey} bounds={bounds} />
      {placed.map(({ item, spawn, rotation }) => {
        const shared = {
          uid: item.uid,
          kind: item.kind,
          info: item.info,
          spawn,
          rotation,
        };
        switch (item.kind) {
          case 'ticket':
            return (
              // The laptop brings its own colliders, base and lid, and lands upright.
              <Grabbable
                key={item.uid}
                {...shared}
                rotation={[0, rotation[1], 0]}
                colliders={false}
                ccd
              >
                <DayShiftMesh item={item} />
              </Grabbable>
            );
          case 'keycap':
            return (
              <Grabbable key={item.uid} {...shared}>
                <KeycapMesh item={item} />
              </Grabbable>
            );
          case 'agent':
            return (
              <Grabbable
                key={item.uid}
                {...shared}
                rotation={[0, rotation[1], 0]}
                // The tray brings its own flat collider: hulls of the logos jitter when stacked.
                colliders={false}
                onCollisionEnter={onAgentCollision}
              >
                <AgentMesh shippedAt={shippedAt} />
              </Grabbable>
            );
          default:
            return (
              <Grabbable
                key={item.uid}
                {...shared}
                // Upright, so they settle instead of rocking, each on its own simple collider.
                rotation={[0, rotation[1], 0]}
                colliders={false}
                ccd={item.info === 'portrait'}
              >
                <PropMesh item={item} />
              </Grabbable>
            );
        }
      })}
    </PlaygroundContext.Provider>
  );
}

/** The belt, the desk screen and the robot move on their own, at a calm 30 fps. */
function AmbientMotion() {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (now - last >= 32) {
        last = now;
        invalidate();
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [invalidate]);
  return null;
}

export default function Playground(props: PlaygroundProps) {
  const { active, coarse, onMiss } = props;
  return (
    <Canvas
      shadows
      // Phones have dense screens and a small canvas: render it sharp.
      dpr={[1, coarse ? 2.5 : 1.75]}
      // Physics runs on its own loop and asks for a frame while something moves;
      // the animated props add a 30 fps tick on top, only while the hero is on screen.
      frameloop={active ? 'demand' : 'never'}
      camera={{ position: CAMERA_POSITION, fov: 30, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      // No text selection or callout on a long press: that is how things are picked up.
      style={{ touchAction: 'pan-y', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
      onPointerMissed={onMiss}
      aria-hidden
    >
      {active && <AmbientMotion />}
      <ambientLight intensity={0.75} />
      <hemisphereLight args={['#ffffff', '#2a2622', 0.6]} />
      <directionalLight
        position={[5, 14, 6]}
        intensity={1.9}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0005}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <shadowMaterial opacity={0.4} />
      </mesh>
      <Physics
        gravity={[0, -GRAVITY, 0]}
        paused={!active}
        updateLoop="independent"
        numSolverIterations={8}
        numInternalPgsIterations={2}
      >
        <Scene {...props} />
      </Physics>
    </Canvas>
  );
}
