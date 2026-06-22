import { useState } from 'react';

export default function CompanyLogo({ domain, ticker }) {
  const [failed, setFailed] = useState(false);

  if (!domain || failed) {
    return (
      <div className="w-9 h-9 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0">
        {ticker.slice(0, 2)}
      </div>
    );
  }

  return (
    <img
      src={`https://logo.clearbit.com/${domain}`}
      alt=""
      className="w-9 h-9 rounded border border-gray-200 bg-white object-contain flex-shrink-0"
      onError={() => setFailed(true)}
    />
  );
}
