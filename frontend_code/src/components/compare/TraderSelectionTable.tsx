import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Participant } from '@/data/participants';

interface TraderSelectionTableProps {
  traders: Participant[];
  selectedTraders: Participant[];
  onTraderSelect: (trader: Participant) => void;
  onCompareClick: () => void;
}

const TraderSelectionTable: React.FC<TraderSelectionTableProps> = ({
  traders,
  selectedTraders,
  onTraderSelect,
  onCompareClick
}) => {
  const isSelected = (trader: Participant) => 
    selectedTraders.some(t => t.id === trader.id);

  const canSelectMore = selectedTraders.length < 3;

  return (
    <div className="space-y-4">
      {/* Compare Button */}
      {selectedTraders.length > 0 && (
        <div className="flex justify-center">
          <Button 
            onClick={onCompareClick}
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            Compare Selected Traders ({selectedTraders.length})
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">Select</th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">Rank</th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">Trader</th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">P&L</th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">Country</th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">Tier</th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">Handle</th>
              </tr>
            </thead>
            <tbody>
              {traders.map((trader) => {
                const selected = isSelected(trader);
                const canSelect = canSelectMore || selected;
                
                return (
                  <tr 
                    key={trader.id}
                    className={`border-b border-border hover:bg-muted/30 transition-colors ${
                      selected ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTraderSelect(trader)}
                        disabled={!canSelect}
                        className={`w-8 h-8 p-0 rounded-md border-2 transition-all ${
                          selected 
                            ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90' 
                            : 'border-muted-foreground/20 hover:border-primary/50'
                        } ${!canSelect && !selected ? 'opacity-30' : ''}`}
                      >
                        {selected && <Check className="w-4 h-4" />}
                      </Button>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-muted-foreground">#{trader.rank}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={trader.avatar} alt={trader.name} />
                          <AvatarFallback className="text-xs">{trader.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{trader.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium text-sm ${
                        trader.pnlValue >= 0 ? 'text-profit' : 'text-loss'
                      }`}>
                        {trader.pnl}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img 
                          src={`https://flagicons.lipis.dev/flags/4x3/${trader.countryCode.toLowerCase()}.svg`}
                          alt={trader.country}
                          className="w-5 h-4 rounded-sm"
                        />
                        <span className="text-sm">{trader.country}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-xs">
                        {trader.tier}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">{trader.handle}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {traders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No traders found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default TraderSelectionTable;