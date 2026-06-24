import { openOfficialSite } from '../utils/smartRedirect.js';

// Navigates without a full page reload by reusing App.jsx's existing
// popstate listener (see getPageFromLocation), rather than threading a
// navigation callback down through every page that renders this Header.
function navigateTo(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function Header() {
  function handleLogoClick(e) {
    e.preventDefault();
    openOfficialSite();
  }

  function handleSeasonChange(e) {
    navigateTo(e.target.value === 'Q1-2026' ? '/q1report' : '/');
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3">
      <a href="https://ru.otrkitie.com/ru/" onClick={handleLogoClick} className="flex-shrink-0">
        <img src="/broker-color.svg" alt="OTKRITIE BROKER LTD" width="96" height="32" className="h-8 w-auto" />
      </a>
      <span className="h-5 w-px bg-gray-300 flex-shrink-0" aria-hidden="true" />
      <p className="text-xs text-gray-500 leading-tight flex-1">Календарь отчётностей и вебинаров</p>
      <select
        defaultValue="Q2-2026"
        onChange={handleSeasonChange}
        className="text-xs font-semibold text-brand bg-blue-50 border border-blue-200 rounded-md px-2 py-1.5 flex-shrink-0"
      >
        <option value="Q1-2026">Сезон: Q1 2026</option>
        <option value="Q2-2026">Сезон: Q2 2026 (Текущий)</option>
      </select>
    </header>
  );
}
