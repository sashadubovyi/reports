import { getCompanyByTicker } from '../../data/companies.js';
import { formatDisplayDate } from '../../utils/dateUtils.js';

export default function AdminEarningsTable({ earnings, onEdit, onDelete }) {
  const sorted = [...earnings].sort((a, b) => b.reportDate.localeCompare(a.reportDate));

  if (sorted.length === 0) {
    return <p className="text-sm text-gray-400">Карточек пока нет</p>;
  }

  return (
    <div className="space-y-2">
      {sorted.map((earning) => {
        const company = getCompanyByTicker(earning.ticker);
        return (
          <div
            key={earning.id}
            className="bg-white border border-gray-200 rounded-md p-3 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {earning.ticker} — {company ? company.name : ''}
              </p>
              <p className="text-xs text-gray-500">
                {earning.quarter} · {formatDisplayDate(earning.reportDate)} · {earning.marketTiming}
              </p>
            </div>
            <div className="flex space-x-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => onEdit(earning)}
                className="text-xs font-semibold text-brand px-2 py-1"
              >
                Изменить
              </button>
              <button
                type="button"
                onClick={() => onDelete(earning.id)}
                className="text-xs font-semibold text-red-500 px-2 py-1"
              >
                Удалить
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
