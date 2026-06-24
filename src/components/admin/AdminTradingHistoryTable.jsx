import { LuTrash2 } from 'react-icons/lu';
import { buildEquityCurvePoints } from '../../utils/equityCurve.js';

const TYPE_BADGE = {
  normal: { text: 'Торговый день', className: 'bg-gray-100 text-gray-600' },
  marathon: { text: 'Марафон', className: 'bg-blue-50 text-brand' },
  withdrawal: { text: 'Вывод прибыли', className: 'bg-amber-50 text-amber-600' },
};

function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AdminTradingHistoryTable({ points, onEdit, onDelete }) {
  if (points.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center">
        Серия торговых вебинаров еще не началась, как только завершиться первый вебинар с Q2 2026 Вы увидите историю
      </p>
    );
  }

  const sorted = buildEquityCurvePoints(points);

  function handleDelete(point) {
    if (window.confirm(`Удалить точку за ${point.dateLabel}? Это действие нельзя отменить.`)) {
      onDelete(point.id);
    }
  }

  return (
    <div className="space-y-2">
      {sorted.map((point) => {
        const badge = TYPE_BADGE[point.type] || TYPE_BADGE.normal;
        return (
          <div key={point.id} className="bg-white border border-gray-200 rounded-md p-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-gray-800">{point.dateLabel}</p>
                <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${badge.className}`}>{badge.text}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">{point.tickers.length ? point.tickers.join(', ') : '—'}</p>
              <p className="text-xs text-gray-400">
                {point.profitDollar >= 0 ? '+' : ''}${formatMoney(point.profitDollar)} ({point.profitPercent >= 0 ? '+' : ''}
                {point.profitPercent}%) → Баланс ${formatMoney(point.balance)}
              </p>
            </div>
            <div className="flex items-center space-x-3 flex-shrink-0">
              <button type="button" onClick={() => onEdit(point.id)} className="text-xs font-semibold text-brand px-2 py-1">
                Изменить
              </button>
              <button type="button" onClick={() => handleDelete(point)} className="text-red-500 p-1" aria-label={`Удалить точку за ${point.dateLabel}`}>
                <LuTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
