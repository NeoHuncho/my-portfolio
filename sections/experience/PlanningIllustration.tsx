import {
  type ComponentType,
  type CSSProperties,
  type KeyboardEvent,
  type TouchEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useInView } from 'react-intersection-observer';
import { type LocalizedString } from '@config/types';
import { useLanguage } from '@hooks/useLanguage';
import { usePrefersReducedMotion } from '@hooks/usePrefersReducedMotion';
import { cx } from '@lib/cx';
import BalanceSlide, { BALANCE_END } from './planning/BalanceSlide';
import DashboardSlide, { DASHBOARD_END } from './planning/DashboardSlide';
import { type SlideProps, useElementSize, useSlideClock } from './planning/motion';
import ProjectionSlide, { PROJECTION_END } from './planning/ProjectionSlide';
import ReportSlide, { REPORT_END } from './planning/ReportSlide';

/**
 * Stand-in visuals for confidential client work: concept art of four screens
 * of a financial-planning app, drawn and animated in SVG. No real data or UI.
 */
type Slide = {
  tab: LocalizedString;
  description: LocalizedString;
  Draw: ComponentType<SlideProps>;
  /** When the slide's own animation is over. */
  end: number;
  /** How long autoplay stays on the slide. */
  seconds: number;
};

const slides: Slide[] = [
  {
    tab: { en: 'Projection', fr: 'Projection' },
    description: {
      en: 'Retirement income by age across the three pillars; quick actions to retire at 63 and move to Lausanne reshape the projection.',
      fr: 'Revenu de retraite par âge sur les trois piliers ; des actions rapides, retraite à 63 ans et déménagement à Lausanne, modifient la projection.',
    },
    Draw: ProjectionSlide,
    end: PROJECTION_END,
    seconds: 7,
  },
  {
    tab: { en: 'Balance sheet', fr: 'Bilan' },
    description: {
      en: 'Balance sheet and operating account of a self-employed client: depreciation lowers equipment and equity, and the sheet stays balanced.',
      fr: "Bilan et compte d'exploitation d'un indépendant : l'amortissement réduit l'équipement et les fonds propres, et le bilan reste équilibré.",
    },
    Draw: BalanceSlide,
    end: BALANCE_END,
    seconds: 6,
  },
  {
    tab: { en: 'Dashboard', fr: 'Tableau de bord' },
    description: {
      en: 'Wealth dashboard: key figures, an allocation donut and a data grid by asset class.',
      fr: 'Tableau de bord patrimonial : chiffres clés, donut de répartition et grille par classe d’actifs.',
    },
    Draw: DashboardSlide,
    end: DASHBOARD_END,
    seconds: 6,
  },
  {
    tab: { en: 'PDF report', fr: 'Rapport PDF' },
    description: {
      en: 'A PDF report being generated, section by section, until it is ready to download.',
      fr: 'Un rapport PDF généré section par section, jusqu’au téléchargement.',
    },
    Draw: ReportSlide,
    end: REPORT_END,
    seconds: 5.5,
  },
];

const css = `
@keyframes planning-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.planning-progress { animation-name: planning-progress; animation-timing-function: linear; animation-fill-mode: both; }
@keyframes planning-in { from { opacity: 0; transform: translateX(var(--planning-from)); } to { opacity: 1; transform: none; } }
.planning-in { animation: planning-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
`;

