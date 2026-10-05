import { boardTickets } from '@config/boardTickets';
import { boardReducer, createInitialState } from './boardReducer';

const initial = () => createInitialState(boardTickets);

function must<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error('missing fixture');
  }
  return value;
}

const firstDecision = () =>
  must(boardTickets.find((ticket) => ticket.initialStage === 'needs-decision'));

const alreadyImplemented = () =>
  must(boardTickets.find((ticket) => ticket.initialStage === 'already-implemented'));

describe('boardReducer', () => {
  it('starts with tickets in their initial columns', () => {
    const state = initial();
    const pending = boardTickets.filter((ticket) => ticket.initialStage === 'pr-ready');
    expect(pending.length).toBeGreaterThan(0);
    pending.forEach((ticket) => {
      expect(state.tickets[ticket.id]).toMatchObject({ stage: 'review', review: 'pr-ready' });
    });
  });

  it('accepting moves a ticket to review as building and keeps the note', () => {
    const { id } = firstDecision();
    const state = boardReducer(initial(), { type: 'accept', id, note: '  behind a flag ' });
    expect(state.tickets[id]).toMatchObject({ stage: 'review', review: 'building' });
    expect(state.tickets[id].notes).toEqual([{ kind: 'accept', text: 'behind a flag' }]);
  });

  it('accepted and reconsidered tickets move to the front of the board', () => {
    const { id } = firstDecision();
    const accepted = boardReducer(initial(), { type: 'accept', id });
    expect(accepted.order[0]).toBe(id);
    expect(accepted.order).toHaveLength(boardTickets.length);
    const existing = alreadyImplemented().id;
    const reconsidered = boardReducer(accepted, { type: 'reconsider', id: existing, note: 'no' });
    expect(reconsidered.order.slice(0, 2)).toEqual([existing, id]);
  });

  it('rejecting closes the ticket, and decisions only apply once', () => {
    const { id } = firstDecision();
    const rejected = boardReducer(initial(), { type: 'reject', id });
    expect(rejected.tickets[id].stage).toBe('rejected');
    expect(boardReducer(rejected, { type: 'accept', id })).toBe(rejected);
  });

  it('accepting records the answer to the agent’s question', () => {
    const ticket = must(boardTickets.find((candidate) => candidate.question));
    const answer = must(ticket.question).options[0].id;
    const state = boardReducer(initial(), { type: 'accept', id: ticket.id, answer });
    expect(state.tickets[ticket.id]).toMatchObject({ stage: 'review', answer });
  });

  it('asking keeps the ticket waiting for a decision until the agent replies', () => {
    const { id } = firstDecision();
    const state = initial();
    expect(boardReducer(state, { type: 'ask', id, question: '  ', suggested: false })).toBe(state);
    const asked = boardReducer(state, { type: 'ask', id, question: ' why? ', suggested: false });
    expect(asked.tickets[id]).toMatchObject({
      stage: 'needs-decision',
      asked: { text: 'why?', suggested: false, answered: false },
    });
    const replied = boardReducer(asked, { type: 'askAnswered', id });
    expect(replied.tickets[id].asked?.answered).toBe(true);
    expect(boardReducer(replied, { type: 'askAnswered', id })).toBe(replied);
  });

  it('an accepted ticket gets its PR once the agent is done', () => {
    const { id } = firstDecision();
    const accepted = boardReducer(initial(), { type: 'accept', id });
    const state = boardReducer(accepted, { type: 'prReady', id });
    expect(state.tickets[id]).toMatchObject({ stage: 'review', review: 'pr-ready' });
    expect(state.tickets[id].prNumber).toBeGreaterThan(0);
  });

  it('only tickets being built can get a PR', () => {
    const { id } = firstDecision();
    const state = initial();
    expect(boardReducer(state, { type: 'prReady', id })).toBe(state);
  });

  it('starts already-implemented tickets in review, waiting for you', () => {
    const ticket = alreadyImplemented();
    expect(ticket.existing).toBeDefined();
    expect(initial().tickets[ticket.id]).toMatchObject({
      stage: 'review',
      review: 'already-implemented',
    });
  });

  it('confirming existing work closes the ticket without building anything', () => {
    const { id } = alreadyImplemented();
    const state = boardReducer(initial(), { type: 'confirmExisting', id });
    expect(state.tickets[id].stage).toBe('closed');
    expect(state.tickets[id].review).toBeUndefined();
    expect(boardReducer(state, { type: 'reconsider', id, note: 'too late' })).toBe(state);
  });

  it('reconsidering needs a reason and sends the ticket back to the agent', () => {
    const { id } = alreadyImplemented();
    const state = initial();
    expect(boardReducer(state, { type: 'reconsider', id, note: '   ' })).toBe(state);
    const reconsidered = boardReducer(state, { type: 'reconsider', id, note: ' not on mobile ' });
    expect(reconsidered.tickets[id]).toMatchObject({ stage: 'review', review: 'building' });
    expect(reconsidered.tickets[id].notes).toEqual([{ kind: 'reconsider', text: 'not on mobile' }]);
    const ready = boardReducer(reconsidered, { type: 'prReady', id });
    expect(ready.tickets[id]).toMatchObject({ review: 'pr-ready' });
  });

  it('only already-implemented tickets can be confirmed', () => {
    const { id } = firstDecision();
    const state = initial();
    expect(boardReducer(state, { type: 'confirmExisting', id })).toBe(state);
  });
});
