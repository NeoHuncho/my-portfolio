import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { FiArrowDown, FiDownload, FiSmartphone } from 'react-icons/fi';
import { useInView } from 'react-intersection-observer';
import { heroNameId, links, sectionIds } from '@config/links';
import { useLanguage } from '@hooks/useLanguage';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@hooks/usePrefersReducedMotion';
import { cx } from '@lib/cx';
import DeskCallout from './DeskCallout';
import DeskLabels from './DeskLabels';
import DeskTray from './DeskTray';
import PhoneHero from './phone/PhoneHero';
import { EXTRAS, type ExtraId, type InfoId, uidOf } from './playground/items';
import { type Anchor, type DeskLabel } from './playground/Playground';
import PlaygroundFallback from './PlaygroundFallback';
import { probeGraphics, SETTINGS, useQuality } from './quality';
import { useDeviceTilt } from './useDeviceTilt';

const loadPlayground = () => import('./playground/Playground');
/** Room the hints take at the bottom of the desk: labels and story cards keep above them. */
const BOTTOM_INSET = 56;
/** A piece added from the tray comes up once the hatch has vented and cleared its spot: its story fades in as it arrives. */
const RISE_CARD_DELAY = 900;
/** The fixed header's height, and a little air under it, on wide screens where the desk runs under it. */
const HEADER_CLEARANCE = 76;
const Playground = dynamic(loadPlayground, { ssr: false });

/**
 * Starts downloading the 3D bundle right away, but mounts it only once the
 * browser is idle so it never competes with first paint.
 */
function useIdleMount(enabled: boolean): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    loadPlayground().catch(() => undefined);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 800 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setReady(true), 200);
    return () => clearTimeout(id);
  }, [enabled]);
  return ready;
}

