// Use string paths instead of static imports for lazy loading
// Images will be loaded by Next.js Image component on-demand

export type LocalizedString = {
  en: string;
  fr: string;
};

export type TabsKey = 'professional' | 'personal';
export type ProjectStatusCode = 1 | 2 | 3;

export type ProjectImage = {
  image: string;
  name: string;
};

export type ProjectTechnology = {
  image: string;
  name: string;
};

export type ProjectCardItem = {
  link?: string;
  image: ProjectImage;
  title: LocalizedString;
  github?: string | string[];
  subTitle: LocalizedString;
  technologies: ProjectTechnology[];
  statusCode: ProjectStatusCode;
  status: string;
  period?: string;
};

export type ProjectTabConfig = {
  id: TabsKey;
  label: string;
  items: ProjectCardItem[];
};

const projects: Record<string, ProjectImage> = {
  cpMobile: {
    image: '/assets/projects/professionalWork/CPMobile.webp',
    name: 'Cagette et Paprika Mobile App',
  },
  cpWeb: {
    image: '/assets/projects/professionalWork/CPWeb.webp',
    name: 'Cagette et Paprika Web App',
  },
  cpBackend: {
    image: '/assets/projects/professionalWork/cpBackend.webp',
    name: 'Cagette et Paprika Backend',
  },
  brawlMax: {
    image: '/assets/projects/fullStackProjects/brawlMax.webp',
    name: 'Brawl Max Mobile App',
  },
  sam: {
    image: '/assets/projects/professionalWork/sam.webp',
    name: 'Slot Allocation Management System',
  },
  paprikaWeb: {
    image: '/assets/projects/professionalWork/paprikaWeb.webp',
    name: 'Paprika Web App',
  },
  zenrideFrontend: {
    image: '/assets/projects/professionalWork/zenrideFrontend.webp',
    name: 'Zenride Frontend',
  },
  zenrideBackend: {
    image: '/assets/projects/professionalWork/zenrideBackend.webp',
    name: 'Zenride Backend',
  },
  vikunjaHA: {
    image: '/assets/projects/fullStackProjects/vikunjaHA.webp',
    name: 'Vikunja Home Assistant Integration',
  },
  openSource: {
    image: '/assets/projects/fullStackProjects/openSource.webp',
    name: 'Open Source Contributions',
  },
  second: { image: '/assets/projects/fullStackProjects/second.webp', name: 'Second Marketplace' },
  portfolio: {
    image: '/assets/projects/fullStackProjects/portfolio.webp',
    name: 'Portfolio Website',
  },
};

const technologies: Record<string, ProjectTechnology> = {
  express: { image: '/assets/technologies/express.webp', name: 'Express.js' },
  mongodb: { image: '/assets/technologies/mongodb.webp', name: 'MongoDB' },
  node: { image: '/assets/technologies/node.webp', name: 'Node.js' },
  react: { image: '/assets/technologies/react.webp', name: 'React.js' },
  javascript: { image: '/assets/technologies/js.webp', name: 'JavaScript' },
  redux: { image: '/assets/technologies/redux.webp', name: 'Redux' },
  mantine: { image: '/assets/technologies/mantine.webp', name: 'Mantine' },
  reactQuery: { image: '/assets/technologies/reactQuery.webp', name: 'React Query' },
  wordPress: { image: '/assets/technologies/Wordpress.webp', name: 'WordPress' },
  wooCommerce: { image: '/assets/technologies/wooCommerce.webp', name: 'WooCommerce' },
  typescript: { image: '/assets/technologies/typescript.webp', name: 'TypeScript' },
  rnNavigation: {
    image: '/assets/technologies/rnNavigation.webp',
    name: 'React Native Navigation',
  },
  PHP: { image: '/assets/technologies/PHP.webp', name: 'PHP' },
  gcPlatform: { image: '/assets/technologies/gcPlatform.webp', name: 'Google Cloud Platform' },
  mySQL: { image: '/assets/technologies/mySQL.webp', name: 'MySQL' },
  algolia: { image: '/assets/technologies/algolia.webp', name: 'Algolia' },
  tailwind: { image: '/assets/technologies/tailwind.webp', name: 'Tailwind' },
  firebase: {
    image: '/assets/technologies/firebase.webp',
    name: 'Firebase',
  },
  python: {
    image: '/assets/technologies/python.webp',
    name: 'Python',
  },
  zustand: {
    image: '/assets/technologies/zustand.webp',
    name: 'Zustand',
  },
  sentry: {
    image: '/assets/technologies/sentry.webp',
    name: 'Sentry',
  },
  lingui: {
    image: '/assets/technologies/lingui.webp',
    name: 'LinguiJS',
  },
  leaflet: {
    image: '/assets/technologies/leaflet.webp',
    name: 'Leaflet',
  },
  jest: {
    image: '/assets/technologies/jest.webp',
    name: 'Jest',
  },
  sequelize: {
    image: '/assets/technologies/sequelize.webp',
    name: 'Sequelize',
  },
  redis: {
    image: '/assets/technologies/redis.webp',
    name: 'Redis',
  },
  puppeteer: {
    image: '/assets/technologies/puppeteer.webp',
    name: 'Puppeteer',
  },
  ovh: {
    image: '/assets/technologies/ovh.webp',
    name: 'OVH',
  },
  reactAdmin: {
    image: '/assets/technologies/reactAdmin.webp',
    name: 'React Admin',
  },
  vue: {
    image: '/assets/technologies/vue.webp',
    name: 'Vue.js',
  },
  electron: {
    image: '/assets/technologies/electron.webp',
    name: 'Electron',
  },
  nextjs: {
    image: '/assets/technologies/nextjs.webp',
    name: 'Next.js',
  },
  prisma: {
    image: '/assets/technologies/prisma.webp',
    name: 'Prisma',
  },
  trpc: {
    image: '/assets/technologies/trpc.webp',
    name: 'tRPC',
  },
  framerMotion: {
    image: '/assets/technologies/framerMotion.webp',
    name: 'Framer Motion',
  },
  homeAssistant: {
    image: '/assets/technologies/homeAssistant.webp',
    name: 'Home Assistant',
  },
  docker: {
    image: '/assets/technologies/docker.webp',
    name: 'Docker',
  },
  kubernetes: {
    image: '/assets/technologies/kubernetes.webp',
    name: 'Kubernetes',
  },
};

