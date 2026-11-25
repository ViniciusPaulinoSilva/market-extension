// Teste de verdade contra as APIs públicas: cotações e histórico de todos os ativos.
import { ASSETS } from '../src/catalog.js';
import { fetchQuotes, fetchHistory } from '../src/api.js';

const { quotes, errors } = await fetchQuotes(ASSETS.map((a) => a.id));
console.log('erros:', errors.length ? errors : 'nenhum');
for (const a of ASSETS) {
  const q = quotes[a.id];
  console.log(a.id.padEnd(7), q ? `${q.price}  24h=${(q.change24h * 100).toFixed(2)}%  idade=${Math.round(Date.now() / 1000 - q.ts)}s` : 'SEM COTAÇÃO');
}
for (const a of ASSETS) {
  const out = [];
  for (const r of ['24h', '7d', '30d']) {
    try {
      const h = await fetchHistory(a, r);
      out.push(`${r}:${h.length}pts`);
    } catch (e) {
      out.push(`${r}:ERRO ${e.message}`);
    }
  }
  console.log('hist', a.id.padEnd(7), out.join('  '));
}
