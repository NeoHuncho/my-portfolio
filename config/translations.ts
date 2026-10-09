export type Locale = 'en' | 'fr';

type ObjectInfo = { title: string; body: string };

/** How I work, the hero's three pieces, from day to night. */
type TrioId = 'ticket' | 'agents' | 'night';
/** The rest of me, added to the desk from its tray; phones show all but the last two. */
type ExtraId = 'portrait' | 'flags' | 'mountain' | 'sport' | 'robot' | 'keys' | 'server' | 'oss';
type ShelfId = Exclude<ExtraId, 'portrait' | 'keys'>;

export type TranslationStrings = {
  nav: {
    playground: string;
    board: string;
    experience: string;
    sideProjects: string;
    menu: string;
    close: string;
    cv: string;
    versions: string;
    versionsTitle: string;
    current: string;
  };
  hero: {
    eyebrow: string;
    role: string;
    tagline: string;
    /** Follows the tagline from `sm` up; phones show the first sentence only. */
    taglineMore: string;
    primaryCta: string;
    secondaryCta: string;
    shipped: (code: string) => string;
    closeInfo: string;
    /** The robot's callout: start and stop it driving after the pointer. */
    robotFollow: string;
    robotStop: string;
    /** The night shift's callout: a link down to the "How I work" board. */
    nightShiftLink: string;
    /** Phones: the desk follows the phone's tilt once switched on. */
    tiltOff: string;
    tiltOn: string;
    /** Phones: step through the desk's stories from the docked card. */
    previous: string;
    next: string;
    /** How I work: the three pieces the desk opens on, labelled, and the phone's turntable. */
    trio: {
      /** Names the three together, for screen readers. */
      label: string;
      steps: Record<TrioId, string>;
      /** What each comes down to, on its label. */
      headline: Record<TrioId, string>;
      /** Phones: short stories, in place of the desk's longer ones. */
      caption: Record<TrioId, string>;
      /** The turntable's hint, and its label for screen readers. */
      turnHint: string;
    };
    /** The rest of me: the desk's tray of things to add, the phone's shelf. */
    more: {
      title: string;
      addAll: string;
      /** Takes everything added back off the desk. */
      tidy: string;
      /** Each piece's name and one line, on its chip. */
      items: Record<ExtraId, ObjectInfo>;
      /** Phones: short stories, under the shelf. */
      caption: Record<ShelfId, string>;
    };
    objects: Record<
      | 'ticket'
      | 'keys'
      | 'agents'
      | 'oss'
      | 'server'
      | 'sport'
      | 'mountain'
      | 'portrait'
      | 'robot'
      | 'night'
      | 'flags',
      ObjectInfo
    >;
  };
  board: {
    eyebrow: string;
    title: string;
    intro: string;
    radar: string;
    filterAll: string;
    toDecide: (count: number) => string;
    columns: { decision: string; review: string; released: string };
    status: {
      building: string;
      prReady: string;
      alreadyImplemented: string;
      merged: string;
    };
    accept: string;
    ask: string;
    reject: string;
    confirm: string;
    reconsider: string;
    details: string;
    openPr: (pr: number) => string;
    showMore: (count: number) => string;
    showLess: string;
    rejected: (count: number) => string;
    closed: (count: number) => string;
    moreReleased: (count: number) => string;
    emptyColumn: string;
    openQuestion: string;
    youAsked: string;
    agentResearching: string;
    agentReplied: string;
    genericReply: string;
    practices: {
      title: string;
      /** `{link}` in a body stands for the next of its links, in order. */
      items: Array<ObjectInfo & { links?: Array<{ label: string; href: string }> }>;
    };
    card: {
      problem: string;
      goal: string;
      today: string;
      change: string;
      fix: string;
      inCode: string;
      effort: string;
      confidence: string;
      migration: string;
      disagree: string;
    };
    modal: {
      cancel: string;
      acceptTitle: (id: string) => string;
      acceptBody: string;
      acceptLabel: string;
      acceptPlaceholder: string;
      acceptConfirm: string;
      acceptQuestion: string;
      askTitle: (id: string) => string;
      askBody: string;
      askLabel: string;
      askSuggested: string;
      askPlaceholder: string;
      askConfirm: string;
      recommended: string;
      other: string;
      otherPlaceholder: string;
      rejectTitle: (id: string) => string;
      rejectBody: string;
      rejectReasons: string[];
      rejectLabel: string;
      rejectPlaceholder: string;
      rejectConfirm: string;
      confirmTitle: (id: string) => string;
      confirmBody: string;
      confirmLabel: string;
      confirmPlaceholder: string;
      confirmConfirm: string;
      reconsiderTitle: (id: string) => string;
      reconsiderBody: string;
      reconsiderLabel: string;
      reconsiderPlaceholder: string;
      reconsiderConfirm: string;
    };
    drawer: {
      close: string;
      whyNow: string;
      evidence: string;
      plan: string;
      updatedPlan: string;
      acceptance: string;
      validation: string;
      watchFor: string;
      roles: string;
      roleAgent: string;
      roleHuman: string;
      roleCi: string;
      pr: string;
      notes: string;
      source: string;
      area: string;
      existingWhy: string;
      existingEvidence: string;
      existingChecked: string;
      existingGap: string;
    };
  };
  experience: {
    eyebrow: string;
    title: string;
    present: string;
    /** Every role so far was full time. */
    fullTime: string;
    built: string;
    ai: string;
    stack: string;
    visit: string;
    confidential: string;
    conceptArt: string;
    seeBoard: string;
    previous: string;
    next: string;
  };
  sideProjects: {
    eyebrow: string;
    title: string;
    intro: string;
    stars: (count: number) => string;
    source: string;
    more: string;
    archived: string;
    liveDemo: string;
    gamesNote: string;
    rotaDesktop: string;
    rotaPhone: string;
    loadingGame: string;
  };
  footer: {
    title: string;
    body: string;
    email: string;
    builtWith: string;
  };
  language: {
    name: string;
    toggleLabel: string;
  };
  palette: {
    title: string;
    trigger: string;
    placeholder: string;
    close: string;
    groups: Record<
      'recent' | 'navigate' | 'actions' | 'experience' | 'sideProjects' | 'links' | 'versions',
      string
    >;
    playground: string;
    cv: string;
    copyEmail: string;
    copied: string;
    emailMe: string;
    switchLanguage: string;
    source: (name: string) => string;
    contribution: string;
    results: (count: number) => string;
    empty: (query: string) => string;
    emptyHint: string;
    keys: { navigate: string; open: string; close: string };
  };
};

