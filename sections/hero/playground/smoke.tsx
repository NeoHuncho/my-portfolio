import { type RefObject, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  type Mesh,
  PlaneGeometry,
  ShaderMaterial,
} from 'three';
import { type PipeDrive } from './pipe';
import { useQuality } from '../quality';

/** Puffs per hatch: a low sheet of cool vapour, warmed only where it leaves the iris. */
const PARTICLES = { low: 36, medium: 64, high: 96, ultra: 128 };
/** The longest puff lives this long after the vent stops, in seconds. */
export const VAPOUR_TAIL_S = 1.3;
/** One puff in this many curls straight up out of the mouth instead of rolling across the desk. */
const PLUME_EVERY = 5;

const noise = /* glsl */ `
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 cell = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(cell), hash(cell + vec2(1.0, 0.0)), f.x),
               mix(hash(cell + vec2(0.0, 1.0)), hash(cell + 1.0), f.x), f.y);
  }
  float fbm(vec2 p) {
    float sum = 0.0;
    float amplitude = 0.55;
    for (int i = 0; i < 4; i++) {
      sum += noise(p) * amplitude;
      p = p * 2.03 + vec2(1.7, 9.2);
      amplitude *= 0.5;
    }
    return sum;
  }
`;

function makeVapour(count: number, radius: number) {
  const plane = new PlaneGeometry(1, 1);
  const geometry = new InstancedBufferGeometry();
  geometry.index = plane.index?.clone() ?? null;
  geometry.setAttribute('position', plane.attributes.position.clone());
  geometry.setAttribute('uv', plane.attributes.uv.clone());
  plane.dispose();
  const seeds = new Float32Array(count * 4);
  const kinds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    // Round every side with a little jitter, most of them out in the first breath as the iris opens.
    seeds[i * 4] = i * 2.399963 + (((i * 0.37) % 1) - 0.5) * 0.5;
    seeds[i * 4 + 1] = ((i * 0.618034) % 1) ** 1.6 * 0.45;
    seeds[i * 4 + 2] = 0.9 + ((i * 0.754878) % 1) * 0.35;
    seeds[i * 4 + 3] = (i * 0.56984) % 1;
    kinds[i] = i % PLUME_EVERY === 0 ? 1 : 0;
  }
  geometry.setAttribute('puff', new InstancedBufferAttribute(seeds, 4));
  geometry.setAttribute('plume', new InstancedBufferAttribute(kinds, 1));
  geometry.instanceCount = count;
  const material = new ShaderMaterial({
    uniforms: {
      time: { value: -1 },
      stop: { value: -1 },
      radius: { value: radius },
      opacity: { value: 0.15 * Math.sqrt(64 / count) },
      cool: { value: new Color('#c3ccd6') },
      warm: { value: new Color('#ff8a55') },
    },
    vertexShader: /* glsl */ `
      attribute vec4 puff;
      attribute float plume;
      uniform float time;
      uniform float stop;
      uniform float radius;
      varying vec2 vUv;
      varying float vAge;
      varying float vSeed;
      varying float vStrength;
      varying float vPlume;
      varying float vAlive;
      void main() {
        float cycle = floor((time - puff.y) / puff.z);
        if (stop >= 0.0) cycle = min(cycle, floor((stop - puff.y) / puff.z));
        float birth = puff.y + cycle * puff.z;
        float age = (time - birth) / puff.z;
        vAlive = step(0.0, cycle) * step(0.0, age) * (1.0 - step(1.0, age));
        vAge = clamp(age, 0.0, 1.0);
        vSeed = puff.w;
        vPlume = plume;
        // The first breath is the strongest; what follows is a thinner trickle.
        vStrength = mix(1.0, 0.5, smoothstep(0.2, 0.9, birth));
        // Spin each puff so no two share an outline.
        float spin = puff.w * 6.2832 + vAge * (puff.w - 0.5) * 1.6;
        mat2 turn = mat2(cos(spin), sin(spin), -sin(spin), cos(spin));
        vUv = turn * (uv - 0.5) + 0.5;
        float burst = 1.0 - pow(1.0 - vAge, 3.0);
        vec4 centre;
        vec2 corner = position.xy;
        if (plume > 0.5) {
          // Curls up out of the mouth, leaning outwards a little, facing the camera.
          float lean = radius * (0.12 + 0.3 * burst);
          centre = modelMatrix * vec4(cos(puff.x) * lean, 0.1 + burst * (0.3 + radius * 0.22),
                                      sin(puff.x) * lean, 1.0);
          float size = radius * (0.32 + 0.5 * burst) * (0.85 + puff.w * 0.3);
          vec4 view = viewMatrix * centre;
          view.xy += corner * size;
          gl_Position = projectionMatrix * view;
        } else {
          // Rolls out across the desk, swirling a touch, rising only slightly as it thins.
          float angle = puff.x + burst * (puff.w - 0.5) * 0.7;
          float reach = radius * (0.6 + 0.75 * burst);
          float size = radius * (0.36 + 0.6 * burst) * (0.8 + puff.w * 0.4);
          vec3 at = vec3(cos(angle) * reach, 0.06 + burst * 0.12, sin(angle) * reach);
          // Drawn out round the mouth as it swirls, so the sheet reads as streaks, not balls.
          vec2 outward = vec2(cos(angle), sin(angle));
          vec2 around = vec2(-outward.y, outward.x);
          float stretch = 1.0 + burst * 0.7;
          at.xz += (around * corner.x * stretch + outward * corner.y / stretch) * size;
          centre = modelMatrix * vec4(at, 1.0);
          gl_Position = projectionMatrix * viewMatrix * centre;
        }
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 cool;
      uniform vec3 warm;
      uniform float opacity;
      varying vec2 vUv;
      varying float vAge;
      varying float vSeed;
      varying float vStrength;
      varying float vPlume;
      varying float vAlive;
      ${noise}
      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        float r2 = dot(uv, uv);
        // Wisps rather than discs: warped noise, carved by a soft falloff that never shows an edge.
        vec2 p = vUv * 2.6 + vSeed * 17.0;
        vec2 warp = vec2(fbm(p + vAge * 0.6), fbm(p + 4.3 - vAge * 0.4));
        float cloud = fbm(p + warp * 1.4 + vAge * 0.5);
        float falloff = exp(-r2 * 3.2);
        float body = smoothstep(0.38, 0.86, cloud * 0.9 + falloff * 0.35);
        float life = smoothstep(0.0, 0.1, vAge) * (1.0 - smoothstep(0.15, 0.92, vAge));
        float alpha = falloff * body * life * vStrength * opacity * vAlive;
        alpha *= mix(1.0, 0.6, vPlume);
        if (alpha < 0.002) discard;
        // Warm from the iris's light only while it is fresh out of the mouth.
        vec3 tint = mix(cool, warm, (1.0 - smoothstep(0.0, 0.3, vAge)) * 0.45 * vStrength);
        gl_FragColor = vec4(tint, alpha);
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    // The sheet's puffs lie face down on the desk: seen from above, they need both sides.
    side: DoubleSide,
    toneMapped: false,
  });
  return { geometry, material };
}

/** One faint ripple at desk level ties the sliding neighbours to the vent. */
function makeRipple(radius: number) {
  const geometry = new PlaneGeometry(radius * 5, radius * 5);
  geometry.rotateX(-Math.PI / 2);
  const material = new ShaderMaterial({
    uniforms: {
      time: { value: -1 },
      radius: { value: radius },
      color: { value: new Color('#ff6b35') },
    },
    vertexShader: /* glsl */ `
      varying vec2 vFloor;
      void main() {
        vFloor = position.xz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float time;
      uniform float radius;
      uniform vec3 color;
      varying vec2 vFloor;
      void main() {
        float t = clamp(time / 0.9, 0.0, 1.0);
        float ring = radius * 1.12 + (1.0 - pow(1.0 - t, 2.0)) * radius * 0.75;
        float edge = abs(length(vFloor) - ring);
        float alpha = (1.0 - smoothstep(0.01, 0.035 + fwidth(edge), edge))
                    * (1.0 - t) * 0.085;
        gl_FragColor = vec4(color, alpha);
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: AdditiveBlending,
    toneMapped: false,
  });
  return { geometry, material };
}

export function HatchVapour({
  position,
  radius,
  drive,
}: {
  position: [number, number, number];
  radius: number;
  drive: RefObject<PipeDrive>;
}) {
  const count = PARTICLES[useQuality()];
  const invalidate = useThree((state) => state.invalidate);
  const vapour = useMemo(() => makeVapour(count, radius), [count, radius]);
  const ripple = useMemo(() => makeRipple(radius), [radius]);
  const cloud = useRef<Mesh>(null);
  const ring = useRef<Mesh>(null);
  useEffect(
    () => () => {
      vapour.geometry.dispose();
      vapour.material.dispose();
    },
    [vapour]
  );
  useEffect(
    () => () => {
      ripple.geometry.dispose();
      ripple.material.dispose();
    },
    [ripple]
  );

  useFrame(() => {
    const { ventTime, ventEnd } = drive.current;
    const active = ventTime >= 0 && (ventEnd === null || ventTime < ventEnd + VAPOUR_TAIL_S);
    if (cloud.current) {
      cloud.current.visible = active;
    }
    if (ring.current) {
      ring.current.visible = active && ventTime < 0.9;
    }
    vapour.material.uniforms.time.value = ventTime;
    vapour.material.uniforms.stop.value = ventEnd ?? -1;
    ripple.material.uniforms.time.value = ventTime;
    // Only the live plumes request frames; a closed preview and an expired tail stay idle.
    if (active) {
      invalidate();
    }
  });

  return (
    <group position={position} dispose={null}>
      <mesh
        ref={cloud}
        geometry={vapour.geometry}
        material={vapour.material}
        visible={false}
        frustumCulled={false}
        raycast={() => null}
      />
      <mesh
        ref={ring}
        position={[0, 0.014, 0]}
        geometry={ripple.geometry}
        material={ripple.material}
        visible={false}
        frustumCulled={false}
        raycast={() => null}
      />
    </group>
  );
}
