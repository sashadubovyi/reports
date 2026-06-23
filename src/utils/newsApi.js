const FINNHUB_NEWS_URL = 'https://finnhub.io/api/v1/news';

export async function fetchMarketNews() {
  const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_FINNHUB_API_KEY не задан');
  }

  const url = `${FINNHUB_NEWS_URL}?category=general&token=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Finnhub вернул ошибку: ${res.status}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
