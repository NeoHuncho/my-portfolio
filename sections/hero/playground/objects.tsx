import { type RefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  Box3,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  type Group,
  type InstancedMesh,
  LatheGeometry,
  Matrix4,
  type Mesh,
  type MeshBasicMaterial,
  MeshStandardMaterial,
  Plane,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  RepeatWrapping,
  Shape,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useLanguage } from '@hooks/useLanguage';
import { RoundedBox } from './roundedBox';
import { CLAUDE_PATH, CODEX_PATH } from '../brandMarks';
import { useDeskScreen } from './deskScreen';
import { type KeycapItem, type PropItem } from './items';
import {
  monoFamily,
  roundRect,
  sansFamily,
  useLabelTexture,
  useResourceDisposal,
  wrapText,
} from './labelTexture';
import {
  ConvexHullCollider,
  CuboidCollider,
  CylinderCollider,
  FRICTION_MIN,
  type PhysicsKit,
  usePhysicsKit,
} from './physics';
import { textureScale, useDetailQuality } from '../quality';
import type { RapierCollider } from '@react-three/rapier';

const PAPER = '#f4f2ed';
const ACCENT = '#ff6b35';

// Brand marks, used as-is so the tokens read as the real tools.
const CLAUDE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="${CLAUDE_PATH}"/></svg>`;

const CODEX_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" fill-rule="evenodd" d="${CODEX_PATH}"/></svg>`;

// The Open Source Initiative keyhole, outer contour only (no ® mark): the centre is open.
const OSI_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M11.959.447A11.938 11.938 0 000 12.407c0 5.576 3.874 10.097 7.783 11.114.193.05.392-.05.467-.234l2.771-6.822a.396.396 0 00-.246-.528C9.365 15.47 8.53 14.32 8.48 12.4c-.024-1.828 1.5-3.45 3.561-3.447 1.931.003 3.479 1.632 3.479 3.453 0 .966-.203 1.687-.575 2.238-.371.552-.922.951-1.695 1.239a.396.396 0 00-.23.515l2.685 6.903a.396.396 0 00.465.24C20.163 22.534 24 18.062 24 12.406 24 5.804 18.603.447 11.959.447z"/></svg>`;

/**
 * Extrudes an SVG mark into a flat solid lying on the desk, about `size`
 * world units wide. SVG y points down the screen, which maps to +z here.
 */
function useLogoGeometry(
  svg: string,
  size: number,
  thickness: number,
  gradient?: [string, string]
) {
  const geometry = useMemo(() => {
    const data = new SVGLoader().parse(svg);
    const shapes = data.paths.flatMap((path) => path.toShapes());
    const scale = size / 24;
    const geometry = new ExtrudeGeometry(shapes, {
      depth: thickness / scale,
      bevelEnabled: true,
      bevelThickness: 0.35,
      bevelSize: 0.22,
      bevelSegments: 2,
      curveSegments: 10,
    });
    geometry.center();
    geometry.rotateX(Math.PI / 2);
    geometry.scale(scale, scale, scale);
    geometry.computeVertexNormals();

    if (gradient) {
      const top = new Color(gradient[0]);
      const bottom = new Color(gradient[1]);
      const positions = geometry.getAttribute('position');
      const colors = new Float32Array(positions.count * 3);
      const color = new Color();
      for (let i = 0; i < positions.count; i += 1) {
        const t = Math.min(1, Math.max(0, positions.getZ(i) / size + 0.5));
        color.copy(top).lerp(bottom, t);
        colors.set([color.r, color.g, color.b], i * 3);
      }
      geometry.setAttribute('color', new BufferAttribute(colors, 3));
    }
    return geometry;
  }, [svg, size, thickness, gradient]);
  useResourceDisposal(geometry);
  return geometry;
}

/**
 * Collider for a flat mark: an octagonal slab inside its outline. A hull of
 * every bevel vertex gives stacked marks a contact patch that flickers, so
 * they shake instead of settling; two flat faces rest calmly.
 */
function useSlabHull(geometry: BufferGeometry, inset = 0.86) {
  return useMemo(() => {
    const box = new Box3().setFromBufferAttribute(
      geometry.getAttribute('position') as BufferAttribute
    );
    const center = box.getCenter(new Vector3());
    const rx = ((box.max.x - box.min.x) / 2) * inset;
    const rz = ((box.max.z - box.min.z) / 2) * inset;
    const points: number[] = [];
    for (let i = 0; i < 8; i += 1) {
      const angle = ((i + 0.5) / 8) * Math.PI * 2;
      const x = center.x + Math.cos(angle) * rx;
      const z = center.z + Math.sin(angle) * rz;
      points.push(x, box.min.y, z, x, box.max.y, z);
    }
    return new Float32Array(points);
  }, [geometry, inset]);
}

const CODEX_GRADIENT: [string, string] = ['#b1a7ff', '#3941ff'];

export function KeycapMesh({ item }: { item: KeycapItem }) {
  const width = 0.7;
  const height = 0.42;
  const texture = useLabelTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = '#26262b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const big = item.label.length === 1;
      ctx.font = `600 ${big ? 132 : 84}px ${big ? sansFamily : monoFamily}`;
      ctx.fillText(item.label, w / 2, h / 2 + 6);
    },
    item.label
  );

  return (
    <>
      {/* An explicit collider survives the hidden shader warm-up before this key arrives. */}
      <CuboidCollider args={[width / 2, height / 2, width / 2]} />
      <RoundedBox
        args={[width, height, width]}
        radius={0.11}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#e9e7e2" roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, height / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width - 0.16, width - 0.16]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
    </>
  );
}

/** The agents' dock: a ticket that lands on it, or just beside it, ships. */
export const AGENT_DOCK_RADIUS = 0.98;
const DOCK_HEIGHT = 0.16;
/** The dock's underside, in the body's own space. */
const DOCK_BASE = -0.32;
const MARK_THICKNESS = 0.16;
/** Claude's orange and Codex's violet, meeting round the dock's rim. */
const CLAUDE_ORANGE = new Color('#e8875f');
const CODEX_VIOLET = new Color('#7d6bff');
/** One turn round each other, unhurried. */
const ORBIT_SECONDS = 16;
/** The marks lean back towards the camera, so their faces read from above. */
const MARK_TILT = 0.6;
/** Each mark's own collider, a slab a little inside its outline, so they bump things one by one. */
const CLAUDE_SLAB: [number, number, number] = [0.4, 0.1, 0.4];
const CODEX_SLAB: [number, number, number] = [0.36, 0.1, 0.36];
/** Things in among the marks slide outwards at this speed, picking it up at this rate per frame. */
const SWEEP_SPEED = 1.2;
const SWEEP_GRIP = 0.2;

/** A low puck with rounded edges, its underside on y = 0. */
function useDockGeometry(radius: number, height: number) {
  const geometry = useMemo(() => {
    const bevel = 0.045;
    const points: Vector2[] = [new Vector2(0, 0), new Vector2(radius - bevel, 0)];
    for (let i = 0; i <= 6; i += 1) {
      const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2);
      points.push(new Vector2(radius - bevel + Math.cos(a) * bevel, bevel + Math.sin(a) * bevel));
    }
    for (let i = 0; i <= 6; i += 1) {
      const a = (i / 6) * (Math.PI / 2);
      points.push(
        new Vector2(radius - bevel + Math.cos(a) * bevel, height - bevel + Math.sin(a) * bevel)
      );
    }
    points.push(new Vector2(0, height));
    return new LatheGeometry(points, 72);
  }, [radius, height]);
  useResourceDisposal(geometry);
  return geometry;
}

/** A thin ring lying flat, shading from Claude's orange on one side to Codex's violet on the other. */
function useBlendRingGeometry(radius: number, tube: number) {
  const geometry = useMemo(() => {
    const geometry = new TorusGeometry(radius, tube, 8, 160);
    geometry.rotateX(Math.PI / 2);
    const positions = geometry.getAttribute('position');
    const colors = new Float32Array(positions.count * 3);
    const color = new Color();
    for (let i = 0; i < positions.count; i += 1) {
      const angle = Math.atan2(positions.getZ(i), positions.getX(i));
      color.copy(CLAUDE_ORANGE).lerp(CODEX_VIOLET, 0.5 + 0.5 * Math.cos(angle));
      colors.set([color.r, color.g, color.b], i * 3);
    }
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    return geometry;
  }, [radius, tube]);
  useResourceDisposal(geometry);
  return geometry;
}

/** Soft light pooled on the dock under the marks, in both their colours. */
function useDockGlowTexture() {
  return useLabelTexture(
    256,
    256,
    (ctx, w, h) => {
      const glow = (x: number, color: string) => {
        const gradient = ctx.createRadialGradient(x, h / 2, 0, x, h / 2, w * 0.42);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgb(0 0 0 / 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      };
      ctx.globalCompositeOperation = 'lighter';
      glow(w * 0.36, 'rgb(232 135 95 / 0.55)');
      glow(w * 0.64, 'rgb(125 107 255 / 0.55)');
    },
    'dock-glow'
  );
}

/**
 * The agents: Claude and Codex hovering over one dock, circling each other
 * as one team, since I use both together. A ticket dropped on the dock ships,
 * and the two spin up for a moment when it does.
 */
export function AgentMesh({ shippedAt }: { shippedAt?: RefObject<number> }) {
  const claude = useLogoGeometry(CLAUDE_SVG, 0.98, MARK_THICKNESS);
  const codex = useLogoGeometry(CODEX_SVG, 0.86, MARK_THICKNESS, CODEX_GRADIENT);
  const dock = useDockGeometry(AGENT_DOCK_RADIUS, DOCK_HEIGHT);
  const rim = useBlendRingGeometry(AGENT_DOCK_RADIUS - 0.09, 0.02);
  const orbitRing = useBlendRingGeometry(0.46, 0.008);
  const glow = useDockGlowTexture();
  const claudeRef = useRef<Group>(null);
  const codexRef = useRef<Group>(null);
  const rimRef = useRef<Mesh>(null);
  const glowRef = useRef<MeshBasicMaterial>(null);
  const kit = usePhysicsKit();
  // Side by side to start with, the way they first land.
  const orbit = useRef(0.2);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const since = (performance.now() - (shippedAt?.current ?? -Infinity)) / 1000;
    const flare = since >= 0 ? Math.exp(-since * 1.6) : 0;
    orbit.current += Math.min(delta, 0.1) * ((Math.PI * 2) / ORBIT_SECONDS) * (1 + 7 * flare);
    const a = orbit.current;
    [claudeRef.current, codexRef.current].forEach((mark, i) => {
      if (!mark) {
        return;
      }
      // Opposite each other on a flattened circle, so neither ever hides the other for long.
      const side = i === 0 ? 1 : -1;
      const x = side * Math.cos(a) * 0.5;
      const z = side * Math.sin(a) * 0.3;
      mark.position.set(x, DOCK_BASE + DOCK_HEIGHT + 0.36 + Math.sin(t * 1.7 + i * 2.1) * 0.035, z);
      // Each turns a little towards the other and leans in: turned first, so the mark stays upright.
      mark.rotation.set(MARK_TILT, -x * 0.5, x * 0.25, 'YXZ');
    });
    if (rimRef.current) {
      rimRef.current.rotation.y = -a * 0.5;
    }
    if (glowRef.current) {
      glowRef.current.opacity = 0.55 + 0.12 * Math.sin(t * 1.3) + 0.4 * flare;
    }
    // Ahead of the frame's other work (a negative priority never takes over drawing): the
    // slabs (AgentReach) then follow the marks where they are this frame, not where they were.
  }, -1);

  const top = DOCK_BASE + DOCK_HEIGHT;
  return (
    <>
      {/* A plain cylinder for the dock, and one slab per mark that follows it round (AgentReach) */}
      <CylinderCollider
        args={[DOCK_HEIGHT / 2, AGENT_DOCK_RADIUS]}
        position={[0, DOCK_BASE + DOCK_HEIGHT / 2, 0]}
      />
      {kit && <AgentReach kit={kit} marks={[claudeRef, codexRef]} />}
      <mesh geometry={dock} position={[0, DOCK_BASE, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#2a2b33" roughness={0.32} metalness={0.45} />
      </mesh>
      <mesh ref={rimRef} geometry={rim} position={[0, top + 0.004, 0]}>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </mesh>
      <mesh geometry={orbitRing} position={[0, top + 0.003, 0]} scale={[1.08, 1, 0.66]}>
        <meshBasicMaterial vertexColors transparent opacity={0.45} toneMapped={false} />
      </mesh>
      <mesh position={[0, top + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[AGENT_DOCK_RADIUS - 0.12, 48]} />
        <meshBasicMaterial
          ref={glowRef}
          map={glow}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <group ref={claudeRef}>
        <mesh geometry={claude} castShadow>
          <meshStandardMaterial color="#d97757" roughness={0.4} />
        </mesh>
      </group>
      <group ref={codexRef}>
        <mesh geometry={codex} castShadow>
          <meshStandardMaterial vertexColors roughness={0.32} metalness={0.05} />
        </mesh>
      </group>
    </>
  );
}

/**
 * On the desk, a slab for each mark that follows it round, nearly weightless,
 * so moving them never shifts the dock's balance; slippery, so whatever lands
 * on them slides off and is swept away instead of riding round. They follow
 * the marks only while something could meet them: while the dock moves, or
 * something is in among the marks. Moving them wakes the dock, and a dock
 * that never sleeps keeps the whole scene drawing.
 */
function AgentReach({ kit, marks }: { kit: PhysicsKit; marks: Array<RefObject<Group | null>> }) {
  const colliders = [useRef<RapierCollider>(null), useRef<RapierCollider>(null)];
  const { world, rapier } = kit.useRapier();
  const reach = useMemo(
    () => ({
      // Where the marks fly, a little inside the dock's rim and above its top.
      zone: new rapier.Cylinder(0.36, 0.95),
      centre: new Vector3(),
      turn: new Quaternion(),
      pose: new Quaternion(),
    }),
    [rapier]
  );
  useFrame(() => {
    const body = colliders[0].current?.parent();
    if (!body) {
      return;
    }
    const r = body.rotation();
    reach.turn.set(r.x, r.y, r.z, r.w);
    const at = body.translation();
    reach.centre
      .set(0, DOCK_BASE + DOCK_HEIGHT + 0.36, 0)
      .applyQuaternion(reach.turn)
      .add(at);
    const { x: vx, y: vy, z: vz } = body.linvel();
    const { x: wx, y: wy, z: wz } = body.angvel();
    let live = !body.isSleeping() && Math.hypot(vx, vy, vz, wx, wy, wz) > 0.05;
    // Whatever is in among them is swept gently off the dock, so it clears and can sleep again.
    world.intersectionsWithShape(
      reach.centre,
      r,
      reach.zone,
      (collider) => {
        live = true;
        const other = collider.parent();
        if (other?.isDynamic()) {
          const p = other.translation();
          const v = other.linvel();
          const away = Math.atan2(p.z - at.z, p.x - at.x);
          other.setLinvel(
            {
              x: v.x + (Math.cos(away) * SWEEP_SPEED - v.x) * SWEEP_GRIP,
              y: v.y,
              z: v.z + (Math.sin(away) * SWEEP_SPEED - v.z) * SWEEP_GRIP,
            },
            true
          );
        }
        return true;
      },
      rapier.QueryFilterFlags.EXCLUDE_FIXED,
      undefined,
      undefined,
      body
    );
    if (!live) {
      return;
    }
    if (body.isSleeping()) {
      body.wakeUp();
    }
    colliders.forEach((collider, i) => {
      const mark = marks[i].current;
      if (mark && collider.current) {
        collider.current.setTranslationWrtParent(mark.position);
        collider.current.setRotationWrtParent(reach.pose.setFromEuler(mark.rotation));
      }
    });
  });
  return (
    <>
      {[CLAUDE_SLAB, CODEX_SLAB].map((slab, i) => (
        <kit.CuboidCollider
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          ref={colliders[i]}
          args={slab}
          density={0.01}
          friction={0}
          frictionCombineRule={FRICTION_MIN}
        />
      ))}
    </>
  );
}

function OpenSourceMark() {
  const geometry = useLogoGeometry(OSI_SVG, 1.45, 0.26);
  const hull = useSlabHull(geometry);
  return (
    <>
      <ConvexHullCollider args={[hull]} />
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#3da639" roughness={0.45} />
      </mesh>
    </>
  );
}

const PCB = '#1d7a43';
const METAL = '#c3c6cc';

/** Silkscreen and the GPIO pins, drawn once onto the top of the board. */
function useBoardTexture() {
  return useLabelTexture(
    620,
    408,
    (ctx, w, h) => {
      ctx.fillStyle = PCB;
      ctx.fillRect(0, 0, w, h);
      // Traces
      ctx.strokeStyle = 'rgb(255 255 255 / 0.07)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 9; i += 1) {
        ctx.beginPath();
        ctx.moveTo(40 + i * 22, h - 30);
        ctx.lineTo(40 + i * 22, h - 90 - i * 6);
        ctx.lineTo(150 + i * 22, h - 150 - i * 6);
        ctx.stroke();
      }
      // A little raspberry and the name, in silkscreen white
      ctx.fillStyle = '#f2f2ee';
      const cx = 92;
      const cy = 150;
      ctx.beginPath();
      ctx.ellipse(cx - 14, cy - 34, 16, 8, -0.6, 0, Math.PI * 2);
      ctx.ellipse(cx + 14, cy - 34, 16, 8, 0.6, 0, Math.PI * 2);
      ctx.fill();
      [
        [0, -14],
        [-14, -2],
        [14, -2],
        [-7, 12],
        [7, 12],
        [0, 25],
      ].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(cx + x, cy + y, 8.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.font = `600 26px ${sansFamily}`;
      ctx.textBaseline = 'middle';
      ctx.fillText('Raspberry Pi', 128, 146);
      ctx.font = `500 18px ${monoFamily}`;
      ctx.fillStyle = 'rgb(242 242 238 / 0.7)';
      ctx.fillText('homelab · always on', 130, 176);
      // Mounting holes
      ctx.fillStyle = '#c9a54a';
      [
        [26, 26],
        [w - 150, 26],
        [26, h - 26],
        [w - 150, h - 26],
      ].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0d0d0f';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c9a54a';
      });
    },
    'pi-board'
  );
}

