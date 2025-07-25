import React from 'react';
import MetricCard from '@/components/dashboard/MetricCard';
import { Participant } from '@/data/participants';

const metricsData = [
  { title: "Total P&L" },
  { title: "Total Shares Traded" },
  { title: "USD Balance" },
  { title: "Realized P&L" },
  { title: "No. of Stocks Traded" },
  { title: "No. of Trades" },
  { title: "Unrealized P&L" },
  { title: "Total Notional Traded" }
];

interface ComparisonMetricsGridProps {
  activeMetric: string;
  onMetricClick: (metricTitle: string) => void;
  traders: Participant[];
  timeRange: '1D' | '1W' | '1M';
}

// Three distinct colors for the traders
const traderColors = ['#22c55e', '#ef4444', '#3b82f6']; // Green, Red, Blue

const getMetricValue = (trader: Participant, metric: string, timeRange: '1D' | '1W' | '1M' = '1W') => {
  const latestData = trader.historicalData[timeRange][trader.historicalData[timeRange].length - 1];
  
  switch (metric) {
    case 'Total P&L':
      return `$${Math.floor(latestData.pnl).toLocaleString()}`;
    case 'Total Shares Traded':
      return Math.floor(latestData.numTrades * latestData.avgTradeSize / 100).toLocaleString();
    case 'USD Balance':
      return `$${Math.floor(latestData.pnl + 50000).toLocaleString()}`;
    case 'Realized P&L':
      return `$${Math.floor(latestData.pnl * 0.7).toLocaleString()}`;
    case 'No. of Stocks Traded':
      return Math.floor(latestData.numTrades / 2).toString();
    case 'No. of Trades':
      return latestData.numTrades.toString();
    case 'Unrealized P&L':
      return `$${Math.floor(latestData.pnl * 0.3).toLocaleString()}`;
    case 'Total Notional Traded':
      return `${Math.floor(latestData.avgTradeSize * latestData.numTrades / 1000)}k`;
    default:
      return '0';
  }
};

const ComparisonMetricsGrid: React.FC<ComparisonMetricsGridProps> = React.memo(({ 
  activeMetric, 
  onMetricClick,
  traders,
  timeRange
}) => {
  const getTraderValues = (metric: string) => {
    if (traders.length === 0) return '';
    
    return traders.map(trader => getMetricValue(trader, metric, timeRange));
  };

  const getTraderNames = () => {
    if (traders.length === 0) return '';
    return traders.map(t => t.name.split(' ')[0]);
  };

  return (
    <div className="grid grid-cols-2 gap-1 h-full w-full min-h-0">
      {metricsData.map((metric, index) => (
        <div
          key={`${metric.title}-${index}`}
          className={`bg-metric-card border-border p-2 space-y-1 transition-all duration-200 cursor-pointer h-full flex flex-col justify-between min-h-0 ${
            metric.title === activeMetric ? 'ring-2 ring-profit shadow-lg shadow-profit/20' : 'hover:shadow-md'
          }`}
          onClick={() => onMetricClick(metric.title)}
        >
          <div className="flex items-center justify-between min-h-0 flex-shrink-0">
            <span className="text-xs text-muted-foreground truncate flex-1 leading-tight">{metric.title}</span>
          </div>
          
          {/* Trader Names */}
          <div className="text-xs text-muted-foreground leading-tight">
            {getTraderNames().join(' | ')}
          </div>
          
          {/* Values with color coding */}
          <div className="space-y-1">
            {getTraderValues(metric.title).map((value, traderIndex) => (
              <div 
                key={traderIndex}
                className="text-xs font-semibold leading-tight truncate"
                style={{ color: traderColors[traderIndex] }}
              >
                {value}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

ComparisonMetricsGrid.displayName = 'ComparisonMetricsGrid';

export default ComparisonMetricsGrid;