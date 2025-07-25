import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Trophy, Medal, Crown, Star, Search, Filter, TrendingUp, Award } from 'lucide-react';
import { WinnerCard } from '@/components/winners/WinnerCard';
import { WinnersBanner } from '@/components/winners/WinnersBanner';
import { HallOfFameSection } from '@/components/winners/HallOfFameSection';
import { motion } from 'framer-motion';

// Mock data for winners
const recentWinners = [
  {
    id: '1',
    name: 'Alex Rodriguez',
    handle: '@alex_trades',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    tournament: 'Raider Tournament - December 2024',
    division: 'Raider' as const,
    rank: 1,
    prize: '$50,000 + $250K Account',
    pnl: '+$47,250',
    pnlValue: 47250,
    winDate: new Date('2024-12-13'),
    trades: 247,
    winRate: 78.5
  },
  {
    id: '2',
    name: 'Sarah Chen',
    handle: '@sarahc_trading',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    tournament: 'Crusader Tournament - December 2024',
    division: 'Crusader' as const,
    rank: 1,
    prize: '$2,500 Cash',
    pnl: '+$15,420',
    pnlValue: 15420,
    winDate: new Date('2024-12-20'),
    trades: 89,
    winRate: 85.2
  },
  {
    id: '3',
    name: 'Michael Thompson',
    handle: '@miket_pro',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    tournament: 'Raider Tournament - November 2024',
    division: 'Raider' as const,
    rank: 2,
    prize: '$10,000 + $50K Account',
    pnl: '+$38,900',
    pnlValue: 38900,
    winDate: new Date('2024-11-15'),
    trades: 198,
    winRate: 72.1
  },
  {
    id: '4',
    name: 'Emma Wilson',
    handle: '@emma_wins',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    tournament: 'Crusader Tournament - November 2024',
    division: 'Crusader' as const,
    rank: 1,
    prize: '$2,500 Cash',
    pnl: '+$18,750',
    pnlValue: 18750,
    winDate: new Date('2024-11-22'),
    trades: 156,
    winRate: 81.4
  }
];

const hallOfFameTraders = [
  {
    id: '1',
    name: 'Alex Rodriguez',
    handle: '@alex_trades',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    totalWinnings: 127500,
    tournamentsWon: 3,
    winRate: 76.8,
    bestTournament: 'Raider Dec 2024',
    achievements: ['Triple Winner', 'Raider Champion', 'Consistency King']
  },
  {
    id: '2',
    name: 'Sarah Chen',
    handle: '@sarahc_trading',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    totalWinnings: 89200,
    tournamentsWon: 5,
    winRate: 83.2,
    bestTournament: 'Crusader Dec 2024',
    achievements: ['Five-Time Winner', 'Precision Trader', 'Rising Star']
  },
  {
    id: '3',
    name: 'David Kim',
    handle: '@dkim_trader',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    totalWinnings: 156800,
    tournamentsWon: 2,
    winRate: 79.5,
    bestTournament: 'Raider Oct 2024',
    achievements: ['Big Winner', 'Strategic Master', 'Elite Trader']
  }
];

const Winners: React.FC = () => {
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const filteredWinners = recentWinners.filter(winner => {
    const matchesDivision = selectedDivision === 'all' || winner.division.toLowerCase() === selectedDivision;
    const matchesSearch = winner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         winner.handle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDivision && matchesSearch;
  });

  return (
    <DashboardLayout 
      sidebarExpanded={sidebarExpanded}
      onSidebarExpandedChange={setSidebarExpanded}
      isAuthenticated={true}
    >
      <main className="space-y-8">
        <div className="sr-only">
          <h1>Tournament Winners and Champions</h1>
          <p>Celebrate tournament champions and view historical results</p>
        </div>
        {/* Winners Banner */}
        <div className="mb-4">
          <WinnersBanner recentWinner={recentWinners[0]} />
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Tournament Winners
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search winners..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-48 h-7 text-xs"
                  />
                </div>
                <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                  <SelectTrigger className="w-32 h-7 text-xs">
                    <SelectValue placeholder="Division" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Divisions</SelectItem>
                    <SelectItem value="raider">Raider</SelectItem>
                    <SelectItem value="crusader">Crusader</SelectItem>
                    <SelectItem value="elevator">Elevator</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32 h-7 text-xs">
                    <SelectValue placeholder="Time Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredWinners.map((winner, index) => (
                <motion.div
                  key={winner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <WinnerCard winner={winner} />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center">
                <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-muted-foreground">Total Prizes Awarded</p>
                  <p className="text-xl font-bold">$2.1M</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +15% this quarter
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center">
                <div className="p-1.5 bg-blue-500/10 rounded-lg">
                  <Award className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-muted-foreground">Tournaments Completed</p>
                  <p className="text-xl font-bold">247</p>
                  <p className="text-xs text-muted-foreground">Since launch</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center">
                <div className="p-1.5 bg-purple-500/10 rounded-lg">
                  <Star className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-muted-foreground">Active Winners</p>
                  <p className="text-xl font-bold">1,847</p>
                  <p className="text-xs text-muted-foreground">Unique winners</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hall of Fame */}
        <HallOfFameSection traders={hallOfFameTraders} />

        {/* Division Champions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Current Division Champions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 border border-border rounded-lg bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
                <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                <Badge variant="secondary" className="mb-2">Raider Champion</Badge>
                <h3 className="font-bold text-lg">Alex Rodriguez</h3>
                <p className="text-sm text-muted-foreground">$127,500 Total Winnings</p>
              </div>
              <div className="text-center p-6 border border-border rounded-lg bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                <Medal className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <Badge variant="secondary" className="mb-2">Crusader Champion</Badge>
                <h3 className="font-bold text-lg">Sarah Chen</h3>
                <p className="text-sm text-muted-foreground">$89,200 Total Winnings</p>
              </div>
              <div className="text-center p-6 border border-border rounded-lg bg-gradient-to-br from-green-500/5 to-emerald-500/5">
                <Star className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <Badge variant="secondary" className="mb-2">Elevator Champion</Badge>
                <h3 className="font-bold text-lg">Marcus Johnson</h3>
                <p className="text-sm text-muted-foreground">Top Elevator Performer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  );
};

export default Winners;