// Everything the visitor saves lives in this browser (localStorage).
const KEY_LIST = 'hikari.watchlist.v1';
const KEY_HISTORY = 'hikari.history.v1';
const KEY_TRAILERS = 'hikari.trailers.v1';

const read = (key, fallback) => {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: keep working without saving */
  }
  window.dispatchEvent(new CustomEvent('hikari:store', { detail: { key } }));
};

// Watchlist: [{ id, added }]
export const getWatchlist = () => read(KEY_LIST, []);
export const inWatchlist = (id) => getWatchlist().some((x) => x.id === id);
export const toggleWatchlist = (id) => {
  const list = getWatchlist();
  const has = list.some((x) => x.id === id);
  write(KEY_LIST, has ? list.filter((x) => x.id !== id) : [{ id, added: Date.now() }, ...list]);
  return !has;
};

// History: [{ id, season, ep, at }] newest first, one entry per show.
export const getHistory = () => read(KEY_HISTORY, []);
export const recordWatch = (id, season, ep) => {
  const list = getHistory().filter((x) => x.id !== id);
  write(KEY_HISTORY, [{ id, season, ep, at: Date.now() }, ...list].slice(0, 50));
};
export const lastWatched = (id) => getHistory().find((x) => x.id === id);
export const clearHistory = () => write(KEY_HISTORY, []);
export const removeHistory = (id) => write(KEY_HISTORY, getHistory().filter((x) => x.id !== id));

// Trailers the visitor picked themselves: { showId: youtubeId }
export const getCustomTrailer = (id) => read(KEY_TRAILERS, {})[id] || null;
export const setCustomTrailer = (id, yt) => {
  const all = read(KEY_TRAILERS, {});
  if (yt) all[id] = yt;
  else delete all[id];
  write(KEY_TRAILERS, all);
};
