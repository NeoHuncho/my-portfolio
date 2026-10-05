import { type CSSProperties, type Dispatch, type ReactNode, useState } from 'react';
import { FiCheck, FiChevronLeft, FiList, FiMic, FiPause, FiPlay, FiSquare } from 'react-icons/fi';
import { cx } from '@lib/cx';
import {
  ACCENTS,
  PHRASES,
  SESSION_TOTAL,
  findIntention,
  formatClock,
  formatDue,
  type Copy,
  type Locale,
} from './data';
import { DONE_COLOR, MIC_COLOR, Waveform } from './parts';
import { type DemoAction, type DemoState, heardText, intentionsFor } from './usePomiDemo';

/** The round screen is laid out on a 228-unit grid (Wear OS dp) and scaled to the glass. */
const DP = 228;
const CASE = 196;
const BEZEL = 5;
const GLASS = 4;
const SCREEN = CASE - 2 * (BEZEL + GLASS);
const STRAP = 48;
const STRAP_WIDTH = 108;

export const WATCH_WIDTH = CASE + 8;
export const WATCH_HEIGHT = CASE + STRAP * 2;
/** Centre of the case inside the watch box (the crown sticks out on the right). */
export const WATCH_CASE_CENTER = CASE / 2;
/** Vertical centre of the case inside the watch box. */
export const WATCH_CASE_MIDDLE = STRAP + CASE / 2;

const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-white/80';

type View = 'face' | 'tasks' | 'intentions';

type Props = {
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
  copy: Copy;
  locale: Locale;
};

function at(left: number, top: number, width: number, height: number): CSSProperties {
  return { position: 'absolute', left, top, width, height };
}

/** A circular control centred on (cx, cy). */
function Dial({
  label,
  cx: centerX,
  cy: centerY,
  size,
  onClick,
  children,
  className,
  style,
  pressed,
}: {
  label: string;
  cx: number;
  cy: number;
  size: number;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      style={{ ...at(centerX - size / 2, centerY - size / 2, size, size), ...style }}
      className={cx(
        'flex items-center justify-center rounded-full transition-[background-color,transform] duration-200 active:scale-90',
        FOCUS,
        className
      )}
    >
      {children}
    </button>
  );
}

function Ring({ progress, color, glow }: { progress: number; color: string; glow: boolean }) {
  const stroke = 6;
  const radius = DP / 2 - stroke / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg
      viewBox={`0 0 ${DP} ${DP}`}
      width={DP}
      height={DP}
      aria-hidden="true"
      className="absolute inset-0 -rotate-90"
    >
      <circle
        cx={DP / 2}
        cy={DP / 2}
        r={radius}
        fill="none"
        stroke="rgb(255 255 255 / 0.08)"
        strokeWidth={stroke}
      />
      {[stroke * 2.4, stroke].map((width) => (
        <circle
          key={width}
          cx={DP / 2}
          cy={DP / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
          strokeDasharray={`${circumference * progress} ${circumference}`}
          opacity={width === stroke ? 1 : Number(glow) * 0.18}
          className="pomi-motion transition-[stroke,opacity] duration-500"
        />
      ))}
    </svg>
  );
}

