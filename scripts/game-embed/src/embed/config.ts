// Portfolio embed: what the page was opened with, read once from its URL.
// Copied into the Gamehub worktree by scripts/build-games.mjs (not part of Gamehub itself).
//
//   play.html                        Gamehub's own library (its home screen)
//   play.html?game=rota&match=<n>    a Rota match already under way, shared live with every
//                                    other frame opened with the same match number
//
// Optional: rounds=0..6, how many rounds bots play for every seat before you join. The default,
// 6, opens on the last of the Meadow's seven rounds: the towns are built and their traffic runs,
// and the visitor still places that round's dice before the final scores.
import type { RotaChoice } from '@/components/game/rota/rota-save';

/** True in every embed build: Gamehub code patched for the portfolio checks it. */
export const embedded = true;

/**
 * The library's games in the embed: the ones that play against bots in the browser.
 * Arena (its 3D battle is ~60 MB), Folio and Lucky (saved on Gamehub's server) and the
 * party games (they need people at an online table) are left out, and so is their art.
 */
export const embeddedGames = ['rota', 'wildgrove', 'undertow', 'midnight', 'alto'];

export type RotaEmbed = {
  choice: RotaChoice;
  /** Rounds bots play for every seat before the visitor joins. */
  rounds: number;
  /** Picks the opening match; frames with the same number share it. */
  match: number;
};

function readRota(): RotaEmbed | null {
  if (typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search);
  if ((q.get('game') ?? '').toLowerCase() !== 'rota') return null;
  const rounds = Number(q.get('rounds') ?? 6);
  const match = Number(q.get('match'));
  return {
    choice: {
      map: 'meadow',
      ext: { rivers: false, plans: false, towns: false, rockfall: false },
      difficulty: 'medium',
      seats: 3,
    },
    rounds: Number.isInteger(rounds) && rounds >= 0 && rounds <= 6 ? rounds : 6,
    match:
      Number.isInteger(match) && match > 0 && match < 2 ** 32
        ? match
        : crypto.getRandomValues(new Uint32Array(1))[0] || 1,
  };
}

export const rotaEmbed = readRota();
