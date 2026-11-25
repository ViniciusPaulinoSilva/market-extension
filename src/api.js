// Acesso às fontes de dados. Cada provedor devolve a mesma forma:
//   quote:   { price, prev, change24h (fração), hi, lo, open, ts (segundos) }
//   history: [{ t (segundos), p }] em ordem crescente de tempo
import { BY_ID } from './catalog.js';

const AWESOME = 'https://economia.awesomeapi.com.br';
const BINANCE = 'https://data-api.binance.vision';
const HYPER = 'https://api.hyperliquid.xyz/info';

const RANGE_SEC = { '24h': 86400, '7d': 7 * 86400, '30d': 30 * 86400 };

async function getJson(url, init, timeoutMs = 10000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} em ${new URL(url).host}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

const num = (v) => (v == null || v === '' ? null : Number(v));

// ---------- parsers (puros, testáveis sem rede) ----------

export function parseAwesomeLast(data, assets) {
  const out = {};
  for (const a of assets) {
    const r = data[a.sym.replace('-', '')];
    if (!r) continue;
    const price = num(r.bid);
    if (!Number.isFinite(price) || price <= 0) continue;
    out[a.id] = {
      price,
      prev: price - num(r.varBid),
      change24h: num(r.pctChange) / 100,
      hi: num(r.high),
      lo: num(r.low),
      open: null,
      ts: num(r.timestamp)
    };
  }
  return out;
}

export function parseBinance24hr(list, assets) {
  const bySym = Object.fromEntries(assets.map((a) => [a.sym, a]));
  const out = {};
  for (const r of list) {
    const a = bySym[r.symbol];
    if (!a) continue;
    const price = num(r.lastPrice);
    if (!Number.isFinite(price) || price <= 0) continue;
    out[a.id] = {
      price,
      prev: num(r.prevClosePrice),
      change24h: num(r.priceChangePercent) / 100,
      hi: num(r.highPrice),
      lo: num(r.lowPrice),
      open: num(r.openPrice),
      ts: Math.round(num(r.closeTime) / 1000)
    };
  }
  return out;
}

export function parseHyperliquidCtx(payload, assets, nowSec) {
  const [meta, ctxs] = payload;
  const bySym = Object.fromEntries(assets.map((a) => [a.sym, a]));
  const out = {};
  meta.universe.forEach((u, i) => {
    const a = bySym[u.name];
    const c = ctxs[i];
    if (!a || !c) return;
    const price = num(c.markPx);
    const prev = num(c.prevDayPx);
    // Mercado sem negociação (preço fixo, sem volume) não serve de cotação.
    if (!Number.isFinite(price) || price <= 0 || !(num(c.dayNtlVlm) > 0)) return;
    out[a.id] = {
      price,
      prev,
      change24h: prev ? price / prev - 1 : null,
      hi: null,
      lo: null,
      open: null,
      ts: nowSec
    };
  });
  return out;
}

export function parseAwesomeTicks(list, sinceSec) {
  return list
    .map((r) => ({ t: num(r.timestamp), p: num(r.bid) }))
    .filter((x) => Number.isFinite(x.t) && Number.isFinite(x.p) && x.t >= sinceSec)
    .sort((a, b) => a.t - b.t);
}

export function parseBinanceKlines(list) {
  return list.map((k) => ({ t: Math.round(k[6] / 1000), p: num(k[4]) }));
}

export function parseHyperliquidCandles(list) {
  return list.map((c) => ({ t: Math.round(c.T / 1000), p: num(c.c) }));
}

// ---------- cotações ----------

function group(ids) {
  const g = { awesome: [], binance: [], hyperliquid: [] };
  for (const id of ids) {
    const a = BY_ID[id];
    if (a) g[a.provider].push(a);
  }
  return g;
}

/** Busca as cotações. Devolve { quotes: {id: quote}, errors: [mensagem] } */
export async function fetchQuotes(ids) {
  const g = group(ids);
  const quotes = {};
  const errors = [];
  const nowSec = Math.round(Date.now() / 1000);

  const jobs = [];
  if (g.awesome.length) {
    const pairs = [...new Set(g.awesome.map((a) => a.sym))].join(',');
    jobs.push(
      getJson(`${AWESOME}/json/last/${pairs}`).then((d) => Object.assign(quotes, parseAwesomeLast(d, g.awesome)))
    );
  }
  if (g.binance.length) {
    const syms = encodeURIComponent(JSON.stringify(g.binance.map((a) => a.sym)));
    jobs.push(
      getJson(`${BINANCE}/api/v3/ticker/24hr?symbols=${syms}`).then((d) =>
        Object.assign(quotes, parseBinance24hr(d, g.binance))
      )
    );
  }
  if (g.hyperliquid.length) {
    jobs.push(
      getJson(HYPER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'metaAndAssetCtxs', dex: 'xyz' })
      }).then((d) => Object.assign(quotes, parseHyperliquidCtx(d, g.hyperliquid, nowSec)))
    );
  }
  const results = await Promise.allSettled(jobs);
  for (const r of results) if (r.status === 'rejected') errors.push(String(r.reason?.message || r.reason));
  return { quotes, errors };
}

// ---------- histórico para o gráfico ----------

const BINANCE_INTERVAL = { '24h': ['15m', 96], '7d': ['1h', 168], '30d': ['4h', 180] };
const HYPER_INTERVAL = { '24h': '15m', '7d': '1h', '30d': '4h' };

export async function fetchHistory(asset, range) {
  const nowSec = Math.round(Date.now() / 1000);
  const since = nowSec - RANGE_SEC[range];

  if (asset.provider === 'binance') {
    const [interval, limit] = BINANCE_INTERVAL[range];
    const d = await getJson(`${BINANCE}/api/v3/klines?symbol=${asset.sym}&interval=${interval}&limit=${limit}`);
    return parseBinanceKlines(d);
  }

  if (asset.provider === 'hyperliquid') {
    const d = await getJson(HYPER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'candleSnapshot',
        req: { coin: asset.sym, interval: HYPER_INTERVAL[range], startTime: since * 1000, endTime: nowSec * 1000 }
      })
    });
    return parseHyperliquidCandles(d);
  }

  // moedas: a AwesomeAPI só tem pontos diários (7d, 30d) e as últimas cotações (24h)
  if (range === '24h') {
    const ticks = parseAwesomeTicks(await getJson(`${AWESOME}/json/${asset.sym}/100`), since);
    if (ticks.length >= 2) return ticks;
  }
  const days = range === '30d' ? 30 : range === '7d' ? 7 : 2;
  const daily = await getJson(`${AWESOME}/json/daily/${asset.sym}/${days}`);
  return parseAwesomeTicks(daily, 0);
}
