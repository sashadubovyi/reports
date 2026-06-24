import { parseISODate } from './dateUtils.js';

function formatAxisDate(isoDate) {
  return parseISODate(isoDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace(/\./g, '');
}

function formatFullDate(isoDate) {
  return parseISODate(isoDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatShortDate(isoDate) {
  return parseISODate(isoDate)
    .toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
    .replace(/\./g, '');
}

const DEFAULT_LABEL = { withdrawal: 'Вывод прибыли' };

// Turns raw, admin-edited trading-history points into the fully-derived
// shape the chart/stepper/list components render: chronologically sorted,
// with display strings (axis/full/short dates) computed from the stored
// ISO date rather than duplicated in Firestore. Same-day points are
// disambiguated on the x-axis by their tickers (or an explicit axisNote).
export function buildEquityCurvePoints(rawPoints) {
  const sorted = [...rawPoints].sort((a, b) => (a.date === b.date ? a.id.localeCompare(b.id) : a.date.localeCompare(b.date)));
  const sameDateCounts = sorted.reduce((acc, p) => acc.set(p.date, (acc.get(p.date) || 0) + 1), new Map());

  return sorted.map((p) => {
    const tickers = p.tickers || [];
    const axisSuffix = p.axisNote || (sameDateCounts.get(p.date) > 1 && tickers.length ? tickers.join('+') : '');
    return {
      ...p,
      tickers,
      fullDate: formatFullDate(p.date),
      dateLabel: formatShortDate(p.date),
      axisLabel: axisSuffix ? `${formatAxisDate(p.date)} (${axisSuffix})` : formatAxisDate(p.date),
      event: p.type === 'withdrawal',
      label: p.label || DEFAULT_LABEL[p.type] || '',
    };
  });
}
