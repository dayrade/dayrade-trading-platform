import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Star, TrendingUp, Award, Medal } from 'lucide-react';

interface HallOfFameTrader {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  totalWinnings: number;
  tournamentsWon: number;
  winRate: number;
  bestTournament: string;
  achievements: string[];
}

interface HallOfFameSectionProps {
  traders: HallOfFameTrader[];
}

export const HallOfFameSection: React.FC<HallOfFameSectionProps> = ({ traders }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAchievementIcon = (achievement: string) => {
    if (achievement.includes('Winner') || achievement.includes('Champion')) {
      return <Crown className="h-3 w-3" />;
    }
    if (achievement.includes('Star') || achievement.includes('Rising')) {
      return <Star className="h-3 w-3" />;
    }
    if (achievement.includes('Master') || achievement.includes('Elite')) {
      return <Medal className="h-3 w-3" />;
    }
    return <Award className="h-3 w-3" />;
  };

  const getAchievementColor = (achievement: string) => {
    if (achievement.includes('Winner') || achievement.includes('Champion')) {
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    }
    if (achievement.includes('Star') || achievement.includes('Rising')) {
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
    if (achievement.includes('Master') || achievement.includes('Elite')) {
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    }
    return 'bg-green-500/10 text-green-600 border-green-500/20';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Hall of Fame
          <Badge variant="secondary" className="ml-2">Top Performers</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {traders.map((trader, index) => (
            <motion.div
              key={trader.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <Card className="border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Left Section - Trader Info */}
                    <div className="flex items-center gap-4">
                      {/* Rank Badge */}
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${
                          index === 0 ? 'bg-yellow-500/10 border-yellow-500 text-yellow-600' :
                          index === 1 ? 'bg-gray-400/10 border-gray-400 text-gray-600' :
                          index === 2 ? 'bg-amber-600/10 border-amber-600 text-amber-600' :
                          'bg-muted border-border text-muted-foreground'
                        }`}>
                          #{index + 1}
                        </div>
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1">
                            {index === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                            {index === 1 && <Medal className="h-4 w-4 text-gray-400" />}
                            {index === 2 && <Award className="h-4 w-4 text-amber-600" />}
                          </div>
                        )}
                      </div>

                      {/* Avatar and Name */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-16 w-16 border-2 border-border/50">
                          <AvatarImage src={trader.avatar} alt={trader.name} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold">
                            {trader.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{trader.name}</h3>
                          <p className="text-muted-foreground">{trader.handle}</p>
                          <p className="text-sm text-muted-foreground">Best: {trader.bestTournament}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Stats */}
                    <div className="text-right">
                      <div className="grid grid-cols-3 gap-6 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Winnings</p>
                          <p className="text-xl font-bold text-green-600">
                            {formatCurrency(trader.totalWinnings)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Tournaments Won</p>
                          <p className="text-xl font-bold">{trader.tournamentsWon}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Win Rate</p>
                          <p className="text-xl font-bold flex items-center gap-1">
                            {trader.winRate}%
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          </p>
                        </div>
                      </div>

                      {/* Achievements */}
                      <div className="flex flex-wrap justify-end gap-2">
                        {trader.achievements.map((achievement, achIndex) => (
                          <Badge
                            key={achIndex}
                            className={`text-xs border ${getAchievementColor(achievement)}`}
                          >
                            {getAchievementIcon(achievement)}
                            <span className="ml-1">{achievement}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
          >
            View All Hall of Fame Members
          </motion.button>
        </div>
      </CardContent>
    </Card>
  );
};