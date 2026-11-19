// Reusable content blocks for the home and markets pages.
import { BY_SYMBOL, logoHTML, fmt, fmtPct, series, rng } from './data.js';

export const CHEV = `<svg class="chev" viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M7 4.5 11.5 9 7 13.5"/></svg>`;
export const MOON = `<svg class="moon" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path fill="#2962ff" d="M7.5 1A5 5 0 1 0 11 9.3 4.5 4.5 0 0 1 7.5 1z"/></svg>`;
const COMMENT = `<svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.4" d="M6 7h16v11H12l-5 4v-4H6z M10 11h8M10 14h6"/></svg>`;
const BOOST = `<svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.4" d="M17 5c3 0 6 1 6 1s0 3-1 6l-6 6-4-4 6-6M11 14l-4-1-2 2 4 2M14 17l1 4 2-2-2-4M8 19l-3 3M7 17l-2 2M10 21l-2 2"/></svg>`;

export const chev = (href, text, cls = '') => `<a class="sec-link ${cls}" href="${href}">${text}${CHEV}</a>`;

export function h2(text, href = '/markets/', icon = '') {
  return `<h2 class="sec-h2">${chev(href, icon + `<span>${text}</span>`)}</h2>`;
}
export function h3(text, href = '/markets/', noChev) {
  return `<h3 class="sec-h3">${noChev ? text : chev(href, `<span>${text}</span>`)}</h3>`;
}

export function tick(sym) { return `<span class="tick">${sym}</span>`; }
export function D() { return `<sup class="dmark">D</sup>`; }
export function q(sym) {
  const s = BY_SYMBOL[sym];
  return { s, price: s.p, chg: s.c };
}
export function price(v, cur, d) {
  return `<span class="px">${fmt(v, d)}<small>${cur === 'POINT' ? 'POINT' : cur || ''}</small></span>`;
}
export function pct(v) { return `<span class="pct ${v >= 0 ? 'up' : 'down'}">${fmtPct(v)}</span>`; }
export function pill(v) { return `<span class="pill ${v >= 0 ? 'up' : 'down'}">${fmtPct(v)}</span>`; }

// generic entity: {s,n,p,c,cur,logo,bg,fg}
export function ent(s, n, p, c, extra = {}) {
  const base = BY_SYMBOL[s] || {};
  return { s, n, p, c, cur: 'USD', ...base, ...extra, ...(n ? { n } : {}), ...(p != null ? { p } : {}), ...(c != null ? { c } : {}) };
}

// "Major indices" style rows: logo, name + ticker, price over change.
export function quoteRows(list, opts = {}) {
  return `<ul class="qrows ${opts.cls || ''}">${list.map((e) => `<li><a href="/chart/?symbol=${encodeURIComponent(e.s)}">
    ${logoHTML(e, opts.logo || 36)}
    <span class="qr-l"><span class="qr-n">${e.n}${opts.d !== false ? D() : ''}${opts.moon ? MOON : ''}</span>${tick(e.tk || e.s)}</span>
    <span class="qr-r"><span class="qr-p">${price(e.p, e.cur)}${e.unit ? `<small class="unit">/ ${e.unit}</small>` : ''}</span>${pct(e.c)}</span></a></li>`).join('')}</ul>`;
}

// Big list with pill changes (gainers / losers / crypto movers).
export function moverTable(list) {
  return `<ul class="movers">${list.map((e) => `<li><a href="/chart/?symbol=${encodeURIComponent(e.s)}">
    ${logoHTML(e, 28)}<span class="mv-l"><span class="mv-n">${e.n}${MOON}</span>${tick(e.tk || e.s)}</span>
    <span class="mv-p">${price(e.p, e.cur || 'USD')}</span>${pill(e.c)}</a></li>`).join('')}</ul>`;
}

// Two sub-column compact list (highest volume, most volatile, futures).
export function compactGrid(list, opts = {}) {
  return `<div class="cgrid"><ul>${list.map((e) => `<li><a href="/chart/?symbol=${encodeURIComponent(e.s)}">
    ${logoHTML(e, 28)}<span class="cg-l"><span class="cg-n"><span>${e.n}</span>${opts.d ? D() : MOON}</span>${tick(e.tk || e.s)}</span>
    <span class="cg-r">${price(e.p, e.cur || 'USD')}${pct(e.c)}</span></a></li>`).join('')}</ul></div>`;
}

export function trendCards(list) {
  return `<div class="hscroll"><div class="tcards">${list.map((e) => `<a class="tcard" href="/chart/?symbol=${encodeURIComponent(e.s)}">
    <span class="tc-top">${logoHTML(e, 32)}<span class="tc-l"><span class="tc-s">${e.tk || e.s}${MOON}</span><span class="tc-n">${e.n}</span></span></span>
    <span class="tc-p">${price(e.p, e.cur || 'USD')}</span>${pct(e.c)}</a>`).join('')}</div></div>`;
}

