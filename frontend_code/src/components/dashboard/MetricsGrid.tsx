import React from 'react';
import MetricCard from './MetricCard';

const metricsData = [
  { title: "Total P&L", value: "$63,752.01", isProfit: true, showButton: true },
  { title: "Total Shares Traded", value: "2,003", showButton: true },
  { title: "USD Balance", value: "$83,246.00", showButton: true },
  { title: "Realized P&L", value: "$40,752.01", isProfit: true, showButton: true },
  { title: "No. of Stocks Traded", value: "17", showButton: true },
  { title: "No. of Trades", value: "17", showButton: true },
  { title: "Unrealized P&L", value: "$13,752.01", isProfit: true, showButton: true },
  { title: "Total Notional Traded", value: "360", showButton: true }
];

interface MetricsGridProps {
  activeMetric: string;
  onMetricClick: (metricTitle: string) => void;
}

const MetricsGrid: React.FC<MetricsGridProps> = React.memo(({ activeMetric, onMetricClick }) => {
  return (
    <div className="grid grid-cols-2 gap-1 h-full w-full min-h-0">
      {metricsData.map((metric, index) => (
        <MetricCard
          key={`${metric.title}-${index}`}
          title={metric.title}
          value={metric.value}
          subtitle={'subtitle' in metric ? (metric as any).subtitle : undefined}
          isProfit={metric.isProfit}
          showButton={metric.showButton}
          isActive={metric.title === activeMetric}
          onClick={() => onMetricClick(metric.title)}
        />
      ))}
    </div>
  );
});

MetricsGrid.displayName = 'MetricsGrid';

export default MetricsGrid;