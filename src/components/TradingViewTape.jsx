import { useEffect, useRef, useState } from 'react';

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

// The widget renders a "Бегущая строка от TradingView" attribution link next
// to the tape. It may live in the element's light DOM or its shadow root, so
// this hides it in both places. Runs on a short retry loop because the link
// is added asynchronously after the custom element upgrades.
const HIDE_ATTRIBUTION_CSS =
  'a[href*="tradingview.com"], .tv-embed-widget-wrapper__copyright { display: none !important; }';

function hideAttribution(el) {
  if (!el) return;
  el.querySelectorAll('a[href*="tradingview.com"]').forEach((a) => {
    a.style.display = 'none';
  });
  const root = el.shadowRoot;
  if (root && !root.querySelector('style[data-hide-attribution]')) {
    const style = document.createElement('style');
    style.setAttribute('data-hide-attribution', '');
    style.textContent = HIDE_ATTRIBUTION_CSS;
    root.appendChild(style);
  }
}

export default function TradingViewTape({ symbols = 'FOREXCOM:SPXUSD' }) {
  const [status, setStatus] = useState('loading');
  const wrapperRef = useRef(null);

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

  useEffect(() => {
    if (status !== 'ready') return;
    const el = wrapperRef.current?.querySelector('tv-ticker-tape');
    let attempts = 0;
    const timer = setInterval(() => {
      hideAttribution(el);
      attempts += 1;
      if (attempts >= 20) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, [status]);

  // On failure just render nothing: the widget is nice-to-have and the rest
  // of the modal must stay usable (e.g. with an ad blocker).
  if (status === 'error') return null;

  return (
    <div ref={wrapperRef} className="mb-4 min-h-[46px] rounded-lg border border-gray-100 overflow-hidden">
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
