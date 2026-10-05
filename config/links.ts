import { type Locale } from './translations';

export const links = {
  github: 'https://github.com/NeoHuncho',
  linkedin: 'https://www.linkedin.com/in/william-g-178156180/',
  email: 'mailto:william.guinaudie@gmail.com',
  /** Built by `node cv/build.mjs`. */
  cv: {
    en: '/cv/CV_EN_William_Guinaudie.pdf',
    fr: '/cv/CV_FR_William_Guinaudie.pdf',
  } satisfies Record<Locale, string>,
} as const;

export const sectionIds = {
  playground: 'playground',
  board: 'how-i-work',
  experience: 'experience',
  sideProjects: 'side-projects',
} as const;
