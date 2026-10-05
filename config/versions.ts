import { type LocalizedString } from './types';

export type SiteVersion = {
  label: string;
  year: string;
  title: LocalizedString;
  stack: string;
  /** Frozen static build served from public/, or null for the live site. */
  path: string | null;
};

/**
 * This site over the years. Past versions are real builds of old commits,
 * produced by `pnpm build:versions` (see scripts/build-versions.mjs).
 */
export const siteVersions: SiteVersion[] = [
  {
    label: 'v3',
    year: '2026',
    title: { en: 'Agent-era remake', fr: 'Refonte à l’ère des agents' },
    stack: 'Next 16 · R3F · Rapier',
    path: null,
  },
  {
    label: 'v2',
    year: '2025',
    title: { en: 'Tailwind redesign', fr: 'Refonte Tailwind' },
    stack: 'Next 16 · Tailwind 4',
    path: '/versions/v2.4',
  },
  {
    label: 'v1',
    year: '2022',
    title: { en: 'First portfolio', fr: 'Premier portfolio' },
    stack: 'Next 12 · Mantine · Framer Motion',
    path: '/versions/v1.0.3',
  },
];
