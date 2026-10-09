import {
  createContext,
  type JSX,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  BackSide,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DynamicDrawUsage,
  ExtrudeGeometry,
  type Group,
  type InstancedMesh,
  LatheGeometry,
  type Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  ShaderLib,
  ShaderMaterial,
  ShadowMaterial,
  Shape,
  TorusGeometry,
  UniformsUtils,
  Vector2,
  Vector3,
} from 'three';

/** Values the desk drives every frame; the pipe only reads them. */
export type PipeDrive = {
  /** Nothing at zero; the mouth stands just above the desk at one. */
  presence: number;
  /** Six overlapping leaves cover the mouth at zero and clear it at one. */
  aperture: number;
  /** The platform's top, from -depth up to the desk at world y = 0. */
  platform: number;
  /** Seconds since the iris began venting; negative while the hatch is only previewed. */
  ventTime: number;
  /** When new puffs stop; those already out finish drifting across the desk. */
  ventEnd: number | null;
};

const MAX_HOLES = 12;
const BLADES = 6;
const FLOOR_SIZE = 80;
const MASK_ORDER = -1000;

const holeDeclarations = /* glsl */ `
  uniform vec3 pipeHoles[${MAX_HOLES}];
  varying vec2 vPipeFloor;
`;

const discardHoles = /* glsl */ `
  for (int i = 0; i < ${MAX_HOLES}; i++) {
    vec3 hole = pipeHoles[i];
    vec2 offset = vPipeFloor - hole.xy;
    if (hole.z > 0.0 && dot(offset, offset) < hole.z * hole.z) discard;
  }
`;

const glowVertex = /* glsl */ `
  varying vec2 vPipeUv;
  varying vec3 vPipeTint;

  void main() {
    vPipeUv = uv;
    vPipeTint = vec3(1.0);
    vec4 point = vec4(position, 1.0);
    #ifdef USE_INSTANCING
      point = instanceMatrix * point;
    #endif
    #ifdef USE_INSTANCING_COLOR
      vPipeTint = instanceColor;
    #endif
    gl_Position = projectionMatrix * modelViewMatrix * point;
  }
`;

/** The shared metal finish stays fully opaque; the desk mask hides it geometrically. */
function metal(color: string, roughness: number, metalness: number): ShaderMaterial {
  const uniforms = UniformsUtils.clone(ShaderLib.standard.uniforms);
  uniforms.diffuse.value = new Color(color);
  uniforms.roughness.value = roughness;
  uniforms.metalness.value = metalness;
  return new ShaderMaterial({
    uniforms,
    vertexShader: ShaderLib.standard.vertexShader,
    fragmentShader: ShaderLib.standard.fragmentShader,
    lights: true,
  });
}

