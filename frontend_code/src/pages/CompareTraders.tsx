import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ComparisonGrid from '@/components/compare/ComparisonGrid';
import TraderSelectionTable from '@/components/compare/TraderSelectionTable';
import { mockParticipants, Participant } from '@/data/participants';

type TimeRange = '1D' | '1W' | '1M';
type FilterType = 'all' | 'winners' | 'losers';

const CompareTraders: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [selectedTraders, setSelectedTraders] = useState<Participant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('1W');
  const [showComparison, setShowComparison] = useState(false);

  // Get unique countries from participants
  const uniqueCountries = useMemo(() => {
    return [...new Set(mockParticipants.map(p => p.country))].sort();
  }, []);

  // Filter participants based on search, filter type, and country
  const filteredTraders = useMemo(() => {
    return mockParticipants.filter(participant => {
      const matchesSearch = 
        participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.handle.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterType === 'all' ||
        (filterType === 'winners' && participant.pnlValue > 0) ||
        (filterType === 'losers' && participant.pnlValue < 0);
      
      const matchesCountry = 
        selectedCountry === 'all' || participant.country === selectedCountry;
      
      return matchesSearch && matchesFilter && matchesCountry;
    });
  }, [searchTerm, filterType, selectedCountry]);

  const handleTraderSelect = (trader: Participant) => {
    if (selectedTraders.find(t => t.id === trader.id)) {
      setSelectedTraders(prev => prev.filter(t => t.id !== trader.id));
    } else if (selectedTraders.length < 3) {
      setSelectedTraders(prev => [...prev, trader]);
    }
  };

  const clearAllTraders = () => {
    setSelectedTraders([]);
  };

  const showIrishTradersOnly = () => {
    setSelectedCountry('Ireland');
  };

  const handleCompareClick = () => {
    if (selectedTraders.length > 0) {
      setShowComparison(true);
    }
  };

  const handleRemoveTrader = (traderToRemove: Participant) => {
    setSelectedTraders(prev => prev.filter(trader => trader.id !== traderToRemove.id));
  };

  return (
    <DashboardLayout 
      sidebarExpanded={sidebarExpanded} 
      onSidebarExpandedChange={setSidebarExpanded}
      isAuthenticated={true}
    >
      <main className="flex flex-col h-full">
        <div className="sr-only">
          <h1>Compare Traders Performance</h1>
          <p>Analyze and compare trader performance metrics side by side</p>
        </div>
        {showComparison ? (
          <ComparisonGrid
            traders={selectedTraders}
            timeRange={timeRange}
            onBack={() => setShowComparison(false)}
            onRemoveTrader={handleRemoveTrader}
          />
        ) : (
          <div className="p-6 h-full flex flex-col">
            {/* Header */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Compare Traders</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select up to 3 traders to analyze their performance side by side
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="outline" 
                    onClick={showIrishTradersOnly}
                    className="border-profit text-profit hover:bg-profit/10 h-7 px-2 text-xs"
                  >
                    Irish Traders
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={clearAllTraders}
                    disabled={selectedTraders.length === 0}
                    className="h-7 px-2 text-xs"
                  >
                    Clear All ({selectedTraders.length})
                  </Button>
                </div>
              </div>
            
              {selectedTraders.length > 0 && (
                <div className="flex items-center space-x-1 mb-2">
                  <span className="text-sm text-muted-foreground">Selected:</span>
                  {selectedTraders.map((trader) => (
                    <Badge key={trader.id} variant="secondary" className="bg-profit/20 text-profit text-xs">
                      {trader.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Selection Controls */}
            <div className="flex items-center space-x-2 mb-3">
              <Input
                placeholder="Search traders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs h-7 text-xs"
              />
              
              <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
                <SelectTrigger className="w-32 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Traders</SelectItem>
                  <SelectItem value="winners">Winners Only</SelectItem>
                  <SelectItem value="losers">Losers Only</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-32 h-7 text-xs">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {uniqueCountries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
                <SelectTrigger className="w-24 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1D">1 Day</SelectItem>
                  <SelectItem value="1W">1 Week</SelectItem>
                  <SelectItem value="1M">1 Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Trader Selection Table */}
            <div className="flex-1 min-h-0">
              <TraderSelectionTable 
                traders={filteredTraders}
                selectedTraders={selectedTraders}
                onTraderSelect={handleTraderSelect}
                onCompareClick={handleCompareClick}
              />
            </div>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
};

export default CompareTraders;