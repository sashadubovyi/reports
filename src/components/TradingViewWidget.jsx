import { useEffect, useRef, useState } from 'react';

// Uses TradingView's hash-config iframe embed (no external <script> tag
// running in our page context), and only mounts the iframe once the card
// scrolls into view. Each live iframe costs real RAM on low-end Android
// devices, so keeping off-screen cards as empty placeholders matters when a
// page lists dozens of earnings cards.
export default function TradingViewWidget({ ticker }) {
  const containerRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (typeof window.IntersectionObserver !== 'function') {
      // Old WebView without IntersectionObserver support: load immediately.
      setShouldLoad(true);
      return;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const config = {
    symbol: `NASDAQ:${ticker}`,
    width: '100%',
    height: 120,
    locale: 'ru',
    dateRange: '3M',
    colorTheme: 'light',
    trendLineColor: '#0a3d62',
    underLineColor: 'rgba(10, 61, 98, 0.15)',
    isTransparent: true,
    autosize: true,
  };
  const encodedConfig = encodeURIComponent(JSON.stringify(config));

  return (
    <div ref={containerRef} className="w-full" style={{ height: 130 }}>
      {shouldLoad ? (
        <iframe
          title={`tradingview-${ticker}`}
          src={`https://s.tradingview.com/embed-widget/mini-symbol-overview/#${encodedConfig}`}
          style={{ width: '100%', height: 130, border: 0 }}
          loading="lazy"
          scrolling="no"
          allowtransparency="true"
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400 text-xs">
          График загрузится при появлении на экране
        </div>
      )}
    </div>
  );
}
