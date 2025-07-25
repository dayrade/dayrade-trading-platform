import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import CalendarView from '@/components/tournament/CalendarView';
import CardView from '@/components/tournament/CardView';
import TournamentModal from '@/components/tournament/TournamentModal';
import { tournaments, Tournament } from '@/data/tournaments';
import { Calendar, LayoutGrid, Search, Filter } from 'lucide-react';

type ViewType = 'calendar' | 'cards';
type FilterType = 'all' | 'Real Money' | 'SIM';
type DivisionFilter = 'all' | 'Raider' | 'Crusader' | 'Elevator';

const TournamentCalendar: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [divisionFilter, setDivisionFilter] = useState<DivisionFilter>('all');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showPastTournaments, setShowPastTournaments] = useState(false);

  // Filter tournaments based on search and filters
  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || tournament.type === typeFilter;
    const matchesDivision = divisionFilter === 'all' || tournament.division === divisionFilter;
    
    const now = new Date();
    // Consider a tournament "past" only if it has completely ended AND is marked as completed
    // This ensures live and upcoming tournaments are always shown by default
    const isPast = tournament.status === 'Completed' && tournament.endDate < now;
    const showTournament = showPastTournaments || !isPast;
    
    return matchesSearch && matchesType && matchesDivision && showTournament;
  });

  // Get next upcoming tournament for countdown
  const nextTournament = tournaments
    .filter(t => t.startDate > new Date() && t.status !== 'Completed')
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0];

  const getTimeUntilNext = () => {
    if (!nextTournament) return null;
    const now = new Date();
    const diff = nextTournament.startDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  };

  const countdown = getTimeUntilNext();

  return (
    <DashboardLayout 
      sidebarExpanded={sidebarExpanded}
      onSidebarExpandedChange={setSidebarExpanded}
      isAuthenticated={true}
    >
      <main className="flex-1 h-full overflow-auto">
        <div className="sr-only">
          <h1>Tournament Calendar and Events</h1>
          <p>View upcoming and past tournament schedules</p>
        </div>
        {/* Ultra-Compact Controls */}
        <div className="p-2 border-b bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            {/* Left: View Toggle */}
            <div className="flex gap-1">
              <Button
                variant={currentView === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('calendar')}
                className="flex items-center gap-1 h-7 px-2 text-xs"
              >
                <Calendar size={14} />
                <span className="hidden sm:inline">Calendar</span>
              </Button>
              <Button
                variant={currentView === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('cards')}
                className="flex items-center gap-1 h-7 px-2 text-xs"
              >
                <LayoutGrid size={14} />
                <span className="hidden sm:inline">Cards</span>
              </Button>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={14} />
                <Input
                  placeholder="Search tournaments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-7 text-xs"
                />
              </div>
            </div>

            {/* Right: Filters */}
            <div className="flex gap-1">
              <Select value={typeFilter} onValueChange={(value: FilterType) => setTypeFilter(value)}>
                <SelectTrigger className="w-20 h-7 text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Real Money">Real Money</SelectItem>
                  <SelectItem value="SIM">SIM</SelectItem>
                </SelectContent>
              </Select>

              <Select value={divisionFilter} onValueChange={(value: DivisionFilter) => setDivisionFilter(value)}>
                <SelectTrigger className="w-24 h-7 text-xs">
                  <SelectValue placeholder="Division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Divisions</SelectItem>
                  <SelectItem value="Raider">Raider</SelectItem>
                  <SelectItem value="Crusader">Crusader</SelectItem>
                  <SelectItem value="Elevator">Elevator</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showPastTournaments ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowPastTournaments(!showPastTournaments)}
                className="flex items-center gap-1 h-7 px-2 text-xs"
              >
                <Filter size={14} />
                <span className="hidden sm:inline">Past</span>
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || typeFilter !== 'all' || divisionFilter !== 'all' || showPastTournaments) && (
            <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-border/50">
              {searchTerm && (
                <Badge variant="secondary" className="text-xs h-5">
                  Search: {searchTerm}
                </Badge>
              )}
              {typeFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs h-5">
                  Type: {typeFilter}
                </Badge>
              )}
              {divisionFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs h-5">
                  Division: {divisionFilter}
                </Badge>
              )}
              {showPastTournaments && (
                <Badge variant="secondary" className="text-xs h-5">
                  Including Past Events
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                  setDivisionFilter('all');
                  setShowPastTournaments(false);
                }}
                className="h-5 text-xs px-2"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-2">
          {currentView === 'calendar' ? (
            <CalendarView 
              tournaments={filteredTournaments}
              onTournamentClick={setSelectedTournament}
            />
          ) : (
            <CardView 
              tournaments={filteredTournaments}
              onTournamentClick={setSelectedTournament}
            />
          )}
        </div>
      </main>

      {/* Tournament Detail Modal */}
      {selectedTournament && (
        <TournamentModal
          tournament={selectedTournament}
          isOpen={!!selectedTournament}
          onClose={() => setSelectedTournament(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default TournamentCalendar;