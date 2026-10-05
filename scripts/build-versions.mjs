#!/usr/bin/env node
// Builds frozen, statically exported copies of past portfolio milestones into
// public/versions/<id>/ so the current site can serve them under /versions/<id>/.
//
// Usage:
//   node scripts/build-versions.mjs              # build every milestone
//   node scripts/build-versions.mjs v1.0 v2.4    # build a subset
//
// Env:
//   VERSIONS_WORKDIR  scratch directory for sources, installs and tools
//                     (default: <os tmpdir>/portfolio-versions)
//   VERSIONS_FRESH=1  reinstall dependencies even if a cached install matches the lockfile
//
// Each milestone is extracted with `git archive` (the repo's working tree is never touched),
// patched with build-only changes (generic ones below + scripts/version-patches/<id>/),
// installed from its own lockfile with that era's toolchain, exported, pruned and copied.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PATCHES_DIR = path.join(REPO, 'scripts', 'version-patches');
const PUBLIC_VERSIONS = path.join(REPO, 'public', 'versions');
const WORKDIR = path.resolve(
  process.env.VERSIONS_WORKDIR || path.join(os.tmpdir(), 'portfolio-versions')
);
const TOOLS_DIR = path.join(WORKDIR, 'tools');
const SRC_DIR = path.join(WORKDIR, 'src');
const FRESH = process.env.VERSIONS_FRESH === '1';

const YARN_VERSION = '1.22.22';
const PNPM_VERSION = '10.20.0';
// Only used at build time to recompress oversized images in the export (size budget).
const SHARP_VERSION = '0.34.4';

// `node` is the major version used for install + build.
// Next 12 (2022) is built with Node 18 (its era LTS); Next 16 with Node 22.
const MILESTONES = [
  // v1: the 2022 portfolio, final patch release.
  { id: 'v1.0.3', commit: 'b6f89b4', next: 12, node: 18, pm: 'yarn1' },
  // v2: the 2025 Tailwind redesign, final state before v3.
  { id: 'v2.4', commit: 'bbb4990', next: 16, node: 22, pm: 'pnpm' },
];

const SOURCE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.scss']);
const TEXT_EXT = new Set(['.html', '.js', '.css', '.json', '.txt', '.xml', '.svg', '.webmanifest']);
const SKIP_DIRS = new Set(['node_modules', '.next', 'out', '.git']);

// ---------------------------------------------------------------------------------------------
// helpers

function log(...args) {
  console.log('[versions]', ...args);
}

function run(cmd, args, opts = {}) {
  const { cwd = REPO, env = process.env, timeout = 15 * 60 * 1000, capture = false } = opts;
  log(
    `$ ${[cmd, ...args].join(' ')}${cwd !== REPO ? `  (in ${path.relative(WORKDIR, cwd) || cwd})` : ''}`
  );
  const res = spawnSync(cmd, args, {
    cwd,
    env,
    timeout,
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 256,
  });
  if (res.error) throw new Error(`${cmd} failed: ${res.error.message}`);
  if (res.status !== 0) throw new Error(`${cmd} ${args.join(' ')} exited with ${res.status}`);
  return capture ? res.stdout : '';
}

function walk(dir, { skip = SKIP_DIRS } = {}) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skip.has(entry.name)) out.push(...walk(p, { skip }));
    } else if (entry.isFile()) out.push(p);
  }
  return out;
}

function dirSize(dir) {
  return walk(dir, { skip: new Set() }).reduce((sum, f) => sum + fs.statSync(f).size, 0);
}

function fmtSize(bytes) {
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
    : `${(bytes / 1024).toFixed(1)} KB`;
}

