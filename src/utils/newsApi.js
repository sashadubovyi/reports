const FINNHUB_NEWS_URL = 'https://finnhub.io/api/v1/news';
const CATEGORIES = ['general', 'merger', 'forex', 'crypto'];
const MAX_ARTICLES = 200;

async function fetchCategory(category, apiKey) {
  const url = `${FINNHUB_NEWS_URL}?category=${category}&token=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Finnhub вернул ошибку: ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchMarketNews() {
  const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_FINNHUB_API_KEY не задан');
  }

  const results = await Promise.allSettled(CATEGORIES.map((category) => fetchCategory(category, apiKey)));
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
