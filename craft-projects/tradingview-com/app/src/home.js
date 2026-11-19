import './styles/site.css';
import './styles/content.css';
import './styles/home.css';
import { initShell, drawSparks, drawThumbs } from './site.js';
import { logoHTML, fmt } from './data.js';
import { h2, h3, chev, ent, quoteRows, moverTable, compactGrid, trendCards, ideaCards, tabs, newsError, calendar, sparkCanvas, tick, D, price, pct, initTabs, CHEV } from './components.js';
import { IDEAS, SCRIPTS } from './ideas-data.js';

initShell({ theme: 'dark', active: '', home: true });

const E = (s, n, p, c, x = {}) => ent(s, n, p, c, x);
const idx = [
  E('NDQ', 'Nasdaq 100', 26517.05, -2.21, { tk: 'NDX' }), E('NI225', 'Japan 225', 59443.99, 0.71, { cur: 'JPY' }),
  E('SSE', 'SSE Composite', 3577.62, -0.28, { tk: '000001', logo: '◎', bg: '#283a6b', cur: 'POINT' }), E('UKX', 'FTSE 100', 10452.68, -0.93),
  E('DAX', 'DAX', 25463.81, -1.06), E('PX1', 'CAC 40', 8080.74, -0.81),
];
const crypto = [E('BTCUSD', 'Bitcoin', 61723, -1.99, { tk: 'BTCUSD' }), E('ETHUSD', 'Ethereum', 1745.5, -1.61)];
const futs = [
  E('CL1!', 'Light crude oil', 82.44, 0.16, { unit: 'barrel' }), E('NG1!', 'Natural gas', 3.268, -3.08, { unit: 'million BTUs' }),
  E('GC1!', 'Gold', 3685.5, -1.51, { unit: 'troy ounce' }), E('HG1!', 'Copper', 5.6335, -0.62, { unit: 'pound' }),
];
const stk = (s, n, p, c, logo, bg, fg) => E(s, n, p, c, { logo, bg, fg, cur: 'USD' });

