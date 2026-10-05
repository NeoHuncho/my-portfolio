import { memo, type ReactNode } from 'react';
import {
  FiArrowUpRight,
  FiCheck,
  FiCheckCircle,
  FiCpu,
  FiGitMerge,
  FiGitPullRequest,
  FiHelpCircle,
  FiLoader,
  FiMaximize2,
  FiMessageCircle,
  FiRotateCcw,
  FiX,
} from 'react-icons/fi';
import { sourceLabels, type Ticket, trackMeta } from '@config/board';
import { type Locale } from '@config/translations';
import { useLanguage } from '@hooks/useLanguage';
import { cx } from '@lib/cx';
import { OTHER_PREFIX, type TicketState } from './boardReducer';
import RichText from './RichText';

/**
 * Accept (answering the agent's open question), Ask (a question of yours, before deciding) and
 * Reject decide a plan; Confirm and Reconsider answer an "already implemented" finding.
 */
export type DecisionKind = 'accept' | 'ask' | 'reject' | 'confirm' | 'reconsider';

export function TrackChip({ ticket }: { ticket: Ticket }) {
  const meta = trackMeta[ticket.track];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold"
      style={{
        color: meta.color,
        background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
      }}
    >
      {ticket.id}
    </span>
  );
}

/**
 * Where the real review happens. Styled as the GitHub link it would be in the
 * real dashboard; the PRs in this demo do not exist, so it goes nowhere.
 */
export function PrLink({ pr, className }: { pr: number; className?: string }) {
  const { strings } = useLanguage();
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 font-mono text-[11px] text-accent underline decoration-accent/40 underline-offset-4',
        className
      )}
    >
      <FiGitPullRequest aria-hidden />
      {strings.board.openPr(pr)}
      <FiArrowUpRight aria-hidden />
    </span>
  );
}

/** What you answered to the agent's question when accepting, and the plan line it adds. */
export function answerSummary(ticket: Ticket, state: TicketState, locale: Locale) {
  if (state.answer?.startsWith(OTHER_PREFIX)) {
    return { label: state.answer.slice(OTHER_PREFIX.length), planNote: undefined };
  }
  const option = ticket.question?.options.find((candidate) => candidate.id === state.answer);
  return option ? { label: option.label[locale], planNote: option.planNote[locale] } : null;
}

/** The agent's open question, which you answer when you accept. */
export function OpenQuestion({ ticket, className }: { ticket: Ticket; className?: string }) {
  const { strings, locale } = useLanguage();
  if (!ticket.question) {
    return null;
  }
  return (
    <div className={cx('rounded-lg border border-accent/30 bg-accent-soft px-3 py-2', className)}>
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-accent">
        <FiHelpCircle aria-hidden />
        {strings.board.openQuestion}
      </p>
      <p className="mt-0.5 text-[13px] leading-snug text-ink">{ticket.question.prompt[locale]}</p>
    </div>
  );
}

/** Your question to the agent, and its reply once it has looked into it. */
export function AskedQuestion({
  ticket,
  state,
  className,
}: {
  ticket: Ticket;
  state: TicketState;
  className?: string;
}) {
  const { strings, locale } = useLanguage();
  const { asked } = state;
  if (!asked) {
    return null;
  }
  const reply =
    asked.suggested && ticket.followUp
      ? ticket.followUp.answer[locale]
      : strings.board.genericReply;
  return (
    <div className={cx('rounded-lg border border-line-strong bg-bg/50 px-3 py-2', className)}>
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-faint">
        <FiMessageCircle aria-hidden />
        {strings.board.youAsked}
      </p>
      <p className="mt-0.5 text-[13px] leading-snug text-ink">{asked.text}</p>
      {asked.answered ? (
        <p className="animate-ticket-in mt-2 border-t border-line pt-2 text-[13px] leading-snug text-muted">
          <span className="mb-0.5 flex items-center gap-1.5 text-[11px] font-medium text-ok">
            <FiCpu aria-hidden />
            {strings.board.agentReplied}
          </span>
          <RichText text={reply} />
        </p>
      ) : (
        <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted">
          <FiLoader className="animate-spin motion-reduce:animate-none" aria-hidden />
          {strings.board.agentResearching}
        </p>
      )}
    </div>
  );
}