function useHeaderTexture() {
  return useLabelTexture(
    512,
    52,
    (ctx, w, h) => {
      ctx.fillStyle = '#121214';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#d9b45a';
      for (let i = 0; i < 20; i += 1) {
        for (let row = 0; row < 2; row += 1) {
          ctx.fillRect(8 + i * 25.2, 9 + row * 22, 10, 10);
        }
      }
    },
    'pi-header'
  );
}

/** The homelab: a Raspberry Pi board, ports and all. */
function RaspberryPi() {
  const board = useBoardTexture();
  const header = useHeaderTexture();
  const [w, d] = [1.55, 1.02];
  const top = 0.025;

  return (
    <group position={[0, -0.1, 0]}>
      <CuboidCollider args={[w / 2 + 0.04, 0.16, d / 2]} position={[0.02, 0.13, 0]} />
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, 0.05, d]} />
        <meshStandardMaterial color={PCB} roughness={0.6} />
      </mesh>
      <mesh position={[0, top + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial map={board} roughness={0.6} />
      </mesh>
      {/* GPIO header along the back edge */}
      <mesh position={[-0.12, top + 0.04, -0.43]} castShadow>
        <boxGeometry args={[1.02, 0.08, 0.1]} />
        <meshStandardMaterial color="#121214" roughness={0.5} />
      </mesh>
      <mesh position={[-0.12, top + 0.081, -0.43]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.02, 0.1]} />
        <meshStandardMaterial map={header} roughness={0.35} metalness={0.4} />
      </mesh>
      {/* SoC under its metal lid, and the RAM */}
      <mesh position={[-0.02, top + 0.025, -0.02]} castShadow>
        <boxGeometry args={[0.3, 0.05, 0.3]} />
        <meshStandardMaterial color={METAL} roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0.3, top + 0.018, 0.04]} castShadow>
        <boxGeometry args={[0.2, 0.035, 0.24]} />
        <meshStandardMaterial color="#141416" roughness={0.45} />
      </mesh>
      {/* Two USB stacks and Ethernet on the short edge */}
      {[-0.27, 0.07].map((z) => (
        <group key={z} position={[0.63, top + 0.15, z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.36, 0.3, 0.27]} />
            <meshStandardMaterial color={METAL} roughness={0.35} metalness={0.75} />
          </mesh>
          {[0.07, -0.07].map((y) => (
            <mesh key={y} position={[0.181, y, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[0.2, 0.06]} />
              <meshStandardMaterial color={z < 0 ? '#2b6fe0' : '#111114'} roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0.62, top + 0.13, 0.36]} castShadow receiveShadow>
        <boxGeometry args={[0.38, 0.26, 0.28]} />
        <meshStandardMaterial color={METAL} roughness={0.35} metalness={0.75} />
      </mesh>
      <mesh position={[0.811, top + 0.11, 0.36]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.18, 0.13]} />
        <meshStandardMaterial color="#111114" roughness={0.5} />
      </mesh>
      {/* USB-C power and micro-HDMI on the front edge */}
      {[-0.55, -0.3, -0.12].map((x, i) => (
        <mesh key={x} position={[x, top + 0.03, d / 2 - 0.04]} castShadow>
          <boxGeometry args={[i === 0 ? 0.13 : 0.1, 0.05, 0.1]} />
          <meshStandardMaterial color={METAL} roughness={0.35} metalness={0.75} />
        </mesh>
      ))}
      {/* Status LEDs */}
      <mesh position={[-0.68, top + 0.012, 0.22]}>
        <boxGeometry args={[0.04, 0.02, 0.025]} />
        <meshBasicMaterial color="#5cff8f" toneMapped={false} />
      </mesh>
      <mesh position={[-0.68, top + 0.012, 0.28]}>
        <boxGeometry args={[0.04, 0.02, 0.025]} />
        <meshBasicMaterial color="#ff4d4d" toneMapped={false} />
      </mesh>
    </group>
  );
}

const RAIL = '#9a9da6';
const DECK = '#24252b';
const DESK_TOP = '#c9a47c';
const DESK_FRAME = '#2a2b31';

/**
 * The walking pad's belt, in the treadmill body's own space: its top runs
 * towards +z at `speed`, and whatever rests on it rides along and drops off
 * the end.
 */
export const BELT = {
  speed: 0.75,
  halfWidth: 0.43,
  zMin: -0.55,
  zMax: 1.05,
  /** The pad's top, where things rest. */
  top: -0.3,
};
/** The belt's visible length; the texture repeats twice along it. */
const BELT_LENGTH = 1.52;

/** Ribs across a lighter belt, so the motion reads from afar. */
function useBeltTexture() {
  const belt = useLabelTexture(
    128,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = '#444852';
      ctx.fillRect(0, 0, w, h);
      // A whole number of ribs, so the texture tiles seamlessly as it scrolls.
      for (let y = 0; y < h; y += 64) {
        ctx.fillStyle = '#8d929e';
        ctx.fillRect(0, y, w, 14);
        ctx.fillStyle = '#30333b';
        ctx.fillRect(0, y + 14, w, 6);
      }
    },
    'belt'
  );
  useEffect(() => {
    belt.wrapT = RepeatWrapping;
    belt.repeat.y = 2;
    belt.needsUpdate = true;
  }, [belt]);
  return belt;
}

function useKeyboardTexture() {
  return useLabelTexture(
    256,
    84,
    (ctx, w, h) => {
      ctx.fillStyle = '#d9d7d1';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f6f5f1';
      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 14; col += 1) {
          ctx.fillRect(6 + col * 17.6 + (row % 2) * 6, 6 + row * 19, 14, 15);
        }
      }
      // Space bar row
      ctx.fillRect(6, h - 21, 40, 15);
      ctx.fillRect(52, h - 21, 140, 15);
      ctx.fillRect(198, h - 21, 52, 15);
    },
    'desk-keyboard'
  );
}

/**
 * Walk and talk: a walking pad under a standing desk, the belt rolling as if someone
 * were walking towards the screen. One body: the pad is heavy and the desk
 * light, so the whole thing sits low and does not tip over.
 */
