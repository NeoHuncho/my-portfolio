import { type Dispatch, type RefObject, useEffect, useReducer, useState } from 'react';
import { usePrefersReducedMotion } from '@hooks/usePrefersReducedMotion';
import {
  DURATIONS,
  INTENTIONS,
  PHRASES,
  SEED_TASKS,
  SESSION_TOTAL,
  type Locale,
  type Localized,
  type Task,
  type TimerStatus,
  type TimerType,
  wordsOf,
} from './data';

export type Source = 'app' | 'watch' | 'desktop';

export type TimerState = {
  type: TimerType;
  status: TimerStatus;
  duration: number;
  remaining: number;
  /** Current focus session (1-based); during a break it is the session just finished. */
  position: number;
};

export type CapturePhase = 'idle' | 'listening' | 'parsing' | 'done';

export type Capture = {
  phase: CapturePhase;
  source: Source;
  /** Index into PHRASES. */
  phrase: number;
  /** Words of the spoken phrase revealed so far. */
  words: number;
};

export type DemoEvent = {
  seq: number;
  kind: 'start' | 'pause' | 'reset' | 'skip' | 'finish' | 'listen' | 'added';
  type: TimerType;
  next: TimerType;
  title?: Localized;
};

export type DemoState = {
  timer: TimerState;
  selected: Record<TimerType, string | null>;
  tasks: Task[];
  capture: Capture;
  /** Id of the last task captured by voice, highlighted in the lists. */
  fresh: string | null;
  nextId: number;
  nextPhrase: number;
  /** Increments on every synced change so the UI can show a sync pulse. */
  sync: { seq: number; source: Source };
  event: DemoEvent | null;
};

export type DemoAction =
  | { type: 'toggle'; source: Source }
  | { type: 'reset'; source: Source }
  | { type: 'skip'; source: Source }
  | { type: 'select'; source: Source; slug: string; start?: boolean }
  | { type: 'toggleTask'; source: Source; id: string }
  | { type: 'mic'; source: Source }
  | { type: 'captureStep'; all?: boolean }
  | { type: 'captureClose' }
  | { type: 'tick'; ms: number };

function freshTimer(type: TimerType, position: number): TimerState {
  return { type, status: 'idle', duration: DURATIONS[type], remaining: DURATIONS[type], position };
}

/** Focus → Break → Focus …, Long break after the last session of the set. */
function nextTimer(timer: TimerState): TimerState {
  if (timer.type === 'work') {
    return freshTimer(timer.position >= SESSION_TOTAL ? 'longBreak' : 'break', timer.position);
  }
  if (timer.type === 'break') {
    return freshTimer('work', Math.min(SESSION_TOTAL, timer.position + 1));
  }
  return freshTimer('work', 1);
}

export function initialDemoState(): DemoState {
  return {
    timer: freshTimer('work', 1),
    selected: { work: 'work', break: null, longBreak: null },
    tasks: SEED_TASKS.map((task) => ({ ...task })),
    capture: { phase: 'idle', source: 'app', phrase: 0, words: 0 },
    fresh: null,
    nextId: 1,
    nextPhrase: 0,
    sync: { seq: 0, source: 'app' },
    event: null,
  };
}

function withEvent(state: DemoState, event: Omit<DemoEvent, 'seq'>): DemoEvent {
  return { ...event, seq: (state.event?.seq ?? 0) + 1 };
}

/** Applies a synced change and bumps the sync pulse. */
function commit(
  state: DemoState,
  source: Source,
  patch: Partial<DemoState>,
  event?: Omit<DemoEvent, 'seq'>
): DemoState {
  return {
    ...state,
    ...patch,
    sync: { seq: state.sync.seq + 1, source },
    event: event ? withEvent(state, event) : state.event,
  };
}

/** Reveal steps for a phrase: one per word of its longest translation. */
function phraseSteps(index: number): number {
  const { spoken } = PHRASES[index];
  return Math.max(wordsOf(spoken.en).length, wordsOf(spoken.fr).length);
}

/** The part of the spoken phrase heard so far, in the visitor's language. */
export function heardText(capture: Capture, locale: Locale): string {
  const words = wordsOf(PHRASES[capture.phrase].spoken[locale]);
  const shown = Math.ceil((words.length * capture.words) / phraseSteps(capture.phrase));
  return words.slice(0, shown).join(' ');
}