function sha(file) {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function editFile(file, fn) {
  const before = fs.readFileSync(file, 'utf8');
  const after = fn(before);
  if (after !== before) fs.writeFileSync(file, after);
  return after !== before;
}

// ---------------------------------------------------------------------------------------------
// toolchain

const nodeCache = new Map();

/** Absolute path to a node binary of the given major: nvm install if present, else npm's `node` pkg. */
function resolveNode(major) {
  if (nodeCache.has(major)) return nodeCache.get(major);
  let bin;
  if (process.versions.node.split('.')[0] === String(major)) bin = process.execPath;
  const nvmDir = path.join(os.homedir(), '.nvm', 'versions', 'node');
  if (!bin && fs.existsSync(nvmDir)) {
    const match = fs
      .readdirSync(nvmDir)
      .filter((v) => v.startsWith(`v${major}.`))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0];
    if (match) bin = path.join(nvmDir, match, 'bin', 'node');
  }
  if (!bin) {
    // Not installed locally: fetch the official binary published on npm as node-<os>-<arch>.
    const pkg = `node-${process.platform}-${process.arch}`;
    const prefix = path.join(TOOLS_DIR, `node${major}`);
    const candidate = path.join(prefix, 'node_modules', pkg, 'bin', 'node');
    if (!fs.existsSync(candidate)) {
      fs.mkdirSync(prefix, { recursive: true });
      run('npm', [
        'install',
        '--prefix',
        prefix,
        '--no-save',
        '--no-audit',
        '--no-fund',
        `${pkg}@${major}`,
      ]);
    }
    bin = candidate;
  }
  const version = run(bin, ['-v'], { capture: true }).trim();
  log(`node ${major} -> ${bin} (${version})`);
  nodeCache.set(major, { bin, version });
  return nodeCache.get(major);
}

function ensureTool(name, version, entry) {
  const prefix = path.join(TOOLS_DIR, `${name}-${version}`);
  const file = path.join(prefix, 'node_modules', name, entry);
  if (!fs.existsSync(file)) {
    fs.mkdirSync(prefix, { recursive: true });
    run('npm', [
      'install',
      '--prefix',
      prefix,
      '--no-save',
      '--no-audit',
      '--no-fund',
      `${name}@${version}`,
    ]);
  }
  return file;
}

function envFor(node) {
  return {
    ...process.env,
    PATH: `${path.dirname(node.bin)}${path.delimiter}${process.env.PATH}`,
    NEXT_TELEMETRY_DISABLED: '1',
    NODE_ENV: 'production',
    CI: '1',
    // Never let a frozen build phone home or pick up the live site's env.
    VERCEL: '',
    NEXT_PUBLIC_VERCEL_ENV: '',
    YARN_IGNORE_ENGINES: '1',
  };
}

// ---------------------------------------------------------------------------------------------
// patches

function nextConfigOverride(v, basePath) {
  return `// Generated by scripts/build-versions.mjs: frozen static export of ${v.id} (${v.commit}).
const original = require('./next.config.original.js');

module.exports = async (phase, ctx) => {
  const base = typeof original === 'function' ? await original(phase, ctx) : { ...original };
  // Not supported by a static export.
  delete base.headers;
  delete base.rewrites;
  delete base.redirects;
  return {
    ...base,
    basePath: ${JSON.stringify(basePath)},
    trailingSlash: true,${v.next >= 13 ? "\n    output: 'export'," : ''}
    images: { ...(base.images || {}), unoptimized: true },
    typescript: { ...(base.typescript || {}), ignoreBuildErrors: true },${
      v.next < 16 ? '\n    eslint: { ...(base.eslint || {}), ignoreDuringBuilds: true },' : ''
    }
    productionBrowserSourceMaps: false,
  };
};
`;
}

