import { useEffect, useState } from 'react';

const SCRIPT_SRC = 'https://widgets.tradingview-widget.com/w/ru/tv-ticker-tape.js';

// The TradingView script is injected on first use only (never in the initial
// bundle) and the promise is cached module-wide, so reopening the modal —
// or opening it from several cards — never adds a second <script> tag.
let scriptPromise = null;

function loadTickerTapeScript() {
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = SCRIPT_SRC;
      script.onload = resolve;
      script.onerror = () => {
        // Drop the cached promise so the next modal open can retry.
        scriptPromise = null;
        script.remove();
        reject(new Error('TradingView ticker tape failed to load'));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export default function TradingViewTape({ symbols = 'FOREXCOM:SPXUSD' }) {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    loadTickerTapeScript()
      .then(() => window.customElements.whenDefined('tv-ticker-tape'))
      .then(() => {
        if (!cancelled) setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // On failure just render nothing: the widget is nice-to-have and the rest
  // of the modal must stay usable (e.g. with an ad blocker).
  if (status === 'error') return null;

  return (
    <div className="mb-4 min-h-[46px] rounded-lg border border-gray-100 overflow-hidden">
      {status === 'ready' ? (
        <tv-ticker-tape symbols={symbols}></tv-ticker-tape>
      ) : (
        <div className="flex items-center justify-center h-[46px] text-xs text-gray-400">
          Загружаем котировки...
        </div>
      )}
    </div>
  );
}
