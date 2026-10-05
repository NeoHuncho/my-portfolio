import { type CSSProperties, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { FiArrowUpRight, FiCpu, FiGithub, FiStar } from 'react-icons/fi';
import SectionHeading from '@components/SectionHeading';
import SwipeRow from '@components/SwipeRow';
import TechBadge from '@components/TechBadge';
import { sectionIds } from '@config/links';
import {
  type Callout,
  type FeaturedProject,
  featuredProjects,
  smallProjects,
} from '@config/sideProjects';
import { useLanguage } from '@hooks/useLanguage';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { cx } from '@lib/cx';
import GameFrame from './GameFrame';
import { useEarlyLoad } from './useEarlyLoad';

const PomiDemo = dynamic(() => import('./pomi/PomiDemo'), {
  ssr: false,
  loading: () => <div className="h-[568px] w-full animate-pulse rounded-2xl bg-surface-2" />,
});

/**
 * A static build of GameHub, produced by `pnpm build:games`: one Rota match, shown on a
 * desktop and on a phone. Frames opened with the same match number share it live.
 */
const rotaMatch = (match: number) => `/games/play.html?game=rota&match=${match}`;
const screens = {
  desktop: { width: 1100, height: 690 },
  phone: { width: 390, height: 844 },
};

/**
 * Side by side, the phone column is as wide as it takes for both frames to be
 * the same height: the desktop's title bar and the phone's bezel (in GameFrame)
 * are fixed, the screens keep their ratios, and the gap is the grid's.
 */
const DESKTOP_BAR = 27;
const PHONE_BEZEL = 20;
const DEMO_GAP = 24;
const phoneColumn = (() => {
  const desktop = screens.desktop.height / screens.desktop.width;
  const phone = screens.phone.height / screens.phone.width;
  const fixed = DESKTOP_BAR - PHONE_BEZEL + PHONE_BEZEL * phone;
  return `calc(((100% - ${DEMO_GAP}px) * ${desktop.toFixed(5)} + ${fixed.toFixed(3)}px) / ${(desktop + phone).toFixed(5)})`;
})();

/** `split` lays the pitch and the details side by side, when the demo sits below instead. */
function ProjectInfo({ project, split = false }: { project: FeaturedProject; split?: boolean }) {
  const { locale } = useLanguage();
  return (
    <div
      className={cx(
        'min-w-0',
        split
          ? 'grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-4 lg:grid-cols-2'
          : 'flex h-full flex-col'
      )}
    >
      <div className="flex min-w-0 flex-col">
        <div className="flex items-center gap-3">
          {project.id === 'pomi' ? (
            <Image
              src="/assets/side-projects/pomi-logo.webp"
              alt=""
              width={40}
              height={40}
              className="rounded-xl"
            />
          ) : (
            <span
              className="grid size-10 place-items-center rounded-xl font-mono text-sm font-bold text-bg"
              style={{ background: project.accent }}
              aria-hidden
            >
              GH
            </span>
          )}
          <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{project.name}</h3>
        </div>
        <p className="mt-3 text-base text-ink sm:text-lg">{project.tagline[locale]}</p>
        <p className="mt-1.5 text-pretty text-sm text-muted sm:text-base">
          {project.description[locale]}
        </p>
        {split && <SourceLink href={project.github} />}
      </div>

      <div className={cx('flex min-w-0 flex-col', split ? 'lg:self-end' : 'flex-1')}>
        {/* Platforms, then the stack: wrapped from `sm` up, one scrolling line on phones. */}
        <div
          className={cx(
            'no-scrollbar flex items-center gap-1.5 max-sm:-mx-4 max-sm:overflow-x-auto max-sm:px-4 sm:flex-wrap',
            !split && 'mt-4'
          )}
        >
          {project.platforms.map((platform) => (
            <span
              key={platform}
              className="shrink-0 rounded-md bg-surface-3 px-2 py-1 text-[11px] leading-none text-ink"
            >
              {platform}
            </span>
          ))}
          <span aria-hidden className="mx-1 h-4 w-px shrink-0 bg-line-strong sm:hidden" />
          {project.stack.map((tech) => (
            <span key={tech} className="shrink-0 sm:hidden">
              <TechBadge name={tech} />
            </span>
          ))}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5 max-sm:hidden">
          {project.stack.map((tech) => (
            <TechBadge key={tech} name={tech} />
          ))}
        </div>

        {!split && <Callouts callouts={project.callouts} />}

        {!split && <SourceLink href={project.github} />}
      </div>

      {split && (
        <div className="lg:col-span-2">
          <Callouts callouts={project.callouts} columns />
        </div>
      )}
    </div>
  );
}

/** How AI fits into the project, in the same accent box as the experience entries. Phones skip the specifics and swipe between boxes. */
function Callouts({ callouts, columns = false }: { callouts?: Callout[]; columns?: boolean }) {
  const { strings, locale } = useLanguage();
  if (!callouts?.length) {
    return null;
  }
  return (
    <div className={cx('mt-4', columns && 'sm:mt-1')}>
      <SwipeRow
        label={strings.experience.ai}
        className={cx('sm:grid sm:gap-3', columns && 'sm:grid-cols-2')}
        itemClassName="rounded-xl border border-accent/30 bg-accent-soft p-4"
        itemWidth={callouts.length > 1 ? 'max-sm:w-[85%]' : 'max-sm:w-full'}
      >
        {callouts.map((callout) => (
          <div key={callout.title.en}>
            <p className="flex items-center gap-2 text-sm font-medium text-ink">
              <FiCpu aria-hidden className="shrink-0 text-accent" />
              {callout.title[locale]}
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink/80">{callout.body[locale]}</p>
            {callout.points && (
              <ul className="mt-2 space-y-1.5 max-sm:hidden">
                {callout.points.map((point) => (
                  <li key={point.en} className="flex gap-2.5 text-[13px] leading-snug text-ink/80">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" aria-hidden />
                    {point[locale]}
                  </li>
                ))}
              </ul>
            )}
            {callout.linkToBoard && (
              <a
                href={`#${sectionIds.board}`}
                className="mt-2.5 inline-block font-mono text-xs text-accent hover:underline"
              >
                ↑ {strings.nav.board}
              </a>
            )}
          </div>
        ))}
      </SwipeRow>
    </div>
  );
}

function SourceLink({ href }: { href: string }) {
  const { strings } = useLanguage();
  return (
    <div className="mt-auto pt-5">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-bg transition hover:bg-white"
      >
        <FiGithub aria-hidden />
        {strings.sideProjects.source}
      </a>
    </div>
  );
}

function DemoLabel({ note }: { note: string }) {
  const { strings } = useLanguage();
  return (
    <p className="mb-4 flex items-center gap-2 font-mono text-[11px] text-faint max-sm:justify-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-ok/15 px-2 py-0.5 uppercase tracking-wider text-ok">
        <span className="size-1.5 animate-pulse-dot rounded-full bg-ok" aria-hidden />
        {strings.sideProjects.liveDemo}
      </span>
      <span className="max-sm:hidden">{note}</span>
    </p>
  );
}

function Glow({ color }: { color: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background: `radial-gradient(80% 60% at 80% 0%, color-mix(in srgb, ${color} 16%, transparent), transparent 70%)`,
      }}
      aria-hidden
    />
  );
}

