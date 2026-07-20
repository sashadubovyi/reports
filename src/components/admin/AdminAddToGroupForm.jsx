import { useState } from 'react';
import { LuSunrise, LuSunset } from 'react-icons/lu';
import { calculateReportDate, formatDisplayDate } from '../../utils/dateUtils.js';
import { groupByWebinarDate, getGroupSharedFields } from '../../utils/groupEarnings.js';

// Group selection is by WEBINAR date (same as the site's cards); the new
// member's stored reportDate derives from that date and its BMO/AMC timing.
export default function AdminAddToGroupForm({ earnings, companies, onSave, onCancel }) {
  const groups = groupByWebinarDate(earnings);
  const sortedDates = Array.from(groups.keys()).sort((a, b) => b.localeCompare(a));

  const [webinarDate, setWebinarDate] = useState(sortedDates[0] || '');
  const [ticker, setTicker] = useState('');
  const [quarter, setQuarter] = useState('');
  const [marketTiming, setMarketTiming] = useState('BMO');
  const [epsEstimate, setEpsEstimate] = useState('');
  const [revenueEstimate, setRevenueEstimate] = useState('');

  const groupEarnings = groups.get(webinarDate) || [];
  const availableCompanies = companies.filter((c) => !groupEarnings.some((e) => e.ticker === c.ticker));
  const { registrationUrl, recordingUrl, webinarEnded, webinarTime } = getGroupSharedFields(groupEarnings);
  const reportDatePreview = webinarDate ? calculateReportDate(webinarDate, marketTiming) : null;

  if (sortedDates.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <p className="text-sm text-gray-500">Пока нет ни одной группы — сначала создайте отдельную карточку.</p>
        <button
          type="button"
          onClick={onCancel}
          className="w-full bg-gray-100 text-gray-600 font-semibold rounded-md py-2.5 text-sm"
        >
          Отмена
        </button>
      </div>
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!webinarDate || !ticker || !quarter) return;
    onSave({
      id: `e-${Date.now()}`,
      ticker,
      quarter,
      reportDate: calculateReportDate(webinarDate, marketTiming),
      marketTiming,
      epsEstimate,
      revenueEstimate,
      gapDollar: '',
      gapPercent: '',
      registrationUrl,
      recordingUrl,
      webinarEnded,
      webinarTime,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <h3 className="font-bold text-gray-900">Добавить в существующую группу</h3>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Группа (дата вебинара)</label>
        <select
          value={webinarDate}
          onChange={(e) => {
            setWebinarDate(e.target.value);
            setTicker('');
          }}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          {sortedDates.map((date) => (
            <option key={date} value={date}>
              {formatDisplayDate(date)} — {groups.get(date).map((e) => e.ticker).join(' + ')}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-400">
          Общая ссылка на регистрацию: {registrationUrl || 'не указана'}
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Компания</label>
        <select
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">Выберите компанию...</option>
          {availableCompanies.map((c) => (
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
          value={quarter}
          onChange={(e) => setQuarter(e.target.value)}
          placeholder="Q2 2026"
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
              checked={marketTiming === 'BMO'}
              onChange={() => setMarketTiming('BMO')}
            />
            <span className="inline-flex items-center gap-1">
              <LuSunrise className="w-4 h-4" /> До открытия (BMO)
            </span>
          </label>
          <label className="flex items-center space-x-1">
            <input
              type="radio"
              name="marketTiming"
              checked={marketTiming === 'AMC'}
              onChange={() => setMarketTiming('AMC')}
            />
            <span className="inline-flex items-center gap-1">
              <LuSunset className="w-4 h-4" /> После закрытия (AMC)
            </span>
          </label>
        </div>
        {reportDatePreview ? (
          <p className="text-xs text-gray-500">
            Дата отчёта (расчёт): <span className="font-semibold text-brand">{formatDisplayDate(reportDatePreview)}</span>
          </p>
        ) : null}
      </div>

      <div className="flex space-x-3">
        <div className="flex-1 space-y-1">
          <label className="text-xs text-gray-500">EPS (прогноз)</label>
          <input
            type="text"
            value={epsEstimate}
            onChange={(e) => setEpsEstimate(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs text-gray-500">Выручка (прогноз)</label>
          <input
            type="text"
            value={revenueEstimate}
            onChange={(e) => setRevenueEstimate(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={availableCompanies.length === 0}
          className="flex-1 bg-brand text-white font-semibold rounded-md py-2.5 text-sm disabled:opacity-50"
        >
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