function captureStep(state: DemoState, all: boolean): DemoState {
  const { capture } = state;
  const phrase = PHRASES[capture.phrase];
  if (capture.phase === 'listening') {
    const steps = phraseSteps(capture.phrase);
    if (capture.words < steps && !all) {
      return { ...state, capture: { ...capture, words: capture.words + 1 } };
    }
    return { ...state, capture: { ...capture, phase: 'parsing', words: steps } };
  }
  if (capture.phase === 'parsing') {
    const task: Task = { ...phrase.task, id: `voice-${state.nextId}`, done: false };
    return {
      ...commit(
        state,
        capture.source,
        { tasks: [task, ...state.tasks], fresh: task.id, capture: { ...capture, phase: 'done' } },
        { kind: 'added', type: state.timer.type, next: state.timer.type, title: task.title }
      ),
      nextId: state.nextId + 1,
    };
  }
  if (capture.phase === 'done') {
    return { ...state, capture: { ...capture, phase: 'idle' } };
  }
  return state;
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  const { timer } = state;

  switch (action.type) {
    case 'tick': {
      if (timer.status !== 'running') {
        return state;
      }
      const remaining = timer.remaining - action.ms;
      if (remaining > 0) {
        return { ...state, timer: { ...timer, remaining } };
      }
      const next = nextTimer(timer);
      return {
        ...state,
        timer: next,
        event: withEvent(state, { kind: 'finish', type: timer.type, next: next.type }),
      };
    }
    case 'toggle': {
      const running = timer.status === 'running';
      return commit(
        state,
        action.source,
        { timer: { ...timer, status: running ? 'paused' : 'running' } },
        { kind: running ? 'pause' : 'start', type: timer.type, next: timer.type }
      );
    }
    case 'reset':
      return commit(
        state,
        action.source,
        { timer: freshTimer(timer.type, timer.position) },
        { kind: 'reset', type: timer.type, next: timer.type }
      );
    case 'skip': {
      const next = nextTimer(timer);
      return commit(
        state,
        action.source,
        { timer: next },
        { kind: 'skip', type: timer.type, next: next.type }
      );
    }
    case 'select': {
      const isSame = state.selected[timer.type] === action.slug;
      const selected = {
        ...state.selected,
        [timer.type]: isSame && !action.start ? null : action.slug,
      };
      const shouldStart = action.start && timer.status !== 'running';
      return commit(
        state,
        action.source,
        shouldStart ? { selected, timer: { ...timer, status: 'running' } } : { selected },
        shouldStart ? { kind: 'start', type: timer.type, next: timer.type } : undefined
      );
    }
    case 'toggleTask':
      return commit(state, action.source, {
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, done: !task.done } : task
        ),
      });
    case 'mic': {
      const { phase } = state.capture;
      if (phase === 'listening') {
        return captureStep(state, true);
      }
      if (phase === 'parsing') {
        return state;
      }
      return {
        ...state,
        nextPhrase: state.nextPhrase + 1,
        capture: {
          phase: 'listening',
          source: action.source,
          phrase: state.nextPhrase % PHRASES.length,
          words: 0,
        },
        event: withEvent(state, { kind: 'listen', type: timer.type, next: timer.type }),
      };
    }
    case 'captureStep':
      return captureStep(state, Boolean(action.all));
    case 'captureClose':
      return state.capture.phase === 'idle'
        ? state
        : { ...state, capture: { ...state.capture, phase: 'idle' } };
    default:
      return state;
  }
}

export function intentionsFor(type: TimerType) {
  return INTENTIONS[type];
}

/** Delay before the next capture step, per phase. */
function captureDelay(state: DemoState, reduced: boolean): number | null {
  const { phase, words } = state.capture;
  switch (phase) {
    case 'listening':
      if (reduced) {
        return 1400;
      }
      return words === 0 ? 500 : 190;
    case 'parsing':
      return reduced ? 700 : 1100;
    case 'done':
      return 2800;
    default:
      return null;
  }
}

/**
 * Owns the demo state, drives the countdown and the scripted voice capture.
 * The countdown only runs while the timer is running, the demo is on screen
 * and the tab is visible.
 */
export function usePomiDemo(
  rootRef: RefObject<HTMLElement | null>
): [DemoState, Dispatch<DemoAction>] {
  const [state, dispatch] = useReducer(demoReducer, undefined, initialDemoState);
  const [onScreen, setOnScreen] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const reduced = usePrefersReducedMotion();
  const running = state.timer.status === 'running';
  const delay = captureDelay(state, reduced);
  const { phase, words } = state.capture;

  useEffect(() => {
    const element = rootRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setOnScreen(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootRef]);

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState !== 'hidden');
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    if (!running || !onScreen || !pageVisible) {
      return undefined;
    }
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      dispatch({ type: 'tick', ms: now - last });
      last = now;
    }, 250);
    return () => window.clearInterval(id);
  }, [running, onScreen, pageVisible]);

  useEffect(() => {
    if (delay === null) {
      return undefined;
    }
    const id = window.setTimeout(
      () => dispatch({ type: 'captureStep', all: reduced && phase === 'listening' }),
      delay
    );
    return () => window.clearTimeout(id);
  }, [delay, phase, words, reduced]);

  return [state, dispatch];
}