const highVol = [
  stk('ANT', 'Anthropic, PBC', 97.17, 17.07, 'A\\', '#f0efea', '#111'), stk('AMD', 'Advanced Micro Devices', 489.19, -7.72, 'A', '#111'),
  stk('SPCX', 'Space Exploration Tech', 138.43, -3.53, 'X', '#111'), stk('NVDA', 'NVIDIA Corporation', 145.98, -3.3, 'N', '#1a1a1a', '#76b900'),
  stk('MU', 'Micron Technology', 690.44, -2.1, 'M', '#1f4f9a'), stk('MSFT', 'Microsoft Corp.', 498.3, -1.97, '▦', '#f2f2f2', '#f25022'),
];
const volatile = [
  stk('SOS', 'SOS Limited', 0.2045, -4.66, 'S', '#222'), stk('NIVF', 'NewGenIvf Group', 0.035, -79.47, 'N', '#d9ecff', '#1e6fd9'),
  stk('CHSN', 'Chanson International', 0.0986, -3.33, 'C', '#f2f2f2', '#555'), stk('FCHL', 'Fitness Champs', 0.0662, -88.29, 'F', '#eef0ff', '#3b4bd8'),
  stk('TDTH', 'Trident Digital Tech', 0.404, -44.66, 'T', '#eaf7ea', '#2e7d32'), stk('BOXL', 'Boxlight Corporation', 0.84, -55.91, 'B', '#e8f0ff', '#2962ff'),
];
const gainers = [
  stk('MPU', 'Mega Matrix Inc.', 4.76, 67.61, 'M', '#e8f4ff', '#1e88e5'), stk('SEAT', 'Vivid Seats Inc.', 2.09, 63.28, 'V', '#3a1a7a'),
  stk('MDRN', 'Modern Mining Technology Corp.', 2.35, 44.17, 'M', '#111', '#f5b400'), stk('POAS', 'Phaos Technology Holdings Limited', 3.17, 36.64, 'P', '#fff1ec', '#e65100'),
  stk('FISN', 'Deep Fission, Inc.', 3.41, 25.83, 'D', '#f2f2f2', '#999'), stk('INHD', 'Inno Holdings Inc.', 2.82, 22.61, 'I', '#e8f5e9', '#2e7d32'),
];
const losers = [
  stk('ZOAR', 'Zoar Limited', 4.36, -31.77, 'Z', '#fff4e5', '#f59e0b'), stk('SNEX', 'StoneX Group Inc.', 39.45, -26.71, 'SX', '#f2f2f2', '#222'),
  stk('SAIH', 'SAIHEAT Limited', 17.0, -25.24, 'S', '#e8f0ff', '#1e40af'), stk('LQDT', 'Liquidity Services, Inc.', 33.03, -24.88, 'L', '#e0f7fa', '#00838f'),
  stk('BKHA', 'Black Hawk Acquisition Corporation', 6.48, -24.74, 'B', '#f2f2f2', '#222'), stk('BUUU', 'BUUU Group Limited', 3.78, -22.06, 'b', '#f2f2f2', '#333'),
];
const trends = [
  stk('ANT', 'Anthropic, PBC', 97.17, 17.07, 'A\\', '#f0efea', '#111'), stk('PANW', 'Palo Alto Networks, Inc.', 361.73, 6.42, '//', '#fff1ec', '#fa582d'),
  stk('AMD', 'Advanced Micro Devices', 489.19, -7.72, 'A', '#111'), stk('GME', 'GameStop Corporation', 26.93, 1.51, 'GS', '#111'),
  stk('CRWD', 'CrowdStrike Holdings, Inc.', 243.46, 2.71, 'C', '#e01e1e'),
];
const cTrends = [
  E('IRYSUSDT', 'IRYS / TetherUS PERPETUAL', 0.02263, 28.58, { logo: 'I', bg: '#00e0a0', cur: 'USDT', tk: 'IRYSUSDT.P' }),
  E('VVVUSDT', 'VVV / TetherUS PERPETUAL', 21.849, 0.68, { logo: 'V', bg: '#fbe9e7', fg: '#c62828', cur: 'USDT', tk: 'VVVUSDT.P' }),
  E('PEPEUSDT', 'PEPE / TetherUS', 0.00000369, -1.6, { logo: 'P', bg: '#4caf50', cur: 'USDT' }),
  E('PIEVUSDT', 'PIEVERSE / TetherUS PERPETUAL', 2.9405, -16.64, { logo: 'P', bg: '#f2f2f2', fg: '#000', cur: 'USDT', tk: 'PIEVERSEUSDT.P' }),
  E('LITUSDT', 'LIT / TetherUS PERPETUAL', 2.772, 1.89, { logo: 'L', bg: '#111', cur: 'USDT', tk: 'LITUSDT.P' }),
];
const cGain = [
  E('ICNTUSD', 'Impossible Cloud Network', 0.41117, 25.41, { logo: 'I', bg: '#222' }), E('LUNCUSD', 'Terra Classic', 0.0000467, 14.03, { logo: 'T', bg: '#172852', fg: '#f9d85e' }),
  E('MEGAUSD', 'MegaETH', 0.059979, 9.58, { logo: 'M', bg: '#eee', fg: '#333' }), E('GEODUSD', 'GEODNET', 0.20141, 5.41, { logo: 'G', bg: '#ffe4e6', fg: '#e11d48' }),
  E('AKTUSD', 'Akash Network', 0.53355, 5.33, { logo: 'A', bg: '#111', fg: '#ff414c' }), E('FTTUSD', 'FTX Token', 0.20557, 5.19, { logo: 'F', bg: '#0b2a3a', fg: '#5fcade' }),
];
const cLose = [
  E('PIEVUSD', 'Pieverse', 2.934, -16.02, { logo: 'P', bg: '#f2f2f2', fg: '#000' }), E('SOONUSD', 'SOON', 0.24995, -9.18, { logo: 'S', bg: '#111', fg: '#e11d48' }),
  E('TELUSD', 'Telcoin', 0.0014727, -7.74, { logo: 'T', bg: '#14c8ff' }), E('ENAUSD', 'Ethena', 0.10359, -6.79, { logo: 'E', bg: '#111' }),
  E('BEAMUSD', 'Beam', 0.0034953, -6.23, { logo: 'B', bg: '#fde68a', fg: '#0ea5e9' }), E('MEMEUSD', 'MemeCore', 0.82938, -6.19, { logo: 'M', bg: '#ede9fe', fg: '#7c3aed' }),
];
const energy = [
  E('CL1!', 'Light crude oil', 82.44, 0.16, { cur: 'USD / BLL' }), E('NG1!', 'Natural gas', 3.268, -3.08, { cur: 'USD / MMBTU' }),
  E('BRN1!', 'Brent crude oil', 91.98, 0.03, { logo: '●', bg: '#111', cur: 'USD / BLL' }), E('RB1!', 'RBOB gasoline', 2.4692, 0.57, { logo: '▣', bg: '#f97316', cur: 'USD / GLL' }),
  E('HO1!', 'NY Harbor ULSD', 3.8614, -0.72, { logo: '▤', bg: '#111', cur: 'USD' }), E('AEZ1!', 'NY ethanol', 2.175, 0.23, { logo: '◆', bg: '#7dd3fc', cur: 'USD' }),
];
const metals = [
  E('GC1!', 'Gold', 3685.5, -1.51, { cur: 'USD / APZ' }), E('SI1!', 'Silver', 44.36, -1.55, { cur: 'USD / APZ' }),
  E('PL1!', 'Platinum', 1347.5, -0.99, { logo: '▲', bg: '#b7a99a', cur: 'USD / APZ' }), E('HG1!', 'Copper', 5.6335, -0.62, { cur: 'USD / LBR' }),
  E('PA1!', 'Palladium', 918.5, -3.52, { logo: '▲', bg: '#a8a29e', cur: 'USD / APZ' }), E('ALI1!', 'Aluminum', 2793.0, -2.43, { logo: '▲', bg: '#9ca3af', cur: 'USD' }),
];
const fxPerf = [['EURUSD', 0.02], ['GBPUSD', -0.18], ['USDJPY', 0.21], ['AUDUSD', -0.42], ['USDCAD', 0.12], ['USDCHF', 0.08], ['NZDUSD', -0.55]];

