// Portfolio embed: what the page was opened with, read once from its URL.
// Copied into the Gamehub worktree by scripts/build-games.mjs (not part of Gamehub itself).
//
//   play.html                        Gamehub's own library (its home screen)
//   play.html?game=rota&match=<n>    a Rota match already under way, shared live with every
//                                    other frame opened with the same match number
//
// Frames opened with the same match number also stay on the same screen (nav.ts): going home
// in one takes the others home, a game started in one opens in the others.
//
// Optional: rounds=0..6, how many rounds bots play for every seat before you join. The default,
// 6, opens on the last of the Meadow's seven rounds: the towns are built and their traffic runs,
// and the visitor still places that round's dice before the final scores.
import type { RotaChoice } from '@/components/game/rota/rota-save';

/** True in every embed build: Gamehub code patched for the portfolio checks it. */
export const embedded = true;

/**
 * The library's games in the embed, in the order its showcase and shelves list them (the same
 * in every frame: the library's "played last first" order is off in the embed). All play in the
 * browser with no server, against bots or (Diner's campaign and levels) alone; Arena's 3D art
 * (~63 MB) is fetched only once its box opens. Puzzles (Folio) and Lucky (saved on Gamehub's
 * server) and the party games (Know Me, Trivia with its Tower and Expedition, Impostor: they
 * need people at an online table) are left out, and so is their art.
 *
 * Diner plays sideways on phones and covers an upright one with a "turn your phone" plate. A
 * frame never turns with the device (the portfolio's phone mockup on a touchscreen), so on a
 * touchscreen Diner is left out, of every frame alike: the frames list the same games, so a
 * game started in one always opens in the others (nav.ts). Phones only show the phone frame.
 */
const touchscreen =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

export const embeddedGames = [
  'rota',
  'arena',
  'wildgrove',
  ...(touchscreen ? [] : ['diner']),
  'alto',
  'midnight',
  'undertow',
];

export type RotaEmbed = {
  choice: RotaChoice;
  /** Rounds bots play for every seat before the visitor joins. */
  rounds: number;
  /** Picks the opening match; frames with the same number share it. */
  match: number;
};

const query = () =>
  new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);

/**
 * The frames that belong together: the page's match number, as given in the URL. Null without
 * one (the frame then keeps to itself). Two portfolio tabs pick different numbers, so they never
 * drive each other.
 */
export const pageScope: string | null = (() => {
  const match = Number(query().get('match'));
  return Number.isInteger(match) && match > 0 && match < 2 ** 32 ? String(match) : null;
})();

function readRota(): RotaEmbed | null {
  if (typeof window === 'undefined') return null;
  const q = query();
  if ((q.get('game') ?? '').toLowerCase() !== 'rota') return null;
  const rounds = Number(q.get('rounds') ?? 6);
  return {
    choice: {
      map: 'meadow',
      ext: { rivers: false, plans: false, towns: false, rockfall: false },
      difficulty: 'medium',
      seats: 3,
    },
    rounds: Number.isInteger(rounds) && rounds >= 0 && rounds <= 6 ? rounds : 6,
    match: pageScope ? Number(pageScope) : crypto.getRandomValues(new Uint32Array(1))[0] || 1,
  };
}

export const rotaEmbed = readRota();
