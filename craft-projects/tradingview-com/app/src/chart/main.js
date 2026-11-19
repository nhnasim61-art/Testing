import '../styles/site.css';
import '../styles/chart.css';
import { Chart } from './engine.js';
import { I } from './icons.js';
import { CATALOG, MA_COLORS, paramText } from './indicators.js';
import { BY_SYMBOL, SYMBOLS, INTERVALS, genBars, fmt, fmtPct, fmtSigned, fmtVol, decimalsFor, logoHTML, rng } from '../data.js';
import { BRAND, ICONS, openSearch } from '../site.js';

const $ = (sel, root = document) => root.querySelector(sel);
const LS = 'tickerra.chart.v1';
const saved = (() => { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch { return {}; } })();
const params = new URLSearchParams(location.search);

const state = {
  symbol: (params.get('symbol') || saved.symbol || 'AAPL').toUpperCase(),
  interval: saved.interval || 'D',
  type: saved.type || 'candles',
  indicators: saved.indicators || [{ id: 'vol1', type: 'vol', pane: 'overlay', params: {}, visible: true }],
  watchlist: saved.watchlist || ['SPX', 'NDQ', 'DJI', 'VIX', 'DXY', 'AAPL', 'TSLA', 'NFLX', 'CL1!', 'GC1!', 'SI1!', 'EURUSD', 'GBPUSD', 'BTCUSD', 'ETHUSD'],
  drawings: saved.drawings || {},
  collapsed: saved.collapsed || {},
  tipDone: !!saved.tipDone,
  legendOpen: saved.legendOpen !== false,
};
if (!BY_SYMBOL[state.symbol]) state.symbol = 'AAPL';

function persist() {
  localStorage.setItem(LS, JSON.stringify({
    symbol: state.symbol, interval: state.interval, type: state.type, indicators: state.indicators,
    watchlist: state.watchlist, drawings: state.drawings, collapsed: state.collapsed, tipDone: state.tipDone, legendOpen: state.legendOpen,
  }));
}

// ---------- live quotes ----------
const quotes = {};
for (const s of SYMBOLS) {
  const prev = s.p / (1 + s.c / 100);
  quotes[s.s] = { price: s.p, prev, ext: s.p * (1 + (rng(s.s + 'x')() - 0.4) * 0.012), vol: (s.type === 'index' ? 4.1e8 : 3.2e7) * (0.6 + rng(s.s + 'v')() * 0.8) };
}

// ---------- page skeleton ----------
const TOOLS = [
  ['cross', 'Cross', I.cross], ['trend', 'Trend line', I.trend], ['hline', 'Horizontal line', I.hline], ['fib', 'Fib retracement', I.fib],
  ['rect', 'Rectangle', I.rect], ['brush', 'Brush', I.brush], ['text', 'Text', I.text], ['arrow', 'Arrow marker', I.emoji], 'sep',
  ['range', 'Price range', I.range], ['measure', 'Measure', I.ruler], ['zoom', 'Zoom in', I.zoom], 'sep',
  ['magnet', 'Magnet mode', I.magnet, 'toggle'], ['stay', 'Stay in drawing mode', I.stay, 'toggle'], ['lock', 'Lock all drawings', I.lock, 'toggle'], ['hide', 'Hide all drawings', I.eye, 'toggle'], 'sep',
  ['clear', 'Remove all drawings', I.trash, 'action'],
];
const TYPES = [['candles', 'Candles', I.candles], ['hollow', 'Hollow candles', I.hollow], ['bars', 'Bars', I.bars], ['line', 'Line', I.line], ['area', 'Area', I.area], ['heikin', 'Heikin Ashi', I.heikin]];
const RANGES = [['1D', '1', 390], ['5D', '5', 390], ['1M', '60', 160], ['3M', '240', 130], ['6M', 'D', 126], ['YTD', 'D', 'ytd'], ['1Y', 'D', 252], ['5Y', 'W', 260], ['All', 'M', 9999]];

