// Renders the CV to A4 PDFs with headless Chrome.
//   node cv/build.mjs        → cv/out/CV_{EN,FR}_William_Guinaudie.pdf, copied to public/cv/
// Fonts come from the site's own Geist package, the photo from public/.

import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { content } from './content.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const out = join(here, 'out');
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const geist = join(realpathSync(join(root, 'node_modules/geist')), 'dist/fonts');
const dataUri = (path, type) => `data:${type};base64,${readFileSync(path).toString('base64')}`;
const fonts = {
  sans: dataUri(join(geist, 'geist-sans/Geist-Variable.woff2'), 'font/woff2'),
  mono: dataUri(join(geist, 'geist-mono/GeistMono-Variable.woff2'), 'font/woff2'),
};
const photo = dataUri(join(root, 'public/assets/about/profile.webp'), 'image/webp');
const qr = (lang) => readFileSync(join(here, `assets/qr-${lang}.svg`), 'utf8');
// The site serves the CVs from public/cv/.
const site = join(root, 'public/cv');

const list = (items, cls = '') =>
  `<ul class="${cls}">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;

const heading = (n, label, aside = '') =>
  `<h2 class="heading"><span class="n">${String(n).padStart(2, '0')}</span>${label}<span class="rule"></span>${aside ? `<span class="aside">${aside}</span>` : ''}</h2>`;

function experience(job, t, current) {
  return `
  <article class="entry">
    <div class="when">
      <span class="date">${job.when}</span>
      <span>${job.length}</span>
      <span>${job.city}</span>
      <span class="sector">${job.sector}</span>
    </div>
    <div class="node${current ? ' now' : ''}"></div>
    <div class="what">
      <h3><a class="company out" href="${job.link}">${job.company}</a><span class="role">${job.role}</span></h3>
      <p class="summary">${job.summary}</p>
      <dl class="stats">${job.stats.map(([v, l]) => `<div><dt>${v}</dt><dd>${l}</dd></div>`).join('')}</dl>
      <h4>${t.built}</h4>
      ${list(job.built, 'built')}
      ${job.ai ? `<h4>${t.ai}</h4>${list(job.ai, 'ai')}` : ''}
      <p class="stack">${job.stack.map((x) => `<span>${x}</span>`).join('<i>·</i>')}</p>
    </div>
  </article>`;
}

function project(p, wide) {
  return `
  <article class="project${wide ? ' wide' : ''}">
    <h3>${p.link ? `<a class="out" href="https://${p.link}">${p.name}</a>` : p.name}</h3>
    <p class="meta">${p.meta}</p>
    <p class="body">${p.body}</p>
    ${p.ai ? `<p class="ai-line">${p.ai}</p>` : ''}
    <p class="stack">${p.stack}</p>
    ${p.link ? `<p class="link"><a href="https://${p.link}">${p.link}</a></p>` : ''}
  </article>`;
}

const footer = (t, page) => `
  <footer class="foot">
    <span>William Guinaudie<i>·</i>CV<i>·</i>${t.footer}</span>
    <a href="${t.site}">williamguinaudie.com</a>
    <span>${page} / 2</span>
  </footer>`;

function render(t) {
  const [featuredA, featuredB, ...small] = t.projects;
  return `<!doctype html>
