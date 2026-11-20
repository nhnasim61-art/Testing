import '../style.css';
import { GENRES, SHOWS } from '../data.js';
import { browseUrl, esc, grid, icon, page, params } from '../ui.js';

const norm = (t) => t.toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]/g, '');

function score(show, q) {
  const title = norm(show.title);
  if (title.startsWith(q)) return 100;
  if (title.split(' ').some((w) => w.startsWith(q))) return 80;
  if (title.includes(q)) return 60;
  if (show.genres.some((g) => norm(g).startsWith(q))) return 40;
  if (norm(show.studio).includes(q)) return 30;
  if (q.length > 3 && norm(show.blurb).includes(q)) return 10;
  return 0;
}

page('search', (main) => {
  main.innerHTML = `
    <div class="search-band">
      <div class="container search-inner">
        <label class="search-field">
          <span class="sr-only">Search</span>
          ${icon.search}
          <input id="q" type="search" placeholder="Search titles, genres or studios" autocomplete="off" enterkeyhint="search">
          <button class="icon-btn search-clear" aria-label="Clear search" hidden>${icon.close}</button>
        </label>
      </div>
    </div>
    <div class="container" id="out"></div>`;

  const input = main.querySelector('#q');
  const clear = main.querySelector('.search-clear');
  const out = main.querySelector('#out');
  input.value = params().get('q') || '';

  const render = () => {
    const raw = input.value.trim();
    const q = norm(raw);
    clear.hidden = !raw;
    history.replaceState(null, '', `${location.pathname}${raw ? `?q=${encodeURIComponent(raw)}` : ''}`);
    if (!q) {
      out.innerHTML = `
        <h2 class="section-title">Browse by genre</h2>
        <div class="chips chips--wrap">${GENRES.map((g) => `<a class="chip" href="${browseUrl(g)}">${g}</a>`).join('')}</div>
        <h2 class="section-title">Popular right now</h2>
        ${grid([...SHOWS].sort((a, b) => b.popularity - a.popularity).slice(0, 12))}`;
      return;
    }
    const hits = SHOWS.map((show) => [show, score(show, q)]).filter(([, n]) => n > 0)
      .sort((a, b) => b[1] - a[1] || b[0].popularity - a[0].popularity).map(([show]) => show);
    out.innerHTML = hits.length
      ? `<h2 class="section-title">Top results <span class="muted">(${hits.length})</span></h2>${grid(hits)}`
      : `<div class="empty"><h2>No results for “${esc(raw)}”</h2><p>Check the spelling or try a genre such as <a href="${browseUrl('Fantasy')}">Fantasy</a>.</p></div>`;
  };

  input.addEventListener('input', render);
  clear.onclick = () => { input.value = ''; render(); input.focus(); };
  render();
  input.focus();
});