const app = $('#app');
app.innerHTML = `
<header class="tb" role="toolbar" aria-label="Chart toolbar">
  <button class="tb-btn tb-menu" data-act="menu" title="Main menu">${I.menu}</button>
  <button class="tb-symbol" data-act="symbol" title="Symbol search"><span class="sym-text"></span><span class="sym-ic">${I.candles}</span></button>
  <button class="tb-btn" data-act="compare" title="Compare or add symbol">${I.compare}</button>
  <i class="tb-sep"></i>
  <button class="tb-btn tb-int" data-act="interval" title="Interval"><span></span></button>
  <i class="tb-sep"></i>
  <button class="tb-btn tb-type" data-act="type" title="Chart type"></button>
  <i class="tb-sep"></i>
  <button class="tb-btn tb-ind" data-act="indicators" title="Indicators">${I.indicators}<span class="lbl">Indicators</span></button>
  <button class="tb-btn tb-ind-more" data-act="indicators" title="Indicator templates">${I.chevDown}</button>
  <i class="tb-sep"></i>
  <button class="tb-btn tb-alert" data-act="alert" title="Create alert">${I.alert}<span class="lbl">Alert</span></button>
  <button class="tb-btn tb-replay" data-act="replay" title="Bar replay">${I.replay}<span class="lbl">Replay</span></button>
  <i class="tb-sep"></i>
  <button class="tb-btn" data-act="undo" title="Undo">${I.undo}</button>
  <button class="tb-btn" data-act="redo" title="Redo">${I.redo}</button>
  <span class="tb-flex"></span>
  <button class="tb-btn tb-layout" data-act="layout" title="Select layout">${I.layout}</button>
  <button class="tb-btn tb-save" data-act="save" title="Save chart layout"><span class="lbl">Save</span></button>
  <button class="tb-btn tb-save-more" data-act="save" title="Manage layouts">${I.chevDown}</button>
  <button class="tb-btn tb-quick" data-act="symbol" title="Quick search">${I.quick}</button>
  <button class="tb-btn tb-settings" data-act="settings" title="Settings">${I.settings}</button>
  <button class="tb-btn tb-full" data-act="fullscreen" title="Fullscreen mode">${I.fullscreen}</button>
  <button class="tb-btn tb-snap" data-act="snapshot" title="Take a snapshot">${I.camera}</button>
  <button class="tb-btn tb-ideas" data-act="publish" title="Publish idea">${I.ideas}</button>
  <a class="tb-trade" href="/brokers/">Trade</a>
  <a class="tb-upgrade" href="/brokers/">Upgrade</a>
</header>
<section class="ws" aria-label="Chart workspace">
<aside class="lt" aria-label="Drawing tools">
  ${TOOLS.map((t) => (t === 'sep' ? '<i class="lt-sep"></i>' : `<button class="lt-btn" data-tool="${t[0]}" data-kind="${t[3] || 'tool'}" title="${t[1]}" aria-label="${t[1]}">${t[2]}</button>`)).join('')}
</aside>
<div class="center">
  <div class="chart-wrap">
    <div id="chart"></div>
    <div class="legend">
      <div class="lg-row lg-title">
        <span class="lg-logo"></span><button class="lg-name" data-act="symbol"></button>
        <span class="lg-badge lg-session">${I.moon}<span>Post-market</span></span>
        <span class="lg-badge lg-pink"><b>≈</b> <span class="lg-upd">1s updates · </span>Simulated data</span>
        <span class="lg-ohlc"></span>
      </div>
      <div class="lg-row lg-ohlc-row"><span class="lg-ohlc2"></span></div>
      <div class="lg-row lg-trade">
        <button class="lg-sell" data-act="trade"><b></b><span>SELL</span></button>
        <span class="lg-spread"></span>
        <button class="lg-buy" data-act="trade"><b></b><span>BUY</span></button>
      </div>
      <div class="lg-inds"></div>
      <button class="lg-toggle" title="Hide indicator legend">${I.chevUp}</button>
    </div>
    <div class="sub-legends"></div>
    <div class="wm" aria-hidden="true">${ICONS.mark}<span>${BRAND}</span></div>
    <div class="tip" role="dialog" aria-label="Drawing tip" hidden>
      <h3>Draw right on your chart</h3>
      <p>Pick a tool on the left, then click on the chart to add trend lines, levels and notes.</p>
      <button class="tip-ok">Got it</button>
    </div>
    <i class="tip-dot" hidden></i>
    <div class="replay-bar" hidden>
      <span>Replay</span>
      <button data-r="play" title="Play">${I.play}</button>
      <button data-r="step" title="Forward one bar">${I.stepF}</button>
      <select data-r="speed" aria-label="Replay speed"><option value="1000">1x</option><option value="400" selected>3x</option><option value="120">10x</option></select>
      <button data-r="exit" class="rb-exit">Exit</button>
    </div>
    <button class="scroll-end" title="Scroll to the most recent bar" hidden>${I.chevDown}</button>
  </div>
  <div class="bb">
    <div class="bb-ranges">${RANGES.map((r) => `<button data-range="${r[0]}">${r[0]}</button>`).join('')}<i class="tb-sep"></i><button class="bb-goto" title="Go to">${I.dateRange}</button></div>
    <button class="bb-daterange">Date Range ${I.chevDown}</button>
    <span class="tb-flex"></span>
    <span class="bb-clock"></span>
    <i class="tb-sep"></i>
    <button class="bb-adj" title="Adjust data for dividends">ADJ</button>
  </div>
</div>
<div class="wl" role="region" aria-label="Watchlist">
  <div class="wl-top">
    <div class="wl-head">
      <button class="wl-title">Watchlist ${I.chevDown}</button>
      <span class="tb-flex"></span>
      <button class="wl-ic" data-act="wl-add" title="Add symbol">${I.plus}</button>
      <button class="wl-ic" data-act="wl-expand" title="Advanced view">${I.expand}</button>
      <button class="wl-ic" data-act="wl-more" title="More settings">${I.dots}</button>
    </div>
    <div class="wl-cols"><button data-sort="s">Symbol</button><button data-sort="last">Last</button><button data-sort="chg">Chg</button><button data-sort="pct">Chg%</button></div>
    <div class="wl-list" role="list"></div>
  </div>
  <div class="wl-split"></div>
  <div class="wl-detail"></div>
</div>
<aside class="rt" aria-label="Panels">
  <button class="rt-btn active" data-panel="watchlist" title="Watchlist and details">${I.watchlist}</button>
  <button class="rt-btn" data-panel="alerts" title="Alerts">${I.clock}</button>
  <button class="rt-btn" data-panel="data" title="Object tree and data window">${I.layers}</button>
  <span class="tb-flex"></span>
  <button class="rt-btn" data-panel="assist" title="Assistant">${I.sparkle}</button>
  <button class="rt-btn" data-panel="hotlist" title="Hotlists">${I.target}</button>
  <button class="rt-btn" data-panel="ideas" title="Ideas">${I.ideas}</button>
  <button class="rt-btn" data-panel="news" title="News">${I.layers}</button>
  <button class="rt-btn" data-panel="calendar" title="Calendars">${I.calendar}</button>
  <button class="rt-btn" data-panel="feed" title="Feed">${I.feed}</button>
  <button class="rt-btn" data-panel="notif" title="Notifications">${I.bell}</button>
  <button class="rt-btn" data-panel="chat" title="Chats">${I.chat}</button>
  <button class="rt-btn rt-grid" data-panel="products" title="Products">${I.grid}</button>
  <button class="rt-btn" data-panel="help" title="Help Center">${I.help}</button>
</aside>
</section>
<div class="pop" hidden></div>
<div class="modal" hidden><div class="modal-box"></div></div>
<div class="toasts" aria-live="polite"></div>
`;

const chart = new Chart($('#chart'), { watermark: '' });

// ---------- helpers ----------
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  const box = $('.toasts');
  while (box.children.length > 1) box.firstChild.remove();
  box.appendChild(t);
  setTimeout(() => t.classList.add('out'), 2600);
  setTimeout(() => t.remove(), 3000);
}

const pop = $('.pop');
function openPop(anchor, html, onClick, cls = '') {
  pop.className = 'pop ' + cls;
  pop.innerHTML = html;
  pop.hidden = false;
  const r = anchor.getBoundingClientRect();
  const pw = pop.offsetWidth;
  let left = Math.min(window.innerWidth - pw - 8, Math.max(8, r.left));
  let top = r.bottom + 4;
  if (anchor.closest('.bb')) top = r.top - pop.offsetHeight - 4;
  if (anchor.closest('.lt')) { left = r.right + 4; top = r.top; }
  pop.style.left = left + 'px';
  pop.style.top = Math.max(4, top) + 'px';
  pop._onClick = onClick;
  pop._anchor = anchor;
}
function closePop() { pop.hidden = true; pop._anchor = null; }
pop.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b && pop._onClick) { pop._onClick(b.dataset.v, b); } });
document.addEventListener('pointerdown', (e) => {
  if (!pop.hidden && !pop.contains(e.target) && !(pop._anchor && pop._anchor.contains(e.target))) closePop();
});

