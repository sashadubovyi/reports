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

// All webinars run at a fixed time, regardless of the report date.
export const WEBINAR_TIME_LABEL = '16:00 МСК';

export function formatWebinarDateTime(isoDate) {
  return `${formatDisplayDate(isoDate)}, ${WEBINAR_TIME_LABEL}`;
}

// Past cards show only the date (full month name, no time) — the webinar
// time is no longer relevant once it's already happened.
export function formatPastCardDate(isoDate) {
  const date = parseISODate(isoDate);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
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

// Used to label a newly scheduled card when a date is set without a quarter
// being entered explicitly (e.g. via the Companies tab's date field).
export function deriveQuarterLabel(reportDate) {
  const [year, month] = reportDate.split('-').map(Number);
  return `Q${Math.ceil(month / 3)} ${year}`;
}
