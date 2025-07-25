import React from 'react';
import {
  ComposedChart,
  Area, 
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Participant } from '@/data/participants';

interface ComparisonChartProps {
  activeMetric: string;
  traders: Participant[];
  timeRange: '1D' | '1W' | '1M';
  onBack: () => void;
}

const traderColors = ['#22c55e', '#ef4444', '#3b82f6']; // Green, Red, Blue

const ComparisonChart: React.FC<ComparisonChartProps> = React.memo(({ 
  activeMetric, 
  traders, 
  timeRange, 
  onBack 
}) => {
  const prepareChartData = () => {
    if (!traders.length) return [];
    
    const timePoints = traders[0].historicalData[timeRange];
    return timePoints.map(point => {
      const dataPoint: any = { time: point.timestamp };
      
      traders.forEach((trader, index) => {
        const traderPoint = trader.historicalData[timeRange].find(p => p.timestamp === point.timestamp);
        if (traderPoint) {
          let value = 0;
          switch (activeMetric) {
            case 'Total P&L':
              value = traderPoint.pnl;
              break;
            case 'Total Shares Traded':
              value = Math.floor(traderPoint.numTrades * traderPoint.avgTradeSize / 100);
              break;
            case 'USD Balance':
              value = traderPoint.pnl + 50000;
              break;
            case 'Realized P&L':
              value = traderPoint.pnl * 0.7;
              break;
            case 'No. of Stocks Traded':
              value = Math.floor(traderPoint.numTrades / 2);
              break;
            case 'No. of Trades':
              value = traderPoint.numTrades;
              break;
            case 'Unrealized P&L':
              value = traderPoint.pnl * 0.3;
              break;
            case 'Total Notional Traded':
              value = Math.floor(traderPoint.avgTradeSize * traderPoint.numTrades / 1000);
              break;
            case 'Max Drawdown':
              value = traderPoint.maxDrawdown;
              break;
            case 'Avg Trade Size':
              value = traderPoint.avgTradeSize;
              break;
            case 'ROI':
              value = traderPoint.roi;
              break;
            case 'Sharpe Ratio':
              value = traderPoint.sharpeRatio;
              break;
            case 'Volatility':
              value = traderPoint.volatility;
              break;
            default:
              value = traderPoint.pnl;
          }
          dataPoint[trader.handle] = value;
        }
      });
      
      return dataPoint;
    });
  };

  const formatTimeLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    switch (timeRange) {
      case '1D':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case '1W':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case '1M':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatTooltipValue = (value: number) => {
    if (activeMetric === 'Total P&L' || activeMetric === 'USD Balance' || activeMetric === 'Realized P&L' || activeMetric === 'Unrealized P&L' || activeMetric === 'Avg Trade Size') {
      return `$${value.toLocaleString()}`;
    } else if (activeMetric === 'ROI' || activeMetric === 'Volatility' || activeMetric === 'Max Drawdown') {
      return `${value.toFixed(2)}%`;
    } else if (activeMetric === 'Sharpe Ratio') {
      return value.toFixed(2);
    } else if (activeMetric === 'Total Notional Traded') {
      return `${value}k`;
    }
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-metric-card border border-border p-3 rounded-lg shadow-lg">
        <p className="text-muted-foreground text-sm mb-2">{formatTimeLabel(label)}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.dataKey}: {formatTooltipValue(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  const chartData = prepareChartData();

  if (!traders.length) {
    return (
      <Card className="bg-metric-card border-border p-4 flex flex-col items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">No Traders Selected</h3>
          <p className="text-muted-foreground">Select traders from the table below to compare their performance.</p>
          <Button variant="outline" onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Selection
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-metric-card border-border p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold text-foreground">{activeMetric} Comparison</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-profit/20 text-profit border-0">
            {timeRange} Range
          </Badge>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorTrader1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTrader2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTrader3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              fontSize={12}
              tickFormatter={formatTimeLabel}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              fontSize={12}
              tickFormatter={(value) => {
                if (activeMetric === 'P&L' || activeMetric === 'Avg Trade Size') {
                  return `$${(value / 1000).toFixed(0)}k`;
                } else if (activeMetric === 'ROI' || activeMetric === 'Volatility') {
                  return `${value.toFixed(1)}%`;
                }
                return value.toString();
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {traders.map((trader, index) => (
              <>
              <Area
                key={trader.id}
                type="monotone"
                dataKey={trader.handle}
                stroke="transparent"
                fill={`url(#colorTrader${index + 1})`}
                fillOpacity={0.6}
              />
              <Line
                key={`${trader.id}-line`}
                type="monotone"
                dataKey={trader.handle}
                stroke={traderColors[index % traderColors.length]}
                strokeWidth={2}
                dot={false}
                name={trader.name}
              />
              </>
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
});

ComparisonChart.displayName = 'ComparisonChart';

export default ComparisonChart;