const modal = $('.modal');
function openModal(html, cls = '') {
  modal.querySelector('.modal-box').className = 'modal-box ' + cls;
  modal.querySelector('.modal-box').innerHTML = html;
  modal.hidden = false;
  return modal.querySelector('.modal-box');
}
function closeModal() { modal.hidden = true; }
modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('[data-close]')) closeModal(); });

function ivLabel(iv) { return { '1': '1m', '5': '5m', '15': '15m', '60': '1h', '240': '4h', D: 'D', W: 'W', M: 'M' }[iv]; }
function ivTitle(iv) { return { '1': '1m', '5': '5m', '15': '15m', '60': '1h', '240': '4h', D: '1D', W: '1W', M: '1M' }[iv]; }
function q(sym) { return quotes[sym]; }
function dec(sym) { return decimalsFor(BY_SYMBOL[sym].p); }

// ---------- data loading ----------
function load(keepView) {
  const bars = genBars(state.symbol, state.interval);
  const qt = q(state.symbol);
  const last = bars[bars.length - 1];
  last.c = qt.price; last.h = Math.max(last.h, qt.price); last.l = Math.min(last.l, qt.price);
  chart.setData(bars, state.interval, INTERVALS[state.interval].sec, keepView);
  chart.drawings = (state.drawings[state.symbol] || []).map((d) => ({ ...d }));
  chart.history = []; chart.future = [];
  chart.selected = null;
  renderTop();
  renderLegend();
  renderDetail();
  highlightRow();
  document.title = `${state.symbol} ${fmt(qt.price, dec(state.symbol))} ${qt.price >= qt.prev ? '▲' : '▼'} ${fmtPct(((qt.price - qt.prev) / qt.prev) * 100)}`;
}

function setSymbol(sym) {
  if (!BY_SYMBOL[sym]) return;
  saveDrawings();
  exitReplay();
  state.symbol = sym;
  const u = new URL(location.href); u.searchParams.set('symbol', sym); history.replaceState(null, '', u);
  persist();
  load(false);
}
function setInterval_(iv, bars) {
  exitReplay();
  state.interval = iv;
  persist();
  load(false);
  if (bars === 'ytd') {
    const jan = Date.UTC(new Date().getUTCFullYear(), 0, 1) / 1000;
    chart.setVisibleBars(Math.max(5, (Date.now() / 1000 - jan) / INTERVALS[iv].sec));
  } else if (bars) chart.setVisibleBars(bars);
}
function saveDrawings() {
  state.drawings[state.symbol] = chart.drawings.map((d) => ({ ...d }));
  persist();
}

// ---------- top bar ----------
function renderTop() {
  $('.sym-text').textContent = state.symbol;
  $('.tb-int span').textContent = ivLabel(state.interval);
  $('.tb-type').innerHTML = TYPES.find((t) => t[0] === state.type)[2];
}

$('.tb').addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const act = b.dataset.act;
  if (act === 'menu') {
    openPop(b, `<div class="menu">
      <a href="/">${ICONS.mark}<span>Home</span></a><a href="/markets/">Markets</a><a href="/ideas/">Community ideas</a><a href="/brokers/">Brokers</a>
      <div class="menu-sep"></div><button data-v="dark">Dark theme</button><button data-v="reset">Reset chart</button></div>`, (v) => {
      if (v === 'dark') { document.body.classList.toggle('dark-ui'); closePop(); }
      if (v === 'reset') { localStorage.removeItem(LS); location.href = '/chart/'; }
    });
  } else if (act === 'symbol') {
    openSearch((s) => setSymbol(s));
  } else if (act === 'compare') {
    openSearch((s) => { if (!state.watchlist.includes(s)) { state.watchlist.push(s); persist(); renderWatchlist(); toast(`${s} added to watchlist`); } setSymbol(s); });
  } else if (act === 'interval') {
    openPop(b, `<div class="menu"><div class="menu-h">MINUTES</div>${['1', '5', '15'].map((k) => item(k)).join('')}<div class="menu-h">HOURS</div>${['60', '240'].map((k) => item(k)).join('')}<div class="menu-h">DAYS</div>${['D', 'W', 'M'].map((k) => item(k)).join('')}</div>`, (v) => { setInterval_(v); closePop(); });
    function item(k) { return `<button data-v="${k}" class="${k === state.interval ? 'on' : ''}">${INTERVALS[k].label}</button>`; }
  } else if (act === 'type') {
    openPop(b, `<div class="menu">${TYPES.map((t) => `<button data-v="${t[0]}" class="${t[0] === state.type ? 'on' : ''}">${t[2]}<span>${t[1]}</span></button>`).join('')}</div>`, (v) => {
      state.type = v; chart.setType(v); persist(); renderTop(); closePop();
    });
  } else if (act === 'indicators') {
    openIndicators();
  } else if (act === 'alert') {
    openAlert();
  } else if (act === 'replay') {
    startReplay();
  } else if (act === 'undo') { chart.undo(); saveDrawings(); }
  else if (act === 'redo') { chart.redo(); saveDrawings(); }
  else if (act === 'save') { saveDrawings(); persist(); toast('Chart layout saved'); }
  else if (act === 'layout') { toast('Single-chart layout'); }
  else if (act === 'settings') openSettings();
  else if (act === 'fullscreen') { const el = document.documentElement; if (document.fullscreenElement) document.exitFullscreen(); else el.requestFullscreen?.(); }
  else if (act === 'snapshot') {
    const a = document.createElement('a');
    a.href = chart.toDataURL(); a.download = `${state.symbol}_${ivLabel(state.interval)}.png`; a.click();
    toast('Snapshot saved');
  } else if (act === 'publish') { toast('Publishing ideas is not available in this demo'); }
});

