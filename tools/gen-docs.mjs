// Gera docs/politica-de-privacidade.md e site/index.html a partir de src/ui/legal.js
// (a mesma fonte que a aba Config mostra).
import { writeFileSync, mkdirSync } from 'node:fs';
import { APP_NAME, UPDATED, SOURCES, DISCLAIMERS, PRIVACY } from '../src/ui/legal.js';

const NL = '\n';

const md = [
  `# Política de privacidade: ${APP_NAME}`,
  '',
  `Atualizada em ${UPDATED}.`,
  '',
  ...PRIVACY.flatMap((s) => [`## ${s.h}`, '', ...s.p.flatMap((t) => [t, ''])]),
  '## Fontes de preço',
  '',
  ...SOURCES.map((s) => `- ${s.name}: ${s.what} (${s.host})`),
  '',
  '## Avisos importantes',
  '',
  ...DISCLAIMERS.map((t) => `- ${t}`),
  ''
].join(NL);
writeFileSync(new URL('../docs/politica-de-privacidade.md', import.meta.url), md);
console.log('docs/politica-de-privacidade.md gerado');

// Página pública da política (para hospedar no GitHub Pages ou similar): pasta site/.
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sections = PRIVACY.map((s) => `<h2>${esc(s.h)}</h2>${NL}${s.p.map((t) => `<p>${esc(t)}</p>`).join(NL)}`).join(NL);
const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Política de privacidade: ${esc(APP_NAME)}</title>
<style>
  :root { color-scheme: light dark; }
  body { margin: 0; font: 16px/1.65 "Segoe UI", system-ui, sans-serif; background: #0b0e13; color: #e6ebf2; }
  main { max-width: 720px; margin: 0 auto; padding: 40px 20px 64px; }
  h1 { font-size: 28px; line-height: 1.2; margin: 0 0 6px; }
  h2 { font-size: 19px; margin: 32px 0 8px; }
  p, li { color: #c9d6ec; }
  .upd { color: #8c99ad; font-size: 14px; }
  code { color: #8c99ad; }
  @media (prefers-color-scheme: light) { body { background: #fff; color: #17202e; } p, li { color: #2b3648; } }
</style>
</head>
<body>
<main>
<h1>Política de privacidade: ${esc(APP_NAME)}</h1>
<p class="upd">Atualizada em ${esc(UPDATED)}.</p>
${sections}
<h2>Fontes de preço</h2>
<ul>
${SOURCES.map((s) => `<li>${esc(s.name)}: ${esc(s.what)} (<code>${esc(s.host)}</code>)</li>`).join(NL)}
</ul>
<h2>Avisos importantes</h2>
<ul>
${DISCLAIMERS.map((t) => `<li>${esc(t)}</li>`).join(NL)}
</ul>
</main>
</body>
</html>
`;
mkdirSync(new URL('../site/', import.meta.url), { recursive: true });
writeFileSync(new URL('../site/index.html', import.meta.url), html);
console.log('site/index.html gerado');
