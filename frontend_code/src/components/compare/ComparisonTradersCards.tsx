import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Participant } from '@/data/participants';

interface ComparisonTradersCardsProps {
  traders: Participant[];
  onRemoveTrader: (trader: Participant) => void;
}

// Three distinct colors for the traders
const traderColors = [
  { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/20', accent: '#22c55e' },
  { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20', accent: '#ef4444' },
  { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20', accent: '#3b82f6' }
];

const ComparisonTradersCards: React.FC<ComparisonTradersCardsProps> = React.memo(({ 
  traders, 
  onRemoveTrader 
}) => {
  // Create 3 slots, fill empty ones with placeholder
  const slots = [...traders];
  while (slots.length < 3) {
    slots.push(null);
  }

  return (
    <div className="grid grid-cols-3 gap-1 h-full">
      {slots.map((trader, index) => (
        <div
          key={index}
          className={`bg-metric-card border border-border p-2 transition-all duration-200 h-full rounded-lg ${
            trader ? 'hover:shadow-md' : 'border-dashed opacity-50'
          }`}
        >
          {trader ? (
            <div className="flex flex-col h-full">
              {/* Header with avatar, name, and remove button */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Avatar className="h-8 w-8 border-2" style={{ borderColor: traderColors[index].accent }}>
                      <AvatarImage src={trader.avatar} alt={trader.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold text-xs">
                        {trader.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {/* Colored circle indicator */}
                    <div 
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-background"
                      style={{ backgroundColor: traderColors[index].accent }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-xs leading-tight truncate">
                      {trader.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {trader.handle}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onRemoveTrader(trader)}
                  className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-2 w-2" />
                </Button>
              </div>

              {/* Compact Stats Grid */}
              <div className="grid grid-cols-4 gap-1 text-center mb-2">
                <div className="bg-background/50 rounded p-1">
                  <div className="text-xs text-muted-foreground">Rank</div>
                  <div className="font-bold text-xs">#{trader.rank}</div>
                </div>
                <div className="bg-background/50 rounded p-1">
                  <div className="text-xs text-muted-foreground">Tier</div>
                  <div className="font-bold text-xs">{trader.tier}</div>
                </div>
                <div className="bg-background/50 rounded p-1">
                  <div className="text-xs text-muted-foreground">Country</div>
                  <div className="font-bold text-xs">{trader.countryCode}</div>
                </div>
                <div className="bg-background/50 rounded p-1">
                  <div className="text-xs text-muted-foreground">Flag</div>
                  <img 
                    src={`https://flagicons.lipis.dev/flags/4x3/${trader.countryCode.toLowerCase()}.svg`}
                    alt={trader.country}
                    className="w-4 h-3 rounded-sm mx-auto"
                  />
                </div>
              </div>

              {/* P&L Display */}
              <div className="text-center bg-background/50 rounded p-2">
                <div className="text-xs text-muted-foreground mb-1">P&L</div>
                <div className={`font-bold text-sm ${
                  trader.pnlValue >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trader.pnl}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-dashed border-muted-foreground/30 rounded-full flex items-center justify-center mb-1 mx-auto">
                  <span className="text-muted-foreground/50 text-lg">+</span>
                </div>
                <p className="text-xs text-muted-foreground">Select a trader</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

ComparisonTradersCards.displayName = 'ComparisonTradersCards';

export default ComparisonTradersCards;