// ---------- left toolbar ----------
const flags = { magnet: false, stay: false, lock: false, hide: false };
function setTool(t) {
  chart.setTool(t);
  document.querySelectorAll('.lt-btn[data-kind="tool"]').forEach((b) => b.classList.toggle('active', b.dataset.tool === t));
}
$('.lt').addEventListener('click', (e) => {
  const b = e.target.closest('.lt-btn');
  if (!b) return;
  const t = b.dataset.tool, kind = b.dataset.kind;
  if (kind === 'tool') {
    if (t === 'arrow') {
      openPop(b, `<div class="menu"><button data-v="arrow">▲ Arrow mark up</button><button data-v="arrowdown">▼ Arrow mark down</button></div>`, (v) => { setTool(v); b.classList.add('active'); closePop(); });
      return;
    }
    setTool(chart.tool === t && t !== 'cross' ? 'cross' : t);
    if (!state.tipDone) dismissTip();
  } else if (kind === 'toggle') {
    flags[t] = !flags[t];
    b.classList.toggle('on', flags[t]);
    chart.magnet = flags.magnet; chart.stayDrawing = flags.stay; chart.locked = flags.lock; chart.hidden = flags.hide;
    if (flags.lock && chart.selected) chart.selected = null;
    chart.requestDraw();
    toast(`${b.title}: ${flags[t] ? 'on' : 'off'}`);
  } else if (t === 'clear') {
    if (!chart.drawings.length) { toast('No drawings to remove'); return; }
    chart.clearDrawings(); saveDrawings(); toast('All drawings removed (Ctrl+Z to undo)');
  }
});
chart.on('toolDone', () => setTool('cross'));
chart.on('drawingsCommitted', () => saveDrawings());
chart.on('textprompt', (dr, p, editing) => {
  const wrap = $('.chart-wrap');
  const inp = document.createElement('input');
  inp.className = 'text-input';
  inp.value = editing ? dr.text : '';
  inp.placeholder = 'Add text';
  inp.style.left = p.x + 'px';
  inp.style.top = p.y - 14 + 'px';
  wrap.appendChild(inp);
  const born = Date.now();
  setTimeout(() => inp.focus(), 0);
  let done = false;
  const finish = (ok) => {
    if (done) return; done = true;
    const v = inp.value.trim();
    inp.remove();
    if (!ok || !v) { setTool('cross'); return; }
    if (editing) { chart.snapshotHistory(); dr.text = v; chart.requestDraw(); saveDrawings(); }
    else { dr.text = v; chart.commit(dr); }
  };
  inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') finish(true); if (e.key === 'Escape') finish(false); });
  inp.addEventListener('blur', () => { if (Date.now() - born < 400) { setTimeout(() => inp.focus(), 0); return; } finish(true); });
});

document.addEventListener('keydown', (e) => {
  if (e.target.matches('input, select, textarea')) return;
  if (document.querySelector('.site-search:not([hidden])')) return;
  if ((e.key === 'Delete' || e.key === 'Backspace') && chart.selected) { chart.removeSelected(); saveDrawings(); }
  else if (e.key === 'Escape') { chart.pending = null; chart.measure = null; setTool('cross'); closePop(); closeModal(); chart.requestDraw(); }
  else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) chart.redo(); else chart.undo(); saveDrawings(); }
  else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); chart.redo(); saveDrawings(); }
  else if (/^[a-z]$/i.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey && modal.hidden) { openSearch((s) => setSymbol(s)); }
});

// ---------- legend ----------
let hoverIdx = null;
chart.on('crosshair', (i) => { hoverIdx = i; renderLegendValues(); });

function renderLegend() {
  const info = BY_SYMBOL[state.symbol];
  $('.lg-logo').innerHTML = logoHTML(info, 18);
  $('.lg-name').innerHTML = `<span class="nm-full">${info.n}</span><span class="nm-meta"> · ${ivTitle(state.interval)} · ${info.ex}</span>`;
  $('.lg-session').hidden = info.type !== 'stock';
  renderIndicatorLegend();
  renderLegendValues();
}

function renderLegendValues() {
  const d = chart.data;
  if (!d.length) return;
  const i = hoverIdx != null && hoverIdx < d.length ? hoverIdx : d.length - 1;
  const b = d[i], prev = d[i - 1] || b;
  const dc = dec(state.symbol);
  const ch = b.c - prev.c, pct = (ch / prev.c) * 100;
  const cls = b.c >= b.o ? 'g' : 'r';
  const ohlc = `<span>O<b class="${cls}">${fmt(b.o, dc)}</b></span><span>H<b class="${cls}">${fmt(b.h, dc)}</b></span><span>L<b class="${cls}">${fmt(b.l, dc)}</b></span><span>C<b class="${cls}">${fmt(b.c, dc)}</b></span><b class="${ch >= 0 ? 'g' : 'r'}">${fmtSigned(ch, dc)} (${fmtSigned(pct, 2)}%)</b>`;
  $('.lg-ohlc').innerHTML = ohlc;
  $('.lg-ohlc2').innerHTML = ohlc;
  const qt = q(state.symbol);
  const spread = Math.max(Math.pow(10, -dc), qt.price * 0.0001);
  $('.lg-sell b').textContent = fmt(qt.price - spread / 2 + 0.001, dc);
  $('.lg-buy b').textContent = fmt(qt.price + spread / 2, dc);
  $('.lg-spread').textContent = spread.toFixed(dc);
  // indicator values
  document.querySelectorAll('[data-ind-val]').forEach((el) => {
    const ind = state.indicators.find((x) => x.id === el.dataset.indVal);
    if (!ind) return;
    const r = chart.results.get(ind.id) || {};
    const f = (v) => (v == null ? '∅' : fmt(v, ind.type === 'rsi' || ind.type === 'macd' ? 2 : dc));
    let html = '';
    if (ind.type === 'vol') html = `<b class="${cls === 'g' ? 'vg' : 'vr'}">${fmtVol(b.v).replace(' ', ' ')}</b>`;
    else if (ind.type === 'bb') html = `<b style="color:#ff6d00">${f(r.mid?.[i])}</b> <b style="color:#f23645">${f(r.up?.[i])}</b> <b style="color:#089981">${f(r.lo?.[i])}</b>`;
    else if (ind.type === 'macd') html = `<b style="color:${(r.hist?.[i] ?? 0) >= 0 ? '#26a69a' : '#ff5252'}">${f(r.hist?.[i])}</b> <b style="color:#2962ff">${f(r.line?.[i])}</b> <b style="color:#ff6d00">${f(r.signal?.[i])}</b>`;
    else html = `<b style="color:${ind.color}">${f(r.line?.[i])}</b>`;
    el.innerHTML = html;
  });
}

