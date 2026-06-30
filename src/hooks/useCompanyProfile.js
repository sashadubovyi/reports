import { useEffect, useState } from 'react';

// Fetches the live Finnhub company profile (market cap, exchange, industry,
// website) for a given ticker. Returns null while loading or if the key is
// not configured. Uses a cancel flag to avoid setting state after unmount.
export function useCompanyProfile(ticker) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ticker) {
      setProfile(null);
      return;
    }
    const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
    if (!apiKey) return;

    let cancelled = false;
    setProfile(null);
    setLoading(true);

    fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${apiKey}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setProfile(data && data.ticker ? data : null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ticker]);

  return { profile, loading };
}