type DecisionCardProps = {
  ticket: Ticket;
  state: TicketState;
  onOpen: (id: string) => void;
  onDecide: (id: string, kind: DecisionKind) => void;
};

/** The two lines a decision card shows on its face. Everything else lives in the details drawer. */
export function keyLines(
  ticket: Ticket,
  card: { problem: string; today: string; change: string; fix: string }
) {
  return ticket.track === 'bug'
    ? [
        { label: card.problem, text: ticket.goal },
        { label: card.fix, text: ticket.change },
      ]
    : [
        { label: card.today, text: ticket.today },
        { label: card.change, text: ticket.change },
      ];
}

function DecisionCardView({ ticket, state, onOpen, onDecide }: DecisionCardProps) {
  const { strings, locale } = useLanguage();
  const { card } = strings.board;

  return (
    <article className="animate-ticket-in flex flex-col rounded-2xl border border-line-strong bg-surface p-4 transition hover:border-faint sm:p-5">
      <div className="flex items-center gap-2">
        <TrackChip ticket={ticket} />
        <span className="min-w-0 truncate text-[11px] text-faint">
          {sourceLabels[ticket.source][locale]}
        </span>
        <button
          type="button"
          onClick={() => onOpen(ticket.id)}
          aria-label={`${strings.board.details}: ${ticket.id}`}
          title={strings.board.details}
          className="-mr-1 ml-auto grid size-7 shrink-0 place-items-center rounded-full text-faint transition hover:bg-surface-3 hover:text-ink"
        >
          <FiMaximize2 aria-hidden className="size-3.5" />
        </button>
      </div>

      <h4 className="mt-3">
        <button
          type="button"
          onClick={() => onOpen(ticket.id)}
          className="text-left text-base font-semibold leading-snug text-ink hover:text-accent"
        >
          {ticket.title[locale]}
        </button>
      </h4>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{ticket.tldr[locale]}</p>

      {ticket.migration && (
        <p className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-bg/60 px-2.5 py-1 font-mono text-xs">
          <span className="text-ink">{ticket.migration.pkg}</span>
          <span className="text-muted">{ticket.migration.from}</span>
          <span className="text-accent">→</span>
          <span className="text-ok">{ticket.migration.to}</span>
        </p>
      )}

      <dl className="mt-4 grid gap-3 text-[13px] leading-relaxed sm:grid-cols-2 sm:gap-5">
        {/* Phones get the change only: the tldr already says what is wrong. */}
        {keyLines(ticket, card).map((row, index) => (
          <div key={row.label} className={cx(index === 0 && 'hidden sm:block')}>
            <dt className="text-[11px] font-medium text-faint">{row.label}</dt>
            <dd className="mt-0.5 text-muted">
              <RichText text={row.text[locale]} />
            </dd>
          </div>
        ))}
      </dl>

      <OpenQuestion ticket={ticket} className="mt-4" />
      <AskedQuestion ticket={ticket} state={state} className="mt-2" />

      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-5">
        <button
          type="button"
          onClick={() => onDecide(ticket.id, 'accept')}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-bg transition hover:bg-white"
        >
          <FiCheck aria-hidden />
          {strings.board.accept}
        </button>
        <button
          type="button"
          onClick={() => onDecide(ticket.id, 'ask')}
          className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3.5 py-1.5 text-xs transition hover:border-ink"
        >
          <FiMessageCircle aria-hidden />
          {strings.board.ask}
        </button>
        <button
          type="button"
          onClick={() => onDecide(ticket.id, 'reject')}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted transition hover:text-ink"
        >
          <FiX aria-hidden />
          {strings.board.reject}
        </button>
        <span
          className="ml-auto text-[11px] text-faint"
          title={`${card.effort} ${ticket.effort} · ${card.confidence} ${ticket.confidence}%`}
        >
          {card.confidence} {ticket.confidence}%
        </span>
      </div>
    </article>
  );
}

export const DecisionCard = memo(DecisionCardView);

/**
 * Review and released tickets share the decision card's language at a smaller size:
 * id on top, title, then one meta line. The title button covers the whole card.
 */