function indRow(ind) {
  const cat = CATALOG.find((c) => c.type === ind.type);
  const name = ind.type === 'vol' ? 'Vol' : `${cat.short} <span class="lg-par">${paramText(ind)}</span>`;
  return `<div class="lg-ind ${ind.visible === false ? 'off' : ''}" data-id="${ind.id}"><span class="lg-ind-name">${name}</span><span class="lg-ind-val" data-ind-val="${ind.id}"></span>
    <span class="lg-ind-act"><button data-a="eye" title="Hide">${I.eyeOpen}</button>${ind.type !== 'vol' ? `<button data-a="cfg" title="Settings">${I.gear}</button>` : ''}<button data-a="del" title="Remove">${I.close}</button></span></div>`;
}

function renderIndicatorLegend() {
  const main = state.indicators.filter((i) => i.pane !== 'sub');
  $('.lg-inds').innerHTML = main.map(indRow).join('');
  $('.lg-inds').hidden = !state.legendOpen;
  $('.lg-toggle').classList.toggle('closed', !state.legendOpen);
  // sub pane legends positioned from chart layout
  const subs = $('.sub-legends');
  subs.innerHTML = '';
  for (const pane of chart.panes || []) {
    if (pane.id === 'main') continue;
    const el = document.createElement('div');
    el.className = 'sub-legend';
    el.style.top = pane.top + 6 + 'px';
    el.innerHTML = indRow(pane.ind);
    subs.appendChild(el);
  }
  const hidden = state.indicators.filter((i) => i.pane === 'sub' && i.visible === false);
  if (hidden.length) {
    const el = document.createElement('div');
    el.className = 'sub-legend hidden-list';
    el.style.top = (chart.main ? chart.main.h - 30 : 0) + 'px';
    el.innerHTML = hidden.map(indRow).join('');
    subs.appendChild(el);
  }
  renderLegendValues();
}
chart.on('layout', () => { if (chart.panes) requestAnimationFrame(renderIndicatorLegend); });

function onIndAction(e) {
  const b = e.target.closest('button[data-a]');
  if (!b) return;
  const id = b.closest('[data-id]').dataset.id;
  const ind = state.indicators.find((x) => x.id === id);
  if (!ind) return;
  if (b.dataset.a === 'eye') ind.visible = ind.visible === false;
  if (b.dataset.a === 'del') state.indicators = state.indicators.filter((x) => x !== ind);
  if (b.dataset.a === 'cfg') { openIndSettings(ind); return; }
  applyIndicators();
}
$('.lg-inds').addEventListener('click', onIndAction);
$('.sub-legends').addEventListener('click', onIndAction);
$('.lg-toggle').addEventListener('click', () => { state.legendOpen = !state.legendOpen; persist(); renderIndicatorLegend(); });
$('.legend').addEventListener('click', (e) => { if (e.target.closest('[data-act="symbol"]')) openSearch((s) => setSymbol(s)); if (e.target.closest('[data-act="trade"]')) toast('Connect a broker to trade — see the Brokers page'); });

function applyIndicators() {
  chart.setIndicators(state.indicators.map((i) => ({ ...i })));
  // keep object identity for results lookups
  persist();
  renderIndicatorLegend();
}

function openIndicators() {
  const box = openModal(`<div class="md-head"><h2>Indicators</h2><button data-close aria-label="Close">${I.close}</button></div>
    <div class="md-search">${ICONS.search}<input placeholder="Search" aria-label="Search indicators"></div>
    <div class="md-body"><div class="md-side"><button class="on">Technicals</button><button disabled>Fundamentals</button><button disabled>Community</button></div>
    <ul class="md-list"></ul></div>`, 'ind-modal');
  const list = box.querySelector('.md-list');
  const draw = (qs = '') => {
    list.innerHTML = CATALOG.filter((c) => c.name.toLowerCase().includes(qs)).map((c) => {
      const n = state.indicators.filter((i) => i.type === c.type).length;
      return `<li><button data-type="${c.type}"><span class="md-n">${c.name}</span><span class="md-d">${c.desc}</span>${n ? `<span class="md-c">${n}</span>` : ''}</button></li>`;
    }).join('') || '<li class="md-empty">Nothing matches</li>';
  };
  draw();
  box.querySelector('input').addEventListener('input', (e) => draw(e.target.value.toLowerCase()));
  setTimeout(() => box.querySelector('input').focus(), 0);
  list.addEventListener('click', (e) => {
    const b = e.target.closest('[data-type]');
    if (!b) return;
    addIndicator(b.dataset.type);
    draw(box.querySelector('input').value.toLowerCase());
  });
}

function addIndicator(type) {
  const cat = CATALOG.find((c) => c.type === type);
  if (type === 'vol' && state.indicators.some((i) => i.type === 'vol')) { toast('Volume is already on the chart'); return; }
  const sameCount = state.indicators.filter((i) => i.type === 'sma' || i.type === 'ema').length;
  const params = { ...cat.params };
  if ((type === 'sma' || type === 'ema') && sameCount) params.length = [20, 50, 100, 200, 9, 30][sameCount % 6];
  state.indicators.push({ id: type + Date.now().toString(36) + Math.floor(Math.random() * 1e4), type, pane: cat.pane, params, visible: true, color: (type === 'sma' || type === 'ema') ? MA_COLORS[sameCount % MA_COLORS.length] : cat.color });
  applyIndicators();
  toast(`${cat.name} added`);
}

function openIndSettings(ind) {
  const cat = CATALOG.find((c) => c.type === ind.type);
  const box = openModal(`<div class="md-head"><h2>${cat.name}</h2><button data-close aria-label="Close">${I.close}</button></div>
    <form class="md-form">${Object.entries(ind.params).map(([k, v]) => `<label><span>${k[0].toUpperCase() + k.slice(1)}</span><input type="number" name="${k}" value="${v}" min="1" max="500" step="${k === 'mult' ? 0.1 : 1}"></label>`).join('')}
    ${ind.pane === 'main' && ind.type !== 'bb' ? `<label><span>Color</span><input type="color" name="__color" value="${ind.color}"></label>` : ''}
    <div class="md-actions"><button type="button" data-close class="btn-ghost">Cancel</button><button type="submit" class="btn-primary">Ok</button></div></form>`, 'small');
  box.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    for (const [k, v] of fd.entries()) { if (k === '__color') ind.color = v; else ind.params[k] = Math.max(k === 'mult' ? 0.1 : 1, Number(v) || 1); }
    closeModal();
    applyIndicators();
  });
}

