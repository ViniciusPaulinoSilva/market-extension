import test from 'node:test';
import assert from 'node:assert/strict';
import { pushSample, detectMove, evaluate, alertText } from '../src/alerts.js';
import { BY_ID } from '../src/catalog.js';

const cfg = { threshold: 0.02, windowSec: 300, cooldownSec: 300 };
const build = (pairs) => pairs.reduce((s, [t, p]) => pushSample(s, t, p), []);

test('pushSample ignora preço inválido e tempo repetido', () => {
  let s = pushSample([], 100, 5);
  s = pushSample(s, 100, 6);
  s = pushSample(s, 90, 6);
  s = pushSample(s, 110, 0);
  s = pushSample(s, 110, NaN);
  assert.deepEqual(s, [{ t: 100, p: 5 }]);
});

test('pushSample descarta amostras com mais de 30 min', () => {
  const s = build([[0, 1], [1000, 1], [2000, 1]]);
  assert.equal(s[0].t, 1000 - 0 > 1800 ? 1000 : 1000);
  assert.ok(s.every((x) => x.t >= 2000 - 1800));
});

test('alerta de alta de 2,75% dentro de 5 min', () => {
  const s = build([[0, 5.9], [60, 5.95], [120, 6.0], [180, 6.07]]);
  const m = evaluate({ samples: s, lastAlert: 0 }, cfg, 180);
  assert.ok(m && m.change > 0.0288 && m.change < 0.0289);
  const t = alertText(BY_ID.USDBRL, m);
  assert.equal(t.title, 'Dollar rose 2.88%');
  assert.match(t.message, /Dollar just rose 2\.88% in the last few minutes\. USD\/BRL: R\$ 6\.0700\./);
});

test('alerta de queda', () => {
  const s = build([[0, 100], [60, 99], [120, 97.5]]);
  const m = evaluate({ samples: s, lastAlert: 0 }, cfg, 120);
  assert.ok(m.change < -0.024);
  assert.match(alertText(BY_ID.BTC, m).title, /^Bitcoin fell/);
});

test('movimento abaixo do limite não alerta', () => {
  const s = build([[0, 100], [60, 100.5], [120, 101]]);
  assert.equal(evaluate({ samples: s, lastAlert: 0 }, cfg, 120), null);
});

test('movimento fora da janela de 5 min não conta', () => {
  const s = build([[0, 100], [400, 103]]);
  assert.equal(detectMove(s, 300), null);
  assert.equal(evaluate({ samples: s, lastAlert: 0 }, cfg, 400), null);
});

test('cooldown de 5 min impede alerta repetido', () => {
  const s = build([[0, 100], [60, 103]]);
  assert.ok(evaluate({ samples: s, lastAlert: 0 }, cfg, 60));
  assert.equal(evaluate({ samples: s, lastAlert: 30 }, cfg, 60), null);
  assert.ok(evaluate({ samples: s, lastAlert: 0 }, cfg, 60));
});

test('dado velho (mercado fechado) não alerta', () => {
  const s = build([[0, 100], [60, 103]]);
  assert.equal(evaluate({ samples: s, lastAlert: 0 }, cfg, 60 + 20 * 60), null);
});

test('cripto usa limite de 5%', async () => {
  const { thresholdFor, DEFAULT_CONFIG } = await import('../src/catalog.js');
  assert.equal(thresholdFor(BY_ID.BTC, DEFAULT_CONFIG), 0.05);
  assert.equal(thresholdFor(BY_ID.USDBRL, DEFAULT_CONFIG), 0.02);
  const s = build([[0, 100], [60, 103]]);
  const m = evaluate({ samples: s, lastAlert: 0 }, { ...cfg, threshold: 0.05 }, 60);
  assert.equal(m, null);
});
