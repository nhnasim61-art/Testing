import '../style.css';
import { byId } from '../data.js';
import { getCustomTrailer, inWatchlist, recordWatch, setCustomTrailer } from '../store.js';
import { art, esc, icon, page, params, seriesUrl, toast, url, watchUrl, wlButtonLabel } from '../ui.js';

// Accepts a bare 11-character id or any common YouTube link.
export function youtubeId(text) {
  const t = (text || '').trim();
  if (/^[\w-]{11}$/.test(t)) return t;
  const m = t.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m ? m[1] : null;
}

page('watch', (main) => {
  const p = params();
  const show = byId(p.get('id'));
  if (!show) {
    main.innerHTML = `<div class="container empty empty--page"><h1>Video not found</h1><p>This title isn't in the catalog.</p><a class="btn btn--primary" href="${url('browse/')}">Browse all anime</a></div>`;
    return;
  }
  const season = Math.min(Math.max(Number(p.get('s')) || 1, 1), show.seasons.length);
  const se = show.seasons[season - 1];
  const ep = Math.min(Math.max(Number(p.get('e')) || 1, 1), se.episodes);
  recordWatch(show.id, season, ep);

  const epLabel = show.movie ? show.title : `S${season} E${ep} - Episode ${ep}`;
  document.title = `${show.movie ? show.title : `${show.title} ${epLabel}`} · Hikari`;

  // neighbours across season boundaries
  const prev = ep > 1 ? [season, ep - 1] : season > 1 ? [season - 1, show.seasons[season - 2].episodes] : null;
  const next = ep < se.episodes ? [season, ep + 1] : season < show.seasons.length ? [season + 1, 1] : null;
  const upNext = [];
  let s = season, e = ep;
  while (upNext.length < 6) {
    if (e < show.seasons[s - 1].episodes) e += 1;
    else if (s < show.seasons.length) { s += 1; e = 1; } else break;
    upNext.push([s, e]);
  }

  const searchHref = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${show.title} official trailer`)}`;

  main.innerHTML = `
    <div class="player-band">
      <div class="player-wrap">
        <div class="player" id="player"></div>
      </div>
    </div>
    <div class="container watch-layout">
      <div class="watch-main">
        <a class="watch-series" href="${seriesUrl(show.id)}">${esc(show.title)}</a>
        <h1 class="watch-title">${esc(epLabel)}</h1>
        <p class="series-meta"><span class="badge">${show.rating}</span><span>${show.movie ? `${show.runtime}m` : esc(se.name)}</span><span>·</span><span>${se.year}</span></p>
        <p class="watch-note">${icon.play}<span>You're watching the official trailer. Full episodes aren't hosted or linked on Hikari.</span></p>
        <div class="watch-buttons">
          ${prev ? `<a class="btn btn--ghost btn--sm" href="${watchUrl(show.id, ...prev)}">${icon.left}<span>Previous</span></a>` : ''}
          ${next ? `<a class="btn btn--ghost btn--sm" href="${watchUrl(show.id, ...next)}"><span>Next Episode</span>${icon.right}</a>` : ''}
          <button class="btn btn--outline btn--sm" data-wl="${show.id}" aria-pressed="${inWatchlist(show.id)}">${wlButtonLabel(inWatchlist(show.id))}</button>
        </div>
        <p class="series-blurb">${esc(show.blurb)}</p>
        <details class="trailer-fix">
          <summary>Wrong or missing trailer?</summary>
          <form class="trailer-form">
            <label for="yt">Paste a YouTube link to the official trailer. It's saved in this browser only.</label>
            <div class="trailer-row">
              <input id="yt" type="url" placeholder="https://www.youtube.com/watch?v=…" autocomplete="off">
              <button class="btn btn--primary btn--sm" type="submit">Use this trailer</button>
            </div>
            <p class="trailer-actions"><a href="${searchHref}" target="_blank" rel="noopener">Search YouTube for the official trailer</a>
            <button type="button" class="link-btn" id="resetTrailer" hidden>Reset to default</button></p>
          </form>
        </details>
      </div>
      <aside class="watch-side" aria-label="Up next">
        ${upNext.length ? `<h2 class="section-title">Up Next</h2>` : ''}
        ${upNext.map(([ss, ee]) => `
          <a class="ep ep--row" href="${watchUrl(show.id, ss, ee)}">
            <div class="ep-thumb">${art(show, 'thumb')}<span class="ep-duration">24m</span></div>
            <div class="ep-text"><p class="ep-series">${esc(show.title)}</p><h3 class="ep-title">S${ss} E${ee} - Episode ${ee}</h3></div>
          </a>`).join('')}
        <a class="btn btn--ghost btn--block" href="${seriesUrl(show.id)}">${show.movie ? 'Movie details' : 'See all episodes'}</a>
      </aside>
    </div>`;

  const player = main.querySelector('#player');
  const reset = main.querySelector('#resetTrailer');
  const renderPlayer = () => {
    const custom = getCustomTrailer(show.id);
    const id = custom || show.trailer;
    reset.hidden = !custom;
    if (id) {
      player.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1"
        title="${esc(show.title)} – official trailer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    } else {
      player.innerHTML = `<div class="player-empty">${art(show, 'wide')}<div class="player-empty-body">
        <h2>Trailer not set for this title</h2>
        <p>Find the official trailer on YouTube, then paste its link below the player to play it here.</p>
        <a class="btn btn--primary" href="${searchHref}" target="_blank" rel="noopener">${icon.search}<span>Find official trailer</span></a>
      </div></div>`;
      main.querySelector('.trailer-fix').open = true;
    }
  };
  main.querySelector('.trailer-form').onsubmit = (ev) => {
    ev.preventDefault();
    const inp = main.querySelector('#yt');
    const id = youtubeId(inp.value);
    if (!id) { toast('That doesn’t look like a YouTube link'); inp.focus(); return; }
    setCustomTrailer(show.id, id);
    inp.value = '';
    renderPlayer();
    toast('Trailer saved for this show');
  };
  reset.onclick = () => { setCustomTrailer(show.id, null); renderPlayer(); toast('Trailer reset'); };
  renderPlayer();
});