function openSettings() {
  const box = openModal(`<div class="md-head"><h2>Chart settings</h2><button data-close aria-label="Close">${I.close}</button></div>
    <form class="md-form">
      <label><span>Up color</span><input type="color" name="up" value="${chart.colors.up}"></label>
      <label><span>Down color</span><input type="color" name="down" value="${chart.colors.down}"></label>
      <label class="chk"><input type="checkbox" name="grid" ${chart.showGrid ? 'checked' : ''}><span>Grid lines</span></label>
      <div class="md-actions"><button type="button" data-close class="btn-ghost">Cancel</button><button type="submit" class="btn-primary">Ok</button></div></form>`, 'small');
  box.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    chart.colors.up = f.up.value; chart.colors.down = f.down.value; chart.showGrid = f.grid.checked;
    chart.requestDraw(); closeModal();
  });
}

function openAlert() {
  const qt = q(state.symbol), dc = dec(state.symbol);
  const box = openModal(`<div class="md-head"><h2>Create alert on ${state.symbol}</h2><button data-close aria-label="Close">${I.close}</button></div>
    <form class="md-form"><label><span>Condition</span><select disabled><option>Crossing</option></select></label>
    <label><span>Price</span><input type="number" name="price" step="any" value="${(qt.price * 1.002).toFixed(dc)}"></label>
    <p class="md-note">You'll get a notification on this page when the price crosses this level.</p>
    <div class="md-actions"><button type="button" data-close class="btn-ghost">Cancel</button><button type="submit" class="btn-primary">Create</button></div></form>`, 'small');
  box.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const p = Number(e.target.price.value);
    if (p > 0) { chart.addAlert(p); toast(`Alert set at ${fmt(p, dc)}`); }
    closeModal();
  });
}
chart.on('alert', (a, price) => toast(`⏰ ${state.symbol} crossed ${fmt(a.price, dec(state.symbol))} (now ${fmt(price, dec(state.symbol))})`));

// ---------- replay ----------
let replayTimer = null;
function startReplay() {
  if (chart.limit != null) { exitReplay(); return; }
  chart.limit = Math.max(30, chart.bars.length - 120);
  chart.recompute();
  chart.scrollToEnd();
  $('.replay-bar').hidden = false;
  $('.tb-replay').classList.add('on');
  toast('Replay: press play or step forward');
}
function stepReplay() {
  if (chart.limit == null) return;
  if (chart.limit >= chart.bars.length) { exitReplay(); toast('Replay finished'); return; }
  chart.limit++;
  chart.recompute();
  if (chart.right < chart.limit + 2) chart.right = chart.limit + 2;
  chart.requestDraw();
  renderLegendValues();
}
function exitReplay() {
  clearInterval(replayTimer); replayTimer = null;
  if (chart.limit == null) return;
  chart.limit = null;
  chart.recompute();
  chart.scrollToEnd();
  $('.replay-bar').hidden = true;
  $('.tb-replay').classList.remove('on');
  $('.replay-bar [data-r="play"]').innerHTML = I.play;
}
$('.replay-bar').addEventListener('click', (e) => {
  const b = e.target.closest('[data-r]');
  if (!b) return;
  if (b.dataset.r === 'step') stepReplay();
  if (b.dataset.r === 'exit') exitReplay();
  if (b.dataset.r === 'play') {
    if (replayTimer) { clearInterval(replayTimer); replayTimer = null; b.innerHTML = I.play; }
    else { replayTimer = setInterval(stepReplay, Number($('.replay-bar select').value)); b.innerHTML = I.pause; }
  }
});

// ---------- bottom bar ----------
$('.bb-ranges').addEventListener('click', (e) => {
  const b = e.target.closest('[data-range]');
  if (b) {
    const r = RANGES.find((x) => x[0] === b.dataset.range);
    setInterval_(r[1], r[2]);
    document.querySelectorAll('.bb-ranges [data-range]').forEach((x) => x.classList.toggle('on', x === b));
  }
  if (e.target.closest('.bb-goto')) {
    openPop(e.target.closest('.bb-goto'), `<div class="menu"><button data-v="end">Go to latest bar</button><button data-v="start">Go to first bar</button></div>`, (v) => {
      if (v === 'end') chart.scrollToEnd(); else { chart.right = chart.plotW / chart.spacing - 2; chart.requestDraw(); }
      closePop();
    });
  }
});
$('.bb-daterange').addEventListener('click', (e) => {
  openPop(e.currentTarget, `<div class="menu">${RANGES.map((r) => `<button data-v="${r[0]}">${r[0]}</button>`).join('')}</div>`, (v) => {
    const r = RANGES.find((x) => x[0] === v); setInterval_(r[1], r[2]); closePop();
  });
});
$('.bb-adj').addEventListener('click', (e) => { e.currentTarget.classList.toggle('on'); toast('Dividend adjustment ' + (e.currentTarget.classList.contains('on') ? 'on' : 'off')); });
function tickClock() {
  const d = new Date();
  $('.bb-clock').textContent = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')} UTC`;
}

// scroll-to-end button
function updateScrollBtn() {
  const away = chart.right < chart.data.length - 2;
  $('.scroll-end').hidden = !away;
}
$('.scroll-end').addEventListener('click', () => chart.scrollToEnd());