/** Build-only patches every milestone needs. Returns a list of what was applied. */
function applyGenericPatches(v, dir, basePath) {
  const applied = [];

  // 1. next.config: basePath, trailing slash, static export, unoptimized images, ignore TS/ESLint.
  const cfg = path.join(dir, 'next.config.js');
  fs.renameSync(cfg, path.join(dir, 'next.config.original.js'));
  fs.writeFileSync(cfg, nextConfigOverride(v, basePath));
  applied.push('next.config override');

  const publicDir = path.join(dir, 'public');
  const sources = walk(dir).filter(
    (f) => SOURCE_EXT.has(path.extname(f)) && !path.basename(f).startsWith('next.config')
  );

  let vercel = 0;
  let rewritten = 0;
  let favicon = 0;
  for (const file of sources) {
    editFile(file, (src) => {
      let out = src;

      // 2. Strip Vercel analytics / speed insights (no telemetry from frozen builds).
      const beforeVercel = out;
      out = out
        .replace(
          /^\s*import\s+[^;]*?from\s+['"]@vercel\/(analytics|speed-insights)[^'"]*['"];?[ \t]*\r?\n/gm,
          ''
        )
        .replace(/^[ \t]*<(Analytics|SpeedInsights)\b[^>]*\/>[ \t]*\r?\n/gm, '')
        .replace(/<(Analytics|SpeedInsights)\b[^>]*\/>/g, '')
        .replace(/^[ \t]*<link[^>]*vitals\.vercel-insights\.com[^>]*\/>[ \t]*\r?\n/gm, '');
      if (out !== beforeVercel) vercel += 1;

      // 3. Favicons referenced but never shipped in that commit (e.g. /favicon.ico when only
      //    favicon.svg exists) would 404: point them at the one that exists.
      out = out.replace(/(['"`])\/(favicon\.(?:ico|svg|png))(['"`])/g, (m, q1, name, q2) => {
        if (fs.existsSync(path.join(publicDir, name))) return m;
        const alt = ['favicon.svg', 'favicon.ico', 'favicon.png'].find((n) =>
          fs.existsSync(path.join(publicDir, n))
        );
        if (!alt) return m;
        favicon += 1;
        return `${q1}/${alt}${q2}`;
      });

      // 4. Root-absolute public asset paths ("/assets/...", "/favicon...", url(/...)) don't get
      //    the basePath automatically (next/image with string src, <link href>, CSS url()).
      const beforeAbs = out;
      out = out.replace(
        /(['"`(]|url\(\s*['"]?)\/(assets\/|favicon\.)/g,
        (m, pre, rest) => `${pre}${basePath}/${rest}`
      );
      if (out !== beforeAbs) rewritten += 1;
      return out;
    });
  }
  if (vercel) applied.push(`stripped @vercel/* from ${vercel} file(s)`);
  if (favicon) applied.push(`fixed ${favicon} missing-favicon reference(s)`);
  if (rewritten) applied.push(`basePath-prefixed public asset paths in ${rewritten} file(s)`);
  return applied;
}

/** Per-version patches: *.patch (git apply), files/ overlay, patch.mjs (default export fn). */
async function applyVersionPatches(v, dir, basePath) {
  const pdir = path.join(PATCHES_DIR, v.id);
  const applied = [];
  if (!fs.existsSync(pdir)) return applied;
  for (const name of fs.readdirSync(pdir).sort()) {
    const p = path.join(pdir, name);
    if (name.endsWith('.patch') || name.endsWith('.diff')) {
      run('git', ['apply', '--whitespace=nowarn', '-p1', p], { cwd: dir });
      applied.push(name);
    } else if (name === 'files' && fs.statSync(p).isDirectory()) {
      fs.cpSync(p, dir, { recursive: true });
      applied.push('files/ overlay');
    }
  }
  const script = path.join(pdir, 'patch.mjs');
  if (fs.existsSync(script)) {
    const mod = await import(pathToFileURL(script).href);
    const notes = await mod.default({ dir, id: v.id, basePath, editFile, walk });
    applied.push(
      ...(Array.isArray(notes) && notes.length
        ? notes.map((n) => `patch.mjs: ${n}`)
        : ['patch.mjs'])
    );
  }
  return applied;
}

// ---------------------------------------------------------------------------------------------
// install / build / post-process

function lockfileOf(v) {
  return v.pm === 'pnpm' ? 'pnpm-lock.yaml' : 'yarn.lock';
}

function install(v, dir, node, env) {
  if (v.pm === 'pnpm') {
    const pnpm = ensureTool('pnpm', PNPM_VERSION, path.join('bin', 'pnpm.cjs'));
    run(
      node.bin,
      [pnpm, 'install', '--frozen-lockfile', '--ignore-scripts', '--reporter=append-only'],
      {
        cwd: dir,
        env: { ...env, NODE_ENV: 'development' },
      }
    );
    return `pnpm ${PNPM_VERSION} --frozen-lockfile`;
  }
  const yarn = ensureTool('yarn', YARN_VERSION, path.join('bin', 'yarn.js'));
  run(
    node.bin,
    [
      yarn,
      'install',
      '--frozen-lockfile',
      '--ignore-scripts',
      '--ignore-engines',
      '--non-interactive',
      '--network-timeout',
      '600000',
    ],
    { cwd: dir, env: { ...env, NODE_ENV: 'development' } }
  );
  return `yarn ${YARN_VERSION} --frozen-lockfile`;
}

function build(v, dir, node, env) {
  const nextBin = path.join(dir, 'node_modules', 'next', 'dist', 'bin', 'next');
  run(node.bin, [nextBin, 'build'], { cwd: dir, env });
  if (v.next < 13) run(node.bin, [nextBin, 'export', '-o', 'out'], { cwd: dir, env });
  const out = path.join(dir, 'out');
  if (!fs.existsSync(path.join(out, 'index.html')))
    throw new Error('export produced no index.html');
  return out;
}

/** Drop source maps and public/ files nothing in the export references. */
function prune(dir, out) {
  const removed = { maps: 0, unused: 0, bytes: 0 };
  const rm = (f) => {
    removed.bytes += fs.statSync(f).size;
    fs.rmSync(f);
  };
  for (const f of walk(out, { skip: new Set() })) {
    if (f.endsWith('.map')) {
      rm(f);
      removed.maps += 1;
    }
  }
  const corpus = walk(out, { skip: new Set() })
    .filter((f) => TEXT_EXT.has(path.extname(f)))
    .map((f) => fs.readFileSync(f, 'utf8'))
    .join('\n');
  const publicDir = path.join(dir, 'public');
  for (const f of walk(publicDir, { skip: new Set() })) {
    const rel = path.relative(publicDir, f).split(path.sep).join('/');
    const target = path.join(out, rel);
    if (!fs.existsSync(target)) continue;
    const referenced = corpus.includes(rel) || corpus.includes(encodeURI(rel));
    if (!referenced) {
      rm(target);
      removed.unused += 1;
    }
  }
  // Remove now-empty directories.
  const prunes = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) prunes(path.join(d, e.name));
    }
    if (d !== out && fs.readdirSync(d).length === 0) fs.rmdirSync(d);
  };
  prunes(out);
  return removed;
}

