import './styles/site.css';
import './styles/content.css';
import './styles/pages.css';
import { initShell, drawThumbs } from './site.js';
import { ideaCards } from './components.js';
import { IDEAS } from './ideas-data.js';

initShell({ theme: 'light', active: 'ideas' });

const PAGE = 24;
let page = 1;
let view = 'popular';
let videosOnly = false;

function list() {
  let all = [...IDEAS];
  if (view === 'editors') all = all.filter((_, i) => i % 3 !== 1).concat(all.filter((_, i) => i % 3 === 1));
  else all = all.slice(18).concat(all.slice(0, 18));
  if (videosOnly) all = all.filter((_, i) => i % 4 === 0);
  const start = ((page - 1) * PAGE) % all.length;
  const out = [];
  for (let i = 0; i < Math.min(PAGE, all.length); i++) out.push(all[(start + i) % all.length]);
  return out;
}

document.getElementById('content').innerHTML = `
<div class="ideas-page">
  <header class="ip-head">
    <h1>Community ideas</h1>
    <nav class="ip-tabs" aria-label="Idea feeds"><button class="on" data-v="popular">Popular</button><button data-v="editors">Editors' picks</button></nav>
  </header>
  <div class="ip-filters">
    <button class="ip-f" data-f="type">All ideas <svg viewBox="0 0 18 18" width="18" height="18"><path fill="none" stroke="currentColor" stroke-width="1.4" d="M5 7.5 9 11.5 13 7.5"/></svg></button>
    <button class="ip-f" data-f="video" aria-pressed="false"><svg viewBox="0 0 28 28" width="28" height="28"><circle cx="14" cy="14" r="8" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M12 10.5v7l5.5-3.5z" fill="currentColor"/></svg>Videos only</button>
    <span class="ip-seg"><button class="on" title="Most recent">◷</button><button title="Most boosted">↻</button></span>
  </div>
  <div class="ip-grid"></div>
  <button class="ip-more">Show more publications</button>
  <nav class="ip-pages" aria-label="Pages"></nav>
</div>`;

function render() {
  document.querySelector('.ip-grid').innerHTML = ideaCards(list(), { grid: true });
  drawThumbs(document.querySelector('.ip-grid'));
  const pages = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  document.querySelector('.ip-pages').innerHTML = `<button data-p="prev" ${page === 1 ? 'disabled' : ''} aria-label="Previous page">←</button>${pages.map((p) => `<button data-p="${p}" class="${p === page ? 'on' : ''}">${p}</button>`).join('')}<span>…</span><button data-p="42">42</button><button data-p="next" aria-label="Next page">→</button>`;
}
render();

document.querySelector('.ip-tabs').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  view = b.dataset.v; page = 1;
  document.querySelectorAll('.ip-tabs button').forEach((x) => x.classList.toggle('on', x === b));
  render();
});
document.querySelector('.ip-filters').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.f === 'video') { videosOnly = !videosOnly; b.setAttribute('aria-pressed', videosOnly); b.classList.toggle('on', videosOnly); render(); }
  if (b.closest('.ip-seg')) { document.querySelectorAll('.ip-seg button').forEach((x) => x.classList.toggle('on', x === b)); page = 1; view = view === 'popular' ? 'editors' : 'popular'; render(); }
});
document.querySelector('.ip-pages').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  const v = b.dataset.p;
  page = v === 'prev' ? Math.max(1, page - 1) : v === 'next' ? page + 1 : Number(v);
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
document.querySelector('.ip-more').addEventListener('click', () => {
  const grid = document.querySelector('.ip-grid .ideas');
  page++;
  const tmp = document.createElement('div');
  tmp.innerHTML = ideaCards(list(), { grid: true });
  tmp.querySelectorAll('.idea').forEach((n) => grid.appendChild(n));
  drawThumbs(grid);
});