const earnings = [
  { e: stk('MMS', 'Maximus, Inc.', 0, 0, 'M', '#5b4b8a'), v: ['2.11<small>USD</small>', '1.85<small>USD</small>'] },
  { e: stk('LQDT', 'Liquidity Services, Inc.', 0, 0, 'L', '#e0f7fa', '#00838f'), v: ['0.46<small>USD</small>', '0.45<small>USD</small>'] },
  { e: stk('BBWI', 'Bath & Body Works, Inc.', 0, 0, 'B&B', '#1d4e89'), v: ['0.26<small>USD</small>', '0.12<small>USD</small>'] },
  { e: stk('ROAD', 'Construction Partners, Inc.', 0, 0, 'C', '#f2f2f2', '#222'), v: ['1.00<small>USD</small>', '1.08<small>USD</small>'] },
  { e: stk('VVV', 'Valvoline Inc.', 0, 0, 'V', '#fff', '#c62828'), v: ['0.42<small>USD</small>', '0.42<small>USD</small>'] },
  { e: stk('SPWR', 'SunPower Inc.', 0, 0, 'S', '#e8f5e9', '#2e7d32'), v: ['−1.05<small>USD</small>', '−1.05<small>USD</small>'] },
];

const IPO = [
  ['ANT', 'Anthropic, PBC Class A', [['Last', '97.17<small>USD</small>'], ['Latest valuation', '965.00 B<small>USD</small>'], ['Market cap', '1.10 T<small>USD</small>']], 'A\\', '#f0efea', '#111'],
  ['OPENAI', 'OpenAI', [['Exchange', 'NASDAQ'], ['Latest valuation', '852.00 B<small>USD</small>']], '✺', '#f2f2f2', '#111'],
  ['ANDURIL', 'Anduril Industries, Inc.', [['Exchange', 'NASDAQ'], ['Latest valuation', '61.00 B<small>USD</small>']], '△', '#efe7e1', '#111'],
  ['REVOLUT', 'Revolut Ltd.', [['Exchange', 'NASDAQ'], ['Latest valuation', '115.00 B<small>USD</small>']], 'R', '#fff', '#111'],
  ['STRIPE', 'Stripe Inc.', [['Exchange', 'NASDAQ'], ['Latest valuation', '106.70 B<small>USD</small>']], 'S', '#635bff'],
];

const flag = `<span class="flag" aria-hidden="true"></span>`;

