import { type Ticket } from './board';

export const boardTickets: Ticket[] = [
  // ---------------------------------------------------------------- needs-decision
  {
    id: 'FEAT-142',
    track: 'feature',
    initialStage: 'needs-decision',
    title: {
      en: 'Bulk reassign deliveries between drivers',
      fr: 'Réaffecter des livraisons en masse entre chauffeurs',
    },
    tldr: {
      en: 'Move a sick driver’s whole route in one action.',
      fr: 'Transférer la tournée d’un chauffeur absent en une action.',
    },
    source: 'user-feedback',
    area: 'web',
    effort: 'M',
    confidence: 78,
    goal: {
      en: 'Let dispatchers move several deliveries to another driver in one action when a driver calls in sick.',
      fr: 'Permettre aux dispatcheurs de transférer plusieurs livraisons vers un autre chauffeur en une seule action.',
    },
    today: {
      en: 'Each delivery is reassigned one by one from its detail drawer, which takes minutes per route.',
      fr: 'Chaque livraison se réaffecte une par une depuis son panneau de détail, soit plusieurs minutes par tournée.',
    },
    change: {
      en: 'Add multi-select to the deliveries table and `POST /deliveries/reassign` behind `features.bulkReassign`.',
      fr: 'Ajouter la sélection multiple au tableau des livraisons et `POST /deliveries/reassign` derrière `features.bulkReassign`.',
    },
    technical: [
      {
        en: '`DeliveriesTable.tsx`: row selection and a new `<BulkActionBar />`',
        fr: '`DeliveriesTable.tsx` : sélection de lignes et nouvelle `<BulkActionBar />`',
      },
      {
        en: '`DeliveriesService.reassign()` wraps updates in one `prisma.$transaction`',
        fr: '`DeliveriesService.reassign()` regroupe les updates dans un seul `prisma.$transaction`',
      },
      {
        en: 'Emit `route.updated` on `SyncGateway` for both drivers',
        fr: 'Émettre `route.updated` sur `SyncGateway` pour les deux chauffeurs',
      },
      {
        en: 'Write one `DeliveryAudit` row per delivery with `action: REASSIGN`',
        fr: 'Écrire une ligne `DeliveryAudit` par livraison avec `action: REASSIGN`',
      },
    ],
    whyNow: {
      en: 'Fourteen dispatchers asked for it this month, and it is the top-voted request on the feedback board.',
      fr: 'Quatorze dispatcheurs l’ont demandé ce mois-ci, et c’est la demande la plus votée du tableau de retours.',
    },
    evidence: [
      {
        en: '14 feedback entries mention “reassign” or “move stops” in the last 30 days.',
        fr: '14 retours mentionnent « réaffecter » ou « déplacer des arrêts » sur les 30 derniers jours.',
      },
      {
        en: 'Session replays show dispatchers opening the detail drawer up to 40 times in a row.',
        fr: 'Les replays de session montrent jusqu’à 40 ouvertures consécutives du panneau de détail.',
      },
    ],
    plan: [
      {
        en: 'Add row selection and a bulk action bar to `apps/web/app/deliveries/DeliveriesTable.tsx`.',
        fr: 'Ajouter la sélection de lignes et une barre d’actions groupées à `apps/web/app/deliveries/DeliveriesTable.tsx`.',
      },
      {
        en: 'Create `POST /deliveries/reassign` with a `ReassignDto` capped at 100 ids.',
        fr: 'Créer `POST /deliveries/reassign` avec un `ReassignDto` limité à 100 ids.',
      },
      {
        en: 'Push the new stop lists to both driver apps through `SyncGateway`.',
        fr: 'Envoyer les nouvelles listes d’arrêts aux deux apps chauffeur via `SyncGateway`.',
      },
      {
        en: 'Ship behind `features.bulkReassign`, enabled for two pilot depots first.',
        fr: 'Livrer derrière `features.bulkReassign`, activé d’abord pour deux dépôts pilotes.',
      },
    ],
    acceptance: [
      {
        en: 'A dispatcher can reassign up to 100 deliveries in a single action.',
        fr: 'Un dispatcheur peut réaffecter jusqu’à 100 livraisons en une seule action.',
      },
      {
        en: 'Both drivers see their updated routes within 10 seconds.',
        fr: 'Les deux chauffeurs voient leur tournée à jour en moins de 10 secondes.',
      },
      {
        en: 'A failed batch leaves every assignment unchanged.',
        fr: 'Un batch en échec laisse toutes les affectations inchangées.',
      },
      {
        en: 'The selection checkboxes and action bar work with the keyboard only.',
        fr: 'Les cases de sélection et la barre d’actions fonctionnent au clavier seul.',
      },
    ],
    validation: {
      en: 'Playwright test on the dispatch board plus an API integration test that forces a mid-batch failure.',
      fr: 'Test Playwright sur le tableau de dispatch et test d’intégration API qui force un échec en cours de batch.',
    },
    watchFor: {
      en: 'Reassigning to a driver already on the road could reorder stops they are about to reach.',
      fr: 'Réaffecter vers un chauffeur déjà en route peut réordonner des arrêts qu’il s’apprête à atteindre.',
    },
    followUp: {
      question: {
        en: 'What happens to stops already loaded in the first driver’s van?',
        fr: 'Que deviennent les arrêts déjà chargés dans le camion du premier chauffeur ?',
      },
      answer: {
        en: 'The plan only moves deliveries still `AT_DEPOT`. Loaded ones show as locked in the selection, so nothing is reassigned out of a van by mistake.',
        fr: 'Le plan ne déplace que les livraisons encore `AT_DEPOT`. Celles déjà chargées apparaissent verrouillées dans la sélection : rien n’est réaffecté par erreur depuis un camion.',
      },
    },
    question: {
      prompt: {
        en: 'What should happen when the new driver cannot meet a delivery’s time window?',
        fr: 'Que faire quand le nouveau chauffeur ne peut pas tenir le créneau d’une livraison ?',
      },
      options: [
        {
          id: 'warn',
          label: {
            en: 'Warn and let the dispatcher confirm',
            fr: 'Avertir et laisser le dispatcheur confirmer',
          },
          recommended: true,
          planNote: {
            en: 'List conflicting time windows in a confirmation step before `reassign()` runs.',
            fr: 'Lister les créneaux en conflit dans une étape de confirmation avant l’appel à `reassign()`.',
          },
        },
        {
          id: 'block',
          label: { en: 'Block the whole batch', fr: 'Bloquer tout le batch' },
          planNote: {
            en: 'Return `409` with the deliveries whose windows would be missed and apply nothing.',
            fr: 'Renvoyer `409` avec les livraisons dont le créneau serait raté, sans rien appliquer.',
          },
        },
        {
          id: 'skip',
          label: {
            en: 'Skip conflicting deliveries',
            fr: 'Ignorer les livraisons en conflit',
          },
          planNote: {
            en: 'Reassign compatible deliveries and keep conflicting ones on the original driver.',
            fr: 'Réaffecter les livraisons compatibles et laisser celles en conflit au chauffeur d’origine.',
          },
        },
      ],
    },
  },
  {
    id: 'DOC-7',
    track: 'docs',
    initialStage: 'needs-decision',
    title: {
      en: 'Delivery time-window cut-off disagrees between docs and code',
      fr: 'Le délai de modification des créneaux diverge entre docs et code',
    },
    tldr: {
      en: 'Three sources, three different cut-offs for editing a window.',
      fr: 'Trois sources, trois délais différents pour modifier un créneau.',
    },
    source: 'agent-run',
    area: 'api',
    effort: 'S',
    confidence: 74,
    goal: {
      en: 'Have one agreed rule for how late a customer can change their delivery window.',
      fr: 'Avoir une seule règle sur le délai dont dispose un client pour modifier son créneau.',
    },
    today: {
      en: 'The docs, a code comment and the code each give a different cut-off, and support quotes the docs.',
      fr: 'Les docs, un commentaire et le code donnent chacun un délai différent, et le support cite les docs.',
    },
    change: {
      en: 'Align `docs/delivery-windows.md` and the comment in `window.policy.ts` on the rule you pick.',
      fr: 'Aligner `docs/delivery-windows.md` et le commentaire de `window.policy.ts` sur la règle choisie.',
    },
    technical: [
      {
        en: '`WINDOW_EDIT_CUTOFF_MIN` extracted to `packages/shared/src/delivery.ts`',
        fr: '`WINDOW_EDIT_CUTOFF_MIN` extrait dans `packages/shared/src/delivery.ts`',
      },
      {
        en: '`assertWindowEditable()` reads the shared constant',
        fr: '`assertWindowEditable()` lit la constante partagée',
      },
      {
        en: 'Docs snippet generated from the constant in `scripts/docs-constants.ts`',
        fr: 'Extrait de doc généré depuis la constante dans `scripts/docs-constants.ts`',
      },
    ],
    whyNow: {
      en: 'Two support tickets this week told customers they could not edit, while the API would have accepted it.',
      fr: 'Deux tickets support cette semaine ont refusé une modification que l’API aurait acceptée.',
    },
    evidence: [
      {
        en: 'The daily run cross-checked `docs/` against comments and constants in `apps/api/src/deliveries`.',
        fr: 'Le run quotidien a croisé `docs/` avec les commentaires et constantes de `apps/api/src/deliveries`.',
      },
      {
        en: 'API logs show 312 window edits made less than 24 hours before delivery last month.',
        fr: 'Les logs API montrent 312 modifications de créneau à moins de 24 h de la livraison le mois dernier.',
      },
    ],
    inconsistencies: [
      {
        source: 'docs/delivery-windows.md',
        says: {
          en: 'Customers can change their window up to 24 hours before delivery.',
          fr: 'Le client peut modifier son créneau jusqu’à 24 heures avant la livraison.',
        },
      },
      {
        source: 'apps/api/src/deliveries/window.policy.ts:31',
        says: {
          en: 'Comment: `// editable until midnight the day before (depot time)`.',
          fr: 'Commentaire : `// editable until midnight the day before (depot time)`.',
        },
      },
      {
        source: 'apps/api/src/deliveries/window.policy.ts:38',
        says: {
          en: 'Code: `if (minutesUntil(window.start) < 120) throw new WindowLockedError()`, so 2 hours.',
          fr: 'Code : `if (minutesUntil(window.start) < 120) throw new WindowLockedError()`, soit 2 heures.',
        },
      },
    ],
    plan: [
      {
        en: 'Move the cut-off into `WINDOW_EDIT_CUTOFF_MIN` in `packages/shared`.',
        fr: 'Déplacer le délai dans `WINDOW_EDIT_CUTOFF_MIN` dans `packages/shared`.',
      },
      {
        en: 'Fix the stale comment in `window.policy.ts`.',
        fr: 'Corriger le commentaire obsolète de `window.policy.ts`.',
      },
      {
        en: 'Update `docs/delivery-windows.md` and the support macro to match.',
        fr: 'Mettre à jour `docs/delivery-windows.md` et la macro support en conséquence.',
      },
    ],
    acceptance: [
      {
        en: 'Docs, comment and code state the same cut-off.',
        fr: 'Docs, commentaire et code indiquent le même délai.',
      },
      {
        en: 'A unit test pins the cut-off on both sides of the boundary.',
        fr: 'Un test unitaire fixe le délai de part et d’autre de la limite.',
      },
    ],
    validation: {
      en: 'Unit test on `assertWindowEditable()` plus a docs check in CI that compares the constant.',
      fr: 'Test unitaire sur `assertWindowEditable()` et vérification en CI de la constante dans les docs.',
    },
    watchFor: {
      en: 'The route optimiser runs at 22:00, so late edits may already trigger re-optimisation jobs.',
      fr: 'L’optimiseur de tournées tourne à 22 h, des modifications tardives peuvent déjà déclencher des réoptimisations.',
    },
    followUp: {
      question: {
        en: 'Have customers already been told one of these cut-offs?',
        fr: 'Les clients ont-ils déjà reçu l’une de ces limites ?',
      },
      answer: {
        en: 'Yes: the order confirmation email says 24 h (`emails/order-confirmed.mjml`). Keeping the 2 h rule also means updating that email.',
        fr: 'Oui : l’email de confirmation de commande annonce 24 h (`emails/order-confirmed.mjml`). Garder la règle des 2 h implique aussi de mettre à jour cet email.',
      },
    },
    question: {
      prompt: {
        en: 'Which rule is the right one?',
        fr: 'Quelle règle est la bonne ?',
      },
      options: [
        {
          id: 'code',
          label: {
            en: 'Code is right (2 h), update the docs',
            fr: 'Le code a raison (2 h), mettre à jour les docs',
          },
          recommended: true,
          planNote: {
            en: 'Keep 120 min, fix the comment and rewrite `docs/delivery-windows.md` around it.',
            fr: 'Garder 120 min, corriger le commentaire et réécrire `docs/delivery-windows.md` en conséquence.',
          },
        },
        {
          id: 'docs',
          label: {
            en: 'Docs are right (24 h), fix the code',
            fr: 'Les docs ont raison (24 h), corriger le code',
          },
          planNote: {
            en: 'Set `WINDOW_EDIT_CUTOFF_MIN = 1440` and show the cut-off in the customer tracking page.',
            fr: 'Passer `WINDOW_EDIT_CUTOFF_MIN = 1440` et afficher le délai sur la page de suivi client.',
          },
        },
        {
          id: 'po',
          label: { en: 'Ask the product owner', fr: 'Demander au product owner' },
          planNote: {
            en: 'Park the ticket and post the three versions in `#product` for a decision.',
            fr: 'Mettre le ticket en attente et poster les trois versions dans `#product` pour arbitrage.',
          },
        },
      ],
    },
  },

  // ---------------------------------------------------------------- building
  {
    id: 'SEC-12',
    track: 'security',
    initialStage: 'needs-decision',
    title: {
      en: 'Rate-limit and lock out the login endpoint',
      fr: 'Limiter le débit et verrouiller l’endpoint de connexion',
    },
    tldr: {
      en: 'Make password guessing slow, noisy and pointless.',
      fr: 'Rendre le bruteforce de mots de passe lent et visible.',
    },
    source: 'agent-run',
    area: 'api',
    effort: 'S',
    confidence: 88,
    goal: {
      en: 'Make password guessing against dispatcher and admin accounts slow and visible.',
      fr: 'Rendre les tentatives de devinette de mot de passe sur les comptes dispatch et admin lentes et visibles.',
    },
    today: {
      en: 'The login endpoint accepts unlimited attempts per IP and per account, with no alert on repeated failures.',
      fr: 'L’endpoint de connexion accepte des tentatives illimitées par IP et par compte, sans alerte sur les échecs.',
    },
    change: {
      en: 'Throttle `POST /auth/login` per IP and per account with `@nestjs/throttler` backed by Redis.',
      fr: 'Limiter `POST /auth/login` par IP et par compte avec `@nestjs/throttler` adossé à Redis.',
    },
    technical: [
      {
        en: '`@Throttle({ login: { limit: 10, ttl: 900_000 } })` on `AuthController.login()`',
        fr: '`@Throttle({ login: { limit: 10, ttl: 900_000 } })` sur `AuthController.login()`',
      },
      {
        en: '`ThrottlerStorageRedisService` so limits hold across API pods',
        fr: '`ThrottlerStorageRedisService` pour que les limites tiennent entre les pods API',
      },
      {
        en: 'Per-account counter `login:fail:{email}` in Redis, TTL 15 min',
        fr: 'Compteur par compte `login:fail:{email}` dans Redis, TTL 15 min',
      },
      {
        en: 'Metric `auth_login_failed_total` and a Grafana alert on spikes',
        fr: 'Métrique `auth_login_failed_total` et alerte Grafana sur les pics',
      },
    ],
    whyNow: {
      en: 'The daily run found the gap, and admin accounts can export every customer address.',
      fr: 'Le run quotidien a détecté la faille, et les comptes admin peuvent exporter toutes les adresses clients.',
    },
    evidence: [
      {
        en: '`AuthController` has no `@Throttle()`, and `ThrottlerGuard` is only bound to `/public/*`.',
        fr: '`AuthController` n’a pas de `@Throttle()`, et `ThrottlerGuard` n’est branché que sur `/public/*`.',
      },
      {
        en: 'Access logs show one IP sending 2,300 failed logins in an hour last Tuesday.',
        fr: 'Les logs d’accès montrent une IP ayant envoyé 2 300 connexions échouées en une heure mardi dernier.',
      },
    ],
    plan: [
      {
        en: 'Register a `login` throttler in `AppModule` with `ThrottlerStorageRedisService`.',
        fr: 'Déclarer un throttler `login` dans `AppModule` avec `ThrottlerStorageRedisService`.',
      },
      {
        en: 'Track failures per account in `AuthService.validate()` and apply the chosen policy.',
        fr: 'Compter les échecs par compte dans `AuthService.validate()` et appliquer la politique choisie.',
      },
      {
        en: 'Return the same `401 InvalidCredentials` for unknown accounts, wrong passwords and lockouts.',
        fr: 'Renvoyer le même `401 InvalidCredentials` pour un compte inconnu, un mauvais mot de passe ou un blocage.',
      },
      {
        en: 'Expose `auth_login_failed_total` and add the Grafana alert.',
        fr: 'Exposer `auth_login_failed_total` et ajouter l’alerte Grafana.',
      },
    ],
    acceptance: [
      {
        en: 'The 11th attempt in 15 minutes from one IP returns `429`.',
        fr: 'La 11e tentative en 15 minutes depuis une même IP renvoie `429`.',
      },
      {
        en: 'Responses never reveal whether an account exists.',
        fr: 'Les réponses ne révèlent jamais si un compte existe.',
      },
    ],
    validation: {
      en: 'Integration tests replay a burst of logins against two API instances sharing one Redis.',
      fr: 'Des tests d’intégration rejouent une rafale de connexions sur deux instances API partageant un Redis.',
    },
    watchFor: {
      en: 'Depots behind one shared NAT IP could lock each other out at shift start.',
      fr: 'Des dépôts derrière une même IP NAT pourraient se bloquer entre eux en début de service.',
    },
    followUp: {
      question: {
        en: 'How many real users would hit the limit today?',
        fr: 'Combien de vrais utilisateurs toucheraient la limite aujourd’hui ?',
      },
      answer: {
        en: 'In last month’s auth logs, 0.3% of accounts failed five logins within 15 minutes, mostly at shift start. A progressive delay slows them by seconds; it never locks them out.',
        fr: 'Dans les logs d’auth du mois dernier, 0,3 % des comptes ont raté cinq connexions en 15 minutes, surtout en début de service. Un délai progressif les ralentit de quelques secondes, sans jamais les bloquer.',
      },
    },
    question: {
      prompt: {
        en: 'What should happen to an account after repeated failed logins?',
        fr: 'Que faire d’un compte après plusieurs connexions échouées ?',
      },
      options: [
        {
          id: 'backoff',
          label: {
            en: 'Progressive delay, no hard lock',
            fr: 'Délai progressif, sans blocage',
          },
          recommended: true,
          planNote: {
            en: 'Add an exponential delay per account after 5 failures, capped at 30 s, so attackers cannot lock users out.',
            fr: 'Ajouter un délai exponentiel par compte après 5 échecs, plafonné à 30 s, pour qu’un attaquant ne puisse pas bloquer un utilisateur.',
          },
        },
        {
          id: 'lock',
          label: {
            en: 'Lock for 15 minutes and email the owner',
            fr: 'Bloquer 15 minutes et prévenir par email',
          },
          planNote: {
            en: 'Set `lockedUntil` on `User` after 10 failures and send a `login-locked` email.',
            fr: 'Renseigner `lockedUntil` sur `User` après 10 échecs et envoyer un email `login-locked`.',
          },
        },
        {
          id: 'ip-only',
          label: { en: 'Throttle per IP only', fr: 'Limiter par IP uniquement' },
          planNote: {
            en: 'Skip the per-account counter and rely on the IP throttler plus the Grafana alert.',
            fr: 'Laisser tomber le compteur par compte et s’appuyer sur la limite par IP et l’alerte Grafana.',
          },
        },
      ],
    },
  },
  {
    id: 'DEP-40',
    track: 'dependencies',
    initialStage: 'needs-decision',
    title: {
      en: 'Migrate the dispatch dashboard from Next 14 to Next 16',
      fr: 'Migrer le dashboard de dispatch de Next 14 à Next 16',
    },
    tldr: {
      en: 'Two majors behind, and Next 14 no longer gets fixes.',
      fr: 'Deux versions majeures de retard, Next 14 n’est plus maintenu.',
    },
    source: 'agent-run',
    area: 'web',
    effort: 'L',
    confidence: 66,
    goal: {
      en: 'Bring `apps/web` back onto a supported Next.js major before the next security advisory lands.',
      fr: 'Remettre `apps/web` sur une version majeure de Next.js maintenue avant la prochaine alerte de sécurité.',
    },
    today: {
      en: 'The dashboard runs Next 14 on Node 18, both out of support, and blocks the React 19 upgrade.',
      fr: 'Le dashboard tourne sur Next 14 et Node 18, tous deux hors support, et bloque le passage à React 19.',
    },
    change: {
      en: 'Upgrade `next` to 16 with `react@19.2`, make request APIs async and rename `middleware.ts` to `proxy.ts`.',
      fr: 'Passer `next` en 16 avec `react@19.2`, rendre les request APIs asynchrones et renommer `middleware.ts` en `proxy.ts`.',
    },
    technical: [
      {
        en: '`await cookies()`, `await headers()`, `await params` in 38 files',
        fr: '`await cookies()`, `await headers()`, `await params` dans 38 fichiers',
      },
      {
        en: '`middleware.ts` → `proxy.ts`, Node runtime only',
        fr: '`middleware.ts` → `proxy.ts`, runtime Node uniquement',
      },
      {
        en: '`revalidateTag(tag, profile)` now needs a `cacheLife` profile',
        fr: '`revalidateTag(tag, profile)` exige désormais un profil `cacheLife`',
      },
      {
        en: 'Turbopack becomes the default for `next dev` and `next build`',
        fr: 'Turbopack devient le défaut pour `next dev` et `next build`',
      },
    ],
    whyNow: {
      en: 'Next 16 requires Node 20.9+, and the infra team wants Node 18 gone from every image this quarter.',
      fr: 'Next 16 exige Node 20.9+, et l’équipe infra veut retirer Node 18 de toutes les images ce trimestre.',
    },
    evidence: [
      {
        en: '`pnpm outdated` shows `next` 14.2.15 → 16.0.3 and `react` 18.3.1 → 19.2.0.',
        fr: '`pnpm outdated` affiche `next` 14.2.15 → 16.0.3 et `react` 18.3.1 → 19.2.0.',
      },
      {
        en: '38 files call `cookies()`, `headers()` or read `params` synchronously.',
        fr: '38 fichiers appellent `cookies()`, `headers()` ou lisent `params` de façon synchrone.',
      },
      {
        en: '`next.config.js` still sets `publicRuntimeConfig`, removed in Next 16.',
        fr: '`next.config.js` définit encore `publicRuntimeConfig`, supprimé dans Next 16.',
      },
    ],
    plan: [
      {
        en: 'Run `pnpm dlx @next/codemod@canary upgrade latest`, then `next-async-request-api`.',
        fr: 'Lancer `pnpm dlx @next/codemod@canary upgrade latest`, puis `next-async-request-api`.',
      },
      {
        en: 'Move `publicRuntimeConfig` values to `NEXT_PUBLIC_*` env vars.',
        fr: 'Déplacer les valeurs de `publicRuntimeConfig` vers des variables `NEXT_PUBLIC_*`.',
      },
      {
        en: 'Rename `middleware.ts` to `proxy.ts` and check the auth redirect still works.',
        fr: 'Renommer `middleware.ts` en `proxy.ts` et vérifier que la redirection d’auth fonctionne toujours.',
      },
      {
        en: 'Replace `next lint` with the ESLint CLI, since the command is removed in 16.',
        fr: 'Remplacer `next lint` par la CLI ESLint, la commande étant supprimée en 16.',
      },
    ],
    acceptance: [
      {
        en: '`next build` passes with Turbopack and no sync request API warnings.',
        fr: '`next build` passe avec Turbopack, sans avertissement sur les request APIs synchrones.',
      },
      {
        en: 'The full Playwright suite is green on the preview deployment.',
        fr: 'Toute la suite Playwright est verte sur le déploiement de preview.',
      },
      {
        en: 'First-load JS on the dispatch board does not grow.',
        fr: 'Le JS initial du tableau de dispatch n’augmente pas.',
      },
    ],
    validation: {
      en: 'Playwright on the preview build, then a canary deploy to 10% of dispatchers for two days.',
      fr: 'Playwright sur le build de preview, puis un déploiement canary à 10 % des dispatcheurs pendant deux jours.',
    },
    watchFor: {
      en: 'Uncached `fetch` since Next 15 can quietly multiply calls to `apps/api` from server components.',
      fr: 'Le `fetch` non mis en cache depuis Next 15 peut multiplier en silence les appels à `apps/api` depuis les server components.',
    },
    migration: { pkg: 'next', from: '14.2.15', to: '16.0.3' },
    followUp: {
      question: {
        en: 'Does any dependency block Next 16?',
        fr: 'Une dépendance bloque-t-elle Next 16 ?',
      },
      answer: {
        en: 'One: `next-auth@4` does not support Next 16. The plan moves it to Auth.js 5 at the start of the second PR, with its own tests.',
        fr: 'Une seule : `next-auth@4` ne supporte pas Next 16. Le plan la passe à Auth.js 5 au début de la deuxième PR, avec ses propres tests.',
      },
    },
    question: {
      prompt: {
        en: 'How should the migration be split?',
        fr: 'Comment découper la migration ?',
      },
      options: [
        {
          id: 'staged',
          label: {
            en: 'Next 15 first, then 16 in a second PR',
            fr: 'Next 15 d’abord, puis 16 dans une seconde PR',
          },
          recommended: true,
          planNote: {
            en: 'Ship 15 with the async API codemod, soak a week, then bump to 16 and switch to Turbopack.',
            fr: 'Livrer la 15 avec le codemod des APIs async, laisser tourner une semaine, puis passer en 16 avec Turbopack.',
          },
        },
        {
          id: 'one-pr',
          label: {
            en: 'Straight to 16 in one PR',
            fr: 'Directement en 16 dans une seule PR',
          },
          planNote: {
            en: 'Run both codemods in one branch and gate the release on the canary deploy.',
            fr: 'Lancer les deux codemods sur une même branche et conditionner la release au déploiement canary.',
          },
        },
        {
          id: 'wait',
          label: { en: 'Wait for 16.1', fr: 'Attendre la 16.1' },
          planNote: {
            en: 'Only bump Node to 22 now and revisit the Next upgrade after the first minor.',
            fr: 'Passer seulement Node en 22 maintenant et revoir la montée de Next après la première mineure.',
          },
        },
      ],
    },
  },
  {
    id: 'PERF-31',
    track: 'performance',
    initialStage: 'building',
    title: {
      en: 'Remove N+1 queries from the routes list',
      fr: 'Supprimer les requêtes N+1 de la liste des tournées',
    },
    tldr: {
      en: '361 SQL queries for one page load, down to 3.',
      fr: '361 requêtes SQL pour un chargement, ramenées à 3.',
    },
    source: 'agent-run',
    area: 'api',
    effort: 'M',
    confidence: 84,
    goal: {
      en: 'Make the dispatch board load its routes fast, even for depots running 200 routes a day.',
      fr: 'Charger vite les tournées du tableau de dispatch, même pour les dépôts à 200 tournées par jour.',
    },
    today: {
      en: 'The routes endpoint runs one query for the routes, then one per route for stops and one for the driver.',
      fr: 'L’endpoint des tournées fait une requête pour les tournées, puis une par tournée pour les arrêts et le chauffeur.',
    },
    change: {
      en: 'Load stops and drivers with `include` in one Prisma call and return a slim `RouteListItem` DTO.',
      fr: 'Charger arrêts et chauffeurs via `include` en un seul appel Prisma et renvoyer un DTO `RouteListItem` allégé.',
    },
    technical: [
      {
        en: '`RoutesService.list()`: drop the `for` loop calling `prisma.stop.findMany`',
        fr: '`RoutesService.list()` : supprimer la boucle `for` qui appelle `prisma.stop.findMany`',
      },
      {
        en: '`include: { driver: true, stops: { select: … } }` on `prisma.route.findMany`',
        fr: '`include: { driver: true, stops: { select: … } }` sur `prisma.route.findMany`',
      },
      {
        en: 'New `RouteListItem` DTO in `packages/shared/src/routes.ts`',
        fr: 'Nouveau DTO `RouteListItem` dans `packages/shared/src/routes.ts`',
      },
      {
        en: '`expectQueryCount(3)` helper in `routes.e2e-spec.ts`',
        fr: 'Helper `expectQueryCount(3)` dans `routes.e2e-spec.ts`',
      },
    ],
    whyNow: {
      en: 'p95 latency on `GET /routes` reached 2.8 s this week, the slowest endpoint in the API.',
      fr: 'La latence p95 de `GET /routes` a atteint 2,8 s cette semaine, l’endpoint le plus lent de l’API.',
    },
    evidence: [
      {
        en: 'A trace for a 180-route depot shows 361 SQL queries for a single request.',
        fr: 'Une trace pour un dépôt de 180 tournées montre 361 requêtes SQL pour un seul appel.',
      },
      {
        en: '`RoutesService.list()` loads `route.stops` and `route.driver` inside a loop.',
        fr: '`RoutesService.list()` charge `route.stops` et `route.driver` dans une boucle.',
      },
    ],
    plan: [
      {
        en: 'Replace the loop with a single `findMany` using `include` for stops and driver.',
        fr: 'Remplacer la boucle par un seul `findMany` avec `include` pour arrêts et chauffeur.',
      },
      {
        en: 'Introduce `RouteListItem` without full stop payloads.',
        fr: 'Introduire `RouteListItem` sans le détail complet des arrêts.',
      },
      {
        en: "Count queries with Prisma’s `$on('query')` in the e2e test and assert the limit.",
        fr: "Compter les requêtes via `$on('query')` de Prisma dans le test e2e et vérifier la limite.",
      },
    ],
    acceptance: [
      {
        en: '`GET /routes` runs at most 3 queries whatever the number of routes.',
        fr: '`GET /routes` exécute au plus 3 requêtes, quel que soit le nombre de tournées.',
      },
      {
        en: 'p95 latency stays under 400 ms for the largest depot.',
        fr: 'La latence p95 reste sous 400 ms pour le plus gros dépôt.',
      },
    ],
    validation: {
      en: 'Compare query count and p95 on staging with a copy of the largest depot’s data.',
      fr: 'Comparer nombre de requêtes et p95 en staging avec une copie des données du plus gros dépôt.',
    },
    watchFor: {
      en: 'The driver app also calls `GET /routes` and may rely on fields the slim DTO drops.',
      fr: 'L’app chauffeur appelle aussi `GET /routes` et peut dépendre de champs retirés du DTO allégé.',
    },
  },

  // ---------------------------------------------------------------- pr-ready
  {
    id: 'BUG-87',
    track: 'bug',
    initialStage: 'pr-ready',
    title: {
      en: 'Delivery summary crashes without a proof-of-delivery photo',
      fr: 'Le récapitulatif plante sans photo de preuve de livraison',
    },
    tldr: {
      en: 'Signature-only deliveries leave drivers on a blank screen.',
      fr: 'Les livraisons avec signature seule affichent un écran vide.',
    },
    source: 'sentry',
    area: 'driver-app',
    effort: 'S',
    confidence: 92,
    goal: {
      en: 'The driver app throws a TypeError on the summary screen when a delivery has no photo.',
      fr: 'L’app chauffeur lève une TypeError sur l’écran récapitulatif quand une livraison n’a pas de photo.',
    },
    today: {
      en: 'Drivers who complete a signature-only delivery see a blank screen and must restart the app.',
      fr: 'Les chauffeurs qui valident une livraison avec signature seule voient un écran vide et doivent relancer l’app.',
    },
    change: {
      en: 'Make `photo` optional in `ProofOfDelivery` and render the signature or a “No photo” placeholder.',
      fr: 'Rendre `photo` optionnelle dans `ProofOfDelivery` et afficher la signature ou un indicateur « Pas de photo ».',
    },
    technical: [
      {
        en: '`packages/shared`: `photo?: PhotoRef` on `ProofOfDelivery`',
        fr: '`packages/shared` : `photo?: PhotoRef` sur `ProofOfDelivery`',
      },
      {
        en: '`DeliverySummary.tsx`: guard `pod.photo?.uri`, fall back to `<SignaturePreview />`',
        fr: '`DeliverySummary.tsx` : garde sur `pod.photo?.uri`, repli sur `<SignaturePreview />`',
      },
      {
        en: 'Same fix in `DeliveryHistoryItem.tsx`, flagged by `tsc`',
        fr: 'Même correctif dans `DeliveryHistoryItem.tsx`, signalé par `tsc`',
      },
    ],
    whyNow: {
      en: 'Sentry reports 312 events from 41 drivers since signature-only deliveries were enabled last week.',
      fr: 'Sentry remonte 312 événements chez 41 chauffeurs depuis l’activation des livraisons avec signature seule.',
    },
    evidence: [
      {
        en: "Sentry: `TypeError: Cannot read properties of undefined (reading 'uri')` in `DeliverySummary.tsx`.",
        fr: "Sentry : `TypeError: Cannot read properties of undefined (reading 'uri')` dans `DeliverySummary.tsx`.",
      },
      {
        en: 'Every event has `proofOfDelivery.photo: null` in its breadcrumbs.',
        fr: 'Chaque événement a `proofOfDelivery.photo: null` dans ses breadcrumbs.',
      },
    ],
    plan: [
      {
        en: 'Make `photo` optional in the shared type so `tsc` flags every unsafe access.',
        fr: 'Rendre `photo` optionnelle dans le type partagé pour que `tsc` signale chaque accès risqué.',
      },
      {
        en: 'Guard the summary and history screens.',
        fr: 'Sécuriser les écrans récapitulatif et historique.',
      },
      {
        en: 'Add a component test with a signature-only fixture.',
        fr: 'Ajouter un test de composant avec une fixture en signature seule.',
      },
    ],
    acceptance: [
      {
        en: 'The summary renders for deliveries with a photo, a signature only, or neither.',
        fr: 'Le récapitulatif s’affiche avec photo, avec signature seule ou sans aucune preuve.',
      },
      {
        en: 'The placeholder has an accessible label for VoiceOver and TalkBack.',
        fr: 'L’indicateur a un libellé accessible pour VoiceOver et TalkBack.',
      },
      {
        en: 'No new events on this Sentry issue after the release.',
        fr: 'Plus aucun événement sur cette issue Sentry après la release.',
      },
    ],
    validation: {
      en: 'Run the new component test, then watch the Sentry issue for 48 hours after the store rollout.',
      fr: 'Lancer le nouveau test de composant, puis surveiller l’issue Sentry 48 heures après la publication.',
    },
    watchFor: {
      en: 'Older app versions stay in the wild for weeks, so the issue will not drop to zero at once.',
      fr: 'Les anciennes versions de l’app restent en circulation des semaines, l’issue ne tombera pas à zéro d’un coup.',
    },
    pr: {
      number: 1284,
      files: 6,
      additions: 142,
      deletions: 38,
      highlights: [
        {
          en: '`ProofOfDelivery.photo` is now optional in `packages/shared/src/pod.ts`.',
          fr: '`ProofOfDelivery.photo` est désormais optionnelle dans `packages/shared/src/pod.ts`.',
        },
        {
          en: '`DeliverySummary` and `DeliveryHistoryItem` fall back to `<SignaturePreview />`.',
          fr: '`DeliverySummary` et `DeliveryHistoryItem` se replient sur `<SignaturePreview />`.',
        },
        {
          en: 'New `DeliverySummary.test.tsx` covers photo, signature-only and empty proofs.',
          fr: 'Nouveau `DeliverySummary.test.tsx` couvrant photo, signature seule et preuve vide.',
        },
      ],
    },
  },

  {
    id: 'FEAT-139',
    track: 'feature',
    initialStage: 'already-implemented',
    title: {
      en: 'Let customers leave delivery instructions',
      fr: 'Permettre aux clients de laisser des instructions de livraison',
    },
    tldr: {
      en: 'The agent found this already exists on the tracking page.',
      fr: 'L’agent a trouvé que ça existe déjà sur la page de suivi.',
    },
    source: 'user-feedback',
    area: 'web',
    effort: 'S',
    confidence: 81,
    goal: {
      en: 'Let customers tell the driver where to leave a parcel, such as a door code or a safe spot.',
      fr: 'Permettre aux clients d’indiquer au chauffeur où laisser un colis, comme un digicode ou un endroit sûr.',
    },
    today: {
      en: 'Customers ask support to pass on door codes, and drivers call them from the doorstep.',
      fr: 'Les clients demandent au support de transmettre leur digicode, et les chauffeurs les appellent devant la porte.',
    },
    change: {
      en: 'Add an instructions field to the tracking page and show it on the stop screen of the driver app.',
      fr: 'Ajouter un champ d’instructions sur la page de suivi et l’afficher sur l’écran d’arrêt de l’app chauffeur.',
    },
    technical: [
      {
        en: '`TrackingPage.tsx`: optional `deliveryNote` field',
        fr: '`TrackingPage.tsx` : champ optionnel `deliveryNote`',
      },
      {
        en: '`PATCH /deliveries/:id/note` limited to 280 characters',
        fr: '`PATCH /deliveries/:id/note` limité à 280 caractères',
      },
      {
        en: 'Driver app `StopScreen.tsx` shows the note above the address',
        fr: 'L’écran `StopScreen.tsx` de l’app chauffeur affiche la note au-dessus de l’adresse',
      },
    ],
    whyNow: {
      en: 'Nine customers asked for it through the feedback widget in two weeks.',
      fr: 'Neuf clients l’ont demandé via le widget de retours en deux semaines.',
    },
    evidence: [
      {
        en: '9 feedback entries mention “door code” or “where to leave” in the last 14 days.',
        fr: '9 retours mentionnent « digicode » ou « où laisser » sur les 14 derniers jours.',
      },
    ],
    plan: [
      {
        en: 'Add a `deliveryNote` field to the tracking page.',
        fr: 'Ajouter un champ `deliveryNote` à la page de suivi.',
      },
      {
        en: 'Store it through `PATCH /deliveries/:id/note`.',
        fr: 'L’enregistrer via `PATCH /deliveries/:id/note`.',
      },
      {
        en: 'Show it on the stop screen of the driver app.',
        fr: 'L’afficher sur l’écran d’arrêt de l’app chauffeur.',
      },
    ],
    acceptance: [
      {
        en: 'A customer can add or edit a note until the driver starts the route.',
        fr: 'Un client peut ajouter ou modifier une note jusqu’au départ de la tournée.',
      },
      {
        en: 'The driver sees the note before arriving at the stop.',
        fr: 'Le chauffeur voit la note avant d’arriver à l’arrêt.',
      },
    ],
    validation: {
      en: 'An e2e test that writes a note on the tracking page and reads it in the driver app.',
      fr: 'Un test e2e qui écrit une note sur la page de suivi et la lit dans l’app chauffeur.',
    },
    watchFor: {
      en: 'Notes can contain door codes, so they must not appear in customer emails or exports.',
      fr: 'Les notes peuvent contenir des digicodes : elles ne doivent pas apparaître dans les emails ni les exports.',
    },
    existing: {
      why: {
        en: 'Customers can already add a note on the tracking page, and drivers already see it on the stop screen.',
        fr: 'Les clients peuvent déjà ajouter une note sur la page de suivi, et les chauffeurs la voient déjà sur l’écran d’arrêt.',
      },
      evidence: [
        {
          en: '`TrackingPage.tsx` renders `<DeliveryNoteField />` under “More options”, added in PR #1168.',
          fr: '`TrackingPage.tsx` affiche `<DeliveryNoteField />` sous « Plus d’options », ajouté dans la PR #1168.',
        },
        {
          en: '`PATCH /deliveries/:id/note` exists, with a 280-character limit and an e2e test.',
          fr: '`PATCH /deliveries/:id/note` existe, avec une limite de 280 caractères et un test e2e.',
        },
        {
          en: 'The driver app’s `StopScreen.tsx` shows `stop.deliveryNote` above the address.',
          fr: 'L’écran `StopScreen.tsx` de l’app chauffeur affiche `stop.deliveryNote` au-dessus de l’adresse.',
        },
      ],
      checked: {
        en: 'The agent ran the existing e2e test for the note endpoint and traced the field from the tracking page to the driver app.',
        fr: 'L’agent a lancé le test e2e existant de l’endpoint et suivi le champ de la page de suivi jusqu’à l’app chauffeur.',
      },
      gap: {
        en: 'The field is folded under “More options”, which may be why customers do not find it.',
        fr: 'Le champ est replié sous « Plus d’options », ce qui explique peut-être que les clients ne le trouvent pas.',
      },
    },
  },
  {
    id: 'DOC-8',
    track: 'docs',
    initialStage: 'pr-ready',
    title: {
      en: 'Webhook docs list fields the API no longer sends',
      fr: 'La doc des webhooks liste des champs que l’API n’envoie plus',
    },
    tldr: {
      en: 'Partners were building against an outdated payload.',
      fr: 'Des partenaires développaient sur un payload périmé.',
    },
    source: 'agent-run',
    area: 'api',
    effort: 'S',
    confidence: 88,
    goal: {
      en: 'Make the public webhook docs match what the `delivery.completed` event really sends.',
      fr: 'Aligner la doc publique des webhooks sur ce que l’événement `delivery.completed` envoie vraiment.',
    },
    today: {
      en: 'The docs still list `driverName`, removed in v2.11, and do not mention `proofOfDelivery.signatureUrl`.',
      fr: 'La doc liste encore `driverName`, retiré en v2.11, et ne mentionne pas `proofOfDelivery.signatureUrl`.',
    },
    change: {
      en: 'Generate the payload examples in `docs/webhooks.md` from the shared schemas, so they cannot drift again.',
      fr: 'Générer les exemples de payload de `docs/webhooks.md` depuis les schémas partagés, pour qu’ils ne divergent plus.',
    },
    technical: [
      {
        en: '`scripts/docs-webhooks.ts` renders examples from `DeliveryCompletedEvent`',
        fr: '`scripts/docs-webhooks.ts` génère les exemples depuis `DeliveryCompletedEvent`',
      },
      {
        en: 'Hand-written JSON blocks in `docs/webhooks.md` replaced by generated ones',
        fr: 'Les blocs JSON écrits à la main dans `docs/webhooks.md` remplacés par des blocs générés',
      },
      {
        en: 'CI step `pnpm docs:check` fails when an example is stale',
        fr: 'L’étape CI `pnpm docs:check` échoue quand un exemple est périmé',
      },
    ],
    whyNow: {
      en: 'Two partners opened support tickets about a missing `driverName` this month.',
      fr: 'Deux partenaires ont ouvert un ticket support ce mois-ci à propos de `driverName` manquant.',
    },
    evidence: [
      {
        en: 'The daily docs run compared `docs/webhooks.md` with the schemas in `packages/shared/src/webhooks.ts`.',
        fr: 'Le run docs quotidien a comparé `docs/webhooks.md` aux schémas de `packages/shared/src/webhooks.ts`.',
      },
    ],
    inconsistencies: [
      {
        source: 'docs/webhooks.md',
        says: {
          en: '`driverName` is always present, and there is no signature field.',
          fr: '`driverName` est toujours présent, et il n’y a pas de champ de signature.',
        },
      },
      {
        source: 'packages/shared/src/webhooks.ts',
        says: {
          en: '`DeliveryCompletedEvent` has no `driverName` and adds `proofOfDelivery.signatureUrl`.',
          fr: '`DeliveryCompletedEvent` n’a pas de `driverName` et ajoute `proofOfDelivery.signatureUrl`.',
        },
      },
    ],
    plan: [
      {
        en: 'Write `scripts/docs-webhooks.ts` to render one example per event schema.',
        fr: 'Écrire `scripts/docs-webhooks.ts` pour générer un exemple par schéma d’événement.',
      },
      {
        en: 'Replace the hand-written examples and add a changelog note for partners.',
        fr: 'Remplacer les exemples écrits à la main et ajouter une note de changelog pour les partenaires.',
      },
      {
        en: 'Add `pnpm docs:check` to CI.',
        fr: 'Ajouter `pnpm docs:check` à la CI.',
      },
    ],
    acceptance: [
      {
        en: 'Every webhook example in the docs matches its schema.',
        fr: 'Chaque exemple de webhook de la doc correspond à son schéma.',
      },
      {
        en: 'CI fails if a schema changes without the docs being regenerated.',
        fr: 'La CI échoue si un schéma change sans que la doc soit régénérée.',
      },
    ],
    validation: {
      en: 'Change a schema field on a test branch and check that `pnpm docs:check` fails.',
      fr: 'Modifier un champ de schéma sur une branche de test et vérifier que `pnpm docs:check` échoue.',
    },
    watchFor: {
      en: 'Partners who still read `driverName` need a heads-up, not only a docs change.',
      fr: 'Les partenaires qui lisent encore `driverName` doivent être prévenus, pas seulement la doc.',
    },
    pr: {
      number: 1287,
      files: 4,
      additions: 118,
      deletions: 64,
      highlights: [
        {
          en: 'New `scripts/docs-webhooks.ts` renders examples from the shared schemas.',
          fr: 'Nouveau `scripts/docs-webhooks.ts` qui génère les exemples depuis les schémas partagés.',
        },
        {
          en: '`docs/webhooks.md` drops `driverName` and documents `proofOfDelivery.signatureUrl`.',
          fr: '`docs/webhooks.md` retire `driverName` et documente `proofOfDelivery.signatureUrl`.',
        },
        {
          en: 'New `pnpm docs:check` step in `ci.yml`.',
          fr: 'Nouvelle étape `pnpm docs:check` dans `ci.yml`.',
        },
      ],
    },
  },
  // ---------------------------------------------------------------- released
  {
    id: 'DOC-6',
    track: 'docs',
    initialStage: 'released',
    title: {
      en: 'Repo memory: delivery times follow the depot timezone',
      fr: 'Mémoire du repo : les heures de livraison suivent le fuseau du dépôt',
    },
    tldr: {
      en: 'Written down after BUG-81, so agents stop using browser time.',
      fr: 'Noté après BUG-81, pour que les agents n’utilisent plus l’heure du navigateur.',
    },
    source: 'agent-run',
    area: 'shared',
    effort: 'S',
    confidence: 93,
    goal: {
      en: 'Keep agents and new code from bringing back the timezone bug fixed in BUG-81.',
      fr: 'Éviter que les agents et le nouveau code ne réintroduisent le bug de fuseau corrigé dans BUG-81.',
    },
    today: {
      en: 'The repo memory said nothing about timezones, so new code could format delivery windows in browser time again.',
      fr: 'La mémoire du repo ne disait rien des fuseaux, du nouveau code pouvait donc encore formater les créneaux à l’heure du navigateur.',
    },
    change: {
      en: 'Add an entry to `docs/agents/memory.md`: delivery times always go through `formatWindow()` with `depot.timezone`.',
      fr: 'Ajouter une entrée à `docs/agents/memory.md` : les heures de livraison passent toujours par `formatWindow()` avec `depot.timezone`.',
    },
    technical: [
      {
        en: 'New entry under “Time and dates” in `docs/agents/memory.md`',
        fr: 'Nouvelle entrée sous « Dates et heures » dans `docs/agents/memory.md`',
      },
      {
        en: 'ESLint `no-restricted-syntax` rule on `toLocaleTimeString()` in `apps/web`',
        fr: 'Règle ESLint `no-restricted-syntax` sur `toLocaleTimeString()` dans `apps/web`',
      },
    ],
    whyNow: {
      en: 'A review comment on the BUG-81 pull request asked for the rule to be written down.',
      fr: 'Un commentaire de relecture sur la pull request de BUG-81 demandait de noter la règle.',
    },
    evidence: [
      {
        en: 'Two earlier pull requests were sent back in review for the same browser-time formatting.',
        fr: 'Deux pull requests précédentes avaient été renvoyées en relecture pour le même formatage à l’heure du navigateur.',
      },
    ],
    plan: [
      {
        en: 'Write the memory entry and link it to `formatWindow()`.',
        fr: 'Écrire l’entrée de mémoire et la lier à `formatWindow()`.',
      },
      {
        en: 'Add a lint rule so the mistake fails CI instead of relying on memory alone.',
        fr: 'Ajouter une règle de lint pour que l’erreur fasse échouer la CI, sans dépendre de la seule mémoire.',
      },
    ],
    acceptance: [
      {
        en: 'The memory entry names the helper and the reason behind it.',
        fr: 'L’entrée de mémoire nomme le helper et la raison derrière.',
      },
      {
        en: 'A raw `toLocaleTimeString()` in `apps/web` fails lint.',
        fr: 'Un `toLocaleTimeString()` brut dans `apps/web` fait échouer le lint.',
      },
    ],
    validation: {
      en: 'CI runs the new lint rule on every pull request touching `apps/web`.',
      fr: 'La CI lance la nouvelle règle de lint sur chaque pull request qui touche `apps/web`.',
    },
    watchFor: {
      en: 'CSV exports still use their own formatter, tracked in a separate ticket.',
      fr: 'Les exports CSV utilisent encore leur propre formateur, suivi dans un autre ticket.',
    },
    pr: {
      number: 1252,
      files: 3,
      additions: 34,
      deletions: 2,
      highlights: [
        {
          en: '`docs/agents/memory.md` gains a “Time and dates” entry.',
          fr: '`docs/agents/memory.md` gagne une entrée « Dates et heures ».',
        },
        {
          en: '`eslint.config.mjs` restricts `toLocaleTimeString()` in `apps/web`.',
          fr: '`eslint.config.mjs` restreint `toLocaleTimeString()` dans `apps/web`.',
        },
      ],
    },
  },
  {
    id: 'PERF-28',
    track: 'performance',
    initialStage: 'released',
    title: {
      en: 'Lazy-load the map library on the dashboard',
      fr: 'Charger la librairie de carte à la demande',
    },
    tldr: {
      en: '780 KB of map code off every non-map page.',
      fr: '780 Ko de code carto retirés des pages sans carte.',
    },
    source: 'agent-run',
    area: 'web',
    effort: 'S',
    confidence: 90,
    goal: {
      en: 'Make the dashboard open fast for users who never open the live map.',
      fr: 'Ouvrir vite le dashboard pour les utilisateurs qui n’ouvrent jamais la carte en direct.',
    },
    today: {
      en: 'The map library and its styles add 780 KB to first-load JavaScript, even on the invoices page.',
      fr: 'La librairie de carte et ses styles ajoutent 780 Ko au JS initial, même sur la page des factures.',
    },
    change: {
      en: 'Load `LiveMap` with `next/dynamic` and `ssr: false`, showing a skeleton until `maplibre-gl` is ready.',
      fr: 'Charger `LiveMap` via `next/dynamic` avec `ssr: false`, avec un skeleton le temps que `maplibre-gl` arrive.',
    },
    technical: [
      {
        en: "`dynamic(() => import('./LiveMap'), { ssr: false })` in `MapTab.tsx`",
        fr: "`dynamic(() => import('./LiveMap'), { ssr: false })` dans `MapTab.tsx`",
      },
      {
        en: '`maplibre-gl.css` imported inside `LiveMap.tsx`, not `layout.tsx`',
        fr: '`maplibre-gl.css` importé dans `LiveMap.tsx`, plus dans `layout.tsx`',
      },
      {
        en: '`size-limit` budget of 220 KB first-load JS in CI',
        fr: 'Budget `size-limit` de 220 Ko de JS initial en CI',
      },
    ],
    whyNow: {
      en: 'Largest Contentful Paint on the dashboard home reached 3.4 s on mid-range laptops.',
      fr: 'Le Largest Contentful Paint de l’accueil du dashboard atteignait 3,4 s sur des portables milieu de gamme.',
    },
    evidence: [
      {
        en: '`@next/bundle-analyzer`: the map chunk is 41% of first-load JS on every route.',
        fr: '`@next/bundle-analyzer` : le chunk carte pèse 41 % du JS initial sur toutes les routes.',
      },
      {
        en: 'Only 35% of sessions open the live map at all.',
        fr: 'Seules 35 % des sessions ouvrent la carte en direct.',
      },
    ],
    plan: [
      {
        en: 'Move the map import behind `next/dynamic` with `ssr: false`.',
        fr: 'Passer l’import de la carte derrière `next/dynamic` avec `ssr: false`.',
      },
      {
        en: 'Prefetch the chunk on hover of the Map tab.',
        fr: 'Précharger le chunk au survol de l’onglet Carte.',
      },
      {
        en: 'Add a `size-limit` check to CI.',
        fr: 'Ajouter un contrôle `size-limit` en CI.',
      },
    ],
    acceptance: [
      {
        en: 'First-load JS on non-map pages drops by at least 700 KB.',
        fr: 'Le JS initial des pages sans carte baisse d’au moins 700 Ko.',
      },
      {
        en: 'CI fails if first-load JS exceeds the budget.',
        fr: 'La CI échoue si le JS initial dépasse le budget.',
      },
    ],
    validation: {
      en: 'Lighthouse CI on the five main pages before and after, plus real-user LCP for two weeks.',
      fr: 'Lighthouse CI sur les cinq pages principales avant et après, puis LCP réel pendant deux semaines.',
    },
    watchFor: {
      en: 'Dispatchers who live on the map may see a short delay the first time they open it.',
      fr: 'Les dispatcheurs qui vivent sur la carte peuvent voir un court délai à la première ouverture.',
    },
    pr: {
      number: 1219,
      files: 7,
      additions: 96,
      deletions: 41,
      highlights: [
        {
          en: '`LiveMap` is now a dynamic import with a `<MapSkeleton />` fallback.',
          fr: '`LiveMap` est désormais un import dynamique avec `<MapSkeleton />` en attente.',
        },
        {
          en: "`onMouseEnter` on the Map tab triggers `import('./LiveMap')` early.",
          fr: "`onMouseEnter` sur l’onglet Carte déclenche `import('./LiveMap')` en avance.",
        },
        {
          en: 'New `.size-limit.json` and a `pnpm size` step in `ci.yml`.',
          fr: 'Nouveau `.size-limit.json` et une étape `pnpm size` dans `ci.yml`.',
        },
      ],
    },
  },
  {
    id: 'DOC-5',
    track: 'docs',
    initialStage: 'released',
    title: {
      en: 'Agent instructions: ship every schema change with its migration',
      fr: 'Instructions des agents : chaque changement de schéma avec sa migration',
    },
    tldr: {
      en: 'A rule added after pull requests came back without migrations.',
      fr: 'Une règle ajoutée après des pull requests revenues sans migration.',
    },
    source: 'agent-run',
    area: 'api',
    effort: 'S',
    confidence: 91,
    goal: {
      en: 'Make sure every database schema change an agent makes comes with its Prisma migration.',
      fr: 'Garantir que chaque changement de schéma de base fait par un agent arrive avec sa migration Prisma.',
    },
    today: {
      en: 'The agent instructions did not mention migrations, and two pull requests were sent back in review for a missing one.',
      fr: 'Les instructions des agents ne parlaient pas des migrations, et deux pull requests ont été renvoyées en relecture faute de migration.',
    },
    change: {
      en: 'Add a step to `AGENTS.md` that runs `prisma migrate diff` before a pull request, and a CI check for drift.',
      fr: 'Ajouter à `AGENTS.md` une étape qui lance `prisma migrate diff` avant une pull request, et un contrôle CI de dérive.',
    },
    technical: [
      {
        en: 'New “Database changes” section in `AGENTS.md`',
        fr: 'Nouvelle section « Changements de base » dans `AGENTS.md`',
      },
      {
        en: 'CI job `db:drift` runs `prisma migrate diff --exit-code`',
        fr: 'Le job CI `db:drift` lance `prisma migrate diff --exit-code`',
      },
    ],
    whyNow: {
      en: 'Review comments on two recent pull requests pointed at the same missing step.',
      fr: 'Les commentaires de relecture de deux pull requests récentes pointaient la même étape manquante.',
    },
    evidence: [
      {
        en: 'Both pull requests changed `schema.prisma` without a file in `prisma/migrations`.',
        fr: 'Les deux pull requests modifiaient `schema.prisma` sans fichier dans `prisma/migrations`.',
      },
    ],
    plan: [
      {
        en: 'Write the migration step into `AGENTS.md`.',
        fr: 'Écrire l’étape de migration dans `AGENTS.md`.',
      },
      {
        en: 'Add the `db:drift` job to `ci.yml`.',
        fr: 'Ajouter le job `db:drift` à `ci.yml`.',
      },
    ],
    acceptance: [
      {
        en: 'A schema change without a migration fails CI.',
        fr: 'Un changement de schéma sans migration fait échouer la CI.',
      },
    ],
    validation: {
      en: 'A test branch with a schema change and no migration, which CI must reject.',
      fr: 'Une branche de test avec un changement de schéma sans migration, que la CI doit refuser.',
    },
    watchFor: {
      en: 'Long-lived branches may need their migrations regenerated after rebasing.',
      fr: 'Les branches de longue durée devront peut-être régénérer leurs migrations après un rebase.',
    },
    pr: {
      number: 1247,
      files: 2,
      additions: 41,
      deletions: 0,
      highlights: [
        {
          en: '`AGENTS.md` gains a “Database changes” section.',
          fr: '`AGENTS.md` gagne une section « Changements de base ».',
        },
        {
          en: 'New `db:drift` job in `ci.yml`.',
          fr: 'Nouveau job `db:drift` dans `ci.yml`.',
        },
      ],
    },
  },
  {
    id: 'SEC-10',
    track: 'security',
    initialStage: 'released',
    release: 'v2.13.2',
    title: {
      en: 'Serve delivery photos through short-lived signed URLs',
      fr: 'Servir les photos de livraison via des URLs signées éphémères',
    },
    tldr: {
      en: 'Photos of customers’ doors were publicly readable.',
      fr: 'Les photos de portes de clients étaient publiques.',
    },
    source: 'agent-run',
    area: 'api',
    effort: 'M',
    confidence: 86,
    goal: {
      en: 'Make sure only authorised users can view photos of customers’ doors and parcels.',
      fr: 'Garantir que seuls les utilisateurs autorisés voient les photos de portes et de colis des clients.',
    },
    today: {
      en: 'Photos sit in a public-read bucket with guessable paths built from the delivery id.',
      fr: 'Les photos sont dans un bucket en lecture publique, avec des chemins devinables construits sur l’id de livraison.',
    },
    change: {
      en: 'Make the bucket private and return presigned URLs from `GET /deliveries/:id/photo` that expire after 10 minutes.',
      fr: 'Rendre le bucket privé et renvoyer depuis `GET /deliveries/:id/photo` des URLs présignées valables 10 minutes.',
    },
    technical: [
      {
        en: '`PhotoService.sign()` uses `getSignedUrl()` from `@aws-sdk/s3-request-presigner`',
        fr: '`PhotoService.sign()` utilise `getSignedUrl()` de `@aws-sdk/s3-request-presigner`',
      },
      {
        en: '`TenantGuard` checks the delivery belongs to the caller’s tenant',
        fr: '`TenantGuard` vérifie que la livraison appartient au tenant de l’appelant',
      },
      {
        en: 'Object keys moved to `pod/{uuid}.jpg` by `scripts/rekey-photos.ts`',
        fr: 'Clés d’objets migrées vers `pod/{uuid}.jpg` par `scripts/rekey-photos.ts`',
      },
      {
        en: '`infra/s3/pod_photos.tf`: public-read statement removed',
        fr: '`infra/s3/pod_photos.tf` : règle de lecture publique supprimée',
      },
    ],
    whyNow: {
      en: 'The daily security run confirmed photos could be fetched without any session.',
      fr: 'Le run de sécurité quotidien a confirmé que les photos étaient accessibles sans aucune session.',
    },
    evidence: [
      {
        en: 'Bucket policy granted `s3:GetObject` to `"*"` on the `pod-photos/` prefix.',
        fr: 'La policy du bucket accordait `s3:GetObject` à `"*"` sur le préfixe `pod-photos/`.',
      },
      {
        en: 'Keys followed `{tenantId}/{deliveryId}.jpg`, both sequential integers.',
        fr: 'Les clés suivaient `{tenantId}/{deliveryId}.jpg`, deux entiers séquentiels.',
      },
    ],
    plan: [
      {
        en: 'Add `PhotoService` with tenant checks and URL signing.',
        fr: 'Ajouter `PhotoService` avec contrôle du tenant et signature des URLs.',
      },
      {
        en: 'Re-key existing objects to random UUIDs and store the key on `ProofOfDelivery`.',
        fr: 'Renommer les objets existants en UUIDs aléatoires et stocker la clé sur `ProofOfDelivery`.',
      },
      {
        en: 'Remove public-read from the bucket policy through Terraform.',
        fr: 'Retirer la lecture publique de la policy du bucket via Terraform.',
      },
    ],
    acceptance: [
      {
        en: 'Unsigned or expired photo URLs return `403`.',
        fr: 'Les URLs de photo non signées ou expirées renvoient `403`.',
      },
      {
        en: 'A user from another tenant cannot obtain a signed URL.',
        fr: 'Un utilisateur d’un autre tenant ne peut pas obtenir d’URL signée.',
      },
    ],
    validation: {
      en: 'Integration tests for cross-tenant access, plus a scripted check that old public URLs now fail.',
      fr: 'Tests d’intégration sur l’accès inter-tenant et script vérifiant que les anciennes URLs publiques échouent.',
    },
    watchFor: {
      en: 'Customer emails embedding old public photo links will stop showing images.',
      fr: 'Les emails clients contenant d’anciens liens publics n’afficheront plus les photos.',
    },
    pr: {
      number: 1231,
      files: 14,
      additions: 388,
      deletions: 97,
      highlights: [
        {
          en: 'New `PhotoService` and `GET /deliveries/:id/photo` returning a 600 s presigned URL.',
          fr: 'Nouveau `PhotoService` et `GET /deliveries/:id/photo` qui renvoie une URL présignée de 600 s.',
        },
        {
          en: 'Migration `20250912_pod_photo_key` adds `photoKey` to `ProofOfDelivery`.',
          fr: 'La migration `20250912_pod_photo_key` ajoute `photoKey` à `ProofOfDelivery`.',
        },
        {
          en: '`infra/s3/pod_photos.tf` drops the `"*"` principal and enables Block Public Access.',
          fr: '`infra/s3/pod_photos.tf` retire le principal `"*"` et active Block Public Access.',
        },
        {
          en: 'Cross-tenant e2e test in `photos.e2e-spec.ts`.',
          fr: 'Test e2e inter-tenant dans `photos.e2e-spec.ts`.',
        },
      ],
    },
  },
  {
    id: 'BUG-81',
    track: 'bug',
    initialStage: 'released',
    release: 'v2.13.2',
    title: {
      en: 'Delivery windows shown in the wrong timezone',
      fr: 'Créneaux de livraison affichés dans le mauvais fuseau',
    },
    tldr: {
      en: 'Remote depots saw every window shifted by an hour.',
      fr: 'Les dépôts distants voyaient tous les créneaux décalés d’une heure.',
    },
    source: 'sentry',
    area: 'web',
    effort: 'S',
    confidence: 89,
    goal: {
      en: 'Dispatchers saw delivery windows shifted by an hour when the depot was in another timezone.',
      fr: 'Les dispatcheurs voyaient les créneaux décalés d’une heure quand le dépôt était dans un autre fuseau.',
    },
    today: {
      en: 'Windows were formatted in the browser’s timezone instead of the depot’s, causing missed slots.',
      fr: 'Les créneaux étaient formatés dans le fuseau du navigateur et non celui du dépôt, d’où des créneaux ratés.',
    },
    change: {
      en: 'Format every window with `depot.timezone` through one shared `formatWindow()` and show the zone.',
      fr: 'Formater chaque créneau avec `depot.timezone` via un `formatWindow()` partagé et afficher le fuseau.',
    },
    technical: [
      {
        en: '`packages/shared/src/time/formatWindow.ts` wraps `Intl.DateTimeFormat`',
        fr: '`packages/shared/src/time/formatWindow.ts` encapsule `Intl.DateTimeFormat`',
      },
      {
        en: "Passes `timeZone: depot.timezone` and `timeZoneName: 'short'`",
        fr: "Passe `timeZone: depot.timezone` et `timeZoneName: 'short'`",
      },
      {
        en: 'Four inline `toLocaleTimeString()` calls removed',
        fr: 'Quatre appels inline à `toLocaleTimeString()` supprimés',
      },
    ],
    whyNow: {
      en: 'A Sentry assertion on window mismatches fired 1,100 times after a customer opened a Lisbon depot.',
      fr: 'Une assertion Sentry sur les créneaux incohérents s’est déclenchée 1 100 fois après l’ouverture d’un dépôt à Lisbonne.',
    },
    evidence: [
      {
        en: '`formatWindow()` called `toLocaleTimeString()` without a `timeZone` option.',
        fr: '`formatWindow()` appelait `toLocaleTimeString()` sans option `timeZone`.',
      },
      {
        en: 'All affected sessions had a browser timezone different from the depot’s.',
        fr: 'Toutes les sessions touchées avaient un fuseau navigateur différent de celui du dépôt.',
      },
    ],
    plan: [
      {
        en: 'Create the shared `formatWindow(window, depot)` helper.',
        fr: 'Créer le helper partagé `formatWindow(window, depot)`.',
      },
      {
        en: 'Replace the four inline formatters with it.',
        fr: 'Remplacer les quatre formateurs inline par ce helper.',
      },
      {
        en: 'Unit-test across DST changes in three timezones.',
        fr: 'Tester unitairement les changements d’heure dans trois fuseaux.',
      },
    ],
    acceptance: [
      {
        en: 'Windows match the depot’s local time whatever the browser timezone.',
        fr: 'Les créneaux correspondent à l’heure locale du dépôt, quel que soit le fuseau du navigateur.',
      },
      {
        en: 'The Sentry issue stays resolved for 7 days.',
        fr: 'L’issue Sentry reste résolue pendant 7 jours.',
      },
    ],
    validation: {
      en: 'Unit tests run with `TZ` set to three zones in CI, then Sentry is watched for a week.',
      fr: 'Tests unitaires lancés avec `TZ` sur trois fuseaux en CI, puis Sentry surveillé pendant une semaine.',
    },
    watchFor: {
      en: 'CSV exports use a separate formatter and may still show browser time.',
      fr: 'Les exports CSV utilisent un autre formateur et peuvent encore afficher l’heure du navigateur.',
    },
    pr: {
      number: 1240,
      files: 9,
      additions: 174,
      deletions: 62,
      highlights: [
        {
          en: 'New `formatWindow()` in `packages/shared/src/time` with `Intl.DateTimeFormat`.',
          fr: 'Nouveau `formatWindow()` dans `packages/shared/src/time` basé sur `Intl.DateTimeFormat`.',
        },
        {
          en: 'Dispatch board, delivery drawer and print view now use the helper.',
          fr: 'Le tableau de dispatch, le panneau de livraison et la vue impression utilisent le helper.',
        },
        {
          en: 'CI matrix runs `formatWindow.test.ts` with `TZ=Europe/Lisbon`, `Europe/Zurich` and `America/New_York`.',
          fr: 'La matrice CI lance `formatWindow.test.ts` avec `TZ=Europe/Lisbon`, `Europe/Zurich` et `America/New_York`.',
        },
      ],
    },
  },

  {
    id: 'DOC-4',
    track: 'docs',
    initialStage: 'released',
    release: 'v2.13.1',
    title: {
      en: 'Driver app setup guide matches the real build steps',
      fr: 'Le guide d’installation de l’app chauffeur suit les vraies étapes de build',
    },
    tldr: {
      en: 'New developers were following steps that no longer worked.',
      fr: 'Les nouveaux développeurs suivaient des étapes qui ne marchaient plus.',
    },
    source: 'agent-run',
    area: 'driver-app',
    effort: 'S',
    confidence: 90,
    goal: {
      en: 'Let a new developer run the driver app locally by following the setup guide alone.',
      fr: 'Permettre à un nouveau développeur de lancer l’app chauffeur en local avec le seul guide d’installation.',
    },
    today: {
      en: 'The setup guide, the package scripts and the Node version file each tell a different story.',
      fr: 'Le guide d’installation, les scripts du package et le fichier de version Node racontent chacun autre chose.',
    },
    change: {
      en: 'Rewrite `apps/driver/README.md` from the real scripts and `.nvmrc`.',
      fr: 'Réécrire `apps/driver/README.md` à partir des vrais scripts et du `.nvmrc`.',
    },
    technical: [
      {
        en: '`yarn ios` replaced by `pnpm --filter driver ios`',
        fr: '`yarn ios` remplacé par `pnpm --filter driver ios`',
      },
      {
        en: 'Node 18 replaced by the version in `.nvmrc`',
        fr: 'Node 18 remplacé par la version du `.nvmrc`',
      },
    ],
    whyNow: {
      en: 'The daily docs run tried the guide’s commands against the repo and two of them failed.',
      fr: 'Le run docs quotidien a essayé les commandes du guide sur le repo et deux ont échoué.',
    },
    evidence: [
      {
        en: '`yarn ios` fails: the repo moved to pnpm workspaces.',
        fr: '`yarn ios` échoue : le repo est passé aux workspaces pnpm.',
      },
    ],
    inconsistencies: [
      {
        source: 'apps/driver/README.md',
        says: {
          en: 'Install Node 18, then run `yarn ios`.',
          fr: 'Installer Node 18, puis lancer `yarn ios`.',
        },
      },
      {
        source: 'apps/driver/package.json',
        says: {
          en: 'Scripts run through `pnpm`, and `engines.node` is `>=22`.',
          fr: 'Les scripts passent par `pnpm`, et `engines.node` vaut `>=22`.',
        },
      },
    ],
    plan: [
      {
        en: 'Rewrite the setup steps from `package.json` and `.nvmrc`.',
        fr: 'Réécrire les étapes depuis `package.json` et `.nvmrc`.',
      },
      {
        en: 'Remove the outdated Expo Go section.',
        fr: 'Supprimer la section Expo Go obsolète.',
      },
    ],
    acceptance: [
      {
        en: 'Every command in the guide runs on a fresh clone.',
        fr: 'Chaque commande du guide fonctionne sur un clone neuf.',
      },
    ],
    validation: {
      en: 'Follow the guide on a fresh clone and run the app in the iOS simulator.',
      fr: 'Suivre le guide sur un clone neuf et lancer l’app dans le simulateur iOS.',
    },
    watchFor: {
      en: 'The Android steps need a check on Windows, which the run could not test.',
      fr: 'Les étapes Android restent à vérifier sous Windows, ce que le run n’a pas pu tester.',
    },
    pr: {
      number: 1236,
      files: 1,
      additions: 38,
      deletions: 52,
      highlights: [
        {
          en: '`apps/driver/README.md` rewritten from the real scripts.',
          fr: '`apps/driver/README.md` réécrit à partir des vrais scripts.',
        },
      ],
    },
  },
  // ---------------------------------------------------------------- incoming
  {
    id: 'BUG-90',
    track: 'bug',
    initialStage: 'needs-decision',
    title: {
      en: 'Offline sync crashes when replaying a completed stop',
      fr: 'La sync hors ligne plante en rejouant un arrêt déjà validé',
    },
    tldr: {
      en: 'One 409 kills the whole offline queue.',
      fr: 'Un seul 409 bloque toute la file hors ligne.',
    },
    source: 'sentry',
    area: 'driver-app',
    effort: 'S',
    confidence: 81,
    goal: {
      en: 'The driver app crashes when its offline queue replays a stop the server already marked complete.',
      fr: 'L’app chauffeur plante quand sa file hors ligne rejoue un arrêt déjà validé côté serveur.',
    },
    today: {
      en: 'The API answers 409, the sync worker throws, and the rest of the queue is never sent.',
      fr: 'L’API répond 409, le worker de sync lève une erreur et le reste de la file n’est jamais envoyé.',
    },
    change: {
      en: 'Send an `Idempotency-Key` per queued mutation and handle `409` per item in `syncQueue.ts`.',
      fr: 'Envoyer un `Idempotency-Key` par mutation en file et gérer le `409` élément par élément dans `syncQueue.ts`.',
    },
    technical: [
      {
        en: '`syncQueue.ts`: `try/catch` per item instead of around the loop',
        fr: '`syncQueue.ts` : `try/catch` par élément au lieu d’autour de la boucle',
      },
      {
        en: '`Idempotency-Key: {mutationId}` header on `POST /stops/:id/complete`',
        fr: 'En-tête `Idempotency-Key: {mutationId}` sur `POST /stops/:id/complete`',
      },
      {
        en: 'API returns `409` with `reason: ALREADY_COMPLETED | REASSIGNED`',
        fr: 'L’API renvoie `409` avec `reason: ALREADY_COMPLETED | REASSIGNED`',
      },
    ],
    whyNow: {
      en: 'Sentry shows 87 crashes in two days in rural areas, and stuck queues hide completed deliveries.',
      fr: 'Sentry montre 87 crashs en deux jours en zone rurale, et les files bloquées masquent des livraisons faites.',
    },
    evidence: [
      {
        en: 'Sentry: `Unhandled promise rejection: Request failed with status code 409` in `syncQueue.ts`.',
        fr: 'Sentry : `Unhandled promise rejection: Request failed with status code 409` dans `syncQueue.ts`.',
      },
      {
        en: 'Breadcrumbs show a network drop right after the first completion request was sent.',
        fr: 'Les breadcrumbs montrent une coupure réseau juste après l’envoi de la première validation.',
      },
    ],
    plan: [
      {
        en: 'Generate a `mutationId` when an item is queued and send it as `Idempotency-Key`.',
        fr: 'Générer un `mutationId` à la mise en file et l’envoyer en `Idempotency-Key`.',
      },
      {
        en: 'Return a typed `reason` on `409` from `StopsController.complete()`.',
        fr: 'Renvoyer un `reason` typé sur le `409` de `StopsController.complete()`.',
      },
      {
        en: 'Handle errors per item in the sync worker and keep replaying.',
        fr: 'Gérer les erreurs élément par élément dans le worker de sync et continuer la file.',
      },
    ],
    acceptance: [
      {
        en: 'A duplicate completion is skipped and the remaining items sync.',
        fr: 'Une validation en double est ignorée et le reste de la file se synchronise.',
      },
      {
        en: 'No crash when connectivity drops mid-request.',
        fr: 'Aucun crash quand le réseau coupe en pleine requête.',
      },
    ],
    validation: {
      en: 'Unit test on the queue, then a field test toggling airplane mode during completion.',
      fr: 'Test unitaire de la file, puis test terrain en activant le mode avion pendant une validation.',
    },
    watchFor: {
      en: 'A 409 can also mean a dispatcher reassigned the stop, which must not be silently dropped.',
      fr: 'Un 409 peut aussi signifier qu’un dispatcheur a réaffecté l’arrêt, ce qui ne doit pas passer en silence.',
    },
    followUp: {
      question: {
        en: 'How many drivers are hitting this crash?',
        fr: 'Combien de chauffeurs subissent ce crash ?',
      },
      answer: {
        en: 'Sentry shows 37 drivers in the last 7 days, all on app 3.8 or later, mostly in depots with poor signal where the offline queue gets long.',
        fr: 'Sentry remonte 37 chauffeurs sur les 7 derniers jours, tous en version 3.8 ou plus, surtout dans des dépôts mal couverts où la file hors ligne s’allonge.',
      },
    },
    question: {
      prompt: {
        en: 'What should the app do when the stop was reassigned meanwhile?',
        fr: 'Que doit faire l’app si l’arrêt a été réaffecté entre-temps ?',
      },
      options: [
        {
          id: 'banner',
          label: {
            en: 'Skip it and show a banner to the driver',
            fr: 'L’ignorer et afficher un bandeau au chauffeur',
          },
          recommended: true,
          planNote: {
            en: 'On `REASSIGNED`, drop the item and show “Stop moved to another driver” in `SyncBanner`.',
            fr: 'Sur `REASSIGNED`, retirer l’élément et afficher « Arrêt transféré à un autre chauffeur » dans `SyncBanner`.',
          },
        },
        {
          id: 'dispatch',
          label: {
            en: 'Skip it and alert dispatch',
            fr: 'L’ignorer et alerter le dispatch',
          },
          planNote: {
            en: 'Post a `sync.conflict` event so the dispatch board flags the delivery for review.',
            fr: 'Publier un événement `sync.conflict` pour que le tableau de dispatch signale la livraison.',
          },
        },
        {
          id: 'silent',
          label: { en: 'Skip every 409 silently', fr: 'Ignorer tous les 409 en silence' },
          planNote: {
            en: 'Treat any `409` as done and only log it to Sentry as a breadcrumb.',
            fr: 'Traiter tout `409` comme terminé et le logger seulement en breadcrumb Sentry.',
          },
        },
      ],
    },
  },
  {
    id: 'FEAT-145',
    track: 'feature',
    initialStage: 'needs-decision',
    title: {
      en: 'SMS customers shortly before the driver arrives',
      fr: 'Prévenir le client par SMS juste avant l’arrivée du chauffeur',
    },
    tldr: {
      en: 'Fewer “not home” failures with a heads-up SMS.',
      fr: 'Moins d’absences grâce à un SMS de prévenance.',
    },
    source: 'user-feedback',
    area: 'api',
    effort: 'M',
    confidence: 71,
    goal: {
      en: 'Reduce failed deliveries by warning customers that the driver is about to arrive.',
      fr: 'Réduire les livraisons ratées en prévenant le client que le chauffeur arrive bientôt.',
    },
    today: {
      en: 'Customers only get the morning email with a 4-hour window, and 7% are not home.',
      fr: 'Le client ne reçoit que l’email du matin avec un créneau de 4 heures, et 7 % sont absents.',
    },
    change: {
      en: 'Emit `stop.approaching` from route progress and send an SMS with a signed tracking link.',
      fr: 'Émettre `stop.approaching` depuis la progression de tournée et envoyer un SMS avec un lien de suivi signé.',
    },
    technical: [
      {
        en: '`RouteProgressService` emits `stop.approaching` once per delivery',
        fr: '`RouteProgressService` émet `stop.approaching` une fois par livraison',
      },
      {
        en: '`NotificationsWorker` sends through the existing SMS provider, BullMQ queue `sms`',
        fr: '`NotificationsWorker` envoie via le prestataire SMS existant, file BullMQ `sms`',
      },
      {
        en: '`Tenant.settings.approachSms` flag, off by default',
        fr: 'Flag `Tenant.settings.approachSms`, désactivé par défaut',
      },
    ],
    whyNow: {
      en: 'Failed first attempts cost customers a second trip, and three accounts raised it in QBRs.',
      fr: 'Les premiers passages ratés coûtent un second trajet, et trois comptes l’ont soulevé en revue trimestrielle.',
    },
    evidence: [
      {
        en: '“Customer not home” is the top failure reason at 7.1% of attempts.',
        fr: '« Client absent » est la première cause d’échec, à 7,1 % des passages.',
      },
      {
        en: '6 feedback entries ask for a “driver is near” notification.',
        fr: '6 retours demandent une notification « chauffeur à proximité ».',
      },
    ],
    plan: [
      {
        en: 'Emit `stop.approaching` from `RouteProgressService`.',
        fr: 'Émettre `stop.approaching` depuis `RouteProgressService`.',
      },
      {
        en: 'Queue SMS sends with per-tenant opt-in and quiet hours.',
        fr: 'Mettre les SMS en file avec opt-in par tenant et heures de silence.',
      },
      {
        en: 'Add a tracking link signed for that delivery only.',
        fr: 'Ajouter un lien de suivi signé pour cette seule livraison.',
      },
    ],
    acceptance: [
      {
        en: 'Each customer receives at most one approach SMS per delivery.',
        fr: 'Chaque client reçoit au plus un SMS d’approche par livraison.',
      },
      {
        en: 'Tenants can turn the feature on or off in settings.',
        fr: 'Les tenants peuvent activer ou couper la fonctionnalité dans les réglages.',
      },
    ],
    validation: {
      en: 'Pilot with one tenant for two weeks and compare the “not home” rate against a control depot.',
      fr: 'Pilote avec un tenant pendant deux semaines, en comparant le taux d’absence à un dépôt témoin.',
    },
    watchFor: {
      en: 'SMS costs scale with volume, so sending must respect opt-outs and quiet hours.',
      fr: 'Le coût des SMS suit le volume, l’envoi doit donc respecter les désinscriptions et les heures de silence.',
    },
    followUp: {
      question: {
        en: 'What would the SMS cost each month?',
        fr: 'Combien coûteraient les SMS chaque mois ?',
      },
      answer: {
        en: 'At last month’s volume, about 42,000 SMS, so roughly CHF 2,100 with the current provider. Opt-outs and quiet hours take about a fifth off that.',
        fr: 'Au volume du mois dernier, environ 42 000 SMS, soit près de 2 100 CHF chez le fournisseur actuel. Les désinscriptions et les heures calmes en retirent environ un cinquième.',
      },
    },
    question: {
      prompt: {
        en: 'When should the approach SMS be sent?',
        fr: 'Quand envoyer le SMS d’approche ?',
      },
      options: [
        {
          id: 'two-stops',
          label: {
            en: 'When the driver is two stops away',
            fr: 'Quand le chauffeur est à deux arrêts',
          },
          recommended: true,
          planNote: {
            en: 'Trigger on completion of the stop two positions before the customer’s.',
            fr: 'Déclencher à la validation de l’arrêt situé deux positions avant celui du client.',
          },
        },
        {
          id: 'eta',
          label: {
            en: 'When the ETA drops under 15 minutes',
            fr: 'Quand l’ETA passe sous 15 minutes',
          },
          planNote: {
            en: 'Recompute ETA from live GPS every minute and trigger below 15 minutes.',
            fr: 'Recalculer l’ETA depuis le GPS chaque minute et déclencher sous 15 minutes.',
          },
        },
        {
          id: 'tenant',
          label: {
            en: 'Let each tenant choose',
            fr: 'Laisser chaque tenant choisir',
          },
          planNote: {
            en: "Add `approachSms.trigger: 'stops' | 'eta'` to tenant settings.",
            fr: "Ajouter `approachSms.trigger: 'stops' | 'eta'` aux réglages du tenant.",
          },
        },
      ],
    },
  },
  {
    id: 'SEC-14',
    track: 'security',
    initialStage: 'needs-decision',
    title: {
      en: 'Run API containers as non-root, read-only',
      fr: 'Faire tourner les conteneurs API en non-root et lecture seule',
    },
    tldr: {
      en: 'The API image still runs as root.',
      fr: 'L’image API tourne encore en root.',
    },
    source: 'agent-run',
    area: 'infra',
    effort: 'S',
    confidence: 83,
    goal: {
      en: 'Limit what an attacker could do if a vulnerability ever gave them code execution in the API.',
      fr: 'Limiter ce qu’un attaquant pourrait faire si une faille lui donnait un jour l’exécution de code dans l’API.',
    },
    today: {
      en: 'The API image runs as root with a writable filesystem and every Linux capability.',
      fr: 'L’image API tourne en root, avec un système de fichiers modifiable et toutes les capabilities Linux.',
    },
    change: {
      en: 'Add `USER node` to the Dockerfile and a restrictive `securityContext` to the API deployment.',
      fr: 'Ajouter `USER node` au Dockerfile et un `securityContext` restrictif au déploiement de l’API.',
    },
    technical: [
      {
        en: '`apps/api/Dockerfile`: `USER node`, `COPY --chown=node:node`',
        fr: '`apps/api/Dockerfile` : `USER node`, `COPY --chown=node:node`',
      },
      {
        en: '`runAsNonRoot: true`, `allowPrivilegeEscalation: false`, `drop: [ALL]`',
        fr: '`runAsNonRoot: true`, `allowPrivilegeEscalation: false`, `drop: [ALL]`',
      },
      {
        en: '`emptyDir` mounted on `/tmp` for upload buffering',
        fr: '`emptyDir` monté sur `/tmp` pour le buffer des uploads',
      },
    ],
    whyNow: {
      en: 'Trivy and `kube-score` flagged it, and a customer security questionnaire asks about it.',
      fr: 'Trivy et `kube-score` l’ont signalé, et un questionnaire sécurité client pose la question.',
    },
    evidence: [
      {
        en: '`kube-score`: container has no `runAsNonRoot` and allows privilege escalation.',
        fr: '`kube-score` : le conteneur n’a pas de `runAsNonRoot` et autorise l’escalade de privilèges.',
      },
      {
        en: '`apps/api/Dockerfile` has no `USER` instruction.',
        fr: '`apps/api/Dockerfile` n’a aucune instruction `USER`.',
      },
    ],
    plan: [
      {
        en: 'Add `USER node` and fix file ownership in the image.',
        fr: 'Ajouter `USER node` et corriger les droits des fichiers dans l’image.',
      },
      {
        en: 'Set the `securityContext` in `infra/k8s/api/deployment.yaml`.',
        fr: 'Définir le `securityContext` dans `infra/k8s/api/deployment.yaml`.',
      },
      {
        en: 'Mount an `emptyDir` on `/tmp`, where uploads and PDF exports are buffered.',
        fr: 'Monter un `emptyDir` sur `/tmp`, où transitent uploads et exports PDF.',
      },
    ],
    acceptance: [
      {
        en: '`kube-score` reports no security warnings for the API deployment.',
        fr: '`kube-score` ne remonte aucun avertissement sécurité sur le déploiement API.',
      },
      {
        en: 'Photo uploads and PDF exports still work on staging.',
        fr: 'Les uploads de photos et les exports PDF fonctionnent toujours en staging.',
      },
    ],
    validation: {
      en: 'Deploy to staging and run the API smoke suite, including uploads and exports.',
      fr: 'Déployer en staging et lancer la smoke suite API, uploads et exports compris.',
    },
    watchFor: {
      en: 'Any library writing to its install folder at runtime will fail on a read-only filesystem.',
      fr: 'Toute librairie qui écrit dans son dossier d’installation au runtime échouera en lecture seule.',
    },
    followUp: {
      question: {
        en: 'Does anything in the API write to disk at runtime?',
        fr: 'Quelque chose dans l’API écrit-il sur le disque à l’exécution ?',
      },
      answer: {
        en: 'Two things: `pdfkit` caches fonts in `/tmp`, and uploads are buffered in `/app/uploads`. The plan mounts both as `emptyDir` volumes.',
        fr: 'Deux choses : `pdfkit` met ses polices en cache dans `/tmp`, et les uploads transitent par `/app/uploads`. Le plan monte les deux en volumes `emptyDir`.',
      },
    },
    question: {
      prompt: {
        en: 'Ship the read-only filesystem now or in a second step?',
        fr: 'Passer en lecture seule maintenant ou dans un second temps ?',
      },
      options: [
        {
          id: 'both',
          label: {
            en: 'Non-root and read-only together',
            fr: 'Non-root et lecture seule ensemble',
          },
          recommended: true,
          planNote: {
            en: 'Set `readOnlyRootFilesystem: true` and run the smoke suite on staging before prod.',
            fr: 'Activer `readOnlyRootFilesystem: true` et lancer la smoke suite en staging avant la prod.',
          },
        },
        {
          id: 'staged',
          label: {
            en: 'Non-root now, read-only next sprint',
            fr: 'Non-root maintenant, lecture seule au prochain sprint',
          },
          planNote: {
            en: 'Ship `USER node` first and open a follow-up for `readOnlyRootFilesystem`.',
            fr: 'Livrer `USER node` d’abord et ouvrir un ticket de suivi pour `readOnlyRootFilesystem`.',
          },
        },
      ],
    },
  },
  {
    id: 'PERF-33',
    track: 'performance',
    initialStage: 'needs-decision',
    title: {
      en: 'Composite index for the deliveries board query',
      fr: 'Index composite pour la requête du tableau des livraisons',
    },
    tldr: {
      en: 'A 1.2 s sequential scan on 5 million rows.',
      fr: 'Un scan séquentiel de 1,2 s sur 5 millions de lignes.',
    },
    source: 'agent-run',
    area: 'api',
    effort: 'S',
    confidence: 87,
    goal: {
      en: 'Keep the deliveries table fast as the largest tenants pass 5 million deliveries.',
      fr: 'Garder le tableau des livraisons rapide alors que les plus gros tenants dépassent 5 millions de livraisons.',
    },
    today: {
      en: 'Filtering by tenant, status and date scans the whole deliveries table and takes about 1.2 s.',
      fr: 'Filtrer par tenant, statut et date parcourt toute la table des livraisons et prend environ 1,2 s.',
    },
    change: {
      en: 'Add `@@index([tenantId, status, scheduledAt])` and build it with `CREATE INDEX CONCURRENTLY`.',
      fr: 'Ajouter `@@index([tenantId, status, scheduledAt])` et le créer avec `CREATE INDEX CONCURRENTLY`.',
    },
    technical: [
      {
        en: '`schema.prisma`: `@@index([tenantId, status, scheduledAt])` on `Delivery`',
        fr: '`schema.prisma` : `@@index([tenantId, status, scheduledAt])` sur `Delivery`',
      },
      {
        en: 'Generated migration hand-edited to `CREATE INDEX CONCURRENTLY`',
        fr: 'Migration générée retouchée en `CREATE INDEX CONCURRENTLY`',
      },
      {
        en: 'Query in `DeliveriesRepository.search()` unchanged',
        fr: 'Requête de `DeliveriesRepository.search()` inchangée',
      },
    ],
    whyNow: {
      en: '`pg_stat_statements` ranks this query first by total time over the last 7 days.',
      fr: '`pg_stat_statements` classe cette requête en tête du temps total sur les 7 derniers jours.',
    },
    evidence: [
      {
        en: '`EXPLAIN ANALYZE` shows a sequential scan over 5.4 million rows.',
        fr: '`EXPLAIN ANALYZE` montre un scan séquentiel sur 5,4 millions de lignes.',
      },
      {
        en: 'The only existing index covers `tenant_id` alone.',
        fr: 'Le seul index existant ne couvre que `tenant_id`.',
      },
    ],
    plan: [
      {
        en: 'Declare the index in `schema.prisma` and run `prisma migrate dev --create-only`.',
        fr: 'Déclarer l’index dans `schema.prisma` et lancer `prisma migrate dev --create-only`.',
      },
      {
        en: 'Edit the SQL to build the index concurrently.',
        fr: 'Modifier le SQL pour créer l’index en concurrent.',
      },
      {
        en: 'Check the plan on a production-sized staging snapshot.',
        fr: 'Vérifier le plan sur un snapshot staging à la taille de la prod.',
      },
    ],
    acceptance: [
      {
        en: 'The query uses the new index and runs under 50 ms on staging.',
        fr: 'La requête utilise le nouvel index et passe sous 50 ms en staging.',
      },
      {
        en: 'The migration runs without blocking writes.',
        fr: 'La migration s’exécute sans bloquer les écritures.',
      },
    ],
    validation: {
      en: 'Compare `EXPLAIN ANALYZE` before and after, then watch query latency in production for a day.',
      fr: 'Comparer `EXPLAIN ANALYZE` avant et après, puis surveiller la latence en production pendant une journée.',
    },
    watchFor: {
      en: 'The index adds write overhead on deliveries, which matters during the morning import.',
      fr: 'L’index alourdit les écritures sur les livraisons, ce qui compte pendant l’import du matin.',
    },
    followUp: {
      question: {
        en: 'Will building the index slow down the morning import?',
        fr: 'La création de l’index va-t-elle ralentir l’import du matin ?',
      },
      answer: {
        en: '`CREATE INDEX CONCURRENTLY` does not block writes. On a staging copy it took 6 minutes and slowed writes by 4%, so the plan runs it at 14:00, well after the import.',
        fr: '`CREATE INDEX CONCURRENTLY` ne bloque pas les écritures. Sur une copie de staging, il a pris 6 minutes et ralenti les écritures de 4 % : le plan le lance à 14 h, bien après l’import.',
      },
    },
    question: {
      prompt: {
        en: 'What about the old `tenant_id` index?',
        fr: 'Que faire de l’ancien index `tenant_id` ?',
      },
      options: [
        {
          id: 'later',
          label: {
            en: 'Drop it in a follow-up after a week',
            fr: 'Le supprimer dans un suivi après une semaine',
          },
          recommended: true,
          planNote: {
            en: 'Check `pg_stat_user_indexes` after 7 days, then drop it with `DROP INDEX CONCURRENTLY`.',
            fr: 'Vérifier `pg_stat_user_indexes` après 7 jours, puis le supprimer avec `DROP INDEX CONCURRENTLY`.',
          },
        },
        {
          id: 'now',
          label: {
            en: 'Drop it in the same migration',
            fr: 'Le supprimer dans la même migration',
          },
          planNote: {
            en: 'Add `DROP INDEX CONCURRENTLY` after the new index is built.',
            fr: 'Ajouter `DROP INDEX CONCURRENTLY` une fois le nouvel index créé.',
          },
        },
        {
          id: 'keep',
          label: { en: 'Keep both', fr: 'Garder les deux' },
          planNote: {
            en: 'Leave `tenant_id` in place and note the extra write cost in `docs/database.md`.',
            fr: 'Laisser `tenant_id` en place et noter le surcoût d’écriture dans `docs/database.md`.',
          },
        },
      ],
    },
  },
  {
    id: 'DEP-44',
    track: 'dependencies',
    initialStage: 'needs-decision',
    title: {
      en: 'Migrate the dashboard from Tailwind CSS 3 to 4',
      fr: 'Migrer le dashboard de Tailwind CSS 3 à 4',
    },
    tldr: {
      en: 'CSS-first config, faster builds, a few renamed utilities.',
      fr: 'Config en CSS, builds plus rapides, quelques utilitaires renommés.',
    },
    source: 'agent-run',
    area: 'web',
    effort: 'M',
    confidence: 72,
    goal: {
      en: 'Move `apps/web` to Tailwind 4 so styling stays on the maintained major and builds get faster.',
      fr: 'Passer `apps/web` sur Tailwind 4 pour rester sur la version maintenue et accélérer les builds.',
    },
    today: {
      en: 'The dashboard uses Tailwind 3 with a 240-line JavaScript config and a custom PostCSS setup.',
      fr: 'Le dashboard utilise Tailwind 3 avec une config JavaScript de 240 lignes et un PostCSS maison.',
    },
    change: {
      en: 'Run `@tailwindcss/upgrade`, move theme tokens into `@theme` and swap the PostCSS plugin.',
      fr: 'Lancer `@tailwindcss/upgrade`, déplacer les tokens du thème dans `@theme` et changer de plugin PostCSS.',
    },
    technical: [
      {
        en: '`@tailwind base/components/utilities` → `@import "tailwindcss"`',
        fr: '`@tailwind base/components/utilities` → `@import "tailwindcss"`',
      },
      {
        en: '`tailwind.config.js` theme → `@theme { --color-brand: … }` in `globals.css`',
        fr: 'Thème de `tailwind.config.js` → `@theme { --color-brand: … }` dans `globals.css`',
      },
      {
        en: '`postcss.config.js`: `tailwindcss` → `@tailwindcss/postcss`',
        fr: '`postcss.config.js` : `tailwindcss` → `@tailwindcss/postcss`',
      },
      {
        en: 'Renames: `shadow-sm` → `shadow-xs`, `outline-none` → `outline-hidden`',
        fr: 'Renommages : `shadow-sm` → `shadow-xs`, `outline-none` → `outline-hidden`',
      },
    ],
    whyNow: {
      en: 'Two UI libraries the team wants to adopt now ship Tailwind 4 presets only.',
      fr: 'Deux librairies UI que l’équipe veut adopter ne fournissent plus que des presets Tailwind 4.',
    },
    evidence: [
      {
        en: '`pnpm outdated` shows `tailwindcss` 3.4.17 → 4.1.14.',
        fr: '`pnpm outdated` affiche `tailwindcss` 3.4.17 → 4.1.14.',
      },
      {
        en: '212 usages of `shadow`, `ring` or `border` without a colour may render differently.',
        fr: '212 usages de `shadow`, `ring` ou `border` sans couleur peuvent changer de rendu.',
      },
    ],
    plan: [
      {
        en: 'Run `pnpm dlx @tailwindcss/upgrade` on a dedicated branch.',
        fr: 'Lancer `pnpm dlx @tailwindcss/upgrade` sur une branche dédiée.',
      },
      {
        en: 'Review the default `border` colour, now `currentColor`, and the 1px `ring` default.',
        fr: 'Revoir la couleur de `border` par défaut, désormais `currentColor`, et le `ring` passé à 1px.',
      },
      {
        en: 'Delete `tailwind.config.js` once every token lives in `@theme`.',
        fr: 'Supprimer `tailwind.config.js` une fois tous les tokens dans `@theme`.',
      },
    ],
    acceptance: [
      {
        en: 'Visual regression shows no unintended diffs on the 12 main screens.',
        fr: 'La régression visuelle ne montre aucun écart involontaire sur les 12 écrans principaux.',
      },
      {
        en: 'Focus outlines stay visible on every interactive element.',
        fr: 'Les contours de focus restent visibles sur chaque élément interactif.',
      },
    ],
    validation: {
      en: 'Playwright screenshot diffs on the preview deployment, plus a keyboard pass on forms.',
      fr: 'Diffs de captures Playwright sur la preview, et un passage clavier sur les formulaires.',
    },
    watchFor: {
      en: 'Tailwind 4 targets Safari 16.4+, and some depot kiosks still run older iPads.',
      fr: 'Tailwind 4 vise Safari 16.4+, et certaines bornes de dépôt tournent encore sur de vieux iPad.',
    },
    migration: { pkg: 'tailwindcss', from: '3.4.17', to: '4.1.14' },
    followUp: {
      question: {
        en: 'How many kiosks still run Safari older than 16.4?',
        fr: 'Combien de bornes tournent encore sur un Safari antérieur à 16.4 ?',
      },
      answer: {
        en: 'Device telemetry lists 11 of the 140 kiosks, across 4 depots. Operations plans to replace them by March.',
        fr: 'La télémétrie des appareils en compte 11 sur 140, réparties dans 4 dépôts. Les opérations prévoient de les remplacer d’ici mars.',
      },
    },
    question: {
      prompt: {
        en: 'How should the theme config be handled?',
        fr: 'Comment gérer la config du thème ?',
      },
      options: [
        {
          id: 'css-first',
          label: {
            en: 'Move everything to `@theme` now',
            fr: 'Tout passer dans `@theme` maintenant',
          },
          recommended: true,
          planNote: {
            en: 'Port all tokens to CSS variables in `@theme` and delete `tailwind.config.js` in the same PR.',
            fr: 'Porter tous les tokens en variables CSS dans `@theme` et supprimer `tailwind.config.js` dans la même PR.',
          },
        },
        {
          id: 'legacy-config',
          label: {
            en: 'Keep the JS config via `@config`',
            fr: 'Garder la config JS via `@config`',
          },
          planNote: {
            en: 'Load the old file with `@config "./tailwind.config.js"` and port tokens later.',
            fr: 'Charger l’ancien fichier avec `@config "./tailwind.config.js"` et porter les tokens plus tard.',
          },
        },
        {
          id: 'wait',
          label: {
            en: 'Wait until old kiosks are replaced',
            fr: 'Attendre le remplacement des vieilles bornes',
          },
          planNote: {
            en: 'Pin `tailwindcss@3` and revisit when depot hardware is upgraded.',
            fr: 'Figer `tailwindcss@3` et revoir quand le matériel des dépôts sera renouvelé.',
          },
        },
      ],
    },
  },
  {
    id: 'DOC-9',
    track: 'docs',
    initialStage: 'needs-decision',
    title: {
      en: 'Refund window: 14 days in the docs, 30 in the code',
      fr: 'Délai de remboursement : 14 jours dans les docs, 30 dans le code',
    },
    tldr: {
      en: 'Support and the API disagree on refund eligibility.',
      fr: 'Le support et l’API ne sont pas d’accord sur les remboursements.',
    },
    source: 'agent-run',
    area: 'api',
    effort: 'S',
    confidence: 79,
    goal: {
      en: 'Have one refund window that the knowledge base, the docs and the API all agree on.',
      fr: 'Avoir un seul délai de remboursement partagé par la base de connaissances, les docs et l’API.',
    },
    today: {
      en: 'Support refuses refunds after 14 days, while the API accepts self-serve requests for 30.',
      fr: 'Le support refuse les remboursements après 14 jours, alors que l’API accepte les demandes en libre-service jusqu’à 30.',
    },
    change: {
      en: 'Align `REFUND_WINDOW_DAYS`, `docs/billing.md` and the Notion page on the rule you pick.',
      fr: 'Aligner `REFUND_WINDOW_DAYS`, `docs/billing.md` et la page Notion sur la règle choisie.',
    },
    technical: [
      {
        en: '`REFUND_WINDOW_DAYS` moved to `packages/shared/src/billing.ts`',
        fr: '`REFUND_WINDOW_DAYS` déplacé dans `packages/shared/src/billing.ts`',
      },
      {
        en: '`RefundService.isEligible()` and the web billing page read it',
        fr: '`RefundService.isEligible()` et la page facturation web le lisent',
      },
      {
        en: 'Boundary tests at day 14, 15, 30 and 31',
        fr: 'Tests aux bornes à J14, J15, J30 et J31',
      },
    ],
    whyNow: {
      en: 'A customer got a refund through the app that support had refused by email the day before.',
      fr: 'Un client a obtenu via l’app un remboursement que le support lui avait refusé par email la veille.',
    },
    evidence: [
      {
        en: '41 self-serve refunds were approved between day 15 and day 30 last quarter.',
        fr: '41 remboursements en libre-service ont été accordés entre J15 et J30 le trimestre dernier.',
      },
      {
        en: '`git blame` shows the constant changed from 14 to 30 in a 2024 hotfix with no docs update.',
        fr: '`git blame` montre la constante passée de 14 à 30 dans un hotfix de 2024, sans mise à jour des docs.',
      },
    ],
    inconsistencies: [
      {
        source: 'Notion › Refund policy',
        says: {
          en: 'Refunds can be requested within 14 days of the invoice date.',
          fr: 'Un remboursement peut être demandé dans les 14 jours suivant la date de facture.',
        },
      },
      {
        source: 'docs/billing.md',
        says: {
          en: '“Customers have 14 days to request a refund from the billing page.”',
          fr: '« Le client a 14 jours pour demander un remboursement depuis la page facturation. »',
        },
      },
      {
        source: 'apps/api/src/invoices/refund.service.ts:57',
        says: {
          en: '`const REFUND_WINDOW_DAYS = 30`, checked against `invoice.issuedAt`.',
          fr: '`const REFUND_WINDOW_DAYS = 30`, comparé à `invoice.issuedAt`.',
        },
      },
    ],
    plan: [
      {
        en: 'Move the constant to `packages/shared` so web and API share it.',
        fr: 'Déplacer la constante dans `packages/shared` pour que web et API la partagent.',
      },
      {
        en: 'Update `docs/billing.md` and flag the Notion page owner.',
        fr: 'Mettre à jour `docs/billing.md` et prévenir le propriétaire de la page Notion.',
      },
      {
        en: 'Add boundary tests to `refund.service.spec.ts`.',
        fr: 'Ajouter des tests aux bornes dans `refund.service.spec.ts`.',
      },
    ],
    acceptance: [
      {
        en: 'The knowledge base, docs and API state the same refund window.',
        fr: 'Base de connaissances, docs et API indiquent le même délai de remboursement.',
      },
      {
        en: 'The billing page shows the remaining days before the window closes.',
        fr: 'La page facturation affiche les jours restants avant la fin du délai.',
      },
    ],
    validation: {
      en: 'Unit tests on `isEligible()` at each boundary, then a check that support macros quote the new value.',
      fr: 'Tests unitaires sur `isEligible()` à chaque borne, puis vérification que les macros support citent la nouvelle valeur.',
    },
    watchFor: {
      en: 'The refund window may also be written into enterprise contracts, which code cannot override.',
      fr: 'Le délai peut aussi figurer dans les contrats grands comptes, que le code ne peut pas contredire.',
    },
    followUp: {
      question: {
        en: 'Which window do the enterprise contracts mention?',
        fr: 'Quelle durée mentionnent les contrats entreprise ?',
      },
      answer: {
        en: 'The contract template in `legal/enterprise-terms.md` says 30 days: it matches the code, not the support docs.',
        fr: 'Le modèle de contrat dans `legal/enterprise-terms.md` indique 30 jours : il rejoint le code, pas la doc du support.',
      },
    },
    question: {
      prompt: {
        en: 'Which refund window is correct?',
        fr: 'Quel délai de remboursement est le bon ?',
      },
      options: [
        {
          id: 'po',
          label: {
            en: 'Ask the product owner',
            fr: 'Demander au product owner',
          },
          recommended: true,
          planNote: {
            en: 'Send the three sources and the 41 late refunds to product and finance, then apply their answer.',
            fr: 'Envoyer les trois sources et les 41 remboursements tardifs au produit et à la finance, puis appliquer leur réponse.',
          },
        },
        {
          id: 'docs',
          label: {
            en: 'Docs are right (14 days), fix the code',
            fr: 'Les docs ont raison (14 jours), corriger le code',
          },
          planNote: {
            en: 'Set `REFUND_WINDOW_DAYS = 14` and show the deadline on the billing page.',
            fr: 'Passer `REFUND_WINDOW_DAYS = 14` et afficher l’échéance sur la page facturation.',
          },
        },
        {
          id: 'code',
          label: {
            en: 'Code is right (30 days), update the docs',
            fr: 'Le code a raison (30 jours), mettre à jour les docs',
          },
          planNote: {
            en: 'Keep 30, rewrite `docs/billing.md` and ask support to update the Notion page.',
            fr: 'Garder 30, réécrire `docs/billing.md` et demander au support de mettre à jour la page Notion.',
          },
        },
      ],
    },
  },
];
