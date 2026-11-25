// Gera docs/politica-de-privacidade.md a partir de src/ui/legal.js (a mesma fonte que a aba Config mostra).
import { writeFileSync } from 'node:fs';
import { APP_NAME, UPDATED, SOURCES, DISCLAIMERS, PRIVACY } from '../src/ui/legal.js';

const out = [
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
].join('\n');
writeFileSync(new URL('../docs/politica-de-privacidade.md', import.meta.url), out);
console.log('docs/politica-de-privacidade.md gerado');
