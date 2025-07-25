import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  isProfit?: boolean;
  showButton?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = React.memo(({ 
  title, 
  value, 
  subtitle, 
  isProfit = false, 
  showButton = false,
  isActive = false,
  onClick 
}) => (
  <Card 
    className={`bg-metric-card border-border p-2 space-y-1 transition-all duration-200 cursor-pointer h-full flex flex-col justify-between min-h-0 ${isActive ? 'ring-2 ring-profit shadow-lg shadow-profit/20' : 'hover:shadow-md'}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between min-h-0 flex-shrink-0">
      <span className="text-xs text-muted-foreground truncate flex-1 leading-tight">{title}</span>
      {showButton && (
        <Button variant="ghost" size="sm" className="text-profit text-xs h-4 px-1 ml-1 hidden lg:flex">
          Chart View
        </Button>
      )}
    </div>
    {subtitle && (
      <div className="text-xs text-muted-foreground truncate leading-tight">{subtitle}</div>
    )}
    <div className={`text-sm font-semibold truncate leading-tight ${isProfit ? 'text-profit' : 'text-foreground'}`}>
      {value}
    </div>
  </Card>
));

MetricCard.displayName = 'MetricCard';

export default MetricCard;