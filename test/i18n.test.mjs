import test from 'node:test';
import assert from 'node:assert/strict';

// Este arquivo roda em português. Precisa vir antes de qualquer import do app, por isso os imports são dinâmicos.
globalThis.__LANG__ = 'pt-BR';
const { LANG, LOCALE } = await import('../src/i18n.js');
const { alertText } = await import('../src/alerts.js');
const { BY_ID } = await import('../src/catalog.js');
const { staleInfo, pctText } = await import('../src/format.js');
const { legalFor } = await import('../src/ui/legal.js');

test('idioma pt-BR é detectado', () => {
  assert.equal(LANG, 'pt');
  assert.equal(LOCALE, 'pt-BR');
});

test('alerta em português', () => {
  const m = { change: 0.0288, from: 5.9, to: 6.07 };
  const t = alertText(BY_ID.USDBRL, m);
  assert.equal(t.title, 'Dólar subiu 2,88%');
  assert.match(t.message, /Dólar acabou de subir 2,88% nos últimos minutos\. USD\/BRL: R\$ 6,0700\./);
  assert.equal(pctText(-0.0275), '−2,75%');
});

test('dado parado em português', () => {
  const s = staleInfo(BY_ID.BTC, { ts: 0 }, 3600);
  assert.equal(s.short, 'Parado há 1 h');
});

test('política tem as mesmas seções nos dois idiomas', () => {
  const en = legalFor('en');
  const pt = legalFor('pt');
  assert.equal(en.PRIVACY.length, pt.PRIVACY.length);
  assert.equal(en.DISCLAIMERS.length, pt.DISCLAIMERS.length);
  assert.equal(en.SOURCES.length, pt.SOURCES.length);
  assert.equal(en.HOW.length, pt.HOW.length);
  assert.equal(en.APP_NAME, 'Market Quotes');
  assert.equal(pt.APP_NAME, 'Cotações');
});
