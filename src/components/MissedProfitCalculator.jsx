import { useEffect, useMemo, useRef, useState } from 'react';

const MIN_AMOUNT = 10000;
const ANIMATION_MS = 2500;

function formatMoney(value) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Modal body for the missed-profit calculator: compounds each webinar's
// profitPercent from the season's trading history over a user-entered
// starting amount. Points come in from the host view so the calculator
// always matches the season (and Firestore subscription) shown on screen.
export default function MissedProfitCalculator({ points }) {
  const [amountInput, setAmountInput] = useState(String(MIN_AMOUNT));
  const [error, setError] = useState('');
  const [startAmount, setStartAmount] = useState(null);
  const [displayValue, setDisplayValue] = useState(null);
  const [finalValue, setFinalValue] = useState(null);
  const [animating, setAnimating] = useState(false);
  const rafRef = useRef(0);

  // Per-webinar growth factors in chronological order. Withdrawal points
  // carry the cumulative % for the payout period, not a webinar result —
  // skip them. Each factor is derived from the exact dollar amounts
  // (balance after / balance before) rather than the manually entered
  // profitPercent, which is rounded to two decimals and would drift from
  // the real account balance when compounded. Falls back to profitPercent
  // for points without usable dollar figures.
  const growthFactors = useMemo(() => {
    const sorted = [...points].sort((a, b) =>
      a.date === b.date ? a.id.localeCompare(b.id) : a.date.localeCompare(b.date),
    );
    return sorted
      .filter((p) => p.type !== 'withdrawal')
      .map((p) => {
        const dollar = Number(p.profitDollar);
        const balance = Number(p.balance);
        if (Number.isFinite(dollar) && Number.isFinite(balance) && balance - dollar > 0) {
          return balance / (balance - dollar);
        }
        const pct = Number(p.profitPercent);
        return Number.isFinite(pct) ? 1 + pct / 100 : 1;
      });
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

    // Compound each webinar's growth on top of the running balance.
    const final = growthFactors.reduce((balance, factor) => balance * factor, amount);

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
    <div className="p-5">
      <h2 className="text-lg font-bold text-gray-900 mb-1 pr-8">Расчёт упущенной прибыли</h2>
      <p className="text-sm text-gray-600 leading-snug mb-4">
        Какой баланс вы бы имели, если бы вложили в начале квартальной отчётности:
      </p>

      {growthFactors.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-6">Торговая история пока не заполнена</p>
      ) : (
        <>
          <form onSubmit={handleCalculate} className="space-y-3">
            <div>
              <label htmlFor="missed-profit-amount" className="block text-xs font-semibold text-gray-500 mb-1">
                Сумма вложения, $
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  id="missed-profit-amount"
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

          {displayValue !== null ? (
            <div className="mt-4 bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 mb-2">Ваш баланс на сегодня составил бы</p>
              <p className="text-3xl sm:text-4xl font-bold text-green-600 tabular-nums">
                ${formatMoney(displayValue)}
              </p>
              {!animating && missedProfit !== null ? (
                <p className="text-[11px] text-gray-400 mt-3">
                  Вы потеряли прибыли:{' '}
                  <span className="font-semibold text-gray-500">${formatMoney(missedProfit)}</span>
                </p>
              ) : null}
            </div>
          ) : null}
        </>
      )}

      <p className="text-[11px] text-gray-400 leading-snug mt-4">
        Расчёт основан на фактических результатах вебинаров сезона по принципу сложного процента. Прошлые
        результаты не гарантируют будущую доходность.
      </p>
    </div>
  );
}
