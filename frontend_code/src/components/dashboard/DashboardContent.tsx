import React from 'react';
import DashboardGrid from './DashboardGrid';

interface DashboardContentProps {
  selectedTrader?: {
    id: string;
    name: string;
    pnl: string;
    avatar: string;
  } | null;
}

const DashboardContent: React.FC<DashboardContentProps> = React.memo(({ selectedTrader }) => {
  return (
    <div className="w-full h-full">
      {selectedTrader && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-2 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Viewing {selectedTrader.name}'s Performance</span>
            <span className="text-xs text-muted-foreground">({selectedTrader.pnl})</span>
          </div>
          <button 
            className="text-xs text-primary hover:text-primary/80"
            onClick={() => window.location.reload()}
          >
            Back to My Dashboard
          </button>
        </div>
      )}
      <DashboardGrid />
    </div>
  );
});

DashboardContent.displayName = 'DashboardContent';

export default DashboardContent;