function Treadmill() {
  const belt = useBeltTexture();
  const screen = useDeskScreen();
  const keyboard = useKeyboardTexture();
  // The top of the belt runs from the desk towards the back of the pad, as fast as it carries things.
  useFrame(({ clock }) => {
    belt.offset.y = (clock.elapsedTime * ((BELT.speed * 2) / BELT_LENGTH)) % 1;
  });

  const readout = useLabelTexture(
    256,
    96,
    (ctx, w, h) => {
      ctx.fillStyle = '#0d0e10';
      roundRect(ctx, 0, 0, w, h, 18);
      ctx.fill();
      ctx.fillStyle = ACCENT;
      ctx.font = `600 44px ${monoFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('4.5', w / 2 - 24, h / 2 + 2);
      ctx.fillStyle = '#7d7f88';
      ctx.font = `500 24px ${monoFamily}`;
      ctx.fillText('km/h', w / 2 + 62, h / 2 + 6);
    },
    'treadmill-console'
  );

  const deskZ = -0.67;
  const deskTop = 1.28;
  return (
    <group position={[0, -0.45, 0]}>
      {/* Walking pad: slippery, so the belt (in the scene's physics step) does the carrying */}
      <CuboidCollider
        args={[0.43, 0.075, 0.9]}
        position={[0, 0.075, 0.15]}
        friction={0}
        frictionCombineRule={FRICTION_MIN}
      />
      <RoundedBox
        args={[0.86, 0.13, 1.8]}
        radius={0.05}
        smoothness={3}
        position={[0, 0.065, 0.15]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={DECK} roughness={0.5} metalness={0.15} />
      </RoundedBox>
      <mesh position={[0, 0.133, 0.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.64, BELT_LENGTH]} />
        <meshStandardMaterial map={belt} roughness={0.9} />
      </mesh>
      {[-0.37, 0.37].map((x) => (
        <mesh key={x} position={[x, 0.142, 0.2]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.025, 1.56]} />
          <meshStandardMaterial color={RAIL} roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
      {/* Motor hood and its speed readout, at the front under the desk */}
      <RoundedBox
        args={[0.86, 0.07, 0.2]}
        radius={0.03}
        smoothness={2}
        position={[0, 0.15, -0.65]}
        castShadow
      >
        <meshStandardMaterial color="#1a1b20" roughness={0.45} />
      </RoundedBox>
      <mesh position={[0, 0.186, -0.65]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.36, 0.135]} />
        <meshBasicMaterial map={readout} transparent toneMapped={false} />
      </mesh>

      {/* Standing desk: feet, telescopic legs, a crossbar and the top. Light, so it never tips the pad. */}
      {[-0.72, 0.72].map((x) => (
        <group key={x} position={[x, 0, deskZ]}>
          <CuboidCollider args={[0.05, 0.03, 0.33]} position={[0, 0.03, 0]} density={0.5} />
          <CuboidCollider args={[0.045, 0.6, 0.045]} position={[0, 0.65, 0]} density={0.1} />
          <RoundedBox
            args={[0.1, 0.05, 0.66]}
            radius={0.02}
            smoothness={2}
            position={[0, 0.025, 0]}
            castShadow
          >
            <meshStandardMaterial color={DESK_FRAME} roughness={0.5} />
          </RoundedBox>
          <mesh position={[0, 0.36, 0]} castShadow>
            <boxGeometry args={[0.09, 0.62, 0.09]} />
            <meshStandardMaterial color={DESK_FRAME} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.95, 0]} castShadow>
            <boxGeometry args={[0.07, 0.6, 0.07]} />
            <meshStandardMaterial color="#3b3c44" roughness={0.4} metalness={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, deskTop - 0.08, deskZ]} castShadow>
        <boxGeometry args={[1.38, 0.05, 0.05]} />
        <meshStandardMaterial color={DESK_FRAME} roughness={0.5} />
      </mesh>
      <CuboidCollider
        args={[0.78, 0.03, 0.31]}
        position={[0, deskTop - 0.025, deskZ]}
        density={0.1}
      />
      <RoundedBox
        args={[1.56, 0.05, 0.62]}
        radius={0.02}
        smoothness={2}
        position={[0, deskTop - 0.025, deskZ]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={DESK_TOP} roughness={0.6} />
      </RoundedBox>

      {/* Monitor, tilted back a little towards whoever walks */}
      <mesh position={[0, deskTop + 0.01, deskZ - 0.17]} castShadow>
        <boxGeometry args={[0.26, 0.02, 0.16]} />
        <meshStandardMaterial color={DESK_FRAME} roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, deskTop + 0.13, deskZ - 0.21]} castShadow>
        <boxGeometry args={[0.06, 0.24, 0.03]} />
        <meshStandardMaterial color={DESK_FRAME} roughness={0.4} metalness={0.4} />
      </mesh>
      <group position={[0, deskTop + 0.36, deskZ - 0.19]} rotation={[-0.12, 0, 0]}>
        <CuboidCollider args={[0.48, 0.29, 0.03]} density={0.1} />
        <RoundedBox args={[0.96, 0.57, 0.04]} radius={0.015} smoothness={2} castShadow>
          <meshStandardMaterial color="#16171b" roughness={0.35} />
        </RoundedBox>
        <mesh position={[0, 0.01, 0.021]}>
          <planeGeometry args={[0.9, 0.506]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
      </group>
      {/* Keyboard and mouse */}
      <mesh position={[-0.06, deskTop + 0.012, deskZ + 0.13]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.024, 0.2]} />
        <meshStandardMaterial color="#cfcdc7" roughness={0.6} />
      </mesh>
      <mesh position={[-0.06, deskTop + 0.025, deskZ + 0.13]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.58, 0.19]} />
        <meshStandardMaterial map={keyboard} roughness={0.6} />
      </mesh>
      <RoundedBox
        args={[0.08, 0.03, 0.12]}
        radius={0.014}
        smoothness={2}
        position={[0.36, deskTop + 0.015, deskZ + 0.14]}
        castShadow
      >
        <meshStandardMaterial color="#cfcdc7" roughness={0.5} />
      </RoundedBox>
    </group>
  );
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

const ROCK_LOW = new Color('#3a4350');
const ROCK_HIGH = new Color('#646d7a');

/** A repeatable pseudo-random value in [0, 1) for a lattice point. */
function hash3(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Smooth value noise in [-1, 1], with a second, finer octave. */
function noise3(x: number, y: number, z: number) {
  const octave = (px: number, py: number, pz: number) => {
    const ix = Math.floor(px);
    const iy = Math.floor(py);
    const iz = Math.floor(pz);
    const fx = px - ix;
    const fy = py - iy;
    const fz = pz - iz;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const uz = fz * fz * (3 - 2 * fz);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const corner = (dx: number, dy: number, dz: number) => hash3(ix + dx, iy + dy, iz + dz);
    return lerp(
      lerp(
        lerp(corner(0, 0, 0), corner(1, 0, 0), ux),
        lerp(corner(0, 1, 0), corner(1, 1, 0), ux),
        uy
      ),
      lerp(
        lerp(corner(0, 0, 1), corner(1, 0, 1), ux),
        lerp(corner(0, 1, 1), corner(1, 1, 1), ux),
        uy
      ),
      uz
    );
  };
  return (octave(x, y, z) * 0.7 + octave(x * 2.3, y * 2.3, z * 2.3) * 0.3) * 2 - 1;
}

/**
 * A smooth, ridged peak: a dense cone pushed in and out along ridgelines, in
 * rock shaded from dark to light. The snow is drawn per pixel by the material
 * (see useMountainMaterial), so its edge stays soft and irregular instead of
 * following the triangles.
 */
/**
 * Built once a page for each peak and shared: the desk, the tray and the
 * phone's shelf all show the same mountain, and building one takes a while.
 */
const mountains = new Map<string, BufferGeometry>();

function useMountainGeometry(radius: number, height: number, seed: number): BufferGeometry {
  return useMemo(() => {
    const key = `${radius} ${height} ${seed}`;
    const built = mountains.get(key) ?? buildMountain(radius, height, seed);
    mountains.set(key, built);
    return built;
  }, [radius, height, seed]);
}

function buildMountain(radius: number, height: number, seed: number): BufferGeometry {
  const source = new ConeGeometry(radius, height, 96, 36);
  source.deleteAttribute('normal');
  source.deleteAttribute('uv');
  const geometry = mergeVertices(source);
  // Merging copies the buffers, so the temporary cone is no longer needed.
  source.dispose();
  const positions = geometry.getAttribute('position');
  // Per vertex: height up the peak (0 to 1), how deep in a gully, and the peak's seed.
  const snowData = new Float32Array(positions.count * 3);

  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const t = (y + height / 2) / height;
    const angle = Math.atan2(z, x);
    const slope = Math.sin(Math.PI * Math.min(1, t * 1.15));
    const ridges = 1 - Math.abs(Math.sin(angle * 2.5 + seed + t * 1.8));
    const detail =
      0.09 * Math.sin(angle * 3 + seed) +
      0.06 * Math.sin(angle * 5 - seed * 1.7 + t * 3) +
      0.035 * Math.sin(angle * 11 + seed * 0.6 + t * 7) +
      0.02 * Math.sin(angle * 23 + t * 11);
    const scale = 1 + (detail + 0.14 * ridges - 0.07) * (0.6 + 0.4 * slope);
    // Lean the summit a little so it is not a perfect cone.
    const lean = t * t * 0.12 * radius;
    positions.setXYZ(
      i,
      x * scale + lean,
      y + 0.04 * height * Math.sin(angle * 4 + seed + t * 5) * slope,
      z * scale - lean * 0.4
    );
    snowData.set([t, 1 - ridges, seed], i * 3);
  }
  geometry.computeVertexNormals();

  const colors = new Float32Array(positions.count * 3);
  const color = new Color();
  for (let i = 0; i < positions.count; i += 1) {
    const t = snowData[i * 3];
    const gully = snowData[i * 3 + 1];
    const grain = noise3(
      positions.getX(i) * 5 + seed * 10,
      positions.getY(i) * 5,
      positions.getZ(i) * 5
    );
    color.copy(ROCK_LOW).lerp(ROCK_HIGH, smoothstep(0, 0.6, t) * (0.6 + 0.4 * (1 - gully)));
    color.multiplyScalar(0.88 + 0.12 * grain);
    colors.set([color.r, color.g, color.b], i * 3);
  }
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  geometry.setAttribute('snowData', new BufferAttribute(snowData, 3));
  return geometry;
}

// The summit leans a little and the base is ridged; a few points are enough to rest on.
const MOUNTAIN_HULL = (() => {
  const points: number[] = [];
  const ring = (cx: number, cz: number, radius: number, y: number) => {
    for (let i = 0; i < 8; i += 1) {
      const angle = (i / 8) * Math.PI * 2;
      points.push(cx + Math.cos(angle) * radius, y, cz + Math.sin(angle) * radius);
    }
  };
  ring(0, 0, 0.84, -0.675);
  ring(0.52, 0.24, 0.5, -0.67);
  points.push(0.1, 0.575, -0.04, 0.58, 0.05, 0.22);
  return new Float32Array(points);
})();

const SNOW_GLSL = /* glsl */ `
varying vec3 vSnowData;
varying vec3 vSnowPos;
varying vec3 vSnowNormal;
float snowHash(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}
float snowNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(snowHash(i), snowHash(i + vec3(1, 0, 0)), u.x),
        mix(snowHash(i + vec3(0, 1, 0)), snowHash(i + vec3(1, 1, 0)), u.x), u.y),
    mix(mix(snowHash(i + vec3(0, 0, 1)), snowHash(i + vec3(1, 0, 1)), u.x),
        mix(snowHash(i + vec3(0, 1, 1)), snowHash(i + vec3(1, 1, 1)), u.x), u.y),
    u.z) * 2.0 - 1.0;
}
float snowFbm(vec3 p) {
  return snowNoise(p) * 0.55 + snowNoise(p * 2.1) * 0.28 + snowNoise(p * 4.3) * 0.17;
}
`;

/**
 * Rock from the vertex colours, snow drawn per pixel on top: it settles lower
 * on gentle slopes and down the gullies, leaves steep faces and ridges bare,
 * and fades out in a soft, wind-blown edge. A faint cool glow keeps snow in
 * shade a pale blue instead of going as grey as the rock round it.
 */
function useMountainMaterial() {
  const material = useMemo(() => {
    const result = new MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
    result.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          '#include <common>\nattribute vec3 snowData;\nvarying vec3 vSnowData;\nvarying vec3 vSnowPos;\nvarying vec3 vSnowNormal;'
        )
        .replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\nvSnowData = snowData;\nvSnowPos = position;\nvSnowNormal = objectNormal;'
        );
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\n${SNOW_GLSL}`)
        .replace(
          '#include <color_fragment>',
          /* glsl */ `#include <color_fragment>
          vec3 snowP = vSnowPos * 5.0 + vSnowData.z * 7.0;
          float grain = snowFbm(snowP);
          float fine = snowFbm(snowP * 3.5);
          // 0 on the steepest faces, 1 where it is nearly flat.
          float gentle = smoothstep(0.38, 0.8, normalize(vSnowNormal).y);
          float gully = vSnowData.y;
          float snowLine = 0.6 + 0.09 * grain + 0.025 * fine + 0.08 * (0.5 - gentle) - 0.12 * gully * gully;
          float snowCover = max(
            smoothstep(snowLine - 0.012, snowLine + 0.03, vSnowData.x),
            smoothstep(0.9, 0.97, vSnowData.x)
          );
          // Thin snow over rock just below the line, like a dusting.
          snowCover = max(snowCover, 0.35 * smoothstep(snowLine - 0.09, snowLine - 0.02, vSnowData.x) * smoothstep(0.1, 0.5, fine) * gentle);
          vec3 snowColor = mix(vec3(0.93, 0.95, 0.97), vec3(0.78, 0.85, 0.93), clamp(0.35 * (1.0 - gentle) + 0.15 * fine + 0.25 * gully, 0.0, 1.0));
          diffuseColor.rgb = mix(diffuseColor.rgb, snowColor, snowCover);`
        )
        .replace(
          '#include <roughnessmap_fragment>',
          '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.6, snowCover);'
        )
        .replace(
          '#include <emissivemap_fragment>',
          '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(0.05, 0.07, 0.11) * snowCover;'
        );
    };
    return result;
  }, []);
  useResourceDisposal(material);
  return material;
}

function Mountain() {
  const main = useMountainGeometry(0.8, 1.25, 0.4);
  const shoulder = useMountainGeometry(0.5, 0.72, 2.1);
  const material = useMountainMaterial();
  return (
    <group position={[0, -0.05, 0]}>
      <ConvexHullCollider args={[MOUNTAIN_HULL]} position={[0, 0.05, 0]} />
      {/* The pole and the flag on the summit, light so they never make it top-heavy */}
      <CuboidCollider args={[0.03, 0.33, 0.03]} position={[0.09, 0.79, -0.04]} density={0.2} />
      <CuboidCollider args={[0.2, 0.2, 0.04]} position={[0.31, 0.85, -0.04]} density={0.2} />
      <mesh geometry={main} material={material} castShadow receiveShadow />
      <mesh
        geometry={shoulder}
        material={material}
        position={[0.52, -0.26, 0.24]}
        castShadow
        receiveShadow
      />
      {/* A Swiss flag planted on the summit */}
      <group position={[0.09, 0.52, -0.04]}>
        <FlagPole length={0.62} />
        <group position={[0.02, 0.58, 0]}>
          <WavingFlag draw={drawSwissFlag} name="flag-ch" width={0.4} height={0.4} />
        </group>
      </group>
    </group>
  );
}

type FlagDraw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

/** The Union Jack, from its 60 × 30 construction, stretched to the flag's shape. */
const drawUnionJack: FlagDraw = (ctx, w, h) => {
  ctx.save();
  ctx.scale(w / 60, h / 30);
  ctx.fillStyle = '#012169';
  ctx.fillRect(0, 0, 60, 30);
  const saltire = () => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(60, 30);
    ctx.moveTo(60, 0);
    ctx.lineTo(0, 30);
  };
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  saltire();
  ctx.stroke();
  // The red diagonals sit off-centre, each on its own side: drawn wider, then cut to one half.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(30, 15);
  ctx.lineTo(60, 15);
  ctx.lineTo(60, 30);
  ctx.closePath();
  ctx.moveTo(30, 15);
  ctx.lineTo(30, 30);
  ctx.lineTo(0, 30);
  ctx.closePath();
  ctx.moveTo(30, 15);
  ctx.lineTo(0, 15);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.moveTo(30, 15);
  ctx.lineTo(30, 0);
  ctx.lineTo(60, 0);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = '#c8102e';
  ctx.lineWidth = 4;
  saltire();
  ctx.stroke();
  ctx.restore();
  const cross = () => {
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(30, 30);
    ctx.moveTo(0, 15);
    ctx.lineTo(60, 15);
  };
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 10;
  cross();
  ctx.stroke();
  ctx.strokeStyle = '#c8102e';
  ctx.lineWidth = 6;
  cross();
  ctx.stroke();
  ctx.restore();
};

const drawTricolore: FlagDraw = (ctx, w, h) => {
  ['#0055a4', '#ffffff', '#ef4135'].forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect((i * w) / 3, 0, w / 3 + 1, h);
  });
};

const drawSwissFlag: FlagDraw = (ctx, w, h) => {
  ctx.save();
  ctx.scale(w / 32, h / 32);
  ctx.fillStyle = '#da291c';
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(13, 6, 6, 20);
  ctx.fillRect(6, 13, 20, 6);
  ctx.restore();
};

/**
 * Where a point of the flag's cloth is, in GLSL: the plane's point `p` (its
 * middle at the origin), `t` seconds in. Waves run from the pole to the free
 * end and grow as they go; where it ripples, the cloth bunches up a little so
 * it keeps its length.
 */
const FLAG_CLOTH = /* glsl */ `
  uniform float flagTime;
  uniform vec2 flagSize;
  vec3 flagAt(vec2 p) {
    float t = flagTime;
    // Gusts come and go: the flag stands out further and flaps harder, then eases.
    float gust = 0.75 + 0.25 * sin(t * 0.7) * sin(t * 0.31 + 1.0);
    // 0 at the pole, 1 at the free end; 0 along the top, 1 along the bottom.
    float along = p.x / flagSize.x + 0.5;
    float down = 0.5 - p.y / flagSize.y;
    float wave = along * sin(along * 7.5 - t * 6.5 + down * 1.4);
    float flutter = along * along * sin(along * 15.0 - t * 11.0 + down * 3.0);
    return vec3(
      along * flagSize.x * (1.0 - 0.05 * abs(wave)),
      p.y - flagSize.y / 2.0 - along * along * flagSize.y * 0.12 * (1.1 - gust),
      flagSize.x * gust * (0.09 * wave + 0.025 * flutter)
    );
  }
`;

/** Bends a material's plane into the flag's cloth, its light following. */
function clothShader(uniforms: Record<string, { value: unknown }>) {
  return (shader: { uniforms: Record<string, unknown>; vertexShader: string }) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('void main() {', `${FLAG_CLOTH}\nvoid main() {`)
      // The cloth's own slope, from two points beside this one.
      .replace(
        '#include <beginnormal_vertex>',
        `vec2 flagStep = flagSize / vec2(24.0, 8.0);
        vec3 flagHere = flagAt(position.xy);
        vec3 objectNormal = normalize(cross(
          flagAt(position.xy + vec2(flagStep.x, 0.0)) - flagHere,
          flagAt(position.xy + vec2(0.0, flagStep.y)) - flagHere
        ));
        #ifdef USE_TANGENT
        vec3 objectTangent = vec3( tangent.xyz );
        #endif`
      )
      .replace(
        '#include <begin_vertex>',
        'vec3 transformed = flagHere;\n#ifdef USE_ALPHAHASH\nvPosition = vec3( position );\n#endif'
      );
  };
}

/**
 * A flag hanging from a pole at x = 0 and flying out towards +x, its top edge
 * at y = 0, rippling in the wind. The cloth moves on the graphics chip: only
 * the time changes each frame, not a shape rebuilt and sent over again. It
 * casts no shadow, too small to miss: a shadow that waved with it would need
 * a shadow shader of its own, compiled on the frame it first came in.
 */
