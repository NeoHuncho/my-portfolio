// Portfolio embed build: a plain Vite SPA (no vinext / RSC) whose only page is
// play.html, served by the portfolio under BASE (default /games/).
// Copied into the Gamehub worktree by scripts/build-games.mjs.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/postcss';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));
const base = process.env.EMBED_BASE || '/games/';
const outDir = process.env.EMBED_OUT || path.join(root, 'dist-embed');

// Gamehub refers to its public files by absolute path ('/art/…', '/audio/…', and inside
// srcset lists, '…320w, /art/…'). Prefix them with the embed base in source so the build is
// self-contained.
const PUBLIC_DIRS = ['art', 'audio', '3d', 'maps', 'geography'];
const publicRef = new RegExp(`(['"\`(]|, )/(${PUBLIC_DIRS.join('|')})/`, 'g');
function prefixPublicPaths() {
  return {
    name: 'gamehub-embed-public-paths',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?')[0];
      if (file.includes('/node_modules/') || !/\.(tsx?|jsx?|css|json)$/.test(file)) return null;
      if (!publicRef.test(code)) return null;
      publicRef.lastIndex = 0;
      return { code: code.replace(publicRef, `$1${base}$2/`), map: null };
    },
    // CSS pulled in through @import is inlined by PostCSS and never passes
    // through `transform`; catch whatever is left in the emitted files.
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === 'chunk') file.code = file.code.replace(publicRef, `$1${base}$2/`);
        else if (/\.(css|js|json)$/.test(file.fileName) && typeof file.source === 'string')
          file.source = file.source.replace(publicRef, `$1${base}$2/`);
      }
    },
  };
}

export default defineConfig({
  root,
  base,
  publicDir: false,
  css: { postcss: { plugins: [tailwindcss()] } },
  resolve: {
    alias: { '@': root },
    dedupe: ['react', 'react-dom'],
  },
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  plugins: [prefixPublicPaths(), react()],
  worker: { format: 'es', plugins: () => [prefixPublicPaths()] },
  build: {
    outDir,
    emptyOutDir: true,
    sourcemap: false,
    assetsDir: 'app',
    chunkSizeWarningLimit: 4096,
    rollupOptions: { input: { play: path.join(root, 'play.html') } },
  },
});