// statusCodes Equivilants
// 1- Active
// 2 - Acquired
// 3 - Archived

const myProjectsTabs: ProjectTabConfig[] = [
  {
    id: 'professional',
    label: 'Professional Work',
    items: [
      {
        title: { en: 'Zenride - Frontend', fr: 'Zenride - Frontend' },
        status: 'Active',
        statusCode: 1,
        subTitle: {
          en: 'Multi-portal web app for employee bike leasing, retailer checkout, contract management, and fleet dashboards.',
          fr: 'Application multi-portails pour leasing de vélos salariés, caisse magasins, gestion de contrats et tableaux de bord de flotte.',
        },
        image: projects.zenrideFrontend,
        technologies: [
          technologies.react,
          technologies.reactQuery,
          technologies.reactAdmin,
          technologies.zustand,
          technologies.lingui,
          technologies.leaflet,
          technologies.sentry,
          technologies.jest,
        ],
        period: '2023 - Present',
        link: 'https://www.zenride.co/',
      },
      {
        title: { en: 'Zenride - Backend', fr: 'Zenride - Backend' },
        status: 'Active',
        statusCode: 1,
        subTitle: {
          en: 'Comprehensive bike fleet management system with contract lifecycle, payments, insurance, and third-party integrations.',
          fr: 'Système complet de gestion de flotte vélo (cycle de contrats, paiements, assurances, intégrations tierces).',
        },
        image: projects.zenrideBackend,
        technologies: [
          technologies.node,
          technologies.express,
          technologies.mySQL,
          technologies.sequelize,
          technologies.docker,
          technologies.kubernetes,
          technologies.ovh,
          technologies.puppeteer,
          technologies.sentry,
          technologies.jest,
        ],
        period: '2023 - Present',
      },
      {
        title: { en: 'Cagette & Paprika Website', fr: 'Site Cagette & Paprika' },
        status: 'Acquired by Auchan Retail',
        statusCode: 2,
        subTitle: {
          en: 'Ported PHP frontend to React TS. Added new features and improved UX.',
          fr: 'Migration du frontend PHP vers React TS avec ajout de fonctionnalités et optimisation de l’UX.',
        },
        image: projects.paprikaWeb,
        technologies: [
          technologies.typescript,
          technologies.react,
          technologies.redux,

          technologies.mantine,
        ],
        period: '2021 - 2023',
      },
      {
        title: {
          en: 'Cagette & Paprika React Native App',
          fr: 'Application Cagette & Paprika (React Native)',
        },
        status: 'Acquired by Auchan Retail',
        statusCode: 2,
        subTitle: {
          en: 'Groceries Home delivery App. Available for users from Lille (France), on Android & IOS.',
          fr: 'Application de livraison de courses à domicile disponible pour Lille (France), sur Android et iOS.',
        },
        image: projects.cpMobile,
        technologies: [
          technologies.typescript,
          technologies.react,
          technologies.redux,
          technologies.rnNavigation,
          technologies.firebase,
        ],
        period: '2021 - 2023',
      },
      {
        title: { en: 'Cagette et Paprika Backend', fr: 'Backend Cagette et Paprika' },
        status: 'Acquired by Auchan Retail',
        statusCode: 2,
        subTitle: {
          en: 'Backend hosted on OVH server. Powered by Node and PHP.',
          fr: 'Backend hébergé sur OVH, propulsé par Node et PHP.',
        },
        image: projects.cpBackend,
        technologies: [
          technologies.node,
          technologies.express,
          technologies.mySQL,
          technologies.algolia,
          technologies.PHP,
          technologies.wooCommerce,
        ],
        period: '2021 - 2023',
      },
      {
        title: {
          en: 'Slot Allocation Management System',
          fr: 'Slot Allocation Management System',
        },
        status: 'Acquired by Auchan Retail',
        statusCode: 2,
        subTitle: {
          en: 'A web application to manage the allocation of slots to maximize the efficiency of milkman style delivery.',
          fr: "Application web pour gérer l'allocation des créneaux afin d'optimiser l'efficacité des livraisons à la manière des livreurs-laitiers.",
        },
        image: projects.sam,
        technologies: [
          technologies.typescript,
          technologies.react,
          technologies.reactQuery,
          technologies.node,
          technologies.express,
          technologies.mongodb,
        ],
        period: '2021 - 2023',
      },
      {
        title: { en: 'Cagette & Paprika website (legacy)', fr: 'Site Cagette & Paprika (legacy)' },
        status: 'Archived',
        statusCode: 3,
        subTitle: {
          en: 'Wordpress frontend with WooCommerce(PHP).',
          fr: 'Frontend Wordpress avec WooCommerce (PHP).',
        },
        image: projects.cpWeb,
        technologies: [technologies.wordPress, technologies.PHP, technologies.wooCommerce],
        period: '2021 - 2022',
      },
    ],
  },
  {
    id: 'personal',
    label: 'Personal Projects',
    items: [
      {
        title: { en: 'Vikunja AI Integration', fr: 'Intégration Vikunja AI' },
        status: 'Active',
        statusCode: 1,
        subTitle: {
          en: 'A open-source Home Assistant integration with 100+ downloads, multiple resolved issues, and merged pull requests from contributors.',
          fr: 'Intégration open-source Home Assistant (100+ téléchargements, issues résolues et PR mergés).',
        },
        image: projects.vikunjaHA,
        technologies: [technologies.python, technologies.homeAssistant],
        github: 'https://github.com/NeoHuncho/vikunja-voice-assistant',
        period: '2025',
      },
      {
        title: { en: 'Open Source Contributions', fr: 'Contributions open-source' },
        status: 'Active',
        statusCode: 1,
        subTitle: {
          en: "Contributed to Vikunja, Affine, and Home Assistant with merged PR's, gaining full end-to-end contributor experience across three major projects.",
          fr: 'Contributions à Vikunja, AFFiNE et Home Assistant avec PR mergés, pour une expérience complète de contributeur.',
        },
        image: projects.openSource,
        technologies: [technologies.vue, technologies.electron, technologies.python],
        github: [
          'https://github.com/go-vikunja/vikunja',
          'https://github.com/toeverything/AFFiNE',
          'https://github.com/home-assistant/brands',
        ],
        period: '2024 - Present',
      },
      {
        title: { en: 'Second — Marketplace  Platform', fr: 'Second — Plateforme Marketplace' },
        status: 'Archived',
        statusCode: 3,
        subTitle: {
          en: 'A fully-fledged platform aggregating listings from multiple second-hand marketplaces. Built as a complete product, though never publicly released.',
          fr: 'Plateforme complète qui agrége des annonces de plusieurs marchés de seconde main, conçue comme un produit final malgré une non-publication.',
        },
        image: projects.second,
        technologies: [
          technologies.typescript,
          technologies.nextjs,
          technologies.react,
          technologies.prisma,
          technologies.tailwind,
          technologies.trpc,
        ],
        period: '2023',
        link: 'https://second-five.vercel.app/',
        github: 'https://github.com/NeoHuncho/second',
      },
      {
        title: { en: 'Portfolio Website', fr: 'Site portfolio' },
        status: 'Active',
        statusCode: 1,
        subTitle: {
          en: 'A component-reusable, high-performance portfolio with lightning-fast load speeds, built with modern web technologies.',
          fr: 'Portfolio performant, modulaire et ultra rapide construit avec les dernières technologies web.',
        },
        image: projects.portfolio,
        technologies: [
          technologies.typescript,
          technologies.nextjs,
          technologies.react,
          technologies.tailwind,
          technologies.framerMotion,
        ],
        period: '2023 - Present',
        github: 'https://github.com/NeoHuncho/my-portfolio',
      },
      {
        title: { en: 'Brawl Max', fr: 'Brawl Max' },
        status: 'Archived',
        statusCode: 3,
        subTitle: {
          en: 'React Native game-companion app, with multiple functionalities to help players improve. Available on Android & IOS.',
          fr: 'Application compagnon React Native avec fonctionnalités pour aider les joueurs à progresser. Disponible sur Android et iOS.',
        },
        image: projects.brawlMax,
        technologies: [
          technologies.javascript,
          technologies.react,
          technologies.redux,
          technologies.python,
          technologies.node,
          technologies.gcPlatform,
          technologies.firebase,
        ],
        period: '2021 - 2022',
      },
    ],
  },
];
export default myProjectsTabs;