function glow(soft: boolean): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      color: { value: new Color('#ff6b35') },
      opacity: { value: 0 },
    },
    vertexShader: glowVertex,
    fragmentShader: /* glsl */ `
      uniform vec3 color;
      uniform float opacity;
      varying vec2 vPipeUv;
      varying vec3 vPipeTint;

      void main() {
        float strength = 1.0;
        ${soft ? 'strength = 0.16 * pow(1.0 - smoothstep(0.0, 1.0, length(vPipeUv - 0.5) * 2.0), 2.0);' : ''}
        gl_FragColor = vec4(color * vPipeTint, opacity * strength);
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    toneMapped: false,
  });
}

/** A low beveled flange, swept shutter leaves and a deep drum, with light kept to thin seams. */
function makeParts() {
  const flange = new LatheGeometry(
    [
      [1, -0.05],
      [1.13, -0.05],
      [1.15, -0.026],
      [1.15, 0.005],
      [1.135, 0.041],
      [1.105, 0.06],
      [1.03, 0.06],
      [1.014, 0.054],
      [1, 0.034],
      [1, -0.05],
    ].map(([r, y]) => new Vector2(r, y)),
    80
  );
  const leaf = new Shape();
  leaf.moveTo(-0.13, -0.1);
  leaf.quadraticCurveTo(0.16, -0.23, 0.75, -0.98);
  leaf.quadraticCurveTo(1.15, -1.13, 1.44, -0.28);
  leaf.quadraticCurveTo(1.59, 0.53, 0.92, 1.16);
  leaf.quadraticCurveTo(0.41, 0.54, -0.13, 0.1);
  leaf.quadraticCurveTo(-0.19, 0, -0.13, -0.1);
  const blade = new ExtrudeGeometry(leaf, {
    depth: 0.007,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.002,
    bevelSegments: 2,
    steps: 1,
    curveSegments: 12,
  });
  blade.rotateX(-Math.PI / 2);
  const platform = new LatheGeometry(
    [
      [0, -0.052],
      [0.928, -0.052],
      [0.944, -0.04],
      [0.944, -0.012],
      [0.932, 0],
      [0, 0],
    ].map(([r, y]) => new Vector2(r, y)),
    80
  );
  const floor = new PlaneGeometry(FLOOR_SIZE, FLOOR_SIZE);
  floor.rotateX(-Math.PI / 2);
  const disc = new CircleGeometry(1, 72);
  disc.rotateX(-Math.PI / 2);
  const ring = new TorusGeometry(1, 0.006, 6, 80);
  ring.rotateX(-Math.PI / 2);
  const finish = metal('#26272e', 0.38, 0.55);
  const shutter = metal('#363944', 0.36, 0.65);
  const wall = metal('#0b0d14', 0.62, 0.35);
  wall.side = BackSide;
  const base = metal('#080a10', 0.8, 0.2);
  return {
    flange,
    blade,
    platform,
    floor,
    disc,
    ring,
    bolt: new CylinderGeometry(0.017, 0.017, 0.004, 6),
    shaft: new CylinderGeometry(1, 1, 1, 72, 1, true),
    finish,
    lip: new MeshBasicMaterial({ color: '#807870', toneMapped: false }),
    shutter,
    wall,
    base,
    light: glow(false),
    wash: glow(true),
  };
}

type HoleRegistry = {
  uniform: { value: Vector3[] };
  occupied: boolean[];
  parts: ReturnType<typeof makeParts>;
};

const HoleContext = createContext<HoleRegistry | null>(null);

function useHoles(): HoleRegistry {
  const holes = useContext(HoleContext);
  if (!holes) {
    throw new Error('PipeExit and HoleyShadowFloor must be inside PipeHoles');
  }
  return holes;
}

/** One invisible desk for all the mouths: anything below it only shows through their holes. */
export function PipeHoles({ children }: { children: ReactNode }): JSX.Element {
  const registry = useMemo<HoleRegistry>(
    () => ({
      uniform: { value: Array.from({ length: MAX_HOLES }, () => new Vector3()) },
      occupied: Array.from({ length: MAX_HOLES }, () => false),
      parts: makeParts(),
    }),
    []
  );
  const mask = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { pipeHoles: registry.uniform },
        vertexShader: /* glsl */ `
          varying vec2 vPipeFloor;
          void main() {
            vPipeFloor = (modelMatrix * vec4(position, 1.0)).xz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          ${holeDeclarations}
          void main() {
            ${discardHoles}
            gl_FragColor = vec4(0.0);
          }
        `,
        colorWrite: false,
        depthWrite: true,
        toneMapped: false,
      }),
    [registry]
  );
  useEffect(
    () => () => {
      mask.dispose();
      Object.values(registry.parts).forEach((part) => part.dispose());
    },
    [mask, registry]
  );
  return (
    <HoleContext.Provider value={registry}>
      <group renderOrder={MASK_ORDER} dispose={null}>
        <mesh
          position={[0, -0.001, 0]}
          geometry={registry.parts.floor}
          material={mask}
          renderOrder={MASK_ORDER}
          raycast={() => null}
        />
      </group>
      {children}
    </HoleContext.Provider>
  );
}

/** The same shadow catcher as the desk, except a shadow cannot cover an open mouth. */
export function HoleyShadowFloor({ opacity = 0.4 }: { opacity?: number }): JSX.Element {
  const { uniform, parts } = useHoles();
  const invalidate = useThree((state) => state.invalidate);
  const material = useMemo(() => {
    const shadow = new ShadowMaterial({ depthWrite: false });
    shadow.onBeforeCompile = (shader) => {
      shader.uniforms.pipeHoles = uniform;
      shader.vertexShader = shader.vertexShader
        .replace('void main() {', 'varying vec2 vPipeFloor;\nvoid main() {')
        .replace(
          '#include <worldpos_vertex>',
          '#include <worldpos_vertex>\nvPipeFloor = (modelMatrix * vec4(transformed, 1.0)).xz;'
        );
      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `${holeDeclarations}\nvoid main() {\n${discardHoles}`
      );
    };
    shadow.customProgramCacheKey = () => 'pipe-shadow-floor-12';
    return shadow;
  }, [uniform]);
  useLayoutEffect(() => {
    material.opacity = opacity;
    invalidate();
  }, [material, opacity, invalidate]);
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh
      geometry={parts.floor}
      material={material}
      receiveShadow
      dispose={null}
      raycast={() => null}
    />
  );
}

/** Where the piece from the tray will land: the shutter opens, then its platform brings it up. */
export function PipeExit({
  position,
  radius,
  depth,
  drive,
}: {
  position: [number, number, number];
  radius: number;
  depth: number;
  drive: RefObject<PipeDrive>;
}): JSX.Element {
  const registry = useHoles();
  const { parts } = registry;
  const invalidate = useThree((state) => state.invalidate);
  const root = useRef<Group>(null);
  const mouth = useRef<Group>(null);
  const platform = useRef<Mesh>(null);
  const wash = useRef<Mesh>(null);
  const blades = useRef<InstancedMesh>(null);
  const bolts = useRef<InstancedMesh>(null);
  const rings = useRef<InstancedMesh>(null);
  const hole = useRef<Vector3 | null>(null);
  const shown = useRef({ presence: 0, aperture: -1, platform: Infinity });
  const scratch = useMemo(() => ({ transform: new Object3D(), centre: new Vector3() }), []);
  const prepareGlow = useCallback<Mesh['onBeforeRender']>(
    (_renderer, _scene, _camera, _geometry, material) => {
      if (material instanceof ShaderMaterial) {
        material.uniforms.opacity.value = shown.current.presence;
        material.uniformsNeedUpdate = true;
      }
    },
    []
  );

  useLayoutEffect(() => {
    const slot = registry.occupied.indexOf(false);
    if (slot < 0) {
      throw new Error(`PipeHoles supports at most ${MAX_HOLES} mounted pipes`);
    }
    registry.occupied[slot] = true;
    const entry = registry.uniform.value[slot];
    hole.current = entry;
    invalidate();
    return () => {
      entry.set(0, 0, 0);
      registry.occupied[slot] = false;
      hole.current = null;
      invalidate();
    };
  }, [registry, invalidate]);

  useLayoutEffect(() => {
    const fasteners = bolts.current;
    const leaves = blades.current;
    const lights = rings.current;
    const { transform } = scratch;
    const tint = new Color();
    if (fasteners) {
      for (let i = 0; i < BLADES; i++) {
        const angle = (i / BLADES) * Math.PI * 2;
        transform.position.set(Math.cos(angle) * 1.075, 0.061, Math.sin(angle) * 1.075);
        transform.rotation.set(0, -angle, 0);
        transform.scale.set(1, 1, 1);
        transform.updateMatrix();
        fasteners.setMatrixAt(i, transform.matrix);
      }
      fasteners.instanceMatrix.needsUpdate = true;
    }
    if (leaves) {
      leaves.instanceMatrix.setUsage(DynamicDrawUsage);
      [1, 0.93, 0.97, 0.9, 0.95, 0.88].forEach((shade, i) => {
        tint.setRGB(shade, shade, shade);
        leaves.setColorAt(i, tint);
      });
    }
    if (lights) {
      lights.instanceMatrix.setUsage(DynamicDrawUsage);
      [0.55, 0.2, 0.14, 0.85].forEach((strength, i) => {
        tint.setRGB(strength, strength, strength);
        lights.setColorAt(i, tint);
      });
    }
    return () => {
      fasteners?.dispose();
      leaves?.dispose();
      lights?.dispose();
    };
  }, [parts, scratch]);

  // The caller can drive at priority -1, before these values are read at the normal frame priority.
  useFrame(() => {
    const pipe = root.current;
    const flange = mouth.current;
    const leaves = blades.current;
    const lights = rings.current;
    const entry = hole.current;
    if (!pipe || !flange || !leaves || !lights || !entry) {
      return;
    }
    const values = drive.current;
    const presence = Math.max(0, Math.min(1, values.presence));
    // A little extra travel lets the shutter catch its stop, then settle back into place.
    const aperture = Math.max(0, Math.min(1.05, values.aperture));
    const top = Math.max(-depth, Math.min(0, values.platform));
    const previous = shown.current;
    const moving =
      presence !== previous.presence || aperture !== previous.aperture || top !== previous.platform;
    previous.presence = presence;
    previous.aperture = aperture;
    previous.platform = top;
    pipe.getWorldPosition(scratch.centre);
    // Both the depth mask and shadow catcher read this same shrinking mouth.
    const emerge = presence * presence * (3 - 2 * presence);
    entry.set(scratch.centre.x, scratch.centre.z, radius * emerge);
    pipe.visible = presence > 0;
    if (presence === 0) {
      if (moving) {
        invalidate();
      }
      return;
    }

    const sink = -0.115 * (1 - presence);
    flange.position.y = sink;
    flange.scale.set(emerge, 1, emerge);
    if (platform.current) {
      // At desk height the platform is above the mask, so it also shrinks and sinks.
      platform.current.position.y = top - scratch.centre.y + sink;
      platform.current.scale.set(emerge, 1, emerge);
    }
    if (wash.current) {
      wash.current.position.y = top - scratch.centre.y + sink + 0.003;
      wash.current.scale.set(0.86 * emerge, 1, 0.86 * emerge);
    }
    const { transform } = scratch;
    for (let i = 0; i < BLADES; i++) {
      const angle = (i / BLADES) * Math.PI * 2;
      const travel = aperture * 1.48;
      transform.position.set(
        Math.cos(angle) * travel,
        -0.018 - i * 0.002,
        Math.sin(angle) * travel
      );
      transform.rotation.set(0, -angle - aperture * 0.18, 0);
      transform.scale.set(1, 1, 1);
      transform.updateMatrix();
      leaves.setMatrixAt(i, transform.matrix);
    }
    leaves.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < 4; i++) {
      let y = sink + 0.052;
      let r = 1.006 * emerge;
      if (i === 1 || i === 2) {
        y = -depth * (i === 1 ? 0.32 : 0.7);
        r = 0.993;
      } else if (i === 3) {
        y = top - scratch.centre.y + sink - 0.013;
        r = 0.943 * emerge;
      }
      transform.position.set(0, y, 0);
      transform.rotation.set(0, 0, 0);
      transform.scale.set(r, 1, r);
      transform.updateMatrix();
      lights.setMatrixAt(i, transform.matrix);
    }
    lights.instanceMatrix.needsUpdate = true;
    if (moving) {
      invalidate();
    }
  });

  return (
    <group ref={root} position={position} visible={false} dispose={null}>
      <group scale={[radius, 1, radius]}>
        <group ref={mouth}>
          <mesh geometry={parts.flange} material={parts.finish} />
          <mesh
            position={[0, 0.059, 0]}
            scale={[1.105, 1, 1.105]}
            geometry={parts.ring}
            material={parts.lip}
          />
          <instancedMesh ref={bolts} args={[parts.bolt, parts.shutter, BLADES]} />
        </group>
        <mesh
          position={[0, -(depth + 0.08) / 2 - 0.002, 0]}
          scale={[1, depth + 0.08, 1]}
          geometry={parts.shaft}
          material={parts.wall}
        />
        <mesh position={[0, -depth - 0.082, 0]} geometry={parts.disc} material={parts.base} />
        <instancedMesh
          ref={blades}
          args={[parts.blade, parts.shutter, BLADES]}
          frustumCulled={false}
        />
        <mesh ref={platform} geometry={parts.platform} material={parts.finish} />
        <instancedMesh
          ref={rings}
          args={[parts.ring, parts.light, 4]}
          frustumCulled={false}
          onBeforeRender={prepareGlow}
        />
        <mesh
          ref={wash}
          scale={[0.86, 1, 0.86]}
          geometry={parts.disc}
          material={parts.wash}
          onBeforeRender={prepareGlow}
        />
      </group>
    </group>
  );
}
