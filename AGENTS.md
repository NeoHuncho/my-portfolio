<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Working on this site

The rules below are the current state of the owner's feedback on this portfolio. Read them before
changing copy, the hero's 3D, the CVs or the `design/` assets. Where the code and these rules
disagree, ask rather than guess.

## Repo basics

- `pnpm dev` serves on port 3009. `pnpm test` runs the Prettier check, ESLint, typecheck and Jest.
- Production deploys on Vercel from `master`: "main" and "push to main" mean `master`. Vercel can
  take 15+ minutes to pick up a push.
- Copy lives in `config/*.ts` (`translations.ts`, `experience.ts`, `sideProjects.ts`, `board.ts`,
  `boardTickets.ts`) and `cv/content.mjs`. Check every change in English and in French against the
  rules below.
- Images under `/assets` and `.jpg` files are cached as immutable for a year, so a re-saved file
  never reaches returning visitors: import images statically (content-hashed URL), or give a changed
  file a new name.
- In-page links (header menu, hero buttons, logo) scroll without writing a `#hash` into the URL and
  clear one the page was opened with (`components/InPageLinks.tsx`), so a copied URL opens at the
  top.
- The past-versions feature (version badge, palette group, `public/versions` builds) was removed on
  purpose. Don't bring it back.
- `design/` (LinkedIn banner, logo concepts) is local working material and stays uncommitted.
- `pnpm build:games` builds the GameHub embeds into `public/games/` from a local GameHub checkout
  (`scripts/build-games.mjs`, `scripts/game-embed/`).

## Copy

### Voice

- The site is read by employers: mainly Swiss companies hiring for in-office roles, not freelance
  clients.
- Plain, factual sentences, the way the owner would say them out loud. No slogans: no punchy
  two-beat lines, no colon openers ("Agentic engineering: …"), no staccato titles, no rousing
  closers. Rejected examples: "Agents do the legwork. I make the calls.", "stand behind what ships",
  "Fork, fix, publish", "My job is getting the plans right…", "The technical choices stay mine…", "I
  understand everything that ships", « Les agents font le gros du travail. Moi, je tranche. »
- Nothing defensive (no "not side businesses", no reassuring closing claim). Keep the tone relaxed.
- Concise, especially on desktop and landscape: little wording, only what matters. Desk explanations
  run about two lines.
- No filler labels or captions: no column subtitles, eyebrows such as "On my desk", "Live demo"
  badges or "Tap/click anything" hints. Labels that explain the page's structure are fine.
- Every explanatory body stands alone: it names its subject and never relies on the title above it.
- Personal habits are never phrased as needs ("I love to move", not "I need to move").
- Tech stacks are ordered by how central each technology was: the most attractive first, minor
  libraries last.

### Honesty

- Don't invent metrics, domains, platforms or certifications. The owner automates parts of the
  development process, not company departments.
- The copy says the owner makes the engineering decisions. Agents plan and implement, CI checks.
  Never phrase agents reviewing or gating PRs in a way that makes him a bystander, and never say he
  no longer writes code ("Agents write most of my code").
- No "I review every pull request" claim, except for Pomi (a solo project). Never claim he reads
  every line; Zenride's "reviewed every line" is the one place it stays.
- AI inside a product exists only in the side projects. Never claim shipped product AI at work.
- No confidence scores, no tracing or observability claims, no adoption claims, no "lead dev"
  wording.
- No pull-request counts.
- No open-source licence names.
- No model version names in experience copy: the Zenride AI note names tools only (GitHub Copilot,
  then Claude Code).
- Client work is described generically ("a Swiss financial-planning platform used by wealth
  advisors"). Never name an employer's clients.

### Facts that hold

- Five years of experience (the timeline starts in September 2021). Experience title: "Five years
  building web and mobile products." / « Cinq ans à construire des produits web et mobiles. »
- Lausanne, Switzerland. Swiss B permit, as an EU/EFTA national. Dual British and French citizen,
  English and French both native (no certificates). German: A2, school level; write "A2 (school
  level)" / « A2 (niveau scolaire) », never more.