function CompactCard({
  ticket,
  aside,
  meta,
  actions,
  highlight,
  onOpen,
}: {
  ticket: Ticket;
  aside?: ReactNode;
  meta: ReactNode;
  actions?: ReactNode;
  highlight?: boolean;
  onOpen: (id: string) => void;
}) {
  const { locale } = useLanguage();
  return (
    <article
      className={cx(
        'animate-ticket-in relative rounded-xl border bg-surface p-3.5 transition hover:border-faint',
        highlight ? 'border-line-strong' : 'border-line'
      )}
    >
      <div className="flex items-center gap-2">
        <TrackChip ticket={ticket} />
        {aside && (
          <span className="ml-auto inline-flex items-center gap-1 font-mono text-[11px] text-faint">
            {aside}
          </span>
        )}
      </div>
      <h4 className="mt-2">
        <button
          type="button"
          onClick={() => onOpen(ticket.id)}
          className="line-clamp-2 text-left text-sm font-medium leading-snug text-ink after:absolute after:inset-0 after:rounded-xl hover:text-accent"
        >
          {ticket.title[locale]}
        </button>
      </h4>
      <p className="mt-2.5 flex items-center gap-1.5 text-[12px]">{meta}</p>
      {actions && <div className="relative mt-3 flex flex-wrap gap-1.5">{actions}</div>}
    </article>
  );
}

type ReviewCardProps = {
  ticket: Ticket;
  state: TicketState;
  onOpen: (id: string) => void;
  onDecide: (id: string, kind: DecisionKind) => void;
};

function ReviewCardView({ ticket, state, onOpen, onDecide }: ReviewCardProps) {
  const { strings } = useLanguage();
  const { status } = strings.board;
  const ready = state.review === 'pr-ready';
  const existing = state.review === 'already-implemented';

  let meta;
  if (existing) {
    meta = (
      <span className="inline-flex items-center gap-1.5 text-ok">
        <FiCheckCircle aria-hidden />
        {status.alreadyImplemented}
      </span>
    );
  } else if (ready) {
    meta = (
      <span className="inline-flex items-center gap-1.5 text-accent">
        <span className="size-1.5 animate-pulse-dot rounded-full bg-accent" aria-hidden />
        {status.prReady}
      </span>
    );
  } else {
    meta = (
      <span className="inline-flex items-center gap-1.5 text-muted">
        <FiLoader className="animate-spin motion-reduce:animate-none" aria-hidden />
        {status.building}
      </span>
    );
  }

  return (
    <CompactCard
      ticket={ticket}
      onOpen={onOpen}
      highlight={ready || existing}
      aside={
        state.prNumber &&
        !existing && (
          <>
            <FiGitPullRequest aria-hidden />#{state.prNumber}
          </>
        )
      }
      meta={meta}
      actions={
        existing && (
          <>
            <button
              type="button"
              onClick={() => onDecide(ticket.id, 'confirm')}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-medium text-bg transition hover:bg-white"
            >
              <FiCheck aria-hidden />
              {strings.board.confirm}
            </button>
            <button
              type="button"
              onClick={() => onDecide(ticket.id, 'reconsider')}
              className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 py-1 text-xs transition hover:border-ink"
            >
              <FiRotateCcw aria-hidden />
              {strings.board.reconsider}
            </button>
          </>
        )
      }
    />
  );
}

export const ReviewCard = memo(ReviewCardView);

function ReleasedCardView({
  ticket,
  state,
  onOpen,
}: {
  ticket: Ticket;
  state: TicketState;
  onOpen: (id: string) => void;
}) {
  const { strings } = useLanguage();
  return (
    <CompactCard
      ticket={ticket}
      onOpen={onOpen}
      aside={state.version}
      meta={
        <>
          <span className="inline-flex items-center gap-1.5 text-ok">
            <FiGitMerge aria-hidden />
            {strings.board.status.merged}
          </span>
          {state.prNumber && (
            <span className="font-mono text-[11px] text-faint">#{state.prNumber}</span>
          )}
        </>
      }
    />
  );
}

export const ReleasedCard = memo(ReleasedCardView);