function WatchFace({
  state,
  dispatch,
  copy,
  locale,
  onOpen,
}: Props & { onOpen: (view: View) => void }) {
  const { timer, capture } = state;
  const accent = ACCENTS[timer.type];
  const running = timer.status === 'running';
  const intention = findIntention(state.selected[timer.type]);
  const synced = capture.phase === 'done' && capture.source === 'app';

  return (
    <>
      <Ring progress={timer.remaining / timer.duration} color={accent} glow={running} />

      <div
        role="img"
        aria-label={copy.session(timer.position, SESSION_TOTAL)}
        style={at(0, 26, DP, 10)}
        className="flex items-center justify-center gap-1.5"
      >
        {Array.from({ length: SESSION_TOTAL }, (_, index) => {
          const position = index + 1;
          const current = position === timer.position && timer.type === 'work';
          const done = position < timer.position || (position === timer.position && !current);
          return (
            <span
              key={position}
              className="pomi-motion h-[7px] rounded-full transition-all duration-300"
              style={{
                width: current ? 18 : 7,
                background: done || current ? accent : 'rgb(255 255 255 / 0.16)',
                opacity: done && !current ? 0.55 : 1,
              }}
            />
          );
        })}
      </div>

      <div style={at(30, 42, DP - 60, 26)} className="flex items-center justify-center">
        {synced ? (
          <p
            className="pomi-fade-scale flex min-w-0 items-center gap-1 text-[13px] font-medium"
            style={{ color: DONE_COLOR }}
          >
            <FiCheck aria-hidden="true" className="shrink-0" strokeWidth={3} />
            <span className="truncate">{PHRASES[capture.phrase].task.title[locale]}</span>
          </p>
        ) : (
          <button
            type="button"
            aria-label={
              intention ? `${copy.intentions}: ${intention.name[locale]}` : copy.chooseIntention
            }
            title={copy.chooseIntention}
            onClick={() => onOpen('intentions')}
            className={cx(
              'flex h-[26px] items-center gap-1 rounded-full bg-white/[0.07] px-2.5 text-[12.5px] font-medium text-ink hover:bg-white/[0.12]',
              FOCUS
            )}
          >
            <span aria-hidden="true">{intention?.emoji ?? '○'}</span>
            {intention?.name[locale] ?? copy.intentions}
          </button>
        )}
      </div>

      <p
        aria-hidden="true"
        style={at(0, 72, DP, 46)}
        className="flex items-center justify-center text-[44px] font-semibold leading-none tracking-tight tabular-nums text-ink"
      >
        {formatClock(timer.remaining)}
      </p>
      <p
        aria-hidden="true"
        style={{ ...at(0, 118, DP, 14), color: accent }}
        className="text-center text-[11px] font-semibold uppercase leading-[14px] tracking-[0.16em] transition-colors"
      >
        {copy.types[timer.type]}
      </p>

      <Dial
        label={copy.tasks}
        cx={62}
        cy={166}
        size={36}
        onClick={() => onOpen('tasks')}
        className="bg-white/[0.07] text-[16px] text-muted hover:bg-white/[0.12] hover:text-ink"
      >
        <FiList aria-hidden="true" />
      </Dial>
      <Dial
        label={copy.mic}
        cx={DP / 2}
        cy={170}
        size={52}
        onClick={() => dispatch({ type: 'mic', source: 'watch' })}
        className="text-[22px] text-bg"
        style={{ background: MIC_COLOR, boxShadow: `0 6px 18px -6px ${MIC_COLOR}` }}
      >
        <FiMic aria-hidden="true" />
      </Dial>
      <Dial
        label={running ? copy.pause : copy.start}
        cx={DP - 62}
        cy={166}
        size={36}
        onClick={() => dispatch({ type: 'toggle', source: 'watch' })}
        className="text-[16px] text-bg hover:brightness-110"
        style={{ background: accent }}
      >
        <span key={timer.status} className="pomi-fade-scale flex">
          {running ? (
            <FiPause aria-hidden="true" />
          ) : (
            <FiPlay aria-hidden="true" className="ml-0.5" />
          )}
        </span>
      </Dial>
    </>
  );
}

function SubScreen({
  title,
  backLabel,
  onBack,
  children,
}: {
  title: string;
  backLabel: string;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <Dial
        label={backLabel}
        cx={DP / 2}
        cy={30}
        size={30}
        onClick={onBack}
        className="bg-white/[0.12] text-[18px] text-ink hover:bg-white/20"
      >
        <FiChevronLeft aria-hidden="true" className="-ml-px" />
      </Dial>
      <h4
        style={at(0, 49, DP, 18)}
        className="text-center text-[13px] font-semibold leading-[18px] text-ink"
      >
        {title}
      </h4>
      {children}
    </>
  );
}

