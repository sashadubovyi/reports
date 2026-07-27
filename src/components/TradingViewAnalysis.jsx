import { useEffect, useState } from 'react';

const SCRIPT_SRC = 'https://widgets.tradingview-widget.com/w/ru/tv-technical-analysis.js';

// Injected only on first mount (i.e. after the user clicks "Показать больше
// информации"), never in the initial bundle. The promise is cached module-wide
// so opening the analysis for several companies never adds a second <script>.
let scriptPromise = null;

function loadAnalysisScript() {
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = SCRIPT_SRC;
      script.onload = resolve;
      script.onerror = () => {
        // Drop the cached promise so a later open can retry.
        scriptPromise = null;
        script.remove();
        reject(new Error('TradingView technical analysis failed to load'));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export default function TradingViewAnalysis({ symbol }) {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    loadAnalysisScript()
      .then(() => window.customElements.whenDefined('tv-technical-analysis'))
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

  if (status === 'error') {
    return (
      <div className="mt-3 text-xs text-gray-400 text-center py-3">Не удалось загрузить технический анализ.</div>
    );
  }

  return (
    <div className="mt-3 min-h-[120px] rounded-lg border border-gray-100 overflow-hidden">
      {status === 'ready' ? (
        <tv-technical-analysis symbol={symbol}></tv-technical-analysis>
      ) : (
        <div className="flex items-center justify-center h-[120px] text-xs text-gray-400">
          Загружаем технический анализ...
        </div>
      )}
    </div>
  );
}
