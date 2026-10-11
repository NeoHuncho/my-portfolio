// Portfolio embed: the page's frames stay on the same screen, and the page can send them home.
// Copied into the Gamehub worktree by scripts/build-games.mjs (not part of Gamehub itself);
// Gamehub's SoloGame (components/game/solo.tsx, patched) tells it where it is with useEmbedNav.
//
// Between the frames of one page (BroadcastChannel `gamehub-nav-<match>`: frames opened with
// the same match number, so two portfolio tabs never drive each other):
//   { t: 'go', from, screen, stamp }  this frame moved to `screen` on its own (the visitor went
//                              back to the library, started a game from it, or started a new
//                              match of the same game): the others follow, opening the same
//                              game with the same match or setup. Rota's matches are then
//                              shared live (rota-sync); other games each run their own match
//                              from the same start.
//   { t: 'hello', from }       a frame that just opened asks where the others are; each answers
//                              with a 'go' for the screen it shows (or is opening).
// Every move carries a stamp (a Lamport clock, the frame's id breaking ties), and a frame only
// follows a move newer than the screen it shows (or is opening): when two frames move at once,
// both settle on the same one, the newer. A frame that receives an older move for another
// screen answers with its own, so the sender catches up. A frame that follows a move does not
// announce it again, so nothing echoes. A move being opened is settled after every render,
// even one that ends on the screen the frame started from, and gives up after a few seconds
// at most (the frame then announces where it is, so the others join it).
//
// With the page (window.postMessage, same origin only):
//   page → frame  { type: 'gamehub:home' }   back to the library, closing any open game or
//                                            game box, whatever this frame was opening; takes
//                                            the other frames along (a newer move than any)
//   frame → page  { type: 'gamehub:screen', home: boolean, game: string | null }
//                                            once on load and on every change: home is true
//                                            while the library shows; game is the open game's
//                                            library id (rota, arena, wildgrove…), else null
import { useEffect, useRef } from 'react';
import { embeddedGames, pageScope } from './config';

export type NavScreen = {
  /** What the frame shows: the library, or the table of a game of one of Gamehub's families. */
  kind: 'home' | 'trio' | 'rota' | 'arena' | 'alto' | 'diner' | 'own';
  /** Changes only when the frame moves to another screen, or to a new match of its game. */
  key: string;
  /** The open game's library id; null on the library. */
  game: string | null;
  /** What another frame needs to open the same screen: the match, or the box's choice. */
  payload?: unknown;
};

/** When a move was made: a Lamport clock, then the frame's id. */
type Stamp = { n: number; id: string };

type Message =
  { t: 'hello'; from: string } | { t: 'go'; from: string; screen: NavScreen; stamp: Stamp };

export const HOME: NavScreen = { kind: 'home', key: 'home', game: null };

/** Longest a frame waits to reach a screen another frame moved to. */
const PENDING_MS = 4000;

const uid = () => crypto.getRandomValues(new Uint32Array(2)).join('-');
/** A new match's identity, carried to the other frames with it. */
export const matchId = uid;

const id = uid();
const framed = typeof window !== 'undefined' && window.parent !== window;
const newer = (a: Stamp, b: Stamp) => a.n > b.n || (a.n === b.n && a.id > b.id);

/** The screen as last reported by SoloGame, and the move that brought it. */
let current: NavScreen | null = null;
let stamp: Stamp = { n: 0, id };
/** The highest clock seen. */
let clock = 0;
/** A screen this frame is opening for another frame's move: reaching it is not news. */
let pending: { screen: NavScreen; stamp: Stamp; timer: ReturnType<typeof setTimeout> } | null =
  null;
/** A frame said hello while this one was between screens: answer once settled. */
let helloWaiting = false;
let live: (() => NavScreen) | null = null;
let follow: ((screen: NavScreen) => void) | null = null;
let channel: BroadcastChannel | null = null;
/** The page asked for the library before SoloGame was there to go. */
let homeAsked = false;

function post(message: Message) {
  try {
    channel?.postMessage(message);
  } catch {
    // A screen that cannot be copied stays in this frame.
  }
}

/** Whether SoloGame shows the screen last reported (no move of its own on the way). */
const settled = () => !!current && live?.().key === current.key;