const AUTHORS = ['ChartMaven', 'NorthStarTA', 'quietpips', 'Waveform_Lab', 'AtlasTrades', 'LunaCharts', 'SignalHarbor', 'ridge_runner', 'TrendForge', 'MacroMoth', 'pivotpilot', 'DeltaDune'];
const AGO = ['12 hours ago', 'Nov 18', 'Updated 13 hours ago', 'Nov 18', '11 hours ago', 'Updated 5 hours ago', 'Nov 17', '3 hours ago'];

export function ideaCards(list, opts = {}) {
  return `<div class="hscroll"><div class="ideas ${opts.grid ? 'grid' : ''}">${list.map((it, k) => {
    const r = rng(it.t);
    const a = AUTHORS[Math.floor(r() * AUTHORS.length)];
    const c = 2 + Math.floor(r() * 50), b = 8 + Math.floor(r() * 500);
    return `<article class="idea">
      <a class="idea-img" href="/chart/?symbol=${encodeURIComponent(it.s || 'AAPL')}"><img data-thumb="${it.t}" data-dark="${it.dark ? 1 : 0}" alt="Chart preview for ${it.t.replace(/"/g, "")}" width="416" height="234">${opts.badge ? `<span class="idea-badge">${opts.badge}</span>` : ''}${it.dir ? `<span class="idea-dir ${it.dir}">${it.dir === 'up' ? '↗' : '↘'}</span>` : ''}</a>
      <a class="idea-t" href="/chart/?symbol=${encodeURIComponent(it.s || 'AAPL')}">${it.t}</a>
      <p class="idea-d">${it.d}</p>
      <div class="idea-meta"><span class="idea-by"><span>by ${a}</span>${opts.noTime ? '' : `<span class="idea-ago">${AGO[k % AGO.length]}</span>`}</span>
      <span class="idea-c">${COMMENT}${c}</span><button class="idea-b" type="button">${BOOST}${b >= 1000 ? (b / 1000).toFixed(1) + ' K' : b}</button></div>
    </article>`;
  }).join('')}</div></div>`;
}

export function tabs(names, active = 0) {
  return `<div class="tabs" role="tablist">${names.map((n, i) => `<button role="tab" aria-selected="${i === active}" class="${i === active ? 'on' : ''}">${n}</button>`).join('')}</div>`;
}

export function newsError() {
  return `<div class="news-err"><svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><g fill="none" stroke="#000" stroke-width="1.4"><rect x="4" y="3" width="32" height="34" rx="2"/><path d="M10 10h8M10 16h8M10 22h20M10 28h20M23 9l5 5M28 9l-5 5"/></g></svg>
    <div><b>News is taking a break</b><span>The sample feed is empty right now. Try again in a moment.</span></div>
    <button class="btn-reload" type="button">↻ Reload</button></div>${chev('/ideas/', 'Keep reading', 'blue')}`;
}

export function calendar(rows, cols) {
  return `<div class="cal"><div class="cal-h"><span>Symbol</span>${cols.map((c) => `<span>${c}</span>`).join('')}</div>
    <ul>${rows.map((r) => `<li><span class="cal-date"><i>Nov</i><b>19</b></span>${logoHTML(r.e, 28)}<span class="mv-l"><span class="mv-n">${r.e.n}<span class="sun">☀</span></span>${tick(r.e.tk || r.e.s)}</span>${r.v.map((v) => `<span class="cal-v">${v}</span>`).join('')}</li>`).join('')}</ul></div>`;
}

export function sparkCanvas(seed, n, start, vol, trend, color, cls = 'spark') {
  const vals = series(seed, n, start, vol, trend).map((v) => +v.toFixed(4));
  return `<canvas class="${cls}" data-spark='${JSON.stringify(vals)}' data-color="${color}"></canvas>`;
}

export function initTabs(root = document) {
  root.querySelectorAll('.tabs').forEach((t) => t.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    t.querySelectorAll('button').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
    const list = t.nextElementSibling;
    if (list) {
      // reshuffle the following list to show the tab switched
      const ul = list.querySelector('ul, .ideas');
      if (ul) [...ul.children].reverse().forEach((c) => ul.appendChild(c));
    }
  }));
  root.querySelectorAll('.btn-reload').forEach((b) => b.addEventListener('click', () => { b.textContent = '↻ Loading…'; setTimeout(() => (b.textContent = '↻ Reload'), 900); }));
}
