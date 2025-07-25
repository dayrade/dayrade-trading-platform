import React, { useState } from 'react';
import TotalPnLChart from './TotalPnLChart';
import MetricsGrid from './MetricsGrid';
import PlayerProfile from './PlayerProfile';
import ActivityHeatmap from './ActivityHeatmap';

const DashboardGrid: React.FC = React.memo(() => {
  const [activeMetric, setActiveMetric] = useState('Total P&L');

  return (
    <div className="grid grid-cols-3 gap-2 h-full w-full" style={{ gridTemplateRows: '2fr 1fr' }}>
      {/* Top 2/3 - Chart (left) and Metrics Grid (right) */}
      <div className="col-span-2 h-full">
        <TotalPnLChart activeMetric={activeMetric} />
      </div>
      <div className="col-span-1 h-full">
        <MetricsGrid activeMetric={activeMetric} onMetricClick={setActiveMetric} />
      </div>
      
      {/* Bottom 1/3 - Profile Card (left) and Activity Heatmap (right) */}
      <div className="col-span-2 h-full">
        <PlayerProfile />
      </div>
      <div className="col-span-1 h-full">
        <ActivityHeatmap />
      </div>
    </div>
  );
});

DashboardGrid.displayName = 'DashboardGrid';

export default DashboardGrid;