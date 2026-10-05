import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { type IconType } from 'react-icons';
import { FiActivity, FiBarChart2, FiChevronDown, FiTarget, FiUserCheck } from 'react-icons/fi';
import SectionHeading from '@components/SectionHeading';
import SwipeRow from '@components/SwipeRow';
import { type Ticket, trackMeta, trackOrder } from '@config/board';
import { boardTickets } from '@config/boardTickets';
import { sectionIds } from '@config/links';
import { useLanguage } from '@hooks/useLanguage';
import { cx } from '@lib/cx';
import ActionModal from './ActionModal';
import { type BoardAction, type TicketState } from './boardReducer';
import CompanyLogo from './CompanyLogo';
import { type DecisionKind, DecisionCard, ReleasedCard, ReviewCard } from './TicketCard';
import TicketDrawer from './TicketDrawer';
import { useBoardState } from './useBoardState';

/** Collapsed columns show this many tickets; the rest sit behind a "show more" toggle. */
const DECISIONS_VISIBLE = 1;
const COMPACT_VISIBLE = 2;

const ticketsById: Record<string, Ticket> = Object.fromEntries(
  boardTickets.map((ticket) => [ticket.id, ticket])
);

const practiceIcons: IconType[] = [FiBarChart2, FiTarget, FiUserCheck, FiActivity];

/** What sits behind the board: how scheduled agent runs stay worth trusting. */
function AgentPractices() {
  const { strings } = useLanguage();
  const p = strings.board.practices;
  return (
    <div className="mt-8 sm:mt-10">
      <h3 className="text-base font-semibold tracking-tight sm:text-xl">{p.title}</h3>
      <SwipeRow
        label={p.title}
        className="mt-4 sm:mt-5 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6 lg:grid-cols-4"
        itemWidth="max-sm:w-[72%]"
        itemClassName="max-sm:rounded-2xl max-sm:border max-sm:border-line max-sm:bg-surface/50 max-sm:p-4"
      >
        {p.items.map((item, index) => {
          const Icon = practiceIcons[index % practiceIcons.length];
          return (
            <div key={item.title}>
              <span className="flex items-center gap-2 text-sm font-medium text-ink">
                <Icon className="text-accent" aria-hidden />
                {item.title}
              </span>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{item.body}</p>
            </div>
          );
        })}
      </SwipeRow>
    </div>
  );
}

function Column({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <div className="flex h-full min-w-0 flex-col rounded-2xl bg-bg/40 p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-ink">{title}</h3>
        <span className="font-mono text-[11px] text-faint">{count}</span>
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-2.5">{children}</div>
    </div>
  );
}

function EmptyColumn() {
  const { strings } = useLanguage();
  return (
    <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-faint">
      {strings.board.emptyColumn}
    </p>
  );
}

/** Expands or collapses the tickets a column keeps folded. Sits at the column bottom so the toggles line up. */
function MoreToggle({
  expanded,
  label,
  onToggle,
}: {
  expanded: boolean;
  label: string;
  onToggle: () => void;
}) {
  const { strings } = useLanguage();
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-line-strong px-3 py-2 text-xs text-muted transition hover:border-ink hover:text-ink"
    >
      {expanded ? strings.board.showLess : label}
      <FiChevronDown aria-hidden className={cx('transition-transform', expanded && 'rotate-180')} />
    </button>
  );
}

type Expanded = { decision: boolean; review: boolean; released: boolean };

