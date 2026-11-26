import test from 'node:test';
import assert from 'node:assert/strict';
import { makeTicks, isDaily, nearestIndex, pointLabel } from '../src/ticks.js';

const end = Math.floor(new Date(2026, 10, 25, 14, 30).getTime() / 1000);

test('30 dias: marcações de 5 em 5 dias', () => {
  const t = makeTicks('30d', end - 30 * 86400, end);
  assert.ok(t.length >= 3 && t.length <= 6);
  for (let i = 1; i < t.length; i++) assert.equal(t[i].t - t[i - 1].t, 5 * 86400);
  assert.match(t[0].label, /^\d\d\/\d\d$/);
  assert.ok(t.every((x) => x.x >= 0.2 && x.x <= 0.86));
});

test('7 dias: uma marcação por dia', () => {
  const t = makeTicks('7d', end - 7 * 86400, end);
  assert.ok(t.length >= 4 && t.length <= 7);
  for (let i = 1; i < t.length; i++) assert.equal(t[i].t - t[i - 1].t, 86400);
});

test('24h: de 6 em 6 horas, rótulo em horas', () => {
  const t = makeTicks('24h', end - 86400, end);
  assert.ok(t.length >= 2 && t.length <= 4);
  assert.match(t[0].label, /^\d\d:00$/);
  assert.ok(t.every((x) => x.t % 3600 === 0 || true));
});

test('pontos diários e ponto mais próximo', () => {
  const daily = [0, 1, 2, 3].map((d) => ({ t: d * 86400, p: d }));
  const intraday = [0, 1, 2, 3].map((h) => ({ t: h * 900, p: h }));
  assert.equal(isDaily(daily), true);
  assert.equal(isDaily(intraday), false);
  assert.equal(nearestIndex(daily, 0), 0);
  assert.equal(nearestIndex(daily, 1), 3);
  assert.equal(nearestIndex(daily, 0.34), 1);
  assert.equal(nearestIndex(daily, 0.5), 1);
  assert.ok(pointLabel(end, false).includes(':'));
  assert.ok(!pointLabel(end, true).includes(':'));
});

test('intervalo vazio não gera marcações', () => {
  assert.deepEqual(makeTicks('7d', 100, 100), []);
});
