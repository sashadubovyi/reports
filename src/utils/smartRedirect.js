// Official landing page mirrors, tried in order until one responds.
const MIRROR_URLS = [
  'https://ru.otrkitie.com/ru/',
  'https://ru.otkritie.org/ru/',
  'https://new.otrkitie.com/ru/',
  'https://new.otkritie.org/ru/',
];

function pingUrl(url, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      resolve(false);
    }, timeoutMs);
    // mode: 'no-cors' lets us detect a successful connection (even to a
    // cross-origin host) without needing to read the (opaque) response.
    fetch(url, { mode: 'no-cors', signal: controller.signal })
      .then(() => {
        clearTimeout(timer);
        resolve(true);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(false);
      });
  });
}

// Opens a blank tab synchronously (so popup blockers don't interfere with
// the async lookup below), strips window.opener to avoid reverse-tabnabbing,
// then navigates it to the first mirror that responds.
export async function openOfficialSite(urls = MIRROR_URLS) {
  const win = window.open('', '_blank');
  if (win) win.opener = null;

  for (const url of urls) {
    // eslint-disable-next-line no-await-in-loop
    const reachable = await pingUrl(url);
    if (reachable) {
      if (win) win.location.href = url;
      return url;
    }
  }

  const fallback = urls[urls.length - 1];
  if (win) win.location.href = fallback;
  return fallback;
}
