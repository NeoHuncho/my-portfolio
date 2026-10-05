import {
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type IconType } from 'react-icons';
import {
  FiArrowUpRight,
  FiBriefcase,
  FiCheck,
  FiClock,
  FiCode,
  FiCopy,
  FiDownload,
  FiFolder,
  FiGitPullRequest,
  FiGithub,
  FiGlobe,
  FiGrid,
  FiLayers,
  FiLinkedin,
  FiMail,
  FiMic,
  FiMonitor,
  FiSearch,
  FiSmartphone,
  FiTrello,
  FiX,
} from 'react-icons/fi';
import { experiences } from '@config/experience';
import { links, sectionIds } from '@config/links';
import { featuredProjects, smallProjects } from '@config/sideProjects';
import { siteVersions } from '@config/versions';
import { useLanguage } from '@hooks/useLanguage';
import { usePrefersReducedMotion } from '@hooks/usePrefersReducedMotion';
import { cx } from '@lib/cx';

/**
 * Anything can open the palette by dispatching this event on window,
 * e.g. `window.dispatchEvent(new CustomEvent(OPEN_COMMAND_PALETTE))`.
 */
export const OPEN_COMMAND_PALETTE = 'command-palette:open';

export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent(OPEN_COMMAND_PALETTE));
}

type GroupId =
  'recent' | 'navigate' | 'actions' | 'experience' | 'sideProjects' | 'links' | 'versions';

const groupOrder: GroupId[] = [
  'recent',
  'navigate',
  'actions',
  'experience',
  'sideProjects',
  'links',
  'versions',
];

type Item = {
  id: string;
  group: Exclude<GroupId, 'recent'>;
  label: string;
  subtitle?: string;
  /** Extra search terms, never shown. */
  keywords?: string;
  Icon: IconType;
  hint?: string;
  /** Opened synchronously so popup blockers allow it. */
  href?: string;
  /** Runs after the palette closes, unless `stay` is set. */
  perform?: () => void;
  /** Keep the palette open after running (copy, language). */
  stay?: boolean;
};

type Section = { group: GroupId; items: Item[] };

const RECENT_KEY = 'command-palette:recent';
const RECENT_MAX = 3;
const EXIT_MS = 140;
const email = links.email.replace(/^mailto:/, '');

const projectIcons: Record<string, IconType> = {
  pomi: FiClock,
  gamehub: FiGrid,
  'Vikunja Voice Assistant': FiMic,
  'Open source contributions': FiGitPullRequest,
  Second: FiSearch,
  'Brawl Max': FiSmartphone,
};

function readRecent(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function writeRecent(ids: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(ids));
  } catch {
    // Storage can be blocked; recents are a convenience.
  }
}

/** Lowercase and strip accents, keeping one character per UTF-16 unit so indices line up. */
function fold(text: string): string {
  return text
    .split('')
    .map((char) => (char.normalize('NFD')[0] ?? char).toLowerCase()[0] ?? char)
    .join('');
}

/** Higher is better; null means no match. */
function score(item: Item, query: string): number | null {
  const label = fold(item.label);
  const rest = fold(`${item.subtitle ?? ''} ${item.keywords ?? ''}`);
  if (label === query) {
    return 1000;
  }
  if (label.startsWith(query)) {
    return 900 - label.length;
  }
  if (label.split(/[\s·/&().-]+/).some((word) => word.startsWith(query))) {
    return 800;
  }
  if (label.includes(query)) {
    return 700 - label.indexOf(query);
  }
  if (rest.split(/[\s·/&().,-]+/).some((word) => word.startsWith(query))) {
    return 600;
  }
  const tokens = query.split(/\s+/).filter(Boolean);
  const haystack = `${label} ${rest}`;
  if (tokens.every((token) => haystack.includes(token))) {
    return 500 - tokens.length;
  }
  // Loose subsequence on the label: "ghsrc" finds "GameHub source code".
  if (query.length < 2) {
    return null;
  }
  let position = -1;
  let first = -1;
  for (const char of query.replace(/\s+/g, '')) {
    position = label.indexOf(char, position + 1);
    if (position === -1) {
      return null;
    }
    if (first === -1) {
      first = position;
    }
  }
  const spread = position - first + 1 - query.length;
  return spread > query.length * 3 ? null : 300 - spread - first;
}

