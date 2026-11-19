import './styles/site.css';
import './styles/content.css';
import './styles/pages.css';
import { initShell, drawSparks } from './site.js';
import { logoHTML, fmt, fmtPct, series } from './data.js';
import { h2, h3, chev, ent, compactGrid, moverTable, trendCards, calendar, tick, price, pct, initTabs, tabs, MOON, D } from './components.js';

initShell({ theme: 'light', active: 'markets' });

const E = (s, n, p, c, x = {}) => ent(s, n, p, c, x);
const SECTIONS = [
  {
    id: 'indices', title: 'Indices', icon: '',
    pills: [E('SPX', 'S&P 500', 7175.83, -2.02), E('NDQ', 'Nasdaq 100', 26517.05, -2.21), E('DJI', 'Dow 30', 49097.06, -2.19), E('RUT', 'US 2000 small cap', 2654.77, -2.34, { logo: '2000', bg: '#5a1a2e', cur: 'USD' })],
    sub: [['World indices', 'cards', [E('NI225', 'Japan 225 Index', 59443.99, 0.71, { cur: 'JPY' }), E('UKX', 'FTSE 100 Index', 10452.68, -0.93), E('DAX', 'DAX Index', 25463.81, -1.06), E('PX1', 'CAC 40 Index', 8080.74, -0.81), E('FTMIB', 'Milano Italia Borsa Index', 49941.24, -0.46, { logo: '◐', bg: '#6b1d2a', cur: 'EUR' })]]],
  },
  {
    id: 'us', title: 'US stocks', icon: 'flag',
    pills: [E('NVDA', 'NVIDIA', 145.98, -3.3), E('AAPL', 'Apple', 349.21, -0.92), E('AMZN', 'Amazon', 257.37, -3.87), E('GOOGL', 'Alphabet', 272.66, -3.46)],
    sub: [
      ['Community trends', 'cards', [E('ANT', 'Anthropic, PBC', 97.17, 17.07), E('PANW', 'Palo Alto Networks, Inc.', 361.73, 6.42), E('AMD', 'Advanced Micro Devices', 489.19, -7.72), E('GME', 'GameStop Corporation', 26.93, 1.51), E('CRWD', 'CrowdStrike Holdings, Inc.', 243.46, 2.71)]],
      ['two', [['Highest volume stocks', 'grid', [E('ANT', 'Anthropic, PBC Class A', 97.17, 17.07), E('AMD', 'Advanced Micro Devices', 489.19, -7.72), E('SPCX', 'Space Exploration Tech', 138.43, -3.53), E('NVDA', 'NVIDIA Corporation', 145.98, -3.3), E('MU', 'Micron Technology, Inc.', 690.44, -2.1), E('MSFT', 'Microsoft Corporation', 498.3, -1.97)], 'See all most actively traded stocks'],
        ['Most volatile stocks', 'grid', [E('SOS', 'SOS Limited', 0.2045, -95.23, { logo: 'S', bg: '#222' }), E('NIVF', 'NewGenIvf Group', 0.035, -79.47, { logo: 'N', bg: '#d9ecff', fg: '#1e6fd9' }), E('CHSN', 'Chanson International', 0.0986, -3.33, { logo: 'C', bg: '#f2f2f2', fg: '#555' }), E('FCHL', 'Fitness Champs Holdings', 0.0662, -88.29, { logo: 'F', bg: '#eef0ff', fg: '#3b4bd8' }), E('TDTH', 'Trident Digital Tech', 0.404, -44.66, { logo: 'T', bg: '#eaf7ea', fg: '#2e7d32' }), E('BOXL', 'Boxlight Corporation', 0.84, -55.91, { logo: 'B', bg: '#e8f0ff', fg: '#2962ff' })], 'See all stocks with biggest price changes']]],
      ['two', [['Stock gainers', 'movers', [E('MPU', 'Mega Matrix Inc.', 4.76, 67.61, { logo: 'M', bg: '#e8f4ff', fg: '#1e88e5' }), E('SEAT', 'Vivid Seats Inc.', 2.09, 63.28, { logo: 'V', bg: '#3a1a7a' }), E('MDRN', 'Modern Mining Technology Corp.', 2.35, 44.17, { logo: 'M', bg: '#111', fg: '#f5b400' }), E('POAS', 'Phaos Technology Holdings Limited', 3.17, 36.64, { logo: 'P', bg: '#fff1ec', fg: '#e65100' }), E('FISN', 'Deep Fission, Inc.', 3.41, 25.83, { logo: 'D', bg: '#f2f2f2', fg: '#999' }), E('INHD', 'Inno Holdings Inc.', 2.82, 22.61, { logo: 'I', bg: '#e8f5e9', fg: '#2e7d32' })], 'See all stocks with largest daily growth', true],
        ['Stock losers', 'movers', [E('ZOAR', 'Zoar Limited', 4.36, -31.77, { logo: 'Z', bg: '#fff4e5', fg: '#f59e0b' }), E('SNEX', 'StoneX Group Inc.', 39.45, -26.71, { logo: 'SX', bg: '#f2f2f2', fg: '#222' }), E('SAIH', 'SAIHEAT Limited', 17.0, -25.24, { logo: 'S', bg: '#e8f0ff', fg: '#1e40af' }), E('LQDT', 'Liquidity Services, Inc.', 33.03, -24.88, { logo: 'L', bg: '#e0f7fa', fg: '#00838f' }), E('BKHA', 'Black Hawk Acquisition Corp.', 6.48, -24.74, { logo: 'B', bg: '#f2f2f2', fg: '#222' }), E('BUUU', 'BUUU Group Limited', 3.78, -22.06, { logo: 'b', bg: '#f2f2f2', fg: '#333' })], 'See all stocks with largest daily drop', true]]],
      ['two', [['Earnings Calendar', 'cal', [['MMS', 'Maximus, Inc.', '2.11', '1.85'], ['LQDT', 'Liquidity Services, Inc.', '0.46', '0.45'], ['BBWI', 'Bath & Body Works, Inc.', '0.26', '0.12'], ['ROAD', 'Construction Partners, Inc.', '1.00', '1.08'], ['VVV', 'Valvoline Inc.', '0.42', '0.42'], ['SPWR', 'SunPower Inc.', '−1.05', '−1.05']], 'See all events'],
        ['IPO Calendar', 'cal', [['ANT', 'Anthropic, PBC Class A', 'NASDAQ', '83.00']], '']]],
    ],
  },
  {
    id: 'world', title: 'World stocks', icon: '',
    pills: [E('MSFT', 'Microsoft', 498.3, -1.97), E('2222', 'Saudi Aramco', 26.48, 0.15, { logo: '◆', bg: '#e0f2f1', fg: '#00897b', cur: 'SAR' }), E('2330', 'TSMC', 2100, -3.45, { logo: 'tsmc', bg: '#c4122f', cur: 'TWD' }), E('MC', 'LVMH', 391.9, 0.98, { logo: 'LV', bg: '#111', cur: 'EUR' })],
    sub: [['two', [['World biggest companies', 'grid1', [E('AAPL', 'Apple Inc.', 349.21, -0.92), E('MSFT', 'Microsoft Corporation', 498.3, -1.97), E('NVDA', 'NVIDIA Corporation', 145.98, -3.3), E('GOOGL', 'Alphabet Inc.', 272.66, -3.46), E('AMZN', 'Amazon.com, Inc.', 257.37, -3.87), E('SPCX', 'Space Exploration Technologies', 138.43, -3.53)], 'See all world major companies'],
      ['World largest employers', 'grid1', [E('WMT', 'Walmart Inc.', 126.04, -1.04, { logo: '✳', bg: '#0071ce', fg: '#ffc220' }), E('AMZN', 'Amazon.com, Inc.', 257.37, -3.87), E('002594', 'BYD Company Limited Class A', 80.38, 0.29, { logo: 'B', bg: '#d32f2f', cur: 'CNY' }), E('ACN', 'Accenture plc', 218.58, -3.92, { logo: '>', bg: '#a100ff' }), E('JD', 'JD.com, Inc.', 25.64, 2.89, { logo: 'J', bg: '#e1251b' }), E('2618', 'JD Logistics, Inc.', 9.52, -4.51, { logo: 'JDL', bg: '#e1251b', cur: 'HKD' })], 'See all world biggest employers']]]],
  },
  {
    id: 'crypto', title: 'Crypto', icon: '',
    pills: [E('BTCUSD', 'Bitcoin', 61723, -1.99), E('ETHUSD', 'Ethereum', 1745.5, -1.61), E('SOLUSD', 'Solana', 92.14, -4.12), E('XRPUSD', 'XRP', 1.4021, -2.9)],
    sub: [['two', [['Crypto gainers', 'movers', [E('ICNTUSD', 'Impossible Cloud Network', 0.41117, 25.41, { logo: 'I', bg: '#222' }), E('LUNCUSD', 'Terra Classic', 0.0000467, 14.03, { logo: 'T', bg: '#172852', fg: '#f9d85e' }), E('MEGAUSD', 'MegaETH', 0.059979, 9.58, { logo: 'M', bg: '#eee', fg: '#333' }), E('GEODUSD', 'GEODNET', 0.20141, 5.41, { logo: 'G', bg: '#ffe4e6', fg: '#e11d48' }), E('AKTUSD', 'Akash Network', 0.53355, 5.33, { logo: 'A', bg: '#111', fg: '#ff414c' }), E('FTTUSD', 'FTX Token', 0.20557, 5.19, { logo: 'F', bg: '#0b2a3a', fg: '#5fcade' })], 'See all coins with largest daily growth'],
      ['Crypto losers', 'movers', [E('PIEVUSD', 'Pieverse', 2.934, -16.02, { logo: 'P', bg: '#f2f2f2', fg: '#000' }), E('SOONUSD', 'SOON', 0.24995, -9.18, { logo: 'S', bg: '#111', fg: '#e11d48' }), E('TELUSD', 'Telcoin', 0.0014727, -7.74, { logo: 'T', bg: '#14c8ff' }), E('ENAUSD', 'Ethena', 0.10359, -6.79, { logo: 'E', bg: '#111' }), E('BEAMUSD', 'Beam', 0.0034953, -6.23, { logo: 'B', bg: '#fde68a', fg: '#0ea5e9' }), E('MEMEUSD', 'MemeCore', 0.82938, -6.19, { logo: 'M', bg: '#ede9fe', fg: '#7c3aed' })], 'See all coins with largest daily drop']]],
      ['two', [['Crypto market cap ranking', 'grid1', [E('BTCUSD', 'Bitcoin', 61723, -1.99), E('ETHUSD', 'Ethereum', 1745.5, -1.61), E('USDTUSD', 'Tether USDt', 1.0, 0.01, { logo: 'T', bg: '#26a17b' }), E('XRPUSD', 'XRP', 1.4021, -2.9), E('BNBUSD', 'BNB', 612.3, -1.2, { logo: 'B', bg: '#f3ba2f', fg: '#111' }), E('SOLUSD', 'Solana', 92.14, -4.12)], 'See all coins by market cap'],
        ['TVL ranking', 'grid1', [E('LIDOUSD', 'Lido DAO', 0.912, -3.1, { logo: 'L', bg: '#f69988' }), E('AAVEUSD', 'Aave', 182.4, -2.4, { logo: 'A', bg: '#9b6bd5' }), E('EIGENUSD', 'EigenLayer', 1.31, -5.2, { logo: 'E', bg: '#1e1b4b' }), E('UNIUSD', 'Uniswap', 6.21, -2.8, { logo: 'U', bg: '#ff007a' }), E('MKRUSD', 'Sky', 0.071, -1.1, { logo: 'S', bg: '#1aab9b' }), E('PENDLEUSD', 'Pendle', 2.94, -6.0, { logo: 'P', bg: '#0f172a' })], 'See all DeFi coins']]]],
  },
  {
    id: 'futures', title: 'Futures and commodities', icon: '',
    pills: [E('CL1!', 'Crude oil', 82.44, 0.16), E('GC1!', 'Gold', 3685.5, -1.51), E('SI1!', 'Silver', 44.36, -1.55), E('NG1!', 'Natural gas', 3.268, -3.08)],
    sub: [['two', [['Energy futures', 'gridD', [E('CL1!', 'Light crude oil', 82.44, 0.16), E('NG1!', 'Natural gas', 3.268, -3.08), E('BRN1!', 'Brent crude oil', 91.98, 0.03, { logo: '●', bg: '#111' }), E('RB1!', 'RBOB gasoline', 2.4692, 0.57, { logo: '▣', bg: '#f97316' }), E('HO1!', 'NY Harbor ULSD', 3.8614, -0.72, { logo: '▤', bg: '#111' }), E('AEZ1!', 'NY ethanol', 2.175, 0.23, { logo: '◆', bg: '#7dd3fc' })], 'See all energy futures'],
      ['Metals futures', 'gridD', [E('GC1!', 'Gold', 3685.5, -1.51), E('SI1!', 'Silver', 44.36, -1.55), E('PL1!', 'Platinum', 1347.5, -0.99, { logo: '▲', bg: '#b7a99a' }), E('HG1!', 'Copper', 5.6335, -0.62), E('PA1!', 'Palladium', 918.5, -3.52, { logo: '▲', bg: '#a8a29e' }), E('ALI1!', 'Aluminum', 2793.0, -2.43, { logo: '▲', bg: '#9ca3af' })], 'See all metals futures']]],
      ['two', [['Agricultural futures', 'gridD', [E('ZC1!', 'Corn', 4.3125, 0.35, { logo: 'C', bg: '#eab308', fg: '#111' }), E('ZW1!', 'Wheat', 5.4725, -0.41, { logo: 'W', bg: '#d6a35c' }), E('ZS1!', 'Soybean', 10.96, 0.22, { logo: 'S', bg: '#65a30d' }), E('KC1!', 'Coffee', 3.92, 1.31, { logo: 'K', bg: '#6b4226' }), E('SB1!', 'Sugar', 0.1471, -0.67, { logo: 'S', bg: '#e5e7eb', fg: '#111' }), E('CT1!', 'Cotton', 0.6512, 0.15, { logo: 'C', bg: '#f1f5f9', fg: '#111' })], 'See all agricultural futures'],
        ['Index futures', 'gridD', [E('ES1!', 'S&P 500 E-mini', 7180.25, -2.0, { logo: '500', bg: '#c4122f' }), E('NQ1!', 'Nasdaq 100 E-mini', 26531.5, -2.19, { logo: '100', bg: '#0b97c4' }), E('YM1!', 'Dow E-mini', 49110, -2.16, { logo: '30', bg: '#20a7d8' }), E('RTY1!', 'Russell 2000 E-mini', 2657.4, -2.31, { logo: '2000', bg: '#5a1a2e' }), E('NKD1!', 'Nikkei 225', 59410, 0.68, { logo: '225', bg: '#24467a' }), E('FDAX1!', 'DAX', 25470, -1.05, { logo: 'X', bg: '#2b5aa8' })], 'See all index futures']]]],
  },
  {
    id: 'forex', title: 'Forex and currencies', icon: '',
    pills: [E('EURUSD', 'EUR/USD', 1.0982, 0.02), E('GBPUSD', 'GBP/USD', 1.2715, -0.18), E('USDJPY', 'USD/JPY', 159.02, 0.21), E('DXY', 'US Dollar Index', 103.929, 0.11)],
    sub: [['two', [['Majors', 'grid', [E('EURUSD', 'EUR/USD', 1.0982, 0.02), E('GBPUSD', 'GBP/USD', 1.2715, -0.18), E('USDJPY', 'USD/JPY', 159.02, 0.21), E('AUDUSD', 'AUD/USD', 0.6512, -0.42, { logo: 'A', bg: '#00247d' }), E('USDCAD', 'USD/CAD', 1.3871, 0.12, { logo: 'C', bg: '#d52b1e' }), E('USDCHF', 'USD/CHF', 0.8812, 0.08, { logo: 'F', bg: '#d52b1e' })], 'See all major pairs'],
      ['Currency indices', 'grid', [E('DXY', 'US Dollar Index', 103.929, 0.11), E('EXY', 'Euro Currency Index', 109.81, 0.02, { logo: '€', bg: '#1e4fb4' }), E('BXY', 'British Pound Index', 127.15, -0.18, { logo: '£', bg: '#1a2a6c' }), E('JXY', 'Japanese Yen Index', 62.88, -0.21, { logo: '¥', bg: '#c4122f' }), E('AXY', 'Australian Dollar Index', 65.12, -0.42, { logo: 'A', bg: '#00247d' }), E('CXY', 'Canadian Dollar Index', 72.09, -0.12, { logo: 'C', bg: '#d52b1e' })], 'See all currency indices']]]],
  },
  {
    id: 'bonds', title: 'Government bonds', icon: '',
    pills: [E('US10Y', 'US 10Y', 4.512, -0.8, { cur: '%' }), E('DE10Y', 'Germany 10Y', 2.61, -0.4, { logo: 'DE', bg: '#111', cur: '%' }), E('GB10Y', 'UK 10Y', 4.42, -0.6, { logo: 'GB', bg: '#1a2a6c', cur: '%' }), E('JP10Y', 'Japan 10Y', 1.72, 0.3, { logo: 'JP', bg: '#c4122f', cur: '%' })],
    sub: [['two', [['US bonds', 'grid1', [E('US01M', 'US 1 Month', 4.21, 0.1, { logo: '1M', bg: '#3b6fd8', cur: '%' }), E('US02Y', 'US 2 Year', 3.98, -0.6, { logo: '2Y', bg: '#3b6fd8', cur: '%' }), E('US05Y', 'US 5 Year', 4.08, -0.7, { logo: '5Y', bg: '#3b6fd8', cur: '%' }), E('US10Y', 'US 10 Year', 4.512, -0.8, { cur: '%' }), E('US20Y', 'US 20 Year', 4.98, -0.5, { logo: '20', bg: '#3b6fd8', cur: '%' }), E('US30Y', 'US 30 Year', 5.04, -0.4, { logo: '30', bg: '#3b6fd8', cur: '%' })], 'See all US bonds'],
      ['Yield curve', 'grid1', [E('DE10Y', 'Germany 10 Year', 2.61, -0.4, { logo: 'DE', bg: '#111', cur: '%' }), E('GB10Y', 'UK 10 Year', 4.42, -0.6, { logo: 'GB', bg: '#1a2a6c', cur: '%' }), E('FR10Y', 'France 10 Year', 3.31, -0.3, { logo: 'FR', bg: '#1e3a8a', cur: '%' }), E('IT10Y', 'Italy 10 Year', 3.62, -0.2, { logo: 'IT', bg: '#15803d', cur: '%' }), E('JP10Y', 'Japan 10 Year', 1.72, 0.3, { logo: 'JP', bg: '#c4122f', cur: '%' }), E('CN10Y', 'China 10 Year', 1.84, 0.1, { logo: 'CN', bg: '#dc2626', cur: '%' })], 'See all government bonds']]]],
  },
  {
    id: 'corp', title: 'Corporate bonds', icon: '',
    pills: [E('AAPL5544', 'Apple 5.54% 2036', 98.42, 0.06, { logo: '', s: 'AAPL', cur: '%' }), E('MSFT5560', 'Microsoft 5.60% 2036', 99.1, 0.04, { logo: '▦', bg: '#f2f2f2', fg: '#f25022', cur: '%' }), E('META6545', 'Meta 6.45% 2036', 101.2, -0.08, { logo: '∞', bg: '#eef3ff', fg: '#0866ff', cur: '%' }), E('AMZN5210', 'Amazon 5.21% 2034', 97.8, 0.02, { logo: 'a', bg: '#ff9900', cur: '%' })],
    sub: [
      ['two', [['Short-term', 'grid1', [E('C1', 'Ford Motor Credit 2027', 99.4, 0.03, { logo: 'F', bg: '#1e3a8a', cur: '%' }), E('C2', 'Boeing 2027', 98.9, -0.05, { logo: 'B', bg: '#1d4ed8', cur: '%' }), E('C3', 'Oracle 2028', 99.7, 0.02, { logo: 'O', bg: '#dc2626', cur: '%' }), E('C4', 'Verizon 2027', 100.1, 0.01, { logo: 'V', bg: '#111', cur: '%' }), E('C5', 'AT&T 2028', 99.2, -0.02, { logo: 'T', bg: '#0ea5e9', cur: '%' }), E('C6', 'Intel 2028', 97.6, -0.11, { logo: 'i', bg: '#0071c5', cur: '%' })], 'See all short-term bonds'],
        ['Long-term', 'grid1', [E('C7', 'Apple 2046', 92.3, 0.05, { logo: '', s: 'AAPL', cur: '%' }), E('C8', 'Microsoft 2050', 88.1, 0.07, { logo: '▦', bg: '#f2f2f2', fg: '#f25022', cur: '%' }), E('C9', 'Alphabet 2054', 86.4, 0.04, { logo: 'G', bg: '#fff', fg: '#4285f4', cur: '%' }), E('C10', 'Amazon 2052', 87.9, 0.03, { logo: 'a', bg: '#ff9900', cur: '%' }), E('C11', 'JPMorgan 2049', 90.2, -0.02, { logo: 'J', bg: '#5b4636', cur: '%' }), E('C12', 'Walmart 2048', 91.5, 0.01, { logo: '✳', bg: '#0071ce', fg: '#ffc220', cur: '%' })], 'See all long-term bonds']]],
      ['two', [['Floating-rate', 'grid1', [E('C13', 'Goldman Sachs FRN 2029', 100.4, 0.01, { logo: 'GS', bg: '#7ba7d7', cur: '%' }), E('C14', 'Morgan Stanley FRN 2028', 100.2, 0.0, { logo: 'MS', bg: '#111', cur: '%' }), E('C15', 'Citigroup FRN 2030', 100.6, 0.02, { logo: 'C', bg: '#003b70', cur: '%' }), E('C16', 'Wells Fargo FRN 2029', 100.1, -0.01, { logo: 'W', bg: '#d71e28', cur: '%' }), E('C17', 'Bank of America FRN 2031', 100.3, 0.01, { logo: 'B', bg: '#012169', cur: '%' }), E('C18', 'Toyota Credit FRN 2027', 100.0, 0.0, { logo: 'T', bg: '#eb0a1e', cur: '%' })], 'See all floating-rate bonds'],
        ['Fixed-rate', 'grid1', [E('C19', 'Pfizer 4.75% 2033', 98.6, 0.03, { logo: 'P', bg: '#0093d0', cur: '%' }), E('C20', 'Coca-Cola 4.65% 2034', 99.0, 0.02, { logo: 'C', bg: '#e41e2b', cur: '%' }), E('C21', 'PepsiCo 4.80% 2035', 98.8, 0.01, { logo: 'P', bg: '#004b93', cur: '%' }), E('C22', 'Visa 4.30% 2032', 99.3, 0.04, { logo: 'V', bg: '#1a1f71', cur: '%' }), E('C23', 'Nike 4.20% 2031', 98.1, -0.02, { logo: 'N', bg: '#111', cur: '%' }), E('C24', 'Comcast 5.10% 2035', 97.4, -0.05, { logo: 'C', bg: '#6d28d9', cur: '%' })], 'See all fixed-rate bonds']]],
      ['two', [['Major 10Y bonds', 'grid1', [E('US10Y', 'US 10 Year', 4.512, -0.8, { cur: '%' }), E('DE10Y', 'Germany 10 Year', 2.61, -0.4, { logo: 'DE', bg: '#111', cur: '%' }), E('GB10Y', 'UK 10 Year', 4.42, -0.6, { logo: 'GB', bg: '#1a2a6c', cur: '%' }), E('FR10Y', 'France 10 Year', 3.31, -0.3, { logo: 'FR', bg: '#1e3a8a', cur: '%' }), E('JP10Y', 'Japan 10 Year', 1.72, 0.3, { logo: 'JP', bg: '#c4122f', cur: '%' }), E('IN10Y', 'India 10 Year', 6.41, -0.1, { logo: 'IN', bg: '#ff9933', cur: '%' })], 'See all 10Y bonds']]],
    ],
  },
  {
    id: 'etfs', title: 'ETFs', icon: '',
    pills: [E('SPY', 'S&P 500 ETF Trust', 716.2, -2.01, { logo: 'S', bg: '#2a3c66' }), E('QQQ', 'Nasdaq 100 Trust', 645.9, -2.2, { logo: 'Q', bg: '#0b97c4' }), E('IWM', 'Russell 2000 ETF', 263.1, -2.33, { logo: 'R', bg: '#5a1a2e' }), E('GLD', 'Gold Trust', 338.4, -1.48, { logo: 'G', bg: '#d6a017' })],
    sub: [['two', [['Most traded', 'grid', [E('SPY', 'S&P 500 ETF Trust', 716.2, -2.01, { logo: 'S', bg: '#2a3c66' }), E('QQQ', 'Nasdaq 100 Trust', 645.9, -2.2, { logo: 'Q', bg: '#0b97c4' }), E('IWM', 'Russell 2000 ETF', 263.1, -2.33, { logo: 'R', bg: '#5a1a2e' }), E('TQQQ', 'UltraPro QQQ', 92.4, -6.5, { logo: '3x', bg: '#111' }), E('SOXL', 'Semiconductor Bull 3X', 41.2, -9.8, { logo: '3x', bg: '#1e40af' }), E('HYG', 'High Yield Corporate Bond', 79.6, -0.3, { logo: 'H', bg: '#065f46' })], 'See all most traded ETFs'],
      ['Highest returns', 'grid', [E('URA', 'Uranium ETF', 48.2, 3.1, { logo: 'U', bg: '#65a30d' }), E('SIL', 'Silver Miners ETF', 61.4, 2.4, { logo: 'S', bg: '#9aa0a8' }), E('ARKK', 'Innovation ETF', 71.9, 1.8, { logo: 'A', bg: '#111' }), E('KWEB', 'China Internet ETF', 38.6, 1.2, { logo: 'K', bg: '#dc2626' }), E('XLE', 'Energy Select ETF', 92.3, 0.6, { logo: 'E', bg: '#f59e0b' }), E('TAN', 'Solar ETF', 44.1, 0.5, { logo: 'T', bg: '#fbbf24', fg: '#111' })], 'See all top performers'],
      ['Highest dividend yields', 'grid', [E('JEPI', 'Equity Premium Income ETF', 57.2, -0.4, { logo: 'J', bg: '#5b4636' }), E('SCHD', 'US Dividend Equity ETF', 27.9, -0.8, { logo: 'S', bg: '#00a0df' }), E('VYM', 'High Dividend Yield ETF', 134.6, -1.1, { logo: 'V', bg: '#96151d' }), E('HDV', 'Core High Dividend ETF', 120.4, -0.9, { logo: 'H', bg: '#111' }), E('DVY', 'Select Dividend ETF', 138.2, -1.0, { logo: 'D', bg: '#111' }), E('SPHD', 'High Dividend Low Volatility', 49.8, -0.6, { logo: 'S', bg: '#2a3c66' })], 'See all dividend ETFs']]],
      ['two', [['Highest AUM growth', 'grid', [E('VOO', 'Vanguard S&P 500 ETF', 658.3, -2.0, { logo: 'V', bg: '#96151d' }), E('IVV', 'Core S&P 500 ETF', 719.5, -2.02, { logo: 'I', bg: '#111' }), E('VTI', 'Total Stock Market ETF', 322.8, -2.1, { logo: 'V', bg: '#96151d' }), E('BND', 'Total Bond Market ETF', 73.9, 0.1, { logo: 'B', bg: '#96151d' }), E('IBIT', 'Bitcoin Trust ETF', 35.1, -2.0, { logo: '₿', bg: '#f7931a' }), E('GLD', 'Gold Trust', 338.4, -1.48, { logo: 'G', bg: '#d6a017' })], 'See all ETFs']]]],
  },
  {
    id: 'economy', title: 'Economy', icon: '',
    pills: [E('USGDP', 'US GDP growth', 2.1, 0.3, { logo: 'US', bg: '#1e3a8a', cur: '%' }), E('USIRYY', 'US inflation rate', 2.9, -0.1, { logo: 'US', bg: '#1e3a8a', cur: '%' }), E('USUR', 'US unemployment rate', 4.2, 0.1, { logo: 'US', bg: '#1e3a8a', cur: '%' }), E('USINTR', 'US interest rate', 4.25, 0, { logo: 'US', bg: '#1e3a8a', cur: '%' })],
    sub: [['two', [['Economic indicators heatmap', 'grid1', [E('E1', 'United States GDP', 2.1, 0.3, { logo: 'US', bg: '#1e3a8a', cur: '%' }), E('E2', 'Euro Area GDP', 1.2, 0.1, { logo: 'EU', bg: '#1e4fb4', cur: '%' }), E('E3', 'China GDP', 4.8, -0.2, { logo: 'CN', bg: '#dc2626', cur: '%' }), E('E4', 'Japan GDP', 0.9, 0.2, { logo: 'JP', bg: '#c4122f', cur: '%' }), E('E5', 'India GDP', 6.7, 0.4, { logo: 'IN', bg: '#ff9933', cur: '%' }), E('E6', 'United Kingdom GDP', 1.1, -0.1, { logo: 'GB', bg: '#1a2a6c', cur: '%' })], 'See all indicators'],
      ['Global inflation map', 'grid1', [E('I1', 'United States inflation', 2.9, -0.1, { logo: 'US', bg: '#1e3a8a', cur: '%' }), E('I2', 'Euro Area inflation', 2.1, 0.0, { logo: 'EU', bg: '#1e4fb4', cur: '%' }), E('I3', 'United Kingdom inflation', 3.4, -0.2, { logo: 'GB', bg: '#1a2a6c', cur: '%' }), E('I4', 'Japan inflation', 2.6, 0.1, { logo: 'JP', bg: '#c4122f', cur: '%' }), E('I5', 'Brazil inflation', 4.9, -0.3, { logo: 'BR', bg: '#15803d', cur: '%' }), E('I6', 'Turkey inflation', 33.3, -1.2, { logo: 'TR', bg: '#e30a17', cur: '%' })], 'See inflation by country']]],
      ['two', [['Economic Calendar', 'cal', [['US', 'Initial Jobless Claims', '229 K', '227 K'], ['EU', 'Inflation Rate YoY', '2.1%', '2.1%'], ['JP', 'Balance of Trade', '−0.3 T', '−0.4 T'], ['GB', 'Retail Sales MoM', '0.4%', '0.2%']], 'See all events']]]],
  },
];

