import { isUpcoming } from './dateUtils.js';

const FINNHUB_BASE = 'https://finnhub.io/api/v1/calendar/earnings';
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
const RANGE_DAYS = 120;
const EPS_TOLERANCE = 0.01;
const REVENUE_TOLERANCE_RATIO = 0.01;

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function formatEps(rawNumber) {
  return rawNumber.toFixed(2);
}

function formatRevenue(rawNumber) {
  const billions = rawNumber / 1e9;
  if (Math.abs(billions) >= 1) {
    return `${parseFloat(billions.toFixed(2))}B`;
  }
  return `${parseFloat((rawNumber / 1e6).toFixed(1))}M`;
}

function parseRevenueString(raw) {
  if (!raw) return null;
  const match = /^([\d.]+)\s*([BM])$/i.exec(raw.trim());
  if (!match) return null;
  const num = parseFloat(match[1]);
  return match[2].toUpperCase() === 'B' ? num * 1e9 : num * 1e6;
}

function mapHour(hour) {
  if (hour === 'bmo') return 'BMO';
  if (hour === 'amc') return 'AMC';
  return null;
}

export function shouldRunCheck(lastCheckedAt) {
  if (!lastCheckedAt) return true;
  return Date.now() - new Date(lastCheckedAt).getTime() > CHECK_INTERVAL_MS;
}

export async function fetchEarningsDiscrepancies(earnings) {
  const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_FINNHUB_API_KEY не задан');
  }

  const upcoming = earnings.filter((e) => isUpcoming(e.reportDate));
  if (upcoming.length === 0) return [];

  const today = new Date();
  const to = new Date(today);
  to.setDate(to.getDate() + RANGE_DAYS);

  const url = `${FINNHUB_BASE}?from=${toISODate(today)}&to=${toISODate(to)}&token=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Finnhub вернул ошибку: ${res.status}`);
  }
  const data = await res.json();
  const items = Array.isArray(data.earningsCalendar) ? data.earningsCalendar : [];

  const byTicker = new Map();
  for (const item of items) {
    if (!byTicker.has(item.symbol)) byTicker.set(item.symbol, []);
    byTicker.get(item.symbol).push(item);
  }

  const discrepancies = [];

  for (const earning of upcoming) {
    const candidates = byTicker.get(earning.ticker);
    if (!candidates) continue;

    // A 120-day window can contain two reporting events for the same ticker
    // (this quarter and the next), so pick whichever is closest to our
    // stored date instead of an arbitrary one — otherwise estimates get
    // compared across mismatched quarters, producing nonsense diffs.
    const match = candidates.reduce((closest, candidate) =>
      !closest ||
      Math.abs(new Date(candidate.date) - new Date(earning.reportDate)) <
        Math.abs(new Date(closest.date) - new Date(earning.reportDate))
        ? candidate
        : closest,
    );

    if (match.date && match.date !== earning.reportDate) {
      discrepancies.push({
        earningId: earning.id,
        ticker: earning.ticker,
        field: 'reportDate',
        label: 'Дата отчёта',
        oldValue: earning.reportDate,
        newValue: match.date,
      });
    }

    const newHour = mapHour(match.hour);
    if (newHour && newHour !== earning.marketTiming) {
      discrepancies.push({
        earningId: earning.id,
        ticker: earning.ticker,
        field: 'marketTiming',
        label: 'Время выхода',
        oldValue: earning.marketTiming,
        newValue: newHour,
      });
    }

    if (typeof match.epsEstimate === 'number') {
      const oldEps = parseFloat(earning.epsEstimate);
      if (Number.isNaN(oldEps) || Math.abs(oldEps - match.epsEstimate) > EPS_TOLERANCE) {
        discrepancies.push({
          earningId: earning.id,
          ticker: earning.ticker,
          field: 'epsEstimate',
          label: 'EPS (прогноз)',
          oldValue: earning.epsEstimate || '—',
          newValue: formatEps(match.epsEstimate),
        });
      }
    }

    if (typeof match.revenueEstimate === 'number' && match.revenueEstimate > 0) {
      const oldRevenueRaw = parseRevenueString(earning.revenueEstimate);
      const diffRatio =
        oldRevenueRaw === null ? 1 : Math.abs(oldRevenueRaw - match.revenueEstimate) / match.revenueEstimate;
      if (diffRatio > REVENUE_TOLERANCE_RATIO) {
        discrepancies.push({
          earningId: earning.id,
          ticker: earning.ticker,
          field: 'revenueEstimate',
          label: 'Выручка (прогноз)',
          oldValue: earning.revenueEstimate || '—',
          newValue: formatRevenue(match.revenueEstimate),
        });
      }
    }
  }

  return discrepancies;
}