- Every role was full time: "Full time" / « Temps plein » beside the dates on the timeline cards
  (under them on phones) and alone on the detail card. Never "100%".
- Cagette & Paprika (Lille, France): Junior Full-stack Developer / Développeur Full-stack Junior.
  Zenride (Paris, France): Full-stack Developer, ranked #1 of 9 developers for features shipped in
  H1 2025. Apptitude (Lausanne, since March 2026): Full-stack Developer / Développeur Full-stack, in
  a project team of two developers.
- Vikunja Voice Assistant: 60+ stars, 200+ installs.
- Education: Concordia, "Bachelor of Commerce, major in Business Technology Management" (2021),
  never "Bachelor of Business Technology Management". freeCodeCamp: two legacy certifications only
  (Responsive Web Design, JavaScript Algorithms and Data Structures), never a "Full Stack Developer
  certification".

### Titles

- Full-stack always comes first. Hero title "Full-stack Engineer." / « Développeur full-stack. »;
  page title and meta "Full-stack Engineer".
- Never "AI Engineer" / « Développeur IA » as a job title, anywhere (site, CVs, forms). The footer
  may say the owner is open to "full-stack and AI engineering roles in Switzerland" / « postes de
  développeur full-stack ou IA ».
- Join title parts with "·", never « et ».

### Hero copy

- Subtitle: one sentence everywhere (site and meta description): "I build software with AI agents,
  and the setup that lets them work well in a real codebase." / « Je développe avec des agents IA,
  et l’outillage qui les rend fiables sur une vraie codebase. » No follow-up sentence or closing
  claim, and don't propose one unless asked.
- Facts line: Lausanne · Swiss B permit · English and French, both native.
- Byline: the portrait and the name on one line, in Geist Sans (no mono uppercase eyebrow). The
  header shows the mark alone while the byline is on screen; once scrolled past, the name folds in
  beside it and never leaves.
- The photo is a button (zoom-in cursor) that opens a lightbox never filling the screen. It never
  grows on hover.
- Day shift: by day the owner makes the architecture decisions with the team. Agents extend his own
  thinking: they explore the code with him and draft plans he edits until they hold up. Say plainly
  that the agents draft the plans; the vibe is symbiosis, never occasional help ("where they help").
- Claude Code + Codex is one object: a modded Claude Code is the main driver, with the Codex CLI
  wired in to make full use of both subscriptions; each model takes the work it does best and checks
  the other's. Not "custom tooling".
- Night shift: overnight, agents triage feedback and errors, and only some are explorers (security
  issues, performance wins). In the morning, he decides.

### Experience

- Specific "How I used AI" notes on Zenride and Apptitude, none on Cagette & Paprika. Never a
  generic "AI & workflow" bullet list.
- Zenride's notes: early adoption (GitHub Copilot, then Claude Code), human in the loop, first
  custom AI rules, AI audits of the codebase.
- Apptitude's notes are readable sentences, not condensed: teaching agents the codebase (guides in
  the repo; team feedback becomes rules, selectively, only when it changes the next agent's work),
  several agents in parallel (a worktree per agent with its own local environment, database copy
  included, for full-cycle work including QA), and the radar, which names its domains (performance,
  security, bugs, code quality) and has a prominent button to the board beside it.
- Apptitude's "built" list stays concrete and impressive (retirement planning across the Swiss
  pillars, the self-employed balance sheet, reports with PDF export). No animated e-card, no "quick
  actions".

### Board ("How I work")

- It replays Pomi's real radar: real issue and PR numbers with links, a header with Pomi's logo
  linking to its GitHub issues. Made-up tickets carry the "Example" tag (`illustrative: true`).
