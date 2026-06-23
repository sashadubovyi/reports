import EarningsCard from './EarningsCard.jsx';
import { getCompanyByTicker } from '../data/companies.js';
import { isUpcoming } from '../utils/dateUtils.js';
import { groupByReportDate } from '../utils/groupEarnings.js';

function matchesSearch(earning, query) {
  if (!query) return true;
  if (earning.ticker.toLowerCase().includes(query)) return true;
  const company = getCompanyByTicker(earning.ticker);
  return company ? company.name.toLowerCase().includes(query) : false;
}

export default function EarningsList({ earnings, filter, search = '' }) {
  const query = search.trim().toLowerCase();
  const filtered = earnings.filter(
    (e) => (filter === 'upcoming' ? isUpcoming(e.reportDate) : !isUpcoming(e.reportDate)) && matchesSearch(e, query),
  );

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

  const groups = groupByReportDate(filtered);
  const sortedDates = Array.from(groups.keys()).sort((a, b) =>
    filter === 'upcoming' ? a.localeCompare(b) : b.localeCompare(a)
  );

  return (
    <div className="px-4 py-4 space-y-4">
      {sortedDates.map((reportDate) => (
        <EarningsCard key={reportDate} reportDate={reportDate} earnings={groups.get(reportDate)} />
      ))}
    </div>
  );
}
