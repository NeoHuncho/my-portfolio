import { type CSSProperties, type Dispatch, type ReactNode } from 'react';
import Image from 'next/image';
import {
  FiCheck,
  FiMic,
  FiPause,
  FiPlay,
  FiPlus,
  FiRotateCcw,
  FiSkipForward,
  FiSquare,
  FiX,
} from 'react-icons/fi';
import { cx } from '@lib/cx';
import {
  ACCENTS,
  PHRASES,
  SESSION_TOTAL,
  formatClock,
  visibleTasks,
  type Copy,
  type Locale,
} from './data';
import { DONE_COLOR, MIC_COLOR, TaskMeta, Waveform } from './parts';
import { type DemoAction, type DemoState, heardText, intentionsFor } from './usePomiDemo';

export const PHONE_WIDTH = 280;
export const PHONE_HEIGHT = 568;

/** The list always fits the screen: no inner scroll area to trap the page wheel. */
const MAX_TASKS = 5;

const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--p-accent)]';

type Props = {
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
  copy: Copy;
  locale: Locale;
};

function RoundButton({
  label,
  onClick,
  children,
  className,
  style,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      style={style}
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full transition-[background-color,transform] duration-200 active:scale-90',
        FOCUS,
        className
      )}
    >
      {children}
    </button>
  );
}

function StatusBar() {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-[34px] shrink-0 items-center justify-between px-6 pt-1 text-[11px] font-semibold text-ink"
    >
      <span>9:41</span>
      <span className="absolute left-1/2 top-2 h-[18px] w-[72px] -translate-x-1/2 rounded-full bg-black" />
      <span className="flex items-center gap-1">
        <span className="flex items-end gap-px">
          {[4, 6, 8, 10].map((height) => (
            <span key={height} className="w-[2px] rounded-sm bg-ink" style={{ height }} />
          ))}
        </span>
        <span className="relative ml-1 h-[9px] w-[18px] rounded-[3px] border border-ink/60 p-px">
          <span className="block h-full w-3/4 rounded-[1px] bg-ink" />
        </span>
      </span>
    </div>
  );
}

function SessionDots({ state, copy }: { state: DemoState; copy: Copy }) {
  const { timer } = state;
  return (
    <div
      role="img"
      aria-label={copy.session(timer.position, SESSION_TOTAL)}
      className="flex items-center gap-1"
    >
      {Array.from({ length: SESSION_TOTAL }, (_, index) => {
        const position = index + 1;
        const done =
          position < timer.position || (position === timer.position && timer.type !== 'work');
        const current = position === timer.position && timer.type === 'work';
        return (
          <span
            key={position}
            className="pomi-motion h-1.5 rounded-full transition-all duration-300"
            style={{
              width: current ? 14 : 6,
              background: done || current ? 'var(--p-accent)' : 'rgb(255 255 255 / 0.14)',
              opacity: done && !current ? 0.55 : 1,
            }}
          />
        );
      })}
    </div>
  );
}

/** The timer as a compact card: a small ring round the main control, the time, then reset and skip. */
function TimerCard({ state, dispatch, copy, locale }: Props) {
  const { timer } = state;
  const running = timer.status === 'running';
  const size = 58;
  const stroke = 4;
  const radius = size / 2 - stroke;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, Math.max(0, timer.remaining / timer.duration));
  const skipLabel =
    timer.type === 'work'
      ? copy.skipTo[timer.position >= SESSION_TOTAL ? 'longBreak' : 'break']
      : copy.skipTo.work;

  return (
    <div className="relative mx-3 mt-1 shrink-0 rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-2.5">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg
            viewBox={`0 0 ${size} ${size}`}
            aria-hidden="true"
            className="absolute inset-0 -rotate-90"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgb(255 255 255 / 0.08)"
              strokeWidth={stroke}
            />
            {[stroke * 2.4, stroke].map((width) => (
              <circle
                key={width}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="var(--p-accent)"
                strokeWidth={width}
                strokeLinecap="round"
                strokeDasharray={`${circumference * progress} ${circumference}`}
                opacity={width === stroke ? 1 : Number(running) * 0.18}
                className="pomi-motion transition-[stroke,opacity] duration-500"
              />
            ))}
          </svg>
          <RoundButton
            label={running ? copy.pause : copy.start}
            onClick={() => dispatch({ type: 'toggle', source: 'app' })}
            className="absolute inset-[11px] text-[15px] text-bg hover:brightness-110"
            style={{ background: 'var(--p-accent)' }}
          >
            <span key={timer.status} className="pomi-fade-scale flex">
              {running ? (
                <FiPause aria-hidden="true" />
              ) : (
                <FiPlay aria-hidden="true" className="ml-0.5" />
              )}
            </span>
          </RoundButton>
        </div>
        <div className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--p-accent)] transition-colors">
            {copy.types[timer.type]}
          </span>
          <span className="mt-0.5 block text-[26px] font-semibold leading-none tracking-tight tabular-nums text-ink">
            {formatClock(timer.remaining)}
          </span>
        </div>
        <div className="flex shrink-0 gap-1">
          <RoundButton
            label={copy.reset}
            onClick={() => dispatch({ type: 'reset', source: 'app' })}
            className="size-7 bg-white/[0.05] text-[12px] text-muted hover:bg-white/10 hover:text-ink"
          >
            <FiRotateCcw aria-hidden="true" />
          </RoundButton>
          <RoundButton
            label={skipLabel}
            onClick={() => dispatch({ type: 'skip', source: 'app' })}
            className="size-7 bg-white/[0.05] text-[12px] text-muted hover:bg-white/10 hover:text-ink"
          >
            <FiSkipForward aria-hidden="true" />
          </RoundButton>
        </div>
      </div>
      <IntentionRow state={state} dispatch={dispatch} copy={copy} locale={locale} />
    </div>
  );
}

