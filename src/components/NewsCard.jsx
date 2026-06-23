import CompanyLogo from './CompanyLogo.jsx';

function formatNewsDate(unixSeconds) {
  if (!unixSeconds) return '';
  return new Date(unixSeconds * 1000).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NewsCard({ article, matchedCompanies }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white border border-gray-300 rounded-lg shadow-sm p-4 space-y-2 hover:border-brand transition-colors"
    >
      {matchedCompanies.length > 0 ? (
        <div className="flex items-center space-x-1.5">
          <div className="flex items-center space-x-1">
            {matchedCompanies.slice(0, 5).map((company) => (
              <CompanyLogo key={company.ticker} domain={company.domain} ticker={company.ticker} size={20} rounded="rounded-full" />
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-500">
            {matchedCompanies.map((company) => company.ticker).join(' + ')}
          </span>
        </div>
      ) : null}

      <h3 className="text-sm font-bold text-gray-900 leading-snug">{article.headline}</h3>

      {article.summary ? <p className="text-xs text-gray-500 line-clamp-2">{article.summary}</p> : null}

      <p className="text-[11px] text-gray-500">
        {article.source}
        {article.datetime ? ` · ${formatNewsDate(article.datetime)}` : ''}
      </p>
    </a>
  );
}
