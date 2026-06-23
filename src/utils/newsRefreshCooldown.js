const COOLDOWN_KEY = 'news_refresh_cooldown';
const COOLDOWN_MS = 10 * 60 * 1000;

export function getRefreshCooldownRemainingMs() {
  try {
    const timestamp = localStorage.getItem(COOLDOWN_KEY);
    if (!timestamp) return 0;
    return Math.max(0, COOLDOWN_MS - (Date.now() - Number(timestamp)));
  } catch {
    return 0;
  }
}

export function isRefreshOnCooldown() {
  return getRefreshCooldownRemainingMs() > 0;
}

export function startRefreshCooldown() {
  try {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  } catch {
    // best-effort
  }
}