const html = `
<section class="hero">
  <div class="earth" aria-hidden="true"><i class="glow"></i><i class="flare"></i><i class="globe"></i><i class="stars"></i><svg class="trail" viewBox="0 0 1440 400" preserveAspectRatio="none"><path d="M60 360 L120 300 L140 315 L190 255" stroke="#e44be0" fill="none" stroke-width="2" opacity=".7"/><path d="M620 280 L660 250 L690 300 L720 340 L750 400" stroke="#d26bd1" fill="none" stroke-width="2" opacity=".6"/><path d="M820 400 L860 330 L900 290 L930 250 L960 220 L990 200" stroke="#8a7cff" fill="none" stroke-width="2" opacity=".75"/></svg></div>
  <div class="hero-in">
    <h1>Where the world does markets</h1>
    <p class="hero-sub">Join millions of traders and investors taking the future into their own hands.</p>
    <a class="btn-hero" href="/chart/">Get started for free</a>
    <p class="hero-note">$0 forever, no credit card needed</p>
  </div>
</section>
<section class="super">
  <div class="super-in reveal">
    <h2>Supercharged<br>Supercharts</h2>
    <a class="super-shot" href="/chart/" aria-label="Open the chart"><canvas data-thumb="supercharts-preview" data-dark="1"></canvas><span class="super-cta"><span class="sc-ic">✦</span><span><b>Explore all features ›</b><small>For every level of analysis</small></span></span></a>
  </div>
</section>
<div class="panel">
<section class="sec" id="summary">
  ${h2('Market summary')}
  <div class="ms-grid">
    <div class="card ms-main">
      <a class="ms-head" href="/chart/?symbol=SPX">${logoHTML('SPX', 56)}<span><span class="ms-n">S&amp;P 500 ${tick('SPX')}<span class="ms-dash">▬</span></span><span class="ms-p"><b>7,175.83</b><span class="ms-u"><sup class="dmark">D</sup>POINT</span>${pct(-2.02)}</span></span></a>
      <div class="ms-chart">${sparkCanvas('spx-intraday', 220, 7400, 0.0028, -0.00012, '#f23645', 'big-spark')}<div class="ms-axis"><span>7,400.00</span><span>7,330.00</span><span>7,250.00</span><span>7,180.00</span></div></div>
      <div class="ms-times"><span>15:00</span><span>16:00</span><span>17:00</span><span>18:00</span><span>19:00</span><span>20:00</span><span>21:00</span></div>
    </div>
    <div class="card ms-side">
      <h3 class="card-h">Major indices</h3>
      ${quoteRows(idx)}
      ${chev('/markets/', 'See all major indices', 'blue')}
    </div>
    <div class="card">
      <a class="mini-h" href="/chart/?symbol=BTCUSD">${logoHTML({ logo: '◎', bg: '#2962ff' }, 24)}<span>Crypto market cap</span>${tick('TOTAL')}</a>
      <div class="mini-v"><span class="up">2.1 <small>T</small><small>USD</small></span>${pct(-22.59)}</div>
      ${sparkCanvas('cmc', 80, 3, 0.04, -0.003, '#f23645', 'mid-spark')}
      <p class="mini-x">1 month</p>
      <h3 class="dom-h">Bitcoin dominance</h3>
      <div class="dom-legend"><span><i style="background:#2962ff"></i>Bitcoin<b>59.15%</b></span><span><i style="background:#00c853"></i>Ethereum<b>10.17%</b></span><span><i style="background:#ff3b3b"></i>Others<b>30.69%</b></span></div>
      <div class="dom-bar"><i style="width:59.15%;background:#2962ff"></i><i style="width:10.17%;background:#00c853"></i><i style="flex:1;background:#ff3b3b"></i></div>
      ${quoteRows(crypto, { d: false })}
      ${chev('/markets/', 'See all crypto coins', 'blue')}
    </div>
    <div class="card">
      <a class="mini-h" href="/chart/?symbol=DXY">${logoHTML('DXY', 24)}<span>US Dollar index</span>${tick('DXY')}</a>
      <div class="mini-v"><span>103.930<small>USD</small></span>${pct(1.91)}</div>
      ${sparkCanvas('dxy', 80, 100, 0.01, 0.0006, '#089981', 'mid-spark')}
      <p class="mini-x">1 month</p>
      ${quoteRows(futs)}
      ${chev('/markets/', 'See all futures', 'blue')}
    </div>
    <div class="card">
      <h3 class="card-h">${chev('/markets/', 'US yield curve')}</h3>
      <div class="yc"><svg viewBox="0 0 400 230" preserveAspectRatio="none"><g stroke="#e0e0e0" stroke-dasharray="2 3">${[60, 92, 125, 150, 280, 390].map((x) => `<path d="M${x} 0V230"/>`).join('')}</g><path d="M60 210 L92 90 L125 80 L150 72 L280 46 L390 48" fill="none" stroke="#2962ff" stroke-width="2"/>${[[60, 210], [92, 90], [125, 80], [150, 72], [280, 46], [390, 48]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#2962ff"/>`).join('')}</svg>
      <div class="yc-y"><span>5.5%</span><span>5.0%</span><span>4.5%</span><span>4.0%</span></div><div class="yc-x"><span>1M</span><span>3Y</span><span>7Y</span><span>10Y</span><span>20Y</span><span>30Y</span></div></div>
      <h3 class="card-h bonds-h">${chev('/markets/', 'Investment grade corporate bonds')}</h3>
      <ul class="bonds">${[['Meta Platforms, Inc.', '6.55% · Nov 15, 2036', '6.45', '138.9', 78, '∞', '#eef3ff', '#0866ff'], ['Microsoft Corp.', '5.55% · Nov 3, 2036', '5.60', '53.5', 78, '▦', '#f2f2f2', '#f25022'], ['Apple, Inc.', '5.35% · Nov 9, 2036', '5.54', '47.0', 78, '', '#111', '#fff']].map((b) => `<li><span class="bd-top">${logoHTML({ logo: b[5], bg: b[6], fg: b[7], s: b[5] ? '' : 'AAPL' }, 36)}<span class="bd-l"><b>${b[0]}</b><span>${b[1]}</span></span><span class="bd-r"><b>${b[2]}<small>%</small></b><span>${b[3]} bps</span></span></span><span class="bd-bar"><i style="width:${b[4]}%"></i><i style="width:${b[3] / 2}px"></i></span></li>`).join('')}</ul>
      <div class="bd-legend"><span><i style="background:#5b9cf6"></i>US treasury yield</span><span><i style="background:#de812f"></i>G-spread</span></div>
      ${chev('/markets/', 'See all bonds', 'blue')}
    </div>
  </div>

  ${h3('Featured IPOs')}
  <div class="hscroll"><div class="ipos">${IPO.map(([s, n, f, l, bg, fg]) => `<a class="ipo" href="/markets/">${logoHTML({ logo: l, bg, fg }, 36)}<span class="ipo-s">${s}</span><span class="ipo-n">${n}</span><span class="ipo-f">${f.map(([k, v]) => `<span><small>${k}</small>${v}</span>`).join('')}</span></a>`).join('')}</div></div>

  ${h3('Community ideas', '/ideas/')}
  ${tabs(["Editors' picks", 'Popular'])}
  ${ideaCards(IDEAS.slice(0, 6))}

  ${h3('Indicators and strategies', '/ideas/')}
  ${tabs(["Editors' picks", 'Popular'])}
  ${ideaCards(SCRIPTS.slice(0, 6), { badge: 'INDICATOR', noTime: true })}

  ${h3('Top stories', '/ideas/')}
  ${newsError()}