export default function PlanningIllustration({ note }: { note: string }) {
  const { strings, locale } = useLanguage();
  const t = strings.experience;
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const { ref: viewRef, inView } = useInView({ threshold: 0.4 });
  const [figure, setFigure] = useState<HTMLElement | null>(null);
  const [stageRef, size] = useElementSize<HTMLDivElement>();
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);

  const slide = slides[index];
  const playing = !reduced && inView && !hovered && !focused;
  const clock = useSlideClock(index, !reduced && inView, slide.end);
  const time = reduced ? Infinity : clock;

  // Autoplay that resumes where it paused rather than restarting the slide.
  const remaining = useRef(slide.seconds * 1000);
  useEffect(() => {
    remaining.current = slides[index].seconds * 1000;
  }, [index]);
  useEffect(() => {
    if (!playing) {
      return;
    }
    const started = performance.now();
    const timer = setTimeout(() => {
      setDirection(1);
      setIndex((current) => (current + 1) % slides.length);
    }, remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= performance.now() - started;
    };
  }, [playing, index]);

  // Autoplay pauses while a mouse is over the slideshow or the keyboard is in it.
  useEffect(() => {
    if (!figure) {
      return;
    }
    const enter = (event: PointerEvent) => setHovered(event.pointerType === 'mouse');
    const leave = () => setHovered(false);
    const focusIn = (event: FocusEvent) =>
      setFocused(event.target instanceof Element && event.target.matches(':focus-visible'));
    const focusOut = (event: FocusEvent) => {
      if (!(event.relatedTarget instanceof Node && figure.contains(event.relatedTarget))) {
        setFocused(false);
      }
    };
    figure.addEventListener('pointerenter', enter);
    figure.addEventListener('pointerleave', leave);
    figure.addEventListener('focusin', focusIn);
    figure.addEventListener('focusout', focusOut);
    return () => {
      figure.removeEventListener('pointerenter', enter);
      figure.removeEventListener('pointerleave', leave);
      figure.removeEventListener('focusin', focusIn);
      figure.removeEventListener('focusout', focusOut);
    };
  }, [figure]);

  const go = (next: number) => {
    setDirection(next >= index ? 1 : -1);
    setIndex((next + slides.length) % slides.length);
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const delta = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (delta === undefined) {
      return;
    }
    event.preventDefault();
    const next = (index + delta + slides.length) % slides.length;
    go(next);
    tabs.current[next]?.focus();
  };

  const onTouchEnd = (event: TouchEvent) => {
    const start = touchStart.current;
    const touch = event.changedTouches[0];
    touchStart.current = null;
    if (!start || !touch) {
      return;
    }
    const dx = touch.clientX - start.x;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(touch.clientY - start.y)) {
      go(index - Math.sign(dx));
    }
  };

  const { Draw } = slide;
  const label = `${index + 1} / ${slides.length} · ${slide.tab[locale]}`;

  return (
    <figure
      ref={(node) => {
        viewRef(node);
        setFigure(node);
      }}
      aria-roledescription="carousel"
      aria-label={t.conceptArt}
      className="@container flex flex-col overflow-hidden rounded-xl border border-line bg-surface-2"
    >
      <style>{css}</style>

      {/* App chrome, whose tabs pick the screen. */}
      <div className="flex h-8 items-center gap-1 border-b border-line px-1.5 @md:h-9 @md:px-2">
        <div className="flex min-w-0 flex-1 items-center gap-0.5 @md:gap-1">
          {slides.map((item, i) => {
            const active = i === index;
            return (
              <button
                key={item.tab.en}
                ref={(node) => {
                  tabs.current[i] = node;
                }}
                type="button"
                onClick={() => go(i)}
                onKeyDown={onTabKeyDown}
                aria-label={`${item.tab[locale]} (${i + 1} / ${slides.length})`}
                aria-current={active ? 'true' : undefined}
                className={cx(
                  'relative flex h-6 shrink-0 items-center gap-1.5 overflow-hidden rounded-md px-2 font-mono text-[10px] transition',
                  active
                    ? 'bg-surface-3 text-ink'
                    : 'text-faint hover:bg-surface-3/60 hover:text-muted'
                )}
              >
                <span className={cx(active && 'text-accent')}>{`0${i + 1}`}</span>
                <span className={cx('whitespace-nowrap', !active && 'hidden @[30rem]:inline')}>
                  {item.tab[locale]}
                </span>
                {active && !reduced && (
                  <span
                    key={index}
                    className="planning-progress absolute inset-x-0 bottom-0 h-px origin-left bg-accent"
                    style={{
                      animationDuration: `${item.seconds}s`,
                      animationPlayState: playing ? 'running' : 'paused',
                    }}
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>
        {[
          { delta: -1, label: t.previous, Icon: FiChevronLeft },
          { delta: 1, label: t.next, Icon: FiChevronRight },
        ].map(({ delta, label: buttonLabel, Icon }) => (
          <button
            key={delta}
            type="button"
            onClick={() => go(index + delta)}
            aria-label={buttonLabel}
            className="grid size-6 shrink-0 place-items-center rounded-md text-muted transition hover:bg-surface-3 hover:text-ink"
          >
            <Icon aria-hidden className="size-3.5" />
          </button>
        ))}
      </div>

      {/* The screen. */}
      <div
        ref={stageRef}
        role="group"
        aria-roledescription="slide"
        aria-label={label}
        aria-live={playing ? 'off' : 'polite'}
        className="relative h-31 touch-pan-y overflow-hidden @md:h-[187px]"
        onTouchStart={(event) => {
          const touch = event.touches[0];
          touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
        }}
        onTouchEnd={onTouchEnd}
      >
        {size.w > 0 && (
          <div
            key={index}
            className="planning-in absolute inset-0"
            style={{ '--planning-from': `${direction * 14}px` } as CSSProperties}
          >
            <svg
              width={size.w}
              height={size.h}
              viewBox={`0 0 ${size.w} ${size.h}`}
              role="img"
              aria-label={slide.description[locale]}
              className="block"
            >
              <Draw t={time} w={size.w} h={size.h} locale={locale} />
            </svg>
          </div>
        )}
      </div>

      <figcaption className="border-t border-line px-2.5 py-2 font-mono text-[10px] leading-snug text-faint @md:px-4 @md:py-2.5 @md:text-[11px]">
        {note}
      </figcaption>
    </figure>
  );
}
