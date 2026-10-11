#!/usr/bin/env node
// Builds Gamehub for the portfolio into public/games/, served to same-origin iframes:
//
//   /games/play.html?game=rota&match=<n>   a Rota match already under way: bots play the first
//                                          rounds for every seat (the visitor's at the hardest
//                                          level, on a seed picked for a strong town), so the
//                                          towns are built and their traffic is running.
//                                          Frames opened with the same match number share it
//                                          live (the portfolio shows it on a desktop and a phone).
//   /games/play.html                       Gamehub's own library, its home screen.
//
// From the match, Rota's back control ("All games") opens the library, where the visitor can
// play any game that ships: Rota, Arena (Versus and Quest), Mora, Nox, Yata and Alto against
// bots, and Diner (its campaign and levels) alone. Puzzles (Folio) and Lucky (saved on
// Gamehub's server) and the party games (Know Me, Trivia with its Tower and Expedition,
// Impostor: they need people at an online table) are left out of the library, and their art is
// not shipped. The library's showcase plays each shipped game's footage (public/reels: the 720p
// and 360p cuts and the stills, never the full-HD masters), once the library is on screen.
//
// Frames opened with the same match number stay on the same screen (embed/nav.ts): going back
// to the library in one takes the others there, a game started from it opens in the others too
// (a new Rota match is shared live again), and a frame opened late joins the others' screen.
// The page talks to each frame with window.postMessage, same origin only:
//   page → frame   { type: 'gamehub:home' }   back to the library (idempotent)
//   frame → page   { type: 'gamehub:screen', home: boolean, game: string | null }
//                                             once on load and on every change
// Optional query param: rounds=0..6 played before you join (default 6: you join for the last
// of the Meadow's seven rounds).
//
// Usage:
//   node scripts/build-games.mjs            (or: pnpm build:games)
//
// Env:
//   GAMEHUB_REPO        path to the Gamehub git repo (default: ../gamehub next to this repo)
//   GAMEHUB_REF         commit to build (default: the pinned GAMEHUB_COMMIT below; the
//                       patch in scripts/game-embed/gamehub.patch is written against it)
//   GAMES_WORKDIR       scratch directory for the worktree, installs and output
//                       (default: <os tmpdir>/portfolio-games)
//   GAMES_KEEP_WORKTREE=1  leave the Gamehub worktree in place after the build (debugging)
//
// The Gamehub working tree is never touched: the commit is checked out as a detached
// `git worktree` in the scratch dir, patched with scripts/game-embed/gamehub.patch, given the
// embed entry from scripts/game-embed/src/ (the shared match, the frames' navigation, the
// library's game list), built with a plain Vite config (base /games/), and only the art,
// models, sound and footage of the shipped games are copied next to the bundle (SHIP, DYNAMIC
// and arenaTier below). Every asset is fetched only when its game opens: the shared match loads
// Rota's models, nothing else; Arena's 3D art waits for its box to open, the footage for the
// library to be on screen. The worktree is removed at the end (node_modules installs stay
// cached in GAMES_WORKDIR).

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EMBED_DIR = path.join(REPO, 'scripts', 'game-embed');
const OUT_PUBLIC = path.join(REPO, 'public', 'games');
const BASE = '/games/';

const GAMEHUB_REPO = path.resolve(process.env.GAMEHUB_REPO || path.join(REPO, '..', 'gamehub'));
// Gamehub 0.30.0. Bump together with scripts/game-embed/gamehub.patch.
const GAMEHUB_COMMIT = '657b30899931e111313f3763c858e51f138fe5e9';
const GAMEHUB_REF = process.env.GAMEHUB_REF || GAMEHUB_COMMIT;
const WORKDIR = path.resolve(
  process.env.GAMES_WORKDIR || path.join(os.tmpdir(), 'portfolio-games')
);
const WORKTREE = path.join(WORKDIR, 'gamehub-embed');
const BUILD_OUT = path.join(WORKDIR, 'out');
const KEEP_WORKTREE = process.env.GAMES_KEEP_WORKTREE === '1';
// Everything shipped (~156 MB), though a visitor only downloads what they open: the shared
// match is the bundle and Rota's models (~10 MB). Arena is the biggest (~76 MB: its 3D art,
// ~63 MB, fetched once its box opens; its Quest map, ~9 MB; its sound, ~4 MB), then the
// library's footage (~34 MB, a few MB per game watched) and Mora's four worlds (~15 MB).
const SIZE_BUDGET = 165 * 1024 * 1024;

