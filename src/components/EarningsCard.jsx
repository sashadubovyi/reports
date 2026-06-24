import { LuMoon, LuSun } from 'react-icons/lu';
import { formatPastCardDate, formatWebinarDateTime, isUpcoming } from '../utils/dateUtils.js';
import CompanyLogo from './CompanyLogo.jsx';

function formatSigned(raw, { prefix = '', suffix = '' } = {}) {
  if (raw === undefined || raw === null || raw === '') return null;
  const num = parseFloat(raw);
  if (Number.isNaN(num)) return null;
  const sign = num >= 0 ? '+' : '-';
  return { text: `${sign}${prefix}${Math.abs(num)}${suffix}`, positive: num >= 0 };
}

export default function EarningsCard({ webinarDate, earnings, companyByTicker }) {
  const upcoming = isUpcoming(webinarDate) && !earnings.some((earning) => earning.webinarEnded);
  const registrationUrl = earnings.find((earning) => earning.registrationUrl)?.registrationUrl;
  const recordingUrl = earnings.find((earning) => earning.recordingUrl)?.recordingUrl;

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
        <h2 className="text-sm font-bold text-brand">
          <span className="text-gray-500 font-normal">Дата вебинара: </span>
          {upcoming ? formatWebinarDateTime(webinarDate) : formatPastCardDate(webinarDate)}
        </h2>
      </div>

      <div className="divide-y divide-gray-100">
        {earnings.map((earning) => {
          const company = companyByTicker.get(earning.ticker);
          const timingLabel = earning.marketTiming === 'BMO' ? 'До открытия' : 'После закрытия';
          const TimingIcon = earning.marketTiming === 'BMO' ? LuSun : LuMoon;
          const gapDollar = formatSigned(earning.gapDollar, { prefix: '$' });
          const gapPercent = formatSigned(earning.gapPercent, { suffix: '%' });
          const gap = gapDollar || gapPercent;
          return (
            <div key={earning.id} className="px-4 py-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <CompanyLogo domain={company?.domain} logoUrl={company?.logoUrl} ticker={earning.ticker} />
                  <div>
                    <p className="text-base font-bold text-gray-900">
                      {company ? company.name : earning.ticker}{' '}
                      <span className="text-gray-500 font-normal">({earning.ticker})</span>
                    </p>
                    <p className="text-xs text-gray-500">{earning.quarter}</p>
                  </div>
                </div>
                <span
                  role="img"
                  className="p-1.5 rounded bg-blue-50 text-brand flex-shrink-0"
                  title={`Отчёт: ${timingLabel}`}
                  aria-label={`Отчёт: ${timingLabel}`}
                >
                  <TimingIcon className="w-4 h-4" />
                </span>
              </div>

              <div className="flex text-sm">
                <div className="flex-1 space-y-1">
                  <p className="text-gray-500 text-xs">EPS (прогноз)</p>
                  <p className="font-semibold text-gray-800">{earning.epsEstimate || '—'}</p>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-gray-500 text-xs">Выручка (прогноз)</p>
                  <p className="font-semibold text-gray-800">{earning.revenueEstimate || '—'}</p>
                </div>
                {!upcoming && gap ? (
                  <div className="flex-1 space-y-1">
                    <p className="text-gray-500 text-xs">Гэп на открытии</p>
                    <p className={`font-semibold ${gap.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {gapDollar ? gapDollar.text : ''}
                      {gapDollar && gapPercent ? ' ' : ''}
                      {gapPercent ? `(${gapPercent.text})` : ''}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {upcoming && registrationUrl ? (
        <div className="border-t border-gray-100 px-4 py-3">
          <a
            href={registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-brand-accent-dark text-white font-semibold rounded-md py-2.5 text-sm"
          >
            Зарегистрироваться на вебинар
          </a>
        </div>
      ) : !upcoming && recordingUrl ? (
        <div className="border-t border-gray-100 px-4 py-3">
          <a
            href={recordingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-brand text-white font-semibold rounded-md py-2.5 text-sm"
          >
            Смотреть видеозапись
          </a>
        </div>
      ) : null}
    </div>
  );
}
