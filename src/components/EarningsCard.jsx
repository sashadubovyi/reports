import { getCompanyByTicker } from '../data/companies.js';
import { calculateWebinarDate, formatDisplayDate, isUpcoming } from '../utils/dateUtils.js';

export default function EarningsCard({ earning }) {
  const company = getCompanyByTicker(earning.ticker);
  const webinarDate = calculateWebinarDate(earning.reportDate, earning.marketTiming);
  const upcoming = isUpcoming(earning.reportDate);
  const timingLabel = earning.marketTiming === 'BMO' ? 'До открытия рынка' : 'После закрытия рынка';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-bold text-gray-900">
            {company ? company.name : earning.ticker}{' '}
            <span className="text-gray-400 font-normal">({earning.ticker})</span>
          </p>
          <p className="text-xs text-gray-500">{earning.quarter}</p>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-brand flex-shrink-0">
          {earning.marketTiming}
        </span>
      </div>

      <div className="flex text-sm">
        <div className="flex-1 space-y-1">
          <p className="text-gray-400 text-xs">EPS (прогноз)</p>
          <p className="font-semibold text-gray-800">{earning.epsEstimate || '—'}</p>
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-gray-400 text-xs">Выручка (прогноз)</p>
          <p className="font-semibold text-gray-800">{earning.revenueEstimate || '—'}</p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
        <p className="text-gray-600">
          <span className="text-gray-400">Время отчёта: </span>
          {timingLabel}
        </p>
        <p className="text-gray-600">
          <span className="text-gray-400">Дата вебинара: </span>
          {formatDisplayDate(webinarDate)}
        </p>
      </div>

      {upcoming ? (
        earning.registrationUrl ? (
          <a
            href={earning.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-brand-accent text-white font-semibold rounded-md py-2.5 text-sm"
          >
            Зарегистрироваться на вебинар
          </a>
        ) : null
      ) : earning.recordingUrl ? (
        <a
          href={earning.recordingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center bg-brand text-white font-semibold rounded-md py-2.5 text-sm"
        >
          Смотреть видеозапись
        </a>
      ) : null}
    </div>
  );
}
