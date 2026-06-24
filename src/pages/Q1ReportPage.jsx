import { useEffect, useMemo, useRef, useState } from 'react';
import CompanyLogo from '../components/CompanyLogo.jsx';
import Footer from '../components/Footer.jsx';
import { useFirestoreQ1Earnings } from '../hooks/useFirestoreQ1Earnings.js';
import { calculateWebinarDate, formatPastCardDate } from '../utils/dateUtils.js';
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

// Real account history for the Q1 2026 season, including the Jan 30
// withdrawal that reset the tracked balance back to $10,000.
const EQUITY_CURVE = [
  { date: '14 янв 2026', fullDate: '14 января 2026', axisLabel: '14 янв', balance: 10650.0, profitPercent: 6.5, profitDollar: 650.0 },
  { date: '15 янв 2026', fullDate: '15 января 2026', axisLabel: '15 янв', balance: 11526.5, profitPercent: 8.23, profitDollar: 876.5 },
  { date: '21 янв 2026', fullDate: '21 января 2026', axisLabel: '21 янв', balance: 12656.1, profitPercent: 9.8, profitDollar: 1129.6 },
  { date: '22 янв 2026', fullDate: '22 января 2026', axisLabel: '22 янв', balance: 13588.85, profitPercent: 7.37, profitDollar: 932.75 },
  { date: '23 янв 2026', fullDate: '23 января 2026', axisLabel: '23 янв', balance: 14980.35, profitPercent: 10.24, profitDollar: 1391.5 },
  { date: '26 янв 2026', fullDate: '26 января 2026', axisLabel: '26 янв', balance: 16514.35, profitPercent: 10.24, profitDollar: 1534.0 },
  { date: '27 янв 2026', fullDate: '27 января 2026', axisLabel: '27 янв', balance: 17475.49, profitPercent: 5.82, profitDollar: 961.14 },
  { date: '29 янв 2026', fullDate: '29 января 2026', axisLabel: '29 янв', balance: 20184.19, profitPercent: 15.5, profitDollar: 2708.7 },
  {
    date: '30 янв 2026',
    fullDate: '30 января 2026',
    axisLabel: '30 янв',
    balance: 46441.8,
    profitPercent: 130.09,
    profitDollar: 26257.61,
    label: 'Вывод прибыли',
    note: 'Баланс сброшен до 10 000 $',
    event: true,
  },
  { date: '4 фев 2026', fullDate: '4 февраля 2026', axisLabel: '4 фев', balance: 10170.0, profitPercent: 1.7, profitDollar: 170.0 },
  { date: '5 фев 2026', fullDate: '5 февраля 2026', axisLabel: '5 фев', balance: 14206.47, profitPercent: 39.69, profitDollar: 4036.47 },
  {
    date: '6 фев 2026',
    fullDate: '6 февраля 2026',
    axisLabel: '6 фев (AMZN)',
    balance: 18604.79,
    profitPercent: 30.96,
    profitDollar: 4398.32,
    label: 'Марафон AMZN',
    companies: ['AMZN'],
  },
  {
    date: '6 фев 2026',
    fullDate: '6 февраля 2026',
    axisLabel: '6 фев (NVDA+ZM)',
    balance: 26407.64,
    profitPercent: 41.94,
    profitDollar: 7802.85,
    label: 'Рекорд NVDA+ZM',
    companies: ['NVDA', 'ZM'],
  },
  {
    date: '6 фев 2026',
    fullDate: '6 февраля 2026',
    axisLabel: '6 фев (итог)',
    balance: 55685.79,
    profitPercent: 110.87,
    profitDollar: 29278.15,
  },
];

const POINT_GAP = 100;
const PADDING_X = 50;
const PADDING_TOP = 40;
const CHART_HEIGHT = 220;
const PADDING_BOTTOM = 30;

function formatMoney(value) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatStepperLabel(point) {
  const amount = `+$${formatMoney(point.profitDollar)} (+${point.profitPercent}%)`;
  return point.label ? `${point.fullDate} • ${amount} • ${point.label.toUpperCase()}` : `${point.fullDate} • ${amount}`;
}

