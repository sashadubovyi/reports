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

// Webinars default to 16:00 MSK; individual cards may override the time
// via the optional webinarTime field ("HH:MM"), edited in the admin group
// form. Every helper below falls back to the default when no override is
// stored, so existing cards keep working unchanged.
export const DEFAULT_WEBINAR_TIME = '16:00';
const MSK_UTC_OFFSET_HOURS = 3; // MSK has been a fixed UTC+3 offset (no DST) since 2014.

function parseWebinarTime(time) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time || '');
  if (!match) return { hour: 16, minute: 0 };
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

export function formatWebinarTimeLabel(time) {
  return `${time || DEFAULT_WEBINAR_TIME} МСК`;
}

export function formatWebinarDateTime(isoDate, time) {
  return `${formatDisplayDate(isoDate)}, ${formatWebinarTimeLabel(time)}`;
}

// Webinars start at a fixed MSK time regardless of the visitor's local
// timezone, so the comparison is done against a fixed UTC instant rather
// than the browser's local time interpretation of that wall-clock time.
export function getWebinarStartTimestamp(isoDate, time) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const { hour, minute } = parseWebinarTime(time);
  return Date.UTC(year, month - 1, day, hour - MSK_UTC_OFFSET_HOURS, minute, 0);
}

export function isWebinarLive(isoDate, nowMs = Date.now(), time) {
  return nowMs >= getWebinarStartTimestamp(isoDate, time);
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