/** Up to three tasks: the round screen never needs to scroll. */
function TasksScreen({ state, dispatch, copy, locale, onBack }: Props & { onBack: () => void }) {
  const tasks = state.tasks.slice(0, 3);
  return (
    <SubScreen title={copy.today} backLabel={copy.back} onBack={onBack}>
      <ul style={at(32, 72, DP - 64, 122)} className="flex flex-col gap-1">
        {tasks.map((task) => {
          const title = task.title[locale];
          return (
            <li key={task.id}>
              <button
                type="button"
                aria-label={`${task.done ? copy.undoComplete : copy.complete}: ${title}`}
                aria-pressed={task.done}
                onClick={() => dispatch({ type: 'toggleTask', source: 'watch', id: task.id })}
                className={cx(
                  'flex h-[38px] w-full items-center gap-2 rounded-[19px] bg-white/[0.06] pl-2 pr-3 text-left hover:bg-white/10',
                  task.id === state.fresh && 'pomi-fresh',
                  FOCUS
                )}
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-[12px]',
                    task.done ? 'pomi-pop text-bg' : 'border-white/30 text-transparent'
                  )}
                  style={
                    task.done ? { background: DONE_COLOR, borderColor: DONE_COLOR } : undefined
                  }
                >
                  <FiCheck strokeWidth={3.5} />
                </span>
                <span
                  className={cx(
                    'line-clamp-2 text-[11.5px] font-medium leading-[14px]',
                    task.done ? 'text-faint line-through' : 'text-ink'
                  )}
                >
                  {title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </SubScreen>
  );
}

function IntentionsScreen({
  state,
  dispatch,
  copy,
  locale,
  onBack,
}: Props & { onBack: () => void }) {
  const { type } = state.timer;
  const selected = state.selected[type];
  const accent = ACCENTS[type];
  return (
    <SubScreen title={copy.intentions} backLabel={copy.back} onBack={onBack}>
      <ul
        style={at(28, 72, DP - 56, 116)}
        className="flex flex-wrap content-center justify-center gap-2.5"
      >
        {intentionsFor(type).map((intention) => {
          const isSelected = intention.slug === selected;
          return (
            <li key={intention.slug}>
              <button
                type="button"
                aria-pressed={isSelected}
                aria-label={intention.name[locale]}
                title={intention.name[locale]}
                onClick={() => {
                  dispatch({ type: 'select', source: 'watch', slug: intention.slug, start: true });
                  onBack();
                }}
                className={cx(
                  'flex size-[46px] items-center justify-center rounded-full border-2 bg-white/[0.06] text-[22px] hover:bg-white/[0.12]',
                  FOCUS
                )}
                style={{ borderColor: isSelected ? accent : 'transparent' }}
              >
                <span aria-hidden="true">{intention.emoji}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </SubScreen>
  );
}

/** Voice capture started from the watch: listen, then confirm the clean task. */
function CaptureScreen({ state, dispatch, copy, locale }: Props) {
  const { capture } = state;
  const { phase } = capture;
  const { task } = PHRASES[capture.phrase];
  const words = heardText(capture, locale).split(' ');
  let label = copy.listening;
  if (phase === 'parsing') {
    label = copy.parsing;
  } else if (phase === 'done') {
    label = copy.added;
  }
  return (
    <>
      <p
        style={{ ...at(30, 34, DP - 60, 18), color: phase === 'done' ? DONE_COLOR : MIC_COLOR }}
        className={cx(
          'truncate text-center text-[13px] font-semibold leading-[18px]',
          phase === 'parsing' && 'pomi-shimmer-text'
        )}
      >
        {label}
      </p>
      {phase === 'done' ? (
        <div style={at(30, 62, DP - 60, 100)} className="pomi-card-in flex flex-col items-center">
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-full text-[20px] text-bg"
            style={{ background: DONE_COLOR }}
          >
            <FiCheck strokeWidth={3} />
          </span>
          <p className="mt-2 line-clamp-2 text-center text-[15px] font-semibold leading-[19px] text-ink">
            {task.title[locale]}
          </p>
          <p className="mt-0.5 text-[11.5px] text-muted">{formatDue(task.due, copy)}</p>
        </div>
      ) : (
        <>
          <Waveform
            active={phase === 'listening'}
            color={MIC_COLOR}
            bars={11}
            className="!absolute left-0 top-[62px] h-[44px] w-full"
          />
          <p
            style={at(34, 112, DP - 68, 40)}
            className="line-clamp-2 text-center text-[12.5px] leading-5 text-muted"
          >
            {words.slice(-7).join(' ')}
          </p>
        </>
      )}
      <Dial
        label={phase === 'listening' ? copy.micStop : copy.close}
        cx={DP / 2}
        cy={184}
        size={50}
        pressed={phase === 'listening'}
        onClick={() =>
          dispatch(
            phase === 'listening' ? { type: 'mic', source: 'watch' } : { type: 'captureClose' }
          )
        }
        className={cx('text-[20px]', phase === 'listening' ? 'text-bg' : 'bg-white/10 text-ink')}
        style={phase === 'listening' ? { background: MIC_COLOR } : undefined}
      >
        {phase === 'listening' ? (
          <FiSquare aria-hidden="true" className="fill-current text-[16px]" />
        ) : (
          <FiCheck aria-hidden="true" />
        )}
      </Dial>
    </>
  );
}

/** Round Wear OS watch drawn with CSS only: strap, case, bezel, crown. */
export default function PomiWatch({ state, dispatch, copy, locale }: Props) {
  const [view, setView] = useState<View>('face');
  const capturing = state.capture.phase !== 'idle' && state.capture.source === 'watch';
  const current: View | 'capture' = capturing ? 'capture' : view;
  const scale = SCREEN / DP;
  const layer = (name: View | 'capture') =>
    cx(
      'pomi-motion absolute inset-0 transition-[opacity,transform] duration-300 ease-out',
      current === name ? 'scale-100 opacity-100' : 'pointer-events-none scale-90 opacity-0'
    );
  const back = () => setView('face');

  /** Silicone sport band: lighter than the page so it reads on the dark card. */
  const strap = (position: 'top' | 'bottom') => {
    const top = position === 'top';
    const fade = `linear-gradient(${top ? 'to top' : 'to bottom'}, #000 72%, transparent)`;
    return (
      <div
        aria-hidden="true"
        className="absolute overflow-hidden"
        style={{
          left: CASE / 2 - STRAP_WIDTH / 2,
          width: STRAP_WIDTH,
          height: STRAP + 30,
          top: top ? 0 : CASE + STRAP - 30,
          borderRadius: top ? '26px 26px 8px 8px' : '8px 8px 26px 26px',
          background:
            'linear-gradient(90deg, #3a3e48 0%, #5b606d 14%, #686d7b 50%, #5b606d 86%, #3a3e48 100%)',
          boxShadow:
            'inset 1px 0 0 rgb(255 255 255 / 0.16), inset -1px 0 0 rgb(255 255 255 / 0.08)',
          maskImage: fade,
          WebkitMaskImage: fade,
        }}
      >
        <span
          className="absolute inset-y-0 left-[7px] right-[7px] rounded-[20px] border border-dashed border-white/[0.14]"
          style={top ? { bottom: -20, top: 6 } : { top: -20, bottom: 6 }}
        />
        {!top && (
          <span
            className="absolute left-1/2 flex -translate-x-1/2 flex-col gap-[7px]"
            style={{ top: 42 }}
          >
            {[0, 1].map((hole) => (
              <span
                key={hole}
                className="size-[7px] rounded-full bg-[#1d1f25] shadow-[inset_0_1px_1px_rgb(0_0_0/0.6),0_1px_0_rgb(255_255_255/0.12)]"
              />
            ))}
          </span>
        )}
      </div>
    );
  };

  return (
    <section
      aria-label={copy.watchLabel}
      className="relative"
      style={{ width: WATCH_WIDTH, height: WATCH_HEIGHT }}
    >
      {strap('top')}
      {strap('bottom')}

      <button
        type="button"
        aria-label={copy.crown}
        title={copy.crown}
        onClick={back}
        className="absolute rounded-r-[4px] rounded-l-[2px] transition-transform active:translate-x-[-1px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
        style={{
          left: CASE - 3,
          top: WATCH_CASE_MIDDLE - 15,
          width: 10,
          height: 30,
          background:
            'repeating-linear-gradient(180deg, #4a4c54 0 1.5px, #24262b 1.5px 3px), linear-gradient(90deg, #24262b, #4a4c54)',
          backgroundBlendMode: 'multiply',
        }}
      />

      <div
        className="absolute rounded-full"
        style={{
          left: 0,
          top: STRAP,
          width: CASE,
          height: CASE,
          background:
            'radial-gradient(circle at 32% 24%, #4a4d55 0%, #25272c 46%, #141518 78%, #0c0d0f 100%)',
          boxShadow:
            '0 24px 40px -14px rgb(0 0 0 / 0.85), inset 0 1px 1px rgb(255 255 255 / 0.22), inset 0 -3px 6px rgb(0 0 0 / 0.6)',
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            inset: BEZEL,
            background: '#08080a',
            boxShadow: 'inset 0 0 0 1px rgb(255 255 255 / 0.05), inset 0 2px 6px rgb(0 0 0 / 0.9)',
          }}
        >
          <div
            className="absolute overflow-hidden rounded-full bg-[#050506]"
            style={{ inset: GLASS }}
          >
            <div
              className="relative origin-top-left"
              style={{ width: DP, height: DP, transform: `scale(${scale})` }}
            >
              <div className={layer('face')} inert={current !== 'face'}>
                <WatchFace
                  state={state}
                  dispatch={dispatch}
                  copy={copy}
                  locale={locale}
                  onOpen={setView}
                />
              </div>
              <div className={layer('tasks')} inert={current !== 'tasks'}>
                <TasksScreen
                  state={state}
                  dispatch={dispatch}
                  copy={copy}
                  locale={locale}
                  onBack={back}
                />
              </div>
              <div className={layer('intentions')} inert={current !== 'intentions'}>
                <IntentionsScreen
                  state={state}
                  dispatch={dispatch}
                  copy={copy}
                  locale={locale}
                  onBack={back}
                />
              </div>
              <div className={layer('capture')} inert={current !== 'capture'}>
                {capturing && (
                  <CaptureScreen state={state} dispatch={dispatch} copy={copy} locale={locale} />
                )}
              </div>
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background:
                  'linear-gradient(140deg, rgb(255 255 255 / 0.08) 0%, rgb(255 255 255 / 0.02) 32%, transparent 48%)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
