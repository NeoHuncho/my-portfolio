// Portfolio embed entry: Gamehub's own app (SoloGame: its library and every shipped game),
// opened on a Rota match shared by the page's frames when the URL asks for one (config.ts).
// The frames stay on the same screen and the page can send them home (nav.ts).
// Copied into the Gamehub worktree by scripts/build-games.mjs (not part of Gamehub itself).
import { createRoot } from 'react-dom/client';
import '@/app/globals.css';
import './embed.css';
import SoloGame from '@/components/game/solo';
import { CopyGuard } from '@/components/game/copy-guard';
import { restWhileOutOfView } from './frame-visibility';

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

const root = document.getElementById('root');
if (root)
  createRoot(root).render(
    <>
      <SoloGame />
      <CopyGuard />
    </>
  );
