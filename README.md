# William Guinaudie · AI Engineer

Personal portfolio. Next.js 16 (Pages Router), React 19, Tailwind CSS 4, TypeScript, pnpm.

## What is on the page

- **Hero**: a 3D physics desk (React Three Fiber + Rapier). Drag and throw objects, click one to
  read why it is there, drop the ticket on an agent. Falls back to a static desk without WebGL or
  with reduced motion.
- **Experience**: an interactive timeline of roles.
- **How I work**: an interactive board for a fictional company. You accept, ask about or reject
  agent proposals, run the daily cycle, and review pull requests before release.
- **Side projects**: a working Pomi demo with a synced watch, and one GameHub Rota match played on a
  desktop and a phone frame at once, with GameHub's library a tap away (a real build served from
  `public/games/`).
- **Past versions**: the `v3` badge in the header opens frozen builds of the 2022 and 2025 versions
  of this site, served from `public/versions/`.

## Scripts

- `dev`, `build`, `start`: Next.js
- `analyze`: production build with the bundle analyzer
- `test`: Prettier check, ESLint, typecheck and Jest
- `typecheck`, `lint`, `lint:fix`, `prettier:check`, `prettier:write`, `format`, `jest`,
  `jest:watch`
- `build:versions`: rebuilds the frozen past versions from git history into `public/versions/` (see
  `scripts/build-versions.mjs`)
- `build:games`: rebuilds the GameHub embeds into `public/games/` from a local GameHub checkout (see
  `scripts/build-games.mjs`)
