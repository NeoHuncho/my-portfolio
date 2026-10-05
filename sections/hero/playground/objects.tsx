import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  CoefficientCombineRule,
  ConvexHullCollider,
  CuboidCollider,
  CylinderCollider,
  type RapierCollider,
  useRapier,
} from '@react-three/rapier';
import {
  AdditiveBlending,
  Box3,
  BufferAttribute,
  type BufferGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  DoubleSide,
  ExtrudeGeometry,
  type Group,
  LatheGeometry,
  type Mesh,
  type MeshBasicMaterial,
  MeshStandardMaterial,
  Plane,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  RepeatWrapping,
  Shape,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CLAUDE_PATH, CODEX_PATH } from '../brandMarks';
import { useDeskScreen } from './deskScreen';
import { type KeycapItem, type PropItem, ticketPool } from './items';
import { monoFamily, roundRect, sansFamily, useLabelTexture } from './labelTexture';

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
  return useMemo(() => {
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
      <RoundedBox args={[width, 0.42, width]} radius={0.11} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color="#e9e7e2" roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, 0.212, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
  return useMemo(() => {
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
}

/** A thin ring lying flat, shading from Claude's orange on one side to Codex's violet on the other. */
function useBlendRingGeometry(radius: number, tube: number) {
  return useMemo(() => {
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
  const claudeCollider = useRef<RapierCollider>(null);
  const codexCollider = useRef<RapierCollider>(null);
  const { world, rapier } = useRapier();
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
  // Side by side to start with, the way they first land.
  const orbit = useRef(0.2);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const since = (performance.now() - (shippedAt?.current ?? -Infinity)) / 1000;
    const flare = since >= 0 ? Math.exp(-since * 1.6) : 0;
    orbit.current += Math.min(delta, 0.1) * ((Math.PI * 2) / ORBIT_SECONDS) * (1 + 7 * flare);
    const a = orbit.current;
    // The marks' colliders follow them only while something could meet them: while the dock
    // moves, or something is in among the marks. Moving them wakes the dock, and a dock that
    // never sleeps keeps the whole scene drawing.
    const body = claudeCollider.current?.parent();
    let live = false;
    if (body) {
      const r = body.rotation();
      reach.turn.set(r.x, r.y, r.z, r.w);
      const at = body.translation();
      reach.centre
        .set(0, DOCK_BASE + DOCK_HEIGHT + 0.36, 0)
        .applyQuaternion(reach.turn)
        .add(at);
      const { x: vx, y: vy, z: vz } = body.linvel();
      const { x: wx, y: wy, z: wz } = body.angvel();
      live = !body.isSleeping() && Math.hypot(vx, vy, vz, wx, wy, wz) > 0.05;
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
      if (live && body.isSleeping()) {
        body.wakeUp();
      }
    }
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
      const collider = (i === 0 ? claudeCollider : codexCollider).current;
      if (live && collider) {
        collider.setTranslationWrtParent(mark.position);
        collider.setRotationWrtParent(reach.pose.setFromEuler(mark.rotation));
      }
    });
    if (rimRef.current) {
      rimRef.current.rotation.y = -a * 0.5;
    }
    if (glowRef.current) {
      glowRef.current.opacity = 0.55 + 0.12 * Math.sin(t * 1.3) + 0.4 * flare;
    }
  });

  const top = DOCK_BASE + DOCK_HEIGHT;
  return (
    <>
      {/* A plain cylinder for the dock, and one slab per mark that follows it round (above),
          nearly weightless, so moving them never shifts the dock's balance */}
      <CylinderCollider
        args={[DOCK_HEIGHT / 2, AGENT_DOCK_RADIUS]}
        position={[0, DOCK_BASE + DOCK_HEIGHT / 2, 0]}
      />
      {/* Slippery, so whatever lands on them slides off and is swept away instead of riding round */}
      <CuboidCollider
        ref={claudeCollider}
        args={CLAUDE_SLAB}
        density={0.01}
        friction={0}
        frictionCombineRule={CoefficientCombineRule.Min}
      />
      <CuboidCollider
        ref={codexCollider}
        args={CODEX_SLAB}
        density={0.01}
        friction={0}
        frictionCombineRule={CoefficientCombineRule.Min}
      />
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
        frictionCombineRule={CoefficientCombineRule.Min}
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
function useMountainGeometry(radius: number, height: number, seed: number): BufferGeometry {
  return useMemo(() => {
    let geometry: BufferGeometry = new ConeGeometry(radius, height, 96, 36);
    geometry.deleteAttribute('normal');
    geometry.deleteAttribute('uv');
    geometry = mergeVertices(geometry);
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
  }, [radius, height, seed]);
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
  useEffect(() => () => material.dispose(), [material]);
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
 * A flag hanging from a pole at x = 0 and flying out towards +x, its top edge
 * at y = 0, rippling in the wind: waves run from the pole to the free end and
 * grow as they go, and the cloth gathers a little where it bunches up.
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
  const rest = useMemo(
    () => Float32Array.from(geometry.getAttribute('position').array as Float32Array),
    [geometry]
  );
  const texture = useLabelTexture(Math.round(width * 400), Math.round(height * 400), draw, name);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const positions = geometry.getAttribute('position') as BufferAttribute;
    // Gusts come and go: the flag stands out further and flaps harder, then eases.
    const gust = 0.75 + 0.25 * Math.sin(t * 0.7) * Math.sin(t * 0.31 + 1);
    for (let i = 0; i < positions.count; i += 1) {
      const x = rest[i * 3];
      const y = rest[i * 3 + 1];
      // 0 at the pole, 1 at the free end; 0 along the top, 1 along the bottom.
      const along = x / width + 0.5;
      const down = 0.5 - y / height;
      const wave = along * Math.sin(along * 7.5 - t * 6.5 + down * 1.4);
      const flutter = along * along * Math.sin(along * 15 - t * 11 + down * 3);
      const z = width * gust * (0.09 * wave + 0.025 * flutter);
      positions.setXYZ(
        i,
        // Where it ripples it bunches up a little, so the cloth keeps its length.
        along * width * (1 - 0.05 * Math.abs(wave)),
        y - height / 2 - along * along * height * 0.12 * (1.1 - gust),
        z
      );
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial map={texture} roughness={0.8} side={DoubleSide} />
    </mesh>
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

/** Each speech bubble, without its tail, and how thick it is. */
const BUBBLE: [number, number, number] = [0.94, 0.18, 0.6];
const BUBBLE_CORNER = 0.17;
/** How far the tail reaches below the bubble. */
const BUBBLE_TAIL = 0.24;
/** The white rim round the printed flag, as a share of the face's height. */
const BUBBLE_RIM = 0.075;

/** A speech bubble's outline on the x/y plane: a rounded box, its tail at the bottom on `tail`'s side. */
function bubbleShape(w: number, d: number, tail: 1 | -1) {
  const r = BUBBLE_CORNER;
  // The tail's base along the bottom edge, inner end then outer, and its tip, leaning outwards.
  const inner = tail * (w / 2 - 0.46);
  const outer = tail * (w / 2 - 0.2);
  const tip = tail * (w / 2 - 0.08);
  const shape = new Shape();
  shape.moveTo(-w / 2 + r, -d / 2);
  const [first, second] = tail < 0 ? [outer, inner] : [inner, outer];
  shape.lineTo(first, -d / 2);
  if (tail < 0) {
    shape.quadraticCurveTo(first - 0.02, -d / 2 - BUBBLE_TAIL * 0.5, tip, -d / 2 - BUBBLE_TAIL);
    shape.quadraticCurveTo(second - 0.06, -d / 2 - BUBBLE_TAIL * 0.35, second, -d / 2);
  } else {
    shape.quadraticCurveTo(first + 0.06, -d / 2 - BUBBLE_TAIL * 0.35, tip, -d / 2 - BUBBLE_TAIL);
    shape.quadraticCurveTo(second + 0.02, -d / 2 - BUBBLE_TAIL * 0.5, second, -d / 2);
  }
  shape.lineTo(w / 2 - r, -d / 2);
  shape.absarc(w / 2 - r, -d / 2 + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(w / 2, d / 2 - r);
  shape.absarc(w / 2 - r, d / 2 - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-w / 2 + r, d / 2);
  shape.absarc(-w / 2 + r, d / 2 - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-w / 2, -d / 2 + r);
  shape.absarc(-w / 2 + r, -d / 2 + r, r, Math.PI, (Math.PI * 3) / 2, false);
  return shape;
}

/**
 * A chunky speech bubble lying flat, its underside on y = 0. The face is
 * mapped straight down from above, so the flag prints on top and the sides
 * pick up the white rim round it.
 */
function useBubbleGeometry(tail: 1 | -1) {
  return useMemo(() => {
    const [w, h, d] = BUBBLE;
    const bevel = 0.035;
    const geometry = new ExtrudeGeometry(bubbleShape(w, d, tail), {
      depth: h - bevel * 2,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 12,
    });
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(0, bevel, 0);
    const positions = geometry.getAttribute('position');
    const uv = geometry.getAttribute('uv');
    for (let i = 0; i < positions.count; i += 1) {
      uv.setXY(i, positions.getX(i) / w + 0.5, 0.5 - positions.getZ(i) / d);
    }
    geometry.computeVertexNormals();
    return geometry;
  }, [tail]);
}

/** The flag inside a white rim, with the bubble's rounded corners. */
function useBubbleTexture(draw: FlagDraw, name: string) {
  const [w, , d] = BUBBLE;
  return useLabelTexture(
    512,
    Math.round((512 * d) / w),
    (ctx, cw, ch) => {
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, cw, ch);
      const rim = ch * BUBBLE_RIM;
      ctx.save();
      roundRect(ctx, rim, rim, cw - rim * 2, ch - rim * 2, (BUBBLE_CORNER / d) * ch - rim);
      ctx.clip();
      ctx.translate(rim, rim);
      draw(ctx, cw - rim * 2, ch - rim * 2);
      ctx.restore();
    },
    `bubble-${name}`
  );
}

function SpeechBubble({ draw, name, tail }: { draw: FlagDraw; name: string; tail: 1 | -1 }) {
  const geometry = useBubbleGeometry(tail);
  const texture = useBubbleTexture(draw, name);
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial map={texture} roughness={0.4} />
    </mesh>
  );
}

/**
 * British and French: two speech bubbles in a conversation, one in each
 * language, the French one resting across the edge of the British one.
 */
function BilingualBubbles() {
  const base = -0.2;
  const [, h] = BUBBLE;
  return (
    <>
      <CuboidCollider args={[0.84, 0.17, 0.46]} position={[0, base + 0.17, 0.02]} />
      <group position={[-0.37, base, -0.1]} rotation={[0, 0.06, 0]}>
        <SpeechBubble draw={drawUnionJack} name="uk" tail={-1} />
      </group>
      {/* Its left edge up on the other bubble, its right edge down on the desk */}
      <group position={[0.38, base + h * 0.5, 0.15]} rotation={[0.02, -0.08, -0.2]}>
        <SpeechBubble draw={drawTricolore} name="fr" tail={1} />
      </group>
    </>
  );
}

const PORTRAIT_SRC = '/assets/about/profile.webp';
/** Same proportions as the photo (490 × 509). */
const PRINT: [number, number, number] = [1.18, 0.07, 1.226];
/** The darkest blue at the photo's edges, so the block's sides carry it on. */
const PRINT_EDGE = '#0d0a2c';

function usePortraitImage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => setImage(img);
    img.src = PORTRAIT_SRC;
    return () => {
      img.onload = null;
    };
  }, []);
  return image;
}

/** Me: the photo printed edge to edge on a thin block, nothing around it. */
function Portrait() {
  const photo = usePortraitImage();
  const texture = useLabelTexture(
    490,
    509,
    (ctx, w, h) => {
      // Rounded like the block's edges; the corners stay transparent.
      roundRect(ctx, 0, 0, w, h, 18);
      ctx.save();
      ctx.clip();
      ctx.fillStyle = PRINT_EDGE;
      ctx.fillRect(0, 0, w, h);
      if (photo) {
        ctx.drawImage(photo, 0, 0, w, h);
      }
      ctx.restore();
    },
    `portrait-${photo ? 'photo' : 'blank'}`
  );

  const [w, h, d] = PRINT;
  return (
    <>
      {/* A little thicker than the block, like the tickets, so things rest on it calmly */}
      <CuboidCollider args={[w / 2, 0.05, d / 2]} />
      <RoundedBox args={[w, h, d]} radius={0.03} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial color={PRINT_EDGE} roughness={0.35} />
      </RoundedBox>
      <mesh position={[0, h / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w - 0.03, d - 0.03]} />
        <meshStandardMaterial map={texture} alphaTest={0.5} roughness={0.4} />
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
  return useMemo(() => {
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

/** The night line's bed: length along the belt, height, depth. */
const LINE_BED: [number, number, number] = [2, 0.2, 0.62];
const LINE_TOP = LINE_BED[1] / 2;
const LINE_FRAME = '#d9dce3';
const LINE_TRIM = '#eef0f3';
const LINE_DARK = '#2b2e36';
/** Where things sit along the line: the to-do hopper, the belt, the done tray, and the two agents' stops. */
const HOPPER: [number, number] = [-1, -0.6];
const BELT_SPAN: [number, number] = [-0.66, 0.58];
const TRAY: [number, number] = [0.6, 0.98];
const STATIONS = [-0.19, 0.19];
const CARD: [number, number, number] = [0.3, 0.02, 0.2];
/** The gantry over the belt: its posts' height, and the beam the agents hang from. */
const GANTRY_Y = 0.74;
const BEAM: [number, number, number] = [0.72, 0.07, 0.12];
/** Where each agent's head rests, and how far it comes down to work on a ticket. */
const HEAD_Y = GANTRY_Y - 0.22;
const HEAD_DROP = 0.15;
/** A night: each ticket rides in, is worked on under its agent, and rides on to the tray. */
const NIGHT_TICKETS = 4;
const INTERVAL = 2.6;
const RIDE_IN = 1.1;
const WORK = 1.4;
const RIDE_OUT = 1;
const CLEAR_AT = 12.6;
const NIGHT_LOOP = 13.6;
const BELT_SPEED = 0.45;
const AGENT_COLORS = [CLAUDE_ORANGE, CODEX_VIOLET];

/** Where ticket `i` is, `t` seconds into the night, and whether its agent is done with it. */
function lineCardAt(i: number, t: number) {
  const station = STATIONS[i % 2];
  const start = i * INTERVAL;
  const local = t - start;
  const cardY = LINE_TOP + CARD[1] / 2 + 0.002;
  const enter = HOPPER[1] - CARD[0] / 2;
  if (local < 0) {
    // Still in the hopper.
    return { x: (HOPPER[0] + HOPPER[1]) / 2, y: cardY, scale: 0, working: 0, done: false };
  }
  if (local < RIDE_IN) {
    const f = smoothstep(0, RIDE_IN, local);
    return { x: enter + (station - enter) * f, y: cardY, scale: 1, working: 0, done: false };
  }
  if (local < RIDE_IN + WORK) {
    const w = (local - RIDE_IN) / WORK;
    return { x: station, y: cardY, scale: 1, working: Math.sin(Math.PI * w), done: w > 0.7 };
  }
  // Rides on, then drops onto the pile in the tray.
  const trayX = (TRAY[0] + TRAY[1]) / 2;
  const f = smoothstep(0, RIDE_OUT, local - RIDE_IN - WORK);
  const pile = LINE_TOP + 0.02 + CARD[1] / 2 + i * (CARD[1] + 0.004);
  let scale = 1;
  if (t >= CLEAR_AT) {
    scale = 1 - smoothstep(CLEAR_AT, CLEAR_AT + 0.6, t);
  }
  return {
    x: station + (trayX - station) * f,
    y:
      cardY +
      (pile - cardY) * smoothstep(0.6, 1, f) +
      Math.sin(Math.PI * smoothstep(0.55, 1, f)) * 0.06,
    scale,
    working: 0,
    done: true,
  };
}

/** Chevrons along the belt, pointing the way it runs. */
function useLineBeltTexture() {
  const belt = useLabelTexture(
    256,
    128,
    (ctx, w, h) => {
      ctx.fillStyle = LINE_DARK;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#4a4f5c';
      ctx.lineWidth = 14;
      ctx.lineJoin = 'round';
      [0, w / 2].forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(x + 40, 18);
        ctx.lineTo(x + 92, h / 2);
        ctx.lineTo(x + 40, h - 18);
        ctx.stroke();
      });
    },
    'night-belt'
  );
  useEffect(() => {
    belt.wrapS = RepeatWrapping;
    belt.repeat.x = 3;
    belt.needsUpdate = true;
  }, [belt]);
  return belt;
}

/** The hopper's lid: a crescent and the night's queue. */
function useHopperTexture() {
  return useLabelTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = LINE_TRIM;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#e3a72f';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 62, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = LINE_TRIM;
      ctx.beginPath();
      ctx.arc(w / 2 + 34, h / 2 - 22, 56, 0, Math.PI * 2);
      ctx.fill();
    },
    'night-hopper'
  );
}

/** The gantry's little screen: the time through the night, and the night's tickets, done in green. */
function useLineScreen() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 128;
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    result.anisotropy = 4;
    return result;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  const shown = useRef('');
  const paint = (t: number) => {
    // Eleven at night to six in the morning, over one loop.
    const minutes = (23 * 60 + Math.floor((t / NIGHT_LOOP) * 7 * 60)) % (24 * 60);
    const time = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String((Math.floor(minutes / 10) * 10) % 60).padStart(2, '0')}`;
    const done = Array.from({ length: NIGHT_TICKETS }, (_, i) => lineCardAt(i, t).done);
    const key = `${time}${done.join()}`;
    if (key === shown.current) {
      return;
    }
    shown.current = key;
    const ctx = (texture.image as HTMLCanvasElement).getContext('2d');
    if (!ctx) {
      return;
    }
    const { width: w, height: h } = ctx.canvas;
    ctx.fillStyle = '#0b0d12';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffd88a';
    ctx.beginPath();
    ctx.arc(38, 46, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0b0d12';
    ctx.beginPath();
    ctx.arc(48, 38, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ededeb';
    ctx.font = `600 44px ${monoFamily}`;
    ctx.textBaseline = 'middle';
    ctx.fillText(time, 72, 49);
    done.forEach((d, i) => {
      ctx.fillStyle = d ? '#3fcf8e' : '#2a2e39';
      roundRect(ctx, 22 + i * 72, 92, 62, 14, 7);
      ctx.fill();
    });
    texture.needsUpdate = true;
  };
  return { texture, paint };
}

/**
 * The night shift: a small automated line. Tickets ride out of the to-do
 * hopper on a belt, stop under one of two agents, in Claude's and Codex's
 * colours, which come down and work on them, then ride on to the done tray.
 * By morning the tray is cleared and the next night's queue comes in.
 */
function NightLine() {
  const belt = useLineBeltTexture();
  const hopper = useHopperTexture();
  const { texture: screen, paint } = useLineScreen();
  const cards = useRef<Array<Group | null>>([]);
  const checks = useRef<Array<Mesh | null>>([]);
  const heads = useRef<Array<Group | null>>([]);
  const lights = useRef<Array<MeshBasicMaterial | null>>([]);
  const beams = useRef<Array<Mesh | null>>([]);
  const beacon = useRef<MeshBasicMaterial>(null);
  const [L, , D] = LINE_BED;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime % NIGHT_LOOP;
    belt.offset.x =
      -((clock.elapsedTime * BELT_SPEED * belt.repeat.x) / (BELT_SPAN[1] - BELT_SPAN[0])) % 1;
    const working = [0, 0];
    cards.current.forEach((card, i) => {
      if (!card) {
        return;
      }
      const at = lineCardAt(i, t);
      card.position.set(at.x, at.y, 0);
      card.scale.setScalar(Math.max(0.001, at.scale));
      working[i % 2] = Math.max(working[i % 2], at.working);
      checks.current[i]?.scale.setScalar(at.done ? 1 : 0.001);
    });
    heads.current.forEach((head, a) => {
      if (head) {
        head.position.y = HEAD_Y - working[a] * HEAD_DROP;
      }
      const light = lights.current[a];
      if (light) {
        light.opacity = 0.45 + 0.55 * working[a];
      }
      const beam = beams.current[a];
      if (beam) {
        beam.visible = working[a] > 0.05;
        beam.scale.set(1, Math.max(0.001, working[a]), 1);
      }
    });
    if (beacon.current) {
      const busy = working[0] + working[1] > 0.05;
      beacon.current.opacity = busy ? 0.55 + 0.45 * Math.sin(clock.elapsedTime * 10) : 0.35;
    }
    paint(t);
  });

  return (
    <>
      {/* The bed is heavy, so the line stands back up on its own; the gantry is light. */}
      <CuboidCollider args={[L / 2, LINE_BED[1] / 2, D / 2]} density={4} />
      <CuboidCollider
        args={[(HOPPER[1] - HOPPER[0]) / 2, 0.11, D / 2]}
        position={[(HOPPER[0] + HOPPER[1]) / 2, LINE_TOP + 0.11, 0]}
        density={0.5}
      />
      {/* The gantry as one block, posts to beam over the agents' heads, so nothing slips under it. */}
      <CuboidCollider
        args={[BEAM[0] / 2, (GANTRY_Y + BEAM[1] / 2 - LINE_TOP) / 2, (D / 2 + 0.11) / 2]}
        position={[0, (GANTRY_Y + BEAM[1] / 2 + LINE_TOP) / 2, (0.11 - D / 2) / 2]}
        density={0.2}
      />
      {/* The mast, the night clock tilted back on it, and the beacon. */}
      <CuboidCollider
        args={[0.03, 0.1, 0.03]}
        position={[0, GANTRY_Y + 0.12, -D / 2 + 0.04]}
        density={0.1}
      />
      <CuboidCollider
        args={[0.28, 0.125, 0.025]}
        position={[
          0,
          GANTRY_Y + 0.22 + 0.12 * Math.cos(0.75),
          -D / 2 + 0.04 - 0.12 * Math.sin(0.75),
        ]}
        rotation={[-0.75, 0, 0]}
        density={0.1}
      />
      <CuboidCollider
        args={[0.03, 0.08, 0.03]}
        position={[BEAM[0] / 2 - 0.03, GANTRY_Y + BEAM[1] / 2 + 0.08, -D / 2 + 0.04]}
        density={0.1}
      />
      <RoundedBox args={LINE_BED} radius={0.035} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color={LINE_FRAME} roughness={0.4} metalness={0.35} />
      </RoundedBox>
      {/* An accent stripe down the front, and dark feet. */}
      <mesh position={[0, -0.02, D / 2 + 0.001]}>
        <planeGeometry args={[L - 0.1, 0.035]} />
        <meshBasicMaterial color={ACCENT} toneMapped={false} />
      </mesh>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh
            key={`${sx}${sz}`}
            position={[sx * (L / 2 - 0.1), -LINE_BED[1] / 2 - 0.03, sz * (D / 2 - 0.08)]}
          >
            <boxGeometry args={[0.1, 0.06, 0.1]} />
            <meshStandardMaterial color={LINE_DARK} roughness={0.6} />
          </mesh>
        ))
      )}
      {/* The belt, with a roller at each end. */}
      <mesh
        position={[(BELT_SPAN[0] + BELT_SPAN[1]) / 2, LINE_TOP + 0.002, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[BELT_SPAN[1] - BELT_SPAN[0], D - 0.12]} />
        <meshStandardMaterial map={belt} roughness={0.85} />
      </mesh>
      {BELT_SPAN.map((x) => (
        <mesh key={x} position={[x, LINE_TOP, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, D - 0.1, 12]} />
          <meshStandardMaterial color="#9a9da6" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {[-1, 1].map((sz) => (
        <mesh key={sz} position={[0, LINE_TOP + 0.02, sz * (D / 2 - 0.03)]} castShadow>
          <boxGeometry args={[L - 0.08, 0.04, 0.04]} />
          <meshStandardMaterial color={LINE_TRIM} roughness={0.35} metalness={0.4} />
        </mesh>
      ))}

      {/* The to-do hopper, cards slide out from under it. */}
      <RoundedBox
        args={[HOPPER[1] - HOPPER[0], 0.22, D]}
        radius={0.03}
        smoothness={3}
        position={[(HOPPER[0] + HOPPER[1]) / 2, LINE_TOP + 0.11, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={LINE_TRIM} roughness={0.4} metalness={0.25} />
      </RoundedBox>
      <mesh
        position={[(HOPPER[0] + HOPPER[1]) / 2, LINE_TOP + 0.222, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.28, 0.28]} />
        <meshBasicMaterial map={hopper} toneMapped={false} />
      </mesh>
      {/* The done tray: a low lip round the end of the bed. */}
      {[
        { at: [TRAY[1] - 0.01, 0.02, 0], size: [0.02, 0.04, D - 0.1] },
        {
          at: [(TRAY[0] + TRAY[1]) / 2, 0.02, D / 2 - 0.05],
          size: [TRAY[1] - TRAY[0], 0.04, 0.02],
        },
        {
          at: [(TRAY[0] + TRAY[1]) / 2, 0.02, -D / 2 + 0.05],
          size: [TRAY[1] - TRAY[0], 0.04, 0.02],
        },
      ].map(({ at, size }) => (
        <mesh key={at.join()} position={[at[0], LINE_TOP + at[1], at[2]]} castShadow>
          <boxGeometry args={size as [number, number, number]} />
          <meshStandardMaterial color="#3fcf8e" roughness={0.4} />
        </mesh>
      ))}

      {/* The gantry: a post at each end of the beam, the night clock on a mast behind, and a beacon. */}
      {[-1, 1].map((sx) => (
        <mesh
          key={sx}
          position={[sx * (BEAM[0] / 2 - 0.03), (LINE_TOP + GANTRY_Y) / 2, -D / 2 + 0.04]}
          castShadow
        >
          <boxGeometry args={[0.06, GANTRY_Y - LINE_TOP, 0.06]} />
          <meshStandardMaterial color={LINE_FRAME} roughness={0.4} metalness={0.35} />
        </mesh>
      ))}
      <RoundedBox
        args={[BEAM[0], BEAM[1], D / 2 + 0.04]}
        radius={0.025}
        smoothness={3}
        position={[0, GANTRY_Y, -D / 4 + 0.02]}
        castShadow
      >
        <meshStandardMaterial color={LINE_TRIM} roughness={0.35} metalness={0.3} />
      </RoundedBox>
      <mesh position={[0, GANTRY_Y + 0.12, -D / 2 + 0.04]} castShadow>
        <boxGeometry args={[0.05, 0.2, 0.05]} />
        <meshStandardMaterial color={LINE_FRAME} roughness={0.4} metalness={0.35} />
      </mesh>
      <group position={[0, GANTRY_Y + 0.22, -D / 2 + 0.04]} rotation={[-0.75, 0, 0]}>
        <mesh position={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[0.56, 0.25, 0.035]} />
          <meshStandardMaterial color={LINE_DARK} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.12, 0.019]}>
          <planeGeometry args={[0.52, 0.21]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
      </group>
      <group position={[BEAM[0] / 2 - 0.03, GANTRY_Y + BEAM[1] / 2, -D / 2 + 0.04]}>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.1, 14]} />
          <meshBasicMaterial color="#3fcf8e" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.06, 14]} />
          <meshBasicMaterial ref={beacon} color={ACCENT} transparent toneMapped={false} />
        </mesh>
      </group>

      {/* The two agents hanging from the beam, each lit in its own colour. */}
      {AGENT_COLORS.map((color, a) => (
        <group key={color.getHexString()} position={[STATIONS[a], 0, 0]}>
          <mesh position={[0, (GANTRY_Y + HEAD_Y) / 2, 0]}>
            <cylinderGeometry args={[0.018, 0.018, GANTRY_Y - HEAD_Y, 8]} />
            <meshStandardMaterial color="#9a9da6" metalness={0.6} roughness={0.3} />
          </mesh>
          <group
            ref={(head) => {
              heads.current[a] = head;
            }}
            position={[0, HEAD_Y, 0]}
          >
            <RoundedBox args={[0.2, 0.1, 0.2]} radius={0.03} smoothness={2} castShadow>
              <meshStandardMaterial color={color} roughness={0.45} metalness={0.1} />
            </RoundedBox>
            <mesh position={[0, -0.051, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.07, 20]} />
              <meshBasicMaterial
                ref={(light) => {
                  lights.current[a] = light;
                }}
                color={color}
                transparent
                toneMapped={false}
                side={DoubleSide}
              />
            </mesh>
            {/* The light it works by, down onto the ticket. */}
            <group position={[0, -0.051, 0]}>
              <mesh
                ref={(beam) => {
                  beams.current[a] = beam;
                }}
                position={[0, -0.09, 0]}
                visible={false}
              >
                <coneGeometry args={[0.13, 0.18, 20, 1, true]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={0.3}
                  depthWrite={false}
                  blending={AdditiveBlending}
                  side={DoubleSide}
                  toneMapped={false}
                />
              </mesh>
            </group>
          </group>
        </group>
      ))}

      {/* The night's tickets. */}
      {ticketPool.slice(0, NIGHT_TICKETS).map(({ code, color }, i) => (
        <group
          key={code}
          ref={(card) => {
            cards.current[i] = card;
          }}
          scale={0.001}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={CARD} />
            <meshStandardMaterial color={PAPER} roughness={0.85} />
          </mesh>
          <mesh
            position={[-CARD[0] / 2 + 0.03, CARD[1] / 2 + 0.001, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.025, CARD[2] - 0.04]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
          {[0.035, -0.01].map((z, line) => (
            <mesh key={z} position={[0.0, CARD[1] / 2 + 0.001, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[line === 0 ? 0.13 : 0.09, 0.014]} />
              <meshBasicMaterial color="#c9c5bb" toneMapped={false} />
            </mesh>
          ))}
          <mesh
            ref={(check) => {
              checks.current[i] = check;
            }}
            position={[CARD[0] / 2 - 0.045, CARD[1] / 2 + 0.002, -0.04]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[0.028, 16]} />
            <meshBasicMaterial color="#3fcf8e" toneMapped={false} />
          </mesh>
        </group>
      ))}
    </>
  );
}

export function PropMesh({ item }: { item: PropItem }) {
  switch (item.info) {
    case 'oss':
      return <OpenSourceMark />;
    case 'server':
      return <RaspberryPi />;
    case 'sport':
      return <Treadmill />;
    case 'portrait':
      return <Portrait />;
    case 'robot':
      return <Robot />;
    case 'flags':
      return <BilingualBubbles />;
    case 'night':
      return <NightLine />;
    default:
      return <Mountain />;
  }
}
