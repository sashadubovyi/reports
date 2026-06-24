import { useMemo, useState } from 'react';
import EarningsList from '../components/EarningsList.jsx';
import { useFirestoreQ1Earnings } from '../hooks/useFirestoreQ1Earnings.js';
import { groupByReportDate } from '../utils/groupEarnings.js';
import { formatGroupDate } from '../utils/dateUtils.js';

// Isolated archive route (/q1report) — not linked from anywhere in the live
// app. Reads/writes only the 'earnings_q1_2026' Firestore collection via
// useFirestoreQ1Earnings, so it can never touch live Q2 data.
function parseGapDollar(earning) {
  const num = parseFloat(earning.gapDollar);
  return Number.isNaN(num) ? 0 : num;
}

function TradingHistoryView({ earnings }) {
  const rows = useMemo(() => {
    const groups = groupByReportDate(earnings);
    const dates = Array.from(groups.keys()).sort((a, b) => a.localeCompare(b));
    const withTotals = dates.map((date) => {
      const dayEarnings = groups.get(date);
      const total = dayEarnings.reduce((sum, e) => sum + parseGapDollar(e), 0);
      return { date, dayEarnings, total };
    });
    const maxAbs = Math.max(1, ...withTotals.map((r) => Math.abs(r.total)));
    return withTotals.map((r) => ({ ...r, barWidth: (Math.abs(r.total) / maxAbs) * 100 }));
  }, [earnings]);

  if (rows.length === 0) {
    return <p className="text-center text-gray-500 text-sm py-10">Нет данных по торговой истории</p>;
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {rows.map((row) => {
        const positive = row.total >= 0;
        return (
          <div key={row.date} className="bg-white border border-gray-300 rounded-lg shadow-sm p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">{formatGroupDate(row.date)}</span>
              <span className={`text-sm font-bold ${positive ? 'text-green-600' : 'text-red-600'}`}>
                {positive ? '+' : ''}
                {row.total.toFixed(2)} $
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {row.dayEarnings.map((e) => (
                <span key={e.id} className="text-xs font-medium bg-blue-50 text-brand rounded px-1.5 py-0.5">
                  {e.ticker}
                </span>
              ))}
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded overflow-hidden">
              <div
                className={`h-full rounded ${positive ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${row.barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Q1ReportPage() {
  const [earnings] = useFirestoreQ1Earnings();
  const [tab, setTab] = useState('past');
  const companies = useMemo(
    () => earnings.map((e) => ({ ticker: e.ticker, name: e.name, domain: undefined, logoUrl: undefined })),
    [earnings],
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <p className="text-sm font-bold text-brand">Архив сезона Q1 2026</p>
        <p className="text-xs text-gray-500">Изолированный архив прошедших отчётностей и торговой истории</p>
      </header>

      <div className="flex border-b border-gray-200 bg-white">
        {[
          { key: 'past', label: 'Прошедшие' },
          { key: 'history', label: 'Торговая история' },
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
          <EarningsList earnings={earnings} filter="past" companies={companies} />
        ) : (
          <TradingHistoryView earnings={earnings} />
        )}
      </main>
    </div>
  );
}