- Practices, in this order: Ownership (names VibeWise, which reasons through the plan first, and
  Geoffrey Litt's explain-diff, which ends with a quiz on the PR), Feedback loop, Scoring (effort
  and evidence), Retrospectives (Matt Pocock's retro skill, for going back over past runs).
- "Ask" means the owner asks the agent before deciding; the agent's own question is answered as part
  of Accept.

### Side projects and "More about me"

- Side-projects intro: "Personal tools, and the place where I try out AI inside the product itself."
  / « Des outils perso, et l’endroit où je teste l’IA dans le produit lui-même. »
- Pomi copy never calls AI "optional". Pomi has no website: link to its GitHub releases. In the Pomi
  demo, intentions are life areas (Work, Side projects, Learning, Personal, Admin), never project
  names, task-level labels or vague words like "Focus"; the composer reads "Tap to add a task", new
  tasks join the end, and extra taps on the field never finish a typed note.
- GameHub copy is light on site tech: it mentions agent testing and experiments with Blender and
  software MCPs and new frontier models. GameHub's mark is a walnut `#6b4a2f` rounded square with a
  Georgia bold "g" in `#fff4dd` and an inset bottom edge `#4a3220`, never a "GH" placeholder.
- GameHub frames open on GameHub's library (`/games/play.html?match=<n>`), never inside a game, with
  no "Back to all games" button. Rota's clip is already playing when the visitor arrives; the
  showcase order is Rota, Arena, Mora, Diner, then the rest. The frames never scroll (the embed
  hides the library shelves and locks `html`/`body` overflow in
  `scripts/game-embed/src/embed/embed.css`, also appended to the built
  `public/games/app/play-*.css`), open in light mode like GameHub's site (the portfolio's dark
  `color-scheme` must not leak in), are captioned "GameHub · desktop" / "GameHub · phone", and the
  phone frame is as tall as the desktop frame.
- "More about me" order (`EXTRAS` in `items.ts`, `SHELF` on phones): Automation, Walk and talk, Open
  source, Homelab, Shortcuts (desk only), Strategy games, then Switzerland and EN · FR last, since
  the facts line already says them.
- Walk and talk: a walking pad and dictation; he dictates much of what he writes, not only prompts.
  Modern and energetic, never a need.
- Open source: he runs his own forks of several projects, tailored to his needs.
- Homelab: a love of hardware in general. Only his side projects are self-hostable, never his work.
- Switzerland: the flag on the mountain, with a light joke.
- Strategy games: a deliberately ambiguous board (no chess, no named game) linking to GameHub, since
  he designs his own games. Weighing trade-offs is fine; never "every trade-off".
- No portrait piece on the desk, tray or shelf: the byline photo is enough.

### CVs

- `node cv/build.mjs` builds both CVs from `cv/content.mjs`, in English and French: the designed
  two-page CV (`cv/design.mjs`, copied to `public/cv/`) and a plain one-page CV for job portals
  (`cv/portal.mjs`, `*_ATS.pdf`, Arial, no photo or QR). Keep both `render` exports stable: they are
  imported outside this repo.
- A classic Swiss CV with subtle touches of the site: no skill bars or ratings, links clickable but
  styled as plain text, no References line (no « Certificats de travail et références sur demande
  »), no GPA.
- The designed CV is titled "Senior Full-stack Developer · TypeScript" / « Développeur full-stack
  senior · TypeScript », with a profile paragraph instead of the hero line. No "How I work" section,
  no PR counts, no model names, the Zenride AI block cut to one bullet, the Zenride ranking in the
  summary in neutral words, no Redis or AWS.

## French and English

- The language comes from `?lang=` first, then `navigator.language` (`fr*` → French), and is not
  remembered. English shows briefly before French (static render): known, leave it unless asked.
- On the French side, French comes first: the FR flag on the left of the bilingual bubbles (3D and
  the `-fr` stills), « FR · EN », « française et britannique », « en français qu’en anglais ». Same
  on the French CV (nationality, languages).
