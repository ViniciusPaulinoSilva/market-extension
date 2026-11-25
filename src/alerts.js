// Detecção de movimento rápido. Funções puras, sem acesso a rede nem ao navegador.
import { pctAbs, money } from './format.js';

const KEEP_SEC = 30 * 60; // histórico de amostras guardado por ativo
const MAX_AGE_SEC = 15 * 60; // amostra mais velha que isso = fonte parada, não alerta

/** Acrescenta uma amostra {t, p}. Ignora preço inválido e tempo repetido ou anterior. */
export function pushSample(samples, t, p) {
  if (!Number.isFinite(t) || !Number.isFinite(p) || p <= 0) return samples;
  const last = samples[samples.length - 1];
  if (last && t <= last.t) return samples;
  const next = samples.concat([{ t, p }]);
  const minT = t - KEEP_SEC;
  return next.filter((s) => s.t >= minT);
}

/**
 * Maior movimento dentro da janela, terminando na amostra mais recente.
 * Devolve { change (fração com sinal), from, to } ou null.
 */
export function detectMove(samples, windowSec) {
  if (samples.length < 2) return null;
  const last = samples[samples.length - 1];
  const inWindow = samples.filter((s) => s.t >= last.t - windowSec && s !== last);
  if (!inWindow.length) return null;
  let low = inWindow[0];
  let high = inWindow[0];
  for (const s of inWindow) {
    if (s.p < low.p) low = s;
    if (s.p > high.p) high = s;
  }
  const up = last.p / low.p - 1;
  const down = last.p / high.p - 1;
  return Math.abs(up) >= Math.abs(down)
    ? { change: up, from: low.p, to: last.p }
    : { change: down, from: high.p, to: last.p };
}

/**
 * Decide se deve avisar.
 * state: { samples, lastAlert (segundos ou 0) }, nowSec: relógio atual.
 */
export function evaluate({ samples, lastAlert }, { threshold, windowSec, cooldownSec }, nowSec) {
  const last = samples[samples.length - 1];
  if (!last) return null;
  if (nowSec - last.t > MAX_AGE_SEC) return null; // dado velho: mercado fechado ou fonte parada
  if (lastAlert && nowSec - lastAlert < cooldownSec) return null;
  const move = detectMove(samples, windowSec);
  if (!move || Math.abs(move.change) < threshold) return null;
  return move;
}

export function alertText(asset, move) {
  const up = move.change > 0;
  const pct = pctAbs(move.change);
  return {
    title: `${asset.alertName} ${up ? 'subiu' : 'caiu'} ${pct}`,
    message: `${asset.alertName} acabou de ${up ? 'subir' : 'cair'} ${pct} nos últimos minutos. ${asset.ticker}: ${money(asset, move.to)}.`
  };
}
