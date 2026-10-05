import { type ReactNode, useId } from 'react';
import { FiCheck, FiCpu, FiMessageCircle, FiRotateCcw, FiUser, FiX } from 'react-icons/fi';
import { areaLabels, sourceLabels, type Ticket } from '@config/board';
import { useLanguage } from '@hooks/useLanguage';
import { type TicketState } from './boardReducer';
import Dialog from './Dialog';
import RichText from './RichText';
import {
  AskedQuestion,
  answerSummary,
  type DecisionKind,
  OpenQuestion,
  PrLink,
  TrackChip,
} from './TicketCard';

type TicketDrawerProps = {
  ticket: Ticket;
  state: TicketState;
  onClose: () => void;
  onDecide: (id: string, kind: DecisionKind) => void;
};

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-4 first:border-t-0">
      <h4 className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">{title}</h4>
      <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span className="mt-2 size-1 shrink-0 rounded-full bg-faint" aria-hidden />
          <span className="min-w-0">
            <RichText text={item} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function TicketDrawer({ ticket, state, onClose, onDecide }: TicketDrawerProps) {
  const { strings, locale } = useLanguage();
  const d = strings.board.drawer;
  const { card } = strings.board;
  const titleId = useId();
  const isBug = ticket.track === 'bug';
  const answer = answerSummary(ticket, state, locale);
  const needsDecision = state.stage === 'needs-decision';
  const prReady = state.review === 'pr-ready';
  const alreadyImplemented = state.review === 'already-implemented';

  let footer: ReactNode = null;
  if (needsDecision) {
    footer = (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onDecide(ticket.id, 'accept')}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-bg transition hover:bg-white"
        >
          <FiCheck aria-hidden />
          {strings.board.accept}
        </button>
        <button
          type="button"
          onClick={() => onDecide(ticket.id, 'ask')}
          className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-2 text-sm transition hover:border-ink"
        >
          <FiMessageCircle aria-hidden />
          {strings.board.ask}
        </button>
        <button
          type="button"
          onClick={() => onDecide(ticket.id, 'reject')}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-muted transition hover:text-ink"
        >
          <FiX aria-hidden />
          {strings.board.reject}
        </button>
      </div>
    );
  } else if (alreadyImplemented) {
    footer = (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onDecide(ticket.id, 'confirm')}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-bg transition hover:bg-white"
        >
          <FiCheck aria-hidden />
          {strings.board.confirm}
        </button>
        <button
          type="button"
          onClick={() => onDecide(ticket.id, 'reconsider')}
          className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-2 text-sm transition hover:border-ink"
        >
          <FiRotateCcw aria-hidden />
          {strings.board.reconsider}
        </button>
      </div>
    );
  } else if (prReady && state.prNumber) {
    footer = <PrLink pr={state.prNumber} className="text-xs" />;
  }

  return (
    <Dialog
      variant="side"
      labelledBy={titleId}
      closeLabel={d.close}
      onClose={onClose}
      footer={footer}
      header={
        <>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-faint">
            <TrackChip ticket={ticket} />
            <span>
              {d.source}: {sourceLabels[ticket.source][locale]}
            </span>
            <span>
              {d.area}: {areaLabels[ticket.area]}
            </span>
            <span>
              {card.effort} {ticket.effort} · {card.confidence} {ticket.confidence}%
            </span>
          </div>
          <h3 id={titleId} className="mt-2 text-xl font-semibold leading-snug tracking-tight">
            {ticket.title[locale]}
          </h3>
          <p className="mt-1 text-sm text-muted">{ticket.tldr[locale]}</p>
        </>
      }
    >
      <dl className="mt-4 space-y-3 rounded-xl border border-line bg-bg/50 p-4 text-sm">
        {[
          { label: isBug ? card.problem : card.goal, text: ticket.goal[locale] },
          { label: card.today, text: ticket.today[locale] },
          { label: isBug ? card.fix : card.change, text: ticket.change[locale] },
        ].map((row) => (
          <div key={row.label}>
            <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
              {row.label}
            </dt>
            <dd className="mt-0.5 text-ink/90">
              <RichText text={row.text} />
            </dd>
          </div>
        ))}
      </dl>

      {needsDecision && (
        <>
          <OpenQuestion ticket={ticket} className="mt-4" />
          <AskedQuestion ticket={ticket} state={state} className="mt-2" />
        </>
      )}

      {ticket.existing && (
        <div className="mt-4 rounded-xl border border-ok/30 bg-ok/5 px-4">
          <Block title={d.existingWhy}>
            <RichText text={ticket.existing.why[locale]} />
          </Block>
          <Block title={d.existingEvidence}>
            <List items={ticket.existing.evidence.map((item) => item[locale])} />
          </Block>
          <Block title={d.existingChecked}>
            <RichText text={ticket.existing.checked[locale]} />
          </Block>
          <Block title={d.existingGap}>
            <RichText text={ticket.existing.gap[locale]} />
          </Block>
        </div>
      )}

      <div className="mt-2">
        <Block title={card.inCode}>
          <ul className="space-y-1.5 font-mono text-[12px]">
            {ticket.technical.map((line) => (
              <li key={line.en} className="flex gap-2">
                <span className="text-accent" aria-hidden>
                  ›
                </span>
                <span className="min-w-0">
                  <RichText text={line[locale]} />
                </span>
              </li>
            ))}
          </ul>
        </Block>

        {ticket.migration && (
          <Block title={card.migration}>
            <p className="font-mono text-sm">
              <span className="text-ink">{ticket.migration.pkg}</span>{' '}
              <span>{ticket.migration.from}</span> <span className="text-accent">→</span>{' '}
              <span className="text-ok">{ticket.migration.to}</span>
            </p>
          </Block>
        )}

        {ticket.inconsistencies && (
          <Block title={card.disagree}>
            <ul className="space-y-2">
              {ticket.inconsistencies.map((item) => (
                <li key={item.source}>
                  <span className="block font-mono text-[11px] text-accent">{item.source}</span>
                  <RichText text={item.says[locale]} />
                </li>
              ))}
            </ul>
          </Block>
        )}

        <Block title={d.whyNow}>
          <RichText text={ticket.whyNow[locale]} />
        </Block>
        <Block title={d.evidence}>
          <List items={ticket.evidence.map((item) => item[locale])} />
        </Block>
        <Block title={d.plan}>
          <ol className="space-y-1.5">
            {ticket.plan.map((step, index) => (
              <li key={step.en} className="flex gap-2.5">
                <span className="font-mono text-[11px] leading-6 text-faint">{index + 1}.</span>
                <span className="min-w-0">
                  <RichText text={step[locale]} />
                </span>
              </li>
            ))}
          </ol>
          {answer?.planNote && (
            <p className="mt-3 rounded-lg border border-ok/30 bg-ok/10 p-2.5 text-ink">
              <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-ok">
                {d.updatedPlan}
              </span>
              <RichText text={answer.planNote} />
            </p>
          )}
        </Block>
        <Block title={d.acceptance}>
          <List items={ticket.acceptance.map((item) => item[locale])} />
        </Block>
        <Block title={d.validation}>
          <RichText text={ticket.validation[locale]} />
        </Block>
        <Block title={d.watchFor}>
          <RichText text={ticket.watchFor[locale]} />
        </Block>

        {ticket.pr && state.prNumber && (
          <Block title={`${d.pr} #${state.prNumber}`}>
            <ul className="space-y-1.5 font-mono text-[12px]">
              {ticket.pr.highlights.map((line) => (
                <li key={line.en} className="flex gap-2">
                  <span className="text-ok" aria-hidden>
                    +
                  </span>
                  <span className="min-w-0">
                    <RichText text={line[locale]} />
                  </span>
                </li>
              ))}
            </ul>
          </Block>
        )}

        {(answer || state.notes.length > 0) && (
          <Block title={d.notes}>
            <ul className="space-y-1.5">
              {answer && <li className="text-ink">→ {answer.label}</li>}
              {state.notes.map((note) => (
                <li key={`${note.kind}-${note.text}`} className="text-ink">
                  <span className="font-mono text-[11px] text-faint">{note.kind}</span> {note.text}
                </li>
              ))}
            </ul>
          </Block>
        )}

        <Block title={d.roles}>
          <ul className="grid gap-2 sm:grid-cols-3">
            {[
              { icon: FiCpu, text: d.roleAgent },
              { icon: FiUser, text: d.roleHuman },
              { icon: FiCheck, text: d.roleCi },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="rounded-lg bg-surface-2 p-2.5 text-xs">
                <Icon className="mb-1 text-accent" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </Block>
      </div>
    </Dialog>
  );
}
