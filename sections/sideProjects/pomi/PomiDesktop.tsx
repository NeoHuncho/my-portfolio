import { type CSSProperties, type Dispatch } from 'react';
import Image from 'next/image';
import {
  FiBatteryCharging,
  FiCheck,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiSkipForward,
  FiWifi,
} from 'react-icons/fi';
import { cx } from '@lib/cx';
import { ACCENTS, formatClock, SESSION_TOTAL, visibleTasks, type Copy, type Locale } from './data';
import { DONE_COLOR } from './parts';
import { type DemoAction, type DemoState, intentionsFor } from './usePomiDemo';

const SCREEN_WIDTH = 384;
const SCREEN_HEIGHT = 240;
const BEZEL = 8;
const LID_WIDTH = SCREEN_WIDTH + BEZEL * 2;
const LID_HEIGHT = SCREEN_HEIGHT + BEZEL * 2;
const BASE_HEIGHT = 10;

export const DESKTOP_WIDTH = LID_WIDTH + 40;
export const DESKTOP_HEIGHT = LID_HEIGHT + BASE_HEIGHT;
/** Vertical middle of the screen, for the link line. */
export const DESKTOP_SCREEN_MIDDLE = LID_HEIGHT / 2;
/** Left edge of the lid inside the laptop box. */
export const DESKTOP_LID_LEFT = (DESKTOP_WIDTH - LID_WIDTH) / 2;

const MAX_TASKS = 2;

const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--p-accent)]';

type Props = {
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
  copy: Copy;
  locale: Locale;
};

/** Small progress ring, used in the menu bar and the window. */
function Ring({
  size,
  stroke,
  progress,
  track = 'rgb(255 255 255 / 0.1)',
}: {
  size: number;
  stroke: number;
  progress: number;
  track?: string;
}) {
  const radius = size / 2 - stroke / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-hidden="true"
      className="-rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={track}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--p-accent)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference * progress} ${circumference}`}
        className="pomi-motion transition-[stroke] duration-500"
      />
    </svg>
  );
}

/** macOS-style menu bar with Pomi's status item showing the live countdown. */
function MenuBar({ state, copy, progress }: { state: DemoState; copy: Copy; progress: number }) {
  const running = state.timer.status === 'running';
  return (
    <div
      aria-hidden="true"
      className="relative flex h-[15px] items-center gap-2.5 bg-black/40 px-2 text-[8px] leading-none text-white/85 backdrop-blur"
    >
      <span className="font-semibold text-white">Pomi</span>
      {copy.menu.map((item) => (
        <span key={item}>{item}</span>
      ))}
      <span className="absolute left-1/2 top-0 h-[11px] w-[44px] -translate-x-1/2 rounded-b-[5px] bg-black" />
      <span className="ml-auto flex items-center gap-1 rounded-[4px] bg-white/[0.16] px-1 py-[2px] font-medium tabular-nums text-white">
        <Ring size={8} stroke={1.6} progress={progress} track="rgb(255 255 255 / 0.3)" />
        <span className={cx('transition-opacity', !running && 'opacity-70')}>
          {formatClock(state.timer.remaining)}
        </span>
      </span>
      <FiWifi className="size-[9px]" />
      <FiBatteryCharging className="size-[10px]" />
      <span>9:41</span>
    </div>
  );
}