function WavingFlag({
  draw,
  name,
  width,
  height,
}: {
  draw: FlagDraw;
  name: string;
  width: number;
  height: number;
}) {
  const geometry = useMemo(() => new PlaneGeometry(width, height, 24, 8), [width, height]);
  const texture = useLabelTexture(Math.round(width * 400), Math.round(height * 400), draw, name);
  const { material, uniforms } = useMemo(() => {
    const shared = {
      flagTime: { value: 0 },
      flagSize: { value: new Vector2(width, height) },
    };
    const cloth = new MeshStandardMaterial({ map: texture, roughness: 0.8, side: DoubleSide });
    cloth.onBeforeCompile = clothShader(shared);
    cloth.customProgramCacheKey = () => 'flag-cloth';
    return { material: cloth, uniforms: shared };
  }, [texture, width, height]);
  useFrame(({ clock }) => {
    uniforms.flagTime.value = clock.elapsedTime;
  });

  useResourceDisposal(geometry);
  useResourceDisposal(material);

  return (
    <mesh
      geometry={geometry}
      material={material}
      // The cloth is moved where it is drawn, so its resting box says nothing of where it is.
      frustumCulled={false}
    />
  );
}

const POLE = '#c3c6cc';
const FINIAL = '#d6b25e';

/** A thin pole standing on y = 0, with a gold ball on top. */
function FlagPole({ length }: { length: number }) {
  return (
    <>
      <mesh position={[0, length / 2, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.022, length, 10]} />
        <meshStandardMaterial color={POLE} roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, length + 0.03, 0]} castShadow>
        <sphereGeometry args={[0.04, 14, 10]} />
        <meshStandardMaterial color={FINIAL} roughness={0.3} metalness={0.8} />
      </mesh>
    </>
  );
}

/** Each speech bubble's face, without its tail, and how thick it is. */
const BUBBLE: [number, number, number] = [0.7, 0.46, 0.09];
const BUBBLE_CORNER = 0.12;
/** How far the tail reaches below the bubble. */
const BUBBLE_TAIL = 0.15;
/** The white rim round the printed flag, as a share of the face's height. */
const BUBBLE_RIM = 0.075;
const HOLO = '#9fd8ff';
const FLAG_BLUE = new Color('#2f6bff');
const FLAG_RED = new Color('#ff4b55');
const EMITTER = '#1c1d23';
const EMITTER_LENS = '#0b0c11';

/** A speech bubble's outline on the x/y plane: a rounded box, its tail at the bottom on `tail`'s side. */
function bubbleShape(w: number, h: number, tail: 1 | -1) {
  const r = BUBBLE_CORNER;
  // The tail's base along the bottom edge, inner end then outer, and its tip, leaning outwards.
  const inner = tail * (w / 2 - 0.3);
  const outer = tail * (w / 2 - 0.13);
  const tip = tail * (w / 2 - 0.05);
  const shape = new Shape();
  shape.moveTo(-w / 2 + r, -h / 2);
  const [first, second] = tail < 0 ? [outer, inner] : [inner, outer];
  shape.lineTo(first, -h / 2);
  if (tail < 0) {
    shape.quadraticCurveTo(first - 0.01, -h / 2 - BUBBLE_TAIL * 0.5, tip, -h / 2 - BUBBLE_TAIL);
    shape.quadraticCurveTo(second - 0.04, -h / 2 - BUBBLE_TAIL * 0.35, second, -h / 2);
  } else {
    shape.quadraticCurveTo(first + 0.04, -h / 2 - BUBBLE_TAIL * 0.35, tip, -h / 2 - BUBBLE_TAIL);
    shape.quadraticCurveTo(second + 0.01, -h / 2 - BUBBLE_TAIL * 0.5, second, -h / 2);
  }
  shape.lineTo(w / 2 - r, -h / 2);
  shape.absarc(w / 2 - r, -h / 2 + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(w / 2, h / 2 - r);
  shape.absarc(w / 2 - r, h / 2 - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-w / 2 + r, h / 2);
  shape.absarc(-w / 2 + r, h / 2 - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-w / 2, -h / 2 + r);
  shape.absarc(-w / 2 + r, -h / 2 + r, r, Math.PI, (Math.PI * 3) / 2, false);
  return shape;
}

/**
 * A chunky speech bubble standing up, facing +z, centred on its face. The
 * face is mapped straight on, so the flag prints on the front and the sides
 * pick up the white rim round it.
 */
function useBubbleGeometry(tail: 1 | -1) {
  const geometry = useMemo(() => {
    const [w, h, depth] = BUBBLE;
    const bevel = 0.02;
    const geometry = new ExtrudeGeometry(bubbleShape(w, h, tail), {
      depth: depth - bevel * 2,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 12,
    });
    geometry.translate(0, 0, -depth / 2 + bevel);
    const positions = geometry.getAttribute('position');
    const uv = geometry.getAttribute('uv');
    for (let i = 0; i < positions.count; i += 1) {
      uv.setXY(i, positions.getX(i) / w + 0.5, positions.getY(i) / h + 0.5);
    }
    geometry.computeVertexNormals();
    return geometry;
  }, [tail]);
  useResourceDisposal(geometry);
  return geometry;
}

/** The flag inside a white rim, with the bubble's rounded corners. */
function useBubbleTexture(draw: FlagDraw, name: string) {
  const [w, h] = BUBBLE;
  return useLabelTexture(
    512,
    Math.round((512 * h) / w),
    (ctx, cw, ch) => {
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, cw, ch);
      const rim = ch * BUBBLE_RIM;
      ctx.save();
      roundRect(ctx, rim, rim, cw - rim * 2, ch - rim * 2, (BUBBLE_CORNER / h) * ch - rim);
      ctx.clip();
      ctx.translate(rim, rim);
      draw(ctx, cw - rim * 2, ch - rim * 2);
      ctx.restore();
    },
    `bubble-${name}`
  );
}

/**
 * A light sweeping over a face, `width` by `height` with rounded corners, and
 * faint scan lines on it: glass, or a hologram. `strength` scales it all.
 */
function useSweepMaterial(width: number, height: number, corner: number, every: number) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          strength: { value: 1 },
          size: { value: new Vector2(width, height) },
          corner: { value: corner },
          every: { value: every },
          color: { value: new Color(HOLO) },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float time;
          uniform float strength;
          uniform vec2 size;
          uniform float corner;
          uniform float every;
          uniform vec3 color;
          varying vec2 vUv;
          void main() {
            vec2 p = (vUv - 0.5) * size;
            vec2 q = abs(p) - size * 0.5 + corner;
            float inside = 1.0 - smoothstep(-0.004, 0.004, length(max(q, 0.0)) - corner);
            // A diagonal band crossing the face, then a rest before the next.
            float sweep = fract(time / every) * 2.2 - 0.6;
            float along = (vUv.x + vUv.y) * 0.5;
            float band = exp(-pow((along - sweep) / 0.07, 2.0));
            float lines = 0.5 + 0.5 * sin((vUv.y * size.y * 90.0) - time * 3.0);
            float alpha = (band * 0.55 + lines * 0.05) * inside * strength;
            if (alpha < 0.003) discard;
            gl_FragColor = vec4(color, alpha);
            #include <colorspace_fragment>
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        toneMapped: false,
      }),
    [width, height, corner, every]
  );
  useResourceDisposal(material);
  return material;
}

function SpeechBubble({
  draw,
  name,
  tail,
  glow,
  sweep,
}: {
  draw: FlagDraw;
  name: string;
  tail: 1 | -1;
  glow: RefObject<MeshStandardMaterial | null>;
  sweep: ShaderMaterial;
}) {
  const geometry = useBubbleGeometry(tail);
  const texture = useBubbleTexture(draw, name);
  const [w, h, depth] = BUBBLE;
  return (
    <>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial
          ref={glow}
          map={texture}
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={0.2}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 0, depth / 2 + 0.003]} material={sweep} raycast={() => null}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </>
  );
}

/** The emitter's puck, a rounded disc standing on y = 0. */
function useEmitterGeometry(radius: number, height: number) {
  const geometry = useMemo(() => {
    const r = radius;
    const profile = [
      new Vector2(0, 0),
      new Vector2(r * 0.9, 0),
      new Vector2(r * 0.98, height * 0.15),
      new Vector2(r, height * 0.5),
      new Vector2(r * 0.97, height * 0.85),
      new Vector2(r * 0.9, height),
      new Vector2(0, height),
    ];
    return new LatheGeometry(profile, 48);
  }, [radius, height]);
  useResourceDisposal(geometry);
  return geometry;
}

