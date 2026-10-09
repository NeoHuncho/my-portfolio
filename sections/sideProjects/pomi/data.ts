/**
 * Static data for the Pomi demo: accents, seed content, voice phrases and copy.
 * Names and features follow the real Pomi app; the look is the portfolio's own.
 */

export type Locale = 'en' | 'fr';
export type Localized = Record<Locale, string>;
export type TimerType = 'work' | 'break' | 'longBreak';
export type TimerStatus = 'idle' | 'running' | 'paused';
export type Priority = 'urgent' | 'high';

export type Intention = {
  slug: string;
  emoji: string;
  name: Localized;
};

export type Due = { day: 0 | 1; time: string };

export type Task = {
  id: string;
  title: Localized;
  intention: string | null;
  due: Due | null;
  priority?: Priority;
  done: boolean;
};

export const SESSION_TOTAL = 3;

export const DURATIONS: Record<TimerType, number> = {
  work: 25 * 60_000,
  break: 5 * 60_000,
  longBreak: 15 * 60_000,
};

/** Pomi blue for focus, the site's green and violet for the two breaks. */
export const ACCENTS: Record<TimerType, string> = {
  work: '#5b9cff',
  break: '#4ade9f',
  longBreak: '#a78bfa',
};

export const INTENTIONS: Record<TimerType, Intention[]> = {
  work: [
    { slug: 'work', emoji: '💼', name: { en: 'Work', fr: 'Travail' } },
    { slug: 'side', emoji: '🛠️', name: { en: 'Side projects', fr: 'Projets perso' } },
    { slug: 'learning', emoji: '📚', name: { en: 'Learning', fr: 'Apprendre' } },
    { slug: 'personal', emoji: '🏡', name: { en: 'Personal', fr: 'Perso' } },
    { slug: 'admin', emoji: '🗂️', name: { en: 'Admin', fr: 'Admin' } },
  ],
  break: [
    { slug: 'coffee', emoji: '☕', name: { en: 'Coffee', fr: 'Café' } },
    { slug: 'stretch', emoji: '🧘', name: { en: 'Stretch', fr: 'Étirements' } },
    { slug: 'walk', emoji: '🚶', name: { en: 'Walk', fr: 'Marcher' } },
  ],
  longBreak: [
    { slug: 'lunch', emoji: '🍱', name: { en: 'Lunch', fr: 'Déjeuner' } },
    { slug: 'sport', emoji: '🏃', name: { en: 'Sport', fr: 'Sport' } },
  ],
};

const ALL_INTENTIONS = [...INTENTIONS.work, ...INTENTIONS.break, ...INTENTIONS.longBreak];

export function findIntention(slug: string | null): Intention | undefined {
  return slug ? ALL_INTENTIONS.find((intention) => intention.slug === slug) : undefined;
}

export const SEED_TASKS: Task[] = [
  {
    id: 'seed-1',
    title: { en: 'Fix the login bug in prod', fr: 'Corriger le bug de connexion' },
    intention: 'work',
    due: { day: 0, time: '11:00' },
    priority: 'urgent',
    done: false,
  },
  {
    id: 'seed-2',
    title: { en: 'Build the export to PDF', fr: 'Développer l’export PDF' },
    intention: 'work',
    due: { day: 0, time: '14:30' },
    done: false,
  },
  {
    id: 'seed-3',
    title: { en: 'Review the onboarding PR', fr: 'Relire la PR d’onboarding' },
    intention: 'work',
    due: null,
    done: true,
  },
  {
    id: 'seed-4',
    title: { en: 'Plan the weekend hike', fr: 'Préparer la rando du week-end' },
    intention: 'personal',
    due: { day: 1, time: '09:00' },
    done: false,
  },
];

/** What the visitor "says" on each mic tap, and the clean task it turns into. */
export type Phrase = {
  spoken: Localized;
  task: Omit<Task, 'id' | 'done'>;
};

export const PHRASES: Phrase[] = [
  {
    spoken: {
      en: 'Um, remind me to review the sync engine pull request tomorrow at ten',
      fr: 'Euh, rappelle-moi de relire la pull request du moteur de sync demain à dix heures',
    },
    task: {
      title: { en: 'Review the sync engine PR', fr: 'Relire la PR du moteur de sync' },
      intention: 'work',
      due: { day: 1, time: '10:00' },
      priority: 'high',
    },
  },
  {
    spoken: {
      en: 'I really have to answer those emails this afternoon, it’s kind of urgent',
      fr: 'Il faut vraiment que je réponde à ces mails cet après-midi, c’est assez urgent',
    },
    task: {
      title: { en: 'Reply to pending emails', fr: 'Répondre aux mails en attente' },
      intention: 'work',
      due: { day: 0, time: '14:00' },
      priority: 'urgent',
    },
  },
  {
    spoken: {
      en: 'Oh, and go for a run after work, like six thirty',
      fr: 'Ah, et aller courir après le boulot, vers dix-huit heures trente',
    },
    task: {
      title: { en: 'Go for a run', fr: 'Aller courir' },
      intention: 'sport',
      due: { day: 0, time: '18:30' },
    },
  },
];

