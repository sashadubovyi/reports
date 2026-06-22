// All dates are handled as plain "YYYY-MM-DD" strings and parsed as local
// dates (not UTC) to avoid off-by-one-day shifts in any timezone.

export function parseISODate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

export function getNextTradingDay(isoDate) {
  const date = parseISODate(isoDate);
  date.setDate(date.getDate() + 1);
  while (isWeekend(date)) {
    date.setDate(date.getDate() + 1);
  }
  return toISODate(date);
}

/**
 * BMO (Before Market Open): webinar is the same day as the report.
 * AMC (After Market Close): webinar rolls over to the next trading day,
 * skipping weekends (Friday AMC -> Monday webinar).
 */
export function calculateWebinarDate(reportDate, marketTiming) {
  if (marketTiming === 'AMC') {
    return getNextTradingDay(reportDate);
  }
  return reportDate;
}

export function formatDisplayDate(isoDate) {
  const date = parseISODate(isoDate);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatGroupDate(isoDate) {
  const date = parseISODate(isoDate);
  return `${date.getDate()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function isUpcoming(reportDate, referenceDate = new Date()) {
  const ref = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  return parseISODate(reportDate).getTime() >= ref.getTime();
}
