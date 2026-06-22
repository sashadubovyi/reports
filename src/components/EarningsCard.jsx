import { getCompanyByTicker } from '../data/companies.js';
import { calculateWebinarDate, formatDisplayDate, formatGroupDate, isUpcoming } from '../utils/dateUtils.js';

export default function EarningsCard({ reportDate, earnings }) {
  const upcoming = isUpcoming(reportDate);
  const webinarDate = earnings
    .map((earning) => calculateWebinarDate(earning.reportDate, earning.marketTiming))
    .sort()
    .at(-1);
  const registrationUrl = earnings.find((earning) => earning.registrationUrl)?.registrationUrl;
  const recordingUrl = earnings.find((earning) => earning.recordingUrl)?.recordingUrl;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <h2 className="text-sm font-bold text-brand">{formatGroupDate(reportDate)}</h2>
      </div>

      <div className="divide-y divide-gray-100">
        {earnings.map((earning) => {
          const company = getCompanyByTicker(earning.ticker);
          const timingLabel = earning.marketTiming === 'BMO' ? 'До открытия рынка' : 'После закрытия рынка';
          return (
            <div key={earning.id} className="px-4 py-3 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-bold text-gray-900">
                    {company ? company.name : earning.ticker}{' '}
                    <span className="text-gray-400 font-normal">({earning.ticker})</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {earning.quarter} · {timingLabel}
                  </p>
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
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-100 px-4 py-3 space-y-2">
        <p className="text-sm text-gray-600">
          <span className="text-gray-400">Дата вебинара: </span>
          {formatDisplayDate(webinarDate)}
        </p>
        {upcoming ? (
          registrationUrl ? (
            <a
              href={registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-brand-accent text-white font-semibold rounded-md py-2.5 text-sm"
            >
              Зарегистрироваться на вебинар
            </a>
          ) : null
        ) : recordingUrl ? (
          <a
            href={recordingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-brand text-white font-semibold rounded-md py-2.5 text-sm"
          >
            Смотреть видеозапись
          </a>
        ) : null}
      </div>
    </div>
  );
}