const flag = `<span class="flag" aria-hidden="true"></span>`;

function block([title, kind, items, more, withTabs]) {
  let body = '';
  if (kind === 'grid' || kind === 'gridD') body = compactGrid(items, { d: kind === 'gridD' });
  if (kind === 'movers') body = (withTabs ? tabs(['Regular hours', 'Pre-market']) : '') + moverTable(items);
  if (kind === 'grid1') body = `<div class="cal"><div class="cal-h"><span>Symbol</span><span>Price &amp; chg</span><span>${title.includes('employers') ? 'Employees' : 'Market cap'}</span></div>${moverTableNoPill(items, title.includes('employers'))}</div>`;
  if (kind === 'cal') body = calendar(items.map(([s, n, a, b]) => ({ e: E(s, n, 0, 0, { logo: n[0], bg: '#f2f2f2', fg: '#333' }), v: [a.match(/\d/) && !a.includes('NASDAQ') ? a + '<small>USD</small>' : a, b + '<small>USD</small>'] })), title.startsWith('IPO') ? ['Exchange', 'Offer price'] : ['Actual', 'Estimate']);
  return `<div>${h3(title)}${body}${more ? chev('/markets/', more, 'blue') : ''}</div>`;
}
function moverTableNoPill(items, emp) {
  return `<ul class="movers">${items.map((e, i) => `<li><a href="/chart/?symbol=${encodeURIComponent(e.s)}">${logoHTML(e, 28)}<span class="mv-l"><span class="mv-n">${e.n}${MOON}</span>${tick(e.s)}</span><span class="mv-pc">${price(e.p, e.cur || 'USD')}${pct(e.c)}</span><span class="mv-cap">${emp ? ['2.1 M', '1.6 M', '869.6 K', '814 K', '776.7 K', '682.7 K'][i] : ['5.07 T', '3.7 T', '3.52 T', '3.32 T', '2.78 T', '1.88 T'][i]}${emp ? '' : '<small>USD</small>'}</span></a></li>`).join('')}</ul>`;
}

