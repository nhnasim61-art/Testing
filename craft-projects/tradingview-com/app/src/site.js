// Shared site shell: header, phone menu, symbol search and footer.
import { SYMBOLS, logoHTML, fmt, fmtPct, chgClass } from './data.js';

export const BRAND = 'Tickerra';

export const ICONS = {
  mark: `<svg class="brand-mark" viewBox="0 0 36 28" width="36" height="28" aria-hidden="true"><rect x="1" y="12" width="8" height="15" rx="2" fill="currentColor"/><rect x="12" y="5" width="8" height="22" rx="2" fill="currentColor"/><path d="M23 27 L35 1 L35 27 Z" fill="currentColor"/></svg>`,
  search: `<svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" d="M12.5 5.5a7 7 0 1 1 0 14 7 7 0 0 1 0-14ZM17.5 17.5l5 5"/></svg>`,
  globe: `<svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="14" cy="14" r="9.5"/><ellipse cx="14" cy="14" rx="4.2" ry="9.5"/><path d="M4.5 14h19M6 9h16M6 19h16"/></g></svg>`,
  user: `<svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="14" cy="9.5" r="4.5"/><path d="M5.5 23.5c0-4 3-6.5 6.5-6.5h4c3.5 0 6.5 2.5 6.5 6.5Z"/></g></svg>`,
  burger: `<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><path stroke="currentColor" stroke-width="2" d="M0 3.5h18M0 9h18M0 14.5h18"/></svg>`,
  close: `<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><path stroke="currentColor" stroke-width="1.6" d="M2 2l14 14M16 2L2 16"/></svg>`,
  chev: `<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.5" d="M7 4.5 11.5 9 7 13.5"/></svg>`,
  login: `<svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 6h9v16h-9"/><path d="M3 14h12M11 10l4 4-4 4"/></g></svg>`,
};

const NAV = [
  { label: 'Products', href: '/chart/', key: 'chart', icon: 'M14 3 4 9l10 16 10-16Zm0 5v9' },
  { label: 'Community', href: '/ideas/', key: 'ideas', icon: 'M10 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 23c0-4 3.5-7 8-7s8 3 8 7Zm16-6c3 0 6 2 6 6h-4' },
  { label: 'Markets', href: '/markets/', key: 'markets', icon: 'M14 4a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 0c-3 3-3 17 0 20m0-20c3 3 3 17 0 20M4 14h20' },
  { label: 'Brokers', href: '/brokers/', key: 'brokers', icon: 'M14 4l3 6 6 .8-4.5 4.2 1.2 6.5L14 18l-5.7 3.5 1.2-6.5L5 10.8l6-.8Z' },
  { label: 'More', href: '/markets/', key: 'more', icon: 'M5 14h.1M14 14h.1M23 14h.1' },
];

function logo(withWord = true) {
  return `<a class="brand" href="/" aria-label="${BRAND} main page">${ICONS.mark}${withWord ? `<span class="brand-word">${BRAND}</span>` : ''}</a>`;
}

