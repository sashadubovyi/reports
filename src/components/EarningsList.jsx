import EarningsCard from './EarningsCard.jsx';
import { isUpcoming } from '../utils/dateUtils.js';

function groupByReportDate(earnings) {
  const groups = new Map();
  earnings.forEach((earning) => {
    const list = groups.get(earning.reportDate) || [];
    list.push(earning);
    groups.set(earning.reportDate, list);
  });
  return groups;
}

export default function EarningsList({ earnings, filter }) {
  const filtered = earnings.filter((e) =>
    filter === 'upcoming' ? isUpcoming(e.reportDate) : !isUpcoming(e.reportDate)
  );

  if (filtered.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-10">
        {filter === 'upcoming' ? 'Нет предстоящих отчётностей' : 'Нет прошедших отчётностей'}
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
