import { useId, useState } from 'react';
import { FiCheck, FiRotateCcw } from 'react-icons/fi';
import { type Ticket } from '@config/board';
import { useLanguage } from '@hooks/useLanguage';
import { cx } from '@lib/cx';
import { type BoardAction, OTHER_PREFIX, type TicketState } from './boardReducer';
import Dialog from './Dialog';
import { type DecisionKind, TrackChip } from './TicketCard';

type ActionModalProps = {
  kind: DecisionKind;
  ticket: Ticket;
  state: TicketState;
  onClose: () => void;
  onSubmit: (action: BoardAction) => void;
};

const fieldClass =
  'mt-1.5 w-full rounded-xl border border-line-strong bg-bg/70 px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none';

export default function ActionModal({ kind, ticket, state, onClose, onSubmit }: ActionModalProps) {
  const { strings, locale } = useLanguage();
  const m = strings.board.modal;
  const titleId = useId();
  const noteId = useId();
  const [note, setNote] = useState('');
  const [reason, setReason] = useState<string | null>(null);
  const recommended = ticket.question?.options.find((option) => option.recommended)?.id;
  const [choice, setChoice] = useState<string | undefined>(
    state.answer?.startsWith(OTHER_PREFIX) ? 'other' : (state.answer ?? recommended)
  );
  const [other, setOther] = useState('');

  const title = {
    accept: m.acceptTitle(ticket.id),
    ask: m.askTitle(ticket.id),
    reject: m.rejectTitle(ticket.id),
    confirm: m.confirmTitle(ticket.id),
    reconsider: m.reconsiderTitle(ticket.id),
  }[kind];
  const body = {
    accept: m.acceptBody,
    ask: m.askBody,
    reject: m.rejectBody,
    confirm: m.confirmBody,
    reconsider: m.reconsiderBody,
  }[kind];

  const submit = (action: BoardAction) => {
    onSubmit(action);
    onClose();
  };

  // Accepting answers the agent's open question: the answer goes into the plan.
  const answer = choice === 'other' ? `${OTHER_PREFIX}${other.trim()}` : choice;
  const canAccept = !ticket.question || (Boolean(answer) && answer !== OTHER_PREFIX);
  const suggestion = ticket.followUp?.question[locale];
  const confirmAsk = () => {
    if (note.trim()) {
      submit({ type: 'ask', id: ticket.id, question: note, suggested: note.trim() === suggestion });
    }
  };

  const rejectNote = [reason, note.trim()].filter(Boolean).join(' · ');

  const footer = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="rounded-full px-3.5 py-2 text-sm text-muted transition hover:text-ink"
      >
        {m.cancel}
      </button>
      {kind === 'accept' && (
        <button
          type="button"
          disabled={!canAccept}
          onClick={() => submit({ type: 'accept', id: ticket.id, answer, note })}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-bg transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink"
        >
          <FiCheck aria-hidden />
          {m.acceptConfirm}
        </button>
      )}
      {kind === 'ask' && (
        <button
          type="button"
          disabled={!note.trim()}
          onClick={confirmAsk}
          className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-bg transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink"
        >
          {m.askConfirm}
        </button>
      )}
      {kind === 'reject' && (
        <button
          type="button"
          onClick={() => submit({ type: 'reject', id: ticket.id, note: rejectNote })}
          className="rounded-full bg-[#ff5d5d] px-4 py-2 text-sm font-medium text-bg transition hover:brightness-110"
        >
          {m.rejectConfirm}
        </button>
      )}
      {kind === 'confirm' && (
        <button
          type="button"
          onClick={() => submit({ type: 'confirmExisting', id: ticket.id, note })}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-bg transition hover:bg-white"
        >
          <FiCheck aria-hidden />
          {m.confirmConfirm}
        </button>
      )}
      {kind === 'reconsider' && (
        <button
          type="button"
          // The agent needs to know what the existing work misses.
          disabled={!note.trim()}
          onClick={() => submit({ type: 'reconsider', id: ticket.id, note })}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-bg transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink"
        >
          <FiRotateCcw aria-hidden />
          {m.reconsiderConfirm}
        </button>
      )}
    </div>
  );

  const noteLabel = {
    accept: m.acceptLabel,
    ask: m.askLabel,
    reject: m.rejectLabel,
    confirm: m.confirmLabel,
    reconsider: m.reconsiderLabel,
  }[kind];
  const notePlaceholder = {
    accept: m.acceptPlaceholder,
    ask: m.askPlaceholder,
    reject: m.rejectPlaceholder,
    confirm: m.confirmPlaceholder,
    reconsider: m.reconsiderPlaceholder,
  }[kind];

  return (
    <Dialog
      variant="center"
      labelledBy={titleId}
      closeLabel={m.cancel}
      onClose={onClose}
      footer={footer}
      header={
        <>
          <TrackChip ticket={ticket} />
          <h3 id={titleId} className="mt-2 text-lg font-semibold tracking-tight">
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted">{body}</p>
        </>
      }
    >
      {kind === 'accept' && ticket.question && (
        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-ink">
            <span className="block font-mono text-[11px] font-normal uppercase tracking-[0.12em] text-accent">
              {m.acceptQuestion}
            </span>
            {ticket.question.prompt[locale]}
          </legend>
          <div className="mt-3 space-y-2">
            {ticket.question.options.map((option) => (
              <label
                key={option.id}
                className={cx(
                  'flex cursor-pointer gap-3 rounded-xl border p-3 text-sm transition',
                  choice === option.id
                    ? 'border-accent bg-accent-soft'
                    : 'border-line hover:border-line-strong'
                )}
              >
                <input
                  type="radio"
                  name={`${titleId}-answer`}
                  className="mt-0.5 accent-[var(--color-accent)]"
                  checked={choice === option.id}
                  onChange={() => setChoice(option.id)}
                />
                <span>
                  {option.label[locale]}
                  {option.recommended && (
                    <span className="ml-2 rounded bg-ok/15 px-1.5 py-px font-mono text-[10px] text-ok">
                      {m.recommended}
                    </span>
                  )}
                </span>
              </label>
            ))}
            <label
              className={cx(
                'flex cursor-pointer flex-col gap-2 rounded-xl border p-3 text-sm transition',
                choice === 'other' ? 'border-accent bg-accent-soft' : 'border-line'
              )}
            >
              <span className="flex gap-3">
                <input
                  type="radio"
                  name={`${titleId}-answer`}
                  className="mt-0.5 accent-[var(--color-accent)]"
                  checked={choice === 'other'}
                  onChange={() => setChoice('other')}
                />
                {m.other}
              </span>
              {choice === 'other' && (
                <input
                  type="text"
                  value={other}
                  onChange={(event) => setOther(event.target.value)}
                  placeholder={m.otherPlaceholder}
                  aria-label={m.otherPlaceholder}
                  className={fieldClass}
                />
              )}
            </label>
          </div>
        </fieldset>
      )}

      {kind === 'ask' && suggestion && (
        <div className="mt-5">
          <p className="text-[11px] text-faint">{m.askSuggested}</p>
          <button
            type="button"
            onClick={() => setNote(suggestion)}
            aria-pressed={note.trim() === suggestion}
            className={cx(
              'mt-1.5 rounded-xl border px-3 py-2 text-left text-sm transition',
              note.trim() === suggestion
                ? 'border-accent bg-accent-soft text-ink'
                : 'border-line-strong text-muted hover:border-ink hover:text-ink'
            )}
          >
            {suggestion}
          </button>
        </div>
      )}

      {kind === 'reject' && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {m.rejectReasons.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={reason === item}
              onClick={() => setReason(reason === item ? null : item)}
              className={cx(
                'rounded-full border px-3 py-1 text-xs transition',
                reason === item
                  ? 'border-ink bg-ink text-bg'
                  : 'border-line-strong text-muted hover:text-ink'
              )}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      <label htmlFor={noteId} className="mt-5 block text-sm text-muted">
        {noteLabel}
      </label>
      <textarea
        id={noteId}
        rows={3}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder={notePlaceholder}
        required={kind === 'reconsider'}
        data-autofocus={kind !== 'accept' || !ticket.question ? true : undefined}
        className={cx(fieldClass, 'resize-none')}
      />
    </Dialog>
  );
}
