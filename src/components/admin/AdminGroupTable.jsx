import { formatDisplayDate } from '../../utils/dateUtils.js';
import { groupByReportDate, getGroupSharedFields } from '../../utils/groupEarnings.js';

export default function AdminGroupTable({ earnings, onEdit, onToggleWebinarEnded }) {
  const groups = groupByReportDate(earnings);
  const sortedDates = Array.from(groups.keys()).sort((a, b) => a.localeCompare(b));

  if (sortedDates.length === 0) {
    return <p className="text-sm text-gray-500">Карточек пока нет</p>;
  }

  return (
    <div className="space-y-2">
      {sortedDates.map((reportDate) => {
        const groupEarnings = groups.get(reportDate);
        const tickers = groupEarnings.map((e) => e.ticker).join(' + ');
        const { registrationUrl, recordingUrl, webinarEnded } = getGroupSharedFields(groupEarnings);
        const link = registrationUrl || recordingUrl;
        return (
          <div
            key={reportDate}
            className={`bg-white border border-gray-200 rounded-md p-3 flex items-center justify-between ${webinarEnded ? 'opacity-60' : ''}`}
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800">{tickers}</p>
              <p className="text-xs text-gray-500">{formatDisplayDate(reportDate)}</p>
              <p className="text-xs text-gray-400 truncate max-w-xs">{link || 'Ссылка не указана'}</p>
            </div>
            <div className="flex items-center space-x-3 flex-shrink-0">
              <label className="flex items-center space-x-1 text-xs text-gray-500">
                <input
                  type="checkbox"
                  checked={webinarEnded}
                  onChange={() => onToggleWebinarEnded(reportDate)}
                />
                <span>Вебинар закончился</span>
              </label>
              <button
                type="button"
                onClick={() => onEdit(reportDate)}
                className="text-xs font-semibold text-brand px-2 py-1"
              >
                Изменить
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
