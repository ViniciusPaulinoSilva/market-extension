import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAwesomeLast, parseBinance24hr, parseHyperliquidCtx, parseAwesomeTicks, parseBinanceKlines, parseHyperliquidCandles } from '../src/api.js';
import { ASSETS, BY_ID } from '../src/catalog.js';

test('parse AwesomeAPI /last', () => {
  const d = { USDBRL: { high: '5.9517', low: '5.8034', varBid: '-0.0242', pctChange: '-0.408131', bid: '5.9053', ask: '5.9058', timestamp: '1795559405' } };
  const q = parseAwesomeLast(d, [BY_ID.USDBRL, BY_ID.EURBRL]);
  assert.equal(Object.keys(q).length, 1);
  assert.equal(q.USDBRL.price, 5.9053);
  assert.ok(Math.abs(q.USDBRL.prev - 5.9295) < 1e-9);
  assert.ok(Math.abs(q.USDBRL.change24h + 0.00408131) < 1e-9);
  assert.equal(q.USDBRL.ts, 1795559405);
});

test('parse Binance 24hr', () => {
  const d = [{ symbol: 'BTCUSDT', lastPrice: '59384.01', prevClosePrice: '60288.54', priceChangePercent: '-1.500', highPrice: '60768.56', lowPrice: '58952.48', openPrice: '60288.53', closeTime: 1795578599013 }];
  const q = parseBinance24hr(d, [BY_ID.BTC, BY_ID.ETH]);
  assert.equal(q.BTC.price, 59384.01);
  assert.equal(q.BTC.change24h, -0.015);
  assert.equal(q.BTC.ts, 1795578599);
});

test('parse Hyperliquid ignora mercado sem negociação', () => {
  const payload = [
    { universe: [{ name: 'xyz:SP500' }, { name: 'xyz:VIX' }] },
    [
      { markPx: '7164.3', prevDayPx: '7236.7', dayNtlVlm: '383085908' },
      { markPx: '20.0', prevDayPx: '20.0', dayNtlVlm: '0' }
    ]
  ];
  const q = parseHyperliquidCtx(payload, [BY_ID.SPX, { id: "DEAD", sym: "xyz:VIX" }], 1000);
  assert.equal(q.SPX.price, 7164.3);
  assert.ok(Math.abs(q.SPX.change24h - (7164.3 / 7236.7 - 1)) < 1e-12);
  assert.equal(q.DEAD, undefined);
});

test('parse de histórico', () => {
  assert.deepEqual(parseAwesomeTicks([{ timestamp: '200', bid: '5.9' }, { timestamp: '100', bid: '5.8' }, { timestamp: '10', bid: '5.0' }], 50), [{ t: 100, p: 5.8 }, { t: 200, p: 5.9 }]);
  assert.deepEqual(parseBinanceKlines([[0, '1', '2', '0', '1.5', '9', 899999]]), [{ t: 900, p: 1.5 }]);
  assert.deepEqual(parseHyperliquidCandles([{ T: 1799999, c: '7250.5' }]), [{ t: 1800, p: 7250.5 }]);
});

test('catálogo: ids únicos e proxies marcados', () => {
  assert.equal(new Set(ASSETS.map((a) => a.id)).size, ASSETS.length);
  assert.ok(ASSETS.filter((a) => a.cat === 'indices').every((a) => a.proxy));
  assert.ok(ASSETS.filter((a) => a.cat !== 'indices').every((a) => !a.proxy));
});
