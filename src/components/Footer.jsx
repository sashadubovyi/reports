export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 px-4 py-6">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
        <div className="text-[11px] leading-snug space-y-0.5 text-left">
          <p className="font-semibold text-gray-300">Правовая информация</p>
          <p>АО «ОТКРЫТИЕ БРОКЕР Эл Ти Ди» © 2026</p>
          <p>
            Все права защищены. Лицензия № 294/16 от 28 января 2016 г. выдана Комиссией по ценным бумагам и биржам
            Кипра (CySec)
          </p>
        </div>
        <a href="?page=admin" className="inline-block flex-shrink-0">
          <img
            src="/broker.svg"
            alt="Admin"
            width="72"
            height="24"
            className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity"
          />
        </a>
      </div>
    </footer>
  );
}
