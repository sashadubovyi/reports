import { LuExternalLink } from 'react-icons/lu';
import { useCompanyProfile } from '../hooks/useCompanyProfile.js';
import CompanyLogo from './CompanyLogo.jsx';
import Modal from './Modal.jsx';

// Finnhub returns marketCapitalization in millions USD.
function formatMarketCap(millionsUSD) {
  if (!millionsUSD) return null;
  if (millionsUSD >= 1e6) return `$${(millionsUSD / 1e6).toFixed(2)} трлн`;
  if (millionsUSD >= 1000) return `$${(millionsUSD / 1000).toFixed(1)} млрд`;
  return `$${millionsUSD.toFixed(0)} млн`;
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 flex-shrink-0 w-36">{label}</span>
      <span className="text-xs font-semibold text-gray-800 text-right">{value}</span>
    </div>
  );
}

export default function CompanyModal({ ticker, company, onClose }) {
  const { profile, loading } = useCompanyProfile(ticker);

  const name = company?.name || profile?.name || ticker;
  const domain = company?.domain;
  const logoUrl = company?.logoUrl;
  const description = company?.description;
  const activities = company?.activities;
  const foundedYear = company?.foundedYear;

  const marketCap = formatMarketCap(profile?.marketCapitalization);
  const industry = company?.industry || profile?.finnhubIndustry;
  const exchange = profile?.exchange;
  const website = profile?.weburl;

  const hasLiveData = loading || marketCap || industry || exchange || website;

  return (
    <Modal open onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center space-x-3 mb-4">
          <CompanyLogo domain={domain} logoUrl={logoUrl} ticker={ticker} size={48} rounded="rounded-lg" />
          <div>
            <p className="text-base font-bold text-gray-900 leading-tight">{name}</p>
            <p className="text-xs text-gray-500 font-mono">{ticker}</p>
          </div>
        </div>

        {description ? (
          <p className="text-sm text-gray-700 leading-relaxed mb-4">{description}</p>
        ) : null}

        {activities?.length > 0 ? (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Основные направления</p>
            <ul className="space-y-1.5">
              {activities.map((item, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-700 leading-relaxed">
                  <span className="text-brand flex-shrink-0 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="bg-gray-50 rounded-lg px-3 py-1">
          <Row label="Год основания" value={foundedYear} />

          {loading ? (
            <div className="py-3 text-xs text-gray-400 text-center">Загружаем данные...</div>
          ) : hasLiveData ? (
            <>
              <Row label="Капитализация" value={marketCap} />
              <Row label="Биржа" value={exchange} />
              <Row label="Отрасль" value={industry} />
              {website ? (
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-xs text-gray-500 w-36">Сайт</span>
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand"
                  >
                    {new URL(website).hostname.replace(/^www\./, '')}
                    <LuExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
