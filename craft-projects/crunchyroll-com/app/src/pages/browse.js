import '../style.css';
import { GENRES, SHOWS } from '../data.js';
import { esc, grid, page, params } from '../ui.js';

const SORTS = {
  popular: ['Popularity', (a, b) => b.popularity - a.popularity],
  newest: ['Newest', (a, b) => b.year - a.year || b.popularity - a.popularity],
  az: ['Alphabetical', (a, b) => a.title.localeCompare(b.title)],
  rating: ['Top Rated', (a, b) => b.score - a.score || b.popularity - a.popularity],
};

page('browse', (main) => {
  const p = params();
  let genre = GENRES.find((g) => g.toLowerCase() === (p.get('genre') || '').toLowerCase()) || '';
  let sort = SORTS[p.get('sort')] ? p.get('sort') : 'popular';
  let type = p.get('type') || 'all';

  main.innerHTML = `
    <div class="page-head container">
      <h1 class="page-title"></h1>
      <div class="browse-bar">
        <div class="chips" role="list"></div>
        <div class="browse-controls">
          <label class="select"><span class="sr-only">Type</span>
            <select id="type">
              <option value="all">All types</option><option value="series">Series</option><option value="movie">Movies</option>
            </select></label>
          <label class="select"><span class="sr-only">Sort by</span>
            <select id="sort">${Object.entries(SORTS).map(([k, [label]]) => `<option value="${k}">${label}</option>`).join('')}</select></label>
        </div>
      </div>
    </div>
    <div class="container"><p class="result-count" aria-live="polite"></p><div id="results"></div></div>`;

  const chips = main.querySelector('.chips');
  const title = main.querySelector('.page-title');
  const count = main.querySelector('.result-count');
  const results = main.querySelector('#results');
  const sortSel = main.querySelector('#sort');
  const typeSel = main.querySelector('#type');
  sortSel.value = sort;
  typeSel.value = type;

  const render = () => {
    chips.innerHTML = ['', ...GENRES]
      .map((g) => `<button role="listitem" class="chip ${g === genre ? 'is-on' : ''}" data-genre="${esc(g)}" aria-pressed="${g === genre}">${g || 'All'}</button>`)
      .join('');
    title.textContent = genre ? `${genre} Anime` : sort === 'newest' ? 'New Anime' : 'Browse All Anime';
    document.title = `${title.textContent} · Hikari`;
    const list = SHOWS.filter((x) => !genre || x.genres.includes(genre))
      .filter((x) => type === 'all' || (type === 'movie' ? x.movie : !x.movie))
      .sort(SORTS[sort][1]);
    count.textContent = `${list.length} title${list.length === 1 ? '' : 's'}`;
    results.innerHTML = list.length ? grid(list) : `<div class="empty"><h2>Nothing here yet</h2><p>No titles match this combination. Try another genre.</p></div>`;
    const q = new URLSearchParams();
    if (genre) q.set('genre', genre);
    if (sort !== 'popular') q.set('sort', sort);
    if (type !== 'all') q.set('type', type);
    history.replaceState(null, '', `${location.pathname}${q.toString() ? `?${q}` : ''}`);
  };

  chips.addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    genre = b.dataset.genre;
    render();
  });
  sortSel.onchange = () => { sort = sortSel.value; render(); };
  typeSel.onchange = () => { type = typeSel.value; render(); };
  render();
});
