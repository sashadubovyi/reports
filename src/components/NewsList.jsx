import { useEffect, useMemo, useState } from 'react';
import NewsCard from './NewsCard.jsx';
import NewsCardSkeleton from './NewsCardSkeleton.jsx';
import { extractMatchingCompanies } from '../utils/newsTickerMatch.js';
import { getCompanyByTicker } from '../data/companies.js';
import { getRefreshCooldownRemainingMs, isRefreshOnCooldown, startRefreshCooldown } from '../utils/newsRefreshCooldown.js';

const PAGE_SIZE = 25;
const SKELETON_COUNT = 6;

// Ticker-matching scans every article against the full company list, so
// it's memoized on the article array (stable once fetched) instead of
// re-running on every render the "Загрузить ещё" button triggers.
function enrichArticle(article) {
  const textMatches = extractMatchingCompanies(`${article.headline} ${article.summary || ''}`);
  // company-news is fetched per ticker, so the source ticker is always a
  // confirmed match even if the headline phrases the company name oddly.
  const sourceCompany = article.relatedTicker ? getCompanyByTicker(article.relatedTicker) : null;
  if (!sourceCompany || textMatches.some((c) => c.ticker === sourceCompany.ticker)) {
    return { article, matchedCompanies: textMatches };
  }
  return { article, matchedCompanies: [sourceCompany, ...textMatches] };
}

export default function NewsList({ status, articles, search = '', onRefresh }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [cooldownActive, setCooldownActive] = useState(() => isRefreshOnCooldown());
  const query = search.trim().toLowerCase();

  // The cooldown timestamp lives in localStorage (survives reload/tab switch),
  // but this timer flips the link back on live if the tab stays open past it.
  useEffect(() => {
    if (!cooldownActive) return;
    const remaining = getRefreshCooldownRemainingMs();
    if (remaining <= 0) {
      setCooldownActive(false);
      return;
    }
    const timer = setTimeout(() => setCooldownActive(false), remaining);
    return () => clearTimeout(timer);
  }, [cooldownActive]);

  const enriched = useMemo(() => articles.map(enrichArticle), [articles]);

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

  function handleRefreshClick() {
    startRefreshCooldown();
    setCooldownActive(true);
    onRefresh();
  }

  const canRefresh = status === 'loaded' || status === 'refreshing' || status === 'error';
  const refreshRow =
    canRefresh && !cooldownActive ? (
      <button type="button" onClick={handleRefreshClick} className="text-xs text-gray-400 hover:text-gray-600 hover:underline">
        Обновить новости
      </button>
    ) : null;

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
    return (
      <div className="px-4 py-4 space-y-3">
        {refreshRow}
        <p className="text-center text-red-600 text-sm py-10">Не удалось загрузить новости. Попробуйте позже.</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="px-4 py-4 space-y-3">
        {refreshRow}
        <p className="text-center text-gray-500 text-sm py-10">
          {query ? 'Новости по запросу не найдены' : 'Новостей пока нет'}
        </p>
      </div>
    );
  }

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="px-4 py-4 space-y-3">
      {refreshRow}
      {status === 'refreshing' ? <p className="text-xs text-gray-400">Обновление…</p> : null}
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
