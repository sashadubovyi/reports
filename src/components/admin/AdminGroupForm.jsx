import { useEffect, useState } from 'react';
import { LuSunrise, LuSunset, LuTrash2 } from 'react-icons/lu';
import { DEFAULT_WEBINAR_TIME, calculateWebinarDate, formatDisplayDate } from '../../utils/dateUtils.js';
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

const EMPTY_SHARED = {
  registrationUrl: '',
  recordingUrl: '',
  webinarEnded: false,
  webinarTime: DEFAULT_WEBINAR_TIME,
};

// A report-date group can span TWO webinars: BMO members present the same
// day, AMC members roll over to the next trading day and join that day's
// card on the site. Links/time/ended are therefore edited PER webinar date
// (one section per date) and saved only onto that date's members — so a
// registration link given to the 21.07 webinar can never leak onto the
// 22.07 card via an AMC member.
export default function AdminGroupForm({ groupEarnings, companies, onSave, onCancel }) {
  const [reportDate, setReportDate] = useState('');
  const [sharedByDate, setSharedByDate] = useState({});
  const [rows, setRows] = useState([]);
  const [addTicker, setAddTicker] = useState('');

  useEffect(() => {
    setReportDate(groupEarnings[0]?.reportDate || '');
    const byDate = {};
    groupEarnings.forEach((e) => {
      const webinarDate = calculateWebinarDate(e.reportDate, e.marketTiming);
      if (!byDate[webinarDate]) {
        const members = groupEarnings.filter(
          (g) => calculateWebinarDate(g.reportDate, g.marketTiming) === webinarDate,
        );
        const shared = getGroupSharedFields(members);
        byDate[webinarDate] = { ...shared, webinarTime: shared.webinarTime || DEFAULT_WEBINAR_TIME };
      }
    });
    setSharedByDate(byDate);
    setRows(groupEarnings.map(rowFromEarning));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupEarnings]);

  function getShared(webinarDate) {
    return sharedByDate[webinarDate] || EMPTY_SHARED;
  }

  function updateShared(webinarDate, field, value) {
    setSharedByDate((prev) => ({
      ...prev,
      [webinarDate]: { ...(prev[webinarDate] || EMPTY_SHARED), [field]: value },
    }));
  }

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
    const updated = rows.map((row) => {
      const shared = getShared(calculateWebinarDate(reportDate, row.marketTiming));
      return {
        ...row,
        reportDate,
        registrationUrl: shared.registrationUrl,
        recordingUrl: shared.recordingUrl,
        webinarEnded: shared.webinarEnded,
        webinarTime: shared.webinarTime || DEFAULT_WEBINAR_TIME,
      };
    });
    onSave(updated);
  }

  // One section per distinct webinar date among the current rows.
  const sectionMap = new Map();
  if (reportDate) {
    rows.forEach((row) => {
      const webinarDate = calculateWebinarDate(reportDate, row.marketTiming);
      const list = sectionMap.get(webinarDate) || [];
      list.push(row);
      sectionMap.set(webinarDate, list);
    });
  }
  const sectionDates = [...sectionMap.keys()].sort();

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
      </div>

      {sectionDates.map((webinarDate) => {
        const shared = getShared(webinarDate);
        const tickers = sectionMap.get(webinarDate).map((r) => r.ticker).join(', ');
        const multi = sectionDates.length > 1;
        return (
          <div
            key={webinarDate}
            className={multi ? 'border border-blue-200 bg-blue-50/50 rounded-md p-3 space-y-3' : 'space-y-3'}
          >
            <p className="text-xs font-semibold text-brand">
              Вебинар {formatDisplayDate(webinarDate)}
              {multi ? ` — ${tickers}` : ''}
            </p>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">Время вебинара, МСК (по умолчанию {DEFAULT_WEBINAR_TIME})</label>
              <input
                type="time"
                value={shared.webinarTime}
                onChange={(e) => updateShared(webinarDate, 'webinarTime', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">Ссылка на регистрацию (вебинар)</label>
              <input
                type="url"
                value={shared.registrationUrl}
                onChange={(e) => updateShared(webinarDate, 'registrationUrl', e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">Ссылка на видеозапись</label>
              <input
                type="url"
                value={shared.recordingUrl}
                onChange={(e) => updateShared(webinarDate, 'recordingUrl', e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`webinarEnded-${webinarDate}`}
                checked={shared.webinarEnded}
                onChange={(e) => updateShared(webinarDate, 'webinarEnded', e.target.checked)}
              />
              <label htmlFor={`webinarEnded-${webinarDate}`} className="text-xs text-gray-500">
                Вебинар закончился (сразу переносит карточку в «Прошедшие»)
              </label>
            </div>
          </div>
        );
      })}

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
