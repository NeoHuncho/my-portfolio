import { type Ticket } from './board';

/**
 * Pomi's radar, replayed: each ticket is a real GitHub issue on Host-It-Labs/pomi (the id
 * carries its number) with its real pull request and release. Only the docs tickets are
 * made up, and they say so (`illustrative`).
 */
export const boardTickets: Ticket[] = [
  // ---------------------------------------------------------------- needs-decision
  {
    id: 'FEAT-300',
    track: 'feature',
    initialStage: 'needs-decision',
    title: {
      en: 'Export and restore your Pomi data',
      fr: 'Exporter et restaurer ses données Pomi',
    },
    tldr: {
      en: 'Back up your own data from Settings and restore it safely.',
      fr: 'Sauvegarder ses données depuis les paramètres et les restaurer sans risque.',
    },
    source: 'user-feedback',
    area: 'backend',
    effort: 'L',
    goal: {
      en: 'Let any signed-in user download their Pomi data and restore it later from Settings → General → More options.',
      fr: 'Permettre à tout utilisateur connecté de télécharger ses données Pomi et de les restaurer plus tard depuis Paramètres → Général → Plus d’options.',
    },
    today: {
      en: 'Export and import exist only in the Debug panel, for admins, and copy raw database rows, debug logs included.',
      fr: 'L’export et l’import n’existent que dans le panneau de debug, réservé aux admins, et copient les lignes brutes de la base, logs de debug compris.',
    },
    change: {
      en: 'Add Export data and Import data under More options, backed by a versioned personal format and a preview before anything is replaced.',
      fr: 'Ajouter « Exporter les données » et « Importer les données » sous Plus d’options, avec un format personnel versionné et un aperçu avant tout remplacement.',
    },
    technical: [
      {
        en: '`GeneralSettings.tsx`: two controls in `ExtrasSection`, also listed in Settings search',
        fr: '`GeneralSettings.tsx` : deux contrôles dans `ExtrasSection`, aussi listés dans la recherche des paramètres',
      },
      {
        en: 'Strict schemas in `packages/shared/src/api/contract.ts` replace rows typed `z.record(z.string(), z.unknown())`',
        fr: 'Des schémas stricts dans `packages/shared/src/api/contract.ts` remplacent les lignes typées `z.record(z.string(), z.unknown())`',
      },
      {
        en: 'New account-scoped endpoints; the admin dump in `SystemController` keeps `AdminGuard`',
        fr: 'Nouveaux endpoints limités au compte ; le dump admin de `SystemController` garde `AdminGuard`',
      },
      {
        en: '`USER_DATA_IMPORT_JSON_LIMIT` (50 MB today) checked before the file is read and before it is parsed',
        fr: '`USER_DATA_IMPORT_JSON_LIMIT` (50 Mo aujourd’hui) vérifié avant la lecture du fichier et avant son parsing',
      },
    ],
    whyNow: {
      en: 'Asked for in voice feedback, with one condition: both export and import must be secure.',
      fr: 'Demandé dans un retour vocal, avec une condition : l’export comme l’import doivent être sûrs.',
    },
    evidence: [
      {
        en: '`exportUserData()` and `importUserData()` in `SystemController` both require `AdminGuard`.',
        fr: '`exportUserData()` et `importUserData()` dans `SystemController` exigent tous deux `AdminGuard`.',
      },
      {
        en: '`UserDataTransferService` copies whole entity rows, and the shared contract accepts any key in a row.',
        fr: '`UserDataTransferService` copie des lignes d’entités entières, et le contrat partagé accepte n’importe quelle clé.',
      },
    ],
    plan: [
      {
        en: 'Add Export data and Import data to General → More options and to Settings search.',
        fr: 'Ajouter « Exporter les données » et « Importer les données » dans Général → Plus d’options et dans la recherche.',
      },
      {
        en: 'Define a versioned personal format: tasks with follow-ups and history, lists, intentions, stats, vacation and preferences.',
        fr: 'Définir un format personnel versionné : tâches avec suivis et historique, listes, intentions, stats, vacances et préférences.',
      },
      {
        en: 'Validate the whole file and remap every id to the signed-in account before deleting anything.',
        fr: 'Valider tout le fichier et réattribuer chaque id au compte connecté avant de supprimer quoi que ce soit.',
      },
      {
        en: 'Preview the destination account and counts, offer an export first, and require explicit confirmation.',
        fr: 'Afficher le compte de destination et les volumes, proposer d’exporter d’abord, puis exiger une confirmation explicite.',
      },
    ],
    acceptance: [
      {
        en: 'Any signed-in user can find Export data and Import data, including through search.',
        fr: 'Tout utilisateur connecté trouve l’export et l’import, y compris via la recherche.',
      },
      {
        en: 'Exports never contain passwords, tokens, privileged settings or security telemetry.',
        fr: 'Les exports ne contiennent jamais de mots de passe, de tokens, de réglages privilégiés ni de télémétrie de sécurité.',
      },
      {
        en: 'Import checks every field and link first; the file never chooses the destination account.',
        fr: 'L’import vérifie d’abord chaque champ et chaque lien ; le fichier ne choisit jamais le compte de destination.',
      },
      {
        en: 'A failed import keeps or recovers existing data and never reports success.',
        fr: 'Un import en échec conserve ou récupère les données existantes et n’annonce jamais de succès.',
      },
    ],
    validation: {
      en: 'Schema unit tests, then Nest and Supertest on PostgreSQL and Redis: non-admin access, two accounts, hostile files and full round trips.',
      fr: 'Tests unitaires des schémas, puis Nest et Supertest sur PostgreSQL et Redis : accès non admin, deux comptes, fichiers malveillants et allers-retours complets.',
    },
    watchFor: {
      en: '`importUserData()` commits PostgreSQL before restoring the timer in Redis, so a Redis failure can leave half a restore.',
      fr: '`importUserData()` valide la transaction PostgreSQL avant de restaurer le minuteur dans Redis : une panne Redis peut laisser une restauration à moitié faite.',
    },
    followUp: {
      question: {
        en: 'Will the backup file be encrypted?',
        fr: 'Le fichier de sauvegarde sera-t-il chiffré ?',
      },
      answer: {
        en: 'No. It is a plain JSON file, and the preview says it holds private data. Passwords, tokens, roles, AI settings and debug logs are never in it, and the file cannot choose which account it restores into.',
        fr: 'Non. C’est un simple fichier JSON, et l’aperçu prévient qu’il contient des données privées. Mots de passe, tokens, rôles, réglages IA et logs de debug n’y figurent jamais, et le fichier ne peut pas choisir le compte où il est restauré.',
      },
    },
    question: {
      prompt: {
        en: 'Build a new personal format, or open the existing admin export to everyone?',
        fr: 'Créer un format personnel, ou ouvrir à tous l’export admin existant ?',
      },
      options: [
        {
          id: 'personal',
          label: { en: 'New personal format', fr: 'Nouveau format personnel' },
          recommended: true,
          planNote: {
            en: 'Write explicit, versioned serializers for personal data only; the admin dump stays behind `AdminGuard`.',
            fr: 'Écrire des sérialiseurs explicites et versionnés pour les seules données personnelles ; le dump admin reste derrière `AdminGuard`.',
          },
        },
        {
          id: 'reuse',
          label: { en: 'Reuse the admin export', fr: 'Réutiliser l’export admin' },
          planNote: {
            en: 'Drop `AdminGuard` and reuse `UserDataTransferService` as is; debug logs and usage records stay in the file.',
            fr: 'Retirer `AdminGuard` et réutiliser `UserDataTransferService` tel quel ; logs de debug et données d’usage restent dans le fichier.',
          },
        },
      ],
    },
  },
  {
    id: 'SEC-236',
    track: 'security',
    initialStage: 'needs-decision',
    title: {
      en: 'Move production secrets into mounted files',
      fr: 'Passer les secrets de production en fichiers montés',
    },
    tldr: {
      en: 'Production passwords and keys sit in plain container environments.',
      fr: 'Les mots de passe et clés de production traînent dans l’environnement des conteneurs.',
    },
    source: 'agent-run',
    area: 'backend',
    effort: 'L',
    goal: {
      en: 'Give each production service only the credentials it needs, as read-only files instead of environment variables.',
      fr: 'Ne donner à chaque service de production que les identifiants dont il a besoin, en fichiers en lecture seule plutôt qu’en variables d’environnement.',
    },
    today: {
      en: '`docker-compose.yml` puts database, Redis, JWT and provider secrets in service environments. Only the APNs key arrives as a read-only file.',
      fr: '`docker-compose.yml` place les secrets de la base, de Redis, JWT et des fournisseurs dans l’environnement des services. Seule la clé APNs arrive en fichier en lecture seule.',
    },
    change: {
      en: 'Read every secret from a file mounted only into the service that uses it, and keep plain settings in the environment.',
      fr: 'Lire chaque secret depuis un fichier monté uniquement dans le service qui l’utilise, et ne garder que les réglages non sensibles dans l’environnement.',
    },
    technical: [
      {
        en: '`validateEnvironment` reads each secret from its mounted file first',
        fr: '`validateEnvironment` lit d’abord chaque secret depuis son fichier monté',
      },
      {
        en: '`docker-compose.yml`: Compose secrets mounted per service, read-only',
        fr: '`docker-compose.yml` : secrets Compose montés par service, en lecture seule',
      },
      {
        en: 'Redis stops taking its password through `--requirepass` on the command line and in its health check',
        fr: 'Redis ne reçoit plus son mot de passe via `--requirepass` en ligne de commande ni dans son health check',
      },
      {
        en: 'The GitHub App key and Firebase JSON reuse `GITHUB_FEEDBACK_APP_PRIVATE_KEY_PATH` and `FIREBASE_SERVICE_ACCOUNT_PATH`',
        fr: 'La clé de la GitHub App et le JSON Firebase réutilisent `GITHUB_FEEDBACK_APP_PRIVATE_KEY_PATH` et `FIREBASE_SERVICE_ACCOUNT_PATH`',
      },
    ],
    whyNow: {
      en: 'Anything that can inspect the containers can read the database, Redis, JWT, OpenRouter, GitHub App and Firebase secrets.',
      fr: 'Tout ce qui peut inspecter les conteneurs peut lire les secrets de la base, de Redis, JWT, OpenRouter, de la GitHub App et de Firebase.',
    },
    evidence: [
      {
        en: '`docker-compose.yml` injects `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `JWT_SECRET`, `OPENROUTER_API_KEY`, `GITHUB_FEEDBACK_APP_PRIVATE_KEY` and `FIREBASE_SERVICE_ACCOUNT_JSON`.',
        fr: '`docker-compose.yml` injecte `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `JWT_SECRET`, `OPENROUTER_API_KEY`, `GITHUB_FEEDBACK_APP_PRIVATE_KEY` et `FIREBASE_SERVICE_ACCOUNT_JSON`.',
      },
      {
        en: 'The Redis password also appears in its start command and health check.',
        fr: 'Le mot de passe Redis apparaît aussi dans sa commande de démarrage et son health check.',
      },
      {
        en: 'The APNs key already uses a read-only mount at `/run/secrets/pomi-apns-key.p8`.',
        fr: 'La clé APNs passe déjà par un montage en lecture seule sur `/run/secrets/pomi-apns-key.p8`.',
      },
    ],
    plan: [
      {
        en: 'Add one secret-file reader to `packages/backend/src/config/environment.ts` and route every credential through it.',
        fr: 'Ajouter un lecteur de fichiers secrets unique à `packages/backend/src/config/environment.ts` et y faire passer chaque identifiant.',
      },
      {
        en: 'Declare Compose secrets in `packages/backend/docker-compose.yml`, each mounted only where it is used.',
        fr: 'Déclarer des secrets Compose dans `packages/backend/docker-compose.yml`, chacun monté seulement là où il sert.',
      },
      {
        en: 'Keep reading old env values for a bounded window, with a warning that never logs the value.',
        fr: 'Continuer à lire les anciennes variables pendant une période bornée, avec un avertissement qui n’affiche jamais la valeur.',
      },
      {
        en: 'Document the upgrade and the rotation of each secret in `docs/self-hosting.md`.',
        fr: 'Documenter la mise à jour et la rotation de chaque secret dans `docs/self-hosting.md`.',
      },
    ],
    acceptance: [
      {
        en: 'No raw database, auth, provider or signing secret appears in a production container’s environment.',
        fr: 'Aucun secret brut de base, d’authentification, de fournisseur ou de signature n’apparaît dans l’environnement d’un conteneur de production.',
      },
      {
        en: 'Each service gets only the secret files its role needs.',
        fr: 'Chaque service ne reçoit que les fichiers secrets utiles à son rôle.',
      },
      {
        en: 'Fresh installs and documented upgrades work with restrictive file permissions.',
        fr: 'Les nouvelles installations et les mises à jour documentées fonctionnent avec des permissions de fichiers restrictives.',
      },
      {
        en: 'Legacy env support is time-bounded, only warns, and never logs values.',
        fr: 'Le support des anciennes variables est limité dans le temps, se contente d’avertir et ne journalise jamais les valeurs.',
      },
    ],
    validation: {
      en: 'Render the Compose config, inspect each container’s environment and mounts, rotate every secret, then test a fresh install and an upgrade.',
      fr: 'Générer la config Compose, inspecter l’environnement et les montages de chaque conteneur, faire tourner chaque secret, puis tester une installation neuve et une mise à jour.',
    },
    watchFor: {
      en: 'Postgres only applies its password when it creates the data directory, so the mounted file must hold the value the existing database already uses.',
      fr: 'Postgres n’applique son mot de passe qu’à la création du répertoire de données : le fichier monté doit contenir la valeur déjà utilisée par la base existante.',
    },
    followUp: {
      question: {
        en: 'Does anything in Pomi already work this way?',
        fr: 'Est-ce que quelque chose fonctionne déjà comme ça dans Pomi ?',
      },
      answer: {
        en: 'Yes, the APNs key: Compose mounts the `.p8` file read-only and `notifications.service.ts` reads it from `APN_KEY_PATH`. The GitHub App key and Firebase JSON can already be read from a path too; Compose just passes them inline today.',
        fr: 'Oui, la clé APNs : Compose monte le fichier `.p8` en lecture seule et `notifications.service.ts` le lit via `APN_KEY_PATH`. La clé de la GitHub App et le JSON Firebase savent déjà se lire depuis un chemin ; Compose les passe simplement en clair aujourd’hui.',
      },
    },
    question: {
      prompt: {
        en: 'How long should old environment values keep working?',
        fr: 'Combien de temps les anciennes variables d’environnement doivent-elles rester acceptées ?',
      },
      options: [
        {
          id: 'window',
          label: {
            en: 'Until a set date, with a warning',
            fr: 'Jusqu’à une date fixée, avec un avertissement',
          },
          recommended: true,
          planNote: {
            en: 'Accept legacy env values until a cutoff date, as `POMI_LEGACY_JWT_MIGRATION_UNTIL` does for old tokens, and warn at startup without printing them.',
            fr: 'Accepter les anciennes variables jusqu’à une date limite, comme `POMI_LEGACY_JWT_MIGRATION_UNTIL` pour les anciens tokens, et avertir au démarrage sans les afficher.',
          },
        },
        {
          id: 'files-only',
          label: {
            en: 'Files only, from this release',
            fr: 'Fichiers uniquement, dès cette release',
          },
          planNote: {
            en: 'Refuse to start when a raw secret is set in the environment, and explain the switch in the upgrade notes.',
            fr: 'Refuser de démarrer si un secret brut est présent dans l’environnement, et expliquer le changement dans les notes de mise à jour.',
          },
        },
      ],
    },
  },
  {
    id: 'BUG-277',
    track: 'bug',
    initialStage: 'needs-decision',
    title: {
      en: 'Avoid repeated Keychain prompts after reinstall',
      fr: 'Éviter les demandes répétées du trousseau après réinstallation',
    },
    tldr: {
      en: 'Reinstalling the Mac app should not ask for the Keychain password every time.',
      fr: 'Réinstaller l’app Mac ne devrait pas redemander le mot de passe du trousseau à chaque fois.',
    },
    source: 'user-feedback',
    area: 'native',
    effort: 'M',
    goal: {
      en: 'Each reinstall of the Mac app asks for the account password so Pomi can read its Keychain item, which could worry a new user.',
      fr: 'Chaque réinstallation de l’app Mac demande le mot de passe du compte pour que Pomi lise son élément du trousseau, de quoi inquiéter un nouvel utilisateur.',
    },
    today: {
      en: 'The refresh session lives in the Keychain, and macOS release builds carry no Apple signing identity yet.',
      fr: 'La session de rafraîchissement est stockée dans le trousseau, et les builds macOS ne portent pas encore d’identité de signature Apple.',
    },
    change: {
      en: 'Reproduce on signed builds, then fix only the proven cause: a drifting signing identity or redundant Keychain writes.',
      fr: 'Reproduire sur des builds signés, puis corriger seulement la cause prouvée : une identité de signature instable ou des écritures redondantes dans le trousseau.',
    },
    technical: [
      {
        en: '`refreshCredentialStore.ts` stores the token through `tauri-plugin-keyring-api` under `app.pomi.community.refresh-session`',
        fr: '`refreshCredentialStore.ts` stocke le token via `tauri-plugin-keyring-api` sous `app.pomi.community.refresh-session`',
      },
      {
        en: '`authStore.ts`: `refreshSession()` reads it, `acceptSession()` writes each new one',
        fr: '`authStore.ts` : `refreshSession()` le lit, `acceptSession()` écrit chaque nouveau token',
      },
      {
        en: '`release.yml` runs a plain `pnpm tauri build` for macOS, with no signing step until #234',
        fr: '`release.yml` lance un simple `pnpm tauri build` pour macOS, sans étape de signature avant #234',
      },
    ],
    whyNow: {
      en: 'Raised in voice feedback: a Keychain password prompt could worry new users.',
      fr: 'Remonté dans un retour vocal : une demande de mot de passe du trousseau peut inquiéter de nouveaux utilisateurs.',
    },
    evidence: [
      {
        en: 'A comment in `refreshCredentialStore.ts` already notes that rebuilt binaries have unstable Keychain identities.',
        fr: 'Un commentaire de `refreshCredentialStore.ts` note déjà que les binaires recompilés ont une identité instable pour le trousseau.',
      },
      {
        en: 'The feedback does not say which build was installed, and local `pnpm release:macos` builds pass `--no-sign`.',
        fr: 'Le retour ne précise pas quel build était installé, et les builds locaux `pnpm release:macos` passent `--no-sign`.',
      },
    ],
    plan: [
      {
        en: 'Reinstall and upgrade signed builds; record the prompt, signing team, identifier and designated requirement.',
        fr: 'Réinstaller et mettre à jour des builds signés ; noter la demande, l’équipe de signature, l’identifiant et l’exigence de signature (designated requirement).',
      },
      {
        en: 'If the identity drifts, fix release signing; if extra writes cause it, remove only those and keep token rotation.',
        fr: 'Si l’identité change, corriger la signature des releases ; si des écritures en trop en sont la cause, retirer seulement celles-là sans casser la rotation des tokens.',
      },
      {
        en: 'Keep tokens in secure native storage; if signed builds still prompt, explain it instead of bypassing it.',
        fr: 'Garder les tokens dans le stockage natif sécurisé ; si des builds signés demandent encore, l’expliquer plutôt que de le contourner.',
      },
    ],
    acceptance: [
      {
        en: 'Upgrading between signed releases keeps the session with no avoidable prompt.',
        fr: 'Passer d’une release signée à l’autre conserve la session sans demande évitable.',
      },
      {
        en: 'A locked or denied Keychain leaves the session recoverable.',
        fr: 'Un trousseau verrouillé ou un accès refusé laisse la session récupérable.',
      },
      {
        en: 'Refresh tokens stay in secure native storage.',
        fr: 'Les tokens de rafraîchissement restent dans le stockage natif sécurisé.',
      },
    ],
    validation: {
      en: 'On macOS: two signed releases, a same-version reinstall, a locked Keychain, denied access, logout and restart. Unit tests alone do not count as a fix.',
      fr: 'Sur macOS : deux releases signées, une réinstallation de la même version, un trousseau verrouillé, un accès refusé, une déconnexion et un redémarrage. Les tests unitaires seuls ne valent pas correctif.',
    },
    watchFor: {
      en: 'macOS can legitimately ask again; never loosen Keychain access rules or move the token to plain storage.',
      fr: 'macOS peut légitimement redemander ; ne jamais assouplir les règles d’accès du trousseau ni déplacer le token vers un stockage en clair.',
    },
    followUp: {
      question: {
        en: 'Why do we need this Keychain prompt at all?',
        fr: 'Pourquoi a-t-on besoin de cette demande du trousseau ?',
      },
      answer: {
        en: 'Pomi keeps the refresh session in the Keychain so you stay signed in across restarts without it sitting in plain app storage. The prompt is macOS asking whether this app may read that item. Secure storage is needed; a prompt after every reinstall is not.',
        fr: 'Pomi garde la session de rafraîchissement dans le trousseau pour rester connecté entre deux redémarrages sans la laisser en clair dans l’app. La demande, c’est macOS qui vérifie que cette app peut lire l’élément. Le stockage sécurisé est nécessaire ; une demande à chaque réinstallation, non.',
      },
    },
    question: {
      prompt: {
        en: 'macOS releases are not Apple-signed yet (#234). Where should this start?',
        fr: 'Les releases macOS ne sont pas encore signées par Apple (#234). Par où commencer ?',
      },
      options: [
        {
          id: 'with-signing',
          label: { en: 'Together with signing (#234)', fr: 'Avec la signature (#234)' },
          recommended: true,
          planNote: {
            en: 'Run the reinstall tests on builds signed through #234, then fix only the cause they show.',
            fr: 'Lancer les tests de réinstallation sur des builds signés via #234, puis corriger seulement la cause qu’ils révèlent.',
          },
        },
        {
          id: 'now',
          label: { en: 'Now, on current builds', fr: 'Maintenant, sur les builds actuels' },
          planNote: {
            en: 'Record the prompt on today’s builds and trim redundant Keychain writes; signing stays in #234.',
            fr: 'Observer la demande sur les builds actuels et réduire les écritures redondantes dans le trousseau ; la signature reste dans #234.',
          },
        },
      ],
    },
  },
  {
    id: 'PERF-294',
    track: 'performance',
    initialStage: 'needs-decision',
    title: {
      en: 'Parse task imports off the main thread',
      fr: 'Analyser les imports de tâches hors du thread principal',
    },
    tldr: {
      en: 'A large Vikunja export is unzipped and parsed on the UI thread.',
      fr: 'Un gros export Vikunja est décompressé et analysé sur le thread de l’interface.',
    },
    source: 'agent-run',
    area: 'frontend',
    effort: 'M',
    goal: {
      en: 'Keep the import dialog responsive while it reads a large Vikunja export.',
      fr: 'Garder la fenêtre d’import réactive pendant la lecture d’un gros export Vikunja.',
    },
    today: {
      en: '`readVikunjaExportFile` unzips every entry, attachments included, then parses the JSON and builds the preview on the main thread.',
      fr: '`readVikunjaExportFile` décompresse toutes les entrées, pièces jointes comprises, puis analyse le JSON et construit l’aperçu sur le thread principal.',
    },
    change: {
      en: 'Move decompression and parsing into a cancellable worker that only unzips `data.json` and returns just what the preview needs.',
      fr: 'Déplacer la décompression et l’analyse dans un worker annulable qui ne décompresse que `data.json` et ne renvoie que ce dont l’aperçu a besoin.',
    },
    technical: [
      {
        en: 'A module worker runs `unzipSync` and `JSON.parse` on the file buffer, transferred rather than copied',
        fr: 'Un module worker exécute `unzipSync` et `JSON.parse` sur le buffer du fichier, transféré plutôt que copié',
      },
      {
        en: '`normalizeVikunjaDescription` stays on the main thread, in small yielding batches',
        fr: '`normalizeVikunjaDescription` reste sur le thread principal, par petits lots qui rendent la main',
      },
      {
        en: 'Closing or replacing the file terminates the worker and drops late replies',
        fr: 'Fermer ou remplacer le fichier arrête le worker et ignore les réponses tardives',
      },
    ],
    whyNow: {
      en: 'Decompression and parsing run synchronously right after the file is read, which can block input and rendering on a large export.',
      fr: 'La décompression et l’analyse tournent de façon synchrone juste après la lecture du fichier, ce qui peut bloquer la saisie et le rendu sur un gros export.',
    },
    evidence: [
      {
        en: '`TaskImportModal.tsx` calls `unzipSync` and `JSON.parse` inside `readVikunjaExportFile`.',
        fr: '`TaskImportModal.tsx` appelle `unzipSync` et `JSON.parse` dans `readVikunjaExportFile`.',
      },
      {
        en: '`handleFileChange` then walks the export and hydrates every preview task on the same thread.',
        fr: '`handleFileChange` parcourt ensuite l’export et hydrate chaque tâche de l’aperçu sur le même thread.',
      },
      {
        en: 'Found by reading the code: no freeze has been reproduced or measured yet.',
        fr: 'Repéré en lisant le code : aucun gel n’a encore été reproduit ni mesuré.',
      },
    ],
    plan: [
      {
        en: 'Move unzip, decoding and the export walk into a worker bundled with the app; backend calls stay in the dialog.',
        fr: 'Déplacer la décompression, le décodage et le parcours de l’export dans un worker embarqué dans l’app ; les appels au backend restent dans la fenêtre.',
      },
      {
        en: 'Only decompress `data.json` entries, with size limits taken from the existing fixtures and a clear message instead of silently dropping tasks.',
        fr: 'Ne décompresser que les entrées `data.json`, avec des limites de taille tirées des fixtures existantes et un message clair plutôt que des tâches perdues en silence.',
      },
      {
        en: 'Clean descriptions on the main thread in yielding batches, with the same sanitization as today.',
        fr: 'Nettoyer les descriptions sur le thread principal par petits lots, avec la même sanitization qu’aujourd’hui.',
      },
      {
        en: 'Handle malformed archives and a worker that fails to start explicitly, with no synchronous fallback.',
        fr: 'Gérer explicitement les archives malformées et un worker qui ne démarre pas, sans repli synchrone.',
      },
    ],
    acceptance: [
      {
        en: 'ZIP decompression and JSON parsing run outside the main UI thread.',
        fr: 'La décompression ZIP et l’analyse JSON tournent hors du thread principal.',
      },
      {
        en: 'Closing or replacing an import cancels the work and never shows a stale preview.',
        fr: 'Fermer ou remplacer un import annule le travail et n’affiche jamais d’aperçu périmé.',
      },
      {
        en: 'JSON and ZIP exports keep the same task mapping and the explicit import confirmation.',
        fr: 'Les exports JSON et ZIP gardent le même mapping des tâches et la confirmation explicite de l’import.',
      },
      {
        en: 'Controls stay responsive on the large fixture, with main-thread long tasks recorded.',
        fr: 'Les contrôles restent réactifs sur la grosse fixture, avec les long tasks du thread principal mesurées.',
      },
    ],
    validation: {
      en: 'Compare long tasks, peak memory and time to preview on small and large fixtures, then check the worker loads offline in the packaged desktop and mobile apps.',
      fr: 'Comparer long tasks, pic mémoire et délai d’aperçu sur petites et grosses fixtures, puis vérifier que le worker se charge hors ligne dans les apps desktop et mobile packagées.',
    },
    watchFor: {
      en: 'The final preview render can stay slow even once parsing leaves the main thread, so the measurements keep the two apart.',
      fr: 'Le rendu final de l’aperçu peut rester lent même une fois l’analyse sortie du thread principal : les mesures séparent les deux.',
    },
    followUp: {
      question: {
        en: 'Why not clean up descriptions in the worker too?',
        fr: 'Pourquoi ne pas nettoyer aussi les descriptions dans le worker ?',
      },
      answer: {
        en: '`normalizeVikunjaDescription` relies on `DOMParser`, which workers don’t have, and `TaskImportModal.test.ts` pins its browser-parser behavior. The plan keeps that step on the main thread rather than swapping in a regex or a heavy dependency.',
        fr: '`normalizeVikunjaDescription` s’appuie sur `DOMParser`, absent des workers, et `TaskImportModal.test.ts` verrouille son comportement de parseur navigateur. Le plan garde cette étape sur le thread principal plutôt que de la remplacer par une regex ou une grosse dépendance.',
      },
    },
  },
  {
    id: 'DOC-3',
    illustrative: true,
    track: 'docs',
    initialStage: 'needs-decision',
    title: {
      en: 'Auth limit docs point to a deleted file',
      fr: 'La doc des limites d’auth renvoie à un fichier supprimé',
    },
    tldr: {
      en: 'Self-hosters are sent to an env file that no longer exists.',
      fr: 'Les auto-hébergeurs sont renvoyés vers un fichier d’env qui n’existe plus.',
    },
    source: 'agent-run',
    area: 'backend',
    effort: 'S',
    goal: {
      en: 'Tell self-hosters exactly where to set the sign-in and sign-up rate limits.',
      fr: 'Indiquer clairement aux auto-hébergeurs où régler les limites de connexion et d’inscription.',
    },
    today: {
      en: 'The security guide points to a backend `.env.example` that was removed, and the production template does not list the limits.',
      fr: 'Le guide de sécurité renvoie à un `.env.example` backend supprimé, et le modèle de production ne liste pas ces limites.',
    },
    change: {
      en: 'Point `docs/self-hosting-security.md` at a file that exists and list the six limits with their defaults there.',
      fr: 'Faire pointer `docs/self-hosting-security.md` vers un fichier qui existe et y lister les six limites avec leurs valeurs par défaut.',
    },
    technical: [
      {
        en: 'Six variables: `AUTH_ATTEMPT_*` (window, origin, identity) and `AUTH_REGISTRATION_*` (window, origin, global)',
        fr: 'Six variables : `AUTH_ATTEMPT_*` (fenêtre, origine, identité) et `AUTH_REGISTRATION_*` (fenêtre, origine, global)',
      },
      {
        en: 'Defaults are defined in `AuthAttemptStore` and again in `packages/backend/docker-compose.yml`',
        fr: 'Les valeurs par défaut sont définies dans `AuthAttemptStore` et à nouveau dans `packages/backend/docker-compose.yml`',
      },
    ],
    whyNow: {
      en: 'The daily run checks every path quoted in `docs/` against the tree, and this one no longer resolves.',
      fr: 'Le run quotidien confronte chaque chemin cité dans `docs/` au dépôt, et celui-ci ne mène plus nulle part.',
    },
    evidence: [
      {
        en: 'The backend env example was removed in #34, when local settings moved to the root `.env.example`.',
        fr: 'L’exemple d’env backend a été supprimé dans #34, quand la config locale est passée dans le `.env.example` racine.',
      },
      {
        en: 'Git history dates the doc line to three days after that removal.',
        fr: 'L’historique Git date la ligne de la doc de trois jours après cette suppression.',
      },
    ],
    inconsistencies: [
      {
        source: 'docs/self-hosting-security.md:50',
        says: {
          en: 'Set the limits with the `AUTH_ATTEMPT_*` and `AUTH_REGISTRATION_*` variables “shown in” the backend `.env.example`, a file that is gone.',
          fr: 'Régler les limites avec les variables `AUTH_ATTEMPT_*` et `AUTH_REGISTRATION_*` « présentes » dans le `.env.example` backend, un fichier qui n’existe plus.',
        },
      },
      {
        source: 'packages/backend/.env.production.example',
        says: {
          en: 'The template self-hosters copy has no `AUTH_*` line at all.',
          fr: 'Le modèle que copient les auto-hébergeurs ne contient aucune ligne `AUTH_*`.',
        },
      },
      {
        source: 'packages/backend/docker-compose.yml',
        says: {
          en: 'Sets all six with defaults, e.g. `AUTH_ATTEMPT_IDENTITY_LIMIT: ${AUTH_ATTEMPT_IDENTITY_LIMIT:-10}`.',
          fr: 'Définit les six avec des valeurs par défaut, par exemple `AUTH_ATTEMPT_IDENTITY_LIMIT: ${AUTH_ATTEMPT_IDENTITY_LIMIT:-10}`.',
        },
      },
    ],
    plan: [
      {
        en: 'Fix the path in `docs/self-hosting-security.md` to point at the file you pick.',
        fr: 'Corriger le chemin dans `docs/self-hosting-security.md` pour viser le fichier choisi.',
      },
      {
        en: 'List the six limits there with their defaults and a one-line comment each.',
        fr: 'Y lister les six limites avec leur valeur par défaut et un commentaire d’une ligne chacune.',
      },
      {
        en: 'Check the other guides for paths that #34 removed.',
        fr: 'Vérifier les autres guides pour d’autres chemins supprimés par #34.',
      },
    ],
    acceptance: [
      {
        en: 'Every file the self-hosting guides name exists.',
        fr: 'Chaque fichier cité par les guides d’auto-hébergement existe.',
      },
      {
        en: 'The documented defaults match `AuthAttemptStore` and Compose.',
        fr: 'Les valeurs documentées correspondent à `AuthAttemptStore` et à Compose.',
      },
      {
        en: 'A new self-hoster can find and change the limits without reading code.',
        fr: 'Un nouvel auto-hébergeur trouve et modifie les limites sans lire le code.',
      },
    ],
    validation: {
      en: 'Check every backticked path in `docs/` against the tree, and compare the listed defaults with `AuthAttemptStore`.',
      fr: 'Confronter chaque chemin cité dans `docs/` au dépôt, et comparer les valeurs listées avec `AuthAttemptStore`.',
    },
    watchFor: {
      en: 'Defaults live in both code and Compose: changing one must update the other and the docs.',
      fr: 'Les valeurs par défaut vivent dans le code et dans Compose : en changer une impose de mettre à jour l’autre et la doc.',
    },
    followUp: {
      question: {
        en: 'Does a self-hoster have to set these at all?',
        fr: 'Un auto-hébergeur doit-il vraiment les définir ?',
      },
      answer: {
        en: 'No. Compose and `AuthAttemptStore` both default to 60 sign-in attempts per origin and 10 per username each minute, and 20 sign-ups per origin and 200 in total each hour. The docs only matter for tuning.',
        fr: 'Non. Compose et `AuthAttemptStore` prévoient tous deux 60 tentatives de connexion par origine et 10 par identifiant chaque minute, puis 20 inscriptions par origine et 200 au total chaque heure. La doc ne sert qu’à ajuster.',
      },
    },
    question: {
      prompt: {
        en: 'Where should the limits be documented?',
        fr: 'Où documenter ces limites ?',
      },
      options: [
        {
          id: 'template',
          label: { en: 'In the production template', fr: 'Dans le modèle de production' },
          recommended: true,
          planNote: {
            en: 'Add the six `AUTH_*` lines to `packages/backend/.env.production.example` and link the guide there.',
            fr: 'Ajouter les six lignes `AUTH_*` à `packages/backend/.env.production.example` et y faire pointer le guide.',
          },
        },
        {
          id: 'compose',
          label: { en: 'In the Compose file only', fr: 'Dans le fichier Compose seulement' },
          planNote: {
            en: 'Keep the template short and point the guide at the defaults in `packages/backend/docker-compose.yml`.',
            fr: 'Garder le modèle court et renvoyer le guide vers les valeurs de `packages/backend/docker-compose.yml`.',
          },
        },
        {
          id: 'guide',
          label: { en: 'In the guide itself', fr: 'Dans le guide lui-même' },
          planNote: {
            en: 'Add a table of the six variables and their defaults to `docs/self-hosting-security.md`.',
            fr: 'Ajouter à `docs/self-hosting-security.md` un tableau des six variables et de leurs valeurs par défaut.',
          },
        },
      ],
    },
  },
  {
    id: 'FEAT-301',
    track: 'feature',
    initialStage: 'needs-decision',
    title: {
      en: 'Align follow-up tasks and allow pinning',
      fr: 'Aligner les tâches de suivi et permettre l’épinglage',
    },
    tldr: {
      en: 'Follow-ups line up with other tasks and can be pinned.',
      fr: 'Les tâches de suivi s’alignent sur les autres et peuvent être épinglées.',
    },
    source: 'user-feedback',
    area: 'frontend',
    effort: 'M',
    goal: {
      en: 'Show follow-up tasks flush with every other task, keep the “Follow-up for …” line above the title, and let them be pinned.',
      fr: 'Aligner les tâches de suivi sur les autres, garder au-dessus du titre la ligne qui nomme la tâche d’origine, et permettre de les épingler.',
    },
    today: {
      en: 'Follow-ups are indented with a coloured left border, and both the UI and the backend refuse to pin them.',
      fr: 'Les suivis sont décalés avec une bordure colorée à gauche, et l’interface comme le backend refusent de les épingler.',
    },
    change: {
      en: 'Drop the follow-up indent and border, keep the parent line, and allow pin and unpin on active generated follow-ups.',
      fr: 'Retirer le décalage et la bordure, garder la ligne parente, et autoriser l’épinglage des suivis générés encore actifs.',
    },
    technical: [
      {
        en: '`TaskWorkspace.tsx`: remove `ml-4 border-l-2` from follow-up rows and show the pin button',
        fr: '`TaskWorkspace.tsx` : retirer `ml-4 border-l-2` des lignes de suivi et afficher le bouton d’épinglage',
      },
      {
        en: '`MinimizedTaskView.tsx`: `canToggleTaskPin()` stops excluding follow-ups',
        fr: '`MinimizedTaskView.tsx` : `canToggleTaskPin()` n’exclut plus les suivis',
      },
      {
        en: '`TasksService` accepts `pinned` on follow-ups but still rejects recurrence',
        fr: '`TasksService` accepte `pinned` sur les suivis mais refuse toujours la récurrence',
      },
    ],
    whyNow: {
      en: 'From voice feedback: follow-ups should share the same left edge as other tasks, and be pinnable.',
      fr: 'Issu d’un retour vocal : les suivis doivent partager le même bord gauche que les autres tâches, et pouvoir être épinglés.',
    },
    evidence: [
      {
        en: 'The voice note says “pinnacle”; the radar reads it as “pinnable”, and accepting the card confirms that reading.',
        fr: 'La note vocale dit « pinnacle » ; le radar l’interprète comme « épinglable », et accepter la carte valide cette lecture.',
      },
      {
        en: '`TasksService` throws “Contextual follow-up Tasks cannot be pinned or recurring”.',
        fr: '`TasksService` lève « Contextual follow-up Tasks cannot be pinned or recurring ».',
      },
    ],
    plan: [
      {
        en: 'Remove only the follow-up margin and border; keep `TaskFollowUpContext` above the title in every view.',
        fr: 'Retirer uniquement la marge et la bordure des suivis ; garder `TaskFollowUpContext` au-dessus du titre dans chaque vue.',
      },
      {
        en: 'Show pin controls and shortcuts for active generated follow-ups in the expanded and minimized views.',
        fr: 'Afficher les boutons et raccourcis d’épinglage des suivis actifs dans la vue étendue et la vue réduite.',
      },
      {
        en: 'Split the backend check: allow pinning, keep rejecting recurrence, leave ownership and state checks as they are.',
        fr: 'Scinder la vérification backend : autoriser l’épinglage, refuser toujours la récurrence, garder les contrôles de propriété et d’état.',
      },
      {
        en: 'Make completion, archive, replacement and undo clear or restore the pin without duplicates.',
        fr: 'Faire en sorte que terminer, archiver, remplacer ou annuler retire ou rétablisse l’épingle sans doublon.',
      },
    ],
    acceptance: [
      {
        en: 'Follow-up rows share the left edge of ordinary tasks, with no special border.',
        fr: 'Les lignes de suivi partagent le bord gauche des tâches ordinaires, sans bordure spéciale.',
      },
      {
        en: 'The parent line stays above the title, pinned or not.',
        fr: 'La ligne parente reste au-dessus du titre, épinglée ou non.',
      },
      {
        en: 'Active follow-ups pin and unpin through confirmed backend actions, the same way in both views.',
        fr: 'Les suivis actifs s’épinglent et se désépinglent via des actions confirmées par le backend, de la même façon dans les deux vues.',
      },
      {
        en: 'Follow-ups still cannot become recurring.',
        fr: 'Les suivis ne peuvent toujours pas devenir récurrents.',
      },
    ],
    validation: {
      en: 'Nest tests for pin rules, recurrence and replacement, plus a Chromium component test comparing row geometry with an ordinary task at 440×700.',
      fr: 'Tests Nest sur les règles d’épinglage, la récurrence et le remplacement, plus un test de composant Chromium qui compare la géométrie avec une tâche ordinaire en 440×700.',
    },
    watchFor: {
      en: 'Replacing a follow-up must clear the old pin; the new one starts unpinned, as today.',
      fr: 'Remplacer un suivi doit retirer l’ancienne épingle ; le nouveau démarre non épinglé, comme aujourd’hui.',
    },
    followUp: {
      question: {
        en: 'Does pinning change how follow-ups are generated?',
        fr: 'L’épinglage change-t-il la façon dont les suivis sont générés ?',
      },
      answer: {
        en: 'No. The parent still owns the template and has at most one active follow-up. No schema change either: tasks already have a `pinnedAt` column.',
        fr: 'Non. La tâche parente garde le modèle et n’a toujours qu’un suivi actif. Pas de changement de schéma non plus : les tâches ont déjà une colonne `pinnedAt`.',
      },
    },
  },
  {
    id: 'SEC-235',
    track: 'security',
    initialStage: 'needs-decision',
    title: {
      en: 'Block releases with known vulnerabilities',
      fr: 'Bloquer les releases qui ont des failles connues',
    },
    tldr: {
      en: 'Releases publish with no dependency or image vulnerability check.',
      fr: 'Les releases sont publiées sans aucun contrôle de failles sur les dépendances ou l’image.',
    },
    source: 'agent-run',
    area: 'ci',
    effort: 'M',
    goal: {
      en: 'Stop a release when its JavaScript, Rust or container dependencies carry an actionable known vulnerability.',
      fr: 'Bloquer une release quand ses dépendances JavaScript, Rust ou conteneur contiennent une faille connue exploitable.',
    },
    today: {
      en: 'CI runs tests and CodeQL and Dependabot proposes updates, but nothing audits the lockfiles or the backend image before `release.yml` publishes it.',
      fr: 'La CI lance les tests et CodeQL, Dependabot propose des mises à jour, mais rien n’audite les lockfiles ni l’image backend avant que `release.yml` la publie.',
    },
    change: {
      en: 'Scan both lockfiles and the built image, keep an SBOM per image, and block critical or high findings unless a dated exception covers them.',
      fr: 'Scanner les deux lockfiles et l’image construite, garder un SBOM par image, et bloquer les failles critiques ou hautes sauf exception datée.',
    },
    technical: [
      {
        en: '`pr-tests.yml`: scan `pnpm-lock.yaml` and `Cargo.lock` on every pull request',
        fr: '`pr-tests.yml` : scan de `pnpm-lock.yaml` et `Cargo.lock` sur chaque pull request',
      },
      {
        en: '`release.yml`: scan each backend image before it reaches GHCR, and archive its SBOM',
        fr: '`release.yml` : scan de chaque image backend avant son envoi sur GHCR, avec archivage de son SBOM',
      },
      {
        en: 'Exceptions are tied to an image digest and expire on their own',
        fr: 'Les exceptions sont liées au digest d’une image et expirent d’elles-mêmes',
      },
    ],
    whyNow: {
      en: 'Dependabot proposes updates, but nothing checks lockfiles, Cargo crates or the container before privileged production artifacts publish.',
      fr: 'Dependabot propose des mises à jour, mais rien ne vérifie les lockfiles, les crates Cargo ni le conteneur avant la publication des artefacts de production.',
    },
    evidence: [
      {
        en: '`.github/dependabot.yml` schedules weekly npm, Cargo and GitHub Actions updates.',
        fr: '`.github/dependabot.yml` planifie chaque semaine les mises à jour npm, Cargo et GitHub Actions.',
      },
      {
        en: 'No workflow runs a pnpm or Cargo audit, an image scan or an SBOM step.',
        fr: 'Aucun workflow ne lance d’audit pnpm ou Cargo, de scan d’image ni de génération de SBOM.',
      },
      {
        en: '`release.yml` pushes `ghcr.io/host-it-labs/pomi-backend` for amd64 and arm64 as soon as a release is published.',
        fr: '`release.yml` pousse `ghcr.io/host-it-labs/pomi-backend` en amd64 et arm64 dès qu’une release est publiée.',
      },
    ],
    plan: [
      {
        en: 'Add npm and Cargo lockfile scans and a scan of the built backend image, in report-only mode.',
        fr: 'Ajouter des scans des lockfiles npm et Cargo et de l’image backend construite, en mode rapport seul.',
      },
      {
        en: 'Sort the existing findings: fix each one or record a dated exception.',
        fr: 'Trier les failles existantes : corriger chacune ou consigner une exception datée.',
      },
      {
        en: 'Then fail pull requests and the release on actionable critical or high findings.',
        fr: 'Puis faire échouer les pull requests et la release sur toute faille critique ou haute exploitable.',
      },
      {
        en: 'Generate an SBOM for each published backend image and archive it with the release.',
        fr: 'Générer un SBOM pour chaque image backend publiée et l’archiver avec la release.',
      },
    ],
    acceptance: [
      {
        en: 'JavaScript, Rust and container dependencies are scanned from immutable inputs.',
        fr: 'Les dépendances JavaScript, Rust et conteneur sont scannées à partir d’entrées immuables.',
      },
      {
        en: 'Actionable critical or high findings block the release unless a reviewed exception is active.',
        fr: 'Une faille critique ou haute exploitable bloque la release, sauf exception validée et active.',
      },
      {
        en: 'Every exception names the advisory, digest, owner, reason and expiry.',
        fr: 'Chaque exception indique l’advisory, le digest, le responsable, la raison et l’expiration.',
      },
      {
        en: 'Each published backend image ships with an archived machine-readable SBOM.',
        fr: 'Chaque image backend publiée est accompagnée d’un SBOM lisible par machine et archivé.',
      },
    ],
    validation: {
      en: 'Seed known vulnerable fixtures for each ecosystem, check each one is caught, and check that an expired exception blocks again.',
      fr: 'Ajouter des fixtures vulnérables connues pour chaque écosystème, vérifier que chacune est détectée, et qu’une exception expirée bloque à nouveau.',
    },
    watchFor: {
      en: 'Scanner databases add network calls and false positives; turning off a broken scanner must never become a permanent ignore.',
      fr: 'Les bases des scanners ajoutent des appels réseau et des faux positifs ; désactiver un scanner en panne ne doit jamais devenir un ignore permanent.',
    },
    followUp: {
      question: {
        en: 'Will this block the next release on day one?',
        fr: 'Est-ce que ça bloque la prochaine release dès le premier jour ?',
      },
      answer: {
        en: 'No. It starts in report-only mode to sort what is already there. Each finding is fixed or gets a dated exception, and only then do pull requests and releases fail.',
        fr: 'Non. Il démarre en mode rapport seul pour trier l’existant. Chaque faille est corrigée ou reçoit une exception datée, et ce n’est qu’ensuite que les pull requests et les releases échouent.',
      },
    },
  },
  {
    id: 'BUG-214',
    track: 'bug',
    initialStage: 'needs-decision',
    title: {
      en: 'Identify unhandled rejections without exposing data',
      fr: 'Identifier les rejets non gérés sans exposer de données',
    },
    tldr: {
      en: 'Tag stackless errors with a safe operation name so Sentry can tell them apart.',
      fr: 'Marquer les erreurs sans pile d’un nom d’opération sûr pour que Sentry les distingue.',
    },
    source: 'sentry',
    area: 'frontend',
    effort: 'M',
    goal: {
      en: 'Some frontend errors reach Sentry with no stack and no context, so nothing says which part of the app failed.',
      fr: 'Certaines erreurs frontend arrivent dans Sentry sans pile ni contexte : rien n’indique quelle partie de l’app a échoué.',
    },
    today: {
      en: 'Redaction turns every message into `ClientError`, and global promise rejections carry no `operation` tag, so they share one group.',
      fr: 'Le masquage remplace chaque message par `ClientError`, et les rejets globaux de promesses n’ont pas de tag `operation` : ils tombent dans un seul groupe.',
    },
    change: {
      en: 'At known async boundaries, wrap non-Error failures in a safe error with a fixed `operation` tag, and keep redaction as it is.',
      fr: 'Aux frontières async connues, envelopper les échecs non-Error dans une erreur sûre avec un tag `operation` fixe, sans toucher au masquage.',
    },
    technical: [
      {
        en: '`getSafeSentryFingerprint()` already groups by the `operation` tag, but most boundaries never set it',
        fr: '`getSafeSentryFingerprint()` regroupe déjà par tag `operation`, mais la plupart des frontières ne le renseignent pas',
      },
      {
        en: 'Reuse the pattern in `userActionQueue.ts`, which tags `confirmed_action.reconcile`',
        fr: 'Reprendre le modèle de `userActionQueue.ts`, qui pose le tag `confirmed_action.reconcile`',
      },
      {
        en: '`redactSentryEvent()` still replaces exception text with `ClientError`',
        fr: '`redactSentryEvent()` remplace toujours le texte des exceptions par `ClientError`',
      },
    ],
    whyNow: {
      en: 'The first pass fixed release names and source maps, yet the latest events still cannot be traced to a feature.',
      fr: 'La première passe a corrigé les noms de release et les source maps, mais les derniers événements restent impossibles à relier à une fonctionnalité.',
    },
    evidence: [
      {
        en: 'Sentry group POMI-FRONTEND-G: 13 events through 0.30.4; the latest has no stack frames and no operation tag.',
        fr: 'Groupe Sentry POMI-FRONTEND-G : 13 événements jusqu’à 0.30.4 ; le dernier n’a ni frames de pile ni tag d’opération.',
      },
      {
        en: 'Safe fingerprints and private source maps already shipped in 0.30.1 (#256).',
        fr: 'Les empreintes sûres et les source maps privées sont déjà sorties en 0.30.1 (#256).',
      },
    ],
    plan: [
      {
        en: 'Audit fire-and-forget calls at native startup, credential, window and action boundaries.',
        fr: 'Passer en revue les appels lancés sans attente : démarrage natif, identifiants, fenêtres et actions.',
      },
      {
        en: 'Where they fail, normalize non-Error values into safe errors and attach a fixed `operation` tag.',
        fr: 'Là où ils échouent, convertir les valeurs non-Error en erreurs sûres et ajouter un tag `operation` fixe.',
      },
      {
        en: 'Keep retries and recovery as they are, and never blanket-swallow rejections.',
        fr: 'Garder les retries et la reprise tels quels, sans jamais avaler les rejets en bloc.',
      },
      {
        en: 'Check with synthetic stackless failures, then with one event from a released build.',
        fr: 'Vérifier avec des échecs sans pile simulés, puis avec un événement d’un build publié.',
      },
    ],
    acceptance: [
      {
        en: 'Stackless failures carry a short, safe operation name.',
        fr: 'Les échecs sans pile portent un nom d’opération court et sûr.',
      },
      {
        en: 'Exception text, task content and credentials stay redacted.',
        fr: 'Le texte des exceptions, le contenu des tâches et les identifiants restent masqués.',
      },
      {
        en: 'Recovery is unchanged and nothing is reported twice.',
        fr: 'La reprise ne change pas et rien n’est remonté deux fois.',
      },
      {
        en: 'An event from a released build names the failing operation without its payload.',
        fr: 'Un événement issu d’un build publié nomme l’opération en échec sans son contenu.',
      },
    ],
    validation: {
      en: 'Unit tests for stackless native and browser rejections, stable grouping and redaction, then one event from a released build.',
      fr: 'Tests unitaires sur les rejets natifs et navigateur sans pile, le regroupement stable et le masquage, puis un événement d’un build publié.',
    },
    watchFor: {
      en: '`ClientError` says nothing about the cause: do not read a network or Keychain failure into it before the tags arrive.',
      fr: '`ClientError` ne dit rien de la cause : ne pas y voir une panne réseau ou trousseau avant l’arrivée des tags.',
    },
    followUp: {
      question: {
        en: 'Is this a bug people hit, or only missing diagnostics?',
        fr: 'Est-ce un bug visible, ou seulement un manque de diagnostic ?',
      },
      answer: {
        en: 'Unknown yet, which is the point. The events have no stack, so the plan adds context first; if a real defect shows up, it gets its own issue.',
        fr: 'On ne le sait pas encore, et c’est tout l’enjeu. Les événements n’ont pas de pile : le plan ajoute d’abord du contexte, et un vrai défaut, s’il apparaît, aura sa propre issue.',
      },
    },
  },
  {
    id: 'DEP-295',
    track: 'dependencies',
    initialStage: 'needs-decision',
    title: {
      en: 'Upgrade the Sentry SDKs to 10.74.0',
      fr: 'Passer les SDK Sentry en 10.74.0',
    },
    tldr: {
      en: 'A minor release that changes how Sentry isolates request scopes.',
      fr: 'Une version mineure qui change l’isolation des scopes de requête dans Sentry.',
    },
    source: 'agent-run',
    area: 'backend',
    effort: 'S',
    goal: {
      en: 'Move `@sentry/react` and `@sentry/nestjs` to stable 10.74.0 together, without changing what Pomi sends to Sentry.',
      fr: 'Passer ensemble `@sentry/react` et `@sentry/nestjs` en 10.74.0 stable, sans changer ce que Pomi envoie à Sentry.',
    },
    today: {
      en: 'The lockfile resolves both SDKs at 10.73.0. Both only run in production, with `enableLogs: true` and redaction hooks.',
      fr: 'Le lockfile résout les deux SDK en 10.73.0. Tous deux ne tournent qu’en production, avec `enableLogs: true` et des hooks de masquage.',
    },
    change: {
      en: 'Bump both SDKs with pnpm, then check scope isolation, log and error routing, redaction and dev gating.',
      fr: 'Monter les deux SDK avec pnpm, puis vérifier l’isolation des scopes, le routage des logs et erreurs, le masquage et la désactivation en dev.',
    },
    technical: [
      {
        en: '`@sentry/react` and `@sentry/nestjs` move from `^10.72.0` to 10.74.0, with only the lockfile entries they pull in',
        fr: '`@sentry/react` et `@sentry/nestjs` passent de `^10.72.0` à 10.74.0, avec seulement les entrées de lockfile qu’ils entraînent',
      },
      {
        en: 'Check the new scope handling against `SentryGlobalFilter` and `Sentry.withScope` in `sentry-logger.service.ts`',
        fr: 'Vérifier la nouvelle gestion des scopes avec `SentryGlobalFilter` et `Sentry.withScope` dans `sentry-logger.service.ts`',
      },
      {
        en: '`beforeSend`, `beforeSendLog` and `tracesSampleRate` stay exactly as they are',
        fr: '`beforeSend`, `beforeSendLog` et `tracesSampleRate` restent strictement identiques',
      },
    ],
    whyNow: {
      en: '10.74.0 has been stable since September 9 and changes isolation-scope handling and browser span metadata.',
      fr: 'La 10.74.0 est stable depuis le 9 septembre et modifie la gestion des isolation scopes et les métadonnées des spans navigateur.',
    },
    evidence: [
      {
        en: '`pnpm-lock.yaml` resolves `@sentry/react` and `@sentry/nestjs` at 10.73.0.',
        fr: '`pnpm-lock.yaml` résout `@sentry/react` et `@sentry/nestjs` en 10.73.0.',
      },
      {
        en: 'npm and the official GitHub release mark 10.74.0 as stable, not a prerelease.',
        fr: 'npm et la release GitHub officielle marquent la 10.74.0 comme stable, pas comme prerelease.',
      },
      {
        en: 'React 19 and NestJS 11 meet its peer ranges, and Node 26 meets its Node 18+ floor.',
        fr: 'React 19 et NestJS 11 respectent ses peer dependencies, et Node 26 son minimum Node 18.',
      },
    ],
    plan: [
      {
        en: 'Upgrade both SDKs together with pnpm, with no unrelated dependency bumps.',
        fr: 'Monter les deux SDK ensemble avec pnpm, sans autre mise à jour de dépendance.',
      },
      {
        en: 'Test concurrent requests for leaked user or trace context, plus log, error and redaction routing.',
        fr: 'Tester des requêtes concurrentes contre toute fuite de contexte utilisateur ou de trace, ainsi que le routage des logs, des erreurs et le masquage.',
      },
      {
        en: 'Benchmark bundle size, CPU, heap and p50/p95 latency before and after, against a mocked local transport.',
        fr: 'Mesurer taille du bundle, CPU, heap et latence p50/p95 avant et après, avec un transport local simulé.',
      },
      {
        en: 'Rebuild both packages and ship with the coordinated client and backend release.',
        fr: 'Rebuilder les deux packages et livrer avec la release coordonnée client et backend.',
      },
    ],
    acceptance: [
      {
        en: 'Both SDKs resolve 10.74.0 without unrelated upgrades.',
        fr: 'Les deux SDK résolvent en 10.74.0, sans mise à jour sans rapport.',
      },
      {
        en: 'Production logs and real errors keep their destinations and redaction.',
        fr: 'Les logs de production et les vraies erreurs gardent leur destination et leur masquage.',
      },
      {
        en: 'Concurrent request scopes cannot leak user or trace context.',
        fr: 'Des requêtes concurrentes ne peuvent pas se transmettre de contexte utilisateur ou de trace.',
      },
      {
        en: 'Development sends no telemetry and production sampling is unchanged.',
        fr: 'Le développement n’envoie aucune télémétrie et l’échantillonnage de production ne change pas.',
      },
    ],
    validation: {
      en: 'Five warm-ups then thirty runs of a fixed request and log workload on a mocked transport, plus a rebuild of both packages.',
      fr: 'Cinq tours de chauffe puis trente mesures sur une charge fixe de requêtes et de logs avec un transport simulé, plus un rebuild des deux packages.',
    },
    watchFor: {
      en: 'No speedup is shown yet: if the numbers don’t move, the PR ships as maintenance and says so.',
      fr: 'Aucun gain n’est démontré : si les chiffres ne bougent pas, la PR part comme maintenance et le dit.',
    },
    migration: { pkg: '@sentry/nestjs', from: '10.73.0', to: '10.74.0' },
    followUp: {
      question: {
        en: 'Won’t Dependabot open this bump on its own?',
        fr: 'Dependabot ne va-t-il pas proposer cette montée tout seul ?',
      },
      answer: {
        en: 'Likely: `.github/dependabot.yml` groups npm minor and patch updates weekly under `npm-minor-patch`, so 10.74.0 would arrive mixed with unrelated bumps. This ticket keeps it to the two Sentry SDKs and adds the scope, redaction and dev-gating checks.',
        fr: 'Probablement : `.github/dependabot.yml` regroupe chaque semaine les mises à jour npm mineures et correctives sous `npm-minor-patch`, donc la 10.74.0 arriverait mêlée à d’autres montées. Ce ticket s’en tient aux deux SDK Sentry et ajoute les vérifications de scopes, de masquage et de désactivation en dev.',
      },
    },
    question: {
      prompt: {
        en: 'What should the benchmark decide?',
        fr: 'Que doit décider le benchmark ?',
      },
      options: [
        {
          id: 'measure',
          label: {
            en: 'Measure, then ship as maintenance',
            fr: 'Mesurer, puis livrer comme maintenance',
          },
          recommended: true,
          planNote: {
            en: 'Ship unless a regression above 10% reproduces, and report the numbers even when nothing improves.',
            fr: 'Livrer sauf régression reproductible de plus de 10 %, et publier les chiffres même si rien ne s’améliore.',
          },
        },
        {
          id: 'tests-only',
          label: {
            en: 'Skip the benchmark',
            fr: 'Se passer du benchmark',
          },
          planNote: {
            en: 'Keep the scope, redaction and dev-gating tests and drop the thirty-run benchmark.',
            fr: 'Garder les tests de scopes, de masquage et de désactivation en dev, et abandonner le benchmark de trente mesures.',
          },
        },
      ],
    },
  },
  {
    id: 'PERF-293',
    track: 'performance',
    initialStage: 'needs-decision',
    title: {
      en: 'Bound task reads for destination descriptions',
      fr: 'Limiter les tâches lues pour les descriptions',
    },
    tldr: {
      en: 'Writing at most 25 descriptions first loads every active task.',
      fr: 'Rédiger au plus 25 descriptions charge d’abord toutes les tâches actives.',
    },
    source: 'agent-run',
    area: 'backend',
    effort: 'M',
    goal: {
      en: 'Generate destination descriptions without loading every active task, keeping the same destinations and recent titles in the prompt.',
      fr: 'Générer les descriptions de destinations sans charger toutes les tâches actives, avec les mêmes destinations et titres récents dans le prompt.',
    },
    today: {
      en: 'In `DescriptionsService`, `generate` loads all active tasks, filters them again for each destination, then keeps 25 destinations of 8 titles.',
      fr: 'Dans `DescriptionsService`, `generate` charge toutes les tâches actives, les refiltre pour chaque destination, puis garde 25 destinations de 8 titres.',
    },
    change: {
      en: 'Pick the eligible destinations first, then fetch at most 8 recent titles for each in one user-scoped query.',
      fr: 'Choisir d’abord les destinations éligibles, puis récupérer au plus 8 titres récents pour chacune en une seule requête limitée à l’utilisateur.',
    },
    technical: [
      {
        en: '`descriptions.service.ts`: intentions then lists, capped at `MAX_DESTINATIONS`, ties broken by ID',
        fr: '`descriptions.service.ts` : intentions puis listes, plafonnées à `MAX_DESTINATIONS`, égalités départagées par ID',
      },
      {
        en: 'One PostgreSQL top-N query for `MAX_TASK_TITLES` titles each, never one query per destination',
        fr: 'Une requête PostgreSQL top-N pour `MAX_TASK_TITLES` titres chacune, jamais une requête par destination',
      },
      {
        en: 'Titles only, still cut at 120 characters; feature gate and prompt unchanged',
        fr: 'Titres seulement, toujours coupés à 120 caractères ; feature gate et prompt inchangés',
      },
    ],
    whyNow: {
      en: 'The prompt holds at most 25 destinations of 8 titles, yet the task query behind it has no limit.',
      fr: 'Le prompt contient au plus 25 destinations de 8 titres, mais la requête de tâches derrière n’a aucune limite.',
    },
    evidence: [
      {
        en: '`generate` runs `tasks.find` over every active task with no limit, ordered by `updatedAt`.',
        fr: '`generate` lance `tasks.find` sur toutes les tâches actives sans limite, triées par `updatedAt`.',
      },
      {
        en: 'It filters that full list once per destination, then slices to 25.',
        fr: 'Il refiltre cette liste complète pour chaque destination, puis coupe à 25.',
      },
      {
        en: 'Found by reading the code: how often it runs and how long it takes are unmeasured.',
        fr: 'Repéré en lisant le code : fréquence et latence en production ne sont pas mesurées.',
      },
    ],
    plan: [
      {
        en: 'Select eligible intentions (parent `allowsTasks` rules) then lists, capped at 25, with stable ID ties.',
        fr: 'Sélectionner les intentions éligibles (règles `allowsTasks` du parent) puis les listes, plafonnées à 25, avec des égalités stables par ID.',
      },
      {
        en: 'Fetch up to 8 recent task and follow-up titles per intention, and list-item titles per list, in one query.',
        fr: 'Récupérer en une requête jusqu’à 8 titres récents de tâches et de suivis par intention, et d’éléments par liste.',
      },
      {
        en: 'Compare query plans on 1k, 10k and 100k task fixtures; add an index only if they call for it, through a reversible migration.',
        fr: 'Comparer les plans de requête sur des fixtures de 1k, 10k et 100k tâches ; n’ajouter un index que s’ils le justifient, via une migration réversible.',
      },
      {
        en: 'Extend `descriptions.service.test.ts` and add PostgreSQL tests for tenant isolation, ties and empty data.',
        fr: 'Étendre `descriptions.service.test.ts` et ajouter des tests PostgreSQL pour l’isolation entre comptes, les égalités et les données vides.',
      },
    ],
    acceptance: [
      {
        en: 'At most 8 title rows come back per selected destination.',
        fr: 'Au plus 8 titres reviennent par destination sélectionnée.',
      },
      {
        en: 'At most 25 eligible destinations reach the model, intentions before lists.',
        fr: 'Au plus 25 destinations éligibles arrivent au modèle, intentions avant listes.',
      },
      {
        en: 'Other accounts, archived destinations and ineligible task kinds never enter the prompt.',
        fr: 'Les autres comptes, les destinations archivées et les types de tâches non éligibles n’entrent jamais dans le prompt.',
      },
      {
        en: 'Large datasets load fewer rows without adding a query per destination.',
        fr: 'Les gros jeux de données chargent moins de lignes, sans requête supplémentaire par destination.',
      },
    ],
    validation: {
      en: 'Compare prompt inputs on fixed fixtures, then measure rows loaded, query plans, CPU and heap on large task sets.',
      fr: 'Comparer les entrées du prompt sur des fixtures fixes, puis mesurer lignes chargées, plans de requête, CPU et heap sur de gros volumes de tâches.',
    },
    watchFor: {
      en: 'A bounded result is not a bounded query: a window function can still scan many rows, so the plan has to be checked.',
      fr: 'Un résultat borné n’est pas une requête bornée : une fonction de fenêtre peut encore parcourir beaucoup de lignes, il faut donc vérifier le plan.',
    },
    followUp: {
      question: {
        en: 'Does this need a new index?',
        fr: 'Faut-il un nouvel index ?',
      },
      answer: {
        en: 'Not by default. `IDX_tasks_user_intention` and `IDX_tasks_list_status` already narrow tasks by intention and by list. Neither covers `updatedAt`, so an index is added only if the query plans on the large fixtures show the sort is costly.',
        fr: 'Pas d’office. `IDX_tasks_user_intention` et `IDX_tasks_list_status` filtrent déjà les tâches par intention et par liste. Aucun ne couvre `updatedAt` : un index ne sera ajouté que si les plans de requête sur les grosses fixtures montrent que le tri coûte cher.',
      },
    },
  },
  // ------------------------------------------------------------------------ review
  {
    id: 'SEC-218',
    track: 'security',
    initialStage: 'building',
    title: {
      en: 'Pin every CI action to a commit',
      fr: 'Épingler chaque action de CI sur un commit',
    },
    tldr: {
      en: 'Release jobs run third-party actions from tags that can move.',
      fr: 'Les jobs de release lancent des actions tierces via des tags modifiables.',
    },
    source: 'agent-run',
    area: 'ci',
    effort: 'M',
    goal: {
      en: 'Make CI and release workflows run only reviewed GitHub Action code, never whatever a tag points to today.',
      fr: 'Faire tourner la CI et les releases uniquement sur du code d’actions GitHub relu, jamais sur ce que pointe un tag aujourd’hui.',
    },
    today: {
      en: 'All 16 external actions are referenced by tags such as `@v7` or branches such as `@stable`, including in jobs that hold write credentials.',
      fr: 'Les 16 actions externes sont référencées par des tags comme `@v7` ou des branches comme `@stable`, y compris dans des jobs qui ont des droits d’écriture.',
    },
    change: {
      en: 'Pin each external `uses:` to a full commit SHA, keep the release tag in a comment, and fail CI on any movable reference.',
      fr: 'Épingler chaque `uses:` externe sur un SHA de commit complet, garder le tag de release en commentaire et faire échouer la CI sur toute référence modifiable.',
    },
    technical: [
      {
        en: 'Every external `uses:` in `.github/workflows` moves from a tag like `actions/checkout@v7` to a 40-character SHA',
        fr: 'Chaque `uses:` externe de `.github/workflows` passe d’un tag comme `actions/checkout@v7` à un SHA de 40 caractères',
      },
      {
        en: 'The reviewed release tag stays in a comment next to each SHA',
        fr: 'Le tag de release relu reste en commentaire à côté de chaque SHA',
      },
      {
        en: 'A workflow check rejects tags, branches, short SHAs, unknown owners and missing version comments',
        fr: 'Une vérification des workflows rejette tags, branches, SHA courts, propriétaires inconnus et commentaires de version absents',
      },
      {
        en: '`.github/dependabot.yml` already watches `github-actions` weekly and will propose SHA bumps',
        fr: '`.github/dependabot.yml` surveille déjà `github-actions` chaque semaine et proposera les mises à jour de SHA',
      },
    ],
    whyNow: {
      en: 'The security run found release and Radar jobs handing package, contents or GitHub App credentials to actions behind movable tags.',
      fr: 'Le run de sécurité a trouvé des jobs de release et du radar qui confient des droits sur les packages, le contenu ou l’app GitHub à des actions derrière des tags modifiables.',
    },
    evidence: [
      {
        en: 'The image jobs in `release.yml` hold `packages: write` and run `docker/login-action@v4` and `docker/build-push-action@v7`.',
        fr: 'Les jobs d’image de `release.yml` ont `packages: write` et lancent `docker/login-action@v4` et `docker/build-push-action@v7`.',
      },
      {
        en: 'Radar jobs mint an App token with `actions/create-github-app-token@v3`; the GitHub release step runs `softprops/action-gh-release@v3` with `contents: write`.',
        fr: 'Les jobs du radar génèrent un token d’app avec `actions/create-github-app-token@v3` ; la release GitHub passe par `softprops/action-gh-release@v3` avec `contents: write`.',
      },
    ],
    plan: [
      {
        en: 'Resolve each action’s current tag to its commit and check it belongs to the expected upstream release.',
        fr: 'Résoudre le tag actuel de chaque action vers son commit et vérifier qu’il appartient bien à la release amont attendue.',
      },
      {
        en: 'Pin the high-credential jobs first (`release.yml`, `radar-lifecycle.yml`), then PR checks, CodeQL and artifacts in the same change.',
        fr: 'Épingler d’abord les jobs les plus privilégiés (`release.yml`, `radar-lifecycle.yml`), puis les checks de PR, CodeQL et les artefacts dans la même modification.',
      },
      {
        en: 'Add the workflow check to CI and to local validation.',
        fr: 'Ajouter la vérification des workflows à la CI et à la validation locale.',
      },
      {
        en: 'Roll back by reverting to the previous reviewed SHA, never to a tag.',
        fr: 'En cas de retour arrière, revenir au SHA relu précédent, jamais à un tag.',
      },
    ],
    acceptance: [
      {
        en: 'Every external `uses:` reference contains a full 40-character commit SHA.',
        fr: 'Chaque référence `uses:` externe contient un SHA de commit complet de 40 caractères.',
      },
      {
        en: 'A version comment keeps the reviewed upstream release visible.',
        fr: 'Un commentaire de version garde la release amont relue visible.',
      },
      {
        en: 'CI fails when a movable action reference is introduced.',
        fr: 'La CI échoue dès qu’une référence d’action modifiable est ajoutée.',
      },
      {
        en: 'Release and Radar jobs keep only the job-level permissions they need.',
        fr: 'Les jobs de release et du radar ne gardent que les permissions dont ils ont besoin.',
      },
    ],
    validation: {
      en: 'Parse every workflow, then run representative PR, CodeQL, Radar, container and release paths on the pinned SHAs.',
      fr: 'Analyser chaque workflow, puis exécuter des parcours représentatifs de PR, CodeQL, radar, conteneur et release sur les SHA épinglés.',
    },
    watchFor: {
      en: 'Updates become explicit reviewed changes, so an urgent action fix needs a verified new SHA before it can merge.',
      fr: 'Les mises à jour deviennent des changements relus explicitement : un correctif urgent d’action exige un nouveau SHA vérifié avant le merge.',
    },
  },
  {
    id: 'BUG-283',
    track: 'bug',
    initialStage: 'pr-ready',
    title: {
      en: 'Shortened long break ignores the first-intention reset',
      fr: 'La pause longue raccourcie ignore la relance à la première intention',
    },
    tldr: {
      en: 'Converting the break dropped its auto-start flag.',
      fr: 'La conversion faisait perdre à la pause son indicateur de démarrage automatique.',
    },
    source: 'user-feedback',
    area: 'backend',
    effort: 'S',
    goal: {
      en: 'With “Reset timer on first Intention” on, a break shortened from an auto-started long break did not restart when the first intention was picked.',
      fr: 'Avec la relance à la première intention activée, une pause raccourcie depuis une pause longue lancée automatiquement ne redémarrait pas au choix de la première intention.',
    },
    today: {
      en: 'After “Shorten Long break”, the short break kept counting from the conversion instead of restarting at its full duration.',
      fr: 'Une fois la pause longue raccourcie, la pause courte continuait de tourner depuis la conversion au lieu de repartir pour sa durée complète.',
    },
    change: {
      en: '`convertLongBreakToBreak()` now passes the long break’s `isAutoStarted` flag to the new break, so the reset rule applies once.',
      fr: '`convertLongBreakToBreak()` transmet désormais l’indicateur `isAutoStarted` de la pause longue à la nouvelle pause : la règle de relance s’applique une fois.',
    },
    technical: [
      {
        en: '`timer.service.ts`: `isAutoStarted: current.isAutoStarted === true` added to the `createOrResumeTimer()` call',
        fr: '`timer.service.ts` : `isAutoStarted: current.isAutoStarted === true` ajouté à l’appel de `createOrResumeTimer()`',
      },
      {
        en: '`shouldResetAutoStartedBreakOnFirstIntention()` is unchanged and still requires `isAutoStarted`',
        fr: '`shouldResetAutoStartedBreakOnFirstIntention()` ne change pas et exige toujours `isAutoStarted`',
      },
      {
        en: 'A manually started long break still converts into a break that never auto-resets',
        fr: 'Une pause longue lancée à la main donne toujours une pause qui ne se relance jamais seule',
      },
    ],
    whyNow: {
      en: 'Reported in my in-app voice feedback, from the Android app.',
      fr: 'Signalé dans un de mes retours vocaux, depuis l’app Android.',
    },
    evidence: [
      {
        en: '`convertLongBreakToBreak()` created the new break without passing `isAutoStarted`.',
        fr: '`convertLongBreakToBreak()` créait la nouvelle pause sans transmettre `isAutoStarted`.',
      },
      {
        en: '`shouldResetAutoStartedBreakOnFirstIntention()` only resets a timer whose `isAutoStarted` is `true`.',
        fr: '`shouldResetAutoStartedBreakOnFirstIntention()` ne relance qu’un timer dont `isAutoStarted` vaut `true`.',
      },
    ],
    plan: [
      {
        en: 'Carry the automatic-start flag through `convertLongBreakToBreak()`.',
        fr: 'Propager l’indicateur de démarrage automatique dans `convertLongBreakToBreak()`.',
      },
      {
        en: 'Give the converted break a fresh first-intention reset, without making manual breaks eligible.',
        fr: 'Donner à la pause convertie une relance neuve à la première intention, sans rendre les pauses manuelles éligibles.',
      },
      {
        en: 'Keep revision checks, Undo and Redo consistent, and cover the conversion with backend tests.',
        fr: 'Garder cohérents le contrôle de révision, Annuler et Rétablir, et couvrir la conversion par des tests backend.',
      },
    ],
    acceptance: [
      {
        en: 'Converting an auto-started long break keeps the first-intention reset.',
        fr: 'Convertir une pause longue lancée automatiquement conserve la relance à la première intention.',
      },
      {
        en: 'The reset uses the configured short break duration, exactly once.',
        fr: 'La relance utilise la durée de pause courte configurée, une seule fois.',
      },
      {
        en: 'Manual timers and a disabled reset setting never gain an automatic reset.',
        fr: 'Les timers manuels et un réglage désactivé n’obtiennent jamais de relance automatique.',
      },
    ],
    validation: {
      en: 'Test automatic and manual conversion, an already consumed reset, repeated selections, Undo and Redo.',
      fr: 'Tester la conversion automatique et manuelle, une relance déjà consommée, les sélections répétées, Annuler et Rétablir.',
    },
    watchFor: {
      en: 'The long break may already have used its reset; the converted break must start with a fresh one, not inherit that state.',
      fr: 'La pause longue a pu déjà consommer sa relance : la pause convertie doit en recevoir une neuve, pas hériter de cet état.',
    },
    pr: {
      number: 292,
      files: 32,
      additions: 192,
      deletions: 77,
      highlights: [
        {
          en: 'One line in `timer.service.ts`: the new break inherits `isAutoStarted` from the long break.',
          fr: 'Une ligne dans `timer.service.ts` : la nouvelle pause hérite de `isAutoStarted` de la pause longue.',
        },
        {
          en: '`timer-revision-conflicts.test.ts` covers both auto-started and manual long breaks.',
          fr: '`timer-revision-conflicts.test.ts` couvre les pauses longues lancées automatiquement et à la main.',
        },
        {
          en: 'The test also checks the converted break starts with `hasConsumedFirstIntentionReset` unset.',
          fr: 'Le test vérifie aussi que la pause convertie démarre sans `hasConsumedFirstIntentionReset`.',
        },
      ],
    },
  },
  {
    id: 'PERF-281',
    track: 'performance',
    initialStage: 'pr-ready',
    title: {
      en: 'Page timer history with stable cursors',
      fr: 'Paginer l’historique des timers avec des curseurs stables',
    },
    tldr: {
      en: 'Each deeper history page re-scanned every row before it.',
      fr: 'Chaque page d’historique plus ancienne relisait toutes les lignes précédentes.',
    },
    source: 'agent-run',
    area: 'backend',
    effort: 'M',
    goal: {
      en: 'Keep scrolling through older timer history fast and stable, however far back it goes.',
      fr: 'Garder le défilement de l’historique des timers rapide et stable, aussi loin qu’on remonte.',
    },
    today: {
      en: '`getWorkTimerLogs()` sorts by `completedAt` alone and pages with an offset, so deep pages skip ever more rows and a new completion shifts them.',
      fr: '`getWorkTimerLogs()` trie sur `completedAt` seul et pagine par offset : les pages profondes sautent toujours plus de lignes et une nouvelle session terminée les décale.',
    },
    change: {
      en: 'Replace the offset with an opaque cursor over (`completedAt`, `id`), backed by a matching PostgreSQL index.',
      fr: 'Remplacer l’offset par un curseur opaque sur (`completedAt`, `id`), appuyé sur un index PostgreSQL adapté.',
    },
    technical: [
      {
        en: '`GET /work-timer-logs` takes `cursor` and returns `nextCursor` in the shared contract',
        fr: '`GET /work-timer-logs` prend `cursor` et renvoie `nextCursor` dans le contrat partagé',
      },
      {
        en: '`(statistic.completedAt, statistic.id) < (:completedAt, :id)` replaces the offset',
        fr: '`(statistic.completedAt, statistic.id) < (:completedAt, :id)` remplace l’offset',
      },
      {
        en: 'Migration `1789038000000-seekWorkTimerLogHistory.ts` adds `IDX_statistics_user_completed_at_id`',
        fr: 'La migration `1789038000000-seekWorkTimerLogHistory.ts` ajoute `IDX_statistics_user_completed_at_id`',
      },
      {
        en: '`WorkTimerLogsModal.tsx` keeps `nextCursor` and ignores responses from a stale request',
        fr: '`WorkTimerLogsModal.tsx` garde `nextCursor` et ignore les réponses d’une requête périmée',
      },
    ],
    whyNow: {
      en: 'The performance run found deep history pages still skipping every earlier row, with offsets shifting while the history is open.',
      fr: 'Le run performance a trouvé que les pages profondes sautaient encore toutes les lignes précédentes, avec des offsets qui bougent pendant que l’historique est ouvert.',
    },
    evidence: [
      {
        en: '`statistics.service.ts` paged with `offset`, and `WorkTimerLogsModal.tsx` increased it page by page.',
        fr: '`statistics.service.ts` paginait avec `offset`, et `WorkTimerLogsModal.tsx` l’augmentait page après page.',
      },
      {
        en: 'The existing index covers `userId`, `type` and `completedAt`, not the unfiltered history order.',
        fr: 'L’index existant couvre `userId`, `type` et `completedAt`, pas l’ordre de l’historique sans filtre.',
      },
    ],
    plan: [
      {
        en: 'Swap the offset for a validated cursor over (`completedAt`, `id`), always scoped to the signed-in user.',
        fr: 'Remplacer l’offset par un curseur validé sur (`completedAt`, `id`), toujours limité à l’utilisateur connecté.',
      },
      {
        en: 'Add the matching index in a TypeORM migration and keep the statistics indexes.',
        fr: 'Ajouter l’index correspondant dans une migration TypeORM et garder les index des statistiques.',
      },
      {
        en: 'Update the shared schema and the modal together; an edit or delete restarts the list from the top.',
        fr: 'Mettre à jour le schéma partagé et la modale ensemble ; une modification ou une suppression recharge la liste depuis le début.',
      },
    ],
    acceptance: [
      {
        en: 'Logs with equal timestamps page deterministically, with no duplicates.',
        fr: 'Les logs au même horodatage se paginent de façon déterministe, sans doublon.',
      },
      {
        en: 'New completions do not shift an older-history traversal.',
        fr: 'Les nouvelles sessions terminées ne décalent pas un parcours de l’historique ancien.',
      },
      {
        en: 'Deep pages use the seek index with a bounded page size.',
        fr: 'Les pages profondes utilisent l’index de recherche avec une taille de page bornée.',
      },
      {
        en: 'A refresh after an edit or delete drops stale pages and pending responses.',
        fr: 'Un rafraîchissement après modification ou suppression écarte les pages périmées et les réponses en attente.',
      },
    ],
    validation: {
      en: 'Compare query plans and rows visited against offset paging on a migrated database, plus tests that insert rows mid-scroll.',
      fr: 'Comparer plans de requête et lignes parcourues à la pagination par offset sur une base migrée, avec des tests qui insèrent des lignes en cours de défilement.',
    },
    watchFor: {
      en: 'Clients and backend must ship together: there is no shim for a client that still pages by offset.',
      fr: 'Clients et backend doivent sortir ensemble : aucune compatibilité n’est prévue pour un client qui pagine encore par offset.',
    },
    pr: {
      number: 290,
      files: 20,
      additions: 958,
      deletions: 199,
      highlights: [
        {
          en: '`statistics.service.ts` encodes the cursor as base64url JSON, keeps `completedAt` as a bigint string and returns `400` on a bad cursor.',
          fr: '`statistics.service.ts` encode le curseur en JSON base64url, garde `completedAt` en chaîne bigint et renvoie `400` sur un curseur invalide.',
        },
        {
          en: 'New migration `1789038000000-seekWorkTimerLogHistory.ts`, with its own migration test.',
          fr: 'Nouvelle migration `1789038000000-seekWorkTimerLogHistory.ts`, avec son propre test.',
        },
        {
          en: '`app.integration.test.ts` pages through 1,001 logs sharing one timestamp, adds a newer one mid-way, and sees no duplicate or other user’s log.',
          fr: '`app.integration.test.ts` parcourt 1 001 logs au même horodatage, en ajoute un plus récent en route, sans doublon ni log d’un autre utilisateur.',
        },
        {
          en: '`WorkTimerLogsModal.tsx` drops responses after a close and reopen, and de-duplicates appended pages.',
          fr: '`WorkTimerLogsModal.tsx` écarte les réponses après fermeture et réouverture, et dédoublonne les pages ajoutées.',
        },
      ],
    },
  },
  {
    id: 'DOC-4',
    track: 'docs',
    initialStage: 'already-implemented',
    illustrative: true,
    title: {
      en: 'Explain how self-hosters claim the first admin',
      fr: 'Expliquer comment obtenir le premier compte admin en auto-hébergement',
    },
    tldr: {
      en: 'The agent found four places that already explain it.',
      fr: 'L’agent a trouvé quatre endroits qui l’expliquent déjà.',
    },
    source: 'agent-run',
    area: 'backend',
    effort: 'S',
    goal: {
      en: 'Make sure someone self-hosting Pomi knows how the first account becomes the administrator.',
      fr: 'S’assurer qu’une personne qui auto-héberge Pomi sait comment le premier compte devient administrateur.',
    },
    today: {
      en: 'The production backend refuses to start without `POMI_ADMIN_BOOTSTRAP_TOKEN`, and the first sign-up must provide it.',
      fr: 'Le backend de production refuse de démarrer sans `POMI_ADMIN_BOOTSTRAP_TOKEN`, et la première inscription doit le fournir.',
    },
    change: {
      en: 'Add a section on the bootstrap token: what it protects, how to generate it, and when it is asked for.',
      fr: 'Ajouter une section sur le token d’amorçage : ce qu’il protège, comment le générer et quand il est demandé.',
    },
    technical: [
      {
        en: '`validateEnvironment()` requires the token, 32 characters or more, in production',
        fr: '`validateEnvironment()` exige le token, d’au moins 32 caractères, en production',
      },
      {
        en: '`AuthService` asks for it only while `countAdmins()` returns 0',
        fr: '`AuthService` ne le demande que tant que `countAdmins()` renvoie 0',
      },
    ],
    whyNow: {
      en: 'The daily docs run checked required production variables against the setup guides.',
      fr: 'Le run docs quotidien a croisé les variables de production obligatoires avec les guides d’installation.',
    },
    evidence: [
      {
        en: '`validateEnvironment()` throws “POMI_ADMIN_BOOTSTRAP_TOKEN must be at least 32 characters” in production.',
        fr: '`validateEnvironment()` lève « POMI_ADMIN_BOOTSTRAP_TOKEN must be at least 32 characters » en production.',
      },
      {
        en: '`docs/local-setup.md` never mentions the token, while `.env.example` sets a development value.',
        fr: '`docs/local-setup.md` ne mentionne jamais le token, alors que `.env.example` lui donne une valeur de développement.',
      },
    ],
    plan: [
      {
        en: 'Add a “First administrator” section to the self-hosting docs.',
        fr: 'Ajouter une section « Premier administrateur » aux docs d’auto-hébergement.',
      },
      {
        en: 'Say how to generate the token and that the first sign-up form asks for it.',
        fr: 'Indiquer comment générer le token et préciser que le premier formulaire d’inscription le demande.',
      },
      {
        en: 'Link the section from the README.',
        fr: 'Lier la section depuis le README.',
      },
    ],
    acceptance: [
      {
        en: 'A self-hoster can claim the admin account by following the docs alone.',
        fr: 'On peut obtenir le compte admin en suivant uniquement les docs.',
      },
      {
        en: 'The docs say the token is used only for the first account.',
        fr: 'Les docs précisent que le token ne sert qu’au premier compte.',
      },
      {
        en: 'The README’s Self-hosting section links to the guide.',
        fr: 'La section Self-hosting du README renvoie vers le guide.',
      },
    ],
    validation: {
      en: 'Follow the docs on a fresh production Compose stack and create the first account.',
      fr: 'Suivre les docs sur une stack Compose de production neuve et créer le premier compte.',
    },
    watchFor: {
      en: 'Examples must never show a real-looking token value.',
      fr: 'Les exemples ne doivent jamais montrer une valeur de token réaliste.',
    },
    existing: {
      why: {
        en: 'The first-administrator flow is already documented in four places, and they match the code.',
        fr: 'Le parcours du premier administrateur est déjà documenté à quatre endroits, et ils correspondent au code.',
      },
      evidence: [
        {
          en: '`docs/self-hosting-security.md` has a “First administrator” section: 32+ characters, `openssl rand -hex 32`, only the first account can claim it.',
          fr: '`docs/self-hosting-security.md` a une section « First administrator » : 32 caractères minimum, `openssl rand -hex 32`, seul le premier compte peut l’utiliser.',
        },
        {
          en: '`docs/self-hosting.md` lists the token among the four required secrets and says the first account-creation form asks for it.',
          fr: '`docs/self-hosting.md` cite le token parmi les quatre secrets obligatoires et précise que le premier formulaire de création de compte le demande.',
        },
        {
          en: 'The Self-hosting section of `README.md` and a comment in `packages/backend/.env.production.example` say the same.',
          fr: 'La section Self-hosting du `README.md` et un commentaire de `packages/backend/.env.production.example` disent la même chose.',
        },
      ],
      checked: {
        en: 'The agent compared each doc with `validateEnvironment()`, `assertFirstAdminBootstrapToken()` and the sign-up path in `AuthService`.',
        fr: 'L’agent a comparé chaque doc avec `validateEnvironment()`, `assertFirstAdminBootstrapToken()` et le parcours d’inscription de `AuthService`.',
      },
      gap: {
        en: 'No doc says how to make a second account an admin, and the code has no way to do it: only the first sign-up gets the role.',
        fr: 'Aucune doc n’explique comment rendre admin un deuxième compte, et le code ne le permet pas : seule la première inscription reçoit ce rôle.',
      },
    },
  },
  // ---------------------------------------------------------------------- released
  {
    id: 'FEAT-285',
    track: 'feature',
    initialStage: 'released',
    release: 'v0.31.0',
    title: {
      en: 'Review your own AI capture logs',
      fr: 'Relire ses propres logs de capture IA',
    },
    tldr: {
      en: 'Admins can opt in to log, flag and export their AI task captures.',
      fr: 'Les admins peuvent choisir de journaliser, marquer et exporter leurs captures IA.',
    },
    source: 'user-feedback',
    area: 'backend',
    effort: 'L',
    goal: {
      en: 'Let an admin opt in to keep their own AI task captures (input, output, time per step) and flag and export the ones worth a look.',
      fr: 'Permettre à un admin de conserver, s’il le choisit, ses propres captures de tâches par l’IA (entrée, sortie, durée de chaque étape), puis de marquer et d’exporter celles à examiner.',
    },
    today: {
      en: 'Capture logs sat in the debug panel and kept only metadata: `userPrompt` and `processedOutput` were always `null`.',
      fr: 'Les logs de capture étaient dans le panneau de debug et ne gardaient que des métadonnées : `userPrompt` et `processedOutput` valaient toujours `null`.',
    },
    change: {
      en: 'Rename the settings entry to “Admin”, keep AI administration there, and add an opt-in “Capture logs” section for the signed-in admin only.',
      fr: 'Renommer l’entrée des réglages en « Admin », y garder l’administration IA et ajouter une section « Capture logs », sur activation, réservée à l’admin connecté.',
    },
    technical: [
      {
        en: '`AssistantDebugService.recordLog()` keeps the submitted text or transcript (8,000 characters max) and 12 allowlisted task fields',
        fr: '`AssistantDebugService.recordLog()` garde le texte ou la transcription soumis (8 000 caractères max) et 12 champs de tâche autorisés',
      },
      {
        en: '`consentVersion` and `generation` on `assistant_debug_settings`, rechecked under `pg_advisory_xact_lock` before each write',
        fr: '`consentVersion` et `generation` sur `assistant_debug_settings`, revérifiés sous `pg_advisory_xact_lock` avant chaque écriture',
      },
      {
        en: '`AdminGuard` replaces `DebugGuard` on all six capture-log endpoints',
        fr: '`AdminGuard` remplace `DebugGuard` sur les six endpoints des logs de capture',
      },
      {
        en: 'New `AssistantCaptureLogs.tsx` shows input, normalized output, outcome and stage timings',
        fr: 'Nouveau `AssistantCaptureLogs.tsx` qui affiche entrée, sortie normalisée, résultat et durée de chaque étape',
      },
    ],
    whyNow: {
      en: 'From my voice feedback: bring the capture logs back, but only input, output and the speed of each step, behind a simpler “Admin” entry.',
      fr: 'Tiré d’un de mes retours vocaux : remettre les logs de capture, mais seulement l’entrée, la sortie et la vitesse de chaque étape, derrière une entrée « Admin » plus simple.',
    },
    evidence: [
      {
        en: 'In feedback #285 I asked for opt-in logs of my own captures, flags, and an export of the flagged ones.',
        fr: 'Dans le retour #285, je demandais des logs sur activation pour mes propres captures, des marqueurs et un export des captures marquées.',
      },
      {
        en: '`assistant-debug.service.ts` forced `userPrompt` and `processedOutput` to `null`, and `DebugGuard` let any account in outside production.',
        fr: '`assistant-debug.service.ts` forçait `userPrompt` et `processedOutput` à `null`, et `DebugGuard` laissait entrer tout compte hors production.',
      },
    ],
    plan: [
      {
        en: 'Rename the admin entry to “Admin” and move the log UI out of `DebugPanel.tsx` instead of duplicating it.',
        fr: 'Renommer l’entrée admin en « Admin » et sortir l’interface des logs de `DebugPanel.tsx` plutôt que la dupliquer.',
      },
      {
        en: 'Require an admin on every endpoint and recording path; ownership comes only from the signed-in user.',
        fr: 'Exiger un admin sur chaque endpoint et chaque chemin d’enregistrement ; la propriété vient uniquement de l’utilisateur connecté.',
      },
      {
        en: 'Add versioned consent: turning logging off bumps a generation and deletes the logs, so a late capture cannot write them back.',
        fr: 'Ajouter un consentement versionné : désactiver les logs incrémente une génération et les supprime, pour qu’une capture tardive ne puisse pas les réécrire.',
      },
      {
        en: 'Keep the latest 50 unflagged logs plus up to 200 flagged, with size limits and a visible truncation marker.',
        fr: 'Garder les 50 derniers logs non marqués et jusqu’à 200 marqués, avec des limites de taille et un indicateur de troncature visible.',
      },
    ],
    acceptance: [
      {
        en: 'Only admins can enable, view, flag, export or clear capture logs, and only their own.',
        fr: 'Seuls les admins peuvent activer, voir, marquer, exporter ou effacer des logs de capture, et uniquement les leurs.',
      },
      {
        en: 'Logging starts off and needs a fresh opt-in; an old debug setting never counts as consent.',
        fr: 'Les logs sont désactivés par défaut et demandent un nouvel accord ; un ancien réglage de debug ne vaut jamais consentement.',
      },
      {
        en: 'Each capture shows the submitted input, normalized output, outcome and stage timings.',
        fr: 'Chaque capture affiche l’entrée soumise, la sortie normalisée, le résultat et la durée de chaque étape.',
      },
      {
        en: 'Raw audio, credentials, system prompts and provider payloads are never stored.',
        fr: 'L’audio brut, les identifiants, les prompts système et les réponses brutes du fournisseur ne sont jamais stockés.',
      },
    ],
    validation: {
      en: 'Integration test denying every operation to non-admins, unit tests for consent, late writes and the allowlist, and a 440×700 browser test.',
      fr: 'Test d’intégration qui refuse chaque opération aux non-admins, tests unitaires sur le consentement, les écritures tardives et la liste autorisée, et test navigateur en 440×700.',
    },
    watchFor: {
      en: 'The migration switches logging off for every account and keeps 200 flagged logs at most; content scrubbed by an older migration stays gone.',
      fr: 'La migration désactive les logs pour tous les comptes et garde au plus 200 logs marqués ; le contenu effacé par une ancienne migration ne revient pas.',
    },
    pr: {
      number: 297,
      files: 36,
      additions: 1598,
      deletions: 1063,
      highlights: [
        {
          en: '`AssistantCaptureLogs.tsx` on the Admin page replaces about 750 lines of log UI removed from `DebugPanel.tsx`.',
          fr: '`AssistantCaptureLogs.tsx`, sur la page Admin, remplace environ 750 lignes d’interface de logs retirées de `DebugPanel.tsx`.',
        },
        {
          en: '`assistant-debug.service.ts` checks admin and consent generation under a per-user lock and stores errors as a category only.',
          fr: '`assistant-debug.service.ts` vérifie l’admin et la génération de consentement sous un verrou par utilisateur, et ne stocke les erreurs que sous forme de catégorie.',
        },
        {
          en: 'Migration `1789191000000-adminCaptureLogConsent.ts` adds the consent columns, turns logging off everywhere and trims flagged logs to 200.',
          fr: 'La migration `1789191000000-adminCaptureLogConsent.ts` ajoute les colonnes de consentement, désactive les logs partout et limite les logs marqués à 200.',
        },
        {
          en: 'Account import never carries consent over, and `docs/adr/0005-persistent-ai-debug-logs.md` records the new policy.',
          fr: 'L’import de compte ne reprend jamais le consentement, et `docs/adr/0005-persistent-ai-debug-logs.md` consigne la nouvelle règle.',
        },
      ],
    },
  },
  {
    id: 'PERF-288',
    track: 'performance',
    initialStage: 'released',
    release: 'v0.31.0',
    title: {
      en: 'Share concurrent statistics refresh requests',
      fr: 'Partager les requêtes de statistiques simultanées',
    },
    tldr: {
      en: 'Identical reads share one request, and stale replies can’t overwrite fresh data.',
      fr: 'Les lectures identiques partagent une requête, et une vieille réponse n’écrase plus des données fraîches.',
    },
    source: 'agent-run',
    area: 'frontend',
    effort: 'M',
    goal: {
      en: 'Stop the Statistics page from running the same summary and ranking query twice, without ever showing stale numbers.',
      fr: 'Éviter que la page Statistiques lance deux fois la même requête de résumé et de classement, sans jamais afficher de chiffres périmés.',
    },
    today: {
      en: '`fetchStatistics` and `fetchTopIntentions` started a request on every call, keyed by filters only, so going A → B → A could not tell the old A from the new one.',
      fr: '`fetchStatistics` et `fetchTopIntentions` lançaient une requête à chaque appel, avec une clé faite des seuls filtres : en passant de A à B puis à A, impossible de distinguer l’ancien A du nouveau.',
    },
    change: {
      en: 'Add a small request coordinator to `statisticsStore.ts`: identical reads in the same generation share one promise, and each request has its own owner token.',
      fr: 'Ajouter un petit coordinateur de requêtes dans `statisticsStore.ts` : les lectures identiques d’une même génération partagent une promesse, et chaque requête a son propre jeton de propriétaire.',
    },
    technical: [
      {
        en: 'Key = backend origin, user, session token, generation and every filter, ranking metric included',
        fr: 'Clé = origine du backend, utilisateur, token de session, génération et tous les filtres, métrique du classement comprise',
      },
      {
        en: '`invalidateStatisticsRequests()` bumps the generation after a timer-log edit; logout and account changes do too',
        fr: '`invalidateStatisticsRequests()` incrémente la génération après une modification de log ; la déconnexion et le changement de compte aussi',
      },
      {
        en: 'Only the current owner (`activeSummaryRequestKey`) may publish data or clear the loading state',
        fr: 'Seul le propriétaire courant (`activeSummaryRequestKey`) peut publier des données ou retirer l’état de chargement',
      },
      {
        en: 'No cache of settled responses: entries leave the map in `finally`, so failures stay retryable',
        fr: 'Aucun cache des réponses terminées : les entrées quittent la map dans le `finally`, un échec reste donc relançable',
      },
    ],
    whyNow: {
      en: 'Summary and ranking started a request on every call, so overlapping refreshes repeated the same backend aggregation.',
      fr: 'Le résumé et le classement lançaient une requête à chaque appel : des rafraîchissements qui se chevauchent refaisaient la même agrégation côté backend.',
    },
    evidence: [
      {
        en: '`Statistics.tsx` refreshes both after every timer-log edit, and effects call the ranking again.',
        fr: '`Statistics.tsx` rafraîchit les deux après chaque modification de log, et des effets relancent le classement.',
      },
      {
        en: 'No production latency was measured: the gain is counted in requests, not milliseconds.',
        fr: 'Aucune latence n’a été mesurée en production : le gain se compte en requêtes, pas en millisecondes.',
      },
    ],
    plan: [
      {
        en: 'Key in-flight reads by account, endpoint, filters and a freshness generation.',
        fr: 'Indexer les lectures en cours par compte, endpoint, filtres et génération de fraîcheur.',
      },
      {
        en: 'Bump the generation on timer-log edits, logout and account or backend changes.',
        fr: 'Incrémenter la génération à chaque modification de log, déconnexion et changement de compte ou de backend.',
      },
      {
        en: 'Give each request a unique owner so an older success, error or `finally` cannot clear newer state.',
        fr: 'Donner à chaque requête un propriétaire unique, pour qu’un ancien succès, une erreur ou un `finally` n’efface pas un état plus récent.',
      },
      {
        en: 'Prove it with deferred-response tests that count HTTP calls.',
        fr: 'Le prouver avec des tests à réponses différées qui comptent les appels HTTP.',
      },
    ],
    acceptance: [
      {
        en: 'Concurrent identical reads in one generation send one HTTP request.',
        fr: 'Des lectures identiques simultanées dans une même génération n’envoient qu’une requête HTTP.',
      },
      {
        en: 'An edit forces fresh reads, even while older ones are still pending.',
        fr: 'Une modification force des lectures fraîches, même si d’anciennes sont encore en cours.',
      },
      {
        en: 'Logout or another account never reuses or shows earlier responses.',
        fr: 'Une déconnexion ou un autre compte ne réutilise ni n’affiche jamais d’anciennes réponses.',
      },
      {
        en: 'Settled requests are dropped, and failures can be retried.',
        fr: 'Les requêtes terminées sont retirées, et un échec peut être relancé.',
      },
    ],
    validation: {
      en: 'jsdom tests in `statisticsStore.network.test.ts` with controllable responses: identical callers, A → B → A, an edit mid-read, an account switch and a retry.',
      fr: 'Tests jsdom dans `statisticsStore.network.test.ts` avec des réponses contrôlées : appels identiques, A → B → A, modification en pleine lecture, changement de compte et nouvel essai.',
    },
    watchFor: {
      en: 'The yearly heatmap stays out of scope and keeps its own request guard, `activeHeatmapRequestKey`.',
      fr: 'La heatmap annuelle reste hors périmètre et garde sa propre protection, `activeHeatmapRequestKey`.',
    },
    pr: {
      number: 296,
      files: 22,
      additions: 1359,
      deletions: 528,
      highlights: [
        {
          en: '`statisticsStore.ts`: `summaryRequests` and `topIntentionRequests` share in-flight reads per key and generation.',
          fr: '`statisticsStore.ts` : `summaryRequests` et `topIntentionRequests` partagent les lectures en cours par clé et par génération.',
        },
        {
          en: '`Statistics.tsx` calls `invalidateStatisticsRequests()` before refreshing after a timer-log edit.',
          fr: '`Statistics.tsx` appelle `invalidateStatisticsRequests()` avant de rafraîchir après une modification de log.',
        },
        {
          en: 'New `statisticsStore.network.test.ts` with seven deferred-response cases, ranking metrics included.',
          fr: 'Nouveau `statisticsStore.network.test.ts` avec sept cas à réponses différées, métriques de classement comprises.',
        },
      ],
    },
  },
  {
    id: 'SEC-193',
    track: 'security',
    initialStage: 'released',
    release: 'v0.30.1',
    title: {
      en: 'Replace 90-day tokens with rotating sessions',
      fr: 'Remplacer les tokens de 90 jours par des sessions rotatives',
    },
    tldr: {
      en: 'Logout now ends the session on the server, without signing anyone out more often.',
      fr: 'La déconnexion met fin à la session côté serveur, sans déconnecter personne plus souvent.',
    },
    source: 'agent-run',
    area: 'backend',
    effort: 'L',
    goal: {
      en: 'Keep a stolen token useful for minutes, not months, and make logout and refresh-token replay enforceable on the server.',
      fr: 'Qu’un token volé ne serve que quelques minutes, pas des mois, et que la déconnexion et le rejeu d’un refresh token soient appliqués côté serveur.',
    },
    today: {
      en: '`AuthModule` issued 90-day JWTs that `authStore.ts` kept in localStorage, and logout cleared the client without revoking anything on the server.',
      fr: '`AuthModule` émettait des JWT valables 90 jours que `authStore.ts` gardait dans le localStorage, et la déconnexion vidait le client sans rien révoquer côté serveur.',
    },
    change: {
      en: '15-minute access tokens tied to a server session, plus refresh credentials that rotate on each use and revoke their whole family when replayed.',
      fr: 'Des tokens d’accès de 15 minutes liés à une session serveur, et des identifiants de rafraîchissement qui changent à chaque usage et révoquent toute leur famille en cas de rejeu.',
    },
    technical: [
      {
        en: '`SessionService` stores hashed refresh secrets in the new `auth_sessions` table',
        fr: '`SessionService` stocke des secrets de rafraîchissement hachés dans la nouvelle table `auth_sessions`',
      },
      {
        en: '`AuthGuard` and `TimerGateway` check the token’s `sid` against an active session',
        fr: '`AuthGuard` et `TimerGateway` vérifient le `sid` du token auprès d’une session active',
      },
      {
        en: 'Web secret in an HttpOnly cookie scoped to `/sessions`; desktop uses the OS keyring, Wear the Android Keystore',
        fr: 'Secret web dans un cookie HttpOnly limité à `/sessions` ; le desktop utilise le trousseau du système, la montre l’Android Keystore',
      },
      {
        en: 'Sessions expire after 365 days without use (`SESSION_INACTIVITY_MS`), renewed on every refresh',
        fr: 'Les sessions expirent après 365 jours sans usage (`SESSION_INACTIVITY_MS`), prolongées à chaque rafraîchissement',
      },
    ],
    whyNow: {
      en: 'The security run found that a token copied from localStorage kept full API and socket access for 90 days, even after logout.',
      fr: 'Le run de sécurité a constaté qu’un token copié depuis le localStorage gardait un accès complet à l’API et aux sockets pendant 90 jours, même après déconnexion.',
    },
    evidence: [
      {
        en: 'Tokens were signed with a 90-day expiry, and `AuthGuard` only verified the signature.',
        fr: 'Les tokens étaient signés pour 90 jours, et `AuthGuard` ne vérifiait que la signature.',
      },
      {
        en: 'The logout route, `deleteCurrent`, recorded no revocation on the server.',
        fr: 'La route de déconnexion, `deleteCurrent`, n’enregistrait aucune révocation côté serveur.',
      },
    ],
    plan: [
      {
        en: 'Follow the condition I set when accepting: no more sign-ins than today, ideally fewer.',
        fr: 'Respecter la condition que j’ai posée en acceptant : pas plus de reconnexions qu’aujourd’hui, idéalement moins.',
      },
      {
        en: 'Add the session table and refresh endpoints, with a 365-day sliding expiry and no fixed cutoff.',
        fr: 'Ajouter la table des sessions et les endpoints de rafraîchissement, avec une expiration glissante de 365 jours et aucune limite fixe.',
      },
      {
        en: 'Keep access tokens in memory, and refresh secrets in an HttpOnly cookie, the OS keyring or the Android Keystore.',
        fr: 'Garder les tokens d’accès en mémoire, et les secrets de rafraîchissement dans un cookie HttpOnly, le trousseau du système ou l’Android Keystore.',
      },
      {
        en: 'Swap still-valid old tokens for a session during a window set by `POMI_LEGACY_JWT_MIGRATION_UNTIL`, then reject them.',
        fr: 'Échanger les anciens tokens encore valides contre une session pendant une fenêtre fixée par `POMI_LEGACY_JWT_MIGRATION_UNTIL`, puis les refuser.',
      },
    ],
    acceptance: [
      {
        en: 'Access tokens expire within 15 minutes and carry a server session id.',
        fr: 'Les tokens d’accès expirent en 15 minutes au plus et portent un id de session serveur.',
      },
      {
        en: 'Replaying a refresh token revokes its whole session family.',
        fr: 'Rejouer un refresh token révoque toute sa famille de sessions.',
      },
      {
        en: 'Logout revokes the server session before clearing local credentials.',
        fr: 'La déconnexion révoque la session serveur avant d’effacer les identifiants locaux.',
      },
      {
        en: 'Active users stay signed in past 90 days without doing anything.',
        fr: 'Un utilisateur actif reste connecté au-delà de 90 jours sans rien faire.',
      },
    ],
    validation: {
      en: 'Integration tests on migrated PostgreSQL and Redis for rotation, replay, logout, expiry and concurrent refresh, plus frontend and Wear tests on where secrets are stored.',
      fr: 'Tests d’intégration sur PostgreSQL et Redis migrés pour la rotation, le rejeu, la déconnexion, l’expiration et les rafraîchissements simultanés, plus des tests frontend et montre sur le stockage des secrets.',
    },
    watchFor: {
      en: 'Two legitimate refreshes at the same moment must not look like a replay, or a working device gets signed out.',
      fr: 'Deux rafraîchissements légitimes au même moment ne doivent pas passer pour un rejeu, sinon un appareil valide est déconnecté.',
    },
    pr: {
      number: 233,
      files: 92,
      additions: 3144,
      deletions: 349,
      highlights: [
        {
          en: 'New `SessionService`, `auth_sessions` migration and refresh route, with rotation and family revocation.',
          fr: 'Nouveaux `SessionService`, migration `auth_sessions` et route de rafraîchissement, avec rotation et révocation par famille.',
        },
        {
          en: '`authStore.ts` keeps the access token in memory and refreshes it in a single flight before expiry.',
          fr: '`authStore.ts` garde le token d’accès en mémoire et le rafraîchit en un seul appel avant expiration.',
        },
        {
          en: 'Desktop secrets go through `tauri-plugin-keyring`; Wear gets `RefreshTokenVault.kt`.',
          fr: 'Sur desktop, les secrets passent par `tauri-plugin-keyring` ; la montre reçoit `RefreshTokenVault.kt`.',
        },
        {
          en: '`docs/self-hosting.md` explains the upgrade order and the legacy-token window.',
          fr: '`docs/self-hosting.md` explique l’ordre de mise à jour et la fenêtre des anciens tokens.',
        },
      ],
    },
  },
  {
    id: 'BUG-276',
    track: 'bug',
    initialStage: 'released',
    release: 'v0.31.0',
    title: {
      en: 'Escape leaves focus on the task filter',
      fr: 'Échap laisse le focus sur le filtre des tâches',
    },
    tldr: {
      en: 'Escape should let go of focus, like the task search does.',
      fr: 'Échap doit relâcher le focus, comme la recherche de tâches.',
    },
    source: 'user-feedback',
    area: 'frontend',
    effort: 'S',
    goal: {
      en: 'After Escape closes the task workspace’s destination filter, focus stays on its trigger.',
      fr: 'Après la fermeture du filtre de destination par Échap, le focus reste sur son déclencheur.',
    },
    today: {
      en: 'The task search next to it blurs on Escape; the filter closes but keeps focus, so it still looks active.',
      fr: 'La recherche de tâches juste à côté perd le focus avec Échap ; le filtre, lui, se ferme mais garde le focus et semble encore actif.',
    },
    change: {
      en: 'Give Escape its own focus rule in `IntentionAssignmentPicker`: a required `returnFocusOnEscape` prop, `false` on the task filter.',
      fr: 'Donner à Échap sa propre règle de focus dans `IntentionAssignmentPicker` : une prop obligatoire `returnFocusOnEscape`, à `false` sur le filtre des tâches.',
    },
    technical: [
      {
        en: 'The Escape handlers read `returnFocusOnEscape` instead of `returnFocusOnClose`',
        fr: 'Les handlers d’Échap lisent `returnFocusOnEscape` au lieu de `returnFocusOnClose`',
      },
      {
        en: 'No default value, so `tsc` makes every caller choose, as `AGENTS.md` asks for new parameters',
        fr: 'Pas de valeur par défaut : `tsc` oblige chaque appelant à choisir, comme `AGENTS.md` l’exige pour tout nouveau paramètre',
      },
      {
        en: '`TaskIntentionFilterDropdown` passes `false`; the task editor, Statistics and the timer-log modal keep focus',
        fr: '`TaskIntentionFilterDropdown` passe `false` ; l’éditeur de tâche, les Statistiques et la modale des logs gardent le focus',
      },
    ],
    whyNow: {
      en: 'My voice feedback: the search already drops focus on Escape, and I wanted the same on the filter.',
      fr: 'Mon retour vocal : la recherche relâche déjà le focus avec Échap, je voulais la même chose sur le filtre.',
    },
    evidence: [
      {
        en: '`returnFocusOnClose` defaults to `true`, and the Escape handler used it to re-focus the trigger.',
        fr: '`returnFocusOnClose` vaut `true` par défaut, et le handler d’Échap s’en servait pour rendre le focus au déclencheur.',
      },
      {
        en: '`TaskWorkspace.tsx` passed no override for the filter; the report came from the macOS app.',
        fr: '`TaskWorkspace.tsx` ne passait aucune valeur pour le filtre ; le retour venait de l’app macOS.',
      },
    ],
    plan: [
      {
        en: 'Separate Escape from selection and outside clicks in the shared picker.',
        fr: 'Distinguer Échap de la sélection et du clic extérieur dans le sélecteur partagé.',
      },
      {
        en: 'Blur the task filter on Escape, from its search field and from its trigger.',
        fr: 'Retirer le focus du filtre des tâches avec Échap, depuis son champ de recherche comme depuis son déclencheur.',
      },
      {
        en: 'Keep returning focus inside modals that use the same picker.',
        fr: 'Continuer à rendre le focus dans les modales qui utilisent le même sélecteur.',
      },
      {
        en: 'Cover it in the workspace browser test.',
        fr: 'Le couvrir dans le test navigateur du workspace.',
      },
    ],
    acceptance: [
      {
        en: 'Escape closes the filter and leaves its trigger unfocused.',
        fr: 'Échap ferme le filtre et laisse son déclencheur sans focus.',
      },
      {
        en: 'Escape keeps the selected filters and drafts.',
        fr: 'Échap conserve les filtres sélectionnés et les brouillons.',
      },
      {
        en: 'Pressing the shortcut again reopens the filter instead of toggling it closed.',
        fr: 'Rappuyer sur le raccourci rouvre le filtre au lieu de le refermer.',
      },
    ],
    validation: {
      en: '`workspace.browser.test.tsx` opens the filter with its shortcut three times, presses Escape, and checks it is closed and no longer focused.',
      fr: '`workspace.browser.test.tsx` ouvre le filtre trois fois avec son raccourci, appuie sur Échap et vérifie qu’il est fermé et n’a plus le focus.',
    },
    watchFor: {
      en: 'Inside modals, Escape must still hand focus back to the trigger, or keyboard users lose their place.',
      fr: 'Dans les modales, Échap doit toujours rendre le focus au déclencheur, sinon l’utilisateur au clavier perd sa place.',
    },
    pr: {
      number: 292,
      files: 32,
      additions: 192,
      deletions: 77,
      highlights: [
        {
          en: 'New required `returnFocusOnEscape` prop on `IntentionAssignmentPicker`.',
          fr: 'Nouvelle prop obligatoire `returnFocusOnEscape` sur `IntentionAssignmentPicker`.',
        },
        {
          en: '`TaskIntentionFilterDropdown` and `TaskImportModal` blur on Escape; `TaskFormModal`, `Statistics.tsx` and `WorkTimerLogsModal` keep focus.',
          fr: '`TaskIntentionFilterDropdown` et `TaskImportModal` relâchent le focus avec Échap ; `TaskFormModal`, `Statistics.tsx` et `WorkTimerLogsModal` le gardent.',
        },
        {
          en: '`workspace.browser.test.tsx` now asserts the filter is not `document.activeElement` after Escape.',
          fr: '`workspace.browser.test.tsx` vérifie désormais que le filtre n’est plus `document.activeElement` après Échap.',
        },
      ],
    },
  },
  {
    id: 'DEP-221',
    track: 'dependencies',
    initialStage: 'released',
    release: 'v0.30.1',
    title: {
      en: 'Move the shared API contract to Zod 4',
      fr: 'Passer le contrat d’API partagé à Zod 4',
    },
    tldr: {
      en: 'Faster validation on every request, without leaving ts-rest.',
      fr: 'Une validation plus rapide à chaque requête, sans quitter ts-rest.',
    },
    source: 'agent-run',
    area: 'shared',
    effort: 'L',
    goal: {
      en: 'Run the schemas shared by the backend and every client on Zod 4, which validates far faster, without breaking ts-rest or the OpenAPI output.',
      fr: 'Faire tourner sur Zod 4, bien plus rapide à valider, les schémas partagés par le backend et tous les clients, sans casser ts-rest ni la sortie OpenAPI.',
    },
    today: {
      en: '`packages/shared` pinned Zod 3.25.76, and ts-rest 3.52.1 only declares support for Zod 3.',
      fr: '`packages/shared` figeait Zod 3.25.76, et ts-rest 3.52.1 ne déclare supporter que Zod 3.',
    },
    change: {
      en: 'Pin `zod` 4.5.4 everywhere and put thin ts-rest adapters on both sides, plus a patch so OpenAPI generation reads Zod 4 schemas.',
      fr: 'Figer `zod` en 4.5.4 partout et ajouter de fins adaptateurs ts-rest des deux côtés, plus un patch pour que la génération OpenAPI lise les schémas Zod 4.',
    },
    technical: [
      {
        en: '`pnpm-workspace.yaml`: a `zod: 4.5.4` override and a peer rule that lets ts-rest accept it',
        fr: '`pnpm-workspace.yaml` : un override `zod: 4.5.4` et une règle de peer qui permet à ts-rest de l’accepter',
      },
      {
        en: 'Backend controllers import `TsRestHandler` from `ts-rest-zod4.adapter.ts`',
        fr: 'Les contrôleurs backend importent `TsRestHandler` depuis `ts-rest-zod4.adapter.ts`',
      },
      {
        en: 'The frontend `apiClient.ts` is typed through `TsRestZod4Client`',
        fr: 'Côté frontend, `apiClient.ts` est typé via `TsRestZod4Client`',
      },
      {
        en: '`patches/@ts-rest__open-api@3.52.1.patch` builds OpenAPI with `z.toJSONSchema`',
        fr: '`patches/@ts-rest__open-api@3.52.1.patch` génère l’OpenAPI avec `z.toJSONSchema`',
      },
    ],
    whyNow: {
      en: 'The shared contract holds hundreds of schemas used on every request, and Zod 4 reports large gains on object and array parsing.',
      fr: 'Le contrat partagé contient des centaines de schémas utilisés à chaque requête, et Zod 4 annonce de gros gains sur le parsing d’objets et de tableaux.',
    },
    evidence: [
      {
        en: '863 Zod expressions in `packages/shared/src/api/contract.ts`; the stable latest on npm was 4.5.4.',
        fr: '863 expressions Zod dans `packages/shared/src/api/contract.ts` ; la dernière version stable sur npm était la 4.5.4.',
      },
      {
        en: '`@ts-rest/core` 3.52.1 declares a Zod 3-only peer range, so the upgrade needed adapters, not just a version bump.',
        fr: '`@ts-rest/core` 3.52.1 déclare une plage de peer limitée à Zod 3 : la montée demandait des adaptateurs, pas seulement un changement de version.',
      },
    ],
    plan: [
      {
        en: 'Add Zod-neutral ts-rest adapters for the backend handlers and the frontend client.',
        fr: 'Ajouter des adaptateurs ts-rest indépendants de Zod pour les handlers backend et le client frontend.',
      },
      {
        en: 'Move the schemas to Zod 4 behind parity tests against the Zod 3 behaviour.',
        fr: 'Passer les schémas à Zod 4 derrière des tests de parité avec le comportement de Zod 3.',
      },
      {
        en: 'Patch `@ts-rest/open-api` so the generated OpenAPI keeps its parameters and responses.',
        fr: 'Patcher `@ts-rest/open-api` pour que l’OpenAPI généré garde ses paramètres et ses réponses.',
      },
      {
        en: 'Benchmark validation and keep a single-revert path back to 3.25.76.',
        fr: 'Mesurer la validation et garder un retour à 3.25.76 en un seul revert.',
      },
    ],
    acceptance: [
      {
        en: 'Every shared schema keeps its validation, transforms, OpenAPI output and inferred types.',
        fr: 'Chaque schéma partagé garde sa validation, ses transformations, sa sortie OpenAPI et ses types inférés.',
      },
      {
        en: 'Object and array validation is at least twice as fast.',
        fr: 'La validation d’objets et de tableaux est au moins deux fois plus rapide.',
      },
      {
        en: 'Every pin resolves to stable 4.5.4, with no prerelease ts-rest.',
        fr: 'Chaque version figée pointe vers la 4.5.4 stable, sans ts-rest en préversion.',
      },
      {
        en: 'One revert restores Zod 3.25.76 and the previous contracts.',
        fr: 'Un seul revert restaure Zod 3.25.76 et les contrats précédents.',
      },
    ],
    validation: {
      en: '`contract.test.ts` parses the same samples with Zod 3 and Zod 4, `zod4-openapi.adapter.test.ts` checks the OpenAPI output, and `pnpm benchmark:zod-validation` measures speed.',
      fr: '`contract.test.ts` parse les mêmes échantillons avec Zod 3 et Zod 4, `zod4-openapi.adapter.test.ts` vérifie la sortie OpenAPI, et `pnpm benchmark:zod-validation` mesure la vitesse.',
    },
    watchFor: {
      en: 'ts-rest still officially supports only Zod 3, so the adapters and the patch need a check on every ts-rest upgrade.',
      fr: 'ts-rest ne supporte toujours officiellement que Zod 3 : adaptateurs et patch sont à revérifier à chaque mise à jour de ts-rest.',
    },
    migration: { pkg: 'zod', from: '3.25.76', to: '4.5.4' },
    pr: {
      number: 242,
      files: 54,
      additions: 1439,
      deletions: 168,
      highlights: [
        {
          en: '`zod` pinned to 4.5.4 in `packages/shared`, the frontend and `pnpm-workspace.yaml`.',
          fr: '`zod` figé en 4.5.4 dans `packages/shared`, le frontend et `pnpm-workspace.yaml`.',
        },
        {
          en: '16 backend controllers switch to `ts-rest-zod4.adapter.ts`.',
          fr: '16 contrôleurs backend passent par `ts-rest-zod4.adapter.ts`.',
        },
        {
          en: '`zod4-validation-benchmark.md`: median 10.6× faster on objects and 8.5× on arrays than the Zod 3 API.',
          fr: '`zod4-validation-benchmark.md` : en médiane, 10,6× plus rapide sur les objets et 8,5× sur les tableaux que l’API Zod 3.',
        },
        {
          en: 'Parity test in `contract.test.ts` and an OpenAPI test in `zod4-openapi.adapter.test.ts`.',
          fr: 'Test de parité dans `contract.test.ts` et test OpenAPI dans `zod4-openapi.adapter.test.ts`.',
        },
      ],
    },
  },
  {
    id: 'DOC-5',
    illustrative: true,
    track: 'docs',
    initialStage: 'released',
    release: 'v0.31.0',
    title: {
      en: 'Repo memory: reset timer on first Intention',
      fr: 'Mémoire du repo : réinitialiser le timer à la première Intention',
    },
    tldr: {
      en: 'Two bugs on one rule, now written where every agent run starts.',
      fr: 'Deux bugs sur la même règle, désormais écrite là où chaque run d’agent commence.',
    },
    source: 'agent-run',
    area: 'backend',
    effort: 'S',
    goal: {
      en: 'Write down the “Reset timer on first Intention” rules I settled, where every agent reads before planning.',
      fr: 'Écrire les règles du réglage « réinitialiser le timer à la première Intention » que j’ai tranchées, là où chaque agent lit avant de planifier.',
    },
    today: {
      en: 'The rules live in three closed issues and in `timer.service.ts`; `CONTEXT.md` and `AGENTS.md` say nothing about them.',
      fr: 'Les règles vivent dans trois issues fermées et dans `timer.service.ts` ; `CONTEXT.md` et `AGENTS.md` n’en disent rien.',
    },
    change: {
      en: 'Add a “First-Intention reset” entry to `CONTEXT.md` and one rule to `AGENTS.md` for code that starts or converts a Timer.',
      fr: 'Ajouter une entrée « First-Intention reset » à `CONTEXT.md` et une règle à `AGENTS.md` pour le code qui démarre ou convertit un Timer.',
    },
    technical: [
      {
        en: '`CONTEXT.md` › Language: new entry next to Timer extension, with the three decided rules',
        fr: '`CONTEXT.md` › Language : nouvelle entrée à côté de Timer extension, avec les trois règles tranchées',
      },
      {
        en: '`AGENTS.md` › Architecture Rules: new Timer paths keep `isAutoStarted` and `hasConsumedFirstIntentionReset`',
        fr: '`AGENTS.md` › Architecture Rules : tout nouveau chemin de Timer conserve `isAutoStarted` et `hasConsumedFirstIntentionReset`',
      },
      {
        en: 'The entry points to `shouldResetAutoStartedBreakOnFirstIntention()` instead of copying its conditions',
        fr: 'L’entrée renvoie vers `shouldResetAutoStartedBreakOnFirstIntention()` au lieu de recopier ses conditions',
      },
    ],
    whyNow: {
      en: 'Bug #283 broke the same rule a few days after #209 shipped, through another path: `convertLongBreakToBreak()`.',
      fr: 'Le bug #283 a cassé la même règle quelques jours après la sortie de #209, par un autre chemin : `convertLongBreakToBreak()`.',
    },
    evidence: [
      {
        en: '#209: the radar recommended keeping the running Break’s duration; I chose the opposite when accepting.',
        fr: '#209 : le radar recommandait de garder la durée de la pause en cours ; j’ai choisi l’inverse en acceptant.',
      },
      {
        en: '#283: `convertLongBreakToBreak()` created the Break without `isAutoStarted`, so it never reset.',
        fr: '#283 : `convertLongBreakToBreak()` créait la pause sans `isAutoStarted`, elle ne se réinitialisait donc jamais.',
      },
    ],
    inconsistencies: [
      {
        source: 'Issue #209 · radar',
        says: {
          en: 'Keep the running 5-minute Break; a custom Intention duration only applies to a fresh Timer.',
          fr: 'Garder la pause de 5 minutes en cours ; une durée d’Intention personnalisée ne s’applique qu’à un nouveau Timer.',
        },
      },
      {
        source: 'Issue #209, my accept comment',
        says: {
          en: 'With the setting on, the selected Intention’s duration always wins.',
          fr: 'Réglage activé, la durée de l’Intention choisie l’emporte toujours.',
        },
      },
      {
        source: 'CONTEXT.md',
        says: {
          en: 'Defines Timer, Session and Timer extension, but has no entry for this setting.',
          fr: 'Définit Timer, Session et Timer extension, mais n’a aucune entrée pour ce réglage.',
        },
      },
    ],
    plan: [
      {
        en: 'Write the three rules into `CONTEXT.md`: auto-started timers only, once; the selected Intention’s custom duration wins; a converted Long break stays eligible.',
        fr: 'Écrire les trois règles dans `CONTEXT.md` : timers démarrés automatiquement seulement, une seule fois ; la durée personnalisée de l’Intention choisie l’emporte ; une pause longue convertie reste éligible.',
      },
      {
        en: 'Add one line to `AGENTS.md` for any code path that starts or converts a Timer.',
        fr: 'Ajouter une ligne à `AGENTS.md` pour tout chemin de code qui démarre ou convertit un Timer.',
      },
      {
        en: 'Link #169, #209 and #283, so the next plan reads the decisions and not only the code.',
        fr: 'Lier #169, #209 et #283, pour que le prochain plan lise les décisions et pas seulement le code.',
      },
    ],
    acceptance: [
      {
        en: '`CONTEXT.md` says which duration wins and when the reset happens.',
        fr: '`CONTEXT.md` dit quelle durée l’emporte et quand la réinitialisation a lieu.',
      },
      {
        en: '`AGENTS.md` names the fields a new Timer path must keep.',
        fr: '`AGENTS.md` nomme les champs qu’un nouveau chemin de Timer doit conserver.',
      },
      {
        en: 'Every symbol the entry names exists in `timer.service.ts`.',
        fr: 'Chaque symbole cité par l’entrée existe dans `timer.service.ts`.',
      },
    ],
    validation: {
      en: 'Docs only: a grep checks each named symbol against the code, and the next radar plan touching timers cites the entry.',
      fr: 'Docs uniquement : un grep vérifie chaque symbole cité dans le code, et le prochain plan du radar sur les timers cite l’entrée.',
    },
    watchFor: {
      en: 'Docs go stale when code moves: the entry links to the check in code rather than restating it.',
      fr: 'Une doc vieillit quand le code bouge : l’entrée renvoie à la vérification dans le code plutôt que de la recopier.',
    },
    pr: {
      number: 407,
      files: 2,
      additions: 18,
      deletions: 0,
      highlights: [
        {
          en: '`CONTEXT.md` gains a “First-Intention reset” entry: when the reset happens, only once, and which duration wins.',
          fr: '`CONTEXT.md` gagne une entrée « First-Intention reset » : quand la réinitialisation a lieu, une seule fois, et quelle durée l’emporte.',
        },
        {
          en: '`AGENTS.md` › Architecture Rules: new Timer paths keep `isAutoStarted`.',
          fr: '`AGENTS.md` › Architecture Rules : les nouveaux chemins de Timer conservent `isAutoStarted`.',
        },
      ],
    },
  },
];