</section>

<section class="sec" id="us">
  ${h2('US stocks', '/markets/', flag)}
  ${h3('Community trends', '/markets/', true)}
  ${trendCards(trends)}
  ${h3('Trade ideas', '/ideas/')}
  ${ideaCards(IDEAS.slice(6, 12))}
  <div class="two">
    <div>${h3('Highest volume stocks')}${compactGrid(highVol)}${chev('/markets/', 'See all most actively traded stocks', 'blue')}</div>
    <div>${h3('Most volatile stocks')}${compactGrid(volatile)}${chev('/markets/', 'See all stocks with biggest price changes', 'blue')}</div>
  </div>
  <div class="two">
    <div>${h3('Stock gainers')}${tabs(['Regular hours', 'Pre-market'])}${moverTable(gainers)}${chev('/markets/', 'See all stocks with largest daily growth', 'blue')}</div>
    <div>${h3('Stock losers')}${tabs(['Regular hours', 'Pre-market'])}${moverTable(losers)}${chev('/markets/', 'See all stocks with largest daily drop', 'blue')}</div>
  </div>
  <div class="two">
    <div>${h3('Earnings Calendar')}${calendar(earnings, ['Actual', 'Estimate'])}${chev('/markets/', 'See all events', 'blue')}</div>
    <div>${h3('IPO Calendar')}${calendar([{ e: stk('ANT', 'Anthropic, PBC Class A', 0, 0, 'A\\', '#f0efea', '#111'), v: ['NASDAQ', '83.00<small>USD</small>'] }], ['Exchange', 'Offer price'])}</div>
  </div>
  ${h3('US stocks news', '/ideas/')}
  ${newsError()}
