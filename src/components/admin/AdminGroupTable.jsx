import { LuTrash2 } from 'react-icons/lu';
import { formatDisplayDate } from '../../utils/dateUtils.js';
import { groupByWebinarDate, getGroupSharedFields } from '../../utils/groupEarnings.js';

// Groups are listed by WEBINAR date — identical to how cards group on the
// site — so each row here corresponds to exactly one visible card.
export default function AdminGroupTable({ earnings, onEdit, onToggleWebinarEnded, onDeleteGroup }) {
  const groups = groupByWebinarDate(earnings);
  const sortedDates = Array.from(groups.keys()).sort((a, b) => a.localeCompare(b));

  if (sortedDates.length === 0) {
    return <p className="text-sm text-gray-500">Карточек пока нет</p>;
  }

  function handleDelete(webinarDate, tickers) {
    if (window.confirm(`Удалить группу ${tickers} (вебинар ${formatDisplayDate(webinarDate)}) целиком? Это действие нельзя отменить.`)) {
      onDeleteGroup(webinarDate);
    }
  }

  return (
    <div className="space-y-2">
      {sortedDates.map((webinarDate) => {
        const groupEarnings = groups.get(webinarDate);
        const tickers = groupEarnings.map((e) => e.ticker).join(' + ');
        const { registrationUrl, recordingUrl, webinarEnded } = getGroupSharedFields(groupEarnings);
        const link = registrationUrl || recordingUrl;
        return (
          <div
            key={webinarDate}
            className={`bg-white border border-gray-200 rounded-md p-3 flex items-center justify-between ${webinarEnded ? 'opacity-60' : ''}`}
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800">{tickers}</p>
              <p className="text-xs text-gray-500">Вебинар: {formatDisplayDate(webinarDate)}</p>
              <p className="text-xs text-gray-400 truncate max-w-xs">{link || 'Ссылка не указана'}</p>
            </div>
            <div className="flex items-center space-x-3 flex-shrink-0">
              <label className="flex items-center space-x-1 text-xs text-gray-500">
                <input
                  type="checkbox"
                  checked={webinarEnded}
                  onChange={() => onToggleWebinarEnded(webinarDate)}
                />
                <span>Вебинар закончился</span>
              </label>
              <button
                type="button"
                onClick={() => onEdit(webinarDate)}
                className="text-xs font-semibold text-brand px-2 py-1"
              >
                Изменить
              </button>
              <button
                type="button"
                onClick={() => handleDelete(webinarDate, tickers)}
                className="text-red-500 p-1"
                aria-label={`Удалить группу ${tickers} целиком`}
              >
                <LuTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
