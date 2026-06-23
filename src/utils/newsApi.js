const FINNHUB_COMPANY_NEWS_URL = 'https://finnhub.io/api/v1/company-news';
const MAX_ARTICLES = 200;
const LOOKBACK_DAYS = 7;

function toFinnhubDate(date) {
  return date.toISOString().slice(0, 10);
}

async function fetchCompanyNews(ticker, from, to, apiKey) {
  const url = `${FINNHUB_COMPANY_NEWS_URL}?symbol=${ticker}&from=${from}&to=${to}&token=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Finnhub вернул ошибку: ${res.status}`);
  }
  const data = await res.json();
  const items = Array.isArray(data) ? data : [];
  return items.map((item) => ({ ...item, relatedTicker: ticker }));
}

// Targets only the tickers with the nearest upcoming reports instead of the
// general/merger/forex/crypto categories, since those rarely mention our
// mid-cap calendar names. Each ticker is one parallel request, but the whole
// batch still only fires once per 30-minute cache cycle (see newsCache.js).
export async function fetchMarketNews(tickers = []) {
  const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_FINNHUB_API_KEY не задан');
  }
  if (tickers.length === 0) return [];

  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - LOOKBACK_DAYS);
  const toStr = toFinnhubDate(to);
  const fromStr = toFinnhubDate(from);

  const results = await Promise.allSettled(tickers.map((ticker) => fetchCompanyNews(ticker, fromStr, toStr, apiKey)));
  const fulfilled = results.filter((r) => r.status === 'fulfilled');
  if (fulfilled.length === 0) {
    throw new Error(results[0].reason?.message || 'Finnhub вернул ошибку');
  }

  const seen = new Set();
  const merged = [];
  for (const { value: items } of fulfilled) {
    for (const item of items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push(item);
    }
  }

  merged.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));
  return merged.slice(0, MAX_ARTICLES);
}
