import { type LocalizedString } from './types';

/** How AI fits into a project: a title, a line that stands on its own, optional specifics. */
export type Callout = {
  title: LocalizedString;
  body: LocalizedString;
  points?: LocalizedString[];
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
          en: 'Pomi runs on the workflow from the board above: scheduled agents plan, I decide, an agent implements, and nothing merges until I understand it.',
          fr: 'Pomi tourne avec le workflow du board au-dessus : des agents planifiés préparent, je décide, un agent implémente, et rien n’est mergé tant que je ne l’ai pas compris.',
        },
        points: [
          {
            en: 'Planning agents for features, bugs, performance and security run twice a day.',
            fr: 'Des agents de planification pour les features, bugs, performance et sécurité tournent deux fois par jour.',
          },
          {
            en: 'Low-cost agents do the volume; decision agents stop empty runs in seconds.',
            fr: 'Des agents peu coûteux font le volume ; des agents de décision arrêtent les runs vides en quelques secondes.',
          },
        ],
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
          en: 'Agents test every GameHub change in a real browser on phone, tablet and desktop. Bot-versus-bot simulations check a game’s balance before a rule changes.',
          fr: 'Des agents testent chaque changement de GameHub dans un vrai navigateur, sur mobile, tablette et desktop. Des simulations bot contre bot vérifient l’équilibre avant qu’une règle change.',
        },
      },
      {
        title: { en: 'Where I experiment', fr: 'Mon terrain d’expérimentation' },
        body: {
          en: 'GameHub is my AI test bed: I connect Blender and other software to agents through MCP servers, and try each new frontier model on real tasks, from 3D figures to game rules.',
          fr: 'GameHub est mon terrain d’essai IA : je connecte Blender et d’autres logiciels aux agents via des serveurs MCP, et j’essaie chaque nouveau modèle frontier sur de vraies tâches, des figurines 3D aux règles du jeu.',
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
