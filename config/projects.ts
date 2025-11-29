// Project images
import brawlMax from '@assets/projects/fullStackProjects/brawlMax.webp';
import openSource from '@assets/projects/fullStackProjects/openSource.webp';
import portfolio from '@assets/projects/fullStackProjects/portfolio.webp';
import second from '@assets/projects/fullStackProjects/second.webp';
import vikunjaHA from '@assets/projects/fullStackProjects/vikunjaHA.webp';
import cpBackend from '@assets/projects/professionalWork/cpBackend.webp';
import cpMobile from '@assets/projects/professionalWork/CPMobile.webp';
import cpWeb from '@assets/projects/professionalWork/CPWeb.webp';
import paprikaWeb from '@assets/projects/professionalWork/paprikaWeb.webp';
import sam from '@assets/projects/professionalWork/sam.webp';
import zenrideBackend from '@assets/projects/professionalWork/zenrideBackend.webp';
import zenrideFrontend from '@assets/projects/professionalWork/zenrideFrontend.webp';
import type { StaticImageData } from 'next/image';

// Technology images
import algolia from '@assets/technologies/algolia.webp';
import docker from '@assets/technologies/docker.webp';
import electron from '@assets/technologies/electron.webp';
import express from '@assets/technologies/express.webp';
import firebase from '@assets/technologies/firebase.webp';
import framerMotion from '@assets/technologies/framerMotion.webp';
import gcPlatform from '@assets/technologies/gcPlatform.webp';
import homeAssistant from '@assets/technologies/homeAssistant.webp';
import jest from '@assets/technologies/jest.webp';
import javascript from '@assets/technologies/js.webp';
import kubernetes from '@assets/technologies/kubernetes.webp';
import leaflet from '@assets/technologies/leaflet.webp';
import lingui from '@assets/technologies/lingui.webp';
import mantine from '@assets/technologies/mantine.webp';
import mongodb from '@assets/technologies/mongodb.webp';
import mySQL from '@assets/technologies/mySQL.webp';
import nextjs from '@assets/technologies/nextjs.webp';
import node from '@assets/technologies/node.webp';
import ovh from '@assets/technologies/ovh.webp';
import PHP from '@assets/technologies/PHP.webp';
import prisma from '@assets/technologies/prisma.webp';
import puppeteer from '@assets/technologies/puppeteer.webp';
import python from '@assets/technologies/python.webp';
import react from '@assets/technologies/react.webp';
import reactAdmin from '@assets/technologies/reactAdmin.webp';
import reactQuery from '@assets/technologies/reactQuery.webp';
import redis from '@assets/technologies/redis.webp';
import redux from '@assets/technologies/redux.webp';
import rnNavigation from '@assets/technologies/rnNavigation.webp';
import sentry from '@assets/technologies/sentry.webp';
import sequelize from '@assets/technologies/sequelize.webp';
import tailwind from '@assets/technologies/tailwind.webp';
import trpc from '@assets/technologies/trpc.webp';
import typescript from '@assets/technologies/typescript.webp';
import vue from '@assets/technologies/vue.webp';
import wooCommerce from '@assets/technologies/wooCommerce.webp';
import wordPress from '@assets/technologies/Wordpress.webp';
import zustand from '@assets/technologies/zustand.webp';


export type LocalizedString = {
  en: string;
  fr: string;
};

export type TabsKey = 'professional' | 'personal';
export type ProjectStatusCode = 1 | 2 | 3;

export type ProjectImage = {
  image: StaticImageData;
  name: string;
};

export type ProjectTechnology = {
  image: StaticImageData;
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
  cpMobile: { image: cpMobile, name: 'Cagette et Paprika Mobile App' },
  cpWeb: { image: cpWeb, name: 'Cagette et Paprika Web App' },
  cpBackend: { image: cpBackend, name: 'Cagette et Paprika Backend' },
  brawlMax: { image: brawlMax, name: 'Brawl Max Mobile App' },
  sam: { image: sam, name: 'Slot Allocation Management System (SAM)' },
  paprikaWeb: { image: paprikaWeb, name: 'Paprika Web App' },
  zenrideFrontend: { image: zenrideFrontend, name: 'Zenride Frontend' },
  zenrideBackend: { image: zenrideBackend, name: 'Zenride Backend' },
  vikunjaHA: { image: vikunjaHA, name: 'Vikunja Home Assistant Integration' },
  openSource: { image: openSource, name: 'Open Source Contributions' },
  second: { image: second, name: 'Second Marketplace' },
  portfolio: { image: portfolio, name: 'Portfolio Website' },
};

