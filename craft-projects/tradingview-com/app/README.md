# Tickerra

A charting web app with simulated market data: an interactive candlestick chart
(timeframes, drawing tools, moving averages, Bollinger Bands, RSI, MACD, volume,
alerts, bar replay), symbol search and a live watchlist, plus home, markets,
community ideas and brokers pages.

All prices are randomly generated in the browser; nothing connects to a real
market data feed.

## Build

```
npm install
npm run build
```

The finished site is written to `dist/`.

## Run

Serve the `dist` folder with any static web server, for example:

```
npx serve dist
```

then open the address it prints. Opening `dist/index.html` straight from the
disk will not work, because the pages load their scripts from absolute paths.

Pages: `/` (home), `/chart/`, `/ideas/`, `/markets/`, `/brokers/`.
The chart accepts a symbol in the address, e.g. `/chart/?symbol=BTCUSD`.
