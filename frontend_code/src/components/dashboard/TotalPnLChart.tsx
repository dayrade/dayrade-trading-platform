import React from 'react';
import { memo, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TotalPnLChartProps {
  className?: string;
  activeMetric: string;
}

// Sample data for different metrics
const chartData = {
  'Total P&L': [
    { time: '9:30', value: 50000 },
    { time: '10:00', value: 52000 },
    { time: '10:30', value: 48000 },
    { time: '11:00', value: 55000 },
    { time: '11:30', value: 58000 },
    { time: '12:00', value: 60000 },
    { time: '12:30', value: 57000 },
    { time: '13:00', value: 61000 },
    { time: '13:30', value: 59000 },
    { time: '14:00', value: 63000 },
    { time: '14:30', value: 62000 },
    { time: '15:00', value: 65000 },
    { time: '15:30', value: 63752 }
  ],
  'Total Shares Traded': [
    { time: '9:30', value: 100 },
    { time: '10:00', value: 250 },
    { time: '10:30', value: 400 },
    { time: '11:00', value: 580 },
    { time: '11:30', value: 750 },
    { time: '12:00', value: 920 },
    { time: '12:30', value: 1100 },
    { time: '13:00', value: 1350 },
    { time: '13:30', value: 1500 },
    { time: '14:00', value: 1700 },
    { time: '14:30', value: 1850 },
    { time: '15:00', value: 1950 },
    { time: '15:30', value: 2003 }
  ],
  'USD Balance': [
    { time: '9:30', value: 80000 },
    { time: '10:00', value: 81000 },
    { time: '10:30', value: 80500 },
    { time: '11:00', value: 82000 },
    { time: '11:30', value: 82500 },
    { time: '12:00', value: 83000 },
    { time: '12:30', value: 82800 },
    { time: '13:00', value: 83200 },
    { time: '13:30', value: 83000 },
    { time: '14:00', value: 83400 },
    { time: '14:30', value: 83300 },
    { time: '15:00', value: 83500 },
    { time: '15:30', value: 83246 }
  ],
  'Realized P&L': [
    { time: '9:30', value: 30000 },
    { time: '10:00', value: 32000 },
    { time: '10:30', value: 31000 },
    { time: '11:00', value: 35000 },
    { time: '11:30', value: 37000 },
    { time: '12:00', value: 38000 },
    { time: '12:30', value: 37500 },
    { time: '13:00', value: 39000 },
    { time: '13:30', value: 38500 },
    { time: '14:00', value: 40000 },
    { time: '14:30', value: 39800 },
    { time: '15:00', value: 40500 },
    { time: '15:30', value: 40752 }
  ],
  'No. of Stocks Traded': [
    { time: '9:30', value: 2 },
    { time: '10:00', value: 4 },
    { time: '10:30', value: 6 },
    { time: '11:00', value: 8 },
    { time: '11:30', value: 10 },
    { time: '12:00', value: 12 },
    { time: '12:30', value: 13 },
    { time: '13:00', value: 14 },
    { time: '13:30', value: 15 },
    { time: '14:00', value: 16 },
    { time: '14:30', value: 16 },
    { time: '15:00', value: 17 },
    { time: '15:30', value: 17 }
  ],
  'No. of Trades': [
    { time: '9:30', value: 2 },
    { time: '10:00', value: 4 },
    { time: '10:30', value: 6 },
    { time: '11:00', value: 8 },
    { time: '11:30', value: 10 },
    { time: '12:00', value: 12 },
    { time: '12:30', value: 13 },
    { time: '13:00', value: 14 },
    { time: '13:30', value: 15 },
    { time: '14:00', value: 16 },
    { time: '14:30', value: 16 },
    { time: '15:00', value: 17 },
    { time: '15:30', value: 17 }
  ],
  'Unrealized P&L': [
    { time: '9:30', value: 10000 },
    { time: '10:00', value: 11000 },
    { time: '10:30', value: 9500 },
    { time: '11:00', value: 12000 },
    { time: '11:30', value: 12500 },
    { time: '12:00', value: 13000 },
    { time: '12:30', value: 12800 },
    { time: '13:00', value: 13200 },
    { time: '13:30', value: 13000 },
    { time: '14:00', value: 13400 },
    { time: '14:30', value: 13600 },
    { time: '15:00', value: 13800 },
    { time: '15:30', value: 13752 }
  ],
  'Total Notional Traded': [
    { time: '9:30', value: 50 },
    { time: '10:00', value: 80 },
    { time: '10:30', value: 120 },
    { time: '11:00', value: 160 },
    { time: '11:30', value: 200 },
    { time: '12:00', value: 240 },
    { time: '12:30', value: 280 },
    { time: '13:00', value: 300 },
    { time: '13:30', value: 320 },
    { time: '14:00', value: 340 },
    { time: '14:30', value: 350 },
    { time: '15:00', value: 355 },
    { time: '15:30', value: 360 }
  ]
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = memo(({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-metric-card border border-border p-3 rounded-lg shadow-lg">
      <p className="text-muted-foreground text-sm mb-1">{label}</p>
      <p className="text-profit font-bold">
        ${payload[0].value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </p>
    </div>
  );
});

CustomTooltip.displayName = 'CustomTooltip';

const TotalPnLChart: React.FC<TotalPnLChartProps> = memo(({ className, activeMetric }) => {
  const currentData = useMemo(() => {
    return chartData[activeMetric as keyof typeof chartData] || chartData['Total P&L'];
  }, [activeMetric]);
  
  return (
    <Card className="bg-metric-card border-border p-2 sm:p-3 lg:p-4 flex flex-col h-full w-full min-h-0">
      <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4 flex-shrink-0">
        <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-foreground truncate">{activeMetric}</h3>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Badge className="bg-profit/20 text-profit border-0">
            5% Profit
          </Badge>
          <span className="text-xs text-muted-foreground hidden lg:inline">Sort by</span>
          <select className="bg-background border border-border rounded px-1 sm:px-2 py-1 text-xs text-foreground">
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 w-full overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={currentData}
            margin={{ top: 2, right: 2, left: 2, bottom: 10 }}
          >
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--profit))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--profit))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              fontSize={8}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              fontSize={8}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--profit))"
              strokeWidth={2}
              fill="url(#colorProfit)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
});

TotalPnLChart.displayName = 'TotalPnLChart';

export default TotalPnLChart;