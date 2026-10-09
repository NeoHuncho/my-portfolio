import {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
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
import {
  Box3,
  type Camera,
  type Group,
  PerspectiveCamera,
  Plane,
  Quaternion,
  Raycaster,
  Vector2,
  Vector3,
} from 'three';
import { DAY_SHIFT_SIZE, DayShiftMesh } from './dayShift';
import { ForceField, GLOW_FROM } from './forceField';
import {
  buildExtra,
  buildTrio,
  type ExtraId,
  type InfoId,
  makeTicket,
  type PlaygroundItem,
  ticketPool,
  TRIO,
  uidOf,
  type Vec3,
} from './items';
import { AGENT_DOCK_RADIUS, AgentMesh, BELT, KeycapMesh, PropMesh } from './objects';
import { HoleyShadowFloor, type PipeDrive, PipeExit, PipeHoles } from './pipe';
import {
  type ClearZone,
  fieldClearance,
  fieldDestination,
  type FieldFootprint,
  fieldInside,
  fieldVelocity,
} from './repulsor';
import { type Footprint, planPath, type Point } from './robotPath';
import { HatchVapour, VAPOUR_TAIL_S } from './smoke';
import { SETTINGS, useBudgetDpr, useQuality } from '../quality';
import Ticker from '../Ticker';
import { type DeskMotion } from '../useDeviceTilt';

export type PlaygroundProps = {
  /** Pauses rendering and physics when the hero is off-screen. */
  active: boolean;
  /** Touch devices tap objects, and press and hold to pick one up, so a swipe still scrolls the page. */
  coarse: boolean;
  /** Text sits on the left on wide screens, so objects spawn to the right. */
  biasRight: boolean;
  /** How far across the canvas the text over it reaches, as a share of its width: things land beyond it. */
  freeLeft?: number;
  /** How far down the canvas the header over it reaches, as a share of its height: the rest of me lands below it. */
  freeTop?: number;
  /** What has been added round how I work, in the order it came. Taking things away remounts the scene. */
  extras?: ExtraId[];
  /** Something about to be added: a closed hatch marks where it will land. */
  preview?: ExtraId | null;
  /** The camera steps back to show the whole desk, not just how I work. */
  open?: boolean;
  /** Where each piece of how I work is on the canvas, every frame it is drawn, for its label. */
  onLabels?: (labels: DeskLabel[]) => void;
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

/** One of how I work's pieces on the canvas: its middle, its front edge, and whether it is up in the air. */
export type DeskLabel = { uid: string; x: number; y: number; front: number; lifted: boolean };

type Bounds = {
  /** Across the near edge, the narrowest: the far edge is wider, the camera looking down on it. */
  minX: number;
  maxX: number;
  farMinX: number;
  farMaxX: number;
  zFar: number;
  zNear: number;
  /** A phone's desk, deeper than it is wide, read from top to bottom as the page scrolls. */
  tall: boolean;
};

/**
 * Two views of the same desk. Open, everything is in view; focused, the
 * camera moves straight towards how I work, so it grows where it stands and
 * whatever is round it goes out of view. Each has its own walls.
 */
type Framing = {
  full: Bounds;
  focus: Bounds;
  fullAt: Vector3;
  focusAt: Vector3;
  /**
   * The open desk beside the text and under the header, as the open view sees
   * it: where the hatch's field may slide a piece, so none ends up under the words.
   */
  free: Bounds;
  /** Where each thing lands on the floor: how I work in the focused view, the rest in the open one. */
  spots: Map<string, { x: number; z: number }>;
};

type PlaygroundApi = {
  bodies: Map<string, RapierRigidBody>;
  objects: Map<string, Group>;
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
  portrait: [0.56, 0.36],
  robot: [ROBOT_RADIUS, ROBOT_RADIUS],
  night: [1.05, 0.42],
  flags: [0.66, 0.58],
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
const TRIO_UIDS = TRIO.map(uidOf);
/**
 * The desk fills the canvas up to a 1080p screen. Past that it keeps to a
 * stage this big in the middle, in CSS pixels: the camera sees more floor
 * round it instead of drawing things bigger, as the rest of the page does,
 * and the walls stay on the stage's edges.
 */
const STAGE_MAX_WIDTH = 1920;
const STAGE_MAX_HEIGHT = 1080;
const FOV = 30;

/** How far back the camera sits, as a share of CAMERA_POSITION: closer on narrow canvases. */
function cameraDistance(width: number) {
  return Math.min(1, Math.max(NARROW_ZOOM, width / FULL_WIDTH));
}

/**
 * Focused on how I work, the camera covers this share of the way to it: a
 * third bigger, with nothing else on the desk yet to make room for.
 */
const FOCUS_DOLLY = 0.2;

type ScreenSpot = [number, number];
type Arrangement = {
  /** The middle of how I work, which stays put on screen as the camera moves in and out. */
  focus: ScreenSpot;
  /**
   * Each thing's spot, across the free part of the canvas (0 at its left, 1
   * at its right) and down the whole of it: how I work as focused, the rest
   * as open.
   */
  spots: Record<string, ScreenSpot>;
};

/**
 * Where things land, in screen terms, so the desk reads the same at any size.
 * How I work goes left to right, from day to night, the agents a little in
 * front between them; the rest of me goes round it once asked for: me, my
 * robot and my two languages at the back, which reads best from up there,
 * the rest along the front.
 */
const ARRANGEMENTS: Record<'row' | 'stack' | 'tall', Arrangement> = {
  row: {
    focus: [0.48, 0.48],
    spots: {
      'ticket-0': [0.14, 0.38],
      agents: [0.45, 0.6],
      'prop-night': [0.79, 0.36],
      'prop-portrait': [0.08, 0.17],
      'prop-robot': [0.37, 0.13],
      'prop-flags': [0.64, 0.17],
      'prop-server': [0.9, 0.2],
      'prop-mountain': [0.08, 0.8],
      'key-slash': [0.3, 0.86],
      'prop-oss': [0.55, 0.84],
      // The walking desk in the corner, square to the camera so its screen and belt show.
      'prop-sport': [0.86, 0.78],
    },
  },
  // Too narrow for a row beside the text: the agents go under the other two.
  stack: {
    focus: [0.5, 0.5],
    spots: {
      'ticket-0': [0.24, 0.36],
      agents: [0.5, 0.66],
      'prop-night': [0.76, 0.4],
      'prop-portrait': [0.12, 0.14],
      'prop-robot': [0.5, 0.11],
      'prop-flags': [0.86, 0.15],
      'prop-server': [0.12, 0.62],
      'prop-mountain': [0.12, 0.88],
      'key-slash': [0.4, 0.92],
      'prop-oss': [0.66, 0.9],
      'prop-sport': [0.9, 0.78],
    },
  },
  // Deeper than it is wide: read from top to bottom.
  tall: {
    focus: [0.5, 0.5],
    spots: {
      'ticket-0': [0.32, 0.3],
      agents: [0.66, 0.5],
      'prop-night': [0.32, 0.7],
      'prop-robot': [0.25, 0.08],
      'prop-portrait': [0.75, 0.1],
      'prop-flags': [0.82, 0.3],
      'prop-mountain': [0.82, 0.7],
      'key-slash': [0.2, 0.9],
      'prop-oss': [0.45, 0.92],
      'prop-server': [0.66, 0.9],
      'prop-sport': [0.85, 0.88],
    },
  },
};
/** Free space this much wider than tall, or more, takes how I work in a row. */
const ROW_ASPECT = 0.7;

/** How far each thing's heading may wander from facing the camera as it lands. */
const YAW: Partial<Record<string, number>> = {
  'ticket-0': 0.12,
  agents: 0.1,
  'prop-night': 0.12,
  'prop-portrait': 0.2,
  'prop-robot': 0.3,
  'prop-flags': 0.1,
  'prop-sport': 0.1,
  'prop-server': 0.25,
};

/** The point on the floor under a spot on the canvas, given in fractions from its top left. */
function floorAt(camera: Camera, [x, y]: ScreenSpot): Vector3 {
  const raycaster = new Raycaster();
  raycaster.setFromCamera(new Vector2(x * 2 - 1, 1 - y * 2), camera);
  return (
    raycaster.ray.intersectPlane(new Plane(new Vector3(0, 1, 0), 0), new Vector3()) ?? new Vector3()
  );
}

/** The part of the floor a camera sees, a little inside the stage's edges: wider at the back than the front. */
function floorBounds(
  camera: Camera,
  tall: boolean,
  stage: (spot: ScreenSpot) => ScreenSpot
): Bounds {
  const nearLeft = floorAt(camera, stage([0, 1]));
  const nearRight = floorAt(camera, stage([1, 1]));
  const farLeft = floorAt(camera, stage([0, 0]));
  const farRight = floorAt(camera, stage([1, 0]));
  const depth = nearLeft.z - farLeft.z;
  const inset = (left: number, right: number) => {
    const middle = (left + right) / 2;
    const half = ((right - left) / 2) * 0.97;
    return [middle - half, middle + half];
  };
  const [minX, maxX] = inset(nearLeft.x, nearRight.x);
  const [farMinX, farMaxX] = inset(farLeft.x, farRight.x);
  return {
    minX,
    maxX,
    farMinX,
    farMaxX,
    zNear: nearLeft.z - depth * 0.035,
    zFar: farLeft.z + depth * (tall ? 0.02 : 0.025),
    tall,
  };
}

/** The floor under one part of the stage, given as fractions of it: left, top, right, bottom. */
function floorBoundsIn(
  camera: Camera,
  tall: boolean,
  stage: (spot: ScreenSpot) => ScreenSpot,
  [left, top, right, bottom]: [number, number, number, number]
): Bounds {
  const nearLeft = floorAt(camera, stage([left, bottom]));
  const nearRight = floorAt(camera, stage([right, bottom]));
  const farLeft = floorAt(camera, stage([left, top]));
  const farRight = floorAt(camera, stage([right, top]));
  return {
    minX: nearLeft.x,
    maxX: nearRight.x,
    farMinX: farLeft.x,
    farMaxX: farRight.x,
    zNear: nearLeft.z,
    zFar: farLeft.z,
    tall,
  };
}

/** How far across the desk reaches at depth z, between its near and far edges. */
function spanAt(bounds: Bounds, z: number): [number, number] {
  const t = Math.min(1, Math.max(0, (bounds.zNear - z) / (bounds.zNear - bounds.zFar)));
  return [
    bounds.minX + (bounds.farMinX - bounds.minX) * t,
    bounds.maxX + (bounds.farMaxX - bounds.maxX) * t,
  ];
}

/** Places the camera for the canvas, then works out what it sees, open and focused, and where things land. */
function useDeskFraming(canvasFreeLeft: number, canvasFreeTop: number): Framing {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  return useMemo(() => {
    const tall = size.width > 0 && size.height / size.width > TALL_RATIO;
    // A phone's desk is the whole canvas; a big screen's keeps to the stage in its middle.
    const stageWidth = tall ? size.width : Math.min(size.width, STAGE_MAX_WIDTH);
    const stageHeight = tall ? size.height : Math.min(size.height, STAGE_MAX_HEIGHT);
    const scaleX = size.width > 0 ? stageWidth / size.width : 1;
    const scaleY = size.height > 0 ? stageHeight / size.height : 1;
    const stage = ([u, v]: ScreenSpot): ScreenSpot => [
      (1 - scaleX) / 2 + u * scaleX,
      (1 - scaleY) / 2 + v * scaleY,
    ];
    // R3F syncs the aspect after render; bounds are needed before the first spawn.
    if (camera instanceof PerspectiveCamera && size.width > 0 && size.height > 0) {
      camera.aspect = size.width / size.height;
      const halfWidth = Math.atan(TALL_WIDTH / 2 / TALL_DISTANCE);
      // Widened past the stage, so the stage looks as a canvas its size would and things keep their size.
      const wide = 2 * Math.atan(Math.tan((FOV / 2) * (Math.PI / 180)) / scaleY);
      camera.fov =
        ((tall ? 2 * Math.atan(Math.tan(halfWidth) / camera.aspect) : wide) * 180) / Math.PI;
      // Far back, a close near plane would leave too little depth precision for thin layers.
      camera.near = tall ? TALL_DISTANCE / 4 : 0.1;
      camera.far = tall ? TALL_DISTANCE * 2 : 80;
      camera.updateProjectionMatrix();
    }
    // The text and the header, measured on the canvas, as shares of the stage.
    const freeLeft = Math.min(0.7, (canvasFreeLeft - (1 - scaleX) / 2) / scaleX);
    const freeTop = (canvasFreeTop - (1 - scaleY) / 2) / scaleY;
    // The free part of the stage, beside the text if it runs under it, a little in from the edges.
    const left = Math.max(0.02, freeLeft);
    const right = 0.98;
    let arrangement = ARRANGEMENTS.stack;
    if (tall) {
      arrangement = ARRANGEMENTS.tall;
    } else if (((right - left) * stageWidth) / stageHeight >= ROW_ASPECT) {
      arrangement = ARRANGEMENTS.row;
    }
    const onScreen = ([u, v]: ScreenSpot): ScreenSpot => stage([left + u * (right - left), v]);
    // The rest of me sits round how I work: its back row keeps clear of the header.
    const top = Math.min(0.2, Math.max(0, freeTop));
    const belowHeader = ([u, v]: ScreenSpot): ScreenSpot => onScreen([u, top + v * (1 - top)]);
    const fullAt = tall
      ? new Vector3(...CAMERA_POSITION).normalize().multiplyScalar(TALL_DISTANCE).add(LOOK_AT)
      : new Vector3(...(CAMERA_POSITION.map((axis) => axis * cameraDistance(stageWidth)) as Vec3));
    camera.position.copy(fullAt);
    camera.lookAt(LOOK_AT);
    camera.updateMatrixWorld();
    const full = floorBounds(camera, tall, stage);
    // Clear of the text, the header and the hints along the bottom.
    const free = floorBoundsIn(camera, tall, stage, [left + 0.01, top + 0.03, 0.96, 0.92]);
    const spots = new Map<string, { x: number; z: number }>();
    const trio = new Set(TRIO_UIDS);
    Object.entries(arrangement.spots).forEach(([uid, spot]) => {
      if (!trio.has(uid)) {
        spots.set(uid, floorAt(camera, belowHeader(spot)));
      }
    });
    // Straight towards the middle of how I work, without turning: it stays where it is on screen.
    const focusAt = fullAt.clone().lerp(floorAt(camera, onScreen(arrangement.focus)), FOCUS_DOLLY);
    camera.position.copy(focusAt);
    camera.updateMatrixWorld();
    const focus = floorBounds(camera, tall, stage);
    trio.forEach((uid) => spots.set(uid, floorAt(camera, onScreen(arrangement.spots[uid]))));
    camera.position.copy(fullAt);
    camera.updateMatrixWorld();
    return { full, focus, fullAt, focusAt, free, spots };
  }, [camera, size.width, size.height, canvasFreeLeft, canvasFreeTop]);
}

/** Eases the camera between the two views, and jumps straight there when the canvas is resized. */
function CameraRig({ framing, open }: { framing: Framing; open: boolean }) {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const jump = useRef(true);
  useLayoutEffect(() => {
    jump.current = true;
  }, [framing]);
  useEffect(() => {
    invalidate();
  }, [open, invalidate]);
  useFrame((_, delta) => {
    const target = open ? framing.fullAt : framing.focusAt;
    if (jump.current) {
      jump.current = false;
      camera.position.copy(target);
      return;
    }
    if (camera.position.distanceToSquared(target) < 1e-6) {
      return;
    }
    camera.position.lerp(target, 1 - Math.exp(-Math.min(delta, 0.1) * 4.5));
    invalidate();
  });
  return null;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/** The part of the desk not under the text, where the robot roams: inside the near edge, the narrowest. */
function freeDesk(bounds: Bounds, biasRight: boolean) {
  const width = bounds.maxX - bounds.minX;
  const depth = bounds.zNear - bounds.zFar;
  return {
    minX: biasRight ? bounds.minX + width * 0.53 : bounds.minX + 0.9,
    maxX: bounds.maxX - 0.9,
    // The far edge sits under the header, so the back row starts a little forward;
    // a phone's desk starts below the text, so its back row can go right to the edge.
    minZ: bounds.tall ? bounds.zFar + 1.9 : bounds.zFar + depth * 0.18,
    maxZ: bounds.tall ? bounds.zNear - 0.6 : bounds.zNear - depth * 0.06,
  };
}

type Placement = { spawn: Vec3; rotation: Vec3 };

/** Room left between a landed piece and the walls, past where the force field starts to glow. */
const SPAWN_CLEARANCE = GLOW_FROM + 0.2;

/** Where each item lands: how I work on the focused desk, the rest round it on the whole one. */
function spawnLayout(
  framing: Framing,
  items: PlaygroundItem[],
  /** Drops in after this many others, so they land one after another. */
  after = 0
): Placement[] {
  return items.map((item, index) => {
    const trio = TRIO_UIDS.includes(item.uid);
    const bounds = trio ? framing.focus : framing.full;
    const spot = framing.spots.get(item.uid) ?? {
      x: (bounds.minX + bounds.maxX) / 2,
      z: (bounds.zFar + bounds.zNear) / 2,
    };
    const yaw = YAW[item.uid] ?? 0.35;
    // Lands with its edges clear of where the force field starts to glow, however it turns.
    const [footX, footZ] = FOOTPRINT[item.info];
    const halfX = footX * Math.cos(yaw) + footZ * Math.sin(yaw);
    const halfZ = footZ * Math.cos(yaw) + footX * Math.sin(yaw);
    const clearZ = Math.max(0.9, halfZ + SPAWN_CLEARANCE);
    const z = Math.max(
      bounds.zFar + clearZ,
      Math.min(bounds.zNear - clearZ, spot.z + randomBetween(-0.12, 0.12))
    );
    const [minX, maxX] = spanAt(bounds, z);
    // The sides splay out: a piece's near corner reaches further across, and a gap square to them needs more room.
    const splay = (bounds.farMaxX - bounds.maxX) / (bounds.zNear - bounds.zFar);
    const clearX = Math.max(
      0.9,
      halfX + Math.abs(splay) * halfZ + SPAWN_CLEARANCE * Math.hypot(1, splay)
    );
    const x =
      maxX - minX > clearX * 2
        ? Math.max(minX + clearX, Math.min(maxX - clearX, spot.x + randomBetween(-0.12, 0.12)))
        : (minX + maxX) / 2;
    return {
      spawn: [
        x,
        // Staggered heights: they land one after another.
        1.6 + (after + index) * 0.35,
        z,
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

/** A wall from one point on the floor to another, as tall as the desk's ceiling. */
function Wall({
  from,
  to,
  onHit,
}: {
  from: [number, number];
  to: [number, number];
  onHit: (body: RapierRigidBody) => void;
}) {
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  return (
    <CuboidCollider
      args={[0.5, 12, length / 2 + 1]}
      position={[(from[0] + to[0]) / 2, 6, (from[1] + to[1]) / 2]}
      rotation={[0, Math.atan2(to[0] - from[0], to[1] - from[1]), 0]}
      onCollisionEnter={({ other }) => other.rigidBody && onHit(other.rigidBody)}
    />
  );
}

/** The floor, a ceiling, and walls round what the camera sees, the sides splaying out to the back. */
function Walls({
  bounds,
  onHit,
}: {
  bounds: Bounds;
  /** Something knocked into one of the walls: the force field ripples there. */
  onHit: (body: RapierRigidBody) => void;
}) {
  const { minX, maxX, farMinX, farMaxX, zFar, zNear } = bounds;
  const depth = zNear - zFar;
  const centerZ = (zNear + zFar) / 2;
  // Each wall sits half its thickness outside the edge it guards.
  const out = (x: number, side: number) => x + side * 0.5;
  return (
    <RigidBody type="fixed" colliders={false} friction={0.9}>
      <CuboidCollider args={[60, 0.5, 60]} position={[0, -0.5, 0]} />
      <Wall from={[out(minX, -1), zNear]} to={[out(farMinX, -1), zFar]} onHit={onHit} />
      <Wall from={[out(maxX, 1), zNear]} to={[out(farMaxX, 1), zFar]} onHit={onHit} />
      <Wall from={[farMinX, zFar - 0.5]} to={[farMaxX, zFar - 0.5]} onHit={onHit} />
      <Wall from={[minX, zNear + 0.5]} to={[maxX, zNear + 0.5]} onHit={onHit} />
      <CuboidCollider
        args={[(farMaxX - farMinX) / 2 + 1, 0.5, depth]}
        position={[(farMinX + farMaxX) / 2, 10, centerZ]}
      />
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
  /** Carried up through a pipe: moved by its platform until it is on the desk. */
  rising?: boolean;
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
  rising = false,
  onCollisionEnter,
  children,
}: GrabbableProps) {
  const ref = useRef<RapierRigidBody>(null);
  const look = useRef<Group>(null);
  const { bodies, objects, press } = usePlaygroundApi();

  useEffect(() => {
    const body = ref.current;
    const object = look.current;
    if (body) {
      bodies.set(uid, body);
    }
    if (object) {
      objects.set(uid, object);
    }
    return () => {
      bodies.delete(uid);
      objects.delete(uid);
    };
  }, [bodies, objects, uid]);

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
      type={rising ? 'kinematicPosition' : 'dynamic'}
      onCollisionEnter={onCollisionEnter}
    >
      <group
        ref={look}
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

type PlacedItem = {
  item: PlaygroundItem;
  spawn: Vec3;
  rotation: Vec3;
  /** Coming up through a pipe: moved by its platform, not by physics. */
  rising?: boolean;
};

const NO_EXTRAS: ExtraId[] = [];
/** How far in front of its middle each piece of how I work ends, for its label to sit under. */
const LABEL_DEPTH: Partial<Record<InfoId, number>> = { ticket: 0.5, agents: 0.9, night: 0.45 };
/**
 * The piece itself, too small to see, under the desk: its shaders and
 * textures get ready while its pipe opens, so bringing it up never stalls.
 * Its colliders keep to a still world of their own.
 */
function WarmPiece({ item }: { item: PlaygroundItem }) {
  return (
    <Physics paused>
      <group position={[0, -2, 0]} scale={0.001}>
        <ItemMesh item={item} />
      </group>
    </Physics>
  );
}

/** How deep each pipe goes under the desk, and where its platform waits at the bottom. */
const PIPE_DEPTH = 2.6;
const PIPE_FLOOR = -PIPE_DEPTH + 0.06;
/** Hover raises a closed hatch; a click raises it faster before the shutter moves. */
const PIPE_EMERGE_S = 0.28;
const PIPE_CLICK_EMERGE_S = 0.14;
const PIPE_IRIS_MS = 360;
const PIPE_CLOSE_MS = 240;
const PIPE_SINK_MS = 200;
/** The platform's ride up, in ms, and how long it stays flush under its piece before the pipe goes. */
const RISE_MS = 760;
const RISE_SETTLE_MS = 100;
/** The field starts with the shutter, before the platform can carry anything into its neighbours. */
const FIELD_LEAD_MS = 360;
const VENT_AFTER_MS = 140;
const FIELD_GIVE_UP_MS = 1100;
/** No more pipes than the desk's mask has holes for. */
const MAX_PIPES = 12;

function easeOutCubic(x: number) {
  return 1 - (1 - x) ** 3;
}

function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2;
}

/** The shutter moves as one mechanism, catches its stop, then takes up the slack. */
function openIris(t: number) {
  if (t < 0.78) {
    return easeInOutCubic(t / 0.78) * 1.045;
  }
  return 1 + 0.045 * (1 - easeInOutCubic(Math.min(1, (t - 0.78) / 0.22)));
}

/** Wide enough for the piece's base to come up through: it is turned square to the viewer. */
function pipeRadius(info: InfoId) {
  return Math.min(1.2, Math.max(0.6, Math.max(...FOOTPRINT[info]) + 0.16));
}

/**
 * Pointing raises a closed hatch. A click opens it, clears its neighbours,
 * and brings the piece up. React only hears of pipes coming and going.
 */
type Pipe = {
  key: number;
  item: PlaygroundItem;
  x: number;
  z: number;
  yaw: number;
  radius: number;
  drive: { current: PipeDrive };
  /** Pointed at, or bringing its piece up. */
  open: boolean;
  /** Linear progress of the mouth coming up and the iris opening, 0 to 1. */
  emerge: number;
  iris: number;
  /** Once clicked: the piece rides up when the iris is open, then the pipe goes. */
  rise: null | {
    /** Time drawn since the click, and since the shutter started opening, in ms. */
    age: number;
    opening: number | null;
    /** How long the platform has been going up, in ms of physics time, once the iris was open. */
    elapsed: number | null;
    /** How far above its base the piece's middle is, measured once it is there. */
    offset: number | null;
    /** Its age when it reached the top, so pausing the hero also pauses the close. */
    arrived: number | null;
  };
  /** Neighbours still gliding or braking outside the landing spot. */
  targets: Map<string, FieldTarget>;
  /** Gone from sight: it is taken away. */
  done: boolean;
};

type FieldTarget = {
  body: RapierRigidBody;
  goal: Point;
  footprint: FieldFootprint;
  upright: boolean;
  gap: number;
  stalled: number;
  friction: Array<{ value: number; rule: CoefficientCombineRule }>;
};

/** One body of whatever kind, as it looks on the desk. */
function ItemMesh({ item }: { item: PlaygroundItem }) {
  switch (item.kind) {
    case 'ticket':
      return <DayShiftMesh item={item} />;
    case 'keycap':
      return <KeycapMesh item={item} />;
    case 'agent':
      return <AgentMesh />;
    default:
      return <PropMesh item={item} />;
  }
}

function Scene({
  coarse,
  biasRight,
  freeLeft = 0,
  freeTop = 0,
  extras = NO_EXTRAS,
  preview = null,
  open = false,
  onLabels,
  onShipped,
  onSelect,
  selected = null,
  onAnchor,
  onReady,
  robotFollow = false,
  spotlight = null,
  motion,
}: PlaygroundProps) {
  const framing = useDeskFraming(freeLeft, freeTop);
  const camera = useThree((state) => state.camera);
  const pointer = useThree((state) => state.pointer);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);
  const { world } = useRapier();

  const bodies = useMemo(() => new Map<string, RapierRigidBody>(), []);
  /** What knocked into the walls since the force field last looked. */
  const wallHits = useRef<RapierRigidBody[]>([]);
  const onWallHit = useCallback((body: RapierRigidBody) => {
    wallHits.current.push(body);
  }, []);
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

  // How I work, alone at first; the rest comes from the tray.
  const [placed, setPlaced] = useState<PlacedItem[]>(() => {
    const items = buildTrio();
    const spots = spawnLayout(framing, items);
    return items.map((item, index) => ({ item, ...spots[index] }));
  });
  // Once anything else is on the desk, the walls move out to the whole of it.
  const grown = placed.length > TRIO.length;
  const bounds = grown ? framing.full : framing.focus;

  const placedRef = useRef(placed);
  useLayoutEffect(() => {
    placedRef.current = placed;
  }, [placed]);
  /** What each body looks like, to measure how far its middle sits above its base. */
  const objects = useMemo(() => new Map<string, Group>(), []);
  /** Pieces coming up through a pipe: carried by its platform, not to be grabbed yet. */
  const rising = useRef(new Set<string>());
  /** The field owns these pieces briefly, so the belt and robot do not fight their slide. */
  const repelled = useRef(new Set<string>());
  /** Half the width and depth of each thing on the desk, for the force field to tell how close it is. */
  const halfSize = useCallback((uid: string): [number, number] => {
    const info = placedRef.current.find(({ item }) => item.uid === uid)?.item.info;
    return info ? FOOTPRINT[info] : [0.5, 0.5];
  }, []);

  // The pipes in the desk: React hears only of pipes coming and going; the frame loop does the rest.
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const pipesRef = useRef<Pipe[]>([]);
  const pipeKey = useRef(0);
  const openPipe = useCallback(
    (item: PlaygroundItem): Pipe => {
      const existing = pipesRef.current.find((pipe) => pipe.item.uid === item.uid && !pipe.done);
      if (existing) {
        existing.open = true;
        return existing;
      }
      const [
        {
          spawn: [x, , z],
          rotation,
        },
      ] = spawnLayout(framing, [item]);
      pipeKey.current += 1;
      const pipe: Pipe = {
        key: pipeKey.current,
        item,
        x,
        z,
        yaw: rotation[1],
        radius: pipeRadius(item.info),
        drive: {
          current: { presence: 0, aperture: 0, platform: PIPE_FLOOR, ventTime: -1, ventEnd: null },
        },
        open: true,
        emerge: 0,
        iris: 0,
        rise: null,
        targets: new Map(),
        done: false,
      };
      // Never more than the desk's mask has holes for: the oldest one shutting goes at once.
      let list = pipesRef.current;
      if (list.length >= MAX_PIPES) {
        const oldest = list.find((other) => !other.open && !other.rise);
        list = list.filter((other) => other !== oldest);
      }
      pipesRef.current = [...list, pipe];
      setPipes(pipesRef.current);
      return pipe;
    },
    [framing]
  );

  // Pointing marks the landing spot with a closed lid, and retracts the previous one.
  useEffect(() => {
    const item =
      preview && !placedRef.current.some((entry) => entry.item.uid === uidOf(preview))
        ? buildExtra(preview)
        : null;
    pipesRef.current.forEach((pipe) => {
      if (!pipe.rise) {
        pipe.open = pipe.item.uid === item?.uid;
      }
    });
    if (item) {
      openPipe(item);
    }
    invalidate();
  }, [preview, openPipe, invalidate]);

  // Added from the tray: one piece comes up through its pipe; everything at once drops in from above.
  useEffect(() => {
    const { current } = placedRef;
    const items = extras
      .filter((id) => !current.some(({ item }) => item.uid === uidOf(id)))
      .map(buildExtra);
    if (!items.length) {
      return;
    }
    let entries: PlacedItem[];
    if (items.length === 1) {
      const [item] = items;
      const pipe = openPipe(item);
      pipe.rise = { age: 0, opening: null, elapsed: null, offset: null, arrived: null };
      rising.current.add(item.uid);
      entries = [
        {
          item,
          // Deep in the pipe, under the desk, till its platform brings it up.
          spawn: [pipe.x, PIPE_FLOOR + 0.3, pipe.z],
          rotation: [0, pipe.yaw, 0],
          rising: true,
        },
      ];
    } else {
      pipesRef.current.forEach((pipe) => {
        if (!pipe.rise) {
          pipe.open = false;
        }
      });
      const spots = spawnLayout(framing, items);
      entries = items.map((item, index) => ({ item, ...spots[index] }));
    }
    setPlaced((list) => [
      ...list,
      ...entries.filter((entry) => !list.some(({ item }) => item.uid === entry.item.uid)),
    ]);
    invalidate();
  }, [extras, framing, openPipe, invalidate]);

  /** Up on the desk: physics has it from here, and it can be picked up. */
  const settle = useCallback((uid: string) => {
    rising.current.delete(uid);
    setPlaced((list) =>
      list.map((entry) => (entry.item.uid === uid ? { ...entry, rising: false } : entry))
    );
  }, []);

  // The mechanism shares the platform's physics clock, so a pause holds the whole arrival still.
  const measure = useMemo(
    () => ({
      box: new Box3(),
      at: new Vector3(),
      rotation: new Quaternion(),
      axis: new Vector3(),
    }),
    []
  );

  const clearZone = (pipe: Pipe): ClearZone => {
    const [halfX, halfZ] = FOOTPRINT[pipe.item.info];
    const cos = Math.abs(Math.cos(pipe.yaw));
    const sin = Math.abs(Math.sin(pipe.yaw));
    return {
      x: pipe.x,
      z: pipe.z,
      radius: pipe.radius * 1.15 + 0.14,
      halfX: cos * halfX + sin * halfZ + 0.14,
      halfZ: sin * halfX + cos * halfZ + 0.14,
    };
  };

  const fieldFootprint = (uid: string, body: RapierRigidBody): FieldFootprint | null => {
    const info = placedRef.current.find(({ item }) => item.uid === uid)?.item.info;
    const object = objects.get(uid);
    if (
      !info ||
      !object ||
      uid === dragging.current ||
      rising.current.has(uid) ||
      righting.current.has(uid) ||
      !body.isDynamic()
    ) {
      return null;
    }
    const position = body.translation();
    object.updateWorldMatrix(true, true);
    measure.box.setFromObject(object);
    object.getWorldPosition(measure.at);
    // Already on the desk: the field leaves falling, carried and standing-up pieces alone.
    const base = position.y + measure.box.min.y - measure.at.y;
    if (measure.box.isEmpty() || base > 0.45 || Math.abs(body.linvel().y) > 1.5) {
      return null;
    }
    const r = body.rotation();
    measure.rotation.set(r.x, r.y, r.z, r.w);
    const heading = measure.axis.set(0, 0, 1).applyQuaternion(measure.rotation);
    const yaw = Math.atan2(heading.x, heading.z);
    const [halfX, halfZ] = FOOTPRINT[info];
    const cos = Math.abs(Math.cos(yaw));
    const sin = Math.abs(Math.sin(yaw));
    return {
      x: position.x,
      z: position.z,
      halfX: Math.max(
        cos * halfX + sin * halfZ,
        Math.abs(measure.box.max.x - measure.at.x),
        Math.abs(measure.box.min.x - measure.at.x)
      ),
      halfZ: Math.max(
        sin * halfX + cos * halfZ,
        Math.abs(measure.box.max.z - measure.at.z),
        Math.abs(measure.box.min.z - measure.at.z)
      ),
    };
  };

  const landingClear = (pipe: Pipe) => {
    const zone = clearZone(pipe);
    for (const [uid, body] of bodies) {
      const footprint = fieldFootprint(uid, body);
      if (footprint && fieldClearance(zone, footprint) < 0) {
        return false;
      }
    }
    return true;
  };

  const releaseField = useCallback((pipe: Pipe, uid: string, target: FieldTarget) => {
    if (target.body.isValid()) {
      target.friction.forEach((friction, index) => {
        const collider = target.body.collider(index);
        collider.setFriction(friction.value);
        collider.setFrictionCombineRule(friction.rule);
      });
    }
    pipe.targets.delete(uid);
    repelled.current.delete(uid);
    if (uid === ROBOT_UID) {
      handledAt.current.set(uid, performance.now());
    }
  }, []);

  useLayoutEffect(() => {
    const registry = pipesRef;
    return () => {
      registry.current.forEach((pipe) =>
        pipe.targets.forEach((target, uid) => releaseField(pipe, uid, target))
      );
    };
  }, [releaseField]);

  const advancePipes = (dt: number) => {
    const list = pipesRef.current;
    if (!list.length) {
      return;
    }
    let gone = false;
    let moving = false;
    list.forEach((pipe) => {
      const { rise, drive } = pipe;
      const was = pipe.emerge + drive.current.aperture;
      const arrived = rise?.arrived ?? null;
      const up = arrived !== null;
      let aperture = 0;
      if (rise) {
        rise.age += dt * 1000;
        if (rise.opening === null) {
          pipe.emerge = Math.min(1, pipe.emerge + dt / PIPE_CLICK_EMERGE_S);
          if (pipe.emerge >= 1) {
            rise.opening = 0;
          }
        } else {
          rise.opening += dt * 1000;
        }
        pipe.iris = Math.min(1, (rise.opening ?? 0) / PIPE_IRIS_MS);
        aperture = openIris(pipe.iris);
        if (arrived !== null) {
          const closing = Math.max(0, rise.age - arrived - RISE_SETTLE_MS);
          pipe.iris = 1 - Math.min(1, closing / PIPE_CLOSE_MS);
          aperture = easeInOutCubic(pipe.iris);
          // Close the lid before the whole mouth goes back under the desk.
          if (closing >= PIPE_CLOSE_MS) {
            pipe.emerge = Math.max(0, 1 - (closing - PIPE_CLOSE_MS) / PIPE_SINK_MS);
          }
        }
        drive.current.ventTime = rise.opening === null ? -1 : rise.opening / 1000;
        if (arrived !== null && drive.current.ventEnd === null && rise.opening !== null) {
          drive.current.ventEnd = (rise.opening - (rise.age - arrived) + VENT_AFTER_MS) / 1000;
        }
      } else if (pipe.open) {
        pipe.emerge = Math.min(1, pipe.emerge + dt / PIPE_EMERGE_S);
      } else {
        pipe.emerge = Math.max(0, pipe.emerge - dt / (PIPE_SINK_MS / 1000));
      }
      drive.current.presence = easeOutCubic(pipe.emerge);
      drive.current.aperture = aperture;
      if (up && rising.current.has(pipe.item.uid)) {
        settle(pipe.item.uid);
      }
      const ventDone =
        drive.current.ventEnd !== null &&
        drive.current.ventTime >= drive.current.ventEnd + VAPOUR_TAIL_S;
      if (pipe.emerge <= 0 && (!rise ? !pipe.open : ventDone && pipe.targets.size === 0)) {
        pipe.done = true;
        gone = true;
      }
      moving ||= pipe.emerge + aperture !== was || (rise !== null && !pipe.done);
    });
    if (gone) {
      pipesRef.current = list.filter((pipe) => !pipe.done);
      setPipes(pipesRef.current);
    }
    // The tail and braking keep their frames; a closed hatch at rest asks for nothing.
    if (moving) {
      invalidate();
    }
  };

  // Under the piece exactly as it is drawn, including physics interpolation between steps.
  useFrame(() => {
    pipesRef.current.forEach(({ rise, drive, item }) => {
      const body = objects.get(item.uid)?.parent;
      const offset = rise?.elapsed !== null ? (rise?.offset ?? null) : null;
      drive.current.platform =
        offset !== null && body ? Math.min(0, body.position.y - offset) : PIPE_FLOOR;
      if (rise && rise.arrived !== null) {
        // The platform makes room for the closing leaves; the piece rests on the physics floor.
        const closing = Math.max(0, rise.age - rise.arrived - RISE_SETTLE_MS);
        drive.current.platform = -0.08 * easeOutCubic(Math.min(1, closing / PIPE_CLOSE_MS));
      }
    });
  }, -1);

  /**
   * Each physics step, a piece coming up rides its pipe's platform: once the
   * iris is open, up from the bottom of the pipe to the desk.
   */
  const liftPieces = (step: number) => {
    pipesRef.current.forEach((pipe) => {
      const { rise } = pipe;
      const body = bodies.get(pipe.item.uid);
      if (!rise || !body || rise.arrived !== null) {
        return;
      }
      if (rise.offset === null) {
        const object = objects.get(pipe.item.uid);
        if (!object) {
          return;
        }
        object.updateWorldMatrix(true, true);
        measure.box.setFromObject(object);
        if (measure.box.isEmpty()) {
          return;
        }
        rise.offset = object.getWorldPosition(measure.at).y - measure.box.min.y;
      }
      // Counted in physics steps, so a pause (the hero scrolled away) never makes it jump.
      let height = PIPE_FLOOR;
      if (rise.elapsed === null) {
        const opened = rise.opening ?? 0;
        // A piece the field cannot clear is nudged by the platform itself, rather than holding everything up.
        if (opened >= FIELD_LEAD_MS && (landingClear(pipe) || opened >= FIELD_GIVE_UP_MS)) {
          rise.elapsed = 0;
        }
      } else {
        rise.elapsed += step;
        const t = Math.min(1, rise.elapsed / RISE_MS);
        height = PIPE_FLOOR * (1 - easeOutCubic(t));
        if (t >= 1) {
          rise.arrived = rise.age;
        }
      }
      body.setNextKinematicTranslation({ x: pipe.x, y: height + rise.offset, z: pipe.z });
    });
  };

  // Shaders are compiled before anything shows, so the first moves never stall on them.
  useEffect(() => {
    let live = true;
    gl.compileAsync(scene, camera)
      .catch(() => undefined)
      .then(() => {
        if (live) {
          onReady?.();
        }
      });
    return () => {
      live = false;
    };
    // Once, for how I work; whatever comes later compiles while its preview floats.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      if (!body || rising.current.has(uid)) {
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
      if (!body || rising.current.has(uid)) {
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
        target.z = Math.max(bounds.zFar + 0.6, Math.min(bounds.zNear - 0.6, target.z));
        const [minX, maxX] = spanAt(bounds, target.z);
        target.x = Math.max(minX + 0.6, Math.min(maxX - 0.6, target.x));
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
        position.x < bounds.farMinX - 3 ||
        position.x > bounds.farMaxX + 3 ||
        position.z > bounds.zNear + 3 ||
        position.z < bounds.zFar - 3
      ) {
        body.setTranslation(
          { x: (bounds.minX + bounds.maxX) / 2, y: 6, z: (bounds.zFar + bounds.zNear) / 2 },
          true
        );
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
      minX: Math.max(bounds.minX + 0.6, desk.minX - ROBOT_MARGIN),
      maxX: Math.min(bounds.maxX - 0.6, desk.maxX + ROBOT_MARGIN),
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
      if (
        uid === TREADMILL_UID ||
        uid === dragging.current ||
        righting.current.has(uid) ||
        rising.current.has(uid) ||
        repelled.current.has(uid)
      ) {
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

  /** The vent's field gently slides neighbours out, then brakes and restores their ordinary grip. */
  const pushPieces = (dt: number) => {
    pipesRef.current.forEach((pipe) => {
      const { rise } = pipe;
      if (!rise) {
        return;
      }
      if (rise.opening === null) {
        return;
      }
      const zone = clearZone(pipe);
      // Somewhere still in view beside the text; only a desk with no such room falls back to its walls.
      const destination = (footprint: FieldFootprint, reserved: FieldFootprint[]) =>
        fieldDestination(zone, footprint, framing.free, reserved) ??
        fieldDestination(zone, footprint, bounds, reserved);
      const parking = (except: string) => {
        const reserved: FieldFootprint[] = [];
        bodies.forEach((body, uid) => {
          if (uid === except) {
            return;
          }
          const target = pipesRef.current
            .flatMap((other) => [...other.targets.entries()])
            .find(([key]) => key === uid)?.[1];
          if (target) {
            reserved.push({ ...target.footprint, ...target.goal });
            return;
          }
          const footprint = fieldFootprint(uid, body);
          if (footprint && fieldClearance(zone, footprint) >= 0) {
            reserved.push(footprint);
          }
        });
        return reserved;
      };
      if (rise.arrived === null) {
        bodies.forEach((body, uid) => {
          if (repelled.current.has(uid)) {
            return;
          }
          const footprint = fieldFootprint(uid, body);
          if (!footprint || fieldClearance(zone, footprint) >= 0.02) {
            return;
          }
          const goal = destination(footprint, parking(uid));
          if (!goal) {
            return;
          }
          if (uid === ROBOT_UID) {
            setTraction(body, false);
            step.path = [];
            step.plannedAt = -Infinity;
          }
          const friction: FieldTarget['friction'] = [];
          for (let i = 0; i < body.numColliders(); i++) {
            const collider = body.collider(i);
            friction.push({ value: collider.friction(), rule: collider.frictionCombineRule() });
            collider.setFriction(0.12);
            collider.setFrictionCombineRule(CoefficientCombineRule.Min);
          }
          const r = body.rotation();
          measure.rotation.set(r.x, r.y, r.z, r.w);
          const upright = measure.axis.set(0, 1, 0).applyQuaternion(measure.rotation).y > 0.75;
          pipe.targets.set(uid, {
            body,
            goal,
            footprint,
            upright,
            friction,
            gap: Math.hypot(goal.x - footprint.x, goal.z - footprint.z),
            stalled: 0,
          });
          repelled.current.add(uid);
          body.wakeUp();
        });
      }
      pipe.targets.forEach((target, uid) => {
        const { body, footprint } = target;
        if (
          !body.isValid() ||
          uid === dragging.current ||
          rising.current.has(uid) ||
          righting.current.has(uid)
        ) {
          releaseField(pipe, uid, target);
          return;
        }
        const position = body.translation();
        const velocity = body.linvel();
        let goal = fieldInside(bounds, footprint, target.goal);
        const gap = Math.hypot(goal.x - position.x, goal.z - position.z);
        target.stalled = target.gap - gap > 0.015 ? 0 : target.stalled + dt;
        if (target.gap - gap > 0.015) {
          target.gap = gap;
        }
        if (target.stalled > 0.25 && gap > 0.12) {
          // A blocked slide finds a different parking spot, without speeding up or lifting into the jam.
          const alternative = destination({ ...footprint, ...position }, parking(uid));
          if (alternative) {
            target.goal = alternative;
            goal = alternative;
            target.gap = Math.hypot(goal.x - position.x, goal.z - position.z);
          }
          target.stalled = 0;
        }
        const clear = fieldClearance(zone, { ...footprint, x: position.x, z: position.z }) >= 0;
        const finished = gap < 0.045 && Math.hypot(velocity.x, velocity.z) < 0.12 && clear;
        const expired = rise.arrived !== null && rise.age - rise.arrived > 850;
        if (finished || expired) {
          body.setLinvel({ x: velocity.x * 0.15, y: velocity.y, z: velocity.z * 0.15 }, true);
          releaseField(pipe, uid, target);
          return;
        }
        const next = fieldVelocity(position, goal, velocity, dt);
        // Brake before a wall, keeping the whole footprint inside even at a splayed corner.
        const at = fieldInside(bounds, footprint, position);
        const inside = fieldInside(bounds, footprint, {
          x: position.x + next.x * dt,
          z: position.z + next.z * dt,
        });
        // Already against a wall: steer back in at the normal speed, never turn the inset into a snap.
        const contained = Math.hypot(at.x - position.x, at.z - position.z) < 0.001;
        const command = contained
          ? {
              x: (inside.x - position.x) / dt,
              z: (inside.z - position.z) / dt,
            }
          : next;
        const limit = Math.min(1, 3.2 / Math.max(0.001, Math.hypot(command.x, command.z)));
        body.setLinvel(
          {
            x: command.x * limit,
            y: velocity.y,
            z: command.z * limit,
          },
          true
        );
        const r = body.rotation();
        measure.rotation.set(r.x, r.y, r.z, r.w);
        const up = measure.axis.set(0, 1, 0).applyQuaternion(measure.rotation);
        const spin = body.angvel();
        const grip = 1 - Math.exp(-10 * dt);
        // A small gyro resists tipping without forcing a knocked-over piece to stand up.
        const roll = target.upright ? -up.z * 6 : 0;
        const pitch = target.upright ? up.x * 6 : 0;
        body.setAngvel(
          {
            x: spin.x + (roll - spin.x) * grip,
            y: spin.y * Math.exp(-4 * dt),
            z: spin.z + (pitch - spin.z) * grip,
          },
          true
        );
        invalidate();
      });
    });
  };

  /** Slides light things in the robot's lane out to the side, so it can squeeze past them. */
  const nudge = (from: { x: number; z: number }, dirX: number, dirZ: number) => {
    bodies.forEach((other, uid) => {
      const info = infoOf.get(uid);
      if (
        !info ||
        !LIGHT.has(info) ||
        uid === dragging.current ||
        righting.current.has(uid) ||
        rising.current.has(uid) ||
        repelled.current.has(uid)
      ) {
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
      rising.current.has(ROBOT_UID) ||
      repelled.current.has(ROBOT_UID) ||
      righting.current.has(ROBOT_UID) ||
      performance.now() - (handledAt.current.get(ROBOT_UID) ?? -Infinity) < ROBOT_REST_MS
    ) {
      step.following = false;
      if (robot && !repelled.current.has(ROBOT_UID)) {
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

  useBeforePhysicsStep((physics) => {
    advancePipes(physics.timestep);
    liftPieces(physics.timestep * 1000);
    tiltDesk();
    turnHeld();
    standUp();
    runBelt();
    driveRobot();
    pushPieces(physics.timestep);
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

  // How I work's labels sit under each piece, below its front edge, and step aside while it is carried.
  const front = useMemo(() => new Vector3(), []);
  useFrame(() => {
    if (!onLabels) {
      return;
    }
    const labels: DeskLabel[] = [];
    TRIO_UIDS.forEach((uid) => {
      const position = bodies.get(uid)?.translation();
      const point = position ? toScreen(uid) : null;
      if (!position || !point) {
        return;
      }
      front
        .set(position.x, 0, position.z + (LABEL_DEPTH[infoOf.get(uid) ?? 'keys'] ?? 0.5))
        .project(camera);
      labels.push({
        uid,
        x: point.x,
        y: point.y,
        front: ((1 - front.y) / 2) * size.height,
        lifted: position.y > 1 || dragging.current === uid || righting.current.has(uid),
      });
    });
    onLabels(labels);
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
      // What is held on the GPU, to check nothing piles up as things come and go.
      memory: () => ({ ...gl.info.memory }),
    };
    (window as unknown as { __playground?: typeof debug }).__playground = debug;
    return () => {
      delete (window as unknown as { __playground?: typeof debug }).__playground;
    };
  }, [bodies, camera, gl, scene, roam, step]);

  const api = useMemo<PlaygroundApi>(
    () => ({ bodies, objects, press, tryMerge }),
    [bodies, objects, press, tryMerge]
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

  const boundsKey = [
    bounds.minX,
    bounds.maxX,
    bounds.farMinX,
    bounds.farMaxX,
    bounds.zFar,
    bounds.zNear,
  ]
    .map((edge) => edge.toFixed(2))
    .join(':');

  return (
    <PlaygroundContext.Provider value={api}>
      <CameraRig framing={framing} open={open || grown} />
      <Walls key={boundsKey} bounds={bounds} onHit={onWallHit} />
      <ForceField bounds={bounds} bodies={bodies} halfSize={halfSize} hits={wallHits} />
      {pipes.map((pipe) => (
        <group key={pipe.key}>
          <PipeExit
            position={[pipe.x, 0, pipe.z]}
            radius={pipe.radius}
            depth={PIPE_DEPTH}
            drive={pipe.drive}
          />
          <HatchVapour position={[pipe.x, 0, pipe.z]} radius={pipe.radius} drive={pipe.drive} />
          {!pipe.rise && <WarmPiece item={pipe.item} />}
        </group>
      ))}
      {placed.map(({ item, spawn, rotation, rising: up }) => {
        const shared = {
          uid: item.uid,
          kind: item.kind,
          info: item.info,
          spawn,
          rotation,
          rising: up,
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

/**
 * Shadows redrawn only every `every` frames: on slow devices they lag what
 * casts them by a frame, which nobody sees, for a much cheaper frame.
 */
function ShadowCadence({ every }: { every: number }) {
  const gl = useThree((state) => state.gl);
  const frames = useRef(0);
  useEffect(() => {
    gl.shadowMap.autoUpdate = every <= 1;
    gl.shadowMap.needsUpdate = true;
    return () => {
      gl.shadowMap.autoUpdate = true;
    };
  }, [gl, every]);
  useFrame(() => {
    frames.current += 1;
    if (every > 1 && frames.current % every === 0) {
      gl.shadowMap.needsUpdate = true;
    }
  });
  return null;
}

export default function Playground({
  deskKey = 0,
  ...props
}: PlaygroundProps & { deskKey?: number }) {
  const { active, coarse, onMiss, onReady } = props;
  const quality = useQuality();
  const { dpr: maxDpr, fps, shadowMap, shadowEvery } = SETTINGS.desk[quality];
  // Tablets' dense screens show a smaller desk, a little sharper.
  const canvas = useRef<HTMLCanvasElement>(null);
  const dpr = useBudgetDpr(quality, coarse ? maxDpr + 0.5 : maxDpr, canvas);
  // Nothing falls until its shaders are ready and it can be seen.
  const [warm, setWarm] = useState(false);
  const onWarm = useCallback(() => {
    setWarm(true);
    onReady?.();
  }, [onReady]);
  return (
    <Canvas
      ref={canvas}
      // Three's soft shadows are gone: these are what it would fall back to anyway.
      shadows="percentage"
      // As sharp as the device can take, within its quality's budget of pixels: see SETTINGS.
      dpr={dpr}
      // Physics runs on its own loop and asks for a frame while something moves;
      // the animated props add a steady tick on top, only while the hero is on screen.
      frameloop={active ? 'demand' : 'never'}
      camera={{ position: CAMERA_POSITION, fov: FOV, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      // No text selection or callout on a long press: that is how things are picked up.
      style={{ touchAction: 'pan-y', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
      onPointerMissed={onMiss}
      aria-hidden
    >
      {active && <Ticker fps={fps} />}
      <ShadowCadence every={shadowEvery} />
      <ambientLight intensity={0.75} />
      <hemisphereLight args={['#ffffff', '#2a2622', 0.6]} />
      <directionalLight
        // A new size needs a new shadow map: a fresh light brings one.
        key={shadowMap}
        position={[5, 14, 6]}
        intensity={1.9}
        castShadow
        shadow-mapSize={[shadowMap, shadowMap]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0005}
      />
      {/* The desk's surface: invisible but for shadows, and for the pipes cut into it. */}
      <PipeHoles>
        <HoleyShadowFloor opacity={0.4} />
        <Physics
          gravity={[0, -GRAVITY, 0]}
          paused={!active || !warm}
          updateLoop="independent"
          numSolverIterations={8}
          numInternalPgsIterations={2}
        >
          {/* Tidying up starts the desk over: how I work drops in again on its own. */}
          <Scene key={deskKey} {...props} onReady={onWarm} />
        </Physics>
      </PipeHoles>
    </Canvas>
  );
}
