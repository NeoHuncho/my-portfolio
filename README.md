# William Guinaudie Portfolio

A personal portfolio website built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Server-side rendering with Next.js
- TypeScript for type safety
- Tailwind CSS for styling
- Framer Motion for animations
- Storybook for component development
- Jest with React Testing Library for testing
- Strict ESLint and Prettier configuration

## npm scripts

### Build and dev scripts

- `dev` – start dev server
- `build` – bundle application for production
- `export` – exports static website to `out` folder

### Testing scripts

- `typecheck` – checks TypeScript types
- `lint` – runs ESLint
- `lint:fix` – runs ESLint with auto-fix
- `prettier:check` – checks files with Prettier
- `prettier:write` – formats all files with Prettier
- `format` – runs Prettier and ESLint fix
- `jest` – runs jest tests
- `jest:watch` – starts jest watch
- `test` – runs `jest`, `prettier:check`, `lint` and `typecheck` scripts

### Other scripts

- `storybook` – starts storybook dev server
- `storybook:build` – build production storybook bundle to `storybook-static`