/** The light the emitter throws up, brightest at its foot, scan lines rising through it. */
function useBeamMaterial() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { time: { value: 0 }, color: { value: new Color(HOLO) } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float time;
          uniform vec3 color;
          varying vec2 vUv;
          void main() {
            float rise = pow(1.0 - vUv.y, 1.4);
            float lines = 0.6 + 0.4 * sin(vUv.y * 40.0 - time * 4.0);
            float alpha = rise * lines * 0.24;
            gl_FragColor = vec4(color, alpha);
            #include <colorspace_fragment>
          }
        `,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: AdditiveBlending,
        toneMapped: false,
      }),
    []
  );
  useResourceDisposal(material);
  return material;
}

/** A ring of light round the emitter's lens, in the two flags' blue, white and red, turning slowly. */
function useRingMaterial() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          blue: { value: FLAG_BLUE },
          red: { value: FLAG_RED },
        },
        vertexShader: /* glsl */ `
          varying vec3 vLocal;
          void main() {
            vLocal = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float time;
          uniform vec3 blue;
          uniform vec3 red;
          varying vec3 vLocal;
          void main() {
            float turn = fract(atan(vLocal.y, vLocal.x) / 6.2832 + time * 0.08);
            // Blue, white, red, as both flags share them, with soft joins.
            vec3 tint = mix(blue, vec3(1.0), smoothstep(0.28, 0.36, turn));
            tint = mix(tint, red, smoothstep(0.62, 0.7, turn));
            tint = mix(tint, blue, smoothstep(0.94, 1.0, turn));
            gl_FragColor = vec4(tint * 1.3, 1.0);
            #include <colorspace_fragment>
          }
        `,
        toneMapped: false,
      }),
    []
  );
  useResourceDisposal(material);
  return material;
}

/** How long each language speaks before the other answers. */
const TURN_S = 1.9;
/** Where each bubble hovers, over the emitter's foot, before it speaks up. */
const BUBBLE_AT: Array<[number, number, number]> = [
  [-0.36, 0.74, 0],
  [0.36, 0.9, 0.06],
];
/** Sparks circling the beam, blue and red in turn. */
const SPARKS = 6;
/** Each language's bubble: its flag, and the name its texture goes by. */
const LANGUAGES = {
  en: { draw: drawUnionJack, name: 'uk' },
  fr: { draw: drawTricolore, name: 'fr' },
} as const;

/**
 * British and French: a little hologram emitter on the desk, two speech
 * bubbles hovering over it, one in each language. They take turns to speak,
 * the one talking rising and lighting up while the other waits. The site's
 * language sits on the left and speaks first.
 */
function BilingualBubbles() {
  const base = -0.2;
  const radius = 0.56;
  const puck = 0.14;
  const emitter = useEmitterGeometry(radius, puck);
  const beam = useBeamMaterial();
  const ring = useRingMaterial();
  const { locale } = useLanguage();
  const [first, second] =
    locale === 'fr' ? [LANGUAGES.fr, LANGUAGES.en] : [LANGUAGES.en, LANGUAGES.fr];
  const sweepFirst = useSweepMaterial(BUBBLE[0], BUBBLE[1], BUBBLE_CORNER, 3.8);
  const sweepSecond = useSweepMaterial(BUBBLE[0], BUBBLE[1], BUBBLE_CORNER, 3.8);
  const left = useRef<Group>(null);
  const right = useRef<Group>(null);
  const leftGlow = useRef<MeshStandardMaterial>(null);
  const rightGlow = useRef<MeshStandardMaterial>(null);
  const sparks = useRef<Group>(null);
  const talk = useRef([1, 0]);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    beam.uniforms.time.value = t;
    ring.uniforms.time.value = t;
    sweepFirst.uniforms.time.value = t;
    // The second one's light comes round half a sweep later.
    sweepSecond.uniforms.time.value = t + 1.9;
    const speaker = Math.floor(t / TURN_S) % 2;
    const ease = 1 - Math.exp(-Math.min(delta, 0.1) * 7);
    const sides = [
      { group: left.current, glow: leftGlow.current, sweep: sweepFirst },
      { group: right.current, glow: rightGlow.current, sweep: sweepSecond },
    ];
    sides.forEach(({ group, glow, sweep }, i) => {
      const [x, y, z] = BUBBLE_AT[i];
      talk.current[i] += ((speaker === i ? 1 : 0) - talk.current[i]) * ease;
      const k = talk.current[i];
      if (group) {
        const bob = Math.sin(t * 1.7 + i * Math.PI) * 0.02;
        group.position.set(x, base + y + bob + k * 0.06, z + k * 0.04);
        group.scale.setScalar(0.9 + 0.12 * k);
        group.rotation.z = Math.sin(t * 1.1 + i * 2) * 0.03 + (i === 0 ? 0.04 : -0.04);
      }
      if (glow) {
        glow.emissiveIntensity = 0.12 + 0.38 * k;
      }
      sweep.uniforms.strength.value = 0.35 + 0.65 * k;
    });
    if (sparks.current) {
      sparks.current.rotation.y = t * 0.9;
      sparks.current.children.forEach((spark, i) => {
        spark.position.y = base + puck + 0.12 + ((t * 0.25 + i / SPARKS) % 1) * 0.55;
        spark.scale.setScalar(1 - ((t * 0.25 + i / SPARKS) % 1) * 0.7);
      });
    }
  });

  return (
    <>
      <CylinderCollider args={[puck / 2, radius]} position={[0, base + puck / 2, 0]} />
      {/* Light, so the bubbles up top never tip the emitter over */}
      <CuboidCollider args={[0.66, 0.3, 0.11]} position={[0, base + 0.88, 0.02]} density={0.05} />
      <mesh geometry={emitter} position={[0, base, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={EMITTER} roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0, base + puck + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.68, 40]} />
        <meshStandardMaterial color={EMITTER_LENS} roughness={0.15} metalness={0.6} />
      </mesh>
      <mesh
        position={[0, base + puck + 0.004, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={ring}
        raycast={() => null}
      >
        <ringGeometry args={[radius * 0.7, radius * 0.8, 64]} />
      </mesh>
      <mesh
        position={[0, base + puck + 0.33, 0]}
        material={beam}
        renderOrder={1}
        raycast={() => null}
      >
        <cylinderGeometry args={[0.52, radius * 0.66, 0.66, 32, 1, true]} />
      </mesh>
      <group ref={sparks}>
        {Array.from({ length: SPARKS }, (_, i) => {
          const angle = (i / SPARKS) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.46, 0, Math.sin(angle) * 0.46]}
              raycast={() => null}
            >
              <sphereGeometry args={[0.018, 8, 6]} />
              <meshBasicMaterial color={i % 2 ? FLAG_RED : FLAG_BLUE} toneMapped={false} />
            </mesh>
          );
        })}
      </group>
      {/* Leaning back a little towards the camera, turned in towards each other */}
      {/* At rest where they hover, so whatever measures the emitter sees them there */}
      <group
        ref={left}
        position={[BUBBLE_AT[0][0], base + BUBBLE_AT[0][1], BUBBLE_AT[0][2]]}
        rotation={[-0.32, 0.16, 0]}
      >
        <SpeechBubble
          draw={first.draw}
          name={first.name}
          tail={1}
          glow={leftGlow}
          sweep={sweepFirst}
        />
      </group>
      <group
        ref={right}
        position={[BUBBLE_AT[1][0], base + BUBBLE_AT[1][1], BUBBLE_AT[1][2]]}
        rotation={[-0.32, -0.16, 0]}
      >
        <SpeechBubble
          draw={second.draw}
          name={second.name}
          tail={-1}
          glow={rightGlow}
          sweep={sweepSecond}
        />
      </group>
    </>
  );
}

/** The board: five by five square tiles, stepped up into a hill towards the middle. */
const GRID = 5;
const TILE = 0.32;
const PITCH = 0.36;
const CAP = 0.05;
const PLATE_HALF = 0.96;
const PLATE_HEIGHT = 0.08;
const PLATE_BASE = -0.14;
const PLATE_TOP = PLATE_BASE + PLATE_HEIGHT;
/** How high each step of the hill stands, from the summit out to the edge. */
const STEP_HEIGHT = [0.34, 0.19, 0.06];
/** Unclaimed stone, a shade lighter up each step, so the hill reads from afar. */
const STONE = ['#c3c6cc', '#a2a6ae', '#858991'].map((color) => new Color(color));
const SIDE_COLORS = [new Color(ACCENT), new Color('#5b9cff')];
const PIECE_PALE = '#efece6';
const GEM_GOLD = '#d6b25e';

type Cell = [number, number];
/** Each side's home corner, its banner planted there: the front left, and the back right. */
const HOMES: Cell[] = [
  [0, 4],
  [4, 0],
];
/**
 * One match, a move every beat, the two sides taking turns: each climbs
 * towards the summit, the summit changes hands, and a tile or two is taken
 * back on the way.
 */
const MOVES: Array<{ side: number; cell: Cell }> = [
  { side: 0, cell: [1, 4] },
  { side: 1, cell: [3, 0] },
  { side: 0, cell: [1, 3] },
  { side: 1, cell: [3, 1] },
  { side: 0, cell: [0, 2] },
  { side: 1, cell: [4, 2] },
  { side: 0, cell: [2, 3] },
  { side: 1, cell: [2, 1] },
  { side: 0, cell: [2, 2] },
  { side: 1, cell: [3, 2] },
  { side: 0, cell: [3, 3] },
  { side: 1, cell: [2, 2] },
  { side: 0, cell: [1, 2] },
  { side: 1, cell: [2, 3] },
  { side: 0, cell: [1, 1] },
  { side: 1, cell: [3, 4] },
];
const BEAT = 1.05;
/** The share of a beat a hop takes, and how high it goes. */
const HOP = 0.42;
const HOP_HEIGHT = 0.2;
/** After the last move: both pieces hop home, then the tiles flip back to stone, from the summit out. */
const HOME_HOP = 0.6;
const FLIP_SECONDS = 0.5;
const FLIP_STAGGER = 0.2;
const MATCH = MOVES.length * BEAT;
/** Seen for the first time, the match is already under way. */
const OPENING = 7.2 * BEAT;
const LOOP = MATCH + HOME_HOP + 2 * FLIP_STAGGER + FLIP_SECONDS + 0.8;
/** The pieces, a little bigger than drawn, to stand out at the desk's distance. */
const PIECE_SCALE = 1.7;

const cellIndex = ([col, row]: Cell) => row * GRID + col;
const ringOf = (index: number) =>
  Math.max(Math.abs((index % GRID) - 2), Math.abs(Math.floor(index / GRID) - 2));
const TILES = Array.from({ length: GRID * GRID }, (_, index) => {
  const ring = ringOf(index);
  return {
    x: ((index % GRID) - 2) * PITCH,
    z: (Math.floor(index / GRID) - 2) * PITCH,
    ring,
    top: PLATE_TOP + STEP_HEIGHT[ring] + CAP,
    home: HOMES.findIndex((home) => cellIndex(home) === index),
  };
});
/** Every claim on each tile, in order: when it lands, and by whom. */
const CLAIMS = TILES.map((_, index) =>
  MOVES.flatMap(({ side, cell }, m) =>
    cellIndex(cell) === index ? [{ at: m * BEAT + HOP * BEAT, side }] : []
  )
);

/** The columns the tiles stand on, as one shape. */
function useStepGeometry() {
  const geometry = useMemo(() => {
    const parts = TILES.map(({ x, z, ring }) => {
      const height = STEP_HEIGHT[ring];
      const part = new BoxGeometry(TILE * 0.96, height, TILE * 0.96);
      part.translate(x, PLATE_TOP + height / 2, z);
      return part;
    });
    const merged = mergeGeometries(parts) ?? new BufferGeometry();
    parts.forEach((part) => part.dispose());
    return merged;
  }, []);
  useResourceDisposal(geometry);
  return geometry;
}

/** A playing piece in a side's colours: a pale foot and body, and a cap in its colour. */
function usePieceGeometry(color: Color) {
  const geometry = useMemo(() => {
    const pale = new Color(PIECE_PALE);
    const foot = new CylinderGeometry(0.06, 0.066, 0.035, 16);
    foot.translate(0, 0.0175, 0);
    const body = new CylinderGeometry(0.038, 0.048, 0.085, 16);
    body.translate(0, 0.035 + 0.0425, 0);
    const cap = new SphereGeometry(0.05, 16, 10);
    cap.translate(0, 0.12 + 0.03, 0);
    const parts = [foot, body, cap].map((part, i) => {
      const flat = part.toNonIndexed();
      const tint = i === 2 ? color : pale;
      const colors = new Float32Array(flat.attributes.position.count * 3);
      for (let v = 0; v < colors.length; v += 3) {
        colors.set([tint.r, tint.g, tint.b], v);
      }
      flat.setAttribute('color', new BufferAttribute(colors, 3));
      return flat;
    });
    const merged = mergeGeometries(parts) ?? new BufferGeometry();
    [foot, body, cap, ...parts].forEach((part) => part.dispose());
    merged.computeVertexNormals();
    merged.scale(PIECE_SCALE, PIECE_SCALE, PIECE_SCALE);
    return merged;
  }, [color]);
  useResourceDisposal(geometry);
  return geometry;
}

/** A side's banner on its home corner: a pole and a cloth that ripples in the wind. */
function Banner({ side }: { side: number }) {
  const cloth = useRef<Mesh>(null);
  const geometry = useMemo(() => {
    const geometry = new PlaneGeometry(0.22, 0.14, 8, 2);
    geometry.translate(0.11, 0, 0);
    return geometry;
  }, []);
  useResourceDisposal(geometry);
  const rest = useMemo(
    () => Float32Array.from(geometry.attributes.position.array as Float32Array),
    [geometry]
  );
  useFrame(({ clock }) => {
    const positions = cloth.current?.geometry.attributes.position as BufferAttribute | undefined;
    if (!positions) {
      return;
    }
    const t = clock.elapsedTime * 4 + side * 2;
    for (let v = 0; v < positions.count; v += 1) {
      const x = rest[v * 3];
      positions.setZ(v, Math.sin(t - x * 22) * 0.03 * (x / 0.22));
    }
    positions.needsUpdate = true;
  });
  const tile = TILES[cellIndex(HOMES[side])];
  // On the corner of the home tile furthest from the board's middle.
  const out = side === 0 ? [-1, 1] : [1, -1];
  return (
    <group
      position={[tile.x + out[0] * TILE * 0.36, tile.top, tile.z + out[1] * TILE * 0.36]}
      rotation={[0, side === 0 ? 0.5 : Math.PI + 0.5, 0]}
    >
      <mesh position={[0, 0.21, 0]} castShadow>
        <cylinderGeometry args={[0.009, 0.012, 0.42, 8]} />
        <meshStandardMaterial color={PIECE_PALE} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh ref={cloth} geometry={geometry} position={[0.005, 0.34, 0]} castShadow>
        <meshStandardMaterial color={SIDE_COLORS[side]} roughness={0.7} side={DoubleSide} />
      </mesh>
    </group>
  );
}

/**
 * Strategy games, without naming one: a stepped board with a prize on its
 * summit, two sides climbing towards it from their banners, each tile they
 * land on taken in their colour. The match ends, the pieces go home, the
 * tiles turn back to stone from the summit out, and it starts again.
 */
function StrategyBoard() {
  const steps = useStepGeometry();
  const capGeometry = useMemo(() => new RoundedBoxGeometry(TILE, CAP, TILE, 2, 0.018), []);
  useResourceDisposal(capGeometry);
  const pieceGeometries = [usePieceGeometry(SIDE_COLORS[0]), usePieceGeometry(SIDE_COLORS[1])];
  const caps = useRef<InstancedMesh>(null);
  const pieces = useRef<Array<Mesh | null>>([]);
  const gem = useRef<Mesh>(null);
  const scratch = useMemo(
    () => ({
      matrix: new Matrix4(),
      turn: new Quaternion(),
      color: new Color(),
      axis: new Vector3(1, 0, 0),
    }),
    []
  );

  useFrame(({ clock }) => {
    const t = (clock.elapsedTime + OPENING) % LOOP;
    const mesh = caps.current;
    const { matrix, turn, color, axis } = scratch;
    const lift = TILES.map(() => 0);
    if (mesh) {
      TILES.forEach((tile, index) => {
        // Who holds it now, and how fresh the claim is: a fresh claim bounces and washes in.
        let owner = tile.home;
        let before = tile.home;
        let since = Infinity;
        CLAIMS[index].forEach(({ at, side }) => {
          if (t >= at) {
            before = owner;
            owner = side;
            since = t - at;
          }
        });
        // The match over, it flips back to stone, the summit first.
        const flipAt = MATCH + HOME_HOP + tile.ring * FLIP_STAGGER;
        const flip = tile.home < 0 ? smoothstep(flipAt, flipAt + FLIP_SECONDS, t) * Math.PI : 0;
        if (flip > Math.PI / 2) {
          owner = -1;
        }
        const stone = STONE[tile.ring];
        const wash = Math.min(1, since / 0.25);
        color
          .copy(before < 0 ? stone : SIDE_COLORS[before])
          .lerp(owner < 0 ? stone : SIDE_COLORS[owner], flip > 0 ? 1 : wash);
        // Just taken, it flashes a little brighter.
        color.multiplyScalar(1 + 0.35 * Math.max(0, 1 - since / 0.4));
        mesh.setColorAt(index, color);
        // Never claimed this match, it rests: sin(Infinity) would put it nowhere.
        const bounce = since < 1 ? Math.exp(-since * 7) * Math.sin(since * 22) * 0.025 : 0;
        lift[index] = bounce + Math.sin(flip) * 0.14;
        turn.setFromAxisAngle(axis, flip);
        matrix.makeRotationFromQuaternion(turn);
        matrix.setPosition(tile.x, tile.top - CAP / 2 + lift[index], tile.z);
        mesh.setMatrixAt(index, matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }
    }

    [0, 1].forEach((side) => {
      const piece = pieces.current[side];
      if (!piece) {
        return;
      }
      // Where it hopped from and to last, and how far through that hop it is.
      let from = cellIndex(HOMES[side]);
      let to = from;
      let start = -Infinity;
      MOVES.forEach(({ side: mover, cell }, m) => {
        if (mover === side && t >= m * BEAT) {
          from = to;
          to = cellIndex(cell);
          start = m * BEAT;
        }
      });
      let span = HOP * BEAT;
      if (t >= MATCH) {
        from = to;
        to = cellIndex(HOMES[side]);
        start = MATCH;
        span = HOME_HOP;
      }
      const u = smoothstep(0, 1, (t - start) / span);
      const a = TILES[from];
      const b = TILES[to];
      const reach = Math.hypot(b.x - a.x, b.z - a.z);
      piece.position.set(
        a.x + (b.x - a.x) * u,
        a.top +
          (b.top - a.top) * u +
          lift[from] * (1 - u) +
          lift[to] * u +
          Math.sin(Math.PI * u) * (HOP_HEIGHT + reach * 0.15),
        a.z + (b.z - a.z) * u
      );
    });

    if (gem.current) {
      // On its own clock, not the match's, so it never jumps as the match starts over.
      gem.current.rotation.y = clock.elapsedTime * 0.8;
      gem.current.position.y = TILES[12].top + 0.36 + Math.sin(clock.elapsedTime * 1.6) * 0.025;
    }
  });

  return (
    <>
      {/* The plate, then each step of the hill, so things rest on the board as it is drawn. */}
      <CuboidCollider
        args={[PLATE_HALF, PLATE_HEIGHT / 2, PLATE_HALF]}
        position={[0, PLATE_BASE + PLATE_HEIGHT / 2, 0]}
      />
      {STEP_HEIGHT.map((height, ring) => {
        const half = (2 - ring) * PITCH + TILE / 2;
        const tall = (height + CAP) / 2;
        return (
          <CuboidCollider
            // Fixed: one per step, summit first.
            // eslint-disable-next-line react/no-array-index-key
            key={ring}
            args={[half, tall, half]}
            position={[0, PLATE_TOP + tall, 0]}
          />
        );
      })}
      <RoundedBox
        args={[PLATE_HALF * 2, PLATE_HEIGHT, PLATE_HALF * 2]}
        radius={0.03}
        smoothness={2}
        position={[0, PLATE_BASE + PLATE_HEIGHT / 2, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#2a2b31" roughness={0.55} metalness={0.2} />
      </RoundedBox>
      <mesh geometry={steps} castShadow receiveShadow>
        <meshStandardMaterial color="#62656e" roughness={0.75} />
      </mesh>
      <instancedMesh
        ref={(mesh) => {
          caps.current = mesh;
          // Colours from the first frame on, so the board is never drawn white.
          if (mesh && !mesh.instanceColor) {
            TILES.forEach((tile, index) => {
              mesh.setColorAt(index, tile.home < 0 ? STONE[tile.ring] : SIDE_COLORS[tile.home]);
              mesh.setMatrixAt(
                index,
                new Matrix4().setPosition(tile.x, tile.top - CAP / 2, tile.z)
              );
            });
          }
        }}
        args={[capGeometry, undefined, TILES.length]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial roughness={0.5} />
      </instancedMesh>
      <Banner side={0} />
      <Banner side={1} />
      {[0, 1].map((side) => (
        <mesh
          key={side}
          ref={(mesh) => {
            pieces.current[side] = mesh;
          }}
          geometry={pieceGeometries[side]}
          position={[
            TILES[cellIndex(HOMES[side])].x,
            TILES[cellIndex(HOMES[side])].top,
            TILES[cellIndex(HOMES[side])].z,
          ]}
          castShadow
        >
          <meshStandardMaterial vertexColors roughness={0.4} />
        </mesh>
      ))}
      <mesh ref={gem} position={[0, TILES[12].top + 0.36, 0]} castShadow>
        <octahedronGeometry args={[0.13]} />
        <meshStandardMaterial
          color={GEM_GOLD}
          emissive={GEM_GOLD}
          emissiveIntensity={0.45}
          roughness={0.25}
          metalness={0.6}
          flatShading
        />
      </mesh>
    </>
  );
}

const ROBOT_SHELL = '#f1efea';
const ROBOT_TRIM = '#2c2d34';
const ROBOT_VISOR = '#0b0c11';
const ROBOT_GLOW = '#7cf2ff';
const ROBOT_SCALE = 0.85;
/** Head centre, in the robot's own (unscaled) units. */
const ROBOT_HEAD_Y = 0.92;

/** A flat panel with rounded corners, facing +z, centred on the origin. */
function useRoundedPanel(width: number, height: number, radius: number, depth: number) {
  const geometry = useMemo(() => {
    const x = width / 2 - radius;
    const y = height / 2 - radius;
    const shape = new Shape();
    shape.absarc(x, y, radius, 0, Math.PI / 2, false);
    shape.absarc(-x, y, radius, Math.PI / 2, Math.PI, false);
    shape.absarc(-x, -y, radius, Math.PI, (Math.PI * 3) / 2, false);
    shape.absarc(x, -y, radius, (Math.PI * 3) / 2, Math.PI * 2, false);
    const bevel = Math.min(0.012, depth / 3);
    const geometry = new ExtrudeGeometry(shape, {
      depth: depth - bevel * 2,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2,
      curveSegments: 8,
    });
    geometry.center();
    geometry.computeVertexNormals();
    return geometry;
  }, [width, height, radius, depth]);
  useResourceDisposal(geometry);
  return geometry;
}

/**
 * Automation, at home too: a little desk robot on treads. It turns to look at
 * the pointer, it blinks, bobs and its antenna light breathes.
 */
function Robot() {
  const frame = useRef<Group>(null);
  const head = useRef<Group>(null);
  const eyes = useRef<Group>(null);
  const antenna = useRef<Group>(null);
  const bulb = useRef<MeshStandardMaterial>(null);
  const visor = useRoundedPanel(0.72, 0.44, 0.14, 0.06);
  const look = useMemo(
    () => ({
      raycaster: new Raycaster(),
      // About desk height: it looks at the pointer, not at the camera.
      plane: new Plane(new Vector3(0, 1, 0), -0.3),
      point: new Vector3(),
      yaw: 0,
      pitch: 0,
    }),
    []
  );

  useFrame(({ clock, pointer, camera }, delta) => {
    const body = frame.current;
    if (!body || !head.current || !eyes.current) {
      return;
    }
    const t = clock.elapsedTime;
    let yaw = 0;
    let pitch = 0;
    look.raycaster.setFromCamera(pointer, camera);
    if (look.raycaster.ray.intersectPlane(look.plane, look.point)) {
      // Into the robot's own space, so it still works lying on its back.
      body.worldToLocal(look.point);
      const { x, z } = look.point;
      yaw = Math.max(-1.3, Math.min(1.3, Math.atan2(x, Math.max(z, 0.2))));
      pitch = Math.atan2(look.point.y - ROBOT_HEAD_Y, Math.hypot(x, z));
    }
    const ease = 1 - Math.exp(-Math.min(delta, 0.1) * 6);
    look.yaw += (yaw - look.yaw) * ease;
    look.pitch += (pitch - look.pitch) * ease;

    // The body turns to face the pointer (in the scene's physics step); the head
    // turns part of the rest of the way, and the eyes do the last of it.
    head.current.rotation.set(
      // Face tipped up a little, so the camera above sees it.
      -0.24 - look.pitch * 0.3 + Math.sin(t * 1.3) * 0.03,
      look.yaw * 0.6,
      Math.sin(t * 0.9) * 0.06
    );
    head.current.position.y = 0.62 + Math.sin(t * 2.2) * 0.012;
    eyes.current.position.set(
      Math.max(-0.08, Math.min(0.08, look.yaw * 0.09)),
      Math.max(-0.05, Math.min(0.05, look.pitch * 0.06)),
      0.335
    );
    // A blink every few seconds, a double one every other time.
    const cycle = t % 7.2;
    const blink = (at: number) => Math.min(1, Math.abs(cycle - at) / 0.07);
    eyes.current.scale.y = Math.max(0.1, Math.min(blink(0.07), blink(3.6), blink(3.82)));

    if (antenna.current) {
      antenna.current.rotation.z = Math.sin(t * 2.6) * 0.08;
    }
    if (bulb.current) {
      bulb.current.emissiveIntensity = 0.5 + 0.9 * (0.5 + 0.5 * Math.sin(t * 2.4));
    }
  });

  return (
    <>
      {/* Treads and body, then the wider head: lighter, so it stands steady */}
      <CuboidCollider args={[0.26, 0.24, 0.24]} position={[0, -0.28, 0]} />
      <CuboidCollider args={[0.42, 0.26, 0.27]} position={[0, 0.26, 0]} density={0.4} />
      <group ref={frame} position={[0, -0.52, 0]} scale={ROBOT_SCALE}>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.22, 0.09, 0]}>
            <RoundedBox
              args={[0.16, 0.18, 0.56]}
              radius={0.07}
              smoothness={3}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color={ROBOT_TRIM} roughness={0.7} />
            </RoundedBox>
            {[-0.17, 0.17].map((z) => (
              <mesh key={z} position={[side * 0.082, 0, z]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
                <meshStandardMaterial color="#8d9099" roughness={0.35} metalness={0.6} />
              </mesh>
            ))}
          </group>
        ))}
        {/* Body with a little status light */}
        <RoundedBox
          args={[0.54, 0.4, 0.44]}
          radius={0.14}
          smoothness={3}
          position={[0, 0.38, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={ROBOT_SHELL} roughness={0.35} />
        </RoundedBox>
        <mesh position={[0, 0.4, 0.222]}>
          <circleGeometry args={[0.07, 24]} />
          <meshStandardMaterial color={ROBOT_TRIM} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.4, 0.224]}>
          <ringGeometry args={[0.035, 0.05, 24]} />
          <meshBasicMaterial color={ACCENT} toneMapped={false} />
        </mesh>
        {/* Stubby arms */}
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * 0.31, 0.36, 0.02]}
            rotation={[0.3, 0, side * 0.35]}
            castShadow
          >
            <capsuleGeometry args={[0.055, 0.16, 4, 12]} />
            <meshStandardMaterial color={ROBOT_TRIM} roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.07, 0.09, 0.08, 16]} />
          <meshStandardMaterial color={ROBOT_TRIM} roughness={0.5} />
        </mesh>

        {/* Head: pivots at the neck */}
        <group ref={head} position={[0, 0.62, 0]}>
          <group position={[0, ROBOT_HEAD_Y - 0.62, 0]}>
            <RoundedBox
              args={[0.9, 0.6, 0.62]}
              radius={0.2}
              smoothness={4}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color={ROBOT_SHELL} roughness={0.3} />
            </RoundedBox>
            {/* Glossy screen face */}
            <mesh geometry={visor} position={[0, -0.01, 0.3]}>
              <meshStandardMaterial color={ROBOT_VISOR} roughness={0.12} metalness={0.3} />
            </mesh>
            <group ref={eyes} position={[0, 0, 0.335]}>
              {[-0.15, 0.15].map((x) => (
                <mesh key={x} position={[x, 0.02, 0]} scale={[1, 1, 0.3]}>
                  <capsuleGeometry args={[0.048, 0.07, 4, 12]} />
                  <meshBasicMaterial color={ROBOT_GLOW} toneMapped={false} />
                </mesh>
              ))}
            </group>
            {/* A smile and a little blush */}
            <mesh position={[0, -0.09, 0.334]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[0.055, 0.011, 6, 20, Math.PI]} />
              <meshBasicMaterial color={ROBOT_GLOW} toneMapped={false} />
            </mesh>
            {[-0.25, 0.25].map((x) => (
              <mesh key={x} position={[x, -0.08, 0.333]}>
                <circleGeometry args={[0.04, 20]} />
                <meshBasicMaterial color="#ff7d9c" transparent opacity={0.55} toneMapped={false} />
              </mesh>
            ))}
            {/* Ears */}
            {[-1, 1].map((side) => (
              <group key={side} position={[side * 0.46, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <mesh>
                  <cylinderGeometry args={[0.11, 0.11, 0.06, 20]} />
                  <meshStandardMaterial color={ROBOT_TRIM} roughness={0.5} />
                </mesh>
                <mesh position={[0, -side * 0.035, 0]}>
                  <cylinderGeometry args={[0.06, 0.06, 0.02, 20]} />
                  <meshStandardMaterial color={ACCENT} roughness={0.4} />
                </mesh>
              </group>
            ))}
            {/* Antenna, springy, its light breathing */}
            <group ref={antenna} position={[0, 0.29, 0]}>
              <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.016, 0.02, 0.2, 8]} />
                <meshStandardMaterial color={ROBOT_TRIM} roughness={0.5} />
              </mesh>
              <mesh position={[0, 0.24, 0]} castShadow>
                <sphereGeometry args={[0.065, 16, 12]} />
                <meshStandardMaterial
                  ref={bulb}
                  color={ACCENT}
                  emissive={ACCENT}
                  emissiveIntensity={0.8}
                  roughness={0.3}
                />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </>
  );
}

/** The night board: a light wedge standing on the desk, its face a kanban board leaning back towards the viewer. */
const BOARD_W = 2.3;
/** The face, from the ledge along the front up to the top edge at the back, and how far it leans back from upright. */
const BOARD_H = 1.38;
const BOARD_LEAN = 0.78;
/** The ledge under the face, the light frame round it, and the underside. */
const BOARD_LEDGE = 0.1;
const BOARD_LIP = 0.05;
const BOARD_FOOT = -0.1;
const BOARD_DEPTH = BOARD_H * Math.sin(BOARD_LEAN);
const BOARD_RISE = BOARD_H * Math.cos(BOARD_LEAN);
const BOARD_FRAME = '#d9dce3';
const NIGHT_INK = '#c3c8d8';
/** The wedge's corners, for its collider: the underside, the back, and the face sloping down to the ledge. */
const BOARD_HULL = new Float32Array(
  [-1, 1].flatMap((side) => {
    const x = (side * BOARD_W) / 2;
    const d = BOARD_DEPTH / 2;
    return [
      ...[x, BOARD_FOOT, d],
      ...[x, BOARD_FOOT, -d],
      ...[x, BOARD_FOOT + BOARD_LEDGE + BOARD_RISE, -d],
      ...[x, BOARD_FOOT + BOARD_LEDGE, d],
    ];
  })
);

/**
 * On the face, in its own units: across from the middle (u), up from the
 * ledge (v), and out from it. The frame leaves the face this much inside.
 */
const FACE_W = BOARD_W - 2 * BOARD_LIP;
const FACE_H = BOARD_H - 2 * BOARD_LIP;
const FACE_TOP = BOARD_H - BOARD_LIP;
/** Texture pixels to a unit of face. */
const FACE_PX = 480;
/** The night bar along the top: the clock, and the night going by from the moon to the sun. */
const BAR_V: [number, number] = [1.14, 1.31];
const BAR_W = 2.08;
const BAR_PX = 500;
/** The lanes: where the agents look for work, then to do, doing, and what waits for me in the morning. */
const LANE_TOP = 1.09;
const LANE_BOTTOM = 0.08;
const LANE_HEAD = 0.14;
type Glyph =
  'search' | 'todo' | 'doing' | 'sun' | 'code' | 'logs' | 'chat' | 'bug' | 'shield' | 'bolt';
const LANES: Array<{ u: number; w: number; title: string; glyph: Glyph }> = [
  { u: -0.84, w: 0.4, title: 'Scan', glyph: 'search' },
  { u: -0.34, w: 0.52, title: 'To do', glyph: 'todo' },
  { u: 0.22, w: 0.52, title: 'Doing', glyph: 'doing' },
  { u: 0.78, w: 0.52, title: 'Morning', glyph: 'sun' },
];
/** Three cards to a lane, top to bottom; what the agents scan sits in the same rows. */
const ROWS = [0.79, 0.51, 0.23];
const SOURCES: Array<{ title: string; glyph: Glyph; color: string; lines: string[] }> = [
  { title: 'Code', glyph: 'code', color: '#8fb4ff', lines: ['#c792ea', '#82aaff', '#c3e88d'] },
  { title: 'Logs', glyph: 'logs', color: '#7ee0a8', lines: ['#4a5372', '#4a5372', '#ff5d5d'] },
  { title: 'Feedback', glyph: 'chat', color: '#ffc069', lines: ['#4a5372', '#4a5372', '#ffc069'] },
];
const SOURCE: [number, number] = [0.34, 0.22];
/** A card: across, thick, up the face. */
const NIGHT_CARD: [number, number, number] = [0.46, 0.016, 0.24];
const NIGHT_CARD_PX = 1000;

/** Above the face: a ticket gliding from lane to lane, a ticket just found. */
const CARRY = 0.04;
const FOUND = 0.03;
/** A scan sweeps this far either side of the middle of its source. */
const SWEEP = 0.14;
/** Being scanned, a source lights up in this cool light; so does a ticket it has just turned up. */
const SCAN_LIGHT = '#9fd8ff';

/** Somewhere on the face: across, up, and how far out from it. */
type Spot = [number, number, number];
type Key = [number, Spot];
const source = (row: number): Spot => [LANES[0].u, ROWS[row], FOUND];
const slot = (lane: number, row: number, lift = 0): Spot => [LANES[lane].u, ROWS[row], lift];

/**
 * One night, in seconds. Agents scan the code, the logs and the feedback;
 * what they find becomes a ticket, which they pick up and work through on
 * their own, the ticket saying what they are doing as they go, and lay in
 * the morning lane. By six the night's work waits there for me.
 */
const NIGHT_S = 18;
const DAWN = 15;
const CLEAR_AT = 16.9;
/**
 * The board opens late in the night, never empty: two tickets ready in the
 * morning lane, the code being scanned, a ticket about to be picked up. Its
 * still is this moment too, so the 3D takes over from it without a jump.
 */
const NIGHT_OPENS = 10.6;
/** Where a source's tickets say they came from, till an agent picks them up. */
const FOUND_IN = ['Found in the code', 'Found in the logs', 'From user feedback'];
type NightCard = {
  code: string;
  title: string;
  color: string;
  glyph: Glyph;
  /** The source it came out of, and when. */
  row: number;
  born: number;
  keys: Key[];
  /** Worked on in the doing lane, saying each of its steps in turn. */
  work?: [number, number];
  steps?: [string, string, string];
  /** Laid in the morning lane. */
  ready?: number;
};
const NIGHT_CARDS: NightCard[] = [
  {
    code: 'BUG-88',
    title: 'Upload fails on iOS',
    color: '#ff5d5d',
    glyph: 'bug',
    row: 1,
    born: 1.5,
    keys: [
      [1.5, source(1)],
      [2.3, slot(1, 0)],
      [3.0, slot(1, 0)],
      [3.2, slot(1, 0, CARRY)],
      [4.0, slot(2, 0, CARRY)],
      [4.2, slot(2, 0)],
      [6.6, slot(2, 0)],
      [6.8, slot(2, 0, CARRY)],
      [7.6, slot(3, 0, CARRY)],
      [7.8, slot(3, 0)],
    ],
    work: [4.2, 6.6],
    steps: ['Reproducing', 'Finding the cause', 'Drafting a plan'],
    ready: 7.8,
  },
  {
    code: 'SEC-14',
    title: 'Unescaped search input',
    color: '#a78bfa',
    glyph: 'shield',
    row: 0,
    born: 2.6,
    keys: [
      [2.6, source(0)],
      [3.4, slot(1, 1)],
      [3.6, slot(1, 1)],
      [3.95, slot(1, 0)],
      [4.0, slot(1, 0)],
      [4.2, slot(1, 0, CARRY)],
      [5.0, slot(2, 1, CARRY)],
      [5.2, slot(2, 1)],
      [7.8, slot(2, 1)],
      [8.0, slot(2, 1, CARRY)],
      [8.8, slot(3, 1, CARRY)],
      [9.0, slot(3, 1)],
    ],
    work: [5.2, 7.8],
    steps: ['Tracing the input', 'Checking the impact', 'Drafting a plan'],
    ready: 9.0,
  },
  {
    code: 'FB-23',
    title: 'Export routes to CSV',
    color: '#5b9cff',
    glyph: 'chat',
    row: 2,
    born: 9.8,
    keys: [
      [9.8, source(2)],
      [10.6, slot(1, 0)],
      [10.7, slot(1, 0)],
      [10.9, slot(1, 0, CARRY)],
      [11.7, slot(2, 0, CARRY)],
      [11.9, slot(2, 0)],
      [13.6, slot(2, 0)],
      [13.8, slot(2, 0, CARRY)],
      [14.6, slot(3, 2, CARRY)],
      [14.8, slot(3, 2)],
    ],
    work: [11.9, 13.6],
    steps: ['Reading the feedback', 'Checking the code', 'Drafting a plan'],
    ready: 14.8,
  },
  {
    // Found just before dawn: it waits in to do for tomorrow night.
    code: 'PERF-32',
    title: 'Slow route list query',
    color: '#3fcf8e',
    glyph: 'bolt',
    row: 0,
    born: 11.6,
    keys: [
      [11.6, source(0)],
      [12.4, slot(1, 0)],
    ],
  },
];
/** When each source is scanned, and which: the ticket it turns up comes out at the end. */
const NIGHT_SCANS: Array<[number, number, number]> = [
  [0.3, 1.5, 1],
  [1.0, 2.6, 0],
  [8.8, 9.8, 2],
  [10.0, 11.6, 0],
];

type CardStatus = { text: string; mode: 'found' | 'working' | 'ready' };

/** What a ticket says it is at, `t` seconds into the night. */
function cardStatus(card: NightCard, t: number): CardStatus {
  if (card.ready !== undefined && t >= card.ready) {
    return { text: 'Ready for you', mode: 'ready' };
  }
  if (card.work && card.steps && t >= card.work[0]) {
    const done = (t - card.work[0]) / (card.work[1] - card.work[0]);
    return { text: card.steps[Math.min(2, Math.floor(done * 3))], mode: 'working' };
  }
  return { text: FOUND_IN[card.row], mode: 'found' };
}

/** Where something is along its keys at `t`: eased from one to the next, lifted a little as it travels. */
function follow(keys: Key[], t: number, out: Spot): Spot {
  let next = 0;
  while (next < keys.length && keys[next][0] <= t) {
    next += 1;
  }
  if (next === 0 || next === keys.length) {
    const [, at] = keys[next === 0 ? 0 : keys.length - 1];
    out[0] = at[0];
    out[1] = at[1];
    out[2] = at[2];
    return out;
  }
  const [from, a] = keys[next - 1];
  const [to, b] = keys[next];
  const f = smoothstep(from, to, t);
  const travel = Math.hypot(b[0] - a[0], b[1] - a[1]);
  out[0] = a[0] + (b[0] - a[0]) * f;
  out[1] = a[1] + (b[1] - a[1]) * f;
  out[2] = a[2] + (b[2] - a[2]) * f + Math.sin(Math.PI * f) * Math.min(0.04, travel * 0.05);
  return out;
}

/** 1 between `from` and `to`, easing in and out over `edge` seconds at either end. */
function within(t: number, from: number, to: number, edge: number) {
  return smoothstep(from, from + edge, t) * (1 - smoothstep(to - edge, to, t));
}

/** Pops past its size and settles back. */
function overshoot(x: number) {
  const t = Math.min(1, Math.max(0, x)) - 1;
  return 1 + 2.7 * t * t * t + 1.7 * t * t;
}

/** The board's small icons, drawn round (x, y) within about `r`. */
function drawGlyph(
  ctx: CanvasRenderingContext2D,
  glyph: Glyph,
  x: number,
  y: number,
  r: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = r * 0.26;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  switch (glyph) {
    case 'search':
      ctx.beginPath();
      ctx.arc(-r * 0.18, -r * 0.18, r * 0.62, 0, Math.PI * 2);
      ctx.moveTo(r * 0.28, r * 0.28);
      ctx.lineTo(r * 0.9, r * 0.9);
      ctx.stroke();
      break;
    case 'todo':
      ctx.setLineDash([r * 0.38, r * 0.3]);
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'doing':
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r * 0.45, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
      break;
    case 'sun':
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r * 0.66, Math.sin(a) * r * 0.66);
        ctx.lineTo(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95);
        ctx.stroke();
      }
      break;
    case 'code':
    case 'logs':
      ctx.font = `700 ${r * 1.15}px ${monoFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(glyph === 'code' ? '</>' : '>_', 0, r * 0.06);
      break;
    case 'chat':
      roundRect(ctx, -r * 0.85, -r * 0.7, r * 1.7, r * 1.15, r * 0.35);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-r * 0.45, r * 0.4);
      ctx.lineTo(-r * 0.6, r * 0.9);
      ctx.lineTo(-r * 0.05, r * 0.4);
      ctx.fill();
      break;
    case 'bug':
      ctx.beginPath();
      ctx.ellipse(0, r * 0.15, r * 0.42, r * 0.58, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -r * 0.5, r * 0.26, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = r * 0.16;
      [-0.1, 0.2, 0.5].forEach((dy) => {
        ctx.beginPath();
        ctx.moveTo(-r * 0.85, r * dy);
        ctx.lineTo(r * 0.85, r * dy);
        ctx.stroke();
      });
      break;
    case 'shield':
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.9);
      ctx.lineTo(r * 0.75, -r * 0.6);
      ctx.quadraticCurveTo(r * 0.75, r * 0.5, 0, r * 0.95);
      ctx.quadraticCurveTo(-r * 0.75, r * 0.5, -r * 0.75, -r * 0.6);
      ctx.closePath();
      ctx.fill();
      break;
    case 'bolt':
      ctx.beginPath();
      ctx.moveTo(r * 0.2, -r * 0.95);
      ctx.lineTo(-r * 0.55, r * 0.12);
      ctx.lineTo(-r * 0.02, r * 0.12);
      ctx.lineTo(-r * 0.2, r * 0.95);
      ctx.lineTo(r * 0.55, -r * 0.12);
      ctx.lineTo(r * 0.02, -r * 0.12);
      ctx.closePath();
      ctx.fill();
      break;
    default:
      break;
  }
  ctx.restore();
}

