import { type KeyboardEvent, useRef, useState } from 'react';
import Image from 'next/image';
import {
  FiArrowDown,
  FiArrowUpRight,
  FiChevronDown,
  FiClock,
  FiCpu,
  FiMapPin,
} from 'react-icons/fi';
import SectionHeading from '@components/SectionHeading';
import SwipeRow from '@components/SwipeRow';
import TechBadge from '@components/TechBadge';
import { type AiNote, type Experience, experiences } from '@config/experience';
import { sectionIds } from '@config/links';
import { useLanguage } from '@hooks/useLanguage';
import { cx } from '@lib/cx';
import PlanningIllustration from './PlanningIllustration';

const chronological = [...experiences].reverse();

function period(experience: Experience, present: string, locale: 'en' | 'fr') {
  return `${experience.from[locale]} – ${experience.to ? experience.to[locale] : present}`;
}

/** Main screenshot and its thumbnails, laid over the image when an AI section sits below. */
function Shots({ experience, compact }: { experience: Experience; compact: boolean }) {
  const [index, setIndex] = useState(0);
  const shot = experience.shots[index % experience.shots.length];

  const thumbnails = experience.shots.length > 1 && (
    <div className={cx('flex gap-2', compact ? 'absolute bottom-2.5 right-2.5' : 'mt-3')}>
      {experience.shots.map((item, i) => (
        <button
          key={item.src}
          type="button"
          onClick={() => setIndex(i)}
          aria-label={item.alt}
          aria-pressed={i === index}
          className={cx(
            'relative overflow-hidden rounded-md border bg-surface-2 transition',
            compact ? 'h-9 w-14 shadow-lg shadow-black/50' : 'h-12 w-20',
            i === index ? 'border-accent' : 'border-line opacity-70 hover:opacity-100'
          )}
        >
          <Image src={item.src} alt="" fill sizes="80px" className="object-cover" />
        </button>
      ))}
    </div>
  );

  return (
    <div className={cx('flex flex-col', !compact && 'h-full')}>
      <div
        className={cx(
          'relative overflow-hidden rounded-xl border border-line bg-surface-2',
          compact ? 'aspect-[2/1]' : 'min-h-64 flex-1 lg:min-h-80'
        )}
      >
        <Image
          key={shot.src}
          src={shot.src}
          alt={shot.alt}
          fill
          sizes="(min-width: 1024px) 600px, 100vw"
          className={cx('animate-ticket-in', compact ? 'object-cover' : 'object-contain p-4')}
        />
        {compact && thumbnails}
      </div>
      {!compact && thumbnails}
    </div>
  );
}

/** On phones the notes are cards side by side, one swipe apart, instead of one long box. */
function AiNotes({ notes, lead }: { notes: AiNote[]; lead?: string }) {
  const { strings, locale } = useLanguage();
  return (
    <div className="sm:rounded-xl sm:border sm:border-accent/30 sm:bg-accent-soft sm:p-4">
      <h4 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
        <FiCpu aria-hidden />
        {strings.experience.ai}
      </h4>
      {lead && <p className="mt-2 text-[13px] text-ink/75">{lead}</p>}
      <SwipeRow
        label={strings.experience.ai}
        className="mt-2 sm:space-y-2"
        itemClassName="max-sm:rounded-xl max-sm:border max-sm:border-accent/30 max-sm:bg-accent-soft max-sm:p-3.5"
      >
        {notes.map((note) => (
          // The note that has a working mock below carries a button to it, beside the text.
          <div
            key={note.title.en}
            className={cx(note.linkToBoard && 'sm:flex sm:items-center sm:gap-4')}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{note.title[locale]}</p>
              <p className="mt-0.5 text-[13px] leading-snug text-ink/75">{note.body[locale]}</p>
            </div>
            {note.linkToBoard && (
              <a
                href={`#${sectionIds.board}`}
                className="mt-2.5 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-[13px] font-semibold text-bg shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-accent/40 sm:mt-0"
              >
                {strings.experience.seeBoard}
                <FiArrowDown aria-hidden className="size-3.5" />
              </a>
            )}
          </div>
        ))}
      </SwipeRow>
    </div>
  );
}

