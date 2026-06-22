export default function DiscrepancyBanner({ discrepancies, checkStatus, lastCheck, onApply, onDismiss }) {
  if (checkStatus === null && discrepancies.length === 0) return null;

  const lastCheckLabel = lastCheck
    ? new Date(lastCheck).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="space-y-2">
      {checkStatus === 'checking' ? <p className="text-xs text-gray-400">Проверка данных через Finnhub…</p> : null}

      {checkStatus === 'error' ? (
        <p className="text-xs text-red-500">Не удалось проверить данные через Finnhub (см. консоль браузера).</p>
      ) : null}

      {discrepancies.length > 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
          <p className="text-sm font-semibold text-amber-800">Finnhub: найдено расхождений — {discrepancies.length}</p>
          {discrepancies.map((d) => (
            <div
              key={`${d.earningId}-${d.field}`}
              className="flex items-center justify-between bg-white rounded-md p-2 text-sm gap-2"
            >
              <div className="min-w-0">
                <span className="font-semibold">{d.ticker}</span>
                <span className="text-gray-400"> · {d.label}: </span>
                <span className="text-gray-400 line-through">{d.oldValue}</span>
                <span className="text-gray-400"> → </span>
                <span className="font-semibold text-amber-700">{d.newValue}</span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onApply(d)}
                  className="text-xs font-semibold text-brand px-2 py-1"
                >
                  Применить
                </button>
                <button
                  type="button"
                  onClick={() => onDismiss(d)}
                  className="text-xs text-gray-400 px-2 py-1"
                >
                  Игнорировать
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : checkStatus === 'ok' && lastCheckLabel ? (
        <p className="text-xs text-gray-400">Проверено через Finnhub: {lastCheckLabel} — расхождений не найдено</p>
      ) : null}
    </div>
  );
}
