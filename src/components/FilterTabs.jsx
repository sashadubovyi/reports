export default function FilterTabs({ activeTab, onChange }) {
  const tabs = [
    { key: 'upcoming', label: 'Предстоящие' },
    { key: 'past', label: 'Прошедшие' },
    { key: 'history', label: 'Торговая история' },
  ];

  return (
    <div className="flex border-b border-gray-200 bg-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={
              'flex-1 py-3 text-sm font-semibold border-b-2 ' +
              (isActive ? 'border-brand text-brand' : 'border-transparent text-gray-500')
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
