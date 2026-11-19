// Technical indicators computed from bar arrays.

export function sma(src, n) {
  const out = new Array(src.length).fill(null);
  let sum = 0;
  for (let i = 0; i < src.length; i++) {
    sum += src[i];
    if (i >= n) sum -= src[i - n];
    if (i >= n - 1) out[i] = sum / n;
  }
  return out;
}

export function ema(src, n) {
  const out = new Array(src.length).fill(null);
  const k = 2 / (n + 1);
  let prev = null;
  for (let i = 0; i < src.length; i++) {
    if (src[i] == null) continue;
    if (prev == null) {
      if (i >= n - 1) {
        let s = 0;
        for (let j = i - n + 1; j <= i; j++) s += src[j];
        prev = s / n;
        out[i] = prev;
      }
      continue;
    }
    prev = src[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

export function rsi(src, n) {
  const out = new Array(src.length).fill(null);
  let gain = 0, loss = 0;
  for (let i = 1; i < src.length; i++) {
    const d = src[i] - src[i - 1];
    const g = Math.max(d, 0), l = Math.max(-d, 0);
    if (i <= n) {
      gain += g; loss += l;
      if (i === n) { gain /= n; loss /= n; out[i] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss); }
    } else {
      gain = (gain * (n - 1) + g) / n;
      loss = (loss * (n - 1) + l) / n;
      out[i] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
    }
  }
  return out;
}

export function macd(src, fast, slow, sig) {
  const f = ema(src, fast), s = ema(src, slow);
  const line = src.map((_, i) => (f[i] != null && s[i] != null ? f[i] - s[i] : null));
  const firstIdx = line.findIndex((v) => v != null);
  const compact = line.slice(firstIdx);
  const sigC = ema(compact, sig);
  const signal = line.map((_, i) => (i >= firstIdx ? sigC[i - firstIdx] : null));
  const hist = line.map((v, i) => (v != null && signal[i] != null ? v - signal[i] : null));
  return { line, signal, hist };
}

export function bollinger(src, n, mult) {
  const mid = sma(src, n);
  const up = new Array(src.length).fill(null), lo = new Array(src.length).fill(null);
  for (let i = n - 1; i < src.length; i++) {
    let s = 0;
    for (let j = i - n + 1; j <= i; j++) s += (src[j] - mid[i]) ** 2;
    const sd = Math.sqrt(s / n);
    up[i] = mid[i] + mult * sd;
    lo[i] = mid[i] - mult * sd;
  }
  return { mid, up, lo };
}

// Catalogue shown in the Indicators dialog.
export const CATALOG = [
  { type: 'vol', name: 'Volume', short: 'Vol', pane: 'overlay', params: {}, desc: 'Traded volume per bar' },
  { type: 'sma', name: 'Moving Average Simple', short: 'MA', pane: 'main', params: { length: 20 }, color: '#2962ff', desc: 'Average close over N bars' },
  { type: 'ema', name: 'Moving Average Exponential', short: 'EMA', pane: 'main', params: { length: 50 }, color: '#ff6d00', desc: 'Weighted average that reacts faster' },
  { type: 'bb', name: 'Bollinger Bands', short: 'BB', pane: 'main', params: { length: 20, mult: 2 }, color: '#2962ff', desc: 'Volatility bands around an average' },
  { type: 'rsi', name: 'Relative Strength Index', short: 'RSI', pane: 'sub', params: { length: 14 }, color: '#7e57c2', desc: 'Momentum between 0 and 100' },
  { type: 'macd', name: 'MACD', short: 'MACD', pane: 'sub', params: { fast: 12, slow: 26, signal: 9 }, color: '#2962ff', desc: 'Trend momentum from two averages' },
];

export const MA_COLORS = ['#2962ff', '#ff6d00', '#e91e63', '#00897b', '#9c27b0', '#795548'];

export function compute(ind, bars) {
  const close = bars.map((b) => b.c);
  const p = ind.params;
  switch (ind.type) {
    case 'sma': return { line: sma(close, p.length) };
    case 'ema': return { line: ema(close, p.length) };
    case 'bb': return bollinger(close, p.length, p.mult);
    case 'rsi': return { line: rsi(close, p.length) };
    case 'macd': return macd(close, p.fast, p.slow, p.signal);
    default: return {};
  }
}

export function paramText(ind) {
  return Object.values(ind.params).join(' ');
}
