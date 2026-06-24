import EarningsCard from './EarningsCard.jsx';
import { calculateWebinarDate, isUpcoming } from '../utils/dateUtils.js';
import { groupByWebinarDate } from '../utils/groupEarnings.js';

function matchesSearch(earning, query, companyByTicker) {
  if (!query) return true;
  if (earning.ticker.toLowerCase().includes(query)) return true;
  const company = companyByTicker.get(earning.ticker);
  return company ? company.name.toLowerCase().includes(query) : false;
}

export default function EarningsList({ earnings, filter, search = '', companies }) {
  const companyByTicker = new Map(companies.map((c) => [c.ticker, c]));
  const query = search.trim().toLowerCase();
  const filtered = earnings.filter((e) => {
    const webinarDate = calculateWebinarDate(e.reportDate, e.marketTiming);
    return (
      (filter === 'upcoming' ? isUpcoming(webinarDate) && !e.webinarEnded : !isUpcoming(webinarDate) || e.webinarEnded) &&
      matchesSearch(e, query, companyByTicker)
    );
  });

  if (filtered.length === 0) {
    return (
      <p className="text-center text-gray-500 text-sm py-10">
        {query
          ? 'Ничего не найдено'
          : filter === 'upcoming'
            ? 'Нет предстоящих отчётностей'
            : 'Нет прошедших отчётностей'}
      </p>
    );
  }

  const groups = groupByWebinarDate(filtered);
  const sortedDates = Array.from(groups.keys()).sort((a, b) =>
    filter === 'upcoming' ? a.localeCompare(b) : b.localeCompare(a)
  );

  return (
    <div className="px-4 py-4 space-y-4">
      {sortedDates.map((webinarDate) => (
        <EarningsCard key={webinarDate} webinarDate={webinarDate} earnings={groups.get(webinarDate)} companyByTicker={companyByTicker} />
      ))}
    </div>
  );
}
