// The plain CV for application portals (jobs.ch, Workday, SuccessFactors…): one A4
// page, one column, real text in reading order, no photo, no QR code, no tables, so
// parsers fill their fields correctly. Same facts as the designed CV (cv/design.mjs).
// render(t) → HTML. The job-search repo imports this too.

const ul = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
const link = (text) => {
  const url = /^(linkedin|github)\.com|williamguinaudie\.com/.test(text) ? `https://${text}` : null;
  return url ? `<a href="${url}">${text}</a>` : text;
};

function job(j) {
  return `
  <div class="job">
    <h3>${j.company}, ${j.city.replace(/, (CH|FR)$/, '')} | ${j.role}</h3>
    <p class="meta">${[j.when, j.sector, j.team].filter(Boolean).join(' | ')}</p>
    ${ul(j.brief ?? j.built.slice(0, 3))}
  </div>`;
}

export function render(t) {
  const p = t.portal;
  const s = p.sections;
  const projects = t.projects
    .filter((x) => x.brief)
    .map((x) => `<b>${x.name}</b>${x.link ? ` (${x.link})` : ''} : ${x.brief}`)
    // English has no space before the colon.
    .map((line) => (t.lang === 'en' ? line.replace(' : ', ': ') : line));
  const [degree, ...certs] = t.education;
  return `<!doctype html>
<html lang="${t.lang}">
<head>
<meta charset="utf-8">
<title>William Guinaudie · CV</title>
<style>
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; font-size: 9pt; line-height: 1.28; background: #fff; }
.page { width: 210mm; height: 297mm; padding: 12mm 16mm 0; overflow: hidden; }
a { color: inherit; text-decoration: none; }
h1 { font-size: 16pt; line-height: 1.1; }
.headline { margin-top: 0.8mm; font-size: 10pt; font-weight: bold; }
.contact { margin-top: 0.4mm; }
h2 { margin-top: 3mm; padding-bottom: 0.5mm; border-bottom: 0.6pt solid #1a1a1a; font-size: 10pt; }
h2 + * { margin-top: 1.2mm; }
h3 { font-size: 9.4pt; margin-top: 2mm; }
.job:first-of-type h3 { margin-top: 1.2mm; }
.meta { margin-top: 0.3mm; color: #444; }
ul { list-style: none; margin-top: 0.6mm; }
li { position: relative; padding-left: 5mm; margin-top: 0.35mm; }
li::before { content: '–'; position: absolute; left: 1mm; }
p.row { margin-top: 0.5mm; }
</style>
</head>
<body>
<div class="page">
  <h1>William Guinaudie</h1>
  <p class="headline">${p.headline}</p>
  ${p.contact.map((line) => `<p class="contact">${line.split(' | ').map(link).join(' | ')}</p>`).join('')}

  <h2>${s.profile}</h2>
  <p>${t.tagline}</p>

  <h2>${s.highlights}</h2>
  ${ul(p.highlights)}

  <h2>${s.experience}</h2>
  ${t.experience.map(job).join('')}

  <h2>${s.projects}</h2>
  ${ul(projects)}

  <h2>${s.skills}</h2>
  ${ul(p.skills.map(([k, v]) => `${k} : ${v}`).map((line) => (t.lang === 'en' ? line.replace(' : ', ': ') : line)))}

  <h2>${s.education}</h2>
  <p>${degree.title} | ${degree.school.split(',')[0]}, ${degree.city.replace(/, CA$/, '')} | ${degree.when.slice(3, 7)} – ${degree.when.slice(-4)}</p>
  <p class="meta">${degree.detail}</p>

  <h2>${s.certifications}</h2>
  ${certs.map((c) => `<p class="row">${c.title} | ${c.school} | ${c.when.slice(-4)}</p>`).join('')}

  <h2>${s.languages}</h2>
  <p>${p.languages}</p>
</div>
</body>
</html>`;
}
