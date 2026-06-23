import { useEffect, useMemo, useState } from 'react';
import NewsCard from './NewsCard.jsx';
import NewsCardSkeleton from './NewsCardSkeleton.jsx';
import { extractMatchingCompanies } from '../utils/newsTickerMatch.js';

const PAGE_SIZE = 25;
const SKELETON_COUNT = 6;

export default function NewsList({ status, articles, search = '' }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const query = search.trim().toLowerCase();

  // Ticker-matching scans every article against the full company list, so
  // it's memoized on the article array (stable once fetched) instead of
  // re-running on every render the "Загрузить ещё" button triggers.
  const enriched = useMemo(
    () =>
      articles.map((article) => ({
        article,
        matchedCompanies: extractMatchingCompanies(`${article.headline} ${article.summary || ''}`),
      })),
    [articles],
  );

  const filtered = useMemo(() => {
    const tracked = enriched.filter(({ matchedCompanies }) => matchedCompanies.length > 0);
    if (!query) return tracked;
    return tracked.filter(({ matchedCompanies }) =>
      matchedCompanies.some(
        (company) => company.ticker.toLowerCase().includes(query) || company.name.toLowerCase().includes(query),
      ),
    );
  }, [enriched, query]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query]);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="px-4 py-4 space-y-3">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <NewsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return <p className="text-center text-red-600 text-sm py-10">Не удалось загрузить новости. Попробуйте позже.</p>;
  }

  if (filtered.length === 0) {
    return (
      <p className="text-center text-gray-500 text-sm py-10">
        {query ? 'Новости по запросу не найдены' : 'Новостей пока нет'}
      </p>
    );
  }

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="px-4 py-4 space-y-3">
      {visible.map(({ article, matchedCompanies }) => (
        <NewsCard key={article.id} article={article} matchedCompanies={matchedCompanies} />
      ))}
      {hasMore ? (
        <button
          type="button"
          onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
          className="block w-full text-center bg-white border border-gray-300 rounded-lg py-2.5 text-sm font-semibold text-brand hover:bg-gray-50"
        >
          Загрузить ещё (+{PAGE_SIZE})
        </button>
      ) : null}
    </div>
  );
}
