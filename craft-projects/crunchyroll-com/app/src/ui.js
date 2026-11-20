import { GENRES, SHOWS, byId, totalEpisodes } from './data.js';
import { inWatchlist, toggleWatchlist } from './store.js';

export const ROOT = document.documentElement.dataset.root || './';
export const url = (path) => ROOT + path;
export const seriesUrl = (id) => url(`series/?id=${encodeURIComponent(id)}`);
export const watchUrl = (id, season = 1, ep = 1) =>
  url(`watch/?id=${encodeURIComponent(id)}&s=${season}&e=${ep}`);
export const browseUrl = (genre) => url(genre ? `browse/?genre=${encodeURIComponent(genre)}` : 'browse/');

export const esc = (str) =>
  String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const params = () => new URLSearchParams(location.search);

export const icon = {
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 3a7.5 7.5 0 0 1 5.96 12.05l4.25 4.24-1.42 1.42-4.24-4.25A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17.2l-7-4.67-7 4.67V4a1 1 0 0 1 1-1Zm1 2v12.46l5-3.33 5 3.33V5H7Z"/></svg>',
  bookmarkFill: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17.2l-7-4.67-7 4.67V4a1 1 0 0 1 1-1Z"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.52.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5Z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z"/></svg>',
  left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.4 5.4 14 4l-8 8 8 8 1.4-1.4L8.8 12l6.6-6.6Z"/></svg>',
  right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.6 18.6 10 20l8-8-8-8-1.4 1.4 6.6 6.6-6.6 6.6Z"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7.4 8.6 4.6 4.6 4.6-4.6L18 10l-6 6-6-6 1.4-1.4Z"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8L12 2.5Z"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 12c4.4 0 8 2.2 8 5v1H4v-1c0-2.8 3.6-5 8-5Z"/></svg>',
};

const LOGO = `
<svg class="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
  <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-width="3"/>
  <path d="M16 6.5 18.3 13.7 25.5 16l-7.2 2.3L16 25.5l-2.3-7.2L6.5 16l7.2-2.3Z" fill="currentColor"/>
</svg>`;

// ---------- artwork placeholders (no real artwork is used) ----------
const hash = (str) => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export function art(show, kind = 'poster') {
  const [c1, c2] = show.colors;
  const h = hash(show.id);
  const angle = 120 + (h % 120);
  const x = 15 + (h % 70);
  const y = 10 + ((h >> 3) % 60);
  return `<div class="art art--${kind}" style="--c1:${c1};--c2:${c2};--ang:${angle}deg;--x:${x}%;--y:${y}%">
    <span class="art-shape art-shape--a"></span><span class="art-shape art-shape--b"></span>
    ${kind === 'poster' ? `<span class="art-title">${esc(show.title)}</span>` : ''}
  </div>`;
}

export const metaLine = (show) =>
  show.movie
    ? `Movie · ${show.runtime}m`
    : `${show.seasons.length} Season${show.seasons.length > 1 ? 's' : ''} · ${totalEpisodes(show)} Episodes`;

// ---------- cards ----------
export function card(show, opts = {}) {
  const saved = inWatchlist(show.id);
  const sub = opts.sub || metaLine(show);
  return `<article class="card" data-id="${show.id}">
    <a class="card-link" href="${seriesUrl(show.id)}" aria-label="${esc(show.title)}">
      <div class="card-poster">${art(show)}
        ${opts.progress != null ? `<div class="card-progress"><span style="width:${opts.progress}%"></span></div>` : ''}
        <div class="card-hover">
          <h4>${esc(show.title)}</h4>
          <p class="card-hover-meta"><span class="badge">${show.rating}</span> ${show.score.toFixed(1)} ${icon.star}</p>
          <p class="card-hover-meta">${esc(metaLine(show))}</p>
          <p class="card-hover-blurb">${esc(show.blurb)}</p>
        </div>
      </div>
      <h4 class="card-title">${esc(show.title)}</h4>
      <p class="card-sub">${esc(sub)}</p>
    </a>
    <div class="card-actions">
      <a class="icon-btn icon-btn--solid" href="${opts.playHref || watchUrl(show.id)}" aria-label="Play ${esc(show.title)} trailer">${icon.play}</a>
      <button class="icon-btn icon-btn--solid wl-toggle ${saved ? 'is-on' : ''}" data-wl="${show.id}" aria-pressed="${saved}" aria-label="${saved ? 'Remove from' : 'Add to'} watchlist">${saved ? icon.bookmarkFill : icon.bookmark}</button>
    </div>
  </article>`;
}