/** The face, all but what moves: the lanes and their headings, and the three sources the agents scan. */
function useNightFaceTexture() {
  const width = Math.round(FACE_W * FACE_PX);
  const height = Math.round(FACE_H * FACE_PX);
  return useLabelTexture(
    width,
    height,
    (ctx, w, h) => {
      const x = (u: number) => (u + FACE_W / 2) * FACE_PX;
      const y = (v: number) => (FACE_TOP - v) * FACE_PX;
      ctx.fillStyle = '#121726';
      ctx.fillRect(0, 0, w, h);
      ctx.textBaseline = 'middle';
      LANES.forEach((lane, i) => {
        const left = x(lane.u - lane.w / 2);
        const top = y(LANE_TOP);
        const laneW = lane.w * FACE_PX;
        ctx.fillStyle = i === 0 ? '#151b2d' : '#1b2135';
        roundRect(ctx, left, top, laneW, (LANE_TOP - LANE_BOTTOM) * FACE_PX, 18);
        ctx.fill();
        if (i === 0) {
          ctx.save();
          ctx.setLineDash([10, 8]);
          ctx.strokeStyle = '#2f3958';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.restore();
        }
        const middle = y(LANE_TOP - LANE_HEAD / 2);
        drawGlyph(ctx, lane.glyph, left + 30, middle, 14, i === 3 ? '#ffc24a' : NIGHT_INK);
        ctx.fillStyle = NIGHT_INK;
        ctx.font = `600 30px ${sansFamily}`;
        ctx.fillText(lane.title, left + 54, middle + 1);
      });
      SOURCES.forEach((src, row) => {
        const left = x(LANES[0].u - SOURCE[0] / 2);
        const top = y(ROWS[row] + SOURCE[1] / 2);
        const tileW = SOURCE[0] * FACE_PX;
        ctx.fillStyle = '#222a45';
        roundRect(ctx, left, top, tileW, SOURCE[1] * FACE_PX, 14);
        ctx.fill();
        drawGlyph(ctx, src.glyph, left + 26, top + 28, 14, src.color);
        ctx.fillStyle = NIGHT_INK;
        ctx.font = `600 23px ${sansFamily}`;
        ctx.fillText(src.title, left + 50, top + 29);
        src.lines.forEach((color, line) => {
          ctx.fillStyle = color;
          roundRect(ctx, left + 18, top + 56 + line * 15, [96, 120, 74][line], 8, 4);
          ctx.fill();
        });
      });
    },
    'night-face'
  );
}

