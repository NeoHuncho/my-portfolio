// Renders the CVs to A4 PDFs with headless Chrome.
//   node cv/build.mjs [en|fr]
//   → cv/out/CV_{EN,FR}_William_Guinaudie.pdf       the designed CV (cv/design.mjs), copied to public/cv/
//   → cv/out/CV_{EN,FR}_William_Guinaudie_ATS.pdf   the plain one-page CV for portals (cv/portal.mjs)

import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { content } from './content.mjs';
import { render as renderDesign } from './design.mjs';
import { render as renderPortal } from './portal.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'out');
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
// The site serves the designed CVs from public/cv/.
const site = join(here, '../public/cv');

function toPdf(html, file) {
  const htmlPath = join(out, `${file}.html`);
  const pdf = join(out, `${file}.pdf`);
  writeFileSync(htmlPath, html);
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
        pathToFileURL(htmlPath).href,
      ],
      { stdio: 'pipe' }
    );
  } catch (error) {
    process.stderr.write(error.stderr ?? '');
    throw error;
  }
  return pdf;
}

mkdirSync(out, { recursive: true });
mkdirSync(site, { recursive: true });
const only = process.argv[2];
for (const t of Object.values(content)) {
  if (only && t.lang !== only) {
    continue;
  }
  const design = toPdf(renderDesign(t), t.file);
  copyFileSync(design, join(site, `${t.file}.pdf`));
  console.log(`✓ ${design} (copied to public/cv/)`);
  console.log(`✓ ${toPdf(renderPortal(t), t.portal.file)}`);
}