export default function HeroSection() {
  const { strings, locale } = useLanguage();
  const reducedMotion = usePrefersReducedMotion();
  const coarse = useMediaQuery('(pointer: coarse)');
  const wide = useMediaQuery('(min-width: 1024px)');
  const roomy = useMediaQuery('(min-width: 640px)');
  const { ref, inView } = useInView({ initialInView: true });
  const quality = useQuality();

  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState(false);
  // Coming up from the tray, the piece arrives before its story does.
  const [selection, setSelection] = useState<{
    info: InfoId;
    uid: string;
    rising?: boolean;
  } | null>(null);
  const [shipped, setShipped] = useState<string | null>(null);
  // Off on every visit: the robot only drives after the pointer once asked to.
  const [robotFollow, setRobotFollow] = useState(false);
  const toggleRobotFollow = useCallback(() => setRobotFollow((on) => !on), []);

  // The desk opens on how I work alone; the rest of me waits in the tray until asked for.
  const [extras, setExtras] = useState<ExtraId[]>([]);
  const [preview, setPreview] = useState<ExtraId | null>(null);
  const [trayHover, setTrayHover] = useState(false);
  const [deskKey, setDeskKey] = useState(0);
  const [spotlight, setSpotlight] = useState<{ uid: string; info: InfoId; at: number } | null>(
    null
  );
  const trayTimer = useRef<number | undefined>(undefined);
  // Touch screens have no keyboard to press the search key with.
  const offered = useMemo(() => EXTRAS.filter((id) => wide || id !== 'keys'), [wide]);
  // Leaving the tray, the desk waits a moment before closing back in, so passing over it never jolts it.
  const onTrayHover = useCallback((hover: boolean) => {
    window.clearTimeout(trayTimer.current);
    if (hover) {
      setTrayHover(true);
    } else {
      trayTimer.current = window.setTimeout(() => setTrayHover(false), 600);
    }
  }, []);
  useEffect(() => () => window.clearTimeout(trayTimer.current), []);
  const addExtra = useCallback(
    (id: ExtraId) => {
      const uid = uidOf(id);
      if (extras.includes(id)) {
        // Already there: it hops to show where.
        setSpotlight({ uid, info: id, at: performance.now() });
      } else {
        setExtras((current) => [...current, id]);
      }
      setPreview(null);
      setSelection({ info: id, uid, rising: !extras.includes(id) });
    },
    [extras]
  );
  const addAll = useCallback(() => {
    setExtras((current) => [...current, ...offered.filter((id) => !current.includes(id))]);
    setPreview(null);
    setSelection(null);
  }, [offered]);
  const tidy = useCallback(() => {
    setExtras([]);
    setPreview(null);
    setSelection(null);
    setDeskKey((key) => key + 1);
  }, []);

  useEffect(() => {
    setWebgl(probeGraphics().webgl);
  }, []);

  // Phones get their own hero below the text (PhoneHero), never the 3D desk.
  const canRender = webgl === true && !reducedMotion && roomy;
  const mount = useIdleMount(canRender);
  const tilt = useDeviceTilt(coarse && canRender);
  const onReady = useCallback(() => setLoaded(true), []);
  const onShipped = useCallback((code: string) => setShipped(code), []);
  const onSelect = useCallback(
    (info: InfoId, uid: string) =>
      setSelection((current) => (current?.uid === uid ? current : { info, uid })),
    []
  );
  const closeInfo = useCallback(() => setSelection(null), []);
  const deskRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const anchorSink = useRef<((anchor: Anchor | null) => void) | null>(null);
  const onAnchor = useCallback((anchor: Anchor | null) => anchorSink.current?.(anchor), []);
  const labelSink = useRef<((labels: DeskLabel[]) => void) | null>(null);
  // How far across the desk the text reaches on wide screens, where it runs under it.
  const [freeLeft, setFreeLeft] = useState(0);
  // And how far down the fixed header reaches over it, there too.
  const [freeTop, setFreeTop] = useState(0);
  useEffect(() => {
    if (!wide) {
      setFreeLeft(0);
      setFreeTop(0);
      return undefined;
    }
    const measure = () => {
      const text = introRef.current?.getBoundingClientRect();
      const desk = deskRef.current?.getBoundingClientRect();
      if (text && desk && desk.width > 0) {
        setFreeLeft(Math.min(0.7, (text.right + 24 - desk.left) / desk.width));
      }
      if (desk && desk.height > 0) {
        setFreeTop(HEADER_CLEARANCE / desk.height);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [wide]);
  const onLabels = useCallback((labels: DeskLabel[]) => labelSink.current?.(labels), []);

  // Escape, or a click anywhere off the desk, puts the story away.
  const open = selection !== null;
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelection(null);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node && deskRef.current?.contains(event.target))) {
        setSelection(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (!shipped) {
      return undefined;
    }
    const id = setTimeout(() => setShipped(null), 4000);
    return () => clearTimeout(id);
  }, [shipped]);

  const selected = selection ? strings.hero.objects[selection.info] : null;
  const showFallback = roomy && (webgl === false || reducedMotion);

  const actions = (
    <div className="mt-6 flex gap-2.5 sm:mt-8 sm:flex-wrap sm:gap-3 lg:pointer-events-auto">
      <a
        href={`#${sectionIds.experience}`}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-bg transition hover:bg-white sm:px-5"
      >
        {strings.hero.primaryCta}
        <FiArrowDown aria-hidden />
      </a>
      <a
        href={links.cv[locale]}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={strings.hero.secondaryCta}
        className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2.5 text-sm transition hover:border-ink sm:px-5"
      >
        <FiDownload aria-hidden />
        {/* Phones keep both buttons on one row. */}
        <span className="sm:hidden">{strings.nav.cv}</span>
        <span className="max-sm:hidden">{strings.hero.secondaryCta}</span>
      </a>
    </div>
  );

  return (
    <section
      id={sectionIds.playground}
      ref={ref}
      className="relative flex flex-col overflow-hidden bg-dots max-sm:pb-8 sm:min-h-[100svh] lg:block lg:h-[100svh] lg:min-h-[640px]"
    >
      <div className="relative z-10 px-4 pt-20 sm:px-6 sm:pt-24 lg:pointer-events-none lg:absolute lg:inset-0 lg:flex lg:items-center lg:pt-0">
        <div className="mx-auto w-full max-w-7xl">
          <div ref={introRef} className="max-w-xl animate-fade-up">
            <p
              id={heroNameId}
              className="flex items-center gap-3 text-base font-medium tracking-tight text-ink sm:text-lg"
            >
              {/* My portrait waits in the desk's tray: my face sits by my name from the start. */}
              <Image
                src="/assets/about/profile.webp"
                alt=""
                width={40}
                height={40}
                priority
                className="size-8 rounded-full object-cover ring-1 ring-line-strong sm:size-10"
              />
              {strings.hero.eyebrow}
            </p>
            <h1 className="mt-3 text-[2.75rem] font-semibold leading-none tracking-tight sm:mt-4 sm:text-6xl lg:text-7xl">
              {strings.hero.role}
              <span className="text-accent">.</span>
            </h1>
            <p className="mt-4 text-pretty text-base text-muted sm:mt-5 sm:text-xl">
              {strings.hero.tagline}
              <span className="max-sm:hidden"> {strings.hero.taglineMore}</span>
            </p>
            {/* Phones: how I work comes first, on its turntable, then the buttons. */}
            <PhoneHero>{actions}</PhoneHero>
            <div className="max-sm:hidden">{actions}</div>
            {/* Phones have their own shelf; from sm up, the rest of me waits here, beside the desk. */}
            <div className="mt-10 max-w-[35rem] max-sm:hidden lg:pointer-events-auto">
              <DeskTray
                ids={offered}
                added={extras}
                strings={strings.hero.more}
                stories={strings.hero.objects}
                still={showFallback}
                live={canRender && loaded && SETTINGS.tray[quality].live}
                active={inView}
                onPreview={setPreview}
                onHover={onTrayHover}
                onAdd={addExtra}
                onAddAll={addAll}
                onTidy={tidy}
              />
            </div>
          </div>
        </div>
      </div>

      {/* The desk: full-bleed behind the text on desktop, below it on tablets, none on phones. */}
      <div
        ref={deskRef}
        className="relative min-h-[55svh] flex-1 max-sm:hidden lg:absolute lg:inset-0"
      >
        {showFallback && (
          <PlaygroundFallback
            steps={strings.hero.trio.steps}
            headline={strings.hero.trio.headline}
          />
        )}
        {canRender && mount && (
          <div
            className={cx(
              'absolute inset-0 transition-opacity duration-700',
              loaded ? 'opacity-100' : 'opacity-0'
            )}
          >
            <Playground
              deskKey={deskKey}
              active={inView}
              coarse={coarse}
              biasRight={wide}
              freeLeft={freeLeft}
              freeTop={freeTop}
              extras={extras}
              preview={preview}
              open={trayHover || preview !== null}
              onLabels={onLabels}
              spotlight={spotlight}
              onShipped={onShipped}
              onSelect={onSelect}
              onMiss={closeInfo}
              robotFollow={robotFollow}
              selected={selection?.uid ?? null}
              onAnchor={onAnchor}
              motion={tilt.motion}
              onReady={onReady}
            />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-bg via-bg/50 to-transparent lg:block lg:w-[55%]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" />
        {canRender && loaded && (
          <DeskLabels
            sinkRef={labelSink}
            steps={strings.hero.trio.steps}
            headline={strings.hero.trio.headline}
            hidden={selection?.uid ?? null}
            bottomInset={BOTTOM_INSET}
            off={extras.length > 0}
            onPick={onSelect}
          />
        )}
        {canRender && selection && selected && (
          <DeskCallout
            selectionKey={selection.uid}
            delay={selection.rising ? RISE_CARD_DELAY : 0}
            title={selected.title}
            body={selected.body}
            closeLabel={strings.hero.closeInfo}
            onClose={closeInfo}
            // Only with a mouse: on touch screens there is no pointer to follow.
            toggle={
              selection.info === 'robot' && !coarse
                ? {
                    label: robotFollow ? strings.hero.robotStop : strings.hero.robotFollow,
                    pressed: robotFollow,
                    onToggle: toggleRobotFollow,
                  }
                : undefined
            }
            link={
              selection.info === 'night'
                ? { label: strings.hero.nightShiftLink, href: `#${sectionIds.board}` }
                : undefined
            }
            docked={false}
            // Clear of the fixed header on wide screens, where the desk runs under it.
            topInset={wide ? HEADER_CLEARANCE : 12}
            bottomInset={BOTTOM_INSET}
            // The desk runs under the text on wide screens: the card keeps off it.
            avoidRef={wide ? introRef : undefined}
            anchorSinkRef={anchorSink}
          />
        )}
        {canRender && (
          // Over the bottom of the desk, so showing it never resizes the scene.
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="mx-auto flex max-w-7xl items-center gap-3">
              {tilt.supported && (
                // Phones: the desk follows the phone's tilt, and a shake tosses everything.
                <button
                  type="button"
                  aria-pressed={tilt.on}
                  onClick={tilt.toggle}
                  className={cx(
                    'pointer-events-auto mr-auto inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] backdrop-blur-md transition active:scale-95',
                    tilt.on
                      ? 'border-accent/60 bg-accent/15 text-ink'
                      : 'border-line-strong bg-bg/60 text-muted'
                  )}
                >
                  <FiSmartphone
                    aria-hidden
                    className={cx(
                      'size-3.5',
                      tilt.on ? 'animate-wobble text-accent' : 'rotate-[-12deg]'
                    )}
                  />
                  {tilt.on ? strings.hero.tiltOn : strings.hero.tiltOff}
                </button>
              )}
              <p
                aria-live="polite"
                className={cx(
                  'max-w-md font-mono text-[11px] leading-relaxed text-ok sm:text-xs',
                  !shipped && 'sr-only'
                )}
              >
                {shipped ? strings.hero.shipped(shipped) : ''}
              </p>
              {/* Read out whatever the visual callout shows. */}
              <p aria-live="polite" className="sr-only">
                {selected ? `${selected.title}. ${selected.body}` : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
