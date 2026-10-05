export type Vec3 = [number, number, number];

/** Key into the "why it's on my desk" copy in translations (`hero.objects`). */
export type InfoId =
  | 'ticket'
  | 'keys'
  | 'agents'
  | 'oss'
  | 'server'
  | 'sport'
  | 'mountain'
  | 'portrait'
  | 'robot'
  | 'night'
  | 'flags';

export type TicketItem = {
  uid: string;
  kind: 'ticket';
  info: 'ticket';
  code: string;
  title: string;
  color: string;
  merged: boolean;
  pr: number;
};

export type KeycapItem = {
  uid: string;
  kind: 'keycap';
  info: 'keys';
  /** Values of KeyboardEvent.key that make this keycap hop. */
  keys: string[];
  label: string;
};

/** What a ticket can be dropped on to get shipped. */
export type AgentItem = {
  uid: string;
  kind: 'agent';
  info: 'agents';
};

export type PropItem = {
  uid: string;
  kind: 'prop';
  info: 'oss' | 'server' | 'sport' | 'mountain' | 'portrait' | 'robot' | 'night' | 'flags';
};

export type PlaygroundItem = TicketItem | KeycapItem | AgentItem | PropItem;

/** Same ids and colours as the "How I work" board, so the two sections tell one story. */
export const ticketPool: Array<Omit<TicketItem, 'uid' | 'kind' | 'info' | 'merged'>> = [
  { code: 'FEAT-142', title: 'Bulk reassign deliveries', color: '#5b9cff', pr: 521 },
  { code: 'SEC-12', title: 'Lock out login brute force', color: '#a78bfa', pr: 523 },
  { code: 'BUG-87', title: 'Crash without delivery photo', color: '#ff5d5d', pr: 518 },
  { code: 'PERF-31', title: 'Fix N+1 on the routes list', color: '#3fcf8e', pr: 524 },
  { code: 'DEP-40', title: 'Migrate to Next.js 16', color: '#7c8ba1', pr: 520 },
  { code: 'DOC-7', title: 'Time-window rules disagree', color: '#c9a46a', pr: 512 },
];

export function makeTicket(index: number, uid: string): TicketItem {
  const base = ticketPool[index % ticketPool.length];
  return { ...base, uid, kind: 'ticket', info: 'ticket', merged: false };
}

const slashKey: KeycapItem = {
  uid: 'key-slash',
  kind: 'keycap',
  info: 'keys',
  keys: ['/'],
  label: '/',
};

/** In order of importance, as they drop: me and my languages, the night shift, then the rest. */
const propIds = [
  'portrait',
  'robot',
  'flags',
  'night',
  'mountain',
  'sport',
  'oss',
  'server',
] as const;

export function buildInitialItems(compact: boolean): PlaygroundItem[] {
  // Touch screens have no keyboard to press it with.
  const keys = compact ? [] : [slashKey];
  const props: PropItem[] = propIds.map((info) => ({ uid: `prop-${info}`, kind: 'prop', info }));
  return [
    { uid: 'agents', kind: 'agent', info: 'agents' },
    makeTicket(0, 'ticket-0'),
    ...keys,
    ...props,
  ];
}
