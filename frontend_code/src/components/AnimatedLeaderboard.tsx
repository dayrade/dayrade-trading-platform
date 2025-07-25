import React, { useState, useEffect, useRef } from 'react';
import { memo, useMemo, useCallback } from 'react';
import LeaderboardPill from '@/components/LeaderboardPill';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';

interface Trader {
  id: string;
  name: string;
  pnl: string;
  avatar: string;
}

const mockTraders: Trader[] = [
  { id: '1', name: 'Alex Chen', pnl: '+$12,500', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
  { id: '2', name: 'Sarah Kim', pnl: '-$8,750', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612c4b0?w=100&h=100&fit=crop&crop=face' },
  { id: '3', name: 'Mike Johnson', pnl: '+$15,200', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
  { id: '4', name: 'Emily Davis', pnl: '+$6,890', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
  { id: '5', name: 'Frank Whitaker', pnl: '-$670', avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=100&h=100&fit=crop&crop=face' },
  { id: '6', name: 'Lisa Wang', pnl: '+$9,420', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face' },
  { id: '7', name: 'David Smith', pnl: '+$11,150', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f85?w=100&h=100&fit=crop&crop=face' },
  { id: '8', name: 'Anna Lee', pnl: '-$7,680', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face' },
  { id: '9', name: 'Tom Brown', pnl: '+$13,290', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop&crop=face' },
  { id: '10', name: 'Jessica Martinez', pnl: '+$8,150', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face' },
  { id: '11', name: 'Marcus Johnson', pnl: '+$5,320', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face' }
];

const AnimatedLeaderboard = memo(({ onTraderSelect }: { onTraderSelect?: (trader: Trader) => void }) => {
  const [activeTrader, setActiveTrader] = useState<string>(mockTraders[0].id);
  const [isHovered, setIsHovered] = useState(false);
  const [traders, setTraders] = useState(mockTraders);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { subscribeToLeaderboard } = useRealTimeUpdates();

  const startAutoplay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      if (!isHovered) {
        setActiveTrader(current => {
          const currentIndex = traders.findIndex(t => t.id === current);
          const nextIndex = (currentIndex + 1) % traders.length;
          return traders[nextIndex].id;
        });
      }
    }, 6000);
  }, [traders, isHovered]);

  useEffect(() => {
    startAutoplay();
    
    // Subscribe to real-time leaderboard updates
    const unsubscribe = subscribeToLeaderboard((updates) => {
      setTraders(prevTraders => {
        const updatedTraders = [...prevTraders];
        updates.forEach(update => {
          const index = updatedTraders.findIndex(t => t.id === update.id);
          if (index !== -1) {
            updatedTraders[index] = {
              ...updatedTraders[index],
              pnl: update.pnl
            };
          }
        });
        return updatedTraders;
      });
    });

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isHovered, subscribeToLeaderboard]);

  const handleTraderClick = useCallback((traderId: string) => {
    setActiveTrader(traderId);
    const trader = traders.find(t => t.id === traderId);
    if (trader && onTraderSelect) {
      onTraderSelect(trader);
    }
    startAutoplay();
  }, [startAutoplay]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div className="flex items-center space-x-2 max-w-full">
      <span className="text-sm text-muted-foreground mr-2 hidden sm:block">Leaders</span>
      <div 
        className="flex items-center space-x-2 overflow-x-auto scrollbar-hide"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {traders.slice(0, 10).map((trader) => {
          const isActive = trader.id === activeTrader;
          
          return (
            <LeaderboardPill
              key={trader.id}
              trader={trader}
              isActive={isActive}
              onClick={() => handleTraderClick(trader.id)}
            />
          );
        })}
      </div>
    </div>
  );
});

AnimatedLeaderboard.displayName = 'AnimatedLeaderboard';

export default AnimatedLeaderboard;