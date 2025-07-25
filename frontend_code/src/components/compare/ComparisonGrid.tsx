import React, { useState } from 'react';
import ComparisonChart from './ComparisonChart';
import ComparisonMetricsGrid from './ComparisonMetricsGrid';
import ComparisonTradersCards from './ComparisonTradersCards';
import { Participant } from '@/data/participants';

interface ComparisonGridProps {
  traders: Participant[];
  timeRange: '1D' | '1W' | '1M';
  onBack: () => void;
  onRemoveTrader: (trader: Participant) => void;
}

const ComparisonGrid: React.FC<ComparisonGridProps> = React.memo(({ 
  traders, 
  timeRange, 
  onBack, 
  onRemoveTrader 
}) => {
  const [activeMetric, setActiveMetric] = useState('Total P&L');

  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-2 h-full w-full">
      {/* Top 2/3 - Chart (left) and Metrics (right) */}
      <div className="col-span-2 row-span-2">
        <ComparisonChart 
          activeMetric={activeMetric}
          traders={traders}
          timeRange={timeRange}
          onBack={onBack}
        />
      </div>
      <div className="col-span-1 row-span-2">
        <ComparisonMetricsGrid 
          activeMetric={activeMetric} 
          onMetricClick={setActiveMetric}
          traders={traders}
          timeRange={timeRange}
        />
      </div>
      
      {/* Bottom 1/3 - Trader Cards */}
      <div className="col-span-3 row-span-1">
        <ComparisonTradersCards 
          traders={traders}
          onRemoveTrader={onRemoveTrader}
        />
      </div>
    </div>
  );
});

ComparisonGrid.displayName = 'ComparisonGrid';

export default ComparisonGrid;