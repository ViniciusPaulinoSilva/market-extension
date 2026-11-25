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
