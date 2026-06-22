export default function Header() {
  return (
    <header className="bg-brand text-white px-4 py-3 flex items-center space-x-3">
      <div
        className="w-10 h-10 bg-white rounded flex items-center justify-center text-brand font-bold text-xs flex-shrink-0"
        aria-label="Логотип OTKRITIE BROKER LTD"
      >
        OB
      </div>
      <div>
        <h1 className="text-base font-bold leading-tight">OTKRITIE BROKER LTD</h1>
        <p className="text-xs text-blue-100 leading-tight">Календарь отчётностей и вебинаров</p>
      </div>
    </header>
  );
}
