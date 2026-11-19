// Canvas chart engine: price/indicator panes, axes, crosshair, panning,
// zooming and drawing tools. Pure DOM + canvas, no libraries.
import { compute } from './indicators.js';

const AXIS_W = 60;
const TIME_H = 28;
const SUB_H_DESKTOP = 120;
const SUB_H_SMALL = 84;

const C = {
  bg: '#ffffff',
  grid: '#f3f3f3',
  text: '#131722',
  axisText: '#131722',
  sep: '#e0e3eb',
  up: '#089981',
  down: '#f23645',
  volUp: 'rgba(34,171,148,0.5)',
  volDown: 'rgba(247,82,95,0.5)',
  cross: '#9598a1',
  label: '#131722',
  select: '#2962ff',
};

const FIB = [
  [0, '#787b86'], [0.236, '#f23645'], [0.382, '#ff9800'], [0.5, '#4caf50'],
  [0.618, '#089981'], [0.786, '#00bcd4'], [1, '#787b86'],
];

function niceStep(range, target) {
  const raw = range / Math.max(1, target);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  const s = n < 1.5 ? 1 : n < 2.25 ? 2 : n < 3.5 ? 2.5 : n < 7.5 ? 5 : 10;
  return s * mag;
}

function priceDecimals(step) {
  if (step >= 50) return 0;
  if (step >= 1) return 2;
  return Math.min(8, Math.max(2, Math.ceil(-Math.log10(step)) + 1));
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function distToSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - x1) * dx + (py - y1) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  const x = x1 + t * dx, y = y1 + t * dy;
  return Math.hypot(px - x, py - y);
}

let uid = 1;

export class Chart {
  constructor(host, opts = {}) {
    this.host = host;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'chart-canvas';
    host.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.bars = [];
    this.ivSec = 86400;
    this.interval = 'D';
    this.type = 'candles';
    this.spacing = 7;
    this.right = 0;
    this.indicators = [];
    this.results = new Map();
    this.drawings = [];
    this.selected = null;
    this.tool = 'cross';
    this.magnet = false;
    this.stayDrawing = false;
    this.locked = false;
    this.hidden = false;
    this.showGrid = true;
    this.mouse = null;
    this.pending = null;
    this.measure = null;
    this.zoomBox = null;
    this.alerts = [];
    this.priceScale = { auto: true, min: 0, max: 1 };
    this.limit = null; // replay: number of bars visible
    this.history = [];
    this.future = [];
    this.listeners = {};
    this.colors = { up: C.up, down: C.down };
    this.watermark = opts.watermark || '';
    this._bind();
    this.resize();
    new ResizeObserver(() => this.resize()).observe(host);
  }

  on(ev, fn) { (this.listeners[ev] ||= []).push(fn); }
  emit(ev, ...a) { (this.listeners[ev] || []).forEach((f) => f(...a)); }

  // ---------- data ----------
  get data() { return this.limit != null ? this.bars.slice(0, this.limit) : this.bars; }

  setData(bars, interval, ivSec, keepView) {
    const prevRightOffset = this.bars.length ? this.right - (this.bars.length - 1) : null;
    this.bars = bars;
    this.interval = interval;
    this.ivSec = ivSec;
    this.recompute();
    if (!keepView || prevRightOffset == null) {
      this.spacing = this.w < 500 ? 8.5 : 6.6;
      this.right = bars.length - 1 + 4;
    }
    this.priceScale.auto = true;
    this.requestDraw();
  }

  recompute() {
    const d = this.data;
    this.results.clear();
    for (const ind of this.indicators) this.results.set(ind.id, compute(ind, d));
  }

  updateLast(bar) {
    const last = this.bars[this.bars.length - 1];
    if (!last) return;
    if (bar.t > last.t) this.bars.push(bar);
    else Object.assign(last, bar);
    const atEdge = this.limit == null;
    if (atEdge) {
      this.recompute();
      this.checkAlerts(bar.c);
      this.requestDraw();
    }
  }

  setIndicators(list) {
    this.indicators = list;
    this.recompute();
    this.layout();
    this.requestDraw();
  }

  setType(t) { this.type = t; this.requestDraw(); }

  t2i(t) { return this.bars.length ? (t - this.bars[0].t) / this.ivSec : 0; }
  i2t(i) { return this.bars.length ? this.bars[0].t + i * this.ivSec : 0; }

  // ---------- layout ----------
  resize() {
    const r = this.host.getBoundingClientRect();
    this.w = Math.max(50, Math.floor(r.width));
    this.h = Math.max(50, Math.floor(r.height));
    const dpr = window.devicePixelRatio || 1;
    this.dpr = dpr;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.layout();
    this.draw();
  }

  layout() {
    const subs = this.indicators.filter((i) => i.pane === 'sub' && i.visible !== false);
    const plotW = this.w - AXIS_W;
    const total = this.h - TIME_H;
    const subH = this.h < 600 ? SUB_H_SMALL : SUB_H_DESKTOP;
    const mainH = Math.max(80, total - subs.length * subH);
    this.plotW = plotW;
    this.panes = [{ id: 'main', top: 0, h: mainH, scale: this.priceScale }];
    let y = mainH;
    for (const s of subs) {
      const ph = (total - mainH) / subs.length;
      this.panes.push({ id: s.id, ind: s, top: y, h: ph, scale: { auto: true } });
      y += ph;
    }
    this.emit('layout', this.panes);
  }

  // ---------- coordinates ----------
  x(i) { return this.plotW - (this.right - i) * this.spacing; }
  idx(x) { return this.right - (this.plotW - x) / this.spacing; }
  yOf(p, pane) { const s = pane.scale; return pane.top + 6 + ((s.max - p) / (s.max - s.min)) * (pane.h - 12); }
  pOf(y, pane) { const s = pane.scale; return s.max - ((y - pane.top - 6) / (pane.h - 12)) * (s.max - s.min); }
  paneAt(y) { return this.panes.find((p) => y >= p.top && y < p.top + p.h) || null; }
  get main() { return this.panes[0]; }

