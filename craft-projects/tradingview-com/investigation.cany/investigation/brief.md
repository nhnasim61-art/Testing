# Brief

**Question:** Rebuild the captured site (home, /chart/, /ideas/, /markets/, /brokers/) as an original-branded static web app whose centerpiece is an interactive candlestick chart with timeframes, drawing tools, indicators (MA, RSI, MACD, volume), symbol search and watchlist on simulated data.

**Purpose:** Recreate the charting experience for a non-coder with original name/branding.

**Targets:**
- https://www.tradingview.com/ (captured only)
- capture/
- capture/routes/*

**Constraints:**
- Clean room: work only from screenshots and capture.json
- No TradingView logo/trademarks; original name
- Static build in app/dist
- Change files only in app/

**Done when:** npm run build succeeds, all five pages exist at their paths, the chart page is fully interactive, and rebuild_check differences have been addressed where possible.
