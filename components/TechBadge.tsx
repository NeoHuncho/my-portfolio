import { type CSSProperties } from 'react';
import { type IconType } from 'react-icons';
import {
  SiAlgolia,
  SiClaude,
  SiDocker,
  SiExpress,
  SiFirebase,
  SiJest,
  SiKubernetes,
  SiLeaflet,
  SiMantine,
  SiMongodb,
  SiMui,
  SiMysql,
  SiNestjs,
  SiNextdotjs,
  SiNodedotjs,
  SiNx,
  SiOpenrouter,
  SiPhp,
  SiPostgresql,
  SiPuppeteer,
  SiReact,
  SiReactquery,
  SiRedis,
  SiRedux,
  SiSentry,
  SiSequelize,
  SiSqlite,
  SiTailwindcss,
  SiTauri,
  SiThreedotjs,
  SiTypescript,
  SiVite,
  SiWoocommerce,
} from 'react-icons/si';
import { cx } from '@lib/cx';

type Theme = {
  /** Brand colour, nudged lighter where the official one disappears on a dark page. */
  color: string;
  Icon?: IconType;
  /** Monochrome brands (Next.js, Express…) read as a solid black chip. */
  mono?: boolean;
};

const themes: Record<string, Theme> = {
  Nx: { color: '#8ec9f0', Icon: SiNx },
  'Next.js': { color: '#ffffff', Icon: SiNextdotjs, mono: true },
  React: { color: '#61dafb', Icon: SiReact },
  'React Native': { color: '#61dafb', Icon: SiReact },
  MUI: { color: '#3d9bff', Icon: SiMui },
  'TanStack Query': { color: '#ff4154', Icon: SiReactquery },
  'React Query': { color: '#ff4154', Icon: SiReactquery },
  NestJS: { color: '#ea2845', Icon: SiNestjs },
  MikroORM: { color: '#5aa0e6' },
  PostgreSQL: { color: '#6f9fdc', Icon: SiPostgresql },
  'AG Grid': { color: '#2fa3e6' },
  Playwright: { color: '#5cc461' },
  Kubernetes: { color: '#5b8def', Icon: SiKubernetes },
  'Claude Code': { color: '#d97757', Icon: SiClaude },
  Codex: { color: '#a59cff' },
  'React Admin': { color: '#3d9bff' },
  Zustand: { color: '#c9a27a' },
  Lingui: { color: '#f1a33b' },
  Leaflet: { color: '#6cc24a', Icon: SiLeaflet },
  Node: { color: '#6cc24a', Icon: SiNodedotjs },
  Express: { color: '#ffffff', Icon: SiExpress, mono: true },
  MySQL: { color: '#5d9bd1', Icon: SiMysql },
  Sequelize: { color: '#52b0e7', Icon: SiSequelize },
  Docker: { color: '#2496ed', Icon: SiDocker },
  Puppeteer: { color: '#40b5a4', Icon: SiPuppeteer },
  Sentry: { color: '#a294d6', Icon: SiSentry },
  Jest: { color: '#e05a6a', Icon: SiJest },
  TypeScript: { color: '#4a90e2', Icon: SiTypescript },
  Redux: { color: '#9b72db', Icon: SiRedux },
  Mantine: { color: '#339af0', Icon: SiMantine },
  Firebase: { color: '#ffca28', Icon: SiFirebase },
  MongoDB: { color: '#4fb34f', Icon: SiMongodb },
  Algolia: { color: '#7d8cff', Icon: SiAlgolia },
  PHP: { color: '#8f93d6', Icon: SiPhp },
  WooCommerce: { color: '#b77aa9', Icon: SiWoocommerce },
  Vite: { color: '#a78bfa', Icon: SiVite },
  Tauri: { color: '#24c8d8', Icon: SiTauri },
  Redis: { color: '#ff4438', Icon: SiRedis },
  OpenRouter: { color: '#cbd5e1', Icon: SiOpenrouter },
  'three.js': { color: '#ffffff', Icon: SiThreedotjs, mono: true },
  Tailwind: { color: '#38bdf8', Icon: SiTailwindcss },
  SQLite: { color: '#4fa8dc', Icon: SiSqlite },
};

/** "React 19" and "Tailwind 4" share the theme of "React" and "Tailwind". */
function themeFor(name: string): Theme | undefined {
  return themes[name] ?? themes[name.replace(/\s+\d+(\.\d+)*$/, '')];
}

/** A compact technology chip in the brand's own colours and mark. */
export default function TechBadge({ name, className }: { name: string; className?: string }) {
  const theme = themeFor(name);
  let style: CSSProperties | undefined;
  if (theme?.mono) {
    style = { color: theme.color, background: '#000', borderColor: 'rgb(255 255 255 / 0.22)' };
  } else if (theme) {
    style = {
      color: theme.color,
      background: `color-mix(in srgb, ${theme.color} 12%, transparent)`,
      borderColor: `color-mix(in srgb, ${theme.color} 32%, transparent)`,
    };
  }
  const Icon = theme?.Icon;

  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-[11px] font-medium leading-none tracking-tight text-muted',
        className
      )}
      style={style}
    >
      {Icon && <Icon aria-hidden className="size-3 shrink-0" />}
      {name}
    </span>
  );
}