// Public files the shipped games use, matched against paths relative to Gamehub's public/.
// SHIP is matched against every literal path in the bundle (world art, box covers and their
// sizes, sound); DYNAMIC against the files of DYNAMIC_DIRS, for names the code builds at run
// time. Paths of left-out games and unreferenced candidates are skipped.
const SHIP = [
  // Library and setup covers of the shipped games, current versions, with their sizes.
  /^art\/optimized\/box-(rota-(blind|wide)-v5|arena-(blind|wide)-v3|nox-(blind|wide)-v2|alto-(blind|wide)-v2|mora-game(-wide)?-v2|yata-(toon|wide)-v1|diner-(blind|wide)-v4)(-\d+)?\.webp$/,
  // Arena: its loading screen, its models and card portraits (its textures: arenaTier), and its
  // sound (not the Sound Lab's music candidates).
  /^art\/optimized\/arena-loading-(tall|wide)\.webp$/,
  /^3d\/arena\/(models|cards)\/[a-z_-]+-[0-9a-f]{8}\.(glb|webp)$/,
  /^audio\/arena\/(?!music-option-)[a-z0-9-]+-[0-9a-f]{8}\.mp3$/,
  // Mora's four worlds (landscape, portrait and phone plates with their crops), Nox's chart,
  // Yata's counter and plaza.
  /^art\/optimized\/(mora|elsewild|nox|blackwake|yata)-[^/]+\.webp$/,
  // Rota's town, works, scenery and traffic (vehicles-*, 2 MB: its cars, lorries and trains,
  // and the boats of the Harbour map). Rota leaves out a model file it cannot load, so without
  // it the towns would have no traffic.
  /^3d\/rota\/models\/(nature|town|works|vehicles)-[^/]+\.glb$/,
  // Sound effects: shared ones (all Rota uses) and the card games' own.
  /^audio\/elevenlabs\/(shared|universal|global|mora|nox|yata)-[^/]+\.mp3$/,
];
const DYNAMIC = [
  // The boxes' spines (the cover's name + -spine).
  /^art\/optimized\/box-(rota-blind-v5|arena-blind-v3|nox-blind-v2|alto-blind-v2|mora-game-v2|yata-toon-v1|diner-blind-v4)-spine\.webp$/,
  // Arena's Quest map, one plate per region, wide and tall, with their 2x sizes.
  /^art\/optimized\/arena-quest-\d+-(wide|tall)(-2x)?\.webp$/,
  // Creature and dish tokens: mora-paper-<set>-<kind>-v<n>, yata-counter-<menu>-<kind>-v<n>.
  /^art\/optimized\/mora-paper-(inland|coast|desert|alpine)-\d+-v\d+\.webp$/,
  /^art\/optimized\/yata-counter-(lane|alley|plaza|fiesta)-\d+-v\d+\.webp$/,
  // Alto names its art at run time (planets, crew, cargo, upgrades, sky).
  /^art\/optimized\/alto-[^/]+\.webp$/,
  // Diner's sticker icons and its places' postcards (its 3D and sound are made in code).
  /^art\/diner\/(icons|places)\/[a-z]+\.webp$/,
  // Ambience beds and one-shots of the card games' worlds (sound starts off in the embed).
  /^audio\/ambience\/(forest|coast|ship|street)\/[^/]+\.m4a$/,
  // The library's footage of the shipped games (lib/games/library-reels.ts): wide and tall
  // clips in the 720p and 360p cuts (the embed caps reelTier at 720p) and their stills.
  /^reels\/(rota|arena|wildgrove|diner|alto|midnight|undertow)-(wide|tall)(-(720|360)\.mp4|\.jpg)$/,
];
// Folders whose files are named at run time, so they are listed from disk.
const DYNAMIC_DIRS = ['art/optimized', 'art/diner', 'audio/ambience', 'reels'];

