import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Sparkles, Calendar, Target, TrendingUp, ExternalLink } from 'lucide-react';

interface RecentWinner {
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

interface WinnersBannerProps {
  recentWinner: RecentWinner;
}

export const WinnersBanner: React.FC<WinnersBannerProps> = ({ recentWinner }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-red-500/5 border-yellow-500/20">
        {/* Celebration Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl" />
          <div className="absolute top-8 -left-8 w-32 h-32 bg-orange-500/10 rounded-full blur-xl" />
          <div className="absolute bottom-4 right-1/3 w-20 h-20 bg-red-500/10 rounded-full blur-xl" />
        </div>

        <CardContent className="relative p-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Winner Info Section */}
            <div className="flex-1 text-center lg:text-left">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center lg:justify-start gap-2 mb-3"
              >
                <div className="relative">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="h-3 w-3 text-yellow-400" />
                  </motion.div>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Latest Tournament Champion
                </h1>
              </motion.div>

              {/* Winner Details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-1">
                    {recentWinner.name}
                  </h2>
                  <p className="text-muted-foreground">{recentWinner.handle}</p>
                </div>

                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                    🏆 1st Place Winner
                  </Badge>
                  <Badge variant="outline">
                    {recentWinner.division} Division
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-500/20">
                    {recentWinner.pnl} P&L
                  </Badge>
                </div>

                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Prize Won</p>
                      <p className="font-bold text-yellow-600">{recentWinner.prize}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Win Rate</p>
                      <p className="font-bold">{recentWinner.winRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Trades</p>
                      <p className="font-bold">{recentWinner.trades}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tournament</p>
                      <p className="font-bold text-xs">{recentWinner.tournament.split(' - ')[0]}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(recentWinner.winDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>{recentWinner.tournament}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Avatar Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="relative"
            >
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-lg opacity-25 scale-110" />
                
                {/* Avatar */}
                <Avatar className="relative h-32 w-32 lg:h-40 lg:w-40 border-4 border-yellow-500/30 shadow-2xl">
                  <AvatarImage 
                    src={recentWinner.avatar} 
                    alt={`${recentWinner.name} - Tournament Champion`}
                    loading="lazy"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-yellow-600 font-bold text-2xl lg:text-3xl">
                    {recentWinner.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                {/* Trophy Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  className="absolute -top-1 -right-1"
                >
                  <Trophy className="h-4 w-4" />
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mt-6"
          >
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Full Performance
            </Button>
            <Button variant="outline" className="border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10">
              <ExternalLink className="h-4 w-4 mr-2" />
              Tournament Details
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};