import { useEffect, useMemo, useRef, useState } from 'react';
import Footer from '../components/Footer.jsx';
import { useFirestoreTradingHistory } from '../hooks/useFirestoreTradingHistory.js';
import { openOfficialSite } from '../utils/smartRedirect.js';

const MIN_AMOUNT = 10000;
const ANIMATION_MS = 2500;

function formatMoney(value) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function MissedProfitHeader() {
  function handleLogoClick(e) {
    e.preventDefault();
    openOfficialSite();
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3">
      <a href="https://ru.otrkitie.com/ru/" onClick={handleLogoClick} className="flex-shrink-0">
        <img src="/broker-color.svg" alt="OTKRITIE BROKER LTD" width="96" height="32" className="h-8 w-auto" />
      </a>
      <span className="h-5 w-px bg-gray-300 flex-shrink-0" aria-hidden="true" />
      <p className="text-xs text-gray-500 leading-tight flex-1">Калькулятор упущенной прибыли</p>
    </header>
  );
}

export default function MissedProfitPage() {
  const [points] = useFirestoreTradingHistory('Q2-2026');
  const [amountInput, setAmountInput] = useState(String(MIN_AMOUNT));
  const [error, setError] = useState('');
  const [startAmount, setStartAmount] = useState(null);
  const [displayValue, setDisplayValue] = useState(null);
  const [finalValue, setFinalValue] = useState(null);
  const [animating, setAnimating] = useState(false);
  const rafRef = useRef(0);

  // Per-webinar returns in chronological order. Withdrawal points carry the
  // cumulative % for the payout period, not a webinar result — skip them.
  const returns = useMemo(() => {
    const sorted = [...points].sort((a, b) =>
      a.date === b.date ? a.id.localeCompare(b.id) : a.date.localeCompare(b.date),
    );
    return sorted
      .filter((p) => p.type !== 'withdrawal')
      .map((p) => Number(p.profitPercent) || 0);
  }, [points]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  function handleCalculate(e) {
    e.preventDefault();
    const amount = Number(String(amountInput).replace(/[\s,]/g, ''));
    if (!Number.isFinite(amount) || amount < MIN_AMOUNT) {
      setError(`Минимальная сумма — $${MIN_AMOUNT.toLocaleString('en-US')}`);
      return;
    }
    setError('');

    // Compound each webinar's % on top of the running balance.
    const final = returns.reduce((balance, pct) => balance * (1 + pct / 100), amount);

    setStartAmount(amount);
    setFinalValue(final);
    setAnimating(true);
    setDisplayValue(amount);

    cancelAnimationFrame(rafRef.current);
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min((now - t0) / ANIMATION_MS, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayValue(amount + (final - amount) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayValue(final);
        setAnimating(false);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  const missedProfit = finalValue !== null && startAmount !== null ? finalValue - startAmount : null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <MissedProfitHeader />

      <main className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto space-y-4">
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-5">
            <h1 className="text-lg font-bold text-gray-900 mb-1">Расчёт упущенной прибыли</h1>
            <p className="text-sm text-gray-600 leading-snug mb-4">
              Какой баланс вы бы имели, если бы вложили в начале квартальной отчётности:
            </p>

            {returns.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-6">Торговая история пока не заполнена</p>
            ) : (
              <form onSubmit={handleCalculate} className="space-y-3">
                <div>
                  <label htmlFor="amount" className="block text-xs font-semibold text-gray-500 mb-1">
                    Сумма вложения, $
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      id="amount"
                      type="number"
                      inputMode="numeric"
                      min={MIN_AMOUNT}
                      step="1000"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2.5 text-base font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Минимум — $10,000</p>
                  {error ? <p className="text-xs text-red-600 mt-1">{error}</p> : null}
                </div>

                <button
                  type="submit"
                  disabled={animating}
                  className="w-full bg-brand text-white font-semibold rounded-md py-3 text-sm disabled:opacity-60"
                >
                  Рассчитать
                </button>
              </form>
            )}
          </div>

          {displayValue !== null ? (
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-5 text-center">
              <p className="text-xs text-gray-500 mb-2">Ваш баланс на сегодня составил бы</p>
              <p className="text-3xl sm:text-4xl font-bold text-green-600 tabular-nums">
                ${formatMoney(displayValue)}
              </p>
              {!animating && missedProfit !== null ? (
                <p className="text-[11px] text-gray-400 mt-3">
                  Вы потеряли прибыли: <span className="font-semibold text-gray-500">${formatMoney(missedProfit)}</span>
                </p>
              ) : null}
            </div>
          ) : null}

          <p className="text-[11px] text-gray-400 leading-snug px-1">
            Расчёт основан на фактических результатах вебинаров текущего сезона по принципу сложного процента.
            Прошлые результаты не гарантируют будущую доходность.
          </p>
        </div>
      </main>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