export function renderHeader({ theme = 'light', active = '', home = false } = {}) {
  const host = document.getElementById('site-header');
  if (!host) return;
  host.className = 'site-header ' + theme + (home ? ' home-hdr' : '');
  host.innerHTML = `
    <button class="hdr-burger" aria-label="Open menu" aria-expanded="false">${ICONS.burger}</button>
    <span class="hdr-logo-full">${logo(true)}</span>
    <span class="hdr-logo-mark">${logo(false)}</span>
    <button class="hdr-search" type="button" aria-label="Search">${ICONS.search}<span class="t-wide">Search (Ctrl+K)</span><span class="t-short">Search</span></button>
    <nav class="hdr-nav" aria-label="Main"><ul>
      ${NAV.map((n) => `<li><a href="${n.href}" class="${active === n.key ? 'active' : ''}">${n.label}</a></li>`).join('')}
    </ul></nav>
    <div class="hdr-right">
      <button class="hdr-lang" type="button">${ICONS.globe}<span>EN</span></button>
      <button class="hdr-user" type="button" aria-label="Open user menu">${ICONS.user}</button>
      <a class="btn-start" href="/chart/">Get started</a>
      <button class="hdr-search-icon" type="button" aria-label="Search">${ICONS.search}</button>
    </div>`;

  // phone/tablet menu
  const menu = document.createElement('div');
  menu.className = 'mobile-menu';
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-modal', 'true');
  menu.setAttribute('aria-label', 'Menu');
  menu.hidden = true;
  menu.innerHTML = `
    <div class="mm-top"><button class="mm-close" aria-label="Close menu">${ICONS.close}</button></div>
    <ul class="mm-list">
      ${NAV.map((n) => `<li><a href="${n.href}"><svg viewBox="0 0 28 28" width="28" height="28"><path d="${n.icon}" fill="${n.key === 'more' ? 'none' : 'currentColor'}" stroke="currentColor" stroke-width="${n.key === 'more' ? 5 : 1}" stroke-linecap="round"/></svg><span>${n.label}</span>${ICONS.chev}</a></li>`).join('')}
    </ul>
    <div class="mm-sep"></div>
    <div class="mm-row"><span>Dark theme</span><button class="mm-toggle" role="switch" aria-checked="false" aria-label="Dark theme"><i></i></button></div>
    <div class="mm-row"><span>Language</span><span class="mm-val">English ${ICONS.chev}</span></div>
    <div class="mm-sep"></div>
    <a class="mm-login" href="/chart/">${ICONS.login}<span>Log in</span></a>`;
  document.body.appendChild(menu);
  const burger = host.querySelector('.hdr-burger');
  const open = () => { menu.hidden = false; burger.setAttribute('aria-expanded', 'true'); document.body.classList.add('no-scroll'); };
  const close = () => { menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); document.body.classList.remove('no-scroll'); };
  burger.addEventListener('click', open);
  menu.querySelector('.mm-close').addEventListener('click', close);
  const tg = menu.querySelector('.mm-toggle');
  tg.addEventListener('click', () => tg.setAttribute('aria-checked', tg.getAttribute('aria-checked') === 'true' ? 'false' : 'true'));

  host.querySelectorAll('.hdr-search, .hdr-search-icon').forEach((b) => b.addEventListener('click', () => openSearch()));
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape') close();
  });
}

let searchEl = null;
export function openSearch(onPick) {
  if (!searchEl) {
    searchEl = document.createElement('div');
    searchEl.className = 'site-search';
    searchEl.innerHTML = `<div class="ss-box" role="dialog" aria-label="Symbol search">
      <div class="ss-head">${ICONS.search}<input type="text" placeholder="Search markets here" aria-label="Search markets"><button class="ss-x" aria-label="Close">${ICONS.close}</button></div>
      <ul class="ss-list"></ul></div>`;
    document.body.appendChild(searchEl);
    const input = searchEl.querySelector('input');
    const list = searchEl.querySelector('.ss-list');
    const draw = () => {
      const q = input.value.trim().toLowerCase();
      const res = SYMBOLS.filter((s) => !q || s.s.toLowerCase().includes(q) || s.n.toLowerCase().includes(q)).slice(0, 30);
      list.innerHTML = res.length ? res.map((s) => `<li><a href="/chart/?symbol=${encodeURIComponent(s.s)}" data-s="${s.s}">${logoHTML(s, 24)}<b>${s.s}</b><span class="ss-n">${s.n}</span><span class="ss-ex">${s.type} · ${s.ex}</span><span class="ss-p ${chgClass(s.c)}">${fmt(s.p)} <small>${fmtPct(s.c)}</small></span></a></li>`).join('') : '<li class="ss-empty">No symbols match your criteria</li>';
    };
    input.addEventListener('input', draw);
    searchEl.addEventListener('click', (e) => {
      if (e.target === searchEl || e.target.closest('.ss-x')) searchEl.hidden = true;
      const a = e.target.closest('a[data-s]');
      if (a && searchEl._onPick) { e.preventDefault(); searchEl._onPick(a.dataset.s); searchEl.hidden = true; }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') searchEl.hidden = true;
      if (e.key === 'Enter') { const a = list.querySelector('a'); if (a) a.click(); }
    });
    searchEl._draw = draw;
  }
  searchEl._onPick = onPick || null;
  searchEl.hidden = false;
  const input = searchEl.querySelector('input');
  input.value = '';
  searchEl._draw();
  input.focus();
  setTimeout(() => input.focus(), 0);
}