function EquityCurveChart({ points, activeIndex, onSelect }) {
  const [hovered, setHovered] = useState(null);
  const displayIndex = hovered ?? activeIndex;
  const scrollRef = useRef(null);

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

  const active = points[displayIndex];
  const tooltipLines = [
    active.date,
    `Прибыль: +${active.profitPercent}% / +$${formatMoney(active.profitDollar)}`,
    `Баланс: $${formatMoney(active.balance)}`,
    ...(active.label ? [active.label] : []),
    ...(active.note ? [active.note] : []),
  ];
  const tooltipWidth = 180;
  const tooltipHeight = 16 + tooltipLines.length * 16;

  // Keeps the selected endpoint centered in the scrollable viewport,
  // whether it was picked from the chart itself, the stepper, or the list.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const targetX = x(activeIndex);
    const maxScroll = container.scrollWidth - container.clientWidth;
    const center = Math.max(0, Math.min(targetX - container.clientWidth / 2, maxScroll));
    container.scrollTo({ left: center, behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  return (
    <div ref={scrollRef} className="overflow-x-auto whitespace-nowrap">
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
                вывод прибыли
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
            onClick={() => onSelect(i)}
            style={{ cursor: 'pointer' }}
          >
            <circle cx={x(i)} cy={y(p.balance)} r="14" fill="transparent" />
            {i === activeIndex ? (
              <circle cx={x(i)} cy={y(p.balance)} r="9" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.5" />
            ) : null}
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

        {(() => {
          const px = x(displayIndex);
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
        })()}
      </svg>
    </div>
  );
}

function EquityStepper({ points, activeIndex, onSelect }) {
  const point = points[activeIndex];
  return (
    <div className="flex items-center justify-between gap-2 px-1">
      <button
        type="button"
        onClick={() => onSelect((activeIndex - 1 + points.length) % points.length)}
        aria-label="Предыдущая точка"
        className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 text-gray-600 text-2xl font-bold flex items-center justify-center active:bg-gray-200"
      >
        ‹
      </button>
      <p className="flex-1 text-center text-xs sm:text-sm font-semibold text-gray-700 truncate">
        {formatStepperLabel(point)}
      </p>
      <button
        type="button"
        onClick={() => onSelect((activeIndex + 1) % points.length)}
        aria-label="Следующая точка"
        className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 text-gray-600 text-2xl font-bold flex items-center justify-center active:bg-gray-200"
      >
        ›
      </button>
    </div>
  );
}

function TransactionsList({ points, activeIndex, onSelect }) {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
      <div className="grid grid-cols-[auto_1fr_auto] gap-2 px-3 py-2 bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase">
        <span>Дата</span>
        <span>Акции</span>
        <span className="text-right">Прибыль / Вывод</span>
      </div>
      <div className="divide-y divide-gray-100">
        {points.map((p, i) => (
          <button
            key={`${p.axisLabel}-${i}`}
            type="button"
            onClick={() => onSelect(i)}
            className={
              'w-full grid grid-cols-[auto_1fr_auto] gap-2 px-3 py-2.5 text-left text-xs items-center ' +
              (i === activeIndex ? 'bg-blue-50' : '')
            }
          >
            <span className="text-gray-600 whitespace-nowrap">{p.date}</span>
            <span className="text-gray-500 truncate">{p.companies ? p.companies.join(', ') : '—'}</span>
            <span className={`font-semibold whitespace-nowrap text-right ${p.event ? 'text-amber-600' : 'text-green-600'}`}>
              {p.event ? 'ВЫВОД ' : '+'}
              {p.event ? '' : '$'}
              {formatMoney(p.profitDollar)} ({p.profitPercent}%)
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TradingHistoryView() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-3">
        <EquityCurveChart points={EQUITY_CURVE} activeIndex={activeIndex} onSelect={setActiveIndex} />
      </div>

      <EquityStepper points={EQUITY_CURVE} activeIndex={activeIndex} onSelect={setActiveIndex} />

      <TransactionsList points={EQUITY_CURVE} activeIndex={activeIndex} onSelect={setActiveIndex} />

      <p className="text-[11px] text-gray-400 leading-snug">
        Прошлые результаты не гарантируют будущую доходность. Наведите курсор, нажмите на точку графика или
        используйте стрелки, чтобы увидеть детали.
      </p>
    </div>
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
          <span className="text-gray-500 font-normal">Дата вебинара: </span>
          {formatPastCardDate(webinarDate)}
        </h2>
      </div>

      <div className="divide-y divide-gray-100">
        {earnings.map((earning) => {
          const company = companyByTicker.get(earning.ticker);
          const timingLabel = earning.marketTiming === 'BMO' ? 'До открытия' : 'После закрытия';
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
                <span className="text-[11px] font-semibold text-brand bg-blue-50 rounded px-2 py-1 flex-shrink-0 whitespace-nowrap">
                  Отчёт: {timingLabel}
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
          <TradingHistoryView />
        )}
      </main>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