function Highlight({ text, query }: { text: string; query: string }) {
  const index = query ? fold(text).indexOf(query) : -1;
  if (index === -1) {
    return text;
  }
  return (
    <>
      {text.slice(0, index)}
      <span className="text-accent">{text.slice(index, index + query.length)}</span>
      {text.slice(index + query.length)}
    </>
  );
}

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || Boolean(target.closest('input, textarea, select')))
  );
}

function scrollToElement(element: Element | null | undefined, smooth: boolean) {
  element?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
}

function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cx(
        'inline-grid h-5 min-w-5 place-items-center rounded border border-line-strong bg-surface-2 px-1 font-mono text-[10px] leading-none text-muted',
        className
      )}
    >
      {children}
    </kbd>
  );
}

export default function CommandPalette() {
  const { strings, locale, toggleLocale } = useLanguage();
  const t = strings.palette;
  const reducedMotion = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [isMac, setIsMac] = useState(true);
  const openRef = useRef(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const input = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const listId = `${baseId}-list`;
  const smooth = !reducedMotion;

  const show = useCallback(() => {
    clearTimeout(exitTimer.current);
    if (!openRef.current && document.activeElement instanceof HTMLElement) {
      returnFocus.current = document.activeElement;
    }
    openRef.current = true;
    setIsMac(/mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent));
    setRecent(readRecent());
    setQuery('');
    setActive(0);
    setCopied(false);
    setMounted(true);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    if (!openRef.current) {
      return;
    }
    openRef.current = false;
    setOpen(false);
    clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(() => setMounted(false), reducedMotion ? 0 : EXIT_MS);
    returnFocus.current?.focus({ preventScroll: true });
    returnFocus.current = null;
  }, [reducedMotion]);

  // Global shortcuts: "/" outside text fields, Cmd/Ctrl+K anywhere.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing) {
        return;
      }
      const mod = event.metaKey || event.ctrlKey;
      if (mod && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (openRef.current) {
          hide();
        } else {
          show();
        }
        return;
      }
      if (
        event.key === '/' &&
        !mod &&
        !event.altKey &&
        !openRef.current &&
        !isTyping(event.target)
      ) {
        event.preventDefault();
        show();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener(OPEN_COMMAND_PALETTE, show);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener(OPEN_COMMAND_PALETTE, show);
    };
  }, [show, hide]);

  // Lock page scroll while open; layout effect so it is released before any scroll action runs.
  useLayoutEffect(() => {
    if (!open) {
      return undefined;
    }
    const { body } = document;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    body.style.overflow = 'hidden';
    if (gap > 0) {
      body.style.paddingRight = `${gap}px`;
    }
    input.current?.focus({ preventScroll: true });
    return () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
    };
  }, [open]);

  useEffect(() => () => clearTimeout(exitTimer.current), []);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  const items = useMemo<Item[]>(() => {
    const { nav } = strings;
    const list: Item[] = [
      {
        id: 'nav-playground',
        group: 'navigate',
        label: nav.playground,
        subtitle: t.playground,
        keywords: 'desk bureau home top hero accueil 3d',
        Icon: FiMonitor,
        perform: () => scrollToElement(document.getElementById(sectionIds.playground), smooth),
      },
      {
        id: 'nav-experience',
        group: 'navigate',
        label: nav.experience,
        keywords: 'experience expérience work jobs career carrière',
        Icon: FiBriefcase,
        perform: () => scrollToElement(document.getElementById(sectionIds.experience), smooth),
      },
      {
        id: 'nav-board',
        group: 'navigate',
        label: nav.board,
        keywords: 'board workflow agents tickets méthode process',
        Icon: FiTrello,
        perform: () => scrollToElement(document.getElementById(sectionIds.board), smooth),
      },
      {
        id: 'nav-side-projects',
        group: 'navigate',
        label: nav.sideProjects,
        keywords: 'side projects projets perso open source',
        Icon: FiFolder,
        perform: () => scrollToElement(document.getElementById(sectionIds.sideProjects), smooth),
      },
      {
        id: 'action-cv',
        group: 'actions',
        label: t.cv,
        keywords: 'cv resume résumé curriculum pdf download télécharger',
        Icon: FiDownload,
        hint: 'PDF',
        href: links.cv[locale],
      },
      {
        id: 'action-copy-email',
        group: 'actions',
        label: t.copyEmail,
        subtitle: email,
        keywords: 'email mail contact copier copy',
        Icon: FiCopy,
        stay: true,
        perform: () => {
          navigator.clipboard?.writeText(email).then(
            () => setCopied(true),
            () => undefined
          );
        },
      },
      {
        id: 'action-email',
        group: 'actions',
        label: t.emailMe,
        keywords: 'email mail contact écrire write hire',
        Icon: FiMail,
        href: links.email,
      },
      {
        id: 'action-language',
        group: 'actions',
        label: t.switchLanguage,
        keywords: 'language langue english anglais french français fr en',
        Icon: FiGlobe,
        hint: locale === 'en' ? 'EN → FR' : 'FR → EN',
        stay: true,
        perform: toggleLocale,
      },
      ...experiences.map<Item>((experience) => ({
        id: `experience-${experience.id}`,
        group: 'experience',
        label: experience.company,
        subtitle: experience.role[locale],
        keywords: `${experience.stack.join(' ')} ${experience.city[locale]} ${experience.sector[locale]}`,
        Icon: FiBriefcase,
        hint: `${experience.from[locale]} – ${experience.to?.[locale] ?? strings.experience.present}`,
        perform: () => {
          // The timeline tabs are plain buttons: clicking one selects that role.
          document.getElementById(`tab-${experience.id}`)?.click();
          scrollToElement(document.getElementById(sectionIds.experience), smooth);
        },
      })),
      ...[
        ...featuredProjects.map((project) => ({
          key: project.id,
          name: project.name,
          subtitle: project.tagline[locale],
          keywords: `${project.stack.join(' ')} ${project.platforms.join(' ')}`,
          hint: undefined as string | undefined,
        })),
        ...smallProjects.map((project) => ({
          key: project.name,
          name: project.name,
          subtitle: project.description[locale],
          keywords: '',
          hint: project.period,
        })),
      ].map<Item>((project) => ({
        id: `project-${project.key}`,
        group: 'sideProjects',
        label: project.name,
        subtitle: project.subtitle,
        keywords: project.keywords,
        Icon: projectIcons[project.key] ?? FiFolder,
        hint: project.hint,
        perform: () => {
          const section = document.getElementById(sectionIds.sideProjects);
          const heading = Array.from(section?.querySelectorAll('h3, h4') ?? []).find(
            (node) => node.textContent?.trim() === project.name
          );
          scrollToElement(heading?.closest('article, li') ?? heading ?? section, smooth);
        },
      })),
      {
        id: 'link-github',
        group: 'links',
        label: 'GitHub',
        subtitle: links.github.replace(/^https:\/\//, ''),
        keywords: 'code repos',
        Icon: FiGithub,
        href: links.github,
      },
      {
        id: 'link-linkedin',
        group: 'links',
        label: 'LinkedIn',
        keywords: 'profile profil network réseau',
        Icon: FiLinkedin,
        href: links.linkedin,
      },
      ...featuredProjects.map<Item>((project) => ({
        id: `source-${project.id}`,
        group: 'links',
        label: t.source(project.name),
        subtitle: project.github.replace(/^https:\/\/github\.com\//, ''),
        keywords: 'github repo source code',
        Icon: FiCode,
        href: project.github,
      })),
      ...smallProjects.flatMap<Item>((project) => {
        const repos = [project.github ?? []].flat();
        const contribution = repos.length > 1;
        return repos.map((repo) => ({
          id: `source-${repo}`,
          group: 'links',
          label: contribution
            ? repo.replace(/^https:\/\/github\.com\//, '')
            : t.source(project.name),
          subtitle: contribution ? t.contribution : repo.replace(/^https:\/\/github\.com\//, ''),
          keywords: 'github repo source code open source',
          Icon: contribution ? FiGitPullRequest : FiCode,
          href: repo,
        }));
      }),
      ...siteVersions
        .filter((version) => version.path)
        .map<Item>((version) => ({
          id: `version-${version.label}`,
          group: 'versions',
          label: `${version.label} · ${version.title[locale]}`,
          subtitle: `${version.year} · ${version.stack}`,
          keywords: 'version old ancien past history historique portfolio',
          Icon: FiLayers,
          href: version.path ?? undefined,
        })),
    ];
    return list;
  }, [locale, smooth, strings, t, toggleLocale]);

  const folded = fold(query.trim());

  const sections = useMemo<Section[]>(() => {
    if (!folded) {
      const byId = new Map(items.map((item) => [item.id, item]));
      const recentItems = recent.flatMap((id) => byId.get(id) ?? []);
      return groupOrder
        .map((group) => ({
          group,
          items: group === 'recent' ? recentItems : items.filter((item) => item.group === group),
        }))
        .filter((section) => section.items.length > 0);
    }
    const scored = items.flatMap((item) => {
      const value = score(item, folded);
      return value === null ? [] : [{ item, value }];
    });
    return groupOrder
      .map((group) => {
        const matches = scored
          .filter(({ item }) => item.group === group)
          .sort((a, b) => b.value - a.value);
        return {
          group,
          best: matches[0]?.value ?? 0,
          items: matches.map(({ item }) => item),
        };
      })
      .filter((section) => section.items.length > 0)
      .sort((a, b) => b.best - a.best)
      .map(({ group, items: groupItems }) => ({ group, items: groupItems }));
  }, [folded, items, recent]);

  const flat = useMemo(
    () =>
      sections.flatMap((section) =>
        section.items.map((item) => ({ item, optionId: `${baseId}-${section.group}-${item.id}` }))
      ),
    [sections, baseId]
  );
  const activeIndex = flat.length === 0 ? -1 : Math.min(active, flat.length - 1);
  const activeOption = activeIndex >= 0 ? flat[activeIndex] : undefined;

  useEffect(() => {
    if (activeOption) {
      document.getElementById(activeOption.optionId)?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeOption]);

  const select = (item: Item) => {
    const next = [item.id, ...readRecent().filter((id) => id !== item.id)].slice(0, RECENT_MAX);
    writeRecent(next);
    if (item.stay) {
      item.perform?.();
      return;
    }
    if (item.href) {
      if (item.href.startsWith('mailto:')) {
        window.location.assign(item.href);
      } else {
        window.open(item.href, '_blank', 'noopener,noreferrer');
      }
    }
    hide();
    if (item.perform) {
      const { perform } = item;
      requestAnimationFrame(perform);
    }
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.nativeEvent.isComposing) {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (flat.length > 0) {
          const delta = event.key === 'ArrowDown' ? 1 : -1;
          setActive((activeIndex + delta + flat.length) % flat.length);
        }
        break;
      }
      case 'Enter': {
        if (event.target === input.current && activeOption) {
          event.preventDefault();
          select(activeOption.item);
        }
        break;
      }
      case 'Escape': {
        event.preventDefault();
        event.stopPropagation();
        hide();
        break;
      }
      case 'Tab': {
        // Trap focus between the field and the close button.
        const focusable = Array.from(
          panel.current?.querySelectorAll<HTMLElement>('input, button') ?? []
        ).filter((node) => node.offsetParent !== null);
        if (focusable.length === 0) {
          break;
        }
        event.preventDefault();
        const index = focusable.indexOf(document.activeElement as HTMLElement);
        const next = (index + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
        focusable[next]?.focus();
        break;
      }
      default:
        break;
    }
  };

  if (!mounted) {
    return null;
  }

  const shortcut = isMac ? '⌘K' : 'Ctrl K';
  let liveMessage = '';
  if (copied) {
    liveMessage = t.copied;
  } else if (folded) {
    liveMessage = t.results(flat.length);
  }

  // Rendered in place (not portalled) so the Geist font variables from _app apply.
  return (
    <div
      className={cx(
        'fixed inset-0 z-[100] flex justify-center px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-[12vh]',
        !open && 'pointer-events-none'
      )}
    >
      {/* Backdrop: a click outside the panel closes it (Escape covers keyboards). */}
      <div
        aria-hidden
        onClick={hide}
        className={cx(
          'absolute inset-0 bg-black/55 backdrop-blur-[3px] transition-opacity duration-150 starting:opacity-0',
          !open && 'opacity-0'
        )}
      />
      {/* Arrow keys, Enter, Escape and the focus trap are handled for the whole dialog. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={t.title}
        onKeyDown={onKeyDown}
        className={cx(
          'relative flex h-fit max-h-[min(34rem,calc(100dvh-2rem))] w-full max-w-[40rem] origin-top flex-col overflow-hidden rounded-xl border border-line-strong bg-surface/95 shadow-[0_24px_80px_-12px_rgb(0_0_0/0.75),0_0_0_1px_rgb(0_0_0/0.4)] backdrop-blur-xl transition duration-150 ease-out starting:scale-[0.97] starting:opacity-0',
          !open && 'scale-[0.98] opacity-0'
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"
        />
        <div className="flex items-center gap-3 border-b border-line px-4">
          <FiSearch aria-hidden className="size-[18px] shrink-0 text-faint" />
          <input
            ref={input}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeOption?.optionId}
            aria-label={t.placeholder}
            placeholder={t.placeholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-faint focus-visible:outline-none!"
          />
          <button
            type="button"
            onClick={hide}
            aria-label={t.close}
            className="-mr-1 grid h-7 shrink-0 place-items-center rounded-md px-1.5 text-faint transition hover:bg-surface-3 hover:text-ink"
          >
            <span className="hidden font-mono text-[10px] uppercase tracking-wider sm:inline">
              esc
            </span>
            <FiX aria-hidden className="size-4 sm:hidden" />
          </button>
        </div>

        <div
          id={listId}
          role="listbox"
          aria-label={t.title}
          className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
        >
          {sections.map((section) => {
            const headingId = `${baseId}-${section.group}`;
            return (
              <div key={section.group} role="group" aria-labelledby={headingId} className="pb-1">
                <div
                  id={headingId}
                  role="presentation"
                  className="px-2.5 pb-1.5 pt-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-faint"
                >
                  {t.groups[section.group]}
                </div>
                {section.items.map((item) => {
                  const optionId = `${baseId}-${section.group}-${item.id}`;
                  const index = flat.findIndex((entry) => entry.optionId === optionId);
                  const selected = index === activeIndex;
                  const isCopied = copied && item.id === 'action-copy-email';
                  const Icon = isCopied ? FiCheck : item.Icon;
                  const external = item.href && !item.href.startsWith('mailto:');
                  return (
                    // Keyboard handling lives on the combobox input (aria-activedescendant).
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                    <div
                      key={optionId}
                      id={optionId}
                      role="option"
                      aria-selected={selected}
                      tabIndex={-1}
                      onMouseMove={() => {
                        if (!selected) {
                          setActive(index);
                        }
                      }}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => select(item)}
                      className={cx(
                        'relative flex cursor-pointer select-none items-center gap-3 rounded-lg px-2.5 py-2 transition-colors duration-75',
                        selected ? 'bg-surface-3' : 'bg-transparent'
                      )}
                    >
                      <span
                        aria-hidden
                        className={cx(
                          'absolute inset-y-2 left-0 w-0.5 rounded-full transition-colors',
                          selected ? 'bg-accent' : 'bg-transparent'
                        )}
                      />
                      <span
                        className={cx(
                          'grid size-8 shrink-0 place-items-center rounded-md border transition-colors',
                          isCopied && 'border-ok/40 text-ok',
                          !isCopied &&
                            (selected
                              ? 'border-accent/40 bg-accent-soft text-accent'
                              : 'border-line bg-surface-2 text-muted')
                        )}
                      >
                        <Icon aria-hidden className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ink">
                          <Highlight text={item.label} query={folded} />
                        </span>
                        {item.subtitle && (
                          <span className="block truncate text-xs text-faint">{item.subtitle}</span>
                        )}
                      </span>
                      {isCopied ? (
                        <span className="shrink-0 font-mono text-[11px] text-ok">{t.copied}</span>
                      ) : (
                        <span className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-faint">
                          {item.hint}
                          {external && <FiArrowUpRight aria-hidden className="size-3.5" />}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {flat.length === 0 && (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <span className="grid size-10 place-items-center rounded-full border border-line bg-surface-2 text-faint">
                <FiSearch aria-hidden className="size-4" />
              </span>
              <p className="mt-3 text-sm text-ink">{t.empty(query.trim())}</p>
              <p className="mt-1 text-xs text-faint">{t.emptyHint}</p>
            </div>
          )}
        </div>

        <div className="hidden items-center gap-4 border-t border-line bg-surface-2/60 px-4 py-2 text-[11px] text-faint sm:flex">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            {t.keys.navigate}
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd>
            {t.keys.open}
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>esc</Kbd>
            {t.keys.close}
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <Kbd>/</Kbd>
            <Kbd className="px-1.5">{shortcut}</Kbd>
          </span>
        </div>

        <p aria-live="polite" className="sr-only">
          {liveMessage}
        </p>
      </div>
    </div>
  );
}