const en = {
  types: { work: 'Focus', break: 'Break', longBreak: 'Long break' } as Record<TimerType, string>,
  skipTo: {
    work: 'Skip to Focus',
    break: 'Skip to Break',
    longBreak: 'Skip to Long break',
  } as Record<TimerType, string>,
  priorities: { urgent: 'Urgent', high: 'High' } as Record<Priority, string>,
  days: { '0': 'Today', '1': 'Tomorrow' } as Record<string, string>,
  start: 'Start timer',
  pause: 'Pause timer',
  reset: 'Reset timer',
  session: (position: number, total: number) => `Session ${position} of ${total}`,
  intentions: 'Intention',
  chooseIntention: 'Choose an intention',
  today: 'Today',
  doneCount: (done: number, total: number) => `${done}/${total} done`,
  more: (count: number) => `+${count} more`,
  complete: 'Complete',
  undoComplete: 'Mark as not done',
  tasks: 'Tasks',
  back: 'Back',
  crown: 'Watch face',
  close: 'Close',
  mic: 'Capture a task by voice',
  micStop: 'Stop listening',
  micHint: 'Tap to add a task',
  listening: 'Listening…',
  listeningWatch: 'Listening on the watch…',
  parsing: 'Turning it into a task…',
  added: 'Added to your tasks',
  appLabel: 'Pomi mobile app (demo)',
  watchLabel: 'Pomi on Wear OS (demo)',
  desktopLabel: 'Pomi desktop app (demo)',
  menu: ['File', 'Edit', 'View'],
  announce: {
    start: (type: string) => `${type} started`,
    pause: 'Timer paused',
    reset: 'Timer reset',
    next: (next: string) => `${next} up next`,
    finish: (type: string, next: string) => `${type} done. ${next} ready.`,
    listen: 'Listening',
    added: (title: string) => `Task added: ${title}`,
  },
};

const fr: typeof en = {
  types: { work: 'Focus', break: 'Pause', longBreak: 'Longue pause' },
  skipTo: {
    work: 'Passer au focus',
    break: 'Passer à la pause',
    longBreak: 'Passer à la longue pause',
  },
  priorities: { urgent: 'Urgent', high: 'Important' },
  days: { '0': 'Auj.', '1': 'Demain' },
  start: 'Démarrer le minuteur',
  pause: 'Mettre en pause',
  reset: 'Réinitialiser',
  session: (position: number, total: number) => `Session ${position} sur ${total}`,
  intentions: 'Intention',
  chooseIntention: 'Choisir une intention',
  today: 'Aujourd’hui',
  doneCount: (done: number, total: number) => `${done}/${total} faites`,
  more: (count: number) => `+${count} autres`,
  complete: 'Terminer',
  undoComplete: 'Marquer comme à faire',
  tasks: 'Tâches',
  back: 'Retour',
  crown: 'Cadran',
  close: 'Fermer',
  mic: 'Dicter une tâche',
  micStop: 'Arrêter l’écoute',
  micHint: 'Touche pour ajouter une tâche',
  listening: 'J’écoute…',
  listeningWatch: 'Écoute sur la montre…',
  parsing: 'Je la transforme en tâche…',
  added: 'Ajoutée à tes tâches',
  appLabel: 'App mobile Pomi (démo)',
  watchLabel: 'Pomi sur Wear OS (démo)',
  desktopLabel: 'App desktop Pomi (démo)',
  menu: ['Fichier', 'Édition', 'Affichage'],
  announce: {
    start: (type: string) => `C’est parti : ${type}`,
    pause: 'Minuteur en pause',
    reset: 'Minuteur réinitialisé',
    next: (next: string) => `Ensuite : ${next}`,
    finish: (type: string, next: string) => `Fin : ${type}. Prêt : ${next}.`,
    listen: 'Écoute en cours',
    added: (title: string) => `Tâche ajoutée : ${title}`,
  },
};

export const COPY: Record<Locale, typeof en> = { en, fr };
export type Copy = typeof en;

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatDue(due: Due | null, copy: Copy): string | null {
  return due ? `${copy.days[String(due.day)]} ${due.time}` : null;
}

/**
 * The tasks a list of `max` rows shows: new tasks join the end, so once the
 * list overflows the newest one keeps the last row.
 */
export function visibleTasks(tasks: Task[], max: number): Task[] {
  return tasks.length <= max ? tasks : [...tasks.slice(0, max - 1), tasks[tasks.length - 1]];
}

export function wordsOf(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}