  visibleRange() {
    const d = this.data;
    const from = Math.max(0, Math.floor(this.idx(0)));
    const to = Math.min(d.length - 1, Math.ceil(this.idx(this.plotW)));
    return [from, to];
  }

  clampView() {
    const n = this.data.length;
    this.spacing = Math.max(1.2, Math.min(60, this.spacing));
    const visBars = this.plotW / this.spacing;
    this.right = Math.min(this.right, n - 1 + visBars * 0.8);
    this.right = Math.max(this.right, Math.min(n - 1, 8));
  }

  setVisibleBars(count) {
    const n = this.data.length;
    this.spacing = Math.max(1.2, Math.min(60, (this.plotW - 30) / Math.max(5, Math.min(count, n))));
    this.right = n - 1 + 30 / this.spacing;
    this.priceScale.auto = true;
    this.requestDraw();
  }

  scrollToEnd() {
    this.right = this.data.length - 1 + 4;
    this.requestDraw();
  }

  // ---------- scales ----------
  autoscale() {
    const [from, to] = this.visibleRange();
    const d = this.data;
    for (const pane of this.panes) {
      if (!pane.scale.auto) continue;
      let lo = Infinity, hi = -Infinity;
      if (pane.id === 'main') {
        for (let i = from; i <= to; i++) { const b = d[i]; if (!b) continue; if (b.l < lo) lo = b.l; if (b.h > hi) hi = b.h; }
        for (const ind of this.indicators) {
          if (ind.pane !== 'main' || ind.visible === false) continue;
          const r = this.results.get(ind.id) || {};
          for (const key of ['line', 'up', 'lo']) {
            const arr = r[key]; if (!arr) continue;
            for (let i = from; i <= to; i++) { const v = arr[i]; if (v == null) continue; if (v < lo) lo = v; if (v > hi) hi = v; }
          }
        }
        if (!isFinite(lo)) { lo = 0; hi = 1; }
        const span = hi - lo || hi * 0.01 || 1;
        const volOn = this.indicators.some((i) => i.type === 'vol' && i.visible !== false);
        pane.scale.min = lo - span * (volOn ? 0.16 : 0.08);
        pane.scale.max = hi + span * 0.08;
      } else {
        const ind = pane.ind;
        const r = this.results.get(ind.id) || {};
        if (ind.type === 'rsi') { pane.scale.min = 0; pane.scale.max = 100; continue; }
        for (const key of ['line', 'signal', 'hist']) {
          const arr = r[key]; if (!arr) continue;
          for (let i = from; i <= to; i++) { const v = arr[i]; if (v == null) continue; if (v < lo) lo = v; if (v > hi) hi = v; }
        }
        if (!isFinite(lo)) { lo = -1; hi = 1; }
        const span = hi - lo || 1;
        pane.scale.min = lo - span * 0.1;
        pane.scale.max = hi + span * 0.1;
      }
    }
  }