function IntentionRow({ state, dispatch, copy, locale }: Props) {
  const { type } = state.timer;
  const selected = state.selected[type];
  return (
    // Five intentions and the picked one's name share the card's width: nothing may shrink.
    <div
      role="group"
      aria-label={copy.intentions}
      className="mt-2.5 flex h-7 items-center gap-[3px]"
    >
      {intentionsFor(type).map((intention) => {
        const isSelected = intention.slug === selected;
        return (
          <button
            key={intention.slug}
            type="button"
            aria-pressed={isSelected}
            aria-label={intention.name[locale]}
            title={intention.name[locale]}
            onClick={() => dispatch({ type: 'select', source: 'app', slug: intention.slug })}
            className={cx(
              'pomi-motion flex h-[26px] shrink-0 items-center justify-center gap-1 rounded-full border text-[12.5px] leading-none transition-all duration-200',
              isSelected
                ? 'pomi-picked border-[color-mix(in_srgb,var(--p-accent)_55%,transparent)] bg-[color-mix(in_srgb,var(--p-accent)_16%,transparent)] pl-1.5 pr-2'
                : 'w-[26px] border-transparent bg-white/[0.05] hover:bg-white/10',
              FOCUS
            )}
          >
            <span aria-hidden="true">{intention.emoji}</span>
            {isSelected && (
              <span
                aria-hidden="true"
                className="whitespace-nowrap text-[10px] font-medium text-ink"
              >
                {intention.name[locale]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function TaskList({ state, dispatch, copy, locale }: Props) {
  const done = state.tasks.filter((task) => task.done).length;
  const tasks = visibleTasks(state.tasks, MAX_TASKS);
  const hidden = state.tasks.length - tasks.length;
  return (
    <div className="mt-3 px-3">
      <div className="flex items-baseline justify-between px-1">
        <h4 className="text-[14px] font-semibold tracking-tight text-ink">{copy.today}</h4>
        <span className="text-[10.5px] tabular-nums text-muted">
          {copy.doneCount(done, state.tasks.length)}
          {hidden > 0 && ` · ${copy.more(hidden)}`}
        </span>
      </div>
      <div
        aria-hidden="true"
        className="mx-1 mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]"
      >
        <span
          className="pomi-motion block h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${(done / Math.max(1, state.tasks.length)) * 100}%`,
            background: DONE_COLOR,
          }}
        />
      </div>
      <ul className="mt-1.5 divide-y divide-white/[0.05]">
        {tasks.map((task) => {
          const title = task.title[locale];
          return (
            <li
              key={task.id}
              className={cx(
                'flex items-center gap-3 rounded-xl px-1 py-[5px]',
                task.id === state.fresh && 'pomi-fresh'
              )}
            >
              <button
                type="button"
                aria-label={`${task.done ? copy.undoComplete : copy.complete}: ${title}`}
                aria-pressed={task.done}
                onClick={() => dispatch({ type: 'toggleTask', source: 'app', id: task.id })}
                className={cx(
                  'flex size-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] text-[12px] transition-colors',
                  task.done
                    ? 'pomi-pop text-bg'
                    : 'border-white/25 text-transparent hover:border-[var(--p-accent)]',
                  FOCUS
                )}
                style={task.done ? { background: DONE_COLOR, borderColor: DONE_COLOR } : undefined}
              >
                <FiCheck aria-hidden="true" strokeWidth={3.5} />
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={cx(
                    'truncate text-[13.5px] font-medium leading-[18px] transition-colors',
                    task.done ? 'text-faint line-through' : 'text-ink'
                  )}
                >
                  {title}
                </p>
                <TaskMeta
                  task={task}
                  copy={copy}
                  locale={locale}
                  className={cx(
                    'mt-1 h-4 flex-nowrap overflow-hidden text-[10px] leading-4 text-muted',
                    task.done && 'opacity-50'
                  )}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Voice capture as a quick-add bar along the bottom, the way a composer sits
 * under a chat: the whole bar starts listening, the mic at its end shows
 * what it is doing.
 */
function Composer({ state, dispatch, copy }: Omit<Props, 'locale'>) {
  const { phase } = state.capture;
  const listening = phase === 'listening';
  let icon = <FiMic aria-hidden="true" />;
  if (listening) {
    icon = <FiSquare aria-hidden="true" className="fill-current text-[12px]" />;
  } else if (phase === 'parsing') {
    icon = (
      <span
        aria-hidden="true"
        className="pomi-spin size-4 rounded-full border-2 border-bg/30 border-t-bg"
      />
    );
  } else if (phase === 'done') {
    icon = <FiCheck aria-hidden="true" strokeWidth={3} />;
  }
  const color = phase === 'done' ? DONE_COLOR : MIC_COLOR;
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-3">
      <button
        type="button"
        aria-label={listening ? copy.micStop : copy.mic}
        title={listening ? copy.micStop : copy.mic}
        aria-pressed={listening}
        disabled={phase === 'parsing'}
        onClick={() => dispatch({ type: 'mic', source: 'app' })}
        className="pomi-motion group flex h-11 w-full items-center gap-2 rounded-full border border-white/10 bg-[#1a1b21] pl-3.5 pr-1 text-left shadow-[0_10px_24px_-12px_rgb(0_0_0/0.9)] transition-colors duration-200 hover:border-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <FiPlus aria-hidden="true" className="shrink-0 text-[15px] text-muted" />
        <span aria-hidden="true" className="flex-1 truncate text-[12px] text-muted">
          {listening ? copy.micStop : copy.micHint}
        </span>
        <span
          aria-hidden="true"
          className="pomi-motion relative flex size-9 shrink-0 items-center justify-center rounded-full text-[16px] text-bg transition-[background-color,transform] duration-300 group-hover:scale-105 group-active:scale-95"
          style={{ background: color }}
        >
          {listening && (
            <>
              <span className="pomi-ripple absolute inset-0 rounded-full" />
              <span className="pomi-ripple absolute inset-0 rounded-full [animation-delay:600ms]" />
            </>
          )}
          <span key={phase} className="pomi-fade-scale relative flex">
            {icon}
          </span>
        </span>
      </button>
    </div>
  );
}

function CaptureSheet({ state, dispatch, copy, locale }: Props) {
  const { capture } = state;
  const open = capture.phase !== 'idle';
  const phrase = PHRASES[capture.phrase];
  const heard = heardText(capture, locale);
  const fromWatch = capture.source === 'watch';
  let label = fromWatch ? copy.listeningWatch : copy.listening;
  if (capture.phase === 'parsing') {
    label = copy.parsing;
  } else if (capture.phase === 'done') {
    label = copy.added;
  }

  return (
    <>
      <div
        aria-hidden="true"
        className={cx(
          'pomi-motion pointer-events-none absolute inset-0 z-10 bg-black/45 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        inert={!open}
        className={cx(
          'pomi-motion absolute inset-x-0 bottom-0 z-10 flex h-[300px] flex-col rounded-t-[28px] border-t border-white/10 bg-[#17181d] px-5 pb-[70px] pt-4 shadow-[0_-20px_40px_-10px_rgb(0_0_0/0.6)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="flex h-6 items-center gap-2">
          {capture.phase === 'listening' && (
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-[#ff6b6b] motion-safe:animate-pulse-dot"
            />
          )}
          {capture.phase === 'done' && (
            <FiCheck aria-hidden="true" strokeWidth={3} style={{ color: DONE_COLOR }} />
          )}
          <span
            className={cx(
              'text-[12px] font-medium',
              capture.phase === 'parsing' && 'pomi-shimmer-text'
            )}
            style={{ color: capture.phase === 'done' ? DONE_COLOR : undefined }}
          >
            {label}
          </span>
          <button
            type="button"
            aria-label={copy.close}
            title={copy.close}
            onClick={() => dispatch({ type: 'captureClose' })}
            className={cx(
              'ml-auto flex size-7 items-center justify-center rounded-full text-[14px] text-muted hover:bg-white/10 hover:text-ink',
              FOCUS
            )}
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        {capture.phase !== 'done' && (
          <Waveform active={capture.phase === 'listening'} color={MIC_COLOR} className="mt-2 h-9" />
        )}

        <p
          className={cx(
            'mt-2 line-clamp-3 min-h-[54px] text-[13px] leading-[18px] transition-colors duration-300',
            capture.phase === 'listening' ? 'text-ink' : 'text-faint'
          )}
        >
          {heard && `“${heard}`}
          {capture.phase === 'listening' ? (
            <span
              aria-hidden="true"
              className="ml-0.5 inline-block h-3.5 w-px translate-y-0.5 bg-ink motion-safe:animate-pulse-dot"
            />
          ) : (
            heard && '”'
          )}
        </p>

        <div
          className={cx(
            'mt-auto rounded-2xl border p-3 transition-colors duration-300',
            capture.phase === 'done'
              ? 'pomi-card-in border-[color-mix(in_srgb,#4ade9f_35%,transparent)] bg-[color-mix(in_srgb,#4ade9f_8%,transparent)]'
              : 'border-dashed border-white/10'
          )}
        >
          {capture.phase === 'done' ? (
            <>
              <p className="line-clamp-2 text-[13.5px] font-semibold leading-[18px] text-ink">
                {phrase.task.title[locale]}
              </p>
              <TaskMeta
                task={phrase.task}
                copy={copy}
                locale={locale}
                className="mt-1.5 text-[10px] leading-4 text-muted"
              />
            </>
          ) : (
            <div aria-hidden="true" className="space-y-2 py-0.5">
              <span
                className={cx(
                  'block h-3 w-3/5 rounded-full bg-white/[0.07]',
                  capture.phase === 'parsing' && 'pomi-shimmer'
                )}
              />
              <span
                className={cx(
                  'block h-2.5 w-4/5 rounded-full bg-white/[0.05]',
                  capture.phase === 'parsing' && 'pomi-shimmer'
                )}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/** Pomi on a phone: a compact timer, today's tasks taking most of the screen, and voice capture. */
export default function PomiApp({ state, dispatch, copy, locale }: Props) {
  const accent = ACCENTS[state.timer.type];
  return (
    <section
      aria-label={copy.appLabel}
      className="relative rounded-[46px] bg-[#050506] p-2 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9),inset_0_0_0_1px_rgb(255_255_255/0.12)]"
      style={{ width: PHONE_WIDTH, height: PHONE_HEIGHT, '--p-accent': accent } as CSSProperties}
    >
      <span
        aria-hidden="true"
        className="absolute -left-[3px] top-[110px] h-12 w-[3px] rounded-l bg-[#1f2026]"
      />
      <span
        aria-hidden="true"
        className="absolute -right-[3px] top-[140px] h-16 w-[3px] rounded-r bg-[#1f2026]"
      />
      <div className="relative flex h-full flex-col overflow-hidden rounded-[38px] bg-[#0e0f13] text-ink">
        <div
          aria-hidden="true"
          className="pomi-motion pointer-events-none absolute inset-x-0 top-0 h-56 transition-[background] duration-700"
          style={{
            background: `radial-gradient(70% 60% at 50% 25%, color-mix(in srgb, ${accent} 14%, transparent), transparent 70%)`,
          }}
        />
        <StatusBar />
        <header className="relative flex h-8 shrink-0 items-center justify-between px-5">
          <span className="flex items-center gap-1.5">
            <Image
              src="/assets/side-projects/pomi-logo.webp"
              alt=""
              width={18}
              height={18}
              className="rounded-[5px]"
            />
            <span className="text-[13px] font-semibold tracking-tight">Pomi</span>
          </span>
          <SessionDots state={state} copy={copy} />
        </header>
        <TimerCard state={state} dispatch={dispatch} copy={copy} locale={locale} />
        <TaskList state={state} dispatch={dispatch} copy={copy} locale={locale} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0e0f13] via-[#0e0f13]/90 to-transparent"
        />
        <CaptureSheet state={state} dispatch={dispatch} copy={copy} locale={locale} />
        <Composer state={state} dispatch={dispatch} copy={copy} />
      </div>
    </section>
  );
}
