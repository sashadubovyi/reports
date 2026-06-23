import { LuTrash2 } from 'react-icons/lu';
import CompanyLogo from '../CompanyLogo.jsx';

export default function AdminCompanyTable({ companies, onEdit, onDelete }) {
  if (companies.length === 0) {
    return <p className="text-sm text-gray-500">Компаний пока нет</p>;
  }

  function handleDelete(company) {
    if (window.confirm(`Удалить компанию ${company.name} (${company.ticker})? Карточки с этим тикером останутся, но компания исчезнет из списков выбора.`)) {
      onDelete(company.ticker);
    }
  }

  const sorted = [...companies].sort((a, b) => a.ticker.localeCompare(b.ticker));

  return (
    <div className="space-y-2">
      {sorted.map((company) => (
        <div
          key={company.ticker}
          className="bg-white border border-gray-200 rounded-md p-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <CompanyLogo domain={company.domain} logoUrl={company.logoUrl} ticker={company.ticker} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {company.name} <span className="text-gray-500 font-normal">({company.ticker})</span>
              </p>
              <p className="text-xs text-gray-400 truncate max-w-xs">{company.logoUrl || 'Логотип подбирается автоматически'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => onEdit(company.ticker)}
              className="text-xs font-semibold text-brand px-2 py-1"
            >
              Изменить
            </button>
            <button
              type="button"
              onClick={() => handleDelete(company)}
              className="text-red-500 p-1"
              aria-label={`Удалить компанию ${company.name}`}
            >
              <LuTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
