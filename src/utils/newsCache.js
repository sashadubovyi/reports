const CACHE_KEY = 'cached_news_data';
const CACHE_TIMESTAMP_KEY = 'cached_news_timestamp';
const CACHE_TTL_MS = 30 * 60 * 1000;

// Per-browser cache, not a server-side rate limiter — it bounds how often
// *this* device hits Finnhub's free 60-req/min tier on repeat visits, since
// the app has no backend to share a cache across different users' devices.
export function readNewsCache() {
  try {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp || Date.now() - Number(timestamp) > CACHE_TTL_MS) return null;
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeNewsCache(articles) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(articles));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now()));
  } catch {
    // localStorage may be unavailable (private mode, quota exceeded) —
    // caching is a best-effort optimization, not a correctness requirement.
  }
}
