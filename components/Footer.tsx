import { FiArrowUpRight, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { links } from '@config/links';
import { useLanguage } from '@hooks/useLanguage';

export default function Footer() {
  const { strings, locale } = useLanguage();

  return (
    <footer className="border-t border-line bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
        <h2 className="max-w-2xl text-balance text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-4xl">
          {strings.footer.title}
        </h2>
        <p className="mt-3 max-w-xl text-sm text-muted sm:mt-4 sm:text-base">
          {strings.footer.body}
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
          <a
            href={links.email}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition hover:brightness-110"
          >
            <FiMail aria-hidden />
            {strings.footer.email}
          </a>
          <a
            href={links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-sm transition hover:border-ink"
          >
            <FiLinkedin aria-hidden />
            LinkedIn
          </a>
          <a
            href={links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-sm transition hover:border-ink"
          >
            <FiGithub aria-hidden />
            GitHub
          </a>
          <a
            href={links.cv[locale]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-sm transition hover:border-ink"
          >
            {strings.nav.cv}
            <FiArrowUpRight aria-hidden />
          </a>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 font-mono text-xs text-faint sm:mt-16 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} William Guinaudie</span>
          <span>{strings.footer.builtWith}</span>
        </div>
      </div>
    </footer>
  );
}