export const translations: Record<Locale, TranslationStrings> = {
  en: {
    nav: {
      playground: 'Playground',
      board: 'How I work',
      experience: 'Experience',
      sideProjects: 'Side projects',
      menu: 'Open menu',
      close: 'Close menu',
      cv: 'CV',
      versions: 'Past versions of this site',
      versionsTitle: 'This site over the years',
      current: 'You are here',
    },
    hero: {
      eyebrow: 'William Guinaudie',
      role: 'AI Engineer',
      tagline: 'I build products with AI agents, and the workflows that keep them reliable.',
      taglineMore: 'They take on the legwork. I make the calls and stand behind what ships.',
      primaryCta: 'See my experience',
      secondaryCta: 'Download CV',
      shipped: (code) => `✓ ${code} merged, on my approval`,
      closeInfo: 'Close',
      robotFollow: 'Follow my mouse',
      robotStop: 'Stop following',
      nightShiftLink: 'See how I work',
      tiltOff: 'Tilt to play',
      tiltOn: 'Tilt on',
      previous: 'Previous',
      next: 'Next',
      trio: {
        label: 'How I work with AI agents',
        steps: { ticket: 'Day shift', agents: 'Claude Code + Codex', night: 'Night shift' },
        headline: {
          ticket: 'I make the calls',
          agents: 'Agents do the legwork',
          night: 'Agents explore overnight',
        },
        turnHint: 'Swipe to turn it',
        caption: {
          ticket:
            'By day, I make the architecture decisions with the team. Agents extend my own thinking: we dig through the code together, and I edit their plans until they hold up.',
          agents:
            'I run a modded Claude Code as my main driver, with the Codex CLI wired in to make full use of both subscriptions. Each model takes the work it does best and checks the other’s.',
          night:
            'Overnight, agents triage feedback and errors, and explorers hunt for security issues and performance wins. In the morning, I decide.',
        },
      },
      more: {
        title: 'More about me',
        addAll: 'Add everything',
        tidy: 'Tidy up',
        items: {
          portrait: { title: 'That’s me', body: 'Hi, I’m William' },
          flags: { title: 'EN · FR', body: 'Both native' },
          mountain: { title: 'Switzerland', body: 'Work permit ✓' },
          sport: { title: 'Walk and talk', body: 'Dictating at 4.5 km/h' },
          robot: { title: 'Automation', body: 'At home too' },
          keys: { title: 'Shortcuts', body: 'Press / to search' },
          server: { title: 'Homelab', body: 'Self-hosted' },
          oss: { title: 'Open source', body: 'Use, fix, publish' },
        },
        caption: {
          flags:
            'Dual British and French citizen, native in both languages: I work as well in English as in French.',
          mountain:
            'My favourite place is the mountains, so Switzerland worked out suspiciously well. Swiss work permit: already sorted.',
          sport:
            'I love to move. At my standing desk I walk on a walking pad and dictate a lot of my prompts.',
          robot:
            'I automate where it makes sense, at home too: agent workflows take care of the repetitive bits of my personal life.',
          server:
            'I love hardware. I self-host what I can on my homelab, and everything I build can be self-hosted too.',
          oss: 'I use open source every day, contribute upstream when I can and publish my own projects.',
        },
      },
      objects: {
        ticket: {
          title: 'Day shift',
          body: 'By day, I make the architecture decisions with the team, so the code serves the business. Agents extend my own thinking: we dig through the codebase together, and I edit their plans until they hold up.',
        },
        keys: {
          title: 'Keyboard shortcuts',
          body: 'I would rather press a key than reach for the mouse. Press / to search this site or jump anywhere.',
        },
        agents: {
          title: 'Claude Code and Codex',
          body: 'I run a modded Claude Code as my main driver, with the Codex CLI wired in to make full use of both subscriptions: each model takes the work it does best and checks the other’s.',
        },
        oss: {
          title: 'Open source',
          body: 'I use open source every day, contribute upstream when I can, and publish my own projects.',
        },
        server: {
          title: 'Homelab',
          body: 'I am passionate about hardware in general. I self-host what I can on my homelab, and everything I build can be self-hosted too.',
        },
        sport: {
          title: 'Walk and talk',
          body: 'I love to move, and sport is how I recharge. At my standing desk I walk on a walking pad and dictate a lot of my prompts: I talk as much as I type.',
        },
        mountain: {
          title: 'Switzerland',
          body: 'For someone whose favourite place is the mountains, ending up in Switzerland worked out suspiciously well. Swiss work permit: already sorted.',
        },
        portrait: {
          title: 'That’s me',
          body: 'Hi, I’m William. I have been building products for six years, and AI agents are now at the heart of how I work.',
        },
        robot: {
          title: 'Automation, at home too',
          body: 'I automate where it makes sense, and not only at work: automations and AI agent workflows take care of repetitive things in my personal life too.',
        },
        night: {
          title: 'Night shift',
          body: 'Overnight, scheduled agents triage feedback and errors, and explorers hunt for security issues and performance wins. In the morning, I decide what gets built.',
        },
        flags: {
          title: 'British and French',
          body: 'I am a dual British and French citizen, and both languages are native to me: I work just as well in English as in French.',
        },
      },
    },
    board: {
      eyebrow: '03 · How I work',
      title: 'Agents do the legwork. I make the calls.',
      intro:
        'Scheduled agent runs turn feedback, errors and the codebase into tickets with a plan. I make the decisions and own every change that ships, even the ones too big to read line by line. Try it.',
      radar: 'Daily radar',
      filterAll: 'All',
      toDecide: (count) => `${count} to decide`,
      columns: {
        decision: 'Needs your decision',
        review: 'Your review',
        released: 'Released',
      },
      status: {
        building: 'Agent implementing',
        prReady: 'PR ready for your review',
        alreadyImplemented: 'The agent found it already built',
        merged: 'Merged',
      },
      accept: 'Accept',
      ask: 'Ask a question',
      reject: 'Reject',
      confirm: 'Confirm',
      reconsider: 'Reconsider',
      details: 'Details',
      openPr: (pr) => `Review PR #${pr} on GitHub`,
      showMore: (count) => `Show ${count} more ticket${count === 1 ? '' : 's'}`,
      showLess: 'Show fewer tickets',
      rejected: (count) => `${count} rejected`,
      closed: (count) => `${count} closed as already built`,
      moreReleased: (count) => `+${count} more released`,
      emptyColumn: 'Nothing here right now',
      openQuestion: 'Open question: you answer it when you accept',
      youAsked: 'You asked',
      agentResearching: 'The agent is looking into it…',
      agentReplied: 'The agent replied',
      genericReply:
        'Noted: the agent looks into it on its next run and replies here. The ticket waits for your decision.',
      practices: {
        title: 'What makes unattended agent runs worth trusting',
        items: [
          {
            title: 'Ownership',
            body: '{link} makes me reason through each plan before it is built, Geoffrey Litt’s {link} quizzes me on what was built. A pull request can be too big to read line by line, never too big to understand.',
            links: [
              { label: 'VibeWise', href: 'https://github.com/nykooi1/vibe-wise' },
              {
                label: 'explain-diff',
                href: 'https://gist.github.com/geoffreylitt/a29df1b5f9865506e8952488eac3d524',
              },
            ],
          },
          {
            title: 'Evaluation',
            body: 'My accepts, rejections and review comments go back into the agent instructions and the repo memory, so the next run repeats fewer mistakes.',
          },
          {
            title: 'Scoring',
            body: 'Every plan comes with effort, confidence and evidence. When the agent is unsure about a plan, it asks a question before anything is built.',
          },
          {
            title: 'Observability',
            body: 'Every agent run is traced: steps, tool calls, cost and time. A wrong result can be followed back to the step that caused it, and Matt Pocock’s {link} takes me back through past runs to find what to improve.',
            links: [
              {
                label: 'retro skill',
                href: 'https://github.com/mattpocock/skills/tree/main/skills/engineering/retro',
              },
            ],
          },
        ],
      },
      card: {
        problem: 'Problem',
        goal: 'Goal',
        today: 'Today',
        change: 'Change',
        fix: 'Fix',
        inCode: 'In the code',
        effort: 'Effort',
        confidence: 'Confidence',
        migration: 'Migration',
        disagree: 'What disagrees',
      },
      modal: {
        cancel: 'Cancel',
        acceptTitle: (id) => `Accept ${id}`,
        acceptBody:
          'Your answer to the agent’s question goes into the plan. The agent then implements it and opens a pull request; nothing ships before you review it.',
        acceptLabel: 'Note for the agent (optional)',
        acceptPlaceholder: 'e.g. keep it behind a feature flag',
        acceptConfirm: 'Accept',
        acceptQuestion: 'The agent asks',
        askTitle: (id) => `Ask the agent about ${id}`,
        askBody:
          'Not sure yet? The planning agent looks into your question and replies on the ticket. The decision stays with you.',
        askLabel: 'Your question',
        askSuggested: 'Suggested',
        askPlaceholder: 'e.g. what happens to routes already started?',
        askConfirm: 'Send',
        recommended: 'Recommended',
        other: 'Other',
        otherPlaceholder: 'Your own answer',
        rejectTitle: (id) => `Reject ${id}`,
        rejectBody:
          'The agent learns from your reason and will not propose this again unless something changes.',
        rejectReasons: ['Not worth it now', 'Out of scope', 'Already planned', 'The plan is wrong'],
        rejectLabel: 'Why? (optional)',
        rejectPlaceholder: 'Tell the agent what it missed',
        rejectConfirm: 'Reject',
        confirmTitle: (id) => `Close ${id} as already built`,
        confirmBody:
          'The existing work covers the ticket, so it closes as done and nothing new gets built.',
        confirmLabel: 'Note (optional)',
        confirmPlaceholder: 'e.g. make the field easier to find later',
        confirmConfirm: 'Confirm and close',
        reconsiderTitle: (id) => `Reconsider ${id}`,
        reconsiderBody: 'The ticket goes back to the agent to implement, with your reason.',
        reconsiderLabel: 'What does the existing work miss?',
        reconsiderPlaceholder: 'e.g. customers must see the field without opening “More options”',
        reconsiderConfirm: 'Send back',
      },
      drawer: {
        close: 'Close ticket',
        whyNow: 'Why now',
        evidence: 'Evidence from the codebase',
        plan: 'Plan',
        updatedPlan: 'Updated after your answer',
        acceptance: 'Acceptance criteria',
        validation: 'How we check it',
        watchFor: 'What to watch for',
        roles: 'Who does what',
        roleAgent: 'Agents: research, plan, implement',
        roleHuman: 'Me: decide, own the change, ship',
        roleCi: 'CI: lint, types, tests on every PR',
        pr: 'Pull request',
        notes: 'Your notes',
        source: 'Source',
        area: 'Area',
        existingWhy: 'Why no new implementation is needed',
        existingEvidence: 'Evidence',
        existingChecked: 'How it was checked',
        existingGap: 'What could still be missing',
      },
    },
    experience: {
      eyebrow: '02 · Experience',
      title: 'Six years of shipping products, front to back.',
      present: 'Now',
      fullTime: 'Full time',
      built: 'What I built',
      ai: 'How I used AI',
      stack: 'Stack',
      visit: 'Visit',
      confidential: 'Client work is confidential: illustrations only.',
      conceptArt: 'Concept art of the financial-planning app',
      seeBoard: 'See how it works',
      previous: 'Previous screen',
      next: 'Next screen',
    },
    sideProjects: {
      eyebrow: '04 · Side projects',
      title: 'Things I built. Open source.',
      intro: 'Built for my own use, not as side businesses.',
      stars: (count) => `${count}+ stars`,
      source: 'Source code',
      more: 'More projects',
      archived: 'Archived',
      liveDemo: 'Live demo',
      gamesNote:
        'The real game against bots, one match on both screens. Play on either; “All games” opens the others.',
      rotaDesktop: 'Rota · desktop',
      rotaPhone: 'Rota · phone',
      loadingGame: 'Setting up the table…',
    },
    footer: {
      title: 'Want agents that actually ship in your codebase?',
      body: 'I am happy to talk about AI engineering, developer workflows, or your next product.',
      email: 'Email me',
      builtWith: 'Built with Next.js, React Three Fiber and Rapier.',
    },
    language: {
      name: 'EN',
      toggleLabel: 'Passer en français',
    },
    palette: {
      title: 'Search this site',
      trigger: 'Search',
      placeholder: 'Search or jump to…',
      close: 'Close',
      groups: {
        recent: 'Recent',
        navigate: 'Navigate',
        actions: 'Actions',
        experience: 'Experience',
        sideProjects: 'Side projects',
        links: 'Links',
        versions: 'Past versions of this site',
      },
      playground: 'The desk at the top of the page',
      cv: 'Download CV',
      copyEmail: 'Copy email address',
      copied: 'Copied',
      emailMe: 'Email me',
      switchLanguage: 'Switch to French',
      source: (name) => `${name} source code`,
      contribution: 'Open source contribution',
      results: (count) => (count === 1 ? '1 result' : `${count} results`),
      empty: (query) => `No results for “${query}”`,
      emptyHint: 'Try “CV”, “GitHub” or “Pomi”.',
      keys: { navigate: 'navigate', open: 'open', close: 'close' },
    },
  },
  fr: {
    nav: {
      playground: 'Playground',
      board: 'Ma méthode',
      experience: 'Expérience',
      sideProjects: 'Projets perso',
      menu: 'Ouvrir le menu',
      close: 'Fermer le menu',
      cv: 'CV',
      versions: 'Anciennes versions du site',
      versionsTitle: 'Ce site au fil des ans',
      current: 'Tu es ici',
    },
    hero: {
      eyebrow: 'William Guinaudie',
      role: 'AI Engineer',
      tagline:
        'Je construis des produits avec des agents IA, et les workflows qui les rendent fiables.',
      taglineMore:
        'Ils abattent le gros du travail. Moi, je tranche et j’assume ce qui part en production.',
      primaryCta: 'Voir mon expérience',
      secondaryCta: 'Télécharger le CV',
      shipped: (code) => `✓ ${code} mergé, sur mon feu vert`,
      closeInfo: 'Fermer',
      robotFollow: 'Suivre ma souris',
      robotStop: 'Arrêter de suivre',
      nightShiftLink: 'Voir ma méthode',
      tiltOff: 'Incliner pour jouer',
      tiltOn: 'Inclinaison active',
      previous: 'Précédent',
      next: 'Suivant',
      trio: {
        label: 'Comment je travaille avec les agents IA',
        steps: { ticket: 'Équipe de jour', agents: 'Claude Code + Codex', night: 'Équipe de nuit' },
        turnHint: 'Fais-le tourner',
        headline: {
          ticket: 'Je prends les décisions',
          agents: 'Les agents font le gros du travail',
          night: 'La nuit, les agents explorent',
        },
        caption: {
          ticket:
            'Le jour, je prends les décisions d’architecture avec l’équipe. Les agents prolongent ma propre réflexion : on explore le code ensemble, et je retravaille leurs plans jusqu’à ce qu’ils tiennent la route.',
          agents:
            'J’utilise une version moddée de Claude Code comme outil principal, avec la CLI Codex intégrée pour exploiter pleinement mes deux abonnements. Chaque modèle prend ce qu’il fait le mieux et vérifie le travail de l’autre.',
          night:
            'La nuit, des agents trient retours et erreurs, et des explorateurs traquent failles de sécurité et gains de performance. Le matin, je décide.',
        },
      },
      more: {
        title: 'Plus sur moi',
        addAll: 'Tout ajouter',
        tidy: 'Ranger',
        items: {
          portrait: { title: 'C’est moi', body: 'Salut, moi c’est William' },
          flags: { title: 'EN · FR', body: 'Deux langues maternelles' },
          mountain: { title: 'Suisse', body: 'Permis de travail ✓' },
          sport: { title: 'Marcher et parler', body: 'Je dicte à 4,5 km/h' },
          robot: { title: 'Automatisation', body: 'À la maison aussi' },
          keys: { title: 'Raccourcis', body: 'Appuie sur / pour chercher' },
          server: { title: 'Homelab', body: 'Auto-hébergé' },
          oss: { title: 'Open source', body: 'Utiliser, corriger, publier' },
        },
        caption: {
          flags:
            'Double nationalité britannique et française, deux langues maternelles : je travaille aussi bien en anglais qu’en français.',
          mountain:
            'Quand on préfère la montagne à tout, finir en Suisse tombe étrangement bien. Permis de travail suisse : déjà en poche.',
          sport:
            'J’adore bouger. À mon bureau debout, je marche sur un tapis et je dicte une bonne partie de mes prompts.',
          robot:
            'J’automatise là où ça a du sens, à la maison aussi : des workflows d’agents s’occupent des tâches répétitives de ma vie perso.',
          server:
            'Passionné de hardware, j’auto-héberge ce que je peux sur mon homelab, et tout ce que je construis peut l’être aussi.',
          oss: 'J’utilise l’open source tous les jours, je contribue quand je peux et je publie mes propres projets.',
        },
      },
      objects: {
        ticket: {
          title: 'L’équipe de jour',
          body: 'Le jour, je prends les décisions d’architecture avec l’équipe, pour que le code serve le métier. Les agents prolongent ma propre réflexion : on explore la codebase ensemble, et je retravaille leurs plans jusqu’à ce qu’ils tiennent la route.',
        },
        keys: {
          title: 'Raccourcis clavier',
          body: 'Je préfère une touche à la souris. Appuie sur / pour chercher sur le site ou aller n’importe où.',
        },
        agents: {
          title: 'Claude Code et Codex',
          body: 'J’utilise une version moddée de Claude Code comme outil principal, avec la CLI Codex intégrée pour exploiter pleinement mes deux abonnements : chaque modèle prend ce qu’il fait le mieux et vérifie le travail de l’autre.',
        },
        oss: {
          title: 'Open source',
          body: 'J’utilise l’open source tous les jours, je contribue quand je peux et je publie mes propres projets.',
        },
        server: {
          title: 'Homelab',
          body: 'Je suis passionné par le hardware en général. J’auto-héberge ce que je peux sur mon homelab, et tout ce que je construis peut l’être aussi.',
        },
        sport: {
          title: 'Marcher et parler',
          body: 'J’adore bouger, et le sport me ressource. À mon bureau debout, je marche sur un tapis de marche et je dicte une bonne partie de mes prompts : je parle autant que je tape.',
        },
        mountain: {
          title: 'La Suisse',
          body: 'Quand on préfère la montagne à tout le reste, finir en Suisse, ça tombe étrangement bien. Permis de travail suisse : déjà en poche.',
        },
        portrait: {
          title: 'C’est moi',
          body: 'Salut, moi c’est William. Je construis des produits depuis six ans, et les agents IA sont aujourd’hui au cœur de ma façon de travailler.',
        },
        robot: {
          title: 'L’automatisation, à la maison aussi',
          body: 'J’automatise là où ça a du sens, et pas seulement au travail : des automatisations et des workflows d’agents IA s’occupent aussi des tâches répétitives de ma vie perso.',
        },
        night: {
          title: 'L’équipe de nuit',
          body: 'La nuit, des agents planifiés trient les retours et les erreurs, et des explorateurs traquent failles de sécurité et gains de performance. Le matin, je décide de ce qui se construit.',
        },
        flags: {
          title: 'Franco-britannique',
          body: 'J’ai la double nationalité britannique et française, et les deux langues sont maternelles pour moi : je travaille aussi bien en anglais qu’en français.',
        },
      },
    },
    board: {
      eyebrow: '03 · Ma méthode',
      title: 'Les agents font le gros du travail. Je décide.',
      intro:
        'Des runs d’agents planifiés transforment les retours, les erreurs et la codebase en tickets avec un plan. Je prends les décisions et je réponds de chaque changement livré, même ceux trop gros pour être lus ligne à ligne. Essaie.',
      radar: 'Radar quotidien',
      filterAll: 'Tout',
      toDecide: (count) => `${count} à décider`,
      columns: {
        decision: 'Attend ta décision',
        review: 'Ta relecture',
        released: 'En production',
      },
      status: {
        building: 'L’agent implémente',
        prReady: 'PR prête pour ta relecture',
        alreadyImplemented: 'L’agent l’a trouvé déjà en place',
        merged: 'Mergée',
      },
      accept: 'Accepter',
      ask: 'Poser une question',
      reject: 'Rejeter',
      confirm: 'Confirmer',
      reconsider: 'Reconsidérer',
      details: 'Détails',
      openPr: (pr) => `Relire la PR #${pr} sur GitHub`,
      showMore: (count) => `Voir ${count} ticket${count > 1 ? 's' : ''} de plus`,
      showLess: 'Voir moins de tickets',
      rejected: (count) => (count <= 1 ? `${count} rejeté` : `${count} rejetés`),
      closed: (count) =>
        count <= 1 ? `${count} fermé, déjà en place` : `${count} fermés, déjà en place`,
      moreReleased: (count) => `+${count} autres en production`,
      emptyColumn: 'Rien pour le moment',
      openQuestion: 'Question ouverte : tu y réponds en acceptant',
      youAsked: 'Ta question',
      agentResearching: 'L’agent se renseigne…',
      agentReplied: 'Réponse de l’agent',
      genericReply:
        'Noté : l’agent s’en occupe à son prochain run et répond ici. Le ticket attend ta décision.',
      practices: {
        title: 'Ce qui rend les runs d’agents autonomes dignes de confiance',
        items: [
          {
            title: 'Maîtrise',
            body: '{link} m’oblige à raisonner moi-même sur chaque plan avant qu’il soit construit, le {link} de Geoffrey Litt me questionne sur ce qui a été construit. Une pull request peut être trop grosse pour être lue ligne à ligne, jamais trop pour être comprise.',
            links: [
              { label: 'VibeWise', href: 'https://github.com/nykooi1/vibe-wise' },
              {
                label: 'explain-diff',
                href: 'https://gist.github.com/geoffreylitt/a29df1b5f9865506e8952488eac3d524',
              },
            ],
          },
          {
            title: 'Évaluation',
            body: 'Mes acceptations, mes rejets et mes commentaires de relecture repartent dans les instructions des agents et la mémoire du repo, pour que le run suivant répète moins d’erreurs.',
          },
          {
            title: 'Scoring',
            body: 'Chaque plan arrive avec un effort, un niveau de confiance et des preuves. Quand l’agent doute d’un plan, il pose une question avant que quoi que ce soit ne se construise.',
          },
          {
            title: 'Observabilité',
            body: 'Chaque run d’agent est tracé : étapes, appels d’outils, coût et durée. Un résultat faux se remonte jusqu’à l’étape qui l’a causé, et le {link} de Matt Pocock me fait repasser sur les runs passés pour trouver quoi améliorer.',
            links: [
              {
                label: 'skill retro',
                href: 'https://github.com/mattpocock/skills/tree/main/skills/engineering/retro',
              },
            ],
          },
        ],
      },
      card: {
        problem: 'Problème',
        goal: 'Objectif',
        today: 'Aujourd’hui',
        change: 'Changement',
        fix: 'Correctif',
        inCode: 'Dans le code',
        effort: 'Effort',
        confidence: 'Confiance',
        migration: 'Migration',
        disagree: 'Ce qui se contredit',
      },
      modal: {
        cancel: 'Annuler',
        acceptTitle: (id) => `Accepter ${id}`,
        acceptBody:
          'Ta réponse à la question de l’agent entre dans le plan. L’agent l’implémente ensuite et ouvre une pull request ; rien ne part sans ta relecture.',
        acceptLabel: 'Une note pour l’agent (facultatif)',
        acceptPlaceholder: 'ex. garde-le derrière un feature flag',
        acceptConfirm: 'Accepter',
        acceptQuestion: 'L’agent demande',
        askTitle: (id) => `Poser une question à l’agent sur ${id}`,
        askBody:
          'Pas encore sûr ? L’agent de planification creuse ta question et répond sur le ticket. La décision reste la tienne.',
        askLabel: 'Ta question',
        askSuggested: 'Suggestion',
        askPlaceholder: 'ex. que deviennent les tournées déjà commencées ?',
        askConfirm: 'Envoyer',
        recommended: 'Recommandé',
        other: 'Autre',
        otherPlaceholder: 'Ta propre réponse',
        rejectTitle: (id) => `Rejeter ${id}`,
        rejectBody:
          'L’agent apprend de ta raison et ne le reproposera pas, sauf si quelque chose change.',
        rejectReasons: ['Pas prioritaire', 'Hors périmètre', 'Déjà prévu', 'Le plan est faux'],
        rejectLabel: 'Pourquoi ? (facultatif)',
        rejectPlaceholder: 'Dis à l’agent ce qu’il a raté',
        rejectConfirm: 'Rejeter',
        confirmTitle: (id) => `Fermer ${id}, déjà en place`,
        confirmBody:
          'Le travail existant couvre le ticket : il se ferme comme terminé, sans rien construire de nouveau.',
        confirmLabel: 'Une note (facultatif)',
        confirmPlaceholder: 'ex. rendre le champ plus facile à trouver plus tard',
        confirmConfirm: 'Confirmer et fermer',
        reconsiderTitle: (id) => `Reconsidérer ${id}`,
        reconsiderBody: 'Le ticket repart chez l’agent pour être implémenté, avec ta raison.',
        reconsiderLabel: 'Que manque-t-il au travail existant ?',
        reconsiderPlaceholder:
          'ex. les clients doivent voir le champ sans ouvrir « Plus d’options »',
        reconsiderConfirm: 'Renvoyer',
      },
      drawer: {
        close: 'Fermer le ticket',
        whyNow: 'Pourquoi maintenant',
        evidence: 'Ce que montre la codebase',
        plan: 'Plan',
        updatedPlan: 'Mis à jour après ta réponse',
        acceptance: "Critères d'acceptation",
        validation: 'Comment on vérifie',
        watchFor: 'Points de vigilance',
        roles: 'Qui fait quoi',
        roleAgent: 'Les agents : cherchent, planifient, implémentent',
        roleHuman: 'Moi : je décide, je réponds du changement, je livre',
        roleCi: 'La CI : lint, types et tests sur chaque PR',
        pr: 'Pull request',
        notes: 'Tes notes',
        source: 'Source',
        area: 'Zone',
        existingWhy: 'Pourquoi rien de nouveau n’est nécessaire',
        existingEvidence: 'Preuves',
        existingChecked: 'Comment ça a été vérifié',
        existingGap: 'Ce qui pourrait encore manquer',
      },
    },
    experience: {
      eyebrow: '02 · Expérience',
      title: 'Six ans à livrer des produits, du front au back.',
      present: 'Actuel',
      fullTime: 'Temps plein',
      built: "Ce que j'ai construit",
      ai: "Comment j'ai utilisé l'IA",
      stack: 'Stack',
      visit: 'Voir',
      confidential: 'Travail client confidentiel : simples illustrations.',
      conceptArt: "Illustrations de l'app de planification financière",
      seeBoard: 'Voir comment ça marche',
      previous: 'Écran précédent',
      next: 'Écran suivant',
    },
    sideProjects: {
      eyebrow: '04 · Projets perso',
      title: 'Ce que j’ai construit. En open source.',
      intro: 'Construits pour mon propre usage, pas comme des side business.',
      stars: (count) => `${count}+ étoiles`,
      source: 'Code source',
      more: 'Autres projets',
      archived: 'Archivé',
      liveDemo: 'Démo live',
      gamesNote:
        'Le vrai jeu contre des bots, une seule partie sur les deux écrans. Joue sur l’un ou l’autre ; « All games » ouvre les autres.',
      rotaDesktop: 'Rota · ordinateur',
      rotaPhone: 'Rota · téléphone',
      loadingGame: 'On installe la table…',
    },
    footer: {
      title: 'Envie d’agents qui livrent vraiment dans ta codebase ?',
      body: 'Parlons IA engineering, workflows de dev, ou de ton prochain produit.',
      email: 'Écris-moi',
      builtWith: 'Construit avec Next.js, React Three Fiber et Rapier.',
    },
    language: {
      name: 'FR',
      toggleLabel: 'Switch to English',
    },
    palette: {
      title: 'Rechercher sur le site',
      trigger: 'Rechercher',
      placeholder: 'Rechercher ou aller à…',
      close: 'Fermer',
      groups: {
        recent: 'Récents',
        navigate: 'Navigation',
        actions: 'Actions',
        experience: 'Expérience',
        sideProjects: 'Projets perso',
        links: 'Liens',
        versions: 'Anciennes versions du site',
      },
      playground: 'Le bureau en haut de la page',
      cv: 'Télécharger le CV',
      copyEmail: 'Copier mon adresse email',
      copied: 'Copiée',
      emailMe: 'M’écrire un email',
      switchLanguage: 'Passer en anglais',
      source: (name) => `Code source de ${name}`,
      contribution: 'Contribution open source',
      results: (count) => (count === 1 ? '1 résultat' : `${count} résultats`),
      empty: (query) => `Aucun résultat pour « ${query} »`,
      emptyHint: 'Essaie « CV », « GitHub » ou « Pomi ».',
      keys: { navigate: 'naviguer', open: 'ouvrir', close: 'fermer' },
    },
  },
};
