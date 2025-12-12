"use client";

import { useEffect, useRef, memo } from 'react';

function MarketTicker() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only create the script if it doesn't exist yet
    if (container.current && container.current.childElementCount === 0) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "symbols": [
          {
            "proName": "FOREXCOM:SPXUSD",
            "title": "S&P 500"
          },
          {
            "proName": "FOREXCOM:NSXUSD",
            "title": "US 100"
          },
          {
            "proName": "FX_IDC:EURUSD",
            "title": "EUR/USD"
          },
          {
            "proName": "BITSTAMP:BTCUSD",
            "title": "Bitcoin"
          },
          {
            "description": "Gold",
            "proName": "OANDA:XAUUSD"
          }
        ],
        "showSymbolLogo": true,
        "colorTheme": "dark",
        "isTransparent": true,
        "displayMode": "adaptive",
        "locale": "en"
      });
      container.current.appendChild(script);
    }
  }, []);

  return (
    // Increased height to h-20 (80px) and removed overflow-hidden
    <div className="tradingview-widget-container w-full h-20 mb-6 border-b border-white/5 bg-surface/50 backdrop-blur-md rounded-card">
      <div className="tradingview-widget-container__widget" ref={container}></div>
    </div>
  );
}

export default memo(MarketTicker);