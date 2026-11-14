import { type LocalizedString } from './types';

/** How AI fits into a project: a title and a line that stands on its own. */
export type Callout = {
  title: LocalizedString;
  body: LocalizedString;
  /** Points up to the "How I work" board, which mocks this workflow. */
  linkToBoard?: boolean;
};

export type FeaturedProject = {
  id: 'pomi' | 'gamehub';
  name: string;
  tagline: LocalizedString;
  description: LocalizedString;
  platforms: string[];
  stack: string[];
  github: string;
  accent: string;
  callouts?: Callout[];
};

export type SmallProject = {
  name: string;
  period: string;
  description: LocalizedString;
  github?: string | string[];
  link?: string;
  archived?: boolean;
  /** GitHub stars, rounded down. */
  stars?: number;
  image: string;
};

export const featuredProjects: FeaturedProject[] = [
  {
    id: 'pomi',
    name: 'Pomi',
    tagline: {
      en: 'A focus timer that knows what you are focusing on.',
      fr: 'Un minuteur de concentration qui sait sur quoi tu te concentres.',
    },
    description: {
      en: 'Say a task out loud and AI turns it into a clean task. One codebase for every device, self-hosted.',
      fr: 'Dis une tâche à voix haute, l’IA en fait une tâche propre. Une seule codebase pour tous les appareils, auto-hébergée.',
    },
    platforms: ['Web', 'Desktop', 'iOS', 'Android', 'Wear OS', 'Docker'],
    stack: [
      'React 19',
      'NestJS',
      'PostgreSQL',
      'Tauri 2',
      'OpenRouter',
      'Redis',
      'Vite',
      'Playwright',
    ],
    github: 'https://github.com/Host-It-Labs/pomi',
    accent: '#5b9cff',
    callouts: [
      {
        title: { en: 'Built by scheduled agents', fr: 'Construit par des agents planifiés' },
        body: {
          en: 'Pomi is built with the workflow from the board above: agents plan twice a day, I decide, and nothing merges until I understand it.',
          fr: 'Pomi se construit avec le workflow du board au-dessus : des agents planifient deux fois par jour, je décide, et rien n’est mergé tant que je ne l’ai pas compris.',
        },
        linkToBoard: true,
      },
    ],
  },
  {
    id: 'gamehub',
    name: 'GameHub',
    tagline: {
      en: 'Original tabletop games I design and build.',
      fr: 'Des jeux de société originaux, que je conçois et développe.',
    },
    description: {
      en: 'Play solo against bots, or with friends from an invite link.',
      fr: 'Joue en solo contre des bots, ou entre amis avec un lien d’invitation.',
    },
    platforms: ['Web', 'Mobile', 'Docker'],
    stack: ['Next.js', 'React 19', 'three.js', 'Node', 'SQLite', 'SSE', 'Tailwind 4'],
    github: 'https://github.com/Host-It-Labs/gamehub',
    accent: '#e2c08d',
    callouts: [
      {
        title: { en: 'Tested by agents', fr: 'Testé par des agents' },
        body: {
          en: 'Agents test every GameHub change in a real browser, on phone and desktop, and bot-versus-bot games check the balance.',
          fr: 'Des agents testent chaque changement de GameHub dans un vrai navigateur, sur mobile et desktop, et des parties bot contre bot vérifient l’équilibre.',
        },
      },
      {
        title: { en: 'Where I experiment', fr: 'Mon terrain d’expérimentation' },
        body: {
          en: 'GameHub is where I try each new frontier model, and connect Blender and other software to agents through MCP.',
          fr: 'GameHub, c’est là que j’essaie chaque nouveau modèle frontier, et que je connecte Blender et d’autres logiciels aux agents via MCP.',
        },
      },
    ],
  },
];

export const smallProjects: SmallProject[] = [
  {
    name: 'Vikunja Voice Assistant',
    period: '2025',
    description: {
      en: 'Say a task to Home Assistant and AI files it in Vikunja. 200+ installs and outside contributors.',
      fr: "Dis une tâche à Home Assistant et l'IA la range dans Vikunja. 200+ installations et des contributeurs externes.",
    },
    github: 'https://github.com/NeoHuncho/vikunja-voice-assistant',
    stars: 60,
    image: '/assets/projects/fullStackProjects/vikunjaHA.webp',
  },
  {
    name: 'Open source contributions',
    period: '2024 – now',
    description: {
      en: 'Merged pull requests in Vikunja, AFFiNE and Home Assistant.',
      fr: 'Des pull requests mergées dans Vikunja, AFFiNE et Home Assistant.',
    },
    github: [
      'https://github.com/go-vikunja/vikunja',
      'https://github.com/toeverything/AFFiNE',
      'https://github.com/home-assistant/brands',
    ],
    image: '/assets/projects/fullStackProjects/openSource.webp',
  },
  {
    name: 'Second',
    period: '2023',
    description: {
      en: 'One search across several second-hand sites. Built end to end, never launched.',
      fr: 'Une seule recherche sur plusieurs sites de seconde main. Construite de bout en bout, jamais lancée.',
    },
    link: 'https://second-five.vercel.app/',
    github: 'https://github.com/NeoHuncho/second',
    archived: true,
    image: '/assets/projects/fullStackProjects/second.webp',
  },
  {
    name: 'Brawl Max',
    period: '2021 – 2022',
    description: {
      en: 'A React Native companion app to help players improve, on Android and iOS.',
      fr: 'Une app compagnon React Native pour aider les joueurs à progresser, sur Android et iOS.',
    },
    archived: true,
    image: '/assets/projects/fullStackProjects/brawlMax.webp',
  },
];