/**
 * Recompress oversized raster images in place (same path, same format, same aspect ratio) so the
 * frozen copies fit the size budget. Several commits shipped lossless multi-MB screenshots.
 */
async function optimizeImages(out) {
  const entry = ensureTool('sharp', SHARP_VERSION, 'package.json');
  const sharp = createRequire(entry)('sharp');
  const stats = { files: 0, before: 0, after: 0 };
  for (const f of walk(out, { skip: new Set() })) {
    const ext = path.extname(f).toLowerCase();
    if (!['.webp', '.png', '.jpg', '.jpeg'].includes(ext)) continue;
    const size = fs.statSync(f).size;
    if (size < 40 * 1024) continue;
    const input = fs.readFileSync(f);
    const meta = await sharp(input).metadata();
    let pipeline = sharp(input, { animated: false }).resize({
      width: Math.min(meta.width || 1600, 1600),
      withoutEnlargement: true,
    });
    if (ext === '.webp') pipeline = pipeline.webp({ quality: 78, alphaQuality: 90, effort: 6 });
    else if (ext === '.png')
      pipeline = pipeline.png({ palette: true, quality: 80, compressionLevel: 9 });
    else pipeline = pipeline.jpeg({ quality: 78, mozjpeg: true });
    const buf = await pipeline.toBuffer();
    if (buf.length < size * 0.9) {
      fs.writeFileSync(f, buf);
      stats.files += 1;
      stats.before += size;
      stats.after += buf.length;
    }
  }
  return stats;
}

