import { useMemo, useState } from 'react';
import { LuMoon, LuSun } from 'react-icons/lu';
import CompanyLogo from '../components/CompanyLogo.jsx';
import Footer from '../components/Footer.jsx';
import TradingHistoryView from '../components/TradingHistoryView.jsx';
import { useFirestoreQ1Earnings } from '../hooks/useFirestoreQ1Earnings.js';
import { calculateWebinarDate, formatDisplayDate, formatWebinarDateTime } from '../utils/dateUtils.js';
import { openOfficialSite } from '../utils/smartRedirect.js';

// Isolated archive route (/q1report) — not linked from anywhere in the live
// app. Reads/writes only the 'earnings_q1_2026' Firestore collection via
// useFirestoreQ1Earnings, so it can never touch live Q2 data. The header
// below replicates Header.jsx's markup locally (with a page-specific title)
// instead of modifying the shared component.
function navigateTo(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function Q1Header() {
  function handleLogoClick(e) {
    e.preventDefault();
    openOfficialSite();
  }

  function handleSeasonChange(e) {
    navigateTo(e.target.value === 'Q1-2026' ? '/q1report' : '/');
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3">
      <a href="https://ru.otrkitie.com/ru/" onClick={handleLogoClick} className="flex-shrink-0">
        <img src="/broker-color.svg" alt="OTKRITIE BROKER LTD" width="96" height="32" className="h-8 w-auto" />
      </a>
      <span className="h-5 w-px bg-gray-300 flex-shrink-0" aria-hidden="true" />
      <p className="text-xs text-gray-500 leading-tight flex-1">Архив сезона Q1 2026</p>
      <select
        defaultValue="Q1-2026"
        onChange={handleSeasonChange}
        className="text-xs font-semibold text-brand bg-blue-50 border border-blue-200 rounded-md px-2 py-1.5 flex-shrink-0"
      >
        <option value="Q1-2026">Q1 2026</option>
        <option value="Q2-2026">Q2 2026</option>
      </select>
    </header>
  );
}

function formatSigned(raw, { prefix = '', suffix = '' } = {}) {
  if (raw === undefined || raw === null || raw === '') return null;
  const num = parseFloat(raw);
  if (Number.isNaN(num)) return null;
  const sign = num >= 0 ? '+' : '-';
  return { text: `${sign}${prefix}${Math.abs(num)}${suffix}`, positive: num >= 0 };
}

// Q1 archive earnings carry the raw report date (see q1Earnings.js), so
// cards here must be grouped by the calculated webinar date rather than by
// earning.reportDate directly — unlike the live EarningsList/groupByReportDate,
// which assumes reportDate already is the webinar date for Companies-tab-created
// cards. Kept local to this page to avoid touching that live grouping behavior.
function groupByWebinarDate(earnings) {
  const groups = new Map();
  earnings.forEach((earning) => {
    const webinarDate = calculateWebinarDate(earning.reportDate, earning.marketTiming);
    const list = groups.get(webinarDate) || [];
    list.push(earning);
    groups.set(webinarDate, list);
  });
  return groups;
}

function PastEarningsCard({ webinarDate, earnings, companyByTicker }) {
  const recordingUrl = earnings.find((earning) => earning.recordingUrl)?.recordingUrl;

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
        <h2 className="text-sm font-bold text-brand">
          {recordingUrl ? (
            <>
              <span className="text-gray-500 font-normal">Дата вебинара: </span>
              {formatWebinarDateTime(webinarDate)}
            </>
          ) : (
            formatDisplayDate(webinarDate)
          )}
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
                {gap ? (
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

      {recordingUrl ? (
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

function PastEarningsList({ earnings, companyByTicker }) {
  const groups = groupByWebinarDate(earnings);
  const sortedDates = Array.from(groups.keys()).sort((a, b) => b.localeCompare(a));

  if (sortedDates.length === 0) {
    return <p className="text-center text-gray-500 text-sm py-10">Нет прошедших отчётностей</p>;
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {sortedDates.map((webinarDate) => (
        <PastEarningsCard
          key={webinarDate}
          webinarDate={webinarDate}
          earnings={groups.get(webinarDate)}
          companyByTicker={companyByTicker}
        />
      ))}
    </div>
  );
}

export default function Q1ReportPage() {
  const [earnings] = useFirestoreQ1Earnings();
  const [tab, setTab] = useState('history');
  const companyByTicker = useMemo(
    () => new Map(earnings.map((e) => [e.ticker, { ticker: e.ticker, name: e.name }])),
    [earnings],
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Q1Header />

      <div className="flex border-b border-gray-200 bg-white">
        {[
          { key: 'history', label: 'Торговая история' },
          { key: 'past', label: 'Прошедшие' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={
              'flex-1 py-3 text-sm font-semibold border-b-2 ' +
              (tab === t.key ? 'border-brand text-brand' : 'border-transparent text-gray-500')
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="flex-1">
        {tab === 'past' ? (
          <PastEarningsList earnings={earnings} companyByTicker={companyByTicker} />
        ) : (
          <TradingHistoryView season="Q1-2026" />
        )}
      </main>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
