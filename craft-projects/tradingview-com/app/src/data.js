// Simulated market data: a fixed universe of symbols and a deterministic
// random-walk generator, so every page shows consistent numbers.

export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed) {
  let a = typeof seed === 'string' ? hashStr(seed) : seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(r) {
  let u = 0, v = 0;
  while (u === 0) u = r();
  while (v === 0) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// type: index | stock | crypto | futures | forex | bond
export const SYMBOLS = [
  { s: 'SPX', n: 'S&P 500', ex: 'SP', type: 'index', p: 7175.83, c: -2.02, cur: 'POINT', logo: '500', bg: '#c4122f', vol: 0.011 },
  { s: 'NDQ', n: 'Nasdaq 100', ex: 'NASDAQ', type: 'index', p: 26517.05, c: -2.21, cur: 'POINT', logo: '100', bg: '#0b97c4', vol: 0.013 },
  { s: 'DJI', n: 'Dow 30', ex: 'DJ', type: 'index', p: 49101.92, c: -2.19, cur: 'POINT', logo: '30', bg: '#20a7d8', vol: 0.010 },
  { s: 'VIX', n: 'Volatility Index', ex: 'CBOE', type: 'index', p: 28.44, c: 15.8, cur: 'POINT', logo: '▶', bg: '#2fa84f', vol: 0.05 },
  { s: 'DXY', n: 'US Dollar Index', ex: 'ICE', type: 'index', p: 103.929, c: 0.11, cur: 'USD', logo: '$', bg: '#0b7a5c', vol: 0.004 },
  { s: 'NI225', n: 'Japan 225', ex: 'TSE', type: 'index', p: 59443.99, c: 0.71, cur: 'JPY', logo: '225', bg: '#24467a', vol: 0.012 },
  { s: 'UKX', n: 'FTSE 100', ex: 'LSE', type: 'index', p: 10452.68, c: -0.93, cur: 'POINT', logo: '100', bg: '#3c6e8f', vol: 0.009 },
  { s: 'DAX', n: 'DAX', ex: 'XETR', type: 'index', p: 25463.81, c: -1.06, cur: 'POINT', logo: 'X', bg: '#2b5aa8', vol: 0.01 },
  { s: 'PX1', n: 'CAC 40', ex: 'EURONEXT', type: 'index', p: 8080.74, c: -0.81, cur: 'POINT', logo: '40', bg: '#2a7f62', vol: 0.01 },
  { s: 'AAPL', n: 'Apple Inc', ex: 'NASDAQ', type: 'stock', p: 349.21, c: -0.92, cur: 'USD', logo: '', bg: '#111', vol: 0.016, sector: 'Electronic Technology', ind: 'Telecommunications Equipment' },
  { s: 'TSLA', n: 'Tesla, Inc.', ex: 'NASDAQ', type: 'stock', p: 374.41, c: -2.43, cur: 'USD', logo: 'T', bg: '#e31937', vol: 0.03, sector: 'Consumer Durables', ind: 'Motor Vehicles' },
  { s: 'NFLX', n: 'Netflix, Inc.', ex: 'NASDAQ', type: 'stock', p: 58.46, c: -2.27, cur: 'USD', logo: 'N', bg: '#000', fg: '#e50914', vol: 0.022, sector: 'Technology Services', ind: 'Internet Software' },
  { s: 'NVDA', n: 'NVIDIA Corporation', ex: 'NASDAQ', type: 'stock', p: 145.98, c: -3.3, cur: 'USD', logo: 'N', bg: '#1a1a1a', fg: '#76b900', vol: 0.028, sector: 'Electronic Technology', ind: 'Semiconductors' },
  { s: 'MSFT', n: 'Microsoft Corporation', ex: 'NASDAQ', type: 'stock', p: 498.3, c: -1.97, cur: 'USD', logo: '▦', bg: '#f2f2f2', fg: '#f25022', vol: 0.014, sector: 'Technology Services', ind: 'Packaged Software' },
  { s: 'AMZN', n: 'Amazon.com, Inc.', ex: 'NASDAQ', type: 'stock', p: 257.37, c: -3.87, cur: 'USD', logo: 'a', bg: '#ff9900', vol: 0.02, sector: 'Retail Trade', ind: 'Internet Retail' },
  { s: 'GOOGL', n: 'Alphabet Inc.', ex: 'NASDAQ', type: 'stock', p: 272.66, c: -3.46, cur: 'USD', logo: 'G', bg: '#fff', fg: '#4285f4', vol: 0.018, sector: 'Technology Services', ind: 'Internet Software' },
  { s: 'META', n: 'Meta Platforms, Inc.', ex: 'NASDAQ', type: 'stock', p: 612.4, c: -1.2, cur: 'USD', logo: '∞', bg: '#eef3ff', fg: '#0866ff', vol: 0.022, sector: 'Technology Services', ind: 'Internet Software' },
  { s: 'AMD', n: 'Advanced Micro Devices', ex: 'NASDAQ', type: 'stock', p: 489.19, c: -7.72, cur: 'USD', logo: 'A', bg: '#111', vol: 0.032, sector: 'Electronic Technology', ind: 'Semiconductors' },
  { s: 'ANT', n: 'Anthropic, PBC', ex: 'NASDAQ', type: 'stock', p: 97.17, c: 17.07, cur: 'USD', logo: 'A\\', bg: '#f0efea', fg: '#111', vol: 0.04, sector: 'Technology Services', ind: 'Packaged Software' },
  { s: 'PANW', n: 'Palo Alto Networks, Inc.', ex: 'NASDAQ', type: 'stock', p: 361.73, c: 6.42, cur: 'USD', logo: '//', bg: '#fff1ec', fg: '#fa582d', vol: 0.02, sector: 'Technology Services', ind: 'Packaged Software' },
  { s: 'GME', n: 'GameStop Corporation', ex: 'NYSE', type: 'stock', p: 26.93, c: 1.51, cur: 'USD', logo: 'GS', bg: '#111', vol: 0.04, sector: 'Retail Trade', ind: 'Electronics Stores' },
  { s: 'CRWD', n: 'CrowdStrike Holdings, Inc.', ex: 'NASDAQ', type: 'stock', p: 243.46, c: 2.71, cur: 'USD', logo: 'C', bg: '#e01e1e', vol: 0.026, sector: 'Technology Services', ind: 'Packaged Software' },
  { s: 'MU', n: 'Micron Technology, Inc.', ex: 'NASDAQ', type: 'stock', p: 690.44, c: -2.1, cur: 'USD', logo: 'M', bg: '#1f4f9a', vol: 0.028, sector: 'Electronic Technology', ind: 'Semiconductors' },
  { s: 'SPCX', n: 'Space Exploration Technologies', ex: 'NASDAQ', type: 'stock', p: 138.43, c: -3.53, cur: 'USD', logo: 'X', bg: '#111', vol: 0.03, sector: 'Electronic Technology', ind: 'Aerospace' },
  { s: 'BTCUSD', n: 'Bitcoin / U.S. Dollar', ex: 'COINBASE', type: 'crypto', p: 61723, c: -1.99, cur: 'USD', logo: '₿', bg: '#f7931a', vol: 0.03 },
  { s: 'ETHUSD', n: 'Ethereum / U.S. Dollar', ex: 'COINBASE', type: 'crypto', p: 1745.5, c: -1.61, cur: 'USD', logo: '◆', bg: '#4b5a9a', vol: 0.038 },
  { s: 'SOLUSD', n: 'Solana / U.S. Dollar', ex: 'COINBASE', type: 'crypto', p: 92.14, c: -4.12, cur: 'USD', logo: 'S', bg: '#7a3cf0', vol: 0.045 },
  { s: 'XRPUSD', n: 'XRP / U.S. Dollar', ex: 'BITSTAMP', type: 'crypto', p: 1.4021, c: -2.9, cur: 'USD', logo: 'X', bg: '#222', vol: 0.045 },
  { s: 'CL1!', n: 'Light crude oil futures', ex: 'NYMEX', type: 'futures', p: 82.44, c: 0.16, cur: 'USD', logo: '●', bg: '#111', vol: 0.02 },
  { s: 'NG1!', n: 'Natural gas futures', ex: 'NYMEX', type: 'futures', p: 3.268, c: -3.08, cur: 'USD', logo: '◆', bg: '#4ea3f0', vol: 0.035 },
  { s: 'GC1!', n: 'Gold futures', ex: 'COMEX', type: 'futures', p: 3685.5, c: -1.51, cur: 'USD', logo: '▲', bg: '#d6a017', vol: 0.011 },
  { s: 'SI1!', n: 'Silver futures', ex: 'COMEX', type: 'futures', p: 44.36, c: -1.55, cur: 'USD', logo: '▲', bg: '#9aa0a8', vol: 0.018 },
  { s: 'HG1!', n: 'Copper futures', ex: 'COMEX', type: 'futures', p: 5.6335, c: -0.62, cur: 'USD', logo: '■', bg: '#c0623f', vol: 0.014 },
  { s: 'EURUSD', n: 'Euro / U.S. Dollar', ex: 'FX', type: 'forex', p: 1.0982, c: 0.02, cur: 'USD', logo: '€', bg: '#1e4fb4', vol: 0.004 },
  { s: 'GBPUSD', n: 'British Pound / U.S. Dollar', ex: 'FX', type: 'forex', p: 1.2715, c: -0.18, cur: 'USD', logo: '£', bg: '#1a2a6c', vol: 0.005 },
  { s: 'USDJPY', n: 'U.S. Dollar / Japanese Yen', ex: 'FX', type: 'forex', p: 159.02, c: 0.21, cur: 'JPY', logo: '¥', bg: '#c4122f', vol: 0.005 },
  { s: 'XAUUSD', n: 'Gold / U.S. Dollar', ex: 'OANDA', type: 'forex', p: 3672.4, c: -1.4, cur: 'USD', logo: '▲', bg: '#d6a017', vol: 0.011 },
  { s: 'US10Y', n: 'US 10 Year Yield', ex: 'TVC', type: 'bond', p: 4.512, c: -0.8, cur: '%', logo: '10', bg: '#3b6fd8', vol: 0.01 },
];

export const BY_SYMBOL = Object.fromEntries(SYMBOLS.map((x) => [x.s, x]));

export function decimalsFor(p) {
  if (p >= 1000) return 2;
  if (p >= 10) return 2;
  if (p >= 1) return 4;
  return 6;
}

export function fmt(v, d) {
  if (d === undefined) d = decimalsFor(Math.abs(v));
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function fmtPct(v) {
  const s = Math.abs(v).toFixed(2) + '%';
  return (v >= 0 ? '+' : '−') + s;
}

export function fmtSigned(v, d) {
  const s = fmt(Math.abs(v), d);
  return (v >= 0 ? '+' : '−') + s;
}

export function fmtVol(v) {
  if (v >= 1e9) return (v / 1e9).toFixed(2) + ' B';
  if (v >= 1e6) return (v / 1e6).toFixed(2) + ' M';
  if (v >= 1e3) return (v / 1e3).toFixed(2) + ' K';
  return String(Math.round(v));
}

export const INTERVALS = {
  '1': { label: '1 minute', short: '1m', sec: 60 },
  '5': { label: '5 minutes', short: '5m', sec: 300 },
  '15': { label: '15 minutes', short: '15m', sec: 900 },
  '60': { label: '1 hour', short: '1h', sec: 3600 },
  '240': { label: '4 hours', short: '4h', sec: 14400 },
  'D': { label: '1 day', short: 'D', sec: 86400 },
  'W': { label: '1 week', short: 'W', sec: 604800 },
  'M': { label: '1 month', short: 'M', sec: 2592000 },
};

// Generate bars ending at "now" whose last close equals the symbol price.
export function genBars(sym, interval, count) {
  const info = BY_SYMBOL[sym] || { p: 100, vol: 0.02 };
  const iv = INTERVALS[interval] || INTERVALS.D;
  const r = rng(sym + ':' + interval);
  const daily = info.vol || 0.02;
  const scale = Math.sqrt(iv.sec / 86400);
  const sigma = Math.min(0.25, daily * scale);
  const n = count || (interval === 'M' ? 160 : interval === 'W' ? 400 : 600);
  const now = Math.floor(Date.now() / 1000);
  const end = Math.floor(now / iv.sec) * iv.sec;
  // walk backwards from the current price
  const closes = new Array(n);
  let price = info.p;
  let drift = 0;
  for (let i = n - 1; i >= 0; i--) {
    closes[i] = price;
    drift = drift * 0.95 + gauss(r) * sigma * 0.08;
    const ch = gauss(r) * sigma * 0.9 + drift * 0.35 + sigma * 0.06;
    price = price / (1 + ch);
    if (price <= 0) price = info.p * 0.05;
  }
  const bars = [];
  const baseVol = (info.type === 'index' ? 3e8 : info.type === 'crypto' ? 2e4 : 4e7) * Math.max(0.05, scale);
  let prevClose = closes[0] * (1 + gauss(r) * sigma * 0.5);
  for (let i = 0; i < n; i++) {
    const c = closes[i];
    const o = prevClose * (1 + gauss(r) * sigma * 0.15);
    const hi = Math.max(o, c) * (1 + Math.abs(gauss(r)) * sigma * 0.45);
    const lo = Math.min(o, c) * (1 - Math.abs(gauss(r)) * sigma * 0.45);
    const v = baseVol * (0.5 + r() * 0.9) * (1 + Math.min(4, Math.abs(c - o) / (o * sigma + 1e-9)) * 0.35);
    bars.push({ t: end - (n - 1 - i) * iv.sec, o, h: hi, l: lo, c, v });
    prevClose = c;
  }
  return bars;
}

// A simple series used by sparklines and summary cards.
export function series(seed, n, start, vol, trend) {
  const r = rng(seed);
  const out = [];
  let v = start;
  for (let i = 0; i < n; i++) {
    v = v * (1 + (r() - 0.5) * vol + (trend || 0));
    out.push(v);
  }
  return out;
}

const APPLE = 'M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.5 1.3-2.6 0 0-2.5-1-2.5-3.8zM14.1 5.8c.6-.8 1.1-1.8 1-2.8-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.6-1.3z';
const logoCache = new Map();
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function logoSrc(info) {
  const text = info.logo || (info.s || '?')[0];
  const key = (info.s === 'AAPL' ? 'AAPL' : text) + '|' + info.bg + '|' + (info.fg || '');
  if (logoCache.has(key)) return logoCache.get(key);
  const fg = info.fg || '#fff';
  const fsz = text.length > 2 ? 15 : text.length > 1 ? 18 : 21;
  const inner = info.s === 'AAPL'
    ? `<path transform="translate(8.5 7.5) scale(.82)" fill="#fff" d="${APPLE}"/>`
    : `<text x="18" y="18" dy=".36em" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${fsz}" letter-spacing="-0.5" fill="${fg}">${esc(text)}</text>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="18" fill="${info.bg || '#2962ff'}"/>${inner}</svg>`;
  const src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  logoCache.set(key, src);
  return src;
}

export function logoHTML(sym, size) {
  const info = typeof sym === 'string' ? BY_SYMBOL[sym] || { logo: sym[0], bg: '#2962ff' } : sym;
  const sz = size || 18;
  return `<img class="logo" src="${logoSrc(info)}" width="${sz}" height="${sz}" alt="" loading="lazy" decoding="async">`;
}

export function chgClass(v) {
  return v >= 0 ? 'up' : 'down';
}
