import { type ReviewStatus, type Stage, type Ticket, type Track } from '@config/board';

export type NoteKind = 'accept' | 'ask' | 'reject' | 'confirm' | 'reconsider';

export type TicketNote = { kind: NoteKind; text: string };

/** A question you asked the agent before deciding. */
export type AskedQuestion = {
  text: string;
  /** The ticket's suggested follow-up, which has a prepared reply. */
  suggested: boolean;
  answered: boolean;
};

export type TicketState = {
  /** `closed`: you confirmed the work already existed, so nothing new was built. */
  stage: Stage | 'rejected' | 'closed';
  review?: ReviewStatus;
  /** Answer to the agent's open question, given when accepting: an option id, or free text prefixed with "other:". */
  answer?: string;
  asked?: AskedQuestion;
  notes: TicketNote[];
  prNumber?: number;
  version?: string;
};

export type BoardState = {
  tickets: Record<string, TicketState>;
  order: string[];
  filter: Track | 'all';
  /** Latest real PR number: the PRs agents open during the demo follow it. */
  lastPr: number;
};

export type BoardAction =
  | { type: 'accept'; id: string; answer?: string; note?: string }
  | { type: 'reject'; id: string; note?: string }
  /** Not ready to decide: ask the agent first. The ticket waits for its reply. */
  | { type: 'ask'; id: string; question: string; suggested: boolean }
  /** The agent replied to your question. */
  | { type: 'askAnswered'; id: string }
  | { type: 'filter'; filter: Track | 'all' }
  /** The agent finished implementing an accepted ticket and opened its PR. */
  | { type: 'prReady'; id: string }
  /** You agree the work already exists: the ticket closes as done. */
  | { type: 'confirmExisting'; id: string; note?: string }
  /** You disagree: with a reason, the ticket goes back to the agent to implement. */
  | { type: 'reconsider'; id: string; note: string };

export const OTHER_PREFIX = 'other:';
const RELEASE = 'v0.32.0';
// Pomi's latest pull request when this demo was written: the ones you open here follow it.
const FIRST_PR = 312;

export function createInitialState(tickets: Ticket[]): BoardState {
  const state: Record<string, TicketState> = {};
  tickets.forEach((ticket) => {
    const { initialStage } = ticket;
    if (
      initialStage === 'building' ||
      initialStage === 'pr-ready' ||
      initialStage === 'already-implemented'
    ) {
      state[ticket.id] = {
        stage: 'review',
        review: initialStage,
        notes: [],
        prNumber: ticket.pr?.number,
      };
      return;
    }
    state[ticket.id] = {
      stage: initialStage,
      notes: [],
      prNumber: ticket.pr?.number,
      version: initialStage === 'released' ? (ticket.release ?? RELEASE) : undefined,
    };
  });
  return {
    tickets: state,
    order: tickets.map((ticket) => ticket.id),
    filter: 'all',
    // Made-up tickets' PRs stay out of the count, so demo PRs follow the real ones.
    lastPr: Math.max(
      FIRST_PR,
      ...tickets.filter((ticket) => !ticket.illustrative).map((ticket) => ticket.pr?.number ?? 0)
    ),
  };
}

function update(state: BoardState, id: string, patch: (ticket: TicketState) => TicketState) {
  return { ...state, tickets: { ...state.tickets, [id]: patch(state.tickets[id]) } };
}

/**
 * Puts a ticket first in the board order. Columns show their first few tickets, so work
 * you just sent to the agent stays in view instead of landing behind "show more".
 */
function toFront(state: BoardState, id: string): BoardState {
  return { ...state, order: [id, ...state.order.filter((current) => current !== id)] };
}

function withNote(ticket: TicketState, kind: NoteKind, text?: string): TicketNote[] {
  return text?.trim() ? [...ticket.notes, { kind, text: text.trim() }] : ticket.notes;
}

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  const ticket = 'id' in action ? state.tickets[action.id] : undefined;

  switch (action.type) {
    case 'accept':
      if (ticket?.stage !== 'needs-decision') {
        return state;
      }
      return toFront(
        update(state, action.id, (current) => ({
          ...current,
          stage: 'review',
          review: 'building',
          answer: action.answer ?? current.answer,
          notes: withNote(current, 'accept', action.note),
        })),
        action.id
      );
    case 'reject':
      if (ticket?.stage !== 'needs-decision') {
        return state;
      }
      return update(state, action.id, (current) => ({
        ...current,
        stage: 'rejected',
        notes: withNote(current, 'reject', action.note),
      }));
    case 'ask':
      if (ticket?.stage !== 'needs-decision' || !action.question.trim()) {
        return state;
      }
      return update(state, action.id, (current) => ({
        ...current,
        asked: { text: action.question.trim(), suggested: action.suggested, answered: false },
      }));
    case 'askAnswered':
      if (!ticket?.asked || ticket.asked.answered) {
        return state;
      }
      return update(state, action.id, (current) => ({
        ...current,
        asked: current.asked && { ...current.asked, answered: true },
      }));
    case 'prReady': {
      if (ticket?.review !== 'building') {
        return state;
      }
      const prNumber = ticket.prNumber ?? state.lastPr + 1;
      return update(
        { ...state, lastPr: Math.max(state.lastPr, prNumber) },
        action.id,
        (current) => ({
          ...current,
          review: 'pr-ready',
          prNumber,
        })
      );
    }
    case 'confirmExisting':
      if (ticket?.review !== 'already-implemented') {
        return state;
      }
      return update(state, action.id, (current) => ({
        ...current,
        stage: 'closed',
        review: undefined,
        notes: withNote(current, 'confirm', action.note),
      }));
    case 'reconsider':
      // Sending it back needs a reason: the agent has to know what is missing.
      if (ticket?.review !== 'already-implemented' || !action.note.trim()) {
        return state;
      }
      return toFront(
        update(state, action.id, (current) => ({
          ...current,
          review: 'building',
          notes: withNote(current, 'reconsider', action.note),
        })),
        action.id
      );
    case 'filter':
      return { ...state, filter: action.filter };
    default:
      return state;
  }
}