/**
 * Arena's textures: its manifest lists two tiers, and it only ever fetches 'hq'
 * (components/game/arena/quality.ts), so only that tier ships. Paths relative to public/.
 */
function arenaTier() {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(WORKTREE, 'lib', 'games', 'arena', 'assets.json'), 'utf8')
  );
  const files = Object.values(manifest.textures).flatMap((set) => [
    set.albedo.hq,
    set.normal,
    set.orm,
  ]);
  if (!files.length) throw new Error('Arena manifest lists no textures (renamed in Gamehub?)');
  return files.map((f) => f.path.replace(/^\//, ''));
}

// ---------------------------------------------------------------------------------------------

function log(...args) {
  console.log('[games]', ...args);
}

function run(cmd, args, { cwd = REPO, env = process.env, timeout = 15 * 60 * 1000 } = {}) {
  log(`$ ${[cmd, ...args].join(' ')}${cwd !== REPO ? `  (in ${cwd})` : ''}`);
  const res = spawnSync(cmd, args, { cwd, env, timeout, stdio: 'inherit' });
  if (res.error) throw new Error(`${cmd} failed: ${res.error.message}`);
  if (res.status !== 0)
    throw new Error(`${cmd} ${args.join(' ')} exited with ${res.status ?? res.signal}`);
}

function capture(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { encoding: 'utf8', timeout: 60_000, ...opts });
  return res.status === 0 ? res.stdout.trim() : null;
}

function removeWorktree() {
  if (fs.existsSync(WORKTREE)) {
    // Never leave a git-tracked worktree behind, even half-made.
    spawnSync('git', ['-C', GAMEHUB_REPO, 'worktree', 'remove', '--force', WORKTREE], {
      stdio: 'inherit',
    });
    fs.rmSync(WORKTREE, { recursive: true, force: true });
  }
  spawnSync('git', ['-C', GAMEHUB_REPO, 'worktree', 'prune'], { stdio: 'ignore' });
}

function walk(dir, base = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, base, out);
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

function dirSize(dir) {
  return walk(dir).reduce((sum, f) => sum + fs.statSync(path.join(dir, f)).size, 0);
}

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

// Dependencies are installed once per lockfile in WORKDIR and linked into each fresh worktree.
function installDeps() {
  const lock = fs.readFileSync(path.join(WORKTREE, 'package-lock.json'));
  const hash = createHash('sha256').update(lock).update(process.version).digest('hex').slice(0, 16);
  const depsDir = path.join(WORKDIR, `deps-${hash}`);
  if (!fs.existsSync(path.join(depsDir, 'node_modules', '.package-lock.json'))) {
    fs.rmSync(depsDir, { recursive: true, force: true });
    fs.mkdirSync(depsDir, { recursive: true });
    for (const f of ['package.json', 'package-lock.json'])
      fs.copyFileSync(path.join(WORKTREE, f), path.join(depsDir, f));
    run('npm', ['ci', '--no-audit', '--no-fund'], { cwd: depsDir });
  } else log(`reusing dependencies in ${depsDir}`);
  fs.symlinkSync(path.join(depsDir, 'node_modules'), path.join(WORKTREE, 'node_modules'), 'dir');
}

