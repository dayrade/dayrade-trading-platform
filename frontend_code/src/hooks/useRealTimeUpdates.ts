import { useState, useEffect, useCallback } from 'react';
import { useMemo } from 'react';

interface LeaderboardUpdate {
  id: string;
  name: string;
  pnl: string;
  pnlValue: number;
  rank: number;
}

interface TradingUpdate {
  userId: string;
  pnl: number;
  trades: number;
  winRate: number;
  timestamp: string;
}

export const useRealTimeUpdates = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Simulate WebSocket connection
  useEffect(() => {
    // In a real implementation, this would connect to a WebSocket
    const simulateConnection = () => {
      setIsConnected(true);
      console.log('Connected to real-time updates');
    };

    const timeout = setTimeout(simulateConnection, 1000);
    return () => clearTimeout(timeout);
  }, []);

  const subscribeToLeaderboard = useCallback((callback: (updates: LeaderboardUpdate[]) => void) => {
    if (!isConnected) return;

    const generateMockUpdates = () => [
      {
        id: '1',
        name: 'Alex Chen',
        pnl: `+$${(12500 + Math.random() * 1000).toFixed(0)}`,
        pnlValue: 12500 + Math.random() * 1000,
        rank: 1
      },
      {
        id: '2', 
        name: 'Sarah Kim',
        pnl: `${Math.random() > 0.5 ? '+' : '-'}$${(8750 + Math.random() * 500).toFixed(0)}`,
        pnlValue: 8750 + (Math.random() - 0.5) * 1000,
        rank: 2
      }
    ];

    // Simulate periodic leaderboard updates
    const interval = setInterval(() => {
      callback(generateMockUpdates());
      setLastUpdate(new Date());
    }, 6000); // Update every 6 seconds

    return () => clearInterval(interval);
  }, [isConnected]);

  const subscribeToTradingUpdates = useCallback((userId: string, callback: (update: TradingUpdate) => void) => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      const update: TradingUpdate = {
        userId,
        pnl: Math.random() * 50000,
        trades: Math.floor(Math.random() * 100),
        winRate: Math.random() * 100,
        timestamp: new Date().toISOString()
      };

      callback(update);
      setLastUpdate(new Date());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [isConnected]);

  return {
    isConnected,
    lastUpdate,
    subscribeToLeaderboard,
    subscribeToTradingUpdates
  };
};