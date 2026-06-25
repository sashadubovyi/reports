export default function VideoOnlyToggle({ checked, onChange }) {
  return (
    <label className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 cursor-pointer">
      <span className="text-sm font-medium text-gray-700">Только с видеозаписью</span>
      <span className="relative inline-flex h-6 w-11 flex-shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-gray-200 transition-colors duration-200 peer-checked:bg-brand" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
