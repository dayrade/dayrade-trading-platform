import React, { useState, useEffect } from 'react';
import { memo, useMemo, useCallback } from 'react';

interface StockData {
  symbol: string;
  change: string;
  isNegative: boolean;
}


const StockTicker: React.FC = memo(() => {
  const [tickerItems, setTickerItems] = useState<StockData[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  // Mock stock data with some variation
  const stockData: StockData[] = useMemo(() => [
    { symbol: "TSLA", change: "-0.37%", isNegative: true },
    { symbol: "AAPL", change: "+1.24%", isNegative: false },
    { symbol: "MSFT", change: "+0.89%", isNegative: false },
    { symbol: "GOOGL", change: "-0.15%", isNegative: true },
    { symbol: "AMZN", change: "+2.13%", isNegative: false },
    { symbol: "NVDA", change: "+3.45%", isNegative: false },
    { symbol: "META", change: "-1.22%", isNegative: true },
    { symbol: "NFLX", change: "+0.67%", isNegative: false },
    { symbol: "GOOG", change: "+0.45%", isNegative: false },
    { symbol: "BABA", change: "-1.89%", isNegative: true },
    { symbol: "AMD", change: "+2.78%", isNegative: false },
    { symbol: "INTC", change: "-0.92%", isNegative: true },
  ], []);


  const generateTickerItems = useCallback(() => {
    if (!isPaused) {
      return stockData.map(stock => ({
        ...stock,
        change: `${stock.isNegative ? '-' : '+'}${(Math.random() * 3).toFixed(2)}%`,
        isNegative: Math.random() > 0.6
      }));
    }
    return [];
  }, [isPaused, stockData]);

  useEffect(() => {
    setTickerItems(generateTickerItems());

    // Update stock prices periodically
    const interval = setInterval(() => {
      setTickerItems(generateTickerItems());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isPaused, generateTickerItems]);

  return (
    <div 
      className="h-12 bg-nav-background flex items-center px-4 overflow-hidden relative cursor-pointer"
      onClick={() => setIsPaused(!isPaused)}
      title={isPaused ? "Click to resume ticker" : "Click to pause ticker"}
    >
      <div className={`flex items-center whitespace-nowrap ${isPaused ? '' : 'animate-scroll'}`} style={{ gap: '8px' }}>
        {/* Duplicate items for seamless loop */}
        {[...tickerItems, ...tickerItems].map((item, i) => (
          <div 
            key={`${item.symbol}-${item.change}-${i}`} 
            className={`px-3 py-1 rounded text-sm font-medium ${
              item.isNegative 
                ? 'bg-loss/20 text-loss' 
                : 'bg-profit/20 text-profit'
            }`}
          >
            <span>{item.symbol} {item.change}</span>
          </div>
        ))}
      </div>
      
      {isPaused && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Ticker Paused - Click to Resume</span>
        </div>
      )}
    </div>
  );
});

StockTicker.displayName = 'StockTicker';

export default StockTicker;