// ---------- watchlist ----------
const ORDER = [['index', 'INDICES'], ['stock', 'STOCKS'], ['futures', 'FUTURES'], ['forex', 'FOREX'], ['crypto', 'CRYPTO'], ['bond', 'BONDS']];
let sortKey = null, sortDir = 1;
function rowVals(s) {
  const qt = q(s); const chg = qt.price - qt.prev;
  return { last: qt.price, chg, pct: (chg / qt.prev) * 100 };
}
function renderWatchlist() {
  const list = $('.wl-list');
  let html = '';
  for (const [type, label] of ORDER) {
    let syms = state.watchlist.filter((s) => BY_SYMBOL[s] && BY_SYMBOL[s].type === type);
    if (!syms.length) continue;
    if (sortKey) syms = [...syms].sort((a, b) => (sortKey === 's' ? a.localeCompare(b) : rowVals(a)[sortKey] - rowVals(b)[sortKey]) * sortDir);
    const col = state.collapsed[type];
    html += `<button class="wl-sec ${col ? 'collapsed' : ''}" data-sec="${type}">${I.chevDown}<span>${label}</span></button>`;
    if (col) continue;
    for (const s of syms) {
      const info = BY_SYMBOL[s];
      html += `<div class="wl-row" role="listitem" data-s="${s}" tabindex="0"><span class="wl-sym">${logoHTML(info, 18)}<b>${s}</b><i class="wl-dot ${info.type === 'stock' ? 'blue' : ''}"></i></span><span class="wl-last" data-f="last"></span><span class="wl-chg" data-f="chg"></span><span class="wl-pct" data-f="pct"></span><button class="wl-del" title="Remove from watchlist">${I.trash}</button></div>`;
    }
  }
  list.innerHTML = html || '<p class="wl-empty">Your watchlist is empty. Use + to add symbols.</p>';
  updateWatchValues();
  highlightRow();
}
function updateWatchValues() {
  document.querySelectorAll('.wl-row').forEach((row) => {
    const s = row.dataset.s; const v = rowVals(s); const dc = dec(s);
    const cls = v.chg >= 0 ? 'g' : 'r';
    const last = row.querySelector('[data-f="last"]');
    const nv = fmt(v.last, dc);
    if (last.textContent !== nv) {
      const was = parseFloat(last.textContent.replace(/,/g, ''));
      last.textContent = nv;
      if (!isNaN(was)) { last.classList.remove('flash-g', 'flash-r'); void last.offsetWidth; last.classList.add(v.last >= was ? 'flash-g' : 'flash-r'); }
    }
    const c = row.querySelector('[data-f="chg"]'); c.textContent = fmtSigned(v.chg, dc); c.className = 'wl-chg ' + cls;
    const p = row.querySelector('[data-f="pct"]'); p.textContent = fmtSigned(v.pct, 2) + '%'; p.className = 'wl-pct ' + cls;
  });
}
function highlightRow() {
  document.querySelectorAll('.wl-row').forEach((r) => r.classList.toggle('sel', r.dataset.s === state.symbol));
}
$('.wl-list').addEventListener('click', (e) => {
  const sec = e.target.closest('[data-sec]');
  if (sec) { state.collapsed[sec.dataset.sec] = !state.collapsed[sec.dataset.sec]; persist(); renderWatchlist(); return; }
  const row = e.target.closest('.wl-row');
  if (!row) return;
  if (e.target.closest('.wl-del')) {
    state.watchlist = state.watchlist.filter((s) => s !== row.dataset.s); persist(); renderWatchlist(); toast(`${row.dataset.s} removed`);
    return;
  }
  setSymbol(row.dataset.s);
});
$('.wl-list').addEventListener('keydown', (e) => {
  const row = e.target.closest('.wl-row'); if (!row) return;
  if (e.key === 'Enter') setSymbol(row.dataset.s);
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const rows = [...document.querySelectorAll('.wl-row')];
    const n = rows[rows.indexOf(row) + (e.key === 'ArrowDown' ? 1 : -1)];
    if (n) { n.focus(); setSymbol(n.dataset.s); }
  }
});
$('.wl-cols').addEventListener('click', (e) => {
  const b = e.target.closest('[data-sort]'); if (!b) return;
  if (sortKey === b.dataset.sort) { if (sortDir === 1) sortDir = -1; else { sortKey = null; sortDir = 1; } } else { sortKey = b.dataset.sort; sortDir = 1; }
  document.querySelectorAll('.wl-cols button').forEach((x) => x.dataset.dir = x.dataset.sort === sortKey ? (sortDir > 0 ? 'asc' : 'desc') : '');
  renderWatchlist();
});
$('.wl-head').addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (b && b.dataset.act === 'wl-add') {
    openSearch((s) => { if (!state.watchlist.includes(s)) { state.watchlist.push(s); persist(); renderWatchlist(); toast(`${s} added to watchlist`); } else toast(`${s} is already in your watchlist`); });
  } else if (b && b.dataset.act === 'wl-more') {
    openPop(b, `<div class="menu"><button data-v="reset">Reset watchlist</button><button data-v="clear">Clear list</button></div>`, (v) => {
      if (v === 'reset') state.watchlist = ['SPX', 'NDQ', 'DJI', 'VIX', 'DXY', 'AAPL', 'TSLA', 'NFLX', 'CL1!', 'GC1!', 'SI1!', 'EURUSD', 'GBPUSD', 'BTCUSD', 'ETHUSD'];
      if (v === 'clear') state.watchlist = [];
      persist(); renderWatchlist(); closePop();
    });
  } else if (b && b.dataset.act === 'wl-expand') {
    document.body.classList.toggle('wl-wide');
  } else if (e.target.closest('.wl-title')) {
    openPop(e.target.closest('.wl-title'), `<div class="menu"><div class="menu-h">LISTS</div><button class="on" data-v="x">Watchlist</button><button data-v="add">Add symbol…</button></div>`, (v) => {
      closePop(); if (v === 'add') $('[data-act="wl-add"]').click();
    });
  }
});