<html lang="${t.lang}">
<head>
<meta charset="utf-8">
<title>${t.title}</title>
<style>
@font-face { font-family: Geist; src: url(${fonts.sans}) format('woff2'); font-weight: 100 900; }
@font-face { font-family: 'Geist Mono'; src: url(${fonts.mono}) format('woff2'); font-weight: 100 900; }
@page { size: A4; margin: 0; }
:root {
  --ink: #141416;
  --body: #34343a;
  --muted: #6b6b74;
  --faint: #9a9aa3;
  --line: #e4e4e7;
  --accent: #ff6b35;
  --accent-ink: #c2410c;
  --accent-soft: #fff1eb;
  --gutter: 27mm;
  --rail: 6mm;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: Geist, sans-serif; color: var(--body); font-size: 8.4pt; line-height: 1.4; background: #fff; font-feature-settings: 'ss01'; }
b { font-weight: 600; color: var(--ink); }
i { font-style: normal; color: var(--faint); padding: 0 0.45em; }
.mono, .heading, .when, .stats dt, h4, .stack, .meta, .link, .foot, .facts dt, .step-head, .label { font-family: 'Geist Mono', monospace; }

.page { position: relative; width: 210mm; height: 297mm; padding: 13mm 15mm 0; overflow: hidden; break-after: page; }
.page:last-child { break-after: auto; }

/* Links look like the text around them; a faint arrow marks the ones on names.
   Viewers show the hand cursor on hover, and the HTML version underlines in orange. */
a { color: inherit; text-decoration: none; }
a:hover { text-decoration: underline; text-decoration-color: var(--accent); text-underline-offset: 0.18em; }
a.out::after { content: '↗'; font-family: 'Geist Mono', monospace; font-size: 0.62em; font-weight: 400; color: var(--faint); margin-left: 0.2em; vertical-align: 0.35em; }

/* Masthead: the site's dotted workbench grid, faded out on white */
.masthead { position: relative; display: grid; grid-template-columns: 1fr 29mm; gap: 8mm; align-items: end; padding-bottom: 4.4mm; }
.masthead::before {
  content: ''; position: absolute; inset: -13mm -15mm 0 -15mm; z-index: -1;
  background-image: radial-gradient(#c9c9cf 0.55px, transparent 0.75px);
  background-size: 3.4mm 3.4mm;
  -webkit-mask-image: linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.55) 45%, transparent 100%);
}
.eyebrow { font-family: 'Geist Mono', monospace; font-size: 7pt; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); }
h1 { margin-top: 2.2mm; font-size: 31pt; line-height: 1; font-weight: 600; letter-spacing: -0.03em; color: var(--ink); }
h1 .dot { color: var(--accent); }
.tagline { margin-top: 3mm; max-width: 142mm; font-size: 9.6pt; line-height: 1.45; color: var(--muted); text-wrap: pretty; }
.photo { width: 29mm; height: 30mm; object-fit: cover; object-position: 50% 30%; border-radius: 2mm; display: block; }

/* Swiss personal details, in three columns, with the QR code to the site */
.facts { display: grid; grid-template-columns: 1fr 1.08fr 1.12fr 40mm; column-gap: 5mm; border-top: 0.6pt solid var(--ink); border-bottom: 0.5pt solid var(--line); padding: 2.6mm 0 2.4mm; }
.facts .cols { display: contents; }
.facts .col { display: grid; row-gap: 1.3mm; align-content: start; }
.facts dt { font-size: 5.9pt; letter-spacing: 0.14em; text-transform: uppercase; color: var(--faint); line-height: 1.2; }
.facts dd { font-size: 8.2pt; color: var(--ink); line-height: 1.3; white-space: nowrap; }
.qr { display: grid; grid-template-columns: 15mm 1fr; gap: 2.4mm; align-items: center; border-left: 0.5pt solid var(--line); padding-left: 3.5mm; }
.qr svg { width: 15mm; height: 15mm; display: block; }
.qr p { font-size: 6.6pt; line-height: 1.35; color: var(--muted); }

/* Section headings: numbered mono eyebrows, as on the site */
section { margin-top: 4.2mm; }
.heading { display: flex; align-items: center; gap: 2.2mm; font-size: 7pt; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink); margin-bottom: 2.6mm; }
.heading .n { color: var(--accent-ink); }
.heading .rule { flex: 1; height: 0.5pt; background: var(--line); }
.heading .aside { font-family: Geist, sans-serif; text-transform: none; letter-spacing: 0; font-size: 8pt; font-weight: 500; color: var(--muted); }

