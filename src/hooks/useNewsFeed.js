import { useCallback, useEffect, useState } from 'react';
import { fetchMarketNews } from '../utils/newsApi.js';
import { clearNewsCache, readNewsCache, writeNewsCache } from '../utils/newsCache.js';

// Owned by the page (not the News tab component) so the fetched articles
// survive switching tabs away and back — the tab itself can unmount freely
// without triggering a refetch against the rate-limited Finnhub API.
export function useNewsFeed(shouldLoad, tickers) {
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
    fetchMarketNews(tickers)
      .then((items) => {
        setArticles(items);
        writeNewsCache(items);
        setStatus('loaded');
      })
      .catch((err) => {
        console.error('Не удалось загрузить новости:', err);
        setStatus('error');
      });
  }, [shouldLoad, status, tickers]);

  // Manual override for the "Обновить новости" link — bypasses the cache
  // entirely. Distinct 'refreshing' status (vs 'loading') so the feed can
  // keep showing the stale articles underneath instead of blanking to skeletons.
  const refresh = useCallback(() => {
    clearNewsCache();
    setStatus('refreshing');
    fetchMarketNews(tickers)
      .then((items) => {
        setArticles(items);
        writeNewsCache(items);
        setStatus('loaded');
      })
      .catch((err) => {
        console.error('Не удалось обновить новости:', err);
        setStatus('loaded');
      });
  }, [tickers]);

  return { status, articles, refresh };
}
