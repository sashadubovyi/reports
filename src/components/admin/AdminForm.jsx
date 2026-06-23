import { useEffect, useState } from 'react';
import { LuSunrise, LuSunset } from 'react-icons/lu';
import { COMPANIES } from '../../data/companies.js';
import { calculateWebinarDate, formatWebinarDateTime } from '../../utils/dateUtils.js';

const EMPTY_FORM = {
  ticker: COMPANIES[0].ticker,
  quarter: '',
  reportDate: '',
  marketTiming: 'BMO',
  epsEstimate: '',
  revenueEstimate: '',
  gapDollar: '',
  gapPercent: '',
  registrationUrl: '',
  recordingUrl: '',
};

export default function AdminForm({ editingEarning, onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (editingEarning) {
      setForm({ ...EMPTY_FORM, ...editingEarning });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingEarning]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.reportDate || !form.quarter) return;
    const id = editingEarning ? editingEarning.id : `e-${Date.now()}`;
    onSave({ ...form, id });
  }

  const webinarPreview = form.reportDate ? calculateWebinarDate(form.reportDate, form.marketTiming) : null;

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <h3 className="font-bold text-gray-900">{editingEarning ? 'Редактировать карточку' : 'Новая карточка'}</h3>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Компания</label>
        <select
          value={form.ticker}
          onChange={(e) => update('ticker', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          {COMPANIES.map((c) => (
            <option key={c.ticker} value={c.ticker}>
              {c.name} ({c.ticker})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Квартал (например, Q2 2026)</label>
        <input
          type="text"
          value={form.quarter}
          onChange={(e) => update('quarter', e.target.value)}
          placeholder="Q2 2026"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Дата отчёта</label>
        <input
          type="date"
          value={form.reportDate}
          onChange={(e) => update('reportDate', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-gray-500">Время выхода отчёта</label>
        <div className="flex space-x-4 text-sm">
          <label className="flex items-center space-x-1">
            <input
              type="radio"
              name="marketTiming"
              value="BMO"
              checked={form.marketTiming === 'BMO'}
              onChange={() => update('marketTiming', 'BMO')}
            />
            <span className="inline-flex items-center gap-1">
              <LuSunrise className="w-4 h-4" /> До открытия (BMO)
            </span>
          </label>
          <label className="flex items-center space-x-1">
            <input
              type="radio"
              name="marketTiming"
              value="AMC"
              checked={form.marketTiming === 'AMC'}
              onChange={() => update('marketTiming', 'AMC')}
            />
            <span className="inline-flex items-center gap-1">
              <LuSunset className="w-4 h-4" /> После закрытия (AMC)
            </span>
          </label>
        </div>
        {webinarPreview ? (
          <p className="text-xs text-gray-500">
            Дата вебинара (расчёт): <span className="font-semibold text-brand">{formatWebinarDateTime(webinarPreview)}</span>
          </p>
        ) : null}
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

      <div className="flex space-x-3">
        <div className="flex-1 space-y-1">
          <label className="text-xs text-gray-500">Гэп на открытии, $</label>
          <input
            type="text"
            value={form.gapDollar}
            onChange={(e) => update('gapDollar', e.target.value)}
            placeholder="например, -1.80 или 3.12"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs text-gray-500">Гэп на открытии, %</label>
          <input
            type="text"
            value={form.gapPercent}
            onChange={(e) => update('gapPercent', e.target.value)}
            placeholder="например, -1.2 или 2.35"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Ссылка на регистрацию (вебинар)</label>
        <input
          type="url"
          value={form.registrationUrl}
          onChange={(e) => update('registrationUrl', e.target.value)}
          placeholder="https://..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Ссылка на видеозапись</label>
        <input
          type="url"
          value={form.recordingUrl}
          onChange={(e) => update('recordingUrl', e.target.value)}
          placeholder="https://..."
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
