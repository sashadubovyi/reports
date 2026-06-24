import { calculateWebinarDate, isUpcoming } from './dateUtils.js';

export function groupByReportDate(earnings) {
  const groups = new Map();
  earnings.forEach((earning) => {
    const list = groups.get(earning.reportDate) || [];
    list.push(earning);
    groups.set(earning.reportDate, list);
  });
  return groups;
}

// Used by the live home page so AMC reports group with whoever else's
// webinar lands on the same (possibly next-trading-day-shifted) date,
// instead of grouping by the raw calendar day the report was filed on.
export function groupByWebinarDate(earnings) {
  const groups = new Map();
  earnings.forEach((earning) => {
    const webinarDate = calculateWebinarDate(earning.reportDate, earning.marketTiming);
    const list = groups.get(webinarDate) || [];
    list.push(earning);
    groups.set(webinarDate, list);
  });
  return groups;
}

// Mirrors EarningsCard's "first non-empty link wins" display logic, but
// used here to seed the shared fields shown/edited in the admin group form.
export function getGroupSharedFields(groupEarnings) {
  return {
    registrationUrl: groupEarnings.find((e) => e.registrationUrl)?.registrationUrl || '',
    recordingUrl: groupEarnings.find((e) => e.recordingUrl)?.recordingUrl || '',
    webinarEnded: groupEarnings.some((e) => e.webinarEnded),
  };
}

// The single not-yet-ended, upcoming card for a ticker — the one the
// Companies tab's date/EPS/revenue fields edit and smart-reassign. Past or
// already-ended cards for the same ticker are left untouched.
export function findActiveEarning(earnings, ticker) {
  const candidates = earnings.filter((e) => e.ticker === ticker && isUpcoming(e.reportDate) && !e.webinarEnded);
  if (candidates.length === 0) return null;
  return candidates.sort((a, b) => a.reportDate.localeCompare(b.reportDate))[0];
}