/* How I work: who does what, step by step */
.how { display: grid; grid-template-columns: repeat(4, 1fr); column-gap: 5mm; position: relative; }
.how::before { content: ''; position: absolute; left: 1mm; right: 0; top: 1.15mm; height: 0.5pt; background: var(--line); }
.step { position: relative; padding-top: 3.6mm; }
.step::before { content: ''; position: absolute; left: 0; top: 0; width: 2.3mm; height: 2.3mm; border-radius: 50%; background: #fff; border: 0.7pt solid var(--faint); }
.step.me::before { background: var(--accent); border-color: var(--accent); }
.step-head { display: flex; align-items: baseline; gap: 1.6mm; font-size: 7.4pt; color: var(--ink); font-weight: 500; }
.step-head .k { color: var(--faint); }
.who { margin-left: auto; font-size: 5.8pt; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); border: 0.5pt solid var(--line); border-radius: 1mm; padding: 0.2mm 1.1mm; }
.step.me .who { color: var(--accent-ink); background: var(--accent-soft); border-color: #ffd9c9; }
.step p { margin-top: 1.1mm; font-size: 7.7pt; line-height: 1.38; color: var(--muted); }

/* Timeline: dates in the left gutter, Swiss style */
.timeline { position: relative; }
.timeline::before { content: ''; position: absolute; left: calc(var(--gutter) + var(--rail) / 2); top: 1.5mm; bottom: 2mm; width: 0.5pt; background: var(--line); }
.entry { display: grid; grid-template-columns: var(--gutter) var(--rail) minmax(0, 1fr); break-inside: avoid; }
.entry + .entry { margin-top: 3.8mm; }
.when { display: flex; flex-direction: column; gap: 0.3mm; font-size: 6.6pt; color: var(--muted); line-height: 1.35; padding-top: 0.7mm; }
.when .date { font-size: 7.4pt; color: var(--ink); font-weight: 500; }
.node { position: relative; }
.node::before { content: ''; position: absolute; left: 50%; top: 1.4mm; width: 2.2mm; height: 2.2mm; transform: translateX(-50%); border-radius: 50%; background: #fff; border: 0.7pt solid var(--faint); }
.node.now::before { background: var(--accent); border-color: var(--accent); box-shadow: 0 0 0 0.9mm var(--accent-soft); }
.what { padding-left: 2mm; }
h3 { display: flex; align-items: baseline; gap: 2.4mm; flex-wrap: wrap; color: var(--ink); font-weight: 600; }
h3 .company { font-size: 11pt; letter-spacing: -0.01em; }
h3 .role { font-size: 9pt; font-weight: 500; color: var(--body); }
.when .sector { margin-top: 0.8mm; font-family: Geist, sans-serif; font-size: 7pt; color: var(--body); line-height: 1.3; padding-right: 2mm; }
.edu .sector { font-size: 7.6pt; color: var(--muted); margin-top: 0.2mm; }
.summary { margin-top: 0.9mm; text-wrap: pretty; }
.stats { display: flex; gap: 6mm; margin-top: 1.5mm; padding: 1.1mm 0; border-top: 0.5pt dashed var(--line); border-bottom: 0.5pt dashed var(--line); }
.stats div { display: flex; align-items: baseline; gap: 1.5mm; }
.stats dt { font-size: 10pt; font-weight: 600; color: var(--ink); letter-spacing: -0.02em; white-space: nowrap; }
.stats dd { font-size: 7pt; color: var(--muted); line-height: 1.25; }
h4 { margin-top: 1.9mm; font-size: 6.2pt; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: var(--faint); }
ul { list-style: none; margin-top: 0.7mm; display: grid; row-gap: 0.5mm; }
li { position: relative; padding-left: 3.4mm; text-wrap: pretty; }
ul.built li::before { content: ''; position: absolute; left: 0.3mm; top: 0.62em; width: 1.6mm; height: 0.5pt; background: var(--faint); }
ul.ai li::before { content: ''; position: absolute; left: 0.4mm; top: 0.48em; width: 1.3mm; height: 1.3mm; background: var(--accent); transform: rotate(45deg) scale(0.8); }
.stack { margin-top: 1.6mm; font-size: 6.5pt; color: var(--muted); letter-spacing: 0.01em; }
.stack i { padding: 0 0.35em; }

/* Side projects */
.grid { display: grid; grid-template-columns: var(--gutter) 1fr; }
.grid > .label { font-size: 6.6pt; color: var(--muted); line-height: 1.4; padding-right: 3mm; padding-top: 0.6mm; }
.projects { display: grid; grid-template-columns: repeat(6, 1fr); gap: 3.4mm 5mm; padding-left: calc(var(--rail) + 2mm); }
.project { grid-column: span 2; break-inside: avoid; border-top: 0.5pt solid var(--line); padding-top: 2mm; }
.project.wide { grid-column: span 3; }
.project h3 { font-size: 9.6pt; }
.project .meta { font-size: 6.4pt; color: var(--faint); margin-top: 0.3mm; }
.project .body { margin-top: 1.2mm; font-size: 8pt; text-wrap: pretty; }
.ai-line { position: relative; margin-top: 1.2mm; padding-left: 3.4mm; font-size: 7.7pt; color: var(--body); text-wrap: pretty; }
.ai-line::before { content: ''; position: absolute; left: 0.4mm; top: 0.48em; width: 1.3mm; height: 1.3mm; background: var(--accent); transform: rotate(45deg) scale(0.8); }
.project .stack { margin-top: 1.4mm; }
.project .link { font-size: 6.3pt; color: var(--accent-ink); margin-top: 0.6mm; }

/* Smaller projects: one line each, under the featured two */
.rows.small { margin-top: 3.2mm; row-gap: 1.4mm; }
.rows.small .label { font-family: Geist, sans-serif; text-transform: none; letter-spacing: 0; font-size: 8pt; font-weight: 600; color: var(--ink); padding-top: 0; }
.rows.small .val { color: var(--body); }
.rows.small .meta, .rows.small .stack, .rows.small .link { font-family: 'Geist Mono', monospace; font-size: 6.4pt; }
.rows.small .meta { color: var(--faint); margin-right: 2mm; }
.rows.small .stack { color: var(--muted); margin-left: 2mm; }
.rows.small .link { color: var(--accent-ink); margin-left: 2mm; }
.stack span { white-space: nowrap; }

/* Skills, education, the rest: label in the gutter */
.rows { display: grid; row-gap: 1.8mm; }
.row { display: grid; grid-template-columns: var(--gutter) 1fr; }
.row .label { font-size: 6.4pt; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); padding-top: 0.5mm; }
.row .val { padding-left: calc(var(--rail) + 2mm); color: var(--ink); text-wrap: pretty; }
.row .val i { padding: 0 0.4em; }
.edu .entry + .entry { margin-top: 3mm; }
.edu h3 .company { font-size: 9.6pt; }
.edu .summary { margin-top: 0.8mm; color: var(--muted); font-size: 8pt; }

/* Page 1 holds less, so it breathes more */
.p1 section { margin-top: 6mm; }
.p1 .entry + .entry { margin-top: 5.5mm; }
.p1 ul { row-gap: 0.9mm; }
.p1 h4 { margin-top: 2.6mm; }
.p1 .stats { margin-top: 2.2mm; padding: 1.5mm 0; }

.foot { position: absolute; left: 15mm; right: 15mm; bottom: 8mm; display: flex; justify-content: space-between; padding-top: 2mm; border-top: 0.5pt solid var(--line); font-size: 6.2pt; letter-spacing: 0.06em; color: var(--faint); }
.foot i { padding: 0 0.5em; }
</style>
</head>
<body>

<div class="page p1">
  <header class="masthead">
    <div>
      <p class="eyebrow">${t.role}</p>
      <h1>William Guinaudie<span class="dot">.</span></h1>
      <p class="tagline">${t.tagline}</p>
    </div>
    <img class="photo" src="${photo}" alt="William Guinaudie">
  </header>

  <dl class="facts">
    ${[0, 3, 6]
      .map(
        (i) =>
          `<div class="col">${t.facts
            .slice(i, i + 3)
            .map(([k, v, href]) => `<div><dt>${k}</dt><dd>${href ? `<a href="${href}">${v}</a>` : v}</dd></div>`)
            .join('')}</div>`
      )
      .join('')}
    <a class="qr" href="${t.site}">${qr(t.lang)}<p>${t.qrCaption}</p></a>
  </dl>


  <section>
    ${heading(1, t.sections.experience)}
    <div class="timeline">
      ${experience(t.experience[0], t, true)}
      ${experience(t.experience[1], t, false)}
    </div>
  </section>
  ${footer(t, 1)}
</div>

<div class="page">
  <section style="margin-top:0">
    <div class="timeline">
      ${experience(t.experience[2], t, false)}
    </div>
  </section>

  <section>
    ${heading(2, t.how.eyebrow, t.how.title)}
    <div class="how">
      ${t.how.steps
        .map(
          (s, i) => `
      <div class="step${s.who === 'me' ? ' me' : ''}">
        <div class="step-head"><span class="k">${String(i + 1).padStart(2, '0')}</span>${s.name}<span class="who">${s.who === 'me' ? t.how.me : s.who}</span></div>
        <p>${s.body}</p>
      </div>`
        )
        .join('')}
    </div>
  </section>

  <section>
    ${heading(3, t.sections.projects)}
    <div class="grid">
      <p class="label">${t.projectsIntro}</p>
      <div class="projects">
        ${project(featuredA, true)}
        ${project(featuredB, true)}
      </div>
    </div>
    <div class="rows small">
      ${small
        .map(
          (p) =>
            `<div class="row"><p class="label">${p.link ? `<a class="out" href="https://${p.link}">${p.name}</a>` : p.name}</p><p class="val"><span class="meta">${p.meta}</span>${p.body}</p></div>`
        )
        .join('')}
    </div>
  </section>

  <section>
    ${heading(4, t.sections.skills)}
    <div class="rows">
      ${t.skills.map(([k, v]) => `<div class="row"><p class="label">${k}</p><p class="val">${v.replaceAll(' · ', '<i>·</i>')}</p></div>`).join('')}
    </div>
  </section>

  <section class="edu">
    ${heading(5, t.sections.education)}
    <div class="timeline">
      ${t.education
        .map(
          (e) => `
      <article class="entry">
        <div class="when"><span class="date">${e.when}</span><span>${e.city}</span></div>
        <div class="node"></div>
        <div class="what">
          <h3><span class="company">${e.title}</span></h3>
          <p class="sector">${e.school}</p>
          <p class="summary">${e.detail}</p>
        </div>
      </article>`
        )
        .join('')}
    </div>
  </section>

  <section>
    ${heading(6, t.sections.more)}
    <div class="rows">
      ${t.more.map(([k, v]) => `<div class="row"><p class="label">${k}</p><p class="val">${v.replaceAll(' · ', '<i>·</i>')}</p></div>`).join('')}
    </div>
  </section>
  ${footer(t, 2)}
</div>

</body>
</html>`;
}

mkdirSync(out, { recursive: true });
const only = process.argv[2];
for (const t of Object.values(content)) {
  if (only && t.lang !== only) {
    continue;
  }
  const html = join(out, `${t.file}.html`);
  const pdf = join(out, `${t.file}.pdf`);
  writeFileSync(html, render(t));
  // Headless Chrome logs harmless display errors: keep them unless printing fails.
  try {
    execFileSync(
      chrome,
      [
        '--headless',
        '--disable-gpu',
        '--no-pdf-header-footer',
        '--virtual-time-budget=3000',
        `--print-to-pdf=${pdf}`,
        pathToFileURL(html).href,
      ],
      { stdio: 'pipe' }
    );
  } catch (error) {
    process.stderr.write(error.stderr ?? '');
    throw error;
  }
  mkdirSync(site, { recursive: true });
  copyFileSync(pdf, join(site, `${t.file}.pdf`));
  console.log(`✓ ${pdf} (copied to public/cv/)`);
}
