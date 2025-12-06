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
      fr: 'Je prends en charge tous les aspects de mon travail — du code au déploiement en passant par le support.',
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
      fr: 'Je crée des relations authentiques avec mes collègues—échanges fluides, rires et collaboration.',
    },
  },
  {
    icon: '⚡',
    title: { en: 'Fast & Responsive', fr: 'Rapide & Réactif' },
    description: {
      en: 'I quickly adapt to new contexts and provide fast, clear replies to messages and technical questions.',
      fr: 'Je réponds précisément aux questions complexes, même en cas de changement de contexte rapide.',
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
      en: 'I navigate different cultural contexts with ease, possessing native fluency in both English and French.',
      fr: "Je navigue aisément entre différentes cultures avec une maîtrise native de l'anglais et du français.",
    },
  },
  {
    icon: '🔧',
    title: { en: 'Tech Tinkerer', fr: 'Bidouilleur' },
    description: {
      en: 'I value digital ownership by building and maintaining self-hosted open-source environments.',
      fr: 'Je valorise la propriété numérique en bâtissant des environnements open-source auto-hébergés.',
    },
  },
  {
    icon: '🥗',
    title: { en: 'Health', fr: 'Santé' },
    description: {
      en: 'I optimize performance and long-term well-being through a disciplined approach to nutrition.',
      fr: "J'optimise ma performance et mon bien-être par une approche disciplinée de la nutrition.",
    },
  },
  {
    icon: '😊',
    title: { en: 'Positive Energy', fr: 'Énergie positive' },
    description: {
      en: 'I maintain resilience by rationalizing setbacks to return quickly to optimism.',
      fr: "Je reste résilient en rationalisant les revers pour revenir rapidement à l'optimisme.",
    },
  },
  {
    icon: '🏃',
    title: { en: 'Active Lifestyle', fr: 'Vie active' },
    description: {
      en: 'I thrive on physical discipline, pushing limits through sports like climbing and swimming.',
      fr: "Je m'épanouis dans la discipline physique, repoussant mes limites via l'escalade et la natation.",
    },
  },
  {
    icon: '🎲',
    title: { en: 'Strategist', fr: 'Stratège' },
    description: {
      en: 'I seek complex challenges—like strategic board games—that offer rewarding tactical depth.',
      fr: "J'aime relever des défis et jeux complexes offrant une profondeur tactique gratifiante.",
    },
  },
];
