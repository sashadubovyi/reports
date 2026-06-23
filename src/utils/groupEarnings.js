export function groupByReportDate(earnings) {
  const groups = new Map();
  earnings.forEach((earning) => {
    const list = groups.get(earning.reportDate) || [];
    list.push(earning);
    groups.set(earning.reportDate, list);
  });
  return groups;
}

// Mirrors EarningsCard's "first non-empty link wins" display logic, but
// used here to seed the shared link fields shown/edited in the admin group form.
export function getGroupSharedLinks(groupEarnings) {
  return {
    registrationUrl: groupEarnings.find((e) => e.registrationUrl)?.registrationUrl || '',
    recordingUrl: groupEarnings.find((e) => e.recordingUrl)?.recordingUrl || '',
  };
}
