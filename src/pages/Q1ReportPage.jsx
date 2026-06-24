import { useMemo, useState } from 'react';
import EarningsList from '../components/EarningsList.jsx';
import Footer from '../components/Footer.jsx';
import { useFirestoreQ1Earnings } from '../hooks/useFirestoreQ1Earnings.js';
import { openOfficialSite } from '../utils/smartRedirect.js';

// Isolated archive route (/q1report) — not linked from anywhere in the live
// app. Reads/writes only the 'earnings_q1_2026' Firestore collection via
// useFirestoreQ1Earnings, so it can never touch live Q2 data. The header
// below replicates Header.jsx's markup locally (with a page-specific title)
// instead of modifying the shared component.
function Q1Header() {
  function handleLogoClick(e) {
    e.preventDefault();
    openOfficialSite();
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3">
      <a href="https://ru.otrkitie.com/ru/" onClick={handleLogoClick} className="flex-shrink-0">
        <img src="/broker-color.svg" alt="OTKRITIE BROKER LTD" width="96" height="32" className="h-8 w-auto" />
      </a>
      <span className="h-5 w-px bg-gray-300 flex-shrink-0" aria-hidden="true" />
      <p className="text-xs text-gray-500 leading-tight">Архив сезона Q1 2026</p>
    </header>
  );
}

// Real account history for the Q1 2026 season, including the Jan 30
// withdrawal that reset the tracked balance back to $10,000.
const EQUITY_CURVE = [
  { date: '14 янв 2026', axisLabel: '14 янв', balance: 10650.0, profitPercent: 6.5, profitDollar: 650.0 },
  { date: '15 янв 2026', axisLabel: '15 янв', balance: 11526.5, profitPercent: 8.23, profitDollar: 876.5 },
  { date: '21 янв 2026', axisLabel: '21 янв', balance: 12656.1, profitPercent: 9.8, profitDollar: 1129.6 },
  { date: '22 янв 2026', axisLabel: '22 янв', balance: 13588.85, profitPercent: 7.37, profitDollar: 932.75 },
  { date: '23 янв 2026', axisLabel: '23 янв', balance: 14980.35, profitPercent: 10.24, profitDollar: 1391.5 },
  { date: '26 янв 2026', axisLabel: '26 янв', balance: 16514.35, profitPercent: 10.24, profitDollar: 1534.0 },
  { date: '27 янв 2026', axisLabel: '27 янв', balance: 17475.49, profitPercent: 5.82, profitDollar: 961.14 },
  { date: '29 янв 2026', axisLabel: '29 янв', balance: 20184.19, profitPercent: 15.5, profitDollar: 2708.7 },
  {
    date: '30 янв 2026',
    axisLabel: '30 янв',
    balance: 46441.8,
    profitPercent: 130.09,
    profitDollar: 26257.61,
    label: 'Вывод средств',
    note: 'Баланс сброшен до 10 000 $',
    event: true,
  },
  { date: '4 фев 2026', axisLabel: '4 фев', balance: 10170.0, profitPercent: 1.7, profitDollar: 170.0 },
  { date: '5 фев 2026', axisLabel: '5 фев', balance: 14206.47, profitPercent: 39.69, profitDollar: 4036.47 },
  {
    date: '6 фев 2026',
    axisLabel: '6 фев (AMZN)',
    balance: 18604.79,
    profitPercent: 30.96,
    profitDollar: 4398.32,
    label: 'Марафон AMZN',
  },
  {
    date: '6 фев 2026',
    axisLabel: '6 фев (NVDA+ZM)',
    balance: 26407.64,
    profitPercent: 41.94,
    profitDollar: 7802.85,
    label: 'Рекорд NVDA+ZM',
  },
  { date: '6 фев 2026', axisLabel: '6 фев (итог)', balance: 55685.79, profitPercent: 110.87, profitDollar: 29278.15 },
];

const POINT_GAP = 100;
const PADDING_X = 50;
const PADDING_TOP = 40;
const CHART_HEIGHT = 220;
const PADDING_BOTTOM = 30;

