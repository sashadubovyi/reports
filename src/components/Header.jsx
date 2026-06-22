export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3">
      <img src="/logonew.png" alt="OTKRITIE BROKER LTD" className="h-7 w-auto flex-shrink-0" />
      <span className="h-5 w-px bg-gray-300 flex-shrink-0" aria-hidden="true" />
      <p className="text-xs text-gray-500 leading-tight">Календарь отчётностей и вебинаров</p>
    </header>
  );
}