function section(s) {
  const pills = s.pills.map((p, i) => `<button class="mk-pill ${i === 0 ? 'on' : ''}" data-i="${i}">${logoHTML(p, 32)}<span><span class="mk-pn">${p.n}${p.s.length < 6 ? D() : ''}<i class="dash"></i></span><span class="mk-pv">${fmt(p.p)}<small>${p.cur === 'POINT' ? 'POINT' : p.cur}</small>${pct(p.c)}</span></span></button>`).join('');
  const cards = s.pills.map((p) => `<a class="mk-card" href="/chart/?symbol=${encodeURIComponent(p.s)}">${logoHTML(p, 20)}<b>${p.n}</b><span class="mk-cv">${fmt(p.p)}<small>${p.cur}</small></span>${pct(p.c)}<canvas class="mk-spark" data-spark='${JSON.stringify(series(p.s + 'm', 40, p.p, 0.02, p.c / 4000).map((v) => +v.toFixed(4)))}' data-color="${p.c >= 0 ? '#089981' : '#f23645'}"></canvas><span class="mk-cx">1 day</span></a>`).join('');
  let subs = '';
  for (const sub of s.sub) {
    if (sub[0] === 'two') subs += `<div class="two">${sub[1].map(block).join('')}</div>`;
    else if (sub[1] === 'cards') subs += `${h3(sub[0], '/markets/', sub[0] === 'Community trends')}${trendCards(sub[2])}`;
  }
  return `<section class="sec mk-sec" id="${s.id}">
    ${h2(s.title, '/markets/', s.icon === 'flag' ? flag : '')}
    <div class="mk-pills">${pills}</div>
    <div class="hscroll mk-cards-wrap"><div class="mk-cards">${cards}</div></div>
    <div class="mk-chart"><canvas data-sym="${s.pills[0].s}" data-seed="${s.id}0"></canvas>
      <div class="mk-ctrl"><button title="Embed">&lt;/&gt;</button><span class="seg"><button class="on" title="Area">⌒</button><button title="Candles">⫼</button></span><button title="Open full chart" class="mk-full">⛶</button></div></div>
    ${subs}
  </section>`;
}