/** Tells the other frames where this one is: the screen it shows, or the one it is opening. */
function announce() {
  if (!pending && !settled()) {
    // Its own move is on the way: answer once it is reported.
    helloWaiting = true;
    return;
  }
  helloWaiting = false;
  if (pending) post({ t: 'go', from: id, screen: pending.screen, stamp: pending.stamp });
  else post({ t: 'go', from: id, screen: live!(), stamp });
}

function report(screen: NavScreen) {
  if (!framed) return;
  try {
    window.parent.postMessage(
      { type: 'gamehub:screen', home: screen.kind === 'home', game: screen.game },
      location.origin
    );
  } catch {}
}

function clearPending() {
  if (pending) clearTimeout(pending.timer);
  pending = null;
}

/** A move this frame makes itself: newer than every move it has seen. */
function moved() {
  clearPending();
  stamp = { n: ++clock, id };
  announce();
}

/** Another frame moved: open the same screen if that move is the newest this frame knows. */
function followRemote(screen: NavScreen, at: Stamp) {
  clock = Math.max(clock, at.n);
  if (!follow || !current || !screen) return;
  const target = pending ?? { screen: current, stamp };
  if (!newer(at, target.stamp)) {
    // This frame moved later (or at once and wins the tie): the sender follows this one.
    if (screen.key !== target.screen.key) announce();
    return;
  }
  if (screen.key === target.screen.key) {
    target.stamp = at;
    if (!pending) stamp = at;
    return;
  }
  // Every frame of the page ships the same games (config.ts); this only guards the rest.
  if (screen.kind !== 'home' && !(screen.game && embeddedGames.includes(screen.game))) return;
  clearPending();
  const timer = setTimeout(() => {
    // Never reached (or its render was lost): settle where this frame is, and say so.
    if (pending?.timer !== timer) return;
    if (current && pending.screen.key === current.key) settle();
    else moved();
  }, PENDING_MS);
  pending = { screen, stamp: at, timer };
  follow(screen);
}

/** The followed move is on screen: it is this frame's screen now. */
function settle() {
  if (!pending) return;
  stamp = pending.stamp;
  clearPending();
}

function goHome() {
  if (!follow) {
    homeAsked = true;
    return;
  }
  // The page's command wins over any move this frame was opening, and over the others' moves:
  // it is the newest move, and the other frames follow it.
  clearPending();
  follow(HOME);
  if (current?.key === HOME.key && settled()) moved();
  // Otherwise the render that reaches the library announces it (changed).
}

if (framed)
  window.addEventListener('message', (event: MessageEvent) => {
    if (event.origin !== location.origin || event.source !== window.parent) return;
    if ((event.data as { type?: unknown } | null)?.type === 'gamehub:home') goHome();
  });

function connect(read: () => NavScreen, go: (screen: NavScreen) => void) {
  live = read;
  follow = go;
  if (pageScope && typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel(`gamehub-nav-${pageScope}`);
    channel.onmessage = (event: MessageEvent<Message>) => {
      const message = event.data;
      if (!message || message.from === id) return;
      if (message.t === 'hello') announce();
      else if (message.t === 'go') followRemote(message.screen, message.stamp);
    };
  }
  return () => {
    clearPending();
    channel?.close();
    channel = null;
    live = follow = null;
  };
}

/** After every render of SoloGame: what it shows now. */
function changed(screen: NavScreen) {
  if (screen.key === current?.key) {
    // A followed move can end where the frame started (another frame went somewhere and came
    // back before this one rendered): it is settled all the same.
    if (pending?.screen.key === screen.key) settle();
  } else {
    const first = current === null;
    current = screen;
    report(screen);
    if (first) {
      // Where are the others? A frame opened late joins the screen they are on.
      post({ t: 'hello', from: id });
      if (homeAsked) {
        homeAsked = false;
        goHome();
      }
    } else if (pending?.screen.key === screen.key) settle();
    // The visitor (or the page) moved this frame.
    else moved();
  }
  if (helloWaiting) announce();
}

/**
 * SoloGame's side: `screen` is what it shows now, `go` opens a screen another frame (or the
 * page) asked for, closing whatever is open without asking.
 */
export function useEmbedNav(screen: NavScreen, go: (screen: NavScreen) => void) {
  const latest = useRef({ screen, go });
  useEffect(() => {
    latest.current = { screen, go };
  });
  useEffect(
    () =>
      connect(
        () => latest.current.screen,
        (next) => latest.current.go(next)
      ),
    []
  );
  // Every render, not only a new key: a followed move may end on the same key.
  useEffect(() => {
    changed(latest.current.screen);
  });
}
