import { useEffect, useReducer, useRef } from 'react';
import { type Ticket } from '@config/board';
import { boardReducer, createInitialState } from './boardReducer';

/** How long the agent "implements" a ticket you accept before its PR is ready. */
const BUILD_MS = 3200;
/** How long the agent "researches" a question you ask before replying. */
const REPLY_MS = 2600;

export function useBoardState(tickets: Ticket[]) {
  const [state, dispatch] = useReducer(boardReducer, tickets, createInitialState);
  // Tickets already building when the demo starts stay that way: they show the in-between state.
  const handled = useRef(
    new Set(tickets.filter((ticket) => ticket.initialStage === 'building').map(({ id }) => id))
  );
  const asked = useRef(new Set<string>());
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    Object.entries(state.tickets).forEach(([id, ticket]) => {
      if (ticket.review === 'building' && !handled.current.has(id)) {
        handled.current.add(id);
        timers.current.push(setTimeout(() => dispatch({ type: 'prReady', id }), BUILD_MS));
      }
      const question = ticket.asked && !ticket.asked.answered && `${id}:${ticket.asked.text}`;
      if (question && !asked.current.has(question)) {
        asked.current.add(question);
        timers.current.push(setTimeout(() => dispatch({ type: 'askAnswered', id }), REPLY_MS));
      }
    });
  }, [state.tickets]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  return { state, dispatch };
}
