// Portfolio embed: Rota's table on a match shared with the page's other frames (rota-sync).
// Copied into the Gamehub worktree by scripts/build-games.mjs (not part of Gamehub itself).
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { createRota, observe, play, type RotaGame, type RotaMove } from '@/lib/games/rota/engine';
import { botRound } from '@/lib/games/rota/bot';
import { RotaTable } from '@/components/game/rota/rota-table';
import type { RotaChoice } from '@/components/game/rota/rota-save';
import type { RotaEmbed } from './config';
import { RotaSync } from './rota-sync';

const VOLUME = 'gamehub.rota.volume';

function newMatch(choice: RotaChoice, seed: number) {
  return createRota(choice.seats, seed, {
    map: choice.map,
    ext: choice.ext,
    difficulty: choice.difficulty,
    bots: Array.from({ length: choice.seats }, (_, i) => i > 0),
  });
}

/**
 * Seeds whose opening suits the portfolio: after six rounds the visitor's town scores 47 to 50
 * (a typical seat 0 played as below: about 37; the medium bots: about 30) and carries street
 * traffic and trains. Found by playing seeds 1 to 400 with underWay below at Gamehub 55bd99d
 * and keeping the best; a new Gamehub commit may build them differently.
 */
const OPENINGS = [369, 210, 255, 272, 294, 366, 5, 8, 92, 276, 284, 131, 268, 55, 245, 346];

/** Bots play every seat, yours too, for the first rounds: the towns are built. Your seat plays
 *  at the hardest level, so the town you take over is a strong one. The same match number
 *  gives the same match in every frame. */
function underWay(choice: RotaChoice, match: number, rounds: number): RotaGame {
  let g = newMatch(choice, OPENINGS[match % OPENINGS.length]);
  for (let r = 0; r < rounds && !g.over; r++)
    for (let s = 0; s < choice.seats; s++) {
      const view = observe(g, s);
      for (const m of botRound(s === 0 ? { ...view, difficulty: 'hard' } : view, s))
        g = play(g, m, s);
    }
  return g;
}

export default function SharedRota({ embed, onHome }: { embed: RotaEmbed; onHome: () => void }) {
  const [sync, setSync] = useState<RotaSync | null>(null);
  useEffect(() => {
    const s = new RotaSync(
      `gamehub-rota-${embed.match}`,
      underWay(embed.choice, embed.match, embed.rounds),
      String(embed.match)
    );
    setSync(s);
    return () => s.dispose();
  }, [embed]);
  return sync ? <Table sync={sync} embed={embed} onHome={onHome} /> : null;
}

function Table({ sync, embed, onHome }: { sync: RotaSync; embed: RotaEmbed; onHome: () => void }) {
  const g = useSyncExternalStore(sync.subscribe, sync.get);
  // The bots' round in progress stays hidden, as it would at a table.
  const view = useMemo(() => observe(g, 0), [g]);
  const move = useCallback((m: RotaMove) => sync.move(m), [sync]);
  const [volume, setVolume] = useState(() => {
    try {
      const v = Number(localStorage.getItem(VOLUME) ?? 0);
      return Number.isFinite(v) ? v : 0;
    } catch {
      return 0;
    }
  });
  return (
    <RotaTable
      g={view}
      seat={0}
      onMove={move}
      onLeave={onHome}
      backLabel="All games"
      onAgain={() =>
        sync.replace(newMatch(embed.choice, crypto.getRandomValues(new Uint32Array(1))[0] || 1))
      }
      volume={volume}
      onVolume={(v) => {
        setVolume(v);
        try {
          localStorage.setItem(VOLUME, String(v));
        } catch {}
      }}
    />
  );
}