export function renderFooter() {
  const host = document.getElementById('site-footer');
  if (!host) return;
  const cols = [
    [['More than a product', ['Supercharts', '']], ['Screeners', ['Stocks', 'ETFs', 'Bonds', 'Crypto coins', 'CEX pairs', 'DEX pairs', 'Scripts']], ['Heatmaps', ['Stocks', 'ETFs', 'Crypto coins']], ['Calendars', ['Economic', 'Earnings', 'Dividends', 'IPOs']], ['More products', ['News Flow', 'Portfolios', 'Yield Curves', 'Options', 'Macro Maps', 'Scripting', 'Data Server']], ['Apps', ['Mobile', 'Desktop']]],
    [['Tools & subscriptions', ['Features', 'Pricing', 'Market data', 'Gift plans']], ['Trading', ['Overview', 'Brokers', 'Brokers comparison', 'The Basics']], ['Special offers', ['Futures bundle', 'Options bundle', 'US stocks bundle']], ['About company', ['Who we are', 'Our mission', 'Blog', 'Help Center', 'Careers', 'Media kit']], ['Merch', ['Desk calendars', 'Stickers']], ['Policies & security', ['Terms of Use', 'Disclaimer', 'Privacy Policy', 'Cookies Policy', 'Accessibility Statement', 'Security tips', 'Bug Bounty program', 'Status page']]],
    [['Community', ['Social network', 'Wall of Love', 'Refer a friend', 'Creator program', 'House Rules', 'Moderators']], ['Ideas', ['Trading', 'Education', "Editors' picks"]], ['Scripts', ['Indicators & strategies', 'Wizards', 'Freelancers', 'Marketplace']]],
    [['Business solutions', ['Widgets', 'Charting libraries', 'Light charts', 'Advanced charts', 'Trading platform']], ['Growth opportunities', ['Advertising', 'Brokerage integration', 'Partner program', 'Education program']]],
  ];
  host.className = 'site-footer';
  host.innerHTML = `<div class="ft-inner">
    <div class="ft-brand">
      <div class="ft-logo">${logo(true)}<span class="ft-badge">Made by people</span></div>
      <div class="ft-social">${['X', 'f', '▶', '◎', 'in', '✈', '♪', '◉'].map((s) => `<a href="/" aria-label="Social link">${s}</a>`).join('')}</div>
      <button class="ft-lang">${ICONS.globe}English <span>⌄</span></button>
      <p>All market data on this site is simulated for demonstration purposes.</p>
      <p>Reference data is randomly generated and does not reflect real prices.</p>
      <p>© 2026 ${BRAND}. Prices, charts and ideas are sample content.</p>
      <p>No information here is investment advice.</p>
      <p>© 2026 ${BRAND}, Inc.</p>
    </div>
    <div class="ft-cols">${cols.map((c) => `<div class="ft-col">${c.map(([h, items]) => `<div class="ft-grp"><h4>${h}</h4><ul>${items.filter(Boolean).map((i) => `<li><a href="/markets/">${i}</a></li>`).join('')}</ul></div>`).join('')}</div>`).join('')}</div>
  </div>
  <div class="ft-slogan" aria-hidden="true">SEE IT FIRST / THEN TRADE.</div>`;
}

// Draw a little line chart into every <canvas data-spark> on the page.
export function drawSparks(root = document) {
  root.querySelectorAll('canvas[data-spark]').forEach((cv) => {
    const vals = JSON.parse(cv.dataset.spark);
    const color = cv.dataset.color || '#2962ff';
    const fill = cv.dataset.fill !== 'no';
    const w = cv.clientWidth || cv.width, h = cv.clientHeight || cv.height;
    const dpr = window.devicePixelRatio || 1;
    cv.width = w * dpr; cv.height = h * dpr;
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);
    const min = Math.min(...vals), max = Math.max(...vals);
    const pad = 4;
    const x = (i) => (i / (vals.length - 1)) * w;
    const y = (v) => pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2);
    ctx.beginPath();
    vals.forEach((v, i) => (i ? ctx.lineTo(x(i), y(v)) : ctx.moveTo(x(i), y(v))));
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
    if (fill) {
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, color + '40'); g.addColorStop(1, color + '00');
      ctx.fillStyle = g; ctx.fill();
    }
  });
}

