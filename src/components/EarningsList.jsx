import EarningsCard from './EarningsCard.jsx';
import { isUpcoming } from '../utils/dateUtils.js';

export default function EarningsList({ earnings, filter }) {
  const filtered = earnings
    .filter((e) => (filter === 'upcoming' ? isUpcoming(e.reportDate) : !isUpcoming(e.reportDate)))
    .sort((a, b) => {
      if (filter === 'upcoming') return a.reportDate.localeCompare(b.reportDate);
      return b.reportDate.localeCompare(a.reportDate);
    });

  if (filtered.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-10">
        {filter === 'upcoming' ? 'Нет предстоящих отчётностей' : 'Нет прошедших отчётностей'}
      </p>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {filtered.map((earning) => (
        <EarningsCard key={earning.id} earning={earning} />
      ))}
    </div>
  );
}
