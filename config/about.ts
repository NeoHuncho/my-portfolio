type LocalizedString = {
  en: string;
  fr: string;
};

export const aboutTabs = [
  {
    label: 'Professional',
    id: 'professional',
  },
  {
    label: 'Personal',
    id: 'personal',
  },
];

export type AboutPoint = {
  icon: string;
  title: LocalizedString;
  description: LocalizedString;
};

export const professionalPoints: AboutPoint[] = [
  {
    icon: '🎯',
    title: { en: 'Full Ownership', fr: 'Responsabilité totale' },
    description: {
      en: 'I take ownership of all aspects of my work—from code to deployment to support.',
      fr: "Je prends en charge tous les aspects de mon travail — du code au déploiement en passant par le support.",
    },
  },
  {
    icon: '🤖',
    title: { en: 'AI-Enhanced', fr: 'IA augmentée' },
    description: {
          en: 'I leverage AI and automation to streamline workflows and boost productivity.',
          fr: "J'exploite l'IA et l'automatisation pour rationaliser les flux de travail et booster la productivité.",
    },
  },
  {
    icon: '🚀',
    title: { en: 'Challenge-Driven', fr: 'Motivé par les défis' },
    description: {
      en: 'I embrace any technical challenge, even without prior experience in that area.',
      fr: "J'accueille chaque défi technique, même sans expérience préalable.",
    },
  },
  {
    icon: '🤝',
    title: { en: 'Team Player', fr: "Esprit d'équipe" },
    description: {
          en: 'I build genuine relationships with colleagues—fluid conversations, shared laughs, and collaboration.',
          fr: "Je crée des relations authentiques avec mes collègues—échanges fluides, rires partagés et collaboration.",
    },
  },
  {
    icon: '⚡',
    title: { en: 'Fast & Responsive', fr: 'Rapide & Réactif' },
    description: {
      en: 'Quick context switching. Fast replies to DMs and technical questions.',
      fr: 'Je réponds avec précision aux questions complexes, même en cas de changement de contexte rapide.',
    },
  },
  {
    icon: '🤝',
    title: { en: 'Committed', fr: 'Engagé' },
    description: {
      en: 'I build solid foundations and see projects through to the end before moving on.',
      fr: "Je construis des fondations solides et mène les projets jusqu'au bout avant de passer au suivant.",
    },
  },
];

export const personalPoints: AboutPoint[] = [
  {
    icon: '🌍',
    title: { en: 'Bilingual', fr: 'Bilingue' },
    description: {
          en: 'Native fluency in English & French.',
          fr: 'Maîtrise native de l’anglais et du français.',
    },
  },
  {
    icon: '🔧',
    title: { en: 'Tinkerer', fr: 'Bidouilleur' },
    description: {
          en: 'Self-hosting, HomeLabs, and Open Source enthusiast.',
          fr: "Passionné d'auto-hébergement, de HomeLabs et d'Open Source.",
    },
  },
  {
    icon: '🎲',
    title: { en: 'Strategist', fr: 'Stratège' },
    description: {
      en: 'Complex board games and collaborative strategy.',
      fr: "J'aime les jeux de société complexes et la stratégie collaborative.",
    },
  },
  {
    icon: '🥗',
    title: { en: 'Health-Conscious', fr: 'Souci de santé' },
    description: {
          en: 'Invested in nutrition and overall well-being.',
          fr: "Investi dans la nutrition et le bien-être global.",
    },
  },
  {
    icon: '😊',
    title: { en: 'Positive Energy', fr: 'Énergie positive' },
    description: {
      en: 'I embrace life with a smile and optimism.',
      fr: 'Je vis avec le sourire et l’optimisme.',
    },
  },
  {
    icon: '🏃',
    title: { en: 'Active Lifestyle', fr: 'Mode de vie actif' },
    description: {
      en: 'From climbing to swimming—I thrive on physical challenges and diverse sports.',
      fr: "De l'escalade à la natation, je m'épanouis dans les défis physiques et les sports variés.",
    },
  },
];
