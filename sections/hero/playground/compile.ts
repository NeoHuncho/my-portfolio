import { type Camera, type Object3D, type Scene, type WebGLRenderer } from 'three';

/** Three's programs say whether they are compiled; its types leave it out. */
function isReady(program: unknown): boolean {
  return (program as { isReady?: () => boolean }).isReady?.() ?? true;
}

/**
 * Compiles what `object` needs, away from the page's thread, and resolves
 * once every shader program the renderer has made is ready, not only each
 * material's latest one: a material shared by things that do and do not
 * take shadows gets a program for each, and the first frame to use the one
 * still compiling would wait for it.
 */
export function compileFully(
  gl: WebGLRenderer,
  object: Object3D,
  camera: Camera,
  target?: Scene
): Promise<void> {
  let settled = false;
  const compiled = gl
    .compileAsync(object, camera, target ?? null)
    .catch(() => undefined)
    .then(
      () =>
        new Promise<void>((resolve) => {
          const check = () => {
            if (settled || (gl.info.programs ?? []).every(isReady)) {
              resolve();
            } else {
              window.setTimeout(check, 10);
            }
          };
          check();
        })
    );
  // Never longer than this, whatever happens (a lost context, a program that never says it is
  // ready): past it, things are drawn anyway, and the worst is one slow frame.
  const enough = new Promise<void>((resolve) => {
    window.setTimeout(resolve, 2500);
  });
  return Promise.race([compiled, enough]).then(() => {
    settled = true;
  });
}
