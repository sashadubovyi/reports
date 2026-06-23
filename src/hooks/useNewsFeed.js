import { useEffect, useState } from 'react';
import { fetchMarketNews } from '../utils/newsApi.js';
import { readNewsCache, writeNewsCache } from '../utils/newsCache.js';

// Owned by the page (not the News tab component) so the fetched articles
// survive switching tabs away and back — the tab itself can unmount freely
// without triggering a refetch against the rate-limited Finnhub API.
export function useNewsFeed(shouldLoad) {
  const [status, setStatus] = useState('idle');
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    if (!shouldLoad || status !== 'idle') return;

    const cached = readNewsCache();
    if (cached) {
      setArticles(cached);
      setStatus('loaded');
      return;
    }

    setStatus('loading');
    fetchMarketNews()
      .then((items) => {
        setArticles(items);
        writeNewsCache(items);
        setStatus('loaded');
      })
      .catch((err) => {
        console.error('Не удалось загрузить новости:', err);
        setStatus('error');
      });
  }, [shouldLoad, status]);

  return { status, articles };
}
