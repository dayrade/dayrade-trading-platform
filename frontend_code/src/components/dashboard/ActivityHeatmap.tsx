import React from 'react';
import { memo, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Activity, TrendingUp } from 'lucide-react';

const ActivityHeatmap: React.FC = memo(() => {
  // Generate trading activity data for a typical trading day (9:30 AM - 4:00 PM EST)
  const tradingHours = useMemo(() => [
    '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', 
    '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'
  ], []);

  // Generate realistic trading activity patterns
  const generateActivityData = useCallback(() => {
    return tradingHours.map((time, index) => {
      // Higher activity during market open (9:30-10:30) and close (15:00-16:00)
      // Lower activity during lunch (12:00-13:00)
      let baseActivity = 0.3;
      
      if (index <= 2) baseActivity = 0.8; // Market open
      else if (index >= 11) baseActivity = 0.9; // Market close
      else if (index >= 5 && index <= 7) baseActivity = 0.2; // Lunch time
      else baseActivity = 0.5; // Regular hours
      
      // Add some randomness
      const activity = Math.min(1, baseActivity + (Math.random() - 0.5) * 0.4);
      
      return {
        time,
        activity,
        trades: Math.floor(activity * 15), // 0-15 trades per 30min
        volume: Math.floor(activity * 50000), // Volume in shares
      };
    });
  }, [tradingHours]);

  const activityData = useMemo(() => generateActivityData(), [generateActivityData]);

  const getActivityColor = useCallback((activity: number) => {
    if (activity >= 0.8) return 'bg-profit';
    if (activity >= 0.6) return 'bg-profit/80';
    if (activity >= 0.4) return 'bg-profit/60';
    if (activity >= 0.2) return 'bg-profit/40';
    return 'bg-muted/40';
  }, []);

  const { totalTrades, totalVolume, peakActivity } = useMemo(() => ({
    totalTrades: activityData.reduce((sum, d) => sum + d.trades, 0),
    totalVolume: Math.round(activityData.reduce((sum, d) => sum + d.volume, 0) / 1000),
    peakActivity: Math.max(...activityData.map(d => d.activity))
  }), [activityData]);

  return (
    <Card className="bg-metric-card border-border p-3 h-full w-full flex flex-col">
      {/* Header */}
      <div className="mb-2 flex-shrink-0">
        <div className="flex items-center gap-1 mb-1">
          <Activity className="w-3 h-3 text-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Trading Activity</h3>
        </div>
        <p className="text-xs text-muted-foreground">Today's intensity by time</p>
      </div>
      
      <div className="flex-1 min-h-0 space-y-2">
        {/* Activity Grid */}
        <div className="grid grid-cols-7 gap-1">
          {activityData.map((data, index) => (
            <div key={index} className="text-center">
              <div className="text-[8px] text-muted-foreground mb-1 truncate">
                {data.time}
              </div>
              <div 
                className={`h-6 rounded-sm ${getActivityColor(data.activity)} relative group cursor-pointer transition-all hover:scale-105`}
                title={`${data.time}: ${data.trades} trades, ${data.volume.toLocaleString()} shares`}
              >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <div className="font-medium">{data.time}</div>
                  <div>{data.trades} trades</div>
                  <div>{(data.volume / 1000).toFixed(0)}k shares</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-1 text-center pt-1 border-t border-border/50">
          <div>
            <div className="text-xs font-semibold text-foreground">{totalTrades}</div>
            <div className="text-[9px] text-muted-foreground">Trades</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground">{totalVolume}k</div>
            <div className="text-[9px] text-muted-foreground">Volume</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-profit flex items-center justify-center gap-1">
              <TrendingUp className="w-2 h-2" />
              {(peakActivity * 100).toFixed(0)}%
            </div>
            <div className="text-[9px] text-muted-foreground">Peak</div>
          </div>
        </div>

        {/* Activity Legend */}
        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
          <span>Low</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted/40 rounded-sm"></div>
            <div className="w-2 h-2 bg-profit/40 rounded-sm"></div>
            <div className="w-2 h-2 bg-profit/60 rounded-sm"></div>
            <div className="w-2 h-2 bg-profit/80 rounded-sm"></div>
            <div className="w-2 h-2 bg-profit rounded-sm"></div>
          </div>
          <span>High</span>
        </div>
      </div>
    </Card>
  );
});

ActivityHeatmap.displayName = 'ActivityHeatmap';

export default ActivityHeatmap;