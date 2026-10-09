/** How I work, on the stage's tabs: the day shift, my agents and their night shift. */
export const SHIFTS = ['ticket', 'agents', 'night'] as const;
/** The rest of me, on the shelf, most important first. */
export const SHELF = ['flags', 'mountain', 'sport', 'robot', 'server', 'oss'] as const;

export type ShiftId = (typeof SHIFTS)[number];
export type ShelfId = (typeof SHELF)[number];
/** Also on the desk's tray, which has room for them: my portrait and the search key. */
export type ExhibitId = ShiftId | ShelfId | 'portrait' | 'keys';

/** Still renders of each exhibit on its plinth: what shows until the 3D is ready, or instead of it. */
export const stillOf = (id: ExhibitId | 'trio', place: 'stage' | 'shelf' | 'tray') =>
  `/assets/showcase/${place}-${id}.webp`;

/** The desk tray's pieces, in its order: each starts its turn from its own angle, as its still shows it. */
const TRAY_ORDER: ExhibitId[] = [
  'portrait',
  'flags',
  'mountain',
  'sport',
  'robot',
  'keys',
  'server',
  'oss',
];
export const thumbPhase = (id: ExhibitId) => Math.max(0, TRAY_ORDER.indexOf(id)) * 0.9;

/** The stage's turntable: how far a drag has turned it since the last frame, whether it is held, and any spin to add. */
export type Turn = { drag: number; held: boolean; flick: number };

/**
 * The phone's turntable of how I work: how far a drag has turned it since
 * the last frame, whether it is held, and how many taps it has had, each
 * answered with a hop.
 */
export type TrioTurn = { drag: number; held: boolean; taps: number };
