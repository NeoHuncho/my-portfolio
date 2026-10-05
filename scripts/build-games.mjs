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
// From the match, Rota's back control ("All games") opens the library in that frame, where the
// visitor can play any game that ships: Rota, Mora, Nox, Yata and Alto, against bots. Arena (its
// 3D battle is ~60 MB), Folio and Lucky (saved on Gamehub's server) and the party games (they
// need people at an online table) are left out of the library, and their art is not shipped.
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
// embed entry from scripts/game-embed/src/ (the shared match, the library's game list), built
// with a plain Vite config (base /games/), and only the art, models and sound of the shipped
// games are copied next to the bundle (SHIP and DYNAMIC below). Every asset is fetched only
// when its game opens: the shared match loads Rota's models, nothing else. The worktree is
// removed at the end (node_modules installs stay cached in GAMES_WORKDIR).

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
// Gamehub 0.28.0. Bump together with scripts/game-embed/gamehub.patch.
const GAMEHUB_COMMIT = '55bd99ddd61412e29cc9d4cd22b9b028313e6ccb';
const GAMEHUB_REF = process.env.GAMEHUB_REF || GAMEHUB_COMMIT;
const WORKDIR = path.resolve(
  process.env.GAMES_WORKDIR || path.join(os.tmpdir(), 'portfolio-games')
);
const WORKTREE = path.join(WORKDIR, 'gamehub-embed');
const BUILD_OUT = path.join(WORKDIR, 'out');
const KEEP_WORKTREE = process.env.GAMES_KEEP_WORKTREE === '1';
// Everything shipped (~53 MB), though a visitor only downloads what they open: the shared
// match is the bundle and Rota's models (~17 MB); Mora's four worlds are the next biggest (~15 MB).
const SIZE_BUDGET = 56 * 1024 * 1024;

// Public files the shipped games use, matched against paths relative to Gamehub's public/.
// SHIP is matched against every literal path in the bundle (world art, box covers and their
// sizes, sound); DYNAMIC against the files of DYNAMIC_DIRS, for names the code builds at run
// time. Paths of left-out games and unreferenced candidates are skipped.
const SHIP = [
  // Library and setup covers of the shipped games, current versions, with their sizes.
  /^art\/optimized\/box-(rota-(blind|wide)-v1|nox-(blind|wide)-v2|alto-(blind|wide)-v2|mora-game(-wide)?-v2|yata-(toon|wide)-v1)(-\d+)?\.webp$/,
  // Mora's four worlds (landscape, portrait and phone plates with their crops), Nox's chart,
  // Yata's counter and plaza.
  /^art\/optimized\/(mora|elsewild|nox|blackwake|yata)-[^/]+\.webp$/,
  // Rota's town, works, scenery and traffic (vehicles-*, 5 MB: its cars, lorries and trains,
  // and the boats of the Harbour map). Rota leaves out a model file it cannot load, so without
  // it the towns would have no traffic.
  /^3d\/rota\/models\/(nature|town|works|vehicles)-[^/]+\.glb$/,
  // Sound effects: shared ones (all Rota uses) and the card games' own.
  /^audio\/elevenlabs\/(shared|universal|global|mora|nox|yata)-[^/]+\.mp3$/,
];
const DYNAMIC = [
  // The boxes' spines (the cover's name + -spine).
  /^art\/optimized\/box-(rota-blind-v1|nox-blind-v2|alto-blind-v2|mora-game-v2|yata-toon-v1)-spine\.webp$/,
  // Creature and dish tokens: mora-paper-<set>-<kind>-v<n>, yata-counter-<menu>-<kind>-v<n>.
  /^art\/optimized\/mora-paper-(inland|coast|desert|alpine)-\d+-v\d+\.webp$/,
  /^art\/optimized\/yata-counter-(lane|alley|plaza|fiesta)-\d+-v\d+\.webp$/,
  // Alto names its art at run time (planets, crew, cargo, upgrades, sky).
  /^art\/optimized\/alto-[^/]+\.webp$/,
  // Ambience beds and one-shots of the card games' worlds (sound starts off in the embed).
  /^audio\/ambience\/(forest|coast|ship|street)\/[^/]+\.m4a$/,
];
// Folders whose files are named at run time, so they are listed from disk.
const DYNAMIC_DIRS = ['art/optimized', 'audio/ambience'];

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
    `${BASE.replace(/\//g, '\\/')}((?:art|audio|3d|maps|geography)\\/[A-Za-z0-9_./-]+)`,
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
