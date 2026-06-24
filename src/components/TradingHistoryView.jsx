import { useEffect, useMemo, useRef, useState } from 'react';
import { useFirestoreTradingHistory } from '../hooks/useFirestoreTradingHistory.js';
import { buildEquityCurvePoints } from '../utils/equityCurve.js';

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
    active.dateLabel,
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
          if (!prev.event) return null;
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
            <span className="text-gray-600 whitespace-nowrap">{p.dateLabel}</span>
            <span className="text-gray-500 truncate">{p.tickers && p.tickers.length ? p.tickers.join(', ') : '—'}</span>
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

export default function TradingHistoryView({ season }) {
  const [rawPoints] = useFirestoreTradingHistory(season);
  const points = useMemo(() => buildEquityCurvePoints(rawPoints), [rawPoints]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= points.length) setActiveIndex(Math.max(0, points.length - 1));
  }, [points.length, activeIndex]);

  if (points.length === 0) {
    return <p className="text-center text-gray-500 text-sm py-10">Торговая история пока не заполнена</p>;
  }

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-3">
        <EquityCurveChart points={points} activeIndex={activeIndex} onSelect={setActiveIndex} />
      </div>

      <EquityStepper points={points} activeIndex={activeIndex} onSelect={setActiveIndex} />

      <TransactionsList points={points} activeIndex={activeIndex} onSelect={setActiveIndex} />

      <p className="text-[11px] text-gray-400 leading-snug">
        Прошлые результаты не гарантируют будущую доходность. Наведите курсор, нажмите на точку графика или
        используйте стрелки, чтобы увидеть детали.
      </p>
    </div>
  );
}
