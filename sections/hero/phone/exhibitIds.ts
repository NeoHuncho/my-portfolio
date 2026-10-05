/** How I work, on the stage's tabs: the day shift, my agents and their night shift. */
export const SHIFTS = ['ticket', 'agents', 'night'] as const;
/** The rest of me, on the shelf, most important first. */
export const SHELF = ['flags', 'mountain', 'sport', 'robot', 'server', 'oss'] as const;

export type ShiftId = (typeof SHIFTS)[number];
export type ShelfId = (typeof SHELF)[number];
export type ExhibitId = ShiftId | ShelfId;

/** Still renders of each exhibit on its plinth: what shows until the 3D is ready, or instead of it. */
export const stillOf = (id: ExhibitId, place: 'stage' | 'shelf') =>
  `/assets/showcase/${place}-${id}.webp`;

/** The stage's turntable: how far a drag has turned it since the last frame, whether it is held, and any spin to add. */
export type Turn = { drag: number; held: boolean; flick: number };
