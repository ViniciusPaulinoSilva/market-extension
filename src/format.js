export function fmt(value, dec) {
  return Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec
  });
}

export function money(asset, value) {
  if (value == null || !Number.isFinite(value)) return '—';
  return asset.pre + fmt(value, asset.dec);
}

// fração (0.0275) -> "+2,75%"
export function pctText(fraction) {
  if (fraction == null || !Number.isFinite(fraction)) return '—';
  const sign = fraction >= 0 ? '+' : '−';
  return sign + fmt(Math.abs(fraction) * 100, 2) + '%';
}

// fração -> "2,75%" sem sinal
export function pctAbs(fraction) {
  return fmt(Math.abs(fraction) * 100, 2) + '%';
}

// Quanto tempo sem atualizar já conta como dado velho (segundos), por categoria.
const STALE_AFTER = { moedas: 30 * 60, cripto: 5 * 60, indices: 15 * 60 };

function ageText(sec) {
  if (sec < 3600) return `${Math.max(1, Math.round(sec / 60))} min`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} h`;
  return `${Math.floor(sec / 86400)} d`;
}

/** Devolve null se a cotação está fresca, ou { age, short, text } se está parada. */
export function staleInfo(asset, quote, nowSec = Date.now() / 1000) {
  if (!quote || !Number.isFinite(quote.ts)) return null;
  const age = nowSec - quote.ts;
  if (age <= (STALE_AFTER[asset.cat] ?? STALE_AFTER.moedas)) return null;
  const t = ageText(age);
  return {
    age,
    short: `Parado há ${t}`,
    text: `Este valor não é atualizado pela fonte há ${t}. Pode ser mercado fechado ou falha da fonte, então o preço mostrado pode estar desatualizado.`
  };
}
