import { useEffect, useState } from 'react';

const EMPTY_FORM = { ticker: '', name: '', logoUrl: '', reportDate: '', epsEstimate: '', revenueEstimate: '' };

export default function AdminCompanyForm({ editingCompany, existingTickers, activeEarning, onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(
      editingCompany
        ? {
            ...EMPTY_FORM,
            domain: '',
            ...editingCompany,
            reportDate: activeEarning?.reportDate || '',
            epsEstimate: activeEarning?.epsEstimate || '',
            revenueEstimate: activeEarning?.revenueEstimate || '',
          }
        : EMPTY_FORM,
    );
    setError('');
    // activeEarning is snapshotted by the parent alongside editingCompany when
    // the modal opens, so it intentionally isn't re-applied on every change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingCompany]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const ticker = form.ticker.trim().toUpperCase();
    if (!ticker || !form.name.trim()) return;
    if (!editingCompany && existingTickers.includes(ticker)) {
      setError('Такой тикер уже существует');
      return;
    }
    onSave({
      ...form,
      ticker,
      name: form.name.trim(),
      logoUrl: form.logoUrl.trim(),
      reportDate: form.reportDate,
      epsEstimate: form.epsEstimate.trim(),
      revenueEstimate: form.revenueEstimate.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <h3 className="font-bold text-gray-900">{editingCompany ? 'Редактировать компанию' : 'Новая компания'}</h3>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Тикер</label>
        <input
          type="text"
          value={form.ticker}
          onChange={(e) => update('ticker', e.target.value.toUpperCase())}
          disabled={Boolean(editingCompany)}
          placeholder="AAPL"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Название компании</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Apple Inc."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Ссылка на логотип (необязательно)</label>
        <input
          type="url"
          value={form.logoUrl}
          onChange={(e) => update('logoUrl', e.target.value)}
          placeholder="https://..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <p className="text-xs text-gray-400">Если не указано, логотип подбирается автоматически по тикеру/домену.</p>
      </div>

      <div className="space-y-1 border-t border-gray-100 pt-3">
        <label className="text-xs text-gray-500">Дата отчётности</label>
        <input
          type="date"
          value={form.reportDate}
          onChange={(e) => update('reportDate', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <p className="text-xs text-gray-400">
          Изменение даты автоматически переносит компанию в карточку другой группы (или создаёт новую).
        </p>
      </div>

      <div className="flex space-x-3">
        <div className="flex-1 space-y-1">
          <label className="text-xs text-gray-500">EPS (прогноз)</label>
          <input
            type="text"
            value={form.epsEstimate}
            onChange={(e) => update('epsEstimate', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs text-gray-500">Выручка (прогноз)</label>
          <input
            type="text"
            value={form.revenueEstimate}
            onChange={(e) => update('revenueEstimate', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error ? <p className="text-red-600 text-xs">{error}</p> : null}

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
