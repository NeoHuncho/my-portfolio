import { type LocalizedString } from './types';

export type ExperienceShot = { src: string; alt: string };

export type AiNote = {
  title: LocalizedString;
  body: LocalizedString;
  /** Points down to the "How I work" board, which mocks this. */
  linkToBoard?: boolean;
};

export type Experience = {
  id: string;
  company: string;
  role: LocalizedString;
  /** Start date shown on the timeline. */
  from: LocalizedString;
  to: LocalizedString | null;
  /** City and country the role was based in. */
  city: LocalizedString;
  /** What the company does. */
  sector: LocalizedString;
  summary: LocalizedString;
  metrics: Array<{ value: string; label: LocalizedString }>;
  built: LocalizedString[];
  /** How AI fitted into the work there, shown under the visuals. */
  ai?: AiNote[];
  /** One line above the AI notes. */
  aiLead?: LocalizedString;
  /** Most central to the work first. */
  stack: string[];
  shots: ExperienceShot[];
  link?: string;
  /** Shown instead of screenshots when the work is confidential. */
  illustration?: 'planning';
};

export const experiences: Experience[] = [
  {
    id: 'apptitude',
    company: 'Apptitude',
    role: { en: 'AI Engineer · Full-stack Developer', fr: 'AI Engineer · Développeur Full-stack' },
    from: { en: 'Mar 2026', fr: 'mars 2026' },
    to: null,
    city: { en: 'Lausanne, Switzerland', fr: 'Lausanne, Suisse' },
    sector: { en: 'Digital agency', fr: 'Agence digitale' },
    summary: {
      en: 'Client projects, mainly a Swiss financial-planning platform used by wealth advisors, built front to back in an Nx monorepo.',
      fr: 'Des projets clients, surtout une plateforme suisse de planification financière pour conseillers en patrimoine, du front au back dans un monorepo Nx.',
    },
    metrics: [
      { value: '110+', label: { en: 'merged PRs in 6 months', fr: 'PR mergées en 6 mois' } },
      {
        value: 'Agents',
        label: {
          en: 'I built most of the repo’s agent tooling',
          fr: 'j’ai construit l’essentiel de l’outillage agents du repo',
        },
      },
      {
        value: 'Front → back',
        label: { en: 'Next.js, NestJS, PostgreSQL', fr: 'Next.js, NestJS, PostgreSQL' },
      },
    ],
    built: [
      {
        en: 'Wealth and retirement simulation across the Swiss three-pillar system, with quick actions like changing the retirement date or moving to another municipality.',
        fr: 'Simulation de patrimoine et de retraite sur les trois piliers suisses, avec des actions rapides comme changer la date de retraite ou de commune.',
      },
      {
        en: 'Balance sheet and operating account for self-employed clients: depreciation, cash flow, interest and equity.',
        fr: "Bilan et compte d'exploitation pour les indépendants : amortissements, cash-flow, intérêts et fonds propres.",
      },
      {
        en: 'Wealth dashboards, pillar detail panels and PDF reports on AG Grid and AG Charts.',
        fr: 'Dashboards patrimoniaux, panneaux de détail par pilier et rapports PDF sur AG Grid et AG Charts.',
      },
      {
        en: 'On the side, an animated e-card for an international client.',
        fr: 'À côté, une e-card animée pour un client international.',
      },
    ],
    aiLead: {
      en: 'Custom layers I added on top of Claude Code and Codex:',
      fr: 'Des couches maison que j’ai ajoutées par-dessus Claude Code et Codex :',
    },
    ai: [
      {
        title: {
          en: 'Agent instructions and repo memory',
          fr: 'Instructions des agents et mémoire du repo',
        },
        body: {
          en: 'Agents learn our in-house libraries from instructions I wrote and a selective repo memory fed by the whole team: lead-dev notes, bad calls in plans, review comments on generated code. Only lessons that change how the next agent works go in.',
          fr: "Les agents apprennent nos librairies maison grâce à mes instructions et à une mémoire du repo sélective, nourrie par toute l'équipe : notes du lead dev, mauvais choix dans les plans, commentaires sur le code généré. N'y entrent que les leçons qui changent le travail du prochain agent.",
        },
      },
      {
        title: { en: 'A worktree per agent', fr: 'Un worktree par agent' },
        body: {
          en: 'Each agent gets its own worktree, local environment and database copy, so several take tasks through the full cycle, QA included, in parallel.',
          fr: 'Chaque agent a son worktree, son environnement local et sa copie de la base : plusieurs mènent des tâches sur tout le cycle, QA comprise, en parallèle.',
        },
      },
      {
        title: { en: 'A radar for agent runs', fr: "Un radar pour les runs d'agents" },
        body: {
          en: 'Scheduled agents review the codebase and report to one dashboard, the radar. Each finding comes with a plan; I decide what gets done.',
          fr: 'Des agents planifiés passent la codebase en revue et remontent dans un dashboard, le radar. Chaque point arrive avec un plan ; je décide de la suite.',
        },
        linkToBoard: true,
      },
      {
        title: { en: 'Experiments', fr: 'Expérimentations' },
        body: {
          en: 'Long-running agent audits, multi-agent orchestration, and evals and observability for agent runs.',
          fr: 'Audits longs menés par des agents, orchestration multi-agents, évaluation et observabilité des runs.',
        },
      },
    ],
    stack: [
      'Next.js',
      'React',
      'NestJS',
      'PostgreSQL',
      'Claude Code',
      'Codex',
      'Nx',
      'TanStack Query',
      'MikroORM',
      'MUI',
      'AG Grid',
      'Playwright',
      'Kubernetes',
    ],
    shots: [],
    illustration: 'planning',
  },
  {
    id: 'zenride',
    company: 'Zenride',
    role: { en: 'Full-stack Developer', fr: 'Développeur Full-stack' },
    from: { en: '2023', fr: '2023' },
    to: { en: 'Feb 2026', fr: 'fév. 2026' },
    city: { en: 'Paris, France', fr: 'Paris, France' },
    sector: { en: 'Employee bike leasing', fr: 'Leasing de vélos salariés' },
    summary: {
      en: 'Frontend and backend of a bike-leasing platform used by employees, employers, retailers and the fleet team.',
      fr: "Frontend et backend d'une plateforme de leasing de vélos utilisée par les salariés, les employeurs, les magasins et l'équipe flotte.",
    },
    metrics: [
      { value: '580+', label: { en: 'pull requests', fr: 'pull requests' } },
      {
        value: '#1',
        label: {
          en: 'of 9 devs for features shipped, H1 2025',
          fr: 'sur 9 devs en features livrées, S1 2025',
        },
      },
      { value: '4', label: { en: 'portals in one app', fr: 'portails dans une app' } },
    ],
    built: [
      {
        en: 'A multi-portal web app: employee leasing, retailer checkout, contract management and fleet dashboards.',
        fr: 'Une app web multi-portails : leasing salarié, caisse magasin, gestion des contrats et dashboards de flotte.',
      },
      {
        en: 'The fleet management backend: contract lifecycle, payments, insurance and third-party integrations.',
        fr: 'Le backend de gestion de flotte : cycle de vie des contrats, paiements, assurances et intégrations tierces.',
      },
      {
        en: 'Containerised services on Kubernetes, with Sentry monitoring and Jest coverage.',
        fr: 'Services conteneurisés sur Kubernetes, avec monitoring Sentry et couverture Jest.',
      },
    ],
    ai: [
      {
        title: { en: 'Where I started with AI', fr: "Mes débuts avec l'IA" },
        body: {
          en: 'I started using AI at Zenride: GitHub Copilot first, then Claude Code with Claude 3.5 Sonnet, and Opus 4 when it came out. Human in the loop all the way: I steered every change and reviewed every line.',
          fr: "J'ai commencé l'IA chez Zenride : d'abord GitHub Copilot, puis Claude Code avec Claude 3.5 Sonnet, et Opus 4 à sa sortie. Humain dans la boucle de bout en bout : je pilotais chaque changement et relisais chaque ligne.",
        },
      },
      {
        title: { en: 'My first custom AI rules', fr: 'Mes premières règles IA maison' },
        body: {
          en: 'Zenride is also where I first wrote custom rules and instructions for AI: for the automated AI reviews on pull requests, and for my everyday agent runs.',
          fr: 'C’est aussi chez Zenride que j’ai écrit mes premières règles et instructions IA maison : pour les relectures IA automatiques des pull requests, et pour mes runs d’agents du quotidien.',
        },
      },
      {
        title: { en: 'Codebase audits', fr: 'Audits de la codebase' },
        body: {
          en: 'I ran AI audits of the codebase to understand quickly how its more sensitive parts worked, across a large codebase and database.',
          fr: 'Des audits de la codebase avec l’IA pour comprendre vite le fonctionnement de ses parties les plus sensibles, sur une grosse codebase et sa base de données.',
        },
      },
    ],
    stack: [
      'React',
      'Node',
      'Express',
      'MySQL',
      'Docker',
      'Kubernetes',
      'React Query',
      'Sequelize',
      'Sentry',
      'Jest',
      'React Admin',
      'Puppeteer',
      'Zustand',
      'Leaflet',
      'Lingui',
    ],
    shots: [
      { src: '/assets/projects/professionalWork/zenrideFrontend.webp', alt: 'Zenride website' },
      {
        src: '/assets/projects/professionalWork/zenrideLogin.webp',
        alt: 'Zenride client area login',
      },
    ],
    link: 'https://www.zenride.co/',
  },
  {
    id: 'cagette',
    company: 'Cagette & Paprika',
    role: { en: 'Full-stack Developer', fr: 'Développeur Full-stack' },
    from: { en: '2021', fr: '2021' },
    to: { en: '2023', fr: '2023' },
    city: { en: 'Lille, France', fr: 'Lille, France' },
    sector: { en: 'Grocery home delivery', fr: 'Livraison de courses à domicile' },
    summary: {
      en: 'A grocery delivery start-up, acquired by Auchan Retail. I worked across the whole product, from the shop to the delivery rounds.',
      fr: "Une start-up de livraison de courses, rachetée par Auchan Retail. J'ai travaillé sur tout le produit, de la boutique aux tournées de livraison.",
    },
    metrics: [
      { value: '5', label: { en: 'products shipped', fr: 'produits livrés' } },
      { value: 'iOS + Android', label: { en: 'mobile app', fr: 'app mobile' } },
      { value: 'Auchan', label: { en: 'acquired by', fr: 'racheté par' } },
    ],
    built: [
      {
        en: 'Ported the PHP shop to React and TypeScript, with new features and a better UX.',
        fr: 'Migration de la boutique PHP vers React et TypeScript, avec de nouvelles fonctionnalités et une meilleure UX.',
      },
      {
        en: 'A React Native shopping app for iOS and Android.',
        fr: 'Une app de courses React Native pour iOS et Android.',
      },
      {
        en: 'A slot allocation system to make milkman-style delivery rounds efficient.',
        fr: 'Un système d’allocation de créneaux pour optimiser les tournées façon livreur de lait.',
      },
      {
        en: 'The Node and PHP backend on OVH, and the original WordPress and WooCommerce site.',
        fr: "Le backend Node et PHP sur OVH, et le site d'origine WordPress et WooCommerce.",
      },
    ],
    stack: [
      'React',
      'React Native',
      'TypeScript',
      'Node',
      'Express',
      'MongoDB',
      'Firebase',
      'MySQL',
      'Redux',
      'Algolia',
      'Mantine',
      'PHP',
      'WooCommerce',
    ],
    shots: [
      {
        src: '/assets/projects/professionalWork/paprikaWeb.webp',
        alt: 'Cagette & Paprika web shop',
      },
      {
        src: '/assets/projects/professionalWork/CPMobile.webp',
        alt: 'Cagette & Paprika mobile app',
      },
      { src: '/assets/projects/professionalWork/sam.webp', alt: 'Slot allocation system' },
    ],
  },
];
