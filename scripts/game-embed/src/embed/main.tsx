// Portfolio embed entry: a Rota match shared by the page's frames, or Gamehub's own library.
// Copied into the Gamehub worktree by scripts/build-games.mjs (not part of Gamehub itself).
import { lazy, Suspense, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@/app/globals.css';
import './embed.css';
import SoloGame from '@/components/game/solo';
import { CopyGuard } from '@/components/game/copy-guard';
import { rotaEmbed } from './config';
import { restWhileOutOfView } from './frame-visibility';

const SharedRota = lazy(() => import('./rota-shared'));

// Sound starts off in the portfolio; a visitor who turns it on keeps their choice.
for (const key of ['gamehub.volume.v3', 'gamehub.ambience.v1', 'gamehub.rota.volume'])
  try {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, '0');
  } catch {}

// Gamehub's pages other than its library (online tables, sign-in) are not part of the embed.
const base = new URL('./', document.baseURI).pathname;
document.addEventListener(
  'click',
  (event) => {
    const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (link && link.target !== '_blank' && !link.pathname.startsWith(base)) event.preventDefault();
  },
  true
);

restWhileOutOfView();

/** The shared match until the visitor goes back to the library, which plays on its own. */
function App() {
  const [home, setHome] = useState(!rotaEmbed);
  if (home || !rotaEmbed) return <SoloGame />;
  return (
    <div className="app at-table rota">
      <Suspense fallback={<Loading name="Rota" />}>
        <SharedRota embed={rotaEmbed} onHome={() => setHome(true)} />
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

const root = document.getElementById('root');
if (root)
  createRoot(root).render(
    <>
      <App />
      <CopyGuard />
    </>
  );
