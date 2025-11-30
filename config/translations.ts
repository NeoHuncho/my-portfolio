export type Locale = 'en' | 'fr';
export type TabsKey = 'professional' | 'personal';
export type StatusCode = 1 | 2 | 3;

export type TranslationStrings = {
  heroSubtitle: string;
  heroScrollLabel: string;
  about: {
    tabs: Record<TabsKey, string>;
    mobileTitle: string;
    mobileSubtitle: string;
  };
  projects: {
    tabs: Record<TabsKey, string>;
    statuses: Record<StatusCode, string>;
  };
  socialShortcut: {
    openLabel: string;
  };
  language: {
    name: string;
    flagEmoji: string;
    toggleLabel: string;
    ariaLabel: string;
  };
};

export const translations: Record<Locale, TranslationStrings> = {
  en: {
    heroSubtitle: 'Full Stack Developer',
    heroScrollLabel: 'Scroll to projects',
    about: {
      tabs: {
        professional: 'Professional',
        personal: 'Personal',
      },
      mobileTitle: 'Beyond the Code',
      mobileSubtitle: 'A few things that make me, me.',
    },
    projects: {
      tabs: {
        professional: 'Professional Work',
        personal: 'Personal Projects',
      },
      statuses: {
        1: 'Active',
        2: 'Acquired by Auchan Retail',
        3: 'Archived',
      },
    },
    socialShortcut: {
      openLabel: 'Show contact links',
    },
    language: {
      name: 'EN',
      flagEmoji: '🇬🇧',
      toggleLabel: 'Switch to French',
      ariaLabel: 'Change language to French',
    },
  },
  fr: {
    heroSubtitle: 'Développeur Full Stack',
    heroScrollLabel: 'Voir les projets',
    about: {
      tabs: {
        professional: 'Professionnel',
        personal: 'Personnel',
      },
      mobileTitle: 'Au-delà du code',
      mobileSubtitle: 'Quelques éléments qui me définissent.',
    },
    projects: {
      tabs: {
        professional: 'Travail professionnel',
        personal: 'Projets personnels',
      },
      statuses: {
        1: 'Actif',
        2: 'Acquis par Auchan Retail',
        3: 'Archivé',
      },
    },
    socialShortcut: {
      openLabel: 'Afficher les liens de contact',
    },
    language: {
      name: 'FR',
      flagEmoji: '🇫🇷',
      toggleLabel: 'Passer en anglais',
      ariaLabel: 'Changer la langue en anglais',
    },
  },
};
