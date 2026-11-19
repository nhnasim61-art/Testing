import './styles/site.css';
import './styles/pages.css';
import { initShell } from './site.js';

initShell({ theme: 'dark', active: 'brokers' });

// Fictional brokers (placeholder names and marks).
const BROKERS = [
  ['Orbitex', 'PLATINUM', 'Crypto', 4.4, 'Very Good', '22.6K', '279.5K', 'Unlock a free Pro month', ['#111', '#fff', '◇'], true, true],
  ['nimbly', 'GOLD', 'Stocks, ETFs, Options', 4.6, 'Excellent', '4.5K', '113.1K', '8.1% APY + free premium plan', ['#ff6b00', '#fff', '▲'], true],
  ['Ondra FX', 'PLATINUM', 'Forex', 4.5, 'Great', '35.2K', '356K', 'Free charting plan', ['#0b2a5a', '#fff', '✓'], true, false, 'BEST 2025'],
  ['NorthTrader', 'PLATINUM', 'Futures', 4.5, 'Great', '2.8K', '65.5K', 'Get $250', ['#1a1a1a', '#ff4b1f', 'N'], false],
  ['FXcorner', 'PLATINUM', 'Forex', 4.5, 'Great', '14.5K', '196K', 'Earn up to 10% APY', ['#3f8f50', '#fff', 'Ø'], true],
  ['Tradeloft', 'GOLD', 'Futures', 4.4, 'Very Good', '11.3K', '143.3K', '', ['#2a7bff', '#fff', '▼'], false],
  ['Amplio Futures', 'PLATINUM', 'Futures', 4.4, 'Very Good', '10.2K', '44.5K', '', ['#5b9bd5', '#fff', 'Y'], false],
  ['Stationary', 'PLATINUM', 'Stocks, Options, Futures', 4.3, 'Very Good', '9.8K', '88.4K', '', ['#f2f2f2', '#111', 'S'], true, false, 'BEST 2025'],
  ['Pepperleaf', 'GOLD', 'Forex, CFDs', 4.3, 'Very Good', '8.1K', '61.2K', '', ['#c7d2fe', '#111', 'P'], true],
  ['Intercross', 'PLATINUM', 'Stocks, Crypto, Forex, Futures, Bonds, Options', 4.1, 'Above Average', '40.1K', '408.1K', '', ['#d0021b', '#fff', 'K'], false],
  ['Coinbay Advanced', 'GOLD', 'Crypto, Futures', 4.1, 'Above Average', '4.1K', '93.6K', '', ['#0a2a6c', '#3b82f6', 'C'], false],
  ['tastybite', 'SILVER', 'Stocks, Futures, Options', 4.0, 'Above Average', '1.2K', '24.1K', '', ['#eee', '#111', 'tb'], false],
  ['EdgeLine', 'SILVER', 'Futures', 4.0, 'Above Average', '155', '462', '', ['#1a1a1a', '#fff', 'eL'], true],
  ['Capitalia', 'GOLD', 'Stocks, ETFs', 3.9, 'Above Average', '3.4K', '51.9K', '', ['#6d28d9', '#fff', 'C'], true],
  ['BlueHarbor', 'SILVER', 'Forex, Crypto', 3.9, 'Above Average', '2.2K', '18.7K', '', ['#0ea5e9', '#fff', 'B'], false],
  ['Kestrel Markets', 'SILVER', 'Stocks, Futures', 3.8, 'Average', '980', '9.1K', '', ['#16a34a', '#fff', 'K'], false],
];
// a longer tail of smaller fictional brokers
const TAIL = ['Fernway', 'Quayside Trading', 'Mintleaf', 'Granite Peak', 'Lattice Markets', 'Copperline', 'Bluefin Securities', 'Halcyon FX', 'Summit Route', 'Pinecrest', 'Ironbark', 'Wavecrest', 'Larkspur', 'Tidewater', 'Redwood Lane', 'Sablestone'];
const ASSETS = ['Stocks, ETFs', 'Forex', 'Crypto', 'Futures', 'Stocks, Options', 'Forex, CFDs', 'Crypto, Futures', 'Stocks, ETFs, Bonds'];
const COLORS = [['#0f766e', '#fff'], ['#1d4ed8', '#fff'], ['#f59e0b', '#111'], ['#be123c', '#fff'], ['#e5e7eb', '#111'], ['#4c1d95', '#fff'], ['#065f46', '#fff'], ['#0c4a6e', '#fff']];
TAIL.forEach((n, i) => BROKERS.push([n, i % 3 === 0 ? 'GOLD' : 'SILVER', ASSETS[i % ASSETS.length], +(3.8 - i * 0.03).toFixed(1), i < 6 ? 'Average' : 'Fair', (900 - i * 40) + '', (8.2 - i * 0.4).toFixed(1) + 'K', '', [COLORS[i % 8][0], COLORS[i % 8][1], n[0]], i % 2 === 0]));
const stars = (r) => '★★★★★'.split('').map((s, i) => `<i class="${i < Math.floor(r) ? 'f' : i < r ? 'h' : ''}">★</i>`).join('');
const ext = `<svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.4" d="M8 4H4v10h10v-4M10 3h5v5M15 3l-7 7"/></svg>`;