/** On a card, in its own space: the progress bar along its foot, its spinner, its tick. */
const CARD_TRACK: [number, number, number] = [-0.202, 0.404, 0.105];
const CARD_STATUS: [number, number] = [-0.184, 0.076];
const CARD_CHECK: [number, number] = [0.19, -0.075];
const CARD_INK = '#1d1d22';
const CARD_MUTED = '#6b6a72';
const CARD_WORKING = '#d9531e';
const CARD_READY = '#16a34a';

/**
 * A card: what it is and its number, a short title, and what the agents are
 * doing with it, over the track its progress fills. No name and no face:
 * nobody is assigned, the agents just get on with it.
 */
function drawNightCard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  card: NightCard,
  status: CardStatus
) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#f7f6f2';
  roundRect(ctx, 0, 0, w, h, 16);
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = card.color;
  ctx.fillRect(0, 0, 12, h);
  ctx.restore();
  ctx.textBaseline = 'middle';
  // What kind of ticket, as a coloured badge, then its number.
  ctx.fillStyle = card.color;
  roundRect(ctx, 28, 20, 46, 46, 11);
  ctx.fill();
  drawGlyph(ctx, card.glyph, 51, 43, 15, '#ffffff');
  ctx.fillStyle = CARD_MUTED;
  ctx.font = `600 26px ${monoFamily}`;
  ctx.fillText(card.code, 88, 45);
  ctx.fillStyle = CARD_INK;
  ctx.font = `700 34px ${sansFamily}`;
  wrapText(ctx, card.title, w - 52, 2).forEach((line, i) => {
    ctx.fillText(line, 28, 104 + i * 40);
  });
  // Working, a spinner turns where the icon would be; it is drawn in 3D over this.
  if (status.mode === 'found') {
    drawGlyph(ctx, 'search', 46, 190, 12, CARD_MUTED);
  } else if (status.mode === 'ready') {
    ctx.strokeStyle = CARD_READY;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(36, 190);
    ctx.lineTo(43, 197);
    ctx.lineTo(56, 183);
    ctx.stroke();
  }
  ctx.font = `600 28px ${sansFamily}`;
  ctx.fillStyle = { found: CARD_MUTED, working: CARD_WORKING, ready: CARD_READY }[status.mode];
  ctx.fillText(status.text, 72, 191);
  ctx.fillStyle = '#e4e1da';
  roundRect(ctx, 28, 219, 404, 8, 4);
  ctx.fill();
}

/** A card's face, repainted only when what it says changes. */
function useNightCardFace(card: NightCard) {
  // Repainted as it changes, so it grows less than the still labels do.
  const scale = Math.min(1.5, textureScale(useDetailQuality()));
  const width = Math.round(NIGHT_CARD[0] * NIGHT_CARD_PX);
  const height = Math.round(NIGHT_CARD[2] * NIGHT_CARD_PX);
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    result.anisotropy = 4;
    return result;
  }, [width, height, scale]);
  useResourceDisposal(texture);
  const shown = useRef('');
  useEffect(() => {
    shown.current = '';
    // The site's fonts may come in after the first paint: paint again once they have.
    document.fonts?.ready.then(() => {
      shown.current = '';
    });
  }, [texture]);
  const paint = useCallback(
    (status: CardStatus) => {
      if (status.text === shown.current) {
        return;
      }
      const ctx = (texture.image as HTMLCanvasElement).getContext('2d');
      if (!ctx) {
        return;
      }
      shown.current = status.text;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      drawNightCard(ctx, width, height, card, status);
      texture.needsUpdate = true;
    },
    [texture, scale, width, height, card]
  );
  return { texture, paint };
}

type CardHandle = {
  group: RefObject<Group | null>;
  halo: RefObject<MeshBasicMaterial | null>;
  track: RefObject<Group | null>;
  spinner: RefObject<Mesh | null>;
  tick: RefObject<Mesh | null>;
  paint: (status: CardStatus) => void;
};

