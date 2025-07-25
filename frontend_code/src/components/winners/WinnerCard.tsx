import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Calendar, TrendingUp, Target } from 'lucide-react';

interface Winner {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  tournament: string;
  division: 'Raider' | 'Crusader' | 'Elevator';
  rank: number;
  prize: string;
  pnl: string;
  pnlValue: number;
  winDate: Date;
  trades: number;
  winRate: number;
}

interface WinnerCardProps {
  winner: Winner;
  onClick?: () => void;
}

export const WinnerCard: React.FC<WinnerCardProps> = ({ winner, onClick }) => {
  const getDivisionColor = (division: string) => {
    switch (division) {
      case 'Raider': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'Crusader': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Elevator': return 'bg-green-500/10 text-green-600 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 2: return <Medal className="h-4 w-4 text-gray-400" />;
      case 3: return <Award className="h-4 w-4 text-amber-600" />;
      default: return <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-xs font-bold">#{rank}</div>;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 border-border/50 hover:border-primary/30"
        onClick={onClick}
      >
        <CardContent className="p-4">
          {/* Header with rank and division */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getRankIcon(winner.rank)}
              <span className="text-sm font-medium">Rank #{winner.rank}</span>
            </div>
            <Badge className={`text-xs border ${getDivisionColor(winner.division)}`}>
              {winner.division}
            </Badge>
          </div>

          {/* Avatar and Name */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-12 w-12 border-2 border-border/50">
              <AvatarImage 
                src={winner.avatar} 
                alt={`${winner.name} profile picture`}
                loading="lazy"
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold">
                {winner.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight truncate">{winner.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{winner.handle}</p>
            </div>
          </div>

          {/* Prize and P&L */}
          <div className="space-y-2 mb-3">
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Prize Won</p>
              <p className="text-sm font-bold text-yellow-600">{winner.prize}</p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">Tournament P&L</p>
                <p className={`text-sm font-bold ${winner.pnlValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {winner.pnl}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Win Rate</p>
                <p className="text-sm font-bold">{winner.winRate}%</p>
              </div>
            </div>
          </div>

          {/* Tournament and Date */}
          <div className="border-t border-border/50 pt-3 space-y-2">
            {/* Top traded stocks ticker */}
            <div className="flex items-center gap-1 text-xs">
              <div className="bg-green-500/10 text-green-600 px-2 py-1 rounded">AAPL +2.1%</div>
              <div className="bg-red-500/10 text-red-600 px-2 py-1 rounded">TSLA -0.8%</div>
              <div className="bg-green-500/10 text-green-600 px-2 py-1 rounded">MSFT +1.3%</div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground truncate">{winner.tournament}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{formatDate(winner.winDate)}</p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{winner.trades} trades</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};