  // ---------- drawing ----------
  requestDraw() {
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => { this._raf = 0; this.draw(); });
  }

  draw() {
    const ctx = this.ctx;
    if (!this.panes) return;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, this.w, this.h);
    if (!this.bars.length) return;
    this.clampView();
    this.autoscale();
    const [from, to] = this.visibleRange();
    const ticks = this.timeTicks();

    for (const pane of this.panes) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, pane.top, this.plotW, pane.h);
      ctx.clip();
      if (this.showGrid) this.drawGrid(pane, ticks);
      if (pane.id === 'main') this.drawMain(from, to);
      else this.drawSub(pane, from, to);
      ctx.restore();
      if (pane.top > 0) {
        ctx.fillStyle = C.sep;
        ctx.fillRect(0, pane.top, this.w, 1);
      }
      this.drawPriceAxis(pane);
    }
    this.drawTimeAxis(ticks);
    this.drawCrosshair();
  }

  drawGrid(pane, ticks) {
    const ctx = this.ctx;
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const t of ticks) { const x = Math.round(t.x) + 0.5; ctx.moveTo(x, pane.top); ctx.lineTo(x, pane.top + pane.h); }
    for (const p of this.priceTicks(pane)) { const y = Math.round(this.yOf(p, pane)) + 0.5; ctx.moveTo(0, y); ctx.lineTo(this.plotW, y); }
    ctx.stroke();
  }

  drawMain(from, to) {
    const ctx = this.ctx;
    const pane = this.main;
    const d = this.data;
    const sp = this.spacing;
    const bw = Math.max(1, Math.floor(sp * 0.7)) | 0;
    const volInd = this.indicators.find((i) => i.type === 'vol' && i.visible !== false);
    // watermark
    if (this.watermark) {
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.fillStyle = '#000';
      ctx.font = `700 ${Math.min(64, this.plotW / 9)}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(this.watermark, this.plotW / 2, pane.top + pane.h / 2);
      ctx.restore();
    }
    // volume
    if (volInd) {
      let vmax = 0;
      for (let i = from; i <= to; i++) if (d[i] && d[i].v > vmax) vmax = d[i].v;
      const vh = pane.h * 0.2;
      for (let i = from; i <= to; i++) {
        const b = d[i]; if (!b) continue;
        const h = (b.v / (vmax || 1)) * vh;
        const x = Math.round(this.x(i) - bw / 2);
        ctx.fillStyle = b.c >= b.o ? C.volUp : C.volDown;
        ctx.fillRect(x, pane.top + pane.h - h, Math.max(1, bw), h);
      }
    }
    // series
    let src = d;
    if (this.type === 'heikin') src = this.heikin(d);
    if (this.type === 'line' || this.type === 'area') {
      ctx.beginPath();
      let first = true, fx = 0;
      for (let i = Math.max(0, from - 1); i <= Math.min(d.length - 1, to + 1); i++) {
        const x = this.x(i), y = this.yOf(d[i].c, pane);
        if (first) { ctx.moveTo(x, y); fx = x; first = false; } else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#2962ff';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (this.type === 'area') {
        const lx = this.x(Math.min(d.length - 1, to + 1));
        ctx.lineTo(lx, pane.top + pane.h); ctx.lineTo(fx, pane.top + pane.h); ctx.closePath();
        const g = ctx.createLinearGradient(0, pane.top, 0, pane.top + pane.h);
        g.addColorStop(0, 'rgba(41,98,255,0.28)'); g.addColorStop(1, 'rgba(41,98,255,0.02)');
        ctx.fillStyle = g; ctx.fill();
      }
      ctx.lineWidth = 1;
    } else {
      for (let i = from; i <= to; i++) {
        const b = src[i]; if (!b) continue;
        const up = b.c >= b.o;
        const col = up ? this.colors.up : this.colors.down;
        const x = Math.round(this.x(i));
        const yo = this.yOf(b.o, pane), yc = this.yOf(b.c, pane), yh = this.yOf(b.h, pane), yl = this.yOf(b.l, pane);
        ctx.fillStyle = col;
        if (this.type === 'bars') {
          ctx.fillRect(x, Math.round(yh), 1, Math.max(1, Math.round(yl - yh)));
          const tw = Math.max(1, Math.floor(bw / 2));
          ctx.fillRect(x - tw, Math.round(yo), tw, 1);
          ctx.fillRect(x + 1, Math.round(yc), tw, 1);
          continue;
        }
        ctx.fillRect(x, Math.round(yh), 1, Math.max(1, Math.round(yl - yh)));
        const top = Math.round(Math.min(yo, yc));
        const hh = Math.max(1, Math.round(Math.abs(yc - yo)));
        const left = x - Math.floor(bw / 2);
        if (this.type === 'hollow' && up) {
          ctx.fillStyle = C.bg;
          ctx.fillRect(left, top, bw, hh);
          ctx.strokeStyle = col;
          ctx.strokeRect(left + 0.5, top + 0.5, bw - 1, hh - 1);
        } else {
          ctx.fillRect(left, top, bw, hh);
        }
      }
    }
    // overlays
    for (const ind of this.indicators) {
      if (ind.pane !== 'main' || ind.visible === false) continue;
      const r = this.results.get(ind.id) || {};
      if (ind.type === 'bb') {
        this.fillBand(r.up, r.lo, from, to, pane, 'rgba(41,98,255,0.06)');
        this.line(r.up, from, to, pane, '#f23645');
        this.line(r.lo, from, to, pane, '#089981');
        this.line(r.mid, from, to, pane, '#ff6d00');
      } else {
        this.line(r.line, from, to, pane, ind.color, 1.5);
      }
    }
    // last price line
    const last = d[d.length - 1];
    if (last) {
      const y = Math.round(this.yOf(last.c, pane)) + 0.5;
      ctx.setLineDash([1, 2]);
      ctx.strokeStyle = last.c >= last.o ? this.colors.up : this.colors.down;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.plotW, y); ctx.stroke();
      ctx.setLineDash([]);
    }
    // alerts
    for (const a of this.alerts) {
      const y = Math.round(this.yOf(a.price, pane)) + 0.5;
      ctx.strokeStyle = '#ff9800'; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.plotW, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ff9800'; ctx.font = '11px ' + getComputedStyle(document.body).fontFamily;
      ctx.fillText('⏰ Alert', 6, y - 4);
    }
    if (!this.hidden) {
      for (const dr of this.drawings) this.drawDrawing(dr, dr === this.selected);
      if (this.pending) this.drawDrawing(this.pending, true);
    }
    if (this.measure) this.drawMeasure(this.measure);
    if (this.zoomBox) {
      const z = this.zoomBox;
      ctx.fillStyle = 'rgba(41,98,255,0.12)';
      ctx.fillRect(Math.min(z.x1, z.x2), 0, Math.abs(z.x2 - z.x1), pane.h);
    }
  }

  heikin(d) {
    const out = [];
    let po = d[0] ? d[0].o : 0, pc = d[0] ? d[0].c : 0;
    for (const b of d) {
      const c = (b.o + b.h + b.l + b.c) / 4;
      const o = (po + pc) / 2;
      out.push({ o, c, h: Math.max(b.h, o, c), l: Math.min(b.l, o, c), v: b.v, t: b.t });
      po = o; pc = c;
    }
    return out;
  }

  line(arr, from, to, pane, color, width = 1) {
    if (!arr) return;
    const ctx = this.ctx;
    ctx.beginPath();
    let started = false;
    for (let i = Math.max(0, from - 1); i <= Math.min(arr.length - 1, to + 1); i++) {
      const v = arr[i];
      if (v == null) { started = false; continue; }
      const x = this.x(i), y = this.yOf(v, pane);
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke(); ctx.lineWidth = 1;
  }

  fillBand(a, b, from, to, pane, color) {
    if (!a || !b) return;
    const ctx = this.ctx;
    const idx = [];
    for (let i = Math.max(0, from - 1); i <= Math.min(a.length - 1, to + 1); i++) if (a[i] != null && b[i] != null) idx.push(i);
    if (idx.length < 2) return;
    ctx.beginPath();
    idx.forEach((i, k) => (k ? ctx.lineTo(this.x(i), this.yOf(a[i], pane)) : ctx.moveTo(this.x(i), this.yOf(a[i], pane))));
    for (let k = idx.length - 1; k >= 0; k--) ctx.lineTo(this.x(idx[k]), this.yOf(b[idx[k]], pane));
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  }

  drawSub(pane, from, to) {
    const ctx = this.ctx;
    const ind = pane.ind;
    const r = this.results.get(ind.id) || {};
    if (ind.type === 'rsi') {
      const y70 = this.yOf(70, pane), y30 = this.yOf(30, pane);
      ctx.fillStyle = 'rgba(126,87,194,0.08)';
      ctx.fillRect(0, y70, this.plotW, y30 - y70);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = '#787b86';
      ctx.beginPath(); ctx.moveTo(0, y70); ctx.lineTo(this.plotW, y70); ctx.moveTo(0, y30); ctx.lineTo(this.plotW, y30); ctx.stroke();
      ctx.setLineDash([]);
      this.line(r.line, from, to, pane, ind.color || '#7e57c2', 1.5);
    } else if (ind.type === 'macd') {
      const y0 = this.yOf(0, pane);
      const bw = Math.max(1, Math.floor(this.spacing * 0.6));
      for (let i = from; i <= to; i++) {
        const v = r.hist && r.hist[i]; if (v == null) continue;
        const prev = r.hist[i - 1] ?? v;
        ctx.fillStyle = v >= 0 ? (v >= prev ? '#26a69a' : '#b2dfdb') : (v <= prev ? '#ff5252' : '#ffcdd2');
        const y = this.yOf(v, pane);
        ctx.fillRect(Math.round(this.x(i) - bw / 2), Math.min(y, y0), bw, Math.max(1, Math.abs(y - y0)));
      }
      this.line(r.line, from, to, pane, '#2962ff', 1.5);
      this.line(r.signal, from, to, pane, '#ff6d00', 1.5);
    }
  }

  priceTicks(pane) {
    const s = pane.scale;
    const target = Math.max(2, Math.floor(pane.h / 32));
    const step = niceStep(s.max - s.min, target);
    pane._step = step;
    const out = [];
    for (let p = Math.ceil(s.min / step) * step; p <= s.max; p += step) out.push(p);
    return out;
  }

  fmtPrice(p, pane) {
    const step = pane && pane._step ? pane._step : Math.abs(p) / 1000;
    const dec = pane && pane.id !== 'main' ? 2 : priceDecimals(step);
    return p.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: false });
  }

  drawPriceAxis(pane) {
    const ctx = this.ctx;
    const x0 = this.plotW;
    ctx.fillStyle = C.bg;
    ctx.fillRect(x0, pane.top + (pane.top ? 1 : 0), AXIS_W, pane.h - (pane.top ? 1 : 0));
    ctx.fillStyle = C.sep;
    ctx.fillRect(x0, pane.top, 1, pane.h);
    ctx.font = '12px ' + getComputedStyle(document.body).fontFamily;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = C.axisText;
    for (const p of this.priceTicks(pane)) {
      const y = this.yOf(p, pane);
      if (y < pane.top + 8 || y > pane.top + pane.h - 8) continue;
      ctx.fillText(this.fmtPrice(p, pane), x0 + 8, y);
    }
    if (pane.id === 'main') {
      const d = this.data;
      const last = d[d.length - 1];
      if (last) {
        const col = last.c >= last.o ? this.colors.up : this.colors.down;
        this.axisLabel(this.yOf(last.c, pane), this.fmtPrice(last.c, pane), col, pane);
        const volInd = this.indicators.find((i) => i.type === 'vol' && i.visible !== false);
        if (volInd) this.axisLabel(pane.top + pane.h - 14, this.compact(last.v), last.c >= last.o ? '#22ab94' : '#f7525f', pane);
      }
      if (!this.hidden) {
        for (const dr of this.drawings) {
          if (dr.type === 'hline') this.axisLabel(this.yOf(dr.p[0].price, pane), this.fmtPrice(dr.p[0].price, pane), dr.color || '#2962ff', pane);
        }
      }
      for (const a of this.alerts) this.axisLabel(this.yOf(a.price, pane), this.fmtPrice(a.price, pane), '#ff9800', pane);
    } else {
      const r = this.results.get(pane.ind.id) || {};
      const d = this.data;
      const v = r.line && r.line[d.length - 1];
      if (v != null) this.axisLabel(this.yOf(v, pane), this.fmtPrice(v, pane), pane.ind.type === 'rsi' ? '#7e57c2' : '#2962ff', pane);
    }
  }

  compact(v) {
    if (v >= 1e9) return (v / 1e9).toFixed(1) + ' B';
    if (v >= 1e6) return (v / 1e6).toFixed(1) + ' M';
    if (v >= 1e3) return (v / 1e3).toFixed(1) + ' K';
    return v.toFixed(0);
  }

  axisLabel(y, text, bg, pane) {
    if (y < pane.top || y > pane.top + pane.h) return;
    const ctx = this.ctx;
    const h = 18;
    ctx.fillStyle = bg;
    ctx.fillRect(this.plotW + 1, Math.round(y - h / 2), AXIS_W - 2, h);
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.font = '12px ' + getComputedStyle(document.body).fontFamily;
    ctx.fillText(text, this.plotW + 8, y);
  }

  timeTicks() {
    const out = [];
    if (!this.bars.length) return out;
    const minPx = 90;
    const span = (minPx / this.spacing) * this.ivSec;
    const from = Math.floor(this.idx(0)), to = Math.ceil(this.idx(this.plotW));
    let keyOf;
    if (span < 86400 * 0.95 && this.ivSec < 86400) {
      const opts = [300, 900, 1800, 3600, 7200, 10800, 14400, 21600, 43200, 86400];
      const st = opts.find((o) => o >= span) || 86400;
      keyOf = (t) => Math.floor(t / st);
    } else if (span < 86400 * 20) {
      const opts = [1, 2, 3, 5, 7, 10, 14];
      const st = opts.find((o) => o * 86400 >= span) || 14;
      keyOf = (t) => { const d = new Date(t * 1000); return d.getUTCFullYear() * 1000 + d.getUTCMonth() * 40 + Math.floor((d.getUTCDate() - 1) / st); };
    } else {
      const opts = [1, 2, 3, 6, 12, 24, 60];
      const st = opts.find((o) => o * 86400 * 30 >= span) || 60;
      keyOf = (t) => { const d = new Date(t * 1000); return Math.floor((d.getUTCFullYear() * 12 + d.getUTCMonth()) / st); };
    }
    let prev = null, prevT = null, lastX = -Infinity;
    for (let i = from - 1; i <= to; i++) {
      const t = this.i2t(i);
      const key = keyOf(t);
      if (prev !== null && key !== prev) {
        const x = this.x(i);
        const label = this.timeLabel(t, prevT);
        const rank = /^\d{4}$/.test(label) ? 3 : /^[A-Z]/.test(label) ? 2 : label.includes(':') ? 0 : 1;
        if (x - lastX >= minPx * 0.7) { out.push({ x, i, label, rank }); lastX = x; }
        else if (out.length && rank > out[out.length - 1].rank) { out[out.length - 1] = { x, i, label, rank }; lastX = x; }
      }
      prev = key; prevT = t;
    }
    return out;
  }

  timeLabel(t, prevT) {
    const d = new Date(t * 1000);
    const p = new Date((prevT ?? t - this.ivSec) * 1000);
    if (d.getUTCFullYear() !== p.getUTCFullYear()) return String(d.getUTCFullYear());
    if (d.getUTCMonth() !== p.getUTCMonth()) return MONTHS[d.getUTCMonth()];
    if (d.getUTCDate() !== p.getUTCDate()) return String(d.getUTCDate());
    return String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0');
  }

  fullTime(t) {
    const d = new Date(t * 1000);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let s = `${days[d.getUTCDay()]} ${String(d.getUTCDate()).padStart(2, '0')} ${MONTHS[d.getUTCMonth()]} '${String(d.getUTCFullYear()).slice(2)}`;
    if (this.ivSec < 86400) s += '  ' + String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0');
    return s;
  }

  drawTimeAxis(ticks) {
    const ctx = this.ctx;
    const y0 = this.h - TIME_H;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, y0, this.w, TIME_H);
    ctx.fillStyle = C.sep;
    ctx.fillRect(0, y0, this.w, 1);
    ctx.font = '12px ' + getComputedStyle(document.body).fontFamily;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = C.axisText;
    for (const t of ticks) if (t.x > 10 && t.x < this.plotW - 10) ctx.fillText(t.label, t.x, y0 + TIME_H / 2);
  }

  drawCrosshair() {
    const m = this.mouse;
    if (!m || m.x > this.plotW || m.y > this.h - TIME_H) return;
    const ctx = this.ctx;
    const i = Math.round(this.idx(m.x));
    const x = Math.round(this.x(i)) + 0.5;
    const y = Math.round(m.y) + 0.5;
    ctx.strokeStyle = C.cross;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, 0); ctx.lineTo(x, this.h - TIME_H);
    if (this.tool !== 'brush') { ctx.moveTo(0, y); ctx.lineTo(this.plotW, y); }
    ctx.stroke();
    ctx.setLineDash([]);
    const pane = this.paneAt(m.y);
    if (pane) {
      const p = this.magnetPrice(i, this.pOf(m.y, pane), pane);
      this.axisLabel(m.snapY ?? m.y, this.fmtPrice(pane.id === 'main' ? p : this.pOf(m.y, pane), pane), C.label, pane);
    }
    const label = this.fullTime(this.i2t(i));
    ctx.font = '12px ' + getComputedStyle(document.body).fontFamily;
    const tw = ctx.measureText(label).width + 16;
    const lx = Math.max(0, Math.min(this.plotW - tw, x - tw / 2));
    ctx.fillStyle = C.label;
    ctx.fillRect(lx, this.h - TIME_H + 1, tw, TIME_H - 2);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, lx + tw / 2, this.h - TIME_H / 2);
  }

  magnetPrice(i, price, pane) {
    if (!this.magnet || !pane || pane.id !== 'main') return price;
    const b = this.data[i];
    if (!b) return price;
    let best = price, bd = Infinity;
    for (const v of [b.o, b.h, b.l, b.c]) {
      const dy = Math.abs(this.yOf(v, pane) - this.yOf(price, pane));
      if (dy < bd) { bd = dy; best = v; }
    }
    return bd < 40 ? best : price;
  }

  // ---------- drawings ----------
  pt(dp) { return { x: this.x(this.t2i(dp.t)), y: this.yOf(dp.price, this.main) }; }

  drawDrawing(dr, sel) {
    const ctx = this.ctx;
    const col = dr.color || '#2962ff';
    ctx.strokeStyle = col;
    ctx.fillStyle = col;
    ctx.lineWidth = dr.type === 'brush' ? 2 : 1.5;
    const P = dr.p.map((p) => this.pt(p));
    const font = getComputedStyle(document.body).fontFamily;
    switch (dr.type) {
      case 'trend': case 'ray': {
        let [a, b] = P;
        let bx = b.x, by = b.y;
        if (dr.type === 'ray' && (b.x !== a.x || b.y !== a.y)) { const k = 4000 / Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)); bx = a.x + (b.x - a.x) * k; by = a.y + (b.y - a.y) * k; }
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(bx, by); ctx.stroke();
        break;
      }
      case 'hline': {
        ctx.beginPath(); ctx.moveTo(0, P[0].y); ctx.lineTo(this.plotW, P[0].y); ctx.stroke();
        break;
      }
      case 'vline': {
        ctx.beginPath(); ctx.moveTo(P[0].x, 0); ctx.lineTo(P[0].x, this.main.h); ctx.stroke();
        break;
      }
      case 'rect': {
        const [a, b] = P;
        ctx.fillStyle = 'rgba(41,98,255,0.14)';
        ctx.fillRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
        ctx.strokeRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
        break;
      }
      case 'fib': {
        const [a, b] = P;
        const x1 = Math.min(a.x, b.x), x2 = Math.max(a.x, b.x) + 120;
        ctx.font = '11px ' + font;
        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'left';
        FIB.forEach(([lv, c], k) => {
          const price = dr.p[1].price + (dr.p[0].price - dr.p[1].price) * lv;
          const y = this.yOf(price, this.main);
          if (k < FIB.length - 1) {
            const price2 = dr.p[1].price + (dr.p[0].price - dr.p[1].price) * FIB[k + 1][0];
            const y2 = this.yOf(price2, this.main);
            ctx.fillStyle = c + '22';
            ctx.fillRect(x1, Math.min(y, y2), x2 - x1, Math.abs(y2 - y));
          }
          ctx.strokeStyle = c;
          ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
          ctx.fillStyle = c;
          ctx.fillText(`${lv} (${this.fmtPrice(price, this.main)})`, x1 + 4, y - 2);
        });
        ctx.setLineDash([4, 4]); ctx.strokeStyle = '#787b86';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]);
        break;
      }
      case 'brush': {
        ctx.beginPath();
        P.forEach((p, k) => (k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.stroke();
        break;
      }
      case 'text': {
        ctx.font = '14px ' + font;
        ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
        ctx.fillText(dr.text || 'Text', P[0].x, P[0].y);
        if (sel) { const w = ctx.measureText(dr.text || 'Text').width; ctx.strokeRect(P[0].x - 3, P[0].y - 11, w + 6, 22); }
        break;
      }
      case 'arrow': {
        const { x, y } = P[0];
        const upA = dr.dir !== 'down';
        ctx.fillStyle = upA ? '#089981' : '#f23645';
        ctx.beginPath();
        if (upA) { ctx.moveTo(x, y); ctx.lineTo(x - 9, y + 12); ctx.lineTo(x - 4, y + 12); ctx.lineTo(x - 4, y + 24); ctx.lineTo(x + 4, y + 24); ctx.lineTo(x + 4, y + 12); ctx.lineTo(x + 9, y + 12); }
        else { ctx.moveTo(x, y); ctx.lineTo(x - 9, y - 12); ctx.lineTo(x - 4, y - 12); ctx.lineTo(x - 4, y - 24); ctx.lineTo(x + 4, y - 24); ctx.lineTo(x + 4, y - 12); ctx.lineTo(x + 9, y - 12); }
        ctx.closePath(); ctx.fill();
        break;
      }
      case 'range': {
        this.drawMeasure({ a: dr.p[0], b: dr.p[1] }, true);
        break;
      }
    }
    ctx.lineWidth = 1;
    if (sel && dr.type !== 'brush') {
      for (const p of P) {
        ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = C.select; ctx.lineWidth = 1.5; ctx.stroke(); ctx.lineWidth = 1;
      }
    }
  }

  drawMeasure(m, persistent) {
    const ctx = this.ctx;
    const a = this.pt(m.a), b = this.pt(m.b);
    const up = m.b.price >= m.a.price;
    ctx.fillStyle = up ? 'rgba(41,98,255,0.16)' : 'rgba(242,54,69,0.16)';
    ctx.fillRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    ctx.strokeStyle = up ? '#2962ff' : '#f23645';
    ctx.beginPath();
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    ctx.moveTo(mx, a.y); ctx.lineTo(mx, b.y); ctx.moveTo(a.x, my); ctx.lineTo(b.x, my); ctx.stroke();
    const dp = m.b.price - m.a.price;
    const pct = (dp / m.a.price) * 100;
    const bars = Math.round(this.t2i(m.b.t) - this.t2i(m.a.t));
    const txt1 = `${this.fmtPrice(dp, this.main)} (${pct.toFixed(2)}%)`;
    const txt2 = `${bars} bars${persistent ? '' : ''}`;
    ctx.font = '12px ' + getComputedStyle(document.body).fontFamily;
    const w = Math.max(ctx.measureText(txt1).width, ctx.measureText(txt2).width) + 16;
    const ly = up ? Math.min(a.y, b.y) - 46 : Math.max(a.y, b.y) + 6;
    ctx.fillStyle = up ? '#2962ff' : '#f23645';
    ctx.fillRect(mx - w / 2, ly, w, 40);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(txt1, mx, ly + 12); ctx.fillText(txt2, mx, ly + 28);
  }

  hitTest(x, y) {
    if (this.hidden || this.locked) return null;
    for (let k = this.drawings.length - 1; k >= 0; k--) {
      const dr = this.drawings[k];
      const P = dr.p.map((p) => this.pt(p));
      for (let h = 0; h < P.length && dr.type !== 'brush'; h++) {
        if (Math.hypot(P[h].x - x, P[h].y - y) < 8) return { dr, handle: h };
      }
      let d = Infinity;
      switch (dr.type) {
        case 'trend': case 'ray': d = distToSeg(x, y, P[0].x, P[0].y, P[1].x, P[1].y); break;
        case 'hline': d = Math.abs(y - P[0].y); break;
        case 'vline': d = Math.abs(x - P[0].x); break;
        case 'rect': case 'range': case 'fib': {
          const x1 = Math.min(P[0].x, P[1].x), x2 = Math.max(P[0].x, P[1].x) + (dr.type === 'fib' ? 120 : 0);
          const y1 = Math.min(P[0].y, P[1].y), y2 = Math.max(P[0].y, P[1].y);
          d = x >= x1 - 4 && x <= x2 + 4 && y >= y1 - 4 && y <= y2 + 4 ? 0 : Infinity; break;
        }
        case 'brush': for (let i = 1; i < P.length; i++) d = Math.min(d, distToSeg(x, y, P[i - 1].x, P[i - 1].y, P[i].x, P[i].y)); break;
        case 'text': d = x >= P[0].x - 4 && x <= P[0].x + 8 * (dr.text || '').length + 8 && Math.abs(y - P[0].y) < 12 ? 0 : Infinity; break;
        case 'arrow': d = Math.abs(x - P[0].x) < 10 && Math.abs(y - P[0].y) < 26 ? 0 : Infinity; break;
      }
      if (d < 6) return { dr, handle: -1 };
    }
    return null;
  }

  snapshotHistory() {
    this.history.push(JSON.stringify(this.drawings));
    if (this.history.length > 100) this.history.shift();
    this.future = [];
  }
  undo() {
    if (!this.history.length) return;
    this.future.push(JSON.stringify(this.drawings));
    this.drawings = JSON.parse(this.history.pop());
    this.selected = null;
    this.emit('drawings');
    this.requestDraw();
  }
  redo() {
    if (!this.future.length) return;
    this.history.push(JSON.stringify(this.drawings));
    this.drawings = JSON.parse(this.future.pop());
    this.selected = null;
    this.emit('drawings');
    this.requestDraw();
  }
  removeSelected() {
    if (!this.selected) return;
    this.snapshotHistory();
    this.drawings = this.drawings.filter((d) => d !== this.selected);
    this.selected = null;
    this.emit('drawings');
    this.requestDraw();
  }
  clearDrawings() {
    if (!this.drawings.length) return;
    this.snapshotHistory();
    this.drawings = [];
    this.selected = null;
    this.emit('drawings');
    this.requestDraw();
  }
  setTool(t) {
    this.tool = t;
    this.pending = null;
    this.measure = null;
    this.canvas.style.cursor = t === 'cross' ? 'crosshair' : 'crosshair';
    this.requestDraw();
  }

  addAlert(price) { this.alerts.push({ id: uid++, price, above: this.data[this.data.length - 1].c < price }); this.requestDraw(); }
  checkAlerts(price) {
    for (const a of [...this.alerts]) {
      if ((a.above && price >= a.price) || (!a.above && price <= a.price)) {
        this.alerts = this.alerts.filter((x) => x !== a);
        this.emit('alert', a, price);
      }
    }
  }

  // ---------- input ----------
  local(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  dataPoint(x, y) {
    const i = this.idx(x);
    const ri = Math.round(i);
    const pane = this.main;
    let price = this.pOf(Math.min(y, pane.top + pane.h), pane);
    price = this.magnetPrice(ri, price, pane);
    const snapT = this.i2t(this.tool === 'brush' ? i : ri);
    return { t: snapT, price };
  }

  _bind() {
    const cv = this.canvas;
    cv.style.touchAction = 'none';
    this.pointers = new Map();
    let drag = null;

    cv.addEventListener('pointerdown', (e) => {
      cv.setPointerCapture(e.pointerId);
      const p = this.local(e);
      this.pointers.set(e.pointerId, p);
      if (this.pointers.size === 2) {
        const [a, b] = [...this.pointers.values()];
        drag = { kind: 'pinch', dist: Math.abs(a.x - b.x) || 1, spacing: this.spacing, cx: (a.x + b.x) / 2, idx: this.idx((a.x + b.x) / 2) };
        this.pending = null;
        return;
      }
      this.mouse = p;
      this.emit('interact');
      // axes
      if (p.x > this.plotW && p.y < this.h - TIME_H) {
        const pane = this.paneAt(p.y);
        if (pane) { drag = { kind: 'pscale', y: p.y, pane, min: pane.scale.min, max: pane.scale.max }; pane.scale.auto = false; }
        return;
      }
      if (p.y > this.h - TIME_H) { drag = { kind: 'tscale', x: p.x, spacing: this.spacing, right: this.right }; return; }
      const inMain = p.y < this.main.h;
      const dp = this.dataPoint(p.x, p.y);
      const tool = this.tool;
      if (tool === 'cross' || !inMain) {
        const hit = inMain ? this.hitTest(p.x, p.y) : null;
        if (hit) {
          this.snapshotHistory();
          this.selected = hit.dr;
          drag = { kind: hit.handle >= 0 ? 'handle' : 'move', dr: hit.dr, handle: hit.handle, start: dp, orig: JSON.parse(JSON.stringify(hit.dr.p)) };
          this.emit('select', hit.dr);
        } else {
          if (this.selected) { this.selected = null; this.emit('select', null); }
          drag = { kind: 'pan', x: p.x, y: p.y, right: this.right, min: this.main.scale.min, max: this.main.scale.max, auto: this.main.scale.auto };
          cv.style.cursor = 'grabbing';
        }
        this.requestDraw();
        return;
      }
      if (tool === 'measure') {
        if (this.measure && !this.measure.done) { this.measure.b = dp; this.measure.done = true; }
        else { this.measure = { a: dp, b: dp, done: false }; drag = { kind: 'measure', x: p.x, y: p.y }; }
        this.requestDraw();
        return;
      }
      if (tool === 'zoom') { this.zoomBox = { x1: p.x, x2: p.x }; drag = { kind: 'zoom' }; return; }
      // drawing tools
      if (['hline', 'vline', 'text', 'arrow', 'arrowdown'].includes(tool)) {
        const dr = { id: uid++, type: tool === 'arrowdown' ? 'arrow' : tool, p: [dp], color: '#2962ff' };
        if (tool === 'arrowdown') dr.dir = 'down';
        if (tool === 'text') { this.emit('textprompt', dr, p); return; }
        this.commit(dr);
        return;
      }
      if (tool === 'brush') {
        this.pending = { id: uid++, type: 'brush', p: [dp], color: '#2962ff' };
        drag = { kind: 'brush' };
        return;
      }
      if (this.pending) {
        this.pending.p[1] = dp;
        this.commit(this.pending);
        this.pending = null;
        return;
      }
      this.pending = { id: uid++, type: tool, p: [dp, dp], color: tool === 'fib' ? '#787b86' : '#2962ff' };
      drag = { kind: 'draw', x: p.x, y: p.y };
      this.requestDraw();
    });

    cv.addEventListener('pointermove', (e) => {
      const p = this.local(e);
      if (this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, p);
      if (drag && drag.kind === 'pinch' && this.pointers.size === 2) {
        const [a, b] = [...this.pointers.values()];
        const dist = Math.abs(a.x - b.x) || 1;
        this.spacing = drag.spacing * (dist / drag.dist);
        this.clampView();
        this.right = drag.idx + (this.plotW - drag.cx) / this.spacing;
        this.requestDraw();
        return;
      }
      this.mouse = p;
      const dp = this.dataPoint(p.x, p.y);
      if (drag) {
        switch (drag.kind) {
          case 'pan': {
            this.right = drag.right - (p.x - drag.x) / this.spacing;
            if (!drag.auto || Math.abs(p.y - drag.y) > 30) {
              // vertical pan switches to manual price scale
            }
            break;
          }
          case 'pscale': {
            const k = Math.exp((p.y - drag.y) / 200);
            const mid = (drag.min + drag.max) / 2, half = (drag.max - drag.min) / 2 * k;
            drag.pane.scale.min = mid - half; drag.pane.scale.max = mid + half;
            break;
          }
          case 'tscale': {
            this.spacing = drag.spacing * Math.exp((p.x - drag.x) / 200);
            this.right = drag.right;
            break;
          }
          case 'handle': drag.dr.p[drag.handle] = dp; this.emit('drawings'); break;
          case 'move': {
            const dt = dp.t - drag.start.t, dpp = dp.price - drag.start.price;
            drag.dr.p = drag.orig.map((q) => ({ t: q.t + dt, price: q.price + dpp }));
            this.emit('drawings');
            break;
          }
          case 'draw': if (this.pending) this.pending.p[1] = dp; break;
          case 'brush': if (this.pending) this.pending.p.push(dp); break;
          case 'measure': if (this.measure) this.measure.b = dp; break;
          case 'zoom': this.zoomBox.x2 = p.x; break;
        }
      } else {
        if (this.pending && this.pending.p.length === 2) this.pending.p[1] = dp;
        if (this.measure && !this.measure.done) this.measure.b = dp;
        if (this.tool === 'cross') {
          const hit = p.y < this.main.h ? this.hitTest(p.x, p.y) : null;
          cv.style.cursor = p.x > this.plotW ? 'ns-resize' : p.y > this.h - TIME_H ? 'ew-resize' : hit ? (hit.handle >= 0 ? 'move' : 'pointer') : 'crosshair';
        }
      }
      const i = Math.round(this.idx(p.x));
      this.emit('crosshair', i >= 0 && i < this.data.length ? i : null);
      this.requestDraw();
    });

    const up = (e) => {
      cv.releasePointerCapture?.(e.pointerId);
      this.pointers.delete(e.pointerId);
      if (!drag) return;
      const p = this.local(e);
      switch (drag.kind) {
        case 'draw':
          if (this.pending && Math.hypot(p.x - drag.x, p.y - drag.y) > 5) { this.commit(this.pending); this.pending = null; }
          break;
        case 'brush':
          if (this.pending && this.pending.p.length > 1) this.commit(this.pending);
          this.pending = null;
          break;
        case 'measure':
          if (this.measure && Math.hypot(p.x - drag.x, p.y - drag.y) > 5) this.measure.done = true;
          break;
        case 'zoom': {
          const z = this.zoomBox;
          if (Math.abs(z.x2 - z.x1) > 10) {
            const i1 = this.idx(Math.min(z.x1, z.x2)), i2 = this.idx(Math.max(z.x1, z.x2));
            this.spacing = this.plotW / (i2 - i1);
            this.right = i2;
            this.priceScale.auto = true;
          }
          this.zoomBox = null;
          this.emit('toolDone');
          break;
        }
        case 'handle': case 'move': this.emit('drawingsCommitted'); break;
        case 'pan': cv.style.cursor = 'crosshair'; break;
      }
      drag = null;
      this.requestDraw();
    };
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse' && !drag) { this.mouse = null; this.emit('crosshair', null); this.requestDraw(); }
    });

    cv.addEventListener('wheel', (e) => {
      e.preventDefault();
      const p = this.local(e);
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
        this.right += (e.deltaX || e.deltaY) / this.spacing;
      } else {
        const anchor = this.idx(Math.min(p.x, this.plotW));
        const k = Math.exp(-e.deltaY / 400);
        this.spacing *= k;
        this.clampView();
        this.right = anchor + (this.plotW - Math.min(p.x, this.plotW)) / this.spacing;
      }
      this.requestDraw();
    }, { passive: false });

    cv.addEventListener('dblclick', (e) => {
      const p = this.local(e);
      if (p.x > this.plotW) { for (const pane of this.panes) pane.scale.auto = true; this.requestDraw(); return; }
      const hit = this.hitTest(p.x, p.y);
      if (hit && hit.dr.type === 'text') this.emit('textprompt', hit.dr, p, true);
    });
  }

  commit(dr) {
    this.snapshotHistory();
    this.drawings.push(dr);
    this.selected = dr;
    this.emit('drawings');
    this.emit('drawingsCommitted');
    if (!this.stayDrawing) this.emit('toolDone');
    this.requestDraw();
  }

  toDataURL() {
    this.draw();
    return this.canvas.toDataURL('image/png');
  }
}