function PomiBlock({ project }: { project: FeaturedProject }) {
  const { locale } = useLanguage();
  return (
    <article className="relative grid grid-cols-[minmax(0,1fr)] gap-6 overflow-hidden rounded-3xl border border-line bg-surface/50 p-4 sm:gap-8 sm:p-7 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
      <Glow color={project.accent} />
      <div className="relative self-stretch">
        <ProjectInfo project={project} />
      </div>
      <div className="relative min-w-0">
        <PomiDemo locale={locale} />
      </div>
    </article>
  );
}

function GameHubBlock({ project }: { project: FeaturedProject }) {
  const { strings } = useLanguage();
  const t = strings.sideProjects;
  const { ref, load } = useEarlyLoad();
  // Picked once per visit, on the client; both frames open the same match.
  const [match, setMatch] = useState<number | null>(null);
  useEffect(() => {
    if (load) {
      setMatch((current) => current ?? (crypto.getRandomValues(new Uint32Array(1))[0] || 1));
    }
  }, [load]);
  const src = match === null ? null : rotaMatch(match);
  // Phones get the phone only: a desktop scaled to their width is too small to play.
  const roomy = useMediaQuery('(min-width: 640px)');
  return (
    <article className="relative overflow-hidden rounded-3xl border border-line bg-surface/50 p-4 sm:p-7">
      <Glow color={project.accent} />
      <div className="relative">
        <ProjectInfo project={project} split />
      </div>
      <div ref={ref} className="relative mt-5 border-t border-line pt-4 sm:mt-6 sm:pt-5">
        <DemoLabel note={t.gamesNote} />
        <div
          className="mx-auto grid max-w-5xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_var(--phone-column)]"
          style={{ '--phone-column': phoneColumn } as CSSProperties}
        >
          {roomy && (
            <GameFrame device="desktop" src={src} {...screens.desktop} title={t.rotaDesktop} />
          )}
          <div className="mx-auto w-full max-w-[260px] sm:max-w-[220px] lg:max-w-none">
            <GameFrame device="phone" src={src} {...screens.phone} title={t.rotaPhone} />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function SideProjectsSection() {
  const { strings, locale } = useLanguage();
  const t = strings.sideProjects;

  // No content-visibility here, unlike the other sections: the games load before the visitor
  // scrolls to them, and a frame inside a skipped subtree never sizes its 3D canvas.
  return (
    <section
      id={sectionIds.sideProjects}
      className="border-t border-line pb-4 pt-10 sm:pb-8 sm:pt-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

        <div className="mt-6 space-y-4 sm:mt-10 sm:space-y-5">
          {featuredProjects.map((project) =>
            project.id === 'pomi' ? (
              <PomiBlock key={project.id} project={project} />
            ) : (
              <GameHubBlock key={project.id} project={project} />
            )
          )}
        </div>

        <h3 className="mt-10 font-mono text-[11px] uppercase tracking-[0.14em] text-faint sm:mt-12">
          {t.more}
        </h3>
        <SwipeRow
          label={t.more}
          className="mt-4 sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-4"
          itemWidth="max-sm:w-[75%]"
        >
          {smallProjects.map((project) => {
            const repos = [project.github ?? []].flat();
            return (
              <div
                key={project.name}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface/40"
              >
                <div className="relative aspect-[2/1] bg-surface-2">
                  <Image
                    src={project.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
                    className={cx('object-cover', project.archived && 'opacity-60 grayscale')}
                  />
                </div>
                <div className="flex flex-1 flex-col p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium">{project.name}</h4>
                    {project.stars && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded bg-[#e3b341]/15 px-1.5 py-0.5 font-mono text-[10px] text-[#e3b341]">
                        <FiStar aria-hidden className="size-3 fill-current" />
                        {t.stars(project.stars)}
                      </span>
                    )}
                    {project.archived && (
                      <span className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-faint">
                        {t.archived}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-[11px] text-faint">{project.period}</p>
                  <p className="mt-1.5 text-sm text-muted">{project.description[locale]}</p>
                  <div className="mt-auto flex flex-wrap gap-3 pt-3 text-xs">
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-muted hover:text-ink"
                      >
                        {strings.experience.visit}
                        <FiArrowUpRight aria-hidden />
                      </a>
                    )}
                    {repos.map((repo) => (
                      <a
                        key={repo}
                        href={repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-muted hover:text-ink"
                      >
                        <FiGithub aria-hidden />
                        {repo.split('/').slice(-1)[0]}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </SwipeRow>
      </div>
    </section>
  );
}