/** What I built: always listed from `sm` up; folded on phones until asked for. */
function Built({ items }: { items: Experience['built'] }) {
  const { strings, locale } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-5">
      <h4 className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
        <span className="max-sm:hidden">{strings.experience.built}</span>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 uppercase tracking-[0.14em] transition hover:text-ink sm:hidden"
        >
          {strings.experience.built}
          <span className="text-faint/80">({items.length})</span>
          <FiChevronDown aria-hidden className={cx('transition-transform', open && 'rotate-180')} />
        </button>
      </h4>
      <ul className={cx('mt-3 space-y-2', !open && 'max-sm:hidden')}>
        {items.map((item) => (
          <li key={item.en} className="flex gap-3 text-sm leading-snug text-muted">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" aria-hidden />
            {item[locale]}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ExperienceSection() {
  const { strings, locale } = useLanguage();
  const [selectedId, setSelectedId] = useState(experiences[0].id);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = experiences.find((experience) => experience.id === selectedId) ?? experiences[0];
  const t = strings.experience;

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = chronological.findIndex((experience) => experience.id === selectedId);
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (delta === undefined) {
      return;
    }
    event.preventDefault();
    const next = (index + delta + chronological.length) % chronological.length;
    setSelectedId(chronological[next].id);
    tabs.current[next]?.focus();
  };

  return (
    <section
      id={sectionIds.experience}
      className="content-auto border-t border-line pb-4 pt-10 sm:pb-8 sm:pt-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} />

        {/* Career timeline: one equal step per role, oldest first. */}
        <div
          role="tablist"
          aria-label={t.eyebrow}
          className="relative mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-3"
        >
          <div
            className="absolute inset-x-8 top-1/2 hidden h-px bg-line-strong sm:block"
            aria-hidden
          />
          {chronological.map((experience, i) => {
            const active = experience.id === selectedId;
            return (
              <button
                key={experience.id}
                ref={(node) => {
                  tabs.current[i] = node;
                }}
                type="button"
                role="tab"
                id={`tab-${experience.id}`}
                aria-selected={active}
                aria-controls={`panel-${experience.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setSelectedId(experience.id)}
                onKeyDown={onKeyDown}
                className={cx(
                  'group relative min-w-0 overflow-hidden rounded-xl border px-3 py-2.5 text-left transition sm:rounded-2xl sm:px-5 sm:py-4',
                  active
                    ? 'border-accent bg-surface-2 shadow-[0_0_0_1px_var(--color-accent),0_18px_50px_-20px_var(--color-accent)]'
                    : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2'
                )}
              >
                <span
                  className={cx(
                    'absolute inset-x-0 top-0 h-1 transition',
                    active ? 'bg-accent' : 'bg-transparent group-hover:bg-line-strong'
                  )}
                  aria-hidden
                />
                <span className="flex items-start justify-between gap-2">
                  {/* Every role so far was full time: beside the dates, or under them on phones. */}
                  <span className="min-w-0 font-mono text-[10px] text-faint sm:text-[11px]">
                    <span className="block truncate sm:inline">
                      {period(experience, t.present, locale)}
                    </span>
                    <span className="block truncate text-muted sm:inline">
                      <span className="max-sm:hidden" aria-hidden>
                        {' · '}
                      </span>
                      {t.fullTime}
                    </span>
                  </span>
                  {!experience.to && (
                    <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                      <span
                        className="size-1.5 animate-pulse-dot rounded-full bg-accent"
                        aria-hidden
                      />
                      <span className="hidden sm:inline">{t.present}</span>
                    </span>
                  )}
                </span>
                <span
                  className={cx(
                    'mt-2 block text-sm font-semibold leading-tight tracking-tight sm:text-xl',
                    active ? 'text-ink' : 'text-muted group-hover:text-ink'
                  )}
                >
                  {experience.company}
                </span>
                <span className="mt-1 flex min-w-0 items-center gap-1 text-faint max-sm:hidden sm:text-sm">
                  <FiMapPin aria-hidden className="shrink-0" />
                  <span className="truncate">{experience.city[locale]}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Detail: text on the left, visuals on the right. */}
        <div
          key={selected.id}
          id={`panel-${selected.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${selected.id}`}
          className="animate-fade-up mt-5 grid grid-cols-[minmax(0,1fr)] gap-5 sm:mt-4 sm:gap-6 sm:rounded-3xl sm:border sm:border-line sm:bg-surface/40 sm:p-6 lg:grid-cols-2 lg:gap-8"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-xl font-semibold tracking-tight sm:text-3xl">
                {selected.company}
              </h3>
              {selected.link && (
                <a
                  href={selected.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
                >
                  {t.visit}
                  <FiArrowUpRight aria-hidden />
                </a>
              )}
            </div>
            <p className="mt-1 text-sm text-ink sm:text-base">{selected.role[locale]}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 font-mono text-xs text-faint">
              <span>{period(selected, t.present, locale)}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1 text-muted">
                <FiClock aria-hidden />
                {t.fullTime}
              </span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1 text-muted">
                <FiMapPin aria-hidden />
                {selected.city[locale]}
              </span>
              <span aria-hidden>·</span>
              <span>{selected.sector[locale]}</span>
            </p>
            <p className="mt-3 text-pretty text-sm text-muted sm:text-base">
              {selected.summary[locale]}
            </p>

            <dl className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3">
              {selected.metrics.map((metric) => (
                <div
                  key={metric.value}
                  className="rounded-xl bg-surface-2 px-2.5 py-2 sm:px-3 sm:py-2.5"
                >
                  <dt className="sr-only">{metric.label[locale]}</dt>
                  <dd>
                    <span className="block text-base font-semibold tracking-tight sm:text-xl">
                      {metric.value}
                    </span>
                    <span className="block text-[11px] leading-snug text-faint sm:text-xs">
                      {metric.label[locale]}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            <Built items={selected.built} />

            <ul
              className="no-scrollbar mt-5 flex gap-1.5 max-sm:-mx-4 max-sm:overflow-x-auto max-sm:px-4 sm:flex-wrap"
              aria-label={t.stack}
            >
              {selected.stack.map((tech) => (
                <li key={tech} className="shrink-0">
                  <TechBadge name={tech} />
                </li>
              ))}
            </ul>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            {selected.shots.length > 0 ? (
              <Shots experience={selected} compact={Boolean(selected.ai)} />
            ) : (
              <PlanningIllustration note={t.confidential} />
            )}
            {selected.ai && <AiNotes notes={selected.ai} lead={selected.aiLead?.[locale]} />}
          </div>
        </div>
      </div>
    </section>
  );
}
