import '../style.css';
import { SHOWS, byId } from '../data.js';
import { getHistory, inWatchlist, lastWatched } from '../store.js';
import { art, browseUrl, esc, icon, metaLine, page, params, row, url, watchUrl, wireRows, wlButtonLabel } from '../ui.js';

page('series', (main) => {
  const show = byId(params().get('id'));
  if (!show) {
    main.innerHTML = `<div class="container empty empty--page"><h1>Show not found</h1><p>This title isn't in the catalog.</p><a class="btn btn--primary" href="${url('browse/')}">Browse all anime</a></div>`;
    return;
  }
  document.title = `${show.title} · Hikari`;
  const last = lastWatched(show.id);
  let season = Math.min(Number(params().get('season')) || last?.season || 1, show.seasons.length);
  let newestFirst = false;

  const startHref = last ? watchUrl(show.id, last.season, last.ep) : watchUrl(show.id, 1, 1);
  const startLabel = show.movie ? 'Watch Trailer' : last ? `Continue S${last.season} E${last.ep}` : 'Start Watching S1 E1';
  const similar = SHOWS.filter((x) => x.id !== show.id)
    .map((x) => [x, x.genres.filter((g) => show.genres.includes(g)).length])
    .filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1] || b[0].popularity - a[0].popularity).map(([x]) => x).slice(0, 12);

  main.innerHTML = `
    <section class="series-hero">
      <div class="series-backdrop">${art(show, 'wide')}<div class="hero-shade hero-shade--series"></div></div>
      <div class="container series-top">
        <div class="series-poster">${art(show)}</div>
        <div class="series-info">
          <h1 class="series-title">${esc(show.title)}</h1>
          <p class="series-meta">
            <span class="badge">${show.rating}</span>
            <span>${show.year}</span><span>·</span><span>${esc(metaLine(show))}</span>
          </p>
          <p class="series-score">${icon.star}<strong>${show.score.toFixed(1)}</strong><span class="muted">average rating</span></p>
          <div class="series-buttons">
            <a class="btn btn--primary" href="${startHref}">${icon.play}<span>${startLabel}</span></a>
            <button class="btn btn--outline" data-wl="${show.id}" aria-pressed="${inWatchlist(show.id)}">${wlButtonLabel(inWatchlist(show.id))}</button>
          </div>
          <p class="series-blurb">${esc(show.blurb)}</p>
          <dl class="series-facts">
            <div><dt>Genres</dt><dd>${show.genres.map((g) => `<a class="tag" href="${browseUrl(g)}">${g}</a>`).join('')}</dd></div>
            <div><dt>Studio</dt><dd>${esc(show.studio)}</dd></div>
            <div><dt>Audio</dt><dd>Japanese</dd></div>
            <div><dt>Video</dt><dd>Official trailer (YouTube)</dd></div>
          </dl>
        </div>
      </div>
    </section>
    <section class="container episodes" aria-label="Episodes">
      <div class="episodes-head">
        <label class="select select--season"><span class="sr-only">Season</span>
          <select id="season">${show.seasons.map((se, i) => `<option value="${i + 1}">${show.movie ? 'Movie' : `S${i + 1}: ${esc(se.name)}`}</option>`).join('')}</select>
        </label>
        <div class="episodes-tools">
          <button class="btn btn--ghost btn--sm" id="order">Oldest first</button>
        </div>
      </div>
      <p class="episodes-note">Episodes listed for reference. Every play button opens the show's official trailer.</p>
      <div class="ep-grid" id="eps"></div>
      <div class="season-nav">
        <button class="btn btn--ghost btn--sm" id="prevSeason">${icon.left}<span>Previous Season</span></button>
        <button class="btn btn--ghost btn--sm" id="nextSeason"><span>Next Season</span>${icon.right}</button>
      </div>
    </section>
    <div class="rows rows--tight">${row('More Like This', similar)}</div>`;

  const sel = main.querySelector('#season');
  const eps = main.querySelector('#eps');
  const order = main.querySelector('#order');
  const prev = main.querySelector('#prevSeason');
  const next = main.querySelector('#nextSeason');

  const renderEps = () => {
    sel.value = String(season);
    const se = show.seasons[season - 1];
    const h = getHistory().find((x) => x.id === show.id);
    const numbers = Array.from({ length: se.episodes }, (_, i) => i + 1);
    if (newestFirst) numbers.reverse();
    eps.innerHTML = numbers.map((n) => {
      const watched = h && (h.season > season || (h.season === season && h.ep >= n));
      const current = h && h.season === season && h.ep === n;
      return `<a class="ep ${watched ? 'is-watched' : ''}" href="${watchUrl(show.id, season, n)}">
        <div class="ep-thumb">${art(show, 'thumb')}<span class="ep-duration">${show.movie ? `${show.runtime}m` : '24m'}</span>
          <span class="ep-play">${icon.play}</span>
          ${watched ? `<span class="ep-progress"><span style="width:${current ? 45 : 100}%"></span></span>` : ''}</div>
        <div class="ep-text">
          <p class="ep-series">${esc(show.title)}</p>
          <h3 class="ep-title">${show.movie ? esc(show.title) : `S${season} E${n} - Episode ${n}`}</h3>
          <p class="ep-sub">${show.movie ? 'Feature film' : esc(se.name)} · ${se.year}</p>
        </div>
      </a>`;
    }).join('');
    prev.hidden = season <= 1;
    next.hidden = season >= show.seasons.length;
    main.querySelector('.season-nav').hidden = show.seasons.length < 2;
    order.hidden = se.episodes < 2;
    order.textContent = newestFirst ? 'Newest first' : 'Oldest first';
  };
  sel.onchange = () => { season = Number(sel.value); renderEps(); };
  order.onclick = () => { newestFirst = !newestFirst; renderEps(); };
  prev.onclick = () => { season -= 1; renderEps(); };
  next.onclick = () => { season += 1; renderEps(); };
  renderEps();
  wireRows(main);
});