// symbol details
function renderDetail() {
  const s = state.symbol, info = BY_SYMBOL[s], qt = q(s), dc = dec(s);
  const chg = qt.price - qt.prev, pct = (chg / qt.prev) * 100;
  const echg = qt.ext - qt.price, epct = (echg / qt.price) * 100;
  const d = new Date();
  const hm = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  const avg = qt.vol * 1.12;
  const volPct = Math.min(100, (qt.vol / (qt.vol + avg)) * 100);
  const facts = {
    stock: `${info.n} (${s}) is a sample listing in this demo. Prices move randomly every second so you can try out the chart tools.`,
    index: `${info.n} tracks a simulated basket of large companies. Values here are generated for demonstration only.`,
    crypto: `${info.n} trades around the clock in this demo. The simulated feed updates once per second.`,
    futures: `${info.n} uses a continuous simulated contract. Data is illustrative and not delayed market data.`,
    forex: `${info.n} is a simulated currency pair quoted to ${dc} decimals.`,
    bond: `${info.n} is a simulated government bond yield.`,
  }[info.type];
  $('.wl-detail').innerHTML = `
    <div class="dt-head">${logoHTML(info, 24)}<b>${s}</b><span class="tb-flex"></span><button class="wl-ic" title="Show financials">${I.layout}</button><button class="wl-ic dt-chart" title="Open on chart">${I.edit}</button><button class="wl-ic" title="More">${I.dots}</button></div>
    <div class="dt-name">${info.n} ${I.extLink} <span class="dot">•</span> ${info.ex}</div>
    <div class="dt-sector">${info.sector ? `${info.sector} <span class="dot">•</span> ${info.ind}` : info.type[0].toUpperCase() + info.type.slice(1) + (info.type === 'index' ? ' • Benchmark' : '')}</div>
    <div class="dt-price"><b>${fmt(qt.price, dc)}</b><small>${info.cur === 'POINT' ? '' : info.cur}</small><span class="${chg >= 0 ? 'g' : 'r'}">${fmtSigned(chg, dc)}</span><span class="${chg >= 0 ? 'g' : 'r'}">${fmtSigned(pct, 2)}%</span></div>
    <div class="dt-upd">Last update at ${hm} GMT+0</div>
    ${info.type === 'stock' ? `<div class="dt-ext"><b>${fmt(qt.ext, dc)}</b><small>${info.cur}</small><span class="${echg >= 0 ? 'g' : 'r'}">${fmtSigned(echg, dc)}</span><span class="${echg >= 0 ? 'g' : 'r'}">${fmtSigned(epct, 2)}%</span></div>
    <div class="dt-sess">${I.moon} Post-market</div><div class="dt-upd">Last update at ${hm} GMT+0</div>` : ''}
    <div class="dt-vol"><div><span>Volume</span><b>${fmtVol(qt.vol)}</b></div><div class="r"><span>Avg. volume (30D)</span><b>${fmtVol(avg)}</b></div></div>
    <div class="dt-bar"><i style="width:${volPct}%"></i><i></i></div>
    <div class="dt-facts"><div class="dt-fh">${I.sparkle}<b>Key facts</b></div><p>${facts}</p><a href="/ideas/">Keep reading ›</a></div>`;
  $('.dt-chart').addEventListener('click', () => chart.scrollToEnd());
}

// right panel buttons
$('.rt').addEventListener('click', (e) => {
  const b = e.target.closest('.rt-btn');
  if (!b) return;
  const p = b.dataset.panel;
  if (p === 'watchlist') { document.body.classList.toggle('wl-closed'); b.classList.toggle('active', !document.body.classList.contains('wl-closed')); return; }
  if (p === 'alerts') {
    openPop(b, `<div class="menu wide"><div class="menu-h">ALERTS</div>${chart.alerts.length ? chart.alerts.map((a) => `<button data-v="${a.id}">${state.symbol} crossing ${fmt(a.price, dec(state.symbol))} <span>✕</span></button>`).join('') : '<p class="menu-p">No active alerts. Use Alert in the top bar to create one.</p>'}<button data-v="new" class="menu-blue">+ Create alert</button></div>`, (v) => {
      if (v === 'new') { closePop(); openAlert(); return; }
      chart.alerts = chart.alerts.filter((a) => String(a.id) !== v); chart.requestDraw(); closePop(); toast('Alert removed');
    }, 'left');
    return;
  }
  if (p === 'data') {
    openPop(b, `<div class="menu wide"><div class="menu-h">OBJECT TREE</div>${chart.drawings.length ? chart.drawings.map((d, k) => `<button data-v="${k}">${{ trend: 'Trend line', hline: 'Horizontal line', fib: 'Fib retracement', rect: 'Rectangle', brush: 'Brush', text: 'Text: ' + (d.text || ''), arrow: 'Arrow', range: 'Price range' }[d.type] || d.type}</button>`).join('') : '<p class="menu-p">No drawings on this chart yet.</p>'}</div>`, (v) => {
      chart.selected = chart.drawings[Number(v)]; chart.requestDraw(); closePop();
    }, 'left');
    return;
  }
  if (p === 'products') { location.href = '/markets/'; return; }
  if (p === 'ideas') { location.href = '/ideas/'; return; }
  toast(b.title + ' — not part of this demo');
});

// ---------- tip ----------
function showTip() {
  if (state.tipDone) return;
  $('.tip').hidden = false; $('.tip-dot').hidden = false;
}
function dismissTip() { state.tipDone = true; persist(); $('.tip').hidden = true; $('.tip-dot').hidden = true; }
$('.tip-ok').addEventListener('click', dismissTip);

// ---------- live ticking ----------
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
function tick() {
  for (const s of new Set([...state.watchlist, state.symbol])) {
    const info = BY_SYMBOL[s]; if (!info) continue;
    const qt = quotes[s];
    qt.price = Math.max(qt.price * 0.5, qt.price * (1 + gauss() * info.vol * 0.012));
    qt.ext = qt.ext * (1 + gauss() * info.vol * 0.006);
    qt.vol += Math.random() * qt.vol * 0.00005;
  }
  const qt = quotes[state.symbol];
  const bars = chart.bars;
  const last = bars[bars.length - 1];
  if (last) {
    const now = Math.floor(Date.now() / 1000);
    const iv = INTERVALS[state.interval].sec;
    const period = Math.floor(now / iv) * iv;
    const addV = last.v * 0.002 * Math.random();
    if (period > last.t) chart.updateLast({ t: period, o: last.c, h: Math.max(last.c, qt.price), l: Math.min(last.c, qt.price), c: qt.price, v: addV * 10 });
    else chart.updateLast({ t: last.t, o: last.o, h: Math.max(last.h, qt.price), l: Math.min(last.l, qt.price), c: qt.price, v: last.v + addV });
  }
  updateWatchValues();
  renderDetail();
  if (hoverIdx == null) renderLegendValues();
  tickClock();
  updateScrollBtn();
  document.title = `${state.symbol} ${fmt(qt.price, dec(state.symbol))} ${qt.price >= qt.prev ? '▲' : '▼'} ${fmtPct(((qt.price - qt.prev) / qt.prev) * 100)}`;
}

// ---------- boot ----------
chart.indicators = state.indicators.map((i) => ({ ...i }));
chart.type = state.type;
chart.layout();
renderWatchlist();
load(false);
applyIndicators();
setTool('cross');
tickClock();
showTip();
setInterval(tick, 1000);
setInterval(updateScrollBtn, 400);
