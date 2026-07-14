import { useEffect, useState } from 'react';
import { LuSunrise, LuSunset, LuTrash2 } from 'react-icons/lu';
import { DEFAULT_WEBINAR_TIME, calculateWebinarDate, formatWebinarDateTime } from '../../utils/dateUtils.js';
import { getGroupSharedFields } from '../../utils/groupEarnings.js';

function rowFromEarning(earning) {
  return {
    id: earning.id,
    ticker: earning.ticker,
    quarter: earning.quarter,
    marketTiming: earning.marketTiming,
    epsEstimate: earning.epsEstimate ?? '',
    revenueEstimate: earning.revenueEstimate ?? '',
    gapDollar: earning.gapDollar ?? '',
    gapPercent: earning.gapPercent ?? '',
  };
}

export default function AdminGroupForm({ groupEarnings, companies, onSave, onCancel }) {
  const [reportDate, setReportDate] = useState('');
  const [webinarTime, setWebinarTime] = useState(DEFAULT_WEBINAR_TIME);
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [recordingUrl, setRecordingUrl] = useState('');
  const [webinarEnded, setWebinarEnded] = useState(false);
  const [rows, setRows] = useState([]);
  const [addTicker, setAddTicker] = useState('');

  useEffect(() => {
    setReportDate(groupEarnings[0]?.reportDate || '');
    const shared = getGroupSharedFields(groupEarnings);
    setRegistrationUrl(shared.registrationUrl);
    setRecordingUrl(shared.recordingUrl);
    setWebinarEnded(shared.webinarEnded);
    setWebinarTime(shared.webinarTime || DEFAULT_WEBINAR_TIME);
    setRows(groupEarnings.map(rowFromEarning));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupEarnings]);

  const availableCompanies = companies.filter((c) => !rows.some((r) => r.ticker === c.ticker));

  function updateRow(id, field, value) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function removeRow(id) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function handleAddTicker() {
    if (!addTicker) return;
    setRows((prev) => [
      ...prev,
      {
        id: `e-${Date.now()}`,
        ticker: addTicker,
        quarter: '',
        marketTiming: 'BMO',
        epsEstimate: '',
        revenueEstimate: '',
        gapDollar: '',
        gapPercent: '',
      },
    ]);
    setAddTicker('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!reportDate || rows.length === 0 || rows.some((r) => !r.quarter)) return;
    const updated = rows.map((row) => ({
      ...row,
      reportDate,
      registrationUrl,
      recordingUrl,
      webinarEnded,
      webinarTime: webinarTime || DEFAULT_WEBINAR_TIME,
    }));
    onSave(updated);
  }

  const webinarPreview = reportDate
    ? rows
        .map((row) => calculateWebinarDate(reportDate, row.marketTiming))
        .sort()
        .at(-1)
    : null;

  return (
    <form onSubmit={handleSubmit} className="p-4 pr-10 space-y-4">
      <h3 className="font-bold text-gray-900">Редактировать группу вебинара</h3>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Дата отчёта (общая для группы)</label>
        <input
          type="date"
          value={reportDate}
          onChange={(e) => setReportDate(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        {webinarPreview ? (
          <p className="text-xs text-gray-500">
            Дата вебинара (расчёт):{' '}
            <span className="font-semibold text-brand">{formatWebinarDateTime(webinarPreview, webinarTime)}</span>
          </p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Время вебинара, МСК (по умолчанию {DEFAULT_WEBINAR_TIME})</label>
        <input
          type="time"
          value={webinarTime}
          onChange={(e) => setWebinarTime(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Ссылка на регистрацию (вебинар, общая для группы)</label>
        <input
          type="url"
          value={registrationUrl}
          onChange={(e) => setRegistrationUrl(e.target.value)}
          placeholder="https://..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Ссылка на видеозапись (общая для группы)</label>
        <input
          type="url"
          value={recordingUrl}
          onChange={(e) => setRecordingUrl(e.target.value)}
          placeholder="https://..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="webinarEnded"
          checked={webinarEnded}
          onChange={(e) => setWebinarEnded(e.target.checked)}
        />
        <label htmlFor="webinarEnded" className="text-xs text-gray-500">
          Вебинар закончился (сразу переносит карточку в «Прошедшие»)
        </label>
      </div>

      <div className="space-y-3 border-t border-gray-100 pt-3">
        <p className="text-xs font-semibold text-gray-600">Компании в группе</p>
        {rows.map((row) => {
          const TimingIcon = row.marketTiming === 'BMO' ? LuSunrise : LuSunset;
          return (
            <div key={row.id} className="border border-gray-200 rounded-md p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">{row.ticker}</p>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className="text-red-500 p-1"
                  aria-label={`Удалить ${row.ticker} из группы`}
                >
                  <LuTrash2 className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                value={row.quarter}
                onChange={(e) => updateRow(row.id, 'quarter', e.target.value)}
                placeholder="Q2 2026"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />

              <div className="flex space-x-4 text-sm">
                <label className="flex items-center space-x-1">
                  <input
                    type="radio"
                    name={`marketTiming-${row.id}`}
                    checked={row.marketTiming === 'BMO'}
                    onChange={() => updateRow(row.id, 'marketTiming', 'BMO')}
                  />
                  <span className="inline-flex items-center gap-1">
                    <LuSunrise className="w-4 h-4" /> BMO
                  </span>
                </label>
                <label className="flex items-center space-x-1">
                  <input
                    type="radio"
                    name={`marketTiming-${row.id}`}
                    checked={row.marketTiming === 'AMC'}
                    onChange={() => updateRow(row.id, 'marketTiming', 'AMC')}
                  />
                  <span className="inline-flex items-center gap-1">
                    <LuSunset className="w-4 h-4" /> AMC
                  </span>
                </label>
                <span className="inline-flex items-center gap-1 text-gray-400">
                  <TimingIcon className="w-4 h-4" />
                </span>
              </div>

              <div className="flex space-x-3">
                <input
                  type="text"
                  value={row.epsEstimate}
                  onChange={(e) => updateRow(row.id, 'epsEstimate', e.target.value)}
                  placeholder="EPS (прогноз)"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  value={row.revenueEstimate}
                  onChange={(e) => updateRow(row.id, 'revenueEstimate', e.target.value)}
                  placeholder="Выручка (прогноз)"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="flex space-x-3">
                <input
                  type="text"
                  value={row.gapDollar}
                  onChange={(e) => updateRow(row.id, 'gapDollar', e.target.value)}
                  placeholder="Гэп, $"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  value={row.gapPercent}
                  onChange={(e) => updateRow(row.id, 'gapPercent', e.target.value)}
                  placeholder="Гэп, %"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          );
        })}

        {availableCompanies.length > 0 ? (
          <div className="flex space-x-2">
            <select
              value={addTicker}
              onChange={(e) => setAddTicker(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Добавить компанию в группу...</option>
              {availableCompanies.map((c) => (
                <option key={c.ticker} value={c.ticker}>
                  {c.name} ({c.ticker})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddTicker}
              disabled={!addTicker}
              className="bg-gray-100 text-gray-700 font-semibold rounded-md px-3 text-sm disabled:opacity-50"
            >
              + Добавить
            </button>
          </div>
        ) : null}
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