export default function BoardSection() {
  const { strings, locale } = useLanguage();
  const t = strings.board;
  const { state, dispatch } = useBoardState(boardTickets);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [modal, setModal] = useState<{ id: string; kind: DecisionKind } | null>(null);
  const [expanded, setExpanded] = useState<Expanded>({
    decision: false,
    review: false,
    released: false,
  });
  const toggle = (column: keyof Expanded) =>
    setExpanded((current) => ({ ...current, [column]: !current[column] }));

  const onOpen = useCallback((id: string) => setDrawerId(id), []);
  const onDecide = useCallback((id: string, kind: DecisionKind) => setModal({ id, kind }), []);
  const closeDrawer = useCallback(() => setDrawerId(null), []);
  const closeModal = useCallback(() => setModal(null), []);
  const onSubmit = useCallback(
    (action: BoardAction) => {
      dispatch(action);
      // The ticket changes column, so its drawer no longer matches what is on screen.
      if (action.type !== 'ask') {
        setDrawerId(null);
      }
    },
    [dispatch]
  );

  const visible = useMemo(
    () =>
      state.order
        .map((id) => ({ ticket: ticketsById[id], ticketState: state.tickets[id] }))
        .filter(
          ({ ticket }) => ticket && (state.filter === 'all' || ticket.track === state.filter)
        ),
    [state.order, state.tickets, state.filter]
  );

  const byStage = (stage: TicketState['stage']) =>
    visible.filter(({ ticketState }) => ticketState.stage === stage);
  const decisions = byStage('needs-decision');
  const reviews = byStage('review');
  const released = byStage('released');
  const shown = <T,>(items: T[], column: keyof Expanded, limit: number) =>
    expanded[column] ? items : items.slice(0, limit);
  const hidden = (items: unknown[], limit: number) => Math.max(0, items.length - limit);
  const rejectedCount = byStage('rejected').length;
  const closedCount = byStage('closed').length;

  const toDecide = (track: Ticket['track'] | 'all') =>
    state.order.filter(
      (id) =>
        state.tickets[id].stage === 'needs-decision' &&
        (track === 'all' || ticketsById[id].track === track)
    ).length;

  const drawerTicket = drawerId ? ticketsById[drawerId] : null;
  const modalTicket = modal ? ticketsById[modal.id] : null;

  return (
    <>
      <section
        id={sectionIds.board}
        className="content-auto border-t border-line pb-4 pt-10 sm:pb-8 sm:pt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

          <div className="mt-6 overflow-hidden rounded-3xl border border-line bg-surface/50 sm:mt-8">
            {/* Company and track filters share one row; the chips scroll on small screens. */}
            <div className="flex items-center gap-3 border-b border-line px-3 py-2.5 sm:gap-5 sm:px-5">
              <div className="flex shrink-0 items-center gap-2.5">
                <CompanyLogo />
                <span className="hidden text-sm text-faint md:inline">{t.radar}</span>
              </div>
              <div className="no-scrollbar -my-1 flex min-w-0 flex-1 gap-1 overflow-x-auto py-1 lg:justify-end">
                {(['all', ...trackOrder] as const).map((track) => {
                  const active = state.filter === track;
                  const count = toDecide(track);
                  const label = track === 'all' ? t.filterAll : trackMeta[track].label[locale];
                  return (
                    <button
                      key={track}
                      type="button"
                      aria-pressed={active}
                      title={count > 0 ? t.toDecide(count) : undefined}
                      onClick={() => dispatch({ type: 'filter', filter: track })}
                      className={cx(
                        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition',
                        active ? 'bg-ink text-bg' : 'text-muted hover:bg-surface-3 hover:text-ink'
                      )}
                    >
                      {track !== 'all' && (
                        <span
                          className="size-1.5 rounded-full"
                          style={{ background: trackMeta[track].color }}
                          aria-hidden
                        />
                      )}
                      {label}
                      {count > 0 && (
                        <span
                          className={cx(
                            'font-mono text-[10px]',
                            active ? 'text-bg/60' : 'text-faint'
                          )}
                        >
                          <span aria-hidden>{count}</span>
                          <span className="sr-only">{`, ${t.toDecide(count)}`}</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Columns: side by side from `lg`, stacked from `sm`, one swipe apart on phones. */}
            <SwipeRow
              label={t.eyebrow}
              className="p-3 max-sm:items-start sm:grid sm:gap-3 sm:p-4 lg:grid-cols-[2fr_1fr_1fr]"
              itemWidth="max-sm:w-[88%]"
              bleed="max-sm:scroll-px-3"
              dotsClassName="pb-3"
            >
              <Column title={t.columns.decision} count={decisions.length}>
                {shown(decisions, 'decision', DECISIONS_VISIBLE).map(({ ticket, ticketState }) => (
                  <DecisionCard
                    key={ticket.id}
                    ticket={ticket}
                    state={ticketState}
                    onOpen={onOpen}
                    onDecide={onDecide}
                  />
                ))}
                {hidden(decisions, DECISIONS_VISIBLE) > 0 && (
                  <MoreToggle
                    expanded={expanded.decision}
                    label={t.showMore(hidden(decisions, DECISIONS_VISIBLE))}
                    onToggle={() => toggle('decision')}
                  />
                )}
                {!decisions.length && <EmptyColumn />}
              </Column>

              <Column title={t.columns.review} count={reviews.length}>
                {shown(reviews, 'review', COMPACT_VISIBLE).map(({ ticket, ticketState }) => (
                  <ReviewCard
                    key={ticket.id}
                    ticket={ticket}
                    state={ticketState}
                    onOpen={onOpen}
                    onDecide={onDecide}
                  />
                ))}
                {hidden(reviews, COMPACT_VISIBLE) > 0 && (
                  <MoreToggle
                    expanded={expanded.review}
                    label={t.showMore(hidden(reviews, COMPACT_VISIBLE))}
                    onToggle={() => toggle('review')}
                  />
                )}
                {!reviews.length && <EmptyColumn />}
              </Column>

              <Column title={t.columns.released} count={released.length}>
                {shown(released, 'released', COMPACT_VISIBLE).map(({ ticket, ticketState }) => (
                  <ReleasedCard
                    key={ticket.id}
                    ticket={ticket}
                    state={ticketState}
                    onOpen={onOpen}
                  />
                ))}
                {hidden(released, COMPACT_VISIBLE) > 0 && (
                  <MoreToggle
                    expanded={expanded.released}
                    label={t.moreReleased(hidden(released, COMPACT_VISIBLE))}
                    onToggle={() => toggle('released')}
                  />
                )}
                {!released.length && <EmptyColumn />}
                {(rejectedCount > 0 || closedCount > 0) && (
                  <p className="flex flex-wrap gap-x-3 gap-y-1 px-1 font-mono text-[11px] text-faint">
                    {closedCount > 0 && <span>{t.closed(closedCount)}</span>}
                    {rejectedCount > 0 && <span>{t.rejected(rejectedCount)}</span>}
                  </p>
                )}
              </Column>
            </SwipeRow>
          </div>

          <AgentPractices />
        </div>
      </section>

      {/* Outside the section: its content-visibility would trap the fixed overlays. */}
      {drawerTicket && drawerId && (
        <TicketDrawer
          ticket={drawerTicket}
          state={state.tickets[drawerId]}
          onClose={closeDrawer}
          onDecide={onDecide}
        />
      )}
      {modal && modalTicket && (
        <ActionModal
          key={`${modal.id}-${modal.kind}`}
          kind={modal.kind}
          ticket={modalTicket}
          state={state.tickets[modal.id]}
          onClose={closeModal}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
}