/** Fail if the exported HTML/CSS still points at root-absolute URLs outside the basePath. */
function checkRootAbsolute(out, basePath) {
  const bad = [];
  const re =
    /(?:\b(?:src|href|srcSet|srcset|content)=["']|url\(\s*["']?|["']\s*)(\/(?:_next|assets|favicon)[^"')\s,]*)/g;
  for (const f of walk(out, { skip: new Set() })) {
    const ext = path.extname(f);
    if (ext !== '.html' && ext !== '.css') continue;
    const text = fs.readFileSync(f, 'utf8');
    for (const m of text.matchAll(re)) {
      if (!m[1].startsWith(`${basePath}/`)) bad.push(`${path.relative(out, f)}: ${m[1]}`);
    }
  }
  return bad;
}

// ---------------------------------------------------------------------------------------------
// main

async function buildVersion(v) {
  const started = Date.now();
  const basePath = `/versions/${v.id}`;
  const dir = path.join(SRC_DIR, v.id);
  const node = resolveNode(v.node);
  const env = envFor(node);

  // Reuse a previous install when the lockfile is identical (installs are slow).
  const stash = path.join(SRC_DIR, `.${v.id}.node_modules`);
  fs.rmSync(stash, { recursive: true, force: true });
  const stamp = path.join(dir, 'node_modules', '.frozen-install');
  if (!FRESH && fs.existsSync(stamp)) fs.renameSync(path.join(dir, 'node_modules'), stash);

  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  log(`extracting ${v.commit} -> ${dir}`);
  const archive = spawnSync('git', ['-C', REPO, 'archive', '--format=tar', v.commit], {
    maxBuffer: 1024 * 1024 * 512,
  });
  if (archive.status !== 0) throw new Error(`git archive ${v.commit} failed: ${archive.stderr}`);
  const tar = spawnSync('tar', ['-x', '-C', dir], { input: archive.stdout });
  if (tar.status !== 0) throw new Error(`tar failed: ${tar.stderr}`);

  const patches = [
    ...applyGenericPatches(v, dir, basePath),
    ...(await applyVersionPatches(v, dir, basePath)),
  ];
  log(`${v.id} patches:\n  - ${patches.join('\n  - ')}`);

  const lockHash = `${sha(path.join(dir, lockfileOf(v)))} node${node.version}`;
  let installer;
  if (
    fs.existsSync(stash) &&
    fs.readFileSync(path.join(stash, '.frozen-install'), 'utf8') === lockHash
  ) {
    fs.renameSync(stash, path.join(dir, 'node_modules'));
    installer = `${v.pm === 'pnpm' ? 'pnpm' : 'yarn'} (cached install)`;
    log(`${v.id}: reusing cached node_modules`);
  } else {
    fs.rmSync(stash, { recursive: true, force: true });
    installer = install(v, dir, node, env);
    fs.writeFileSync(stamp, lockHash);
  }

  const out = build(v, dir, node, env);
  const pruned = prune(dir, out);
  const images = await optimizeImages(out);
  const bad = checkRootAbsolute(out, basePath);
  if (bad.length)
    throw new Error(`root-absolute URLs escape the basePath:\n  ${bad.slice(0, 20).join('\n  ')}`);

  const target = path.join(PUBLIC_VERSIONS, v.id);
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(PUBLIC_VERSIONS, { recursive: true });
  fs.cpSync(out, target, { recursive: true });

  return {
    id: v.id,
    commit: v.commit,
    toolchain: `Node ${node.version}, ${installer}, Next ${v.next}`,
    patches,
    pruned,
    images,
    size: dirSize(target),
    seconds: Math.round((Date.now() - started) / 1000),
  };
}

async function main() {
  const wanted = process.argv.slice(2);
  const unknown = wanted.filter((id) => !MILESTONES.some((m) => m.id === id));
  if (unknown.length) {
    console.error(
      `Unknown version(s): ${unknown.join(', ')}. Known: ${MILESTONES.map((m) => m.id).join(', ')}`
    );
    process.exit(2);
  }
  const list = wanted.length ? MILESTONES.filter((m) => wanted.includes(m.id)) : MILESTONES;
  fs.mkdirSync(SRC_DIR, { recursive: true });
  log(`workdir: ${WORKDIR}`);

  const results = [];
  for (const v of list) {
    log(`==================== ${v.id} (${v.commit}) ====================`);
    try {
      results.push({ ok: true, ...(await buildVersion(v)) });
    } catch (err) {
      console.error(`[versions] ${v.id} FAILED: ${err.message}`);
      results.push({ ok: false, id: v.id, commit: v.commit, error: err.message });
    }
  }

  console.log('\n================ summary ================');
  for (const r of results) {
    if (r.ok) {
      console.log(
        `  OK    ${r.id.padEnd(11)} ${r.commit}  ${fmtSize(r.size).padStart(9)}  ${r.seconds}s  ${r.toolchain}` +
          `\n        pruned ${r.pruned.unused} unused public file(s) + ${r.pruned.maps} map(s) (${fmtSize(r.pruned.bytes)}),` +
          ` recompressed ${r.images.files} image(s) ${fmtSize(r.images.before)} -> ${fmtSize(r.images.after)}` +
          `\n        patches: ${r.patches.join('; ')}`
      );
    } else {
      console.log(`  FAIL  ${r.id.padEnd(11)} ${r.commit}  ${r.error.split('\n')[0]}`);
    }
  }
  if (fs.existsSync(PUBLIC_VERSIONS))
    console.log(`  total public/versions: ${fmtSize(dirSize(PUBLIC_VERSIONS))}`);
  if (results.some((r) => !r.ok)) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