// Draw sample "idea" chart thumbnails (candles and a few drawings).
export function drawThumbs(root = document) {
  import('./data.js').then(({ rng }) => {
    root.querySelectorAll('[data-thumb]').forEach((el) => {
      if (el.dataset.done) return;
      const cv = el.tagName === 'CANVAS' ? el : document.createElement('canvas');
      const bw = el.clientWidth || 416, bh = el.clientHeight || 234;
      const seed = el.dataset.thumb;
      const r = rng(seed);
      const dark = el.dataset.dark === '1';
      const w = bw, h = bh;
      const dpr = window.devicePixelRatio || 1;
      cv.width = w * dpr; cv.height = h * dpr;
      const ctx = cv.getContext('2d');
      ctx.scale(dpr, dpr);
      const tints = ['#ffffff', '#fdf6e8', '#eef7f6', '#f6eefc', '#eef3ff'];
      ctx.fillStyle = dark ? (r() > 0.5 ? '#0f0f0f' : '#131722') : tints[Math.floor(r() * tints.length)];
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = dark ? '#ffffff12' : '#00000010';
      for (let gx = 0; gx < w; gx += 46) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
      for (let gy = 0; gy < h; gy += 32) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }
      const n = 70 + Math.floor(r() * 40);
      const cw = (w - 40) / n;
      let p = 100, vals = [];
      const trend = (r() - 0.5) * 0.012;
      for (let i = 0; i < n; i++) { const o = p; p = p * (1 + (r() - 0.5) * 0.05 + trend); vals.push([o, p, Math.max(o, p) * (1 + r() * 0.015), Math.min(o, p) * (1 - r() * 0.015)]); }
      const mn = Math.min(...vals.map((v) => v[3])), mx = Math.max(...vals.map((v) => v[2]));
      const Y = (v) => 14 + (1 - (v - mn) / (mx - mn)) * (h - 40);
      if (r() > 0.4) {
        ctx.fillStyle = r() > 0.5 ? '#f2364520' : '#2962ff22';
        const y1 = Y(mn + (mx - mn) * (0.3 + r() * 0.4));
        ctx.fillRect(w * 0.15, y1, w * 0.6, 18 + r() * 30);
      }
      vals.forEach(([o, c, hi, lo], i) => {
        const x = 4 + i * cw + cw / 2;
        const col = c >= o ? '#089981' : '#f23645';
        ctx.strokeStyle = col; ctx.fillStyle = col;
        ctx.beginPath(); ctx.moveTo(x, Y(hi)); ctx.lineTo(x, Y(lo)); ctx.stroke();
        ctx.fillRect(x - cw * 0.35, Math.min(Y(o), Y(c)), Math.max(1, cw * 0.7), Math.max(1, Math.abs(Y(o) - Y(c))));
      });
      ctx.strokeStyle = r() > 0.5 ? '#2962ff' : '#ff9800'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(w * 0.1, Y(vals[5][1])); ctx.lineTo(w * 0.85, Y(vals[n - 10][1])); ctx.stroke();
      ctx.lineWidth = 1;
      ctx.fillStyle = dark ? '#ffffff55' : '#00000055'; ctx.font = '7px sans-serif';
      for (let gy = 20; gy < h - 20; gy += 22) ctx.fillText((mx - ((gy - 14) / (h - 40)) * (mx - mn)).toFixed(2), w - 32, gy);
      if (el !== cv) { el.src = cv.toDataURL('image/png'); el.dataset.done = '1'; }
    });
  });
}

export function initShell(opts) {
  renderHeader(opts);
  renderFooter();
}