const technologies: Record<string, ProjectTechnology> = {
  express: { image: express, name: 'Express.js' },
  mongodb: { image: mongodb, name: 'MongoDB' },
  node: { image: node, name: 'Node.js' },
  react: { image: react, name: 'React.js' },
  javascript: { image: javascript, name: 'JavaScript' },
  redux: { image: redux, name: 'Redux' },
  mantine: { image: mantine, name: 'Mantine' },
  reactQuery: { image: reactQuery, name: 'React Query' },
  wordPress: { image: wordPress, name: 'WordPress' },
  wooCommerce: { image: wooCommerce, name: 'WooCommerce' },
  typescript: { image: typescript, name: 'TypeScript' },
  rnNavigation: { image: rnNavigation, name: 'React Native Navigation' },
  PHP: { image: PHP, name: 'PHP' },
  gcPlatform: { image: gcPlatform, name: 'Google Cloud Platform' },
  mySQL: { image: mySQL, name: 'MySQL' },
  algolia: { image: algolia, name: 'Algolia' },
  tailwind: { image: tailwind, name: 'Tailwind' },
  firebase: {
    image: firebase,
    name: 'Firebase',
  },
  python: {
    image: python,
    name: 'Python',
  },
  zustand: {
    image: zustand,
    name: 'Zustand',
  },
  sentry: {
    image: sentry,
    name: 'Sentry',
  },
  lingui: {
    image: lingui,
    name: 'LinguiJS',
  },
  leaflet: {
    image: leaflet,
    name: 'Leaflet',
  },
  jest: {
    image: jest,
    name: 'Jest',
  },
  sequelize: {
    image: sequelize,
    name: 'Sequelize',
  },
  redis: {
    image: redis,
    name: 'Redis',
  },
  puppeteer: {
    image: puppeteer,
    name: 'Puppeteer',
  },
  ovh: {
    image: ovh,
    name: 'OVH',
  },  
  reactAdmin: {
    image: reactAdmin,
    name: 'React Admin',
  },
  vue: {
    image: vue,
    name: 'Vue.js',
  },
  electron: {
    image: electron,
    name: 'Electron',
  },
  nextjs: {
    image: nextjs,
    name: 'Next.js',
  },
  prisma: {
    image: prisma,
    name: 'Prisma',
  },
  trpc: {
    image: trpc,
    name: 'tRPC',
  },
  framerMotion: {
    image: framerMotion,
    name: 'Framer Motion',
  },
  homeAssistant: {
    image: homeAssistant,
    name: 'Home Assistant',
  },
  docker: {
    image: docker,
    name: 'Docker',
  },
  kubernetes: {
    image: kubernetes,
    name: 'Kubernetes',
  },
};

//statusCodes Equivilants
//1- Active
//2 - Acquired
//3 - Archived

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
        link:'https://www.zenride.co/'
      },
      {
        title: { en: 'Zenride - Backend', fr: 'Zenride - Backend' },
        status: 'Active',
        statusCode: 1,
        subTitle: {
          en: 'Comprehensive bike fleet management system with contract lifecycle, payments, insurance, and third-party integrations.',
          fr: "Système complet de gestion de flotte vélo (cycle de contrats, paiements, assurances, intégrations tierces).",
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
        title: { en: 'Cagette & Paprika React Native App', fr: 'Application Cagette & Paprika (React Native)' },
        status: 'Acquired by Auchan Retail',
        statusCode: 2,
        subTitle: {
          en: 'Groceries Home delivery App. Available for users from Lille (France), on Android & IOS.',
          fr: "Application de livraison de courses à domicile disponible pour Lille (France), sur Android et iOS.",
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
        title: { en: 'Slot Allocation Management System (SAM)', fr: 'Slot Allocation Management System (SAM)' },
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
          fr: "Intégration open-source Home Assistant (100+ téléchargements, issues résolues et PR fusionnées).",
        },
        image: projects.vikunjaHA,
        technologies: [
          technologies.python,
          technologies.homeAssistant,
        ],
        github: 'https://github.com/NeoHuncho/vikunja-voice-assistant',
        period: '2025'
      },
      {
        title: { en: 'Open Source Contributions', fr: 'Contributions open-source' },
        status: 'Active',
        statusCode: 1,
        subTitle: {
          en: 'Contributed to Vikunja, Affine, and Home Assistant with merged pull requests, gaining full end-to-end contributor experience across three major projects.',
          fr: 'Contributions à Vikunja, AFFiNE et Home Assistant avec PR fusionnées, pour une expérience complète de contributeur.',
        },
        image: projects.openSource,
        technologies: [
          technologies.vue,
          technologies.electron,
          technologies.python,
        ],
        github: [
          'https://github.com/go-vikunja/vikunja',
          'https://github.com/toeverything/AFFiNE',
          'https://github.com/home-assistant/brands'
        ],
        period: '2024 - Present'
        
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
        github: 'https://github.com/NeoHuncho/second'
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
        github: 'https://github.com/NeoHuncho/my-portfolio'
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
        period: '2021 - 2022'
      },
    ],
  },
];
export default myProjectsTabs;