function formatMoney(value) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function EquityCurveChart({ points }) {
  const [hovered, setHovered] = useState(null);
  const [pinned, setPinned] = useState(null);
  const activeIndex = hovered ?? pinned;

  const width = PADDING_X * 2 + (points.length - 1) * POINT_GAP;
  const height = PADDING_TOP + CHART_HEIGHT + PADDING_BOTTOM;
  const bottomY = PADDING_TOP + CHART_HEIGHT;

  const values = points.map((p) => p.balance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = range * 0.15;
  const yMin = Math.max(0, min - pad);
  const yMax = max + pad;

  const x = (i) => PADDING_X + i * POINT_GAP;
  const y = (value) => PADDING_TOP + (1 - (value - yMin) / (yMax - yMin)) * CHART_HEIGHT;

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)},${y(p.balance)}`).join(' ');
  const areaPath = `${linePath} L ${x(points.length - 1)},${bottomY} L ${x(0)},${bottomY} Z`;

  const active = activeIndex !== null ? points[activeIndex] : null;
  const tooltipLines = active
    ? [
        active.date,
        `Прибыль: +${active.profitPercent}% / +$${formatMoney(active.profitDollar)}`,
        `Баланс: $${formatMoney(active.balance)}`,
        ...(active.label ? [active.label] : []),
        ...(active.note ? [active.note] : []),
      ]
    : [];
  const tooltipWidth = 180;
  const tooltipHeight = 16 + tooltipLines.length * 16;

  return (
    <div className="overflow-x-auto whitespace-nowrap">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
        <defs>
          <linearGradient id="equityArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill="url(#equityArea)" />
        <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p, i) => {
          if (i === 0) return null;
          const prev = points[i - 1];
          if (!p.event && !prev.event) return null;
          const midX = (x(i - 1) + x(i)) / 2;
          return (
            <g key={`reset-${i}`}>
              <line x1={midX} y1={PADDING_TOP} x2={midX} y2={bottomY} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x={midX} y={PADDING_TOP - 10} textAnchor="middle" className="fill-amber-500" fontSize="9" fontWeight="600">
                сброс баланса
              </text>
            </g>
          );
        })}

        {points.map((p, i) => (
          <text key={`axis-${i}`} x={x(i)} y={height - 8} textAnchor="middle" className="fill-gray-400" fontSize="9">
            {p.axisLabel}
          </text>
        ))}

        {points.map((p, i) => (
          <g
            key={`pt-${i}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setPinned((prevPinned) => (prevPinned === i ? null : i))}
            style={{ cursor: 'pointer' }}
          >
            <circle cx={x(i)} cy={y(p.balance)} r="14" fill="transparent" />
            <circle
              cx={x(i)}
              cy={y(p.balance)}
              r={p.event ? 6 : 4.5}
              fill={p.event ? '#f59e0b' : '#10b981'}
              stroke="white"
              strokeWidth="1.5"
            />
          </g>
        ))}

        {active
          ? (() => {
              const px = x(activeIndex);
              const py = y(active.balance);
              const tx = Math.min(Math.max(px - tooltipWidth / 2, PADDING_X - 30), width - PADDING_X + 30 - tooltipWidth);
              const ty = Math.max(py - tooltipHeight - 16, 4);
              return (
                <g pointerEvents="none">
                  <rect x={tx} y={ty} width={tooltipWidth} height={tooltipHeight} rx="6" fill="#0f172a" opacity="0.95" />
                  {tooltipLines.map((line, idx) => (
                    <text
                      key={idx}
                      x={tx + 10}
                      y={ty + 18 + idx * 16}
                      fontSize={idx === 0 ? '11' : '10.5'}
                      fontWeight={idx === 0 ? '700' : idx === 2 ? '700' : '400'}
                      fill={idx === 2 ? '#34d399' : idx === 0 ? '#ffffff' : '#cbd5e1'}
                    >
                      {line}
                    </text>
                  ))}
                </g>
              );
            })()
          : null}
      </svg>
    </div>
  );
}

function TradingHistoryView() {
  return (
    <div className="px-4 py-4 space-y-3">
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-3">
        <EquityCurveChart points={EQUITY_CURVE} />
      </div>
      <p className="text-[11px] text-gray-400 leading-snug">
        Прошлые результаты не гарантируют будущую доходность. Наведите курсор или нажмите на точку графика, чтобы
        увидеть детали.
      </p>
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
      <Q1Header />

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
        {tab === 'past' ? <EarningsList earnings={earnings} filter="past" companies={companies} /> : <TradingHistoryView />}
      </main>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