export function row(title, shows, opts = {}) {
  if (!shows.length) return '';
  const more = opts.more ? `<a class="row-more" href="${opts.more}">View all ${icon.right}</a>` : '';
  return `<section class="row" aria-label="${esc(title)}">
    <div class="row-head"><h2 class="row-title">${esc(title)}</h2>${more}</div>
    <div class="row-track-wrap">
      <button class="row-arrow row-arrow--left" aria-label="Scroll left" hidden>${icon.left}</button>
      <div class="row-track">${shows.map((x) => card(x.show || x, x.opts || {})).join('')}</div>
      <button class="row-arrow row-arrow--right" aria-label="Scroll right">${icon.right}</button>
    </div>
  </section>`;
}

export function wireRows(scope = document) {
  scope.querySelectorAll('.row-track-wrap').forEach((wrap) => {
    const track = wrap.querySelector('.row-track');
    const left = wrap.querySelector('.row-arrow--left');
    const right = wrap.querySelector('.row-arrow--right');
    const update = () => {
      left.hidden = track.scrollLeft < 4;
      right.hidden = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    left.onclick = () => track.scrollBy({ left: -track.clientWidth * 0.9, behavior: 'smooth' });
    right.onclick = () => track.scrollBy({ left: track.clientWidth * 0.9, behavior: 'smooth' });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
}

export const grid = (shows, opts = {}) =>
  `<div class="grid">${shows.map((x) => card(x.show || x, x.opts || opts)).join('')}</div>`;

// ---------- watchlist buttons (anywhere on the page) ----------
export function wlButtonLabel(on, compact = false) {
  if (compact) return on ? icon.bookmarkFill : icon.bookmark;
  return `${on ? icon.bookmarkFill : icon.bookmark}<span>${on ? 'In Watchlist' : 'Add to Watchlist'}</span>`;
}

function refreshWlButtons() {
  document.querySelectorAll('[data-wl]').forEach((b) => {
    const on = inWatchlist(b.dataset.wl);
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', String(on));
    const compact = b.classList.contains('icon-btn');
    b.innerHTML = wlButtonLabel(on, compact);
    if (compact) b.setAttribute('aria-label', `${on ? 'Remove from' : 'Add to'} watchlist`);
  });
}

let toastTimer;
export function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.append(el);
  }
  el.textContent = msg;
  el.classList.add('is-shown');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-shown'), 2200);
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-wl]');
  if (!b) return;
  e.preventDefault();
  const show = byId(b.dataset.wl);
  const on = toggleWatchlist(b.dataset.wl);
  refreshWlButtons();
  toast(on ? `Added “${show.title}” to your Watchlist` : `Removed “${show.title}” from your Watchlist`);
});

