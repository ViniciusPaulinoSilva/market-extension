// Gera a política de privacidade nos dois idiomas a partir de src/ui/legal.js (a mesma fonte da aba Config):
//   docs/privacy-policy.md (en), docs/politica-de-privacidade.md (pt) e docs/index.html (uma página com os dois).
import { writeFileSync, mkdirSync } from 'node:fs';
import { legalFor } from '../src/ui/legal.js';

const NL = '\n';
const T = {
  en: { title: 'Privacy policy', updated: 'Updated', sources: 'Price sources', notices: 'Important notices', file: 'privacy-policy.md', htmlLang: 'en', other: 'Português' },
  pt: { title: 'Política de privacidade', updated: 'Atualizada em', sources: 'Fontes de preço', notices: 'Avisos importantes', file: 'politica-de-privacidade.md', htmlLang: 'pt-BR', other: 'English' }
};

mkdirSync(new URL('../docs/', import.meta.url), { recursive: true });

for (const lang of ['en', 'pt']) {
  const L = legalFor(lang);
  const t = T[lang];
  const md = [
    `# ${t.title}: ${L.APP_NAME}`,
    '',
    `${t.updated} ${L.UPDATED}.`,
    '',
    ...L.PRIVACY.flatMap((s) => [`## ${s.h}`, '', ...s.p.flatMap((x) => [x, ''])]),
    `## ${t.sources}`,
    '',
    ...L.SOURCES.map((s) => `- ${s.name}: ${s.what} (${s.host})`),
    '',
    `## ${t.notices}`,
    '',
    ...L.DISCLAIMERS.map((x) => `- ${x}`),
    ''
  ].join(NL);
  writeFileSync(new URL(`../docs/${t.file}`, import.meta.url), md);
  console.log(`docs/${t.file} gerado`);
}

// Página pública (GitHub Pages): inglês primeiro e português logo abaixo, com links entre as duas partes.
const esc = (x) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const block = (lang) => {
  const L = legalFor(lang);
  const t = T[lang];
  const sections = L.PRIVACY.map((s) => `<h3>${esc(s.h)}</h3>${NL}${s.p.map((x) => `<p>${esc(x)}</p>`).join(NL)}`).join(NL);
  return `<section id="${lang}" lang="${t.htmlLang}">
<h2>${esc(t.title)}: ${esc(L.APP_NAME)}</h2>
<p class="upd">${esc(t.updated)} ${esc(L.UPDATED)}. <a href="#${lang === 'en' ? 'pt' : 'en'}">${t.other}</a></p>
${sections}
<h3>${esc(t.sources)}</h3>
<ul>
${L.SOURCES.map((s) => `<li>${esc(s.name)}: ${esc(s.what)} (<code>${esc(s.host)}</code>)</li>`).join(NL)}
</ul>
<h3>${esc(t.notices)}</h3>
<ul>
${L.DISCLAIMERS.map((x) => `<li>${esc(x)}</li>`).join(NL)}
</ul>
</section>`;
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Privacy policy / Política de privacidade: Market Quotes</title>
<style>
  :root { color-scheme: light dark; }
  body { margin: 0; font: 16px/1.65 "Segoe UI", system-ui, sans-serif; background: #0b0e13; color: #e6ebf2; }
  main { max-width: 720px; margin: 0 auto; padding: 40px 20px 64px; }
  h2 { font-size: 28px; line-height: 1.2; margin: 0 0 6px; }
  h3 { font-size: 19px; margin: 32px 0 8px; }
  section + section { margin-top: 64px; padding-top: 40px; border-top: 1px solid #2b3a52; }
  p, li { color: #c9d6ec; }
  a { color: #7ab2ff; }
  .upd { color: #8c99ad; font-size: 14px; }
  code { color: #8c99ad; }
  @media (prefers-color-scheme: light) { body { background: #fff; color: #17202e; } p, li { color: #2b3648; } section + section { border-color: #d5dbe5; } a { color: #1d4ed8; } }
</style>
</head>
<body>
<main>
${block('en')}
${block('pt')}
</main>
</body>
</html>
`;
writeFileSync(new URL('../docs/index.html', import.meta.url), html);
console.log('docs/index.html gerado');