- No English words in French titles; avoid « ingénieur ».
- French must fit like the English: the subtitle in three lines and the facts line in one at desktop
  width. Measure in the browser before changing them, and update `TITLE_EMS` in `HeroSection.tsx`
  when the title changes (it sizes each language's title to fill its column on one line).
- Watch for double meanings: « avoir les bons plans » reads as "getting good deals".

## Hero: desk, tray and phone

### Desktop and tablet

- The desk opens on the trio alone (the Day shift laptop, Claude Code + Codex, the Night shift
  board), camera close, each with a clickable label (step name and headline). The labels show only
  while the desk holds the trio alone: hidden once anything is added, back after "Tidy up".
- On big or zoomed-out screens the desk keeps to a centred stage, wider than the `max-w-7xl` text
  column but never the whole display. An animated force field runs on the stage edges and lights up
  and ripples when objects come close or touch it; pieces land clear of its glow.
- The trio's drop-in must feel 60 fps: the tray's live 3D waits until the trio has landed, and the
  scene draws two hidden frames before physics starts.
- Day shift is a laptop, lid open, with three clearly framed windows (Architecture, Team sync,
  Review): no screen switching, no person drawn. Dropping it on the agents shows no "merged"
  message.
- Night shift is a kanban board on a light wedge (`NightBoard` in `objects.tsx`): lanes Scan (Code,
  Logs, Feedback) · To do · Doing · Morning, and a night bar with a moon, a clock running
  23:00→06:00, a sun and "2 agents". No agents and no brands are drawn on it: tickets move between
  lanes by themselves, each saying what is being done ("Found in the logs", "Reproducing", "Drafting
  a plan", "Ready for you") with a small spinner and progress bar; a source lights up with a sweep
  while it is scanned; at 06:00 the Morning lane glows. It opens mid-night (`NIGHT_OPENS`) so it is
  never empty, and its stage still is frozen at that moment.
- "More about me" tray, under the CTAs: the real 3D pieces. Each starts facing the viewer (angle 0),
  in its still and once live, then starts its slow turn 0.7 s after the one before (`thumbDelay`).
  Hovering a piece turns it to face the viewer and stops it there with a gentle bob, and shows the
  shut hatch at its landing spot. A click opens the hatch with light, small smoke venting on all
  sides a little longer than the opening, pushes any piece in the way smoothly aside, then the piece
  rises with its story card beside it.
- Pushed pieces take the shortest slide out of the way: a short slide a little past the text's edge
  beats a long trip across the desk, and no piece's middle ends under the text.
- "Tidy up" sits left of "Add everything", and neither button ever moves.
- Strategy board: a stepped 5×5 square board rising to a gold gem; two sides (orange, blue) hop from
  banners on opposite corners, claim tiles and flip back to stone between matches. No honeycomb. It
  leans towards the viewer in the tray and on the phone shelf.
- Shortcut keycap: small, leaning towards the viewer (top and "/" visible). Desk only.

### Phones (under 640 px)

- A much more condensed page: far less text and scrolling, horizontal swipes (`SwipeRow`) for
  parallel items, secondary detail folded or hidden on phones only. Sections are clearly divided (a
  divider with a short orange stroke, more space). Desk objects are big enough to tap.
- No "How I work" heading or tabs in the hero (in the nav, "How I work" means the board). The intro
  flows into one turntable holding the trio, a sun → Claude → moon timeline, the caption, the CTAs,
  then a horizontal "More about me" shelf, which opens on the robot.
- Turntable: any flick (over about 150 px/s) goes to the next piece, and a long drag follows the
  finger past one piece. Side taps bring a side piece round; a tap on the front piece does nothing.
  Only the stage's own lost pointer capture counts as a release (a child's bubbled
  `lostpointercapture` caused stuck swipes).
- Shelf: pieces start facing front and turn in a stagger (`shelfDelay`, shared `shelfPhase`). A
  tapped piece spins, then settles facing the viewer with a gentle sway, in place: it never takes
  over the stage. Cards share one height, with a one-line title and subtitle (the text shrinks to
  fit).
- The 3D is already drawn before it scrolls in.

### Stills and link preview

- Stills are the loading placeholders and the reduced-motion / no-WebGL fallback, and must look
  exactly like the live 3D as it takes over. `/dev/sprites` draws each still on its first frame
  (time 0; `data-drawn` marks it done). Regenerate with `/dev/sprites?only=stage|shelf|tray` after
  any scene change, reordering included (turn phases follow the order). Only `stage-ticket`,
  `stage-agents` and `stage-night` (no-3D fallback) are kept at a fuller mid-loop moment.
- Every still is a static import in `exhibitIds.ts` (content-hashed URL).
- The live tray, shelf and turntable hold their first pose for 1 s after fading in (`HANDOVER_MS` in
  `Showcase.tsx`), then resume without a clock jump. Verify by freezing `performance.now` when the
  live canvas mounts and comparing against the stills.
- To save stills headlessly, drive Chrome for Testing or chrome-headless-shell over CDP
  (`--use-angle=metal --enable-gpu`) and save `canvas.toDataURL('image/webp', 0.8)`. Unchanged
  pieces should come out pixel-identical.
- Link previews show the desk, never the owner's face: `og:image` is `/og-desk-1.jpg` (1200×630,
  composed from the three stage stills with the name on top). A new preview image needs a new
  filename.

