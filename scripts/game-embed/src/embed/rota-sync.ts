// Portfolio embed: one Rota match shared live by several frames of the same page (the
// portfolio shows it on a desktop and on a phone). Copied into the Gamehub worktree by
// scripts/build-games.mjs (not part of Gamehub itself).
//
// One frame is the host, elected with a Web Lock: it alone runs the bots and applies moves,
// and after each change it sends the whole match (a few KB) to the others over a
// BroadcastChannel. Every other frame mirrors the host's match. A move made in a mirror
// shows at once (applied on top of the host's match while it waits) and goes to the host,
// which applies it and acknowledges it in its next broadcast. When the host frame leaves
// (or is gone), the lock passes to a waiting mirror, which carries on from the match it
// has and resends any move the old host never acknowledged.
//
// Bots never double-play (only the host runs them) and the dice never diverge (the RNG
// state travels with the match). Without Web Locks or BroadcastChannel, each frame keeps
// its own match.
import { observe, play, type RotaGame, type RotaMove } from '@/lib/games/rota/engine';
import { botRound } from '@/lib/games/rota/bot';

type Op = { seq: number; epoch: string } & (
  | { m: RotaMove }
  /** A new match; `next` is its epoch. Moves for the old one are dropped. */
  | { replace: RotaGame; next: string }
);

type Message =
  | { t: 'hello'; from: string }
  | { t: 'op'; from: string; op: Op }
  | {
      t: 'state';
      from: string;
      g: RotaGame;
      epoch: string;
      /** Last move applied from each frame. */
      acks: Record<string, number>;
    };

const uid = () => crypto.getRandomValues(new Uint32Array(2)).join('-');
/** Bots wait this long after each change, as in Gamehub's own solo table. */
const BOT_DELAY = 60;

export class RotaSync {
  private readonly id = uid();
  private channel: BroadcastChannel | null = null;
  private abort = new AbortController();
  private releaseLock: (() => void) | null = null;
  private host = false;
  private hostId: string | null = null;
  /** The host's match, as last applied (host) or received (mirror). */
  private confirmed: RotaGame;
  private epoch: string;
  /** This frame's moves the host has not acknowledged yet. */
  private pending: Op[] = [];
  private seq = 0;
  private acks: Record<string, number> = {};
  private view: RotaGame;
  private viewEpoch: string;
  private listeners = new Set<() => void>();
  private botTimer: ReturnType<typeof setTimeout> | undefined;
  private disposed = false;

  constructor(name: string, initial: RotaGame, epoch: string) {
    this.confirmed = this.view = initial;
    this.epoch = this.viewEpoch = epoch;
    const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
    if (typeof BroadcastChannel === 'undefined' || !locks) {
      this.becomeHost();
      return;
    }
    this.channel = new BroadcastChannel(name);
    this.channel.onmessage = (event: MessageEvent<Message>) => this.receive(event.data);
    locks
      .request(name, { signal: this.abort.signal }, () => {
        if (this.disposed) return undefined;
        this.becomeHost();
        // Held until this frame leaves the match.
        return new Promise<void>((resolve) => {
          this.releaseLock = resolve;
        });
      })
      .catch(() => {});
    this.post({ t: 'hello', from: this.id });
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  get = () => this.view;

  /** The visitor's own move (seat 0). */
  move(m: RotaMove) {
    this.submit({ seq: ++this.seq, epoch: this.viewEpoch, m });
  }

  /** Starts a new match in every frame. */
  replace(g: RotaGame) {
    this.submit({ seq: ++this.seq, epoch: this.viewEpoch, replace: g, next: uid() });
  }

  /** This frame leaves the match; the others carry on with it. */
  dispose() {
    this.disposed = true;
    clearTimeout(this.botTimer);
    this.abort.abort();
    this.releaseLock?.();
    this.channel?.close();
    this.listeners.clear();
  }

  // ----------------------------------------------------------------------------------------

  private submit(op: Op) {
    if (this.disposed) return;
    if (this.host) {
      this.apply(this.id, op);
      return;
    }
    this.pending.push(op);
    this.post({ t: 'op', from: this.id, op });
    this.rebase();
  }

  private post(message: Message) {
    this.channel?.postMessage(message);
  }

  private notify() {
    for (const listener of this.listeners) listener();
  }

  private broadcast() {
    this.post({
      t: 'state',
      from: this.id,
      g: this.confirmed,
      epoch: this.epoch,
      acks: this.acks,
    });
  }

  /** What this frame shows: the host's match with its own unacknowledged moves on top. */
  private rebase() {
    let g = this.confirmed;
    let epoch = this.epoch;
    for (const op of this.pending) {
      if ('replace' in op) {
        g = op.replace;
        epoch = op.next;
      } else if (op.epoch === epoch) g = play(g, op.m, 0);
    }
    this.view = g;
    this.viewEpoch = epoch;
    this.notify();
  }

  private becomeHost() {
    if (this.disposed || this.host) return;
    this.host = true;
    this.hostId = this.id;
    // Carry on from what this frame shows, its own moves included.
    this.confirmed = this.view;
    this.epoch = this.viewEpoch;
    this.pending = [];
    this.acks = { ...this.acks, [this.id]: this.seq };
    this.broadcast();
    this.scheduleBots();
  }

  /** Host only: applies one frame's move or new match, then tells everyone. */
  private apply(from: string, op: Op) {
    if ((this.acks[from] ?? 0) < op.seq) {
      this.acks = { ...this.acks, [from]: op.seq };
      if ('replace' in op) {
        this.confirmed = op.replace;
        this.epoch = op.next;
      } else if (op.epoch === this.epoch) this.confirmed = play(this.confirmed, op.m, 0);
      this.view = this.confirmed;
      this.viewEpoch = this.epoch;
      this.notify();
      this.scheduleBots();
    }
    // A repeat is acknowledged again, in case the first answer went to an old host.
    this.broadcast();
  }

  private receive(message: Message) {
    if (this.disposed) return;
    if (message.t === 'hello') {
      if (this.host) this.broadcast();
    } else if (message.t === 'op') {
      if (this.host) this.apply(message.from, message.op);
    } else if (message.t === 'state' && !this.host) {
      const newHost = message.from !== this.hostId;
      this.hostId = message.from;
      this.confirmed = message.g;
      this.epoch = message.epoch;
      this.acks = message.acks;
      const acked = message.acks[this.id] ?? 0;
      this.pending = this.pending.filter((op) => op.seq > acked);
      if (newHost)
        for (const op of this.pending) this.post({ t: 'op', from: this.id, op });
      this.rebase();
    }
  }

  /** Host only: bots build their round in the background, one after another. */
  private scheduleBots() {
    clearTimeout(this.botTimer);
    const waiting = (g: RotaGame) => (g.over ? -1 : g.seats.findIndex((s) => s.bot && !s.locked));
    if (!this.host || this.disposed || waiting(this.confirmed) < 0) return;
    this.botTimer = setTimeout(() => {
      const cur = this.confirmed;
      const bot = waiting(cur);
      if (!this.host || this.disposed || bot < 0) return;
      let next = cur;
      for (const m of botRound(observe(cur, bot), bot)) next = play(next, m, bot);
      this.confirmed = this.view = next;
      this.viewEpoch = this.epoch;
      this.notify();
      this.broadcast();
      this.scheduleBots();
    }, BOT_DELAY);
  }
}