</section>

<section class="sec" id="crypto">
  ${h2('Crypto')}
  ${h3('Community trends', '/markets/', true)}
  ${trendCards(cTrends)}
  ${h3('Trade ideas', '/ideas/')}
  ${ideaCards(IDEAS.slice(12, 18))}
  <div class="two">
    <div>${h3('Crypto gainers')}${moverTable(cGain)}${chev('/markets/', 'See all coins with largest daily growth', 'blue')}</div>
    <div>${h3('Crypto losers')}${moverTable(cLose)}${chev('/markets/', 'See all coins with largest daily drop', 'blue')}</div>
  </div>
  ${h3('Crypto news', '/ideas/')}
  ${newsError()}
</section>

<section class="sec" id="futures">
  ${h2('Futures and commodities')}
  ${h3('Trade ideas', '/ideas/')}
  ${ideaCards(IDEAS.slice(18, 24))}
  <div class="two">
    <div>${h3('Energy futures')}${compactGrid(energy, { d: true })}${chev('/markets/', 'See all energy futures', 'blue')}</div>
    <div>${h3('Metals futures')}${compactGrid(metals, { d: true })}${chev('/markets/', 'See all metals futures', 'blue')}</div>
  </div>
  ${h3('Futures news', '/ideas/')}
  ${newsError()}
</section>

<section class="sec" id="forex">
  ${h2('Forex and currencies')}
  ${h3('Trade ideas', '/ideas/')}
  ${ideaCards(IDEAS.slice(24, 30))}
  ${h3('Forex performance')}
  <ul class="fxperf">${fxPerf.map(([s, c]) => `<li><a href="/chart/?symbol=${s}">${logoHTML(s, 20)}${tick(s)}<span class="fx-bar"><i class="${c >= 0 ? 'pos' : 'neg'}" style="width:${Math.abs(c) * 40}%"></i></span>${pct(c)}</a></li>`).join('')}</ul>
  ${h3('Forex news', '/ideas/')}
  ${newsError()}
</section>

<section class="sec" id="economy">
  ${h2('Economy')}
  ${h3('Global inflation map')}
  <div class="infl" aria-label="Sample inflation map">${Array.from({ length: 60 }, (_, i) => `<i style="opacity:${0.25 + ((i * 37) % 70) / 100}"></i>`).join('')}</div>
  ${h3('Economic Calendar')}
  ${calendar([{ e: E('US', 'Initial Jobless Claims', 0, 0, { logo: 'US', bg: '#1e3a8a', tk: 'USIJC' }), v: ['229 K', '227 K'] }, { e: E('EU', 'Inflation Rate YoY', 0, 0, { logo: 'EU', bg: '#1e4fb4', tk: 'EUIRYY' }), v: ['2.1%', '2.1%'] }, { e: E('JP', 'Balance of Trade', 0, 0, { logo: 'JP', bg: '#c4122f', tk: 'JPBOT' }), v: ['−0.3 T', '−0.4 T'] }], ['Actual', 'Forecast'])}
</section>

<section class="sec" id="brokers">
  ${h2('Trading and brokers', '/brokers/')}
  <div class="brk-row">${['Northwind Markets', 'Lumen Trade', 'Harbor & Pike', 'Quillstone', 'Corvid Capital'].map((n, i) => `<a class="brk-card" href="/brokers/"><span class="brk-ic" style="background:${['#ff6b00', '#2962ff', '#111', '#089981', '#7c3aed'][i]}">${n[0]}</span><b>${n}</b><span>${(4.6 - i * 0.1).toFixed(1)} ★ · ${['Stocks, ETFs', 'Crypto', 'Forex', 'Futures', 'Options'][i]}</span></a>`).join('')}</div>
</section>
</div>
`;

document.getElementById('content').innerHTML = html;
initTabs();
drawSparks();
drawThumbs();

// Reveal the Supercharts preview when it scrolls into view on big screens.
const rev = document.querySelector('.reveal');
if (rev && 'IntersectionObserver' in window && window.innerWidth >= 1100) {
  rev.classList.add('pre');
  new IntersectionObserver((en, ob) => { if (en[0].isIntersecting) { rev.classList.remove('pre'); ob.disconnect(); } }, { threshold: 0.3 }).observe(rev);
}
window.addEventListener('resize', () => { drawSparks(); });