// ---------- header & footer ----------
export function header(active = '') {
  const genreLinks = GENRES.map((g) => `<a href="${browseUrl(g)}">${esc(g)}</a>`).join('');
  const el = document.createElement('header');
  el.className = 'site-header';
  el.innerHTML = `
    <div class="header-inner">
      <button class="icon-btn header-menu" aria-label="Open menu" aria-expanded="false">${icon.menu}</button>
      <a class="logo" href="${url('')}" aria-label="Hikari home">${LOGO}<span class="logo-word">hikari</span></a>
      <nav class="header-nav" aria-label="Main">
        <div class="nav-drop">
          <button class="nav-link ${active === 'browse' ? 'is-active' : ''}" aria-expanded="false" aria-haspopup="true">Browse ${icon.chevron}</button>
          <div class="nav-panel">
            <div class="nav-panel-col">
              <a href="${url('browse/?sort=popular')}">Popular</a>
              <a href="${url('browse/?sort=newest')}">New</a>
              <a href="${url('browse/?sort=az')}">Alphabetical</a>
              <a href="${url('browse/?sort=rating')}">Top Rated</a>
            </div>
            <div class="nav-panel-genres"><p class="nav-panel-head">Genres</p><div>${genreLinks}</div></div>
          </div>
        </div>
        <a class="nav-link ${active === 'new' ? 'is-active' : ''}" href="${url('browse/?sort=newest')}">New</a>
        <a class="nav-link ${active === 'watchlist' ? 'is-active' : ''}" href="${url('watchlist/')}">My Lists</a>
      </nav>
      <div class="header-actions">
        <a class="icon-btn ${active === 'search' ? 'is-active' : ''}" href="${url('search/')}" aria-label="Search">${icon.search}</a>
        <a class="icon-btn ${active === 'watchlist' ? 'is-active' : ''}" href="${url('watchlist/')}" aria-label="Watchlist">${icon.bookmark}</a>
        <span class="avatar" aria-hidden="true">${icon.user}</span>
      </div>
    </div>
    <div class="drawer" hidden>
      <div class="drawer-inner">
        <a href="${url('')}">Home</a>
        <a href="${url('browse/?sort=popular')}">Popular</a>
        <a href="${url('browse/?sort=newest')}">New</a>
        <a href="${url('browse/')}">Browse All</a>
        <a href="${url('search/')}">Search</a>
        <a href="${url('watchlist/')}">My Lists</a>
        <p class="drawer-head">Genres</p>
        <div class="drawer-genres">${genreLinks}</div>
      </div>
    </div>`;
  document.body.prepend(el);

  const menuBtn = el.querySelector('.header-menu');
  const drawer = el.querySelector('.drawer');
  menuBtn.onclick = () => {
    const open = drawer.hidden;
    drawer.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.innerHTML = open ? icon.close : icon.menu;
    document.body.classList.toggle('no-scroll', open);
  };
  const drop = el.querySelector('.nav-drop');
  const dropBtn = drop.querySelector('button');
  dropBtn.onclick = () => {
    const open = !drop.classList.contains('is-open');
    drop.classList.toggle('is-open', open);
    dropBtn.setAttribute('aria-expanded', String(open));
  };
  document.addEventListener('click', (e) => {
    if (!drop.contains(e.target)) {
      drop.classList.remove('is-open');
      dropBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

export function footer() {
  const el = document.createElement('footer');
  el.className = 'site-footer';
  el.innerHTML = `
    <div class="footer-inner">
      <div class="footer-col">
        <h3>Navigation</h3>
        <a href="${url('browse/?sort=popular')}">Popular</a>
        <a href="${url('browse/?sort=newest')}">New</a>
        <a href="${url('browse/')}">Browse All</a>
        <a href="${url('search/')}">Search</a>
      </div>
      <div class="footer-col">
        <h3>Genres</h3>
        ${['Action', 'Adventure', 'Comedy', 'Fantasy', 'Romance', 'Sci-Fi'].map((g) => `<a href="${browseUrl(g)}">${g}</a>`).join('')}
      </div>
      <div class="footer-col">
        <h3>My Lists</h3>
        <a href="${url('watchlist/')}">Watchlist</a>
        <a href="${url('watchlist/?tab=history')}">History</a>
      </div>
      <div class="footer-col footer-about">
        <a class="logo" href="${url('')}" aria-label="Hikari home">${LOGO}<span class="logo-word">hikari</span></a>
        <p>A demo anime browsing app. Show details are a small sample catalog; videos are official trailers played from YouTube. No episodes are hosted or linked.</p>
        <p class="footer-fine">Titles and trademarks belong to their respective owners.</p>
      </div>
    </div>`;
  document.body.append(el);
}

export function page(active, render) {
  header(active);
  const main = document.querySelector('main');
  render(main);
  footer();
}

export { SHOWS, byId };
