// Catálogo fixo de ativos da primeira versão.
// provider: 'awesome' (moedas), 'binance' (cripto), 'hyperliquid' (substitutos dos índices).
// Os índices são CONTRATOS 24h que acompanham o índice. Não são o valor oficial (proxy: true).

export const CATEGORIES = {
  moedas: 'Moeda',
  cripto: 'Cripto',
  indices: 'Índice'
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
    market: 'Aberto, seg a sex'
  };
}

function crypto(id, sym, name, flagId) {
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
    pre: 'US$ ',
    dec: 2,
    unit: '',
    src: 'Binance',
    market: 'Aberto 24 horas'
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
    unit: 'pontos',
    src: 'Hyperliquid (contrato 24h)',
    market: 'Contrato 24 horas',
    proxy: true
  };
}

export const ASSETS = [
  fx('USDBRL', 'us', 'br', 'Dólar americano', 'Dólar', { pre: 'R$ ' }),
  fx('EURBRL', 'eu', 'br', 'Euro', 'Euro', { pre: 'R$ ' }),
  fx('GBPBRL', 'gb', 'br', 'Libra esterlina', 'Libra', { pre: 'R$ ' }),
  fx('JPYBRL', 'jp', 'br', 'Iene japonês', 'Iene', { pre: 'R$ ', dec: 5 }),
  fx('CNYBRL', 'cn', 'br', 'Yuan chinês', 'Yuan', { pre: 'R$ ' }),
  fx('EURUSD', 'eu', 'us', 'Euro / Dólar', 'Euro/Dólar'),
  fx('GBPUSD', 'gb', 'us', 'Libra / Dólar', 'Libra/Dólar'),
  fx('USDJPY', 'us', 'jp', 'Dólar / Iene', 'Dólar/Iene', { dec: 2 }),
  fx('USDCNY', 'us', 'cn', 'Dólar / Yuan', 'Dólar/Yuan'),

  crypto('BTC', 'BTCUSDT', 'Bitcoin', 'btc'),
  crypto('ETH', 'ETHUSDT', 'Ethereum', 'eth'),
  crypto('BNB', 'BNBUSDT', 'BNB', 'bnb'),
  crypto('SOL', 'SOLUSDT', 'Solana', 'sol'),

  index('SPX', 'xyz:SP500', 'S&P 500', 'S&P 500', 'us', 'SPX', '#1D4ED8', 'Contrato do S&P 500'),
  index('NDX', 'xyz:XYZ100', 'Nasdaq-100', 'Nasdaq-100', 'us', 'NDX', '#0E7490', 'Contrato do Nasdaq-100'),
  index('N225', 'xyz:JP225', 'Nikkei 225', 'Nikkei 225', 'jp', 'N225', '#B91C1C', 'Contrato do Nikkei 225'),
  { ...index('EWZ', 'xyz:EWZ', 'EWZ', 'Brasil (ETF EWZ)', 'br', 'EWZ', '#15803D', 'Contrato do ETF EWZ (Brasil)'), pre: 'US$ ', unit: '' },
  index('K200', 'xyz:KR200', 'KOSPI 200', 'KOSPI 200', 'kr', 'K200', '#6D28D9', 'Contrato do KOSPI 200')
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
