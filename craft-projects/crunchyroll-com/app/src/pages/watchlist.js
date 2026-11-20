import '../style.css';
import { byId } from '../data.js';
import { clearHistory, getHistory, getWatchlist, removeHistory } from '../store.js';
import { browseUrl, card, esc, grid, icon, page, params, url, watchUrl } from '../ui.js';

page('watchlist', (main) => {
  let tab = params().get('tab') === 'history' ? 'history' : 'watchlist';
  let sort = 'recent';

  main.innerHTML = `
    <div class="container page-head">
      <h1 class="page-title">My Lists</h1>
      <div class="tabs" role="tablist">
        <button role="tab" class="tab" data-tab="watchlist">Watchlist</button>
        <button role="tab" class="tab" data-tab="history">History</button>
      </div>
    </div>
    <div class="container">
      <div class="list-bar">
        <p class="result-count" aria-live="polite"></p>
        <div class="list-tools"></div>
      </div>
      <div id="list"></div>
    </div>`;

  const list = main.querySelector('#list');
  const count = main.querySelector('.result-count');
  const tools = main.querySelector('.list-tools');

  const render = () => {
    main.querySelectorAll('.tab').forEach((t) => {
      const on = t.dataset.tab === tab;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', String(on));
    });
    history.replaceState(null, '', `${location.pathname}${tab === 'history' ? '?tab=history' : ''}`);
    document.title = `${tab === 'history' ? 'History' : 'Watchlist'} · Hikari`;

    if (tab === 'watchlist') {
      let items = getWatchlist().map((w) => ({ w, show: byId(w.id) })).filter((x) => x.show);
      if (sort === 'az') items.sort((a, b) => a.show.title.localeCompare(b.show.title));
      count.textContent = `${items.length} title${items.length === 1 ? '' : 's'} saved in this browser`;
      tools.innerHTML = items.length ? `<label class="select"><span class="sr-only">Sort</span><select id="lsort">
        <option value="recent">Recently added</option><option value="az">Alphabetical</option></select></label>` : '';
      const sel = tools.querySelector('select');
      if (sel) { sel.value = sort; sel.onchange = () => { sort = sel.value; render(); }; }
      list.innerHTML = items.length
        ? grid(items.map((x) => x.show))
        : `<div class="empty">${icon.bookmark}<h2>Your Watchlist needs some love</h2>
           <p>Tap the bookmark on any show to save it here. Your list stays in this browser.</p>
           <a class="btn btn--primary" href="${url('browse/?sort=popular')}">Browse popular anime</a></div>`;
    } else {
      const items = getHistory().map((h) => ({ h, show: byId(h.id) })).filter((x) => x.show);
      count.textContent = `${items.length} recently watched`;
      tools.innerHTML = items.length ? `<button class="btn btn--ghost btn--sm" id="clear">Clear history</button>` : '';
      const clear = tools.querySelector('#clear');
      if (clear) clear.onclick = () => { if (confirm('Clear your watch history in this browser?')) clearHistory(); };
      list.innerHTML = items.length
        ? `<div class="grid history">${items.map(({ h, show }) => `
            <div class="history-item">
              ${card(show, { sub: show.movie ? 'Movie' : `S${h.season} E${h.ep} · ${new Date(h.at).toLocaleDateString()}`, playHref: watchUrl(show.id, h.season, h.ep) })}
              <button class="link-btn history-remove" data-remove="${show.id}" aria-label="Remove ${esc(show.title)} from history">${icon.close} Remove</button>
            </div>`).join('')}</div>`
        : `<div class="empty">${icon.play}<h2>No history yet</h2><p>Trailers you watch show up here so you can pick up where you left off.</p>
           <a class="btn btn--primary" href="${browseUrl('')}">Start browsing</a></div>`;
    }
  };

  main.querySelector('.tabs').addEventListener('click', (e) => {
    const t = e.target.closest('.tab');
    if (t) { tab = t.dataset.tab; render(); }
  });
  list.addEventListener('click', (e) => {
    const b = e.target.closest('[data-remove]');
    if (b) removeHistory(b.dataset.remove);
  });
  window.addEventListener('hikari:store', () => render());
  render();
});
