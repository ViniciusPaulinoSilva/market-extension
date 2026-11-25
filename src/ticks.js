// Marcações do eixo de tempo do gráfico. Funções puras (sem React), com hora local.

const DAY = 86400;

/** Escolhe os pontos do eixo: 24h = a cada 6 h, 7 dias = todo dia, 30 dias = de 5 em 5 dias. */
export function makeTicks(range, tMin, tMax) {
  const span = tMax - tMin;
  if (!(span > 0)) return [];
  const step = range === '30d' ? 5 * DAY : range === '7d' ? DAY : 6 * 3600;
  const d = new Date(tMax * 1000);
  if (range === '24h') {
    d.setMinutes(0, 0, 0);
    d.setHours(Math.floor(d.getHours() / 6) * 6);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  const out = [];
  for (let t = d.getTime() / 1000; t >= tMin; t -= step) {
    const x = (t - tMin) / span;
    // Fica longe das pontas para não encostar em "Há X" e "Agora".
    if (x < 0.2 || x > 0.86) continue;
    out.push({ t, x, label: tickLabel(range, t) });
  }
  return out.reverse();
}

export function tickLabel(range, t) {
  const d = new Date(t * 1000);
  if (range === '24h') return `${String(d.getHours()).padStart(2, '0')}h`;
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Texto da data do ponto sob o mouse. Pontos diários mostram só o dia. */
export function pointLabel(t, daily) {
  const d = new Date(t * 1000);
  const day = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
  if (daily) return day;
  return `${day} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

/** Os pontos são diários quando o espaço típico entre eles passa de 20 h. */
export function isDaily(series) {
  if (series.length < 2) return false;
  const gaps = [];
  for (let i = 1; i < series.length; i++) gaps.push(series[i].t - series[i - 1].t);
  gaps.sort((a, b) => a - b);
  return gaps[Math.floor(gaps.length / 2)] > 20 * 3600;
}

/** Índice do ponto mais próximo de uma posição horizontal (0 a 1) no gráfico. */
export function nearestIndex(series, fraction) {
  const tMin = series[0].t;
  const target = tMin + fraction * (series[series.length - 1].t - tMin);
  let lo = 0;
  let hi = series.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (series[mid].t < target) lo = mid;
    else hi = mid;
  }
  return Math.abs(series[lo].t - target) <= Math.abs(series[hi].t - target) ? lo : hi;
}
