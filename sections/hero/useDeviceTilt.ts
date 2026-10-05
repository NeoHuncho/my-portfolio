import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

/** What the phone's sensors tell the desk: how far to tip it (radians, +x right, +z towards the viewer) and how many shakes so far. */
export type DeskMotion = { on: boolean; tilt: { x: number; z: number }; shakes: number };

/** The phone's tilt is exaggerated this much, up to this far, so a small turn of the wrist moves things. */
const GAIN = 2.2;
const MAX_DEG = 50;
/** Held at a new angle, the desk levels out again over about this long. */
const LEVEL_MS = 4000;
/** A jolt this hard (m/s² between two readings) is a shake, at most this often. */
const SHAKE_JOLT = 22;
const SHAKE_GAP_MS = 700;

type PermissionApi = { requestPermission?: () => Promise<'granted' | 'denied'> };

function clamp(value: number, limit: number) {
  return Math.max(-limit, Math.min(limit, value));
}

/** The screen's rotation, so tipping the phone left always tips the desk left. */
function screenAngle() {
  return window.screen.orientation?.angle ?? 0;
}

/**
 * Lets the phone tip the desk: once switched on, tilting it slides things
 * round, and shaking it tosses them. Relative to how the phone is held, so
 * it works sitting, standing or lying down. iOS asks for permission first,
 * which it only allows from a tap.
 */
export function useDeviceTilt(enabled: boolean): {
  supported: boolean;
  on: boolean;
  toggle: () => void;
  motion: RefObject<DeskMotion>;
} {
  const [supported, setSupported] = useState(false);
  const [on, setOn] = useState(false);
  const motion = useRef<DeskMotion>({ on: false, tilt: { x: 0, z: 0 }, shakes: 0 });

  useEffect(() => {
    setSupported(enabled && typeof window.DeviceOrientationEvent !== 'undefined');
  }, [enabled]);

  useEffect(() => {
    motion.current.on = on;
    if (!on) {
      motion.current.tilt = { x: 0, z: 0 };
      return undefined;
    }
    let level: { beta: number; gamma: number; at: number } | null = null;
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null) {
        return;
      }
      const now = performance.now();
      if (!level) {
        level = { beta: event.beta, gamma: event.gamma, at: now };
      }
      // The level drifts towards however the phone is held now.
      const follow = Math.min(1, (now - level.at) / LEVEL_MS);
      level.beta += (event.beta - level.beta) * follow;
      level.gamma += (event.gamma - level.gamma) * follow;
      level.at = now;
      const across = event.gamma - level.gamma;
      const along = event.beta - level.beta;
      const angle = screenAngle();
      const [x, z] = {
        0: [across, along],
        90: [along, -across],
        180: [-across, -along],
        270: [-along, across],
      }[(((angle % 360) + 360) % 360) as 0 | 90 | 180 | 270] ?? [across, along];
      const toRadians = (deg: number) => (clamp(deg * GAIN, MAX_DEG) * Math.PI) / 180;
      motion.current.tilt = { x: toRadians(x), z: toRadians(z) };
    };
    let last: { x: number; y: number; z: number } | null = null;
    let shookAt = -Infinity;
    const onMotion = (event: DeviceMotionEvent) => {
      const a = event.accelerationIncludingGravity;
      if (typeof a?.x !== 'number' || typeof a.y !== 'number' || typeof a.z !== 'number') {
        return;
      }
      const now = performance.now();
      if (last) {
        const jolt = Math.abs(a.x - last.x) + Math.abs(a.y - last.y) + Math.abs(a.z - last.z);
        if (jolt > SHAKE_JOLT && now - shookAt > SHAKE_GAP_MS) {
          shookAt = now;
          motion.current.shakes += 1;
        }
      }
      last = { x: a.x, y: a.y, z: a.z };
    };
    window.addEventListener('deviceorientation', onOrientation);
    window.addEventListener('devicemotion', onMotion);
    return () => {
      window.removeEventListener('deviceorientation', onOrientation);
      window.removeEventListener('devicemotion', onMotion);
    };
  }, [on]);

  const toggle = useCallback(() => {
    if (on) {
      setOn(false);
      return;
    }
    const orientation = window.DeviceOrientationEvent as unknown as PermissionApi;
    const devicemotion = window.DeviceMotionEvent as unknown as PermissionApi | undefined;
    if (typeof orientation.requestPermission !== 'function') {
      setOn(true);
      return;
    }
    // iOS: both sensors share one prompt, which has to come from this tap.
    Promise.all([orientation.requestPermission(), devicemotion?.requestPermission?.()])
      .then(([state]) => setOn(state === 'granted'))
      .catch(() => setOn(false));
  }, [on]);

  return { supported, on, toggle, motion };
}
