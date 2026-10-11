import { type StaticImageData } from 'next/image';
import { type Locale } from '@config/translations';
import shelfFlagsFr from '@public/assets/showcase/shelf-flags-fr.webp';
import shelfFlags from '@public/assets/showcase/shelf-flags.webp';
import shelfMountain from '@public/assets/showcase/shelf-mountain.webp';
import shelfOss from '@public/assets/showcase/shelf-oss.webp';
import shelfRobot from '@public/assets/showcase/shelf-robot.webp';
import shelfServer from '@public/assets/showcase/shelf-server.webp';
import shelfSport from '@public/assets/showcase/shelf-sport.webp';
import shelfStrategy from '@public/assets/showcase/shelf-strategy.webp';
import stageAgents from '@public/assets/showcase/stage-agents.webp';
import stageNight from '@public/assets/showcase/stage-night.webp';
import stageTicket from '@public/assets/showcase/stage-ticket.webp';
import trayFlagsFr from '@public/assets/showcase/tray-flags-fr.webp';
import trayFlags from '@public/assets/showcase/tray-flags.webp';
import trayKeys from '@public/assets/showcase/tray-keys.webp';
import trayMountain from '@public/assets/showcase/tray-mountain.webp';
import trayOss from '@public/assets/showcase/tray-oss.webp';
import trayRobot from '@public/assets/showcase/tray-robot.webp';
import trayServer from '@public/assets/showcase/tray-server.webp';
import traySport from '@public/assets/showcase/tray-sport.webp';
import trayStrategy from '@public/assets/showcase/tray-strategy.webp';

/** How I work, on the stage's tabs: the day shift, my agents and their night shift. */
export const SHIFTS = ['ticket', 'agents', 'night'] as const;
/** The rest of me, on the shelf, most important first; Switzerland and the languages last, as the hero says them. */
export const SHELF = ['robot', 'sport', 'oss', 'server', 'strategy', 'mountain', 'flags'] as const;

export type ShiftId = (typeof SHIFTS)[number];
export type ShelfId = (typeof SHELF)[number];
/** Also on the desk's tray, which has a keyboard to press it with: the search key. */
export type ExhibitId = ShiftId | ShelfId | 'keys';

type Stills = {
  stage: Record<ShiftId, StaticImageData>;
  shelf: Record<ShelfId, StaticImageData>;
  tray: Record<ShelfId | 'keys', StaticImageData>;
};

/**
 * Still renders of each exhibit, as its 3D first draws it (saved from /dev/sprites): what shows
 * until the 3D is ready, or instead of it. Imported, so each is served under a name that changes
 * with its content: saved again, a still reaches every visitor past the year-long image caches.
 */
const STILLS: Stills = {
  stage: { ticket: stageTicket, agents: stageAgents, night: stageNight },
  shelf: {
    mountain: shelfMountain,
    flags: shelfFlags,
    robot: shelfRobot,
    sport: shelfSport,
    oss: shelfOss,
    server: shelfServer,
    strategy: shelfStrategy,
  },
  tray: {
    mountain: trayMountain,
    flags: trayFlags,
    robot: trayRobot,
    sport: traySport,
    oss: trayOss,
    server: trayServer,
    keys: trayKeys,
    strategy: trayStrategy,
  },
};
/** The flags put the site's language first, so French has its own (saved from /dev/sprites?lang=fr). */
const FRENCH_FLAGS = { shelf: shelfFlagsFr, tray: trayFlagsFr };

export function stillOf<Place extends keyof Stills>(
  id: keyof Stills[Place],
  place: Place,
  locale: Locale = 'en'
): StaticImageData {
  if (id === 'flags' && locale === 'fr' && place !== 'stage') {
    return FRENCH_FLAGS[place as keyof typeof FRENCH_FLAGS];
  }
  return STILLS[place][id] as StaticImageData;
}

/** The desk tray's pieces, in its order: each starts its turn from its own angle, as its still shows it. */
const TRAY_ORDER: ExhibitId[] = [
  'robot',
  'sport',
  'oss',
  'server',
  'keys',
  'strategy',
  'mountain',
  'flags',
];
// The search key starts with its slash reading the right way round.
export const thumbPhase = (id: ExhibitId) =>
  id === 'keys' ? 0 : Math.max(0, TRAY_ORDER.indexOf(id)) * 0.9;

/** The shelf's pieces each start their turn from their own angle too, as their stills show them. */
export const shelfPhase = (id: ExhibitId) =>
  Math.max(0, (SHELF as readonly ExhibitId[]).indexOf(id)) * 1.1;

/** The stage's turntable: how far a drag has turned it since the last frame, whether it is held, and any spin to add. */
export type Turn = { drag: number; held: boolean; flick: number };

/**
 * The phone's turntable of how I work: how far a drag has turned it since
 * the last frame, whether it is held, and how many taps it has had, each
 * answered with a hop.
 */
export type TrioTurn = { drag: number; held: boolean; taps: number };
