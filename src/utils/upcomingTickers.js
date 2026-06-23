import { isUpcoming, parseISODate } from './dateUtils.js';

export function getUpcomingTickers(earnings, limit = 20) {
  const upcoming = earnings
    .filter((e) => isUpcoming(e.reportDate))
    .sort((a, b) => parseISODate(a.reportDate) - parseISODate(b.reportDate));

  const seen = new Set();
  const tickers = [];
  for (const e of upcoming) {
    if (seen.has(e.ticker)) continue;
    seen.add(e.ticker);
    tickers.push(e.ticker);
    if (tickers.length >= limit) break;
  }
  return tickers;
}