/** One ticket on the board; the board moves it and tells it what to say. */
function NightCardMesh({
  index,
  geometry,
  halo,
  check,
  register,
}: {
  index: number;
  geometry: BufferGeometry;
  halo: CanvasTexture;
  check: CanvasTexture;
  register: (index: number, handle: CardHandle) => void;
}) {
  const card = NIGHT_CARDS[index];
  const { texture, paint } = useNightCardFace(card);
  const group = useRef<Group>(null);
  const glow = useRef<MeshBasicMaterial>(null);
  const track = useRef<Group>(null);
  const spinner = useRef<Mesh>(null);
  const tick = useRef<Mesh>(null);
  useLayoutEffect(() => {
    register(index, { group, halo: glow, track, spinner, tick, paint });
  }, [register, index, paint]);
  const top = NIGHT_CARD[1] / 2;
  return (
    <group ref={group} visible={false}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color={PAPER} roughness={0.85} />
      </mesh>
      <mesh position={[0, top + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[NIGHT_CARD[0], NIGHT_CARD[2]]} />
        <meshStandardMaterial map={texture} transparent roughness={0.85} />
      </mesh>
      {/* Just turned up: a soft light round it. */}
      <mesh position={[0, -top, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[NIGHT_CARD[0] * 1.35, NIGHT_CARD[2] * 1.55]} />
        <meshBasicMaterial
          ref={glow}
          map={halo}
          color={SCAN_LIGHT}
          transparent
          opacity={0}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <group ref={track} position={[CARD_TRACK[0], top + 0.002, CARD_TRACK[2]]} visible={false}>
        <mesh position={[CARD_TRACK[1] / 2, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[CARD_TRACK[1], 0.008]} />
          <meshBasicMaterial color={CARD_WORKING} toneMapped={false} />
        </mesh>
      </group>
      <mesh
        ref={spinner}
        position={[CARD_STATUS[0], top + 0.003, CARD_STATUS[1]]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
      >
        <torusGeometry args={[0.012, 0.0026, 6, 24, Math.PI * 1.4]} />
        <meshBasicMaterial color={CARD_WORKING} toneMapped={false} />
      </mesh>
      <mesh
        ref={tick}
        position={[CARD_CHECK[0], top + 0.003, CARD_CHECK[1]]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
      >
        <planeGeometry args={[0.062, 0.062]} />
        <meshBasicMaterial map={check} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

/** The night bar: the moon and the time, the night going by along a track, and the sun at the end. */
function useNightBar() {
  // Repainted as the clock moves, so it grows less than the still labels do.
  const scale = Math.min(1.5, textureScale(useDetailQuality()));
  const width = Math.round(BAR_W * BAR_PX);
  const height = Math.round((BAR_V[1] - BAR_V[0]) * BAR_PX);
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    result.anisotropy = 4;
    return result;
  }, [width, height, scale]);
  useResourceDisposal(texture);
  const shown = useRef('');
  useEffect(() => {
    shown.current = '';
  }, [texture]);
  const paint = (t: number) => {
    // Eleven at night to six in the morning, ten minutes at a time.
    const steps = Math.min(42, Math.floor((t / DAWN) * 42));
    const minutes = (23 * 60 + steps * 10) % (24 * 60);
    const time = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    if (time === shown.current) {
      return;
    }
    shown.current = time;
    const ctx = (texture.image as HTMLCanvasElement).getContext('2d');
    if (!ctx) {
      return;
    }
    const dawn = steps === 42;
    const w = width;
    const h = height;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const sky = ctx.createLinearGradient(0, 0, w, 0);
    sky.addColorStop(0, '#0b0f1d');
    sky.addColorStop(1, dawn ? '#4a2f22' : '#111628');
    ctx.fillStyle = sky;
    roundRect(ctx, 0, 0, w, h, 16);
    ctx.fill();
    // The moon, a crescent cut from the sky.
    ctx.fillStyle = dawn ? '#5b6380' : '#ffd88a';
    ctx.beginPath();
    ctx.arc(40, h / 2, 19, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0b0f1d';
    ctx.beginPath();
    ctx.arc(50, h / 2 - 8, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ededeb';
    ctx.font = `600 44px ${monoFamily}`;
    ctx.textBaseline = 'middle';
    ctx.fillText(time, 76, h / 2 + 2);
    // Who is on tonight: agents, no names.
    ctx.fillStyle = dawn ? '#5b6380' : '#3fcf8e';
    ctx.beginPath();
    ctx.arc(244, h / 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#aab1c5';
    ctx.font = `600 28px ${sansFamily}`;
    ctx.fillText('2 agents', 260, h / 2 + 2);
    const from = 420;
    const to = 958;
    ctx.lineCap = 'round';
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#262d45';
    ctx.beginPath();
    ctx.moveTo(from, h / 2);
    ctx.lineTo(to, h / 2);
    ctx.stroke();
    for (let hour = 0; hour <= 7; hour += 1) {
      ctx.fillStyle = '#3a4362';
      ctx.beginPath();
      ctx.arc(from + ((to - from) * hour) / 7, h / 2, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    const at = from + ((to - from) * steps) / 42;
    const done = ctx.createLinearGradient(from, 0, to, 0);
    done.addColorStop(0, '#5b6cff');
    done.addColorStop(1, '#ffb547');
    ctx.strokeStyle = done;
    ctx.beginPath();
    ctx.moveTo(from, h / 2);
    ctx.lineTo(at, h / 2);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(at, h / 2, 10, 0, Math.PI * 2);
    ctx.fill();
    drawGlyph(ctx, 'sun', 1004, h / 2, 22, dawn ? '#ffc24a' : '#3a4362');
    texture.needsUpdate = true;
  };
  return { texture, paint };
}

/** Soft light, a rounded rectangle: round a new card, over a source as it is scanned, over the morning lane at dawn. */
function useNightHaloTexture() {
  return useLabelTexture(
    256,
    160,
    (ctx, w, h) => {
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 24;
      ctx.fillStyle = 'rgb(255 255 255 / 0.55)';
      roundRect(ctx, 30, 30, w - 60, h - 60, 14);
      ctx.fill();
    },
    'night-halo'
  );
}

/** A scan line: bright in the middle, fading out to either side. */
function useNightBeamTexture() {
  return useLabelTexture(
    64,
    8,
    (ctx, w, h) => {
      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, 'rgb(255 255 255 / 0)');
      gradient.addColorStop(0.45, 'rgb(255 255 255 / 0.5)');
      gradient.addColorStop(0.5, 'rgb(255 255 255 / 1)');
      gradient.addColorStop(0.55, 'rgb(255 255 255 / 0.5)');
      gradient.addColorStop(1, 'rgb(255 255 255 / 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    },
    'night-beam'
  );
}

/** Ready for me: a green tick. */
function useNightCheckTexture() {
  return useLabelTexture(
    64,
    64,
    (ctx, w, h) => {
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(19, 33);
      ctx.lineTo(28, 42);
      ctx.lineTo(45, 23);
      ctx.stroke();
    },
    'night-check'
  );
}

/** The wedge, in side view extruded across: underside, back, and the face sloping down to the ledge. */
function useBoardHousing() {
  const geometry = useMemo(() => {
    const d = BOARD_DEPTH / 2;
    const shape = new Shape();
    // Front to the left: once turned, the shape's x runs from the front of the desk to the back.
    shape.moveTo(-d, BOARD_FOOT);
    shape.lineTo(d, BOARD_FOOT);
    shape.lineTo(d, BOARD_FOOT + BOARD_LEDGE + BOARD_RISE);
    shape.lineTo(-d, BOARD_FOOT + BOARD_LEDGE);
    shape.closePath();
    const bevel = 0.03;
    const across = BOARD_W - 2 * bevel;
    const result = new ExtrudeGeometry(shape, {
      depth: across,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelOffset: -bevel,
      bevelSegments: 3,
      curveSegments: 1,
    });
    result.translate(0, 0, -across / 2);
    result.rotateY(Math.PI / 2);
    return result;
  }, []);
  useResourceDisposal(geometry);
  return geometry;
}

/**
 * The night shift: a kanban board that runs itself while I sleep. Agents
 * scan the code, the logs and the feedback; what they find comes out as a
 * ticket, which moves itself from to do to doing, says what is being done
 * with it, and ends in the morning lane, where it waits for me at six.
 */
function NightBoard({ still }: { still?: boolean }) {
  const housing = useBoardHousing();
  const face = useNightFaceTexture();
  const { texture: bar, paint } = useNightBar();
  const halo = useNightHaloTexture();
  const beamTexture = useNightBeamTexture();
  const check = useNightCheckTexture();
  const cardGeometry = useMemo(() => new RoundedBoxGeometry(...NIGHT_CARD, 2, 0.012), []);
  useResourceDisposal(cardGeometry);

  const cards = useRef<Array<CardHandle | undefined>>([]);
  const register = useCallback((index: number, handle: CardHandle) => {
    cards.current[index] = handle;
  }, []);
  const sweeps = useRef<Array<Mesh | null>>([]);
  const flashes = useRef<Array<MeshBasicMaterial | null>>([]);
  const morning = useRef<MeshBasicMaterial>(null);
  const spot = useMemo<Spot>(() => [0, 0, 0], []);
  const lit = useMemo(() => ({ scanned: [0, 0, 0], sweep: [0, 0, 0], across: [0, 0, 0] }), []);
  // Its own night, from when it arrives: the scene's clock starts over whenever the hero scrolls back in.
  const night = useRef(0);

  useFrame((_, delta) => {
    const dt = still ? 0 : Math.min(delta, 0.1);
    night.current = (night.current + dt) % NIGHT_S;
    const t = (NIGHT_OPENS + night.current) % NIGHT_S;
    paint(t);

    const { scanned, sweep, across } = lit;
    scanned.fill(0);
    sweep.fill(0);
    NIGHT_SCANS.forEach(([from, to, row]) => {
      if (t >= from && t <= to) {
        sweep[row] = within(t, from, to, 0.15);
        across[row] = (t - from) / (to - from);
      }
    });

    NIGHT_CARDS.forEach((card, i) => {
      const handle = cards.current[i];
      const group = handle?.group.current;
      if (!handle || !group) {
        return;
      }
      group.visible = t >= card.born;
      if (!group.visible) {
        return;
      }
      follow(card.keys, t, spot);
      group.position.set(spot[0], NIGHT_CARD[1] / 2 + 0.004 + spot[2], -spot[1]);
      // Moving, it tips a little towards where it is going.
      group.rotation.x = -(spot[2] / CARRY) * 0.04;
      const leave = 1 - smoothstep(CLEAR_AT + i * 0.08, CLEAR_AT + i * 0.08 + 0.4, t);
      group.scale.setScalar(
        Math.max(0.001, (0.3 + 0.7 * overshoot((t - card.born) / 0.4)) * leave)
      );
      const status = cardStatus(card, t);
      handle.paint(status);
      // Just found: a soft light round it, and a flash on the source it came out of.
      const fresh = Math.exp(-(t - card.born) * 2.2);
      const glow = handle.halo.current;
      if (glow) {
        glow.opacity = fresh * 0.6;
        glow.visible = fresh > 0.02;
      }
      scanned[card.row] = Math.max(scanned[card.row], Math.exp(-(t - card.born) * 5) * 0.8);
      const track = handle.track.current;
      if (track) {
        const progress = card.work
          ? Math.min(1, Math.max(0, (t - card.work[0]) / (card.work[1] - card.work[0])))
          : 0;
        track.visible = progress > 0;
        track.scale.x = Math.max(0.001, progress);
      }
      const spinner = handle.spinner.current;
      if (spinner) {
        spinner.visible = status.mode === 'working';
        spinner.rotation.z = -t * 7;
      }
      const tick = handle.tick.current;
      if (tick) {
        tick.visible = card.ready !== undefined && t >= card.ready;
        tick.scale.setScalar(card.ready !== undefined ? overshoot((t - card.ready) / 0.3) : 1);
      }
    });

    // A source being scanned: a line of light sweeps across it, left to right.
    sweeps.current.forEach((mesh, row) => {
      if (!mesh) {
        return;
      }
      mesh.visible = sweep[row] > 0.01;
      mesh.position.x = LANES[0].u + (across[row] * 2 - 1) * SWEEP;
      (mesh.material as MeshBasicMaterial).opacity = sweep[row] * 0.85;
      scanned[row] = Math.max(scanned[row], sweep[row] * 0.16);
    });
    flashes.current.forEach((flash, row) => {
      if (flash) {
        flash.opacity = scanned[row];
      }
    });
    if (morning.current) {
      morning.current.opacity =
        0.2 * smoothstep(DAWN - 0.4, DAWN + 0.6, t) * (1 - smoothstep(CLEAR_AT, CLEAR_AT + 0.6, t));
    }
  });

  const lanesMiddle = -(LANE_TOP + LANE_BOTTOM) / 2;
  return (
    <>
      <ConvexHullCollider args={[BOARD_HULL]} density={1.4} />
      <mesh geometry={housing} castShadow receiveShadow>
        <meshStandardMaterial color={BOARD_FRAME} roughness={0.4} metalness={0.35} />
      </mesh>
      {/* An accent stripe along the ledge. */}
      <mesh position={[0, BOARD_FOOT + BOARD_LEDGE / 2, BOARD_DEPTH / 2 + 0.002]}>
        <planeGeometry args={[BOARD_W - 0.16, 0.022]} />
        <meshBasicMaterial color={ACCENT} toneMapped={false} />
      </mesh>
      {/* Everything on the face, in the face's own space: across, out of it, and down it. */}
      <group
        position={[0, BOARD_FOOT + BOARD_LEDGE, BOARD_DEPTH / 2]}
        rotation={[Math.PI / 2 - BOARD_LEAN, 0, 0]}
      >
        <mesh
          position={[0, 0.003, -(BOARD_LIP + FACE_H / 2)]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[FACE_W, FACE_H]} />
          <meshStandardMaterial map={face} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.005, -(BAR_V[0] + BAR_V[1]) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[BAR_W, BAR_V[1] - BAR_V[0]]} />
          <meshBasicMaterial map={bar} transparent toneMapped={false} />
        </mesh>
        {SOURCES.map(({ title }, row) => (
          <group key={title}>
            <mesh position={[LANES[0].u, 0.006, -ROWS[row]]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[SOURCE[0] * 1.25, SOURCE[1] * 1.4]} />
              <meshBasicMaterial
                ref={(material) => {
                  flashes.current[row] = material;
                }}
                map={halo}
                color={SCAN_LIGHT}
                transparent
                opacity={0}
                depthWrite={false}
                blending={AdditiveBlending}
                toneMapped={false}
              />
            </mesh>
            <mesh
              ref={(mesh) => {
                sweeps.current[row] = mesh;
              }}
              position={[LANES[0].u, 0.012, -ROWS[row]]}
              rotation={[-Math.PI / 2, 0, 0]}
              visible={false}
            >
              <planeGeometry args={[0.05, SOURCE[1] - 0.02]} />
              <meshBasicMaterial
                map={beamTexture}
                color={SCAN_LIGHT}
                transparent
                opacity={0}
                depthWrite={false}
                blending={AdditiveBlending}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}
        <mesh position={[LANES[3].u, 0.006, lanesMiddle]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[LANES[3].w * 1.25, (LANE_TOP - LANE_BOTTOM) * 1.15]} />
          <meshBasicMaterial
            ref={morning}
            map={halo}
            color="#ffb547"
            transparent
            opacity={0}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
        {NIGHT_CARDS.map((card, i) => (
          <NightCardMesh
            key={card.code}
            index={i}
            geometry={cardGeometry}
            halo={halo}
            check={check}
            register={register}
          />
        ))}
      </group>
    </>
  );
}

/** `still`: frozen where its loop starts, for its still (only the night board moves through a story). */
export function PropMesh({ item, still }: { item: PropItem; still?: boolean }) {
  switch (item.info) {
    case 'oss':
      return <OpenSourceMark />;
    case 'server':
      return <RaspberryPi />;
    case 'sport':
      return <Treadmill />;
    case 'strategy':
      return <StrategyBoard />;
    case 'robot':
      return <Robot />;
    case 'flags':
      return <BilingualBubbles />;
    case 'night':
      return <NightBoard still={still} />;
    default:
      return <Mountain />;
  }
}
