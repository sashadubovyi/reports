import { LuSunrise, LuSunset } from 'react-icons/lu';
import { getCompanyByTicker } from '../data/companies.js';
import { calculateWebinarDate, formatDisplayDate, formatGroupDate, isUpcoming } from '../utils/dateUtils.js';
import CompanyLogo from './CompanyLogo.jsx';

function formatSigned(raw, { prefix = '', suffix = '' } = {}) {
  if (raw === undefined || raw === null || raw === '') return null;
  const num = parseFloat(raw);
  if (Number.isNaN(num)) return null;
  const sign = num >= 0 ? '+' : '-';
  return { text: `${sign}${prefix}${Math.abs(num)}${suffix}`, positive: num >= 0 };
}

export default function EarningsCard({ reportDate, earnings }) {
  const upcoming = isUpcoming(reportDate);
  const webinarDate = earnings
    .map((earning) => calculateWebinarDate(earning.reportDate, earning.marketTiming))
    .sort()
    .at(-1);
  const registrationUrl = earnings.find((earning) => earning.registrationUrl)?.registrationUrl;
  const recordingUrl = earnings.find((earning) => earning.recordingUrl)?.recordingUrl;

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
        <h2 className="text-sm font-bold text-brand">{formatGroupDate(reportDate)}</h2>
      </div>

      <div className="divide-y divide-gray-100">
        {earnings.map((earning) => {
          const company = getCompanyByTicker(earning.ticker);
          const timingLabel = earning.marketTiming === 'BMO' ? 'До открытия рынка' : 'После закрытия рынка';
          const TimingIcon = earning.marketTiming === 'BMO' ? LuSunrise : LuSunset;
          const gapDollar = formatSigned(earning.gapDollar, { prefix: '$' });
          const gapPercent = formatSigned(earning.gapPercent, { suffix: '%' });
          const gap = gapDollar || gapPercent;
          return (
            <div key={earning.id} className="px-4 py-3 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2.5">
                  <CompanyLogo domain={company?.domain} ticker={earning.ticker} />
                  <div>
                    <p className="text-base font-bold text-gray-900">
                      {company ? company.name : earning.ticker}{' '}
                      <span className="text-gray-400 font-normal">({earning.ticker})</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {earning.quarter} · {timingLabel}
                    </p>
                  </div>
                </div>
                <span
                  className="p-1.5 rounded bg-blue-50 text-brand flex-shrink-0"
                  title={timingLabel}
                  aria-label={timingLabel}
                >
                  <TimingIcon className="w-4 h-4" />
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

              {!upcoming && gap ? (
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="text-gray-400 text-xs">Гэп на открытии:</span>
                  <span className={`font-semibold ${gap.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {gapDollar ? gapDollar.text : ''}
                    {gapDollar && gapPercent ? ' ' : ''}
                    {gapPercent ? `(${gapPercent.text})` : ''}
                  </span>
                </div>
              ) : null}
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
