import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tournament, getStatusColor } from '@/data/tournaments';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Trophy, 
  ExternalLink,
  Info,
  Clock
} from 'lucide-react';

interface CardViewProps {
  tournaments: Tournament[];
  onTournamentClick: (tournament: Tournament) => void;
}

const CardView: React.FC<CardViewProps> = ({
  tournaments,
  onTournamentClick
}) => {
  // Sort tournaments: upcoming first, then by start date
  const sortedTournaments = [...tournaments].sort((a, b) => {
    const now = new Date();
    const aIsUpcoming = a.startDate > now;
    const bIsUpcoming = b.startDate > now;
    
    if (aIsUpcoming && !bIsUpcoming) return -1;
    if (!aIsUpcoming && bIsUpcoming) return 1;
    
    return a.startDate.getTime() - b.startDate.getTime();
  });

  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: start.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    };
    
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-US', options);
    }
    
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const getDaysUntilStart = (startDate: Date) => {
    const now = new Date();
    const diff = startDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getTournamentDuration = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day';
    if (diffDays <= 7) return `${diffDays} days`;
    if (diffDays <= 31) return `${Math.ceil(diffDays / 7)} weeks`;
    return '1 month';
  };

  const getRegistrationProgress = (current: number, max: number) => {
    return (current / max) * 100;
  };

  const handleBuyTickets = (tournament: Tournament, e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real implementation, this would integrate with TicketSource API
    console.log('Buy tickets for:', tournament.name);
    // For now, just show an alert
    alert(`Redirecting to TicketSource for ${tournament.name} - Entry Fee: ${tournament.entryFee}`);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sortedTournaments.map((tournament) => {
        const daysUntilStart = getDaysUntilStart(tournament.startDate);
        const isUpcoming = daysUntilStart > 0;
        const isActive = tournament.status === 'Live Now';
        const registrationProgress = getRegistrationProgress(tournament.currentParticipants, tournament.maxParticipants);

        return (
          <Card 
            key={tournament.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
              isActive ? 'ring-2 ring-primary gentle-pulse' : ''
            }`}
            onClick={() => onTournamentClick(tournament)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight mb-2">
                    {tournament.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant="secondary"
                      style={{ 
                        backgroundColor: getStatusColor(tournament.status) + '20',
                        color: getStatusColor(tournament.status),
                        borderColor: getStatusColor(tournament.status)
                      }}
                    >
                      {tournament.status}
                    </Badge>
                    <Badge variant="outline">
                      {tournament.type}
                    </Badge>
                    <Badge variant="outline">
                      {tournament.division}
                    </Badge>
                  </div>
                </div>
                {isActive && (
                  <div className="w-3 h-3 bg-destructive rounded-full animate-ping" />
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Tournament Details */}
              <div className="space-y-3">
                {/* Date and Duration */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={16} />
                  <span>{formatDateRange(tournament.startDate, tournament.endDate)}</span>
                  <span className="text-xs">({getTournamentDuration(tournament.startDate, tournament.endDate)})</span>
                </div>

                {/* Time Until Start (for upcoming tournaments) */}
                {isUpcoming && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Clock size={16} />
                    <span>
                      {daysUntilStart === 1 ? 'Starts tomorrow' : `Starts in ${daysUntilStart} days`}
                    </span>
                  </div>
                )}

                {/* Prize Pool */}
                <div className="flex items-center gap-2 text-sm">
                  <Trophy size={16} className="text-yellow-500" />
                  <span className="font-medium">{tournament.prizePool}</span>
                </div>

                {/* Entry Fee */}
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign size={16} className="text-green-500" />
                  <span>Entry Fee: <span className="font-medium">{tournament.entryFee}</span></span>
                </div>

                {/* Registration Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>Registration</span>
                    </div>
                    <span className="text-muted-foreground">
                      {tournament.currentParticipants}/{tournament.maxParticipants}
                    </span>
                  </div>
                  <Progress 
                    value={registrationProgress} 
                    className="h-2"
                  />
                  {registrationProgress > 80 && (
                    <div className="text-xs text-yellow-600">
                      Nearly full! Only {tournament.maxParticipants - tournament.currentParticipants} spots left
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {tournament.description}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTournamentClick(tournament);
                  }}
                >
                  <Info size={16} className="mr-2" />
                  Details
                </Button>
                
                {!['Completed', 'Sold Out'].includes(tournament.status) && (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={(e) => handleBuyTickets(tournament, e)}
                    disabled={tournament.status === 'Sold Out'}
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Buy Tickets
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Empty State */}
      {sortedTournaments.length === 0 && (
        <div className="col-span-full text-center py-12">
          <Calendar size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No tournaments found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters to see more tournaments.
          </p>
        </div>
      )}
    </div>
  );
};

export default CardView;