/** The Tauri desktop app: the phone's portrait layout in a small window beside your work. */
function AppWindow({ state, dispatch, copy, locale, progress }: Props & { progress: number }) {
  const { timer } = state;
  const running = timer.status === 'running';
  const tasks = visibleTasks(state.tasks, MAX_TASKS);
  const selected = state.selected[timer.type];
  const skipLabel =
    timer.type === 'work'
      ? copy.skipTo[timer.position >= SESSION_TOTAL ? 'longBreak' : 'break']
      : copy.skipTo.work;
  return (
    <div className="absolute left-[14px] top-[24px] w-[140px] overflow-hidden rounded-[9px] bg-[#0e0f13] shadow-[0_18px_40px_-10px_rgb(0_0_0/0.8),0_0_0_0.5px_rgb(255_255_255/0.18)]">
      <div className="relative flex h-[16px] items-center gap-[4px] border-b border-white/[0.06] bg-[#17181d] px-[7px]">
        {['#ff5f57', '#febc2e', '#28c840'].map((color) => (
          <span
            key={color}
            aria-hidden="true"
            className="size-[6px] rounded-full"
            style={{ background: color }}
          />
        ))}
        <span className="absolute inset-x-0 text-center text-[8px] font-medium text-white/70">
          Pomi
        </span>
      </div>
      <div className="relative flex flex-col items-center px-2 pb-2 pt-2">
        <div
          aria-hidden="true"
          className="pomi-motion pointer-events-none absolute inset-0 transition-[background] duration-700"
          style={{
            background:
              'radial-gradient(80% 45% at 50% 22%, color-mix(in srgb, var(--p-accent) 16%, transparent), transparent 70%)',
          }}
        />
        <div className="relative size-[84px]">
          <Ring size={84} stroke={3.5} progress={progress} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[6px] font-semibold uppercase tracking-[0.16em] text-[var(--p-accent)]">
              {copy.types[timer.type]}
            </span>
            <span className="text-[17px] font-semibold leading-none tracking-tight tabular-nums text-ink">
              {formatClock(timer.remaining)}
            </span>
            <div className="mt-[5px] flex items-center gap-[5px]">
              <button
                type="button"
                aria-label={copy.reset}
                title={copy.reset}
                onClick={() => dispatch({ type: 'reset', source: 'desktop' })}
                className={cx(
                  'flex size-[13px] items-center justify-center rounded-full text-[7px] text-muted hover:bg-white/10 hover:text-ink',
                  FOCUS
                )}
              >
                <FiRotateCcw aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={running ? copy.pause : copy.start}
                title={running ? copy.pause : copy.start}
                onClick={() => dispatch({ type: 'toggle', source: 'desktop' })}
                className={cx(
                  'flex size-[20px] items-center justify-center rounded-full text-[9px] text-bg transition-transform hover:brightness-110 active:scale-90',
                  FOCUS
                )}
                style={{ background: 'var(--p-accent)' }}
              >
                <span key={timer.status} className="pomi-fade-scale flex">
                  {running ? (
                    <FiPause aria-hidden="true" />
                  ) : (
                    <FiPlay aria-hidden="true" className="ml-px" />
                  )}
                </span>
              </button>
              <button
                type="button"
                aria-label={skipLabel}
                title={skipLabel}
                onClick={() => dispatch({ type: 'skip', source: 'desktop' })}
                className={cx(
                  'flex size-[13px] items-center justify-center rounded-full text-[7px] text-muted hover:bg-white/10 hover:text-ink',
                  FOCUS
                )}
              >
                <FiSkipForward aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div
          role="group"
          aria-label={copy.intentions}
          className="relative mt-1.5 flex h-[15px] items-center justify-center gap-[2px]"
        >
          {intentionsFor(timer.type).map((intention) => {
            const isSelected = intention.slug === selected;
            return (
              <button
                key={intention.slug}
                type="button"
                aria-pressed={isSelected}
                aria-label={intention.name[locale]}
                title={intention.name[locale]}
                onClick={() =>
                  dispatch({ type: 'select', source: 'desktop', slug: intention.slug })
                }
                className={cx(
                  'flex h-[15px] shrink-0 items-center justify-center gap-[2px] rounded-full border text-[7px] leading-none',
                  isSelected
                    ? 'border-[color-mix(in_srgb,var(--p-accent)_55%,transparent)] bg-[color-mix(in_srgb,var(--p-accent)_16%,transparent)] pl-[3px] pr-[4px]'
                    : 'w-[15px] border-transparent bg-white/[0.05] hover:bg-white/10',
                  FOCUS
                )}
              >
                <span aria-hidden="true">{intention.emoji}</span>
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="whitespace-nowrap text-[6.5px] font-medium text-ink"
                  >
                    {intention.name[locale]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative mt-2 w-full">
          <h4 className="px-0.5 text-[6.5px] font-semibold uppercase tracking-[0.14em] text-muted">
            {copy.today}
          </h4>
          <ul className="mt-0.5 space-y-px">
            {tasks.map((task) => {
              const title = task.title[locale];
              return (
                <li
                  key={task.id}
                  className={cx(
                    'flex items-center gap-1.5 rounded-[5px] px-0.5 py-[2.5px]',
                    task.id === state.fresh && 'pomi-fresh'
                  )}
                >
                  <button
                    type="button"
                    aria-label={`${task.done ? copy.undoComplete : copy.complete}: ${title}`}
                    aria-pressed={task.done}
                    onClick={() => dispatch({ type: 'toggleTask', source: 'desktop', id: task.id })}
                    className={cx(
                      'flex size-[10px] shrink-0 items-center justify-center rounded-full border text-[6px]',
                      task.done
                        ? 'pomi-pop text-bg'
                        : 'border-white/30 text-transparent hover:border-[var(--p-accent)]',
                      FOCUS
                    )}
                    style={
                      task.done ? { background: DONE_COLOR, borderColor: DONE_COLOR } : undefined
                    }
                  >
                    <FiCheck aria-hidden="true" strokeWidth={4} />
                  </button>
                  <span
                    className={cx(
                      'truncate text-[7.5px] font-medium leading-[10px]',
                      task.done ? 'text-faint line-through' : 'text-ink'
                    )}
                  >
                    {title}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Whatever you are working on, out of focus behind Pomi. */
function BackgroundWindow() {
  return (
    <div
      aria-hidden="true"
      className="absolute right-[14px] top-[30px] h-[172px] w-[208px] overflow-hidden rounded-[8px] bg-[#16181f]/85 opacity-60 shadow-[0_14px_30px_-12px_rgb(0_0_0/0.7),0_0_0_0.5px_rgb(255_255_255/0.12)]"
    >
      <div className="flex h-[14px] items-center gap-[4px] border-b border-white/[0.05] bg-[#1c1e26] px-[6px]">
        {[0, 1, 2].map((dot) => (
          <span key={dot} className="size-[5px] rounded-full bg-white/20" />
        ))}
      </div>
      <div className="space-y-[5px] p-[10px]">
        {[62, 80, 46, 70, 38, 88, 54, 66, 30, 74, 50].map((width, index) => (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="block h-[3px] rounded-full"
            style={{
              width: `${width}%`,
              marginLeft: `${(index % 3) * 8}px`,
              background: index % 4 === 1 ? 'rgb(91 156 255 / 0.35)' : 'rgb(255 255 255 / 0.12)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Dock() {
  return (
    <div
      aria-hidden="true"
      className="absolute bottom-[4px] left-1/2 flex -translate-x-1/2 items-end gap-[5px] rounded-[7px] border border-white/10 bg-white/10 px-[5px] py-[4px] backdrop-blur"
    >
      {['#3b82f6', '#f97316', '#22c55e'].map((color) => (
        <span
          key={color}
          className="size-[15px] rounded-[4px] opacity-80"
          style={{
            background: `linear-gradient(160deg, ${color}, color-mix(in srgb, ${color} 55%, #000))`,
          }}
        />
      ))}
      <span className="relative">
        <Image
          src="/assets/side-projects/pomi-logo.webp"
          alt=""
          width={15}
          height={15}
          className="rounded-[4px]"
        />
        <span className="absolute -bottom-[3px] left-1/2 size-[2px] -translate-x-1/2 rounded-full bg-white/80" />
      </span>
      {['#a855f7', '#64748b'].map((color) => (
        <span
          key={color}
          className="size-[15px] rounded-[4px] opacity-80"
          style={{
            background: `linear-gradient(160deg, ${color}, color-mix(in srgb, ${color} 55%, #000))`,
          }}
        />
      ))}
    </div>
  );
}

/** A small laptop running Pomi's desktop app, with the countdown in the menu bar. */
export default function PomiDesktop({ state, dispatch, copy, locale }: Props) {
  const accent = ACCENTS[state.timer.type];
  const { timer } = state;
  const progress = Math.min(1, Math.max(0, timer.remaining / timer.duration));
  return (
    <section
      aria-label={copy.desktopLabel}
      className="relative"
      style={
        { width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT, '--p-accent': accent } as CSSProperties
      }
    >
      <div
        className="absolute top-0 rounded-t-[14px] bg-[#0b0b0d] shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9),inset_0_0_0_1px_rgb(255_255_255/0.14)]"
        style={{ left: DESKTOP_LID_LEFT, width: LID_WIDTH, height: LID_HEIGHT, padding: BEZEL }}
      >
        <div
          className="relative overflow-hidden rounded-[4px] text-ink"
          style={{
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            background:
              'radial-gradient(90% 80% at 85% 100%, #3b2a6b 0%, transparent 60%), radial-gradient(80% 90% at 10% 0%, #1d3a6e 0%, transparent 60%), #10121a',
          }}
        >
          <MenuBar state={state} copy={copy} progress={progress} />
          <BackgroundWindow />
          <AppWindow
            state={state}
            dispatch={dispatch}
            copy={copy}
            locale={locale}
            progress={progress}
          />
          <Dock />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute left-0 rounded-b-[10px] rounded-t-[2px]"
        style={{
          top: LID_HEIGHT,
          width: DESKTOP_WIDTH,
          height: BASE_HEIGHT,
          background: 'linear-gradient(180deg, #5a5d66 0%, #3a3c43 45%, #1c1d21 100%)',
          boxShadow: '0 14px 24px -12px rgb(0 0 0 / 0.9)',
        }}
      >
        <span className="absolute left-1/2 top-0 h-[4px] w-[60px] -translate-x-1/2 rounded-b-[4px] bg-[#25272c]" />
      </div>
    </section>
  );
}
