import { useState } from 'react';

// Tried in order until one loads. Local SVGs (manually curated, see
// public/icons/) are tried first since they're the highest quality and need
// no network round-trip; onError falls through to the remote sources below.
// Clearbit's domain-based lookup is blocked in some regions/networks, so a
// ticker-based source is tried before it. An admin-set logoUrl is an
// explicit override and skips the auto-fetch chain entirely.
function buildSources(domain, ticker, logoUrl) {
  if (logoUrl) return [logoUrl];
  const sources = [`/icons/${ticker.toLowerCase()}.svg`, `https://images.financialmodelingprep.com/symbol/${ticker}.png`];
  if (domain) sources.push(`https://logo.clearbit.com/${domain}`);
  return sources;
}

export default function CompanyLogo({ domain, ticker, logoUrl, size = 32, rounded = 'rounded' }) {
  const [sources] = useState(() => buildSources(domain, ticker, logoUrl));
  const [index, setIndex] = useState(0);

  if (index >= sources.length) {
    return (
      <div
        className={`${rounded} bg-gray-100 flex items-center justify-center font-bold text-gray-500 flex-shrink-0`}
        style={{ width: size, height: size, fontSize: Math.max(8, Math.round(size * 0.3)) }}
      >
        {ticker.slice(0, 2)}
      </div>
    );
  }

  return (
    <img
      key={sources[index]}
      src={sources[index]}
      alt=""
      width={size}
      height={size}
      className={`${rounded} object-contain flex-shrink-0`}
      style={{ width: size, height: size }}
      onError={() => setIndex((i) => i + 1)}
    />
  );
}
