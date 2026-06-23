import { LuSearch } from 'react-icons/lu';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="bg-white px-4 py-2 border-b border-gray-200">
      <div className="relative">
        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" aria-hidden="true" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Поиск по тикеру или названию компании..."
          aria-label="Поиск по тикеру или названию компании"
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
        />
      </div>
    </div>
  );
}
