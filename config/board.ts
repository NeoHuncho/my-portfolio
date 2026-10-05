import { type LocalizedString } from './types';

export type Track = 'feature' | 'bug' | 'security' | 'performance' | 'dependencies' | 'docs';

/** Board columns. */
export type Stage = 'needs-decision' | 'review' | 'released';

/**
 * Where an accepted ticket is inside the review column. The review itself happens on GitHub.
 * `already-implemented`: the agent found the work already exists and waits for you to confirm.
 */
export type ReviewStatus = 'building' | 'pr-ready' | 'already-implemented';

export type TicketSource = 'user-feedback' | 'sentry' | 'agent-run' | 'team';

export type Effort = 'S' | 'M' | 'L';

export type CodebaseArea = 'web' | 'api' | 'driver-app' | 'infra' | 'shared';

/**
 * Text fields may wrap identifiers, file paths, endpoints and versions in
 * backticks: they render as inline code.
 */
export type RichText = LocalizedString;

export type ClarifyingOption = {
  id: string;
  label: LocalizedString;
  recommended?: boolean;
  /** Line appended to the plan once this answer is chosen. */
  planNote: RichText;
};

export type ClarifyingQuestion = {
  prompt: LocalizedString;
  options: ClarifyingOption[];
};

/** A question you might ask the agent before deciding, and what its research comes back with. */
export type FollowUp = {
  question: LocalizedString;
  answer: RichText;
};

/** Docs track: places in the codebase that disagree with each other. */
export type Inconsistency = {
  /** File path or doc page, e.g. `docs/billing.md`. */
  source: string;
  says: RichText;
};

/** Dependencies track: the major version jump. */
export type Migration = {
  pkg: string;
  from: string;
  to: string;
};

export type PullRequest = {
  number: number;
  files: number;
  additions: number;
  deletions: number;
  /** What the diff does, for the reviewer. */
  highlights: RichText[];
};

/** Shown instead of a PR when the agent finds the accepted work already exists. */
export type ExistingWork = {
  /** Why no new implementation is needed. */
  why: RichText;
  evidence: RichText[];
  /** How it was checked. */
  checked: RichText;
  /** What could still be missing. */
  gap: RichText;
};

export type Ticket = {
  id: string;
  track: Track;
  initialStage: 'needs-decision' | 'building' | 'pr-ready' | 'already-implemented' | 'released';
  /** Release a released ticket shipped in. */
  release?: string;
  title: LocalizedString;
  /** One line summary shown first on the card. */
  tldr: LocalizedString;
  source: TicketSource;
  area: CodebaseArea;
  effort: Effort;
  /** 0-100, how sure the planning agent is about the plan. */
  confidence: number;
  /** Card face. For bugs: goal = problem, change = fix. */
  goal: RichText;
  today: RichText;
  change: RichText;
  /** What the change means in the code: 2-4 short lines with inline code. */
  technical: RichText[];
  whyNow: RichText;
  evidence: RichText[];
  plan: RichText[];
  acceptance: RichText[];
  validation: RichText;
  watchFor: RichText;
  /** The agent's open question: answered as part of accepting the ticket. */
  question?: ClarifyingQuestion;
  /** Suggested in the "Ask" dialog, with a prepared reply. */
  followUp?: FollowUp;
  inconsistencies?: Inconsistency[];
  migration?: Migration;
  pr?: PullRequest;
  existing?: ExistingWork;
};

export type TrackMeta = {
  code: string;
  label: LocalizedString;
  /** CSS custom property holding the track colour. */
  color: string;
};

export const trackMeta: Record<Track, TrackMeta> = {
  feature: {
    code: 'FEAT',
    label: { en: 'Features', fr: 'Fonctionnalités' },
    color: 'var(--track-feature)',
  },
  bug: { code: 'BUG', label: { en: 'Bugs', fr: 'Bugs' }, color: 'var(--track-bug)' },
  security: {
    code: 'SEC',
    label: { en: 'Security', fr: 'Sécurité' },
    color: 'var(--track-security)',
  },
  performance: {
    code: 'PERF',
    label: { en: 'Performance', fr: 'Performance' },
    color: 'var(--track-performance)',
  },
  dependencies: {
    code: 'DEP',
    label: { en: 'Dependencies', fr: 'Dépendances' },
    color: 'var(--track-dependencies)',
  },
  docs: {
    code: 'DOC',
    label: { en: 'Docs & knowledge', fr: 'Docs & savoir' },
    color: 'var(--track-docs)',
  },
};

export const trackOrder: Track[] = [
  'feature',
  'bug',
  'docs',
  'security',
  'performance',
  'dependencies',
];

export const stageOrder: Stage[] = ['needs-decision', 'review', 'released'];

export const sourceLabels: Record<TicketSource, LocalizedString> = {
  'user-feedback': { en: 'User feedback', fr: 'Retour utilisateur' },
  sentry: { en: 'Sentry', fr: 'Sentry' },
  'agent-run': { en: 'Daily agent run', fr: "Run quotidien de l'agent" },
  team: { en: 'Team request', fr: "Demande de l'équipe" },
};

export const areaLabels: Record<CodebaseArea, string> = {
  web: 'apps/web',
  api: 'apps/api',
  'driver-app': 'apps/driver',
  infra: 'infra',
  shared: 'packages/shared',
};

/** What the board header calls the fictional delivery platform: plainly a demo. */
export const boardCompany = {
  name: 'Demo',
};
