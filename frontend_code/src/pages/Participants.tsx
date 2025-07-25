import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUpDown, Grid2X2, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { mockParticipants } from '@/data/participants';
import type { Participant } from '@/data/participants';

const Participants = () => {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'best' | 'worst'>('best');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort participants by search and sort order
  const filteredAndSortedParticipants = [...mockParticipants]
    .filter(participant => 
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.handle.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => sortOrder === 'best' ? b.pnlValue - a.pnlValue : a.pnlValue - b.pnlValue)
    .map((participant, index) => ({
      ...participant,
      rank: index + 1 // Assign rank based on sorted order
    }));

  const itemsPerPage = 50;
  const totalPages = Math.ceil(filteredAndSortedParticipants.length / itemsPerPage);
  const paginatedParticipants = filteredAndSortedParticipants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCardClick = (participantId: string, participantHandle: string) => {
    const username = participantHandle.replace('@', '');
    console.log(`Navigating to: /dashboard/${username}`, { participantId, handle: participantHandle });
  };

  // Compact horizontal card component for inline layout
  const CompactTraderCard: React.FC<{ participant: Participant }> = ({ participant }) => {
    return (
      <motion.div
        className="bg-card border border-border rounded-xl p-4 shadow-sm cursor-pointer hover:border-primary/50 hover:bg-accent/20 hover:shadow-md transition-all duration-200"
        onClick={() => handleCardClick(participant.id, participant.handle)}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.15 }}
      >
        {/* Flexbox layout: #rank • name • @handle • $P&L */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <span className="text-sm font-bold text-foreground flex-shrink-0">#{participant.rank}</span>
          <span className="text-foreground/40 flex-shrink-0">•</span>
          
          <Avatar className="w-7 h-7 flex-shrink-0 border border-border/50">
            <img 
              src={participant.avatar} 
              alt={participant.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div 
              className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
              style={{ display: 'none' }}
            >
              <span className="text-primary font-semibold text-xs">
                {participant.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </Avatar>
          
          <span className="text-sm font-medium text-foreground truncate flex-shrink-0">{participant.name}</span>
          <span className="text-foreground/40 flex-shrink-0">•</span>
          <span className="text-sm text-muted-foreground truncate flex-shrink-0">{participant.handle}</span>
          <span className="text-foreground/40 flex-shrink-0">•</span>
          
          {/* P&L with contrasting badge for readability */}
          <div className={`text-xs font-bold px-3 py-1.5 rounded-full border flex-shrink-0 ${
            participant.pnlValue >= 0 
              ? 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800' 
              : 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800'
          }`}>
            {participant.pnl}
          </div>
        </div>
      </motion.div>
    );
  };

  // Proper card component for grid layout
  const GridTraderCard: React.FC<{ participant: Participant }> = ({ participant }) => {
    return (
      <motion.div
        className="bg-card border border-border rounded-lg p-3 h-[120px] flex flex-col cursor-pointer hover:border-primary/50 hover:shadow-md hover:shadow-primary/20 transition-all duration-200"
        onClick={() => handleCardClick(participant.id, participant.handle)}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.15 }}
      >
        {/* Top row: Rank and P&L */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-foreground">#{participant.rank}</span>
          <div className={`font-bold text-xs px-2 py-1 rounded ${
            participant.pnlValue >= 0 
              ? 'text-green-600 bg-green-600/10' 
              : 'text-red-600 bg-red-600/10'
          }`}>
            {participant.pnl}
          </div>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-3">
          <Avatar className="w-10 h-10 flex-shrink-0 border border-border/50">
            <img 
              src={participant.avatar} 
              alt={participant.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div 
              className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
              style={{ display: 'none' }}
            >
              <span className="text-primary font-semibold text-xs">
                {participant.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </Avatar>
        </div>

        {/* Name and Handle */}
        <div className="text-center flex-1 flex flex-col justify-end overflow-hidden">
          <h3 className="font-medium text-foreground text-xs leading-tight mb-1 truncate px-1">
            {participant.name}
          </h3>
          <p className="text-muted-foreground text-[10px] leading-tight truncate px-1">
            {participant.handle}
          </p>
        </div>
      </motion.div>
    );
  };

  const renderCards = () => {
    return (
      <div className="grid grid-cols-10 gap-2">
        {paginatedParticipants.map((participant) => (
          <GridTraderCard
            key={participant.id}
            participant={participant}
          />
        ))}
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <DashboardLayout
      sidebarExpanded={sidebarExpanded}
      onSidebarExpandedChange={setSidebarExpanded}
      isAuthenticated={true}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Compact Header Bar */}
        <div className="flex items-center justify-between flex-shrink-0 bg-background/95 backdrop-blur-md border-b border-border p-2">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name or handle..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="pl-10 w-64 h-8"
                aria-label="Search participants"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredAndSortedParticipants.length} traders competing • Top performers highlighted
            </p>
          </div>

          <div className="flex items-center space-x-1">
            {/* Sort Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'best' ? 'worst' : 'best')}
              className="flex items-center space-x-1 h-8 text-xs"
              aria-label={`Sort ${sortOrder === 'best' ? 'worst to best' : 'best to worst'}`}
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline">{sortOrder === 'best' ? 'Best → Worst' : 'Worst → Best'}</span>
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-border rounded-lg h-8" role="group" aria-label="View mode">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none border-0 h-6 px-2"
                aria-label="Grid view"
              >
                <Grid2X2 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none border-0 h-6 px-2"
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === 'grid' ? renderCards() : (
              <div className="space-y-1">
                {paginatedParticipants.map((participant) => (
                  <CompactTraderCard
                    key={participant.id}
                    participant={participant}
                  />
                ))}
              </div>
            )}
            
            {renderPagination()}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Participants;