function card(b, i) {
  const [name, tier, assets, rating, label, reviews, accounts, promo, [bg, fg, mark], open, featured, award] = b;
  return `<article class="bk-card ${featured ? 'featured' : ''}" data-assets="${assets}">
    <div class="bk-l">
      <h2 class="bk-name">${name}<span class="bk-tier ${tier.toLowerCase()}">${tier}</span>${award ? `<span class="bk-award">${award}</span>` : ''}</h2>
      <p class="bk-assets">Tradable assets: ${assets}</p>
      <div class="bk-rate"><div><b>${rating.toFixed(1)} • ${label} <span class="ok">✓</span></b><span class="stars">${stars(rating)}</span></div>
        <div class="bk-stat"><b>💬 ${reviews}</b><span>Reviews</span></div><div class="bk-stat"><b>👤 ${accounts}</b><span>Accounts</span></div></div>
      ${promo ? `<p class="bk-promo">${promo}</p><p class="bk-pl">Promotion</p>` : ''}
      <div class="bk-btns">${open ? `<a class="bk-open" href="/chart/">Open account ${ext}</a>` : ''}<a class="bk-more" href="/chart/">Learn more</a></div>
    </div>
    <div class="bk-art" aria-hidden="true"><i style="background:${bg}"></i><i style="background:${bg}"></i><span style="background:${bg};color:${fg}">${mark}</span></div>
    ${featured ? '<span class="bk-feat">FEATURED</span>' : ''}
  </article>`;
}

const FILTERS = ['All brokers', 'Stocks', 'Crypto', 'Forex', 'Futures', 'ETFs', 'Options'];
document.getElementById('content').innerHTML = `
<div class="bk-page">
  <section class="bk-hero">
    <i class="bk-horizon" aria-hidden="true"></i>
    <h1><span>Made to trade</span></h1>
    <div class="bk-count" aria-label="Trades placed">${'451,389,513'.split('').map((c) => (c === ',' ? '<em>,</em>' : `<span>${c}</span>`)).join('')}</div>
    <p class="bk-sub">Trades placed through connected brokers</p>
    <div class="bk-filters"><button class="bk-sort">Best rated <svg viewBox="0 0 18 18" width="18" height="18"><path fill="none" stroke="currentColor" stroke-width="1.4" d="M5 7.5 9 11.5 13 7.5"/></svg></button><i class="bk-div"></i>
      <span class="bk-chips">${FILTERS.map((f, i) => `<button class="${i === 0 ? 'on' : ''}">${f}</button>`).join('')}</span>
      <button class="bk-all">All brokers <svg viewBox="0 0 18 18" width="18" height="18"><path fill="none" stroke="currentColor" stroke-width="1.4" d="M5 7.5 9 11.5 13 7.5"/></svg></button></div>
  </section>
  <div class="bk-list"></div>
</div>`;

let filter = 'All brokers';
let sortBy = 'rating';
function render() {
  let list = BROKERS.filter((b) => filter === 'All brokers' || b[2].includes(filter.replace(/s$/, '')));
  if (sortBy === 'accounts') list = [...list].sort((a, b) => parseFloat(b[6]) * (b[6].includes('K') ? 1000 : 1) - parseFloat(a[6]) * (a[6].includes('K') ? 1000 : 1));
  document.querySelector('.bk-list').innerHTML = list.map(card).join('') || '<p class="bk-none">No brokers for this market yet.</p>';
}
render();
document.querySelector('.bk-chips').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  filter = b.textContent;
  document.querySelectorAll('.bk-chips button').forEach((x) => x.classList.toggle('on', x === b));
  render();
});
document.querySelector('.bk-sort').addEventListener('click', (e) => {
  sortBy = sortBy === 'rating' ? 'accounts' : 'rating';
  e.currentTarget.firstChild.textContent = sortBy === 'rating' ? 'Best rated ' : 'Most accounts ';
  render();
});
document.querySelector('.bk-all').addEventListener('click', () => {
  const i = FILTERS.indexOf(filter);
  const next = FILTERS[(i + 1) % FILTERS.length];
  document.querySelectorAll('.bk-chips button')[(i + 1) % FILTERS.length].click();
  document.querySelector('.bk-all').firstChild.textContent = next + ' ';
});
