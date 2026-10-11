// Portfolio embed: Rota in the page's frames. Gamehub's SoloGame (components/game/solo.tsx,
// patched) shows this in place of its own solo table.
// Copied into the Gamehub worktree by scripts/build-games.mjs (not part of Gamehub itself).
//
// Every match is shared live by the page's frames (rota-shared, rota-sync): the opening one,
// already under way, and each new one started from the library, which the other frames open
// with the same choice and key (nav.ts), so they build the same match and find each other on
// the same channel. Library matches are saved on this device for Resume, as Gamehub's solo
// table saves them; the opening one is not (it would replace the visitor's own saved match on
// every visit). Practice (Learn) stays Gamehub's own solo table, one per frame: its coach
// follows what the visitor does in that frame; the real match it leads to opens through
// SoloGame (onMatch), shared like any other.
import { lazy, Suspense } from 'react';
import type { RotaChoice } from '@/components/game/rota/rota-save';
import { rotaEmbed, type RotaEmbed } from './config';

const SharedRota = lazy(() => import('./rota-shared'));
const RotaSolo = lazy(() => import('@/components/game/rota/rota-solo'));

/** SoloGame's Rota state in the embed: the box's choice and when it was made (`key`). */
export type EmbedRotaState = RotaChoice & {
  key: number;
  /** The match the page opens on, from its URL. */
  opening?: RotaEmbed;
};

/** SoloGame starts on the opening match when the URL asks for one. */
export const openingRota = (): EmbedRotaState | null =>
  rotaEmbed ? { ...rotaEmbed.choice, key: 0, opening: rotaEmbed } : null;

export function EmbedRota({
  choice,
  onExit,
  onMatch,
}: {
  choice: EmbedRotaState;
  onExit: () => void;
  /** Opens a new match (shared by the page's frames) with this choice. */
  onMatch: (choice: RotaChoice) => void;
}) {
  return (
    <div className="app at-table rota">
      <Suspense fallback={<Loading name="Rota" />}>
        {choice.learn && !choice.opening ? (
          <RotaSolo
            key={choice.key}
            choice={choice}
            onExit={onExit}
            onMatch={() =>
              onMatch({
                map: choice.map,
                ext: choice.ext,
                difficulty: choice.difficulty,
                seats: choice.seats,
              })
            }
          />
        ) : (
          <SharedRota key={choice.key} choice={choice} onHome={onExit} />
        )}
      </Suspense>
    </div>
  );
}

function Loading({ name }: { name: string }) {
  return (
    <main className="startup-loading" aria-busy="true">
      <output className="startup-loading-content">
        <strong>{name}</strong>
        <span>Laying out the town</span>
      </output>
    </main>
  );
}
