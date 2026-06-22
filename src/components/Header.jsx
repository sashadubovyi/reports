import { openOfficialSite } from '../utils/smartRedirect.js';

export default function Header() {
  function handleLogoClick(e) {
    e.preventDefault();
    openOfficialSite();
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3">
      <a href="https://ru.otrkitie.com/ru/" onClick={handleLogoClick} className="flex-shrink-0">
        <img src="/broker-color.svg" alt="OTKRITIE BROKER LTD" className="h-8 w-auto" />
      </a>
      <span className="h-5 w-px bg-gray-300 flex-shrink-0" aria-hidden="true" />
      <p className="text-xs text-gray-500 leading-tight">Календарь отчётностей и вебинаров</p>
    </header>
  );
}