## Performance: quality tiers and 60 fps

- 60 fps is a hard requirement, and the desk should sit lightly on any machine; slightly lower image
  quality is an accepted price.
- Quality tiers are `low`, `medium` and `high` (`sections/hero/quality.ts`; force one with
  `?quality=low|medium|high`). The first guess comes from the GPU and the machine. Late frames step
  it down for good; frames on time step it up one step at most, only after a quiet moment with no
  input. Touch devices cap at `high`. There is no `ultra` tier; don't add one.
- The `detail` tier (label sharpness, shadow map, particles) is set once from the first guess and
  never changes: a tier change must never rebuild textures.
- Pixel budgets are 1920×1200, 1600×1000 and 1280×800: the desk draws fewer pixels than the screen
  (softer screen text is accepted). Every canvas is capped at 60 fps, with no 120 Hz drawing. The
  desk runs `frameloop="never"` and is drawn only by `Ticker`; the desktop tray turns at 30 fps;
  ambient desk motion stays at 60 fps on medium and high.
- The header and the story card have no backdrop blur (near-opaque instead).
- Shaders compile off the main thread (`playground/compile.ts`) before anything new is drawn: desk
  start, tray, phone canvases, hover previews, "Add everything". `compileAsync` does not warm a
  mesh's `customDepthMaterial`, so the flag cloth (a vertex-shader wave) casts no shadow.
- R3F 9 with three r186 under `frameloop="never"`: `advance(timestamp)` writes the ms timestamp into
  `clock.elapsedTime`, and `setFrameloop('never')` calls `Clock.stop()`, which clears `autoStart`,
  so the clock never restarts. `Ticker` passes no timestamp and starts the clock itself. Physics
  with `updateLoop="independent"` invalidates every frame while a body is awake, so
  `frameloop="demand"` would draw at the screen's rate.
- Safari and WebKit (every iPhone browser) upload a GPU-backed 2D canvas to WebGL by reading it
  back: 1.7–2.1 ms per upload at 512 px, 5.3 ms at 1024 px, 11.6 ms at 1536 px; with
  `willReadFrequently` and a premultiplied upload, 0.47 / 1.6 / 4.9 ms. Chrome is the opposite (GPU
  canvas 0.04–0.08 ms, CPU canvas about 1–1.8 ms). Hence `makeScreenTexture` / `paintInMemory()` in
  `labelTexture.ts`.
- Phones never download Rapier (812 KB gzipped): desk objects take their colliders from
  `playground/physics.tsx`, and only `Playground` provides the physics kit.
- A live game in the same-origin GameHub iframes runs on the page's main thread and was the main
  cause of lag on phones: the frames open on the library and load only after the visitor scrolls
  past the hero. Off screen, they drop to 0 rAF/s with their video paused, so they cost nothing
  there.
