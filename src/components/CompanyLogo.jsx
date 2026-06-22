import { useState } from 'react';

// Tried in order until one loads. Clearbit's domain-based lookup is blocked
// in some regions/networks, so a ticker-based source is tried first.
function buildSources(domain, ticker) {
  const sources = [`https://images.financialmodelingprep.com/symbol/${ticker}.png`];
  if (domain) sources.push(`https://logo.clearbit.com/${domain}`);
  return sources;
}

export default function CompanyLogo({ domain, ticker }) {
  const [sources] = useState(() => buildSources(domain, ticker));
  const [index, setIndex] = useState(0);

  if (index >= sources.length) {
    return (
      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0">
        {ticker.slice(0, 2)}
      </div>
    );
  }

  return (
    <img
      key={sources[index]}
      src={sources[index]}
      alt=""
      className="w-8 h-8 rounded object-contain flex-shrink-0"
      onError={() => setIndex((i) => i + 1)}
    />
  );
}
