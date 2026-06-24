import { useEffect, useState } from 'react';
import { LuX } from 'react-icons/lu';

const EMPTY_FORM = {
  date: '',
  tickers: [],
  type: 'normal',
  label: '',
  note: '',
  axisNote: '',
  profitDollar: '',
  profitPercent: '',
  balance: '',
};

const TYPE_OPTIONS = [
  { value: 'normal', label: 'Обычный торговый день' },
  { value: 'marathon', label: 'Марафон / рекорд' },
  { value: 'withdrawal', label: 'Вывод прибыли (сброс баланса)' },
];

export default function AdminTradingHistoryForm({ editingPoint, companies, onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [tickerToAdd, setTickerToAdd] = useState('');

  useEffect(() => {
    setForm(editingPoint ? { ...EMPTY_FORM, ...editingPoint } : EMPTY_FORM);
  }, [editingPoint]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addTicker() {
    if (!tickerToAdd || form.tickers.includes(tickerToAdd)) return;
    update('tickers', [...form.tickers, tickerToAdd]);
    setTickerToAdd('');
  }

  function removeTicker(ticker) {
    update('tickers', form.tickers.filter((t) => t !== ticker));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.date) return;
    const id = editingPoint ? editingPoint.id : `th-${Date.now()}`;
    onSave({
      ...form,
      id,
      profitDollar: parseFloat(form.profitDollar) || 0,
      profitPercent: parseFloat(form.profitPercent) || 0,
      balance: parseFloat(form.balance) || 0,
    });
  }

  const availableCompanies = companies.filter((c) => !form.tickers.includes(c.ticker));

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <h3 className="font-bold text-gray-900">{editingPoint ? 'Редактировать точку истории' : 'Новая точка истории'}</h3>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Дата</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => update('date', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Тип события</label>
        <select
          value={form.type}
          onChange={(e) => update('type', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Торгуемые акции (необязательно)</label>
        <div className="flex flex-wrap gap-1.5">
          {form.tickers.map((ticker) => (
            <span key={ticker} className="inline-flex items-center gap-1 bg-blue-50 text-brand text-xs font-semibold rounded-full px-2 py-1">
              {ticker}
              <button type="button" onClick={() => removeTicker(ticker)} aria-label={`Убрать ${ticker}`}>
                <LuX className="w-3 h-3" />
              </button>
            </span>
          ))}
          {form.tickers.length === 0 ? <span className="text-xs text-gray-400">—</span> : null}
        </div>
        <div className="flex space-x-2">
          <select
            value={tickerToAdd}
            onChange={(e) => setTickerToAdd(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Выбрать компанию...</option>
            {availableCompanies.map((c) => (
              <option key={c.ticker} value={c.ticker}>
                {c.name} ({c.ticker})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addTicker}
            disabled={!tickerToAdd}
            className="bg-gray-100 text-gray-700 font-semibold rounded-md px-4 text-sm disabled:opacity-50"
          >
            + Добавить
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Подпись (например, «Марафон AMZN»)</label>
        <input
          type="text"
          value={form.label}
          onChange={(e) => update('label', e.target.value)}
          placeholder={form.type === 'withdrawal' ? 'Вывод прибыли' : ''}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Комментарий в подсказке (необязательно)</label>
        <input
          type="text"
          value={form.note}
          onChange={(e) => update('note', e.target.value)}
          placeholder="например, «Баланс сброшен до 10 000 $»"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="flex space-x-3">
        <div className="flex-1 space-y-1">
          <label className="text-xs text-gray-500">Прибыль, $</label>
          <input
            type="number"
            step="0.01"
            value={form.profitDollar}
            onChange={(e) => update('profitDollar', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs text-gray-500">Прибыль, %</label>
          <input
            type="number"
            step="0.01"
            value={form.profitPercent}
            onChange={(e) => update('profitPercent', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs text-gray-500">Баланс, $</label>
          <input
            type="number"
            step="0.01"
            value={form.balance}
            onChange={(e) => update('balance', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Подпись на графике (необязательно)</label>
        <input
          type="text"
          value={form.axisNote}
          onChange={(e) => update('axisNote', e.target.value)}
          placeholder="например, «итог» — если в этот день уже есть другие точки"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="flex space-x-3">
        <button type="submit" className="flex-1 bg-brand text-white font-semibold rounded-md py-2.5 text-sm">
          Сохранить
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-600 font-semibold rounded-md py-2.5 text-sm"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
