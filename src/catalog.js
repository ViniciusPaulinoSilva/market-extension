// Catálogo fixo de ativos da primeira versão.
// provider: 'awesome' (moedas), 'binance' (cripto), 'hyperliquid' (substitutos dos índices).
// Os índices são CONTRATOS 24h que acompanham o índice. Não são o valor oficial (proxy: true).

import { L } from './i18n.js';

export const CATEGORIES = {
  moedas: L('Currency', 'Moeda'),
  cripto: L('Crypto', 'Cripto'),
  indices: L('Index', 'Índice')
};

export const MAX_SAVED = 5;

const CUR = { us: "USD", br: "BRL", eu: "EUR", gb: "GBP", jp: "JPY", cn: "CNY" };

function fx(id, a, b, name, alertName, o = {}) {
  return {
    id,
    cat: 'moedas',
    provider: 'awesome',
    sym: `${CUR[a]}-${CUR[b]}`,
    ticker: `${CUR[a]}/${CUR[b]}`,
    name,
    alertName,
    kind: 'pair',
    a,
    b,
    pre: o.pre ?? '',
    dec: o.dec ?? 4,
    unit: '',
    src: 'AwesomeAPI',
    market: L('Open Mon–Fri', 'Aberto, seg a sex')
  };
}

function crypto(id, sym, name, flagId, dec = 2) {
  return {
    id,
    cat: 'cripto',
    provider: 'binance',
    sym,
    ticker: id,
    name,
    alertName: name,
    kind: 'crypto',
    a: flagId,
    pre: L('$', 'US$ '),
    dec,
    unit: '',
    src: 'Binance',
    market: L('Open 24 hours', 'Aberto 24 horas')
  };
}

function index(id, sym, ticker, name, flag, code, tint, alertName) {
  return {
    id,
    cat: 'indices',
    provider: 'hyperliquid',
    sym,
    ticker,
    name,
    alertName,
    kind: 'index',
    a: flag,
    code,
    tint,
    pre: '',
    dec: 2,
    unit: L('points', 'pontos'),
    src: L('Hyperliquid (24h contract)', 'Hyperliquid (contrato 24h)'),
    market: L('24-hour contract', 'Contrato 24 horas'),
    proxy: true
  };
}

export const ASSETS = [
  fx('USDBRL', 'us', 'br', L('US Dollar', 'Dólar americano'), L('Dollar', 'Dólar'), { pre: 'R$ ' }),
  fx('EURBRL', 'eu', 'br', 'Euro', 'Euro', { pre: 'R$ ' }),
  fx('GBPBRL', 'gb', 'br', L('British Pound', 'Libra esterlina'), L('Pound', 'Libra'), { pre: 'R$ ' }),
  fx('JPYBRL', 'jp', 'br', L('Japanese Yen', 'Iene japonês'), L('Yen', 'Iene'), { pre: 'R$ ', dec: 5 }),
  fx('CNYBRL', 'cn', 'br', L('Chinese Yuan', 'Yuan chinês'), 'Yuan', { pre: 'R$ ' }),
  fx('EURUSD', 'eu', 'us', L('Euro / US Dollar', 'Euro / Dólar'), L('Euro/Dollar', 'Euro/Dólar')),
  fx('GBPUSD', 'gb', 'us', L('Pound / US Dollar', 'Libra / Dólar'), L('Pound/Dollar', 'Libra/Dólar')),
  fx('USDJPY', 'us', 'jp', L('US Dollar / Yen', 'Dólar / Iene'), L('Dollar/Yen', 'Dólar/Iene'), { dec: 2 }),
  fx('USDCNY', 'us', 'cn', L('US Dollar / Yuan', 'Dólar / Yuan'), L('Dollar/Yuan', 'Dólar/Yuan')),

  crypto('BTC', 'BTCUSDT', 'Bitcoin', 'btc'),
  crypto('ETH', 'ETHUSDT', 'Ethereum', 'eth'),
  crypto('BNB', 'BNBUSDT', 'BNB', 'bnb'),
  crypto('SOL', 'SOLUSDT', 'Solana', 'sol'),
  crypto('XRP', 'XRPUSDT', 'XRP', 'xrp'),
  crypto('TRX', 'TRXUSDT', 'TRON', 'trx', 4),
  crypto('HYPE', 'HYPEUSDT', 'Hyperliquid', 'hype'),
  crypto('ZEC', 'ZECUSDT', 'Zcash', 'zec'),
  crypto('DOGE', 'DOGEUSDT', 'Dogecoin', 'doge', 4),
  crypto('LINK', 'LINKUSDT', 'Chainlink', 'link'),

  index('SPX', 'xyz:SP500', 'S&P 500', 'S&P 500', 'us', 'SPX', '#1D4ED8', L('S&P 500 contract', 'Contrato do S&P 500')),
  index('NDX', 'xyz:XYZ100', 'Nasdaq-100', 'Nasdaq-100', 'us', 'NDX', '#0E7490', L('Nasdaq-100 contract', 'Contrato do Nasdaq-100')),
  index('N225', 'xyz:JP225', 'Nikkei 225', 'Nikkei 225', 'jp', 'N225', '#B91C1C', L('Nikkei 225 contract', 'Contrato do Nikkei 225')),
  { ...index('EWZ', 'xyz:EWZ', 'EWZ', L('Brazil (EWZ ETF)', 'Brasil (ETF EWZ)'), 'br', 'EWZ', '#15803D', L('EWZ ETF (Brazil) contract', 'Contrato do ETF EWZ (Brasil)')), pre: L('$', 'US$ '), unit: '' },
  index('K200', 'xyz:KR200', 'KOSPI 200', 'KOSPI 200', 'kr', 'K200', '#6D28D9', L('KOSPI 200 contract', 'Contrato do KOSPI 200'))
];

export const BY_ID = Object.fromEntries(ASSETS.map((a) => [a.id, a]));

export function assetsOf(cat) {
  return ASSETS.filter((a) => a.cat === cat);
}

export const DEFAULT_CONFIG = {
  alertsEnabled: true,
  windowMin: 5,
  cooldownMin: 5,
  cryptoPct: 5,
  otherPct: 2
};

export function thresholdFor(asset, config) {
  return (asset.cat === 'cripto' ? config.cryptoPct : config.otherPct) / 100;
}
