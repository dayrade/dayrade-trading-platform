import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tournament, getStatusColor } from '@/data/tournaments';
import {
  Calendar,
  DollarSign,
  Users,
  Trophy,
  Clock,
  ExternalLink,
  Shield,
  Target,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

interface TournamentModalProps {
  tournament: Tournament;
  isOpen: boolean;
  onClose: () => void;
}

const TournamentModal: React.FC<TournamentModalProps> = ({
  tournament,
  isOpen,
  onClose
}) => {
  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const handleBuyTickets = () => {
    // In a real implementation, this would integrate with TicketSource API
    console.log('Buy tickets for:', tournament.name);
    alert(`Redirecting to TicketSource for ${tournament.name} - Entry Fee: ${tournament.entryFee}`);
  };

  const daysUntilStart = getDaysUntilStart(tournament.startDate);
  const isUpcoming = daysUntilStart > 0;
  const isActive = tournament.status === 'Live Now';
  const registrationProgress = getRegistrationProgress(tournament.currentParticipants, tournament.maxParticipants);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-3">
                {tournament.name}
              </DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge 
                  variant="secondary"
                  style={{ 
                    backgroundColor: getStatusColor(tournament.status) + '20',
                    color: getStatusColor(tournament.status),
                    borderColor: getStatusColor(tournament.status)
                  }}
                  className="text-sm px-3 py-1"
                >
                  {tournament.status}
                </Badge>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {tournament.type}
                </Badge>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {tournament.division} Division
                </Badge>
              </div>
            </div>
            {isActive && (
              <div className="flex items-center gap-2 text-destructive">
                <div className="w-3 h-3 bg-destructive rounded-full animate-ping" />
                <span className="text-sm font-medium">Live Now</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">About This Tournament</h3>
              <p className="text-muted-foreground leading-relaxed">
                {tournament.description}
              </p>
            </div>

            {/* Tournament Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date and Duration */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar size={16} />
                  <span>Schedule</span>
                </div>
                <div className="text-sm text-muted-foreground pl-6">
                  <div>{formatDateRange(tournament.startDate, tournament.endDate)}</div>
                  <div className="text-xs mt-1">
                    Duration: {getTournamentDuration(tournament.startDate, tournament.endDate)}
                  </div>
                </div>
              </div>

              {/* Time Until Start */}
              {isUpcoming && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock size={16} />
                    <span>Countdown</span>
                  </div>
                  <div className="text-sm text-primary pl-6">
                    {daysUntilStart === 1 ? 'Starts tomorrow' : `Starts in ${daysUntilStart} days`}
                  </div>
                </div>
              )}

              {/* Prize Pool */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Trophy size={16} className="text-yellow-500" />
                  <span>Prize Pool</span>
                </div>
                <div className="text-sm font-medium text-yellow-600 pl-6">
                  {tournament.prizePool}
                </div>
              </div>

              {/* Entry Fee */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign size={16} className="text-green-500" />
                  <span>Entry Fee</span>
                </div>
                <div className="text-sm font-medium text-green-600 pl-6">
                  {tournament.entryFee}
                </div>
              </div>
            </div>

            <Separator />

            {/* Rules and Requirements */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Shield size={20} />
                Tournament Rules
              </h3>
              <ul className="space-y-2">
                {tournament.rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tournament Features */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp size={20} />
                What to Expect
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Target size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Live Commentary</div>
                    <div className="text-muted-foreground">AI-powered market analysis during the event</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Real-time Leaderboard</div>
                    <div className="text-muted-foreground">Track your position throughout the tournament</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Community Chat</div>
                    <div className="text-muted-foreground">Connect with other traders during the event</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Trophy size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Instant Results</div>
                    <div className="text-muted-foreground">Winners announced immediately after closing</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Status */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Registration Status</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Participants</span>
                  <span className="font-medium">
                    {tournament.currentParticipants}/{tournament.maxParticipants}
                  </span>
                </div>
                <Progress value={registrationProgress} className="h-2" />
                {registrationProgress > 80 && (
                  <div className="text-xs text-yellow-600">
                    Nearly full! Only {tournament.maxParticipants - tournament.currentParticipants} spots remaining
                  </div>
                )}
              </div>

              {/* Action Button */}
              {!['Completed', 'Sold Out'].includes(tournament.status) && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBuyTickets}
                  disabled={tournament.status === 'Sold Out'}
                >
                  <ExternalLink size={18} className="mr-2" />
                  Buy Tickets - {tournament.entryFee}
                </Button>
              )}

              {tournament.status === 'Sold Out' && (
                <Button className="w-full" variant="outline" disabled>
                  Sold Out
                </Button>
              )}

              {tournament.status === 'Completed' && (
                <Button className="w-full" variant="outline" disabled>
                  Tournament Completed
                </Button>
              )}
            </div>

            {/* Quick Facts */}
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold">Quick Facts</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Division:</span>
                  <span className="font-medium">{tournament.division}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{tournament.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{getTournamentDuration(tournament.startDate, tournament.endDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Participants:</span>
                  <span className="font-medium">{tournament.maxParticipants}</span>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold">Need Help?</h3>
              <p className="text-sm text-muted-foreground">
                Have questions about this tournament? Contact our support team.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TournamentModal;