- Reference numbers, on an M3 Pro (1512×982 @2, 120 Hz screen): GPU cost is fill-bound (medium →
  high ≈ 1.9×). After the 60 fps cap, hero idle main thread went from 188 to 103 ms/s and the GPU
  process from 267 to 131 ms/s; with the full desk, 289 → 155 and 380 → 180. Re-measure before
  undoing any of these fixes.

### Measuring

- Measure a production build (`next build` in a scratch copy), never the dev server.
- Use headless Chrome (Playwright's chromium_headless_shell, `--use-angle=metal --enable-gpu`):
  desktop 1512×982 @2; phone 390×844 @3 with a 4× CDP CPU throttle. Prefer main-thread and
  GPU-process CPU time. WebGL timer queries (`EXT_disjoint_timer_query_webgl2`) include other apps'
  GPU work, so use them only for A/B comparisons within one run.
- For WebKit, serve a bench page from a throwaway static server to Mobile Safari in the iOS
  Simulator (`xcrun simctl`). It reproduces WebKit's costs, not a device's GPU quirks.
- Headless WebGL runs at about 10 fps: test swipe timing with `Input.dispatchTouchEvent` carrying
  explicit `timestamp`s, or flicks turn into slow drags.
- Kill every headless browser you start. One left running sat on the live site for 14 hours at about
  73% CPU.

## design/ assets

### Portrait

- The portrait is `public/assets/about/profile.webp` (1122×1402). Round crops use
  `profile-avatar.webp`, the same photo with 130 px of extended background on top (1122×1532), for a
  LinkedIn-avatar framing: full image width, hair to collar, about 8% of space above the hair.
  `object-position: 50% 21%` in the site's circle, `50% 23%` in the CV's box. The lightbox keeps the
  original photo. The hero imports it statically.
- When the photo changes: update every copy (site, `design/linkedin-banner/source/profile.webp`, the
  CVs), the lightbox's width and height, rebuild the CVs (`node cv/build.mjs`), re-render the banner
  at 1× and 2×, and clear `.next/dev/cache/images` or the dev server keeps serving the old one.

### LinkedIn banner (`design/linkedin-banner/`)

- In French. It is seen tiny (about half size on desktop, a quarter on phones) under a round profile
  photo.
- Current layout (1584×396): one line, « Développeur full-stack. » (88 px, orange dot), centred
  between the photo and the QR column (x ≈ 353–1267, y 44–132), with the 3D trio centred under it.
  The QR column at the right reads « Explorez en 3D » and williamguinaudie.com. `v1/` and `v2/` keep
  earlier versions.
- Text is white or orange (never dark on dark), at least about 40 px at 1584 wide, and outside both
  photo circles: the desktop photo, measured, at centre (207.5, 363.3), r 159.3 including its white
  border; the phone app's photo, estimated and unverified, at (276, 414), r 211.
- An orange tick ring hugs the desktop photo with an even 16 px gap, notches on the outside.
- The trio uses the current night-shift model, with Claude Code + Codex turned so the asterisk and
  the Codex cloud sit side by side (agents yawed −0.6 rad in a hand-turned copy of `TrioScene`).
- The QR keeps square finder patterns (rounded ones failed to decode). Decode it before delivering.
- `source/banner.html` lays out after the fonts and the trio load and writes `data-layout`, with an
  overlap check against both photo circles (read it with `--dump-dom --virtual-time-budget=4000`).
  Render with headless Chrome at `--window-size=1584,396` (add `--force-device-scale-factor=2` for
  @2x), and render `source/mock.html` (desktop, phone, and phone with only the middle 70%) into
  `apercu-profil.png` to check every change. The title must survive all three views; the QR column
  may be lost to a side trim.
- The site's voice rules apply: no slogans.

## Image generation

- Generate every image from a written prompt alone. Never attach a base, style or identity reference
  image, and never restyle or edit an existing picture, even a liked one: each pass through a base
  image degrades colour (it drifts yellow) and quality.
- Describe the target style in a paragraph (reuse accepted prompts as text), describe the subject
  fully, and retry by regenerating from corrected text.
