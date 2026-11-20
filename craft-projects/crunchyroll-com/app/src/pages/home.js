import '../style.css';
import { HERO_IDS, SHOWS, byId } from '../data.js';
import { getHistory, getWatchlist, inWatchlist } from '../store.js';
import { art, browseUrl, esc, icon, metaLine, page, row, seriesUrl, watchUrl, wireRows, wlButtonLabel } from '../ui.js';

const popular = [...SHOWS].sort((a, b) => b.popularity - a.popularity);
const has = (g) => (x) => x.genres.includes(g);

function hero(shows) {
  const slides = shows.map((show, i) => `
    <div class="hero-slide ${i === 0 ? 'is-active' : ''}" data-i="${i}" aria-hidden="${i !== 0}">
      ${art(show, 'wide')}
      <div class="hero-shade"></div>
      <div class="hero-content">
        <p class="hero-kicker">${esc(show.genres.join(' · '))}</p>
        <h2 class="hero-title">${esc(show.title)}</h2>
        <p class="hero-meta"><span class="badge">${show.rating}</span> ${esc(metaLine(show))} · ${show.year}</p>
        <p class="hero-blurb">${esc(show.blurb)}</p>
        <div class="hero-buttons">
          <a class="btn btn--primary" href="${watchUrl(show.id)}" ${i ? 'tabindex="-1"' : ''}>${icon.play}<span>Watch Trailer</span></a>
          <button class="btn btn--outline icon-btn--sq" data-wl="${show.id}" aria-pressed="${inWatchlist(show.id)}" ${i ? 'tabindex="-1"' : ''}>${wlButtonLabel(inWatchlist(show.id))}</button>
          <a class="btn btn--ghost" href="${seriesUrl(show.id)}" ${i ? 'tabindex="-1"' : ''}>More Details</a>
        </div>
      </div>
    </div>`).join('');
  const dots = shows.map((s, i) => `<button class="hero-dot ${i === 0 ? 'is-active' : ''}" data-go="${i}" aria-label="Show ${esc(s.title)}"><span></span></button>`).join('');
  return `<section class="hero" aria-roledescription="carousel" aria-label="Featured shows">
    <div class="hero-slides">${slides}</div>
    <button class="hero-arrow hero-arrow--left" aria-label="Previous">${icon.left}</button>
    <button class="hero-arrow hero-arrow--right" aria-label="Next">${icon.right}</button>
    <div class="hero-dots">${dots}</div>
  </section>`;
}

function wireHero(root) {
  const slides = [...root.querySelectorAll('.hero-slide')];
  const dots = [...root.querySelectorAll('.hero-dot')];
  let cur = 0;
  let timer;
  const go = (n) => {
    cur = (n + slides.length) % slides.length;
    slides.forEach((s, i) => {
      s.classList.toggle('is-active', i === cur);
      s.setAttribute('aria-hidden', String(i !== cur));
      s.querySelectorAll('a,button').forEach((el) => (i === cur ? el.removeAttribute('tabindex') : el.setAttribute('tabindex', '-1')));
    });
    dots.forEach((d, i) => d.classList.toggle('is-active', i === cur));
    restart();
  };
  const restart = () => {
    clearInterval(timer);
    root.classList.remove('is-running');
    void root.offsetWidth;
    root.classList.add('is-running');
    timer = setInterval(() => go(cur + 1), 8000);
  };
  root.querySelector('.hero-arrow--left').onclick = () => go(cur - 1);
  root.querySelector('.hero-arrow--right').onclick = () => go(cur + 1);
  dots.forEach((d) => (d.onclick = () => go(Number(d.dataset.go))));
  // swipe on touch screens
  let x0 = null;
  root.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  root.addEventListener('touchend', (e) => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
    x0 = null;
  });
  restart();
}

function spotlight(show) {
  return `<section class="spotlight" aria-label="Spotlight">
    <div class="spotlight-art">${art(show, 'wide')}</div>
    <div class="spotlight-body">
      <p class="hero-kicker">Staff pick</p>
      <h2>${esc(show.title)}</h2>
      <p class="spotlight-meta">${esc(metaLine(show))} · ${esc(show.studio)}</p>
      <p>${esc(show.blurb)}</p>
      <div class="hero-buttons">
        <a class="btn btn--primary" href="${watchUrl(show.id)}">${icon.play}<span>Watch Trailer</span></a>
        <button class="btn btn--outline" data-wl="${show.id}" aria-pressed="${inWatchlist(show.id)}">${wlButtonLabel(inWatchlist(show.id))}</button>
      </div>
    </div>
  </section>`;
}

page('home', (main) => {
  const history = getHistory()
    .map((h) => ({ h, show: byId(h.id) }))
    .filter((x) => x.show)
    .map(({ h, show }) => {
      const before = show.seasons.slice(0, h.season - 1).reduce((n, se) => n + se.episodes, 0);
      const total = show.seasons.reduce((n, se) => n + se.episodes, 0);
      return {
        show,
        opts: {
          sub: show.movie ? 'Movie' : `S${h.season} E${h.ep}`,
          progress: Math.max(6, Math.round(((before + h.ep) / total) * 100)),
          playHref: watchUrl(show.id, h.season, h.ep),
        },
      };
    });
  const watchlist = getWatchlist().map((w) => byId(w.id)).filter(Boolean);

  main.innerHTML = `
    ${hero(HERO_IDS.map(byId))}
    <div class="rows">
      ${row('Continue Watching', history, { more: './watchlist/?tab=history' })}
      ${row('Most Popular', popular.slice(0, 14), { more: './browse/?sort=popular' })}
      ${row('New & Trending', [...SHOWS].filter((x) => x.year >= 2022).sort((a, b) => b.year - a.year || b.popularity - a.popularity), { more: './browse/?sort=newest' })}
      ${row('Action-Packed', popular.filter(has('Action')), { more: browseUrl('Action') })}
      ${spotlight(byId('apothecary-diaries'))}
      ${row('Fantasy Worlds', popular.filter(has('Fantasy')), { more: browseUrl('Fantasy') })}
      ${row('Your Watchlist', watchlist, { more: './watchlist/' })}
      ${row('Romance & Comedy', popular.filter((x) => x.genres.includes('Romance') || x.genres.includes('Comedy')), { more: browseUrl('Comedy') })}
      ${row('Timeless Classics', popular.filter((x) => x.year < 2012), { more: './browse/?sort=rating' })}
    </div>`;
  wireHero(main.querySelector('.hero'));
  wireRows(main);
});