function copyAssets() {
  const pub = path.join(WORKTREE, 'public');
  const refRe = new RegExp(
    `${BASE.replace(/\//g, '\\/')}((?:art|audio|3d|maps|geography|reels)\\/[A-Za-z0-9_./-]+)`,
    'g'
  );
  const referenced = new Set();
  for (const file of walk(BUILD_OUT).filter((f) => /\.(js|css|html)$/.test(f)))
    for (const m of fs.readFileSync(path.join(BUILD_OUT, file), 'utf8').matchAll(refRe))
      if (/\.[a-z0-9]+$/i.test(m[1])) referenced.add(m[1]);
  const listed = new Set();
  for (const dir of DYNAMIC_DIRS)
    if (fs.existsSync(path.join(pub, dir)))
      for (const f of walk(path.join(pub, dir))) listed.add(`${dir}/${f}`);

  const wanted = [
    ...new Set([
      ...[...referenced].filter((p) => SHIP.some((re) => re.test(p))),
      ...[...listed].filter((p) => DYNAMIC.some((re) => re.test(p))),
      ...arenaTier(),
    ]),
  ].sort();
  // Gamehub's code names a few files its public/ does not have (superseded art it never
  // shows); they are left out here too.
  const keep = wanted.filter((p) => fs.existsSync(path.join(pub, p)));
  if (keep.length < wanted.length)
    log(
      `not in Gamehub public/, skipped:\n  ${wanted.filter((p) => !keep.includes(p)).join('\n  ')}`
    );
  for (const re of [...SHIP, ...DYNAMIC])
    if (!keep.some((p) => re.test(p)))
      throw new Error(`no asset matched ${re} (renamed in Gamehub?)`);
  let bytes = 0;
  for (const p of keep) {
    const dest = path.join(BUILD_OUT, p);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(pub, p), dest);
    bytes += fs.statSync(dest).size;
  }
  log(
    `copied ${keep.length} assets (${mb(bytes)}); skipped ${referenced.size - keep.filter((p) => referenced.has(p)).length} referenced by left-out games or unused`
  );
}

function main() {
  if (!fs.existsSync(path.join(GAMEHUB_REPO, '.git')))
    throw new Error(`Gamehub repo not found at ${GAMEHUB_REPO} (set GAMEHUB_REPO)`);
  const commit = capture('git', [
    '-C',
    GAMEHUB_REPO,
    'rev-parse',
    '--verify',
    `${GAMEHUB_REF}^{commit}`,
  ]);
  if (!commit) throw new Error(`cannot resolve ${GAMEHUB_REF} in ${GAMEHUB_REPO}`);
  log(`Gamehub ${commit.slice(0, 7)} from ${GAMEHUB_REPO}`);
  fs.mkdirSync(WORKDIR, { recursive: true });
  removeWorktree();
  run('git', ['-C', GAMEHUB_REPO, 'worktree', 'add', '--quiet', '--detach', WORKTREE, commit], {
    timeout: 5 * 60 * 1000,
  });
  try {
    run('git', ['apply', '--whitespace=nowarn', path.join(EMBED_DIR, 'gamehub.patch')], {
      cwd: WORKTREE,
    });
    fs.cpSync(path.join(EMBED_DIR, 'src'), WORKTREE, { recursive: true });
    installDeps();
    fs.rmSync(BUILD_OUT, { recursive: true, force: true });
    run(
      process.execPath,
      [
        path.join(WORKTREE, 'node_modules', 'vite', 'bin', 'vite.js'),
        'build',
        '--config',
        'vite.embed.config.mjs',
      ],
      {
        cwd: WORKTREE,
        env: { ...process.env, NODE_ENV: 'production', EMBED_BASE: BASE, EMBED_OUT: BUILD_OUT },
        timeout: 10 * 60 * 1000,
      }
    );
    if (!fs.existsSync(path.join(BUILD_OUT, 'play.html')))
      throw new Error('build produced no play.html');
    copyAssets();
    fs.writeFileSync(
      path.join(BUILD_OUT, 'build.json'),
      `${JSON.stringify({ gamehub: commit, builtAt: new Date().toISOString() }, null, 2)}\n`
    );
  } finally {
    if (KEEP_WORKTREE) log(`worktree kept at ${WORKTREE}`);
    else removeWorktree();
  }

  const size = dirSize(BUILD_OUT);
  if (size > SIZE_BUDGET) log(`WARNING: ${mb(size)} is over the ${mb(SIZE_BUDGET)} budget`);
  fs.rmSync(OUT_PUBLIC, { recursive: true, force: true });
  fs.cpSync(BUILD_OUT, OUT_PUBLIC, { recursive: true });
  log(`public/games ready (${mb(size)}): ${BASE}play.html?game=rota, ${BASE}play.html`);
}

try {
  main();
} catch (error) {
  console.error(`[games] FAILED: ${error.message}`);
  process.exit(1);
}
