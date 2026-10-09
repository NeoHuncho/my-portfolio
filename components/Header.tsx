import { memo, useEffect, useRef, useState } from 'react';
import {
  FiArrowUpRight,
  FiChevronDown,
  FiDownload,
  FiGithub,
  FiLinkedin,
  FiMail,
  FiMenu,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import { openCommandPalette } from '@components/CommandPalette';
import LogoMark from '@components/LogoMark';
import { heroNameId, links, sectionIds } from '@config/links';
import { siteVersions } from '@config/versions';
import { useLanguage } from '@hooks/useLanguage';
import { cx } from '@lib/cx';

const navItems = [
  { id: sectionIds.experience, key: 'experience' },
  { id: sectionIds.board, key: 'board' },
  { id: sectionIds.sideProjects, key: 'sideProjects' },
] as const;

/** The version badge: opens a menu of frozen past builds of this site. */
function VersionMenu() {
  const { strings, locale } = useLanguage();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="version-menu"
        aria-label={strings.nav.versions}
        className={cx(
          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] transition',
          open
            ? 'border-accent text-accent'
            : 'border-line-strong text-muted hover:border-accent hover:text-accent'
        )}
      >
        v3
        <FiChevronDown
          aria-hidden
          className={cx('size-3 transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div
          id="version-menu"
          className="animate-fade-up absolute left-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-line-strong bg-surface p-1.5 shadow-2xl shadow-black/50"
        >
          <p className="px-2.5 pb-1.5 pt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
            {strings.nav.versionsTitle}
          </p>
          <ul>
            {siteVersions.map((version) => {
              const content = (
                <>
                  <span className="w-11 font-mono text-xs text-ink">{version.label}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-ink">{version.title[locale]}</span>
                    <span className="block font-mono text-[10px] text-faint">
                      {version.year} · {version.stack}
                    </span>
                  </span>
                </>
              );
              return (
                <li key={version.label}>
                  {version.path ? (
                    <a
                      href={version.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-2.5 py-2 transition hover:bg-surface-3"
                    >
                      {content}
                      <FiArrowUpRight aria-hidden className="text-faint" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 rounded-lg bg-surface-2 px-2.5 py-2">
                      {content}
                      <span className="font-mono text-[10px] text-accent">
                        {strings.nav.current}
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function Header() {
  const { strings, locale, toggleLocale } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // The hero says my name by my portrait: the header takes it over once that has scrolled
  // away, and keeps it from then on.
  const [nameShown, setNameShown] = useState(false);

  useEffect(() => {
    const name = document.getElementById(heroNameId);
    if (!name) {
      setNameShown(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setNameShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '-56px 0px 0px 0px' }
    );
    observer.observe(name);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 24));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const socials = [
    { href: links.github, label: 'GitHub', Icon: FiGithub },
    { href: links.linkedin, label: 'LinkedIn', Icon: FiLinkedin },
    { href: links.email, label: 'Email', Icon: FiMail },
  ];

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled || menuOpen
          ? 'border-b border-line bg-bg/80 backdrop-blur-xl'
          : 'border-b border-transparent'
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <a
          href={`#${sectionIds.playground}`}
          aria-label="William Guinaudie"
          className="flex items-center text-[15px] font-medium tracking-tight"
        >
          <LogoMark className="h-4.5 w-auto" />
          <span
            aria-hidden={!nameShown}
            className={cx(
              // Folds away to nothing, so the version badge sits by the mark while the hero shows my name.
              'hidden overflow-hidden whitespace-nowrap transition-all duration-300 ease-out sm:inline-block',
              nameShown ? 'ml-2.5 max-w-48 opacity-100' : 'ml-0 max-w-0 opacity-0'
            )}
          >
            William Guinaudie
          </span>
        </a>
        <VersionMenu />

        <nav aria-label="Sections" className="ml-6 hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-md px-3 py-1.5 text-sm text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              {strings.nav[item.key]}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label={strings.palette.placeholder}
            aria-haspopup="dialog"
            aria-keyshortcuts="/ Meta+K Control+K"
            className="group grid size-9 place-items-center rounded-md text-muted transition hover:bg-surface-2 hover:text-ink lg:mr-1 lg:flex lg:h-8 lg:w-auto lg:gap-2 lg:border lg:border-line lg:bg-surface/60 lg:pl-2.5 lg:pr-1.5 lg:hover:border-line-strong"
          >
            <FiSearch aria-hidden className="size-4 lg:size-3.5" />
            <span className="hidden text-sm lg:inline">{strings.palette.trigger}</span>
            <kbd className="ml-3 hidden h-5 min-w-5 place-items-center rounded border border-line-strong bg-surface-2 px-1 font-mono text-[10px] leading-none text-faint transition group-hover:text-muted lg:grid">
              /
            </kbd>
          </button>
          <a
            href={links.cv[locale]}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted transition hover:bg-surface-2 hover:text-ink sm:flex"
          >
            <FiDownload aria-hidden className="size-3.5" />
            {strings.nav.cv}
          </a>
          {socials.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener noreferrer"
              aria-label={label}
              className="hidden size-9 place-items-center rounded-md text-muted transition hover:bg-surface-2 hover:text-ink sm:grid"
            >
              <Icon aria-hidden className="size-4" />
            </a>
          ))}
          <button
            type="button"
            onClick={toggleLocale}
            aria-label={strings.language.toggleLabel}
            className="ml-1 rounded-md border border-line-strong px-2.5 py-1 font-mono text-xs text-muted transition hover:border-ink hover:text-ink"
          >
            {locale === 'en' ? 'EN · fr' : 'FR · en'}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? strings.nav.close : strings.nav.menu}
            className="grid size-9 place-items-center rounded-md text-ink lg:hidden"
          >
            {menuOpen ? (
              <FiX aria-hidden className="size-5" />
            ) : (
              <FiMenu aria-hidden className="size-5" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-line px-4 pb-5 pt-2 lg:hidden">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              openCommandPalette();
            }}
            aria-haspopup="dialog"
            className="mb-1 mt-2 flex w-full items-center gap-2.5 rounded-lg border border-line-strong bg-surface/60 px-3 py-2.5 text-left text-sm text-muted transition hover:text-ink"
          >
            <FiSearch aria-hidden className="size-4" />
            {strings.palette.placeholder}
          </button>
          <nav aria-label="Sections" className="flex flex-col">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMenuOpen(false)}
                className="border-b border-line py-3 text-base text-ink"
              >
                {strings.nav[item.key]}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-2">
            <a
              href={links.cv[locale]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-line-strong px-3 py-2 text-sm"
            >
              <FiDownload aria-hidden className="size-3.5" />
              {strings.nav.cv}
            </a>
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
                aria-label={label}
                className="grid size-10 place-items-center rounded-md border border-line-strong"
              >
                <Icon aria-hidden className="size-4" />
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export default memo(Header);