document.getElementById('content').innerHTML = `
<div class="mk-page">
  <h1 class="mk-h1"><button class="mk-jump">Markets, everywhere <svg viewBox="0 0 18 18" width="28" height="28"><path fill="none" stroke="currentColor" stroke-width="2.2" d="M5 7.5 9 11.5 13 7.5"/></svg></button></h1>
  <div class="mk-jumpmenu" hidden>${SECTIONS.map((s) => `<a href="#${s.id}">${s.title}</a>`).join('')}</div>
  ${SECTIONS.map(section).join('')}
</div>`;

// big area/candle chart per section
function drawBig(cv, mode) {
  const w = cv.clientWidth, h = cv.clientHeight;
  if (!w || !h) return;
  const dpr = window.devicePixelRatio || 1;
  cv.width = w * dpr; cv.height = h * dpr;
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);
  const vals = series(cv.dataset.seed, 120, 100, 0.012, -0.0004);
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const Y = (v) => 10 + (1 - (v - mn) / (mx - mn)) * (h - 40);
  const X = (i) => (i / (vals.length - 1)) * (w - 70);
  ctx.strokeStyle = '#f3f3f3';
  for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(0, (h - 30) * i / 5); ctx.lineTo(w - 70, (h - 30) * i / 5); ctx.stroke(); }
  const up = vals[vals.length - 1] >= vals[0];
  const col = up ? '#089981' : '#f23645';
  if (mode === 'candles') {
    vals.forEach((v, i) => {
      if (!i) return;
      const o = vals[i - 1], c = v;
      ctx.fillStyle = c >= o ? '#089981' : '#f23645';
      ctx.fillRect(X(i) - 2, Math.min(Y(o), Y(c)), 4, Math.max(1, Math.abs(Y(o) - Y(c))));
      ctx.fillRect(X(i) - 0.5, Math.min(Y(o), Y(c)) - 3, 1, Math.abs(Y(o) - Y(c)) + 6);
    });
  } else {
    ctx.beginPath();
    vals.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
    ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.lineTo(X(vals.length - 1), h - 30); ctx.lineTo(0, h - 30); ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, col + '14'); g.addColorStop(1, col + '00');
    ctx.fillStyle = g; ctx.fill();
  }
  ctx.fillStyle = '#000'; ctx.font = '12px ' + getComputedStyle(document.body).fontFamily;
  for (let i = 0; i <= 4; i++) { const v = mx - (mx - mn) * i / 4; ctx.fillText(v.toFixed(2), w - 60, Y(v) + 4); }
  const hours = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
  hours.forEach((t, i) => ctx.fillText(t, ((i + 0.5) / hours.length) * (w - 70) - 14, h - 10));
}
function drawAll() { document.querySelectorAll('.mk-chart canvas').forEach((c) => drawBig(c, c.dataset.mode)); drawSparks(); }
drawAll();
window.addEventListener('resize', drawAll);
initTabs();

document.querySelectorAll('.mk-sec').forEach((sec) => {
  const cv = sec.querySelector('.mk-chart canvas');
  sec.querySelector('.mk-pills').addEventListener('click', (e) => {
    const b = e.target.closest('.mk-pill'); if (!b) return;
    sec.querySelectorAll('.mk-pill').forEach((x) => x.classList.toggle('on', x === b));
    cv.dataset.seed = sec.id + b.dataset.i;
    const s = SECTIONS.find((x) => x.id === sec.id);
    cv.dataset.sym = s.pills[b.dataset.i].s;
    drawBig(cv, cv.dataset.mode);
  });
  sec.querySelector('.mk-ctrl').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.classList.contains('mk-full')) { location.href = '/chart/?symbol=' + encodeURIComponent(cv.dataset.sym); return; }
    if (b.closest('.seg')) {
      b.parentElement.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
      cv.dataset.mode = b.title === 'Candles' ? 'candles' : 'area';
      drawBig(cv, cv.dataset.mode);
    }
  });
});
const jm = document.querySelector('.mk-jumpmenu');
document.querySelector('.mk-jump').addEventListener('click', () => { jm.hidden = !jm.hidden; });
jm.addEventListener('click', () => { jm.hidden = true; });
